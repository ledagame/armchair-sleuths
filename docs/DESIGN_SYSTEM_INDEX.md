# Armchair Sleuths Design System - Complete Index

## Overview

A comprehensive visual design system for a detective-themed murder mystery game on Reddit Devvit. Optimized for rapid development within 6-day sprint cycles, balancing visual appeal with implementation speed.

**Design Philosophy**: Beautiful within constraints. Every pixel serves the mystery. Every interaction advances the investigation.

---

## Documentation Structure

### 1. VISUAL_DESIGN_SYSTEM.md
**Purpose**: Complete design system specification
**Who needs it**: Designers, developers implementing from scratch
**Contents**:
- Full color palette with semantic meanings
- Complete typography scale with usage guidelines
- Spacing and layout system
- Component visual specifications (11 components)
- Screen-specific visual hierarchies (5 screens)
- Micro-interactions and animations
- Accessibility guidelines
- TikTok-worthy social media optimization

**When to use**: When you need detailed specs for any visual element

---

### 2. COMPONENT_EXAMPLES.md
**Purpose**: Ready-to-use React component code
**Who needs it**: Frontend developers
**Contents**:
- 15+ pre-built component examples with full code
- Complete screen implementations (5 screens)
- Form patterns and validation examples
- Animation usage examples
- Responsive design patterns
- Testing examples

**When to use**: When you're building a feature and need working code

---

### 3. DEVVIT_BLOCKS_DESIGN.md
**Purpose**: Adaptation for Devvit Blocks UI
**Who needs it**: Devvit developers working with Blocks
**Contents**:
- Devvit Blocks component implementations
- Color token mapping (Design System → Devvit)
- Layout patterns for Blocks
- When to use Blocks vs WebView decision guide
- Platform-specific best practices

**When to use**: When implementing native Devvit Blocks UI (vs web views)

---

### 4. DESIGN_QUICK_START.md
**Purpose**: Rapid reference guide
**Who needs it**: Developers in active sprint
**Contents**:
- Copy-paste code snippets
- Color, typography, spacing cheat sheets
- Common patterns (buttons, forms, layouts)
- Quick troubleshooting
- 5-minute implementation checklist

**When to use**: When you need something fast and don't want to read docs

---

### 5. design-tokens.css (Code File)
**Purpose**: Tailwind CSS 4.x configuration
**Who needs it**: All frontend developers
**Contents**:
- Custom color definitions
- Animation keyframes
- Utility classes
- Custom component patterns
- Accessibility utilities
- Dark mode support (future)

**When to use**: Import once in your main CSS file, then forget about it

---

### 6. components/ui/index.tsx (Code File)
**Purpose**: Reusable React component library
**Who needs it**: All React developers
**Contents**:
- 15 production-ready components
- Button variants (primary, secondary, ghost, danger)
- Card components (standard, suspect, compact)
- Chat components (bubbles, input)
- Form elements (input, textarea, radio)
- Feedback components (alerts, loading, skeleton)
- Display components (badges, score items, progress)

**When to use**: Import and use immediately in any screen

---

## Quick Navigation Guide

### "I need to..."

**...build a suspect card**
1. Go to: `COMPONENT_EXAMPLES.md` → "Suspect Cards"
2. Copy-paste the code
3. Customize props

**...understand the color system**
1. Go to: `DESIGN_QUICK_START.md` → "Color Cheat Sheet"
2. For detailed usage: `VISUAL_DESIGN_SYSTEM.md` → "Color System"

**...implement a chat interface**
1. Go to: `COMPONENT_EXAMPLES.md` → "Chat Interface"
2. Copy the complete screen example
3. Connect to your data

**...know button sizes and variants**
1. Go to: `DESIGN_QUICK_START.md` → "Common Button Patterns"
2. For component API: `components/ui/index.tsx` → `Button` interface

**...build for Devvit Blocks**
1. Go to: `DEVVIT_BLOCKS_DESIGN.md`
2. Find the component you need
3. Use Devvit-specific implementation

**...set up the design system**
1. Import `design-tokens.css` in main CSS file
2. Import components from `components/ui`
3. Start building with examples from `COMPONENT_EXAMPLES.md`

