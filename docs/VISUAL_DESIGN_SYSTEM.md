# Armchair Sleuths - Visual Design System

## Overview
A sophisticated detective aesthetic that balances mystery and approachability. Designed for Reddit Devvit with Tailwind CSS, optimized for mobile-first responsive layouts and TikTok-worthy visual moments.

---

## 1. Color System

### Primary Palette - Detective Noir Meets Modern

```css
/* Brand Identity */
--detective-crimson: #DC2626;      /* Primary CTA, danger, guilt indicator */
--detective-gold: #F59E0B;         /* Accents, clues, highlights */
--detective-navy: #1E3A8A;         /* Headers, authority, trust */
--detective-ink: #1F2937;          /* Primary text, dark elements */
--detective-fog: #F3F4F6;          /* Background, cards */
--detective-smoke: #E5E7EB;        /* Borders, dividers */

/* Semantic Colors */
--success-green: #10B981;          /* Correct answers, success states */
--warning-amber: #F59E0B;          /* Warnings, hints */
--error-red: #EF4444;              /* Errors, incorrect answers */
--info-blue: #3B82F6;              /* Information, neutral states */

/* Neutral Scale */
--neutral-50: #F9FAFB;             /* Lightest background */
--neutral-100: #F3F4F6;            /* Card backgrounds */
--neutral-200: #E5E7EB;            /* Borders */
--neutral-300: #D1D5DB;            /* Disabled text */
--neutral-400: #9CA3AF;            /* Placeholder text */
--neutral-500: #6B7280;            /* Secondary text */
--neutral-600: #4B5563;            /* Body text */
--neutral-700: #374151;            /* Headings */
--neutral-800: #1F2937;            /* Primary text */
--neutral-900: #111827;            /* Darkest text */
```

### Tailwind Class Mapping

```tsx
// Primary Actions
bg-red-600 hover:bg-red-700        // Primary CTAs
bg-amber-500 hover:bg-amber-600    // Secondary actions
bg-blue-900 hover:bg-blue-800      // Trust/authority buttons

// Backgrounds
bg-gray-50                          // Page background
bg-white                            // Card backgrounds
bg-gray-100                         // Alternate sections

// Text Colors
text-gray-900                       // Primary text
text-gray-600                       // Secondary text
text-gray-400                       // Tertiary text
text-red-600                        // Error/alert text
text-amber-600                      // Warning text
text-green-600                      // Success text

// Borders
border-gray-200                     // Default borders
border-gray-300                     // Hover borders
border-red-600                      // Active/selected
border-amber-500                    // Highlighted
```

### Color Usage Guidelines

**Primary Actions**
- Submit guess: `bg-red-600`
- Start investigation: `bg-blue-900`
- View clues: `bg-amber-500`

**Status Indicators**
- Correct: `text-green-600 bg-green-50`
- Incorrect: `text-red-600 bg-red-50`
- Pending: `text-amber-600 bg-amber-50`

**Suspect Cards**
- Default: `bg-white border-gray-200`
- Hover: `border-gray-300 shadow-md`
- Selected: `border-red-600 bg-red-50`
- Guilty (revealed): `border-red-600 bg-red-100`

---

## 2. Typography System

### Font Stack
```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Type Scale (Mobile-First)

```tsx
// Display - Hero Headlines
className="text-4xl font-bold leading-tight tracking-tight"
// Example: "Murder at the Mansion"
// Mobile: 36px/40px, Desktop: 48px/52px

// H1 - Page Titles
className="text-3xl font-bold leading-tight"
// Example: "Today's Case"
// Mobile: 30px/36px, Desktop: 36px/40px

// H2 - Section Headers
className="text-2xl font-semibold leading-snug"
// Example: "Prime Suspects", "Evidence"
// Mobile: 24px/32px, Desktop: 30px/36px

// H3 - Card Titles
className="text-xl font-semibold leading-snug"
// Example: Suspect names, "Chat History"
// Mobile: 20px/28px, Desktop: 24px/32px

// Body Large - Important body text
className="text-lg leading-relaxed"
// Example: Case description
// 18px/28px

