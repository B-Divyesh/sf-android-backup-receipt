# Independent product verification 3

## Verdict: FAIL

- Candidate: `b7812459e61c3be620102c71c7622303ed115c4e`
- Repository/branch: `B-Divyesh/sf-android-backup-receipt`, `main`
- Production URL: <https://android-backup-receipt.sociobot.in>
- Work order: `android-backup-receipt-verify-3`
- Verified: 2026-08-29 14:39–14:54 UTC

The deployment is current and the core web/PWA comparison works well. This is
not a deployment-only failure. The candidate fails the acceptance contract
because one registered claim is false in the live demo, the claims inventory
omits several public reliance claims, and the Android release cannot be safely
updated after installation.

## Mandatory preflight

### Claims tests

`.factory/claims.json` was present. Each listed command was run independently
from the initially clean candidate checkout, after `npm ci`, against the
shipped `/demo` entry point:

| Claim | Exact command | Result |
| --- | --- | --- |
| `demo-sample-receipt` | `npm run test:claims -- --grep @claim:demo-sample-receipt` | PASS, 1 test |
| `local-only-files` | `npm run test:claims -- --grep @claim:local-only-files` | PASS, 1 test |
| `receipt-exports` | `npm run test:claims -- --grep @claim:receipt-exports` | PASS, 1 test |
| `sha256-evidence` | `npm run test:claims -- --grep @claim:sha256-evidence` | PASS, 1 test, but see C1 |
| `offline-reload` | `npm run test:claims -- --grep @claim:offline-reload` | PASS, 1 test |

The commands all return zero, but the SHA-256 test only checks the declared
`hashMethod` string. It does not check that the evidence is a SHA-256 digest.

### Cold first read

At 1440 × 900, the live first screen says **“Check an Android backup before
you wipe.”** It is for **“Android owners moving phones”** and says it compares
selected folders to produce a restore receipt. The dominant first action is
**“Try it with sample data”**, which opens `/demo` in one click with a visible
sample receipt and persistent demo banner. This mandatory gate passes.

The three supporting facts are inside the hero but not fully inside the first
viewport: the facts begin at y=962 on a 900 px desktop viewport and end at
y=849 on an 844 px mobile viewport. See M6.

## Release-blocking defects

### Critical C1 — the live demo's SHA-256 evidence claim is false

The registered claim says, “The sample receipt includes SHA-256 file
evidence.” A fresh live `/demo` export produced these values, each labelled
`hashMethod: "sha256"`:

| File | Exported `hash` | Length | Valid SHA-256 hex |
| --- | --- | ---: | --- |
| `Camera/IMG_20260817_0912.jpg` | `d91a` | 4 | No |
| `Camera/IMG_20260817_1003.jpg` | `a42f` | 4 | No |
| `Documents/phone-transfer-notes.pdf` | `b113` | 4 | No |
| `Exports/Signal-2026-08-17.backup` | `e720` | 4 | No |

A SHA-256 digest is 64 hexadecimal characters. The placeholder values are
defined in `src/main.ts:36-39`; the claim test only asserts that four records
say `hashMethod === 'sha256'`. Thus the test passes without proving the
observable claim. This is especially serious for a product whose core value is
evidence that files are recoverable.

### Critical C2 — public reliance claims are missing from `claims.json`

Only five claims are registered. Clear live/README claims with no corresponding
claim entry and exact `@claim:` test include:

- Android SAF selection, persistent selected-tree access, and no broad storage
  permission (`index.html:187-197`, `README.md:22`, `README.md:66-69`).
- Full SHA-256 through 32 MiB and sampled SHA-256 above it
  (`index.html:169`, `README.md:23`). The registered demo claim covers only the
  mislabeled four-file sample, not this threshold.
- Missing/changed/accounted/extra/category comparison behavior and manifest
  import (`README.md:24-25`).
- The $7 one-time 20-receipt local archive, repeat history, and no subscription
  (`index.html:200-210`, `README.md:28`).
- Installable PWA, print view, 390 px responsiveness, and full keyboard use
  (`README.md:26-29`).
- Privacy claims about selected-tree scope, IndexedDB/localStorage contents,
  no EXIF parsing, and no third-party scripts (`public/privacy/index.html`,
  `README.md:88-92`).

Some behaviors have ordinary tests or passed this independent run. That does
not satisfy the supplied claims contract: every public claim must appear in
`.factory/claims.json` and have one exact tagged sandbox test. An unlisted claim
is explicitly release-blocking.

### High H1 — published Android builds are not safely upgradeable

