---
name: devvit-mobile-ui-reconstruction
description: Complete mobile-first UI/UX reconstruction for Devvit Reddit games with poor frontend despite working backend. Rebuilds components from scratch using Devvit Blocks, mobile-responsive design, and game engagement patterns while preserving backend integration. Use when Reddit game UI is inadequate for mobile users, lacks polish, or requires complete frontend overhaul (not incremental refactoring). Triggers on requests mentioning "rebuild UI", "mobile optimization", "component reconstruction", "frontend overhaul", or "Devvit game polish".
---

# Devvit Mobile UI Reconstruction

## Overview

Complete systematic methodology for demolishing and rebuilding Devvit Reddit game frontends when existing UI fails mobile users. This skill handles component-by-component reconstruction while preserving backend functionality - not incremental improvements.

**Critical context:** ~70-80% of Reddit users access via mobile. Poor mobile UX kills game engagement regardless of backend quality.

## When to Use This Skill

Use when:
- Existing UI is functional but unattractive ("garbage-tier")
- Backend works well but frontend poorly serves mobile users
- Components need complete replacement, not refactoring
- Game lacks visual polish and engagement

**Do NOT use for:**
- Incremental UI improvements or bug fixes
- Backend-only changes
- Adding new features (vs rebuilding existing ones)

## Core Workflow: Demolish and Rebuild

Follow this 5-phase process component-by-component. Copy checklist to track progress:

```
UI Reconstruction Progress:
- [ ] Phase 1: Component Audit
- [ ] Phase 2: Mobile-First Design
- [ ] Phase 3: Systematic Reconstruction
- [ ] Phase 4: Backend Integration Preservation
- [ ] Phase 5: Mobile Validation
```

### Phase 1: Component Audit

Systematically assess what needs rebuilding.

1. **Catalog components:**
   ```bash
   find src/client/components -name "*.tsx" -o -name "*.jsx"
   ```

2. **Audit each component:** Use `references/component-audit-checklist.md` to evaluate

3. **Create priority matrix:**
   - **P0 (Critical):** Main game screens, core interactions
   - **P1 (High):** Navigation, action systems, submission
   - **P2 (Medium):** Settings, help, peripheral features
   - **P3 (Low):** Non-essential cosmetic elements

4. **Document backend dependencies per component:**
   - API endpoints called
   - State management patterns
   - Data flow
   - **Preserve these exactly - DO NOT break working backend**

### Phase 2: Mobile-First Design

Design attractive, engaging, mobile-optimized replacements.

**Apply patterns:** See `references/mobile-design-patterns.md` for:
- Thumb zone optimization
- Touch target sizing
- Mobile viewport strategies
- Card-based layouts
- Bottom sheet actions
- Progressive disclosure

**Design for smallest viewport first:**
- Start with 375px (iPhone SE)
- Use relative units (%, vw, vh)
- Primary actions in bottom 1/3 of screen
- Touch targets minimum 44×44px

**Game engagement:** See `references/game-engagement-patterns.md` for mystery game-specific UI patterns

### Phase 3: Systematic Reconstruction

Rebuild one component at a time. Never parallelize.

**Critical rule:** Start ONE component → Finish completely → Test → Next component

**Per-component workflow:**

1. **Backup existing:**
   ```bash
   cp src/components/OldComponent.tsx src/components/OldComponent.tsx.backup
   ```

2. **Build with Devvit Blocks:** See `references/devvit-blocks-reference.md`
   - Use vstack (vertical), hstack (horizontal), zstack (layered)
   - Design mobile-first (375px viewport)
   - Use relative units, not fixed pixels

3. **Preserve backend integration:**
   - Copy existing API calls verbatim
   - Maintain state management unchanged
   - Keep data flow identical
   - **Only change presentation layer**

4. **Add engaging visuals:**
   - Skeleton loaders (not spinners)
   - Empty states with personality
   - Subtle animations
   - Intentional color/typography/spacing

5. **Test immediately:**
   - Verify backend still works
   - Test mobile viewport
   - Check all interactions

6. **Follow priority order:** Complete P0 before starting P1

### Phase 4: Backend Integration Preservation

Ensure new UI maintains all existing backend functionality.

**Verification workflow:**

**Before reconstruction:**
- Document all API endpoints
- List all state mutations
- Note all data transformations
- Record all event handlers

