# Design System

Complete design system for Armchair Sleuths detective game with noir aesthetic.

## Color Palette

### Noir Base Colors
```typescript
noir: {
  deepBlack: '#0a0a0a',     // Primary background
  charcoal: '#1a1a1a',      // Card backgrounds
  gunmetal: '#2a2a2a',      // Elevated surfaces
  smoke: '#3a3a3a',         // Hover states
  fog: '#4a4a4a'            // Borders
}
```

**Usage**:
- `noir-deepBlack` - Page backgrounds
- `noir-charcoal` - Card/modal backgrounds
- `noir-gunmetal` - Elevated components, hover states
- `noir-fog` - Border colors

### Detective Accent Colors
```typescript
detective: {
  gold: '#c9b037',       // Primary accent (buttons, highlights)
  brass: '#b5a642',      // Secondary accent (tags, labels)
  amber: '#d4af37'       // Hover/active states
}
```

**Usage**:
- `detective-gold` - Primary buttons, headers, important text
- `detective-brass` - Badges, secondary elements
- `detective-amber` - Button hover, active states

### Evidence Colors
```typescript
evidence: {
  blood: '#8b0000',      // Critical evidence, errors
  poison: '#4b0082',     // Mysterious evidence
  clue: '#1e90ff'        // Discovery, information
}
```

**Usage**:
- `evidence-blood` - Error states, critical evidence tags
- `evidence-poison` - Mysterious or suspicious elements
- `evidence-clue` - Information, helpful hints

### Text Colors
```typescript
text: {
  primary: '#e0e0e0',    // Primary readable text
  secondary: '#a0a0a0',  // Secondary text, descriptions
  muted: '#707070',      // Disabled, placeholder text
  inverse: '#0a0a0a'     // Text on light backgrounds
}
```

### UI State Colors
```typescript
background: {
  primary: '#0a0a0a',          // Page background
  secondary: '#1a1a1a',        // Section backgrounds
  elevated: '#2a2a2a',         // Cards, modals
  overlay: 'rgba(10, 10, 10, 0.95)'  // Modal backdrops
}

border: {
  default: '#3a3a3a',          // Standard borders
  focus: '#c9b037',            // Focus indicators
  error: '#8b0000'             // Error borders
}
```

---

## Typography

### Font Families
```typescript
fonts: {
  display: '"Playfair Display", serif',   // Headlines, case titles
  body: '"Inter", sans-serif',             // Main text, UI
  mono: '"JetBrains Mono", monospace'      // Evidence, code-like text
}
```

**Usage**:
- `font-display` - Case titles, screen headers, dramatic text
- `font-body` - Body text, descriptions, UI elements
- `font-mono` - Evidence IDs, technical info, timestamps

### Font Sizes
```typescript
sizes: {
  xs: '0.75rem',      // 12px - Small labels, metadata
  sm: '0.875rem',     // 14px - Secondary text
  base: '1rem',       // 16px - Body text
  lg: '1.125rem',     // 18px - Emphasized text
  xl: '1.25rem',      // 20px - Subtitles
  '2xl': '1.5rem',    // 24px - Section headers
  '3xl': '1.875rem',  // 30px - Screen titles
  '4xl': '2.25rem',   // 36px - Hero text
  '5xl': '3rem'       // 48px - Display text
}
```

**Scale Application**:
```css
/* Small labels (evidence tags, badges) */
.text-xs

/* Secondary text (descriptions) */
.text-sm

/* Body text (paragraphs, chat messages) */
.text-base

/* Emphasized text (suspect names) */
.text-lg

/* Subtitles (card titles) */
.text-xl

/* Section headers (Investigation, Results) */
.text-2xl

/* Screen titles (Case Overview) */
.text-3xl

/* Hero text (Results rank) */
.text-4xl

/* Display text (Loading screen) */
.text-5xl
```

### Font Weights
```typescript
weights: {
  light: 300,         // Subtle text
  normal: 400,        // Body text
  medium: 500,        // Emphasis
  semibold: 600,      // Subheadings
  bold: 700           // Headers, buttons
}
```

### Line Heights
```typescript
lineHeights: {
  tight: 1.2,         // Headlines
  base: 1.5,          // Body text
  relaxed: 1.75       // Long-form text
}
```

---

## Spacing Scale

**Base Unit**: 4px (0.25rem)

```typescript
spacing: {
  0: '0',
  1: '0.25rem',   // 4px  - Tight spacing
  2: '0.5rem',    // 8px  - Small gaps
  3: '0.75rem',   // 12px - Compact spacing
  4: '1rem',      // 16px - Standard spacing
  5: '1.25rem',   // 20px - Medium spacing
  6: '1.5rem',    // 24px - Large spacing
  8: '2rem',      // 32px - Section spacing
  10: '2.5rem',   // 40px - Large sections
  12: '3rem',     // 48px - Major sections
  16: '4rem',     // 64px - Screen padding
  20: '5rem',     // 80px - Hero spacing
  24: '6rem'      // 96px - Maximum spacing
}
```

