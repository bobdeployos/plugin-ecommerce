---
description: Rapporte l'état de santé de la boutique — routes, blocs ReUI installés, taille du catalogue, et toute violation du contrat détectée par un scan statique
argument-hint: "[--verbose]"
allowed-tools: Bash(node:*)
---

Rapporte l'état actuel du projet de boutique.

Lance le script d'inventaire depuis la racine du projet :

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/etat-boutique.mjs" $ARGUMENTS
```

Il rapporte :

1. **Routes** trouvées sous `app/`, et si chacune attend (`await`) `params` /
   `searchParams` là où elle les utilise
2. **Blocs ReUI** installés dans `components/blocks/`, et quel composant adapté
   de `components/storefront/` revendique chacun comme source
3. **Catalogue** — nombre de produits par collection, fourchette de prix,
   nombre de photos référencées, et tout produit auquel manque un champ requis
4. **Violations du contrat** — `asChild`, `<img>` brut, breakpoints mobiles
   dans les composants de la boutique, imports depuis `components/blocks/`,
   prix en dur, et classes de palette Tailwind brutes utilisées pour l'habillage

Ensuite :

- Si tout est propre, dis-le en une ligne. Ne reformule pas la sortie.
- Si des violations sont rapportées, **corrige-les** au lieu de seulement les
  lister — chacune a une forme correcte documentée dans les skills
  `skill-guide-blocs-reui` et `skill-architecture-boutique`. Relance le script
  ensuite pour confirmer.
- Les blocs orphelins (installés mais jamais adaptés) ne sont pas des erreurs.
  Mentionne-les une fois comme surfaces disponibles ; ne les supprime pas.
