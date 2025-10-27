# Reddit Viral Innovation - Implementation Tasks

## Overview

이 문서는 7일 해커톤 타임라인에 맞춘 **실행 가능한 구현 태스크**를 정의합니다.

### Implementation Strategy

- **P0 (Must Have)**: 해커톤 제출 필수 기능 - 82점 획득 목표
- **P1 (Should Have)**: 시간 허용 시 구현 - 추가 15점
- **P2 (Nice to Have)**: Phase 2로 연기 - 커뮤니티 피드백 후

### Team Structure (가정)

- 2 developers × 10 hours/day × 7 days = 140 hours total
- Day 1-5: 개발 (100 hours)
- Day 6: 통합 테스트 (20 hours)
- Day 7: 폴리싱 & 데모 (20 hours)

---

## Implementation Plan

### Day 1-2: Reddit 네이티브 통합 (P0) - 40 hours


- [ ] 1. Detective Rank Flair System
  - Create FlairService class with rank calculation logic
  - Implement Devvit `setUserFlair()` API integration
  - Add rank thresholds (10 levels) and emoji mapping
  - Create CSS styles for rank colors
  - Test with mock user data
  - _Requirements: 1.2_
  - _Estimated Time: 4 hours_

- [ ] 1.1 Rank Calculation Logic
  - Implement `calculateRank()` method
  - Add user stats aggregation from Redis
  - Test edge cases (new user, max level)
  - _Requirements: 1.2_

- [ ] 1.2 Flair API Integration
  - Integrate Devvit `reddit.setUserFlair()`
  - Handle API errors gracefully
  - Add retry logic for failures
  - _Requirements: 1.2_

- [ ] 1.3 Rank-Up Celebration
  - Create congratulations comment template
  - Post comment when user ranks up
  - Award bonus AP for milestones
  - _Requirements: 1.2_

- [ ] 2. Collaborative Evidence Sharing
  - Create CommentService class
  - Implement evidence comment formatting
  - Integrate Devvit `submitComment()` API
  - Add spoiler tag protection
  - Track comment votes and award bonus AP
  - _Requirements: 1.1_
  - _Estimated Time: 8 hours_

- [ ] 2.1 Comment Formatting
  - Design evidence comment template
  - Add image link support
  - Implement spoiler tag wrapping
  - _Requirements: 1.1_

- [ ] 2.2 Reddit Comment API
  - Integrate `reddit.submitComment()`
  - Handle rate limits
  - Add Circuit Breaker for failures
  - _Requirements: 1.1_

- [ ] 2.3 Vote Tracking
  - Query comment upvotes periodically
  - Award 5 AP when comment reaches 10+ upvotes
  - Store share records in Redis
  - _Requirements: 1.1_

- [ ] 3. Live Leaderboard System
  - Create LeaderboardService class
  - Implement leaderboard post creation
  - Add Devvit Scheduler for 10-minute updates
  - Format leaderboard with medals and badges
  - Pin post to subreddit position 2
  - _Requirements: 1.3_
  - _Estimated Time: 6 hours_

- [ ] 3.1 Leaderboard Post Creation
  - Implement `createDailyLeaderboard()`
  - Format leaderboard text with rankings
  - Add timestamp and links
  - _Requirements: 1.3_

- [ ] 3.2 Scheduler Integration
  - Configure Devvit Scheduler (cron: */10 * * * *)
  - Implement `updateLeaderboard()` job
  - Handle scheduler failures gracefully
  - _Requirements: 1.3_

- [ ] 3.3 Post Pinning
  - Use `reddit.sticky()` API
  - Pin to position 2 (position 1 for daily case)
  - Handle pinning errors
  - _Requirements: 1.3_

- [ ] 4. Fair Play Transparency
  - Create system status display component
  - Add health check indicators (🟢🟡🔴)
  - Implement error logging to public "Tech Log"
  - Create "Bug Hunter" badge system
  - _Requirements: 4.1_
  - _Estimated Time: 3 hours_

- [ ] 4.1 Status Display UI
  - Design status indicator component
  - Show API health (Gemini, Reddit)
  - Display current system mode
  - _Requirements: 4.1_

- [ ] 4.2 Public Error Logging
  - Create "Tech Log" section in UI
  - Log non-sensitive errors publicly
  - Add "Report Bug" button
  - _Requirements: 4.1_

- [ ] 4.3 Bug Hunter Rewards
  - Award badge to bug reporters
  - Track bug reports in Redis
  - Post thank-you comments
  - _Requirements: 4.1_


---

### Day 3-4: 바이럴 메커니즘 (P0 + P1) - 40 hours

