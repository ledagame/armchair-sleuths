# Code Fixes to Implement - 400 Bad Request Error

**Date**: 2025-10-24
**Priority**: P0 (Critical - Blocks post creation)
**Estimated Time**: 15 minutes

---

## Fix 1: Enhanced Error Logging (Deploy First)

**File**: `C:\Users\hpcra\armchair-sleuths\src\server\index.ts`
**Line**: 220 (catch block in `/internal/menu/post-create`)

### Current Code
```typescript
} catch (error) {
  console.error(`❌ [menu/post-create] Error occurred:`, error);
  if (error instanceof Error) {
    console.error(`   - Error type: ${error.constructor.name}`);
    console.error(`   - Error message: ${error.message}`);
    console.error(`   - Error stack: ${error.stack}`);
  }

  const errorObj = error as any;
  if (errorObj.statusCode) {
    console.error(`   - HTTP Status Code: ${errorObj.statusCode}`);
  }
  if (errorObj.response) {
    console.error(`   - Response body: ${JSON.stringify(errorObj.response, null, 2)}`);
  }

  res.status(400).json({
    status: 'error',
    message: error instanceof Error ? error.message : 'Failed to create post',
    errorType: error instanceof Error ? error.constructor.name : 'Unknown'
  });
}
```

### New Code (Replace entire catch block)
```typescript
} catch (error) {
  // Enhanced error logging for debugging
  console.error('❌ ============================================');
  console.error('❌ [menu/post-create] ERROR DETAILS');
  console.error('❌ ============================================');

  // Basic error info
  console.error('Error Type:', error instanceof Error ? error.constructor.name : typeof error);
  console.error('Error Message:', error instanceof Error ? error.message : String(error));

  // Stack trace
  if (error instanceof Error && error.stack) {
    console.error('Stack Trace:', error.stack);
  }

  // Context info at time of error
  console.error('Context:', {
    subredditName: context.subredditName,
    userId: context.userId,
    postId: context.postId,
    timestamp: new Date().toISOString()
  });

  // HTTP status code (if Devvit error)
  const errorObj = error as any;
  if (errorObj.statusCode) {
    console.error('HTTP Status Code:', errorObj.statusCode);
  }

  // Response body (if Devvit error)
  if (errorObj.response) {
    console.error('Response Body:', JSON.stringify(errorObj.response, null, 2));
  }

  // Additional error properties
  if (errorObj.code) {
    console.error('Error Code:', errorObj.code);
  }
  if (errorObj.details) {
    console.error('Error Details:', JSON.stringify(errorObj.details, null, 2));
  }

  console.error('❌ ============================================');

  // Return structured error response
  res.status(400).json({
    status: 'error',
    message: error instanceof Error ? error.message : 'Failed to create post',
    errorType: error instanceof Error ? error.constructor.name : 'Unknown',
    timestamp: new Date().toISOString()
  });
}
```

**Why**: This will show exactly what's failing and where.

---

## Fix 2: Remove Optional Splash Fields (Quick Win)

**File**: `C:\Users\hpcra\armchair-sleuths\src\server\core\post.ts`
**Line**: 27-44 (payload definition)

### Current Code
```typescript
const payload = {
  splash: {
    appDisplayName: 'armchair-sleuths',
    backgroundUri: 'default-splash.png',
    buttonLabel: '🔍 게임 시작',
    description: '미스터리를 풀어보세요',
    entryUri: 'index.html',
    heading: '오늘의 미스터리',
    appIconUri: 'default-icon.png',
  },
  postData: {
    gameState: 'initial',
    score: 0,
    caseId: caseId,
  },
  subredditName: targetSubreddit,
  title: postTitle,
};
```

### New Code (Replace payload definition)
```typescript
const payload = {
  splash: {
    // Required fields only
    appDisplayName: 'armchair-sleuths',
    buttonLabel: '🔍 게임 시작',
    description: '미스터리를 풀어보세요',
    entryUri: 'index.html',
    heading: '오늘의 미스터리',

    // Optional asset fields REMOVED to avoid validation issues
    // backgroundUri: 'default-splash.png',  // May require full URL or uploaded asset
    // appIconUri: 'default-icon.png',        // May require full URL or uploaded asset
  },
  postData: {
    gameState: 'initial',
    score: 0,
    caseId: caseId,
  },
  subredditName: targetSubreddit,
  title: postTitle,
};

console.log('[createPost] 📤 Payload structure:', {
  hasSplash: !!payload.splash,
  hasPostData: !!payload.postData,
  caseId: payload.postData.caseId,
  subreddit: payload.subredditName,
  titleLength: payload.title.length
});
```

**Why**: Asset URIs may be causing validation failures. Removing optional fields reduces failure points.

---

## Fix 3: Add Subreddit Fallback (Safety Net)

