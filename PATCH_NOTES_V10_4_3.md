# V10.4.3 — Stats consistency patch

Correctif très léger pour aligner l’affichage “Leaders du tournoi” avec `stats.json`.

## Changements
- `stats.json` conservé avec meilleure attaque à 11 buts : Allemagne, Pays-Bas.
- Fallback HTML mis à jour : 11 au lieu de 10.
- `DEFAULT_TOURNAMENT_STATS` dans `index.html` mis à jour : Allemagne + Pays-Bas seulement.
- France retirée du fallback de meilleure attaque.
- Service worker versionné V10.4.3 pour éviter un vieux cache PWA.

## Fichiers
- index.html
- stats.json
- service-worker.js
