# Murder Mystery Investigation Game - Complete UX Design

## Executive Summary

This document outlines the complete user experience design for a daily murder mystery investigation game on Reddit's Devvit platform. The design prioritizes mobile-first interaction, progressive information disclosure, and an engaging detective experience for Korean-speaking users.

**Core Design Principles:**
- Mobile-first thumb-zone optimization
- Progressive disclosure to prevent cognitive overload
- Clear feedback loops and progress indicators
- Accessibility compliance (WCAG 2.1 AA)
- Engaging detective narrative flow

---

## 1. User Research & Personas

### Primary Persona: "Commuter Detective"
- **Demographics:** Korean Reddit users, 20-35 years old
- **Context:** Playing during commute or breaks (15-30 minute sessions)
- **Devices:** Primarily mobile (iOS/Android Reddit app)
- **Behavior Patterns:**
  - Familiar with chat interfaces (KakaoTalk, LINE)
  - Expects immediate feedback
  - Enjoys narrative-driven entertainment
  - Competitive (interested in leaderboards)
  - Daily habit formation potential

### User Goals
1. Quickly understand the mystery scenario
2. Feel like a real detective gathering clues
3. Experience satisfaction from successful deduction
4. Compare performance with peers
5. Return daily for new challenges

### Pain Points to Avoid
- Information overload on small screens
- Unclear next steps in investigation
- Chat interface confusion (what should I ask?)
- Losing context or progress
- Frustration from ambiguous feedback

---

## 2. Complete User Journey Map

### Journey Overview
```
Entry → Briefing → Investigation Hub ↔ Interrogation (×3) → Deduction → Results → Share/Exit
```

### Detailed Journey Phases

#### Phase 1: ENTRY (Hook Phase)
**Duration:** 2-5 seconds
**User Goal:** Understand what this is and decide to engage
**Emotional State:** Curious → Intrigued

**Key Elements:**
- Dramatic headline: "CASE #{number}: {victim name} 살인 사건"
- Atmospheric thumbnail image (crime scene)
- Location badge: "{location name}"
- Engagement indicator: "Today's mystery - 243 detectives investigating"
- Primary CTA: "수사 시작" (Start Investigation)

**Information Hierarchy:**
1. Case number and victim name (H1, 24px, bold)
2. Dramatic one-liner summary (16px)
3. Visual hook (crime scene image, 16:9 aspect ratio)
4. Start button (48px height, full bleed on mobile)

**Design Notes:**
- Use Reddit's custom post format
- Thumbnail should be intriguing but not graphic
- Text should create urgency: "Who killed {victim}?"

---

#### Phase 2: BRIEFING (Context Phase)
**Duration:** 15-30 seconds
**User Goal:** Understand the case fundamentals
**Emotional State:** Intrigued → Engaged

**Screen Layout (Mobile 375px width):**

```
┌─────────────────────────────────────┐
│ ← Back to Feed    CASE #142    Help│
├─────────────────────────────────────┤
│                                     │
│     [Crime Scene Image]             │
│     16:9 ratio, full width          │
│                                     │
├─────────────────────────────────────┤
│ THE CRIME                          │
│ 박민수(35)가 자택에서 흉기에 찔려     │
│ 사망한 채 발견되었습니다.             │
│                                     │
│ [▼ More Details]                   │
├─────────────────────────────────────┤
│ 👤 VICTIM                          │
│ Name: 박민수 (35세, 남성)            │
│ Occupation: IT 스타트업 CEO          │
│ [▼ Background]                     │
├─────────────────────────────────────┤
│ 📍 LOCATION                        │
│ 강남구 타워팰리스 펜트하우스            │
│ [▼ Scene Details]                  │
├─────────────────────────────────────┤
│ 🔪 WEAPON                          │
│ 부엌칼 (피해자 자택에서 발견)          │
│ [▼ Forensics]                      │
├─────────────────────────────────────┤
│ 🎯 YOUR MISSION                    │
│ 3명의 용의자를 심문하고                │
│ 5W1H 답변을 제출하세요                │
│                                     │
│ ┌─────────────────────────────┐   │
│ │   수사 시작                  │   │
│ │   START INVESTIGATION        │   │
│ └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Progressive Disclosure:**
- Crime summary visible by default
- Victim, Location, Weapon collapsed initially (tap to expand)
- Details expand inline (no navigation away)
- "More Details" reveals timeline, evidence list

**Accessibility:**
- Color contrast 4.5:1 minimum
- Expandable sections have clear ARIA labels
- Focus indicator on all interactive elements
- Touch targets 44×44px minimum

---

#### Phase 3: INVESTIGATION HUB (Central Command)
**Duration:** 1-2 minutes (returns here between interrogations)
**User Goal:** Select suspects, track progress, submit answer
**Emotional State:** Engaged → Focused

**Screen Layout:**

```
┌─────────────────────────────────────┐
│ ☰ Case Notes    INVESTIGATION    ⓘ │
├─────────────────────────────────────┤
│ Progress: 2/3 suspects questioned   │
│ ████████████░░░░░ 75%              │
├─────────────────────────────────────┤
│                                     │
│ [SUSPECT CARDS - Swipeable]        │
│                                     │
│ ┌─────────────────────────────┐   │
│ │  [Photo]                     │   │
│ │  이수진                       │   │
│ │  피해자의 전 부인              │   │
│ │                              │   │
│ │  Status: ✓ QUESTIONED        │   │
│ │  Suspicion: ████░ 80%        │   │
│ │  Tone: 😠 Defensive          │   │
│ │                              │   │
│ │  [심문하기 →]                 │   │
│ └─────────────────────────────┘   │
│   ● ○ ○  (pagination dots)         │
│                                     │
├─────────────────────────────────────┤
│ QUICK REFERENCE                     │
│ • Time of death: 밤 11시-12시       │
│ • Last seen: 밤 10시 집에 도착       │
│ • Weapon: 부엌칼 (지문 없음)         │
│ [▼ All Evidence]                   │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────┐   │
│ │  범인 지목하기               │   │
│ │  SUBMIT ANSWER               │   │
│ └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
     STICKY BOTTOM BAR
```

**Suspect Card Design:**
- **Visual Hierarchy:**
  1. Suspect photo (120×120px, circular)
  2. Name (18px, bold)
  3. Relationship to victim (14px, gray)
  4. Status badge (Questioned/Not Questioned)
  5. Suspicion meter (progress bar, 0-100%)
  6. Emotional tone (emoji + label)

- **Card States:**
  - Default: Gray background, "심문하기" CTA
  - Questioned: Blue tint, "다시 심문하기" CTA
  - Selected: Enlarged 110%, subtle shadow

- **Interaction:**
  - Tap card → Modal with full profile
  - Swipe left/right to cycle suspects
  - Long press → Quick actions menu

**Progress Indicators:**
- Top bar: "2/3 suspects questioned"
- Visual progress bar (75% complete)
- Suspect cards show checkmarks when questioned
- Message counter on each suspect card

**Navigation:**
- Top left: Hamburger menu → Case notes drawer
- Top right: Help icon → Tutorial overlay
- Bottom sticky bar: Submit answer (primary CTA)

---

#### Phase 4: INTERROGATION (Chat Interface)
**Duration:** 5-10 minutes per suspect
**User Goal:** Extract information through conversation
**Emotional State:** Focused → Investigative

**Screen Layout:**

```
┌─────────────────────────────────────┐
│ ← Back to Suspects                  │
├─────────────────────────────────────┤
│ [Suspect Photo] 이수진               │
│ 피해자의 전 부인 • 😠 Defensive      │
├─────────────────────────────────────┤
│                                     │
│ [CHAT MESSAGES AREA]                │
│ Scrollable, auto-scroll to bottom   │
│                                     │
│ ┌──────────────────────┐            │
│ │ 당신은 어디에 있었나요? │ (You)    │
│ └──────────────────────┘            │
│                                     │
│     ┌──────────────────────┐        │
│     │ 집에 있었어요.         │        │
│     │ 11시쯤 잤습니다.       │        │
│     └──────────────────────┘        │
│       11:23 PM                      │
│                                     │
│ [AI typing indicator: ...]          │
│                                     │
├─────────────────────────────────────┤
│ SUGGESTED QUESTIONS                 │
│ [알리바이를 물어보세요]             │
│ [동기에 대해 물어보세요]            │
│ [모순점을 지적하세요]               │
├─────────────────────────────────────┤
│ [Type your question...]   [Send →] │
│                                     │
└─────────────────────────────────────┘
     STICKY BOTTOM INPUT
