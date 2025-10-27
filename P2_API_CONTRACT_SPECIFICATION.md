# P2 API Contract Specification

**Version:** 1.0
**Last Updated:** 2025-10-27
**Scope:** Backend APIs for Submission & Results System

---

## Overview

This document defines the exact API contracts between the Devvit frontend and Express backend for the P2 (Submission & Results) feature.

---

## 1. POST /api/submit

**Purpose:** Submit final answer for scoring

### Request

**Method:** `POST`
**URL:** `/api/submit`
**Content-Type:** `application/json`

**Body Schema:**
```typescript
{
  userId: string;      // Required. Reddit username or anonymous ID
  caseId: string;      // Required. Case UUID
  answers: {           // Required. 5W1H answers (note: plural "answers")
    who: string;       // Suspect name (must match exact suspect name)
    what: string;      // Method of murder
    where: string;     // Location of crime
    when: string;      // Time of crime
    why: string;       // Motive
    how: string;       // Execution method
  }
}
```

**Example:**
```json
{
  "userId": "detective_123",
  "caseId": "c4f8b2e1-a3d5-4c9e-8f1a-2b3c4d5e6f7g",
  "answers": {
    "who": "Dr. Eleanor Blackwood",
    "what": "Poisoned with arsenic",
    "where": "The library study",
    "when": "Between 10 PM and midnight on January 15th",
    "why": "To prevent exposure of her embezzlement scheme",
    "how": "Mixed poison into victim's evening tea"
  }
}
```

---

### Response

**Success (200 OK):**
```typescript
{
  userId: string;
  caseId: string;
  totalScore: number;      // ⚠️ Note: Backend uses "totalScore" not "score"
  isCorrect: boolean;      // True if all answers correct
  breakdown: {
    who: {
      score: number;       // 0-100
      isCorrect: boolean;
      feedback: string;
    };
    what: {
      score: number;
      isCorrect: boolean;
      feedback: string;
    };
    where: {
      score: number;
      isCorrect: boolean;
      feedback: string;
    };
    when: {
      score: number;
      isCorrect: boolean;
      feedback: string;
    };
    why: {
      score: number;
      isCorrect: boolean;
      feedback: string;
    };
    how: {
      score: number;
      isCorrect: boolean;
      feedback: string;
    };
    totalScore: number;    // Duplicate of top-level totalScore
    isFullyCorrect: boolean; // Duplicate of top-level isCorrect
  };
  submittedAt: number;     // Unix timestamp (milliseconds)
  rank?: number;           // Optional. Position on leaderboard (1-based)
}
```

**Example Success Response:**
```json
{
  "userId": "detective_123",
  "caseId": "c4f8b2e1-a3d5-4c9e-8f1a-2b3c4d5e6f7g",
  "totalScore": 85,
  "isCorrect": false,
  "breakdown": {
    "who": {
      "score": 100,
      "isCorrect": true,
      "feedback": "Correct! Dr. Eleanor Blackwood is the murderer."
    },
    "what": {
      "score": 80,
      "isCorrect": true,
      "feedback": "Mostly correct. Poison was used, though the specific type differs slightly."
    },
    "where": {
      "score": 100,
      "isCorrect": true,
      "feedback": "Correct location identified."
    },
    "when": {
      "score": 75,
      "isCorrect": false,
      "feedback": "Time range is close but not exact. Actual time was between 11 PM and 11:30 PM."
    },
    "why": {
      "score": 90,
      "isCorrect": true,
      "feedback": "Motive correctly identified."
    },
    "how": {
      "score": 85,
      "isCorrect": true,
      "feedback": "Execution method is accurate."
    },
    "totalScore": 85,
    "isFullyCorrect": false
  },
  "submittedAt": 1735286400000,
  "rank": 3
}
```

---

**Error Responses:**

**400 Bad Request - Missing Fields:**
```json
{
  "error": "Bad request",
  "message": "userId, caseId, and answers are required"
}
```

**404 Not Found - Invalid Case:**
```json
{
  "error": "Case not found",
  "message": "Case c4f8b2e1-a3d5-4c9e-8f1a-2b3c4d5e6f7g does not exist"
}
```

**500 Internal Server Error - Configuration:**
```json
{
  "error": "Configuration error",
  "message": "Gemini API key not configured. Please set it in app settings."
}
```

