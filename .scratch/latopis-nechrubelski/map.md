Label: wayfinder:map

## Destination

An implementation-ready architecture spec for turning the Latopis Nechrubelski PoC (`PoC.html`) into a production GM tool: React Router 8 (SSR+SSG) frontend, a standalone Fastify backend mounting `@tackgnol/rpgtools-shared-auth` + `@tackgnol/rpg-tools-roller`, multi-language content (i18next, path-prefixed, per-psalm SSG pages), audio with WebVTT-cue verse highlighting, a deep-linkable (`?psalm=4`) fair roll that excludes already-revealed psalms within a persistent GM session, and a shareable read-only monitor view. Reaching the end means every architecture/content decision is locked and nothing is left to decide before a build phase starts.

## Notes

- Domain: a MÖRK BORG-flavored RPG companion app (random "Psalms of the Apocalypse" doom-prophecy reveals) in the wider RPGTools ecosystem.
- Sibling projects on this machine worth zooming into when a ticket touches them:
  - `C:\Users\Adam\WebstormProjects\rpgtools-shared-auth` — auth/session library (Better Auth + Logto, Fastify plugin, headless React). See `docs/superpowers/plans/auth-guilds-react-plan.md` for the proven RR7-SSR + separate-Fastify-backend integration pattern this app should mirror (now RR8).
  - `C:\Users\Adam\WebstormProjects\rpg-tools-roller` — fair dice roller, Fastify plugin + SQLite adapter.
  - `C:\Users\Adam\WebstormProjects\scvmrack` — sibling app with the `party` domain (UUID parties, invite tokens, `party-bus` real-time plugin) this app's GM session is expected to link to in a future effort (not this map).
  - `C:\Users\Adam\WebstormProjects\trackbook-remix-fe` — house convention reference for React Router + i18next usage.
- Every session should call the Skill tool for "grilling" and "domain-modeling" by default when resolving a ticket; call "research" for research-type tickets.
- Deploy target: `miseries.rpgtools.co`, reverse-proxied on the existing `rpgtools.co` Caddy host, same two-service (frontend + Fastify API) pattern as `astro-shelf` and `scvmrack`.

## Decisions so far

- [WebVTT highlight feasibility](issues/01-webvtt-highlight-feasibility.md): skip `<track kind="metadata">`/`cuechange` (unreliable on WebKit/iOS Safari) — drive verse highlighting with `timeupdate` + a hand-rolled JSON `{verse, start}` cue array per psalm/language.
- [React Router 8 peer compat](issues/02-react-router-8-peer-compat.md): no mismatch — `rpgtools-shared-auth`'s existing peer ranges (`react@^19.2.8`, `typescript@^7.0.2`) already satisfy React Router 8's requirements; `rpg-tools-roller` has no React dependency at all. No version bumps needed anywhere.
- [i18next content schema](issues/03-i18next-content-schema.md): one `psalms` namespace; verses stored as a verse-number-keyed map (not an array) so Psalm VII's single `"7"` key needs no special-casing; Arabic numeral is canonical, Roman numeral is a static FE display lookup, not content; locale resources are TS-typed against the Polish resource for compile-time completeness; migration deletes `parseLatopis` and the paste UI in the same change.
- [GM session/monitor model](issues/04-gm-session-monitor-model.md): revealed psalms are derived from the roller's own append-only roll log (tagged `psalm-reveal`, not a separate table); a thin `reading_sessions(id, auth_session_id, roller_session_id, monitor_token, created_at)` table maps a GM's auth session to a roller session and a ulid monitor token; sessions start implicitly on first roll and reset (behind an "are you sure") by minting a fresh row rather than mutating the old one; monitor polls via plain interval revalidation.
- Map scope: plan-only (Wayfinder default) — tickets decide, a later phase builds.
- App shape: standalone app, own repo, its own Fastify backend + SQLite (not folded into another RPGTools app).
- Auth depth: anonymous-first; the Better Auth anonymous session doubles as the GM's reading-session identity, upgradeable later via the library's existing claim-code flow. No feature forces sign-in.
- Roll contract: server-side, via `rpg-tools-roller`'s Fastify plugin — 1d6 over not-yet-revealed Psalms I–VI, then 1d6 for the verse; Psalm VII is excluded from the random pool and reachable only via an explicit "Reveal the End" action once all six are done. Every roll is logged.
- Deep link: `?psalm=N[&lang=]` — no verse component (the PoC's `4:7` example meant "4 of 7 psalms total", not verse 7; dropped). The verse is still resolved by a real, logged roll.
- Content storage: text + audio as files in the repo; verse text authored as typed i18next resources — a locale isn't shipped until its translations are complete, so no runtime "missing translation" fallback UI is needed.
- SEO/rendering: React Router 8 framework mode, prerendering (SSG) one route per psalm for crawlability; i18next path-prefix locale routing (`/pl/psalm/4`, `/en/psalm/4` later), Polish is the default and, for now, only complete locale.
- Frontend/backend split: React Router 8 app + a separate standalone Fastify service (mounting `rpgtoolsSharedAuth` + the roller's `rollerPlugin`) behind `/api/*`, matching the `astro-shelf`/`scvmrack` two-service + Caddy pattern — not a single merged server.
- Audio/highlight sync: one continuous narrated audio file per psalm per language (not per-verse files); verse highlighting driven by playback position, pending [WebVTT cuechange feasibility check](issues/01-webvtt-highlight-feasibility.md).

## Not yet specified

- Future scvmrack `party` link: this app pushing a webhook-style "psalm revealed" event to scvmrack (favored direction over scvmrack polling) once a GM's session can be associated with a real scvmrack party — auth/signing, event schema, and the party-selection UX are all still open, and deliberately not ticketed yet.
- Content/translation rollout timeline beyond Polish (when/whether English or other locales get built out).
- Observability parity with sibling apps (e.g. GlitchTip error monitoring, as used by `scvmrack`) — not yet discussed for this app.

## Out of scope

- Visual/aesthetic polish (styling, transitions, art direction, sourcing/placing the external graphics the PoC already links to) — explicitly deferred to a separate follow-up effort once this map's architecture is built.
