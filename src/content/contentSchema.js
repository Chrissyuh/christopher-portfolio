export const sheetTabNames = [
  "Meta",
  "HeroTags",
  "CurrentStack",
  "EvidenceTiles",
  "MainProjects",
  "Academics",
  "SmallProjects",
  "SkillNarratives",
  "Skills",
  "Principles",
  "FullRecordSections",
  "FullRecordItems",
  "NavLinks",
];

export const allowedAccents = ["blue", "teal", "amber", "clay"];

export const allowedIcons = [
  "arrowRight",
  "bolt",
  "box",
  "cpu",
  "gauge",
  "github",
  "layers",
  "link",
  "linkedin",
  "list",
  "mail",
  "printer",
  "route",
  "school",
  "target",
  "trophy",
  "wrench",
  "zap",
];

const requiredFields = {
  HeroTags: ["id", "label"],
  CurrentStack: ["id", "number", "label"],
  EvidenceTiles: ["id", "top", "bottom"],
  MainProjects: ["id", "number", "title", "label", "status", "accent", "summary"],
  Academics: ["id", "label", "value"],
  SmallProjects: ["id", "title", "type", "description"],
  SkillNarratives: ["id", "title", "icon", "text"],
  Skills: ["id", "name"],
  Principles: ["id", "title", "text"],
  FullRecordSections: ["id", "category", "icon"],
  FullRecordItems: ["id", "section_id", "text"],
  NavLinks: ["id", "label", "href"],
};

const defaultMeta = {
  documentTitle: "Christopher Portfolio",
  navName: "Christopher",
  navSubtitle: "engineering workbench / portfolio",
  heroEyebrow: "portfolio index / active work",
  heroTitle: "Hardware, CAD, wiring, code, and the revisions between them.",
  heroIntro:
    "I build projects where the mechanical design, electronics, software, and documentation all have to meet in the real world. This portfolio is organized around proof: what works, what changed, and what still needs to be improved.",
  currentStackTitle: "current stack",
  focusEyebrow: "focus",
  focusTitle: "engineering evidence",
  focusText:
    "The goal is to show real build depth: hardware decisions, CAD constraints, wiring maps, test logs, project tradeoffs, and the exact revisions that made each design better.",
  portfolioRuleEyebrow: "portfolio rule",
  portfolioRuleText: "Every major page should show evidence, not just claims.",
  projectIndexCode: "PROJECT INDEX",
  projectIndexTitle: "Main engineering tracks.",
  projectIndexText:
    "These are the projects that best show the kind of engineering I care about: physical systems, real constraints, software that touches hardware, and enough documentation to make the design understandable.",
  academicCode: "ACADEMIC SNAPSHOT",
  academicTitle: "Strong course load, strong results.",
  academicText:
    "A small academic snapshot for context: the main portfolio is still project-first, but the coursework shows that the engineering work is backed by consistent school performance.",
  smallerProjectsCode: "SMALLER BUILDS",
  smallerProjectsTitle: "Smaller projects and experiments.",
  smallerProjectsText:
    "Not every useful project needs to be a flagship build. These smaller pieces show software practice, robotics experiments, visualization, and technical curiosity.",
  skillSystemCode: "SKILL SYSTEM",
  skillSystemTitle: "How the skills connect.",
  skillSystemText:
    "The point is not just that I know several tools. The important part is that the tools overlap: CAD affects wiring, wiring affects software, software affects testing, and testing decides the next design change.",
  workingVocabularyLabel: "working vocabulary",
  principlesCode: "DESIGN NOTES",
  principlesTitle: "How project pages should feel.",
  principlesText:
    "The portfolio should read like an engineering notebook made presentable: specific, honest, and useful, with enough detail that another technical person can understand the work.",
  recordEyebrow: "full record",
  recordTitle:
    "A larger list of projects, school, competitions, Scouts, languages, and long-term learning.",
  recordIntro:
    "This page is intentionally broader than the main portfolio. It collects the work and experiences that give context to the engineering projects.",
  contactEyebrow: "contact",
  contactTitle: "Project links and contact information.",
  contactText:
    "Spring Early College Academy student and Exxon Teen Engineering + Tech Center participant focused on CAD, fabrication, electronics, robotics, embedded software, and technical documentation.",
  contactEmailHref: "mailto:Chrisaheskett@gmail.com",
  contactEmailLabel: "Email",
  contactGithubHref: "https://github.com/Chrissyuh",
  contactGithubLabel: "View GitHub",
  contactProjectHref: "https://check-ins-zeta.vercel.app/",
  contactProjectLabel: "See live project",
  footerLeft: "Spring Early College Academy",
  footerMiddle: "Exxon Teen Engineering + Tech Center",
  footerName: "Christopher",
  projectVisualMapText:
    "A quick visual map of the project's main subsystems and engineering evidence.",
  projectNextLabel: "future project page",
  openProjectsLabel: "Open project index",
  viewRecordLabel: "View full record",
  backPortfolioLabel: "Back to portfolio",
};

function text(value) {
  return String(value ?? "").trim();
}

function isEnabled(row) {
  const value = text(row.enabled).toLowerCase();
  return !["0", "false", "no", "n", "off"].includes(value);
}

