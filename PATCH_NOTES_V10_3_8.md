# QualifGaïndé Worldwide — V10.3.8 performance patch

Patch très cadré, sans modification du moteur de simulation ni des données sportives.

## Inclus

1. Réduction des appels `/.netlify/functions/scores`
   - Appels API seulement pendant les fenêtres de match.
   - Maintien du polling pendant un live détecté.
   - Arrêt automatique environ 15 minutes après la fin d’un live.
   - Reprise au prochain créneau live prévu.

2. Langues V10 chargées à la demande
   - Au démarrage, seule la langue active est chargée.
   - Les autres langues sont chargées uniquement quand l’utilisateur clique sur le sélecteur.
   - Arabe Égypte conservé.

3. Images / bannières
   - Les cards équipes conservent le lazy-loading des bannières hors écran.
   - Aucun changement visuel lourd.

4. Cache assets Netlify
   - `/assets/*` passe de 1 jour à 7 jours.
   - `data/*`, `stats.json`, `live.json`, `scores`, `service-worker.js` restent sans cache agressif.

5. Supporters vus
   - Base portée à 15 560 avec variation douce.

## Fichiers modifiés

- index.html
- src/v10/v10-team-app.js
- src/v10/v10-team-app.css
- netlify/functions/scores.js
- service-worker.js
- netlify.toml

## Test conseillé

- /?v=1038
- /?team=senegal&v=1038
- /?team=france&v=1038
- /?team=egypt&v=1038
- /.netlify/functions/scores
