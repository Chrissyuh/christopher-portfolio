import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import { buildPortfolioStructuredData } from "./src/content/structuredData.js";
import { buildStaticSummary } from "./src/content/staticSummary.js";

const contentUrl = new URL("./src/content/portfolioContent.generated.json", import.meta.url);

const machineReadableDevRoutes = new Map([
  ["/portfolio.json", "/machine-readable-base/portfolio.json"],
  ["/llms.txt", "/machine-readable-base/llms.txt"],
  ["/llms-full.txt", "/machine-readable-base/llms-full.txt"],
]);

function machineReadableDevFallback() {
  function installMiddleware(server) {
    server.middlewares.use((request, response, next) => {
      const requestUrl = new URL(request.url || "/", "http://localhost");
      const fallbackPath = machineReadableDevRoutes.get(requestUrl.pathname);
      if (!fallbackPath) {
        next();
        return;
      }

      response.setHeader("X-Duolingo-Streak-Source", "snapshot");
      request.url = `${fallbackPath}${requestUrl.search}`;
      next();
    });
  }

  return {
    name: "portfolio-machine-readable-dev-fallback",
    configureServer: installMiddleware,
    configurePreviewServer: installMiddleware,
  };
}

function portfolioMetadata() {
  return {
    name: "portfolio-machine-metadata",
    transformIndexHtml(html) {
      const content = JSON.parse(fs.readFileSync(contentUrl, "utf8"));
      const structuredData = JSON.stringify(buildPortfolioStructuredData(content)).replaceAll("</", "<\\/");

      return html
        .replace(
          "<!-- portfolio-structured-data -->",
          `<script type="application/ld+json" id="portfolio-structured-data">${structuredData}</script>`,
        )
        .replace("<!-- portfolio-static-fallback -->", buildStaticSummary(content));
    },
  };
}

export default defineConfig({
  plugins: [machineReadableDevFallback(), portfolioMetadata(), react(), tailwindcss()],
});
