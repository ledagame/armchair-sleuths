# POST /internal/menu/post-create Flow Diagram

## Visual Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                             │
│  User clicks "Create a new post" in subreddit moderator menu        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DEVVIT MENU INVOCATION                            │
│  devvit.json → "endpoint": "/internal/menu/post-create"             │
│  POST /internal/menu/post-create (no body)                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              ENDPOINT HANDLER (src/server/index.ts:148)              │
│                                                                      │
│  [1] Get API Key                                                    │
│      └─> settings.get('geminiApiKey')                               │
│      └─> ❌ FAIL POINT 1: API key missing → 500 error              │
│                                                                      │
│  [2] Generate Case ID                                               │
│      └─> customCaseId = `case-${date}-${timestamp}`                │
│                                                                      │
│  [3] Create Services                                                │
│      └─> geminiClient = createGeminiClient(apiKey)                 │
│      └─> caseGenerator = createCaseGeneratorService(geminiClient)  │
│                                                                      │
│  [4] Generate Case (MAIN FLOW) ─────────────────────────────┐       │
│      └─> await caseGenerator.generateCase({...})            │       │
│                                                              │       │
└──────────────────────────────────────────────────────────────┼───────┘
                                                               │
                                                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│         CASE GENERATION (CaseGeneratorService.ts:153)                │
│                                                                      │
│  [1] Select Case Elements                                           │
│      └─> CaseElementLibrary.getTodaysCaseElements(date)            │
│                                                                      │
│  [2] Validate Elements                                              │
│      └─> CaseValidator.validateCaseElements(elements)              │
│      └─> ❌ FAIL POINT 2: Validation failed → throw exception      │
│                                                                      │
│  [3] Generate Case Story (with retry)                               │
│      └─> workflowExecutor.executeWithRetry(() => {                 │
│           geminiClient.generateText(prompt)                         │
│         })                                                           │
│      └─> ❌ FAIL POINT 3: Gemini API timeout/error → throw         │
│                                                                      │
│  [4] Validate Generated Story                                       │
│      └─> CaseValidator.validateGeneratedCase(caseStory)            │
│      └─> ❌ FAIL POINT 4: Story validation failed → throw          │
│                                                                      │
│  [5] Generate Intro Slides ──────────────────────────────┐          │
│      └─> await this.generateIntroSlides(...)             │          │
│                                                           │          │
└───────────────────────────────────────────────────────────┼──────────┘
                                                            │
                                                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│         INTRO SLIDES GENERATION (IntroSlidesGenerator.ts:45)         │
│                                                                      │
│  [1] Generate Template Slides (ALWAYS SUCCEEDS)                     │
│      └─> templateSlides = templateBuilder.build(caseData)          │
│      └─> console.log('✅ Template slides generated')               │
│                                                                      │
│  [2] Try AI Enhancement (Optional, 5s timeout)                      │
│      └─> try {                                                      │
│           await Promise.race([                                      │
│             tryAIEnhancement(caseData),                             │
│             timeout(5000)                                           │
│           ])                                                         │
│         } catch {                                                    │
│           // Fallback to template (no exception thrown)             │
│         }                                                            │
│                                                                      │
│  [3] Return Slides (GUARANTEED SUCCESS)                             │
│      └─> return templateSlides or aiSlides                         │
│                                                                      │
│  ✅ NO FAIL POINTS: Always returns valid IntroSlides               │
│                                                                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼ (return to CaseGeneratorService)
┌─────────────────────────────────────────────────────────────────────┐
│         CASE GENERATION (continued)                                  │
│                                                                      │
│  [6] Generate Suspect Profile Images (Sequential)                   │
│      └─> for each suspect:                                          │
│           geminiClient.generateImage(prompt)                        │
│      └─> ⚠️ SOFT FAIL: Image gen may fail, but case continues     │
│                                                                      │
│  [7] Generate Locations & Evidence                                  │
│      └─> generateLocationsForCase()                                │
│      └─> generateEvidenceForCase()                                 │
│                                                                      │
│  [8] Save Case with Transaction                                     │
│      └─> saveCaseWithTransaction(                                   │
│           caseStory, elements, suspectsWithImages,                  │
│           imageUrl, introNarration, introSlides,                    │
│           date, customCaseId, locations, evidence                   │
│         )                                                            │
│      └─> ❌ FAIL POINT 5: Transaction failed → throw               │
│                                                                      │
│  [9] Distribute Evidence to Locations                               │
│      └─> locationDiscovery.distributeEvidence()                    │
│      └─> DiscoveryStateManager.saveDistribution()                  │
│      └─> KVStoreManager.saveCase(savedCase)                        │
│      └─> ❌ FAIL POINT 6: KV store write failed → throw            │
│                                                                      │
│  [10] Start Background Image Generation (Non-blocking)              │
│      └─> startBackgroundImageGeneration()                          │
│      └─> (Evidence & Location images)                              │
│                                                                      │
│  [11] Return GeneratedCase                                          │
│      └─> return { caseId, introSlides, suspects, ... }             │
│                                                                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼ (return to endpoint handler)
┌─────────────────────────────────────────────────────────────────────┐
│              ENDPOINT HANDLER (continued)                            │
│                                                                      │
│  [5] Create Post Title                                              │
│      └─> postTitle = `🔍 ${date} 미스터리 | ${suspectNames}`       │
│                                                                      │
│  [6] Create Reddit Post ─────────────────────────────────┐          │
│      └─> await createPost({                               │          │
│           caseId: newCase.id,                             │          │
│           title: postTitle,                                │          │
│           subredditName: context.subredditName            │          │
│         })                                                 │          │
│                                                            │          │
└────────────────────────────────────────────────────────────┼──────────┘
                                                             │
                                                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              POST CREATION (src/server/core/post.ts:13)              │
