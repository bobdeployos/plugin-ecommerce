# Boutique Sneakers — boîte à outils

Un plugin Claude Code qui rassemble tout ce qu'il faut pour travailler sur la
boutique de sneakers APEX ATELIER — une boutique Next.js 16 desktop uniquement,
construite à partir de blocs premium ReUI sur le style shadcn `base-nova`
(Base UI).

Il réunit les cinq types de composants de plugin : **skills**, **agents**,
**commandes**, **hooks** et **scripts**.

> La documentation du plugin est en français. Le code, les commentaires de
> code et tout le texte visible dans la boutique (UI, fiches produit) restent
> en **anglais** — les skills et les agents le rappellent à chaque fois.

## Installation

```
/plugin marketplace add bobdeployos/plugin-ecommerce
/plugin install boutique-sneakers@boutique-sneakers-marketplace
```

Pour le développement local, pointe la marketplace vers une copie locale :
`/plugin marketplace add ./chemin/vers/le/plugin`.

## Contenu

### Skills — le savoir-faire

Chargés automatiquement quand le travail correspond. Chaque skill suit la même
structure :

- `SKILL.md` — quand l'utiliser et la procédure à suivre ;
- `reference.md` — les règles détaillées, avec le pourquoi de chacune ;
- `examples.md` — des exemples concrets, avant / après.

Quatre sont des skills de **référence** (ce qui est vrai sur la stack) ; trois
sont des skills de **procédure** (la marche à suivre pour une tâche).

| Skill | Type | Couvre |
| --- | --- | --- |
| `skill-guide-blocs-reui` | référence | Trouver, installer et adapter les blocs premium ; le piège Base UI vs Radix ; la licence ; le thème |
| `skill-regles-nextjs-16` | référence | Les changements cassants de Next 16 qui font vraiment mal — `params` asynchrones, config des images, disparition de `next lint`, et le bug de frontière RSC |
| `skill-architecture-boutique` | référence | Où vit chaque chose, le shell desktop uniquement, l'état du panier, le calcul des totaux |
| `skill-regles-catalogue-produits` | référence | Le contrat `Product`, le ton éditorial, et comment vérifier qu'une photo répond |
| `skill-creer-page-avec-bloc-reui` | procédure | Construire une page, une section ou un panneau à partir du bon bloc — recherche, vraie API, installation, adaptation dans `components/storefront/`, validation |
| `skill-verifier-interface` | procédure | Auditer un diff d'interface par rapport au contrat avant de le déclarer terminé, avec un rapport classé par gravité |
| `skill-ajouter-fiche-produit` | procédure | Rédiger ou réviser une fiche produit champ par champ, dans le ton, chaque photo vérifiée par `scripts/verifier_photo.sh` |

Les agents préchargent le skill de procédure correspondant : `agent-recherche-bloc-reui` →
`skill-creer-page-avec-bloc-reui`, `agent-audit-interface` → `skill-verifier-interface`,
`agent-redaction-fiches-produits` → `skill-ajouter-fiche-produit`.

### Agents — les spécialistes

| Agent | À utiliser pour |
| --- | --- |
| `agent-recherche-bloc-reui` | Décider à partir de quel bloc ReUI construire une nouvelle surface. Rapporte une recommandation et la vraie API ; n'écrit pas de code applicatif |
| `agent-audit-interface` | Auditer un diff par rapport au contrat frontend — composition, mise en page, tokens, images, discipline des données |
| `agent-redaction-fiches-produits` | Ajouter ou réécrire des produits, dans le ton, chaque photo vérifiée |
| `agent-audit-panier-paiement` | Parcourir tout le tunnel d'achat à la recherche de montants et de compteurs qui divergent en silence |

### Commandes

| Commande | Rôle |
| --- | --- |
| `/boutique-sneakers:etat` | Inventaire + scan du contrat : routes, blocs, catalogue, violations |
| `/boutique-sneakers:auditer-ui` | Audite le code frontend modifié ; `--fix` applique les corrections |
| `/boutique-sneakers:nouvelle-page` | Ajoute une route, construite à partir du bon bloc plutôt que faite main |
| `/boutique-sneakers:produit` | Ajoute ou révise un produit du catalogue, photos vérifiées |

### Hooks — les garde-fous

**`PostToolUse`** sur `Write|Edit` lance `hook-garde-boutique.mjs` sur le
fichier qui vient d'être écrit. Il existe parce que toutes les erreurs qu'il
attrape **passent le typecheck et le build** — rien d'autre ne les trouvera :

- `asChild` dans un projet Base UI (ne fait rien, en silence)
- `<img>` brut au lieu de `next/image`
- import depuis `components/blocks/`, la copie de référence intacte
- préfixes responsive dans une mise en page desktop uniquement
- classes de palette Tailwind brutes au lieu des tokens du thème
- prix en dur et `toFixed(2)` au lieu des helpers de formatage
- `props.params` / `props.searchParams` lus sans `await`

Il signale au lieu de bloquer, pour que le modèle puisse se corriger dans le
même tour.

**`SessionStart`** lance `hook-brief-session.mjs`, qui rappelle d'emblée les
deux faits faciles à rater — c'est du Base UI, et c'est du Next 16 — et
prévient si `REUI_LICENSE_KEY` est absente. Il reste silencieux en dehors d'un
projet compatible.

### Scripts

Utilisables seuls depuis la racine du projet boutique :

```bash
node scripts/etat-boutique.mjs            # inventaire + scan du contrat
node scripts/etat-boutique.mjs --verbose
node scripts/etat-boutique.mjs --violations-only
node scripts/verifier-photos.mjs                # vérifie que chaque photo du catalogue répond
```

Les deux sortent avec un code non nul en cas d'échec, donc ils fonctionnent en
CI comme en conversation.

## Arborescence

```
.claude-plugin/
  plugin.json          manifeste
  marketplace.json     entrée de marketplace
agents/                4 définitions de sous-agents
commands/              4 commandes slash
skills/<nom>/          7 skills (SKILL.md, reference.md, examples.md, et scripts/ au besoin)
hooks/hooks.json       PostToolUse + SessionStart
scripts/               scripts des hooks et utilitaires (Node, sans dépendance)
```

`${CLAUDE_PLUGIN_ROOT}` pointe vers le dossier d'installation du plugin, et
`${CLAUDE_SKILL_DIR}` vers le dossier du skill courant : c'est ainsi que les
commandes, les hooks et les skills trouvent leurs scripts, où que le plugin
soit installé.

## Prérequis

- Node 18+ (les scripts utilisent le `fetch` global)
- `bash` et `curl` pour `verifier_photo.sh` (Git Bash suffit sous Windows)
- Un projet boutique dont `components.json` déclare un registre `@reui` et
  qui a `next` dans ses dépendances — le hook de session vérifie les deux
  avant de dire quoi que ce soit.

## Licence

MIT.
