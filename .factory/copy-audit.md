# Copy audit — polish round 1

Audited 29 August 2026. Counts use whitespace-delimited words after removing markup. No sentence exceeds 22 words. No sentence uses a banned marketing word.

## Landing and demo sentences and fact lines

| Sentence or fact line | Words | Result |
| --- | ---: | --- |
| Folder checks and receipt downloads still work. | 7 | Pass |
| License checks resume when connected. | 5 | Pass |
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
| Android’s file picker controls what this app can read. | 9 | Pass |
| Add every phone and backup folder you want to check. | 10 | Pass |
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
| The complete folder checker and every download stay free. | 9 | Pass; tested claim |
| The $7 Migration Kit is a one-time purchase. | 8 | Pass; tested claim |
| It saves up to 20 receipt summaries on this device for repeat checks. | 13 | Pass; tested claim |
| Sociobot/Dodo is the merchant of record and handles refunds. | 9 | Pass; tested claim |
| A refund revokes the license. | 5 | Pass; tested claim |
| Compare selected phone and backup folders on this device. | 9 | Pass |

Generated receipt and error sentences are also bounded: the longest template is 18 words. Browser tests exercise invalid records, empty folders, incomplete pairs, offline state, license rejection, reset, and successful receipts.

## Headings and controls

All headings and controls use sentence case and name their content or result.

- Check folders; Try it with sample data; Choose phone folder; Choose backup folder
- Add another folder pair; Issue combined receipt; Print receipt; Verify license
- Matched files by category; Missing or changed files
- Download detailed receipt (JSON); Download issue list (CSV)
- How Android Backup Receipt handles your files; Terms for Android Backup Receipt

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
