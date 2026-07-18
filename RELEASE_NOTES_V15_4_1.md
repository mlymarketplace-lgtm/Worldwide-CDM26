# QualifGaïndé V15.4.1 — Polissage visuel de la home

## Périmètre

Cette release est strictement visuelle. Les scores, les fichiers de données sportives et la logique live à 30 secondes restent inchangés par rapport à la V15.4.0.

## Changements

- Suppression du défilement interne visible dans la fenêtre « Les équipes qui nous ont fait vibrer ».
- Transformation de cette fenêtre en galerie plein écran plus dense :
  - 4 colonnes sur grand écran ;
  - adaptation tablette et mobile ;
  - cartes plus compactes ;
  - bouton de fermeture toujours visible ;
  - drapeaux et pages équipes toujours cliquables.
- Différenciation visuelle des principales portes d’entrée de la home :
  - Finale : or ;
  - petite finale : bronze/cuivre ;
  - Suivi des Gaïndés : émeraude et or ;
  - mémoire des équipes : prune/bordeaux ;
  - Brèves du Mondial : bleu royal ;
  - Brèves des Gaïndés : vert profond, or et touches sénégalaises.
- Renforcement des bordures, halos, ombres et CTA pour rendre les cartes du bas plus visibles sur le fond sombre.
- Rotation des caches PWA et alignement des cache-busters sur V15.4.1.

## Invariants confirmés

- Fonction Netlify `scores.js` inchangée.
- `live.json` inchangé.
- Résultats, matchs et données équipes inchangés.
- Fréquence live et cache API de 30 secondes inchangés.
