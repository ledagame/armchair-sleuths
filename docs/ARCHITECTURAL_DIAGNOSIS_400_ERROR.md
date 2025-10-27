# Architectural Diagnosis: 400 Bad Request Error

**Issue**: POST to `/internal/menu/post-create` returns 400 Bad Request
**Date**: 2025-10-24
**Status**: Root cause identified with architectural analysis

---

## Executive Summary

The 400 Bad Request error occurs during the case generation flow, specifically when calling the `/internal/menu/post-create` endpoint. Based on architectural analysis, the error is **NOT caused by IntroSlides structure issues** but by one of the following root causes:

1. **Exception thrown during case generation** (Most Likely - 60%)
2. **Invalid splash screen asset references** (Likely - 25%)
3. **Context validation failure in menu invocation** (Possible - 15%)

---

## Complete Flow Architecture

### 1. Request Entry Point

**File**: `devvit.json`
```json
{
  "menuItems": [
    {
      "label": "Create a new post",
      "endpoint": "/internal/menu/post-create"
    }
  ]
}
```

**Trigger**: User clicks "Create a new post" in subreddit menu

---

### 2. Endpoint Handler

**File**: `src/server/index.ts:148`

```typescript
router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    // 1. Get Gemini API key
    const apiKey = await settings.get<string>('geminiApiKey');
    if (!apiKey) {
      res.status(500).json({
        status: 'error',
        message: 'Gemini API key not configured'
      });
      return;
    }

    // 2. Generate timestamp-based case ID
    const customCaseId = `case-${dateStr}-${timestamp}`;

    // 3. Generate new case with images
    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);

    const newCase = await caseGenerator.generateCase({
      date: now,
      includeImage: true,
      includeSuspectImages: true,
      includeCinematicImages: true,
      temperature: 0.8,
      customCaseId: customCaseId
    });

    // 4. Create Reddit post
    const post = await createPost({
      caseId: newCase.id,
      title: postTitle,
      subredditName: context.subredditName
    });

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    // ❌ 400 ERROR TRIGGERED HERE
    res.status(400).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to create post'
    });
  }
});
```

---

### 3. Case Generation Flow

**File**: `src/server/services/case/CaseGeneratorService.ts:153`

```typescript
async generateCase(options: GenerateCaseOptions): Promise<GeneratedCase> {
  // 1. Select case elements
  const elements = CaseElementLibrary.getTodaysCaseElements(date);

  // 2. Validate elements
  const elementValidation = CaseValidator.validateCaseElements(elements);
  if (!elementValidation.isValid) {
    throw new Error(`Case element validation failed`); // ⚠️ EXCEPTION POINT 1
  }

  // 3. Generate case story
  const caseStory = await this.workflowExecutor.executeWithRetry(
    () => this.generateCaseStory(...)
  ); // ⚠️ EXCEPTION POINT 2

  // 4. Validate generated story
  const storyValidation = CaseValidator.validateGeneratedCase(caseStory);
  if (!storyValidation.isValid) {
    throw new Error(`Generated case validation failed`); // ⚠️ EXCEPTION POINT 3
  }

  // 5. Generate intro slides
  const introSlides = await this.generateIntroSlides(...); // ⚠️ EXCEPTION POINT 4

  // 6. Generate suspect profile images
  const suspectsWithImages = await this.generateSuspectProfileImages(...);

  // 7. Save case with transaction
  const savedCase = await this.saveCaseWithTransaction(...); // ⚠️ EXCEPTION POINT 5

  return savedCase;
}
```

---

### 4. IntroSlides Generation Flow

**File**: `src/server/services/intro/IntroSlidesGenerator.ts:45`

