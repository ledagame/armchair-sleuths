# Devvit Blocks API Reference

Complete reference for Devvit's declarative UI framework (Devvit Blocks).

## Core Blocks

### vstack (Vertical Stack)

Stacks children vertically (flex-direction: column).

```typescript
<vstack
  gap="medium"          // spacing between children
  padding="medium"      // internal padding
  alignment="center"    // horizontal alignment
  backgroundColor="white"
  cornerRadius="medium"
  border="thin"
  borderColor="neutral-border"
>
  <text>Child 1</text>
  <text>Child 2</text>
</vstack>
```

**Props:**
- `gap`: none | small | medium | large
- `padding`: none | small | medium | large | xsmall
- `alignment`: start | center | end | stretch
- `grow`: boolean (flex-grow)
- `height`: string (e.g., "100px", "50%")
- `width`: string
- `backgroundColor`: color name
- `cornerRadius`: none | small | medium | large | full
- `border`: none | thin | thick
- `borderColor`: color name

### hstack (Horizontal Stack)

Stacks children horizontally (flex-direction: row).

```typescript
<hstack
  gap="small"
  padding="small"
  alignment="middle"    // vertical alignment
  reverse={false}       // reverse order
>
  <text>Left</text>
  <spacer />
  <text>Right</text>
</hstack>
```

**Props:**
- Same as vstack
- `alignment`: top | middle | bottom | stretch
- `reverse`: boolean

### zstack (Layered Stack)

Layers children on z-axis (position: absolute).

```typescript
<zstack
  width="100%"
  height="200px"
  alignment="center middle"
>
  <image url="background.jpg" />
  <vstack>
    <text>Overlay content</text>
  </vstack>
</zstack>
```

**Props:**
- `alignment`: "horizontal vertical" (e.g., "center middle", "start top")
- Horizontal: start | center | end
- Vertical: top | middle | bottom

### text

Displays text content.

```typescript
<text
  size="large"
  weight="bold"
  color="neutral-content-strong"
  alignment="center"
  wrap={true}
  overflow="ellipsis"
  selectable={true}
>
  Text content
</text>
```

**Props:**
- `size`: xsmall | small | medium | large | xlarge | xxlarge
- `weight`: regular | bold
- `color`: color name
- `alignment`: start | center | end
- `wrap`: boolean
- `overflow`: clip | ellipsis
- `selectable`: boolean
- `style`: italic | heading | metadata | body

### button

Interactive button element.

```typescript
<button
  onPress={() => handlePress()}
  appearance="primary"
  size="medium"
  disabled={false}
  icon="search"
  grow={false}
>
  Button Text
</button>
```

**Props:**
- `onPress`: () => void
- `appearance`: primary | secondary | success | destructive | bordered | plain | media
- `size`: small | medium | large
- `disabled`: boolean
- `icon`: icon name
- `grow`: boolean (flex-grow)

### image

Displays images from URL.

```typescript
<image
  url="https://example.com/image.jpg"
  description="Alt text"
  imageWidth={400}
  imageHeight={300}
  resizeMode="cover"
/>
```

**Props:**
- `url`: string (HTTPS required)
- `description`: string (alt text)
- `imageWidth`: number (intrinsic width)
- `imageHeight`: number (intrinsic height)
- `resizeMode`: cover | fit | fill | none | scale-down

### spacer

Flexible spacing element.

```typescript
<hstack>
  <text>Left</text>
  <spacer />              {/* Pushes content apart */}
  <text>Right</text>
</hstack>

<vstack>
  <text>Top</text>
  <spacer size="medium" /> {/* Fixed spacing */}
  <text>Bottom</text>
</vstack>
```

**Props:**
- `size`: small | medium | large (fixed spacing)
- `grow`: number (flex-grow, default: 1)

### icon

Displays system icons.

```typescript
<icon
  name="search"
  size="medium"
  color="neutral-content"
/>
```

**Props:**
- `name`: icon name (see icon list below)
- `size`: xsmall | small | medium | large
- `color`: color name

## Common Icons

```
search, close, checkmark, chevron-right, chevron-left,
chevron-up, chevron-down, settings, user, home, star,
heart, share, more, edit, delete, add, remove, info,
warning, error, success, menu, filter, sort, refresh
```

## Color System

**Content colors:**
```
neutral-content          // Default text
neutral-content-strong   // Emphasized text
neutral-content-weak     // De-emphasized text
```

**Background colors:**
```
neutral-background          // Default background
neutral-background-hover    // Hover state
neutral-background-selected // Selected state
```

**Interactive colors:**
```
interactive-background        // Primary buttons
interactive-background-hover  // Hover
interactive-background-disabled
```

**Semantic colors:**
```
success-background, success-content
warning-background, warning-content
critical-background, critical-content
```

**Borders:**
```
neutral-border         // Default border
neutral-border-weak    // Subtle border
```

## Layout Patterns

### Card Layout

```typescript
<vstack
  padding="medium"
  gap="small"
  backgroundColor="neutral-background"
  cornerRadius="medium"
  border="thin"
  borderColor="neutral-border"
>
  <text size="large" weight="bold">Card Title</text>
  <text color="neutral-content-weak">Description</text>
  <button appearance="primary">Action</button>
</vstack>
```

