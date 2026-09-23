# Référence — Next.js 16

## Lire la documentation embarquée

Next livre une documentation alignée sur sa version, à l'intérieur du
package :

```
node_modules/next/dist/docs/
├── 01-app/01-getting-started/    # images, fonts, css, layouts, metadata
├── 01-app/02-guides/             # upgrading/version-16.md, ai-agents.md, ...
└── 01-app/03-api-reference/
```

Pourquoi : vos données d'entraînement sont plus anciennes que cette version.
`node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` est la
liste qui fait autorité pour les changements cassants. Vérifiez-la plutôt que
de vous fier à votre mémoire.

## API de requête asynchrones — changement cassant

Next 15 avait rendu `params` / `searchParams` asynchrones, avec un shim de
compatibilité synchrone. **Next 16 a supprimé ce shim.** Ces API sont
asynchrones, et uniquement asynchrones :

- `cookies()`, `headers()`, `draftMode()`
- `params` dans `layout`, `page`, `route`, `default`, `opengraph-image`, `icon`
- `searchParams` dans `page`

Un accès synchrone qui fonctionnait sous Next 15 grâce au shim ne fonctionne
donc plus.

### Helpers de types générés

`PageProps<'/route'>`, `LayoutProps<'/route'>` et `RouteContext<'/route'>`
sont des helpers de types disponibles globalement, générés par
`npx next typegen`. **Lancez-le après avoir ajouté une route** : sinon le
helper pour ce chemin n'existe pas et le typecheck échoue.

## Images — plusieurs changements cassants

| Changement | Conséquence |
| --- | --- |
| **`images.domains` est supprimé** | Utiliser `images.remotePatterns` avec un `hostname` explicite et un `pathname` aussi étroit que possible. |
| **`images.qualities` vaut désormais `[75]` par défaut** | Une prop `quality` hors de la liste autorisée est silencieusement ramenée à la valeur la plus proche : `quality={90}` donne 75 tant qu'on n'élargit pas la config. |
| Défauts de `minimumCacheTTL` et `imageSizes` modifiés | Ne pas supposer les anciennes valeurs. |
| Images locales avec query string | Nécessitent `images.localPatterns.search`. |
| Optimisation d'IP locales | Bloquée sauf si `dangerouslyAllowLocalIP` est défini. |

Règles d'usage :

- Toujours `next/image` plutôt que `<img>`.
- `fill` exige un parent positionné.
- Toujours passer `sizes`.

## Autres suppressions et changements de défauts

- **Turbopack est le bundler par défaut** pour `dev` et `build`.
  L'emplacement de la config Turbopack a changé ; consultez le guide de
  migration avant d'ajouter de la config de bundler.
- **`next lint` est supprimé.** Lancez `eslint` directement. ESLint utilise
  désormais la config plate (`eslint.config.mjs`).
- `middleware` a été renommé `proxy`.
- Le support AMP, la configuration d'exécution (runtime configuration) et
  `experimental.dynamicIO` ont disparu.
- Les routes parallèles exigent désormais `default.js`.
- React 19.2 ; l'App Router épingle sa propre version canary de React.

## Le piège de la frontière serveur/client

Celui-ci coûte un après-midi parce que **le build reste vert**.

Une *valeur* exportée depuis un module `"use client"` et importée par un
Server Component n'arrive pas en tant que valeur : elle arrive en tant que
référence de module client. La décomposer (spread) produit un objet aux
champs `undefined`, et la page plante à l'exécution avec :

```
Cannot read properties of undefined (reading 'length')
```

**Règle :** les constantes et types partagés dont un Server Component a besoin
vivent dans un module simple sous `lib/`, jamais à côté du composant client
qui les utilise aussi. Les types seuls sont effacés à la compilation et ne
poseraient pas de problème — mais ne comptez pas sur cette distinction ;
gardez les deux dans `lib/`. Dans cette boutique, `lib/filters.ts` existe
précisément pour cette raison.

## Tailwind v4

Pas de `tailwind.config.js` : la configuration se fait en CSS
(`@import "tailwindcss"` et un bloc `@theme inline`). `postcss.config.mjs`
doit contenir `"@tailwindcss/postcss": {}`.

## Le verrou

`npx tsc --noEmit` puis `npm run build`. Un build vert est nécessaire mais pas
suffisant sur un projet piloté par le design : lancez `npm run dev` et
regardez la page avant d'affirmer qu'elle fonctionne.
