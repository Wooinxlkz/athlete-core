# Goals System

The goals system supports simple targets, progressive multi-stage series, and dependency chains between goals.

## Goal Types

### Simple Goal
A single target with a deadline.
```typescript
{ title: "Run 50km", targetValue: 50, unit: "km", deadline: "2026-12-31" }
```

### Progressive Goal
A series of escalating targets. When one stage is reached, the goal auto-advances.
```typescript
{
  isProgressiveGoal: true,
  progressiveTargets: [10, 25, 50, 100],
  currentTargetIndex: 0,  // currently targeting 10km
  targetValue: 100,       // final target
}
```

### Chained Goal (Prerequisite)
Goal B can only be progressed after Goal A is completed.
```typescript
{ id: 2, prerequisiteGoalId: 1, ... }  // Goal 2 requires Goal 1 first
```

---

## Automatic Progression

When a workout or pull-up session is logged, goals update automatically.

### Workout → Goal mapping

| Goal unit | Workout field used |
|---|---|
| calorie / cal | `caloriesBurned` |
| km | `distance` |
| mile | `distance × 0.621` |
| kg / lb | `weight` |
| minute | `duration` |
| hour | `duration ÷ 60` |
| pose | `posesCount` |
| workout / session | +1 per session |

### Pull-up → Goal mapping

| Goal unit | Pull-up field used |
|---|---|
| rep | `maxReps` |
| set | `sets` |
| pullup / other | `totalReps` |

---

## Goal Priorities & Sorting

Goals are sorted: **active → high priority → medium priority → low priority → deadline**.

---

## API

```typescript
import { goals } from "./lib";

// Validation
goals.validateGoal(partial)                      // → { valid, errors }

// Progress
goals.goalProgressPercent(goal)                  // → 0–100
goals.isGoalComplete(goal)                       // → boolean
goals.daysUntilDeadline(goal)                    // → number (negative = overdue)

// Progressive series
goals.activeTarget(goal)                         // → current target value
goals.advanceProgressiveGoal(goal)               // → updated Goal (immutable)

// Dependencies
goals.prerequisiteMet(goal, allGoals)            // → boolean

// Progression
goals.calculateWorkoutProgression(workout, goals)   // → ProgressionResult[]
goals.calculatePullupProgression(record, goals)     // → ProgressionResult[]

// Utilities
goals.sortGoals(goals)                           // → sorted Goal[]
goals.filterGoalsByCategory(goals, category)     // → Goal[]
```
