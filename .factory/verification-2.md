# Independent product verification 2

## Verdict: FAIL

- Candidate: `60f6cae6c17b51354849109d393abdd37fec97ca`
- Repository/branch: `B-Divyesh/sf-android-backup-receipt`, `main`
- Production URL: <https://android-backup-receipt.sociobot.in>
- Work order: `android-backup-receipt-verify-2`
- Verified: 2026-08-28 09:43–09:49 UTC

This candidate repairs the prior Android artifact, checkout, response-policy,
and rate-limit findings, and its core comparison product works. It nevertheless
fails the factory acceptance contract before any optional QA can compensate:
there is no required claims inventory or claim-test suite, and no one-click,
isolated sample-data demo.

## Mandatory preflight: claims and cold first read

### Blocking C1 — `.factory/claims.json` is missing

This was the first checkout check, before installation or other test commands.
`ls -la .factory` listed `brief.json`, `design.md`, `handoff.md`, and
`verification.md`; opening `.factory/claims.json` failed with `No such file or
directory`. `git ls-tree -r HEAD .factory` also confirms it is absent at the
candidate SHA.

Consequently there are no prescribed `@claim:` tests to run from the demo
entry point, and none can pass. The claims policy explicitly makes a missing
claims file release-blocking. It also leaves live reliance claims such as
`0 uploads`, `SHA-256 evidence`, local-only processing, export behavior, and
offline capability without the required claim-to-observable-test record.

### Blocking C2 — no sample-data demo and failed first-read test

Cold opening the production URL at 390 px showed this first screen:

> **Know what made it before you move on.**
>
> Compare the folders on your phone with a USB drive, synced WebDAV folder, S3
> download, or saved manifest. Get a dated, portable receipt—not another
> backup promise.
>
> **Check my backup** · **Download Android APK** · **Read the honest limits**

My first-read answer is: it appears to compare two selected folders and issue a
receipt; it is apparently for someone moving Android data; first, click
“Check my backup.” That does **not** meet the contract in plain words: the
headline is a metaphor rather than the job, the first-screen sentence does not
say who it is for, and the first action immediately requires real folders.

There is no exact `Try it with sample data` control on the landing page, no
sample dataset, no persistent `Demo — sample data, nothing is saved` banner,
no Reset/Start-for-real controls, no demo storage namespace, and no
`.factory/demo.md`. Repository search found no product/demo references.
`https://android-backup-receipt.sociobot.in/demo` returns the ordinary landing
page (200, 14,280 bytes), as does an arbitrary unknown route; `?demo=1` has no
implemented behavior. Thus a visitor cannot try the product in one click,
and the verifier cannot run any claim from a clean demo state.

## Other verification results

These passing results do not override C1/C2, but distinguish the acceptance
failure from the earlier deployment-only failure.

### Clean checkout and build

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 149 packages installed, `npm audit` reported 0 vulnerabilities. |
| `npm run lint` | PASS; `tsc --noEmit`. |
| `npm test` | PASS; 10 Vitest assertions and 4 Playwright tests. |
| `npm run build` | PASS; `dist/` produced. App JS 25,468 bytes raw / 9.29 KB gzip; CSS 13,837 bytes raw / 3.86 KB gzip. |
| `npx cap sync android` | PASS. |
| `android/gradlew assembleDebug` | BLOCKED by this verifier image: `JAVA_HOME is not set and no java command could be found`; no JDK exists under `/usr/lib/jvm`. This is an environment limitation, not a candidate defect. |

The downloaded release APK is present and internally consistent despite the
local-JDK limitation: `android-backup-receipt-1.0.1.apk` SHA-256 is
`c2115675ef67c2750bbd4b4f9d530ee0bbd254142ed4945479ea322d8e00e1aa`, exactly
matching the live `SHA256SUMS` release file. It contains `classes.dex`,
`AndroidManifest.xml`, and `assets/public/index.html`. Its `index.html`, app
JS, CSS, and service worker SHA-256 values exactly match this candidate’s
fresh `dist/` files. Class strings include `SafInventoryPlugin`/`SafInventory`;
source inspection confirms `ACTION_OPEN_DOCUMENT_TREE`, selected-tree URI
persistence, `DocumentFile`, cancellation/progress, and no broad-media or
broad-storage permission in the manifest. A real Android document-provider
pass remains unperformed because this container has neither a JDK nor a device.

