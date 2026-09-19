import Fastify from "fastify";
import { rpgtoolsSharedAuth } from "@tackgnol/rpgtools-shared-auth";
import { rollerPlugin } from "@tackgnol/rpg-tools-roller/fastify";
import { Sentry } from "./sentry.js";
import { clientIp } from "./client-ip.js";
import { db } from "./db.js";
import { rollLogStore } from "./roller.js";
import sessionRoutes from "./routes/sessions.js";

export async function buildServer() {
  const fastify = Fastify({ logger: true });

  await fastify.register(rpgtoolsSharedAuth, {
    database: db,
    security: {
      rateLimit: { max: process.env.NODE_ENV === "test" ? 10000 : 300, keyGenerator: clientIp },
    },
    trustedOrigins: (process.env.TRUSTED_ORIGINS ?? "http://localhost:5173").split(","),
  });

  await fastify.register(rollerPlugin, { store: rollLogStore });

  await fastify.register(sessionRoutes);

  Sentry.setupFastifyErrorHandler(fastify);

  return fastify;
}
