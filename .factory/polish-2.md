# Polish round 2 — cumulative finding closure

Implementation commit: `680a15d4b957692c4fc737e8a97e88e28e00b964`

Production: <https://android-backup-receipt.sociobot.in>

Static deployment: `90119157-9fcc-4a47-9d38-8173897bc306`

Cold production report: `.factory/qa-evidence/polish-2/live/report.json`

Primary screenshots: `.factory/qa-evidence/polish-2/live/home-mobile-cold.png`, `.factory/qa-evidence/polish-2/live/demo-mobile-cold.png`, `.factory/qa-evidence/polish-2/live/home-after-back.png`, and `.factory/qa-evidence/polish-2/live/demo-offline.png`.

Every finding from both adversarial reviews is closed below. Each evidence cell names a test, a screenshot, and a cold live check.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the demo-first receipt: 50%, 2 matched, 1 missing, 1 changed, issue rows, and downloads all fit in the initial phone viewport. | Test `@claim:demo-sample-receipt`; screenshot `.factory/qa-evidence/polish-2/live/demo-mobile-cold.png`; live `/demo`, report `demo.receipt` y=178–699.7 and exports ending at y=634.7. |
| F-1-2 | Kept the exact first-screen outcome “showing which selected files match”; no restoreability claim remains. | Test `@claim:comparison-manifest`; screenshot `.factory/qa-evidence/polish-2/live/home-mobile-cold.png`; cold live `/` copy check. |
| F-1-3 | Kept the separate offline-download claim and its real offline JSON/CSV assertions. | Test `@claim:offline-exports`; screenshot `.factory/qa-evidence/polish-2/live/demo-offline.png`; live `/?demo=1` report records two offline downloads. |
| F-1-4 | Kept the measurable 32 MiB fingerprint boundary and no memory/battery benefit claim. | Test `@claim:hash-boundary`; screenshot `.factory/qa-evidence/polish-2/live/home/screenshot-mobile.png`; cold live `/#verify` copy check. |
| F-1-5 | Kept useful mount/sync/download guidance and no untested cloud-credential promise. | Test `@claim:local-only-files`; screenshot `.factory/qa-evidence/polish-2/live/home/screenshot-desktop.png`; live `/#how` plus zero cross-origin requests. |
| F-1-6 | Kept the unverified signed-application-ID statement out of customer documentation. | Test `@claim:saf-read-only`; screenshot `.factory/qa-evidence/polish-2/live/home/screenshot-desktop.png`; cold live Android section and README check. |
| F-1-7 | Kept JDK/APK/AAB language scoped to workflow configuration; release behavior remains source-tested. | Test `@claim:android-updates`; screenshot `.factory/qa-evidence/polish-2/live/home/screenshot-desktop.png`; cold live Android section and repository workflow check. |
| F-1-8 | Kept the rejected test-APK history out of customer guidance. | Test `@claim:android-updates`; screenshot `.factory/qa-evidence/polish-2/live/home/screenshot-desktop.png`; cold live Android section and README check. |
| F-1-9 | Preserved route-specific descriptions, canonicals, OG, Twitter, favicon, and social image; added the same complete metadata to offline. | Test `ships route-specific metadata, consistent navigation, focus, and build identity`; screenshot `.factory/qa-evidence/polish-2/live/home/screenshot-desktop.png`; live report `routes` covers home, demo, privacy, terms, offline, and 404. |
| F-1-10 | Preserved one inspection-docket header/footer across all routes with both legal links, source, one-liner, version, and build ID. | Same route-shell test; screenshot `.factory/qa-evidence/polish-2/live/demo/screenshot-desktop.png`; cold live route crawl recorded three nav links and both legal links everywhere. |
| F-1-11 | Replaced pushState-plus-reload with ordinary `/demo` navigation and strengthened Back assertions for title, h1, demo state, hidden UI, announcement, and focus. | Same route test; screenshot `.factory/qa-evidence/polish-2/live/home-after-back.png`; live report `back` proves the complete restored home state. |
| F-1-12 | Kept the README opening split into two short sentences. | Copy audit `.factory/copy-audit.md`; screenshot `.factory/qa-evidence/polish-2/live/home-mobile-cold.png`; cold live `/` and repository README check. |
| F-1-13 | Kept separate plain sentences for Android’s picker and the browser picker. | Copy audit plus `@claim:responsive-keyboard`; screenshot `.factory/qa-evidence/polish-2/live/home/screenshot-mobile.png`; cold live folder workflow check. |
| F-1-14 | Kept release guidance split into short maintainer sentences. | Copy audit; screenshot `.factory/qa-evidence/polish-2/live/home/screenshot-desktop.png`; repository README check and cold live Android section. |
| F-1-15 | Kept outcomes before JSON, CSV, SHA-256, APK, AAB, and other technical terms. | Copy audit plus `@claim:responsive-keyboard`; screenshot `.factory/qa-evidence/polish-2/live/home-mobile-cold.png`; cold live `/` read-through. |
| F-1-16 | Kept one vocabulary: phone folder, backup folder, matched, saved folder record, receipt, and Migration Kit. | Copy-audit terminology table plus `@claim:multi-folder-receipt`; screenshot `.factory/qa-evidence/polish-2/live/demo-mobile-cold.png`; cold live `/demo` read-through. |
| F-1-17 | Kept the self-contained “Matched files by category” heading. | Test `@claim:demo-sample-receipt`; screenshot `.factory/qa-evidence/polish-2/live/demo/screenshot-mobile.png`; cold live `/demo`. |
| F-1-18 | Kept the self-contained “Missing or changed files” heading. | Test `@claim:demo-sample-receipt`; screenshot `.factory/qa-evidence/polish-2/live/demo-mobile-cold.png`; cold live `/demo`. |
| F-1-19 | Kept the action label “Verify license”. | Test `@claim:migration-archive`; screenshot `.factory/qa-evidence/polish-2/live/home/screenshot-mobile.png`; cold live `/#unlock`. |
| F-1-20 | Kept privacy h1 “How Android Backup Receipt handles your files”. | Route/axe test; screenshot `.factory/qa-evidence/polish-2/live/home/screenshot-desktop.png`; cold live `/privacy/` has focused h1 and zero axe violations. |
| F-1-21 | Kept the concrete footer line “Compare selected phone and backup folders on this device.” | Route-shell test; screenshot `.factory/qa-evidence/polish-2/live/home-mobile-cold.png`; cold live crawl confirms it on every route. |
| F-1-22 | Kept artwork provenance only in `.factory/design.md`, not landing copy. | Copy audit; screenshot `.factory/qa-evidence/polish-2/live/home-mobile-cold.png`; cold live `/` footer check. |
| F-1-23 | Preserved repeated phone/backup folder pairs, persistence, per-pair rows, combined totals, and one combined receipt. | Test `@claim:multi-folder-receipt`; screenshot `.factory/qa-evidence/polish-2/live/home/screenshot-desktop.png`; cold live `/#verify` workflow check. |
| F-2-1 | Ordinary document navigation now gives `/` and `/demo` distinct documents; Back restores the complete home state instead of stale demo DOM. | Strengthened route test; screenshot `.factory/qa-evidence/polish-2/live/home-after-back.png`; live report `back` records home title/h1, `demo=false`, hidden banner/receipt, correct announcement, and focused h1. |
| F-2-2 | Reset and exit delete the entire demo IndexedDB database and every demo-prefixed local key. Reset then reseeds only the four-file sample; real data is untouched. | Test `@claim:demo-reset-isolation`; screenshot `.factory/qa-evidence/polish-2/live/demo-mobile-cold.png`; live report `reset` records 2 active/0 history after reset and no demo database after exit, with the real license preserved. |
| F-2-3 | Removed the untested reconnection promise from both the offline banner and cached-valid license status. | Test `@claim:offline-exports`; screenshot `.factory/qa-evidence/polish-2/live/demo-offline.png`; cold live offline banner contains only tested check/download behavior. |
| F-2-4 | Added an all-public-route claim for no analytics, ads, remote fonts, or third-party runtime scripts. It inspects requests and loaded HTML/JS/CSS. | Test `@claim:no-tracking-runtime`; screenshot `.factory/qa-evidence/polish-2/live/home-mobile-cold.png`; live report has `requests: []` across all public routes. |
| F-2-5 | Privacy now says saved folder records do not include location, thumbnails, or hidden camera details; it no longer claims file bytes are never read. | Test `@claim:local-metadata-storage`; screenshot `.factory/qa-evidence/polish-2/live/home/screenshot-desktop.png`; cold live `/privacy/` exact-copy check. |
| F-2-6 | Replaced “every download” with the named free outputs and extended the rejected-license test through folder checks, both folder records, JSON, CSV, and printing. | Test `@claim:license-revocation`; screenshot `.factory/qa-evidence/polish-2/live/demo/screenshot-desktop.png`; cold live `/#unlock` exact-copy check. |
| F-2-7 | The web workflow now distinguishes Android’s file picker from the browser’s folder picker. | Test `@claim:responsive-keyboard`; screenshot `.factory/qa-evidence/polish-2/live/home/screenshot-mobile.png`; cold live `/#how` exact-copy check. |
| F-2-8 | Receipt warnings now generate grammatical singular/plural parts. The sample says “1 file is missing and 1 has changed.” | Tests `@claim:demo-sample-receipt` and `@claim:resume-reset`; screenshot `.factory/qa-evidence/polish-2/live/demo-mobile-cold.png`; live report `demo.warning` records the exact sentence. |
| F-2-9 | Replaced the ambiguous heading with “Choose the matching backup folder”. | Test `@claim:responsive-keyboard`; screenshot `.factory/qa-evidence/polish-2/live/home/screenshot-mobile.png`; cold live `/#verify` exact-copy check. |
| F-2-10 | Replaced promotional “honest limits” with “Read what this does not check”. | Copy audit plus `@claim:responsive-keyboard`; screenshot `.factory/qa-evidence/polish-2/live/home-mobile-cold.png`; cold live first-screen exact-copy check. |
| F-2-11 | Removed the 390 px/keyboard QA instruction from the user guide and moved test coverage to the developer section. | Test `@claim:responsive-keyboard`; screenshot `.factory/qa-evidence/polish-2/live/home-mobile-cold.png`; repository README check and cold live mobile probe. |
| F-2-12 | Replaced “unlock the archive” with “verify it and use receipt history”. | Test `@claim:license-revocation`; screenshot `.factory/qa-evidence/polish-2/live/demo/screenshot-desktop.png`; source/copy audit and cold live license-flow check. |

## Verification summary

- Fresh clone `/tmp/abr-polish2.EISpJ6`: all 20 exact commands from `.factory/claims.json` passed separately; each selected one tagged test.
- The same fresh clone passed `npm run lint`, `npm test` (16 Vitest + 21 Chromium), `npm run build`, `npm audit --omit=dev`, and `npx cap sync android`.
- `dist/`: 33,514-byte JS (11.91 kB gzip) and 18,503-byte CSS (4.60 kB gzip).
- Local and live mobile Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO. Live LCP 1.053 s, CLS 0, TBT 0 ms.
- Live home/demo factory verification: correct title/lang/one h1/main/alt/button names, with zero console errors.
- Live axe: zero violations on home, demo, privacy, terms, offline, and the designed HTTP 404.
- Live request crawl: zero cross-origin requests. Live offline sample reload and both downloads passed.
- Deployed and local `dist/index.html` are byte-identical: SHA-256 `0cab5e4cd0b444998dbbed11c300e11836769aedc39f9f957f2de4eb0f64cf46`.
- Android Actions run `33271286185` succeeded for the repair commit. Release `android-v1.0.3-build-10` contains the APK and AAB; both match `SHA256SUMS` and pass ZIP integrity.

No finding remains open.
