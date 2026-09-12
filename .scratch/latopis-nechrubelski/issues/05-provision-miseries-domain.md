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
