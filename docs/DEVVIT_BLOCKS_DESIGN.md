# Devvit Blocks UI Design Guide

## Overview

This guide adapts the Armchair Sleuths visual design system for **Devvit Blocks UI**, which is more constrained than the full React+Tailwind web view.

---

## Devvit Blocks Limitations

### Available Components
- `<vstack>` - Vertical stack container
- `<hstack>` - Horizontal stack container
- `<zstack>` - Layered stack (z-axis)
- `<spacer>` - Empty space
- `<text>` - Text element
- `<button>` - Interactive button
- `<icon>` - Reddit Product Language icons
- `<image>` - Image display
- `<webview>` - Full web view (use for complex UI)

### No Custom CSS
- Cannot use custom CSS classes
- Must use Devvit's built-in styling props
- Limited to Devvit's color palette
- Typography controlled by Devvit's system

---

## Design System for Blocks

### Color Palette (Devvit Tokens)

```tsx
// Primary Colors
color: 'neutral-background'      // #FFFFFF - Card backgrounds
color: 'neutral-background-weak' // #F6F7F8 - Page background
color: 'neutral-content'         // #1A1A1B - Primary text
color: 'neutral-content-weak'    // #7C7C7C - Secondary text
color: 'neutral-border'          // #EDEFF1 - Borders
color: 'neutral-border-weak'     // #F6F7F8 - Subtle borders

// Brand Colors
color: 'alien-blue-600'          // #0079D3 - Reddit blue (primary actions)
color: 'orange-red-600'          // #FF4500 - Reddit orange (alerts)

// Semantic Colors
color: 'success-background'      // Success states
color: 'danger-background'       // Error states
color: 'warning-background'      // Warning states
```

### Typography Scale

```tsx
// Size
size: 'xxsmall'  // 10px
size: 'xsmall'   // 12px
size: 'small'    // 14px
size: 'medium'   // 16px - Default
size: 'large'    // 18px
size: 'xlarge'   // 20px
size: 'xxlarge'  // 24px

// Weight
weight: 'regular' // 400
weight: 'bold'    // 700

// Style
style: 'heading'  // For headers
style: 'body'     // For body text
style: 'metadata' // For small text
```

### Spacing

```tsx
// Gap (spacing between items)
gap: 'none'   // 0px
gap: 'small'  // 8px
gap: 'medium' // 16px
gap: 'large'  // 24px

// Padding
padding: 'none'   // 0px
padding: 'xsmall' // 4px
padding: 'small'  // 8px
padding: 'medium' // 16px
padding: 'large'  // 24px
```

---

## Component Implementations in Blocks

### Suspect Card (Simplified)

```tsx
<vstack
  padding="medium"
  gap="small"
  backgroundColor="neutral-background"
  borderColor="neutral-border"
  cornerRadius="medium"
>
  {/* Image */}
  <image
    url={suspectImageUrl}
    imageWidth={200}
    imageHeight={200}
    description={suspectName}
    resizeMode="cover"
  />

  {/* Label */}
  <text
    size="xsmall"
    weight="bold"
    color="neutral-content-weak"
  >
    SUSPECT #{suspectId}
  </text>

  {/* Name */}
  <text
    size="xlarge"
    weight="bold"
    color="neutral-content"
  >
    {suspectName}
  </text>

  {/* Archetype */}
  <text
    size="small"
    color="neutral-content-weak"
  >
    {archetype}
  </text>

  {/* Background */}
  <text
    size="small"
    color="neutral-content"
    wrap
  >
    {background}
  </text>

  {/* Button */}
  <button
    appearance="primary"
    size="medium"
    onPress={() => onInterrogate(suspectId)}
  >
    Interrogate
  </button>
</vstack>
```

### Chat Bubble (User)

```tsx
<hstack
  alignment="end"
  width="100%"
  padding="small"
>
  <vstack
    maxWidth="80%"
    gap="xsmall"
  >
    <vstack
      padding="medium"
      backgroundColor="alien-blue-600"
      cornerRadius="large"
    >
      <text
        size="medium"
        color="white"
        wrap
      >
        {userMessage}
      </text>
    </vstack>

    <text
      size="xsmall"
      color="neutral-content-weak"
      alignment="end"
    >
      {timestamp}
    </text>
  </vstack>
</hstack>
```

