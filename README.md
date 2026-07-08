# Mondial Pulse 2026 — V13.0.13

Version prête pour **GitHub + Netlify**.

## Corrections V13.0.13

- Le bandeau / logo **Mondial Pulse 2026** est cliquable sur la home.
- Le bandeau / titre est aussi cliquable depuis la page des brèves.
- Le bouton **Voir la page globale** est remplacé par **Voir la homepage** et renvoie vers `/`.
- Les images des brèves ont été interverties :
  - carte home **Les Brèves du Mondial** = photo Coupe du monde ;
  - article **Séisme scandinave** = photo Neymar / Brésil-Norvège.
- Cache/version bumpés en `13.0.13 / 1313`.

## Déploiement GitHub → Netlify

1. Dézipper ce dossier.
2. Envoyer tout le contenu à la racine du repo GitHub.
3. Dans Netlify :
   - Build command : vide ou `npm run build`
   - Publish directory : `.`
4. Déployer.

## Test local rapide

```bash
python3 -m http.server 8888
```

Puis ouvrir :

```text
http://localhost:8888/
http://localhost:8888/news
http://localhost:8888/suisse
```
