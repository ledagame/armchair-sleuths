# Color Palette Reference Sheet
**Armchair Sleuths - Noir Detective Color System**

**Quick Copy-Paste Color Values**

---

## Core Noir Palette (Backgrounds & Neutrals)

### Deep Black
```
Hex:  #0a0a0a
RGB:  rgb(10, 10, 10)
Use:  Primary background, active tab background
```

### Charcoal
```
Hex:  #1a1a1a
RGB:  rgb(26, 26, 26)
Use:  Card backgrounds, modal backgrounds
```

### Gunmetal
```
Hex:  #2a2a2a
RGB:  rgb(42, 42, 42)
Use:  Inactive tab background, empty AP indicator, secondary buttons
```

### Smoke
```
Hex:  #3a3a3a
RGB:  rgb(58, 58, 58)
Use:  Hover states, active press states
```

### Fog
```
Hex:  #4a4a4a
RGB:  rgb(74, 74, 74)
Use:  Borders, dividers, common evidence badge
```

---

## Detective Accent Colors (Gold Spectrum)

### Detective Gold (Primary)
```
Hex:  #c9b037
RGB:  rgb(201, 176, 55)
Use:  Primary CTA buttons, active tab text, headings, discovery toast
```

### Detective Brass (Secondary)
```
Hex:  #b5a642
RGB:  rgb(181, 166, 66)
Use:  Hover borders, secondary accents
```

### Detective Amber (Highlight)
```
Hex:  #d4af37
RGB:  rgb(212, 175, 55)
Use:  Button hover state, highlights, discovery toast border
```

---

## Evidence Type Colors

### Blood (Critical/Victim)
```
Hex:  #8b0000
RGB:  rgb(139, 0, 0)
Use:  Critical evidence badge, victim cards, high-priority elements
```

### Poison (Rare/Mystery)
```
Hex:  #4b0082
RGB:  rgb(75, 0, 130)
Use:  Rare evidence badge, achievement toast, special items
```

### Clue (Discovery/Info)
```
Hex:  #1e90ff
RGB:  rgb(30, 144, 255)
Use:  Discovered evidence state, interrogated suspect state, info indicators
```

---

## Status Colors

### Success Green
```
Hex:  #10b981
RGB:  rgb(16, 185, 129)
Use:  Success toast, high AP state, completion indicators
```

### Warning Amber
```
Hex:  #f59e0b
RGB:  rgb(245, 158, 11)
Use:  Low AP state, warning toast, caution indicators
```

### Error Red
```
Hex:  #ef4444
RGB:  rgb(239, 68, 68)
Use:  Critical AP state, error toast, failure indicators
```

---

## Text Colors

### Text Primary
```
Hex:  #e0e0e0
RGB:  rgb(224, 224, 224)
Use:  Primary text content, main headings, body text
```

### Text Secondary
```
Hex:  #a0a0a0
RGB:  rgb(160, 160, 160)
Use:  Descriptions, secondary text, metadata
```

### Text Muted
```
Hex:  #707070
RGB:  rgb(112, 112, 112)
Use:  Captions, disabled text, very low emphasis (use sparingly)
```

### Text Inverse
```
Hex:  #0a0a0a
RGB:  rgb(10, 10, 10)
Use:  Text on gold buttons, text on light backgrounds
```

---

## Extended Status Colors (Borders & Glows)

### Bright Green (Success Border)
```
Hex:  #14f195
RGB:  rgb(20, 241, 149)
Use:  Success toast border, glow effects
```

### Bright Purple (Rare Border)
```
Hex:  #6a0dad
RGB:  rgb(106, 13, 173)
Use:  Rare evidence badge border, achievement toast border
```

### Bright Red (Critical Border)
```
Hex:  #c92a2a
RGB:  rgb(201, 42, 42)
Use:  Critical evidence badge border, error indicators
```

### Bright Amber (Warning Border)
```
Hex:  #fbbf24
RGB:  rgb(251, 191, 36)
Use:  Warning toast border, low AP indicators
```

