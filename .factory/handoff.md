# Android Backup Receipt — build handoff

## Shipped

- A complete Vite + vanilla TypeScript PWA at `dist/` for comparing a
  user-selected Android source folder with a USB/local/synced destination.
- Local file inventory with relative paths, sizes, timestamps, and SHA-256.
  Files up to 32 MB are fully hashed. Larger files use SHA-256 over three 1 MB
  samples plus file size to avoid loading large videos into memory; the UI and
  receipt disclose this distinction.
- Accounted, missing, changed, extra, media-category, and coverage totals with a
  clear “do not wipe” conclusion when discrepancies exist.
- Portable source/destination manifest export and destination manifest import,
  dated JSON receipt, CSV issue export (formula-injection guarded), and print
  view.
- Empty, scanning, cancellation, invalid-manifest, read-error, offline, and
  success states. The mobile layout was exercised at 390 × 844.
- Installable PWA: 192/512/maskable icons, versioned app-shell cache, cached
  legal pages, connectivity status, and update notification.
- Optional $7 one-time Migration Kit wired to the Sociobot checkout/verify
  contract. Core verification and all exports remain free; paid users get a
  local 20-receipt IndexedDB archive. License checks are cached for one day and
  do not block the free first paint.
- Privacy and terms pages, MIT license, complete README, and an original
  generated hero illustration with source prompt/provenance.
- Capacitor 7 Android skeleton under `android/`, configured as
  `in.sociobot.androidbackupreceipt`, synced to the current web build, with
  product-specific launcher and splash assets.

## Verification

Run from the repository root:

```sh
npm ci
npm test
npm run build
npx cap sync android
```

Latest local results on 2026-08-28:

- `npm test`: 7 unit tests and 3 Playwright tests passed.
- Playwright checks: source/destination hashing and discrepancy receipt at
  390 px; axe scan with zero serious/critical violations; offline reload.
- `npm run build`: passed; output root is `dist/` with `dist/index.html`.
- Initial assets: 15.1 KB JS, 13.6 KB CSS, 28 KB mobile hero WebP (all raw,
  before transfer compression). No runtime fonts or third-party scripts.
- Lighthouse mobile against the production preview: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.4 s,
  Total Blocking Time 0 ms, CLS 0.
- `npm audit`: 0 vulnerabilities.
- Console smoke test: no page errors or error-level console messages.

Lighthouse command used:

```sh
CHROME_PATH=/opt/pw-browsers/chromium-1208/chrome-linux64/chrome \
  npx -y lighthouse@12.8.2 http://127.0.0.1:4173 \
  --quiet --chrome-flags='--headless --no-sandbox --disable-dev-shm-usage' \
  --only-categories=performance,accessibility,best-practices,seo
```

## Known boundaries

- A static PWA cannot reliably enumerate arbitrary WebDAV/S3 accounts because
  provider CORS and authentication differ. This v1 does not collect remote
  credentials: users mount/sync/download the remote folder or import a manifest
  generated where that destination is available. This is stated in the UI.
- The Capacitor project is a wrapper skeleton for the later APK work order. It
  has not been packaged or signed here, as requested by the static deploy work
  order. Native SAF integration should replace/augment the web directory input
  before Play Store distribution.
- Sampled hashes for files above 32 MB are efficient evidence, not a byte-for-byte
  proof of the entire file. Users are told to open representative files before
  wiping a source device.
- The production billing product must be registered by the factory. The app uses
  only the slug-based checkout and verify URLs and contains no provider product
  ID or secret.

## Recommended next steps

1. Register the production Sociobot paid product and exercise checkout return,
   restore, refund, and revoked-license cases on the deployed origin.
2. In the Android artifact work order, add a narrow native SAF tree bridge,
   confirm persistent URI permission behavior on Android 11–16, and build/sign
   the APK with the factory keystore.
3. Test large mixed-media folders on physical low-memory Android devices and
   tune the 32 MB full-hash threshold if field timing suggests it.
