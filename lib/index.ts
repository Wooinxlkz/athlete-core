/**
 * Athlete Core Library
 * ────────────────────
 * A framework-agnostic TypeScript library containing the complete
 * business-logic systems for an athlete & gym community platform.
 *
 * Systems:
 *   pullups    — pull-up session tracking, PB detection, grip analysis, progression rate
 *   workouts   — session validation, calorie estimation, rest-day detection, volume
 *   exercises  — exercise catalogue, calisthenics progressions, workout templates
 *   xp         — XP calculation, level progression (1–1000), boost tokens
 *   goals      — goal management, dependency chains, auto-progression
 *   wellness   — energy scoring, composite wellness score, breathing exercises
 *   analytics  — streaks, trends, weekly summaries, personal bests
 *   journal    — entry validation, search, mood trends, journaling streaks
 *   nutrition  — BMR/TDEE, macro tracking, food analysis, hydration
 *   ai         — WellBuddy AI personalities, prompt builder, content safety
 *   rewards    — achievement detection, badge tiers, milestone boost-token rewards
 *   types      — all shared TypeScript types
 *
 * Contact / commercial licensing: karimsc01t@gmail.com
 */

export * from "./types";

export * as pullups   from "./pullups";
export * as workouts  from "./workouts";
export * as exercises from "./exercises";
export * as xp        from "./xp";
export * as goals     from "./goals";
export * as wellness  from "./wellness";
export * as analytics from "./analytics";
export * as journal   from "./journal";
export * as nutrition from "./nutrition";
export * as ai        from "./ai";
export * as rewards   from "./rewards";
