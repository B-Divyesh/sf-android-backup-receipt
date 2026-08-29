# Android Backup Receipt — repair handoff

## Repair scope

This repair addresses every release-blocking finding in independent verification
report 2 (`f8dcd2b8db131a66d4cfdd281ed48ee6edfb149a`):

1. Added `.factory/claims.json` with five public reliance claims and exact
   `@claim:` regression commands.
2. Added the isolated one-click demo at `/demo` (and `?demo=1`). It loads a
   realistic four-file Android move receipt immediately: 2 accounted, 1
   missing, 1 changed, and 1 destination-only file. Demo active inventories
   live only in IndexedDB `demo:android-backup-receipt`; real checks continue
   to use `android-backup-receipt`. Demo license keys are also `demo:`
   namespaced. The persistent banner has **Reset demo** and **Start for real**.
3. Rewrote the cold first screen: “Check an Android backup before you wipe.”
   It names Android owners moving phones and makes **Try it with sample data**
   the first action. The supporting copy audit is
   [`.factory/copy-audit.md`](copy-audit.md).
4. Added a real designed `404.html`, `responseOverrides` for 404s, and explicit
   `/demo` rewrites. The local Azure Static Web Apps emulator returned 404 for
   `/does-not-exist` with the designed page, and 200 for `/demo`.
5. Hardened the offline demo path with a distinct cached `demo.html` shell, so
   an offline demo reload retains demo mode rather than becoming the regular
   landing state.

The existing Android SAF bridge, APK link/checksum, checkout, billing rate
limit, CSP/cache policy, comparison behavior, and free exports were preserved.

## Verification evidence — 2026-08-29

From a clean dependency install (`npm ci`, 149 packages, 0 audit
vulnerabilities), the following passed:

```sh
npm run lint
npm test
npm run build
npx cap sync android
npm audit --omit=dev
```

Results:

- `npm test`: 11 Vitest assertions and 9 Playwright tests passed.
- Claim coverage includes one-click demo data, same-origin-only demo requests,
  JSON/CSV export contents, SHA-256 demo-manifest evidence, and offline demo
  reload. Run a single claim with the exact command in `.factory/claims.json`,
  or all claims with `npm run test:claims`.
- Axe integration reports zero violations on the initial page and populated
  demo receipt. Keyboard regression verifies the skip link and demo reset.
- Browser smoke at 390 × 844: `/demo` has one title/h1/main, visible demo
  banner and receipt, no console/page errors, and no horizontal overflow.
  Existing desktop and mobile comparison coverage remains in Playwright.
- `swa start dist --port 4280`: `/demo` returned 200 and
  `/does-not-exist` returned a true 404 with “That page is not here.”
- Production build output: JavaScript 27,167 bytes raw; main CSS 14,236 bytes
  raw. Both remain below the static budget.

## How to run

```sh
npm ci
npm run dev
# open /demo for the isolated sample
npm test
npm run build
npx cap sync android
```

Deploy the generated `dist/` directory as the existing static artifact. The
checked `staticwebapp.config.json` supplies the security headers, caching, demo
rewrite, and 404 override.

## Deployment

Deployed `dist/` to the production Static Web App
`sf-android-backup-receipt` on 2026-08-29. Live checks at
`https://android-backup-receipt.sociobot.in` confirmed `/demo` returns the
visible sample receipt at 50% coverage with no console errors, while an unknown
route returns HTTP 404 and the designed page. The live response includes the
configured CSP, Permissions-Policy, and `X-Frame-Options: DENY`.

## Known limitation

No JDK is installed in this container (`java` is unavailable), so native
`android/gradlew assembleDebug` could not run here. Capacitor sync passed; the
previously verified SAF implementation and release workflow remain unchanged.
Before Play Store distribution, run the native build and test selected-tree
access with the target Android document providers.
