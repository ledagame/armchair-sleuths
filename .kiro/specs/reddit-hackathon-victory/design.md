# Design Document - Reddit 해커톤 우승 전략

## Overview

본 설계는 Armchair Sleuths의 기존 기술 스택과 아키텍처를 유지하면서,
Reddit 플랫폼의 네이티브 기능을 최대한 활용하여 해커톤 심사위원들에게
강력한 인상을 주기 위한 전략적 기능 추가를 다룹니다.

### Design Principles

1. **Reddit-First Design**: Reddit API를 단순히 사용하는 것이 아니라,
   Reddit의 핵심 가치(커뮤니티, 토론, 투표)를 게임 메커니즘에 통합

2. **Backward Compatibility**: 기존 20+ API와 6개 화면 유지,
   새 기능은 점진적 추가

3. **Viral by Design**: 모든 기능이 자연스럽게 공유와 확산을 유도

4. **Minimal Friction**: 플레이어가 Reddit을 떠나지 않고 모든 기능 사용 가능

5. **Data-Driven**: 모든 engagement 메트릭 추적 및 실시간 표시

### Technology Stack (기존 유지)

- **Backend**: Express.js + Devvit Server SDK
- **Frontend**: React (Devvit Web)
- **AI**: Gemini API (케이스 생성, 대화, 채점, 이미지)
- **Storage**: Redis (via Devvit)
- **Platform**: Reddit Devvit

### New Dependencies

- `@devvit/public-api`: Flair, Comments, Voting API
- `canvas` (server-side): Share card 이미지 생성


## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Reddit Platform Layer                     │
│  (Comments API, Flair API, Voting API, Crosspost API)       │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              Armchair Sleuths Integration Layer              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Comment      │  │ Flair        │  │ Leaderboard  │      │
│  │ Service      │  │ Service      │  │ Service      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                 Existing Game Engine (유지)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Case         │  │ Suspect AI   │  │ Evidence     │      │
│  │ Generator    │  │ Service      │  │ Discovery    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Diagram

```
src/server/
├── services/
│   ├── reddit/                    # NEW: Reddit Integration
│   │   ├── CommentService.ts      # 댓글 생성/조회
│   │   ├── FlairService.ts        # Flair 업데이트
│   │   ├── LeaderboardService.ts  # 리더보드 포스트 관리
│   │   ├── CrosspostService.ts    # 크로스포스트
│   │   └── VotingService.ts       # 투표 집계
│   ├── social/                    # NEW: Social Features
│   │   ├── ShareCardGenerator.ts  # 공유 카드 이미지 생성
│   │   ├── ReferralService.ts     # 초대 코드 관리
│   │   └── ChallengeService.ts    # 일일 챌린지
│   ├── community/                 # NEW: Community Features
│   │   ├── ColdCaseService.ts     # 장기 커뮤니티 이벤트
│   │   └── AIAssistantService.ts  # Watson AI 조수
│   └── [existing services...]     # 기존 서비스 유지
```


## Components and Interfaces

### 1. Reddit Comment Integration

#### CommentService

**Purpose**: 증거 공유 및 추리 토론을 Reddit 댓글로 통합

**Interface**:
```typescript
interface CommentService {
  // 증거를 댓글로 공유
  shareEvidence(params: {
    postId: string;
    userId: string;
    evidenceId: string;
    evidenceName: string;
    evidenceDescription: string;
  }): Promise<Comment>;

  // 추리를 댓글로 제출
  shareTheory(params: {
    postId: string;
    userId: string;
    theory: string;
    suspectId: string;
  }): Promise<Comment>;

  // 케이스의 모든 추리 댓글 조회
  getTheories(postId: string): Promise<TheoryComment[]>;

  // 인기 추리 집계 (투표 기반)
  getTopTheories(postId: string, limit: number): Promise<TheoryRanking[]>;
}

interface TheoryComment {
  id: string;
  author: string;
  content: string;
  votes: number;
  suspectId: string;
  createdAt: Date;
}

interface TheoryRanking {
  suspectId: string;
  suspectName: string;
  voteCount: number;
  percentage: number;
  topComment: TheoryComment;
}
```

**Implementation Strategy**:
- Reddit API의 `reddit.submitComment()` 사용
- 댓글 포맷: 구조화된 마크다운 (파싱 가능)
- 투표 집계: Reddit의 네이티브 upvote/downvote 활용


