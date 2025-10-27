# Submission Flow Architecture Diagram

## Current (Broken) Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Client)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ SubmissionForm.tsx                                     │   │
│  │                                                         │   │
│  │  User fills out:                                       │   │
│  │  ┌─────────────────────────────────────────────────┐  │   │
│  │  │ WHO:   Alice Smith                              │  │   │
│  │  │ WHAT:  Poisoning                                │  │   │
│  │  │ WHERE: Library                                  │  │   │
│  │  │ WHEN:  10:00 PM                                 │  │   │
│  │  │ WHY:   Financial gain                           │  │   │
│  │  │ HOW:   Arsenic in tea                           │  │   │
│  │  └─────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  [Submit Button] ──────────────────────────────────┐   │   │
│  └────────────────────────────────────────────────────│───┘   │
│                                                        │       │
│                                                        ▼       │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ useSubmission.ts                                       │   │
│  │                                                         │   │
│  │  const submitAnswer = async (answer: W4HAnswer) => {  │   │
│  │    await fetch('/api/submit', {                       │   │
│  │      method: 'POST',                                  │   │
│  │      body: JSON.stringify({                           │   │
│  │        userId: "user123",                             │   │
│  │        caseId: "case-2025-10-27",                     │   │
│  │        answers: answer  ✅ Correct format             │   │
│  │      })                                                │   │
│  │    });                                                 │   │
│  │  }                                                     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  │ HTTP POST /api/submit
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Server)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ index.ts:1303 - POST /api/submit                       │   │
│  │                                                         │   │
│  │  router.post('/api/submit', async (req, res) => {     │   │
│  │    const { userId, caseId, answers } = req.body;      │   │
│  │    ✅ Extract parameters correctly                     │   │
│  │                                                         │   │
│  │    const caseData = await CaseRepository              │   │
│  │      .getCaseById(caseId);                            │   │
│  │    ✅ Fetch case with solution                         │   │
│  │                                                         │   │
│  │    const result = await scoringEngine                 │   │
│  │      .scoreSubmission(                                │   │
│  │        userId, caseId, answers,                       │   │
│  │        caseData.solution                              │   │
│  │      );                                               │   │
│  │                                                         │   │
│  │    res.json(result);  ❌ Returns wrong format!        │   │
│  │  });                                                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ ScoringEngine.ts:42 - scoreSubmission()               │   │
│  │                                                         │   │
│  │  1. Validate with W4HValidator ✅                      │   │
│  │     - WHO: 100% match                                  │   │
│  │     - WHAT: 85% match                                  │   │
│  │     - WHERE: 90% match                                 │   │
│  │     - WHEN: 95% match                                  │   │
│  │     - WHY: 80% match                                   │   │
│  │     - HOW: 88% match                                   │   │
│  │                                                         │   │
│  │  2. Calculate total score ✅                           │   │
│  │     totalScore = 85                                    │   │
│  │                                                         │   │
│  │  3. Save to Redis ✅                                   │   │
│  │     KVStoreManager.saveSubmission(...)                │   │
│  │                                                         │   │
│  │  4. Calculate rank ✅                                  │   │
│  │     rank = 1                                           │   │
│  │                                                         │   │
│  │  5. Return result ❌ WRONG STRUCTURE!                  │   │
│  │     return {                                           │   │
│  │       userId: "user123",                               │   │
│  │       caseId: "case-2025-10-27",                       │   │
│  │       totalScore: 85,        ❌ Should be "score"     │   │
│  │       isCorrect: true,                                 │   │
│  │       breakdown: validation,  ❌ Wrong structure       │   │
│  │       submittedAt: 1698765432100,                      │   │
│  │       rank: 1                                          │   │
│  │     }                                                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  │ HTTP 200 OK
                                  │ Content-Type: application/json
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Client)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ useSubmission.ts - Receives response                   │   │
│  │                                                         │   │
│  │  const result: ScoringResult = await response.json(); │   │
│  │  ✅ Response received                                  │   │
│  │                                                         │   │
│  │  return result;                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ App.tsx - handleSubmitAnswer()                         │   │
│  │                                                         │   │
│  │  const result = await submitAnswer(answer);           │   │
│  │  setScoringResult(result);  ✅ State updated           │   │
│  │  setCurrentScreen('results');  ✅ Navigate to results  │   │
│  └────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ ResultView.tsx - Render results                        │   │
│  │                                                         │   │
│  │  ❌ CRASH HERE!                                         │   │
│  │                                                         │   │
│  │  <span className={getScoreColor(result.totalScore)}>  │   │
│  │    {result.totalScore}점                               │   │
│  │  </span>                                               │   │
│  │                                                         │   │
│  │  ERROR: Cannot read property 'totalScore' of          │   │
│  │         undefined                                      │   │
│  │                                                         │   │
│  │  Why? result.score exists, but code expects           │   │
│  │  result.totalScore                                     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

