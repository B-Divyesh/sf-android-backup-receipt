# Adversarial first-read review 4 — Android Backup Receipt

## Verdict: PASS

- Product: <https://android-backup-receipt.sociobot.in>
- Repository head reviewed: `3f860fd52291559de8d11fa77a836d01bc08c828`
- Live build: version `1.0.3`, build `8dbdab69760d`
- Reviewed: 29 August 2026 UTC
- Viewports: 390×844 and 1440×900, fresh Chromium contexts
- Findings: **0 blocking, 0 major, 0 minor**
- Untested claims: **0**

The product passes. A cold visitor can identify the job, audience, and first
action before scrolling. The one-click demo immediately shows a realistic
receipt, its sandbox resets and exits cleanly, all 22 registered claim commands
pass from a clean clone, every earlier finding remains fixed in production and
source, and the complete route/copy/claim review found nothing left to report.

## Cold first read, before scrolling

### 390×844

- What it does: checks selected Android phone folders against backup folders
  and produces a receipt showing which selected files match.
- For whom: Android owners moving phones before wiping the old phone.
- What to click first: **Try it with sample data**.

Exact decisive copy:

> “Check an Android backup before you wipe.”

> “For Android owners moving phones: compare selected folders, then get a
> receipt showing which selected files match.”

> “Try it with sample data”

The primary action ends at y=463 px. The privacy, offline, and price facts end
at y=723 px. All required content fits inside 844 px, `scrollY` is zero, and
the document width is exactly 390 px.

### 1440×900

The same three answers, both first actions, all three facts, and the original
phone-to-drive inspection artwork fit without scrolling. The facts end at
y=765 px. There is no horizontal overflow.

## Findings

None. There is no `F-4-k` identifier because no blocking or minor defect was
found. This satisfies the required zero-finding condition for `PASS`.

## Demo and sandbox

| Check | Result |
| --- | --- |
| One-click entry | PASS — the landing action opens `/demo` directly |
| Product visible on first screen | PASS — receipt y=178–700 and actions y=583–687 at 390×844 |
| Realistic sample | PASS — Pixel 7 and USB-C backup folders; 2 matched, 1 missing, 1 changed, 1 extra, 50% |
| Persistent banner | PASS — “Demo — sample data, nothing is saved to your real check” |
| Reset demo | PASS — removes demo keys/history and reseeds exactly 2 active sample records at 50% |
| Start for real | PASS — removes the demo database and all `demo:` keys, then opens `/` |
| Real data untouched | PASS — seeded real license and real IndexedDB database survive reset and exit |
| Runtime privacy | PASS — no cross-origin request during cold home or demo use |
| Accessibility | PASS — zero Axe violations on home and demo |

The live first screen contains the named changed photo and missing PDF, the
warning “Do not wipe your phone yet: 1 file is missing and 1 has changed,” and
the JSON and CSV download actions. The sample therefore shows the product
being used rather than explaining what a later screen might show.

## Claims verification

The repository was cloned with `git clone --local /work/repo` into
`/tmp/abr-review4.YdC2ur/repo`, followed by `npm ci`. Every exact command from
`.factory/claims.json` ran separately. Each selected its tagged test and
returned zero.

| Claim ID | Exact command | Result |
| --- | --- | --- |
| `demo-sample-receipt` | `npm run test:claims -- --grep @claim:demo-sample-receipt` | PASS |
| `demo-reset-isolation` | `npm run test:claims -- --grep @claim:demo-reset-isolation` | PASS |
| `resume-reset` | `npm run test:claims -- --grep @claim:resume-reset` | PASS |
| `local-only-files` | `npm run test:claims -- --grep @claim:local-only-files` | PASS |
| `no-tracking-runtime` | `npm run test:claims -- --grep @claim:no-tracking-runtime` | PASS |
| `receipt-exports` | `npm run test:claims -- --grep @claim:receipt-exports` | PASS |
| `sha256-evidence` | `npm run test:claims -- --grep @claim:sha256-evidence` | PASS |
| `hash-boundary` | `npm run test:unit -- -t @claim:hash-boundary` | PASS |
| `comparison-manifest` | `npm run test:claims -- --grep @claim:comparison-manifest` | PASS |
| `multi-folder-receipt` | `npm run test:claims -- --grep @claim:multi-folder-receipt` | PASS |
| `saf-read-only` | `npm run test:unit -- -t @claim:saf-read-only` | PASS |
| `android-private-backup` | `npm run test:unit -- -t @claim:android-private-backup` | PASS |
| `android-updates` | `npm run test:unit -- -t @claim:android-updates` | PASS |
| `android-release-assets` | `npm run test:unit -- -t @claim:android-release-assets` | PASS |
| `remote-provider-access` | `npm run test:unit -- -t @claim:remote-provider-access` | PASS |
| `local-metadata-storage` | `npm run test:claims -- --grep @claim:local-metadata-storage` | PASS |
| `migration-archive` | `npm run test:claims -- --grep @claim:migration-archive` | PASS |
| `license-revocation` | `npm run test:claims -- --grep @claim:license-revocation` | PASS |
| `print-view` | `npm run test:claims -- --grep @claim:print-view` | PASS |
| `responsive-keyboard` | `npm run test:claims -- --grep @claim:responsive-keyboard` | PASS |
| `offline-reload` | `npm run test:claims -- --grep @claim:offline-reload` | PASS |
| `offline-exports` | `npm run test:claims -- --grep @claim:offline-exports` | PASS |