**Common Patterns**:
```css
/* Card padding */
.p-6          /* 24px all sides */

/* Button padding */
.px-6 .py-2   /* 24px horizontal, 8px vertical */

/* Section gaps */
.gap-4        /* 16px between items */

/* Screen margins */
.mx-4 .my-8   /* 16px horizontal, 32px vertical */
```

---

## Border Radius

```typescript
borderRadius: {
  none: '0',
  sm: '0.125rem',   // 2px  - Subtle rounding
  base: '0.25rem',  // 4px  - Standard buttons
  md: '0.375rem',   // 6px  - Inputs
  lg: '0.5rem',     // 8px  - Cards
  xl: '0.75rem',    // 12px - Modals
  '2xl': '1rem',    // 16px - Large cards
  full: '9999px'    // Pills, circles
}
```

**Usage**:
- `rounded-base` - Buttons
- `rounded-lg` - Cards, evidence items
- `rounded-xl` - Modals, large containers
- `rounded-full` - Avatar images, badges

---

## Shadows

```typescript
shadows: {
  sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
  base: '0 2px 4px rgba(0, 0, 0, 0.6)',
  md: '0 4px 8px rgba(0, 0, 0, 0.7)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.8)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.9)',
  glow: '0 0 20px rgba(201, 176, 55, 0.3)'  // Detective gold glow
}
```

**Usage**:
- `shadow-base` - Default cards
- `shadow-md` - Elevated cards, dropdowns
- `shadow-lg` - Modals, important components
- `shadow-glow` - Interactive elements (hover), focus states

---

## Animations & Transitions

### Timing Functions
```typescript
transitions: {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  pageTransition: '600ms cubic-bezier(0.65, 0, 0.35, 1)'
}
```

**Easing Curves**:
- `ease-in-out` - `cubic-bezier(0.4, 0, 0.2, 1)` - Smooth start and end
- `ease-dramatic` - `cubic-bezier(0.65, 0, 0.35, 1)` - Detective theme, page transitions

### Common Animations

#### Fade In
```typescript
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.3 }}
```

#### Slide Up
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
```

#### Scale Pop
```typescript
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.3 }}
```

#### Stagger Children
```typescript
variants={{
  container: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }
}}
```

### Hover Animations
```typescript
// Card lift
whileHover={{ y: -4, scale: 1.02 }}
transition={{ duration: 0.2 }}

// Button press
whileTap={{ scale: 0.98 }}

// Glow effect
hover:shadow-glow
```

---

## Component-Specific Styles

### Buttons

#### Primary Button (Detective Gold)
```css
.btn-primary {
  @apply px-6 py-2
         bg-detective-gold hover:bg-detective-amber
         text-noir-deepBlack
         font-semibold
         rounded-lg
         transition-all duration-200
         hover:shadow-glow
         focus:outline-none focus:ring-2 focus:ring-detective-gold;
}
```

#### Secondary Button (Outlined)
```css
.btn-secondary {
  @apply px-6 py-2
         border-2 border-detective-gold
         text-detective-gold
         hover:bg-detective-gold hover:text-noir-deepBlack
         font-semibold
         rounded-lg
         transition-all duration-200;
}
```

#### Ghost Button (Subtle)
```css
.btn-ghost {
  @apply px-4 py-2
         text-text-muted hover:text-text-primary
         hover:bg-noir-gunmetal
         rounded-lg
         transition-colors duration-200;
}
```

### Cards

#### Standard Card
```css
.card {
  @apply bg-noir-charcoal
         border-2 border-noir-fog
         hover:border-detective-brass
         rounded-lg
         p-6
         shadow-base
         transition-all duration-200;
}
```

#### Elevated Card (Modal)
```css
.card-elevated {
  @apply bg-noir-charcoal
         border-2 border-detective-gold
         rounded-xl
         p-6
         shadow-xl
         shadow-glow;
}
```

### Inputs

#### Text Input
```css
.input {
  @apply w-full
         px-4 py-2
         bg-noir-gunmetal
         border-2 border-noir-fog
         focus:border-detective-gold
         text-text-primary
         rounded-md
         transition-colors duration-200
         focus:outline-none focus:ring-2 focus:ring-detective-gold/50;
}
```

#### Textarea
```css
.textarea {
  @apply w-full
         px-4 py-3
         bg-noir-gunmetal
         border-2 border-noir-fog
         focus:border-detective-gold
         text-text-primary
         rounded-md
         min-h-32
         resize-vertical
         transition-colors duration-200
         focus:outline-none focus:ring-2 focus:ring-detective-gold/50;
}
```

### Badges

#### Default Badge
```css
.badge {
  @apply inline-flex items-center
         px-2 py-1
         bg-noir-gunmetal
         border border-noir-fog
         text-text-secondary
         text-xs font-medium
         rounded-full;
}
```

#### Detective Badge (Accent)
```css
.badge-detective {
  @apply inline-flex items-center
         px-2 py-1
         bg-detective-gold/20
         border border-detective-brass
         text-detective-gold
         text-xs font-semibold
         rounded-full;
}
```

### Loading States

#### Skeleton
```css
.skeleton {
  @apply animate-pulse
         bg-noir-gunmetal
         rounded;
}
```

#### Spinner
```css
.spinner {
  @apply animate-spin
         border-4 border-noir-fog border-t-detective-gold
         rounded-full;
}
```

---

## Responsive Design

### Breakpoints
```typescript
breakpoints: {
  sm: '640px',     // Mobile landscape
  md: '768px',     // Tablet portrait
  lg: '1024px',    // Desktop
  xl: '1280px',    // Large desktop
  '2xl': '1536px'  // Extra large
}
```

### Mobile-First Approach
```css
/* Base: Mobile (320px+) */
.container {
  @apply px-4 py-8;
}

