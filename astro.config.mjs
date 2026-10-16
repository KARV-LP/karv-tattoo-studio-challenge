import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  // Preserva o tratamento de espaços do Astro 5/6 após a migração para o Astro 7.
  compressHTML: true,
  build: {
    assets: "_assets"
  }
});
