#!/usr/bin/env bash
# Verify that an Unsplash photo ID resolves before it goes into lib/catalog.ts.
#
# Usage:   verify_photo.sh <photo-id>
# Example: verify_photo.sh photo-1579338559194-a162d19bf842
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <photo-id>" >&2
  exit 1
fi

id="$1"

if [[ "$id" == premium_photo-* || "$id" == *plus.unsplash.com* ]]; then
  echo "REJECTED $id — premium photos are not covered by remotePatterns and are not free to use." >&2
  exit 1
fi

result=$(curl -s -o /dev/null -w "%{http_code} %{content_type}" \
  "https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=60")

echo "$result"

if [[ "$result" == "200 image/jpeg"* ]]; then
  exit 0
else
  echo "REJECTED $id — expected '200 image/jpeg', got '$result'" >&2
  exit 1
fi
