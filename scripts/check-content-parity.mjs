import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { buildPortfolioStructuredData } from "../src/content/structuredData.js";
import { buildStaticSummary } from "../src/content/staticSummary.js";
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
  project.contribution,
  project.state,
  project.relatedProgramNote,
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
content.moreWork.forEach((project) => add(project.title, project.type, project.status, project.context, project.description));
content.skills.forEach((skill) => add(skill.name));
content.fullRecord.forEach((section) => {
  section.items.forEach((item) => add(item.title, item.date, item.detail, item.achievements));
});

const publicSerialized = JSON.stringify(publicContent);
const markdownCombined = `${llms}\n${llmsFull}`;
const structuredSerialized = JSON.stringify(buildPortfolioStructuredData(content));
const staticSummaryText = buildStaticSummary(content)
  .replace(/<[^>]*>/g, " ")
  .replaceAll("&amp;", "&")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replace(/\s+/g, " ");
const visualInventory = buildVisualInventory(content);

for (const claim of claims) {
  assert.ok(publicSerialized.includes(claim), `portfolio.json is missing material claim: ${claim}`);
  assert.ok(markdownCombined.includes(claim), `LLM Markdown is missing material claim: ${claim}`);
  assert.ok(structuredSerialized.includes(claim), `structured data is missing material claim: ${claim}`);
  assert.ok(staticSummaryText.includes(claim), `static HTML summary is missing material claim: ${claim}`);
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
const smartPlanter = content.projects.find((project) => project.id === "smart-self-watering-pot");
assert.equal(smartPlanter?.logoCredentialId, "tetc", "The Smart Planter TETC block must link to the TETC credential.");
assert.equal(smartPlanter?.relatedProgramNote, "Coach Taylor challenged me to start this project during TETC.", "The Smart Planter must explain its TETC connection directly.");

assert.ok(content.projects.every((project) => !("role" in project)), "Featured project records must not retain the old role field.");
assert.deepEqual(
  content.projects.filter((project) => project.contribution).map((project) => project.id),
  ["vividgrasp-ai-vision-robotics-arm"],
  "Only the collaborative VividGrasp project should publish a contribution field.",
);
assert.deepEqual(
  content.moreWork.map((project) => [project.id, project.presentationSize]),
  [
    ["agentdeck", "standard"],
    ["check-ins", "standard"],
    ["vex-robotics-builds", "standard"],
    ["midi-practice-tool", "compact"],
    ["desmos-3d-solar-system", "compact"],
    ["tinygpt-experiments", "compact"],
  ],
  "More work ordering or presentation sizes drifted.",
);
assert.ok(!content.moreWork.some((project) => (project.media ?? []).some((media) => !media.src)), "More work must not publish empty media records.");
assert.ok(!publicSerialized.includes("TETC 3D Printing Presentation"), "The TETC presentation must not appear in curated public content.");
assert.ok(!staticSummaryText.includes("Ongoing learning"), "The static HTML summary must not restore the removed standalone learning section.");
assert.ok(!staticSummaryText.includes("More projects") && !staticSummaryText.includes("Small builds"), "The static HTML summary must use the unified More work section.");

const requiredHumanCollections = [
  "meta",
  "projects",
  "academics",
  "academicDetails",
  "programCredentials",
  "fullRecord",
  "moreWork",
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

for (const excludedClaim of [
  "BetterQuizzes",
  "Murder Drones Unreal Engine Prototype",
  "VEX LiDAR peripheral",
  "Blind Orbit",
  "TinyTime",
  "Axis arm",
  "Wire recorder",
  "Study Arcade",
  "Paired-game PCB",
  "CarBoard",
  "Resume Critic",
  "Diagnostic breadboard redesign",
  "SpringHack",
  "TE+TH hackathon",
]) {
  assert.ok(!publicSerialized.includes(excludedClaim), `Unsupported claim was published: ${excludedClaim}`);
}

console.log(`Content parity passed for ${claims.size} material claims across visible markers, JSON, Markdown, and structured data.`);
