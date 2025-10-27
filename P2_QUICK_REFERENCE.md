# P2 Quick Reference: Critical Implementation Gaps

**Status**: 🔴 **BLOCKING DEPLOYMENT**
**Date**: 2025-10-27

---

## 🚨 Critical Finding

**Submission and Results screens are NOT implemented in main.tsx.**

### Current Navigation Flow
```
✅ loading → ✅ intro → ✅ case-overview → ✅ investigation → ❌ submission → ❌ results
                                                                   ↑              ↑
                                                             MISSING (300 lines)  MISSING (350 lines)
```

### What's Working
- ✅ P0: Loading + Case Overview (600+ lines)
- ✅ P1: Investigation Screen with 3 tabs (1,200+ lines)
  - ✅ Locations tab with evidence discovery
  - ✅ Suspects tab with AI interrogation
  - ✅ Evidence notebook with filtering

### What's Missing
- ❌ P2: Submission Screen (0 lines / ~300 needed)
- ❌ P2: Results Screen (0 lines / ~350 needed)

---

## 🎯 Implementation Checklist

### Must Implement (P0 Priority)

#### 1. Submission Screen State (Add after line 205)
```typescript
const [selectedSuspectForSubmit, setSelectedSuspectForSubmit] = context.useState<string | null>(null);
const [submissionAnswers, setSubmissionAnswers] = context.useState<Partial<W4HAnswer>>({});
const [isSubmitting, setIsSubmitting] = context.useState(false);
```

#### 2. Results Screen State (Add after line 205)
```typescript
const [scoringResult, setScoringResult] = context.useState<ScoringResult | null>(null);
const [leaderboard, setLeaderboard] = context.useState<LeaderboardEntry[]>([]);
const [showLeaderboard, setShowLeaderboard] = context.useState(true);
```

#### 3. Submission API Handler (Add after line 612)
```typescript
const handleSubmitSolution = async () => {
  if (!selectedSuspectForSubmit) {
    context.ui.showToast({ text: '범인을 선택해주세요', appearance: 'neutral' });
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await fetch(`/api/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        caseId: caseData.id,
        answers: {
          who: selectedSuspectForSubmit,
          what: submissionAnswers.what || '',
          where: submissionAnswers.where || '',
          when: submissionAnswers.when || '',
          why: submissionAnswers.why || '',
          how: submissionAnswers.how || ''
        }
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json() as ScoringResult;
    setScoringResult(result);
    setCurrentScreen('results');
    await loadLeaderboard(caseData.id);

  } catch (error) {
    console.error('[Submission] Error:', error);
    context.ui.showToast({ text: '제출 실패', appearance: 'neutral' });
  } finally {
    setIsSubmitting(false);
  }
};
```

#### 4. Submission Screen Render (Add before line 2256)
```typescript
if (currentScreen === 'submission' && caseData) {
  return (
    <vstack width="100%" height="100%" backgroundColor="#0a0a0a">
      {/* Header */}
      <vstack width="100%" backgroundColor="#1a1a1a" padding="medium">
        <text size="xlarge" weight="bold" color="#c9b037">
          🎯 해결안 제출
        </text>
      </vstack>

      {/* WHO: Suspect Selection */}
      <vstack width="100%" grow padding="medium" gap="medium">
        <vstack width="100%" backgroundColor="#1a1a1a" padding="medium" cornerRadius="medium" gap="small">
          <text size="medium" weight="bold" color="#c9b037">
            WHO (누가): 범인을 선택하세요
          </text>
          {caseData.suspects.map(suspect => (
            <button
              key={suspect.id}
              onPress={() => setSelectedSuspectForSubmit(suspect.id)}
              appearance={selectedSuspectForSubmit === suspect.id ? 'primary' : 'secondary'}
              size="large"
            >
              <hstack gap="small" alignment="middle">
                <text size="medium">{suspect.name}</text>
                {selectedSuspectForSubmit === suspect.id && (
                  <text size="medium" color="#c9b037">✓</text>
                )}
              </hstack>
            </button>
          ))}
        </vstack>

        {/* TODO: Add WHAT/WHERE/WHEN/WHY/HOW fields */}
      </vstack>

      {/* Submit Button */}
      <vstack width="100%" backgroundColor="#1a1a1a" padding="medium" gap="small">
        <button
          appearance="success"
          size="large"
          onPress={handleSubmitSolution}
          disabled={!selectedSuspectForSubmit || isSubmitting}
        >
          {isSubmitting ? '제출 중...' : '✅ 정답 제출하기'}
        </button>
        <button
          appearance="secondary"
          size="small"
          onPress={() => setCurrentScreen('investigation')}
        >
          ← 수사로 돌아가기
        </button>
      </vstack>
    </vstack>
  );
}
```

#### 5. Results Screen Render (Add before line 2256)
```typescript
if (currentScreen === 'results' && scoringResult) {
  return (
    <vstack width="100%" height="100%" backgroundColor="#0a0a0a">
      {/* Score Header */}
      <vstack width="100%" backgroundColor="#1a1a1a" padding="large" gap="medium" alignment="center middle">
        <text size="xxlarge">{scoringResult.isCorrect ? '🎉' : '❌'}</text>
        <text size="xxlarge" weight="bold" color={scoringResult.isCorrect ? '#28a745' : '#dc3545'}>
          {scoringResult.isCorrect ? '사건 해결!' : '아쉽네요...'}
        </text>
        <hstack gap="small" alignment="center middle">
          <text size="xxxlarge" weight="bold" color="#c9b037">
            {scoringResult.totalScore}
          </text>
          <text size="large" color="#808080">/ 100</text>
        </hstack>
        <text size="small" color="#a0a0a0">
          리더보드 순위: #{scoringResult.rank || '?'}
        </text>
      </vstack>

      {/* Tab Navigation */}
      <hstack width="100%" backgroundColor="#1a1a1a" padding="small" gap="small">
        <button
          onPress={() => setShowLeaderboard(false)}
          appearance={!showLeaderboard ? 'primary' : 'secondary'}
          grow
        >
          상세 채점
        </button>
        <button
          onPress={() => setShowLeaderboard(true)}
          appearance={showLeaderboard ? 'primary' : 'secondary'}
          grow
        >
          리더보드
        </button>
      </hstack>

      {/* Content Area */}
      <vstack width="100%" grow padding="medium" gap="medium">
        {!showLeaderboard ? (
          // Scoring Breakdown
          <>
            {['who', 'what', 'where', 'when', 'why', 'how'].map(key => {
              const field = scoringResult.breakdown[key as keyof W4HValidationResult];
              if (typeof field === 'object' && field !== null && 'score' in field) {
                return (
                  <vstack key={key} width="100%" backgroundColor="#1a1a1a" padding="medium" cornerRadius="medium" gap="small">
                    <hstack width="100%" alignment="middle" gap="small">
                      <text size="medium" weight="bold" color="#c9b037">
                        {key.toUpperCase()}
                      </text>
                      <text size="medium" color={field.isCorrect ? '#28a745' : '#dc3545'}>
                        {field.score}/100
                      </text>
                    </hstack>
                    <text size="small" color="#e0e0e0">
                      {field.feedback}
                    </text>
                  </vstack>
                );
              }
              return null;
            })}
          </>
        ) : (
          // Leaderboard
          <>
            {leaderboard.length === 0 ? (
              <vstack width="100%" padding="large" alignment="center middle">
                <text size="medium" color="#808080">
                  리더보드를 불러오는 중...
                </text>
              </vstack>
            ) : (
              leaderboard.map(entry => (
                <hstack
                  key={entry.userId}
                  width="100%"
                  backgroundColor={entry.userId === userId ? '#2a2a1a' : '#1a1a1a'}
                  padding="medium"
                  cornerRadius="medium"
                  gap="small"
                  alignment="middle"
                >
                  <text size="large" weight="bold" color="#c9b037">
                    #{entry.rank}
                  </text>
                  <vstack grow gap="none">
                    <text size="medium" color="#e0e0e0">
                      {entry.userId}
                    </text>
                  </vstack>
                  <text size="large" weight="bold" color={entry.isCorrect ? '#28a745' : '#808080'}>
                    {entry.score}
                  </text>
                </hstack>
              ))
            )}
          </>
        )}
      </vstack>

      {/* Action Button */}
      <vstack width="100%" backgroundColor="#1a1a1a" padding="medium">
        <button
          appearance="primary"
          size="large"
          onPress={() => setCurrentScreen('case-overview')}
        >
          다른 사건 조사하기
        </button>
      </vstack>
    </vstack>
  );
}
```

---

## 📊 Backend APIs (Ready to Use)

All backend endpoints are implemented and working:

```typescript
// POST /api/submit - Submit solution
// Request: { userId, caseId, answers: W4HAnswer }
// Response: ScoringResult