❌ GAME CRASHES - User sees blank screen
```

---

## Fixed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Client)                          │
│                      [No changes needed]                        │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  │ HTTP POST /api/submit
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Server)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ ScoringEngine.ts:42 - scoreSubmission()               │   │
│  │                                                         │   │
│  │  [Validation logic unchanged] ✅                       │   │
│  │  [Score calculation unchanged] ✅                      │   │
│  │  [Redis storage unchanged] ✅                          │   │
│  │  [Rank calculation unchanged] ✅                       │   │
│  │                                                         │   │
│  │  ✅ FIXED RETURN STRUCTURE:                            │   │
│  │  return {                                              │   │
│  │    userId: "user123",                                  │   │
│  │    caseId: "case-2025-10-27",                          │   │
│  │    score: validation.totalScore,  ✅ Changed!         │   │
│  │    isCorrect: validation.isFullyCorrect,              │   │
│  │    breakdown: {                   ✅ Flattened!       │   │
│  │      who: {                                            │   │
│  │        score: validation.who.score,                    │   │
│  │        isCorrect: validation.who.isCorrect,            │   │
│  │        feedback: validation.who.feedback               │   │
│  │      },                                                │   │
│  │      // ... same for what, where, when, why, how      │   │
│  │    },                                                  │   │
│  │    submittedAt: 1698765432100,                         │   │
│  │    rank: 1                                             │   │
│  │  }                                                     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  │ HTTP 200 OK
                                  │ ✅ Correct JSON format
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Client)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [useSubmission receives response - unchanged]                 │
│  [App.tsx updates state - unchanged]                           │
│                              │                                  │
│                              ▼                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ ResultView.tsx - Render results                        │   │
│  │                                                         │   │
│  │  ✅ SUCCESS!                                            │   │
│  │                                                         │   │
│  │  <span className={getScoreColor(result.score)}>       │   │
│  │    {result.score}점  ✅ 85점 displayed!                 │   │
│  │  </span>                                               │   │
│  │                                                         │   │
│  │  Breakdown:                                            │   │
│  │  ✅ WHO: 100점 - Correct suspect identified!           │   │
│  │  ✅ WHAT: 85점 - Close match on method                 │   │
│  │  ✅ WHERE: 90점 - Correct location                     │   │
│  │  ✅ WHEN: 95점 - Accurate timeline                     │   │
│  │  ✅ WHY: 80점 - Good motive reasoning                  │   │
│  │  ✅ HOW: 88점 - Detailed execution                     │   │
│  │                                                         │   │
│  │  Rank: #1 / 10 players                                │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

✅ GAME WORKS - User sees beautiful results screen
```

---

## Type Contract Comparison

### Current (Broken)

```typescript
// Backend sends:
interface ScoringResult {
  totalScore: number;     ❌
  breakdown: {
    who: { score: number; isCorrect: boolean; feedback: string };
    totalScore: number;   ❌ Extra field
    isFullyCorrect: boolean;  ❌ Extra field
  };
}

// Frontend expects:
interface ScoringResult {
  score: number;          ❌ MISMATCH!
  breakdown: {
    who: { score: number; feedback: string };
  };
}
```

### Fixed

```typescript
// Backend sends:
interface ScoringResult {
  score: number;          ✅ MATCHES!
  breakdown: {
    who: { score: number; isCorrect: boolean; feedback: string };
  };
}

// Frontend expects:
interface ScoringResult {
  score: number;          ✅ MATCHES!
  breakdown: {
    who: { score: number; feedback: string; isCorrect: boolean };
    // isCorrect is extra but harmless (TypeScript allows extra properties)
  };
}
```

