# Mondial Pulse 2026 — V13.0.12

Version prête pour **GitHub + Netlify**.

## Contenu

Cette version inclut :

- page d’entrée multi-équipes ;
- carte cliquable **Les Brèves du Mondial** ;
- page dédiée `/news`, `/breves`, `/brèves` ;
- pack Suisse :
  - carte Suisse sur la home ;
  - page Suisse ;
  - bandeau Suisse ;
  - joueur vedette ;
  - ambiance Suisse ;
  - 4 derniers matchs ;
  - preview Suisse–Colombie ;
  - story Suisse ;
- compatibilité Netlify avec `_redirects` et `netlify.toml`.

## Déploiement GitHub → Netlify

1. Créer un nouveau repo GitHub, par exemple `mondial-pulse-2026`.
2. Dézipper ce dossier.
3. Envoyer tous les fichiers à la racine du repo.
4. Dans Netlify :
   - **Add new site** ;
   - **Import an existing project** ;
   - choisir le repo GitHub ;
   - Build command : laisser vide ou `npm run build` ;
   - Publish directory : `.` ;
   - Deploy.

## Test local rapide

```bash
python3 -m http.server 8888
```

Puis ouvrir :

```text
http://localhost:8888/
http://localhost:8888/?team=switzerland&v=1312
http://localhost:8888/news
```

## URLs utiles après déploiement

```text
/
?team=switzerland&v=1312
?team=france&v=1312
?team=morocco&v=1312
/news
/breves
/brèves
/suisse
/argentine
```

## Notes

Application statique : aucun backend requis pour cette version.