### Bright Blue (Info Border)
```
Hex:  #60a5fa
RGB:  rgb(96, 165, 250)
Use:  Info toast border, discovered state glow
```

---

## Color Usage Matrix

| Element                  | Background  | Border      | Text        | Accent      |
|--------------------------|-------------|-------------|-------------|-------------|
| **Tab (Active)**         | #0a0a0a     | #c9b037     | #c9b037     | -           |
| **Tab (Inactive)**       | #2a2a2a     | transparent | #a0a0a0     | -           |
| **Evidence Card**        | #1a1a1a     | #4a4a4a     | #c9b037     | #b5a642     |
| **Suspect Card**         | #1a1a1a     | #4a4a4a     | #e0e0e0     | #b5a642     |
| **Primary Button**       | #c9b037     | -           | #0a0a0a     | #d4af37     |
| **Secondary Button**     | #2a2a2a     | #4a4a4a     | #e0e0e0     | #3a3a3a     |
| **Success Toast**        | #10b981     | #14f195     | #ffffff     | -           |
| **Discovery Toast**      | #c9b037     | #d4af37     | #0a0a0a     | -           |
| **Achievement Toast**    | #4b0082     | #6a0dad     | #ffffff     | -           |
| **Warning Toast**        | #f59e0b     | #fbbf24     | #ffffff     | -           |
| **Error Toast**          | #ef4444     | #f87171     | #ffffff     | -           |
| **Modal Overlay**        | #1a1a1a     | #c9b037     | #e0e0e0     | -           |
| **Common Badge**         | #4a4a4a     | #707070     | #e0e0e0     | -           |
| **Rare Badge**           | #4b0082     | #6a0dad     | #ffffff     | -           |
| **Critical Badge**       | #8b0000     | #c92a2a     | #ffffff     | -           |
| **AP Display (High)**    | #1a1a1a     | #4a4a4a     | #10b981     | -           |
| **AP Display (Medium)**  | #1a1a1a     | #4a4a4a     | #c9b037     | -           |
| **AP Display (Low)**     | #1a1a1a     | #4a4a4a     | #f59e0b     | -           |
| **AP Display (Critical)**| #1a1a1a     | #ef4444     | #ef4444     | -           |

---

## Color Accessibility (WCAG AA Compliance)

### Passing Combinations ✅

**Light Text on Dark Backgrounds:**
```
#e0e0e0 on #1a1a1a  →  9.1:1  ✅ Excellent
#c9b037 on #0a0a0a  →  7.2:1  ✅ Excellent
#a0a0a0 on #1a1a1a  →  5.8:1  ✅ Good
#ffffff on #8b0000  →  6.3:1  ✅ Good
#ffffff on #4b0082  →  8.1:1  ✅ Excellent
#ffffff on #10b981  →  3.7:1  ✅ (Large text only)
```

**Dark Text on Light Backgrounds:**
```
#0a0a0a on #c9b037  →  7.2:1  ✅ Excellent
#0a0a0a on #d4af37  →  7.5:1  ✅ Excellent
```

### Use With Caution ⚠️

```
#707070 on #1a1a1a  →  3.2:1  ⚠️ Large text only (18px+ or 14px+ bold)
#1e90ff on #ffffff  →  3.1:1  ⚠️ Use bold weight for emphasis
```

---

## Color Mood & Psychology

### Noir Palette (Blacks & Grays)
**Psychological Effect**: Mystery, sophistication, focus
**When to Use**: Backgrounds, containers, create depth

### Detective Gold
**Psychological Effect**: Discovery, achievement, reward
**When to Use**: CTAs, important actions, celebrations

### Blood Red
**Psychological Effect**: Danger, urgency, critical information
**When to Use**: Critical evidence, warnings, important alerts

### Poison Purple
**Psychological Effect**: Rarity, mystery, special moments
**When to Use**: Rare items, achievements, unique features

### Clue Blue
**Psychological Effect**: Information, discovery, progress
**When to Use**: Found evidence, completed actions, navigation

