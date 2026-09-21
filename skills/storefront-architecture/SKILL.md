---
name: storefront-architecture
description: Use when navigating or extending the APEX ATELIER storefront — where each route, component and library module lives, how the desktop-only shell works, how cart and wishlist state flows, and how order totals are computed. Read this before adding a page or moving a component.
group: storefront
icon: map
---

# Storefront architecture

A **desktop-only, frontend-only** sneaker storefront. No backend, no database,
no payment provider. Everything renders from a static catalog and a
client-side cart.

## Routes

| Route | Rendering | Notes |
| --- | --- | --- |
| `/` | Static | Season hero, featured 4-up, collections, atelier editorial |
| `/products` | Dynamic | Reads `searchParams` (`?collection=`, `?sale=true`) |
| `/products/[slug]` | SSG | `generateStaticParams` over the catalog |
| `/cart` | Static | Shell is static; the bag itself is client state |
| `/checkout` | Static | Three-step stepper, then confirmation |

## Directory contract

```
app/                      routes only — thin, mostly composition
components/
  blocks/                 pristine ReUI blocks, exactly as installed
  storefront/             the adapted components the app imports
  ui/ · reui/             shadcn + ReUI primitives
lib/
  catalog.ts              products, collections, photography, reviews, money
  cart-store.tsx          cart + wishlist context ("use client")
  order.ts                totals, VAT, delivery tiers, promo code
  filters.ts              catalog filter shape — plain module, RSC-safe
```

Two hard rules:

1. **Nothing imports from `components/blocks/`.** It is a reference copy so any
   adapted component can be diffed against its original. Do not edit it either.
2. **Every file in `components/storefront/` opens with a comment naming its
   source ReUI block and what changed.** Keep it accurate.

## Desktop only

There is no mobile layout, by design.

- `.desktop-shell` in `globals.css` is `display: none` below 1024px and
  `display: flex` above it.
- `<DesktopOnlyNotice>` fills the viewport under `lg`, hidden above it.
- **CSS-only on purpose** — no viewport JS means no hydration mismatch and no
  flash of the wrong layout.
- Do not add `sm:` / `md:` / `lg:` prefixes to layout. Grids are fixed:
  4-up home, `[280px_1fr]` catalog, `[1.4fr_minmax(360px,1fr)]` PDP,
  `[1fr_360px]` cart and checkout.

## Cart and wishlist state

One context, in `lib/cart-store.tsx`, consumed via `useCart()`.

```tsx
const { resolved, count, subtotal, savings, addLine, setQuantity,
        removeLine, clear, wishlist, toggleWishlist, isWishlisted,
        miniCartOpen, setMiniCartOpen, lastAddedId, hydrated } = useCart()
```

- A `CartLine` stores only `slug` + `colorId` + `size` + `quantity`. It is
  joined against the catalog into a `ResolvedCartLine` at read time, so a
  price change in `catalog.ts` is reflected immediately and a line whose
  product was deleted is dropped rather than rendered as a hole.
- Line identity is `slug__colorId__size`, so the same shoe in two sizes is two
  lines and re-adding the same variant increments.
- Persisted to `localStorage`. Every read and write is wrapped in try/catch —
  private mode and blocked storage must not break the page.
- **Hydration:** the provider renders a seed bag on the server and on the first
  client render, then loads `localStorage` in an effect and flips `hydrated`.
  Do not read `localStorage` during render.
- ReUI ecommerce blocks ship their own local `useState` demo arrays. When you
  adapt one, delete that state and read the store, or the header count and the
  cart page will disagree.

## Order totals

`lib/order.ts` owns the money. The cart page, the mini cart and the checkout
rail all call `computeTotals()` so they cannot drift apart.

```ts
computeTotals({ subtotal, promoApplied, delivery })
// → { subtotal, discount, delivery, tax, total }
```

- Promo `ATELIER10` → 10% off the subtotal.
- VAT 23%, applied to the **discounted** subtotal.
- Standard delivery is free once the net clears `FREE_SHIPPING_THRESHOLD`
  (€150); express and overnight always cost their fee.

Add a tier or change a rate **here**, never in a component.

## Money formatting

- `formatPrice()` — whole euros, for cards and headline prices.
- `formatMoney()` — two decimals, for cart lines and totals.

Never `toFixed(2)` inline and never a hardcoded `€`.

## Adding a page

1. Create `app/<route>/page.tsx`.
2. `npx next typegen` so `PageProps<'/route'>` exists.
3. `await props.params` / `await props.searchParams` — both are async.
4. Build the surface from a ReUI block (see the `reui-premium-blocks` skill).
5. Put shared constants the server page needs in `lib/`, not in the client
   component.
6. `npx tsc --noEmit && npm run build`, then look at it in the browser.
