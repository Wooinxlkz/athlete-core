/**
 * Athlete Core — Exercises System
 *
 * Exercise catalogue with categories, muscle-group mapping,
 * difficulty ratings, equipment tags, calisthenics progressions,
 * and search / filtering utilities.
 */

import type { MuscleGroup } from "../workouts";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExerciseCategory =
  | "calisthenics"
  | "strength"
  | "cardio"
  | "flexibility"
  | "olympic"
  | "plyometric"
  | "rehabilitation";

export type Equipment =
  | "none"          // bodyweight only
  | "pull_up_bar"
  | "rings"
  | "parallettes"
  | "barbell"
  | "dumbbell"
  | "kettlebell"
  | "resistance_band"
  | "cable_machine"
  | "bench"
  | "box";

export type Difficulty = "beginner" | "intermediate" | "advanced" | "elite";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment[];
  difficulty: Difficulty;
  description: string;
  coachingCues: string[];
  progressions?: string[];   // easier → harder variants
  regressions?: string[];    // fall-back variations
}

// ─── Exercise Catalogue ───────────────────────────────────────────────────────

export const EXERCISES: Exercise[] = [
  // ── Pull-Up Family ────────────────────────────────────────────────────────
  {
    id: "pullup",
    name: "Pull-Up",
    category: "calisthenics",
    primaryMuscles: ["lats", "back"],
    secondaryMuscles: ["biceps", "forearms", "core"],
    equipment: ["pull_up_bar"],
    difficulty: "intermediate",
    description: "Overhand grip, full hang to chin above bar.",
    coachingCues: [
      "Start from a dead hang — no kipping.",
      "Drive elbows down and back.",
      "Squeeze shoulder blades at the top.",
      "Lower with control — 2–3 seconds down.",
    ],
    progressions: ["archer_pullup", "one_arm_pullup"],
    regressions: ["band_assisted_pullup", "negative_pullup"],
  },
  {
    id: "chinup",
    name: "Chin-Up",
    category: "calisthenics",
    primaryMuscles: ["biceps", "lats"],
    secondaryMuscles: ["back", "forearms"],
    equipment: ["pull_up_bar"],
    difficulty: "beginner",
    description: "Underhand (supinated) grip — more bicep recruitment than pull-up.",
    coachingCues: [
      "Supinate grip slightly wider than shoulder-width.",
      "Lead with your chest, not your chin.",
      "Keep core braced throughout.",
    ],
    progressions: ["pullup", "weighted_chinup"],
    regressions: ["band_assisted_pullup"],
  },
  {
    id: "negative_pullup",
    name: "Negative Pull-Up",
    category: "calisthenics",
    primaryMuscles: ["lats", "back"],
    secondaryMuscles: ["biceps", "forearms"],
    equipment: ["pull_up_bar"],
    difficulty: "beginner",
    description: "Jump or step to top position, lower with control over 5–10 seconds.",
    coachingCues: [
      "Take 5–10 seconds to lower.",
      "Fight gravity the whole way — no dropping.",
      "Full dead hang at the bottom before repeating.",
    ],
    progressions: ["pullup"],
    regressions: ["dead_hang"],
  },
  {
    id: "dead_hang",
    name: "Dead Hang",
    category: "calisthenics",
    primaryMuscles: ["forearms", "lats"],
    secondaryMuscles: ["shoulders", "back"],
    equipment: ["pull_up_bar"],
    difficulty: "beginner",
    description: "Hang passively from the bar to build grip and decompress the spine.",
    coachingCues: [
      "Full relaxation — shoulders up by ears.",
      "Breathe normally — don't hold breath.",
      "Build up to 60+ seconds.",
    ],
    progressions: ["negative_pullup"],
  },
  {
    id: "archer_pullup",
    name: "Archer Pull-Up",
    category: "calisthenics",
    primaryMuscles: ["lats", "back"],
    secondaryMuscles: ["biceps", "shoulders"],
    equipment: ["pull_up_bar"],
    difficulty: "advanced",
    description: "One arm bends while the other stays straight — builds toward one-arm pull-up.",
    coachingCues: [
      "Keep the straight arm truly straight — no bend.",
      "Pull with the bent arm, use straight arm for balance.",
      "Alternate sides each rep.",
    ],
    progressions: ["one_arm_pullup"],
    regressions: ["pullup"],
  },
  {
    id: "one_arm_pullup",
    name: "One-Arm Pull-Up",
    category: "calisthenics",
    primaryMuscles: ["lats", "back"],
    secondaryMuscles: ["biceps", "core", "shoulders"],
    equipment: ["pull_up_bar"],
    difficulty: "elite",
    description: "Full pull-up performed with one arm — pinnacle of calisthenics pulling strength.",
    coachingCues: [
      "Rotate hips slightly to the pulling side.",
      "Counter-balance with free arm close to body.",
      "Full dead hang to chin over bar.",
    ],
    regressions: ["archer_pullup"],
  },
  {
    id: "muscle_up",
    name: "Muscle-Up",
    category: "calisthenics",
    primaryMuscles: ["lats", "back", "chest", "triceps"],
    secondaryMuscles: ["shoulders", "core"],
    equipment: ["pull_up_bar", "rings"],
    difficulty: "advanced",
    description: "Explosive pull-up transitioning to a dip — full upper-body compound.",
    coachingCues: [
      "Explosive pull — get chest above the bar.",
      "False grip is critical on rings.",
      "Transition fast — minimize stall at the bar.",
      "Lock out fully at the top.",
    ],
    regressions: ["pullup"],
  },

  // ── Push Family ───────────────────────────────────────────────────────────
  {
    id: "pushup",
    name: "Push-Up",
    category: "calisthenics",
    primaryMuscles: ["chest", "triceps"],
    secondaryMuscles: ["shoulders", "core"],
    equipment: ["none"],
    difficulty: "beginner",
    description: "Foundational pressing movement — chest to floor, full lockout.",
    coachingCues: [
      "Hands slightly wider than shoulder-width.",
      "Body forms a straight line — no sagging hips.",
      "Lower until chest nearly touches floor.",
      "Elbows track 45° from body — not flared.",
    ],
    progressions: ["diamond_pushup", "pike_pushup", "handstand_pushup"],
  },
  {
    id: "diamond_pushup",
    name: "Diamond Push-Up",
    category: "calisthenics",
    primaryMuscles: ["triceps", "chest"],
    secondaryMuscles: ["shoulders"],
    equipment: ["none"],
    difficulty: "intermediate",
    description: "Hands form a diamond — heavy tricep focus.",
    coachingCues: [
      "Thumbs and index fingers touch to form diamond.",
      "Keep elbows tight to body.",
      "Full range of motion — chest to hands.",
    ],
    regressions: ["pushup"],
  },
  {
    id: "dip",
    name: "Dip",
    category: "calisthenics",
    primaryMuscles: ["chest", "triceps"],
    secondaryMuscles: ["shoulders"],
    equipment: ["parallettes", "rings"],
    difficulty: "intermediate",
    description: "Parallel-bar or ring dip — upper-body pushing strength.",
    coachingCues: [
      "Slight forward lean targets chest; upright targets triceps.",
      "Lower until upper arms are parallel to floor.",
      "Control the descent — no dropping.",
    ],
    progressions: ["ring_dip", "korean_dip"],
  },

  // ── Core ──────────────────────────────────────────────────────────────────
  {
    id: "hanging_leg_raise",
    name: "Hanging Leg Raise",
    category: "calisthenics",
    primaryMuscles: ["core"],
    secondaryMuscles: ["forearms", "lats"],
    equipment: ["pull_up_bar"],
    difficulty: "intermediate",
    description: "Hang from bar, raise legs to 90° or full toes-to-bar.",
    coachingCues: [
      "No swinging — initiate from core, not momentum.",
      "Posterior pelvic tilt at the top.",
      "Lower with control — don't let legs drop.",
    ],
    progressions: ["toes_to_bar", "l_sit"],
  },
  {
    id: "l_sit",
    name: "L-Sit",
    category: "calisthenics",
    primaryMuscles: ["core"],
    secondaryMuscles: ["triceps", "shoulders", "quads"],
    equipment: ["parallettes", "rings", "pull_up_bar"],
    difficulty: "advanced",
    description: "Hold body in L-shape with legs parallel to floor.",
    coachingCues: [
      "Depress and protract shoulder blades.",
      "Point toes — keeps quads engaged.",
      "Build time: 3×10s → 3×30s → 1×60s.",
    ],
    regressions: ["hanging_leg_raise"],
  },

  // ── Legs ──────────────────────────────────────────────────────────────────
  {
    id: "squat",
    name: "Bodyweight Squat",
    category: "calisthenics",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "core", "calves"],
    equipment: ["none"],
    difficulty: "beginner",
    description: "Hip-width stance, descend until thighs are parallel.",
    coachingCues: [
      "Knees track over toes — don't cave in.",
      "Chest up, weight in heels.",
      "Break parallel — full depth.",
    ],
    progressions: ["pistol_squat", "bulgarian_split_squat"],
  },
  {
    id: "pistol_squat",
    name: "Pistol Squat",
    category: "calisthenics",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "core", "calves"],
    equipment: ["none"],
    difficulty: "advanced",
    description: "Single-leg squat to full depth with free leg extended.",
    coachingCues: [
      "Counterbalance with arms forward.",
      "Heel flat throughout the movement.",
      "Use a box or band to assist until strong enough.",
    ],
    regressions: ["squat", "bulgarian_split_squat"],
  },

  // ── Strength ──────────────────────────────────────────────────────────────
  {
    id: "barbell_row",
    name: "Barbell Row",
    category: "strength",
    primaryMuscles: ["back", "lats"],
    secondaryMuscles: ["biceps", "traps", "forearms"],
    equipment: ["barbell"],
    difficulty: "intermediate",
    description: "Bent-over row — essential horizontal pulling strength.",
    coachingCues: [
      "Hinge at hips, back parallel to floor.",
      "Drive elbows back — not up.",
      "Bar touches lower sternum.",
      "Keep spine neutral — no rounding.",
    ],
  },
  {
    id: "deadlift",
    name: "Deadlift",
    category: "strength",
    primaryMuscles: ["hamstrings", "glutes", "back"],
    secondaryMuscles: ["traps", "forearms", "core", "quads"],
    equipment: ["barbell"],
    difficulty: "intermediate",
    description: "Foundational hip-hinge — most complete posterior-chain exercise.",
    coachingCues: [
      "Bar over mid-foot before the lift.",
      "Lat engagement — 'protect your armpits'.",
      "Drive floor away — don't pull with back.",
      "Lock out hips fully at the top.",
    ],
  },
];

