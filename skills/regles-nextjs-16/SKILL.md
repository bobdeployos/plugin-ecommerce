---
name: regles-nextjs-16
description: Skill de référence (connaissances) sur les changements cassants de Next.js 16 dans cette boutique. À utiliser quand on écrit ou relit du code Next.js ici — une page, un layout, une route, `next.config.ts`, un import entre Server et Client Components, la config Tailwind v4 — ou quand une page plante à l'exécution alors que le build est vert. Couvre `params` / `searchParams` / `cookies()` / `headers()` asynchrones, `npx next typegen` et `PageProps`, `images.remotePatterns` et le défaut `images.qualities`, Turbopack par défaut, la suppression de `next lint`, et le piège de la frontière serveur/client. Pour auditer un changement d'interface terminé contre ces règles, utiliser le skill de workflow `audit-contrat-frontend`.
group: storefront
icon: triangle
---

# Next.js 16 — ce qui a vraiment changé

Vos connaissances d'entraînement sont antérieures à cette version. **Lisez la
documentation embarquée avant d'écrire du code** : Next livre une
documentation alignée sur sa version dans `node_modules/next/dist/docs/`, et
`01-app/02-guides/upgrading/version-16.md` y fait autorité sur les
changements cassants. Vérifiez-la plutôt que de vous fier à votre mémoire.

Ce skill rassemble les connaissances ; pour auditer un changement d'interface,
utilisez le skill `audit-contrat-frontend`.

Détails et justification de chaque règle : [reference.md](reference.md).
Exemples avant/après : [examples.md](examples.md).

## Procédure — l'essentiel

1. **Consulter `node_modules/next/dist/docs/`** avant d'écrire du code Next.
2. **`await` toutes les API de requête.** `params`, `searchParams`,
   `cookies()`, `headers()`, `draftMode()` sont uniquement asynchrones : le
   shim synchrone de Next 15 a disparu.
3. **Après avoir ajouté une route, lancer `npx next typegen`**, sinon
   `PageProps<'/route'>` n'existe pas pour ce chemin.
4. **Images** : `images.remotePatterns` (plus de `images.domains`),
   `images.qualities` à élargir si on veut autre chose que 75, toujours
   `next/image` avec `sizes`, parent positionné pour `fill`.
5. **Outils** : Turbopack est le bundler par défaut ; `next lint` n'existe
   plus, lancer `eslint` directement (config plate `eslint.config.mjs`) ;
   `middleware` s'appelle désormais `proxy`.
6. **Frontière serveur/client** : une constante ou un type dont un Server
   Component a besoin vit dans un module simple sous `lib/`, jamais à côté
   d'un composant `"use client"`. Le build reste vert, la page plante.
7. **Tailwind v4** : pas de `tailwind.config.js`, la configuration est en CSS.
8. **Le verrou** : `npx tsc --noEmit` puis `npm run build` — nécessaires mais
   pas suffisants. Lancer `npm run dev` et regarder la page avant d'affirmer
   qu'elle fonctionne.
