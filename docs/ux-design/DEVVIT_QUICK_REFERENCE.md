# Devvit Quick Reference Guide
**Armchair Sleuths - Mobile-First Patterns**

**Version**: 1.0
**Date**: 2025-10-24

---

## 🎨 Color Tokens (Copy-Paste Ready)

```typescript
// Backgrounds
const BG_DEEP_BLACK = '#0a0a0a';   // Page background
const BG_CHARCOAL = '#1a1a1a';     // Card background
const BG_GUNMETAL = '#2a2a2a';     // Elevated surface
const BG_SMOKE = '#3a3a3a';        // Hover state
const BG_FOG = '#4a4a4a';          // Border, divider

// Detective Accents
const GOLD = '#c9b037';            // Primary CTA
const BRASS = '#b5a642';           // Secondary accent
const AMBER = '#d4af37';           // Hover highlight

// Evidence
const BLOOD = '#8b0000';           // Victim, error
const POISON = '#4b0082';          // Mystery, suspect
const CLUE = '#1e90ff';            // Discovery, info

// Text
const TEXT_PRIMARY = '#e0e0e0';    // Primary content
const TEXT_SECONDARY = '#a0a0a0';  // Secondary content
const TEXT_MUTED = '#707070';      // Tertiary content
```

---

## 📏 Component Patterns

### Standard Card

```tsx
<vstack
  backgroundColor="#1a1a1a"
  padding="medium"
  gap="small"
  cornerRadius="medium"
  border="thin"
  borderColor="#4a4a4a"
>
  <text size="medium" weight="bold" color="#c9b037">
    Card Title
  </text>
  <text size="small" color="#a0a0a0">
    Card content goes here
  </text>
</vstack>
```

### Primary Button

```tsx
<button
  onPress={handleAction}
  appearance="primary"
  size="large"
  minHeight={56}
  width="100%"
>
  <text size="medium" weight="bold" color="#0a0a0a">
    🔍 Primary Action
  </text>
</button>
```

### Secondary Button

```tsx
<button
  onPress={handleAction}
  appearance="secondary"
  size="medium"
  minHeight={48}
>
  <text size="small" weight="bold" color="#c9b037">
    ← Back
  </text>
</button>
```

### Highlighted Card (Gold Border)

```tsx
<vstack
  backgroundColor="#1a1a1a"
  padding="large"
  gap="medium"
  cornerRadius="medium"
  border="thick"
  borderColor="#c9b037"
>
  <text size="large" weight="bold" color="#c9b037">
    Important Info
  </text>
</vstack>
```

### Badge/Tag

```tsx
<vstack
  backgroundColor="#b5a642"
  padding="xsmall"
  cornerRadius="small"
>
  <text size="xsmall" weight="bold" color="#0a0a0a">
    RARE
  </text>
</vstack>
```

### Progress Bar

```tsx
<vstack width="100%" height={8} backgroundColor="#2a2a2a" cornerRadius="full">
  <vstack
    width={`${progress}%`}
    height={8}
    backgroundColor="#c9b037"
    cornerRadius="full"
  />
</vstack>
```

### Stat Display

```tsx
<vstack
  backgroundColor="#2a2a2a"
  padding="small"
  gap="xsmall"
  cornerRadius="small"
  alignment="center middle"
>
  <text size="xsmall" color="#707070">
    Action Points
  </text>
  <text size="large" weight="bold" color="#c9b037">
    8 / 12
  </text>
</vstack>
```

### Info Box

```tsx
<vstack
  backgroundColor="#2a2a2a"
  padding="small"
  gap="xsmall"
  cornerRadius="small"
>
  <hstack gap="small" alignment="start middle">
    <text size="small">⚠️</text>
    <text size="xsmall" color="#d4af37" weight="bold">
      Warning message here
    </text>
  </hstack>
</vstack>
```

### List Item

```tsx
<hstack
  backgroundColor="#1a1a1a"
  padding="medium"
  gap="small"
  cornerRadius="small"
  alignment="space-between middle"
  onPress={handleTap}
  pressedBackgroundColor="#3a3a3a"
>
  <hstack gap="small" alignment="start middle">
    <text size="large">🔍</text>
    <vstack gap="xsmall">
      <text size="medium" weight="bold" color="#e0e0e0">
        Item Title
      </text>
      <text size="xsmall" color="#707070">
        Item metadata
      </text>
    </vstack>
  </hstack>

  <text size="small" color="#c9b037">→</text>
</hstack>
```

---

## 📐 Layout Patterns

### Full-Screen Container

