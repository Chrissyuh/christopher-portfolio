export const sheetTabNames = [
  "Meta",
  "HeroTags",
  "CurrentStack",
  "MainProjects",
  "ProjectArtifactLinks",
  "Academics",
  "SmallProjects",
  "MicroProjects",
  "SkillNarratives",
  "Skills",
  "FullRecordSections",
  "FullRecordItems",
  "NavLinks",
];

export const allowedAccents = ["blue", "teal", "amber", "clay"];

export const allowedMediaTypes = ["photo", "video"];

export const allowedArtifactLinkTypes = ["live", "source", "cad", "wiring", "schematic", "demo", "notes", "release", "test", "other"];

const mediaSlotCount = 8;

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
  MainProjects: ["id", "number", "title", "label", "status", "accent", "summary"],
  ProjectArtifactLinks: ["id", "project_id", "label", "href", "type"],
  Academics: ["id", "label", "value"],
  SmallProjects: ["id", "title", "type", "description"],
  MicroProjects: ["id", "title", "type", "description"],
  SkillNarratives: ["id", "title", "icon", "text"],
  Skills: ["id", "name"],
  FullRecordSections: ["id", "category", "icon"],
  FullRecordItems: ["id", "section_id", "text"],
  NavLinks: ["id", "label", "href"],
};

