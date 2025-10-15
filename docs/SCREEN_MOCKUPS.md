# Screen Mockups & Visual Hierarchy

## ASCII Art Wireframes for Quick Reference

These low-fidelity mockups show the visual hierarchy and component placement for each screen.

---

## 1. Loading Screen

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│          [Spinning Icon]            │
│                                     │
│     Loading case file...            │
│                                     │
│   Preparing today's mystery         │
│                                     │
│                                     │
└─────────────────────────────────────┘

Colors:
- Background: gray-950 (dark)
- Text: white
- Spinner: blue-500
```

---

## 2. Case Overview Screen

```
┌─────────────────────────────────────┐
│ ┌─ Header (Gradient Blue) ────────┐ │
│ │ TODAY'S CASE                     │ │
│ │ Murder at the Mansion            │ │
│ │ October 15, 2025                 │ │
│ └──────────────────────────────────┘ │
│                                     │
│ ┌─ Hero Image ────────────────────┐ │
│ │                                 │ │
│ │    [Case Scene Image]           │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Case Details Card ─────────────┐ │
│ │ Case Details                    │ │
│ │                                 │ │
│ │ 👤 Victim                       │ │
│ │    Lord Archibald Blackwood     │ │
│ │                                 │ │
│ │ 🔪 Weapon                       │ │
│ │    Unknown                      │ │
│ │                                 │ │
│ │ 📍 Location                     │ │
│ │    Blackwood Manor Library      │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │  Start Investigation        │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Layout:
- Max width: 672px (max-w-2xl)
- Padding: 16px (p-4)
- Card padding: 24px (p-6)
- Gap between sections: 24px (gap-6)
```

---

## 3. Suspect Panel Screen

```
┌─────────────────────────────────────────────────────────┐
│ ┌─ Header (Sticky) ──────────────────────────────────┐ │
│ │ Prime Suspects                                     │ │
│ │ Select a suspect to interrogate                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│ │ [Image]   │  │ [Image]   │  │ [Image]   │          │
│ │           │  │           │  │           │          │
│ │ SUSPECT#1 │  │ SUSPECT#2 │  │ SUSPECT#3 │          │
│ │ Margaret  │  │ James     │  │ Elizabeth │          │
│ │ Blackwood │  │ Hartford  │  │ Chen      │          │
│ │           │  │           │  │           │          │
│ │ The       │  │ The       │  │ The       │          │
│ │ Socialite │  │ Partner   │  │ Secretary │          │
│ │           │  │           │  │           │          │
│ │ A wealthy │  │ Business  │  │ Personal  │          │
│ │ widow...  │  │ mogul...  │  │ aide...   │          │
│ │           │  │           │  │           │          │
│ │ ┌───────┐ │  │ ┌───────┐ │  │ ┌───────┐ │          │
│ │ │Inter- │ │  │ │Inter- │ │  │ │Inter- │ │          │
│ │ │rogate │ │  │ │rogate │ │  │ │rogate │ │          │
│ │ └───────┘ │  │ └───────┘ │  │ └───────┘ │          │
│ └───────────┘  └───────────┘  └───────────┘          │
│                                                         │
│ ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│ │ SUSPECT#4 │  │ SUSPECT#5 │  │ SUSPECT#6 │          │
│ │ ...       │  │ ...       │  │ ...       │          │
│ └───────────┘  └───────────┘  └───────────┘          │
└─────────────────────────────────────────────────────────┘