```tsx
<vstack
  height="100%"
  backgroundColor="#0a0a0a"
  padding="medium"
  gap="medium"
>
  {/* Screen content */}
</vstack>
```

### Sticky Header + Scrollable Content + Fixed Footer

```tsx
<vstack height="100%" backgroundColor="#0a0a0a">
  {/* Sticky Header */}
  <vstack
    backgroundColor="#1a1a1a"
    padding="medium"
    border="bottom"
    borderColor="#4a4a4a"
  >
    <text size="large" weight="bold" color="#c9b037">
      Screen Title
    </text>
  </vstack>

  {/* Scrollable Content */}
  <vstack grow padding="medium" gap="medium">
    {/* Cards, lists, etc. */}
  </vstack>

  {/* Fixed Footer */}
  <vstack
    backgroundColor="#1a1a1a"
    padding="medium"
    border="top"
    borderColor="#4a4a4a"
  >
    <button appearance="primary" minHeight={56} width="100%">
      <text size="medium" weight="bold">Continue</text>
    </button>
  </vstack>
</vstack>
```

### Tab Navigation

```tsx
<vstack height="100%" backgroundColor="#0a0a0a">
  {/* Header with Tabs */}
  <vstack
    backgroundColor="#1a1a1a"
    padding="medium"
    gap="small"
    border="bottom"
    borderColor="#4a4a4a"
  >
    <text size="large" weight="bold" color="#c9b037">
      Investigation
    </text>

    {/* Tabs */}
    <hstack gap="xsmall" width="100%">
      <button
        onPress={() => setTab('locations')}
        appearance={tab === 'locations' ? "primary" : "secondary"}
        minHeight={48}
        grow
      >
        <vstack gap="xsmall" alignment="center middle">
          <text size="medium">🗺️</text>
          <text size="xsmall" weight="bold">Locations</text>
        </vstack>
      </button>

      <button
        onPress={() => setTab('suspects')}
        appearance={tab === 'suspects' ? "primary" : "secondary"}
        minHeight={48}
        grow
      >
        <vstack gap="xsmall" alignment="center middle">
          <text size="medium">👤</text>
          <text size="xsmall" weight="bold">Suspects</text>
        </vstack>
      </button>

      <button
        onPress={() => setTab('evidence')}
        appearance={tab === 'evidence' ? "primary" : "secondary"}
        minHeight={48}
        grow
      >
        <vstack gap="xsmall" alignment="center middle">
          <text size="medium">📋</text>
          <text size="xsmall" weight="bold">Evidence</text>
        </vstack>
      </button>
    </hstack>
  </vstack>

  {/* Tab Content */}
  <vstack grow padding="medium" gap="medium">
    {tab === 'locations' && <LocationsContent />}
    {tab === 'suspects' && <SuspectsContent />}
    {tab === 'evidence' && <EvidenceContent />}
  </vstack>
</vstack>
```

### Card Grid (Mobile: 1 col, Tablet: 2 col)

```tsx
<vstack gap="medium">
  {items.map(item => (
    <vstack
      key={item.id}
      backgroundColor="#1a1a1a"
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thin"
      borderColor="#4a4a4a"
    >
      {/* Card content */}
    </vstack>
  ))}
</vstack>
```

### Image with Overlay

```tsx
<zstack>
  {/* Background Image */}
  <image
    url={imageUrl}
    imageWidth={350}
    imageHeight={200}
    resizeMode="cover"
    description="Image description"
  />

  {/* Dark Overlay */}
  <vstack
    height="100%"
    backgroundColor="rgba(10, 10, 10, 0.7)"
  />

  {/* Content Layer */}
  <vstack
    height="100%"
    alignment="start bottom"
    padding="medium"
  >
    <text size="medium" weight="bold" color="#c9b037">
      Overlay Text
    </text>
  </vstack>
</zstack>
```

### Split Layout (Icon + Content)

```tsx
<hstack gap="small" alignment="start top">
  <text size="large">🔍</text>

  <vstack gap="xsmall" grow>
    <text size="medium" weight="bold" color="#e0e0e0">
      Title
    </text>
    <text size="small" color="#a0a0a0">
      Description text here
    </text>
  </vstack>
</hstack>
```

---

## 🎯 State Patterns

### Loading State

```tsx
<vstack
  backgroundColor="#1a1a1a"
  padding="large"
  gap="medium"
  cornerRadius="medium"
  alignment="center middle"
>
  <text size="xlarge">⏳</text>
  <text size="medium" color="#c9b037">
    Loading...
  </text>
</vstack>
```

### Empty State

