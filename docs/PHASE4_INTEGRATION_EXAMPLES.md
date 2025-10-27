# Phase 4 Integration Examples

## Quick Start

### 1. Basic Evidence Discovery with Whimsy

```typescript
import { EnhancedEvidenceDiscoveryModal } from '@/components/EnhancedEvidenceDiscoveryModal';
import { useGamification } from '@/hooks/useGamification';

function LocationExplorer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [evidenceFound, setEvidenceFound] = useState<EvidenceItem[]>([]);

  const { state, actions } = useGamification({
    evidenceList: discoveredEvidence,
    searchHistory: searches,
    onAchievementUnlocked: (achievement) => {
      console.log('Achievement unlocked:', achievement.name);
    },
    onMilestoneReached: (milestone) => {
      console.log('Milestone reached:', milestone);
    },
  });

  const handleSearch = async (searchType: 'quick' | 'thorough' | 'exhaustive') => {
    const found = await performSearch(locationId, searchType);

    setEvidenceFound(found);
    setIsModalOpen(true);

    // Track search
    actions.recordSearch(searchType);
    actions.recordEvidenceFound(found.length);
  };

  return (
    <>
      {/* Search UI */}
      <button onClick={() => handleSearch('quick')}>빠른 탐색</button>
      <button onClick={() => handleSearch('thorough')}>꼼꼼한 탐색</button>
      <button onClick={() => handleSearch('exhaustive')}>전면 탐색</button>

      {/* Discovery modal with all whimsy features */}
      <EnhancedEvidenceDiscoveryModal
        isOpen={isModalOpen}
        caseId={caseId}
        evidenceFound={evidenceFound}
        locationName={location.name}
        completionRate={state.currentProgress}
        totalEvidence={20}
        onClose={() => setIsModalOpen(false)}
        playerStats={state.playerStats}
      />
    </>
  );
}
```

### 2. Achievement System

```typescript
import { AchievementToastManager } from '@/components/gamification';
import { useAchievementTracking } from '@/hooks/useGamification';

function InvestigationScreen() {
  const { newAchievements, dismissAchievement } = useAchievementTracking(
    discoveredEvidence,
    searchHistory
  );

  return (
    <>
      {/* Your investigation UI */}
      <div>...</div>

      {/* Achievement toasts */}
      <AchievementToastManager
        achievements={newAchievements}
        onDismiss={dismissAchievement}
      />
    </>
  );
}
```

### 3. Milestone Celebrations

```typescript
import { MilestoneCelebration, useMilestoneTracking } from '@/components/gamification';

function EvidenceTracker() {
  const totalEvidence = 20; // From case metadata
  const foundEvidence = discoveredEvidence.length;
  const completionRate = (foundEvidence / totalEvidence) * 100;

  const { showCelebration, previousProgress, handleClose } = useMilestoneTracking(completionRate);

  return (
    <>
      {/* Progress UI */}
      <div className="progress-bar">
        <div style={{ width: `${completionRate}%` }} />
      </div>

      {/* Milestone celebration */}
      <MilestoneCelebration
        currentProgress={completionRate}
        previousProgress={previousProgress}
        isOpen={showCelebration}
        onClose={handleClose}
      />
    </>
  );
}
```

### 4. Detective Archetype Selection

```typescript
import {
  DetectiveArchetypeSelector,
  ArchetypeSelectorButton
} from '@/components/gamification';
import { useDetectiveArchetype } from '@/hooks/useGamification';

function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { archetype, setArchetype } = useDetectiveArchetype(playerStats);

  return (
    <div className="settings">
      <h2>설정</h2>

      {/* Compact button */}
      <ArchetypeSelectorButton
        currentArchetype={archetype}
        onClick={() => setIsOpen(true)}
      />

      {/* Full selector modal */}
      <DetectiveArchetypeSelector
        selectedArchetype={archetype}
        onSelect={setArchetype}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
```

### 5. Custom Evidence Card with Rarity

