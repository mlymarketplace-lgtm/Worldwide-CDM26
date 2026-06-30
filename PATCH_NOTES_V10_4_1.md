# QualifGaïndé Worldwide — V10.4.1

## Objectif
Réduire réellement les appels `/.netlify/functions/scores` sans casser le tableau des 16es ni la simulation.

## Correctifs intégrés

1. **Polling API intelligent**
   - `/scores` n'est plus appelé toutes les 60 secondes en permanence.
   - L'appel est autorisé uniquement dans les fenêtres de match non verrouillé.
   - Après détection d'un live ou d'un final sur le match actif, le polling continue 15 minutes puis s'arrête.
   - Le polling reprend automatiquement à la prochaine fenêtre de match.

2. **Résultats verrouillés conservés**
   - `data/knockout-locks.json` reste la source locale prioritaire pour les résultats terminés.
   - Les résultats déjà figés ne déclenchent plus d'appel API.
   - Les qualifiés connus restent affichés dès le chargement, sans attendre API-Sports.

3. **Pas de double appel API depuis la page équipe**
   - La card de compte à rebours équipe ne lance plus son propre polling concurrent.
   - Elle réutilise le dernier état live récupéré par le polling global.
   - Un événement interne `qualifgainde:scoresUpdated` synchronise la card dès qu'un nouveau score arrive.

4. **Service Worker versionné**
   - Cache PWA passé en V10.4.1 pour éviter un ancien script en cache.

## Résultats figés au moment du build
- Afrique du Sud 0–1 Canada
- Brésil 2–1 Japon
- Allemagne 1–1 Paraguay · TAB 3–4 · Paraguay qualifié
- Pays-Bas 1–1 Maroc · TAB 2–3 · Maroc qualifié

## À retenir
L'API-Sports redevient un outil live uniquement. Les matchs terminés connus doivent être inscrits dans `data/knockout-locks.json` pour rester disponibles sans dépendre d'un appel API au chargement.
