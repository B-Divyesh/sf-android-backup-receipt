# Android Backup Receipt — polish round 2 handoff

## Outcome

**PASS — zero cumulative review findings remain.**

Repair commit `680a15d4b957692c4fc737e8a97e88e28e00b964` is pushed to `main`. Static deployment `90119157-9fcc-4a47-9d38-8173897bc306` is live at <https://android-backup-receipt.sociobot.in>. The live home document is byte-identical to the built artifact.

The complete finding-by-finding record is in [polish-2.md](polish-2.md). Round 2 fixes real Back navigation, full demo deletion/reset, the complete claims inventory, precise free-tier/privacy wording, picker language, receipt grammar, headings, README placement, offline copy, and offline-route metadata. Round 1’s inspection-docket identity, first-screen sample receipt, multi-folder workflow, route shell, metadata, legal pages, 404, and accessibility work remain intact.

## How to verify

```sh
npm ci
npm run lint
npm test
npm run build
npm audit --omit=dev
npx cap sync android
```

Run each command in `.factory/claims.json` separately for claim isolation. The clean-clone run used `/tmp/abr-polish2.EISpJ6` and passed all 20/20 commands.

## Exact evidence

- Full clean-clone suite: 16 Vitest tests and 21 Chromium tests passed.
- Build: `dist/` produced; JS 33,514 bytes raw / 11.91 kB gzip; CSS 18,503 bytes raw / 4.60 kB gzip.
- Audit: zero npm vulnerabilities.
- Factory URL verification: home and demo both passed title, language, one-h1, main, alt, button-name, and console checks.
- Live route crawl: correct metadata and shared shell on `/`, `/demo`, `/privacy/`, `/terms/`, `/offline.html`; unknown route returns the designed HTTP 404.
- Live accessibility: zero axe violations on all six routes.
- Live mobile: no horizontal overflow. Demo receipt y=178–699.7; both exports end at y=634.7 in 390×844.
- Live demo cleanup: Reset leaves two sample active records, zero history, and zero demo keys. Start for real removes the demo database and all demo keys. Real license/history sentinels survive.
- Live Back: `/`, home title/headline, `data-demo=false`, hidden demo banner/receipt, correct announcement, and focused h1.
- Live privacy: zero cross-origin requests in the public-route crawl.
- Live offline: `/?demo=1` reloaded with its banner and receipt; both JSON and CSV downloaded offline.
- Live mobile Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.053 s, CLS 0, TBT 0 ms.
- Artifact parity: local and live `index.html` SHA-256 `0cab5e4cd0b444998dbbed11c300e11836769aedc39f9f957f2de4eb0f64cf46`.
- Android Actions run `33271286185` passed for the repair. Release `android-v1.0.3-build-10` contains the APK and AAB; both match `SHA256SUMS` and pass ZIP integrity.

Evidence is under `.factory/qa-evidence/polish-2/`; the production aggregate is `live/report.json`.

## Known gaps and next steps

No web/PWA acceptance gap is known. A physical Android device matrix was not available in this container; the native bridge and release configuration are covered by six Android tests, and Capacitor sync passed. Store submission remains a separate work order under the product’s PWA-first stack decision.