### Header with Actions

```typescript
<hstack padding="medium" alignment="middle">
  <button icon="chevron-left" appearance="plain" />
  <text size="xlarge" weight="bold">Screen Title</text>
  <spacer />
  <button icon="settings" appearance="plain" />
</hstack>
```

### List Item

```typescript
<hstack
  padding="medium"
  gap="small"
  alignment="middle"
  backgroundColor="neutral-background-hover"
>
  <image url="thumbnail.jpg" imageWidth={48} imageHeight={48} />
  <vstack gap="xsmall" grow>
    <text weight="bold">Item Title</text>
    <text size="small" color="neutral-content-weak">Subtitle</text>
  </vstack>
  <icon name="chevron-right" color="neutral-content-weak" />
</hstack>
```

### Bottom Action Bar

```typescript
<vstack gap="none">
  <spacer />
  <hstack
    padding="medium"
    gap="small"
    backgroundColor="neutral-background"
    border="thin"
    borderColor="neutral-border"
  >
    <button appearance="primary" grow>Primary Action</button>
    <button appearance="bordered">Secondary</button>
  </hstack>
</vstack>
```

### Modal/Sheet

```typescript
<zstack width="100%" height="100%" alignment="center middle">
  {/* Semi-transparent overlay */}
  <vstack width="100%" height="100%" backgroundColor="black" />

  {/* Content */}
  <vstack
    width="90%"
    padding="large"
    gap="medium"
    backgroundColor="neutral-background"
    cornerRadius="large"
  >
    <text size="xlarge" weight="bold">Modal Title</text>
    <text>Modal content goes here</text>
    <hstack gap="small">
      <button appearance="bordered" grow>Cancel</button>
      <button appearance="primary" grow>Confirm</button>
    </hstack>
  </vstack>
</zstack>
```

## Mobile Optimization

### Thumb-Friendly Buttons

```typescript
{/* Large touch target */}
<button
  size="large"          // 56px height
  appearance="primary"
  grow
>
  Primary Action
</button>

{/* Icon-only button */}
<button
  icon="settings"
  appearance="plain"
  size="large"          // 44x44px minimum
/>
```

### Responsive Spacing

```typescript
{/* Mobile: medium, Desktop: large */}
<vstack
  gap="medium"          // 12px on mobile
  padding="medium"      // 16px on mobile
>
  <text>Content</text>
</vstack>
```

### Scrollable Content

```typescript
<vstack height="100%">
  {/* Fixed header */}
  <hstack padding="medium" border="thin" borderColor="neutral-border">
    <text size="large" weight="bold">Header</text>
  </hstack>

  {/* Scrollable body */}
  <vstack grow padding="medium" gap="medium">
    {items.map(item => <ItemCard key={item.id} {...item} />)}
  </vstack>

  {/* Fixed footer */}
  <hstack padding="medium" border="thin" borderColor="neutral-border">
    <button appearance="primary" grow>Action</button>
  </hstack>
</vstack>
```

## Performance Tips

1. **Minimize nesting:** Keep hierarchy shallow (max 5-6 levels)
2. **Use keys for lists:** Always provide `key` prop for mapped items
3. **Lazy load images:** Only load images when visible
4. **Avoid complex layouts:** Simpler layouts render faster
5. **Use spacer wisely:** Prefer `gap` over multiple spacers

## Common Mistakes

❌ **Fixed pixel sizes on mobile:**
```typescript
<vstack width="400px"> {/* Breaks on small screens */}
```

✅ **Use percentages:**
```typescript
<vstack width="90%"> {/* Responsive */}
```

❌ **No touch targets:**
```typescript
<text onPress={handlePress}>Tap me</text> {/* Too small */}
```

✅ **Wrap in button:**
```typescript
<button onPress={handlePress}>
  <text>Tap me</text>
</button>
```

❌ **Overcomplicated layouts:**
```typescript
<vstack>
  <hstack>
    <vstack>
      <hstack>
        <vstack> {/* Too deep! */}
```

✅ **Flatten hierarchy:**
```typescript
<vstack gap="medium">
  <text>Item 1</text>
  <text>Item 2</text>
</vstack>
```

## Reddit Theme Integration

Devvit automatically handles Reddit's light/dark mode:

```typescript
{/* Use semantic colors - they adapt to theme */}
<vstack
  backgroundColor="neutral-background"
  borderColor="neutral-border"
>
  <text color="neutral-content">
    Adapts to light/dark mode automatically
  </text>
</vstack>
```

**Don't hardcode colors:**
- ❌ `backgroundColor="#FFFFFF"`
- ✅ `backgroundColor="neutral-background"`

## Debugging Tips

1. **Check hierarchy:** Use browser DevTools to inspect structure
2. **Test both themes:** Toggle light/dark mode in Reddit
3. **Verify touch targets:** Test on actual mobile device
4. **Check overflow:** Ensure content doesn't clip unexpectedly
5. **Test scrolling:** Verify scrollable areas work smoothly