│                                                                      │
│  [1] Resolve Subreddit Name                                         │
│      └─> targetSubreddit = options?.subredditName ||                │
│                            context.subredditName                    │
│      └─> ❌ FAIL POINT 7: subredditName undefined → throw          │
│                                                                      │
│  [2] Build Payload                                                  │
│      └─> payload = {                                                │
│           splash: {                                                 │
│             appDisplayName: 'armchair-sleuths',                     │
│             backgroundUri: 'default-splash.png',  ⚠️ ISSUE?        │
│             buttonLabel: '🔍 게임 시작',                            │
│             description: '미스터리를 풀어보세요',                    │
│             entryUri: 'index.html',                                 │
│             heading: '오늘의 미스터리',                              │
│             appIconUri: 'default-icon.png',       ⚠️ ISSUE?        │
│           },                                                         │
│           postData: {                                               │
│             gameState: 'initial',                                   │
│             score: 0,                                               │
│             caseId: caseId,                                         │
│             // NOTE: introSlides NOT included (by design)           │
│           },                                                         │
│           subredditName: targetSubreddit,                           │
│           title: postTitle,                                         │
│         }                                                            │
│                                                                      │
│  [3] Submit to Reddit API                                           │
│      └─> result = await reddit.submitCustomPost(payload)           │
│      └─> ❌ FAIL POINT 8: Reddit API rejection → throw             │
│           Possible causes:                                          │
│           - Invalid asset URIs (backgroundUri, appIconUri)          │
│           - Missing required fields                                 │
│           - Payload validation failure                              │
│                                                                      │
│  [4] Return Post Object                                             │
│      └─> return { id: postId, url: postUrl }                       │
│                                                                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼ (return to endpoint handler)
┌─────────────────────────────────────────────────────────────────────┐
│              ENDPOINT HANDLER (final)                                │
│                                                                      │
│  [7] Return Success Response                                        │
│      └─> res.json({                                                 │
│           navigateTo: `https://reddit.com/r/.../comments/${post.id}` │
│         })                                                           │
│                                                                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SUCCESS                                      │
│  User is redirected to the newly created Reddit post                │
│  Client loads post → fetches case via /api/case/:caseId             │
│  IntroSlides are fetched from KV store (not from post payload)      │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING PATH                             │
│                                                                      │
│  ANY EXCEPTION THROWN ───────────────┐                              │
│  (from Fail Points 1-8)              │                              │
│                                      ▼                               │
│  ┌────────────────────────────────────────────────────┐            │
│  │  Endpoint Catch Block (src/server/index.ts:220)    │            │
│  │                                                     │            │
│  │  catch (error) {                                   │            │
│  │    console.error('❌ [menu/post-create] Error:', │            │
│  │      error.message, error.stack)                   │            │
│  │                                                     │            │
│  │    res.status(400).json({                          │            │
│  │      status: 'error',                              │            │
│  │      message: error.message || 'Failed to create   │            │
│  │               post'                                │            │
│  │    })                                              │            │
│  │  }                                                  │            │
│  └────────────────────────────────────────────────────┘            │
│                                      │                               │
│                                      ▼                               │
│  ┌────────────────────────────────────────────────────┐            │
│  │  Client Receives:                                  │            │
│  │  HTTP 400 Bad Request                              │            │
│  │  { status: 'error', message: '...' }               │            │
│  └────────────────────────────────────────────────────┘            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Exception Points Summary

