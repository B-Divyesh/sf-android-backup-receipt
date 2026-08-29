# Adversarial first-read review 2 — Android Backup Receipt

## Verdict: FAIL

- Product: <https://android-backup-receipt.sociobot.in>
- Repository head reviewed: `6c6a9ef36a475b10d03b57afba57dd02ae303859`
- Live build: version `1.0.3`, build `9f78de63fd40`
- Reviewed: 29 August 2026 UTC
- Viewports: 390×844 and 1440×900, fresh Chromium contexts
- Findings: 2 blocking, 4 major, 6 minor

The cold first screen and one-click sample are clear. The product still fails
because browser Back puts demo content under the home URL, and Reset demo / Start
for real retain demo license and history data. There are also unlisted or
overbroad claims and copy defects. `PASS` requires zero findings.

## Cold first read, before scrolling

### 390×844

- What it does: compares selected Android phone folders with backup folders and
  produces a receipt showing which selected files match.
- For whom: Android owners moving phones before wiping the old phone.
- First click: **Try it with sample data**.

All three answers are visible before scrolling. Exact decisive text:

> “Check an Android backup before you wipe.”

> “For Android owners moving phones: compare selected folders, then get a
> receipt showing which selected files match.”

> “Try it with sample data”

The primary action and all three fact lines end inside the initial 844 px. The
page has no horizontal overflow.

### 1440×900

The same three answers, both first actions, the three fact lines, and the
product-specific inspection artwork are visible without scrolling. There is no
horizontal overflow.

## Findings

### Blocking

#### F-2-1 — Browser Back restores the home URL with stale demo content (F-1-11 regressed)

- Location: live `/` → **Try it with sample data** → browser Back.
- Exact result after Back: URL `/`, title **“Demo — Android Backup Receipt”**,
  h1 **“Review a sample backup receipt”**, visible demo banner, visible sample
  receipt, `data-demo="true"`, and announcement **“Demo — Android Backup
  Receipt”**. Reloading `/` finally restores the real home page.
- Code/test evidence: `src/main.ts` calls `history.pushState(..., '/demo')`
  immediately before `location.reload()`. Its `pageshow` handler only focuses
  the existing heading. The route test asserts only `/` and a focused h1 after
  Back, so the stale demo h1 satisfies it.
- Why this fails: the address bar says home while the page still shows an
  isolated sample. A visitor can mistake sample results for real state. Broken
  routing is explicitly blocking, and the earlier focus/back finding was only
  half-fixed.
- Concrete fix: use an ordinary navigation to `/demo`, or fully derive and
  re-render route state on `popstate`/`pageshow`. Extend the test to assert the
  home title and headline, hidden demo banner and receipt, `data-demo="false"`,
  correct announcement, and focused home h1 after Back.

#### F-2-2 — Reset demo and Start for real do not discard all demo data

- Location: live `/demo`; `#reset-demo`, `#start-real`, and `src/main.ts` demo
  handlers.
- Exact observed result: after adding a demo-prefixed license sentinel and one
  receipt-history record, **Reset demo** left `demo:sb_license:android-backup-receipt`
  and the history record intact. **Start for real** reached `/` but left the
  same token and history record intact.
- Code evidence: both handlers call `clearActiveInventories()`, which clears
  only the `active` object store. Neither clears the demo `history` store nor
  demo-prefixed localStorage keys.
- Why this fails: the demo contract says leaving demo discards demo data, and a
  control named Reset demo must reset the sandbox. A visitor can paste a real
  paid license into the demo; that credential remains after both advertised
  exits. Real storage remained untouched, but incomplete sandbox cleanup is
  still a weak demo and therefore blocking.
- Concrete fix: Reset demo and Start for real must clear the complete
  `demo:android-backup-receipt` database plus every product-owned `demo:`
  localStorage key before reseeding or leaving. Add a test that seeds demo
  active state, history, license, and verdict; asserts all are removed; and
  separately asserts real sentinels remain unchanged.

### Major

#### F-2-3 — Reconnection behavior is an unlisted claim

- Exact quote/location: offline banner, **“License checks resume when
  connected.”**
- Why this fails: no `.factory/claims.json` entry or tagged test covers the
  stored-token reconnection event. The offline claims cover reload and exports,
  not license verification on `online`.
