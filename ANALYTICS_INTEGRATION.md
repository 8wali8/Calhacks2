# Analytics Integration

The analytics from `analytics-lab/` have been integrated directly into the Tavus interview app.

## What Was Added

### Files Copied
All analytics functionality from `analytics-lab/` has been integrated:

- **Core Libraries** (`lib/analytics/`):
  - `analyticsController.ts` - Main orchestration engine
  - `metricsBus.ts` - Pub/sub event bus
  - `config.ts` - Configuration constants
  - `scoring.ts` - Metrics scoring functions
  - `asr.ts` - Speech recognition service
  - `goemotions.ts` - Emotion classification
  - `types.d.ts` - TypeScript definitions

- **Workers & Worklets**:
  - `workers/faceWorker.ts` - Face detection (MediaPipe FaceMesh)
  - `public/worklets/analyzer.worklet.js` - Audio analysis (pitch/RMS)

- **React Components**:
  - `components/AnalyticsPanel.tsx` - **NEW** - Main analytics UI for Tavus
  - `components/LiveBadges.tsx` - Live metrics display
  - `hooks/useMetrics.ts` - Metrics subscription hook

### Dependencies Added
```json
{
  "@tensorflow-models/face-landmarks-detection": "^1.0.2",
  "@tensorflow/tfjs": "^4.15.0",
  "@xenova/transformers": "^2.17.2",
  "tailwindcss": "^3.4.1",
  "autoprefixer": "^10.4.17",
  "postcss": "^8.4.33"
}
```

### Configuration Files
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `app/globals.css` - Added Tailwind directives

## How It Works

### Auto-Start/Stop
Analytics automatically start when the Tavus interview begins and stop when it ends:

1. **Interview Connected** → Analytics start recording
2. **Interview Running** → Live metrics displayed at bottom
3. **Interview Ended** → Analytics stop

### Integration Point
[app/page.tsx](app/page.tsx):
- Added `AnalyticsPanel` component to footer
- Tracks interview state via `isInterviewRunning`
- Analytics panel receives state updates from Tavus interview events

### Metrics Tracked
Real-time metrics displayed in colored badges:
- **WPM** - Words per minute (from speech recognition)
- **Pitch** - Voice pitch in Hz
- **Pause** - Pause ratio percentage
- **Fillers** - Filler words per minute (um, uh, like, etc.)
- **Blink** - Blinks per minute (from face detection)
- **Gaze Stability** - Eye movement stability
- **Emotion** - Detected emotions from speech

## Running the App

```bash
cd both/tavus
npm install  # Install new dependencies
npm run dev  # Start on port 3001
```

Open `http://localhost:3001` and start an interview. Analytics will appear at the bottom and auto-start when the interview connects.

### Build Configuration

The `next.config.js` has been configured to exclude `onnxruntime-node` (Node.js native bindings) from the bundle. This ensures:
- Transformers.js uses the browser-compatible WASM backend
- No native `.node` files are bundled
- Build works correctly in Next.js environment

## Architecture

```
Interview Start (Tavus iframe loads)
  ↓
Event: 'connected' emitted
  ↓
isInterviewRunning = true
  ↓
AnalyticsPanel starts controller
  ↓
  - Requests camera/mic
  - Spawns face worker (TensorFlow.js)
  - Starts audio worklet (pitch detection)
  - Starts ASR (speech recognition)
  - Publishes metrics at 10 Hz
  ↓
LiveBadges component displays real-time metrics
  ↓
Interview End
  ↓
isInterviewRunning = false
  ↓
Analytics stop, cleanup resources
```

## No Changes to analytics-lab

The `analytics-lab/` folder remains completely unchanged. All files were **copied** to `tavus/` and their import paths updated to work within the Tavus structure.

## Zero Refactor Risk

- Original analytics logic preserved 100%
- No modifications to core analytics algorithms
- Only integration layer added (AnalyticsPanel component)
- Import paths adjusted for new location

## Video Streams

The analytics use a **separate video stream** from the Tavus interview iframe. The AnalyticsPanel creates its own hidden `<video>` element to capture the user's camera for analytics processing.

This means two independent video streams:
1. **Tavus iframe** - Interview video
2. **Analytics panel** - Hidden video for metrics (face detection, etc.)