// Body - Default text
className="text-base leading-relaxed"
// Example: Chat messages, descriptions
// 16px/24px

// Body Small - Secondary text
className="text-sm leading-normal"
// Example: Timestamps, metadata
// 14px/20px

// Caption - Tertiary text
className="text-xs leading-tight"
// Example: Hints, footnotes
// 12px/16px

// Overline - Labels
className="text-xs font-semibold uppercase tracking-wider"
// Example: "SUSPECT", "EVIDENCE", "CLUE"
// 12px/16px, letter-spacing: 0.05em
```

### Typography Hierarchy Examples

```tsx
// Case Header
<div>
  <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
    TODAY'S CASE
  </p>
  <h1 className="text-3xl font-bold text-gray-900 mt-1">
    Murder at the Mansion
  </h1>
  <p className="text-base text-gray-600 mt-2">
    A wealthy socialite found dead in the library...
  </p>
</div>

// Suspect Card
<div>
  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
    SUSPECT #1
  </p>
  <h3 className="text-xl font-semibold text-gray-900 mt-1">
    Margaret Blackwood
  </h3>
  <p className="text-sm text-gray-600 mt-1">
    The Socialite
  </p>
</div>

// Chat Message
<div>
  <p className="text-sm font-semibold text-gray-900">
    Detective
  </p>
  <p className="text-base text-gray-700 mt-1">
    Where were you at 9 PM last night?
  </p>
  <span className="text-xs text-gray-400 mt-1">
    2 minutes ago
  </span>
</div>
```

---

## 3. Spacing & Layout System

### Spacing Scale (8px Grid)

```tsx
// Extra Tight
className="gap-1"      // 4px - Icon + label spacing
className="p-1"        // 4px - Minimal padding

// Tight
className="gap-2"      // 8px - Form elements
className="p-2"        // 8px - Button padding

// Default Small
className="gap-3"      // 12px - Card internal spacing
className="p-3"        // 12px - Small cards

// Default Medium
className="gap-4"      // 16px - Section spacing
className="p-4"        // 16px - Card padding

// Large
className="gap-6"      // 24px - Section separation
className="p-6"        // 24px - Page padding

// Extra Large
className="gap-8"      // 32px - Major sections
className="p-8"        // 32px - Hero sections

// Huge
className="gap-12"     // 48px - Page sections
className="p-12"       // 48px - Spacious layouts
```

### Layout Grid

```tsx
// Container Widths
max-w-sm    // 384px - Mobile cards
max-w-md    // 448px - Forms
max-w-lg    // 512px - Chat interface
max-w-xl    // 576px - Case details
max-w-2xl   // 672px - Full width content
max-w-4xl   // 896px - Leaderboard
max-w-7xl   // 1280px - Desktop max

// Responsive Container
<div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Common Layout Patterns

```tsx
// Page Layout
<div className="min-h-screen bg-gray-50">
  <div className="max-w-2xl mx-auto px-4 py-6">
    {/* Content */}
  </div>
</div>

// Card Layout
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
  {/* Card content */}
</div>

// Grid Layout (Suspects)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

// Stack Layout (Chat)
<div className="flex flex-col gap-3">
  {/* Messages */}
</div>
```

---

## 4. Component Visual Specifications

### Suspect Cards

#### Default State
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-4
                transition-all duration-200 hover:shadow-md hover:border-gray-300">
  {/* Image */}
  <div className="aspect-square bg-gray-100 rounded-lg mb-3">
    <img src="..." className="w-full h-full object-cover rounded-lg" />
  </div>

  {/* Label */}
  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
    SUSPECT #1
  </p>

  {/* Name */}
  <h3 className="text-xl font-semibold text-gray-900 mt-1">
    Margaret Blackwood
  </h3>

  {/* Archetype */}
  <p className="text-sm text-gray-600 mt-1">
    The Socialite
  </p>

  {/* Background */}
  <p className="text-sm text-gray-700 mt-3 leading-relaxed">
    A wealthy widow with a complicated past...
  </p>

  {/* CTA */}
  <button className="w-full mt-4 px-4 py-2 bg-blue-900 text-white
                     rounded-lg font-medium hover:bg-blue-800
                     transition-colors">
    Interrogate
  </button>
