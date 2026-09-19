import * as Sentry from "@sentry/react";

/** Reports to GlitchTip (Sentry-compatible); a no-op until VITE_GLITCHTIP_DSN is set at build time. */
export function initErrorReporting() {
  const dsn = import.meta.env.VITE_GLITCHTIP_DSN;
  if (dsn && !Sentry.isInitialized()) Sentry.init({ dsn, environment: import.meta.env.MODE });
}

export { Sentry };
