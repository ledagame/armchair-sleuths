---
name: viral-detective-challenge
description: Themed challenge and tournament creation including speed challenges, seasonal events, collaborative mysteries, and competitive brackets. Use when planning special events, creating seasonal content, designing tournament systems, or implementing limited-time exclusive cases. Drives viral sharing and player retention.
---

# Viral Detective Challenge Creator

## Overview

Designs challenge systems, themed events, and tournaments that keep players coming back. Combines time-limited content with competitive mechanics to create urgency and viral sharing.

## When to Use This Skill

**Use this skill PROACTIVELY when:**
- 챌린지 기획: "주간 챌린지 만들기" / "Create weekly challenge"
- 테마 이벤트: "할로윈 특별 케이스" / "Halloween special case"
- 토너먼트: "경쟁 이벤트" / "Competitive tournament"
- 시즌 컨텐츠: "크리스마스 미스터리" / "Christmas mystery"
- 재방문 유도: "매일 돌아오게 하기" / "Drive daily returns"
- 바이럴 확산: "공유 이벤트" / "Viral sharing event"

## Challenge Types

### 1. Speed Challenge

```typescript
// 시간 제한 챌린지

interface SpeedChallenge {
  name: "60초 탐정";
  timeLimit: 60; // seconds
  difficulty: 'easy'; // Must be quick to solve
  rewards: {
    success: "⚡ Speed Demon 배지",
    leaderboard: "Top 10 → 특별 flair"
  };
  viralMechanic: "해결 시간 자동 공유";
}

const SPEED_CHALLENGE_CONFIG = {
  caseSelection: {
    criteria: "명확한 단서 3개, Red herring 1개",
    clueCount: 4,
    obviousClueRatio: 0.75
  },

  timer: {
    display: "큰 카운트다운 타이머",
    warnings: [30, 10, 5], // seconds remaining
    timeout: "시간 초과 시 부분 점수"
  },

  scoring: {
    perfectTime: 100, // points for < 60s
    partialCredit: (time) => Math.max(0, 100 - (time - 60)), // After 60s
    speedBonus: (time) => time < 30 ? 50 : 0 // Extra for < 30s
  },

  shareTemplate: `
⚡ ${username}님이 케이스 #${caseId}를 ${time}초에 해결했습니다!

당신도 도전할 수 있나요?
[지금 도전하기]

#SpeedDetective #ArmchairSleuths
  `
};

// Implementation
async function runSpeedChallenge(caseId: string): Promise<ChallengeResult> {
  const startTime = Date.now();

  // Show timer UI
  const timer = startCountdown(60);

  // Player solves case
  const answer = await playerSubmission();

  const endTime = Date.now();
  const timeElapsed = (endTime - startTime) / 1000;

  const score = SPEED_CHALLENGE_CONFIG.scoring.perfectTime +
                SPEED_CHALLENGE_CONFIG.scoring.speedBonus(timeElapsed);

  if (timeElapsed <= 60) {
    await awardBadge('speed-demon');
  }

  return { score, time: timeElapsed };
}
```

### 2. Themed Mystery Events

