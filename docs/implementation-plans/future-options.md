# Vercel Image Integration - Future Improvement Options

**Last Updated**: 2025-10-21
**Status**: Archived for future consideration

---

## Overview

This document describes **Option 2** (Pre-generation) and **Option 3** (Hybrid) as future improvements to the currently implemented **Option 1** (Polling without Skip).

The current implementation (Option 1) provides a solid baseline with user feedback and guaranteed image generation attempts. However, these future options can further optimize user experience by reducing or eliminating wait times.

---

## Current Implementation: Option 1 (Polling without Skip)

**Status**: ✅ Implemented (see `vercel-image-integration-comprehensive-plan.md`)

**Summary**:
- User opens game → Loading screen
- Check image status
  - If `generating` → Show WaitingScreen with polling
  - If `ready` → Proceed to game
- Poll every 3 seconds for up to 150 seconds
- 60-70s average generation time
- Automatic fallback to placeholders on timeout

**Pros**:
- ✅ Guaranteed attempt to show images
- ✅ User sees progress and feedback
- ✅ No complex pre-generation scheduling

**Cons**:
- ⚠️ Users must wait 60-70 seconds
- ⚠️ First player of the day always waits

---

## Option 2: Pre-Generation (Scheduled Background Generation)

### Concept

**Decouple case creation from user access:**
- Daily Scheduler (00:00 UTC) → Generate case + Trigger images
- Images generate in background (60-70s)
- User opens game (anytime) → Images already ready

### Architecture

```
┌────────────────────────────────────────────────┐
│ Daily Scheduler (00:00 UTC)                    │
├────────────────────────────────────────────────┤
│                                                 │
│  1. Generate Story (~3s)                       │
│     └─ CaseGeneratorService                    │
│                                                 │
│  2. Save Case WITHOUT Images                   │
│     └─ Redis: case:{caseId}                   │
│     └─ Status: 'generating'                    │
│                                                 │
│  3. Trigger Vercel Function (Fire-and-Forget) │
│     └─ POST /api/generate-all-images          │
│                                                 │
│  4. Scheduler Completes (~5s)                  │
│                                                 │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ Background (00:00:05 - 00:01:15)               │
├────────────────────────────────────────────────┤
│                                                 │
│  Vercel Function Generates Images (60-70s)    │
│     ├─ 3 Suspect Profile Images               │
│     ├─ 5 Cinematic Images (optional)          │
│     └─ Webhook → Redis Update                 │
│                                                 │
│  Redis Status Changes:                         │
│     'generating' → 'ready' | 'partial'        │
│                                                 │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ User Opens Game (anytime after 00:01:15)       │
├────────────────────────────────────────────────┤
│                                                 │
│  1. Load Case (instant)                        │
│  2. Check Image Status                         │
│     └─ Status: 'ready' → Use images ✅        │
│     └─ Status: 'generating' → Placeholders    │
│  3. Game Starts IMMEDIATELY                    │
│                                                 │
└────────────────────────────────────────────────┘
```

### User Journeys

**Journey A: User Opens at 00:02:00 (After Pre-Generation)**
```
User clicks Reddit post
  → Loading screen (1-2s)
  → Case loaded
  → Image status: 'ready' ✅
  → Game starts with images IMMEDIATELY
  → Total wait: ~2s (no image wait!)
```

**Journey B: User Opens at 00:00:30 (During Pre-Generation)**
```
User clicks Reddit post
  → Loading screen (1-2s)
  → Case loaded
  → Image status: 'generating'
  → Game starts with placeholders
  → Total wait: ~2s (acceptable!)
  → Note: Images may load later via refresh (optional)
```

### Implementation Changes

**1. DailyCaseScheduler Modification**
```typescript
// Current
async generateDailyCase() {
  const case = await caseGenerator.generateCase({
    includeSuspectImages: true,
    includeCinematicImages: true
  });
  // ... create Reddit post
}

// Option 2
async generateDailyCase() {
  // Generate WITHOUT images (fast: ~3-5s)
  const case = await caseGenerator.generateCase({
    includeSuspectImages: false,  // Don't wait for images
    includeCinematicImages: false
  });

  // Trigger pre-generation AFTER scheduler returns
  this.triggerPreGeneration(case.id);

  // Create Reddit post immediately
  // ...
}

private triggerPreGeneration(caseId: string) {
  // Same logic as current Vercel trigger
  // But triggered by scheduler instead of user access
}
```

