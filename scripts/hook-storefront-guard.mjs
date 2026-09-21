#!/usr/bin/env node
// PostToolUse guardrail.
//
// Runs after Write/Edit and checks the file that was just written against the
// storefront contract. Feeds findings back as additionalContext rather than
// blocking, so the model can correct itself in the same turn instead of the
// mistake surviving until someone runs a build.
//
// The point is speed of feedback: `asChild` in a Base UI project and a raw
// <img> both typecheck and both build. Nothing catches them except a reviewer
// who happens to know — or this.

import { readFileSync } from "node:fs"

const CONTRACT = [
  {
    re: /\basChild\b/,
    message:
      "`asChild` is a Radix convention. This project is shadcn `base-nova` = Base UI: compose with `render={<El />}` instead (e.g. `<Button nativeButton={false} render={<Link href=\"/x\" />}>`).",
  },
  {
    re: /<img[\s>]/,
    message:
      "Raw `<img>` found. Use `next/image` with `sizes`; remote hosts must be declared in next.config.ts → images.remotePatterns. (Installed ReUI blocks ship `<img>` — convert it when you adapt one.)",
  },
  {
    re: /from\s+["']@\/components\/blocks\//,
    message:
      "`components/blocks/` is the pristine reference copy of the installed ReUI blocks. Adapt into `components/storefront/` and import from there.",
  },
  {
    re: /\b(sm|md|lg):(grid-cols|flex-col|flex-row|w-|max-w-|px-|py-|gap-)/,
    message:
      "Responsive prefix on layout. This storefront is desktop-only — the shell is hidden below 1024px and grids are fixed. Drop the breakpoint.",
    skip: /desktop-only\.tsx$/,
  },
  {
    re: /\bbg-(zinc|slate|gray|neutral|stone)-\d{2,3}\b|\btext-(zinc|slate|gray|neutral)-\d{2,3}\b|\bborder-(zinc|slate|gray|neutral)-\d{2,3}\b/,
    message:
      "Raw Tailwind palette class. Theme through tokens — `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary` — so the ReUI blocks stay consistent and dark mode keeps working. (Product swatch classes in lib/catalog.ts are the one exception.)",
    skip: /lib[\\/]catalog\.ts$/,
  },
  {
    re: /€\s?\d|\$\d|\.toFixed\(2\)/,
    message:
      "Hardcoded money. Prices live in `lib/catalog.ts`; format with `formatPrice()` / `formatMoney()`; totals come from `computeTotals()` in `lib/order.ts`.",
    skip: /lib[\\/](catalog|order)\.ts$/,
  },
  {
    re: /(?<!await\s)props\.(params|searchParams)\b(?!\s*:)/,
    message:
      "`params` and `searchParams` are async in Next.js 16 — the sync compatibility shim was removed. Use `const { slug } = await props.params`.",
  },
]

function readStdin() {
  try {
    return readFileSync(0, "utf8")
  } catch {
    return ""
  }
}

function emit(context) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: context,
      },
    })
  )
}

let payload
try {
  payload = JSON.parse(readStdin() || "{}")
} catch {
  process.exit(0)
}

const input = payload.tool_input ?? {}
const path = input.file_path ?? input.filePath ?? ""

// Only guard the app's own TS/TSX. Skip the pristine block copies, generated
// output, and anything outside the project.
if (!/\.(tsx|ts)$/.test(path)) process.exit(0)
if (/[\\/](node_modules|\.next)[\\/]/.test(path)) process.exit(0)
if (/[\\/]components[\\/]blocks[\\/]/.test(path)) process.exit(0)

let source = ""
try {
  source = readFileSync(path, "utf8")
} catch {
  process.exit(0)
}

const findings = []
const lines = source.split("\n")

lines.forEach((line, index) => {
  const trimmed = line.trim()
  // Comments document these rules; they are not violations of them.
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*")
  ) {
    return
  }
  for (const rule of CONTRACT) {
    if (rule.skip?.test(path)) continue
    if (rule.re.test(line)) {
      findings.push(`  L${index + 1}: ${rule.message}`)
    }
  }
})

if (findings.length === 0) process.exit(0)

// De-duplicate repeated hits of the same rule so the feedback stays readable.
const seen = new Set()
const unique = findings.filter((f) => {
  const key = f.slice(f.indexOf(":") + 1)
  if (seen.has(key)) return false
  seen.add(key)
  return true
})

emit(
  `Storefront contract check on ${path}:\n\n${unique.join("\n\n")}\n\n` +
    `Fix these now rather than at review time — each one typechecks and builds cleanly, so nothing else will catch them.`
)
process.exit(0)
