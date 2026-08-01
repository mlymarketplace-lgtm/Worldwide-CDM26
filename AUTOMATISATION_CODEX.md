# Automatisation Codex → QualifGaïndé

## Format envoyé à l'API

```json
{
  "items": [
    {
      "player": "nicolas-jackson",
      "topic": "transfer",
      "title": "Nicolas Jackson : Chelsea ouvre la porte à Aston Villa",
      "excerpt": "Chelsea accepte désormais d'étudier une offre d'Aston Villa.",
      "body": "Article rédigé en trois à six paragraphes.",
      "analysis": "Pourquoi cette évolution compte pour le joueur et les Lions.",
      "sources": "https://source.example/article",
      "reliability": "credible",
      "changeType": "evolution",
      "tag": "Mercato",
      "image": {
        "url": "https://upload.wikimedia.org/.../photo.jpg",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Photo.jpg",
        "author": "Nom du photographe",
        "license": "CC BY-SA 4.0"
      }
    }
  ]
}
```

## Règles éditoriales

1. Ne pas envoyer les éléments sans nouveauté réelle.
2. Utiliser la même clé `player + topic` durant tout le cycle d'un dossier.
3. Envoyer `changeType: evolution` pour une avancée et `completed` pour un dossier bouclé.
4. Ne jamais inventer une source, une licence ou un crédit photographique.
5. Les éléments du Radar peuvent être omis ou envoyés avec `radar: true` ; ils ne seront pas publiés.

## Exécution

Le client local `scripts/publish-brief.mjs` envoie le JSON à Netlify. Codex doit afficher le résultat par sujet : `created`, `updated`, `unchanged`, `skipped` ou `rejected`.

## Flux retenu

1. Mohamed transmet manuellement le brief ChatGPT dans la tâche Codex.
2. Codex extrait uniquement les informations réellement nouvelles.
3. Codex rédige un article distinct par sujet, avec « L’analyse de la rédaction ».
4. Codex recherche une photo Wikimedia et vérifie la page source, l'auteur et la licence.
5. Codex envoie le lot à l'API et restitue le résultat de publication.

Les crédits Wikimedia sont stockés avec l'article et affichés sous la photo avec un lien vers la page source.
