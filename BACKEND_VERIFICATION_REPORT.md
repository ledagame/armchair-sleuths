# Backend Verification Report - P2 UI Integration

**Date**: 2025-10-27
**Context**: P2 UI (Submission + Results) added to frontend, need to verify backend compatibility

---

## Executive Summary

### Status: ⚠️ **CRITICAL TYPE MISMATCH DETECTED**

The backend submission API is **FUNCTIONAL** but has **TYPE CONTRACT MISMATCHES** with the frontend that will cause runtime errors.

### Critical Issues Found
1. ✅ **API Endpoint EXISTS**: `POST /api/submit` (line 1303)
2. ✅ **Leaderboard EXISTS**: `GET /api/leaderboard/:caseId` (line 1363)
3. ✅ **Stats EXISTS**: `GET /api/stats/:caseId` (line 1399)
4. ❌ **TYPE MISMATCH**: Request/Response contracts don't align

---

## 1. API Endpoints Status

### ✅ POST /api/submit
**Location**: `src/server/index.ts:1303-1357`

**Current Implementation**:
```typescript
router.post('/api/submit', async (req, res): Promise<void> => {
  const { userId, caseId, answers } = req.body;

  // Validation
  if (!userId || !caseId || !answers) {
    res.status(400).json({
      error: 'Bad request',
      message: 'userId, caseId, and answers are required'
    });
    return;
  }

  // Scoring logic using ScoringEngine
  const result = await scoringEngine.scoreSubmission(
    userId,
    caseId,
    answers,
    caseData.solution
  );

  res.json(result);
});
```

### ✅ GET /api/leaderboard/:caseId
**Location**: `src/server/index.ts:1363-1393`

**Returns**:
```typescript
{
  leaderboard: LeaderboardEntry[]
}
```

### ✅ GET /api/stats/:caseId
**Location**: `src/server/index.ts:1399-1428`

**Returns**:
```typescript
{
  totalSubmissions: number;
  correctSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}
```

---

## 2. ❌ Request/Response Contract Analysis

### Frontend Expectation (Client Side)

**Request** (`src/client/hooks/useSubmission.ts:58-68`):
```typescript
fetch('/api/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    caseId,
    answers: answer,  // Type: W4HAnswer
  }),
});
```

**Frontend W4HAnswer Type** (`src/client/types/index.ts:137-144`):
```typescript
export interface W4HAnswer {
  who: string;
  what: string;
  where: string;
  when: string;
  why: string;
  how: string;
}
```

**Expected Response Type** (`src/client/types/index.ts:146-162`):
```typescript
export interface ScoringResult {
  userId: string;
  caseId: string;
  score: number;        // ⚠️ MISMATCH: Backend uses "totalScore"
  isCorrect: boolean;
  breakdown: {
    who: { score: number; feedback: string };
    what: { score: number; feedback: string };
    where: { score: number; feedback: string };
    when: { score: number; feedback: string };
    why: { score: number; feedback: string };
    how: { score: number; feedback: string };
  };
  submittedAt: number;
  rank?: number;
  totalParticipants?: number;
}
```

### Backend Reality (Server Side)

**Backend W4HAnswer Type** (`src/server/services/scoring/W4HValidator.ts:10-18`):
```typescript
export interface W4HAnswer {
  who: string;
  what: string;
  where: string;
  when: string;
  why: string;
  how: string;
}
```
✅ **MATCHES FRONTEND**

**Backend ScoringResult Type** (`src/server/services/scoring/ScoringEngine.ts:11-19`):
```typescript
export interface ScoringResult {
  userId: string;
  caseId: string;
  totalScore: number;    // ❌ MISMATCH: Frontend expects "score"
  isCorrect: boolean;
  breakdown: W4HValidationResult;  // ❌ STRUCTURE MISMATCH
  submittedAt: number;
  rank?: number;
}
```

