# Phase 4: Quick Reference Guide

## 🚀 Quick Start

### 1. Add Achievement Tracking (30 seconds)

```typescript
import { AchievementToastManager } from '@/components/gamification';
import { useAchievementTracking } from '@/hooks/useGamification';

function App() {
  const { newAchievements, dismissAchievement } = useAchievementTracking(
    discoveredEvidence,
    searchHistory
  );

  return (
    <>
      {/* Your app */}
      <AchievementToastManager
        achievements={newAchievements}
        onDismiss={dismissAchievement}
      />
    </>
  );
}
```

### 2. Add Milestone Celebrations (1 minute)

```typescript
import { MilestoneCelebration, useMilestoneTracking } from '@/components/gamification';

function EvidenceTracker() {
  const progress = (foundEvidence / totalEvidence) * 100;
  const { showCelebration, previousProgress, handleClose } = useMilestoneTracking(progress);

  return (
    <>
      {/* Your progress UI */}
      <MilestoneCelebration
        currentProgress={progress}
        previousProgress={previousProgress}
        isOpen={showCelebration}
        onClose={handleClose}
      />
    </>
  );
}
```

### 3. Add Detective Archetype Selector (2 minutes)

```typescript
import { ArchetypeSelectorButton, DetectiveArchetypeSelector } from '@/components/gamification';
import { useDetectiveArchetype } from '@/hooks/useGamification';

function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const { archetype, setArchetype } = useDetectiveArchetype(playerStats);

  return (
    <>
      <ArchetypeSelectorButton
        currentArchetype={archetype}
        onClick={() => setIsOpen(true)}
      />

      <DetectiveArchetypeSelector
        selectedArchetype={archetype}
        onSelect={setArchetype}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
```

---

## 📦 Component Imports

```typescript
// Gamification components
import {
  AchievementToast,
  AchievementToastManager,
  MilestoneCelebration,
  useMilestoneTracking,
  DetectiveArchetypeSelector,
  ArchetypeSelectorButton,
} from '@/components/gamification';

// Visual effects
import {
  ConfettiExplosion,
  SparkleEffect,
  ShineEffect,
  GlowPulse,
  RainbowBorder,
} from '@/components/effects/ConfettiExplosion';

// Utilities
import {
  getEvidenceRarity,
  checkAchievements,
  getCelebrationMessage,
} from '@/utils/evidenceRarity';

import {
  getDiscoveryVoiceLine,
  getSearchVoiceLine,
  determineArchetype,
} from '@/utils/detectiveVoices';

// Hooks
import {
  useGamification,
  useAchievementTracking,
  useDetectiveArchetype,
} from '@/hooks/useGamification';

import {
  useReducedMotion,
  useAccessibleAnimation,
} from '@/hooks/useReducedMotion';
```

---

## 🎯 Common Patterns

### Evidence Card with Rarity

```typescript
const rarity = getEvidenceRarity(evidence);

<div className={`${rarity.borderColor} ${rarity.bgColor}`}>
  {rarity.tier === 'rare' && <SparkleEffect active />}
  {rarity.tier === 'legendary' && <ShineEffect active />}
  <span>{rarity.emoji}</span>
  <span className={rarity.color}>{rarity.label}</span>
  {/* Evidence content */}
</div>
```

### Confetti Trigger

```typescript
const [showConfetti, setShowConfetti] = useState(false);

useEffect(() => {
  if (importantEventHappened) {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  }
}, [importantEventHappened]);

<ConfettiExplosion trigger={showConfetti} intensity="high" />
```

### Voice Line Display

```typescript
const { archetype } = useDetectiveArchetype();
const voiceLine = getDiscoveryVoiceLine(archetype, evidenceCount, hasCritical, hasImportant);

<div className="voice-bubble">
  <span>{voiceLine.emoji}</span>
  <p>"{voiceLine.text}"</p>
</div>
```

### Accessible Animation

```typescript
const { getVariants, getDuration } = useAccessibleAnimation();

<motion.div
  variants={getVariants(
    { initial: { y: 20 }, animate: { y: 0 } }, // Full
    { initial: { opacity: 0 }, animate: { opacity: 1 } } // Reduced
  )}
  transition={{ duration: getDuration(0.5, 0.1) }}
/>
```

---

## 🎨 Styling Reference

### Rarity Colors

| Tier | Color Class | Border | Background |
|------|------------|--------|------------|
| Common | `text-gray-400` | `border-gray-500` | `bg-gray-900/20` |
| Uncommon | `text-blue-400` | `border-blue-500` | `bg-blue-900/20` |
| Rare | `text-purple-400` | `border-purple-500` | `bg-purple-900/20` |
| Legendary | `text-yellow-400` | `border-yellow-500` | `bg-yellow-900/20` |
| Secret | `text-pink-400` | `border-pink-500` | `bg-gradient-to-r from-pink-900/20 to-purple-900/20` |

### Milestone Colors

| Milestone | Color | Classes |
|-----------|-------|---------|
| 25% | Blue | `from-blue-600/20 to-blue-800/20`, `border-blue-500` |
| 50% | Purple | `from-purple-600/20 to-purple-800/20`, `border-purple-500` |
| 75% | Orange | `from-orange-600/20 to-orange-800/20`, `border-orange-500` |
| 100% | Gold | `from-yellow-600/20 to-yellow-800/20`, `border-yellow-500` |

---

## 🔧 Configuration

### Confetti Intensities

