# Checklist d'audit, avec le raisonnement derrière chaque règle

## Composition Base UI

Le style shadcn de ce projet est `base-nova`, construit sur `@base-ui/react`,
pas Radix — donc les réflexes Radix produisent du code qui ne fait rien
silencieusement, plutôt qu'une erreur qu'on remarquerait.

- `asChild` où que ce soit → faux. Base UI compose avec `render={<El />}`
  à la place. `asChild` n'est pas une prop reconnue ici, donc elle est
  simplement ignorée — le composant affiche son élément par défaut au lieu
  du tien, et rien ne te signale que c'est arrivé.
- `<Button>` qui enveloppe un `<Link>` comme enfant, au lieu de
  `nativeButton={false} render={<Link/>}`.
- `<SelectValue />` sans fonction de rendu là où un libellé est attendu —
  ça affiche la valeur brute stockée (ex. `"chalk"` au lieu de `"Chalk"`).
- `Accordion` utilisant `type="multiple"` (Radix) au lieu de `multiple`
  (la vraie prop de Base UI).
- Résultats de `onCheckedChange` stockés sans restreindre à `=== true` — la
  checkbox de Base UI peut renvoyer un état indéterminé, et le stocker
  directement dans un champ booléen transmet silencieusement une valeur qui
  n'est pas un booléen.

## Desktop uniquement

Il n'y a pas de mise en page mobile dans ce projet, par choix —
`<DesktopOnlyNotice>` occupe tout le viewport en dessous de 1024px, en CSS
seul, précisément pour qu'il n'y ait ni JS de viewport ni décalage
d'hydratation.

- Tout préfixe `sm:` / `md:` / `lg:` sur la mise en page dans
  `components/storefront/` ou `app/` est le signe que quelqu'un conçoit un
  breakpoint responsive dont ce projet n'a pas l'usage et que personne ne
  verra jamais.
- Un template de grille changé par rapport à ceux, fixes, du projet
  (4 colonnes sur l'accueil, 3 colonnes + rail de filtres de 280px sur le
  catalogue, `[1.4fr_minmax(360px,1fr)]` sur la PDP, `[1fr_360px]` sur
  panier/checkout) — ce sont des choix délibérés, pas des valeurs de démo à
  « corriger ».

## Tokens

La palette est volontairement achromatique — la photographie des sneakers
apporte la couleur, pas le chrome de l'interface. Une classe de palette
brute est souvent le signe que quelqu'un a copié une valeur directement
depuis le bloc ReUI d'origine au lieu de l'adapter.

- Classes de palette Tailwind brutes pour le chrome (`bg-zinc-900`,
  `text-slate-500`, `border-gray-200`). La seule exception autorisée est
  les classes de **swatch** produit dans `lib/catalog.ts`, où la teinte
  *est* la donnée affichée.
- Une pastille colorée à la main là où `<Badge variant="...">` couvre déjà
  le besoin.
- Toute nouvelle teinte de marque introduite quelque part.

## Images

- `<img>` au lieu de `next/image` — les blocs ReUI installés fournissent
  `<img>` par défaut, donc le convertir fait partie de l'adaptation, ce
  n'est pas une finition optionnelle.
- `next/image` sans `sizes`, ou `fill` sans parent positionné.
- Un hôte distant non couvert par `next.config.ts` → `images.remotePatterns`
  (aujourd'hui, seul `images.unsplash.com/photo-**`) — ça échoue au moment
  de la requête, pas au build, donc c'est facile à rater en local si
  l'image était déjà en cache.
- `quality` réglé en dehors de `[75, 90]` — `images.qualities` la ramène
  silencieusement à la valeur autorisée la plus proche, donc `quality={85}`
  ne plante pas, ce n'est juste discrètement pas 85.

## Données

`lib/catalog.ts` est la source de vérité unique précisément pour qu'un prix
ou une photo n'ait besoin de changer qu'à un seul endroit.

- Un prix, un nom de produit, une taille ou une URL d'image en dur dans un
  composant — ça doit aller dans `lib/catalog.ts` à la place.
- État panier ou wishlist stocké dans un `useState` local au lieu de
  `useCart()` — c'est précisément le pattern de bug qui fait que le
  compteur du panier dans le header ne correspond plus à la page panier,
  parce qu'ils liraient deux états différents.
- Une valeur exportée depuis un module `"use client"` et importée par un
  Server Component — elle traverse la frontière comme une référence
  client, pas l'objet, et se lit comme `undefined`. Les constantes/types
  partagés dont un Server Component a besoin doivent aller dans un module
  simple sous `lib/` à la place (c'est pour ça que `lib/filters.ts`
  existe).

## Hygiène des blocs

`components/blocks/` existe pour qu'un composant adapté puisse toujours
être comparé (diff) à ce dont il est parti. Ça ne marche que si ce dossier
reste intact.

- Un import depuis `components/blocks/` dans du code applicatif — ce
  dossier est une référence uniquement, jamais une dépendance.
- Une modification d'un fichier sous `components/blocks/` lui-même.
- Un fichier adapté dans `components/storefront/` dont le commentaire
  d'en-tête ne nomme plus fidèlement son bloc source — ce commentaire,
  c'est ce qui permet de retrouver l'original pour comparer.

## Accessibilité

- Éléments interactifs sans nom accessible.
- Images décoratives sans `alt="" aria-hidden="true"`.
- Un bouton de swatch couleur sans libellé `sr-only` — le swatch ne
  transmet la couleur que visuellement.

## Vérifier, ne pas supposer

```bash
npx tsc --noEmit
npm run build
```

Aucune des deux ne rattrape la plupart des règles ci-dessus — ce sont des
conventions, pas des erreurs de type — mais elles sont bon marché et
attrapent de vraies casses, donc autant les lancer plutôt que de supposer
que le diff build.
