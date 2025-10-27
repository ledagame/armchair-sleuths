# Reddit Viral Innovation - Design Document

## Overview

이 문서는 Armchair Sleuths의 바이럴 성장 기능들의 **상세 아키텍처, 데이터 모델, API 설계**를 정의합니다.

### Design Principles

1. **Reddit-Native Architecture**: Devvit API를 최대한 활용
2. **Fail-Safe Design**: 모든 외부 의존성에 Circuit Breaker 적용
3. **Scalable from Day 1**: Redis 기반 수평 확장 가능 구조
4. **Mobile-First UX**: 80% Reddit 유저가 모바일 사용
5. **Privacy-First**: 최소한의 개인정보만 수집

### Technology Stack

```
Frontend (Client):
├── React.JS (Devvit Web)
├── TypeScript (strict mode)
└── Tailwind CSS (responsive)

Backend (Server):
├── Express.js (Devvit Server)
├── Redis (Devvit KVStore)
├── Gemini API (AI generation)
└── Reddit API (Devvit SDK)

Infrastructure:
├── Devvit Scheduler (cron jobs)
├── Devvit Media API (images)
└── Circuit Breaker (resilience)
```

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Reddit Platform                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Comments  │  │   Flairs   │  │   Posts    │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
└────────┼────────────────┼────────────────┼──────────────────┘
         │                │                │
         │    Devvit SDK  │                │
         ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Armchair Sleuths Server                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Reddit Integration Layer                 │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │ Comment  │  │  Flair   │  │  Post    │           │   │
│  │  │ Service  │  │ Service  │  │ Service  │           │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘           │   │
│  └───────┼─────────────┼─────────────┼──────────────────┘   │
│          │             │             │                       │
│  ┌───────▼─────────────▼─────────────▼──────────────────┐   │
│  │              Core Game Services                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │Challenge │  │Leaderboard│ │ Watson  │           │   │
│  │  │ Service  │  │  Service  │  │ Service │           │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘           │   │
│  └───────┼─────────────┼─────────────┼──────────────────┘   │
│          │             │             │                       │
│  ┌───────▼─────────────▼─────────────▼──────────────────┐   │
│  │                 Data Layer                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │  Redis   │  │ Circuit  │  │  Cache   │           │   │
│  │  │  Store   │  │ Breaker  │  │  Layer   │           │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘           │   │
│  └───────┼─────────────┼─────────────┼──────────────────┘   │
└──────────┼─────────────┼─────────────┼────────────────────┘
           │             │             │
           ▼             ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │  Gemini  │  │  Reddit  │  │  Local   │
    │   API    │  │   API    │  │  Storage │
    └──────────┘  └──────────┘  └──────────┘
```


---

## Components and Interfaces

### 1. Reddit Integration Layer

#### 1.1 CommentService

**Purpose**: 증거 공유를 Reddit 댓글로 변환

**Interface**:
```typescript
interface CommentService {
  // 증거를 댓글로 공유
  shareEvidence(params: {
    postId: string
    userId: string
    evidenceId: string
    evidenceText: string
    evidenceImage?: string
  }): Promise<CommentResult>
  
  // 댓글 투표 수 조회
  getCommentVotes(commentId: string): Promise<number>
  
  // 인기 이론 댓글 조회
  getTopTheories(postId: string, limit: number): Promise<TheoryComment[]>
}

interface CommentResult {
  commentId: string
  permalink: string
  success: boolean
  error?: string
}

interface TheoryComment {
  commentId: string
  author: string
  text: string
  upvotes: number
  isCorrect?: boolean
}
```

**Implementation Details**:
```typescript
class RedditCommentService implements CommentService {
  constructor(
    private reddit: Devvit.Context['reddit'],
    private redis: Devvit.Context['redis']
  ) {}
  
  async shareEvidence(params): Promise<CommentResult> {
    try {
      // 1. 댓글 텍스트 포맷팅
      const commentText = this.formatEvidenceComment(params)
      
      // 2. Reddit API로 댓글 생성
      const comment = await this.reddit.submitComment({
        id: params.postId,
        text: commentText
      })
      
      // 3. Redis에 공유 기록 저장
      await this.redis.set(
        `evidence:shared:${params.evidenceId}`,
        JSON.stringify({
          commentId: comment.id,
          userId: params.userId,
          timestamp: Date.now()
        }),
        { expiration: 86400 * 30 } // 30일 TTL
      )
      
      // 4. 공유 카운트 증가
      await this.redis.incrBy(`user:${params.userId}:shares`, 1)
      
      return {
        commentId: comment.id,
        permalink: comment.permalink,
        success: true
      }
    } catch (error) {
      return {
        commentId: '',
        permalink: '',
        success: false,
        error: error.message
      }
    }
  }
  
  private formatEvidenceComment(params): string {
    return `
🔍 **Evidence Discovered**

${params.evidenceText}

${params.evidenceImage ? `[View Evidence](${params.evidenceImage})` : ''}

---
*Shared by Detective u/${params.userId} | Upvote if this helps!*
    `.trim()
  }
}
```

**Error Handling**:
- Reddit API 실패 시: 로컬에 저장 후 재시도 (Circuit Breaker)
- Rate Limit 초과 시: 유저에게 "Too many shares, try again in 1 minute" 메시지
- 네트워크 오류 시: Offline Mode로 전환


#### 1.2 FlairService

**Purpose**: 탐정 등급을 Reddit Flair로 표시

**Interface**:
```typescript
interface FlairService {
  // 유저 등급 계산 및 Flair 업데이트
  updateUserRank(userId: string): Promise<RankUpdate>
  
  // 현재 등급 조회
  getUserRank(userId: string): Promise<DetectiveRank>
  
