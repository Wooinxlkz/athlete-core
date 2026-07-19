# Changelog

All notable changes to Athlete Core are documented here.

---

## [1.0.0] — 2026-07-19

### Initial public library release

#### Added

**`lib/pullups`** *(new system)*
- `validatePullupRecord(record)` — date, sets, reps, consistency checks
- `isNewPersonalBest(maxReps, previousRecords)` — PB detection
- `totalVolume(records)` — total reps across all sessions
- `avgRepsPerSet(session)` — average reps per set
- `totalSets(records)` — aggregate set count
- `volumeInRange(records, from, to)` — date-filtered volume
- `estimateRepMax(maxReps, sets)` — Epley formula rep-strength score
- `calculateProgressionRate(records)` — weekly gain, total gain, trend
- `sessionsPerWeek(records)` — average session frequency
- `gripDistribution(records)` — session/rep breakdown by grip type
- `recommendNextSession(currentPB, goal)` — strength / endurance / volume plans
- `GRIP_DESCRIPTIONS` — 8 grip types with coaching notes

**`lib/workouts`** *(new system)*
- `validateWorkout(session)` — required fields + value sanity checks
- `estimateCaloriesBurned(session, weightKg)` — MET × weight × duration
- `intensityLabel(session)` — Light / Moderate / Hard classification
- `summariseWorkout(session, weightKg?)` — full summary card
- `weeklyVolume(workouts, weeksBack)` — weekly buckets with type breakdown
- `shouldRestToday(workouts)` — consecutive-day + overtraining detection
- `untargetedMuscles(workouts, days)` — coverage gap detection
- `sortByDate` / `filterByType` / `filterByDateRange` — query helpers
- `MUSCLE_GROUPS` — 13 tracked muscle groups

**`lib/exercises`** *(new system)*
- 20+ exercises: pull-up family (dead hang → one-arm), push, core, legs, strength
- `getExercise(id)` / `searchExercises(query)` — lookup & search
- `byCategory` / `byDifficulty` / `byEquipment` / `byMuscle` — filters
- `progressionPath(id)` — full regression → progression chain
- `WORKOUT_TEMPLATES` — 4 pre-built templates (Power, Volume, Beginner, Advanced)
- `GRIP_DESCRIPTIONS` per exercise, coaching cues on every entry

**`lib/xp`**
- `calculateWorkoutXP` / `calculatePullupXP` / `calculateGoalCompletionXP`
- `calculateWellnessXP` / `calculateJournalXP` / `calculateDailyLoginXP`
- `calculateWeeklyStreakXP(weeks)` — milestone bonuses at 1, 4, 8, 12, 26, 52 weeks
- `calculateLevelFromXP(totalXP)` — levels 1–1 000, exponential cap at 100, flat above
- `getLevelTitle(level)` — 17 athlete title milestones
- `applyBoost` / `buildXPEvent` / `canActivateBoost` / `sumDailyXP`

**`lib/goals`**
- `validateGoal` / `goalProgressPercent` / `isGoalComplete` / `daysUntilDeadline`
- `activeTarget` / `advanceProgressiveGoal` — progressive goal series
- `prerequisiteMet(goal, allGoals)` — dependency resolution
- `calculateWorkoutProgression` / `calculatePullupProgression` — auto-progression
- `sortGoals` / `filterGoalsByCategory`

**`lib/wellness`**
- `calculateWellnessScore` / `calculateEnergyLevel` / `calculateWellnessStats`
- `BREATHING_EXERCISES` — Box, 4-7-8, Wim Hof, Resonance
- `getBreathingExercise` / `moodLabel` / `wellnessColor`

**`lib/analytics`**
- `calculateStreak` / `calculateProgressionStats`
- `getPersonalBest` / `getPersonalBestHistory`
- `buildWeeklySummaries` / `detectTrend` / `movingAverage`
- `workoutTypeDistribution`

**`lib/journal`**
- `validateJournalEntry` / `allTags` / `filterByTags` / `searchEntries`
- `sortByDate` / `sortByMood` / `buildMoodTrend`
- `wordCount` / `readingTimeMinutes` / `journalStreak`

**`lib/nutrition`**
- `calculateBMR` / `calculateTDEE` / `recommendedMacros`
- `aggregateDailyLog` / `macroProgress`
- `normaliseFoodAnalysis` / `recommendedWaterMl`

**`lib/ai`**
- 5 personalities: Coach, Mentor, Analyst, Friend, Drill Sergeant
- `getPersonality` / `buildSystemPrompt` / `checkContentSafety`
- `sendToOpenRouter` / `trimConversation`

**`lib/rewards`**
- 15 achievements across fitness, consistency, goal, and milestone categories
- `detectNewUnlocks` / `achievementTier` / `BADGE_TIER_COLORS`
- 7 milestone rewards with boost-token grants
- `detectMilestoneRewards`
