import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const pluginPath = new URL('../android/app/src/main/java/in/sociobot/androidbackupreceipt/SafInventoryPlugin.java', import.meta.url);
const activityPath = new URL('../android/app/src/main/java/in/sociobot/androidbackupreceipt/MainActivity.java', import.meta.url);
const configPath = new URL('../public/staticwebapp.config.json', import.meta.url);
const gradlePath = new URL('../android/app/build.gradle', import.meta.url);
const workflowPath = new URL('../.github/workflows/android.yml', import.meta.url);

describe('Android SAF delivery contract', () => {
  it('@claim:saf-read-only uses persistent selected-tree read access without broad or write permissions', async () => {
    const [plugin, manifest] = await Promise.all([
      readFile(pluginPath, 'utf8'),
      readFile(new URL('../android/app/src/main/AndroidManifest.xml', import.meta.url), 'utf8')
    ]);
    expect(plugin).toContain('Intent.ACTION_OPEN_DOCUMENT_TREE');
    expect(plugin).toContain('takePersistableUriPermission');
    expect(plugin).not.toContain('FLAG_GRANT_WRITE_URI_PERMISSION');
    expect(plugin).toContain('DocumentFile.fromTreeUri');
    expect(plugin).toContain('FULL_HASH_LIMIT = 32L * 1024L * 1024L');
    expect(plugin).toContain('"sampled-sha256"');
    expect(manifest).not.toMatch(/READ_MEDIA|READ_EXTERNAL_STORAGE|MANAGE_EXTERNAL_STORAGE/);
  });

  it('@claim:android-private-backup excludes private inventory state from Android backup and transfer', async () => {
    const [manifest, legacyRules, extractionRules] = await Promise.all([
      readFile(new URL('../android/app/src/main/AndroidManifest.xml', import.meta.url), 'utf8'),
      readFile(new URL('../android/app/src/main/res/xml/backup_rules.xml', import.meta.url), 'utf8'),
      readFile(new URL('../android/app/src/main/res/xml/data_extraction_rules.xml', import.meta.url), 'utf8')
    ]);
    expect(manifest).toContain('android:allowBackup="false"');
    expect(manifest).toContain('android:fullBackupContent="@xml/backup_rules"');
    expect(manifest).toContain('android:dataExtractionRules="@xml/data_extraction_rules"');
    expect(legacyRules).toContain('<exclude domain="database" path="." />');
    expect(extractionRules).toContain('<device-transfer>');
    expect(extractionRules).toContain('<exclude domain="sharedpref" path="." />');
  });

  it('registers the bridge and returns progress/cancellation to the same web workflow', async () => {
    const [plugin, activity] = await Promise.all([readFile(pluginPath, 'utf8'), readFile(activityPath, 'utf8')]);
    expect(activity).toContain('registerPlugin(SafInventoryPlugin.class)');
    expect(plugin).toContain('@PluginMethod\n    public void cancelScan');
    expect(plugin).toContain('notifyListeners("scanProgress", progress)');
  });
});

describe('Android update contract', () => {
  it('@claim:android-updates uses protected stable signing secrets, increasing version codes, and immutable releases', async () => {
    const [workflow, gradle] = await Promise.all([readFile(workflowPath, 'utf8'), readFile(gradlePath, 'utf8')]);
    expect(workflow).toContain('secrets.ANDROID_RELEASE_KEYSTORE_BASE64');
    expect(workflow).toContain('secrets.ANDROID_RELEASE_STORE_PASSWORD');
    expect(workflow).not.toContain('keytool -genkeypair');
    expect(workflow).toContain('100000 + GITHUB_RUN_NUMBER');
    expect(workflow).toContain('android-v1.0.3-build-${GITHUB_RUN_NUMBER}');
    expect(workflow).not.toContain('gh release upload');
    expect(gradle).toContain('System.getenv("ANDROID_VERSION_CODE")');
    expect(gradle).toContain('"4"');
  });
});

describe('static deployment response policy', () => {
  it('ships CSP, clickjacking protection, manifest MIME, and immutable fingerprinted assets', async () => {
    const config = JSON.parse(await readFile(configPath, 'utf8')) as { globalHeaders: Record<string, string>; mimeTypes: Record<string, string>; routes: Array<{ route: string; headers?: Record<string, string> }> };
    expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
    expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(config.routes.find((route) => route.route === '/assets/*')?.headers?.['Cache-Control']).toContain('immutable');
  });

  it('keeps /demo as the only app rewrite and serves a designed 404 for unknown routes', async () => {
    const [config, notFound] = await Promise.all([
      readFile(configPath, 'utf8').then((value) => JSON.parse(value) as { responseOverrides: Record<string, { rewrite: string }>; routes: Array<{ route: string; rewrite?: string }> }),
      readFile(new URL('../public/404.html', import.meta.url), 'utf8')
    ]);
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
    expect(config.routes.find((route) => route.route === '/demo')).toMatchObject({ rewrite: '/index.html' });
    expect(notFound).toContain('<h1>That page is not here.</h1>');
  });
});
