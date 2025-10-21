# Responsive Breakpoints

Mobile-first responsive design strategy.

## Breakpoints

```typescript
sm: '640px',    // Mobile landscape
md: '768px',    // Tablet
lg: '1024px',   // Desktop
xl: '1280px',   // Large desktop
'2xl': '1536px' // Extra large
```

## Layout Strategies

### Mobile (320px - 767px)
- Single column
- Stacked components
- Full-width cards
- Bottom sheets for selectors
- Sticky headers
- Hamburger menu (if needed)
- Touch-optimized (48x48px targets)

### Tablet (768px - 1023px)
- 2 columns
- Side-by-side layouts
- Larger touch targets (44x44px)
- Sidebar navigation
- Hybrid gestures

### Desktop (1024px+)
- 3+ columns
- Full layout
- Hover interactions
- Sidebar + main content
- Keyboard shortcuts

## Common Patterns

### Responsive Grid
```tsx
<div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  gap-4 sm:gap-6 lg:gap-8
">
```

### Responsive Typography
```tsx
<h1 className="
  text-2xl
  sm:text-3xl
  lg:text-4xl
  font-display
">
```

### Responsive Padding
```tsx
<div className="
  px-4 py-8
  sm:px-6 sm:py-12
  lg:px-8 lg:py-16
">
```

### Show/Hide by Breakpoint
```tsx
<div className="hidden lg:block">Desktop Only</div>
<div className="lg:hidden">Mobile/Tablet Only</div>
```

## Investigation Screen Responsive

### Desktop
```
┌─────────────────────────────────┐
│ [Locations]    [Suspects]       │
│ Side-by-side                    │
└─────────────────────────────────┘
```

### Mobile
```
┌──────────────┐
│ [Tab: Locs]  │
│ [Tab: Susp]  │
│              │
│ Stacked      │
└──────────────┘
```

## Testing

- Test at: 320px, 768px, 1024px, 1920px
- Use Chrome DevTools device emulation
- Test real devices if possible
- Verify touch targets on mobile
