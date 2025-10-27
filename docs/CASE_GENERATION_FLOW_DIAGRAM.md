# Case Generation Flow Diagram

## Current Flow (Broken)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        POST /internal/menu/post-create                      │
│                         (src/server/index.ts:150)                           │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CaseGeneratorService.generateCase()                     │
│                    (CaseGeneratorService.ts:154-346)                        │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Select Case Elements                                               │
│  ────────────────────────────────                                           │
│  CaseElementLibrary.getTodaysCaseElements(date)                             │
│                                                                              │
│  Returns:                                                                    │
│  ├─ weapon: Weapon                                                          │
│  ├─ motive: Motive                                                          │
│  ├─ location: Location                                                      │
│  └─ suspects: Suspect[3]  ✅ CORRECT: 3 archetypes                          │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Generate Story (AI)                                                │
│  ─────────────────────────────                                              │
│  this.generateCaseStory(weapon, motive, location, suspects, temperature)    │
│  (Lines 186-196)                                                            │
│                                                                              │
│  AI Prompt: "용의자 3명" (3 suspects)                                        │
│  AI Response: ❌ RETURNS 4 SUSPECTS (non-deterministic)                     │
│                                                                              │
│  Returns:                                                                    │
│  ├─ victim: { name, background, relationship }                              │
│  ├─ suspects: Array[4] ❌ MISMATCH: 4 suspects instead of 3                 │
│  └─ solution: { who, what, where, when, why, how }                          │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Generate Intro Slides                                              │
│  ───────────────────────────────                                            │
│  this.generateIntroSlides(caseStory, weapon, location, suspects)            │
│  (Lines 213-218)                                                            │
│                                                                              │
│  INTERNAL NORMALIZATION (Lines 474-513):                                    │
│  ─────────────────────────────────────                                      │
│  const minLength = Math.min(                                                │
│    caseStory.suspects.length,        // 4                                   │
│    suspectArchetypes.length          // 3                                   │
│  ); // minLength = 3                                                        │
│                                                                              │
│  const normalizedSuspects = caseStory.suspects.slice(0, minLength);         │
│  // normalizedSuspects.length = 3 ✅ NORMALIZED                             │
│                                                                              │
│  ⚠️  WARNING LOGGED: "Truncated 1 suspect(s) to match archetype count"     │
│                                                                              │
│  Returns: IntroSlides (3 suspects)                                          │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Generate Case Image (Optional)                                     │
│  ────────────────────────────────────────                                   │
│  if (includeImage) {                                                        │
│    imageUrl = await this.generateCaseImage(location, weapon, victim.name)   │
│  }                                                                           │
│  (Lines 222-240)                                                            │
│                                                                              │
│  Result: imageUrl or undefined ✅ SUCCESS (not critical)                    │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Generate Suspect Profile Images ❌ CRASH POINT                     │
│  ────────────────────────────────────────────────                           │
│  if (includeSuspectImages) {                                                │
│    suspectsWithImages = await this.generateSuspectProfileImages(            │
│      caseStory.suspects,    ❌ PROBLEM: Uses ORIGINAL 4-suspect array       │
│      elements.suspects,     ✅ CORRECT: 3 archetype array                   │
│      includeSuspectImages                                                   │
│    )                                                                         │
│  }                                                                           │
│  (Lines 243-249)                                                            │
│                                                                              │
│  Inside generateSuspectProfileImages() (Lines 711-739):                     │
│  ───────────────────────────────────────────────────────                    │
│  for (let index = 0; index < suspects.length; index++) {                    │
│    // index 0: ✅ SUCCESS (archetypes[0] exists)                            │
│    // index 1: ✅ SUCCESS (archetypes[1] exists)                            │
│    // index 2: ✅ SUCCESS (archetypes[2] exists)                            │
│    // index 3: ❌ CRASH (archetypes[3] is undefined)                        │
│                                                                              │
│    const prompt = this.buildSuspectProfilePrompt(                           │
│      suspect,                                                                │
│      archetypes[index]  // ❌ undefined when index=3                        │
│    );                                                                        │
│  }                                                                           │
│                                                                              │
│  ❌ EXECUTION STOPS HERE                                                    │
│  ─────────────────────────                                                  │
│  - No error thrown (swallowed by catch block)                               │
│  - Express timeout kills connection                                         │
│  - Client sees: Connection closed                                           │
│  - Logs: Only console.error (no stack trace)                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  NEVER REACHED: Generate Discovery Data                                     │
│  ─────────────────────────────────────────                                  │
│  const locations = this.generateLocationsForCase(...)                       │
│  const evidence = this.generateEvidenceForCase(...)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  NEVER REACHED: Save Case to KV Store                                       │
│  ───────────────────────────────────────────                                │
│  await this.saveCaseWithTransaction(...)                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  NEVER REACHED: Start Background Image Generation                           │
│  ───────────────────────────────────────────────────────                    │
│  this.startBackgroundImageGeneration(...)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  NEVER REACHED: Return Generated Case                                       │
│  ──────────────────────────────────────                                     │
│  return { caseId, date, victim, weapon, ... }                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  NEVER REACHED: Create Reddit Post                                          │
│  ────────────────────────────────────                                       │
│  const post = await createPost({ caseId, title, subredditName })            │
│  (index.ts:213)                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  NEVER REACHED: Submit to Reddit                                            │
│  ──────────────────────────────────                                         │
│  await reddit.submitCustomPost(payload)                                     │
│  (post.ts:43)                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Fixed Flow (Proposed)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        POST /internal/menu/post-create                      │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CaseGeneratorService.generateCase()                     │
│                          [WITH TRY-CATCH]                                   │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Select Case Elements                                               │
│  ────────────────────────────────                                           │
│  elements = CaseElementLibrary.getTodaysCaseElements(date)                  │
│  Returns: { weapon, motive, location, suspects: Suspect[3] }                │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Generate Story (AI with Retry)                                     │
│  ────────────────────────────────────────                                   │
│  caseStory = await this.workflowExecutor.executeWithRetry(                  │
│    () => this.generateCaseStory(...),                                       │
│    DEFAULT_RETRY_POLICIES.TEXT_GENERATION                                   │
│  )                                                                           │
│                                                                              │
│  AI may still return 4 suspects ⚠️                                          │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 2.5: NEW - Validate and Normalize Suspects                            │
│  ─────────────────────────────────────────────────                          │
│  // Validate count matches expected                                         │
│  const expectedCount = elements.suspects.length; // 3                       │
│                                                                              │
│  if (caseStory.suspects.length !== expectedCount) {                         │
│    console.warn(                                                            │
│      `⚠️  Suspect count mismatch: AI generated ` +                          │
│      `${caseStory.suspects.length}, expected ${expectedCount}`              │
│    );                                                                        │
│  }                                                                           │
│                                                                              │
│  // Normalize to match archetype count                                      │
│  const normalizedSuspects = caseStory.suspects.slice(0, expectedCount);     │
│                                                                              │
│  // Update caseStory with normalized array                                  │
│  caseStory.suspects = normalizedSuspects;                                   │
│                                                                              │
│  ✅ NOW: caseStory.suspects.length === elements.suspects.length === 3       │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Generate Intro Slides                                              │
│  ───────────────────────────────                                            │
│  introSlides = await this.generateIntroSlides(...)                          │
│                                                                              │
│  ✅ Works correctly: caseStory.suspects already normalized                  │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Generate Case Image (Optional)                                     │
│  ────────────────────────────────────────                                   │
│  try {                                                                       │
│    imageUrl = await this.generateCaseImage(...)                             │
│  } catch (error) {                                                           │
│    console.warn('⚠️  Case image failed, continuing without image');         │
│    imageUrl = undefined;                                                    │
│  }                                                                           │
│                                                                              │
│  ✅ Graceful degradation: continues even if image fails                     │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Generate Suspect Profile Images ✅ NOW WORKS                       │
│  ────────────────────────────────────────────────                           │
│  suspectsWithImages = await this.generateSuspectProfileImages(              │
│    caseStory.suspects,  ✅ NOW: 3 suspects (normalized)                     │
│    elements.suspects,   ✅ ALWAYS: 3 archetypes                             │
│    includeSuspectImages                                                     │
│  )                                                                           │
│                                                                              │
│  Inside generateSuspectProfileImages():                                     │
│  for (let index = 0; index < suspects.length; index++) {                    │
│    // index 0: ✅ SUCCESS (suspects[0], archetypes[0])                      │
│    // index 1: ✅ SUCCESS (suspects[1], archetypes[1])                      │
│    // index 2: ✅ SUCCESS (suspects[2], archetypes[2])                      │
│    // Loop ends - no index 3                                                │
│                                                                              │
│    try {                                                                     │
│      const prompt = this.buildSuspectProfilePrompt(                         │
│        suspect,                                                              │
│        archetypes[index]  ✅ Always valid index                             │
│      );                                                                      │
│      const response = await this.generateImageWithTimeout(prompt, 30000);   │
│      results.push({ ...suspect, profileImageUrl: response.imageUrl });      │
│    } catch (error) {                                                         │
│      console.error(`❌ Image failed for ${suspect.name}:`, error);          │
│      results.push({ ...suspect, profileImageUrl: undefined });              │
│      // Continue with next suspect                                          │
│    }                                                                         │
│  }                                                                           │
│                                                                              │
│  ✅ Returns: 3 suspects (some may have images, some may not)                │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 6: Generate Discovery Data                                            │
│  ──────────────────────────────────                                         │
│  const locations = this.generateLocationsForCase(...)                       │
│  const evidence = this.generateEvidenceForCase(...)                         │
│                                                                              │
│  ✅ Executes successfully                                                   │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 7: Save Case to KV Store (Transaction)                                │
│  ──────────────────────────────────────────────────                         │
│  const savedCase = await this.saveCaseWithTransaction(                      │
│    caseStory,                                                                │
│    elements,                                                                 │
│    suspectsWithImages,  ✅ 3 suspects with or without images                │
│    imageUrl,                                                                 │
│    introNarration,                                                           │
│    introSlides,                                                              │
│    date,                                                                     │
│    customCaseId,                                                             │
│    locations,                                                                │
│    evidence                                                                  │
│  )                                                                           │
│                                                                              │
│  ✅ Transaction succeeds - case saved to KV store                           │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 8: Start Background Image Generation                                  │
│  ─────────────────────────────────────────────                              │
│  const imagePromise = this.startBackgroundImageGeneration(                  │
│    savedCase.id,                                                            │
│    evidence,                                                                 │
│    locations,                                                                │
│    guiltyIndex                                                               │
│  )                                                                           │
│                                                                              │
│  // Store promise to prevent garbage collection                             │
│  globalThis.__imageGenerationPromises.set(savedCase.id, imagePromise);      │
│                                                                              │
│  ✅ Background task started (non-blocking)                                  │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 9: Return Generated Case                                              │
│  ────────────────────────────────                                           │
│  return {                                                                    │
│    caseId: savedCase.id,                                                    │
│    date: savedCase.date,                                                    │
│    victim: savedCase.victim,                                                │
│    suspects: savedCase.suspects,  ✅ 3 suspects                             │
│    solution: savedCase.solution,                                            │
│    locations: savedCase.locations,                                          │
│    evidence: savedCase.evidence,                                            │
│    introSlides: savedCase.introSlides,                                      │
│    ...                                                                       │
│  }                                                                           │
│                                                                              │
│  ✅ Returns to route handler                                                │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 10: Create Reddit Post                                                │
│  ─────────────────────────────────                                          │
│  const suspectNames = newCase.suspects.map(s => s.name).join(', ');         │
│  const postTitle = `🔍 ${dateStr} 미스터리 | 용의자: ${suspectNames}`;      │
│                                                                              │
│  const post = await createPost({                                            │
│    caseId: newCase.id,                                                      │
│    title: postTitle,                                                        │
│    subredditName: context.subredditName                                     │
│  })                                                                          │
│                                                                              │
│  ✅ Post created successfully                                               │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 11: Submit to Reddit                                                  │
│  ───────────────────────────────                                            │
│  Inside createPost() (src/server/core/post.ts:43):                          │
│                                                                              │
│  const payload = {                                                          │
│    postData: { gameState: 'initial', score: 0, caseId },                    │
│    subredditName,                                                           │
│    title                                                                    │
│  };                                                                          │
│                                                                              │
│  const result = await reddit.submitCustomPost(payload);                     │
│                                                                              │
│  ✅ Post submitted to Reddit successfully                                   │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 12: Return Response to Client                                         │
│  ─────────────────────────────────────                                      │
│  res.json({                                                                 │
│    navigateTo: post  // Reddit post object                                  │
│  });                                                                         │
│                                                                              │
│  ✅ Client receives successful response                                     │
│  ✅ User navigated to new post                                              │
│  ✅ Game playable immediately                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Error Flow Comparison

