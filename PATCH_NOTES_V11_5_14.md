# PATCH NOTES — V11.5.14 (iPhone-safe)

## Corrections

### 1. Messi +1 but
stats.json : Messi passe de 6 à **7 buts, seul en tête** du classement.
Mbappé 2e (6), Haaland 3e (5).

### 2. Fix iPhone (le bug principal)
**Cause :** sur iPhone, l'app dépend de `live.json` (pas de l'API `/scores`
comme sur laptop). Or `live.json` ne contenait que quelques matchs, pas les
16es terminés. Résultat : écran vide sur mobile.

**Correction :** les **14 résultats des 16es déjà joués** sont maintenant
figés dans `live.json`. L'iPhone les affiche sans dépendre de l'API.

### 3. Cohérence de version (fragilité cache iOS)
- `BUILD_VERSION` corrigé : 11.5.11 → **11.5.14** (était incohérent).
- service-worker : `qg-v11-5-14`.
- Toutes les refs `?v=` alignées sur 11.5.14.

### 4. Reset cache iOS one-shot
Nouveau script en tête de `<head>` : quand la version de build change, il
force `serviceWorker.update()` et vide les vieux caches `qg-*`. Une seule fois
par version. C'est ce qui manquait pour que Safari/PWA iPhone prenne la MAJ.

## arg-cpv et col-gha (à compléter)

Ces deux matchs ne sont pas encore terminés au moment du build. Ils sont
**pré-remplis en `scheduled`** dans live.json avec un champ `_todo` explicatif.

Dès que tu connais le résultat, édite live.json :
```json
"arg-cpv": {
  "home": 2, "away": 1, "status": "final",
  "apiStatus": "FT", "apiStatusLong": "Match Finished",
  "winner": "home", "winnerSide": 0, "locked": true, "koId": "N87"
}
```
(ou avec `penalty` si TAB — voir COMMENT_FIGER_UN_MATCH.md)

Grâce au patch auto-refresh V11.5.13, le changement s'affiche en 60s sur
**tous les appareils, iPhone compris**, sans déploiement.

## Fichiers modifiés
- index.html (BUILD_VERSION + iOS reset)
- service-worker.js (qg-v11-5-14)
- live.json (14 résultats 16es + arg-cpv/col-gha préremplis)
- stats.json (Messi 7 buts)

## Déploiement
Upload à la racine → commit → **Clear cache and deploy** sur Netlify.
Sur iPhone : fermer complètement Safari puis rouvrir (ou supprimer/réinstaller
la PWA si ajoutée à l'écran d'accueil).