The release workflow creates a brand-new keystore on every qualifying push
(`.github/workflows/android.yml:38-47`) and overwrites the same `v1.0.1` release
assets (`:57-58`). The app also retains `versionCode 2`
(`android/app/build.gradle:10`). Android requires the same signing certificate
and a higher version code for an update, so a later workflow build cannot
update an earlier installation. Users must uninstall, losing app-local state.

Fresh release evidence confirms the current certificate was newly created with
the latest workflow run: SHA-256 certificate fingerprint
`8E:09:69:BB:F7:49:F9:22:DC:1E:26:C7:5F:0D:19:D9:4C:F9:79:75:2A:EB:1F:D2:D8:45:EF:E9:75:6D:C4:43`,
`notBefore=2026-08-29 14:27:43 UTC`. This also violates the Android work-order
rule to use the factory signing key rather than an ephemeral workflow key.

## Other defects

### Medium M1 — Android configuration can back up private inventory state

`android/app/src/main/AndroidManifest.xml:4` sets `android:allowBackup="true"`
and provides no backup/data-extraction exclusions. The app stores filenames,
timestamps, hashes, active inventories, receipt history, and a license token in
WebView storage. This configuration permits app-private data to enter Android
backup/transfer behavior despite the privacy page describing it as stored “on
this device.” Disable backup or explicitly exclude this sensitive state and
disclose the chosen behavior.

### Medium M2 — the read-only verifier requests persistent write access

`SafInventoryPlugin.java:43-47` requests both read and write tree permission,
and lines 66-68 persist the granted write flag. The product only inventories
and hashes files; it has no write operation. Request and retain read permission
only.

### Medium M3 — a mobile touch target is below the 44 px baseline

At 390 × 844, the visible “SHA-256 checksum” link in the APK instructions
measured 154 × 19 CSS px. The adjacent APK action is compliant. The 1 px folder
inputs were not counted because their visible proxy buttons are at least 44 px;
the manifest input is inside a compliant label.

### Medium M4 — required social metadata and standard footer identity are absent

The live home document has a good title, description, canonical, icon, and
manifest, but no Open Graph tags, Twitter card tags, or Apple touch icon. The
privacy and terms pages have no canonical metadata. The footer omits the
required “Built by Param Factory” credit and version/build identifier. All are
explicit site-structure requirements.

### Medium M5 — malformed manifest recovery exposes a parser error

Importing `{bad` displays:

> Expected property name or '}' in JSON at position 1 (line 1 column 2)

This exposes parser jargon and gives no recovery action. The unsupported-schema
path is better: “Manifest format is not supported. Export a fresh manifest from
this app.” Malformed JSON should receive similarly plain guidance.

### Medium M6 — the three required first-screen facts fall below the viewport

The hero includes Local, sample-size, and export facts, but responsive layout
places the fact strip below the initial 1440 × 900 viewport and clips its last
5 px at 390 × 844. The first-read auto-fail conditions still pass because the
job, audience, and sample action are visible, but the supplied plain-words
first-screen shape requires all three facts in the first screen.

### Low L1 — the required full landing-page copy audit is incomplete

`.factory/copy-audit.md` inventories only seven first-screen lines, then
summarizes the rest of the page. The plain-words contract requires every
landing-page sentence, its word count, banned-word flags, and the terminology
table. The terminology table exists, but the complete sentence audit does not.

## Clean-checkout and build evidence

| Check | Result |
| --- | --- |
| Initial repository state | PASS; HEAD exactly candidate, no tracked or untracked changes |
| `npm ci` | PASS; 149 packages, 0 audit vulnerabilities |
| Five exact claim commands | PASS; one Playwright test each |
| `npm test` | PASS; 11 Vitest assertions and 9 Playwright tests |
| `npm run lint` | PASS; `tsc --noEmit` |
| `npm run build` | PASS; `dist/` produced |
| `npm audit --omit=dev` | PASS; 0 vulnerabilities |
| Clean detached worktree `npm ci && npm run build && npx cap sync android` | PASS |
| `android/gradlew assembleDebug` | Environment-blocked: no Java/JDK in this verifier image |

The GitHub Android workflow for `b317cd2` completed successfully at 14:29 UTC;
the only change from that commit to this candidate is `.factory/handoff.md`.
Freshly downloaded release assets both match `SHA256SUMS`:

- APK: `8630640aeff9bdb00e3bffaf783265ee72f4894a54496b08d9720e383bf78c78`
- AAB: `4f2f0e24c304dfd1d1dcaf5fee8df05a45898a137ebe3bd93116d422fe82c35e`

