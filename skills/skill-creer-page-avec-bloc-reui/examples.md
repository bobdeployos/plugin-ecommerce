# Blocs déjà installés dans la boutique

Vérifie ce tableau avant de recommander une nouvelle installation — la
surface dont tu as besoin existe peut-être déjà.

| Bloc | Adapté dans |
| --- | --- |
| `@reui/shop-hero-6` | `components/storefront/season-hero.tsx` |
| `@reui/navbar-12` | `components/storefront/site-header.tsx` |
| `@reui/product-grid-1` | `components/storefront/product-card.tsx` |
| `@reui/product-detail-1` | `components/storefront/product-detail/*` |
| `@reui/filter-sidebar-6` | `components/storefront/catalog-filters.tsx` |
| `@reui/shopping-cart-5` | `components/storefront/cart-view.tsx`, `order-summary.tsx` |
| `@reui/shopping-cart-7` | `components/storefront/mini-cart.tsx` |
| `@reui/checkout-2` | `components/storefront/checkout-view.tsx` |

Chaque fichier adapté s'ouvre par un commentaire nommant son bloc source —
garde ce commentaire exact quand tu retouches un de ces fichiers. Si le
projet a évolué depuis la rédaction de ce tableau, fie-toi aux commentaires
d'en-tête dans `components/storefront/` plutôt qu'à cette liste.

## Une adaptation commentée — `components/storefront/mini-cart.tsx`

Adapté depuis `@reui/shopping-cart-7`. Son commentaire d'en-tête, cité tel
quel (en anglais, comme le reste du code du dépôt) :

```tsx
// Adapted from the ReUI premium block `@reui/shopping-cart-7` (mini cart
// slide-out). The block's local `useState` demo lines were replaced by the
// shared cart store so the drawer, the header count and the cart page all
// read the same bag.
```

Ce qui a vraiment changé, confirmé dans le fichier :

- `const [items, setItems] = useState(DEMO_ITEMS)` → `const { setQuantity,
  removeLine } = useCart()`, en lisant le store partagé au lieu d'un état de
  démo local.
- Montants `$` en dur → `formatMoney(line.lineTotal)`,
  `formatMoney(subtotal)`, `formatMoney(FREE_SHIPPING_THRESHOLD)`.
- `<img>` → `<Image>` de `next/image` avec un `sizes="64px"` explicite,
  puisque la vignette s'affiche à une taille fixe dans le panneau
  coulissant.

Prends ça comme gabarit du type de changement qu'implique une adaptation
classique. Les détails changent selon le bloc, mais les catégories de
modification — état de démo → catalogue/store, `$` → formatteur, `<img>` →
`next/image`, retrait du mobile — reviennent presque à chaque fois.

## Forme d'un appel de recherche

```
search({ query: "wishlist panel", type: "block", category: "wishlist", surface: "card" })
```

Pas :
```
search({ query: "wishlist" })   // type/category/surface manquants — trop large
```