### 2. Detective Flair System

#### FlairService

**Purpose**: 플레이어의 탐정 등급을 Reddit Flair로 표시

**Interface**:
```typescript
interface FlairService {
  // 플레이어 등급 계산
  calculateRank(stats: PlayerStats): DetectiveRank;

  // Flair 업데이트
  updateUserFlair(params: {
    subredditName: string;
    username: string;
    rank: DetectiveRank;
  }): Promise<void>;

  // 등급 업그레이드 체크
  checkRankUpgrade(userId: string): Promise<RankUpgradeResult>;
}

interface PlayerStats {
  casesPlayed: number;
  correctAnswers: number;
  averageScore: number;
  totalAP: number;
}

interface DetectiveRank {
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  title: string;  // "신참 형사", "베테랑 탐정", etc.
  emoji: string;  // "🔍", "🕵️", "🎩", "🏆", "👑"
  requirements: {
    minCases: number;
    minCorrect: number;
    minAvgScore: number;
  };
}

interface RankUpgradeResult {
  upgraded: boolean;
  oldRank: DetectiveRank;
  newRank: DetectiveRank;
  celebrationPost?: Post;
}
```

**Rank Progression**:
```typescript
const DETECTIVE_RANKS: DetectiveRank[] = [
  { level: 1, title: "신참 형사", emoji: "🔍", requirements: { minCases: 0, minCorrect: 0, minAvgScore: 0 } },
  { level: 2, title: "순경", emoji: "👮", requirements: { minCases: 3, minCorrect: 1, minAvgScore: 60 } },
  { level: 3, title: "수사관", emoji: "🕵️", requirements: { minCases: 10, minCorrect: 5, minAvgScore: 70 } },
  { level: 4, title: "형사", emoji: "🔎", requirements: { minCases: 20, minCorrect: 12, minAvgScore: 75 } },
  { level: 5, title: "베테랑 탐정", emoji: "🎩", requirements: { minCases: 50, minCorrect: 30, minAvgScore: 80 } },
  { level: 6, title: "명탐정", emoji: "🏆", requirements: { minCases: 100, minCorrect: 70, minAvgScore: 85 } },
  { level: 7, title: "마스터 탐정", emoji: "💎", requirements: { minCases: 200, minCorrect: 150, minAvgScore: 88 } },
  { level: 8, title: "전설의 탐정", emoji: "⭐", requirements: { minCases: 365, minCorrect: 300, minAvgScore: 90 } },
  { level: 9, title: "셜록 홈즈", emoji: "👑", requirements: { minCases: 500, minCorrect: 450, minAvgScore: 92 } },
  { level: 10, title: "추리의 신", emoji: "🌟", requirements: { minCases: 1000, minCorrect: 900, minAvgScore: 95 } }
];
```


### 3. Live Leaderboard System

#### LeaderboardService

**Purpose**: 일일 케이스 리더보드를 Reddit 포스트로 자동 생성 및 핀 고정

**Interface**:
```typescript
interface LeaderboardService {
  // 리더보드 생성 및 포스트
  createLeaderboardPost(params: {
    caseId: string;
    caseTitle: string;
    subredditName: string;
  }): Promise<Post>;

  // 리더보드 업데이트 (실시간)
  updateLeaderboard(params: {
    postId: string;
    rankings: PlayerRanking[];
  }): Promise<void>;

  // 포스트 핀 고정
  pinLeaderboard(postId: string, position: 1 | 2): Promise<void>;

  // 리더보드 데이터 조회
  getLeaderboard(caseId: string): Promise<PlayerRanking[]>;
}

interface PlayerRanking {
  rank: number;
  username: string;
  score: number;
  grade: string;
  flairRank: DetectiveRank;
  submittedAt: Date;
  timeToSolve: number; // minutes
}
```

**Leaderboard Post Format**:
```markdown
# 🏆 [Case Title] - Top Detectives

**Date**: 2025-01-24
**Total Submissions**: 156

## 🥇 Top 10 Detectives

| Rank | Detective | Score | Grade | Time | Flair |
|------|-----------|-------|-------|------|-------|
| 1 | u/sherlock_kim | 98 | S | 12m | 🏆 명탐정 |
| 2 | u/detective_park | 95 | S | 15m | 🎩 베테랑 탐정 |
| 3 | u/mystery_solver | 92 | A | 18m | 🕵️ 수사관 |
...

## 📊 Statistics

- Average Score: 78
- Average Time: 25 minutes
- Most Suspected: [Suspect Name] (45%)
- Correct Answer Rate: 62%

---

**Want to play?** [Click here to start investigating!](link)
```

