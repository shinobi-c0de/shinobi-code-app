import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  optimizeDeps: { exclude: ["pyodide"] },
  plugins: [
    wasm(),
    topLevelAwait(),
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Access-Control-Allow-Origin' : '*'
    }
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true } // Change
  }
});