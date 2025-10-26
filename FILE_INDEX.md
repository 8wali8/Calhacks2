# Complete File Index

Quick reference for all files in the project.

## 📂 Project Structure

```
tavus/
├── 📄 Configuration Files (5)
│   ├── .env.local.example       # Environment variable template
│   ├── .eslintrc.json          # ESLint configuration
│   ├── .gitignore              # Git ignore rules
│   ├── next.config.js          # Next.js configuration
│   ├── package.json            # Dependencies and scripts
│   └── tsconfig.json           # TypeScript configuration
│
├── 📚 Documentation (9)
│   ├── ARCHITECTURE.md         # System design & data flow
│   ├── COPY_TO_CREAO.md       # Quick copy guide for Creao
│   ├── CREAO_INTEGRATION.md   # Full Creao integration guide
│   ├── FILE_INDEX.md          # This file
│   ├── PROJECT_SUMMARY.md     # Complete project overview
│   ├── QUICKSTART.md          # 60-second setup guide
│   ├── README.md              # Main documentation
│   ├── TROUBLESHOOTING.md     # Debug guide
│   └── UI_GUIDE.md            # Visual interface walkthrough
│
├── 🎨 App (Next.js App Router) (3)
│   ├── app/layout.tsx         # Root layout
│   ├── app/page.tsx           # Main demo page
│   └── app/globals.css        # Global styles (no Tailwind)
│
├── 🧩 Components (4)
│   ├── components/TavusInterview.tsx          # Main interview component
│   ├── components/MetricsPanel.tsx            # Event log display
│   ├── components/TavusInterviewWebComponent.tsx  # Web component wrapper
│   └── components/index.ts                    # Public exports
│
├── 🛠️ Libraries (2)
│   ├── lib/tavus-client.ts    # Tavus API client (fetch only)
│   └── lib/index.ts           # Public exports
│
├── 📦 Types (1)
│   └── types/index.ts         # TypeScript contracts
│
├── 📖 Examples (1)
│   └── examples/web-component-example.html    # Standalone demo
│
└── 🚀 Scripts (1)
    └── scripts/setup.sh       # Quick setup automation

Total: 26 files
```

## 📄 File Details

### Configuration Files

| File | Purpose | Required |
|------|---------|----------|
| `.env.local.example` | Template for environment variables | ✅ Copy to `.env.local` |
| `.eslintrc.json` | ESLint rules for code quality | ✅ Yes |
| `.gitignore` | Files to exclude from Git | ✅ Yes |
| `next.config.js` | Next.js build configuration | ✅ Yes |
| `package.json` | Dependencies and npm scripts | ✅ Yes |
| `tsconfig.json` | TypeScript compiler options | ✅ Yes |

### Documentation Files

| File | Purpose | Read First |
|------|---------|------------|
| `README.md` | Main documentation, setup guide | ⭐ Start here |
| `QUICKSTART.md` | 60-second quick start | ⭐ If in a hurry |
| `COPY_TO_CREAO.md` | Minimal copy guide for Creao | ⭐ For integration |
| `CREAO_INTEGRATION.md` | Full Creao integration patterns | When embedding |
| `TROUBLESHOOTING.md` | Common issues and solutions | When stuck |
| `ARCHITECTURE.md` | System design, data flow | For understanding |
| `UI_GUIDE.md` | Visual interface walkthrough | For UI reference |
| `PROJECT_SUMMARY.md` | Complete project overview | For team handoff |
| `FILE_INDEX.md` | This file - file reference | Navigation |

### Source Code Files

#### App Router (Next.js 14)

| File | Purpose | Lines | Type |
|------|---------|-------|------|
| `app/layout.tsx` | Root HTML layout | ~20 | Server Component |
| `app/page.tsx` | Main demo page with editors | ~200 | Client Component |
| `app/globals.css` | All styling (no Tailwind) | ~400 | CSS |

#### Components

| File | Purpose | Lines | Type |
|------|---------|-------|------|
| `components/TavusInterview.tsx` | Core interview component | ~150 | Client Component |
| `components/MetricsPanel.tsx` | Event log display | ~100 | Client Component |
| `components/TavusInterviewWebComponent.tsx` | Web component wrapper | ~80 | Client Component |
| `components/index.ts` | Public exports | ~10 | Module |

#### Libraries

| File | Purpose | Lines | Type |
|------|---------|-------|------|
| `lib/tavus-client.ts` | Tavus API client (fetch) | ~200 | Utility |
| `lib/index.ts` | Public exports | ~10 | Module |

#### Types

| File | Purpose | Lines | Type |
|------|---------|-------|------|
| `types/index.ts` | All TypeScript contracts | ~100 | Type Definitions |

### Examples & Scripts

| File | Purpose | Type |
|------|---------|------|
| `examples/web-component-example.html` | Standalone web component demo | HTML |
| `scripts/setup.sh` | Quick setup automation | Bash Script |