- Concrete fix: add a `license-reconnect` claim whose test starts offline with a
  saved token, fires a real online transition against a recorded Sociobot
  response, and confirms one verification request and the resulting state; or
  remove the sentence.

#### F-2-4 — The README's no-tracking claim is broader than its registered test

- Exact quote/location: README, **“The app has no analytics, ads, remote fonts,
  or third-party runtime scripts.”**
- Why this fails: `local-only-files` records cross-origin requests only on
  `/demo`. It does not rule out same-origin analytics or cover home, legal, and
  offline routes. Its claim text mentions third-party scripts/services, not
  analytics, ads, or remote fonts.
- Concrete fix: list the complete claim and test all public routes' request
  logs plus built HTML/JS/CSS for tracking endpoints, ad code, remote font
  declarations, and third-party scripts. Otherwise narrow the README to the
  behavior the existing demo request test proves.

#### F-2-5 — The privacy page claims metadata is never read, but the test checks only stored fields

- Exact quote/location: `/privacy/`, **“The app does not read photo location,
  thumbnails, or hidden camera details.”**
- Why this fails: `local-metadata-storage` proves those fields are absent from
  demo IndexedDB. It does not prove the app never extracts or reads them. The
  hashing path necessarily reads file bytes, which can contain EXIF data; the
  meaningful promise is that metadata is not extracted or stored.
- Concrete fix: rewrite to **“Saved folder records do not include photo
  location, thumbnails, or hidden camera details.”** Keep it under
  `local-metadata-storage`, or add a fixture with EXIF/location data and assert
  no parser, UI output, export, or stored field exposes it.

#### F-2-6 — “Every download” is broader than the free-tier claim test

- Exact quote/location: optional history section, **“The complete folder
  checker and every download stay free.”**
- Why this fails: `license-revocation` checks that one receipt export remains
  enabled after rejection. It does not assert every receipt, CSV, folder-record,
  print, APK, or future download implied by “every download.”
- Concrete fix: write **“Folder checks, folder records, and receipt downloads
  are free.”** Then make the claim test exercise each named free output without
  a valid license.

### Minor

#### F-2-7 — The web workflow incorrectly names Android's picker

- Exact quote/location: landing **How the folder check works**, **“Android’s
  file picker controls what this app can read.”**
- Why this slows the first read: on the website, the control opens the browser's
  folder picker. The Android app uses Android's picker. README makes this
  distinction, but the landing instructions do not.
- Concrete rewrite: **“The Android app uses Android’s file picker. This website
  uses your browser’s folder picker.”**

#### F-2-8 — The demo's main warning has broken singular/plural grammar

- Exact quote/location: first demo screen, **“Do not wipe your phone yet: 1
  missing and 1 changed files need attention.”**
- Why this matters: the most important result sentence reads like an unfinished
  template at the point where the visitor is deciding whether it is safe to
  wipe a phone.
- Concrete rewrite: **“Do not wipe your phone yet: 1 file is missing and 1 has
  changed.”** Generate singular/plural variants for all counts.

#### F-2-9 — “Choose its backup folder” is not a self-contained heading

- Exact quote/location: second workspace card h3, **“Choose its backup
  folder.”**
- Why this fails: in a screen-reader heading list, “its” has no referent.
- Concrete rewrite: **“Choose the matching backup folder.”**

#### F-2-10 — “Honest” is promotional rather than useful action copy

- Exact quote/location: hero link, **“Read the honest limits.”**
- Why this fails: “honest” asks the visitor to trust a quality the copy should
  demonstrate. It does not name what the section contains.
- Concrete rewrite: **“Read what this does not check.”**

#### F-2-11 — A QA instruction is exposed as user guidance in README

- Exact quote/location: README User guide, **“Use the layout at 390 px and
  operate every control with a keyboard.”**
- Why this fails: readers do not choose a CSS viewport width, and “operate
  every control” is an internal acceptance requirement rather than a task.
- Concrete fix: remove it from the User guide. Keep 390 px and keyboard support
  in testing documentation and `responsive-keyboard`.

#### F-2-12 — An offline license message uses a banned software metaphor

