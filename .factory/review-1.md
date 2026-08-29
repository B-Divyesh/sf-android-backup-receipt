# Adversarial first-read review 1 — Android Backup Receipt

## Verdict: FAIL

- Product: <https://android-backup-receipt.sociobot.in>
- Repository head reviewed: `fde2c44ebc02d15ba1b0165b9ff54c751fc6c418`
- Reviewed: 2026-08-29 UTC
- Viewports: 390×844 and 1440×900, fresh Chromium contexts
- Findings: 1 blocking, 7 major, 15 minor

The cold landing screen is clear and the underlying demo is isolated and
functional. The review still fails because the first screen after the demo
click repeats the landing hero; the populated receipt is multiple screens
below it. A visitor cannot see the product being used without scrolling. The
page also contains unlisted or incompletely tested claims, route metadata and
navigation inconsistencies, copy defects, and one brief-implied multi-folder
gap. `PASS` requires zero findings.

## Cold first read, before scrolling

### 390×844

- What it does: compares selected Android folders with a backup and produces a
  receipt showing matched, missing, and changed files.
- For whom: Android owners moving phones before wiping the old phone.
- First click: **Try it with sample data**.
- Result: all three answers are clear before scrolling. The headline, audience
  sentence, both actions, and all three facts are visible in the first 844 px.

### 1440×900

The same three answers are clear. The first screen includes the original
inspection-table artwork and all three fact lines. There is no horizontal
overflow at either viewport.

Exact first-screen text:

> “Check an Android backup before you wipe.”

> “For Android owners moving phones: compare selected folders, then get a
> receipt showing what can be restored.”

> “Try it with sample data”

The basic first-read gate passes, subject to the overclaim in F-1-2.

## Findings

### Blocking

#### F-1-1 — The demo does not show the product in use on its first screen

- Location: primary action **Try it with sample data** → live `/demo`.
- Exact first screen after the click: the demo banner followed by the complete
  landing hero, including the same headline and the same demo button.
- Evidence: at 390×844 the receipt begins at y=2,776 px; at 1440×900 it begins
  at y=1,899 px. Both pages load at `scrollY=0`. The active element is `BODY`.
- Why this fails: the required first screen must already show realistic sample
  data being used. Here it only says sample data exists. A 30-second visitor
  must scroll through the hero and folder controls to discover the 50% result.
- History: this is a half-fix of verification-2 finding **C2**. The one-click
  route and isolated sample now exist, but the required first-screen result is
  still absent.
- Concrete fix: make `/demo` a demo-first layout. Put the persistent banner,
  50% receipt, 2 accounted / 1 missing / 1 changed summary, issue rows, and
  export actions inside the first viewport. Focus its demo heading after
  navigation. Remove or move the repeated landing hero below the receipt.
  Strengthen `@claim:demo-sample-receipt` so it clicks the landing CTA and
  asserts that the receipt intersects the initial 390×844 viewport without a
  scroll.

### Major

#### F-1-2 — The first screen makes an unlisted restore claim

- Quote: “get a receipt showing what can be restored.”
- Location: landing lede, before the fold.
- Why this misleads: the product compares paths and fingerprints. It does not
  restore or open each file, and its own receipt tells the user to open files
  before wiping. No claim entry proves restoreability.
- Concrete fix: use “get a receipt showing which selected files match,” and
  keep the existing warning to open important destination files.

#### F-1-3 — Offline export is claimed but not tested offline

- Quote: “Folder checks and exports still work.”
- Location: offline banner; README also says “Offline checks and exports after
  the first visit”.
- Why this is untested: `offline-reload` verifies an offline reload and visible
  sample receipt. `receipt-exports` verifies downloads while online. No listed
  claim test exports JSON or CSV after `context.setOffline(true)`.
- Concrete fix: add an `offline-exports` claim and test that downloads both
  files after a service-worker-controlled page is taken offline, or narrow the
  copy to the behavior currently tested.

#### F-1-4 — The memory and battery benefit is an unlisted claim

- Quote: “Large files use a disclosed sampled fingerprint to protect memory
  and battery.”
