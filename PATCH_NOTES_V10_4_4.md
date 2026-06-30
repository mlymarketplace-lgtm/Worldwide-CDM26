# V10.4.4 — local timezone display

Patch UX prudent.

## Inclus

- Ajout de `formatMatchTimeForDevice(matchDate)` côté app.
- Les horaires visibles sont convertis automatiquement selon le fuseau horaire du device.
- Exemple attendu à Dakar / Abidjan : `17h00 · heure locale` au lieu de `19h00 Paris`.
- Application aux zones principales : prochain match, compte à rebours, tableau des 16es, simulation KO.
- Aucune modification des dates sources, du moteur de simulation, d’API-Sports, de `knockout-locks.json` ou de `stats.json`.
- Service worker versionné V10.4.4 pour éviter un vieux cache.

## Tests

- `/?team=ivory_coast&v=1044`
- `/?team=senegal&v=1044`
- `/?mode=global&v=1044`
- Vérifier que les heures ne mentionnent plus “Paris” dans les cards dynamiques.
