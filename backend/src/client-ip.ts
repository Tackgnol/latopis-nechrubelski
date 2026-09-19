import { BlockList, isIP } from "node:net";
import type { FastifyRequest } from "fastify";

const PRIVATE_PEERS = new BlockList();
PRIVATE_PEERS.addSubnet("127.0.0.0", 8, "ipv4");
PRIVATE_PEERS.addSubnet("10.0.0.0", 8, "ipv4");
PRIVATE_PEERS.addSubnet("172.16.0.0", 12, "ipv4");
PRIVATE_PEERS.addSubnet("192.168.0.0", 16, "ipv4");
PRIVATE_PEERS.addAddress("::1", "ipv6");
PRIVATE_PEERS.addSubnet("fc00::", 7, "ipv6");

function isPrivatePeer(address: string): boolean {
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address);
  if (mapped) return PRIVATE_PEERS.check(mapped[1], "ipv4");
  const family = isIP(address);
  return family !== 0 && PRIVATE_PEERS.check(address, family === 4 ? "ipv4" : "ipv6");
}

/**
 * Real client address for rate limiting: Cloudflare's `CF-Connecting-IP`, trusted only when the
 * socket peer is private/loopback (our Caddy); otherwise the peer address itself.
 */
export function clientIp(request: Pick<FastifyRequest, "ip" | "headers">): string {
  const header = request.headers["cf-connecting-ip"];
  const forwarded = typeof header === "string" ? header.trim() : "";
  if (forwarded && isIP(forwarded) && isPrivatePeer(request.ip)) return forwarded;
  return request.ip;
}
