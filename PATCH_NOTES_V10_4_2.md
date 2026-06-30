# PATCH NOTES V10.4.2 — Safe single-match polling

Objectif : réduire effectivement les appels `/.netlify/functions/scores` sans casser le tableau ni la simulation.

## Principe

- Le tableau et la simulation s’appuient d’abord sur `data/knockout-locks.json` pour les résultats terminés.
- L’API-Sports sert uniquement au prochain match global non verrouillé.
- Comme les matchs à élimination directe ne se superposent plus, on ne surveille qu’un seul match à la fois.

## Règles de polling

1. Trouver le premier match R32 non verrouillé dans le calendrier local `NEXT_KNOCKOUT_FIXTURES`.
2. Commencer les appels 30 minutes avant le coup d’envoi.
3. Appeler `/scores` toutes les 60 secondes uniquement pendant la fenêtre du match.
4. Si le match devient live ou final, maintenir les appels 15 minutes après le final détecté.
5. Après cette fenêtre, arrêter les appels jusqu’au prochain match non verrouillé.
6. Filet de sécurité : si un match passé n’est pas figé localement, une tentative de rattrapage espacée est autorisée, au lieu d’un polling permanent.

## Résultats figés conservés

- Afrique du Sud 0–1 Canada
- Brésil 2–1 Japon
- Allemagne 1–1 Paraguay · TAB 3–4 · Paraguay qualifié
- Pays-Bas 1–1 Maroc · TAB 2–3 · Maroc qualifié

## Fichiers modifiés

- `index.html`
- `service-worker.js`

## Tests recommandés

- `/?team=senegal&v=1042`
- `/?mode=global&v=1042`
- vérifier que Paraguay et Maroc restent présents sans appel API immédiat
- vérifier dans Netlify que `/scores` n’est appelé que dans la fenêtre du prochain match
