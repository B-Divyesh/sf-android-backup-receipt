# Copy audit — polish round 2

Audited 29 August 2026 after every round-2 rewrite. Counts use whitespace-delimited words after removing markup. The longest landing sentence has 17 words. The longest README sentence has 15 words. No sentence exceeds 22 words. No customer-facing sentence uses a banned marketing word.

## Landing and demo sentences and fact lines

| Sentence or fact line | Words | Result |
| --- | ---: | --- |
| Folder checks and receipt downloads still work. | 7 | Pass |
| Demo — sample data, nothing is saved to your real check. | 11 | Pass |
| Four sample files show two matched, one missing, and one changed. | 11 | Pass |
| Check an Android backup before you wipe. | 7 | Pass |
| For Android owners moving phones: compare selected folders, then get a receipt showing which selected files match. | 17 | Pass |
| Local files stay on your device. | 6 | Pass |
| 4 files in the sample check | 6 | Pass |
| 2 downloads receipt and issue list | 6 | Pass |
| Choose each phone folder and its backup folder. | 8 | Pass |
| This device reads file details and creates fingerprints for comparison. | 10 | Pass |
| Select a folder such as DCIM, Download, or an app’s export folder. | 12 | Pass |
| Pick the matching folder on local or USB storage. | 9 | Pass |
| You can also import a saved folder record. | 8 | Pass |
| Your files do not leave this screen. | 7 | Pass |
| Start with a phone folder. | 5 | Pass |
| Files larger than 32 MiB use a clearly marked sampled SHA-256 fingerprint. | 12 | Pass; technical term follows the action |
| A receipt covers only the folders selected now. | 8 | Pass |
| Open important files in each backup folder before wiping your phone. | 11 | Pass |
| The Android app uses Android’s file picker. | 7 | Pass; names the native picker |
| This website uses your browser’s folder picker. | 7 | Pass; names the web picker |
| Add every folder pair you want to check. | 8 | Pass |
| Files through 32 MiB use a complete fingerprint (SHA-256). | 10 | Pass; plain description precedes format |
| Larger files use a clearly marked sampled fingerprint. | 8 | Pass |
| Download a detailed receipt (JSON) or a spreadsheet-ready issue list (CSV). | 12 | Pass; outcomes precede formats |
| Mount, sync, or download the remote backup folder before checking it here. | 12 | Pass |
| You can also import its saved folder record. | 8 | Pass |
| This does not back up your phone. | 7 | Pass |
| It checks selected photos, downloads, documents, and app-export folders. | 9 | Pass |
| It cannot see protected app data, messages, system settings, or unselected folders. | 12 | Pass |
| Matching file names and fingerprints show that copies agree now. | 10 | Pass |
| They cannot promise that a storage provider will keep them. | 10 | Pass |
| Keep two copies. | 3 | Pass |
| The Android app asks you to select each phone or backup folder. | 12 | Pass |
| It keeps read access only for folders you select. | 9 | Pass |
| It cannot scan your full device or protected app data. | 10 | Pass |
| Download the Android app package (APK). | 6 | Pass; plain description precedes acronym |
| Advanced users can confirm its published fingerprint. | 7 | Pass |
| Open it on Android and allow installation from your browser or file manager if Android asks. | 15 | Pass |
| Choose each phone folder and backup folder in Android’s file picker. | 11 | Pass |
| Then issue one combined receipt. | 5 | Pass |
| Each release uses the same protected signing key and a higher Android version code. | 14 | Pass; tested claim |
| Folder checks, folder records, and receipt downloads are free. | 9 | Pass; each named output is tested |
| The $7 Migration Kit is a one-time purchase. | 8 | Pass; tested claim |
| It saves up to 20 receipt summaries on this device for repeat checks. | 13 | Pass; tested claim |
| Sociobot/Dodo is the merchant of record and handles refunds. | 9 | Pass; tested claim |
| A refund revokes the license. | 5 | Pass; tested claim |
| Compare selected phone and backup folders on this device. | 9 | Pass |

Generated receipt and error sentences are also bounded. The sample warning is: “Do not wipe your phone yet: 1 file is missing and 1 has changed.” (13 words). The offline license status is: “License saved. Connect once to verify it and use receipt history.” (11 words). Browser tests exercise invalid records, empty folders, incomplete pairs, offline state, license rejection, reset, and successful receipts.

## Headings and controls

All headings and controls use sentence case and name their content or result.

- Check folders; Try it with sample data; Choose phone folder; Choose the matching backup folder
- Add another folder pair; Issue combined receipt; Print receipt; Verify license
- Matched files by category; Missing or changed files
- Download detailed receipt (JSON); Download issue list (CSV)
- How Android Backup Receipt handles your files; Terms for Android Backup Receipt
- Read what this does not check

## README sentences and fact lines

Code blocks and section titles are excluded. Command introductions are included.