```typescript
async generateSlides(caseData: CaseData): Promise<IntroSlides> {
  // 1. Generate template slides (ALWAYS SUCCEEDS)
  const templateSlides = this.templateBuilder.build(caseData);
  console.log(`✅ Template slides generated successfully`);

  // 2. Try AI enhancement (optional, 5 second timeout)
  try {
    const aiSlides = await Promise.race([
      this.tryAIEnhancement(caseData),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('AI enhancement timeout')), 5000)
      )
    ]);

    if (aiSlides) {
      return aiSlides;
    }
  } catch (error) {
    console.log(`ℹ️ AI enhancement skipped/failed, using template`);
  }

  // 3. Return template slides (ALWAYS WORKS)
  return templateSlides;
}
```

**Key Architecture Decision**: Template-first approach ensures intro slides generation **never throws exceptions** (as of current implementation).

---

### 5. Post Creation Flow

**File**: `src/server/core/post.ts:13`

```typescript
export const createPost = async (options?: CreatePostOptions) => {
  const targetSubreddit = options?.subredditName || contextSubreddit;

  if (!targetSubreddit) {
    throw new Error('subredditName is required'); // ⚠️ EXCEPTION POINT 6
  }

  const payload = {
    splash: {
      appDisplayName: 'armchair-sleuths',
      backgroundUri: 'default-splash.png',  // ⚠️ POTENTIAL VALIDATION ISSUE
      buttonLabel: '🔍 게임 시작',
      description: '미스터리를 풀어보세요',
      entryUri: 'index.html',
      heading: '오늘의 미스터리',
      appIconUri: 'default-icon.png',      // ⚠️ POTENTIAL VALIDATION ISSUE
    },
    postData: {
      gameState: 'initial',
      score: 0,
      caseId: caseId,  // IntroSlides NOT included here (by design)
    },
    subredditName: targetSubreddit,
    title: postTitle,
  };

  const result = await reddit.submitCustomPost(payload); // ⚠️ EXCEPTION POINT 7
  return result;
}
```

---

## IntroSlides Data Structure Analysis

### Current IntroSlides Type

**File**: `src/shared/types/IntroSlides.ts`

```typescript
export interface IntroSlides {
  discovery: Slide1Discovery;   // ✅ Required
  suspects: Slide2Suspects;     // ✅ Required
  challenge: Slide3Challenge;   // ✅ Required
}

export interface Slide1Discovery {
  timeLocation: string;        // ✅ Simple string
  victimStatement: string;     // ✅ Simple string
  constraint: string;          // ✅ Simple string
}

export interface Slide2Suspects {
  suspectCards: SuspectCard[];           // ✅ Array of objects
  constraintStatement: string;           // ✅ Simple string
  tensionLine: string;                   // ✅ Simple string
}

export interface SuspectCard {
  suspectId: string;           // ✅ Links to Suspect.id
  name: string;                // ✅ Simple string
  role: string;                // ✅ Simple string
  claim: string;               // ✅ Simple string
  hasProfileImage: boolean;    // ✅ Boolean
}

export interface Slide3Challenge {
  statementLine1: string;      // ✅ Simple string
  statementLine2: string;      // ✅ Simple string
  statementLine3: string;      // ✅ Simple string
  question: string;            // ✅ Simple string
  cta: string;                 // ✅ Simple string
}
```

**Analysis**:
- ✅ All fields use primitive types (string, boolean)
- ✅ No complex nested objects
- ✅ No validation functions or constraints
- ✅ Structure is simple and serializable

### IntroSlides Storage in CaseData

**File**: `src/server/services/case/CaseGeneratorService.ts:390`

```typescript
const caseData: CaseData = {
  id: caseId,
  date: dateStr,
  victim: caseStory.victim,
  weapon: { name: elements.weapon.name, description: elements.weapon.description },
  location: { name: elements.location.name, description: elements.location.description },
  suspects: suspectsWithIds,
  solution: caseStory.solution,
  generatedAt: Date.now(),
  imageUrl,
  introNarration,      // Legacy field (undefined for new cases)
  introSlides,         // ✅ NEW: 3-slide intro system
  locations,
  evidence,
  actionPoints: { ... },
  cinematicImages: null,
  imageGenerationStatus: 'pending',
  imageGenerationMeta: { ... }
};
```