- [ ] 5. Daily Detective Challenge
  - Create ChallengeService class
  - Implement 5 challenge types (Speed, Evidence, Perfect, Streak, Community)
  - Add challenge completion checking logic
  - Display challenges in game UI
  - Award badges and AP for completions
  - _Requirements: 2.1_
  - _Estimated Time: 6 hours_

- [ ] 5.1 Challenge Generation
  - Implement `generateDailyChallenges()`
  - Select 3 challenges per day
  - Store in Redis with 24h TTL
  - _Requirements: 2.1_

- [ ] 5.2 Completion Checking
  - Implement `checkChallengeCompletion()`
  - Evaluate requirements (time, score, evidence)
  - Award rewards automatically
  - _Requirements: 2.1_

- [ ] 5.3 Streak Tracking
  - Implement `getStreak()` method
  - Check consecutive correct answers
  - Award special badge at 7-day streak
  - _Requirements: 2.1_

- [ ] 5.4 Challenge UI
  - Design challenge display component
  - Show progress bars
  - Display earned badges
  - _Requirements: 2.1_

- [ ] 6. Friend Referral System
  - Create ReferralService class
  - Generate unique referral codes
  - Track referrals and award bonuses
  - Implement anti-abuse measures
  - Display referral count on profile
  - _Requirements: 2.3_
  - _Estimated Time: 8 hours_

- [ ] 6.1 Referral Code Generation
  - Generate unique 8-character codes
  - Store in Redis with 30-day TTL
  - Link code to referrer userId
  - _Requirements: 2.3_

- [ ] 6.2 Referral Validation
  - Check account age (>7 days)
  - Verify at least 1 case played
  - Prevent same-IP abuse
  - _Requirements: 2.3_

- [ ] 6.3 Reward Distribution
  - Award 5 AP to both users
  - Track milestone achievements (5, 10, 50 referrals)
  - Award special badges and Flairs
  - _Requirements: 2.3_

- [ ] 6.4 Referral UI
  - Create "Invite Friends" button
  - Display referral code and share link
  - Show referral count and milestones
  - _Requirements: 2.3_

- [ ] 7. AI Detective Assistant (Watson)
  - Create WatsonService class
  - Integrate Gemini API for hint generation
  - Implement 3 hint levels (Subtle, Analysis, Insight)
  - Add AP cost system (2-5 AP per hint)
  - Limit to 3 questions per case
  - _Requirements: 3.2_
  - _Estimated Time: 8 hours_

- [ ] 7.1 Gemini API Integration
  - Implement `generateHint()` method
  - Create system prompts for each hint level
  - Handle API errors with Circuit Breaker
  - _Requirements: 3.2_

- [ ] 7.2 Fallback Hints
  - Create 10 pre-written fallback hints
  - Use when Gemini API fails
  - Store in Redis for quick access
  - _Requirements: 3.2_

- [ ] 7.3 AP Cost System
  - Deduct AP before generating hint
  - Validate sufficient AP balance
  - No refunds for hints
  - _Requirements: 3.2_

- [ ] 7.4 Watson UI
  - Design Watson assistant interface
  - Add question input field
  - Display hint levels with costs
  - Show remaining questions count
  - _Requirements: 3.2_

- [ ] 8. Achievement Share Card (Text Version)
  - Create ShareService class
  - Generate text-based achievement summary
  - Add Reddit crosspost functionality
  - Track share count and award AP
  - _Requirements: 2.2_
  - _Estimated Time: 4 hours_

- [ ] 8.1 Text Share Format
  - Design achievement text template
  - Include score, rank, badges, case title
  - Add call-to-action link
  - _Requirements: 2.2_

- [ ] 8.2 Crosspost Integration
  - Use `reddit.crosspost()` API
  - Suggest target subreddits (r/gaming, r/mystery)
  - Track crosspost success
  - _Requirements: 2.2_

- [ ] 8.3 Share Tracking
  - Count shares per user
  - Award 2 AP per share
  - Display share count on profile
  - _Requirements: 2.2_


---

### Day 5: 기술적 안정화 (P1) - 20 hours

- [ ] 9. Offline Detective Mode
  - Implement Circuit Breaker pattern
  - Create "Classic Cases" library (10 pre-cached cases)
  - Add offline mode detection
  - Store progress in LocalStorage
  - Sync when Reddit API recovers
  - _Requirements: 4.2_
  - _Estimated Time: 6 hours_

- [ ] 9.1 Circuit Breaker Implementation
  - Create CircuitBreaker class
  - Track failure count (threshold: 3)
  - Auto-open circuit on failures
  - Reset after 1 minute timeout
  - _Requirements: 4.2_

