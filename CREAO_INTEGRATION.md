# Creao Integration Guide

This guide shows how to drop the Tavus Interview components into Creao.

## Quick Integration (React Component)

### Step 1: Copy Files

Copy these folders into your Creao project:

```
creao/
├── components/
│   ├── TavusInterview.tsx
│   ├── MetricsPanel.tsx
│   └── TavusInterviewWebComponent.tsx  (optional, for web component)
├── lib/
│   └── tavus-client.ts
└── types/
    └── index.ts  (or merge into your existing types)
```

### Step 2: Add Environment Variable

In Creao's `.env.local`:

```env
# ⚠️ HACKATHON ONLY - exposed in browser
NEXT_PUBLIC_TAVUS_API_KEY=your_key_here

# Optional: reuse a persona
# NEXT_PUBLIC_TAVUS_PERSONA_ID=p123
```

### Step 3: Use in Creao Pages

```tsx
import { TavusInterview } from "@/components/TavusInterview";
import { PersonaInput, InterviewContext } from "@/types";

function CreaoInterviewPage() {
  const persona: PersonaInput = {
    name: "AI Recruiter",
    systemPrompt: "You are conducting a technical interview...",
    topics: ["React", "TypeScript", "System Design"],
    tone: "friendly",
    followUpStyle: "deep-dive",
    questionStyle: "technical",
    maxQuestions: 8,
    maxFollowUpsPerQuestion: 3,
    attachContextFromInterview: true,
  };

  const context: InterviewContext = {
    company: "Tech Startup",
    role: "Frontend Engineer",
    seniority: "Mid-level",
    jdHighlights: [
      "React/Next.js experience",
      "TypeScript",
      "State management",
    ],
  };

  const handleEvent = (message: UIMessage) => {
    // Send to Creao metrics collector
    creaoMetrics.track("tavus_event", {
      type: message.type,
      timestamp: message.timestamp,
      details: message.text,
    });
  };

  return (
    <div className="creao-interview-container">
      <TavusInterview
        persona={persona}
        context={context}
        autoplay={true}
        onEvent={handleEvent}
      />
    </div>
  );
}
```

## Advanced: Dynamic Persona from Creao Context

If you want to generate the persona from Creao's job description data:

```tsx
import { TavusInterview } from "@/components/TavusInterview";
import { useJobDescription } from "@/creao/hooks/useJobDescription";

function CreaoInterviewPage({ jobId }: { jobId: string }) {
  const { job } = useJobDescription(jobId);

  // Build persona from Creao job data
  const persona: PersonaInput = {
    name: `${job.company} Recruiter`,
    systemPrompt: `You are conducting an interview for ${job.title} at ${job.company}.

${job.description}

Focus on assessing the candidate's fit for these key requirements:
${job.requirements.map((r: string) => `- ${r}`).join('\n')}

Be thorough but respectful of the candidate's time.`,
    topics: extractTopicsFromJob(job),
    tone: job.culture === "fast-paced" ? "direct" : "friendly",
    followUpStyle: "balanced",
    questionStyle: determineQuestionStyle(job),
    maxQuestions: 6,
    maxFollowUpsPerQuestion: 2,
    attachContextFromInterview: true,
  };

  const context: InterviewContext = {
    company: job.company,
    role: job.title,
    seniority: job.level,
    jdHighlights: job.requirements,
    extraContext: job.culture,
  };

  return (
    <TavusInterview
      persona={persona}
      context={context}
      autoplay={true}
      onEvent={sendToCreaoMetrics}
    />
  );
}

// Helper to extract topics from job description
function extractTopicsFromJob(job: Job): string[] {
  const topics = [];

  if (job.requirements.some((r: string) => r.includes("backend"))) {
    topics.push("backend architecture");
  }

  if (job.requirements.some((r: string) => r.includes("leadership"))) {
    topics.push("team collaboration", "mentorship");
  }

  // Add job-specific topics
  topics.push("past experience", "motivation");

  return topics;
}

function determineQuestionStyle(job: Job): "behavioral" | "technical" | "hybrid" {
  const techKeywords = ["engineer", "developer", "architect"];
  const isTechnical = techKeywords.some(kw =>
    job.title.toLowerCase().includes(kw)
  );

  return isTechnical ? "technical" : "behavioral";
}

