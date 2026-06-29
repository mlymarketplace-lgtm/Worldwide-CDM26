# Test report — QualifGaind_Worldwide_Build V10.1

## Contrôles statiques réalisés

- JSON valides : teams, matches, team-results, stories, previews, opponents, opponent-results, assets-manifest.
- JS V10 valide via `node --check`.
- Netlify Function `scores.js` conservée et vérifiée par syntaxe.
- Sections globales conservées dans `index.html` : meilleurs troisièmes, tableau des 16es, simulation, archive groupes, leaders.

## Points corrigés

- Rebours superposés : ajout d’un verrou `QUALIFGAINDE_V10_COUNTDOWN_LOCKED`.
- Flash Sénégal : ajout d’un boot CSS/JS `v10-booting`.
- Accueil : grille 10 équipes.

## Tests navigateur à faire après upload

- `/` : aucun flash Sénégal, 10 cartes visibles.
- `/?team=spain` : Espagne–Autriche, Rodri, Autriche, scores récents.
- `/?team=egypt` : Australie–Égypte, Salah, Australie, scores récents.
- `/?team=senegal` : non-régression.
- `/?team=brazil` : non-régression.
- `/.netlify/functions/scores` : source `api-football`.
