# Devvit Design Patterns Library

**Project**: Armchair Sleuths
**Theme**: Noir Detective Aesthetic
**Platform**: Reddit Devvit Blocks

---

## Design Tokens

### Color System

```typescript
// Backgrounds (Layered Depth)
const COLORS = {
  // Base layers (darkest to lightest)
  bg_base: "#0a0a0a",        // Layer 0: Screen background
  bg_card: "#1a1a1a",        // Layer 1: Card background
  bg_elevated: "#1f1f1f",    // Layer 1.5: Important cards
  bg_nested: "#2a2a2a",      // Layer 2: Nested content
  bg_interactive: "#3a3a3a", // Layer 3: Hover/focus states

  // Accent colors
  gold: "#d4af37",           // Primary brand
  gold_dark: "#c9b037",      // Hover states
  gold_muted: "#b8860b",     // Secondary accents

  // Semantic colors
  danger: "#8b0000",         // Errors, victim, urgent
  danger_light: "#a00000",   // Danger borders
  info: "#4a9eff",           // Locations, neutral info
  warning: "#f5a623",        // Warnings, cautions
  success: "#2d7a4f",        // Success states

  // Text hierarchy
  text_primary: "#e0e0e0",   // Headlines, important text
  text_body: "#cccccc",      // Body text, descriptions
  text_secondary: "#a0a0a0", // Supporting text
  text_muted: "#808080",     // Disabled, de-emphasized
  text_light: "#ffcccc",     // Light text on dark backgrounds
};
```

### Typography Scale

```typescript
// Devvit Blocks text sizes
const TYPOGRAPHY = {
  display: {
    size: "xxlarge",
    weight: "bold",
    color: COLORS.gold,
    usage: "Hero headlines, main titles",
  },
  h1: {
    size: "xlarge",
    weight: "bold",
    color: COLORS.gold_dark,
    usage: "Section headers",
  },
  h2: {
    size: "large",
    weight: "bold",
    color: COLORS.gold,
    usage: "Card titles, subsection headers",
  },
  h3: {
    size: "medium",
    weight: "bold",
    color: COLORS.text_primary,
    usage: "Item names, data labels",
  },
  body: {
    size: "medium",
    weight: "regular",
    color: COLORS.text_body,
    usage: "Descriptions, paragraphs",
  },
  small: {
    size: "small",
    weight: "regular",
    color: COLORS.text_secondary,
    usage: "Metadata, supporting info",
  },
  caption: {
    size: "small",
    weight: "regular",
    color: COLORS.text_muted,
    usage: "Captions, footnotes, hints",
  },
};
```

### Spacing Scale

```typescript
// Devvit Blocks spacing values
const SPACING = {
  none: 0,      // 0px - No gap
  xsmall: 4,    // ~4px - Tight spacing
  small: 8,     // ~8px - Small gaps
  medium: 16,   // ~16px - Default spacing
  large: 24,    // ~24px - Section separation
  xlarge: 32,   // ~32px - Major sections
};

// Touch targets (WCAG AAA)
const TOUCH_TARGETS = {
  min_height: 56,  // Minimum touch target height
  min_width: 56,   // Minimum touch target width
};
```

---

## Component Patterns

### 1. Card Patterns

#### Standard Card
```typescript
<vstack
  backgroundColor="#1a1a1a"
  padding="medium"
  cornerRadius="medium"
  border="thin"
  borderColor="#2a2a2a"
  gap="medium"
>
  {/* Card content */}
</vstack>
```

**Use for**: General information cards, list items, content sections

#### Elevated Card (Important)
```typescript
<vstack
  backgroundColor="#1f1f1f"
  padding="medium"
  cornerRadius="medium"
  border="thick"
  borderColor="#c9b037"
  gap="medium"
>
  {/* Important content */}
</vstack>
```

**Use for**: Mission cards, important instructions, highlighted content