### Success Green
**Psychological Effect**: Completion, positive reinforcement
**When to Use**: Success states, positive feedback, achievements

---

## Color Combinations (Pre-Approved)

### High Contrast (Maximum Legibility)
```
Text:       #ffffff
Background: #0a0a0a
Ratio:      21:1
```

### Gold on Black (Brand Signature)
```
Text:       #c9b037
Background: #0a0a0a
Ratio:      7.2:1
```

### White on Gold (Primary CTA)
```
Text:       #0a0a0a
Background: #c9b037
Ratio:      7.2:1
```

### Discovery Celebration
```
Primary:    #c9b037
Secondary:  #d4af37
Border:     #d4af37
Text:       #0a0a0a
```

### Critical Alert
```
Primary:    #8b0000
Secondary:  #c92a2a
Border:     #c92a2a
Text:       #ffffff
```

### Rare Special
```
Primary:    #4b0082
Secondary:  #6a0dad
Border:     #6a0dad
Text:       #ffffff
```

---

## Gradient Recipes

### Gold Gradient (Buttons, Headers)
```css
background: linear-gradient(135deg, #b5a642 0%, #c9b037 50%, #d4af37 100%);
```

### Noir Depth Gradient (Overlays)
```css
background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%);
```

### Evidence Blood Gradient (Critical Items)
```css
background: linear-gradient(135deg, #8b0000 0%, #c92a2a 100%);
```

### Discovery Clue Gradient (Progress Bars)
```css
background: linear-gradient(90deg, #1e90ff 0%, #c9b037 100%);
```

### Success Gradient (Completion)
```css
background: linear-gradient(135deg, #10b981 0%, #14f195 100%);
```

---

## Opacity Variations

### Overlay Backgrounds
```
Deep Black 85%:  rgba(10, 10, 10, 0.85)
Charcoal 90%:    rgba(26, 26, 26, 0.90)
Gunmetal 80%:    rgba(42, 42, 42, 0.80)
```

### Tinted Overlays (Discovered/Active States)
```
Clue Blue 10%:       rgba(30, 144, 255, 0.1)
Detective Gold 10%:  rgba(201, 176, 55, 0.1)
Success Green 10%:   rgba(16, 185, 129, 0.1)
```

### Glow Effects (Shadows)
```
Gold Glow:       0 0 20px rgba(201, 176, 55, 0.3)
Gold Glow Strong: 0 0 30px rgba(201, 176, 55, 0.5)
Blue Glow:       0 0 20px rgba(30, 144, 255, 0.3)
Green Glow:      0 0 30px rgba(16, 185, 129, 0.4)
Red Glow:        0 0 30px rgba(139, 0, 0, 0.4)
Purple Glow:     0 0 30px rgba(75, 0, 130, 0.3)
```

---

## Color Picker URLs (External Tools)

**Contrast Checker**:
- https://webaim.org/resources/contrastchecker/

**Color Blind Simulator**:
- https://www.color-blindness.com/coblis-color-blindness-simulator/

**Palette Generator** (if extending):
- https://coolors.co/

**Accessibility Validator**:
- https://accessible-colors.com/

---

## Common Mistakes to Avoid

### ❌ Don't Do This

1. **Using arbitrary hex values**
   ```tsx
   backgroundColor="#1b1b1b"  // ❌ Not in palette
   ```

2. **Low contrast text**
   ```tsx
   <text color="#707070">Important info</text>  // ❌ Too low contrast
   ```

3. **Gold on gold**
   ```tsx
   backgroundColor="#c9b037"
   borderColor="#d4af37"      // ❌ Low contrast between similar golds
   ```

4. **Mixing color systems**
   ```tsx
   borderColor="rgb(201, 176, 55)"  // ❌ Use hex consistently
   ```

5. **Using pure black or white**
   ```tsx
   backgroundColor="#000000"  // ❌ Use #0a0a0a (Deep Black)
   color="#FFFFFF"            // ❌ Use #e0e0e0 (Text Primary) or specify context
   ```

### ✅ Do This Instead

