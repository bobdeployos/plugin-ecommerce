#!/usr/bin/env node
// Storefront inventory + contract scan.
//
// Reports routes, installed ReUI blocks and their adapted counterparts, the
// catalog shape, and any violation of the project's frontend contract.
//
//   node storefront-status.mjs [--verbose] [--violations-only]
//
// Exit code is 0 when clean, 1 when violations were found, so the script is
// usable as a check as well as a report.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"

const ROOT = process.cwd()
const args = process.argv.slice(2)
const VERBOSE = args.includes("--verbose")
const VIOLATIONS_ONLY = args.includes("--violations-only")

const C = {
  reset: "\u001b[0m",
  dim: "\u001b[2m",
  bold: "\u001b[1m",
  red: "\u001b[31m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  cyan: "\u001b[36m",
}

function out(line = "") {
  if (!VIOLATIONS_ONLY) console.log(line)
}

function walk(dir, filter, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") continue
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, filter, acc)
    else if (filter(full)) acc.push(full)
  }
  return acc
}

function read(path) {
  try {
    return readFileSync(path, "utf8")
  } catch {
    return ""
  }
}

function rel(path) {
  return relative(ROOT, path).split(sep).join("/")
}

// ── Sanity ───────────────────────────────────────────────────────────────

if (!existsSync(join(ROOT, "app"))) {
  console.error(
    `${C.red}Run this from the storefront project root (no app/ directory here).${C.reset}`
  )
  process.exit(1)
}

const violations = []
function flag(severity, file, line, message) {
  violations.push({ severity, file, line, message })
}

// ── Routes ───────────────────────────────────────────────────────────────

const pageFiles = walk(join(ROOT, "app"), (p) => /[\\/]page\.tsx$/.test(p))

