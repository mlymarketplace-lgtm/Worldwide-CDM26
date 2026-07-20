# Suivi des Lions V16.1.1

Build complet pour GitHub Desktop et Netlify.

## Principales évolutions

- home post-Mondial structurée autour de la mémoire de la Coupe du monde et du suivi des Lions ;
- vraie route neutre `?mode=worldcup` ;
- CMS éditorial avec « L’analyse de la rédaction » et brèves les plus récentes en premier ;
- headers visibles avec retours parent et accueil ;
- renderer équipe V16.1.1 exclusif, sans fallback Sénégal ;
- trois tableaux de mémoire sur les pages des seize équipes ;
- tests automatisés Lot A et Lot B.

Lire :

- `INSTALLATION_V16_1_0.txt` ;
- `RELEASE_NOTES_V16_1_0.md` ;
- `QA_V16_1_0.md` ;
- `AUDIT_RENDERER_EQUIPE_V16_1_0.md`.

Ce package est un build complet : copier l’ensemble de son contenu à la racine du dépôt. Les brèves dynamiques restent stockées dans Netlify Blobs et ne sont pas écrasées par le build.
