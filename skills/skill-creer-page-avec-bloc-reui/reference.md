# Référence d'intégration ReUI

## Cohérence de surface — la règle la plus importante

Les blocs ReUI se déclinent sur l'une de deux surfaces : **Frame** ou
**Card**. Ce projet est **Card** partout. Toujours passer `surface: "card"`
à la recherche. Un bloc listé en `surface: "frame"` est disqualifié
d'office — en mélanger un dans un écran en surface Card casse le système
visuel. Les blocs `surface: "none"` (heros, navbars, états vides) sont sûrs
partout.

## Catégories qui comptent ici

`shop-hero`, `product-grid`, `product-card`, `product-detail`,
`filter-sidebar`, `shopping-cart`, `checkout`, `review`, `wishlist`,
`coupon`, `receipt`, `category-card`. Utilise `list_block_categories` si
aucune de ces catégories ne correspond clairement à ce que tu construis.

## Base UI, pas Radix

`components.json` fixe `style: "base-nova"` — chaque primitive ici est
construite sur `@base-ui/react`, pas Radix. C'est la façon la plus courante
qu'un bloc adapté casse silencieusement, parce que ça ne plante pas, ça
fait juste autre chose que ce à quoi tu t'attends :

```tsx
// Correct — composition Base UI
<Button nativeButton={false} render={<Link href="/cart" />}>View bag</Button>
<SheetTrigger render={<Button variant="outline">Open</Button>} />

// Faux — asChild est une convention Radix et ne fait rien ici
<Button asChild><Link href="/cart">View bag</Link></Button>
```

Autres pièges Base UI à vérifier après une adaptation :
- `SelectValue` affiche la valeur brute stockée sauf si tu passes une
  fonction de rendu : `<SelectValue>{(v) => LABELS[v as Key]}</SelectValue>`.
- `Accordion` prend `multiple` + `defaultValue={[...]}`, pas
  `type="multiple"`.
- `onCheckedChange` peut recevoir une valeur indéterminée — restreins avec
  `checked === true` avant de stocker un booléen.

## Licence

`REUI_LICENSE_KEY` vit dans `.env.local` (gitignored). Elle est référencée
depuis `components.json` comme `${REUI_LICENSE_KEY}` pour que la CLI
l'expande à l'installation — ne jamais mettre la clé elle-même en dur dans
`components.json`, et ne jamais la commiter.

## Thème pendant l'adaptation

N'utilise que les tokens : `bg-card`, `text-muted-foreground`,
`border-border`, `bg-primary`, `ring-ring`, plus les extras ReUI `success` /
`warning` / `info` / `invert`. Jamais une classe de palette Tailwind brute
(`bg-zinc-900`, `text-slate-500`) pour le chrome — la seule exception
autorisée est les classes de swatch produit dans `lib/catalog.ts`, où la
teinte *est* la donnée. La palette est volontairement achromatique ; c'est
la photographie des sneakers qui apporte la couleur, donc une nouvelle
teinte de marque ailleurs est une régression, pas un choix de style.

## Images

Toujours `next/image`, jamais le `<img>` que les blocs fournissent par
défaut. Les hôtes distants doivent être déclarés dans `next.config.ts` →
`images.remotePatterns` (aujourd'hui, seul `images.unsplash.com/photo-**`
est autorisé). `images.qualities` vaut `[75, 90]` — toute autre prop
`quality` est silencieusement ramenée à la valeur autorisée la plus proche,
donc `quality={85}` ne plantera pas, ça ne sera juste pas 85. `fill` a
besoin d'un parent positionné, et il faut toujours passer `sizes`.

## Frontière serveur/client

Une **valeur** exportée depuis un module `"use client"` arrive dans un
Server Component comme une référence client, pas l'objet lui-même — la
disperser (spread) produit des champs `undefined`, et la page plante à
l'exécution alors que le build reste vert. Les constantes/types partagés
dont un Server Component a besoin doivent aller dans un module simple sous
`lib/` (voir `lib/filters.ts`, qui existe précisément pour cette raison),
jamais à côté du composant client qui les utilise aussi.
