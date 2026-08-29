# Android Backup Receipt — polish round 2 handoff

## Outcome

**PASS — zero cumulative review findings remain.**

Repair commits `680a15d4b957692c4fc737e8a97e88e28e00b964` and `97c8fe9b7ef5c9903409695203d94878af2fd8d7` are pushed to `main`. Final static deployment `556fb5c4-c0f8-4410-acee-fba50faf2e26` is live at <https://android-backup-receipt.sociobot.in>. The live home document is byte-identical to the built artifact.

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

Run each command in `.factory/claims.json` separately for claim isolation. The final clean-clone run used `/tmp/abr-polish2-final.TzhLtj` and passed all 20/20 commands.

## Exact evidence

- Full clean-clone suite: 16 Vitest tests and 21 Chromium tests passed.
- Build: `dist/` produced; JS 33,491 bytes raw / 11.90 kB gzip; CSS 18,503 bytes raw / 4.60 kB gzip.
- Audit: zero npm vulnerabilities.
- Factory URL verification: home and demo both passed title, language, one-h1, main, alt, button-name, and console checks.
- Live route crawl: correct metadata and shared shell on `/`, `/demo`, `/privacy/`, `/terms/`, `/offline.html`; unknown route returns the designed HTTP 404.
- Live accessibility: zero axe violations on all six routes.
- Live mobile: no horizontal overflow. Demo receipt y=178–699.7; both exports end at y=634.7 in 390×844.
- Live demo cleanup: Reset leaves two sample active records, zero history, and zero demo keys. Start for real removes the demo database and all demo keys. Real license/history sentinels survive.
- Live Back: `/`, home title/headline, `data-demo=false`, hidden demo banner/receipt, correct announcement, and focused h1.
- Live privacy: zero cross-origin requests in the public-route crawl.
- Live offline: `/?demo=1` reloaded with its banner and receipt; both JSON and CSV downloaded offline.
- Final live mobile Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.097 s, CLS 0, TBT 18 ms.
- Artifact parity: local and live `index.html` SHA-256 `8f247628adda217645c07d5a13bbe4341283dfc2982f52f34e5168243dd02cbc`.
- Android Actions run `33271561492` passed for the final repair. Release `android-v1.0.3-build-11` contains the APK and AAB; both match `SHA256SUMS` and pass ZIP integrity.

Evidence is under `.factory/qa-evidence/polish-2/`; the final production aggregate is `live/final-cold-check.json`.

## Known gaps and next steps

No web/PWA acceptance gap is known. A physical Android device matrix was not available in this container; the native bridge and release configuration are covered by six Android tests, and Capacitor sync passed. Store submission remains a separate work order under the product’s PWA-first stack decision.