</div>
```

#### Selected State
```tsx
<div className="bg-red-50 rounded-lg border-2 border-red-600 p-4
                shadow-lg">
  {/* Same content with emphasized styling */}
</div>
```

#### Compact Variant (List View)
```tsx
<div className="flex items-center gap-3 bg-white rounded-lg
                border border-gray-200 p-3 hover:border-gray-300">
  {/* Avatar */}
  <div className="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0">
    <img src="..." className="w-full h-full object-cover rounded-full" />
  </div>

  {/* Info */}
  <div className="flex-1 min-w-0">
    <p className="text-sm font-semibold text-gray-900 truncate">
      Margaret Blackwood
    </p>
    <p className="text-xs text-gray-600 truncate">
      The Socialite
    </p>
  </div>

  {/* Action */}
  <button className="text-sm font-medium text-blue-900 hover:text-blue-800">
    Talk
  </button>
</div>
```

### Chat Interface

#### Chat Bubble - User Message
```tsx
<div className="flex justify-end">
  <div className="max-w-[80%]">
    <div className="bg-blue-900 text-white rounded-2xl rounded-tr-sm
                    px-4 py-3">
      <p className="text-base leading-relaxed">
        Where were you at 9 PM last night?
      </p>
    </div>
    <p className="text-xs text-gray-400 mt-1 text-right">
      Just now
    </p>
  </div>
</div>
```

#### Chat Bubble - AI Suspect Response
```tsx
<div className="flex justify-start">
  <div className="max-w-[80%]">
    <div className="flex items-start gap-2">
      {/* Avatar */}
      <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0">
        <img src="..." className="w-full h-full object-cover rounded-full" />
      </div>

      {/* Message */}
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-1">
          Margaret Blackwood
        </p>
        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
          <p className="text-base text-gray-900 leading-relaxed">
            I was at the theater with my sister...
          </p>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          2 minutes ago
        </p>
      </div>
    </div>
  </div>
</div>
```

#### Chat Input
```tsx
<div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
  <div className="flex gap-2">
    <input
      type="text"
      placeholder="Ask a question..."
      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200
                 rounded-lg focus:outline-none focus:ring-2
                 focus:ring-blue-900 focus:border-transparent"
    />
    <button className="px-6 py-3 bg-blue-900 text-white rounded-lg
                       font-medium hover:bg-blue-800 transition-colors">
      Send
    </button>
  </div>
</div>
```

### Score Breakdown Visualization

```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6">
  {/* Header */}
  <div className="text-center mb-6">
    <h2 className="text-2xl font-bold text-gray-900">
      Case Solved!
    </h2>
    <div className="text-6xl font-bold text-amber-600 mt-2">
      850
    </div>
    <p className="text-sm text-gray-600 mt-1">
      Total Score
    </p>
  </div>

  {/* Score Breakdown */}
  <div className="space-y-4">
    {/* Suspect Identification */}
    <div className="flex items-center justify-between pb-3
                    border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg
                        flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600">
            {/* Checkmark icon */}
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Suspect Identified
          </p>
          <p className="text-xs text-gray-600">
            Correctly identified the culprit
          </p>
        </div>
      </div>
      <div className="text-lg font-bold text-green-600">
        +300
      </div>
    </div>

    {/* Evidence */}
    <div className="flex items-center justify-between pb-3
                    border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg
                        flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600">
            {/* Checkmark icon */}
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Weapon Correct
          </p>
          <p className="text-xs text-gray-600">
            Candlestick
          </p>
        </div>
      </div>
      <div className="text-lg font-bold text-green-600">
        +150
      </div>
    </div>

    {/* Location */}
    <div className="flex items-center justify-between pb-3
                    border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg
                        flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600">
            {/* Checkmark icon */}
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Location Correct
          </p>
          <p className="text-xs text-gray-600">
            Library
          </p>
        </div>
      </div>
      <div className="text-lg font-bold text-green-600">
        +150
      </div>
    </div>

    {/* Reasoning Quality */}
    <div className="flex items-center justify-between pb-3
                    border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg
                        flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600">
            {/* Star icon */}
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Excellent Reasoning
          </p>
          <p className="text-xs text-gray-600">
            Well-structured deduction
          </p>
        </div>
      </div>
      <div className="text-lg font-bold text-green-600">
        +250
      </div>
    </div>
  </div>

  {/* Time Bonus */}
  <div className="mt-6 pt-4 border-t border-gray-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="text-amber-600">
          <svg className="w-5 h-5">
            {/* Clock icon */}
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700">
          Time Bonus (Under 10 min)
        </p>
      </div>
      <div className="text-lg font-bold text-amber-600">
        +50
      </div>
    </div>
  </div>
