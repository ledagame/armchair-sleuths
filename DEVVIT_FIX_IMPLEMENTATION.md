# Devvit Menu Action Fix: Implementation Guide

## Problem Summary

Menu action "Create a new post" fails with Reddit API permission error because:
- Menu handlers execute in **server context** (dist/server/index.cjs)
- Server context does NOT have `Devvit.configure({ redditAPI: true })`
- Only **main context** (dist/main.js) has Reddit API permissions

## Solution: Menu → Scheduler → Reddit API

Use scheduler jobs as a bridge between server and main contexts.

---

## Implementation Steps

### Step 1: Add Scheduler Job to main.tsx

**File**: `src/main.tsx`

**Location**: Add after the existing `daily-case-generation` scheduler job (after line 117)

```typescript
// ============================================================================
// Menu-Triggered Post Creation Job
// ============================================================================

Devvit.addSchedulerJob({
  name: 'menu-create-post',
  onRun: async (event, context) => {
    console.log('==========================================');
    console.log('📮 [SCHEDULER] Menu-triggered post creation started');
    console.log('Event data:', JSON.stringify(event.data));
    console.log('==========================================');

    try {
      const { caseId, title, subredditName } = event.data;

      // Validate required data
      if (!caseId || !title || !subredditName) {
        throw new Error('Missing required data: caseId, title, or subredditName');
      }

      console.log(`📝 Creating post for case: ${caseId}`);
      console.log(`   Title: ${title}`);
      console.log(`   Subreddit: ${subredditName}`);

      // Create Reddit post using reddit API (available in this context)
      const post = await context.reddit.submitCustomPost({
        title: title,
        subredditName: subredditName,
        postData: {
          gameState: 'initial',
          score: 0,
          caseId: caseId,
        },
      });

      console.log('==========================================');
      console.log('✅ [SCHEDULER] Post created successfully');
      console.log(`   Post ID: ${post.id}`);
      console.log(`   Post URL: ${post.url}`);
      console.log('==========================================');

      return { success: true, postId: post.id, postUrl: post.url };
    } catch (error) {
      console.error('==========================================');
      console.error('❌ [SCHEDULER] Post creation failed');
      console.error('Error:', error);
      console.error('==========================================');
      throw error;
    }
  }
});
```

---

### Step 2: Update Menu Handler in server/index.ts

**File**: `src/server/index.ts`

**Location**: Replace the `/internal/menu/post-create` handler (lines 150-252)

**Find this block**:
```typescript
router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    console.log('🎮 Creating new unique game case from menu...');
    // ... existing code ...

    // 5. Create Reddit post
    const post = await createPost({
      caseId: newCase.id,
      title: postTitle,
      subredditName: context.subredditName
    });

    console.log(`✅ Post created: ${post.id}`);

    // Return UIResponse format with post object
    res.json({
      navigateTo: post,
    });
  } catch (error) {
    // ... error handling ...
  }
});
```

**Replace with**:
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

    // 4. Create post title
    const suspectNames = newCase.suspects.map(s => s.name).join(', ');
    const postTitle = `🔍 ${dateStr} 미스터리 | 용의자: ${suspectNames}`;

    console.log(`📮 Scheduling post creation: ${postTitle}`);

    // 5. Trigger scheduler job for post creation (runs in main context with reddit API)
    const jobId = await context.scheduler.runJob({
      name: 'menu-create-post',
      runAt: new Date(Date.now() + 3000), // Run in 3 seconds
      data: {
        caseId: newCase.id,
        title: postTitle,
        subredditName: context.subredditName
      }
    });

    console.log(`✅ Scheduler job triggered: ${jobId}`);
    console.log(`⏱️  Post will be created in 3 seconds...`);

    // 6. Return success response with toast
    // Note: We can't navigate to the post directly since it's created async
    // User will see it in the subreddit feed shortly
    res.json({
      showToast: {
        text: `🎲 New mystery created! Check the subreddit feed in a moment.`,
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

    res.json({
      showToast: {
        text: error instanceof Error ? error.message : 'Failed to create case',
        appearance: 'neutral'
      }
    });
  }
});
```

---

### Step 3: Build and Test

```bash
# Build all bundles
npm run build

# Check that main.js includes the new scheduler job
grep -n "menu-create-post" dist/main.js

