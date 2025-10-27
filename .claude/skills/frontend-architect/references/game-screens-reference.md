# Game Screens Reference

Complete specifications for all 6 game screens in Armchair Sleuths.

## Screen Flow

```
Loading → Cinematic Intro → Case Overview → Investigation → Submission → Results
  (1)          (2)                (3)             (4)            (5)        (6)
```

---

## Screen 1: Loading

**Purpose**: Load case data and display generation progress

**Layout**:
```
┌────────────────────────────────────┐
│                                    │
│         🔍 Loading Case...         │
│                                    │
│     [===========>      ] 60%       │
│                                    │
│     Generating suspects...         │
│                                    │
└────────────────────────────────────┘
```

**Components**:
- Loading spinner or progress bar
- Status text (e.g., "Generating suspects...", "Creating evidence...")
- Progress percentage
- Error state with retry button
- Regenerate button (if case generation failed)

**Key Features**:
- Shows loading for 30-60 seconds (case generation time)
- Transitions to Cinematic Intro when data loaded
- Error handling: "Failed to load case" with Retry/Regenerate buttons

**API Integration**:
- `GET /api/case/today` - Initial case load
- Error handling for 500 errors

**States**:
1. Loading (initial)
2. Success → Transition to Intro
3. Error → Show error message + actions

---

## Screen 2: Cinematic Intro

**Purpose**: Immersive case introduction with typing effect narration

**Layout**:
```
┌─────────────────────────────────────────────┐
│                                             │
│  [Cinematic Background Image]               │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │  밤 11시, 강남역 근처 조용한 카페...  │   │
│  │  한 남성이 독극물로 숨진 채 발견되었다│   │
│  │  ▊ (blinking cursor)                │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│                      [Skip →]               │
│                                             │
└─────────────────────────────────────────────┘
```

**Components**:
- Cinematic background image (parallax effect optional)
- Narration text box with typing effect
- Blinking cursor during typing
- Skip button (top right)
- Continue button (appears after typing completes)

**Animation Details**:
- Typing speed: 50 characters/second
- Cursor blink: 800ms interval
- Background: Subtle gradient overlay
- Auto-advance: 3 seconds after typing completes (optional)

**Key Features**:
- Typing effect powered by useEffect interval
- Skip button allows bypassing animation
- Auto-transitions to Case Overview when complete
- Mobile: Full screen, reduce narration length if needed

**Data Source**:
- `caseData.introNarration` - Narration text
- `caseData.cinematicImages` - Background images

**States**:
1. Typing in progress
2. Typing complete → Show continue button
3. Skipped → Immediate transition

---

## Screen 3: Case Overview

**Purpose**: Display case details and begin investigation

