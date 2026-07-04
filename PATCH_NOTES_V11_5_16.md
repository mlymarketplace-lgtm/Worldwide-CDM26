# PATCH NOTES — V11.5.16 (fix erreurs console)

## Bugs corrigés (existaient dans le code depuis V11.5.x)

### 1. `t is not a function` (renderThirdTable)
Dans la boucle `thirds.slice(0,8).forEach((t,i)=>...)`, la variable de boucle
`t` masquait la fonction globale de traduction `t()`. Résultat : `t('qualified')`
plantait → le tableau des meilleurs 3e et recalculateAll échouaient.
**Fix :** variable de boucle renommée `t` → `tm`. La fonction `t()` reste accessible.

### 2. `shortTeam is not defined` (tickerFromMatch)
La fonction `shortTeam()` était appelée mais n'existait nulle part → le ticker
plantait à chaque rendu.
**Fix :** remplacé `shortTeam(r.h)` par `NAMES[r.h]||r.h` (déjà utilisé partout ailleurs).

## Conséquence
Ces deux erreurs cassaient `recalculateAll`, `applyLanguage`, `initAppDisplay`
et `buildTicker` — d'où les comportements erratiques sur ordi et mobile.
Corrigées, l'app se rend proprement.

## Corrections data (conservées de V11.5.15)
- Messi 7 buts (seul en tête).
- 14 résultats des 16es figés dans live.json (affichage iPhone sans API).
- Service worker network-first sur /src/ (plus de conflit de cache).

## NON modifié
- Aucun changement de logique métier, API, scores.js.
- BUILD_VERSION reste 11.5.11.

## Déploiement
1. Upload racine → commit → Netlify **Clear cache and deploy**.
2. Ordi : Cmd+Shift+R.
3. iPhone : fermer Safari complètement, rouvrir.
4. Si un vieux service worker persiste : DevTools → Application →
   Service Workers → Unregister → recharger.