### Chat Bubble (AI Suspect)

```tsx
<hstack
  alignment="start"
  width="100%"
  padding="small"
>
  <vstack
    maxWidth="80%"
    gap="xsmall"
  >
    <hstack gap="small" alignment="start">
      {/* Avatar */}
      <image
        url={suspectAvatarUrl}
        imageWidth={32}
        imageHeight={32}
        description={suspectName}
        resizeMode="cover"
      />

      {/* Message */}
      <vstack gap="xsmall">
        <text
          size="xsmall"
          weight="bold"
          color="neutral-content"
        >
          {suspectName}
        </text>

        <vstack
          padding="medium"
          backgroundColor="neutral-background-weak"
          cornerRadius="large"
        >
          <text
            size="medium"
            color="neutral-content"
            wrap
          >
            {suspectMessage}
          </text>
        </vstack>

        <text
          size="xsmall"
          color="neutral-content-weak"
        >
          {timestamp}
        </text>
      </vstack>
    </hstack>
  </vstack>
</hstack>
```

### Score Breakdown Item

```tsx
<hstack
  alignment="space-between"
  padding="medium"
  gap="medium"
  borderColor="neutral-border"
>
  <hstack gap="medium" grow>
    {/* Icon */}
    <icon
      name={isCorrect ? 'checkmark-outline' : 'close-outline'}
      color={isCorrect ? 'success-content' : 'danger-content'}
      size="large"
    />

    {/* Info */}
    <vstack gap="xsmall" grow>
      <text
        size="small"
        weight="bold"
        color="neutral-content"
      >
        {label}
      </text>
      <text
        size="xsmall"
        color="neutral-content-weak"
      >
        {description}
      </text>
    </vstack>
  </hstack>

  {/* Points */}
  <text
    size="large"
    weight="bold"
    color={isCorrect ? 'success-content' : 'danger-content'}
  >
    {points >= 0 ? '+' : ''}{points}
  </text>
</hstack>
```

### Case Header

```tsx
<vstack
  padding="large"
  gap="small"
  backgroundColor="alien-blue-600"
  width="100%"
>
  <text
    size="xsmall"
    weight="bold"
    color="white"
    style="metadata"
  >
    TODAY'S CASE
  </text>

  <text
    size="xxlarge"
    weight="bold"
    color="white"
    style="heading"
  >
    {caseTitle}
  </text>

  <text
    size="medium"
    color="white"
  >
    {caseDate}
  </text>
</vstack>
```

### Loading State

```tsx
<vstack
  alignment="center middle"
  padding="large"
  gap="medium"
>
  <icon
    name="activity-outline"
    size="xlarge"
    color="alien-blue-600"
  />

  <text
    size="large"
    weight="bold"
    color="neutral-content"
  >
    Loading case file...
  </text>

  <text
    size="small"
    color="neutral-content-weak"
  >
    Preparing today's mystery
  </text>
</vstack>
```

### Alert (Success)

```tsx
<hstack
  padding="medium"
  gap="medium"
  backgroundColor="success-background"
  borderColor="success-border"
  cornerRadius="medium"
>
  <icon
    name="checkmark-circle-outline"
    color="success-content"
    size="large"
  />

  <vstack gap="xsmall" grow>
    <text
      size="small"
      weight="bold"
      color="success-content"
    >
      Success!
    </text>
    <text
      size="small"
      color="success-content"
    >
      {successMessage}
    </text>
  </vstack>
</hstack>
```

### Button Variants

```tsx
// Primary Button
<button
  appearance="primary"
  size="medium"
  onPress={handlePress}
>
  Submit Guess
</button>

// Secondary Button
<button
  appearance="secondary"
  size="medium"
  onPress={handlePress}
>
  View Evidence
</button>

// Bordered Button
<button
  appearance="bordered"
  size="small"
  onPress={handlePress}
>
  Skip
</button>

// Media Button (icon only)
<button
  appearance="media"
  icon="arrow-back-outline"
  onPress={handlePress}
/>
```