The live landing, demo, Privacy, Terms, and README were cross-checked against
the manifest. No claim-like sentence is absent from `claims.json`, and no
listed claim is broader than its observable test.

## Copy audit

Counts use whitespace-delimited words after removing markup. A displayed em
dash counts as a word. Code blocks and section titles in README are excluded;
command introductions and fact lines are included. No sentence exceeds 22
words, uses a banned marketing adjective, switches product terminology, or
needs a rewrite.

### Landing and demo sentences

| # | Sentence or fact line | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Folder checks and receipt downloads still work. | 7 | Pass |
| 2 | Demo — sample data, nothing is saved to your real check. | 11 | Pass |
| 3 | Four sample files show two matched, one missing, and one changed. | 11 | Pass |
| 4 | Check an Android backup before you wipe. | 7 | Pass |
| 5 | For Android owners moving phones: compare selected folders, then get a receipt showing which selected files match. | 17 | Pass |
| 6 | Opens a four-file receipt with two problems. | 7 | Pass |
| 7 | Files stay on this device. | 5 | Pass |
| 8 | Offline after the first visit. | 5 | Pass |
| 9 | Checks are free; history costs $7 once. | 7 | Pass |
| 10 | Choose each phone folder and its backup folder. | 8 | Pass |
| 11 | This device reads file details and creates fingerprints for comparison. | 10 | Pass |
| 12 | Select a folder such as DCIM, Download, or an app’s export folder. | 12 | Pass |
| 13 | Pick the matching folder on local or USB storage. | 9 | Pass |
| 14 | You can also import a saved folder record. | 8 | Pass |
| 15 | Your files do not leave this screen. | 7 | Pass |
| 16 | Start with a phone folder. | 5 | Pass |
| 17 | Files larger than 32 MiB use a clearly marked sampled SHA-256 fingerprint. | 12 | Pass — the file fingerprint is named before its technical method |
| 18 | A receipt covers only the folders selected now. | 8 | Pass |
| 19 | Open important files in each backup folder before wiping your phone. | 11 | Pass |
| 20 | The Android app uses Android’s file picker. | 7 | Pass |
| 21 | This website uses your browser’s folder picker. | 7 | Pass |
| 22 | Add every folder pair you want to check. | 8 | Pass |
| 23 | Files through 32 MiB use a complete fingerprint (SHA-256). | 10 | Pass — plain result precedes the format |
| 24 | Larger files use a clearly marked sampled fingerprint. | 8 | Pass |
| 25 | Download a detailed receipt (JSON) or a spreadsheet-ready issue list (CSV). | 12 | Pass — outcomes precede formats |
| 26 | Android: Install a WebDAV or S3 document provider, then select its backup folder. | 13 | Pass — names the provider required by the target self-hosted workflow |
| 27 | This app reads only that selected folder. | 7 | Pass |
| 28 | Website: Open the mounted remote folder on another computer. | 9 | Pass |
| 29 | Download its backup folder record. | 5 | Pass |
| 30 | Move that JSON file here, then use Import backup record. | 10 | Pass |
| 31 | This does not back up your phone. | 7 | Pass |
| 32 | It checks selected photos, downloads, documents, and app-export folders. | 9 | Pass |
| 33 | It cannot see protected app data, messages, system settings, or unselected folders. | 12 | Pass |
| 34 | Matching file names and fingerprints show that copies agree now. | 10 | Pass |
| 35 | They cannot promise that a storage provider will keep them. | 10 | Pass |
| 36 | Keep two copies. | 3 | Pass |
| 37 | The Android app asks you to select each phone or backup folder. | 12 | Pass |
| 38 | It keeps read access only for folders you select. | 9 | Pass |
| 39 | It cannot scan your full device or protected app data. | 10 | Pass |
| 40 | Download the Android app package (APK). | 6 | Pass — acronym follows the plain result |
| 41 | Advanced users can download APK checksums. | 6 | Pass |
| 42 | Open it on Android and allow installation from your browser or file manager if Android asks. | 15 | Pass |
| 43 | Choose each phone folder and backup folder in Android’s file picker. | 11 | Pass |
| 44 | Then issue one combined receipt. | 5 | Pass |
| 45 | Each release uses the same protected signing key and a higher Android version code. | 14 | Pass |
| 46 | Folder checks, folder records, and receipt downloads are free. | 9 | Pass |
| 47 | The $7 Migration Kit is a one-time purchase. | 8 | Pass |
| 48 | It saves up to 20 receipt summaries on this device for repeat checks. | 13 | Pass |
| 49 | 20 saved receipt summaries | 4 | Pass |
| 50 | Receipt history for repeat checks | 5 | Pass |
| 51 | No subscription | 2 | Pass |
| 52 | Compare selected phone and backup folders on this device. | 9 | Pass |
| 53 | Do not wipe your phone yet: 1 file is missing and 1 has changed. | 13 | Pass — generated demo result |

