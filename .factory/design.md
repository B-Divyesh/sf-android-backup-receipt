# Android Backup Receipt — visual thesis

## Direction

**Neo-brutalist utility, expressed as a field inspection docket.** Backup tools
usually ask for trust and disappear into the background. This product does the
opposite: it puts evidence on the table. Heavy rules, offset shadows, stamped
statuses, exposed counts, and receipt-like columns make every claim inspectable.
The visual world borrows from warehouse check sheets and Android file cards,
without imitating a system UI or becoming a novelty “paper receipt” theme.

The interface is deliberately single-mode light. A warm paper field makes the
high-contrast ink and verification colors legible in daylight during a phone
migration, when devices and cables are often spread across a desk. The page
explicitly paints that background; browser chrome uses the same color.

## Palette

| Token | Value | Purpose |
| --- | --- | --- |
| `paper` | `#F4F0E6` | warm off-white inspection sheet |
| `ink` | `#171713` | primary text and structural rules |
| `muted-ink` | `#57554E` | secondary copy (≥ 6.6:1 on paper) |
| `sheet` | `#FFFDF7` | raised working surface |
| `acid` | `#D7FF45` | primary action / active evidence |
| `blue` | `#3049C3` | informational marks and focus |
| `safe` | `#197247` | accounted-for status |
| `warn` | `#9A5600` | changed/attention status |
| `danger` | `#B32825` | missing/error status |
| `night` | `#25251F` | footer and inverse regions |

Status never depends on color: every mark includes a word, count, or symbol.
The palette is derived from physical inventory tags—fluorescent checked labels,
blue ballpoint annotations, and red discrepancy stamps.

## Typography

- **Headings / labels:** `Arial Black`, `Arial Narrow`, system sans-serif. The
  compressed, emphatic rhythm reads like equipment labeling and costs no font
  download.
- **Body / evidence:** `ui-monospace`, `SFMono-Regular`, `Cascadia Mono`,
  `Roboto Mono`, monospace. File paths and hashes align naturally; tabular
  figures are enabled throughout.
- Scale: 14 / 16 / 20 / 28 / clamp(42–76) px. Body remains at least 16px.
- Working copy stays within 68 characters; evidence tables may use the full
  workspace and scroll horizontally on narrow screens.

## Spacing and shape

An 8px base rhythm with 4px micro-spacing. Primary gaps are 16, 24, 32, 48,
and 72px. Corners are either square or 2px: this is a tool, not soft consumer
cloudware. Surfaces use 2px ink borders and 6px hard shadows. A stepped rail
connects the three jobs: inventory, compare, issue receipt.

At 390px, the evidence summary stacks, long paths wrap, and secondary notes
move beneath their controls. No fixed bottom navigation is used, preserving the
keyboard and safe area. Touch targets are at least 44px.

## Interaction grammar

- Primary actions invert the acid label and translate into their hard shadow on
  press, like operating a physical punch.
- Selection surfaces switch from dashed “awaiting evidence” to solid “loaded”.
- Scan progress advances in discrete rows and exposes the current filename.
- Results appear as a stamped receipt only after both inventories are present.
- Destructive history clearing requires a named confirmation and is not used in
  the core workflow.
- Focus is a 3px blue outer ring plus 2px paper gap.

## Motion policy

Movement communicates a document entering a workflow: sections reveal upward
by 8px over 180ms, buttons depress over 100ms, and the progress bar changes over
160ms. Nothing loops. Under `prefers-reduced-motion: reduce`, transforms and
transitions are removed; status changes are immediate and remain fully legible.

## Original asset plan and provenance

The hero illustration is an original generated editorial still life: an Android
phone-like blank device, an archive drive, file tiles, and a fluorescent audit
tag on a cream inspection table. It explains “compare device evidence with
backup evidence” without implying access to protected app data. No UI text,
logos, people, or provider branding appear.

Prompt sheet:

> Use case: stylized-concept. Asset type: landing-page hero illustration.
> Scene: top-down field inspection table. Subject: a generic black Android-like
> phone slab on the left, rugged external archive drive on the right, between
> them a tidy trail of small photo and document tiles passing through a bold
> rectangular verification frame. Style: tactile cut-paper editorial still
> life, neo-brutalist utility, crisp hard-edged shadows, subtle paper grain.
> Composition: landscape, strong diagonal movement, clear silhouettes, no
> interface screenshot. Lighting: hard overhead workbench light. Palette: warm
> receipt cream, near-black ink, fluorescent acid-lime verification tag,
> electric blue annotations, restrained brick red. Materials: paper, matte
> recycled plastic, rubber cable. Avoid: text, letters, numbers, logos,
> watermarks, brands, Google marks, people, hands, photorealistic UI, gradients,
> glassmorphism, extra devices, impossible cables.

Generated with the factory image deployment via `/opt/fleet/lib/gen-image.sh`
on 2026-08-28. The selected output is stored with its prompt sidecar in
`assets/src/`; optimized WebP derivatives are shipped from `public/assets/`.
Generated imagery is original to this product and used under the repository's
MIT license. Icons and the receipt seal are hand-authored SVG/CSS shapes.
The 1200×630 social preview is a center crop of the selected original hero,
and the 180px Apple touch icon is derived from the hand-authored app icon.
