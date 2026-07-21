# Suivi des Lions — V16.1.2

## Objet de la version

La V16.1.2 restaure sur **chaque page pays** les trois archives mondiales figées demandées, sans réintroduire l'ancien moteur de simulation.

## Ordre définitif d'une page pays

1. Présentation du pays
2. Bilan et parcours du pays
3. Ses résultats
4. Récit du pays
5. Classement final des 12 groupes
6. Classement final des 8 meilleurs troisièmes
7. Tableau final de la Coupe du monde 2026
8. Navigation de retour

## Nouveautés

- ajout de `data/world-cup-archive.json`, source unique et figée des résultats globaux ;
- affichage identique des trois tableaux mondiaux sur les 16 pages pays ;
- 12 classements de groupes définitifs ;
- classement définitif des 8 meilleurs troisièmes qualifiés ;
- tableau final complet de 32 matchs, des seizièmes à la finale ;
- finale figée : Espagne 1–0 Argentine ;
- championne : Espagne ; vice-championne : Argentine ; troisième : Angleterre ;
- lecture seule : aucun score modifiable, aucun choix de vainqueur et aucun calcul dynamique ;
- suppression du vocabulaire « simulation » dans le renderer actif des pages pays ;
- titres et libellés adaptés aux cinq langues de l'application.

## Architecture

Les trois archives sont générées par un seul composant partagé depuis une source unique. Elles ne sont pas copiées manuellement dans chaque page : le renderer les reproduit à l'identique pour chaque pays.

Le renderer actif devient :

```text
assets/js/team-page-v1612.js
```

Les styles associés sont dans :

```text
assets/css/team-page-v1612.css
```

## Compatibilité

La home, la Mémoire du Mondial, le CMS, les Brèves et le contrôle du Suivi des Gaïndés restent inchangés fonctionnellement. Les articles conservés dans Netlify Blobs ne sont pas affectés par le déploiement.