- [ ] 9.2 Classic Cases Library
  - Select 10 best hand-crafted cases
  - Store in Redis with no expiration
  - Create "Archives" UI section
  - _Requirements: 4.2_

- [ ] 9.3 Offline Mode UI
  - Detect Reddit API failures
  - Display "📚 Playing from Archives" badge
  - Show offline mode indicator
  - _Requirements: 4.2_

- [ ] 9.4 Progress Sync
  - Save progress to LocalStorage
  - Sync to Redis when online
  - Award AP after sync
  - _Requirements: 4.2_

- [ ] 10. Detective History Archive
  - Implement Redis TTL policies
  - Create archive browsing UI
  - Add case replay functionality (no AP rewards)
  - Display personal case history
  - _Requirements: 4.3_
  - _Estimated Time: 4 hours_

- [ ] 10.1 TTL Policy Implementation
  - Set TTL for active cases (no expiration)
  - Set TTL for recent cases (30 days)
  - Set TTL for archive cases (90 days)
  - Set TTL for cold archive (365 days)
  - _Requirements: 4.3_

- [ ] 10.2 Archive UI
  - Create "Case History" section
  - Display last 100 cases played
  - Show scores and completion times
  - Add "Replay" button
  - _Requirements: 4.3_

- [ ] 10.3 Replay Functionality
  - Load archived case data
  - Disable AP rewards for replays
  - Show "Replay Mode" indicator
  - _Requirements: 4.3_

- [ ] 11. Theory Voting System (Simplified)
  - Implement keyword detection for theories
  - Add "🔍 Theory" flair to matching comments
  - Track theory popularity (upvotes)
  - Award bonus AP for correct theories
  - _Requirements: 1.4_
  - _Estimated Time: 6 hours_

- [ ] 11.1 Keyword Detection
  - Create regex patterns for theory keywords
  - Scan comments for patterns
  - Flag matching comments
  - _Requirements: 1.4_

- [ ] 11.2 Theory Flair
  - Add "🔍 Theory" flair to comments
  - Use `reddit.addCommentFlair()` API
  - Handle flair errors
  - _Requirements: 1.4_

- [ ] 11.3 Theory Validation
  - Compare theories with correct answer
  - Award 10 AP for correct theories
  - Award "🎯 Correct Theory" badge
  - _Requirements: 1.4_


---

### Day 6: 통합 테스트 & 버그 수정 - 20 hours

- [ ] 12. End-to-End Testing
  - Test complete user flow (open → play → share → leaderboard)
  - Verify Reddit API integrations
  - Test Circuit Breaker failover
  - Validate AP economy balance
  - _Requirements: All_
  - _Estimated Time: 8 hours_

- [ ] 12.1 User Flow Testing
  - Test new user onboarding
  - Test case completion flow
  - Test evidence sharing flow
  - Test Watson interaction
  - _Requirements: All_

- [ ] 12.2 Reddit Integration Testing
  - Test comment creation
  - Test Flair updates
  - Test leaderboard posting
  - Test crossposting
  - _Requirements: 1.1, 1.2, 1.3, 2.2_

- [ ] 12.3 Error Scenario Testing
  - Test Reddit API failures
  - Test Gemini API failures
  - Test Redis connection loss
  - Verify Circuit Breaker activation
  - _Requirements: 4.2_

- [ ] 12.4 AP Economy Testing
  - Verify AP awards are correct
  - Test AP deduction for Watson
  - Check for AP exploits
  - Balance challenge rewards
  - _Requirements: 2.1, 3.2_

- [ ] 13. Mobile Optimization
  - Test on iOS Safari and Android Chrome
  - Verify touch target sizes (44px minimum)
  - Test responsive layouts
  - Optimize image loading
  - _Requirements: All_
  - _Estimated Time: 4 hours_

- [ ] 13.1 Touch Target Validation
  - Measure all button sizes
  - Ensure 44px minimum
  - Add spacing between buttons
  - _Requirements: All_

- [ ] 13.2 Responsive Layout Testing
  - Test on mobile (320px - 480px)
  - Test on tablet (768px - 1024px)
  - Test on desktop (1024px+)
  - _Requirements: All_

- [ ] 13.3 Performance Optimization
  - Lazy load images
  - Minimize bundle size
  - Enable service worker caching
  - _Requirements: All_

- [ ] 14. Bug Fixes & Polish
  - Fix critical bugs found in testing
  - Improve error messages
  - Add loading states
  - Polish UI animations
  - _Requirements: All_
  - _Estimated Time: 8 hours_