  // 등급 업 축하 댓글 생성
  celebrateRankUp(userId: string, newRank: DetectiveRank): Promise<void>
}

interface DetectiveRank {
  level: number // 1-10
  title: string // "신참 형사", "명탐정" 등
  emoji: string // "🔍", "👑" 등
  casesRequired: number
  accuracyRequired: number
}

interface RankUpdate {
  previousRank: DetectiveRank
  currentRank: DetectiveRank
  isRankUp: boolean
}
```

**Rank Calculation Logic**:
```typescript
class RedditFlairService implements FlairService {
  private RANK_THRESHOLDS: DetectiveRank[] = [
    { level: 1, title: '신참 형사', emoji: '🔍', casesRequired: 0, accuracyRequired: 0 },
    { level: 2, title: '신참 형사', emoji: '🔍', casesRequired: 5, accuracyRequired: 50 },
    { level: 3, title: '수사관', emoji: '🕵️', casesRequired: 10, accuracyRequired: 60 },
    { level: 4, title: '수사관', emoji: '🕵️', casesRequired: 20, accuracyRequired: 65 },
    { level: 5, title: '베테랑 탐정', emoji: '🎩', casesRequired: 35, accuracyRequired: 70 },
    { level: 6, title: '베테랑 탐정', emoji: '🎩', casesRequired: 50, accuracyRequired: 75 },
    { level: 7, title: '명탐정', emoji: '🏆', casesRequired: 75, accuracyRequired: 80 },
    { level: 8, title: '명탐정', emoji: '🏆', casesRequired: 100, accuracyRequired: 85 },
    { level: 9, title: '셜록 홈즈', emoji: '👑', casesRequired: 150, accuracyRequired: 90 },
    { level: 10, title: '셜록 홈즈', emoji: '👑', casesRequired: 250, accuracyRequired: 95 }
  ]
  
  async updateUserRank(userId: string): Promise<RankUpdate> {
    // 1. 유저 통계 조회
    const stats = await this.getUserStats(userId)
    
    // 2. 현재 등급 계산
    const currentRank = this.calculateRank(stats)
    
    // 3. 이전 등급 조회
    const previousRank = await this.redis.get(`user:${userId}:rank`)
    
    // 4. Flair 업데이트
    if (!previousRank || currentRank.level > previousRank.level) {
      await this.reddit.setUserFlair({
        subredditName: 'armchair_sleuths',
        username: userId,
        text: `${currentRank.emoji} ${currentRank.title} (Lv.${currentRank.level})`,
        cssClass: `rank-${currentRank.level}`
      })
      
      // 5. Redis에 새 등급 저장
      await this.redis.set(
        `user:${userId}:rank`,
        JSON.stringify(currentRank),
        { expiration: 86400 * 365 } // 1년 TTL
      )
    }
    
    return {
      previousRank: previousRank || this.RANK_THRESHOLDS[0],
      currentRank,
      isRankUp: currentRank.level > (previousRank?.level || 0)
    }
  }
  