</div>
```

### Progress Indicators

#### Linear Progress Bar
```tsx
<div className="w-full">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-gray-700">
      Investigation Progress
    </span>
    <span className="text-sm font-semibold text-blue-900">
      60%
    </span>
  </div>
  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <div className="h-full bg-gradient-to-r from-blue-900 to-blue-700
                    transition-all duration-300"
         style={{ width: '60%' }}>
    </div>
  </div>
</div>
```

#### Step Progress
```tsx
<div className="flex items-center justify-between">
  {/* Step 1 - Completed */}
  <div className="flex flex-col items-center flex-1">
    <div className="w-10 h-10 bg-green-600 rounded-full
                    flex items-center justify-center">
      <svg className="w-6 h-6 text-white">
        {/* Checkmark */}
      </svg>
    </div>
    <span className="text-xs font-medium text-gray-700 mt-2">
      Review Case
    </span>
  </div>

  {/* Connector */}
  <div className="flex-1 h-0.5 bg-blue-900 -mx-2"></div>

  {/* Step 2 - Active */}
  <div className="flex flex-col items-center flex-1">
    <div className="w-10 h-10 bg-blue-900 rounded-full
                    flex items-center justify-center">
      <span className="text-white font-bold">2</span>
    </div>
    <span className="text-xs font-medium text-blue-900 mt-2">
      Interrogate
    </span>
  </div>

  {/* Connector */}
  <div className="flex-1 h-0.5 bg-gray-200 -mx-2"></div>

  {/* Step 3 - Upcoming */}
  <div className="flex flex-col items-center flex-1">
    <div className="w-10 h-10 bg-gray-200 rounded-full
                    flex items-center justify-center">
      <span className="text-gray-500 font-bold">3</span>
    </div>
    <span className="text-xs font-medium text-gray-500 mt-2">
      Submit
    </span>
  </div>
</div>
```

#### Loading Spinner
```tsx
<div className="flex items-center justify-center py-8">
  <div className="w-12 h-12 border-4 border-gray-200
                  border-t-blue-900 rounded-full animate-spin">
  </div>
</div>
```

### Buttons

#### Primary Button (CTA)
```tsx
<button className="px-6 py-3 bg-red-600 text-white rounded-lg
                   font-semibold hover:bg-red-700 active:bg-red-800
                   transition-colors shadow-sm hover:shadow-md
                   disabled:bg-gray-300 disabled:cursor-not-allowed">
  Submit Guess
</button>
```

#### Secondary Button
```tsx
<button className="px-6 py-3 bg-white text-gray-900 rounded-lg
                   font-medium border border-gray-300
                   hover:bg-gray-50 hover:border-gray-400
                   transition-colors">
  View Evidence
</button>
```

#### Ghost Button
```tsx
<button className="px-4 py-2 text-blue-900 font-medium
                   hover:bg-blue-50 rounded-lg transition-colors">
  Skip
</button>
```

#### Icon Button
```tsx
<button className="w-10 h-10 flex items-center justify-center
                   rounded-lg hover:bg-gray-100 transition-colors">
  <svg className="w-5 h-5 text-gray-700">
    {/* Icon */}
  </svg>