- Location: empty guidance under the folder controls.
- Why this is unlisted: `hash-boundary` proves the 32 MiB method boundary and
  digest shape, not lower memory use or battery protection.
- Concrete fix: write “Files larger than 32 MiB use a clearly marked sampled
  SHA-256 fingerprint,” or add measured memory and energy tests with stated
  bounds.

#### F-1-5 — The cloud-credential statement has no claim entry

- Quote: “Direct cloud credentials are intentionally not collected by this
  static v1.”
- Location: WebDAV/S3 note; repeated in README as “The static v1 deliberately
  does not collect cloud credentials.”
- Why this is unlisted: the same-origin request test does not inspect forms,
  IndexedDB, or localStorage for credential fields or values.
- Concrete fix: add a `no-cloud-credentials` claim that checks the rendered
  controls and all storage, or remove this implementation-detail sentence and
  say only what to do: “Mount or sync the remote folder before checking it.”

#### F-1-6 — The signed-build application ID claim is unlisted

- Quote: “The signed Android build has application ID
  `in.sociobot.androidbackupreceipt`.”
- Location: README, Android APK section.
- Why this is unlisted: no claim entry checks the published signed APK's parsed
  manifest for this application ID.
- Concrete fix: add a release-artifact claim that downloads the current APK,
  verifies its checksum, and parses its package ID; otherwise remove “signed”
  and document the Gradle configuration as development information.

#### F-1-7 — The APK/AAB and JDK build claim is unlisted

- Quote: “The release workflow builds both APK and AAB with JDK 21.”
- Location: README, Android APK section.
- Why this is unlisted: `android-updates` searches workflow/Gradle source for
  signing and version strings. It does not assert a completed APK and AAB built
  with JDK 21.
- Concrete fix: list this claim and verify both immutable release assets and
  workflow provenance, or rewrite as an instruction: “The release workflow is
  configured for JDK 21.”

#### F-1-8 — The rejected APK update warning is unlisted

- Quote: “The rejected `v1.0.1` test APK used a discarded workflow key and
  cannot update in place.”
- Location: README, Android APK section.
- Why this matters: this is an operational warning a user may rely on before
  uninstalling. It has no claims entry or reproducible certificate comparison.
- Concrete fix: add a fixture or release-artifact test comparing the rejected
  certificate to the current signer, or move the historical note to the
  handoff/release notes and keep only the actionable uninstall instruction.

### Minor

#### F-1-9 — Route metadata is incomplete and `/demo` has the wrong canonical

- `/demo`: title changes correctly, but canonical remains `/`, and OG/Twitter
  title and URL still describe the home page.
- `/privacy/` and `/terms/`: canonical and favicon exist, but OG and Twitter
  metadata are absent.
- designed 404: meta description, canonical, OG, and Twitter metadata are
  absent.
- Why this matters: shared demo/legal links describe the wrong page or have no
  route-specific preview.
- Concrete fix: emit route-specific canonical, OG, and Twitter values for all
  routes. Use `Demo — Android Backup Receipt` for `/demo`; add a concise 404
  description and a noindex-compatible canonical policy.

#### F-1-10 — Header and footer structure is not consistent across routes

- Home/demo header: wordmark plus Verify, How it works, and Migration Kit.
- Privacy/terms/404 header: only “← Backup / Receipt”.
- Privacy footer contains only Terms; terms footer contains only Privacy.
- Legal/404 footers omit the product one-liner and Source link.
- Why this matters: the standard skeleton requires a consistent wordmark/nav
  and both Privacy and Terms links on every route.
- Concrete fix: reuse one header/footer component or static partial on home,
  demo, privacy, terms, offline, and 404. Include both legal links on every
  footer and preserve the build ID.

#### F-1-11 — Route changes do not move focus or announce the new page

- Evidence: home → demo and browser Back both leave `document.activeElement`
  on `BODY`; `/demo` has no route announcement. Back does restore the URL and
  title correctly.
- Why this matters: keyboard and screen-reader users do not land at the new
  route's heading, as required by the route contract.
- Concrete fix: give each route's h1 `tabindex="-1"`, focus it after route
  load/navigation, and announce the route title in a polite live region. Add a
  browser test for demo, legal pages, and Back.

