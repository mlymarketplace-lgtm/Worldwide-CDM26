# PATCH NOTES — V10.3

Build : QualifGaind_Worldwide_Build_V10_3

## Ajouts

- PWA complète : manifest.webmanifest, service-worker.js, icônes 192/512/maskable, meta iOS/Android.
- Service worker prudent :
  - API scores, live.json, stats.json et data/*.json en network-first.
  - Assets/images en cache-first.
  - Navigation HTML en network-first pour éviter de bloquer une ancienne version.
- Détection automatique de la langue navigateur renforcée :
  - Home / mode global : navigateur par défaut.
  - Choix manuel conservé uniquement si l'utilisateur clique sur un bouton langue.
  - Page équipe : `?lang=` prioritaire, puis defaultLang équipe.
- Tableau officiel des 16es connecté à API-Sports :
  - Scores live/final injectés dans les cases du tableau.
  - Afrique du Sud 0–1 Canada préchargé en fallback avant la première réponse API.
  - Les 16 affiches R32 sont mappées à leurs clés API.

## Corrections

- Alignement des IDs R32 : Brésil–Japon = N78, Côte d’Ivoire–Norvège = N76, Australie–Égypte = N86, Argentine–Cap-Vert = N87, Colombie–Ghana = N88.
- Correction date/lieu Pays-Bas–Maroc dans data/matches.json.
- Correction des sources du huitième M–P : Argentine/Cap-Vert vs Australie/Égypte ; Suisse/Algérie vs Colombie/Ghana.

## Non touché

- scores.js reste la fonction Netlify officielle.
- stats.json V10.2 conservé.
- Moteur de groupes / classement des meilleurs troisièmes conservé.
