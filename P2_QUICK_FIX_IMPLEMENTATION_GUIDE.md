# P2 Quick Fix Implementation Guide

**Priority:** P0 - Critical Blockers
**Target:** Get submission and results screens working in Devvit

---

## Part 1: Add Submission State (5 minutes)

**File:** `src/main.tsx` (after line 204)

```typescript
// P2: Submission state
const [selectedSuspectId, setSelectedSuspectId] = context.useState<string | null>(null);
const [submissionAnswers, setSubmissionAnswers] = context.useState({
  what: '',
  where: '',
  when: '',
  why: '',
  how: ''
});
const [submitting, setSubmitting] = context.useState(false);
const [submissionResult, setSubmissionResult] = context.useState<any>(null);
const [leaderboardData, setLeaderboardData] = context.useState<any[]>([]);
const [statsData, setStatsData] = context.useState<any>(null);
```

---

## Part 2: Add Submit Handler (15 minutes)

**File:** `src/main.tsx` (after line 612, before tab rendering functions)

```typescript
/**
 * Handle Answer Submission
 * Makes API call to scoring engine
 */
const handleSubmitAnswer = async () => {
  if (!caseData || !userId) {
    context.ui.showToast({ text: '오류: 데이터를 찾을 수 없습니다', appearance: 'neutral' });
    return;
  }

  if (!selectedSuspectId) {
    context.ui.showToast({ text: '범인을 선택해주세요', appearance: 'neutral' });
    return;
  }

  // Validate all fields filled
  if (!submissionAnswers.what || !submissionAnswers.where ||
      !submissionAnswers.when || !submissionAnswers.why ||
      !submissionAnswers.how) {
    context.ui.showToast({ text: '모든 항목을 입력해주세요', appearance: 'neutral' });
    return;
  }

  setSubmitting(true);

  try {
    const suspectName = caseData.suspects.find(s => s.id === selectedSuspectId)?.name || '';

    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        caseId: caseData.id,
        answers: {  // Backend expects "answers" (plural)
          who: suspectName,
          what: submissionAnswers.what,
          where: submissionAnswers.where,
          when: submissionAnswers.when,
          why: submissionAnswers.why,
          how: submissionAnswers.how
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Submission failed: ${response.status}`);
    }

    const result = await response.json();

    // Store result
    setSubmissionResult(result);

    // Fetch leaderboard and stats
    await Promise.all([
      fetchLeaderboard(),
      fetchStats()
    ]);

    // Navigate to results
    setCurrentScreen('results');

    context.ui.showToast({
      text: result.isCorrect ? '🎉 정답입니다!' : '아쉽네요. 다시 도전하세요!',
      appearance: result.isCorrect ? 'success' : 'neutral',
    });
  } catch (error) {
    console.error('[Submit] Error:', error);
    context.ui.showToast({
      text: '답안 제출 중 오류가 발생했습니다',
      appearance: 'neutral',
    });
  } finally {
    setSubmitting(false);
  }
};

/**
 * Fetch Leaderboard
 */
const fetchLeaderboard = async () => {
  if (!caseData) return;

  try {
    const response = await fetch(`/api/leaderboard/${caseData.id}?limit=10`);

    if (!response.ok) {
      console.error('Leaderboard fetch failed:', response.status);
      return;
    }

    const data = await response.json();
    setLeaderboardData(data.leaderboard || []);
  } catch (error) {
    console.error('[Leaderboard] Error:', error);
  }
};

/**
 * Fetch Stats
 */
const fetchStats = async () => {
  if (!caseData) return;

  try {
    const response = await fetch(`/api/stats/${caseData.id}`);

    if (!response.ok) {
      console.error('Stats fetch failed:', response.status);
      return;
    }

    const data = await response.json();
    setStatsData(data);
  } catch (error) {
    console.error('[Stats] Error:', error);
  }
};
```

---

## Part 3: Add Submission Screen (30 minutes)

**File:** `src/main.tsx` (after line 2249, before fallback screen)

```typescript
// ========================================================================
// Render Submission Screen
// ========================================================================

