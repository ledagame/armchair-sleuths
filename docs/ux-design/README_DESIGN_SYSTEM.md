# Investigation UI Design System - Documentation Index
**Armchair Sleuths - Noir Detective Visual Design System**

**Version**: 1.0
**Last Updated**: 2025-10-24
**Design Lead**: Visual Designer Agent
**Platform**: Devvit (Reddit Apps)

---

## Overview

This comprehensive design system provides all visual specifications, component designs, and implementation guidelines for the Armchair Sleuths Investigation UI. The system extends the established P0 noir detective aesthetic with mobile-first, accessibility-compliant components optimized for rapid Devvit development.

---

## Design Philosophy

### Core Principles

1. **Noir Detective Aesthetic**: Dark, mysterious atmosphere with gold accents
2. **Mobile-First Design**: Optimized for thumb-reach and touch interactions
3. **Accessibility Compliance**: WCAG 2.1 AA standards for all components
4. **Rapid Implementation**: Props-based styling for fast Devvit development
5. **Social Media Ready**: Shareable, screenshot-worthy UI moments

### Visual Mood

- **Dark & Mysterious**: Deep blacks create intrigue
- **Gold Discovery**: Accent colors reward investigation
- **Professional Polish**: Modern mobile gaming quality
- **Playful Touches**: Emoji and personality without compromising sophistication

---

## Documentation Structure

### 1. [INVESTIGATION_UI_DESIGN_SYSTEM.md](./INVESTIGATION_UI_DESIGN_SYSTEM.md)
**Comprehensive Visual Specifications**

**Contents:**
- Complete color palette extension (20+ colors)
- Typography scale with Devvit mapping
- Spacing system specifications
- Full component designs:
  - Tab Navigation (active/inactive states)
  - Evidence Cards (rarity badges)
  - Suspect Cards (interrogation states)
  - Action Points Display (3 design options)
  - Discovery Toasts (success/achievement)
  - Modal Overlays (full specifications)
- Accessibility validation (contrast ratios, touch targets)
- Complete Devvit implementation examples
- Design tokens export for developers

**Use When:**
- Starting new component implementation
- Need exact color/spacing values
- Require accessibility validation
- Building from scratch

**Estimated Read Time**: 30-40 minutes

---

### 2. [DESIGN_QUICK_REFERENCE.md](./DESIGN_QUICK_REFERENCE.md)
**Copy-Paste Implementation Guide**

**Contents:**
- Color swatches with hex values
- Ready-to-use component code snippets
- Common UI patterns
- Spacing presets
- Border and radius standards
- Alignment shortcuts
- Color decision trees
- Contrast validation table
- Implementation checklist

**Use When:**
- Need quick code snippet
- Building common patterns
- Rapid prototyping
- Color/spacing decisions

**Estimated Read Time**: 10-15 minutes

---

### 3. [COMPONENT_STATE_VARIATIONS.md](./COMPONENT_STATE_VARIATIONS.md)
**State Matrix & Interaction Design**

**Contents:**
- Complete state matrices for all components
- Visual state comparisons (ASCII diagrams)
- Tab states (active, inactive, hover, pressed, disabled)
- Evidence card states (default, hover, discovered, locked)
- Suspect card states (default, interrogated, locked)
- Action Points states (high, medium, low, critical)
- Button states (default, hover, pressed, disabled, loading)
- Toast/feedback states (success, warning, error, achievement)
- Modal animation specifications
- Progress bar variations
- State transition guidelines

**Use When:**
- Implementing interactive components
- Adding hover/press states
- Creating animations
- Ensuring state consistency

**Estimated Read Time**: 20-25 minutes

---

## Quick Start Guide

### For Developers: "I need to build a component NOW"

**5-Minute Setup:**

1. Open [DESIGN_QUICK_REFERENCE.md](./DESIGN_QUICK_REFERENCE.md)
2. Find your component type (Tab, Card, Button, etc.)
3. Copy the code snippet
4. Customize text/icons
5. Ship it!

**Example: Building an Evidence Card**

