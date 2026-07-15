export const SITE_URL = "https://chrisaheskett.vercel.app";

function list(value) {
  return Array.isArray(value) ? value : [];
}

function siteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

function stripMailto(href) {
  return href?.startsWith("mailto:") ? href.slice("mailto:".length) : href;
}

function activityItemSummary(item) {
  const achievements = list(item.achievements);
  const achievementText = achievements.length > 0 ? `Achievements: ${achievements.join("; ")}.` : "";
  return [item.detail, achievementText].filter(Boolean).join(" ");
}

export function buildPortfolioStructuredData(content) {
  const meta = content.meta ?? {};
  const personId = `${siteUrl("/")}#christopher-heskett`;
  const websiteId = `${siteUrl("/")}#website`;
  const projects = list(content.projects);
  const smallProjects = list(content.smallProjects);
  const microProjects = list(content.microProjects);
  const programCredentials = list(content.programCredentials);
  const issuedCredentials = programCredentials.filter((entry) => entry.entryType !== "program");
  const programEntries = programCredentials.filter((entry) => entry.entryType === "program");
  const academicDetails = list(content.academicDetails);
  const academics = list(content.academics);
  const activityItems = list(content.fullRecord).flatMap((section) => list(section.items));
  const learningHighlights = list(content.learningHighlights);
  const awards = programCredentials.filter((entry) => entry.awardTitle).map((entry) =>
    `${entry.awardDate} ${entry.awardTitle}${entry.awardDistinction ? ` - ${entry.awardDistinction}` : ""}. ${entry.awardSummary}${entry.awardQuote ? ` ${entry.awardQuoteAttribution || "Program staff"}: "${entry.awardQuote}"` : ""}`,
  );
  const creativeWorks = [
    ...projects.map((project) => ({
      id: project.id,
      title: project.title,
      href: project.href,
      sourceHref: project.sourceHref,
      label: project.label,
      status: project.status,
      summary: project.summary,
      role: project.role,
      teamContext: project.teamContext,
      relatedProgramNote: project.relatedProgramNote,
      artifactLinks: project.artifactLinks,
      media: project.media,
    })),
    ...smallProjects.map((project) => ({
      id: `more-${project.id}`,
      sectionUrl: siteUrl("/#smaller-projects"),
      title: project.title,
      href: project.href,
      sourceHref: project.sourceHref,
      label: project.type,
      summary: project.description,
      media: project.media,
    })),
    ...microProjects.map((project) => ({
      id: `small-${project.id}`,
      sectionUrl: siteUrl("/#bench-notes"),
      title: project.title,
      href: project.href,
      sourceHref: project.sourceHref,
      label: project.type,
      summary: project.description,
      media: project.media,
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: "Christopher Heskett",
        givenName: "Christopher",
        url: siteUrl("/"),
        description: [
          meta.heroLead,
          meta.heroIntro,
          `${meta.academicSchoolName}: ${meta.academicSchoolContext} ${meta.academicSchoolDistrictRank} ${meta.academicSchoolRankSummary}`,
          academics.map((item) => `${item.label}: ${item.value}${item.note ? ` (${item.note})` : ""}.`).join(" "),
          academicDetails.map((item) => `${item.label}: ${item.value}${item.note ? ` (${item.note})` : ""}.`).join(" "),
          awards.join(" "),
          activityItems.map((item) => `${item.title}: ${activityItemSummary(item)}`).join(" "),
          learningHighlights.map((item) => `${item.label}: ${item.value}${item.note ? ` (${item.note})` : ""}.`).join(" "),
        ].filter(Boolean).join(" "),
        ...(awards.length > 0 ? { award: awards } : {}),
        ...(meta.heroImageSrc ? { image: siteUrl(meta.heroImageSrc) } : {}),
        telephone: meta.contactPhoneHref?.replace(/^tel:/, ""),
        email: stripMailto(meta.contactEmailHref),
        affiliation: [{ "@type": "EducationalOrganization", name: meta.academicSchoolName }],
        knowsAbout: list(content.skills).map((skill) => skill.name),
        hasCredential: issuedCredentials.map((credential) => ({
          "@id": `${siteUrl("/")}#credential-${credential.id}`,
        })),
        memberOf: programEntries.map((program) => ({
          "@id": `${siteUrl("/")}#program-${program.id}`,
        })),
        sameAs: [meta.contactGithubHref].filter(Boolean),
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: meta.documentTitle,
        url: siteUrl("/"),
        inLanguage: "en-US",
        author: { "@id": personId },
        description: meta.heroIntro,
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl("/")}#main-projects`,
        name: "Christopher Heskett engineering projects",
        url: siteUrl("/#projects"),
        numberOfItems: projects.length,
        itemListElement: projects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: { "@id": `${siteUrl("/")}#project-${project.id}` },
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl("/")}#more-projects`,
        name: "More projects by Christopher Heskett",
        url: siteUrl("/#smaller-projects"),
        numberOfItems: smallProjects.length,
        itemListElement: smallProjects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: { "@id": `${siteUrl("/")}#project-more-${project.id}` },
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl("/")}#small-projects`,
        name: "Small builds by Christopher Heskett",
        url: siteUrl("/#bench-notes"),
        numberOfItems: microProjects.length,
        itemListElement: microProjects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: { "@id": `${siteUrl("/")}#project-small-${project.id}` },
        })),
      },
      ...creativeWorks.map((project) => ({
        "@type": "CreativeWork",
        "@id": `${siteUrl("/")}#project-${project.id}`,
        name: project.title,
        url: project.href ?? project.sectionUrl ?? siteUrl("/#projects"),
        creator: { "@id": personId },
        about: project.label,
        description: project.summary,
        ...(project.status ? { creativeWorkStatus: project.status } : {}),
        keywords: list(project.artifactLinks).map((link) => link.label),
        ...([project.teamContext, project.relatedProgramNote].filter(Boolean).length > 0
          ? { creditText: [project.teamContext, project.relatedProgramNote].filter(Boolean).join(" ") }
          : {}),
        ...(project.role
          ? {
              contributor: {
                "@type": "Role",
                roleName: project.role,
                contributor: { "@id": personId },
              },
            }
          : {}),
        ...(project.sourceHref ? { codeRepository: project.sourceHref } : {}),
        ...(list(project.artifactLinks).length > 0
          ? { isBasedOn: list(project.artifactLinks).map((link) => link.href).filter(Boolean) }
          : {}),
        ...(list(project.media).some((item) => item.src)
          ? {
              encoding: list(project.media)
                .filter((item) => item.src)
                .map((item) => ({
                  "@type": item.type === "photo" ? "ImageObject" : item.type === "video" ? "VideoObject" : "MediaObject",
                  contentUrl: siteUrl(item.src),
                  ...(item.type === "model" ? { encodingFormat: "model/gltf-binary" } : {}),
                  ...(item.posterSrc ? { thumbnailUrl: siteUrl(item.posterSrc) } : {}),
                  ...(item.caption ? { caption: item.caption } : {}),
                })),
            }
          : {}),
      })),
      ...issuedCredentials.map((credential) => ({
        "@type": "EducationalOccupationalCredential",
        "@id": `${siteUrl("/")}#credential-${credential.id}`,
        name: credential.credential,
        description: credential.summary,
        credentialCategory: "certificate",
        recognizedBy: {
          "@type": "Organization",
          name: credential.issuer,
          ...(credential.href ? { url: credential.href } : {}),
        },
        ...(credential.date ? { dateCreated: credential.date } : {}),
        ...(credential.scanSrc ? { image: siteUrl(credential.scanSrc) } : {}),
      })),
      ...programEntries.map((program) => ({
        "@type": "EducationalOrganization",
        "@id": `${siteUrl("/")}#program-${program.id}`,
        name: program.program,
        description: [
          program.summary,
          program.awardTitle
            ? `${program.awardDate} ${program.awardTitle}${program.awardDistinction ? ` - ${program.awardDistinction}` : ""}. ${program.awardSummary}${program.awardQuote ? ` ${program.awardQuoteAttribution || "Program staff"}: "${program.awardQuote}"` : ""}`
            : "",
        ].filter(Boolean).join(" "),
        ...(program.href ? { url: program.href } : {}),
        ...(program.logoSrc ? { logo: siteUrl(program.logoSrc) } : {}),
        ...(program.issuer
          ? {
              parentOrganization: {
                "@type": "Organization",
                name: program.issuer,
              },
            }
          : {}),
      })),
    ],
  };
}
