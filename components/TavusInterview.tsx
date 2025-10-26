"use client";

/**
 * TavusInterview - Main interview component
 *
 * This component handles the full interview lifecycle:
 * 1. Create or reuse a persona
 * 2. Create a conversation
 * 3. Embed the conversation in an iframe
 * 4. Bridge events from the iframe to the parent
 *
 * Props:
 *   - persona: PersonaInput defining the interviewer behavior
 *   - context: InterviewContext describing the role/company
 *   - autoplay: If true, start immediately on mount
 *   - onEvent: Callback for all UI events (ready, connected, error, etc.)
 */

import { useEffect, useRef, useState } from "react";
import {
  PersonaInput,
  InterviewContext,
  UIMessage,
  InterviewSession,
  TavusObjectivesPayload,
} from "@/types";
import {
  createObjectives,
  createPersona,
  createConversation,
  getReusablePersonaId,
} from "@/lib/tavus-client";

export interface TavusInterviewProps {
  persona: PersonaInput;
  context: InterviewContext;
  objectives: TavusObjectivesPayload; // Required objectives payload
  autoplay?: boolean;
  onEvent?: (message: UIMessage) => void;
}

export function TavusInterview({
  persona,
  context,
  objectives,
  autoplay = false,
  onEvent,
}: TavusInterviewProps) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const emitEvent = (type: UIMessage["type"], text?: string, payload?: unknown) => {
    const message: UIMessage = {
      type,
      timestamp: Date.now(),
      text,
      payload,
    };
    onEvent?.(message);
  };

  const startInterview = async () => {
    setLoading(true);
    setError(null);

    try {
      let personaId: string;
      const reusablePersonaId = getReusablePersonaId();

      // Try to create objectives + persona
      try {
        // Step 1: Create objectives
        console.log("[TavusInterview] Creating objectives...");
        const objectivesId = await createObjectives(objectives);
        console.log(`[TavusInterview] Created objectives: ${objectivesId}`);
        emitEvent("note", `Objectives created: ${objectivesId}`);

        // Step 2: Create persona with objectives
        console.log("[TavusInterview] Creating persona with objectives...");
        personaId = await createPersona(persona, objectivesId);
        console.log(`[TavusInterview] Created persona: ${personaId}`);
        emitEvent("note", `Persona created: ${personaId}`);
      } catch (createError) {
        // Fallback: Try to use reusable persona from env
        if (reusablePersonaId) {
          console.warn(
            "[TavusInterview] Failed to create persona, falling back to env persona:",
            createError
          );
          personaId = reusablePersonaId;
          emitEvent("note", `Using fallback persona: ${personaId}`);
        } else {
          throw createError; // No fallback available, re-throw error
        }
      }

      // Step 3: Create conversation with context
      console.log("[TavusInterview] Creating conversation...");
      // Pass context to conversation (it goes in conversational_context field)
      // replica_id is NOT needed (persona has default_replica_id set)
      const { conversationId, conversationUrl } = await createConversation(
        personaId,
        context // Per-run job/company details
      );

      console.log(`[TavusInterview] Conversation created: ${conversationId}`);
      console.log(`[TavusInterview] URL: ${conversationUrl}`);

      setSession({ conversationId, conversationUrl });
      emitEvent("ready", `Conversation ${conversationId} ready`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("[TavusInterview] Error:", errorMessage);
      setError(errorMessage);
      emitEvent("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Autoplay on mount
  useEffect(() => {
    if (autoplay && !session && !loading && !error) {
      startInterview();
    }
  }, [autoplay]);

  // Set up postMessage listener for iframe events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: only accept messages from Tavus domains
      // Adjust this check based on the actual iframe origin
      if (!event.origin.includes("tavus")) {
        return;
      }

      console.log("[TavusInterview] Received message from iframe:", event.data);

      // Forward all messages as "note" events since we don't know Tavus schema
      emitEvent("note", JSON.stringify(event.data), event.data);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Fire "connected" when iframe loads
  const handleIframeLoad = () => {
    console.log("[TavusInterview] Iframe loaded");
    setHasConnected(true);
    emitEvent("connected", "Iframe loaded and ready");
  };

  // Track if iframe actually connected to avoid false disconnects
  const [hasConnected, setHasConnected] = useState(false);

  // Fire "disconnected" on unmount only if we actually connected
  useEffect(() => {
    return () => {
      if (session && hasConnected) {
        emitEvent("disconnected", "Component unmounted");
      }
    };
  }, [session, hasConnected]);

  // Render states
  if (error) {
    return (
      <div className="tavus-interview-error">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={startInterview}>Retry</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="tavus-interview-loading">
        <p>Starting interview...</p>
      </div>
    );
  }

  if (!session && !autoplay) {
    return (
      <div className="tavus-interview-idle">
        <button onClick={startInterview}>Start Interview</button>
      </div>
    );
  }

  if (!session) {
    return null; // Autoplay mode, waiting for session
  }

  // Render iframe with correct permissions
  return (
    <div className="tavus-interview-container">
      <iframe
        ref={iframeRef}
        src={session.conversationUrl}
        allow="camera; microphone; autoplay; clipboard-read; clipboard-write"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={handleIframeLoad}
        className="tavus-interview-iframe"
      />
    </div>
  );
}
