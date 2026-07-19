/**
 * WellBuddy Core — Shared TypeScript Types
 * All domain types used across the library systems.
 */

// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  totalXP: number;
  currentLevel: number;
  avatarUrl?: string;
  xpBoostActive: boolean;
  xpBoostExpiresAt?: Date;
  boostTokens: number;
  lastLoginDate?: string;
  weeklyActiveStreak: number;
  lastWeeklyMilestone?: string;
  createdAt: string;
  accountStatus: "active" | "pending_deletion" | "suspended" | "deleted";
}

// ─── Workouts ─────────────────────────────────────────────────────────────────

export type WorkoutType = "pullups" | "strength" | "cardio" | "flexibility" | "mixed" | "general";

export interface Workout {
  id: number;
  userId: number;
  date: string;
  type: WorkoutType;
  exercises: string[];
  duration?: number;         // minutes
  notes?: string;
  targetMuscleGroups?: string[];
  equipmentUsed?: string;
  caloriesBurned?: number;
  distance?: number;         // km
  speed?: number;            // km/h
  weight?: number;           // kg
  posesCount?: number;
  bodyAreas?: string;
  flexibilityIntensity?: string;
  workoutComponents?: string[];
  primaryComponent?: string;
  secondaryComponents?: string[];
  overallIntensity?: string;
}

export interface InsertWorkout extends Omit<Workout, "id"> {}

// ─── Pull-Up Records ─────────────────────────────────────────────────────────

export interface PullupRecord {
  id: number;
  userId: number;
  workoutId?: number;
  date: string;
  maxReps: number;
  totalReps: number;
  sets: number;
  personalBest: boolean;
  gripType?: string;
}

export interface InsertPullupRecord extends Omit<PullupRecord, "id"> {}

// ─── Goals ────────────────────────────────────────────────────────────────────

export type GoalStatus = "active" | "completed" | "paused";
export type GoalPriority = "low" | "medium" | "high";

export interface Goal {
  id: number;
  userId: number;
  title: string;
  description?: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  status: GoalStatus;
  priority: GoalPriority;
  prerequisiteGoalId?: number;
  progressiveTargets?: number[];
  currentTargetIndex: number;
  isProgressiveGoal: boolean;
  createdAt: string;
}

export interface InsertGoal extends Omit<Goal, "id"> {}

// ─── Wellness ─────────────────────────────────────────────────────────────────

export interface WellnessEntry {
  id: number;
  userId: number;
  date: string;
  mood: number;              // 1–10
  energy: number;            // 1–10
  stress: number;            // 1–10
  sleepHours?: number;
  sleepQuality?: number;     // 1–10
  hydration?: number;        // glasses
  notes?: string;
  relationships: number;     // 1–10
  stressManagement: number;  // 1–10
  selfConfidence: number;    // 1–10
  emotionalBalance: number;  // 1–10
  mentalResilience: number;  // 1–10
  focusClarity: number;      // 1–10
}

export interface InsertWellnessEntry extends Omit<WellnessEntry, "id"> {}

// ─── Journal ─────────────────────────────────────────────────────────────────

export interface JournalEntry {
  id: number;
  userId: number;
  date: string;
  title: string;
  content: string;
  mood?: number;             // 1–10
  tags?: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertJournalEntry extends Omit<JournalEntry, "id" | "updatedAt"> {}

// ─── XP & Gamification ───────────────────────────────────────────────────────

export interface XPEvent {
  source: XPSource;
  amount: number;
  boosted: boolean;
  finalAmount: number;
  timestamp: Date;
}

export type XPSource =
  | "workout"
  | "pullup_record"
  | "goal_completion"
  | "wellness_checkin"
  | "journal_entry"
  | "daily_login"
  | "weekly_streak"
  | "achievement";

export interface LevelInfo {
  level: number;
  totalXP: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  title: string;
}

export interface BoostToken {
  active: boolean;
  multiplier: number;         // 2.0
  expiresAt?: Date;
  tokensRemaining: number;    // max 3
}

// ─── Achievements & Rewards ───────────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  condition: AchievementCondition;
  xpReward: number;
  unlockedAt?: Date;
}

export type AchievementCategory =
  | "fitness"
  | "wellness"
  | "consistency"
  | "social"
  | "milestone"
  | "nutrition";

export interface AchievementCondition {
  type: "pullups" | "workouts" | "goals" | "streak" | "level" | "xp";
  threshold: number;
}

// ─── Nutrition ────────────────────────────────────────────────────────────────

export interface NutritionLog {
  id: number;
  userId: number;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foodName: string;
  calories?: number;
  protein?: number;          // grams
  carbs?: number;            // grams
  fat?: number;              // grams
  notes?: string;
}

export interface NutritionGoals {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
}

export interface FoodAnalysisResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;        // 0–1
  servingSize?: string;
}

// ─── AI / WellBuddy ──────────────────────────────────────────────────────────

export interface WellBuddyPersonality {
  id: string;
  name: string;
  tone: "supportive" | "motivational" | "analytical" | "friendly" | "strict";
  systemPrompt: string;
}

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export interface AIResponse {
  message: string;
  tokensUsed?: number;
  model?: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface WorkoutStreak {
  current: number;
  longest: number;
  lastWorkoutDate?: string;
}

export interface ProgressionStats {
  totalWorkouts: number;
  totalPullups: number;
  personalBest: number;
  averageRepsPerSession: number;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
  streak: WorkoutStreak;
}

export interface WellnessStats {
  averageMood: number;
  averageEnergy: number;
  averageStress: number;
  averageSleepHours: number;
  wellnessScore: number;      // 1–10 composite
  energyLevel: number;        // computed 1–10
}

// ─── Wearables ────────────────────────────────────────────────────────────────

export type WearableProvider =
  | "apple_health"
  | "fitbit"
  | "garmin"
  | "google_fit"
  | "samsung_health";

export interface WearableConnection {
  provider: WearableProvider;
  userId: number;
  accessToken: string;        // store encrypted
  refreshToken?: string;
  expiresAt?: Date;
  lastSyncedAt?: Date;
  connected: boolean;
}

export interface WearableSyncData {
  steps?: number;
  heartRate?: number;
  calories?: number;
  activeMinutes?: number;
  sleepHours?: number;
  date: string;
}
