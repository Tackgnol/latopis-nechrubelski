@AGENTS.md

## Project notes (latopis-nechrubelski)

Notes the universal standard asks each app to record. Standard entries are in AGENTS.md; this section wins where it says so.

- **Routing mode (STD-007):** React Router **framework mode** (`ssr: true`, prerendered psalm pages, `frontend/react-router.config.ts`). `frontend/app/routes/` holds the route modules and acts as the pages layer's routing shell; the page components themselves live in `components/pages/`.
- **Component levels (STD-003):** `frontend/app/components/{atoms,molecules,organisms,templates,pages}/<Name>/`. Import direction is enforced by `npm run lint` (`no-restricted-imports`); molecules do not import other molecules. Shared component types live in `components/models.ts`.
- **Lint parser (STD-002/003):** ESLint parses TS via `@babel/eslint-parser`, not typescript-eslint, because typescript-eslint rejects TypeScript 7. Type checking stays with `tsc`. Switch back once typescript-eslint supports TS >= 7.1. As a consequence there is no `no-explicit-any` lint rule; STD-005 is a review check.
- **Icons (STD-003):** the app uses no icons today (the torn-button underline is an SVG shape, not an icon), so no HeroIcons dependency yet. Add `@heroicons/react` behind an atom when one is needed.
- **Not used yet (STD-007):** React Hook Form (no forms) and `analytics` (no tracked events). Add them with the first form / first event.
- **Error reporting:** Sentry SDKs -> GlitchTip, one project, events tagged `source: backend|frontend`. Browser events are proxied through the backend's `POST /api/tunnel` (`backend/src/routes/tunnel.ts`, behind CSRF, 60/min per visitor); the tunnel only accepts the project in `GLITCHTIP_DSN` and pins that DSN's key server-side. The frontend transport in `lib/error-reporting.ts` fetches a CSRF token per send. Backend reads `GLITCHTIP_DSN` at runtime; the frontend reads it at build time as `VITE_GLITCHTIP_DSN` (pages are prerendered). The browser bundle only carries a placeholder key (`https://tunnel@…`, derived in `deploy.yaml`); the real key stays server-side. Backend events are redacted in `backend/src/sentry.ts` (auth/cookie/CSRF headers, and the monitor token in `/api/monitor/:token`). Both are no-ops when unset; the tunnel route is only registered when the DSN is set.
- **Rate limiting (STD-001):** `backend/src/client-ip.ts` is the `keyGenerator`, wired in `backend/src/server.ts` at 300 req/min per visitor.
- **React Doctor (STD-009):** baseline before the standard was applied: **79**. Current: **84**. Floor 80, never regress; enforced by the `react-doctor` step in `.woodpecker/verify.yaml`. Accepted findings:
  - `query-mutation-missing-invalidation` on the roll/reset mutations in `BookPage`: no query cache depends on them (audio cues are static files), so there is nothing to invalidate.
  - `no-adjust-state-on-prop-change` on the external-navigation effect in `BookPage`: the book must snap to the route's psalm on back/forward but not on its own navigation, which needs the effect plus `pendingSelfNav`.
