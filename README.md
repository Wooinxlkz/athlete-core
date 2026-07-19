<div align="center">

# Athlete Core

**Production-grade TypeScript library for athlete & gym community platforms.**
**Pull-ups, workouts, exercises, XP, goals, analytics, nutrition, AI coaching, and rewards.**

[![License](https://img.shields.io/badge/license-Source%20Available-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PRs](https://img.shields.io/badge/PRs-closed-lightgrey.svg)](#contributing)

> **Want the full app?** Email [karimsc01t@gmail.com](mailto:karimsc01t@gmail.com)

</div>

---

## What Is This?

The complete engine behind a full-stack **athlete & gym community platform** built around pull-up training and calisthenics. Framework-agnostic TypeScript — no React, no Express, no database — pure business logic you copy into any project.

---

## Systems

| System | What it does |
|---|---|
| **Pull-Ups** | Session recording, personal-best detection, grip-type analysis, volume, rep-max estimation (Epley), weekly progression rate, training recommendations |
| **Workouts** | Session validation, MET-based calorie estimation, intensity classification, weekly volume buckets, rest-day / overtraining detection, muscle-group coverage gaps |
| **Exercises** | 20+ exercise catalogue (pull-up family, push, core, legs, strength), difficulty ratings, muscle-group mapping, equipment tags, calisthenics progression paths, 4 pre-built workout templates |
| **XP & Levels** | Award XP from every action, level 1–1 000 with athlete titles, 2× boost tokens, daily login & weekly streak bonuses |
| **Goals** | Simple, progressive multi-stage, and prerequisite-chained goals; auto-progression from workout & pull-up logs |
| **Analytics** | Workout streaks, personal-best history, weekly summaries, trend detection, moving averages, workout-type distribution |
| **Wellness** | Composite wellness score, 4-factor energy level, mood tracking, breathing exercise configs (Box, 4-7-8, Wim Hof, Resonance) |
| **Journal** | Entry validation, full-text search, tag management, mood-trend series, journaling streak |
| **Nutrition** | BMR/TDEE (Mifflin–St Jeor), macro targets (lose fat / maintain / build muscle), daily log aggregation, food-photo analysis normalisation, hydration targets |
| **AI Coach** | 5 WellBuddy personalities, context-aware prompt builder, OpenRouter API helper, content-safety filter |
| **Rewards** | 15+ achievements, badge tiers (bronze → diamond), milestone rewards that grant XP boost tokens |

---

## Quick Start

> No npm package — copy the `lib/` folder into your project.

```
your-project/
  lib/
    index.ts
    types/
    pullups/      ← pull-up tracking core
    workouts/     ← workout sessions
    exercises/    ← exercise catalogue + templates
    xp/
    goals/
    wellness/
    analytics/
    journal/
    nutrition/
    ai/
    rewards/
```

Zero runtime dependencies — plain TypeScript.

---

## Usage Examples

### Pull-Ups

```typescript
import { pullups } from "./lib";

// Is this a new personal best?
const isPB = pullups.isNewPersonalBest(18, previousRecords);  // true

// Volume stats
const volume = pullups.totalVolume(allRecords);               // 2340 reps
const avgRps = pullups.avgRepsPerSet(todaySession);           // 6.5

// Weekly progression rate
const rate = pullups.calculateProgressionRate(allRecords);
// { repsGainedPerWeek: 0.4, totalGain: 8, weeksTracked: 20, trend: "improving" }

// What to do next session
const plan = pullups.recommendNextSession(18, "strength");
// { targetSets: 5, targetRepsPerSet: 16, restSeconds: 180, focus: "Heavy sets close to max" }

// Grip breakdown
const grips = pullups.gripDistribution(allRecords);
// [{ grip: "overhand", sessions: 30, totalReps: 840, percent: 75 }, ...]
```

### Workouts

```typescript
import { workouts } from "./lib";

// Estimate calories
const kcal = workouts.estimateCaloriesBurned(session, 80);    // 384 kcal

// Intensity label
const intensity = workouts.intensityLabel(session);           // "Hard"

// Should athlete rest today?
const rest = workouts.shouldRestToday(recentWorkouts);
// { restRecommended: true, reason: "3 consecutive training days — recovery needed." }

// Which muscles haven't been hit in 7 days?
const gaps = workouts.untargetedMuscles(workouts, 7);
// ["hamstrings", "calves", "core"]
```

### Exercises

```typescript
import { exercises } from "./lib";

// Find exercises by muscle group
const backExercises = exercises.byMuscle("lats");

// Filter by equipment available
const bodyweightOnly = exercises.byEquipment(["none", "pull_up_bar"]);

// Get progression path for a skill
const path = exercises.progressionPath("one_arm_pullup");
// dead_hang → negative_pullup → pullup → archer_pullup → one_arm_pullup

// Pick a template
const template = exercises.WORKOUT_TEMPLATES.find(t => t.name === "Pull-Up Power");
// { exercises: [{id: "pullup", sets: 5, repsOrSeconds: "3–5 reps @ 85% PB"}, ...] }
```

### XP & Levels

```typescript
import { xp } from "./lib";

const baseXP  = xp.calculatePullupXP({ totalReps: 24, maxReps: 8, sets: 3, personalBest: true });
// 192 XP

const event   = xp.buildXPEvent("pullup_record", baseXP, boostToken);
// { finalAmount: 384, boosted: true, ... }   (2× boost active)

const level   = xp.calculateLevelFromXP(4820);
// { level: 28, title: "Warrior", progressPercent: 17, xpForNextLevel: 252 }
```

### Analytics

```typescript
import { analytics } from "./lib";

const stats = analytics.calculateProgressionStats(workouts, pullupRecords);
// { totalWorkouts: 87, personalBest: 22, streak: { current: 9, longest: 31 } }

const trend = analytics.detectTrend(weekly.map(w => w.maxReps));
// "improving"
```

### Goals (auto-progress from workouts)

```typescript
import { goals } from "./lib";

// Progress all applicable goals from a logged workout
const results = goals.calculateWorkoutProgression(workout, userGoals);

// Progress pull-up goals from a session
const pbResults = goals.calculatePullupProgression(pullupRecord, userGoals);
```

### AI Coach

```typescript
import { ai } from "./lib";

const personality = ai.getPersonality("coach");
const prompt = ai.buildSystemPrompt(personality, {
  username: "Alex", level: 28, personalBest: 18, currentStreak: 9,
});

const safe = ai.checkContentSafety(userMessage);
if (!safe.safe) return safe.safetyMessage;

const response = await ai.sendToOpenRouter(messages, {
  apiKey: process.env.OPENROUTER_API_KEY!,
});
```

---

## API Reference

Full documentation for every function, type, and constant in [`docs/`](./docs/).

| Doc | Contents |
|---|---|
| [Getting Started](./docs/getting-started.md) | Installation, setup, first examples |
| [Pull-Up System](./docs/pullups.md) | PB detection, volume, progression rate, grip analysis |
| [Workout System](./docs/workouts.md) | Validation, calories, intensity, rest-day detection |
| [Exercise System](./docs/exercises.md) | Catalogue, progressions, templates, search |
| [XP System](./docs/xp-system.md) | Level formula, XP sources, boost tokens |
| [Goals System](./docs/goals-system.md) | Goal types, progression, dependencies |
| [Analytics](./docs/analytics.md) | Streaks, summaries, trend detection |
| [Wellness System](./docs/wellness-system.md) | Scoring algorithm, breathing exercises |
| [Journal](./docs/journal.md) | Search, mood trends, streaks |
| [Nutrition](./docs/nutrition.md) | BMR/TDEE, macros, food analysis |
| [AI / WellBuddy](./docs/ai-wellbuddy.md) | Personalities, prompt building, safety |
| [Rewards](./docs/rewards.md) | Achievements, badges, milestones |

---

## TypeScript

All types exported from `lib/types/index.ts`:

```typescript
import type {
  Workout, PullupRecord, Goal, WellnessEntry,
  LevelInfo, Achievement, Exercise
} from "./lib/types";
```

---

## Want the Full App?

This library is the engine. The complete platform includes:

| Feature | |
|---|---|
| React 18 frontend (Vite + Tailwind + shadcn/ui) | ✅ |
| Express + PostgreSQL backend (Drizzle ORM) | ✅ |
| Auth — email, 2FA, 30-day soft-delete recovery | ✅ |
| Community forum & leaderboards | ✅ |
| Wearable sync (Fitbit, Garmin, Apple Health, Google Fit) | ✅ |
| AI food photo analysis (LogMeal API) | ✅ |
| Google Maps integration | ✅ |
| Push notifications + offline mode | ✅ |
| Mini-games (Snake, CodeMaster, Inner Voice) | ✅ |
| Full admin dashboard | ✅ |

📧 **[karimsc01t@gmail.com](mailto:karimsc01t@gmail.com)**

---

## License

Source-available. Free for personal / non-commercial use.
Commercial use requires a license — see [LICENSE](./LICENSE).

---

## Author

**Karim** — [@Wooinxlkz](https://github.com/Wooinxlkz)
