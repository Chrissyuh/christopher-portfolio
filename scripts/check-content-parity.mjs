import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { buildPortfolioStructuredData } from "../src/content/structuredData.js";

const generatedUrl = new URL("../src/content/portfolioContent.generated.json", import.meta.url);
const publicJsonUrl = new URL("../public/portfolio.json", import.meta.url);
const llmsUrl = new URL("../public/llms.txt", import.meta.url);
const llmsFullUrl = new URL("../public/llms-full.txt", import.meta.url);
const appUrl = new URL("../src/App.jsx", import.meta.url);

const [content, publicContent, llms, llmsFull, appSource] = await Promise.all([
  fs.readFile(generatedUrl, "utf8").then(JSON.parse),
  fs.readFile(publicJsonUrl, "utf8").then(JSON.parse),
  fs.readFile(llmsUrl, "utf8"),
  fs.readFile(llmsFullUrl, "utf8"),
  fs.readFile(appUrl, "utf8"),
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

for (const claim of claims) {
  assert.ok(publicSerialized.includes(claim), `portfolio.json is missing material claim: ${claim}`);
  assert.ok(markdownCombined.includes(claim), `LLM Markdown is missing material claim: ${claim}`);
  assert.ok(structuredSerialized.includes(claim), `structured data is missing material claim: ${claim}`);
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
assert.equal(content.academics.find((item) => item.id === "course-load")?.value, "Academic results");
assert.ok(!publicSerialized.includes("AP + dual credit"), "The coursework card must not present SECA's standard AP and dual-credit model as an individual distinction.");

const expectedAcademicDetails = [
  ["ap-human-geography", "AP exams", "AP Human Geography", "5", "2026 exam score"],
  ["ap-spanish-language", "AP exams", "AP Spanish Language and Culture", "4", "2026 exam score"],
  ["college-algebra", "College credit", "College Algebra", "95", "Dual credit"],
  ["educ-1300", "College credit", "EDUC 1300", "100", "Dual credit"],
  ["geometry-a-cbe", "Credit by Examination", "Geometry A", "91", "Credit by Examination"],
  ["geometry-b-cbe", "Credit by Examination", "Geometry B", "97", "Credit by Examination"],
  ["math-acceleration", "Progression", "Math progression", "Only student in the SECA class of 2029 taking college trigonometry and precalculus in sophomore year", ""],
];
assert.deepEqual(
  content.academicDetails.map((item) => [item.id, item.group, item.label, item.value, item.note]),
  expectedAcademicDetails,
  "Academic coursework and scores drifted from the verified visible record.",
);
assert.ok(!content.academicDetails.some((item) => item.id === "weighted-gpa" || item.id === "class-rank"), "Academic details must not duplicate the GPA and rank cards.");

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

for (const excludedClaim of ["BetterQuizzes", "CSWA", "Murder Drones Unreal Engine Prototype"]) {
  assert.ok(!publicSerialized.includes(excludedClaim), `Unsupported claim was published: ${excludedClaim}`);
}

console.log(`Content parity passed for ${claims.size} material claims across visible markers, JSON, Markdown, and structured data.`);
