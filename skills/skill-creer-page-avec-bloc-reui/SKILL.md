---
name: skill-creer-page-avec-bloc-reui
description: Procédure pas à pas pour trouver, installer et adapter un bloc premium ReUI (style base-nova / Base UI) pour une surface nouvelle ou modifiée de la boutique — une page, une section, un panneau, un hero, une grille, une barre latérale, un panier ou un écran de checkout. À utiliser dès que l'utilisateur demande de construire une nouvelle page ou section, d'ajouter une surface d'interface, de refaire une partie de la boutique, ou veut un composant qui dépasse la simple retouche de code existant — même s'il ne dit jamais « ReUI », « bloc » ou « shadcn » (ex : « ajoute une page wishlist », « il me faut une section témoignages », « fais un panneau guide des tailles »). Couvre aussi l'adaptation d'un bloc déjà installé depuis components/blocks/ vers components/storefront/. Ne pas utiliser pour modifier des données produit (ça relève de lib/catalog.ts), ni pour une simple retouche de contenu ou de texte sans nouvelle structure d'interface.
---

# Intégration d'un bloc ReUI

Cette boutique est assemblée à partir de blocs premium ReUI, pas de
composants faits main. **Réutiliser, ne pas reconstruire** — avant d'écrire
une nouvelle surface, trouve le bloc qui le fait déjà. Coder à la main une
carte, une sidebar ou un hero que ReUI fournit déjà casse le système visuel
dont dépend ce projet.

**Langue** : ce skill est documenté en français, mais le code, les
commentaires de code et tout texte visible par l'utilisateur restent en
anglais, comme partout ailleurs dans ce dépôt : toute la copy de
l'interface est en anglais. Ne traduis jamais un commentaire d'en-tête de fichier ou une chaîne d'interface
en français.

Lis [reference.md](reference.md) pour la règle de surface, les pièges Base
UI, et les règles de thème/images/frontière qui s'appliquent pendant
l'adaptation. Lis [examples.md](examples.md) pour le tableau des blocs déjà
installés et une adaptation commentée.

## Procédure

1. **Vérifie d'abord ce qui est déjà installé.** Regarde `components/blocks/`
   et le tableau dans `examples.md` — le bloc dont tu as besoin est peut-être
   déjà dans le projet, adapté dans `components/storefront/`. Si oui, pointe
   vers ça plutôt que de recommander une nouvelle installation.
2. **Cherche dans le registre ReUI** pour une nouvelle surface : `search({
   query, type: "block", category })`, toujours avec `surface: "card"` — voir
   `reference.md` pour le pourquoi, et pour la liste des catégories qui
   comptent ici.
3. **Lis la vraie API avant d'écrire la moindre prop** — `get_component` sur
   tout ce que tu comptes utiliser. Ne jamais deviner les props d'un
   composant ReUI à partir de son nom ; les noms de props Base UI ne sont
   souvent pas ceux que l'expérience Radix suggère.
4. **Regarde-le composé** — `get_examples` sur ton candidat retenu.
5. **Installe** : `npx shadcn@latest add @reui/<name> --yes`. Si la CLI dit
   que l'élément est introuvable, c'est probablement une primitive shadcn
   classique — réessaie sans le préfixe `@reui/`.
6. **Adapte une copie dans `components/storefront/`** — ne jamais modifier
   ou importer depuis `components/blocks/`, qui reste intact comme
   référence. Le travail d'adaptation habituel, dans l'ordre :
   - Remplacer les constantes de démo au niveau module par les données de
     `lib/catalog.ts`.
   - Remplacer l'état de démo local `useState` panier/wishlist par
     `useCart()`.
   - Remplacer `<img>` par `next/image` + `sizes`.
   - Retirer les breakpoints mobile (`sm:` / `md:` / `lg:`) — ce projet est
     desktop uniquement.
   - Remplacer le formatage `$` / `en-US` par `formatPrice` / `formatMoney`.
   - Ouvrir le fichier avec un commentaire nommant le bloc source et ce qui
     a changé.
7. **Valide** — `validate_usage` et `get_audit_checklist` avant de
   considérer que c'est fini. Pour une passe plus poussée, délègue à
   l'agent `agent-audit-interface`, ou utilise le skill `skill-verifier-interface`.

Si vraiment rien dans le registre ne convient, dis-le explicitement plutôt
que de bricoler discrètement — nomme les primitives les plus proches à
partir desquelles composer.

Pour le contexte plus large (configuration de la licence, mise en place des
tokens de thème, le piège `lucide-react`), vois le skill
`skill-guide-blocs-reui`. Pour déléguer la recherche elle-même, utilise l'agent
`agent-recherche-bloc-reui` ; `/boutique-sneakers:nouvelle-page` déroule toute cette procédure de bout
en bout pour une nouvelle route.
