# Android Backup Receipt — review 1 handoff

## Outcome

Adversarial first-read review 1 is complete. Verdict: **FAIL** with 23
findings: 1 blocking, 7 major, and 15 minor. The complete report is
`.factory/review-1.md`.

No product code or production configuration was changed.

## Blocking result

The landing page is clear before scrolling, and the isolated sample works.
However, after **Try it with sample data**, `/demo` repeats the landing hero.
The populated receipt begins at y=2,776 px on 390×844 and y=1,899 px on
1440×900. The first demo screen therefore does not show the product in use.
This is a half-fix of verification-2 C2 and is recorded as F-1-1.

## Verification performed

- Fresh Chromium contexts at 390×844 and 1440×900 against production.
- One-click demo, banner, Reset, Start for real, storage isolation, request
  logging, and live offline reload.
- Every exact command in `.factory/claims.json` from a fresh temporary clone;
  all 16 passed.
- `npm test`: 15 unit/integration and 17 Playwright tests passed.
- `npm run build`: passed and produced `dist/`.
- `npm run lint`: passed.
- Factory `verify-url.sh`: passed.
- Live axe checks on home, demo, privacy, terms, and 404: zero violations.
- Full live link/fragment crawl, route metadata inspection, Back/focus probe,
  390 px touch-target probe, and response-header inspection.
- Billing verification rate limit: requests 1–30 returned 200; 31–35 returned
  429. Checkout returned 303 to the hosted checkout.
- Current APK and checksum downloaded; SHA-256 matched and ZIP integrity passed.
- Every earlier verification finding and the previous handoff were rechecked.

## Remaining work

Repair all F-1 findings before requesting another review. Highest priority:

1. Make `/demo` receipt-first and add a viewport assertion after clicking the
   landing CTA.
2. Remove or test the uncovered restore, offline-export, memory/battery,
   cloud-credential, and Android release claims.
3. Complete route-specific canonical/OG metadata, shared header/footer, and
   focus announcements.
4. Clear the copy audit findings and support multiple folder pairs in one
   receipt.

Re-run the entire adversarial checklist from a clean clone. A passing result
requires zero findings.
