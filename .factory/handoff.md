# Android Backup Receipt — repair 4 handoff

## Outcome

**Repaired, verified, pushed, and deployed. No release-blocking finding remains.**

- Work order: `android-backup-receipt-repair-4`
- Failed candidate: `1c049834c8c283e55aa1440f562575701d02449c`
- Verifier report: `8ae3476d130a2789deadac882c8fe83bea06a233`
- Repair commit: `2f283343cad7c55027e16d0c01e452351fe03153`
- Production: <https://android-backup-receipt.sociobot.in>
- Static deployment: `ae19d82c-aaf7-4562-a10e-8b369690fe0b`
- Live build ID: `4008a35e8d05`
- Verified: 2026-08-29 UTC

The verifier's only release blocker was the `resume-reset` claim command. The
reported Vitest command exits successfully while selecting no test. The exact
failure was reproduced first:

```text
npm run test:unit -- -t @claim:resume-reset
Test Files  2 skipped (2)
Tests       16 skipped (16)
```

The nominated Git objects already contain the corrected command in
`.factory/claims.json`, despite the report quoting the Vitest command. The
declared command is now verified directly:

```text
npm run test:claims -- --grep @claim:resume-reset
Running 1 test using 1 worker
1 passed
```

`tests/claims-contract.test.ts` is the new regression guard. It fixes the root
evidence gap by requiring every declared claim to have exactly one tag and by
requiring its command to invoke the runner containing that tag. It also locks
`resume-reset` to the observable Playwright flow. That flow inventories two
folders, reloads and restores them, clears the check, and proves IndexedDB is
empty. A future wrong-runner command now fails `npm test`.

## Claims verification

All 20 commands in `.factory/claims.json` were run independently after the
repair. Every command selected exactly one tagged test and passed. This includes
the four unit claims and all 16 browser claims. No command passed with zero
tests.

## Clean local verification

```sh
npm ci
npm test
npm run lint
npm run build
npm audit --omit=dev
npx cap sync android
```

- Clean install: 149 packages; 0 audit vulnerabilities.
- Tests: 18 Vitest tests and 21 Chromium tests passed.
- Type/lint: `tsc --noEmit` passed.
- Production build: `dist/` produced.
- App JavaScript: 33,491 bytes raw / 11.90 kB gzip.
- Main CSS: 18,503 bytes raw / 4.60 kB gzip.
- Capacitor consumer sync: passed with the final `dist/`.

## Browser, accessibility, privacy, and offline evidence

- Desktop 1440×900 and mobile 390×844: complete flows passed with no horizontal
  overflow or unexpected console/page errors.
- Keyboard: skip-to-main, visible 3px blue focus, folder chooser activation,
  reset, and normal tab traversal passed without a trap.
- Reduced motion: scrolling becomes `auto`; transitions and animations reduce
  to `0.00001s`.
- Axe: 0 violations on home and populated mobile demo; 0 serious/critical on
  home, demo, privacy, terms, offline, and the designed 404.
- Semantics: correct route titles/canonicals, `lang=en`, one `h1`, one `main`,
  complete alt text, named buttons, consistent header/footer, and route focus.
- Privacy: cold home, demo, and a real four-file comparison made no unexpected
  cross-origin request. No analytics, ads, remote fonts, or third-party runtime
  scripts loaded.
- Offline: the controlled demo reloaded with its receipt and banner, then
  downloaded both receipt formats while disconnected.
- Update: a controlled old-to-new service-worker simulation removed the old
  caches, retained control, and showed “A fresh offline version is ready.” with
  Reload.
- Recovery: empty folder, malformed record, unsupported schema, and empty
  license paths all returned plain next-step guidance.

`/opt/fleet/lib/verify-url.sh` passed at production with a 631ms observed load,
no errors, and every baseline semantic check present. Screenshots and the
machine-readable route/offline report are in
[`qa-evidence/repair-4`](qa-evidence/repair-4/).

## Performance and response policy

Lighthouse 13.0.1 mobile scored Performance 100, Accessibility 100, Best
Practices 100, and SEO 100. FCP was 902ms, LCP 1,052ms, TBT 52ms, and CLS 0.
The worker's Chromium crashes during Lighthouse's full-page screenshot/BFCache
collection, as the verifier also observed; disabling those two supplemental
checks produced the complete audit above. Playwright screenshots and route
tests completed normally.

Production sends CSP with header-only `frame-ancestors 'none'`, HSTS, nosniff,
strict-origin referrer policy, Permissions Policy, and `X-Frame-Options: DENY`.
Fingerprinted assets are immutable for one year; `sw.js` is no-store; the web
manifest has `application/manifest+json`. License requests 1–30 returned 200;
request 31 returned 429 with `Retry-After: 4`. CORS allowed only the product
origin. Checkout returned 303 to the hosted merchant checkout.

## Deployment and identity

The final static artifact was deployed with the work-order helper:

```sh
/opt/fleet/lib/deploy-static.sh android-backup-receipt dist
```

All 24 public `dist/` files match production byte-for-byte; the host correctly
hides `staticwebapp.config.json`. Key hashes:

- `index.html`: `8f247628adda217645c07d5a13bbe4341283dfc2982f52f34e5168243dd02cbc`
- `sw.js`: `64a4fd5e7659e26a03e38a68cf67b7d921ef0663006902e89073f7ee2799f523`
- `manifest.webmanifest`: `0d01de479844a88428e0aa5a2f4aa9f6c2d9a41855650a12d0c2cc225bd5f10b`

The current Android release remains `android-v1.0.3-build-11`, because this
test-only repair does not trigger the Android source-path workflow. Its APK
passes ZIP and published checksum verification. APK `index.html` and `sw.js`
match final `dist/`; `classes.dex` is present. APK SHA-256 is
`83aa18714ce7b77d1f38b0d05d0de768df20000e65f02539b7f3202ddc2e08c0`.
The published stable certificate fingerprint is
`A6:10:61:7B:7B:34:3A:B0:A6:18:03:A2:AD:B5:EF:EC:25:56:57:4B:04:71:09:3A:64:E3:A8:04:2B:8F:3B:01`.

## Known constraints

This worker has no Java/JDK, Android SDK command-line tools, emulator, or
physical document provider, so it could not rebuild or exercise the native APK
locally. Capacitor sync, native contract tests, the successful published build,
APK integrity, embedded web identity, and stable signer evidence passed. No
product behavior or researched brief was changed by this repair.
