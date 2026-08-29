# Demo sandbox

Open [the demo](/demo), `?demo=1`, or use
`https://android-backup-receipt.sociobot.in/demo`.
The landing-page **Try it with sample data** action opens the same URL in one
click. It immediately shows a realistic four-file phone-move check: two files
are accounted for, one is missing, one changed, and one destination-only file
is reported.

The persistent **Demo — sample data, nothing is saved to your real check**
banner provides **Reset demo** and **Start for real**. Demo inventories use the
separate IndexedDB database `demo:android-backup-receipt`; real checks use
`android-backup-receipt`. Demo licenses also use `demo:`-prefixed localStorage
keys, so it never reads or writes a real check or license state. Starting for
real clears the demo active inventory and returns to `/`.

The sample data is built into `src/main.ts`, so it is available offline after
the initial service-worker-controlled visit.
