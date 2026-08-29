# Android Backup Receipt — repair 3 handoff

## Independent verification 4: PASS

Candidate `7707453758139b581376ac14e631d41e2a76be19` passes independent clean
checkout QA against <https://android-backup-receipt.sociobot.in> on 2026-08-29.
All 16 exact claim commands, `npm test` (15 unit + 17 browser tests), lint,
and the production build passed. The locally generated public `dist/` matches
all 23 production files byte-for-byte and the live build is `62ab8aab61ac`.

Live evidence: cold first-read and one-click sample-demo gates pass; the demo
has no third-party requests or console/page errors; axe serious/critical is
zero; desktop and 390px mobile have no overflow; keyboard focus and reduced
motion work; and the service-worker demo reloads offline. The license verify
endpoint allowed 30 requests then returned 429 with `Retry-After` from request
31. The release APK SHA-256 matches its published checksum and contains the
candidate shell.

`npx cap sync android` passed. `./gradlew assembleDebug` was not runnable only
because this `deploy: none` container has no JDK (`JAVA_HOME` unset/no Java),
which is documented as an environment limitation, not a candidate defect.
Full evidence and exact results: `.factory/verification-4.md`.

## Status: repaired, pushed, packaged, and deployed

- Verifier report: `a632d5ddacd4adf00341f72e564aef8530b77202`
- Failed candidate: `b7812459e61c3be620102c71c7622303ed115c4e`
- Repair code deployed from: `e4f081e783daf4d7f991f626208271878117815e`
- Production: <https://android-backup-receipt.sociobot.in>
- Live build: `62ab8aab61ac`
- Android release: `android-v1.0.2-build-8`
- Work order: `android-backup-receipt-repair-3`
- Verified: 2026-08-29 UTC

## Findings repaired

1. **C1 — false SHA-256 demo evidence:** replaced every four-character or
   non-digest placeholder with a complete 64-character SHA-256 digest. The
   four source digests are reproducible from deterministic fixture streams of
   the stated sizes. Manifest import now rejects incomplete digest values.
   `@claim:sha256-evidence` independently recomputes every digest instead of
   trusting `hashMethod`.
2. **C2 — incomplete claims inventory:** expanded `.factory/claims.json` from
   5 to 16 public reliance claims. Every claim has exactly one tagged command,
   and all 16 commands pass independently. Coverage now includes SAF scope,
   the exact 32 MiB boundary, comparison/import classes, the local 20-receipt
   archive, print, installability/offline, keyboard/390px, stored fields,
   Android private-data backup exclusions, and update signing/version rules.
3. **H1 — unsafe Android updates:** removed per-run key generation and release
   overwrites. The workflow now fails closed without four encrypted Actions
   secrets, uses one protected signer, assigns `100000 + GITHUB_RUN_NUMBER` as
   `versionCode`, and creates a unique immutable release tag. Consecutive
   builds 5 and 6 used the same certificate while increasing version codes
   from `100005` to `100008` across the observed releases.
4. **M1 — private state eligible for Android backup:** set
   `android:allowBackup="false"` and added both legacy and Android 12+
   exclusions for databases, preferences, files, roots, and device transfer.
5. **M2 — unnecessary SAF write access:** removed request and persistence of
   `FLAG_GRANT_WRITE_URI_PERMISSION`. Selected-tree read access remains
   persistent where the provider supports it.
6. **M3 — small mobile checksum target:** the checksum link, manifest input,
   and license label now have at least 44px hit areas. The live mobile probe
   finds only the intentionally hidden 1px folder inputs; their visible proxy
   buttons exceed 44px.
7. **M4 — missing metadata/footer identity:** added Open Graph, Twitter card,
   a real 1200×630 product image, 180px Apple touch icon, legal-route
   canonicals, Param Factory credit, version, and a combined JS/CSS build ID.
8. **M5 — parser jargon:** malformed JSON now says, “That file is not valid
   JSON. Choose a manifest exported from this app.” The raw parser position is
   never exposed.
9. **M6 — first-screen facts below the fold:** fixed the root cause: the hero
   image's HTML height was overriding its aspect ratio. Explicit auto height
   and tighter first-screen spacing keep all three facts inside 1440×900 and
   390×844 viewports. Both sizes are regression-tested.
10. **L1 — incomplete copy audit:** `.factory/copy-audit.md` now lists every
    unique landing-page phrase, word count, result, and the terminology table.
    The longest sentence is 17 words and no banned term remains.

Passing comparison, export, demo isolation, checkout, billing, 404, CSP,
offline, visual identity, and privacy behaviors were retained.

## Clean local verification

The final matrix started with `npm ci` (149 packages, 0 vulnerabilities):

```sh
npm ci
npm test
npm run lint
npm run build
npx cap sync android
npm audit --omit=dev
```

- `npm test`: 15 Vitest unit/integration tests and 17 Chromium tests passed.
- Every one of the 16 commands in `.factory/claims.json` passed independently.
  Full output: `qa-evidence/repair-3/exact-claims.log`.
