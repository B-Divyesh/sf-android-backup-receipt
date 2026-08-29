# Android Backup Receipt

Check an Android backup before you wipe. Android Backup Receipt is for Android
owners moving phones who need evidence that selected photos, documents,
downloads, and app-export folders reached a backup destination.

It inventories two user-selected folder trees and computes SHA-256 evidence on
the device. It compares paths and content, then exports a JSON receipt and CSV
discrepancy list. This is a verifier, not a backup engine. It cannot access
protected Android app data.

Production URL: <https://android-backup-receipt.sociobot.in>

Try the one-click isolated sample at
<https://android-backup-receipt.sociobot.in/demo>. It opens a four-file backup
check with two accounted files, one missing file, and one changed file. Demo
state uses `demo:android-backup-receipt` IndexedDB and never reads or writes
your real check.

## What works

- Android Storage Access Framework folder selection in the APK (with persistent selected-tree access when the provider supports it), plus browser folder selection in the PWA
- Full SHA-256 for files through 32 MiB; disclosed sampled SHA-256 for larger files
- Missing, changed, accounted-for, extra, and category totals
- Portable source/destination manifests for mounted or synced WebDAV/S3 data
- JSON receipt, CSV discrepancy export, and print view
- Offline checks and exports after the first visit, plus an installable PWA
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

Run the public reliance-claim checks only:

```sh
npm run test:claims
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
both source and destination folders. It persists read access to the selected
trees and does not request write or broad storage access. Download the
[current APK](https://github.com/B-Divyesh/sf-android-backup-receipt/releases/latest/download/android-backup-receipt.apk)
and [SHA-256 checksum](https://github.com/B-Divyesh/sf-android-backup-receipt/releases/latest/download/SHA256SUMS).
Android may ask you to allow installation from the browser or file manager that
opened the APK.

The release workflow builds both APK and AAB with JDK 21. It restores the
factory-managed signing key from protected repository secrets, assigns a higher
Android version code from the workflow run number, and creates an immutable
release with checksums and the signing-certificate fingerprint. Refresh native
assets after a web build with:

```sh
npm run build
npx cap sync android
```

For a local Android release build, provide `android/app/release.keystore` and
the `RELEASE_STORE_*` environment variables used by the workflow. Then run
`./gradlew assembleRelease` from `android/`.

The rejected `v1.0.1` test APK used a discarded workflow key and cannot update
in place. Remove that test build once before installing the current APK.
Current and future releases share the protected signer and update normally.

## Privacy and billing

The app has no analytics, ad pixels, remote fonts, or third-party runtime
scripts. The two active inventory summaries are stored in IndexedDB so a check
can resume; “Start another check” clears them. Paid archive summaries also use
IndexedDB; the license and daily verification verdict use localStorage. License
verification talks only to the Sociobot billing API. The Android package
excludes this private state from Android cloud backup and device transfer.

See [/privacy](https://android-backup-receipt.sociobot.in/privacy/) and
[/terms](https://android-backup-receipt.sociobot.in/terms/).

## License

MIT. See [LICENSE](LICENSE).
