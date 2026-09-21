#!/usr/bin/env node
// Verify every photograph referenced by the catalog actually resolves.
//
//   node verify-photos.mjs [path-to-catalog.ts]
//
// A dead Unsplash ID does not fail the build and does not throw in dev — it
// just renders an empty grey box in production. This is the only cheap way to
// catch one before a customer does.
//
// Exit 0 when every photo resolves, 1 otherwise.

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
  console.error(`${C.red}Catalog not found at ${target}${C.reset}`)
  console.error(`${C.dim}Run this from the storefront project root.${C.reset}`)
  process.exit(1)
}

const src = readFileSync(target, "utf8")

// Unsplash IDs referenced through the photo() helper or as raw URLs.
const ids = [...new Set([...src.matchAll(/photo-[0-9a-zA-Z_-]{10,}/g)].map((m) => m[0]))]

// Premium URLs are not covered by remotePatterns and are not free to use.
const premium = [
  ...new Set([...src.matchAll(/premium_photo-[0-9a-zA-Z_-]{10,}/g)].map((m) => m[0])),
]

if (ids.length === 0) {
  console.log(`${C.yellow}No Unsplash photo references found in ${target}.${C.reset}`)
  process.exit(0)
}

console.log(
  `${C.bold}Verifying ${ids.length} photo${ids.length === 1 ? "" : "s"}${C.reset} ${C.dim}from ${target}${C.reset}\n`
)

const failures = []

async function check(id) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=60`
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" })
    const type = res.headers.get("content-type") ?? ""
    const ok = res.status === 200 && type.startsWith("image/")
    if (!ok) failures.push({ id, reason: `${res.status} ${type || "no content-type"}` })
    return { id, ok, status: res.status, type }
  } catch (error) {
    failures.push({ id, reason: error.message })
    return { id, ok: false, status: 0, type: "" }
  }
}

// Modest concurrency — enough to be quick, not enough to get rate limited.
const BATCH = 6
for (let i = 0; i < ids.length; i += BATCH) {
  const batch = ids.slice(i, i + BATCH)
  const results = await Promise.all(batch.map(check))
  for (const r of results) {
    const mark = r.ok ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`
    const detail = r.ok ? `${C.dim}${r.type}${C.reset}` : `${C.red}${r.status || "network error"}${C.reset}`
    console.log(`  ${mark} ${r.id} ${detail}`)
  }
}

console.log()

if (premium.length > 0) {
  console.log(
    `${C.red}${premium.length} premium URL${premium.length === 1 ? "" : "s"} found${C.reset} — plus.unsplash.com is not covered by remotePatterns and is not free to use:`
  )
  for (const p of premium) console.log(`  ${p}`)
  console.log()
}

if (failures.length === 0 && premium.length === 0) {
  console.log(`${C.green}✓ All ${ids.length} photos resolve.${C.reset}`)
  process.exit(0)
}

if (failures.length > 0) {
  console.log(`${C.bold}${C.red}${failures.length} photo(s) did not resolve${C.reset}`)
  for (const f of failures) console.log(`  ${f.id} — ${f.reason}`)
  console.log(
    `\n${C.dim}Replace each one. Find a candidate's CDN URL by fetching its Unsplash photo page, then re-run this script.${C.reset}`
  )
}

process.exit(1)
