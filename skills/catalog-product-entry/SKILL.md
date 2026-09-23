---
name: catalog-product-entry
description: Writes or revises a product entry in lib/catalog.ts for the storefront — the slug, the tagline, the two-paragraph story, the four highlights, 2–3 colourways each with its own verified Unsplash photo, the size run, the three spec groups, and the reviews. Use whenever the user wants to add a new sneaker/pair/silhouette to the catalog, restock or retire a product, change a price or a sale badge, rewrite a tagline/story/highlights/specs, or add or edit customer reviews — even if they just say "add this pair to the site" or paste a product brief without ever naming lib/catalog.ts. Also use to review an existing entry for voice or missing fields. Do not use for a component or layout change in how products are displayed, nor to choose which ReUI block renders a product surface.
---

# Catalog product entry

`lib/catalog.ts` is the single source of truth for every product surface in
this storefront — the home grid, the catalog page, the PDP, the cart and the
checkout all read `PRODUCTS`. A component must never contain a hardcoded
price, name, image URL or size: if you are about to type `€164` into JSX, that
value belongs here instead.

**Language**: the copy this skill produces — `tagline`, `story`,
`highlights`, `alt` — is always in **English**, like all user-facing text in
the storefront, even when the conversation is in another language.

Read [reference.md](reference.md) for the full field-by-field contract and
the editorial voice rules before writing copy. Read
[examples.md](examples.md) for an approved product entry to use as a
benchmark — copy its *shape*, never its *content*.

## Procedure

1. **Read two or three existing products in `PRODUCTS`** (in
   `lib/catalog.ts`) first, to calibrate voice and completeness before
   writing yours.
2. **Fill every field** — `reference.md` lists what is required. A
   half-filled entry breaks whole surfaces: a missing colourway photo, an
   empty spec group.
3. **Write the copy** in the house voice: concrete, precise, one honest
   trade-off owned in the story. See "Editorial voice" in `reference.md` —
   it is short; read it rather than guess.
4. **Source and verify every photo before writing it into the file.** Never
   write an Unsplash ID you have not verified. Run:
   ```bash
   bash "${CLAUDE_SKILL_DIR}/scripts/verify_photo.sh" <photo-id>
   ```
   It must print `200 image/jpeg`. Anything else — including a
   `plus.unsplash.com/premium_photo-*` result — is disqualified; find another
   candidate. This is the most common way this catalog breaks in production,
   because a bad ID still passes typecheck and build.
5. **Use the helpers, never raw values**: `photo(id, {w,h,q})` for every
   image, `sizeRun()` for sizes, `formatPrice`/`formatMoney` for money
   everywhere else in the app.
6. **If you set `compareAtPrice`**, add a `badge` whose label matches what
   `discountPercent()` would compute — never hand-write a percentage that
   could drift from the prices.
7. **Reviews** go in `REVIEWS_BY_SLUG`; each names a size, a colourway and a
   concrete detail. Do not touch `getReviewBreakdown()` — it derives the
   histogram from `rating` + `reviewCount` automatically.
8. **Finish with**:
   ```bash
   npx tsc --noEmit && npm run build
   ```
   Then state which photo IDs you verified and what you changed. To re-check
   every photo already in the catalog at once, run
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/verify-photos.mjs"` from the project
   root.

For an addition that needs a lot of research — sourcing photography from
scratch for an entirely new product from a one-line brief — consider
delegating to the `catalog-writer` agent so the work happens in its own
context. It follows the same procedure. `/storefront:product` runs it as a
command.