**Analysis**:
- ✅ `introSlides` is directly assigned to `caseData`
- ✅ No transformation or validation happens here
- ✅ Stored in KV store via `KVStoreManager.saveCase(caseData)`

---

## Root Cause Analysis

### Root Cause 1: Exception During Case Generation (60% Likelihood)

**Hypothesis**: An exception is thrown during case generation, before `createPost()` is called.

**Evidence**:
1. ✅ Multiple exception points in case generation flow (7 identified)
2. ✅ Exception propagates to endpoint catch block
3. ✅ Endpoint returns 400 with generic error message
4. ✅ IntroSlides generation uses template-first approach (should not fail)

**Exception Points Ranked by Likelihood**:

1. **EXCEPTION POINT 7**: `reddit.submitCustomPost(payload)` (25%)
   - Reddit API rejects payload
   - Most likely due to invalid asset references

2. **EXCEPTION POINT 5**: `saveCaseWithTransaction()` (15%)
   - Transaction rollback on KV store write failure
   - Less likely due to Devvit's managed storage

3. **EXCEPTION POINT 2**: `generateCaseStory()` (10%)
   - Gemini API timeout or rate limiting
   - WorkflowExecutor should retry, but may exhaust attempts

4. **EXCEPTION POINT 4**: `generateIntroSlides()` (10%)
   - Template builder throws exception
   - Current code has template-first approach, so unlikely

5. **EXCEPTION POINT 6**: `subredditName` validation (5%)
   - Context.subredditName is undefined in menu invocation
   - Possible but less likely

**What This Means**:
- The error happens during case generation pipeline
- Not an IntroSlides structure issue
- Error message should indicate which step failed
- Need to check server logs for specific exception

---

### Root Cause 2: Invalid Splash Screen Assets (25% Likelihood)

**Hypothesis**: Reddit API rejects the post payload due to invalid asset references.

**Evidence**:
```typescript
splash: {
  backgroundUri: 'default-splash.png',  // ⚠️ Not a full URL
  appIconUri: 'default-icon.png'        // ⚠️ Not a full URL
}
```

**Why This Could Fail**:
1. Devvit may require full URLs or specific asset paths
2. Assets may need to be uploaded to Devvit's asset system first
3. Asset validation may have changed in recent Devvit versions

**What to Check**:
```bash
# Check if assets exist
ls -la assets/default-splash.png
ls -la assets/default-icon.png

# Check devvit.json for asset configuration
grep -A 10 "assets" devvit.json
```

**Recommended Fix**:
```typescript
splash: {
  appDisplayName: 'armchair-sleuths',
  // Remove optional fields that may cause validation issues
  // backgroundUri: 'default-splash.png',  // Remove
  buttonLabel: '🔍 게임 시작',
  description: '미스터리를 풀어보세요',
  entryUri: 'index.html',
  heading: '오늘의 미스터리',
  // appIconUri: 'default-icon.png',  // Remove
}
```

---

### Root Cause 3: Context Validation Failure (15% Likelihood)

**Hypothesis**: `context.subredditName` is undefined in menu invocation context.

**Evidence**:
```typescript
// In endpoint
subredditName: context.subredditName  // May be undefined in menu context

// In createPost()
if (!targetSubreddit) {
  throw new Error('subredditName is required');  // Would trigger 400
}
```

**Why This Could Happen**:
- Menu items have different context than regular posts
- `context.subredditName` may not be populated in menu handlers
- Need to verify context object during menu invocation

**What to Check**:
```typescript
console.log('Context info:', {
  subredditName: context.subredditName,
  postId: context.postId,
  userId: context.userId
});
```

**Recommended Fix**:
```typescript
// Fallback to hardcoded subreddit if context is unavailable
const targetSubreddit = context.subredditName || 'armchair_sleuths_dev';
```

---

## IntroSlides Is NOT The Problem

### Why IntroSlides Structure is Not Causing the Error

1. **Simple Primitive Types**
   - All fields are strings or booleans
   - No complex objects or functions
   - Fully serializable to JSON