# Start dev server
npm run dev:devvit
```

---

### Step 4: Verify in Devvit Playtest

1. **Start playtest**:
   ```bash
   devvit playtest
   ```

2. **Open subreddit** (e.g., r/armchair_sleuths_dev)

3. **Click menu**: "Create a new post"

4. **Expected behavior**:
   - ✅ Toast appears: "New mystery created! Check the subreddit feed in a moment."
   - ✅ After 3 seconds, new post appears in feed
   - ✅ Post has unique case ID in postData
   - ✅ Opening post loads the custom post UI

5. **Check logs**:
   ```
   🎮 Creating new unique game case from menu...
   📝 Generating case with ID: case-2025-10-25-xxxxx
   🎨 Starting case generation...
   ✅ Case generated: case-2025-10-25-xxxxx
   📮 Scheduling post creation: 🔍 2025-10-25 미스터리 | 용의자: ...
   ✅ Scheduler job triggered: xxxxx
   ⏱️  Post will be created in 3 seconds...

   [3 seconds later]

   📮 [SCHEDULER] Menu-triggered post creation started
   📝 Creating post for case: case-2025-10-25-xxxxx
   ✅ [SCHEDULER] Post created successfully
      Post ID: t3_xxxxx
   ```

---

## Alternative: Immediate Feedback Version

If you want to give users the post URL immediately (without scheduler delay), you can use a polling approach:

### Modified Step 2 (Advanced):

```typescript
router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    // ... case generation code (same as above) ...

    // Trigger scheduler job
    const jobId = await context.scheduler.runJob({
      name: 'menu-create-post',
      runAt: new Date(Date.now() + 1000), // 1 second
      data: {
        caseId: newCase.id,
        title: postTitle,
        subredditName: context.subredditName
      }
    });

    // Store job ID in Redis for polling
    await redis.set(`scheduler:job:${jobId}:status`, 'pending', { expiration: new Date(Date.now() + 60000) });
    await redis.set(`scheduler:job:${jobId}:caseId`, newCase.id, { expiration: new Date(Date.now() + 60000) });

    // Return poll endpoint for frontend to check
    res.json({
      showToast: {
        text: '🎲 Creating mystery case...',
        appearance: 'success'
      },
      // Optional: Frontend can poll this
      pollUrl: `/api/job-status/${jobId}`
    });

  } catch (error) {
    // ... error handling ...
  }
});

// Add polling endpoint
router.get('/api/job-status/:jobId', async (req, res): Promise<void> => {
  const { jobId } = req.params;

  const status = await redis.get(`scheduler:job:${jobId}:status`);
  const postId = await redis.get(`scheduler:job:${jobId}:postId`);

  if (status === 'complete' && postId) {
    res.json({ status: 'complete', postId });
  } else if (status === 'error') {
    res.json({ status: 'error', message: 'Post creation failed' });
  } else {
    res.json({ status: 'pending' });
  }
});

// Update scheduler job to set Redis status
Devvit.addSchedulerJob({
  name: 'menu-create-post',
  onRun: async (event, context) => {
    const jobId = event.id; // Scheduler job ID

    try {
      // ... post creation code ...

      // Mark as complete in Redis
      await context.redis.set(`scheduler:job:${jobId}:status`, 'complete');
      await context.redis.set(`scheduler:job:${jobId}:postId`, post.id);

    } catch (error) {
      await context.redis.set(`scheduler:job:${jobId}:status`, 'error');
      throw error;
    }
  }
});
```

---

## Why This Works

### Context Flow:

```
1. User clicks menu
   ↓
2. Menu handler (server context) ← No Reddit API access
   ├─ Generates case with Gemini API ✅
   ├─ Saves case to Redis ✅
   └─ Triggers scheduler job ✅
   ↓
3. Scheduler job (main context) ← Has Reddit API access
   ├─ Reads case ID from job data ✅
   ├─ Calls reddit.submitCustomPost() ✅
   └─ Post created successfully ✅
```

### Key Advantages:

- ✅ No Reddit API calls in server context
- ✅ Uses existing working scheduler pattern
- ✅ Clean separation of concerns
- ✅ User gets immediate feedback (toast)
- ✅ Post appears automatically in feed

### Trade-offs:

- ⚠️ Post creation is async (3 second delay)
- ⚠️ User doesn't get direct navigation to post
- ⚠️ Need to check feed to see new post

---

## Testing Checklist

- [ ] Build completes without errors
- [ ] `dist/main.js` contains `menu-create-post` scheduler
- [ ] Menu action shows success toast
- [ ] Post appears in feed after 3 seconds
- [ ] Post opens with correct case data
- [ ] Case data loads from Redis
- [ ] Logs show successful scheduler execution
- [ ] No "permissions not enabled" errors

---

## Rollback Plan

If this doesn't work, you can revert to the AppInstall trigger approach:

```typescript
Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (event, context) => {
    // Generate case
    const apiKey = await context.settings.get<string>('geminiApiKey');
    // ... case generation ...

    // Create post directly (has reddit API access here)
    const post = await context.reddit.submitCustomPost({
      title: `🔍 Welcome to Armchair Sleuths!`,
      subredditName: context.subredditName,
      postData: { caseId: newCase.id }
    });
  }
});
```

---

**Implementation Status**: Ready to implement
**Estimated Time**: 15 minutes
**Risk Level**: Low (uses existing working patterns)
**Testing Required**: Yes (verify in playtest mode)
