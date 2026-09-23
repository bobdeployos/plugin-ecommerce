---
description: Audite le code frontend modifié par rapport au contrat de la boutique (composition Base UI, mise en page desktop uniquement, tokens, next/image, discipline du catalogue)
argument-hint: "[chemin ou glob] [--fix]"
allowed-tools: Bash(git:*), Bash(node:*), Bash(npx:*), Bash(npm:*)
---

Audite le frontend par rapport au contrat de ce projet.

Détermine d'abord le périmètre :

- Sans argument, audite ce qui a changé : `git diff --name-only HEAD` filtré sur
  `app/` et `components/`. Si l'arborescence est propre, audite le dernier commit.
- Avec un chemin ou un glob, audite exactement celui-ci.

Lance ensuite l'agent **agent-audit-interface** sur ce périmètre. Il connaît la
checklist ; ne la redéroule pas toi-même.

En parallèle de l'agent, lance le scan statique pour les violations mécaniques :

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/etat-boutique.mjs" --violations-only
```

Enfin, vérifie :

```
npx tsc --noEmit && npm run build
```

Rapport :

- Commence par le verdict — propre, ou N constats qui cassent le contrat.
- Regroupe les constats par gravité, pas par fichier. Une valeur exportée
  depuis un module `"use client"` vers un Server Component passe avant un
  `sizes` manquant.
- Si `--fix` a été passé, applique les correctifs, puis relance le scan et le
  build et rapporte ce qui a changé. Sans `--fix`, rapporte uniquement.
- N'invente pas de constats. Un diff propre est un résultat valide.
