import { fileURLToPath, URL } from "node:url";
import { reactRouter } from "@react-router/dev/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";

const release = process.env.SENTRY_RELEASE?.trim() || "latopis-nechrubelski@dev";
const hasSourceMapUpload = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT,
);

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    reactRouter(),
    ...(hasSourceMapUpload
      ? [
          sentryVitePlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            url: process.env.SENTRY_URL,
            telemetry: false,
            // The plugin only logs upload failures by default; fail the build so a release never ships unmapped.
            errorHandler: (err) => {
              throw err;
            },
            release: { name: release, setCommits: false },
            sourcemaps: {
              assets: "./build/client/**",
              filesToDeleteAfterUpload: "./build/**/*.map",
            },
          }),
        ]
      : []),
  ],
  define: {
    "import.meta.env.VITE_SENTRY_RELEASE": JSON.stringify(release),
  },
  build: {
    // Hidden: maps exist only to be uploaded to GlitchTip, never referenced or served. The server bundle never gets any.
    sourcemap: hasSourceMapUpload && !isSsrBuild ? "hidden" : false,
  },
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": process.env.VITE_BACKEND_PROXY_TARGET ?? "http://localhost:3141",
    },
    watch: {
      usePolling: true,
    },
  },
}));