**500 Internal Server Error - General:**
```json
{
  "error": "Internal server error",
  "message": "Failed to score submission"
}
```

---

### Implementation Details

**Backend Processing:**
1. Validate request body (userId, caseId, answers)
2. Fetch case data from Redis (`CaseRepository.getCaseById`)
3. Retrieve Gemini API key from settings
4. Initialize Gemini client
5. Create W4HValidator instance
6. Create ScoringEngine instance
7. Score submission using AI validation (`scoringEngine.scoreSubmission`)
8. Save submission to Redis (`KVStoreManager.saveSubmission`)
9. Calculate user's rank among all submissions
10. Return scoring result

**Processing Time:** Typically 5-15 seconds (depends on Gemini API latency)

**Rate Limits:** None currently (consider adding per-user rate limits)

**Retry Strategy:** Frontend should implement exponential backoff for 5xx errors

---

## 2. GET /api/leaderboard/:caseId

**Purpose:** Fetch leaderboard for a specific case

### Request

**Method:** `GET`
**URL:** `/api/leaderboard/:caseId`

**Path Parameters:**
- `caseId` (string, required): Case UUID

**Query Parameters:**
- `limit` (number, optional): Maximum number of entries to return
  - Default: `10`
  - Max: `100`
  - Example: `?limit=50`

**Example:**
```
GET /api/leaderboard/c4f8b2e1-a3d5-4c9e-8f1a-2b3c4d5e6f7g?limit=10
```

---

### Response

**Success (200 OK):**
```typescript
{
  leaderboard: Array<{
    userId: string;
    score: number;          // 0-100
    isCorrect: boolean;
    submittedAt: number;    // Unix timestamp (milliseconds)
    rank: number;           // 1-based ranking
  }>
}
```

**Example Success Response:**
```json
{
  "leaderboard": [
    {
      "userId": "detective_master",
      "score": 100,
      "isCorrect": true,
      "submittedAt": 1735280000000,
      "rank": 1
    },
    {
      "userId": "sherlock_99",
      "score": 95,
      "isCorrect": true,
      "submittedAt": 1735281000000,
      "rank": 2
    },
    {
      "userId": "detective_123",
      "score": 85,
      "isCorrect": false,
      "submittedAt": 1735286400000,
      "rank": 3
    }
  ]
}
```

**Empty Leaderboard:**
```json
{
  "leaderboard": []
}
```

---

**Error Responses:**

**500 Internal Server Error - Configuration:**
```json
{
  "error": "Configuration error",
  "message": "Gemini API key not configured. Please set it in app settings."
}
```

**500 Internal Server Error - General:**
```json
{
  "error": "Internal server error",
  "message": "Failed to fetch leaderboard"
}
```

---

### Implementation Details

**Backend Processing:**
1. Retrieve Gemini API key from settings (⚠️ Note: Not actually used for leaderboard, but required by implementation)
2. Fetch all submissions for case from Redis (`KVStoreManager.getLeaderboard`)
3. Sort by score (descending), then by submittedAt (ascending) for tie-breaking
4. Limit results to requested count
5. Assign ranks (1-based)
6. Return leaderboard

**Sorting Rules:**
- Primary: Higher score wins
- Tie-breaker: Earlier submission wins

**Processing Time:** < 100ms (in-memory sorting)

**Caching:** Not implemented (consider adding Redis caching for frequently accessed leaderboards)

---

## 3. GET /api/stats/:caseId

**Purpose:** Fetch aggregate statistics for a specific case

### Request

**Method:** `GET`
**URL:** `/api/stats/:caseId`

**Path Parameters:**
- `caseId` (string, required): Case UUID

**Example:**
```
GET /api/stats/c4f8b2e1-a3d5-4c9e-8f1a-2b3c4d5e6f7g
```

---

### Response

**Success (200 OK):**
```typescript
{
  totalSubmissions: number;
  correctSubmissions: number;
  averageScore: number;      // Rounded to nearest integer
  highestScore: number;
  lowestScore: number;
}
```

**Example Success Response:**
```json
{
  "totalSubmissions": 147,
  "correctSubmissions": 23,
  "averageScore": 67,
  "highestScore": 100,
  "lowestScore": 15
}
```

