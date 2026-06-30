# README V11 — QualifGaïndé Worldwide

## Vision V11

La V11 transforme QualifGaïndé Worldwide en app “tournoi vivant”. L’utilisateur ne voit pas une nouvelle interface : il garde le même parcours, mais les contenus des pages équipes évoluent selon l’avancement réel de la Coupe du monde.

## Ce qui ne change pas

- Page d’accueil immersive “Je suis supporter de…”
- Routing `?team=senegal`, `?team=morocco`, etc.
- Nombre d’écrans
- PWA
- API-Sports
- Tableau des 16es
- Simulation jusqu’à la finale
- Épopées historiques des équipes

## Ce qui devient dynamique

- prochain adversaire
- 4 derniers résultats
- récit du prochain match
- statut qualifié / éliminé / en attente
- texte d’au revoir pour équipe éliminée

## Fichiers maîtres

### `data/team-next.json`

Pilote le statut vivant des teams d’entrée.

Champs utiles :

- `status`: `qualified`, `pending`, `eliminated`
- `round`: `R32`, `R16`, etc.
- `nextMatchId`: identifiant de match à afficher dans la page équipe
- `nextOpponent`: adversaire réel quand connu
- `pendingNext`: hypothèses préparées mais non affichées comme définitives
- `selectorLine`: phrase courte visible sur la home
- `statusLabel`: statut dans le header équipe

### `data/knockout-locks.json`

Vérité froide des matchs terminés. Si un match est fini, il doit être figé ici.

L’API live peut confirmer un résultat, mais l’app ne doit pas dépendre de l’API pour reconstruire les résultats déjà connus.

### `data/previews.json`

Contient les récits de match. Les textes peuvent être préparés à l’avance pour des branches conditionnelles, mais ils ne sont activés que si le `nextMatchId` d’une team pointe vers eux.

### `data/farewells.json`

Contient les textes d’au revoir. Pour les équipes africaines, utiliser un ton digne, respectueux, avec rendez-vous dans quatre ans : Espagne / Portugal / Maroc.

### `data/team-results.json` et `data/opponent-results.json`

Stockent les résultats éditoriaux à afficher dans les cards. Depuis V11, viser 4 derniers résultats quand ils sont disponibles.

### `stats.json`

Stats cumulées depuis le début de la Coupe du monde. Ne pas confondre forme récente, phase de groupes, ou phase à élimination directe.

## Règles de prudence

- Ne pas figer un match non terminé.
- Ne pas activer un `nextMatchId` conditionnel avant résultat officiel.
- Ne pas toucher aux épopées historiques pour une simple mise à jour de tour.
- Ne pas mélanger une correction technique avec une refonte UX.
- Après chaque match terminé : mettre à jour `knockout-locks.json`, puis les résultats récents, puis seulement les previews/statuts.

## Déploiement

Déployer le build complet quand il y a changement de socle ou beaucoup de fichiers data/assets.

Commit conseillé :

```text
V11.0 tournament live editorial rebuild
```

Netlify :

```text
Trigger deploy → Clear cache and deploy site
```

## Checklist minimale post-déploiement

- Home OK
- Une team qualifiée OK
- Une team en attente OK
- Une team éliminée OK
- Simulation globale OK
- Stats OK
- API scores OK

