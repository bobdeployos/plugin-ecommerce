---
name: product-catalog
description: Use when adding a product, changing a price, sourcing product photography, or writing product copy, specs and reviews for the storefront catalog. Covers the Product data contract, the editorial voice, and how to verify an Unsplash photo resolves before committing it.
group: storefront
icon: package
---

# The product catalog

`lib/catalog.ts` is the single source of truth. The season hero, the collection
grid, the catalog facets, the PDP, the cart and the checkout summary all read
from it.

**If you are typing a price, a product name, a size or an image URL into a
component, stop.** It belongs here.

## The Product shape

```ts
type Product = {
  slug: string              // kebab-case, unique — this is the URL
  name: string
  sku: string
  collection: "running" | "court" | "trail" | "lifestyle"
  tagline: string           // one sentence, ≤ 2 lines on a card
  story: string[]           // exactly two paragraphs
  price: number
  compareAtPrice?: number   // when set, add a matching `badge`
  rating: number
  reviewCount: number
  inStock: boolean
  highlights: string[]      // exactly four construction facts
  colors: ColorOption[]     // 2–3, each with its own photo
  sizes: SizeOption[]       // build with sizeRun()
  gallery: Shot[]           // 3–4 square shots
  specs: SpecGroup[]        // 3 groups × 4 rows
  badge?: { label: string; variant: "default" | "destructive" }
  isNew?: boolean
}
```

Fill every field. A half-populated product renders broken surfaces downstream.

- Each colourway needs its **own distinct photo** — card swatches swap the hero
  image, so a colour without its own shot is a visible bug.
- `sizeRun()` builds the standard EU 39–46 run. Override only the sizes whose
  stock state differs: `sizeRun({ "41": "out", "45": "low" })`.
- `compareAtPrice` + `badge.label` must agree with `discountPercent()`.
- Spec group titles vary by product type: `Build` / `Geometry & weight` /
  `Fit & use` for runners; `Construction` / `Provenance` / `Fit & care` for
  leather.

## Photography — verify, never assume

All imagery is Unsplash, served from `images.unsplash.com` and declared in
`next.config.ts` → `remotePatterns`.

**An unverified photo ID is a broken product card in production.**

1. Find candidates. A photo page gives the CDN URL — fetch
   `https://unsplash.com/photos/<shortId>` and read the `images.unsplash.com/photo-...`
   URL out of it. (Scraping the search page directly is blocked; fetching an
   individual photo page through a fetch tool works.)
2. **Reject `plus.unsplash.com/premium_photo-*`** — not covered by
   `remotePatterns` and not free to use.
3. Verify every ID resolves before writing it into the file:
   ```bash
   curl -s -o /dev/null -w "%{http_code} %{content_type}\n" \
     "https://images.unsplash.com/photo-XXXX?auto=format&fit=crop&w=400&q=60"
   ```
   Anything other than `200 image/jpeg` is disqualified.
4. Build URLs with the `photo(id, { w, h, q })` helper, never a raw string.
5. Sizes: colourway and card shots portrait `900×1100`; gallery square
   `900×900`; collection tiles `900×900`; editorial landscape.
6. `alt` describes the actual photograph, specifically. It is read aloud.

## Editorial voice

The copy reads like someone who makes shoes wrote it: plain, specific, a little
understated.

- **Concrete over promotional.** "224 g in EU 42" beats "incredibly
  lightweight". "11 stitches per inch" beats "expert craftsmanship".
- **Banned:** "revolutionary", "game-changing", "premium" as an adjective,
  "elevate", "curated", exclamation marks, and any sentence that could equally
  describe a different shoe.
- **Admit a trade-off.** The second `story` paragraph carries one honest
  limitation — runs narrow, dye transfers on first wear, 450 km midsole life.
  Copy with no downside reads like advertising.
- Real materials and places: "a leather house outside Ancona", "pig suede
  overlays on layered mesh", "supercritical EVA".

## Reviews

`REVIEWS_BY_SLUG[slug]`, falling back to `DEFAULT_REVIEWS`. Each review names a
size, a colourway and one concrete detail — mileage, break-in, fit. Mix the
ratings; not every review is a five. A review that could be pasted onto another
product is worse than no review.

You never hand-write the histogram: `getReviewBreakdown()` derives it from
`rating` and `reviewCount`, so the bars always agree with the headline number.

## Derive, do not duplicate

- `colorFamily()` parses the swatch Tailwind class instead of storing a second
  field — the hue and shade already encode the family.
- `colorFamilyFacets()` / `sizeFacets()` compute filter counts from `PRODUCTS`.

If you add a facet to the catalog page, derive it the same way. A hand-written
count drifts the first time someone edits a product.

## Finish

```bash
npx tsc --noEmit && npm run build
```

Then state which photo IDs you verified.