**No Submissions:**
```json
{
  "totalSubmissions": 0,
  "correctSubmissions": 0,
  "averageScore": 0,
  "highestScore": 0,
  "lowestScore": 0
}
```

---

**Error Responses:**

**500 Internal Server Error - Configuration:**
```json
{
  "error": "Configuration error",
  "message": "Gemini API key not configured. Please set it in app settings."
}
```

**500 Internal Server Error - General:**
```json
{
  "error": "Internal server error",
  "message": "Failed to fetch statistics"
}
```

---

### Implementation Details

**Backend Processing:**
1. Retrieve Gemini API key from settings (⚠️ Note: Not actually used for stats, but required by implementation)
2. Fetch all submissions for case from Redis (`KVStoreManager.getCaseSubmissions`)
3. Calculate statistics:
   - `totalSubmissions`: Count of all submissions
   - `correctSubmissions`: Count of submissions where `isCorrect === true`
   - `averageScore`: Mean of all scores, rounded to nearest integer
   - `highestScore`: Maximum score
   - `lowestScore`: Minimum score
4. Return statistics

**Edge Cases:**
- No submissions: Returns zeros for all fields
- Single submission: Returns that submission's values

**Processing Time:** < 50ms (in-memory calculation)

**Caching:** Not implemented (consider adding Redis caching)

---

## Frontend Integration Guidelines

### Type Mapping

**Backend → Frontend:**
```typescript
// Backend returns
interface BackendScoringResult {
  totalScore: number;  // ⚠️ Different name
  // ... other fields
}

// Frontend expects
interface FrontendScoringResult {
  score: number;       // ⚠️ Different name
  // ... other fields
}

// Mapping function
function mapScoringResult(backend: BackendScoringResult): FrontendScoringResult {
  return {
    ...backend,
    score: backend.totalScore  // Map totalScore → score
  };
}
```

---

### Request Body Construction

**Correct (Backend Expects "answers" plural):**
```typescript
const requestBody = {
  userId: currentUserId,
  caseId: currentCaseId,
  answers: {  // ✅ Plural "answers"
    who: selectedSuspect.name,
    what: formData.what,
    where: formData.where,
    when: formData.when,
    why: formData.why,
    how: formData.how
  }
};
```

**Incorrect:**
```typescript
const requestBody = {
  userId: currentUserId,
  caseId: currentCaseId,
  answer: {  // ❌ Singular "answer" - WILL FAIL
    who: selectedSuspect.name,
    // ...
  }
};
```

---

### Error Handling

**Recommended Pattern:**
```typescript
try {
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json();

    switch (response.status) {
      case 400:
        showError('입력값을 확인해주세요');
        break;
      case 404:
        showError('사건을 찾을 수 없습니다');
        break;
      case 500:
        showError(errorData.message || '서버 오류');
        break;
      default:
        showError('알 수 없는 오류');
    }
    return;
  }

  const result = await response.json();
  // Success handling
} catch (error) {
  // Network error
  showError('네트워크 오류가 발생했습니다');
}
```

---

### Timeout Handling

**Recommended Pattern:**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s

try {
  const response = await fetch('/api/submit', {
    signal: controller.signal,
    // ... other options
  });
  clearTimeout(timeoutId);
  // Process response
} catch (error) {
  clearTimeout(timeoutId);
  if (error.name === 'AbortError') {
    showError('요청 시간이 초과되었습니다');
  } else {
    showError('네트워크 오류');
  }
}
```

---

### Retry Logic

**Recommended Pattern (for 5xx errors only):**
```typescript
async function submitWithRetry(requestBody: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        return await response.json();
      }

      if (response.status < 500) {
        // 4xx errors - don't retry
        throw new Error(`Client error: ${response.status}`);
      }

      // 5xx errors - retry
      if (attempt < maxRetries) {
        await new Promise(resolve =>
          setTimeout(resolve, 1000 * attempt) // Exponential backoff
        );
        continue;
      }

      throw new Error(`Server error after ${maxRetries} attempts`);
    } catch (error) {
      if (attempt === maxRetries) throw error;
    }
  }
}
```

---

## Testing Scenarios

### Submit API

**Test Case 1: Valid Submission (Correct Answer)**
```
Request:
POST /api/submit
{
  "userId": "test_user",
  "caseId": "valid_case_id",
  "answers": {
    "who": "Correct Suspect Name",
    "what": "Correct method",
    "where": "Correct location",
    "when": "Correct time",
    "why": "Correct motive",
    "how": "Correct execution"
  }
}

