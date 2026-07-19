/**
 * Athlete Core — Pull-Up Tracking System
 *
 * The core of the platform. Handles pull-up session recording,
 * personal-best detection, grip-type analysis, volume calculations,
 * rep-max estimation, and progression rate tracking.
 */

import type { PullupRecord, InsertPullupRecord } from "../types";

// ─── Grip Types ───────────────────────────────────────────────────────────────

export type GripType =
  | "overhand"      // pronated — standard pull-up
  | "underhand"     // supinated — chin-up
  | "neutral"       // parallel grip
  | "wide"          // wider than shoulder-width overhand
  | "close"         // close grip / diamond
  | "archer"        // one-arm assist
  | "typewriter"    // lateral shifting
  | "mixed";        // one hand each

export const GRIP_DESCRIPTIONS: Record<GripType, string> = {
  overhand:   "Standard pronated grip — targets lats and upper back.",
  underhand:  "Chin-up grip — more bicep involvement.",
  neutral:    "Parallel / hammer grip — easier on shoulders.",
  wide:       "Wide pronated — maximises lat stretch.",
  close:      "Close grip — increases tricep and inner-lat work.",
  archer:     "One arm bears most load — builds toward one-arm pull-up.",
  typewriter: "Lateral shift at the top — advanced lat isolation.",
  mixed:      "One overhand, one underhand — grip strength focus.",
};

// ─── Session Validation ───────────────────────────────────────────────────────

export function validatePullupRecord(
  record: Partial<InsertPullupRecord>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!record.date) errors.push("Date is required.");
  if (!record.sets || record.sets < 1) errors.push("Sets must be at least 1.");
  if (!record.maxReps || record.maxReps < 1) errors.push("Max reps must be at least 1.");
  if (!record.totalReps || record.totalReps < 1) errors.push("Total reps must be at least 1.");
  if (record.maxReps && record.totalReps && record.totalReps < record.maxReps)
    errors.push("Total reps cannot be less than max reps.");
  return { valid: errors.length === 0, errors };
}

// ─── Personal Best Detection ──────────────────────────────────────────────────

/**
 * Given a new record and all previous records, determine if it is a personal best.
 * Returns true when the new maxReps exceeds every prior maxReps.
 */
export function isNewPersonalBest(
  newMaxReps: number,
  previousRecords: PullupRecord[]
): boolean {
  if (previousRecords.length === 0) return true;
  const prevBest = Math.max(...previousRecords.map((r) => r.maxReps));
  return newMaxReps > prevBest;
}

// ─── Volume Calculations ──────────────────────────────────────────────────────

/** Total volume = sum of all reps across all sessions. */
export function totalVolume(records: PullupRecord[]): number {
  return records.reduce((sum, r) => sum + r.totalReps, 0);
}

/** Average reps per set across a session. */
export function avgRepsPerSet(record: PullupRecord): number {
  if (!record.sets || record.sets === 0) return 0;
  return Math.round((record.totalReps / record.sets) * 10) / 10;
}

/** Total sets logged across all sessions. */
export function totalSets(records: PullupRecord[]): number {
  return records.reduce((sum, r) => sum + r.sets, 0);
}

/** Volume for a specific date range (inclusive). */
export function volumeInRange(
  records: PullupRecord[],
  from: string,
  to: string
): number {
  return records
    .filter((r) => r.date >= from && r.date <= to)
    .reduce((sum, r) => sum + r.totalReps, 0);
}

// ─── Rep-Max Estimation ───────────────────────────────────────────────────────

/**
 * Estimate 1-Rep Max using the Epley formula.
 *   1RM ≈ reps × (1 + sets / 30)
 * For bodyweight pull-ups this gives a "rep-strength" score (no weight input needed).
 *
 * @param maxReps  Best single-set rep count
 * @param sets     Number of sets performed
 */
export function estimateRepMax(maxReps: number, sets: number): number {
  return Math.round(maxReps * (1 + sets / 30));
}

// ─── Progression Rate ─────────────────────────────────────────────────────────

