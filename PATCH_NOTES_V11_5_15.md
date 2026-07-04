# PATCH NOTES — V11.5.15 (récupération + fix cache)

## Contexte
V11.5.14 a cassé le site sur ordi ET mobile. Cause identifiée : le nouveau
service worker qg-v11-5-14 + le script iOS reset ont créé un conflit de cache
pendant la transition (mise en cache de fichiers src/v10 versionnés qui
entraient en conflit avec les versions déjà servies).

## Correction
Retour à la base STABLE de V11.5.13 (qui marchait sur laptop), avec UNIQUEMENT :

### Les 2 corrections voulues (conservées)
1. **Messi +1 but** → 7 buts, seul en tête (stats.json).
2. **16es figés dans live.json** → 14 résultats visibles sur iPhone sans API.

### Le fix du bug de cache (nouveau)
- service-worker : les fichiers `/src/v10/*.js|css` ne sont PLUS mis en cache
  au préchargement (source des conflits de version).
- `/src/` passe en **network-first** : le navigateur prend toujours la version
  fraîche du serveur, plus jamais de décalage de version.
- Cache bumpé `qg-v11-5-15` pour forcer une régénération propre.

## Ce qui n'a PAS été touché (contrairement à V11.5.14)
- ❌ Pas de changement de BUILD_VERSION (reste 11.5.11, cohérent avec le serveur).
- ❌ Pas de script iOS reset (c'était une source de risque).
- ❌ Pas de nouvelle référence de fichier.
- index.html = identique à V11.5.13 (base qui marchait).

## arg-cpv et col-gha
Toujours préremplis en scheduled dans live.json. À compléter dès résultat connu
(voir COMMENT_FIGER_UN_MATCH.md). S'afficheront en 60s partout via auto-refresh.

## Déploiement
1. Upload à la racine → commit.
2. Netlify : **Clear cache and deploy site**.
3. iPhone : fermer complètement Safari (glisser vers le haut), rouvrir.
   Si PWA installée : la supprimer de l'écran d'accueil et réinstaller.
4. Ordi : Ctrl+Shift+R (hard refresh).

## Si ça ne marche toujours pas
Ouvrir la console (F12) et regarder les erreurs rouges. Le plus probable :
un vieux service worker encore actif. Solution : DevTools → Application →
Service Workers → "Unregister" → recharger.
