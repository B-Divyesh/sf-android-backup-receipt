package in.sociobot.androidbackupreceipt;

import android.content.ContentResolver;
import android.content.Intent;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import androidx.activity.result.ActivityResult;
import androidx.documentfile.provider.DocumentFile;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Native SAF bridge. Android grants only the selected document tree; no broad storage
 * permission is requested. The granted URI is persisted so a provider can survive a
 * process restart, while this app stores only the generated inventory in its web layer.
 */
@CapacitorPlugin(name = "SafInventory")
public class SafInventoryPlugin extends Plugin {
    private static final long FULL_HASH_LIMIT = 32L * 1024L * 1024L;
    private static final int SAMPLE_SIZE = 1024 * 1024;
    private final AtomicBoolean cancelled = new AtomicBoolean(false);

    @PluginMethod
    public void chooseTree(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        intent.addFlags(Intent.FLAG_GRANT_PREFIX_URI_PERMISSION);
        startActivityForResult(call, intent, "treePicked");
    }

    @PluginMethod
    public void cancelScan(PluginCall call) {
        cancelled.set(true);
        call.resolve();
    }

    @ActivityCallback
    private void treePicked(PluginCall call, ActivityResult result) {
        if (call == null) return;
        Intent data = result.getData();
        if (result.getResultCode() != android.app.Activity.RESULT_OK || data == null || data.getData() == null) {
            call.reject("Folder selection was cancelled. Choose a folder when ready.");
            return;
        }
        Uri treeUri = data.getData();
        int takeFlags = data.getFlags() & Intent.FLAG_GRANT_READ_URI_PERMISSION;
        try {
            getContext().getContentResolver().takePersistableUriPermission(treeUri, takeFlags);
        } catch (SecurityException ignored) {
            // Some document providers expose a transient read grant only. The scan can still run now.
        }
        String kind = call.getData().optString("kind", "source");
        cancelled.set(false);
        execute(() -> scanTree(call, treeUri, kind));
    }

    private void scanTree(PluginCall call, Uri treeUri, String kind) {
        try {
            DocumentFile root = DocumentFile.fromTreeUri(getContext(), treeUri);
            if (root == null || !root.canRead()) throw new IOException("Android could not read that selected folder.");
            List<Entry> entries = new ArrayList<>();
            collectFiles(root, "", entries);
            if (entries.isEmpty()) throw new IOException("That folder contained no readable files. Choose another folder.");
            Collections.sort(entries, Comparator.comparing(entry -> entry.path));
            JSArray files = new JSArray();
            for (int index = 0; index < entries.size(); index += 1) {
                checkCancelled();
                Entry entry = entries.get(index);
                emitProgress(kind, index, entries.size(), entry.path);
                HashResult hash = hashFile(entry.file);
                JSObject file = new JSObject();
                file.put("path", entry.path);
                file.put("size", entry.file.length());
                file.put("modified", entry.file.lastModified());
                file.put("hash", hash.value);
                file.put("hashMethod", hash.method);
                files.put(file);
                emitProgress(kind, index + 1, entries.size(), entry.path);
            }
            JSObject inventory = new JSObject();
            inventory.put("schema", "backup-receipt/1");
            inventory.put("label", root.getName() == null ? "Selected folder" : root.getName());
            inventory.put("createdAt", Instant.now().toString());
            inventory.put("files", files);
            call.resolve(inventory);
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            call.reject("Scan cancelled. Choose the folder again when ready.");
        } catch (Exception error) {
            call.reject(error.getMessage() == null ? "Could not read this folder. Choose another folder." : error.getMessage(), error);
        }
    }

    private void collectFiles(DocumentFile directory, String prefix, List<Entry> entries) throws InterruptedException {
        checkCancelled();
        DocumentFile[] children = directory.listFiles();
        for (DocumentFile child : children) {
            checkCancelled();
            String name = child.getName();
            if (name == null || name.isEmpty()) continue;
            String path = prefix.isEmpty() ? name : prefix + "/" + name;
            if (child.isDirectory()) collectFiles(child, path, entries);
            else if (child.isFile() && child.canRead()) entries.add(new Entry(child, path));
        }
    }

    private HashResult hashFile(DocumentFile file) throws Exception {
        if (file.length() <= FULL_HASH_LIMIT) return new HashResult(digestRange(file.getUri(), 0, file.length(), false), "sha256");
        long size = file.length();
        long middleStart = Math.max(SAMPLE_SIZE, (size / 2L) - (SAMPLE_SIZE / 2L));
        long endStart = Math.max(middleStart + SAMPLE_SIZE, size - SAMPLE_SIZE);
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        updateRange(digest, file.getUri(), 0, SAMPLE_SIZE);
        updateRange(digest, file.getUri(), middleStart, SAMPLE_SIZE);
        updateRange(digest, file.getUri(), endStart, size - endStart);
        digest.update(String.valueOf(size).getBytes(StandardCharsets.UTF_8));
        return new HashResult(hex(digest.digest()), "sampled-sha256");
    }

    private String digestRange(Uri uri, long start, long count, boolean sampled) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        updateRange(digest, uri, start, count);
        return hex(digest.digest());
    }

    private void updateRange(MessageDigest digest, Uri uri, long start, long count) throws Exception {
        ContentResolver resolver = getContext().getContentResolver();
        try (ParcelFileDescriptor descriptor = resolver.openFileDescriptor(uri, "r")) {
            if (descriptor == null) throw new IOException("Android could not open a selected file.");
            try (FileInputStream stream = new FileInputStream(descriptor.getFileDescriptor()); FileChannel channel = stream.getChannel()) {
                channel.position(start);
                ByteBuffer buffer = ByteBuffer.allocate(64 * 1024);
                long remaining = count;
                while (remaining > 0) {
                    checkCancelled();
                    buffer.clear();
                    buffer.limit((int) Math.min(buffer.capacity(), remaining));
                    int read = channel.read(buffer);
                    if (read < 0) break;
                    if (read == 0) continue;
                    digest.update(buffer.array(), 0, read);
                    remaining -= read;
                }
                if (remaining != 0) throw new IOException("A selected file changed while it was being read.");
            }
        }
    }

    private void emitProgress(String kind, int current, int total, String path) {
        JSObject progress = new JSObject();
        progress.put("kind", kind);
        progress.put("current", current);
        progress.put("total", total);
        progress.put("path", path);
        notifyListeners("scanProgress", progress);
    }

    private void checkCancelled() throws InterruptedException {
        if (cancelled.get()) throw new InterruptedException("cancelled");
    }

    private static String hex(byte[] bytes) {
        StringBuilder value = new StringBuilder(bytes.length * 2);
        for (byte item : bytes) value.append(String.format("%02x", item));
        return value.toString();
    }

    private static class Entry {
        final DocumentFile file;
        final String path;
        Entry(DocumentFile file, String path) { this.file = file; this.path = path; }
    }

    private static class HashResult {
        final String value;
        final String method;
        HashResult(String value, String method) { this.value = value; this.method = method; }
    }
}
