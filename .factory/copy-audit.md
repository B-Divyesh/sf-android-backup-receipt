# Landing copy audit — 2026-08-29

Scope: every unique user-facing phrase in `index.html`, including hidden demo,
offline, loading, receipt, and paid states. Counts split on whitespace; arrows,
symbols, and file extensions do not add words. No line exceeds 22 words. No
line contains a banned marketing word.

| Area | Copy | Words | Result |
| --- | --- | ---: | --- |
| Header | Skip to verification | 3 | Pass |
| Header | Backup / Receipt | 2 | Pass |
| Header | Verify | 1 | Pass |
| Header | How it works | 3 | Pass |
| Header | Migration Kit | 2 | Pass |
| Header | Local only | 2 | Pass |
| Offline | Offline mode. | 2 | Pass |
| Offline | Folder checks and exports still work. | 6 | Pass |
| Offline | License verification will resume when connected. | 6 | Pass |
| Demo | Demo — sample data, nothing is saved to your real check. | 10 | Pass |
| Demo | Four sample files show two found, one missing, and one changed. | 11 | Pass |
| Demo | Reset demo | 2 | Pass |
| Demo | Start for real | 3 | Pass |
| First screen | Android backup check | 3 | Pass |
| First screen | Check an Android backup before you wipe. | 7 | Pass |
| First screen | For Android owners moving phones: compare selected folders, then get a receipt showing what can be restored. | 17 | Pass |
| First screen | Try it with sample data | 5 | Pass |
| First screen | Check real folders | 3 | Pass |
| First screen | Read the honest limits | 4 | Pass |
| First screen | Local files stay on your device | 6 | Pass |
| First screen | 4 files in the sample check | 6 | Pass |
| First screen | JSON + CSV receipt exports | 5 | Pass |
| Figure | Device evidence → destination evidence | 4 | Pass |
| Workspace | Backup check | 2 | Pass |
| Workspace | Build a coverage receipt | 4 | Pass |
| Workspace | Choose matching folder roots. | 4 | Pass |
| Workspace | We read filenames, sizes, dates, and file content only long enough to hash them in this browser. | 17 | Pass |
| Source | Original evidence | 2 | Pass |
| Source | Choose the phone folder | 4 | Pass |
| Source | Select a folder such as DCIM, Download, or an app’s export folder. | 12 | Pass |
| Source | Choose source folder | 3 | Pass |
| Source | No source selected | 3 | Pass |
| Source | Export source manifest | 3 | Pass |
| Destination | Backup evidence | 2 | Pass |
| Destination | Choose the matching destination | 4 | Pass |
| Destination | Pick the copied folder on USB/local storage, or import a manifest made on the destination. | 15 | Pass |
| Destination | Choose destination | 2 | Pass |
| Destination | Import manifest | 2 | Pass |
| Destination | No destination selected | 3 | Pass |
| Destination | Export destination manifest | 3 | Pass |
| Progress | Reading files… | 2 | Pass |
| Progress | Preparing inventory | 2 | Pass |
| Progress | Cancel scan | 2 | Pass |
| Ready | Both inventories ready | 3 | Pass |
| Ready | Ready to compare | 3 | Pass |
| Ready | Compare and issue receipt | 4 | Pass |
| Empty | Your files do not leave this screen. | 7 | Pass |
| Empty | Start with the source folder. | 5 | Pass |
| Empty | Large files use a disclosed sampled fingerprint to protect memory and battery. | 12 | Pass |
| Receipt | Coverage receipt | 2 | Pass |
| Receipt | Backup check complete | 3 | Pass |
| Receipt | Accounted for | 2 | Pass |
| Receipt | Missing | 1 | Pass |
| Receipt | Changed | 1 | Pass |
| Receipt | By category | 2 | Pass |
| Receipt | Needs attention | 2 | Pass |
| Receipt | Export receipt (.json) | 3 | Pass |
| Receipt | Export details (.csv) | 3 | Pass |
| Receipt | Print receipt | 2 | Pass |
| Receipt | Start another check | 3 | Pass |
| Receipt | A receipt proves only the folders selected at this time. | 10 | Pass |
| Receipt | Open a few important files on the destination before wiping your phone. | 12 | Pass |
| Method | How it works | 3 | Pass |
| Method | How the folder check works | 5 | Pass |
| Method | You point to folders | 4 | Pass |
| Method | Android’s file picker controls what this app can read. | 9 | Pass |
| Method | Protected app data stays protected. | 5 | Pass |
| Method | Your browser fingerprints files | 4 | Pass |
| Method | Files through 32 MiB use full SHA-256. | 7 | Pass |
| Method | Larger files use clearly marked, low-memory sampled SHA-256. | 8 | Pass |
| Method | You keep the receipt | 4 | Pass |
| Method | Export JSON for machine-readable evidence or CSV for inspection. | 9 | Pass |
| Method | No account is required. | 4 | Pass |
| Remote folders | WebDAV or S3? | 3 | Pass |
| Remote folders | Sync or download the destination folder, then choose it here. | 10 | Pass |
| Remote folders | Alternatively, run this app where the destination is mounted and export its manifest. | 13 | Pass |
| Remote folders | Direct cloud credentials are intentionally not collected by this static v1. | 11 | Pass |
| Limits | Limits | 1 | Pass |
| Limits | This does not back up your phone. | 7 | Pass |
| Limits | It verifies user-selected photos, downloads, documents, and app-export folders. | 9 | Pass |
| Limits | It cannot see protected app data, messages inside apps, system settings, or anything you do not select. | 17 | Pass |
| Limits | Matching filenames and bytes are strong evidence, not a guarantee that a remote provider will retain them forever. | 17 | Pass |
| Limits | Keep two copies of irreplaceable files. | 6 | Pass |
| Android | Android app | 2 | Pass |
| Android | Inspect folders with Android’s own picker. | 6 | Pass |
| Android | The Android app asks you to select each source or destination tree. | 12 | Pass |
| Android | It keeps read access only for that selected tree. | 9 | Pass |
| Android | It cannot scan your full device or protected app data. | 10 | Pass |
| Android | Download the APK and confirm the published SHA-256 checksum. | 9 | Pass |
| Android | Open it on Android and allow installation from your browser or file manager if Android asks. | 15 | Pass |
| Android | Choose the phone folder and its copied destination in the Android file picker, then issue the receipt. | 17 | Pass |
| Android | Download current APK | 3 | Pass |
| Android | Not on Google Play yet. | 5 | Pass |
| Android | Each release uses the same protected signing key and a higher Android version code. | 13 | Pass |
| Paid | Optional receipt history | 3 | Pass |
| Paid | Save receipt history | 3 | Pass |
| Paid | The complete verifier and every export stay free. | 8 | Pass |
| Paid | The $7 Migration Kit is a one-time purchase. | 8 | Pass |
| Paid | It saves up to 20 receipt summaries on this device for repeat checks. | 13 | Pass |
| Paid | 20-entry local receipt archive | 4 | Pass |
| Paid | Repeat-check history | 2 | Pass |
| Paid | No subscription | 2 | Pass |
| Paid | One-time purchase. | 2 | Pass |
| Paid | Sociobot/Dodo is the merchant of record and handles refunds. | 9 | Pass |
| Paid | A refund revokes the license. | 5 | Pass |
| Paid | Buy Migration Kit — $7 | 5 | Pass |
| Paid | Have a license? | 3 | Pass |
| Paid | Paste it here | 3 | Pass |
| Paid | Verify | 1 | Pass |
| Paid | Free verifier active. | 3 | Pass |
| Paid | Receipt archive | 2 | Pass |
| Paid | Clear archive | 2 | Pass |
| Footer | Local-first evidence for Android moves. | 5 | Pass |
| Footer | Privacy | 1 | Pass |
| Footer | Terms | 1 | Pass |
| Footer | Source | 1 | Pass |
| Footer | Original generated illustration; no stock imagery. | 6 | Pass |
| Footer | Built by Param Factory. | 4 | Pass |

## Terminology

| Concept | Product term |
| --- | --- |
| Files on the phone | source folder |
| Copied or synced files | destination folder |
| Hash inventory | manifest |
| Comparison result | receipt |
| One-click test data | sample data / demo |
| Paid saved summaries | receipt archive |

## Result

- Longest line: 17 words.
- Banned terms found: none.
- The first screen states the job, audience, first action, and three facts.
