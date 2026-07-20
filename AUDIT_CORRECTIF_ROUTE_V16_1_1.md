# Correctif de propriété des routes — V16.1.1

## Cause racine

La V16.1.0 utilisait encore la règle :

```js
selectorActive = !params.has('team')
```

Elle assimilait toutes les routes non-équipe à l’ancien sélecteur V10. La Mémoire du Mondial existait dans le code, mais partageait le même conteneur et le même cycle de vie que l’ancien écran historique.

## Suppression logique appliquée

- suppression de la règle globale « tout ce qui n’est pas une équipe » ;
- suppression de `qg-selector-active` dans le pipeline moderne ;
- création de `#qg-app-root` ;
- masquage de tous les frères legacy de ce root sur les routes applicatives ;
- sélection du root moderne dans `computed-team-state.js` ;
- maintien du renderer équipe comme propriétaire exclusif des routes `team` ;
- ajout d’un contrôle d’intégrité après chaque rendu ;
- ajout d’un écran d’erreur visible si une route moderne ne produit pas son composant attendu.

## Architecture obtenue

```text
home / worldcup / news / gaindes / final
               ↓
          #qg-app-root
               ↓
      computed-team-state.js

team=<id>
    ↓
team-page-v1611.js
```

L’ancien HTML reste physiquement présent pour la compatibilité de certaines fonctions historiques, mais il n’est plus visible ni propriétaire des routes modernes.
