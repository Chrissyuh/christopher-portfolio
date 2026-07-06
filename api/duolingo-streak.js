const defaultUsername = "ChristopherHmm";
const profileHref = "https://invite.duolingo.com/profile-share/ChristopherHmm?via=share_profile_qr";

function cleanUsername(value) {
  const username = String(value || defaultUsername).trim();
  return /^[A-Za-z0-9_-]{2,32}$/.test(username) ? username : defaultUsername;
}

function usernameFromRequest(request) {
  const requestUrl = new URL(request.url || "/", "https://chrisaheskett.vercel.app");
  return cleanUsername(requestUrl.searchParams.get("username"));
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
  const url = `https://www.duolingo.com/2017-06-30/users?username=${encodeURIComponent(username)}`;

  try {
    const duolingoResponse = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ChristopherPortfolio/1.0 (+https://chrisaheskett.vercel.app)",
      },
    });

    if (!duolingoResponse.ok) {
      throw new Error(`Duolingo returned HTTP ${duolingoResponse.status}`);
    }

    const payload = await duolingoResponse.json();
    const user =
      payload?.users?.find((candidate) => candidate?.username?.toLowerCase() === username.toLowerCase()) ??
      payload?.users?.[0];
    const currentStreak = user?.streakData?.currentStreak;
    const streak = Number(currentStreak?.length ?? user?.streak);

    if (!Number.isFinite(streak) || streak <= 0) {
      throw new Error("Duolingo response did not include a valid streak.");
    }

    response.status(200).json({
      username: user?.username ?? username,
      streak,
      startDate: currentStreak?.startDate ?? null,
      endDate: currentStreak?.endDate ?? null,
      profileHref,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    response.status(502).json({
      error: "Unable to fetch Duolingo streak.",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