const defaultMeta = {
  documentTitle: "Christopher Portfolio",
  navName: "Christopher",
  navSubtitle: "engineering portfolio",
  heroEyebrow: "current work",
  heroTitle: "I build hardware projects, robotics simulations, and software tools.",
  heroIntro:
    "Current work spans pinball, CAD-to-simulation robotics, planter electronics, and Subpix.",
  currentStackTitle: "start here",
  projectIndexCode: "featured work",
  projectIndexTitle: "Featured projects",
  projectIndexText:
    "Four projects with the clearest mix of build work, links, media, and honest gaps.",
  academicCode: "academics",
  academicTitle: "Academic profile",
  academicText: "Current standing, course load, and school context.",
  academicSchoolEyebrow: "school context",
  academicSchoolName: "Spring Early College Academy",
  academicSchoolHref: "https://seca.springisd.org/",
  academicSchoolLogoSrc: "/portfolio-media/academics/seca-logo.png",
  academicSchoolLogoAlt: "Spring Early College Academy crest",
  academicSchoolDistrictRank: "Top-ranked Spring ISD high school.",
  academicSchoolDistrictSourceHref: "https://www.schooldigger.com/go/TX/district/41220/search.aspx?level=3",
  academicSchoolDistrictSourceLabel: "District rankings",
  academicSchoolRankSummary: "#9 Houston metro, #44 Texas, #326 national.",
  academicSchoolRankSourceHref: "https://seca.springisd.org/o/seca/article/2369574",
  academicSchoolRankSourceLabel: "Ranking details",
  smallerProjectsCode: "smaller builds",
  smallerProjectsTitle: "Smaller projects",
  smallerProjectsText: "Real projects that are lighter than the featured builds. More will be added here as the evidence improves.",
  microProjectsCode: "small artifacts",
  microProjectsTitle: "Small builds",
  microProjectsText: "Small projects I kept because they have a real artifact, link, or useful lesson.",
  microProjectsOpenLabel: "Open",
  microProjectsSourceLabel: "Source",
  skillSystemCode: "tools",
  skillSystemTitle: "Tools behind the projects",
  skillSystemText:
    "These skills are tied to the projects above.",
  workingVocabularyLabel: "working vocabulary",
  recordEyebrow: "full record",
  recordTitle: "Projects, school, competitions, Scouts, languages, and learning",
  recordIntro: "A broader record beyond the main engineering projects.",
  contactEyebrow: "contact",
  contactTitle: "Contact and links",
  contactText:
    "Spring Early College Academy student focused on CAD, fabrication, electronics, robotics, embedded software, and technical documentation.",
  contactEmailHref: "mailto:Chrisaheskett@gmail.com",
  contactEmailLabel: "Email",
  contactGithubHref: "https://github.com/Chrissyuh",
  contactGithubLabel: "View GitHub",
  contactProjectHref: "https://subpix-editor.vercel.app/",
  contactProjectLabel: "Open Subpix",
  resumeHref: "",
  resumeLabel: "Resume",
  footerLeft: "Spring Early College Academy",
  footerMiddle: "Exxon Teen Engineering + Tech Center",
  footerName: "Christopher",
  projectTeamContextLabel: "context",
  projectRoleLabel: "role",
  projectStateLabel: "state",
  projectProofAvailableLabel: "best evidence",
  projectProofNeededLabel: "still missing",
  projectNextLabel: "still missing",
  projectArtifactLinksLabel: "artifact links",
  projectWhatChangedLabel: "what changed",
  projectWhatLearnedLabel: "what I learned",
  projectOpenLabel: "Open project",
  projectSourceLabel: "Source",
  mediaPlaceholderLabel: "needed",
  mediaSlotLabel: "media slot",
  openProjectsLabel: "View projects",
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

function compactMediaFields(row, errors, tabName, rowId) {
  return Array.from({ length: mediaSlotCount }, (_, index) => {
    const slot = index + 1;
    const type = text(row[`media_${slot}_type`]);
    const src = text(row[`media_${slot}_src`]);
    const alt = text(row[`media_${slot}_alt`]);
    const caption = text(row[`media_${slot}_caption`]);

    if (!type && !src && !alt && !caption) {
      return null;
    }

    if (type && !allowedMediaTypes.includes(type)) {
      errors.push(`${tabName} row "${rowId}" has unsupported media_${slot}_type "${type}".`);
    }

    return {
      id: `media-${slot}`,
      type: type || "photo",
      src: hrefOrNull(src),
      alt,
      caption,
    };
  }).filter(Boolean);
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
    const id = text(row.id);
    const accent = text(row.accent);
    requireKnownValue(errors, "MainProjects", id, "accent", accent, allowedAccents);
    const media = compactMediaFields(row, errors, "MainProjects", id);
    const proofAvailable = compactNumberedFields(row, "proof_available", 6);

    if (media.length === 0) {
      errors.push(`MainProjects row "${id}" must include at least one media slot.`);
    }

    return {
      id,
      number: text(row.number),
      title: text(row.title),
      href: hrefOrNull(row.href),
      sourceHref: hrefOrNull(row.source_href),
      label: text(row.label),
      status: text(row.status),
      accent,
      summary: text(row.summary),
      teamContext: text(row.team_context),
      role: text(row.role) || text(row.my_role),
      myRole: text(row.role) || text(row.my_role),
      state: text(row.state) || text(row.status),
      proofAvailable: proofAvailable.length ? proofAvailable : compactNumberedFields(row, "evidence", 6),
      proofNeeded: text(row.proof_needed) || text(row.next),
      bestLinkLabel: text(row.best_link_label),
      whatChanged: text(row.what_changed),
      whatLearned: text(row.what_learned),
      logoSrc: hrefOrNull(row.logo_src),
      logoAlt: text(row.logo_alt),
      logoHref: hrefOrNull(row.logo_href),
      artifactLinks: [],
      media,
      next: text(row.proof_needed) || text(row.next),
    };
  });

  const projectsById = new Map(projects.map((project) => [project.id, project]));

  for (const row of orderedRows(rowsFor(tabRows, "ProjectArtifactLinks"))) {
    const id = text(row.id);
    const projectId = text(row.project_id);
    const type = text(row.type);
    const project = projectsById.get(projectId);

    requireKnownValue(errors, "ProjectArtifactLinks", id, "type", type, allowedArtifactLinkTypes);

    if (!project) {
      errors.push(`ProjectArtifactLinks row "${id}" references missing project_id "${projectId}".`);
      continue;
    }

    project.artifactLinks.push({
      id,
      label: text(row.label),
      href: hrefOrNull(row.href),
      type,
    });
  }

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

  const smallProjects = simpleRows("SmallProjects", (row) => {
    const id = text(row.id);
    const media = compactMediaFields(row, errors, "SmallProjects", id);

    if (media.length === 0) {
      errors.push(`SmallProjects row "${id}" must include at least one media slot.`);
    }

    return {
      id,
      title: text(row.title),
      href: hrefOrNull(row.href),
      sourceHref: hrefOrNull(row.source_href),
      logoSrc: hrefOrNull(row.logo_src),
      logoAlt: text(row.logo_alt),
      logoHref: hrefOrNull(row.logo_href),
      type: text(row.type),
      description: text(row.description),
      media,
    };
  });

  const microProjects = simpleRows("MicroProjects", (row) => {
    const id = text(row.id);
    const media = compactMediaFields(row, errors, "MicroProjects", id);

    if (media.length === 0) {
      errors.push(`MicroProjects row "${id}" must include at least one media slot.`);
    }

    return {
      id,
      title: text(row.title),
      href: hrefOrNull(row.href),
      sourceHref: hrefOrNull(row.source_href),
      type: text(row.type),
      description: text(row.description),
      media,
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
    projects,
    academics: simpleRows("Academics", (row) => ({
      id: text(row.id),
      label: text(row.label),
      value: text(row.value),
      note: text(row.note),
      highlight: text(row.highlight),
      assetSrc: hrefOrNull(row.asset_src),
      assetAlt: text(row.asset_alt),
    })),
    smallProjects,
    microProjects,
    skillNarratives,
    skills: simpleRows("Skills", (row) => ({
      id: text(row.id),
      name: text(row.name),
    })),
    fullRecord: fullRecordSections,
    navLinks: simpleRows("NavLinks", (row) => ({
      id: text(row.id),
      label: text(row.label),
      href: text(row.href),
    })),
  };
}
