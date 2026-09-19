import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { getMigrations } from "better-auth/db/migration";
import { beforeAll, describe, expect, it } from "vitest";

process.env.DB_PATH = path.join(mkdtempSync(path.join(tmpdir(), "latopis-")), "test.sqlite");
process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret";

let app: Awaited<ReturnType<typeof import("./server.js").buildServer>>;

beforeAll(async () => {
  const { buildServer } = await import("./server.js");
  app = await buildServer();
  await (await getMigrations(app.auth.options)).runMigrations();
});

const remaining = async (visitor: string, peer = "172.18.0.1") => {
  const res = await app.inject({
    method: "GET",
    url: "/api/csrf-token",
    remoteAddress: peer,
    headers: { "cf-connecting-ip": visitor },
  });
  expect(res.statusCode).toBe(200);
  return Number(res.headers["x-ratelimit-remaining"]);
};

describe("per-visitor rate limiting behind Caddy", () => {
  it("counts each Cloudflare client separately even though every request shares one proxy peer", async () => {
    const a1 = await remaining("203.0.113.7");
    const a2 = await remaining("203.0.113.7");
    const b1 = await remaining("203.0.113.8");

    expect(a2).toBe(a1 - 1);
    expect(b1).toBe(a1);
  });

  it("ignores CF-Connecting-IP from a public peer, so it cannot be spoofed", async () => {
    const first = await remaining("203.0.113.9", "198.51.100.5");
    const spoofed = await remaining("203.0.113.10", "198.51.100.5");

    expect(spoofed).toBe(first - 1);
  });
});
