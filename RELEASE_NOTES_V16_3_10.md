# QualifGaïndé V16.3.10 — import Wikimedia fiabilisé

## Correction

- La fonction de publication s’identifie désormais explicitement auprès de Wikimedia lors du téléchargement des illustrations.
- Le délai de téléchargement passe de 12 à 15 secondes.
- En cas de refus distant, le code HTTP Wikimedia est conservé dans l’erreur afin de faciliter le diagnostic.

Cette correction répond aux refus intermittents rencontrés lors de la publication du brief Lions du 3 août 2026. La restriction aux images hébergées par Wikimedia, les crédits obligatoires et la limite de poids restent inchangés.
