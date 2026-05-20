import { useEffect, useState } from "react";
import Papa from "papaparse";
import generatedContent from "./portfolioContent.generated.json";
import { normalizePortfolioRows } from "./contentSchema.js";
import { googleSheetTabs } from "./googleSheetConfig.js";

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

export async function fetchLivePortfolioContent() {
  const configuredTabs = googleSheetTabs.filter((tab) => tab.url.trim());

  if (configuredTabs.length === 0) {
    return null;
  }

  if (configuredTabs.length !== googleSheetTabs.length) {
    const missingNames = googleSheetTabs.filter((tab) => !tab.url.trim()).map((tab) => tab.name);
    throw new Error(`Google Sheet config is missing URLs for: ${missingNames.join(", ")}`);
  }

  const tabEntries = await Promise.all(
    googleSheetTabs.map(async (tab) => {
      const response = await fetch(tab.url);

      if (!response.ok) {
        throw new Error(`${tab.name} CSV fetch failed with HTTP ${response.status}`);
      }

      return [tab.name, parseCsv(tab.name, await response.text())];
    }),
  );

  return normalizePortfolioRows(Object.fromEntries(tabEntries), {
    source: "live-google-sheet",
  });
}

export function usePortfolioContent() {
  const [content, setContent] = useState(generatedContent);

  useEffect(() => {
    let active = true;

    fetchLivePortfolioContent()
      .then((liveContent) => {
        if (active && liveContent) {
          setContent(liveContent);
        }
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.warn("Portfolio live sheet load failed; using generated snapshot.", error);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return content;
}
