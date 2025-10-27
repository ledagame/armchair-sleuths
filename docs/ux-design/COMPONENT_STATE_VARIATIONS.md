# Component State Variations
**Armchair Sleuths - Visual State Matrix**

**Purpose**: Comprehensive state variation specifications for all interactive components

---

## 1. Tab Navigation States

### State Matrix

| State          | Background  | Border      | Text Color | Border Width | Underline |
|----------------|-------------|-------------|------------|--------------|-----------|
| **Active**     | #0a0a0a     | #c9b037     | #c9b037    | 2px (thick)  | 4px Gold  |
| **Inactive**   | #2a2a2a     | transparent | #a0a0a0    | 0px          | None      |
| **Hover**      | #3a3a3a     | transparent | #e0e0e0    | 0px          | None      |
| **Pressed**    | #2a2a2a     | transparent | #e0e0e0    | 0px          | None      |
| **Disabled**   | #2a2a2a     | transparent | #707070    | 0px          | None      |

### Visual Comparison

```
┌─────────────────────────────────────────────────────────────┐
│                    TAB STATE VARIATIONS                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ACTIVE                  INACTIVE                HOVER      │
│  ┌──────────────┐       ┌──────────────┐      ┌──────────┐ │
│  │ #0a0a0a      │       │ #2a2a2a      │      │ #3a3a3a  │ │
│  │              │       │              │      │          │ │
│  │ 🗺️ 장소 탐색  │       │ 👤 용의자     │      │ 📋 노트  │ │
│  │ (Gold #c9b037)│      │ (Gray #a0a0a0)│     │(#e0e0e0) │ │
│  │              │       │              │      │          │ │
│  │══════════════│       │              │      │          │ │
│  │ Gold Border  │       │  No Border   │      │ No Border│ │
│  └──────────────┘       └──────────────┘      └──────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Code Examples

**Active Tab:**
```tsx
<vstack
  backgroundColor="#0a0a0a"          // Deep Black
  border="thick"                     // 2px
  borderColor="#c9b037"              // Gold
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

  {/* Active underline indicator */}
  <spacer height="xsmall" />
  <hstack width="100%" height="4px" backgroundColor="#c9b037" />
</vstack>
```

**Inactive Tab:**
```tsx
<vstack
  backgroundColor="#2a2a2a"          // Gunmetal
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

**Hover Tab:**
```tsx
<vstack
  backgroundColor="#3a3a3a"          // Smoke (hover state)
  cornerRadius="medium"
  padding="medium"
  alignment="center middle"
  minHeight="56px"
  grow
>
  <hstack gap="small" alignment="center">
    <text size="large">📋</text>
    <text size="medium" color="#e0e0e0">
      수사 노트
    </text>
  </hstack>
</vstack>
```

---

## 2. Evidence Card States

### State Matrix

| State               | Background          | Border      | Shadow                | Opacity | Cursor      |
|---------------------|---------------------|-------------|-----------------------|---------|-------------|
| **Default**         | #1a1a1a             | #4a4a4a     | None                  | 1.0     | pointer     |
| **Hover**           | #1a1a1a             | #b5a642     | Gold glow (20px)      | 1.0     | pointer     |
| **Pressed**         | #1a1a1a             | #c9b037     | Gold glow (30px)      | 0.95    | pointer     |
| **Discovered**      | rgba(30,144,255,0.1)| #1e90ff     | Blue glow (20px)      | 1.0     | pointer     |
| **Locked**          | #1a1a1a             | #4a4a4a     | None                  | 0.5     | not-allowed |

### Visual Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│                  EVIDENCE CARD STATE VARIATIONS                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DEFAULT              HOVER               DISCOVERED            │
│  ┌─────────────┐    ┌─────────────┐     ┌─────────────┐       │
│  │ #1a1a1a     │    │ #1a1a1a     │     │ Blue Tint   │       │
│  │             │    │   Brass     │     │   Blue      │       │
│  │     🔍      │    │   Border    │     │   Border    │       │
│  │             │    │             │     │             │       │
│  │  혈흔 증거   │    │  혈흔 증거   │     │  혈흔 증거   │       │
│  │  (Gold)     │    │  (Gold)     │     │  (Gold)     │       │
│  │             │    │             │     │             │       │
│  │ 범행 현장... │    │ 범행 현장... │     │ 범행 현장... │       │
│  │ (Gray)      │    │ (Gray)      │     │ (Gray)      │       │
│  │             │    │             │     │             │       │
│  │ [COMMON]    │    │ [COMMON]    │     │ [COMMON]    │       │
│  │             │    │  ✨Glow     │     │  ✓ Found    │       │
│  └─────────────┘    └─────────────┘     └─────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Code Examples

