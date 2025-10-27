# Reddit API Error: Root Cause & Fix

## TL;DR

**Problem**: Menu action fails with "permissions not enabled for this context"

**Root Cause**: Menu handlers run in server context without `Devvit.configure({ redditAPI: true })`

**Solution**: Use scheduler jobs to bridge server context → main context with Reddit API access

---

## Quick Diagnosis

### ✅ What's Working:
- Devvit.configure() IS in main.tsx (line 4-8) ✅
- Built bundle HAS the configuration (dist/main.js:3918) ✅
- Reddit API works in Custom Post render context ✅

### ❌ What's Failing:
- Menu handler calling `reddit.submitCustomPost()` ❌
- Server/index.ts has NO Devvit.configure() ❌

---

## Architecture Problem

```
devvit.json → Menu action → Server Bundle (dist/server/index.cjs)
                            ❌ No Devvit.configure()
                            ❌ No Reddit API access

devvit.json → Custom Post → Main Bundle (dist/main.js)
                            ✅ Has Devvit.configure()
                            ✅ Has Reddit API access
```

---

## The Fix (3 Steps)

### 1. Add Scheduler Job (main.tsx)

After line 117, add:

```typescript
Devvit.addSchedulerJob({
  name: 'menu-create-post',
  onRun: async (event, context) => {
    const { caseId, title, subredditName } = event.data;

    const post = await context.reddit.submitCustomPost({
      title,
      subredditName,
      postData: { caseId, gameState: 'initial', score: 0 }
    });

    console.log(`✅ Post created: ${post.id}`);
    return { postId: post.id };
  }
});
```

### 2. Update Menu Handler (server/index.ts)

Replace post creation with scheduler trigger:

```typescript
// OLD (doesn't work):
const post = await createPost({ caseId, title, subredditName });

// NEW (works):
await context.scheduler.runJob({
  name: 'menu-create-post',
  runAt: new Date(Date.now() + 3000),
  data: { caseId: newCase.id, title: postTitle, subredditName: context.subredditName }
});

res.json({
  showToast: {
    text: '🎲 New mystery created! Check the feed in a moment.',
    appearance: 'success'
  }
});
```

### 3. Build & Test

```bash
npm run build
devvit playtest
```

---

## Why This Works

```
1. Menu handler (server context)
   ├─ Generates case ✅
   └─ Triggers scheduler job ✅
   ↓
2. Scheduler job (main context)
   └─ Creates post with reddit API ✅
```

**Key**: Scheduler jobs run in main context with Reddit API permissions!

---

## Alternative Solutions

### A. Move to AppInstall Trigger
- Post created automatically on app install
- Con: Can't trigger on demand

### B. Add Devvit.configure() to server/index.ts
- May not work (server bundle might not support it)
- Untested approach

### C. Use HTTP callback
- Server generates case
- Calls external webhook
- Webhook triggers scheduler
- Too complex

---

## Verification

After implementing:

1. ✅ Menu action shows success toast
2. ✅ Post appears in feed after 3 seconds
3. ✅ Logs show: `[SCHEDULER] Post created: t3_xxxxx`
4. ✅ No permission errors

---

## Files Changed

- `src/main.tsx` - Add scheduler job
- `src/server/index.ts` - Replace createPost() with scheduler.runJob()

---

## Related Files

- **Analysis**: `DEVVIT_ARCHITECTURE_ANALYSIS.md`
- **Implementation**: `DEVVIT_FIX_IMPLEMENTATION.md`
- **Config**: `devvit.json`
- **Build**: `vite.main.config.ts`

---

**Status**: Ready to implement
**Risk**: Low (uses existing working patterns)
**Time**: 15 minutes