Expected Response:
200 OK
{
  "totalScore": 100,
  "isCorrect": true,
  "breakdown": { ... all correct ... }
}
```

**Test Case 2: Valid Submission (Wrong Answer)**
```
Request:
POST /api/submit
{
  "userId": "test_user",
  "caseId": "valid_case_id",
  "answers": {
    "who": "Wrong Suspect Name",
    "what": "Wrong method",
    // ...
  }
}

Expected Response:
200 OK
{
  "totalScore": < 100,
  "isCorrect": false,
  "breakdown": { ... feedback provided ... }
}
```

**Test Case 3: Missing userId**
```
Request:
POST /api/submit
{
  "caseId": "valid_case_id",
  "answers": { ... }
}

Expected Response:
400 Bad Request
{
  "error": "Bad request",
  "message": "userId, caseId, and answers are required"
}
```

**Test Case 4: Invalid caseId**
```
Request:
POST /api/submit
{
  "userId": "test_user",
  "caseId": "non_existent_case",
  "answers": { ... }
}

Expected Response:
404 Not Found
{
  "error": "Case not found",
  "message": "Case non_existent_case does not exist"
}
```

---

### Leaderboard API

**Test Case 1: Populated Leaderboard**
```
Request:
GET /api/leaderboard/valid_case_id?limit=5

Expected Response:
200 OK
{
  "leaderboard": [
    { "userId": "user1", "score": 100, "rank": 1, ... },
    { "userId": "user2", "score": 95, "rank": 2, ... },
    ...
  ]
}
```

**Test Case 2: Empty Leaderboard**
```
Request:
GET /api/leaderboard/new_case_id

Expected Response:
200 OK
{
  "leaderboard": []
}
```

**Test Case 3: Limit Parameter**
```
Request:
GET /api/leaderboard/valid_case_id?limit=3

Expected Response:
200 OK with max 3 entries
```

---

### Stats API

**Test Case 1: Case with Submissions**
```
Request:
GET /api/stats/valid_case_id

Expected Response:
200 OK
{
  "totalSubmissions": > 0,
  "correctSubmissions": >= 0,
  "averageScore": > 0,
  "highestScore": > 0,
  "lowestScore": >= 0
}
```

**Test Case 2: Case without Submissions**
```
Request:
GET /api/stats/new_case_id

Expected Response:
200 OK
{
  "totalSubmissions": 0,
  "correctSubmissions": 0,
  "averageScore": 0,
  "highestScore": 0,
  "lowestScore": 0
}
```

---

## Performance Benchmarks

| Endpoint | Expected Time | Max Time | Notes |
|----------|---------------|----------|-------|
| POST /api/submit | 5-10s | 30s | Depends on Gemini API latency |
| GET /api/leaderboard | < 100ms | 500ms | In-memory sorting |
| GET /api/stats | < 50ms | 200ms | In-memory calculation |

---

## Security Considerations

1. **Input Validation:** All user inputs validated on backend
2. **SQL Injection:** Not applicable (using Redis KV store)
3. **XSS:** Not applicable (JSON API, no HTML)
4. **Rate Limiting:** **Not implemented** (consider adding)
5. **Authentication:** Uses Reddit username (trusted via Devvit context)
6. **API Key Exposure:** Gemini API key stored securely in Devvit settings

---

## Future Improvements

1. **Add duplicate submission prevention**
   - Check if user already submitted for this case
   - Return 409 Conflict if duplicate detected

2. **Add rate limiting**
   - Limit submissions per user per case
   - Prevent spam submissions

3. **Add caching**
   - Cache leaderboard for 60 seconds
   - Cache stats for 60 seconds
   - Invalidate on new submission

4. **Add pagination**
   - Support offset parameter for leaderboard
   - Return total count in response

5. **Add submission history**
   - GET /api/submissions/:userId
   - Return all submissions for a user

6. **Add detailed feedback**
   - Include correct answer in response (after submission)
   - Provide hints for improvement

---

**Document Version:** 1.0
**Last Updated:** 2025-10-27
**Maintained By:** Backend Architect Team
