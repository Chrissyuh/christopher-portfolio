import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
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
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 6l6 6-6 6",
  cpu: "M9 9h6v6H9z M9 1v3 M15 1v3 M9 20v3 M15 20v3 M1 9h3 M1 15h3 M20 9h3 M20 15h3 M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z",
  flame: "M12 22c4.4 0 8-3.2 8-7.6 0-2.7-1.3-5-3.7-6.9.2 1.7-.5 3.1-1.8 3.9.2-2.9-1.4-5.8-4.7-8.4.5 3.5-1 5.3-2.4 7-1.2 1.4-2.4 2.8-2.4 5 0 4 3.1 7 7 7z M12 19c1.8 0 3.2-1.3 3.2-3.1 0-1.4-.8-2.7-2.3-3.8.1 1.3-.5 2.1-1.3 2.8-.7.6-1.3 1.2-1.3 2.1 0 1.2.8 2 1.7 2z",
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

const carouselAutoAdvanceMs = 6000;
const carouselInteractionPauseMs = 10000;

const SITE_URL = "https://chrisaheskett.vercel.app";
const DUOLINGO_PROFILE_URL = "https://invite.duolingo.com/profile-share/ChristopherHmm?via=share_profile_qr";
const DUOLINGO_STREAK_ENDPOINT = "/api/duolingo-streak";
const STREAK_YEAR_DAYS = 365.25;
const numberFormatter = new Intl.NumberFormat("en-US");

function list(value) {
  return Array.isArray(value) ? value : [];
}

function parseDayCount(value) {
  const match = String(value ?? "").match(/\d[\d,]*/);
  if (!match) return null;
  const days = Number(match[0].replaceAll(",", ""));
  return Number.isFinite(days) && days > 0 ? days : null;
}

function formatDayCount(days) {
  return Number.isFinite(days) ? numberFormatter.format(days) : "";
}

