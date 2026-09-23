# Exemples — blocs premium ReUI

Tous les exemples de code restent en anglais, y compris les libellés visibles
(`View bag`, `Shop`, `Open`) : l'interface de la boutique est exclusivement en
anglais.

## Chercher un bloc

```
search({ query: "...", type: "block", category: "...", surface: "card" })
```

Toujours avec `surface` (Card pour APEX ATELIER), sur chaque `search` et
chaque `compose_page`.

## Lire l'API avant d'écrire des props

```
get_component("<name>")   # the actual props
get_examples("<name>")    # the actual composition
```

## Installer

```bash
npx shadcn@latest add @reui/<block-name> --yes
```

Si le CLI répond « not found » — primitive shadcn standard, sans préfixe :

```bash
# Before (fails: not a ReUI item)
npx shadcn@latest add @reui/select --yes

# After
npx shadcn@latest add select
```

## Licence : variable d'environnement, jamais la clé en dur

`.env.local` :

```bash
REUI_LICENSE_KEY=REUI-XXXX-XXXX-XXXX-XXXX
```

`components.json`, qui référence la variable :

```json
{
  "style": "base-nova",
  "registries": {
    "@reui": {
      "url": "https://reui.io/r/{style}/{name}.json",
      "headers": { "Authorization": "Bearer ${REUI_LICENSE_KEY}" }
    }
  }
}
```

## Composition Base UI — `render`, pas `asChild`

Avant (Radix, ignoré ici) :

```tsx
// Wrong — `asChild` is Radix; it is ignored here
<Button asChild><Link href="/cart">View bag</Link></Button>
```

Après (Base UI) :

```tsx
// Correct — Base UI `render` prop
<Button nativeButton={false} render={<Link href="/cart" />}>View bag</Button>
<SheetTrigger render={<Button variant="outline">Open</Button>} />
<BreadcrumbLink render={<Link href="/products" />}>Shop</BreadcrumbLink>
```

## Autres différences Base UI

`Accordion` à ouverture multiple :

```tsx
// Before (Radix shape)
<Accordion type="multiple">

// After (Base UI)
<Accordion multiple defaultValue={["a","b"]}>
```

`SelectValue` qui affiche un libellé plutôt que la valeur brute :

```tsx
// Before — prints the raw value
<SelectValue />

// After — render function
<SelectValue>{(v) => LABELS[v]}</SelectValue>
```

`onCheckedChange` : restreindre à `checked === true` avant de stocker un
booléen, car la valeur peut être indéterminée. `Tooltip` : un seul
`TooltipProvider` dans le layout racine.

## Props réelles, pas devinées

- `Rating` : `rating`, plus `editable` / `showValue` optionnels.
- `Badge` : `variant`, `size`, `radius`.
- `Frame` : composé en `Frame > FramePanel`.

## Tokens de thème

Imports nécessaires dans `globals.css`, avec la table `@theme inline`
complète et les définitions `:root` / `.dark` :

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
```

Puis thémer par tokens :

```tsx
// Before — raw palette classes, break dark mode
<div className="bg-zinc-900 border-zinc-700" />

// After — theme tokens
<div className="bg-card border-border" />
```

## Avant de terminer

```
validate_usage(...)
get_audit_checklist()
```

```bash
npx tsc --noEmit && npm run build
```
