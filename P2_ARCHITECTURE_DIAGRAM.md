# P2 Architecture Visual Diagram

## Navigation Flow Status

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ARMCHAIR SLEUTHS - NAVIGATION FLOW                  │
└─────────────────────────────────────────────────────────────────────────┘

┌────────────┐
│  Loading   │ ✅ IMPLEMENTED (lines 1461-1651)
│   Screen   │    - Multi-phase loading with checkmarks
└─────┬──────┘    - Detective tips carousel
      │           - Error handling with retry
      │           - WCAG compliant colors
      ↓
┌────────────┐
│   Intro    │ ⚠️  MENTIONED (line 14 type definition)
│   Screen   │    - 3-slide intro system exists in types
└─────┬──────┘    - Implementation status unclear
      │
      ↓
┌────────────┐
│    Case    │ ✅ IMPLEMENTED (lines 1672-2078)
│  Overview  │    - Sticky header with case metadata
└─────┬──────┘    - Victim, weapon, location cards
      │           - Numbered suspect badges
      │           - Mission objectives list
      ↓           - Fixed bottom CTA
┌────────────┐
│Investigation│ ✅ IMPLEMENTED (lines 2106-2248)
│   Screen   │    - Tab-based navigation (bottom)
└─────┬──────┘    - 3 tabs: Locations, Suspects, Evidence
      │           - AP system integrated
      │           - Mobile thumb-zone optimized
      ↓
      ┌───────────────────┐
      │ LOCATIONS TAB     │ ✅ IMPLEMENTED (lines 396-534)
      │ - Evidence search │    - 3-tier search system (quick/thorough/exhaustive)
      │ - AP deduction    │    - Location cards with images
      │ - Discovery modal │    - Evidence discovery modal with rarity badges
      └───────────────────┘    - AP cost validation

      ┌───────────────────┐
      │ SUSPECTS TAB      │ ✅ IMPLEMENTED (lines 726-1113)
      │ - Suspect list    │    - Suspect cards with profile images
      │ - Chat interface  │    - AI interrogation system
      │ - AP acquisition  │    - AP topic detection
      └───────────────────┘    - Chat history persistence

      ┌───────────────────┐
      │ EVIDENCE TAB      │ ✅ IMPLEMENTED (lines 1119-1447)
      │ - Evidence list   │    - Evidence cards with images
      │ - Rarity badges   │    - Rarity summary (Common/Rare/Legendary)
      │ - Detail modal    │    - Evidence detail modal
      └───────────────────┘    - Relevance indicators

      ↓
      │
      │ handleGoToSubmission() called (line 336, 2232)
      │
      ↓
┌────────────┐
│ Submission │ ❌ NOT IMPLEMENTED (~300 lines needed)
│   Screen   │    - WHO: Suspect selector (buttons)
└─────┬──────┘    - WHAT/WHERE/WHEN/WHY/HOW: Multiple choice
      │           - Validation logic
      │           - Submit button with loading
      │           - Back navigation
      ↓
      │
      │ handleSubmitSolution() → fetch('/api/submit')
      │
      ↓
┌────────────┐
│  Results   │ ❌ NOT IMPLEMENTED (~350 lines needed)
│   Screen   │    - Score header with emoji
└─────┬──────┘    - Rank display
      │           - Tab navigation (Breakdown / Leaderboard)
      │           - 5W1H breakdown view
      │           - Leaderboard list view
      ↓           - Action buttons (new case)
      │
      │ setCurrentScreen('case-overview') or generate new case
      │
      └──────────────────> BACK TO TOP
