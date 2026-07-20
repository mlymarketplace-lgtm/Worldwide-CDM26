# Suivi des Lions — V16.1.1

Date : 20 juillet 2026

## Objet de la version

V16.1.1 corrige le blocage de la route « Mémoire de la Coupe du monde » observé en V16.1.0. Le contenu n’était pas perdu : l’ancien sélecteur V10 reprenait encore la propriété de l’écran sur certaines routes sans paramètre `team`.

## Correction structurante du routage

Un routeur explicite est désormais exécuté dans le `<head>` avant tout rendu. Il classe chaque URL dans une seule route :

- `home`
- `worldcup`
- `news`
- `gaindes`
- `final`
- `team`

Les routes hors équipes sont rendues exclusivement dans `#qg-app-root`. L’ancien conteneur `#v10-team-selector` est placé en quarantaine et masqué. Il ne peut plus afficher ou restaurer la page historique Belgique–Sénégal derrière la Mémoire du Mondial.

La route historique `?mode=global` reste acceptée comme alias de compatibilité, mais elle est rendue par le même moteur neutre que `?mode=worldcup`.

## Mémoire du Mondial

La page affiche de nouveau :

- le hero Espagne championne du monde et sa deuxième étoile ;
- le podium Espagne, Argentine, Angleterre ;
- 16 cartes équipes ;
- les liens vers les pages équipe ;
- les trois tableaux de parcours sur chaque page équipe.

Les libellés des cartes utilisent désormais en priorité le dernier résultat du parcours, afin d’éviter des statuts devenus obsolètes comme « qualifiée en quart » après la fin du tournoi.

## Nouvelle identité éditoriale

Le wording visible ne présente plus l’application sous le nom QualifGaïndé.

La home affiche :

> Votre App’ « Suivi des Lions » reste au cœur du jeu

Les headers communs, la PWA, les pages équipe et les retours de navigation utilisent désormais le nom « Suivi des Lions ».

## Carte Brèves des Gaïndés

- titre réduit pour retrouver les proportions de la version précédente ;
- étiquette et textes remis en blanc sur le fond sombre ;
- suppression de la teinte violette perçue ;
- contenu et tri du plus récent au plus ancien conservés.

## CMS

Le CMS V16.0.1 est conservé sans migration des données. Les articles stockés dans Netlify Blobs ne sont pas intégrés au ZIP et ne sont pas écrasés par ce déploiement.

## Cache et PWA

- cache Service Worker monté en `suivi-lions-v16-1-1` ;
- assets V16.1.1 appelés avec le token `1611` ;
- manifest renommé « Suivi des Lions ».
