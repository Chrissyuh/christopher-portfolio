import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { buildPortfolioStructuredData } from "../src/content/structuredData.js";
import { buildVisualInventory } from "../src/content/visualInventory.js";

const generatedUrl = new URL("../src/content/portfolioContent.generated.json", import.meta.url);
const publicJsonUrl = new URL("../public/portfolio.json", import.meta.url);
const llmsUrl = new URL("../public/llms.txt", import.meta.url);
const llmsFullUrl = new URL("../public/llms-full.txt", import.meta.url);
const appUrl = new URL("../src/App.jsx", import.meta.url);
const appStylesUrl = new URL("../src/index.css", import.meta.url);
const indexHtmlUrl = new URL("../index.html", import.meta.url);

const [content, publicContent, llms, llmsFull, appSource, appStyles, indexHtml] = await Promise.all([
  fs.readFile(generatedUrl, "utf8").then(JSON.parse),
  fs.readFile(publicJsonUrl, "utf8").then(JSON.parse),
  fs.readFile(llmsUrl, "utf8"),
  fs.readFile(llmsFullUrl, "utf8"),
  fs.readFile(appUrl, "utf8"),
  fs.readFile(appStylesUrl, "utf8"),
  fs.readFile(indexHtmlUrl, "utf8"),
]);

const claims = new Set();
const add = (...values) => values.flat().filter((value) => typeof value === "string" && value.trim()).forEach((value) => claims.add(value.trim()));
const addStats = (items) => items.forEach((item) => add(item.label, item.value, item.note));

add(content.meta.heroTitle, content.meta.heroLead, content.meta.heroIntro);
add(
  content.meta.academicSchoolName,
  content.meta.academicSchoolContext,
  content.meta.academicSchoolDistrictRank,
  content.meta.academicSchoolRankSummary,
);

content.projects.forEach((project) => add(
  project.title,
  project.label,
  project.status,
  project.teamContext,
  project.summary,
  project.role,
  project.state,
  project.proofAvailable,
  project.proofNeeded,
  project.whatChanged,
  project.whatLearned,
));
addStats(content.academics);
addStats(content.academicDetails);
content.programCredentials.forEach((credential) => add(
  credential.program,
  credential.credential,
  credential.issuer,
  credential.date,
  credential.summary,
  credential.awardTitle,
  credential.awardDate,
  credential.awardDistinction,
  credential.awardSummary,
  credential.awardQuote,
  credential.awardQuoteAttribution,
));
addStats(content.learningHighlights);
content.smallProjects.forEach((project) => add(project.title, project.type, project.description));
content.microProjects.forEach((project) => add(project.title, project.type, project.description));
content.skills.forEach((skill) => add(skill.name));
content.fullRecord.forEach((section) => {
  section.items.forEach((item) => add(item.title, item.date, item.detail, item.achievements));
});

const publicSerialized = JSON.stringify(publicContent);
const markdownCombined = `${llms}\n${llmsFull}`;
const structuredSerialized = JSON.stringify(buildPortfolioStructuredData(content));
const visualInventory = buildVisualInventory(content);

for (const claim of claims) {
  assert.ok(publicSerialized.includes(claim), `portfolio.json is missing material claim: ${claim}`);
  assert.ok(markdownCombined.includes(claim), `LLM Markdown is missing material claim: ${claim}`);
  assert.ok(structuredSerialized.includes(claim), `structured data is missing material claim: ${claim}`);
}

assert.deepEqual(publicContent.visualInventory, visualInventory, "portfolio.json visual inventory drifted from the source content.");
for (const visual of visualInventory) {
  assert.ok(visual.description, `Visual ${visual.id} is missing a text description.`);
  assert.ok(llms.includes(visual.description), `llms.txt is missing visual description for ${visual.id}: ${visual.description}`);
  assert.ok(llmsFull.includes(visual.description), `llms-full.txt is missing visual description for ${visual.id}: ${visual.description}`);
  if (visual.caption) {
    assert.ok(llms.includes(visual.caption), `llms.txt is missing visual caption for ${visual.id}: ${visual.caption}`);
    assert.ok(llmsFull.includes(visual.caption), `llms-full.txt is missing visual caption for ${visual.id}: ${visual.caption}`);
  }
}