### Badge

```tsx
<hstack
  padding="xsmall"
  backgroundColor="success-background"
  cornerRadius="full"
  minWidth={24}
  alignment="center middle"
>
  <text
    size="xsmall"
    weight="bold"
    color="success-content"
  >
    NEW
  </text>
</hstack>
```

---

## Layout Patterns

### Page Container

```tsx
<vstack
  width="100%"
  height="100%"
  gap="none"
  backgroundColor="neutral-background-weak"
>
  {/* Header */}
  <vstack
    padding="large"
    backgroundColor="neutral-background"
    borderColor="neutral-border"
  >
    <text size="xxlarge" weight="bold">
      Page Title
    </text>
  </vstack>

  {/* Content */}
  <vstack
    grow
    padding="medium"
    gap="medium"
  >
    {/* Page content */}
  </vstack>
</vstack>
```

### Grid Layout (Suspect Cards)

```tsx
<vstack gap="medium" padding="medium">
  <hstack gap="medium">
    {/* Suspect 1 */}
    <SuspectCard {...suspect1} />
    {/* Suspect 2 */}
    <SuspectCard {...suspect2} />
  </hstack>

  <hstack gap="medium">
    {/* Suspect 3 */}
    <SuspectCard {...suspect3} />
    {/* Suspect 4 */}
    <SuspectCard {...suspect4} />
  </hstack>
</vstack>
```

### Chat Layout

```tsx
<vstack
  width="100%"
  height="100%"
  gap="none"
>
  {/* Chat Header */}
  <hstack
    padding="medium"
    gap="medium"
    backgroundColor="neutral-background"
    borderColor="neutral-border"
  >
    <button
      appearance="media"
      icon="arrow-back-outline"
      onPress={handleBack}
    />

    <image
      url={suspectAvatarUrl}
      imageWidth={40}
      imageHeight={40}
      resizeMode="cover"
    />

    <vstack gap="xsmall">
      <text size="medium" weight="bold">
        {suspectName}
      </text>
      <text size="xsmall" color="neutral-content-weak">
        {suspectArchetype}
      </text>
    </vstack>
  </hstack>

  {/* Messages */}
  <vstack
    grow
    padding="medium"
    gap="small"
  >
    {messages.map(msg => (
      msg.isUser ? <UserChatBubble {...msg} /> : <SuspectChatBubble {...msg} />
    ))}
  </vstack>

  {/* Input Area */}
  <hstack
    padding="medium"
    gap="small"
    backgroundColor="neutral-background"
    borderColor="neutral-border"
  >
    <button
      appearance="primary"
      size="medium"
      onPress={handleSendMessage}
    >
      Send Question
    </button>
  </hstack>
</vstack>
```

---

## When to Use WebView vs Blocks

### Use Blocks For:
- Simple layouts with vertical/horizontal stacks
- Card-based UIs
- Forms with basic inputs
- Lists and grids
- Navigation screens

### Use WebView For:
- Complex interactive forms
- Rich text editing
- Custom animations
- Data visualizations (charts, graphs)
- Score breakdowns with complex layouts
- Leaderboards with sorting/filtering

### Hybrid Approach (Recommended):

```tsx
// Main navigation in Blocks
<vstack gap="medium" padding="medium">
  <button
    appearance="primary"
    onPress={() => showWebView('case-overview')}
  >
    View Case Details
  </button>

  <button
    appearance="secondary"
    onPress={() => showWebView('suspects')}
  >
    Interrogate Suspects
  </button>

  <button
    appearance="secondary"
    onPress={() => showWebView('submission')}
  >
    Submit Answer
  </button>
</vstack>

// Complex screens in WebView
<webview
  id="case-overview"
  url="case-overview.html"
  grow
/>
```

---

## Devvit-Specific Best Practices

### 1. Keep It Simple
Blocks UI is designed for simplicity. Complex layouts should use WebView.

