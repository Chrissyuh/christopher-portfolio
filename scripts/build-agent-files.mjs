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
  const links = [
    project.href && { label: project.bestLinkLabel || "project", href: project.href },
    project.sourceHref && { label: "source", href: project.sourceHref },
    ...list(project.artifactLinks).map((link) => ({ label: link.label, href: link.href })),
  ].filter((link) => link?.href && link.label);
  const seen = new Set();

  return links
    .filter((link) => {
      if (seen.has(link.href)) return false;
      seen.add(link.href);
      return true;
    })
    .map((link) => markdownLink(link.label, link.href));
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

function roleSummary(project) {
  const role = project.role || project.myRole;
  return role ? ` Role: ${role}` : "";
}

function stateSummary(project) {
  return project.state ? ` State: ${project.state}` : "";
}

function proofSummary(project) {
  const available = list(project.proofAvailable);
  const needed = project.proofNeeded || project.next;
  const parts = [
    available.length > 0 ? `Best evidence: ${available.join(", ")}` : "",
    needed ? `Still missing: ${needed}` : "",
  ].filter(Boolean);

  return parts.join(". ");
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
    meta.contactProjectHref && markdownLink(meta.contactProjectLabel ?? "Project", meta.contactProjectHref),
    meta.resumeHref && markdownLink(meta.resumeLabel ?? "Resume", meta.resumeHref),
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
        return appendSentence(`${project.title}: ${project.summary}${stateSummary(project)}${roleSummary(project)}${linkText}`, `${mediaSummary(project)}.`);
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
          project.teamContext ? `Context: ${project.teamContext}` : "",
          project.state ? `State: ${project.state}` : "",
          `Label: ${project.label}`,
          project.href ? `Project: ${project.href}` : "",
          project.sourceHref ? `Source: ${project.sourceHref}` : "",
          project.bestLinkLabel ? `Best link label: ${project.bestLinkLabel}` : "",
          list(project.artifactLinks).length > 0
            ? `Artifact links: ${list(project.artifactLinks)
                .map((link) => `${link.label} (${link.type}): ${link.href}`)
                .join("; ")}`
            : "",
          project.role || project.myRole ? `My role: ${project.role || project.myRole}` : "",
          project.whatChanged ? `What changed: ${project.whatChanged}` : "",
          project.whatLearned ? `What I learned: ${project.whatLearned}` : "",
          project.logoHref ? `Related program/logo link: ${project.logoHref}` : "",
          "",
          project.summary,
          "",
          proofSummary(project),
          mediaSummary(project),
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
        meta.contactProjectHref && `${meta.contactProjectLabel ?? "Project"}: ${meta.contactProjectHref}`,
        meta.resumeHref && `${meta.resumeLabel ?? "Resume"}: ${meta.resumeHref}`,
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
