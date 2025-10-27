# Reddit API Fix - Implementation Guide

**Date**: 2025-10-26
**Issue**: Menu action Reddit API error
**Solution**: Scheduler job bridge pattern
**Estimated Time**: 15 minutes

---

## Quick Fix: 3 File Changes

### File 1: src/main.tsx

**Location**: After `Devvit.configure()` block (around line 8)

**Add this scheduler job**:

```typescript
// Add after Devvit.configure() and before Scheduler Jobs comment

// ============================================================================
// Reddit Post Creation Scheduler Job (Menu Action Bridge)
// ============================================================================
// This job enables menu actions to create Reddit posts by running in
// main.tsx context where redditAPI: true is configured

Devvit.addSchedulerJob({
  name: 'create-game-post-job',
  onRun: async (event, context) => {
    console.log('==========================================');
    console.log('📮 [POST-CREATOR] Scheduler job started');
    console.log('Time:', new Date().toISOString());
    console.log('Event data:', JSON.stringify(event.data));
    console.log('==========================================');

    const { caseId, title, subredditName } = event.data;

    if (!caseId || !title || !subredditName) {
      console.error('❌ [POST-CREATOR] Missing required data');
      throw new Error('Missing caseId, title, or subredditName in job data');
    }

    try {
      console.log(`📝 [POST-CREATOR] Creating post for case: ${caseId}`);
      console.log(`   Title: ${title}`);
      console.log(`   Subreddit: ${subredditName}`);

      // Create Reddit post using Custom Post type
      // This works because scheduler jobs run in main.tsx context
      // where Devvit.configure({ redditAPI: true }) is active
      const post = await context.reddit.submitCustomPost({
        title,
        subredditName,
        preview: (
          <vstack padding="medium" gap="medium" alignment="center middle">
            <text size="xlarge" weight="bold" color="#c9b037">
              🔍 New Mystery Case
            </text>
            <text size="medium" color="#e0e0e0">
              A new detective case is ready to investigate!
            </text>
            <text size="small" color="#808080">
              Case ID: {caseId}
            </text>
            <spacer size="medium" />
            <text size="small" color="#a0a0a0">
              Tap to open and start investigating
            </text>
          </vstack>
        ),
      });

      console.log('==========================================');
      console.log('✅ [POST-CREATOR] Post created successfully');
      console.log(`   Post ID: ${post.id}`);
      console.log(`   URL: ${post.url}`);
      console.log('==========================================');

      // Store post ID in Redis for future reference
      await context.redis.set(`case:${caseId}:postId`, post.id);
      await context.redis.set(`case:${caseId}:postUrl`, post.url);

      return {
        success: true,
        postId: post.id,
        postUrl: post.url,
        caseId,
      };

    } catch (error) {
      console.error('==========================================');
      console.error('❌ [POST-CREATOR] Post creation failed');
      console.error('Error:', error);
      console.error('==========================================');
      throw error;
    }
  }
});
```

---

### File 2: src/server/index.ts

**Location**: Replace the menu action handler at line 150

**Replace this entire function**:

