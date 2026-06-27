import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { usePortfolioContent } from "./content/loadPortfolioContent";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Button({ asChild = false, className = "", children, ...props }) {
  const baseClass =
    "inline-flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      className: cn(baseClass, className, children.props.className),
    });
  }

  return (
    <button className={cn(baseClass, className)} {...props}>
      {children}
    </button>
  );
}

const iconPaths = {
  arrowRight: "M5 12h14M13 5l7 7-7 7",
  cpu: "M9 9h6v6H9z M9 1v3 M15 1v3 M9 20v3 M15 20v3 M1 9h3 M1 15h3 M20 9h3 M20 15h3 M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z",
  github:
    "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.8c0-1-.4-1.7-.9-2.2 3-.3 6.1-1.5 6.1-6.6 0-1.5-.5-2.7-1.4-3.7.1-.3.6-1.8-.1-3.7 0 0-1.2-.4-3.8 1.4a13.2 13.2 0 0 0-7 0C6.3.6 5.1 1 5.1 1c-.7 1.9-.2 3.4-.1 3.7a5.2 5.2 0 0 0-1.4 3.7c0 5.1 3.1 6.3 6.1 6.6-.4.4-.8 1-.9 1.8v4.2",
  linkedin: "M6.5 10v9M6.5 6.5v.1M10.5 19v-9M10.5 13.5c0-2 1.2-3.5 3.5-3.5s3.5 1.5 3.5 4v5M3 3h18v18H3z",
  mail: "M4 6h16v12H4z M4 7l8 6 8-6",
  printer:
    "M7 8V3h10v5 M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M7 14h10v7H7z M17 11h.01",
  school: "M3 10l9-5 9 5-9 5-9-5z M7 12v5c2 2 8 2 10 0v-5 M21 10v7",
  wrench: "M14.7 6.3a4 4 0 0 0-5 5L3 18v3h3l6.7-6.7a4 4 0 0 0 5-5l-2.8 2.8-3-3 2.8-2.8z",
  zap: "M13 2L3 14h8l-1 8 11-14h-8l1-6z",
  layers: "M12 3l9 5-9 5-9-5 9-5z M3 12l9 5 9-5 M3 16l9 5 9-5",
  gauge: "M4 14a8 8 0 0 1 16 0 M12 14l4-4 M8 18h8",
  route: "M4 6h6a4 4 0 0 1 4 4v4a4 4 0 0 0 4 4h2 M4 6l3-3M4 6l3 3 M20 18l-3-3M20 18l-3 3",
  bolt: "M8 2h8l-2 7h5l-9 13 2-9H7z",
  box: "M4 7l8-4 8 4v10l-8 4-8-4z M4 7l8 4 8-4 M12 11v10",
  target:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  link: "M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1 M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z M5 5H3v3a4 4 0 0 0 4 4M19 5h2v3a4 4 0 0 1-4 4",
};

function Icon({ name, className = "h-5 w-5" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={iconPaths[name] ?? iconPaths.box} />
    </svg>
  );
}

const accentStyles = {
  blue: { text: "text-[#244fd6]", bg: "bg-[#244fd6]", soft: "bg-[#eef2ff]", border: "border-[#bdc8ff]" },
  teal: { text: "text-[#0f766e]", bg: "bg-[#0f766e]", soft: "bg-[#eef8f6]", border: "border-[#a9d9d3]" },
  amber: { text: "text-[#b45309]", bg: "bg-[#b45309]", soft: "bg-[#fff7ed]", border: "border-[#f0c28c]" },
  clay: { text: "text-[#8b5e3c]", bg: "bg-[#8b5e3c]", soft: "bg-[#f7f0ea]", border: "border-[#d7b99f]" },
};

const SITE_URL = "https://chrisaheskett.vercel.app";

function list(value) {
  return Array.isArray(value) ? value : [];
}

function siteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

function stripMailto(href) {
  return href?.startsWith("mailto:") ? href.slice("mailto:".length) : href;
}

