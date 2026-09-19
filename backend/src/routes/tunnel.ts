import type { FastifyInstance } from "fastify";
import { z } from "zod";

const envelopeHeader = z.object({ dsn: z.string() });

/** Project id from a DSN, or null if it isn't a parseable DSN. */
function dsnProjectId(dsn: string): string | null {
  try {
    return new URL(dsn).pathname.replace(/^\/+/, "") || null;
  } catch {
    return null;
  }
}

/**
 * Relays browser Sentry envelopes to GlitchTip so the frontend never talks to it directly.
 * Only the configured project is accepted and the auth key is pinned to the server's DSN.
 */
export default async function tunnelRoutes(fastify: FastifyInstance, { dsn }: { dsn: string }) {
  const upstream = new URL(dsn);
  const projectId = dsnProjectId(dsn);
  if (!projectId) throw new Error("GLITCHTIP_DSN has no project id");
  const endpoint = `${upstream.origin}/api/${projectId}/envelope/`;
  const auth = `Sentry sentry_version=7, sentry_key=${upstream.username}, sentry_client=latopis-tunnel/1.0`;

  fastify.addContentTypeParser("application/x-sentry-envelope", { parseAs: "string" }, (_req, body, done) =>
    done(null, body),
  );

  fastify.post(
    "/api/tunnel",
    { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const envelope = request.body;
      const headerLine = typeof envelope === "string" ? envelope.split("\n", 1)[0] : "";
      let header: z.infer<typeof envelopeHeader>;
      try {
        header = envelopeHeader.parse(JSON.parse(headerLine));
      } catch {
        return reply.status(400).send({ error: "Invalid Sentry envelope." });
      }
      if (dsnProjectId(header.dsn) !== projectId) {
        return reply.status(400).send({ error: "Unknown Sentry project." });
      }

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/x-sentry-envelope", "x-sentry-auth": auth },
          body: envelope as string,
        });
        return reply
          .code(response.status)
          .type(response.headers.get("content-type") ?? "application/json")
          .send(await response.text());
      } catch (err) {
        request.log.warn({ err }, "GlitchTip tunnel upstream failed");
        return reply.status(502).send({ error: "GlitchTip unreachable." });
      }
    },
  );
}
