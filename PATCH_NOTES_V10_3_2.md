# QualifGaïndé Worldwide — V10.3.2 final light

Objectif : dernière version stable, basée sur V10.3, avec un patch très limité.

## Changements

- Page d'accueil : détection automatique FR/EN/PT/ES uniquement, pas d'arabe automatique sur la home.
- Égypte : arabe conservé via `defaultLang: ar` et via `?team=egypt&lang=ar`.
- PWA : nom affiché = `Suivez la CDM 2026`.
- PWA : icônes remplacées par l'image Coupe + ballon fournie.
- Service worker : version cache `qg-v10-3-2-*` pour forcer le refresh.

## Non modifié

- Moteur bracket / simulation.
- API-Sports / Netlify function.
- Tableaux globaux.
- Données équipes et adversaires.
- Stats JSON.

## Tests rapides

- `/` : home en FR/EN/PT/ES selon navigateur, sans arabe automatique.
- `/?team=egypt` : Égypte en arabe.
- `/?team=egypt&lang=fr` : Égypte en français.
- `/.netlify/functions/scores` : API scores OK.
