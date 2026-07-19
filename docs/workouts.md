# Workout System

Covers session validation, calorie estimation, intensity classification, weekly volume tracking, rest-day detection, and muscle-group coverage analysis.

## Workout Types

| Type | Description |
|---|---|
| `pullups` | Calisthenics / pull-up focused |
| `strength` | Weight training |
| `cardio` | Running, cycling, rowing |
| `flexibility` | Yoga, stretching, mobility |
| `mixed` | Combines multiple types |
| `general` | Light / miscellaneous activity |

---

## Calorie Estimation (MET)

Uses Metabolic Equivalent of Task values × body weight × duration.

```typescript
workouts.estimateCaloriesBurned(session, 80)  // → 384 kcal
```

| Type | MET |
|---|---|
| pullups | 8.0 |
| strength | 6.0 |
| cardio | 7.5 |
| flexibility | 2.5 |
| mixed | 7.0 |
| general | 5.0 |

---

## Intensity Classification

```typescript
workouts.intensityLabel(session)  // → "Light" | "Moderate" | "Hard"
```

Score factors: workout type, duration, weight, distance.

---

## Session Summary

```typescript
workouts.summariseWorkout(session, bodyWeightKg?)
// {
//   date: "2026-07-19",
//   type: "strength",
//   exerciseCount: 4,
//   duration: 50,
//   estimatedCalories: 384,
//   primaryMuscles: ["back", "lats"],
//   intensityLabel: "Hard"
// }
```

---

## Weekly Volume

```typescript
workouts.weeklyVolume(allWorkouts, 8)
// [
//   { weekStart: "2026-05-25", sessions: 4, totalMinutes: 180, byType: { pullups: 2, strength: 2 } },
//   ...
// ]
```

---

## Rest-Day Detection

```typescript
workouts.shouldRestToday(recentWorkouts)
// { restRecommended: true, reason: "3 consecutive training days — recovery needed." }
```

Rules:
- ≥ 3 consecutive training days → rest
- 2+ hard sessions in last 3 days → rest

---

## Muscle Group Coverage

```typescript
// Which muscles haven't been targeted in 7 days?
workouts.untargetedMuscles(allWorkouts, 7)
// ["hamstrings", "calves", "core"]
```

All 13 muscle groups tracked: chest, back, shoulders, biceps, triceps, forearms, core, glutes, quads, hamstrings, calves, lats, traps.

---

## API

```typescript
import { workouts } from "./lib";

workouts.validateWorkout(session)                     // → { valid, errors }
workouts.estimateCaloriesBurned(session, weightKg)   // → number
workouts.intensityLabel(session)                      // → "Light" | "Moderate" | "Hard"
workouts.summariseWorkout(session, weightKg?)         // → WorkoutSummary
workouts.weeklyVolume(workouts, weeksBack?)           // → WeeklyVolume[]
workouts.shouldRestToday(workouts)                    // → { restRecommended, reason? }
workouts.untargetedMuscles(workouts, days?)           // → MuscleGroup[]
workouts.sortByDate(workouts)                         // → Workout[]
workouts.filterByType(workouts, type)                 // → Workout[]
workouts.filterByDateRange(workouts, from, to)        // → Workout[]
workouts.MUSCLE_GROUPS                                // readonly string[]
```