```typescript
// 테마별 특별 케이스

const THEMED_EVENTS = {
  halloween: {
    theme: "공포 미스터리",
    duration: "10월 한 달",
    features: {
      aesthetic: "다크 고딕, 안개, 으스스한 음악",
      locations: ["유령 저택", "묘지", "폐가"],
      weapons: ["독살 (마녀의 독약)", "칼 (고대 단검)"],
      specialReward: "🎃 할로윈 탐정 배지"
    },
    caseCount: 7,
    releaseSchedule: "Every Thursday in October"
  },

  christmas: {
    theme: "눈 내린 저택의 살인",
    duration: "12월 1일 - 25일",
    features: {
      aesthetic: "크리스마스 조명, 눈, 클래식 음악",
      locations: ["크리스마스 파티", "산장", "스키 리조트"],
      twists: ["산타 복장 범인", "선물 상자 속 단서"],
      specialReward: "🎄 홀리데이 탐정 배지"
    },
    caseCount: 25, // Advent calendar style
    releaseSchedule: "Daily at 9 AM"
  },

  valentine: {
    theme: "열정 범죄",
    duration: "2월 14일 전후 1주",
    features: {
      aesthetic: "로맨틱 누아르, 재즈",
      motives: ["질투", "배신", "삼각관계"],
      archetypes: ["배신당한 연인", "질투하는 친구"],
      specialReward: "💔 냉정한 탐정 배지"
    },
    caseCount: 7
  },

  summer: {
    theme: "휴가지 미스터리",
    duration: "7-8월",
    features: {
      locations: ["해변 리조트", "유람선", "열대 섬"],
      atmosphere: "밝고 화려하지만 어두운 비밀",
      specialReward: "🏖️ 여름 탐정 배지"
    },
    caseCount: 10
  }
};

// Generate themed case
async function generateThemedCase(
  event: keyof typeof THEMED_EVENTS
): Promise<CaseData> {
  const theme = THEMED_EVENTS[event];

  const caseData = await generateCase('medium', {
    locationPool: theme.features.locations,
    weaponPool: theme.features.weapons,
    archetypeHints: theme.features.archetypes,
    atmosphere: theme.features.aesthetic
  });

  // Add special theme metadata
  caseData.metadata = {
    theme: event,
    specialReward: theme.features.specialReward,
    expiresAt: getEventEndDate(event)
  };

  return caseData;
}
```

### 3. Collaborative Investigation

```typescript
// 커뮤니티 협력 수사

interface CollaborativeCh투표allenge {
  type: "Community Vote";
  mechanism: "24시간 토론 후 용의자 투표";
  phases: Phase[];
}

const COLLABORATIVE_PHASES = {
  phase1_discovery: {
    name: "단서 공개",
    duration: "6시간",
    mechanism: "용의자별 단서가 순차적으로 공개됨",
    interaction: "커뮤니티가 댓글로 이론 공유"
  },

  phase2_discussion: {
    name: "토론",
    duration: "12시간",
    mechanism: "Reddit 스레드에서 자유 토론",
    moderation: "스포일러 태그 필수"
  },

  phase3_voting: {
    name: "투표",
    duration: "6시간",
    mechanism: "용의자 3명 중 1명 선택",
    display: "실시간 투표 결과 그래프"
  },

  phase4_revelation: {
    name: "진실 공개",
    duration: "즉시",
    mechanism: "다수결 정답 여부 공개",
    rewards: {
      correct: "정답 투표자 전원 배지",
      participation: "참여자 전원 XP"
    }
  }
};

// Implementation
async function runCollaborativeChallenge(caseId: string): Promise<void> {
  // Phase 1: Release clues gradually
  for (let i = 0; i < 6; i++) {
    await delay(1 * HOUR);
    await releaseClue(caseId, i);
    await postToReddit(`🔍 새로운 단서 발견! #${i + 1}`);
  }

  // Phase 2: Open discussion
  await createDiscussionThread(caseId);
  await delay(12 * HOUR);

  // Phase 3: Voting
  const poll = await createPoll({
    question: "범인은 누구일까요?",
    options: suspects.map(s => s.name),
    duration: 6 * HOUR
  });

  // Phase 4: Results
  const results = await poll.getResults();
  const winner = getMostVoted(results);
  const isCorrect = winner === guiltySuspect;

  await postResults({
    winner,
    isCorrect,
    voteCounts: results,
    rewards: calculateRewards(results)
  });
}
```

### 4. Tournament Brackets

```typescript
// 토너먼트 시스템

interface Tournament {
  format: "Single Elimination" | "Double Elimination" | "Round Robin";
  participants: number;
  rounds: Round[];
  prizes: Prize[];
}