```

**Chat UX Patterns:**

**Message Display:**
- User messages: Right-aligned, blue background
- Suspect messages: Left-aligned, gray background
- Timestamps on all messages (subtle, 11px)
- Message delivered animation (slide up + fade in)
- Suspicious answers: Yellow highlight border
- Contradictions: Red "!" icon in corner

**Suggested Questions:**
- 3-4 chips above input field
- Context-aware suggestions based on:
  - Investigation stage (early → alibi, late → confrontation)
  - Previous conversation (follow-up questions)
  - Suspect profile (relationship-specific questions)
- Tap chip to auto-fill input
- Chips rotate after use (new suggestions appear)

**Examples (Korean):**
```
Early Stage:
- "사건 당시 어디에 있었습니까?" (Where were you?)
- "피해자와 마지막으로 본 게 언제입니까?" (When did you last see the victim?)
- "당신의 관계는 어땠습니까?" (What was your relationship?)

Mid Stage:
- "왜 그곳에 있었습니까?" (Why were you there?)
- "증인이 있습니까?" (Do you have witnesses?)
- "피해자와 다툰 적 있습니까?" (Did you argue with the victim?)

Late Stage:
- "왜 거짓말을 하시나요?" (Why are you lying?)
- "이 모순을 설명하세요" (Explain this contradiction)
- "증거를 어떻게 설명하시겠습니까?" (How do you explain this evidence?)
```

**Input Field:**
- Placeholder: "{Suspect name}에게 질문하세요..."
- Auto-focus on screen load
- Character limit: 200 (with counter at 150+)
- Disabled state while AI processing
- Send button disabled if empty

**Feedback States:**
- Typing: Animated "..." bubble from suspect
- Processing: "생각 중..." (Thinking...) indicator
- Error: "응답을 받지 못했습니다. 다시 시도하세요" toast
- Success: Smooth message append with animation

**Accessibility:**
- Messages announced by screen readers in order
- Suggested questions labeled as "quick question buttons"
- Input field labeled "Ask a question"
- Send button has clear label "Send message"

---

#### Phase 5: DEDUCTION (Answer Submission)
**Duration:** 2-5 minutes
**User Goal:** Submit final answer with confidence
**Emotional State:** Reflective → Decisive

**Multi-Step Form Pattern:**

**Step 1/6 - WHO (범인)**
```
┌─────────────────────────────────────┐
│ Step 1 of 6: 범인 지목              │
│ ████░░░░░░░░ 16%                   │
├─────────────────────────────────────┤
│                                     │
│ 당신의 조사를 바탕으로,              │
│ 누가 박민수를 살해했다고 생각하십니까? │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ ▼ 용의자 선택                │   │
│ │                              │   │
│ │ ○ 이수진 (전 부인)           │   │
│ │ ○ 김태현 (비즈니스 파트너)    │   │
│ │ ○ 박지영 (현재 연인)          │   │
│ └─────────────────────────────┘   │
│                                     │
│ Confidence: ★★★★☆                 │
│ (Optional: How confident are you?) │
│                                     │
├─────────────────────────────────────┤
│ [← Previous]      [Next: WHY →]    │
└─────────────────────────────────────┘
```

**Step 2/6 - WHY (동기)**
```
┌─────────────────────────────────────┐
│ Step 2 of 6: 살인 동기              │
│ ████████░░░░ 33%                   │
├─────────────────────────────────────┤
│                                     │
│ 범인의 동기는 무엇이라고 생각하십니까? │
│                                     │
│ ┌─────────────────────────────┐   │
│ │                              │   │
│ │ [Text area]                  │   │
│ │ 최소 20자 이상 작성해주세요    │   │
│ │                              │   │
│ │ 15/200 characters            │   │
│ └─────────────────────────────┘   │
│                                     │
│ 💡 Tip: 재정적, 감정적, 또는       │
│ 복수 동기를 고려하세요               │
│                                     │
├─────────────────────────────────────┤
│ [← Previous]      [Next: HOW →]    │
└─────────────────────────────────────┘
```

**Steps 3-6:** Similar pattern for HOW, WHEN, WHERE, WHAT

**Step 7 - REVIEW & SUBMIT**
```
┌─────────────────────────────────────┐
│ 답변 확인                            │
│ ████████████ 100%                  │
├─────────────────────────────────────┤
│                                     │
│ WHO (범인)                          │
│ ├─ 이수진 (전 부인)                 │
│ └─ Edit                            │
│                                     │
│ WHY (동기)                          │
│ ├─ 재산 분할 문제로 갈등...          │
│ └─ Edit                            │
│                                     │
│ HOW (방법)                          │
│ ├─ 부엌칼을 이용해...                │
│ └─ Edit                            │
│                                     │
│ [Full review with edit links]       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│ ⚠️ 제출 후에는 수정할 수 없습니다    │
│                                     │
│ ┌─────────────────────────────┐   │
│ │   최종 제출                  │   │
│ │   SUBMIT FINAL ANSWER        │   │
│ └─────────────────────────────┘   │
│                                     │
│ [← Go Back and Review]              │
│                                     │
└─────────────────────────────────────┘
```

**Form UX Patterns:**

**Progressive Form Benefits:**
- Reduces cognitive load (one question at a time)
- Feels conversational, not like homework
- Clear progress indicator reduces anxiety
- Easy navigation between steps
- Review step prevents submission errors

**Validation:**
- Real-time validation (not on submit)
- WHO: Dropdown prevents typos
- WHY/HOW/WHAT: Minimum 20 characters required
- WHEN/WHERE: Structured input (time range, location from list)
- Character counters appear at 75% of limit
- Inline error messages (red text, icon)

**Confidence Meter (Optional):**
- 5-star rating: "얼마나 확신하십니까?"
- Gamification: High confidence + correct = bonus points
- Low confidence + correct = no penalty (encourages completion)

**Error Prevention:**
- Confirmation modal before final submit
- "Are you sure?" with summary preview
- Clear "Go Back" vs "Confirm" buttons
- Auto-save drafts to local storage
- Session recovery if page closed

---

#### Phase 6: RESULTS (Resolution & Payoff)
**Duration:** 1-2 minutes
**User Goal:** See if they were right, understand the answer
**Emotional State:** Anxious → Satisfied/Disappointed → Motivated

**Reveal Animation Sequence:**

**6A. Initial Reveal (Big Moment)**
```
┌─────────────────────────────────────┐
│                                     │
│         [Animated Reveal]           │
│                                     │
│            🎉 정답!                 │
│       YOU SOLVED THE CASE!          │
│                                     │
│  [Confetti animation, 2 seconds]    │
│                                     │
│         Score: 87/100               │
│                                     │
└─────────────────────────────────────┘
```

OR

```
┌─────────────────────────────────────┐
│                                     │
│         [Animated Reveal]           │
│                                     │
│            😔 아쉽네요              │
│         NOT QUITE RIGHT             │
│                                     │
│  [Fade animation, 2 seconds]        │
│                                     │
│         Score: 45/100               │
│                                     │
└─────────────────────────────────────┘
```

**6B. Score Breakdown (Progressive Reveal)**
```
┌─────────────────────────────────────┐
│ YOUR PERFORMANCE                    │
├─────────────────────────────────────┤
│                                     │
│ Overall Score: 87/100 🎉            │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ WHO (범인)        ✓ +20     │   │
│ │ Correct: 이수진              │   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ WHY (동기)        ✓ +18     │   │
│ │ 90% match with actual motive │   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ HOW (방법)        ✗ +10     │   │
│ │ Partial match                │   │
│ └─────────────────────────────┘   │
│                                     │
│ [Expand each for details]           │
│                                     │
├─────────────────────────────────────┤
│ ACTUAL ANSWER                       │
│                                     │
│ 이수진이 재산 분할 분쟁으로...        │
│ [Full explanation of the crime]     │
│                                     │
│ [▼ Read Full Story]                │
│                                     │
└─────────────────────────────────────┘
```

**6C. Leaderboard & Social**
```
┌─────────────────────────────────────┐
│ 🏆 TODAY'S LEADERBOARD              │
├─────────────────────────────────────┤
│                                     │
│ 1. 🥇 u/detective_kim    100 pts   │
│ 2. 🥈 u/mystery_lover    98 pts    │
│ 3. 🥉 u/sherlock_jr      95 pts    │
│ ...                                 │
│ 47. 👤 YOU               87 pts    │  ← Highlighted
│ ...                                 │
│ 156. u/newbie            45 pts    │
│                                     │
│ [View Full Leaderboard →]          │
│                                     │
├─────────────────────────────────────┤
│ COMMUNITY STATS                     │
│                                     │
│ • 243 detectives solved this case   │
│ • Average score: 68/100             │
│ • 67% guessed the wrong suspect     │
│ • Most common mistake: 동기 추론    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────┐   │
│ │  Share Your Result          │   │
│ │  Reddit • Twitter • Copy     │   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │  Return to r/ArmchairSleuths│   │
│ └─────────────────────────────┘   │
│                                     │
│ Next case available in: 6h 23m      │
│                                     │
└─────────────────────────────────────┘
```

**Results Screen UX:**

**Emotional Journey:**
1. Big reveal (correct/incorrect) - 2 second animation
2. Score display - Immediate gratification/disappointment
3. Breakdown - Understanding what went right/wrong
4. Actual answer - Closure and learning
5. Leaderboard - Social comparison
6. Share - Amplification and social proof

**Progressive Disclosure:**
- Initial reveal (big emotion)
- Score breakdown (each section expandable)
- Full story (collapsed by default, "Read Full Story" CTA)
- Leaderboard (your position highlighted, scroll to see more)

**Feedback Patterns:**
- Visual: Color coding (green ✓, red ✗, yellow ~)
- Numeric: Point values for each section
- Comparative: "90% match with actual motive"
- Explanatory: Brief explanation of scoring

**Engagement Hooks:**
- Leaderboard position (competitive)
- Community stats (social proof)
- "Next case in X hours" (anticipation)
- Share functionality (viral potential)
- Streak tracking: "5-day solving streak! 🔥"

---

## 3. Information Architecture

### Screen Hierarchy

```
Entry Point (Reddit Post)
│
├─ Case Briefing
│  ├─ Crime Summary (Priority 1)
│  ├─ Victim Profile (Priority 2, collapsible)
│  ├─ Location Details (Priority 2, collapsible)
│  ├─ Weapon Info (Priority 2, collapsible)
│  └─ Mission Brief (Priority 3)
│
├─ Investigation Hub (Central Command)
│  ├─ Progress Tracker (top bar)
│  ├─ Suspect Cards (Priority 1, swipeable)
│  │  ├─ Quick Info (visible)
│  │  └─ Full Profile (modal on tap)
│  ├─ Quick Reference (Priority 2, collapsible)
│  │  ├─ Key Facts
│  │  ├─ Timeline
│  │  └─ Evidence List
│  └─ Submit Answer CTA (bottom sticky)
│
├─ Interrogation Screen (per suspect)
│  ├─ Suspect Context Bar (Priority 1, sticky top)
│  ├─ Chat Messages (Priority 1, scrollable)
│  ├─ Suggested Questions (Priority 2, above input)
│  └─ Message Input (Priority 1, sticky bottom)
│
├─ Deduction Form (Multi-step)
│  ├─ Progress Indicator (top bar)
│  ├─ Current Question (Priority 1)
│  ├─ Input Field (Priority 1)
│  ├─ Helpful Tips (Priority 3, subtle)
│  ├─ Navigation (bottom, Previous/Next)
│  └─ Review & Submit (final step)
│
└─ Results Screen
   ├─ Big Reveal (Priority 1, animated)
   ├─ Score Breakdown (Priority 2, expandable)
   ├─ Actual Answer (Priority 2, collapsible)
   ├─ Leaderboard (Priority 3, scrollable)
   └─ Share/Exit CTAs (bottom)
