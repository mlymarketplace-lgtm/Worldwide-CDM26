# QualifGaïndé V10 — Build de développement

Base : V9.8 stable extraite de `index(15).html`.

## Principe

Cette V10 ajoute une couche multi-équipes sans toucher au moteur sportif existant :

- `scores.js` reste dans `netlify/functions/scores.js` ;
- `live.json` et `stats.json` restent au format V9.8 ;
- le bracket, les groupes, les meilleurs troisièmes et les leaders restent globaux ;
- la personnalisation équipe est isolée dans `src/v10/v10-team-app.js` et `src/v10/v10-team-app.css`.

## URLs de test

```text
/
/?team=senegal
/?team=belgium
/?team=brazil
/?team=algeria
/?team=france
/?team=ivory_coast
/?team=dr_congo
/?team=morocco
/?mode=global
```

## À vérifier visuellement

1. `/` affiche la page de choix “Je suis supporter de…”.
2. `/?team=senegal` garde l’expérience Sénégal et les tableaux globaux.
3. `/?team=brazil` bascule l’identité en Brésil et charge les textes portugais disponibles.
4. Les tableaux globaux restent visibles : 16es, simulation, meilleurs troisièmes, groupes, leaders.
5. Le live garde le fallback `live.json` et la fonction Netlify `scores.js`.


## V10.0.2

Build complet intégrant API-Sports côté front, header agrandi, compteur supporters 9 700, et libellés API clarifiés.
