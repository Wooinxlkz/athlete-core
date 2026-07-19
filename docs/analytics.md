# Analytics System

Provides streak tracking, personal-best records, weekly summaries, and trend analysis over historical data.

## Streak Calculation

A streak is a run of consecutive calendar days with at least one workout logged.

- **Current streak:** resets to 0 if last workout was before yesterday
- **Longest streak:** all-time maximum consecutive days
- Only unique dates are counted (multiple workouts per day = 1 streak day)

---

## Weekly Summaries

Splits workout and wellness data into weekly buckets. Each bucket includes:

| Field | Description |
|---|---|
| `weekStart` | ISO date of week start |
| `workouts` | Sessions logged that week |
| `totalPullups` | Total pull-up reps |
| `maxReps` | Best single-set rep count |
| `totalDuration` | Total minutes trained |
| `averageMood` | Mean mood score (if wellness entries exist) |
| `averageEnergy` | Mean energy score |

---

## Trend Detection

```
trend = compare(avg of second half) vs (avg of first half)
  > +5%  → "improving"
  < −5%  → "declining"
  else   → "stable"
```

Works on any numeric series: pull-up reps, mood scores, workout count, etc.

---

## Moving Average

3-period (configurable) moving average for chart smoothing.

```typescript
analytics.movingAverage([8, 10, 7, 12, 9, 11], 3)
// → [8, 9, 8.3, 9.7, 9.3, 10.7]
```

---

## Workout Type Distribution

```typescript
analytics.workoutTypeDistribution(workouts)
// → [{ type: "strength", count: 24, percent: 48 }, ...]
```

---

## API

```typescript
import { analytics } from "./lib";

analytics.calculateStreak(workouts)                              // → WorkoutStreak
analytics.calculateProgressionStats(workouts, pullups)          // → ProgressionStats
analytics.getPersonalBest(records)                              // → PullupRecord | undefined
analytics.getPersonalBestHistory(records)                       // → PullupRecord[]
analytics.buildWeeklySummaries(workouts, pullups, wellness, 8)  // → WeeklySummary[]
analytics.detectTrend(values, threshold?)                       // → Trend
analytics.movingAverage(values, window?)                        // → number[]
analytics.workoutTypeDistribution(workouts)                     // → WorkoutTypeShare[]
```
