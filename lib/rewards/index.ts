/**
 * WellBuddy Core — Rewards & Achievements System
 *
 * Achievement definitions, unlock detection, badge tiers,
 * and milestone reward hooks.
 */

import type {
  Achievement,
  AchievementCategory,
  ProgressionStats,
  LevelInfo,
} from "../types";

// ─── Achievement Definitions ──────────────────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  // Fitness
  {
    id: "first_pullup",
    title: "First Pull-up",
    description: "Log your first pull-up session.",
    icon: "💪",
    category: "fitness",
    condition: { type: "pullups", threshold: 1 },
    xpReward: 50,
  },
  {
    id: "century_pullups",
    title: "Century Club",
    description: "Complete 100 total pull-up reps.",
    icon: "💯",
    category: "fitness",
    condition: { type: "pullups", threshold: 100 },
    xpReward: 150,
  },
  {
    id: "thousand_pullups",
    title: "Pull-up Warrior",
    description: "Complete 1 000 total pull-up reps.",
    icon: "🏆",
    category: "fitness",
    condition: { type: "pullups", threshold: 1000 },
    xpReward: 500,
  },
  {
    id: "first_workout",
    title: "First Step",
    description: "Complete your first workout.",
    icon: "🎯",
    category: "fitness",
    condition: { type: "workouts", threshold: 1 },
    xpReward: 30,
  },
  {
    id: "ten_workouts",
    title: "Ten Strong",
    description: "Complete 10 workouts.",
    icon: "🔥",
    category: "fitness",
    condition: { type: "workouts", threshold: 10 },
    xpReward: 100,
  },
  {
    id: "fifty_workouts",
    title: "Dedicated Athlete",
    description: "Complete 50 workouts.",
    icon: "⚡",
    category: "fitness",
    condition: { type: "workouts", threshold: 50 },
    xpReward: 300,
  },
  {
    id: "hundred_workouts",
    title: "Century Athlete",
    description: "Complete 100 workouts.",
    icon: "🥇",
    category: "fitness",
    condition: { type: "workouts", threshold: 100 },
    xpReward: 600,
  },
  // Consistency
  {
    id: "week_streak",
    title: "Week Warrior",
    description: "Maintain a 7-day workout streak.",
    icon: "📅",
    category: "consistency",
    condition: { type: "streak", threshold: 7 },
    xpReward: 200,
  },
  {
    id: "month_streak",
    title: "Iron Consistency",
    description: "Maintain a 30-day workout streak.",
    icon: "🗓️",
    category: "consistency",
    condition: { type: "streak", threshold: 30 },
    xpReward: 700,
  },
  // Goals
  {
    id: "first_goal",
    title: "Goal Setter",
    description: "Complete your first goal.",
    icon: "✅",
    category: "milestone",
    condition: { type: "goals", threshold: 1 },
    xpReward: 75,
  },
  {
    id: "five_goals",
    title: "Achiever",
    description: "Complete 5 goals.",
    icon: "🌟",
    category: "milestone",
    condition: { type: "goals", threshold: 5 },
    xpReward: 250,
  },
  // Levels
  {
    id: "level_10",
    title: "Level 10 Reached",
    description: "Reach level 10.",
    icon: "🎖️",
    category: "milestone",
    condition: { type: "level", threshold: 10 },
    xpReward: 0,
  },
  {
    id: "level_50",
    title: "Level 50 Legend",
    description: "Reach level 50.",
    icon: "🏅",
    category: "milestone",
    condition: { type: "level", threshold: 50 },
    xpReward: 0,
  },
  {
    id: "level_100",
    title: "Titan",
    description: "Reach the maximum level 100.",
    icon: "👑",
    category: "milestone",
    condition: { type: "level", threshold: 100 },
    xpReward: 0,
  },
];

// ─── Unlock Detection ─────────────────────────────────────────────────────────

export interface UnlockContext {
  totalPullups: number;
  totalWorkouts: number;
  completedGoals: number;
  currentStreak: number;
  currentLevel: number;
  totalXP: number;
}

/**
 * Check which achievements a user has newly unlocked given their stats.
 * Pass previously unlocked IDs so we only return NEW unlocks.
 */
export function detectNewUnlocks(
  ctx: UnlockContext,
  alreadyUnlocked: Set<string>
): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) => {
    if (alreadyUnlocked.has(achievement.id)) return false;

    const { type, threshold } = achievement.condition;
    switch (type) {
      case "pullups":  return ctx.totalPullups  >= threshold;
      case "workouts": return ctx.totalWorkouts >= threshold;
      case "goals":    return ctx.completedGoals >= threshold;
      case "streak":   return ctx.currentStreak >= threshold;
      case "level":    return ctx.currentLevel  >= threshold;
      case "xp":       return ctx.totalXP       >= threshold;
      default:         return false;
    }
  });
}

// ─── Badge Tiers ──────────────────────────────────────────────────────────────

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

/**
 * Determine badge tier from XP reward value.
 * Used to colour-code achievement cards.
 */
export function achievementTier(xpReward: number): BadgeTier {
  if (xpReward >= 500) return "diamond";
  if (xpReward >= 250) return "platinum";
  if (xpReward >= 100) return "gold";
  if (xpReward >= 50)  return "silver";
  return "bronze";
}

export const BADGE_TIER_COLORS: Record<BadgeTier, string> = {
  bronze:   "#cd7f32",
  silver:   "#c0c0c0",
  gold:     "#ffd700",
  platinum: "#e5e4e2",
  diamond:  "#b9f2ff",
};

// ─── Milestone Rewards ────────────────────────────────────────────────────────

export interface MilestoneReward {
  milestone: string;
  description: string;
  reward: string;
  threshold: number;
  unit: string;
}

export const MILESTONE_REWARDS: MilestoneReward[] = [
  { milestone: "10 Workouts",       description: "Completed 10 workouts",       reward: "1 XP Boost Token",  threshold: 10,   unit: "workouts"  },
  { milestone: "50 Workouts",       description: "Completed 50 workouts",       reward: "2 XP Boost Tokens", threshold: 50,   unit: "workouts"  },
  { milestone: "100 Workouts",      description: "Completed 100 workouts",      reward: "3 XP Boost Tokens", threshold: 100,  unit: "workouts"  },
  { milestone: "500 Pull-up Reps",  description: "500 total pull-up reps",      reward: "1 XP Boost Token",  threshold: 500,  unit: "pullups"   },
  { milestone: "1 000 Pull-up Reps",description: "1 000 total pull-up reps",    reward: "2 XP Boost Tokens", threshold: 1000, unit: "pullups"   },
  { milestone: "7-Day Streak",      description: "7 consecutive workout days",  reward: "1 XP Boost Token",  threshold: 7,    unit: "streak"    },
  { milestone: "30-Day Streak",     description: "30 consecutive workout days", reward: "3 XP Boost Tokens", threshold: 30,   unit: "streak"    },
];

/** Check which milestone rewards have been newly earned. */
export function detectMilestoneRewards(
  ctx: Pick<UnlockContext, "totalWorkouts" | "totalPullups" | "currentStreak">,
  alreadyClaimed: Set<string>
): MilestoneReward[] {
  return MILESTONE_REWARDS.filter((m) => {
    if (alreadyClaimed.has(m.milestone)) return false;
    if (m.unit === "workouts") return ctx.totalWorkouts >= m.threshold;
    if (m.unit === "pullups")  return ctx.totalPullups  >= m.threshold;
    if (m.unit === "streak")   return ctx.currentStreak >= m.threshold;
    return false;
  });
}