**...understand typography hierarchy**
1. Go to: `DESIGN_QUICK_START.md` → "Typography Cheat Sheet"
2. For detailed scale: `VISUAL_DESIGN_SYSTEM.md` → "Typography System"

**...make it responsive**
1. Go to: `COMPONENT_EXAMPLES.md` → "Responsive Design Tips"
2. All components are mobile-first by default

**...add animations**
1. Go to: `DESIGN_QUICK_START.md` → "Animation Classes"
2. For custom animations: `design-tokens.css` → "Custom Animations"

**...ensure accessibility**
1. Go to: `VISUAL_DESIGN_SYSTEM.md` → "Accessibility Guidelines"
2. Quick check: `DESIGN_QUICK_START.md` → "Accessibility Quick Checklist"

---

## Implementation Flow

### Day 1: Setup
1. Import `design-tokens.css` in main CSS
2. Copy `components/ui/index.tsx` to your project
3. Copy `utils/cn.ts` for class merging
4. Test a button to ensure setup works

### Day 2-3: Core Screens
1. Use examples from `COMPONENT_EXAMPLES.md`
2. Build screens: Case Overview → Suspect Panel → Chat
3. Connect to data APIs

### Day 4-5: Forms & Results
1. Implement submission form
2. Build results screen with score breakdown
3. Add loading states

### Day 6: Polish
1. Add animations from `design-tokens.css`
2. Test responsive design
3. Accessibility pass
4. Performance optimization

---

## Component Quick Reference

### Buttons
```tsx
import { Button } from '@/components/ui';

<Button variant="primary">Submit</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Skip</Button>
```

### Cards
```tsx
import { Card, SuspectCard } from '@/components/ui';

<Card hover selected={isSelected}>
  Content
</Card>

<SuspectCard
  name="Margaret"
  archetype="Socialite"
  onInterrogate={handleChat}
/>
```

### Chat
```tsx
import { ChatBubble, ChatInput } from '@/components/ui';

<ChatBubble
  message="Message text"
  isUser={true}
  timestamp="Just now"
/>

<ChatInput
  value={input}
  onChange={setInput}
  onSubmit={handleSend}
/>
```

### Feedback
```tsx
import { Alert, LoadingSpinner, SkeletonCard } from '@/components/ui';

<Alert type="success" message="Success!" />
<LoadingSpinner size="md" label="Loading..." />
<SkeletonCard />
```

### Forms
```tsx
import { InputField, TextAreaField, RadioGroup } from '@/components/ui';

<InputField
  label="Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

<RadioGroup
  name="suspect"
  options={suspects}
  value={selected}
  onChange={setSelected}
/>
```

---

## Design Tokens Quick Reference

### Colors
```css
Primary Actions:    bg-red-600
Secondary Actions:  bg-blue-900
Accents:           bg-amber-500
Success:           bg-green-600
Error:             bg-red-600
Backgrounds:       bg-gray-50, bg-white
Text:              text-gray-900, text-gray-600
Borders:           border-gray-200
```

### Typography
```css
Display:    text-4xl font-bold
Title:      text-3xl font-bold
Header:     text-2xl font-semibold
Subheader:  text-xl font-semibold
Body:       text-base
Small:      text-sm
Caption:    text-xs
```

### Spacing
```css
Tight:      gap-2, p-2   (8px)
Default:    gap-4, p-4   (16px)
Large:      gap-6, p-6   (24px)
XLarge:     gap-8, p-8   (32px)
```

---

## Browser Support

- Chrome/Edge: Full support
- Safari: Full support
- Firefox: Full support
- Mobile Safari: Full support
- Mobile Chrome: Full support

**Note**: Tailwind 4.x automatically handles vendor prefixes

---

## Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

**Optimization Tips**:
- Use `loading="lazy"` for images
- Implement skeleton loading states
- Memoize expensive components
- Use virtual scrolling for long lists

---

## Accessibility Standards

