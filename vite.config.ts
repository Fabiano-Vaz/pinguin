import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/webview",
    emptyOutDir: false,
    lib: {
      entry: "src/webview-entry.ts",
      name: "PenguinWebview",
      formats: ["iife"],
      fileName: () => "webview.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
