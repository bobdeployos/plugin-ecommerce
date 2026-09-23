---
description: Ajoute une nouvelle route à la boutique, construite à partir du bon bloc premium ReUI plutôt que codée à la main
argument-hint: "<route> <à quoi sert la page>   ex. /wishlist produits sauvegardés avec ajout rapide"
allowed-tools: Bash(npx:*), Bash(npm:*), Bash(node:*)
---

Ajoute une nouvelle page à la boutique : `$ARGUMENTS`

Ne commence pas à écrire du JSX. Procède dans cet ordre.

**1. Choisis le bloc.** Lance l'agent **eclaireur-blocs** avec la description de
la surface. Il rend une recommandation, la commande d'installation, la vraie
API et des notes d'adaptation. S'il indique que le bloc est déjà installé,
adapte la copie existante dans `components/blocks/` au lieu de l'installer à nouveau.

**2. Installe-le.**

```
npx shadcn@latest add @reui/<block-name> --yes
```

Laisse la copie installée dans `components/blocks/` intacte — c'est la
référence. Si la CLI indique que l'élément est introuvable, c'est une simple
primitive shadcn : réessaie sans le préfixe `@reui/`.

**3. Adapte-le dans `components/storefront/`.** Les cinq opérations habituelles :

- constantes de démo au niveau du module → props ou `lib/catalog.ts`
- état local panier/wishlist en `useState` → `useCart()`
- `<img>` → `next/image` avec `sizes`
- supprimer tous les breakpoints mobiles — ce projet est desktop uniquement
- formatage `$` / `en-US` → `formatPrice` / `formatMoney`

Commence le fichier par un commentaire qui nomme le bloc source et ce que tu as modifié.

**4. Crée la route** dans `app/<route>/page.tsx`, puis :

```
npx next typegen
```

pour que `PageProps<'/<route>'>` existe. `params` et `searchParams` sont
**asynchrones** — attends-les avec `await`. Toute constante que la page serveur
partage avec un composant client va dans `lib/`, jamais exportée depuis le
module `"use client"`.

**5. Branche-la dans la navigation** — `components/storefront/site-header.tsx`
et `site-footer.tsx` — pour que la page soit accessible.

Toute la copy visible de la page (titres, libellés, états vides) reste en
anglais, même si ces instructions sont en français.

**6. Vérifie.**

```
npx tsc --noEmit && npm run build
```

Puis lance `npm run dev` et regarde réellement la page à 1280px ou plus. Un
build vert ne dit rien sur le fait qu'elle ait le bon rendu.

Rapporte la route, le bloc dont elle provient, et ce que tu as dû recâbler.
