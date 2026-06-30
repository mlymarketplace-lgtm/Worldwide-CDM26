# QualifGaïndé Worldwide — V11.0 FULL BUILD

## Objectif

Transformer la V10.4.4 stable en première version V11 “tournoi vivant”, sans modifier l’expérience utilisateur : même page d’accueil, même nombre d’écrans, même routing `?team=`, même PWA, même moteur de simulation.

La V11.0 met à jour les contenus dynamiques du tournoi après le résultat :

- Côte d’Ivoire 1–2 Norvège
- Norvège qualifiée pour affronter le Brésil
- Côte d’Ivoire éliminée avec message d’au revoir
- Maroc qualifié vers Canada–Maroc
- Brésil qualifié vers Brésil–Norvège
- Paraguay qualifié, texte Paraguay–France préparé mais non activé tant que France–Suède n’est pas terminé

## Principes de prudence

- Les épopées historiques des teams d’entrée ne sont pas modifiées.
- La home “Je suis supporter de…” n’est pas refondue.
- Les matchs non terminés ne sont pas figés comme résultats officiels.
- Les textes conditionnels sont stockés mais non activés tant que le bracket ne les rend pas vrais.
- L’API-Sports reste dédiée au live et aux nouveaux résultats ; les résultats déjà connus sont figés localement.

## Fichiers de données ajoutés

### `data/team-next.json`

Nouvelle couche de pilotage V11. Elle permet de mettre à jour les prochains matchs et statuts sans toucher directement à la structure UX.

Exemples :

- `morocco` → `can-mar`
- `brazil` → `bra-nor`
- `ivory_coast` → statut `eliminated`
- `france`, `senegal`, `algeria`, `spain` → statut `pending`

### `data/farewells.json`

Textes éditoriaux réutilisables pour les équipes éliminées.

Inclus :

- texte spécifique Côte d’Ivoire
- template Afrique générique
- template monde générique

## Fichiers de données modifiés

### `data/knockout-locks.json`

Ajout du résultat figé :

```json
"civ-nor": {
  "koId": "N76",
  "h": "CIV",
  "a": "NOR",
  "home": 1,
  "away": 2,
  "status": "final",
  "winner": "away",
  "winnerSide": 1,
  "locked": true
}
```

Conséquence : la simulation remonte automatiquement Norvège dans le match contre Brésil.

### `data/matches.json`

Ajout de matchs R16 / conditionnels :

- `can-mar` : Canada–Maroc
- `bra-nor` : Brésil–Norvège
- `par-fra` : Paraguay–France, conditionnel
- `sen-usa` / `sen-bih` : conditionnels
- `alg-col` / `alg-gha` : conditionnels

### `data/previews.json`

Ajout de récits éditoriaux :

- Canada–Maroc
- Brésil–Norvège
- Paraguay–France
- Sénégal–États-Unis
- Sénégal–Bosnie-Herzégovine
- Algérie–Colombie
- Algérie–Ghana

### `data/opponents.json`

Ajout de profils adversaires :

- Canada — Alphonso Davies
- Paraguay — Julio Enciso
- États-Unis — Christian Pulisic
- Ghana — Mohammed Kudus
- Colombie — Luis Díaz
- Bosnie-Herzégovine — Edin Džeko

### `data/opponent-results.json`

Ajout / mise à jour des quatre derniers résultats :

- Canada
- Paraguay
- Norvège
- États-Unis
- Bosnie-Herzégovine
- Colombie
- Ghana

### `data/team-results.json`

Mise à jour :

- Maroc + Pays-Bas 1–1 Maroc · TAB 2–3
- Brésil + Brésil 2–1 Japon
- Côte d’Ivoire + Côte d’Ivoire 1–2 Norvège

### `stats.json`

Mise à jour :

- Erling Haaland passe à 5 buts
- Meilleure attaque conservée à 11 buts : Allemagne, Pays-Bas
- Meilleure défense conservée : Mexique, Espagne

## Assets ajoutés

Nouvelles photos adversaires :

- `assets/opponents/canada/player.webp`
- `assets/opponents/paraguay/player.webp`
- `assets/opponents/united_states/player.webp`
- `assets/opponents/ghana/player.webp`
- `assets/opponents/colombia/player.webp`
- `assets/opponents/bosnia_herzegovina/player.webp`

## Code modifié

### `src/v10/v10-team-app.js`

Ajouts :

- chargement optionnel de `team-next.json`
- chargement optionnel de `farewells.json`
- application des overrides V11 après chargement des données
- support des teams éliminées sans nouvel écran
- affichage “Parcours terminé” dans les mêmes blocs existants
- adaptation automatique “Trois derniers résultats” / “Quatre derniers résultats”

### `index.html`

Ajouts / corrections :

- fallback statique Côte d’Ivoire 1–2 Norvège
- Norvège figée vainqueur du N76
- Haaland à 5 buts dans le fallback HTML et le fallback JS

### `service-worker.js`

Version cache passée à :

- `qg-v11-0-0-static`
- `qg-v11-0-0-runtime`

## Tests réalisés

- JSON valide : teams, matches, previews, opponents, opponent-results, team-results, team-next, farewells, knockout-locks, stats
- JS syntax check OK sur `src/v10/v10-team-app.js`
- JS syntax check OK sur `netlify/functions/scores.js`
- Vérification que tous les `nextMatchId` existent
- Vérification que tous les participants des nouveaux matchs sont profilés
- Vérification que toutes les nouvelles photos adversaires existent
- Vérification que `civ-nor` est bien figé avec Norvège vainqueur
- Vérification que Haaland est bien à 5 buts

## Tests post-déploiement recommandés

- `/ ?v=110` : home toujours identique
- `/?team=morocco&v=110` : Maroc → Canada
- `/?team=brazil&v=110` : Brésil → Norvège
- `/?team=ivory_coast&v=110` : message d’au revoir Côte d’Ivoire
- `/?team=senegal&v=110` : Sénégal reste sur Belgique, pas de faux tour suivant
- `/?mode=global&v=110` : simulation avec Norvège qualifiée contre Brésil
- `/stats.json?v=110` : Haaland à 5 buts
- `/.netlify/functions/scores` : API toujours disponible

