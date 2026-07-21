import { formatDayCount, formatStreakYears } from "../content/duolingoStreak.js";

const streakSentencePattern = /Duolingo streak: [\d,]+ days \(~\d+(?:\.\d+)? years\)\. Public language-learning streak\./g;

export function formatDuolingoStreakSentence(streak) {
  return `Duolingo streak: ${formatDayCount(streak)} days (${formatStreakYears(streak)}). Public language-learning streak.`;
}

export function applyLiveStreakToMarkdown(markdown, streak) {
  return String(markdown).replace(streakSentencePattern, formatDuolingoStreakSentence(streak));
}

export function applyLiveStreakToPortfolio(portfolio, streak) {
  const displayDays = formatDayCount(streak);
  const displayYears = formatStreakYears(streak);
  const nextPortfolio = structuredClone(portfolio);

  const learningHighlight = nextPortfolio.learningHighlights?.find((item) => item.id === "duolingo-streak");
  if (learningHighlight) {
    learningHighlight.value = displayDays;
    learningHighlight.note = displayYears;
  }

  for (const section of nextPortfolio.fullRecord ?? []) {
    const recordItem = section.items?.find((item) => item.id === "duolingo-streak");
    if (recordItem) {
      recordItem.detail = `${displayDays} days (${displayYears}). Public language-learning streak.`;
    }
  }

  return nextPortfolio;
}
