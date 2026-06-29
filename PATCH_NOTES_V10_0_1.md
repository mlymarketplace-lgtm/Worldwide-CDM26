# QualifGaïndé Worldwide — Patch V10.0.1

## Objectif

Stabilisation UX sans toucher au moteur V9.8 : aucun changement sur `scores.js`, `live.json`, `stats.json`, la simulation, le bracket, le classement des meilleurs troisièmes ni l'archive des groupes.

## Corrections incluses

1. **Compte à rebours stabilisé**
   - Suppression du message mouvant type « Les secondes défilent... ».
   - Nouveau message fixe : « Prochain rendez-vous mondial. »
   - Version Brésil/PT : « Próximo compromisso mundial. »

2. **Cards adversaires enrichies**
   - Ajout de `data/opponents.json`.
   - Ajout de `data/opponent-results.json`.
   - Ajout des photos joueurs adverses dans `assets/opponents/`.

3. **Adversaires couverts**
   - Japon — Takefusa Kubo
   - Suisse — Granit Xhaka
   - Suède — Viktor Gyökeres
   - Norvège — Erling Haaland
   - Angleterre — Jude Bellingham
   - Pays-Bas — Cody Gakpo

4. **Cards match corrigées**
   - La card adversaire à droite n'est plus vide pour Brésil–Japon, Algérie–Suisse, France–Suède, Côte d'Ivoire–Norvège, RD Congo–Angleterre et Pays-Bas–Maroc.
   - Les trois derniers résultats adverses s'affichent quand ils existent.

## Fichiers modifiés

- `src/v10/v10-team-app.js`
- `src/v10/v10-team-app.css`
- `data/opponents.json`
- `data/opponent-results.json`
- `assets/opponents/*/player.png`

## Fichiers non touchés volontairement

- `netlify/functions/scores.js`
- `live.json`
- `stats.json`
- moteur de simulation / bracket global dans `index.html`
