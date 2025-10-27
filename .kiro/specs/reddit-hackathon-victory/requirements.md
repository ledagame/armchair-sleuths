# Requirements Document - Reddit 해커톤 우승 전략

## Introduction

Armchair Sleuths는 현재 기술적으로 완성도 높은 AI 기반 추리 게임입니다. 그러나 Reddit Devvit 해커톤에서 우승하기 위해서는 **Reddit 플랫폼의 네이티브 기능을 최대한 활용**하고 **커뮤니티 Engagement를 극대화**하는 것이 필수적입니다.

본 spec은 7일간의 집중 개발을 통해 해커톤 심사위원들에게 "이것은 Reddit을 위해 태어난 게임"이라는 인상을 주기 위한 전략적 기능 추가를 다룹니다.

### 전략적 목표

1. **Reddit Integration Score 극대화** (30점 확보)
   - Comments, Voting, Flair, Crosspost 등 Reddit 핵심 기능 활용
   
2. **Community Engagement 증명** (25점 확보)
   - 협동 추리, 토론, 경쟁 메커니즘 구현
   
3. **Innovation 차별화** (20점 확보)
   - 경쟁자가 따라할 수 없는 독창적 기능

4. **Technical Excellence 유지** (15점 확보)
   - 현재의 높은 기술 완성도 유지

5. **UX Polish** (10점 확보)
   - 매끄러운 사용자 경험

## Glossary

- **System**: Armchair Sleuths 게임 시스템
- **Player**: 게임을 플레이하는 Reddit 사용자
- **Detective**: 게임 내 플레이어의 역할
- **Case**: AI가 생성한 추리 사건
- **Evidence**: 사건 해결을 위한 증거 아이템
- **Suspect**: 용의자 NPC
- **AP (Archetype Points)**: 게임 내 행동 포인트
- **Submission**: 플레이어의 최종 추리 제출
- **Flair**: Reddit 사용자 이름 옆에 표시되는 배지
- **Leaderboard**: 순위표
- **Cold Case**: 장기간 진행되는 커뮤니티 협력 사건
- **Devvit**: Reddit의 앱 개발 플랫폼
- **Crosspost**: Reddit 포스트를 다른 서브레딧에 공유

## Requirements

### Requirement 1: Reddit Comments 기반 협동 추리 시스템

**User Story:** As a Detective, I want to share evidence and theories with other players through Reddit comments, so that we can solve mysteries together as a community.

#### Acceptance Criteria

1. WHEN a Player discovers evidence, THE System SHALL provide a "Share to Comments" button that creates a Reddit comment with evidence details
2. WHEN a Player submits a theory, THE System SHALL post the theory as a Reddit comment with structured formatting
3. WHEN other Players vote on theory comments, THE System SHALL track vote counts and display popular theories
4. WHEN a Case has active discussion, THE System SHALL display comment count and top theories in the game UI
5. WHERE a Player views evidence, THE System SHALL show related community discussions from comments

### Requirement 2: Detective Ranking Flair 시스템

**User Story:** As a Detective, I want my skill level displayed as a Reddit Flair, so that other players can recognize my expertise and achievements.

#### Acceptance Criteria

1. WHEN a Player completes a Case, THE System SHALL calculate their Detective Rank based on cases played, correct answers, and average score
2. WHEN a Player's rank increases, THE System SHALL automatically update their Reddit User Flair with new rank title and emoji
3. THE System SHALL define 10 rank levels from "신참 형사" (Lv.1) to "셜록 홈즈" (Lv.10)
4. WHEN a Player views the leaderboard, THE System SHALL display each player's Flair rank visibly
5. WHERE a Player achieves a milestone rank (Lv.5, Lv.7, Lv.10), THE System SHALL create a celebration post in the subreddit

### Requirement 3: Live Leaderboard with Auto-Pinning

**User Story:** As a Detective, I want to see daily leaderboards pinned in the subreddit, so that I can track my ranking and compete with others.

#### Acceptance Criteria

1. WHEN a new daily Case is generated at 00:00 UTC, THE System SHALL create a leaderboard post for the previous day's Case
2. THE System SHALL automatically pin the leaderboard post to position 2 in the subreddit
3. WHEN a Player submits their solution, THE System SHALL update the live leaderboard in real-time
4. THE System SHALL display top 10 Detectives with their scores, grades, and Flair ranks
5. WHERE a Player clicks on a leaderboard entry, THE System SHALL navigate to that player's submission comment

### Requirement 4: Daily Detective Challenge 시스템

**User Story:** As a Detective, I want additional challenge objectives beyond solving the case, so that I can earn special rewards and badges.

#### Acceptance Criteria

1. WHEN a daily Case is generated, THE System SHALL create 3-5 challenge objectives (e.g., "Speed Demon", "Evidence Collector", "Perfect Score")
2. WHEN a Player completes a challenge, THE System SHALL award special badges, bonus AP, or exclusive Flairs
3. THE System SHALL track challenge completion streaks (e.g., "7-day Sherlock Streak")
4. WHEN a Player views the Results screen, THE System SHALL display completed challenges with visual celebration
5. WHERE a Player achieves a rare challenge, THE System SHALL create a highlight post in the subreddit

### Requirement 5: Social Share Card 생성

**User Story:** As a Detective, I want to share my achievements as beautiful image cards, so that I can show off my detective skills on Reddit and other platforms.

#### Acceptance Criteria