```

---

## State Management Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           STATE HIERARCHY                               │
└─────────────────────────────────────────────────────────────────────────┘

Global State (context.useState)
├─ Navigation
│  └─ currentScreen: GameScreen ✅ (line 180)
│      = 'loading' | 'intro' | 'case-overview' | 'investigation' | 'submission' | 'results'
│
├─ Case Data
│  ├─ caseData: CaseData | null ✅ (line 181)
│  ├─ caseLoading: boolean ✅ (line 182)
│  ├─ caseError: string | null ✅ (line 183)
│  └─ userId: string ✅ (line 184)
│
├─ Investigation State ✅ (lines 187-205)
│  ├─ activeTab: InvestigationTab ✅
│  ├─ currentAP: number ✅
│  ├─ showDiscoveryModal: boolean ✅
│  ├─ discoveredEvidence: EvidenceItem[] ✅
│  ├─ discoveryLoading: boolean ✅
│  ├─ discoveredEvidenceIds: Set<string> ✅
│  ├─ selectedSuspect: string | null ✅
│  ├─ chatMessage: string ✅
│  ├─ chatHistory: Array<{...}> ✅
│  ├─ chatLoading: boolean ✅
│  ├─ selectedEvidence: EvidenceItem | null ✅
│  └─ showEvidenceDetail: boolean ✅
│
├─ Submission State ❌ MISSING
│  ├─ selectedSuspectForSubmit: string | null ❌
│  ├─ submissionAnswers: Partial<W4HAnswer> ❌
│  ├─ isSubmitting: boolean ❌
│  └─ submissionError: string | null ❌
│
└─ Results State ❌ MISSING
   ├─ scoringResult: ScoringResult | null ❌
   ├─ leaderboard: LeaderboardEntry[] ❌
   ├─ caseStats: CaseStatistics | null ❌
   └─ showLeaderboard: boolean ❌
```

---

## API Integration Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API ENDPOINTS                           │
└─────────────────────────────────────────────────────────────────────────┘

Frontend (main.tsx)                 Backend (server/index.ts)
─────────────────────              ─────────────────────────

✅ fetch('/api/suspect-image/:id')  → Line 232  → Express GET handler
   └─ useAsync hook                               └─ ImageStorageService
   └─ Returns: { profileImageUrl }

✅ fetch('/api/location/search')    → Line 552  → POST handler (line 1441)
   └─ Request: { caseId, userId,                  └─ EvidenceDiscoveryService
                 locationId,                      └─ ActionPointsService
                 searchType }
   └─ Returns: { evidenceFound[],
                 actionPointsRemaining }

✅ fetch('/api/chat/:suspectId')    → Line 1048 → POST handler
   └─ Request: { userId, message,                 └─ SuspectAIService
                 caseId }                         └─ APAcquisitionService
   └─ Returns: { aiResponse,
                 apAcquisition,
                 playerState }

❌ fetch('/api/submit')             → MISSING  → POST handler (line 1303) ✅ READY
   └─ Request: { userId, caseId,                  └─ W4HValidator
                 answers: W4HAnswer }             └─ ScoringEngine
   └─ Returns: ScoringResult                      └─ KVStoreManager

❌ fetch('/api/leaderboard/:caseId') → MISSING → GET handler (line 1363) ✅ READY
   └─ Query: ?limit=10                            └─ ScoringEngine
   └─ Returns: { leaderboard[] }                  └─ KVStoreManager

❌ fetch('/api/stats/:caseId')      → MISSING  → GET handler (line 1399) ✅ READY
   └─ Returns: CaseStatistics                     └─ ScoringEngine
