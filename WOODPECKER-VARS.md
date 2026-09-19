# Woodpecker variables

The deploy pipeline reads these values from Woodpecker repository secrets. Secret names are lowercase; the pipeline exports the uppercase environment variables shown below.

| Woodpecker secret | Environment variable | Required | Purpose |
|---|---|---:|---|
| `npmrc_content` | `NPMRC_CONTENT` | yes | npmrc contents with read access to private `@tackgnol/*` packages; used only during image builds |
| `better_auth_secret` | `BETTER_AUTH_SECRET` | yes | Long random production secret for Better Auth |
| `trusted_origins` | `TRUSTED_ORIGINS` | yes | Comma-separated browser origins, normally `https://miseries.rpgtools.co` |
| `auth_base_url` | `AUTH_BASE_URL` | yes | Public backend/auth origin, normally `https://miseries.rpgtools.co` |
| `glitchtip_dsn` | `GLITCHTIP_DSN` | no | GlitchTip DSN. The backend reports with it and relays browser errors through `/api/tunnel`; the frontend build gets the same DSN with the key replaced by a placeholder (`VITE_GLITCHTIP_DSN`, derived in `deploy.yaml`), so the real key never ships to browsers. Reporting is off when unset |
| `logto_endpoint` | `LOGTO_ENDPOINT` | no | Logto issuer URL |
| `logto_app_id` | `LOGTO_APP_ID` | no | Logto application ID |
| `logto_app_secret` | `LOGTO_APP_SECRET` | no | Logto application secret |
| `logto_redirect_uri` | `LOGTO_REDIRECT_URI` | no | Logto callback URL |

Optional non-secret stack variables from `compose.prod.yaml`:

| Variable | Default | Purpose |
|---|---:|---|
| `IMAGE_TAG` | `prod` | Docker image tag |
| `BACKEND_REPLICAS` | `1` | Backend Swarm replicas |
| `FRONTEND_REPLICAS` | `1` | Frontend Swarm replicas |
| `BACKEND_PORT` | `3101` | Host port for the API |
| `FRONTEND_PORT` | `3100` | Host port for the web app |
| `READING_DATA_VOLUME` | `latopis-nechrubelski-prod_reading_data` | Named volume for SQLite reading-session data |

Woodpecker must run on a Swarm manager with access to `/var/run/docker.sock`. The external Docker network `rpg-network` must exist. Caddy should proxy the public site to frontend port `3100` and `/api` to backend port `3101`.
