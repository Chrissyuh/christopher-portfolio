import React, { useState } from "react";
import { motion } from "framer-motion";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Button({ asChild = false, className = "", children, ...props }) {
  const baseClass = "inline-flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

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

function Card({ className = "", children, ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

function CardContent({ className = "", children, ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

const iconPaths = {
  arrowRight: "M5 12h14M13 5l7 7-7 7",
  cpu: "M9 9h6v6H9z M9 1v3 M15 1v3 M9 20v3 M15 20v3 M1 9h3 M1 15h3 M20 9h3 M20 15h3 M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z",
  github: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.8c0-1-.4-1.7-.9-2.2 3-.3 6.1-1.5 6.1-6.6 0-1.5-.5-2.7-1.4-3.7.1-.3.6-1.8-.1-3.7 0 0-1.2-.4-3.8 1.4a13.2 13.2 0 0 0-7 0C6.3.6 5.1 1 5.1 1c-.7 1.9-.2 3.4-.1 3.7a5.2 5.2 0 0 0-1.4 3.7c0 5.1 3.1 6.3 6.1 6.6-.4.4-.8 1-.9 1.8v4.2",
  linkedin: "M6.5 10v9M6.5 6.5v.1M10.5 19v-9M10.5 13.5c0-2 1.2-3.5 3.5-3.5s3.5 1.5 3.5 4v5M3 3h18v18H3z",
  mail: "M4 6h16v12H4z M4 7l8 6 8-6",
  printer: "M7 8V3h10v5 M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M7 14h10v7H7z M17 11h.01",
  school: "M3 10l9-5 9 5-9 5-9-5z M7 12v5c2 2 8 2 10 0v-5 M21 10v7",
  wrench: "M14.7 6.3a4 4 0 0 0-5 5L3 18v3h3l6.7-6.7a4 4 0 0 0 5-5l-2.8 2.8-3-3 2.8-2.8z",
  zap: "M13 2L3 14h8l-1 8 11-14h-8l1-6z",
  layers: "M12 3l9 5-9 5-9-5 9-5z M3 12l9 5 9-5 M3 16l9 5 9-5",
  gauge: "M4 14a8 8 0 0 1 16 0 M12 14l4-4 M8 18h8",
  route: "M4 6h6a4 4 0 0 1 4 4v4a4 4 0 0 0 4 4h2 M4 6l3-3M4 6l3 3 M20 18l-3-3M20 18l-3 3",
  bolt: "M8 2h8l-2 7h5l-9 13 2-9H7z",
  box: "M4 7l8-4 8 4v10l-8 4-8-4z M4 7l8 4 8-4 M12 11v10",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
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
      <path d={iconPaths[name]} />
    </svg>
  );
}

const accentStyles = {
  blue: { text: "text-[#244fd6]", bg: "bg-[#244fd6]", soft: "bg-[#eef2ff]", border: "border-[#bdc8ff]" },
  teal: { text: "text-[#0f766e]", bg: "bg-[#0f766e]", soft: "bg-[#eef8f6]", border: "border-[#a9d9d3]" },
  amber: { text: "text-[#b45309]", bg: "bg-[#b45309]", soft: "bg-[#fff7ed]", border: "border-[#f0c28c]" },
  clay: { text: "text-[#8b5e3c]", bg: "bg-[#8b5e3c]", soft: "bg-[#f7f0ea]", border: "border-[#d7b99f]" },
};

const projects = [
  {
    number: "A01",
    title: "Garden Party Pinball",
    label: "flagship electromechanical build",
    status: "active build",
    accent: "blue",
    summary:
      "A full-size homebrew pinball machine built around real coils, switches, lamps, cabinet wiring, software rules, and a physical playfield that is being revised as the hardware comes together.",
    evidence: ["FAST Pinball boards", "Mission Pinball Framework", "coils / switches / lamps", "CAD + wiring revisions"],
    next: "photos, playfield CAD, wiring maps, MPF configs, driver tests, and rule-system notes",
    preview: {
      title: "Playfield + control stack",
      label: "system map",
      parts: ["cabinet I/O", "switch matrix", "coils", "MPF"],
    },
  },
  {
    number: "A02",
    title: "Smart Self-Watering Pot",
    label: "embedded product redesign",
    status: "reviving / redesigning",
    accent: "teal",
    summary:
      "A plant-care device that uses soil moisture sensing, pump control, electronics packaging, and enclosure design to move from a breadboard prototype toward a cleaner product-style revision.",
    evidence: ["ESP32 / Arduino-style control", "pump driver", "sensor input", "KiCad + enclosure planning"],
    next: "schematic, board outline, enclosure constraints, connector plan, and watering state machine",
    preview: {
      title: "Sensor → controller → pump",
      label: "control loop",
      parts: ["moisture", "MOSFET", "reservoir", "OLED"],
    },
  },
  {
    number: "A03",
    title: "TETC 3D Printing Showcase",
    label: "technical communication",
    status: "showcase work",
    accent: "amber",
    summary:
      "A technical showcase explaining how 3D printing supports engineering through complex geometry, fast iteration, better communication, and robotics/mechanical examples.",
    evidence: ["SolidWorks models", "printed demos", "robotics angle", "public explanation"],
    next: "model screenshots, printed examples, final presentation notes, and a clean engineering narrative",
    preview: {
      title: "CAD model → printed proof",
      label: "showcase flow",
      parts: ["model", "slice", "print", "explain"],
    },
  },
  {
    number: "A04",
    title: "CAD Mechanism Studies",
    label: "mechanical skill building",
    status: "ongoing library",
    accent: "clay",
    summary:
      "A growing set of mechanisms, assemblies, and print-ready studies used to build better mechanical intuition before those ideas become full machines.",
    evidence: ["assemblies", "print-ready parts", "tolerance experiments", "mechanism notes"],
    next: "short annotated notes for each mechanism, including constraints, mistakes, and what the model taught",
    preview: {
      title: "Assembly study library",
      label: "mechanism map",
      parts: ["mates", "clearance", "motion", "tolerance"],
    },
  },
];

const academics = [
  ["Grades", "All As"],
  ["Rank", "3rd of 113"],
  ["Math", "College Algebra / advanced math track"],
  ["Course load", "All advanced classes, including AP Human Geography and AP Spanish Language"],
];

const smallerProjects = [
  {
    title: "Check-ins",
    href: "https://check-ins-zeta.vercel.app/",
    type: "live web app",
    description:
      "A live web app for logging check-ins and tracking consistency through target gaps, maximum gaps, and simple progress feedback.",
  },
  {
    title: "MPF Hardware Test Tools",
    href: null,
    type: "pinball utilities",
    description:
      "A set of pinball test utilities for checking switches, coils, LEDs, board mappings, and FAST hardware behavior before full game logic is installed.",
  },
  {
    title: "MIDI Practice Tool",
    href: null,
    type: "python / music",
    description:
      "A small Python music-practice utility exploring on-screen controls, soundfonts, pedals, and keyboard-style interaction for more focused practice.",
  },
  {
    title: "Desmos 3D Solar System",
    href: "https://www.desmos.com/3d/qcjp33t4ij",
    type: "math visualization",
    description:
      "A mathematical visualization project using 3D surfaces, orbits, color mapping, and performance tradeoffs to build a stylized solar system scene.",
  },
  {
    title: "TinyGPT Experiments",
    href: null,
    type: "machine learning",
    description:
      "A learning project exploring how a small next-token prediction model is trained, tested, and separated from a true instruction-following assistant.",
  },
  {
    title: "VEX V5 Drivetrain Prototype",
    href: null,
    type: "robotics prototype",
    description:
      "A quick robotics build using gearing and packaging constraints to create a motorized wheel prototype while avoiding shaft and structure interference.",
  },
];

const skillNarratives = [
  {
    title: "Mechanical design",
    icon: "wrench",
    text:
      "I use CAD to reason through mechanisms before they become physical parts: clearances, assemblies, print orientation, mounting, and how the design will actually be built.",
  },
  {
    title: "Hardware + electronics",
    icon: "cpu",
    text:
      "My strongest projects combine wiring, sensors, actuators, power routing, and controller behavior instead of treating electronics as a separate afterthought.",
  },
  {
    title: "Software as a tool for hardware",
    icon: "route",
    text:
      "I write code to test, control, and explain real systems: MPF configs, hardware test utilities, embedded logic, web apps, and debugging workflows.",
  },
  {
    title: "AI-assisted engineering workflow",
    icon: "layers",
    text:
      "I use ChatGPT as a reasoning partner for debugging, planning, documentation, and code review while keeping the design decisions grounded in real tests and constraints.",
  },
];

const principles = [
  {
    title: "Show the mechanism",
    text: "A good project page should make the working parts understandable: CAD, wiring, test setup, constraints, and the reason the design exists.",
  },
  {
    title: "Document revisions",
    text: "A failed wiring map, bad enclosure fit, or design mistake is valuable when it explains what changed and why the next version is better.",
  },
  {
    title: "Prefer working artifacts",
    text: "Finished polish matters, but the portfolio should prioritize real hardware, test videos, CAD screenshots, measurements, code, and build logs.",
  },
];

const skills = [
  "SolidWorks",
  "FAST Pinball",
  "Mission Pinball Framework",
  "Arduino / ESP32",
  "KiCad basics",
  "3D printing",
  "laser cutting",
  "mechanism design",
  "sensor wiring",
  "pump / motor control",
  "technical presentation",
  "rapid iteration",
  "ChatGPT-assisted debugging",
];

const fullRecord = [
  {
    category: "Flagship engineering",
    icon: "wrench",
    items: [
      "Garden Party Pinball — full-size homebrew pinball machine using FAST hardware, MPF, real coils, switches, lamps, wiring, and playfield revisions.",
      "Smart Self-Watering Pot — embedded plant-care project with moisture sensing, pump control, enclosure planning, and a planned custom PCB direction.",
      "TETC 3D Printing Engineering Showcase — technical presentation work explaining how additive manufacturing supports mechanical and robotics engineering.",
      "CAD Mechanism Studies — ongoing SolidWorks practice for assemblies, mechanisms, print-ready parts, tolerances, and mechanical design intuition.",
      "FAST / MPF Hardware Test Tools — utilities and configs for testing pinball switches, drivers, LEDs, board mappings, and hardware behavior.",
    ],
  },
  {
    category: "Software, visualization, and AI",
    icon: "cpu",
    items: [
      "Check-ins — live Vercel web app for logging consistency and tracking target gaps and maximum gaps.",
      "Desmos 3D Solar System — 3D mathematical visualization using surfaces, orbits, color mapping, and performance-aware scene design.",
      "TinyGPT Experiments — small language-model learning project focused on next-token prediction and the difference between pretraining and instruction behavior.",
      "MIDI Practice Tool — Python music-practice utility exploring soundfonts, pedals, controls, and keyboard-style interaction.",
      "Manim / presentation animation work — data and explanation visuals built with timing, text layout, and animation refinements.",
      "BetterQuizzer / quiz-app work — web-app development and debugging around hosted quiz submission and persistence behavior.",
    ],
  },
  {
    category: "Fabrication and maker skills",
    icon: "printer",
    items: [
      "3D printing workflow — Bambu Studio, filament/material planning, iteration prints, print orientation, and fit testing.",
      "Laser cutting workflow — design and fabrication planning for flat-cut parts and future project enclosures.",
      "Home maker-lab practice — hands-on learning across CAD, wiring, printing, scanning, electronics, and mechanical assembly.",
      "VEX V5 Drivetrain Prototype — robotics drivetrain build using gearing and packaging constraints around structure interference.",
      "SolidWorks modeling depth — part design, assemblies, complex forms, and fabrication-oriented CAD decisions.",
    ],
  },
  {
    category: "Academics",
    icon: "school",
    items: [
      "Spring Early College Academy — 9th grade dual-credit student at SECA in Spring ISD.",
      "Current standing — all As, ranked 3rd of 113.",
      "Advanced math — College Algebra and an accelerated math path.",
      "Advanced course load — all advanced classes, including AP Human Geography and AP Spanish Language.",
      "Dual-credit direction — building toward college-level coursework while still in high school.",
    ],
  },
  {
    category: "Competitions, speaking, and leadership",
    icon: "trophy",
    items: [
      "UIL Number Sense — math competition experience with a history of strong performance.",
      "Informative Speaking — public-speaking competition and presentation practice.",
      "Debate — JV finals experience and competitive speaking development.",
      "Student Council — school leadership and campus involvement.",
      "TETC presentations — technical communication for engineering projects and showcase work.",
    ],
  },
  {
    category: "Scouts, service, and long-term discipline",
    icon: "target",
    items: [
      "Scouts BSA — First Class Scout working toward Eagle.",
      "Eagle planning — long-term paperwork, service, and merit-badge planning.",
      "Troop leadership interests — Librarian and Bugler planning, including checkout systems and bugle-call practice.",
      "Fitness requirement tracking — exercise logs and reflection work for rank and merit-badge progress.",
      "Service mindset — using projects, leadership roles, and planning to build toward Eagle and Palms.",
    ],
  },
  {
    category: "Languages and long-term learning",
    icon: "list",
    items: [
      "Duolingo streak — long-running daily language-learning streak of more than 1,600 days.",
      "Spanish — AP Spanish Language coursework and continued language development.",
      "French — active beginner-to-intermediate learning with practice in pronunciation, listening, and sentence construction.",
      "Latin background — foundational Latin study used to make future language learning easier.",
      "Self-directed learning — consistent use of projects, tools, and practice systems to learn beyond assigned schoolwork.",
    ],
  },
];

const validationChecks = [
  { name: "warm off-white background", pass: true },
  { name: "project previews", pass: projects.every((project) => project.preview?.parts?.length >= 4) },
  { name: "full record page", pass: fullRecord.length >= 6 && fullRecord.some((section) => section.category.includes("Scouts")) },
  { name: "smaller project links", pass: smallerProjects.some((project) => project.href?.includes("check-ins-zeta")) && smallerProjects.some((project) => project.href?.includes("desmos.com")) },
  { name: "local icons only", pass: ["github", "linkedin", "mail", "route", "target", "box", "link", "layers", "list", "trophy"].every((name) => Boolean(iconPaths[name])) },
  { name: "engineering-specific skills", pass: skills.includes("FAST Pinball") && skills.includes("Mission Pinball Framework") && skills.includes("ChatGPT-assisted debugging") },
];

console.assert(
  validationChecks.every((check) => check.pass),
  "Portfolio self-check failed:",
  validationChecks.filter((check) => !check.pass)
);

function Tag({ children }) {
  return (
    <span className="border border-[#d6cec0] bg-[#fbfaf7] px-2.5 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
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

function PreviewPanel({ project }) {
  const style = accentStyles[project.accent];

  return (
    <div className={`relative min-h-[190px] overflow-hidden border ${style.border} ${style.soft} p-4`}>
      <div className="absolute inset-0 opacity-45">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(23,32,51,0.13)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,32,51,0.10)_1px,transparent_1px)] bg-[size:22px_22px]" />
      </div>
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#827466]">{project.preview.label}</p>
            <p className="mt-2 text-base font-semibold leading-5 tracking-[-0.02em] text-slate-950">
              {project.preview.title}
            </p>
          </div>
          <div className={`grid h-9 w-9 place-items-center border border-current bg-white/70 ${style.text}`}>
            <Icon name="layers" className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2">
          {project.preview.parts.map((part, index) => (
            <div key={part} className="border border-white/70 bg-white/75 p-2 shadow-sm backdrop-blur-sm">
              <p className={`font-mono text-[10px] ${style.text}`}>P{index + 1}</p>
              <p className="mt-1 text-xs font-semibold text-slate-800">{part}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-current/20 pt-3">
          <p className="text-xs leading-5 text-slate-700">A quick visual map of the project’s main subsystems and engineering evidence.</p>
        </div>
      </div>
    </div>
  );
}

function ProjectRow({ project, index }) {
  const style = accentStyles[project.accent];

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.045 }}
      className="group grid border border-[#d2c8b9] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(34,28,18,0.08)] xl:grid-cols-[190px_270px_1fr]"
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
        <PreviewPanel project={project} />
      </div>

      <div className="grid lg:grid-cols-[1fr_250px]">
        <div className="p-5 md:p-6">
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">{project.title}</h3>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700 md:text-lg">{project.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.evidence.map((item) => (
              <Tag key={item}>{item}</Tag>
            ))}
          </div>
        </div>

        <div className="border-t border-[#e1d7c8] bg-[#fbfaf7] p-5 lg:border-l lg:border-t-0">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#827466]">future project page</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{project.next}</p>
        </div>
      </div>
    </motion.article>
  );
}

function SmallProjectCard({ project, index }) {
  const content = (
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
        {project.href && <Icon name="link" className="h-4 w-4 text-[#827466] transition group-hover:text-[#244fd6]" />}
      </div>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">{project.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">{project.description}</p>
        </div>
        <div className="mt-5 h-1.5 w-16 bg-[#244fd6] opacity-80" />
      </div>
    </motion.article>
  );

  if (!project.href) return content;

  return (
    <a href={project.href} target="_blank" rel="noreferrer" className="block h-full">
      {content}
    </a>
  );
}

function ContactButton({ href, icon, children, primary = false }) {
  return (
    <Button
      asChild
      variant={primary ? "default" : "outline"}
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

function PageButton({ active, onClick, icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "flex items-center gap-2 border border-slate-950 bg-slate-950 px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-white"
          : "flex items-center gap-2 border border-[#cfc4b4] bg-white px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-slate-700 hover:text-slate-950"
      }
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

function PortfolioPage({ setPage }) {
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
              <Tag>mechatronics</Tag>
              <Tag>embedded systems</Tag>
              <Tag>CAD / fabrication</Tag>
              <Tag>student engineer</Tag>
            </div>

            <div className="mt-7 grid gap-8 xl:grid-cols-[1fr_260px]">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#827466]">portfolio index / active work</p>
                <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.045em] text-slate-950 md:text-5xl">
                  Hardware, CAD, wiring, code, and the revisions between them.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 md:text-lg">
                  I build projects where the mechanical design, electronics, software, and documentation all have to meet in the real world. This portfolio is organized around proof: what works, what changed, and what still needs to be improved.
                </p>
              </div>

              <div className="border border-[#d2c8b9] bg-[#fbfaf7] p-4">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#827466]">current stack</p>
                <div className="mt-4 space-y-3">
                  {[
                    ["01", "Garden Party pinball"],
                    ["02", "Smart pot PCB / enclosure"],
                    ["03", "SolidWorks mechanism studies"],
                    ["04", "small web + robotics tools"],
                  ].map(([num, item]) => (
                    <div key={item} className="flex gap-3 border-t border-[#e1d7c8] pt-3 first:border-t-0 first:pt-0">
                      <span className="font-mono text-xs text-[#244fd6]">{num}</span>
                      <span className="text-sm font-medium text-slate-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-none bg-slate-950 px-5 py-5 text-sm font-semibold text-white hover:bg-[#244fd6]">
                <a href="#projects">
                  Open project index <Icon name="arrowRight" className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button className="rounded-none bg-white px-5 py-5 text-sm font-semibold text-slate-950 ring-1 ring-[#cfc4b4] hover:bg-[#fbfaf7]" onClick={() => setPage("record")}>View full record</Button>
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
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#827466]">focus</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">engineering evidence</h2>
                </div>
                <div className="grid h-11 w-11 place-items-center border border-[#d2c8b9] bg-[#f5f3ee] text-[#244fd6]">
                  <Icon name="target" />
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <p className="text-sm leading-6 text-slate-700">
                  The goal is to show real build depth: hardware decisions, CAD constraints, wiring maps, test logs, project tradeoffs, and the exact revisions that made each design better.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    ["real", "hardware"],
                    ["specific", "toolchains"],
                    ["visible", "iterations"],
                    ["clear", "next steps"],
                    ["proof", "test logs"],
                    ["honest", "revisions"],
                  ].map(([top, bottom]) => (
                    <div key={top} className="border border-[#d2c8b9] bg-white p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#827466]">{top}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{bottom}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 border-t border-[#d2c8b9] pt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#827466]">portfolio rule</p>
                <p className="mt-2 text-sm font-semibold leading-5 text-slate-950">Every major page should show evidence, not just claims.</p>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      <section id="projects" className="relative z-10 mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <SectionHeader code="PROJECT INDEX" title="Main engineering tracks.">
          These are the projects that best show the kind of engineering I care about: physical systems, real constraints, software that touches hardware, and enough documentation to make the design understandable.
        </SectionHeader>
        <div className="grid gap-4">
          {projects.map((project, index) => (
            <ProjectRow key={project.title} project={project} index={index} />
          ))}
        </div>
      </section>

      <section id="academics" className="relative z-10 mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <SectionHeader code="ACADEMIC SNAPSHOT" title="Strong course load, strong results.">
          A small academic snapshot for context: the main portfolio is still project-first, but the coursework shows that the engineering work is backed by consistent school performance.
        </SectionHeader>

        <div className="grid gap-4 md:grid-cols-4">
          {academics.map(([label, value], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: index * 0.035 }}
              className="border border-[#d2c8b9] bg-white p-5 shadow-sm"
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#827466]">{label}</p>
              <p className="mt-3 text-lg font-semibold leading-6 tracking-[-0.02em] text-slate-950">{value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="smaller-projects" className="relative z-10 mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <SectionHeader code="SMALLER BUILDS" title="Smaller projects and experiments.">
          Not every useful project needs to be a flagship build. These smaller pieces show software practice, robotics experiments, visualization, and technical curiosity.
        </SectionHeader>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {smallerProjects.map((project, index) => (
            <SmallProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </section>

      <section id="bench" className="relative z-10 mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <SectionHeader code="SKILL SYSTEM" title="How the skills connect.">
          The point is not just that I know several tools. The important part is that the tools overlap: CAD affects wiring, wiring affects software, software affects testing, and testing decides the next design change.
        </SectionHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {skillNarratives.map((skill, index) => (
            <motion.article
              key={skill.title}
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
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#827466]">working vocabulary</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Tag key={skill}>{skill}</Tag>
            ))}
          </div>
        </div>
      </section>

      <section id="principles" className="relative z-10 mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <SectionHeader code="DESIGN NOTES" title="How project pages should feel.">
          The portfolio should read like an engineering notebook made presentable: specific, honest, and useful, with enough detail that another technical person can understand the work.
        </SectionHeader>

        <div className="grid gap-4 md:grid-cols-3">
          {principles.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
              className="border border-[#d2c8b9] bg-white p-5 shadow-sm"
            >
              <p className="font-mono text-xs text-[#244fd6]">0{index + 1}</p>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-slate-950">{principle.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">{principle.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <ContactSection />
    </>
  );
}

function RecordPage({ setPage }) {
  return (
    <>
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-10 pt-10 md:px-8 md:pb-14 md:pt-14">
        <div className="border border-[#d2c8b9] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#827466]">full record</p>
              <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.045em] text-slate-950 md:text-5xl">
                A larger list of projects, school, competitions, Scouts, languages, and long-term learning.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700 md:text-lg">
                This page is intentionally broader than the main portfolio. It collects the work and experiences that give context to the engineering projects.
              </p>
            </div>
            <Button className="rounded-none bg-slate-950 px-5 py-5 text-sm font-semibold text-white hover:bg-[#244fd6]" onClick={() => setPage("portfolio")}>Back to portfolio</Button>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <div className="grid gap-5">
          {fullRecord.map((section, sectionIndex) => (
            <motion.article
              key={section.category}
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
                {section.items.map((item, itemIndex) => (
                  <div key={item} className="grid gap-3 p-5 md:grid-cols-[70px_1fr]">
                    <p className="font-mono text-xs text-[#244fd6]">{String(itemIndex + 1).padStart(2, "0")}</p>
                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <ContactSection />
    </>
  );
}

function ContactSection() {
  return (
    <section id="contact" className="relative z-10 mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
      <div className="border border-[#d2c8b9] bg-white shadow-[0_16px_45px_rgba(34,28,18,0.08)]">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_300px] md:p-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#827466]">contact</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-4xl">
              Project links and contact information.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
              Spring Early College Academy student and Exxon Teen Engineering + Tech Center participant focused on CAD, fabrication, electronics, robotics, embedded software, and technical documentation.
            </p>
          </div>
          <div className="flex flex-col justify-end gap-3">
            <ContactButton href="mailto:Chrisaheskett@gmail.com" icon="mail" primary>Email</ContactButton>
            <ContactButton href="https://github.com/Chrissyuh" icon="github">View GitHub</ContactButton>
            <ContactButton href="https://check-ins-zeta.vercel.app/" icon="link">See live project</ContactButton>
          </div>
        </div>
        <div className="grid border-t border-[#d2c8b9] bg-[#fbfaf7] font-mono text-[11px] uppercase tracking-[0.16em] text-[#827466] md:grid-cols-3">
          <p className="border-b border-[#d2c8b9] p-4 md:border-b-0 md:border-r">Spring Early College Academy</p>
          <p className="border-b border-[#d2c8b9] p-4 md:border-b-0 md:border-r">Exxon Teen Engineering + Tech Center</p>
          <p className="p-4">© {new Date().getFullYear()} Christopher</p>
        </div>
      </div>
    </section>
  );
}

export default function ChristopherPortfolio() {
  const [page, setPage] = useState("portfolio");

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-slate-950">
      <div className="pointer-events-none fixed inset-0 opacity-[0.34]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,46,32,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,46,32,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <nav className="sticky top-0 z-30 border-b border-[#d2c8b9] bg-[#f5f3ee]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center border border-[#cfc4b4] bg-white font-mono text-xs font-semibold text-[#244fd6] shadow-sm">
              CH
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-[-0.01em] text-slate-950">Christopher</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#827466]">engineering workbench / portfolio</span>
            </span>
          </a>

          <div className="flex flex-wrap items-center gap-2">
            <PageButton active={page === "portfolio"} onClick={() => setPage("portfolio")} icon="box">Portfolio</PageButton>
            <PageButton active={page === "record"} onClick={() => setPage("record")} icon="list">Full record</PageButton>
          </div>

          {page === "portfolio" && (
            <div className="hidden items-center gap-6 font-mono text-xs uppercase tracking-[0.16em] text-slate-600 xl:flex">
              <a className="hover:text-slate-950" href="#projects">Projects</a>
              <a className="hover:text-slate-950" href="#academics">Academics</a>
              <a className="hover:text-slate-950" href="#smaller-projects">Small Builds</a>
              <a className="hover:text-slate-950" href="#bench">Skills</a>
              <a className="hover:text-slate-950" href="#contact">Contact</a>
            </div>
          )}
        </div>
      </nav>

      {page === "portfolio" ? <PortfolioPage setPage={setPage} /> : <RecordPage setPage={setPage} />}
    </main>
  );
}
