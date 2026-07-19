# Nutrition System

Covers BMR/TDEE calculation, macro target generation, daily log aggregation, food-analysis normalisation, and hydration recommendations.

## BMR (Mifflin–St Jeor)

```
male:   BMR = 10W + 6.25H − 5A + 5
female: BMR = 10W + 6.25H − 5A − 161

W = weight (kg), H = height (cm), A = age (years)
```

```typescript
const bmr = nutrition.calculateBMR(80, 180, 25, "male"); // → 1905 kcal
```

---

## TDEE

```
TDEE = BMR × activity_multiplier
```

| Activity level | Multiplier |
|---|---|
| sedentary | 1.2 |
| lightly_active | 1.375 |
| moderately_active | 1.55 |
| very_active | 1.725 |
| extra_active | 1.9 |

---

## Macro Targets

```typescript
const tdee   = nutrition.calculateTDEE(bmr, "moderately_active"); // 2953
const macros = nutrition.recommendedMacros(tdee, "build_muscle");
// { dailyCalories: 3248, dailyProtein: 284g, dailyFat: 90g, dailyCarbs: 325g }
```

| Goal | Calorie adjust | Protein | Fat | Carbs |
|---|---|---|---|---|
| lose_fat | −20% | 35% | 30% | 35% |
| maintain | none | 30% | 30% | 40% |
| build_muscle | +10% | 35% | 25% | 40% |

*(Protein & fat computed at 4 kcal/g and 9 kcal/g respectively)*

---

## Daily Log Aggregation

```typescript
const summary = nutrition.aggregateDailyLog(todayLogs, "2026-07-19");
// { totalCalories: 2100, totalProtein: 180, totalCarbs: 240, totalFat: 70, mealCount: 4 }

const progress = nutrition.macroProgress(summary, userGoals);
// { calories: { consumed: 2100, goal: 3248, percent: 65 }, protein: {...}, ... }
```

---

## Food Analysis (LogMeal API)

Normalise raw API responses into a standard format:

```typescript
const result = nutrition.normaliseFoodAnalysis(rawApiResponse);
// { foodName: "Chicken breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, confidence: 0.94 }
```

---

## Hydration

```typescript
const water = nutrition.recommendedWaterMl(80, "moderately_active"); // → 3140 ml
```

---

## API

```typescript
import { nutrition } from "./lib";

nutrition.calculateBMR(weightKg, heightCm, ageYears, sex)   // → number (kcal)
nutrition.calculateTDEE(bmr, activityLevel)                  // → number (kcal)
nutrition.recommendedMacros(tdee, fitnessGoal)               // → NutritionGoals
nutrition.aggregateDailyLog(logs, date)                      // → DailyNutritionSummary
nutrition.macroProgress(summary, goals)                      // → MacroProgress
nutrition.normaliseFoodAnalysis(rawResponse)                 // → FoodAnalysisResult | null
nutrition.recommendedWaterMl(weightKg, activityLevel)        // → number (ml)
```