```

### Content Priority Matrix

| Screen | Must See | Should See | Nice to Have |
|--------|----------|------------|--------------|
| **Entry** | Victim name, hook | Location, case # | Daily counter |
| **Briefing** | Crime summary | Victim/location/weapon | Evidence details |
| **Investigation Hub** | Suspect cards, progress | Quick reference | Tips |
| **Interrogation** | Chat, suspect context | Suggested questions | Message count |
| **Deduction** | Current question, input | Progress bar | Tips, examples |
| **Results** | Correct/incorrect, score | Breakdown, answer | Leaderboard, stats |

---

## 4. Navigation Patterns & Transitions

### Navigation Model

**Primary Navigation: Linear with Strategic Branches**

```
Entry → Briefing → Investigation Hub
                        ↓
                   ┌────┴────┬────────────┐
                   ↓         ↓            ↓
              Suspect A  Suspect B   Suspect C
              (Chat)     (Chat)      (Chat)
                   └────┬────┴────────────┘
                        ↓
                   Investigation Hub
                        ↓
                   Deduction Form
                        ↓
                   Results
```

**Navigation Patterns:**

**1. Sticky Bottom Bar (Context-Aware)**
- **Investigation Hub:** "Submit Answer" primary CTA
- **Interrogation:** Message input field + Send
- **Deduction:** Next/Previous navigation
- **Results:** Share + Return to subreddit

**2. Escape Hatches**
- Top-left: Always shows "back" or "close" with label
- Top-right: Help icon (persistent across screens)
- Case name in header: Tap to return to hub (breadcrumb)

**3. Modal Overlays (Non-Blocking Info)**
- Suspect full profile: Slide up from bottom
- Case notes: Slide in from left (drawer)
- Help/tutorial: Fade in overlay with backdrop
- Dismiss: Swipe down, tap backdrop, or × button

**4. Breadcrumb Trail**
```
Investigation > Suspect: 이수진 > Chat
                  ↑ Tappable to return
