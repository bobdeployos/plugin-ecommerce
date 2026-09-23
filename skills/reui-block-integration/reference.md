# ReUI integration reference

## Surface consistency — the most important rule

ReUI blocks come on one of two surfaces: **Frame** or **Card**. This project
is **Card** everywhere. Always pass `surface: "card"` to search. A block
listed as `surface: "frame"` is disqualified outright — mixing one into a
Card-surface screen breaks the visual system. `surface: "none"` blocks
(heroes, navbars, empty states) are safe anywhere.

## Categories that matter here

`shop-hero`, `product-grid`, `product-card`, `product-detail`,
`filter-sidebar`, `shopping-cart`, `checkout`, `review`, `wishlist`,
`coupon`, `receipt`, `category-card`. Use `list_block_categories` if none of
these clearly matches what you are building.

## Base UI, not Radix

`components.json` sets `style: "base-nova"` — every primitive here is built
on `@base-ui/react`, not Radix. This is the most common way an adapted block
breaks silently, because it does not crash, it just does something other
than what you expect:

```tsx
// Correct — Base UI composition
<Button nativeButton={false} render={<Link href="/cart" />}>View bag</Button>
<SheetTrigger render={<Button variant="outline">Open</Button>} />

// Wrong — asChild is a Radix convention and does nothing here
<Button asChild><Link href="/cart">View bag</Link></Button>
```

Other Base UI traps to check after an adaptation:
- `SelectValue` prints the raw stored value unless you pass a render
  function: `<SelectValue>{(v) => LABELS[v as Key]}</SelectValue>`.
- `Accordion` takes `multiple` + `defaultValue={[...]}`, not
  `type="multiple"`.
- `onCheckedChange` can receive an indeterminate value — narrow with
  `checked === true` before storing a boolean.

## Licence

`REUI_LICENSE_KEY` lives in `.env.local` (gitignored). It is referenced from
`components.json` as `${REUI_LICENSE_KEY}` so the CLI expands it at install
time — never hardcode the key itself in `components.json`, and never commit
it.

## Theming during adaptation

Use tokens only: `bg-card`, `text-muted-foreground`, `border-border`,
`bg-primary`, `ring-ring`, plus the ReUI extras `success` / `warning` /
`info` / `invert`. Never a raw Tailwind palette class (`bg-zinc-900`,
`text-slate-500`) for chrome — the only allowed exception is product swatch
classes in `lib/catalog.ts`, where the hue *is* the data. The palette is
deliberately achromatic; the sneaker photography brings the colour, so a new
brand hue anywhere else is a regression, not a style choice.

## Images

Always `next/image`, never the `<img>` blocks ship by default. Remote hosts
must be declared in `next.config.ts` → `images.remotePatterns` (today, only
`images.unsplash.com/photo-**` is allowed). `images.qualities` is
`[75, 90]` — any other `quality` prop is silently snapped to the nearest
allowed value, so `quality={85}` will not crash, it just will not be 85.
`fill` needs a positioned parent, and always pass `sizes`.

## Server/client boundary

A **value** exported from a `"use client"` module arrives in a Server
Component as a client reference, not the object itself — spreading it yields
`undefined` fields, and the page crashes at runtime while the build stays
green. Shared constants/types a Server Component needs must live in a plain
module under `lib/` (see `lib/filters.ts`, which exists for exactly this
reason), never next to the client component that also uses them.
