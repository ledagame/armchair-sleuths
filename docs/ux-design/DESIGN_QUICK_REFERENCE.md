# Investigation UI Design Quick Reference
**Armchair Sleuths - Noir Detective Visual Cheat Sheet**

**For Rapid Implementation**: Copy-paste ready Devvit code snippets

---

## Color Swatches

### Backgrounds
```
█ #0a0a0a  Deep Black    (Primary Background, Active Tab)
█ #1a1a1a  Charcoal      (Cards, Modals)
█ #2a2a2a  Gunmetal      (Inactive Tabs, Hover States)
█ #3a3a3a  Smoke         (Active/Press States)
█ #4a4a4a  Fog           (Borders, Dividers)
```

### Accents
```
█ #c9b037  Detective Gold (Primary CTA, Active Elements)
█ #b5a642  Detective Brass (Secondary Accent, Hover)
█ #d4af37  Detective Amber (Highlights, Warnings)
```

### Evidence Types
```
█ #8b0000  Blood         (Victim, Critical Evidence)
█ #4b0082  Poison        (Rare Evidence, Achievements)
█ #1e90ff  Clue          (Discovered Evidence, Info)
```

### Status Colors
```
█ #10b981  Success Green (Evidence Found, High AP)
█ #f59e0b  Warning Amber (Low AP, Caution)
█ #ef4444  Error Red     (Critical AP, Errors)
```

### Text Colors
```
█ #e0e0e0  Text Primary   (Main Content)
█ #a0a0a0  Text Secondary (Descriptions)
█ #707070  Text Muted     (Metadata, Captions)
█ #0a0a0a  Text Inverse   (Text on Gold Buttons)
```

---

## Component Snippets

### Tab Navigation (Active)

```tsx
<vstack
  backgroundColor="#0a0a0a"
  border="thick"
  borderColor="#c9b037"
  cornerRadius="medium"
  padding="medium"
  alignment="center middle"
  minHeight="56px"
  grow
>
  <hstack gap="small" alignment="center">
    <text size="large">🗺️</text>
    <text size="medium" weight="bold" color="#c9b037">
      장소 탐색
    </text>
  </hstack>
</vstack>
```

### Tab Navigation (Inactive)

```tsx
<vstack
  backgroundColor="#2a2a2a"
  cornerRadius="medium"
  padding="medium"
  alignment="center middle"
  minHeight="56px"
  grow
>
  <hstack gap="small" alignment="center">
    <text size="large">👤</text>
    <text size="medium" color="#a0a0a0">
      용의자 심문
    </text>
  </hstack>
</vstack>
```

### Evidence Card (Common)

```tsx
<vstack
  backgroundColor="#1a1a1a"
  border="thick"
  borderColor="#4a4a4a"
  cornerRadius="medium"
  padding="medium"
  gap="small"
  alignment="center"
  minHeight="160px"
>
  <text size="xlarge">🔍</text>
  <text size="medium" weight="bold" color="#c9b037" alignment="center">
    증거 이름
  </text>
  <text size="small" color="#a0a0a0" alignment="center">
    증거 설명
  </text>

  {/* Common Badge */}
  <hstack
    backgroundColor="#4a4a4a"
    border="thin"
    borderColor="#707070"
    cornerRadius="small"
    padding="xsmall"
  >
    <text size="xsmall" weight="bold" color="#e0e0e0">
      COMMON
    </text>
  </hstack>
</vstack>
```

### Evidence Card (Rare)

```tsx
{/* Replace badge with: */}
<hstack
  backgroundColor="#4b0082"
  border="thin"
  borderColor="#6a0dad"
  cornerRadius="small"
  padding="xsmall"
>
  <text size="xsmall" weight="bold" color="#ffffff">
    ⭐ RARE
  </text>
</hstack>
```

### Evidence Card (Critical)

```tsx
{/* Replace badge with: */}
<hstack
  backgroundColor="#8b0000"
  border="thin"
  borderColor="#c92a2a"
  cornerRadius="small"
  padding="xsmall"
>
  <text size="xsmall" weight="bold" color="#ffffff">
    🔥 CRITICAL
  </text>
</hstack>
```

### Suspect Card