```

**5. Swipe Gestures**
- Left/right: Cycle suspect cards
- Down: Dismiss modals
- Up: Pull-to-refresh case notes

### Transition Animations

**Screen Transitions:**
- Forward navigation: Slide left (300ms ease-out)
- Backward navigation: Slide right (300ms ease-out)
- Modal open: Slide up + fade (250ms)
- Modal close: Slide down + fade (200ms)

**Micro-Interactions:**
- Button tap: Scale 0.95 (100ms)
- Card selection: Elevation increase (200ms)
- Message send: Slide up + fade in (250ms)
- Progress bar: Smooth width transition (500ms ease)

**Loading States:**
- Skeleton screens (not spinners) for content loading
- Shimmer effect on placeholder elements
- Maintain layout stability (no content shift)

---

## 5. Mobile-First Layout Recommendations

### Thumb Zone Optimization

**Mobile Screen Zones (375×667px reference):**

```
┌─────────────────────────────────────┐
│ HARD TO REACH (Top 33%)             │ ← Context, navigation
│ - Header, breadcrumbs               │
│ - Non-critical info                 │
├─────────────────────────────────────┤
│ EASY TO REACH (Middle 33%)          │ ← Content
│ - Primary content                   │
│ - Scrollable area                   │
├─────────────────────────────────────┤
│ THUMB ZONE (Bottom 33%)             │ ← Primary actions
│ - Primary CTA                       │
│ - Input fields                      │
│ - Navigation controls               │
└─────────────────────────────────────┘
```

### Responsive Breakpoints

**Mobile-First Approach:**

```css
/* Base: Mobile (320px+) */
.suspect-card {
  width: 100%;
  padding: 16px;
  font-size: 14px;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .suspect-card {
    width: calc(50% - 16px); /* 2 columns */
    padding: 20px;
    font-size: 16px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .suspect-card {
    width: calc(33.333% - 16px); /* 3 columns */
    padding: 24px;
  }
}
```

### Touch Target Sizing

**WCAG Compliant Touch Targets:**
- Minimum: 44×44px (WCAG Level AAA)
- Recommended: 48×48px
- Spacing: 8px between adjacent targets
- Primary buttons: 48px height, full width on mobile

**Examples:**
```css
/* Primary button */
.btn-primary {
  min-height: 48px;
  padding: 12px 24px;
  width: 100%;
  touch-action: manipulation; /* Prevent double-tap zoom */
}

/* Icon button */
.btn-icon {
  width: 44px;
  height: 44px;
  padding: 10px;
}

/* Suggested question chip */
.question-chip {
  min-height: 44px;
  padding: 10px 16px;
  margin: 4px; /* 8px spacing */
}
```

### Typography Scale (Mobile)

```css
/* Heading hierarchy */
h1 { font-size: 24px; line-height: 1.2; font-weight: 700; }
h2 { font-size: 20px; line-height: 1.3; font-weight: 600; }
h3 { font-size: 18px; line-height: 1.4; font-weight: 600; }

/* Body text */
.body-large { font-size: 16px; line-height: 1.5; }
.body-base { font-size: 14px; line-height: 1.5; }
.body-small { font-size: 12px; line-height: 1.4; }

/* Minimum readable size: 14px for body text */
```

### Layout Patterns

**Card-Based Layout:**
```
┌────────────────────┐
│  [Image]           │
│  Title             │
│  Subtitle          │
│  [Status Badge]    │
│  [Progress Bar]    │
│  [CTA Button]      │
└────────────────────┘
```

**List-Based Layout:**
```
┌────────────────────────┐
│ [Icon] Title      [>]  │
│        Subtitle         │
├────────────────────────┤
│ [Icon] Title      [>]  │
│        Subtitle         │
└────────────────────────┘
```

**Form Layout:**
```
┌────────────────────────┐
│ Label                  │
│ ┌────────────────────┐ │
│ │ Input field        │ │
│ └────────────────────┘ │
│ Helper text            │
├────────────────────────┤
│ [Submit Button]        │
└────────────────────────┘
```

---

## 6. Interaction Patterns

### Chat Interface (Detailed Spec)

**Message Components:**

```tsx
// User message (right-aligned)
<div className="message-user">
  <div className="bubble bg-blue-600 text-white">
    <p className="text-sm">당신은 어디에 있었나요?</p>
    <span className="timestamp">11:23 PM</span>
  </div>
</div>

// Suspect message (left-aligned)
<div className="message-suspect">
  <div className="bubble bg-gray-800 text-gray-100">
    <p className="text-sm">집에 있었어요. 11시쯤 잤습니다.</p>
    <span className="timestamp">11:24 PM</span>
  </div>
  <span className="indicator suspicious">!</span> {/* If suspicious */}
</div>
```

**Suggested Questions Pattern:**

```tsx
<div className="suggested-questions">
  <button className="chip" onClick={handleChipClick}>
    알리바이를 물어보세요
  </button>
  <button className="chip" onClick={handleChipClick}>
    동기에 대해 물어보세요
  </button>
  <button className="chip" onClick={handleChipClick}>
    모순점을 지적하세요
  </button>
</div>
```

**States:**
- Chip hover: Subtle scale (1.05)
- Chip tap: Fill background
- After use: Fade out, new chip fade in
- Empty state: Show placeholder chips

**Input Field States:**

```tsx
// Default
<input
  type="text"
  placeholder="이수진에게 질문하세요..."
  className="input-default"
/>

// Focus
<input className="input-focus ring-2 ring-blue-500" />

// Disabled (AI processing)
<input disabled className="input-disabled opacity-60" />

// Error
<input className="input-error border-red-500" />
<p className="error-message">메시지를 전송할 수 없습니다</p>
```

**Send Button States:**

```tsx
// Enabled
<button className="btn-send bg-blue-600 hover:bg-blue-700">
  전송
</button>

// Disabled (empty input)
<button disabled className="btn-send bg-gray-600 cursor-not-allowed">
  전송
</button>

// Loading
<button disabled className="btn-send">
  <Spinner /> 전송 중...
</button>
```

### Suspect Card Interaction

**Card States:**

```css
/* Default */
.suspect-card {
  background: #1f2937; /* gray-800 */
  border: 2px solid transparent;
  transform: scale(1);
  transition: all 200ms ease;
}

/* Hover (desktop) */
.suspect-card:hover {
  background: #374151; /* gray-700 */
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
}

/* Selected */
.suspect-card.selected {
  background: #2563eb; /* blue-600 */
  border: 2px solid #3b82f6; /* blue-500 */
  transform: scale(1.05);
}

/* Questioned */
.suspect-card.questioned {
  border-left: 4px solid #10b981; /* green-500 */
}

/* Questioned + Selected */
.suspect-card.questioned.selected {
  background: #1e40af; /* blue-700 */
}
```

**Tap Interaction Flow:**
1. User taps card → Haptic feedback (mobile)
2. Card scales to 0.95 (100ms)
3. Card scales back to 1.05 (100ms)
4. Modal slides up from bottom (250ms)
5. Backdrop fades in (250ms)

### Form Input Patterns

**Dropdown (WHO):**

```tsx
<select className="dropdown">
  <option value="">용의자를 선택하세요</option>
  <option value="suspect1">이수진 (전 부인)</option>
  <option value="suspect2">김태현 (비즈니스 파트너)</option>
  <option value="suspect3">박지영 (현재 연인)</option>
</select>

// Validation
{!selectedSuspect && (
  <p className="error">범인을 선택해주세요</p>
)}
```

**Text Area (WHY/HOW/WHAT):**

```tsx
<textarea
  className="textarea"
  placeholder="최소 20자 이상 작성해주세요"
  minLength={20}
  maxLength={200}
  value={answer}
  onChange={handleChange}
/>

<div className="char-counter">
  {answer.length}/200 characters
  {answer.length < 20 && (
    <span className="error">(최소 {20 - answer.length}자 더 필요)</span>
  )}
</div>

// Validation
{answer.length < 20 && (
  <p className="error">최소 20자 이상 작성해주세요</p>
)}
```

**Time Range (WHEN):**

```tsx
<div className="time-range">
  <label>From</label>
  <input type="time" value={startTime} onChange={...} />

  <label>To</label>
  <input type="time" value={endTime} onChange={...} />
</div>

// Validation
{startTime >= endTime && (
  <p className="error">종료 시간은 시작 시간 이후여야 합니다</p>
)}
```

### Button Patterns

**Primary Button:**
```css
.btn-primary {
  background: #d93900; /* Reddit orange */
  color: white;
  border: none;
  border-radius: 24px; /* Pill shape */
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  min-height: 48px;
  width: 100%;
  cursor: pointer;
  transition: all 200ms ease;
}

.btn-primary:hover {
  background: #b83000;
  box-shadow: 0 4px 8px rgba(217, 57, 0, 0.3);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:disabled {
  background: #6b7280; /* gray-500 */
  cursor: not-allowed;
  opacity: 0.6;
}
```

**Secondary Button:**
```css
.btn-secondary {
  background: transparent;
  color: #d93900;
  border: 2px solid #d93900;
  /* Same other properties as primary */
}

.btn-secondary:hover {
  background: rgba(217, 57, 0, 0.1);
}
```

**Tertiary Button (Text Only):**
```css
.btn-tertiary {
  background: transparent;
  color: #9ca3af; /* gray-400 */
  border: none;
  padding: 12px 16px;
  min-height: 44px;
  font-size: 14px;
  text-decoration: underline;
}

.btn-tertiary:hover {
  color: #d1d5db; /* gray-300 */
}
```

---

## 7. Feedback Loops & Progress Indicators

### Progress Tracking

**Investigation Progress:**
```tsx
<div className="progress-tracker">
  <p className="progress-label">
    Progress: {questionedCount}/3 suspects questioned
  </p>
  <div className="progress-bar">
    <div
      className="progress-fill"
      style={{ width: `${(questionedCount / 3) * 100}%` }}
    />
  </div>
  <p className="progress-percentage">{Math.round((questionedCount / 3) * 100)}%</p>
</div>
```

**Visual States:**
- 0% (Not started): Gray bar, "시작하세요"
- 1-33% (Early): Yellow bar, "계속 조사하세요"
- 34-66% (Mid): Orange bar, "잘하고 있습니다"
- 67-99% (Late): Blue bar, "거의 다 왔습니다"
- 100% (Complete): Green bar, "제출 준비 완료!"

**Deduction Form Progress:**
```tsx
<div className="step-indicator">
  <p>Step {currentStep} of 6</p>
  <div className="steps">
    <div className="step completed">WHO</div>
    <div className="step completed">WHY</div>
    <div className="step active">HOW</div>
    <div className="step pending">WHEN</div>
    <div className="step pending">WHERE</div>
    <div className="step pending">WHAT</div>
  </div>
</div>
```

### Action Feedback

**Success Feedback:**
```tsx
// Toast notification
<div className="toast toast-success">
  ✓ 메시지가 전송되었습니다
</div>

// Inline confirmation
<div className="inline-success">
  <CheckIcon /> Saved
</div>

// State change
<div className="suspect-card questioned">
  <Badge color="green">✓ Questioned</Badge>
</div>
```

**Error Feedback:**
```tsx
// Toast notification
<div className="toast toast-error">
  ✗ 전송 실패. 다시 시도하세요
  <button onClick={retry}>Retry</button>
</div>

// Inline error
<div className="inline-error">
  <AlertIcon /> 최소 20자 이상 작성해주세요
</div>

// Form validation error
<input className="input-error" />
<p className="error-message">This field is required</p>
```

**Loading Feedback:**
```tsx
// Skeleton screen (preferred)
<div className="skeleton-card">
  <div className="skeleton-image" />
  <div className="skeleton-text" />
  <div className="skeleton-text short" />
</div>

// Spinner (fallback)
<div className="spinner-container">
  <Spinner size="large" />
  <p>Loading...</p>
</div>

// Inline loading
<button disabled>
  <Spinner size="small" /> Processing...
</button>
```

### Milestone Feedback

**Clue Discovery:**
```tsx
<div className="toast toast-clue">
  💡 새로운 단서 발견!
  <p>"피해자는 11시에 귀가했습니다"</p>
</div>
```

**All Suspects Questioned:**
```tsx
<div className="toast toast-milestone">
  🎯 모든 용의자를 심문했습니다!
  <p>이제 답변을 제출할 준비가 되었습니다</p>
  <button onClick={goToDeduction}>Submit Answer</button>
</div>
```

**Answer Submitted:**
```tsx
<div className="toast toast-submitted">
  ✓ 답변이 제출되었습니다
  <p>결과를 확인하세요...</p>
</div>
```

---

## 8. Error Prevention & Recovery

### Input Validation

**Real-Time Validation:**
```tsx
// Character count validation
{answer.length < 20 && answer.length > 0 && (
  <p className="validation-hint">
    {20 - answer.length}자 더 필요합니다
  </p>
)}

// Email format (if used)
{email && !isValidEmail(email) && (
  <p className="validation-error">
    올바른 이메일 형식이 아닙니다
  </p>
)}

// Required field
{submitted && !value && (
  <p className="validation-error">
    이 항목은 필수입니다
  </p>
)}
```

**Prevent Invalid Submissions:**
```tsx
<button
  onClick={handleSubmit}
  disabled={!isFormValid()}
  className="btn-primary"
>
  Submit
</button>

function isFormValid() {
  return (
    selectedSuspect &&
    motive.length >= 20 &&
    method.length >= 20 &&
    timeRange.start < timeRange.end &&
    location &&
    evidence.length >= 20
  );
}
```

### Confirmation Dialogs

**Destructive Actions:**
```tsx
// Before final submission
<Modal isOpen={showConfirmation}>
  <h2>최종 제출 확인</h2>
  <p>제출 후에는 수정할 수 없습니다</p>

  <div className="answer-summary">
    <p><strong>WHO:</strong> {suspect}</p>
    <p><strong>WHY:</strong> {motive.substring(0, 50)}...</p>
    {/* ... */}
  </div>

  <div className="modal-actions">
    <button onClick={onCancel} className="btn-secondary">
      Go Back and Review
    </button>
    <button onClick={onConfirm} className="btn-primary">
      Confirm Submission
    </button>
  </div>
</Modal>
```

### Auto-Save & Session Recovery

**Draft Saving:**
```tsx
// Save to local storage on input change
useEffect(() => {
  const draft = {
    suspect: selectedSuspect,
    motive,
    method,
    timestamp: Date.now()
  };
  localStorage.setItem('case-draft', JSON.stringify(draft));
}, [selectedSuspect, motive, method]);

// Restore on mount
useEffect(() => {
  const draft = localStorage.getItem('case-draft');
  if (draft) {
    const { suspect, motive, method, timestamp } = JSON.parse(draft);

    // Only restore if less than 24 hours old
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
      showRestorePrompt(draft);
    }
  }
}, []);
```

**Session Recovery Prompt:**
```tsx
<Modal isOpen={hasRecoverableSession}>
  <h2>이전 조사를 계속하시겠습니까?</h2>
  <p>저장된 답변 초안이 있습니다</p>

  <div className="modal-actions">
    <button onClick={discardDraft} className="btn-secondary">
      Start Fresh
    </button>
    <button onClick={restoreDraft} className="btn-primary">
      Continue Previous Session
    </button>
  </div>
</Modal>
```

### Network Error Handling

**Retry Mechanism:**
```tsx
async function sendMessage(message, retries = 3) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error('Network error');

    return response.json();
  } catch (error) {
    if (retries > 0) {
      // Exponential backoff
      await delay(1000 * (4 - retries));
      return sendMessage(message, retries - 1);
    }

    throw error;
  }
}
```

**Error UI:**
```tsx
{error && (
  <div className="error-banner">
    <p>메시지를 전송할 수 없습니다</p>
    <button onClick={retry}>Retry</button>
    <button onClick={dismiss}>Dismiss</button>
  </div>
)}
```

### Timeout Handling

**Chat Timeout:**
```tsx
// Show timeout warning at 25 seconds
setTimeout(() => {
  if (!responseReceived) {
    showWarning('응답이 지연되고 있습니다...');
  }
}, 25000);

