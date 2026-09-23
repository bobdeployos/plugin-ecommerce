---
name: catalogue-produits
description: Skill de référence (connaissances) sur le catalogue produit de la boutique — le contrat de données Product dans lib/catalog.ts, la photographie Unsplash et sa vérification, le ton éditorial, les avis et les facettes dérivées. À utiliser quand il faut ajouter un produit, changer un prix, trouver ou vérifier une photo produit, ou écrire la copy, les specs et les avis d'une fiche, et chaque fois qu'on a besoin de savoir quelle forme doit avoir une donnée produit ou pourquoi. Pour la procédure pas à pas de saisie ou de révision d'une fiche, utiliser le skill de workflow `fiche-produit-catalogue`, qui s'appuie sur celui-ci.
group: storefront
icon: package
---

# Le catalogue produit

`lib/catalog.ts` est la source de vérité unique. Le season hero, la grille des
collections, les facettes du catalogue, la PDP, le panier et le récapitulatif
du checkout lisent tous ce fichier.

**Si vous êtes en train de taper un prix, un nom de produit, une pointure ou
une URL d'image dans un composant, arrêtez-vous.** Sa place est ici.

La boutique est **exclusivement en anglais** : toute la copy produit
(`tagline`, `story`, `highlights`, `alt`, avis, libellés de specs) s'écrit en
anglais, même quand la conversation se fait en français.

Lire [reference.md](reference.md) pour le type `Product` complet, les règles
de photographie, le ton éditorial et les helpers dérivés, avec la raison de
chaque règle. Lire [examples.md](examples.md) pour une fiche réelle annotée
et des paires avant/après.

## Procédure

1. **Remplir tous les champs** du type `Product` — un produit à moitié
   renseigné casse des surfaces en aval.
2. **Un coloris = une photo distincte** (2–3 coloris), le size run construit
   avec `sizeRun()`, `compareAtPrice` + `badge.label` cohérents avec
   `discountPercent()`.
3. **Vérifier chaque photo avant de l'écrire** : récupérer l'URL CDN depuis
   la page de la photo, rejeter `plus.unsplash.com/premium_photo-*`, tester
   avec `curl` (seul `200 image/jpeg` est accepté), puis construire l'URL
   avec `photo(id, { w, h, q })`.
4. **Écrire dans le ton de l'atelier** : concret plutôt que promotionnel,
   aucun mot banni, un compromis honnête dans le second paragraphe de `story`.
5. **Avis** dans `REVIEWS_BY_SLUG[slug]` : pointure, coloris et un détail
   concret par avis, notes variées. Jamais d'histogramme écrit à la main.
6. **Dériver, ne pas dupliquer** : familles de couleur et compteurs de
   facettes sont calculés depuis `PRODUCTS`.
7. **Terminer** :

   ```bash
   npx tsc --noEmit && npm run build
   ```

   Puis indiquer quels IDs de photo ont été vérifiés.

Pour déléguer la rédaction, l'agent `agent-redaction-fiches-produits` applique ces règles ;
`/boutique-sneakers:produit` lance le workflow de bout en bout.