#### Two-Layer Card (Depth)
```typescript
<vstack
  backgroundColor="#1a1a1a"
  padding="medium"
  cornerRadius="medium"
  border="thin"
  borderColor="#2a2a2a"
  gap="medium"
>
  {/* Header */}
  <text size="large" weight="bold" color="#d4af37">
    Card Title
  </text>

  {/* Nested content layer */}
  <vstack
    backgroundColor="#2a2a2a"
    padding="medium"
    cornerRadius="small"
    gap="small"
  >
    <text size="medium" color="#cccccc">
      Content text
    </text>
  </vstack>
</vstack>
```

**Use for**: Information cards with clear header/content separation

#### Alert Card (Urgent)
```typescript
<vstack
  backgroundColor="#8b0000"
  padding="medium"
  cornerRadius="small"
  border="thin"
  borderColor="#a00000"
  gap="small"
>
  <hstack alignment="center middle" gap="small">
    <text size="xlarge" color="#ffffff">🚨</text>
    <text size="large" weight="bold" color="#ffffff">
      Alert Message
    </text>
  </hstack>
</vstack>
```

**Use for**: Urgent notifications, errors, critical information

---

### 2. Badge Patterns

#### Icon Badge
```typescript
<vstack
  backgroundColor="#c9b037"
  padding="small"
  cornerRadius="small"
  minWidth={40}
  minHeight={40}
  alignment="center middle"
>
  <text size="large" color="#ffffff">🎯</text>
</vstack>
```

**Use for**: Category icons, visual markers

**Variants**:
```typescript
// Danger badge (red)
backgroundColor="#8b0000"

// Info badge (blue)
backgroundColor="#4a9eff"

// Warning badge (amber)
backgroundColor="#f5a623"

// Muted badge (gray)
backgroundColor="#b8860b"
```

#### Status Badge
```typescript
<vstack
  backgroundColor="#808080"
  padding="xsmall"
  cornerRadius="small"
  minWidth={60}
  alignment="center middle"
>
  <text size="small" color="#0a0a0a">Status</text>
</vstack>
```

**Use for**: Status indicators, state labels

**Variants**:
```typescript
// Active (gold)
backgroundColor="#c9b037"
color="#0a0a0a"

// Success (green)
backgroundColor="#2d7a4f"
color="#ffffff"

// Warning (amber)
backgroundColor="#f5a623"
color="#0a0a0a"

// Inactive (gray)
backgroundColor="#808080"
color="#0a0a0a"
```

#### Count Badge
```typescript
<vstack
  backgroundColor="#c9b037"
  padding="xsmall"
  cornerRadius="full"
  minWidth={32}
  minHeight={32}
  alignment="center middle"
>
  <text size="small" weight="bold" color="#0a0a0a">
    5
  </text>
</vstack>
```

**Use for**: Counters, numerical indicators

---

### 3. List Item Patterns

#### Simple List Item
```typescript
<hstack
  backgroundColor="#2a2a2a"
  padding="medium"
  cornerRadius="small"
  gap="medium"
  alignment="center middle"
>
  <vstack grow gap="none">
    <text size="medium" weight="bold" color="#e0e0e0">
      Item Title
    </text>
    <text size="small" color="#a0a0a0">
      Item subtitle
    </text>
  </vstack>
</hstack>
```

**Use for**: Simple lists, basic item display

#### List Item with Avatar
```typescript
<hstack
  backgroundColor="#2a2a2a"
  padding="medium"
  cornerRadius="small"
  gap="medium"
  alignment="center middle"
>
  {/* Avatar */}
  <vstack
    backgroundColor="#3a3a3a"
    minWidth={48}
    minHeight={48}
    cornerRadius="small"
    alignment="center middle"
  >
    <text size="large" color="#808080">👤</text>
  </vstack>

  {/* Content */}
  <vstack grow gap="none">
    <text size="medium" weight="bold" color="#e0e0e0">
      Item Name
    </text>
    <text size="small" color="#a0a0a0">
      Item description
    </text>
  </vstack>

  {/* Status badge (optional) */}
  <vstack
    backgroundColor="#808080"
    padding="xsmall"
    cornerRadius="small"
    minWidth={60}
    alignment="center middle"
  >
    <text size="small" color="#0a0a0a">Status</text>
  </vstack>
</hstack>
```

**Use for**: User lists, character lists, items with identity