| # | Sentence or fact line | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Android Backup Receipt is for Android owners moving phones. | 9 | Pass |
| 2 | It checks whether selected files match a backup folder. | 9 | Pass |
| 3 | Add each phone and backup folder pair to one check. | 10 | Pass |
| 4 | The app compares file names, sizes, and fingerprints on your device. | 11 | Pass |
| 5 | It then shows matched, missing, changed, and extra files. | 9 | Pass |
| 6 | This is a checker, not a backup service. | 8 | Pass |
| 7 | It cannot read protected Android app data. | 7 | Pass |
| 8 | Production: https://android-backup-receipt.sociobot.in | 2 | Pass |
| 9 | Try the isolated sample: https://android-backup-receipt.sociobot.in/demo | 5 | Pass |
| 10 | The sample opens a four-file receipt. | 6 | Pass |
| 11 | It shows two matched files, one missing file, one changed file, and one extra file. | 15 | Pass |
| 12 | Demo data uses separate browser storage and never reads or writes your real check. | 14 | Pass |
| 13 | Choose folders through Android’s file picker in the app. | 9 | Pass |
| 14 | The web version uses the browser’s folder picker. | 8 | Pass |
| 15 | Add several phone and backup folder pairs to one combined receipt. | 11 | Pass |
| 16 | Create a complete file fingerprint through 32 MiB. | 8 | Pass |
| 17 | Larger files use a clearly marked sampled fingerprint. | 8 | Pass |
| 18 | See matched, missing, changed, extra, and category totals for every folder pair. | 12 | Pass |
| 19 | Import or download a saved folder record, called a manifest in the file format. | 14 | Pass |
| 20 | Download a detailed receipt (JSON), a spreadsheet-ready issue list (CSV), or print the receipt. | 14 | Pass |
| 21 | Resume an interrupted check from local browser storage. | 8 | Pass |
| 22 | “Start another check” clears it. | 5 | Pass |
| 23 | Use the installed web app offline after its first visit. | 10 | Pass |
| 24 | Folder checks and both downloads work offline. | 7 | Pass |
| 25 | Buy the optional $7 Migration Kit once. | 7 | Pass |
| 26 | It stores up to 20 receipt summaries on this device. | 10 | Pass |
| 27 | Mount, sync, or download a remote backup folder before checking it. | 11 | Pass |
| 28 | Before wiping your phone, open important files in every backup folder. | 11 | Pass |
| 29 | Keep two copies of files you cannot replace. | 8 | Pass |
| 30 | Download the current Android app package (APK). | 7 | Pass |
| 31 | Advanced users can also download its published fingerprint. | 8 | Pass |
| 32 | Android may ask you to allow installation from your browser or file manager. | 13 | Pass |
| 33 | The app requests read access only for folders you select. | 10 | Pass |
| 34 | Use Node.js 20 or newer. | 5 | Pass |
| 35 | Run unit, browser, mobile, accessibility, privacy, and offline checks: | 9 | Pass |
| 36 | The browser suite checks the 390 px layout and keyboard controls. | 11 | Pass |
| 37 | Run only the public claim tests: | 6 | Pass |
| 38 | Build the static site into dist/: | 6 | Pass |
| 39 | Preview it with npm run preview. | 6 | Pass |
| 40 | The Android release workflow is configured for JDK 21. | 9 | Pass |
| 41 | It builds an app package and an Android App Bundle (AAB). | 11 | Pass |
| 42 | The workflow restores the protected signing key. | 7 | Pass |
| 43 | It uses the run number for a higher version code. | 10 | Pass |
| 44 | Each release includes checksums and the signing fingerprint. | 8 | Pass |
| 45 | Refresh the Capacitor Android project after a web build: | 9 | Pass |
| 46 | For a local release, provide android/app/release.keystore and the RELEASE_STORE_* values used by the workflow. | 14 | Pass |
| 47 | Run ./gradlew assembleRelease from android/. | 5 | Pass |
| 48 | The app has no analytics, ads, remote fonts, or third-party runtime scripts. | 12 | Pass; `no-tracking-runtime` |
| 49 | Core folder checks make no cross-origin request. | 7 | Pass; `local-only-files` |
| 50 | The browser stores active folder records in its local database so a check can resume. | 15 | Pass |
| 51 | It stores paid receipt summaries there too. | 7 | Pass |
| 52 | The browser stores the license and daily verdict separately. | 9 | Pass |
| 53 | License checks contact only the Sociobot billing API. | 8 | Pass |
| 54 | The Android app excludes private app state from cloud backup and device transfer. | 13 | Pass |
| 55 | See Privacy and Terms. | 4 | Pass |
| 56 | MIT. | 1 | Pass |
| 57 | See LICENSE. | 2 | Pass |

## Terminology

| Concept | One customer-facing term |
| --- | --- |
| Folder on the old phone | phone folder |
| Corresponding copied folder | backup folder |
| Successful comparison | matched |
| Saved portable inventory | saved folder record; “manifest” appears once only as the file-format name |
| Whole result document | receipt |
| Optional local history purchase | Migration Kit |

Maintainer-only sections define APK, AAB, JDK, keystore, and Capacitor after the user guide. Public copy leads with the outcome before JSON, CSV, SHA-256, or APK.
