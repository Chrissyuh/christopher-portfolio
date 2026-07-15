export const sheetTabNames = [
  "Meta",
  "MainProjects",
  "ProjectArtifactLinks",
  "Academics",
  "AcademicDetails",
  "ProgramCredentials",
  "LearningHighlights",
  "SmallProjects",
  "MicroProjects",
  "Skills",
  "SkillProjects",
  "ToolMedia",
  "FullRecordSections",
  "FullRecordItems",
  "NavLinks",
];

export const allowedAccents = ["blue", "teal", "amber", "clay"];

export const allowedMediaTypes = ["photo", "video", "model"];

export const allowedArtifactLinkTypes = ["live", "source", "cad", "wiring", "schematic", "demo", "notes", "release", "test", "other"];

export const allowedProgramCredentialTypes = ["program", "credential"];

export const allowedToolMediaContexts = ["project", "independent"];

export const allowedAcademicDetailFormats = ["ap-score", "grade", "text"];

const mediaSlotCount = 8;

export const allowedIcons = [
  "arrowRight",
  "bolt",
  "box",
  "cpu",
  "gauge",
  "github",
  "flame",
  "layers",
  "link",
  "linkedin",
  "list",
  "mail",
  "phone",
  "printer",
  "route",
  "school",
  "target",
  "trophy",
  "wrench",
  "zap",
];

const requiredFields = {
  MainProjects: ["id", "title", "label", "status", "accent", "summary"],
  ProjectArtifactLinks: ["id", "project_id", "label", "href", "type"],
  Academics: ["id", "label", "value"],
  AcademicDetails: ["id", "group", "format", "label", "value"],
  ProgramCredentials: ["id", "entry_type", "program", "summary", "accent"],
  LearningHighlights: ["id", "label", "value"],
  SmallProjects: ["id", "title", "type", "description"],
  MicroProjects: ["id", "title", "type", "description"],
  Skills: ["id", "category", "name"],
  SkillProjects: ["id", "skill_id"],
  ToolMedia: ["id", "skill_id", "title", "type", "context"],
  FullRecordSections: ["id", "category", "icon"],
  FullRecordItems: ["id", "section_id", "title", "detail"],
  NavLinks: ["id", "label", "href"],
};