const expectedFeaturedProjects = [
  "Garden Party Pinball",
  "VividGrasp AI-Vision Robotics Arm",
  "Smart Self-Watering Pot / Smart Planter PCB",
  "Subpix",
];
assert.deepEqual(content.projects.map((project) => project.title), expectedFeaturedProjects);
assert.equal(
  content.meta.academicSchoolContext,
  "Spring ISD dual-credit early-college program in partnership with Lone Star College.",
  "The SECA card must explain the dual-credit partnership.",
);
assert.equal(content.academics.find((item) => item.id === "course-load")?.value, "Academic Results");
assert.ok(!publicSerialized.includes("AP + dual credit"), "The coursework card must not present SECA's standard AP and dual-credit model as an individual distinction.");

const expectedAcademicDetails = [
  ["ap-human-geography", "AP exams", "AP Human Geography", "5", "2026 exam score"],
  ["ap-spanish-language", "AP exams", "AP Spanish Language and Culture", "4", "2026 exam score"],
  ["college-algebra", "College credit", "College Algebra", "95", "Dual credit"],
  ["educ-1300", "College credit", "EDUC 1300", "100", "Dual credit"],
  ["geometry-a-cbe", "Credit by Examination", "Geometry A", "91", "Credit by Examination"],
  ["geometry-b-cbe", "Credit by Examination", "Geometry B", "97", "Credit by Examination"],
  ["math-acceleration", "Progression", "Math progression", "Current: sophomore student taking college trigonometry and precalculus through Lone Star College", ""],
];
assert.deepEqual(
  content.academicDetails.map((item) => [item.id, item.group, item.label, item.value, item.note]),
  expectedAcademicDetails,
  "Academic coursework and scores drifted from the verified visible record.",
);
assert.ok(!content.academicDetails.some((item) => item.id === "weighted-gpa" || item.id === "class-rank"), "Academic details must not duplicate the GPA and rank cards.");
assert.equal(content.meta.contactPhoneLabel, "901-356-1000", "The primary phone contact drifted.");
assert.equal(content.meta.contactPhoneHref, "tel:+19013561000", "The primary phone link drifted.");
assert.ok(llms.includes("[901-356-1000](tel:+19013561000): Primary contact for Christopher."), "llms.txt is missing the primary phone contact.");
assert.ok(!content.meta.contactProjectHref, "Subpix must remain a project rather than a contact action.");
assert.ok(appSource.includes("prepareNavigationScrollPath"), "Top navigation must prepare lazy content before scrolling.");
assert.ok(appSource.includes('image.loading = "eager"'), "Navigation preparation must eagerly start images along the scroll path.");
assert.ok(appSource.includes('data-scroll-reveal="true"'), "Viewport-revealed cards must be identifiable during navigation preparation.");
assert.ok(appStyles.includes(".navigation-scroll-ready"), "Prepared navigation cards must render before the smooth scroll begins.");
assert.ok(indexHtml.includes('document.documentElement.classList.add("js")'), "The document must identify JavaScript-capable loads before first paint.");
assert.ok(indexHtml.includes('id="portfolio-boot-shell"'), "The document must provide a critical styled boot shell.");
assert.ok(indexHtml.includes(".js #portfolio-static-fallback { display: none; }"), "JavaScript loads must not paint the raw static fallback.");

const requiredHumanCollections = [
  "meta",
  "projects",
  "academics",
  "academicDetails",
  "programCredentials",
  "fullRecord",
  "smallProjects",
  "microProjects",
  "skills",
  "learningHighlights",
];

for (const collection of requiredHumanCollections) {
  assert.ok(publicContent.humanSurfaces?.[collection], `portfolio.json is missing a human surface for ${collection}`);
  assert.ok(appSource.includes(`data-content-collection="${collection}"`) || appSource.includes(`collection="${collection}"`), `App.jsx is missing a visible renderer marker for ${collection}`);
}

const cswaCredential = content.programCredentials.find((credential) => credential.id === "cswa");
assert.deepEqual(
  [cswaCredential?.program, cswaCredential?.issuer, cswaCredential?.date, cswaCredential?.href],
  [
    "Certified SOLIDWORKS Design Associate (CSWA)",
    "Dassault Systèmes",
    "July 15, 2026",
    "https://www.credly.com/badges/39c1cd0e-5fd3-4e91-91b7-b53ae7b7c83f/public_url",
  ],
  "The verified CSWA credential record drifted.",
);

for (const excludedClaim of ["BetterQuizzes", "Murder Drones Unreal Engine Prototype"]) {
  assert.ok(!publicSerialized.includes(excludedClaim), `Unsupported claim was published: ${excludedClaim}`);
}

console.log(`Content parity passed for ${claims.size} material claims across visible markers, JSON, Markdown, and structured data.`);
