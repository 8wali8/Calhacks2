# Troubleshooting Guide

Common issues and solutions for the Tavus Interview Demo.

## Setup Issues

### "NEXT_PUBLIC_TAVUS_API_KEY is not set"

**Problem**: API key not found in environment.

**Solution**:
1. Check that `.env.local` exists in the project root
2. Verify the key is named exactly `NEXT_PUBLIC_TAVUS_API_KEY`
3. Restart the dev server after adding the key (`npm run dev`)
4. Make sure there are no spaces around the `=` sign

```env
# ❌ Wrong
NEXT_PUBLIC_TAVUS_API_KEY = abc123

# ✅ Correct
NEXT_PUBLIC_TAVUS_API_KEY=abc123
```

### "Module not found" errors

**Problem**: Dependencies not installed.

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
# or
pnpm install
```

### Port 3000 already in use

**Problem**: Another process is using port 3000.

**Solution**:
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on a different port
npm run dev -- -p 3001
```

## API Issues

### "Tavus API error (401)"

**Problem**: Invalid or missing API key.

**Solutions**:
1. Verify your key at https://platform.tavus.io
2. Check for typos in `.env.local`
3. Make sure you copied the full key (no truncation)
4. Try regenerating the key in the Tavus dashboard

### "Tavus API error (403)"

**Problem**: Insufficient permissions or quota exceeded.

**Solutions**:
1. Check your Tavus account limits
2. Verify API key has correct permissions
3. Check if you've hit rate limits (wait and retry)

### "Tavus API error (404)"

**Problem**: Endpoint not found or resource doesn't exist.

**Solutions**:
1. If creating persona fails: Check that the Tavus API hasn't changed
2. If using `NEXT_PUBLIC_TAVUS_PERSONA_ID`: Verify the persona exists
   ```bash
   curl -H "x-api-key: YOUR_KEY" \
     https://tavusapi.com/v2/personas/YOUR_PERSONA_ID
   ```

### "Tavus API error (422)"

**Problem**: Invalid request payload.

**Solutions**:
1. Check your PersonaInput JSON for required fields
2. Verify `systemPrompt` is not empty
3. Check that `name` field is present

### Network/CORS errors

**Problem**: Browser blocks requests to Tavus API.

**Solutions**:

**Option 1 - Development**: Disable CORS in browser (Chrome):
```bash
open -na "Google Chrome" --args --disable-web-security --user-data-dir=/tmp/chrome-dev
```

**Option 2 - Production**: Add a server proxy (see [CREAO_INTEGRATION.md](CREAO_INTEGRATION.md))

## Component Issues

### Iframe not loading

**Problem**: `conversation_url` embedded but nothing shows.

**Debugging**:
1. Check browser console for errors
2. Verify the URL in the iframe src attribute
3. Check if the conversation was created successfully:
   - Look for "Conversation created" log in console
   - Verify `conversationId` and `conversationUrl` are present

**Solutions**:
- Make sure iframe has correct permissions:
  ```tsx
  allow="camera; microphone; autoplay; clipboard-read; clipboard-write"
  ```
- Check referrer policy:
  ```tsx
  referrerPolicy="strict-origin-when-cross-origin"
  ```

### No events in MetricsPanel

**Problem**: Event log is empty even though interview is running.

**Solutions**:
1. Check that `onEvent` prop is passed to `<TavusInterview>`
2. Verify events array is passed to `<MetricsPanel events={events}>`
3. Check browser console for postMessage security errors
4. Try the debug hook:
   ```js
   window.__pushMetric({
     type: "note",
     timestamp: Date.now(),
     text: "Test event"
   })
   ```

### Autoplay not working

**Problem**: Interview doesn't start automatically.

**Solutions**:
1. Verify `autoplay={true}` is set
2. Check that there are no JSON validation errors in persona/context
3. Look for errors in browser console
4. Make sure API key is set correctly

### Persona reuse not working

**Problem**: New persona created even with `NEXT_PUBLIC_TAVUS_PERSONA_ID` set.

**Solutions**:
1. Restart dev server after setting the env var
2. Check spelling: `NEXT_PUBLIC_TAVUS_PERSONA_ID` (not `PERSONA_ID`)
3. Verify the persona ID is valid (starts with `p`)
4. Check browser console for logs showing persona reuse

## Build/Deploy Issues

### Build fails with type errors

**Problem**: TypeScript compilation errors.

**Solutions**:
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Environment variables not available in production

**Problem**: `NEXT_PUBLIC_*` vars work locally but not in production.

**Solutions**:
1. Verify vars are set in your hosting platform (Vercel, Netlify, etc.)
2. Rebuild and redeploy after adding env vars
3. Check that vars start with `NEXT_PUBLIC_` (required for client-side access)

## Web Component Issues

### `<tavus-interview>` not recognized

**Problem**: Custom element not defined.

**Solutions**:
1. Make sure you called `useTavusWebComponent()` in your app
2. Or manually call `registerTavusWebComponent()` before using the element
3. Check browser console for registration errors

### Events not firing from web component

**Problem**: `tavus:event` CustomEvent not received.

**Solutions**:
1. Listen on `window`, not the element:
   ```js
   window.addEventListener('tavus:event', handler);
   ```
2. Check that the listener is added before the component mounts
3. Verify event is bubbling (check `event.bubbles` is `true`)

## Performance Issues

### Page is slow to load

**Solutions**:
1. Reduce size of persona `systemPrompt` (keep under 2000 chars)
2. Minimize `jdHighlights` array length
3. Consider lazy-loading the component:
   ```tsx
   const TavusInterview = dynamic(() => import('@/components/TavusInterview'), {
     ssr: false,
   });
   ```

### Iframe takes long to load

**Problem**: `conversation_url` is slow to respond.

**Solutions**:
1. This is a Tavus backend issue - check their status page
2. Add a timeout and retry mechanism
3. Show a better loading state to the user

## Debug Checklist

When something isn't working:

- [ ] Check browser console for errors
- [ ] Verify `.env.local` has `NEXT_PUBLIC_TAVUS_API_KEY`
- [ ] Restart dev server after changing env vars
- [ ] Check Network tab in DevTools for failed API calls
- [ ] Verify JSON in persona/context editors is valid
- [ ] Check that you're not hitting Tavus rate limits
- [ ] Try with default persona/context values
- [ ] Clear browser cache and hard reload
- [ ] Check that iframe src is a valid URL

## Still Stuck?

1. Check the [README.md](README.md) for setup instructions
2. Review [CREAO_INTEGRATION.md](CREAO_INTEGRATION.md) for integration patterns
3. Look at the example in [examples/web-component-example.html](examples/web-component-example.html)
4. Check Tavus API docs: https://docs.tavus.io
5. Inspect the source code - it's heavily commented

## Common Console Commands

```js
// Test if API key is set
console.log(process.env.NEXT_PUBLIC_TAVUS_API_KEY ? 'Key is set' : 'Key missing');

// Test if persona ID is set
console.log(process.env.NEXT_PUBLIC_TAVUS_PERSONA_ID || 'No persona ID');

// Manually trigger a test event
window.__pushMetric?.({
  type: "note",
  timestamp: Date.now(),
  text: "Manual test event"
});

// Check if web component is registered
console.log(customElements.get('tavus-interview') ? 'Registered' : 'Not registered');

// Listen for all Tavus events
window.addEventListener('tavus:event', (e) => {
  console.log('Tavus event:', e.detail);
});
```