const defaultMeta = {
  documentTitle: "Christopher Heskett | Engineering Portfolio",
  recordDocumentTitle: "Experience | Christopher Heskett",
  navName: "Christopher Heskett",
  navSubtitle: "engineering portfolio",
  heroEyebrow: "Mechatronics - Mechanical, electronic, software, robotics",
  heroTitle: "Christopher Heskett",
  heroLead: "I make software, electronics, and mechanisms that work together.",
  heroIntro: "Current work includes a full-size pinball machine, an AI-vision robotics arm, a self-watering planter PCB, and a subpixel image editor.",
  heroImageSrc: "",
  heroImageMobileSrc: "",
  heroImageAlt: "",
  heroImagePosition: "center center",
  projectIndexTitle: "Featured projects",
  academicTitle: "Academic profile",
  academicDetailsTitle: "Coursework & scores",
  academicDetailsLabel: "Coursework & scores",
  credentialsTitle: "Programs and credentials",
  activitiesTitle: "Activities and involvement",
  credentialPreviewLabel: "View certificate",
  credentialMissingScanLabel: "Certificate scan still needs to be added.",
  academicSchoolEyebrow: "early-college student",
  academicSchoolName: "Spring Early College Academy",
  academicSchoolHref: "https://seca.springisd.org/",
  academicSchoolLogoSrc: "/portfolio-media/academics/seca-logo.webp",
  academicSchoolLogoAlt: "Spring Early College Academy crest",
  academicSchoolContext: "Spring ISD dual-credit early-college program in partnership with Lone Star College.",
  academicSchoolDistrictRank: "#1-ranked Spring ISD high school.",
  academicSchoolDistrictSourceHref: "https://www.schooldigger.com/go/TX/district/41220/search.aspx?level=3",
  academicSchoolDistrictSourceLabel: "District rankings",
  academicSchoolRankSummary: "#9 Houston metro, #44 Texas, #326 national.",
  academicSchoolRankSourceHref: "https://seca.springisd.org/o/seca/article/2369574",
  academicSchoolRankSourceLabel: "Ranking details",
  smallerProjectsTitle: "More projects",
  microProjectsTitle: "Small builds",
  microProjectsOpenLabel: "Open",
  microProjectsSourceLabel: "Source",
  skillSystemTitle: "Tools",
  toolMediaTitle: "CAD work",
  toolMediaSubtitle: "Project work and independent practice.",
  toolMediaEnabled: "false",
  learningTitle: "Ongoing learning",
  recordTitle: "Experience and activities",
  contactTitle: "Contact Christopher",
  contactText: "Call, text, email, or view my work on GitHub.",
  contactPhoneHref: "tel:+19013561000",
  contactPhoneLabel: "901-356-1000",
  contactEmailHref: "mailto:Chrisaheskett@gmail.com",
  contactEmailLabel: "Email",
  contactGithubHref: "https://github.com/Chrissyuh",
  contactGithubLabel: "View GitHub",
  resumeHref: "",
  resumeLabel: "Resume",
  footerName: "Christopher Heskett",
  projectRoleLabel: "role",
  projectArtifactLinksLabel: "links",
  projectOpenLabel: "Open project",
  projectSourceLabel: "Source",
  mediaPlaceholderLabel: "needed",
  mediaSlotLabel: "media slot",
  viewRecordLabel: "Experience",
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

function compactMediaFields(row, errors, tabName, rowId) {
  return Array.from({ length: mediaSlotCount }, (_, index) => {
    const slot = index + 1;
    const type = text(row[`media_${slot}_type`]);
    const src = text(row[`media_${slot}_src`]);
    const posterSrc = text(row[`media_${slot}_poster_src`]);
    const alt = text(row[`media_${slot}_alt`]);
    const caption = text(row[`media_${slot}_caption`]);

    if (!type && !src && !posterSrc && !alt && !caption) {
      return null;
    }

    if (type && !allowedMediaTypes.includes(type)) {
      errors.push(`${tabName} row "${rowId}" has unsupported media_${slot}_type "${type}".`);
    }

    if (type === "model" && src && !posterSrc) {
      errors.push(`${tabName} row "${rowId}" must include media_${slot}_poster_src for a published model.`);
    }

    return {
      id: `media-${slot}`,
      type: type || "photo",
      src: hrefOrNull(src),
      posterSrc: hrefOrNull(posterSrc),
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

    if (media.length === 0) {
      errors.push(`MainProjects row "${id}" must include at least one media slot.`);
    }

    return {
      id,
      title: text(row.title),
      href: hrefOrNull(row.href),
      sourceHref: hrefOrNull(row.source_href),
      label: text(row.label),
      status: text(row.status),
      accent,
      summary: text(row.summary),
      teamContext: text(row.team_context),
      role: text(row.role),
      bestLinkLabel: text(row.best_link_label),
      logoSrc: hrefOrNull(row.logo_src),
      logoAlt: text(row.logo_alt),
      logoHref: hrefOrNull(row.logo_href),
      artifactLinks: [],
      media,
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

  const statRows = (tabName) => simpleRows(tabName, (row) => {
    const icon = text(row.icon);
    if (icon) {
      requireKnownValue(errors, tabName, text(row.id), "icon", icon, allowedIcons);
    }

    return {
      id: text(row.id),
      label: text(row.label),
      value: text(row.value),
      note: text(row.note),
      group: text(row.group),
      format: text(row.format),
      highlight: text(row.highlight),
      assetSrc: hrefOrNull(row.asset_src),
      assetAlt: text(row.asset_alt),
      href: hrefOrNull(row.href),
      hrefLabel: text(row.href_label),
      icon,
      dynamicSource: text(row.dynamic_source),
      username: text(row.username),
    };
  });

  const academics = statRows("Academics");
  const academicDetails = statRows("AcademicDetails");
  for (const detail of academicDetails) {
    requireKnownValue(errors, "AcademicDetails", detail.id, "format", detail.format, allowedAcademicDetailFormats);
  }
  const programCredentials = simpleRows("ProgramCredentials", (row) => {
    const id = text(row.id);
    const entryType = text(row.entry_type) || "credential";
    const accent = text(row.accent);
    const relatedProjectId = text(row.related_project_id);

    requireKnownValue(errors, "ProgramCredentials", id, "entry_type", entryType, allowedProgramCredentialTypes);
    requireKnownValue(errors, "ProgramCredentials", id, "accent", accent, allowedAccents);

    if (entryType === "credential" && !text(row.credential)) {
      errors.push(`ProgramCredentials row "${id}" is a credential but is missing required field "credential".`);
    }

    if (entryType === "credential" && !text(row.issuer)) {
      errors.push(`ProgramCredentials row "${id}" is a credential but is missing required field "issuer".`);
    }

    if (relatedProjectId && !projectsById.has(relatedProjectId)) {
      errors.push(`ProgramCredentials row "${id}" references missing related_project_id "${relatedProjectId}".`);
    }

    return {
      id,
      entryType,
      program: text(row.program),
      credential: text(row.credential),
      issuer: text(row.issuer),
      date: text(row.date),
      summary: text(row.summary),
      logoSrc: hrefOrNull(row.logo_src),
      logoAlt: text(row.logo_alt),
      logoHref: hrefOrNull(row.logo_href),
      scanSrc: hrefOrNull(row.scan_src),
      scanAlt: text(row.scan_alt),
      scanCaption: text(row.scan_caption),
      href: hrefOrNull(row.href),
      hrefLabel: text(row.href_label),
      accent,
      relatedProjectId: relatedProjectId || null,
      scanAvailable: Boolean(text(row.scan_src)),
      awardTitle: text(row.award_title),
      awardDate: text(row.award_date),
      awardDistinction: text(row.award_distinction),
      awardSummary: text(row.award_summary),
      awardQuote: text(row.award_quote),
      awardQuoteAttribution: text(row.award_quote_attribution),
    };
  });
  const programCredentialsById = new Map(programCredentials.map((credential) => [credential.id, credential]));
  const learningHighlights = statRows("LearningHighlights");
  const skills = simpleRows("Skills", (row) => ({
    id: text(row.id),
    category: text(row.category),
    name: text(row.name),
    projectIds: [],
    credentialIds: [],
  }));
  const skillsById = new Map(skills.map((skill) => [skill.id, skill]));

  for (const row of orderedRows(rowsFor(tabRows, "SkillProjects"))) {
    const id = text(row.id);
    const skillId = text(row.skill_id);
    const projectId = text(row.project_id);
    const credentialId = text(row.credential_id);
    const skill = skillsById.get(skillId);

    if (!skill) {
      errors.push(`SkillProjects row "${id}" references missing skill_id "${skillId}".`);
      continue;
    }

    if (Boolean(projectId) === Boolean(credentialId)) {
      errors.push(`SkillProjects row "${id}" must reference exactly one project_id or credential_id.`);
      continue;
    }

    if (projectId) {
      if (!projectsById.has(projectId)) {
        errors.push(`SkillProjects row "${id}" references missing project_id "${projectId}".`);
        continue;
      }

      skill.projectIds.push(projectId);
    }

    if (credentialId) {
      if (!programCredentialsById.has(credentialId)) {
        errors.push(`SkillProjects row "${id}" references missing credential_id "${credentialId}".`);
        continue;
      }

      skill.credentialIds.push(credentialId);
    }
  }

  const toolMedia = simpleRows("ToolMedia", (row) => {
    const id = text(row.id);
    const skillId = text(row.skill_id);
    const projectId = text(row.project_id);
    const type = text(row.type);
    const context = text(row.context);

    requireKnownValue(errors, "ToolMedia", id, "type", type, allowedMediaTypes);
    requireKnownValue(errors, "ToolMedia", id, "context", context, allowedToolMediaContexts);

    if (!skillsById.has(skillId)) {
      errors.push(`ToolMedia row "${id}" references missing skill_id "${skillId}".`);
    }

    if (projectId && !projectsById.has(projectId)) {
      errors.push(`ToolMedia row "${id}" references missing project_id "${projectId}".`);
    }

    if (context === "project" && !projectId) {
      errors.push(`ToolMedia row "${id}" uses project context but is missing project_id.`);
    }

    if (context === "independent" && projectId) {
      errors.push(`ToolMedia row "${id}" uses independent context but includes project_id "${projectId}".`);
    }

    return {
      id,
      skillId,
      title: text(row.title),
      type,
      src: hrefOrNull(row.src),
      alt: text(row.alt),
      caption: text(row.caption),
      context,
      projectId: projectId || null,
    };
  });

  const fullRecordSections = simpleRows("FullRecordSections", (row) => {
    const icon = text(row.icon);
    requireKnownValue(errors, "FullRecordSections", text(row.id), "icon", icon, allowedIcons);

    return {
      id: text(row.id),
      category: text(row.category),
      icon,
      showOnHomepage: ["1", "true", "yes", "y", "on"].includes(text(row.show_on_homepage).toLowerCase()),
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
      title: text(row.title),
      date: text(row.date),
      detail: text(row.detail),
      achievements: [1, 2, 3, 4]
        .map((index) => text(row[`achievement_${index}`]))
        .filter(Boolean),
      href: hrefOrNull(row.href),
      hrefLabel: text(row.href_label),
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
    projects,
    academics,
    academicDetails,
    programCredentials,
    learningHighlights,
    smallProjects,
    microProjects,
    skills,
    toolMedia,
    fullRecord: fullRecordSections,
    navLinks: simpleRows("NavLinks", (row) => ({
      id: text(row.id),
      label: text(row.label),
      href: text(row.href),
    })),
  };
}