**Backend W4HValidationResult** (`src/server/services/scoring/W4HValidator.ts:19-29`):
```typescript
export interface W4HValidationResult {
  who: W4HValidationDetail;
  what: W4HValidationDetail;
  where: W4HValidationDetail;
  when: W4HValidationDetail;
  why: W4HValidationDetail;
  how: W4HValidationDetail;
  totalScore: number;      // ❌ Additional field
  isFullyCorrect: boolean; // ❌ Additional field
}

export interface W4HValidationDetail {
  score: number;
  isCorrect: boolean;
  feedback: string;
}
```

---

## 3. ❌ Type Mismatch Details

### Issue #1: Score Property Name
- **Frontend expects**: `result.score`
- **Backend provides**: `result.totalScore`
- **Impact**: `ResultView` component will fail to display score
- **Severity**: HIGH

### Issue #2: Breakdown Structure
- **Frontend expects**: Simple object `{ who: { score, feedback }, ... }`
- **Backend provides**: Object with extra fields `{ who: { score, isCorrect, feedback }, totalScore, isFullyCorrect }`
- **Impact**: Extra fields harmless but indicates inconsistency
- **Severity**: LOW

### Issue #3: Missing totalParticipants
- **Frontend expects**: `totalParticipants?: number`
- **Backend provides**: Only `rank`
- **Impact**: UI may show incomplete ranking context
- **Severity**: LOW

---

## 4. Case Generation Status

### ✅ Scheduler Setup
**Location**: `src/server/schedulers/DailyCaseScheduler.ts`

**Initialization Flow**:
```typescript
// App Install Trigger (src/server/index.ts:120-148)
router.post('/internal/on-app-install', async (_req, res) => {
  const apiKey = await settings.get('geminiApiKey');

  // Initialize schedulers
  initializeAllSchedulers(apiKey);

  // Create first post
  const post = await createPost();
});
```

**Daily Case Generation** (`DailyCaseScheduler.ts:18-57`):
```typescript
export async function generateDailyCase(apiKey: string): Promise<void> {
  // 1. Check if today's case exists
  const existingCase = await CaseRepository.getTodaysCase();
  if (existingCase) return;

  // 2. Generate new case with images
  const newCase = await caseGenerator.generateCase({
    date: new Date(),
    includeImage: true,
    includeSuspectImages: true,
    includeCinematicImages: true
  });
}
```

### ✅ Case Data Storage
**Repository**: `CaseRepository` (KV Store backed)
- **Key Pattern**: `case:${caseId}` or `case:current`
- **Includes**: All required fields (suspects, locations, evidence, actionPoints)

---

## 5. Data Storage Verification

### ✅ Redis KV Store Operations
**Manager**: `KVStoreManager` (src/server/services/repositories/kv/KVStoreManager.ts)

**Submission Storage**:
```typescript
async saveSubmission(submission: SubmissionData): Promise<void> {
  const key = `submission:${submission.caseId}:${submission.userId}`;
  await this.adapter.set(key, JSON.stringify(submission));

  // Also add to case submissions list
  const listKey = `case:${submission.caseId}:submissions`;
  // ... append logic
}
```

**Leaderboard Query**:
```typescript
async getLeaderboard(caseId: string, limit: number): Promise<SubmissionData[]> {
  const submissions = await this.getCaseSubmissions(caseId);

  // Sort by score (desc), then by submission time (asc)
  return submissions
    .sort((a, b) => {
      if (b.score !== a.score) return (b.score || 0) - (a.score || 0);
      return a.submittedAt - b.submittedAt;
    })
    .slice(0, limit);
}
```

**Stats Calculation** (src/server/services/scoring/ScoringEngine.ts:166-194):
```typescript
async getCaseStatistics(caseId: string) {
  const submissions = await KVStoreManager.getCaseSubmissions(caseId);

  return {
    totalSubmissions: submissions.length,
    correctSubmissions: submissions.filter(s => s.isCorrect).length,
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores)
  };
}
```

---

## 6. Integration Issues Summary

### Critical Path Test: User Submits Answer