Grid:
- Mobile: 1 column (grid-cols-1)
- Tablet: 2 columns (sm:grid-cols-2)
- Desktop: 3 columns (lg:grid-cols-3)
- Gap: 16px (gap-4)
```

---

## 4. Chat Interface Screen

```
┌─────────────────────────────────────┐
│ ┌─ Chat Header ─────────────────┐  │
│ │ [←] [Avatar] Margaret         │  │
│ │              Blackwood        │  │
│ │              The Socialite    │  │
│ └───────────────────────────────┘  │
│                                     │
│ ┌─ Messages (Scrollable) ────────┐ │
│ │                                 │ │
│ │  ┌──────────────────────────┐  │ │
│ │  │ You                      │  │ │
│ │  │ Where were you at 9 PM?  │  │ │
│ │  │ Just now                 │  │ │
│ │  └──────────────────────────┘  │ │
│ │                                 │ │
│ │ ┌──────────────────────────┐   │ │
│ │ │ [Avatar] Margaret        │   │ │
│ │ │ I was at the theater     │   │ │
│ │ │ with my sister...        │   │ │
│ │ │ 2 minutes ago           │   │ │
│ │ └──────────────────────────┘   │ │
│ │                                 │ │
│ │  ┌──────────────────────────┐  │ │
│ │  │ You                      │  │ │
│ │  │ Can anyone verify that?  │  │ │
│ │  │ Just now                 │  │ │
│ │  └──────────────────────────┘  │ │
│ │                                 │ │
│ │ ┌──────────────────────────┐   │ │
│ │ │ [Avatar] Margaret        │   │ │
│ │ │ My sister can, but she's │   │ │
│ │ │ been away...             │   │ │
│ │ │ 30 seconds ago          │   │ │
│ │ └──────────────────────────┘   │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Input Area (Sticky) ──────────┐ │
│ │ ┌─────────────────────┐ ┌────┐ │ │
│ │ │ Ask a question...   │ │Send│ │ │
│ │ └─────────────────────┘ └────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Layout:
- Full height: h-screen
- User messages: Right aligned (justify-end)
- Suspect messages: Left aligned (justify-start)
- Max bubble width: 80% (max-w-[80%])
```

---

## 5. Submission Form Screen

```
┌─────────────────────────────────────┐
│ ┌─ Header ────────────────────────┐ │
│ │ Submit Your Deduction       [←] │ │
│ │ Review your theory              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Suspect Selection Card ────────┐ │
│ │ Who is guilty?                  │ │
│ │                                 │ │
│ │ ○ Margaret Blackwood            │ │
│ │   The Socialite                 │ │
│ │                                 │ │
│ │ ○ James Hartford                │ │
│ │   The Business Partner          │ │
│ │                                 │ │
│ │ ● Elizabeth Chen                │ │
│ │   The Secretary                 │ │
│ │   [Selected - Red highlight]    │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Weapon Card ───────────────────┐ │
│ │ Murder Weapon                   │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ e.g., Candlestick, Knife... │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Location Card ─────────────────┐ │
│ │ Location of Murder              │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ e.g., Library, Kitchen...   │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Reasoning Card ────────────────┐ │
│ │ Your Reasoning                  │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Explain your deduction...   │ │ │
│ │ │                             │ │ │
│ │ │                             │ │ │
│ │ │                             │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌───────────────────────────────┐  │
│ │   Submit Final Answer         │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘

Layout:
- Max width: 576px (max-w-xl)
- Vertical spacing: 24px (space-y-6)
- Card padding: 24px (p-6)
```

---

## 6. Results Screen

```
┌─────────────────────────────────────┐
│                                     │
│          ┌─────────────┐            │
│          │   🏆        │            │
│          │   Trophy    │            │
│          └─────────────┘            │
│                                     │
│         Case Solved!                │
│   You cracked the case              │
│   with flying colors                │
│                                     │
│ ┌─ Total Score Card ──────────────┐ │
│ │      Final Score                │ │
│ │                                 │ │
│ │         850                     │ │
│ │                                 │ │
│ │    out of 1000 points           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Score Breakdown Card ──────────┐ │
│ │ Score Breakdown                 │ │
│ │                                 │ │
│ │ ✅ Suspect Identified    +300   │ │
│ │    Correctly identified         │ │
│ │                                 │ │
│ │ ✅ Weapon Correct        +150   │ │
│ │    Candlestick                  │ │
│ │                                 │ │
│ │ ✅ Location Correct      +150   │ │
│ │    Library                      │ │
│ │                                 │ │
│ │ ⭐ Excellent Reasoning   +250   │ │
│ │    Well-structured              │ │
│ │                                 │ │
│ │ ───────────────────────────────│ │
│ │                                 │ │
│ │ ⏱️ Time Bonus            +50    │ │
│ │    Under 10 minutes             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Leaderboard Preview ───────────┐ │
│ │ Your Rank                       │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ #12    u/detective_smith    │ │ │
│ │ │        Top 15%          850 │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌──────────────┐  ┌──────────────┐ │
│ │ Leaderboard  │  │    Share     │ │
│ └──────────────┘  └──────────────┘ │
└─────────────────────────────────────┘

Colors:
- Background: gradient (from-green-50 to-blue-50)
- Trophy icon: green-600
- Success items: green-600
- Score: amber-600
- Rank badge: amber-50 border-amber-200
```

---

## 7. Leaderboard Screen

```
┌─────────────────────────────────────────────────────────┐
│ ┌─ Header ─────────────────────────────────────────────┐ │
│ │ 🏆 Leaderboard                           [Filter ▼] │ │
│ │ Today's top detectives                              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Your Rank (Highlighted) ───────────────────────────┐ │
│ │ #12  [Avatar] u/detective_smith              850 ⭐ │ │
│ │                                                      │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Top Ranks ──────────────────────────────────────────┐ │
│ │ #1   [Avatar] u/sherlock_master            1000 🥇   │ │
│ │ ─────────────────────────────────────────────────── │ │
│ │ #2   [Avatar] u/miss_marple                 980 🥈   │ │
│ │ ─────────────────────────────────────────────────── │ │
│ │ #3   [Avatar] u/poirot_fan                  965 🥉   │ │
│ │ ─────────────────────────────────────────────────── │ │
│ │ #4   [Avatar] u/watson_jr                   950      │ │
│ │ ─────────────────────────────────────────────────── │ │
│ │ #5   [Avatar] u/detective_brown             925      │ │
│ │ ─────────────────────────────────────────────────── │ │
│ │ ...                                                  │ │
│ │                                                      │ │
│ │ #10  [Avatar] u/mystery_lover               875      │ │
│ │ ─────────────────────────────────────────────────── │ │
│ │ #11  [Avatar] u/case_cracker                860      │ │
│ │ ─────────────────────────────────────────────────── │ │
│ │ #12  [Avatar] u/detective_smith             850 ←You │ │
│ │ ─────────────────────────────────────────────────── │ │
│ │ #13  [Avatar] u/clue_hunter                 845      │ │
│ │                                                      │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Stats Card ────────────────────────────────────────┐ │
│ │ Case Statistics                                     │ │
│ │                                                     │ │
│ │ Total Players: 1,234                                │ │
│ │ Average Score: 672                                  │ │
│ │ Solve Rate: 42%                                     │ │
│ │ Most Common Suspect: Margaret Blackwood             │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