function formatStreakYears(days) {
  return Number.isFinite(days) ? `~${(days / STREAK_YEAR_DAYS).toFixed(2)} years` : "";
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
  const programCredentials = list(content.programCredentials);
  const issuedCredentials = programCredentials.filter((entry) => entry.entryType !== "program");
  const programEntries = programCredentials.filter((entry) => entry.entryType === "program");
  const creativeWorks = [
    ...projects.map((project) => ({
      id: project.id,
      title: project.title,
      href: project.href,
      sourceHref: project.sourceHref,
      label: project.label,
      summary: project.summary,
      role: project.role,
      teamContext: project.teamContext,
      artifactLinks: project.artifactLinks,
    })),
    ...smallProjects.map((project) => ({
      id: `more-${project.id}`,
      sectionUrl: siteUrl("/#smaller-projects"),
      title: project.title,
      href: project.href,
      sourceHref: project.sourceHref,
      label: project.type,
      summary: project.description,
    })),
    ...microProjects.map((project) => ({
      id: `small-${project.id}`,
      sectionUrl: siteUrl("/#bench-notes"),
      title: project.title,
      href: project.href,
      sourceHref: project.sourceHref,
      label: project.type,
      summary: project.description,
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
        keywords: list(project.artifactLinks).map((link) => link.label),
        ...(project.teamContext ? { creditText: project.teamContext } : {}),
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
        description: program.summary,
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

function StructuredData({ content }) {
  const json = JSON.stringify(buildStructuredData(content)).replaceAll("</", "<\\/");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

function MediaFrame({ item, label, compact = false }) {
  const mediaType = item.type === "video" ? "video" : "photo";
  const caption = item.caption || item.alt || label;
  const frameClass = compact ? "w-full flex-none" : "w-full flex-none sm:w-[calc((100%_-_0.75rem)/2)]";

  return (
    <figure className={`${frameClass} snap-start overflow-hidden border border-[#d2c8b9] bg-[#fbfaf7]`}>
      <div className="aspect-video">
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
            className="flex h-full items-center justify-center border border-dashed border-[#d6cec0] bg-[#fbfaf7] p-4"
          >
            <div className="max-w-[16rem] text-center">
              <span className="inline-flex items-center border border-[#cfc4b4] bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#827466]">
                {mediaType === "video" ? "video needed" : "photo needed"}
              </span>
              <p className="mt-3 text-xs font-medium leading-5 text-slate-600">{caption}</p>
            </div>
          </div>
        )}
      </div>
      {item.src && (
        <figcaption className="border-t border-[#e1d7c8] px-2.5 py-1.5 text-[11px] leading-4 text-slate-700 sm:px-3 sm:py-2 sm:text-xs sm:leading-5">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function MediaCarousel({ media, label, compact = false }) {
  const items = list(media);
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastInteractionAt, setLastInteractionAt] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const maxStartIndex = Math.max(items.length - visibleCount, 0);
  const safeActiveIndex = items.length > 0 ? Math.min(activeIndex, maxStartIndex) : 0;
  const canScroll = maxStartIndex > 0;
  const canMoveBackward = safeActiveIndex > 0;
  const canMoveForward = safeActiveIndex < maxStartIndex;

  const markInteraction = useCallback(() => {
    setLastInteractionAt(Date.now());
  }, []);

  const measureVisibleCount = useCallback(() => {
    const track = trackRef.current;
    const firstSlide = track?.children?.[0];

    if (!track || !firstSlide) {
      setVisibleCount(1);
      return;
    }

    const trackWidth = track.getBoundingClientRect().width;
    const slideWidth = firstSlide.getBoundingClientRect().width;
    const nextVisibleCount = slideWidth > 0 ? Math.max(1, Math.min(items.length, Math.floor((trackWidth + 1) / slideWidth))) : 1;

    setVisibleCount((current) => (current === nextVisibleCount ? current : nextVisibleCount));
  }, [items.length]);

  const goTo = useCallback(
    (index, userInitiated = false) => {
      if (items.length === 0) return;

      const nextIndex = Math.max(0, Math.min(index, maxStartIndex));

      if (userInitiated) {
        markInteraction();
      }

      setActiveIndex(nextIndex);
    },
    [items.length, markInteraction, maxStartIndex],
  );

  const moveByPage = useCallback(
    (direction) => {
      goTo(safeActiveIndex + direction * visibleCount, true);
    },
    [goTo, safeActiveIndex, visibleCount],
  );

  const handleKeyDown = useCallback(
    (event) => {
      markInteraction();

      if (!canScroll) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveByPage(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveByPage(1);
      }
    },
    [canScroll, markInteraction, moveByPage],
  );

  useEffect(() => {
    measureVisibleCount();

    const track = trackRef.current;

    if (!track) return undefined;

    if (window.ResizeObserver) {
      const observer = new window.ResizeObserver(measureVisibleCount);
      observer.observe(track);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", measureVisibleCount);
    return () => window.removeEventListener("resize", measureVisibleCount);
  }, [measureVisibleCount]);

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
    if (!canScroll) return undefined;

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return undefined;

    const msSinceInteraction = lastInteractionAt ? Date.now() - lastInteractionAt : carouselInteractionPauseMs;
    const delay =
      lastInteractionAt && msSinceInteraction < carouselInteractionPauseMs
        ? carouselInteractionPauseMs - msSinceInteraction
        : carouselAutoAdvanceMs;

    const timer = window.setTimeout(() => {
      setActiveIndex((index) => {
        const currentIndex = Math.min(index, maxStartIndex);
        return currentIndex >= maxStartIndex ? 0 : Math.min(currentIndex + visibleCount, maxStartIndex);
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [canScroll, lastInteractionAt, maxStartIndex, safeActiveIndex, visibleCount]);

  if (items.length === 0) return null;

  return (
    <div
      className={compact ? "mt-3 min-w-0 sm:mt-4" : "mt-4 min-w-0 sm:mt-5"}
      aria-label={`${label} media`}
      aria-roledescription="carousel"
      onFocusCapture={markInteraction}
      onPointerDown={markInteraction}
      onKeyDown={handleKeyDown}
      onWheel={markInteraction}
    >
      {canScroll && (
        <div className="mb-1.5 flex justify-end gap-1.5 sm:mb-2">
          <button
            type="button"
            aria-label={`Previous media for ${label}`}
            disabled={!canMoveBackward}
            onClick={() => moveByPage(-1)}
            className="grid h-8 w-8 place-items-center border border-[#cfc4b4] bg-white text-slate-950 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#f8f6f1] disabled:text-slate-400 sm:h-9 sm:w-9"
          >
            <Icon name="chevronLeft" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Next media for ${label}`}
            disabled={!canMoveForward}
            onClick={() => moveByPage(1)}
            className="grid h-8 w-8 place-items-center border border-[#cfc4b4] bg-white text-slate-950 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#f8f6f1] disabled:text-slate-400 sm:h-9 sm:w-9"
          >
            <Icon name="chevronRight" className="h-4 w-4" />
          </button>
        </div>
      )}
      <div ref={trackRef} className="flex w-full min-w-0 snap-x gap-2 overflow-hidden pb-1 sm:gap-3 sm:pb-2">
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

function TitleBlock({ code, title, children, as: Heading = "h2", className = "" }) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {code && <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-[#244fd6] sm:text-[11px]">{code}</p>}
      <Heading className={cn(code ? "mt-1.5 sm:mt-2" : "", "text-xl font-semibold leading-tight tracking-normal text-slate-950 md:text-[2.35rem]")}>
        {title}
      </Heading>
      {children && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">{children}</p>}
    </div>
  );
}

function SectionHeader({ code, title, children }) {
  return (
    <div className="mb-5 border-t border-[#d2c8b9] pt-5 sm:mb-8 sm:pt-7">
      <TitleBlock code={code} title={title}>
        {children}
      </TitleBlock>
    </div>
  );
}

function ProjectFact({ label, children }) {
  if (!children) return null;

  return (
    <div className="border border-[#e1d7c8] bg-[#fbfaf7] p-2.5 sm:p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#827466]">{label}</p>
      <p className="mt-1.5 text-xs leading-5 text-slate-800 sm:mt-2 sm:text-sm sm:leading-6">{children}</p>
    </div>
  );
}

function ProjectLinkButton({ href, label, icon = "arrowRight", type }) {
  if (!href || !label) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center border border-[#cfc4b4] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-950 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 sm:px-3 sm:py-2 sm:text-xs"
    >
      {icon !== "arrowRight" && <Icon name={icon} className="mr-2 h-3.5 w-3.5" />}
      {type && <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#827466]">{type}</span>}
      {label}
      {icon === "arrowRight" && <Icon name="arrowRight" className="ml-2 h-3.5 w-3.5" />}
    </a>
  );
}

function projectArtifactButtons(project, meta) {
  const primaryLinks = [
    {
      id: `${project.id}-primary`,
      href: project.href,
      label: project.bestLinkLabel || meta.projectOpenLabel,
      type: "live",
      icon: "arrowRight",
    },
    {
      id: `${project.id}-source`,
      href: project.sourceHref,
      label: meta.projectSourceLabel,
      type: "source",
      icon: "github",
    },
  ];

  const artifactLinks = list(project.artifactLinks).map((link) => ({
    ...link,
    icon: link.type === "source" ? "github" : "arrowRight",
  }));
  const seen = new Set();

  return [...primaryLinks, ...artifactLinks].filter((link) => {
    if (!link.href || !link.label || seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

function ProjectRow({ project, index, meta }) {
  const style = accentStyles[project.accent] ?? accentStyles.blue;
  const artifactButtons = projectArtifactButtons(project, meta);
  const hasSidebar = Boolean(project.logoSrc || artifactButtons.length > 0);
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
      className="group grid min-w-0 scroll-mt-20 border border-[#d2c8b9] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(34,28,18,0.08)] sm:scroll-mt-24 xl:grid-cols-[190px_minmax(0,1fr)]"
    >
      <div className={`border-b border-[#e1d7c8] p-3 sm:p-5 xl:border-b-0 xl:border-r ${style.soft}`}>
        <div className="flex items-start justify-between gap-3">
          <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${style.text}`}>{project.label}</p>
          <span className={`h-2.5 w-2.5 rounded-full ${style.bg}`} />
        </div>
        <p className="mt-3 w-fit border border-[#d6cec0] bg-white px-2 py-1 text-[11px] font-medium leading-4 text-slate-700 sm:mt-6 sm:text-xs">{project.status}</p>
        {project.teamContext && (
          <div className="mt-2 border-t border-[#d6cec0] pt-2 sm:mt-5 sm:pt-4">
            <p className="text-xs font-semibold leading-5 text-slate-900 sm:text-sm">{project.teamContext}</p>
          </div>
        )}
      </div>

      <div className={cn("grid min-w-0", hasSidebar && "lg:grid-cols-[minmax(0,1fr)_250px]")}>
        <div className="min-w-0 p-4 md:p-6">
          <h3 className="text-xl font-semibold leading-tight tracking-[-0.02em] text-slate-950 sm:text-2xl sm:tracking-[-0.03em]">{project.title}</h3>
          <p className="mt-2.5 max-w-3xl text-sm leading-6 text-slate-700 sm:mt-3 sm:text-base sm:leading-7 md:text-lg">{project.summary}</p>
          <div className="mt-4 sm:mt-5">
            <ProjectFact label={meta.projectRoleLabel}>{project.role}</ProjectFact>
          </div>
          <MediaCarousel media={project.media} label={project.title} />
        </div>

        {hasSidebar && (
          <div className="border-t border-[#e1d7c8] bg-[#fbfaf7] p-4 sm:p-5 lg:border-l lg:border-t-0">
            {project.logoSrc && (
              <div>
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
            {artifactButtons.length > 0 && (
              <div className={cn("flex flex-col gap-2", project.logoSrc && "mt-4 sm:mt-5")}>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#827466]">{meta.projectArtifactLinksLabel}</p>
                {artifactButtons.map((link) => (
                  <ProjectLinkButton key={link.id ?? link.href} href={link.href} label={link.label} icon={link.icon} type={link.type} />
                ))}
              </div>
            )}
          </div>
        )}
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
        <p className="w-fit border border-[#d6cec0] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#827466]">{project.type}</p>
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
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <h3 className="text-base font-semibold tracking-[-0.02em] text-slate-950 sm:text-lg">{project.title}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-700 sm:mt-3 sm:text-sm sm:leading-6">{project.description}</p>
          <MediaCarousel media={project.media} label={project.title} compact />
        </div>
        <div>
          {(project.href || project.sourceHref) && (
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
              {project.href && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center border border-[#cfc4b4] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-950 transition hover:bg-[#f5f3ee] sm:px-3 sm:py-2 sm:text-xs"
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
                  className="inline-flex items-center justify-center border border-[#cfc4b4] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-950 transition hover:bg-[#f5f3ee] sm:px-3 sm:py-2 sm:text-xs"
                >
                  <Icon name="github" className="mr-2 h-3.5 w-3.5" />
                  Source
                </a>
              )}
            </div>
          )}
          <div className="mt-4 h-1 w-14 bg-[#244fd6] opacity-80 sm:mt-5 sm:h-1.5 sm:w-16" />
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
    <aside className="border border-[#d2c8b9] bg-white p-3 shadow-sm sm:p-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {meta.academicSchoolLogoSrc && (
            <a
              href={meta.academicSchoolHref}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${schoolName} website`}
              className="grid h-16 w-16 shrink-0 place-items-center border border-[#d6cec0] bg-white p-1 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 sm:h-20 sm:w-20"
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
            <p className="mt-2 text-xs leading-5 text-slate-700">{meta.academicSchoolContext}</p>
          </div>
        </div>

        <div className="border-t border-[#e1d7c8] pt-3 md:min-w-[260px] md:border-l md:border-t-0 md:pl-4 md:pt-0">
          <p className="text-xs leading-5 text-slate-700">{meta.academicSchoolDistrictRank}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-950">{meta.academicSchoolRankSummary}</p>

          {sourceLinks.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 sm:mt-3">
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

function useDuolingoStreak(item) {
  const fallbackDays = parseDayCount(item.value);
  const [days, setDays] = useState(fallbackDays);

  useEffect(() => {
    if (item.dynamicSource !== "duolingo") return undefined;

    const controller = new AbortController();
    const params = new URLSearchParams({ username: item.username || "ChristopherHmm" });

    fetch(`${DUOLINGO_STREAK_ENDPOINT}?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Duolingo streak fetch failed with HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((payload) => {
        if (Number.isFinite(payload?.streak) && payload.streak > 0) {
          setDays(payload.streak);
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError" && import.meta.env.DEV) {
          console.warn("Duolingo streak live fetch failed; using generated snapshot.", error);
        }
      });

    return () => controller.abort();
  }, [item.dynamicSource, item.username]);

  return {
    days,
    displayDays: formatDayCount(days),
    displayYears: formatStreakYears(days) || item.note,
  };
}

function DuolingoStreakCard({ item, index }) {
  const { displayDays, displayYears } = useDuolingoStreak(item);
  const profileHref = item.href || DUOLINGO_PROFILE_URL;
  const profileLabel = item.hrefLabel || "Duolingo profile";

  return (
    <motion.article
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, delay: index * 0.035 }}
      className="relative overflow-hidden border border-[#d8b451] bg-[linear-gradient(180deg,#fffdf7_0%,#ffffff_42%)] p-4 shadow-sm sm:p-5"
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-[#d7a31f]" />
      <Icon name="flame" className="absolute -bottom-3 -right-2 h-16 w-16 text-[#d7a31f]/10" />
      <a
        href={profileHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Open Duolingo profile"
        className="absolute right-3 top-3 inline-flex items-center gap-1.5 border border-[#d8b451] bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-900 transition hover:bg-[#fff8db] focus:outline-none focus:ring-2 focus:ring-[#d7a31f] focus:ring-offset-2 sm:px-2.5 sm:py-1.5 sm:text-[11px]"
      >
        {profileLabel}
        <Icon name="arrowRight" className="h-3 w-3" />
      </a>
      <div className="relative pr-20">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#827466] sm:text-xs sm:tracking-[0.2em]">
          <span className="grid h-6 w-6 place-items-center border border-[#d8b451] bg-[#fff4bf] text-[#b45309]">
            <Icon name={item.icon || "flame"} className="h-4 w-4" />
          </span>
          {item.label}
        </p>
        <p className="mt-3 flex items-end gap-1.5 text-2xl font-semibold leading-none tracking-[-0.03em] text-slate-950 sm:text-3xl" aria-live="polite">
          {displayDays || item.value}
          <span className="pb-0.5 text-xs font-semibold tracking-normal text-slate-700 sm:text-sm">days</span>
        </p>
        <p className="mt-2 text-xs font-medium leading-5 text-slate-700 sm:text-sm">{displayYears}</p>
      </div>
    </motion.article>
  );
}

function LearningHighlightCard({ item, index }) {
  if (item.dynamicSource === "duolingo" || item.id === "duolingo-streak") {
    return <DuolingoStreakCard item={item} index={index} />;
  }

  return <AcademicCard item={item} index={index} />;
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
        "relative overflow-hidden border border-[#d2c8b9] bg-white p-4 shadow-sm sm:p-5",
        isGoldHighlight && "border-[#d8b451] bg-[linear-gradient(180deg,#fffdf7_0%,#ffffff_42%)]",
      )}
    >
      {isGoldHighlight && (
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-[#d7a31f]" />
      )}
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#827466] sm:text-xs sm:tracking-[0.2em]">{item.label}</p>
      <p className="mt-2 text-xl font-semibold leading-6 tracking-[-0.02em] text-slate-950 sm:mt-3 sm:text-2xl sm:leading-7 sm:tracking-[-0.03em]">{item.value}</p>
      {item.note && <p className="mt-2 text-xs leading-5 text-slate-700 sm:mt-3 sm:text-sm sm:leading-6">{item.note}</p>}
    </motion.div>
  );
}

function CredentialPreviewPopover({ credential, label, missingLabel, align = "left" }) {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const panelId = `credential-preview-${credential.id}`;

  useEffect(() => {
    if (!isOpen) return undefined;

    function closePreview(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
        setIsPinned(false);
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsPinned(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", closePreview);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closePreview);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  function handlePointerEnter(event) {
    if (event.pointerType === "mouse") setIsOpen(true);
  }

  function handlePointerLeave(event) {
    if (event.pointerType === "mouse" && !isPinned) setIsOpen(false);
  }

  function handleBlur(event) {
    if (!containerRef.current?.contains(event.relatedTarget) && !isPinned) {
      setIsOpen(false);
    }
  }

  function handleClick() {
    const nextOpen = !isPinned;
    setIsOpen(nextOpen);
    setIsPinned(nextOpen);
  }

  return (
    <div
      ref={containerRef}
      className="relative basis-full md:basis-auto"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onBlur={handleBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onFocus={() => setIsOpen(true)}
        onClick={handleClick}
        className="inline-flex items-center border border-[#cfc4b4] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-900 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 sm:px-3 sm:py-2 sm:text-xs"
      >
        <Icon name={credential.scanAvailable ? "school" : "list"} className="mr-1.5 h-3.5 w-3.5" />
        {credential.scanAvailable ? label : missingLabel}
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-label={`${credential.credential} preview`}
          className={cn(
            "relative z-40 mt-3 w-full border border-[#cfc4b4] bg-white p-2.5 shadow-[0_18px_50px_rgba(34,28,18,0.18)] sm:p-3 md:absolute md:bottom-[calc(100%+0.75rem)] md:top-auto md:mt-0 md:w-[min(30vw,22rem)] md:translate-y-0",
            align === "right" ? "md:right-0" : "md:left-0",
          )}
        >
          {credential.scanSrc ? (
            <figure>
              <img
                src={credential.scanSrc}
                alt={credential.scanAlt || credential.credential}
                className="max-h-[62vh] w-full bg-[#fbfaf7] object-contain md:max-h-[26vh]"
              />
              {credential.scanCaption && (
                <figcaption className="border-t border-[#e1d7c8] px-1 pt-2 text-xs leading-5 text-slate-700">
                  {credential.scanCaption}
                </figcaption>
              )}
            </figure>
          ) : (
            <div className="flex min-h-36 items-center gap-3 border border-dashed border-[#d6cec0] bg-[#fbfaf7] p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-[#d2c8b9] bg-white text-[#827466]">
                <Icon name="school" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-950">Certificate scan not added yet</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">The credential is listed without a public scan.</p>
              </div>
            </div>
          )}
          <span aria-hidden="true" className="absolute -top-2 left-8 h-4 w-4 rotate-45 border-l border-t border-[#cfc4b4] bg-white md:hidden" />
          <span
            aria-hidden="true"
            className={cn(
              "absolute -bottom-2 hidden h-4 w-4 rotate-45 border-b border-r border-[#cfc4b4] bg-white md:block",
              align === "right" ? "right-8" : "left-8",
            )}
          />
        </div>
      )}
    </div>
  );
}

function ProgramCredentialCard({ credential, index, meta }) {
  const accent = accentStyles[credential.accent] ?? accentStyles.amber;
  const isCredential = credential.entryType !== "program";
  const eyebrow = credential.id === "stanford-ai4all"
    ? "Stanford Pre-Collegiate Studies"
    : isCredential ? "certificate of completion" : credential.issuer;
  const detail = credential.date;
  const initials = credential.program
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={cn("relative border bg-white p-4 shadow-sm sm:p-5", accent.border)}
    >
      {credential.id === "tetc" ? (
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[#00afab]" />
      ) : (
        <div aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", credential.id === "stanford-ai4all" ? "bg-[#8c1515]" : accent.bg)} />
      )}
      <div className="flex items-start gap-3 sm:gap-4">
        {credential.logoSrc ? (
          <a
            href={credential.logoHref || credential.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${credential.program} website`}
            className={cn(
              "grid h-12 shrink-0 place-items-center border border-[#d6cec0] bg-white p-1.5 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 sm:h-14",
              isCredential ? "w-16 sm:w-20" : "w-24 sm:w-28",
            )}
          >
            <img src={credential.logoSrc} alt={credential.logoAlt || `${credential.program} logo`} loading="lazy" className="h-full w-full object-contain" />
          </a>
        ) : (
          <div className={cn("grid h-12 w-16 shrink-0 place-items-center border font-mono text-sm font-semibold", accent.border, accent.soft, accent.text)} aria-hidden="true">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#827466]">{eyebrow}</p>
          <h3 className="mt-1 text-base font-semibold leading-5 text-slate-950 sm:text-lg sm:leading-6">{credential.program}</h3>
          {detail && <p className="mt-1 text-[11px] leading-4 text-slate-600 sm:text-xs">{detail}</p>}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-700 sm:text-sm sm:leading-6">{credential.summary}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
        {isCredential && (
          <CredentialPreviewPopover
            credential={credential}
            label={meta.credentialPreviewLabel || "View certificate"}
            missingLabel={meta.credentialMissingScanLabel || "Certificate scan needed"}
            align={index % 2 === 1 ? "right" : "left"}
          />
        )}
        {credential.href && (
          <a
            href={credential.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-1 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:text-[#244fd6] focus:outline-none focus:ring-2 focus:ring-slate-400 sm:text-xs"
          >
            {credential.hrefLabel || "Program site"}
            <Icon name="arrowRight" className="ml-1.5 h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </motion.article>
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
        <div className="aspect-video bg-[#fbfaf7]">
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
              className="flex h-full items-center justify-center border border-dashed border-[#d6cec0] bg-[#fbfaf7] p-3"
            >
              <div className="text-center">
                <span className="inline-flex border border-[#cfc4b4] bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#827466]">
                  {mediaType} needed
                </span>
                <p className="mt-3 text-xs font-medium leading-5 text-slate-600">{caption}</p>
              </div>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-2 flex flex-col justify-between border border-[#d2c8b9] bg-white/95 p-2.5 opacity-0 shadow-sm backdrop-blur-sm transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus:pointer-events-auto group-focus:opacity-100 sm:p-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0f766e]">
              {project.type}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-700 sm:text-sm sm:leading-6">{project.description}</p>
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

      <h3 id={labelId} className="px-2.5 py-2 text-[13px] font-semibold leading-5 tracking-[-0.02em] text-slate-950 sm:px-3 sm:py-3 sm:text-sm">
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
          ? "rounded-none bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-[#244fd6] sm:px-5 sm:py-5"
          : "rounded-none border-[#cfc4b4] bg-white px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-[#fbfaf7] sm:px-5 sm:py-5"
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
          ? "flex items-center gap-1.5 border border-slate-950 bg-slate-950 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white sm:gap-2 sm:px-3 sm:py-2 sm:text-xs sm:tracking-[0.14em]"
          : "flex items-center gap-1.5 border border-[#cfc4b4] bg-white px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 hover:text-slate-950 sm:gap-2 sm:px-3 sm:py-2 sm:text-xs sm:tracking-[0.14em]"
      }
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
      {children}
    </NavLink>
  );
}

function PortfolioPage({ content }) {
  const meta = content.meta ?? {};
  const projectsById = new Map(list(content.projects).map((project) => [project.id, project]));
  const skillGroups = list(content.skills).reduce((groups, skill) => {
    const category = skill.category || "Other";
    const existing = groups.find((group) => group.category === category);
    if (existing) existing.skills.push(skill);
    else groups.push({ category, skills: [skill] });
    return groups;
  }, []);

  return (
    <>
      <section id="top" className="relative z-10 mx-auto max-w-7xl px-3 pb-8 pt-5 sm:px-5 sm:pb-10 sm:pt-10 md:px-8 md:pb-8 md:pt-14">
        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42 }}
            className="border border-[#d2c8b9] bg-white p-4 shadow-sm sm:p-6 md:p-8"
          >
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#827466]">{meta.heroEyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.025em] text-slate-950 sm:mt-4 sm:text-4xl sm:tracking-[-0.045em] md:text-5xl">{meta.heroTitle}</h1>
            <p className="mt-3 max-w-3xl text-xl font-semibold leading-7 text-slate-900 sm:mt-5 sm:text-2xl sm:leading-8">{meta.heroLead}</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:mt-4 sm:text-base sm:leading-7">{meta.heroIntro}</p>

            <div className="mt-5 flex flex-row flex-wrap gap-2 sm:mt-8 sm:gap-3">
              <Button asChild className="rounded-none bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-[#244fd6] sm:px-5 sm:py-5">
                <a href="#projects">
                  {meta.openProjectsLabel} <Icon name="arrowRight" className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild className="rounded-none bg-white px-4 py-3 text-sm font-semibold text-slate-950 ring-1 ring-[#cfc4b4] hover:bg-[#fbfaf7] sm:px-5 sm:py-5">
                <a href={meta.contactGithubHref} target="_blank" rel="noreferrer"><Icon name="github" className="mr-2 h-4 w-4" />{meta.contactGithubLabel}</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="projects" className="relative z-10 mx-auto max-w-7xl px-3 py-8 sm:px-5 sm:py-10 md:px-8 md:py-10">
        <SectionHeader title={meta.projectIndexTitle} />
        <div className="grid gap-3 sm:gap-4">
          {list(content.projects).map((project, index) => (
            <ProjectRow key={project.id} project={project} index={index} meta={meta} />
          ))}
        </div>
      </section>

      <section id="bench" className="relative z-10 mx-auto max-w-7xl px-3 py-8 sm:px-5 sm:py-10 md:px-8 md:py-14">
        <SectionHeader title={meta.skillSystemTitle} />
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {skillGroups.map((group, index) => (
            <motion.article
              key={group.category}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
              className="border border-[#d2c8b9] bg-white p-4 shadow-sm sm:p-5"
            >
              <h3 className="border-b border-[#e1d7c8] pb-3 text-base font-semibold text-slate-950 sm:text-lg">{group.category}</h3>
              <div className="mt-3 grid gap-3">
                {group.skills.map((skill) => (
                  <div key={skill.id}>
                    <p className="text-sm font-semibold text-slate-900">{skill.name}</p>
                    <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                      {list(skill.projectIds).map((projectId) => {
                        const project = projectsById.get(projectId);
                        return project ? <a key={projectId} href={`#${projectAnchorId(project)}`} className="text-[11px] text-[#244fd6] hover:underline">{project.title}</a> : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="academics" className="relative z-20 mx-auto max-w-7xl px-3 py-8 sm:px-5 sm:py-10 md:px-8 md:py-14">
        <div className="mb-4 grid gap-3 border-t border-[#d2c8b9] pt-5 sm:mb-6 sm:gap-4 sm:pt-7 lg:grid-cols-[minmax(360px,1fr)_minmax(460px,0.95fr)]">
          <TitleBlock title={meta.academicTitle} />
          <AcademicSchoolCard meta={meta} />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {list(content.academics).map((item, index) => (
            <AcademicCard key={item.id} item={item} index={index} />
          ))}
        </div>

        {list(content.programCredentials).length > 0 && (
          <div className="mt-6 border-t border-[#d2c8b9] pt-5 sm:mt-8 sm:pt-6">
            <div className="mb-3 max-w-2xl sm:mb-4">
              <h2 className="text-xl font-semibold leading-6 text-slate-950 sm:text-2xl sm:leading-7">
                {meta.credentialsTitle || "Programs and credentials"}
              </h2>
            </div>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {list(content.programCredentials).map((credential, index) => (
                <ProgramCredentialCard key={credential.id} credential={credential} index={index} meta={meta} />
              ))}
            </div>
          </div>
        )}
      </section>

      <section id="smaller-projects" className="relative z-10 mx-auto max-w-7xl px-3 py-8 sm:px-5 sm:py-12 md:px-8 md:py-16">
        <SectionHeader title={meta.smallerProjectsTitle} />
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list(content.smallProjects).map((project, index) => (
            <SmallProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      {list(content.microProjects).length > 0 && (
        <section id="bench-notes" className="relative z-10 mx-auto max-w-7xl px-3 py-8 sm:px-5 sm:py-12 md:px-8 md:py-16">
          <SectionHeader title={meta.microProjectsTitle} />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {list(content.microProjects).map((project, index) => (
              <MicroProjectTile key={project.id} project={project} index={index} meta={meta} />
            ))}
          </div>
        </section>
      )}

      {list(content.learningHighlights).length > 0 && (
        <section id="learning" className="relative z-10 mx-auto max-w-7xl px-3 py-8 sm:px-5 sm:py-10 md:px-8 md:py-14">
          <SectionHeader title={meta.learningTitle} />
          <div className="max-w-md">
            {list(content.learningHighlights).map((item, index) => <LearningHighlightCard key={item.id} item={item} index={index} />)}
          </div>
        </section>
      )}

      <ContactSection content={content} />
    </>
  );
}

function RecordPage({ content }) {
  const meta = content.meta ?? {};

  return (
    <>
      <section id="top" className="relative z-10 mx-auto max-w-7xl px-3 pb-6 pt-5 sm:px-5 sm:pb-10 sm:pt-10 md:px-8 md:pb-14 md:pt-14">
        <div className="border border-[#d2c8b9] bg-white p-4 shadow-sm sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-start md:justify-between">
            <TitleBlock title={meta.recordTitle} as="h1" className="max-w-4xl" />
            <Button asChild className="self-start rounded-none bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-[#244fd6] sm:px-5 sm:py-5">
              <Link to="/">{meta.backPortfolioLabel}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-3 py-6 sm:px-5 sm:py-8 md:px-8 md:py-12">
        <div className="grid gap-3 sm:gap-5">
          {list(content.fullRecord).map((section, sectionIndex) => (
            <motion.article
              key={section.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: sectionIndex * 0.035 }}
              className="border border-[#d2c8b9] bg-white shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-[#d2c8b9] bg-[#fbfaf7] p-3 sm:p-5">
                <div className="grid h-8 w-8 shrink-0 place-items-center border border-[#d2c8b9] bg-white text-[#244fd6] sm:h-10 sm:w-10"><Icon name={section.icon} className="h-4 w-4" /></div>
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-2xl sm:tracking-[-0.03em]">{section.category}</h2>
              </div>
              <div className="divide-y divide-[#e1d7c8]">
                {list(section.items).map((item) => (
                  <div key={item.id} className="grid gap-2 p-3 sm:p-5 md:grid-cols-[minmax(180px,0.35fr)_1fr_auto] md:items-start md:gap-5">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950 sm:text-base">{item.title}</h3>
                      {item.date && <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#827466] sm:text-xs">{item.date}</p>}
                    </div>
                    <p className="text-xs leading-5 text-slate-700 sm:text-sm sm:leading-6">{item.detail}</p>
                    {item.href && <a href={item.href} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-semibold text-[#244fd6] hover:underline">{item.hrefLabel || "Open"}<Icon name="arrowRight" className="ml-1.5 h-3.5 w-3.5" /></a>}
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
    { href: meta.resumeHref, icon: "list", label: meta.resumeLabel },
  ].filter((button) => button.href && button.label);

  return (
    <section id="contact" className="relative z-10 mx-auto max-w-7xl px-3 py-8 sm:px-5 sm:py-12 md:px-8 md:py-20">
      <div className="border border-[#d2c8b9] bg-white shadow-[0_16px_45px_rgba(34,28,18,0.08)]">
        <div className="grid gap-4 p-4 sm:gap-6 sm:p-6 md:grid-cols-[1fr_300px] md:p-8">
          <TitleBlock title={meta.contactTitle}>
            {meta.contactText}
          </TitleBlock>
          <div className="flex flex-row flex-wrap justify-start gap-2 md:flex-col md:justify-end md:gap-3">
            {contactButtons.map((button) => (
              <ContactButton key={button.icon} href={button.href} icon={button.icon} primary={button.primary}>
                {button.label}
              </ContactButton>
            ))}
          </div>
        </div>
        <p className="border-t border-[#d2c8b9] bg-[#fbfaf7] p-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#827466] md:p-4 md:text-[11px] md:tracking-[0.16em]">&copy; {new Date().getFullYear()} {meta.footerName}</p>
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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 md:px-8 md:py-4">
        <Link to="/#top" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center border border-[#cfc4b4] bg-white font-mono text-xs font-semibold text-[#244fd6] shadow-sm">
            CH
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold tracking-[-0.01em] text-slate-950">{meta.navName}</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-[#827466] sm:block">{meta.navSubtitle}</span>
          </span>
        </Link>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <PageButton to="/" end icon="box">Portfolio</PageButton>
          <PageButton to="/record" icon="list">Experience</PageButton>
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
  const location = useLocation();
  const meta = content.meta ?? {};
  const documentTitle = location.pathname === "/record"
    ? meta.recordDocumentTitle ?? "Experience | Christopher Heskett"
    : meta.documentTitle ?? "Christopher Heskett | Engineering Portfolio";

  useEffect(() => {
    document.title = documentTitle;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = siteUrl(location.pathname === "/record" ? "/record" : "/");
  }, [documentTitle, location.pathname]);

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
      <MotionConfig reducedMotion="user">
        <ChristopherPortfolioShell />
      </MotionConfig>
    </BrowserRouter>
  );
}
