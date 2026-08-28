# Android Backup Receipt

Android Backup Receipt is a local-first PWA for Android owners who want evidence
that selected photos, documents, downloads, and app-export folders made it to a
backup destination before they erase or replace a phone.

It inventories two user-selected folder trees, computes SHA-256 evidence in the
browser, compares relative paths and content, and exports a dated JSON receipt
plus a CSV discrepancy list. Nothing is uploaded. This is a verifier, not a
backup engine, and it cannot access protected Android app data.

Production URL: <https://android-backup-receipt.sociobot.in>

## What works

- Android Storage Access Framework folder selection in the APK (with persistent selected-tree access when the provider supports it), plus browser folder selection in the PWA
- Full SHA-256 for files up to 32 MB; disclosed sampled SHA-256 for larger files
- Missing, changed, accounted-for, extra, and category totals
- Portable source/destination manifests for mounted or synced WebDAV/S3 data
- JSON receipt, CSV discrepancy export, and print view
- Offline app shell and installable PWA
- Optional $7 one-time Migration Kit license for a 20-receipt local archive
- Responsive 390 px layout and full keyboard operation

For WebDAV or S3, sync/download or mount the relevant remote folder first, then
select it. The static v1 deliberately does not collect cloud credentials.

## Develop and verify

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Run all unit, mobile flow, accessibility, and offline tests:

```sh
npm test
```

Create the exact static deployment output:

```sh
npm run build
# output: ./dist (with dist/index.html at its root)
```

Preview the production output with `npm run preview`.

## Android APK

The signed Android build has application ID `in.sociobot.androidbackupreceipt`.
It uses Android’s Storage Access Framework (`ACTION_OPEN_DOCUMENT_TREE`) for
both source and destination folders; it does not request broad storage access.
Download the APK and its checksum from the [v1.0.1 release](https://github.com/B-Divyesh/sf-android-backup-receipt/releases/tag/v1.0.1).
Android may ask you to allow installation from the browser or file manager that
opened the APK. It is not on Google Play yet.

The release workflow builds both APK and AAB with JDK 21, generates a signing
key inside GitHub Actions, and publishes `SHA256SUMS`. A Play Store release must
replace that generated key with the owner’s upload key. Refresh native assets after a web build with:

```sh
npm run build
npx cap sync android
```

For a local Android release build, provide `android/app/release.keystore` (or
the `RELEASE_STORE_*` environment variables used by the workflow) before running
`./gradlew assembleRelease` from `android/`.

## Privacy and billing

The app has no analytics, ad pixels, remote fonts, or third-party runtime
scripts. The two active inventory summaries are stored in IndexedDB so a check
can resume; “Start another check” clears them. Paid archive summaries also use
IndexedDB; the license and daily verification verdict use localStorage. License
verification talks only to the Sociobot billing API.

See [/privacy](https://android-backup-receipt.sociobot.in/privacy/) and
[/terms](https://android-backup-receipt.sociobot.in/terms/).

## License

MIT. See [LICENSE](LICENSE).
