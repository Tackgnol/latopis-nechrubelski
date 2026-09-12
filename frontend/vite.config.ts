import { fileURLToPath, URL } from "node:url";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": process.env.VITE_BACKEND_PROXY_TARGET ?? "http://localhost:3141",
    },
  },
});