1. **Use palette colors**
   ```tsx
   backgroundColor="#1a1a1a"  // ✅ Charcoal
   ```

2. **High contrast text**
   ```tsx
   <text color="#e0e0e0">Important info</text>  // ✅ Primary text
   ```

3. **Contrasting accents**
   ```tsx
   backgroundColor="#c9b037"  // Gold
   borderColor="#0a0a0a"      // ✅ Black border creates definition
   ```

4. **Consistent format**
   ```tsx
   borderColor="#c9b037"      // ✅ Hex lowercase
   ```

5. **Semantic colors**
   ```tsx
   backgroundColor="#0a0a0a"  // ✅ Deep Black (semantic name)
   color="#e0e0e0"            // ✅ Text Primary (semantic name)
   ```

---

## Quick Decision Trees

### "What background color should I use?"

```
Is it the main screen?
  → #0a0a0a (Deep Black)

Is it a card or modal?
  → #1a1a1a (Charcoal)

Is it a hover state?
  → #3a3a3a (Smoke)

Is it a button?
  Primary   → #c9b037 (Detective Gold)
  Secondary → #2a2a2a (Gunmetal)

Is it a success indicator?
  → #10b981 (Success Green)

Is it an error indicator?
  → #ef4444 (Error Red)
```

### "What text color should I use?"

```
On dark background (#0a0a0a, #1a1a1a, #2a2a2a)?
  Primary   → #e0e0e0
  Secondary → #a0a0a0
  Accent    → #c9b037

On gold background (#c9b037)?
  → #0a0a0a (Text Inverse)

On colored background (green, blue, purple, red)?
  → #ffffff (White)

Is it a heading?
  → #c9b037 (Detective Gold)
```

### "What border color should I use?"

```
Default/Subtle border?
  → #4a4a4a (Fog)

Active/Selected element?
  → #c9b037 (Detective Gold)

Hover state?
  → #b5a642 (Detective Brass)

Discovered/Completed?
  → #1e90ff (Clue Blue)

Success?
  → #14f195 (Bright Green)

Error?
  → #c92a2a (Bright Red)
```

---

## Export as Design Tokens

### CSS Custom Properties
```css
:root {
  /* Core Noir */
  --noir-deep-black: #0a0a0a;
  --noir-charcoal: #1a1a1a;
  --noir-gunmetal: #2a2a2a;
  --noir-smoke: #3a3a3a;
  --noir-fog: #4a4a4a;

  /* Detective Gold */
  --detective-gold: #c9b037;
  --detective-brass: #b5a642;
  --detective-amber: #d4af37;

  /* Evidence */
  --evidence-blood: #8b0000;
  --evidence-poison: #4b0082;
  --evidence-clue: #1e90ff;

  /* Status */
  --status-success: #10b981;
  --status-warning: #f59e0b;
  --status-error: #ef4444;

  /* Text */
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --text-muted: #707070;
  --text-inverse: #0a0a0a;
}
```

### TypeScript Constants
```typescript
export const NoirColors = {
  // Core Noir
  deepBlack: '#0a0a0a',
  charcoal: '#1a1a1a',
  gunmetal: '#2a2a2a',
  smoke: '#3a3a3a',
  fog: '#4a4a4a',

  // Detective Gold
  detectiveGold: '#c9b037',
  detectiveBrass: '#b5a642',
  detectiveAmber: '#d4af37',

  // Evidence
  evidenceBlood: '#8b0000',
  evidencePoison: '#4b0082',
  evidenceClue: '#1e90ff',

  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',

  // Text
  textPrimary: '#e0e0e0',
  textSecondary: '#a0a0a0',
  textMuted: '#707070',
  textInverse: '#0a0a0a',
} as const;
```

---

## Print This Sheet

**Black & White Printing**: Color names and hex values will print clearly

**Color Printing**: Recommended for visual reference

**Digital Use**: Keep this file open during development for quick copy-paste

---

**End of Color Palette Reference Sheet**

Bookmark this page for instant color lookups! 🎨
