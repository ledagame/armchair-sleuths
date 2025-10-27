# Reddit Viral Innovation - Requirements Document

## Introduction

이 문서는 Armchair Sleuths 게임의 **바이럴 성장과 커뮤니티 engagement를 극대화**하기 위한 창의적 기능들의 요구사항을 정의합니다. 

### 목표
- Reddit 네이티브 통합을 통한 자연스러운 바이럴 확산
- 커뮤니티 중심의 협동 추리 경험 제공
- 기술적 제약을 창의적 기회로 전환
- 7일 해커톤 타임라인 내 실현 가능한 혁신

### 설계 철학
1. **Reddit-First Design**: Reddit의 핵심 기능(댓글, 투표, Flair)을 게임 메커니즘으로 통합
2. **Community Co-Creation**: 커뮤니티가 콘텐츠를 만들고 공유하는 구조
3. **Viral by Design**: 공유하고 싶게 만드는 메커니즘 내장
4. **Fail Gracefully**: 기술적 실패를 게임 경험으로 전환

## Glossary

- **Detective**: Armchair Sleuths 게임을 플레이하는 Reddit 유저
- **Case**: AI가 생성한 살인 미스터리 사건
- **Evidence**: 사건 해결을 위한 단서
- **Flair**: Reddit 유저 이름 옆에 표시되는 배지/등급
- **Leaderboard**: 일일 케이스의 상위 탐정 순위표
- **Cold Case**: 7일간 지속되는 커뮤니티 협동 케이스
- **AP (Action Points)**: 게임 내 행동을 제한하는 포인트
- **Watson**: AI 탐정 조수 (Gemini API 기반)
- **Viral Coefficient**: 1명의 유저가 평균적으로 초대하는 신규 유저 수
- **Engagement Rate**: 게임을 플레이한 유저 중 댓글/투표 등 상호작용을 한 비율


## 📊 Feature Evaluation Matrix

각 요구사항은 다음 기준으로 평가됩니다:

| 기준 | 설명 | 범위 |
|------|------|------|
| **구현 난이도** | 기술적 복잡도 | 1-10 (낮을수록 쉬움) |
| **바이럴 잠재력** | 자연스러운 공유 유도 | 1-10 (높을수록 좋음) |
| **Reddit 통합도** | Reddit 네이티브 기능 활용 | 1-10 (높을수록 좋음) |
| **7일 실현성** | 해커톤 기간 내 구현 가능 | Yes/No |
| **차별화 수준** | 경쟁자 대비 독창성 | 1-10 (높을수록 좋음) |
| **우선순위** | 구현 순서 | P0/P1/P2 |

**우선순위 정의:**
- **P0 (Must Have)**: 해커톤 제출 필수, MVP 핵심 기능
- **P1 (Should Have)**: 경쟁력 강화, 시간 허용 시 구현
- **P2 (Nice to Have)**: 출시 후 추가, 커뮤니티 피드백 기반

---

## Requirements

### Category 1: Reddit 네이티브 통합 🎯


#### Requirement 1.1: Collaborative Evidence Sharing

**User Story:**  
As a Detective, I want to share evidence I discovered in Reddit comments, so that other players can see my findings and build theories together.

**Acceptance Criteria:**

1. WHEN THE Detective discovers evidence, THE System SHALL display a "Share to Comments" button
2. WHEN THE Detective clicks "Share to Comments", THE System SHALL create a Reddit comment with evidence details and image
3. WHEN other Detectives view THE comment, THE System SHALL display evidence preview with spoiler protection
4. WHILE THE evidence is shared, THE System SHALL track view count and upvote count
5. WHEN THE evidence receives 10+ upvotes, THE System SHALL award the sharing Detective 5 bonus AP

**Evaluation:**
- 구현 난이도: 4/10 (Devvit Comment API 활용)
- 바이럴 잠재력: 9/10 (댓글 = Reddit의 핵심)
- Reddit 통합도: 10/10 (네이티브 댓글 기능)
- 7일 실현성: ✅ Yes
- 차별화 수준: 8/10 (게임과 댓글의 자연스러운 통합)
- **우선순위: P0** (Must Have)

**Implementation Notes:**
- Devvit `reddit.submitComment()` API 사용
- 이미지는 Imgur 링크 또는 Reddit 이미지 업로드
- Spoiler tag로 증거 내용 보호: `>!evidence text!<`


#### Requirement 1.2: Detective Rank Flair System

**User Story:**  
As a Detective, I want my detective rank displayed as a Reddit Flair, so that other community members can see my expertise level.

