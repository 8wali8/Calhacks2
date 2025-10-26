# Architecture Documentation

## System Overview

This is a 100% client-side implementation of Tavus interview functionality. All API calls go directly from the browser to Tavus - there is **no server code** in this demo.

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Only                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │   User UI    │────────▶│ TavusInterview│            │
│  │  (page.tsx)  │         │   Component   │            │
│  └──────────────┘         └───────┬───────┘            │
│                                   │                     │
│                                   │ fetch()             │
│                                   ▼                     │
│                          ┌────────────────┐             │
│                          │  tavus-client  │             │
│                          │   (fetch API)  │             │
│                          └───────┬────────┘             │
│                                  │                      │
└──────────────────────────────────┼──────────────────────┘
                                   │
                                   │ HTTPS
                                   ▼
                    ┌──────────────────────────┐
                    │   Tavus API              │
                    │   (tavusapi.com/v2)      │
                    └──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │   Returns                │
                    │   conversation_url       │
                    └──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │   Embedded in iframe     │
                    │   with camera/mic access │
                    └──────────────────────────┘
```

## Data Flow

### 1. Initialization Phase

```
User loads page
    │
    ├─▶ Reads NEXT_PUBLIC_* env vars
    │   ├─ NEXT_PUBLIC_TAVUS_API_KEY (required)
    │   ├─ NEXT_PUBLIC_TAVUS_PERSONA_ID (optional)
    │   └─ NEXT_PUBLIC_TAVUS_REPLICA_ID (optional)
    │
    ├─▶ Parses PersonaInput JSON
    │   └─ Validates schema
    │
    └─▶ Parses InterviewContext JSON
        └─ Validates schema
```

### 2. Interview Start Flow

```
User clicks "Start" (or autoplay=true)
    │
    ├─▶ Check if NEXT_PUBLIC_TAVUS_PERSONA_ID exists
    │   │
    │   ├─ YES: Reuse persona ────────────┐
    │   │                                  │
    │   └─ NO: Create new persona         │
    │       │                              │
    │       ├─ buildSystemPrompt()        │
    │       │   ├─ Combine systemPrompt   │
    │       │   ├─ Add behavior block     │
    │       │   └─ Add context (if enabled)│
    │       │                              │
    │       └─ POST /personas              │
    │           └─ Returns persona_id ─────┤
    │                                      │
    └─▶ Create conversation ◀──────────────┘
        │
        ├─ POST /conversations
        │   ├─ Body: { persona_id, replica_id? }
        │   └─ Returns: { conversation_id, conversation_url }
        │
        ├─▶ Render iframe
        │   ├─ src={conversation_url}
        │   ├─ allow="camera; microphone; autoplay; ..."
        │   └─ referrerPolicy="strict-origin-when-cross-origin"
        │
        └─▶ Fire events
            ├─ "ready" when session created
            ├─ "connected" when iframe loads
            └─ "disconnected" on unmount
```

### 3. Event Bridge Flow

```
Tavus iframe (running at conversation_url)
    │
    ├─▶ postMessage events
    │   │
    │   └─▶ window.addEventListener('message')
    │       │
    │       ├─ Security check (origin includes "tavus")
    │       │
    │       └─▶ Forward as UIMessage
    │           ├─ type: "note"
    │           ├─ timestamp: Date.now()
    │           ├─ text: JSON.stringify(event.data)
    │           └─ payload: event.data (opaque)
    │
    └─▶ onEvent callback
        │
        └─▶ MetricsPanel
            └─ Display in event log
```

## Component Hierarchy

```
app/page.tsx (Client Component)
│
├─▶ Config Panel (Left)
│   ├─ PersonaInput JSON editor
│   ├─ InterviewContext JSON editor
│   └─ Autoplay toggle
│
├─▶ Interview Panel (Center)
│   └─ TavusInterview
│       ├─ State: loading | error | idle | session
│       ├─ createPersona() or reuse
│       ├─ createConversation()
│       └─ <iframe> with conversation_url
│
└─▶ Metrics Panel (Bottom)
    └─ MetricsPanel
        ├─ Event log (scrollable)
        ├─ Debug hook: window.__pushMetric()
        └─ Clear button
