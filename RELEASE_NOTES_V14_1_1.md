# V14.1.1 — Runtime Sports Mangara Card Fix

## Cause exacte
La carte était bien présente dans le HTML initial, mais `assets/js/computed-team-state.js`
reconstruisait ensuite toute la home avec `selector.innerHTML` et supprimait la carte.

## Correction
- ajout de Sports Mangara directement dans le template réellement rendu par le moteur de home ;
- carte positionnée avant Les Brèves du Mondial ;
- version runtime alignée sur V14.1.1 ;
- liens passés en `v=1411` ;
- caches PWA incrémentés.

La carte ne dépend désormais ni du HTML initial seul, ni d’une injection tardive.
