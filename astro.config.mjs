// @ts-check import { defineConfig } from "astro/config"; import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://jimiaki7.github.io",
  base: "jimiaki7",
  integrations: [mdx(), sitemap()],
});
