# PATCH NOTES — V11.5.13

Build : QualifGaind_Worldwide_Build_V11_5_13
Type : correction structurelle + mécanique auto-refresh

## Problème résolu

Les résultats des matchs (ex. Argentine–Cap-Vert, Colombie–Ghana) ne
s'affichaient pas dans le tableau de simulation sans un nouveau déploiement,
car :
- `live.json` n'était lu qu'UNE fois au démarrage (flag `fallbackLoaded`).
- `data/knockout-locks.json` n'était chargé qu'UNE fois (`loadR32LocksFileOnce`).

Résultat : chaque fin de match imposait un déploiement. Régression bloquante.

## Solution : mécanique auto-refresh (au-delà du match)

Nouveau fichier `src/v10/auto-refresh-scores.js` :
- Recharge `live.json` toutes les 60 secondes.
- Rappelle `loadR32LocksFileOnce()` (knockout-locks.json) toutes les 60 secondes.
- Refresh immédiat au retour d'onglet (visibilitychange).
- Réutilise les fonctions natives (`applyScoresData`, `recalculateAll`,
  `renderRound32Grid`, `renderKnockoutTree`) sans les modifier.

**Conséquence : plus AUCUN déploiement nécessaire après un match.**
Il suffit d'ajouter le résultat dans `live.json` (ou `knockout-locks.json`),
commit → le tableau se met à jour en 60 secondes maximum, chez tous les
visiteurs, sans recharger la page.

## Fichiers modifiés

- `index.html` : +1 ligne (chargement du patch). Version bumpée en V11.5.13.
- `service-worker.js` : cache bumpé `qg-v11-5-13`, nouveau fichier ajouté au cache.
- `src/v10/auto-refresh-scores.js` : NOUVEAU (96 lignes, autonome).

## Fichiers NON modifiés (aucune régression)

- `scores.js` (API-Football) — inchangé.
- Moteur de simulation, bracket, groupes, meilleurs troisièmes — inchangés.
- `stats.json`, `teams.json`, tous les autres data — inchangés.
- `netlify.toml` — inchangé (les headers no-store existaient déjà).

## Comment figer les prochains matchs

Voir `COMMENT_FIGER_UN_MATCH.md` — structure JSON prête à copier-coller
pour arg-cpv, col-gha et tous les matchs jusqu'à la finale.

## Test après déploiement

1. Déployer le ZIP → `Clear cache and deploy` sur Netlify.
2. Ouvrir la console : `window.QG_AUTO_REFRESH.tick()` force un refresh manuel.
3. Ajouter un résultat dans live.json → attendre 60s → le tableau se met à jour.