**Acceptance Criteria:**

1. WHEN THE Detective completes a case, THE System SHALL calculate their rank based on cases solved and accuracy
2. WHEN THE rank is calculated, THE System SHALL update the Detective's Reddit Flair automatically
3. THE System SHALL display Flair in format: "🔍 [Rank Title] (Lv.[Level])"
4. WHEN THE Detective reaches a new rank milestone, THE System SHALL post a congratulations comment
5. WHILE browsing comments, THE System SHALL display Flair next to all Detective usernames

**Rank Levels:**
- Lv.1-2: 🔍 신참 형사 (Rookie Detective)
- Lv.3-4: 🕵️ 수사관 (Investigator)
- Lv.5-6: 🎩 베테랑 탐정 (Veteran Detective)
- Lv.7-8: 🏆 명탐정 (Master Detective)
- Lv.9-10: 👑 셜록 홈즈 (Sherlock Holmes)

**Evaluation:**
- 구현 난이도: 3/10 (Devvit Flair API 간단)
- 바이럴 잠재력: 7/10 (자랑하고 싶은 배지)
- Reddit 통합도: 10/10 (네이티브 Flair 기능)
- 7일 실현성: ✅ Yes
- 차별화 수준: 6/10 (Flair는 흔하지만 게임화는 독특)
- **우선순위: P0** (Must Have)

**Implementation Notes:**
- Devvit `reddit.setUserFlair()` API 사용
- Flair 업데이트는 케이스 제출 시 자동 실행
- CSS class로 등급별 색상 구분 가능


#### Requirement 1.3: Live Leaderboard Pinned Post

**User Story:**  
As a Detective, I want to see today's top detectives in a pinned post, so that I can compete for the top spot and gain recognition.

**Acceptance Criteria:**

1. WHEN THE daily case is published, THE System SHALL create a leaderboard post automatically
2. THE System SHALL update the leaderboard post every 10 minutes with current rankings
3. THE System SHALL pin the leaderboard post to position 2 in the subreddit
4. WHEN THE day ends, THE System SHALL lock the leaderboard and announce winners
5. THE System SHALL display: rank, username, score, completion time, and special badges

**Leaderboard Format:**
```
🏆 Today's Case: [Case Title] - Top Detectives

1. 👑 u/detective_kim - 98 points (12m 34s) ⚡ Speed Demon
2. 🥈 u/sherlock_park - 95 points (15m 02s) 🔍 Evidence Master
3. 🥉 u/mystery_solver - 92 points (18m 45s)
...
10. u/rookie_detective - 78 points (45m 12s)

[View Full Leaderboard] [Play Today's Case]
```

**Evaluation:**
- 구현 난이도: 5/10 (Scheduler + Reddit API)
- 바이럴 잠재력: 8/10 (경쟁심 유발)
- Reddit 통합도: 9/10 (Pinned Post 활용)
- 7일 실현성: ✅ Yes
- 차별화 수준: 7/10 (실시간 업데이트가 독특)
- **우선순위: P0** (Must Have)

**Implementation Notes:**
- Devvit Scheduler로 10분마다 업데이트
- `reddit.submitPost()` + `reddit.sticky()` 사용
- Redis에서 실시간 점수 조회


#### Requirement 1.4: Theory Voting System

**User Story:**  
As a Detective, I want to propose my theory in comments and let others vote on it, so that the community can collectively solve mysteries.

**Acceptance Criteria:**

1. WHEN THE Detective writes a theory comment, THE System SHALL detect theory keywords (e.g., "I think", "My theory")
2. THE System SHALL automatically add a "🔍 Theory" flair to the comment
3. WHEN other Detectives upvote THE theory, THE System SHALL track theory popularity
4. WHEN THE case is solved, THE System SHALL compare theories with the correct answer
5. WHEN THE theory was correct, THE System SHALL award the theorist 10 bonus AP and "🎯 Correct Theory" badge

**Theory Detection Keywords:**
- "I think [suspect] is guilty because..."
- "My theory: ..."
- "The killer is [suspect] because..."
- "Here's what happened: ..."

**Evaluation:**
- 구현 난이도: 6/10 (NLP 키워드 감지 필요)
- 바이럴 잠재력: 9/10 (토론 유도)
- Reddit 통합도: 10/10 (댓글 + 투표)
- 7일 실현성: ⚠️ Conditional (간단한 키워드 매칭만)
- 차별화 수준: 9/10 (커뮤니티 추리 게임화)
- **우선순위: P1** (Should Have)

