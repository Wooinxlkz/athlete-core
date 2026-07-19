# Rewards & Achievements System

15 predefined achievements across 4 categories, plus 7 milestone rewards that grant XP boost tokens.

## Achievement Categories

| Category | Description |
|---|---|
| `fitness` | Pull-up and workout milestones |
| `consistency` | Streak-based achievements |
| `milestone` | Level and goal count milestones |
| `nutrition` | (extensible — add your own) |

---

## Built-in Achievements

| ID | Title | Trigger | XP Reward |
|---|---|---|---|
| `first_pullup` | First Pull-up | 1 total pull-up rep | 50 |
| `century_pullups` | Century Club | 100 total pull-up reps | 150 |
| `thousand_pullups` | Pull-up Warrior | 1 000 total pull-up reps | 500 |
| `first_workout` | First Step | 1 workout | 30 |
| `ten_workouts` | Ten Strong | 10 workouts | 100 |
| `fifty_workouts` | Dedicated Athlete | 50 workouts | 300 |
| `hundred_workouts` | Century Athlete | 100 workouts | 600 |
| `week_streak` | Week Warrior | 7-day streak | 200 |
| `month_streak` | Iron Consistency | 30-day streak | 700 |
| `first_goal` | Goal Setter | 1 completed goal | 75 |
| `five_goals` | Achiever | 5 completed goals | 250 |
| `level_10` | Level 10 Reached | Level 10 | 0 |
| `level_50` | Level 50 Legend | Level 50 | 0 |
| `level_100` | Titan | Level 100 | 0 |

---

## Badge Tiers

| XP Reward | Tier | Colour |
|---|---|---|
| 0–49 | Bronze | #cd7f32 |
| 50–99 | Silver | #c0c0c0 |
| 100–249 | Gold | #ffd700 |
| 250–499 | Platinum | #e5e4e2 |
| 500+ | Diamond | #b9f2ff |

---

## Milestone Rewards (Boost Tokens)

| Milestone | Threshold | Reward |
|---|---|---|
| 10 Workouts | 10 sessions | 1 XP Boost Token |
| 50 Workouts | 50 sessions | 2 XP Boost Tokens |
| 100 Workouts | 100 sessions | 3 XP Boost Tokens |
| 500 Pull-up Reps | 500 reps | 1 XP Boost Token |
| 1 000 Pull-up Reps | 1 000 reps | 2 XP Boost Tokens |
| 7-Day Streak | 7 days | 1 XP Boost Token |
| 30-Day Streak | 30 days | 3 XP Boost Tokens |

---

## API

```typescript
import { rewards } from "./lib";

rewards.ACHIEVEMENTS                                          // Achievement[]
rewards.detectNewUnlocks(ctx, alreadyUnlocked)               // → Achievement[]
rewards.achievementTier(xpReward)                            // → BadgeTier
rewards.BADGE_TIER_COLORS                                    // Record<BadgeTier, string>
rewards.MILESTONE_REWARDS                                    // MilestoneReward[]
rewards.detectMilestoneRewards(ctx, alreadyClaimed)          // → MilestoneReward[]
```