</button>
```

### Form Elements

#### Text Input
```tsx
<div className="w-full">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Question
  </label>
  <input
    type="text"
    placeholder="Type your question..."
    className="w-full px-4 py-3 bg-white border border-gray-300
               rounded-lg focus:outline-none focus:ring-2
               focus:ring-blue-900 focus:border-transparent
               placeholder:text-gray-400"
  />
</div>
```

#### Text Area
```tsx
<div className="w-full">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Your Deduction
  </label>
  <textarea
    rows={4}
    placeholder="Explain your reasoning..."
    className="w-full px-4 py-3 bg-white border border-gray-300
               rounded-lg focus:outline-none focus:ring-2
               focus:ring-blue-900 focus:border-transparent
               placeholder:text-gray-400 resize-none"
  />
</div>
```

#### Radio Button Group
```tsx
<div className="space-y-2">
  <label className="flex items-center gap-3 p-3 bg-white
                    border border-gray-200 rounded-lg cursor-pointer
                    hover:border-gray-300 has-[:checked]:border-red-600
                    has-[:checked]:bg-red-50">
    <input
      type="radio"
      name="suspect"
      className="w-5 h-5 text-red-600 border-gray-300
                 focus:ring-2 focus:ring-red-600"
    />
    <div className="flex-1">
      <p className="text-sm font-semibold text-gray-900">
        Margaret Blackwood
      </p>
      <p className="text-xs text-gray-600">
        The Socialite
      </p>
    </div>
  </label>
</div>
```

### Alerts & Toasts

#### Success Alert
```tsx
<div className="bg-green-50 border border-green-200 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <div className="w-5 h-5 text-green-600 flex-shrink-0">
      <svg>{/* Checkmark icon */}</svg>
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-green-900">
        Success!
      </p>
      <p className="text-sm text-green-700 mt-1">
        Your answer has been submitted successfully.
      </p>
    </div>
  </div>
</div>
```

#### Error Alert
```tsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <div className="w-5 h-5 text-red-600 flex-shrink-0">
      <svg>{/* X icon */}</svg>
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-red-900">
        Error
      </p>
      <p className="text-sm text-red-700 mt-1">
        Please select a suspect before submitting.
      </p>
    </div>
  </div>
</div>
```

#### Info Toast
```tsx
<div className="fixed bottom-4 right-4 bg-white shadow-lg
                border border-gray-200 rounded-lg p-4
                max-w-sm animate-slide-up">
  <div className="flex items-start gap-3">
    <div className="w-5 h-5 text-blue-600 flex-shrink-0">
      <svg>{/* Info icon */}</svg>
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-gray-900">
        New clue discovered!
      </p>
      <p className="text-sm text-gray-600 mt-1">
        Check the evidence board.
      </p>
    </div>
    <button className="text-gray-400 hover:text-gray-600">
      <svg className="w-4 h-4">{/* X icon */}</svg>
    </button>
  </div>
</div>
```

### Badges

```tsx
// Status Badge
<span className="inline-flex items-center px-2.5 py-0.5
                 rounded-full text-xs font-medium
                 bg-green-100 text-green-800">
  Solved
</span>

// Count Badge
<span className="inline-flex items-center justify-center
                 w-5 h-5 rounded-full text-xs font-bold
                 bg-red-600 text-white">
  3
</span>

// Pill Badge
<span className="inline-flex items-center px-3 py-1
                 rounded-full text-xs font-semibold
                 bg-amber-100 text-amber-800">
  NEW
</span>
```

---

## 5. Micro-Interactions & State Indicators

### Hover Effects

```tsx
// Card Hover - Lift & Shadow
className="transition-all duration-200
           hover:shadow-lg hover:-translate-y-1"

// Button Hover - Darken
className="transition-colors duration-150
           hover:bg-red-700"

// Link Hover - Underline
className="underline-offset-4 hover:underline"
```

### Active States

```tsx
// Button Active - Scale Down
className="active:scale-95 transition-transform"

// Card Active - Border Emphasis
className="border-2 border-red-600 bg-red-50"

// Input Focus - Ring
className="focus:ring-2 focus:ring-blue-900
           focus:border-transparent"
