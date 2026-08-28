# Android Backup Receipt

Android Backup Receipt is a local-first PWA for Android owners who want evidence
that selected photos, documents, downloads, and app-export folders made it to a
backup destination before they erase or replace a phone.

It inventories two user-selected folder trees, computes SHA-256 evidence in the
browser, compares relative paths and content, and exports a dated JSON receipt
plus a CSV discrepancy list. Nothing is uploaded. This is a verifier, not a
backup engine, and it cannot access protected Android app data.

Production URL: <https://android-backup-receipt.sociobot.in>

## What works

- Source and destination folder selection through the browser file picker
- Full SHA-256 for files up to 32 MB; disclosed sampled SHA-256 for larger files
- Missing, changed, accounted-for, extra, and category totals
- Portable source/destination manifests for mounted or synced WebDAV/S3 data
- JSON receipt, CSV discrepancy export, and print view
- Offline app shell and installable PWA
- Optional $7 one-time Migration Kit license for a 20-receipt local archive
- Responsive 390 px layout and full keyboard operation

For WebDAV or S3, sync/download or mount the relevant remote folder first, then
select it. The static v1 deliberately does not collect cloud credentials.

## Develop and verify

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Run all unit, mobile flow, accessibility, and offline tests:

```sh
npm test
```

Create the exact static deployment output:

```sh
npm run build
# output: ./dist (with dist/index.html at its root)
```

Preview the production output with `npm run preview`.

## Android wrapper

The checked-in `android/` project is a Capacitor 7 skeleton with application ID
`in.sociobot.androidbackupreceipt`. Refresh it after a web build with:

```sh
npm run build
npx cap sync android
```

An APK is intentionally left to the later Android artifact work order. The web
build is the deployment target for this work order.

## Privacy and billing

The app has no analytics, ad pixels, remote fonts, or third-party runtime
scripts. The two active inventory summaries are stored in IndexedDB so a check
can resume; “Start another check” clears them. Paid archive summaries also use
IndexedDB; the license and daily verification verdict use localStorage. License
verification talks only to the Sociobot billing API.

See [/privacy](https://android-backup-receipt.sociobot.in/privacy/) and
[/terms](https://android-backup-receipt.sociobot.in/terms/).

## License

MIT. See [LICENSE](LICENSE).
