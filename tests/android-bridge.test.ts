import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const pluginPath = new URL('../android/app/src/main/java/in/sociobot/androidbackupreceipt/SafInventoryPlugin.java', import.meta.url);
const activityPath = new URL('../android/app/src/main/java/in/sociobot/androidbackupreceipt/MainActivity.java', import.meta.url);
const configPath = new URL('../public/staticwebapp.config.json', import.meta.url);

describe('Android SAF delivery contract', () => {
  it('uses the persisted selected-tree SAF flow without broad storage permissions', async () => {
    const [plugin, manifest] = await Promise.all([
      readFile(pluginPath, 'utf8'),
      readFile(new URL('../android/app/src/main/AndroidManifest.xml', import.meta.url), 'utf8')
    ]);
    expect(plugin).toContain('Intent.ACTION_OPEN_DOCUMENT_TREE');
    expect(plugin).toContain('takePersistableUriPermission');
    expect(plugin).toContain('DocumentFile.fromTreeUri');
    expect(plugin).toContain('FULL_HASH_LIMIT = 32L * 1024L * 1024L');
    expect(plugin).toContain('"sampled-sha256"');
    expect(manifest).not.toMatch(/READ_MEDIA|READ_EXTERNAL_STORAGE|MANAGE_EXTERNAL_STORAGE/);
  });

  it('registers the bridge and returns progress/cancellation to the same web workflow', async () => {
    const [plugin, activity] = await Promise.all([readFile(pluginPath, 'utf8'), readFile(activityPath, 'utf8')]);
    expect(activity).toContain('registerPlugin(SafInventoryPlugin.class)');
    expect(plugin).toContain('@PluginMethod\n    public void cancelScan');
    expect(plugin).toContain('notifyListeners("scanProgress", progress)');
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
