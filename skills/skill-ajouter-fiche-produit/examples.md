# Exemples validés

Extraits réels de `lib/catalog.ts`, déjà en production. Reprends cette forme
et ce registre — pas ce contenu. Ils sont en anglais, comme tout le texte
produit réel (voir la note « Langue » dans `SKILL.md`) — ne les traduis pas.

## Un exemple de ton complet — Velocity Road 2

```ts
tagline: "Second-generation daily trainer with a lighter supercritical midsole.",
story: [
  "Velocity Road 2 is the shoe we reach for on every run that is not a race. The supercritical foam midsole returns more than the first generation at 26 grams less, and the geometry stays deliberately neutral so it disappears underfoot on easy days.",
  "The engineered mesh upper is spun from 62% recycled yarn and vented across the forefoot. A moulded heel counter locks the rearfoot without a stiff collar, which is what makes this shoe work as well at 5 km as at 30.",
],
highlights: [
  "Supercritical EVA midsole, 8 mm drop",
  "Engineered mesh upper, 62% recycled yarn",
  "Carbon rubber outsole with forefoot flex groove",
  "224 g in EU 42 — true to size",
],
```

Remarque : aucun adjectif ne fait le travail de vente. « 26 grams less »,
« 62% recycled yarn », « 224 g in EU 42 » — chaque affirmation est un
chiffre ou une matière nommée.

## Ton — rejeté vs publié

**Rejeté** (mots bannis, aucune précision, pourrait décrire n'importe
quelle chaussure) :
> "This revolutionary trainer features premium materials and elevates your
> every run!"

**Publié** :
> "Second-generation daily trainer with a lighter supercritical midsole."

## Motif coloris + photo

```ts
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
  {
    id: "ember",
    name: "Ember",
    swatchClassName: "bg-orange-500",
    shot: {
      src: photo("photo-1600185365926-3a2ce3cdb9eb", { w: 900, h: 1100 }),
      alt: "Velocity Road 2 in Ember, studio shot on a light background",
    },
  },
  // ...signal red — chaque coloris a SA PROPRE photo, jamais réutilisée
],
```

## Size run avec exceptions

```ts
sizes: sizeRun({ "39": "low", "45": "low", "46": "out" }),
```

Tout ce qui n'est pas listé prend par défaut `"available"` — ne passe que
les tailles dont l'état diffère réellement du run par défaut.

## Groupe de specs

```ts
{
  title: "Geometry & weight",
  rows: [
    { label: "Heel-to-toe drop", value: "8 mm" },
    { label: "Stack height", value: "34 mm heel · 26 mm forefoot" },
    { label: "Weight (EU 42)", value: "224 g · 7.9 oz" },
    { label: "Style code", value: "AX-2201 · Made in Portugal" },
  ],
},
```

## Vérification photo, avant vs après

**Avant** (ID non vérifié, collé directement depuis un résultat de
recherche) :
```ts
shot: {
  src: photo("photo-1234567890123-abcdef123456", { w: 900, h: 1100 }),
  alt: "New colorway",
},
```

**Après** — vérifié, et le alt décrit la vraie photo :
```bash
$ scripts/verifier_photo.sh photo-1628413993904-94ecb60f1239
200 image/jpeg
```
```ts
shot: {
  src: photo("photo-1628413993904-94ecb60f1239", { w: 900, h: 1100 }),
  alt: "Court Legend Low in Bone, side profile",
},
```