#### List Item with Action
```typescript
<hstack
  backgroundColor="#2a2a2a"
  padding="medium"
  cornerRadius="small"
  gap="medium"
  alignment="center middle"
>
  <vstack grow gap="none">
    <text size="medium" weight="bold" color="#e0e0e0">
      Item Title
    </text>
    <text size="small" color="#a0a0a0">
      Item subtitle
    </text>
  </vstack>

  <button appearance="secondary" size="small" onPress={handleAction}>
    Action
  </button>
</hstack>
```

**Use for**: Interactive lists, actionable items

---

### 4. Header Patterns

#### Card Header with Icon Badge
```typescript
<hstack alignment="center middle" gap="small">
  <vstack
    backgroundColor="#c9b037"
    padding="small"
    cornerRadius="small"
    minWidth={40}
    alignment="center middle"
  >
    <text size="large" color="#ffffff">🎯</text>
  </vstack>
  <text size="large" weight="bold" color="#d4af37">
    Section Title
  </text>
</hstack>
```

**Use for**: Card section headers, clear visual categorization

#### Header with Count Badge
```typescript
<hstack alignment="center middle" gap="small">
  <text size="large" color="#d4af37">🔍</text>
  <text size="large" weight="bold" color="#d4af37">
    Section Title
  </text>
  <spacer grow />
  <vstack
    backgroundColor="#c9b037"
    padding="xsmall"
    cornerRadius="full"
    minWidth={32}
    alignment="center middle"
  >
    <text size="small" weight="bold" color="#0a0a0a">
      3
    </text>
  </vstack>
</hstack>
```

**Use for**: Lists with counts, collections

#### Simple Header
```typescript
<vstack gap="none">
  <text size="large" weight="bold" color="#d4af37">
    Main Title
  </text>
  <text size="small" color="#a0a0a0">
    Subtitle or context
  </text>
</vstack>
```

**Use for**: Page headers, simple section titles

---

### 5. State Patterns

#### Loading State
```typescript
<vstack alignment="center middle" gap="medium">
  {/* Visual anchor */}
  <vstack
    backgroundColor="#1a1a1a"
    padding="large"
    cornerRadius="full"
    border="thick"
    borderColor="#c9b037"
  >
    <text size="xxlarge" color="#d4af37">🕵️</text>
  </vstack>

  <spacer size="medium" />

  {/* Message */}
  <vstack alignment="center middle" gap="small">
    <text size="xxlarge" weight="bold" color="#d4af37" alignment="center">
      Loading...
    </text>
    <text size="medium" color="#a0a0a0" alignment="center">
      Please wait
    </text>
  </vstack>

  {/* Flavor text (optional) */}
  <vstack
    backgroundColor="#1a1a1a"
    padding="medium"
    cornerRadius="medium"
    maxWidth={320}
  >
    <text size="small" color="#808080" alignment="center">
      "Patience reveals truth..."
    </text>
  </vstack>
</vstack>
```

**Use for**: Loading screens, async operations

#### Error State
```typescript
<vstack alignment="center middle" gap="medium">
  {/* Error icon */}
  <vstack
    backgroundColor="#1a1a1a"
    padding="large"
    cornerRadius="full"
    border="thick"
    borderColor="#8b0000"
  >
    <text size="xxlarge" color="#8b0000">⚠️</text>
  </vstack>

  <spacer size="medium" />

  {/* Error message */}
  <vstack alignment="center middle" gap="small">
    <text size="xxlarge" weight="bold" color="#8b0000" alignment="center">
      Error Title
    </text>
    <text size="medium" color="#a0a0a0" alignment="center">
      Error description
    </text>
  </vstack>

  {/* Error details */}
  <vstack
    backgroundColor="#1a1a1a"
    padding="medium"
    cornerRadius="medium"
    maxWidth={320}
    gap="small"
  >
    <text size="small" color="#8b0000" weight="bold">
      Error Details:
    </text>
    <text size="small" color="#cccccc">
      {errorMessage}
    </text>
  </vstack>

  <spacer size="medium" />

  {/* Recovery action */}
  <button appearance="primary" size="large" onPress={handleRetry}>
    Retry
  </button>

  <text size="small" color="#808080" alignment="center">
    Click to try again
  </text>
</vstack>
```