### Current (Broken)

```
generateSuspectProfileImages() - Line 718
  ↓
❌ archetypes[3] is undefined
  ↓
catch (error) - Line 729
  ↓
console.error() - Only logs to console
  ↓
results.push(suspect) - Continues loop
  ↓
Next iteration tries to access suspect[4] (doesn't exist)
  ↓
Crash or hang
  ↓
Express timeout (120s)
  ↓
Connection closed
  ↓
Client: "Connection lost"
```

### Fixed (Proposed)

```
generateSuspectProfileImages() - Receives 3 suspects
  ↓
for (index = 0; index < 3; index++)
  ↓
index 0: ✅ Generate image or fail gracefully
index 1: ✅ Generate image or fail gracefully
index 2: ✅ Generate image or fail gracefully
  ↓
Loop ends naturally
  ↓
Return results (3 suspects, some may lack images)
  ↓
Continue to next step
  ↓
Post created successfully
  ↓
Client: "Post created successfully"
```

---

## Data Normalization Timeline

### Current (Too Late)

```
Time 0: AI generates story
  └─ Returns: { suspects: [s1, s2, s3, s4] }

Time 1: Pass to generateSuspectProfileImages()
  └─ Input: suspects = [s1, s2, s3, s4]
  └─ Input: archetypes = [a1, a2, a3]
  └─ ❌ MISMATCH

Time 2: generateIntroSlides() normalizes
  └─ But image generation already started with wrong array
```

