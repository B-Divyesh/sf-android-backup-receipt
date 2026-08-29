package in.sociobot.androidbackupreceipt;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import android.content.Context;
import android.net.Uri;
import android.provider.DocumentsContract;
import androidx.documentfile.provider.DocumentFile;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import java.io.InputStream;
import org.junit.Test;
import org.junit.runner.RunWith;

/** Exercises a remote DocumentsProvider through the same DocumentFile API as SafInventoryPlugin. */
@RunWith(AndroidJUnit4.class)
public final class RemoteProviderFixtureTest {
    @Test
    public void fixtureDocumentsProviderExposesAReadOnlyBackupTree() throws Exception {
        Context context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        Uri treeUri = DocumentsContract.buildTreeDocumentUri(RemoteBackupDocumentsProvider.AUTHORITY, RemoteBackupDocumentsProvider.ROOT_ID);
        DocumentFile root = DocumentFile.fromTreeUri(context, treeUri);
        assertNotNull(root);
        assertTrue(root.canRead());
        assertFalse(root.canWrite());

        DocumentFile[] files = root.listFiles();
        assertEquals(1, files.length);
        assertEquals("remote-photo.jpg", files[0].getName());
        assertTrue(files[0].canRead());
        assertFalse(files[0].canWrite());
        try (InputStream stream = context.getContentResolver().openInputStream(files[0].getUri())) {
            assertNotNull(stream);
            byte[] data = new byte[64];
            int count = stream.read(data);
            assertEquals("remote-backup-fixture", new String(data, 0, count));
        }
    }
}
