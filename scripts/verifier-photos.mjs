#!/usr/bin/env node
// Vérifie que chaque photo référencée par le catalogue résout réellement.
//
//   node verifier-photos.mjs [chemin-vers-catalog.ts]
//
// Un ID Unsplash mort ne fait pas échouer le build et ne lève rien en dev — il
// affiche simplement une boîte grise vide en production. C'est le seul moyen
// peu coûteux d'en repérer un avant qu'un client ne le fasse.
//
// Code de sortie 0 quand chaque photo résout, 1 sinon.

import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const C = {
  reset: "\u001b[0m",
  dim: "\u001b[2m",
  bold: "\u001b[1m",
  red: "\u001b[31m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
}

const target = process.argv[2] ?? join(process.cwd(), "lib", "catalog.ts")

if (!existsSync(target)) {
  console.error(`${C.red}Catalogue introuvable à ${target}${C.reset}`)
  console.error(`${C.dim}Lancez ce script depuis la racine du projet boutique.${C.reset}`)
  process.exit(1)
}

const src = readFileSync(target, "utf8")

// IDs Unsplash référencés via le helper photo() ou comme URL brutes.
const ids = [...new Set([...src.matchAll(/photo-[0-9a-zA-Z_-]{10,}/g)].map((m) => m[0]))]

// Les URL premium ne sont pas couvertes par remotePatterns et ne sont pas libres d'utilisation.
const premium = [
  ...new Set([...src.matchAll(/premium_photo-[0-9a-zA-Z_-]{10,}/g)].map((m) => m[0])),
]

if (ids.length === 0) {
  console.log(`${C.yellow}Aucune référence de photo Unsplash trouvée dans ${target}.${C.reset}`)
  process.exit(0)
}

console.log(
  `${C.bold}Vérification de ${ids.length} photo${ids.length === 1 ? "" : "s"}${C.reset} ${C.dim}depuis ${target}${C.reset}\n`
)

const failures = []

async function check(id) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=60`
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" })
    const type = res.headers.get("content-type") ?? ""
    const ok = res.status === 200 && type.startsWith("image/")
    if (!ok) failures.push({ id, reason: `${res.status} ${type || "pas de content-type"}` })
    return { id, ok, status: res.status, type }
  } catch (error) {
    failures.push({ id, reason: error.message })
    return { id, ok: false, status: 0, type: "" }
  }
}

// Concurrence modérée — assez pour aller vite, pas assez pour être limité en débit.
const BATCH = 6
for (let i = 0; i < ids.length; i += BATCH) {
  const batch = ids.slice(i, i + BATCH)
  const results = await Promise.all(batch.map(check))
  for (const r of results) {
    const mark = r.ok ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`
    const detail = r.ok ? `${C.dim}${r.type}${C.reset}` : `${C.red}${r.status || "erreur réseau"}${C.reset}`
    console.log(`  ${mark} ${r.id} ${detail}`)
  }
}

console.log()

if (premium.length > 0) {
  console.log(
    `${C.red}${premium.length} URL premium trouvée${premium.length === 1 ? "" : "s"}${C.reset} — plus.unsplash.com n'est pas couvert par remotePatterns et n'est pas libre d'utilisation :`
  )
  for (const p of premium) console.log(`  ${p}`)
  console.log()
}

if (failures.length === 0 && premium.length === 0) {
  console.log(`${C.green}✓ Les ${ids.length} photos résolvent toutes.${C.reset}`)
  process.exit(0)
}

if (failures.length > 0) {
  console.log(`${C.bold}${C.red}${failures.length} photo(s) n'ont pas résolu${C.reset}`)
  for (const f of failures) console.log(`  ${f.id} — ${f.reason}`)
  console.log(
    `\n${C.dim}Remplacez chacune d'elles. Trouvez l'URL CDN d'une candidate en récupérant sa page photo Unsplash, puis relancez ce script.${C.reset}`
  )
}

process.exit(1)
