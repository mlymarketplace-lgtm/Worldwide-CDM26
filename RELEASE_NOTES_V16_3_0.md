# QualifGaïndé V16.3.0 — publication automatisée depuis Codex

## Objectif

Publier directement les sujets utiles du brief quotidien sans ouvrir la console éditoriale.

## Fonctionnement

- Endpoint sécurisé : `POST /.netlify/functions/publish-news`.
- Authentification par secret Netlify `QG_PUBLISH_API_KEY`.
- Publication de 1 à 10 sujets par appel.
- Clé métier obligatoire : `player + topic`.
- Création lors de la première information.
- Mise à jour du même article lorsqu'un dossier évolue.
- Aucune écriture lorsque le contenu est inchangé.
- Les entrées marquées `radar` ou `publish: false` sont ignorées.
- Historique des vingt dernières évolutions conservé dans l'article.
- Photos limitées aux fichiers Wikimedia avec page source, auteur et licence obligatoires.

## Configuration Netlify, une seule fois

Créer la variable d'environnement `QG_PUBLISH_API_KEY` avec une valeur longue et aléatoire, puis redéployer le build.

Le même secret doit être disponible dans l'environnement local utilisé par l'automatisation Codex. Il ne doit jamais être écrit dans un fichier ou dans le brief.