**Use for**: Error screens, failed operations

#### Empty State
```typescript
<vstack alignment="center middle" gap="medium" padding="large">
  <text size="xxlarge" color="#808080">📭</text>
  <vstack alignment="center middle" gap="small">
    <text size="large" weight="bold" color="#a0a0a0" alignment="center">
      No Items Found
    </text>
    <text size="small" color="#808080" alignment="center">
      There's nothing here yet
    </text>
  </vstack>
</vstack>
```

**Use for**: Empty lists, no results

---

### 6. Action Patterns

#### Primary CTA
```typescript
<vstack gap="small">
  <button
    appearance="primary"
    size="large"
    onPress={handleAction}
  >
    🔍 Primary Action
  </button>

  <text size="small" color="#808080" alignment="center">
    Helper text explaining action
  </text>
</vstack>
```

**Use for**: Main actions, primary user flows

#### Secondary Actions
```typescript
<hstack gap="small">
  <button appearance="secondary" size="medium" onPress={handleCancel}>
    Cancel
  </button>
  <button appearance="primary" size="medium" onPress={handleConfirm}>
    Confirm
  </button>
</hstack>
```

**Use for**: Confirmations, dual actions

#### Action List
```typescript
<vstack gap="small">
  <button appearance="secondary" size="large" onPress={handleOption1}>
    Option 1
  </button>
  <button appearance="secondary" size="large" onPress={handleOption2}>
    Option 2
  </button>
  <button appearance="secondary" size="large" onPress={handleOption3}>
    Option 3
  </button>
</vstack>
```

**Use for**: Multiple choices, menus

---

### 7. Information Display Patterns

#### Key-Value Pair
```typescript
<hstack gap="small" alignment="start middle">
  <text size="small" color="#808080">Label:</text>
  <text size="small" color="#a0a0a0">Value</text>
</hstack>
```

**Use for**: Metadata display, property lists

#### Checklist Item
```typescript
<hstack gap="small" alignment="start middle">
  <text size="medium" color="#c9b037">✓</text>
  <text size="small" color="#cccccc">
    Checklist item text
  </text>
</hstack>
```

**Use for**: Task lists, requirements, missions

#### Warning Message
```typescript
<vstack
  backgroundColor="#2a2a2a"
  padding="small"
  cornerRadius="small"
  border="thin"
  borderColor="#f5a623"
>
  <hstack gap="small" alignment="start middle">
    <text size="small" color="#f5a623">⚠️</text>
    <text size="small" color="#f5a623" weight="bold">
      Warning message text
    </text>
  </hstack>
</vstack>
```

**Use for**: Warnings, cautions, important notices

---

### 8. Image Patterns

#### Framed Image with Caption
```typescript
<vstack
  backgroundColor="#1a1a1a"
  cornerRadius="medium"
  border="thin"
  borderColor="#2a2a2a"
  overflow="hidden"
>
  <image
    url={imageUrl}
    imageHeight={240}
    imageWidth={400}
    description="Image description"
    resizeMode="cover"
  />
  <vstack padding="small" backgroundColor="#1f1f1f">
    <text size="small" color="#808080" alignment="center">
      Image caption
    </text>
  </vstack>
</vstack>
```

**Use for**: Crime scene photos, evidence images

#### Avatar Placeholder
```typescript
<vstack
  backgroundColor="#3a3a3a"
  minWidth={48}
  minHeight={48}
  cornerRadius="small"
  alignment="center middle"
>
  <text size="large" color="#808080">👤</text>
</vstack>
```

**Use for**: User avatars, character placeholders

---

## Layout Patterns

### Full-Screen Layout
```typescript
<vstack
  width="100%"
  height="100%"
  backgroundColor="#0a0a0a"
  padding="large"
  gap="medium"
>
  {/* Screen content */}
</vstack>
```

### Centered Content
```typescript
<vstack
  width="100%"
  height="100%"
  alignment="center middle"
  backgroundColor="#0a0a0a"
  padding="large"
  gap="large"
>
  {/* Centered content */}
</vstack>
```