- Type check: passed with `tsc --noEmit`.
- Build: `dist/` produced; app JS 27,743 bytes raw / 10,372 bytes gzip;
  CSS 14,698 bytes raw / 4,033 bytes gzip. No runtime font download.
- Capacitor sync: passed against the final `dist/`.
- Dependency audit: 0 production vulnerabilities.
- Android workflow 8: success for exact head `e4f081e`; APK and AAB built with
  JDK 21 and the protected signer.

## Browser, accessibility, privacy, and offline evidence

- Factory `verify-url.sh`: HTTP 200, 832ms observed load, correct title/lang,
  one `h1`, one `main`, 0 missing alts, 0 unlabeled buttons, 0 console errors.
- Playwright + axe: 0 violations on desktop home, 390px populated demo,
  privacy, terms, and 404. Therefore serious/critical violations are 0.
- Desktop 1440×900 and mobile 390×844: no horizontal overflow; first-screen
  facts remain inside the viewport; mobile demo remains usable and coherent.
- Keyboard: skip link focuses `main`; visible blue focus treatment remains;
  folder controls operate from Enter; no trap. Reduced motion changes scrolling
  to `auto` and transition/animation duration to `0.01ms`.
- Privacy: the cold page, demo, and full real comparison made no cross-origin
  request. The license fixture records only the documented Sociobot verify URL.
  IndexedDB records contain exactly path, size, modified time, hash, and hash
  method—no content or EXIF field.
- Live offline: `/demo` reloaded while disconnected with its worker, banner,
  receipt, and 50% result intact and no error.
- Controlled worker update: old cache deleted, new combined-build cache took
  control, and “A fresh offline version is ready” appeared with Reload.
- Response policy: live CSP, `frame-ancestors 'none'`, HSTS, nosniff,
  Permissions-Policy, strict-origin referrer policy, and `X-Frame-Options: DENY`
  are present. Hashed assets cache immutable; `sw.js` is no-store; manifest MIME
  is correct; unknown routes return the designed HTTP 404.
- Live billing verify returned the documented invalid verdict and exact CORS
  origin. Checkout returned 303 to the hosted Dodo checkout.
- All fragments resolved. Source returned 200, release assets 302 to build 6,
  and checkout returned the expected 303.
- 23/23 public `dist/` files match production byte-for-byte. The host correctly
  keeps `staticwebapp.config.json` private.

Evidence is under `.factory/qa-evidence/repair-3/`.

## Performance

Lighthouse 13.0.1 mobile against production:

- Performance 100
- Accessibility 100
- Best Practices 100
- SEO 100
- FCP 1.0s; LCP 1.1s; TBT 30ms; CLS 0

## Android artifact evidence

- Workflow: <https://github.com/B-Divyesh/sf-android-backup-receipt/actions/runs/33261347922>
- APK SHA-256: `b1fb4844fea3c92c82bced749925f1291b456928857a720147c52a03fc8fa536`
- AAB SHA-256: `41022092bfc5e85fd2e77fef8c90b97abe90b7b7f38fc94359cf935b75e8e167`
- APK Signature Scheme v2 verification: passed.
- Certificate SHA-256: `A6:10:61:7B:7B:34:3A:B0:A6:18:03:A2:AD:B5:EF:EC:25:56:57:4B:04:71:09:3A:64:E3:A8:04:2B:8F:3B:01`; the
  fingerprint extracted from the APK exactly matches the published file and
  the preceding build 5 certificate.
- Parsed manifest: package `in.sociobot.androidbackupreceipt`, version code
  `100008`, version name `1.0.2.8`, target SDK 35, `allowBackup=false`, and no
  broad storage permission.
- APK `index.html`, service worker, JS, and CSS match final local `dist/`
  byte-for-byte. The APK includes `classes.dex` and the native SAF plugin.

## Deployment

The final `dist/` was deployed with:

```sh
/opt/fleet/lib/deploy-static.sh android-backup-receipt /work/repo/dist
```

Azure Static Web Apps deployment `a3e703bf-abe4-4529-be20-6bd8ea57aba5`
succeeded in the existing Central US app. The custom domain immediately served
build `62ab8aab61ac` over HTTPS.

## Known constraints and next steps

- The discarded private key from the rejected `v1.0.1` test release cannot be
  recovered. That test APK must be removed once before installing the current
  stable-key line; this is disclosed in README. Builds 5 through 8 prove that
  subsequent in-place upgrades have one signer and increasing version codes.
- The worker identity lacks permission to create Key Vault secrets. The stable
  keystore exists only as encrypted GitHub Actions secrets; temporary plaintext
  material was securely shredded. A vault administrator should escrow the
  product key and configure Key Vault-backed Actions access without rotating
  the signer.
- This static-deploy worker has no Android emulator or physical document
  provider. Native packaging, signature, manifest, embedded assets, and bridge
  code were verified; a later device matrix should exercise picker persistence
  across Google Files, Samsung My Files, USB, and a remote document provider.
