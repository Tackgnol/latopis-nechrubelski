import * as Sentry from "@sentry/node";

/** Reports to GlitchTip (Sentry-compatible); a no-op until GLITCHTIP_DSN is set. */
export function initErrorReporting() {
  const dsn = process.env.GLITCHTIP_DSN;
  if (dsn) Sentry.init({ dsn, environment: process.env.NODE_ENV });
}

export { Sentry };
