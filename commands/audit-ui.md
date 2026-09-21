---
description: Audit changed frontend code against the storefront contract (Base UI composition, desktop-only layout, tokens, next/image, catalog discipline)
argument-hint: "[path or glob] [--fix]"
allowed-tools: Bash(git:*), Bash(node:*), Bash(npx:*), Bash(npm:*)
---

Audit the frontend against this project's contract.

Determine the scope first:

- With no argument, audit what changed: `git diff --name-only HEAD` filtered to
  `app/` and `components/`. If the tree is clean, audit the last commit.
- With a path or glob, audit exactly that.

Then launch the **ui-reviewer** agent over that scope. It knows the checklist;
do not re-derive it inline.

Alongside the agent, run the static scan for the mechanical violations:

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/storefront-status.mjs" --violations-only
```

Finally verify:

```
npx tsc --noEmit && npm run build
```

Reporting:

- Lead with the verdict — clean, or N findings that break the contract.
- Group findings by severity, not by file. A value exported from a
  `"use client"` module into a Server Component outranks a missing `sizes`.
- If `--fix` was passed, apply the fixes, then re-run the scan and the build
  and report what changed. Without `--fix`, report only.
- Do not invent findings. A clean diff is a valid result.