// GET /api/leaderboard/:caseId?limit=10
// Response: { leaderboard: LeaderboardEntry[] }

// GET /api/stats/:caseId
// Response: CaseStatistics
```

---

## 🔍 Type Definitions

Add these imports at the top of main.tsx:

```typescript
// Type definitions (add after line 78)
interface W4HAnswer {
  who: string;
  what: string;
  where: string;
  when: string;
  why: string;
  how: string;
}

interface ScoringResult {
  userId: string;
  caseId: string;
  totalScore: number;
  isCorrect: boolean;
  breakdown: W4HValidationResult;
  submittedAt: number;
  rank?: number;
}

interface W4HValidationResult {
  who: { score: number; isCorrect: boolean; feedback: string; };
  what: { score: number; isCorrect: boolean; feedback: string; };
  where: { score: number; isCorrect: boolean; feedback: string; };
  when: { score: number; isCorrect: boolean; feedback: string; };
  why: { score: number; isCorrect: boolean; feedback: string; };
  how: { score: number; isCorrect: boolean; feedback: string; };
  totalScore: number;
  isFullyCorrect: boolean;
}

interface LeaderboardEntry {
  userId: string;
  score: number;
  isCorrect: boolean;
  submittedAt: number;
  rank: number;
}
```

---

## ⚠️ Known Issues to Fix

1. **Line 336**: `handleGoToSubmission()` navigates to non-existent screen → Add submission screen render
2. **Line 2232**: Submit button leads to fallback screen → Add submission screen render
3. **No leaderboard loader**: Add `loadLeaderboard()` function after line 612
4. **No type imports**: Add W4HAnswer, ScoringResult, LeaderboardEntry imports

---

## 📈 Estimated Work

- **Submission Screen**: ~300 lines, 4-6 hours
- **Results Screen**: ~350 lines, 4-6 hours
- **API Handlers**: ~150 lines, 2-3 hours
- **Testing**: 2-4 hours
- **Total**: 12-19 hours (1.5-2.5 days)

---

## ✅ Pre-Deployment Checklist

- [ ] Submission screen renders correctly
- [ ] WHO selector works (suspect selection)
- [ ] Submit button disabled until form valid
- [ ] API call succeeds and shows loading state
- [ ] Results screen renders with score
- [ ] Leaderboard tab switches correctly
- [ ] Breakdown tab shows all 6 fields
- [ ] Back navigation works (investigation ← submission)
- [ ] Error handling shows toasts
- [ ] State resets on new case

---

**See Full Report**: `P2_ARCHITECTURE_REVIEW.md` (5,000+ words)

**Action Required**: Implement P2 before deployment. Current build is incomplete and will frustrate users.
