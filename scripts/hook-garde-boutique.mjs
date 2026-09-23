#!/usr/bin/env node
// Garde-fou PostToolUse.
//
// S'exécute après Write/Edit et vérifie le fichier qui vient d'être écrit par
// rapport au contrat de la boutique. Renvoie les constats via additionalContext
// au lieu de bloquer, pour que le modèle se corrige dans le même tour plutôt que
// de laisser l'erreur survivre jusqu'à ce que quelqu'un lance un build.
//
// Tout l'intérêt est la rapidité du retour : `asChild` dans un projet Base UI et
// un <img> brut passent tous deux le typecheck et le build. Rien ne les attrape,
// sauf un relecteur qui connaît le piège — ou ce script.

import { readFileSync } from "node:fs"

const CONTRACT = [
  {
    re: /\basChild\b/,
    message:
      "`asChild` est une convention Radix. Ce projet est en shadcn `base-nova` = Base UI : composez plutôt avec `render={<El />}` (ex. `<Button nativeButton={false} render={<Link href=\"/x\" />}>`).",
  },
  {
    re: /<img[\s>]/,
    message:
      "`<img>` brut détecté. Utilisez `next/image` avec `sizes` ; les hôtes distants doivent être déclarés dans next.config.ts → images.remotePatterns. (Les blocs ReUI installés livrent des `<img>` — convertissez-les lors de l'adaptation.)",
  },
  {
    re: /from\s+["']@\/components\/blocks\//,
    message:
      "`components/blocks/` est la copie de référence intacte des blocs ReUI installés. Adaptez dans `components/storefront/` et importez depuis là.",
  },
  {
    re: /\b(sm|md|lg):(grid-cols|flex-col|flex-row|w-|max-w-|px-|py-|gap-)/,
    message:
      "Préfixe responsive sur la mise en page. Cette boutique est desktop uniquement — le shell est masqué sous 1024px et les grilles sont fixes. Supprimez le breakpoint.",
    skip: /desktop-only\.tsx$/,
  },
  {
    re: /\bbg-(zinc|slate|gray|neutral|stone)-\d{2,3}\b|\btext-(zinc|slate|gray|neutral)-\d{2,3}\b|\bborder-(zinc|slate|gray|neutral)-\d{2,3}\b/,
    message:
      "Classe de palette Tailwind brute. Passez par les tokens — `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary` — pour que les blocs ReUI restent cohérents et que le mode sombre continue de fonctionner. (Les classes de pastilles produit dans lib/catalog.ts sont la seule exception.)",
    skip: /lib[\\/]catalog\.ts$/,
  },
  {
    re: /€\s?\d|\$\d|\.toFixed\(2\)/,
    message:
      "Montant codé en dur. Les prix vivent dans `lib/catalog.ts` ; formatez avec `formatPrice()` / `formatMoney()` ; les totaux viennent de `computeTotals()` dans `lib/order.ts`.",
    skip: /lib[\\/](catalog|order)\.ts$/,
  },
  {
    re: /(?<!await\s)props\.(params|searchParams)\b(?!\s*:)/,
    message:
      "`params` et `searchParams` sont asynchrones dans Next.js 16 — le shim de compatibilité synchrone a été retiré. Utilisez `const { slug } = await props.params`.",
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

// Ne surveiller que le TS/TSX de l'application. Ignorer les copies intactes des
// blocs, la sortie générée, et tout ce qui est hors du projet.
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
  // Les commentaires documentent ces règles ; ils ne les enfreignent pas.
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

// Dédoublonner les occurrences répétées d'une même règle pour garder un retour lisible.
const seen = new Set()
const unique = findings.filter((f) => {
  const key = f.slice(f.indexOf(":") + 1)
  if (seen.has(key)) return false
  seen.add(key)
  return true
})

emit(
  `Vérification du contrat de la boutique sur ${path} :\n\n${unique.join("\n\n")}\n\n` +
    `Corrigez-les maintenant plutôt qu'en relecture — chacun passe le typecheck et le build sans erreur, donc rien d'autre ne les attrapera.`
)
process.exit(0)
