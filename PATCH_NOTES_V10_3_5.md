# QualifGaïndé Worldwide — V10.3.5

Patch très cadré : tirs au but, verrouillage des 16es terminés, et titres d'ambiances.

## Corrections

- API-Sports enrichie via `netlify/functions/scores.js` : expose désormais `penalty`, `winner`, `winnerSide`, `locked` et `resolvedBy`.
- Le tableau des 16es détermine le vrai vainqueur d'un match terminé :
  1. `teams.home/away.winner` API si disponible,
  2. tirs au but si score nul,
  3. score terrain si vainqueur direct.
- Les matchs terminés sont figés dans la simulation : plus de choix manuel sur le match officiel finalisé.
- Le vainqueur officiel alimente automatiquement le tour suivant.
- Affichage TAB dans le statut de la card : exemple `Terminé · TAB 3–4 · PEN`.
- La card compte à rebours affiche aussi le contexte TAB si le match de l'équipe choisie se termine aux penalties.

## Ambiances

- France : `I Will Survive — Hermes House Band` (`gA0rnR4NOtQ`)
- Espagne : `Campeones, campeones, oé oé oé` (`igWX__Noxm8`, démarrage 7s)

## Non modifié

- Moteur principal de groupes
- Données équipes / stories / previews
- Stats tournoi
- Design général