### Headings and controls

All visible and conditional headings name their section. All controls use a
verb that names the result, except the explicitly prescribed demo controls
**Reset demo** and **Start for real**, which also state their outcome.

| Group | Labels | Result |
| --- | --- | --- |
| Navigation | Demo; Check folders; Privacy; Skip to verification | Pass |
| First actions | Try it with sample data; Check real folders; Read what this does not check | Pass |
| Folder work | Choose phone folder; Choose backup folder; Import backup record; Add another folder pair; Issue combined receipt | Pass |
| Receipt | Backup check complete; Matched files by category; Missing or changed files | Pass |
| Receipt actions | Download detailed receipt (JSON); Download issue list (CSV); Print receipt; Start another check | Pass |
| Explanation | How the folder check works; Choose folder pairs; Create file fingerprints; Keep the receipt | Pass |
| Remote/Android | Check a WebDAV or S3 backup; Choose remote backup provider; Choose folders with Android’s file picker | Pass |
| Paid history | Save receipt history; Buy Migration Kit — $7; Verify license; Saved receipt history; Clear receipt history | Pass |

### README sentences and fact lines

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
| 19 | Import or download a saved folder record, called a manifest in the file format. | 14 | Pass — defines the file-format term once |
| 20 | Download a detailed receipt (JSON), a spreadsheet-ready issue list (CSV), or print the receipt. | 14 | Pass |
| 21 | Resume an interrupted check from local browser storage. | 8 | Pass |
| 22 | “Start another check” clears it. | 5 | Pass |
| 23 | Use the installed web app offline after its first visit. | 10 | Pass |
| 24 | Folder checks and both downloads work offline. | 7 | Pass |
| 25 | Buy the optional $7 Migration Kit once. | 7 | Pass |
| 26 | It stores up to 20 receipt summaries on this device. | 10 | Pass |
| 27 | On Android, install a WebDAV or S3 document provider. | 10 | Pass |
| 28 | Choose its backup folder with the app’s remote provider button. | 10 | Pass |
| 29 | On the web, open the remote backup where it is mounted. | 11 | Pass |
| 30 | Download its backup folder record. | 5 | Pass |
| 31 | Move that JSON file to this device, then import it. | 11 | Pass |
| 32 | Before wiping your phone, open important files in every backup folder. | 11 | Pass |
| 33 | Keep two copies of files you cannot replace. | 8 | Pass |
| 34 | Download the current Android app package (APK). | 7 | Pass |
| 35 | Advanced users can also download APK checksums. | 7 | Pass |
| 36 | Android may ask you to allow installation from your browser or file manager. | 13 | Pass |
| 37 | The app requests read access only for folders you select. | 10 | Pass |
| 38 | Use Node.js 20 or newer. | 5 | Pass |
| 39 | Run unit, browser, mobile, accessibility, privacy, and offline checks: | 9 | Pass |
| 40 | The browser suite checks the 390 px layout and keyboard controls. | 11 | Pass |
| 41 | Run only the public claim tests: | 6 | Pass |
| 42 | Build the static site into dist/: | 6 | Pass |
| 43 | Preview it with npm run preview. | 6 | Pass |
| 44 | The Android release workflow uses JDK 21. | 8 | Pass |
| 45 | It builds a signed app package and an Android App Bundle (AAB). | 12 | Pass |
| 46 | The workflow restores the protected signing key. | 7 | Pass |
| 47 | It uses the run number for a higher version code. | 10 | Pass |
| 48 | Each release publishes checksums and the signing-certificate fingerprint. | 8 | Pass |
| 49 | Refresh the Capacitor Android project after a web build: | 9 | Pass |
| 50 | For a local release, provide android/app/release.keystore and the RELEASE_STORE_* values used by the workflow. | 14 | Pass |
| 51 | Run ./gradlew assembleRelease from android/. | 5 | Pass |
| 52 | The app has no analytics, ads, remote fonts, or third-party runtime scripts. | 12 | Pass |
| 53 | Core folder checks make no cross-origin request. | 7 | Pass |
| 54 | The browser stores active folder records in its local database so a check can resume. | 15 | Pass |
| 55 | It stores paid receipt summaries there too. | 7 | Pass |
| 56 | The browser stores the license and daily verdict separately. | 9 | Pass |
| 57 | License checks contact only the Sociobot billing API. | 8 | Pass |
| 58 | The Android app excludes private app state from cloud backup and device transfer. | 13 | Pass |
| 59 | See Privacy and Terms. | 4 | Pass |
| 60 | MIT. | 1 | Pass |
| 61 | See LICENSE. | 2 | Pass |