**Implementation Notes:**
- 정규표현식으로 키워드 감지
- Devvit `reddit.getComments()` + `reddit.addCommentFlair()` 사용
- 복잡한 NLP는 Phase 2로 연기


---

### Category 2: 바이럴 메커니즘 🚀

#### Requirement 2.1: Daily Detective Challenge

**User Story:**  
As a Detective, I want to complete daily challenges beyond solving the case, so that I have more reasons to play and share my achievements.

**Acceptance Criteria:**

1. WHEN THE daily case is published, THE System SHALL generate 3 challenges automatically
2. THE System SHALL display challenges in the game UI and pinned post
3. WHEN THE Detective completes a challenge, THE System SHALL award special badges and AP bonuses
4. WHEN THE Detective completes all 3 challenges, THE System SHALL unlock "Triple Crown" achievement
5. THE System SHALL track challenge completion streaks (e.g., 7-day streak)

**Challenge Types:**
- ⚡ **Speed Demon**: Submit correct answer in under 10 minutes (+10 AP, ⚡ badge)
- 🔍 **Evidence Master**: Find all evidence items (+5 AP, 🔍 badge)
- 🎯 **Perfect Score**: Score 95+ points (+15 AP, 🎯 badge)
- 🔥 **Streak Master**: 7-day correct answer streak (+50 AP, 🔥 badge)
- 💬 **Community Helper**: Share 3+ evidence in comments (+5 AP, 💬 badge)

**Evaluation:**
- 구현 난이도: 4/10 (조건 체크만)
- 바이럴 잠재력: 8/10 (Achievement 공유 욕구)
- Reddit 통합도: 6/10 (게임 내 기능)
- 7일 실현성: ✅ Yes
- 차별화 수준: 7/10 (게임화 메커니즘)
- **우선순위: P0** (Must Have)

**Implementation Notes:**
- Redis에 유저별 challenge 진행 상황 저장
- 배지는 Flair 또는 게임 내 표시
- Streak는 UTC 기준 일일 리셋


#### Requirement 2.2: Achievement Share Card

**User Story:**  
As a Detective, I want to generate a shareable image card of my achievements, so that I can post it to other subreddits and social media.

**Acceptance Criteria:**

1. WHEN THE Detective completes a case, THE System SHALL display "Share Achievement" button
2. WHEN THE button is clicked, THE System SHALL generate an image card with: score, rank, badges, case title
3. THE System SHALL provide Reddit crosspost button and external share link
4. THE image card SHALL use film noir aesthetic matching game theme
5. WHEN THE card is shared, THE System SHALL track share count and award 2 AP per share

**Card Design Elements:**
- Background: Case scene image (blurred)
- Overlay: Dark gradient with gold accents
- Text: Score (large), Grade, Rank, Badges
- Branding: "🔍 Armchair Sleuths" logo
- CTA: "Play on r/armchair_sleuths"

**Evaluation:**
- 구현 난이도: 7/10 (이미지 생성 필요)
- 바이럴 잠재력: 10/10 (소셜 공유 핵심)
- Reddit 통합도: 7/10 (Crosspost 기능)
- 7일 실현성: ⚠️ Conditional (Canvas API 또는 외부 서비스)
- 차별화 수준: 8/10 (시각적 공유 메커니즘)
- **우선순위: P1** (Should Have)

**Implementation Notes:**
- Option 1: HTML Canvas API로 클라이언트 생성
- Option 2: 외부 이미지 생성 서비스 (Cloudinary, Imgix)
- Option 3: 미리 생성된 템플릿 + 텍스트 오버레이
- **Quick Win**: 텍스트 기반 공유 먼저, 이미지는 Phase 2


#### Requirement 2.3: Friend Referral System

**User Story:**  
As a Detective, I want to invite friends and earn rewards, so that I can grow the community and get bonuses.

**Acceptance Criteria:**

1. WHEN THE Detective clicks "Invite Friends", THE System SHALL generate a unique referral code
2. WHEN a new Detective signs up with THE code, THE System SHALL award both users 5 AP
3. THE System SHALL track referral count and display on profile
4. WHEN THE Detective reaches referral milestones, THE System SHALL award special badges
5. THE System SHALL prevent abuse by checking account age and activity

**Referral Milestones:**
- 5 friends: "🤝 Community Builder" badge + 25 AP
- 10 friends: "📢 Influencer" badge + 50 AP + Special Flair
- 50 friends: "🌟 Legend" badge + 250 AP + Hall of Fame entry