```

### Loading States

```tsx
// Skeleton Card
<div className="bg-white rounded-lg border border-gray-200 p-4">
  <div className="animate-pulse space-y-3">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
</div>

// Shimmer Effect
<div className="relative overflow-hidden bg-gray-200 rounded">
  <div className="absolute inset-0 -translate-x-full
                  bg-gradient-to-r from-gray-200
                  via-white to-gray-200
                  animate-shimmer">
  </div>
</div>
```

### Disabled States

```tsx
className="disabled:opacity-50 disabled:cursor-not-allowed"
```

### Animations

```tsx
// Fade In
className="animate-fade-in"

// Slide Up
className="animate-slide-up"

// Pulse (Attention)
className="animate-pulse"

// Bounce (Notification)
className="animate-bounce"
```

#### Custom Animation Classes (Add to tailwind.config.js)

```js
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
}
```

---

## 6. Screen-Specific Visual Hierarchy

### Home Screen (Case Overview)

```tsx
<div className="min-h-screen bg-gray-50">
  {/* Header */}
  <div className="bg-gradient-to-r from-blue-900 to-blue-800
                  text-white px-4 py-6">
    <div className="max-w-2xl mx-auto">
      <p className="text-xs font-semibold uppercase tracking-wider
                     text-blue-200">
        TODAY'S CASE
      </p>
      <h1 className="text-3xl font-bold mt-1">
        Murder at the Mansion
      </h1>
      <p className="text-base text-blue-100 mt-2">
        October 15, 2025
      </p>
    </div>
  </div>

  {/* Case Image */}
  <div className="max-w-2xl mx-auto px-4 -mt-12">
    <div className="aspect-video bg-white rounded-lg shadow-lg
                    overflow-hidden">
      <img src="..." className="w-full h-full object-cover" />
    </div>
  </div>

  {/* Case Details */}
  <div className="max-w-2xl mx-auto px-4 py-6">
    <div className="bg-white rounded-lg shadow-sm border
                    border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Case Details
      </h2>
      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="text-red-600">
            <svg className="w-5 h-5">{/* Icon */}</svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              Victim
            </p>
            <p className="text-base text-gray-900">
              Lord Archibald Blackwood
            </p>
          </div>
        </div>
        {/* More details... */}
      </div>

      <button className="w-full mt-6 px-6 py-3 bg-red-600
                         text-white rounded-lg font-semibold
                         hover:bg-red-700 transition-colors">
        Start Investigation
      </button>
    </div>
  </div>
</div>
```

### Suspects Screen

```tsx
<div className="min-h-screen bg-gray-50">
  {/* Header */}
  <div className="bg-white border-b border-gray-200 px-4 py-4
                  sticky top-0 z-10">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">
        Prime Suspects
      </h1>
      <p className="text-sm text-gray-600 mt-1">
        Select a suspect to interrogate
      </p>
    </div>
  </div>

  {/* Suspect Grid */}
  <div className="max-w-4xl mx-auto px-4 py-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                    gap-4">
      {/* Suspect cards... */}
    </div>
  </div>
</div>
```

### Chat Screen

```tsx
<div className="flex flex-col h-screen bg-gray-50">
  {/* Header */}
  <div className="bg-white border-b border-gray-200 px-4 py-3">
    <div className="flex items-center gap-3">
      <button className="w-8 h-8 flex items-center justify-center
                         rounded-lg hover:bg-gray-100">
        <svg className="w-5 h-5">{/* Back arrow */}</svg>
      </button>
      <div className="w-10 h-10 bg-gray-100 rounded-full">
        <img src="..." className="w-full h-full object-cover
                                  rounded-full" />
      </div>
      <div className="flex-1">
        <h2 className="text-base font-semibold text-gray-900">
          Margaret Blackwood
        </h2>
        <p className="text-xs text-gray-600">
          The Socialite
        </p>
      </div>
    </div>
  </div>

  {/* Messages */}
  <div className="flex-1 overflow-y-auto px-4 py-6">
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Chat bubbles... */}
    </div>
  </div>

  {/* Input */}
  <div className="bg-white border-t border-gray-200 px-4 py-4">
    <div className="max-w-2xl mx-auto flex gap-2">
      {/* Input field... */}
    </div>
  </div>
