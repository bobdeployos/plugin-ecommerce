---
name: blocs-premium-reui
description: Skill de référence (connaissances) sur les blocs premium ReUI dans une boutique ReUI — trouver le bon bloc premium, l'installer depuis le registre, lire sa vraie API et l'adapter sur les vraies données. Couvre aussi les règles de composition Base UI (base-nova) qui diffèrent de Radix, la mise en place de la clé de licence du registre premium, l'amorçage des tokens de thème et le piège `lucide-react`. À utiliser quand on construit ou modifie une surface d'interface de la boutique et qu'on a besoin des règles et des faits sous-jacents (surface Card vs Frame, `render` vs `asChild`, `SelectValue`, `Accordion`, tokens vs classes de palette, licence dans `components.json`), ou quand une installation `shadcn add @reui/...` échoue. Pour le déroulé pas à pas d'une intégration de bloc, utiliser le skill de workflow `integration-bloc-reui`.
group: storefront
icon: layers
---

# Blocs premium ReUI

La règle est **réutiliser, ne pas reconstruire**. Si vous êtes sur le point
d'écrire à la main une carte produit, une barre latérale de filtres ou un
stepper de checkout, arrêtez-vous : le registre en contient déjà un, et une
version faite maison ne s'accordera pas avec le reste de la boutique.

Ce skill rassemble les connaissances ; le déroulé pas à pas d'une intégration
se trouve dans le skill `integration-bloc-reui`. Le code, les commentaires de
code et tout le texte visible par l'utilisateur restent en anglais (l'interface
de la boutique est exclusivement en anglais).

Détails et justification de chaque règle : [reference.md](reference.md).
Exemples avant/après et formes d'appel correctes : [examples.md](examples.md).

## Procédure — l'essentiel

1. **Trouver le bloc** avec `search({ query, type: "block", category, surface })`.
   Les catégories e-commerce utiles sont listées dans `reference.md` ;
   `list_block_categories` donne la liste complète.
2. **Tenir une seule surface.** Frame ou Card, jamais les deux sur un écran.
   APEX ATELIER est en **Card** : passez `surface` à chaque `search` et
   `compose_page`. Les blocs `surface: "none"` conviennent aux deux.
3. **Lire la vraie API avant d'écrire une prop** : `get_component("<name>")`
   puis `get_examples("<name>")`. Ne jamais déduire les props du nom.
4. **Installer** : `npx shadcn@latest add @reui/<block-name> --yes`, avec la
   licence dans `.env.local` (`REUI_LICENSE_KEY`) référencée depuis
   `components.json` — jamais la clé en dur. Si le CLI répond « not found »,
   réessayer sans le préfixe `@reui/`. Installer `lucide-react` une fois.
5. **Composer en Base UI, pas en Radix** : prop `render`, jamais `asChild`.
   Vérifier aussi `Accordion`, `SelectValue`, `onCheckedChange` et
   `TooltipProvider` (voir `reference.md`).
6. **Thémer uniquement par tokens.** Si `bg-card`, `border-border` ou
   `bg-primary` ne rendent rien, les tokens de base manquent dans
   `globals.css`. Jamais de classes de palette brutes (`bg-zinc-900`).
7. **Adapter par réutilisation** : bloc intact dans `components/blocks/`,
   version câblée dans `components/storefront/`, en cinq gestes (données
   réelles, store partagé, `next/image` + `sizes`, suppression des
   breakpoints mobiles, helpers monétaires), plus un commentaire d'en-tête
   nommant le bloc source.
8. **Avant de terminer** : `validate_usage(...)` et `get_audit_checklist()`,
   puis `npx tsc --noEmit && npm run build`.
