import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { LayoutGroup, motion, MotionConfig } from "framer-motion";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
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
  pause: "M8 5v14M16 5v14",
  play: "m8 5 11 7-11 7V5z",
  maximize: "M8 3H3v5 M16 3h5v5 M8 21H3v-5 M21 16v5h-5",
  copy: "M8 8h12v12H8z M4 16V4h12",
  check: "m5 12 4 4L19 6",
  cpu: "M9 9h6v6H9z M9 1v3 M15 1v3 M9 20v3 M15 20v3 M1 9h3 M1 15h3 M20 9h3 M20 15h3 M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z",
  flame: "M12 22c4.4 0 8-3.2 8-7.6 0-2.7-1.3-5-3.7-6.9.2 1.7-.5 3.1-1.8 3.9.2-2.9-1.4-5.8-4.7-8.4.5 3.5-1 5.3-2.4 7-1.2 1.4-2.4 2.8-2.4 5 0 4 3.1 7 7 7z M12 19c1.8 0 3.2-1.3 3.2-3.1 0-1.4-.8-2.7-2.3-3.8.1 1.3-.5 2.1-1.3 2.8-.7.6-1.3 1.2-1.3 2.1 0 1.2.8 2 1.7 2z",
  github:
    "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.8c0-1-.4-1.7-.9-2.2 3-.3 6.1-1.5 6.1-6.6 0-1.5-.5-2.7-1.4-3.7.1-.3.6-1.8-.1-3.7 0 0-1.2-.4-3.8 1.4a13.2 13.2 0 0 0-7 0C6.3.6 5.1 1 5.1 1c-.7 1.9-.2 3.4-.1 3.7a5.2 5.2 0 0 0-1.4 3.7c0 5.1 3.1 6.3 6.1 6.6-.4.4-.8 1-.9 1.8v4.2",
  linkedin: "M6.5 10v9M6.5 6.5v.1M10.5 19v-9M10.5 13.5c0-2 1.2-3.5 3.5-3.5s3.5 1.5 3.5 4v5M3 3h18v18H3z",
  mail: "M4 6h16v12H4z M4 7l8 6 8-6",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z",
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
  badge: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
  awardRibbon: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M8.5 14.5 7 22l5-3 5 3-1.5-7.5",
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
  blue: { text: "text-[#244fd6]", bg: "bg-[#244fd6]", soft: "bg-[#eef2ff]", border: "border-[#bdc8ff]", hex: "#244fd6" },
  teal: { text: "text-[#0f766e]", bg: "bg-[#0f766e]", soft: "bg-[#eef8f6]", border: "border-[#a9d9d3]", hex: "#0f766e" },
  amber: { text: "text-[#b45309]", bg: "bg-[#b45309]", soft: "bg-[#fff7ed]", border: "border-[#f0c28c]", hex: "#b45309" },
  clay: { text: "text-[#8b5e3c]", bg: "bg-[#8b5e3c]", soft: "bg-[#f7f0ea]", border: "border-[#d7b99f]", hex: "#8b5e3c" },
};

const carouselAutoAdvanceMs = 6000;
const carouselInteractionPauseMs = 10000;
const carouselInteractiveExitPauseMs = 2000;
const LazyPcbModelViewer = React.lazy(() => import("./components/PcbModelViewer.jsx"));
const pcbFallbackStorageKey = "portfolio-pcb-model-fallback";

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

function FittedPhoto({ src, alt }) {
  return (
    <>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-2xl"
      />
      <span aria-hidden="true" className="absolute inset-0 bg-[#f4f1eb]/55" />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="relative z-10 h-full w-full object-contain drop-shadow-[0_2px_10px_rgba(15,23,42,0.16)] transition-transform duration-500 group-hover/media:scale-[1.012] motion-reduce:transition-none"
      />
    </>
  );
}