export interface ProgressionRate {
  repsGainedPerWeek: number;
  totalGain: number;
  weeksTracked: number;
  trend: "improving" | "plateauing" | "declining";
}

/**
 * Compute weekly progression rate from a sorted (asc by date) list of records.
 * Uses first vs last maxReps over the full date span.
 */
export function calculateProgressionRate(records: PullupRecord[]): ProgressionRate {
  if (records.length < 2) {
    return { repsGainedPerWeek: 0, totalGain: 0, weeksTracked: 0, trend: "plateauing" };
  }

  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const first = sorted[0];
  const last  = sorted[sorted.length - 1];

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksTracked =
    Math.max(1, (new Date(last.date).getTime() - new Date(first.date).getTime()) / msPerWeek);

  const totalGain = last.maxReps - first.maxReps;
  const repsGainedPerWeek = Math.round((totalGain / weeksTracked) * 100) / 100;

  const trend =
    repsGainedPerWeek > 0.1
      ? "improving"
      : repsGainedPerWeek < -0.1
      ? "declining"
      : "plateauing";

  return { repsGainedPerWeek, totalGain, weeksTracked: Math.round(weeksTracked), trend };
}

// ─── Session Frequency ────────────────────────────────────────────────────────

/** Average sessions per week over the tracked period. */
export function sessionsPerWeek(records: PullupRecord[]): number {
  if (records.length < 2) return records.length;
  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const msSpan =
    new Date(sorted[sorted.length - 1].date).getTime() -
    new Date(sorted[0].date).getTime();
  const weeks = Math.max(1, msSpan / (7 * 24 * 60 * 60 * 1000));
  return Math.round((records.length / weeks) * 10) / 10;
}

// ─── Grip Distribution ────────────────────────────────────────────────────────

export interface GripShare {
  grip: string;
  sessions: number;
  totalReps: number;
  percent: number;
}

/** Break down session count and reps by grip type. */
export function gripDistribution(records: PullupRecord[]): GripShare[] {
  const map: Record<string, { sessions: number; totalReps: number }> = {};

  for (const r of records) {
    const grip = r.gripType ?? "overhand";
    if (!map[grip]) map[grip] = { sessions: 0, totalReps: 0 };
    map[grip].sessions++;
    map[grip].totalReps += r.totalReps;
  }

  const total = records.length || 1;
  return Object.entries(map)
    .sort((a, b) => b[1].sessions - a[1].sessions)
    .map(([grip, data]) => ({
      grip,
      sessions: data.sessions,
      totalReps: data.totalReps,
      percent: Math.round((data.sessions / total) * 100),
    }));
}

// ─── Training Recommendations ─────────────────────────────────────────────────

export interface PullupRecommendation {
  targetSets: number;
  targetRepsPerSet: number;
  restSeconds: number;
  focus: string;
  rationale: string;
}

/**
 * Suggest a next-session target based on current personal best and goal.
 *
 * @param currentPB    Current max reps in a single set
 * @param goal         Training goal
 */
export function recommendNextSession(
  currentPB: number,
  goal: "strength" | "endurance" | "volume"
): PullupRecommendation {
  if (goal === "strength") {
    return {
      targetSets: 5,
      targetRepsPerSet: Math.max(1, Math.ceil(currentPB * 0.85)),
      restSeconds: 180,
      focus: "Heavy sets close to max — build raw strength",
      rationale: "85% of PB × 5 sets forces neuromuscular adaptation.",
    };
  }
  if (goal === "endurance") {
    return {
      targetSets: 4,
      targetRepsPerSet: Math.max(1, Math.ceil(currentPB * 0.6)),
      restSeconds: 60,
      focus: "Sub-max sets with short rest — build muscular endurance",
      rationale: "60% of PB with 60s rest keeps time-under-tension high.",
    };
  }
  // volume
  return {
    targetSets: 6,
    targetRepsPerSet: Math.max(1, Math.ceil(currentPB * 0.7)),
    restSeconds: 90,
    focus: "Moderate reps, more sets — maximise weekly volume",
    rationale: "70% of PB × 6 sets hits optimal hypertrophy volume range.",
  };
}