**Scheduler Integration**:
```typescript
// src/server/schedulers/LeaderboardScheduler.ts
scheduler.cron({
  name: 'pin-daily-leaderboard',
  cron: '0 0 * * *', // Every day at midnight UTC
  async onRun(context) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const caseId = `case-${yesterday.toISOString().split('T')[0]}`;
    
    const leaderboardService = new LeaderboardService(context);
    const post = await leaderboardService.createLeaderboardPost({
      caseId,
      caseTitle: `${caseId} Mystery`,
      subredditName: context.subredditName
    });
    
    await leaderboardService.pinLeaderboard(post.id, 2);
  }
});
```


### 4. Daily Challenge System

#### ChallengeService

**Purpose**: 일일 추가 챌린지 목표 제공 및 특별 보상

**Interface**:
```typescript
interface ChallengeService {
  // 오늘의 챌린지 생성
  generateDailyChallenges(caseId: string): Promise<DailyChallenge[]>;

  // 챌린지 완료 체크
  checkChallengeCompletion(params: {
    userId: string;
    caseId: string;
    submission: Submission;
  }): Promise<ChallengeResult[]>;

  // 챌린지 진행 상황 조회
  getChallengeProgress(userId: string): Promise<ChallengeProgress>;
}

interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  condition: ChallengeCondition;
  reward: ChallengeReward;
  icon: string;
}

interface ChallengeCondition {
  type: 'speed' | 'evidence' | 'score' | 'streak' | 'perfect';
  threshold: number;
  unit?: string;
}

interface ChallengeReward {
  type: 'badge' | 'ap' | 'flair' | 'feature';
  value: string | number;
  description: string;
}

interface ChallengeResult {
  challenge: DailyChallenge;
  completed: boolean;
  progress: number;
  reward?: ChallengeReward;
}

interface ChallengeProgress {
  dailyStreak: number;
  totalChallengesCompleted: number;
  badges: string[];
  nextMilestone: {
    name: string;
    progress: number;
    total: number;
  };
}
```

**Challenge Types**:
```typescript
const CHALLENGE_TEMPLATES = [
  {
    id: 'speed-demon',
    name: '스피드 탐정',
    description: '10분 이내에 사건 해결',
    condition: { type: 'speed', threshold: 10, unit: 'minutes' },
    reward: { type: 'badge', value: 'Speed Demon Badge', description: '내일 2x AP 부스트' }
  },
  {
    id: 'evidence-collector',
    name: '증거 수집가',
    description: '모든 증거 아이템 발견',
    condition: { type: 'evidence', threshold: 100, unit: 'percent' },
    reward: { type: 'flair', value: 'Evidence Master', description: '특별 Flair + 리더보드 강조' }
  },
  {
    id: 'perfect-score',
    name: '완벽한 추리',
    description: '95점 이상 획득',
    condition: { type: 'score', threshold: 95 },
    reward: { type: 'feature', value: 'Featured Detective', description: '서브레딧 메인 페이지 소개' }
  },
  {
    id: 'sherlock-streak',
    name: '셜록 연속',
    description: '7일 연속 정답',
    condition: { type: 'streak', threshold: 7, unit: 'days' },
    reward: { type: 'badge', value: 'Golden Detective Badge', description: '영구 골든 배지' }
  }
];
```


### 5. Social Share Card Generator

#### ShareCardGenerator

**Purpose**: 플레이어 성과를 시각적으로 표현한 공유 카드 생성

**Interface**:
```typescript
interface ShareCardGenerator {
  // 공유 카드 이미지 생성
  generateShareCard(params: {
    submission: Submission;
    playerStats: PlayerStats;
    caseTitle: string;
  }): Promise<string>; // Returns base64 image data URL

  // 크로스포스트 생성
  createCrosspost(params: {
    imageUrl: string;
    title: string;
    targetSubreddit: string;
    sourcePostId: string;
  }): Promise<Post>;
}
```

