# Design System Quick Start Guide

## 30-Second Overview

This is a **detective-themed murder mystery game** design system optimized for **rapid development** in a 6-day sprint cycle.

**Visual Identity**: Sophisticated detective noir meets modern, approachable UI
**Platform**: Reddit Devvit (Blocks UI + React WebView hybrid)
**Framework**: React + Tailwind CSS 4.x

---

## Quick Copy-Paste Snippets

### Import Components
```tsx
import {
  Button,
  Card,
  SuspectCard,
  ChatBubble,
  ChatInput,
  Alert,
  LoadingSpinner,
} from '@/components/ui';
```

### Primary Button
```tsx
<Button variant="primary" onClick={handleClick}>
  Submit Guess
</Button>
```

### Suspect Card
```tsx
<SuspectCard
  id="1"
  name="Margaret Blackwood"
  archetype="The Socialite"
  background="A wealthy widow..."
  imageUrl="/images/margaret.jpg"
  onInterrogate={() => startChat('1')}
/>
```

### Chat Message
```tsx
<ChatBubble
  message="Where were you at 9 PM?"
  timestamp="Just now"
  isUser={true}
/>
```

### Success Alert
```tsx
<Alert
  type="success"
  title="Success!"
  message="Your answer has been submitted."
/>
```

---

## Color Cheat Sheet

```tsx
// Backgrounds
bg-gray-50      // Page background
bg-white        // Cards
bg-gray-100     // Alternate sections

// Text
text-gray-900   // Primary
text-gray-600   // Secondary
text-gray-400   // Tertiary

// CTAs
bg-red-600      // Primary action (Submit)
bg-blue-900     // Secondary action (Investigate)
bg-amber-500    // Accent (Clues, hints)

// States
text-green-600  // Success
text-red-600    // Error
text-amber-600  // Warning

// Borders
border-gray-200 // Default
border-red-600  // Selected/Active
```

---

## Typography Cheat Sheet

```tsx
// Display (Hero)
<h1 className="text-4xl font-bold">Murder at the Mansion</h1>

// Page Title
<h1 className="text-3xl font-bold">Prime Suspects</h1>

// Section Header
<h2 className="text-2xl font-semibold">Case Details</h2>

// Card Title
<h3 className="text-xl font-semibold">Margaret Blackwood</h3>

// Body Text
<p className="text-base">Case description...</p>

// Small Text
<p className="text-sm">Timestamp or metadata</p>

// Caption
<span className="text-xs">Hint text</span>

// Label
<span className="text-xs font-semibold uppercase tracking-wider">
  SUSPECT
</span>
```

---

## Spacing Cheat Sheet

```tsx
// Gaps (between items in flex/grid)
gap-2    // 8px  - Tight
gap-3    // 12px - Default small
gap-4    // 16px - Default
gap-6    // 24px - Large
gap-8    // 32px - Extra large

// Padding
p-3      // 12px - Small card
p-4      // 16px - Card
p-6      // 24px - Large card
p-8      // 32px - Hero section

// Margin
mt-2     // 8px  - Small gap
mt-4     // 16px - Default gap
mt-6     // 24px - Section gap
```

---

## Layout Patterns

### Page Container
```tsx
<div className="min-h-screen bg-gray-50">
  <div className="max-w-2xl mx-auto px-4 py-6">
    {/* Content */}
  </div>
</div>
```

### Card
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
  {/* Card content */}
</div>
```

### Grid (Suspects)
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

### Flex Stack
```tsx
<div className="flex flex-col gap-4">
  {/* Items */}
</div>
```

---

## Common Button Patterns

```tsx
// Primary CTA
<button className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold
                   hover:bg-red-700 transition-colors">
  Submit
</button>

// Secondary
<button className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium
                   border border-gray-300 hover:bg-gray-50">
  Cancel
</button>

// Ghost
<button className="px-4 py-2 text-blue-900 hover:bg-blue-50 rounded-lg">
  Skip
</button>

// Full Width
<button className="w-full px-6 py-3 bg-red-600 text-white rounded-lg">
  Submit Answer
</button>
```

---

## State Indicators

### Loading
```tsx
<div className="flex items-center justify-center py-8">
  <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-900
                  rounded-full animate-spin" />
</div>
```

### Skeleton
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-4">
  <div className="animate-pulse space-y-3">
    <div className="h-4 bg-gray-200 rounded w-3/4" />
    <div className="h-4 bg-gray-200 rounded" />
    <div className="h-4 bg-gray-200 rounded w-5/6" />
  </div>
</div>
```

### Empty State
```tsx
<div className="text-center py-12">
  <div className="text-6xl mb-4">🔍</div>
  <h3 className="text-xl font-semibold text-gray-900">
    No suspects found
  </h3>
  <p className="text-gray-600 mt-2">
    Check back later for updates
  </p>
</div>
```

