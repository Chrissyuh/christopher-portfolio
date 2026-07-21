import fs from "node:fs/promises";
import { buildVisualInventory } from "../src/content/visualInventory.js";

const SITE_URL = "https://chrisaheskett.vercel.app";
const contentUrl = new URL("../src/content/portfolioContent.generated.json", import.meta.url);
const publicUrl = new URL("../public/", import.meta.url);
const machineReadableBaseUrl = new URL("machine-readable-base/", publicUrl);

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

function academicRecordItems(content) {
  const summary = list(content.academics).filter((item) => item.id === "gpa" || item.id === "rank");
  return [...summary, ...list(content.academicDetails)];
}

function academicItemLine(item) {
  const group = item.group ? `${item.group} - ` : "";
  return `${group}${item.label}: ${item.value}${item.note ? ` (${item.note})` : ""}`;
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

function visualKindLabel(kind) {
  if (kind === "interactive_3d_model") return "interactive 3D model";
  if (kind === "certificate") return "certificate image";
  return kind.replaceAll("_", " ");
}

function visualInventoryLine(visual) {
  const caption = visual.caption && visual.caption !== visual.description ? ` Caption: ${visual.caption}.` : "";
  const context = visual.context ? ` Context: ${visual.context}.` : "";
  const source = ` ${markdownLink("Open asset", absoluteUrl(visual.src))}`;
  return `${visual.owner} - ${visualKindLabel(visual.kind)}: ${visual.description}.${caption}${context}${source}`;
}

function visualInventoryMarkdown(content) {
  return markdownList(buildVisualInventory(content).map(visualInventoryLine));
}

function credentialDetails(credential) {
  const award = credential.awardTitle
    ? `${credential.awardDate} ${credential.awardTitle}${credential.awardDistinction ? ` - ${credential.awardDistinction}` : ""}. ${credential.awardSummary}${credential.awardQuote ? ` ${credential.awardQuoteAttribution || "Program staff"}: "${credential.awardQuote}"` : ""}`
    : "";

  if (credential.entryType === "program") {
    const details = [
      credential.issuer ? `Organization: ${credential.issuer}` : "",
      credential.href ? markdownLink(credential.hrefLabel || "program", credential.href) : "",
    ].filter(Boolean);

    return `${credential.summary}${award ? ` ${award}` : ""}${details.length ? ` (${details.join("; ")})` : ""}`;
  }

  const details = [
    credential.issuer ? `Issuer: ${credential.issuer}` : "",
    credential.date ? `Date: ${credential.date}` : "",
    credential.scanAvailable ? "Certificate scan: available" : "Certificate scan: not yet published",
    credential.href ? markdownLink(credential.hrefLabel || "program", credential.href) : "",
  ].filter(Boolean);

  return `${credential.summary}${details.length ? ` (${details.join("; ")})` : ""}`;
}

function recordItemSummary(item) {
  const achievements = list(item.achievements);
  const achievementText = achievements.length > 0 ? `Achievements: ${achievements.join("; ")}.` : "";
  return [item.detail, achievementText].filter(Boolean).join(" ");
}

function contributionSummary(project) {
  return project.contribution ? ` My contribution: ${project.contribution}` : "";
}

function moreWorkContext(project) {
  const details = [project.status, project.context].filter(Boolean);
  return details.length > 0 ? ` Context: ${details.join("; ")}.` : "";
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
  const toolMediaEnabled = content.meta?.toolMediaEnabled === "true";

  return {
    ...content,
    toolMedia: toolMediaEnabled ? content.toolMedia : [],
    visualInventory: buildVisualInventory(content),
    canonicalUrl: absoluteUrl("/"),
    routes: {
      portfolio: absoluteUrl("/"),
      fullRecord: absoluteUrl("/record"),
    },
    humanSurfaces: {
      meta: absoluteUrl("/#top"),
      projects: absoluteUrl("/#projects"),
      academics: absoluteUrl("/#academics"),
      academicDetails: absoluteUrl("/#academics"),
      programCredentials: absoluteUrl("/#academics"),
      fullRecord: absoluteUrl("/record"),
      moreWork: absoluteUrl("/#more-work"),
      skills: absoluteUrl("/#bench"),
      learningHighlights: absoluteUrl("/#academics"),
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
    `${markdownLink("Portfolio homepage", absoluteUrl("/"))}: Human-facing portfolio and project media.`,
    `${markdownLink("Experience", absoluteUrl("/record"))}: Activities, programs, and full record.`,
    `${markdownLink("Full Markdown summary", absoluteUrl("/llms-full.txt"))}: Complete portfolio context in one text file.`,
    `${markdownLink("Full portfolio JSON", absoluteUrl("/portfolio.json"))}: Normalized structured portfolio data.`,
  ];

  const contactLinks = [
    meta.contactPhoneLabel && `Phone: ${meta.contactPhoneLabel} (text message on mobile).`,
    meta.contactEmailHref && `${markdownLink(meta.contactEmailLabel ?? "Email", meta.contactEmailHref)}: Email Christopher.`,
    meta.contactGithubHref && `${markdownLink(meta.contactGithubLabel ?? "GitHub", meta.contactGithubHref)}: Public source repositories.`,
    meta.resumeHref && `${markdownLink(meta.resumeLabel ?? "Resume", meta.resumeHref)}: Resume.`,
  ].filter(Boolean);

  return [
    "# Christopher Heskett",
    "",
    `> ${meta.heroLead ?? meta.heroIntro ?? "Student engineering portfolio for Christopher Heskett."}`,
    "",
    "This index points agents to concise, structured, and complete representations of the same public work shown on the portfolio.",
    "",
    "## Primary Pages",
    "",
    markdownList(primaryLinks),
    "",
    "## Featured Projects",
    "",
    markdownList(
      list(content.projects).map((project) => {
        const links = projectLinks(project);
        const linkText = links.length > 0 ? ` (${links.join(", ")})` : "";
        const description = appendSentence(
          `${project.status ? `Status: ${project.status}. ` : ""}${project.summary}${contributionSummary(project)}${linkText}`,
          `${mediaSummary(project)}.`,
        );
        return `${markdownLink(project.title, absoluteUrl(`/#project-${project.id}`))}: ${description}`;
      }),
    ),
    "",
    "## Visual Descriptions",
    "",
    visualInventoryMarkdown(content),
    "",
    "## Academic Record",
    "",
    markdownList(
      [
        `${meta.academicSchoolName}: ${meta.academicSchoolContext} ${meta.academicSchoolDistrictRank} ${meta.academicSchoolRankSummary}`,
        ...academicRecordItems(content).map(academicItemLine),
      ],
    ),
    "",
    "## Activities, Leadership, Service, And Learning",
    "",
    markdownList(
      list(content.fullRecord)
        .flatMap((section) => list(section.items))
        .map((item) => `${item.title}: ${recordItemSummary(item)}`),
    ),
    "",
    "## More Work",
    "",
    markdownList(
      list(content.moreWork).map((project) => {
        const links = projectLinks(project);
        const linkText = links.length > 0 ? ` (${links.join(", ")})` : "";
        const description = appendSentence(`${project.description}${moreWorkContext(project)}${linkText}`, `${mediaSummary(project)}.`);
        return `${markdownLink(project.title, absoluteUrl("/#more-work"))}: ${description}`;
      }),
    ),
    "",
    "## Programs And Credentials",
    "",
    markdownList(
      list(content.programCredentials).map(
        (credential) =>
          `${markdownLink(credential.credential || credential.program, absoluteUrl(`/#credential-${credential.id}`))}: ${credentialDetails(credential)}`,
      ),
    ),
    "",
    "## Tools",
    "",
    markdownList(groupedSkills(content.skills).map((group) => `${group.category}${group.context ? ` (${group.context})` : ""}: ${group.skills.map((skill) => skill.name).join(", ")}`)),
    "",
    "## Contact",
    "",
    markdownList(contactLinks),
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
          project.status ? `Status: ${project.status}` : "",
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
          project.contribution ? `My contribution: ${project.contribution}` : "",
          project.logoHref ? `Related program link: ${project.logoHref}` : "",
          project.relatedProgramNote ? `Related program context: ${project.relatedProgramNote}` : "",
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
    "## Visual Descriptions",
    "",
    visualInventoryMarkdown(content),
    "",
    "## Academics",
    "",
    `${meta.academicSchoolName}: ${meta.academicSchoolContext} ${meta.academicSchoolDistrictRank} ${meta.academicSchoolRankSummary}`,
    "",
    markdownList(
      list(content.academics).map((item) => `${item.label}: ${item.value}${item.note ? ` (${item.note})` : ""}`),
    ),
    "",
    "### Coursework & scores",
    "",
    markdownList(
      list(content.academicDetails).map(academicItemLine),
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
          credential.awardTitle ? `Award: ${credential.awardDate} ${credential.awardTitle}${credential.awardDistinction ? ` - ${credential.awardDistinction}` : ""}` : "",
          credential.awardSummary ? `Award detail: ${credential.awardSummary}` : "",
          credential.awardQuote ? `Award quote: "${credential.awardQuote}" - ${credential.awardQuoteAttribution}` : "",
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
    "## More Work",
    "",
    markdownList(
      list(content.moreWork).map((project) => {
        const links = projectLinks(project);
        const linkText = links.length > 0 ? ` (${links.join(", ")})` : "";
        return appendSentence(`${project.title} - ${project.presentationSize} - ${project.type}: ${project.description}${moreWorkContext(project)}${linkText}`, `${mediaSummary(project)}.`);
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
            return `${item.title}${date}: ${recordItemSummary(item)}${link}`;
          })),
        ].join("\n"),
      )
      .join("\n\n"),
    "",
    "## Contact",
    "",
    markdownList(
      [
        meta.contactPhoneHref && `Phone: ${meta.contactPhoneLabel ?? meta.contactPhoneHref.replace(/^(?:tel|sms):/, "")}`,
        meta.contactEmailHref && `Email: ${stripMailto(meta.contactEmailHref)}`,
        meta.contactGithubHref && `GitHub: ${meta.contactGithubHref}`,
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
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "",
    "User-agent: ChatGPT-User",
    "Allow: /",
    "",
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

async function writeMachineReadableBaseFile(name, body) {
  const outputUrl = new URL(name, machineReadableBaseUrl);
  await fs.writeFile(outputUrl, body);
  console.log(`Wrote ${outputUrl.pathname}`);
}

const content = JSON.parse(await fs.readFile(contentUrl, "utf8"));

await fs.mkdir(publicUrl, { recursive: true });
await fs.mkdir(machineReadableBaseUrl, { recursive: true });
await writeMachineReadableBaseFile("portfolio.json", `${JSON.stringify(buildPortfolioJson(content), null, 2)}\n`);
await writeMachineReadableBaseFile("llms.txt", buildLlmsTxt(content));
await writeMachineReadableBaseFile("llms-full.txt", buildLlmsFullTxt(content));
await writePublicFile("sitemap.xml", buildSitemapXml());
await writePublicFile("robots.txt", buildRobotsTxt());