/* Tablet (768px+) */
@screen md {
  .container {
    @apply px-6 py-12;
  }
}

/* Desktop (1024px+) */
@screen lg {
  .container {
    @apply px-8 py-16;
  }
}
```

### Common Responsive Patterns
```css
/* Responsive Grid */
.grid-responsive {
  @apply grid
         grid-cols-1
         sm:grid-cols-2
         lg:grid-cols-3
         gap-4;
}

/* Responsive Typography */
.heading-responsive {
  @apply text-2xl
         sm:text-3xl
         lg:text-4xl;
}

/* Responsive Padding */
.section-responsive {
  @apply px-4 py-8
         sm:px-6 sm:py-12
         lg:px-8 lg:py-16;
}
```

---

## Dark Mode (Default)

The game uses a noir detective theme with dark mode as the default and only theme.

**Do not implement** light mode or theme switching. The design is optimized for:
- High contrast on dark backgrounds
- Gold accents for detective atmosphere
- Readability in low-light environments
- Cinematic noir aesthetic

---

## Accessibility

### Color Contrast
- Text on dark background: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

**Compliant Combinations**:
- ✅ `text-primary` (#e0e0e0) on `bg-noir-deepBlack` (#0a0a0a) - 12.6:1
- ✅ `text-secondary` (#a0a0a0) on `bg-noir-deepBlack` (#0a0a0a) - 7.2:1
- ✅ `text-detective-gold` (#c9b037) on `bg-noir-deepBlack` (#0a0a0a) - 6.8:1

### Focus Indicators
```css
.focus-visible {
  @apply outline-none
         ring-2 ring-detective-gold ring-offset-2 ring-offset-noir-deepBlack;
}
```

### Touch Targets
- Minimum size: 44x44px
- Adequate spacing: 8px between targets

---

## Usage Examples

### Page Layout
```tsx
<div className="min-h-screen bg-noir-deepBlack text-text-primary">
  <header className="px-4 py-6 border-b border-noir-fog">
    <h1 className="text-3xl font-display font-bold text-detective-gold">
      Armchair Sleuths
    </h1>
  </header>

  <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
    {/* Content */}
  </main>
</div>
```

### Card Component
```tsx
<div className="
  bg-noir-charcoal
  border-2 border-noir-fog
  hover:border-detective-brass
  rounded-lg
  p-6
  shadow-base
  transition-all duration-200
  hover:shadow-md
">
  <h2 className="text-xl font-semibold text-detective-gold mb-2">
    Evidence
  </h2>
  <p className="text-text-secondary">
    Details about the evidence...
  </p>
</div>
```

### Button Group
```tsx
<div className="flex gap-4">
  <button className="
    px-6 py-2
    bg-detective-gold hover:bg-detective-amber
    text-noir-deepBlack
    font-semibold
    rounded-lg
    transition-all duration-200
    hover:shadow-glow
  ">
    Primary Action
  </button>

  <button className="
    px-6 py-2
    border-2 border-detective-gold
    text-detective-gold
    hover:bg-detective-gold hover:text-noir-deepBlack
    font-semibold
    rounded-lg
    transition-all duration-200
  ">
    Secondary Action
  </button>
</div>
```

---

## Tailwind Configuration

Complete Tailwind config available at `assets/design-tokens/tailwind.config.js`.

Quick setup:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        noir: { /* ... */ },
        detective: { /* ... */ },
        evidence: { /* ... */ },
        text: { /* ... */ }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
      // ... (rest of config)
    }
  }
}
```
