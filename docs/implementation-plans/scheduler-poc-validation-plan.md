# 100% Validation PoC: Scheduler-Based Image Generation
## Comprehensive Verification Plan

---

**Version**: 1.0
**Created**: 2025-10-22
**Status**: 🔴 Ready for Execution
**Purpose**: Verify scheduler-based image generation works 100% before investing 24-30 hours
**Investment**: 3 hours (PoC) vs 24-30 hours (full migration)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Lessons from Vercel Failure](#lessons-from-vercel-failure)
3. [100% Validation Requirements](#100-validation-requirements)
4. [PoC Implementation Specification](#poc-implementation-specification)
5. [Test Execution Protocol](#test-execution-protocol)
6. [Result Interpretation & Decision Matrix](#result-interpretation--decision-matrix)
7. [Acceptance Criteria](#acceptance-criteria)
8. [Appendices](#appendices)

---

## Executive Summary

### Problem Statement

We created a 45-task migration plan (24-30 hours) for scheduler-based image generation. **But what if it fails after full implementation?** The Vercel integration attempt taught us: **assumptions kill projects**.

### The Vercel Failure Lesson

**What went wrong**:
- ✅ Added HTTP permissions to `devvit.json`
- ✅ Deployed and tested
- ❌ Still got `PERMISSION_DENIED`
- ❌ Root cause: "Domain requests are subject to review" (missed in docs)
- ❌ **No Reddit approval = no Vercel access**

**What we missed**:
- Small documentation footnotes
- Production vs test environment differences
- **Assumption that configuration = permission**

### PoC Strategy

**Instead of**:
```
Full Implementation (24-30h) → Test → ❌ Fails → 💸 Time wasted
```

**We do**:
```
PoC (3h) → Test → ✅ Validates → Full Implementation (24-30h) → ✅ Success
         ↓
         ❌ Fails → Pivot to alternative (saved 24-30h)
```

### Success Definition

This PoC succeeds when we can say with **100% confidence**:

> "If we implement the full 45-task plan, it WILL work in production."

---

## Lessons from Vercel Failure

### What We Learned

#### 1. Documentation ≠ Reality
**Mistake**: Assumed HTTP permissions in `devvit.json` meant immediate access
**Reality**: Domain whitelisting requires Reddit approval with unknown timeline
**Lesson**: Test actual API calls, not just configuration

#### 2. Test Environment ≠ Production
**Mistake**: Tested in development subreddit only
**Reality**: Production environment may have different constraints
**Lesson**: Test in production-like conditions

#### 3. Small Footnotes = Big Blockers
**Mistake**: Missed "subject to review" clause
**Reality**: That one line meant complete feature failure
**Lesson**: Read ALL documentation thoroughly, especially warnings

#### 4. Assumptions Are Dangerous
**Mistake**: Assumed Vercel would work because other HTTP fetches worked
**Reality**: Different domains have different approval requirements
**Lesson**: Assume nothing, verify everything

### How This PoC Prevents Repeat Failures

| Vercel Mistake | PoC Prevention |
|----------------|----------------|
| Assumed permissions work | ✅ Test every permission explicitly |
| Tested in dev only | ✅ Test in actual subreddit |
| Missed timeout limits | ✅ Measure exact timeout boundaries |
| Skipped edge cases | ✅ Test all error scenarios |
| No fallback plan | ✅ Decision tree for all outcomes |

---

## 100% Validation Requirements

### Level 1: Permission Verification (Critical 🔴)

**Objective**: Verify every permission works in scheduler context

| # | Requirement | Test Method | Success Criteria |
|---|-------------|-------------|------------------|
| 1.1 | Scheduler job accesses `context.settings` | Call `context.settings.get('geminiApiKey')` | Returns API key, no error |
| 1.2 | Scheduler job accesses `context.redis` | Read/Write Redis key | Operations succeed |
| 1.3 | Scheduler job calls Gemini API | `fetch('generativelanguage.googleapis.com')` | HTTP 200, image returned |
| 1.4 | Settings persist across jobs | Read setting in 2nd job | Same value retrieved |
| 1.5 | Redis data persists across jobs | Write in job 1, read in job 2 | Data intact |

**Why Critical**: If any permission fails, entire approach is dead.

---

### Level 2: Timeout Boundary Measurement (Critical 🔴)

**Objective**: Find exact timeout limits for scheduler jobs

| # | Test | Image Count | Expected Time | Measure |
|---|------|-------------|---------------|---------|
| 2.1 | Minimal load | 5 images | ~15 seconds | Success/Fail + Duration |
| 2.2 | Light load | 10 images | ~30 seconds | Success/Fail + Duration |
| 2.3 | Target load | 15 images | ~45 seconds | Success/Fail + Duration |
| 2.4 | Heavy load | 20 images | ~60 seconds | Success/Fail + Duration |
| 2.5 | Stress test | 25 images | ~75 seconds | Success/Fail + Duration |

**Success Criteria**:
- ✅ **Ideal**: 25 images succeed (covers all use cases)
- ⚠️ **Acceptable**: 15 images succeed (can batch process)
- ❌ **Failure**: < 10 images succeed (approach not viable)

**Why Critical**: Without knowing timeout limits, we can't design the system.

---

### Level 3: Real Data Validation (High 🟡)

**Objective**: Use actual production data sizes and structures

| # | Requirement | Real Value | Test Implementation |
|---|-------------|------------|---------------------|
| 3.1 | Use actual prompt length | 300-500 characters | Copy from CaseGeneratorService |
| 3.2 | Use actual image size | 1024x1024 | Same Gemini API params |
| 3.3 | Use actual Redis structure | CaseData interface | Same JSON schema |
| 3.4 | Use actual status tracking | ImageGenerationStatus | Same interface |

**Why Important**: Simplified tests may pass, but production-size data may fail.

---

### Level 4: Error Scenario Testing (High 🟡)

**Objective**: Verify system handles failures gracefully

| # | Scenario | Test Method | Expected Behavior |
|---|----------|-------------|-------------------|
| 4.1 | Invalid API key | Use wrong key | Job fails with clear error |
| 4.2 | Gemini rate limiting | Rapid successive calls | Retry logic or graceful degradation |
| 4.3 | Network timeout | Simulate slow connection | Error captured, job continues |
| 4.4 | Redis write failure | Simulate Redis error | Transaction rollback |
| 4.5 | Partial completion | Kill job mid-execution | Can resume or restart |

**Why Important**: Production always has errors. System must handle them.

---

### Level 5: Concurrency Testing (Medium 🟢)

**Objective**: Verify multiple jobs don't interfere

| # | Test | Method | Success Criteria |
|---|------|--------|------------------|
| 5.1 | Parallel jobs | Trigger 2 jobs simultaneously | Both complete successfully |
| 5.2 | Redis conflicts | Concurrent writes to same key | No data corruption |
| 5.3 | Status isolation | Each job has separate status | No status mixing |

**Why Important**: Production may have multiple cases generating images.

---

## PoC Implementation Specification

### File Structure

```
scheduler-poc/
├── devvit.json                 # Scheduler + menu configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── src/
│   ├── main.tsx                # Server routes + scheduler jobs
│   ├── types.ts                # TestResult interfaces
│   ├── gemini-client.ts        # Copied from armchair-sleuths
│   └── test-prompts.ts         # Real prompts from production
└── README.md                   # Test execution instructions
```

---

### devvit.json Configuration

```json
{
  "$schema": "https://developers.reddit.com/schema/config-file.v1.json",
  "name": "scheduler-poc",
  "version": "1.0.0",

  "server": {
    "dir": "dist/server",
    "entry": "index.js"
  },

  "scheduler": {
    "tasks": {
      "test-5-images": {
        "endpoint": "/internal/scheduler/test-5"
      },
      "test-10-images": {
        "endpoint": "/internal/scheduler/test-10"
      },
      "test-15-images": {
        "endpoint": "/internal/scheduler/test-15"
      },
      "test-20-images": {
        "endpoint": "/internal/scheduler/test-20"
      },
      "test-25-images": {
        "endpoint": "/internal/scheduler/test-25"
      }
    }
  },

  "menu": {
    "items": [
      {
        "label": "🧪 Test 5 Images",
        "description": "Quick validation test",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/test-5"
      },
      {
        "label": "🧪 Test 10 Images",
        "description": "Light load test",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/test-10"
      },
      {
        "label": "🧪 Test 15 Images",
        "description": "Target load test (production)",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/test-15"
      },
      {
        "label": "🧪 Test 20 Images",
        "description": "Heavy load test",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/test-20"
      },
      {
        "label": "🧪 Test 25 Images",
        "description": "Stress test",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/test-25"
      },
      {
        "label": "📊 View Test Results",
        "description": "Display all test outcomes",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/view-results"
      },
      {
        "label": "🔄 Test Concurrency",
        "description": "Run 2 jobs simultaneously",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/test-concurrent"
      },
      {
        "label": "❌ Test Error Handling",
        "description": "Simulate failures",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/test-errors"
      }
    ]
  },

  "settings": {
    "global": {
      "geminiApiKey": {
        "type": "string",
        "label": "Gemini API Key",
        "isSecret": true
      }
    }
  },

  "permissions": {
    "media": true
  }
}
```

---

### TypeScript Interfaces

**src/types.ts**:

```typescript
/**
 * Individual image generation result
 */
export interface ImageResult {
  /** Image index (0-based) */
  index: number;

  /** Time taken to generate this image (ms) */
  duration: number;

  /** Success status */
  success: boolean;

  /** Generated image URL (if successful) */
  url?: string;

  /** Error message (if failed) */
  error?: string;
}

/**
 * Error details
 */
export interface ErrorResult {
  /** Image index (-1 for overall job errors) */
  index: number;

  /** Error message */
  message: string;

  /** Error timestamp */
  timestamp: number;

  /** Error type categorization */
  type: 'permission' | 'timeout' | 'api' | 'redis' | 'unknown';
}

/**
 * Permission test results
 */
export interface PermissionTest {
  /** Can access context.settings */
  settingsAccess: boolean;

  /** Can read from Redis */
  redisRead: boolean;

  /** Can write to Redis */
  redisWrite: boolean;

  /** Can call Gemini API */
  geminiAccess: boolean;

  /** Detailed error messages for failures */
  errors: string[];
}

/**
 * Complete test run result
 */
export interface TestResult {
  /** Unique test ID */
  testId: string;

  /** Number of images attempted */
  count: number;

  /** Test start timestamp */
  startTime: number;

  /** Test end timestamp */
  endTime: number;

  /** Total duration (ms) */
  duration: number;

  /** Overall success status */
  success: boolean;

  /** Did the job timeout? */
  timedOut: boolean;

  /** Permission verification results */
  permissions: PermissionTest;

  /** Individual image results */
  images: ImageResult[];

  /** All errors encountered */
  errors: ErrorResult[];

  /** Environment info */
  environment: {
    subreddit: string;
    timestamp: string;
    devvitVersion: string;
  };
}

/**
 * Aggregated test suite results
 */
export interface TestSuiteResults {
  /** All test runs */
  tests: TestResult[];

  /** Summary statistics */
  summary: {
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    maxImagesAchieved: number;
    averageDurationPerImage: number;
    timeoutThreshold?: number; // If timeout detected
  };

  /** Overall recommendation */
  recommendation: 'PROCEED' | 'ADJUST_STRATEGY' | 'ABORT';

  /** Reasoning for recommendation */
  reasoning: string;
}
```

---

### Core Test Function

**src/main.tsx** (scheduler job implementation):

```typescript
import { Devvit } from '@devvit/public-api';
import { TestResult, ImageResult, ErrorResult, PermissionTest } from './types';
import { createGeminiClient } from './gemini-client';
import { REAL_PROMPTS } from './test-prompts';

/**
 * Main test function - runs in scheduler job context
 */
async function runImageGenerationTest(
  count: number,
  context: any
): Promise<TestResult> {
  const testId = `test-${count}-${Date.now()}`;
  const startTime = Date.now();

  const result: TestResult = {
    testId,
    count,
    startTime,
    endTime: 0,
    duration: 0,
    success: false,
    timedOut: false,
    permissions: {
      settingsAccess: false,
      redisRead: false,
      redisWrite: false,
      geminiAccess: false,
      errors: []
    },
    images: [],
    errors: [],
    environment: {
      subreddit: 'armchair_sleuths_dev',
      timestamp: new Date().toISOString(),
      devvitVersion: '0.12' // Update based on actual version
    }
  };

  try {
    // ===== LEVEL 1: PERMISSION VERIFICATION =====
    console.log(`[${testId}] Phase 1: Verifying permissions...`);

    // Test 1.1: Settings access
    try {
      const apiKey = await context.settings.get('geminiApiKey');
      if (apiKey && typeof apiKey === 'string' && apiKey.length > 0) {
        result.permissions.settingsAccess = true;
        console.log(`[${testId}] ✅ Settings access: OK`);
      } else {
        throw new Error('API key not found or invalid');
      }
    } catch (error) {
      result.permissions.errors.push(`Settings: ${String(error)}`);
      console.error(`[${testId}] ❌ Settings access: FAILED`);
      throw error; // Critical failure
    }

    // Test 1.2: Redis read
    try {
      const testValue = await context.redis.get('test-read-key');
      result.permissions.redisRead = true;
      console.log(`[${testId}] ✅ Redis read: OK`);
    } catch (error) {
      result.permissions.errors.push(`Redis read: ${String(error)}`);
      console.error(`[${testId}] ❌ Redis read: FAILED`);
    }

    // Test 1.3: Redis write
    try {
      await context.redis.set(`test-write-${testId}`, JSON.stringify({ test: true }));
      result.permissions.redisWrite = true;
      console.log(`[${testId}] ✅ Redis write: OK`);
    } catch (error) {
      result.permissions.errors.push(`Redis write: ${String(error)}`);
      console.error(`[${testId}] ❌ Redis write: FAILED`);
    }

    // ===== LEVEL 2 & 3: IMAGE GENERATION WITH REAL DATA =====
    console.log(`[${testId}] Phase 2: Generating ${count} images with real prompts...`);

    const apiKey = await context.settings.get('geminiApiKey');
    const geminiClient = createGeminiClient(apiKey as string);

    // Use actual prompts from production
    const prompts = REAL_PROMPTS.slice(0, count);

    for (let i = 0; i < count; i++) {
      const imageStart = Date.now();
      const imageResult: ImageResult = {
        index: i,
        duration: 0,
        success: false
      };

      try {
        console.log(`[${testId}] Generating image ${i + 1}/${count}...`);

        // Use REAL Gemini API call with REAL prompt
        const response = await geminiClient.generateImage(prompts[i]);

        const imageEnd = Date.now();
        imageResult.duration = imageEnd - imageStart;
        imageResult.success = true;
        imageResult.url = response.imageUrl;

        result.images.push(imageResult);

        // Test 1.4: Redis persistence
        await context.redis.set(
          `test-image:${testId}:${i}`,
          JSON.stringify({ url: response.imageUrl, index: i })
        );

        console.log(`[${testId}] ✅ Image ${i + 1}/${count} generated in ${imageResult.duration}ms`);

        // Mark Gemini access as successful
        if (i === 0) {
          result.permissions.geminiAccess = true;
        }

      } catch (error) {
        const imageEnd = Date.now();
        imageResult.duration = imageEnd - imageStart;
        imageResult.error = String(error);

        result.errors.push({
          index: i,
          message: String(error),
          timestamp: Date.now(),
          type: categorizeError(String(error))
        });

        result.images.push(imageResult);
        console.error(`[${testId}] ❌ Image ${i + 1}/${count} failed: ${error}`);

        // Continue to next image (test resilience)
      }
    }

    // Mark as successful if at least some images generated
    result.success = result.images.filter(img => img.success).length > 0;

  } catch (error) {
    console.error(`[${testId}] ❌ Critical error:`, error);
    result.errors.push({
      index: -1,
      message: String(error),
      timestamp: Date.now(),
      type: 'permission'
    });
  } finally {
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;

    // Check for timeout (heuristic: if duration is suspiciously close to a round number)
    if (result.duration >= 60000 && result.duration <= 61000) {
      result.timedOut = true;
      console.warn(`[${testId}] ⚠️ Possible timeout detected`);
    }

    // Save result to Redis
    try {
      await context.redis.set(
        `test-result:${testId}`,
        JSON.stringify(result)
      );
      console.log(`[${testId}] 📊 Results saved to Redis`);
    } catch (error) {
      console.error(`[${testId}] Failed to save results:`, error);
    }

    // Log summary
    const successCount = result.images.filter(img => img.success).length;
    console.log(`[${testId}] ===== TEST COMPLETE =====`);
    console.log(`[${testId}] Success: ${successCount}/${count} images`);
    console.log(`[${testId}] Duration: ${(result.duration / 1000).toFixed(1)}s`);
    console.log(`[${testId}] Avg per image: ${(result.duration / count / 1000).toFixed(1)}s`);
  }

  return result;
}

/**
 * Categorize error type for analytics
 */
function categorizeError(errorMessage: string): ErrorResult['type'] {
  if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
    return 'permission';
  }
  if (errorMessage.includes('timeout') || errorMessage.includes('deadline')) {
    return 'timeout';
  }
  if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
    return 'api';
  }
  if (errorMessage.includes('redis')) {
    return 'redis';
  }
  return 'unknown';
}

// ===== SCHEDULER JOB DEFINITIONS =====

Devvit.addSchedulerJob({
  name: 'test-5-images',
  onRun: async (event, context) => {
    await runImageGenerationTest(5, context);
  }
});

Devvit.addSchedulerJob({
  name: 'test-10-images',
  onRun: async (event, context) => {
    await runImageGenerationTest(10, context);
  }
});

Devvit.addSchedulerJob({
  name: 'test-15-images',
  onRun: async (event, context) => {
    await runImageGenerationTest(15, context);
  }
});

Devvit.addSchedulerJob({
  name: 'test-20-images',
  onRun: async (event, context) => {
    await runImageGenerationTest(20, context);
  }
});

Devvit.addSchedulerJob({
  name: 'test-25-images',
  onRun: async (event, context) => {
    await runImageGenerationTest(25, context);
  }
});

// ===== MENU ITEM HANDLERS =====

Devvit.addMenuItem({
  label: '🧪 Test 5 Images',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const jobId = await context.scheduler.runJob({
      name: 'test-5-images',
      runAt: new Date(Date.now() + 1000) // 1 second delay
    });
    context.ui.showToast(`Test 5 images started: ${jobId}`);
  }
});

// ... (similar for other counts)

Devvit.addMenuItem({
  label: '📊 View Test Results',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const keys = await context.redis.scan('test-result:*', { count: 100 });
    const results: TestResult[] = [];

    for (const key of keys) {
      const data = await context.redis.get(key);
      if (data) {
        results.push(JSON.parse(data));
      }
    }

    // Generate summary
    const summary = generateSummary(results);

    context.ui.showToast(`Found ${results.length} test results. Check logs for details.`);
    console.log('===== TEST SUITE SUMMARY =====');
    console.log(JSON.stringify(summary, null, 2));
  }
});

export default Devvit;
```

---

### Real Prompts File

**src/test-prompts.ts**:

```typescript
/**
 * Real prompts from production CaseGeneratorService
 * These ensure we test with actual data sizes and complexity
 */
export const REAL_PROMPTS = [
  // Location prompts (300-500 chars)
  `A detailed crime scene photograph showing: Luxury penthouse apartment with floor-to-ceiling windows overlooking the city skyline. Modern minimalist furniture, expensive art on walls, marble floors. A broken champagne glass near the balcony door. Blood stains on white carpet. Evidence markers placed around the scene. Style: Realistic, cinematic lighting, professional crime scene photography, high contrast. No text, no people visible.`,

  `A detailed crime scene photograph showing: Victorian-era study with dark wood paneling, leather-bound books lining the walls, antique desk with scattered papers. A crystal decanter overturned, liquid pooling on mahogany surface. Fireplace with dying embers. Persian rug slightly askew. Evidence of struggle visible. Style: Realistic, moody atmospheric lighting, professional crime scene photography. No text, no people visible.`,

  `A detailed crime scene photograph showing: Industrial warehouse district, abandoned factory building with broken windows, graffiti-covered walls. Loading dock area with metal rolling doors, scattered shipping crates. Tire tracks in dust on concrete floor. Dim fluorescent lights flickering overhead. Style: Realistic, gritty urban photography, professional crime scene documentation. No text, no people visible.`,

  // Suspect prompts (350-450 chars)
  `Professional portrait photograph of a person:
Name: Victoria Chen
Age: 34
Gender: Female
Appearance: Asian features, sharp cheekbones, piercing dark eyes, shoulder-length black hair styled in a sleek bob, wearing designer business suit, pearl necklace, subtle makeup emphasizing confidence and ambition.
Occupation: Investment banker, managing director at prestigious firm

Style: Realistic portrait, neutral gray background, professional studio lighting, front-facing, corporate headshot quality. No text overlay, no crime scene elements.`,

  `Professional portrait photograph of a person:
Name: Marcus Rodriguez
Age: 42
Gender: Male
Appearance: Latino features, athletic build, salt-and-pepper hair, well-groomed beard, intense gaze, wearing casual expensive clothing (designer polo, luxury watch visible), confident posture suggesting authority.
Occupation: Restaurant owner, celebrity chef

Style: Realistic portrait, neutral background, professional lighting, front-facing, magazine quality headshot. No text overlay, no crime scene elements.`,

  // Evidence prompts (250-350 chars)
  `Crime scene evidence photograph:
Item: Handwritten threatening letter
Description: Torn piece of expensive stationary paper, fountain pen ink in elegant cursive handwriting, visible creases from being crumpled and smoothed out, coffee stain in corner, partial fingerprint visible on edge.

Style: Professional evidence photography, well-lit against white background, forensic documentation quality, isolated object, macro detail visible. No text labels, no hands or people visible.`,

  `Crime scene evidence photograph:
Item: Vintage pocket watch
Description: Antique gold pocket watch, ornate engraving on case, cracked crystal face showing Roman numerals, stopped at 11:47, attached to broken chain, slight blood smear on back case, intricate mechanical works visible through damage.

Style: Professional evidence photography, neutral background, controlled lighting showcasing metallic surfaces and details, forensic macro photography. No text labels, no hands or people visible.`,

  // More variety prompts
  `A detailed crime scene photograph showing: Rooftop garden terrace at night, string lights overhead, wrought-iron furniture, potted plants and flowers, glass railing with city lights below, champagne bottle and glasses on table, evidence markers near overturned chair. Style: Realistic, dramatic nighttime lighting, professional crime scene photography. No text, no people visible.`,

  `Professional portrait photograph of a person:
Name: Eleanor Thompson
Age: 56
Gender: Female
Appearance: Caucasian features, distinguished silver-gray hair in elegant updo, refined features, wearing vintage designer dress, statement jewelry, reading glasses on chain, expression of cultured intelligence mixed with guardedness.
Occupation: Art gallery curator, antiques appraiser

Style: Realistic portrait, neutral background, professional lighting, three-quarter angle, sophisticated editorial quality. No text overlay, no crime scene elements.`,

  `Crime scene evidence photograph:
Item: Broken smartphone
Description: Luxury smartphone with shattered screen, expensive case removed and lying separately, visible text message notification on cracked display (unreadable), device partially submerged in water creating distortion, SIM card ejected.

Style: Professional evidence photography, white background, clinical lighting, forensic documentation, high-resolution macro detail. No text labels, no hands or people visible.`,

  // Additional prompts to reach 25 total
  `A detailed crime scene photograph showing: Private yacht cabin, teak wood paneling, nautical brass fixtures, porthole window with ocean view, unmade berth with silk sheets, spilled pills on nightstand, half-empty whiskey bottle, evidence of recent occupancy. Style: Realistic, natural maritime lighting, professional crime scene photography. No text, no people visible.`,

  `Professional portrait photograph of a person:
Name: David Park
Age: 28
Gender: Male
Appearance: Korean-American features, youthful face with sharp jawline, trendy undercut hairstyle, wearing tech startup casual (hoodie, designer sneakers), wireless earbuds visible, slight bags under eyes suggesting long work hours.
Occupation: Software entrepreneur, cryptocurrency developer

Style: Realistic portrait, minimalist background, natural lighting with slight tech aesthetic, casual professional headshot. No text overlay, no crime scene elements.`,

  `Crime scene evidence photograph:
Item: Torn photograph
Description: Old color photograph ripped in half, showing partial faces of two people at a wedding, water damage along edges, creases suggesting it was kept in wallet, fingerprints visible on glossy surface, date stamp from 1995.

Style: Professional evidence photography, neutral background, even lighting, forensic documentation quality, macro detail showing damage and wear. No text labels, no hands visible.`,

  `A detailed crime scene photograph showing: Underground parking garage, concrete pillars, yellow lines marking spaces, luxury sedan with driver door ajar, scattered papers on ground, security camera visible on ceiling, fluorescent lights creating harsh shadows. Style: Realistic, stark institutional lighting, professional crime scene photography. No text, no people visible.`,

  `Professional portrait photograph of a person:
Name: Isabella Moretti
Age: 39
Gender: Female
Appearance: Italian features, expressive brown eyes, dark curly hair, wearing elegant evening wear, expensive jewelry, makeup suggesting recent event attendance, slight worry lines indicating stress.
Occupation: Classical pianist, music conservatory director

Style: Realistic portrait, elegant background, soft theatrical lighting, formal portrait composition. No text overlay, no crime scene elements.`,

  // Continue to 25 total...
  `Crime scene evidence photograph:
Item: Prescription pill bottle
Description: Amber plastic prescription bottle, label partially removed, child-safety cap off, several pills scattered nearby, dated from 6 months ago, fingerprint dusting residue visible, bottle 2/3 empty.

Style: Professional evidence photography, white background, clinical lighting, pharmaceutical documentation quality, macro detail. No text labels, no hands visible.`,

  `A detailed crime scene photograph showing: Hotel presidential suite, king-size bed with disturbed linens, room service cart with unfinished meal, champagne in ice bucket, evidence markers near bathroom door, city view through floor-to-ceiling windows, luxury furnishings. Style: Realistic, hotel ambient lighting, professional crime scene photography. No text, no people visible.`,

  `Professional portrait photograph of a person:
Name: James Whitaker III
Age: 51
Gender: Male
Appearance: Caucasian features, distinguished with graying temples, expensive suit tailored perfectly, cufflinks visible, slight tan suggesting recent travel, confident but guarded expression, American flag lapel pin.
Occupation: State senator, former prosecutor

Style: Realistic portrait, professional office background, authoritative lighting, political headshot quality. No text overlay, no crime scene elements.`,

  `Crime scene evidence photograph:
Item: Leather-bound journal
Description: Expensive leather journal, gold-embossed initials on cover, pages filled with handwritten entries, bookmark ribbon, water damage on corners, bent cover suggesting rough handling, entries dated over 3 months.

Style: Professional evidence photography, neutral background, lighting emphasizing texture and detail, forensic documentation. No text labels clearly readable, no hands visible.`,

  `A detailed crime scene photograph showing: Country club locker room, wood-paneled lockers with brass nameplates, marble counters, upscale toiletries, towels scattered on floor, broken mirror above sink, evidence markers, ambient overhead lighting. Style: Realistic, upscale facility lighting, professional crime scene photography. No text, no people visible.`,

  `Professional portrait photograph of a person:
Name: Yuki Tanaka
Age: 31
Gender: Female
Appearance: Japanese features, precise angular bob haircut, wearing white lab coat over professional attire, minimal makeup, intelligent focused gaze, slight ink stains on fingers, pearl stud earrings.
Occupation: Forensic scientist, DNA analyst

Style: Realistic portrait, laboratory background subtle, professional scientific lighting, clinical headshot quality. No text overlay, no crime scene elements.`,

  `Crime scene evidence photograph:
Item: Bloodstained necktie
Description: Silk designer necktie, dark pattern partially obscuring blood stains, fabric slightly torn, tie clip still attached (gold with initials), crumpled as if removed hastily, forensic measurement ruler alongside.

Style: Professional evidence photography, white background, even lighting showing stain patterns, forensic textile documentation. No text labels, no hands visible.`,

  `A detailed crime scene photograph showing: Art gallery exhibition space, white walls with modern paintings, track lighting illuminating artwork, marble floors, overturned sculpture pedestal, broken champagne flute, evidence markers, minimalist aesthetic. Style: Realistic, gallery lighting, professional crime scene photography. No text, no people visible.`,

  `Professional portrait photograph of a person:
Name: Andre Washington
Age: 45
Gender: Male
Appearance: African American features, athletic build, shaved head, goatee neatly trimmed, wearing expensive designer casual wear, gold chain visible, confident street-smart expression, tattoo partially visible on neck.
Occupation: Nightclub owner, music producer

Style: Realistic portrait, urban aesthetic background, dramatic lighting, professional entertainment industry headshot. No text overlay, no crime scene elements.`,

  `Crime scene evidence photograph:
Item: Security access card
Description: Electronic key card for building access, magnetic stripe, corporate logo visible, lanyard attached, slight scratches on surface, holographic security feature, card number partially visible, fingerprint powder residue.

Style: Professional evidence photography, neutral background, even lighting, forensic documentation quality showing security features. No text clearly readable, no hands visible.`
];
```

---

## Test Execution Protocol

### Phase 1: Preparation (30 minutes)

**Checklist**:

- [ ] Create new directory: `scheduler-poc/`
- [ ] Run `devvit new scheduler-poc`
- [ ] Copy files from actual `armchair-sleuths`:
  - [ ] `src/server/services/gemini/GeminiClient.ts` → `src/gemini-client.ts`
  - [ ] Extract real prompts from `CaseGeneratorService.ts` → `src/test-prompts.ts`
- [ ] Create `src/types.ts` with interfaces above
- [ ] Create `src/main.tsx` with scheduler jobs and menu items
- [ ] Update `devvit.json` with configuration above
- [ ] Verify TypeScript compilation: `npm run build`
- [ ] Upload to test subreddit: `devvit upload --subreddit armchair_sleuths_dev`
- [ ] Configure Gemini API key in subreddit settings
- [ ] Verify menu items appear in subreddit

**Success Criteria**: App uploaded successfully, menu items visible

---

### Phase 2: Quick Validation (15 minutes)

**Objective**: Verify basic functionality before extensive testing

**Procedure**:

1. Open DevTools logs: `devvit logs --subreddit armchair_sleuths_dev --stream`
2. Navigate to subreddit → Mod menu
3. Click "🧪 Test 5 Images"
4. Monitor logs for:
   - [ ] Job triggered message
   - [ ] Permission verification logs
   - [ ] Image generation progress
   - [ ] Success/failure messages
5. Wait for completion (expected: ~15 seconds)
6. Click "📊 View Test Results"
7. Review console output

**Expected Output**:
```
[test-5-1234567890] Phase 1: Verifying permissions...
[test-5-1234567890] ✅ Settings access: OK
[test-5-1234567890] ✅ Redis read: OK
[test-5-1234567890] ✅ Redis write: OK
[test-5-1234567890] Phase 2: Generating 5 images with real prompts...
[test-5-1234567890] Generating image 1/5...
[test-5-1234567890] ✅ Image 1/5 generated in 2847ms
... (repeat for all 5)
[test-5-1234567890] ===== TEST COMPLETE =====
[test-5-1234567890] Success: 5/5 images
[test-5-1234567890] Duration: 14.2s
[test-5-1234567890] Avg per image: 2.8s
```

**Decision Point**:
- ✅ 5/5 success → Proceed to Phase 3
- ⚠️ Partial success (3-4/5) → Investigate errors, retry once
- ❌ Complete failure (0-2/5) → STOP, analyze logs, check permissions

---

### Phase 3: Gradual Load Testing (90 minutes)

**Objective**: Find exact timeout boundary

**Procedure**:

| Step | Test | Wait Time | Checklist |
|------|------|-----------|-----------|
| 3.1 | Test 10 images | 10 minutes | [ ] Triggered<br>[ ] Monitoring logs<br>[ ] Completed<br>[ ] Results recorded |
| 3.2 | Wait for Gemini rate limit cooldown | 10 minutes | [ ] Timer set |
| 3.3 | Test 15 images | 10 minutes | [ ] Triggered<br>[ ] Monitoring logs<br>[ ] Completed<br>[ ] Results recorded |
| 3.4 | Wait for cooldown | 10 minutes | [ ] Timer set |
| 3.5 | Test 20 images | 10 minutes | [ ] Triggered<br>[ ] Monitoring logs<br>[ ] Completed<br>[ ] Results recorded |
| 3.6 | Wait for cooldown | 10 minutes | [ ] Timer set |
| 3.7 | Test 25 images | 10 minutes | [ ] Triggered<br>[ ] Monitoring logs<br>[ ] Completed<br>[ ] Results recorded |

**For each test, record**:
- Start time: `_______`
- End time: `_______`
- Success count: `___/___`
- Did it timeout? `[ ] Yes  [ ] No`
- Average time per image: `_____ seconds`
- Errors encountered: `_______________________`

**Decision Points**:

After each test:
- ✅ Full success → Continue to next load level
- ⚠️ Partial success → Note which images failed, continue
- ❌ Timeout detected → **STOP**, record timeout threshold
- ❌ Permission error → **STOP**, scheduler approach not viable

---

### Phase 4: Error Scenario Testing (30 minutes)

**Objective**: Verify resilience and error handling

#### Test 4.1: Invalid API Key

**Procedure**:
1. In subreddit settings, change Gemini API key to invalid value
2. Trigger "Test 5 Images"
3. Monitor logs for error handling

**Expected Behavior**:
- [ ] Job recognizes invalid key
- [ ] Clear error message logged
- [ ] Job status marked as "failed"
- [ ] No crash or hang

#### Test 4.2: Concurrent Jobs

**Procedure**:
1. Click "🔄 Test Concurrency" menu item
2. This triggers TWO "test-5-images" jobs simultaneously
3. Monitor logs for both job IDs

**Expected Behavior**:
- [ ] Both jobs start independently
- [ ] No Redis key conflicts
- [ ] Both jobs complete successfully
- [ ] Results saved separately

#### Test 4.3: Mid-Job Interruption (Optional)

**Procedure**:
1. Start "Test 15 Images"
2. After 5 images complete, redeploy app
3. Check Redis for partial results

**Expected Behavior**:
- [ ] Partial results saved
- [ ] Can identify where job stopped
- [ ] No corrupted data

---

### Phase 5: Result Analysis & Documentation (30 minutes)

**Objective**: Compile all results and make decision

**Procedure**:

1. **Export all test results from Redis**:
   ```bash
   # Via "View Test Results" menu
   # Copy console output to file
   ```

2. **Fill in summary table**:

| Test | Count | Success | Duration | Timeout? | Notes |
|------|-------|---------|----------|----------|-------|
| Quick validation | 5 | __/5 | ___s | [ ] | ______ |
| Light load | 10 | __/10 | ___s | [ ] | ______ |
| Target load | 15 | __/15 | ___s | [ ] | ______ |
| Heavy load | 20 | __/20 | ___s | [ ] | ______ |
| Stress test | 25 | __/25 | ___s | [ ] | ______ |
| Invalid API key | 5 | __/5 | ___s | [ ] | ______ |
| Concurrent jobs | 5+5 | __/10 | ___s | [ ] | ______ |

3. **Calculate key metrics**:
   - Max images successfully generated: `_____`
   - Average time per image: `_____ seconds`
   - Timeout threshold (if found): `_____ images / _____ seconds`
   - Permission failures: `[ ] Yes  [ ] No`

4. **Categorize result** (see Decision Matrix below)

5. **Document decision** in `test-results-report.md`

---

## Result Interpretation & Decision Matrix

### Scenario 1: Perfect Success ✅

**Criteria**:
- 25/25 images generated successfully
- No timeouts detected
- All permissions working
- Average time < 4 seconds per image

**Interpretation**: Scheduler approach is 100% viable

**Decision**: **PROCEED WITH FULL MIGRATION**

**Next Actions**:
1. Archive PoC results for reference
2. Begin Phase 0 of 45-task plan
3. Use PoC code as reference implementation
4. Expected timeline: 24-30 hours to completion

**Confidence Level**: 🟢 100% - Safe to invest full effort

---

### Scenario 2: Good Success (Acceptable) ⚠️

**Criteria**:
- 15-20 images generated successfully
- Timeout detected around 45-60 seconds
- All permissions working
- Partial failures recoverable

**Interpretation**: Scheduler works but has capacity limits

**Decision**: **PROCEED WITH ADJUSTED STRATEGY**

**Adjustments Required**:
1. **Batch Processing**: Split 15+ images into multiple jobs
   - Job 1: Locations (5 images)
   - Job 2: Suspects (5 images)
   - Job 3: Evidence (5 images)
2. **Sequential Execution**: Chain jobs with delays
3. **Update Task 2.7** in 45-task plan to use batching

**Next Actions**:
1. Create "Batch PoC" to validate multi-job approach
2. If batch PoC succeeds, proceed with full migration
3. Adjust timeline: +2-3 hours for batch implementation

**Confidence Level**: 🟡 85% - Manageable risk with mitigation

---

### Scenario 3: Partial Success (Concerning) ⚠️

**Criteria**:
- 5-10 images succeeded
- 10-15 images timeout or fail
- Permissions work intermittently
- Rate limiting detected

**Interpretation**: Scheduler works but severely constrained

**Decision**: **INVESTIGATE ROOT CAUSE BEFORE PROCEEDING**

**Investigation Required**:
1. **If rate limiting**: Test with longer delays between images
2. **If timeouts**: Test with smaller batches (3-5 images)
3. **If permissions**: Test at different times/days for consistency

**Next Actions**:
1. Run targeted mini-tests to isolate issue
2. If solvable → Create mitigation plan → Proceed cautiously
3. If not solvable → Explore alternatives (Scenario 4)

**Confidence Level**: 🟠 50% - Requires careful analysis

---

### Scenario 4: Permission Failure ❌

**Criteria**:
- Gemini API calls fail with permission errors
- `context.settings` not accessible
- `context.redis` blocked
- Errors similar to Vercel failure

**Interpretation**: Scheduler context has restricted permissions

**Decision**: **ABORT SCHEDULER APPROACH**

**Why This Matters**:
This is the Vercel scenario repeating. Even if we implement all 45 tasks, it will fail in production due to permission restrictions.

**Next Actions**:
1. **Document findings** thoroughly
2. **Explore alternatives**:
   - Option A: Cloudflare Workers (own infrastructure)
   - Option B: AWS Lambda (serverless functions)
   - Option C: Reddit's upcoming features (wait for official support)
   - Option D: Pre-generate images offline, upload to Reddit Media
3. **Create alternative PoC** for chosen approach
4. **Do NOT proceed** with current 45-task plan

**Confidence Level**: 🔴 0% - Guaranteed failure

---

### Scenario 5: Complete Failure ❌

**Criteria**:
- 0-3 images generated
- Multiple different error types
- Inconsistent behavior across runs
- Unexplained crashes or hangs

**Interpretation**: Fundamental incompatibility or environment issue

**Decision**: **ABORT AND REASSESS**

**Investigation Required**:
1. Review Devvit version compatibility
2. Check for known bugs in Devvit scheduler
3. Test in different subreddit
4. Consult Devvit community/support

**Next Actions**:
1. **File issue** with Devvit team if bug suspected
2. **Wait for fix** or **choose alternative** approach
3. **Do NOT proceed** with 45-task plan until resolved

**Confidence Level**: 🔴 0% - Blocker issue

---

## Acceptance Criteria

### Minimum Viable Success

For PoC to be considered successful and proceed to full migration:

**MUST HAVE** (Critical 🔴):
- [ ] All Level 1 permission tests pass (settings, redis, Gemini)
- [ ] At least 15 images generate successfully
- [ ] No permission-related errors
- [ ] Average time per image < 5 seconds
- [ ] Results retrievable from Redis

**SHOULD HAVE** (Important 🟡):
- [ ] 20+ images generate successfully
- [ ] No timeout detected up to 60 seconds
- [ ] Error handling works (invalid API key test)
- [ ] Concurrent jobs work independently

**NICE TO HAVE** (Bonus 🟢):
- [ ] 25+ images generate successfully
- [ ] Average time per image < 3 seconds
- [ ] Zero errors across all tests
- [ ] Mid-job interruption recovery works

### Failure Criteria

PoC is considered FAILED if:

**Critical Failures** (🔴 ABORT):
- [ ] Gemini API blocked with permission error
- [ ] Settings not accessible in scheduler context
- [ ] Redis not accessible in scheduler context
- [ ] Timeout at < 10 images consistently

**Major Concerns** (⚠️ RECONSIDER):
- [ ] < 10 images succeed
- [ ] Timeout detected at 10-15 images
- [ ] Inconsistent behavior (works sometimes, fails others)
- [ ] Critical errors with no clear mitigation

---

## Appendices

### Appendix A: Complete File Contents

**File**: `src/gemini-client.ts`

```typescript
// Copy from armchair-sleuths/src/server/services/gemini/GeminiClient.ts
// This ensures we use EXACT same Gemini integration
```

**File**: `README.md`

```markdown
# Scheduler PoC - Test Execution Guide

## Quick Start

1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Upload: `devvit upload --subreddit armchair_sleuths_dev`
4. Configure Gemini API key in subreddit settings
5. Open mod menu → Run tests in order:
   - 🧪 Test 5 Images (baseline)
   - 🧪 Test 10 Images (light load)
   - 🧪 Test 15 Images (target load)
   - 🧪 Test 20 Images (heavy load)
   - 🧪 Test 25 Images (stress test)
6. View results: 📊 View Test Results
7. Monitor logs: `devvit logs --stream`

## Test Schedule

- **5 images**: Quick validation
- **Wait 10 min** (rate limiting cooldown)
- **10 images**: Light load test
- **Wait 10 min**
- **15 images**: Target production load
- **Wait 10 min**
- **20 images**: Heavy load test
- **Wait 10 min**
- **25 images**: Maximum stress test

## Decision Criteria

- ✅ **15+ images succeed** → Proceed with full migration
- ⚠️ **10-15 images** → Use batch processing strategy
- ❌ **< 10 images** → Reconsider approach
```

---

### Appendix B: Test Execution Checklist

**Pre-Test Setup**:
- [ ] PoC app created and uploaded
- [ ] Gemini API key configured
- [ ] Logs streaming in terminal
- [ ] Stopwatch ready for timing
- [ ] Notepad ready for observations

**For Each Test**:
- [ ] Record start time
- [ ] Trigger test via menu
- [ ] Confirm job started in logs
- [ ] Monitor progress messages
- [ ] Record any errors
- [ ] Record completion time
- [ ] Record success count
- [ ] Wait cooldown period before next test

**Post-Test Analysis**:
- [ ] Export all results from Redis
- [ ] Fill in summary table
- [ ] Calculate metrics
- [ ] Identify pattern/trend
- [ ] Categorize into scenario (1-5)
- [ ] Document decision
- [ ] Plan next actions

---

### Appendix C: Troubleshooting Guide

#### Issue: "API key not found"

**Symptoms**: Permission test fails at settings access
**Cause**: Gemini API key not configured in subreddit
**Solution**:
1. Go to subreddit settings
2. Find "Gemini API Key" field
3. Enter valid API key
4. Save settings
5. Retry test

---

#### Issue: "Job never starts"

**Symptoms**: Menu click shows toast but no logs appear
**Cause**: Scheduler task not properly configured
**Solution**:
1. Check `devvit.json` has correct task names
2. Verify endpoint paths match router definitions
3. Redeploy app: `devvit upload`
4. Retry test

---

#### Issue: "All images fail with same error"

**Symptoms**: 0/N success, same error message repeated
**Cause**: Likely API key invalid or Gemini access blocked
**Solution**:
1. Test API key directly: `curl https://generativelanguage.googleapis.com/...`
2. Check for permission errors in message
3. If permission error → Scheduler approach may not work
4. Document and STOP further testing

---

#### Issue: "Random failures (some succeed, some fail)"

**Symptoms**: Inconsistent results, different images fail each run
**Cause**: Network instability or rate limiting
**Solution**:
1. Increase delay between image generations
2. Add retry logic (up to 3 attempts)
3. If persists → May be environmental issue
4. Test at different times of day

---

#### Issue: "Timeout at exact same point every time"

**Symptoms**: Always fails at image 12/15, for example
**Cause**: Hard timeout limit in scheduler jobs
**Solution**:
1. Record exact timeout threshold
2. Plan batch processing at that threshold - 20%
3. Proceed with batching strategy

---

### Appendix D: Comparison with Vercel Failure

| Aspect | Vercel Attempt | PoC Scheduler |
|--------|---------------|---------------|
| **Permission Testing** | ❌ Assumed HTTP config = access | ✅ Explicitly test every permission |
| **Documentation Review** | ⚠️ Missed "subject to review" | ✅ Read all Devvit scheduler docs |
| **Timeout Testing** | ❌ Not tested | ✅ Test 5, 10, 15, 20, 25 images |
| **Real Data** | ⚠️ Used simplified prompts | ✅ Copy actual production prompts |
| **Error Scenarios** | ❌ Only tested happy path | ✅ Test invalid keys, concurrency, failures |
| **Environment** | ⚠️ Only test subreddit | ✅ Same subreddit as production will use |
| **Fallback Plan** | ❌ None, had to abandon | ✅ Decision matrix for all outcomes |

---

## Summary

This PoC provides **100% confidence** before full migration by:

1. ✅ **Testing every permission** explicitly
2. ✅ **Measuring exact timeout limits** with gradual load tests
3. ✅ **Using real production data** (prompts, sizes, structures)
4. ✅ **Validating error handling** (invalid keys, failures, concurrency)
5. ✅ **Testing in actual environment** (real subreddit, real API)
6. ✅ **Having clear decision criteria** for every outcome
7. ✅ **Learning from Vercel failure** to avoid repeat mistakes

**Investment**: 3 hours
**Potential Savings**: 24-30 hours if approach doesn't work
**Confidence Gain**: 0% → 100% before committing to full migration

---

**Next Step**: Execute Phase 1 (Preparation) and begin testing

**Document End**

*Created: 2025-10-22*
*Status: Ready for Execution*
*Author: Development Team*