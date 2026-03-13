#!/bin/sh
set -e

# ---------------------------------------------------------------------------
# Runtime injection of OIDC configuration into compiled JS.
#
# Vite bakes VITE_* env vars into the bundle at build time.  We build with
# sentinel placeholder strings; this script replaces them with the real
# values before nginx starts, allowing a single immutable image to be
# configured via k8s Secrets without rebuilding.
#
# Required env vars (populated from the 1Password-synced k8s Secret):
#   OIDC_AUTHORITY  — e.g. https://accounts.google.com
#   OIDC_CLIENT_ID  — e.g. your-client-id
# ---------------------------------------------------------------------------

if [ -z "$OIDC_AUTHORITY" ] || [ -z "$OIDC_CLIENT_ID" ]; then
  echo "⚠  OIDC_AUTHORITY or OIDC_CLIENT_ID not set — running in demo mode (no login)"
else
  echo "→ Injecting OIDC config into static bundle…"
  find /usr/share/nginx/html -type f -name '*.js' \
    -exec sed -i "s|__OIDC_AUTHORITY__|${OIDC_AUTHORITY}|g" {} +
  find /usr/share/nginx/html -type f -name '*.js' \
    -exec sed -i "s|__OIDC_CLIENT_ID__|${OIDC_CLIENT_ID}|g" {} +
  echo "✓ Done"
fi

exec "$@"
