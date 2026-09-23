#!/usr/bin/env bash
# Vérifie qu'un ID de photo Unsplash existe avant qu'il n'entre dans lib/catalog.ts.
#
# Usage : verifier_photo.sh <photo-id>
# Exemple : verifier_photo.sh photo-1579338559194-a162d19bf842
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage : $0 <photo-id>" >&2
  exit 1
fi

id="$1"

if [[ "$id" == premium_photo-* || "$id" == *plus.unsplash.com* ]]; then
  echo "REJETÉ $id — les photos premium ne sont pas couvertes par remotePatterns et ne sont pas libres d'usage." >&2
  exit 1
fi

result=$(curl -s -o /dev/null -w "%{http_code} %{content_type}" \
  "https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=60")

echo "$result"

if [[ "$result" == "200 image/jpeg"* ]]; then
  exit 0
else
  echo "REJETÉ $id — attendu '200 image/jpeg', reçu '$result'" >&2
  exit 1
fi