out(`${C.bold}Routes${C.reset}`)
for (const file of pageFiles.sort()) {
  const route =
    "/" +
    rel(file)
      .replace(/^app\//, "")
      .replace(/\/?page\.tsx$/, "")
  const src = read(file)

  const usesParams = /props\.params|\{\s*params\s*\}/.test(src)
  const usesSearch = /props\.searchParams|\{\s*searchParams\s*\}/.test(src)
  const awaitsParams = /await\s+props\.params/.test(src)
  const awaitsSearch = /await\s+props\.searchParams/.test(src)

  const notes = []
  if (usesParams && !awaitsParams) {
    notes.push(`${C.red}params not awaited${C.reset}`)
    flag("error", rel(file), 0, "`params` is async in Next 16 — await it")
  }
  if (usesSearch && !awaitsSearch) {
    notes.push(`${C.red}searchParams not awaited${C.reset}`)
    flag("error", rel(file), 0, "`searchParams` is async in Next 16 — await it")
  }
  if (/generateStaticParams/.test(src)) notes.push(`${C.dim}SSG${C.reset}`)

  out(`  ${route || "/"} ${notes.length ? "· " + notes.join(" · ") : ""}`)
}
out()

// ── Blocks ───────────────────────────────────────────────────────────────

const blocksDir = join(ROOT, "components", "blocks")
const installed = existsSync(blocksDir)
  ? readdirSync(blocksDir).filter((d) =>
      statSync(join(blocksDir, d)).isDirectory()
    )
  : []

const storefrontDir = join(ROOT, "components", "storefront")
const storefrontFiles = walk(storefrontDir, (p) => p.endsWith(".tsx"))
const storefrontSrc = storefrontFiles.map((f) => ({ file: f, src: read(f) }))

out(`${C.bold}ReUI blocks${C.reset} ${C.dim}(${installed.length} installed)${C.reset}`)
for (const block of installed.sort()) {
  // An adapted component claims its source block in its header comment.
  const claimants = storefrontSrc
    .filter(({ src }) => src.includes(block))
    .map(({ file }) => rel(file).replace("components/storefront/", ""))

  if (claimants.length > 0) {
    out(`  ${C.green}●${C.reset} ${block} ${C.dim}→ ${claimants.join(", ")}${C.reset}`)
  } else {
    out(`  ${C.yellow}○${C.reset} ${block} ${C.dim}— installed, not yet adapted${C.reset}`)
  }
}
out()

// ── Catalog ──────────────────────────────────────────────────────────────

const catalogPath = join(ROOT, "lib", "catalog.ts")
const catalog = read(catalogPath)

if (catalog) {
  const slugs = [...catalog.matchAll(/^\s{4}slug:\s*"([^"]+)"/gm)].map((m) => m[1])
  const collections = [...catalog.matchAll(/^\s{4}collection:\s*"([^"]+)"/gm)].map(
    (m) => m[1]
  )
  const prices = [...catalog.matchAll(/^\s{4}price:\s*(\d+)/gm)].map((m) =>
    Number(m[1])
  )
  const photos = new Set(
    [...catalog.matchAll(/photo-[0-9a-zA-Z_-]{10,}/g)].map((m) => m[0])
  )

  const byCollection = collections.reduce((acc, c) => {
    acc[c] = (acc[c] ?? 0) + 1
    return acc
  }, {})

  out(`${C.bold}Catalog${C.reset}`)
  out(
    `  ${slugs.length} products · ${Object.entries(byCollection)
      .map(([k, v]) => `${k} ${v}`)
      .join(" · ")}`
  )
  if (prices.length) {
    out(
      `  €${Math.min(...prices)}–€${Math.max(...prices)} · ${photos.size} distinct photos`
    )
  }

  // Required-field check, per product block.
  const REQUIRED = [
    "name",
    "sku",
    "collection",
    "tagline",
    "story",
    "price",
    "rating",
    "reviewCount",
    "highlights",
    "colors",
    "sizes",
    "gallery",
    "specs",
  ]
  const chunks = catalog.split(/^\s{4}slug:\s*"/m).slice(1)
  chunks.forEach((chunk, i) => {
    const slug = slugs[i]
    const missing = REQUIRED.filter(
      (field) => !new RegExp(`^\\s{4}${field}:`, "m").test(chunk)
    )
    if (missing.length) {
      flag("error", "lib/catalog.ts", 0, `${slug} is missing: ${missing.join(", ")}`)
    }
  })

  if (VERBOSE) {
    out(`  ${C.dim}${slugs.join(", ")}${C.reset}`)
  }
  out()
}

// ── Contract scan ────────────────────────────────────────────────────────

const appAndStorefront = [
  ...walk(join(ROOT, "app"), (p) => /\.(tsx|ts)$/.test(p)),
  ...storefrontFiles,
]

const RULES = [
  {
    re: /\basChild\b/,
    severity: "error",
    message: "`asChild` is a Radix convention — base-nova is Base UI, use `render={<El />}`",
  },
  {
    re: /<img[\s>]/,
    severity: "error",
    message: "use `next/image`, not a raw <img>",
  },
  {
    re: /from\s+["']@\/components\/blocks\//,
    severity: "error",
    message: "components/blocks/ is a pristine reference — import from components/storefront/",
  },
  {
    re: /\b(sm|md|lg):(grid-cols|flex-col|flex-row|hidden|block|w-|max-w-|px-|py-|gap-)/,
    severity: "warn",
    message: "this storefront is desktop-only — drop the responsive prefix",
    // The desktop gate is the one place a breakpoint is the whole point: the
    // notice is `lg:hidden` and the shell is shown from `lg` up.
    skipFiles: [/desktop-only\.tsx$/],
  },
  {
    re: /\bbg-(zinc|slate|gray|neutral|stone)-\d{2,3}\b|\btext-(zinc|slate|gray|neutral)-\d{2,3}\b|\bborder-(zinc|slate|gray|neutral)-\d{2,3}\b/,
    severity: "warn",
    message: "theme through tokens (bg-card, text-muted-foreground, border-border), not palette classes",
  },
  {
    re: /€\s?\d|\$\d/,
    severity: "warn",
    message: "hardcoded price — use formatPrice()/formatMoney() over lib/catalog.ts",
  },
  {
    re: /\.toFixed\(2\)/,
    severity: "warn",
    message: "format money with formatMoney(), not toFixed(2)",
  },
]

for (const file of appAndStorefront) {
  const src = read(file)
  const lines = src.split("\n")
  lines.forEach((line, i) => {
    // Skip comments — the rules documented in header comments are not violations.
    const trimmed = line.trim()
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
      return
    }
    for (const rule of RULES) {
      if (rule.skipFiles?.some((re) => re.test(file))) continue
      if (rule.re.test(line)) {
        flag(rule.severity, rel(file), i + 1, rule.message)
      }
    }
  })
}

// ── Report ───────────────────────────────────────────────────────────────

const errors = violations.filter((v) => v.severity === "error")
const warns = violations.filter((v) => v.severity === "warn")

if (violations.length === 0) {
  if (VIOLATIONS_ONLY) console.log(`${C.green}No contract violations.${C.reset}`)
  else out(`${C.green}✓ No contract violations.${C.reset}`)
  process.exit(0)
}

console.log(
  `${C.bold}Contract violations${C.reset} ${C.dim}(${errors.length} error, ${warns.length} warning)${C.reset}`
)
for (const v of [...errors, ...warns]) {
  const tag =
    v.severity === "error" ? `${C.red}error${C.reset}` : `${C.yellow}warn ${C.reset}`
  const where = v.line ? `${v.file}:${v.line}` : v.file
  console.log(`  ${tag} ${C.cyan}${where}${C.reset}`)
  console.log(`        ${v.message}`)
}

process.exit(errors.length > 0 ? 1 : 0)