const TOURNAMENT_FORMATS = {
  weeklyKnockout: {
    name: "주간 노크아웃",
    format: "Single Elimination",
    participants: 64,
    entry: "자동 (상위 64명)",
    rounds: [
      { name: "Round of 64", cases: 32, duration: "1 day" },
      { name: "Round of 32", cases: 16, duration: "1 day" },
      { name: "Round of 16", cases: 8, duration: "1 day" },
      { name: "Quarter Finals", cases: 4, duration: "1 day" },
      { name: "Semi Finals", cases: 2, duration: "1 day" },
      { name: "Finals", cases: 1, duration: "1 day" }
    ],
    prizes: [
      { rank: 1, reward: "🏆 챔피언 배지 + Reddit Platinum" },
      { rank: 2, reward: "🥈 준우승 배지 + Reddit Gold" },
      { rank: 3, reward: "🥉 3위 배지" }
    ]
  },

  monthlyLeague: {
    name: "월간 리그",
    format: "Round Robin",
    participants: "무제한",
    tiers: ["Bronze", "Silver", "Gold", "Platinum"],
    promotion: "상위 20% 승격",
    relegation: "하위 20% 강등",
    duration: "1 month"
  }
};

// Tournament matching
async function createTournamentMatch(
  round: number,
  player1: string,
  player2: string
): Promise<Match> {
  // Generate same case for both players
  const caseData = await generateCase('medium');

  // Both solve simultaneously
  const [result1, result2] = await Promise.all([
    playCase(player1, caseData),
    playCase(player2, caseData)
  ]);

  // Winner: higher score, or faster if tied
  const winner = result1.score > result2.score ? player1 :
                 result1.score < result2.score ? player2 :
                 result1.time < result2.time ? player1 : player2;

  return { winner, scores: { [player1]: result1, [player2]: result2 } };
}
```

### 5. Limited-Time Exclusive Cases

```typescript
// 기간 한정 특별 케이스

interface ExclusiveCase {
  availability: "24 hours only";
  rarity: "legendary";
  features: string[];
  rewards: string[];
}

const EXCLUSIVE_TYPES = {
  celebrity: {
    name: "유명인 미스터리",
    description: "유명 인사가 등장하는 허구 케이스",
    examples: [
      "유명 배우의 영화 세트장 살인",
      "K-pop 스타의 콘서트 홀 사건",
      "유명 작가의 출판 파티 미스터리"
    ],
    availability: "월 1회",
    specialFeature: "실제 스타 프로필 사진 (동의 하에)"
  },

  historical: {
    name: "역사적 미스터리 재현",
    description: "실제 역사적 사건을 게임화",
    examples: [
      "19세기 런던 연쇄 살인",
      "1920년대 뉴욕 갱단 사건",
      "조선 시대 궁중 암살"
    ],
    availability: "분기별",
    specialFeature: "역사적 고증 + 교육적 가치"
  },

  crossover: {
    name: "크로스오버 이벤트",
    description: "다른 게임/미디어와 협업",
    examples: [
      "인기 웹툰 캐릭터 등장",
      "다른 Reddit 커뮤니티 연계",
      "유명 팟캐스트 콜라보"
    ],
    availability: "특별 이벤트",
    specialFeature: "크로스 프로모션"
  }
};

// Create exclusive case
async function createExclusiveCase(
  type: keyof typeof EXCLUSIVE_TYPES
): Promise<CaseData> {
  const exclusive = EXCLUSIVE_TYPES[type];

  const caseData = await generateCase('hard', {
    theme: exclusive.description,
    specialFeatures: exclusive.specialFeature
  });

  // Set expiration
  caseData.expiresAt = Date.now() + 24 * HOUR;
  caseData.isExclusive = true;
  caseData.rarity = 'legendary';

  // Announce on Reddit
  await announceExclusiveCase(caseData, exclusive);

  // Track plays
  trackExclusiveEngagement(caseData.id);

  return caseData;
}
```

## Viral Sharing Mechanics

```typescript
// 챌린지 완료 후 자동 공유

