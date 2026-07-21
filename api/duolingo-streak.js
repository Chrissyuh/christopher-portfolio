import { fetchDuolingoStreak } from "../src/server/duolingo.js";

function usernameFromRequest(request) {
  const requestUrl = new URL(request.url || "/", "https://chrisaheskett.vercel.app");
  return requestUrl.searchParams.get("username");
}

export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Cache-Control", "no-store");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const username = usernameFromRequest(request);

  try {
    response.status(200).json(await fetchDuolingoStreak(username));
  } catch (error) {
    response.status(502).json({
      error: "Unable to fetch Duolingo streak.",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
