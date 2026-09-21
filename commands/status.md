---
description: Report the health of the storefront — routes, installed ReUI blocks, catalog size, and any contract violations found by a static scan
argument-hint: "[--verbose]"
allowed-tools: Bash(node:*)
---

Report the current state of the storefront project.

Run the inventory script from the project root:

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/storefront-status.mjs" $ARGUMENTS
```

It reports:

1. **Routes** found under `app/`, and whether each awaits `params` /
   `searchParams` where it uses them
2. **ReUI blocks** installed in `components/blocks/`, and which adapted
   component in `components/storefront/` claims each one as its source
3. **Catalog** — product count per collection, price range, how many photos
   are referenced, and any product missing a required field
4. **Contract violations** — `asChild`, raw `<img>`, mobile breakpoints in
   storefront components, imports from `components/blocks/`, hardcoded prices,
   and raw Tailwind palette classes used for chrome

Then:

- If everything is clean, say so in one line. Do not re-narrate the output.
- If violations are reported, **fix them** rather than only listing them —
  each one has a documented correct form in the `reui-premium-blocks` and
  `storefront-architecture` skills. Re-run the script afterwards to confirm.
- Orphaned blocks (installed but never adapted) are not errors. Mention them
  once as available surfaces; do not delete them.
