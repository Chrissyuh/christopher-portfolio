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
  const academics = Array.isArray(content.academics) ? content.academics : [];
  const academicDetails = Array.isArray(content.academicDetails) ? content.academicDetails : [];
  const credentials = Array.isArray(content.programCredentials) ? content.programCredentials : [];
  const smallProjects = Array.isArray(content.smallProjects) ? content.smallProjects : [];
  const microProjects = Array.isArray(content.microProjects) ? content.microProjects : [];
  const learningHighlights = Array.isArray(content.learningHighlights) ? content.learningHighlights : [];
  const fullRecord = Array.isArray(content.fullRecord) ? content.fullRecord : [];

  function credentialText(credential) {
    const award = credential.awardTitle
      ? ` ${credential.awardDate} ${credential.awardTitle}${credential.awardDistinction ? ` - ${credential.awardDistinction}` : ""}. ${credential.awardSummary}${credential.awardQuote ? ` ${credential.awardQuoteAttribution || "Program staff"}: "${credential.awardQuote}"` : ""}`
      : "";
    return `${credential.summary}${award}`;
  }

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
    '  <section aria-labelledby="static-academics-heading">',
    '    <h2 id="static-academics-heading">Academics</h2>',
    "    <ul>",
    ...academics.map((item) => `      <li>${escapeHtml(item.label)}: ${escapeHtml(item.value)}${item.note ? ` - ${escapeHtml(item.note)}` : ""}</li>`),
    "    </ul>",
    "    <details>",
    "      <summary>Academic details</summary>",
    "      <ul>",
    ...academicDetails.map((item) => `        <li>${escapeHtml(item.label)}: ${escapeHtml(item.value)}${item.note ? ` - ${escapeHtml(item.note)}` : ""}</li>`),
    "      </ul>",
    "    </details>",
    "  </section>",
    '  <section aria-labelledby="static-programs-heading">',
    '    <h2 id="static-programs-heading">Programs and credentials</h2>',
    "    <ul>",
    ...credentials.map((credential) => `      <li>${credential.href ? `<a href="${escapeHtml(credential.href)}">${escapeHtml(credential.program)}</a>` : escapeHtml(credential.program)}: ${escapeHtml(credentialText(credential))}</li>`),
    "    </ul>",
    "  </section>",
    '  <section aria-labelledby="static-more-projects-heading">',
    '    <h2 id="static-more-projects-heading">More projects</h2>',
    "    <ul>",
    ...smallProjects.map((project) => `      <li>${project.href ? `<a href="${escapeHtml(project.href)}">${escapeHtml(project.title)}</a>` : escapeHtml(project.title)}: ${escapeHtml(project.description)}</li>`),
    "    </ul>",
    "  </section>",
    '  <section aria-labelledby="static-small-builds-heading">',
    '    <h2 id="static-small-builds-heading">Small builds</h2>',
    "    <ul>",
    ...microProjects.map((project) => `      <li>${escapeHtml(project.title)}: ${escapeHtml(project.description)}</li>`),
    "    </ul>",
    "  </section>",
    '  <section aria-labelledby="static-record-heading">',
    '    <h2 id="static-record-heading">Activities and record</h2>',
    ...fullRecord.flatMap((section) => [
      `    <h3>${escapeHtml(section.category)}</h3>`,
      "    <ul>",
      ...section.items.map((item) => `      <li>${escapeHtml(item.title)}: ${escapeHtml(item.detail)}</li>`),
      "    </ul>",
    ]),
    "  </section>",
    '  <section aria-labelledby="static-learning-heading">',
    '    <h2 id="static-learning-heading">Ongoing learning</h2>',
    "    <ul>",
    ...learningHighlights.map((item) => `      <li>${escapeHtml(item.label)}: ${escapeHtml(item.value)}${item.note ? ` - ${escapeHtml(item.note)}` : ""}</li>`),
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