if (currentScreen === 'submission' && caseData) {
  return (
    <vstack width="100%" height="100%" backgroundColor="#0a0a0a">
      {/* Header */}
      <vstack
        width="100%"
        backgroundColor="#1a1a1a"
        padding="medium"
        gap="small"
      >
        <text size="xlarge" weight="bold" color="#c9b037">
          📝 최종 답안 제출
        </text>
        <text size="small" color="#a0a0a0">
          모든 정보를 신중히 작성해주세요. 제출 후 수정할 수 없습니다.
        </text>
      </vstack>

      {/* Scrollable Content */}
      <vstack
        grow
        width="100%"
        padding="medium"
        gap="medium"
      >
        {/* WHO - Suspect Selection */}
        <vstack width="100%" gap="small">
          <text size="medium" weight="bold" color="#c9b037">
            ❓ WHO (누가) - 범인은 누구입니까?
          </text>
          <vstack width="100%" gap="small">
            {caseData.suspects.map(suspect => (
              <button
                key={suspect.id}
                onPress={() => setSelectedSuspectId(suspect.id)}
                appearance={selectedSuspectId === suspect.id ? 'primary' : 'secondary'}
                size="medium"
              >
                <hstack width="100%" alignment="middle" gap="small">
                  <text size="medium">
                    {selectedSuspectId === suspect.id ? '✓' : '○'}
                  </text>
                  <text size="medium" weight={selectedSuspectId === suspect.id ? 'bold' : 'regular'}>
                    {suspect.name}
                  </text>
                </hstack>
              </button>
            ))}
          </vstack>
        </vstack>

        {/* WHAT - Method */}
        <vstack width="100%" gap="small">
          <text size="medium" weight="bold" color="#c9b037">
            ❓ WHAT (무엇을) - 어떤 방법으로 살해했습니까?
          </text>
          <text size="small" color="#808080">
            ⚠️ 텍스트 입력은 현재 Devvit 제한으로 버튼 선택 방식으로 구현됩니다
          </text>
          {/* Temporary: Use predefined options until Devvit supports text input */}
          <vstack width="100%" gap="small">
            {['흉기로 찔러서', '독극물로', '둔기로 타격하여', '목 졸라서', '기타'].map(method => (
              <button
                key={method}
                onPress={() => setSubmissionAnswers({ ...submissionAnswers, what: method })}
                appearance={submissionAnswers.what === method ? 'primary' : 'secondary'}
                size="small"
              >
                {submissionAnswers.what === method ? '✓' : '○'} {method}
              </button>
            ))}
          </vstack>
        </vstack>

        {/* WHERE - Location */}
        <vstack width="100%" gap="small">
          <text size="medium" weight="bold" color="#c9b037">
            ❓ WHERE (어디서) - 어디에서 범행이 일어났습니까?
          </text>
          <vstack width="100%" gap="small">
            {caseData.locations?.map(location => (
              <button
                key={location.id}
                onPress={() => setSubmissionAnswers({ ...submissionAnswers, where: location.name })}
                appearance={submissionAnswers.where === location.name ? 'primary' : 'secondary'}
                size="small"
              >
                {submissionAnswers.where === location.name ? '✓' : '○'} {location.emoji} {location.name}
              </button>
            )) || <text size="small" color="#808080">장소 정보 없음</text>}
          </vstack>
        </vstack>

        {/* WHEN - Time */}
        <vstack width="100%" gap="small">
          <text size="medium" weight="bold" color="#c9b037">
            ❓ WHEN (언제) - 언제 범행이 일어났습니까?
          </text>
          <vstack width="100%" gap="small">
            {['오전 (06:00-12:00)', '오후 (12:00-18:00)', '저녁 (18:00-24:00)', '밤 (00:00-06:00)'].map(time => (
              <button
                key={time}
                onPress={() => setSubmissionAnswers({ ...submissionAnswers, when: time })}
                appearance={submissionAnswers.when === time ? 'primary' : 'secondary'}
                size="small"
              >
                {submissionAnswers.when === time ? '✓' : '○'} {time}
              </button>
            ))}
          </vstack>
        </vstack>

        {/* WHY - Motive */}
        <vstack width="100%" gap="small">
          <text size="medium" weight="bold" color="#c9b037">
            ❓ WHY (왜) - 범행 동기는 무엇입니까?
          </text>
          <vstack width="100%" gap="small">
            {['금전적 이익', '복수', '비밀 은폐', '질투', '기타'].map(motive => (
              <button
                key={motive}
                onPress={() => setSubmissionAnswers({ ...submissionAnswers, why: motive })}
                appearance={submissionAnswers.why === motive ? 'primary' : 'secondary'}
                size="small"
              >
                {submissionAnswers.why === motive ? '✓' : '○'} {motive}
              </button>
            ))}
          </vstack>
        </vstack>

        {/* HOW - Execution */}
        <vstack width="100%" gap="small">
          <text size="medium" weight="bold" color="#c9b037">
            ❓ HOW (어떻게) - 어떻게 범행을 실행했습니까?
          </text>
          <vstack width="100%" gap="small">
            {['계획적으로 준비', '우발적으로', '공모하여', '알리바이 조작', '기타'].map(how => (
              <button
                key={how}
                onPress={() => setSubmissionAnswers({ ...submissionAnswers, how })}
                appearance={submissionAnswers.how === how ? 'primary' : 'secondary'}
                size="small"
              >
                {submissionAnswers.how === how ? '✓' : '○'} {how}
              </button>
            ))}
          </vstack>
        </vstack>
      </vstack>

      {/* Fixed Bottom Actions */}
      <vstack
        width="100%"
        backgroundColor="#1a1a1a"
        padding="medium"
        gap="small"
      >
        <button
          appearance="success"
          size="large"
          onPress={handleSubmitAnswer}
          disabled={submitting}
        >
          {submitting ? '⏳ 채점 중...' : '🎯 답안 제출하기'}
        </button>

        <button
          appearance="secondary"
          size="small"
          onPress={() => setCurrentScreen('investigation')}
          disabled={submitting}
        >
          ← 수사로 돌아가기
        </button>
      </vstack>
    </vstack>
  );
}
```

---

## Part 4: Add Results Screen (30 minutes)

**File:** `src/main.tsx` (after submission screen, before fallback screen)

```typescript
// ========================================================================
// Render Results Screen
// ========================================================================