```

## Type System

### Core Data Types

```typescript
PersonaInput
    ├─ name: string
    ├─ systemPrompt: string
    ├─ topics?: string[]
    ├─ tone?: "neutral" | "friendly" | "direct" | "challenging"
    ├─ followUpStyle?: "balanced" | "deep-dive" | "rapid-fire" | "supportive"
    ├─ questionStyle?: "behavioral" | "technical" | "hybrid"
    ├─ maxQuestions?: number
    ├─ maxFollowUpsPerQuestion?: number
    └─ attachContextFromInterview?: boolean

InterviewContext
    ├─ company: string
    ├─ role: string
    ├─ seniority?: string
    ├─ jdHighlights?: string[]
    └─ extraContext?: string

InterviewSession
    ├─ conversationId: string
    └─ conversationUrl: string

UIMessage
    ├─ type: "ready" | "connected" | "disconnected" | "error" | "note"
    ├─ timestamp: number
    ├─ text?: string
    └─ payload?: unknown
```

### API Types (Tavus)

```typescript
TavusPersonaPayload
    ├─ persona_name: string
    ├─ system_prompt: string
    ├─ context?: string
    ├─ layers?: { [key: string]: unknown }
    └─ metadata?: { [key: string]: unknown }

TavusConversationPayload
    ├─ persona_id: string
    ├─ replica_id?: string
    └─ metadata?: { [key: string]: unknown }
```

**Design principle**: Unknown Tavus fields are isolated under `metadata` or `[key: string]: unknown`. We only rely on documented fields for control flow.

## File Structure & Responsibilities

```
tavus/
│
├─ app/                          # Next.js App Router
│  ├─ layout.tsx                 # Root layout, minimal
│  ├─ page.tsx                   # Main demo UI (client component)
│  └─ globals.css                # All styling (no Tailwind)
│
├─ components/                   # React components (all client-side)
│  ├─ TavusInterview.tsx         # Core interview component
│  │  ├─ Manages persona creation/reuse
│  │  ├─ Creates conversation
│  │  ├─ Renders iframe
│  │  └─ Bridges postMessage events
│  │
│  ├─ MetricsPanel.tsx           # Event log display
│  │  ├─ Shows UIMessage array
│  │  └─ Exposes window.__pushMetric() debug hook
│  │
│  ├─ TavusInterviewWebComponent.tsx  # Web Component wrapper
│  │  ├─ Registers <tavus-interview> custom element
│  │  ├─ Parses JSON attributes
│  │  └─ Dispatches CustomEvent("tavus:event")
│  │
│  └─ index.ts                   # Public exports
│
├─ lib/                          # Utilities
│  ├─ tavus-client.ts            # Tavus API client (fetch only)
│  │  ├─ createPersona()
│  │  ├─ createConversation()
│  │  ├─ getConversation() [optional]
│  │  ├─ buildSystemPrompt()
│  │  ├─ getReusablePersonaId()
│  │  └─ getReplicaId()
│  │
│  └─ index.ts                   # Public exports
│
├─ types/                        # TypeScript definitions
│  └─ index.ts                   # All data contracts
│
├─ examples/                     # Usage examples
│  └─ web-component-example.html # Standalone web component demo
│
├─ scripts/                      # Helper scripts
│  └─ setup.sh                   # Quick setup automation
│
├─ .env.local.example            # Environment template
├─ README.md                     # Main documentation
├─ CREAO_INTEGRATION.md          # Integration guide for Creao
├─ TROUBLESHOOTING.md            # Common issues & solutions
└─ ARCHITECTURE.md               # This file
```

## Security Model

### ⚠️ Hackathon Mode (Current)

```
API Key Location: Browser (NEXT_PUBLIC_*)
Security: ❌ Exposed to client
Use Case: ✅ Hackathon demos only
```

**Why this is acceptable for hackathons**:
- Fast iteration
- No server setup required
- Easy to deploy (Vercel, Netlify, etc.)
- Demo environment is controlled

**Why this is NOT acceptable for production**:
- API key is visible in browser DevTools
- Anyone can extract and abuse your key
- No rate limiting control
- No usage tracking per user

### 🔒 Production Mode (Recommended)

```
API Key Location: Server-side env var
Security: ✅ Protected
Architecture: Client → Your Server → Tavus API
```

**Implementation**:
1. Create API routes in Next.js:
   ```
   app/api/tavus/personas/route.ts
   app/api/tavus/conversations/route.ts
   ```

2. Move key to server-only env:
   ```
   TAVUS_API_KEY=...  # No NEXT_PUBLIC_ prefix
   ```

3. Update client to call your API:
   ```typescript
   const TAVUS_BASE_URL = "/api/tavus";
   ```

See [CREAO_INTEGRATION.md](CREAO_INTEGRATION.md) for full server proxy example.

## State Management

### Component State (No External Libraries)

```typescript
// TavusInterview.tsx
const [session, setSession] = useState<InterviewSession | null>(null);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

