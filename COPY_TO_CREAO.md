# Copy to Creao - Quick Reference

Minimal files needed to embed Tavus Interview in Creao.

## Required Files (Only 7!)

Copy these folders/files to your Creao project:

```
creao-project/
├── components/
│   ├── TavusInterview.tsx          ← Core component
│   ├── MetricsPanel.tsx            ← Optional (for debugging)
│   └── TavusInterviewWebComponent.tsx  ← Optional (if using web component)
├── lib/
│   └── tavus-client.ts             ← Tavus API wrapper
└── types/
    └── tavus.ts                     ← Copy index.ts as tavus.ts
```

**Total**: 3 folders, 5-7 files (depending on what you need)

## Minimal Setup (3 files)

If you only need the React component:

### 1. Copy Types

```bash
cp types/index.ts creao/types/tavus.ts
```

### 2. Copy Client

```bash
cp lib/tavus-client.ts creao/lib/tavus-client.ts
```

Update import in `tavus-client.ts`:
```typescript
// Change this:
import { ... } from "@/types";

// To this:
import { ... } from "@/types/tavus";
```

### 3. Copy Component

```bash
cp components/TavusInterview.tsx creao/components/TavusInterview.tsx
```

Update imports in `TavusInterview.tsx`:
```typescript
// Change this:
import { ... } from "@/types";

// To this:
import { ... } from "@/types/tavus";
```

## Environment Variable

Add to Creao's `.env.local`:

```env
# ⚠️ HACKATHON ONLY - exposed in browser
NEXT_PUBLIC_TAVUS_API_KEY=your_key_here

# Optional: reuse persona
# NEXT_PUBLIC_TAVUS_PERSONA_ID=p123
```

## Usage in Creao Page

```typescript
// creao/app/interview/page.tsx
"use client";

import { TavusInterview } from "@/components/TavusInterview";
import { PersonaInput, InterviewContext } from "@/types/tavus";

export default function InterviewPage() {
  const persona: PersonaInput = {
    name: "Recruiter",
    systemPrompt: "You are conducting a technical interview...",
    attachContextFromInterview: true,
  };

  const context: InterviewContext = {
    company: "My Company",
    role: "Engineer",
  };

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <TavusInterview
        persona={persona}
        context={context}
        autoplay={true}
      />
    </div>
  );
}
```

## File-by-File Copy Commands

```bash
# Navigate to your Creao project
cd path/to/creao

# Create directories if needed
mkdir -p types lib components

# Copy types
cp path/to/tavus/types/index.ts types/tavus.ts

# Copy client
cp path/to/tavus/lib/tavus-client.ts lib/tavus-client.ts

# Copy component
cp path/to/tavus/components/TavusInterview.tsx components/TavusInterview.tsx

# Optional: Copy metrics panel
cp path/to/tavus/components/MetricsPanel.tsx components/MetricsPanel.tsx

# Optional: Copy web component
cp path/to/tavus/components/TavusInterviewWebComponent.tsx components/TavusInterviewWebComponent.tsx
```

## Import Path Updates

After copying, you need to update import paths in the copied files.

### In `lib/tavus-client.ts`:

```typescript
// Before (from this demo)
import { PersonaInput, InterviewContext, ... } from "@/types";

// After (in Creao)
import { PersonaInput, InterviewContext, ... } from "@/types/tavus";
```

### In `components/TavusInterview.tsx`:

```typescript
// Before
import { PersonaInput, InterviewContext, UIMessage } from "@/types";
import { createPersona, createConversation, ... } from "@/lib/tavus-client";

// After (if Creao uses different paths)
import { PersonaInput, InterviewContext, UIMessage } from "@/types/tavus";
import { createPersona, createConversation, ... } from "@/lib/tavus-client";
// (These should match Creao's tsconfig path mappings)
```

## Integration with Creao Analytics

Add event tracking:

```typescript
import { TavusInterview } from "@/components/TavusInterview";
import { creaoAnalytics } from "@/lib/analytics"; // Your Creao analytics

function InterviewPage() {
  const handleEvent = (message: UIMessage) => {
    // Send to Creao's existing metrics collector
    creaoAnalytics.track("tavus_event", {
      type: message.type,
      timestamp: message.timestamp,
      text: message.text,
    });
  };

  return (
    <TavusInterview
      persona={persona}
      context={context}
      onEvent={handleEvent}
    />
  );
}
```

## Styling in Creao