```tsx
// 1. Copy from Quick Reference
<vstack
  backgroundColor="#1a1a1a"
  border="thick"
  borderColor="#4a4a4a"
  cornerRadius="medium"
  padding="medium"
  gap="small"
  alignment="center"
  minHeight="160px"
>
  <text size="xlarge">🔍</text>
  <text size="medium" weight="bold" color="#c9b037" alignment="center">
    Your Evidence Name
  </text>
  <text size="small" color="#a0a0a0" alignment="center">
    Your description
  </text>

  {/* Rarity badge - copy from reference */}
  <hstack backgroundColor="#4a4a4a" padding="xsmall" cornerRadius="small">
    <text size="xsmall" weight="bold" color="#e0e0e0">
      COMMON
    </text>
  </hstack>
</vstack>

// 2. Done! Ship it.
```

---

### For Designers: "I need to understand the system"

**20-Minute Deep Dive:**

1. Read [INVESTIGATION_UI_DESIGN_SYSTEM.md](./INVESTIGATION_UI_DESIGN_SYSTEM.md) Sections 1-3
   - Color Palette Extension
   - Typography Scale
   - Spacing System

2. Review [COMPONENT_STATE_VARIATIONS.md](./COMPONENT_STATE_VARIATIONS.md) for your component type

3. Reference [DESIGN_QUICK_REFERENCE.md](./DESIGN_QUICK_REFERENCE.md) for quick decisions

---

### For Product Managers: "I need to validate designs"

**10-Minute Validation:**

1. Check [INVESTIGATION_UI_DESIGN_SYSTEM.md](./INVESTIGATION_UI_DESIGN_SYSTEM.md) Section 10
   - Accessibility Validation
   - Contrast ratios (all pass WCAG AA ✅)
   - Touch target sizes (all ≥44px ✅)

2. Review [COMPONENT_STATE_VARIATIONS.md](./COMPONENT_STATE_VARIATIONS.md) Implementation Checklist

3. Confirm all states are designed for edge cases

---

## Design System Highlights

### Color Palette

**Core Colors** (5):
- Deep Black `#0a0a0a` (Primary Background)
- Charcoal `#1a1a1a` (Cards, Modals)
- Gunmetal `#2a2a2a` (Inactive, Hover)
- Smoke `#3a3a3a` (Active States)
- Fog `#4a4a4a` (Borders, Dividers)

**Accent Colors** (3):
- Detective Gold `#c9b037` (Primary CTA)
- Detective Brass `#b5a642` (Secondary Accent)
- Detective Amber `#d4af37` (Highlights)

**Evidence Colors** (3):
- Blood `#8b0000` (Critical Evidence)
- Poison `#4b0082` (Rare Evidence)
- Clue `#1e90ff` (Discovered Evidence)

**Status Colors** (3):
- Success Green `#10b981`
- Warning Amber `#f59e0b`
- Error Red `#ef4444`

**Total**: 14 carefully selected colors, all with validated contrast ratios

---

### Typography Scale

**Devvit Sizes** (5):
- `xsmall`: 12px equivalent (Metadata, Captions)
- `small`: 14px equivalent (Secondary Text)
- `medium`: 16-20px equivalent (Body Text, Card Titles)
- `large`: 24-32px equivalent (Section Headers)
- `xlarge`: 36-40px equivalent (Page Titles, Large Icons)

**Weights** (2):
- `regular`: Standard body text
- `bold`: Headings, emphasis, CTAs

---

### Spacing System

**Devvit Values** (4):
- `xsmall`: 4px (Tight spacing, badges)
- `small`: 8px (Default gaps)
- `medium`: 16px (Card padding, sections)
- `large`: 24px (Modal padding, hero spacing)

---

### Component Inventory

**Built & Documented** (9 components):

1. **Tab Navigation**
   - Active/Inactive states
   - Hover/Press feedback
   - Underline indicator
   - 56px touch-friendly height

2. **Evidence Cards**
   - 3 rarity levels (Common, Rare, Critical)
   - Hover/Discovered states
   - Icon + Title + Description layout
   - 160px minimum height

3. **Suspect Cards**
   - Default/Interrogated states
   - Avatar + Name + Archetype
   - Chat button integration
   - 120px minimum height

4. **Action Points Display**
   - 3 design options (Badge, Bar, Icons)
   - 4 color states (High, Medium, Low, Critical)
   - Dynamic color based on percentage

5. **Success Toast**
   - Green celebration design
   - Icon + Message + AP gain
   - 5-second duration

6. **Discovery Toast**
   - Gold detective aesthetic
   - Icon + Title + Description
   - 5-second duration

