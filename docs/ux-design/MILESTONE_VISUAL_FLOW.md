# Milestone Celebration Visual Flow

## Complete User Experience Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     INVESTIGATION SCREEN                            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    HEADER (z-index: 50)                      │  │
│  │  🔍 수사 중                          📝 수사 완료 (답안 제출)  │  │
│  │  ───────────────────────────────────────────────────────────  │  │
│  │  [🗺️ 장소 탐색] [👤 용의자 심문] [📋 수사 노트]             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    CONTENT AREA                              │  │
│  │                                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐    │  │
│  │  │  Location Explorer / Suspect Interrogation         │    │  │
│  │  │                                                     │    │  │
│  │  │  Player searches location...                       │    │  │
│  │  │       ↓                                             │    │  │
│  │  │  Evidence discovered!                              │    │  │
│  │  │       ↓                                             │    │  │
│  │  │  API: POST /search                                 │    │  │
│  │  │       ↓                                             │    │  │
│  │  │  Evidence added to player state                    │    │  │
│  │  └─────────────────────────────────────────────────────┘    │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            BACKGROUND POLLING (every 3s)                     │  │
│  │  GET /api/player-state/{caseId}/{userId}                    │  │
│  │       ↓                                                      │  │
│  │  discoveredEvidence: [item1, item2, item3, ...]             │  │
│  │       ↓                                                      │  │
│  │  progress = (3 / 10) * 100 = 30%                            │  │
│  │       ↓                                                      │  │
│  │  Milestone detected: 25% (previousProgress: 20%)            │  │
│  │       ↓                                                      │  │
│  │  showCelebration = true                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                            ↓ CELEBRATION TRIGGERS ↓

┌─────────────────────────────────────────────────────────────────────┐
│                    MILESTONE CELEBRATION OVERLAY                    │
│                        (z-index: 50-51)                            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                BACKDROP (blur + dark overlay)                │  │
│  │                      (z-index: 50)                           │  │
│  │                                                              │  │
│  │        ┌────────────────────────────────────────┐            │  │
│  │        │     CELEBRATION CARD (z-index: 51)    │            │  │
│  │        │     ┌──────────────────────────┐      │            │  │
│  │        │     │                          │      │            │  │
│  │        │     │          [✕]             │      │ ← Close    │  │
│  │        │     │                          │      │            │  │
│  │        │     │        👍                │      │ ← Emoji    │  │
│  │        │     │                          │      │            │  │
│  │        │     │     좋은 출발!           │      │ ← Title    │  │
│  │        │     │                          │      │            │  │
│  │        │     │        25%               │      │ ← Progress │  │
│  │        │     │                          │      │            │  │
│  │        │     │   증거 수집의 첫 걸음을   │      │ ← Message  │  │
│  │        │     │   내딛었습니다.          │      │            │  │
│  │        │     │                          │      │            │  │
│  │        │     │   ████░░░░░░░░░░░        │      │ ← Progress │  │
│  │        │     │   (25% filled)           │      │   Bar      │  │
│  │        │     │                          │      │            │  │
│  │        │     │   [계속하기 →]           │      │ ← CTA      │  │
│  │        │     │                          │      │            │  │
│  │        │     └──────────────────────────┘      │            │  │
│  │        │                                       │            │  │
│  │        │  🎊 💫 ✨ 🌟 (Confetti particles) │            │  │
│  │        │                                       │            │  │
│  │        └────────────────────────────────────────┘            │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                        ↓ AFTER 4 SECONDS OR USER CLICK ↓

┌─────────────────────────────────────────────────────────────────────┐
│                    CELEBRATION CLOSES                               │
│                   (300ms exit animation)                           │
│                                                                     │
│  Backdrop: opacity 1 → 0                                           │
│  Card: scale 1 → 0, rotate 0 → 10                                 │
│  Confetti: removed from DOM                                        │
│                                                                     │
│                        ↓                                            │
│                                                                     │
│  Player returns to investigation                                   │
│  Next milestone will trigger at 50%                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Milestone Progression Visual

```
Evidence Collection Journey
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

0% ────────────────────────────────────────────────── 100%
│                                                        │
│                                                        │
├─────► 25% MILESTONE                                   │
│       ┌─────────────────────────┐                     │
│       │  👍 좋은 출발!          │                     │
│       │  Blue | Low Intensity   │                     │
│       │  🎊 15 confetti         │                     │
│       └─────────────────────────┘                     │
│                                                        │
│                                                        │
├──────────────────► 50% MILESTONE                      │
│                    ┌─────────────────────────┐        │
│                    │  ⚡ 절반 완료!          │        │
│                    │  Purple | Medium        │        │
│                    │  🎊 30 confetti         │        │
│                    └─────────────────────────┘        │
│                                                        │
│                                                        │
├───────────────────────────────► 75% MILESTONE         │
│                                 ┌────────────────────┐│
│                                 │  🔥 거의 다 왔어요!││
│                                 │  Orange | Medium   ││
│                                 │  🎊 30 confetti    ││
│                                 └────────────────────┘│
│                                                        │
│                                                        │
└────────────────────────────────────────► 100% MILESTONE
                                           ┌──────────────┐
                                           │  🎉 완벽합니다!│
                                           │  Gold | High │
                                           │  🎊 50 confetti│
                                           │  ✨ Infinite │
                                           │     shine    │
                                           └──────────────┘
```