**Share Card Design**:
```
┌─────────────────────────────────────────────────────┐
│                                                      │
│  [Case Background Image - Blurred]                  │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  🔍 Armchair Sleuths                       │    │
│  │                                             │    │
│  │  Score: 92                                  │    │
│  │  Grade: A                                   │    │
│  │                                             │    │
│  │  🏆 명탐정 (Lv.6)                          │    │
│  │                                             │    │
│  │  ✅ Challenges Completed:                  │    │
│  │  • 스피드 탐정 (9m 58s)                    │    │
│  │  • 증거 수집가 (12/12)                     │    │
│  │                                             │    │
│  │  [Play Today's Mystery →]                  │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Implementation**:
```typescript
// Using node-canvas for server-side image generation
import { createCanvas, loadImage } from 'canvas';

async function generateShareCard(params: ShareCardParams): Promise<string> {
  const canvas = createCanvas(1200, 630); // OG image size
  const ctx = canvas.getContext('2d');

  // 1. Background
  const bgImage = await loadImage(params.caseImageUrl);
  ctx.filter = 'blur(10px) brightness(0.4)';
  ctx.drawImage(bgImage, 0, 0, 1200, 630);
  ctx.filter = 'none';

  // 2. Overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(100, 100, 1000, 430);

  // 3. Text
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 72px Arial';
  ctx.fillText(`Score: ${params.submission.score}`, 150, 220);

  ctx.fillStyle = '#FFF';
  ctx.font = '48px Arial';
  ctx.fillText(params.submission.grade, 150, 300);

  ctx.font = '36px Arial';
  ctx.fillText(`🏆 ${params.playerStats.rank.title} (Lv.${params.playerStats.rank.level})`, 150, 370);

  // 4. Challenges
  ctx.font = '28px Arial';
  ctx.fillText('✅ Challenges Completed:', 150, 430);
  params.completedChallenges.forEach((challenge, i) => {
    ctx.fillText(`• ${challenge.name}`, 170, 470 + i * 40);
  });

  // 5. Logo
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 32px Arial';
  ctx.fillText('🔍 Armchair Sleuths', 150, 550);

  return canvas.toDataURL();
}
```


### 6. Referral System

#### ReferralService

**Purpose**: 친구 초대 및 보상 시스템

**Interface**:
```typescript
interface ReferralService {
  // 초대 코드 생성
  generateInviteCode(userId: string): Promise<string>;

  // 초대 코드로 가입
  redeemInviteCode(params: {
    newUserId: string;
    inviteCode: string;
  }): Promise<ReferralResult>;

  // 초대 통계 조회
  getReferralStats(userId: string): Promise<ReferralStats>;

  // 마일스톤 보상 지급
  checkMilestoneRewards(userId: string): Promise<MilestoneReward[]>;
}

interface ReferralResult {
  success: boolean;
  referrerId: string;
  referrerReward: number; // AP
  refereeReward: number; // AP
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number; // Played at least 1 case
  nextMilestone: {
    count: number;
    reward: string;
  };
  earnedRewards: MilestoneReward[];
}

interface MilestoneReward {
  milestone: number; // 5, 10, 50, etc.
  type: 'badge' | 'flair' | 'hall_of_fame';
  value: string;
  unlockedAt: Date;
}
```

**Referral Milestones**:
```typescript
const REFERRAL_MILESTONES = [
  { count: 5, reward: { type: 'badge', value: 'Community Builder' } },
  { count: 10, reward: { type: 'flair', value: 'Detective Recruiter' } },
  { count: 25, reward: { type: 'badge', value: 'Master Recruiter' } },
  { count: 50, reward: { type: 'hall_of_fame', value: 'Hall of Fame Entry' } },
  { count: 100, reward: { type: 'flair', value: 'Legendary Recruiter' } }
];
```

**Data Model**:
```typescript
interface ReferralData {
  userId: string;
  inviteCode: string; // Unique 8-char code
  referrals: {
    userId: string;
    joinedAt: Date;
    isActive: boolean; // Played at least 1 case
  }[];
  totalAPEarned: number;
  milestones: MilestoneReward[];
}
```


### 7. Community Cold Case System

#### ColdCaseService

**Purpose**: 7일간 진행되는 복잡한 커뮤니티 협력 사건

**Interface**:
```typescript
interface ColdCaseService {
  // Cold Case 생성
  createColdCase(params: {
    startDate: Date;
    duration: number; // days
  }): Promise<ColdCase>;

  // 일일 증거 공개
  releaseDaily Evidence(params: {
    coldCaseId: string;
    day: number;
  }): Promise<Evidence[]>;

