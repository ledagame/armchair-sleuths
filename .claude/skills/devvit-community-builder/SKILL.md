---
name: devvit-community-builder
description: Viral Reddit community building using Devvit platform features including daily posts, leaderboards, user flairs, and social engagement loops. Use when designing community features, implementing daily post automation, creating leaderboard systems, or building viral sharing mechanics. Targets K > 1.0 viral coefficient.
---

# Devvit Community Builder

## Overview

Specializes in building and growing Reddit communities using Devvit's unique features. Combines Reddit community dynamics with game mechanics to create viral loops and sustained engagement.

## When to Use This Skill

**Use this skill PROACTIVELY when:**
- 커뮤니티 기능: "커뮤니티 시스템 구축" / "Build community features"
- 바이럴 메커닉: "공유 시스템" / "Add sharing mechanics"
- 일일 포스트: "자동 포스팅" / "Automate daily posts"
- 리더보드: "순위표 시스템" / "Implement leaderboards"
- 참여 유도: "engagement 높이기" / "Increase engagement"
- Reddit 통합: "Devvit 기능 활용" / "Use Devvit features"

## Viral Loop Design

### Core Viral Mechanics

```typescript
// Viral coefficient formula: K = (invites per user) × (conversion rate)
// K > 1 = exponential growth

const VIRAL_MECHANICS = {
  shareButton: {
    placement: "케이스 해결 후 즉시 표시",
    template: "나는 케이스 #{caseId}를 {time}분에 해결했어요! 당신도 도전해보세요!",
    incentive: "공유 시 추가 XP 또는 특별 배지",
    k_contribution: 0.3 // 30% of viral coefficient
  },

  dailyChallenge: {
    mechanism: "매일 같은 케이스를 모두가 플레이",
    socialProof: "X명이 오늘 케이스를 시도했어요",
    leaderboard: "일일 순위표 with 해결 시간",
    k_contribution: 0.4
  },

  competitiveElements: {
    friendComparison: "친구와 점수 비교",
    globalRanking: "전체 순위",
    achievements: "공개 업적 배지",
    k_contribution: 0.3
  }
};

// Target: K = 1.0+ for sustainable growth
// Actual: 0.3 + 0.4 + 0.3 = 1.0
```

### Daily Post Automation

```typescript
// scripts/create-daily-post.ts

interface DailyPostConfig {
  schedule: string; // "0 9 * * *" = Every day at 9 AM
  subreddit: string;
  template: PostTemplate;
}

const DAILY_POST_TEMPLATE = {
  title: (caseId: string, date: string) =>
    `🔍 오늘의 미스터리 | ${date} | Case #${caseId}`,

  body: (caseData: CaseData) => `
# 🕵️ 오늘의 수사 파일

**피해자**: ${caseData.victim.name}
**장소**: ${caseData.location.name}
**발견**: ${caseData.weapon.name}

---

## 📋 사건 개요

${caseData.victim.background}

---

## 🎯 당신의 임무

용의자 3명을 심문하고 단서를 수집하여 범인을 찾아내세요!

**난이도**: ${getDifficultyBadge(caseData.difficulty)}

---

## 🏆 오늘의 리더보드

현재 ${getTodayPlayerCount()}명이 수사 중입니다!

[게임 시작하기](${getGameUrl(caseData.id)})

---

*매일 오전 9시 새로운 케이스가 공개됩니다!*
  `,

  flair: "Daily Mystery",
  pinned: true,
  nsfw: false
};

async function createDailyPost(caseData: CaseData): Promise<void> {
  const reddit = new RedditClient();

  const post = await reddit.submitPost({
    subreddit: 'ArmchairSleuths',
    title: DAILY_POST_TEMPLATE.title(caseData.id, caseData.date),
    selftext: DAILY_POST_TEMPLATE.body(caseData),
    flair_id: 'daily-mystery',
    sticky: true
  });

  // Add game widget to post
  await addDevvitWidget(post.id, caseData);

  // Schedule removal of previous day's post
  await unstickPreviousPost();
}
```

## Devvit Integration Patterns

### Pattern 1: Embedded Game Widget

```typescript
// Devvit block for Reddit post

import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true
});

// Custom post with embedded game
Devvit.addCustomPostType({
  name: 'Mystery Case',
  description: 'Interactive murder mystery game',
  render: (context) => {
    const caseId = context.postId;

    return (
      <vstack gap="medium" padding="medium">
        <text size="xxlarge" weight="bold">
          🔍 오늘의 미스터리
        </text>

        <hstack gap="small" alignment="center">
          <text>플레이어:</text>
          <text weight="bold">{context.redis.get(`case:${caseId}:players`)}</text>
        </hstack>

        <button
          onPress={() => context.ui.navigateTo(`/case/${caseId}`)}
          appearance="primary"
          size="large"
        >
          수사 시작
        </button>

        <text size="small" color="neutral-content-weak">
          평균 해결 시간: {getAverageTime(caseId)}분
        </text>
      </vstack>
    );
  }
});
```

### Pattern 2: Leaderboard Widget

```typescript
// Real-time leaderboard using Redis

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  solveTime: number; // milliseconds
  submittedAt: number;
}

