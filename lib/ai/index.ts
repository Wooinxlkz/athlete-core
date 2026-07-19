/**
 * WellBuddy Core — AI & WellBuddy System
 *
 * WellBuddy personality definitions, prompt construction,
 * content-safety filtering, and OpenRouter API integration helpers.
 */

import type { WellBuddyPersonality, AIMessage, AIResponse } from "../types";

// ─── Personality Definitions ──────────────────────────────────────────────────

export const WELLBUDDY_PERSONALITIES: WellBuddyPersonality[] = [
  {
    id: "coach",
    name: "Coach",
    tone: "motivational",
    systemPrompt: `You are WellBuddy Coach — a high-energy, results-focused fitness and wellness coach.
You push users to exceed their limits while keeping safety and recovery in mind.
Keep responses concise, action-oriented, and inspiring. Use second person ("you / your").`,
  },
  {
    id: "mentor",
    name: "Mentor",
    tone: "supportive",
    systemPrompt: `You are WellBuddy Mentor — a calm, experienced guide who meets users where they are.
You celebrate small wins, validate struggles, and offer sustainable, science-backed advice.
Speak warmly and never make the user feel judged.`,
  },
  {
    id: "analyst",
    name: "Analyst",
    tone: "analytical",
    systemPrompt: `You are WellBuddy Analyst — a data-driven performance specialist.
When given workout or health data, provide specific numerical insights, patterns, and optimisations.
Be precise, cite reasoning, and avoid generic advice.`,
  },
  {
    id: "friend",
    name: "Friend",
    tone: "friendly",
    systemPrompt: `You are WellBuddy Friend — a casual, supportive companion who genuinely cares.
Chat naturally, be empathetic, and keep the conversation light-hearted while still being helpful.
Avoid jargon; speak like a knowledgeable friend, not a professional.`,
  },
  {
    id: "drill",
    name: "Drill Sergeant",
    tone: "strict",
    systemPrompt: `You are WellBuddy Drill Sergeant — no excuses, no shortcuts.
Hold users fully accountable, challenge every reason not to train, and celebrate only earned results.
Keep it intense and short. Never coddle.`,
  },
];

/** Get a WellBuddy personality by ID, falling back to "coach". */
export function getPersonality(id: string): WellBuddyPersonality {
  return (
    WELLBUDDY_PERSONALITIES.find((p) => p.id === id) ??
    WELLBUDDY_PERSONALITIES[0]
  );
}

// ─── Prompt Construction ──────────────────────────────────────────────────────

export interface UserContext {
  username?: string;
  level?: number;
  totalXP?: number;
  recentWorkouts?: number;
  personalBest?: number;
  currentStreak?: number;
  wellnessScore?: number;
}

/**
 * Build a system prompt for WellBuddy, injecting user context
 * so the AI can give personalised responses.
 */
export function buildSystemPrompt(
  personality: WellBuddyPersonality,
  ctx: UserContext = {}
): string {
  const contextLines: string[] = [];

  if (ctx.username)       contextLines.push(`User: ${ctx.username}`);
  if (ctx.level !== undefined) contextLines.push(`Level: ${ctx.level}`);
  if (ctx.totalXP !== undefined) contextLines.push(`Total XP: ${ctx.totalXP}`);
  if (ctx.recentWorkouts !== undefined) contextLines.push(`Workouts (last 30 days): ${ctx.recentWorkouts}`);
  if (ctx.personalBest !== undefined)   contextLines.push(`Pull-up PB: ${ctx.personalBest} reps`);
  if (ctx.currentStreak !== undefined)  contextLines.push(`Current streak: ${ctx.currentStreak} days`);
  if (ctx.wellnessScore !== undefined)  contextLines.push(`Wellness score: ${ctx.wellnessScore}/10`);

  const ctxBlock =
    contextLines.length > 0
      ? `\n\n--- User Context ---\n${contextLines.join("\n")}\n---`
      : "";

  return `${personality.systemPrompt}${ctxBlock}

Always stay in character. Never reveal you are an AI unless directly asked.
Keep responses under 300 words unless a detailed breakdown is explicitly requested.`;
}

// ─── Content Safety ───────────────────────────────────────────────────────────

const BLOCKED_PATTERNS = [
  /\b(suicide|self.?harm|kill (my)?self)\b/i,
  /\b(anorexia|starv(e|ing)|binge.?purg)\b/i,
  /\b(steroid|illegal (drug|substance))\b/i,
];

const CRISIS_RESOURCES = `If you're struggling, please reach out:
• Crisis Text Line: Text HOME to 741741
• National Suicide Prevention Lifeline: 988 (US)
• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/`;

/**
 * Scan user input for content that should trigger a safety response.
 * Returns { safe: true } or { safe: false, safetyMessage: string }.
 */
export function checkContentSafety(input: string): {
  safe: boolean;
  safetyMessage?: string;
} {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(input)) {
      return {
        safe: false,
        safetyMessage: `I noticed something in your message that concerns me. ${CRISIS_RESOURCES}`,
      };
    }
  }
  return { safe: true };
}

// ─── OpenRouter Integration Helper ────────────────────────────────────────────

export interface OpenRouterConfig {
  apiKey: string;
  model?: string;               // default: "openai/gpt-4o-mini"
  maxTokens?: number;           // default: 1024
  temperature?: number;         // default: 0.75
}

/**
 * Send a conversation to OpenRouter and return the assistant's reply.
 * Works in any Node.js/Deno/browser environment that has fetch.
 *
 * @throws Error if the request fails or the API returns an error.
 */
export async function sendToOpenRouter(
  messages: AIMessage[],
  config: OpenRouterConfig
): Promise<AIResponse> {
  const {
    apiKey,
    model = "openai/gpt-4o-mini",
    maxTokens = 1024,
    temperature = 0.75,
  } = config;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/Wooinxlkz/wellbuddy-core",
    },
    body: JSON.stringify({
      model,
      messages: messages.map(({ role, content }) => ({ role, content })),
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content ?? "";
  return {
    message,
    tokensUsed: data.usage?.total_tokens,
    model: data.model,
  };
}

// ─── Conversation History Helper ──────────────────────────────────────────────

/** Trim a conversation to the last N messages to stay within token limits. */
export function trimConversation(messages: AIMessage[], maxMessages = 20): AIMessage[] {
  // Always keep the system message (index 0)
  if (messages.length <= maxMessages) return messages;
  const system = messages.filter((m) => m.role === "system");
  const rest = messages.filter((m) => m.role !== "system").slice(-maxMessages);
  return [...system, ...rest];
}
