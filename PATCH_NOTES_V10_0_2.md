# Patch V10.0.2 — API-Sports + header lisible

## Inclus

- API-Sports / Netlify Function devient la source live appelée à chaque cycle.
- `live.json` reste un fallback de sécurité.
- Suppression des libellés confus de type “API en pause” lorsque l’API répond.
- Le bloc live affiche “API connectée · aucun live” quand il n’y a pas de match en direct.
- Compteur supporters réglé autour de 9 700 avec libellé “supporters ont vu”.
- Polices du header agrandies : bouton Ambiance, langues, compteur supporters.
- Mise à jour de cohérence : Algérie–Autriche aligné à 3–3 selon l’API.

## Non touché

- Moteur bracket / simulation.
- `scores.js` sauf configuration déjà existante côté Netlify.
- `stats.json` reste manuel.
- Tableaux globaux, archive des groupes, meilleurs troisièmes.