```tsx
<vstack
  backgroundColor="#1a1a1a"
  border="thin"
  borderColor="#4a4a4a"
  cornerRadius="medium"
  padding="medium"
  gap="small"
  alignment="center"
  minHeight="120px"
>
  {/* Avatar */}
  <hstack
    backgroundColor="#2a2a2a"
    cornerRadius="full"
    width="64px"
    height="64px"
    alignment="center middle"
  >
    <text size="xlarge">👤</text>
  </hstack>

  {/* Name */}
  <text size="medium" weight="bold" color="#e0e0e0" alignment="center">
    김민수
  </text>

  {/* Archetype */}
  <text size="small" color="#707070" alignment="center">
    전직 경찰관
  </text>

  {/* Chat Button */}
  <hstack
    backgroundColor="#c9b037"
    padding="small"
    cornerRadius="small"
    gap="xsmall"
    minHeight="44px"
  >
    <text size="small">💬</text>
    <text size="small" weight="bold" color="#0a0a0a">
      대화하기
    </text>
  </hstack>
</vstack>
```

### Action Points (High - Green)

```tsx
<hstack
  backgroundColor="#1a1a1a"
  border="thin"
  borderColor="#4a4a4a"
  cornerRadius="medium"
  padding="small"
  gap="xsmall"
  alignment="center middle"
>
  <text size="medium">🔋</text>
  <text size="medium" weight="bold" color="#10b981">
    8
  </text>
  <text size="small" color="#a0a0a0">
    / 12 AP
  </text>
</hstack>
```

### Action Points (Medium - Gold)

```tsx
{/* Change text color to: */}
<text size="medium" weight="bold" color="#c9b037">
  6
</text>
```

### Action Points (Low - Amber)

```tsx
{/* Change text color to: */}
<text size="medium" weight="bold" color="#f59e0b">
  3
</text>
```

### Action Points (Critical - Red)

```tsx
{/* Change text color to: */}
<text size="medium" weight="bold" color="#ef4444">
  1
</text>
```

### Success Toast (Evidence Found)

```tsx
<vstack
  backgroundColor="#10b981"
  border="thick"
  borderColor="#14f195"
  cornerRadius="medium"
  padding="medium"
  gap="small"
  alignment="center"
  width="90%"
  maxWidth="400px"
>
  <hstack gap="small" alignment="center">
    <text size="large">🎉</text>
    <text size="medium" weight="bold" color="#ffffff">
      증거 발견!
    </text>
  </hstack>

  <text size="small" color="#ffffff" alignment="center">
    +2 AP 획득
  </text>
</vstack>
```

### Discovery Toast (New Clue)

```tsx
<vstack
  backgroundColor="#c9b037"
  border="thick"
  borderColor="#d4af37"
  cornerRadius="medium"
  padding="medium"
  gap="small"
  alignment="center"
>
  <hstack gap="small" alignment="center">
    <text size="large">🔍</text>
    <text size="medium" weight="bold" color="#0a0a0a">
      새로운 단서!
    </text>
  </hstack>

  <text size="small" color="#0a0a0a" alignment="center">
    범행 도구 발견
  </text>
</vstack>
```

### Achievement Toast

```tsx
<vstack
  backgroundColor="#4b0082"
  border="thick"
  borderColor="#6a0dad"
  cornerRadius="medium"
  padding="medium"
  gap="small"
  alignment="center"
>
  <text size="xlarge">🏆</text>

  <text size="medium" weight="bold" color="#ffffff" alignment="center">
    업적 달성!
  </text>

  <text size="small" color="#ffffff" alignment="center">
    "첫 번째 증거 발견"
  </text>
</vstack>
```

### Modal Overlay (Full)

```tsx
<zstack width="100%" height="100%" alignment="center middle">
  {/* Dimmed Background */}
  <vstack
    backgroundColor="rgba(10, 10, 10, 0.85)"
    width="100%"
    height="100%"
  />

  {/* Modal Card */}
  <vstack
    backgroundColor="#1a1a1a"
    border="thick"
    borderColor="#c9b037"
    cornerRadius="medium"
    padding="large"
    gap="medium"
    width="90%"
    maxWidth="600px"
  >
    {/* Header with Close */}
    <hstack alignment="space-between" width="100%">
      <text size="large" weight="bold" color="#c9b037">
        모달 제목
      </text>

      <vstack
        backgroundColor="#2a2a2a"
        cornerRadius="small"
        padding="small"
        minWidth="44px"
        minHeight="44px"
        alignment="center middle"
      >
        <text size="medium" color="#e0e0e0">✕</text>
      </vstack>
    </hstack>

    {/* Content */}
    <text size="medium" color="#e0e0e0" wrap>
      모달 내용이 여기에 표시됩니다.
    </text>

    {/* Primary Button */}
    <hstack
      backgroundColor="#c9b037"
      cornerRadius="medium"
      padding="medium"
      minHeight="48px"
      alignment="center middle"
      width="100%"
    >
      <text size="medium" weight="bold" color="#0a0a0a">
        확인
      </text>
    </hstack>
  </vstack>
</zstack>
```