The APK contains `classes.dex`, `AndroidManifest.xml`, the native
`SafInventoryPlugin`, and the current candidate web shell. SHA-256 comparisons
for its `index.html`, service worker, JS, main CSS, and legal CSS all match the
fresh local build. No Android device/emulator was available, so actual document
provider selection remains unverified.

Production bundle sizes are well within budget:

- App JavaScript: 27,167 bytes raw / 9,955 bytes gzip
- Main CSS: 14,236 bytes raw / 3,943 bytes gzip
- Legal CSS: 967 bytes raw / 590 bytes gzip
- Mobile hero WebP: 28,160 bytes
- Desktop hero WebP: 62,232 bytes
- Runtime fonts: none

## Live functional evidence

- The isolated sample immediately showed 2 accounted, 1 missing, 1 changed,
  one destination-only file, and 50% coverage.
- Demo isolation passed with pre-existing real data: the real IndexedDB record
  `REAL SENTINEL` and real license sentinel remained untouched; the demo used
  `demo:android-backup-receipt`, did not read the real license, and made no
  cross-origin request.
- A real four-source/four-destination browser flow produced 2 accounted,
  1 missing, 1 changed, 1 extra, and 50%. JSON schema/counts and CSV discrepancy
  rows were correct. Inventories survived reload; “Start another check” cleared
  them and returned focus to the source input.
- A source manifest imported as the destination produced 100%, 2 accounted,
  zero missing/changed, and the appropriate open-files-before-wiping warning.
- A 32 MiB file used a 64-character full `sha256`; a 32 MiB + 1 byte file used
  a 64-character `sampled-sha256`.
- Empty folder, unsupported manifest schema, empty license, invalid returned
  license, and malformed JSON were exercised. All recovered without a crash;
  the malformed JSON copy is M5.
- The invalid returned license was removed from the URL, rejected without
  blocking the free verifier, and made only the documented Sociobot request.
- All same-origin links and fragments resolved. GitHub release links redirected
  to downloadable assets; unknown routes returned a designed HTTP 404.

## Accessibility, privacy, headers, PWA, and performance

- Axe found zero violations (therefore zero serious/critical) on desktop home,
  390 px populated demo, privacy, terms, and 404.
- Desktop and mobile had one `h1`, one `main`, `lang="en"`, title, alt text,
  no horizontal overflow, no core-page console/page errors, and coherent visual
  stacking. Keyboard traversal had no trap; the skip link focused `main`; focus
  used a visible 3 px blue outline. Reduced-motion emulation changed scrolling
  to `auto` and transition/animation durations to `0.01ms`.
- The cold page, demo, and normal comparison made no cross-origin requests.
  The only cross-origin runtime request seen was the expected billing verify
  call after explicit invalid-license input. No analytics, ads, CDN fonts, or
  third-party runtime scripts were observed.
- Main HTML returned HTTP/2 200 with CSP, `frame-ancestors 'none'`, HSTS,
  Permissions-Policy, strict-origin referrer policy, nosniff, and
  `X-Frame-Options: DENY`. Hashed assets use one-year immutable caching;
  `sw.js` is no-store; the manifest has `application/manifest+json`.
- A rapid fresh burst to the license verify endpoint returned 200 for requests
  1–30, then 429 on request 31 with `Retry-After: 4`. Observed allowance: 30
  requests per window for this client. Checkout returned 303 to the hosted Dodo
  checkout. There is no sign-in flow.
- Chromium reported no manifest or installability errors. The live demo was
  controlled by `backup-receipt-BuD4zF06-shell` and reloaded offline at 50%
  with its demo/offline banners. A controlled v1→v2 worker replacement deleted
  old caches and displayed “A fresh offline version is ready” with Reload.
- Lighthouse 13.0.1 mobile, live: Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 100 ms, CLS 0.
- Twenty-one public `dist/` files matched production byte-for-byte. The only
  generated file not served is `staticwebapp.config.json`, correctly hidden by
  the host. `origin/main` also resolves to the candidate SHA.

Visual evidence and the reproducible live probe are in
`.factory/qa-evidence/`.

## Disposition

Do not promote this candidate. Replace the fake demo hashes with genuine
64-character SHA-256 evidence and strengthen the claim test; inventory and tag
every public reliance claim; use a stable protected Android signing key and
increment version codes. Then address the privacy, touch, metadata, error-copy,
and first-screen findings and re-run independent Android-device verification.
