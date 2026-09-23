---
name: frontend-contract-audit
description: Audits changed frontend code in app/ or components/ against the storefront's verified contract before a UI change is considered done — Base UI composition (render vs asChild), the desktop-only layout rule, design tokens vs raw Tailwind palette classes, next/image usage, the server/client boundary, cart state, and ReUI block hygiene. Use after writing or changing a component, a page or an adapted ReUI block, whenever the user asks to review, check, audit or "make sure it's right" for UI work, or before declaring a frontend task finished — even if no specific rule is named. Do not use to review a change that only touches product data in lib/catalog.ts without touching a component, nor for backend/non-UI code outside app/ and components/.
---

# Frontend contract audit

Before a frontend change counts as done, check it against this project's
contract. A green `tsc`/`build` says nothing about most of these rules — they
are conventions, not type errors, so nothing else in the toolchain enforces
them.

Stick to what actually changed: `git diff --name-only`, not the whole tree.
Read [reference.md](reference.md) for the full checklist with the reasoning
behind each rule (knowing *why* a rule exists is what lets you judge an edge
case it does not literally cover), and [examples.md](examples.md) for
before/after fixes and what a report should look like.

## Procedure

1. Get the diff scope: `git diff --name-only` (or the files you were given).
2. Walk the checklist in `reference.md` over those files — not from memory;
   it holds precise details (exact prop names, exact class names) that are
   better re-read every time than assumed to be remembered correctly.
3. When a ReUI component prop is in question, confirm it against the real
   API (`get_component`) before calling it wrong — never guess from the
   component's name.
4. Run the cheap mechanical checks yourself rather than assuming they pass:
   ```bash
   npx tsc --noEmit
   npm run build
   ```
5. Report findings from most to least severe. For each: file and line, which
   rule, the concrete fix. Distinguish **breaks the contract** (Radix habits
   that silently do nothing, hardcoded data, raw palette classes, undeclared
   remote image host) from **polish**. If the diff is clean, say so plainly —
   do not invent findings just to have something to report.

For an independent second pass on a large or risky change, delegate to the
`ui-reviewer` agent rather than auditing inline — it follows exactly the same
checklist in its own context. `/storefront:audit-ui` wraps the same audit as
a command, with `--fix` to apply the fixes.