```

**Note**: Backend APIs are fully implemented and tested. Only frontend integration is missing.

---

## Component Hierarchy (Current vs Target)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CURRENT COMPONENT STRUCTURE                         │
└─────────────────────────────────────────────────────────────────────────┘

main.tsx (2,272 lines)
├─ State Management (lines 180-205) ✅
│  └─ 15 state variables
│
├─ useAsync: Suspect Images (lines 212-272) ✅
│  └─ Parallel image fetching with error resilience
│
├─ Initialization: User ID (lines 278-291) ✅
│  └─ Reddit username fetch
│
├─ Initialization: Load Case (lines 297-324) ✅
│  └─ Redis case data fetch
│
├─ Navigation Handlers (lines 330-386) ✅
│  ├─ handleStartInvestigation() ✅
│  ├─ handleGoToSubmission() ✅ (but screen not implemented)
│  └─ handleGenerateNewCase() ✅
│
├─ Tab Content Renderers (lines 396-1447) ✅
│  ├─ renderLocationsTab() ✅
│  │  └─ handleLocationSearch() ✅
│  │  └─ renderEvidenceDiscoveryModal() ✅
│  ├─ renderSuspectsTab() ✅
│  │  ├─ renderSuspectList() ✅
│  │  ├─ renderChatInterface() ✅
│  │  └─ handleSendMessage() ✅
│  └─ renderEvidenceTab() ✅
│     └─ renderEvidenceDetailModal() ✅
│
├─ Screen Renderers (lines 1461-2248)
│  ├─ Loading Screen ✅ (lines 1461-1651)
│  ├─ Case Overview Screen ✅ (lines 1672-2078)
│  ├─ Investigation Screen ✅ (lines 2106-2248)
│  ├─ Submission Screen ❌ MISSING
│  ├─ Results Screen ❌ MISSING
│  └─ Fallback Screen ✅ (lines 2256-2268)
│
└─ Export ✅ (line 2272)


┌─────────────────────────────────────────────────────────────────────────┐
│                      TARGET COMPONENT STRUCTURE                         │
└─────────────────────────────────────────────────────────────────────────┘

main.tsx (estimated 2,900 lines)
├─ State Management (lines 180-230) ⚠️ NEEDS EXPANSION
│  ├─ Existing: 15 variables ✅
│  └─ NEW: 8 P2 variables ❌
│     ├─ selectedSuspectForSubmit
│     ├─ submissionAnswers
│     ├─ isSubmitting
│     ├─ submissionError
│     ├─ scoringResult
│     ├─ leaderboard
│     ├─ caseStats
│     └─ showLeaderboard
│
├─ useAsync: Suspect Images (unchanged) ✅
│
├─ Initialization (unchanged) ✅
│
├─ Navigation Handlers (lines 330-420) ⚠️ NEEDS EXPANSION
│  ├─ Existing: 3 handlers ✅
│  └─ NEW: 3 P2 handlers ❌
│     ├─ handleSubmitSolution() → POST /api/submit
│     ├─ loadLeaderboard() → GET /api/leaderboard
│     └─ loadCaseStats() → GET /api/stats
│
├─ Tab Content Renderers (unchanged) ✅
│
├─ Screen Renderers (lines 1461-2600) ⚠️ NEEDS EXPANSION
│  ├─ Loading Screen ✅
│  ├─ Case Overview Screen ✅
│  ├─ Investigation Screen ✅
│  ├─ NEW: Submission Screen ❌ (~300 lines)
│  │  ├─ Header with Case Summary
│  │  ├─ WHO Selector (Suspect Buttons)
│  │  ├─ WHAT/WHERE/WHEN/WHY/HOW Multiple Choice
│  │  ├─ Validation Logic
│  │  └─ Submit Button with Loading
│  ├─ NEW: Results Screen ❌ (~350 lines)
│  │  ├─ Score Header with Rank
│  │  ├─ Tab Navigation (Breakdown / Leaderboard)
│  │  ├─ 5W1H Breakdown View
│  │  │  └─ Per-field scores and feedback
│  │  ├─ Leaderboard View
│  │  │  └─ Top 10 players with ranks
│  │  └─ Action Buttons (New Case / Share)
│  └─ Fallback Screen ✅
│
└─ Export ✅
```

---

## Data Flow: Submission → Results

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SUBMISSION TO RESULTS FLOW                         │
└─────────────────────────────────────────────────────────────────────────┘

USER ACTION                     STATE CHANGES                 BACKEND
──────────────────             ─────────────────             ───────────

1. Select suspect              selectedSuspectForSubmit      (none)
   in WHO section              = suspect.id

2. Select WHAT/WHERE/etc       submissionAnswers            (none)
   multiple choice             = { what: 'X', ... }

3. Click "정답 제출하기"         isSubmitting = true          POST /api/submit
                                                             ├─ Validate answers
                                                             ├─ Compare with solution
                                                             ├─ Calculate scores
                                                             └─ Save to KV store

4. Backend responds            scoringResult = {             Return ScoringResult
                                 totalScore: 85,             {
                                 isCorrect: true,              userId, caseId,
                                 breakdown: {...},             totalScore,
                                 rank: 3                       isCorrect,
                               }                               breakdown,
                                                              rank
                                                             }

5. Auto-navigate               currentScreen                (none)
                               = 'results'

6. Load leaderboard            (loading...)                 GET /api/leaderboard/:id

7. Backend responds            leaderboard = [              Return { leaderboard[] }
                                 { rank: 1, ... },
                                 { rank: 2, ... },
                                 ...
                               ]