**Anti-Abuse Measures:**
- Referred account must be >7 days old
- Referred account must complete at least 1 case
- Max 10 referrals per day per user
- Suspicious patterns flagged for review

**Evaluation:**
- 구현 난이도: 5/10 (코드 생성 + 검증)
- 바이럴 잠재력: 9/10 (직접적 성장 메커니즘)
- Reddit 통합도: 5/10 (게임 내 기능)
- 7일 실현성: ✅ Yes
- 차별화 수준: 6/10 (일반적이지만 효과적)
- **우선순위: P1** (Should Have)

**Implementation Notes:**
- Redis에 referral 코드 저장 (TTL 30일)
- Devvit `context.userId`로 유저 식별
- Reddit API로 계정 생성일 확인


#### Requirement 2.4: Cross-Subreddit Events

**User Story:**  
As a Detective, I want to participate in special cases themed for other subreddits, so that I can discover the game through my favorite communities.

**Acceptance Criteria:**

1. THE System SHALL create special themed cases for partner subreddits
2. WHEN THE themed case is published, THE System SHALL crosspost to the partner subreddit
3. THE themed case SHALL incorporate subreddit culture and inside jokes
4. WHEN Detectives from THE partner subreddit play, THE System SHALL track their origin
5. THE System SHALL award "🌐 Cross-Community Detective" badge to participants

**Potential Partner Subreddits:**
- r/nosleep: Horror-themed mystery cases
- r/scifi: Sci-fi murder mystery on Mars station
- r/history: Historical unsolved mysteries
- r/gaming: Video game character murder mystery
- r/movies: Film noir themed cases

**Evaluation:**
- 구현 난이도: 6/10 (케이스 생성 + 협상)
- 바이럴 잠재력: 10/10 (새로운 커뮤니티 접근)
- Reddit 통합도: 10/10 (Crosspost 핵심)
- 7일 실현성: ⚠️ Conditional (파트너십 필요)
- 차별화 수준: 9/10 (독특한 성장 전략)
- **우선순위: P2** (Nice to Have)

**Implementation Notes:**
- Phase 1: 1-2개 파트너 subreddit만
- Gemini API에 subreddit 컨텍스트 제공
- Moderator 승인 필요 (사전 협의)


---

### Category 3: 독창적 차별화 💡

#### Requirement 3.1: Community Cold Case

**User Story:**  
As a Detective, I want to participate in a week-long collaborative case, so that I can work with the community to solve complex mysteries.

**Acceptance Criteria:**

1. WHEN THE week starts, THE System SHALL publish a complex Cold Case with limited initial evidence
2. THE System SHALL release new evidence daily at 00:00 UTC for 7 days
3. WHEN Detectives discover patterns, THE System SHALL allow evidence sharing in dedicated thread
4. WHEN THE final day arrives, THE System SHALL accept community submissions
5. THE System SHALL award top contributors with "❄️ Cold Case Solver" badge and 100 AP

**Cold Case Structure:**
- Day 1: Crime scene + victim profile
- Day 2: Autopsy report
- Day 3: Witness testimonies
- Day 4: Suspect alibis
- Day 5: Forensic evidence
- Day 6: Hidden connections
- Day 7: Final clues + submission deadline

**Evaluation:**
- 구현 난이도: 8/10 (복잡한 케이스 + 스케줄링)
- 바이럴 잠재력: 10/10 (장기 engagement)
- Reddit 통합도: 9/10 (토론 중심)
- 7일 실현성: ❌ No (해커톤 후 첫 이벤트로)
- 차별화 수준: 10/10 (완전히 독특)
- **우선순위: P2** (Nice to Have)

**Implementation Notes:**
- Devvit Scheduler로 일일 증거 공개
- 첫 Cold Case는 해커톤 제출 후 시작
- 커뮤니티 피드백 기반 개선


#### Requirement 3.2: AI Detective Assistant (Watson)

**User Story:**  
As a Detective, I want to consult an AI assistant for hints, so that I can get help when stuck without spoiling the mystery.

**Acceptance Criteria:**

1. WHEN THE Detective clicks "Ask Watson", THE System SHALL display AI assistant interface
2. THE Detective SHALL spend 2-5 AP per question depending on hint level
3. WHEN THE question is asked, THE System SHALL use Gemini API to generate contextual hints
4. THE hint SHALL be cryptic enough to guide without revealing the answer
5. THE System SHALL limit Watson usage to 3 questions per case

