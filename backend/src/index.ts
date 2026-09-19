import { initErrorReporting } from "./sentry.js";

initErrorReporting();

const { buildServer } = await import("./server.js");
const fastify = await buildServer();
const port = Number(process.env.PORT ?? 3141);

await fastify.listen({ port, host: "0.0.0.0" });
