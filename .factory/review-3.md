# Adversarial first-read review 3 — Android Backup Receipt

## Verdict: FAIL

- Product: <https://android-backup-receipt.sociobot.in>
- Repository head reviewed: `c93ed6891217d50b6affab76fdf0f72aaea3fed7`
- Live build: version `1.0.3`, build `4008a35e8d05`
- Reviewed: 29 August 2026 UTC
- Viewports: 390×844 and 1440×900, fresh Chromium contexts
- Findings: 1 blocking, 3 major, 1 minor

The first read, populated demo, sandbox isolation, routes, accessibility, and
all 20 registered claim tests pass. The product still fails because an earlier
unlisted Android release claim is only half-fixed in README and is therefore a
blocking history regression. Billing copy also makes claims that the manifest
does not list or prove. `PASS` requires zero findings and no untested claim.

## Cold first read, before scrolling

### 390×844

- What it does: compares selected Android phone folders with backup folders
  before a wipe and produces a receipt showing which selected files match.
- For whom: Android owners moving phones.
- First click: **Try it with sample data**.

All three answers are visible without scrolling. The primary action and the
three current fact lines end at y=656 px, with no horizontal overflow.

Exact decisive text:

> “Check an Android backup before you wipe.”

> “For Android owners moving phones: compare selected folders, then get a
> receipt showing which selected files match.”

> “Try it with sample data”

### 1440×900

The same three answers, both first actions, the three fact lines, and the
inspection-table artwork are visible without scrolling. There is no horizontal
overflow. The visual identity is recognisably product-specific rather than a
generic SaaS template: warm docket paper, hard rules and shadows, lime
inspection marks, monospace evidence copy, and original phone-to-drive art.

## Findings

### Blocking

#### F-3-1 — Android release outputs remain unlisted and untested (F-1-7 reopened)

- Exact README quotes: **“The Android release workflow is configured for JDK
  21.”**, **“It builds an app package and an Android App Bundle (AAB).”**, and
  **“Each release includes checksums and the signing fingerprint.”**
- Related landing/README quote: **“Advanced users can confirm its published
  fingerprint.”** / **“Advanced users can also download its published
  fingerprint.”**
- Manifest/test evidence: `android-updates` claims stable signing secrets,
  increasing version codes, and immutable tags. Its unit test checks only
  signing-secret references, version-code configuration, tag text, and the
  absence of key generation or asset overwrite. It does not assert JDK 21,
  APK/AAB tasks, creation or publication of `SHA256SUMS`, creation or
  publication of the signing fingerprint, or the downloadable release asset.
- Why this blocks: F-1-7 previously identified the APK/AAB and JDK statement as
  unlisted. Splitting it into shorter sentences did not list or test the
  assertions. The history rule makes an unfixed or half-fixed earlier finding
  blocking again. A reader may rely on these release-integrity statements
  before sideloading an APK.
- Concrete fix: add an `android-release-assets` entry to `claims.json` and one
  tagged test that asserts JDK 21, both Gradle release tasks, both copied
  artifacts, `SHA256SUMS`, `SIGNING_CERT_SHA256.txt`, and publication under an
  immutable tag. If the page continues to call the checksum file a “published
  fingerprint,” test the downloaded asset and its label; otherwise use the
  clearer link text **“Download APK checksums.”** Remove any statement that the
  clean-clone sandbox cannot prove.

### Major

#### F-3-2 — Merchant and refund behavior are unlisted claims

- Exact landing quote: **“Sociobot/Dodo is the merchant of record and handles
  refunds. A refund revokes the license.”**
- Exact terms quote: **“Sociobot/Dodo is the merchant of record and handles
  payment and refunds. Refunded, expired, revoked, or wrong-product licenses
  cannot use receipt history.”**
- Why this is untested: `migration-archive` merely checks that the merchant
  sentence is rendered and uses a recorded valid verification response.
  `license-revocation` uses a recorded response with reason `revoked`; it does
  not test a refund event, expired license, wrong-product license, merchant
  identity, payment handling, or refund handling. Neither claim entry lists
  those promises.
- Concrete fix: list the exact billing assertions and add recorded gateway
  contract fixtures for refunded, expired, revoked, and wrong-product results.
  Assert that each result locks only receipt history. Remove the merchant/refund
  handling sentence from the landing page unless a sandboxed contract can prove
  it; keep necessary legal wording scoped and accurate in Terms.

#### F-3-3 — The first-screen fact strip omits offline and price facts

