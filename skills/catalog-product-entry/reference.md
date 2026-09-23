# Catalog contract reference

Read before writing or changing a `Product` in `lib/catalog.ts`.

## Required fields

A `Product` needs all of the following:

| Field | Shape | Notes |
| --- | --- | --- |
| `slug` | kebab-case, unique | This is the URL. |
| `name`, `sku` | strings | |
| `collection` | `"running" \| "court" \| "trail" \| "lifestyle"` | |
| `tagline` | one sentence | Fits on two lines on a card. |
| `story` | `string[]`, exactly 2 paragraphs | What it is, then how it is built + one honest trade-off. |
| `price` | number, whole euros | |
| `compareAtPrice` | optional number | When set, add a matching `badge`. |
| `rating`, `reviewCount` | number | |
| `inStock` | boolean | |
| `highlights` | exactly 4 strings | Construction facts, not marketing benefits. |
| `colors` | 2–3 `ColorOption` | Each needs its own `shot` — see Photography. |
| `sizes` | `SizeOption[]` | Built with `sizeRun()`. |
| `gallery` | 3–4 `Shot`, square 900×900 | The first shot doubles as the card/cart thumbnail. |
| `specs` | exactly 3 `SpecGroup`, 4 rows each | Group titles vary by product type — see below. |
| `badge` | optional | Must agree with `discountPercent()`. |
| `isNew` | optional boolean | Marks the product as part of the current drop. |

Spec group titles by product type: `Build`, `Geometry & weight`, `Fit & use`
for runners; `Construction`, `Provenance`, `Fit & care` for leather/court
shoes. Match the closest existing product of the same type.

## Photography

All imagery comes from Unsplash, served from `images.unsplash.com`.

- Card and colourway shots: portrait `900×1100`.
- Gallery shots: square `900×900`.
- Collection tiles: square `900×900`.
- Editorial: landscape.
- Always go through `photo(id, { w, h, q })` — never a hand-written URL with
  its own query parameters.
- **Verify every new ID before it enters the file** — run
  `scripts/verify_photo.sh <id>`. A 404 here is a broken product page in
  production, and it still passes typecheck and build, so nothing else in
  the toolchain will catch it.
- Reject any `plus.unsplash.com/premium_photo-*` result: it is not covered by
  `next.config.ts` → `images.remotePatterns`, and it is not free to use.
- `Shot.alt` describes the actual photograph, specifically — it is read aloud
  by screen readers, not decorative filler.

### Finding candidates

An Unsplash photo page for a short ID gives you the CDN URL. Fetch
`https://unsplash.com/photos/<shortId>` and read the
`images.unsplash.com/photo-...` URL off the page before verifying it.

## Editorial voice

The copy reads as if someone who actually makes shoes wrote it. Plain,
specific, slightly understated.

- **Concrete over promotional.** "224 g in EU 42" beats "incredibly
  lightweight". "11 stitches per inch" beats "expert craftsmanship".
- **Banned words**: "revolutionary", "game-changing", "premium" (as an
  adjective), "elevate", "curated" — and exclamation marks. Also banned: any
  sentence that could describe a different shoe unchanged. If you can swap in
  a competitor's name and the sentence still holds, rewrite it.
- **Admit the trade-off.** The second `story` paragraph must carry one honest
  limitation — runs narrow, dye transfers on first wear, 450 km midsole life.
  Copy with no downside reads like advertising, not documentation.
- **Real places and materials.** "a leather house outside Ancona", "pig suede
  overlays", "supercritical EVA" — not "premium materials".
- Reviews mention a size, a colourway and one real, specific detail. A
  five-star review that says nothing specific is worse than no review — drop
  it rather than publish it as filler.

## Derived values — do not duplicate them

- `colorFamily()` parses the swatch class; do not add a second colour field.
- `getReviewBreakdown()` synthesises the star histogram from `rating` +
  `reviewCount` — never hand-write the bars; they would drift from the
  displayed number the first time a product is edited.
- `colorFamilyFacets()` / `sizeFacets()` compute the catalog filter counts
  from `PRODUCTS` — if you add a facet, derive it the same way.
- `formatPrice` (whole euros, cards/titles) vs `formatMoney` (two decimals,
  cart/order lines) — use whichever matches where the number is displayed;
  never format money by hand in a component.

## Common mistakes

- A colourway reusing another colourway's `shot` — clicking the swatch
  silently does not change the image.
- `compareAtPrice` set without a `badge`, or a `badge` whose label does not
  match what `discountPercent()` computes from the two prices.
- Fewer than 4 `highlights` or fewer than 3 `gallery` shots — the buy box and
  the PDP gallery both assume the full count and render an ugly gap, not a
  visible error.
- A `story` with a single paragraph, or two paragraphs that both sell instead
  of the second one owning a limitation.