Layout:
- Max width: 896px (max-w-4xl)
- Your rank: Highlighted with amber background
- Top 3: Medal emojis (🥇🥈🥉)
- Dividers between ranks
```

---

## Color Legend for All Screens

```
Backgrounds:
  gray-50     = #F9FAFB  (Page background)
  white       = #FFFFFF  (Cards)
  gray-100    = #F3F4F6  (Alternate sections)

Text:
  gray-900    = #111827  (Primary text)
  gray-600    = #4B5563  (Secondary text)
  gray-400    = #9CA3AF  (Tertiary text)

Actions:
  red-600     = #DC2626  (Primary CTA)
  blue-900    = #1E3A8A  (Secondary actions)
  amber-500   = #F59E0B  (Accents)

States:
  green-600   = #059669  (Success)
  red-600     = #DC2626  (Error)
  amber-600   = #D97706  (Warning)

Borders:
  gray-200    = #E5E7EB  (Default)
  red-600     = #DC2626  (Selected)
```

---

## Component Spacing Standards

```
Card Internal Padding:      24px (p-6)
Section Gaps:               24px (gap-6)
Button Height:              48px (py-3 + text)
Input Height:               48px (py-3 + text)
Icon Size (small):          20px (w-5 h-5)
Icon Size (medium):         24px (w-6 h-6)
Icon Size (large):          32px (w-8 h-8)
Avatar Size (small):        32px (w-8 h-8)
Avatar Size (medium):       40px (w-10 h-10)
Avatar Size (large):        48px (w-12 h-12)
Border Radius (cards):      8px (rounded-lg)
Border Radius (buttons):    8px (rounded-lg)
Border Radius (avatars):    50% (rounded-full)
Border Radius (badges):     9999px (rounded-full)
```

---

## Responsive Breakpoint Visual

```
Mobile (< 640px):
┌──────────────┐
│              │
│   1 Column   │
│              │
└──────────────┘

Tablet (640px - 1024px):
┌──────────────┬──────────────┐
│              │              │
│   2 Columns  │              │
│              │              │
└──────────────┴──────────────┘

Desktop (> 1024px):
┌──────────────┬──────────────┬──────────────┐
│              │              │              │
│          3 Columns          │              │
│              │              │              │
└──────────────┴──────────────┴──────────────┘
```

---

## Animation Timing Guide

```
Hover:        150ms  (transition-colors)
Click:        100ms  (active:scale-95)
Fade In:      300ms  (animate-fade-in)
Slide:        300ms  (animate-slide-up)
Loading Spin: 1000ms (animate-spin)
Pulse:        2000ms (animate-pulse)
```

---

## Touch Target Sizes (Mobile)

```
Minimum Size: 44x44px
Recommended:  48x48px

Button:       48px height
Input:        48px height
Card:         Entire card clickable
Icon Button:  44x44px minimum
List Item:    56px height
```

---

## Z-Index Layers

```
z-0:   Base content
z-10:  Sticky headers
z-20:  Dropdown menus
z-30:  Modals backdrop
z-40:  Modals content
z-50:  Toasts/notifications
```

---

## Print-Friendly Elements

For sharing results:

```
┌─────────────────────────────────────┐
│ ARMCHAIR SLEUTHS                    │
│                                     │
│ Case: Murder at the Mansion         │
│ Date: October 15, 2025              │
│                                     │
│ Final Score: 850 / 1000             │
│                                     │
│ ✅ Suspect: Correct                 │
│ ✅ Weapon: Correct                  │
│ ✅ Location: Correct                │
│ ⭐ Reasoning: Excellent             │
│                                     │
│ Rank: #12 / 1,234 players           │
│                                     │
│ Share your detective skills at      │
│ reddit.com/r/ArmchairSleuths        │
└─────────────────────────────────────┘
```

---

**Usage**: These mockups are for quick reference during development. For detailed implementations, see COMPONENT_EXAMPLES.md.

**Remember**: ASCII can't show colors or exact proportions, but it's perfect for understanding structure and hierarchy at a glance.