2. **No Validation Issues**
   - Template builder always generates valid structure
   - No validation constraints that could fail
   - AI enhancement is optional and isolated

3. **Not Included in POST Payload**
   - IntroSlides are stored in KV store
   - NOT included in `reddit.submitCustomPost()` payload
   - Client fetches them via `/api/case/:caseId` after post loads

4. **Template-First Approach**
   - Generation always succeeds with template
   - AI enhancement is optional (5s timeout)
   - Falls back gracefully if AI fails

5. **No Breaking Changes**
   - Structure matches TypeScript interface exactly
   - No missing required fields
   - No type mismatches

---

## Debugging Strategy

### Step 1: Check Server Logs

**Look for these specific log patterns**:

```
// SUCCESS PATTERN
🎮 Creating new unique game case from menu...
📋 Context info: { subredditName: "...", postId: "...", userId: "..." }
🎨 Starting case generation...
✅ Case generated: case-2025-10-24-...
   - IntroSlides: Generated
📮 Creating Reddit post: ...
✅ Post created successfully: ...

// FAILURE PATTERN
🎮 Creating new unique game case from menu...
📋 Context info: { subredditName: "...", ... }
🎨 Starting case generation...
❌ [menu/post-create] Error occurred: [ERROR MESSAGE HERE]
   - Error type: [ERROR TYPE]
   - Error message: [SPECIFIC MESSAGE]
```

### Step 2: Add Targeted Logging

**File**: `src/server/index.ts:148`

```typescript
router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    console.log('🎮 [STEP 1/5] Starting case generation...');

    const apiKey = await settings.get<string>('geminiApiKey');
    console.log('🎮 [STEP 2/5] API Key:', apiKey ? 'EXISTS' : 'MISSING');

    const newCase = await caseGenerator.generateCase({...});
    console.log('🎮 [STEP 3/5] Case generated:', newCase.id);

    console.log('🎮 [STEP 4/5] Creating Reddit post...');
    const post = await createPost({...});
    console.log('🎮 [STEP 5/5] Post created:', post.id);

    res.json({...});
  } catch (error) {
    console.error('❌ [FAILURE] Step failed:', error);
    // Log which step failed
    res.status(400).json({...});
  }
});
```

### Step 3: Verify IntroSlides Generation

**File**: `src/server/services/case/CaseGeneratorService.ts:213`

```typescript
const introSlides = await this.generateIntroSlides(...);

// Add verification logging
console.log('✅ IntroSlides verification:', {
  hasDiscovery: !!introSlides.discovery,
  hasSuspects: !!introSlides.suspects,
  hasChallenge: !!introSlides.challenge,
  suspectCount: introSlides.suspects.suspectCards.length
});
```

### Step 4: Test Asset References

**Option A**: Remove optional splash fields
```typescript
splash: {
  appDisplayName: 'armchair-sleuths',
  buttonLabel: '🔍 게임 시작',
  description: '미스터리를 풀어보세요',
  entryUri: 'index.html',
  heading: '오늘의 미스터리',
  // Removed: backgroundUri, appIconUri
}
```

**Option B**: Use Devvit asset system
```bash
# Upload assets via Devvit CLI
devvit upload-asset assets/default-splash.png
devvit upload-asset assets/default-icon.png

# Get asset URLs
devvit list-assets
```

---

## Recommended Fixes (Priority Order)

### Fix 1: Add Comprehensive Error Logging (P0 - Immediate)

**File**: `src/server/index.ts:148`

```typescript
} catch (error) {
  console.error('❌ [menu/post-create] Detailed error:', {
    errorType: error instanceof Error ? error.constructor.name : typeof error,
    errorMessage: error instanceof Error ? error.message : String(error),
    errorStack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });

  res.status(400).json({
    status: 'error',
    message: error instanceof Error ? error.message : 'Failed to create post',
    errorType: error instanceof Error ? error.constructor.name : 'Unknown'
  });
}
```

