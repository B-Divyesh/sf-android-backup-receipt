# Android Backup Receipt

Android Backup Receipt is for Android owners moving phones. It checks whether selected files match a backup folder.

Add each phone and backup folder pair to one check. The app compares file names, sizes, and fingerprints on your device. It then shows matched, missing, changed, and extra files.

This is a checker, not a backup service. It cannot read protected Android app data.

Production: <https://android-backup-receipt.sociobot.in>

Try the isolated sample: <https://android-backup-receipt.sociobot.in/demo>

The sample opens a four-file receipt. It shows two matched files, one missing file, one changed file, and one extra file. Demo data uses separate browser storage and never reads or writes your real check.

## User guide

- Choose folders through Android’s file picker in the app. The web version uses the browser’s folder picker.
- Add several phone and backup folder pairs to one combined receipt.
- Create a complete file fingerprint through 32 MiB. Larger files use a clearly marked sampled fingerprint.
- See matched, missing, changed, extra, and category totals for every folder pair.
- Import or download a saved folder record, called a manifest in the file format.
- Download a detailed receipt (JSON), a spreadsheet-ready issue list (CSV), or print the receipt.
- Resume an interrupted check from local browser storage. “Start another check” clears it.
- Use the installed web app offline after its first visit. Folder checks and both downloads work offline.
- Buy the optional $7 Migration Kit once. It stores up to 20 receipt summaries on this device.
- Use the layout at 390 px and operate every control with a keyboard.

Mount, sync, or download a remote backup folder before checking it.

Before wiping your phone, open important files in every backup folder. Keep two copies of files you cannot replace.

## Install the Android app

Download the [current Android app package (APK)](https://github.com/B-Divyesh/sf-android-backup-receipt/releases/latest/download/android-backup-receipt.apk). Advanced users can also download its [published fingerprint](https://github.com/B-Divyesh/sf-android-backup-receipt/releases/latest/download/SHA256SUMS).

Android may ask you to allow installation from your browser or file manager. The app requests read access only for folders you select.

## Develop and test

Use Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Run unit, browser, mobile, accessibility, privacy, and offline checks:

```sh
npm test
```

Run only the public claim tests:

```sh
npm run test:claims
```

Build the static site into `dist/`:

```sh
npm run build
```

Preview it with `npm run preview`.

## Maintainer release notes

The Android release workflow is configured for JDK 21. It builds an app package and an Android App Bundle (AAB).

The workflow restores the protected signing key. It uses the run number for a higher version code. Each release includes checksums and the signing fingerprint.

Refresh the Capacitor Android project after a web build:

```sh
npm run build
npx cap sync android
```

For a local release, provide `android/app/release.keystore` and the `RELEASE_STORE_*` values used by the workflow. Run `./gradlew assembleRelease` from `android/`.

## Privacy and billing

The app has no analytics, ads, remote fonts, or third-party runtime scripts. Core folder checks make no cross-origin request.

The browser stores active folder records in its local database so a check can resume. It stores paid receipt summaries there too. The browser stores the license and daily verdict separately. License checks contact only the Sociobot billing API.

The Android app excludes private app state from cloud backup and device transfer.

See [Privacy](https://android-backup-receipt.sociobot.in/privacy/) and [Terms](https://android-backup-receipt.sociobot.in/terms/).

## License

MIT. See [LICENSE](LICENSE).
