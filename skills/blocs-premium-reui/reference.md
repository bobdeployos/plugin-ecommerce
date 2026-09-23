# Référence — blocs premium ReUI

## Réutiliser, ne pas reconstruire

La boutique est assemblée à partir de blocs premium. Une carte produit, une
barre latérale de filtres ou un stepper de checkout écrits à la main ne
reprendront jamais exactement les espacements, les tokens et la composition
des blocs voisins : l'écran finit par ressembler à deux systèmes de design
juxtaposés. Le registre en propose déjà un ; cherchez-le d'abord.

## Trouver le bloc

Forme d'appel : `search({ query: "...", type: "block", category: "...", surface: "card" })`.

Catégories e-commerce à connaître :

| Catégorie | Nombre | Usage |
| --- | --- | --- |
| `shop-hero` | 8 | Heroes de page d'accueil de la boutique |
| `product-grid` | 6 | Grilles de collection et de catalogue |
| `product-card` | 10 | Une vignette produit seule |
| `product-detail` | 6 | Fiche produit complète (PDP) |
| `filter-sidebar` | 7 | Affinage par facettes |
| `shopping-cart` | 7 | Page panier, mini-panier, panier rapide |
| `checkout` | 7 | Checkout multi-étapes et express |
| `review`, `wishlist`, `coupon`, `receipt`, `comparison`, `category-card` | 6 chacune | Surfaces secondaires |

Si aucune ne convient, `list_block_categories` donne la liste complète.

## Tenir une seule surface

Les blocs s'affichent soit sur une **ReUI Frame**, soit sur une **shadcn
Card**. Choisissez-en une pour tout le projet et ne les mélangez jamais sur un
même écran : le résultat se lit comme deux systèmes de design boulonnés
ensemble. Passez `surface` à chaque `search` et chaque `compose_page`, pour
que le registre ne vous propose que des blocs compatibles. Les blocs signalés
`surface: "none"` (heroes, barres de navigation, états vides) conviennent aux
deux modes, car ils ne portent pas de surface propre.

La boutique APEX ATELIER est en **Card**.

## Lire la vraie API avant d'écrire des props

`get_component("<name>")` donne les props réelles ; `get_examples("<name>")`
montre la composition réelle.

Ne déduisez jamais les props d'un composant ReUI à partir de son nom. Faits
confirmés :

- `Rating` prend `rating`, plus `editable` et `showValue` optionnels.
- `Badge` prend `variant`, `size`, `radius`.
- `Frame` se compose en `Frame > FramePanel`.

Pourquoi c'est critique : deviner produit du code qui passe le typecheck et
s'affiche de travers — l'erreur ne se voit qu'à l'écran.

## Installation et licence

Commande : `npx shadcn@latest add @reui/<block-name> --yes`.

Le registre premium exige une licence. Elle vit dans `.env.local` (gitignoré)
sous `REUI_LICENSE_KEY`, et `components.json` la référence via
`${REUI_LICENSE_KEY}` dans `registries["@reui"].headers.Authorization`
(`Bearer ...`), avec `"style": "base-nova"` et l'URL
`https://reui.io/r/{style}/{name}.json`. Le CLI expand la variable au moment
de l'installation : la clé n'apparaît donc jamais dans un fichier versionné.
Ne l'écrivez jamais en dur dans `components.json`.

Deux pièges d'installation :

- **« not found » sur `shadcn add @reui/x`** : `x` est probablement une
  primitive shadcn standard et non un composant ReUI. Réessayez sans le
  préfixe (`npx shadcn@latest add select`).
- **`lucide-react` n'est pas installé automatiquement**, alors que tous les
  blocs l'importent. Installez-le une fois, sinon le premier typecheck échoue
  sur chaque fichier.

## base-nova, c'est Base UI, pas Radix

C'est la première source de casse silencieuse : rien ne plante, le composant
fait simplement autre chose que prévu.

- La composition d'un élément personnalisé passe par la prop **`render`**.
  `asChild` est une convention Radix ; ici elle est ignorée.
- Un `Button` rendu en lien prend `nativeButton={false}` en plus de `render`.
- `Accordion` à ouverture multiple : `multiple` + `defaultValue={[...]}`, pas
  `type="multiple"`.
- `<SelectValue>` affiche la **valeur brute**. Pour afficher un libellé,
  passez une fonction de rendu en enfant.
- `onCheckedChange` peut transmettre une valeur indéterminée : restreignez
  avec `checked === true` avant de stocker un booléen.
- `Tooltip` exige un `TooltipProvider` quelque part au-dessus ; placez-le une
  seule fois dans le layout racine.

## Tokens de thème, pas classes de palette

Une installation fraîche d'un bloc ReUI peut ne fusionner que les tokens
*supplémentaires* de ReUI (`success`, `warning`, `info`, `invert`) sans le jeu
de base shadcn. Symptôme : `bg-card`, `border-border` ou `bg-primary` ne
rendent rien. Cause : les tokens de base manquent dans `globals.css`. Il faut
la table `@theme inline` complète, les définitions `:root` / `.dark`, et les
imports `tailwindcss`, `tw-animate-css` et `shadcn/tailwind.css`.

Une fois en place, thémez **uniquement** par tokens. Les classes de palette
brutes (`bg-zinc-900`, `text-slate-500`) cassent le mode sombre et
s'éloignent visuellement des blocs, qui eux utilisent les tokens.

## Adapter par réutilisation

Les blocs installés restent intacts dans `components/blocks/`, comme
référence ; les versions câblées vivent dans `components/storefront/`. Rien
dans l'application ne doit importer depuis `components/blocks/`. Ainsi, on
peut toujours comparer une version adaptée au bloc d'origine.

L'adaptation se résume presque toujours aux mêmes cinq gestes :

1. Remplacer les constantes de démo au niveau module par des props ou le vrai
   catalogue.
2. Remplacer l'état local `useState` du panier/de la wishlist par le store
   partagé.
3. Remplacer `<img>` par `next/image` + `sizes`.
4. Supprimer les breakpoints mobiles si le projet est desktop uniquement.
5. Remplacer le formatage `$` / `en-US` par les helpers monétaires du projet.

Ouvrez chaque fichier adapté par un commentaire nommant son bloc source et ce
qui a changé : c'est ainsi que la personne suivante retrouve l'original.

## Avant de terminer

Lancez `validate_usage(...)` et `get_audit_checklist()`, puis
`npx tsc --noEmit && npm run build`.