```typescript
router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    console.log('🎮 Creating new unique game case from menu...');
    console.log('📋 Context info:', {
      subredditName: context.subredditName,
      postId: context.postId,
      userId: context.userId
    });

    // 1. Get Gemini API key
    const apiKey = await settings.get<string>('geminiApiKey');

    if (!apiKey) {
      console.error('❌ Gemini API key not configured');
      res.json({
        showToast: {
          text: 'Gemini API key not configured. Please set it in app settings.',
          appearance: 'neutral'
        }
      });
      return;
    }

    // 2. Generate timestamp-based unique case ID
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timestamp = Date.now();
    const customCaseId = `case-${dateStr}-${timestamp}`;

    console.log(`📝 Generating case with ID: ${customCaseId}`);

    // 3. Generate new case with images
    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);

    console.log('🎨 Starting case generation...');
    const newCase = await caseGenerator.generateCase({
      date: now,
      includeImage: true,
      includeSuspectImages: true,
      includeCinematicImages: true,
      temperature: 0.8,
      customCaseId: customCaseId
    });

    console.log(`✅ Case generated: ${newCase.id}`);
    console.log(`   - Victim: ${newCase.victim.name}`);
    console.log(`   - Suspects: ${newCase.suspects.map(s => s.name).join(', ')}`);
    console.log(`   - Images: ${newCase.suspects.filter(s => s.profileImageUrl).length}/${newCase.suspects.length}`);
    console.log(`   - IntroSlides: ${newCase.introSlides ? 'Generated' : 'Missing'}`);
    if (newCase.introSlides) {
      console.log(`     - Slide 1 (Discovery): ${JSON.stringify(newCase.introSlides.discovery).substring(0, 100)}...`);
      console.log(`     - Slide 2 (Suspects): ${newCase.introSlides.suspects.suspectCards.length} cards`);
      console.log(`     - Slide 3 (Challenge): ${newCase.introSlides.challenge.question}`);
    }

    // 4. Create post title with game info
    const suspectNames = newCase.suspects.map(s => s.name).join(', ');
    const postTitle = `🔍 ${dateStr} 미스터리 | 용의자: ${suspectNames}`;

    console.log(`📮 Triggering post creation via scheduler: ${postTitle}`);

    // 5. Trigger scheduler job to create Reddit post
    // This runs in main.tsx context where redditAPI: true is configured
    const jobId = await context.scheduler.runJob({
      name: 'create-game-post-job',
      runAt: new Date(Date.now() + 2000), // Run in 2 seconds
      data: {
        caseId: newCase.id,
        title: postTitle,
        subredditName: context.subredditName || 'armchair_sleuths_dev',
      },
    });

    console.log(`✅ Scheduler job triggered: ${jobId}`);
    console.log(`   Post will be created in ~2 seconds`);

    // 6. Return success response (UIResponse format for menu actions)
    res.json({
      showToast: {
        text: '🎮 Game case generated! Creating post...',
        appearance: 'success'
      }
    });

  } catch (error) {
    console.error(`❌ [menu/post-create] Error occurred:`, error);
    if (error instanceof Error) {
      console.error(`   - Error type: ${error.constructor.name}`);
      console.error(`   - Error message: ${error.message}`);
      console.error(`   - Error stack: ${error.stack}`);
    }

    // Check if it's a specific Devvit error
    const errorObj = error as any;
    if (errorObj.statusCode) {
      console.error(`   - HTTP Status Code: ${errorObj.statusCode}`);
    }
    if (errorObj.response) {
      console.error(`   - Response body: ${JSON.stringify(errorObj.response, null, 2)}`);
    }

    // Return UIResponse format with showToast for errors
    res.json({
      showToast: {
        text: error instanceof Error ? error.message : 'Failed to create post',
        appearance: 'neutral'
      }
    });
  }
});
```

---

### File 3: devvit.json

**Location**: Keep the existing declarative menu action (NO CHANGES NEEDED)

**Current configuration (KEEP AS-IS)**:

```json
{
  "menu": {
    "items": [
      {
        "label": "Create a new post",
        "description": "armchair-sleuths",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/post-create"
      }
    ]
  }
}
```

**Why keep it declarative?**
- Declarative menu actions (devvit.json) DO show in UI ✅
- Imperative menu actions (Devvit.addMenuItem) do NOT show in Web Framework ❌
- We use scheduler job bridge to access Reddit API from main.tsx context

---

## Deployment Steps

### 1. Build
```bash
npm run build
```

**Expected output**:
```
> build:client
> build:server
> build:main
✓ built in XXXms
```

### 2. Upload to Devvit
```bash
devvit upload
```

**Expected output**:
```
✓ Uploaded successfully
App version: X.X.X
```

### 3. Test on Dev Subreddit

**Manual test**:
1. Go to r/armchair_sleuths_dev
2. Click "..." menu in subreddit
3. Select "Create a new post"
4. Should see toast: "🎮 Game case generated! Creating post..."
5. Wait 2-3 seconds
6. New post should appear in subreddit feed

### 4. Monitor Logs

```bash
devvit logs --app armchair-sleuths --tail
```

**Expected log flow**:
```
🎮 Creating new unique game case from menu...
📝 Generating case with ID: case-2025-10-26-XXXXX
🎨 Starting case generation...
✅ Case generated: case-2025-10-26-XXXXX
   - Victim: ...
   - Suspects: ...
   - Images: 3/3
📮 Triggering post creation via scheduler: ...
✅ Scheduler job triggered: job-XXXXX
==========================================
📮 [POST-CREATOR] Scheduler job started
==========================================
📝 [POST-CREATOR] Creating post for case: case-2025-10-26-XXXXX
==========================================
✅ [POST-CREATOR] Post created successfully
   Post ID: post-XXXXX
   URL: https://reddit.com/r/armchair_sleuths_dev/comments/XXXXX
==========================================
```