8. Display results             showLeaderboard              (none)
   screen                      = true (default)

9. User switches tabs          showLeaderboard              (none)
                               = false

10. Display breakdown          (render breakdown            (none)
    view                       from scoringResult)

11. Click "다른 사건"            currentScreen                (none)
                               = 'case-overview'
                               + Reset submission state
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ERROR SCENARIOS                                 │
└─────────────────────────────────────────────────────────────────────────┘

ERROR TYPE                     DETECTION                    HANDLING
──────────────────            ──────────────               ──────────────

1. Incomplete Answers         Client-side validation       Show toast:
   (WHO not selected)         before fetch()               "범인을 선택해주세요"
                                                           DON'T call API

2. Network Timeout            fetch() throws after 30s     Show toast + retry
   (user offline)                                          "네트워크 오류"
                                                           Keep form data

3. HTTP 400/404/500           response.ok === false        Parse error.message
   (server error)                                          Show toast
                                                           Log to console

4. Duplicate Submission       Server returns 409           Show toast:
   (user clicked twice)                                    "이미 제출하셨습니다"
                                                           Navigate to results

5. Leaderboard Load Fail      Separate try/catch           Show empty state
   (non-critical)                                          "리더보드 로딩 실패"
                                                           Don't block results

6. Invalid Response           JSON.parse() fails           Show toast + log
   (malformed data)                                        "응답 파싱 오류"
                                                           Retry option


┌─────────────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING CODE PATTERN                        │
└─────────────────────────────────────────────────────────────────────────┘

const handleSubmitSolution = async () => {
  // 1. Client-side validation
  if (!selectedSuspectForSubmit) {
    context.ui.showToast({
      text: '범인을 선택해주세요',
      appearance: 'neutral'
    });
    return; // DON'T proceed to API
  }

  setIsSubmitting(true);
  setSubmissionError(null);

  try {
    // 2. API call with timeout
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ /* ... */ }),
      signal: AbortSignal.timeout(30000) // 30s timeout
    });

    // 3. HTTP error handling
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('이미 제출하셨습니다');
      }
      throw new Error(`HTTP ${response.status}`);
    }

    // 4. Parse response
    const result = await response.json();

    // 5. Success path
    setScoringResult(result);
    setCurrentScreen('results');

    // 6. Load leaderboard (non-critical)
    loadLeaderboard(caseData.id).catch(err => {
      console.warn('Leaderboard failed:', err);
      // Don't block results screen
    });

  } catch (error) {
    // 7. Error handling
    console.error('[Submission] Error:', error);
    const message = error instanceof Error
      ? error.message
      : '제출 중 오류가 발생했습니다';

    setSubmissionError(message);
    context.ui.showToast({
      text: message,
      appearance: 'neutral'
    });
  } finally {
    // 8. Always reset loading state
    setIsSubmitting(false);
  }
};
```

---

## File Size Impact

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CODE SIZE ANALYSIS                                 │
└─────────────────────────────────────────────────────────────────────────┘

CURRENT STATE (main.tsx)
├─ Total Lines: 2,272
├─ Loading Screen: 190 lines (8.4%)
├─ Case Overview: 406 lines (17.9%)
├─ Investigation: 1,142 lines (50.3%)
│  ├─ Locations Tab: 138 lines
│  ├─ Suspects Tab: 387 lines
│  └─ Evidence Tab: 328 lines
└─ Utilities: 534 lines (23.4%)

TARGET STATE (main.tsx)
├─ Total Lines: ~2,900 (+627 lines, +27.6%)
├─ Loading Screen: 190 lines (6.6%)
├─ Case Overview: 406 lines (14.0%)
├─ Investigation: 1,142 lines (39.4%)
├─ Submission Screen: 300 lines (10.3%) ← NEW
├─ Results Screen: 350 lines (12.1%) ← NEW
└─ Utilities: 512 lines (17.7%)

BUILD SIZE ESTIMATE
├─ Current bundle: ~450 KB (estimated)
├─ Target bundle: ~575 KB (+125 KB, +27.8%)
└─ Impact: Acceptable (Devvit limit: 5 MB)
```

---

**Summary**: P2 adds ~27% more code but completes the critical user flow. Backend is ready, frontend implementation is the blocker.