- Exact quote/location: offline license status in `src/main.ts`, **“Saved
  license. Connect once to verify and unlock the archive.”**
- Why this fails: “unlock” is banned non-literal copy and does not name the
  result in the product's established term.
- Concrete rewrite: **“License saved. Connect once to verify it and use receipt
  history.”**

## Demo and sandbox verification

| Check | Result |
| --- | --- |
| Landing action reaches `/demo` in one click | PASS |
| First 390×844 demo screen shows the product in use | PASS — 50%, 2 matched, 1 missing, 1 changed, named files, warning, and export actions |
| Persistent demo banner | PASS |
| Reset restores the four-file sample | PASS |
| Real storage isolation | PASS — real localStorage sentinel and real IndexedDB record remained unchanged |
| Demo namespace | PASS — `demo:android-backup-receipt` and `demo:` localStorage keys |
| Reset/exit discards the complete demo namespace | **FAIL — F-2-2** |
| Core demo request log | PASS — same-origin requests only |
| Offline demo reload | PASS — banner and receipt remained visible |

## Claims verification

Every exact command in `.factory/claims.json` ran separately after
`git clone --local /work/repo` and `npm ci` in `/tmp/abr-review2.58W1HT`.
Each selected exactly one tagged test.

| Claim ID | Exact command | Result |
| --- | --- | --- |
| `demo-sample-receipt` | `npm run test:claims -- --grep @claim:demo-sample-receipt` | PASS |
| `resume-reset` | `npm run test:claims -- --grep @claim:resume-reset` | PASS |
| `local-only-files` | `npm run test:claims -- --grep @claim:local-only-files` | PASS |
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

No listed test fails. F-2-3 through F-2-6 are unlisted or more expansive than
their associated claim/test, so the product does not have zero untested claims.

## Copy audit

Counting method: whitespace-delimited words after removing Markdown link
syntax; an autolink counts as one word. Fact lines and generated receipt
sentences are included. Landing average: 8.4 words; maximum: 17. README average:
8.8 words; maximum: 15. No sentence exceeds 22 words. No static landing or
README sentence uses a banned marketing word; F-2-12 flags a generated status.

### Landing and demo sentences

