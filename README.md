# Sneakers Storefront Toolkit

A Claude Code plugin that packages everything needed to work on the
[APEX ATELIER](../ecommerce-demo) sneaker storefront — a desktop-only Next.js 16
shop built from ReUI premium blocks.

It bundles all five plugin component types: **skills**, **agents**,
**commands**, **hooks** and **scripts**.

## Install

```
/plugin marketplace add ../plugin-sneakers-storefront
/plugin install sneakers-storefront@sneakers-storefront-marketplace
```

From a checkout elsewhere, point the marketplace at this directory or its git
remote instead.

## What is in it

### Skills — the know-how

Loaded automatically when the work matches.

| Skill | Covers |
| --- | --- |
| `reui-premium-blocks` | Finding, installing and adapting premium blocks; the Base UI vs Radix trap; licence setup; theming |
| `nextjs-16-rules` | The Next 16 breaking changes that actually bite — async params, image config, the removal of `next lint`, and the RSC boundary bug |
| `storefront-architecture` | Where everything lives, the desktop-only shell, cart state, order totals |
| `product-catalog` | The `Product` contract, the editorial voice, and how to verify a photo resolves |

### Agents — the specialists

| Agent | Use it for |
| --- | --- |
| `block-scout` | Deciding which ReUI block a new surface should be built from. Reports a recommendation and the real API; writes no app code |
| `ui-reviewer` | Auditing a diff against the frontend contract — composition, layout, tokens, images, data discipline |
| `catalog-writer` | Adding or rewriting products, in voice, with every photo verified |
| `checkout-auditor` | Walking the whole purchase path for numbers and counts that quietly disagree |

### Commands

| Command | Does |
| --- | --- |
| `/storefront:status` | Inventory + contract scan: routes, blocks, catalog, violations |
| `/storefront:audit-ui` | Audits changed frontend code; `--fix` applies the fixes |
| `/storefront:new-page` | Adds a route, built from the right block rather than hand-rolled |
| `/storefront:product` | Adds or revises a catalog product, photos verified |

### Hooks — the guardrails

**`PostToolUse`** on `Write|Edit` runs `hook-storefront-guard.mjs` against the
file just written. It exists because every mistake it catches **typechecks and
builds cleanly** — nothing else will find them:

- `asChild` in a Base UI project (silently does nothing)
- raw `<img>` instead of `next/image`
- importing from `components/blocks/`, the pristine reference copy
- responsive prefixes in a desktop-only layout
- raw Tailwind palette classes instead of theme tokens
- hardcoded prices and `toFixed(2)` instead of the money helpers
- `props.params` / `props.searchParams` read without `await`

It reports rather than blocks, so the model can correct itself in the same turn.

**`SessionStart`** runs `hook-session-brief.mjs`, which puts the two
easy-to-get-wrong facts up front — this is Base UI, and this is Next 16 — and
warns if `REUI_LICENSE_KEY` is missing. It stays silent outside a matching
project.

### Scripts

Runnable on their own from the storefront project root:

```bash
node scripts/storefront-status.mjs            # inventory + contract scan
node scripts/storefront-status.mjs --verbose
node scripts/storefront-status.mjs --violations-only
node scripts/verify-photos.mjs                # check every catalog photo resolves
```

Both exit non-zero on failure, so they work in CI as well as in a conversation.

## Layout

```
.claude-plugin/
  plugin.json          manifest
  marketplace.json     local marketplace entry
agents/                4 subagent definitions
commands/              4 slash commands
skills/<name>/SKILL.md 4 skills
hooks/hooks.json       PostToolUse + SessionStart
scripts/               hook and utility scripts (Node, no dependencies)
```

`${CLAUDE_PLUGIN_ROOT}` resolves to the plugin install directory, which is how
the commands and hooks locate the scripts regardless of where the plugin ends
up on disk.

## Requirements

- Node 18+ (the scripts use the global `fetch`)
- A storefront project with `components.json` declaring a `@reui` registry and
  `next` in its dependencies — the session hook checks for both before saying
  anything.

## Licence

MIT.
