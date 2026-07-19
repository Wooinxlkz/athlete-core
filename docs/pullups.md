# Pull-Up Tracking System

The core of the platform. Tracks every pull-up session, detects personal bests, analyses grip variety, and drives training recommendations.

## Session Structure

```typescript
interface PullupRecord {
  id:           number;
  userId:       number;
  workoutId?:   number;
  date:         string;       // YYYY-MM-DD
  maxReps:      number;       // best single-set count
  totalReps:    number;       // sum across all sets
  sets:         number;
  personalBest: boolean;      // auto-set by isNewPersonalBest()
  gripType?:    GripType;
}
```

---

## Grip Types

| ID | Name | Description |
|---|---|---|
| `overhand` | Standard Pull-Up | Pronated — lats & upper back |
| `underhand` | Chin-Up | Supinated — more bicep |
| `neutral` | Neutral / Hammer | Easier on shoulders |
| `wide` | Wide Grip | Max lat stretch |
| `close` | Close Grip | Inner lat & triceps |
| `archer` | Archer | One-arm assist progression |
| `typewriter` | Typewriter | Lateral shift — advanced |
| `mixed` | Mixed | One hand each — grip focus |

---

## Personal Best Detection

```typescript
const isPB = pullups.isNewPersonalBest(newMaxReps, allPreviousRecords);
```

Returns `true` on first-ever session too (empty history = automatic PB).

---

## Volume Metrics

```typescript
pullups.totalVolume(records)           // total reps across all sessions
pullups.avgRepsPerSet(session)         // avg reps per set for one session
pullups.totalSets(records)             // total sets ever logged
pullups.volumeInRange(records, "2026-06-01", "2026-06-30")  // monthly volume
```

---

## Rep-Max Estimation (Epley)

```
Estimated 1RM ≈ maxReps × (1 + sets / 30)
```

Used as a "rep-strength" score for bodyweight tracking:

```typescript
pullups.estimateRepMax(18, 5)  // → 21 (estimated max-effort single)
```

---

## Progression Rate

```typescript
const rate = pullups.calculateProgressionRate(allRecords);
// {
//   repsGainedPerWeek: 0.4,
//   totalGain: 8,          // maxReps first → last session
//   weeksTracked: 20,
//   trend: "improving"     // | "plateauing" | "declining"
// }
```

---

## Training Recommendations

```typescript
const plan = pullups.recommendNextSession(currentPB, goal);
```

| Goal | Sets | Reps | Rest |
|---|---|---|---|
| `strength` | 5 | 85% of PB | 180s |
| `endurance` | 4 | 60% of PB | 60s |
| `volume` | 6 | 70% of PB | 90s |

---

## Session Frequency

```typescript
pullups.sessionsPerWeek(records)  // → 3.2 sessions/week average
```

---

## Grip Distribution

```typescript
pullups.gripDistribution(allRecords)
// [
//   { grip: "overhand",  sessions: 30, totalReps: 840, percent: 75 },
//   { grip: "underhand", sessions: 10, totalReps: 200, percent: 25 },
// ]
```

---

## API

```typescript
import { pullups } from "./lib";

pullups.GRIP_DESCRIPTIONS                              // Record<GripType, string>
pullups.validatePullupRecord(record)                   // → { valid, errors }
pullups.isNewPersonalBest(maxReps, previousRecords)    // → boolean
pullups.totalVolume(records)                           // → number
pullups.avgRepsPerSet(record)                          // → number
pullups.totalSets(records)                             // → number
pullups.volumeInRange(records, from, to)               // → number
pullups.estimateRepMax(maxReps, sets)                  // → number
pullups.calculateProgressionRate(records)              // → ProgressionRate
pullups.sessionsPerWeek(records)                       // → number
pullups.gripDistribution(records)                      // → GripShare[]
pullups.recommendNextSession(currentPB, goal)          // → PullupRecommendation
```