**Layout**:
```
┌──────────────────────────────────────────────┐
│                                              │
│  📁 CASE #042: "The Mansion Murder"         │
│  ══════════════════════════════════          │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ [Case Image]                           │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  👤 VICTIM: John Doe (45)                   │
│     CEO of TechCorp                         │
│                                              │
│  📍 LOCATION: Luxury Mansion                │
│     Found in study room                     │
│                                              │
│  🔪 WEAPON: Poison                          │
│     Cyanide in wine glass                   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │   🔍 Begin Investigation →           │   │
│  └──────────────────────────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

**Components**:
- Case number and title
- Case image (if available)
- Victim card: Name, age, occupation, background
- Location card: Name, description
- Weapon card: Type, details
- Primary action button: "Begin Investigation"

**Key Features**:
- Clean, readable layout with icons
- Card-based design for information chunks
- Mobile: Stacked cards, full width
- Desktop: Grid layout, centered max-width

**Data Source**:
- `caseData.id`, `caseData.title`
- `caseData.victim` - Name, background
- `caseData.location` - Name, description
- `caseData.weapon` - Name, details
- `caseData.imageUrl` - Case image

**Interaction**:
- "Begin Investigation" button → Navigate to Investigation screen

---

## Screen 4: Investigation (Unified Screen)

**Purpose**: Main gameplay - interrogate suspects and search locations

**Layout (Desktop)**:
```
┌────────────────────────────────────────────────────────┐
│  [AP Header]  Current AP: 5 / Max: 12                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────┐  ┌───────────────────────────┐  │
│  │ Location        │  │ Suspect Interrogation     │  │
│  │ Explorer        │  │                           │  │
│  │                 │  │  [Sarah]  [David]  [Ellen]│  │
│  │  📍 Cafe        │  │                           │  │
│  │  📍 Mansion     │  │  ┌─────────────────────┐  │  │
│  │  📍 Office      │  │  │ Chat Area           │  │  │
│  │                 │  │  │                     │  │  │
│  │  [Search Type]  │  │  │ Sarah: "I was..."   │  │  │
│  │  ○ Quick (1 AP) │  │  │ You: "Where were"   │  │  │
│  │  ○ Thorough (2) │  │  │                     │  │  │
│  │  ● Exhaustive(3)│  │  └─────────────────────┘  │  │
│  │                 │  │                           │  │
│  │  [Search Cafe]  │  │  [Evidence]  [Send]       │  │
│  └─────────────────┘  └───────────────────────────┘  │
│                                                        │
│  [Submit Answer]                                       │
└────────────────────────────────────────────────────────┘
```

**Layout (Mobile)**:
```
┌──────────────────────┐
│ AP: 5/12  🔍         │
├──────────────────────┤
│                      │
│ [Tab: Locations]     │
│                      │
│ 📍 Cafe              │
│ 📍 Mansion           │
│ 📍 Office            │
│                      │
│ ○ Quick (1 AP)       │
│ ● Thorough (2 AP)    │
│ ○ Exhaustive (3 AP)  │
│                      │
│ [Search]             │
│                      │
├──────────────────────┤
│ [Tab: Suspects]      │
│                      │
│ Sarah | David | Ellen│
│                      │
│ [Chat Area]          │
│                      │
│ [Input] [Send]       │
│                      │
├──────────────────────┤
│ [Submit Answer]      │
└──────────────────────┘
```

**Components**:

### 1. AP Header
- Current AP / Maximum AP display
- Prominent, always visible
- Color-coded: Green (high), Yellow (medium), Red (low)
- Desktop: Top bar
- Mobile: Sticky header

### 2. Location Explorer
**Purpose**: Search locations to find evidence (consumes AP)

**Elements**:
- List of 3-5 locations with icons
- Search type selector (radio buttons):
  - Quick Search (1 AP) - 40% critical evidence chance
  - Thorough Search (2 AP) - 70% critical evidence chance
  - Exhaustive Search (3 AP) - 95% critical evidence chance
- Search button (disabled if insufficient AP)
- Completion percentage per location

**Interaction**:
- Click location → Highlight selected
- Select search type → Update AP cost preview
- Click Search → POST /api/location/search
- On success → Show Evidence Discovery Modal
- On insufficient AP → Show "Not Enough AP" toast, offer Emergency AP (1 time)

**States**:
- Idle
- Loading (searching...)
- Success (evidence found)
- Error (insufficient AP, network error)

### 3. Suspect Interrogation
**Purpose**: Ask questions to gain information and earn AP

**Elements**:
- Suspect tabs/buttons (3 suspects)
- Profile image (progressive loading)
- Chat area with message history
- Input field with character limit
- Send button
- Evidence presentation button (optional)

**Interaction**:
- Select suspect → Load conversation history
- Type question → Enable send button
- Send → POST /api/chat/:suspectId
- Receive response + AP reward
- Show AP Acquisition Toast if AP gained

**AP Acquisition**:
- Topic detection: +1 AP per new topic (alibi, relationship, motive)
- Quality bonus: +1 AP for high-quality questions
- Bonus triggers: +1 AP for insights

**States**:
- Idle
- Typing indicator (AI thinking)
- Response received
- AP gained (show toast)

### 4. Evidence Discovery Modal
**Triggered**: After successful location search

**Layout**:
```
┌────────────────────────────────────┐
│  Evidence Discovered          [X]  │
├────────────────────────────────────┤
│                                    │
│  ┌──────┐  ┌──────┐  ┌──────┐    │
│  │ 🔪   │  │ 📧   │  │ 📸   │    │
│  │Knife │  │Email │  │Photo │    │
│  │      │  │      │  │      │    │
│  └──────┘  └──────┘  └──────┘    │
│                                    │
├────────────────────────────────────┤
│  AP: 2  |  Complete: 75%          │
│                                    │
│  [Continue Investigation]          │
└────────────────────────────────────┘
```

**Features**:
- Fade-in animation
- Evidence cards with icons
- AP remaining display
- Location completion percentage
- Close button + backdrop click
- ESC key support

### 5. Submit Answer Button
- Always visible at bottom
- Prominent styling (detective gold)
- Transitions to Submission screen

**Key Features**:
- Unified screen reduces navigation complexity
- Desktop: Side-by-side layout
- Mobile: Tabbed interface
- Real-time AP updates
- Progressive image loading for suspects
- Toast notifications for AP changes

**Data Source**:
- `caseData.locations` - Location list
- `caseData.suspects` - Suspect list
- `playerState.actionPoints` - Current AP
- `playerState.discoveredEvidence` - Found evidence

**APIs**:
- `POST /api/location/search` - Search location
- `POST /api/chat/:suspectId` - Interrogate suspect
- `GET /api/suspect-image/:suspectId` - Load profile image
- `GET /api/player-state/:caseId/:userId` - Get player state

---

## Screen 5: Submission

**Purpose**: Submit accusation and reasoning

**Layout**:
```
┌──────────────────────────────────────────┐
│                                          │
│  🎯 Submit Your Accusation               │
│  ────────────────────────────────        │
│                                          │
│  WHO is the culprit?                     │
│  [ Select Suspect ▼ ]                   │
│                                          │
│  WHAT was the method?                    │
│  [____________________________]          │
│                                          │
│  WHERE did it happen?                    │
│  [____________________________]          │
│                                          │
│  WHEN did it occur?                      │
│  [____________________________]          │
│                                          │
│  WHY was the motive?                     │
│  [____________________________]          │
│                                          │
│  HOW was it executed?                    │
│  ┌──────────────────────────────────┐   │
│  │                                  │   │
│  │  (Detailed reasoning textarea)   │   │
│  │                                  │   │
│  └──────────────────────────────────┘   │
│                                          │
│  [← Back to Investigation]  [Submit ✓]  │
│                                          │
└──────────────────────────────────────────┘
```

**Components**:
- 5W1H form structure
- Suspect dropdown (required)
- Text inputs for WHAT, WHERE, WHEN, WHY
- Textarea for HOW (detailed reasoning)
- Back button (return to Investigation)
- Submit button (validates form first)

**Validation**:
- All fields required
- Minimum character count for reasoning (e.g., 50 chars)
- Show validation errors inline

**Key Features**:
- Clear form structure
- Help text for each field
- Character counter for reasoning
- Disable submit until valid
- Confirmation modal before submit (optional)

**Interaction**:
- Fill form → Enable submit button
- Click Submit → POST /api/submit
- On success → Navigate to Results
- On error → Show error message

**Data Source**:
- `caseData.suspects` - For suspect dropdown
- Form state (local)

**API**:
- `POST /api/submit` - Submit accusation

**Mobile Considerations**:
- Stacked layout
- Larger touch targets
- Bottom sheet for suspect selection

---

## Screen 6: Results

**Purpose**: Display score, correct answer, and leaderboard

**Layout**:
```
┌──────────────────────────────────────────────────┐
│                                                  │
│      CASE CLOSED                                 │
│      ══════════                                  │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │                                            │ │
│  │       ⭐⭐⭐⭐⭐                               │ │
│  │                                            │ │
│  │     S-RANK DETECTIVE                       │ │
│  │                                            │ │
│  │     Score: 95/100                          │ │
│  │                                            │ │
│  │     ✅ Correct Suspect!                    │ │
│  │     Accused: Sarah Jones                   │ │
│  │                                            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  📊 Performance                                  │
│  ├─ Evidence Found: 9/10 (90%)                  │
│  ├─ AP Used: 7/12 (58%)                         │
│  ├─ Time: 24min 32sec                           │
│  └─ Accuracy: 98%                                │
│                                                  │
│  🏆 Leaderboard                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 1. PlayerX         95  ⭐                  │ │
│  │ 2. You             92  ⭐ (Current)        │ │
│  │ 3. PlayerY         88                      │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  [📤 Share Results]  [🎮 New Game]              │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Components**:
- Score card with rank badge
- Correct answer reveal
- Performance stats card
- Leaderboard table
- Share button (social media)
- New Game button (navigate to new case)

