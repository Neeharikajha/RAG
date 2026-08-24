import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Proxies /api/* to the backend during dev so the frontend can call
  // relative paths (e.g. fetch('/api/documents')) without CORS issues.
  server: {
    proxy: { "/api": "http://localhost:3001" },
  },
});
