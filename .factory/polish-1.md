# Polish round 1 — finding closure

Implementation commit: `bec5c98a47ea2dd4c772649175eb543636cfe57a`

Production: <https://android-backup-receipt.sociobot.in>

Cold live probe: `.factory/qa-evidence/polish-1/live/report.json`

Screenshots: `.factory/qa-evidence/polish-1/live/home-mobile-cold.png`, `demo-mobile-cold.png`, and `multi-folder-mobile.png`

Every finding in `.factory/review-1.md` is closed below. There were no earlier `.factory/review-*.md` or `.factory/polish-*.md` files in the base commit.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | `/demo` and `?demo=1` now move the stamped sample receipt above the workflow. The 50% score, 2/1/1 summary, issue rows, and downloads fit in the first 390×844 screen. The demo h1 receives focus. | `@claim:demo-sample-receipt`; live report records receipt y=178, bottom=699.7 and both downloads above y=635; `live/demo-mobile-cold.png`; cold `/demo`. |
| F-1-2 | Replaced “what can be restored” with “which selected files match” in the first screen and all preview metadata. | `@claim:comparison-manifest`; `live/home-mobile-cold.png`; cold `/`. |
| F-1-3 | Added the `offline-exports` claim. Its test takes a controlled demo offline, issues the receipt, and downloads both JSON and CSV. | `@claim:offline-exports`; live report keys `offline-download:*`; cold `/demo`. |
| F-1-4 | Removed the memory and battery benefit. Copy now states only the tested 32 MiB sampled-fingerprint boundary. | `@claim:hash-boundary`; `.factory/copy-audit.md`; cold `/#verify`. |
| F-1-5 | Removed the untested cloud-credential assertion. The remote-storage note now gives only the useful mount, sync, download, or import instruction. | `@claim:local-only-files`; `.factory/copy-audit.md`; cold `/#how`. |
| F-1-6 | Removed the untested “signed build has application ID” statement from README. The package identifier remains maintainer configuration, not customer copy. | `@claim:saf-read-only`; clean README audit; current APK link returned 200. |
| F-1-7 | Recast JDK/APK/AAB language as maintainer workflow configuration instead of a completed-artifact promise. | `@claim:android-updates`; Android Actions run `33264739610` succeeded; release `android-v1.0.3-build-9` contains APK and AAB. |
| F-1-8 | Removed the rejected v1.0.1 historical warning from customer documentation. | README copy audit; current APK and checksum links returned 200. |
| F-1-9 | Added route-specific canonical, description, Open Graph, and Twitter metadata for demo, privacy, terms, and designed 404. | Browser test “ships route-specific metadata…”; live report `metadata:*`; cold `/demo`, `/privacy/`, `/terms/`, and HTTP 404. |
| F-1-10 | Home, demo, privacy, terms, offline, and 404 now share the wordmark, three-link navigation, one-line description, Privacy, Terms, Source, version, and build ID. | Same route test; live report `shell:*`; legal/404 live routes. |
| F-1-11 | Demo navigation uses `pushState`, route headings use `tabindex=-1`, route loads and Back focus the h1, and a polite region announces titles. Static routes use the same focus behavior. | Same route test covers demo, Back, legal, and 404 focus; live report `demo-focused-heading` and `focus:*`. |
| F-1-12 | Split the README opening into two short sentences. | `.factory/copy-audit.md`; README line-length audit; repository README. |
| F-1-13 | Rewrote the picker feature as two plain sentences for Android and web. | `.factory/copy-audit.md`; README user guide. |
| F-1-14 | Split release details into three short maintainer sentences. | `.factory/copy-audit.md`; README maintainer notes. |
| F-1-15 | Customer copy now leads with outcomes and defines JSON, CSV, SHA-256, and APK only after plain descriptions. Maintainer acronyms moved below the user guide. | `.factory/copy-audit.md`; `@claim:responsive-keyboard`; `live/home-mobile-cold.png`. |
| F-1-16 | Standardized customer terms to “phone folder”, “backup folder”, “matched”, “saved folder record”, and “receipt”. | Terminology table in `.factory/copy-audit.md`; `@claim:multi-folder-receipt`; live screenshots. |
| F-1-17 | Renamed “By category” to “Matched files by category”. | `@claim:demo-sample-receipt`; `live/demo-mobile-cold.png`; cold `/demo`. |
| F-1-18 | Renamed “Needs attention” to “Missing or changed files”. | `@claim:demo-sample-receipt`; `live/demo-mobile-cold.png`; cold `/demo`. |
| F-1-19 | Renamed the license action to “Verify license”. | `@claim:migration-archive`; `live/home-mobile-cold.png`; cold `/#unlock`. |
| F-1-20 | Privacy h1 is now “How Android Backup Receipt handles your files”. | Route metadata/focus test plus axe; live report `focus:/privacy/` and `axe:/privacy/`; cold `/privacy/`. |
| F-1-21 | Footer line now says “Compare selected phone and backup folders on this device.” | Browser route-shell test; `live/home-mobile-cold.png`; all live routes. |
| F-1-22 | Removed artwork provenance from public copy. Provenance remains in `.factory/design.md`. | `.factory/copy-audit.md`; footer browser test; cold `/`. |
| F-1-23 | Added repeated phone-folder/backup-folder pairs, persisted pair state, incomplete-pair guidance, per-pair result rows, aggregated totals/issues/categories, and combined JSON/CSV exports. Every Android choice still uses the read-only SAF bridge. | `@claim:multi-folder-receipt`, unit test “combines several folder pairs…”, `@claim:saf-read-only`; `live/multi-folder-mobile.png`; live report `multi-folder-*`. |

## Verification summary

- Fresh clone of `bec5c98`: all 18 exact commands in `.factory/claims.json` passed, one tagged test per claim.
- `npm test`: 16 Vitest and 19 Chromium tests passed.
- `npm run lint`, `npm run build`, `npm audit --omit=dev`, and `npx cap sync android`: passed.
- Local and live Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO. Live LCP 1.1 s, TBT 0 ms, CLS 0.
- Live demo, privacy, terms, and 404: zero serious or critical axe findings, zero console errors, and no mobile overflow.
- Live core/demo request log: same-origin only. Offline reload and both offline downloads passed.
- `dist/index.html` and production were byte-identical after deployment: SHA-256 `a1379a9de980746fa9c624afa671881d0f2452e3d444dd93497fbc8da95b9313`.
- Android Actions run `33264739610` passed. The latest APK and AAB match `SHA256SUMS` and pass ZIP integrity.

No finding remains open.