The components have minimal inline styling. Add Creao's styles:

```css
/* In your Creao CSS file */

.tavus-interview-container {
  width: 100%;
  height: 100%;
  border-radius: var(--creao-border-radius);
  overflow: hidden;
  background: var(--creao-surface);
}

.tavus-interview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.tavus-interview-error {
  background: var(--creao-error-background);
  color: var(--creao-error-text);
  padding: 2rem;
  border-radius: var(--creao-border-radius);
}
```

## Dynamic Persona from Creao Job Data

Generate persona from job description:

```typescript
import { useJobDescription } from "@/hooks/useJobDescription";
import { PersonaInput, InterviewContext } from "@/types/tavus";

function InterviewPage({ jobId }: { jobId: string }) {
  const { job } = useJobDescription(jobId);

  const persona: PersonaInput = {
    name: `${job.company} Interviewer`,
    systemPrompt: `Conduct a ${job.type} interview for ${job.title}.

Key requirements to assess:
${job.requirements.map(r => `- ${r}`).join('\n')}

Be professional and thorough.`,
    topics: job.skillsRequired,
    tone: "friendly",
    followUpStyle: "balanced",
    questionStyle: job.type === "technical" ? "technical" : "behavioral",
    maxQuestions: 6,
    attachContextFromInterview: true,
  };

  const context: InterviewContext = {
    company: job.company,
    role: job.title,
    seniority: job.level,
    jdHighlights: job.requirements,
  };

  return <TavusInterview persona={persona} context={context} autoplay />;
}
```

## Optional: Include Metrics Panel

If you want the debug panel:

```typescript
import { TavusInterview } from "@/components/TavusInterview";
import { MetricsPanel } from "@/components/MetricsPanel";
import { useState } from "react";

function InterviewPage() {
  const [events, setEvents] = useState<UIMessage[]>([]);

  return (
    <div>
      <TavusInterview
        persona={persona}
        context={context}
        onEvent={(msg) => setEvents(prev => [...prev, msg])}
      />
      <MetricsPanel events={events} />
    </div>
  );
}
```

## Testing After Copy

1. Check that TypeScript compiles:
   ```bash
   npm run build
   # or
   tsc --noEmit
   ```

2. Check for import errors:
   - All `@/types` imports resolve
   - All `@/lib` imports resolve
   - All `@/components` imports resolve

3. Check environment variable:
   ```typescript
   console.log(process.env.NEXT_PUBLIC_TAVUS_API_KEY ? 'Set' : 'Missing');
   ```

4. Test interview creation:
   - Navigate to your interview page
   - Should see "Start Interview" button or autoplay
   - Check browser console for logs
   - Iframe should load with Tavus conversation

## Checklist

- [ ] Copied 3 core files (types, client, component)
- [ ] Updated import paths to match Creao's structure
- [ ] Added `NEXT_PUBLIC_TAVUS_API_KEY` to `.env.local`
- [ ] Tested TypeScript compilation
- [ ] Created a test page using `<TavusInterview>`
- [ ] Verified interview starts and iframe loads
- [ ] (Optional) Wired up Creao analytics
- [ ] (Optional) Added Creao styling
- [ ] (Optional) Generated persona from job data

## Troubleshooting

### "Cannot find module '@/types'"

→ Update import path in copied files to match Creao's `tsconfig.json` paths.

### "API key not set"

→ Check `.env.local` has `NEXT_PUBLIC_TAVUS_API_KEY` and restart dev server.

### "Tavus API error (401)"

→ Verify API key is correct, check for typos.

### Component doesn't render

→ Make sure it's a client component (has `"use client"` at top).

## Advanced: Web Component in Creao

If parts of Creao use vanilla JS/HTML:

1. Copy `TavusInterviewWebComponent.tsx`
2. Register in your root layout:
   ```typescript
   import { useTavusWebComponent } from "@/components/TavusInterviewWebComponent";

   export default function RootLayout({ children }) {
     useTavusWebComponent(); // Register once
     return <html><body>{children}</body></html>;
   }
   ```

3. Use in any HTML:
   ```html
   <tavus-interview
     persona='{"name":"Interviewer","systemPrompt":"..."}'
     context='{"company":"Acme","role":"Engineer"}'
   ></tavus-interview>
   ```

## Need More Help?

- Full integration guide: [CREAO_INTEGRATION.md](CREAO_INTEGRATION.md)
- Troubleshooting: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