function ModelMedia({ item, label, onInteractionChange, onInteractiveStateChange }) {
  const hostRef = useRef(null);
  const [eligible, setEligible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const posterSrc = item.posterSrc;
  const alt = item.alt || label;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let sessionFallback = false;
    try {
      sessionFallback = window.sessionStorage.getItem(pcbFallbackStorageKey) === "1";
    } catch {
      sessionFallback = false;
    }

    function checkEligibility() {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const hasWebGl2 = (() => {
        try {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("webgl2");
          context?.getExtension("WEBGL_lose_context")?.loseContext();
          return Boolean(context);
        } catch {
          return false;
        }
      })();
      setEligible(mediaQuery.matches && !reducedMotion && !connection?.saveData && !sessionFallback && hasWebGl2);
    }

    checkEligibility();
    mediaQuery.addEventListener?.("change", checkEligibility);
    return () => mediaQuery.removeEventListener?.("change", checkEligibility);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !eligible) return undefined;

    if (!window.IntersectionObserver) {
      const timer = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(timer);
    }

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [eligible]);

  const isInteractive = eligible && visible && ready && !failed;

  useEffect(() => {
    onInteractiveStateChange?.(isInteractive);
  }, [isInteractive, onInteractiveStateChange]);

  useEffect(() => () => onInteractiveStateChange?.(false), [onInteractiveStateChange]);

  const fallback = posterSrc ? (
    <div
      className={cn(
        "absolute inset-0 transition-opacity duration-200",
        isInteractive ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      <FittedPhoto src={posterSrc} alt={alt} />
    </div>
  ) : null;

  return (
    <div ref={hostRef} className="absolute inset-0">
      {fallback}
      {eligible && visible && !failed && (
        <React.Suspense fallback={null}>
          <div
            className={cn(
              "absolute inset-0 z-10 transition-opacity duration-200",
              ready ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <LazyPcbModelViewer
              src={item.src}
              label={`${alt}. Interactive 3D model.`}
              onReady={() => setReady(true)}
              onFallback={() => setFailed(true)}
              onInteractionChange={onInteractionChange}
            />
          </div>
        </React.Suspense>
      )}
    </div>
  );
}

function MediaFrame({
  item,
  label,
  compact = false,
  fullWidth = false,
  onModelInteractionChange,
  onInteractiveHoverChange,
  onVideoFocusChange,
  videoFocusEnabled = false,
  clone = false,
}) {
  const mediaType = item.type === "video" ? "video" : item.type === "model" ? "model" : "photo";
  const caption = item.caption || item.alt || label;
  const [modelIsInteractive, setModelIsInteractive] = useState(false);
  const visibleCaption = mediaType === "model" && modelIsInteractive ? `Interactive ${caption}` : caption;
  const frameClass = compact || fullWidth ? "w-full flex-none" : "w-[82%] flex-none sm:w-[calc((100%_-_0.75rem)/2)]";

  return (
    <figure
      aria-hidden={clone || undefined}
      data-carousel-slide="true"
      data-carousel-source-type={item.sourceType || mediaType}
      className={`group/media ${frameClass} snap-start overflow-hidden border border-[#d2c8b9] bg-[#fbfaf7] transition-colors duration-300 hover:border-[#a9b7e8]`}
      onMouseEnter={mediaType === "model" && !clone ? () => onInteractiveHoverChange?.(true) : undefined}
      onMouseLeave={mediaType === "model" && !clone ? () => onInteractiveHoverChange?.(false) : undefined}
    >
      <div className="relative aspect-video overflow-hidden bg-[#ded8cd]">
        {item.src && mediaType === "video" && (
          <ViewportVideo
            item={item}
            caption={caption}
            focusEnabled={!clone && videoFocusEnabled}
            onFocusChange={onVideoFocusChange}
          />
        )}
        {item.src && mediaType === "model" && (
          <ModelMedia
            item={item}
            label={label}
            onInteractionChange={onModelInteractionChange}
            onInteractiveStateChange={setModelIsInteractive}
          />
        )}
        {item.src && mediaType === "photo" && <FittedPhoto src={item.src} alt={item.alt || caption} />}
      </div>
      {item.src && (
        <figcaption className="border-t border-[#e1d7c8] px-2.5 py-1.5 text-[11px] leading-4 text-slate-700 sm:px-3 sm:py-2 sm:text-xs sm:leading-5">
          {visibleCaption.startsWith("Interactive ") ? (
            <>
              <strong className="font-bold text-[#7c3aed]">Interactive</strong>
              {visibleCaption.slice("Interactive".length)}
            </>
          ) : (
            visibleCaption
          )}
        </figcaption>
      )}
    </figure>
  );
}

function ViewportVideo({ item, caption, focusEnabled = false, onFocusChange }) {
  const hostRef = useRef(null);
  const videoRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [focusedVideo, setFocusedVideo] = useState(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.4),
      { threshold: [0, 0.4, 0.75], rootMargin: "-10% 0px -10%" },
    );

    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      setPageVisible(!document.hidden);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (inView && pageVisible && !userPaused && !focusedVideo) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [focusedVideo, inView, pageVisible, userPaused]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      setUserPaused(false);
      video.play().catch(() => setIsPlaying(false));
    } else {
      setUserPaused(true);
      video.pause();
    }
  }

  return (
    <>
      <div ref={hostRef} className="relative h-full w-full">
        <video
          ref={videoRef}
          src={item.src}
          poster={item.posterSrc || undefined}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={item.alt || caption}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="h-full w-full bg-[#ded8cd] object-contain"
        />
        {focusEnabled && (
          <button
            type="button"
            onClick={(event) => {
              setFocusedVideo({ item, caption, trigger: event.currentTarget });
              onFocusChange?.(true);
            }}
            aria-label={`Enlarge video: ${caption}`}
            title="Enlarge video"
            className="group absolute inset-0 z-10 hidden cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white sm:block"
          >
            <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center border border-white/60 bg-slate-950/75 text-white shadow-sm backdrop-blur-sm transition group-hover:bg-slate-950">
              <Icon name="maximize" className="h-4 w-4" />
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          title={isPlaying ? "Pause video" : "Play video"}
          className="absolute bottom-2 right-2 z-20 grid h-8 w-8 place-items-center border border-white/60 bg-slate-950/75 text-white shadow-sm backdrop-blur-sm transition hover:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <Icon name={isPlaying ? "pause" : "play"} className="h-3.5 w-3.5" />
        </button>
      </div>
      <FocusedVideoDialog
        focusedVideo={focusedVideo}
        onClose={() => {
          setFocusedVideo(null);
          onFocusChange?.(false);
        }}
      />
    </>
  );
}

function FocusedVideoDialog({ focusedVideo, onClose }) {
  const dialogRef = useRef(null);
  const lastFocusedVideoRef = useRef(null);

  useEffect(() => {
    if (focusedVideo) lastFocusedVideoRef.current = focusedVideo;
  }, [focusedVideo]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (focusedVideo && !dialog.open) {
      dialog.showModal();
    } else if (!focusedVideo && dialog.open) {
      dialog.close();
    }
  }, [focusedVideo]);

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={focusedVideo ? `Enlarged video: ${focusedVideo.caption}` : "Enlarged video"}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
      onClose={() => {
        const trigger = lastFocusedVideoRef.current?.trigger;
        onClose();
        window.requestAnimationFrame(() => trigger?.focus());
      }}
      className="m-auto max-h-[calc(100dvh-4rem)] w-[88vw] max-w-6xl overflow-hidden border border-[#cfc4b4] bg-white p-0 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.35)] backdrop:bg-slate-950/65"
    >
      {focusedVideo && (
        <div className="flex max-h-[calc(100dvh-4rem)] flex-col border-t-4 border-t-[#244fd6]">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#e1d7c8] bg-[#fbfaf7] px-4 py-3">
            <h2 className="min-w-0 truncate text-sm font-semibold text-slate-950 sm:text-base">
              {focusedVideo.caption}
            </h2>
            <button
              type="button"
              aria-label="Close enlarged video"
              onClick={closeDialog}
              className="grid h-9 w-9 shrink-0 place-items-center border border-[#cfc4b4] bg-white text-xl leading-none text-slate-700 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-[#244fd6] focus:ring-offset-2"
            >
              &times;
            </button>
          </div>
          <div className="flex min-h-0 items-center justify-center bg-[#ded8cd] p-2 sm:p-3">
            <video
              src={focusedVideo.item.src}
              poster={focusedVideo.item.posterSrc || undefined}
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={focusedVideo.item.alt || focusedVideo.caption}
              className="aspect-video max-h-[calc(100dvh-10rem)] w-full bg-slate-950 object-contain"
            />
          </div>
        </div>
      )}
    </dialog>
  );
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.(query);
    if (!mediaQuery) return undefined;

    const handleChange = (event) => setMatches(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

function loopIndex(index, length) {
  return length > 0 ? ((index % length) + length) % length : 0;
}

function carouselSlideElements(track) {
  return track ? Array.from(track.querySelectorAll('[data-carousel-slide="true"]')) : [];
}

function closestCarouselSlideIndex(track, slides = carouselSlideElements(track)) {
  if (!track || slides.length === 0) return 0;

  const trackLeft = track.getBoundingClientRect().left;
  return slides.reduce(
    (closest, slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - trackLeft);
      return distance < closest.distance ? { index, distance } : closest;
    },
    { index: 0, distance: Number.POSITIVE_INFINITY },
  ).index;
}

function carouselSlideScrollLeft(track, slide) {
  const trackRect = track.getBoundingClientRect();
  const slideRect = slide.getBoundingClientRect();
  return track.scrollLeft + slideRect.left - trackRect.left;
}

function carouselCloneItem(item) {
  return item.type === "photo" ? item : { ...item, sourceType: item.type, type: "photo", src: item.posterSrc || "" };
}

function MediaCarousel({ media, label, compact = false, mobileMediaType = null }) {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const allItems = list(media).filter((item) => item.src);
  const items = isMobile && mobileMediaType ? allItems.filter((item) => item.type === mobileMediaType) : allItems;
  const itemCount = items.length;
  const carouselRef = useRef(null);
  const trackRef = useRef(null);
  const scrollEndTimerRef = useRef(null);
  const positionedTrackKeyRef = useRef("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastInteractionAt, setLastInteractionAt] = useState(0);
  const [modelInteractionActive, setModelInteractionActive] = useState(false);
  const [interactiveHoverActive, setInteractiveHoverActive] = useState(false);
  const [carouselHoverActive, setCarouselHoverActive] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [carouselVisible, setCarouselVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [interactiveResumeAt, setInteractiveResumeAt] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const safeActiveIndex = loopIndex(activeIndex, itemCount);
  const canScroll = itemCount > visibleCount;
  const cloneCount = canScroll ? Math.min(Math.max(visibleCount, 1), itemCount) : 0;
  const leadingClones = canScroll ? items.slice(-cloneCount) : [];
  const trailingClones = canScroll ? items.slice(0, cloneCount) : [];
  const trackPositionKey = `${itemCount}:${cloneCount}:${canScroll}:${items.map((item) => item.id).join("|")}`;

  const markInteraction = useCallback(() => {
    setLastInteractionAt(Date.now());
  }, []);

  const handleModelInteractionChange = useCallback(
    (active) => {
      setModelInteractionActive(active);
      if (!active) setInteractiveResumeAt(Date.now() + carouselInteractiveExitPauseMs);
    },
    [],
  );

  const handleInteractiveHoverChange = useCallback((active) => {
    setInteractiveHoverActive(active);
    if (!active) setInteractiveResumeAt(Date.now() + carouselInteractiveExitPauseMs);
  }, []);

  const measureVisibleCount = useCallback(() => {
    const track = trackRef.current;
    const firstSlide = carouselSlideElements(track)[0];

    if (!track || !firstSlide) {
      setVisibleCount(1);
      return;
    }

    const trackWidth = track.getBoundingClientRect().width;
    const slideWidth = firstSlide.getBoundingClientRect().width;
    const nextVisibleCount = slideWidth > 0 ? Math.max(1, Math.min(itemCount, Math.floor((trackWidth + 1) / slideWidth))) : 1;

    setVisibleCount((current) => (current === nextVisibleCount ? current : nextVisibleCount));
  }, [itemCount]);

  const settleTrackPosition = useCallback(() => {
    window.clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = window.setTimeout(() => {
      const track = trackRef.current;
      const slides = carouselSlideElements(track);

      if (!track || slides.length === 0 || itemCount === 0) return;

      const renderedIndex = closestCarouselSlideIndex(track, slides);
      const logicalIndex = canScroll ? loopIndex(renderedIndex - cloneCount, itemCount) : renderedIndex;
      const canonicalRenderedIndex = canScroll ? cloneCount + logicalIndex : logicalIndex;

      setActiveIndex((current) => (current === logicalIndex ? current : logicalIndex));

      if (canScroll && renderedIndex !== canonicalRenderedIndex) {
        const canonicalSlide = slides[canonicalRenderedIndex];
        if (canonicalSlide) {
          track.scrollTo({ left: carouselSlideScrollLeft(track, canonicalSlide), behavior: "auto" });
        }
      }
    }, 140);
  }, [canScroll, cloneCount, itemCount]);

  const syncActiveIndex = useCallback(() => {
    const track = trackRef.current;
    const slides = carouselSlideElements(track);

    if (!track || slides.length === 0 || itemCount === 0) return;

    const renderedIndex = closestCarouselSlideIndex(track, slides);
    const logicalIndex = canScroll ? loopIndex(renderedIndex - cloneCount, itemCount) : renderedIndex;
    setActiveIndex((current) => (current === logicalIndex ? current : logicalIndex));
  }, [canScroll, cloneCount, itemCount]);

  const moveByStep = useCallback(
    (direction, userInitiated = true) => {
      const track = trackRef.current;
      const slides = carouselSlideElements(track);

      if (!canScroll || !track || slides.length === 0) return;

      if (userInitiated) markInteraction();

      const currentRenderedIndex = closestCarouselSlideIndex(track, slides);
      const requestedRenderedIndex = Math.max(0, Math.min(currentRenderedIndex + direction, slides.length - 1));
      const requestedSlide = slides[requestedRenderedIndex];
      const requestedIsClone = requestedSlide?.getAttribute("aria-hidden") === "true";
      const requestedSourceType = requestedSlide?.dataset.carouselSourceType;
      const requestedLogicalIndex = loopIndex(requestedRenderedIndex - cloneCount, itemCount);
      const targetRenderedIndex =
        requestedIsClone && requestedSourceType !== "photo"
          ? cloneCount + requestedLogicalIndex
          : requestedRenderedIndex;
      const targetSlide = slides[targetRenderedIndex];
      if (!targetSlide) return;

      setActiveIndex((current) => (current === requestedLogicalIndex ? current : requestedLogicalIndex));
      const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      track.scrollTo({
        left: carouselSlideScrollLeft(track, targetSlide),
        behavior: prefersReducedMotion || targetRenderedIndex !== requestedRenderedIndex ? "auto" : "smooth",
      });
      settleTrackPosition();
    },
    [canScroll, cloneCount, itemCount, markInteraction, settleTrackPosition],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.target !== event.currentTarget) return;
      markInteraction();

      if (!canScroll) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveByStep(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveByStep(1);
      }
    },
    [canScroll, markInteraction, moveByStep],
  );

  const handleTrackScroll = useCallback(() => {
    syncActiveIndex();
    settleTrackPosition();
  }, [settleTrackPosition, syncActiveIndex]);

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

  useLayoutEffect(() => {
    if (positionedTrackKeyRef.current === trackPositionKey) return;

    const track = trackRef.current;
    const slides = carouselSlideElements(track);

    if (!track || slides.length === 0 || itemCount === 0) return;

    const canonicalRenderedIndex = canScroll ? cloneCount + safeActiveIndex : safeActiveIndex;
    const slide = slides[canonicalRenderedIndex];

    if (slide) {
      track.scrollTo({ left: carouselSlideScrollLeft(track, slide), behavior: "auto" });
      positionedTrackKeyRef.current = trackPositionKey;
    }
  }, [canScroll, cloneCount, itemCount, safeActiveIndex, trackPositionKey]);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel || !window.IntersectionObserver) {
      setCarouselVisible(true);
      return undefined;
    }

    const observer = new window.IntersectionObserver(
      ([entry]) => setCarouselVisible(entry.isIntersecting && entry.intersectionRatio >= 0.35),
      { threshold: [0, 0.35, 0.65] },
    );

    observer.observe(carousel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (
      !canScroll ||
      !carouselVisible ||
      !pageVisible ||
      modelInteractionActive ||
      interactiveHoverActive ||
      carouselHoverActive ||
      focusWithin
    ) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return undefined;

    const interactionResumeAt = lastInteractionAt ? lastInteractionAt + carouselInteractionPauseMs : 0;
    const resumeAt = Math.max(interactionResumeAt, interactiveResumeAt);
    const delay = Math.max(carouselAutoAdvanceMs, resumeAt - Date.now());

    const timer = window.setTimeout(() => {
      moveByStep(1, false);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    canScroll,
    carouselHoverActive,
    carouselVisible,
    focusWithin,
    interactiveHoverActive,
    interactiveResumeAt,
    lastInteractionAt,
    modelInteractionActive,
    moveByStep,
    pageVisible,
    safeActiveIndex,
  ]);

  useEffect(
    () => () => {
      window.clearTimeout(scrollEndTimerRef.current);
    },
    [],
  );

  if (itemCount === 0) return null;

  return (
    <div
      ref={carouselRef}
      className={compact ? "mt-2.5 min-w-0 sm:mt-4" : "mt-3 min-w-0 sm:mt-5"}
      aria-label={`${label} media`}
      aria-roledescription="carousel"
      onMouseEnter={() => setCarouselHoverActive(true)}
      onMouseLeave={() => {
        setCarouselHoverActive(false);
        setInteractiveResumeAt(Date.now() + carouselInteractiveExitPauseMs);
      }}
      onFocusCapture={() => {
        setFocusWithin(true);
        markInteraction();
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusWithin(false);
          setInteractiveResumeAt(Date.now() + carouselInteractiveExitPauseMs);
        }
      }}
      onPointerDown={markInteraction}
      onWheel={markInteraction}
    >
      {canScroll && (
        <div className="mb-2 hidden items-center justify-end gap-1.5 sm:flex">
          <div className="mr-1 flex items-center gap-2" aria-live="polite">
            <span className="font-mono text-[10px] tabular-nums text-[#6f6256]">
              {safeActiveIndex + 1} / {itemCount}
            </span>
            <span aria-hidden="true" className="flex items-center gap-1">
              {items.map((item, index) => (
                <span
                  key={`${item.id}-position-${index}`}
                  className={cn(
                    "h-1 w-4 transition-colors duration-150",
                    index === safeActiveIndex ? "bg-[#244fd6]" : "bg-[#d8d0c5]",
                  )}
                />
              ))}
            </span>
          </div>
          <button
            type="button"
            aria-label={`Previous media for ${label}`}
            onClick={() => moveByStep(-1)}
            className="grid h-8 w-8 place-items-center border border-[#cfc4b4] bg-white text-slate-950 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 sm:h-9 sm:w-9"
          >
            <Icon name="chevronLeft" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Next media for ${label}`}
            onClick={() => moveByStep(1)}
            className="grid h-8 w-8 place-items-center border border-[#cfc4b4] bg-white text-slate-950 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 sm:h-9 sm:w-9"
          >
            <Icon name="chevronRight" className="h-4 w-4" />
          </button>
        </div>
      )}
      <div
        ref={trackRef}
        tabIndex={canScroll ? 0 : undefined}
        aria-label={`${label} media, item ${safeActiveIndex + 1} of ${itemCount}`}
        onKeyDown={handleKeyDown}
        onScroll={handleTrackScroll}
        className="flex w-full min-w-0 touch-pan-x snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#244fd6] focus-visible:ring-offset-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3 sm:overflow-hidden sm:pb-2"
      >
        {leadingClones.map((item, index) => (
          <MediaFrame
            key={`${item.id}-leading-loop-clone-${index}`}
            item={carouselCloneItem(item)}
            label={label}
            compact={compact}
            clone
          />
        ))}
        {items.map((item, index) => (
          <MediaFrame
            key={`${item.id}-${index}`}
            item={item}
            label={label}
            compact={compact}
            fullWidth={itemCount === 1}
            onModelInteractionChange={handleModelInteractionChange}
            onInteractiveHoverChange={handleInteractiveHoverChange}
            onVideoFocusChange={handleInteractiveHoverChange}
            videoFocusEnabled={!isMobile}
          />
        ))}
        {trailingClones.map((item, index) => (
          <MediaFrame
            key={`${item.id}-trailing-loop-clone-${index}`}
            item={carouselCloneItem(item)}
            label={label}
            compact={compact}
            clone
          />
        ))}
      </div>
      {canScroll && (
        <div className="mt-1.5 flex items-center justify-center gap-1 sm:hidden" aria-hidden="true">
          {items.map((item, index) => (
            <span
              key={`${item.id}-mobile-position-${index}`}
              className={cn(
                "h-1 transition-[width,background-color] duration-150",
                index === safeActiveIndex ? "w-5 bg-[#244fd6]" : "w-2 bg-[#d8d0c5]",
              )}
            />
          ))}
        </div>
      )}
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
      <Heading className={cn(code ? "mt-1.5 sm:mt-2" : "", "text-lg font-semibold leading-tight tracking-normal text-slate-950 sm:text-xl md:text-[2.35rem]")}>
        {title}
      </Heading>
      {children && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">{children}</p>}
    </div>
  );
}

function SectionHeader({ code, index, title, children }) {
  return (
    <div className="section-heading mb-4 border-t border-[#d2c8b9] pt-4 sm:mb-8 sm:pt-6">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 sm:gap-5">
        {index && (
          <span aria-hidden="true" className="section-index font-mono text-[11px] font-semibold tracking-[0.14em] text-[#244fd6] sm:text-xs">
            {index}
          </span>
        )}
        <TitleBlock code={code} title={title}>
          {children}
        </TitleBlock>
      </div>
    </div>
  );
}

function HeroProjectIndex({ projects }) {
  const entries = list(projects);
  if (entries.length === 0) return null;

  return (
    <aside className="hero-project-index hidden min-h-full border-l border-[#cfc4b4] bg-white/35 lg:flex lg:flex-col">
      <div className="flex items-center justify-between border-b border-[#d8cebf] px-5 py-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#716456]">
        <span>Selected systems</span>
        <span className="text-[#244fd6]">A01-A{String(entries.length).padStart(2, "0")}</span>
      </div>
      <div className="hero-project-list relative flex flex-1 flex-col justify-center py-2">
        {entries.map((project, index) => {
          const accent = accentStyles[project.accent] ?? accentStyles.blue;
          return (
            <a
              key={project.id}
              href={`#${projectAnchorId(project)}`}
              onClick={(event) => jumpToProject(event, project)}
              className="hero-project-entry group/index relative grid grid-cols-[42px_minmax(0,1fr)] gap-3 border-b border-[#ddd3c5] px-5 py-4 outline-none transition-colors last:border-b-0 hover:bg-white/70 focus-visible:bg-white/80 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#244fd6]"
              style={{ "--project-accent": accent.hex }}
            >
              <span className="hero-project-code relative font-mono text-[10px] tracking-[0.12em] text-[#244fd6]">A{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-5 text-slate-950">{project.title}</span>
                <span className="mt-1 block truncate text-[10px] leading-4 text-slate-600">{project.status || project.teamContext}</span>
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-px w-0 transition-[width] duration-300 group-hover/index:w-full group-focus-visible/index:w-full"
                style={{ backgroundColor: accent.hex }}
              />
            </a>
          );
        })}
      </div>
      <div className="border-t border-[#d8cebf] px-5 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-[#827466]">
        Hardware / robotics / software
      </div>
    </aside>
  );
}

