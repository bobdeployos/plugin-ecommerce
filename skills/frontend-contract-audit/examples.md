# Before / after examples

Illustrative fixes for the most common violations, one per category in
`reference.md`.

## Base UI composition

**Before** (Radix reflex, silently does nothing):
```tsx
<Button asChild>
  <Link href="/products">Shop</Link>
</Button>
```

**After**:
```tsx
<Button nativeButton={false} render={<Link href="/products">Shop</Link>} />
```

## Tokens

**Before** (raw palette class, probably copied from the original block):
```tsx
<div className="bg-zinc-900 text-white">
```

**After**:
```tsx
<div className="bg-primary text-primary-foreground">
```

## Images

**Before**:
```tsx
<img src={product.gallery[0].src} alt={product.gallery[0].alt} />
```

**After**:
```tsx
<Image
  src={product.gallery[0].src}
  alt={product.gallery[0].alt}
  fill
  sizes="(min-width: 1024px) 25vw, 50vw"
  className="object-cover"
/>
```

## Data

**Before** (hardcoded, drifts from the catalog):
```tsx
<span>€164</span>
```

**After**:
```tsx
<span>{formatPrice(product.price)}</span>
```

## Cart state

**Before** (a second source of truth, disagreeing with the first):
```tsx
const [items, setItems] = useState(DEMO_CART_ITEMS)
```

**After**:
```tsx
const { items, setQuantity, removeLine } = useCart()
```

## What a clean audit report looks like

```
No contract violations on this diff.

Checked: components/storefront/wishlist-panel.tsx (new),
app/products/[slug]/page.tsx (prop change on the gallery).

- Base UI composition: render={} throughout, no asChild.
- Desktop only: no responsive prefixes added.
- Tokens: bg-card / text-muted-foreground only.
- Images: next/image with sizes in both changed places.
- Data: reads product.price via formatPrice(), nothing hardcoded.
```

## What a report with findings looks like

```
1. [BREAKS CONTRACT] components/storefront/wishlist-panel.tsx:42
   asChild used on <Button> wrapping <Link>. Base UI silently ignores
   asChild — the link never renders as the button's element.
   Fix: <Button nativeButton={false} render={<Link href={href} />}>...

2. [POLISH] components/storefront/wishlist-panel.tsx:58
   bg-zinc-100 used for the empty-state background instead of bg-muted.
   Not broken, but drifts from the token system.
```
