# Quick Start Guide

Get up and running in 60 seconds.

## 1. Setup (30 seconds)

```bash
# Clone or navigate to the project
cd tavus

# Run setup script
bash scripts/setup.sh

# Or manually:
cp .env.local.example .env.local
npm install
```

## 2. Configure (15 seconds)

Edit `.env.local`:

```env
NEXT_PUBLIC_TAVUS_API_KEY=your_key_from_tavus_platform
```

Get your key: https://platform.tavus.io

## 3. Run (15 seconds)

```bash
npm run dev
```

Open http://localhost:3000

## That's It!

You should see:
- ✅ Left panel with JSON editors
- ✅ Center panel with interview UI
- ✅ Bottom panel with event log

## First Test

1. Click "Start Interview" in the center panel
2. Watch the event log at the bottom
3. You should see:
   - `ready` event (persona + conversation created)
   - `connected` event (iframe loaded)
   - Tavus interview iframe with camera/mic permissions

## Common Issues

### "API key not set" warning

→ Edit `.env.local` and add your key, then restart:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Port 3000 in use

→ Run on a different port:
```bash
npm run dev -- -p 3001
```

### "Module not found"

→ Install dependencies:
```bash
npm install
```

## Next Steps

- **Edit the persona**: Change the JSON in the left panel
- **Reuse a persona**: Set `NEXT_PUBLIC_TAVUS_PERSONA_ID` in `.env.local`
- **Enable autoplay**: Check the "Autoplay on mount" box
- **Test events**: Open browser console and type:
  ```js
  window.__pushMetric({ type: "note", timestamp: Date.now(), text: "test" })
  ```

## Full Documentation

- [README.md](README.md) - Complete setup and usage
- [CREAO_INTEGRATION.md](CREAO_INTEGRATION.md) - Embed in Creao
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Fix common issues
- [ARCHITECTURE.md](ARCHITECTURE.md) - How it all works

## One-Liner for Demos

```bash
cp .env.local.example .env.local && \
  echo "NEXT_PUBLIC_TAVUS_API_KEY=your_key" > .env.local && \
  npm install && \
  npm run dev
```

(Replace `your_key` with your actual Tavus API key)
