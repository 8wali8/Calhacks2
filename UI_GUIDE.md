# UI Guide

Visual walkthrough of the Tavus Interview Demo interface.

## Main Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Tavus Interview Demo          [✓ API key set]                  │ ← Header
├──────────────────┬──────────────────────────────────────────────┤
│                  │                                              │
│  Persona Input   │              Interview                       │
│  ┌────────────┐  │  ┌────────────────────────────────────────┐ │
│  │{           │  │  │                                        │ │
│  │ "name":    │  │  │     [Start Interview Button]           │ │
│  │ "system... │  │  │                                        │ │
│  │}           │  │  │         (or iframe when running)       │ │
│  └────────────┘  │  │                                        │ │
│                  │  │                                        │ │
│ Interview Context│  │                                        │ │
│  ┌────────────┐  │  │                                        │ │
│  │{           │  │  │                                        │ │
│  │ "company"  │  │  │                                        │ │
│  │ "role":    │  │  └────────────────────────────────────────┘ │
│  │}           │  │                                              │
│  └────────────┘  │                                              │
│                  │                                              │
│  ☐ Autoplay      │                                              │
│                  │                                              │
├──────────────────┴──────────────────────────────────────────────┤
│ Event Log                              [5 events] [Clear]       │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ READY @ 10:30:45                                         │   │
│ │ └─ Conversation abc123 ready                             │   │
│ │                                                          │   │
│ │ CONNECTED @ 10:30:46                                     │   │
│ │ └─ Iframe loaded and ready                              │   │
│ └──────────────────────────────────────────────────────────┘   │
│ Debug: window.__pushMetric({ type: "note", ... })              │
└─────────────────────────────────────────────────────────────────┘
```

## Components Breakdown

### 1. Header (Top Bar)

```
┌─────────────────────────────────────────────────────────┐
│ Tavus Interview Demo                                    │
│                        ┌──────────────────────┐         │
│                        │ ✓ API key set        │ ← Badge │
│                        └──────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

**Badges show**:
- ⚠️ Red badge if API key missing
- 🔄 Blue badge if reusing persona (NEXT_PUBLIC_TAVUS_PERSONA_ID set)
- ✓ Green badge if API key is set and ready

### 2. Config Panel (Left Side)

```
┌──────────────────────┐
│ Persona Input        │
├──────────────────────┤
│ {                    │ ← JSON Editor
│   "name": "Tech...", │   (editable textarea)
│   "systemPrompt": ..│
│   "topics": [...],   │
│   "tone": "friendly",│
│   ...                │
│ }                    │
└──────────────────────┘

┌──────────────────────┐
│ Interview Context    │
├──────────────────────┤
│ {                    │ ← JSON Editor
│   "company": "Acme", │   (editable textarea)
│   "role": "Engineer",│
│   "seniority": ...,  │
│   ...                │
│ }                    │
└──────────────────────┘

┌──────────────────────┐
│ ☑ Autoplay on mount  │ ← Checkbox
└──────────────────────┘
```

**Features**:
- Real-time JSON validation
- Shows red error message if invalid JSON
- Auto-saves parsed values
- Scrollable textareas

### 3. Interview Panel (Center)

**State: Idle (before starting)**
```
┌────────────────────────┐
│      Interview         │
├────────────────────────┤
│                        │
│  ┌──────────────────┐  │
│  │ Start Interview  │  │ ← Button
│  └──────────────────┘  │
│                        │
└────────────────────────┘
```

**State: Loading**
```
┌────────────────────────┐
│      Interview         │
├────────────────────────┤
│                        │
│  Starting interview... │ ← Loading text
│                        │
└────────────────────────┘
```

**State: Running (with iframe)**
```
┌────────────────────────────────────┐
│      Interview                     │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │                                │ │
│ │   Tavus Conversation Iframe    │ │
│ │   (camera, microphone active)  │ │
│ │                                │ │
│ │   [Interviewer avatar]         │ │
│ │                                │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

**State: Error**
```
┌────────────────────────┐
│      Interview         │
├────────────────────────┤
│ ┌────────────────────┐ │
│ │ Error              │ │
│ │ Tavus API error... │ │
│ │ ┌──────────────┐   │ │
│ │ │    Retry     │   │ │ ← Button
│ │ └──────────────┘   │ │
│ └────────────────────┘ │
└────────────────────────┘
```

### 4. Metrics Panel (Bottom)

```
┌────────────────────────────────────────────────┐
│ Event Log              [5 events]    [Clear]   │ ← Header
├────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────┐ │
│ │ READY           @ 10:30:45                 │ │ ← Event item
│ │ └─ Conversation abc123 ready               │ │   (green border)
│ │                                            │ │
│ │ CONNECTED       @ 10:30:46                 │ │ ← Event item
│ │ └─ Iframe loaded and ready                 │ │   (blue border)
│ │                                            │ │
│ │ NOTE            @ 10:30:50                 │ │ ← Event item
│ │ └─ {"type":"user_joined"}                  │ │   (gray border)
│ │   ▼ Payload                                │ │
│ │     {                                      │ │   (expandable)
│ │       "type": "user_joined",               │ │
│ │       "timestamp": 1234567890              │ │
│ │     }                                      │ │
│ │                                            │ │
│ │ ERROR           @ 10:31:00                 │ │ ← Event item
│ │ └─ Network timeout                         │ │   (red border/bg)
│ └────────────────────────────────────────────┘ │
│ Debug: window.__pushMetric({ ... })            │ ← Footer hint
└────────────────────────────────────────────────┘
```

**Event Types & Colors**:
- `READY` - Green border (persona/conversation created)
- `CONNECTED` - Blue border (iframe loaded)
- `DISCONNECTED` - Orange border (unmounted)
- `ERROR` - Red border + red background
- `NOTE` - Gray border (opaque iframe messages)

## Responsive Behavior

### Desktop (>1024px)
```
[Config Panel]  [Interview Panel]
     400px            Flex 1