**Watson Hint Levels:**
- 💡 **Subtle Hint** (2 AP): "Consider the timeline carefully..."
- 🔍 **Evidence Analysis** (3 AP): "The fingerprints on the weapon are interesting..."
- 🎯 **Suspect Insight** (5 AP): "One suspect's alibi has a critical flaw..."

**Evaluation:**
- 구현 난이도: 6/10 (Gemini API 프롬프트 설계)
- 바이럴 잠재력: 7/10 (독특한 기능)
- Reddit 통합도: 4/10 (게임 내 기능)
- 7일 실현성: ✅ Yes (기존 Gemini 통합 활용)
- 차별화 수준: 9/10 (AI 조수는 독특)
- **우선순위: P1** (Should Have)

**Implementation Notes:**
- 기존 Gemini API 인프라 재사용
- 프롬프트: "You are Watson, a cryptic detective assistant. Give subtle hints without revealing the answer."
- AP 차감 후 힌트 제공 (환불 없음)


#### Requirement 3.3: Reverse Mystery Mode

**User Story:**  
As a Detective, I want to play as the killer and create a perfect alibi, so that I can experience the mystery from a different perspective.

**Acceptance Criteria:**

1. WHEN THE Detective selects "Reverse Mode", THE System SHALL assign them as the killer
2. THE System SHALL provide the crime details and evidence against them
3. THE Detective SHALL create an alibi by answering questions and placing evidence
4. WHEN THE alibi is complete, THE System SHALL publish it as a case for other Detectives
5. WHEN other Detectives solve THE case, THE killer SHALL earn points based on how long it took

**Scoring:**
- Case unsolved for 24h: +50 AP
- Case unsolved for 1 week: +200 AP + "🎭 Master Criminal" badge
- Case solved in <1h: +5 AP (good try)

**Evaluation:**
- 구현 난이도: 9/10 (완전히 새로운 게임 모드)
- 바이럴 잠재력: 10/10 (매우 독특한 경험)
- Reddit 통합도: 8/10 (커뮤니티 생성 콘텐츠)
- 7일 실현성: ❌ No (Phase 2 기능)
- 차별화 수준: 10/10 (게임체인저)
- **우선순위: P2** (Nice to Have)

**Implementation Notes:**
- 해커톤에서는 컨셉만 제시
- 실제 구현은 커뮤니티 피드백 후
- AI가 alibi 타당성 검증 필요


---

### Category 4: 기술적 도전의 창의적 전환 🔄

#### Requirement 4.1: Fair Play Transparency

**User Story:**  
As a Detective, I want to see the game's technical challenges openly, so that I can trust the system and feel part of the development journey.

**Acceptance Criteria:**

1. WHEN THE System encounters an error, THE System SHALL log it transparently in a "Tech Log" section
2. THE System SHALL display current system status (API health, case generation status)
3. WHEN THE community reports bugs, THE System SHALL create a "Mystery Bug" thread
4. WHEN THE bug is fixed, THE System SHALL award the reporter "🐛 Bug Hunter" badge
5. THE System SHALL publish weekly "Behind the Scenes" posts about technical improvements

**Transparency Elements:**
- 🟢 All Systems Operational
- 🟡 Gemini API Slow (expect delays)
- 🔴 Case Generation Failed (using backup cases)
- 🔧 Maintenance Mode (30 minutes)

**Evaluation:**
- 구현 난이도: 3/10 (상태 표시만)
- 바이럴 잠재력: 6/10 (신뢰 구축)
- Reddit 통합도: 7/10 (커뮤니티 참여)
- 7일 실현성: ✅ Yes
- 차별화 수준: 8/10 (투명성은 독특)
- **우선순위: P0** (Must Have)

**Implementation Notes:**
- 에러를 숨기지 않고 게임 경험으로 전환
- "기술적 미스터리"로 프레이밍
- 커뮤니티가 개발 과정에 참여하는 느낌


#### Requirement 4.2: Offline Detective Mode

**User Story:**  
As a Detective, I want to play cached cases when Reddit API is down, so that I can continue playing even during outages.

**Acceptance Criteria:**

1. WHEN THE System detects Reddit API failure, THE System SHALL activate "Offline Mode" automatically
2. THE System SHALL display "📚 Classic Cases" library with 10 pre-cached cases
3. WHEN THE Detective plays a classic case, THE System SHALL save progress locally
4. WHEN THE Reddit API recovers, THE System SHALL sync progress and award AP
5. THE System SHALL display "🏛️ Playing from Archives" badge during offline mode