### 2. Use Platform Icons
Leverage Reddit's icon library for consistency:
```tsx
<icon name="person-outline" />
<icon name="chatbubble-outline" />
<icon name="trophy-outline" />
<icon name="time-outline" />
<icon name="location-outline" />
```

### 3. Respect Spacing
Use consistent gaps throughout:
```tsx
// Small spacing for related items
gap="small"

// Medium spacing for sections
gap="medium"

// Large spacing for major sections
gap="large"
```

### 4. Optimize for Mobile
Blocks are mobile-first. Test on small screens:
```tsx
// Use wrap for long text
<text wrap>Long description...</text>

// Use maxWidth for chat bubbles
<vstack maxWidth="80%">...</vstack>
```

### 5. Loading States
Always show loading feedback:
```tsx
<vstack alignment="center middle" padding="large">
  <icon name="activity-outline" size="xlarge" />
  <text>Loading...</text>
</vstack>
```

---

## Color Mapping (Design System to Devvit)

| Design System          | Devvit Blocks               | Use Case              |
|------------------------|-----------------------------|-----------------------|
| `bg-gray-50`           | `neutral-background-weak`   | Page background       |
| `bg-white`             | `neutral-background`        | Card background       |
| `text-gray-900`        | `neutral-content`           | Primary text          |
| `text-gray-600`        | `neutral-content-weak`      | Secondary text        |
| `border-gray-200`      | `neutral-border`            | Card borders          |
| `bg-red-600`           | `orange-red-600`            | Error/alert           |
| `bg-blue-900`          | `alien-blue-600`            | Primary actions       |
| `bg-green-600`         | `success-background`        | Success states        |
| `bg-amber-500`         | `warning-background`        | Warning states        |

---

## Example: Full Suspect Card Implementation

```tsx
import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
});

const SuspectCard = ({ suspect, onInterrogate }) => (
  <vstack
    padding="medium"
    gap="small"
    backgroundColor="neutral-background"
    borderColor="neutral-border"
    cornerRadius="medium"
    width="150px"
  >
    <image
      url={suspect.imageUrl}
      imageWidth={150}
      imageHeight={150}
      description={suspect.name}
      resizeMode="cover"
    />

    <text
      size="xsmall"
      weight="bold"
      color="neutral-content-weak"
    >
      SUSPECT #{suspect.id}
    </text>

    <text
      size="large"
      weight="bold"
      color="neutral-content"
    >
      {suspect.name}
    </text>

    <text
      size="small"
      color="neutral-content-weak"
    >
      {suspect.archetype}
    </text>

    <text
      size="small"
      color="neutral-content"
      wrap
    >
      {suspect.background}
    </text>

    <button
      appearance="primary"
      size="medium"
      onPress={() => onInterrogate(suspect.id)}
    >
      Interrogate
    </button>
  </vstack>
);

// Usage
Devvit.addCustomPostType({
  name: 'Armchair Sleuths',
  render: (context) => {
    return (
      <vstack gap="medium" padding="medium">
        <hstack gap="medium">
          <SuspectCard
            suspect={suspects[0]}
            onInterrogate={handleInterrogate}
          />
          <SuspectCard
            suspect={suspects[1]}
            onInterrogate={handleInterrogate}
          />
        </hstack>
      </vstack>
    );
  },
});
```

---

## Performance Tips

1. **Lazy Load Images**: Use `loading="lazy"` prop if available
2. **Limit Nested Stacks**: Keep nesting depth < 5 levels
3. **Optimize Re-renders**: Use `useState` carefully in Blocks
4. **Use WebView for Heavy Lifting**: Complex UIs should use WebView

---

## Testing Checklist for Blocks UI

- [ ] Test on mobile (primary platform)
- [ ] Check text wrapping on long content
- [ ] Verify button touch targets (min 44px)
- [ ] Test with different Reddit themes (light/dark)
- [ ] Ensure icons are visible and meaningful
- [ ] Verify all interactive elements have feedback
- [ ] Check alignment on various screen sizes

---

**Recommendation**: Use **Blocks for navigation and simple views**, **WebView for complex interactive screens** like the chat interface, submission form, and results visualization. This hybrid approach provides the best user experience while respecting Devvit's constraints.