async function updateLeaderboard(
  caseId: string,
  entry: LeaderboardEntry
): Promise<void> {
  const redis = context.redis;
  const key = `leaderboard:${caseId}`;

  // Use Redis sorted set for automatic ranking
  await redis.zadd(key, {
    member: entry.userId,
    score: entry.score * 1000 - entry.solveTime // Higher score, faster time = higher rank
  });

  // Set expiration to 24 hours
  await redis.expire(key, 86400);
}

async function getTopPlayers(caseId: string, limit: number = 10): Promise<LeaderboardEntry[]> {
  const redis = context.redis;
  const key = `leaderboard:${caseId}`;

  const rankings = await redis.zrange(key, 0, limit - 1, { reverse: true });

  return Promise.all(
    rankings.map(async ({ member, score }) => {
      const userData = await redis.hgetall(`user:${member}`);
      return {
        userId: member,
        username: userData.username,
        score: Math.floor(score / 1000),
        solveTime: score % 1000,
        submittedAt: userData.submittedAt
      };
    })
  );
}

// Render leaderboard
<vstack gap="small">
  <text size="large" weight="bold">🏆 리더보드</text>
  {topPlayers.map((player, index) => (
    <hstack key={player.userId} gap="medium" alignment="center">
      <text weight="bold">#{index + 1}</text>
      <text>{player.username}</text>
      <spacer />
      <text>{player.score}점</text>
      <text size="small" color="neutral-content-weak">
        {formatTime(player.solveTime)}
      </text>
    </hstack>
  ))}
</vstack>
```

### Pattern 3: User Flair System

```typescript
// Award flair based on achievements

const FLAIR_TEMPLATES = {
  speedDemon: {
    text: "⚡ 스피드 탐정",
    condition: "3분 이내 해결",
    cssClass: "speed-demon"
  },
  perfectScore: {
    text: "🎯 완벽한 추리",
    condition: "100점 달성",
    cssClass: "perfect-score"
  },
  streakMaster: {
    text: "🔥 연속 해결 7일",
    condition: "7일 연속 플레이",
    cssClass: "streak-master"
  },
  expertDetective: {
    text: "🕵️ 베테랑 탐정",
    condition: "Hard 난이도 10개 완료",
    cssClass: "expert-detective"
  }
};

async function awardFlair(
  userId: string,
  achievement: keyof typeof FLAIR_TEMPLATES
): Promise<void> {
  const reddit = context.reddit;
  const template = FLAIR_TEMPLATES[achievement];

  await reddit.setUserFlair({
    subredditName: 'ArmchairSleuths',
    username: userId,
    text: template.text,
    cssClass: template.cssClass
  });

  // Send modmail notification
  await reddit.sendPrivateMessage({
    to: userId,
    subject: '🎉 새로운 배지 획득!',
    text: `축하합니다! "${template.text}" 배지를 획득했습니다!`
  });
}
```

## Social Engagement Patterns

### Pattern 1: Discussion Threads

```typescript
// Auto-create discussion threads

const THREAD_TYPES = {
  theoryCrafting: {
    title: "💭 이론 공유 스레드 | Case #{caseId}",
    body: "당신의 추리를 공유하세요! (스포일러 주의)",
    sticky: false,
    sort: "new"
  },

  hintRequest: {
    title: "🔦 힌트 요청 스레드 | Case #{caseId}",
    body: "막혔나요? 스포일러 없는 힌트를 요청하세요!",
    sticky: true,
    sort: "qa"
  },

  solutions: {
    title: "✅ 해설 스레드 | Case #{caseId}",
    body: "정답을 찾은 분들이 추리 과정을 공유하는 곳입니다!",
    sticky: false,
    sort: "top",
    spoiler: true
  }
};

async function createDiscussionThreads(caseId: string): Promise<void> {
  for (const [type, config] of Object.entries(THREAD_TYPES)) {
    await reddit.submitPost({
      subreddit: 'ArmchairSleuths',
      title: config.title.replace('{caseId}', caseId),
      selftext: config.body,
      sticky: config.sticky,
      spoiler: config.spoiler
    });
  }
}
```

### Pattern 2: Weekly Tournaments

```typescript
// Weekly competition system

interface Tournament {
  id: string;
  startDate: string;
  endDate: string;
  cases: string[]; // Multiple cases
  participants: Set<string>;
  prizes: Prize[];
}