**File**: `C:\Users\hpcra\armchair-sleuths\src\server\core\post.ts`
**Line**: 13-21 (subreddit resolution)

### Current Code
```typescript
export const createPost = async (options?: CreatePostOptions) => {
  const { subredditName: contextSubreddit } = context;

  // Use provided subreddit or fallback to context
  const targetSubreddit = options?.subredditName || contextSubreddit;

  if (!targetSubreddit) {
    throw new Error('subredditName is required');
  }
```

### New Code (Replace subreddit resolution)
```typescript
export const createPost = async (options?: CreatePostOptions) => {
  const { subredditName: contextSubreddit } = context;

  // Use provided subreddit or fallback to context or default
  // Menu context may not populate context.subredditName, so we provide a fallback
  const targetSubreddit =
    options?.subredditName ||
    contextSubreddit ||
    'armchair_sleuths_dev';  // Hardcoded fallback for menu invocations

  console.log('[createPost] 🎯 Subreddit resolution:', {
    fromOptions: options?.subredditName,
    fromContext: contextSubreddit,
    finalTarget: targetSubreddit
  });

  if (!targetSubreddit) {
    throw new Error('subredditName is required but could not be resolved');
  }
```

**Why**: Menu context may not populate `context.subredditName`. This provides a safe fallback.

---

## Fix 4: Add Progress Logging (Debugging Aid)

**File**: `C:\Users\hpcra\armchair-sleuths\src\server\index.ts`
**Line**: 148-217 (entire endpoint handler)

### Current Code (excerpt)
```typescript
router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    console.log('🎮 Creating new unique game case from menu...');
    console.log('📋 Context info:', {
      subredditName: context.subredditName,
      postId: context.postId,
      userId: context.userId
    });

    const apiKey = await settings.get<string>('geminiApiKey');
    // ... rest of the code
```

### New Code (Add step markers)
```typescript
router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    console.log('🎮 ============================================');
    console.log('🎮 POST /internal/menu/post-create STARTED');
    console.log('🎮 ============================================');

    console.log('🎮 [STEP 1/7] Verifying context...');
    console.log('📋 Context info:', {
      subredditName: context.subredditName,
      postId: context.postId,
      userId: context.userId
    });

    // 1. Get Gemini API key
    console.log('🎮 [STEP 2/7] Retrieving API key...');
    const apiKey = await settings.get<string>('geminiApiKey');

    if (!apiKey) {
      console.error('❌ Gemini API key not configured');
      res.status(500).json({
        status: 'error',
        message: 'Gemini API key not configured. Please set it in app settings.'
      });
      return;
    }
    console.log('✅ API key retrieved successfully');

    // 2. Generate timestamp-based unique case ID
    console.log('🎮 [STEP 3/7] Generating case ID...');
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timestamp = Date.now();
    const customCaseId = `case-${dateStr}-${timestamp}`;
    console.log(`✅ Case ID: ${customCaseId}`);

    // 3. Generate new case with images
    console.log('🎮 [STEP 4/7] Initializing case generator...');
    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);
    console.log('✅ Case generator initialized');

    console.log('🎮 [STEP 5/7] Generating case (this may take 30-60 seconds)...');
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
      console.log(`     - Discovery: ${JSON.stringify(newCase.introSlides.discovery).substring(0, 100)}...`);
      console.log(`     - Suspects: ${newCase.introSlides.suspects.suspectCards.length} cards`);
      console.log(`     - Challenge: ${newCase.introSlides.challenge.question}`);
    }

    // 4. Create post title with game info
    console.log('🎮 [STEP 6/7] Preparing post data...');
    const suspectNames = newCase.suspects.map(s => s.name).join(', ');
    const postTitle = `🔍 ${dateStr} 미스터리 | 용의자: ${suspectNames}`;
    console.log(`📮 Post title: ${postTitle}`);

    // 5. Create Reddit post with unique case
    console.log('🎮 [STEP 7/7] Creating Reddit post...');
    const post = await createPost({
      caseId: newCase.id,
      title: postTitle,
      subredditName: context.subredditName
    });

    console.log(`✅ Post created successfully: ${post.id}`);
    console.log('🎮 ============================================');
    console.log('🎮 POST CREATION COMPLETE');
    console.log('🎮 ============================================');

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    // Enhanced error logging from Fix 1
  }
});
```

**Why**: This shows exactly which step succeeds and which fails, making debugging instant.

---

## Deployment Steps

### Step 1: Apply Fixes

```bash
# Navigate to project
cd C:\Users\hpcra\armchair-sleuths

# Apply fixes (manually edit files above)
# - Fix 1: src/server/index.ts (line 220)
# - Fix 2: src/server/core/post.ts (line 27)
# - Fix 3: src/server/core/post.ts (line 13)
# - Fix 4: src/server/index.ts (line 148)
```