**2. Frontend Changes (Minimal)**
```typescript
// Remove WaitingScreen entirely
// Always proceed to game immediately

checkImageStatus() {
  const status = await fetch(`/api/case/${caseId}/image-status`);

  if (status === 'ready') {
    // Use images ✅
  } else {
    // Use placeholders (no wait)
  }

  // Always proceed to game
  proceedToIntro();
}
```

### Pros & Cons

**Pros**:
- ✅ Zero wait time for 99% of users
- ✅ Better UX (instant game start)
- ✅ No WaitingScreen complexity
- ✅ Predictable image generation timing

**Cons**:
- ⚠️ First ~90 seconds after 00:00 UTC: Users see placeholders
- ⚠️ Pre-generation failure = All users get placeholders until next day
- ⚠️ Scheduler timing must be reliable
- ⚠️ Images generated even if no one plays (wasted resources)

### When to Implement

**Best for**:
- High daily active users (>100/day)
- Predictable traffic patterns
- Reliable scheduler infrastructure
- Cost-effective image generation

---

## Option 3: Hybrid (Best of Both Worlds)

### Concept

**Combine pre-generation with on-demand fallback:**
- Try pre-generation first (daily scheduler)
- If pre-generation fails → Trigger on-demand generation
- If user arrives during generation → Show WaitingScreen

### Architecture

```
┌────────────────────────────────────────────────┐
│ Daily Scheduler (00:00 UTC)                    │
├────────────────────────────────────────────────┤
│                                                 │
│  1. Generate Case (~3-5s)                      │
│  2. Set Status: 'generating'                   │
│  3. Trigger Vercel Pre-Generation              │
│     └─ Completes in background (60-70s)       │
│                                                 │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ User Opens Game                                 │
├────────────────────────────────────────────────┤
│                                                 │
│  Check Image Status:                           │
│  ├─ 'ready' → Game with images ✅             │
│  ├─ 'generating' → WaitingScreen (poll)       │
│  └─ 'failed' → Trigger on-demand ⚙️          │
│                                                 │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ On-Demand Generation (Fallback)                │
├────────────────────────────────────────────────┤
│                                                 │
│  If status === 'failed':                       │
│  1. Trigger new Vercel generation             │
│  2. Show WaitingScreen                         │
│  3. Poll until ready or timeout               │
│                                                 │
│  Ensures images always attempted!              │
│                                                 │
└────────────────────────────────────────────────┘
```

### User Journeys

**Journey A: Pre-Generation Succeeded (99% of cases)**
```
User opens game
  → Image status: 'ready'
  → Game starts with images IMMEDIATELY ✅
  → Best possible UX!
```

**Journey B: User Arrives During Pre-Generation**
```
User opens game at 00:00:30
  → Image status: 'generating'
  → WaitingScreen shown
  → Poll every 3s
  → Images ready in ~30-40s (remaining time)
  → Game starts with images ✅
```

**Journey C: Pre-Generation Failed**
```
User opens game
  → Image status: 'failed'
  → Trigger on-demand generation
  → WaitingScreen shown
  → Poll every 3s
  → Images ready in ~60-70s
  → Game starts with images ✅
  → Guaranteed attempt!
```

### Implementation Changes

**1. New Endpoint: On-Demand Generation**
```typescript
router.post('/api/case/:caseId/generate-images-on-demand', async (req, res) => {
  const { caseId } = req.params;

  // Check current status
  const currentStatus = await redis.get(`case:${caseId}:image-status`);

  // Only trigger if failed or unknown
  if (currentStatus?.status === 'failed' || !currentStatus) {
    // Reset status to 'generating'
    await redis.set(`case:${caseId}:image-status`, {
      status: 'generating',
      startedAt: Date.now()
    });

    // Trigger Vercel (same as scheduler)
    await triggerVercelImageGeneration(caseId);

    return res.json({ triggered: true });
  }

  return res.json({ triggered: false, reason: 'Already generating or ready' });
});
```

**2. Frontend Logic**
```typescript
async checkImageStatus() {
  const status = await fetch(`/api/case/${caseId}/image-status`);

  if (status === 'ready' || status === 'partial') {
    // Images available → Use them
    proceedToIntro();
  } else if (status === 'generating') {
    // Pre-generation in progress → Wait
    setCurrentScreen('waiting-images');
  } else if (status === 'failed' || status === 'unknown') {
    // Pre-generation failed → Trigger on-demand
    await fetch(`/api/case/${caseId}/generate-images-on-demand`, { method: 'POST' });
    setCurrentScreen('waiting-images');
  }
}
```

