# Animation & Accessibility Quick Reference

**For**: Development Team
**Purpose**: Quick lookup for animation patterns and accessibility requirements

---

## Animation Patterns

### Screen Transitions

```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={screenId}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### Card Hover Effects

```tsx
<motion.div
  whileHover={{
    scale: 1.02,
    y: -4,
    transition: { duration: 0.2, ease: [0.65, 0, 0.35, 1] }
  }}
  whileTap={{ scale: 0.98 }}
  className="card hover:shadow-glow-strong"
>
  {content}
</motion.div>
```

### Modal Animations

```tsx
// Backdrop
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
  className="fixed inset-0 bg-background-overlay backdrop-blur-sm"
/>

// Modal content
<motion.div
  initial={{ scale: 0.95, opacity: 0, y: 20 }}
  animate={{ scale: 1, opacity: 1, y: 0 }}
  exit={{ scale: 0.95, opacity: 0, y: 20 }}
  transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
  className="modal-content shadow-glow-strong"
>
  {content}
</motion.div>
```

### Button Interactions

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="btn-primary"
>
  Click Me
</motion.button>
```

### Loading Skeletons

```tsx
// Use the skeleton-shimmer class
<div className="skeleton-shimmer rounded w-full h-20" />

// Or use the Skeleton component
import { Skeleton } from '@/client/components/common/LoadingSkeleton';

<Skeleton width="100%" height="20px" />
```

---

## Accessibility Patterns

### Focus Trap for Modals

```tsx
import { useFocusTrap } from '@/client/hooks/useFocusTrap';

function Modal({ isOpen, onClose }) {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {content}
    </div>
  );
}
```

### Keyboard Navigation

```tsx
// Interactive card
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  aria-label="Descriptive action label"
>
  {content}
</div>
```

### ARIA Labels

```tsx
// Button with icon only
<button aria-label="Close modal" onClick={onClose}>
  <XIcon />
</button>

// Interactive element with state
<button
  aria-label={`${isActive ? 'Active' : 'Inactive'} tab`}
  aria-current={isActive ? 'page' : undefined}
>
  {label}
</button>

// Modal
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Title</h2>
  <p id="modal-description">Description</p>
</div>

// Loading state
<div role="status" aria-live="polite" aria-label="Loading content">
  <Spinner />
</div>
```

### Focus Indicators

```tsx
// Always include focus ring classes
<button className="
  btn-primary
  focus:outline-none
  focus:ring-2
  focus:ring-detective-gold
  focus:ring-offset-2
  focus:ring-offset-noir-deepBlack
">
  Button
</button>
```

### Touch Targets

```css
/* Minimum 44x44px for all interactive elements */
.btn-primary {
  min-width: 44px;
  min-height: 44px;
  padding: 0.75rem 1.5rem;
}

/* Mobile-specific enforcement */
@media (hover: none) and (pointer: coarse) {
  button,
  a,
  [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

---

## Color Contrast Requirements

### Text Contrast (WCAG AA: 4.5:1)

✅ **Approved Combinations**:
- `text-primary` (#e0e0e0) on `noir-deepBlack` (#0a0a0a) - 12.6:1
- `text-secondary` (#a0a0a0) on `noir-deepBlack` - 7.2:1
- `detective-gold` (#c9b037) on `noir-deepBlack` - 5.8:1

❌ **Avoid**:
- `text-muted` (#707070) on `noir-gunmetal` (#2a2a2a) - 2.1:1 (too low)

### UI Component Contrast (WCAG AA: 3:1)

✅ **Approved**:
- `evidence-clue` (#1e90ff) on `noir-deepBlack` - 6.1:1
- `evidence-blood` (#8b0000) on `noir-deepBlack` - 3.2:1 (large text only)

⚠️ **Use with Caution**:
- `evidence-poison` (#4b0082) on `noir-deepBlack` - 2.9:1 (marginal fail)

---

## Animation Timing Standards

### Duration
- **Fast**: 150ms (micro-interactions)
- **Base**: 250ms (standard transitions)
- **Slow**: 350ms (complex animations)
- **Page**: 600ms (screen changes)

### Easing Curves
- **Standard**: `cubic-bezier(0.4, 0, 0.2, 1)` (Tailwind default)
- **Custom**: `cubic-bezier(0.65, 0, 0.35, 1)` (smooth deceleration)
- **Spring**: `{ type: 'spring', stiffness: 300, damping: 30 }`

### Example
```tsx
transition={{
  duration: 0.25,
  ease: [0.65, 0, 0.35, 1]
}}
```

---

## Reduced Motion Support

### CSS Implementation (Already Applied Globally)

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**No additional work needed** - This is automatically applied to all animations.

---

## Testing Checklist

### Keyboard Navigation
- [ ] Tab through entire page
- [ ] Shift+Tab moves backwards
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Focus indicators visible
- [ ] No keyboard traps

### Screen Reader (NVDA/JAWS/VoiceOver)
- [ ] All images have alt text
- [ ] All buttons have labels
- [ ] Modals announce properly
- [ ] Loading states announced
- [ ] Form errors announced

### Color Contrast
- [ ] Use WebAIM Contrast Checker
- [ ] Text: minimum 4.5:1
- [ ] UI components: minimum 3:1
- [ ] Large text (18pt+): minimum 3:1

### Touch Targets
- [ ] All buttons ≥ 44x44px
- [ ] Adequate spacing between targets
- [ ] Test on actual mobile device

### Reduced Motion
- [ ] Enable in OS settings
- [ ] Verify animations disabled
- [ ] Ensure functionality preserved

---

## Common Mistakes to Avoid

### Animation
- ❌ Don't animate `height` or `width` (causes layout thrashing)
- ❌ Don't use `margin` for movement (use `transform: translateY()`)
- ❌ Don't exceed 600ms duration (feels sluggish)
- ❌ Don't animate without `AnimatePresence` for exit animations

### Accessibility
- ❌ Don't rely on color alone to convey information
- ❌ Don't forget ARIA labels for icon-only buttons
- ❌ Don't skip keyboard testing
- ❌ Don't use `tabIndex` > 0 (breaks natural tab order)
- ❌ Don't disable focus indicators (use `:focus-visible` instead)

---

## Resources

### Tools
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **axe DevTools**: Chrome extension for automated accessibility testing
- **WAVE**: https://wave.webaim.org/
- **Lighthouse**: Built into Chrome DevTools

### Documentation
- **Framer Motion**: https://www.framer.com/motion/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Patterns**: https://www.w3.org/WAI/ARIA/apg/patterns/

### Internal Docs
- `docs/ux-design/PHASE4_ANIMATION_POLISH_REPORT.md`
- `docs/ux-design/PHASE5_ACCESSIBILITY_AUDIT_REPORT.md`
- `docs/ux-design/PHASES_4_5_IMPLEMENTATION_SUMMARY.md`

---

## Questions?

Contact the UX team or refer to the full reports in `docs/ux-design/`.
