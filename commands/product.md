---
description: Add a product to the catalog, or rewrite an existing one's copy, specs and reviews
argument-hint: "<slug or description>   e.g. a trail runner in Gore-Tex around €240"
allowed-tools: Bash(node:*), Bash(npx:*), Bash(npm:*), Bash(curl:*)
---

Add or revise a catalog product: `$ARGUMENTS`

Launch the **catalog-writer** agent for this. It carries the editorial voice
and the photo verification procedure.

What it must produce, in `lib/catalog.ts` and nowhere else:

- a complete `Product` — no field left out, `slug` kebab-case and unique
- `tagline` in one sentence, `story` in exactly two paragraphs, `highlights` as
  exactly four construction facts
- 2–3 colourways, **each with its own distinct photograph**, because the card
  swatches swap the hero image
- 3–4 square gallery shots, 3 spec groups of 4 rows
- reviews in `REVIEWS_BY_SLUG` that name a size, a colour and a real detail

**Photography is the part that goes wrong.** Every Unsplash ID must be
verified before it lands in the file:

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/verify-photos.mjs"
```

That scans `lib/catalog.ts` and checks every referenced photo resolves to a
real image. Run it after writing. Anything that is not `200 image/jpeg` has to
be replaced — a dead ID is an invisible break that only shows in production.
`plus.unsplash.com/premium_photo-*` URLs are not usable at all.

Then:

```
npx tsc --noEmit && npm run build
```

Report the slug, its collection and price, and confirm which photo IDs you
verified. If you revised an existing product, say what changed and why.
