import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://karv-tattoo-studio-challenge.netlify.app",
  build: {
    assets: "_assets"
  }
});
