import Fastify from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import tunnelRoutes from "./tunnel.js";

const DSN = "https://serverkey@glitchtip.example.test/9";
const envelope = (dsn: string) => `${JSON.stringify({ dsn })}\n{"type":"event"}\n{}`;

async function buildApp() {
  const app = Fastify();
  await app.register(tunnelRoutes, { dsn: DSN });
  return app;
}

const post = (app: Awaited<ReturnType<typeof buildApp>>, body: string, contentType: string) =>
  app.inject({ method: "POST", url: "/api/tunnel", headers: { "content-type": contentType }, payload: body });

afterEach(() => vi.unstubAllGlobals());

describe("tunnel", () => {
  it("relays the envelope upstream with the server's key, whatever key the client used", async () => {
    const upstream = vi.fn(async (..._args: [string, RequestInit]) => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", upstream);
    const app = await buildApp();

    for (const contentType of ["application/x-sentry-envelope", "text/plain;charset=UTF-8"]) {
      const res = await post(app, envelope("https://clientkey@glitchtip.example.test/9"), contentType);
      expect(res.statusCode).toBe(200);
    }

    const [url, init] = upstream.mock.calls[0];
    expect(url).toBe("https://glitchtip.example.test/api/9/envelope/");
    expect((init.headers as Record<string, string>)["x-sentry-auth"]).toContain("sentry_key=serverkey");
    expect(upstream).toHaveBeenCalledTimes(2);
  });

  it("rejects other projects and malformed envelopes without calling upstream", async () => {
    const upstream = vi.fn();
    vi.stubGlobal("fetch", upstream);
    const app = await buildApp();

    expect((await post(app, envelope("https://k@glitchtip.example.test/10"), "text/plain")).statusCode).toBe(400);
    expect((await post(app, "not json\n{}", "text/plain")).statusCode).toBe(400);
    expect((await post(app, "", "text/plain")).statusCode).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("answers 502 when GlitchTip is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    const app = await buildApp();

    expect((await post(app, envelope(DSN), "text/plain")).statusCode).toBe(502);
  });
});
