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

function groupedSkills(skills) {
  const groups = list(skills).filter((skill) => list(skill.projectIds).length > 0).reduce((entries, skill) => {
    const category = skill.category || "Other";
    const group = entries.find((entry) => entry.category === category);
    if (group) group.skills.push(skill);
    else entries.push({ category, skills: [skill], context: "personal / hobby work" });
    return entries;
  }, []);
  const tetcSkills = list(skills).filter((skill) => list(skill.credentialIds).includes("tetc"));

  if (tetcSkills.length > 0) groups.push({ category: "TETC lessons", skills: tetcSkills });

  return groups;
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
  const published = media.filter((item) => item.src);
  const modelCount = published.filter((item) => item.type === "model").length;
  const modelText = modelCount ? `; interactive 3D models: ${modelCount}` : "";

  return `Published media: ${published.length}${modelText}`;
}

function credentialSummary(credential) {
  if (credential.entryType === "program") {
    const details = [
      credential.issuer ? `Organization: ${credential.issuer}` : "",
      credential.href ? markdownLink(credential.hrefLabel || "program", credential.href) : "",
    ].filter(Boolean);

    return `${credential.program}: ${credential.summary}${details.length ? ` (${details.join("; ")})` : ""}`;
  }

  const details = [
    credential.issuer ? `Issuer: ${credential.issuer}` : "",
    credential.date ? `Date: ${credential.date}` : "",
    credential.scanAvailable ? "Certificate scan: available" : "Certificate scan: not yet published",
    credential.href ? markdownLink(credential.hrefLabel || "program", credential.href) : "",
  ].filter(Boolean);

  return `${credential.credential}: ${credential.summary}${details.length ? ` (${details.join("; ")})` : ""}`;
}

function roleSummary(project) {
  return project.role ? ` Role: ${project.role}` : "";
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
    markdownLink("Experience", absoluteUrl("/record")),
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
    "# Christopher Heskett",
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
        return appendSentence(`${project.title} (${project.status}): ${project.summary}${roleSummary(project)}${linkText}`, `${mediaSummary(project)}.`);
      }),
    ),
    "",
    "## More Projects",
    "",
    markdownList(
      list(content.smallProjects).map((project) => {
        const links = projectLinks(project);
        const linkText = links.length > 0 ? ` (${links.join(", ")})` : "";
        return appendSentence(`${project.title}: ${project.description}${linkText}`, `${mediaSummary(project)}.`);
      }),
    ),
    "",
    "## Programs And Credentials",
    "",
    markdownList(list(content.programCredentials).map(credentialSummary)),
    "",
    "## Small Builds",
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
    "# Christopher Heskett",
    "",
    `Canonical URL: ${absoluteUrl("/")}`,
    `Experience: ${absoluteUrl("/record")}`,
    `Structured JSON: ${absoluteUrl("/portfolio.json")}`,
    "",
    "## Summary",
    "",
    meta.heroIntro ?? "",
    "",
    "## Main Projects",
    "",
    list(content.projects)
      .map((project) =>
        [
          `### ${project.title}`,
          "",
          `Status: ${project.status}`,
          project.teamContext ? `Context: ${project.teamContext}` : "",
          `Label: ${project.label}`,
          project.href ? `Project: ${project.href}` : "",
          project.sourceHref ? `Source: ${project.sourceHref}` : "",
          project.bestLinkLabel ? `Best link label: ${project.bestLinkLabel}` : "",
          list(project.artifactLinks).length > 0
            ? `Artifact links: ${list(project.artifactLinks)
                .map((link) => `${link.label} (${link.type}): ${link.href}`)
                .join("; ")}`
            : "",
          project.role ? `My role: ${project.role}` : "",
          project.logoHref ? `Related program/logo link: ${project.logoHref}` : "",
          "",
          project.summary,
          "",
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
    "## Programs And Credentials",
    "",
    list(content.programCredentials)
      .map((credential) =>
        [
          `### ${credential.credential || credential.program}`,
          "",
          `Type: ${credential.entryType === "program" ? "Program" : "Credential"}`,
          `Program: ${credential.program}`,
          credential.issuer ? `${credential.entryType === "program" ? "Organization" : "Issuer"}: ${credential.issuer}` : "",
          credential.date ? `Date: ${credential.date}` : "",
          credential.relatedProjectId ? `Related project ID: ${credential.relatedProjectId}` : "",
          credential.href ? `Program link: ${credential.href}` : "",
          credential.entryType !== "program"
            ? credential.scanAvailable && credential.scanSrc
              ? `Certificate scan: ${absoluteUrl(credential.scanSrc)}`
              : "Certificate scan: not yet published"
            : "",
          "",
          credential.summary,
        ]
          .filter((line) => line !== "")
          .join("\n"),
      )
      .join("\n\n"),
    "",
    "## Learning Highlights",
    "",
    markdownList(
      list(content.learningHighlights).map((item) => `${item.label}: ${item.value}${item.note ? ` (${item.note})` : ""}`),
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
    "## Small Builds",
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
    markdownList(groupedSkills(content.skills).map((group) => `${group.category}${group.context ? ` (${group.context})` : ""}: ${group.skills.map((skill) => skill.name).join(", ")}`)),
    "",
    "## Full Record",
    "",
    list(content.fullRecord)
      .map((section) =>
        [
          `### ${section.category}`,
          "",
          markdownList(list(section.items).map((item) => {
            const date = item.date ? ` (${item.date})` : "";
            const link = item.href ? ` ${markdownLink(item.hrefLabel || "Open", item.href)}` : "";
            return `${item.title}${date}: ${item.detail}${link}`;
          })),
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