function ProjectFact({ label, children }) {
  if (!children) return null;

  return (
    <div className="border border-[#e1d7c8] bg-[#fbfaf7] p-2 sm:p-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#827466] sm:text-[10px] sm:tracking-[0.14em]">{label}</p>
      <p className="mt-1 text-[11px] leading-4 text-slate-800 sm:mt-2 sm:text-sm sm:leading-6">{children}</p>
    </div>
  );
}

function ProjectLinkButton({ href, label, icon = "arrowRight", type }) {
  if (!href || !label) return null;

  const showType = type && type !== "source";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center border border-[#cfc4b4] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-950 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 sm:px-3 sm:py-2 sm:text-xs"
    >
      {icon !== "arrowRight" && <Icon name={icon} className="mr-2 h-3.5 w-3.5" />}
      {showType && <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#827466]">{type}</span>}
      {label}
      {icon === "arrowRight" && <Icon name="arrowRight" className="ml-2 h-3.5 w-3.5" />}
    </a>
  );
}

const jumpFocusTimers = new WeakMap();
const jumpScrollFrames = new WeakMap();
const jumpHighlightDurationMs = 2800;
const navigationPreloadBudgetMs = 450;
let navigationScrollSequence = 0;

function elementIsInNavigationPath(element, startY, endY) {
  const bounds = element.getBoundingClientRect();
  const top = bounds.top + window.scrollY;
  const bottom = bounds.bottom + window.scrollY;
  return bottom >= startY && top <= endY;
}

function waitForNavigationImage(image) {
  image.loading = "eager";
  image.dataset.navigationPreloaded = "true";

  if (image.complete) {
    return image.decode?.().catch(() => undefined) ?? Promise.resolve();
  }

  return new Promise((resolve) => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
  });
}

function preloadImageUrl(src) {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
    image.src = src;
  });
}

async function prepareNavigationScrollPath(target) {
  const targetBounds = target.getBoundingClientRect();
  const targetTop = targetBounds.top + window.scrollY;
  if (targetTop <= window.scrollY) return;

  const pathStart = window.scrollY;
  const pathEnd = targetBounds.bottom + window.scrollY + window.innerHeight * 0.25;
  const inPath = (element) => elementIsInNavigationPath(element, pathStart, pathEnd);

  document.querySelectorAll('[data-scroll-reveal="true"]').forEach((element) => {
    if (inPath(element)) element.classList.add("navigation-scroll-ready");
  });

  const imagePromises = [...document.querySelectorAll('img[loading="lazy"]')]
    .filter(inPath)
    .map(waitForNavigationImage);
  const posterPromises = [...new Set(
    [...document.querySelectorAll("video[poster]")]
      .filter(inPath)
      .map((video) => video.poster)
      .filter(Boolean),
  )].map(preloadImageUrl);

  await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));

  if (imagePromises.length + posterPromises.length === 0) return;

  await Promise.race([
    Promise.allSettled([...imagePromises, ...posterPromises]),
    new Promise((resolve) => window.setTimeout(resolve, navigationPreloadBudgetMs)),
  ]);
}

async function scrollToPreparedTarget(target, options) {
  const requestId = ++navigationScrollSequence;
  await prepareNavigationScrollPath(target);
  if (requestId !== navigationScrollSequence || !target.isConnected) return false;
  target.scrollIntoView(options);
  return true;
}

function waitForWindowScrollToSettle(timeoutMs = 2400) {
  return new Promise((resolve) => {
    let lastScrollY = window.scrollY;
    let stableFrames = 0;
    const startedAt = window.performance.now();

    function checkPosition() {
      const currentScrollY = window.scrollY;
      stableFrames = Math.abs(currentScrollY - lastScrollY) < 0.5 ? stableFrames + 1 : 0;
      lastScrollY = currentScrollY;

      if (stableFrames >= 6 || window.performance.now() - startedAt >= timeoutMs) {
        resolve();
        return;
      }

      window.requestAnimationFrame(checkPosition);
    }

    window.requestAnimationFrame(checkPosition);
  });
}

function credentialAnchorId(credentialId) {
  return `credential-${credentialId}`;
}

function highlightJumpTarget(target) {
  target.focus({ preventScroll: true });
  target.classList.remove("jump-target-highlight");
  void target.offsetWidth;
  target.classList.add("jump-target-highlight");

  const timer = window.setTimeout(() => {
    target.classList.remove("jump-target-highlight");
    jumpFocusTimers.delete(target);
  }, jumpHighlightDurationMs);

  jumpFocusTimers.set(target, timer);
}

function highlightJumpTargetAfterScroll(target) {
  let lastScrollY = window.scrollY;
  let stableFrames = 0;
  const startedAt = window.performance.now();

  function checkScrollPosition() {
    const currentScrollY = window.scrollY;
    stableFrames = Math.abs(currentScrollY - lastScrollY) < 0.5 ? stableFrames + 1 : 0;
    lastScrollY = currentScrollY;

    if (stableFrames >= 6 || window.performance.now() - startedAt > 1800) {
      jumpScrollFrames.delete(target);
      highlightJumpTarget(target);
      return;
    }

    const frame = window.requestAnimationFrame(checkScrollPosition);
    jumpScrollFrames.set(target, frame);
  }

  const frame = window.requestAnimationFrame(checkScrollPosition);
  jumpScrollFrames.set(target, frame);
}

async function jumpToTarget(event, targetId) {
  event.preventDefault();

  const target = document.getElementById(targetId);

  if (!target) return;

  const priorTimer = jumpFocusTimers.get(target);
  if (priorTimer) window.clearTimeout(priorTimer);
  const priorFrame = jumpScrollFrames.get(target);
  if (priorFrame) window.cancelAnimationFrame(priorFrame);

  target.classList.remove("jump-target-highlight");

  window.history.replaceState(null, "", `#${targetId}`);
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const didScroll = await scrollToPreparedTarget(target, {
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "center",
  });
  if (!didScroll) return;

  if (prefersReducedMotion) {
    highlightJumpTarget(target);
  } else {
    highlightJumpTargetAfterScroll(target);
  }
}

function jumpToCredential(event, credentialId) {
  jumpToTarget(event, credentialAnchorId(credentialId));
}