**Rank System**:
- S-Rank: 90-100
- A-Rank: 80-89
- B-Rank: 70-79
- C-Rank: 60-69
- D-Rank: <60

**Key Features**:
- Animated entrance (score counting up)
- Confetti effect for S/A rank
- Detailed breakdown of score
- Show correct answer if wrong
- Leaderboard with current player highlighted
- Social sharing (Reddit, Twitter)

**Data Source**:
- `submissionResult.score`, `submissionResult.grade`
- `submissionResult.isCorrect`
- `playerState.discoveredEvidence`, `playerState.actionPoints`
- `leaderboardData` from API

**APIs**:
- Result data from POST /api/submit response
- `GET /api/leaderboard/:caseId` - Leaderboard

**Mobile Considerations**:
- Stacked cards
- Simplified leaderboard (top 5)
- Larger action buttons

---

## Common UI Elements

### AP Acquisition Toast
**Triggered**: When player gains AP from interrogation

```
┌────────────────────────────┐
│  +2 AP                 [X] │
│  ──────                    │
│  New Topic: Alibi          │
│  Quality Bonus             │
└────────────────────────────┘
```

**Features**:
- Top-right corner (desktop), top-center (mobile)
- Auto-dismiss after 3 seconds
- Slide-in animation
- Green accent color