### Pros & Cons

**Pros**:
- ✅ Zero wait for 99% of users (pre-generation success)
- ✅ Guaranteed image attempt even if pre-generation fails
- ✅ Best user experience across all scenarios
- ✅ Resilient to scheduler failures

**Cons**:
- ⚠️ Most complex implementation
- ⚠️ Two code paths to maintain (pre-gen + on-demand)
- ⚠️ Potential for duplicate generation if timing is bad
- ⚠️ Highest development and testing cost

### When to Implement

**Best for**:
- Production-ready system
- High user expectations
- Need maximum reliability
- Willing to invest in complexity

---

## Comparison Matrix

| Aspect                  | Option 1 (Current) | Option 2 (Pre-Gen) | Option 3 (Hybrid) |
|-------------------------|--------------------|--------------------|-------------------|
| **User Wait Time**      | 60-70s always      | 0s (99% cases)     | 0s (99% cases)    |
| **Implementation**      | ✅ Simple           | ✅ Simple           | ⚠️ Complex         |
| **Reliability**         | ✅ High             | ⚠️ Medium           | ✅ Very High       |
| **Resource Efficiency** | ✅ On-demand only   | ⚠️ Always generate  | ✅ Smart generation|
| **Scheduler Dependency**| ❌ None             | ✅ Critical         | ⚠️ Important       |
| **Fallback Robustness** | ✅ Built-in         | ❌ None             | ✅ Built-in        |
| **Maintenance Cost**    | ✅ Low              | ✅ Low              | ⚠️ High            |
| **Best For**            | MVP, Low traffic   | High traffic       | Production scale  |

---

## Migration Path

### From Option 1 → Option 2

**Steps**:
1. Modify `DailyCaseScheduler` to trigger pre-generation
2. Remove `WaitingScreen` component
3. Simplify frontend image status check
4. Test scheduler timing and reliability
5. Monitor pre-generation success rate

**Estimated Effort**: 2-3 days

**Risk**: Medium (scheduler must be reliable)

---

### From Option 1 → Option 3

**Steps**:
1. Implement pre-generation in scheduler (like Option 2)
2. Add `/api/case/:caseId/generate-images-on-demand` endpoint
3. Modify frontend to handle 3 states: ready/generating/failed
4. Add on-demand trigger logic
5. Extensive testing of all 3 code paths

**Estimated Effort**: 4-5 days

**Risk**: Higher (complex logic, more failure modes)

---

## Recommendations

### Short-term (1-2 months)

**Stick with Option 1**
- ✅ Works reliably
- ✅ User feedback is positive (no complaints about wait)
- ✅ Simple to maintain
- ✅ Focus on other features first

### Medium-term (3-6 months)

**Evaluate Option 2** if:
- Daily active users > 100
- Image generation costs are acceptable
- Scheduler is proven reliable
- User complaints about wait time increase

### Long-term (6-12 months)

**Consider Option 3** if:
- Product is production-ready
- High user expectations
- Need maximum reliability
- Have capacity for complex maintenance

---

## Monitoring & Metrics

To decide when to migrate, track these metrics:

**Option 1 Metrics** (Current):
- Average wait time for images
- Timeout rate (150s fallback)
- User drop-off during WaitingScreen
- Image generation success rate

**Decision Triggers for Option 2**:
- If average wait time consistently > 80s → Consider pre-generation
- If user drop-off during wait > 10% → Need faster experience
- If daily users > 100 → Cost-effective to pre-generate

**Decision Triggers for Option 3**:
- If pre-generation failure rate > 5% → Need fallback
- If business-critical to always show images → Need hybrid
- If can afford complex maintenance → Invest in best UX

---

## Conclusion

The current **Option 1** implementation provides a solid, reliable baseline. **Option 2** offers significant UX improvement for high-traffic scenarios, while **Option 3** provides maximum reliability at the cost of complexity.

Choose based on:
- **Option 1**: MVP, simplicity, low traffic ✅ **Current Choice**
- **Option 2**: High traffic, cost-effective pre-generation
- **Option 3**: Production scale, maximum reliability

**Current Recommendation**: Stay with Option 1 until user feedback or traffic metrics indicate need for change.

---

**Document Version**: 1.0
**Author**: Claude Code (Sonnet 4.5) + Implementation Guardian
**Related Docs**:
- `vercel-image-integration-comprehensive-plan.md` (Current implementation)
- `doc.md/게임전체프로세스.md` (Game process)
- `doc.md/완벽게임구현상태.md` (Implementation state)
