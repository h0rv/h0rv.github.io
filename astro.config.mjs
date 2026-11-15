import { defineConfig } from "astro/config";
import designMode from "./src/dev/integration.mjs";

export default defineConfig({
  site: "https://horv.co",
  // /buquet.astro -> /buquet.html, /resume/index.astro -> /resume/index.html (same URLs as the old site)
  build: { format: "preserve" },
  markdown: { shikiConfig: { theme: "github-dark-default" } },
  devToolbar: { enabled: false },
  integrations: [designMode()],
});