- WCAG 2.1 Level AA compliance
- Color contrast ratio: 4.5:1 (normal text), 3:1 (large text)
- Keyboard navigation support
- Screen reader compatible
- Focus indicators on all interactive elements
- Semantic HTML structure

---

## File Locations

```
📁 armchair-sleuths/
├── 📁 docs/
│   ├── 📄 VISUAL_DESIGN_SYSTEM.md         ← Complete specifications
│   ├── 📄 COMPONENT_EXAMPLES.md           ← Code examples
│   ├── 📄 DEVVIT_BLOCKS_DESIGN.md         ← Devvit Blocks guide
│   ├── 📄 DESIGN_QUICK_START.md           ← Quick reference
│   └── 📄 DESIGN_SYSTEM_INDEX.md          ← This file
├── 📁 src/client/
│   ├── 📁 components/
│   │   └── 📁 ui/
│   │       └── 📄 index.tsx               ← Component library
│   ├── 📁 styles/
│   │   └── 📄 design-tokens.css           ← Tailwind config
│   └── 📁 utils/
│       └── 📄 cn.ts                       ← Class merger utility
```

---

## Version History

**v1.0** (Current)
- Initial design system
- 15 core components
- 5 complete screen examples
- Devvit Blocks adaptation
- Tailwind 4.x configuration
- Full documentation suite

**Planned v1.1**
- Dark mode support
- Additional animation variants
- More form components (checkbox, select)
- Accessibility testing results
- Performance metrics baseline

---

## Contributing Guidelines

### Adding New Components
1. Design it in `VISUAL_DESIGN_SYSTEM.md`
2. Implement in `components/ui/index.tsx`
3. Add usage example to `COMPONENT_EXAMPLES.md`
4. Update this index

### Modifying Colors/Typography
1. Update `design-tokens.css`
2. Update `VISUAL_DESIGN_SYSTEM.md`
3. Update `DESIGN_QUICK_START.md` cheat sheets
4. Test all existing components for regressions

### Adding Animations
1. Add keyframes to `design-tokens.css`
2. Document in `VISUAL_DESIGN_SYSTEM.md`
3. Add to quick reference in `DESIGN_QUICK_START.md`

---

## Support & Resources

**Design Questions**: Check `VISUAL_DESIGN_SYSTEM.md` first
**Code Questions**: Check `COMPONENT_EXAMPLES.md` first
**Quick Answers**: Check `DESIGN_QUICK_START.md`

**External Resources**:
- Tailwind CSS Docs: https://tailwindcss.com/docs
- React Docs: https://react.dev
- Devvit Docs: https://developers.reddit.com/docs
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/

---

## Testing Checklist

### Visual Testing
- [ ] All components render correctly
- [ ] Colors match specifications
- [ ] Typography scales properly
- [ ] Spacing is consistent
- [ ] Animations work smoothly

### Responsive Testing
- [ ] Mobile (320px-640px)
- [ ] Tablet (640px-1024px)
- [ ] Desktop (1024px+)

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast passes WCAG AA
- [ ] Focus states visible
- [ ] Touch targets ≥ 44x44px

### Performance Testing
- [ ] Lighthouse score ≥ 90
- [ ] First Contentful Paint < 1.5s
- [ ] No layout shifts
- [ ] Images lazy load

### Cross-Browser Testing
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## Maintenance Schedule

**Weekly**: Review new component requests
**Monthly**: Performance audit
**Quarterly**: Accessibility audit
**Annually**: Full design system review

---

**Last Updated**: 2025-10-15
**Version**: 1.0
**Status**: Production Ready

---

## Quick Start Command

```bash
# Copy design system files
cp docs/design-tokens.css src/client/styles/
cp docs/components-ui.tsx src/client/components/ui/index.tsx
cp docs/cn.ts src/client/utils/

# Import in your main CSS
echo '@import "./styles/design-tokens.css";' >> src/client/main.css

# Start using components
# See COMPONENT_EXAMPLES.md for usage
```

---

**Remember**: This design system is a living document. As you build, you'll discover patterns that work and ones that don't. Update the docs to reflect reality, and keep the examples practical and production-ready.

**Design is never finished, it's only shipped.**
