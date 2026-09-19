import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const build = fileURLToPath(new URL("../build/", import.meta.url));
const monitoringEnabled = Boolean(process.env.VITE_GLITCHTIP_DSN);
const uploadConfigured = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT,
);

if (monitoringEnabled && !uploadConfigured) {
  throw new Error(
    "Frontend monitoring requires SENTRY_AUTH_TOKEN, SENTRY_ORG and SENTRY_PROJECT so production traces can be source mapped.",
  );
}

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(target) : [target];
    }),
  );
  return nested.flat();
}

const files = await filesBelow(build);

const maps = files.filter((file) => file.endsWith(".map"));
if (maps.length > 0) throw new Error(`Source maps remain in the build artifact: ${maps.join(", ")}`);

const scripts = await Promise.all(
  files.filter((file) => file.endsWith(".js")).map(async (file) => [file, await readFile(file, "utf8")]),
);

const referencing = scripts.filter(([, code]) => code.includes("sourceMappingURL=")).map(([file]) => file);
if (referencing.length > 0) throw new Error(`Bundles still reference a source map: ${referencing.join(", ")}`);

if (uploadConfigured && !scripts.some(([, code]) => code.includes("sentry-dbid-"))) {
  throw new Error("No Sentry debug ID was found in the frontend bundles.");
}

console.log(
  `Monitoring artifact verified: sourceMapsPublic=0, upload=${uploadConfigured ? "configured" : "disabled"}`,
);