#### F-1-12 — README opening sentence exceeds 22 words

- Quote (24 words): “Android Backup Receipt is for Android owners moving phones
  who need evidence that selected photos, documents, downloads, and app-export
  folders reached a backup destination.”
- Concrete rewrite: “Android Backup Receipt is for Android owners moving
  phones. It checks whether selected files reached a backup folder.”

#### F-1-13 — README feature bullet exceeds 22 words

- Quote (25 words): “Android Storage Access Framework folder selection in the
  APK (with persistent selected-tree access when the provider supports it),
  plus browser folder selection in the PWA”
- Concrete rewrite: “Choose folders through Android's file picker in the app.
  The web version uses the browser's folder picker.”

#### F-1-14 — README release sentence exceeds 22 words

- Quote (32 words): “It restores the factory-managed signing key from protected
  repository secrets, assigns a higher Android version code from the workflow
  run number, and creates an immutable release with checksums and the
  signing-certificate fingerprint.”
- Concrete rewrite: “The workflow restores the protected signing key. It uses
  the run number for a higher version code. Each release includes checksums and
  the signing fingerprint.”

#### F-1-15 — Customer copy uses unexplained technical jargon

- Locations: “JSON + CSV”, “SHA-256”, “32 MiB”, “manifest”, “WebDAV or S3?”,
  “APK”, “PWA”, “IndexedDB”, “ACTION_OPEN_DOCUMENT_TREE”, “AAB”, “JDK 21”,
  “keystore”, and “localStorage”.
- Why this slows a first read: several terms appear before a plain description,
  and the README mixes user instructions with maintainer internals.
- Concrete fix: lead with the outcome, then put the format in parentheses:
  “Download a detailed receipt (JSON) and discrepancy spreadsheet (CSV)” and
  “Create a file fingerprint (SHA-256)”. Split README into User guide and
  Maintainer release notes, defining unavoidable acronyms once.

#### F-1-16 — The same concepts use competing terms

- Source concept: “phone folder”, “source folder”, and “original evidence”.
- Destination concept: “backup evidence”, “matching destination”, “copied
  folder”, and “destination folder”.
- Successful result: demo banner says “found”; receipt says “accounted for”.
- Why this matters: a first-time user must infer that each set of labels means
  the same thing.
- Concrete fix: use “phone folder”, “backup folder”, and “matched” throughout.
  Reserve “source manifest” and “backup manifest” for exported files only.

#### F-1-17 — “By category” is not a self-contained heading

- Location: completed receipt.
- Why this fails: in a screen-reader heading list it does not say what is being
  grouped.
- Concrete rewrite: “Matched files by category”.

#### F-1-18 — “Needs attention” is not a self-contained heading

- Location: completed receipt.
- Why this fails: it names a mood, not the content under it.
- Concrete rewrite: “Missing or changed files”.

#### F-1-19 — “Verify” does not name the button's result

- Location: Migration Kit license form.
- Why this fails: the adjacent navigation also uses “Verify” for folder checks,
  so the label is ambiguous.
- Concrete rewrite: “Verify license”.

#### F-1-20 — The privacy h1 is a slogan, not a page heading

- Quote: “Your files stay yours.”
- Location: `/privacy/`.
- Why this fails: it does not name the policy when heard outside page context.
- Concrete rewrite: “How Android Backup Receipt handles your files”.

#### F-1-21 — The footer one-liner is abstract rather than useful

- Quote: “Local-first evidence for Android moves.”
- Location: home/demo footer.
- Why this fails: “local-first evidence” is jargon and does not state the job.
- Concrete rewrite: “Compare selected phone and backup folders on this device.”

#### F-1-22 — The artwork provenance line is not useful landing copy

- Quote: “Original generated illustration; no stock imagery.”
- Location: home/demo footer.
- Why this fails: it does not help a visitor check a backup and would survive
  unchanged on another product page.
- Concrete fix: remove it from the public footer; retain provenance in
  `.factory/design.md`.

#### F-1-23 — One receipt cannot cover the separate folder roots implied by the brief

