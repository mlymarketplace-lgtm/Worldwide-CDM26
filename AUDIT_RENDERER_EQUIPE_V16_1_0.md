# QualifGaïndé V16.1.0 — audit et verrouillage du renderer équipe

## Base de départ

Build complet V16.0.1, avec CMS Netlify Blobs fonctionnel.

## Diagnostic confirmé

L’ancienne URL `?mode=global` ne possédait aucun renderer neutre. Elle empêchait la home moderne de prendre la main et révélait le vieux document Sénégal embarqué dans `index.html`, notamment le match Belgique–Sénégal.

Les pages équipe étaient également exposées à plusieurs couches successives : HTML Sénégal historique, scripts inline, `computed-team-state.js`, puis renderer tardif. Cette coexistence créait un risque de réécriture après rendu.

## Mesures appliquées

### Routes

- Nouvelle route fonctionnelle : `?mode=worldcup`.
- L’ancienne route `?mode=global` est conservée uniquement comme alias de compatibilité ; elle rend la même mémoire neutre puis réécrit l’URL vers `mode=worldcup`.
- Tous les liens actifs vers `mode=global` ont été supprimés ou remplacés.
- La pastille « Voir la page globale » n’est plus générée.

### Propriété des pages équipe

La règle V16.1.0 est désormais :

```text
1 route équipe
1 renderer
1 source de données
0 appel public à updateTeamPage()
0 fallback Sénégal
```

- `team-page-v1550.js` et sa feuille de style ont été retirés.
- `team-page-v1610.js` devient l’unique propriétaire des routes `?team=...`.
- `computed-team-state.js` ne modifie plus le DOM des pages équipe.
- La classe précoce `qg-v1610-team-route` masque le document historique avant le rendu, ce qui empêche tout flash Sénégal.
- Le renderer remplace ensuite le corps de page par un DOM neutre.

### Statut du socle historique

Le gros HTML historique Sénégal reste physiquement présent dans `index.html` pour limiter le risque de rupture des anciens scripts encore utiles au live et aux archives. Il est désormais **quarantiné** :

- il n’est plus propriétaire d’aucune route équipe ;
- il n’est plus la destination de la mémoire du Mondial ;
- il est masqué avant le rendu d’une page équipe ;
- aucun script public ne doit réécrire une page équipe après le renderer V16.1.0.

Sa suppression physique complète pourra faire l’objet d’une future refonte du monolithe `index.html`, sans être nécessaire au verrouillage fonctionnel de la V16.1.0.

## Données et composants neutres

Les seize équipes disponibles utilisent le même fichier `data/team-results.json` et les mêmes composants :

- `tableHtml(..., 'group')` ;
- `tableHtml(..., 'knockout')` ;
- `tableHtml(..., 'all')`.

Les tableaux ne contiennent aucun HTML propre au Sénégal. Les traductions FR, EN, ES, PT et AR utilisent le même modèle.

## Critères bloquants validés

- `?mode=worldcup` affiche une mémoire neutre.
- `?mode=global` ne révèle plus le document Belgique–Sénégal.
- chaque page équipe contient exactement trois tableaux ;
- chaque page équipe comporte un retour à la Mémoire du Mondial et un retour à l’accueil ;
- aucune page autre que Sénégal ne contient `Belgique–Sénégal`, `senegal-team` ou un asset Sénégal ;
- `computed-team-state.js` n’appelle plus `updateTeamPage()` dans le pipeline public ;
- ancien renderer V15.5 absent du build.