- [ ] 14.1 Critical Bug Fixes
  - Fix any blocking issues
  - Resolve API integration errors
  - Fix data consistency issues
  - _Requirements: All_

- [ ] 14.2 UX Improvements
  - Add loading spinners
  - Improve error messages
  - Add success animations
  - Polish transitions
  - _Requirements: All_


---

### Day 7: 데모 준비 & 제출 - 20 hours

- [ ] 15. Demo Video Production
  - Script demo video (2 minutes)
  - Record gameplay footage
  - Show Reddit integration features
  - Highlight unique features (Watson, Cold Case teaser)
  - Add voiceover and music
  - _Requirements: All_
  - _Estimated Time: 6 hours_

- [ ] 15.1 Video Script
  - Write 2-minute script
  - Plan shot list
  - Prepare demo account
  - _Requirements: All_

- [ ] 15.2 Recording
  - Record gameplay on mobile and desktop
  - Capture Reddit integration moments
  - Record Watson interaction
  - Show leaderboard and Flair
  - _Requirements: All_

- [ ] 15.3 Editing
  - Edit footage
  - Add text overlays
  - Add background music
  - Export in 1080p
  - _Requirements: All_

- [ ] 16. Pitch Deck Creation
  - Create 10-slide pitch deck
  - Include SWOT analysis
  - Show viral metrics projections
  - Highlight Reddit-native design
  - Add competitive advantages
  - _Requirements: All_
  - _Estimated Time: 4 hours_

- [ ] 16.1 Slide Content
  - Slide 1: Hook (problem statement)
  - Slide 2-3: Solution (our game)
  - Slide 4-5: Unique features
  - Slide 6: Reddit integration
  - Slide 7: Viral mechanics
  - Slide 8: Traction (beta metrics)
  - Slide 9: Roadmap (Phase 2)
  - Slide 10: Call to action
  - _Requirements: All_

- [ ] 16.2 Design & Polish
  - Use consistent branding
  - Add screenshots
  - Include metrics charts
  - Proofread all text
  - _Requirements: All_

- [ ] 17. README & Documentation
  - Update GitHub README
  - Add installation instructions
  - Document API endpoints
  - Include architecture diagram
  - Add contribution guidelines
  - _Requirements: All_
  - _Estimated Time: 3 hours_

- [ ] 17.1 README Content
  - Project overview
  - Features list
  - Tech stack
  - Installation guide
  - Usage examples
  - _Requirements: All_

- [ ] 17.2 API Documentation
  - Document all endpoints
  - Add request/response examples
  - Include error codes
  - _Requirements: All_

- [ ] 18. Final Deployment
  - Deploy to production subreddit
  - Test in live environment
  - Monitor for errors
  - Prepare rollback plan
  - _Requirements: All_
  - _Estimated Time: 3 hours_

- [ ] 18.1 Production Deployment
  - Run `npm run deploy`
  - Verify deployment success
  - Test all features in production
  - _Requirements: All_

- [ ] 18.2 Monitoring Setup
  - Set up error alerts
  - Monitor API success rates
  - Track user engagement
  - _Requirements: All_

- [ ] 19. Submission Preparation
  - Fill out hackathon submission form
  - Upload demo video
  - Submit pitch deck
  - Provide GitHub link
  - Write submission description
  - _Requirements: All_
  - _Estimated Time: 2 hours_

- [ ] 19.1 Submission Form
  - Complete all required fields
  - Add team member info
  - Include project links
  - _Requirements: All_

- [ ] 19.2 Final Review
  - Proofread submission
  - Verify all links work
  - Test demo video playback
  - Submit before deadline
  - _Requirements: All_

- [ ] 20. Post-Submission Tasks
  - Announce launch on r/armchair_sleuths
  - Post to r/gaming and r/mystery
  - Respond to community feedback
  - Monitor for critical bugs
  - _Requirements: All_
  - _Estimated Time: 2 hours_

- [ ] 20.1 Launch Announcement
  - Write launch post
  - Include demo video link
  - Invite community to play
  - _Requirements: All_

- [ ] 20.2 Community Engagement
  - Respond to comments
  - Fix urgent bugs
  - Thank beta testers
  - _Requirements: All_


---

## Phase 2 Tasks (Post-Hackathon)

### P2 Features (Nice to Have)

- [ ]* 21. Community Cold Case
  - Design 7-day event structure
  - Create complex case with daily evidence releases
  - Implement Scheduler for daily unlocks
  - Add community submission system
  - Award special badges to top contributors
  - _Requirements: 3.1_
  - _Estimated Time: 16 hours_

