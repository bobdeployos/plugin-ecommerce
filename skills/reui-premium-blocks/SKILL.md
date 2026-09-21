---
name: reui-premium-blocks
description: Use when building or changing any UI surface in a ReUI storefront — finding the right premium block, installing it from the registry, reading its real API, and adapting it onto real data. Also covers the Base UI (base-nova) composition rules that differ from Radix, and the licence-key setup for the premium registry.
group: storefront
icon: layers
---

# ReUI premium blocks

The rule is **reuse, do not rebuild**. If you are about to hand-write a product
card, a filter sidebar or a checkout stepper, stop — the registry already has
one, and a bespoke version will not match the rest of the storefront.

## Find the block

```
search({ query: "...", type: "block", category: "...", surface: "card" })
```

Ecommerce categories worth knowing:

| Category | Count | Use for |
| --- | --- | --- |
| `shop-hero` | 8 | Storefront landing heroes |
| `product-grid` | 6 | Collection and catalog grids |
| `product-card` | 10 | A single tile |
| `product-detail` | 6 | Full PDP |
| `filter-sidebar` | 7 | Faceted refinement |
| `shopping-cart` | 7 | Bag page, mini cart, quick cart |
| `checkout` | 7 | Multi-step and express checkout |
| `review`, `wishlist`, `coupon`, `receipt`, `comparison`, `category-card` | 6 each | Supporting surfaces |

`list_block_categories` gives the full list when none of these fit.

## Hold one surface

Blocks render on either a **ReUI Frame** or a **shadcn Card**. Pick one for the
project and never mix them on a screen — it reads as two design systems bolted
together. Pass `surface` on every `search` and `compose_page`. Blocks reported
as `surface: "none"` (heroes, navbars, empty states) fit either mode.

The APEX ATELIER storefront is **Card**.

## Read the real API before writing props

```
get_component("<name>")   # the actual props
get_examples("<name>")    # the actual composition
```

Do not infer a ReUI component's props from its name. `Rating` takes
`rating` + optional `editable`/`showValue`; `Badge` takes `variant`, `size`,
`radius`; `Frame` composes as `Frame > FramePanel`. Guessing produces code that
typechecks and renders wrong.

## Install

```bash
npx shadcn@latest add @reui/<block-name> --yes
```

The premium registry needs a licence. Put it in `.env.local`:

```bash
REUI_LICENSE_KEY=REUI-XXXX-XXXX-XXXX-XXXX
```

and reference it from `components.json` — never inline the key:

```json
{
  "style": "base-nova",
  "registries": {
    "@reui": {
      "url": "https://reui.io/r/{style}/{name}.json",
      "headers": { "Authorization": "Bearer ${REUI_LICENSE_KEY}" }
    }
  }
}
```

**If `shadcn add @reui/x` reports "not found"**, `x` is probably a plain shadcn
primitive rather than a ReUI one. Retry without the prefix:
`npx shadcn@latest add select`.

**`lucide-react` is not pulled in automatically** even though every block
imports from it. Install it once, or the first typecheck fails on every file.

## base-nova is Base UI, not Radix

This is the single most common source of silent breakage.

```tsx
// Correct — Base UI `render` prop
<Button nativeButton={false} render={<Link href="/cart" />}>View bag</Button>
<SheetTrigger render={<Button variant="outline">Open</Button>} />
<BreadcrumbLink render={<Link href="/products" />}>Shop</BreadcrumbLink>

// Wrong — `asChild` is Radix; it is ignored here
<Button asChild><Link href="/cart">View bag</Link></Button>
```

Other Base UI differences that bite:

- `<Accordion multiple defaultValue={["a","b"]}>` — not `type="multiple"`.
- `<SelectValue>` prints the **raw value**. For a label, pass a render
  function: `<SelectValue>{(v) => LABELS[v]}</SelectValue>`.
- `onCheckedChange` may yield an indeterminate value — narrow with
  `checked === true` before storing a boolean.
- `Tooltip` needs a `TooltipProvider` somewhere above it; put it in the root
  layout once.

## Theme tokens, not palette classes

A fresh ReUI block install may only merge ReUI's *extra* tokens (`success`,
`warning`, `info`, `invert`) without the shadcn base set. If `bg-card`,
`border-border` or `bg-primary` render as nothing, the base tokens are missing
from `globals.css`. You need the full `@theme inline` map plus `:root` / `.dark`
definitions, and these imports:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
```

Once they exist, theme **only** through tokens. Raw palette classes
(`bg-zinc-900`, `text-slate-500`) break dark mode and drift from the blocks.

## Adapt by reuse

Keep the installed blocks pristine in `components/blocks/` as a reference, and
put the wired-up versions in `components/storefront/`. Nothing in the app
should import from `components/blocks/`.

When adapting a block, the work is almost always the same five moves:

1. Replace its module-level demo constants with props or the real catalog.
2. Replace its local `useState` cart/wishlist state with the shared store.
3. Replace `<img>` with `next/image` + `sizes`.
4. Strip mobile breakpoints if the project is desktop-only.
5. Replace `$` / `en-US` formatting with the project's money helpers.

Open every adapted file with a comment naming its source block and what
changed. That comment is how the next person finds the original.

## Before finishing

```
validate_usage(...)
get_audit_checklist()
```

Then `npx tsc --noEmit && npm run build`.
