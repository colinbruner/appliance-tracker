# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .

# Bake in sentinel placeholders — the container entrypoint replaces these
# at runtime with real values sourced from the k8s Secret (via 1Password).
ENV VITE_OIDC_AUTHORITY=__OIDC_AUTHORITY__
ENV VITE_OIDC_CLIENT_ID=__OIDC_CLIENT_ID__

RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copy built SPA
COPY --from=builder /app/build /usr/share/nginx/html

# nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Entrypoint replaces __OIDC_AUTHORITY__ / __OIDC_CLIENT_ID__ placeholders in
# the compiled JS with actual values passed in as environment variables.
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
