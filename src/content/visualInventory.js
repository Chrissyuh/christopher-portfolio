function list(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function visualKind(type) {
  if (type === "model") return "interactive_3d_model";
  if (type === "video") return "video";
  return "image";
}

export function buildVisualInventory(content) {
  const visuals = [];

  function add({ id, surface, owner, kind, src, description, caption, context }) {
    const normalizedSrc = text(src);
    const normalizedDescription = text(description) || text(caption);
    const normalizedCaption = text(caption);
    const normalizedContext = text(context);

    // The AI inventory describes evidence that is actually available. Branding,
    // fallback posters, and planned media are still usable by the UI but are not
    // separate portfolio evidence.
    if (!normalizedSrc || !normalizedDescription) return;

    visuals.push({
      id,
      surface,
      owner,
      kind,
      status: "published",
      description: normalizedDescription,
      caption: normalizedCaption,
      context: normalizedContext,
      src: normalizedSrc,
    });
  }

  const meta = content.meta ?? {};
  add({
    id: "meta/hero-image",
    surface: "hero",
    owner: "Portfolio hero",
    kind: "image",
    src: meta.heroImageSrc,
    description: meta.heroImageAlt,
  });
  if (meta.heroImageMobileSrc && meta.heroImageMobileSrc !== meta.heroImageSrc) {
    add({
      id: "meta/hero-image-mobile",
      surface: "hero",
      owner: "Portfolio hero on mobile",
      kind: "image",
      src: meta.heroImageMobileSrc,
      description: meta.heroImageAlt,
    });
  }
  function addProjectVisuals(collectionName, projects) {
    list(projects).forEach((project) => {
      list(project.media).forEach((media, index) => {
        const mediaId = media.id || `media-${index + 1}`;
        add({
          id: `${collectionName}/${project.id}/${mediaId}`,
          surface: collectionName,
          owner: `${project.title} visual ${index + 1}`,
          kind: visualKind(media.type),
          src: media.src,
          description: media.alt,
          caption: media.caption,
        });
      });
    });
  }

  addProjectVisuals("projects", content.projects);
  addProjectVisuals("moreWork", content.moreWork);

  for (const collectionName of ["academics", "academicDetails", "learningHighlights"]) {
    list(content[collectionName]).forEach((item) => {
      add({
        id: `${collectionName}/${item.id}/asset`,
        surface: collectionName,
        owner: `${item.label} visual`,
        kind: "image",
        src: item.assetSrc,
        description: item.assetAlt,
      });
    });
  }

  list(content.programCredentials).forEach((credential) => {
    const title = credential.credential || credential.program;
    add({
      id: `programCredentials/${credential.id}/scan`,
      surface: "programCredentials",
      owner: `${title} document`,
      kind: "certificate",
      src: credential.scanSrc,
      description: credential.scanAlt,
      caption: credential.scanCaption,
    });
  });

  if (meta.toolMediaEnabled === "true") {
    list(content.toolMedia).forEach((media) => {
      add({
        id: `toolMedia/${media.id}`,
        surface: "toolMedia",
        owner: media.title || `${media.skillId} visual`,
        kind: visualKind(media.type),
        src: media.src,
        description: media.alt,
        caption: media.caption,
        context: media.context,
      });
    });
  }

  return visuals;
}
