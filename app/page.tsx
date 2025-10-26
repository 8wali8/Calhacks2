"use client";

/**
 * Main demo page
 *
 * Layout:
 * - Left panel: JSON editors for PersonaInput and InterviewContext
 * - Right panel: TavusInterview component
 * - Bottom: MetricsPanel showing event log
 */

import { useState, useEffect } from "react";
import { TavusInterview } from "@/components/TavusInterview";
import { MetricsPanel } from "@/components/MetricsPanel";
import { useTavusWebComponent } from "@/components/TavusInterviewWebComponent";
import {
  PersonaInput,
  InterviewContext,
  UIMessage,
  TavusObjectivesPayload,
} from "@/types";

// Default values for demo
const DEFAULT_PERSONA: PersonaInput = {
  name: "Technical Recruiter",
  systemPrompt:
    "You are a friendly technical recruiter conducting a screening interview. Ask thoughtful questions about the candidate's experience and technical skills. Be conversational and encouraging.",
  topics: ["past experience", "technical skills", "motivation", "culture fit"],
  tone: "friendly",
  followUpStyle: "balanced",
  questionStyle: "hybrid",
  maxQuestions: 5,
  maxFollowUpsPerQuestion: 2,
  attachContextFromInterview: true,
};

const DEFAULT_CONTEXT: InterviewContext = {
  company: "Acme Corp",
  role: "Senior Software Engineer",
  seniority: "Senior",
  jdHighlights: [
    "5+ years backend development",
    "Strong API design skills",
    "Experience with microservices",
  ],
  extraContext: "Fast-paced startup environment",
};

const DEFAULT_OBJECTIVES: TavusObjectivesPayload = {
  data: [
    {
      objective_name: "assess_technical_skills",
      objective_prompt:
        "Evaluate the candidate's technical expertise and problem-solving ability through targeted questions about their past projects and technical knowledge.",
      confirmation_mode: "auto",
    },
    {
      objective_name: "evaluate_culture_fit",
      objective_prompt:
        "Assess whether the candidate aligns with the company values and team dynamics.",
      confirmation_mode: "auto",
    },
  ],
};

export default function HomePage() {
  // Register web component
  useTavusWebComponent();

  // Persona, context, and objectives editors
  const [personaJson, setPersonaJson] = useState(
    JSON.stringify(DEFAULT_PERSONA, null, 2)
  );
  const [contextJson, setContextJson] = useState(
    JSON.stringify(DEFAULT_CONTEXT, null, 2)
  );
  const [objectivesJson, setObjectivesJson] = useState(
    JSON.stringify(DEFAULT_OBJECTIVES, null, 2)
  );

  // Parsed values
  const [persona, setPersona] = useState<PersonaInput>(DEFAULT_PERSONA);
  const [context, setContext] = useState<InterviewContext>(DEFAULT_CONTEXT);
  const [objectives, setObjectives] = useState<TavusObjectivesPayload>(DEFAULT_OBJECTIVES);

  // Validation errors
  const [personaError, setPersonaError] = useState<string | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const [objectivesError, setObjectivesError] = useState<string | null>(null);

  // Autoplay toggle
  const [autoplay, setAutoplay] = useState(false);

  // Events from TavusInterview
  const [events, setEvents] = useState<UIMessage[]>([]);

  // Check env vars on client only (prevents hydration mismatch)
  const [hasPersonaId, setHasPersonaId] = useState(false);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasPersonaId(!!process.env.NEXT_PUBLIC_TAVUS_PERSONA_ID);
    setApiKeySet(!!process.env.NEXT_PUBLIC_TAVUS_API_KEY);
  }, []);

  // Parse persona JSON
  const handlePersonaChange = (value: string) => {
    setPersonaJson(value);
    try {
      const parsed = JSON.parse(value);
      setPersona(parsed);
      setPersonaError(null);
    } catch (err) {
      setPersonaError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  // Parse context JSON
  const handleContextChange = (value: string) => {
    setContextJson(value);
    try {
      const parsed = JSON.parse(value);
      setContext(parsed);
      setContextError(null);
    } catch (err) {
      setContextError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  // Parse objectives JSON
  const handleObjectivesChange = (value: string) => {
    setObjectivesJson(value);
    try {
      const parsed = JSON.parse(value);
      setObjectives(parsed);
      setObjectivesError(null);
    } catch (err) {
      setObjectivesError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  // Handle events from TavusInterview
  const handleEvent = (message: UIMessage) => {
    setEvents((prev) => [...prev, message]);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Tavus Interview Demo</h1>
        <div className="header-badges">
          {mounted && !apiKeySet && (
            <span className="badge badge-error">
              ⚠️ NEXT_PUBLIC_TAVUS_API_KEY not set
            </span>
          )}
          {mounted && hasPersonaId && (
            <span className="badge badge-info">
              🔄 Reusing persona: {process.env.NEXT_PUBLIC_TAVUS_PERSONA_ID}
            </span>
          )}
          {mounted && apiKeySet && !hasPersonaId && (
            <span className="badge badge-success">
              ✓ API key set
            </span>
          )}
        </div>
      </header>

      <div className="main-layout">
        <aside className="config-panel">
          <section className="editor-section">
            <h2>Persona Input</h2>
            {personaError && <div className="error-message">{personaError}</div>}
            <textarea
              className="json-editor"
              value={personaJson}
              onChange={(e) => handlePersonaChange(e.target.value)}
              spellCheck={false}
            />
          </section>

          <section className="editor-section">
            <h2>Interview Context</h2>
            {contextError && <div className="error-message">{contextError}</div>}
            <textarea
              className="json-editor"
              value={contextJson}
              onChange={(e) => handleContextChange(e.target.value)}
              spellCheck={false}
            />
          </section>

          <section className="editor-section">
            <h2>Objectives</h2>
            {objectivesError && <div className="error-message">{objectivesError}</div>}
            <textarea
              className="json-editor"
              value={objectivesJson}
              onChange={(e) => handleObjectivesChange(e.target.value)}
              spellCheck={false}
            />
          </section>

          <section className="controls-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={autoplay}
                onChange={(e) => setAutoplay(e.target.checked)}
              />
              Autoplay on mount
            </label>
          </section>
        </aside>

        <main className="interview-panel">
          <h2>Interview</h2>
          {!personaError && !contextError && !objectivesError ? (
            <TavusInterview
              persona={persona}
              context={context}
              objectives={objectives}
              autoplay={autoplay}
              onEvent={handleEvent}
            />
          ) : (
            <div className="validation-error">
              <p>Fix JSON errors before starting interview</p>
            </div>
          )}
        </main>
      </div>

      <footer className="metrics-container">
        <MetricsPanel events={events} />
      </footer>
    </div>
  );
}
