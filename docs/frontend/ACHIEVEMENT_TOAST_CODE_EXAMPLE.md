# Achievement Toast Integration - Code Examples

## Complete Integration Example

### InvestigationScreen.tsx - Key Sections

#### 1. Imports
```typescript
import { AchievementToast } from './gamification/AchievementToast';
import { useGamification } from '../hooks/useGamification';
import type { Achievement } from '../utils/evidenceRarity';
```

#### 2. State Setup
```typescript
export function InvestigationScreen({ caseId, userId, caseData, suspects, onGoToSubmission }) {
  // Evidence tracking
  const [discoveredEvidence, setDiscoveredEvidence] = useState<EvidenceItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<Array<{ searchType: string }>>([]);

  // Achievement toast state
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  // Initialize gamification system
  const { state, actions } = useGamification({
    evidenceList: discoveredEvidence,
    searchHistory,
    onAchievementUnlocked: handleAchievementUnlocked,
  });
```

#### 3. Achievement Handlers
```typescript
  /**
   * Handle new achievement unlocked
   */
  function handleAchievementUnlocked(achievement: Achievement) {
    setAchievementQueue((prev) => [...prev, achievement]);
  }

  /**
   * Show next achievement from queue
   */
  useEffect(() => {
    if (!currentAchievement && achievementQueue.length > 0) {
      const [next, ...rest] = achievementQueue;
      setCurrentAchievement(next);
      setAchievementQueue(rest);
    }
  }, [currentAchievement, achievementQueue]);

  /**
   * Handle toast dismissal
   */
  const handleToastClose = useCallback(() => {
    setCurrentAchievement(null);
    // Next achievement will auto-show via useEffect above
  }, []);
```

#### 4. Render
```typescript
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Achievement Toast - Fixed at top with highest z-index (z-60) */}
      <AchievementToast
        achievement={currentAchievement}
        onClose={handleToastClose}
        duration={5000}
      />

      {/* Rest of UI */}
      <div className="sticky top-0 z-50 bg-gray-900">
        {/* Header content */}
      </div>

      {/* ... */}
    </div>
  );
}
```

## Usage Scenarios

### Scenario 1: Single Achievement
```typescript
// Player finds first evidence
Evidence Discovery → API Update → useGamification detects change
  ↓
handleAchievementUnlocked called with "First Discovery"
  ↓
achievementQueue updated: ["First Discovery"]
  ↓
useEffect detects queue has items and no current toast
  ↓
currentAchievement set to "First Discovery"
  ↓
AchievementToast renders and animates in
  ↓
After 5 seconds OR user clicks
  ↓
handleToastClose called
  ↓
currentAchievement set to null
  ↓
Toast animates out
```

### Scenario 2: Multiple Achievements
```typescript
// Player finds evidence in 3 locations AND uses exhaustive search 5 times
useGamification detects BOTH achievements
  ↓
handleAchievementUnlocked called TWICE
  ↓
achievementQueue: ["Caffeine Detective", "Eagle Eye"]
  ↓
useEffect shows first: currentAchievement = "Caffeine Detective"
  ↓
Toast shows "Caffeine Detective"
  ↓
After 5 seconds OR user clicks
  ↓
currentAchievement = null, queue = ["Eagle Eye"]
  ↓
useEffect detects queue has items
  ↓
currentAchievement = "Eagle Eye"
  ↓
Second toast shows automatically
```

## Achievement Types Reference

```typescript
export interface Achievement {
  id: string;
  name: string;          // Display name (Korean)
  description: string;   // What player did to earn it
  emoji: string;         // Visual icon
  unlocked: boolean;     // Unlock status
}
```

### Available Achievements

```typescript
const ACHIEVEMENTS = {
  caffeineDetective: {
    id: 'caffeine-detective',
    name: '카페인 탐정',
    description: '3개 이상의 장소에서 증거를 발견했습니다',
    emoji: '☕',
    trigger: 'Evidence found in 3+ unique locations'
  },

  thoroughInvestigator: {
    id: 'thorough-investigator',
    name: '철저한 수사관',
    description: '한 장소에서 5개 이상의 증거를 발견했습니다',
    emoji: '🔍',
    trigger: '5+ evidence in single location'
  },

  sherlockHolmes: {
    id: 'sherlock-holmes',
    name: '셜록 홈즈',
    description: '모든 핵심 증거를 발견했습니다',
    emoji: '🎩',
    trigger: 'All critical evidence found (3+)'
  },

  eagleEye: {
    id: 'eagle-eye',
    name: '독수리 눈',
    description: '완벽한 탐색을 5번 이상 수행했습니다',
    emoji: '🦅',
    trigger: 'Used exhaustive search 5+ times'
  },

  speedDemon: {
    id: 'speed-demon',
    name: '스피드 데몬',
    description: '빠른 탐색만으로 증거를 찾았습니다',
    emoji: '⚡',
    trigger: 'Only quick searches used (3+ searches)'
  }
};
```

## Component Props

### AchievementToast Props
```typescript
interface AchievementToastProps {
  achievement: Achievement | null;  // Current achievement to show
  onClose?: () => void;            // Callback when toast closes
  duration?: number;               // Auto-close duration (default: 5000ms)
}
```