- Location: landing first screen.
- Exact current facts: **“Local files stay on your device”**, **“4 files in the
  sample check”**, and **“2 downloads receipt and issue list.”**
- Why this fails the required first-screen shape: the attached plain-words and
  site-structure contracts require three short privacy, offline, and price
  facts. Two current lines describe the sample instead, so a phone visitor
  cannot learn offline availability or the free/$7 boundary from the first
  screen. The demo action also lacks an adjacent result sentence.
- Concrete fix: use **“Files stay on this device”**, **“Works offline after the
  first visit”**, and **“Checks are free; history costs $7 once.”** Put **“Opens
  a four-file receipt with two problems”** beside the sample action. Keep the
  existing claim tests tied to each statement.

#### F-3-4 — The self-hosted destination path is delegated instead of supported

- Brief requirement: compare selected folders with an attached
  **“USB/WebDAV/S3 destination.”**
- Exact landing/README workaround: **“Mount, sync, or download the remote
  backup folder before checking it here.”**
- Why this is missed leverage: the target user explicitly relies on
  self-hosted backup. USB/local folders and saved folder-record import work,
  but the product gives no tested WebDAV/S3 or Android document-provider path.
  A normal user must already know how to expose or copy the remote folder before
  the checker becomes useful.
- Concrete feature: keep the SAF-only privacy constraint and add a guided
  **“Choose a remote backup provider”** path that opens Android’s document
  picker, explains that an installed WebDAV/S3 document provider is required,
  and verifies a remote tree through the same read-only inventory flow. Test it
  with a fixture `DocumentsProvider`. On the web, add a concrete saved-record
  handoff guide for producing/importing a manifest at the remote destination.
  No AI feature is warranted for deterministic file comparison.

### Minor

#### F-3-5 — Receipt history uses competing “history,” “archive,” and “inventory” terms

- Exact locations: heading **“Save receipt history”**; hidden state heading
  **“Receipt archive”**; action **“Clear archive”**; status **“Both inventories
  ready.”**
- Why this slows the task: README and the main section establish “receipt
  history” and “folder record.” “Archive” and “inventory” then require the
  visitor to infer that they mean those same things.
- Concrete rewrite: use **“Saved receipt history”**, **“Clear receipt history”**,
  and **“Both folder records ready.”** Reserve “inventory” for internal code.

## Demo and sandbox verification

| Check | Result |
| --- | --- |
| Landing action reaches `/demo` in one click | PASS |
| First 390×844 screen shows the populated product | PASS — receipt y=178–700; exports end at y=687 |
| Realistic sample | PASS — named Pixel 7 and USB-C folders; 2 matched, 1 missing, 1 changed, 1 extra, 50% |
| Persistent demo banner | PASS |
| Reset demo | PASS — reseeds two active sample records and clears history/license/extra demo keys |
| Start for real | PASS — deletes the entire demo database and returns to `/` |
| Real-data isolation | PASS — seeded real history and license survived Reset and exit unchanged |
| Core request log | PASS — same-origin only |
| Offline sample | PASS — service-worker-controlled receipt reloaded at 50% with both banners |
| Browser Back | PASS — restores home title/h1/state, hides demo UI, focuses and announces the home h1 |

## Claims verification

The repository was cloned locally to `/tmp/abr-review3.DngxCS/repo`, followed by
`npm ci`. Every exact command from `.factory/claims.json` ran separately. Each
selected exactly one tagged test and returned zero.

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
| `local-metadata-storage` | `npm run test:claims -- --grep @claim:local-metadata-storage` | PASS |
| `migration-archive` | `npm run test:claims -- --grep @claim:migration-archive` | PASS |
| `license-revocation` | `npm run test:claims -- --grep @claim:license-revocation` | PASS |
| `print-view` | `npm run test:claims -- --grep @claim:print-view` | PASS |
| `responsive-keyboard` | `npm run test:claims -- --grep @claim:responsive-keyboard` | PASS |
| `offline-reload` | `npm run test:claims -- --grep @claim:offline-reload` | PASS |
| `offline-exports` | `npm run test:claims -- --grep @claim:offline-exports` | PASS |

No listed claim test fails. F-3-1 and F-3-2 identify public claims outside the
manifest or broader than their registered tests, so the required zero-untested-
claim result is not achieved.

## Copy audit

Counting method: whitespace-delimited words after removing markup and
decorative arrows; an autolink counts as one word. Landing average: 9.1 words;
maximum: 17. README average: 8.7 words; maximum: 15. No sentence exceeds 22
words and no banned marketing adjective appears.

### Landing and demo sentences and fact lines

