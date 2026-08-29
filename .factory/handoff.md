# Android Backup Receipt — polish round 1 handoff

## Outcome

All 23 findings in `.factory/review-1.md` are fixed. No earlier review or polish report existed in the base commit. The static PWA remains wrapped by the existing Capacitor Android project and is live at <https://android-backup-receipt.sociobot.in>.

Implementation commit: `bec5c98a47ea2dd4c772649175eb543636cfe57a`

Deployed build ID: `9f78de63fd40`

Azure Static Web Apps deployment ID: `f96d3271-b4a9-402e-9108-e0c2eaf80845`

## What changed

- `/demo` and `?demo=1` now open on the populated receipt, not the landing hero. At 390×844, all key counts, issue rows, and both downloads are visible without scrolling.
- Demo data remains isolated in `demo:android-backup-receipt`, with Reset demo and Start for real controls.
- Real checks accept several phone-folder/backup-folder pairs. One receipt contains per-pair results and combined counts, issues, categories, JSON, and CSV.
- Landing, README, guidance, receipt, privacy, and terms copy now use consistent plain terms. Untested restore, memory, battery, credential, signed-ID, and historical APK claims were removed or narrowed.
- Demo, privacy, terms, offline, and 404 have route-specific titles/metadata, consistent navigation/footer, h1 focus, polite announcements, legal links, and designed 404 handling.
- `.factory/claims.json` now has 18 unique claims and 18 unique test commands. New tests cover demo first-viewport placement, multiple folder pairs, and offline downloads.
- Version 1.0.3 updates the web app, manifest, Android configuration, and immutable Android release workflow.
- The field-inspection-docket identity, palette, typography, hard shadows, and reduced-motion policy remain intact. `.factory/design.md` records the demo-first extension.

The finding-by-finding mapping is in `.factory/polish-1.md`. The full sentence audit and terminology table are in `.factory/copy-audit.md`.

## Verification

From the working checkout:

- `npm ci` — passed; 149 packages, zero vulnerabilities.
- `npm test` — passed; 16 Vitest tests and 19 Chromium tests.
- Route-specific axe addition — passed on privacy, terms, and 404; live demo and all three routes have zero serious/critical findings.
- `npm run lint` — passed.
- `npm run build` — passed; `dist/` produced.
- `npm audit --omit=dev` — passed; zero vulnerabilities.
- `npx cap sync android` — passed.
- Local `./gradlew assembleDebug` — unavailable because this worker has no Java executable or `JAVA_HOME`.

The Android-capable GitHub runner completed the equivalent release path successfully:

- Actions run: <https://github.com/B-Divyesh/sf-android-backup-receipt/actions/runs/33264739610>
- Release: <https://github.com/B-Divyesh/sf-android-backup-receipt/releases/tag/android-v1.0.3-build-9>
- APK SHA-256: `706c53db9f1469382e2f94c5dd80711dba820096f5a6981556c4fc3ac9970308`
- AAB SHA-256: `85bbf9ea2849c3b396f374df2f47300d3fe9e6b7c0922ff528981b7cf0a30033`
- Both files matched `SHA256SUMS` and passed ZIP integrity.

Every claim command was also run separately after `git clone --local /work/repo` and `npm ci` in `/tmp/abr-claims-8cae3C`. All 18 passed with exactly one selected tagged test each.

## Browser, accessibility, privacy, offline, and performance evidence

- `/opt/fleet/lib/verify-url.sh` passed live: HTTPS 200, title, `lang=en`, one h1, main landmark, alt text, and zero console errors.
- Cold live mobile demo: receipt y=178–699.7 px; JSON and CSV actions end at y=634.7 px in a 390×844 viewport.
- Cold live home/demo used only product-origin requests. License verification remains the only disclosed optional cross-origin runtime request.
- Live service-worker-controlled demo reloaded offline and downloaded both receipt files while offline.
- Live privacy and terms returned 200. An unknown URL returned the designed page with HTTP 404. Each route passed metadata, focus, shell, axe, and overflow checks.
- CSP includes response-header `frame-ancestors 'none'`; HSTS, Permissions-Policy, nosniff, and DENY framing are present. Hashed assets cache immutable for one year; `sw.js` is no-store.
- JavaScript: 32,802 B raw / 11.76 kB gzip. CSS: 18,503 B raw / 4.60 kB gzip. Mobile hero: 28,160 B.
- Local Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.2 s, TBT 0 ms, CLS 0.
- Live Lighthouse: 100/100/100/100; FCP 0.9 s, LCP 1.1 s, TBT 0 ms, CLS 0.
- Local and live `index.html` SHA-256 matched: `a1379a9de980746fa9c624afa671881d0f2452e3d444dd93497fbc8da95b9313`.

Evidence is under `.factory/qa-evidence/polish-1/`, including the reproducible live probe and screenshots.

## Run and deploy

```sh
npm ci
npm test
npm run build
npx cap sync android
/opt/fleet/lib/deploy-static.sh android-backup-receipt dist
```

## Known gaps and next steps

None. No product or review finding remains open.

---

# Independent verification 5 — FAIL

Verified 2026-08-29 against <https://android-backup-receipt.sociobot.in>.

**Release status: FAIL (blocker).** The requested candidate
`c4c63dac10b677ba16baf526618760650e2d5fe1` does not exist in this clean clone
or after a fresh `git fetch --tags --prune origin`; Git reports it as an invalid
object. The live app is byte-for-byte the local `dist/` build of available
`c4c63dfca16cf8fd9804851634af1f9aeebd1d88`, but that cannot prove deployment
of the requested candidate.

All 18 claims, `npm test` (16 Vitest + 19 Playwright), lint, and production
build pass on the available source. The live one-click demo, privacy request
log, response headers, caching, desktop/390px keyboard checks, reduced motion,
and axe serious/critical checks pass. The optional Sociobot license endpoint
allowed 30 requests then returned 429 with `Retry-After` on 31–35. The only
unverified local build is `./gradlew assembleDebug`, because this deploy-none
container has no Java/JDK.

See `.factory/verification-5.md` for exact commands, evidence, and the sole
release-blocking defect. Next step: make the exact candidate SHA available in
origin and re-run the candidate/live identity check.
