# Patch V10.1 — QualifGaind_Worldwide_Build

## Objectif
Build complet Worldwide avec deux nouvelles équipes d’entrée et correction UX critique.

## Changements intégrés

1. Correction des rebours superposés : verrouillage du countdown legacy V9.8 quand la couche V10 est active.
2. Correction du flash ancienne app Sénégal au chargement : boot anti-flash avant rendu V10.
3. Ajout Espagne comme équipe d’entrée.
4. Ajout Égypte comme équipe d’entrée.
5. Ajout Autriche et Australie comme adversaires enrichis.
6. Ajout textes éditoriaux Espagne, Égypte, Espagne–Autriche, Australie–Égypte.
7. Confirmation Algérie–Autriche à 3–3 dans team-results.
8. Conservation de l’endpoint API-Sports Netlify sans modification de scores.js.
9. Tableaux globaux, bracket, archive groupes, meilleurs troisièmes et leaders conservés.

## Tests recommandés après déploiement

- `/` : accueil avec 10 équipes, aucun flash Sénégal.
- `/?team=spain` : card Espagne, adversaire Autriche, rebours propre.
- `/?team=egypt` : card Égypte, adversaire Australie, rebours propre.
- `/?team=senegal` et `/?team=brazil` : non-régression.
- `/.netlify/functions/scores` : API-Sports en JSON.