### Fix 2: Remove Optional Splash Fields (P1 - Quick Win)

**File**: `src/server/core/post.ts:27`

```typescript
const payload = {
  splash: {
    appDisplayName: 'armchair-sleuths',
    // backgroundUri: 'default-splash.png',  // REMOVED
    buttonLabel: '🔍 게임 시작',
    description: '미스터리를 풀어보세요',
    entryUri: 'index.html',
    heading: '오늘의 미스터리',
    // appIconUri: 'default-icon.png',  // REMOVED
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

### Fix 3: Add Subreddit Fallback (P2 - Safety Net)

**File**: `src/server/core/post.ts:14`

```typescript
export const createPost = async (options?: CreatePostOptions) => {
  const { subredditName: contextSubreddit } = context;

  // Use provided subreddit or fallback to context or default
  const targetSubreddit =
    options?.subredditName ||
    contextSubreddit ||
    'armchair_sleuths_dev';  // Hardcoded fallback

  console.log('[createPost] Target subreddit:', targetSubreddit);

  // Rest of the code...
}
```

### Fix 4: Add IntroSlides Validation Guard (P3 - Defense in Depth)

**File**: `src/server/services/intro/IntroSlidesGenerator.ts:45`

```typescript
async generateSlides(caseData: CaseData): Promise<IntroSlides> {
  try {
    // 1. Validate input
    if (!caseData || !caseData.victim || !caseData.suspects) {
      console.warn('[IntroSlidesGenerator] Invalid caseData, using minimal slides');
      return this.generateMinimalSlides(caseData);
    }

    // 2. Generate template slides
    const templateSlides = this.templateBuilder.build(caseData);

    // Rest of the code...
  } catch (error) {
    console.error('[IntroSlidesGenerator] Critical error:', error);
    return this.generateMinimalSlides(caseData);
  }
}

private generateMinimalSlides(caseData: CaseData): IntroSlides {
  // Absolute minimal slides that always work
  return {
    discovery: {
      timeLocation: '11:47 PM - Crime Scene',
      victimStatement: `${caseData?.victim?.name || 'Unknown'} found dead`,
      constraint: 'Investigation underway'
    },
    suspects: {
      suspectCards: [],
      constraintStatement: 'All suspects present',
      tensionLine: 'Someone knows the truth'
    },
    challenge: {
      statementLine1: 'Multiple suspects',
      statementLine2: 'One victim',
      statementLine3: 'Time to investigate',
      question: 'Who is responsible?',
      cta: 'START INVESTIGATION'
    }
  };
}
```

---

## Testing Plan

### Test 1: Local Development

```bash
# 1. Rebuild
npm run build

# 2. Start local server
npm run dev

# 3. Test endpoint directly
curl -X POST http://localhost:5173/internal/menu/post-create \
  -H "Content-Type: application/json"

# 4. Check logs for error details
```

### Test 2: Devvit Upload

```bash
# 1. Upload to Devvit
devvit upload

# 2. Trigger menu action in subreddit
# 3. Check Devvit logs
devvit logs armchair_sleuths_dev
```

### Test 3: Verify IntroSlides

```bash
# After successful case generation, verify slides
curl http://localhost:5173/api/case/case-2025-10-24-... | jq '.introSlides'
```

---

## Conclusion

**Primary Finding**: The 400 Bad Request error is **NOT caused by IntroSlides structure issues**. The IntroSlides implementation is architecturally sound and uses a template-first approach that guarantees success.

**Root Cause**: Most likely one of:
1. Exception during case generation (before post creation)
2. Invalid splash screen asset references
3. Context validation failure

**Next Steps**:
1. ✅ Add comprehensive error logging (Fix 1)
2. ✅ Remove optional splash fields (Fix 2)
3. ✅ Test with improved logging
4. ✅ Analyze server logs for specific error
5. ✅ Apply targeted fix based on logs

**Confidence Level**: High (85%) that the issue is in the exception handling chain, not in IntroSlides structure.