```typescript
intensity: 'low'    // 15 particles
intensity: 'medium' // 30 particles
intensity: 'high'   // 50 particles
```

### Animation Durations

```typescript
confetti: 2000ms (default)
shine: 2000ms (repeats every 3s)
sparkle: 1500ms (infinite loop)
glow: 2000ms (infinite loop)
achievement toast: 5000ms auto-dismiss
milestone: 4000ms auto-dismiss
```

### Detective Archetypes

```typescript
'sherlock'    // 🎩 Intellectual, confident
'noir'        // 🌃 Cynical, dramatic
'enthusiast'  // 🎉 Energetic, playful
'methodical'  // 📌 Precise, analytical
'rookie'      // 😊 Eager, relatable
```

### Achievements

```typescript
'caffeine-detective'     // ☕ 3+ locations searched
'thorough-investigator'  // 🔍 5+ evidence in one location
'sherlock-holmes'        // 🎩 All critical evidence found
'eagle-eye'              // 🦅 5+ exhaustive searches
'speed-demon'            // ⚡ Only quick searches used
```

---

## 🐛 Troubleshooting

### Confetti not showing?
```typescript
// ❌ Wrong - trigger never changes
<ConfettiExplosion trigger={true} />

// ✅ Correct - trigger toggles
const [show, setShow] = useState(false);
useEffect(() => {
  if (event) {
    setShow(true);
    setTimeout(() => setShow(false), 2000);
  }
}, [event]);
<ConfettiExplosion trigger={show} />
```

### Voice lines not updating?
```typescript
// ❌ Wrong - archetype never changes
const archetype = 'enthusiast';

// ✅ Correct - archetype from hook
const { archetype } = useDetectiveArchetype(playerStats);
```

### Achievements not unlocking?
```typescript
// ❌ Wrong - not tracking properly
const achievements = checkAchievements([], []);

// ✅ Correct - pass real data
const achievements = checkAchievements(
  discoveredEvidence,
  searchHistory
);
```

### Animations laggy?
```typescript
// Check reduced motion
const prefersReducedMotion = useReducedMotion();
if (prefersReducedMotion) {
  // Skip heavy animations
}

// Or reduce particle count
<ConfettiExplosion intensity="low" /> // 15 instead of 50
```

---

## 📱 Mobile Considerations

### Responsive Breakpoints

```typescript
// Use Tailwind responsive classes
className="text-base sm:text-lg md:text-xl"
className="p-4 sm:p-6"
className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
```

### Touch Targets

```typescript
// Minimum 44x44px for touch
className="min-w-[44px] min-h-[44px]"
className="p-3" // Ensures sufficient touch area
```

### Performance

```typescript
// Reduce particles on mobile
const isMobile = window.innerWidth < 768;
const intensity = isMobile ? 'low' : 'medium';

<ConfettiExplosion intensity={intensity} />
```

---

## ♿ Accessibility Checklist

- [x] All modals keyboard navigable
- [x] ESC key closes modals
- [x] Focus trapped in modals
- [x] ARIA labels on all buttons
- [x] ARIA live regions for achievements
- [x] Reduced motion support
- [x] Screen reader announcements
- [x] Color contrast 4.5:1+
- [x] Touch targets 44x44px+

---

## 📊 Analytics Events

### Recommended Tracking

```typescript
// Achievement unlocked
trackEvent('achievement_unlocked', {
  achievement_id: achievement.id,
  achievement_name: achievement.name,
});

// Milestone reached
trackEvent('milestone_reached', {
  percentage: milestone,
  total_evidence: evidenceCount,
});

// Archetype selected
trackEvent('archetype_selected', {
  archetype: newArchetype,
  previous_archetype: oldArchetype,
  manual_selection: true,
});

// Legendary evidence found
trackEvent('legendary_evidence_found', {
  evidence_id: evidence.id,
  location_id: locationId,
});
```

---

## 🔗 File Locations

```
src/client/
├── components/gamification/
│   ├── AchievementToast.tsx
│   ├── MilestoneCelebration.tsx
│   ├── DetectiveArchetypeSelector.tsx
│   └── index.ts
├── utils/
│   ├── detectiveVoices.ts
│   └── evidenceRarity.ts
└── hooks/
    ├── useGamification.ts
    └── useReducedMotion.ts

docs/
├── PHASE4_WHIMSY_GAMIFICATION.md
├── PHASE4_INTEGRATION_EXAMPLES.md
├── PHASE4_IMPLEMENTATION_COMPLETE.md
└── PHASE4_QUICK_REFERENCE.md (this file)
```

---

## 💡 Pro Tips

1. **Use the comprehensive hook**: `useGamification()` handles everything
2. **Test with reduced motion**: Toggle in browser DevTools
3. **Memoize rarity calculations**: Use `useMemo()` for performance
4. **Queue achievements**: Use `AchievementToastManager`, not individual toasts
5. **Persist archetype**: Auto-saved to localStorage
6. **Monitor particle counts**: Stay under 50 for smooth 60fps
7. **Test on mobile**: Animations may need adjustment
8. **Add analytics**: Track engagement with whimsy features

---

## 🎓 Learning Resources

- **Framer Motion**: https://www.framer.com/motion/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **CSS GPU Optimization**: Use `transform` and `opacity` only
- **React Performance**: https://react.dev/learn/render-and-commit

---

**Last Updated**: October 23, 2025
**Version**: 1.0
**Maintained by**: Development Team
