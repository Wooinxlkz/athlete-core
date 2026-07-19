/**
 * WellBuddy Core — Goals & Progression System
 *
 * Goal creation helpers, validation, dependency checking,
 * and progression calculation from workouts & pull-up records.
 */

import type { Goal, Workout, PullupRecord, InsertGoal } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProgressionResult {
  goalId: number;
  incrementValue: number;
  newValue: number;
  shouldComplete: boolean;
}

export interface UnitSettings {
  units: "metric" | "imperial";
}

// ─── Goal Validation ──────────────────────────────────────────────────────────

/** Returns true when all required fields are present and valid. */
export function validateGoal(goal: Partial<InsertGoal>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!goal.title?.trim()) errors.push("Title is required.");
  if (!goal.category?.trim()) errors.push("Category is required.");
  if (!goal.unit?.trim()) errors.push("Unit is required.");
  if (goal.targetValue === undefined || goal.targetValue <= 0)
    errors.push("Target value must be a positive number.");
  if (!goal.deadline) errors.push("Deadline is required.");
  if (goal.deadline && new Date(goal.deadline) <= new Date())
    errors.push("Deadline must be in the future.");

  return { valid: errors.length === 0, errors };
}

// ─── Goal Progress ────────────────────────────────────────────────────────────

/** Returns a 0–100 progress percentage for a goal. */
export function goalProgressPercent(goal: Goal): number {
  if (goal.targetValue <= 0) return 0;
  return Math.min(Math.round(((goal.currentValue ?? 0) / goal.targetValue) * 100), 100);
}

/** Returns true when a goal has reached or exceeded its target. */
export function isGoalComplete(goal: Goal): boolean {
  return (goal.currentValue ?? 0) >= goal.targetValue;
}

/** Returns the number of days remaining until the deadline (can be negative). */
export function daysUntilDeadline(goal: Goal): number {
  const now = new Date();
  const deadline = new Date(goal.deadline);
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Progressive Goal Series ──────────────────────────────────────────────────

/**
 * Get the currently active target for a progressive goal.
 * Falls back to targetValue when not progressive.
 */
export function activeTarget(goal: Goal): number {
  if (!goal.isProgressiveGoal || !goal.progressiveTargets?.length) {
    return goal.targetValue;
  }
  const idx = Math.min(goal.currentTargetIndex ?? 0, goal.progressiveTargets.length - 1);
  return goal.progressiveTargets[idx];
}

/**
 * Advance a progressive goal to the next target stage.
 * Returns the updated goal object (immutable — does not mutate original).
 */
export function advanceProgressiveGoal(goal: Goal): Goal {
  if (!goal.isProgressiveGoal || !goal.progressiveTargets?.length) return goal;
  const nextIndex = (goal.currentTargetIndex ?? 0) + 1;
  if (nextIndex >= goal.progressiveTargets.length) {
    return { ...goal, status: "completed" };
  }
  return { ...goal, currentTargetIndex: nextIndex, currentValue: 0 };
}

// ─── Dependency Checking ──────────────────────────────────────────────────────

/**
 * Returns true when the prerequisite goal (if any) is completed.
 * Pass all user goals so the prerequisite can be found by ID.
 */
export function prerequisiteMet(goal: Goal, allGoals: Goal[]): boolean {
  if (!goal.prerequisiteGoalId) return true;
  const prereq = allGoals.find((g) => g.id === goal.prerequisiteGoalId);
  return prereq?.status === "completed";
}

// ─── Workout Progression ──────────────────────────────────────────────────────

/** Classify whether a goal is related to pull-ups by inspecting unit / title. */
function isPullupGoal(goal: Goal): boolean {
  const text = `${goal.title} ${goal.unit} ${goal.category}`.toLowerCase();
  return (
    text.includes("pullup") ||
    text.includes("pull-up") ||
    text.includes("pull up") ||
    text.includes("chin-up") ||
    text.includes("chinup")
  );
}

/** Classify whether a given workout can progress a goal. */
function isApplicableWorkout(workout: Workout, goal: Goal): boolean {
  const unit = goal.unit.toLowerCase();
  const type = workout.type;

  if (unit.includes("calorie") || unit.includes("cal")) return true;
  if ((unit.includes("km") || unit.includes("mile")) && type === "cardio") return true;
  if ((unit.includes("kg") || unit.includes("lb")) && type === "strength") return true;
  if ((unit.includes("minute") || unit.includes("hour")) && workout.duration) return true;
  if (unit.includes("workout") || unit.includes("session")) return true;
  if (unit.includes("pose") && type === "flexibility") return true;

  return false;
}

/**
 * Calculate the increment a workout contributes to a goal.
 */
function workoutIncrement(workout: Workout, goal: Goal): number {
  const unit = goal.unit.toLowerCase();

  if (unit.includes("calorie") || unit.includes("cal")) return workout.caloriesBurned ?? 0;
  if (unit.includes("km")) return workout.distance ?? 0;
  if (unit.includes("mile")) return (workout.distance ?? 0) * 0.621371;
  if (unit.includes("kg") || unit.includes("lb")) return workout.weight ?? 0;
  if (unit.includes("minute")) return workout.duration ?? 0;
  if (unit.includes("hour")) return (workout.duration ?? 0) / 60;
  if (unit.includes("pose")) return workout.posesCount ?? 0;
  if (unit.includes("workout") || unit.includes("session")) return 1;

  return 0;
}

/**
 * Calculate goal progression from a completed workout.
 * Returns one result per affected active goal.
 */
export function calculateWorkoutProgression(
  workout: Workout,
  goals: Goal[]
): ProgressionResult[] {
  return goals
    .filter((g) => g.status === "active" && !isPullupGoal(g) && isApplicableWorkout(workout, g))
    .map((goal) => {
      const incrementValue = workoutIncrement(workout, goal);
      const newValue = Math.min(
        Math.max((goal.currentValue ?? 0) + incrementValue, 0),
        goal.targetValue * 1.5
      );
      return {
        goalId: goal.id,
        incrementValue,
        newValue,
        shouldComplete: newValue >= goal.targetValue,
      };
    });
}

/**
 * Calculate goal progression from a pull-up session.
 * Returns one result per affected pull-up goal.
 */
export function calculatePullupProgression(
  record: PullupRecord,
  goals: Goal[]
): ProgressionResult[] {
  return goals
    .filter((g) => g.status === "active" && isPullupGoal(g))
    .map((goal) => {
      const unit = goal.unit.toLowerCase();
      let increment = 0;

      if (unit.includes("rep")) increment = record.maxReps;
      else if (unit.includes("set")) increment = record.sets;
      else increment = record.totalReps;

      const newValue = Math.min(
        Math.max((goal.currentValue ?? 0) + increment, 0),
        goal.targetValue * 1.5
      );
      return {
        goalId: goal.id,
        incrementValue: increment,
        newValue,
        shouldComplete: newValue >= goal.targetValue,
      };
    });
}

// ─── Sorting & Filtering ──────────────────────────────────────────────────────

/** Sort goals: active first, then by priority (high → medium → low), then by deadline. */
export function sortGoals(goals: Goal[]): Goal[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...goals].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "active" ? -1 : 1;
    }
    const pa = priorityOrder[a.priority ?? "medium"];
    const pb = priorityOrder[b.priority ?? "medium"];
    if (pa !== pb) return pa - pb;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}

/** Filter goals by category. */
export function filterGoalsByCategory(goals: Goal[], category: string): Goal[] {
  return goals.filter((g) => g.category.toLowerCase() === category.toLowerCase());
}