### Terminology

| Concept | Customer-facing term | Result |
| --- | --- | --- |
| Folder on the old phone | phone folder | Consistent |
| Corresponding copied folder | backup folder | Consistent |
| Successful comparison | matched | Consistent |
| Portable saved evidence | saved folder record; “manifest” appears once as the file-format name | Consistent |
| Complete comparison result | receipt | Consistent |
| Optional local paid feature | Migration Kit / receipt history | Consistent |

Technical terms are introduced after the plain result: fingerprint before
SHA-256, detailed receipt before JSON, issue list before CSV, app package before
APK, and Android App Bundle before AAB. Maintainer-only terms remain below the
user guide. There is no metaphor, mood heading, generic slogan, or marketing
adjective to flag.

## Earlier finding recheck

Every earlier finding was verified again on the live site and in current
source/tests. No finding was accepted merely because a polish report marked it
fixed.

| Earlier ID | Result | Live and code confirmation |
| --- | --- | --- |
| F-1-1 | Fixed | Live demo receipt/actions fit at y=178–700; `@claim:demo-sample-receipt` passed. |
| F-1-2 | Fixed | Hero says “which selected files match”; no restore promise exists. |
| F-1-3 | Fixed | Live offline fact is scoped; `@claim:offline-exports` passed. |
| F-1-4 | Fixed | Memory/battery benefit remains absent; only the tested hash boundary is stated. |
| F-1-5 | Fixed | Cloud-credential promise remains absent; provider instructions name the actual path. |
| F-1-6 | Fixed | Unverified signed application-ID copy remains absent. |
| F-1-7 | Fixed | `android-release-assets` lists and proves JDK 21, APK/AAB, checksums, and signing fingerprint. |
| F-1-8 | Fixed | Discarded test-APK warning remains absent. |
| F-1-9 | Fixed | Home, demo, legal, offline, and 404 have route-specific canonical/OG/Twitter metadata. |
| F-1-10 | Fixed | Every route has the same three-link nav and complete Privacy/Terms/Source footer. |
| F-1-11 | Fixed | Demo → Back restores home title, h1, state, announcement, and h1 focus. |
| F-1-12 | Fixed | README opening remains two short sentences. |
| F-1-13 | Fixed | Android and browser picker instructions remain separate. |
| F-1-14 | Fixed | Release guidance remains split; README maximum is 15 words. |
| F-1-15 | Fixed | Plain outcomes precede technical formats; customer and maintainer terms are separated. |
| F-1-16 | Fixed | Phone folder, backup folder, matched, folder record, and receipt remain consistent. |
| F-1-17 | Fixed | Heading remains “Matched files by category.” |
| F-1-18 | Fixed | Heading remains “Missing or changed files.” |
| F-1-19 | Fixed | Action remains “Verify license.” |
| F-1-20 | Fixed | Privacy h1 remains “How Android Backup Receipt handles your files.” |
| F-1-21 | Fixed | Footer says “Compare selected phone and backup folders on this device.” |
| F-1-22 | Fixed | Artwork provenance remains only in `.factory/design.md`. |
| F-1-23 | Fixed | Multiple pairs persist and export one combined receipt; tagged claim passed. |
| F-2-1 | Fixed | Browser Back restores the complete home document, not stale demo DOM. |
| F-2-2 | Fixed | Live Reset and Start for real delete the complete demo namespace and preserve real sentinels. |
| F-2-3 | Fixed | Untested automatic-reconnection promise remains absent. |
| F-2-4 | Fixed | `no-tracking-runtime` passed across every public route; live requests were same-origin. |
| F-2-5 | Fixed | Privacy scopes metadata wording to saved folder records. |
| F-2-6 | Fixed | Free copy names folder checks, folder records, receipt downloads, and printing; rejection test covers them. |
| F-2-7 | Fixed | Landing distinguishes Android’s picker from the browser picker. |
| F-2-8 | Fixed | Live demo says “1 file is missing and 1 has changed.” |
| F-2-9 | Fixed | Heading remains “Choose the matching backup folder.” |
| F-2-10 | Fixed | Action remains “Read what this does not check.” |
| F-2-11 | Fixed | 390 px guidance remains in developer testing, not the user guide. |
| F-2-12 | Fixed | Offline license wording uses “receipt history,” not “unlock the archive.” |
| F-3-1 | Fixed | `android-release-assets` passed and both APK/checksum live links redirect to build 13 assets. |
| F-3-2 | Fixed | Merchant/refund promises remain removed; tested expired/revoked/wrong-product behavior remains. |
| F-3-3 | Fixed | First screen shows privacy, offline, and price facts plus the adjacent sample result. |
| F-3-4 | Fixed | Android remote-provider control and browser folder-record handoff remain; tagged claim passed. |
| F-3-5 | Fixed | UI uses “Saved receipt history,” “Clear receipt history,” and “Both folder records ready.” |

