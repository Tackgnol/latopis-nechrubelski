Type: task
Status: open

## Question

The map commits to deploying at `miseries.rpgtools.co`, on the existing `rpgtools.co` Caddy host, following the same pattern documented for `astro-shelf` (`docs/superpowers/plans/auth-guilds-react-plan.md` in `rpgtools-shared-auth`) and used by `scvmrack` (see its `Caddyfile.example`, `compose.prod.yaml`).

This is infra access only the human has. Checklist to hand back once done (the answer should record what was actually done and any resulting facts later tickets/the build phase depend on):

- [ ] DNS: `miseries.rpgtools.co` pointed at the host running Caddy for `rpgtools.co`.
- [ ] Caddy: a new site block (or addition to the existing one) reverse-proxying `/api/*` to the new Fastify backend's local port, serving the React Router 8 build otherwise — confirm the exact backend port to use (pick one not already claimed by `scvmrack` (3031) or the shelf backend (3041)).
- [ ] Logto: register a new Logto application (or confirm reuse of an existing one) for this app, and record its endpoint/app id/redirect URI.
- [ ] Woodpecker: add the `NPMRC_CONTENT` secret (for pulling `@tackgnol/*` private packages) and any new deploy secrets this app's CI needs, following the `rpgtools-shared-auth` README's Woodpecker section.

## Answer

_(recorded on resolution)_

Repo-side scaffolding is now in place, ports picked from the live Caddyfile
(free below 3100: `3100` frontend, `3101` backend — nothing else on the host
claims either):

- `backend/Dockerfile`, `frontend/Dockerfile`
- `compose.prod.yaml` (Docker Swarm stack; single SQLite file on a named
  volume, no separate db service), `compose.build.yaml` (BuildKit npmrc secret)
- `Caddyfile.example` (`miseries.rpgtools.co`, ports 3100/3101, mirrors the
  bladerack/trenchrats pattern)
- `.woodpecker/verify.yaml`, `.woodpecker/deploy.yaml`

Still only the human can do:

- [ ] DNS: point `miseries.rpgtools.co` at the Caddy host.
- [ ] Caddy: paste `Caddyfile.example`'s block into the host's live Caddyfile, reload.
- [ ] Logto: register an app, or skip — the backend runs anonymous-only auth
      if `LOGTO_*` env vars are left unset.
- [ ] Woodpecker: add the secrets listed at the top of `.woodpecker/deploy.yaml`
      (`npmrc_content`, `better_auth_secret`, `trusted_origins`, `auth_base_url`,
      and the optional `logto_*` ones).