function orderedRows(rows = []) {
  return rows
    .map((row, index) => ({
      row,
      index,
      order: Number.isFinite(Number(text(row.order))) ? Number(text(row.order)) : index + 1,
    }))
    .filter(({ row }) => isEnabled(row))
    .sort((a, b) => a.order - b.order || a.index - b.index)
    .map(({ row }) => row);
}

function compactNumberedFields(row, prefix, count) {
  return Array.from({ length: count }, (_, index) => text(row[`${prefix}_${index + 1}`])).filter(Boolean);
}

function rowsFor(tabRows, tabName) {
  return Array.isArray(tabRows?.[tabName]) ? tabRows[tabName] : [];
}

function hrefOrNull(value) {
  const href = text(value);
  return href || null;
}

function collectRequiredErrors(tabName, rows) {
  const fields = requiredFields[tabName] ?? [];

  return orderedRows(rows).flatMap((row, index) =>
    fields
      .filter((field) => !text(row[field]))
      .map((field) => `${tabName} row ${index + 2} is missing required field "${field}".`),
  );
}

function requireKnownValue(errors, tabName, id, fieldName, value, allowedValues) {
  if (!allowedValues.includes(value)) {
    errors.push(`${tabName} row "${id}" has unsupported ${fieldName} "${value}".`);
  }
}

export function normalizePortfolioRows(tabRows, { source = "google-sheet" } = {}) {
  const errors = [];

  for (const tabName of sheetTabNames) {
    if (!Array.isArray(tabRows?.[tabName])) {
      errors.push(`Missing required tab "${tabName}".`);
      continue;
    }

    errors.push(...collectRequiredErrors(tabName, tabRows[tabName]));
  }

  const meta = {
    ...defaultMeta,
    ...Object.fromEntries(
      rowsFor(tabRows, "Meta")
        .map((row) => [text(row.key), text(row.value)])
        .filter(([key]) => key),
    ),
  };

  const simpleRows = (tabName, mapper) => orderedRows(rowsFor(tabRows, tabName)).map(mapper);

  const projects = simpleRows("MainProjects", (row) => {
    const accent = text(row.accent);
    requireKnownValue(errors, "MainProjects", text(row.id), "accent", accent, allowedAccents);

    return {
      id: text(row.id),
      number: text(row.number),
      title: text(row.title),
      label: text(row.label),
      status: text(row.status),
      accent,
      summary: text(row.summary),
      evidence: compactNumberedFields(row, "evidence", 6),
      next: text(row.next),
      preview: {
        title: text(row.preview_title),
        label: text(row.preview_label),
        parts: compactNumberedFields(row, "preview_part", 6),
      },
    };
  });

  const skillNarratives = simpleRows("SkillNarratives", (row) => {
    const icon = text(row.icon);
    requireKnownValue(errors, "SkillNarratives", text(row.id), "icon", icon, allowedIcons);

    return {
      id: text(row.id),
      title: text(row.title),
      icon,
      text: text(row.text),
    };
  });

  const fullRecordSections = simpleRows("FullRecordSections", (row) => {
    const icon = text(row.icon);
    requireKnownValue(errors, "FullRecordSections", text(row.id), "icon", icon, allowedIcons);

    return {
      id: text(row.id),
      category: text(row.category),
      icon,
      items: [],
    };
  });

  const fullRecordById = new Map(fullRecordSections.map((section) => [section.id, section]));

  for (const row of orderedRows(rowsFor(tabRows, "FullRecordItems"))) {
    const sectionId = text(row.section_id);
    const section = fullRecordById.get(sectionId);

    if (!section) {
      errors.push(`FullRecordItems row "${text(row.id)}" references missing section_id "${sectionId}".`);
      continue;
    }

    section.items.push({
      id: text(row.id),
      text: text(row.text),
    });
  }

  if (errors.length > 0) {
    throw new Error(`Portfolio content validation failed:\n${errors.join("\n")}`);
  }

  return {
    schemaVersion: 1,
    source,
    updatedAt: new Date().toISOString(),
    meta,
    heroTags: simpleRows("HeroTags", (row) => ({
      id: text(row.id),
      label: text(row.label),
    })),
    currentStack: simpleRows("CurrentStack", (row) => ({
      id: text(row.id),
      number: text(row.number),
      label: text(row.label),
    })),
    evidenceTiles: simpleRows("EvidenceTiles", (row) => ({
      id: text(row.id),
      top: text(row.top),
      bottom: text(row.bottom),
    })),
    projects,
    academics: simpleRows("Academics", (row) => ({
      id: text(row.id),
      label: text(row.label),
      value: text(row.value),
    })),
    smallProjects: simpleRows("SmallProjects", (row) => ({
      id: text(row.id),
      title: text(row.title),
      href: hrefOrNull(row.href),
      type: text(row.type),
      description: text(row.description),
    })),
    skillNarratives,
    skills: simpleRows("Skills", (row) => ({
      id: text(row.id),
      name: text(row.name),
    })),
    principles: simpleRows("Principles", (row) => ({
      id: text(row.id),
      title: text(row.title),
      text: text(row.text),
    })),
    fullRecord: fullRecordSections,
    navLinks: simpleRows("NavLinks", (row) => ({
      id: text(row.id),
      label: text(row.label),
      href: text(row.href),
    })),
  };
}
