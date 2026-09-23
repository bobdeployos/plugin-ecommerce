# Référence du contrat catalogue

À lire avant d'écrire ou de modifier un `Product` dans `lib/catalog.ts`.

## Champs obligatoires

Un `Product` a besoin de tout ce qui suit :

| Champ | Forme | Notes |
| --- | --- | --- |
| `slug` | kebab-case, unique | C'est l'URL. |
| `name`, `sku` | chaînes | |
| `collection` | `"running" \| "court" \| "trail" \| "lifestyle"` | |
| `tagline` | une phrase | Tient sur deux lignes sur une carte. |
| `story` | `string[]`, exactement 2 paragraphes | Ce que c'est, puis comment c'est construit + un compromis honnête. |
| `price` | nombre, euros entiers | |
| `compareAtPrice` | nombre optionnel | Si renseigné, ajouter un `badge` correspondant. |
| `rating`, `reviewCount` | nombre | |
| `inStock` | booléen | |
| `highlights` | exactement 4 chaînes | Des faits de construction, pas des bénéfices marketing. |
| `colors` | 2-3 `ColorOption` | Chacun a besoin de son propre `shot` — voir Photographie. |
| `sizes` | `SizeOption[]` | Construit avec `sizeRun()`. |
| `gallery` | 3-4 `Shot`, carré 900×900 | La première photo sert aussi de vignette carte/panier. |
| `specs` | exactement 3 `SpecGroup`, 4 lignes chacun | Les titres de groupe varient selon le type — voir plus bas. |
| `badge` | optionnel | Doit correspondre à `discountPercent()`. |
| `isNew` | booléen optionnel | Marque le produit comme faisant partie du drop en cours. |

Titres des groupes de specs selon le type de produit : `Build`,
`Geometry & weight`, `Fit & use` pour les runners ; `Construction`,
`Provenance`, `Fit & care` pour le cuir/les chaussures de basket. Cale-toi
sur le produit existant le plus proche en type.

## Photographie

Toute l'imagerie vient d'Unsplash, servie depuis `images.unsplash.com`.

- Photos carte et coloris : portrait `900×1100`.
- Photos galerie : carré `900×900`.
- Vignettes collection : carré `900×900`.
- Éditorial : paysage.
- Toujours passer par `photo(id, { w, h, q })` — jamais une URL écrite à la
  main avec ses propres paramètres de requête.
- **Vérifie chaque nouvel ID avant qu'il n'entre dans le fichier** — lance
  `scripts/verifier_photo.sh <id>`. Un 404 ici, c'est une fiche produit cassée
  en production, et ça passe quand même le typecheck et le build, donc rien
  d'autre dans la chaîne d'outils ne le rattrapera.
- Rejette tout résultat `plus.unsplash.com/premium_photo-*` : ce n'est pas
  couvert par `next.config.ts` → `images.remotePatterns`, et ce n'est pas
  libre d'usage.
- `Shot.alt` décrit la photo réelle, précisément — c'est lu à voix haute par
  les lecteurs d'écran, pas du remplissage décoratif.

### Trouver des candidats

La page d'une photo Unsplash pour un ID court donne l'URL CDN. Récupère
`https://unsplash.com/photos/<shortId>` et relève l'URL
`images.unsplash.com/photo-...` sur la page avant de la vérifier.

## Ton éditorial

Le texte se lit comme si quelqu'un qui fabrique vraiment des chaussures
l'avait écrit. Sobre, précis, légèrement en retenue. Rappel : ce texte reste
**en anglais** dans le fichier — voir la note « Langue » dans `SKILL.md` ;
ce qui suit décrit la technique d'écriture, pas la langue.

- **Concret plutôt que promotionnel.** « 224 g en EU 42 » bat « incroyablement
  léger ». « 11 points au pouce » bat « savoir-faire d'exception ».
- **Mots bannis** : « revolutionary », « game-changing », « premium » (en
  adjectif), « elevate », « curated » — et les points d'exclamation.
  Également banni : toute phrase qui pourrait décrire une autre chaussure
  sans rien changer. Si tu peux remplacer par le nom d'un concurrent et que
  la phrase tient toujours, réécris-la.
- **Assume le compromis.** Le second paragraphe du `story` doit contenir une
  limite honnête — coupe étroite, teinture qui déteint, midsole à 450 km de
  durée de vie. Un texte sans aucun défaut se lit comme de la pub, pas comme
  de la documentation.
- **Vrais noms de lieux et de matières.** « a leather house outside Ancona »,
  « pig suede overlays », « supercritical EVA » — pas « premium materials ».
- Les avis mentionnent une taille, un coloris et un détail réel et précis.
  Un avis cinq étoiles qui ne dit rien de spécifique est pire que pas d'avis
  du tout — à retirer plutôt qu'à publier comme remplissage.

## Valeurs dérivées — ne pas les dupliquer

- `colorFamily()` analyse la classe du swatch ; ne pas ajouter un second
  champ de couleur.
- `getReviewBreakdown()` synthétise l'histogramme d'étoiles depuis `rating`
  + `reviewCount` — ne jamais écrire les barres à la main, elles finiraient
  par diverger du chiffre affiché dès qu'une fiche est modifiée.
- `colorFamilyFacets()` / `sizeFacets()` calculent les compteurs de filtres
  catalogue depuis `PRODUCTS` — si tu ajoutes une facette, dérive-la de la
  même façon.
- `formatPrice` (euros entiers, cartes/titres) vs `formatMoney` (deux
  décimales, lignes panier/commande) — utilise celle qui correspond à
  l'endroit où le nombre s'affiche, ne formate jamais l'argent à la main
  dans un composant.

## Erreurs courantes

- Un coloris qui réutilise le `shot` d'un autre coloris — le clic sur le
  swatch ne changera pas l'image, silencieusement.
- `compareAtPrice` renseigné sans `badge`, ou un `badge` dont le libellé ne
  correspond pas à ce que `discountPercent()` calcule à partir des deux
  prix.
- Moins de 4 `highlights` ou moins de 3 photos de `gallery` — le buy box et
  la galerie PDP supposent tous les deux le compte complet et afficheront un
  trou disgracieux, pas une erreur visible.
- Un `story` avec un seul paragraphe, ou deux paragraphes qui vendent tous
  les deux au lieu que le second assume une limite.
