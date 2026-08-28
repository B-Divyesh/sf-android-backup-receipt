# Android Backup Receipt — repair handoff

## Verdict: repaired and deployed

Repair commits: `244c7c3`, `e9d7961`, and `7c50c1f` on `main`.

Production: <https://android-backup-receipt.sociobot.in>

Android artifact: [v1.0.1 release](https://github.com/B-Divyesh/sf-android-backup-receipt/releases/tag/v1.0.1)

## Fixed verifier findings

1. **C1 — Android artifact and SAF:** added a native Capacitor `SafInventory`
   plugin. It launches `ACTION_OPEN_DOCUMENT_TREE`, persists the selected tree
   grant when the provider supports it, recursively inventories only that tree
   with `DocumentFile`, and uses the same 32 MiB full-versus-sampled SHA-256
   boundary as the PWA. It has progress and cancellation events. No broad media
   or storage permission was added. `MainActivity` registers the plugin and the
   web workflow uses it automatically in the installed app while retaining the
   browser picker fallback. The page links the downloadable APK and its
   published SHA-256 checksum.

   GitHub Actions run
   [33158473722](https://github.com/B-Divyesh/sf-android-backup-receipt/actions/runs/33158473722)
   succeeded on 2026-08-28 and released a 16,413,660-byte APK and 16,257,671-byte
   AAB. Downloaded APK SHA-256:

   ```text
   c2115675ef67c2750bbd4b4f9d530ee0bbd254142ed4945479ea322d8e00e1aa
   ```

   `aapt dump badging` confirms package
   `in.sociobot.androidbackupreceipt`, version `1.0.1` / code `2`, compile SDK
   35, label `Android Backup Receipt`, and the APK contains `classes.dex`,
   `AndroidManifest.xml`, and the offline app shell.

2. **H1 — checkout:** live `GET
   https://api.sociobot.in/api/v1/products/android-backup-receipt/checkout`
   returns `303` to the hosted Dodo checkout. Existing one-time $7 disclosure,
   return-token storage, restore field, and background verification are intact.

3. **H2 — verification throttling:** a controlled live sequential burst of
   invalid license values received `429` at request 31 with `Retry-After: 0`.
   Rate limiting is enforced by the billing service, not imitated in the browser.

4. **M1/M3/L2 — static hardening:** `staticwebapp.config.json` sends CSP
   (`frame-ancestors 'none'`), `X-Frame-Options: DENY`, a restrictive
   `Permissions-Policy`, and `nosniff`. Vite emits fingerprinted app JS/CSS;
   original images, icons, and legal CSS have content fingerprints. `/assets/*`
   is immutable for one year, `/sw.js` is no-store, and the manifest serves as
   `application/manifest+json`.

5. **M2/L1 — accessibility:** mobile wordmark/footer links are at least 44 px
   tall (live 390 px: 48, 44, 44, 44). The nested complementary landmark is a
   non-landmark note. Playwright axe now requires zero violations.

## Regression coverage

- `tests/android-bridge.test.ts` asserts the native SAF intent, persistent
  grant, lack of broad storage permissions, native hash policy, bridge
  registration, progress/cancel events, and response configuration.
- Playwright covers the browser picker fallback, 390 px target sizes, zero axe
  violations, source/destination comparison, persistence, and offline reload.
- Existing core format, comparison, CSV-safety, and hash-boundary coverage is
  preserved.

## Verification evidence

From a clean install, all of the following passed on 2026-08-28:

```sh
npm ci
npm run lint
npm test
npm audit --omit=dev
npm run build
npx cap sync android
```

Results: 10 Vitest assertions, 4 Playwright tests, 0 audit vulnerabilities,
25.47 KB raw JS, and 13.84 KB raw CSS. Native Java compilation passed with
`ANDROID_HOME=/usr/lib/android-sdk ./gradlew :app:compileReleaseJavaWithJavac`;
release-signing validation passed, and the release workflow performed full
`assembleRelease bundleRelease`.

Production checks passed:

- `verify-url.sh`: HTTP 200, 703 ms, no console/page errors, title/lang/one h1/
  main present, no missing image alt text.
- First-load network capture reached only the product origin; no uploads,
  analytics, remote fonts, or third-party runtime requests occurred.
- Keyboard Tab reaches skip, navigation, both folder actions, import, APK/
  checksum, and checkout. Desktop 1440 px and mobile 390 px had no overflow.
- Offline reload remains covered with Playwright `context.setOffline(true)`;
  the versioned service worker update toast remains in place.
- Live headers confirm CSP/frame/permissions policy, manifest MIME, immutable
  hashed asset caching, and no-store service-worker caching.
- Generated `dist/` byte identity passed **19/19** public files (the platform-
  consumed deployment configuration is intentionally not served).
- Mobile Lighthouse JSON: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1,209 ms, TBT 0 ms, CLS 0.

## Known gap / next step

The APK was compiled, signed, downloaded, unpacked, and manifest-checked, but
an interactive physical-device/document-provider pass is not possible in this
container. Before a Play Store submission, test persistent tree access against
the intended Android versions and USB/document providers, and replace the
workflow-generated signing key with the owner’s protected upload key. The PWA,
static deployment class, pricing, researched scope, and free export behavior
remain unchanged.