function buildStructuredData(content) {
  const meta = content.meta ?? {};
  const personId = `${siteUrl("/")}#christopher-heskett`;
  const websiteId = `${siteUrl("/")}#website`;
  const projects = list(content.projects);
  const smallProjects = list(content.smallProjects);
  const microProjects = list(content.microProjects);
  const creativeWorks = [
    ...projects.map((project) => ({
      id: project.id,
      title: project.title,
      href: project.href,
      sourceHref: project.sourceHref,
      label: project.label,
      summary: project.summary,
      myRole: project.myRole,
      evidence: project.evidence,
    })),
    ...smallProjects.map((project) => ({
      id: `b-${project.id}`,
      sectionUrl: siteUrl("/#smaller-projects"),
      title: project.title,
      href: project.href,
      sourceHref: project.sourceHref,
      label: project.type,
      summary: project.description,
      evidence: [],
    })),
    ...microProjects.map((project) => ({
      id: `c-${project.id}`,
      sectionUrl: siteUrl("/#bench-notes"),
      title: project.title,
      href: project.href,
      sourceHref: project.sourceHref,
      label: project.type,
      summary: project.description,
      evidence: [],
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
        email: stripMailto(meta.contactEmailHref),
        affiliation: [
          { "@type": "EducationalOrganization", name: meta.footerLeft },
          { "@type": "Organization", name: meta.footerMiddle },
        ],
        knowsAbout: list(content.skills).map((skill) => skill.name),
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
        "@id": `${siteUrl("/")}#b-level-projects`,
        name: "Christopher Heskett B-level projects",
        url: siteUrl("/#smaller-projects"),
        numberOfItems: smallProjects.length,
        itemListElement: smallProjects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: { "@id": `${siteUrl("/")}#project-b-${project.id}` },
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl("/")}#c-level-projects`,
        name: "Christopher Heskett C-level projects",
        url: siteUrl("/#bench-notes"),
        numberOfItems: microProjects.length,
        itemListElement: microProjects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: { "@id": `${siteUrl("/")}#project-c-${project.id}` },
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
        keywords: list(project.evidence),
        ...(project.myRole
          ? {
              contributor: {
                "@type": "Role",
                roleName: project.myRole,
                contributor: { "@id": personId },
              },
            }
          : {}),
        ...(project.sourceHref ? { codeRepository: project.sourceHref } : {}),
      })),
    ],
  };
}

