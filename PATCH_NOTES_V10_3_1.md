# V10.3.1 — Home language polish + PWA icon

## Corrections

- Page d’accueil : l’arabe n’est plus appliqué automatiquement sur la home, même si le navigateur est en arabe.
- Arabe conservé pour `?team=egypt` et pour `?team=egypt&lang=ar`.
- Détection automatique conservée pour FR / EN / PT / ES sur la home.
- PWA renommée : **Suivez la CDM 2026**.
- Icônes PWA remplacées par la photo Coupe + ballon fournie par Mohamed.
- Service Worker bumpé en cache `qg-v10-3-1` pour forcer la prise en compte des nouveaux assets.

## Tests recommandés

- `/` : home en FR/EN/PT/ES selon navigateur, pas en arabe.
- `/?team=egypt` : Égypte en arabe.
- `/?team=egypt&lang=fr` : Égypte en français.
- Installation PWA : nom affiché “Suivez la CDM 2026” / icône Coupe + ballon.
