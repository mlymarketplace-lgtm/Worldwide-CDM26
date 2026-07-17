# QualifGaïndé / Mondial Pulse — V15.2.0

## Petite finale France–Angleterre

- Nouvelle carte compacte sur la home, sous la grande affiche de la Finale.
- Affiche confirmée : France–Angleterre, match pour la troisième place.
- Compte à rebours, bascule live et score dynamique.
- Accès direct aux pages France et Angleterre.
- Nouvelle Brève longue : « France–Angleterre : le Channel n’a jamais séparé autant de stars ».
- Visuel éditorial dédié à la petite finale.

## Podium bronze automatique

Après le coup de sifflet final du match N103, la carte de la petite finale est automatiquement remplacée par un podium premium :

- équipe classée troisième ;
- médaille de bronze ;
- score final ;
- accès à la page de l’équipe médaillée et au parcours du quatrième.

Aucun faux résultat n’est embarqué dans le build livré.

## Deux familles de Brèves

La grande entrée unique a été remplacée par deux cartes compactes :

- « Les Brèves du Mondial » ;
- « Les Brèves des Gaïndés ».

Chaque entrée ouvre désormais son propre flux éditorial. Le hub conserve un sélecteur permettant de passer d’un univers à l’autre.

## Nouvelles Brèves

### Les Brèves des Gaïndés

- Ibrahima Mbaye attire les grands d’Europe.
- Galatasaray avance sur Assane Diao.
- Yoro Mangara réclame la dissolution de la FSF.

### Les Brèves du Mondial

- France–Angleterre : le Channel n’a jamais séparé autant de stars.
- Messi pulvérise le Mondial : 21 buts, 12 passes et une collection de records.

Les six visuels transmis par l’utilisateur sont intégrés et associés à leur contenu.

## Technique

- Version et cache-busters alignés sur V15.2.0 / `v=1520`.
- Service worker : nouveaux caches `qualifgainde-v15-2-0-v1520` et `qg-v15-2-0-runtime`.
- HTML initial de la home synchronisé avec le renderer JS afin d’éviter un saut visuel au chargement.
- Aucune nouvelle règle de redirection Sports Mangara.