// Timeout at 30 seconds
setTimeout(() => {
  if (!responseReceived) {
    showError('응답 시간 초과. 다시 시도하세요');
    enableRetry();
  }
}, 30000);
```

---

## 9. Accessibility (WCAG 2.1 AA Compliance)

### Color Contrast

**Minimum Contrast Ratios:**
- Body text (14px+): 4.5:1
- Large text (18px+ or 14px+ bold): 3:1
- UI components: 3:1
- Focus indicators: 3:1

**Color Palette (Accessible):**
```css
/* Text on dark background */
--text-primary: #ffffff;    /* White - 21:1 on gray-900 */
--text-secondary: #d1d5db;  /* Gray-300 - 12.63:1 on gray-900 */
--text-tertiary: #9ca3af;   /* Gray-400 - 7.37:1 on gray-900 */

/* Interactive elements */
--primary: #d93900;         /* Reddit orange */
--primary-hover: #b83000;
--success: #10b981;         /* Green-500 */
--error: #ef4444;           /* Red-500 */
--warning: #f59e0b;         /* Yellow-500 */

/* Backgrounds */
--bg-primary: #111827;      /* Gray-900 */
--bg-secondary: #1f2937;    /* Gray-800 */
--bg-tertiary: #374151;     /* Gray-700 */
```

**Validation:**
- Use WebAIM contrast checker
- Test all text/background combinations
- Ensure error messages meet 4.5:1 ratio

### Keyboard Navigation

**Focus Indicators:**
```css
/* Clear focus outline */
*:focus {
  outline: 2px solid #3b82f6; /* Blue-500 */
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  *:focus {
    outline-width: 3px;
    outline-color: currentColor;
  }
}
```

**Tab Order:**
```html
<!-- Logical tab order (no tabindex hacks) -->
<div className="investigation-hub">
  <!-- 1. Navigation -->
  <button>Back</button>
  <button>Help</button>

  <!-- 2. Main content -->
  <div className="suspects">
    <button tabindex="0">Suspect 1</button>
    <button tabindex="0">Suspect 2</button>
    <button tabindex="0">Suspect 3</button>
  </div>

  <!-- 3. Secondary actions -->
  <button>Case Notes</button>

  <!-- 4. Primary action -->
  <button className="btn-primary">Submit Answer</button>
</div>
```

**Keyboard Shortcuts:**
- `Tab`: Navigate forward
- `Shift+Tab`: Navigate backward
- `Enter/Space`: Activate button
- `Esc`: Close modal/drawer
- `Arrow keys`: Navigate suggestions (chat interface)

### Screen Reader Support

**ARIA Labels:**
```tsx
// Descriptive button labels
<button aria-label="심문하기: 이수진 (전 부인)">
  심문하기
</button>

// Progress indicators
<div
  role="progressbar"
  aria-valuenow={66}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Investigation progress: 2 of 3 suspects questioned"
>
  <div style={{ width: '66%' }} />
</div>

// Live regions for dynamic content
<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {newMessage && `${suspectName}: ${newMessage}`}
</div>

// Form inputs
<label htmlFor="motive-input">
  살인 동기 (Why did they do it?)
</label>
<textarea
  id="motive-input"
  aria-describedby="motive-hint"
  aria-invalid={errors.motive ? "true" : "false"}
/>
<p id="motive-hint">최소 20자 이상 작성해주세요</p>
{errors.motive && (
  <p role="alert">{errors.motive}</p>
)}
```

**Semantic HTML:**
```tsx
// Use proper heading hierarchy
<h1>사건 개요</h1>
  <h2>피해자</h2>
  <h2>장소</h2>
  <h2>무기</h2>

// Use semantic elements
<main>
  <article className="case-overview">...</article>
  <nav aria-label="Suspect navigation">...</nav>
  <form aria-label="Deduction submission">...</form>
</main>

// Use lists for grouped content
<ul aria-label="Suspects">
  <li>
    <button>이수진</button>
  </li>
