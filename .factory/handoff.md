# Android Backup Receipt — independent verification handoff

## Verdict: FAIL

Candidate `83c9b945aa4db1c086300923909ce7e93601e162` was independently tested on
2026-08-28 against <https://android-backup-receipt.sociobot.in>. The deployed
site is byte-for-byte the candidate build (19/19 generated files matched), but
the candidate is not acceptable as the contracted Android product.

Blocking findings:

1. **Critical:** no APK/AAB, download, or native SAF implementation exists; the
   checked-in Android project is only a Capacitor `BridgeActivity` wrapper.
2. **High:** the advertised production checkout returns HTTP 404
   (`{"error":"enabled factory product","status":404}`).
3. **High:** 80 rapid license-verification requests all returned 200; no 429 or
   `Retry-After` was observed (threshold is greater than 80).

Additional defects are missing CSP/frame/permissions policies, sub-44 px mobile
navigation targets, non-immutable 30-second caching for all static assets, one
moderate axe landmark finding, and a generic manifest MIME type. Full evidence
and severity details are in `.factory/verification.md`.

## What passed

- Clean checkout: `npm ci`, `npm test` (7 unit + 3 Playwright), `npm run build`
  including TypeScript, `npm audit --omit=dev`, and `npx cap sync android`.
- Core browser flow: normal discrepancies, 100% success, 32 MiB hashing
  boundary, invalid input/recovery, cancellation, JSON/CSV export, persistence,
  clear/reset, invalid license handling, and privacy/legal pages.
- Desktop 1440 × 900 and mobile 390 × 844 responsive checks; keyboard traversal,
  visible focus, reduced motion, no horizontal overflow, no console/page errors.
- Zero serious/critical axe violations.
- Live Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO; LCP 1.1 s, TBT 91 ms, CLS 0.
- Offline reload and a simulated service-worker update with visible Reload toast.
- Privacy network check: no upload, analytics, remote font, or unexpected third
  party request; only explicit license verification contacted Sociobot API.

## Reproduce

```sh
npm ci
npm test
npm run build
npm audit --omit=dev
npx cap sync android
```

The repository has no lint script. `android/gradlew assembleDebug` could not be
executed in this verifier image because no Java/JDK is installed; this is not
the reason for the FAIL verdict.

## Required next steps

1. Implement persistent Android SAF folder access, build/sign the Android
   artifact, publish its download and SHA-256, and test it on supported Android
   versions with USB/document-provider destinations.
2. Register and enable the production Sociobot billing product; retest checkout,
   return, restore, revoked, and refunded-license paths.
3. Add server-side rate limiting to license verification and verify a burst
   yields `429` with `Retry-After` at a documented threshold.
4. Resolve the medium/low web findings in `.factory/verification.md`, rerun all
   gates, and repeat deployed-byte identity verification.
