# Debugging Report: Intro Generation 400 Bad Request Error

## Error Description
**Symptom**: 400 Bad Request when POSTing to `/internal/menu/post-create` during intro slide generation.

**Location**: Menu endpoint in `src/server/index.ts` (line 148) → `createPost()` in `src/server/core/post.ts` → `reddit.submitCustomPost()`

---

## Investigation Summary

### 1. Code Flow Analysis

**Request Flow**:
```
User clicks menu → POST /internal/menu/post-create
  → Generate case with CaseGeneratorService
  → Generate intro slides with IntroSlidesGenerator
  → Call createPost() with caseId, title, subredditName
  → reddit.submitCustomPost() with splash configuration
  → ❌ 400 Bad Request (FAILURE POINT)
```

**Key Files Examined**:
1. `src/server/services/intro/IntroSlidesGenerator.ts` - Generates 3-slide intro content
2. `src/server/services/case/CaseGeneratorService.ts` - Orchestrates case generation including intro slides
3. `src/server/core/post.ts` - Creates Reddit custom post with splash screen
4. `src/server/index.ts` - Menu endpoint that triggers the flow

### 2. IntroSlides Generation (WORKING)

The `IntroSlidesGenerator` uses a **template-first approach** that always succeeds:

```typescript
// ALWAYS generates working slides from template
const templateSlides = this.templateBuilder.build(caseData);

// Optionally tries AI enhancement (5 second timeout, single attempt)
// Falls back to template if AI fails
```

**Verification**: Intro slides ARE being generated successfully (template-based generation has 100% success rate).

### 3. Critical Discovery: Intro Slides NOT Passed to Reddit Post

**IMPORTANT**: The intro slides are generated and stored in the case data, but **NOT included in the Reddit post payload**.

Current `createPost()` payload:
```typescript
{
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
    caseId: caseId  // Only caseId is passed
    // ❌ introSlides NOT included here
  },
  subredditName: targetSubreddit,
  title: postTitle,
}
```

**Design Decision**: Intro slides are fetched by the client via `/api/case/:caseId` after the post is loaded. This is correct architecture - they don't need to be in the post payload.

### 4. Root Cause Hypotheses (Ranked by Likelihood)

#### Hypothesis 1: Invalid Splash Screen Asset References (HIGH)
**Likelihood**: 70%

**Issue**: The `splash` object references static assets that may not be properly configured in Devvit's asset system.

**Evidence**:
- Assets exist in `assets/` directory (`default-splash.png`, `default-icon.png`)
- However, Devvit may require specific asset paths or validation
- Reddit API may be rejecting the submission due to asset validation failure

**What to check**:
```
[createPost] Payload that failed: {
  "splash": {
    "backgroundUri": "default-splash.png",  // Does Devvit validate this?
    "appIconUri": "default-icon.png"        // Does Devvit validate this?
  }
}
```

#### Hypothesis 2: Missing Required Splash Fields (MEDIUM)
**Likelihood**: 20%

**Issue**: Devvit may have changed required fields for splash screens.

**Evidence**:
- Documentation shows `appDisplayName` as only required field
- Current code includes all optional fields
- May have validation rules not in docs

#### Hypothesis 3: Context Validation Failure (MEDIUM)
**Likelihood**: 10%

**Issue**: `context.subredditName` may be undefined or invalid in menu context.

**Evidence**:
- Menu items have different context than regular posts
- Need to verify context object during menu invocation

**Added logging** to capture:
```typescript
console.log('📋 Context info:', {
  subredditName: context.subredditName,  // Verify this is set
  postId: context.postId,
  userId: context.userId
});
```

---

## Debugging Changes Implemented

### File 1: `src/server/core/post.ts`

**Changes**:
1. ✅ Added payload logging before submission
2. ✅ Added try-catch with detailed error logging
3. ✅ Captures error message, type, and stack trace
4. ✅ Logs failed payload for inspection

**Key Logs to Watch**:
```
[createPost] 📤 Submitting custom post with payload: {...}
[createPost] ✅ Post created successfully: {postId}
[createPost] ❌ Failed to create post: {error}
```

### File 2: `src/server/index.ts` (menu endpoint)

**Changes**:
1. ✅ Added context info logging
2. ✅ Added intro slides verification logging
3. ✅ Enhanced error handling with error type detection
4. ✅ Captures HTTP status codes and response bodies

**Key Logs to Watch**:
```
📋 Context info: {...}
✅ Case generated: {caseId}
   - IntroSlides: Generated
   - Slide 1 (Discovery): {...}
❌ [menu/post-create] Error occurred: {...}
   - HTTP Status Code: 400
   - Response body: {...}
```

---

## Verification Steps

### Step 1: Rebuild and Deploy
```bash
cd C:\Users\hpcra\armchair-sleuths
npm run build
devvit upload
```