| # | Sentence or fact line | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Folder checks and receipt downloads still work. | 7 | Pass |
| 2 | Demo — sample data, nothing is saved to your real check. | 11 | Pass |
| 3 | Four sample files show two matched, one missing, and one changed. | 11 | Pass |
| 4 | Check an Android backup before you wipe. | 7 | Pass |
| 5 | For Android owners moving phones: compare selected folders, then get a receipt showing which selected files match. | 17 | Pass |
| 6 | Local files stay on your device. | 6 | F-3-3 with lines 7–8 |
| 7 | 4 files in the sample check | 6 | F-3-3 with lines 6 and 8 |
| 8 | 2 downloads receipt and issue list | 6 | F-3-3 with lines 6–7 |
| 9 | Choose each phone folder and its backup folder. | 8 | Pass |
| 10 | This device reads file details and creates fingerprints for comparison. | 10 | Pass |
| 11 | Select a folder such as DCIM, Download, or an app’s export folder. | 12 | Pass |
| 12 | Pick the matching folder on local or USB storage. | 9 | Pass |
| 13 | You can also import a saved folder record. | 8 | Pass |
| 14 | Your files do not leave this screen. | 7 | Pass |
| 15 | Start with a phone folder. | 5 | Pass |
| 16 | Files larger than 32 MiB use a clearly marked sampled SHA-256 fingerprint. | 12 | Pass; plain explanation precedes the method |
| 17 | A receipt covers only the folders selected now. | 8 | Pass |
| 18 | Open important files in each backup folder before wiping your phone. | 11 | Pass |
| 19 | The Android app uses Android’s file picker. | 7 | Pass |
| 20 | This website uses your browser’s folder picker. | 7 | Pass |
| 21 | Add every folder pair you want to check. | 8 | Pass |
| 22 | Files through 32 MiB use a complete fingerprint (SHA-256). | 10 | Pass |
| 23 | Larger files use a clearly marked sampled fingerprint. | 8 | Pass |
| 24 | Download a detailed receipt (JSON) or a spreadsheet-ready issue list (CSV). | 12 | Pass |
| 25 | Mount, sync, or download the remote backup folder before checking it here. | 12 | F-3-4 |
| 26 | You can also import its saved folder record. | 8 | Pass |
| 27 | This does not back up your phone. | 7 | Pass |
| 28 | It checks selected photos, downloads, documents, and app-export folders. | 9 | Pass |
| 29 | It cannot see protected app data, messages, system settings, or unselected folders. | 12 | Pass |
| 30 | Matching file names and fingerprints show that copies agree now. | 10 | Pass |
| 31 | They cannot promise that a storage provider will keep them. | 10 | Pass |
| 32 | Keep two copies. | 3 | Pass |
| 33 | The Android app asks you to select each phone or backup folder. | 12 | Pass |
| 34 | It keeps read access only for folders you select. | 9 | Pass |
| 35 | It cannot scan your full device or protected app data. | 10 | Pass |
| 36 | Download the Android app package (APK). | 6 | Pass |
| 37 | Advanced users can confirm its published fingerprint. | 7 | F-3-1 |
| 38 | Open it on Android and allow installation from your browser or file manager if Android asks. | 15 | Pass |
| 39 | Choose each phone folder and backup folder in Android’s file picker. | 11 | Pass |
| 40 | Then issue one combined receipt. | 5 | Pass |
| 41 | Each release uses the same protected signing key and a higher Android version code. | 14 | Pass under `android-updates` |
| 42 | Folder checks, folder records, and receipt downloads are free. | 9 | Pass |
| 43 | The $7 Migration Kit is a one-time purchase. | 8 | Pass |
| 44 | It saves up to 20 receipt summaries on this device for repeat checks. | 13 | Pass |
| 45 | Sociobot/Dodo is the merchant of record and handles refunds. | 9 | F-3-2 |
| 46 | A refund revokes the license. | 5 | F-3-2 |
| 47 | Compare selected phone and backup folders on this device. | 9 | Pass |

Generated sample result: **“Do not wipe your phone yet: 1 file is missing and
1 has changed.”** — 13 words, pass.

### Headings and action labels

All visible and conditional headings/actions name their section or result,
except the terminology conflict in F-3-5. Counts exclude decorative symbols.

