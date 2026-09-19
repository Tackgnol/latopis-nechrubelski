import type { ErrorEvent } from "@sentry/node";
import { describe, expect, it } from "vitest";
import { redactEvent } from "./sentry.js";

describe("redactEvent", () => {
  it("drops credential headers and cookies but keeps harmless ones", () => {
    const event = {
      request: {
        headers: { Cookie: "session=abc", "CSRF-Token": "t", Authorization: "Bearer x", "user-agent": "curl" },
        cookies: { session: "abc" },
      },
    } as unknown as ErrorEvent;

    const { request } = redactEvent(event);
    expect(request?.headers).toEqual({ "user-agent": "curl" });
    expect(request?.cookies).toBeUndefined();
  });

  it("hides the monitor token in the url and transaction", () => {
    const event = {
      transaction: "GET /api/monitor/01ARZ3NDEKTSV4RRFFQ69G5FAV",
      request: { url: "https://miseries.rpgtools.co/api/monitor/01ARZ3NDEKTSV4RRFFQ69G5FAV?x=1" },
    } as ErrorEvent;

    const redacted = redactEvent(event);
    expect(redacted.request?.url).toBe("https://miseries.rpgtools.co/api/monitor/[redacted]?x=1");
    expect(redacted.transaction).toBe("GET /api/monitor/[redacted]");
  });

  it("passes events without a request through untouched", () => {
    expect(redactEvent({ message: "hi" } as ErrorEvent)).toEqual({ message: "hi" });
  });
});
