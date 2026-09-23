# Référence du catalogue produit

## Une seule source de vérité

`lib/catalog.ts` alimente le season hero, la grille des collections, les
facettes du catalogue, la PDP, le panier et le récapitulatif du checkout. Un
prix, un nom, une pointure ou une URL d'image tapé en dur dans un composant
finit forcément par diverger du catalogue : la carte affiche un prix, le
panier en calcule un autre. Tout passe donc par ce fichier.

## Langue

La boutique est en anglais uniquement. Toute chaîne visible par le client —
`name`, `tagline`, `story`, `highlights`, libellés et valeurs de specs, `alt`,
titres et corps des avis, `badge.label` — est rédigée en anglais. Aucune
trace de français dans les données, même si la demande arrive en français.

## Le type `Product`

```ts
type Product = {
  slug: string              // kebab-case, unique — this is the URL
  name: string
  sku: string
  collection: "running" | "court" | "trail" | "lifestyle"
  tagline: string           // one sentence, ≤ 2 lines on a card
  story: string[]           // exactly two paragraphs
  price: number
  compareAtPrice?: number   // when set, add a matching `badge`
  rating: number
  reviewCount: number
  inStock: boolean
  highlights: string[]      // exactly four construction facts
  colors: ColorOption[]     // 2–3, each with its own photo
  sizes: SizeOption[]       // build with sizeRun()
  gallery: Shot[]           // 3–4 square shots
  specs: SpecGroup[]        // 3 groups × 4 rows
  badge?: { label: string; variant: "default" | "destructive" }
  isNew?: boolean
}
```

**Remplir chaque champ.** Un produit à moitié renseigné produit des surfaces
cassées en aval : une PDP sans specs, une carte sans tagline, un filtre qui
ne trouve pas le produit.

| Règle | Pourquoi |
| --- | --- |
| Chaque coloris a **sa propre photo distincte** | Les pastilles de la carte remplacent l'image principale ; un coloris sans photo propre est un bug visible. |
| `sizeRun()` construit la série standard EU 39–46 ; ne surcharger que les pointures dont l'état de stock diffère : `sizeRun({ "41": "out", "45": "low" })` | Une seule définition de la série évite les grilles de tailles incohérentes d'un produit à l'autre. |
| `compareAtPrice` + `badge.label` doivent concorder avec `discountPercent()` | Le badge « 17% Off » et le prix barré sont lus côte à côte ; un écart se voit immédiatement. |
| `story` = exactement deux paragraphes, `highlights` = exactement quatre faits de construction, `specs` = 3 groupes × 4 lignes, `gallery` = 3–4 images carrées | Les blocs de la PDP sont dimensionnés pour ces quantités. |
| `slug` en kebab-case, unique | C'est l'URL de `/products/[slug]`. |

Les titres des groupes de specs dépendent du type de produit :

- running : `Build` / `Geometry & weight` / `Fit & use` ;
- cuir : `Construction` / `Provenance` / `Fit & care`.

## Photographie — vérifier, ne jamais supposer

Toutes les images viennent d'Unsplash, servies depuis `images.unsplash.com`
et déclarées dans `next.config.ts` → `remotePatterns` (restreint au chemin
`/photo-**`).

**Un ID de photo non vérifié, c'est une carte produit cassée en production.**

1. **Trouver des candidates.** La page d'une photo donne l'URL CDN : récupérer
   `https://unsplash.com/photos/<shortId>` et y lire l'URL
   `images.unsplash.com/photo-...`. Scraper directement la page de recherche
   est bloqué ; récupérer une page de photo individuelle via un outil de
   fetch fonctionne.
2. **Rejeter `plus.unsplash.com/premium_photo-*`** — non couvert par
   `remotePatterns`, et pas libre d'utilisation.
3. **Vérifier que chaque ID résout** avant de l'écrire dans le fichier :

   ```bash
   curl -s -o /dev/null -w "%{http_code} %{content_type}\n" \
     "https://images.unsplash.com/photo-XXXX?auto=format&fit=crop&w=400&q=60"
   ```

   Tout autre résultat que `200 image/jpeg` est disqualifiant.
4. **Construire les URL avec le helper `photo(id, { w, h, q })`**, jamais une
   chaîne brute. Le helper demande au CDN une source recadrée et plafonnée
   (`q` vaut 80 par défaut) ; `next/image` ré-encode par-dessus.
5. **Dimensions** :

   | Usage | Format |
   | --- | --- |
   | Photo de coloris et de carte | portrait `900×1100` |
   | Galerie | carré `900×900` |
   | Tuiles de collection | `900×900` |
   | Éditorial | paysage |

6. **`alt` décrit la photographie réelle, précisément.** Il est lu à voix
   haute par les lecteurs d'écran : « a shoe » ne dit rien.

## Ton éditorial

La copy doit sonner comme si quelqu'un qui fabrique des chaussures l'avait
écrite : simple, précise, un peu en retenue.

- **Le concret plutôt que le promotionnel.** « 224 g in EU 42 » vaut mieux
  que « incredibly lightweight ». « 11 stitches per inch » vaut mieux que
  « expert craftsmanship ».
- **Interdits :** « revolutionary », « game-changing », « premium » employé
  comme adjectif, « elevate », « curated », les points d'exclamation, et
  toute phrase qui pourrait décrire aussi bien une autre chaussure.
- **Admettre un compromis.** Le second paragraphe de `story` porte une
  limite honnête — chaussant étroit, la teinture déteint au premier port, 450 km de
  durée de vie de la semelle intermédiaire. Une copy sans aucun défaut se lit
  comme de la publicité.
- **Des matériaux et des lieux réels** : « a leather house outside Ancona »,
  « pig suede overlays on layered mesh », « supercritical EVA ».

## Avis

Les avis vivent dans `REVIEWS_BY_SLUG[slug]`, avec repli sur
`DEFAULT_REVIEWS`. Chaque avis nomme une pointure, un coloris et un détail
concret — kilométrage, temps de rodage, chaussant. Varier les notes : tous
les avis ne sont pas des cinq étoiles. Un avis qu'on pourrait coller sur un
autre produit est pire que pas d'avis du tout.

On n'écrit jamais l'histogramme à la main : `getReviewBreakdown()` le dérive
de `rating` et `reviewCount`, de sorte que les barres concordent toujours
avec la note affichée.

## Dériver, ne pas dupliquer

- `colorFamily()` analyse la classe Tailwind de la pastille au lieu de
  stocker un second champ — la teinte et la nuance encodent déjà la famille.
- `colorFamilyFacets()` / `sizeFacets()` calculent les compteurs de filtres à
  partir de `PRODUCTS`.

Si vous ajoutez une facette à la page catalogue, dérivez-la de la même
manière. Un compteur écrit à la main dérive dès la première modification
d'un produit.

## Validation finale

```bash
npx tsc --noEmit && npm run build
```

Puis indiquer quels IDs de photo ont été vérifiés.