| # | Sentence or fact line | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Offline mode. | 2 | Pass |
| 2 | Folder checks and receipt downloads still work. | 7 | Pass |
| 3 | License checks resume when connected. | 5 | F-2-3 |
| 4 | Demo — sample data, nothing is saved to your real check. | 11 | Pass |
| 5 | Four sample files show two matched, one missing, and one changed. | 11 | Pass |
| 6 | Check an Android backup before you wipe. | 7 | Pass |
| 7 | For Android owners moving phones: compare selected folders, then get a receipt showing which selected files match. | 17 | Pass |
| 8 | Local files stay on your device. | 6 | Pass |
| 9 | 4 files in the sample check | 6 | Pass |
| 10 | 2 downloads receipt and issue list | 6 | Pass |
| 11 | Choose each phone folder and its backup folder. | 8 | Pass |
| 12 | This device reads file details and creates fingerprints for comparison. | 10 | Pass |
| 13 | Select a folder such as DCIM, Download, or an app’s export folder. | 12 | Pass |
| 14 | Pick the matching folder on local or USB storage. | 9 | Pass |
| 15 | You can also import a saved folder record. | 8 | Pass |
| 16 | Your files do not leave this screen. | 7 | Pass |
| 17 | Start with a phone folder. | 5 | Pass |
| 18 | Files larger than 32 MiB use a clearly marked sampled SHA-256 fingerprint. | 12 | Pass; format follows plain description |
| 19 | A receipt covers only the folders selected now. | 8 | Pass |
| 20 | Open important files in each backup folder before wiping your phone. | 11 | Pass |
| 21 | Android’s file picker controls what this app can read. | 9 | F-2-7 |
| 22 | Add every phone and backup folder you want to check. | 10 | Pass |
| 23 | Files through 32 MiB use a complete fingerprint (SHA-256). | 9 | Pass; format follows plain description |
| 24 | Larger files use a clearly marked sampled fingerprint. | 8 | Pass |
| 25 | Download a detailed receipt (JSON) or a spreadsheet-ready issue list (CSV). | 11 | Pass; outcomes precede formats |
| 26 | Mount, sync, or download the remote backup folder before checking it here. | 12 | Pass |
| 27 | You can also import its saved folder record. | 8 | Pass |
| 28 | This does not back up your phone. | 7 | Pass |
| 29 | It checks selected photos, downloads, documents, and app-export folders. | 9 | Pass |
| 30 | It cannot see protected app data, messages, system settings, or unselected folders. | 12 | Pass |
| 31 | Matching file names and fingerprints show that copies agree now. | 10 | Pass |
| 32 | They cannot promise that a storage provider will keep them. | 10 | Pass |
| 33 | Keep two copies. | 3 | Pass |
| 34 | The Android app asks you to select each phone or backup folder. | 12 | Pass |
| 35 | It keeps read access only for folders you select. | 9 | Pass |
| 36 | It cannot scan your full device or protected app data. | 10 | Pass |
| 37 | Download the Android app package (APK). | 6 | Pass; acronym follows description |
| 38 | Advanced users can confirm its published fingerprint. | 7 | Pass |
| 39 | Open it on Android and allow installation from your browser or file manager if Android asks. | 16 | Pass |
| 40 | Choose each phone folder and backup folder in Android’s file picker. | 11 | Pass |
| 41 | Then issue one combined receipt. | 5 | Pass |
| 42 | Each release uses the same protected signing key and a higher Android version code. | 14 | Pass; `android-updates` |
| 43 | The complete folder checker and every download stay free. | 9 | F-2-6 |
| 44 | The $7 Migration Kit is a one-time purchase. | 8 | Pass; `migration-archive` |
| 45 | It saves up to 20 receipt summaries on this device for repeat checks. | 13 | Pass; `migration-archive` |
| 46 | One-time purchase. | 2 | Pass |
| 47 | Sociobot/Dodo is the merchant of record and handles refunds. | 9 | Pass; checkout and migration test |
| 48 | A refund revokes the license. | 5 | Pass; `license-revocation` |
| 49 | Compare selected phone and backup folders on this device. | 9 | Pass |
| 50 | Do not wipe your phone yet: 1 missing and 1 changed files need attention. | 14 | F-2-8 |
| 51 | All 4 selected files match. | 5 | Pass |
| 52 | Open important backup files before wiping your phone. | 8 | Pass |
| 53 | Checking remote storage? | 3 | Pass; question heading names the topic |
| 54 | Choose folders with Android’s file picker. | 6 | Pass; Android-app section heading |
| 55 | Have a license? | 3 | Pass |
| 56 | Paste it here. | 3 | Pass |
| 57 | Free folder checker active. | 4 | Pass |
| 58 | Built by Param Factory · Version 1.0.3 · Build 9f78de63fd40 · © 2026 Sociobot. | 11 | Pass |

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
| 12 | Demo data uses separate browser storage and never reads or writes your real check. | 14 | Pass; isolation assertion exists in `demo-sample-receipt` |
| 13 | Choose folders through Android’s file picker in the app. | 9 | Pass |
| 14 | The web version uses the browser’s folder picker. | 8 | Pass |
| 15 | Add several phone and backup folder pairs to one combined receipt. | 11 | Pass |
| 16 | Create a complete file fingerprint through 32 MiB. | 8 | Pass |
| 17 | Larger files use a clearly marked sampled fingerprint. | 8 | Pass |
| 18 | See matched, missing, changed, extra, and category totals for every folder pair. | 12 | Pass |
| 19 | Import or download a saved folder record, called a manifest in the file format. | 14 | Pass; jargon defined once |
| 20 | Download a detailed receipt (JSON), a spreadsheet-ready issue list (CSV), or print the receipt. | 14 | Pass |
| 21 | Resume an interrupted check from local browser storage. | 8 | Pass |
| 22 | “Start another check” clears it. | 5 | Pass |
| 23 | Use the installed web app offline after its first visit. | 10 | Pass |
| 24 | Folder checks and both downloads work offline. | 7 | Pass |
| 25 | Buy the optional $7 Migration Kit once. | 7 | Pass |
| 26 | It stores up to 20 receipt summaries on this device. | 10 | Pass |
| 27 | Use the layout at 390 px and operate every control with a keyboard. | 13 | F-2-11 |
| 28 | Mount, sync, or download a remote backup folder before checking it. | 11 | Pass |
| 29 | Before wiping your phone, open important files in every backup folder. | 11 | Pass |
| 30 | Keep two copies of files you cannot replace. | 8 | Pass |
| 31 | Download the current Android app package (APK). | 7 | Pass |
| 32 | Advanced users can also download its published fingerprint. | 8 | Pass |
| 33 | Android may ask you to allow installation from your browser or file manager. | 13 | Pass |
| 34 | The app requests read access only for folders you select. | 10 | Pass |
| 35 | Use Node.js 20 or newer. | 5 | Pass; maintainer section |
| 36 | Run unit, browser, mobile, accessibility, privacy, and offline checks. | 9 | Pass |
| 37 | Run only the public claim tests. | 6 | Pass |
| 38 | Build the static site into `dist/`. | 6 | Pass |
| 39 | Preview it with `npm run preview`. | 6 | Pass |
| 40 | The Android release workflow is configured for JDK 21. | 9 | Pass; maintainer section |
| 41 | It builds an app package and an Android App Bundle (AAB). | 11 | Pass; acronym defined |
| 42 | The workflow restores the protected signing key. | 7 | Pass |
| 43 | It uses the run number for a higher version code. | 10 | Pass |
| 44 | Each release includes checksums and the signing fingerprint. | 8 | Pass |
| 45 | Refresh the Capacitor Android project after a web build. | 9 | Pass |
| 46 | For a local release, provide `android/app/release.keystore` and the `RELEASE_STORE_*` values used by the workflow. | 14 | Pass; maintainer instruction |
| 47 | Run `./gradlew assembleRelease` from `android/`. | 5 | Pass |
| 48 | The app has no analytics, ads, remote fonts, or third-party runtime scripts. | 12 | F-2-4 |
| 49 | Core folder checks make no cross-origin request. | 7 | Pass; `local-only-files` |
| 50 | The browser stores active folder records in its local database so a check can resume. | 15 | Pass |
| 51 | It stores paid receipt summaries there too. | 7 | Pass |
| 52 | The browser stores the license and daily verdict separately. | 9 | Pass |
| 53 | License checks contact only the Sociobot billing API. | 8 | Pass; `migration-archive` |
| 54 | The Android app excludes private app state from cloud backup and device transfer. | 13 | Pass; `android-private-backup` |
| 55 | See Privacy and Terms. | 4 | Pass |
| 56 | MIT. | 1 | Pass |
| 57 | See LICENSE. | 2 | Pass |