- Location: real workflow and Android bridge; each check accepts one source
  tree and one destination tree.
- Why this is missed leverage: photos, Downloads, and app-export folders often
  live under separate SAF roots. The brief says “chosen SAF folders” and the
  page itself names all three, but a normal user must issue unrelated receipts.
- Concrete feature: let the user add multiple phone-folder/backup-folder pairs
  to one check, show per-pair errors, and export one combined receipt. Keep each
  SAF grant read-only. No AI feature is warranted; import/export is the useful
  leverage here.

## Demo and sandbox verification

| Check | Result |
| --- | --- |
| Landing action reaches `/demo` in one click | PASS |
| First screen visibly shows the populated product | **FAIL — F-1-1** |
| Realistic sample | PASS — four named files, 2 matched, 1 missing, 1 changed, 1 extra, 50% |
| Persistent demo banner | PASS |
| Reset demo | PASS — restores the same receipt |
| Start for real | PASS — returns to `/` with an empty real check in a clean context |
| Real-data isolation | PASS — seeded real IndexedDB and license sentinel survived demo Reset unchanged and reappeared only after Start for real |
| Storage namespace | PASS — `demo:android-backup-receipt` and `demo:` license keys |
| Request log | PASS — home and demo flow used same-origin requests only |
| Live offline reload | PASS — service-worker-controlled `/demo` reloaded at 50% with the banner and receipt |

## Claims verification

All exact commands from `.factory/claims.json` were run independently after
`git clone --local /work/repo …` and `npm ci` in a fresh temporary clone.

| Claim ID | Exact command | Result |
| --- | --- | --- |
| `demo-sample-receipt` | `npm run test:claims -- --grep @claim:demo-sample-receipt` | PASS, 1 test |
| `resume-reset` | `npm run test:claims -- --grep @claim:resume-reset` | PASS, 1 test |
| `local-only-files` | `npm run test:claims -- --grep @claim:local-only-files` | PASS, 1 test |
| `receipt-exports` | `npm run test:claims -- --grep @claim:receipt-exports` | PASS, 1 test |
| `sha256-evidence` | `npm run test:claims -- --grep @claim:sha256-evidence` | PASS, 1 test |
| `hash-boundary` | `npm run test:unit -- -t @claim:hash-boundary` | PASS, 1 test |
| `comparison-manifest` | `npm run test:claims -- --grep @claim:comparison-manifest` | PASS, 1 test |
| `saf-read-only` | `npm run test:unit -- -t @claim:saf-read-only` | PASS, 1 test |
| `android-private-backup` | `npm run test:unit -- -t @claim:android-private-backup` | PASS, 1 test |
| `android-updates` | `npm run test:unit -- -t @claim:android-updates` | PASS, 1 test |
| `local-metadata-storage` | `npm run test:claims -- --grep @claim:local-metadata-storage` | PASS, 1 test |
| `migration-archive` | `npm run test:claims -- --grep @claim:migration-archive` | PASS, 1 test |
| `license-revocation` | `npm run test:claims -- --grep @claim:license-revocation` | PASS, 1 test |
| `print-view` | `npm run test:claims -- --grep @claim:print-view` | PASS, 1 test |
| `responsive-keyboard` | `npm run test:claims -- --grep @claim:responsive-keyboard` | PASS, 1 test |
| `offline-reload` | `npm run test:claims -- --grep @claim:offline-reload` | PASS, 1 test |

The commands return zero, but F-1-2 through F-1-8 identify public statements
that are absent from the inventory or not covered at the claimed combination.
There is therefore no zero-untested-claim result.

## Copy audit

Counting method: whitespace-delimited words after removing Markdown syntax;
an autolink counts as one word. UI fragments are included separately because
headings and controls also have to pass the plain-words rules.

### Landing-page sentences