### Fixed (Just Right)

```
Time 0: AI generates story
  └─ Returns: { suspects: [s1, s2, s3, s4] }

Time 1: Normalize immediately
  └─ caseStory.suspects = caseStory.suspects.slice(0, 3)
  └─ Now: { suspects: [s1, s2, s3] }

Time 2: Pass to generateSuspectProfileImages()
  └─ Input: suspects = [s1, s2, s3]
  └─ Input: archetypes = [a1, a2, a3]
  └─ ✅ MATCH

Time 3: generateIntroSlides()
  └─ Already normalized, no need for extra logic
```

---

## Service Boundary Violation

### Current (Monolithic)

```
┌───────────────────────────────────────────────────────────┐
│                  CaseGeneratorService                     │
│  (1,200 lines - God Object)                               │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Story Generation (AI Prompting)                  │    │
│  ├──────────────────────────────────────────────────┤    │
│  │ Image Generation (Gemini API)                    │    │
│  ├──────────────────────────────────────────────────┤    │
│  │ Data Normalization (Array manipulation)          │    │
│  ├──────────────────────────────────────────────────┤    │
│  │ Data Validation (Schema checks)                  │    │
│  ├──────────────────────────────────────────────────┤    │
│  │ Discovery Data (Locations, Evidence)             │    │
│  ├──────────────────────────────────────────────────┤    │
│  │ Transaction Management (KV Store)                │    │
│  ├──────────────────────────────────────────────────┤    │
│  │ Background Task Orchestration                    │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  ❌ All concerns mixed together                           │
│  ❌ Hard to test                                           │
│  ❌ Hard to maintain                                       │
│  ❌ Errors cascade across boundaries                      │
└───────────────────────────────────────────────────────────┘
```