### Headings, actions, terms, and generated states

- Result-naming actions pass: **Try it with sample data**, **Check real
  folders**, **Choose phone folder**, **Choose backup folder**, **Import backup
  record**, **Download phone folder record**, **Download backup folder record**,
  **Cancel scan**, **Add another folder pair**, **Issue combined receipt**,
  **Download detailed receipt (JSON)**, **Download issue list (CSV)**, **Print
  receipt**, **Start another check**, **Download current APK**, **Buy Migration
  Kit — $7**, **Verify license**, **Clear archive**, **Reset demo**, **Start for
  real**, and **Reload**.
- Self-contained headings pass except **Choose its backup folder** (F-2-9).
- The hero text link **Read the honest limits** fails useful-copy review
  (F-2-10).
- Customer terminology is otherwise consistent: **phone folder**, **backup
  folder**, **matched**, **saved folder record**, **receipt**, and **Migration
  Kit**. “Manifest” appears once as the file-format name.
- Generated error/status sentences are under 22 words. The offline license
  sentence uses banned “unlock” (F-2-12).

## Earlier-finding recheck

Every finding in `.factory/review-1.md` was checked against the live site and
current code, not merely against `.factory/polish-1.md`.

| Earlier ID | Current result | Evidence |
| --- | --- | --- |
| F-1-1 | Fixed | Demo receipt and both downloads fit in the first 390×844 screen. |
| F-1-2 | Fixed | Landing says “which selected files match.” |
| F-1-3 | Fixed | `offline-exports` exists and passed. |
| F-1-4 | Fixed | Memory/battery benefit removed. |
| F-1-5 | Fixed | Cloud-credential claim removed; mount/sync/download instruction remains. |
| F-1-6 | Fixed | Signed-build application-ID claim removed. |
| F-1-7 | Fixed | JDK/APK/AAB text is configuration/instruction; release claim is separately listed. |
| F-1-8 | Fixed | Rejected-v1.0.1 warning removed. |
| F-1-9 | Fixed | Route-specific title, canonical, description, OG, and Twitter data verified. |
| F-1-10 | Fixed | All public routes use the same three-link header and complete footer. |
| F-1-11 | **Regressed — F-2-1** | Back focuses a stale demo h1 under `/`; URL-only test misses it. |
| F-1-12 | Fixed | README opening is split; maximum README sentence is 15 words. |
| F-1-13 | Fixed | Android and browser picker sentences are split in README. |
| F-1-14 | Fixed | Release sentence is split into short maintainer statements. |
| F-1-15 | Fixed with new isolated copy defects | Formats follow plain descriptions; customer terms are defined. See F-2-7/F-2-12. |
| F-1-16 | Fixed | Core customer terms are consistent. |
| F-1-17 | Fixed | “Matched files by category.” |
| F-1-18 | Fixed | “Missing or changed files.” |
| F-1-19 | Fixed | “Verify license.” |
| F-1-20 | Fixed | Privacy h1 names the policy. |
| F-1-21 | Fixed | Footer says what is compared and where. |
| F-1-22 | Fixed | Artwork provenance removed from public copy. |
| F-1-23 | Fixed | Multiple pairs persist and produce per-pair and combined results. |

