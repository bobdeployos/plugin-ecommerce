---
name: fiche-produit-catalogue
description: Rédige ou révise une fiche produit dans lib/catalog.ts pour la boutique — le slug, la tagline, le story en deux paragraphes, les quatre highlights, les 2-3 coloris avec chacun sa photo Unsplash vérifiée, le size run, les trois groupes de specs, et les avis. À utiliser dès que l'utilisateur veut ajouter une nouvelle sneaker/paire/silhouette au catalogue, réapprovisionner ou retirer un produit, changer un prix ou un badge de promo, réécrire une tagline/un story/des highlights/des specs, ou ajouter/modifier des avis clients — même s'il dit juste « ajoute cette paire au site » ou colle un brief produit sans jamais nommer lib/catalog.ts. À utiliser aussi pour relire une fiche existante et vérifier le ton ou des champs manquants. Ne pas utiliser pour un changement de composant ou de mise en page dans l'affichage des produits, ni pour choisir quel bloc ReUI affiche une surface produit.
---

# Fiche produit catalogue

`lib/catalog.ts` est la source de vérité unique pour toutes les surfaces
produit de cette boutique — la grille d'accueil, la page catalogue, la PDP,
le panier et le checkout lisent tous `PRODUCTS`. Un composant ne doit jamais
contenir un prix, un nom, une URL d'image ou une taille en dur : si tu es sur
le point de taper `€164` dans du JSX, cette valeur doit plutôt aller ici.

**Langue** : ce skill est documenté en français, mais le texte qu'il produit
— `tagline`, `story`, `highlights`, `alt` — reste entièrement en **anglais**,
comme tout le texte visible par l'utilisateur dans cette boutique : toute
la copy de l'interface est en anglais. Ne traduis jamais la copy produit en
français, même si la conversation se déroule en français.

Lis [reference.md](reference.md) pour le contrat complet champ par champ et
les règles de ton éditorial avant d'écrire le texte. Lis
[examples.md](examples.md) pour une fiche produit validée à prendre comme
repère — copie sa *forme*, jamais son *contenu*.

## Procédure

1. **Lis deux ou trois produits existants dans `PRODUCTS`** (dans
   `lib/catalog.ts`) d'abord, pour caler le ton et la complétude avant
   d'écrire le tien.
2. **Remplis chaque champ** — `reference.md` liste ce qui est obligatoire.
   Une fiche à moitié remplie casse des surfaces entières : une photo de
   coloris manquante, un groupe de specs vide.
3. **Écris le texte** dans le ton maison : concret, précis, un compromis
   honnête assumé dans le story. Voir « Ton éditorial » dans `reference.md`
   — c'est court, à lire plutôt qu'à deviner.
4. **Source et vérifie chaque photo avant de l'écrire dans le fichier.** Ne
   jamais écrire un ID Unsplash que tu n'as pas vérifié. Lance :
   ```bash
   bash "${CLAUDE_SKILL_DIR}/scripts/verifier_photo.sh" <photo-id>
   ```
   Il doit afficher `200 image/jpeg`. Tout le reste — y compris un résultat
   `plus.unsplash.com/premium_photo-*` — est disqualifié ; trouve un autre
   candidat. C'est la façon la plus courante dont ce catalogue casse en
   production, parce qu'un mauvais ID passe quand même le typecheck et le
   build.
5. **Utilise les helpers, jamais de valeurs brutes** : `photo(id, {w,h,q})`
   pour chaque image, `sizeRun()` pour les tailles, `formatPrice`/
   `formatMoney` pour l'argent partout ailleurs dans l'app.
6. **Si tu renseignes `compareAtPrice`**, ajoute un `badge` dont le libellé
   correspond à ce que `discountPercent()` calculerait — n'écris jamais un
   pourcentage à la main qui pourrait diverger des prix.
7. **Les avis** vont dans `REVIEWS_BY_SLUG` ; chacun nomme une taille, un
   coloris et un détail concret. Ne touche pas à `getReviewBreakdown()` —
   elle dérive l'histogramme depuis `rating` + `reviewCount` automatiquement.
8. **Termine par** :
   ```bash
   npx tsc --noEmit && npm run build
   ```
   Puis indique quels IDs de photo tu as vérifiés et ce que tu as changé.
   Pour revérifier d'un coup toutes les photos déjà présentes dans le
   catalogue, lance `node "${CLAUDE_PLUGIN_ROOT}/scripts/verifier-photos.mjs"`
   depuis la racine du projet.

Pour un ajout qui demande beaucoup de recherche — sourcer la photographie
depuis rien pour un produit entièrement nouveau à partir d'un brief d'une
ligne — envisage de déléguer à l'agent `agent-redaction-fiches-produits` pour que le travail
se fasse dans son propre contexte. Il suit la même procédure.
`/boutique-sneakers:produit` le lance sous forme de commande.