// page.tsx
const [events, setEvents] = useState<UIMessage[]>([]);
const [persona, setPersona] = useState<PersonaInput>(DEFAULT);
const [context, setContext] = useState<InterviewContext>(DEFAULT);
```

**Why no Redux/Zustand/etc?**
- State is simple and local
- No cross-component sharing needed
- Reduces bundle size
- Easier to drop into Creao

## Extension Points

### 1. Custom Metrics Collector

```typescript
<TavusInterview
  onEvent={(msg) => {
    // Wire into your analytics
    myAnalytics.track("tavus_event", msg);
  }}
/>
```

### 2. Dynamic Persona Generation

```typescript
function buildPersonaFromJob(job: JobDescription): PersonaInput {
  return {
    name: `${job.company} Recruiter`,
    systemPrompt: generatePromptFromJD(job),
    // ...
  };
}
```

### 3. Server Proxy for Production

```typescript
// Update TAVUS_BASE_URL in tavus-client.ts
const TAVUS_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api/tavus'  // Your server
  : 'https://tavusapi.com/v2';  // Direct (dev only)
```

### 4. Polling Conversation Status

```typescript
// Optional: Poll for conversation updates
const pollConversation = async (id: string) => {
  const data = await getConversation(id);
  console.log("Status:", data.status);
};
```

## Performance Considerations

### Bundle Size
- No external state libraries: **0 KB**
- No Tailwind CSS: **0 KB**
- No Tavus SDK: **0 KB** (using fetch directly)
- Total additional size: **~15 KB** (components + types)

### Network Calls
- Persona creation: **1 request** (or 0 if reusing)
- Conversation creation: **1 request**
- Total: **1-2 requests** to start interview

### Rendering
- All components are client-side (`"use client"`)
- Iframe is lazy-loaded (only when session exists)
- No SSR overhead

## Browser Compatibility

### Requirements
- Modern browser with ES6+ support
- WebRTC support (for camera/microphone in iframe)
- postMessage support (for event bridge)
- Custom Elements support (for web component)

### Tested On
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Not Supported
- IE11 (no ES6 modules)
- Old mobile browsers without WebRTC

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Static Export (Optional)
Not recommended - environment variables are baked in at build time.

### Recommended Platforms
- **Vercel**: Native Next.js support, easy env var management
- **Netlify**: Good Next.js support
- **Railway**: If you need server-side proxy later
- **Any Node.js host**: Works with `npm start`

## Testing Strategy

### Manual Testing Checklist
- [ ] Edit PersonaInput JSON → updates persona
- [ ] Edit InterviewContext JSON → updates context
- [ ] Toggle autoplay → starts interview immediately
- [ ] Click "Start Interview" → creates conversation
- [ ] Set NEXT_PUBLIC_TAVUS_PERSONA_ID → skips persona creation
- [ ] MetricsPanel shows events in real-time
- [ ] window.__pushMetric() adds debug events
- [ ] Iframe loads with camera/microphone permissions
- [ ] postMessage events appear in log
- [ ] Error states show clear messages

### Unit Testing (Future)
```bash
# Not included in this demo, but you could add:
npm install --save-dev jest @testing-library/react
```

Test files would go in `__tests__/`:
- `TavusInterview.test.tsx`
- `tavus-client.test.ts`
- `buildSystemPrompt.test.ts`

## Future Enhancements

### Potential Additions
1. **Recording**: Save interview transcripts
2. **Analytics**: Track question patterns, candidate engagement
3. **Multi-language**: i18n support for persona prompts
4. **A/B Testing**: Compare different persona configurations
5. **Webhooks**: React to Tavus conversation events
6. **Session Resume**: Allow candidates to reconnect to same interview

### Migration Path to Production
1. Add server API routes
2. Move API key to server env
3. Add authentication (user sessions)
4. Add database (store persona configs, interview results)
5. Add proper error tracking (Sentry, etc.)
6. Add monitoring (conversation success rate, latency)
7. Add rate limiting
8. Add usage quotas per user

## Questions?

- See [README.md](README.md) for basic usage
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- See [CREAO_INTEGRATION.md](CREAO_INTEGRATION.md) for embedding in Creao
