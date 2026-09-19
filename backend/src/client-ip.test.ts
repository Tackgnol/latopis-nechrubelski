import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import { describe, expect, it } from "vitest";
import { clientIp } from "./client-ip.js";

const req = (ip: string, header?: string | string[]) =>
  ({ ip, headers: header === undefined ? {} : { "cf-connecting-ip": header } }) as Parameters<typeof clientIp>[0];

describe("clientIp", () => {
  it("honours CF-Connecting-IP from a private peer", () => {
    expect(clientIp(req("172.18.0.1", "203.0.113.7"))).toBe("203.0.113.7");
    expect(clientIp(req("127.0.0.1", "203.0.113.7"))).toBe("203.0.113.7");
    expect(clientIp(req("::ffff:172.18.0.1", "203.0.113.7"))).toBe("203.0.113.7");
    expect(clientIp(req("fd00::1", "2001:db8::1"))).toBe("2001:db8::1");
  });

  it("ignores the header from a public peer", () => {
    expect(clientIp(req("198.51.100.9", "203.0.113.7"))).toBe("198.51.100.9");
  });

  it("falls back when the header is missing, malformed or repeated", () => {
    expect(clientIp(req("172.18.0.1"))).toBe("172.18.0.1");
    expect(clientIp(req("172.18.0.1", "not-an-ip"))).toBe("172.18.0.1");
    expect(clientIp(req("172.18.0.1", ["203.0.113.7", "203.0.113.8"]))).toBe("172.18.0.1");
  });

  it("gives two visitors behind the same proxy different keys", () => {
    expect(clientIp(req("172.18.0.1", "203.0.113.7"))).not.toBe(clientIp(req("172.18.0.1", "203.0.113.8")));
  });
});

describe("rate limiting with clientIp", () => {
  it("one visitor hitting the limit does not block another", async () => {
    const app = Fastify();
    await app.register(rateLimit, { max: 2, timeWindow: "1 minute", keyGenerator: clientIp });
    app.get("/", async () => "ok");

    const hit = (visitor: string) =>
      app.inject({ method: "GET", url: "/", remoteAddress: "172.18.0.1", headers: { "cf-connecting-ip": visitor } });

    expect((await hit("203.0.113.7")).statusCode).toBe(200);
    expect((await hit("203.0.113.7")).statusCode).toBe(200);
    expect((await hit("203.0.113.7")).statusCode).toBe(429);
    expect((await hit("203.0.113.8")).statusCode).toBe(200);
  });
});