if (currentScreen === 'results' && submissionResult) {
  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#c9b037';  // Gold
    if (score >= 60) return '#4a9eff';  // Blue
    if (score >= 40) return '#ffc107';  // Amber
    return '#dc3545';                    // Red
  };

  return (
    <vstack width="100%" height="100%" backgroundColor="#0a0a0a">
      {/* Header */}
      <vstack
        width="100%"
        backgroundColor="#1a1a1a"
        padding="medium"
        gap="small"
      >
        <text size="xlarge" weight="bold" color="#c9b037">
          📊 채점 결과
        </text>
      </vstack>

      {/* Scrollable Content */}
      <vstack
        grow
        width="100%"
        padding="medium"
        gap="medium"
      >
        {/* Overall Score */}
        <vstack
          width="100%"
          backgroundColor={submissionResult.isCorrect ? '#1a4a1a' : '#2a1a1a'}
          padding="large"
          cornerRadius="medium"
          alignment="center middle"
          gap="medium"
        >
          <text size="xxlarge" color={submissionResult.isCorrect ? '#c9b037' : '#dc3545'}>
            {submissionResult.isCorrect ? '🎉' : '😢'}
          </text>
          <text size="xlarge" weight="bold" color="#e0e0e0">
            {submissionResult.isCorrect ? '정답입니다!' : '아쉽네요...'}
          </text>
          <text size="xxlarge" weight="bold" color={getScoreColor(submissionResult.totalScore)}>
            {submissionResult.totalScore}점
          </text>
          {submissionResult.rank && (
            <text size="medium" color="#a0a0a0">
              전체 순위: {submissionResult.rank}위
            </text>
          )}
        </vstack>

        {/* Detailed Breakdown */}
        <vstack width="100%" gap="small">
          <text size="large" weight="bold" color="#c9b037">
            📋 상세 채점
          </text>

          {/* WHO */}
          <vstack width="100%" backgroundColor="#1a1a1a" padding="medium" cornerRadius="small" gap="small">
            <hstack width="100%" alignment="middle">
              <text size="medium" weight="bold" color="#c9b037" grow>
                WHO (누가)
              </text>
              <text size="medium" weight="bold" color={getScoreColor(submissionResult.breakdown.who.score)}>
                {submissionResult.breakdown.who.score}점
              </text>
            </hstack>
            <text size="small" color="#a0a0a0">
              {submissionResult.breakdown.who.feedback}
            </text>
          </vstack>

          {/* WHAT */}
          <vstack width="100%" backgroundColor="#1a1a1a" padding="medium" cornerRadius="small" gap="small">
            <hstack width="100%" alignment="middle">
              <text size="medium" weight="bold" color="#c9b037" grow>
                WHAT (무엇을)
              </text>
              <text size="medium" weight="bold" color={getScoreColor(submissionResult.breakdown.what.score)}>
                {submissionResult.breakdown.what.score}점
              </text>
            </hstack>
            <text size="small" color="#a0a0a0">
              {submissionResult.breakdown.what.feedback}
            </text>
          </vstack>

          {/* WHERE */}
          <vstack width="100%" backgroundColor="#1a1a1a" padding="medium" cornerRadius="small" gap="small">
            <hstack width="100%" alignment="middle">
              <text size="medium" weight="bold" color="#c9b037" grow>
                WHERE (어디서)
              </text>
              <text size="medium" weight="bold" color={getScoreColor(submissionResult.breakdown.where.score)}>
                {submissionResult.breakdown.where.score}점
              </text>
            </hstack>
            <text size="small" color="#a0a0a0">
              {submissionResult.breakdown.where.feedback}
            </text>
          </vstack>

          {/* WHEN */}
          <vstack width="100%" backgroundColor="#1a1a1a" padding="medium" cornerRadius="small" gap="small">
            <hstack width="100%" alignment="middle">
              <text size="medium" weight="bold" color="#c9b037" grow>
                WHEN (언제)
              </text>
              <text size="medium" weight="bold" color={getScoreColor(submissionResult.breakdown.when.score)}>
                {submissionResult.breakdown.when.score}점
              </text>
            </hstack>
            <text size="small" color="#a0a0a0">
              {submissionResult.breakdown.when.feedback}
            </text>
          </vstack>

          {/* WHY */}
          <vstack width="100%" backgroundColor="#1a1a1a" padding="medium" cornerRadius="small" gap="small">
            <hstack width="100%" alignment="middle">
              <text size="medium" weight="bold" color="#c9b037" grow>
                WHY (왜)
              </text>
              <text size="medium" weight="bold" color={getScoreColor(submissionResult.breakdown.why.score)}>
                {submissionResult.breakdown.why.score}점
              </text>
            </hstack>
            <text size="small" color="#a0a0a0">
              {submissionResult.breakdown.why.feedback}
            </text>
          </vstack>

          {/* HOW */}
          <vstack width="100%" backgroundColor="#1a1a1a" padding="medium" cornerRadius="small" gap="small">
            <hstack width="100%" alignment="middle">
              <text size="medium" weight="bold" color="#c9b037" grow>
                HOW (어떻게)
              </text>
              <text size="medium" weight="bold" color={getScoreColor(submissionResult.breakdown.how.score)}>
                {submissionResult.breakdown.how.score}점
              </text>
            </hstack>
            <text size="small" color="#a0a0a0">
              {submissionResult.breakdown.how.feedback}
            </text>
          </vstack>
        </vstack>

        {/* Statistics */}
        {statsData && (
          <vstack width="100%" gap="small">
            <text size="large" weight="bold" color="#c9b037">
              📈 전체 통계
            </text>
            <hstack width="100%" gap="small">
              <vstack
                grow
                backgroundColor="#1a1a1a"
                padding="medium"
                cornerRadius="small"
                alignment="center middle"
              >
                <text size="small" color="#808080">총 제출</text>
                <text size="large" weight="bold" color="#e0e0e0">
                  {statsData.totalSubmissions}
                </text>
              </vstack>
              <vstack
                grow
                backgroundColor="#1a1a1a"
                padding="medium"
                cornerRadius="small"
                alignment="center middle"
              >
                <text size="small" color="#808080">정답자</text>
                <text size="large" weight="bold" color="#c9b037">
                  {statsData.correctSubmissions}
                </text>
              </vstack>
              <vstack
                grow
                backgroundColor="#1a1a1a"
                padding="medium"
                cornerRadius="small"
                alignment="center middle"
              >
                <text size="small" color="#808080">평균</text>
                <text size="large" weight="bold" color="#4a9eff">
                  {statsData.averageScore}
                </text>
              </vstack>
            </hstack>
          </vstack>
        )}

        {/* Leaderboard */}
        {leaderboardData.length > 0 && (
          <vstack width="100%" gap="small">
            <text size="large" weight="bold" color="#c9b037">
              🏆 리더보드
            </text>
            {leaderboardData.slice(0, 5).map((entry, idx) => (
              <hstack
                key={entry.userId}
                width="100%"
                backgroundColor={entry.userId === userId ? '#2a2a1a' : '#1a1a1a'}
                padding="medium"
                cornerRadius="small"
                alignment="middle"
                gap="small"
              >
                <text size="medium" weight="bold" color="#c9b037">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                </text>
                <text size="medium" color="#e0e0e0" grow>
                  {entry.userId}{entry.userId === userId && ' (나)'}
                </text>
                <text size="medium" weight="bold" color={getScoreColor(entry.score)}>
                  {entry.score}점
                </text>
              </hstack>
            ))}
          </vstack>
        )}
      </vstack>

      {/* Fixed Bottom Actions */}
      <vstack
        width="100%"
        backgroundColor="#1a1a1a"
        padding="medium"
        gap="small"
      >
        <button
          appearance="primary"
          size="large"
          onPress={() => setCurrentScreen('case-overview')}
        >
          🏠 케이스 개요로 돌아가기
        </button>
      </vstack>
    </vstack>
  );
}
```

---

## Part 5: Testing Checklist

**Manual Testing:**
1. [ ] Navigate from investigation to submission screen
2. [ ] Select a suspect
3. [ ] Fill all 5W1H fields
4. [ ] Submit answer
5. [ ] Verify loading state during submission
6. [ ] Verify results screen displays
7. [ ] Verify score and breakdown shown
8. [ ] Verify leaderboard displays
9. [ ] Verify stats displays
10. [ ] Navigate back to case overview

**Error Testing:**
1. [ ] Try submitting without selecting suspect → Should show error toast
2. [ ] Try submitting with missing fields → Should show error toast
3. [ ] Disconnect network and submit → Should show error toast
4. [ ] Submit wrong answer → Should show lower score

---

## Implementation Time Estimate

- Part 1: Add State → **5 minutes**
- Part 2: Add Handlers → **15 minutes**
- Part 3: Submission Screen → **30 minutes**
- Part 4: Results Screen → **30 minutes**
- Part 5: Testing → **20 minutes**

**Total: ~100 minutes (1.5 hours)**

---

## Known Limitations

1. **Text Input:** Devvit Blocks doesn't support freeform text input yet
   - **Workaround:** Use button-based selection for now
   - **Future:** Migrate to form builder when available

2. **Scrolling Performance:** Long content may have scroll issues
   - **Mitigation:** Keep content concise, use pagination if needed

3. **Type Safety:** Using `any` for some types temporarily
   - **Future:** Define proper TypeScript interfaces

---

## Next Steps After Implementation

1. Add duplicate submission prevention
2. Improve error messages with specific codes
3. Add retry logic for failed submissions
4. Add loading spinners with progress indicators
5. Add form validation with inline error messages
6. Add results caching to reduce API calls
7. Replace button-based input with form builder when available

---

**Ready to implement? Start with Part 1!**
