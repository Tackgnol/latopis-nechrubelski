Type: grilling
Status: resolved

## Question

The map commits to: a GM's Better Auth session (anonymous or named) doubling as the identity for a persistent "reading session"; the session tracks which of Psalms I-VI have been revealed (to drive roll-pool exclusion and to gate the "Reveal the End" / Psalm VII action); and a shareable, read-only "monitor" view that polls for updates in v1.

Decide the concrete shape:

- SQLite schema: a `reading_sessions` (or similar) table keyed by the auth session/user id, plus how "revealed psalms" are stored (a join/array table vs. a bitmask/JSON column) — keep it as simple as the roller's own `SqliteRollLogStore` adapter pattern.
- The monitor's shareable identifier: a separate unguessable token/slug (matching the ecosystem's existing invite-token/claim-code pattern) rather than exposing the GM's own auth session id in a public URL.
- What "starting a session" means in the UI/flow: implicit on first roll, or an explicit action; and what "resetting" a session (e.g. after Psalm VII is revealed and a new campaign begins) does to the stored state.
- Polling cadence/mechanism for the monitor view (plain interval refetch via a React Router revalidator, vs. something fancier) — stay the smallest thing that works, per the map's decision to defer real-time push.
- Whether/how the roller's own roll log (from ticket-independent server-side rolls) and this session's "revealed psalms" state relate — are they the same record, or does the session state derive from querying the roll log for this session's already-executed psalm rolls?

## Answer

Confirmed after inspecting `rpg-tools-roller`'s actual `SqliteRollLogStore`: it already has an append-only `log_entries` table with a free-form `session_id`, `tags`, and arbitrary `meta` JSON, plus a `list({ sessionId, tags })` query — most of this ticket collapses into reusing that rather than building new state.

- **Revealed psalms are not stored separately** — derived by tagging every reveal-roll `tags: ['psalm-reveal']`, `meta: { psalm, verse }`, then querying `list({ sessionId, tags: ['psalm-reveal'] })` and deduping `meta.psalm`. It's the same record as the roller's own roll log, not a copy.
- **Own schema** is one thin mapping table: `reading_sessions(id, auth_session_id, roller_session_id, monitor_token, created_at)`. `auth_session_id` is the Better Auth (anonymous or named) session/user id, used to resume a GM's session on return visits. `roller_session_id` is the free-form string passed as the roller's `sessionId`.
- **Monitor token**: an opaque `ulid` in `monitor_token` (the roller already depends on `ulid`, no new dependency needed), exposed at a route like `/monitor/<token>` — never the GM's own auth session id in a public URL.
- **Start/reset**: starting is implicit — the `reading_sessions` row is created lazily on the GM's first roll, no explicit "start" action. Resetting (after Psalm VII is revealed, or the GM choosing to start a new campaign early) mints a **brand-new row** (fresh `roller_session_id` + fresh `monitor_token`) rather than mutating the old one, since the roll log is append-only — the finished campaign's history and its monitor link simply freeze in place. Reset is gated behind an "are you sure" confirmation in the UI since it's a one-way branch onto a new row.
- **Monitor polling**: plain interval-based revalidator refetch (a few seconds) on the monitor route — no SSE/websockets in v1, matching the map's deferred-real-time-push decision.