```tsx
<vstack
  backgroundColor="#1a1a1a"
  padding="large"
  gap="medium"
  cornerRadius="medium"
  alignment="center middle"
>
  <text size="xlarge">🔍</text>
  <text size="medium" color="#707070" alignment="center">
    No evidence found yet
  </text>
  <text size="small" color="#a0a0a0" alignment="center">
    Explore locations to discover clues
  </text>
  <button appearance="primary" minHeight={48}>
    <text size="small" weight="bold">
      📍 Explore Locations
    </text>
  </button>
</vstack>
```

### Error State

```tsx
<vstack
  backgroundColor="#1a1a1a"
  padding="large"
  gap="medium"
  cornerRadius="medium"
  border="thick"
  borderColor="#8b0000"
  alignment="center middle"
>
  <text size="xlarge">⚠️</text>
  <text size="medium" color="#8b0000" weight="bold" alignment="center">
    Connection Failed
  </text>
  <text size="small" color="#a0a0a0" alignment="center">
    Please check your network and try again
  </text>
  <button appearance="primary" minHeight={48}>
    <text size="small" weight="bold">
      🔄 Retry
    </text>
  </button>
</vstack>
```

### Success State

```tsx
<vstack
  backgroundColor="#c9b037"
  padding="large"
  gap="medium"
  cornerRadius="medium"
  alignment="center middle"
>
  <text size="xlarge">🎉</text>
  <text size="large" weight="bold" color="#0a0a0a" alignment="center">
    Correct Answer!
  </text>
  <text size="medium" color="#1a1a1a" alignment="center">
    You identified the culprit correctly
  </text>
</vstack>
```

### Disabled State

```tsx
<button
  onPress={handleAction}
  appearance="primary"
  minHeight={48}
  disabled={!canSubmit}
  // Devvit handles visual disabled state
>
  <text size="small" weight="bold">
    {canSubmit ? 'Submit' : 'Not Ready'}
  </text>
</button>
```

---

## 🔤 Typography Scale

```tsx
// Screen Title
<text size="xlarge" weight="bold" color="#c9b037">
  🕵️ Investigation
</text>

// Section Header
<text size="large" weight="bold" color="#c9b037">
  📊 Case Details
</text>

// Subsection Header
<text size="medium" weight="bold" color="#e0e0e0">
  Victim Information
</text>

// Body Text
<text size="medium" color="#e0e0e0">
  This is the main content text that users will read.
</text>

// Secondary Text
<text size="small" color="#a0a0a0">
  Additional information or descriptions
</text>

// Metadata
<text size="xsmall" color="#707070">
  Posted 2 hours ago
</text>

// Caption
<text size="xsmall" color="#707070">
  Tap to view details
</text>
```

---

## 🎨 Semantic Color Usage

### Backgrounds

```tsx
// Page Background
backgroundColor="#0a0a0a"

// Card Background
backgroundColor="#1a1a1a"

// Nested Card / Elevated Surface
backgroundColor="#2a2a2a"

// Hover / Pressed State
backgroundColor="#3a3a3a"
```

### Borders

```tsx
// Default Border
border="thin"
borderColor="#4a4a4a"

// Emphasis Border
border="thick"
borderColor="#c9b037"

// Error Border
border="thick"
borderColor="#8b0000"

// Success Border
border="thick"
borderColor="#1e90ff"
```

### Text Colors

```tsx
// Primary Content
color="#e0e0e0"

// Secondary Content
color="#a0a0a0"

// Muted / Disabled
color="#707070"

// Accent / CTA
color="#c9b037"

// Error
color="#8b0000"

// Success
color="#1e90ff"
```

---

## 📏 Spacing System

```tsx
// Tight Spacing (4px)
gap="xsmall"
padding="xsmall"

// Compact Spacing (8px)
gap="small"
padding="small"

// Standard Spacing (12px)
gap="medium"
padding="medium"

// Generous Spacing (16px)
gap="large"
padding="large"

// Extra Spacing (24px+)
// Use custom spacing or multiple stacks
```

---

## 🎯 Touch Target Sizes

```tsx
// Minimum Touch Target (44px)
minHeight={44}

// Standard Touch Target (48px)
minHeight={48}

// Large Touch Target (56px)
minHeight={56}

// Primary CTA (56-64px)
minHeight={56}
// or
minHeight={64}
```

---

## 🔘 Button Sizes

