# V15.4.8 — Correctif définitif des pages Espagne et Argentine

## Cause réelle

Deux moteurs de rendu se succédaient sur les pages équipe. Le renderer moderne appliquait correctement le résultat final, mais l’adaptateur historique se relançait ensuite et conservait le bloc statique Belgique–Sénégal lorsqu’il ne trouvait plus de prochain match. Les scripts de langue pouvaient également remettre des textes d’avant-finale.

## Correction

- prise en charge explicite des statuts champion et médaille d’argent dans le renderer historique ;
- panneau « Finale terminée · Espagne 1–0 Argentine » construit directement pour les deux équipes ;
- cartes Espagne et Argentine et derniers résultats ;
- compteur supprimé ;
- garde terminale après tous les scripts hérités ;
- aucune réapparition du fallback Sénégal après changement de langue, score update ou mutation tardive ;
- build complet avec registre npm public.