const WEEKLY_TOURNAMENT = {
  schedule: "Every Monday 9 AM",
  duration: 7, // days
  caseCount: 7, // One per day
  prizes: [
    { rank: 1, reward: "🥇 Gold Detective Flair + Reddit Gold" },
    { rank: 2, reward: "🥈 Silver Detective Flair" },
    { rank: 3, reward: "🥉 Bronze Detective Flair" }
  ]
};

async function createWeeklyTournament(): Promise<Tournament> {
  const tournament: Tournament = {
    id: `tournament-${Date.now()}`,
    startDate: getNextMonday(),
    endDate: getNextSunday(),
    cases: [],
    participants: new Set(),
    prizes: WEEKLY_TOURNAMENT.prizes
  };

  // Generate 7 cases
  for (let i = 0; i < 7; i++) {
    const caseData = await generateCase('medium');
    tournament.cases.push(caseData.id);
  }

  // Create announcement post
  await reddit.submitPost({
    subreddit: 'ArmchairSleuths',
    title: `🏆 주간 토너먼트 시작! | ${tournament.startDate}`,
    selftext: `
7일간 7개의 케이스를 해결하세요!
총점이 가장 높은 탐정에게 특별 보상이 주어집니다.

**참가 방법**: 매일 케이스를 해결하면 자동으로 참가됩니다.

**상품**:
${WEEKLY_TOURNAMENT.prizes.map(p => `${p.rank}위: ${p.reward}`).join('\n')}
    `,
    sticky: true
  });

  return tournament;
}
```

## Growth Metrics & Analytics

```typescript
// Track community growth metrics

interface CommunityMetrics {
  dailyActiveUsers: number;
  casesPlayed: number;
  averageEngagement: number; // Time spent
  viralCoefficient: number; // K value
  retentionRate: number; // Day 7 retention
}

async function trackMetrics(caseId: string): Promise<CommunityMetrics> {
  const redis = context.redis;

  const dau = await redis.scard(`dau:${getToday()}`);
  const casesPlayed = await redis.get(`cases:${caseId}:plays`);
  const totalTime = await redis.get(`cases:${caseId}:totalTime`);
  const avgEngagement = totalTime / casesPlayed;

  // Calculate viral coefficient
  const shares = await redis.get(`cases:${caseId}:shares`);
  const conversions = await redis.get(`cases:${caseId}:conversions`);
  const k = (shares / casesPlayed) * (conversions / shares);

  // Calculate retention
  const newUsers = await redis.scard(`new_users:${getDaysAgo(7)}`);
  const activeAfter7Days = await redis.sinter(
    `new_users:${getDaysAgo(7)}`,
    `dau:${getToday()}`
  );
  const retention = activeAfter7Days.length / newUsers;

  return {
    dailyActiveUsers: dau,
    casesPlayed,
    averageEngagement,
    viralCoefficient: k,
    retentionRate: retention
  };
}

// Alert if metrics drop
if (metrics.viralCoefficient < 0.8) {
  console.warn("⚠️ Viral coefficient dropped below 0.8!");
  // Trigger engagement boost campaigns
}
```

## Integration with Project

### Add Devvit Configuration

```typescript
// devvit.yaml

name: armchair-sleuths
version: 1.0.0
redditAPI: true
redis: true

customPost:
  - name: mystery-case
    handler: handleMysteryCase

scheduler:
  - name: daily-case-post
    cron: "0 9 * * *"
    handler: createDailyPost
```

### Reddit Bot for Automation

```bash
# Install dependencies
npm install snoowrap

# Configure Reddit credentials
REDDIT_CLIENT_ID=xxx
REDDIT_CLIENT_SECRET=xxx
REDDIT_USERNAME=ArmchairSleuths_Bot
REDDIT_PASSWORD=xxx
```

## Quick Start

### 1. Set Up Daily Posts

```bash
npx tsx scripts/setup-daily-posts.ts --subreddit ArmchairSleuths
```

### 2. Initialize Leaderboard

```bash
npx tsx scripts/init-leaderboard.ts --case-id case-2025-01-19
```

### 3. Test Viral Mechanics

```bash
npx tsx scripts/test-viral-loop.ts --simulate 100
```

## References

- **devvit-api-guide.md**: Complete Devvit API reference
- **reddit-growth-strategies.md**: Proven Reddit growth tactics
- **viral-mechanics.md**: Viral loop design patterns
- **community-moderation.md**: Managing Reddit communities
- **analytics-dashboard.md**: Tracking and optimizing metrics

## Best Practices

1. **Post timing matters** - 9 AM optimal for global reach
2. **Sticky important posts** - Daily cases should be pinned
3. **Engage in comments** - Bot should respond to questions
4. **Cross-promote** - Link to related subreddits
5. **Reward participation** - Flairs and recognition drive engagement
6. **Track viral coefficient** - Aim for K > 1.0
