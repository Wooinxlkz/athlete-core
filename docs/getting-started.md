# Getting Started

## Installation

WellBuddy Core is distributed as source — there is no npm package.

1. Download or clone this repository.
2. Copy the `lib/` folder into your project.
3. Import from `./lib` (or wherever you placed it).

```
your-project/
├── lib/
│   ├── index.ts
│   ├── types/
│   ├── xp/
│   ├── goals/
│   ├── wellness/
│   ├── analytics/
│   ├── journal/
│   ├── nutrition/
│   ├── ai/
│   └── rewards/
└── your-code.ts
```

---

## Requirements

- **TypeScript 5.x** (strict mode recommended)
- **Node.js 18+** (or any runtime with `fetch` — for the AI module only)
- Zero runtime dependencies

---

## Basic Setup

```typescript
// Import the whole library
import * as WellBuddy from "./lib";

// Or import specific systems
import { xp, goals, wellness, analytics } from "./lib";

// Or import types only
import type { Workout, Goal, WellnessEntry } from "./lib/types";
```

---

## Minimal Example — Award XP for a Workout

```typescript
import { xp } from "./lib";
import type { Workout } from "./lib/types";

const workout: Workout = {
  id: 1,
  userId: 42,
  date: "2026-07-19",
  type: "strength",
  exercises: ["bench press", "squat"],
  duration: 50,
  weight: 80,
};

const baseXP = xp.calculateWorkoutXP(workout);   // 204

const noBoost = { active: false, multiplier: 2, tokensRemaining: 1 };
const event   = xp.buildXPEvent("workout", baseXP, noBoost);
// { source: "workout", amount: 204, boosted: false, finalAmount: 204, timestamp: Date }

const levelInfo = xp.calculateLevelFromXP(5000 + event.finalAmount);
// { level: 34, xpInCurrentLevel: ..., progressPercent: ..., title: "Fighter" }

console.log(`+${event.finalAmount} XP → Level ${levelInfo.level} ${levelInfo.title}`);
```

---

## Minimal Example — Check for New Achievements

```typescript
import { rewards, analytics } from "./lib";

const stats = analytics.calculateProgressionStats(allWorkouts, allPullupRecords);

const ctx = {
  totalPullups:   stats.totalPullups,
  totalWorkouts:  stats.totalWorkouts,
  completedGoals: user.completedGoals,
  currentStreak:  stats.streak.current,
  currentLevel:   user.currentLevel,
  totalXP:        user.totalXP,
};

const newAchievements = rewards.detectNewUnlocks(ctx, new Set(user.achievementIds));
for (const a of newAchievements) {
  console.log(`🏆 Unlocked: ${a.title} (+${a.xpReward} XP)`);
}
```

---

## Minimal Example — WellBuddy AI Chat

```typescript
import { ai } from "./lib";

const personality = ai.getPersonality("coach");
const system      = ai.buildSystemPrompt(personality, {
  username: "Alex",
  level: 28,
  personalBest: 18,
});

const history = [{ role: "system" as const, content: system }];

async function chat(userMessage: string) {
  const safe = ai.checkContentSafety(userMessage);
  if (!safe.safe) return safe.safetyMessage;

  history.push({ role: "user", content: userMessage });

  const response = await ai.sendToOpenRouter(ai.trimConversation(history), {
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  history.push({ role: "assistant", content: response.message });
  return response.message;
}
```

---

## TypeScript Configuration

Recommended `tsconfig.json` settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true
  }
}
```

---

## Want the Full App?

The library is the engine. For the complete React + Express + PostgreSQL platform, email **[karimsc01t@gmail.com](mailto:karimsc01t@gmail.com)**.
