import fs from "node:fs/promises";

const SITE_URL = "https://chrisaheskett.vercel.app";
const contentUrl = new URL("../src/content/portfolioContent.generated.json", import.meta.url);
const publicUrl = new URL("../public/", import.meta.url);

function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function markdownLink(label, href) {
  return `[${label}](${href})`;
}

function markdownList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function projectLinks(project) {
  return [
    project.href && markdownLink("project", project.href),
    project.sourceHref && markdownLink("source", project.sourceHref),
  ].filter(Boolean);
}

function mediaSummary(project) {
  const media = list(project.media);
  const filled = media.filter((item) => item.src).length;
  const placeholders = media.length - filled;

  if (media.length === 0) {
    return "Media: none";
  }

  return `Media: ${media.length} slot${media.length === 1 ? "" : "s"}, ${filled} live, ${placeholders} placeholder${placeholders === 1 ? "" : "s"}`;
}

function appendSentence(text, suffix) {
  const trimmed = String(text ?? "").trim();
  const separator = /[.!?]$/.test(trimmed) ? " " : ". ";
  return `${trimmed}${separator}${suffix}`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function stripMailto(href) {
  return href?.startsWith("mailto:") ? href.slice("mailto:".length) : href;
}

function buildPortfolioJson(content) {
  return {
    ...content,
    canonicalUrl: absoluteUrl("/"),
    routes: {
      portfolio: absoluteUrl("/"),
      fullRecord: absoluteUrl("/record"),
    },
    agentFiles: {
      llms: absoluteUrl("/llms.txt"),
      llmsFull: absoluteUrl("/llms-full.txt"),
      portfolioJson: absoluteUrl("/portfolio.json"),
      sitemap: absoluteUrl("/sitemap.xml"),
      robots: absoluteUrl("/robots.txt"),
    },
  };
}

function buildLlmsTxt(content) {
  const meta = content.meta ?? {};
  const primaryLinks = [
    markdownLink("Portfolio homepage", absoluteUrl("/")),
    markdownLink("Full record", absoluteUrl("/record")),
    markdownLink("Full portfolio JSON", absoluteUrl("/portfolio.json")),
    markdownLink("Full Markdown summary", absoluteUrl("/llms-full.txt")),
  ];

  const contactLinks = [
    meta.contactGithubHref && markdownLink(meta.contactGithubLabel ?? "GitHub", meta.contactGithubHref),
    meta.contactProjectHref && markdownLink(meta.contactProjectLabel ?? "Live project", meta.contactProjectHref),
    meta.contactEmailHref && markdownLink(meta.contactEmailLabel ?? "Email", meta.contactEmailHref),
  ].filter(Boolean);

  return [
    "# Christopher Portfolio",
    "",
    meta.heroIntro ?? "Engineering portfolio for Christopher.",
    "",
    "## Primary Pages",
    "",
    markdownList(primaryLinks),
    "",
    "## Main Projects",
    "",
    markdownList(
      list(content.projects).map((project) => {
        const links = projectLinks(project);
        const linkText = links.length > 0 ? ` (${links.join(", ")})` : "";
        return appendSentence(`${project.title}: ${project.summary}${linkText}`, `${mediaSummary(project)}.`);
      }),
    ),
    "",
    "## B-Level Projects",
    "",
    markdownList(
      list(content.smallProjects).map((project) => {
        const links = projectLinks(project);
        const linkText = links.length > 0 ? ` (${links.join(", ")})` : "";
        return appendSentence(`${project.title}: ${project.description}${linkText}`, `${mediaSummary(project)}.`);
      }),
    ),
    "",
    "## C-Level Projects",
    "",
    markdownList(
      list(content.microProjects).map((project) => {
        const links = projectLinks(project);
        const linkText = links.length > 0 ? ` (${links.join(", ")})` : "";
        return appendSentence(`${project.title}: ${project.description}${linkText}`, `${mediaSummary(project)}.`);
      }),
    ),
    "",
    "## Contact",
    "",
    markdownList(contactLinks),
    "",
    "## Notes For Agents",
    "",
    "Use `/portfolio.json` for structured data. Use `/llms-full.txt` when a single Markdown context file is easier to ingest.",
    "",
  ].join("\n");
}

function buildLlmsFullTxt(content) {
  const meta = content.meta ?? {};
  const sections = [
    "# Christopher Portfolio",
    "",
    `Canonical URL: ${absoluteUrl("/")}`,
    `Full record: ${absoluteUrl("/record")}`,
    `Structured JSON: ${absoluteUrl("/portfolio.json")}`,
    "",
    "## Summary",
    "",
    meta.heroIntro ?? "",
    "",
    "## Current Stack",
    "",
    markdownList(list(content.currentStack).map((item) => `${item.number}: ${item.label}`)),
    "",
    "## Main Projects",
    "",
    list(content.projects)
      .map((project) =>
        [
          `### ${project.number} ${project.title}`,
          "",
          `Status: ${project.status}`,
          `Label: ${project.label}`,
          project.href ? `Project: ${project.href}` : "",
          project.sourceHref ? `Source: ${project.sourceHref}` : "",
          "",
          project.summary,
          "",
          `Evidence: ${list(project.evidence).join(", ")}`,
          mediaSummary(project),
          `To document next: ${project.next}`,
        ]
          .filter((line) => line !== "")
          .join("\n"),
      )
      .join("\n\n"),
    "",
    "## Academics",
    "",
    markdownList(
      list(content.academics).map((item) => `${item.label}: ${item.value}${item.note ? ` (${item.note})` : ""}`),
    ),
    "",
    "## Smaller Projects",
    "",
    markdownList(
      list(content.smallProjects).map((project) => {
        const links = projectLinks(project);
        const linkText = links.length > 0 ? ` (${links.join(", ")})` : "";
        return appendSentence(`${project.title} - ${project.type}: ${project.description}${linkText}`, `${mediaSummary(project)}.`);
      }),
    ),
    "",
    "## C-Level Projects",
    "",
    markdownList(
      list(content.microProjects).map((project) => {
        const links = projectLinks(project);
        const linkText = links.length > 0 ? ` (${links.join(", ")})` : "";
        return appendSentence(`${project.title} - ${project.type}: ${project.description}${linkText}`, `${mediaSummary(project)}.`);
      }),
    ),
    "",
    "## Skills",
    "",
    markdownList(list(content.skillNarratives).map((skill) => `${skill.title}: ${skill.text}`)),
    "",
    "## Working Vocabulary",
    "",
    list(content.skills).map((skill) => skill.name).join(", "),
    "",
    "## Documentation Standards",
    "",
    markdownList(list(content.principles).map((principle) => `${principle.title}: ${principle.text}`)),
    "",
    "## Full Record",
    "",
    list(content.fullRecord)
      .map((section) =>
        [
          `### ${section.category}`,
          "",
          markdownList(list(section.items).map((item) => item.text)),
        ].join("\n"),
      )
      .join("\n\n"),
    "",
    "## Contact",
    "",
    markdownList(
      [
        meta.contactEmailHref && `Email: ${stripMailto(meta.contactEmailHref)}`,
        meta.contactGithubHref && `GitHub: ${meta.contactGithubHref}`,
        meta.contactProjectHref && `Live project: ${meta.contactProjectHref}`,
      ].filter(Boolean),
    ),
    "",
  ];

  return sections.join("\n");
}

function buildSitemapXml() {
  const urls = [
    { loc: absoluteUrl("/"), priority: "1.0" },
    { loc: absoluteUrl("/record"), priority: "0.8" },
    { loc: absoluteUrl("/portfolio.json"), priority: "0.6" },
    { loc: absoluteUrl("/llms.txt"), priority: "0.5" },
    { loc: absoluteUrl("/llms-full.txt"), priority: "0.5" },
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (url) =>
        `  <url><loc>${escapeXml(url.loc)}</loc><changefreq>weekly</changefreq><priority>${url.priority}</priority></url>`,
    ),
    "</urlset>",
    "",
  ].join("\n");
}

function buildRobotsTxt() {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    `LLMs: ${absoluteUrl("/llms.txt")}`,
    `LLMs-Full: ${absoluteUrl("/llms-full.txt")}`,
    "",
  ].join("\n");
}

async function writePublicFile(name, body) {
  const outputUrl = new URL(name, publicUrl);
  await fs.writeFile(outputUrl, body);
  console.log(`Wrote ${outputUrl.pathname}`);
}

const content = JSON.parse(await fs.readFile(contentUrl, "utf8"));

await fs.mkdir(publicUrl, { recursive: true });
await writePublicFile("portfolio.json", `${JSON.stringify(buildPortfolioJson(content), null, 2)}\n`);
await writePublicFile("llms.txt", buildLlmsTxt(content));
await writePublicFile("llms-full.txt", buildLlmsFullTxt(content));
await writePublicFile("sitemap.xml", buildSitemapXml());
await writePublicFile("robots.txt", buildRobotsTxt());