| # | Sentence | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Check an Android backup before you wipe. | 7 | Pass |
| 2 | Offline mode. | 2 | Pass |
| 3 | Folder checks and exports still work. | 6 | F-1-3 |
| 4 | License verification will resume when connected. | 6 | Pass |
| 5 | Demo — sample data, nothing is saved to your real check. | 10 | Pass |
| 6 | Four sample files show two found, one missing, and one changed. | 11 | F-1-16 |
| 7 | For Android owners moving phones: compare selected folders, then get a receipt showing what can be restored. | 17 | F-1-2 |
| 8 | Choose matching folder roots. | 4 | Pass |
| 9 | We read filenames, sizes, dates, and file content only long enough to hash them in this browser. | 17 | F-1-15 |
| 10 | Select a folder such as DCIM, Download, or an app’s export folder. | 12 | Pass |
| 11 | Pick the copied folder on USB/local storage, or import a manifest made on the destination. | 15 | F-1-15, F-1-16 |
| 12 | Your files do not leave this screen. | 7 | Pass |
| 13 | Start with the source folder. | 5 | F-1-16 |
| 14 | Large files use a disclosed sampled fingerprint to protect memory and battery. | 12 | F-1-4 |
| 15 | A receipt proves only the folders selected at this time. | 10 | Pass |
| 16 | Open a few important files on the destination before wiping your phone. | 12 | F-1-16 |
| 17 | Android’s file picker controls what this app can read. | 9 | Pass |
| 18 | Protected app data stays protected. | 5 | Pass |
| 19 | Files through 32 MiB use full SHA-256. | 7 | F-1-15 |
| 20 | Larger files use clearly marked, low-memory sampled SHA-256. | 8 | F-1-15 |
| 21 | Export JSON for machine-readable evidence or CSV for inspection. | 9 | F-1-15 |
| 22 | Sync or download the destination folder, then choose it here. | 10 | F-1-16 |
| 23 | Alternatively, run this app where the destination is mounted and export its manifest. | 13 | F-1-15 |
| 24 | Direct cloud credentials are intentionally not collected by this static v1. | 11 | F-1-5 |
| 25 | This does not back up your phone. | 7 | Pass |
| 26 | It verifies user-selected photos, downloads, documents, and app-export folders. | 9 | Pass |
| 27 | It cannot see protected app data, messages inside apps, system settings, or anything you do not select. | 17 | Pass |
| 28 | Matching filenames and bytes are strong evidence, not a guarantee that a remote provider will retain them forever. | 17 | F-1-15 |
| 29 | Keep two copies of irreplaceable files. | 6 | Pass |
| 30 | Inspect folders with Android’s own picker. | 6 | Pass |
| 31 | The Android app asks you to select each source or destination tree. | 12 | F-1-16 |
| 32 | It keeps read access only for that selected tree. | 9 | Pass |
| 33 | It cannot scan your full device or protected app data. | 10 | Pass |
| 34 | Download the APK and confirm the published SHA-256 checksum. | 9 | F-1-15 |
| 35 | Open it on Android and allow installation from your browser or file manager if Android asks. | 15 | Pass |
| 36 | Choose the phone folder and its copied destination in the Android file picker, then issue the receipt. | 17 | F-1-16 |
| 37 | Each release uses the same protected signing key and a higher Android version code. | 13 | Covered by `android-updates` |
| 38 | The complete verifier and every export stay free. | 8 | Covered by `license-revocation` |
| 39 | The $7 Migration Kit is a one-time purchase. | 8 | Covered by `migration-archive` |
| 40 | It saves up to 20 receipt summaries on this device for repeat checks. | 13 | Covered by `migration-archive` |
| 41 | One-time purchase. | 2 | Covered by `migration-archive` |
| 42 | Sociobot/Dodo is the merchant of record and handles refunds. | 9 | Covered by `migration-archive` |
| 43 | A refund revokes the license. | 5 | Covered by `license-revocation` |
| 44 | Local-first evidence for Android moves. | 5 | F-1-21 |
| 45 | Original generated illustration; no stock imagery. | 6 | F-1-22 |
| 46 | Built by Param Factory. | 4 | Pass |

No landing sentence exceeds 22 words and no banned marketing word appears.