**Classic Cases Library:**
- 10 hand-crafted "greatest hits" cases
- Stored in Redis with no expiration
- Updated monthly with community favorites

**Evaluation:**
- 구현 난이도: 5/10 (Circuit Breaker + 캐싱)
- 바이럴 잠재력: 5/10 (기능적)
- Reddit 통합도: 6/10 (장애 대응)
- 7일 실현성: ✅ Yes
- 차별화 수준: 7/10 (장애를 기회로)
- **우선순위: P1** (Should Have)

**Implementation Notes:**
- Circuit Breaker 패턴 구현
- LocalStorage에 진행 상황 저장
- 장애를 "아카이브 탐험"으로 리브랜딩


#### Requirement 4.3: Detective History Archive

**User Story:**  
As a Detective, I want to revisit old cases I solved, so that I can see my progress and replay favorites.

**Acceptance Criteria:**

1. THE System SHALL automatically archive cases older than 30 days to "Cold Case Archive"
2. WHEN THE Detective views their profile, THE System SHALL display case history with scores
3. THE Detective SHALL be able to replay archived cases for fun (no AP rewards)
4. WHEN THE community votes, THE System SHALL feature "Case of the Month" in archive
5. THE System SHALL implement Redis TTL policy to manage memory efficiently

**Archive Features:**
- Personal case history (last 100 cases)
- Community favorites (top 50 rated)
- Seasonal collections (Halloween, Christmas themes)
- "Unsolved Mysteries" (cases with <50% solve rate)

**Redis TTL Policy:**
- Active cases: No TTL
- Recent cases (0-7 days): 30 days TTL
- Archive cases (7-30 days): 90 days TTL
- Cold archive (30+ days): 365 days TTL

**Evaluation:**
- 구현 난이도: 4/10 (Redis TTL 설정)
- 바이럴 잠재력: 6/10 (재방문 유도)
- Reddit 통합도: 5/10 (게임 내 기능)
- 7일 실현성: ✅ Yes
- 차별화 수준: 6/10 (메모리 관리를 게임화)
- **우선순위: P1** (Should Have)

**Implementation Notes:**
- Redis `EXPIRE` 명령어로 TTL 설정
- 메모리 누수 방지 (전문가 리뷰 이슈 해결)
- 아카이브를 "추억"으로 프레이밍


---

## 🎯 Quick Wins (3일 안에 구현 가능)

다음 기능들은 **높은 효과 + 낮은 구현 난이도**로 빠른 성과를 낼 수 있습니다:

### 1. Detective Rank Flair (Req 1.2)
- **시간**: 4시간
- **효과**: Reddit 네이티브 통합, 자랑 욕구 충족
- **구현**: Devvit Flair API 호출만

### 2. Daily Detective Challenge (Req 2.1)
- **시간**: 6시간
- **효과**: 재방문 유도, Achievement 시스템
- **구현**: 조건 체크 로직만

### 3. Fair Play Transparency (Req 4.1)
- **시간**: 3시간
- **효과**: 신뢰 구축, 커뮤니티 참여
- **구현**: 상태 표시 UI만

### 4. Collaborative Evidence Sharing (Req 1.1)
- **시간**: 8시간
- **효과**: 댓글 engagement, 바이럴 확산
- **구현**: Reddit Comment API 호출

**Total: 21시간 (3일) → 4개 핵심 기능 완성**

---

## 🌙 Moonshots (위험하지만 게임체인저)

다음 기능들은 **높은 위험 + 높은 보상**으로 성공 시 압도적 차별화 가능:

### 1. Reverse Mystery Mode (Req 3.3)
- **위험**: 완전히 새로운 게임 모드, 복잡한 검증 로직
- **보상**: 경쟁자가 절대 따라할 수 없는 독창성
- **전략**: 해커톤에서는 "Coming Soon" 티저만, 실제 구현은 Phase 2

### 2. Community Cold Case (Req 3.1)
- **위험**: 7일 이벤트 관리, 복잡한 케이스 설계
- **보상**: 장기 engagement, 커뮤니티 결속
- **전략**: 해커톤 제출 직후 첫 이벤트 시작

### 3. Cross-Subreddit Events (Req 2.4)
- **위험**: 파트너십 협상 필요, 거절 가능성
- **보상**: 새로운 커뮤니티 접근, 폭발적 성장
- **전략**: 1-2개 친화적 subreddit만 타겟 (r/nosleep, r/mystery)


---