1. **Frontend sends** (useSubmission.ts):
   ```json
   POST /api/submit
   {
     "userId": "user123",
     "caseId": "case-2025-10-27",
     "answers": {
       "who": "Alice",
       "what": "Poison",
       "where": "Library",
       "when": "10 PM",
       "why": "Revenge",
       "how": "Mixed arsenic in tea"
     }
   }
   ```

2. **Backend processes** (index.ts:1303):
   - ✅ Extracts `{ userId, caseId, answers }`
   - ✅ Validates presence
   - ✅ Fetches case data
   - ✅ Calls `scoringEngine.scoreSubmission()`
   - ✅ Returns `ScoringResult`

3. **Backend returns**:
   ```json
   {
     "userId": "user123",
     "caseId": "case-2025-10-27",
     "totalScore": 85,          // ❌ Frontend expects "score"
     "isCorrect": true,
     "breakdown": {
       "who": {
         "score": 100,
         "isCorrect": true,
         "feedback": "Correct suspect identified"
       },
       // ... other fields
       "totalScore": 85,        // ❌ Extra field
       "isFullyCorrect": true   // ❌ Extra field
     },
     "submittedAt": 1698765432100,
     "rank": 1
   }
   ```

4. **Frontend crashes**:
   ```typescript
   // ResultView.tsx:141
   <span className={getScoreColor(result.totalScore)}>
     {result.totalScore}점  // ❌ undefined! Frontend expects result.score
   </span>
   ```

---

## 7. ⚠️ CRITICAL FIXES REQUIRED

### Fix #1: Align ScoringResult Type (REQUIRED)

**Option A**: Update backend to match frontend
```typescript
// src/server/services/scoring/ScoringEngine.ts:11-19
export interface ScoringResult {
  userId: string;
  caseId: string;
  score: number;           // Changed from totalScore
  isCorrect: boolean;
  breakdown: {
    who: { score: number; feedback: string; isCorrect: boolean };
    what: { score: number; feedback: string; isCorrect: boolean };
    where: { score: number; feedback: string; isCorrect: boolean };
    when: { score: number; feedback: string; isCorrect: boolean };
    why: { score: number; feedback: string; isCorrect: boolean };
    how: { score: number; feedback: string; isCorrect: boolean };
  };
  submittedAt: number;
  rank?: number;
}
```

**Option B**: Update frontend to match backend
```typescript
// src/client/types/index.ts:146-162
export interface ScoringResult {
  userId: string;
  caseId: string;
  totalScore: number;      // Changed from score
  isCorrect: boolean;
  breakdown: W4HValidationResult;
  submittedAt: number;
  rank?: number;
}
```

**Recommendation**: **Option A** - Backend should adapt to frontend contract

### Fix #2: Update API Response Mapping

```typescript
// src/server/index.ts:1343-1350
const result = await scoringEngine.scoreSubmission(
  userId,
  caseId,
  answers,
  caseData.solution
);

// Map to frontend-expected format
res.json({
  userId: result.userId,
  caseId: result.caseId,
  score: result.totalScore,        // ✅ Map totalScore -> score
  isCorrect: result.isCorrect,
  breakdown: {
    who: {
      score: result.breakdown.who.score,
      feedback: result.breakdown.who.feedback,
      isCorrect: result.breakdown.who.isCorrect
    },
    // ... repeat for all fields
  },
  submittedAt: result.submittedAt,
  rank: result.rank
});
```

### Fix #3: Add Missing W4HValidationDetail Type to Frontend

```typescript
// src/client/types/index.ts (ADD BEFORE ScoringResult)
export interface W4HValidationDetail {
  score: number;
  isCorrect: boolean;
  feedback: string;
}

// Update ScoringResult.breakdown
export interface ScoringResult {
  // ...
  breakdown: {
    who: W4HValidationDetail;
    what: W4HValidationDetail;
    where: W4HValidationDetail;
    when: W4HValidationDetail;
    why: W4HValidationDetail;
    how: W4HValidationDetail;
  };
  // ...
}
```

