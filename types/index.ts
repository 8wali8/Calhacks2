/**
 * Data contracts for Tavus integration
 * These types define the public API surface for the interview system
 */

export interface InterviewContext {
  company: string;
  role: string;
  seniority?: string;
  jdHighlights?: string[];
  extraContext?: string;
}

export interface PersonaInput {
  name: string;
  systemPrompt: string; // main instructions
  topics?: string[];
  tone?: "neutral" | "friendly" | "direct" | "challenging";
  followUpStyle?: "balanced" | "deep-dive" | "rapid-fire" | "supportive";
  questionStyle?: "behavioral" | "technical" | "hybrid";
  maxQuestions?: number;
  maxFollowUpsPerQuestion?: number;
  attachContextFromInterview?: boolean; // if true, include InterviewContext in instructions
}

export interface InterviewSession {
  conversationId: string;
  conversationUrl: string;
}

export type UIMessageType = "ready" | "connected" | "disconnected" | "error" | "note";

export interface UIMessage {
  type: UIMessageType;
  timestamp: number;
  text?: string;
  payload?: unknown; // For opaque pass-through data
}

/**
 * Tavus API types - exact spec from docs.tavus.io
 * Do NOT add fields not in the official API documentation
 */

export interface TavusPersonaPayload {
  pipeline_mode: "full" | "echo"; // Required; use "full" for standard interviews
  system_prompt: string; // Required with pipeline_mode "full"
  persona_name?: string;
  context?: string; // Optional global context for persona
  default_replica_id?: string; // Optional; if set, conversations don't need replica_id
  objectives_id?: string; // Optional; objectives ID from POST /v2/objectives
  document_ids?: string[];
  document_tags?: string[];
  layers?: Record<string, unknown>; // Advanced; leave undefined unless needed
}

export interface TavusPersonaResponse {
  persona_id: string;
  persona_name: string;
  created_at: string;
  [key: string]: unknown; // Allow other fields, but don't depend on them
}

export interface TavusConversationPayload {
  persona_id: string; // Required
  replica_id?: string; // Required if persona has no default_replica_id
  audio_only?: boolean;
  callback_url?: string; // For webhooks; requires server (skip for browser-only)
  conversation_name?: string;
  conversational_context?: string; // Per-run context (e.g., job/company details)
  custom_greeting?: string;
  memory_stores?: string[];
  document_ids?: string[];
  document_tags?: string[];
  document_retrieval_strategy?: "speed" | "quality" | "balanced";
  test_mode?: boolean;
  properties?: Record<string, unknown>;
}

export interface TavusConversationResponse {
  conversation_id: string;
  conversation_url: string;
  conversation_name?: string;
  status?: string;
  replica_id?: string;
  persona_id?: string;
  created_at?: string;
  [key: string]: unknown; // Allow other fields, but don't depend on them
}

export interface TavusErrorResponse {
  error?: string;
  message?: string;
  [key: string]: unknown;
}

/**
 * Objectives API types - from docs.tavus.io/api-reference/objectives
 */

export interface ObjectiveData {
  objective_name: string; // Required; no spaces
  objective_prompt: string; // Required; defines what the objective should accomplish
  confirmation_mode?: "auto" | "manual"; // Optional; default "auto"
  output_variables?: string[]; // Optional; variables for extraction
  modality?: "verbal" | "visual"; // Optional; default "verbal"
  next_conditional_objectives?: Record<string, string>; // Optional; maps objective names to conditions
  next_required_objectives?: string[]; // Optional; auto-activated after completion
  callback_url?: string; // Optional; webhook for completion notifications
}

export interface TavusObjectivesPayload {
  data: ObjectiveData[]; // Array of objectives
}

export interface TavusObjectivesResponse {
  objectives_id: string;
  created_at?: string;
  [key: string]: unknown;
}
