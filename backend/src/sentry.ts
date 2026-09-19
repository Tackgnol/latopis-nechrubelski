import * as Sentry from "@sentry/node";

/** Reports to GlitchTip (Sentry-compatible); a no-op until GLITCHTIP_DSN is set. */
export function initErrorReporting() {
  const dsn = process.env.GLITCHTIP_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.01,
    initialScope: { tags: { source: "backend" } },
    // GlitchTip does not support sessions.
    integrations: (defaults) => defaults.filter((integration) => integration.name !== "ProcessSession"),
  });
}

export { Sentry };