  private calculateRank(stats: UserStats): DetectiveRank {
    const { casesPlayed, correctAnswers } = stats
    const accuracy = (correctAnswers / casesPlayed) * 100
    
    // 역순으로 검사 (높은 등급부터)
    for (let i = this.RANK_THRESHOLDS.length - 1; i >= 0; i--) {
      const rank = this.RANK_THRESHOLDS[i]
      if (casesPlayed >= rank.casesRequired && accuracy >= rank.accuracyRequired) {
        return rank
      }
    }
    
    return this.RANK_THRESHOLDS[0] // 기본 등급
  }
}
```

**CSS Styling** (Devvit supports custom CSS):
```css
.rank-1, .rank-2 { color: #808080; } /* Gray */
.rank-3, .rank-4 { color: #4169E1; } /* Blue */
.rank-5, .rank-6 { color: #9370DB; } /* Purple */
.rank-7, .rank-8 { color: #FFD700; } /* Gold */
.rank-9, .rank-10 { color: #FF4500; } /* Reddit Orange */
```


#### 1.3 LeaderboardService

**Purpose**: 일일 리더보드를 Reddit 포스트로 관리

**Interface**:
```typescript
interface LeaderboardService {
  // 리더보드 포스트 생성
  createDailyLeaderboard(caseId: string): Promise<string> // postId
  
  // 리더보드 업데이트 (10분마다)
  updateLeaderboard(postId: string): Promise<void>
  
  // 리더보드 마감 및 우승자 발표
  finalizeLeaderboard(postId: string): Promise<void>
  
  // 상위 N명 조회
  getTopDetectives(caseId: string, limit: number): Promise<LeaderboardEntry[]>
}

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  score: number
  completionTime: number // milliseconds
  badges: string[] // ["⚡", "🔍", "🎯"]
}
```

**Implementation**:
```typescript
class RedditLeaderboardService implements LeaderboardService {
  async createDailyLeaderboard(caseId: string): Promise<string> {
    const caseTitle = await this.getCaseTitle(caseId)
    
    const post = await this.reddit.submitPost({
      title: `🏆 ${caseTitle} - Top Detectives`,
      subredditName: 'armchair_sleuths',
      text: this.formatLeaderboard([], caseTitle),
      preview: this.generatePreview(caseTitle)
    })
    
    // 포스트를 2번 위치에 고정
    await this.reddit.sticky(post.id, { num: 2 })
    
    // Redis에 포스트 ID 저장
    await this.redis.set(
      `leaderboard:${caseId}:postId`,
      post.id,
      { expiration: 86400 } // 24시간 TTL
    )
    
    return post.id
  }
  
  async updateLeaderboard(postId: string): Promise<void> {
    try {
      // 1. 상위 10명 조회
      const topDetectives = await this.getTopDetectives(caseId, 10)
      
      // 2. 리더보드 텍스트 생성
      const leaderboardText = this.formatLeaderboard(topDetectives, caseTitle)
      
      // 3. 포스트 업데이트
      await this.reddit.editPost({
        id: postId,
        text: leaderboardText
      })
      
      // 4. 마지막 업데이트 시간 기록
      await this.redis.set(
        `leaderboard:${postId}:lastUpdate`,
        Date.now().toString(),
        { expiration: 86400 }
      )
    } catch (error) {
      console.error('Leaderboard update failed:', error)
      // Circuit Breaker: 3회 연속 실패 시 업데이트 중단
      await this.circuitBreaker.recordFailure('leaderboard_update')
    }
  }
  
  private formatLeaderboard(entries: LeaderboardEntry[], caseTitle: string): string {
    const header = `# 🏆 ${caseTitle} - Top Detectives\n\n`
    const timestamp = `*Last updated: ${new Date().toLocaleTimeString('en-US')} UTC*\n\n`
    
    if (entries.length === 0) {
      return header + timestamp + '🔍 No submissions yet. Be the first detective!\n\n[Play Today\'s Case](https://reddit.com/r/armchair_sleuths)'
    }
    
    const rows = entries.map((entry, index) => {
      const medal = index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
      const time = this.formatTime(entry.completionTime)
      const badges = entry.badges.join(' ')
      
      return `${medal} u/${entry.username} - **${entry.score}** points (${time}) ${badges}`
    }).join('\n')
    
    return header + timestamp + rows + '\n\n---\n\n[View Full Leaderboard](https://reddit.com/r/armchair_sleuths/leaderboard) | [Play Today\'s Case](https://reddit.com/r/armchair_sleuths)'
  }
  
  private formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }
}
```

**Scheduler Configuration**:
```typescript
// Devvit Scheduler: 10분마다 리더보드 업데이트
Devvit.addSchedulerJob({
  name: 'update_leaderboard',
  cron: '*/10 * * * *', // Every 10 minutes
  async onRun(event, context) {
    const todayCaseId = await context.redis.get('case:today:id')
    const postId = await context.redis.get(`leaderboard:${todayCaseId}:postId`)
    
    if (postId) {
      const service = new RedditLeaderboardService(context.reddit, context.redis)
      await service.updateLeaderboard(postId)
    }
  }
})
```


---

### 2. Core Game Services

#### 2.1 ChallengeService

**Purpose**: 일일 챌린지 생성 및 검증

**Interface**:
```typescript
interface ChallengeService {
  // 오늘의 챌린지 생성
  generateDailyChallenges(caseId: string): Promise<Challenge[]>
  
  // 챌린지 완료 체크
  checkChallengeCompletion(userId: string, challengeId: string, submission: Submission): Promise<boolean>
  
  // 유저의 챌린지 진행 상황
  getUserChallenges(userId: string, caseId: string): Promise<UserChallenge[]>
  
  // 연속 달성 기록 조회
  getStreak(userId: string): Promise<number>
}

interface Challenge {
  id: string
  type: 'speed' | 'evidence' | 'perfect' | 'streak' | 'community'
  title: string
  description: string
  requirement: ChallengeRequirement
  reward: ChallengeReward
}

interface ChallengeRequirement {
  type: string
  value: number | string
  operator: '>' | '<' | '=' | '>=' | '<='
}

interface ChallengeReward {
  ap: number
  badge: string
  title?: string
}

interface UserChallenge {
  challenge: Challenge
  completed: boolean
  progress: number // 0-100
  completedAt?: number
}
```

**Challenge Types Implementation**:
```typescript
class GameChallengeService implements ChallengeService {
  private CHALLENGE_TEMPLATES: Challenge[] = [
    {
      id: 'speed_demon',
      type: 'speed',
      title: '⚡ Speed Demon',
      description: 'Submit correct answer in under 10 minutes',
      requirement: { type: 'completionTime', value: 600000, operator: '<' },
      reward: { ap: 10, badge: '⚡' }
    },
    {
      id: 'evidence_master',
      type: 'evidence',
      title: '🔍 Evidence Master',
      description: 'Find all evidence items',
      requirement: { type: 'evidenceFound', value: 100, operator: '=' },
      reward: { ap: 5, badge: '🔍' }
    },
    {
      id: 'perfect_score',
      type: 'perfect',
      title: '🎯 Perfect Score',
      description: 'Score 95+ points',
      requirement: { type: 'score', value: 95, operator: '>=' },
      reward: { ap: 15, badge: '🎯' }
    },
    {
      id: 'streak_master',
      type: 'streak',
      title: '🔥 Streak Master',
      description: '7-day correct answer streak',
      requirement: { type: 'streak', value: 7, operator: '>=' },
      reward: { ap: 50, badge: '🔥', title: 'Streak Master' }
    },
    {
      id: 'community_helper',
      type: 'community',
      title: '💬 Community Helper',
      description: 'Share 3+ evidence in comments',
      requirement: { type: 'evidenceShared', value: 3, operator: '>=' },
      reward: { ap: 5, badge: '💬' }
    }
  ]
  
  async generateDailyChallenges(caseId: string): Promise<Challenge[]> {
    // 매일 3개 챌린지 선택 (Speed + Evidence + Random)
    const challenges = [
      this.CHALLENGE_TEMPLATES[0], // Speed Demon (항상)
      this.CHALLENGE_TEMPLATES[1], // Evidence Master (항상)
      this.CHALLENGE_TEMPLATES[Math.floor(Math.random() * 3) + 2] // Random
    ]
    
    // Redis에 저장
    await this.redis.set(
      `challenges:${caseId}`,
      JSON.stringify(challenges),
      { expiration: 86400 } // 24시간 TTL
    )
    
    return challenges
  }
  
  async checkChallengeCompletion(
    userId: string,
    challengeId: string,
    submission: Submission
  ): Promise<boolean> {
    const challenge = this.CHALLENGE_TEMPLATES.find(c => c.id === challengeId)
    if (!challenge) return false
    
    const { requirement } = challenge
    const value = this.extractValue(submission, requirement.type)
    
    const completed = this.evaluateRequirement(value, requirement)
    
    if (completed) {
      // 보상 지급
      await this.rewardUser(userId, challenge.reward)
      
      // 완료 기록
      await this.redis.set(
        `user:${userId}:challenge:${challengeId}:completed`,
        Date.now().toString(),
        { expiration: 86400 * 365 }
      )
    }
    
    return completed
  }
  
  private evaluateRequirement(value: number, req: ChallengeRequirement): boolean {
    switch (req.operator) {
      case '>': return value > req.value
      case '<': return value < req.value
      case '=': return value === req.value
      case '>=': return value >= req.value
      case '<=': return value <= req.value
      default: return false
    }
  }
  
  async getStreak(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0]
    let streak = 0
    let currentDate = new Date()
    
    // 역순으로 연속 정답 체크
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const caseId = await this.redis.get(`case:${dateStr}:id`)
      
      if (!caseId) break
      
      const submission = await this.redis.get(`submission:${userId}:${caseId}`)
      if (!submission || !JSON.parse(submission).isCorrect) break
      
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }
    
    return streak
  }
}
```


#### 2.2 WatsonService (AI Detective Assistant)

**Purpose**: Gemini API를 활용한 AI 힌트 제공

**Interface**:
```typescript
interface WatsonService {
  // 힌트 요청
  askWatson(params: {
    userId: string
    caseId: string
    question: string
    hintLevel: 'subtle' | 'analysis' | 'insight'
  }): Promise<WatsonResponse>
  
  // 남은 질문 횟수 조회
  getRemainingQuestions(userId: string, caseId: string): Promise<number>
}

interface WatsonResponse {
  hint: string
  apCost: number
  questionsRemaining: number
  success: boolean
  error?: string
}
```

**Implementation**:
```typescript
class GeminiWatsonService implements WatsonService {
  private HINT_COSTS = {
    subtle: 2,
    analysis: 3,
    insight: 5
  }
  
  private MAX_QUESTIONS_PER_CASE = 3
  
  async askWatson(params): Promise<WatsonResponse> {
    const { userId, caseId, question, hintLevel } = params
    
    // 1. 남은 질문 횟수 체크
    const questionsUsed = await this.getQuestionsUsed(userId, caseId)
    if (questionsUsed >= this.MAX_QUESTIONS_PER_CASE) {
      return {
        hint: '',
        apCost: 0,
        questionsRemaining: 0,
        success: false,
        error: 'No questions remaining for this case'
      }
    }
    
    // 2. AP 체크 및 차감
    const apCost = this.HINT_COSTS[hintLevel]
    const hasEnoughAP = await this.deductAP(userId, apCost)
    if (!hasEnoughAP) {
      return {
        hint: '',
        apCost: 0,
        questionsRemaining: this.MAX_QUESTIONS_PER_CASE - questionsUsed,
        success: false,
        error: 'Not enough AP'
      }
    }
    
    // 3. 케이스 정보 조회
    const caseData = await this.getCaseData(caseId)
    
    // 4. Gemini API 호출
    const hint = await this.generateHint(caseData, question, hintLevel)
    
    // 5. 질문 사용 기록
    await this.redis.incrBy(`user:${userId}:case:${caseId}:questions`, 1)
    
    return {
      hint,
      apCost,
      questionsRemaining: this.MAX_QUESTIONS_PER_CASE - questionsUsed - 1,
      success: true
    }
  }
  
  private async generateHint(
    caseData: CaseData,
    question: string,
    hintLevel: string
  ): Promise<string> {
    const systemPrompt = this.getSystemPrompt(hintLevel)
    const userPrompt = this.getUserPrompt(caseData, question)
    
    try {
      const response = await this.geminiAPI.generateContent({
        model: 'gemini-pro',
        contents: [{
          role: 'user',
          parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
          topP: 0.8
        }
      })
      
      return response.text()
    } catch (error) {
      // Circuit Breaker: Gemini API 실패 시 미리 작성된 힌트 사용
      return this.getFallbackHint(caseData, hintLevel)
    }
  }
  
  private getSystemPrompt(hintLevel: string): string {
    const prompts = {
      subtle: `You are Watson, a cryptic detective assistant. Give VERY subtle hints that guide without revealing the answer. Use questions and observations, not direct answers. Maximum 2 sentences.`,
      
      analysis: `You are Watson, an analytical detective assistant. Analyze the evidence and point out interesting patterns or inconsistencies. Don't reveal the killer, but highlight important clues. Maximum 3 sentences.`,
      
      insight: `You are Watson, an insightful detective assistant. Provide a deeper analysis of one suspect's behavior or alibi. Point out a critical flaw or connection, but don't name the killer directly. Maximum 4 sentences.`
    }
    
    return prompts[hintLevel]
  }
  
  private getUserPrompt(caseData: CaseData, question: string): string {
    return `
Case: ${caseData.title}
Victim: ${caseData.victim.name}
Suspects: ${caseData.suspects.map(s => s.name).join(', ')}

Detective's Question: ${question}

Provide a cryptic hint that helps without spoiling the mystery.
    `.trim()
  }
  
  private getFallbackHint(caseData: CaseData, hintLevel: string): string {
    // Gemini API 실패 시 사용할 미리 작성된 힌트
    const fallbacks = {
      subtle: "Consider the timeline carefully. Not everything is as it seems...",
      analysis: "The evidence tells a story, but some pieces don't quite fit. Look for inconsistencies in the alibis.",
      insight: "One suspect's behavior after the crime is particularly revealing. Why would an innocent person act that way?"
    }
    
    return fallbacks[hintLevel]
  }
}
```

**UI Integration**:
```typescript
// Client-side Watson UI
function WatsonAssistant({ caseId }: { caseId: string }) {
  const [question, setQuestion] = useState('')
  const [hint, setHint] = useState('')
  const [questionsRemaining, setQuestionsRemaining] = useState(3)
  
  const askWatson = async (hintLevel: string) => {
    const response = await fetch('/api/watson/ask', {
      method: 'POST',
      body: JSON.stringify({ caseId, question, hintLevel })
    })
    
    const data = await response.json()
    if (data.success) {
      setHint(data.hint)
      setQuestionsRemaining(data.questionsRemaining)
    }
  }
  
  return (
    <div className="watson-assistant">
      <h3>🤖 Ask Watson</h3>
      <p>Questions remaining: {questionsRemaining}/3</p>
      
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="What would you like to know?"
      />
      
      <div className="hint-buttons">
        <button onClick={() => askWatson('subtle')}>
          💡 Subtle Hint (2 AP)
        </button>
        <button onClick={() => askWatson('analysis')}>
          🔍 Evidence Analysis (3 AP)
        </button>
        <button onClick={() => askWatson('insight')}>
          🎯 Suspect Insight (5 AP)
        </button>
      </div>
      
      {hint && (
        <div className="watson-hint">
          <p><strong>Watson says:</strong></p>
          <p>{hint}</p>
        </div>
      )}
    </div>
  )
}
```


---

## Data Models

### Redis Key Structure

```typescript
// User Data
`user:{userId}:rank` → JSON<DetectiveRank>
`user:{userId}:ap` → number
`user:{userId}:shares` → number
`user:{userId}:referralCode` → string
`user:{userId}:referredBy` → string
`user:{userId}:streak` → number

// Case Data
`case:today:id` → string (caseId)
`case:{caseId}:data` → JSON<CaseData>
`case:{caseId}:submissions` → Set<userId>
`case:{date}:id` → string (caseId for specific date)

// Leaderboard
`leaderboard:{caseId}:postId` → string
`leaderboard:{caseId}:entries` → SortedSet<score, userId>
`leaderboard:{caseId}:lastUpdate` → timestamp

// Challenges
`challenges:{caseId}` → JSON<Challenge[]>
`user:{userId}:challenge:{challengeId}:completed` → timestamp
`user:{userId}:case:{caseId}:questions` → number (Watson questions used)

// Evidence Sharing
`evidence:shared:{evidenceId}` → JSON<{ commentId, userId, timestamp }>
`comment:{commentId}:votes` → number

// Referrals
`referral:{code}:userId` → string
`user:{userId}:referrals` → Set<referredUserId>

// Circuit Breaker
`circuit:{service}:failures` → number
`circuit:{service}:lastFailure` → timestamp
`circuit:{service}:state` → 'closed' | 'open' | 'half-open'

// Archive
`archive:cases` → SortedSet<timestamp, caseId>
`archive:case:{caseId}` → JSON<CaseData>
```

### TTL Policies

```typescript
const TTL_POLICIES = {
  // Active data (no expiration)
  userRank: null,
  userAP: null,
  
  // Daily data (24 hours)
  todayCase: 86400,
  leaderboard: 86400,
  challenges: 86400,
  
  // Weekly data (7 days)
  submissions: 604800,
  evidenceShares: 604800,
  
  // Monthly data (30 days)
  referralCodes: 2592000,
  watsonQuestions: 2592000,
  
  // Yearly data (365 days)
  challengeCompletions: 31536000,
  rankHistory: 31536000,
  
  // Archive (90-365 days based on age)
  recentCases: 7776000, // 90 days
  oldCases: 31536000 // 365 days
}
```

### Data Model Interfaces

```typescript
interface CaseData {
  id: string
  title: string
  createdAt: number
  victim: {
    name: string
    age: number
    occupation: string
    imageUrl: string
  }
  suspects: Suspect[]
  evidence: Evidence[]
  solution: {
    killerId: string
    motive: string
    method: string
    timeline: string
  }
  _version: number // For schema migration
}

interface Suspect {
  id: string
  name: string
  age: number
  occupation: string
  relationship: string
  alibi: string
  imageUrl: string
  personality: string
  isGuilty: boolean
}

interface Evidence {
  id: string
  type: 'physical' | 'testimony' | 'document' | 'forensic'
  title: string
  description: string
  imageUrl?: string
  location: string
  discoveredBy?: string
  significance: 'low' | 'medium' | 'high'
}

interface Submission {
  userId: string
  caseId: string
  suspectId: string
  reasoning: string
  score: number
  isCorrect: boolean
  completionTime: number
  evidenceFound: number
  submittedAt: number
  _version: number
}

interface UserStats {
  userId: string
  casesPlayed: number
  correctAnswers: number
  totalScore: number
  averageScore: number
  fastestTime: number
  currentStreak: number
  longestStreak: number
  evidenceShared: number
  referrals: number
  _version: number
}
```


---

## Error Handling

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failureThreshold = 3
  private resetTimeout = 60000 // 1 minute
  
  async execute<T>(
    serviceName: string,
    operation: () => Promise<T>,
    fallback: () => T
  ): Promise<T> {
    const state = await this.getState(serviceName)
    
    if (state === 'open') {
      // Circuit is open, use fallback immediately
      console.log(`Circuit breaker OPEN for ${serviceName}, using fallback`)
      return fallback()
    }
    
    try {
      const result = await operation()
      
      // Success: reset failure count
      await this.redis.del(`circuit:${serviceName}:failures`)
      await this.redis.set(`circuit:${serviceName}:state`, 'closed')
      
      return result
    } catch (error) {
      // Failure: increment counter
      const failures = await this.redis.incrBy(`circuit:${serviceName}:failures`, 1)
      await this.redis.set(`circuit:${serviceName}:lastFailure`, Date.now())
      
      if (failures >= this.failureThreshold) {
        // Open the circuit
        await this.redis.set(`circuit:${serviceName}:state`, 'open')
        console.error(`Circuit breaker OPENED for ${serviceName}`)
        
        // Schedule reset
        setTimeout(() => this.attemptReset(serviceName), this.resetTimeout)
      }
      
      return fallback()
    }
  }
  
  private async attemptReset(serviceName: string): Promise<void> {
    await this.redis.set(`circuit:${serviceName}:state`, 'half-open')
    // Next request will test if service recovered
  }
  
  private async getState(serviceName: string): Promise<string> {
    const state = await this.redis.get(`circuit:${serviceName}:state`)
    return state || 'closed'
  }
}
```

### Error Scenarios and Handling

#### 1. Reddit API Failures

**Scenario**: Comment creation fails due to rate limit

**Handling**:
```typescript
async shareEvidence(params): Promise<CommentResult> {
  return await this.circuitBreaker.execute(
    'reddit_comments',
    async () => {
      // Try Reddit API
      const comment = await this.reddit.submitComment(params)
      return { success: true, commentId: comment.id }
    },
    () => {
      // Fallback: Save locally and queue for retry
      this.queueForRetry(params)
      return {
        success: false,
        error: 'Reddit is experiencing high traffic. Your share will be posted shortly.'
      }
    }
  )
}
```

#### 2. Gemini API Failures

**Scenario**: Watson hint generation fails

**Handling**:
```typescript
async generateHint(caseData, question, hintLevel): Promise<string> {
  return await this.circuitBreaker.execute(
    'gemini_api',
    async () => {
      // Try Gemini API
      return await this.geminiAPI.generateContent(...)
    },
    () => {
      // Fallback: Pre-written hints
      return this.getFallbackHint(caseData, hintLevel)
    }
  )
}
```

#### 3. Redis Connection Loss

**Scenario**: Redis becomes unavailable

**Handling**:
```typescript
class ResilientRedisClient {
  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key)
    } catch (error) {
      console.error('Redis get failed:', error)
      // Fallback to in-memory cache
      return this.memoryCache.get(key) || null
    }
  }
  
  async set(key: string, value: string, options?: any): Promise<void> {
    try {
      await this.redis.set(key, value, options)
      // Also update memory cache
      this.memoryCache.set(key, value)
    } catch (error) {
      console.error('Redis set failed:', error)
      // Only update memory cache
      this.memoryCache.set(key, value)
      // Queue for retry when Redis recovers
      this.retryQueue.push({ operation: 'set', key, value, options })
    }
  }
}
```

#### 4. Case Generation Failures

**Scenario**: Daily case generation fails

**Handling**:
```typescript
async generateDailyCase(): Promise<CaseData> {
  return await this.circuitBreaker.execute(
    'case_generation',
    async () => {
      // Try Gemini API
      return await this.geminiCaseGenerator.generate()
    },
    () => {
      // Fallback: Use pre-generated backup cases
      return this.getBackupCase()
    }
  )
}

private async getBackupCase(): Promise<CaseData> {
  // 10 hand-crafted backup cases stored in Redis
  const backupCases = await this.redis.get('backup:cases')
  const cases = JSON.parse(backupCases)
  const randomIndex = Math.floor(Math.random() * cases.length)
  return cases[randomIndex]
}
```

### Error Messages (User-Facing)

```typescript
const ERROR_MESSAGES = {
  // Reddit API
  RATE_LIMIT: '🚦 Too many actions! Please wait a moment and try again.',
  COMMENT_FAILED: '💬 Comment posting delayed. Your share will appear shortly!',
  FLAIR_FAILED: '🏷️ Rank update delayed. Your progress is saved!',
  
  // Gemini API
  WATSON_UNAVAILABLE: '🤖 Watson is thinking deeply... Try again in a moment!',
  CASE_GEN_FAILED: '📚 Today\'s case is from our Classic Collection!',
  
  // Redis
  DATA_SAVE_FAILED: '💾 Progress saved locally. Will sync when connection improves.',
  LEADERBOARD_STALE: '📊 Leaderboard updating... Refresh in a moment!',
  
  // General
  NETWORK_ERROR: '🌐 Connection issue detected. Switching to Offline Mode...',
  UNKNOWN_ERROR: '❓ Something unexpected happened. Our team is investigating!'
}
```


---

## Testing Strategy

### Unit Testing

**Test Coverage Goals**: 80%+ for core services

```typescript
// Example: ChallengeService unit tests
describe('ChallengeService', () => {
  let service: ChallengeService
  let mockRedis: MockRedis
  
  beforeEach(() => {
    mockRedis = new MockRedis()
    service = new GameChallengeService(mockRedis)
  })
  
  describe('checkChallengeCompletion', () => {
    it('should complete Speed Demon challenge when time < 10 minutes', async () => {
      const submission = {
        completionTime: 540000, // 9 minutes
        score: 85,
        isCorrect: true
      }
      
      const completed = await service.checkChallengeCompletion(
        'user123',
        'speed_demon',
        submission
      )
      
      expect(completed).toBe(true)
      expect(mockRedis.get('user:user123:ap')).toBe(10) // Reward given
    })
    
    it('should NOT complete Speed Demon when time > 10 minutes', async () => {
      const submission = {
        completionTime: 660000, // 11 minutes
        score: 85,
        isCorrect: true
      }
      
      const completed = await service.checkChallengeCompletion(
        'user123',
        'speed_demon',
        submission
      )
      
      expect(completed).toBe(false)
    })
  })
  
  describe('getStreak', () => {
    it('should calculate correct streak', async () => {
      // Mock 5 consecutive correct answers
      mockRedis.set('case:2025-01-20:id', 'case1')
      mockRedis.set('submission:user123:case1', JSON.stringify({ isCorrect: true }))
      // ... (4 more days)
      
      const streak = await service.getStreak('user123')
      expect(streak).toBe(5)
    })
    
    it('should break streak on incorrect answer', async () => {
      mockRedis.set('case:2025-01-20:id', 'case1')
      mockRedis.set('submission:user123:case1', JSON.stringify({ isCorrect: false }))
      
      const streak = await service.getStreak('user123')
      expect(streak).toBe(0)
    })
  })
})
```

### Integration Testing

**Test Reddit API Integration**:
```typescript
describe('CommentService Integration', () => {
  it('should create comment and update Redis', async () => {
    const service = new RedditCommentService(realReddit, realRedis)
    
    const result = await service.shareEvidence({
      postId: 'test_post',
      userId: 'test_user',
      evidenceId: 'evidence_1',
      evidenceText: 'Found fingerprints on the weapon'
    })
    
    expect(result.success).toBe(true)
    expect(result.commentId).toBeTruthy()
    
    // Verify Redis was updated
    const shareRecord = await realRedis.get('evidence:shared:evidence_1')
    expect(shareRecord).toBeTruthy()
  })
})
```

### End-to-End Testing

**User Flow Tests**:
```typescript
describe('Complete Game Flow', () => {
  it('should complete full detective journey', async () => {
    // 1. User opens game
    const gameState = await loadGame('user123')
    expect(gameState.todayCase).toBeTruthy()
    
    // 2. User discovers evidence
    const evidence = await discoverEvidence('evidence_1')
    expect(evidence.discovered).toBe(true)
    
    // 3. User shares evidence
    const shareResult = await shareEvidence('evidence_1')
    expect(shareResult.success).toBe(true)
    
    // 4. User asks Watson
    const hint = await askWatson('Who is the killer?', 'subtle')
    expect(hint).toBeTruthy()
    
    // 5. User submits answer
    const submission = await submitAnswer('suspect_2')
    expect(submission.isCorrect).toBe(true)
    
    // 6. User checks leaderboard
    const leaderboard = await getLeaderboard()
    expect(leaderboard.entries).toContainEqual(
      expect.objectContaining({ userId: 'user123' })
    )
    
    // 7. User rank updated
    const rank = await getUserRank('user123')
    expect(rank.level).toBeGreaterThan(1)
  })
})
```

### Performance Testing

**Load Testing Scenarios**:
```typescript
describe('Performance Tests', () => {
  it('should handle 1000 concurrent submissions', async () => {
    const submissions = Array(1000).fill(null).map((_, i) => ({
      userId: `user${i}`,
      caseId: 'case_today',
      suspectId: 'suspect_1'
    }))
    
    const startTime = Date.now()
    await Promise.all(submissions.map(s => submitAnswer(s)))
    const endTime = Date.now()
    
    const duration = endTime - startTime
    expect(duration).toBeLessThan(5000) // < 5 seconds
  })
  
  it('should update leaderboard efficiently', async () => {
    const startTime = Date.now()
    await updateLeaderboard('case_today')
    const endTime = Date.now()
    
    const duration = endTime - startTime
    expect(duration).toBeLessThan(1000) // < 1 second
  })
})
```

### Circuit Breaker Testing

```typescript
describe('Circuit Breaker', () => {
  it('should open circuit after 3 failures', async () => {
    const breaker = new CircuitBreaker()
    
    // Simulate 3 failures
    for (let i = 0; i < 3; i++) {
      await breaker.execute(
        'test_service',
        async () => { throw new Error('Service down') },
        () => 'fallback'
      )
    }
    
    const state = await breaker.getState('test_service')
    expect(state).toBe('open')
  })
  
  it('should use fallback when circuit is open', async () => {
    const breaker = new CircuitBreaker()
    await breaker.setState('test_service', 'open')
    
    const result = await breaker.execute(
      'test_service',
      async () => 'real_value',
      () => 'fallback_value'
    )
    
    expect(result).toBe('fallback_value')
  })
})
```


---

## Mobile Optimization

### Responsive Design Principles

**Target**: 80% of Reddit users are on mobile

#### 1. Touch-Friendly UI

```typescript
// Button sizes: minimum 44x44px (iOS guideline)
const TOUCH_TARGET_SIZE = {
  minimum: 44, // px
  comfortable: 56, // px
  large: 72 // px
}

// Spacing for fat fingers
const MOBILE_SPACING = {
  betweenButtons: 16, // px
  edgePadding: 20, // px
  contentMargin: 16 // px
}
```

#### 2. Mobile-First CSS

```css
/* Base styles for mobile */
.evidence-card {
  width: 100%;
  padding: 16px;
  margin-bottom: 12px;
  font-size: 16px; /* Prevent zoom on iOS */
}

.share-button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
  font-size: 16px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .evidence-card {
    width: 48%;
    display: inline-block;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .evidence-card {
    width: 32%;
  }
}
```

#### 3. Performance Optimization

```typescript
// Lazy load images
function EvidenceImage({ src, alt }: { src: string, alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  )
}

// Reduce bundle size
import { lazy, Suspense } from 'react'

const WatsonAssistant = lazy(() => import('./WatsonAssistant'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WatsonAssistant />
    </Suspense>
  )
}
```

#### 4. Offline Support

```typescript
// Service Worker for offline caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('armchair-sleuths-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/styles.css',
        '/app.js',
        '/offline.html'
      ])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
```

---

## Security Considerations

### 1. Anti-Cheat Measures

```typescript
class AntiCheatService {
  // Prevent rapid submissions
  async checkSubmissionRate(userId: string): Promise<boolean> {
    const lastSubmission = await this.redis.get(`user:${userId}:lastSubmission`)
    if (lastSubmission) {
      const timeSince = Date.now() - parseInt(lastSubmission)
      if (timeSince < 60000) { // < 1 minute
        return false // Too fast, likely cheating
      }
    }
    
    await this.redis.set(`user:${userId}:lastSubmission`, Date.now().toString())
    return true
  }
  
  // Detect impossible completion times
  async validateCompletionTime(time: number, caseId: string): Promise<boolean> {
    const minPossibleTime = 120000 // 2 minutes minimum
    if (time < minPossibleTime) {
      await this.flagSuspiciousActivity('impossible_time', { time, caseId })
      return false
    }
    return true
  }
  
  // Prevent referral abuse
  async validateReferral(referrerId: string, refereeId: string): Promise<boolean> {
    // Check account age
    const accountAge = await this.getAccountAge(refereeId)
    if (accountAge < 7 * 86400) { // < 7 days
      return false
    }
    
    // Check if same IP (requires additional tracking)
    // Check if referee has played at least 1 case
    const casesPlayed = await this.redis.get(`user:${refereeId}:casesPlayed`)
    if (!casesPlayed || parseInt(casesPlayed) < 1) {
      return false
    }
    
    return true
  }
}
```

### 2. Rate Limiting

```typescript
class RateLimiter {
  async checkLimit(userId: string, action: string): Promise<boolean> {
    const limits = {
      shareEvidence: { max: 10, window: 3600 }, // 10 per hour
      askWatson: { max: 3, window: 86400 }, // 3 per day
      submitAnswer: { max: 5, window: 3600 } // 5 per hour
    }
    
    const limit = limits[action]
    const key = `ratelimit:${userId}:${action}`
    
    const current = await this.redis.get(key)
    if (current && parseInt(current) >= limit.max) {
      return false // Rate limit exceeded
    }
    
    await this.redis.incrBy(key, 1)
    await this.redis.expire(key, limit.window)
    return true
  }
}
```

### 3. Input Validation

```typescript
function validateSubmission(submission: any): ValidationResult {
  const errors: string[] = []
  
  // Required fields
  if (!submission.suspectId) errors.push('Suspect ID required')
  if (!submission.reasoning) errors.push('Reasoning required')
  
  // Length limits
  if (submission.reasoning.length > 1000) {
    errors.push('Reasoning too long (max 1000 characters)')
  }
  
  // Sanitize HTML
  submission.reasoning = sanitizeHtml(submission.reasoning, {
    allowedTags: [], // No HTML allowed
    allowedAttributes: {}
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
```

---

## Deployment Strategy

### Phase 1: Soft Launch (Day 1-3)
- Deploy to r/armchair_sleuths_beta (private subreddit)
- Invite 50 beta testers
- Monitor errors and performance
- Fix critical bugs

### Phase 2: Public Launch (Day 4-5)
- Deploy to r/armchair_sleuths (public)
- Announce on r/gaming, r/mystery
- Monitor server load
- Scale Redis if needed

### Phase 3: Viral Growth (Day 6-7)
- Enable all viral features
- Start first Community Cold Case
- Launch cross-subreddit events
- Monitor viral coefficient

### Rollback Plan
```typescript
// Feature flags for gradual rollout
const FEATURE_FLAGS = {
  evidenceSharing: true,
  flairSystem: true,
  liveLeaderboard: true,
  watsonAssistant: false, // Disabled if Gemini API issues
  referralSystem: true,
  crossSubreddit: false // Disabled until partnerships confirmed
}

// Check feature flag before executing
if (FEATURE_FLAGS.watsonAssistant) {
  // Show Watson UI
} else {
  // Show "Coming Soon" message
}
```

---

## Monitoring and Analytics

### Key Metrics to Track

```typescript
interface GameMetrics {
  // Engagement
  dailyActiveUsers: number
  averageSessionTime: number
  casesPlayedPerUser: number
  
  // Viral
  viralCoefficient: number // referrals per user
  shareRate: number // % who share
  crossSubredditTraffic: number
  
  // Reddit Integration
  commentEngagementRate: number
  flairAdoptionRate: number
  leaderboardViews: number
  
  // Technical
  apiSuccessRate: number
  averageResponseTime: number
  circuitBreakerTrips: number
  
  // Revenue (future)
  premiumConversions: number
  adRevenue: number
}
```

### Logging Strategy

```typescript
class GameLogger {
  logEvent(event: string, data: any) {
    const logEntry = {
      timestamp: Date.now(),
      event,
      data,
      userId: data.userId,
      sessionId: data.sessionId
    }
    
    // Log to Redis (short-term)
    this.redis.lpush('logs:events', JSON.stringify(logEntry))
    this.redis.ltrim('logs:events', 0, 9999) // Keep last 10k events
    
    // Log to external service (long-term)
    this.externalLogger.log(logEntry)
  }
}

// Usage
logger.logEvent('case_completed', {
  userId: 'user123',
  caseId: 'case_today',
  score: 92,
  completionTime: 540000,
  challengesCompleted: ['speed_demon', 'evidence_master']
})
```

---

**Document Version**: 1.0  
**Created**: 2025-01-24  
**Status**: Ready for Tasks Phase  
**Next Step**: Create implementation tasks with time estimates

