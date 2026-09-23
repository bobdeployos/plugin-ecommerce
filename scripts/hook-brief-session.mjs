#!/usr/bin/env node
// Hook SessionStart.
//
// Place sous les yeux du modèle, avant qu'il n'écrive quoi que ce soit, les deux
// faits faciles à rater : c'est du Base UI (pas du Radix) et du Next 16 (pas ce
// que disent les données d'entraînement). Silencieux hors d'un projet boutique.

import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const ROOT = process.cwd()

function readJSON(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch {
    return null
  }
}

const pkg = readJSON(join(ROOT, "package.json"))
const components = readJSON(join(ROOT, "components.json"))

// Ne parler que dans un projet qui utilise réellement cette stack.
const isStorefront =
  pkg &&
  components &&
  Boolean(components.registries?.["@reui"]) &&
  Boolean(pkg.dependencies?.next)

if (!isStorefront) process.exit(0)

const nextVersion = pkg.dependencies.next.replace(/^[^\d]*/, "")
const style = components.style ?? "unknown"
const hasLicence =
  existsSync(join(ROOT, ".env.local")) &&
  /REUI_LICENSE_KEY=\S/.test(readFileSync(join(ROOT, ".env.local"), "utf8"))

const notes = [
  `Boutique ReUI · Next.js ${nextVersion} · style shadcn \`${style}\``,
  "",
  `- \`${style}\` est du **Base UI**, pas du Radix. Composez avec \`render={<El />}\`, jamais \`asChild\`.`,
  `- Next ${nextVersion} : \`params\`/\`searchParams\` sont asynchrones, \`images.domains\` est supprimé, \`images.qualities\` vaut \`[75]\` par défaut. Lisez \`node_modules/next/dist/docs/\` avant d'écrire du code Next.`,
  "- Réutilisez les blocs premium ReUI ; ne codez pas à la main un composant que le registre fournit déjà.",
]

if (!hasLicence) {
  notes.push(
    "- ⚠ Aucune `REUI_LICENSE_KEY` dans `.env.local` — l'installation des blocs premium échouera tant qu'aucune clé n'est définie."
  )
}

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: notes.join("\n"),
    },
  })
)
