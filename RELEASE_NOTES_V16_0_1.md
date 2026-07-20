# QualifGaïndé V16.0.1 — Publication CMS fiable

## Correctif bloquant

- correction de l’énumération Netlify Blobs : `store.list()` est désormais traité selon son retour `{ blobs }` ;
- confirmation de publication affichée directement sous les boutons de l’éditeur ;
- bouton animé et verrouillé pendant l’envoi ;
- messages d’erreur serveur lisibles dans la console ;
- relecture forte après écriture avant d’annoncer le succès ;
- même article mis à jour après sa première sauvegarde grâce à son identifiant conservé ;
- prévention des doublons par verrou navigateur, identifiant de requête et empreinte serveur ;
- détection d’un titre identique ;
- maintien des données Netlify Blobs entre les déploiements.

## Comportement attendu

Après un succès, le bouton devient **Mettre à jour l’article**. Un nouveau clic modifie la brève existante et ne crée pas une seconde publication.