```tsx
// Small Button (Secondary actions)
<button
  appearance="secondary"
  size="small"
  minHeight={44}
>
  <text size="xsmall" color="#c9b037">Cancel</text>
</button>

// Medium Button (Standard actions)
<button
  appearance="primary"
  size="medium"
  minHeight={48}
>
  <text size="small" weight="bold">Submit</text>
</button>

// Large Button (Primary CTAs)
<button
  appearance="primary"
  size="large"
  minHeight={56}
>
  <text size="medium" weight="bold">🔍 Start Investigation</text>
</button>
```

---

## 🖼️ Image Patterns

### Standard Image

```tsx
<image
  url={imageUrl}
  imageWidth={350}
  imageHeight={200}
  resizeMode="cover"
  description="Crime scene photo"
  cornerRadius="small"
/>
```

### Circular Avatar

```tsx
<image
  url={avatarUrl}
  imageWidth={80}
  imageHeight={80}
  resizeMode="cover"
  description={`${name} profile photo`}
  cornerRadius="full"
/>
```

### Thumbnail

```tsx
<image
  url={thumbnailUrl}
  imageWidth={60}
  imageHeight={60}
  resizeMode="cover"
  description="Evidence thumbnail"
  cornerRadius="small"
/>
```

---

## 🎭 Modal Pattern

```tsx
// Trigger Modal
const showInputModal = () => {
  context.ui.showModal({
    title: 'Enter Your Answer',
    content: (
      <vstack gap="medium" padding="medium">
        <textInput
          value={inputValue}
          onChangeText={(value) => setInputValue(value)}
          placeholder="Type your answer here..."
          multiline={true}
          minHeight={120}
        />

        <hstack gap="small">
          <button
            onPress={() => context.ui.hideModal()}
            appearance="secondary"
            minHeight={48}
            grow
          >
            <text size="small" color="#c9b037">Cancel</text>
          </button>

          <button
            onPress={handleSubmit}
            appearance="primary"
            minHeight={48}
            grow
          >
            <text size="small" weight="bold">Submit</text>
          </button>
        </hstack>
      </vstack>
    ),
  });
};
```

---

## 📋 Form Input Pattern

```tsx
// Input Field Display
<vstack gap="small">
  <text size="small" weight="bold" color="#c9b037">
    ❓ Field Label
  </text>

  <vstack
    backgroundColor="#1a1a1a"
    padding="medium"
    cornerRadius="medium"
    border="thin"
    borderColor={hasValue ? "#c9b037" : "#4a4a4a"}
  >
    <text
      size="medium"
      color={hasValue ? "#e0e0e0" : "#707070"}
    >
      {value || 'Placeholder text'}
    </text>
  </vstack>

  <button
    onPress={() => showInputModal('field')}
    appearance="secondary"
    size="small"
    minHeight={44}
  >
    <text size="small" color="#c9b037">
      ✏️ Edit
    </text>
  </button>
</vstack>
```

---

## 🏆 Score Display Pattern

```tsx
// Score Card
<vstack
  backgroundColor={isCorrect ? "#c9b037" : "#1a1a1a"}
  padding="large"
  gap="medium"
  cornerRadius="medium"
  border="thick"
  borderColor={isCorrect ? "#c9b037" : "#8b0000"}
  alignment="center middle"
>
  <text
    size="xlarge"
    weight="bold"
    color={isCorrect ? "#0a0a0a" : "#c9b037"}
  >
    {isCorrect ? '🎉 Correct!' : '😢 Incorrect'}
  </text>

  <text
    size="xlarge"
    weight="bold"
    color={isCorrect ? "#0a0a0a" : "#e0e0e0"}
  >
    {score} Points
  </text>

  {rank && (
    <text
      size="medium"
      color={isCorrect ? "#1a1a1a" : "#a0a0a0"}
    >
      Rank: {rank}
    </text>
  )}
</vstack>
```

---

## 📊 Leaderboard Entry Pattern

```tsx
<hstack
  backgroundColor={isCurrentUser ? "#2a2a2a" : "transparent"}
  padding="small"
  gap="small"
  cornerRadius="small"
  border={isCurrentUser ? "thin" : "none"}
  borderColor="#c9b037"
  alignment="space-between middle"
>
  <hstack gap="small" alignment="start middle">
    <text size="medium" weight="bold">
      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
    </text>

    <vstack gap="xsmall">
      <hstack gap="xsmall" alignment="start middle">
        <text size="small" weight="bold" color="#e0e0e0">
          {username}
        </text>
        {isCurrentUser && (
          <text size="xsmall" color="#c9b037">(You)</text>
        )}
      </hstack>

      <text size="xsmall" color="#707070">
        {timestamp}
      </text>
    </vstack>
  </hstack>

  <vstack gap="xsmall" alignment="end middle">
    <text size="medium" weight="bold" color="#c9b037">
      {score} pts
    </text>
    {isCorrect && (
      <text size="xsmall" color="#c9b037" weight="bold">
        ✅ Correct
      </text>
    )}
  </vstack>
</hstack>
```

