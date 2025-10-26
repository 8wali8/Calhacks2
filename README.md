# Tavus Interview Demo

**100% client-side Tavus integration for hackathon demos.** No server code, no API routes, fully modular for embedding in Creao.

## ⚠️ Security Warning

This demo uses **NEXT_PUBLIC_*** environment variables, which means your Tavus API key is **exposed in the browser**. This is acceptable for hackathon demos but **must not be used in production**. In production, always proxy Tavus API calls through your server to protect credentials.

## Quick Start

### 1. Install dependencies

```bash
npm install
# or
pnpm install
```

### 2. Set up environment variables

Copy the example file and add your Tavus API key:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Required: Get your API key from https://platform.tavus.io
NEXT_PUBLIC_TAVUS_API_KEY=your_actual_api_key_here

# Optional: Reuse an existing persona instead of creating a new one each run
# NEXT_PUBLIC_TAVUS_PERSONA_ID=p1234567890

# Optional: Specify a replica ID
# NEXT_PUBLIC_TAVUS_REPLICA_ID=r1234567890
```

### 3. Run the dev server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Persona-First Flow

1. **Edit Persona & Context**: Use the left panel to customize the interviewer persona and interview context as JSON
2. **Create or Reuse Persona**:
   - If `NEXT_PUBLIC_TAVUS_PERSONA_ID` is set → reuse that persona
   - Otherwise → create a new persona from your JSON inputs
3. **Create Conversation**: The app calls Tavus to create a conversation with the persona
4. **Embed Interview**: The conversation URL is embedded in an iframe with camera/mic permissions
5. **Event Bridge**: Messages from the iframe are forwarded to the metrics panel

### Architecture

```
┌─────────────────┐
│  Browser Only   │  ← No server code
├─────────────────┤
│ TavusInterview  │  ← React component
│ (client-side)   │
├─────────────────┤
│ fetch() calls   │  ← Direct to Tavus API
│ ↓               │
│ Tavus API       │
│ ↓               │
│ Iframe embed    │  ← conversation_url
└─────────────────┘
```

## Components

### `<TavusInterview>` React Component

Main interview component with props:

```tsx
import { TavusInterview } from "@/components/TavusInterview";

<TavusInterview
  persona={{
    name: "Technical Recruiter",
    systemPrompt: "You are a friendly technical recruiter...",
    topics: ["experience", "skills"],
    tone: "friendly",
    followUpStyle: "balanced",
    questionStyle: "hybrid",
    maxQuestions: 5,
    maxFollowUpsPerQuestion: 2,
    attachContextFromInterview: true,
  }}
  context={{
    company: "Acme Corp",
    role: "Senior Engineer",
    seniority: "Senior",
    jdHighlights: ["5+ years backend", "API design"],
    extraContext: "Fast-paced startup",
  }}
  autoplay={true}
  onEvent={(message) => console.log(message)}
/>
```

### `<tavus-interview>` Web Component

For embedding in non-React apps or Creao:

```html
<script>
  // Listen for events
  window.addEventListener('tavus:event', (event) => {
    console.log('Tavus event:', event.detail);
  });
</script>

<tavus-interview
  persona='{"name":"Recruiter","systemPrompt":"You are a friendly recruiter..."}'
  context='{"company":"Acme","role":"Engineer"}'
  autoplay="true"
></tavus-interview>
```

**Note**: The web component is automatically registered when you import `useTavusWebComponent()` in your app.

### `<MetricsPanel>` Debug Component

Shows a scrolling log of all events:

```tsx
import { MetricsPanel } from "@/components/MetricsPanel";

const [events, setEvents] = useState<UIMessage[]>([]);

<MetricsPanel events={events} />
```

Debug hook in browser console:

```js
window.__pushMetric({
  type: "note",
  timestamp: Date.now(),
  text: "Test event"
});
```

## Data Contracts

### `PersonaInput`

Defines the interviewer's behavior:

```ts
interface PersonaInput {
  name: string;
  systemPrompt: string;
  topics?: string[];
  tone?: "neutral" | "friendly" | "direct" | "challenging";
  followUpStyle?: "balanced" | "deep-dive" | "rapid-fire" | "supportive";
  questionStyle?: "behavioral" | "technical" | "hybrid";
  maxQuestions?: number;
  maxFollowUpsPerQuestion?: number;
  attachContextFromInterview?: boolean;
}
```

### `InterviewContext`

Describes the role and company:

```ts
interface InterviewContext {
  company: string;
  role: string;
  seniority?: string;
  jdHighlights?: string[];
  extraContext?: string;
}
```

### `UIMessage`

Event structure for metrics:

```ts
interface UIMessage {
  type: "ready" | "connected" | "disconnected" | "error" | "note";
  timestamp: number;
  text?: string;
  payload?: unknown; // For opaque iframe messages
}
```

## Embedding in Creao

### Option 1: React Component

```tsx
import { TavusInterview } from "@/components/TavusInterview";

function MyCreaoPage() {
  return (
    <TavusInterview
      persona={myPersona}
      context={myContext}
      autoplay={true}
      onEvent={handleMetrics}
    />
  );
}
```

### Option 2: Web Component

```tsx
import { useTavusWebComponent } from "@/components/TavusInterviewWebComponent";

function MyCreaoPage() {
  useTavusWebComponent(); // Register once in your app

  return (
    <div>
      <tavus-interview
        persona={JSON.stringify(myPersona)}
        context={JSON.stringify(myContext)}
      />
    </div>
  );
}
```

## Tavus API Calls

All calls are made directly from the browser using `fetch()`:

### Base URL

```
https://tavusapi.com/v2
```

### Headers

```
x-api-key: NEXT_PUBLIC_TAVUS_API_KEY
content-type: application/json
```

### Create Persona

```
POST /personas
```

Payload built from `PersonaInput` + `InterviewContext`. Skipped if `NEXT_PUBLIC_TAVUS_PERSONA_ID` is set.

### Create Conversation

```
POST /conversations
```

Payload: `{ persona_id, replica_id? }`

Returns: `{ conversation_id, conversation_url }`

### Get Conversation (optional)

```
GET /conversations/{id}
```

For polling if needed.

## CORS & Network Issues

If the venue network blocks direct calls to Tavus:

1. Create a minimal proxy endpoint on your server
2. Update `TAVUS_BASE_URL` in [lib/tavus-client.ts](lib/tavus-client.ts) to point to your proxy
3. Move `NEXT_PUBLIC_TAVUS_API_KEY` to a server-side env var

## File Structure

```
tavus/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main demo page with editors
│   └── globals.css         # All styling (no Tailwind)
├── components/
│   ├── TavusInterview.tsx           # Main interview component
│   ├── MetricsPanel.tsx             # Event log display
│   └── TavusInterviewWebComponent.tsx  # Web component wrapper
├── lib/
│   └── tavus-client.ts     # Tavus API client (fetch only)
├── types/
│   └── index.ts            # TypeScript contracts
├── .env.local.example      # Template for env vars
└── README.md               # This file
```

## Development Checklist

- [x] Runs with `npm run dev` after setting `NEXT_PUBLIC_TAVUS_API_KEY`
- [x] Toggle `NEXT_PUBLIC_TAVUS_PERSONA_ID` to skip persona creation
- [x] Creating conversation returns `conversation_url` that loads in iframe
- [x] Event log shows `ready`, `connected`, and forwards iframe messages as `note`
- [x] No server files, no API routes, no Tailwind, no extra libs
- [x] Component props match data contracts exactly
- [x] Web component `<tavus-interview>` dispatches `tavus:event` with `UIMessage`

## License

MIT (Hackathon demo - use at your own risk)
