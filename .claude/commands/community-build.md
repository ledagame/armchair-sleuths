---
description: 커뮤니티 기능 구축 (Devvit + 바이럴 챌린지 + 프론트엔드)
---

다음 스킬들을 모두 활용하여 커뮤니티 기능을 구축하세요:

## 활성화할 스킬

### 1. Devvit Community Builder
@skills/devvit-community-builder/SKILL.md

### 2. Viral Detective Challenge
@skills/viral-detective-challenge/SKILL.md

### 3. Frontend Architect
@skills/frontend-architect/SKILL.md

## 작업 프로세스

1. **커뮤니티 인프라** (devvit-community-builder)
   - Viral loop 설계 (K > 1.0 목표)
   - 일일 포스트 자동화 시스템
   - Devvit 위젯 구현
   - Redis 기반 리더보드
   - User flair 시스템
   - 커뮤니티 참여 유도 메커니즘

2. **챌린지 & 이벤트** (viral-detective-challenge)
   - Speed challenges (60초, 5분 챌린지)
   - Themed events (할로윈, 크리스마스 등)
   - Tournament brackets 시스템
   - Limited-time exclusive cases
   - Viral sharing mechanics
   - 경쟁 시스템 설계

3. **UI 구현** (frontend-architect)
   - 리더보드 컴포넌트
   - 챌린지 카드 UI
   - 이벤트 배너 및 타이머
   - 소셜 공유 버튼
   - 실시간 업데이트 표시
   - 사용자 프로필 뱃지

## 구현 순서

### Phase 1: 기본 인프라
```bash
# 일일 포스트 자동화 설정
npx tsx scripts/setup-daily-posts.ts

# 리더보드 초기화
npx tsx scripts/init-leaderboard.ts --case-id [케이스-ID]
```

### Phase 2: 챌린지 시스템
```bash
# 스피드 챌린지 생성
npx tsx scripts/create-speed-challenge.ts --time-limit 60

# 테마 이벤트 론칭
npx tsx scripts/launch-themed-event.ts --theme halloween
```

### Phase 3: UI/UX
- 리더보드 위젯 구현
- 챌린지 타이머 컴포넌트
- 소셜 공유 기능
- 뱃지 및 보상 시스템

## Viral Loop 체크리스트

- [ ] 공유 인센티브 (보상, 뱃지)
- [ ] 소셜 증명 (리더보드, 통계)
- [ ] FOMO 요소 (한정 이벤트)
- [ ] 경쟁 메커니즘 (챌린지, 토너먼트)
- [ ] 진입 장벽 최소화
- [ ] 공유 마찰 감소

## Devvit 위젯 패턴

### 리더보드 위젯
```typescript
// Devvit 블록 사용
<blocks>
  <vstack>
    <text>Top Detectives</text>
    {leaderboard.map(user => (
      <hstack>
        <text>{user.rank}</text>
        <text>{user.name}</text>
        <text>{user.score}</text>
      </hstack>
    ))}
  </vstack>
</blocks>
```

### 일일 챌린지 포스트
```typescript
// 자동 포스트 생성
scheduler.cron({
  name: 'daily-challenge',
  cron: '0 0 * * *', // 매일 자정
  onRun: async () => {
    await createDailyChallenge();
  }
});
```

## 성과 지표

### 추적할 메트릭
- Daily Active Users (DAU)
- Post engagement rate
- Challenge completion rate
- Viral coefficient (K-factor)
- Retention rate (D1, D7, D30)
- Share rate
- Average session time

### 목표
- K-factor > 1.0 (바이럴 성장)
- D1 retention > 40%
- Challenge completion > 30%
- Share rate > 15%

## 기대 결과

- 활발한 커뮤니티 참여
- 자연스러운 바이럴 성장
- 지속적인 플레이어 유입
- 높은 유저 리텐션
- Reddit 커뮤니티 내 입소문
