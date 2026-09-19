import * as Sentry from "@sentry/react";
import { makeFetchTransport } from "@sentry/react";
import { csrfToken } from "~/lib/api";

/**
 * Reports to GlitchTip through the backend's /api/tunnel (which sits behind CSRF protection);
 * a no-op until VITE_GLITCHTIP_DSN is set at build time.
 */
export function initErrorReporting() {
  const dsn = import.meta.env.VITE_GLITCHTIP_DSN;
  if (!dsn || Sentry.isInitialized()) return;

  Sentry.init({
    dsn,
    tunnel: "/api/tunnel",
    release: import.meta.env.VITE_SENTRY_RELEASE,
    environment: import.meta.env.MODE,
    initialScope: { tags: { source: "frontend" } },
    // GlitchTip does not support sessions.
    integrations: (defaults) => defaults.filter((integration) => integration.name !== "BrowserSession"),
    transport: (options) =>
      makeFetchTransport(options, async (url, init) => {
        const send = async () =>
          fetch(url, { ...init, headers: { ...init?.headers, "csrf-token": await csrfToken() } });
        const response = await send();
        return response.status === 403 ? send() : response;
      }),
  });
}

export { Sentry };
