/**
 * WellBuddy Core — Nutrition System
 *
 * Macro tracking, daily goal progress, BMR/TDEE calculations,
 * meal planning utilities, and food-log helpers.
 */

import type { NutritionLog, NutritionGoals, FoodAnalysisResult } from "../types";

// ─── BMR & TDEE ───────────────────────────────────────────────────────────────

export type ActivityLevel =
  | "sedentary"        // desk job, no exercise
  | "lightly_active"   // light exercise 1–3 days/week
  | "moderately_active"// moderate exercise 3–5 days/week
  | "very_active"      // hard exercise 6–7 days/week
  | "extra_active";    // physical job + hard exercise

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary:         1.2,
  lightly_active:    1.375,
  moderately_active: 1.55,
  very_active:       1.725,
  extra_active:      1.9,
};

/**
 * Mifflin–St Jeor BMR (kcal/day).
 * @param weightKg  body weight in kilograms
 * @param heightCm  height in centimetres
 * @param ageYears  age in years
 * @param sex       "male" | "female"
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: "male" | "female"
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

/**
 * Total Daily Energy Expenditure = BMR × activity multiplier.
 */
export function calculateTDEE(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
}

// ─── Macro Targets ────────────────────────────────────────────────────────────

export type FitnessGoalType = "lose_fat" | "maintain" | "build_muscle";

/**
 * Compute recommended daily macro targets (g) from a TDEE and fitness goal.
 *
 * Splits:
 *   lose_fat     — deficit 20%, protein 35%, fat 30%, carbs 35%
 *   maintain     — no change,   protein 30%, fat 30%, carbs 40%
 *   build_muscle — surplus 10%, protein 35%, fat 25%, carbs 40%
 */
export function recommendedMacros(
  tdee: number,
  goal: FitnessGoalType
): NutritionGoals {
  const adjustments: Record<FitnessGoalType, number> = {
    lose_fat:     -0.20,
    maintain:      0,
    build_muscle: +0.10,
  };
  const splits: Record<FitnessGoalType, { protein: number; fat: number; carbs: number }> = {
    lose_fat:     { protein: 0.35, fat: 0.30, carbs: 0.35 },
    maintain:     { protein: 0.30, fat: 0.30, carbs: 0.40 },
    build_muscle: { protein: 0.35, fat: 0.25, carbs: 0.40 },
  };

  const calories = Math.round(tdee * (1 + adjustments[goal]));
  const { protein, fat, carbs } = splits[goal];

  return {
    dailyCalories: calories,
    dailyProtein:  Math.round((calories * protein) / 4),  // 4 kcal/g
    dailyFat:      Math.round((calories * fat) / 9),      // 9 kcal/g
    dailyCarbs:    Math.round((calories * carbs) / 4),    // 4 kcal/g
  };
}

// ─── Daily Log Aggregation ────────────────────────────────────────────────────

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
}

/** Aggregate a list of log entries for a single day. */
export function aggregateDailyLog(
  logs: NutritionLog[],
  date: string
): DailyNutritionSummary {
  const dayLogs = logs.filter((l) => l.date === date);
  return {
    date,
    totalCalories: dayLogs.reduce((s, l) => s + (l.calories ?? 0), 0),
    totalProtein:  dayLogs.reduce((s, l) => s + (l.protein ?? 0), 0),
    totalCarbs:    dayLogs.reduce((s, l) => s + (l.carbs ?? 0), 0),
    totalFat:      dayLogs.reduce((s, l) => s + (l.fat ?? 0), 0),
    mealCount:     dayLogs.length,
  };
}

// ─── Goal Progress ────────────────────────────────────────────────────────────

export interface MacroProgress {
  calories: { consumed: number; goal: number; percent: number };
  protein:  { consumed: number; goal: number; percent: number };
  carbs:    { consumed: number; goal: number; percent: number };
  fat:      { consumed: number; goal: number; percent: number };
}

/** Compute how close today's log is to the user's nutrition goals. */
export function macroProgress(
  summary: DailyNutritionSummary,
  goals: NutritionGoals
): MacroProgress {
  const pct = (consumed: number, goal: number) =>
    goal > 0 ? Math.min(Math.round((consumed / goal) * 100), 100) : 0;

  return {
    calories: { consumed: summary.totalCalories, goal: goals.dailyCalories, percent: pct(summary.totalCalories, goals.dailyCalories) },
    protein:  { consumed: summary.totalProtein,  goal: goals.dailyProtein,  percent: pct(summary.totalProtein,  goals.dailyProtein)  },
    carbs:    { consumed: summary.totalCarbs,     goal: goals.dailyCarbs,    percent: pct(summary.totalCarbs,    goals.dailyCarbs)    },
    fat:      { consumed: summary.totalFat,       goal: goals.dailyFat,      percent: pct(summary.totalFat,      goals.dailyFat)      },
  };
}

// ─── Food Analysis Integration ─────────────────────────────────────────────────

/**
 * Normalise a food analysis result from the LogMeal API (or equivalent)
 * into a standard FoodAnalysisResult.
 */
export function normaliseFoodAnalysis(raw: {
  recognition_results?: Array<{
    name: { cleaned_name: string };
    prob: number;
    nutritional_info?: {
      calories?: number;
      proteins?: number;
      carbohydrates?: number;
      fats?: number;
    };
  }>;
}): FoodAnalysisResult | null {
  const top = raw.recognition_results?.[0];
  if (!top) return null;

  const info = top.nutritional_info ?? {};
  return {
    foodName:    top.name.cleaned_name,
    confidence:  top.prob,
    calories:    info.calories   ?? 0,
    protein:     info.proteins   ?? 0,
    carbs:       info.carbohydrates ?? 0,
    fat:         info.fats       ?? 0,
  };
}

// ─── Hydration ────────────────────────────────────────────────────────────────

/** Recommended daily water intake in ml based on weight and activity. */
export function recommendedWaterMl(weightKg: number, activity: ActivityLevel): number {
  const base = weightKg * 33;
  const bonus: Record<ActivityLevel, number> = {
    sedentary:         0,
    lightly_active:    300,
    moderately_active: 500,
    very_active:       700,
    extra_active:      1000,
  };
  return Math.round(base + bonus[activity]);
}