```typescript
import { getEvidenceRarity } from '@/utils/evidenceRarity';
import { SparkleEffect, ShineEffect, GlowPulse } from '@/components/effects/ConfettiExplosion';

function EvidenceCard({ evidence }: { evidence: EvidenceItem }) {
  const rarity = getEvidenceRarity(evidence);

  return (
    <div className={`
      relative p-4 rounded-lg border-2
      ${rarity.borderColor} ${rarity.bgColor}
    `}>
      {/* Rarity effects */}
      {rarity.tier === 'rare' && <SparkleEffect active />}
      {rarity.tier === 'legendary' && <ShineEffect active />}
      {(rarity.tier === 'legendary' || rarity.tier === 'rare') && (
        <GlowPulse
          color={rarity.tier === 'legendary' ? 'yellow' : 'purple'}
          active
        />
      )}

      {/* Evidence content */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{rarity.emoji}</span>
        <span className={`text-xs font-bold ${rarity.color}`}>
          {rarity.label}
        </span>
      </div>

      <h3 className="font-bold text-white">{evidence.name}</h3>
      <p className="text-sm text-gray-400">{evidence.description}</p>
    </div>
  );
}
```

### 6. Detective Voice Lines

```typescript
import { getDiscoveryVoiceLine, getSearchVoiceLine } from '@/utils/detectiveVoices';
import { useDetectiveArchetype } from '@/hooks/useGamification';

function SearchButton({ searchType }: { searchType: 'quick' | 'thorough' | 'exhaustive' }) {
  const { archetype } = useDetectiveArchetype();
  const [showVoiceLine, setShowVoiceLine] = useState(false);

  const handleClick = () => {
    setShowVoiceLine(true);
    // Perform search...
  };

  const voiceLine = getSearchVoiceLine(archetype, searchType);

  return (
    <div>
      <button onClick={handleClick}>
        {searchType === 'quick' && '빠른 탐색'}
        {searchType === 'thorough' && '꼼꼼한 탐색'}
        {searchType === 'exhaustive' && '전면 탐색'}
      </button>

      {/* Voice line tooltip */}
      {showVoiceLine && (
        <div className="voice-bubble">
          <span className="emoji">{voiceLine.emoji}</span>
          <p>"{voiceLine.text}"</p>
        </div>
      )}
    </div>
  );
}
```

### 7. Confetti Celebration

```typescript
import { ConfettiExplosion } from '@/components/effects/ConfettiExplosion';

function CaseCompleted() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (caseCompleted) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [caseCompleted]);

  return (
    <>
      {/* Confetti */}
      <ConfettiExplosion
        trigger={showConfetti}
        intensity="high"
        duration={3000}
      />

      {/* Completion UI */}
      <div className="text-center">
        <h1>사건 해결!</h1>
        <p>축하합니다! 범인을 찾았습니다!</p>
      </div>
    </>
  );
}
```

### 8. Accessible Animations

```typescript
import { useAccessibleAnimation } from '@/hooks/useReducedMotion';
import { motion } from 'framer-motion';

function AnimatedCard() {
  const { prefersReducedMotion, getVariants, getDuration } = useAccessibleAnimation();

  const variants = getVariants(
    // Full animation
    {
      initial: { opacity: 0, y: 20, scale: 0.9 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -20, scale: 0.9 },
    },
    // Reduced animation
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    }
  );

  return (
    <motion.div
      variants={variants}
      transition={{ duration: getDuration(0.5, 0.1) }}
    >
      {/* Card content */}
    </motion.div>
  );
}
```

### 9. Complete Integration Example