---

## Form Elements

### Text Input
```tsx
<input
  type="text"
  placeholder="Type here..."
  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg
             focus:outline-none focus:ring-2 focus:ring-blue-900"
/>
```

### Text Area
```tsx
<textarea
  rows={4}
  placeholder="Explain your reasoning..."
  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg
             focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
/>
```

### Radio Button
```tsx
<label className="flex items-center gap-3 p-3 bg-white border border-gray-200
                  rounded-lg cursor-pointer hover:border-gray-300">
  <input
    type="radio"
    name="suspect"
    className="w-5 h-5 text-red-600"
  />
  <span className="text-sm font-semibold">Option</span>
</label>
```

---

## Responsive Breakpoints

```tsx
sm:   640px   // Tablet
md:   768px   // Tablet landscape
lg:   1024px  // Desktop
xl:   1280px  // Large desktop
2xl:  1536px  // Extra large

// Usage
<div className="text-base sm:text-lg lg:text-xl">
  Responsive text
</div>

<div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>
```

---

## Icon Placeholders

Until you have actual icons, use emojis:

```tsx
🔍 Investigation
👤 Suspect
💬 Chat
📝 Submit
🎯 Score
🏆 Leaderboard
⏱️ Time
📍 Location
🔪 Weapon
❓ Clue
✅ Correct
❌ Incorrect
⚠️ Warning
ℹ️ Info
```

---

## Accessibility Quick Checklist

```tsx
// Add focus states
focus:outline-none focus:ring-2 focus:ring-blue-900

// Add labels to inputs
<label htmlFor="input-id">Label</label>
<input id="input-id" />

// Use semantic HTML
<button> not <div onClick>
<h1>, <h2>, <h3> for headings

// Add alt text to images
<img src="..." alt="Description" />

// Minimum touch targets (mobile)
min-h-[44px] min-w-[44px]
```

---

## Animation Classes

```tsx
// Fade in
animate-fade-in

// Slide up
animate-slide-up

// Pulse (attention)
animate-pulse

// Spin (loading)
animate-spin

// Bounce
animate-bounce
```

---

## Common Mistakes to Avoid

1. **Don't use arbitrary values when Tailwind has it**
   - Bad: `w-[300px]`
   - Good: `max-w-sm` or `w-full`

2. **Don't forget hover states**
   - Bad: `bg-red-600`
   - Good: `bg-red-600 hover:bg-red-700`

3. **Don't use too many colors**
   - Stick to: gray, red, blue, amber, green

4. **Don't forget mobile-first**
   - Bad: `lg:text-base text-sm`
   - Good: `text-sm lg:text-base`

5. **Don't skip focus states**
   - Always add: `focus:outline-none focus:ring-2`

---

## Performance Tips

```tsx
// Lazy load images
<img loading="lazy" src="..." />

// Use React.memo for expensive components
export const SuspectCard = React.memo(({ ... }) => { ... });

// Debounce search inputs
const debouncedSearch = useDebounce(searchTerm, 300);

// Virtual scrolling for long lists
import { FixedSizeList } from 'react-window';
```

---

## File Structure

```
src/client/
├── components/
│   ├── ui/
│   │   └── index.tsx          # All reusable UI components
│   ├── case/
│   │   └── CaseOverview.tsx
│   ├── suspect/
│   │   └── SuspectPanel.tsx
│   └── chat/
│       └── ChatInterface.tsx
├── styles/
│   └── design-tokens.css      # Custom Tailwind config
└── utils/
    └── cn.ts                  # Class name merger
```

---

## Getting Help

1. **Components**: Check `C:\Users\hpcra\armchair-sleuths\docs\COMPONENT_EXAMPLES.md`
2. **Full Design System**: Check `C:\Users\hpcra\armchair-sleuths\docs\VISUAL_DESIGN_SYSTEM.md`
3. **Devvit Blocks**: Check `C:\Users\hpcra\armchair-sleuths\docs\DEVVIT_BLOCKS_DESIGN.md`

---

## 5-Minute Implementation Checklist

- [ ] Import design tokens CSS in your main file
- [ ] Import UI components you need
- [ ] Copy-paste a layout pattern from examples
- [ ] Replace placeholder content with your data
- [ ] Add hover states to interactive elements
- [ ] Test on mobile (Chrome DevTools)
- [ ] Check color contrast (use browser inspector)
- [ ] Add loading states

---

**Remember**: Beautiful, functional, fast. In that order. Don't overthink it—these components are production-ready. Just use them.

**When in doubt**: Copy an example from COMPONENT_EXAMPLES.md and modify it.
