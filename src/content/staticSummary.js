function list(value) {
  return Array.isArray(value) ? value : [];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sentenceList(values) {
  return values.filter(Boolean).join(" ");
}

function externalLinks(item) {
  return [
    item.href ? `<a href="${escapeHtml(item.href)}">Open project</a>` : "",
    item.sourceHref ? `<a href="${escapeHtml(item.sourceHref)}">Source</a>` : "",
    ...list(item.artifactLinks)
      .filter((link) => link.href)
      .map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`),
  ].filter(Boolean);
}

function projectText(project) {
  return sentenceList([
    project.label,
    project.status ? `Status: ${project.status}.` : "",
    project.teamContext,
    project.summary,
    project.contribution ? `My contribution: ${project.contribution}` : "",
    project.relatedProgramNote,
  ]);
}

function moreWorkText(project) {
  return sentenceList([
    project.type,
    project.status ? `Status: ${project.status}.` : "",
    project.context,
    project.description,
  ]);
}

function recordText(item) {
  const achievements = list(item.achievements);
  return sentenceList([
    item.date,
    item.detail,
    achievements.length > 0 ? `Achievements: ${achievements.join("; ")}.` : "",
  ]);
}

function credentialText(credential) {
  const award = credential.awardTitle
    ? `${credential.awardDate} ${credential.awardTitle}${credential.awardDistinction ? ` - ${credential.awardDistinction}` : ""}. ${credential.awardSummary}`
    : "";

  return sentenceList([
    credential.credential,
    credential.issuer ? `Issuer: ${credential.issuer}.` : "",
    credential.date ? `Date: ${credential.date}.` : "",
    credential.summary,
    award,
  ]);
}

export function buildStaticSummary(content) {
  const meta = content.meta ?? {};
  const projects = list(content.projects);
  const academics = list(content.academics);
  const academicDetails = list(content.academicDetails);
  const credentials = list(content.programCredentials);
  const moreWork = list(content.moreWork);
  const skills = list(content.skills);
  const fullRecord = list(content.fullRecord);

  return [
    '<main id="portfolio-static-fallback" aria-label="Christopher Heskett portfolio summary">',
    `  <p>${escapeHtml(meta.heroEyebrow || "Student engineer")}</p>`,
    `  <h1>${escapeHtml(meta.heroTitle || "Christopher Heskett")}</h1>`,
    `  <p>${escapeHtml(meta.heroLead || "Engineering portfolio")}</p>`,
    meta.heroIntro ? `  <p>${escapeHtml(meta.heroIntro)}</p>` : "",
    '  <section aria-labelledby="static-projects-heading">',
    '    <h2 id="static-projects-heading">Featured projects</h2>',
    "    <ul>",
    ...projects.map((project) => {
      const links = externalLinks(project);
      return `      <li><a href="/#project-${encodeURIComponent(project.id)}">${escapeHtml(project.title)}</a>: ${escapeHtml(projectText(project))}${links.length > 0 ? ` (${links.join(", ")})` : ""}</li>`;
    }),
    "    </ul>",
    "  </section>",
    '  <section aria-labelledby="static-academics-heading">',
    '    <h2 id="static-academics-heading">Academics</h2>',
    "    <ul>",
    meta.academicSchoolName ? `      <li>${escapeHtml(meta.academicSchoolName)}: ${escapeHtml(sentenceList([meta.academicSchoolContext, meta.academicSchoolDistrictRank, meta.academicSchoolRankSummary]))}</li>` : "",
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
    ...credentials.map((credential) => `      <li>${credential.href ? `<a href="${escapeHtml(credential.href)}">${escapeHtml(credential.program || credential.credential)}</a>` : escapeHtml(credential.program || credential.credential)}: ${escapeHtml(credentialText(credential))}</li>`),
    "    </ul>",
    "  </section>",
    '  <section aria-labelledby="static-more-work-heading">',
    '    <h2 id="static-more-work-heading">More work</h2>',
    "    <ul>",
    ...moreWork.map((project) => {
      const links = externalLinks(project);
      return `      <li>${escapeHtml(project.title)}: ${escapeHtml(moreWorkText(project))}${links.length > 0 ? ` (${links.join(", ")})` : ""}</li>`;
    }),
    "    </ul>",
    "  </section>",
    '  <section aria-labelledby="static-tools-heading">',
    '    <h2 id="static-tools-heading">Tools</h2>',
    "    <ul>",
    ...skills.map((skill) => `      <li>${escapeHtml(skill.category)}: ${escapeHtml(skill.name)}</li>`),
    "    </ul>",
    "  </section>",
    '  <section aria-labelledby="static-record-heading">',
    '    <h2 id="static-record-heading">Activities and record</h2>',
    ...fullRecord.flatMap((section) => [
      `    <h3>${escapeHtml(section.category)}</h3>`,
      "    <ul>",
      ...list(section.items).map((item) => `      <li>${escapeHtml(item.title)}: ${escapeHtml(recordText(item))}${item.href ? ` (<a href="${escapeHtml(item.href)}">${escapeHtml(item.hrefLabel || "Open")}</a>)` : ""}</li>`),
      "    </ul>",
    ]),
    "  </section>",
    '  <section aria-labelledby="static-contact-heading">',
    '    <h2 id="static-contact-heading">Contact</h2>',
    "    <ul>",
    meta.contactPhoneHref && meta.contactPhoneLabel ? `      <li><a href="${escapeHtml(meta.contactPhoneHref)}">${escapeHtml(meta.contactPhoneLabel)}</a></li>` : "",
    meta.contactEmailHref ? `      <li><a href="${escapeHtml(meta.contactEmailHref)}">${escapeHtml(meta.contactEmailLabel || "Email")}</a></li>` : "",
    meta.githubHref ? `      <li><a href="${escapeHtml(meta.githubHref)}">${escapeHtml(meta.githubLabel || "GitHub")}</a></li>` : "",
    "    </ul>",
    "  </section>",
    '  <nav aria-label="Machine-readable portfolio">',
    '    <a href="/llms-full.txt">Machine-readable portfolio</a>',
    '    <a href="/portfolio.json">Portfolio JSON</a>',
    "  </nav>",
    "</main>",
  ]
    .filter(Boolean)
    .join("\n");
}