## 🤝 Community Co-Creation

다음 기능들은 **커뮤니티가 직접 콘텐츠를 만드는** 구조로 지속 가능한 성장 가능:

### 1. Theory Voting System (Req 1.4)
- 커뮤니티가 추리를 공유하고 투표
- 정답 이론 작성자에게 보상
- UGC (User Generated Content) 생성

### 2. Case Creation Contest (미래 기능)
- 커뮤니티가 케이스 스토리 제출
- 투표로 채택 결정
- 채택 시 작성자에게 특별 보상

### 3. Detective Academy (미래 기능)
- 커뮤니티가 추리 기법 가이드 작성
- 신규 유저 온보딩 콘텐츠
- 기여자에게 "🎓 Professor" 배지

---

## 📊 Success Metrics

각 요구사항의 성공을 측정하는 지표:

### Reddit 네이티브 통합
- **Engagement Rate**: 플레이어 중 댓글/투표 참여 비율 (목표: 40%+)
- **Flair Adoption**: Flair를 설정한 유저 비율 (목표: 60%+)
- **Leaderboard Views**: 일일 리더보드 조회 수 (목표: 1000+)

### 바이럴 메커니즘
- **Viral Coefficient**: 1명당 초대한 신규 유저 수 (목표: 1.5+)
- **Share Rate**: 케이스 완료 후 공유 비율 (목표: 20%+)
- **Cross-Subreddit Traffic**: 다른 subreddit에서 유입 (목표: 30%+)

### 독창적 차별화
- **Watson Usage**: AI 조수 사용 비율 (목표: 50%+)
- **Cold Case Participation**: 주간 이벤트 참여 (목표: 500+ 유저)
- **Reverse Mode Interest**: "Coming Soon" 투표 (목표: 1000+ upvotes)

### 기술적 전환
- **Uptime**: 시스템 가동 시간 (목표: 99%+)
- **Offline Mode Usage**: 장애 시 계속 플레이 (목표: 80%+)
- **Archive Replay**: 과거 케이스 재플레이 (목표: 15%+)


---

## 🚀 7-Day Implementation Roadmap

### Day 1-2: Reddit 네이티브 통합 (P0)
- ✅ Detective Rank Flair System (Req 1.2) - 4h
- ✅ Collaborative Evidence Sharing (Req 1.1) - 8h
- ✅ Live Leaderboard (Req 1.3) - 6h
- ✅ Fair Play Transparency (Req 4.1) - 3h
**Total: 21h → 2 developers × 10h/day = 완료 가능**

### Day 3-4: 바이럴 메커니즘 (P0 + P1)
- ✅ Daily Detective Challenge (Req 2.1) - 6h
- ✅ Friend Referral System (Req 2.3) - 8h
- ✅ AI Detective Assistant (Req 3.2) - 8h
- ⚠️ Achievement Share Card (Req 2.2) - 텍스트 버전만 4h
**Total: 26h → 2 developers × 13h/day = 완료 가능**

### Day 5: 기술적 안정화 (P1)
- ✅ Offline Detective Mode (Req 4.2) - 6h
- ✅ Detective History Archive (Req 4.3) - 4h
- ✅ Theory Voting System (Req 1.4) - 간단한 버전 6h
**Total: 16h → 2 developers × 8h/day = 완료 가능**

### Day 6: 통합 테스트 & 버그 수정
- End-to-end 테스트
- 모바일 최적화 확인
- 성능 최적화
- 에러 처리 강화

### Day 7: 폴리싱 & 데모 준비
- UI/UX 개선
- Demo Video 촬영
- Pitch Deck 작성
- README 업데이트

---

## 🎬 Pitch Strategy

### 심사위원 설득 포인트

#### 1. Reddit 네이티브 통합 (30점)
> "우리는 Reddit 위에 게임을 올린 것이 아니라, Reddit 자체를 게임으로 만들었습니다."
- 댓글, 투표, Flair를 게임 메커니즘으로 통합
- 실제 데모: 댓글로 증거 공유 → 투표 → 리더보드 반영

#### 2. 커뮤니티 중심 설계 (25점)
> "플레이어가 콘텐츠를 만들고, 커뮤니티가 게임을 키웁니다."
- Theory Voting: 커뮤니티가 함께 추리
- Referral System: 유저가 유저를 데려옴
- Cold Case: 7일간 협동 이벤트

#### 3. 기술적 혁신 (20점)
> "AI가 무한한 케이스를 생성하고, Watson이 탐정을 돕습니다."
- Gemini API로 일일 케이스 자동 생성
- AI 조수로 힌트 제공
- Circuit Breaker로 장애 대응