**Default Evidence Card:**
```tsx
<vstack
  backgroundColor="#1a1a1a"
  border="thick"
  borderColor="#4a4a4a"              // Fog (default)
  cornerRadius="medium"
  padding="medium"
  gap="small"
  alignment="center"
  minHeight="160px"
>
  <text size="xlarge">🔍</text>
  <text size="medium" weight="bold" color="#c9b037" alignment="center">
    혈흔 증거
  </text>
  <text size="small" color="#a0a0a0" alignment="center">
    범행 현장에서 발견된 혈흔 샘플
  </text>

  <hstack backgroundColor="#4a4a4a" padding="xsmall" cornerRadius="small">
    <text size="xsmall" weight="bold" color="#e0e0e0">
      COMMON
    </text>
  </hstack>
</vstack>
```

**Hover Evidence Card:**
```tsx
{/* Change border to: */}
borderColor="#b5a642"                // Detective Brass (hover)

{/* Add visual feedback via onPress handler */}
```

**Discovered Evidence Card:**
```tsx
<vstack
  backgroundColor="rgba(30, 144, 255, 0.1)"  // Blue tint overlay
  border="thick"
  borderColor="#1e90ff"                      // Clue Blue
  cornerRadius="medium"
  padding="medium"
  gap="small"
  alignment="center"
  minHeight="160px"
>
  {/* Same content as default... */}

  {/* Add discovered indicator */}
  <hstack gap="xsmall" alignment="center">
    <text size="small" color="#10b981">✓</text>
    <text size="small" color="#1e90ff">발견됨</text>
  </hstack>
</vstack>
```

**Locked Evidence Card:**
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
  opacity={0.5}                       // Reduced opacity
>
  <text size="xlarge">🔒</text>
  <text size="medium" weight="bold" color="#707070" alignment="center">
    잠긴 증거
  </text>
  <text size="small" color="#707070" alignment="center">
    특정 조건을 만족해야 합니다
  </text>
</vstack>
```

---

## 3. Suspect Card States

### State Matrix

| State               | Background          | Border      | Avatar BG | Text Color | Button     |
|---------------------|---------------------|-------------|-----------|------------|------------|
| **Default**         | #1a1a1a             | #4a4a4a     | #2a2a2a   | #e0e0e0    | Gold       |
| **Hover**           | #2a2a2a             | #b5a642     | #3a3a3a   | #e0e0e0    | Gold       |
| **Interrogated**    | rgba(30,144,255,0.1)| #1e90ff     | #2a2a2a   | #e0e0e0    | Blue       |
| **Locked**          | #1a1a1a             | #4a4a4a     | #2a2a2a   | #707070    | Gray       |

### Visual Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│                  SUSPECT CARD STATE VARIATIONS                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DEFAULT              HOVER               INTERROGATED          │
│  ┌─────────────┐    ┌─────────────┐     ┌─────────────┐       │
│  │ #1a1a1a     │    │ #2a2a2a     │     │ Blue Tint   │       │
│  │             │    │   Brass     │     │   Blue      │       │
│  │    👤       │    │   Border    │     │   Border    │       │
│  │   Avatar    │    │             │     │             │       │
│  │             │    │    👤       │     │    👤       │       │
│  │  김민수      │    │   Avatar    │     │   Avatar    │       │
│  │ (White)     │    │             │     │             │       │
│  │             │    │  김민수      │     │  김민수      │       │
│  │ 전직 경찰관  │    │ (White)     │     │ (White)     │       │
│  │ (Gray)      │    │             │     │             │       │
│  │             │    │ 전직 경찰관  │     │ 전직 경찰관  │       │
│  │ [💬 대화하기]│    │ (Gray)      │     │ (Gray)      │       │
│  │   (Gold)    │    │             │     │             │       │
│  │             │    │ [💬 대화하기]│     │ [✓ 대화 완료]│       │
│  └─────────────┘    │   (Gold)    │     │   (Blue)    │       │
│                     └─────────────┘     └─────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Code Examples

**Default Suspect Card:**
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

**Hover Suspect Card:**
```tsx
{/* Change outer container: */}
backgroundColor="#2a2a2a"            // Gunmetal (darker on hover)
borderColor="#b5a642"                // Brass (highlight border)

