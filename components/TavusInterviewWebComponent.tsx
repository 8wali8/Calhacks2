"use client";

/**
 * Web Component wrapper for TavusInterview
 *
 * Usage:
 *   <tavus-interview
 *     persona='{"name":"Recruiter","systemPrompt":"..."}'
 *     context='{"company":"Acme","role":"Engineer"}'
 *   ></tavus-interview>
 *
 * Events are dispatched as CustomEvent("tavus:event", { detail: UIMessage })
 *
 * Call registerTavusWebComponent() once in your app to register the custom element.
 *
 * ⚠️ SSR Safe: Web component class is only defined in the browser
 */

import { useEffect } from "react";
import type {
  PersonaInput,
  InterviewContext,
  UIMessage,
  TavusObjectivesPayload,
} from "@/types";

/**
 * Register the <tavus-interview> custom element
 * Only runs in browser (SSR safe)
 */
export function registerTavusWebComponent() {
  // Guard: only run in browser
  if (typeof window === "undefined" || typeof customElements === "undefined") {
    return;
  }

  // Skip if already registered
  if (customElements.get("tavus-interview")) {
    return;
  }

  // Lazy import React dependencies (only in browser)
  import("react-dom/client").then(({ createRoot }) => {
    import("./TavusInterview").then(({ TavusInterview }) => {
      // Double-check registration inside async callback
      if (customElements.get("tavus-interview")) {
        return;
      }

      // Define web component class (browser-only)
      class TavusInterviewElement extends HTMLElement {
        private root: ReturnType<typeof createRoot> | null = null;

        connectedCallback() {
          const personaAttr = this.getAttribute("persona");
          const contextAttr = this.getAttribute("context");
          const objectivesAttr = this.getAttribute("objectives");
          const autoplayAttr = this.getAttribute("autoplay");

          if (!personaAttr || !contextAttr || !objectivesAttr) {
            console.error(
              "[tavus-interview] Missing required attributes: persona, context, and objectives"
            );
            return;
          }

          let persona: PersonaInput;
          let context: InterviewContext;
          let objectives: TavusObjectivesPayload;

          try {
            persona = JSON.parse(personaAttr);
            context = JSON.parse(contextAttr);
            objectives = JSON.parse(objectivesAttr);
          } catch (err) {
            console.error("[tavus-interview] Invalid JSON in attributes:", err);
            return;
          }

          const autoplay = autoplayAttr === "true" || autoplayAttr === "";

          // Mount React component
          const mountPoint = document.createElement("div");
          this.appendChild(mountPoint);

          this.root = createRoot(mountPoint);

          const handleEvent = (message: UIMessage) => {
            // Dispatch as CustomEvent to the window
            const event = new CustomEvent("tavus:event", {
              detail: message,
              bubbles: true,
            });
            window.dispatchEvent(event);
          };

          this.root.render(
            <TavusInterview
              persona={persona}
              context={context}
              objectives={objectives}
              autoplay={autoplay}
              onEvent={handleEvent}
            />
          );
        }

        disconnectedCallback() {
          if (this.root) {
            this.root.unmount();
            this.root = null;
          }
        }
      }

      // Register the custom element
      customElements.define("tavus-interview", TavusInterviewElement);
      console.log("[TavusInterview] Web component registered: <tavus-interview>");
    });
  });
}

/**
 * Hook to register the web component in a React app
 * SSR safe - only runs in browser
 */
export function useTavusWebComponent() {
  useEffect(() => {
    registerTavusWebComponent();
  }, []);
}