function sendToCreaoMetrics(message: UIMessage) {
  // Wire into Creao's existing analytics
  window.analytics?.track("interview_event", {
    event_type: message.type,
    timestamp: message.timestamp,
    text: message.text,
  });
}
```

## Web Component Integration (if not using React)

If parts of Creao don't use React, use the web component:

```tsx
import { useTavusWebComponent } from "@/components/TavusInterviewWebComponent";

function CreaoPage() {
  // Register web component once
  useTavusWebComponent();

  const persona = { /* ... */ };
  const context = { /* ... */ };

  useEffect(() => {
    // Listen for events
    const handler = (event: CustomEvent) => {
      sendToCreaoMetrics(event.detail);
    };

    window.addEventListener('tavus:event', handler as EventListener);
    return () => window.removeEventListener('tavus:event', handler as EventListener);
  }, []);

  return (
    <div>
      <tavus-interview
        persona={JSON.stringify(persona)}
        context={JSON.stringify(context)}
        autoplay="true"
      />
    </div>
  );
}
```

## Styling in Creao

The components have minimal inline styling. Add Creao-specific styles:

```css
/* In your Creao globals.css or module */

.tavus-interview-container {
  width: 100%;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.tavus-interview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* Match Creao's loading states */
.tavus-interview-loading {
  background: var(--creao-background);
  color: var(--creao-text);
}

/* Match Creao's error states */
.tavus-interview-error {
  background: var(--creao-error-bg);
  color: var(--creao-error-text);
}
```

## Metrics Integration

Wire Tavus events into Creao's existing metrics:

```tsx
import { TavusInterview } from "@/components/TavusInterview";
import { UIMessage } from "@/types";

function handleTavusEvent(message: UIMessage) {
  switch (message.type) {
    case "ready":
      // Track interview started
      creaoAnalytics.trackInterviewStart({
        timestamp: message.timestamp,
      });
      break;

    case "connected":
      // Candidate connected to interview
      creaoAnalytics.trackInterviewConnected({
        timestamp: message.timestamp,
      });
      break;

    case "disconnected":
      // Interview ended
      creaoAnalytics.trackInterviewEnd({
        timestamp: message.timestamp,
      });
      break;

    case "error":
      // Track errors
      creaoAnalytics.trackError({
        source: "tavus_interview",
        error: message.text,
      });
      break;

    case "note":
      // Forward opaque events from Tavus iframe
      // You can parse these if Tavus provides specific event schemas
      creaoAnalytics.trackCustomEvent({
        name: "tavus_iframe_message",
        payload: message.payload,
      });
      break;
  }
}

<TavusInterview
  persona={persona}
  context={context}
  onEvent={handleTavusEvent}
/>
```

## Production Considerations

When moving from hackathon to production:

### 1. Add Server Proxy

Create `/app/api/tavus/route.ts`:

```ts
// This goes in Creao's API routes
import { NextRequest, NextResponse } from "next/server";

// Server-side env (not exposed)
const TAVUS_API_KEY = process.env.TAVUS_API_KEY;

export async function POST(request: NextRequest) {
  const { endpoint, payload } = await request.json();

  const response = await fetch(`https://tavusapi.com/v2${endpoint}`, {
    method: "POST",
    headers: {
      "x-api-key": TAVUS_API_KEY!,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

### 2. Update Client to Use Proxy

In `lib/tavus-client.ts`, change:

```ts
const TAVUS_BASE_URL = "/api/tavus"; // Use your server proxy
```

### 3. Move Key to Server

In `.env.local`:

```env
# Server-side only (not NEXT_PUBLIC_*)
TAVUS_API_KEY=your_key_here
```

## Testing Checklist

Before shipping in Creao:

- [ ] Persona creation works with Creao job data
- [ ] Context is correctly populated from job description
- [ ] Events are sent to Creao analytics
- [ ] Styling matches Creao design system
- [ ] Error states are handled gracefully
- [ ] Loading states match Creao patterns
- [ ] Works on mobile (responsive iframe)
- [ ] CORS is handled if behind corporate network
- [ ] API key is moved to server in production

## Minimal Example

Simplest possible Creao integration:

```tsx
import { TavusInterview } from "@/components/TavusInterview";

export default function QuickInterviewPage() {
  return (
    <TavusInterview
      persona={{
        name: "Interviewer",
        systemPrompt: "Conduct a professional interview.",
        attachContextFromInterview: true,
      }}
      context={{
        company: "My Company",
        role: "Software Engineer",
      }}
      autoplay
    />
  );
}
```

Done! The interview will start automatically when the page loads.