  // 커뮤니티 추리 제출
  submitCommunityTheory(params: {
    coldCaseId: string;
    userId: string;
    theory: string;
  }): Promise<void>;

  // 투표 집계
  getCommunityConsensus(coldCaseId: string): Promise<ConsensusResult>;

  // Cold Case 종료 및 정답 공개
  resolveColdCase(coldCaseId: string): Promise<ColdCaseResult>;
}

interface ColdCase {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  currentDay: number;
  totalDays: number;
  releasedEvidence: Evidence[];
  communityTheories: CommunityTheory[];
  participants: string[]; // userIds
  status: 'active' | 'voting' | 'resolved';
}

interface CommunityTheory {
  id: string;
  userId: string;
  theory: string;
  votes: number;
  submittedAt: Date;
  supportingEvidence: string[]; // evidenceIds
}

interface ConsensusResult {
  topTheories: CommunityTheory[];
  suspectVotes: {
    suspectId: string;
    suspectName: string;
    voteCount: number;
    percentage: number;
  }[];
  participationRate: number;
}

interface ColdCaseResult {
  coldCaseId: string;
  solution: Solution;
  communityAccuracy: number; // % who voted correctly
  topContributors: {
    userId: string;
    contribution: string;
    reward: number; // AP
  }[];
  rewards: {
    correctAnswer: number; // 100 AP
    participation: number; // 10 AP
    topContributor: string; // 'Legendary Detective Badge'
  };
}
```

**Daily Evidence Release Schedule**:
```typescript
const COLD_CASE_SCHEDULE = {
  day1: {
    title: 'Crime Scene Discovery',
    evidence: ['crime_scene_photo', 'initial_report', 'victim_background']
  },
  day2: {
    title: 'Autopsy Results',
    evidence: ['autopsy_report', 'toxicology', 'time_of_death']
  },
  day3: {
    title: 'Witness Testimonies',
    evidence: ['witness_1_statement', 'witness_2_statement', 'cctv_footage']
  },
  day4: {
    title: 'Suspect Interrogations',
    evidence: ['suspect_1_alibi', 'suspect_2_alibi', 'suspect_3_alibi']
  },
  day5: {
    title: 'Forensic Analysis',
    evidence: ['fingerprints', 'dna_results', 'weapon_analysis']
  },
  day6: {
    title: 'Hidden Connections',
    evidence: ['financial_records', 'phone_records', 'secret_relationship']
  },
  day7: {
    title: 'Final Evidence & Deadline',
    evidence: ['smoking_gun', 'final_clue'],
    deadline: true
  }
};
```


### 8. AI Detective Assistant (Watson)

#### AIAssistantService

**Purpose**: AP를 소비하여 AI 조수의 힌트 제공

**Interface**:
```typescript
interface AIAssistantService {
  // 증거 분석 요청
  analyzeEvidence(params: {
    userId: string;
    caseId: string;
    evidenceId: string;
    cost: number; // 2 AP
  }): Promise<EvidenceAnalysis>;

  // 용의자 심리 분석
  analyzeSuspectBehavior(params: {
    userId: string;
    caseId: string;
    suspectId: string;
    cost: number; // 3 AP
  }): Promise<PsychologicalProfile>;

  // 타임라인 재구성
  reconstructTimeline(params: {
    userId: string;
    caseId: string;
    cost: number; // 5 AP
  }): Promise<TimelineReconstruction>;

  // AP 차감 및 검증
  deductAP(userId: string, caseId: string, amount: number): Promise<boolean>;
}

interface EvidenceAnalysis {
  evidenceId: string;
  insights: string[]; // AI-generated insights
  relatedEvidence: string[]; // Other evidence IDs
  suspectConnections: {
    suspectId: string;
    connection: string;
    strength: 'weak' | 'moderate' | 'strong';
  }[];
  confidence: number; // 0-100
}

interface PsychologicalProfile {
  suspectId: string;
  lies: {
    statement: string;
    reason: string;
    confidence: number;
  }[];
  truthful: {
    statement: string;
    reason: string;
  }[];
  nervousTriggers: string[];
  overallAssessment: string;
  guiltProbability: number; // 0-100 (intentionally vague)
}

interface TimelineReconstruction {
  timeline: TimelineEvent[];
  gaps: {
    time: string;
    description: string;
    significance: string;
  }[];
  inconsistencies: {
    suspectId: string;
    claim: string;
    contradiction: string;
  }[];
  criticalMoments: string[];
}

