import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

export default defineConfig({
  output: 'server',
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: "cloudflare",
  }),
});