// ─── Lookup & Search ──────────────────────────────────────────────────────────

/** Find an exercise by its ID. */
export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

/** Search exercises by name (case-insensitive partial match). */
export function searchExercises(query: string): Exercise[] {
  const q = query.toLowerCase().trim();
  return EXERCISES.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
  );
}

/** Filter by category. */
export function byCategory(category: ExerciseCategory): Exercise[] {
  return EXERCISES.filter((e) => e.category === category);
}

/** Filter by difficulty. */
export function byDifficulty(difficulty: Difficulty): Exercise[] {
  return EXERCISES.filter((e) => e.difficulty === difficulty);
}

/** Filter by equipment available (returns exercises that need ONLY the provided equipment). */
export function byEquipment(available: Equipment[]): Exercise[] {
  const set = new Set(available);
  return EXERCISES.filter((e) => e.equipment.every((eq) => set.has(eq)));
}

/** Filter by primary muscle group. */
export function byMuscle(muscle: MuscleGroup): Exercise[] {
  return EXERCISES.filter((e) =>
    e.primaryMuscles.includes(muscle) || e.secondaryMuscles.includes(muscle)
  );
}

// ─── Calisthenics Progression Map ─────────────────────────────────────────────

export interface ProgressionPath {
  exercise: string;
  difficulty: Difficulty;
  nextStep?: string;
  prevStep?: string;
}