### Landing headings and controls

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to verification | 3 | Pass |
| Backup / Receipt | 2 | F-1-16 |
| Verify | 1 | Pass as section link |
| How it works | 3 | Pass |
| Migration Kit | 2 | Pass |
| Local only | 2 | Pass |
| Reset demo | 2 | Pass |
| Start for real | 3 | Pass |
| Android backup check | 3 | Pass |
| Try it with sample data | 5 | Pass |
| Check real folders | 3 | Pass |
| Read the honest limits | 4 | Pass |
| Build a coverage receipt | 4 | Pass |
| Original evidence | 2 | F-1-16 |
| Choose the phone folder | 4 | Pass |
| Choose source folder | 3 | F-1-16 |
| Export source manifest | 3 | F-1-15, F-1-16 |
| Backup evidence | 2 | F-1-16 |
| Choose the matching destination | 4 | F-1-16 |
| Choose destination | 2 | F-1-16 |
| Import manifest | 2 | F-1-15 |
| Export destination manifest | 3 | F-1-15, F-1-16 |
| Cancel scan | 2 | Pass |
| Compare and issue receipt | 4 | Pass |
| Backup check complete | 3 | Pass |
| By category | 2 | F-1-17 |
| Needs attention | 2 | F-1-18 |
| Export receipt (.json) | 3 | F-1-15 |
| Export details (.csv) | 3 | F-1-15 |
| Print receipt | 2 | Pass |
| Start another check | 3 | Pass |
| How the folder check works | 5 | Pass |
| You point to folders | 4 | Pass |
| Your browser fingerprints files | 4 | F-1-15; inaccurate in the native app |
| You keep the receipt | 4 | Pass |
| WebDAV or S3? | 3 | F-1-15 |
| Save receipt history | 3 | Pass |
| Download current APK | 3 | F-1-15 |
| Buy Migration Kit — $7 | 5 | Pass |
| Verify | 1 | F-1-19 as license button |
| Receipt archive | 2 | Pass |
| Clear archive | 2 | Pass |

### README sentences and feature lines