### End-to-end web product

On the live site at 390 × 844, a browser-only normal flow with three source
files and three destination files yielded **1 accounted, 1 missing, 1 changed**
and the clear recovery conclusion “Do not wipe the source yet.” The downloaded
CSV had the header `status,category,path,size_bytes` and the two expected issue
rows. There were no console errors, page errors, failed requests, or unexpected
third-party requests during that flow.

Recovery paths were also exercised live:

- Empty source selection: “That folder contained no readable files. Choose
  another folder.”
- Malformed JSON manifest: an exposed parse error; unsupported schema: “Manifest
  format is not supported. Export a fresh manifest from this app.”
- Empty license submission: “Paste the complete license token first.”
- An invalid returned license is stored, removed from the address bar, rejected
  quietly, and does not prevent the free verifier from working.

The existing unit coverage also passes the empty-inventory, malformed schema,
CSV-formula guard, category, Java bridge, 32 MiB hash-policy, and response
configuration assertions. The production page has one `h1`, `main`, `lang`,
title, meaningful hero alt text, skip link, keyboard-visible 3 px focus ring,
and no horizontal overflow at 390 px. Axe on the cold live mobile page reported
zero violations (therefore zero serious/critical). Reduced-motion emulation
produced a `0.01s` transition duration. Live mobile Lighthouse scored 98
Performance, 100 Accessibility, 100 Best Practices, and 100 SEO (FCP/LCP 1.7
s, TBT 100 ms, CLS 0).

### Privacy, PWA, security, deployment

- Initial and normal comparison-flow runtime requests remained same-origin;
  no uploads, analytics, remote fonts, ad pixels, or external scripts were
  observed. The only cross-origin request after an explicit returned license
  was the documented Sociobot verification API request. The privacy and terms
  pages disclose IndexedDB/localStorage, filename/hash metadata, billing, and
  lack of EXIF parsing.
- The live PWA gained a controlling service worker, cached
  `backup-receipt-oCoCWCNT-shell`, showed the offline banner, and reloaded its
  app shell while the browser context was offline with no errors. The worker
  source implements versioned cache cleanup, `skipWaiting`, `clientsClaim`, and
  the update-message toast. A live replacement-worker update cannot be safely
  forced against production; the update path is verified by the candidate’s
  prior Playwright coverage/source review rather than an alteration of live
  production state.
- Security headers on HTML/assets include CSP with `frame-ancestors 'none'`,
  `X-Frame-Options: DENY`, restrictive Permissions-Policy, nosniff, HSTS, and
  strict-origin referrer policy. Fingerprinted JS/CSS/WebP cache immutable for
  one year; `/sw.js` is no-store; the manifest is
  `application/manifest+json`.
- Every one of the 19 public generated build files matched the fetched live
  file byte-for-byte. The live deployment is therefore this candidate, not a
  stale deployment.
- The paid checkout now returns HTTP 303 to hosted Dodo checkout. A fresh rapid
  burst of invalid license-verification requests received HTTP 200 for requests
  1–30 and HTTP **429** with `Retry-After: 4` on request **31** and later. This
  satisfies the server-endpoint rate-limit check. No sign-in flow exists.

## Additional non-blocking defect

### Medium M1 — no designed 404 route

`/does-not-exist` responds 200 with the ordinary landing document, rather than
a designed 404 page/status as required by the site-structure contract. This is
masked by SPA navigation fallback and should be fixed with an actual 404 route
or platform exclusion, but C1/C2 already determine the verdict.

## Required disposition

Do not promote this candidate. Add the required claims inventory and a clean,
demo-entry-point observable test for each reliance claim; add a one-click
realistic sample-data sandbox with separate storage, persistent demo banner,
reset/start-for-real actions, `.factory/demo.md`, and plain first-screen copy.
Then repair the 404 behavior and re-run independent verification. Do not alter
the currently working Android/checkout/rate-limit implementation merely to
address the earlier report.