---

## Code Changes Required

### File 1: `src/server/services/scoring/ScoringEngine.ts`

#### Change 1 - Interface (Line 11)
```diff
export interface ScoringResult {
  userId: string;
  caseId: string;
- totalScore: number;
+ score: number;
  isCorrect: boolean;
  breakdown: W4HValidationResult;
  submittedAt: number;
  rank?: number;
}
```

#### Change 2 - scoreSubmission return (Line 74-82)
```diff
return {
  userId,
  caseId,
- totalScore: validation.totalScore,
+ score: validation.totalScore,
  isCorrect: validation.isFullyCorrect,
- breakdown: validation,
+ breakdown: {
+   who: {
+     score: validation.who.score,
+     isCorrect: validation.who.isCorrect,
+     feedback: validation.who.feedback
+   },
+   // ... repeat for what, where, when, why, how
+ },
  submittedAt: submission.submittedAt,
  rank
};
```

#### Change 3 - getUserScore return (Line 152-160)
```diff
return {
  userId: submission.userId,
  caseId: submission.caseId,
- totalScore: submission.score || 0,
+ score: submission.score || 0,
  isCorrect: submission.isCorrect || false,
  breakdown,
  submittedAt: submission.submittedAt,
  rank
};
```

---

## Testing Strategy

### Unit Test (Jest/Vitest)
```typescript
describe('ScoringEngine', () => {
  it('should return score property, not totalScore', async () => {
    const result = await engine.scoreSubmission(
      'user123',
      'case-123',
      mockAnswer,
      mockSolution
    );

    expect(result).toHaveProperty('score');
    expect(result).not.toHaveProperty('totalScore');
    expect(typeof result.score).toBe('number');
  });

  it('should flatten breakdown structure', async () => {
    const result = await engine.scoreSubmission(...);

    expect(result.breakdown.who).toHaveProperty('score');
    expect(result.breakdown.who).toHaveProperty('feedback');
    expect(result.breakdown.who).toHaveProperty('isCorrect');

    // Should NOT have nested totalScore/isFullyCorrect
    expect(result.breakdown).not.toHaveProperty('totalScore');
    expect(result.breakdown).not.toHaveProperty('isFullyCorrect');
  });
});
```

### Integration Test (API)
```bash
# Test with curl
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "caseId": "case-2025-10-27",
    "answers": {
      "who": "Alice",
      "what": "Poison",
      "where": "Library",
      "when": "10 PM",
      "why": "Revenge",
      "how": "Arsenic"
    }
  }' | jq '.score'

# Expected output: 85 (not null/undefined)
```

### E2E Test (Playwright/Cypress)
```typescript
test('submission flow completes without crash', async ({ page }) => {
  await page.goto('/');

  // Fill form
  await page.fill('#who-select', 'Alice Smith');
  await page.fill('#what-input', 'Poisoning');
  // ... fill all fields

  // Submit
  await page.click('button:has-text("답안 제출하기")');

  // Wait for results
  await page.waitForSelector('.result-view', { timeout: 10000 });

  // Verify score displayed (not crash)
  const scoreText = await page.textContent('.text-5xl'); // Score display
  expect(scoreText).toMatch(/\d+점/); // "85점" format

  // Verify no error in console
  const errors = await page.evaluate(() =>
    window.console.errors || []
  );
  expect(errors).toHaveLength(0);
});
```

---

## Files Impacted

| File | Change Type | Lines Changed | Risk |
|------|-------------|---------------|------|
| `src/server/services/scoring/ScoringEngine.ts` | Type + Logic | ~50 | LOW |
| `src/client/types/index.ts` | Type Addition | +5 | NONE |

**Total**: 2 files, ~55 lines, LOW risk

---

## Rollback Procedure

If deployment fails:

```bash
# 1. Revert changes
git checkout HEAD~1 src/server/services/scoring/ScoringEngine.ts

# 2. Rebuild
npm run build

# 3. Redeploy
devvit upload

# 4. Verify
curl http://localhost:3000/api/submit # Should work again
```

**Recovery Time**: 5 minutes

---

**Diagram Version**: 1.0
**Last Updated**: 2025-10-27
**Status**: Awaiting implementation