function jumpToProject(event, project) {
  jumpToTarget(event, projectAnchorId(project));
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
  const hasProjectLinks = Boolean(project.logoSrc || artifactButtons.length > 0);
  const hasCompactLogo = project.id === "vividgrasp-ai-vision-robotics-arm";
  const hasWideProgramLogo = project.logoSrc?.includes("/tetc-logo.");
  const linkedCredentialId = project.logoCredentialId || null;
  const logoHref = linkedCredentialId ? `#${credentialAnchorId(linkedCredentialId)}` : project.logoHref;
  const logoContainerClass = cn(
    "border border-[#d6cec0] bg-white transition",
    hasCompactLogo
      ? "inline-flex px-2 py-1.5"
      : hasWideProgramLogo
        ? "grid aspect-[83/38] w-[160px] max-w-full place-items-center overflow-hidden"
        : "block px-3 py-2",
  );
  const logoImage = project.logoSrc ? (
    <img
      src={project.logoSrc}
      alt={project.logoAlt || `${project.title} logo`}
      loading="lazy"
      className={cn(
        "object-contain",
        hasCompactLogo ? "h-6 w-[132px] max-w-full" : hasWideProgramLogo ? "h-full w-full object-cover" : "h-8 w-full",
      )}
    />
  ) : null;

  return (
    <motion.article
      id={projectAnchorId(project)}
      tabIndex={-1}
      data-scroll-reveal="true"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.045 }}
      className="technical-panel project-panel group grid min-w-0 scroll-mt-20 border border-[#d2c8b9] bg-white shadow-sm outline-none sm:scroll-mt-24 xl:grid-cols-[190px_minmax(0,1fr)]"
      style={{ "--panel-accent": style.hex }}
    >
      <div className={`flex flex-wrap items-center gap-2 border-b border-[#e1d7c8] p-2.5 sm:p-4 xl:block xl:border-b-0 xl:border-r xl:p-5 ${style.soft}`}>
        <div className="flex items-center gap-2 xl:block">
          <p className={`font-mono text-[10px] font-semibold tracking-[0.12em] sm:text-xs ${style.text}`}>A{String(index + 1).padStart(2, "0")}</p>
          <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.16em] xl:mt-2 ${style.text}`}>{project.label}</p>
          <span className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${style.bg}`} />
        </div>
        {project.status && (
          <p className="w-fit border border-[#d6cec0] bg-white px-2 py-0.5 text-[10px] font-medium leading-4 text-slate-700 sm:text-xs xl:mt-6 xl:py-1">{project.status}</p>
        )}
        {project.teamContext && (
          <div className="border-l border-[#d6cec0] pl-2 xl:mt-5 xl:border-l-0 xl:border-t xl:pl-0 xl:pt-4">
            <p className="text-[10px] font-semibold leading-4 text-slate-900 sm:text-sm sm:leading-5">{project.teamContext}</p>
          </div>
        )}
        {hasProjectLinks && (
          <div className="w-full border-t border-[#d6cec0] pt-2 xl:mt-5 xl:pt-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#827466] sm:text-[10px] sm:tracking-[0.16em]">
              {meta.projectArtifactLinksLabel}
            </p>
            <div className="mt-2 flex flex-wrap items-stretch gap-2 xl:flex-col">
              {project.logoSrc && (
                <div className="min-w-0 flex-1 xl:w-full">
                  {logoHref ? (
                    <a
                      href={logoHref}
                      target={linkedCredentialId ? undefined : "_blank"}
                      rel={linkedCredentialId ? undefined : "noreferrer"}
                      onClick={linkedCredentialId ? (event) => jumpToCredential(event, linkedCredentialId) : undefined}
                      aria-label={linkedCredentialId ? `View related credential for ${project.title}` : `Open ${project.logoAlt || `${project.title} logo`} link`}
                      className={cn(
                        logoContainerClass,
                        "hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
                      )}
                    >
                      {logoImage}
                    </a>
                  ) : (
                    <div className={logoContainerClass}>{logoImage}</div>
                  )}
                  {project.relatedProgramNote && (
                    <p className="mt-1.5 text-[9px] leading-4 text-slate-600 sm:text-[10px] sm:leading-4">
                      {project.relatedProgramNote}
                    </p>
                  )}
                </div>
              )}
              {artifactButtons.map((link) => (
                <ProjectLinkButton key={link.id ?? link.href} href={link.href} label={link.label} icon={link.icon} type={link.type} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="min-w-0 p-3 md:p-6">
        <h3 className="text-lg font-semibold leading-tight tracking-[-0.02em] text-slate-950 sm:text-2xl sm:tracking-[-0.03em]">{project.title}</h3>
        <p className="mt-2 max-w-3xl text-[13px] leading-5 text-slate-700 sm:mt-3 sm:text-base sm:leading-7 md:text-lg">{project.summary}</p>
        {project.contribution && (
          <div className="mt-3 sm:mt-5">
            <ProjectFact label={meta.projectContributionLabel}>{project.contribution}</ProjectFact>
          </div>
        )}
        <MediaCarousel
          media={project.media}
          label={project.title}
          mobileMediaType={project.id === "subpix" ? "video" : null}
        />
      </div>
    </motion.article>
  );
}

function MoreWorkStandardCard({ project, index, meta, linkedCredential = null }) {
  const publishedMedia = list(project.media).filter((item) => item.src);
  const hasWideProgramLogo = project.logoSrc?.includes("/tetc-logo.");
  const logoHref = linkedCredential ? `#${credentialAnchorId(linkedCredential.id)}` : project.logoHref;
  const logoClassName = cn(
    "grid place-items-center border border-[#d6cec0] bg-white",
    hasWideProgramLogo ? "aspect-[83/38] w-32 overflow-hidden sm:w-36" : "max-w-[150px] px-2 py-1",
  );
  const logoImage = project.logoSrc ? (
    <img
      src={project.logoSrc}
      alt={project.logoAlt || `${project.title} logo`}
      loading="lazy"
      className={cn("w-full object-contain", hasWideProgramLogo ? "h-full object-cover" : "h-7")}
    />
  ) : null;

  return (
    <motion.article
      data-scroll-reveal="true"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, delay: index * 0.035 }}
      className="technical-panel work-panel group min-w-0 border border-[#d2c8b9] bg-white shadow-sm"
      style={{ "--panel-accent": "#244fd6" }}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#e1d7c8] bg-[#fbfaf7] p-3 sm:p-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#244fd6]">W{String(index + 1).padStart(2, "0")}</span>
          <p className="min-w-0 truncate border border-[#d6cec0] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#827466]">{project.type}</p>
        </div>
        {project.logoSrc ? (
          logoHref ? (
            <a
              href={logoHref}
              target={linkedCredential ? undefined : "_blank"}
              rel={linkedCredential ? undefined : "noreferrer"}
              onClick={linkedCredential ? (event) => jumpToCredential(event, linkedCredential.id) : undefined}
              aria-label={linkedCredential ? `View ${linkedCredential.program}` : `Open ${project.logoAlt || `${project.title} logo`} link`}
              className={cn(logoClassName, "transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2")}
            >
              {logoImage}
            </a>
          ) : (
            <div className={logoClassName}>{logoImage}</div>
          )
        ) : null}
      </div>
      <div className="p-3 sm:p-5">
        <h3 className="text-base font-semibold tracking-[-0.02em] text-slate-950 sm:text-lg">{project.title}</h3>
        {(project.status || project.context) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[project.status, project.context].filter(Boolean).map((detail) => (
              <span key={detail} className="border border-[#d6cec0] bg-[#fbfaf7] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#827466]">
                {detail}
              </span>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs leading-5 text-slate-700 sm:mt-3 sm:text-sm sm:leading-6">{project.description}</p>
        {publishedMedia.length > 0 && <MediaCarousel media={publishedMedia} label={project.title} compact />}
        {(project.href || project.sourceHref) && (
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center border border-[#cfc4b4] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-950 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 sm:px-3 sm:py-2 sm:text-xs"
              >
                {meta.moreWorkOpenLabel}
                <Icon name="arrowRight" className="ml-2 h-3.5 w-3.5" />
              </a>
            )}
            {project.sourceHref && (
              <a
                href={project.sourceHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center border border-[#cfc4b4] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-950 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 sm:px-3 sm:py-2 sm:text-xs"
              >
                <Icon name="github" className="mr-2 h-3.5 w-3.5" />
                {meta.moreWorkSourceLabel}
              </a>
            )}
          </div>
        )}
        <div className="signal-rule mt-4 h-1 w-14 bg-[#244fd6] opacity-80 sm:mt-5 sm:h-1.5 sm:w-16" />
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
    <aside className="technical-panel border border-[#d2c8b9] bg-white p-2.5 shadow-sm sm:p-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)] md:items-center md:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {meta.academicSchoolLogoSrc && (
            <a
              href={meta.academicSchoolHref}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${schoolName} website`}
              className="grid h-14 w-14 shrink-0 place-items-center border border-[#d6cec0] bg-white p-1 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 sm:h-20 sm:w-20"
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

function DuolingoActivityCard({ item }) {
  const { displayDays, displayYears } = useDuolingoStreak(item);
  const profileHref = item.href || DUOLINGO_PROFILE_URL;
  const profileLabel = item.hrefLabel || "Duolingo profile";

  return (
    <article
      className="technical-panel relative flex min-h-full flex-col overflow-hidden border border-[#d8b451] bg-white p-2.5 shadow-sm sm:p-4"
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[#d7a31f]" />
      <div className="flex items-start gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center border border-[#d8b451] bg-[#fff4bf] text-[#b45309]">
          <Icon name={item.icon || "flame"} className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-xs font-semibold leading-4 text-slate-950 sm:text-sm sm:leading-5">{item.label}</h3>
          <p className="mt-1 flex items-baseline gap-1 text-lg font-semibold leading-none text-slate-950 sm:text-xl" aria-live="polite">
            {displayDays || item.value}
            <span className="text-[10px] font-semibold text-slate-600 sm:text-xs">days</span>
          </p>
          <p className="mt-1 text-[10px] leading-4 text-slate-700 sm:text-xs">{displayYears}</p>
        </div>
      </div>
      <a
        href={profileHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Open Duolingo profile"
        className="mt-auto inline-flex w-fit items-center pt-2 text-[10px] font-semibold text-[#244fd6] hover:underline focus:outline-none focus:ring-2 focus:ring-[#244fd6] focus:ring-offset-2 sm:text-xs"
      >
        {profileLabel}
        <Icon name="arrowRight" className="ml-1.5 h-3 w-3" />
      </a>
    </article>
  );
}

function AcademicDetailsDialog({ details, meta, triggerLabel }) {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const groupedDetails = details.reduce((groups, detail) => {
    const groupName = detail.group || "Coursework";
    const existing = groups.find((group) => group.name === groupName);
    if (existing) existing.items.push(detail);
    else groups.push({ name: groupName, items: [detail] });
    return groups;
  }, []);
  const progression = groupedDetails.find((group) => group.name === "Progression");
  const scoreGroups = groupedDetails.filter((group) => group.name !== "Progression");
  const titleId = "academic-details-title";

  if (details.length === 0) return null;

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-controls="academic-details-dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="group inline-flex items-center text-left text-base font-semibold leading-5 tracking-[-0.02em] text-slate-950 transition hover:text-[#244fd6] focus:outline-none focus:ring-2 focus:ring-[#244fd6] focus:ring-offset-2 sm:text-2xl sm:leading-7 sm:tracking-[-0.03em]"
      >
        <span className="border-b border-[#244fd6]/45 group-hover:border-[#244fd6]">{triggerLabel || "Academic Results"}</span>
        <Icon name="arrowRight" className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 sm:h-5 sm:w-5" />
      </button>

      <dialog
        ref={dialogRef}
        id="academic-details-dialog"
        aria-labelledby={titleId}
        data-content-collection="academicDetails"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        onClose={() => triggerRef.current?.focus()}
        className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1rem)] max-w-4xl overflow-hidden border border-[#cfc4b4] bg-white p-0 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.28)] backdrop:bg-slate-950/45 sm:w-[calc(100%-3rem)]"
      >
        <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col border-t-4 border-t-[#244fd6]">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e1d7c8] bg-[#fbfaf7] px-3 py-2.5 sm:px-5 sm:py-4">
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#244fd6] sm:text-[10px] sm:tracking-[0.16em]">Academic record</p>
              <h2 id={titleId} className="mt-0.5 text-base font-semibold text-slate-950 sm:mt-1 sm:text-xl">{meta.academicDetailsTitle || "Coursework & scores"}</h2>
            </div>
            <button
              type="button"
              aria-label="Close coursework and scores"
              onClick={closeDialog}
              className="grid h-8 w-8 shrink-0 place-items-center border border-[#cfc4b4] bg-white text-lg leading-none text-slate-700 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-[#244fd6] focus:ring-offset-2"
            >
              &times;
            </button>
          </div>

          <div className="overflow-y-auto overscroll-contain">
            <div className="grid gap-px bg-[#e1d7c8] sm:grid-cols-3">
              {scoreGroups.map((group) => (
                <section key={group.name} className="bg-white p-3 sm:p-4">
                  <h3 className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#827466] sm:text-[10px] sm:tracking-[0.15em]">{group.name}</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3">
                    {group.items.map((detail) => (
                      <div key={detail.id} className="min-w-0 border-l-2 border-[#d2c8b9] pl-2.5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-semibold leading-none text-slate-950 sm:text-2xl">{detail.value}</span>
                          {detail.format === "ap-score" && <span className="text-[10px] font-semibold text-slate-500 sm:text-xs">/ 5</span>}
                        </div>
                        <p className="mt-1 text-[10px] font-semibold leading-4 text-slate-900 sm:text-xs sm:leading-5">{detail.label}</p>
                        {detail.note && <p className="mt-0.5 text-[9px] font-semibold leading-4 text-slate-600 sm:text-[11px]">{detail.note}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {progression && (
              <div className="border-t border-[#e1d7c8] bg-[#fbfaf7] px-3 py-2.5 sm:px-5 sm:py-3.5">
                {progression.items.map((detail) => (
                  <div key={detail.id} className="sm:flex sm:items-baseline sm:gap-4">
                    <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#827466] sm:min-w-28 sm:text-[10px] sm:tracking-[0.15em]">{detail.label}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-950 sm:mt-0 sm:text-sm">{detail.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}

function AcademicCard({ item, index, wide = false, valueAction = null }) {
  const isGoldHighlight = item.highlight === "gold";

  return (
    <motion.div
      key={item.id}
      data-scroll-reveal="true"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, delay: index * 0.035 }}
      className={cn(
        "technical-panel relative overflow-hidden border border-[#d2c8b9] bg-white p-2.5 shadow-sm sm:p-5",
        wide && "col-span-2 lg:col-span-1",
        isGoldHighlight && "border-[#d8b451] bg-[linear-gradient(180deg,#fffdf7_0%,#ffffff_42%)]",
      )}
    >
      {isGoldHighlight && (
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-[#d7a31f]" />
      )}
      {wide ? (
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(260px,280px)_minmax(0,1fr)] lg:grid-rows-[auto_auto_auto] lg:gap-x-8">
          <p className="order-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#827466] sm:text-xs sm:tracking-[0.2em] lg:col-start-1 lg:row-start-1">{item.label}</p>
          {valueAction ? (
            <div className="order-2 mt-1.5 sm:mt-3 lg:col-start-1 lg:row-start-2">{valueAction}</div>
          ) : (
            <p className="order-2 mt-1.5 text-base font-semibold leading-5 tracking-[-0.02em] text-slate-950 sm:mt-3 sm:text-2xl sm:leading-7 sm:tracking-[-0.03em] lg:col-start-1 lg:row-start-2">{item.value}</p>
          )}
          {item.note && <p className="order-3 mt-1.5 text-[10px] leading-4 text-slate-700 sm:mt-3 sm:text-sm sm:leading-6 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:mt-0">{item.note}</p>}
        </div>
      ) : (
        <>
          <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#827466] sm:text-xs sm:tracking-[0.2em]">{item.label}</p>
          {valueAction ? (
            <div className="mt-1.5 sm:mt-3">{valueAction}</div>
          ) : (
            <p className="mt-1.5 text-base font-semibold leading-5 tracking-[-0.02em] text-slate-950 sm:mt-3 sm:text-2xl sm:leading-7 sm:tracking-[-0.03em]">{item.value}</p>
          )}
          {item.note && <p className="mt-1.5 text-[10px] leading-4 text-slate-700 sm:mt-3 sm:text-sm sm:leading-6">{item.note}</p>}
        </>
      )}
    </motion.div>
  );
}

function useAdaptivePopoverSide(isOpen, triggerRef, panelRef, viewportPadding = 16) {
  const [openSide, setOpenSide] = useState("right");

  useLayoutEffect(() => {
    if (!isOpen) return undefined;

    function updateOpenSide() {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;

      const triggerBounds = trigger.getBoundingClientRect();
      const panelWidth = panel.getBoundingClientRect().width;
      const opensRightWithoutClipping = triggerBounds.left + panelWidth <= window.innerWidth - viewportPadding;
      setOpenSide(opensRightWithoutClipping ? "right" : "left");
    }

    updateOpenSide();
    window.addEventListener("resize", updateOpenSide);
    return () => window.removeEventListener("resize", updateOpenSide);
  }, [isOpen, panelRef, triggerRef, viewportPadding]);

  return openSide;
}

function CredentialPreviewPopover({ credential, label, missingLabel }) {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const openSide = useAdaptivePopoverSide(isOpen, triggerRef, panelRef);
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
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label={`${credential.credential} preview`}
          className={cn(
            "relative z-40 mt-3 w-full border border-[#cfc4b4] bg-white p-2.5 shadow-[0_18px_50px_rgba(34,28,18,0.18)] sm:p-3 md:absolute md:bottom-[calc(100%+0.75rem)] md:top-auto md:mt-0 md:w-[min(30vw,22rem)] md:translate-y-0",
            openSide === "left" ? "md:right-0" : "md:left-0",
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
              openSide === "left" ? "right-8" : "left-8",
            )}
          />
        </div>
      )}
    </div>
  );
}

function CredentialSummary({ credential }) {
  const linkedText = credential.summaryLinkText;
  const linkIndex = linkedText ? credential.summary.indexOf(linkedText) : -1;

  if (!credential.relatedProjectId || linkIndex < 0) return credential.summary;

  const before = credential.summary.slice(0, linkIndex);
  const after = credential.summary.slice(linkIndex + linkedText.length);
  const targetId = `project-${credential.relatedProjectId}`;

  return (
    <>
      {before}
      <a
        href={`#${targetId}`}
        onClick={(event) => jumpToTarget(event, targetId)}
        className="font-semibold text-[#244fd6] underline decoration-[#9eb0ef] underline-offset-2 transition hover:decoration-[#244fd6] focus:outline-none focus:ring-2 focus:ring-[#244fd6] focus:ring-offset-2"
      >
        {linkedText}
      </a>
      {after}
    </>
  );
}

function ProgramCredentialCard({ credential, index, meta }) {
  const accent = accentStyles[credential.accent] ?? accentStyles.amber;
  const isCredential = credential.entryType !== "program";
  const eyebrow = credential.id === "stanford-ai4all"
    ? "Stanford Pre-Collegiate Studies"
    : credential.issuer;
  const detail = credential.date;
  const awardLabel = credential.awardTitle
    ? `${credential.awardDate} ${credential.awardTitle}${credential.awardDistinction ? ` · ${credential.awardDistinction}` : ""}.${credential.awardSummary ? ` ${credential.awardSummary}` : ""}`
    : "";
  const initials = credential.program
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (
    <motion.article
      id={credentialAnchorId(credential.id)}
      tabIndex={-1}
      data-scroll-reveal="true"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={cn("technical-panel relative scroll-mt-24 border bg-white p-3 shadow-sm outline-none sm:p-5", accent.border)}
      style={{ "--panel-accent": credential.id === "tetc" ? "#00afab" : credential.id === "stanford-ai4all" ? "#8c1515" : accent.hex }}
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
              "grid shrink-0 place-items-center overflow-hidden border border-[#d6cec0] bg-white transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
              credential.id === "stanford-ai4all"
                ? "h-9 w-20 p-1 sm:w-24"
                : credential.id === "tetc"
                  ? "aspect-[83/38] w-32 sm:w-36"
                : isCredential
                  ? "h-12 w-16 p-1.5 sm:h-14 sm:w-20"
                  : "h-12 w-24 p-1.5 sm:h-14 sm:w-28",
            )}
          >
            <img
              src={credential.logoSrc}
              alt={credential.logoAlt || `${credential.program} logo`}
              loading="lazy"
              className={cn(
                "block h-full w-full min-h-0 min-w-0 object-contain",
                credential.id === "tetc" && "object-cover",
              )}
            />
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

      <p className="mt-2 text-[11px] leading-4 text-slate-700 sm:mt-3 sm:text-sm sm:leading-6">
        <CredentialSummary credential={credential} />
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-4">
        {awardLabel && (
          <AchievementRibbon
            id={`${credential.id}-award`}
            label={awardLabel}
            title={`${credential.awardDate} ${credential.awardTitle}`}
            subtitle={credential.awardDistinction}
            detail={credential.awardSummary}
          />
        )}
        {isCredential && (
          <CredentialPreviewPopover
            credential={credential}
            label={meta.credentialPreviewLabel || "View certificate"}
            missingLabel={meta.credentialMissingScanLabel || "Certificate scan needed"}
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

function AchievementRibbon({ id, label, title = "", subtitle = "", detail = "", iconName = "awardRibbon" }) {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const openSide = useAdaptivePopoverSide(isOpen, triggerRef, tooltipRef);
  const tooltipId = `achievement-${id}`;

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeAchievement(event) {
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

    document.addEventListener("pointerdown", closeAchievement);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeAchievement);
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
    if (!containerRef.current?.contains(event.relatedTarget) && !isPinned) setIsOpen(false);
  }

  function handleClick() {
    const nextOpen = !isPinned;
    setIsOpen(nextOpen);
    setIsPinned(nextOpen);
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onBlur={handleBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        onFocus={() => setIsOpen(true)}
        onClick={handleClick}
        className="grid h-8 w-8 place-items-center border border-[#d8b451] bg-[#fff4c7] text-[#946700] shadow-sm transition hover:border-[#bd8b13] hover:bg-[#ffedaa] focus:outline-none focus:ring-2 focus:ring-[#244fd6] focus:ring-offset-2 sm:h-9 sm:w-9"
      >
        <Icon name={iconName} className="h-4 w-4" />
      </button>

      {isOpen && (
        <span
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute left-0 top-[calc(100%+0.55rem)] z-40 w-56 max-w-[calc(100vw-2rem)] border border-[#d8b451] bg-[#fffdf7] px-3 py-2.5 text-[10px] font-semibold leading-4 text-slate-800 shadow-[0_12px_30px_rgba(93,67,13,0.18)] sm:bottom-[calc(100%+0.55rem)] sm:top-auto sm:w-72 sm:text-xs sm:leading-5",
            openSide === "left" && "left-auto right-0",
          )}
        >
          {title ? (
            <>
              <span className="block text-[11px] font-semibold leading-4 text-slate-950 sm:text-xs sm:leading-5">{title}</span>
              {subtitle && <span className="mt-1 block text-[10px] font-semibold leading-4 text-[#8a6500] sm:text-[11px] sm:leading-5">{subtitle}</span>}
              {detail && <span className="mt-1.5 block font-normal text-slate-700">{detail}</span>}
            </>
          ) : label}
          <span
            aria-hidden="true"
            className={cn(
              "absolute -top-1 left-3 h-2 w-2 rotate-45 border-l border-t border-[#d8b451] bg-[#fffdf7] sm:hidden",
              openSide === "left" && "left-auto right-3",
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute -bottom-1 left-3 hidden h-2 w-2 rotate-45 border-b border-r border-[#d8b451] bg-[#fffdf7] sm:block",
              openSide === "left" && "sm:left-auto sm:right-3",
            )}
          />
        </span>
      )}
    </div>
  );
}

function AchievementTrophies({ item, className = "" }) {
  const achievements = list(item.achievements);
  if (achievements.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2", className)} aria-label={`${item.title} achievements`}>
      {achievements.map((achievement, index) => {
        const separatorIndex = achievement.lastIndexOf(" - ");
        const title = separatorIndex >= 0 ? achievement.slice(0, separatorIndex) : achievement;
        const subtitle = separatorIndex >= 0 ? achievement.slice(separatorIndex + 3) : "";

        return (
          <AchievementRibbon
            key={achievement}
            id={`${item.id}-${index + 1}`}
            label={achievement}
            title={title}
            subtitle={subtitle}
            iconName="awardRibbon"
          />
        );
      })}
    </div>
  );
}

function HomepageActivitySection({ section, learningHighlights, title }) {
  if (!section) return null;

  const learningItems = list(learningHighlights);

  return (
    <div className="mt-5 border-t border-[#d2c8b9] pt-4 sm:mt-8 sm:pt-6" data-content-collection="fullRecord" data-related-content="learningHighlights">
      <h2 className="text-xl font-semibold leading-6 text-slate-950 sm:text-2xl sm:leading-7">{title}</h2>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3 lg:grid-cols-4">
        {list(section.items).map((item) => (
          <article key={item.id} className="technical-panel flex min-h-full flex-col border border-[#d2c8b9] bg-white p-2.5 shadow-sm sm:p-4">
            <h3 className="text-xs font-semibold leading-4 text-slate-950 sm:text-sm sm:leading-5">{item.title}</h3>
            <p className="mt-1.5 text-[10px] leading-4 text-slate-700 sm:mt-2 sm:text-xs sm:leading-5">
              {item.id === "scouts-bsa"
                ? item.detail.split(/(?<=\.)\s+(?=Scouting Troop)/).map((line) => <span key={line} className="block">{line}</span>)
                : item.detail}
            </p>
            <AchievementTrophies item={item} className="mt-auto pt-2 sm:pt-3" />
          </article>
        ))}
        {learningItems.length > 0 && (
          <div className="contents" data-content-collection="learningHighlights">
            {learningItems.map((item) => <DuolingoActivityCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function programRecordDetail(credential) {
  const awardLine = credential.awardTitle
    ? `${credential.awardDate} ${credential.awardTitle}${credential.awardDistinction ? `, ${credential.awardDistinction}` : ""}. ${credential.awardSummary}${credential.awardQuote ? ` ${credential.awardQuoteAttribution || "Program staff"}: "${credential.awardQuote}"` : ""}`
    : "";

  return [credential.summary, awardLine].filter(Boolean).join(" ");
}

function RecordSectionCard({ section, collection = "fullRecord", index }) {
  return (
    <motion.article
      data-content-collection={collection}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="technical-panel record-section border border-[#d2c8b9] bg-white shadow-sm"
    >
      <div className="flex items-center gap-2.5 border-b border-[#d2c8b9] bg-[#fbfaf7] p-2.5 sm:gap-3 sm:px-4 sm:py-3.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center border border-[#d2c8b9] bg-white text-[#244fd6] sm:h-10 sm:w-10"><Icon name={section.icon} className="h-4 w-4" /></div>
        {index && <span className="font-mono text-[9px] font-semibold tracking-[0.12em] text-[#244fd6] sm:text-[10px]">R{String(index).padStart(2, "0")}</span>}
        <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">{section.category}</h2>
      </div>
      <div className="divide-y divide-[#e1d7c8]">
        {list(section.items).map((item) => (
          <div key={item.id} className="record-row grid gap-1.5 p-2.5 sm:px-4 sm:py-3.5 md:grid-cols-[minmax(170px,230px)_minmax(0,1fr)_auto] md:items-start md:gap-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-950 sm:text-base">{item.title}</h3>
              {item.date && <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#827466] sm:text-xs">{item.date}</p>}
            </div>
            <div>
              <p className="max-w-3xl text-xs leading-5 text-slate-700 sm:text-sm sm:leading-6">{item.detail}</p>
              <AchievementTrophies item={item} className="mt-2.5" />
            </div>
            {item.href && <a href={item.href} target="_blank" rel="noreferrer" className="signal-link inline-flex items-center justify-self-start whitespace-nowrap text-xs font-semibold text-[#244fd6] hover:underline md:justify-self-end">{item.hrefLabel || "Open"}<Icon name="arrowRight" className="ml-1.5 h-3.5 w-3.5" /></a>}
          </div>
        ))}
      </div>
    </motion.article>
  );
}

function MoreWorkCompactCard({ project, index, displayIndex, meta }) {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);
  const triggerRef = useRef(null);
  const suppressFocusOpenRef = useRef(false);
  const suppressHoverOpenRef = useRef(false);
  const media = list(project.media).find((item) => item.src) ?? null;
  const panelId = `more-work-${project.id}-details`;

  useEffect(() => {
    if (!expanded) return undefined;

    function closeOnOutsidePointer(event) {
      if (!cardRef.current?.contains(event.target)) setExpanded(false);
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [expanded]);

  function closeDetails() {
    suppressFocusOpenRef.current = true;
    setExpanded(false);
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus({ preventScroll: true });
      window.requestAnimationFrame(() => {
        suppressFocusOpenRef.current = false;
      });
    });
  }

  return (
    <motion.article
      ref={cardRef}
      data-scroll-reveal="true"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.22, delay: index * 0.025 }}
      onMouseEnter={() => {
        if (!suppressHoverOpenRef.current) setExpanded(true);
      }}
      onMouseLeave={() => {
        suppressHoverOpenRef.current = false;
        if (!cardRef.current?.contains(document.activeElement)) setExpanded(false);
      }}
      onFocusCapture={() => {
        if (!suppressFocusOpenRef.current) setExpanded(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
      }}
      onKeyDownCapture={(event) => {
        if (event.key === "Escape" && expanded) {
          event.preventDefault();
          closeDetails();
        }
      }}
      className="technical-panel compact-work-panel group relative min-h-36 overflow-hidden border border-[#d2c8b9] bg-white shadow-sm sm:min-h-40"
      style={{ "--panel-accent": "#0f766e" }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-label={`${expanded ? "Hide" : "Show"} details for ${project.title}`}
        onClick={() => setExpanded((current) => !current)}
        className="flex min-h-36 w-full flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#244fd6] sm:min-h-40"
      >
        {media && (
          <div className="relative aspect-video w-full overflow-hidden border-b border-[#e1d7c8] bg-[#ded8cd]">
            {media.type === "video" ? (
              <video
                src={media.src}
                muted
                playsInline
                preload="metadata"
                aria-label={media.alt || project.title}
                className="h-full w-full bg-[#ded8cd] object-contain"
              />
            ) : (
              <FittedPhoto src={media.src} alt={media.alt || project.title} />
            )}
          </div>
        )}
        <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#0f766e] sm:text-[10px]">W{String(displayIndex + 1).padStart(2, "0")} / {project.type}</p>
          <h3 className="mt-3 text-sm font-semibold leading-5 text-slate-950 sm:text-base">{project.title}</h3>
        </div>
      </button>

      {expanded && (
        <div
          id={panelId}
          onClick={(event) => {
            if (event.target.closest("a, button")) return;
            suppressHoverOpenRef.current = true;
            setExpanded(false);
          }}
          className="absolute inset-0 z-10 flex cursor-pointer flex-col bg-white p-3 shadow-sm transition-opacity duration-150 motion-reduce:transition-none sm:p-4"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#0f766e] sm:text-[10px]">W{String(displayIndex + 1).padStart(2, "0")} / {project.type}</p>
          <h3 className="mt-2 text-sm font-semibold leading-5 text-slate-950 sm:text-base">{project.title}</h3>
          <p className="mt-2 text-[11px] leading-4 text-slate-700 sm:text-xs sm:leading-5">{project.description}</p>
          {(project.href || project.sourceHref) && (
            <div className="mt-auto flex min-h-7 flex-wrap items-center gap-2 pt-3">
              {project.href && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-7 items-center justify-center gap-1.5 border border-[#cfc4b4] bg-white px-2 text-[11px] font-semibold leading-none text-slate-950 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-[#244fd6] focus:ring-offset-1"
                >
                  {meta.moreWorkOpenLabel}
                  <Icon name="arrowRight" className="h-3.5 w-3.5" />
                </a>
              )}
              {project.sourceHref && (
                <a
                  href={project.sourceHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-7 items-center justify-center gap-1.5 border border-[#cfc4b4] bg-white px-2 text-[11px] font-semibold leading-none text-slate-950 transition hover:bg-[#f5f3ee] focus:outline-none focus:ring-2 focus:ring-[#244fd6] focus:ring-offset-1"
                >
                  <Icon name="github" className="h-3.5 w-3.5" />
                  {meta.moreWorkSourceLabel}
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </motion.article>
  );
}

function ContactButton({ href, icon, children, primaryOnDesktop = false, primaryOnMobile = false }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  if (!href || !children) return null;

  const primary = isMobile ? primaryOnMobile : primaryOnDesktop;
  const className = primary
    ? "rounded-none bg-slate-950 px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#244fd6] sm:px-4 sm:py-3 sm:text-sm"
    : "rounded-none border border-[#cfc4b4] bg-white px-3 py-2.5 text-xs font-semibold text-slate-950 hover:bg-[#fbfaf7] sm:px-4 sm:py-3 sm:text-sm";

  if (icon === "phone" && !isMobile) {
    return (
      <Button type="button" aria-disabled="true" className={cn(className, "cursor-default hover:bg-white")}>
        <Icon name={icon} className="mr-2 h-4 w-4" /> {children}
      </Button>
    );
  }

  return (
    <Button asChild className={className}>
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>
        <Icon name={icon} className="mr-2 h-4 w-4" /> {children}
      </a>
    </Button>
  );
}

function ActiveNavigationFrame() {
  return (
    <motion.span
      layoutId="active-navigation-section"
      aria-hidden="true"
      transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
      className="pointer-events-none absolute -inset-x-2 -inset-y-1 hidden border-x-2 border-[#244fd6] lg:block"
    />
  );
}

function useActiveNavigationSection(sectionLinks, enabled) {
  const [activeSection, setActiveSection] = useState("top");
  const navigationTargetRef = useRef(null);

  const lockActiveSection = useCallback((sectionId) => {
    navigationTargetRef.current = sectionId;
    setActiveSection(sectionId);
  }, []);

  const releaseActiveSection = useCallback((sectionId) => {
    if (navigationTargetRef.current === sectionId) navigationTargetRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    let frameId = null;

    function updateActiveSection() {
      frameId = null;
      if (navigationTargetRef.current) {
        setActiveSection(navigationTargetRef.current);
        return;
      }

      const entries = [
        { id: "top", element: document.getElementById("top") },
        ...sectionLinks.map((link) => ({
          id: link.href.replace(/^#/, ""),
          element: document.querySelector(link.href),
        })),
      ].filter((entry) => entry.id && entry.element);

      if (entries.length === 0) return;

      const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      const marker = window.scrollY + Math.min(window.innerHeight * 0.5, 360);
      let nextSection = entries[0].id;

      for (const entry of entries) {
        if (entry.element.offsetTop <= marker) nextSection = entry.id;
      }

      if (atPageEnd) nextSection = entries.at(-1).id;
      setActiveSection((current) => (current === nextSection ? current : nextSection));
    }

    function scheduleUpdate() {
      if (frameId === null) frameId = window.requestAnimationFrame(updateActiveSection);
    }

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [enabled, sectionLinks]);

  return [activeSection, lockActiveSection, releaseActiveSection];
}

function PortfolioPage({ content }) {
  const meta = content.meta ?? {};
  const heroHasImage = Boolean(meta.heroImageSrc);
  const homepageActivitySection = list(content.fullRecord).find((section) => section.showOnHomepage);
  const standardMoreWork = list(content.moreWork).filter((project) => project.presentationSize === "standard");
  const compactMoreWork = list(content.moreWork).filter((project) => project.presentationSize === "compact");
  const projectsById = new Map(list(content.projects).map((project) => [project.id, project]));
  const credentialsByLogoSrc = new Map(
    list(content.programCredentials)
      .filter((credential) => credential.logoSrc)
      .map((credential) => [credential.logoSrc, credential]),
  );
  const skills = list(content.skills);
  const personalSkillGroups = skills.filter((skill) => list(skill.projectIds).length > 0).reduce((groups, skill) => {
    const category = skill.category || "Other";
    const existing = groups.find((group) => group.category === category);
    if (existing) existing.skills.push(skill);
    else groups.push({ category, skills: [skill] });
    return groups;
  }, []);
  const tetcSkills = skills.filter((skill) => list(skill.credentialIds).includes("tetc"));
  const skillGroups = [
    ...personalSkillGroups.map((group) => ({ ...group, context: "Personal / hobby work" })),
    ...(tetcSkills.length > 0 ? [{ category: "TETC lessons", context: "TETC program", credentialId: "tetc", skills: tetcSkills }] : []),
  ];

  return (
    <>
      <section id="top" data-content-collection="meta" className="relative z-10 mx-auto max-w-7xl px-3 pb-4 pt-4 sm:px-5 sm:pb-8 sm:pt-8 md:px-8 md:pb-10 md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className={cn(
            "masthead relative overflow-hidden border-y border-[#cfc4b4]",
            heroHasImage ? "min-h-[24rem] bg-slate-950 sm:min-h-[30rem]" : "bg-[#f5f3ee]/45",
          )}
        >
          {heroHasImage && (
            <>
              <picture className="absolute inset-0">
                {meta.heroImageMobileSrc && <source media="(max-width: 639px)" srcSet={meta.heroImageMobileSrc} />}
                <img
                  src={meta.heroImageSrc}
                  alt={meta.heroImageAlt || meta.heroTitle}
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: meta.heroImagePosition || "center center" }}
                />
              </picture>
              <span aria-hidden="true" className="absolute inset-0 bg-slate-950/60" />
            </>
          )}

          <div className="relative z-10 grid min-h-[16.5rem] sm:min-h-[21rem] md:min-h-[23rem] lg:grid-cols-[minmax(0,1fr)_310px]">
            <div className="flex items-center py-5 sm:py-8 md:py-10">
              <div className={cn("w-full border-l-4 border-[#244fd6] pl-4 sm:pl-7 md:ml-[8%] md:pl-9 lg:mr-10", heroHasImage && "pr-4 sm:pr-7")}>
                <p className={cn("font-mono text-[9px] uppercase tracking-[0.13em] sm:text-[11px] sm:tracking-[0.17em]", heroHasImage ? "text-white/75" : "text-[#244fd6]")}>{meta.heroEyebrow}</p>
                <h1 className={cn("mt-2 text-3xl font-semibold leading-[1.03] tracking-normal sm:mt-3 sm:text-5xl md:text-6xl", heroHasImage ? "text-white" : "text-slate-950")}>{meta.heroTitle}</h1>
                <p className={cn("mt-3 max-w-4xl text-xl font-semibold leading-[1.18] tracking-normal sm:mt-5 sm:text-3xl sm:leading-tight md:text-4xl", heroHasImage ? "text-white" : "text-slate-900")}>{meta.heroLead}</p>
                <p className={cn("mt-3 max-w-3xl text-[12px] leading-5 sm:mt-5 sm:text-base sm:leading-7", heroHasImage ? "text-white/82" : "text-slate-700")}>{meta.heroIntro}</p>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 sm:mt-6 sm:gap-x-7">
                  <a
                    href="#projects"
                    onClick={(event) => {
                      event.preventDefault();
                      window.history.pushState(null, "", "#projects");
                      scrollToPreparedTarget(document.querySelector("#projects"), { behavior: "smooth", block: "start" });
                    }}
                    className={cn(
                      "signal-link inline-flex items-center border-b-2 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#244fd6] focus:ring-offset-2 sm:text-sm",
                      heroHasImage ? "border-white text-white hover:border-[#8fa8ff] hover:text-[#c9d4ff] focus:ring-offset-slate-950" : "border-[#244fd6] text-slate-950 hover:text-[#244fd6] focus:ring-offset-[#f5f3ee]",
                    )}
                  >
                    Selected work
                    <Icon name="arrowRight" className="ml-2 h-4 w-4" />
                  </a>
                  <a
                    href={meta.contactGithubHref}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "signal-link inline-flex items-center border-b border-[#827466]/45 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#244fd6] focus:ring-offset-2 sm:text-sm",
                      heroHasImage ? "text-white/85 hover:border-white hover:text-white focus:ring-offset-slate-950" : "text-slate-700 hover:border-[#244fd6] hover:text-[#244fd6] focus:ring-offset-[#f5f3ee]",
                    )}
                  >
                    <Icon name="github" className="mr-2 h-4 w-4" />
                    {meta.contactGithubLabel}
                  </a>
                </div>
              </div>
            </div>
            {!heroHasImage && <HeroProjectIndex projects={content.projects} />}
          </div>
        </motion.div>
      </section>

      <section id="projects" data-content-collection="projects" className="relative z-10 mx-auto max-w-7xl px-3 py-6 sm:px-5 sm:py-10 md:px-8 md:py-10">
        <SectionHeader index="01" title={meta.projectIndexTitle} />
        <div className="grid gap-3 sm:gap-4">
          {list(content.projects).map((project, index) => (
            <ProjectRow key={project.id} project={project} index={index} meta={meta} />
          ))}
        </div>
      </section>

      <section id="bench" data-content-collection="skills" className="relative z-10 mx-auto max-w-7xl px-3 py-6 sm:px-5 sm:py-10 md:px-8 md:py-14">
        <SectionHeader index="02" title={meta.skillSystemTitle} />
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          {skillGroups.map((group, index) => (
            <motion.article
              key={group.category}
              data-scroll-reveal="true"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
              className="technical-panel tool-panel min-w-0 border border-[#d2c8b9] bg-white p-2.5 shadow-sm sm:p-5"
              style={{ "--panel-accent": ["#244fd6", "#b45309", "#0f766e", "#8b5e3c"][index % 4] }}
            >
              <div className="flex items-start justify-between gap-2 border-b border-[#e1d7c8] pb-2 sm:gap-3 sm:pb-3">
                <div className="min-w-0">
                  <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#827466] sm:text-[9px] sm:tracking-[0.14em]">
                    T{String(index + 1).padStart(2, "0")} / {group.context}
                  </p>
                  <h3 className="mt-1 text-[13px] font-semibold leading-5 text-slate-950 sm:mt-2 sm:text-lg">
                    {group.credentialId ? (
                      <a
                        href={`#${credentialAnchorId(group.credentialId)}`}
                        onClick={(event) => jumpToCredential(event, group.credentialId)}
                        className="inline-flex min-w-0 items-center text-[#244fd6] hover:underline focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                      >
                        {group.category}
                        <Icon name="arrowRight" className="ml-1 h-3 w-3 shrink-0 sm:ml-1.5 sm:h-3.5 sm:w-3.5" />
                      </a>
                    ) : group.category}
                  </h3>
                </div>
                <span aria-hidden="true" className="tool-panel-icon grid h-7 w-7 shrink-0 place-items-center border sm:h-9 sm:w-9">
                  <Icon name={["wrench", "zap", "cpu", "layers"][index % 4]} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-1.5 sm:mt-3 sm:gap-3">
                {group.skills.map((skill) => (
                  <div key={skill.id} className="min-w-0">
                    <p className="break-words text-[11px] font-semibold leading-4 text-slate-900 sm:text-sm">{skill.name}</p>
                    {!group.credentialId && (
                      <div className="mt-1 hidden flex-wrap gap-x-2 gap-y-1 sm:flex">
                        {list(skill.projectIds).map((projectId) => {
                          const project = projectsById.get(projectId);
                          return project ? (
                            <a
                              key={projectId}
                              href={`#${projectAnchorId(project)}`}
                              onClick={(event) => jumpToProject(event, project)}
                              className="text-[11px] text-[#244fd6] hover:underline focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                            >
                              {project.title}
                            </a>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
        {meta.toolMediaEnabled === "true" && list(content.toolMedia).length > 0 && (
          <div className="mt-5 border-t border-[#d2c8b9] pt-4 sm:mt-8 sm:pt-6">
            <h3 className="text-lg font-semibold leading-6 text-slate-950 sm:text-xl">{meta.toolMediaTitle}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-700 sm:text-sm">{meta.toolMediaSubtitle}</p>
            <MediaCarousel media={content.toolMedia} label={meta.toolMediaTitle} />
          </div>
        )}
      </section>

      <section id="academics" data-content-collection="academics" className="relative z-20 mx-auto max-w-7xl px-3 py-6 sm:px-5 sm:py-10 md:px-8 md:py-14">
        <div className="section-heading mb-4 grid gap-3 border-t border-[#d2c8b9] pt-5 sm:mb-6 sm:gap-4 sm:pt-6 lg:grid-cols-[minmax(380px,0.62fr)_minmax(0,1.38fr)] lg:items-center">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 sm:gap-5">
            <span aria-hidden="true" className="section-index font-mono text-[11px] font-semibold tracking-[0.14em] text-[#244fd6] sm:text-xs">03</span>
            <TitleBlock title={meta.academicTitle} />
          </div>
          <AcademicSchoolCard meta={meta} />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-[0.7fr_0.7fr_1.6fr]">
          {list(content.academics).map((item, index) => (
            <AcademicCard
              key={item.id}
              item={item}
              index={index}
              wide={item.id === "course-load"}
              valueAction={item.id === "course-load" ? <AcademicDetailsDialog details={list(content.academicDetails)} meta={meta} triggerLabel={item.value} /> : null}
            />
          ))}
        </div>

        {list(content.programCredentials).length > 0 && (
          <div className="mt-5 border-t border-[#d2c8b9] pt-4 sm:mt-8 sm:pt-6" data-content-collection="programCredentials">
            <div className="mb-3 max-w-2xl sm:mb-4">
              <h2 className="text-xl font-semibold leading-6 text-slate-950 sm:text-2xl sm:leading-7">
                {meta.credentialsTitle || "Programs and credentials"}
              </h2>
            </div>
            <div className="grid gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {list(content.programCredentials).map((credential, index) => (
                <ProgramCredentialCard key={credential.id} credential={credential} index={index} meta={meta} />
              ))}
            </div>
          </div>
        )}

        <HomepageActivitySection
          section={homepageActivitySection}
          learningHighlights={content.learningHighlights}
          title={meta.activitiesTitle || "Activities and involvement"}
        />
      </section>

      {list(content.moreWork).length > 0 && (
        <section id="more-work" data-content-collection="moreWork" className="relative z-10 mx-auto max-w-7xl px-3 py-6 sm:px-5 sm:py-12 md:px-8 md:py-16">
          <SectionHeader index="04" title={meta.moreWorkTitle || "More work"} />
          {standardMoreWork.length > 0 && (
            <div className="grid items-start gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
              {standardMoreWork.map((project, index) => (
                <MoreWorkStandardCard
                  key={project.id}
                  project={project}
                  index={index}
                  meta={meta}
                  linkedCredential={credentialsByLogoSrc.get(project.logoSrc) ?? null}
                />
              ))}
            </div>
          )}
          {compactMoreWork.length > 0 && (
            <div className={cn("grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3", standardMoreWork.length > 0 && "mt-5 border-t border-[#d2c8b9] pt-5 sm:mt-8 sm:pt-8")}>
              {compactMoreWork.map((project, index) => (
                <MoreWorkCompactCard key={project.id} project={project} index={index} displayIndex={standardMoreWork.length + index} meta={meta} />
              ))}
            </div>
          )}
        </section>
      )}

      <ContactSection content={content} />
    </>
  );
}

function RecordPage({ content }) {
  const meta = content.meta ?? {};
  const academicSummary = list(content.academics).filter((item) => item.id === "gpa" || item.id === "rank");
  const academicRecordSection = {
    id: "academic-record",
    category: "Academic record",
    icon: "school",
    items: [...academicSummary, ...list(content.academicDetails)].map((item) => ({
      id: item.id,
      title: item.label,
      date: "",
      detail: `${item.value}${item.note ? ` - ${item.note}` : ""}`,
      href: null,
      hrefLabel: "",
    })),
  };
  const programRecordSection = {
    id: "programs-credentials",
    category: meta.credentialsTitle || "Programs and credentials",
    icon: "school",
    items: list(content.programCredentials).map((credential) => ({
      id: credential.id,
      title: credential.program,
      date: credential.date,
      detail: programRecordDetail(credential),
      href: credential.href,
      hrefLabel: credential.hrefLabel,
    })),
  };

  return (
    <>
      <section id="top" className="relative z-10 mx-auto max-w-7xl px-3 pb-2 pt-4 sm:px-5 sm:pb-3 sm:pt-7 md:px-8 md:pt-8">
        <div className="technical-panel border border-[#d2c8b9] bg-white p-3 shadow-sm sm:p-5 md:p-6">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 sm:gap-5">
              <span aria-hidden="true" className="section-index font-mono text-[10px] font-semibold tracking-[0.12em] text-[#244fd6]">R</span>
              <TitleBlock title={meta.recordTitle} as="h1" className="max-w-4xl" />
            </div>
            <Button asChild className="self-start rounded-none bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#244fd6] sm:px-5 sm:py-3 sm:text-sm">
              <Link to="/"><Icon name="chevronLeft" className="mr-2 h-4 w-4" />{meta.backPortfolioLabel}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-3 pb-6 pt-2 sm:px-5 sm:pb-10 sm:pt-3 md:px-8 md:pb-12">
        <div className="grid gap-3 sm:gap-4">
          <RecordSectionCard section={academicRecordSection} collection="academicDetails" index={1} />
          <RecordSectionCard section={programRecordSection} collection="programCredentials" index={2} />
          {list(content.fullRecord).map((section, index) => <RecordSectionCard key={section.id} section={section} index={index + 3} />)}
        </div>
      </section>

      <ContactSection content={content} />
    </>
  );
}

function ContactSection({ content }) {
  const meta = content.meta ?? {};
  const [copyStatus, setCopyStatus] = useState("idle");
  const contactButtons = [
    { href: meta.contactEmailHref, icon: "mail", label: meta.contactEmailLabel, primaryOnDesktop: true },
    { href: meta.contactPhoneHref, icon: "phone", label: meta.contactPhoneLabel, primaryOnMobile: true },
    { href: meta.contactGithubHref, icon: "github", label: meta.contactGithubLabel },
    { href: meta.resumeHref, icon: "list", label: meta.resumeLabel },
  ].filter((button) => button.href && button.label);

  async function copyPortfolioText() {
    setCopyStatus("copying");

    try {
      const response = await fetch("/llms-full.txt", { cache: "no-store" });
      if (!response.ok) throw new Error(`Could not load portfolio text (${response.status}).`);

      const portfolioText = await response.text();
      let copied = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(portfolioText);
          copied = true;
        } catch {
          copied = false;
        }
      }

      if (!copied) {
        const textarea = document.createElement("textarea");
        textarea.value = portfolioText;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        copied = document.execCommand("copy");
        textarea.remove();
        if (!copied) throw new Error("Clipboard copy was blocked.");
      }

      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <section id="contact" className="relative z-10 mx-auto max-w-7xl px-3 py-6 sm:px-5 sm:py-8 md:px-8 md:py-10">
      <div className="technical-panel border border-[#d2c8b9] bg-white shadow-[0_16px_45px_rgba(34,28,18,0.08)]">
        <div className="grid gap-3 p-3 sm:gap-5 sm:p-5 md:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)] md:items-center md:p-6">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 sm:gap-4">
            <span aria-hidden="true" className="section-index font-mono text-[11px] font-semibold tracking-[0.14em] text-[#244fd6]">05</span>
            <TitleBlock title={meta.contactTitle}>
              {meta.contactText}
            </TitleBlock>
          </div>
          <div className="flex flex-row flex-wrap justify-start gap-2 md:justify-end">
            {contactButtons.map((button) => (
              <ContactButton
                key={button.icon}
                href={button.href}
                icon={button.icon}
                primaryOnDesktop={button.primaryOnDesktop}
                primaryOnMobile={button.primaryOnMobile}
              >
                {button.label}
              </ContactButton>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#d2c8b9] bg-[#fbfaf7] p-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#827466] md:p-4 md:text-[11px] md:tracking-[0.16em]">
          <p>&copy; {new Date().getFullYear()} {meta.footerName}</p>
          <div className="flex flex-wrap items-center justify-end gap-3 normal-case tracking-normal">
            <Button
              type="button"
              onClick={copyPortfolioText}
              disabled={copyStatus === "copying"}
              className="rounded-none px-1 py-1 text-[10px] font-semibold text-slate-600 hover:text-[#244fd6] md:text-[11px]"
            >
              <Icon name={copyStatus === "copied" ? "check" : "copy"} className="mr-1.5 h-3.5 w-3.5" />
              {copyStatus === "copying" ? "Copying..." : copyStatus === "copied" ? "Copied" : "Copy as text"}
            </Button>
            <a className="text-slate-600 underline decoration-[#cfc4b4] underline-offset-4 hover:text-[#244fd6]" href="/llms-full.txt">
              Machine-readable portfolio
            </a>
          </div>
          <span className="sr-only" role="status" aria-live="polite">
            {copyStatus === "copied" ? "Portfolio text copied to clipboard." : copyStatus === "error" ? "Portfolio text could not be copied." : ""}
          </span>
        </div>
      </div>
    </section>
  );
}

async function scrollToPageSection(event, href, lockActiveSection, releaseActiveSection) {
  if (!href?.startsWith("#")) return;

  const target = document.querySelector(href);
  if (!target) return;

  event.preventDefault();
  const sectionId = href.slice(1);
  lockActiveSection(sectionId);

  if (window.location.hash !== href) {
    window.history.pushState(null, "", href);
  }

  try {
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const didScroll = await scrollToPreparedTarget(target, {
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    if (didScroll && !prefersReducedMotion) await waitForWindowScrollToSettle();
  } finally {
    releaseActiveSection(sectionId);
  }
}

function Navigation({ content }) {
  const location = useLocation();
  const meta = content.meta ?? {};
  const isPortfolioRoute = location.pathname === "/";
  const sectionLinks = list(content.navLinks);
  const [activeSection, lockActiveSection, releaseActiveSection] = useActiveNavigationSection(sectionLinks, isPortfolioRoute);

  return (
    <nav className="sticky top-0 z-30 border-b border-[#d2c8b9] bg-[#f5f3ee]/95 backdrop-blur-md">
      <LayoutGroup id="portfolio-section-navigation">
        <div className="mx-auto grid min-h-12 max-w-7xl grid-cols-1 items-center px-3 py-1.5 md:px-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-5">
          <Link
            to="/#top"
            aria-current={isPortfolioRoute && activeSection === "top" ? "location" : undefined}
            onClick={(event) => {
              if (isPortfolioRoute) {
                scrollToPageSection(event, "#top", lockActiveSection, releaseActiveSection);
              } else {
                lockActiveSection("top");
                releaseActiveSection("top");
              }
            }}
            className="group relative flex min-w-0 items-center gap-2.5"
          >
            {isPortfolioRoute && activeSection === "top" && <ActiveNavigationFrame />}
            <span className="brand-monogram shrink-0 font-mono text-[13px] font-semibold tracking-[0.08em] text-[#244fd6] transition-colors group-hover:text-slate-950">
              CH<span aria-hidden="true" className="text-[#827466]">/</span>
            </span>
            <span className="min-w-0">
              <span className="block whitespace-nowrap text-xs font-semibold text-slate-950 sm:text-sm">
                <span className="sm:hidden">Christopher</span>
                <span className="hidden sm:inline">{meta.navName}</span>
              </span>
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-[#827466] md:block">{meta.navSubtitle}</span>
            </span>
          </Link>

          {isPortfolioRoute && (
            <div className="hidden min-w-0 items-center justify-center gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600 lg:flex xl:gap-6 xl:tracking-[0.16em]">
              {sectionLinks.map((link) => {
                const sectionId = link.href.replace(/^#/, "");
                const isActive = activeSection === sectionId;

                return (
                  <a
                    key={link.id}
                    aria-current={isActive ? "location" : undefined}
                    onClick={(event) => scrollToPageSection(event, link.href, lockActiveSection, releaseActiveSection)}
                    className={cn(
                      "relative whitespace-nowrap py-1 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
                      isActive ? "text-slate-950" : "border-b border-transparent hover:border-[#827466] hover:text-slate-950",
                    )}
                    href={link.href}
                  >
                    {isActive && <ActiveNavigationFrame />}
                    {link.label}
                  </a>
                );
              })}
            </div>
          )}

        </div>
      </LayoutGroup>
    </nav>
  );
}

function ScrollToRouteTarget() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      window.setTimeout(() => {
        const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        document.querySelector(location.hash)?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
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
      <div className="pointer-events-none fixed inset-0 opacity-[0.42]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,46,32,0.105)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,46,32,0.085)_1px,transparent_1px)] bg-[size:42px_42px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(36,79,214,0.095)_1px,transparent_1px),linear-gradient(to_bottom,rgba(36,79,214,0.075)_1px,transparent_1px)] bg-[size:168px_168px]" />
      </div>

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