## 🎯 Files by Use Case

### "I just want to run it"
1. `QUICKSTART.md` - Read first
2. `.env.local.example` - Copy to `.env.local`
3. `scripts/setup.sh` - Run this
4. `app/page.tsx` - View this in browser

### "I want to understand it"
1. `README.md` - Main docs
2. `ARCHITECTURE.md` - System design
3. `types/index.ts` - Data contracts
4. `lib/tavus-client.ts` - API calls
5. `components/TavusInterview.tsx` - Core logic

### "I want to embed in Creao"
1. `COPY_TO_CREAO.md` - Quick copy guide
2. `CREAO_INTEGRATION.md` - Full patterns
3. `components/TavusInterview.tsx` - Copy this
4. `lib/tavus-client.ts` - Copy this
5. `types/index.ts` - Copy this

### "Something is broken"
1. `TROUBLESHOOTING.md` - Debug guide
2. `README.md` - Check setup
3. Browser console - Check logs
4. `.env.local` - Verify API key

### "I want to customize"
1. `types/index.ts` - Data contracts
2. `components/TavusInterview.tsx` - Component logic
3. `lib/tavus-client.ts` - API calls
4. `app/globals.css` - Styling

## 📊 Code Statistics

```
Total Lines of Code: ~1,500
  - TypeScript/TSX: ~900
  - CSS: ~400
  - Documentation: ~3,000
  - Comments: ~200

Files by Type:
  - TypeScript: 11
  - CSS: 1
  - Markdown: 9
  - JSON: 3
  - JavaScript: 1
  - HTML: 1
  - Bash: 1

Total Size: ~150 KB (excluding node_modules)
```

## 🔍 Quick Find

### Components
- Main interview component: `components/TavusInterview.tsx`
- Metrics panel: `components/MetricsPanel.tsx`
- Web component: `components/TavusInterviewWebComponent.tsx`

### Types
- All contracts: `types/index.ts`
  - PersonaInput
  - InterviewContext
  - InterviewSession
  - UIMessage
  - Tavus API types

### API Client
- Fetch wrapper: `lib/tavus-client.ts`
  - createPersona()
  - createConversation()
  - getConversation()
  - buildSystemPrompt()

### Styling
- All CSS: `app/globals.css`
  - Layout classes
  - Component styles
  - Color scheme
  - Typography

### Configuration
- TypeScript: `tsconfig.json`
- Next.js: `next.config.js`
- Environment: `.env.local.example`

## 🚀 Entry Points

### For Development
1. Start: `npm run dev`
2. Entry: `app/page.tsx`
3. Opens: http://localhost:3000

### For Production
1. Build: `npm run build`
2. Start: `npm start`
3. Serves: Optimized static assets

### For Embedding
1. Import: `import { TavusInterview } from '@/components/TavusInterview'`
2. Use: `<TavusInterview persona={...} context={...} />`
3. Events: `onEvent={(msg) => ...}`

### For Web Component
1. Register: `useTavusWebComponent()`
2. Use: `<tavus-interview persona="..." context="..." />`
3. Events: `window.addEventListener('tavus:event', ...)`

## 📝 Maintenance Notes

### Files You Can Safely Modify
- ✅ `app/page.tsx` - Demo UI, change as needed
- ✅ `app/globals.css` - Styling, customize freely
- ✅ `.env.local` - Your local config

### Files You Should Not Modify (without care)
- ⚠️ `components/TavusInterview.tsx` - Core logic
- ⚠️ `lib/tavus-client.ts` - API calls
- ⚠️ `types/index.ts` - Contracts

### Files Generated (don't commit)
- ❌ `node_modules/` - Dependencies
- ❌ `.next/` - Build output
- ❌ `.env.local` - Your secrets

## 🔗 File Dependencies

```
app/page.tsx
  └─ components/TavusInterview.tsx
      ├─ lib/tavus-client.ts
      │   └─ types/index.ts
      └─ types/index.ts

app/page.tsx
  └─ components/MetricsPanel.tsx
      └─ types/index.ts

components/TavusInterviewWebComponent.tsx
  ├─ components/TavusInterview.tsx
  └─ types/index.ts
```

## 📦 What to Include When...

### Shipping to Creao
Copy these files:
- ✅ `components/TavusInterview.tsx`
- ✅ `lib/tavus-client.ts`
- ✅ `types/index.ts`
- ✅ (Optional) `components/MetricsPanel.tsx`

### Sharing as Package
Include:
- ✅ All `components/`
- ✅ All `lib/`
- ✅ All `types/`
- ✅ `README.md`
- ✅ `package.json`

### Demo/Presentation
Show:
- ✅ `app/page.tsx` (running in browser)
- ✅ `README.md` (setup instructions)
- ✅ Browser console (event logs)
