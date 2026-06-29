# PATCH NOTES — V10.2

Build : `QualifGaind_Worldwide_Build_V10_2`

## Inclus

1. `stats.json` rafraîchi au 29 juin 2026 : top scorers, meilleures attaques, meilleures défenses.
2. Optimisation images : conversion WebP des banners / players / hero lourds, références JSON/HTML/CSS mises à jour.
3. Optimisation mobile : lazy-loading des cartes/players, hero prioritaire, CSS mobile allégé.
4. Langue automatique : homepage détecte navigateur/OS ; page équipe respecte la priorité `?lang=` puis `team.defaultLang`.
5. Arabe Égypte : `egypt.defaultLang = "ar"`, fichiers `data/i18n/ar/*`, RTL contrôlé uniquement sur les blocs V10.
6. Sélecteur langue : ajout bouton AR.

## Réversibilité arabe

Pour retirer l’arabe rapidement :

- dans `src/v10/v10-team-app.js`, passer `AR_ENABLED = false` ;
- dans `data/teams.json`, remettre `egypt.defaultLang` à `fr` ;
- laisser ou supprimer le dossier `data/i18n/ar/`.

Le RTL est volontairement contrôlé par les classes `v10-lang-ar` / `v10-rtl`, sans basculer tout le document en `dir="rtl"`, pour éviter de casser les tableaux globaux.

## Non touché

- moteur bracket / simulation ;
- scores.js API-Sports ;
- live.json ;
- tableaux globaux ;
- archive groupes.
