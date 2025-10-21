# Accessibility Guide

WCAG 2.1 AA compliance for Armchair Sleuths.

## Checklist

### Keyboard Navigation
- ✅ All interactive elements accessible via Tab
- ✅ Logical tab order (top-to-bottom, left-to-right)
- ✅ Focus indicators visible (2px gold ring)
- ✅ ESC closes modals
- ✅ Enter/Space activates buttons
- ✅ Arrow keys for custom components (if applicable)

### Screen Readers
- ✅ Proper heading hierarchy (h1 → h2 → h3)
- ✅ ARIA labels on icon-only buttons
- ✅ `role="dialog"` on modals with `aria-modal="true"`
- ✅ `aria-labelledby` for modal titles
- ✅ `aria-describedby` for additional context
- ✅ `aria-live="polite"` for dynamic updates
- ✅ `aria-hidden="true"` on decorative elements

### Color & Contrast
- ✅ Text: 4.5:1 minimum
- ✅ Large text (18px+): 3:1 minimum
- ✅ UI components: 3:1 minimum
- ✅ Don't rely on color alone for information

### Touch Targets
- ✅ Minimum size: 44x44px
- ✅ Spacing: 8px between targets
- ✅ Larger on mobile (48x48px recommended)

### Forms
- ✅ Labels for all inputs
- ✅ Error messages associated with fields
- ✅ Required fields marked
- ✅ Validation errors announced to screen readers

## Common Patterns

### Button
```tsx
<button
  onClick={handleClick}
  aria-label="Close modal"
  className="focus:outline-none focus:ring-2 focus:ring-detective-gold"
>
  <X aria-hidden="true" />
</button>
```

### Modal
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Evidence Discovered</h2>
  {/* Content */}
</div>
```

### Live Region
```tsx
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### Skip Link
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

## Testing

- Use Chrome DevTools Lighthouse (target: 90+ accessibility score)
- Test with keyboard only (no mouse)
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Verify with axe DevTools extension
