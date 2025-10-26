/**
 * Tavus API client - 100% client-side, no server proxy
 *
 * ⚠️ HACKATHON ONLY: API key is exposed in browser via NEXT_PUBLIC_* env vars
 * In production, all Tavus calls should go through your server to protect credentials.
 */

import {
  PersonaInput,
  InterviewContext,
  TavusPersonaPayload,
  TavusPersonaResponse,
  TavusConversationPayload,
  TavusConversationResponse,
  TavusObjectivesPayload,
  TavusObjectivesResponse,
  TavusErrorResponse,
} from "@/types";

const TAVUS_BASE_URL = "https://tavusapi.com/v2";

/**
 * Get the API key from environment
 * @throws Error if key is not set
 */
function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_TAVUS_API_KEY;
  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_TAVUS_API_KEY is not set. Check your .env.local file."
    );
  }
  return key;
}

/**
 * Make a request to Tavus API
 */
async function tavusRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = getApiKey();

  const response = await fetch(`${TAVUS_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "x-api-key": apiKey,
      "content-type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const errorPreview = errorBody.slice(0, 200);
    throw new Error(
      `Tavus API error (${response.status}): ${errorPreview}`
    );
  }

  return response.json();
}

/**
 * Build the system prompt from PersonaInput
 * This goes in persona.system_prompt and contains stable interviewing rules
 */
export function buildSystemPrompt(persona: PersonaInput): string {
  let prompt = persona.systemPrompt;

  // Add behavior block based on persona settings
  const behaviors: string[] = [];

  if (persona.tone) {
    behaviors.push(`Tone: ${persona.tone}`);
  }

  if (persona.questionStyle) {
    behaviors.push(`Question style: ${persona.questionStyle}`);
  }

  if (persona.followUpStyle) {
    behaviors.push(`Follow-up style: ${persona.followUpStyle}`);
  }

  if (persona.maxQuestions !== undefined) {
    behaviors.push(`Max questions: ${persona.maxQuestions}`);
  }

  if (persona.maxFollowUpsPerQuestion !== undefined) {
    behaviors.push(`Max follow-ups per question: ${persona.maxFollowUpsPerQuestion}`);
  }

  if (persona.topics && persona.topics.length > 0) {
    behaviors.push(`Topics to cover: ${persona.topics.join(", ")}`);
  }

  if (behaviors.length > 0) {
    prompt += "\n\n## Behavior\n" + behaviors.join("\n");
  }

  return prompt;
}

/**
 * Build conversational context from InterviewContext
 * This goes in conversation.conversational_context and contains per-run job/company details
 */
export function buildConversationalContext(context: InterviewContext): string {
  const contextParts: string[] = [];

  contextParts.push(`Company: ${context.company}`);
  contextParts.push(`Role: ${context.role}`);

  if (context.seniority) {
    contextParts.push(`Seniority: ${context.seniority}`);
  }

  if (context.jdHighlights && context.jdHighlights.length > 0) {
    contextParts.push(`Key requirements: ${context.jdHighlights.join(", ")}`);
  }

  if (context.extraContext) {
    contextParts.push(`Additional context: ${context.extraContext}`);
  }

  return contextParts.join("\n");
}

/**
 * Create objectives
 * Returns objectives_id
 *
 * @param objectivesPayload - Objectives data from UI (JSON parsed)
 */
export async function createObjectives(
  objectivesPayload: TavusObjectivesPayload
): Promise<string> {
  const response = await tavusRequest<TavusObjectivesResponse>("/objectives", {
    method: "POST",
    body: JSON.stringify(objectivesPayload),
  });

  return response.objectives_id;
}

/**
 * Create a new persona
 * Returns persona_id
 *
 * @param persona - PersonaInput from UI
 * @param objectivesId - Optional objectives ID from createObjectives()
 */
export async function createPersona(
  persona: PersonaInput,
  objectivesId?: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt(persona);

  const payload: TavusPersonaPayload = {
    pipeline_mode: "full", // Required for standard interviews
    system_prompt: systemPrompt, // Required with pipeline_mode "full"
    persona_name: persona.name,
  };

  // Add objectives_id if provided
  if (objectivesId) {
    payload.objectives_id = objectivesId;
  }

  // Add default_replica_id from environment
  const replicaId = getReplicaId();
  if (replicaId) {
    payload.default_replica_id = replicaId;
  }

  const response = await tavusRequest<TavusPersonaResponse>("/personas", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.persona_id;
}

/**
 * Create a conversation with a persona
 * Returns { conversationId, conversationUrl }
 *
 * @param personaId - Required persona ID
 * @param context - Optional per-run context (job/company details)
 * @param replicaId - Optional replica ID (uses env var if not provided)
 */
export async function createConversation(
  personaId: string,
  context?: InterviewContext,
  replicaId?: string
): Promise<{ conversationId: string; conversationUrl: string }> {
  const payload: TavusConversationPayload = {
    persona_id: personaId,
  };

  // Add replica_id from parameter or environment variable
  const finalReplicaId = replicaId || getReplicaId();
  if (finalReplicaId) {
    payload.replica_id = finalReplicaId;
  }

  // Add conversational_context if InterviewContext is provided
  if (context) {
    payload.conversational_context = buildConversationalContext(context);
  }

  const response = await tavusRequest<TavusConversationResponse>(
    "/conversations",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  return {
    conversationId: response.conversation_id,
    conversationUrl: response.conversation_url,
  };
}

/**
 * Get conversation details (optional, for polling if needed)
 */
export async function getConversation(
  conversationId: string
): Promise<TavusConversationResponse> {
  return tavusRequest<TavusConversationResponse>(
    `/conversations/${conversationId}`,
    {
      method: "GET",
    }
  );
}

/**
 * Check if we should reuse an existing persona from env
 */
export function getReusablePersonaId(): string | null {
  return process.env.NEXT_PUBLIC_TAVUS_PERSONA_ID || null;
}

/**
 * Check if we have a replica ID from env
 */
export function getReplicaId(): string | null {
  return process.env.NEXT_PUBLIC_TAVUS_REPLICA_ID || null;
}