| # | Copy | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Check an Android backup before you wipe. | 7 | Pass |
| 2 | Android Backup Receipt is for Android owners moving phones who need evidence that selected photos, documents, downloads, and app-export folders reached a backup destination. | 24 | F-1-12 |
| 3 | It inventories two user-selected folder trees and computes SHA-256 evidence on the device. | 13 | F-1-15 |
| 4 | It compares paths and content, then exports a JSON receipt and CSV discrepancy list. | 14 | F-1-15 |
| 5 | This is a verifier, not a backup engine. | 8 | Pass |
| 6 | It cannot access protected Android app data. | 7 | Pass |
| 7 | Production URL: URL | 3 | Pass |
| 8 | Try the one-click isolated sample at URL. | 7 | Pass, subject to F-1-1 |
| 9 | It opens a four-file backup check with two accounted files, one missing file, and one changed file. | 17 | Pass |
| 10 | Demo state uses `demo:android-backup-receipt` IndexedDB and never reads or writes your real check. | 14 | F-1-15 |
| 11 | Android Storage Access Framework folder selection in the APK (with persistent selected-tree access when the provider supports it), plus browser folder selection in the PWA | 25 | F-1-13, F-1-15 |
| 12 | Full SHA-256 for files through 32 MiB; disclosed sampled SHA-256 for larger files | 13 | F-1-15 |
| 13 | Missing, changed, accounted-for, extra, and category totals | 7 | Pass |
| 14 | Portable source/destination manifests for mounted or synced WebDAV/S3 data | 11 | F-1-15, F-1-16 |
| 15 | JSON receipt, CSV discrepancy export, and print view | 8 | F-1-15 |
| 16 | Offline checks and exports after the first visit, plus an installable PWA | 12 | F-1-3, F-1-15 |
| 17 | Optional $7 one-time Migration Kit license for a 20-receipt local archive | 11 | Pass |
| 18 | Responsive 390 px layout and full keyboard operation | 8 | Covered by `responsive-keyboard` |
| 19 | For WebDAV or S3, sync/download or mount the relevant remote folder first, then select it. | 16 | F-1-15 |
| 20 | The static v1 deliberately does not collect cloud credentials. | 9 | F-1-5 |
| 21 | Requires Node.js 20 or newer. | 5 | Pass in developer section |
| 22 | Run all unit, mobile flow, accessibility, and offline tests: | 9 | Pass |
| 23 | Run the public reliance-claim checks only: | 6 | Pass |
| 24 | Create the exact static deployment output: | 6 | Pass |
| 25 | Preview the production output with `npm run preview`. | 8 | Pass |
| 26 | The signed Android build has application ID `in.sociobot.androidbackupreceipt`. | 8 | F-1-6 |
| 27 | It uses Android’s Storage Access Framework (`ACTION_OPEN_DOCUMENT_TREE`) for both source and destination folders. | 17 | F-1-15 |
| 28 | It persists read access to the selected trees and does not request write or broad storage access. | 17 | Covered by `saf-read-only` |
| 29 | Download the current APK and SHA-256 checksum. | 7 | F-1-15 |
| 30 | Android may ask you to allow installation from the browser or file manager that opened the APK. | 17 | F-1-15 |
| 31 | The release workflow builds both APK and AAB with JDK 21. | 11 | F-1-7, F-1-15 |
| 32 | It restores the factory-managed signing key from protected repository secrets, assigns a higher Android version code from the workflow run number, and creates an immutable release with checksums and the signing-certificate fingerprint. | 32 | F-1-14, F-1-15 |
| 33 | Refresh native assets after a web build with: | 8 | Pass in maintainer section |
| 34 | For a local Android release build, provide `android/app/release.keystore` and the `RELEASE_STORE_*` environment variables used by the workflow. | 20 | F-1-15 |
| 35 | Then run `./gradlew assembleRelease` from `android/`. | 8 | Pass in maintainer section |
| 36 | The rejected `v1.0.1` test APK used a discarded workflow key and cannot update in place. | 15 | F-1-8, F-1-15 |
| 37 | Remove that test build once before installing the current APK. | 10 | Pass |
| 38 | Current and future releases share the protected signer and update normally. | 11 | Covered by `android-updates` |
| 39 | The app has no analytics, ad pixels, remote fonts, or third-party runtime scripts. | 13 | Covered by `local-only-files` |
| 40 | The two active inventory summaries are stored in IndexedDB so a check can resume; “Start another check” clears them. | 19 | F-1-15; covered by `resume-reset` |
| 41 | Paid archive summaries also use IndexedDB; the license and daily verification verdict use localStorage. | 14 | F-1-15; covered by `migration-archive` |
| 42 | License verification talks only to the Sociobot billing API. | 9 | F-1-15; covered by `migration-archive` |
| 43 | The Android package excludes this private state from Android cloud backup and device transfer. | 14 | Covered by `android-private-backup` |
| 44 | See /privacy and /terms. | 4 | Pass |
| 45 | MIT. | 1 | Pass |
| 46 | See LICENSE. | 2 | Pass |

## Structure, links, accessibility, and visual identity

| Check | Result |
| --- | --- |
| Titles | PASS — home, demo, privacy, terms, and 404 follow the required patterns |
| One h1 / `lang` / `main` | PASS on every tested route |
| Meta/canonical/OG/favicon | FAIL — F-1-9 |
| Designed 404 | PASS — styled HTTP 404 with home/demo recovery links |
| Deep links and Back | PASS; all fragments resolve and Back restores home |
| Focus on route change | FAIL — F-1-11 |
| Dead-link crawl | PASS — all internal links 200; release links 302 to assets; checkout 303 to hosted checkout; source 200 |
| Header/footer skeleton | FAIL — F-1-10 |
| Visual identity | PASS — distinctive inspection-docket layout, hard rules/shadows, acid-lime tags, original product-specific art; not a generic SaaS template |
| Mobile targets | PASS — no visible target below 44 px |
| Axe | PASS — zero violations on home, populated demo, privacy, terms, and 404 |
| Console | PASS on 200 routes; only the expected document 404 resource message on the deliberate 404 probe |
| Reduced motion | PASS in the declared browser suite |
| AI | PASS — no decorative AI, provider key, or AI-shaped job exists |

The 404, legal routes, and sitemap work. `/demo` is listed in the sitemap. The
only route-level failures are the metadata, shared skeleton, and focus behavior
listed above.

## Earlier-finding audit

