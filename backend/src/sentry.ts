import * as Sentry from "@sentry/node";
import type { ErrorEvent } from "@sentry/node";

const SENSITIVE_HEADERS = new Set(["authorization", "cookie", "set-cookie", "csrf-token", "x-csrf-token"]);
const MONITOR_TOKEN_PATH = /(\/api\/monitor\/)[^/?#\s]+/g;

/** Strips credentials and the monitor-link token (a capability secret) from an event before it leaves the process. */
export function redactEvent(event: ErrorEvent): ErrorEvent {
  const { request } = event;
  if (request?.headers) {
    for (const name of Object.keys(request.headers)) {
      if (SENSITIVE_HEADERS.has(name.toLowerCase())) delete request.headers[name];
    }
  }
  if (request) {
    delete request.cookies;
    if (request.url) request.url = request.url.replace(MONITOR_TOKEN_PATH, "$1[redacted]");
  }
  if (event.transaction) event.transaction = event.transaction.replace(MONITOR_TOKEN_PATH, "$1[redacted]");
  return event;
}

/** Reports to GlitchTip (Sentry-compatible); a no-op until GLITCHTIP_DSN is set. */
export function initErrorReporting() {
  const dsn = process.env.GLITCHTIP_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.01,
    initialScope: { tags: { source: "backend" } },
    beforeSend: redactEvent,
    // GlitchTip does not support sessions.
    integrations: (defaults) => defaults.filter((integration) => integration.name !== "ProcessSession"),
  });
}

export { Sentry };
