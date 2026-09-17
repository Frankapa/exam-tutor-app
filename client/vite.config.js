import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During local development, proxy /api requests to the Express server
// so the frontend can just call fetch("/api/...") without worrying about ports.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
