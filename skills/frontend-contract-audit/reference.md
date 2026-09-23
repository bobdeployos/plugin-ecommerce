# Audit checklist, with the reasoning behind each rule

## Base UI composition

This project's shadcn style is `base-nova`, built on `@base-ui/react`, not
Radix — so Radix reflexes produce code that silently does nothing, rather
than an error you would notice.

- `asChild` anywhere → wrong. Base UI composes with `render={<El />}`
  instead. `asChild` is not a recognised prop here, so it is simply ignored —
  the component renders its default element instead of yours, and nothing
  tells you it happened.
- `<Button>` wrapping a `<Link>` as a child, instead of
  `nativeButton={false} render={<Link/>}`.
- `<SelectValue />` without a render function where a label is expected —
  it prints the raw stored value (e.g. `"chalk"` instead of `"Chalk"`).
- `Accordion` using `type="multiple"` (Radix) instead of `multiple` (Base
  UI's real prop).
- `onCheckedChange` results stored without narrowing to `=== true` — Base
  UI's checkbox can report an indeterminate state, and storing it straight
  into a boolean field silently passes along a non-boolean.

## Desktop only

There is no mobile layout in this project, by design — `<DesktopOnlyNotice>`
takes the whole viewport below 1024px, in CSS alone, precisely so there is no
viewport JS and no hydration mismatch.

- Any `sm:` / `md:` / `lg:` prefix on layout in `components/storefront/` or
  `app/` is a sign someone is designing a responsive breakpoint this project
  has no use for and nobody will ever see.
- A grid template changed from the project's fixed ones (4 columns on the
  home page, 3 columns + a 280px filter rail on the catalog,
  `[1.4fr_minmax(360px,1fr)]` on the PDP, `[1fr_360px]` on cart/checkout) —
  these are deliberate choices, not demo values to "fix".

## Tokens

The palette is deliberately achromatic — the sneaker photography brings the
colour, not the UI chrome. A raw palette class is often a sign someone
copied a value straight from the original ReUI block instead of adapting it.

- Raw Tailwind palette classes for chrome (`bg-zinc-900`, `text-slate-500`,
  `border-gray-200`). The only allowed exception is product **swatch**
  classes in `lib/catalog.ts`, where the hue *is* the data being displayed.
- A hand-coloured pill where `<Badge variant="...">` already covers it.
- Any new brand hue introduced anywhere.

## Images

- `<img>` instead of `next/image` — installed ReUI blocks ship `<img>` by
  default, so converting it is part of the adaptation, not optional polish.
- `next/image` without `sizes`, or `fill` without a positioned parent.
- A remote host not covered by `next.config.ts` → `images.remotePatterns`
  (today, only `images.unsplash.com/photo-**`) — it fails at request time,
  not at build, so it is easy to miss locally if the image was already cached.
- `quality` set outside `[75, 90]` — `images.qualities` silently snaps it to
  the nearest allowed value, so `quality={85}` does not crash, it is just
  quietly not 85.

## Data

`lib/catalog.ts` is the single source of truth precisely so a price or a
photo only ever has to change in one place.

- A price, product name, size or image URL hardcoded in a component — it
  belongs in `lib/catalog.ts` instead.
- Cart or wishlist state held in a local `useState` instead of `useCart()` —
  this is exactly the bug pattern where the header cart count stops matching
  the cart page, because they read two different states.
- A value exported from a `"use client"` module and imported by a Server
  Component — it crosses the boundary as a client reference, not the object,
  and reads as `undefined`. Shared constants/types a Server Component needs
  must live in a plain module under `lib/` instead (that is why
  `lib/filters.ts` exists).

## Block hygiene

`components/blocks/` exists so an adapted component can always be diffed
against what it started from. That only works if the folder stays pristine.

- An import from `components/blocks/` in application code — that folder is
  reference only, never a dependency.
- A change to a file under `components/blocks/` itself.
- An adapted file in `components/storefront/` whose header comment no longer
  accurately names its source block — that comment is how you find the
  original to compare against.

## Accessibility

- Interactive elements without an accessible name.
- Decorative images without `alt="" aria-hidden="true"`.
- A colour swatch button without an `sr-only` label — the swatch only
  conveys the colour visually.

## Verify, do not assume

```bash
npx tsc --noEmit
npm run build
```

Neither catches most of the rules above — they are conventions, not type
errors — but they are cheap and catch real breakage, so run them rather than
assuming the diff builds.