```typescript
import { useGamification } from '@/hooks/useGamification';
import {
  AchievementToastManager,
  MilestoneCelebration,
  DetectiveArchetypeSelector,
} from '@/components/gamification';
import { EnhancedEvidenceDiscoveryModal } from '@/components/EnhancedEvidenceDiscoveryModal';

function GameContainer() {
  // Gamification state
  const { state, actions } = useGamification({
    evidenceList: discoveredEvidence,
    searchHistory: searches,
    onAchievementUnlocked: (achievement) => {
      // Analytics tracking
      trackEvent('achievement_unlocked', { id: achievement.id });
    },
    onMilestoneReached: (milestone) => {
      // Analytics tracking
      trackEvent('milestone_reached', { percentage: milestone });
    },
  });

  // UI state
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);
  const [isArchetypeSelectorOpen, setIsArchetypeSelectorOpen] = useState(false);
  const [currentEvidence, setCurrentEvidence] = useState<EvidenceItem[]>([]);

  const handleSearch = async (locationId: string, searchType: 'quick' | 'thorough' | 'exhaustive') => {
    // Track search
    actions.recordSearch(searchType);

    // Perform search
    const found = await performSearch(locationId, searchType);

    // Track evidence found
    actions.recordEvidenceFound(found.length);

    // Show discovery modal
    setCurrentEvidence(found);
    setIsDiscoveryModalOpen(true);
  };

  return (
    <>
      {/* Main game UI */}
      <div className="game-container">
        {/* Settings button */}
        <button onClick={() => setIsArchetypeSelectorOpen(true)}>
          탐정 스타일 선택
        </button>

        {/* Search buttons */}
        <div className="search-controls">
          <button onClick={() => handleSearch(currentLocation, 'quick')}>
            빠른 탐색
          </button>
          <button onClick={() => handleSearch(currentLocation, 'thorough')}>
            꼼꼼한 탐색
          </button>
          <button onClick={() => handleSearch(currentLocation, 'exhaustive')}>
            전면 탐색
          </button>
        </div>

        {/* Evidence list */}
        <div className="evidence-list">
          {discoveredEvidence.map(evidence => (
            <EvidenceCard key={evidence.id} evidence={evidence} />
          ))}
        </div>
      </div>

      {/* Discovery modal */}
      <EnhancedEvidenceDiscoveryModal
        isOpen={isDiscoveryModalOpen}
        caseId={caseId}
        evidenceFound={currentEvidence}
        locationName={currentLocation.name}
        completionRate={state.currentProgress}
        totalEvidence={totalPossibleEvidence}
        onClose={() => setIsDiscoveryModalOpen(false)}
        playerStats={state.playerStats}
      />

      {/* Achievement toasts */}
      <AchievementToastManager
        achievements={state.newAchievements}
        onDismiss={actions.dismissAchievement}
      />

      {/* Milestone celebrations */}
      <MilestoneCelebration
        currentProgress={state.currentProgress}
        previousProgress={state.previousProgress}
        isOpen={state.showMilestone}
        onClose={actions.closeMilestone}
      />

      {/* Archetype selector */}
      <DetectiveArchetypeSelector
        selectedArchetype={state.detectiveArchetype}
        onSelect={actions.setArchetype}
        isOpen={isArchetypeSelectorOpen}
        onClose={() => setIsArchetypeSelectorOpen(false)}
      />
    </>
  );
}
```

## Tips & Best Practices

### Performance

1. **Lazy Load Effects**: Only render effects when needed
```typescript
{showEffect && <ConfettiExplosion trigger={true} />}
```

2. **Memoize Calculations**: Use `useMemo` for expensive rarity calculations
```typescript
const rarity = useMemo(() => getEvidenceRarity(evidence), [evidence]);
```

3. **Batch Updates**: Group state updates to avoid multiple re-renders
```typescript
setGameState(prev => ({
  ...prev,
  evidence: newEvidence,
  searches: newSearches,
}));
```

### Accessibility

1. **Always Use Reduced Motion Hook**: Respect user preferences
```typescript
const { prefersReducedMotion } = useAccessibleAnimation();
```

2. **Provide Screen Reader Announcements**: Use ARIA live regions
```typescript
<div role="status" aria-live="polite">
  {achievement.name} 업적 달성!
</div>
```

3. **Keyboard Navigation**: Ensure all modals are keyboard accessible
```typescript
<button onKeyDown={handleKeyDown} tabIndex={0}>
```

### User Experience

1. **Don't Overwhelm**: Limit concurrent effects
```typescript
// Queue achievements instead of showing all at once
<AchievementToastManager />
```

2. **Provide Controls**: Let users disable effects
```typescript
const [enableEffects, setEnableEffects] = useState(true);
```

3. **Save Preferences**: Persist user choices
```typescript
localStorage.setItem('detective-archetype', archetype);
```

## Troubleshooting

### Common Issues

**Q: Confetti not appearing?**
A: Check that `trigger` prop is toggling (not just `true`), and ensure z-index is high enough (50+).

**Q: Voice lines not changing?**
A: Verify `playerStats` is being updated correctly, and archetype is being recalculated.

**Q: Achievements unlocking multiple times?**
A: Use `AchievementToastManager` which handles queuing and deduplication.

**Q: Animations laggy on mobile?**
A: Reduce particle counts, disable shine effects, or use `prefersReducedMotion` as performance hint.

## Next Steps

1. **Analytics Integration**: Track whimsy engagement metrics
2. **A/B Testing**: Test different voice lines and effects
3. **Localization**: Add English translations for all text
4. **Sound Design**: Add audio cues for legendary evidence
5. **Social Sharing**: Implement screenshot capture for viral moments
