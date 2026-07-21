export const DUOLINGO_PROFILE_URL = "https://invite.duolingo.com/profile-share/ChristopherHmm?via=share_profile_qr";
export const DUOLINGO_DEFAULT_USERNAME = "ChristopherHmm";

const STREAK_YEAR_DAYS = 365.25;
const numberFormatter = new Intl.NumberFormat("en-US");

export function parseDayCount(value) {
  const match = String(value ?? "").match(/\d[\d,]*/);
  if (!match) return null;
  const days = Number(match[0].replaceAll(",", ""));
  return Number.isFinite(days) && days > 0 ? days : null;
}

export function formatDayCount(days) {
  return Number.isFinite(days) ? numberFormatter.format(days) : "";
}

export function formatStreakYears(days) {
  return Number.isFinite(days) ? `~${(days / STREAK_YEAR_DAYS).toFixed(2)} years` : "";
}
