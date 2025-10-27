# Mobile Design Patterns for Reddit Games

## Thumb-First Design

**Thumb zone priority:**
- **Easy reach:** Bottom 1/3 (primary actions)
- **Medium reach:** Middle 1/3 (secondary actions)
- **Hard reach:** Top 1/3 (static content, nav)

Design for 375-414px width, one-handed use.

## Touch Target Sizing

**Minimums:**
- iOS: 44×44pt
- Android: 48×48dp
- **Safe:** 60×60px
- Spacing between targets: 8px minimum

## Mobile-First Viewports

**Breakpoints:**
```
Mobile (default): 375-767px
Tablet: 768-1023px
Desktop: 1024px+
```

**Always design mobile-first:**
1. Start 375px (iPhone SE)
2. Expand to 414px
3. Enhance for tablet/desktop

## Pattern: Card-Based Layout

Use for evidence, suspects, locations:

```
┌─────────────────┐
│  [Image/Icon]   │
│  Title Text     │
│  Subtitle       │
│  [Action CTA]   │
└─────────────────┘
```

- 1 column mobile, 2 tablet
- Card height: min 120px
- Padding: 16px internal, 12px between
- Corner radius: 8-12px
- Subtle shadow: 2-4px blur

## Pattern: Bottom Sheet Actions

For discovery, questioning, submission:

```
┌─────────────────┐
│  Main Content   │
├─────────────────┤
│  [────] handle  │
│  Action Title   │
│  [Button 1]     │
│  [Button 2]     │
└─────────────────┘
```

- Fixed to bottom (thumb zone)
- Swipe-to-dismiss
- Buttons: 56px height min
- Gap: 12px between buttons
- Safe area insets (iOS notch)

## Pattern: Progressive Disclosure

For evidence details, suspect info:

**Collapsed:**
```
┌─────────────────┐
│ Evidence #1  [↓]│
│ Quick summary   │
└─────────────────┘
```

**Expanded:**
```
┌─────────────────┐
│ Evidence #1  [↑]│
│ Summary         │
├─────────────────┤
│ Full details    │
│ [View Image]    │
└─────────────────┘
```

Reduces cognitive load, scannable.

## Pattern: Thumb-Friendly Navigation

```
┌─────────────────┐
│ [←] Title       │ ← Hard reach
├─────────────────┤
│   Content       │
├─────────────────┤
│ [🔍][📋][👤][⚙] │ ← Easy reach
└─────────────────┘
```

- Bottom tab: 56-64px height
- Icons: 24×24px + 20px padding
- Active indicator
- Max 5 tabs

## Pattern: Swipeable Content

For carousels, comparisons:

```
┌─────────────────┐
│ ◄  [Image]  ►   │
│  • ○ ○ ○        │
└─────────────────┘
```

- Horizontal swipe
- Pagination dots
- Snap to boundaries
- Momentum scrolling

## Component: Skeleton Loaders

Better than spinners:

```
┌─────────────────┐
│ ████████        │ ← Gray blocks
│ ████            │
│ ████████        │
└─────────────────┘
```

Shows content structure while loading.

## Component: Empty States

```
┌─────────────────┐
│   [Icon 48px]   │
│ "No evidence    │
│  found yet"     │
│ [Start Search]  │
└─────────────────┘
```

Centered, illustrative, clear CTA.

## Component: Error States

```
┌─────────────────┐
│   [⚠️ Icon]      │
│ "Couldn't load  │
│  evidence"      │
│ [Try Again]     │
└─────────────────┘
```

Non-technical, suggest recovery.

## Typography

**Sizes:**
- Body: 16px minimum
- Small: 14px (sparingly)
- Button: 16-18px
- Headings: 20-28px

**Line height:**
- Body: 1.5× font size
- Headings: 1.2× font size

**Line length:**
- Mobile: 35-45 characters
- Break into 3-4 line paragraphs

## Color & Contrast

**WCAG AA:**
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1
- Interactive: 3:1 vs background

**Dark mode:**
- Light background: #FFFFFF, text: #1C1C1E
- Dark background: #1C1C1E, text: #FFFFFF

## Performance

**Targets:**
- Initial render: <2s
- Time to interactive: <3s
- First input delay: <100ms
- CLS: <0.1

**Images:**
- Use WebP (photos), SVG (icons)
- Lazy load below fold
- Size for device pixel ratio (1×, 2×, 3×)

**Animations:**
- Use transform/opacity (GPU)
- Avoid width/height/top/left (reflow)
- <300ms duration
- Easing: ease-out (exits), ease-in (entrances)

## Touch Interactions

**Feedback:**
- Button press: Darken 10%
- Card tap: Scale 0.98
- Response: <100ms

**Gestures:**
- Tap: Primary action
- Long press: Context menu
- Swipe: Navigate, dismiss
- Pull-to-refresh: Optional
- Pinch-to-zoom: Optional

**Avoid:**
- Hover-dependent interactions
- Double-click patterns
- Small drag targets
- Precise pointer movements

## Reddit Mobile Context

**Webview considerations:**
- Limited viewport (excludes Reddit chrome)
- Respect safe areas
- Inherits theme from Reddit app

**Action Points:**
- Show clearly (top-right)
- Animate on change
- Disable when insufficient
- Use Reddit's AP color

## Validation Checklist

- [ ] Touch targets ≥44px
- [ ] Primary actions in bottom 1/3
- [ ] Text ≥16px, contrast ≥4.5:1
- [ ] Works on 375px viewport
- [ ] Skeleton loaders implemented
- [ ] Empty states have CTAs
- [ ] Error states have recovery
- [ ] No hover-dependent interactions
- [ ] Tested in Reddit mobile app
- [ ] Dark mode tested
- [ ] Images lazy load
- [ ] Animations 60fps
