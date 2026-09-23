# Exemples — Next.js 16

Le code reste en anglais, comme tout le texte visible de la boutique.

## Params et searchParams asynchrones

Avant (accès synchrone, toléré par le shim de Next 15, cassé en Next 16) :

```tsx
// Wrong on Next 16 — the sync compatibility shim is gone
export default function Page({ params }) {
  const { slug } = params
}
```

Après :

```tsx
// Correct
export default async function Page(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params
  const query = await props.searchParams
}
```

Après avoir ajouté la route, générer le helper `PageProps` :

```bash
npx next typegen
```

## Configuration des images

Avant (`images.domains` supprimé en Next 16) :

```ts
// Wrong — images.domains no longer exists
const nextConfig: NextConfig = {
  images: { domains: ["images.unsplash.com"] },
}
```

Après :

```ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-**" },
    ],
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
  },
}
```

Sans `qualities: [75, 90]`, `quality={90}` serait silencieusement ramené à 75.

## `<img>` vers `next/image`

```tsx
// Before
<img src={src} alt={alt} />

// After — always `sizes`; `fill` needs a positioned parent
<div className="relative">
  <Image src={src} alt={alt} fill sizes="..." />
</div>
```

## Lint

```bash
# Before — removed in Next 16
next lint

# After — run eslint directly (flat config: eslint.config.mjs)
eslint
```

## La frontière serveur/client

Avant — la page plante à l'exécution alors que le build est vert :

```tsx
// ❌ catalog-filters.tsx is "use client"
import { EMPTY_FILTERS } from "@/components/storefront/catalog-filters"
const filters = { ...EMPTY_FILTERS, collections }   // fields are undefined
```

Erreur obtenue :

```
Cannot read properties of undefined (reading 'length')
```

Après — module simple, sûr des deux côtés :

```tsx
// ✅ plain module, safe on both sides
import { EMPTY_FILTERS } from "@/lib/filters"
```

## Tailwind v4

Pas de `tailwind.config.js` ; configuration en CSS :

```css
@import "tailwindcss";
@theme inline { --color-primary: var(--primary); }
```

Et dans `postcss.config.mjs` : `"@tailwindcss/postcss": {}`.

## Le verrou

```bash
npx tsc --noEmit
npm run build
```

Puis `npm run dev` pour regarder la page.