const SHARE_TEMPLATES = {
  speedChallenge: (time: number) => `
⚡ 나는 60초 챌린지를 ${time}초에 완료했어요!

당신도 도전해보세요! 내 기록을 깰 수 있나요?

#SpeedDetective #ArmchairSleuths
[도전하기](${challengeUrl})
  `,

  tournament: (rank: number, total: number) => `
🏆 토너먼트에서 ${rank}/${total}등을 달성했어요!

다음 토너먼트에 같이 참가하실래요?

#DetectiveTournament
  `,

  themed: (event: string, score: number) => `
🎃 ${event} 특별 케이스를 ${score}점으로 해결했어요!

아직 안 해보셨다면 지금 플레이하세요!
기간 한정 이벤트입니다!

#ThemeMystery
  `
};

// Automatic sharing prompt
async function promptShare(result: ChallengeResult): Promise<void> {
  const shareText = SHARE_TEMPLATES[result.type](result.metric);

  showShareDialog({
    platforms: ['Reddit', 'Twitter', 'Facebook'],
    text: shareText,
    image: generateResultImage(result),
    incentive: "+50 XP for sharing!"
  });
}
```

## Integration with Project

### Challenge Scheduler

```typescript
// scripts/schedule-challenges.ts

const CHALLENGE_CALENDAR = {
  daily: {
    type: "Speed Challenge",
    time: "21:00", // 9 PM
    difficulty: "easy"
  },

  weekly: {
    type: "Tournament",
    day: "Saturday",
    time: "10:00"
  },

  monthly: {
    type: "Themed Event",
    date: 1, // First of month
    theme: "seasonal"
  },

  special: [
    { date: "2025-10-31", type: "Halloween" },
    { date: "2025-12-25", type: "Christmas" },
    { date: "2025-02-14", type: "Valentine" }
  ]
};

// Auto-schedule challenges
cron.schedule('0 21 * * *', () => {
  createSpeedChallenge();
});

cron.schedule('0 10 * * 6', () => {
  createWeeklyTournament();
});
```

## Quick Start

### 1. Create Speed Challenge

```bash
npx tsx scripts/create-speed-challenge.ts --time-limit 60
```

### 2. Launch Themed Event

```bash
npx tsx scripts/launch-themed-event.ts --theme halloween --duration 30
```

### 3. Start Tournament

```bash
npx tsx scripts/start-tournament.ts --participants 64 --format knockout
```

## Analytics

```typescript
// Track challenge performance

interface ChallengeMetrics {
  participationRate: number;
  completionRate: number;
  averageScore: number;
  shareRate: number;
  returnRate: number; // Players who come back
}

async function analyzeChallenge(challengeId: string): Promise<ChallengeMetrics> {
  const total = await getTotalPlayers();
  const participants = await getChallengeParticipants(challengeId);
  const completed = await getCompletedPlayers(challengeId);
  const shared = await getShareCount(challengeId);
  const returned = await getReturnPlayers(challengeId, 7); // Within 7 days

  return {
    participationRate: participants / total,
    completionRate: completed / participants,
    averageScore: await getAverageScore(challengeId),
    shareRate: shared / completed,
    returnRate: returned / participants
  };
}
```

## References

- **challenge-library.md**: All challenge types and templates
- **themed-events.md**: Seasonal event planning guide
- **tournament-systems.md**: Bracket and league formats
- **viral-mechanics.md**: Sharing and growth strategies
- **reward-systems.md**: Badge and incentive design

## Best Practices

1. **Create urgency** - Limited time drives action
2. **Clear rewards** - Players need to know what they get
3. **Easy sharing** - One-click share with pre-filled text
4. **Fair competition** - Same case for all participants
5. **Celebrate winners** - Public recognition drives engagement
6. **Variety** - Rotate challenge types weekly
