---
description: Add a new storefront route, built from the right ReUI premium block rather than hand-rolled
argument-hint: "<route> <what the page is for>   e.g. /wishlist saved products with quick add"
allowed-tools: Bash(npx:*), Bash(npm:*), Bash(node:*)
---

Add a new page to the storefront: `$ARGUMENTS`

Do not start writing JSX. Work in this order.

**1. Pick the block.** Launch the **block-scout** agent with the surface
description. It returns a recommendation, the install command, the real API and
adaptation notes. If it reports the block is already installed, adapt the
existing copy in `components/blocks/` instead of installing again.

**2. Install it.**

```
npx shadcn@latest add @reui/<block-name> --yes
```

Leave the installed copy in `components/blocks/` untouched — it is the
reference. If the CLI reports the item as not found, it is a plain shadcn
primitive: retry without the `@reui/` prefix.

**3. Adapt it into `components/storefront/`.** The usual five moves:

- module-level demo constants → props or `lib/catalog.ts`
- local `useState` cart/wishlist state → `useCart()`
- `<img>` → `next/image` with `sizes`
- strip every mobile breakpoint — this project is desktop-only
- `$` / `en-US` formatting → `formatPrice` / `formatMoney`

Open the file with a comment naming the source block and what you changed.

**4. Create the route** at `app/<route>/page.tsx`, then:

```
npx next typegen
```

so `PageProps<'/<route>'>` exists. `params` and `searchParams` are **async** —
await them. Any constant the server page shares with a client component goes in
`lib/`, never exported from the `"use client"` module.

**5. Wire it into navigation** — `components/storefront/site-header.tsx` and
`site-footer.tsx` — so the page is reachable.

**6. Verify.**

```
npx tsc --noEmit && npm run build
```

Then run `npm run dev` and actually look at the page at 1280px or wider. A
green build says nothing about whether it looks right.

Report the route, the block it came from, and what you had to rewire.
