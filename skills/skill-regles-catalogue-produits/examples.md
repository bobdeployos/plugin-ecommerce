# Exemples — catalogue produit

## Une fiche réelle : `velocity-road-2`

Extrait de `lib/catalog.ts` (abrégé). La copy est en anglais, comme partout
dans la boutique.

```ts
{
  slug: "velocity-road-2",
  name: "Velocity Road 2",
  sku: "AX-2201",
  collection: "running",
  tagline: "Second-generation daily trainer with a lighter supercritical midsole.",
  price: 164,
  compareAtPrice: 198,
  badge: { label: "17% Off", variant: "destructive" },
  isNew: true,
  highlights: [
    "Supercritical EVA midsole, 8 mm drop",
    "Engineered mesh upper, 62% recycled yarn",
    "Carbon rubber outsole with forefoot flex groove",
    "224 g in EU 42 — true to size",
  ],
  colors: [
    {
      id: "chalk",
      name: "Chalk",
      swatchClassName: "bg-stone-100 border border-border",
      shot: {
        src: photo("photo-1579338559194-a162d19bf842", { w: 900, h: 1100 }),
        alt: "Velocity Road 2 in Chalk, suspended mid-air",
      },
    },
    // "ember" and "signal" each carry their own, different photo
  ],
  sizes: sizeRun({ "39": "low", "45": "low", "46": "out" }),
  specs: [
    { title: "Build", rows: [/* 4 rows */] },
    { title: "Geometry & weight", rows: [/* 4 rows */] },
    { title: "Fit & use", rows: [/* 4 rows */] },
  ],
}
```

Ce qu'il faut remarquer :

- `discountPercent()` donne `round((198 − 164) / 198 × 100) = 17` → le badge
  dit `"17% Off"`. Les deux concordent.
- Quatre `highlights`, tous des faits de construction mesurables.
- Coloris en portrait `900×1100`, `alt` qui décrit la prise de vue réelle.
- `sizeRun()` ne surcharge que les trois pointures dont le stock diffère.
- Groupes de specs d'un modèle running : `Build` / `Geometry & weight` /
  `Fit & use`.

## Avant / après — prix et badge

```ts
// Avant — le badge contredit le calcul (discountPercent() renvoie 17)
price: 164,
compareAtPrice: 198,
badge: { label: "20% Off", variant: "destructive" },

// Après
price: 164,
compareAtPrice: 198,
badge: { label: "17% Off", variant: "destructive" },
```

## Avant / après — URL de photo

```ts
// Avant — chaîne brute, et une photo premium hors remotePatterns
src: "https://plus.unsplash.com/premium_photo-XXXX?w=900",

// Après — ID vérifié (200 image/jpeg) et helper photo()
src: photo("photo-1579338559194-a162d19bf842", { w: 900, h: 1100 }),
```

Vérification avant écriture :

```bash
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" \
  "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=400&q=60"
# expected: 200 image/jpeg
```

## Avant / après — pointures

```ts
// Avant — série écrite à la main, facile à désynchroniser
sizes: [
  { label: "EU 39", state: "available" },
  { label: "EU 40", state: "available" },
  // ...
],

// Après — seule la différence est déclarée
sizes: sizeRun({ "41": "out", "45": "low" }),
```

## Avant / après — ton éditorial

```ts
// Avant — promotionnel, interchangeable, point d'exclamation
tagline: "A revolutionary, premium runner that will elevate every mile!",

// Après — concret, propre à ce modèle
tagline: "Second-generation daily trainer with a lighter supercritical midsole.",
```

Second paragraphe de `story` : il doit porter une limite honnête (chaussant
étroit, teinture qui déteint au premier port, durée de vie de la semelle
intermédiaire). Côté specs, `velocity-road-2` l'exprime aussi :
`{ label: "Mileage", value: "650–850 km before midsole replacement" }`.

## Un avis bien construit

```ts
{
  id: "vr2-1",
  author: "Avery Chen",
  rating: 5,
  title: "Held up at 120 km in",
  body: "Logged 120 km in the first month and the midsole still feels lively. Breathable enough for warm runs, and the sizing matched my usual EU 42 exactly.",
  verified: true,
  size: "EU 42",
  color: "Chalk",
}
```

Une pointure, un coloris, un détail concret (120 km). Les autres avis du
même produit doivent varier la note. Aucun histogramme à écrire :
`getReviewBreakdown()` le dérive de `rating` et `reviewCount`.

## Avant / après — facette dérivée

```tsx
// Avant — compteur écrit à la main dans le composant
const COLOR_FACETS = [{ id: "white", label: "White", count: 7 }]

// Après — dérivé du catalogue
const facets = colorFamilyFacets()
```

`colorFamily()` lit la classe de pastille : `bg-stone-100` → `"white"`,
`bg-orange-500` → `"orange"`, `bg-red-600` → `"red"`. Aucun champ « famille »
à stocker en double.
