---
name: audit-contrat-frontend
description: Audite le code frontend modifié dans app/ ou components/ par rapport au contrat vérifié de ce projet avant de considérer un changement d'interface terminé — composition Base UI (render vs asChild), la règle de mise en page desktop uniquement, les tokens de design vs les classes Tailwind de palette brutes, l'usage de next/image, la frontière serveur/client, l'état du panier, et les règles d'hygiène des blocs ReUI. À utiliser après avoir écrit ou modifié un composant, une page, ou un bloc ReUI adapté, dès que l'utilisateur demande de relire, vérifier, auditer, ou « s'assurer que c'est bon » pour du travail d'interface, ou avant de déclarer une tâche frontend terminée — même s'il ne nomme aucune règle précise. Ne pas utiliser pour relire un changement qui touche uniquement les données produit dans lib/catalog.ts sans toucher à un composant, ni pour du code backend/non-UI en dehors de app/ et components/.
---

# Audit du contrat frontend

Avant de considérer un changement frontend terminé, vérifie-le par rapport
au contrat de ce projet. Un `tsc`/`build` vert ne dit rien sur la plupart de
ces règles — ce sont des conventions, pas des erreurs de type, donc rien
d'autre dans la chaîne d'outils ne les fait respecter.

Limite-toi à ce qui a réellement changé : `git diff --name-only`, pas tout
l'arbre. Lis [reference.md](reference.md) pour la checklist complète avec le
raisonnement derrière chaque règle (savoir *pourquoi* une règle existe,
c'est ce qui permet de juger un cas limite qu'elle ne couvre pas
littéralement), et [examples.md](examples.md) pour des corrections
avant/après et à quoi doit ressembler un rapport.

**Langue** : ce skill est documenté en français, mais le code, les
commentaires de code, la copy produit et tout texte visible par
l'utilisateur restent en anglais — toute la copy de l'interface est en
anglais. Ne propose jamais une correction qui traduit une chaîne
d'interface en français.

## Procédure

1. Récupère le périmètre du diff : `git diff --name-only` (ou les fichiers
   qu'on t'a indiqués).
2. Parcours la checklist de `reference.md` sur ces fichiers — pas de
   mémoire, elle contient des détails précis (noms de props exacts, noms de
   classes exacts) qu'il vaut mieux relire à chaque fois plutôt que de
   supposer s'en souvenir correctement.
3. Quand une prop d'un composant ReUI est en question, confirme-la avec la
   vraie API (`get_component`) avant de la déclarer fausse — ne devine
   jamais à partir du nom du composant.
4. Lance toi-même les vérifications mécaniques bon marché plutôt que de
   supposer qu'elles passeraient :
   ```bash
   npx tsc --noEmit
   npm run build
   ```
5. Rapporte les findings du plus grave au moins grave. Pour chacun : le
   fichier et la ligne, quelle règle, la correction concrète. Distingue
   **casse le contrat** (habitudes Radix qui ne font rien silencieusement,
   données en dur, classes de palette brutes, hôte d'image distant non
   déclaré) de **à peaufiner**. Si le diff est propre, dis-le clairement —
   n'invente pas de findings juste pour avoir quelque chose à rapporter.

Pour une deuxième passe indépendante sur un changement gros ou risqué,
délègue à l'agent `agent-audit-interface` plutôt que d'auditer en ligne — il suit
exactement la même checklist dans son propre contexte. `/boutique-sneakers:auditer-ui`
propose le même audit sous forme de commande, avec `--fix` pour appliquer
les corrections.
