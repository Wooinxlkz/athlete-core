# Wellness System

The wellness system combines mental health self-reporting, physical activity data, and sleep tracking into actionable scores and energy levels.

## Wellness Score (1–10)

A composite score derived from a single check-in entry.

```
score = mentalAvg × 0.4 + mood × 0.2 + energy × 0.2 + stressInverted × 0.2

mentalAvg    = avg(relationships, stressManagement, selfConfidence,
                   emotionalBalance, mentalResilience, focusClarity)
stressInverted = 11 − stress   (10 = calm, 1 = overwhelmed)
```

All input values are on a 1–10 scale.

---

## Energy Level (1–10)

Computed from four weighted factors:

| Factor | Weight | Data source |
|---|---|---|
| Sleep quality | 25% | `sleepHours` field |
| Mental wellness avg | 30% | 6 mental metrics |
| Recent workout impact | 25% | Workouts in last 3 days |
| Recent pull-up impact | 20% | Pull-up records in last 3 days |

### Sleep contribution
| Hours | Δ score |
|---|---|
| ≥8 | +1.5 |
| ≥7 | +1.0 |
| ≥6 | +0.5 |
| <5 | −2.0 |
| 5–6 | −1.0 |

---

## Breathing Exercises

Four techniques are built in, each with phases, rounds, and an XP reward.

| ID | Name | Pattern | Rounds | XP |
|---|---|---|---|---|
| `box_breathing` | Box Breathing | 4-4-4-4 | 4 | 5 |
| `4_7_8` | 4-7-8 Breathing | 4-7-8 | 4 | 5 |
| `wim_hof` | Wim Hof Method | 30 breaths + hold + recovery | 3 | 10 |
| `resonance` | Resonance Breathing | 5-6 (5.5 breaths/min) | 10 | 8 |

---

## Mood Labels

| Score | Label |
|---|---|
| 1–2 | Very Low |
| 3–4 | Low |
| 5–6 | Moderate |
| 7–8 | Good |
| 9–10 | Excellent |

---

## API

```typescript
import { wellness } from "./lib";

wellness.calculateWellnessScore(entry)                           // → number 1–10
wellness.calculateEnergyLevel(workouts, pullups, entry)          // → number 1–10
wellness.calculateWellnessStats(entries, workouts, pullups)      // → WellnessStats
wellness.BREATHING_EXERCISES                                     // BreathingExercise[]
wellness.getBreathingExercise("box_breathing")                   // → BreathingExercise
wellness.moodLabel(value)                                        // → string
wellness.wellnessColor(score)                                    // → "#hex"
```