## Animation Timeline (4 seconds total)

```
Time    Element              Animation
────────────────────────────────────────────────────────────────
0ms     Backdrop             Fade in (opacity: 0 → 1)
        Card                 Scale + Rotate (scale: 0 → 1, rotate: -10° → 0°)

200ms   Emoji                Pop in (scale: 0 → 1, rotate: -180° → 0°)
        Confetti             Explosion starts

400ms   Title                Slide up + Fade in (y: 20px → 0, opacity: 0 → 1)

500ms   Percentage           Pop in (scale: 0.5 → 1)

600ms   Message              Slide up + Fade in (y: 10px → 0, opacity: 0 → 1)

700ms   Progress Bar         Expand (scaleX: 0 → 1)

800ms   Progress Fill        Animate (width: 0 → current%)

900ms   Button               Slide up + Fade in (y: 10px → 0, opacity: 0 → 1)

2000ms  Confetti (low/med)   Fade out + Fall down
3000ms  Confetti (high)      Fade out + Fall down (100% only)

4000ms  Auto-dismiss         Celebration closes (if not manually dismissed)
────────────────────────────────────────────────────────────────
```

## Color Theme Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                    25% MILESTONE - BLUE                     │
├─────────────────────────────────────────────────────────────┤
│  Background: Linear gradient blue-600/20 → blue-800/20     │
│  Border: 2px solid blue-500                                │
│  Text: text-blue-400                                       │
│  Glow: shadow-blue-500/50                                  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  Example: rgb(59 130 246) with 20% opacity background      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   50% MILESTONE - PURPLE                    │
├─────────────────────────────────────────────────────────────┤
│  Background: Linear gradient purple-600/20 → purple-800/20 │
│  Border: 2px solid purple-500                              │
│  Text: text-purple-400                                     │
│  Glow: shadow-purple-500/50                                │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  Example: rgb(168 85 247) with 20% opacity background      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   75% MILESTONE - ORANGE                    │
├─────────────────────────────────────────────────────────────┤
│  Background: Linear gradient orange-600/20 → orange-800/20 │
│  Border: 2px solid orange-500                              │
│  Text: text-orange-400                                     │
│  Glow: shadow-orange-500/50                                │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  Example: rgb(249 115 22) with 20% opacity background      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   100% MILESTONE - GOLD                     │
├─────────────────────────────────────────────────────────────┤
│  Background: Linear gradient yellow-600/20 → yellow-800/20 │
│  Border: 2px solid yellow-500                              │
│  Text: text-yellow-400                                     │
│  Glow: shadow-yellow-500/50                                │
│  ✨ Additional: Infinite shine animation sweep             │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  Example: rgb(234 179 8) with 20% opacity background       │
└─────────────────────────────────────────────────────────────┘
```

## Confetti Explosion Pattern

```
25% MILESTONE - LOW INTENSITY (15 particles)
────────────────────────────────────────────────

          ●                    ■
               ▲          ●

      ▲              ■              ●
   ●                          ▲
              ●
                        ■         ▲
   ■         ▲                ●
         ●            ●
              ■                  ▲

   (Spreads in 360° from center)
   (Falls slowly with rotation)


50% & 75% MILESTONES - MEDIUM INTENSITY (30 particles)
───────────────────────────────────────────────────────

     ●  ■     ▲   ●      ▲    ■
  ▲    ●   ■       ●  ▲      ●   ■
       ■  ●    ▲       ■   ●     ▲
   ●      ▲  ■    ●       ▲   ●
     ■   ●       ▲    ■      ●   ▲
  ▲    ●    ■       ●    ▲      ■
       ●  ▲     ■      ●     ▲    ●
   ■      ●        ▲       ■   ●
     ●   ▲    ■       ●       ▲   ■

   (More particles, wider spread)
   (Faster animation)


100% MILESTONE - HIGH INTENSITY (50 particles)
───────────────────────────────────────────────

  ● ▲ ■ ● ▲ ■ ● ▲ ■ ● ▲ ■ ● ▲ ■
 ▲ ● ■ ▲ ● ■ ▲ ● ■ ▲ ● ■ ▲ ● ■ ▲