### Proposed (Decomposed)

```
┌──────────────────────┐
│  CaseOrchestrator    │  ← Coordinates flow, handles errors
│  (Thin coordinator)  │
└──────────┬───────────┘
           │
           ├──► ┌─────────────────────────┐
           │    │  StoryGenerator         │
           │    │  - buildPrompt()        │
           │    │  - callGeminiAPI()      │
           │    │  - parseResponse()      │
           │    └─────────────────────────┘
           │
           ├──► ┌─────────────────────────┐
           │    │  SuspectNormalizer      │
           │    │  - validateCount()      │
           │    │  - normalize()          │
           │    │  - reconcileArchetypes()│
           │    └─────────────────────────┘
           │
           ├──► ┌─────────────────────────┐
           │    │  ImageGenerator         │
           │    │  - generateSuspect()    │
           │    │  - generateLocation()   │
           │    │  - handleFailures()     │
           │    └─────────────────────────┘
           │
           ├──► ┌─────────────────────────┐
           │    │  DiscoveryDataGenerator │
           │    │  - generateLocations()  │
           │    │  - generateEvidence()   │
           │    │  - distributeEvidence() │
           │    └─────────────────────────┘
           │
           └──► ┌─────────────────────────┐
                │  CaseRepository         │
                │  - saveWithTransaction()│
                │  - rollback()           │
                │  - retrieveCase()       │
                └─────────────────────────┘

✅ Each service has single responsibility
✅ Easy to test in isolation
✅ Errors contained within service boundaries
✅ Easy to add retry logic per service
```

---

## Async Execution Pattern

### Current (Sequential with Failure Point)

```
Image 1: Generate → ✅ 5 seconds
  ↓
Image 2: Generate → ✅ 5 seconds
  ↓
Image 3: Generate → ✅ 5 seconds
  ↓
Image 4: Generate → ❌ CRASH (array bounds)
  ↓
❌ Execution stops

Total time: 15 seconds (but fails)
```

### Fixed (Sequential with Graceful Degradation)

```
Image 1: Generate → ✅ 5 seconds
  ↓
Image 2: Generate → ✅ 5 seconds
  ↓
Image 3: Generate → ✅ 5 seconds
  ↓
Loop ends (only 3 images needed)
  ↓
✅ Continue to next step

Total time: 15 seconds ✅ SUCCESS
```

### Future (Parallel with Circuit Breaker)

```
Image 1: Generate ──┐
                    ├──► Promise.allSettled()
Image 2: Generate ──┤       ↓
                    │    ✅ All succeeded (5s)
Image 3: Generate ──┘    or
                         ⚠️  Some failed but continue

Total time: 5 seconds ✅ 3x faster
```