{/* Change avatar background: */}
backgroundColor="#3a3a3a"            // Smoke
```

**Interrogated Suspect Card:**
```tsx
<vstack
  backgroundColor="rgba(30, 144, 255, 0.1)"  // Blue tint
  border="thick"
  borderColor="#1e90ff"                      // Clue Blue
  cornerRadius="medium"
  padding="medium"
  gap="small"
  alignment="center"
>
  {/* Same avatar and name... */}

  {/* Changed button to completion indicator */}
  <hstack gap="xsmall" alignment="center">
    <text size="small" color="#10b981">✓</text>
    <text size="small" color="#1e90ff">대화 완료</text>
  </hstack>
</vstack>
```

---

## 4. Action Points (AP) Display States

### State Matrix (Based on Percentage)

| AP Range      | Percentage | Icon Color | Label      | Visual Indicator |
|---------------|------------|------------|------------|------------------|
| **High**      | 75-100%    | #10b981    | Full       | Green battery    |
| **Medium**    | 50-74%     | #c9b037    | Good       | Gold battery     |
| **Low**       | 25-49%     | #f59e0b    | Low        | Amber battery    |
| **Critical**  | 0-24%      | #ef4444    | Critical   | Red battery      |
| **Empty**     | 0%         | #ef4444    | Empty      | Red empty icon   |

### Visual Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│                    AP DISPLAY STATE VARIATIONS                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  HIGH (10/12)        MEDIUM (7/12)      LOW (4/12)   CRITICAL   │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐ (1/12)    │
│  │ 🔋 10       │    │ 🔋 7        │    │ 🔋 4       │ ┌────────┐│
│  │ (Green)    │    │ (Gold)     │    │ (Amber)    │ │🔋 1    ││
│  │ / 12 AP    │    │ / 12 AP    │    │ / 12 AP    │ │(Red)   ││
│  │            │    │            │    │            │ │/ 12 AP ││
│  │  83%       │    │  58%       │    │  33%       │ │        ││
│  └────────────┘    └────────────┘    └────────────┘ │  8%    ││
│                                                       └────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Code Examples

**High AP (Green - 75-100%):**
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
    10
  </text>
  <text size="small" color="#a0a0a0">
    / 12 AP
  </text>
</hstack>
```

**Medium AP (Gold - 50-74%):**
```tsx
{/* Change number color to: */}
<text size="medium" weight="bold" color="#c9b037">
  7
</text>
```

**Low AP (Amber - 25-49%):**
```tsx
{/* Change number color to: */}
<text size="medium" weight="bold" color="#f59e0b">
  4
</text>

{/* Add pulsing animation via state management */}
```

**Critical AP (Red - 0-24%):**
```tsx
<hstack
  backgroundColor="#1a1a1a"
  border="thin"
  borderColor="#ef4444"               // Red border for critical
  cornerRadius="medium"
  padding="small"
  gap="xsmall"
  alignment="center middle"
>
  <text size="medium">🔋</text>
  <text size="medium" weight="bold" color="#ef4444">
    1
  </text>
  <text size="small" color="#a0a0a0">
    / 12 AP
  </text>

  {/* Critical warning */}
  <text size="small" color="#ef4444">⚠️</text>
</hstack>

{/* Add pulsing red glow animation */}
```

---

## 5. Button States

### State Matrix

