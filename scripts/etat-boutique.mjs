#!/usr/bin/env node
// Inventaire de la boutique + scan du contrat.
//
// Liste les routes, les blocs ReUI installés et leurs équivalents adaptés, la
// forme du catalogue, et toute violation du contrat frontend du projet.
//
//   node etat-boutique.mjs [--verbose] [--violations-only]
//
// Le code de sortie vaut 0 si tout est propre, 1 si des violations ont été
// trouvées, ce qui permet d'utiliser le script comme vérification autant que
// comme rapport.

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

// ── Vérification préalable ───────────────────────────────────────────────

if (!existsSync(join(ROOT, "app"))) {
  console.error(
    `${C.red}Lancez ce script depuis la racine du projet boutique (aucun répertoire app/ ici).${C.reset}`
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
    notes.push(`${C.red}params non attendu (await)${C.reset}`)
    flag("error", rel(file), 0, "`params` est asynchrone dans Next 16 — faites un await")
  }
  if (usesSearch && !awaitsSearch) {
    notes.push(`${C.red}searchParams non attendu (await)${C.reset}`)
    flag("error", rel(file), 0, "`searchParams` est asynchrone dans Next 16 — faites un await")
  }
  if (/generateStaticParams/.test(src)) notes.push(`${C.dim}SSG${C.reset}`)

  out(`  ${route || "/"} ${notes.length ? "· " + notes.join(" · ") : ""}`)
}
out()

// ── Blocs ────────────────────────────────────────────────────────────────

const blocksDir = join(ROOT, "components", "blocks")
const installed = existsSync(blocksDir)
  ? readdirSync(blocksDir).filter((d) =>
      statSync(join(blocksDir, d)).isDirectory()
    )
  : []

const storefrontDir = join(ROOT, "components", "storefront")
const storefrontFiles = walk(storefrontDir, (p) => p.endsWith(".tsx"))
const storefrontSrc = storefrontFiles.map((f) => ({ file: f, src: read(f) }))

out(`${C.bold}Blocs ReUI${C.reset} ${C.dim}(${installed.length} installés)${C.reset}`)
for (const block of installed.sort()) {
  // Un composant adapté revendique son bloc source dans son commentaire d'en-tête.
  const claimants = storefrontSrc
    .filter(({ src }) => src.includes(block))
    .map(({ file }) => rel(file).replace("components/storefront/", ""))

  if (claimants.length > 0) {
    out(`  ${C.green}●${C.reset} ${block} ${C.dim}→ ${claimants.join(", ")}${C.reset}`)
  } else {
    out(`  ${C.yellow}○${C.reset} ${block} ${C.dim}— installé, pas encore adapté${C.reset}`)
  }
}
out()

// ── Catalogue ────────────────────────────────────────────────────────────

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

  out(`${C.bold}Catalogue${C.reset}`)
  out(
    `  ${slugs.length} produits · ${Object.entries(byCollection)
      .map(([k, v]) => `${k} ${v}`)
      .join(" · ")}`
  )
  if (prices.length) {
    out(
      `  €${Math.min(...prices)}–€${Math.max(...prices)} · ${photos.size} photos distinctes`
    )
  }

  // Vérification des champs obligatoires, bloc produit par bloc produit.
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
      flag("error", "lib/catalog.ts", 0, `${slug} — champs manquants : ${missing.join(", ")}`)
    }
  })

  if (VERBOSE) {
    out(`  ${C.dim}${slugs.join(", ")}${C.reset}`)
  }
  out()
}

// ── Scan du contrat ──────────────────────────────────────────────────────

const appAndStorefront = [
  ...walk(join(ROOT, "app"), (p) => /\.(tsx|ts)$/.test(p)),
  ...storefrontFiles,
]

const RULES = [
  {
    re: /\basChild\b/,
    severity: "error",
    message: "`asChild` est une convention Radix — base-nova est du Base UI, utilisez `render={<El />}`",
  },
  {
    re: /<img[\s>]/,
    severity: "error",
    message: "utilisez `next/image`, pas un <img> brut",
  },
  {
    re: /from\s+["']@\/components\/blocks\//,
    severity: "error",
    message: "components/blocks/ est une référence intacte — importez depuis components/storefront/",
  },
  {
    re: /\b(sm|md|lg):(grid-cols|flex-col|flex-row|hidden|block|w-|max-w-|px-|py-|gap-)/,
    severity: "warn",
    message: "cette boutique est desktop uniquement — supprimez le préfixe responsive",
    // Le garde desktop est le seul endroit où un breakpoint est justement le
    // but : la notice est en `lg:hidden` et le shell s'affiche à partir de `lg`.
    skipFiles: [/desktop-only\.tsx$/],
  },
  {
    re: /\bbg-(zinc|slate|gray|neutral|stone)-\d{2,3}\b|\btext-(zinc|slate|gray|neutral)-\d{2,3}\b|\bborder-(zinc|slate|gray|neutral)-\d{2,3}\b/,
    severity: "warn",
    message: "passez par les tokens (bg-card, text-muted-foreground, border-border), pas par les classes de palette",
  },
  {
    re: /€\s?\d|\$\d/,
    severity: "warn",
    message: "prix codé en dur — utilisez formatPrice()/formatMoney() sur lib/catalog.ts",
  },
  {
    re: /\.toFixed\(2\)/,
    severity: "warn",
    message: "formatez les montants avec formatMoney(), pas toFixed(2)",
  },
]

for (const file of appAndStorefront) {
  const src = read(file)
  const lines = src.split("\n")
  lines.forEach((line, i) => {
    // Ignorer les commentaires — les règles documentées dans les en-têtes ne sont pas des violations.
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

// ── Rapport ──────────────────────────────────────────────────────────────

const errors = violations.filter((v) => v.severity === "error")
const warns = violations.filter((v) => v.severity === "warn")

if (violations.length === 0) {
  if (VIOLATIONS_ONLY) console.log(`${C.green}Aucune violation du contrat.${C.reset}`)
  else out(`${C.green}✓ Aucune violation du contrat.${C.reset}`)
  process.exit(0)
}

console.log(
  `${C.bold}Violations du contrat${C.reset} ${C.dim}(${errors.length} erreur(s), ${warns.length} avertissement(s))${C.reset}`
)
for (const v of [...errors, ...warns]) {
  const tag =
    v.severity === "error" ? `${C.red}erreur${C.reset}` : `${C.yellow}alerte${C.reset}`
  const where = v.line ? `${v.file}:${v.line}` : v.file
  console.log(`  ${tag} ${C.cyan}${where}${C.reset}`)
  console.log(`         ${v.message}`)
}

process.exit(errors.length > 0 ? 1 : 0)
