# QualifGaïndé V15.5.0 — Refonte structurelle des pages équipe

## Correction de fond

Les pages équipe ne sont plus dérivées du gabarit historique Sénégal–Belgique.

- Nouveau gabarit neutre affiché dès l’ouverture d’une route `?team=`.
- Un seul renderer public : `renderTeamPage(teamId, language)`.
- L’ancien DOM est entièrement remplacé sur les pages équipe.
- Le Sénégal est chargé depuis les mêmes fichiers de données que toutes les autres équipes.
- Toute donnée absente produit le message neutre « Informations indisponibles ».
- Aucun fallback vers une photo, un récit ou un match sénégalais.

## Contenu du nouveau renderer

- Header et navigation multilingue.
- Hero et identité visuelle de l’équipe.
- Statut final du tournoi.
- Dernier match.
- Statistiques calculées depuis le parcours.
- Résultats complets.
- Récit et chronologie de l’équipe.
- Responsive mobile, tablette et desktop.

## Non-régression

Tests automatisés sur Espagne, Argentine, Angleterre, France, Sénégal et Maroc, dans les cinq langues FR, EN, ES, PT et AR.

Pour toute équipe autre que le Sénégal, le test échoue si le rendu contient :

- `senegal-team` ;
- `Belgique–Sénégal` ;
- `Belgique vs Sénégal` ;
- un asset sénégalais non prévu.