```

### Tablet (768px - 1024px)
Config panel stays at 400px, interview panel adjusts.

### Mobile (<768px)
Would stack vertically (not optimized in this demo, but easy to add with media queries).

## Interactions

### JSON Editor Validation

**Valid JSON**:
```
┌──────────────────────┐
│ Persona Input        │
├──────────────────────┤
│ {                    │
│   "name": "...",     │ ← Turns persona object
│ }                    │   into valid PersonaInput
└──────────────────────┘
```

**Invalid JSON**:
```
┌──────────────────────┐
│ Persona Input        │
├──────────────────────┤
│ ⚠ Unexpected token } │ ← Error message (red)
│                      │
│ {                    │
│   "name": "...",,    │ ← Extra comma causes error
│ }                    │
└──────────────────────┘
```

### Autoplay Toggle

**Off (default)**:
```
☐ Autoplay on mount
```
→ Shows "Start Interview" button, waits for user click

**On**:
```
☑ Autoplay on mount
```
→ Starts interview immediately on mount

### Event Log Actions

**Event count**: Shows total number of events received

**Clear button**: Clears all events (both external and debug)

**Expandable payload**: Click "▼ Payload" to see full JSON

**Auto-scroll**: Automatically scrolls to latest event

## Color Scheme

```css
Background:      #f5f5f5 (light gray)
Cards:           #ffffff (white)
Borders:         #e0e0e0 (medium gray)
Text:            #1a1a1a (near black)
Primary button:  #1976d2 (blue)
Error:           #c00 (red) on #fee (light red)
Success badge:   #2e7d32 (green) on #e8f5e9 (light green)
Info badge:      #1565c0 (blue) on #e3f2fd (light blue)
```

## Typography

```
Headers:         14px - 20px, weight 600
Body text:       14px, weight 400
Code/JSON:       12px, monospace (Courier New)
Event log:       11px - 12px, weight varies
Badges:          12px, weight 500
```

## CSS Classes Reference

### Layout
- `.page-container` - Full viewport flex column
- `.main-layout` - Horizontal split (config + interview)
- `.config-panel` - Left sidebar (400px)
- `.interview-panel` - Center area (flex 1)
- `.metrics-container` - Bottom panel (300px fixed)

### Components
- `.json-editor` - Textarea for JSON editing
- `.tavus-interview-iframe` - Iframe for Tavus conversation
- `.metric-item` - Individual event in log
- `.badge` - Header status badge

### States
- `.tavus-interview-loading` - Loading state
- `.tavus-interview-error` - Error state
- `.tavus-interview-idle` - Waiting for start
- `.metric-ready` - Ready event styling
- `.metric-error` - Error event styling

## Accessibility

- ✅ Semantic HTML (header, main, aside, footer)
- ✅ Proper heading hierarchy (h1, h2, h3)
- ✅ Focusable interactive elements
- ✅ Labels for form inputs
- ⚠️ Iframe accessibility depends on Tavus implementation
- ⚠️ No ARIA labels (could be added for screen readers)

## Browser DevTools View

Open browser console to see:

```
[TavusInterview] Reusing persona: p123
[TavusInterview] Creating conversation...
[TavusInterview] Conversation created: c456
[TavusInterview] URL: https://...
[TavusInterview] Iframe loaded
[TavusInterview] Received message from iframe: {...}
```

## Web Component Example

When using `<tavus-interview>`:

```html
<tavus-interview
  persona='{"name":"..."}'
  context='{"company":"..."}'
  autoplay="true"
></tavus-interview>
```

Renders the same interview panel, but as a standalone web component.

Events are dispatched to `window`:

```js
window.addEventListener('tavus:event', (e) => {
  console.log(e.detail); // UIMessage
});
```