### Insufficient AP Modal
**Triggered**: When attempting action without enough AP

```
┌────────────────────────────────────┐
│  Insufficient Action Points    [X] │
│  ─────────────────────────────     │
│                                    │
│  This action requires 2 AP.        │
│  You currently have 1 AP.          │
│                                    │
│  💡 Emergency AP Available (1x)    │
│  Receive 2 AP to continue.         │
│                                    │
│  [Use Emergency AP]  [Cancel]      │
└────────────────────────────────────┘
```

**Features**:
- Centered modal
- Explain AP shortage
- Offer Emergency AP (1 time only)
- Clear call-to-action

### Loading Skeleton
**Used**: During data fetching

```
┌────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░        │
│  ░░░░░░░░░░                │
│                            │
│  ░░░░░░░░░░░░░░░░░░░░      │
│  ░░░░░░░░░░░░░░░░░░░░░░░░  │
└────────────────────────────┘
```

**Features**:
- Shimmer animation
- Matches component shape
- Smooth fade-out when data loads

---

## Responsive Breakpoints

```
Mobile:    320px - 767px   (1 column, stacked)
Tablet:    768px - 1023px  (2 columns, side-by-side)
Desktop:   1024px+         (3 columns, full layout)
```

## Accessibility Requirements

- **Keyboard Navigation**: Tab order logical, all interactive elements accessible
- **Screen Readers**: ARIA labels on all buttons, proper heading hierarchy
- **Focus Indicators**: Visible on all focusable elements
- **Color Contrast**: 4.5:1 minimum for text
- **Touch Targets**: 44x44px minimum on mobile

## Performance Targets

- **Screen Load**: <1s (excluding API calls)
- **API Response**: <3s average
- **Animation FPS**: 60fps
- **Bundle Size**: <50KB per screen (gzipped)
