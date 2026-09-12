Type: task
Status: resolved

## Question

The map commits to React Router 8 for the frontend. `@tackgnol/rpgtools-shared-auth` peer-depends on `react@^19.2.8`, `react-hook-form@^7.0.0`, and `@hookform/resolvers@^5.0.0` (checked at `C:\Users\Adam\WebstormProjects\rpgtools-shared-auth\package.json`); `@tackgnol/rpg-tools-roller` has no React dependency at all.

Verify React Router 8's required React version (and any other peer requirements it imposes) is satisfied by what `rpgtools-shared-auth` currently supports. If there's a mismatch, either:

- bump/patch `rpgtools-shared-auth`'s peer/dev dependency ranges (and confirm its test suite still passes), or
- record the exact incompatibility and the minimal version bump needed, so it can be fixed before the build phase starts.

`rpg-tools-roller` is expected to need no changes (it has no React/frontend dependency) — confirm that assumption holds.

## Answer

No mismatch, no bump needed.

- `react-router@8.x` (checked 8.0.0-8.3.1 on npm) peer-requires `react`/`react-dom` `>=19.2.7`. `rpgtools-shared-auth` peer-depends on `react@^19.2.8`, which satisfies that.
- `@react-router/dev@8.x` additionally peer-requires `typescript@^5.1.0 || ^6.0.0 || ^7.0.0` (as of 8.3.x) and `vite@^7.0.0 || ^8.0.0`; `rpgtools-shared-auth` devDependency is `typescript@^7.0.2`, satisfied.
- `@react-router/node`/`@react-router/serve@8.x` only peer-require matching `react-router` + `typescript` ranges, already covered above.
- `react-hook-form`/`@hookform/resolvers` are irrelevant to React Router's peer graph (RR8 doesn't touch them), so `rpgtools-shared-auth`'s existing `^7.0.0`/`^5.0.0` ranges need no change either.
- `rpg-tools-roller`'s `package.json` confirms the assumption: no `react`/`react-dom`/`react-router` dependency anywhere, peer or otherwise (only `better-sqlite3` and `fastify`, both optional peers). No changes needed.

Confirmed via `npm view react-router@8/8.0.0-8.3.1 peerDependencies`, `npm view @react-router/dev@8 peerDependencies`, `npm view @react-router/node@8 peerDependencies`, `npm view @react-router/serve@8 peerDependencies`, and reading both libraries' `package.json` directly.