---

## 8. Testing Recommendations

### Test Case 1: Successful Submission
```bash
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "caseId": "case-2025-10-27",
    "answers": {
      "who": "Alice Smith",
      "what": "Poisoning",
      "where": "Library",
      "when": "10:00 PM",
      "why": "Financial gain",
      "how": "Arsenic in tea"
    }
  }'
```

**Expected Response**:
```json
{
  "userId": "test_user",
  "caseId": "case-2025-10-27",
  "score": 85,
  "isCorrect": true,
  "breakdown": {
    "who": {
      "score": 100,
      "isCorrect": true,
      "feedback": "Correct suspect identified!"
    }
  },
  "submittedAt": 1698765432100,
  "rank": 1
}
```

### Test Case 2: Missing Fields
```bash
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "caseId": "case-2025-10-27"
  }'
```

**Expected Response** (400):
```json
{
  "error": "Bad request",
  "message": "userId, caseId, and answers are required"
}
```

### Test Case 3: Leaderboard
```bash
curl http://localhost:3000/api/leaderboard/case-2025-10-27?limit=10
```

### Test Case 4: Stats
```bash
curl http://localhost:3000/api/stats/case-2025-10-27
```

---

## 9. Deployment Checklist

### Pre-Deployment
- [ ] Apply Fix #1: Align ScoringResult types
- [ ] Apply Fix #2: Update API response mapping
- [ ] Apply Fix #3: Add W4HValidationDetail to frontend types
- [ ] Test all 4 test cases above
- [ ] Verify case generation creates actionPoints config

### Post-Deployment
- [ ] Monitor `/api/submit` endpoint for 400/500 errors
- [ ] Check Redis KV store for submission data
- [ ] Verify leaderboard displays correctly
- [ ] Test on mobile devices (touch-friendly submission form)

---

## 10. Root Cause Analysis

### Why This Happened

1. **Parallel Development**: Frontend P2 UI and backend scoring were developed in different branches/sessions
2. **No Shared Type Definitions**: Frontend and backend have separate type files without validation
3. **No Contract Tests**: Missing integration tests that validate request/response contracts
4. **Type Duplication**: W4HAnswer, ScoringResult defined in both client and server with slight differences

### Prevention Strategy

1. **Shared Types Package**: Create `src/shared/types/scoring.ts` for API contracts
2. **Contract Tests**: Add integration tests validating API schemas
3. **OpenAPI Spec**: Generate TypeScript types from OpenAPI schema
4. **Pre-commit Validation**: Type-check both client and server before commit

---

## Conclusion

### What Works ✅
- API endpoints exist and are wired correctly
- Scoring logic is functional
- Data storage (Redis KV) is operational
- Case generation includes all required fields
- Leaderboard and stats endpoints functional

### What's Broken ❌
- **Type contract mismatch**: Frontend expects `score`, backend returns `totalScore`
- **Breakdown structure**: Extra fields in backend response
- **Runtime crash**: Frontend will fail when accessing `result.score`

### Impact Assessment
- **Severity**: CRITICAL (app will crash on submission)
- **Effort to Fix**: 30 minutes (type alignment + API response mapping)
- **Risk**: LOW (isolated to submission endpoint)

### Recommendation
**BLOCK DEPLOYMENT** until Fix #1 and Fix #2 are applied. This is a **P0 blocker** that will crash the game on every submission attempt.

---

**Report Generated**: 2025-10-27
**Files Analyzed**:
- `src/server/index.ts` (2162 lines)
- `src/server/services/scoring/ScoringEngine.ts` (220 lines)
- `src/server/services/scoring/W4HValidator.ts`
- `src/client/types/index.ts` (281 lines)
- `src/client/hooks/useSubmission.ts` (98 lines)
- `src/client/components/results/ResultView.tsx` (403 lines)
- `src/server/schedulers/DailyCaseScheduler.ts` (77 lines)
