/**
 * WellBuddy Core — Wellness System
 *
 * Energy-level scoring, mood tracking, composite wellness score,
 * breathing exercise configurations, and check-in utilities.
 */

import type { WellnessEntry, Workout, PullupRecord, WellnessStats } from "../types";

// ─── Composite Wellness Score ─────────────────────────────────────────────────

/**
 * Compute a 1–10 composite wellness score from a check-in entry.
 * Weights: mental metrics 40%, mood 20%, energy 20%, stress (inverted) 20%.
 */
export function calculateWellnessScore(entry: WellnessEntry): number {
  const mentalAvg =
    (entry.relationships +
      entry.stressManagement +
      entry.selfConfidence +
      entry.emotionalBalance +
      entry.mentalResilience +
      entry.focusClarity) /
    6;

  const stressInverted = 11 - entry.stress; // 10 = no stress, 1 = max stress
  const composite =
    mentalAvg * 0.4 +
    entry.mood * 0.2 +
    entry.energy * 0.2 +
    stressInverted * 0.2;

  return Math.round(Math.max(1, Math.min(10, composite)) * 10) / 10;
}

// ─── Energy Level ─────────────────────────────────────────────────────────────

/**
 * Compute a 1–10 energy level by combining sleep, wellness metrics,
 * recent workout activity, and pull-up performance.
 */
export function calculateEnergyLevel(
  workouts: Workout[],
  pullupRecords: PullupRecord[],
  entry: WellnessEntry
): number {
  let score = 5; // neutral baseline

  // Sleep quality (25% weight)
  if (entry.sleepHours !== undefined) {
    if (entry.sleepHours >= 8) score += 1.5;
    else if (entry.sleepHours >= 7) score += 1;
    else if (entry.sleepHours >= 6) score += 0.5;
    else if (entry.sleepHours < 5) score -= 2;
    else score -= 1;
  }

  // Mental wellness metrics (30% weight)
  const mentalAvg =
    (entry.relationships +
      entry.stressManagement +
      entry.selfConfidence +
      entry.emotionalBalance +
      entry.mentalResilience +
      entry.focusClarity) /
    6;
  score += ((mentalAvg - 5.5) / 4.5) * 1.5;

  // Recent workout impact (25% weight — last 3 days)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const recentWorkouts = workouts.filter((w) => new Date(w.date) >= threeDaysAgo);
  score += workoutEnergyImpact(recentWorkouts);

  // Recent pull-up impact (20% weight)
  const recentPullups = pullupRecords.filter((p) => new Date(p.date) >= threeDaysAgo);
  score += pullupEnergyImpact(recentPullups);

  return Math.round(Math.max(1, Math.min(10, score)) * 10) / 10;
}

function workoutEnergyImpact(recent: Workout[]): number {
  if (recent.length === 0) return -0.5;
  let impact = 0;

  if (recent.length >= 3) impact += 1;
  else if (recent.length === 2) impact += 0.5;
  else impact += 0.2;

  const highIntensity = recent.filter(
    (w) =>
      (w.type === "cardio" && (w.duration ?? 0) > 60) ||
      (w.type === "strength" && (w.weight ?? 0) > 70)
  ).length;
  if (highIntensity > 2) impact -= 0.8;

  return Math.max(-1.5, Math.min(1.5, impact));
}

function pullupEnergyImpact(recent: PullupRecord[]): number {
  if (recent.length === 0) return 0;
  let impact = 0.3 * Math.min(recent.length, 3);
  const hasPB = recent.some((p) => p.personalBest);
  if (hasPB) impact += 0.5;
  return Math.max(-0.5, Math.min(1, impact));
}

// ─── Aggregate Stats ──────────────────────────────────────────────────────────

/**
 * Compute aggregate wellness stats from a list of entries.
 * Useful for analytics dashboards.
 */