---

## Verification Checklist

- [ ] Build succeeds without errors
- [ ] Upload succeeds without errors
- [ ] Menu action appears in subreddit menu
- [ ] Clicking menu action shows success toast
- [ ] Post appears in subreddit within 3-5 seconds
- [ ] Post contains game case data (title shows suspects)
- [ ] Logs show scheduler job execution
- [ ] No "Reddit API is not enabled" error

---

## Troubleshooting

### Issue: "Scheduler job not found"

**Cause**: Scheduler job not registered in main.tsx

**Fix**: Verify `Devvit.addSchedulerJob({ name: 'create-game-post-job' })` is in main.tsx

**Check**:
```bash
grep -n "create-game-post-job" dist/main.js
```

### Issue: "Post not appearing"

**Cause**: Async execution delay or error in scheduler

**Fix**: Check logs for scheduler execution:
```bash
devvit logs --app armchair-sleuths | grep POST-CREATOR
```

### Issue: "Toast shows but no post"

**Cause**: Scheduler job failing silently

**Fix**: Check scheduler job logs:
```bash
devvit logs --app armchair-sleuths --tail
# Look for error messages in [POST-CREATOR] blocks
```

### Issue: Menu action still not showing

**Cause**: Build issue or cache

**Fix**:
1. Clear build cache: `rm -rf dist/`
2. Rebuild: `npm run build`
3. Re-upload: `devvit upload`
4. Hard refresh subreddit (Ctrl+Shift+R)

---

## Rollback Plan

If the fix doesn't work, revert changes:

```bash
git checkout src/main.tsx
git checkout src/server/index.ts
npm run build
devvit upload
```

---

## Success Criteria

✅ **Fix is successful when**:
1. Menu action "Create a new post" visible in subreddit menu
2. Clicking menu action generates case without errors
3. Reddit post appears in subreddit within 5 seconds
4. No "Reddit API is not enabled" error in logs
5. Post contains correct case data and preview

---

## Next Steps After Fix

1. **Document pattern** for future menu actions
2. **Extract scheduler bridge** into reusable utility
3. **Add error handling** for scheduler job failures
4. **Consider UI feedback** for post creation status
5. **Test with multiple rapid clicks** to ensure no race conditions

---

## Technical Notes

### Why This Works

**The scheduler job bridge pattern**:
```
Menu Action (Express context)
  ↓ [No Reddit API]
  Generates game case
  ↓
  Triggers scheduler job
  ↓
Scheduler Job (main.tsx context)
  ↓ [Has Reddit API ✅]
  Creates Reddit post
```

**Key insight**: Scheduler jobs defined in main.tsx inherit the `Devvit.configure({ redditAPI: true })` configuration, while Express routes do not.

### Performance Impact

- **Case generation**: ~5-10 seconds (unchanged)
- **Scheduler trigger**: ~10ms (negligible)
- **Post creation**: ~2-3 seconds (async)
- **Total user-perceived time**: ~5-10 seconds (same as before)

The async post creation doesn't increase perceived latency because:
1. User gets immediate toast feedback
2. Case generation is the bottleneck (10+ seconds)
3. Post appears before user navigates away

---

## Appendix: Alternative Solutions (NOT RECOMMENDED)

### Alternative 1: Remove Moderator Restriction

**Change devvit.json**:
```json
"forUserType": "all"  // Instead of "moderator"
```

**Pros**: Quick fix
**Cons**: Any user can create posts (security issue)

### Alternative 2: Use App Install Trigger

**Change approach**: Auto-generate posts on app install instead of menu action

**Pros**: No menu action needed
**Cons**: Less control, can't generate on-demand

### Alternative 3: Manual Post Creation

**Change workflow**: Generate case, then manually create post via Reddit UI

**Pros**: No code needed
**Cons**: Poor UX, defeats purpose of automation

---

## References

- Full Analysis: `DEVVIT_WEB_FRAMEWORK_REDDIT_API_ANALYSIS.md`
- Code Locations:
  - Scheduler job: `src/main.tsx` (after line 8)
  - Menu action handler: `src/server/index.ts` (line 150)
  - Menu config: `devvit.json` (line 26-35)