7. **Achievement Toast**
   - Purple special design
   - Trophy icon + Title + Description
   - 6-second duration

8. **Modal Overlays**
   - Dimmed backdrop (85% opacity)
   - Gold border card
   - Close button (44px × 44px)
   - Content + CTA layout

9. **Buttons**
   - Primary (Gold), Secondary (Gray)
   - 5 states (Default, Hover, Pressed, Disabled, Loading)
   - 48px minimum height

---

## Accessibility Compliance

### WCAG 2.1 AA Standards

**Color Contrast** ✅
- All text meets 4.5:1 ratio (or 3:1 for large text)
- Validated combinations in Section 10.1

**Touch Targets** ✅
- All interactive elements ≥44px × 44px
- Primary CTAs ≥48px height
- Tab navigation 56px height

**Focus Indicators** ✅
- 2px gold outline on all interactive elements
- 2px offset for visibility
- Visible focus states for keyboard navigation

**Screen Reader Support** ✅
- ARIA labels on all components
- Semantic HTML structure
- Alt text for all images/icons

**Reduced Motion Support** 🔄
- Animation duration guidance provided
- Respect `prefers-reduced-motion` media query
- Fallback to instant state changes

---

## Implementation Best Practices

### Design Tokens

**Centralized Constants**:
```typescript
// Import from design system
import { NoirColors, Spacing, Typography } from '@/design-system';

// Use in components
<vstack
  backgroundColor={NoirColors.charcoal}
  padding={Spacing.medium}
  gap={Spacing.small}
>
  <text
    size={Typography.size.medium}
    weight={Typography.weight.bold}
    color={NoirColors.detectiveGold}
  >
    Evidence Name
  </text>
</vstack>
```

### Component Composition

**Build from Primitives**:
```tsx
// Reusable Badge Component
const Badge = ({ type, label }) => {
  const config = {
    common: { bg: '#4a4a4a', text: '#e0e0e0', border: '#707070' },
    rare: { bg: '#4b0082', text: '#ffffff', border: '#6a0dad' },
    critical: { bg: '#8b0000', text: '#ffffff', border: '#c92a2a' },
  };

  const { bg, text, border } = config[type];

  return (
    <hstack
      backgroundColor={bg}
      border="thin"
      borderColor={border}
      cornerRadius="small"
      padding="xsmall"
    >
      <text size="xsmall" weight="bold" color={text}>
        {label}
      </text>
    </hstack>
  );
};

// Use in Evidence Card
<Badge type="rare" label="⭐ RARE" />
```

### State Management

**Consistent State Handling**:
```tsx
// Use state for visual feedback
const [isHovered, setIsHovered] = useState(false);
const [isPressed, setIsPressed] = useState(false);

<vstack
  backgroundColor={
    isPressed ? '#b5a642' :      // Brass (pressed)
    isHovered ? '#d4af37' :      // Amber (hover)
    '#c9b037'                    // Gold (default)
  }
  onPress={() => setIsPressed(true)}
  onHoverStart={() => setIsHovered(true)}
  onHoverEnd={() => setIsHovered(false)}
>
  {/* Button content */}
</vstack>
```

---

## Workflow Integration

### Design → Development Pipeline

**Phase 1: Design Specification** (This Document)
- Visual designer defines all component states
- Color, typography, spacing specs documented
- Accessibility validation completed

**Phase 2: Component Development**
- Developer references Quick Reference for code snippets
- Implements using exact prop values
- Tests all states from State Variations doc

**Phase 3: Quality Assurance**
- QA validates against design specs
- Checks accessibility compliance
- Tests edge cases and state transitions

**Phase 4: Iteration**
- Feedback loop with design system updates
- Document any deviations or improvements
- Maintain single source of truth

---

## Version Control

### Design System Changelog

**v1.0** (2025-10-24)
- Initial Investigation UI design system
- 9 core components designed
- 14-color noir detective palette
- Complete accessibility validation
- Devvit implementation examples

**Upcoming** (v1.1):
- Animation specifications (timing, easing)
- Dark mode variations (future consideration)
- Additional rarity tiers (if needed)
- Micro-interaction polish

---

## FAQ

### "Can I use colors not in the palette?"

**Short answer**: No, stick to the palette.

**Why**: Consistency is critical for brand recognition. The 14 colors were carefully selected for contrast, mood, and accessibility. Adding colors creates visual chaos.