interface TimelineEvent {
  time: string;
  event: string;
  source: string; // evidence or witness
  reliability: 'confirmed' | 'disputed' | 'unverified';
}
```

**Gemini Prompt Templates**:
```typescript
const WATSON_PROMPTS = {
  analyzeEvidence: `
You are Watson, an AI detective assistant helping a player solve a murder mystery.

Evidence to analyze:
{evidenceDescription}

Case context:
{caseContext}

Provide:
1. 3-5 key insights about this evidence
2. Related evidence items that connect to this
3. Connections to each suspect (weak/moderate/strong)
4. Your confidence level (0-100)

Be helpful but not too obvious. Give clues, not answers.
`,

  analyzeSuspect: `
You are Watson, analyzing suspect behavior and statements.

Suspect: {suspectName}
Statements: {suspectStatements}
Evidence: {relatedEvidence}

Identify:
1. Likely lies (with reasoning)
2. Truthful statements
3. Nervous triggers or evasive behavior
4. Overall psychological assessment

Do NOT directly state guilt. Provide analysis only.
`,

  reconstructTimeline: `
You are Watson, reconstructing the crime timeline.

All evidence: {allEvidence}
Witness statements: {witnessStatements}
Suspect alibis: {suspectAlibis}

Create:
1. Chronological timeline of events
2. Time gaps or missing information
3. Contradictions between accounts
4. Critical moments that need explanation

Present objectively without revealing the solution.
`
};
```


## Data Models

### New Redis Keys

```typescript
// Detective Rank
`player:${userId}:stats` → PlayerStats
`player:${userId}:rank` → DetectiveRank

// Referrals
`referral:${userId}` → ReferralData
`referral:code:${inviteCode}` → userId

// Challenges
`challenge:daily:${caseId}` → DailyChallenge[]
`challenge:progress:${userId}` → ChallengeProgress

// Cold Case
`coldcase:${coldCaseId}` → ColdCase
`coldcase:theories:${coldCaseId}` → CommunityTheory[]
`coldcase:votes:${coldCaseId}:${suspectId}` → number

// Leaderboard
`leaderboard:${caseId}` → PlayerRanking[]

// Share Cards
`sharecard:${submissionId}` → string (base64 image)
```

### Extended Submission Model

```typescript
interface Submission {
  // Existing fields...
  id: string;
  userId: string;
  caseId: string;
  score: number;
  grade: string;
  
  // NEW: Challenge tracking
  completedChallenges: string[]; // challenge IDs
  challengeRewards: ChallengeReward[];
  
  // NEW: Social features
  sharedToReddit: boolean;
  shareCardUrl?: string;
  crosspostId?: string;
  
  // NEW: Timing
  startedAt: Date;
  submittedAt: Date;
  timeToSolve: number; // minutes
}
```

## Error Handling

### Reddit API Failures

**Strategy**: Graceful degradation with retry logic

```typescript
async function withRedditRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) {
        // Log error but don't break game
        console.error('Reddit API failed after retries:', error);
        throw new GracefulError('Reddit feature temporarily unavailable');
      }
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
  throw new Error('Unreachable');
}
```

**Fallback Behaviors**:
- Comment posting fails → Store locally, retry later
- Flair update fails → Queue for batch update
- Leaderboard post fails → Show in-game leaderboard only
- Share card generation fails → Use text-only share

### Rate Limiting

**Reddit API Limits**:
- Comments: 10/minute per user
- Flair updates: 30/minute
- Post creation: 1/minute

**Implementation**:
```typescript
class RateLimiter {
  private queues: Map<string, Queue> = new Map();