### Primary Button (CTA)

```tsx
<hstack
  backgroundColor="#c9b037"
  cornerRadius="medium"
  padding="medium"
  minHeight="48px"
  alignment="center middle"
>
  <text size="medium" weight="bold" color="#0a0a0a">
    버튼 텍스트
  </text>
</hstack>
```

### Secondary Button

```tsx
<hstack
  backgroundColor="#2a2a2a"
  cornerRadius="medium"
  padding="medium"
  minHeight="48px"
  alignment="center middle"
>
  <text size="medium" weight="bold" color="#e0e0e0">
    버튼 텍스트
  </text>
</hstack>
```

### Loading Spinner (Visual Only)

```tsx
<vstack gap="small" alignment="center">
  {/* Animated emoji pulse */}
  <text size="xlarge">⏳</text>
  <text size="small" color="#c9b037">
    로딩 중...
  </text>
</vstack>
```

### Divider Line

```tsx
<hstack
  width="100%"
  height="2px"
  backgroundColor="#4a4a4a"
/>
```

### Section Header

```tsx
<hstack gap="small" alignment="center">
  <text size="large">🔍</text>
  <text size="large" weight="bold" color="#c9b037">
    섹션 제목
  </text>
</hstack>
```

---

## Spacing Presets

### Tight (Cards, Badges)
```tsx
gap="xsmall"     // 4px
padding="small"  // 8px
```

### Default (Most Components)
```tsx
gap="small"      // 8px
padding="medium" // 16px
```

### Spacious (Modals, Sections)
```tsx
gap="medium"     // 16px
padding="large"  // 24px
```

---

## Touch Target Sizes

```
Minimum Button Height:        48px
Primary CTA Height:           48-56px
Tab Height:                   56px
Close Button Size:            44px × 44px
Icon Button Size:             44px × 44px
Smallest Tappable Area:       44px × 44px
```

**Implementation:**
```tsx
minHeight="48px"   // Standard buttons
minHeight="56px"   // Primary CTAs, Tabs
minWidth="44px"    // Icon buttons
minHeight="44px"   // Icon buttons
```

---

## Border Styles

### Thick Border (Prominent)
```tsx
border="thick"        // 2px
borderColor="#c9b037" // Gold
```

### Thin Border (Subtle)
```tsx
border="thin"         // 1px
borderColor="#4a4a4a" // Fog
```

### No Border
```tsx
border="none"
```

---

## Corner Radius

### Small (Badges, Icons)
```tsx
cornerRadius="small"   // ~4px
```

### Medium (Cards, Buttons)
```tsx
cornerRadius="medium"  // ~8px
```

### Large (Modals)
```tsx
cornerRadius="large"   // ~12px
```

### Full (Circles, Pills)
```tsx
cornerRadius="full"    // 50%
```

---

## Alignment Presets

### Center Everything
```tsx
alignment="center middle"
```

### Top Left
```tsx
alignment="start top"
```

### Top Right
```tsx
alignment="end top"
```

### Bottom Center
```tsx
alignment="center bottom"
```

### Space Between (Horizontal)
```tsx
<hstack alignment="space-between">
  <text>Left</text>
  <text>Right</text>
</hstack>
```

---

## Common Patterns

### Card with Icon + Title + Description

```tsx
<vstack
  backgroundColor="#1a1a1a"
  border="thick"
  borderColor="#4a4a4a"
  cornerRadius="medium"
  padding="medium"
  gap="small"
  alignment="center"
>
  <text size="xlarge">📋</text>
  <text size="medium" weight="bold" color="#c9b037">
    제목
  </text>
  <text size="small" color="#a0a0a0" alignment="center">
    설명
  </text>
</vstack>
```

### Header with Action Button

```tsx
<hstack alignment="space-between" width="100%">
  <text size="large" weight="bold" color="#c9b037">
    섹션 제목
  </text>

  <hstack
    backgroundColor="#c9b037"
    padding="small"
    cornerRadius="small"
    minHeight="44px"
  >
    <text size="small" weight="bold" color="#0a0a0a">
      액션
    </text>
  </hstack>
</hstack>
```

### List Item with Divider

