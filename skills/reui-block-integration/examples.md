# Blocks already installed in the storefront

Check this table before recommending a new install — the surface you need
may already exist.

| Block | Adapted in |
| --- | --- |
| `@reui/shop-hero-6` | `components/storefront/season-hero.tsx` |
| `@reui/navbar-12` | `components/storefront/site-header.tsx` |
| `@reui/product-grid-1` | `components/storefront/product-card.tsx` |
| `@reui/product-detail-1` | `components/storefront/product-detail/*` |
| `@reui/filter-sidebar-6` | `components/storefront/catalog-filters.tsx` |
| `@reui/shopping-cart-5` | `components/storefront/cart-view.tsx`, `order-summary.tsx` |
| `@reui/shopping-cart-7` | `components/storefront/mini-cart.tsx` |
| `@reui/checkout-2` | `components/storefront/checkout-view.tsx` |

Every adapted file opens with a comment naming its source block — keep that
comment accurate when you touch one of these files. If the project has grown
since this table was written, trust the header comments in
`components/storefront/` over this list.

## An annotated adaptation — `components/storefront/mini-cart.tsx`

Adapted from `@reui/shopping-cart-7`. Its header comment, verbatim:

```tsx
// Adapted from the ReUI premium block `@reui/shopping-cart-7` (mini cart
// slide-out). The block's local `useState` demo lines were replaced by the
// shared cart store so the drawer, the header count and the cart page all
// read the same bag.
```

What actually changed, confirmed in the file:

- `const [items, setItems] = useState(DEMO_ITEMS)` → `const { setQuantity,
  removeLine } = useCart()`, reading the shared store instead of local demo
  state.
- Hardcoded `$` amounts → `formatMoney(line.lineTotal)`,
  `formatMoney(subtotal)`, `formatMoney(FREE_SHIPPING_THRESHOLD)`.
- `<img>` → `<Image>` from `next/image` with an explicit `sizes="64px"`,
  since the thumbnail renders at a fixed size in the slide-out panel.

Treat this as the template for what a typical adaptation involves. The
details change from block to block, but the categories of change — demo
state → catalog/store, `$` → formatter, `<img>` → `next/image`, mobile
stripped — come back almost every time.

## Shape of a search call

```
search({ query: "wishlist panel", type: "block", category: "wishlist", surface: "card" })
```

Not:
```
search({ query: "wishlist" })   // type/category/surface missing — too broad
```
