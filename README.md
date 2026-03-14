# appliance-tracker

Track home appliances expected EOL and possible future cost for financial planning.

## Development

```bash
npm install
npm run dev
```

### OIDC Authentication (optional)

Copy `.env.example` to `.env` and fill in your OIDC provider details. Without these, the app runs in demo mode with no login.

```bash
cp .env.example .env
```

Register the following redirect URIs with your OIDC provider:

- Development: `http://localhost:5173/callback`
- Production: `https://appliances.bruner.family/callback`

## Deployment

The app is a static SPA built with SvelteKit (`adapter-static`) and deployed to a Google Cloud Storage bucket at [appliances.bruner.family](https://appliances.bruner.family).

### How it works

Pushes to `main` trigger the GitHub Actions workflow (`.github/workflows/ci.yml`), which:

1. Builds the app with `npm run build`, injecting OIDC credentials as `VITE_*` environment variables so Vite bakes them into the bundle at build time
2. Authenticates to GCP using Workload Identity Federation (no long-lived service account keys)
3. Syncs the `build/` output to `gs://appliances.bruner.family` via `gcloud storage rsync`

### Required GitHub secrets

| Secret | Description |
|---|---|
| `PROVIDER_NAME` | GCP Workload Identity Federation provider resource name |
| `SA_EMAIL` | GCP service account email with Storage Object Admin on the bucket |
| `OIDC_AUTHORITY` | OIDC provider URL (e.g. `https://auth.example.com`) |
| `OIDC_CLIENT_ID` | OIDC client ID registered with your provider |

### GCS bucket configuration

The bucket must be configured for static website hosting with `index.html` set as both the main page and the 404 page. The 404 page setting is required to support SPA client-side routing (all unknown paths fall back to `index.html`).

