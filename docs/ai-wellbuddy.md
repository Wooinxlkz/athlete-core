# AI / WellBuddy System

WellBuddy is the AI coaching companion. The library provides personality definitions, context-aware prompt construction, content safety filtering, and a ready-to-use OpenRouter API helper.

## Personalities

Five built-in archetypes:

| ID | Name | Tone | Best for |
|---|---|---|---|
| `coach` | Coach | Motivational | Goal-crushing, high energy |
| `mentor` | Mentor | Supportive | Beginners, mental health |
| `analyst` | Analyst | Analytical | Data-driven users |
| `friend` | Friend | Friendly | Casual daily check-ins |
| `drill` | Drill Sergeant | Strict | Accountability, no excuses |

---

## System Prompt

```typescript
const personality = ai.getPersonality("mentor");

const prompt = ai.buildSystemPrompt(personality, {
  username: "Alex",
  level: 28,
  totalXP: 4820,
  recentWorkouts: 12,
  personalBest: 18,
  currentStreak: 9,
  wellnessScore: 7.4,
});
```

The prompt injects a user-context block so the AI gives personalised, data-aware responses.

---

## Content Safety

Before sending any user message to the AI, run it through the safety filter:

```typescript
const check = ai.checkContentSafety(userMessage);
if (!check.safe) {
  // Show check.safetyMessage to the user instead of calling the AI
  return check.safetyMessage;
}
```

Blocked patterns include: self-harm, eating-disorder language, and illegal substance references. If triggered, crisis resources are returned automatically.

---

## OpenRouter Integration

```typescript
const messages: AIMessage[] = [
  { role: "system",    content: systemPrompt },
  { role: "user",      content: "How do I increase my pull-up max?" },
];

const response = await ai.sendToOpenRouter(messages, {
  apiKey: process.env.OPENROUTER_API_KEY,
  model: "openai/gpt-4o-mini",   // default
  maxTokens: 1024,               // default
  temperature: 0.75,             // default
});

console.log(response.message, response.tokensUsed);
```

---

## Conversation History

Keep conversations within token limits by trimming older messages (system message is always preserved):

```typescript
const trimmed = ai.trimConversation(fullHistory, 20);
```

---

## Supported Models (via OpenRouter)

Any model on [openrouter.ai](https://openrouter.ai/models) works. Recommended:

| Model | Best for |
|---|---|
| `openai/gpt-4o-mini` | Speed + cost balance (default) |
| `openai/gpt-4o` | Highest quality |
| `anthropic/claude-3.5-sonnet` | Long conversations, nuance |
| `meta-llama/llama-3.1-70b-instruct` | Open-source option |

---

## API

```typescript
import { ai } from "./lib";

ai.WELLBUDDY_PERSONALITIES                          // WellBuddyPersonality[]
ai.getPersonality(id)                              // → WellBuddyPersonality
ai.buildSystemPrompt(personality, ctx?)            // → string
ai.checkContentSafety(input)                       // → { safe, safetyMessage? }
ai.sendToOpenRouter(messages, config)              // → Promise<AIResponse>
ai.trimConversation(messages, maxMessages?)        // → AIMessage[]
```
