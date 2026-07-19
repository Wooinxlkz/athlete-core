# Journal System

A structured journaling engine with search, tag management, mood tracking, and consecutive-day streaks.

## Entry Structure

```typescript
interface JournalEntry {
  id:        number;
  userId:    number;
  date:      string;     // YYYY-MM-DD
  title:     string;
  content:   string;
  mood?:     number;     // 1–10
  tags?:     string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## Validation

```typescript
const { valid, errors } = journal.validateJournalEntry({
  title: "Morning reflection",
  content: "Felt strong today...",
  mood: 8,
});
```

Rules: title required, content required, mood 1–10 if provided.

---

## Search & Filtering

```typescript
// Full-text AND search (title + content)
journal.searchEntries(entries, "recovery sleep")
// → entries containing both "recovery" and "sleep"

// Filter by tags (AND — entry must have ALL tags)
journal.filterByTags(entries, ["fitness", "goal"])

// All unique tags across all entries
journal.allTags(entries)   // → ["fitness", "goal", "sleep", ...]
```

---

## Mood Trend

```typescript
const trend = journal.buildMoodTrend(entries);
// [{ date: "2026-07-01", mood: 7, movingAvg: 6.8 }, ...]
```

The 7-day moving average smooths out single-day outliers for charting.

---

## Streaks

```typescript
journal.journalStreak(entries)  // → number (consecutive days)
```

Streak resets if no entry was made today or yesterday.

---

## Content Stats

```typescript
journal.wordCount("Hello world")     // → 2
journal.readingTimeMinutes(text)     // → estimated minutes at 200 wpm
```

---

## API

```typescript
import { journal } from "./lib";

journal.validateJournalEntry(entry)      // → { valid, errors }
journal.allTags(entries)                 // → string[]
journal.filterByTags(entries, tags)      // → JournalEntry[]
journal.searchEntries(entries, query)    // → JournalEntry[]
journal.sortByDate(entries)             // → JournalEntry[] (newest first)
journal.sortByMood(entries)             // → JournalEntry[] (highest mood first)
journal.buildMoodTrend(entries)         // → MoodTrend[]
journal.wordCount(text)                 // → number
journal.readingTimeMinutes(text)        // → number
journal.journalStreak(entries)          // → number
```
