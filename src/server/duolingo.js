import {
  DUOLINGO_DEFAULT_USERNAME,
  DUOLINGO_PROFILE_URL,
} from "../content/duolingoStreak.js";

export function cleanDuolingoUsername(value) {
  const username = String(value || DUOLINGO_DEFAULT_USERNAME).trim();
  return /^[A-Za-z0-9_-]{2,32}$/.test(username) ? username : DUOLINGO_DEFAULT_USERNAME;
}

export async function fetchDuolingoStreak(usernameValue) {
  const username = cleanDuolingoUsername(usernameValue);
  const url = `https://www.duolingo.com/2017-06-30/users?username=${encodeURIComponent(username)}`;
  const duolingoResponse = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "ChristopherPortfolio/1.0 (+https://chrisaheskett.vercel.app)",
    },
    signal: AbortSignal.timeout(6000),
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

  return {
    username: user?.username ?? username,
    streak,
    startDate: currentStreak?.startDate ?? null,
    endDate: currentStreak?.endDate ?? null,
    profileHref: DUOLINGO_PROFILE_URL,
    fetchedAt: new Date().toISOString(),
  };
}
