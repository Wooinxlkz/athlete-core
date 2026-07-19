# Exercise System

A structured exercise catalogue with 20+ entries, calisthenics progression paths, workout templates, and flexible search / filtering.

## Exercise Categories

| Category | Examples |
|---|---|
| `calisthenics` | Pull-up, muscle-up, L-sit, pistol squat |
| `strength` | Deadlift, barbell row |
| `cardio` | Running, rowing |
| `flexibility` | Stretching, yoga |
| `olympic` | Clean & jerk, snatch |
| `plyometric` | Box jumps, clap push-ups |
| `rehabilitation` | Rotator cuff work, mobility |

## Difficulty Levels

`beginner` → `intermediate` → `advanced` → `elite`

---

## Pull-Up Family (full progression)

```
dead_hang → negative_pullup → chinup → pullup → archer_pullup → one_arm_pullup
                                             ↘ muscle_up
```

---

## Exercise Structure

```typescript
interface Exercise {
  id:               string;
  name:             string;
  category:         ExerciseCategory;
  primaryMuscles:   MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment:        Equipment[];
  difficulty:       Difficulty;
  description:      string;
  coachingCues:     string[];
  progressions?:    string[];   // harder next steps
  regressions?:     string[];   // easier fall-backs
}
```

---

## Search & Filtering

```typescript
exercises.searchExercises("pull")          // partial name/description match
exercises.byCategory("calisthenics")       // all calisthenics exercises
exercises.byDifficulty("advanced")         // advanced only
exercises.byMuscle("lats")                 // primary or secondary
exercises.byEquipment(["none", "pull_up_bar"])  // bodyweight + bar only
```

---

## Progression Paths

```typescript
const path = exercises.progressionPath("one_arm_pullup");
// [
//   { exercise: "Dead Hang",       difficulty: "beginner",      nextStep: "negative_pullup" },
//   { exercise: "Negative Pull-Up",difficulty: "beginner",      nextStep: "pullup" },
//   { exercise: "Pull-Up",         difficulty: "intermediate",  nextStep: "archer_pullup" },
//   { exercise: "Archer Pull-Up",  difficulty: "advanced",      nextStep: "one_arm_pullup" },
//   { exercise: "One-Arm Pull-Up", difficulty: "elite" },
// ]
```

---

## Built-in Workout Templates

| Template | Focus | Est. Time |
|---|---|---|
| Pull-Up Power | Maximal strength (85% PB × 5 sets) | 35 min |
| Pull-Up Volume | Hypertrophy (sub-max × 6 sets) | 45 min |
| Beginner Calisthenics | Foundation for first pull-up | 30 min |
| Advanced Athlete | Muscle-up progressions + L-sit | 50 min |

```typescript
exercises.WORKOUT_TEMPLATES
// [{ name, focus, exercises: [{id, sets, repsOrSeconds}], estimatedMinutes }]
```

---

## API

```typescript
import { exercises } from "./lib";

exercises.EXERCISES                               // Exercise[] — full catalogue
exercises.getExercise(id)                         // → Exercise | undefined
exercises.searchExercises(query)                  // → Exercise[]
exercises.byCategory(category)                    // → Exercise[]
exercises.byDifficulty(difficulty)                // → Exercise[]
exercises.byEquipment(availableEquipment)         // → Exercise[]
exercises.byMuscle(muscle)                        // → Exercise[]
exercises.progressionPath(exerciseId)             // → ProgressionPath[]
exercises.WORKOUT_TEMPLATES                       // WorkoutTemplate[]
```