Earlier verification/polish history was also read. The old missing-demo,
placeholder-hash, update-signing, private-backup, write-permission, 404,
checkout, and rate-limit failures remain fixed in current code/live behavior.

## Structure, accessibility, links, and visual identity

| Check | Result |
| --- | --- |
| Route titles | PASS — home, Demo, Privacy, Terms, and designed 404 use the required patterns |
| One h1, `lang`, main/header/footer | PASS on every route |
| Meta description, canonical, OG/Twitter, favicon | PASS on every public route checked |
| Designed 404 | PASS — unknown route returns HTTP 404 with a styled way home |
| Deep links and route focus | PASS for direct demo/legal loads; **FAIL on Back — F-2-1** |
| Link crawl | PASS — internal routes, GitHub source, APK, checksum, and checkout resolve after redirects; mail links exempt |
| Security headers/CSP | PASS; `frame-ancestors` is a response header |
| Mobile layout | PASS — 390 px has no horizontal overflow |
| Accessibility | PASS — axe reported zero violations on home, demo, privacy, terms, and 404; reduced motion applied |
| Basic URL verifier | PASS — title, lang, h1, main, alts, and no console errors on the home page |
| First-load JavaScript | PASS — 32,802 B raw / 11.76 kB compressed |
| Visual identity | PASS — inspection-docket rules, hard shadows, acid-lime stamps, receipt columns, and original workbench art are distinct from a generic SaaS template |

`npm test` also passed: 16 Vitest tests and 19 Playwright tests. `npm run
build` produced `dist/`. The route test's incomplete Back assertions explain why
the automated suite passes despite F-2-1.

## Missed leverage and AI review

No additional feature finding. The product now supports several folder pairs,
portable folder records, JSON/CSV receipt export, print, offline use, and an
explicit mount/sync/download path for WebDAV or S3 folders. Those cover the
obvious import/export and self-hosted-backup leverage in the brief. Deterministic
file comparison does not benefit from an AI step, and no decorative AI or
provider key is present.

## What would make this perfect

There is work left. A perfect next round would:

1. make Back restore the real home document and assert the complete route state;
2. erase all demo-prefixed license, verdict, active, and history data on Reset
   and Start for real while preserving real sentinels;
3. list and test every privacy/reconnection/free-output claim at its exact
   scope; and
4. apply the six concrete copy rewrites in F-2-7 through F-2-12.

Then rerun every claim command, the full suite, the mobile/desktop cold read,
demo storage probes, route history, request log, link crawl, axe, and build from
scratch. Only a zero-finding rerun should pass.