| State       | Background  | Text Color | Border     | Opacity | Transform   |
|-------------|-------------|------------|------------|---------|-------------|
| **Default** | #c9b037     | #0a0a0a    | None       | 1.0     | scale(1.0)  |
| **Hover**   | #d4af37     | #0a0a0a    | None       | 1.0     | scale(1.05) |
| **Pressed** | #b5a642     | #0a0a0a    | None       | 0.9     | scale(0.95) |
| **Disabled**| #4a4a4a     | #707070    | None       | 0.6     | scale(1.0)  |
| **Loading** | #c9b037     | #0a0a0a    | None       | 0.8     | scale(1.0)  |

### Visual Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUTTON STATE VARIATIONS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DEFAULT             HOVER                PRESSED               │
│  ┌────────────┐    ┌────────────┐      ┌────────────┐         │
│  │  #c9b037   │    │  #d4af37   │      │  #b5a642   │         │
│  │            │    │  (Lighter) │      │  (Darker)  │         │
│  │ 탐색 시작  │    │            │      │            │         │
│  │ (Black)    │    │ 탐색 시작  │      │ 탐색 시작  │         │
│  │            │    │ (Black)    │      │ (Black)    │         │
│  │  Normal    │    │  Scale↑    │      │  Scale↓    │         │
│  └────────────┘    └────────────┘      └────────────┘         │
│                                                                 │
│  DISABLED           LOADING                                     │
│  ┌────────────┐    ┌────────────┐                              │
│  │  #4a4a4a   │    │  #c9b037   │                              │
│  │  (Gray)    │    │            │                              │
│  │ 탐색 시작  │    │   ⏳       │                              │
│  │ (Muted)    │    │  로딩 중... │                              │
│  │            │    │ (Opacity)  │                              │
│  │ Opacity↓   │    │            │                              │
│  └────────────┘    └────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Code Examples

**Default Button (Primary CTA):**
```tsx
<hstack
  backgroundColor="#c9b037"
  cornerRadius="medium"
  padding="medium"
  minHeight="48px"
  alignment="center middle"
>
  <text size="medium" weight="bold" color="#0a0a0a">
    탐색 시작
  </text>
</hstack>
```

**Hover Button:**
```tsx
{/* Change background to: */}
backgroundColor="#d4af37"            // Amber (lighter gold)

{/* Apply scale transform via animation */}
```

**Pressed Button:**
```tsx
{/* Change background to: */}
backgroundColor="#b5a642"            // Brass (darker gold)

{/* Apply scale transform + opacity via animation */}
```

**Disabled Button:**
```tsx
<hstack
  backgroundColor="#4a4a4a"          // Fog (gray)
  cornerRadius="medium"
  padding="medium"
  minHeight="48px"
  alignment="center middle"
  opacity={0.6}
>
  <text size="medium" weight="bold" color="#707070">
    탐색 시작
  </text>
</hstack>
```

**Loading Button:**
```tsx
<hstack
  backgroundColor="#c9b037"
  cornerRadius="medium"
  padding="medium"
  minHeight="48px"
  alignment="center middle"
  opacity={0.8}
>
  <hstack gap="small" alignment="center">
    <text size="medium">⏳</text>
    <text size="medium" weight="bold" color="#0a0a0a">
      로딩 중...
    </text>
  </hstack>
</hstack>
```

---

## 6. Toast/Feedback States

### State Matrix

| Type           | Background  | Border      | Icon | Duration | Priority |
|----------------|-------------|-------------|------|----------|----------|
| **Success**    | #10b981     | #14f195     | 🎉   | 5000ms   | High     |
| **Discovery**  | #c9b037     | #d4af37     | 🔍   | 5000ms   | High     |
| **Achievement**| #4b0082     | #6a0dad     | 🏆   | 6000ms   | Critical |
| **Warning**    | #f59e0b     | #fbbf24     | ⚠️   | 4000ms   | Medium   |
| **Info**       | #1e90ff     | #60a5fa     | ℹ️   | 3000ms   | Low      |
| **Error**      | #ef4444     | #f87171     | ❌   | 6000ms   | Critical |

