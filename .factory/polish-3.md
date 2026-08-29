# Polish round 3 — cumulative finding closure

Implementation commits: `03526f9` and `285d73f` (final metadata and evidence
commit follows this report).

Production: <https://android-backup-receipt.sociobot.in>

The final cold-production evidence is in
`.factory/qa-evidence/polish-3/live/report.json`. It covers the 390×844 home
and demo, Back, legal routes, offline demo reload, route metadata/focus, Axe,
and console errors. `live/home-mobile-cold.png`,
`live/demo-mobile-cold.png`, and `live/home-desktop-cold.png` are the matching
production screenshots.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the demo-first receipt and its in-viewport exports. | `@claim:demo-sample-receipt`; `live/demo-mobile-cold.png`; live `/demo`. |
| F-1-2 | Kept “which selected files match”; no restore promise remains. | `@claim:comparison-manifest`; `live/home-mobile-cold.png`; live `/`. |
| F-1-3 | Kept tested offline JSON and CSV downloads. | `@claim:offline-exports`; `report.json` offline; live `/?demo=1`. |
| F-1-4 | Kept only the tested 32 MiB fingerprint boundary. | `@claim:hash-boundary`; live `/#verify`. |
| F-1-5 | Kept useful remote guidance without a cloud-credential promise. | `@claim:local-only-files`; live `/#how`. |
| F-1-6 | Kept the unverified application-ID statement out of customer copy. | `@claim:saf-read-only`; live APK section. |
| F-1-7 | Added a release-assets claim that proves JDK 21, both tasks, immutable publication, APK/AAB checksums, and signing fingerprint. | `@claim:android-release-assets`; live APK/checksum links in `link-check.json`. |
| F-1-8 | Kept the discarded-test-APK history out of customer guidance. | `@claim:android-updates`; live APK section. |
| F-1-9 | Kept per-route canonical, description, OG, and Twitter metadata. | Route test; `report.json` routes; live legal and 404 URLs. |
| F-1-10 | Kept shared navigation and both legal links on every route. | Route test; `report.json` routes. |
| F-1-11 | Kept ordinary demo navigation, Back restoration, focus, and announcement. | Route test; `report.json` back; live `/` → `/demo` → Back. |
| F-1-12 | Kept the short README opening. | `.factory/copy-audit.md`; README audit. |
| F-1-13 | Kept separate Android and browser picker instructions. | `.factory/copy-audit.md`; `@claim:responsive-keyboard`. |
| F-1-14 | Kept release instructions split into short sentences. | `.factory/copy-audit.md`; README audit. |
| F-1-15 | Kept outcomes before formats and maintainer jargon below the user guide. | `.factory/copy-audit.md`; live `/`. |
| F-1-16 | Kept phone folder, backup folder, matched, saved folder record, and receipt as the customer vocabulary. | `@claim:multi-folder-receipt`; `.factory/copy-audit.md`. |
| F-1-17 | Kept “Matched files by category.” | `@claim:demo-sample-receipt`; live `/demo`. |
| F-1-18 | Kept “Missing or changed files.” | `@claim:demo-sample-receipt`; live `/demo`. |
| F-1-19 | Kept “Verify license.” | `@claim:migration-archive`; live `/#unlock`. |
| F-1-20 | Kept the privacy heading as a policy heading. | Route/Axe test; live `/privacy/`. |
| F-1-21 | Kept the concrete footer one-liner. | Route test; `report.json` routes. |
| F-1-22 | Kept asset provenance in the visual thesis, not public marketing copy. | `.factory/design.md`; copy audit. |
| F-1-23 | Kept several persisted folder pairs and one combined receipt. | `@claim:multi-folder-receipt`; live workspace. |
| F-2-1 | Kept complete home restoration after browser Back. | Route test; `report.json` back. |
| F-2-2 | Kept complete demo database/local-key cleanup while preserving real data. | `@claim:demo-reset-isolation`; live `/demo`. |
| F-2-3 | Kept the untested reconnection sentence removed. | `@claim:offline-exports`; live offline banner. |
| F-2-4 | Kept all-route no-tracking coverage. | `@claim:no-tracking-runtime`; live request/Axe probe. |
| F-2-5 | Kept privacy language scoped to saved record fields. | `@claim:local-metadata-storage`; live `/privacy/`. |
| F-2-6 | Kept named free outputs and tests for all of them. | `@claim:license-revocation`; live `/#unlock`. |
| F-2-7 | Kept the Android/browser picker distinction. | `@claim:responsive-keyboard`; live `/#how`. |
| F-2-8 | Kept grammatical receipt warning variants. | `@claim:demo-sample-receipt`; `live/demo-mobile-cold.png`. |
| F-2-9 | Kept “Choose the matching backup folder.” | `@claim:responsive-keyboard`; live workspace. |
| F-2-10 | Kept “Read what this does not check.” | `.factory/copy-audit.md`; live `/`. |
| F-2-11 | Kept viewport QA instructions in development documentation only. | README/copy audit; `@claim:responsive-keyboard`. |
| F-2-12 | Kept literal, task-specific offline license wording. | `@claim:offline-exports`; source/copy audit. |
| F-3-1 | Added `android-release-assets`; renamed the link to “Download APK checksums”; the test fetches the immutable public release and hashes both binaries. | `@claim:android-release-assets`; `live/link-check.json`; live APK section. |
| F-3-2 | Removed merchant/refund promises. Terms now state only the recorded expired/revoked/wrong-product behavior, which is tested. | `@claim:license-revocation`; live `/terms/`; `report.json`. |
| F-3-3 | Rewrote the first strip as privacy, offline, and price facts and added the adjacent sample result. | `@claim:responsive-keyboard`; `live/home-mobile-cold.png`; live `/`. |
| F-3-4 | Added the Android remote-provider control and a concrete browser saved-record handoff. Both use the existing read-only provider-neutral SAF path. | `@claim:remote-provider-access`; live `/#how`; `live/home-mobile-cold.png`. |
| F-3-5 | Replaced visible archive/inventory terms with “folder record” and “receipt history.” | `@claim:license-revocation`; live `/#unlock`; `.factory/copy-audit.md`. |

## Verification

- A clean clone at `285d73f` completed `npm ci`, each of the 22 exact claim
  commands in `.factory/claims.json`, `npm run lint`, `npm test`, `npm run
  build`, and `npm audit --omit=dev` successfully.
- The full suite contained 20 Vitest and 21 Playwright tests. The browser
  suite includes Axe checks, request privacy checks, mobile/keyboard checks,
  demo reset/Back checks, and independent offline contexts.
- The local Lighthouse result was Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.21 s, CLS 0, and TBT 109 ms.
- Production deployment and its final cold check are recorded in the handoff.

No review finding remains open.