| ID | Location | Cause | Likelihood | Impact |
|----|----------|-------|------------|--------|
| **FAIL POINT 1** | `index.ts:158` | API key missing | Low (5%) | 500 error, clear message |
| **FAIL POINT 2** | `CaseGeneratorService.ts:178` | Element validation failed | Low (5%) | 400 error, validation message |
| **FAIL POINT 3** | `CaseGeneratorService.ts:185` | Gemini API timeout | Medium (10%) | 400 error, retry exhausted |
| **FAIL POINT 4** | `CaseGeneratorService.ts:200` | Story validation failed | Low (5%) | 400 error, validation message |
| **FAIL POINT 5** | `CaseGeneratorService.ts:450` | Transaction rollback | Low (5%) | 400 error, KV store issue |
| **FAIL POINT 6** | `CaseGeneratorService.ts:296` | KV store write failed | Low (5%) | 400 error, storage issue |
| **FAIL POINT 7** | `post.ts:19` | Subreddit name undefined | Medium (15%) | 400 error, context issue |
| **FAIL POINT 8** | `post.ts:50` | Reddit API rejection | **High (25%)** | 400 error, payload validation |

**Note**: IntroSlidesGenerator has **NO FAIL POINTS** due to template-first approach.

---

## Data Flow: IntroSlides

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INTRO SLIDES LIFECYCLE                            │
└─────────────────────────────────────────────────────────────────────┘

[1] GENERATION
    └─> IntroSlidesGenerator.generateSlides(caseData)
        └─> Returns: IntroSlides object
        └─> Structure: { discovery, suspects, challenge }

[2] STORAGE
    └─> CaseGeneratorService.saveCaseWithTransaction()
        └─> caseData.introSlides = introSlides
        └─> KVStoreManager.saveCase(caseData)
        └─> Stored in KV: `case:${caseId}` → CaseData

[3] POST CREATION
    └─> createPost({ caseId, title, subredditName })
        └─> payload.postData.caseId = caseId
        └─> NOTE: introSlides NOT in payload
        └─> reddit.submitCustomPost(payload)

[4] CLIENT FETCH
    └─> Client loads post → reads caseId from postData
    └─> Client requests: GET /api/case/:caseId
    └─> Server retrieves from KV: KVStoreManager.getCase(caseId)
    └─> Returns: { ...caseData, introSlides }

[5] CLIENT DISPLAY
    └─> Client receives full case with introSlides
    └─> Renders ThreeSlideIntro component
    └─> Uses introSlides.discovery, .suspects, .challenge
```

**Key Insight**: IntroSlides are **never passed through the POST payload**. They are stored in KV and fetched by the client after post creation.

---

## Most Likely Error Scenario

```
┌─────────────────────────────────────────────────────────────────────┐
│               HYPOTHESIS: Reddit API Rejection (25%)                 │
└─────────────────────────────────────────────────────────────────────┘

[1] Case generation succeeds
    ✅ Elements validated
    ✅ Story generated
    ✅ IntroSlides generated (template-first)
    ✅ Suspects generated
    ✅ Case saved to KV store

[2] createPost() is called
    ✅ caseId exists
    ✅ title generated
    ✅ subredditName from context

[3] Payload built
    payload = {
      splash: {
        appDisplayName: 'armchair-sleuths',
        backgroundUri: 'default-splash.png',  // ⚠️ ISSUE
        appIconUri: 'default-icon.png',       // ⚠️ ISSUE
        ...
      },
      postData: { caseId, ... },
      subredditName: context.subredditName,
      title: postTitle
    }

[4] reddit.submitCustomPost(payload)
    ❌ Reddit API validates payload
    ❌ Asset URIs fail validation
    ❌ Throws exception: "Invalid asset reference"

[5] Exception propagates
    createPost() → throws
    endpoint handler → catch block
    res.status(400).json({ error: '...' })

[6] Client receives
    HTTP 400 Bad Request
```

**Why This is Most Likely**:
- Asset URIs are relative paths, not full URLs
- Devvit may require uploaded assets or specific paths
- Other endpoints work fine (no IntroSlides issues)
- Error happens during `reddit.submitCustomPost()` not during case generation

---

## Recommended Testing Sequence

```bash
# TEST 1: Verify API key
curl -X POST http://localhost:5173/internal/menu/post-create
# Look for: "✅ API Key: EXISTS" in logs

# TEST 2: Check case generation logs
# Look for: "✅ Case generated: case-..."
#           "✅ IntroSlides: Generated"

# TEST 3: Verify post creation attempt
# Look for: "📮 Creating Reddit post: ..."
#           "❌ Failed to create post: [ERROR MESSAGE]"

# TEST 4: Test with minimal splash
# Edit post.ts to remove backgroundUri and appIconUri
# Redeploy and test

# TEST 5: Verify IntroSlides structure
curl http://localhost:5173/api/case/case-2025-10-24-... | jq '.introSlides'
# Should return valid 3-slide structure
```