**During reconstruction:**
- Copy backend code exactly (don't "improve")
- Keep imports unchanged
- Maintain hook dependencies
- Preserve prop drilling/context usage

**After reconstruction:**
- Run integration tests
- Verify all API calls work
- Check state updates
- Test error handling paths

**Critical anti-patterns:**
- ❌ "Improving" backend while rebuilding UI
- ❌ Changing state management mid-rebuild
- ❌ Refactoring API calls "while we're here"
- ✅ **Only change presentation**

### Phase 5: Mobile Validation

Verify rebuilt UI works excellently on mobile devices.

1. **Test viewports:**
   - 375×667 (iPhone SE)
   - 390×844 (iPhone 14)
   - 414×896 (iPhone 14 Pro Max)
   - 360×740 (Android mid-range)

2. **Validate touch interactions:**
   - Adequate touch targets (≥44px)
   - Smooth scrolling (no jank)
   - Modal/overlay functionality
   - Readable text without zooming

3. **Check Reddit integration:**
   - Test in Reddit iOS app webview
   - Test in Reddit Android app webview
   - Verify Custom Post rendering
   - Check game systems (action points, evidence, submission)

4. **Performance:**
   - Initial render < 2s
   - Interactions respond < 100ms
   - Images lazy load
   - No layout shift (CLS < 0.1)

## Devvit-Specific Considerations

### Devvit Blocks Fundamentals

Devvit uses declarative UI similar to React Native:

```typescript
<vstack>   // Vertical stack (flex-direction: column)
<hstack>   // Horizontal stack (flex-direction: row)
<zstack>   // Layered stack (position: absolute)
<text>     // Text content
<image>    // Images (requires URL)
<button>   // Interactive buttons
<spacer>   // Flexible spacing
```

**Complete reference:** `references/devvit-blocks-reference.md`

### Mobile Constraints

- ~70-80% Reddit traffic is mobile
- Casual browsing context (commute, breaks)
- Thumb-friendly design critical
- Fast loading essential

### Custom Post Integration

- Respects Reddit styling constraints
- Handles light/dark mode
- Works in Reddit app webview
- Maintains action points integration

## Component Completion Checklist

Before marking component "done":

- [ ] **Mobile-first:** Designed starting with 375px viewport
- [ ] **Touch-friendly:** All interactive elements ≥44px
- [ ] **Backend intact:** API calls and state unchanged
- [ ] **Loading states:** Skeleton loaders implemented
- [ ] **Empty states:** Friendly messages with CTAs
- [ ] **Error states:** Clear messages with recovery
- [ ] **Devvit Blocks:** Proper layout structure
- [ ] **Performance:** Quick render, no jank
- [ ] **Reddit integration:** Works in mobile app webview
- [ ] **Visual polish:** Attractive, engaging, professional

## Common Reconstruction Patterns

### Evidence Discovery Screen

❌ **Old (bad):** Desktop grid, small targets, no loading
✅ **New (good):**
- Mobile card layout (1 column mobile, 2 tablet)
- Large touchable cards (≥120px height)
- Skeleton loading states
- Card reveal animations
- Illustrated empty states

### Suspect Interrogation

❌ **Old (bad):** Text-heavy, boring, no personality
✅ **New (good):**
- Large suspect avatar (visual anchor)
- Chat-style conversational UI
- Response options as large buttons
- Progress indicator
- Engaging micro-copy

### Evidence Notebook

❌ **Old (bad):** List view, hard to scan, no hierarchy
✅ **New (good):**
- Visual grid with thumbnails
- Filter/sort in thumb zone
- Tap for quick preview
- Connection indicators
- Rarity visual markers

## Success Metrics

**Document before reconstruction:**
- User engagement rate
- Mobile bounce rate
- Completion rate (cases solved %)
- Average session duration

**Validate after reconstruction:**
- Increased engagement (more evidence collected)
- Decreased mobile bounce rate
- Improved completion rate
- Increased session duration
- Positive qualitative feedback

## Advanced: Design System Approach

For large reconstructions (20+ components):

1. **Build design system:**
   - Color palette
   - Typography scale
   - Spacing system
   - Common components

2. **Create primitives:**
   - Card component
   - Button variants
   - Form inputs
   - Modal/sheet components

3. **Use primitives:** Ensures consistency, speeds rebuild

**Note:** Only worthwhile for large projects

## References

- **Component auditing:** `references/component-audit-checklist.md`
- **Mobile design patterns:** `references/mobile-design-patterns.md`
- **Devvit Blocks API:** `references/devvit-blocks-reference.md`
- **Game engagement:** `references/game-engagement-patterns.md`

## Key Principle

This is **demolish and rebuild**, not salvage. Start fresh, build mobile-first, make it engaging, preserve backend. One component at a time. Test constantly. Mobile users deserve excellence.