### Step 2: Build

```bash
# Install dependencies (if needed)
npm install

# Build project
npm run build

# Verify build succeeded
echo $?  # Should output 0
```

### Step 3: Test Locally (Optional)

```bash
# Start local dev server
npm run dev

# In another terminal, test endpoint
curl -X POST http://localhost:5173/internal/menu/post-create

# Check console for detailed logs
```

### Step 4: Deploy to Devvit

```bash
# Upload to Devvit
devvit upload

# Wait for upload to complete
# Should see: "Successfully uploaded"
```

### Step 5: Test in Production

```bash
# 1. Go to subreddit
# https://reddit.com/r/armchair_sleuths_dev

# 2. Click moderator menu
# 3. Click "Create a new post"

# 4. Watch Devvit logs
devvit logs armchair_sleuths_dev --follow

# 5. Look for step markers:
#    🎮 [STEP 1/7] Verifying context...
#    🎮 [STEP 2/7] Retrieving API key...
#    ...
#    ✅ Post created successfully: ...
```

### Step 6: Verify Success

```bash
# Check if error still occurs
# If error occurs, check detailed logs for:
#    - Error Type: [type]
#    - Error Message: [message]
#    - Stack Trace: [trace]

# If successful:
# 1. Verify Reddit post exists
# 2. Verify IntroSlides in case data
curl https://your-devvit-url/api/case/case-2025-10-24-... | jq '.introSlides'

# 3. Open post in browser and verify 3-slide intro displays
```

---

## Expected Outcomes

### If Fix 2 Works (Most Likely)
```
🎮 [STEP 1/7] Verifying context...
✅ Context verified
🎮 [STEP 2/7] Retrieving API key...
✅ API key retrieved
🎮 [STEP 3/7] Generating case ID...
✅ Case ID: case-2025-10-24-1729772400000
🎮 [STEP 4/7] Initializing case generator...
✅ Case generator initialized
🎮 [STEP 5/7] Generating case...
✅ Case generated: case-2025-10-24-1729772400000
   - IntroSlides: Generated
🎮 [STEP 6/7] Preparing post data...
✅ Post title prepared
🎮 [STEP 7/7] Creating Reddit post...
[createPost] 📤 Payload structure: { ... }
✅ Post created successfully: abc123
🎮 POST CREATION COMPLETE
```

### If Fix 2 Doesn't Work (Check Logs)
```
🎮 [STEP 1/7] Verifying context...
...
🎮 [STEP 7/7] Creating Reddit post...
[createPost] 📤 Payload structure: { ... }
❌ ============================================
❌ [menu/post-create] ERROR DETAILS
❌ ============================================
Error Type: [EXACT ERROR TYPE]
Error Message: [EXACT ERROR MESSAGE]
Stack Trace: [FULL STACK TRACE]
Context: { subredditName: "...", ... }
❌ ============================================
```

**Action**: Use the exact error message to determine next fix.

---

## Rollback Plan (If Needed)

```bash
# If fixes cause issues, rollback:

# 1. Revert changes
git checkout src/server/index.ts
git checkout src/server/core/post.ts

# 2. Rebuild
npm run build

# 3. Redeploy
devvit upload

# 4. Investigate logs from failed attempt
devvit logs armchair_sleuths_dev --limit 100
```

---

## Success Criteria

✅ **Post creation succeeds**
  - No 400 error
  - Reddit post is created
  - Post has valid caseId

✅ **IntroSlides are accessible**
  - GET /api/case/:caseId returns introSlides
  - introSlides structure matches interface
  - All 3 slides have valid data

✅ **Client can load game**
  - Open post in browser
  - 3-slide intro displays correctly
  - Investigation screen loads

---

## What NOT to Change

❌ **Do NOT modify**:
- `src/server/services/intro/IntroSlidesGenerator.ts` (Working correctly)
- `src/shared/types/IntroSlides.ts` (Structure is correct)
- `src/server/services/case/CaseGeneratorService.ts` (IntroSlides integration is correct)
- Any client-side code (Frontend is working)

✅ **Only modify**:
- `src/server/index.ts` (Error logging and progress tracking)
- `src/server/core/post.ts` (Splash payload and subreddit fallback)

---

## Time Estimate

| Task | Time |
|------|------|
| Apply fixes | 5 minutes |
| Build and test locally | 5 minutes |
| Deploy to Devvit | 2 minutes |
| Test in production | 3 minutes |
| **Total** | **15 minutes** |

---

## Next Steps After Success

1. ✅ Document which fix resolved the issue
2. ✅ Remove unnecessary logging (keep essentials)
3. ✅ Update architecture docs with findings
4. ✅ Create test cases to prevent regression
5. ✅ Consider adding health check endpoint