● ■ ▲ ● ■ ▲ ● ■ ▲ ● ■ ▲ ● ■ ▲ ●
■ ● ▲ ■ ● ▲ ■ ● ▲ ■ ● ▲ ■ ● ▲ ■
▲ ■ ● ▲ ■ ● ▲ ■ ● ▲ ■ ● ▲ ■ ● ▲
● ▲ ■ ● ▲ ■ ● ▲ ■ ● ▲ ■ ● ▲ ■ ●
■ ● ▲ ■ ● ▲ ■ ● ▲ ■ ● ▲ ■ ● ▲ ■

   (Maximum particles, explosive spread)
   (Longest duration - 3 seconds)
   (Gold confetti colors)

Legend:
● = Circle particle
■ = Square particle
▲ = Triangle particle
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      INITIAL STATE                          │
│  • discoveredEvidence: []                                   │
│  • totalEvidenceCount: 10                                   │
│  • currentProgress: 0                                       │
│  • previousProgress: 0                                      │
│  • showCelebration: false                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Player searches location
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    EVIDENCE DISCOVERED                      │
│  • POST /search → Evidence added to player state            │
│  • Poll detects new evidence                                │
│  • discoveredEvidence: [item1, item2, item3]               │
│  • currentProgress: 30%                                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ 30% >= 25% && 0% < 25%
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  MILESTONE DETECTED                         │
│  • useMilestoneTracking detects crossing                    │
│  • showCelebration: true                                    │
│  • previousProgress: 30%                                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Component renders
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                 CELEBRATION DISPLAYED                       │
│  • MilestoneCelebration renders                             │
│  • Confetti explosion                                       │
│  • Celebration card with animation                          │
│  • Timer starts (4 seconds)                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ User clicks or 4s timeout
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  CELEBRATION CLOSED                         │
│  • onClose callback triggered                               │
│  • showCelebration: false                                   │
│  • previousProgress: 30% (preserved)                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Player continues investigation
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  NEXT MILESTONE TRACKING                    │
│  • Progress: 30% → 55%                                      │
│  • 55% >= 50% && 30% < 50%                                  │
│  • Next celebration: 50% milestone                          │
└─────────────────────────────────────────────────────────────┘
```

## Mobile vs Desktop Layout

```
DESKTOP LAYOUT (> 768px)
────────────────────────────────────────────────

┌──────────────────────────────────────────────┐
│           Investigation Screen               │
│  ┌────────────────────────────────────────┐  │
│  │        Centered celebration card       │  │
│  │        max-width: 28rem (448px)        │  │
│  │        Backdrop blur: moderate         │  │
│  │        Touch target: 44px minimum      │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘


MOBILE LAYOUT (< 768px)
────────────────────────────────────────────────

┌──────────────────┐
│  Investigation   │
│  ┌────────────┐  │
│  │ Celebration│  │ ← Full width card
│  │   Card     │  │   Padding: 1rem
│  │            │  │   Larger tap targets
│  │            │  │   Reduced confetti
│  └────────────┘  │   (15 particles max)
└──────────────────┘
```

## Accessibility Features Visualization

```
┌─────────────────────────────────────────────────────────────┐
│              ACCESSIBILITY LAYER (Always Present)           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SEMANTIC HTML:                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ <div role="dialog" aria-modal="true"                │  │
│  │      aria-labelledby="milestone-title">             │  │
│  │   <h2 id="milestone-title">좋은 출발!</h2>          │  │
│  │   ...                                                │  │
│  │ </div>                                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  REDUCED MOTION:                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ if (prefersReducedMotion) {                         │  │
│  │   - No confetti animation                           │  │
│  │   - Simple fade-in only                             │  │
│  │   - Instant progress bar fill                       │  │
│  │ }                                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  KEYBOARD NAVIGATION:                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tab → Focus on "계속하기" button                     │  │
│  │ Enter/Space → Close celebration                     │  │
│  │ (Future: Escape → Close celebration)                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  SCREEN READER:                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ "Dialog: 좋은 출발!"                                 │  │
│  │ "증거 수집의 첫 걸음을 내딛었습니다."                 │  │
│  │ "25 percent complete"                                │  │
│  │ "Button: 계속하기"                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Summary

This visual flow demonstrates:

1. **Evidence Discovery**: Player searches → Evidence found → Progress updates
2. **Milestone Detection**: Automatic threshold crossing detection
3. **Celebration Display**: Animated card with confetti and message
4. **User Control**: Multiple dismissal options with auto-close failsafe
5. **Accessibility**: Reduced motion, screen readers, keyboard navigation
6. **Progressive Enhancement**: Celebrations increase in intensity (25% → 100%)

**Key UX Principles**:
- ✅ Non-blocking: Celebrations don't prevent gameplay
- ✅ Delightful: Animations create positive emotions
- ✅ Accessible: Works for all users regardless of abilities
- ✅ Performant: Smooth 60fps animations
- ✅ Intuitive: Clear messaging and visual hierarchy
