# V10.3.4 — Hotfix scores 16es

Correction ciblée après V10.3.3.

## Inclus

- Suppression visuelle du score du bas dans les cards des 16es pour éviter le doublon.
- Conservation du score API directement en face de chaque équipe, avant « Choisir ».
- Service worker versionné V10.3.4 pour forcer le refresh cache PWA.

## Non modifié

- API-Sports
- Moteur de simulation
- Données équipes
- Ambiances YouTube
- PWA manifest

## Tests

- /?v=1034
- /?team=brazil&v=1034
- /.netlify/functions/scores