/**
 * Get the full progression path for an exercise (regressions → progressions).
 */
export function progressionPath(exerciseId: string): ProgressionPath[] {
  const ex = getExercise(exerciseId);
  if (!ex) return [];

  const path: ProgressionPath[] = [];

  // Walk regressions (easier)
  const walkBack = (id: string, visited = new Set<string>()): void => {
    if (visited.has(id)) return;
    visited.add(id);
    const e = getExercise(id);
    if (!e) return;
    for (const r of e.regressions ?? []) walkBack(r, visited);
    path.push({
      exercise: e.name,
      difficulty: e.difficulty,
      nextStep: e.progressions?.[0],
      prevStep: e.regressions?.[e.regressions.length - 1],
    });
  };

  walkBack(exerciseId);
  return path;
}

// ─── Workout Builder ──────────────────────────────────────────────────────────

export interface WorkoutTemplate {
  name: string;
  focus: string;
  exercises: Array<{ id: string; sets: number; repsOrSeconds: string }>;
  estimatedMinutes: number;
}

/** Pre-built workout templates for common athlete goals. */
export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    name: "Pull-Up Power",
    focus: "Maximal pulling strength",
    exercises: [
      { id: "dead_hang",        sets: 1, repsOrSeconds: "60s" },
      { id: "pullup",           sets: 5, repsOrSeconds: "3–5 reps @ 85% PB" },
      { id: "chinup",           sets: 3, repsOrSeconds: "6–8 reps" },
      { id: "hanging_leg_raise",sets: 3, repsOrSeconds: "10 reps" },
    ],
    estimatedMinutes: 35,
  },
  {
    name: "Pull-Up Volume",
    focus: "Total rep accumulation for hypertrophy",
    exercises: [
      { id: "pullup",  sets: 6, repsOrSeconds: "sub-max (stop 2 shy of failure)" },
      { id: "chinup",  sets: 4, repsOrSeconds: "8–12 reps" },
      { id: "dip",     sets: 4, repsOrSeconds: "10–15 reps" },
      { id: "l_sit",   sets: 3, repsOrSeconds: "20s hold" },
    ],
    estimatedMinutes: 45,
  },
  {
    name: "Beginner Calisthenics",
    focus: "Build foundation for pull-ups",
    exercises: [
      { id: "dead_hang",      sets: 3, repsOrSeconds: "30s" },
      { id: "negative_pullup",sets: 3, repsOrSeconds: "5 reps (5s down)" },
      { id: "pushup",         sets: 3, repsOrSeconds: "10–15 reps" },
      { id: "squat",          sets: 3, repsOrSeconds: "15 reps" },
    ],
    estimatedMinutes: 30,
  },
  {
    name: "Advanced Athlete",
    focus: "Skill + strength — muscle-up progressions",
    exercises: [
      { id: "archer_pullup",  sets: 4, repsOrSeconds: "4 each side" },
      { id: "muscle_up",      sets: 3, repsOrSeconds: "3–5 reps" },
      { id: "l_sit",          sets: 3, repsOrSeconds: "30s" },
      { id: "pistol_squat",   sets: 3, repsOrSeconds: "5 each leg" },
    ],
    estimatedMinutes: 50,
  },
];