### Visual Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│                   TOAST/FEEDBACK STATE VARIATIONS               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SUCCESS              DISCOVERY           ACHIEVEMENT           │
│  ┌────────────┐     ┌────────────┐      ┌────────────┐        │
│  │ #10b981    │     │ #c9b037    │      │ #4b0082    │        │
│  │ (Green)    │     │ (Gold)     │      │ (Purple)   │        │
│  │            │     │            │      │            │        │
│  │ 🎉 증거발견 │     │ 🔍 새로운   │      │ 🏆 업적달성 │        │
│  │ (White)    │     │    단서!   │      │ (White)    │        │
│  │            │     │ (Black)    │      │            │        │
│  │ +2 AP 획득 │     │ 범행 도구   │      │ "첫 증거"  │        │
│  │            │     │  발견      │      │            │        │
│  └────────────┘     └────────────┘      └────────────┘        │
│                                                                 │
│  WARNING             INFO                ERROR                 │
│  ┌────────────┐     ┌────────────┐      ┌────────────┐        │
│  │ #f59e0b    │     │ #1e90ff    │      │ #ef4444    │        │
│  │ (Amber)    │     │ (Blue)     │      │ (Red)      │        │
│  │            │     │            │      │            │        │
│  │ ⚠️ AP 부족  │     │ ℹ️ 힌트     │      │ ❌ 오류    │        │
│  │ (White)    │     │ (White)    │      │ (White)    │        │
│  │            │     │            │      │            │        │
│  │ 탐색 불가  │     │ 관련 증거... │      │ 다시 시도  │        │
│  └────────────┘     └────────────┘      └────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Code Examples

**Success Toast:**
```tsx
<vstack
  backgroundColor="#10b981"
  border="thick"
  borderColor="#14f195"
  cornerRadius="medium"
  padding="medium"
  gap="small"
  alignment="center"
>
  <hstack gap="small" alignment="center">
    <text size="large">🎉</text>
    <text size="medium" weight="bold" color="#ffffff">
      증거 발견!
    </text>
  </hstack>
  <text size="small" color="#ffffff">
    +2 AP 획득
  </text>
</vstack>
```

**Discovery Toast:**
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
  <text size="small" color="#0a0a0a">
    범행 도구 발견
  </text>
</vstack>
```

**Warning Toast:**
```tsx
<vstack
  backgroundColor="#f59e0b"
  border="thick"
  borderColor="#fbbf24"
  cornerRadius="medium"
  padding="medium"
  gap="small"
  alignment="center"
>
  <hstack gap="small" alignment="center">
    <text size="large">⚠️</text>
    <text size="medium" weight="bold" color="#ffffff">
      AP 부족
    </text>
  </hstack>
  <text size="small" color="#ffffff">
    탐색을 진행할 수 없습니다
  </text>
</vstack>
```

**Error Toast:**
```tsx
<vstack
  backgroundColor="#ef4444"
  border="thick"
  borderColor="#f87171"
  cornerRadius="medium"
  padding="medium"
  gap="small"
  alignment="center"
>
  <hstack gap="small" alignment="center">
    <text size="large">❌</text>
    <text size="medium" weight="bold" color="#ffffff">
      오류 발생
    </text>
  </hstack>
  <text size="small" color="#ffffff">
    다시 시도해주세요
  </text>
</vstack>
```

---

## 7. Modal States

### State Matrix

| State      | Overlay Opacity | Modal Scale | Backdrop Blur | Interaction |
|------------|-----------------|-------------|---------------|-------------|
| **Open**   | 0.85            | 1.0         | None          | Enabled     |
| **Opening**| 0 → 0.85        | 0.9 → 1.0   | None          | Disabled    |
| **Closing**| 0.85 → 0        | 1.0 → 0.9   | None          | Disabled    |
| **Closed** | 0               | 0           | None          | N/A         |

### Animation Specifications

```
Opening Animation (300ms ease-out):
  - Overlay: opacity 0 → 0.85
  - Modal: scale 0.9 → 1.0, opacity 0 → 1.0
  - Timing: cubic-bezier(0.4, 0, 0.2, 1)

Closing Animation (200ms ease-in):
  - Overlay: opacity 0.85 → 0
  - Modal: scale 1.0 → 0.9, opacity 1.0 → 0
  - Timing: cubic-bezier(0.4, 0, 1, 1)