No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists. Every
finding in the four verification reports and the handoff was rechecked.

| Earlier report / ID | Current result | Evidence |
| --- | --- | --- |
| verification 1 C1 — no Android product | FIXED | Current APK link resolves; downloaded APK is a valid ZIP and matches published SHA-256 `b1fb…536`; native SAF bridge exists |
| verification 1 H1 — checkout broken | FIXED | Live checkout returns 303 to hosted Dodo checkout |
| verification 1 H2 — no rate limit | FIXED | Invalid requests 1–30 returned 200; 31–35 returned 429 |
| verification 1 M1 — missing response hardening | FIXED | Live CSP, frame denial, HSTS, permissions policy, nosniff, and referrer policy present |
| verification 1 M2 — small touch targets | FIXED | No visible target below 44 px at 390×844 |
| verification 1 M3 — weak asset caching | FIXED | Hashed assets use immutable caching; worker is no-store |
| verification 1 L1 — axe landmark issue | FIXED | Live axe reports zero violations on all tested routes |
| verification 1 L2 — manifest MIME | FIXED | `application/manifest+json` configured and tested |
| verification 2 C1 — claims file missing | FIXED | 16 entries exist; every exact command passed |
| verification 2 C2 — no one-click sample demo | **HALF-FIXED / BLOCKING** | Route, sample, banner, reset, and isolation exist; first screen still hides the product result — F-1-1 |
| verification 2 M1 — no designed 404 | FIXED | Live unknown path returns designed HTTP 404 |
| verification 3 C1 — false demo hashes | FIXED | Four source digests are complete and independently reproduced by passing claim test |
| verification 3 C2 — incomplete claims inventory | REGRESSED IN COPY | Original enumerated claims now pass, but new/uncovered public claims remain — F-1-2 through F-1-8 |
| verification 3 H1 — unsafe Android updates | FIXED for configured release line | Protected signing/version/tag test passes; current APK checksum matches release |
| verification 3 M1 — Android private state backed up | FIXED | `android-private-backup` passes |
| verification 3 M2 — unnecessary SAF write access | FIXED | `saf-read-only` passes |
| verification 3 M3 — small mobile checksum target | FIXED | 44 px target probe passes |
| verification 3 M4 — missing social/footer identity | PARTLY REGRESSED | Home is fixed; legal/demo/404 metadata and shared footer remain incomplete — F-1-9/F-1-10 |
| verification 3 M5 — parser jargon | FIXED | Exact plain recovery message is regression-tested |
| verification 3 M6 — first-screen facts below fold | FIXED | Three facts are visible at both review viewports |
| verification 3 L1 — incomplete copy audit | REGRESSED | Existing audit omits README and misses current copy flags; this review provides the full audit |
| verification 4 — no defects | SUPERSEDED | This adversarial review uses the stricter first-visible-demo and exhaustive-copy checks above |

The handoff's Android device-matrix limitation remains a known verification
gap, not a new claim-test failure in this container.

## Other verification evidence

- `npm ci`: 149 packages, zero vulnerabilities reported.
- `npm test`: PASS — 15 unit/integration and 17 Chromium tests.
- `npm run build`: PASS — `dist/` produced; JS 27.74 kB raw / 10.36 kB gzip;
  CSS 14.70 kB raw / 4.02 kB gzip.
- `npm run lint`: PASS.
- Factory `verify-url.sh`: PASS — HTTP 200, 826 ms observed load, correct
  title/lang, one h1, main present, no missing alt, no unlabeled button, no
  console error.
- Live release APK SHA-256 matches `SHA256SUMS`; ZIP integrity passes.
- Live response headers satisfy the declared security policy.
- The product's import/export workflow is useful. No AI addition would improve
  the core verification job enough to justify sending file data to a model.

## What would make this perfect

There is no optional polish list while findings remain. A perfect next round
would put the populated demo receipt in the first viewport, remove or test
every uncovered claim, repair route metadata/focus/shared navigation, accept
multiple folder pairs in one receipt, and clear every copy flag above. Then
rerun this entire checklist from a fresh context and clean clone; the required
result is zero findings, not merely no blockers.
