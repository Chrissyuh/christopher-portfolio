import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import { buildPortfolioStructuredData } from "./src/content/structuredData.js";

const contentUrl = new URL("./src/content/portfolioContent.generated.json", import.meta.url);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildStaticSummary(content) {
  const meta = content.meta ?? {};
  const projects = Array.isArray(content.projects) ? content.projects : [];

  return [
    '<main id="portfolio-static-fallback" aria-label="Christopher Heskett portfolio summary">',
    `  <p>${escapeHtml(meta.heroEyebrow || "Student engineer")}</p>`,
    `  <h1>${escapeHtml(meta.heroTitle || "Christopher Heskett")}</h1>`,
    `  <p>${escapeHtml(meta.heroLead || meta.heroIntro || "Engineering portfolio")}</p>`,
    '  <section aria-labelledby="static-projects-heading">',
    '    <h2 id="static-projects-heading">Featured projects</h2>',
    "    <ul>",
    ...projects.map(
      (project) =>
        `      <li><a href="/#project-${encodeURIComponent(project.id)}">${escapeHtml(project.title)}</a>: ${escapeHtml(project.summary)}</li>`,
    ),
    "    </ul>",
    "  </section>",
    '  <nav aria-label="Machine-readable portfolio">',
    '    <a href="/llms-full.txt">Machine-readable portfolio</a>',
    '    <a href="/portfolio.json">Portfolio JSON</a>',
    "  </nav>",
    "</main>",
  ].join("\n");
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
  plugins: [portfolioMetadata(), react(), tailwindcss()],
});