| Labels | Word counts | Result |
| --- | --- | --- |
| Skip to verification; Demo; Check folders; Privacy; Reset demo; Start for real | 3; 1; 2; 1; 2; 3 | Pass |
| Try it with sample data; Check real folders; Read what this does not check | 5; 3; 6 | Pass; F-3-3 concerns missing adjacent result copy |
| Build a coverage receipt; Choose the phone folder; Choose phone folder | 4; 4; 3 | Pass |
| Choose the matching backup folder; Choose backup folder; Import backup record | 5; 3; 3 | Pass |
| Download phone folder record; Download backup folder record; Cancel scan | 4; 4; 2 | Pass |
| Add another folder pair; Issue combined receipt; Folder pairs in this check | 4; 3; 5 | Pass |
| Backup check complete; Matched files by category; Missing or changed files | 3; 4; 4 | Pass |
| Download detailed receipt (JSON); Download issue list (CSV); Print receipt; Start another check | 4; 4; 2; 3 | Pass |
| How the folder check works; Choose folder pairs; Create file fingerprints; Keep the receipt | 5; 3; 3; 3 | Pass |
| This does not back up your phone; Choose folders with Android’s file picker | 7; 6 | Pass |
| Download current APK; Save receipt history; Buy Migration Kit — $7; Verify license | 3; 3; 5; 2 | Pass |
| Receipt archive; Clear archive; Both inventories ready | 2; 2; 3 | F-3-5 |

### README sentences and fact lines

Code blocks and section titles are excluded. Command introductions are
included.

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
| 27 | Mount, sync, or download a remote backup folder before checking it. | 11 | F-3-4 |
| 28 | Before wiping your phone, open important files in every backup folder. | 11 | Pass |
| 29 | Keep two copies of files you cannot replace. | 8 | Pass |
| 30 | Download the current Android app package (APK). | 7 | F-3-1 for unlisted release availability |
| 31 | Advanced users can also download its published fingerprint. | 8 | F-3-1 |
| 32 | Android may ask you to allow installation from your browser or file manager. | 13 | Pass |
| 33 | The app requests read access only for folders you select. | 10 | Pass |
| 34 | Use Node.js 20 or newer. | 5 | Pass |
| 35 | Run unit, browser, mobile, accessibility, privacy, and offline checks: | 9 | Pass |
| 36 | The browser suite checks the 390 px layout and keyboard controls. | 11 | Pass |
| 37 | Run only the public claim tests: | 6 | Pass |
| 38 | Build the static site into dist/: | 6 | Pass |
| 39 | Preview it with npm run preview. | 6 | Pass |
| 40 | The Android release workflow is configured for JDK 21. | 9 | F-3-1 |
| 41 | It builds an app package and an Android App Bundle (AAB). | 11 | F-3-1 |
| 42 | The workflow restores the protected signing key. | 7 | Pass under `android-updates` |
| 43 | It uses the run number for a higher version code. | 10 | Pass under `android-updates` |
| 44 | Each release includes checksums and the signing fingerprint. | 8 | F-3-1 |
| 45 | Refresh the Capacitor Android project after a web build: | 9 | Pass for maintainer instructions |
| 46 | For a local release, provide android/app/release.keystore and the RELEASE_STORE_* values used by the workflow. | 14 | Pass for maintainer instructions |
| 47 | Run ./gradlew assembleRelease from android/. | 5 | Pass for maintainer instructions |
| 48 | The app has no analytics, ads, remote fonts, or third-party runtime scripts. | 12 | Pass under `no-tracking-runtime` |
| 49 | Core folder checks make no cross-origin request. | 7 | Pass under `local-only-files` |
| 50 | The browser stores active folder records in its local database so a check can resume. | 15 | Pass under `resume-reset` |
| 51 | It stores paid receipt summaries there too. | 7 | Pass under `migration-archive` |
| 52 | The browser stores the license and daily verdict separately. | 9 | Pass under `migration-archive` |
| 53 | License checks contact only the Sociobot billing API. | 8 | Pass under `migration-archive` |
| 54 | The Android app excludes private app state from cloud backup and device transfer. | 13 | Pass under `android-private-backup` |
| 55 | See Privacy and Terms. | 4 | Pass |
| 56 | MIT. | 1 | Pass |
| 57 | See LICENSE. | 2 | Pass |

## Structure, accessibility, and link crawl