### Scrollable Content Area
```typescript
<vstack
  width="100%"
  height="100%"
  backgroundColor="#0a0a0a"
  gap="none"
>
  {/* Fixed header */}
  <vstack padding="large" backgroundColor="#0a0a0a">
    <text size="xlarge" weight="bold" color="#d4af37">
      Header
    </text>
  </vstack>

  {/* Scrollable content */}
  <vstack padding="large" gap="medium">
    {/* Content items */}
  </vstack>
</vstack>
```

---

## Accessibility Guidelines

### Touch Targets
- Minimum height: 56px
- Minimum width: 56px
- Comfortable spacing: 8px+ between targets

### Color Contrast
- Normal text: 4.5:1 minimum (WCAG AA)
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1 minimum

### Text Sizing
- Never use smaller than "small" (14px equivalent)
- Body text should be "medium" (16px equivalent)
- Important text should be "large" or larger

### Semantic Colors
- Red (#8b0000): Danger, errors, critical
- Blue (#4a9eff): Information, neutral
- Amber (#f5a623): Warnings, cautions
- Green (#2d7a4f): Success, confirmation
- Gold (#d4af37): Primary brand, emphasis

---

## Usage Examples

### Detective Case Card
```typescript
<vstack
  backgroundColor="#1a1a1a"
  padding="medium"
  cornerRadius="medium"
  border="thin"
  borderColor="#2a2a2a"
  gap="medium"
>
  <hstack alignment="center middle" gap="small">
    <vstack
      backgroundColor="#8b0000"
      padding="small"
      cornerRadius="small"
      minWidth={40}
      alignment="center middle"
    >
      <text size="large" color="#ffffff">👤</text>
    </vstack>
    <text size="large" weight="bold" color="#d4af37">
      피해자 정보
    </text>
  </hstack>

  <vstack
    backgroundColor="#2a2a2a"
    padding="medium"
    cornerRadius="small"
    gap="small"
  >
    <text size="medium" weight="bold" color="#e0e0e0">
      John Doe
    </text>
    <text size="small" color="#cccccc">
      Wealthy businessman found dead in his study
    </text>
    <hstack gap="small" alignment="start middle">
      <text size="small" color="#808080">관계:</text>
      <text size="small" color="#a0a0a0">Victim</text>
    </hstack>
  </vstack>
</vstack>
```

### Suspect List Item
```typescript
<hstack
  backgroundColor="#2a2a2a"
  padding="medium"
  cornerRadius="small"
  gap="medium"
  alignment="center middle"
>
  <vstack
    backgroundColor="#3a3a3a"
    minWidth={48}
    minHeight={48}
    cornerRadius="small"
    alignment="center middle"
  >
    <text size="large" color="#808080">👤</text>
  </vstack>

  <vstack grow gap="none">
    <text size="medium" weight="bold" color="#e0e0e0">
      Jane Smith
    </text>
    <text size="small" color="#a0a0a0">
      Business Partner
    </text>
  </vstack>

  <vstack
    backgroundColor="#808080"
    padding="xsmall"
    cornerRadius="small"
    minWidth={60}
    alignment="center middle"
  >
    <text size="small" color="#0a0a0a">미심문</text>
  </vstack>
</hstack>
```

---

## Best Practices

1. **Consistent Layering**: Always use color progression for depth (#0a0a0a → #1a1a1a → #2a2a2a)
2. **Icon Badges**: Use for clear visual categorization
3. **Two-Layer Cards**: Separate headers from content for clarity
4. **Touch Targets**: Never go below 56px for interactive elements
5. **Helper Text**: Add context under primary actions to reduce anxiety
6. **Atmospheric Touches**: Add flavor text to establish mood
7. **Status Indicators**: Always show current state of interactive elements
8. **Borders**: Use subtle borders (#2a2a2a) for card definition
9. **Gold Accent**: Reserve for primary actions and emphasis
10. **Semantic Colors**: Use consistently (red=danger, blue=info, etc.)

---

**Last Updated**: 2025-10-24
**Version**: 1.0
**Project**: Armchair Sleuths
**Platform**: Reddit Devvit Blocks
