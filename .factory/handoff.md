# Android Backup Receipt — adversarial review 2 handoff

## Outcome

**FAIL**

The complete review is in [review-2.md](review-2.md). No product code was
changed.

The cold home screen and one-click demo pass. All 18 registered claim commands,
the full test suite, and the production build pass. The review nevertheless
found two blocking defects:

1. Browser Back changes the URL from `/demo` to `/` but leaves the demo title,
   headline, banner, receipt, and route announcement on screen.
2. Reset demo and Start for real clear only active demo inventories. A
   demo-prefixed license token and receipt-history record survive both actions.

The report also records four major claim/copy-scope findings and six minor copy
findings. Prior finding F-1-11 is reopened by the Back-navigation regression.

## Verification performed

- Fresh live Chromium contexts at 390×844 and 1440×900.
- One-click demo, realistic sample, Reset, Start for real, offline reload,
  same-origin request log, and real/demo storage isolation.
- Explicit browser history probe for home → demo → Back → reload.
- Demo active/history/license cleanup probes.
- Every exact command from `.factory/claims.json`, separately, in fresh clone
  `/tmp/abr-review2.58W1HT`: 18/18 passed.
- `npm test`: 16 Vitest and 19 Playwright tests passed.
- `npm run build`: passed and produced `dist/`; JavaScript is 32,802 bytes raw
  and 11.76 kB compressed.
- Home/demo/privacy/terms/404 semantics and axe checks: zero axe violations.
- Reduced motion, 390 px overflow, titles, metadata, canonical/OG/Twitter,
  consistent shell, response CSP, and designed HTTP 404 checks.
- Internal, GitHub source, APK, checksum, and checkout links resolved after
  redirects.
- `/opt/fleet/lib/verify-url.sh`: passed for the production home page.
- All earlier review, polish, verification, brief, design, demo, claims, and
  prior handoff documents were read and cross-checked against live behavior and
  code.

## Reproduce the blockers

For F-2-1, open `/`, activate **Try it with sample data**, then press browser
Back. Confirm the URL is `/` while the title remains **Demo — Android Backup
Receipt**, the h1 remains **Review a sample backup receipt**, and the demo banner
and receipt remain visible. Reloading `/` restores the real home page.

For F-2-2, open `/demo`, seed or create a demo license and receipt-history
record, then activate **Reset demo** and **Start for real**. Inspect
`demo:sb_license:android-backup-receipt` and the `history` store in
`demo:android-backup-receipt`; both remain.

## Next steps

Implement every concrete fix in `review-2.md`, especially complete route-state
assertions after Back and full demo-namespace cleanup. Then rerun the whole
review from a fresh context and clean clone. Acceptance requires zero findings.
