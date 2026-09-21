#!/usr/bin/env node
// SessionStart hook.
//
// Puts the two facts that are easy to get wrong in front of the model before
// it writes anything: this is Base UI (not Radix) and Next 16 (not what the
// training data says). Silent outside a storefront project.

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

// Only speak up in a project that actually uses this stack.
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
  `ReUI storefront · Next.js ${nextVersion} · shadcn style \`${style}\``,
  "",
  `- \`${style}\` is **Base UI**, not Radix. Compose with \`render={<El />}\`, never \`asChild\`.`,
  `- Next ${nextVersion}: \`params\`/\`searchParams\` are async, \`images.domains\` is removed, \`images.qualities\` defaults to \`[75]\`. Read \`node_modules/next/dist/docs/\` before writing Next code.`,
  "- Reuse ReUI premium blocks; do not hand-roll a component the registry already ships.",
]

if (!hasLicence) {
  notes.push(
    "- ⚠ No `REUI_LICENSE_KEY` in `.env.local` — installing premium blocks will fail until one is set."
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