export function calculateWellnessStats(
  entries: WellnessEntry[],
  workouts: Workout[],
  pullupRecords: PullupRecord[]
): WellnessStats {
  if (entries.length === 0) {
    return {
      averageMood: 0,
      averageEnergy: 0,
      averageStress: 0,
      averageSleepHours: 0,
      wellnessScore: 0,
      energyLevel: 0,
    };
  }

  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;

  const latest = entries[entries.length - 1];

  return {
    averageMood: Math.round(avg(entries.map((e) => e.mood)) * 10) / 10,
    averageEnergy: Math.round(avg(entries.map((e) => e.energy)) * 10) / 10,
    averageStress: Math.round(avg(entries.map((e) => e.stress)) * 10) / 10,
    averageSleepHours:
      Math.round(avg(entries.map((e) => e.sleepHours ?? 0)) * 10) / 10,
    wellnessScore: calculateWellnessScore(latest),
    energyLevel: calculateEnergyLevel(workouts, pullupRecords, latest),
  };
}

// ─── Breathing Exercise Configurations ───────────────────────────────────────

export type BreathingTechnique =
  | "box_breathing"
  | "4_7_8"
  | "wim_hof"
  | "resonance"
  | "alternate_nostril";

export interface BreathingPhase {
  name: string;
  durationSeconds: number;
  instruction: string;
}

export interface BreathingExercise {
  id: BreathingTechnique;
  name: string;
  description: string;
  phases: BreathingPhase[];
  rounds: number;
  xpReward: number;
}

export const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: "box_breathing",
    name: "Box Breathing",
    description: "Equal inhale, hold, exhale, hold. Great for stress relief and focus.",
    phases: [
      { name: "Inhale", durationSeconds: 4, instruction: "Breathe in slowly" },
      { name: "Hold",   durationSeconds: 4, instruction: "Hold your breath" },
      { name: "Exhale", durationSeconds: 4, instruction: "Breathe out slowly" },
      { name: "Hold",   durationSeconds: 4, instruction: "Hold empty" },
    ],
    rounds: 4,
    xpReward: 5,
  },
  {
    id: "4_7_8",
    name: "4-7-8 Breathing",
    description: "Relaxing breath that reduces anxiety and promotes sleep.",
    phases: [
      { name: "Inhale", durationSeconds: 4,  instruction: "Inhale through nose" },
      { name: "Hold",   durationSeconds: 7,  instruction: "Hold breath" },
      { name: "Exhale", durationSeconds: 8,  instruction: "Exhale through mouth" },
    ],
    rounds: 4,
    xpReward: 5,
  },
  {
    id: "wim_hof",
    name: "Wim Hof Method",
    description: "Powerful breathing for energy, mental clarity, and cold tolerance.",
    phases: [
      { name: "Power Breaths", durationSeconds: 30, instruction: "30 deep breaths, rhythm: 2s in, 2s out" },
      { name: "Hold",          durationSeconds: 60, instruction: "Hold after exhale" },
      { name: "Recovery",      durationSeconds: 15, instruction: "Deep inhale, hold 15s" },
    ],
    rounds: 3,
    xpReward: 10,
  },
  {
    id: "resonance",
    name: "Resonance Breathing",
    description: "Synchronises heart rate variability. 5.5 breaths per minute.",
    phases: [
      { name: "Inhale", durationSeconds: 5, instruction: "Smooth nasal inhale" },
      { name: "Exhale", durationSeconds: 6, instruction: "Smooth nasal exhale" },
    ],
    rounds: 10,
    xpReward: 8,
  },
];

/** Look up a breathing exercise by its ID. */
export function getBreathingExercise(id: BreathingTechnique): BreathingExercise | undefined {
  return BREATHING_EXERCISES.find((e) => e.id === id);
}

// ─── Check-in Utilities ───────────────────────────────────────────────────────

/** Return the mood label for a 1–10 value. */
export function moodLabel(value: number): string {
  if (value <= 2) return "Very Low";
  if (value <= 4) return "Low";
  if (value <= 6) return "Moderate";
  if (value <= 8) return "Good";
  return "Excellent";
}

/** Return a colour hex for rendering mood / wellness indicators. */
export function wellnessColor(score: number): string {
  if (score >= 8) return "#22c55e";  // green
  if (score >= 6) return "#84cc16";  // lime
  if (score >= 4) return "#f59e0b";  // amber
  if (score >= 2) return "#f97316";  // orange
  return "#ef4444";                  // red
}
