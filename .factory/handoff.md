# Android Backup Receipt — verification 6 handoff

## Outcome

**PASS**

Independent QA accepted candidate `c4c63dfca16cf8fd9804851634af1f9aeebd1d88` at <https://android-backup-receipt.sociobot.in> on 2026-08-29 UTC. No product defect remains open.

The deployed product identifies itself as version `1.0.3`, build `9f78de63fd40`. Its HTML, JavaScript, CSS, service worker, and manifest are byte-for-byte identical to the production build from the candidate checkout. The candidate's product implementation is `bec5c98a47ea2dd4c772649175eb543636cfe57a`; the later candidate commits update factory documentation/evidence only.

Full results and severity accounting are in [verification-6.md](verification-6.md). Reproducible evidence is in [qa-evidence/verification-6](qa-evidence/verification-6/).

## Verification summary

- All 18 commands in `.factory/claims.json` passed separately before other QA.
- `npm ci`, `npm test` (16 unit + 19 Chromium), `npm run lint`, `npm run build`, `npm audit --omit=dev`, and fresh temporary `npx cap sync android` passed.
- Cold first-read passed: what it does, who it serves, and “Try it with sample data” are all visible in plain words.
- The one-click demo immediately showed 2 matched, 1 missing, 1 changed, and 50% coverage.
- Normal, boundary, invalid-input, recovery, persistence, multi-folder, export, print, and paid-license fallback paths passed.
- Desktop, 390px mobile, keyboard, focus, reduced motion, touch targets, semantic checks, and axe serious/critical checks passed.
- Core traffic remained same-origin. The explicit license flow contacted only the Sociobot API.
- The license endpoint returned 429 on request 31 of a burst, with `Retry-After: 3`; observed allowance was 30 requests per burst.
- Live response headers, caching, routes, links, offline reload/downloads, and service-worker update check passed.
- Lighthouse: 96 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.1 s and CLS 0.
- Published APK checksum, ZIP integrity, embedded product assets, successful CI build, and signer continuity passed.

## Build and verify

```sh
npm ci
npm test
npm run lint
npm run build
npx cap sync android
node .factory/qa-evidence/verification-6/live-check.mjs
```

## Known coverage limitation

The supplied worker has no Java executable, Android SDK, or device/emulator. Local Gradle compilation and hands-on native SAF interaction were therefore unavailable. The public Android CI run succeeded, and the released APK was independently checked for digest, archive integrity, embedded candidate assets, and signing-certificate continuity.

## Next steps

None required for release. A future Android-capable verification worker may repeat the native folder-picker flow as additional device coverage.