</ul>
```

**Screen Reader Only Text:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Motion & Animation

**Respect User Preferences:**
```css
/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Essential animations only */
@media (prefers-reduced-motion: reduce) {
  .message-animation {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

### Image Alternatives

**Alternative Text:**
```tsx
// Crime scene image
<img
  src={crimeSceneUrl}
  alt="강남구 타워팰리스 펜트하우스 거실. 바닥에 흩어진 가구와 깨진 유리창이 보임."
/>

// Suspect photo
<img
  src={suspectPhoto}
  alt="이수진의 증명사진. 30대 여성, 검은 머리, 회색 블레이저 착용"
/>

// Decorative images
<img
  src={decorativeIcon}
  alt=""
  role="presentation"
/>
```

---

## 10. UX Enhancements Beyond Spec

### 1. Detective Notebook Feature

**Purpose:** Help users track clues and organize thoughts

**Implementation:**
```tsx
<button
  className="notebook-toggle"
  onClick={openNotebook}
  aria-label="Open detective notebook"
>
  📒 Notes
</button>

<Drawer isOpen={notebookOpen} onClose={closeNotebook}>
  <h2>Detective Notes</h2>

  <textarea
    value={userNotes}
    onChange={(e) => setUserNotes(e.target.value)}
    placeholder="Write your observations here..."
    className="notebook-textarea"
  />

  <div className="auto-clues">
    <h3>Discovered Clues</h3>
    <ul>
      {clues.map(clue => (
        <li key={clue.id}>
          <span className="clue-icon">💡</span>
          {clue.text}
        </li>
      ))}
    </ul>
  </div>

  <button onClick={saveNotes}>Save Notes</button>
</Drawer>
```

**Benefits:**
- Reduces cognitive load (external memory)
- Helps users organize information
- Auto-populates with discovered clues
- Persists between sessions

---

### 2. Conversation Summary

**Purpose:** Help users recall what they learned from each suspect

**Implementation:**
```tsx
// After finishing interrogation
<div className="conversation-summary">
  <h3>Key Points from {suspectName}</h3>

  <ul className="key-points">
    {aiGeneratedSummary.map(point => (
      <li key={point.id}>
        <span className="bullet">•</span>
        {point.text}
        {point.suspicious && <Badge color="yellow">Suspicious</Badge>}
      </li>
    ))}
  </ul>

  <button onClick={backToHub}>Return to Investigation</button>
</div>
```

**AI Prompt for Summary:**
```
Based on this conversation, extract 3-5 key points that:
1. Reveal the suspect's alibi
2. Indicate potential motive
3. Show inconsistencies or suspicious behavior
4. Provide verifiable facts

Format as bullet points in Korean.
```

**Benefits:**
- Reduces need to re-read entire conversation
- Highlights important information
- Helps users compare suspects

---

### 3. Confidence Meter

**Purpose:** Gamification + reduces pressure to be "perfect"

**Implementation:**
```tsx
<div className="confidence-selector">
  <label>얼마나 확신하십니까?</label>

  <div className="star-rating">
    {[1, 2, 3, 4, 5].map(rating => (
      <button
        key={rating}
        onClick={() => setConfidence(rating)}
        className={confidence >= rating ? 'star-filled' : 'star-empty'}
        aria-label={`Confidence level ${rating} out of 5`}
      >
        ★
      </button>
    ))}
  </div>

  <p className="confidence-label">
    {confidence <= 2 && "Not very confident"}
    {confidence === 3 && "Somewhat confident"}
    {confidence >= 4 && "Very confident"}
  </p>
</div>
```

**Scoring Logic:**
```tsx
// Bonus points for high confidence + correct answer
if (isCorrect && confidence >= 4) {
  bonusPoints = 10;
  message = "High confidence + correct! +10 bonus";
}

// No penalty for low confidence + wrong answer
if (!isCorrect && confidence <= 2) {
  penalty = 0;
  message = "Good judgment - you weren't sure";
}
```

**Benefits:**
- Encourages honest self-assessment
- Rewards calibration (knowing what you know)
- Reduces fear of failure

---

### 4. Social Proof Statistics

**Purpose:** Reduce anxiety about "doing it wrong"

**Implementation:**
```tsx
<div className="community-stats">
  <h3>Community Insights</h3>

  <ul>
    <li>
      <span className="stat-label">Most questioned first:</span>
      <span className="stat-value">이수진 (67%)</span>
    </li>
    <li>
      <span className="stat-label">Average questions asked:</span>
      <span className="stat-value">12 per suspect</span>
    </li>
    <li>
      <span className="stat-label">Average solve time:</span>
      <span className="stat-value">18 minutes</span>
    </li>
  </ul>
</div>
```

**Benefits:**
- Validates user approach
- Provides benchmark for comparison
- Creates sense of community

---

### 5. Daily Streak Tracking

**Purpose:** Encourage daily engagement

**Implementation:**
```tsx
<div className="streak-display">
  <div className="streak-icon">🔥</div>
  <p className="streak-count">{streakDays}일 연속</p>
  <p className="streak-label">Investigation Streak</p>

  <div className="streak-calendar">
    {last7Days.map(day => (
      <div
        key={day.date}
        className={day.solved ? 'day-complete' : 'day-incomplete'}
      >
        {day.dayOfWeek}
      </div>
    ))}
  </div>
</div>
```

**Streak Logic:**
```tsx
// Award badges at milestones
const streakBadges = [
  { days: 3, badge: "🔍 Rookie Detective", color: "bronze" },
  { days: 7, badge: "🕵️ Seasoned Investigator", color: "silver" },
  { days: 14, badge: "🏆 Master Detective", color: "gold" },
  { days: 30, badge: "👑 Legend", color: "platinum" }
];
```

**Benefits:**
- Habit formation
- Engagement retention
- Gamification

---

### 6. Adaptive Hint System

**Purpose:** Help stuck users without ruining the challenge

**Implementation:**
```tsx
// After 10 minutes with no questions asked
{showHintOffer && (
  <div className="hint-offer">
    <p>막혔나요? 힌트를 받으시겠습니까?</p>
    <button onClick={revealHint}>
      Reveal Hint (-5 points)
    </button>
    <button onClick={dismissHint}>
      No, I'll figure it out
    </button>
  </div>
)}

// If user accepts
<div className="hint-revealed">
  <h3>💡 Hint</h3>
  <p>이수진의 알리바이에 시간 차이가 있습니다. 다시 물어보세요.</p>
</div>
```

**Hint Types:**
1. Direction hint: "Focus on the timeline"
2. Question hint: "Ask about the weapon"
3. Contradiction hint: "이수진's alibi doesn't match the evidence"

**Benefits:**
- Prevents frustration-based abandonment
- Maintains engagement
- Balances challenge with accessibility

---

### 7. Adaptive Difficulty

**Purpose:** Tailor experience to user skill level

**Implementation:**
```tsx
// Track user performance
const userProfile = {
  casesAttempted: 15,
  casesRolved: 10,
  averageScore: 72,
  averageTime: 22 // minutes
};

// Adjust game parameters
if (userProfile.averageScore > 85) {
  // Expert mode
  gameConfig = {
    suspectsCount: 4, // One more suspect
    suggestedQuestions: 2, // Fewer hints
    conversationDepth: "complex" // More nuanced responses
  };
} else if (userProfile.averageScore < 50) {
  // Assisted mode
  gameConfig = {
    suspectsCount: 3,
    suggestedQuestions: 5, // More hints
    conversationDepth: "straightforward",
    highlightClues: true // Emphasize important info
  };
}
```

**Benefits:**
- Maintains appropriate challenge level
- Reduces churn (too hard) and boredom (too easy)
- Personalized experience

---

### 8. Post-Game Analysis

**Purpose:** Help users learn and improve

**Implementation:**
```tsx
<div className="post-game-analysis">
  <h2>Investigation Review</h2>

  <div className="what-went-right">
    <h3>✓ What You Got Right</h3>
    <ul>
      <li>Correctly identified the suspect</li>
      <li>Accurately assessed the motive</li>
    </ul>
  </div>

  <div className="what-went-wrong">
    <h3>✗ Areas for Improvement</h3>
    <ul>
      <li>
        <strong>Timeline:</strong> You missed that the murder occurred between 11-12 PM, not 10-11 PM
      </li>
      <li>
        <strong>Method:</strong> The knife was from the victim's kitchen, not brought by the killer
      </li>
    </ul>
  </div>

  <div className="pro-tips">
    <h3>💡 Pro Tips for Next Time</h3>
    <ul>
      <li>Ask follow-up questions when you notice inconsistencies</li>
      <li>Pay attention to exact timestamps in alibis</li>
    </ul>
  </div>
</div>
```

**Benefits:**
- Educational value
- Skill improvement over time
- Increases engagement with results

---

## 11. Design System Specifications

### Color System

**Primary Palette:**
```css
:root {
  /* Brand colors */
  --reddit-orange: #d93900;
  --reddit-orange-hover: #b83000;
  --reddit-blue: #0079d3;

  /* Grayscale (Dark theme) */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* Semantic colors */
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;

  /* Suspicion levels */
  --suspicion-low: #10b981;    /* Green */
  --suspicion-medium: #f59e0b; /* Yellow */
  --suspicion-high: #ef4444;   /* Red */
}
```

**Usage Guidelines:**
- Primary actions: `--reddit-orange`
- Secondary actions: `--reddit-blue`
- Success states: `--success`
- Error states: `--error`
- Backgrounds: `--gray-900` (primary), `--gray-800` (secondary)
- Text: `white` (primary), `--gray-300` (secondary), `--gray-400` (tertiary)

---

### Typography System

**Font Stack:**
```css
:root {
  --font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI",
                  "Noto Sans KR", "Malgun Gothic", sans-serif;
  --font-mono: "SF Mono", Monaco, "Cascadia Code", monospace;
}
```

**Type Scale:**
```css
:root {
  /* Mobile scale */
  --text-xs: 12px;     /* Line height: 1.4 */
  --text-sm: 14px;     /* Line height: 1.5 */
  --text-base: 16px;   /* Line height: 1.5 */
  --text-lg: 18px;     /* Line height: 1.4 */
  --text-xl: 20px;     /* Line height: 1.3 */
  --text-2xl: 24px;    /* Line height: 1.2 */
  --text-3xl: 30px;    /* Line height: 1.1 */
}

@media (min-width: 768px) {
  :root {
    /* Desktop scale (slightly larger) */
    --text-base: 18px;
    --text-2xl: 28px;
    --text-3xl: 36px;
  }
}
```

**Font Weights:**
```css
:root {
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

**Usage:**
```css
/* Headings */
h1 { font-size: var(--text-3xl); font-weight: var(--font-bold); }
h2 { font-size: var(--text-2xl); font-weight: var(--font-semibold); }
h3 { font-size: var(--text-xl); font-weight: var(--font-semibold); }

/* Body text */
p { font-size: var(--text-base); font-weight: var(--font-normal); }
small { font-size: var(--text-sm); }

/* Labels */
label { font-size: var(--text-sm); font-weight: var(--font-medium); }
```

---

### Spacing System

**8px Base Grid:**
```css
:root {
  --space-1: 4px;    /* 0.5 units */
  --space-2: 8px;    /* 1 unit */
  --space-3: 12px;   /* 1.5 units */
  --space-4: 16px;   /* 2 units */
  --space-5: 20px;   /* 2.5 units */
  --space-6: 24px;   /* 3 units */
  --space-8: 32px;   /* 4 units */
  --space-10: 40px;  /* 5 units */
  --space-12: 48px;  /* 6 units */
  --space-16: 64px;  /* 8 units */
}
```

**Usage Guidelines:**
- Component padding: `--space-4` (mobile), `--space-6` (desktop)
- Stack spacing: `--space-4` (tight), `--space-6` (normal), `--space-8` (loose)
- Section margins: `--space-8` (mobile), `--space-12` (desktop)

---

### Component Library

**Button Component:**
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = ({ variant, size, disabled, loading, icon, children }: ButtonProps) => {
  const baseClasses = "btn transition-all rounded-full font-semibold";

  const variantClasses = {
    primary: "bg-reddit-orange text-white hover:bg-reddit-orange-hover",
    secondary: "bg-transparent border-2 border-reddit-orange text-reddit-orange",
    tertiary: "bg-transparent text-gray-400 hover:text-gray-300"
  };

  const sizeClasses = {
    small: "px-4 py-2 text-sm min-h-[40px]",
    medium: "px-6 py-3 text-base min-h-[48px]",
    large: "px-8 py-4 text-lg min-h-[56px]"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={disabled || loading}
    >
      {loading && <Spinner />}
      {icon && <span className="icon">{icon}</span>}
      {children}
    </button>
  );
};
```

**Card Component:**
```tsx
interface CardProps {
  variant: 'default' | 'interactive' | 'selected';
  children: React.ReactNode;
  onClick?: () => void;
}

const Card = ({ variant, children, onClick }: CardProps) => {
  const baseClasses = "card rounded-lg transition-all";

  const variantClasses = {
    default: "bg-gray-800 p-6",
    interactive: "bg-gray-800 p-6 hover:bg-gray-700 cursor-pointer hover:shadow-lg",
    selected: "bg-blue-600 p-6 border-2 border-blue-400 shadow-lg"
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
```

**Input Component:**
```tsx
interface InputProps {
  type: 'text' | 'textarea';
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  maxLength?: number;
}

const Input = ({ type, label, value, onChange, error, hint, required, maxLength }: InputProps) => {
  return (
    <div className="input-group">
      <label className="input-label">
        {label}
        {required && <span className="required">*</span>}
      </label>

      {type === 'text' ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`input ${error ? 'input-error' : ''}`}
          maxLength={maxLength}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`textarea ${error ? 'input-error' : ''}`}
          maxLength={maxLength}
        />
      )}

      {hint && !error && <p className="input-hint">{hint}</p>}
      {error && <p className="input-error-message">{error}</p>}

      {maxLength && (
        <p className="char-counter">{value.length}/{maxLength}</p>
      )}
    </div>
  );
};
```

---

## 12. Implementation Recommendations

### Devvit Blocks Mapping

**Based on existing components, here's how to implement with Devvit Blocks:**

**Case Overview (Blocks UI):**
```tsx
import { Devvit } from '@devvit/public-api';

// Replace div-based layout with Blocks
<blocks>
  <vstack gap="medium" padding="large" backgroundColor="gray-900">
    <text size="xxlarge" weight="bold">🕵️ {caseData.date} 사건</text>

    {caseData.imageUrl && (
      <image url={caseData.imageUrl} imageHeight={256} imageWidth="100%" />
    )}

    <vstack gap="small">
      {/* Victim card */}
      <hstack gap="medium" padding="medium" backgroundColor="gray-800" cornerRadius="medium">
        <vstack>
          <text size="large" weight="bold">👤 피해자</text>
          <text>{caseData.victim.name}</text>
          <text size="small" color="gray-400">{caseData.victim.background}</text>
        </vstack>
      </hstack>

      {/* Similar blocks for weapon, location, mission */}
    </vstack>

    <button appearance="primary" onPress={startInvestigation}>
      수사 시작
    </button>
  </vstack>
</blocks>
```

**Chat Interface (Blocks UI):**
```tsx
<blocks>
  <vstack height="100%">
    {/* Header */}
    <hstack padding="medium" backgroundColor="gray-800">
      <text size="large" weight="bold">💬 {suspectName}와의 대화</text>
    </hstack>

    {/* Messages */}
    <vstack gap="small" padding="medium" grow>
      {messages.map((msg, i) => (
        <hstack
          key={i}
          alignment={msg.role === 'user' ? 'end' : 'start'}
        >
          <vstack
            padding="small"
            backgroundColor={msg.role === 'user' ? 'blue-600' : 'gray-800'}
            cornerRadius="medium"
            maxWidth="70%"
          >
            <text size="small">{msg.content}</text>
            <text size="xsmall" color="gray-400">
              {new Date(msg.timestamp).toLocaleTimeString('ko-KR')}
            </text>
          </vstack>
        </hstack>
      ))}
    </vstack>

    {/* Input */}
    <hstack padding="medium" gap="small" backgroundColor="gray-800">
      <textInput
        value={inputMessage}
        onValueChange={setInputMessage}
        placeholder={`${suspectName}에게 질문하세요...`}
        grow
      />
      <button
        appearance="primary"
        onPress={handleSubmit}
        disabled={isSending || !inputMessage.trim()}
      >
        {isSending ? '전송 중...' : '전송'}
      </button>
    </hstack>
  </vstack>
</blocks>
```

**Suspect Panel (Blocks UI):**
```tsx
<blocks>
  <vstack padding="large" gap="medium">
    <text size="xxlarge" weight="bold">🕵️ 용의자</text>

    <hstack gap="medium" wrap>
      {suspects.map(suspect => (
        <vstack
          key={suspect.id}
          padding="medium"
          backgroundColor={selectedSuspectId === suspect.id ? 'blue-600' : 'gray-800'}
          cornerRadius="medium"
          onPress={() => onSelectSuspect(suspect.id)}
          grow
        >
          <hstack alignment="space-between">
            <text size="large" weight="bold">{suspect.name}</text>
            <text size="large">{getToneEmoji(suspect.emotionalState.tone)}</text>
          </hstack>

          <text size="small" color="gray-400">{suspect.archetype}</text>

          <hstack gap="small" alignment="middle">
            <text size="xsmall" color="gray-500">의심 레벨:</text>
            <spacer grow />
            <text size="xsmall" color="red-500">
              {suspect.emotionalState.suspicionLevel}%
            </text>
          </hstack>
        </vstack>
      ))}
    </hstack>
  </vstack>
</blocks>
```

### State Management

**Use Devvit's `useState` for component state:**
```tsx
const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [deductionForm, setDeductionForm] = useState({
  who: '',
  why: '',
  how: '',
  when: '',
  where: '',
  what: ''
});
```

**Use Devvit's Redis KV for persistent state:**
```tsx
// Save investigation progress
await context.redis.set(
  `investigation:${userId}:${caseId}`,
  JSON.stringify({
    questionedSuspects: ['suspect1', 'suspect2'],
    messages: conversationHistory,
    draft: deductionForm,
    timestamp: Date.now()
  }),
  { expiration: new Date(Date.now() + 24 * 60 * 60 * 1000) }
);

// Restore on mount
const saved = await context.redis.get(`investigation:${userId}:${caseId}`);
if (saved) {
  const progress = JSON.parse(saved);
  // Restore state
}
```

### Performance Optimization

**Lazy Loading:**
```tsx
// Load chat interface only when suspect selected
{selectedSuspect && (
  <Suspense fallback={<SkeletonChatInterface />}>
    <ChatInterface suspectId={selectedSuspect} />
  </Suspense>
)}
```

**Debounced Input:**
```tsx
// Debounce auto-save to reduce Redis writes
const debouncedSave = useMemo(
  () => debounce((draft) => {
    context.redis.set(`draft:${userId}:${caseId}`, JSON.stringify(draft));
  }, 1000),
  []
);

useEffect(() => {
  debouncedSave(deductionForm);
}, [deductionForm]);
```

**Optimistic UI Updates:**
```tsx
// Show message immediately, handle errors later
const sendMessage = async (content: string) => {
  const optimisticMessage = {
    role: 'user',
    content,
    timestamp: Date.now()
  };

  setMessages(prev => [...prev, optimisticMessage]);

  try {
    const response = await fetch('/api/chat', { ... });
    const aiReply = await response.json();
    setMessages(prev => [...prev, aiReply]);
  } catch (error) {
    // Remove optimistic message, show error
    setMessages(prev => prev.filter(m => m.timestamp !== optimisticMessage.timestamp));
    showError('Failed to send message');
  }
};
```

---

## 13. Testing & Validation

### Usability Testing Plan

**Test Objectives:**
1. Can users complete a full investigation without assistance?
2. Do users understand how to interact with AI suspects?
3. Is the deduction form clear and intuitive?
4. Do users feel satisfied with the experience?

**Test Scenarios:**
```
Scenario 1: First-Time User
- Task: Complete your first case from start to finish
- Success criteria: Complete without hints, <30 minutes
- Observe: Hesitation points, confusion, satisfaction

Scenario 2: Chat Interaction
- Task: Question all 3 suspects to gather clues
- Success criteria: Ask relevant questions, understand responses
- Observe: Use of suggested questions, freeform questions, stuck points

Scenario 3: Deduction Submission
- Task: Submit your final answer based on investigation
- Success criteria: Complete all fields, understand scoring
- Observe: Form clarity, confidence in submission, errors

Scenario 4: Results Interpretation
- Task: Review your results and understand what you got right/wrong
- Success criteria: Understand scoring breakdown, learn from mistakes
- Observe: Engagement with explanation, leaderboard interest
```

**Test Metrics:**
- Task completion rate (target: >85%)
- Time to complete (target: 15-25 minutes)
- Error rate (target: <10% invalid submissions)
- Satisfaction score (target: >4/5)
- Return intent (target: >70% say they'd play again)

### Accessibility Audit Checklist

```
[ ] Color contrast meets WCAG AA (4.5:1 for text)
[ ] All interactive elements have 44×44px touch targets
[ ] Keyboard navigation works for all functions
[ ] Focus indicators are clearly visible
[ ] Screen reader announces all dynamic content
[ ] ARIA labels are present and descriptive
[ ] Forms have proper labels and error messages
[ ] Images have meaningful alt text
[ ] Respects prefers-reduced-motion
[ ] Heading hierarchy is semantic (h1 → h2 → h3)
[ ] Live regions announce important updates
[ ] No keyboard traps in modals/drawers
```

### Performance Benchmarks

**Target Metrics:**
- Time to Interactive (TTI): <3 seconds
- First Contentful Paint (FCP): <1.5 seconds
- Largest Contentful Paint (LCP): <2.5 seconds
- Cumulative Layout Shift (CLS): <0.1
- First Input Delay (FID): <100ms
- AI response time: <3 seconds (90th percentile)

**Monitoring:**
```tsx
// Track key user interactions
analytics.track('case_started', { caseId, timestamp });
analytics.track('suspect_questioned', { suspectId, questionCount, duration });
analytics.track('answer_submitted', { caseId, confidence, timeSpent });
analytics.track('results_viewed', { score, correct });

// Track performance metrics
performance.measure('chat_response_time', 'message_sent', 'reply_received');
performance.measure('form_submission_time', 'submit_clicked', 'results_shown');
```

---

## 14. Launch Checklist

### Pre-Launch Validation

```
Design Phase:
[ ] User flows mapped for all paths
[ ] Wireframes reviewed and approved
[ ] High-fidelity mockups completed
[ ] Design system documented
[ ] Accessibility requirements specified
[ ] Mobile layouts validated on real devices

Development Phase:
[ ] All components implemented with Devvit Blocks
[ ] State management working (local + Redis)
[ ] AI integration functional
[ ] Form validation working
[ ] Error handling implemented
[ ] Loading states implemented

Testing Phase:
[ ] Usability testing completed (n≥5 users)
[ ] Accessibility audit passed
[ ] Cross-device testing (iOS, Android, web)
[ ] Performance benchmarks met
[ ] Edge cases handled (network errors, timeouts)
[ ] Korean localization validated by native speaker

Pre-Production:
[ ] Analytics tracking implemented
[ ] Error monitoring configured
[ ] Rate limiting configured for AI API
[ ] Redis caching strategy confirmed
[ ] Content moderation rules set
[ ] Community guidelines published
```

### Post-Launch Monitoring

**Week 1 Metrics:**
- Daily Active Users (DAU)
- Completion rate (started → submitted answer)
- Average time per case
- Bounce rate at each screen
- Error rate (chat failures, submission errors)
- Accessibility usage (screen reader, keyboard navigation)

**Iterate Based On:**
- User feedback (Reddit comments, DMs)
- Drop-off points (where do users abandon?)
- Error logs (what's breaking?)
- Performance metrics (what's slow?)
- Engagement metrics (what features are unused?)

---

## Conclusion

This comprehensive UX design provides a complete blueprint for building an engaging, accessible murder mystery investigation game on Reddit's Devvit platform. The design prioritizes:

1. **Mobile-first experience** with thumb-zone optimization
2. **Progressive disclosure** to prevent information overload
3. **Clear feedback loops** for engagement and guidance
4. **Accessibility compliance** for inclusive design
5. **Engaging detective narrative** that makes users feel smart

The design balances information density (required for murder mysteries) with clarity (required for mobile), using progressive disclosure, collapsible sections, and context-aware navigation.

Key differentiators:
- AI-powered chat interface with suggested questions (removes mystery about what to ask)
- Multi-step deduction form (feels conversational, not like homework)
- Rich feedback and progress indicators (users always know where they are)
- Social proof and leaderboards (competitive engagement)
- Accessibility by default (inclusive design from the start)

**Next Steps:**
1. Review this design with stakeholders
2. Create clickable prototypes for user testing
3. Validate with 5-10 Korean-speaking users
4. Iterate based on feedback
5. Implement with Devvit Blocks UI
6. Launch beta to r/ArmchairSleuths community

---

**Document Version:** 1.0
**Last Updated:** 2025-10-15
**Author:** UX Design Lead
**Status:** Ready for Review
