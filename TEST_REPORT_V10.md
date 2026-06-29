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


## V10.2 — contrôles ajoutés

- `stats.json` mis à jour et validé JSON.
- `data/i18n/ar/teams.json`, `stories.json`, `previews.json` créés et validés JSON.
- `egypt.defaultLang = ar` contrôlé.
- Images lourdes converties en WebP et références mises à jour.
- `node --check src/v10/v10-team-app.js` OK.
- `node --check netlify/functions/scores.js` OK.

## Tests navigateur à faire

- `/` : langue détectée selon navigateur ; 10 cartes visibles.
- `/?team=egypt` : ouverture en arabe, bloc Égypte RTL, tableaux globaux non cassés plus bas.
- `/?team=egypt&lang=fr` : rollback visuel immédiat en français.
- `/?team=spain` : ouverture ES non régressée.
- `/?team=brazil` : ouverture PT non régressée.
- `/.netlify/functions/scores` : source API-Sports toujours OK.


## V10.3.1
- Home sans arabe automatique : OK attendu.
- Égypte arabe conservée : OK attendu.
- PWA renommée et icône remplacée : OK attendu.
