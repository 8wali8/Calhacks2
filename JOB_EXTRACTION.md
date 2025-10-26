# Dynamic Job Extraction Integration

The app now dynamically extracts job information from a URL and generates personalized interviews.

## What Changed

### 1. New API Route: `/api/extract-job`
**File**: `app/api/extract-job/route.ts`

Uses your exact script logic:
1. **Tavily** searches and summarizes the job posting
2. **OpenAI (gpt-4o-mini)** extracts structured data:
   - Company name
   - Role title
   - Job summary
   - 3 generated interview questions

### 2. Completely Redesigned Frontend
**File**: `app/page.tsx`

#### New User Flow:
```
1. Enter Job URL
   ↓
2. Click "Analyze Job"
   ↓
3. See extracted company, role, questions
   ↓
4. Click "Start Interview"
   ↓
5. Interview begins with AI recruiter
   ↓
6. Analytics track performance in real-time
```

#### Features:
- Pre-filled with Meta job URL as example
- Clean single-input interface
- Loading states during extraction
- Error handling with clear messages
- Shows extracted data before starting
- "Try Different Job" button to reset

### 3. Dynamic Persona & Context
The interview is now fully customized based on extracted data:

**Persona (AI Recruiter)**:
- Name: `{Company} Recruiter`
- System prompt includes:
  - Company name
  - Role title
  - Generated interview questions

**Interview Context**:
- Company from extraction
- Role from extraction
- Summary as job highlights
- Questions integrated into context

### 4. Environment Variables
**Added to `.env.local`**:
```env
TAVILY_API_KEY=tvly-dev-...
OPENAI_API_KEY=sk-svcacct-...
```

These are **server-side only** (not exposed to browser).

## How It Works

```
User enters job URL
    ↓
Frontend calls /api/extract-job
    ↓
Server fetches job data via Tavily
    ↓
Server extracts structure via OpenAI
    ↓
Returns: { company, role, summary, questions }
    ↓
Frontend builds persona + context dynamically
    ↓
Starts Tavus interview with custom data
    ↓
Analytics track performance
```

## API Response Format

```typescript
{
  company: "Meta",
  role: "Software Engineer, Infrastructure",
  summary: "Build large-scale infrastructure...",
  questions: [
    "Tell me about your experience with distributed systems",
    "How do you approach system design?",
    "What's your experience with large-scale infrastructure?"
  ]
}
```

## Example Usage

1. **Default Meta Job** (pre-filled):
   ```
   https://www.metacareers.com/jobs/1471056164046415
   ```

2. **Try any job URL**:
   - LinkedIn jobs
   - Indeed postings
   - Company career pages
   - Any public job posting

3. **Generated Interview**:
   - AI interviewer acts as recruiter from that company
   - Asks questions relevant to that specific role
   - Uses the 3 generated questions as guidance
   - Tracks your performance with analytics

## Files Modified

### New Files:
- `app/api/extract-job/route.ts` - API endpoint
- `JOB_EXTRACTION.md` - This documentation

### Modified Files:
- `app/page.tsx` - Completely refactored for job URL input
- `package.json` - Added `@tavily/core`, `openai`, `zod`
- `.env.local` - Added Tavily and OpenAI keys
- `.env.local.example` - Added key templates

### Removed:
- JSON editors for persona/context/objectives
- Hardcoded company/role data
- Manual configuration UI

## Dependencies Added

```json
{
  "@tavily/core": "^1.1.0",    // Web search & summarization
  "openai": "^4.77.0",          // GPT-4o-mini for extraction
  "zod": "^3.23.8"              // Schema validation
}
```

## Running the App

```bash
cd both/tavus
npm install  # Install new dependencies
npm run dev  # Start on port 3001
```

Visit `http://localhost:3001`:
1. See pre-filled Meta job URL
2. Click "Analyze Job"
3. Wait for extraction (~5-10 seconds)
4. Review extracted data
5. Click "Start Interview"
6. Practice with live analytics!

## Notes

- API keys are server-side only (secure)
- Job extraction happens on-demand (not pre-generated)
- Generated questions guide the AI interviewer
- Works with any publicly accessible job URL
- Analytics still track all performance metrics
- Summary stats shown after interview ends
