/**
 * WellBuddy Core — Journal System
 *
 * Entry validation, tag management, search utilities,
 * mood-correlation helpers, and XP integration hooks.
 */

import type { JournalEntry, InsertJournalEntry } from "../types";

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateJournalEntry(
  entry: Partial<InsertJournalEntry>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!entry.title?.trim()) errors.push("Title is required.");
  if (!entry.content?.trim()) errors.push("Content is required.");
  if (entry.mood !== undefined && (entry.mood < 1 || entry.mood > 10))
    errors.push("Mood must be between 1 and 10.");
  return { valid: errors.length === 0, errors };
}

// ─── Tag Utilities ────────────────────────────────────────────────────────────

/** Extract all unique tags across a list of entries, sorted alphabetically. */
export function allTags(entries: JournalEntry[]): string[] {
  const set = new Set<string>();
  for (const e of entries) {
    (e.tags ?? []).forEach((t) => set.add(t.toLowerCase().trim()));
  }
  return [...set].sort();
}

/** Filter entries that contain every tag in the provided list. */
export function filterByTags(entries: JournalEntry[], tags: string[]): JournalEntry[] {
  if (tags.length === 0) return entries;
  const lower = tags.map((t) => t.toLowerCase());
  return entries.filter((e) =>
    lower.every((tag) => (e.tags ?? []).map((t) => t.toLowerCase()).includes(tag))
  );
}

// ─── Search ───────────────────────────────────────────────────────────────────

/**
 * Full-text search over title and content (case-insensitive).
 * Returns entries that match ALL words in the query.
 */
export function searchEntries(entries: JournalEntry[], query: string): JournalEntry[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return entries;
  return entries.filter((e) => {
    const text = `${e.title} ${e.content}`.toLowerCase();
    return words.every((w) => text.includes(w));
  });
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

/** Sort entries newest-first. */
export function sortByDate(entries: JournalEntry[]): JournalEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/** Sort entries by mood descending (highest mood first). */
export function sortByMood(entries: JournalEntry[]): JournalEntry[] {
  return [...entries].sort((a, b) => (b.mood ?? 5) - (a.mood ?? 5));
}

// ─── Mood Correlation ─────────────────────────────────────────────────────────

export interface MoodTrend {
  date: string;
  mood: number;
  movingAvg: number;  // 7-day moving average
}

/**
 * Build a mood trend series from sorted journal entries.
 * Includes 7-day moving average for chart smoothing.
 */
export function buildMoodTrend(entries: JournalEntry[]): MoodTrend[] {
  const sorted = [...entries]
    .filter((e) => e.mood !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return sorted.map((entry, idx) => {
    const window = sorted.slice(Math.max(0, idx - 6), idx + 1);
    const avg =
      Math.round(
        (window.reduce((s, e) => s + (e.mood ?? 5), 0) / window.length) * 10
      ) / 10;
    return { date: entry.date, mood: entry.mood!, movingAvg: avg };
  });
}

// ─── Word Count / Reading Time ─────────────────────────────────────────────────

/** Count words in a string. */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Estimate reading time in minutes (200 words/min average). */
export function readingTimeMinutes(text: string): number {
  return Math.max(1, Math.ceil(wordCount(text) / 200));
}

// ─── Streaks ──────────────────────────────────────────────────────────────────

/** Returns the current consecutive-day journaling streak. */
export function journalStreak(entries: JournalEntry[]): number {
  const dates = [...new Set(entries.map((e) => e.date.slice(0, 10)))].sort().reverse();
  if (dates.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86_400_000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}
