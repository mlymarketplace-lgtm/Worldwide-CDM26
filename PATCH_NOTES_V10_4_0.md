# V10.4.0 — Build complet stable

Base : V10.3.3 complète + correctifs sûrs V10.3.4 / V10.3.5 / V10.3.7.

## Inclus
- Suppression du double affichage des scores en bas des cards des 16es.
- Winner lock / tirs au but via API-Sports.
- Ambiance France avec le bon lien YouTube, démarrage normal.
- Résultats figés localement via `data/knockout-locks.json` : Canada, Brésil, Paraguay, Maroc.
- Simulation alimentée par les résultats figés au chargement, sans dépendre d'un appel API immédiat.
- Supporters vus : base 15 560.
- `stats.json` mis à jour prudemment : France retirée de la meilleure défense.

## Non inclus volontairement
- Optimisation agressive V10.3.8 de polling `/scores`.
- Chargement différé agressif des langues.

Objectif : revenir à une base complète et stable, puis optimiser plus tard par petits lots.