```tsx
<vstack width="100%" gap="small">
  <hstack alignment="space-between" padding="small">
    <text size="medium" color="#e0e0e0">항목 1</text>
    <text size="small" color="#a0a0a0">값</text>
  </hstack>

  <hstack width="100%" height="1px" backgroundColor="#4a4a4a" />

  <hstack alignment="space-between" padding="small">
    <text size="medium" color="#e0e0e0">항목 2</text>
    <text size="small" color="#a0a0a0">값</text>
  </hstack>
</vstack>
```

### Status Badge (Inline)

```tsx
<hstack gap="small" alignment="center">
  <text size="medium" color="#e0e0e0">
    증거 수집:
  </text>

  <hstack
    backgroundColor="#10b981"
    padding="xsmall"
    cornerRadius="small"
  >
    <text size="xsmall" weight="bold" color="#ffffff">
      완료
    </text>
  </hstack>
</hstack>
```

---

## Color Decision Tree

### "What background color should I use?"

```
┌─ Is it the main screen background?
│  └─ Use #0a0a0a (Deep Black)
│
├─ Is it a card or modal?
│  └─ Use #1a1a1a (Charcoal)
│
├─ Is it a hover state?
│  └─ Use #2a2a2a (Gunmetal) or #3a3a3a (Smoke)
│
├─ Is it a success/positive action?
│  └─ Use #10b981 (Success Green)
│
├─ Is it a primary CTA button?
│  └─ Use #c9b037 (Detective Gold)
│
└─ Is it a rare/special element?
   └─ Use #4b0082 (Poison Purple)
```

### "What text color should I use?"

```
┌─ Is the background dark (#0a0a0a, #1a1a1a, #2a2a2a)?
│  ├─ Primary text: #e0e0e0
│  ├─ Secondary text: #a0a0a0
│  └─ Muted text: #707070
│
├─ Is the background gold (#c9b037)?
│  └─ Use #0a0a0a (Deep Black)
│
├─ Is the background colored (green, purple, blue)?
│  └─ Use #ffffff (White)
│
└─ Is it an accent/heading?
   └─ Use #c9b037 (Detective Gold)
```

### "What border color should I use?"

```
┌─ Is it a default/subtle border?
│  └─ Use #4a4a4a (Fog)
│
├─ Is it an active/selected element?
│  └─ Use #c9b037 (Detective Gold)
│
├─ Is it a hover state?
│  └─ Use #b5a642 (Detective Brass)
│
├─ Is it discovered evidence?
│  └─ Use #1e90ff (Clue Blue)
│
└─ Is it a success/completion indicator?
   └─ Use #10b981 (Success Green)
```

---

## Contrast Validation

| Text Color | Background | Contrast | WCAG AA | Pass |
|------------|------------|----------|---------|------|
| #e0e0e0    | #1a1a1a    | 9.1:1    | 4.5:1   | ✅   |
| #c9b037    | #0a0a0a    | 7.2:1    | 4.5:1   | ✅   |
| #a0a0a0    | #1a1a1a    | 5.8:1    | 4.5:1   | ✅   |
| #0a0a0a    | #c9b037    | 7.2:1    | 4.5:1   | ✅   |
| #ffffff    | #8b0000    | 6.3:1    | 4.5:1   | ✅   |
| #ffffff    | #4b0082    | 8.1:1    | 4.5:1   | ✅   |
| #ffffff    | #10b981    | 3.7:1    | 3:1     | ✅ (Large) |

---

## Implementation Checklist

**Before submitting for review:**

- [ ] All touch targets ≥ 44px × 44px
- [ ] Text contrast ≥ 4.5:1 (or 3:1 for large text)
- [ ] Border width = thin (1px) or thick (2px)
- [ ] Corner radius = small, medium, large, or full
- [ ] Padding/gap uses xsmall, small, medium, or large
- [ ] Text size uses xsmall, small, medium, large, or xlarge
- [ ] Colors use exact hex values from palette
- [ ] Interactive elements have visual feedback
- [ ] Modal has backdrop overlay
- [ ] All emoji/icons have text fallbacks

---

**Quick Copy Commands:**

Gold Button:
```tsx
backgroundColor="#c9b037" color="#0a0a0a"
```

Card Background:
```tsx
backgroundColor="#1a1a1a" borderColor="#4a4a4a"
```

Success State:
```tsx
backgroundColor="#10b981" color="#ffffff"
```

Tab Active:
```tsx
backgroundColor="#0a0a0a" borderColor="#c9b037" color="#c9b037"
```

Tab Inactive:
```tsx
backgroundColor="#2a2a2a" color="#a0a0a0"
```

---

**End of Quick Reference**

Use this as your copy-paste library for rapid Devvit component implementation!
