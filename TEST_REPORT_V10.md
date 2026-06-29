# Rapport de tests — QualifGaïndé V10 dev build

## Tests automatiques réalisés

- Extraction du vrai `index.html` depuis le fichier GitHub exporté : OK.
- Vérification que le `index.html` final n'est plus une page GitHub wrapper : OK.
- Validation JSON : `data/*.json`, `data/i18n/pt/*.json`, `live.json`, `stats.json` : OK.
- Vérification syntaxe JavaScript : `src/v10/v10-team-app.js` : OK.
- Vérification syntaxe JavaScript : `netlify/functions/scores.js` : OK.
- Vérification assets : toutes les références locales `assets/...` existent : OK.
- Vérification `nextMatchId` : les 8 équipes pilotes pointent vers un match existant : OK.
- Vérification de prudence : `scores.js`, `live.json`, `stats.json` copiés sans modification fonctionnelle : OK.

## Ce qui a été ajouté

- Page d'entrée `Je suis supporter de…` quand l'URL ne contient pas `?team=`.
- Routing par équipe : `?team=senegal`, `?team=brazil`, etc.
- Couleurs dynamiques via variables CSS.
- Header dynamique : équipe, slogan, ambiance.
- Hero dynamique : banner + titre équipe.
- 3 derniers matchs dynamiques depuis `team-results.json`.
- Prochain match dynamique depuis `matches.json`.
- Compte à rebours dynamique selon `nextMatchId`.
- Teaser dynamique depuis `previews.json`.
- Épopée dynamique depuis `stories.json`.
- Traduction portugaise disponible pour Brésil : `data/i18n/pt/`.
- Bouton flottant `Changer d’équipe`.

## Points à vérifier manuellement après mise en ligne Netlify

1. `/` affiche bien la page d'entrée avec les 8 cartes équipes.
2. `/?team=senegal` conserve l'expérience Sénégal et tous les tableaux globaux.
3. `/?team=brazil` affiche bien l'univers Brésil, le portugais, Brésil–Japon et les couleurs vert/jaune/bleu.
4. `/?team=belgium` affiche bien Belgique, Kevin De Bruyne, Belgique–Sénégal et les couleurs belges.
5. `/?team=morocco`, `/?team=dr_congo`, `/?team=ivory_coast`, `/?team=algeria`, `/?team=france` chargent sans image cassée.
6. Le tableau officiel des 16es, la simulation, les meilleurs troisièmes, les groupes et les leaders restent visibles.
7. Le score live ne régresse pas : `live.json` fonctionne en fallback et la fonction `/.netlify/functions/scores` répond quand l'API est configurée.

## Limite assumée

Cette V10 ne transforme pas encore le moteur sportif interne. Elle ajoute une couche UX/data-driven autour de la V9.8 stable, conformément à la stratégie prudente.

## Addendum V10.0.1

Contrôles réalisés :

- JSON valides : `opponents.json`, `opponent-results.json`, `teams.json`, `matches.json`, `team-results.json`.
- Syntaxe JS valide : `src/v10/v10-team-app.js`.
- Assets adversaires présents pour Japon, Suisse, Suède, Norvège, Angleterre, Pays-Bas.
- Le patch reste isolé dans la couche V10.
- Aucun changement sur `scores.js`, `live.json`, `stats.json`.

Tests fonctionnels à faire après upload :

- `/` : la page de choix des 8 équipes reste affichée.
- `/?team=brazil` : card Japon remplie + message countdown fixe.
- `/?team=algeria` : card Suisse remplie.
- `/?team=france` : card Suède remplie.
- `/?team=ivory_coast` : card Norvège remplie.
- `/?team=dr_congo` : card Angleterre remplie.
- `/?team=morocco` : card Pays-Bas remplie.
- Vérifier que les tableaux globaux restent visibles en bas de page.
