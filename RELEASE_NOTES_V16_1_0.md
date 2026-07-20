# QualifGaïndé V16.1.0 — notes de version

## Lot A — home, CMS et navigation

- Nouvelle home post-Mondial : **« Le Mondial est terminé, l’histoire continue »**.
- Quatre blocs principaux :
  1. Revivez la Coupe du monde 2026 ;
  2. Podium · Coupe du monde 2026 ;
  3. Suivi des Gaïndés ;
  4. Brèves des Gaïndés.
- Espagne mise en avant avec Lamine Yamal et la mention **2 étoiles**.
- Podium Espagne, Argentine, Angleterre maintenu directement sur la home.
- Nouveau sous-texte des Brèves des Gaïndés : mercato, buts, forme, blessures et performances en club.
- Libellé éditorial remplacé par **« L’analyse de la rédaction »** dans la console, la prévisualisation et les articles.
- Brèves publiques triées par `publishedAt`, de la plus récente à la plus ancienne.
- Liste admin triée en donnant la priorité à la date de publication.
- Header renforcé : fond distinct, bordure, ombre et fil d’Ariane.
- Bouton de retour aux Brèves plus grand et plus visible.
- Navigation parent/racine ajoutée à la mémoire du Mondial, aux pages équipe, à la finale et au Suivi des Gaïndés.
- Nouvelle route neutre `?mode=worldcup`.
- Ancienne route `?mode=global` redirigée sans afficher la page historique Sénégal.
- Suppression fonctionnelle définitive de « Voir la page globale ».
- Manifest PWA, service worker, redirections et cache-busters mis à jour en V16.1.0.

## Lot B — pages équipe et tableaux

- Nouveau renderer exclusif `assets/js/team-page-v1610.js`.
- Ancien renderer V15.5 retiré.
- Aucun appel public au renderer historique `updateTeamPage()` pour les routes équipe.
- Aucun fallback Sénégal.
- Trois tableaux sur chaque page équipe :
  1. Phase de groupes ;
  2. Phase à élimination directe ;
  3. Tous les scores du parcours.
- Données de parcours complétées pour les seize équipes disponibles.
- Affichage responsive pour ordinateur et mobile.
- Pages équipe disponibles en français, anglais, espagnol, portugais et arabe.

## CMS

Le stockage demeure dans Netlify Blobs. Un nouveau déploiement ne remplace pas les brèves dynamiques déjà publiées.

## Compatibilité

Les anciens liens directs vers les pays restent pris en charge. Les paramètres de version ont été alignés sur `v=1610`.
