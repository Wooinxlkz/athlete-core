/**
 * WellBuddy Core — Analytics System
 *
 * Streak detection, progression stats, weekly/monthly summaries,
 * personal-best tracking, and trend analysis utilities.
 */

import type {
  Workout,
  PullupRecord,
  WellnessEntry,
  ProgressionStats,
  WorkoutStreak,
} from "../types";

// ─── Streak Calculation ───────────────────────────────────────────────────────

/**
 * Calculate current and longest workout streak from a sorted (asc) date list.
 * A streak is consecutive calendar days with at least one workout.
 */
export function calculateStreak(workouts: Workout[]): WorkoutStreak {
  if (workouts.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Unique sorted dates
  const dates = [
    ...new Set(workouts.map((w) => w.date.slice(0, 10))),
  ].sort();

  let current = 1;
  let longest = 1;
  let runCurrent = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / 86_400_000
    );

    if (diffDays === 1) {
      runCurrent++;
      longest = Math.max(longest, runCurrent);
    } else {
      runCurrent = 1;
    }
  }

  // Check if streak is still active (last workout was today or yesterday)
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const lastDate = dates[dates.length - 1];
  current = lastDate === today || lastDate === yesterday ? runCurrent : 0;

  return { current, longest, lastWorkoutDate: lastDate };
}

// ─── Progression Stats ────────────────────────────────────────────────────────

/**
 * Compute overall progression statistics for a user.
 */
export function calculateProgressionStats(
  workouts: Workout[],
  pullupRecords: PullupRecord[]
): ProgressionStats {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const monthAgo = new Date(now.getTime() - 30 * 86_400_000);

  const personalBest = pullupRecords.reduce(
    (best, r) => Math.max(best, r.maxReps),
    0
  );
  const totalPullups = pullupRecords.reduce((s, r) => s + r.totalReps, 0);
  const totalRepsCount = pullupRecords.length;
  const averageRepsPerSession =
    totalRepsCount > 0 ? Math.round(totalPullups / totalRepsCount) : 0;

  return {
    totalWorkouts: workouts.length,
    totalPullups,
    personalBest,
    averageRepsPerSession,
    weeklyWorkouts: workouts.filter((w) => new Date(w.date) >= weekAgo).length,
    monthlyWorkouts: workouts.filter((w) => new Date(w.date) >= monthAgo)
      .length,
    streak: calculateStreak(workouts),
  };
}

// ─── Personal Best Tracking ───────────────────────────────────────────────────

/** Return the personal-best pull-up record for a user. */
export function getPersonalBest(records: PullupRecord[]): PullupRecord | undefined {
  return records.reduce<PullupRecord | undefined>((best, r) => {
    if (!best || r.maxReps > best.maxReps) return r;
    return best;
  }, undefined);
}

/** Return all sessions where a personal best was achieved. */
export function getPersonalBestHistory(records: PullupRecord[]): PullupRecord[] {
  return records.filter((r) => r.personalBest).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

// ─── Weekly / Monthly Summaries ───────────────────────────────────────────────

export interface WeeklySummary {
  weekStart: string;
  workouts: number;
  totalPullups: number;
  maxReps: number;
  totalDuration: number;   // minutes
  averageMood?: number;
  averageEnergy?: number;
}

/**
 * Group workouts and wellness entries into weekly buckets.
 * Returns weeks in ascending order.
 */
export function buildWeeklySummaries(
  workouts: Workout[],
  pullupRecords: PullupRecord[],
  wellnessEntries: WellnessEntry[],
  weeksBack = 8
): WeeklySummary[] {
  const summaries: WeeklySummary[] = [];

  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekEnd = new Date(Date.now() - i * 7 * 86_400_000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 86_400_000);
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);

    const weekWorkouts = workouts.filter(
      (w) => w.date >= weekStartStr && w.date <= weekEndStr
    );
    const weekPullups = pullupRecords.filter(
      (r) => r.date >= weekStartStr && r.date <= weekEndStr
    );
    const weekWellness = wellnessEntries.filter(
      (e) => e.date >= weekStartStr && e.date <= weekEndStr
    );

    summaries.push({
      weekStart: weekStartStr,
      workouts: weekWorkouts.length,
      totalPullups: weekPullups.reduce((s, r) => s + r.totalReps, 0),
      maxReps: weekPullups.reduce((m, r) => Math.max(m, r.maxReps), 0),
      totalDuration: weekWorkouts.reduce((s, w) => s + (w.duration ?? 0), 0),
      averageMood:
        weekWellness.length > 0
          ? Math.round(
              (weekWellness.reduce((s, e) => s + e.mood, 0) / weekWellness.length) * 10
            ) / 10
          : undefined,
      averageEnergy:
        weekWellness.length > 0
          ? Math.round(
              (weekWellness.reduce((s, e) => s + e.energy, 0) / weekWellness.length) *
                10
            ) / 10
          : undefined,
    });
  }

  return summaries;
}

// ─── Trend Analysis ───────────────────────────────────────────────────────────

export type Trend = "improving" | "declining" | "stable";

/**
 * Determine whether a metric series is trending up, down, or flat.
 * Uses a simple last-half vs first-half average comparison.
 */
export function detectTrend(values: number[], threshold = 0.05): Trend {
  if (values.length < 4) return "stable";
  const half = Math.floor(values.length / 2);
  const first = values.slice(0, half).reduce((s, v) => s + v, 0) / half;
  const second = values.slice(half).reduce((s, v) => s + v, 0) / (values.length - half);
  const delta = (second - first) / (first || 1);
  if (delta > threshold) return "improving";
  if (delta < -threshold) return "declining";
  return "stable";
}

/**
 * Compute a simple 3-period moving average over an array of numbers.
 * Useful for smoothing chart data.
 */
export function movingAverage(values: number[], window = 3): number[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1);
    return Math.round((slice.reduce((s, v) => s + v, 0) / slice.length) * 10) / 10;
  });
}

// ─── Workout Type Distribution ─────────────────────────────────────────────────

export interface WorkoutTypeShare {
  type: string;
  count: number;
  percent: number;
}

/** Break down the share of each workout type in a session list. */
export function workoutTypeDistribution(workouts: Workout[]): WorkoutTypeShare[] {
  const counts: Record<string, number> = {};
  for (const w of workouts) {
    counts[w.type] = (counts[w.type] ?? 0) + 1;
  }
  const total = workouts.length || 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      type,
      count,
      percent: Math.round((count / total) * 100),
    }));
}