| Check | Result |
| --- | --- |
| Titles | PASS — plain route-specific titles on home, demo, privacy, terms, offline, and 404 |
| One h1 / main / `lang=en` | PASS on every route |
| Description, canonical, OG/Twitter, favicon | PASS on every route |
| Designed 404 | PASS — HTTP 404, product styling, two ways back |
| Deep links and Back | PASS |
| Focus and announcement on route change | PASS |
| Header/footer | PASS — shared three-link nav; Privacy, Terms, Source, one-liner, version, build |
| Link crawl | PASS — every product HTTP link returned 200; `mailto:` links are explicit; test 404 excluded |
| Axe | PASS — zero violations on all six checked route states |
| Live console/page errors | PASS — none on valid routes; the expected document 404 was the only 404 console entry |
| Network privacy | PASS — no cross-origin runtime request in home/demo/core flow |
| Security headers | PASS — CSP header, `frame-ancestors 'none'`, HSTS, nosniff, referrer and permissions policies |
| `robots.txt` / `sitemap.xml` | PASS — sitemap lists home, demo, privacy, and terms |
| Visual identity | PASS — distinct inspection-docket system matches `.factory/design.md` |

## Earlier finding recheck

Every earlier finding was checked against production and current source.

| Earlier ID | Result now | Evidence |
| --- | --- | --- |
| F-1-1 | Fixed | Sample receipt and exports fit in the first phone screen. |
| F-1-2 | Fixed | Hero says “which selected files match,” not “what can be restored.” |
| F-1-3 | Fixed | `offline-exports` passed and live offline receipt reloaded. |
| F-1-4 | Fixed | No memory/battery benefit remains. |
| F-1-5 | Fixed | No cloud-credential collection claim remains. |
| F-1-6 | Fixed | Signed application-ID claim remains removed. |
| F-1-7 | **Half-fixed; reopened as F-3-1** | Shorter JDK/APK/AAB/checksum sentences remain outside the claim manifest/test. |
| F-1-8 | Fixed | Rejected test-APK warning remains removed. |
| F-1-9 | Fixed | Route-specific metadata verified live. |
| F-1-10 | Fixed | Shared header/footer verified on all routes. |
| F-1-11 | Fixed | Back restores complete home state and focus. |
| F-1-12 | Fixed | README opening remains split. |
| F-1-13 | Fixed | Android/browser picker instructions remain separate. |
| F-1-14 | Fixed | Release prose is split below 22 words, although F-3-1 still requires claim coverage. |
| F-1-15 | Fixed for prior terms | Outcomes precede unavoidable formats; F-3-5 is a separate terminology regression. |
| F-1-16 | Fixed for phone/backup/matched terms | Core comparison vocabulary is consistent. |
| F-1-17 | Fixed | “Matched files by category.” |
| F-1-18 | Fixed | “Missing or changed files.” |
| F-1-19 | Fixed | “Verify license.” |
| F-1-20 | Fixed | Privacy h1 names the policy. |
| F-1-21 | Fixed | Footer explains the comparison. |
| F-1-22 | Fixed | Artwork provenance remains out of public copy. |
| F-1-23 | Fixed | Multi-folder pairs persist and combine into one receipt. |
| F-2-1 | Fixed | Ordinary navigation and Back restore the right document/state. |
| F-2-2 | Fixed | Reset/exit remove the full demo namespace and preserve real storage. |
| F-2-3 | Fixed | Reconnection promise remains removed. |
| F-2-4 | Fixed | All-route `no-tracking-runtime` claim/test passed. |
| F-2-5 | Fixed | Privacy copy limits the statement to saved record fields. |
| F-2-6 | Fixed | Named free outputs are exercised after license rejection. |
| F-2-7 | Fixed | Android and browser picker paths are distinguished. |
| F-2-8 | Fixed | Sample warning uses correct singular grammar. |
| F-2-9 | Fixed | “Choose the matching backup folder.” |
| F-2-10 | Fixed | “Read what this does not check.” |
| F-2-11 | Fixed | 390 px QA instruction remains in developer testing only. |
| F-2-12 | Fixed | No non-literal “unlock” copy remains. |

## Additional verification

- Fresh clone `npm test`: PASS — 18 Vitest and 21 Chromium tests.
- Fresh clone `npm run build`: PASS — `dist/` produced; JavaScript 33.49 kB
  raw / 11.90 kB gzip.
- Cold valid routes: no console or page errors.
- Live site requests: same-origin for the core/demo flow; optional billing was
  not invoked during the privacy check.

## What would make this perfect

Close all five findings: fully inventory and test the Android release and
billing assertions; replace the first-screen facts with privacy, offline, and
price; provide a tested SAF-based self-hosted destination path; and use
“receipt history” / “folder record” consistently. Then rerun every claim from a
fresh clone and repeat the full cold mobile/desktop, demo, storage, offline,
route, link, copy, and history checks. There is nothing else identified in this
round.