1. WHEN a Player completes a Case, THE System SHALL generate a shareable image card with score, grade, case title, and detective rank
2. THE System SHALL provide a "Share to r/gaming" button that creates a crosspost with the generated image
3. THE System SHALL include the player's Flair rank and special badges in the share card
4. WHEN a Player shares their achievement, THE System SHALL track share count for viral metrics
5. WHERE a share card receives high engagement, THE System SHALL feature it in the subreddit's "Hall of Fame"

### Requirement 6: Referral & Invite System

**User Story:** As a Detective, I want to invite friends and earn rewards, so that I can grow the community and get bonus AP.

#### Acceptance Criteria

1. WHEN a Player requests an invite code, THE System SHALL generate a unique referral code
2. WHEN a new Player joins using a referral code, THE System SHALL award 5 AP to both referrer and referee
3. THE System SHALL track referral milestones (5, 10, 50 friends) and award special badges
4. WHEN a Player reaches a referral milestone, THE System SHALL grant exclusive Flairs and Hall of Fame entry
5. WHERE a Player views their profile, THE System SHALL display referral count and progress to next milestone

### Requirement 7: Community Cold Case 모드

**User Story:** As a Detective, I want to participate in week-long collaborative mysteries, so that I can work with the community on complex cases.

#### Acceptance Criteria

1. WHEN a Cold Case event starts, THE System SHALL create a 7-day case with daily evidence releases
2. THE System SHALL provide a shared evidence board where Players can post findings and theories
3. WHEN Players submit group theories, THE System SHALL allow community voting on the most likely solution
4. WHEN the Cold Case deadline arrives, THE System SHALL reveal the solution and award points to top contributors
5. WHERE a Player participates in a Cold Case, THE System SHALL grant participation rewards (10 AP) and special badges for correct answers (100 AP)

### Requirement 8: AI Detective Assistant (Watson)

**User Story:** As a Detective, I want to use an AI assistant for hints, so that I can get help when stuck while spending AP strategically.

#### Acceptance Criteria

1. WHEN a Player is investigating, THE System SHALL provide an AI Assistant interface with 3 hint types
2. WHEN a Player requests "Analyze Evidence" (cost: 2 AP), THE System SHALL use Gemini API to provide insights, related evidence, and suspect connections
3. WHEN a Player requests "Psychological Profile" (cost: 3 AP), THE System SHALL analyze suspect behavior for lies, truths, and nervous triggers
4. WHEN a Player requests "Timeline Reconstruction" (cost: 5 AP), THE System SHALL reconstruct the crime timeline with gaps and inconsistencies
5. WHERE a Player uses the AI Assistant, THE System SHALL deduct AP and display the analysis in a conversational format

### Requirement 9: Cross-Subreddit Case Generator

**User Story:** As a Subreddit Moderator, I want to generate themed cases for my community, so that I can create custom mystery events.

#### Acceptance Criteria

1. WHEN a Moderator requests a themed case, THE System SHALL generate cases in different genres (horror, comedy, sci-fi, historical)
2. THE System SHALL allow collaboration with subreddits like r/nosleep, r/scifi for themed events
3. WHEN a community case is submitted, THE System SHALL allow voting and curation by moderators
4. THE System SHALL track cross-subreddit engagement metrics for viral growth
5. WHERE a themed case is popular, THE System SHALL feature it in multiple subreddits via crosspost

### Requirement 10: Mobile-Optimized UX

**User Story:** As a Mobile Player, I want a seamless experience on my phone, so that I can play comfortably on Reddit's mobile app.

#### Acceptance Criteria

1. THE System SHALL ensure all 6 game screens are responsive and touch-optimized
2. WHEN a Player uses mobile, THE System SHALL adjust font sizes, button sizes, and spacing for thumb navigation
3. THE System SHALL load images progressively to minimize mobile data usage
4. WHEN a Player rotates their device, THE System SHALL maintain game state and UI layout
5. WHERE a Player experiences slow connection, THE System SHALL show loading states and allow offline evidence review

## Requirements Coverage Summary

| Category | Requirements | Priority |
|----------|-------------|----------|
| Reddit Integration | 1, 2, 3, 5, 9 | 🔴 Critical |
| Community Engagement | 1, 3, 4, 6, 7 | 🔴 Critical |
| Innovation | 7, 8, 9 | 🟡 High |
| UX/Polish | 10 | 🟢 Medium |

## Success Metrics

### Hackathon Submission Goals

**Week 1 (Day 1-7):**
- Subreddit created: r/armchair_sleuths
- Beta users: 100+
- Cases played: 500+
- Comments: 200+
- Flair activations: 50+

**Week 2 (Day 8-14):**
- Daily active users: 500+
- Community Cold Case participants: 200+
- Share cards generated: 100+
- Cross-subreddit collaborations: 2+

**Submission Day:**
- Total users: 1,000+
- Total cases solved: 5,000+
- Day 3 retention: 60%+
- Average session time: 15+ minutes
- Comment engagement rate: 30%+

## Non-Functional Requirements

### Performance
- Comment posting latency: < 2 seconds
- Flair update latency: < 3 seconds
- Leaderboard refresh: < 1 second
- Share card generation: < 5 seconds

### Scalability
- Support 1,000+ concurrent players
- Handle 10,000+ daily case submissions
- Process 5,000+ comments per day

### Reliability
- 99.9% uptime during hackathon evaluation period
- Graceful degradation if Reddit API is slow
- Automatic retry for failed Flair updates

### Security
- Validate all Reddit API tokens
- Prevent spam in comments
- Rate limit AI Assistant usage (max 10 requests per case)

---

**Document Version:** 1.0  
**Created:** 2025-01-24  
**Target Completion:** 2025-01-31 (7 days)  
**Priority:** 🔴 Critical - Hackathon Submission
