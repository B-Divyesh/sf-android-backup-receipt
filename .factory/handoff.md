# Android Backup Receipt — independent verification 3 handoff

## Status: FAIL

- Candidate: `b7812459e61c3be620102c71c7622303ed115c4e`
- Live URL: <https://android-backup-receipt.sociobot.in>
- Verified: 2026-08-29
- Full report: [verification-3.md](verification-3.md)

The deployment matches the candidate and the web/PWA product works, but this
candidate is not releasable.

## Release blockers

1. The live demo labels four 4-character placeholder values as SHA-256. The
   registered `sha256-evidence` test checks only the `hashMethod` label, so it
   passes without proving its claim.
2. Public claims about native SAF behavior, the 32 MiB hash boundary,
   comparison/import behavior, paid 20-receipt history, installability,
   keyboard/mobile support, and detailed privacy behavior are absent from
   `.factory/claims.json`. The supplied claims contract makes each unlisted
   claim release-blocking.
3. The Android workflow generates a new signing key on every build, overwrites
   the same `v1.0.1` release, and leaves `versionCode 2`. Existing installations
   therefore cannot receive later builds as updates.

## Other findings

- Android permits app-data backup and has no exclusion rules despite storing
  private inventory metadata and describing it as on-device state.
- The SAF picker unnecessarily requests and persists write permission.
- The mobile checksum link is 19 px high, below the 44 px target requirement.
- Open Graph/Twitter/Apple metadata, Param Factory credit, and a build ID are
  missing; privacy/terms have no canonical metadata.
- Malformed manifest JSON exposes raw parser jargon without a recovery action.
- The hero's three fact lines fall below the first viewport at 1440 × 900 and
  are slightly clipped at 390 × 844.
- The copy audit covers only the first screen rather than every landing-page
  sentence required by the plain-words contract.

## Passing verification

```sh
npm ci
npm test
npm run lint
npm run build
npm audit --omit=dev
```

- All five exact `.factory/claims.json` commands returned zero.
- `npm test`: 11 Vitest assertions and 9 Playwright tests passed.
- Clean detached checkout: build and `npx cap sync android` passed.
- Java is absent from this verifier image, so local Gradle could not run. The
  matching GitHub Android workflow passed; freshly downloaded APK and AAB both
  matched their published checksums, and the APK embeds this candidate's web
  shell. A real Android device/provider pass remains required.
- Live functional checks covered sample, discrepancy, 100% match, manifest
  import, exports, persistence/clear, invalid inputs, the exact 32 MiB hash
  boundary, keyboard, reduced motion, desktop, and 390 px mobile.
- Axe serious/critical: 0. Core-page console/page errors: 0.
- Demo/normal file flows made only same-origin requests. Security headers and
  cache policies are deployed.
- PWA offline reload and controlled service-worker update passed.
- Billing verify allowance observed: 30 requests; request 31 returned 429 with
  `Retry-After: 4`. Checkout returned 303 to hosted Dodo.
- Lighthouse mobile: 99 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.1 s, TBT 100 ms, CLS 0.
- 21/21 public build files matched production byte-for-byte.

## Evidence

The reproducible browser probe and desktop/mobile screenshots are under
`.factory/qa-evidence/`. See `.factory/verification-3.md` for exact hashes,
headers, paths, observed messages, and remediation priorities.
