package in.sociobot.androidbackupreceipt;

import android.database.Cursor;
import android.database.MatrixCursor;
import android.os.ParcelFileDescriptor;
import android.provider.DocumentsContract;
import android.provider.DocumentsProvider;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

/** A read-only WebDAV-like tree used by the Android SAF instrumentation test. */
public final class RemoteBackupDocumentsProvider extends DocumentsProvider {
    static final String AUTHORITY = "in.sociobot.androidbackupreceipt.remote-fixture";
    static final String ROOT_ID = "remote-root";
    static final String FILE_ID = "remote-root/Camera/remote-photo.jpg";
    private File payload;

    @Override
    public boolean onCreate() {
        payload = new File(getContext().getCacheDir(), "remote-backup-fixture.jpg");
        try (FileOutputStream output = new FileOutputStream(payload, false)) {
            output.write("remote-backup-fixture".getBytes());
        } catch (IOException error) {
            throw new IllegalStateException("Could not create the remote-provider fixture", error);
        }
        return true;
    }

    @Override
    public Cursor queryRoots(String[] projection) {
        MatrixCursor cursor = new MatrixCursor(projection == null ? new String[] {
            DocumentsContract.Root.COLUMN_ROOT_ID,
            DocumentsContract.Root.COLUMN_DOCUMENT_ID,
            DocumentsContract.Root.COLUMN_TITLE,
            DocumentsContract.Root.COLUMN_FLAGS,
            DocumentsContract.Root.COLUMN_MIME_TYPES
        } : projection);
        cursor.newRow()
            .add(DocumentsContract.Root.COLUMN_ROOT_ID, ROOT_ID)
            .add(DocumentsContract.Root.COLUMN_DOCUMENT_ID, ROOT_ID)
            .add(DocumentsContract.Root.COLUMN_TITLE, "WebDAV backup fixture")
            .add(DocumentsContract.Root.COLUMN_FLAGS, 0)
            .add(DocumentsContract.Root.COLUMN_MIME_TYPES, "image/jpeg");
        return cursor;
    }

    @Override
    public Cursor queryDocument(String documentId, String[] projection) throws FileNotFoundException {
        MatrixCursor cursor = new MatrixCursor(projection == null ? new String[] {
            DocumentsContract.Document.COLUMN_DOCUMENT_ID,
            DocumentsContract.Document.COLUMN_DISPLAY_NAME,
            DocumentsContract.Document.COLUMN_MIME_TYPE,
            DocumentsContract.Document.COLUMN_FLAGS,
            DocumentsContract.Document.COLUMN_SIZE,
            DocumentsContract.Document.COLUMN_LAST_MODIFIED
        } : projection);
        addDocument(cursor, documentId);
        return cursor;
    }

    @Override
    public Cursor queryChildDocuments(String parentDocumentId, String[] projection, String sortOrder) throws FileNotFoundException {
        if (!ROOT_ID.equals(parentDocumentId)) throw new FileNotFoundException(parentDocumentId);
        MatrixCursor cursor = new MatrixCursor(projection == null ? new String[] {
            DocumentsContract.Document.COLUMN_DOCUMENT_ID,
            DocumentsContract.Document.COLUMN_DISPLAY_NAME,
            DocumentsContract.Document.COLUMN_MIME_TYPE,
            DocumentsContract.Document.COLUMN_FLAGS,
            DocumentsContract.Document.COLUMN_SIZE,
            DocumentsContract.Document.COLUMN_LAST_MODIFIED
        } : projection);
        addDocument(cursor, FILE_ID);
        return cursor;
    }

    @Override
    public String getDocumentType(String documentId) throws FileNotFoundException {
        if (ROOT_ID.equals(documentId)) return DocumentsContract.Document.MIME_TYPE_DIR;
        if (FILE_ID.equals(documentId)) return "image/jpeg";
        throw new FileNotFoundException(documentId);
    }

    @Override
    public ParcelFileDescriptor openDocument(String documentId, String mode, android.os.CancellationSignal signal) throws FileNotFoundException {
        if (!FILE_ID.equals(documentId) || mode.contains("w")) throw new FileNotFoundException(documentId);
        return ParcelFileDescriptor.open(payload, ParcelFileDescriptor.MODE_READ_ONLY);
    }

    private void addDocument(MatrixCursor cursor, String documentId) throws FileNotFoundException {
        if (ROOT_ID.equals(documentId)) {
            cursor.newRow()
                .add(DocumentsContract.Document.COLUMN_DOCUMENT_ID, ROOT_ID)
                .add(DocumentsContract.Document.COLUMN_DISPLAY_NAME, "Remote backup")
                .add(DocumentsContract.Document.COLUMN_MIME_TYPE, DocumentsContract.Document.MIME_TYPE_DIR)
                .add(DocumentsContract.Document.COLUMN_FLAGS, 0)
                .add(DocumentsContract.Document.COLUMN_SIZE, 0)
                .add(DocumentsContract.Document.COLUMN_LAST_MODIFIED, 1);
            return;
        }
        if (FILE_ID.equals(documentId)) {
            cursor.newRow()
                .add(DocumentsContract.Document.COLUMN_DOCUMENT_ID, FILE_ID)
                .add(DocumentsContract.Document.COLUMN_DISPLAY_NAME, "remote-photo.jpg")
                .add(DocumentsContract.Document.COLUMN_MIME_TYPE, "image/jpeg")
                .add(DocumentsContract.Document.COLUMN_FLAGS, 0)
                .add(DocumentsContract.Document.COLUMN_SIZE, payload.length())
                .add(DocumentsContract.Document.COLUMN_LAST_MODIFIED, payload.lastModified());
            return;
        }
        throw new FileNotFoundException(documentId);
    }
}
