# Demo sandbox

Open [the demo](/demo), `?demo=1`, or use
`https://android-backup-receipt.sociobot.in/demo`.
The landing-page **Try it with sample data** action opens the same URL in one
click. The initial 390×844 screen shows a realistic four-file receipt: two files
match, one is missing, one changed, and one backup-only file
is reported.

The persistent **Demo — sample data, nothing is saved to your real check**
banner provides **Reset demo** and **Start for real**. Demo inventories use the
separate IndexedDB database `demo:android-backup-receipt`; real checks use
`android-backup-receipt`. Demo licenses also use `demo:`-prefixed localStorage
keys, so it never reads or writes a real check or license state. Starting for
real clears the demo active inventory and returns to `/`.

The sample data is built into `src/main.ts`, so it is available offline after
the initial service-worker-controlled visit. Its four source hashes are full
64-character SHA-256 digests. Each is reproducible from a documented virtual
fixture stream in the `@claim:sha256-evidence` test; no real personal media is
bundled.

The receipt stays at the top of `/demo`. Its summary, file issues, and download
actions appear before the longer product guide. Reset restores the same sample.
