import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const pluginPath = new URL('../android/app/src/main/java/in/sociobot/androidbackupreceipt/SafInventoryPlugin.java', import.meta.url);
const activityPath = new URL('../android/app/src/main/java/in/sociobot/androidbackupreceipt/MainActivity.java', import.meta.url);
const configPath = new URL('../public/staticwebapp.config.json', import.meta.url);
const gradlePath = new URL('../android/app/build.gradle', import.meta.url);
const workflowPath = new URL('../.github/workflows/android.yml', import.meta.url);
const indexPath = new URL('../index.html', import.meta.url);

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

  it('@claim:android-release-assets publishes verified signed APK and AAB release evidence', async () => {
    const workflow = await readFile(workflowPath, 'utf8');
    expect(workflow).toContain("java-version: '21'");
    expect(workflow).toContain('./gradlew assembleRelease bundleRelease');
    expect(workflow).toContain('cp app/build/outputs/apk/release/app-release.apk ../release/android-backup-receipt.apk');
    expect(workflow).toContain('cp app/build/outputs/bundle/release/app-release.aab ../release/android-backup-receipt.aab');
    expect(workflow).toContain('> ../release/SIGNING_CERT_SHA256.txt');
    expect(workflow).toContain('sha256sum android-backup-receipt.apk android-backup-receipt.aab > SHA256SUMS');
    expect(workflow).toContain('gh release create "$RELEASE_TAG" --latest');
    expect(workflow).toContain('android-v1.0.3-build-${GITHUB_RUN_NUMBER}');

    const repository = 'B-Divyesh/sf-android-backup-receipt';
    const releaseResponse = await fetch(`https://api.github.com/repos/${repository}/releases/latest`);
    expect(releaseResponse.ok).toBe(true);
    const release = await releaseResponse.json() as {
      tag_name: string;
      assets: Array<{ name: string; browser_download_url: string }>;
    };
    expect(release.tag_name).toMatch(/^android-v1\.0\.3-build-\d+$/);
    const assets = new Map(release.assets.map((asset) => [asset.name, asset.browser_download_url]));
    expect([...assets.keys()].sort()).toEqual([
      'SHA256SUMS',
      'SIGNING_CERT_SHA256.txt',
      'android-backup-receipt.aab',
      'android-backup-receipt.apk'
    ]);

    const publicChecksums = await fetch(`https://github.com/${repository}/releases/latest/download/SHA256SUMS`);
    expect(publicChecksums.ok).toBe(true);
    const checksums = new Map(
      (await publicChecksums.text()).trim().split('\n').map((line) => {
        const match = line.match(/^([a-f0-9]{64})\s+\*?(.+)$/i);
        expect(match).not.toBeNull();
        return [match![2], match![1].toLowerCase()] as const;
      })
    );
    for (const name of ['android-backup-receipt.apk', 'android-backup-receipt.aab']) {
      const response = await fetch(assets.get(name)!);
      expect(response.ok, `${name} must download from the immutable release tag`).toBe(true);
      const bytes = new Uint8Array(await response.arrayBuffer());
      expect(bytes.subarray(0, 2)).toEqual(new Uint8Array([0x50, 0x4b]));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(checksums.get(name));
    }
    const certificate = await fetch(assets.get('SIGNING_CERT_SHA256.txt')!);
    expect(certificate.ok).toBe(true);
    expect((await certificate.text()).trim()).toMatch(/^SHA-256:\s*(?:[A-F0-9]{2}:){31}[A-F0-9]{2}$/i);
  }, 60_000);

  it('@claim:remote-provider-access opens an installed document provider as the read-only backup-folder path', async () => {
    const [page, webBridge, plugin, readme] = await Promise.all([
      readFile(indexPath, 'utf8'),
      readFile(new URL('../src/main.ts', import.meta.url), 'utf8'),
      readFile(pluginPath, 'utf8'),
      readFile(new URL('../README.md', import.meta.url), 'utf8')
    ]);
    expect(page).toContain('id="remote-provider-picker"');
    expect(page).toContain('Choose remote backup provider');
    expect(page).toContain('Install a WebDAV or S3 document provider');
    expect(page).toContain('Import backup record');
    expect(webBridge).toContain("scanSafTree('destination', true)");
    expect(webBridge).toContain("chooseSafTree(kind)");
    expect(plugin).toContain('Intent.ACTION_OPEN_DOCUMENT_TREE');
    expect(plugin).toContain('Intent.FLAG_GRANT_READ_URI_PERMISSION');
    expect(plugin).not.toContain('FLAG_GRANT_WRITE_URI_PERMISSION');
    expect(plugin).toContain('DocumentFile.fromTreeUri');
    expect(readme).toContain('Download its backup folder record');
    expect(readme).toContain('then import it');
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