```

---

## 8. Evidence Rarity Badge States

### Visual Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│                EVIDENCE RARITY BADGE VARIATIONS                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  COMMON              RARE                CRITICAL               │
│  ┌────────────┐    ┌────────────┐      ┌────────────┐         │
│  │ #4a4a4a    │    │ #4b0082    │      │ #8b0000    │         │
│  │ (Fog)      │    │ (Poison)   │      │ (Blood)    │         │
│  │            │    │            │      │            │         │
│  │  COMMON    │    │  ⭐ RARE   │      │  🔥 CRITICAL│        │
│  │ (#e0e0e0)  │    │ (#ffffff)  │      │ (#ffffff)  │         │
│  │            │    │            │      │            │         │
│  │ Gray Border│    │ Purple Glow│      │  Red Glow  │         │
│  └────────────┘    └────────────┘      └────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Code Examples

**Common Badge:**
```tsx
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
```

**Rare Badge:**
```tsx
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

**Critical Badge:**
```tsx
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

---

## 9. Progress/Completion States

### Completion Bar States

```
┌─────────────────────────────────────────────────────────────────┐
│                   PROGRESS BAR VARIATIONS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  0% COMPLETE                                                    │
│  ┌────────────────────────────────────────────────────┐        │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │        │
│  │ (Empty - #2a2a2a)                                  │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                 │
│  33% COMPLETE                                                   │
│  ┌────────────────────────────────────────────────────┐        │
│  │ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │        │
│  │ (Gold gradient - #c9b037 → #d4af37)               │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                 │
│  67% COMPLETE                                                   │
│  ┌────────────────────────────────────────────────────┐        │
│  │ ████████████████████████████████░░░░░░░░░░░░░░░░░ │        │
│  │ (Blue → Gold gradient - #1e90ff → #c9b037)        │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                 │
│  100% COMPLETE                                                  │
│  ┌────────────────────────────────────────────────────┐        │
│  │ ██████████████████████████████████████████████████ │        │
│  │ (Green - #10b981)                                  │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Code Example

```tsx
<vstack gap="xsmall" width="100%">
  <hstack alignment="space-between">
    <text size="small" color="#e0e0e0">진행도</text>
    <text size="small" weight="bold" color="#10b981">67%</text>
  </hstack>

  <zstack width="100%" height="24px">
    {/* Background (empty) */}
    <hstack
      backgroundColor="#2a2a2a"
      border="thin"
      borderColor="#4a4a4a"
      cornerRadius="full"
      width="100%"
      height="24px"
    />

    {/* Filled portion (67%) */}
    <hstack
      backgroundColor="#1e90ff"  // Use gradient: #1e90ff → #c9b037
      cornerRadius="full"
      width="67%"
      height="24px"
      alignment="start"
    />
  </zstack>
</vstack>
```

---

## 10. State Transition Guidelines

### Smooth Transitions

**Default → Hover:**
- Duration: 150ms
- Easing: ease-out
- Properties: background, border, scale

**Hover → Pressed:**
- Duration: 100ms
- Easing: ease-in
- Properties: scale, opacity

**Pressed → Default:**
- Duration: 200ms
- Easing: ease-out
- Properties: scale, opacity

**Locked → Unlocked:**
- Duration: 400ms
- Easing: spring (bounce)
- Properties: opacity, scale, border

### Animation Best Practices

1. **Reduce motion for accessibility**: Respect `prefers-reduced-motion`
2. **Stagger group animations**: 50-100ms delay per item
3. **Use spring physics**: For natural feel on state changes
4. **Limit simultaneous animations**: Max 3-4 properties at once
5. **Provide visual feedback**: All interactions have visible response

---

## Implementation Checklist

**Before deploying component states:**

- [ ] All states have clear visual differentiation
- [ ] Hover states are noticeable but not distracting
- [ ] Pressed states provide immediate feedback
- [ ] Disabled states are clearly non-interactive
- [ ] Loading states indicate ongoing action
- [ ] Success states celebrate completion
- [ ] Error states are prominent and clear
- [ ] All transitions are smooth (150-300ms)
- [ ] Color contrast meets WCAG AA in all states
- [ ] Touch targets remain ≥44px in all states

---

**End of Component State Variations**

Use this comprehensive state matrix to ensure consistent, polished interactions across all Investigation UI components!
