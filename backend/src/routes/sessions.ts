import { z } from "zod";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  getCurrentReadingSession,
  getOrCreateReadingSession,
  getReadingSessionByMonitorToken,
  resetReadingSession,
} from "../reading-sessions.js";
import { revealedPsalmVerses } from "../roller.js";
import { FINAL_PSALM, pickFromPool, remainingPsalms } from "../psalm-pool.js";

async function ensureAuthUserId(
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<string> {
  if (request.appSession?.user) return request.appSession.user.id;
  const response = await fastify.auth.api.signInAnonymous({
    headers: new Headers(
      Object.entries(request.headers).flatMap(([name, value]): [string, string][] =>
        value === undefined ? [] : [[name, Array.isArray(value) ? value.join(", ") : value]],
      ),
    ),
    asResponse: true,
  });
  const setCookies = response.headers.getSetCookie?.() ?? [];
  if (setCookies.length > 0) reply.header("set-cookie", setCookies);
  const body = (await response.json()) as { user: { id: string } };
  return body.user.id;
}

const monitorParams = z.object({ token: z.string().length(26) });

export default async function sessionRoutes(fastify: FastifyInstance) {
  fastify.post("/api/sessions/roll", async (request, reply) => {
    const authUserId = await ensureAuthUserId(fastify, request, reply);
    const session = getOrCreateReadingSession(authUserId);
    const revealed = await revealedPsalmVerses(session.rollerSessionId);
    const remaining = remainingPsalms(revealed.map((r) => r.psalm));

    if (remaining.length === 0) {
      return reply.status(409).send({ error: "all-revealed" });
    }

    const psalmRoll = await fastify.roller.roll(`1d${remaining.length}`, {
      sessionId: session.rollerSessionId,
      actor: authUserId,
      tags: ["psalm-pick"],
    });
    const psalm = pickFromPool(remaining, psalmRoll.total);
    const verseRoll = await fastify.roller.roll("1d6", {
      sessionId: session.rollerSessionId,
      actor: authUserId,
      tags: ["psalm-reveal"],
      meta: { psalm },
    });

    return { psalm, verse: verseRoll.total, reveal: Math.min(revealed.length + 1, FINAL_PSALM) };
  });

  fastify.post("/api/sessions/reveal-end", async (request, reply) => {
    const authUserId = await ensureAuthUserId(fastify, request, reply);
    const session = getOrCreateReadingSession(authUserId);
    const revealed = await revealedPsalmVerses(session.rollerSessionId);

    if (remainingPsalms(revealed.map((r) => r.psalm)).length > 0) {
      return reply.status(409).send({ error: "not-all-revealed" });
    }

    await fastify.roller.roll("1d1", {
      sessionId: session.rollerSessionId,
      actor: authUserId,
      tags: ["psalm-reveal"],
      meta: { psalm: FINAL_PSALM, verse: FINAL_PSALM },
    });

    return { psalm: FINAL_PSALM, verse: FINAL_PSALM, reveal: Math.min(revealed.length + 1, FINAL_PSALM) };
  });

  fastify.get("/api/sessions/me", async (request) => {
    const authUserId = request.appSession?.user?.id;
    const session = authUserId ? getCurrentReadingSession(authUserId) : null;
    if (!session) return { started: false, revealed: [] };
    return { started: true, monitorToken: session.monitorToken, revealed: await revealedPsalmVerses(session.rollerSessionId) };
  });

  fastify.post("/api/sessions/reset", async (request, reply) => {
    const authUserId = await ensureAuthUserId(fastify, request, reply);
    const session = resetReadingSession(authUserId);
    return { monitorToken: session.monitorToken };
  });

  fastify.get("/api/monitor/:token", async (request, reply) => {
    const params = monitorParams.safeParse(request.params);
    const session = params.success ? getReadingSessionByMonitorToken(params.data.token) : null;
    if (!session) return reply.status(404).send({ error: "Unknown monitor link." });
    return { revealed: await revealedPsalmVerses(session.rollerSessionId) };
  });
}
