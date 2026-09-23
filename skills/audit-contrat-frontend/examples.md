# Exemples avant / après

Corrections illustratives pour les violations les plus courantes, une par
catégorie de `reference.md`.

## Composition Base UI

**Avant** (réflexe Radix, ne fait rien silencieusement) :
```tsx
<Button asChild>
  <Link href="/products">Shop</Link>
</Button>
```

**Après** :
```tsx
<Button nativeButton={false} render={<Link href="/products">Shop</Link>} />
```

## Tokens

**Avant** (classe de palette brute, probablement copiée depuis le bloc
d'origine) :
```tsx
<div className="bg-zinc-900 text-white">
```

**Après** :
```tsx
<div className="bg-primary text-primary-foreground">
```

## Images

**Avant** :
```tsx
<img src={product.gallery[0].src} alt={product.gallery[0].alt} />
```

**Après** :
```tsx
<Image
  src={product.gallery[0].src}
  alt={product.gallery[0].alt}
  fill
  sizes="(min-width: 1024px) 25vw, 50vw"
  className="object-cover"
/>
```

## Données

**Avant** (en dur, diverge du catalogue) :
```tsx
<span>€164</span>
```

**Après** :
```tsx
<span>{formatPrice(product.price)}</span>
```

## État panier

**Avant** (une seconde source de vérité, en désaccord avec la première) :
```tsx
const [items, setItems] = useState(DEMO_CART_ITEMS)
```

**Après** :
```tsx
const { items, setQuantity, removeLine } = useCart()
```

## À quoi ressemble un rapport d'audit propre

```
Aucune violation du contrat sur ce diff.

Vérifiés : components/storefront/wishlist-panel.tsx (nouveau),
app/products/[slug]/page.tsx (changement de prop sur la galerie).

- Composition Base UI : render={} partout, aucun asChild.
- Desktop uniquement : aucun préfixe responsive ajouté.
- Tokens : bg-card / text-muted-foreground uniquement.
- Images : next/image avec sizes sur les deux endroits modifiés.
- Données : lit product.price via formatPrice(), aucune valeur en dur.
```

## À quoi ressemble un rapport avec des findings

```
1. [CASSE LE CONTRAT] components/storefront/wishlist-panel.tsx:42
   asChild utilisé sur <Button> qui enveloppe <Link>. Base UI ignore
   asChild silencieusement — le lien ne s'affiche jamais comme l'élément
   du bouton.
   Correction : <Button nativeButton={false} render={<Link href={href} />}>...

2. [À PEAUFINER] components/storefront/wishlist-panel.tsx:58
   bg-zinc-100 utilisé pour le fond de l'état vide au lieu de bg-muted.
   Pas cassé, mais s'écarte du système de tokens.
```