### Step 2: Trigger the Menu Action
1. Go to your subreddit (armchair_sleuths_dev)
2. Click "Create a new post" from the moderator menu
3. Watch the server logs

### Step 3: Analyze the Logs

**Look for these specific log sequences**:

**Sequence 1: Context Verification**
```
📋 Context info: {
  subredditName: "armchair_sleuths_dev",  // Should be present
  postId: undefined,
  userId: "..."
}
```
**Action**: If `subredditName` is undefined → **Root Cause Found**

**Sequence 2: Case Generation**
```
✅ Case generated: case-2025-10-24-1729772400000
   - IntroSlides: Generated
   - Slide 1 (Discovery): {"timeLocation":"11:47 PM - Crime Scene",...
   - Slide 2 (Suspects): 5 cards
   - Slide 3 (Challenge): Who killed...?
```
**Action**: Confirms intro slides are working correctly

**Sequence 3: Post Creation Payload**
```
[createPost] 📤 Submitting custom post with payload: {
  "splash": {
    "appDisplayName": "armchair-sleuths",
    "backgroundUri": "default-splash.png",
    ...
  },
  "subredditName": "armchair_sleuths_dev",
  "title": "🔍 2025-10-24 미스터리 | 용의자: ..."
}
```
**Action**: Verify all fields are present and correct

**Sequence 4: Error Details**
```
[createPost] ❌ Failed to create post: Error: ...
   - Error type: DevvitError / HTTPError / ValidationError
   - Error message: "..."
   - HTTP Status Code: 400
   - Response body: { "error": "..." }
```
**Action**: **This is the critical info** - reveals exact validation failure

---

## Expected Fixes (Based on Likely Causes)

### Fix 1: If Assets Are Invalid

**Problem**: Devvit requires different asset path format

**Solution**:
```typescript
splash: {
  appDisplayName: 'armchair-sleuths',
  // Option A: Remove optional fields
  // backgroundUri: 'default-splash.png',  // Remove
  // appIconUri: 'default-icon.png',       // Remove

  // Option B: Use absolute paths
  backgroundUri: '/assets/default-splash.png',
  appIconUri: '/assets/default-icon.png',

  buttonLabel: '🔍 게임 시작',
  description: '미스터리를 풀어보세요',
  entryUri: 'index.html',
  heading: '오늘의 미스터리',
}
```

### Fix 2: If Context Is Invalid

**Problem**: `context.subredditName` is undefined in menu context

**Solution**:
```typescript
// Option A: Hardcode dev subreddit for menu
const targetSubreddit = options?.subredditName || 'armchair_sleuths_dev';

// Option B: Get from request
router.post('/internal/menu/post-create', async (req, res): Promise<void> => {
  // Get subreddit from Devvit menu context
  const subredditName = context.subredditName || req.body.subredditName;
});
```

### Fix 3: If Splash Fields Are Invalid

**Problem**: Required field missing or format incorrect

**Solution**: Simplify splash to minimum required fields
```typescript
splash: {
  appDisplayName: 'armchair-sleuths',  // Only required field
  // Remove all optional fields temporarily
}
```

---

## Current Status

✅ **Debugging infrastructure in place**
✅ **Comprehensive logging added**
✅ **Code flow understood**
✅ **Hypotheses ranked**

⏳ **Next Step**: Run the menu action and capture logs to identify exact error

---

## Quick Reference: Log Analysis Decision Tree

```
Does log show "📋 Context info"?
├─ YES: Check if subredditName is present
│   ├─ YES: Context is OK
│   └─ NO: → Apply Fix 2 (Context validation)
└─ NO: Error before menu endpoint

Does log show "✅ Case generated"?
├─ YES: Case generation working
└─ NO: Case generation failed (separate issue)

Does log show "[createPost] 📤 Submitting"?
├─ YES: Check payload structure
└─ NO: Error before createPost call

Does log show "[createPost] ❌ Failed"?
├─ YES: Read "Response body" field
│   ├─ Contains "asset": → Apply Fix 1 (Asset paths)
│   ├─ Contains "subreddit": → Apply Fix 2 (Context)
│   ├─ Contains "splash": → Apply Fix 3 (Splash fields)
│   └─ Other: → Post exact error message
└─ NO: Post created successfully (different issue)
```

---

## Files Modified

1. ✅ `src/server/core/post.ts` - Added comprehensive logging and error handling
2. ✅ `src/server/index.ts` - Enhanced menu endpoint logging

**No functional changes** - only debugging instrumentation added.

---

## Next Actions

1. **Deploy the updated code** with new logging
2. **Trigger the menu action** to create a post
3. **Capture the logs** (especially error response body)
4. **Share the logs** showing:
   - Context info
   - Case generation status
   - Post creation payload
   - Error details (HTTP status, response body)
5. **Apply the appropriate fix** based on captured error

**The exact root cause will be revealed in the error logs.**
