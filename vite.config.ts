import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En GitHub Pages el sitio vive en https://<usuario>.github.io/<repo>/ ; el workflow define BASE_PATH=/<repo>/.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH ?? "/"
});