</div>
```

### Submission Screen

```tsx
<div className="min-h-screen bg-gray-50">
  <div className="max-w-xl mx-auto px-4 py-6">
    {/* Header */}
    <h1 className="text-2xl font-bold text-gray-900">
      Submit Your Deduction
    </h1>
    <p className="text-base text-gray-600 mt-2">
      Review your theory before submitting
    </p>

    {/* Form */}
    <div className="mt-6 space-y-6">
      {/* Suspect Selection */}
      <div className="bg-white rounded-lg border border-gray-200
                      p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Who is guilty?
        </h2>
        <div className="mt-4 space-y-2">
          {/* Radio options... */}
        </div>
      </div>

      {/* Reasoning */}
      <div className="bg-white rounded-lg border border-gray-200
                      p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Your Reasoning
        </h2>
        <textarea
          className="w-full mt-4 px-4 py-3 bg-gray-50
                     border border-gray-200 rounded-lg"
          rows={6}
          placeholder="Explain your deduction..."
        />
      </div>

      {/* Submit Button */}
      <button className="w-full px-6 py-4 bg-red-600 text-white
                         rounded-lg font-bold text-lg
                         hover:bg-red-700 transition-colors
                         shadow-lg hover:shadow-xl">
        Submit Final Answer
      </button>
    </div>
  </div>
</div>
```

### Results Screen

```tsx
<div className="min-h-screen bg-gradient-to-br
                from-green-50 to-blue-50">
  <div className="max-w-xl mx-auto px-4 py-12">
    {/* Success Header */}
    <div className="text-center">
      <div className="w-20 h-20 bg-green-600 rounded-full
                      mx-auto flex items-center justify-center">
        <svg className="w-12 h-12 text-white">
          {/* Trophy icon */}
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mt-6">
        Case Solved!
      </h1>
      <p className="text-lg text-gray-600 mt-2">
        You cracked the case with flying colors
      </p>
    </div>

    {/* Score Card */}
    <div className="mt-8">
      {/* Score breakdown component... */}
    </div>

    {/* Leaderboard Preview */}
    <div className="mt-8 bg-white rounded-lg border
                    border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Your Rank
      </h2>
      <div className="mt-4 flex items-center justify-between
                      p-4 bg-amber-50 rounded-lg border
                      border-amber-200">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-amber-600">
            #12
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              u/detective_smith
            </p>
            <p className="text-xs text-gray-600">
              You're in the top 15%
            </p>
          </div>
        </div>
        <div className="text-xl font-bold text-gray-900">
          850
        </div>
      </div>
    </div>

    {/* Actions */}
    <div className="mt-8 flex gap-3">
      <button className="flex-1 px-6 py-3 bg-blue-900 text-white
                         rounded-lg font-semibold hover:bg-blue-800">
        View Leaderboard
      </button>
      <button className="px-6 py-3 bg-white text-gray-900
                         rounded-lg font-medium border
                         border-gray-300 hover:bg-gray-50">
        Share
      </button>
    </div>
  </div>
</div>
```

---

## 7. Responsive Breakpoints

```tsx
// Tailwind Breakpoints
sm: 640px   // Small tablets
md: 768px   // Tablets
lg: 1024px  // Small laptops
xl: 1280px  // Desktops
2xl: 1536px // Large desktops

// Common Responsive Patterns

// Mobile-first card grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive padding
<div className="px-4 sm:px-6 lg:px-8">

// Responsive text size
<h1 className="text-2xl sm:text-3xl lg:text-4xl">

// Show/hide elements
<div className="hidden sm:block">  // Show on tablet+
<div className="sm:hidden">        // Show on mobile only

// Responsive flex direction
<div className="flex flex-col sm:flex-row gap-4">
```

---

## 8. Accessibility Guidelines

### Color Contrast
- All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Primary text on white: `text-gray-900` (19.8:1)
- Secondary text on white: `text-gray-600` (7.2:1)
- White text on blue-900: `bg-blue-900 text-white` (11.4:1)
- White text on red-600: `bg-red-600 text-white` (7.8:1)

### Focus States
```tsx
// Always include visible focus states
className="focus:outline-none focus:ring-2 focus:ring-blue-900
           focus:ring-offset-2"
