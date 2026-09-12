import Fastify from "fastify";
import { rpgtoolsSharedAuth } from "@tackgnol/rpgtools-shared-auth";
import { rollerPlugin } from "@tackgnol/rpg-tools-roller/fastify";
import { db } from "./db.js";
import { rollLogStore } from "./roller.js";
import sessionRoutes from "./routes/sessions.js";

export async function buildServer() {
  const fastify = Fastify({ logger: true });

  await fastify.register(rpgtoolsSharedAuth, {
    database: db,
    trustedOrigins: (process.env.TRUSTED_ORIGINS ?? "http://localhost:5173").split(","),
  });

  await fastify.register(rollerPlugin, { store: rollLogStore });

  await fastify.register(sessionRoutes);

  return fastify;
}
