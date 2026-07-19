# XP System

The XP system powers all gamification in WellBuddy. Every action earns XP; accumulated XP determines level and unlocks titles.

## Level Progression

### Formula

```
Levels 1–100:  XP required = floor(5 × level^1.5)
Levels 101+:   XP required = 1 000 per level (flat)
Total cap:     Level 1 000
```

### Level Titles

| Level | Title |
|---|---|
| 0 | Newcomer |
| 1 | Beginner |
| 5 | Apprentice |
| 10 | Trainee |
| 15 | Athlete |
| 20 | Competitor |
| 25 | Challenger |
| 30 | Warrior |
| 35 | Fighter |
| 40 | Champion |
| 45 | Expert |
| 50 | Master |
| 60 | Grandmaster |
| 70 | Elite |
| 80 | Legend |
| 90 | Mythic |
| 100 | Titan |

### Example Breakpoints

| Level | XP to reach |
|---|---|
| 1 | 5 |
| 5 | 56 |
| 10 | 158 |
| 20 | 447 |
| 50 | 1 768 |
| 100 | 5 000 |
| 101+ | +1 000 each |

---

## XP Sources

### Workout

```
base(50) + duration_minutes × 2 + type_bonus + component_bonus
```

| Type | Bonus |
|---|---|
| mixed | +40 |
| strength | +30 |
| cardio | +20 |
| flexibility | +15 |

| Component | Bonus |
|---|---|
| distance (km) | +1 per km |
| weight (kg) | +0.3 per kg |
| poses | +2 per pose |

**Example:** 45-min strength, 80 kg → 50 + 90 + 30 + 24 = **194 XP**

---

### Pull-up Record

```
30 + totalReps × 3 + maxReps × 5 + (personalBest ? 50 : 0)
```

**Example:** 24 total, 8 max, personal best → 30 + 72 + 40 + 50 = **192 XP**

---

### Goal Completion

```
unit_base_XP + min(floor(targetValue / 10), 50)
```

| Unit | Base XP |
|---|---|
| week / month | 100 |
| day | 75 |
| km / mile | 70 |
| minute / hour | 65 |
| calorie | 60 |
| rep / set | 50 |
| other | 55 |

---

### Other Sources

| Source | XP |
|---|---|
| Wellness check-in | 20 |
| Journal entry | 10 |
| Daily login | 5 |
| Weekly streak (1 week) | 50 |
| Weekly streak (4 weeks) | 100 |
| Weekly streak (8 weeks) | 150 |
| Weekly streak (12 weeks) | 200 |
| Weekly streak (26 weeks) | 300 |
| Weekly streak (52 weeks) | 500 |

---

## XP Boost Tokens

- Maximum 3 tokens banked at a time
- Activating a token applies a **2× multiplier** to all XP for the boost duration
- Only one boost can be active at a time
- Tokens are earned through milestone rewards (see [Rewards](./rewards.md))

---

## API

```typescript
import { xp } from "./lib";

xp.calculateWorkoutXP(workout)
xp.calculatePullupXP(record)
xp.calculateGoalCompletionXP(goal)
xp.calculateWellnessXP()
xp.calculateJournalXP()
xp.calculateDailyLoginXP()
xp.calculateWeeklyStreakXP(streakWeeks)
xp.calculateLevelFromXP(totalXP)   // → LevelInfo
xp.getLevelTitle(level)
xp.applyBoost(baseXP, boost)
xp.buildXPEvent(source, amount, boost)
xp.canActivateBoost(boost)
xp.sumDailyXP(events)
```