### useGamification Options
```typescript
interface UseGamificationOptions {
  evidenceList?: EvidenceItem[];                    // Current evidence
  searchHistory?: Array<{ searchType: string }>;   // Search actions
  initialArchetype?: DetectiveArchetype;           // Starting archetype
  onAchievementUnlocked?: (achievement: Achievement) => void;  // Callback
  onMilestoneReached?: (milestone: number) => void;           // Milestone callback
}
```

## Styling

### Z-Index Layers
```css
.achievement-toast {
  z-index: 60;  /* Highest - above everything */
}

.sticky-header {
  z-index: 50;  /* Below toast, above content */
}

.milestone-celebration {
  z-index: 40;  /* Below header */
}

.modals {
  z-index: 30;
}
```

### Toast Positioning
```typescript
// Fixed at top-center
className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4"
```

### Animations
```typescript
// Slide in from top
initial={{ y: -100, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
exit={{ y: -100, opacity: 0 }}
transition={{ type: 'spring', stiffness: 300, damping: 30 }}
```

## Testing Code

### Manual Testing Helper
```typescript
// Add to InvestigationScreen for testing
const triggerTestAchievement = () => {
  const testAchievement: Achievement = {
    id: 'test-achievement',
    name: 'Test Achievement',
    description: 'This is a test achievement',
    emoji: '🎯',
    unlocked: true,
  };
  handleAchievementUnlocked(testAchievement);
};

// Add test button (remove in production)
<button onClick={triggerTestAchievement}>
  Test Achievement Toast
</button>
```

### Console Logging
```typescript
// Debug achievement flow
function handleAchievementUnlocked(achievement: Achievement) {
  console.log('🎉 Achievement unlocked:', achievement);
  setAchievementQueue((prev) => {
    console.log('📋 Current queue:', prev);
    console.log('📋 New queue:', [...prev, achievement]);
    return [...prev, achievement];
  });
}
```

## Common Patterns

### Pattern 1: Queue Multiple Achievements
```typescript
const achievements = [achievement1, achievement2, achievement3];
achievements.forEach(handleAchievementUnlocked);
// Shows one at a time, queues the rest
```

### Pattern 2: Clear Queue
```typescript
setAchievementQueue([]);
setCurrentAchievement(null);
// Clears all pending achievements
```

### Pattern 3: Skip Current Toast
```typescript
handleToastClose();
// Immediately shows next queued achievement
```

## Error Handling

### Null Safety
```typescript
// AchievementToast handles null gracefully
if (!achievement) return null;
```

### Queue Safety
```typescript
// Always check queue length before accessing
if (achievementQueue.length > 0) {
  const [next, ...rest] = achievementQueue;
  // ...
}
```

## Performance Tips

1. **Use useCallback**: Prevents handler recreation
   ```typescript
   const handleToastClose = useCallback(() => {
     setCurrentAchievement(null);
   }, []);
   ```

2. **Memoize Achievement Check**: Reduce recalculations
   ```typescript
   const achievements = useMemo(() =>
     checkAchievements(evidenceList, searchHistory),
     [evidenceList, searchHistory]
   );
   ```

3. **Debounce Rapid Unlocks**: Prevent spam
   ```typescript
   const debouncedUnlock = useMemo(
     () => debounce(handleAchievementUnlocked, 300),
     []
   );
   ```

## Accessibility

### ARIA Attributes
```typescript
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  Achievement content
</div>
```

### Keyboard Navigation
```typescript
<button
  onClick={handleClose}
  className="focus:outline-none focus:ring-2 focus:ring-detective-gold"
  aria-label="닫기"
  type="button"
>
  Close
</button>
```

### Reduced Motion
```typescript
const prefersReducedMotion = useReducedMotion();

if (prefersReducedMotion) {
  // Skip confetti animation
  // Use simple fade instead of slide
}
```

## Integration Checklist

- [x] Import AchievementToast component
- [x] Import useGamification hook
- [x] Import Achievement type
- [x] Add achievement queue state
- [x] Add current achievement state
- [x] Initialize useGamification hook
- [x] Create handleAchievementUnlocked callback
- [x] Add useEffect for queue processing
- [x] Create handleToastClose callback
- [x] Mount AchievementToast component
- [x] Set proper z-index
- [x] Pass achievement prop
- [x] Pass onClose prop
- [x] Set duration prop
- [x] Test build
- [x] Verify no console errors
- [x] Test achievement triggers
- [x] Test queue behavior
- [x] Test accessibility

## Related Documentation

- [AchievementToast Component](C:\Users\hpcra\armchair-sleuths\src\client\components\gamification\AchievementToast.tsx)
- [useGamification Hook](C:\Users\hpcra\armchair-sleuths\src\client\hooks\useGamification.ts)
- [Evidence Rarity System](C:\Users\hpcra\armchair-sleuths\src\client\utils\evidenceRarity.ts)
- [Integration Summary](C:\Users\hpcra\armchair-sleuths\docs\frontend\ACHIEVEMENT_TOAST_INTEGRATION.md)