---

## 🎨 Helper Functions

```typescript
// Score Color Helper
const getScoreColor = (score: number): string => {
  if (score >= 80) return '#c9b037';  // Gold
  if (score >= 60) return '#1e90ff';  // Blue
  if (score >= 40) return '#d4af37';  // Amber
  return '#8b0000';                    // Red
};

// Rarity Color Helper
const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'legendary': return '#c9b037';  // Gold
    case 'epic': return '#4b0082';       // Purple
    case 'rare': return '#1e90ff';       // Blue
    case 'common': return '#707070';     // Gray
    default: return '#4a4a4a';
  }
};

// Evidence Icon Helper
const getEvidenceIcon = (type: string): string => {
  switch (type) {
    case 'physical': return '🔍';
    case 'testimonial': return '💬';
    case 'document': return '📄';
    default: return '❓';
  }
};

// Format Date Helper
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
```

---

## ♿ Accessibility Props

```tsx
// Button with Accessibility
<button
  onPress={handleAction}
  appearance="primary"
  minHeight={48}
  accessibilityLabel="Start investigation"
  accessibilityHint="Opens the investigation screen with locations, suspects, and evidence"
  accessibilityRole="button"
>
  <text size="medium" weight="bold">
    🔍 Start
  </text>
</button>

// Image with Accessibility
<image
  url={imageUrl}
  imageWidth={350}
  imageHeight={200}
  description="Crime scene showing broken window and overturned furniture"
  accessibilityLabel="Crime scene photo"
/>

// Region with Accessibility
<vstack
  accessibilityRole="region"
  accessibilityLabel="Case details"
>
  {/* Content */}
</vstack>
```

---

## 🚀 Performance Tips

### Lazy Load Images

```tsx
{imageUrl && (
  <image
    url={imageUrl}
    imageWidth={350}
    imageHeight={200}
    resizeMode="cover"
    // Image loads when in viewport
  />
)}
```

### Optimize Image Sizes

```typescript
// Use appropriate image dimensions
const THUMBNAIL_SIZE = 60;
const CARD_IMAGE_HEIGHT = 200;
const HERO_IMAGE_HEIGHT = 300;

// Compress images
// Target: <100KB for thumbnails, <200KB for cards
```

### Minimize Nesting

```tsx
// ❌ Bad: Deep nesting
<vstack>
  <vstack>
    <vstack>
      <vstack>
        <text>Too deep</text>
      </vstack>
    </vstack>
  </vstack>
</vstack>

// ✅ Good: Flat structure
<vstack gap="medium">
  <text>Content 1</text>
  <text>Content 2</text>
  <text>Content 3</text>
</vstack>
```

---

## 📱 Reddit App Safe Areas

```tsx
// Account for Reddit chrome
<vstack
  height="100%"
  backgroundColor="#0a0a0a"
  // Add padding to avoid overlap
  paddingTop="medium"
  paddingBottom="large"
>
  {/* Content */}
</vstack>
```

---

## ✅ Pre-Launch Checklist

### Visual Polish
- [ ] All colors use design system tokens
- [ ] Consistent spacing (xsmall, small, medium, large)
- [ ] Corner radius applied (small, medium, large)
- [ ] Borders use semantic colors

### Touch Targets
- [ ] All buttons ≥48px height
- [ ] Primary CTAs ≥56px height
- [ ] Adequate spacing between tappable elements

### Typography
- [ ] Heading hierarchy (xlarge → large → medium)
- [ ] Body text uses medium size
- [ ] Metadata uses small or xsmall

### States
- [ ] Loading states for all async actions
- [ ] Empty states with helpful CTAs
- [ ] Error states with recovery actions
- [ ] Disabled states clearly indicated

### Accessibility
- [ ] All images have descriptions
- [ ] All buttons have accessibility labels
- [ ] Touch targets meet 48x48px minimum
- [ ] Color contrast meets WCAG AA

### Mobile Optimization
- [ ] Tested on 375px viewport
- [ ] No horizontal scroll
- [ ] Thumb-zone CTAs
- [ ] Forms don't trigger iOS zoom

---

**Quick Reference Complete** ✅

Use these patterns to rapidly build consistent, polished, mobile-first UX for Devvit!