## Structure, accessibility, and links

| Check | Result |
| --- | --- |
| Title pattern | PASS — plain route-specific titles, all under 60 characters |
| One h1, main, and `lang=en` | PASS on home, demo, privacy, terms, offline, and 404 |
| Description/canonical/OG/Twitter/favicon | PASS on every checked route |
| Designed 404 | PASS — real HTTP 404, `noindex`, product styling, home and demo exits |
| Deep links and Back | PASS |
| Route focus and announcement | PASS on demo, legal, offline, 404, and Back to home |
| Header/footer | PASS — consistent shell, both legal links, source, one-liner, version/build |
| Link crawl | PASS — internal links 200; APK/checksum 302 to build 13; checkout intentionally 303; mail links explicit |
| Axe | PASS — zero violations on all six route states |
| Console/page errors | PASS on valid routes; only the expected document 404 reports HTTP 404 |
| Runtime network privacy | PASS — no cross-origin request in cold home/demo flows |
| Reduced motion | PASS — media query active, auto scroll, 0.00001s button transition |
| Visual identity | PASS — distinctive inspection docket, lime status tags, hard rules/shadows, monospace evidence, original art |
| Build parity | PASS — live and clean-build `index.html` share SHA-256 `972108a8485fac06d9e97744f7b1793332ce339cf8c0d52d2af62251813346e3` |

The live page is not a generic SaaS template. Its neo-brutalist field docket
matches `.factory/design.md` and is recognisable at thumbnail size.

## Missed leverage

None. The brief-implied extensions are present: several folder pairs combine
into one receipt, saved folder records import/export, receipts export as JSON
and CSV, the Android app uses installed WebDAV/S3 document providers through
read-only SAF, and the website documents the remote folder-record handoff.
Deterministic file comparison does not benefit from an AI step, so omitting AI
is correct. No decorative AI or embedded provider key exists.

## Additional verification

- Clean-clone `npm test`: PASS — 20 Vitest tests and 21 Playwright tests.
- Clean-clone `npm run build`: PASS — `dist/` produced.
- Initial JavaScript: 33.78 kB raw / 11.99 kB gzip.
- Initial CSS: 18.81 kB raw / 4.66 kB gzip.
- Live route crawl: all rendered links resolve or intentionally redirect.
- Live valid routes: no console errors, page errors, overflow, missing alt text,
  missing landmark, or Axe violation.

## What would make this perfect

Nothing identified. The owner’s “actually nothing left to do” standard is met
for this round: zero findings, zero untested claims, no regressed history item,
and no brief-implied missing feature.
