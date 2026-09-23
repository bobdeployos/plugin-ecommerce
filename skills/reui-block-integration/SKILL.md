---
name: reui-block-integration
description: Step-by-step workflow to find, install and adapt a ReUI premium block (base-nova / Base UI style) for a new or reworked storefront surface — a page, a section, a panel, a hero, a grid, a sidebar, a cart or a checkout screen. Use whenever the user asks to build a new page or section, add a UI surface, redo part of the shop, or wants a component that goes beyond touching up existing code — even if they never say "ReUI", "block" or "shadcn" (e.g. "add a wishlist page", "I need a testimonials section", "make a size-guide panel"). Also covers adapting an already-installed block from components/blocks/ into components/storefront/. Do not use to change product data (that belongs in lib/catalog.ts), nor for a plain content or copy tweak with no new UI structure.
---

# ReUI block integration

This storefront is assembled from ReUI premium blocks, not hand-made
components. **Reuse, do not rebuild** — before writing a new surface, find
the block that already does it. Hand-coding a card, a sidebar or a hero that
ReUI already ships breaks the visual system this project depends on.

Code, code comments and all user-facing text stay in English.

Read [reference.md](reference.md) for the surface rule, the Base UI traps,
and the theming/image/boundary rules that apply during adaptation. Read
[examples.md](examples.md) for the table of blocks already installed and an
annotated adaptation.

## Procedure

1. **Check what is already installed first.** Look at `components/blocks/`
   and the table in `examples.md` — the block you need may already be in the
   project, adapted in `components/storefront/`. If so, point to that rather
   than recommending a new install.
2. **Search the ReUI registry** for a new surface: `search({ query, type:
   "block", category })`, always with `surface: "card"` — see
   `reference.md` for why, and for the list of categories that matter here.
3. **Read the real API before writing a single prop** — `get_component` on
   everything you plan to use. Never guess a ReUI component's props from its
   name; Base UI prop names are often not what Radix experience suggests.
4. **See it composed** — `get_examples` on your chosen candidate.
5. **Install**: `npx shadcn@latest add @reui/<name> --yes`. If the CLI says
   the item is not found, it is probably a plain shadcn primitive — retry
   without the `@reui/` prefix.
6. **Adapt a copy in `components/storefront/`** — never modify or import
   from `components/blocks/`, which stays pristine as a reference. The usual
   adaptation work, in order:
   - Replace module-level demo constants with data from `lib/catalog.ts`.
   - Replace local demo `useState` cart/wishlist state with `useCart()`.
   - Replace `<img>` with `next/image` + `sizes`.
   - Strip mobile breakpoints (`sm:` / `md:` / `lg:`) — this project is
     desktop only.
   - Replace `$` / `en-US` formatting with `formatPrice` / `formatMoney`.
   - Open the file with a comment naming the source block and what changed.
7. **Validate** — `validate_usage` and `get_audit_checklist` before calling
   it done. For a deeper pass, delegate to the `ui-reviewer` agent, or use
   the `frontend-contract-audit` skill.

If nothing in the registry genuinely fits, say so explicitly rather than
quietly hand-rolling — name the closest primitives to compose from.

For the broader background (licence setup, theme token bootstrap, the
`lucide-react` gotcha) see the `reui-premium-blocks` skill. To delegate the
search itself, use the `block-scout` agent; `/storefront:new-page` runs this
whole workflow end to end for a new route.
