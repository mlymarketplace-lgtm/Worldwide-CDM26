# V13.0.19 — Sports Mangara Native Hub

Base : V13.0.18 News Experience.

## Intégration
- Sports Mangara embarqué sous `/mangara/`.
- Toutes les photos joueurs, logos clubs, images du staff et JSON sont inclus localement.
- Carte native entièrement cliquable ajoutée à la home QualifGaïndé.
- Retour vers la home QualifGaïndé depuis le header Sports Mangara.

## PWA isolée
- `start_url` : `/mangara/`
- `scope` : `/mangara/`
- service worker enregistré uniquement sur `/mangara/`
- cache Sports Mangara isolé : il ne supprime jamais les caches QualifGaïndé.

## API
Aucune connexion API supplémentaire dans cette version.
Sports Mangara continue d’utiliser ses JSON statiques locaux.
La connexion API-SPORTS fera l’objet d’une version séparée.

## Déploiement
Décompresser ce patch par-dessus le repository V13.0.18, puis déployer.
URL de test : `/mangara/`
