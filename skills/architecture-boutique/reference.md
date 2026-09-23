# Référence de l'architecture

## Routes

| Route | Rendu | Notes |
| --- | --- | --- |
| `/` | Statique | Season hero, sélection 4-up, collections, éditorial de l'atelier |
| `/products` | Dynamique | Lit `searchParams` (`?collection=`, `?sale=true`) |
| `/products/[slug]` | SSG | `generateStaticParams` sur le catalogue |
| `/cart` | Statique | Le shell est statique ; le panier lui-même est un état client |
| `/checkout` | Statique | Stepper en trois étapes, puis confirmation |

`/products` est la seule route dynamique parce qu'elle dépend de la query
string. Les pages produit sont générées au build depuis `lib/catalog.ts` :
ajouter un produit au catalogue ajoute sa page.

## Contrat de répertoires

```
app/                      routes only — thin, mostly composition
components/
  blocks/                 pristine ReUI blocks, exactly as installed
  storefront/             the adapted components the app imports
  ui/ · reui/             shadcn + ReUI primitives
lib/
  catalog.ts              products, collections, photography, reviews, money
  cart-store.tsx          cart + wishlist context ("use client")
  order.ts                totals, VAT, delivery tiers, promo code
  filters.ts              catalog filter shape — plain module, RSC-safe
```

Deux règles strictes :

1. **Rien n'importe depuis `components/blocks/`.** C'est une copie de
   référence qui permet de comparer (diff) n'importe quel composant adapté à
   son original. Ne pas la modifier non plus — sinon le diff ne veut plus
   rien dire.
2. **Chaque fichier de `components/storefront/` s'ouvre sur un commentaire
   nommant son bloc ReUI source et ce qui a changé.** Le garder exact : c'est
   ce qui rend l'origine d'un composant traçable.

## Desktop uniquement

Il n'y a pas de mise en page mobile, et c'est voulu.

- `.desktop-shell` dans `globals.css` est en `display: none` sous 1024px et
  en `display: flex` au-dessus.
- `<DesktopOnlyNotice>` occupe le viewport sous `lg`, et est masqué
  au-dessus.
- **Uniquement en CSS, exprès** : pas de JS de détection du viewport, donc
  pas de mismatch d'hydratation ni de flash de la mauvaise mise en page.
- Ne pas ajouter de préfixes `sm:` / `md:` / `lg:` sur la mise en page. Les
  grilles sont fixes :

  | Surface | Grille |
  | --- | --- |
  | Accueil | 4-up |
  | Catalogue | `[280px_1fr]` |
  | PDP | `[1.4fr_minmax(360px,1fr)]` |
  | Panier et checkout | `[1fr_360px]` |

## État du panier et de la wishlist

Un seul contexte, dans `lib/cart-store.tsx`, consommé via `useCart()`.

```tsx
const { resolved, count, subtotal, savings, addLine, setQuantity,
        removeLine, clear, wishlist, toggleWishlist, isWishlisted,
        miniCartOpen, setMiniCartOpen, lastAddedId, hydrated } = useCart()
```

- **Une `CartLine` ne stocke que `slug` + `colorId` + `size` + `quantity`.**
  Elle est jointe au catalogue en `ResolvedCartLine` à la lecture. Ainsi, un
  changement de prix dans `catalog.ts` est reflété immédiatement, et une
  ligne dont le produit a été supprimé est écartée au lieu d'être rendue
  comme un trou.
- **L'identité d'une ligne est `slug__colorId__size`** : la même chaussure
  en deux pointures fait deux lignes, et ré-ajouter la même variante
  incrémente la quantité.
- **Persisté dans `localStorage`.** Chaque lecture et écriture est enveloppée
  dans un try/catch — la navigation privée et le stockage bloqué ne doivent
  pas casser la page.
- **Hydratation :** le provider rend un panier de départ (seed bag) côté
  serveur et au premier rendu client, puis charge `localStorage` dans un
  effet et bascule `hydrated`. Ne pas lire `localStorage` pendant le rendu —
  le HTML serveur et le premier rendu client divergeraient.
- **Les blocs ecommerce ReUI embarquent leurs propres tableaux de démo en
  `useState` local.** En adaptant un bloc, supprimer cet état et lire le
  store, sinon le compteur de l'en-tête et la page panier ne seront pas
  d'accord.

## Totaux de commande

`lib/order.ts` détient l'argent. La page panier, le mini-panier et la
colonne du checkout appellent tous `computeTotals()`, pour qu'ils ne
puissent pas diverger.

```ts
computeTotals({ subtotal, promoApplied, delivery })
// → { subtotal, discount, delivery, tax, total }
```

- Code promo `ATELIER10` → 10 % de remise sur le sous-total.
- TVA à 23 %, appliquée au sous-total **après remise**.
- La livraison standard est gratuite dès que le net dépasse
  `FREE_SHIPPING_THRESHOLD` (150 €) ; express et overnight coûtent toujours
  leur tarif.

Ajouter un palier ou changer un taux se fait **ici**, jamais dans un
composant.

## Formatage monétaire

| Helper | Usage |
| --- | --- |
| `formatPrice()` | Euros entiers, pour les cartes et les prix mis en avant |
| `formatMoney()` | Deux décimales, pour les lignes du panier et les totaux |

Jamais de `toFixed(2)` en ligne, jamais de `€` écrit en dur : le format et
la devise restent définis à un seul endroit.

## Frontière serveur/client

Les constantes partagées dont une page serveur a besoin vont dans `lib/`, pas
dans le composant client qui les utilise aussi. C'est la raison d'être de
`lib/filters.ts` : une valeur exportée depuis un module `"use client"`
arrive côté serveur comme une référence client, pas comme l'objet lui-même.

## Ajouter une page — détail

1. Créer `app/<route>/page.tsx`.
2. `npx next typegen` pour que `PageProps<'/route'>` existe.
3. `await props.params` / `await props.searchParams` — les deux sont
   asynchrones en Next 16.
4. Construire la surface à partir d'un bloc ReUI (skill
   `integration-bloc-reui` pour la procédure, `blocs-premium-reui` pour le
   contexte).
5. Placer les constantes partagées dans `lib/`, pas dans le composant
   client.
6. `npx tsc --noEmit && npm run build`, puis regarder la page dans le
   navigateur — un build vert ne dit rien du rendu.
