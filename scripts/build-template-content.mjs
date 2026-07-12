import fs from "node:fs/promises";
import Papa from "papaparse";
import { normalizePortfolioRows, sheetTabNames } from "../src/content/contentSchema.js";

const templateDirectory = new URL("../docs/google-sheet-template/", import.meta.url);
const outputUrl = new URL("../src/content/portfolioContent.generated.json", import.meta.url);

function parseCsv(tabName, csvText) {
  const parsed = Papa.parse(csvText.replace(/\r\n?/g, "\n"), {
    header: true,
    skipEmptyLines: "greedy",
  });

  if (parsed.errors.length > 0) {
    throw new Error(`${tabName} template CSV parse failed: ${parsed.errors[0].message}`);
  }

  return parsed.data;
}

const tabRows = Object.fromEntries(
  await Promise.all(
    sheetTabNames.map(async (tabName) => {
      const csvText = await fs.readFile(new URL(`${tabName}.csv`, templateDirectory), "utf8");
      return [tabName, parseCsv(tabName, csvText)];
    }),
  ),
);

const content = normalizePortfolioRows(tabRows, { source: "generated-template-snapshot" });
await fs.writeFile(outputUrl, `${JSON.stringify(content, null, 2)}\n`);
console.log(`Wrote ${outputUrl.pathname}`);
