# Devvit Blocks Migration - Quick Start Guide

**Project:** Armchair Sleuths
**Current Phase:** P0 Complete ✅
**Next Phase:** P1 (Investigation UI)

---

## What We Built (P0)

### Core Infrastructure
- ✅ **Custom Post Type** - Game renders as Reddit post
- ✅ **Loading Screen** - Shows case generation status
- ✅ **Case Overview Screen** - Displays victim, weapon, location, suspects
- ✅ **Investigation Placeholder** - Ready for P1 implementation
- ✅ **State Management** - Using Devvit `useState` + Redis
- ✅ **Build System** - Vite configured for Devvit JSX

### Files Modified
```
C:\Users\hpcra\armchair-sleuths\src\main.tsx (NEW)
C:\Users\hpcra\armchair-sleuths\vite.main.config.ts (UPDATED)
C:\Users\hpcra\armchair-sleuths\DEVVIT_MIGRATION_PLAN.md (NEW)
C:\Users\hpcra\armchair-sleuths\DEVVIT_P0_IMPLEMENTATION_COMPLETE.md (NEW)
```

---

## How to Test P0

### 1. Build the Project
```bash
cd C:\Users\hpcra\armchair-sleuths
npm run build
```

### 2. Start Devvit Playtest
```bash
npm run dev:devvit
```

### 3. Test in Browser
1. Devvit will open a browser tab
2. You'll see the game post
3. Click to open the post
4. Interact with the game UI

### 4. Generate a Test Case
If no case exists, click "Generate New Case" button. This will:
1. Trigger the scheduler job
2. Generate a new case (30-60 seconds)
3. Auto-navigate to Case Overview

---

## Current Screen Flow

```
Loading Screen
├── Case Exists? → Case Overview Screen → Investigation Screen (P1)
└── No Case? → Show Error + Generate Button → Loading → Case Overview
```

---

## Next Steps: P1 Implementation

### Components to Build

1. **InvestigationScreen** (main wrapper)
   - File: `src/devvit/screens/InvestigationScreen.tsx`
   - Features: Tab navigation, action points, header

2. **LocationExplorerSection**
   - File: `src/devvit/components/LocationExplorerSection.tsx`
   - Features: Location cards, evidence discovery, search methods

3. **SuspectInterrogationSection**
   - File: `src/devvit/components/SuspectInterrogationSection.tsx`
   - Features: Suspect list, chat interface, Gemini AI integration

4. **EvidenceNotebookSection**
   - File: `src/devvit/components/EvidenceNotebookSection.tsx`
   - Features: Evidence list, detail modal, organization

### Backend Integration Needed

```typescript
// Evidence Discovery
await context.redis.get(`evidence:${caseId}:${evidenceId}`);
await context.redis.set(`playerState:${userId}:${caseId}`, JSON.stringify(state));

// Suspect Chat (Gemini API)
const response = await context.http.post({
  url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  headers: { 'Content-Type': 'application/json' },
  body: { /* ... */ },
});

// Action Points
await context.redis.incrBy(`actionPoints:${userId}:${caseId}`, -1);
```

---

## Design System Reference

### Colors
```typescript
const noir = {
  background: '#0a0a0a',
  card: '#1a1a1a',
  light: '#2a2a2a',
  gold: '#d4af37',
  brass: '#b8860b',
  blood: '#8b0000',
  clue: '#4a9eff',
};
```

### Typography
```typescript
const text = {
  heading: { size: 'xxlarge', weight: 'bold' },
  subheading: { size: 'xlarge', weight: 'bold' },
  body: { size: 'medium' },
  small: { size: 'small' },
};
```

### Spacing
```typescript
const spacing = {
  tight: 'small',    // 8px
  normal: 'medium',  // 16px
  loose: 'large',    // 24px
};
```

---

## Common Devvit Patterns

### State Management
```typescript
// Simple state
const [value, setValue] = context.useState('initial');

// Async initialization
context.useState(async () => {
  const data = await context.redis.get('key');
  setData(JSON.parse(data));
});
```

### Layouts
```typescript
// Vertical stack (column)
<vstack gap="medium" padding="large">
  <text>Item 1</text>
  <text>Item 2</text>
</vstack>

// Horizontal stack (row)
<hstack gap="small">
  <button>Left</button>
  <button>Right</button>
</hstack>
```

### Buttons
```typescript
// Primary button
<button appearance="primary" size="large" onPress={handleClick}>
  Click Me
</button>

// Secondary button
<button appearance="secondary" size="medium" onPress={handleClick}>
  Back
</button>
```

### Images
```typescript
<image
  url="https://example.com/image.png"
  imageHeight={200}
  imageWidth={400}
  description="Alt text"
  resizeMode="cover"
/>
```

---

## Troubleshooting

### Build Errors

**Problem:** `Expected ">" but found "width"`
**Solution:** Make sure `vite.main.config.ts` has JSX config:
```typescript
esbuild: {
  jsx: 'transform',
  jsxFactory: 'Devvit.createElement',
  jsxFragment: 'Devvit.Fragment',
}
```

### Runtime Errors

**Problem:** "Cannot read property 'useState' of undefined"
**Solution:** Ensure `context.useState` is used, not React's `useState`

**Problem:** "Redis key not found"
**Solution:** Check Redis schema and ensure case is generated first

### Missing Case Data

**Problem:** Loading screen shows "Case not found"
**Solution:**
1. Click "Generate New Case" button
2. Wait 30-60 seconds for generation
3. Check scheduler logs: `devvit logs`

---

## P1 Estimated Timeline

**Time to Complete:** 8-12 hours

### Breakdown
- Investigation Screen wrapper: 1-2 hours
- LocationExplorerSection: 2-3 hours
- SuspectInterrogationSection: 3-4 hours
- EvidenceNotebookSection: 2-3 hours
- Testing & debugging: 1-2 hours

### Priority Order
1. InvestigationScreen (foundation)
2. LocationExplorerSection (evidence discovery)
3. SuspectInterrogationSection (Gemini AI chat)
4. EvidenceNotebookSection (evidence management)

---

## Useful Commands

```bash
# Build everything
npm run build

# Build main Devvit entry point only
npm run build:main

# Start dev server (playtest)
npm run dev:devvit

# Upload to Reddit
devvit upload

# Check logs
devvit logs

# Install to subreddit
devvit install <subreddit-name>
```

---

## Resources

- **Devvit Docs:** https://developers.reddit.com/docs
- **Devvit Blocks API:** https://developers.reddit.com/docs/blocks
- **Migration Plan:** `C:\Users\hpcra\armchair-sleuths\DEVVIT_MIGRATION_PLAN.md`
- **P0 Complete Report:** `C:\Users\hpcra\armchair-sleuths\DEVVIT_P0_IMPLEMENTATION_COMPLETE.md`

---

## Success Metrics

### P0 Success Criteria ✅
- [x] Custom Post Type renders
- [x] Loading screen works
- [x] Case Overview displays
- [x] Navigation functional
- [x] Build succeeds
- [x] Mobile-first layout

### P1 Success Criteria (TODO)
- [ ] Investigation screen with tabs
- [ ] Location exploration works
- [ ] Suspect chat functional
- [ ] Evidence notebook displays
- [ ] Action points system working
- [ ] Redis integration complete

---

## Contact

If you encounter issues:
1. Check console logs
2. Review this guide
3. Check Devvit documentation
4. Review migration plan

**Next Review:** After P1 implementation