function StructuredData({ content }) {
  const json = JSON.stringify(buildStructuredData(content)).replaceAll("</", "<\\/");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

function Tag({ children }) {
  return (
    <span className="border border-[#d6cec0] bg-[#fbfaf7] px-2.5 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

function MediaFrame({ item, label, compact = false }) {
  const mediaType = item.type === "video" ? "video" : "photo";
  const caption = item.caption || item.alt || label;
  const frameClass = compact ? "w-full flex-none" : "w-full flex-none sm:w-[calc((100%_-_0.75rem)/2)]";

  return (
    <figure className={`${frameClass} snap-start overflow-hidden border border-[#d2c8b9] bg-[#fbfaf7]`}>
      <div className={compact ? "aspect-[4/3]" : "aspect-video"}>
        {item.src && mediaType === "video" && (
          <video
            src={item.src}
            controls
            preload="metadata"
            aria-label={item.alt || caption}
            className="h-full w-full bg-slate-950 object-cover"
          />
        )}
        {item.src && mediaType === "photo" && (
          <img
            src={item.src}
            alt={item.alt || caption}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
        {!item.src && (
          <div
            aria-label={`${mediaType} placeholder: ${caption}`}
            className="flex h-full flex-col justify-between bg-[linear-gradient(135deg,rgba(36,79,214,0.12)_25%,transparent_25%,transparent_50%,rgba(36,79,214,0.12)_50%,rgba(36,79,214,0.12)_75%,transparent_75%,transparent)] bg-[size:18px_18px] p-3"
          >
            <div className="flex items-center justify-between">
              <span className="border border-[#cfc4b4] bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#827466]">
                {mediaType === "video" ? "video" : "photo"}
              </span>
              <Icon name={mediaType === "video" ? "route" : "box"} className="h-4 w-4 text-[#244fd6]" />
            </div>
            <p className="max-w-[18rem] bg-white/85 p-2 text-sm font-semibold leading-5 text-slate-950">
              {caption}
            </p>
          </div>
        )}
      </div>
      <figcaption className="border-t border-[#e1d7c8] px-3 py-2 text-xs leading-5 text-slate-700">
        {caption}
      </figcaption>
    </figure>
  );
}

function MediaCarousel({ media, label, compact = false }) {
  const items = list(media);
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastInteractionAt, setLastInteractionAt] = useState(0);
  const maxIndex = Math.max(items.length - 1, 0);
  const safeActiveIndex = items.length > 0 ? Math.min(activeIndex, maxIndex) : 0;

  const markInteraction = useCallback(() => {
    setLastInteractionAt(Date.now());
  }, []);

  const goTo = useCallback(
    (index, userInitiated = false) => {
      const normalizedIndex = ((index % items.length) + items.length) % items.length;

      if (userInitiated) {
        markInteraction();
      }

      setActiveIndex(normalizedIndex);
    },
    [items.length, markInteraction],
  );

  useEffect(() => {
    const track = trackRef.current;
    const slide = track?.children?.[safeActiveIndex];

    if (!track || !slide) return;

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const slideLeft = slide.offsetLeft - track.offsetLeft;

    track.scrollTo({
      left: slideLeft,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [safeActiveIndex]);

  useEffect(() => {
    if (items.length <= 1) return undefined;

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return undefined;

    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (Math.min(index, maxIndex) + 1) % items.length);
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [items.length, lastInteractionAt, maxIndex, safeActiveIndex]);

  if (items.length === 0) return null;

  return (
    <div
      className={compact ? "mt-4 min-w-0" : "mt-5 min-w-0"}
      aria-label={`${label} media`}
      aria-roledescription="carousel"
      onFocusCapture={markInteraction}
      onPointerDown={markInteraction}
      onKeyDown={markInteraction}
      onWheel={markInteraction}
    >
      {items.length > 1 && (
        <div className="mb-2 flex justify-end gap-2">
          <button
            type="button"
            aria-label={`Previous media for ${label}`}
            onClick={() => goTo(safeActiveIndex - 1, true)}
            className="grid h-9 w-9 place-items-center border border-[#cfc4b4] bg-white text-slate-950 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            <Icon name="arrowRight" className="h-4 w-4 rotate-180" />
          </button>
          <button
            type="button"
            aria-label={`Next media for ${label}`}
            onClick={() => goTo(safeActiveIndex + 1, true)}
            className="grid h-9 w-9 place-items-center border border-[#cfc4b4] bg-white text-slate-950 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            <Icon name="arrowRight" className="h-4 w-4" />
          </button>
        </div>
      )}
      <div ref={trackRef} className="flex w-full min-w-0 snap-x gap-3 overflow-hidden pb-2">
        {items.map((item, index) => (
          <MediaFrame key={`${item.id}-${index}`} item={item} label={label} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function projectAnchorId(project) {
  return `project-${project.id}`;
}

function FeaturedProjectIndex({ projects }) {
  const items = list(projects);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Featured project index" className="mb-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
      {items.map((project) => (
        <a
          key={project.id}
          href={`#${projectAnchorId(project)}`}
          className="group flex min-h-[118px] flex-col justify-between border border-[#d2c8b9] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-[0_12px_28px_rgba(34,28,18,0.07)] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          <span className="flex items-start justify-between gap-3">
            <span className="font-mono text-xs font-semibold text-[#244fd6]">{project.number}</span>
            <Icon name="arrowRight" className="h-4 w-4 text-[#827466] transition group-hover:text-slate-950" />
          </span>
          <span>
            <span className="block text-sm font-semibold leading-5 tracking-[-0.015em] text-slate-950">
              {project.title}
            </span>
            <span className="mt-2 block text-xs leading-5 text-slate-600">{project.status}</span>
          </span>
        </a>
      ))}
    </nav>
  );
}

function SectionHeader({ code, title, children }) {
  return (
    <div className="mb-8 grid gap-4 border-t border-[#d2c8b9] pt-7 md:grid-cols-[170px_1fr]">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#827466]">{code}</p>
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.035em] text-slate-950 md:text-4xl">
          {title}
        </h2>
        {children && <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">{children}</p>}
      </div>
    </div>
  );
}

function PreviewPanel({ project, visualMapText }) {
  const style = accentStyles[project.accent] ?? accentStyles.blue;
  const preview = project.preview ?? { parts: [] };

  return (
    <div className={`relative min-h-[190px] overflow-hidden border ${style.border} ${style.soft} p-4`}>
      <div className="absolute inset-0 opacity-45">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(23,32,51,0.13)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,32,51,0.10)_1px,transparent_1px)] bg-[size:22px_22px]" />
      </div>
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#827466]">{preview.label}</p>
            <p className="mt-2 text-base font-semibold leading-5 tracking-[-0.02em] text-slate-950">
              {preview.title}
            </p>
          </div>
          <div className={`grid h-9 w-9 place-items-center border border-current bg-white/70 ${style.text}`}>
            <Icon name="layers" className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2">
          {list(preview.parts).map((part, index) => (
            <div key={part} className="border border-white/70 bg-white/75 p-2 shadow-sm backdrop-blur-sm">
              <p className={`font-mono text-[10px] ${style.text}`}>P{index + 1}</p>
              <p className="mt-1 text-xs font-semibold text-slate-800">{part}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-current/20 pt-3">
          <p className="text-xs leading-5 text-slate-700">{visualMapText}</p>
        </div>
      </div>
    </div>
  );
}

function ProjectRow({ project, index, meta }) {
  const style = accentStyles[project.accent] ?? accentStyles.blue;
  const logoImage = project.logoSrc ? (
    <img
      src={project.logoSrc}
      alt={project.logoAlt || `${project.title} logo`}
      loading="lazy"
      className="h-8 w-full object-contain"
    />
  ) : null;

  return (
    <motion.article
      id={projectAnchorId(project)}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.045 }}
      className="group grid min-w-0 scroll-mt-24 border border-[#d2c8b9] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(34,28,18,0.08)] xl:grid-cols-[190px_270px_minmax(0,1fr)]"
    >
      <div className={`border-b border-[#e1d7c8] p-5 xl:border-b-0 xl:border-r ${style.soft}`}>
        <div className="flex items-start justify-between gap-3">
          <p className={`font-mono text-sm font-semibold ${style.text}`}>{project.number}</p>
          <span className={`h-2.5 w-2.5 rounded-full ${style.bg}`} />
        </div>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#827466]">
          {project.label}
        </p>
        <p className="mt-3 w-fit border border-[#d6cec0] bg-white px-2 py-1 text-xs font-medium text-slate-700">
          {project.status}
        </p>
      </div>

      <div className="border-b border-[#e1d7c8] p-4 xl:border-b-0 xl:border-r">
        <PreviewPanel project={project} visualMapText={meta.projectVisualMapText} />
      </div>

      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_250px]">
        <div className="min-w-0 p-5 md:p-6">
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">{project.title}</h3>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700 md:text-lg">{project.summary}</p>
          {project.myRole && (
            <p className="mt-4 border-l-2 border-[#d6cec0] pl-3 text-sm leading-6 text-slate-700">
              <span className="font-semibold text-slate-950">My role:</span> {project.myRole}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {list(project.evidence).map((item) => (
              <Tag key={item}>{item}</Tag>
            ))}
          </div>
          <MediaCarousel media={project.media} label={project.title} />
        </div>

        <div className="border-t border-[#e1d7c8] bg-[#fbfaf7] p-5 lg:border-l lg:border-t-0">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#827466]">{meta.projectNextLabel}</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{project.next}</p>
          {project.logoSrc && (
            <div className="mt-5">
              {project.logoHref ? (
                <a
                  href={project.logoHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${project.logoAlt || `${project.title} logo`} link`}
                  className="block border border-[#d6cec0] bg-white px-3 py-2 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
                  {logoImage}
                </a>
              ) : (
                <div className="border border-[#d6cec0] bg-white px-3 py-2">{logoImage}</div>
              )}
            </div>
          )}
          {(project.href || project.sourceHref) && (
            <div className="mt-5 flex flex-col gap-2">
              {project.href && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center border border-[#cfc4b4] bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-[#f5f3ee]"
                >
                  {meta.projectOpenLabel}
                  <Icon name="arrowRight" className="ml-2 h-3.5 w-3.5" />
                </a>
              )}
              {project.sourceHref && (
                <a
                  href={project.sourceHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center border border-[#cfc4b4] bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-[#f5f3ee]"
                >
                  <Icon name="github" className="mr-2 h-3.5 w-3.5" />
                  {meta.projectSourceLabel}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function SmallProjectCard({ project, index }) {
  const logoClassName = "block max-w-[150px] border border-[#d6cec0] bg-white px-2 py-1";
  const logoImage = project.logoSrc ? (
    <img
      src={project.logoSrc}
      alt={project.logoAlt || `${project.title} logo`}
      loading="lazy"
      className="h-7 w-full object-contain"
    />
  ) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, delay: index * 0.035 }}
      className="group flex h-full flex-col border border-[#d2c8b9] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(34,28,18,0.07)]"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#e1d7c8] bg-[#fbfaf7] p-4">
        <div>
          <p className="font-mono text-xs text-[#244fd6]">B{String(index + 1).padStart(2, "0")}</p>
          <p className="mt-2 w-fit border border-[#d6cec0] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#827466]">
            {project.type}
          </p>
        </div>
        {project.logoSrc ? (
          project.logoHref ? (
            <a
              href={project.logoHref}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${project.logoAlt || `${project.title} logo`} link`}
              className={cn(logoClassName, "transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2")}
            >
              {logoImage}
            </a>
          ) : (
            <div className={logoClassName}>{logoImage}</div>
          )
        ) : (
          (project.href || project.sourceHref) && (
            <Icon name="link" className="h-4 w-4 text-[#827466] transition group-hover:text-[#244fd6]" />
          )
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">{project.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">{project.description}</p>
          <MediaCarousel media={project.media} label={project.title} compact />
        </div>
        <div>
          {(project.href || project.sourceHref) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {project.href && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center border border-[#cfc4b4] bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-[#f5f3ee]"
                >
                  Open
                  <Icon name="arrowRight" className="ml-2 h-3.5 w-3.5" />
                </a>
              )}
              {project.sourceHref && (
                <a
                  href={project.sourceHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center border border-[#cfc4b4] bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-[#f5f3ee]"
                >
                  <Icon name="github" className="mr-2 h-3.5 w-3.5" />
                  Source
                </a>
              )}
            </div>
          )}
          <div className="mt-5 h-1.5 w-16 bg-[#244fd6] opacity-80" />
        </div>
      </div>
    </motion.article>
  );
}

function AcademicSchoolCard({ meta }) {
  const schoolName = meta.academicSchoolName;

  if (!schoolName) return null;

  const sourceLinks = [
    {
      href: meta.academicSchoolDistrictSourceHref,
      label: meta.academicSchoolDistrictSourceLabel,
    },
    {
      href: meta.academicSchoolRankSourceHref,
      label: meta.academicSchoolRankSourceLabel,
    },
  ].filter((link) => link.href && link.label);

  return (
    <aside className="border border-[#d2c8b9] bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="flex items-center gap-4">
          {meta.academicSchoolLogoSrc && (
            <a
              href={meta.academicSchoolHref}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${schoolName} website`}
              className="grid h-20 w-20 shrink-0 place-items-center border border-[#d6cec0] bg-white p-1 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <img
                src={meta.academicSchoolLogoSrc}
                alt={meta.academicSchoolLogoAlt || `${schoolName} logo`}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </a>
          )}
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#827466]">
              {meta.academicSchoolEyebrow}
            </p>
            <a
              href={meta.academicSchoolHref}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-base font-semibold leading-5 tracking-[-0.02em] text-slate-950 hover:text-[#244fd6]"
            >
              {schoolName}
            </a>
            <p className="mt-2 text-xs leading-5 text-slate-700">{meta.academicSchoolDistrictRank}</p>
          </div>
        </div>

        <div className="border-t border-[#e1d7c8] pt-3 md:min-w-[260px] md:border-l md:border-t-0 md:pl-4 md:pt-0">
          <p className="text-xs font-semibold leading-5 text-slate-950">
            {meta.academicSchoolRankSummary}
          </p>

          {sourceLinks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {sourceLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center border border-[#cfc4b4] bg-[#fbfaf7] px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 transition hover:bg-[#f5f3ee]"
                >
                  {link.label}
                  <Icon name="arrowRight" className="ml-1.5 h-3 w-3" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function AcademicCard({ item, index }) {
  const isGoldHighlight = item.highlight === "gold";

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, delay: index * 0.035 }}
      className={cn(
        "relative overflow-hidden border border-[#d2c8b9] bg-white p-5 shadow-sm",
        isGoldHighlight && "border-[#d8b451] bg-[linear-gradient(180deg,#fffdf7_0%,#ffffff_42%)]",
      )}
    >
      {isGoldHighlight && (
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-[#d7a31f]" />
      )}
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#827466]">{item.label}</p>
      <p className="mt-3 text-2xl font-semibold leading-7 tracking-[-0.03em] text-slate-950">{item.value}</p>
      {item.note && <p className="mt-3 text-sm leading-6 text-slate-700">{item.note}</p>}
    </motion.div>
  );
}

function MicroProjectTile({ project, index, meta }) {
  const media = list(project.media)[0] ?? {};
  const mediaType = media.type === "video" ? "video" : "photo";
  const labelId = `micro-project-${project.id}`;
  const caption = media.caption || media.alt || project.title;

  return (
    <motion.article
      tabIndex={0}
      aria-labelledby={labelId}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.22, delay: index * 0.025 }}
      className="group relative border border-[#d2c8b9] bg-white shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(34,28,18,0.08)] focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
    >
      <div className="relative overflow-hidden border-b border-[#e1d7c8]">
        <div className="aspect-[4/3] bg-[#fbfaf7]">
          {media.src && mediaType === "video" && (
            <video
              src={media.src}
              muted
              playsInline
              preload="metadata"
              aria-label={media.alt || caption}
              className="h-full w-full bg-slate-950 object-cover"
            />
          )}
          {media.src && mediaType === "photo" && (
            <img
              src={media.src}
              alt={media.alt || caption}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          )}
          {!media.src && (
            <div
              aria-label={`${mediaType} placeholder: ${caption}`}
              className="flex h-full flex-col justify-between bg-[linear-gradient(135deg,rgba(15,118,110,0.12)_25%,transparent_25%,transparent_50%,rgba(15,118,110,0.12)_50%,rgba(15,118,110,0.12)_75%,transparent_75%,transparent)] bg-[size:16px_16px] p-3"
            >
              <span className="w-fit border border-[#cfc4b4] bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#827466]">
                {mediaType}
              </span>
              <p className="bg-white/85 p-2 text-xs font-semibold leading-5 text-slate-950">{caption}</p>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-2 flex flex-col justify-between border border-[#d2c8b9] bg-white/95 p-3 opacity-0 shadow-sm backdrop-blur-sm transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus:pointer-events-auto group-focus:opacity-100">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0f766e]">
              C{String(index + 1).padStart(2, "0")} / {project.type}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{project.description}</p>
          </div>

          {(project.href || project.sourceHref) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {project.href && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center border border-[#cfc4b4] bg-white px-2.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-[#f5f3ee]"
                >
                  {meta.microProjectsOpenLabel}
                  <Icon name="arrowRight" className="ml-1.5 h-3.5 w-3.5" />
                </a>
              )}
              {project.sourceHref && (
                <a
                  href={project.sourceHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center border border-[#cfc4b4] bg-white px-2.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-[#f5f3ee]"
                >
                  <Icon name="github" className="mr-1.5 h-3.5 w-3.5" />
                  {meta.microProjectsSourceLabel}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <h3 id={labelId} className="px-3 py-3 text-sm font-semibold leading-5 tracking-[-0.02em] text-slate-950">
        {project.title}
      </h3>
    </motion.article>
  );
}

function ContactButton({ href, icon, children, primary = false }) {
  if (!href || !children) return null;

  return (
    <Button
      asChild
      className={
        primary
          ? "rounded-none bg-slate-950 px-5 py-5 text-sm font-semibold text-white hover:bg-[#244fd6]"
          : "rounded-none border-[#cfc4b4] bg-white px-5 py-5 text-sm font-semibold text-slate-950 hover:bg-[#fbfaf7]"
      }
    >
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>
        <Icon name={icon} className="mr-2 h-4 w-4" /> {children}
      </a>
    </Button>
  );
}

function PageButton({ to, icon, children, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        isActive
          ? "flex items-center gap-2 border border-slate-950 bg-slate-950 px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-white"
          : "flex items-center gap-2 border border-[#cfc4b4] bg-white px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-slate-700 hover:text-slate-950"
      }
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
      {children}
    </NavLink>
  );
}

function PortfolioPage({ content }) {
  const meta = content.meta ?? {};

  return (
    <>
      <section id="top" className="relative z-10 mx-auto max-w-7xl px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42 }}
            className="border border-[#d2c8b9] bg-white p-6 shadow-sm md:p-8"
          >
            <div className="flex flex-wrap items-center gap-2 border-b border-[#e1d7c8] pb-5">
              {list(content.heroTags).map((tag) => (
                <Tag key={tag.id}>{tag.label}</Tag>
              ))}
            </div>

            <div className="mt-7 grid gap-8 xl:grid-cols-[1fr_260px]">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#827466]">{meta.heroEyebrow}</p>
                <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.045em] text-slate-950 md:text-5xl">
                  {meta.heroTitle}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 md:text-lg">
                  {meta.heroIntro}
                </p>
              </div>

              <div className="border border-[#d2c8b9] bg-[#fbfaf7] p-4">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#827466]">{meta.currentStackTitle}</p>
                <div className="mt-4 space-y-3">
                  {list(content.currentStack).map((item) => (
                    <div key={item.id} className="flex gap-3 border-t border-[#e1d7c8] pt-3 first:border-t-0 first:pt-0">
                      <span className="font-mono text-xs text-[#244fd6]">{item.number}</span>
                      <span className="text-sm font-medium text-slate-800">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-none bg-slate-950 px-5 py-5 text-sm font-semibold text-white hover:bg-[#244fd6]">
                <a href="#projects">
                  {meta.openProjectsLabel} <Icon name="arrowRight" className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild className="rounded-none bg-white px-5 py-5 text-sm font-semibold text-slate-950 ring-1 ring-[#cfc4b4] hover:bg-[#fbfaf7]">
                <Link to="/record">{meta.viewRecordLabel}</Link>
              </Button>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.08 }}
            className="flex flex-col border border-[#d2c8b9] bg-[#fbfaf7] shadow-sm"
          >
            <div className="border-b border-[#d2c8b9] bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#827466]">{meta.focusEyebrow}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{meta.focusTitle}</h2>
                </div>
                <div className="grid h-11 w-11 place-items-center border border-[#d2c8b9] bg-[#f5f3ee] text-[#244fd6]">
                  <Icon name="target" />
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <p className="text-sm leading-6 text-slate-700">{meta.focusText}</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {list(content.evidenceTiles).map((tile) => (
                    <div key={tile.id} className="border border-[#d2c8b9] bg-white p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#827466]">{tile.top}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{tile.bottom}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 border-t border-[#d2c8b9] pt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#827466]">{meta.portfolioRuleEyebrow}</p>
                <p className="mt-2 text-sm font-semibold leading-5 text-slate-950">{meta.portfolioRuleText}</p>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      <section id="projects" className="relative z-10 mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <SectionHeader code={meta.projectIndexCode} title={meta.projectIndexTitle}>
          {meta.projectIndexText}
        </SectionHeader>
        <FeaturedProjectIndex projects={content.projects} />
        <div className="grid gap-4">
          {list(content.projects).map((project, index) => (
            <ProjectRow key={project.id} project={project} index={index} meta={meta} />
          ))}
        </div>
      </section>

      <section id="academics" className="relative z-10 mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="mb-8 grid gap-4 border-t border-[#d2c8b9] pt-7 lg:grid-cols-[170px_minmax(260px,0.7fr)_minmax(420px,1.3fr)]">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#827466]">{meta.academicCode}</p>
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.035em] text-slate-950 md:text-4xl">
              {meta.academicTitle}
            </h2>
            {meta.academicText && <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">{meta.academicText}</p>}
          </div>
          <AcademicSchoolCard meta={meta} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list(content.academics).map((item, index) => (
            <AcademicCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </section>

      <section id="smaller-projects" className="relative z-10 mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <SectionHeader code={meta.smallerProjectsCode} title={meta.smallerProjectsTitle}>
          {meta.smallerProjectsText}
        </SectionHeader>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list(content.smallProjects).map((project, index) => (
            <SmallProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      {list(content.microProjects).length > 0 && (
        <section id="bench-notes" className="relative z-10 mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
          <SectionHeader code={meta.microProjectsCode} title={meta.microProjectsTitle}>
            {meta.microProjectsText}
          </SectionHeader>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {list(content.microProjects).map((project, index) => (
              <MicroProjectTile key={project.id} project={project} index={index} meta={meta} />
            ))}
          </div>
        </section>
      )}

      <section id="bench" className="relative z-10 mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <SectionHeader code={meta.skillSystemCode} title={meta.skillSystemTitle}>
          {meta.skillSystemText}
        </SectionHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {list(content.skillNarratives).map((skill, index) => (
            <motion.article
              key={skill.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
              className="border border-[#d2c8b9] bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between border-b border-[#e1d7c8] pb-5">
                <div className="grid h-11 w-11 place-items-center border border-[#d2c8b9] bg-[#f5f3ee] text-[#244fd6]">
                  <Icon name={skill.icon} />
                </div>
                <span className="font-mono text-xs text-[#827466]">S{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="text-xl font-semibold tracking-[-0.025em] text-slate-950">{skill.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">{skill.text}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-4 border border-[#d2c8b9] bg-white p-6 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#827466]">{meta.workingVocabularyLabel}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {list(content.skills).map((skill) => (
              <Tag key={skill.id}>{skill.name}</Tag>
            ))}
          </div>
        </div>
      </section>

      <ContactSection content={content} />
    </>
  );
}

function RecordPage({ content }) {
  const meta = content.meta ?? {};

  return (
    <>
      <section id="top" className="relative z-10 mx-auto max-w-7xl px-5 pb-10 pt-10 md:px-8 md:pb-14 md:pt-14">
        <div className="border border-[#d2c8b9] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#827466]">{meta.recordEyebrow}</p>
              <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.045em] text-slate-950 md:text-5xl">
                {meta.recordTitle}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700 md:text-lg">
                {meta.recordIntro}
              </p>
            </div>
            <Button asChild className="rounded-none bg-slate-950 px-5 py-5 text-sm font-semibold text-white hover:bg-[#244fd6]">
              <Link to="/">{meta.backPortfolioLabel}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <div className="grid gap-5">
          {list(content.fullRecord).map((section, sectionIndex) => (
            <motion.article
              key={section.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: sectionIndex * 0.035 }}
              className="border border-[#d2c8b9] bg-white shadow-sm"
            >
              <div className="grid border-b border-[#d2c8b9] bg-[#fbfaf7] md:grid-cols-[220px_1fr]">
                <div className="flex items-center gap-3 border-b border-[#d2c8b9] p-5 md:border-b-0 md:border-r">
                  <div className="grid h-10 w-10 place-items-center border border-[#d2c8b9] bg-white text-[#244fd6]">
                    <Icon name={section.icon} className="h-4 w-4" />
                  </div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#827466]">R{String(sectionIndex + 1).padStart(2, "0")}</p>
                </div>
                <div className="p-5">
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">{section.category}</h2>
                </div>
              </div>
              <div className="divide-y divide-[#e1d7c8]">
                {list(section.items).map((item, itemIndex) => (
                  <div key={item.id} className="grid gap-3 p-5 md:grid-cols-[70px_1fr]">
                    <p className="font-mono text-xs text-[#244fd6]">{String(itemIndex + 1).padStart(2, "0")}</p>
                    <p className="text-sm leading-6 text-slate-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <ContactSection content={content} />
    </>
  );
}

function ContactSection({ content }) {
  const meta = content.meta ?? {};
  const contactButtons = [
    { href: meta.contactEmailHref, icon: "mail", label: meta.contactEmailLabel, primary: true },
    { href: meta.contactGithubHref, icon: "github", label: meta.contactGithubLabel },
    { href: meta.contactProjectHref, icon: "link", label: meta.contactProjectLabel },
  ];

  return (
    <section id="contact" className="relative z-10 mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
      <div className="border border-[#d2c8b9] bg-white shadow-[0_16px_45px_rgba(34,28,18,0.08)]">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_300px] md:p-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#827466]">{meta.contactEyebrow}</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-4xl">
              {meta.contactTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">{meta.contactText}</p>
          </div>
          <div className="flex flex-col justify-end gap-3">
            {contactButtons.map((button) => (
              <ContactButton key={button.icon} href={button.href} icon={button.icon} primary={button.primary}>
                {button.label}
              </ContactButton>
            ))}
          </div>
        </div>
        <div className="grid border-t border-[#d2c8b9] bg-[#fbfaf7] font-mono text-[11px] uppercase tracking-[0.16em] text-[#827466] md:grid-cols-3">
          <p className="border-b border-[#d2c8b9] p-4 md:border-b-0 md:border-r">{meta.footerLeft}</p>
          <p className="border-b border-[#d2c8b9] p-4 md:border-b-0 md:border-r">{meta.footerMiddle}</p>
          <p className="p-4">&copy; {new Date().getFullYear()} {meta.footerName}</p>
        </div>
      </div>
    </section>
  );
}

function Navigation({ content }) {
  const location = useLocation();
  const meta = content.meta ?? {};
  const isPortfolioRoute = location.pathname === "/";

  return (
    <nav className="sticky top-0 z-30 border-b border-[#d2c8b9] bg-[#f5f3ee]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
        <Link to="/#top" className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center border border-[#cfc4b4] bg-white font-mono text-xs font-semibold text-[#244fd6] shadow-sm">
            CH
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-[-0.01em] text-slate-950">{meta.navName}</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#827466]">{meta.navSubtitle}</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <PageButton to="/" end icon="box">Portfolio</PageButton>
          <PageButton to="/record" icon="list">Full record</PageButton>
        </div>

        {isPortfolioRoute && (
          <div className="hidden items-center gap-6 font-mono text-xs uppercase tracking-[0.16em] text-slate-600 xl:flex">
            {list(content.navLinks).map((link) => (
              <a key={link.id} className="hover:text-slate-950" href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

function ScrollToRouteTarget() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      window.setTimeout(() => {
        document.querySelector(location.hash)?.scrollIntoView();
      }, 0);
      return;
    }

    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname, location.hash]);

  return null;
}

function ChristopherPortfolioShell() {
  const content = usePortfolioContent();
  const documentTitle = content.meta?.documentTitle ?? "Christopher Portfolio";

  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-slate-950">
      <ScrollToRouteTarget />
      <div className="pointer-events-none fixed inset-0 opacity-[0.34]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,46,32,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,46,32,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <StructuredData content={content} />
      <Navigation content={content} />

      <Routes>
        <Route path="/" element={<PortfolioPage content={content} />} />
        <Route path="/record" element={<RecordPage content={content} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

export default function ChristopherPortfolio() {
  return (
    <BrowserRouter>
      <ChristopherPortfolioShell />
    </BrowserRouter>
  );
}