- [ ]* 22. Cross-Subreddit Events
  - Negotiate partnerships with r/nosleep, r/scifi
  - Create themed cases for partner subreddits
  - Implement crosspost automation
  - Track cross-community traffic
  - Award "🌐 Cross-Community Detective" badge
  - _Requirements: 2.4_
  - _Estimated Time: 12 hours_

- [ ]* 23. Reverse Mystery Mode
  - Design "play as killer" game mode
  - Create alibi creation interface
  - Implement AI validation of alibis
  - Add scoring system for killers
  - Test with beta users
  - _Requirements: 3.3_
  - _Estimated Time: 24 hours_

- [ ]* 24. Achievement Share Card (Image Version)
  - Implement Canvas API for image generation
  - Design film noir aesthetic templates
  - Add dynamic text overlays
  - Optimize image file size
  - Test on mobile devices
  - _Requirements: 2.2_
  - _Estimated Time: 8 hours_

- [ ]* 25. Advanced Theory Voting
  - Implement NLP for theory extraction
  - Add theory similarity detection
  - Create theory leaderboard
  - Award "🧠 Master Theorist" badge
  - _Requirements: 1.4_
  - _Estimated Time: 12 hours_

---

## Time Allocation Summary

### Day 1-2: Reddit Integration (40h)
- Flair System: 4h
- Evidence Sharing: 8h
- Leaderboard: 6h
- Transparency: 3h
- **Buffer**: 19h

### Day 3-4: Viral Mechanics (40h)
- Challenges: 6h
- Referrals: 8h
- Watson: 8h
- Share Cards: 4h
- **Buffer**: 14h

### Day 5: Stabilization (20h)
- Offline Mode: 6h
- Archive: 4h
- Theory Voting: 6h
- **Buffer**: 4h

### Day 6: Testing (20h)
- E2E Tests: 8h
- Mobile: 4h
- Bug Fixes: 8h

### Day 7: Demo (20h)
- Video: 6h
- Pitch: 4h
- Docs: 3h
- Deploy: 3h
- Submit: 2h
- Launch: 2h

**Total Planned**: 140 hours  
**Total Buffer**: 37 hours (26% contingency)

---

## Risk Mitigation

### High-Risk Tasks

1. **Watson AI Integration** (8h)
   - Risk: Gemini API instability
   - Mitigation: Pre-written fallback hints
   - Fallback: Disable Watson if critical issues

2. **Leaderboard Scheduler** (6h)
   - Risk: Devvit Scheduler bugs
   - Mitigation: Manual update endpoint
   - Fallback: Static leaderboard

3. **Reddit API Rate Limits** (ongoing)
   - Risk: Hitting rate limits during testing
   - Mitigation: Circuit Breaker pattern
   - Fallback: Queue and retry

### Contingency Plans

**If behind schedule by Day 3:**
- Cut Theory Voting (P1 → P2)
- Simplify Share Cards (text only)
- Reduce Watson to 2 hint levels

**If behind schedule by Day 5:**
- Cut Offline Mode (P1 → P2)
- Cut Archive System (P1 → P2)
- Focus on core P0 features only

**If critical bug on Day 6:**
- Allocate full Day 7 to fixes
- Use pre-recorded demo video
- Simplify pitch deck

---

## Success Criteria

### Minimum Viable Product (MVP)

Must have for submission:
- ✅ Detective Rank Flair System
- ✅ Evidence Sharing in Comments
- ✅ Live Leaderboard
- ✅ Daily Challenges
- ✅ Watson AI Assistant
- ✅ Fair Play Transparency

### Stretch Goals

Nice to have:
- ⭐ Referral System
- ⭐ Offline Mode
- ⭐ Theory Voting
- ⭐ Archive System

### Demo Requirements

Must demonstrate:
- 🎬 Complete user flow (3 minutes)
- 🎬 Reddit integration (comments, Flair, leaderboard)
- 🎬 Watson interaction
- 🎬 Challenge completion
- 🎬 Mobile responsiveness

---

## Post-Launch Metrics

### Week 1 Goals

- 500+ Daily Active Users
- 40%+ Engagement Rate (comments/votes)
- 60%+ Flair Adoption
- 1.2+ Viral Coefficient

### Month 1 Goals

- 5,000+ Total Users
- 50%+ D7 Retention
- 1.5+ Viral Coefficient
- 3+ Partner Subreddits

---

**Document Version**: 1.0  
**Created**: 2025-01-24  
**Status**: Ready for Implementation  
**Total Tasks**: 20 main tasks, 60+ subtasks  
**Estimated Time**: 140 hours (7 days × 2 developers × 10 hours)

