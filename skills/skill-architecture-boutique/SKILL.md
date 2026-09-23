---
name: skill-architecture-boutique
description: Skill de référence (connaissances) sur l'architecture de la boutique APEX ATELIER — où vit chaque route, composant et module de lib/, comment fonctionne le shell desktop uniquement, comment circule l'état du panier et de la wishlist, et comment sont calculés les totaux de commande. À utiliser quand il faut naviguer dans le code ou l'étendre, avant d'ajouter une page, de déplacer un composant, de toucher au panier ou aux totaux, ou dès qu'on se demande « où est-ce que ça doit aller ? ». Pour la procédure pas à pas de construction d'une nouvelle surface à partir d'un bloc ReUI, utiliser le skill de workflow `skill-creer-page-avec-bloc-reui`.
group: storefront
icon: map
---

# Architecture de la boutique

Une boutique de sneakers **desktop uniquement et frontend uniquement**. Pas
de backend, pas de base de données, pas de prestataire de paiement. Tout est
rendu à partir d'un catalogue statique et d'un panier côté client.

Lire [reference.md](reference.md) pour la table des routes, le contrat de
répertoires, le shell desktop, le flux d'état du panier, les totaux et le
formatage monétaire, avec la raison de chaque règle. Lire
[examples.md](examples.md) pour du code réel du projet et des paires
avant/après.

## L'essentiel

1. **Cinq routes** : `/`, `/products`, `/products/[slug]`, `/cart`,
   `/checkout`. `app/` ne contient que des routes, fines, surtout de la
   composition.
2. **Rien n'importe depuis `components/blocks/`**, et on ne le modifie pas :
   c'est la copie de référence des blocs ReUI. Le code utilisé vit dans
   `components/storefront/`, et chaque fichier s'ouvre sur un commentaire
   nommant son bloc source et ce qui a changé.
3. **Desktop uniquement, en CSS pur** : `.desktop-shell` et
   `<DesktopOnlyNotice>` basculent à 1024px. Aucun préfixe `sm:` / `md:` /
   `lg:` sur la mise en page ; les grilles sont fixes.
4. **Un seul état panier/wishlist** : `useCart()` depuis
   `lib/cart-store.tsx`. Jamais de `useState` de démo, jamais de lecture de
   `localStorage` pendant le rendu.
5. **L'argent se calcule dans `lib/order.ts`** via `computeTotals()`, et
   s'affiche avec `formatPrice()` / `formatMoney()` — jamais `toFixed(2)` ni
   `€` en dur.

## Ajouter une page

1. Créer `app/<route>/page.tsx`.
2. `npx next typegen` pour que `PageProps<'/route'>` existe.
3. `await props.params` / `await props.searchParams` — les deux sont
   asynchrones.
4. Construire la surface à partir d'un bloc ReUI (voir le skill
   `skill-creer-page-avec-bloc-reui` pour la procédure, et `skill-guide-blocs-reui` pour
   le contexte).
5. Placer les constantes partagées dont la page serveur a besoin dans `lib/`,
   pas dans le composant client.
6. `npx tsc --noEmit && npm run build`, puis regarder la page dans le
   navigateur.
