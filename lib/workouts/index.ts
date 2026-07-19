/**
 * Athlete Core — Workout System
 *
 * Workout session validation, duration and calorie utilities,
 * session summaries, workout classification, exercise-set helpers,
 * and rest-day / recovery detection.
 */

import type { Workout, InsertWorkout, WorkoutType } from "../types";

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateWorkout(
  w: Partial<InsertWorkout>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!w.date) errors.push("Date is required.");
  if (!w.type) errors.push("Workout type is required.");
  if (!w.exercises || w.exercises.length === 0)
    errors.push("At least one exercise is required.");
  if (w.duration !== undefined && w.duration < 1)
    errors.push("Duration must be at least 1 minute.");
  if (w.distance !== undefined && w.distance < 0)
    errors.push("Distance cannot be negative.");
  if (w.weight !== undefined && w.weight < 0)
    errors.push("Weight cannot be negative.");
  return { valid: errors.length === 0, errors };
}

// ─── Calorie Estimation ───────────────────────────────────────────────────────

/**
 * Estimate calories burned for a workout session.
 * Uses MET (Metabolic Equivalent of Task) values × body weight × duration.
 *
 * @param workout       Workout data
 * @param bodyWeightKg  User body weight in kilograms
 */
export function estimateCaloriesBurned(
  workout: Workout,
  bodyWeightKg: number
): number {
  const MET_VALUES: Record<WorkoutType, number> = {
    pullups:     8.0,   // calisthenics / vigorous
    strength:    6.0,   // general weight training
    cardio:      7.5,   // moderate-to-vigorous cardio
    flexibility: 2.5,   // stretching / yoga
    mixed:       7.0,   // combined
    general:     5.0,   // light activity
  };

  const met = MET_VALUES[workout.type] ?? 5.0;
  const hours = (workout.duration ?? 30) / 60;
  return Math.round(met * bodyWeightKg * hours);
}

// ─── Session Summary ──────────────────────────────────────────────────────────

export interface WorkoutSummary {
  date: string;
  type: WorkoutType;
  exerciseCount: number;
  duration: number;        // minutes
  estimatedCalories?: number;
  primaryMuscles: string[];
  intensityLabel: string;
}

/**
 * Generate a quick summary card for a workout session.
 */
export function summariseWorkout(
  workout: Workout,
  bodyWeightKg?: number
): WorkoutSummary {
  const estimated =
    bodyWeightKg !== undefined
      ? estimateCaloriesBurned(workout, bodyWeightKg)
      : undefined;

  return {
    date:              workout.date,
    type:              workout.type,
    exerciseCount:     workout.exercises.length,
    duration:          workout.duration ?? 0,
    estimatedCalories: estimated,
    primaryMuscles:    workout.targetMuscleGroups ?? [],
    intensityLabel:    intensityLabel(workout),
  };
}

// ─── Intensity Classification ─────────────────────────────────────────────────

/**
 * Classify a workout's intensity as "Light", "Moderate", or "Hard"
 * based on type, duration, and component-specific fields.
 */
export function intensityLabel(workout: Workout): "Light" | "Moderate" | "Hard" {
  let score = 0;

  if (workout.type === "strength" || workout.type === "pullups") score += 2;
  else if (workout.type === "cardio" || workout.type === "mixed") score += 2;
  else score += 1;

  const duration = workout.duration ?? 0;
  if (duration >= 60) score += 2;
  else if (duration >= 30) score += 1;

  if ((workout.weight ?? 0) > 50) score += 1;
  if ((workout.distance ?? 0) > 5) score += 1;

  if (score >= 5) return "Hard";
  if (score >= 3) return "Moderate";
  return "Light";
}

// ─── Weekly Volume ─────────────────────────────────────────────────────────────

export interface WeeklyVolume {
  weekStart: string;
  sessions: number;
  totalMinutes: number;
  byType: Record<string, number>;
}

/**
 * Aggregate workouts into weekly volume buckets (Mon–Sun ISO weeks).
 */
export function weeklyVolume(workouts: Workout[], weeksBack = 8): WeeklyVolume[] {
  const buckets: WeeklyVolume[] = [];

  for (let i = weeksBack - 1; i >= 0; i--) {
    const end   = new Date(Date.now() - i * 7 * 86_400_000);
    const start = new Date(end.getTime() - 7 * 86_400_000);
    const s = start.toISOString().slice(0, 10);
    const e = end.toISOString().slice(0, 10);

    const week = workouts.filter((w) => w.date >= s && w.date <= e);
    const byType: Record<string, number> = {};
    for (const w of week) {
      byType[w.type] = (byType[w.type] ?? 0) + 1;
    }

    buckets.push({
      weekStart:    s,
      sessions:     week.length,
      totalMinutes: week.reduce((sum, w) => sum + (w.duration ?? 0), 0),
      byType,
    });
  }

  return buckets;
}

// ─── Rest-Day / Recovery Detection ───────────────────────────────────────────

/**
 * Determine whether today should be a rest day based on recent training load.
 *
 * Rules:
 *   ≥3 consecutive training days          → rest recommended
 *   2 hard sessions in the last 3 days   → rest recommended
 *   otherwise                             → train
 */
export function shouldRestToday(workouts: Workout[]): {
  restRecommended: boolean;
  reason?: string;
} {
  const today     = new Date().toISOString().slice(0, 10);
  const threeDays = new Date(Date.now() - 3 * 86_400_000).toISOString().slice(0, 10);

  const recent = workouts
    .filter((w) => w.date >= threeDays && w.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Consecutive training days
  const dateSorted = [...new Set(recent.map((w) => w.date))].sort().reverse();
  let consecutive = 0;
  for (let i = 0; i < dateSorted.length; i++) {
    const expected = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    if (dateSorted[i] === expected) consecutive++;
    else break;
  }

  if (consecutive >= 3) {
    return { restRecommended: true, reason: `${consecutive} consecutive training days — recovery needed.` };
  }

  const hardSessions = recent.filter((w) => intensityLabel(w) === "Hard").length;
  if (hardSessions >= 2) {
    return { restRecommended: true, reason: "2+ hard sessions in 3 days — CNS recovery recommended." };
  }

  return { restRecommended: false };
}

// ─── Muscle Group Coverage ────────────────────────────────────────────────────

export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "core",
  "glutes",
  "quads",
  "hamstrings",
  "calves",
  "lats",
  "traps",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

/**
 * Given a list of recent workouts, return which muscle groups
 * have NOT been targeted in the last N days (default: 7).
 */
export function untargetedMuscles(
  workouts: Workout[],
  days = 7
): MuscleGroup[] {
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const recent = workouts.filter((w) => w.date >= cutoff);

  const targeted = new Set(
    recent.flatMap((w) => (w.targetMuscleGroups ?? []).map((m) => m.toLowerCase()))
  );

  return MUSCLE_GROUPS.filter((m) => !targeted.has(m));
}

// ─── Sorting & Filtering ──────────────────────────────────────────────────────

/** Sort workouts newest-first. */
export function sortByDate(workouts: Workout[]): Workout[] {
  return [...workouts].sort((a, b) => b.date.localeCompare(a.date));
}

/** Filter workouts by type. */
export function filterByType(workouts: Workout[], type: WorkoutType): Workout[] {
  return workouts.filter((w) => w.type === type);
}

/** Return workouts within a date range (inclusive). */
export function filterByDateRange(
  workouts: Workout[],
  from: string,
  to: string
): Workout[] {
  return workouts.filter((w) => w.date >= from && w.date <= to);
}
