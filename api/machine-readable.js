import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fetchDuolingoStreak } from "../src/server/duolingo.js";
import {
  applyLiveStreakToMarkdown,
  applyLiveStreakToPortfolio,
} from "../src/server/machineReadable.js";

const formats = {
  json: { file: "portfolio.json", contentType: "application/json; charset=utf-8" },
  llms: { file: "llms.txt", contentType: "text/markdown; charset=utf-8" },
  "llms-full": { file: "llms-full.txt", contentType: "text/markdown; charset=utf-8" },
};

function requestFormat(request) {
  const requestUrl = new URL(request.url || "/", "https://chrisaheskett.vercel.app");
  return requestUrl.searchParams.get("format") || "json";
}

async function readBaseFile(file) {
  const filePath = path.join(process.cwd(), "public", "machine-readable-base", file);
  return fs.readFile(filePath, "utf8");
}

export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Cache-Control", "no-store");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const format = requestFormat(request);
  const formatConfig = formats[format];
  if (!formatConfig) {
    response.status(400).json({ error: "Unknown machine-readable format." });
    return;
  }

  try {
    const base = await readBaseFile(formatConfig.file);
    let body = base;
    let streakSource = "snapshot";

    try {
      const liveStreak = await fetchDuolingoStreak("ChristopherHmm");
      body = format === "json"
        ? `${JSON.stringify(applyLiveStreakToPortfolio(JSON.parse(base), liveStreak.streak), null, 2)}\n`
        : applyLiveStreakToMarkdown(base, liveStreak.streak);
      streakSource = "live";
      response.setHeader("X-Duolingo-Streak-Fetched-At", liveStreak.fetchedAt);
    } catch {
      // Keep the deployment snapshot usable if Duolingo is temporarily unavailable.
    }

    response.setHeader("Content-Type", formatConfig.contentType);
    response.setHeader("X-Duolingo-Streak-Source", streakSource);
    response.status(200).send(request.method === "HEAD" ? "" : body);
  } catch (error) {
    response.status(500).json({
      error: "Unable to load the machine-readable portfolio.",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
