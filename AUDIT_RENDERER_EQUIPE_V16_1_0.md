# Mini-audit du renderer équipe — V16.1.0

## Constat
Le build historique contient encore un gabarit Sénégal et plusieurs scripts anciens dans `index.html`. La fuite de contenu provenait du fait que plusieurs couches pouvaient écrire successivement dans la page.

## Verrou retenu
- Les routes `?team=...` sont prises en charge par un seul renderer : `assets/js/team-page-v1550.js`.
- Le renderer remplace intégralement `document.body` par `#qg-v1550-team-root` après le boot des scripts historiques.
- Les données proviennent uniquement de `data/teams.json`, des traductions localisées, `data/team-results.json` et `data/stories.json`.
- Aucun fallback Sénégal n’est autorisé pour une équipe inconnue : affichage « Informations indisponibles ».
- Les trois tableaux utilisent le même composant `tableHtml()` et les données de l’équipe demandée.

## Tests de verrouillage
- 30 combinaisons équipe/langue.
- Espagne, Argentine, Angleterre, France, Sénégal et Maroc.
- Détection de fuite : `senegal-team`, `Belgique–Sénégal`, `Belgique vs Sénégal`, `Mémoire des Gaïndés`.
- Vérification des trois tableaux et de la navigation parent/racine.

## Décision
Le vieux gabarit reste présent comme socle historique pour les routes non-équipe, mais il n’est plus une source de rendu pour les pages équipe. Une refonte ultérieure pourra le supprimer physiquement sans urgence fonctionnelle.
