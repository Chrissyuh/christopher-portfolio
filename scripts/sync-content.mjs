import fs from "node:fs/promises";
import Papa from "papaparse";
import { googleSheetTabs } from "../src/content/googleSheetConfig.js";
import { normalizePortfolioRows } from "../src/content/contentSchema.js";

function parseCsv(tabName, csvText) {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: "greedy",
  });

  if (result.errors.length > 0) {
    const firstError = result.errors[0];
    throw new Error(`${tabName} CSV parse failed: ${firstError.message}`);
  }

  return result.data;
}

async function fetchTab(tab) {
  const response = await fetch(tab.url);

  if (!response.ok) {
    throw new Error(`${tab.name} CSV fetch failed with HTTP ${response.status}`);
  }

  return [tab.name, parseCsv(tab.name, await response.text())];
}

const missingTabs = googleSheetTabs.filter((tab) => !tab.url.trim()).map((tab) => tab.name);

if (missingTabs.length > 0) {
  console.error(`Add published Google Sheet CSV URLs before syncing. Missing: ${missingTabs.join(", ")}`);
  process.exit(1);
}

const tabRows = Object.fromEntries(await Promise.all(googleSheetTabs.map(fetchTab)));
const content = normalizePortfolioRows(tabRows, { source: "generated-google-sheet-snapshot" });
const outputPath = new URL("../src/content/portfolioContent.generated.json", import.meta.url);

await fs.writeFile(outputPath, `${JSON.stringify(content, null, 2)}\n`);
console.log(`Wrote ${outputPath.pathname}`);
