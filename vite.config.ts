import path from "path"
import react from "@vitejs/plugin-react"
import mdx from "@mdx-js/rollup"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mdx()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
