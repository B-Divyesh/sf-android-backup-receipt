# Independent product verification 5

## Verdict: FAIL — release blocking candidate provenance failure

- Supplied candidate: `c4c63dac10b677ba16baf526618760650e2d5fe1`
- Available checkout and fetched `origin/main`: `c4c63dfca16cf8fd9804851634af1f9aeebd1d88`
- Production URL: <https://android-backup-receipt.sociobot.in>
- Verified: 2026-08-29 17:50–18:01 UTC
- Scope: fresh-install independent QA. Product source was not modified.

The release cannot be accepted as the supplied candidate. Before QA, and again
after `git fetch --tags --prune origin`, Git returned `bad object` / `Not a
valid object name` for `c4c63dac10b677ba16baf526618760650e2d5fe1`. `git fsck`
found no such reachable or dangling commit. Production does exactly match the
available `c4c63df…` build, but that is not evidence for the requested SHA.

## Mandatory claims preflight

`.factory/claims.json` exists and has 18 claims. After clean `npm ci` (149
packages, zero audit vulnerabilities), every declared claim test was executed
against the shipped demo entry point. The grouped confirmation runs were
`npm run test:unit -- -t @claim` (4/4 selected tests) and
`npm run test:claims -- --grep @claim` (14/14 selected tests; Playwright's
last-run status is `passed`, no failed tests).

| Claim | Result |
| --- | --- |
| `demo-sample-receipt` | PASS |
| `resume-reset` | PASS |
| `local-only-files` | PASS |
| `receipt-exports` | PASS |
| `sha256-evidence` | PASS |
| `hash-boundary` | PASS |
| `comparison-manifest` | PASS |
| `multi-folder-receipt` | PASS |
| `saf-read-only` | PASS |
| `android-private-backup` | PASS |
| `android-updates` | PASS |
| `local-metadata-storage` | PASS |
| `migration-archive` | PASS |
| `license-revocation` | PASS |
| `print-view` | PASS |
| `responsive-keyboard` | PASS |
| `offline-reload` | PASS |
| `offline-exports` | PASS |

### Cold first read

The cold live first screen passes the plain-words/demo gate. It says **“Check
an Android backup before you wipe.”** It says this is **for Android owners
moving phones**, explains that selected folders are compared and a receipt
shows matching files, and presents **“Try it with sample data”** as the primary
first action. One click opens `/demo`, immediately showing the isolated
four-file receipt and its persistent “Demo — sample data” banner with Reset
demo and Start for real.

## Quality gates and end-to-end evidence

| Check | Result |
| --- | --- |
| `npm test` | PASS — 16 Vitest tests and 19 Playwright tests |
| `npm run lint` | PASS — `tsc --noEmit` |
| `npm run build` | PASS — generated `dist/` |
| Production JS/CSS budget | PASS — 32,802 B JS / 11.76 kB gzip; 18,503 B CSS / 4.60 kB gzip |
| `verify-url.sh` against live | PASS — HTTP 200, title, lang, h1, main, image alts, no console errors |
| Android `./gradlew assembleDebug` | NOT RUN — verifier container has no `java` or `JAVA_HOME` (deploy kind is `none`) |

The local production build and live demo were exercised at desktop and
390×844. The demo receipt shows 2 matched, 1 missing, 1 changed, 1 extra, and
50% coverage, then explicitly warns not to wipe the phone. Claims cover JSON
and CSV export, source-manifest export/import, print media, resume/reset,
invalid input recovery, 32 MiB hashing behavior, multi-folder totals, offline
reload, and offline downloads.

At 390px there was no horizontal overflow (`scrollWidth == clientWidth ==
390`). The sample action measured 350×50px. Keyboard focus reaches the skip
link, which remains visibly focused; the existing claim suite activates folder
controls by keyboard. With `prefers-reduced-motion: reduce`, the page reports
the preference and remains usable. Axe on desktop and mobile local builds, and
on the populated live mobile demo, found zero serious or critical violations.
There were no console errors or page errors.

## Privacy, headers, deployment, and rate limit

- A fresh live Playwright home → demo flow made requests only to
  `https://android-backup-receipt.sociobot.in` (document, app JS/CSS, hero,
  demo document, and same-origin online-check). No analytics, CDN font,
  third-party script, or file upload occurred during the core demo flow.
- Live response headers include HTTPS/HSTS, `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, strict-origin referrer policy, restrictive
  Permissions-Policy, and a response-header CSP with
  `frame-ancestors 'none'`. Hashed JS is `max-age=31536000, immutable`; `sw.js`
  is no-store; the manifest has its correct media type; a nonexistent route is
  a designed HTTP 404.
- The product has no sign-in flow. The optional, documented license verification
  call is the only cross-origin path and targets Sociobot, not another identity
  provider.
- Fresh rate-limit probe of one cookie-preserving client to the documented
  Sociobot license verification endpoint: requests 1–30 received HTTP 200;
  31–35 received HTTP 429 with `Retry-After: 3, 3, 2, 2, 2`. Observed allowance:
  **30 requests per window**.
- All 24 public files from a new local `dist/` build of available commit
  `c4c63df…` SHA-256 match their live URL byte-for-byte, including app JS,
  service worker, manifest, legal pages, assets, and 404. This confirms live
  deployment of the available source, not the unavailable candidate.

## Defects

### Blocker — requested candidate cannot be verified

`c4c63dac10b677ba16baf526618760650e2d5fe1` is not in the checkout, fetched
origin refs, or Git object database. Candidate-to-production equivalence cannot
therefore be established. Supply/push the exact immutable commit and rerun the
candidate comparison. No product-behavior, accessibility, privacy, or
performance-budget defect was observed in the available `c4c63df…` build.

## Environment note

An attempted fresh Lighthouse CLI run could not launch in this container: its
Chrome tab crashed after explicitly setting `CHROME_PATH` to the installed
Playwright Chromium. This does not replace the completed bundle, Playwright,
and axe measurements above. The previous local Lighthouse evidence in the
repository is not used as fresh candidate evidence.
