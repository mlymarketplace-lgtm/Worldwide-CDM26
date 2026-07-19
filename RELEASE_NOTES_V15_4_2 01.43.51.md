# QualifGaïndé V15.4.2 — Hotfix live 30 secondes

## Diagnostic
Le navigateur lançait bien un cycle toutes les 30 secondes, mais trois couches pouvaient encore renvoyer un ancien score :

1. `FOOTBALL_CACHE_SECONDS` pouvait rester réglé à `300` dans Netlify et écraser le réglage prévu dans le code ;
2. l’URL stable de la fonction pouvait retomber sur une ancienne entrée CDN ;
3. le service worker pouvait conserver une réponse de fonction dans son cache de secours.

## Corrections
- cache serveur plafonné de façon irrévocable à 25 secondes ;
- URL live renouvelée par tranche partagée de 30 secondes ;
- cache CDN limité à 25 secondes, sans `stale-while-revalidate` ;
- réponses API jamais stockées dans le cache du service worker ;
- clés exactes `third-103` et `final-104` ajoutées pour les deux derniers matchs ;
- cache PWA et version applicative portés à V15.4.2.

Aucune donnée sportive statique ni aucun résultat n’a été modifié.