#### 4. 바이럴 메커니즘 (15점)
> "플레이하고 싶게 만드는 것이 아니라, 공유하고 싶게 만듭니다."
- Achievement 시스템
- Flair로 자랑하기
- Referral 보상

#### 5. 투명성과 신뢰 (10점)
> "에러를 숨기지 않고, 커뮤니티와 함께 해결합니다."
- Fair Play Transparency
- Bug Hunter 배지
- Behind the Scenes 포스트


---

## 🔮 Phase 2 Roadmap (해커톤 이후)

### Month 1: 커뮤니티 피드백 기반 개선
- Achievement Share Card 이미지 버전 (Req 2.2)
- Theory Voting 고도화 (NLP 키워드 감지)
- Cross-Subreddit Events 확대 (3-5개 파트너)

### Month 2: 독창적 기능 출시
- Community Cold Case 첫 이벤트 (Req 3.1)
- Detective Duo 협력 모드
- Evidence Trading System

### Month 3: 게임체인저 기능
- Reverse Mystery Mode 베타 (Req 3.3)
- Real Crime Recreation
- Detective Academy

### Month 6: 플랫폼 확장
- Mobile App (React Native)
- Discord Bot 통합
- Twitch Extension

---

## 💎 Competitive Advantages

### vs. 기존 추리 게임
| 우리 | 기존 게임 |
|------|----------|
| 무한한 AI 생성 케이스 | 제한된 수작업 케이스 |
| 커뮤니티 협동 추리 | 혼자 플레이 |
| Reddit 네이티브 통합 | 독립 앱 |
| 무료 + 광고 없음 | 유료 또는 광고 |

### vs. 다른 Devvit 게임
| 우리 | 다른 게임 |
|------|----------|
| AI 무한 콘텐츠 | 정적 콘텐츠 |
| 댓글/투표 게임화 | 단순 게임 |
| 7일 이벤트 | 일회성 플레이 |
| 커뮤니티 Co-Creation | 개발자 중심 |

---

## 🎓 Lessons from Expert Review

### Karl Wiegers (요구사항 엔지니어링)
- ✅ **적용**: 모든 요구사항에 EARS 패턴 사용
- ✅ **적용**: 에러 케이스 acceptance criteria 추가
- ✅ **적용**: 7일 타임라인에 맞춰 P0/P1/P2 우선순위 설정

### Michael Nygard (프로덕션 시스템)
- ✅ **적용**: Circuit Breaker 패턴 (Offline Mode)
- ✅ **적용**: Redis TTL 정책 (Archive System)
- ✅ **적용**: Fair Play Transparency (에러 공개)

### Gojko Adzic (실행 가능한 명세)
- ✅ **적용**: 각 요구사항에 구체적 예시 포함
- ✅ **적용**: Implementation Notes로 실행 가능성 명시
- ✅ **적용**: Quick Wins 섹션으로 우선순위 명확화

### Lisa Crispin (테스팅 전략)
- ✅ **적용**: Success Metrics로 측정 가능성 확보
- ✅ **적용**: Day 6 통합 테스트 일정 확보
- ⚠️ **TODO**: Mock Reddit API 전략 (Design 문서에서)

### Kelsey Hightower (클라우드 네이티브)
- ✅ **적용**: Devvit 플랫폼 제약 명확히 인지
- ✅ **적용**: Vercel 혼동 제거, Devvit Scheduler 사용
- ✅ **적용**: Redis 기반 아키텍처 유지

---

## 📝 Next Steps

1. **Design 문서 작성** (.kiro/specs/reddit-viral-innovation/design.md)
   - 각 요구사항의 상세 아키텍처
   - API 설계 및 데이터 모델
   - 에러 처리 전략
   - 테스팅 전략

2. **Tasks 문서 작성** (.kiro/specs/reddit-viral-innovation/tasks.md)
   - 7일 일정에 맞춘 구현 태스크
   - 각 태스크의 시간 추정
   - 의존성 관계 명시

3. **Prototype 개발**
   - Quick Wins 4개 기능 먼저 구현
   - 커뮤니티 피드백 수집
   - 우선순위 재조정

---

**Document Version**: 1.0  
**Created**: 2025-01-24  
**Status**: Ready for Design Phase  
**Estimated Implementation**: 7 days (P0 + P1 features)  
**Expected Impact**: 82+ points in hackathon evaluation