**Exception**: If you absolutely need a new color, propose it as a palette addition with:
- Contrast ratio validation
- Clear use case
- Design system documentation update

---

### "Can I change spacing values?"

**Short answer**: Use only xsmall, small, medium, large.

**Why**: Consistent spacing creates visual rhythm. Arbitrary values break the grid system.

**Exception**: Stacking multiple medium values (e.g., 2× medium = 32px) is acceptable for larger gaps.

---

### "Which Action Points design should I use?"

**Recommendation**: Start with **Option A: Numeric Badge**

**Why**:
- Most mobile-friendly (compact)
- Clear at a glance
- Easy to animate
- Matches existing UI complexity

**Alternatives**:
- Option B (Progress Bar): Use if AP is primary mechanic
- Option C (Icon Counter): Use if max AP ≤ 5

---

### "How do I handle very long text in cards?"

**Text Truncation**:
```tsx
// Use wrap for descriptions
<text size="small" color="#a0a0a0" wrap>
  Very long description that will wrap to multiple lines...
</text>

// For titles, consider maxLength
<text size="medium" weight="bold" color="#c9b037">
  {truncate(evidenceName, 30)}
</text>
```

---

### "What about dark mode?"

**Current Status**: Single theme (dark noir)

**Why**: The noir detective aesthetic IS the dark mode. Adding a light mode would break the atmospheric mystery.

**Future**: If user feedback strongly requests light mode, we'd create a "Daylight Detective" alternate theme while preserving noir as default.

---

### "Can I add animations not documented here?"

**Yes, with guidelines**:
- Duration: 150-300ms for UI feedback
- Easing: ease-out for entries, ease-in for exits
- Properties: Limit to 3-4 simultaneous changes
- Purpose: Must enhance understanding, not distract

**Document**: Add animation specs to your component docs and propose for inclusion in v1.1.

---

## Support & Resources

### Getting Help

**Design Questions**:
- Reference this documentation first
- Check Quick Reference for common patterns
- Review State Variations for interaction design

**Implementation Questions**:
- Use Devvit code examples as starting point
- Validate props against Devvit documentation
- Test in actual Devvit environment

**Accessibility Questions**:
- Validate contrast at https://webaim.org/resources/contrastchecker/
- Test touch targets on actual mobile devices
- Use screen reader for semantic validation

---

### Related Documentation

**Project Documentation**:
- `docs/ux-design/MOBILE_UX_IMPLEMENTATION_STATUS.md` - Implementation progress
- `docs/ux-design/frontend/` - Frontend architecture

**Devvit Platform**:
- Devvit Blocks API Reference
- Devvit Design Guidelines
- Reddit Mobile Best Practices

---

## Design System Principles Summary

### The Golden Rules

1. **Use the palette**: 14 colors, no exceptions
2. **Touch-friendly**: All targets ≥44px × 44px
3. **Contrast first**: WCAG AA compliance mandatory
4. **Props only**: No CSS, Devvit props exclusively
5. **State clarity**: Every interaction has visual feedback
6. **Consistency**: One pattern for similar interactions
7. **Performance**: Lightweight, fast-loading components
8. **Accessibility**: Screen reader support, keyboard navigation
9. **Mobile-first**: Thumb reach, portrait orientation
10. **Noir aesthetic**: Dark, mysterious, detective gold accents

---

## Acknowledgments

**Design Influences**:
- Classic noir detective films (visual mood)
- Modern mobile gaming UI (polish and feedback)
- Material Design (accessibility standards)
- iOS Human Interface Guidelines (touch targets)
- Reddit mobile app (platform conventions)

**Design System Inspiration**:
- Tailwind CSS (token-based design)
- Primer (GitHub design system)
- Carbon (IBM design system)
- Atlassian Design System

---

## License & Usage

**Internal Use**: This design system is for Armchair Sleuths project development.

**Attribution**: When sharing screenshots or demos, credit the visual design to the design system.

**Modifications**: Propose changes via design system update process, maintain documentation.

---

## Contact

**Design System Owner**: Visual Designer Agent
**Documentation**: `docs/ux-design/`
**Last Updated**: 2025-10-24
**Version**: 1.0

---

**End of Design System Documentation Index**

Start with the Quick Reference, deep dive with the main system doc, and perfect your states with the variations guide. Happy building! 🔍✨
