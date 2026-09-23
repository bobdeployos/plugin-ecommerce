---
description: Ajoute un produit au catalogue, ou réécrit la copy, les specs et les avis d'un produit existant
argument-hint: "<slug ou description>   ex. une chaussure de trail en Gore-Tex autour de 240 €"
allowed-tools: Bash(node:*), Bash(npx:*), Bash(npm:*), Bash(curl:*)
---

Ajoute ou révise un produit du catalogue : `$ARGUMENTS`

Lance l'agent **redacteur-catalogue** pour cela. Il porte le ton éditorial et la
procédure de vérification des photos.

Ce qu'il doit produire, dans `lib/catalog.ts` et nulle part ailleurs :

- un `Product` complet — aucun champ omis, `slug` en kebab-case et unique
- `tagline` en une phrase, `story` en exactement deux paragraphes, `highlights`
  en exactement quatre faits de fabrication
- 2–3 coloris, **chacun avec sa propre photographie distincte**, parce que les
  pastilles de la carte changent l'image principale
- 3–4 photos de galerie carrées, 3 groupes de specs de 4 lignes
- des avis dans `REVIEWS_BY_SLUG` qui nomment une taille, une couleur et un vrai détail

Même si la demande est formulée en français, toute la copy produit écrite dans
le catalogue reste **en anglais** — la boutique est entièrement en anglais.

**La photographie, c'est la partie qui déraille.** Chaque ID Unsplash doit
être vérifié avant d'arriver dans le fichier :

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/verifier-photos.mjs"
```

Ce script parcourt `lib/catalog.ts` et vérifie que chaque photo référencée
résout vers une vraie image. Lance-le après l'écriture. Tout ce qui n'est pas
`200 image/jpeg` doit être remplacé — un ID mort est une casse invisible qui
n'apparaît qu'en production. Les URL `plus.unsplash.com/premium_photo-*` ne
sont pas utilisables du tout.

Ensuite :

```
npx tsc --noEmit && npm run build
```

Rapporte le slug, sa collection et son prix, et confirme quels IDs de photo tu
as vérifiés. Si tu as révisé un produit existant, dis ce qui a changé et pourquoi.