  async enqueue(key: string, operation: () => Promise<void>): Promise<void> {
    if (!this.queues.has(key)) {
      this.queues.set(key, new Queue({ concurrency: 1, interval: 6000 }));
    }
    return this.queues.get(key)!.add(operation);
  }
}
```


## Testing Strategy

### Unit Tests

**Priority Components**:
1. FlairService.calculateRank()
2. ChallengeService.checkChallengeCompletion()
3. ReferralService.redeemInviteCode()
4. ShareCardGenerator.generateShareCard()

**Example Test**:
```typescript
describe('FlairService', () => {
  it('should calculate correct rank for player stats', () => {
    const stats: PlayerStats = {
      casesPlayed: 10,
      correctAnswers: 5,
      averageScore: 70,
      totalAP: 100
    };
    
    const rank = flairService.calculateRank(stats);
    
    expect(rank.level).toBe(3);
    expect(rank.title).toBe('수사관');
    expect(rank.emoji).toBe('🕵️');
  });
});
```

### Integration Tests

**Critical Flows**:
1. Complete case → Update Flair → Post to leaderboard
2. Share achievement → Generate card → Crosspost
3. Invite friend → Redeem code → Award rewards
4. Complete challenge → Award badge → Update profile

### Manual Testing Checklist

**Reddit Integration**:
- [ ] Comment posting works
- [ ] Flair updates appear correctly
- [ ] Leaderboard posts are pinned
- [ ] Crossposting works
- [ ] Voting is tracked

**Social Features**:
- [ ] Share cards generate correctly
- [ ] Referral codes work
- [ ] Challenges complete properly
- [ ] Rewards are awarded

**Community Features**:
- [ ] Cold Case evidence releases daily
- [ ] Community voting works
- [ ] AI Assistant provides helpful hints
- [ ] AP deduction works correctly

## Performance Considerations

### Optimization Strategies

**1. Share Card Generation**
- Cache generated cards for 24 hours
- Use worker threads for image processing
- Compress images before upload

**2. Leaderboard Updates**
- Batch updates every 5 minutes instead of real-time
- Use Redis sorted sets for efficient ranking
- Limit to top 100 players

**3. Comment Fetching**
- Cache comment threads for 1 minute
- Paginate results (50 per page)
- Use Reddit's comment tree API efficiently

**4. Flair Updates**
- Batch updates (max 30/minute)
- Only update on rank change, not every submission
- Queue updates during high traffic

### Scalability

**Expected Load (Hackathon Period)**:
- 1,000+ concurrent players
- 10,000+ daily submissions
- 5,000+ comments per day
- 1,000+ share cards generated

**Redis Memory Estimate**:
```
Players: 1,000 × 5KB = 5MB
Submissions: 10,000 × 2KB = 20MB
Comments cache: 5,000 × 1KB = 5MB
Leaderboards: 100 × 50KB = 5MB
Share cards: 1,000 × 100KB = 100MB
Total: ~135MB
```

**Bottlenecks**:
- Share card generation (CPU-intensive)
- Reddit API rate limits
- Gemini API for AI Assistant

**Mitigation**:
- Use Vercel Functions for share card generation
- Implement aggressive caching
- Queue non-critical operations


## UI/UX Integration

### Results Screen Enhancement

**Before** (Current):
```
┌─────────────────────────────────────┐
│ ✅ 정답! Score: 92                  │
│ Grade: A                            │
│ [View Leaderboard]                  │
└─────────────────────────────────────┘
```

**After** (Enhanced):
```
┌─────────────────────────────────────────────────────┐
│ ✅ 정답! Score: 92 | Grade: A                       │
│                                                      │
│ 🎖️ Challenges Completed:                            │
│ ✅ 스피드 탐정 (9분 58초) → +5 AP                   │
│ ✅ 증거 수집가 (12/12) → Special Flair              │
│ ⬜ 셜록 연속 (3/7 days)                             │
│                                                      │
│ 🏆 Your Rank: #12 / 156 players                    │
│ 🕵️ Detective Level: 베테랑 탐정 (Lv.5)             │
│                                                      │
│ [📤 Share Achievement] [💬 Discuss] [📊 Leaderboard]│
└─────────────────────────────────────────────────────┘
```

### Investigation Screen Enhancement

**Add Community Insights Panel**:
```
┌─────────────────────────────────────────────────────┐
│ 🔍 Evidence: "독극물 병 발견"                        │
│ [📤 Share to Comments] [💬 Community Theories (23)] │
│                                                      │
│ 💡 Community Insights:                              │
│ ┌─────────────────────────────────────────────────┐│
│ │ 👥 45% suspect Suspect 1                        ││
│ │ 👥 32% suspect Suspect 2                        ││
│ │ 👥 23% suspect Suspect 3                        ││
│ │                                                  ││
│ │ 🔥 Top Theory (⬆️ 45):                          ││
│ │ "독극물 병의 지문이 용의자 1과 일치하지만,      ││
│ │  이것은 함정일 수 있습니다..."                   ││
│ │  - u/detective_kim                              ││
│ └─────────────────────────────────────────────────┘│
│                                                      │
│ 🤖 AI Assistant (Watson):                           │
│ [Analyze Evidence (-2 AP)]                          │
│ [Psychological Profile (-3 AP)]                     │
│ [Timeline Reconstruction (-5 AP)]                   │
└─────────────────────────────────────────────────────┘
```

### Profile Screen (NEW)

```
┌─────────────────────────────────────────────────────┐
│ 🕵️ Detective Profile                                │
│                                                      │
│ u/sherlock_kim                                      │
│ 🏆 베테랑 탐정 (Lv.5)                               │
│                                                      │
│ 📊 Statistics:                                      │
│ • Cases Played: 50                                  │
│ • Correct Answers: 30 (60%)                         │
│ • Average Score: 80                                 │
│ • Current Streak: 3 days                            │
│                                                      │
│ 🎖️ Badges:                                          │
│ [Speed Demon] [Evidence Master] [Community Builder] │
│                                                      │
│ 👥 Referrals: 12 friends                            │
│ Next Milestone: 13/25 for Master Recruiter          │
│                                                      │
│ 🔗 Invite Code: SHER2024                            │
│ [Copy Link] [Share on Reddit]                       │
└─────────────────────────────────────────────────────┘
```

## Deployment Strategy

### Phase 1: Reddit Integration (Day 1-2)

**Priority**: Critical for hackathon scoring

**Deliverables**:
- CommentService (share evidence, theories)
- FlairService (rank calculation, updates)
- LeaderboardService (post creation, pinning)

**Success Criteria**:
- Comments post successfully
- Flairs update within 5 seconds
- Leaderboard posts daily at midnight

### Phase 2: Viral Features (Day 3-4)

**Priority**: High for community engagement

**Deliverables**:
- ChallengeService (daily challenges)
- ShareCardGenerator (image generation)
- ReferralService (invite codes)

**Success Criteria**:
- Challenges complete correctly
- Share cards generate in < 5 seconds
- Referral rewards awarded properly

### Phase 3: Unique Features (Day 5-6)

**Priority**: Medium for innovation score

**Deliverables**:
- ColdCaseService (simplified 3-day version)
- AIAssistantService (basic hints only)

**Success Criteria**:
- Cold Case evidence releases daily
- AI Assistant provides helpful hints
- AP deduction works

### Phase 4: Polish & Demo (Day 7)

**Priority**: High for presentation

**Deliverables**:
- Demo video (2 minutes)
- README with metrics
- Bug fixes
- Performance optimization

**Success Criteria**:
- All features work smoothly
- No critical bugs
- Demo is compelling

## Monitoring & Metrics

### Key Metrics to Track

**Engagement**:
- Daily Active Users (DAU)
- Comments per case
- Share card generation count
- Crosspost count
- Referral conversion rate

**Retention**:
- Day 1, 3, 7 retention
- Average session time
- Cases per user
- Streak length

**Community**:
- Flair distribution
- Challenge completion rate
- Cold Case participation
- AI Assistant usage

**Technical**:
- API response times
- Reddit API success rate
- Share card generation time
- Error rates

### Dashboard (Admin View)

```
┌─────────────────────────────────────────────────────┐
│ 📊 Armchair Sleuths - Hackathon Metrics             │
│                                                      │
│ 👥 Users: 1,234 (+156 today)                        │
│ 🎮 Cases Played: 5,678 (+892 today)                 │
│ 💬 Comments: 2,345 (+412 today)                     │
│ 📤 Shares: 456 (+89 today)                          │
│                                                      │
│ 🏆 Top Detectives:                                  │
│ 1. u/sherlock_kim (Lv.10, 500 cases)               │
│ 2. u/detective_park (Lv.9, 450 cases)              │
│ 3. u/mystery_solver (Lv.8, 400 cases)              │
│                                                      │
│ 🔥 Viral Metrics:                                   │
│ • Share Card CTR: 12%                               │
│ • Referral Conversion: 8%                           │
│ • Comment Engagement: 30%                           │
│                                                      │
│ ⚡ Performance:                                      │
│ • Avg API Response: 245ms                           │
│ • Reddit API Success: 98.5%                         │
│ • Share Card Gen: 3.2s                              │
└─────────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0  
**Created:** 2025-01-24  
**Status:** Ready for Implementation  
**Estimated Effort:** 7 days (1 developer)
