import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// Port 5500 matches the backend's default CORS_ORIGINS.
export default defineConfig({
  plugins: [react()],
  server: {port: 5500},
  preview: {port: 5500},
  // all 20 courses ship inside the bundle, so the main chunk is large by design
  build: {chunkSizeWarningLimit: 900}
});
