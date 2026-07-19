/**
 * WellBuddy Core — XP & Gamification System
 *
 * Handles XP calculation, level progression, boost tokens,
 * daily logins, weekly streaks, and level titles.
 */

import type { Workout, PullupRecord, Goal, LevelInfo, XPEvent, XPSource, BoostToken } from "../types";

// ─── Level Titles ─────────────────────────────────────────────────────────────

export const LEVEL_TITLES: Record<number, string> = {
  0:   "Newcomer",
  1:   "Beginner",
  5:   "Apprentice",
  10:  "Trainee",
  15:  "Athlete",
  20:  "Competitor",
  25:  "Challenger",
  30:  "Warrior",
  35:  "Fighter",
  40:  "Champion",
  45:  "Expert",
  50:  "Master",
  60:  "Grandmaster",
  70:  "Elite",
  80:  "Legend",
  90:  "Mythic",
  100: "Titan",
};

/** Returns the title for a given level (nearest milestone ≤ level). */
export function getLevelTitle(level: number): string {
  const milestones = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a);
  const match = milestones.find((m) => level >= m);
  return LEVEL_TITLES[match ?? 0];
}

// ─── Level Calculation ────────────────────────────────────────────────────────

/**
 * XP required to advance FROM a given level.
 * - Levels 1–100: floor(5 × level^1.5)
 * - Levels 101+:  1 000 XP per level (flat)
 */
export function xpRequiredForLevel(level: number): number {
  if (level <= 0) return 5;
  if (level > 100) return 1000;
  return Math.floor(5 * Math.pow(level, 1.5));
}

/**
 * Derive the current level, progress within that level, and XP needed
 * to reach the next level from a raw totalXP value.
 */
export function calculateLevelFromXP(totalXP: number): LevelInfo {
  let level = 0;
  let xpUsed = 0;

  while (level < 100) {
    const needed = xpRequiredForLevel(level + 1);
    if (xpUsed + needed > totalXP) break;
    xpUsed += needed;
    level++;
  }

  const XP_FOR_100_LEVELS = 202_459;

  if (level >= 100 && totalXP > XP_FOR_100_LEVELS) {
    const extraLevels = Math.floor((totalXP - XP_FOR_100_LEVELS) / 1000);
    level = Math.min(100 + extraLevels, 1000);
    xpUsed = XP_FOR_100_LEVELS + extraLevels * 1000;
  }

  const xpInCurrentLevel = totalXP - xpUsed;
  const xpForNextLevel = xpRequiredForLevel(level + 1);
  const progressPercent = Math.min(
    Math.round((xpInCurrentLevel / xpForNextLevel) * 100),
    100
  );

  return {
    level,
    totalXP,
    xpInCurrentLevel,
    xpForNextLevel,
    progressPercent,
    title: getLevelTitle(level),
  };
}

// ─── XP Award Formulas ────────────────────────────────────────────────────────

/**
 * Calculate XP earned from a completed workout.
 *
 * Formula:
 *   base(50) + duration×2 + typeBonus + componentBonus
 */
export function calculateWorkoutXP(workout: Workout): number {
  let base = 50;
  const durationBonus = (workout.duration ?? 0) * 2;

  const typeBonus: Record<string, number> = {
    mixed: 40,
    strength: 30,
    cardio: 20,
    flexibility: 15,
  };
  const bonus = typeBonus[workout.type] ?? 0;

  let componentBonus = 0;
  if (workout.distance) componentBonus += workout.distance * 1;
  if (workout.weight)   componentBonus += workout.weight * 0.3;
  if (workout.posesCount) componentBonus += workout.posesCount * 2;

  return Math.floor(base + durationBonus + bonus + componentBonus);
}

/**
 * Calculate XP earned from a pull-up session.
 *
 * Formula:
 *   30 + totalReps×3 + maxReps×5 + (personalBest ? 50 : 0)
 */
export function calculatePullupXP(record: PullupRecord): number {
  return (
    30 +
    record.totalReps * 3 +
    record.maxReps * 5 +
    (record.personalBest ? 50 : 0)
  );
}

/**
 * Calculate XP earned when a goal is completed.
 *
 * Base XP depends on the goal unit; capped target bonus of 50.
 */
export function calculateGoalCompletionXP(goal: Goal): number {
  const unit = goal.unit.toLowerCase();
  let base = 55;

  if (unit.includes("week") || unit.includes("month")) base = 100;
  else if (unit.includes("day")) base = 75;
  else if (unit.includes("calorie") || unit.includes("cal")) base = 60;
  else if (unit.includes("km") || unit.includes("mile")) base = 70;
  else if (unit.includes("rep") || unit.includes("set")) base = 50;
  else if (unit.includes("minute") || unit.includes("hour")) base = 65;

  const targetBonus = Math.min(Math.floor(goal.targetValue / 10), 50);
  return base + targetBonus;
}

/** Fixed XP for completing a wellness check-in. */
export function calculateWellnessXP(): number {
  return 20;
}

/** Fixed XP for logging a journal entry. */
export function calculateJournalXP(): number {
  return 10;
}

/** XP for a daily login (first login of the calendar day). */
export function calculateDailyLoginXP(): number {
  return 5;
}

/** XP awarded for completing a weekly streak milestone. */
export function calculateWeeklyStreakXP(streakWeeks: number): number {
  const milestones: Record<number, number> = {
    1: 50,
    4: 100,
    8: 150,
    12: 200,
    26: 300,
    52: 500,
  };
  return milestones[streakWeeks] ?? 0;
}

// ─── Boost Token System ───────────────────────────────────────────────────────

const BOOST_MULTIPLIER = 2.0;
const MAX_BOOST_TOKENS = 3;

/**
 * Apply an XP boost (2× multiplier) to a base XP value.
 * Returns the final (possibly boosted) amount.
 */
export function applyBoost(baseXP: number, boost: BoostToken): number {
  if (!boost.active) return baseXP;
  const now = new Date();
  if (boost.expiresAt && boost.expiresAt < now) return baseXP;
  return Math.floor(baseXP * BOOST_MULTIPLIER);
}

/**
 * Build an XPEvent record from a raw XP amount and boost state.
 */
export function buildXPEvent(
  source: XPSource,
  baseAmount: number,
  boost: BoostToken
): XPEvent {
  const finalAmount = applyBoost(baseAmount, boost);
  return {
    source,
    amount: baseAmount,
    boosted: finalAmount !== baseAmount,
    finalAmount,
    timestamp: new Date(),
  };
}

/**
 * Check whether a boost token can be activated.
 * Rules: max 3 tokens banked, one active at a time.
 */
export function canActivateBoost(boost: BoostToken): boolean {
  if (boost.active) return false;
  return boost.tokensRemaining > 0;
}

// ─── Convenience Helper ───────────────────────────────────────────────────────

/**
 * Summarise all XP sources for a day and return the total.
 */
export function sumDailyXP(events: XPEvent[]): number {
  return events.reduce((total, e) => total + e.finalAmount, 0);
}
