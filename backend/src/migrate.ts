import { getMigrations } from "better-auth/db/migration";
import { buildServer } from "./server.js";

const fastify = await buildServer();
const { runMigrations, toBeCreated, toBeAdded } = await getMigrations(fastify.auth.options);
console.log(`Creating ${toBeCreated.length} table(s), adding ${toBeAdded.length} column(s)...`);
await runMigrations();
await fastify.close();
console.log("Auth schema migrated.");