```

### Interactive Elements
```tsx
// Minimum touch target: 44x44px
className="min-h-[44px] min-w-[44px]"

// Clear hover states
className="hover:bg-gray-100"
```

### Semantic HTML
```tsx
// Use proper heading hierarchy
<h1>, <h2>, <h3>

// Use button for actions
<button> not <div onClick>

// Use proper labels
<label htmlFor="input-id">
```

---

## 9. TikTok-Worthy Moments

### Shareable Screenshots

**Case Reveal**
```tsx
// Design for 9:16 aspect ratio
<div className="aspect-[9/16] bg-gradient-to-br
                from-red-900 to-red-700 p-8
                flex flex-col justify-center items-center">
  <h1 className="text-5xl font-bold text-white text-center">
    CASE SOLVED!
  </h1>
  <div className="text-8xl font-bold text-amber-400 mt-6">
    950
  </div>
  <p className="text-xl text-white mt-4">
    Top 5% Detective
  </p>
</div>
```

**Dramatic Reveal**
```tsx
<div className="bg-black p-8 text-center">
  <p className="text-sm text-red-600 uppercase tracking-wider">
    The Killer Was...
  </p>
  <h2 className="text-4xl font-bold text-white mt-4">
    Margaret Blackwood
  </h2>
  <p className="text-lg text-gray-400 mt-2">
    The Socialite
  </p>
</div>
```

---

## 10. Implementation Checklist

### Per Component
- [ ] Default state
- [ ] Hover state
- [ ] Active/pressed state
- [ ] Focus state (keyboard navigation)
- [ ] Disabled state
- [ ] Loading state
- [ ] Error state
- [ ] Empty state
- [ ] Success state
- [ ] Dark mode variant (future)

### Per Screen
- [ ] Mobile layout (320px+)
- [ ] Tablet layout (640px+)
- [ ] Desktop layout (1024px+)
- [ ] Loading skeleton
- [ ] Error boundary
- [ ] Empty state
- [ ] Accessibility audit
- [ ] Performance check

---

## 11. Quick Reference

### Most Used Classes

```tsx
// Containers
"max-w-2xl mx-auto px-4 py-6"

// Cards
"bg-white rounded-lg border border-gray-200 p-4 shadow-sm"

// Buttons
"px-6 py-3 bg-red-600 text-white rounded-lg font-semibold
 hover:bg-red-700 transition-colors"

// Text
"text-base text-gray-900"

// Headings
"text-2xl font-bold text-gray-900"

// Spacing
"space-y-4"  // Vertical stack
"gap-4"      // Grid/flex gap

// Hover
"hover:shadow-md hover:border-gray-300 transition-all"
```

### Design Tokens Summary

```
Colors: red-600, blue-900, amber-500, gray-50 to gray-900
Text: xs, sm, base, lg, xl, 2xl, 3xl
Spacing: 1 (4px), 2 (8px), 3 (12px), 4 (16px), 6 (24px), 8 (32px)
Rounded: rounded-lg (8px), rounded-full
Shadows: shadow-sm, shadow-md, shadow-lg
```

---

## Implementation Priority

1. **Week 1**: Color system, typography, basic components (buttons, cards)
2. **Week 2**: Suspect cards, chat interface, forms
3. **Week 3**: Progress indicators, score visualization, responsive layouts
4. **Week 4**: Micro-interactions, animations, polish

---

## Support Resources

- Tailwind CSS Docs: https://tailwindcss.com/docs
- Heroicons: https://heroicons.com/
- Color Contrast Checker: https://webaim.org/resources/contrastchecker/
- Responsive Design Checker: Chrome DevTools Device Mode

---

**Design Philosophy**: Beautiful within constraints. Every pixel serves the mystery. Every interaction advances the investigation. Visual delight without sacrificing development velocity.
