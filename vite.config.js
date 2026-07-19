import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import { buildPortfolioStructuredData } from "./src/content/structuredData.js";
import { buildStaticSummary } from "./src/content/staticSummary.js";

const contentUrl = new URL("./src/content/portfolioContent.generated.json", import.meta.url);

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
  plugins: [portfolioMetadata(), react(), tailwindcss()],
});
