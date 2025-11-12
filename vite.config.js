import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";

function htmlPartials() {
  return {
    name: "html-partials",
    transformIndexHtml(html, ctx) {
      const root = ctx?.server?.config?.root || process.cwd();
      return html.replace(/<!--#include file="([^"]+)" -->/g, (_, p) => {
        const abs = resolve(p.startsWith("/") ? join(root, p) : join(root, p));
        return readFileSync(abs, "utf8");
      });
    },
    handleHotUpdate(ctx) {
      if (ctx.file.includes("/components/")) {
        ctx.server.ws.send({ type: "full-reload" });
      }
    },
  };
}

export default defineConfig({
  plugins: [htmlPartials()],
});
