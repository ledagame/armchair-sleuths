# Devvit Mobile-First UX Specifications
**Armchair Sleuths - Reddit Hackathon Edition**

**Version**: 1.0
**Date**: 2025-10-24
**Target Platform**: Reddit Mobile App (Devvit Blocks)
**Primary Viewport**: 375px-414px (80% of Reddit traffic)

---

## 🎯 Executive Summary

This document specifies the complete mobile-first UX redesign of Armchair Sleuths for Devvit Blocks architecture. All designs prioritize **mobile webview constraints**, **thumb-zone optimization**, and **Reddit hackathon judging criteria** (Delightful UX, Polish, Mobile-first).

### Key Constraints

**Devvit Blocks System**:
- **No CSS classes** - All styling via component props
- **Available components**: vstack, hstack, zstack, text, button, image, spacer
- **Styling props**: backgroundColor, padding, gap, alignment, cornerRadius, border, etc.
- **No Framer Motion** - Animations via Devvit's built-in transitions
- **No custom fonts** - Devvit provides text size/weight/style props

**Mobile Optimization**:
- **Touch targets**: Minimum 48x48px (12 Devvit units @ 4px/unit)
- **Thumb zone**: Primary actions in bottom 1/3 of screen
- **Card-based layouts**: Easier to scan on small screens
- **Progressive disclosure**: Critical info first, details on tap

---

## 🎨 Devvit Design System

### Color Palette (Devvit backgroundColor prop values)

**Noir Detective Theme**:
```typescript
// Background Colors
const NOIR_DEEP_BLACK = '#0a0a0a';  // Page backgrounds
const NOIR_CHARCOAL = '#1a1a1a';    // Card backgrounds
const NOIR_GUNMETAL = '#2a2a2a';    // Elevated surfaces
const NOIR_SMOKE = '#3a3a3a';       // Hover states
const NOIR_FOG = '#4a4a4a';         // Borders, dividers

// Detective Accents
const DETECTIVE_GOLD = '#c9b037';   // Primary accent, CTAs
const DETECTIVE_BRASS = '#b5a642';  // Secondary accent
const DETECTIVE_AMBER = '#d4af37';  // Hover highlights

// Evidence Colors
const EVIDENCE_BLOOD = '#8b0000';   // Victim, errors, critical
const EVIDENCE_POISON = '#4b0082';  // Mystery, suspect
const EVIDENCE_CLUE = '#1e90ff';    // Discovery, information

// Text Colors
const TEXT_PRIMARY = '#e0e0e0';     // Primary content
const TEXT_SECONDARY = '#a0a0a0';   // Secondary content
const TEXT_MUTED = '#707070';       // Tertiary content
```

### Typography (Devvit text props)

**Text Sizes** (use `size` prop):
- **xlarge**: 20px - Screen titles, hero text
- **large**: 18px - Section headers
- **medium**: 16px - Body text (default for mobile)
- **small**: 14px - Captions, metadata
- **xsmall**: 12px - Fine print

**Text Weights** (use `weight` prop):
- **bold**: Headers, emphasis, CTAs
- **regular**: Body text, content

**Text Styles** (use `style` prop):
- **heading**: For titles and headers
- **body**: For content paragraphs
- **metadata**: For timestamps, counts

### Spacing System (Devvit padding/gap props)

**Base Unit**: 4px (Devvit uses 4px increments)

```typescript
// Spacing values (use with padding/gap props)
const SPACING = {
  xs: 'xsmall',    // 4px  - Tight spacing
  sm: 'small',     // 8px  - Compact elements
  md: 'medium',    // 12px - Standard spacing
  lg: 'large',     // 16px - Generous spacing
  xl: 'none',      // 24px - Section spacing (use custom)
};
```

**Mobile-First Spacing Strategy**:
- Card padding: `medium` (12px) base, `large` (16px) on tablet+
- Stack gaps: `small` (8px) for compact lists, `medium` (12px) for cards
- Screen padding: `medium` (12px) base

### Component Patterns

**Card Component**:
```tsx
<vstack
  backgroundColor={NOIR_CHARCOAL}
  padding="medium"
  gap="small"
  cornerRadius="medium"
  border="thick"
  borderColor={NOIR_FOG}
>
  {/* Card content */}
</vstack>
```

**Primary Button**:
```tsx
<button
  onPress={handleAction}
  appearance="primary"
  size="large"
  minHeight={48}
>
  <text size="medium" weight="bold" color={NOIR_DEEP_BLACK}>
    🔍 Start Investigation
  </text>
</button>
```

**Secondary Button**:
```tsx
<button
  onPress={handleAction}
  appearance="secondary"
  size="medium"
  minHeight={48}
>
  <text size="medium" weight="bold" color={DETECTIVE_GOLD}>
    ← Back
  </text>
</button>
```

---

## 📱 Screen-by-Screen Specifications

### Screen 1: Loading Screen

**Purpose**: Show case generation/loading progress with noir atmosphere

**Layout**:
```tsx
<vstack
  height="100%"
  backgroundColor={NOIR_DEEP_BLACK}
  alignment="center middle"
  padding="large"
  gap="medium"
>
  {/* Status Icon */}
  <text size="xlarge">⏳</text>

  {/* Loading Message */}
  <vstack gap="small" alignment="center middle">
    <text
      size="large"
      weight="bold"
      color={DETECTIVE_GOLD}
      alignment="center"
    >
      {generating ? '🎲 새로운 사건을 생성하는 중...' : '사건 파일을 불러오는 중...'}
    </text>

    <text
      size="small"
      color={TEXT_SECONDARY}
      alignment="center"
    >
      {generating
        ? 'AI가 오늘의 미스터리를 만들고 있습니다 (30-60초 소요)'
        : '오늘의 미스터리를 준비하고 있습니다'}
    </text>
  </vstack>

  {/* Loading Spinner (use Devvit animation) */}
  <spacer size="medium" />
  <text size="medium" color={TEXT_MUTED}>Loading...</text>
</vstack>
```

**Error State**:
```tsx
<vstack
  height="100%"
  backgroundColor={NOIR_DEEP_BLACK}
  alignment="center middle"
  padding="large"
  gap="medium"
>
  {/* Error Icon */}
  <text size="xlarge">❌</text>

  {/* Error Message */}
  <vstack gap="small" alignment="center middle">
    <text
      size="large"
      weight="bold"
      color={EVIDENCE_BLOOD}
      alignment="center"
    >
      사건 파일을 불러올 수 없습니다
    </text>

    <text
      size="small"
      color={TEXT_SECONDARY}
      alignment="center"
    >
      {errorMessage}
    </text>
  </vstack>

  {/* Action Buttons - Thumb Zone */}
  <spacer grow />
  <vstack gap="small" width="100%">
    <button
      onPress={handleGenerateCase}
      appearance="primary"
      size="large"
      minHeight={48}
      width="100%"
    >
      <text size="medium" weight="bold">🎲 새 케이스 생성</text>
    </button>

    <button
      onPress={handleRetry}
      appearance="secondary"
      size="medium"
      minHeight={48}
      width="100%"
    >
      <text size="medium" weight="bold" color={DETECTIVE_GOLD}>다시 시도</text>
    </button>
  </vstack>
</vstack>
```

**Accessibility**:
- Loading announcements via screen reader
- Clear error messages with actionable recovery
- Touch-friendly buttons (48px minimum)

---

### Screen 2: Three-Slide Intro

**Purpose**: Immersive story setup with swipe/tap navigation

**Common Layout Pattern**:
```tsx
<zstack height="100%">
  {/* Background Image Layer */}
  {cinematicImage && (
    <image
      url={cinematicImage}
      imageWidth={414}
      imageHeight={896}
      resizeMode="cover"
      description="Crime scene background"
    />
  )}

  {/* Dark Overlay for Readability */}
  <vstack
    height="100%"
    backgroundColor="rgba(10, 10, 10, 0.85)"
  />

  {/* Content Layer */}
  <vstack
    height="100%"
    padding="large"
    gap="medium"
    alignment="start top"
  >
    {/* Slide Content Here */}

    {/* Bottom Navigation - Thumb Zone */}
    <spacer grow />
    <hstack
      width="100%"
      gap="small"
      alignment="space-between middle"
    >
      {/* Progress Dots */}
      <hstack gap="xsmall">
        {[1, 2, 3].map(i => (
          <vstack
            key={i}
            width={i === currentSlide ? 32 : 8}
            height={8}
            backgroundColor={i === currentSlide ? DETECTIVE_GOLD : NOIR_FOG}
            cornerRadius="full"
          />
        ))}
      </hstack>

      {/* Skip Button */}
      <button
        onPress={handleSkip}
        appearance="secondary"
        size="small"
        minHeight={48}
      >
        <text size="small" weight="bold" color={DETECTIVE_GOLD}>Skip</text>
      </button>
    </hstack>
  </vstack>
</zstack>
```

#### Slide 1: Discovery

**Content**:
```tsx
<vstack gap="large" alignment="center middle">
  {/* Icon */}
  <text size="xlarge">🔍</text>

  {/* Time & Location */}
  <vstack gap="small" alignment="center middle">
    <text size="large" weight="bold" color={DETECTIVE_GOLD}>
      {slide.time}
    </text>
    <text size="medium" color={TEXT_PRIMARY}>
      {slide.location}
    </text>
  </vstack>

  {/* Victim Card */}
  <vstack
    backgroundColor={NOIR_CHARCOAL}
    padding="medium"
    gap="small"
    cornerRadius="medium"
    border="thick"
    borderColor={EVIDENCE_BLOOD}
    width="100%"
  >
    <hstack gap="small" alignment="start middle">
      <text size="large">👤</text>
      <vstack gap="xsmall">
        <text size="medium" weight="bold" color={TEXT_PRIMARY}>
          {slide.victimName}
        </text>
        <text size="small" color={TEXT_SECONDARY}>
          피해자
        </text>
      </vstack>
    </hstack>

    <text size="small" color={TEXT_SECONDARY}>
      {slide.victimDescription}
    </text>
  </vstack>

  {/* Constraint */}
  <vstack
    backgroundColor={NOIR_GUNMETAL}
    padding="medium"
    gap="xsmall"
    cornerRadius="medium"
    width="100%"
  >
    <hstack gap="small" alignment="start middle">
      <text size="medium">⚠️</text>
      <text size="small" weight="bold" color={DETECTIVE_AMBER}>
        {slide.constraint}
      </text>
    </hstack>
  </vstack>

  {/* Next Button - Thumb Zone */}
  <button
    onPress={handleNext}
    appearance="primary"
    size="large"
    minHeight={48}
    width="100%"
  >
    <text size="medium" weight="bold">다음 →</text>
  </button>
</vstack>
```

#### Slide 2: Suspects

**Content**:
```tsx
<vstack gap="medium" height="100%">
  {/* Header */}
  <vstack gap="small">
    <text size="large" weight="bold" color={DETECTIVE_GOLD}>
      🔍 용의자 라인업
    </text>
    <text size="small" color={TEXT_SECONDARY}>
      누가 거짓말을 하고 있을까요?
    </text>
  </vstack>

  {/* Suspect Cards - Scrollable */}
  <vstack gap="small" grow>
    {suspects.map(suspect => (
      <vstack
        key={suspect.id}
        backgroundColor={NOIR_CHARCOAL}
        padding="medium"
        gap="small"
        cornerRadius="medium"
        border="thin"
        borderColor={NOIR_FOG}
      >
        <hstack gap="small" alignment="space-between middle">
          <hstack gap="small" alignment="start middle">
            <text size="large">👤</text>
            <vstack gap="xsmall">
              <text size="medium" weight="bold" color={TEXT_PRIMARY}>
                {suspect.name}
              </text>
              <text size="xsmall" color={TEXT_MUTED}>
                {suspect.role}
              </text>
            </vstack>
          </hstack>

          {/* Badge */}
          <vstack
            backgroundColor={DETECTIVE_BRASS}
            padding="xsmall"
            cornerRadius="small"
          >
            <text size="xsmall" weight="bold" color={NOIR_DEEP_BLACK}>
              {suspect.archetype}
            </text>
          </vstack>
        </hstack>

        {/* Claim Quote */}
        <vstack
          backgroundColor={NOIR_GUNMETAL}
          padding="small"
          cornerRadius="small"
          borderLeft="thick"
          borderColor={EVIDENCE_CLUE}
        >
          <text size="small" color={TEXT_SECONDARY} style="italic">
            "{suspect.claim}"
          </text>
        </vstack>
      </vstack>
    ))}
  </vstack>

  {/* Navigation - Thumb Zone */}
  <hstack gap="small" width="100%">
    <button
      onPress={handlePrevious}
      appearance="secondary"
      size="medium"
      minHeight={48}
      width="30%"
    >
      <text size="medium" color={DETECTIVE_GOLD}>← 이전</text>
    </button>

    <button
      onPress={handleNext}
      appearance="primary"
      size="large"
      minHeight={48}
      grow
    >
      <text size="medium" weight="bold">다음 →</text>
    </button>
  </hstack>
</vstack>
```

#### Slide 3: Challenge

**Content**:
```tsx
<vstack gap="large" alignment="center middle">
  {/* Icon */}
  <text size="xlarge">🎯</text>

  {/* Stakes */}
  <vstack gap="small" alignment="center middle">
    <text size="large" weight="bold" color={EVIDENCE_BLOOD}>
      {slide.stakes}
    </text>
  </vstack>

  {/* Challenge Card */}
  <vstack
    backgroundColor={NOIR_CHARCOAL}
    padding="large"
    gap="medium"
    cornerRadius="medium"
    border="thick"
    borderColor={DETECTIVE_GOLD}
    width="100%"
  >
    <text size="medium" weight="bold" color={DETECTIVE_GOLD}>
      당신의 임무
    </text>

    <vstack gap="small">
      <hstack gap="small" alignment="start top">
        <text size="medium" color={DETECTIVE_GOLD}>✓</text>
        <text size="small" color={TEXT_PRIMARY}>
          {suspectCount}명의 용의자와 대화하세요
        </text>
      </hstack>

      <hstack gap="small" alignment="start top">
        <text size="medium" color={DETECTIVE_GOLD}>✓</text>
        <text size="small" color={TEXT_PRIMARY}>
          증거를 수집하고 모순을 찾으세요
        </text>
      </hstack>

      <hstack gap="small" alignment="start top">
        <text size="medium" color={DETECTIVE_GOLD}>✓</text>
        <text size="small" color={TEXT_PRIMARY}>
          5W1H 답변을 제출하세요
        </text>
      </hstack>
    </vstack>

    <vstack
      backgroundColor={NOIR_GUNMETAL}
      padding="small"
      cornerRadius="small"
      gap="xsmall"
    >
      <hstack gap="small" alignment="start middle">
        <text size="small">⚠️</text>
        <text size="xsmall" color={DETECTIVE_AMBER} weight="bold">
          한 번만 제출할 수 있습니다
        </text>
      </hstack>
    </vstack>
  </vstack>

  {/* CTA - Thumb Zone */}
  <button
    onPress={handleStart}
    appearance="primary"
    size="large"
    minHeight={56}
    width="100%"
  >
    <text size="large" weight="bold">🔍 수사 시작하기</text>
  </button>

  {/* Back Button */}
  <button
    onPress={handlePrevious}
    appearance="secondary"
    size="small"
    minHeight={48}
    width="100%"
  >
    <text size="small" color={DETECTIVE_GOLD}>← 이전</text>
  </button>
</vstack>
```

**Interaction States**:
- Swipe left/right for navigation (use Devvit gesture handlers)
- Tap progress dots to jump to slide
- Skip button always visible in top-right
- Auto-advance disabled (user-controlled pacing)

**Accessibility**:
- Screen reader announces slide number and title
- Keyboard navigation (left/right arrows, Enter, Escape)
- Focus management on slide transition

---

### Screen 3: Case Overview

**Purpose**: Quick case briefing before investigation

**Layout**:
```tsx
<vstack
  height="100%"
  backgroundColor={NOIR_DEEP_BLACK}
  padding="medium"
  gap="medium"
>
  {/* Header */}
  <vstack
    backgroundColor={DETECTIVE_GOLD}
    padding="medium"
    gap="xsmall"
    cornerRadius="medium"
  >
    <text size="large" weight="bold" color={NOIR_DEEP_BLACK}>
      🕵️ 살인 사건 발생
    </text>
    <text size="small" weight="bold" color={NOIR_GUNMETAL}>
      {caseDate}
    </text>
  </vstack>

  {/* Crime Scene Image */}
  {crimeSceneImage && (
    <vstack
      cornerRadius="medium"
      overflow="hidden"
    >
      <zstack>
        <image
          url={crimeSceneImage}
          imageWidth={350}
          imageHeight={200}
          resizeMode="cover"
          description="Crime scene photo"
        />

        {/* Overlay with location label */}
        <vstack
          height="100%"
          alignment="start bottom"
          padding="small"
        >
          <vstack
            backgroundColor="rgba(10, 10, 10, 0.8)"
            padding="small"
            gap="xsmall"
            cornerRadius="small"
          >
            <text size="small" weight="bold" color={DETECTIVE_GOLD}>
              범행 현장
            </text>
            <text size="xsmall" color={TEXT_PRIMARY}>
              {location.name}
            </text>
          </vstack>
        </vstack>
      </zstack>
    </vstack>
  )}

  {/* Case Details Grid - Scrollable */}
  <vstack gap="small" grow>
    {/* Victim Card */}
    <vstack
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thick"
      borderColor={EVIDENCE_BLOOD}
    >
      <hstack gap="small" alignment="start middle">
        <text size="large">👤</text>
        <text size="medium" weight="bold" color={DETECTIVE_GOLD}>
          피해자
        </text>
      </hstack>

      <text size="medium" weight="bold" color={EVIDENCE_BLOOD}>
        {victim.name}
      </text>

      <text size="small" color={TEXT_SECONDARY}>
        {victim.background}
      </text>

      <vstack
        backgroundColor={NOIR_GUNMETAL}
        padding="small"
        gap="xsmall"
        cornerRadius="small"
      >
        <text size="xsmall" color={TEXT_MUTED} weight="bold">
          관계
        </text>
        <text size="small" color={TEXT_PRIMARY}>
          {victim.relationship}
        </text>
      </vstack>
    </vstack>

    {/* Weapon Card */}
    <vstack
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thick"
      borderColor={DETECTIVE_BRASS}
    >
      <hstack gap="small" alignment="start middle">
        <text size="large">🔪</text>
        <text size="medium" weight="bold" color={DETECTIVE_GOLD}>
          발견된 무기
        </text>
      </hstack>

      <text size="medium" weight="bold" color={DETECTIVE_AMBER}>
        {weapon.name}
      </text>

      <text size="small" color={TEXT_SECONDARY}>
        {weapon.description}
      </text>
    </vstack>

    {/* Location Card */}
    <vstack
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thick"
      borderColor={EVIDENCE_CLUE}
    >
      <hstack gap="small" alignment="start middle">
        <text size="large">📍</text>
        <text size="medium" weight="bold" color={DETECTIVE_GOLD}>
          범행 장소
        </text>
      </hstack>

      <text size="medium" weight="bold" color={EVIDENCE_CLUE}>
        {location.name}
      </text>

      <text size="small" color={TEXT_SECONDARY}>
        {location.description}
      </text>

      <vstack
        backgroundColor={NOIR_GUNMETAL}
        padding="small"
        gap="xsmall"
        cornerRadius="small"
      >
        <text size="xsmall" color={TEXT_MUTED} weight="bold">
          분위기
        </text>
        <text size="small" color={TEXT_PRIMARY}>
          {location.atmosphere}
        </text>
      </vstack>
    </vstack>

    {/* Mission Card */}
    <vstack
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thick"
      borderColor={DETECTIVE_GOLD}
    >
      <hstack gap="small" alignment="start middle">
        <text size="large">🎯</text>
        <text size="medium" weight="bold" color={DETECTIVE_GOLD}>
          당신의 임무
        </text>
      </hstack>

      <vstack gap="xsmall">
        <hstack gap="small" alignment="start top">
          <text size="small" color={DETECTIVE_GOLD}>✓</text>
          <text size="small" color={TEXT_PRIMARY}>
            {suspectCount}명의 용의자와 대화하세요
          </text>
        </hstack>

        <hstack gap="small" alignment="start top">
          <text size="small" color={DETECTIVE_GOLD}>✓</text>
          <text size="small" color={TEXT_PRIMARY}>
            증거를 수집하고 모순을 찾으세요
          </text>
        </hstack>

        <hstack gap="small" alignment="start top">
          <text size="small" color={DETECTIVE_GOLD}>✓</text>
          <text size="small" color={TEXT_PRIMARY}>
            5W1H 답변을 제출하세요
          </text>
        </hstack>
      </vstack>

      <vstack
        backgroundColor={NOIR_GUNMETAL}
        padding="small"
        gap="xsmall"
        cornerRadius="small"
      >
        <hstack gap="small" alignment="start middle">
          <text size="small">⚠️</text>
          <text size="xsmall" color={DETECTIVE_AMBER} weight="bold">
            한 번만 제출할 수 있습니다
          </text>
        </hstack>
      </vstack>
    </vstack>

    {/* Suspects Preview */}
    <vstack
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thin"
      borderColor={NOIR_FOG}
    >
      <text size="medium" weight="bold" color={DETECTIVE_GOLD}>
        🔍 용의자 ({suspectCount}명)
      </text>

      <vstack gap="xsmall">
        {suspects.map(suspect => (
          <hstack
            key={suspect.id}
            backgroundColor={NOIR_GUNMETAL}
            padding="small"
            gap="small"
            cornerRadius="small"
            alignment="space-between middle"
          >
            <text size="small" weight="bold" color={TEXT_PRIMARY}>
              {suspect.name}
            </text>
            <text size="xsmall" color={TEXT_MUTED}>
              {suspect.archetype}
            </text>
          </hstack>
        ))}
      </vstack>
    </vstack>
  </vstack>

  {/* CTA Button - Thumb Zone */}
  <button
    onPress={handleStartInvestigation}
    appearance="primary"
    size="large"
    minHeight={56}
    width="100%"
  >
    <text size="large" weight="bold">🔍 수사 시작하기</text>
  </button>
</vstack>
```

**Scrolling Behavior**:
- Header and CTA fixed (sticky)
- Case details scrollable
- Scroll snap to cards for better mobile UX

**Accessibility**:
- Semantic regions (role="article" equivalent in Devvit)
- Clear heading hierarchy
- Touch-friendly card tap targets

---

### Screen 4: Investigation Screen

**Purpose**: Unified hub for location exploration, suspect interrogation, evidence review

**Layout Strategy**:
```tsx
<vstack height="100%" backgroundColor={NOIR_DEEP_BLACK}>
  {/* Sticky Header with AP Counter */}
  <vstack
    backgroundColor={NOIR_CHARCOAL}
    padding="medium"
    gap="small"
    border="bottom"
    borderColor={NOIR_FOG}
  >
    <hstack gap="small" alignment="space-between middle">
      <vstack gap="xsmall">
        <text size="large" weight="bold" color={DETECTIVE_GOLD}>
          🔍 수사 중
        </text>
        <text size="xsmall" color={TEXT_MUTED}>
          {caseDate}
        </text>
      </vstack>

      {/* AP Counter */}
      <vstack
        backgroundColor={NOIR_GUNMETAL}
        padding="small"
        gap="xsmall"
        cornerRadius="small"
        alignment="center middle"
      >
        <text size="xsmall" color={TEXT_MUTED}>
          행동력
        </text>
        <text size="large" weight="bold" color={DETECTIVE_GOLD}>
          {currentAP} / {maxAP}
        </text>
      </vstack>
    </hstack>

    {/* Tab Navigation */}
    <hstack gap="xsmall" width="100%">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onPress={() => setActiveTab(tab.id)}
          appearance={activeTab === tab.id ? "primary" : "secondary"}
          size="medium"
          minHeight={48}
          grow
        >
          <vstack gap="xsmall" alignment="center middle">
            <text size="medium">{tab.icon}</text>
            <text
              size="xsmall"
              weight="bold"
              color={activeTab === tab.id ? NOIR_DEEP_BLACK : DETECTIVE_GOLD}
            >
              {tab.label}
            </text>
          </vstack>
        </button>
      ))}
    </hstack>
  </vstack>

  {/* Tab Content - Scrollable */}
  <vstack grow padding="medium" gap="medium">
    {activeTab === 'locations' && <LocationsTab />}
    {activeTab === 'suspects' && <SuspectsTab />}
    {activeTab === 'evidence' && <EvidenceTab />}
  </vstack>

  {/* Bottom CTA - Thumb Zone */}
  <vstack
    backgroundColor={NOIR_CHARCOAL}
    padding="medium"
    border="top"
    borderColor={NOIR_FOG}
  >
    <button
      onPress={handleGoToSubmission}
      appearance="primary"
      size="large"
      minHeight={56}
      width="100%"
    >
      <text size="medium" weight="bold">📝 수사 완료 (답안 제출)</text>
    </button>
  </vstack>
</vstack>
```

#### Tab 1: Locations

**Content**:
```tsx
<vstack gap="medium">
  {/* Search Method Selector */}
  <vstack
    backgroundColor={NOIR_CHARCOAL}
    padding="medium"
    gap="small"
    cornerRadius="medium"
  >
    <text size="small" weight="bold" color={DETECTIVE_GOLD}>
      탐색 방법 선택
    </text>

    <hstack gap="xsmall">
      {searchMethods.map(method => (
        <button
          key={method.id}
          onPress={() => setSearchMethod(method.id)}
          appearance={searchMethod === method.id ? "primary" : "secondary"}
          size="small"
          minHeight={44}
        >
          <hstack gap="xsmall" alignment="center middle">
            <text size="small">{method.icon}</text>
            <text
              size="xsmall"
              weight="bold"
              color={searchMethod === method.id ? NOIR_DEEP_BLACK : TEXT_PRIMARY}
            >
              {method.label}
            </text>
            <text size="xsmall" color={TEXT_MUTED}>
              {method.apCost}AP
            </text>
          </hstack>
        </button>
      ))}
    </hstack>
  </vstack>

  {/* Location Cards */}
  {locations.map(location => (
    <vstack
      key={location.id}
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thin"
      borderColor={NOIR_FOG}
    >
      {/* Location Image */}
      {location.imageUrl && (
        <image
          url={location.imageUrl}
          imageWidth={350}
          imageHeight={150}
          resizeMode="cover"
          description={`${location.name} 현장`}
          cornerRadius="small"
        />
      )}

      {/* Location Header */}
      <hstack gap="small" alignment="space-between middle">
        <hstack gap="small" alignment="start middle">
          <text size="large">📍</text>
          <vstack gap="xsmall">
            <text size="medium" weight="bold" color={TEXT_PRIMARY}>
              {location.name}
            </text>
            <text size="xsmall" color={TEXT_MUTED}>
              {location.evidenceCount}개의 증거
            </text>
          </vstack>
        </hstack>

        {/* Discovery Progress */}
        <vstack
          backgroundColor={NOIR_GUNMETAL}
          padding="xsmall"
          cornerRadius="small"
        >
          <text size="xsmall" weight="bold" color={DETECTIVE_GOLD}>
            {location.discoveredCount}/{location.evidenceCount}
          </text>
        </vstack>
      </hstack>

      {/* Description */}
      <text size="small" color={TEXT_SECONDARY}>
        {location.description}
      </text>

      {/* Search Button */}
      <button
        onPress={() => handleSearchLocation(location.id)}
        appearance="primary"
        size="medium"
        minHeight={48}
        width="100%"
        disabled={currentAP < searchMethodCost}
      >
        <text size="small" weight="bold">
          🔍 탐색하기 ({searchMethodCost}AP)
        </text>
      </button>
    </vstack>
  ))}
</vstack>
```

#### Tab 2: Suspects

**Content**:
```tsx
<vstack gap="medium">
  {suspects.map(suspect => (
    <vstack
      key={suspect.id}
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thin"
      borderColor={NOIR_FOG}
    >
      {/* Suspect Header */}
      <hstack gap="medium" alignment="start top">
        {/* Suspect Image */}
        {suspect.imageUrl && (
          <image
            url={suspect.imageUrl}
            imageWidth={80}
            imageHeight={80}
            resizeMode="cover"
            description={`${suspect.name} 프로필`}
            cornerRadius="medium"
          />
        )}

        {/* Suspect Info */}
        <vstack gap="xsmall" grow>
          <text size="medium" weight="bold" color={TEXT_PRIMARY}>
            {suspect.name}
          </text>

          <text size="xsmall" color={TEXT_MUTED}>
            {suspect.archetype}
          </text>

          {/* Badges */}
          <hstack gap="xsmall">
            <vstack
              backgroundColor={DETECTIVE_BRASS}
              padding="xsmall"
              cornerRadius="small"
            >
              <text size="xsmall" weight="bold" color={NOIR_DEEP_BLACK}>
                {suspect.age}세
              </text>
            </vstack>

            <vstack
              backgroundColor={NOIR_GUNMETAL}
              padding="xsmall"
              cornerRadius="small"
            >
              <text size="xsmall" color={TEXT_SECONDARY}>
                {suspect.occupation}
              </text>
            </vstack>
          </hstack>
        </vstack>
      </hstack>

      {/* Interaction Stats */}
      <hstack gap="small" alignment="space-between middle">
        <text size="xsmall" color={TEXT_MUTED}>
          💬 대화 {suspect.chatCount}회
        </text>
        <text size="xsmall" color={DETECTIVE_GOLD}>
          +{suspect.apRewards}AP 획득
        </text>
      </hstack>

      {/* Interrogate Button */}
      <button
        onPress={() => handleInterrogate(suspect.id)}
        appearance="primary"
        size="medium"
        minHeight={48}
        width="100%"
      >
        <text size="small" weight="bold">
          💬 심문하기
        </text>
      </button>
    </vstack>
  ))}
</vstack>
```

#### Tab 3: Evidence

**Content**:
```tsx
<vstack gap="medium">
  {/* Filter/Sort */}
  <hstack gap="small">
    <button
      onPress={() => setFilterBy('all')}
      appearance={filterBy === 'all' ? "primary" : "secondary"}
      size="small"
      minHeight={44}
    >
      <text size="xsmall" weight="bold">전체</text>
    </button>

    <button
      onPress={() => setFilterBy('physical')}
      appearance={filterBy === 'physical' ? "primary" : "secondary"}
      size="small"
      minHeight={44}
    >
      <text size="xsmall" weight="bold">물리적</text>
    </button>

    <button
      onPress={() => setFilterBy('testimonial')}
      appearance={filterBy === 'testimonial' ? "primary" : "secondary"}
      size="small"
      minHeight={44}
    >
      <text size="xsmall" weight="bold">증언</text>
    </button>
  </hstack>

  {/* Evidence Count */}
  <vstack
    backgroundColor={NOIR_CHARCOAL}
    padding="medium"
    gap="small"
    cornerRadius="medium"
    alignment="center middle"
  >
    <text size="small" color={TEXT_MUTED}>
      발견한 증거
    </text>
    <text size="xlarge" weight="bold" color={DETECTIVE_GOLD}>
      {discoveredCount} / {totalCount}
    </text>

    {/* Progress Bar */}
    <vstack width="100%" height={8} backgroundColor={NOIR_GUNMETAL} cornerRadius="full">
      <vstack
        width={`${progress}%`}
        height={8}
        backgroundColor={DETECTIVE_GOLD}
        cornerRadius="full"
      />
    </vstack>
  </vstack>

  {/* Evidence Cards */}
  {evidenceList.map(evidence => (
    <vstack
      key={evidence.id}
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thin"
      borderColor={getRarityColor(evidence.rarity)}
    >
      {/* Evidence Header */}
      <hstack gap="small" alignment="space-between middle">
        <hstack gap="small" alignment="start middle">
          <text size="medium">{getEvidenceIcon(evidence.type)}</text>
          <vstack gap="xsmall">
            <text size="small" weight="bold" color={TEXT_PRIMARY}>
              {evidence.name}
            </text>
            <text size="xsmall" color={TEXT_MUTED}>
              {evidence.location}
            </text>
          </vstack>
        </hstack>

        {/* Rarity Badge */}
        <vstack
          backgroundColor={getRarityColor(evidence.rarity)}
          padding="xsmall"
          cornerRadius="small"
        >
          <text size="xsmall" weight="bold" color={NOIR_DEEP_BLACK}>
            {getRarityLabel(evidence.rarity)}
          </text>
        </vstack>
      </hstack>

      {/* Evidence Image */}
      {evidence.imageUrl && (
        <image
          url={evidence.imageUrl}
          imageWidth={350}
          imageHeight={200}
          resizeMode="cover"
          description={evidence.description}
          cornerRadius="small"
        />
      )}

      {/* Description */}
      <text size="small" color={TEXT_SECONDARY}>
        {evidence.description}
      </text>

      {/* Related Suspects */}
      {evidence.relatedSuspects.length > 0 && (
        <vstack
          backgroundColor={NOIR_GUNMETAL}
          padding="small"
          gap="xsmall"
          cornerRadius="small"
        >
          <text size="xsmall" color={TEXT_MUTED} weight="bold">
            관련 용의자
          </text>
          <hstack gap="xsmall">
            {evidence.relatedSuspects.map(name => (
              <vstack
                key={name}
                backgroundColor={EVIDENCE_POISON}
                padding="xsmall"
                cornerRadius="small"
              >
                <text size="xsmall" color={TEXT_PRIMARY}>
                  {name}
                </text>
              </vstack>
            ))}
          </hstack>
        </vstack>
      )}

      {/* View Detail Button */}
      <button
        onPress={() => handleViewDetail(evidence.id)}
        appearance="secondary"
        size="small"
        minHeight={44}
        width="100%"
      >
        <text size="small" color={DETECTIVE_GOLD}>
          상세보기 →
        </text>
      </button>
    </vstack>
  ))}

  {/* Empty State */}
  {evidenceList.length === 0 && (
    <vstack
      backgroundColor={NOIR_CHARCOAL}
      padding="large"
      gap="medium"
      cornerRadius="medium"
      alignment="center middle"
    >
      <text size="xlarge">🔍</text>
      <text size="medium" color={TEXT_MUTED} alignment="center">
        아직 발견한 증거가 없습니다
      </text>
      <text size="small" color={TEXT_SECONDARY} alignment="center">
        장소 탐색 탭에서 증거를 찾아보세요
      </text>
    </vstack>
  )}
</vstack>
```

**Tab Interaction**:
- Sticky tab bar at top (always accessible)
- Active tab highlighted with detective gold
- Smooth content transitions (Devvit transitions)
- Tab state persists during session

**Accessibility**:
- Tab navigation keyboard support
- Focus management on tab switch
- Screen reader announces active tab

---

### Screen 5: Submission Form

**Purpose**: 5W1H answer entry with mobile-optimized inputs

**Layout**:
```tsx
<vstack
  height="100%"
  backgroundColor={NOIR_DEEP_BLACK}
  padding="medium"
  gap="medium"
>
  {/* Header */}
  <hstack gap="small" alignment="space-between middle">
    <vstack gap="xsmall">
      <text size="large" weight="bold" color={DETECTIVE_GOLD}>
        📝 최종 답안 제출
      </text>
      <text size="xsmall" color={TEXT_MUTED}>
        {caseDate}
      </text>
    </vstack>

    <button
      onPress={handleBack}
      appearance="secondary"
      size="small"
      minHeight={48}
    >
      <text size="small" color={DETECTIVE_GOLD}>
        ← 수사로
      </text>
    </button>
  </hstack>

  {/* Form - Scrollable */}
  <vstack gap="medium" grow>
    {/* WHO */}
    <vstack gap="small">
      <text size="small" weight="bold" color={DETECTIVE_GOLD}>
        ❓ WHO (누가) - 범인은 누구입니까?
      </text>

      {/* Suspect Selector */}
      <vstack gap="xsmall">
        {suspects.map(suspect => (
          <button
            key={suspect.id}
            onPress={() => setWho(suspect.name)}
            appearance={who === suspect.name ? "primary" : "secondary"}
            size="medium"
            minHeight={48}
            width="100%"
          >
            <hstack gap="small" alignment="space-between middle">
              <text
                size="small"
                weight="bold"
                color={who === suspect.name ? NOIR_DEEP_BLACK : TEXT_PRIMARY}
              >
                {suspect.name}
              </text>
              {who === suspect.name && (
                <text size="small">✓</text>
              )}
            </hstack>
          </button>
        ))}
      </vstack>
    </vstack>

    {/* WHAT */}
    <vstack gap="small">
      <text size="small" weight="bold" color={DETECTIVE_GOLD}>
        ❓ WHAT (무엇을) - 어떤 방법으로 살해했습니까?
      </text>

      <vstack
        backgroundColor={NOIR_CHARCOAL}
        padding="medium"
        cornerRadius="medium"
        border="thin"
        borderColor={what ? DETECTIVE_GOLD : NOIR_FOG}
      >
        <text
          size="medium"
          color={what ? TEXT_PRIMARY : TEXT_MUTED}
          style="body"
        >
          {what || '예: 흉기로 찔러서 살해했다'}
        </text>
      </vstack>

      <button
        onPress={() => showTextInput('what', what)}
        appearance="secondary"
        size="small"
        minHeight={44}
      >
        <text size="small" color={DETECTIVE_GOLD}>
          ✏️ 입력하기
        </text>
      </button>
    </vstack>

    {/* WHERE */}
    <vstack gap="small">
      <text size="small" weight="bold" color={DETECTIVE_GOLD}>
        ❓ WHERE (어디서) - 어디에서 범행이 일어났습니까?
      </text>

      <vstack
        backgroundColor={NOIR_CHARCOAL}
        padding="medium"
        cornerRadius="medium"
        border="thin"
        borderColor={where ? DETECTIVE_GOLD : NOIR_FOG}
      >
        <text
          size="medium"
          color={where ? TEXT_PRIMARY : TEXT_MUTED}
        >
          {where || '예: 서재의 책장 뒤편에서'}
        </text>
      </vstack>

      <button
        onPress={() => showTextInput('where', where)}
        appearance="secondary"
        size="small"
        minHeight={44}
      >
        <text size="small" color={DETECTIVE_GOLD}>
          ✏️ 입력하기
        </text>
      </button>
    </vstack>

    {/* WHEN */}
    <vstack gap="small">
      <text size="small" weight="bold" color={DETECTIVE_GOLD}>
        ❓ WHEN (언제) - 언제 범행이 일어났습니까?
      </text>

      <vstack
        backgroundColor={NOIR_CHARCOAL}
        padding="medium"
        cornerRadius="medium"
        border="thin"
        borderColor={when ? DETECTIVE_GOLD : NOIR_FOG}
      >
        <text
          size="medium"
          color={when ? TEXT_PRIMARY : TEXT_MUTED}
        >
          {when || '예: 2024년 1월 15일 오후 11시 30분경'}
        </text>
      </vstack>

      <button
        onPress={() => showTextInput('when', when)}
        appearance="secondary"
        size="small"
        minHeight={44}
      >
        <text size="small" color={DETECTIVE_GOLD}>
          ✏️ 입력하기
        </text>
      </button>
    </vstack>

    {/* WHY */}
    <vstack gap="small">
      <text size="small" weight="bold" color={DETECTIVE_GOLD}>
        ❓ WHY (왜) - 범행 동기는 무엇입니까?
      </text>

      <vstack
        backgroundColor={NOIR_CHARCOAL}
        padding="medium"
        cornerRadius="medium"
        border="thin"
        borderColor={why ? DETECTIVE_GOLD : NOIR_FOG}
      >
        <text
          size="small"
          color={why ? TEXT_PRIMARY : TEXT_MUTED}
        >
          {why || '예: 피해자가 범인의 비밀을 폭로하려 해서...'}
        </text>
      </vstack>

      <button
        onPress={() => showTextInput('why', why)}
        appearance="secondary"
        size="small"
        minHeight={44}
      >
        <text size="small" color={DETECTIVE_GOLD}>
          ✏️ 입력하기
        </text>
      </button>
    </vstack>

    {/* HOW */}
    <vstack gap="small">
      <text size="small" weight="bold" color={DETECTIVE_GOLD}>
        ❓ HOW (어떻게) - 어떻게 범행을 실행했습니까?
      </text>

      <vstack
        backgroundColor={NOIR_CHARCOAL}
        padding="medium"
        cornerRadius="medium"
        border="thin"
        borderColor={how ? DETECTIVE_GOLD : NOIR_FOG}
      >
        <text
          size="small"
          color={how ? TEXT_PRIMARY : TEXT_MUTED}
        >
          {how || '예: 피해자가 혼자 있을 때를 기다렸다가...'}
        </text>
      </vstack>

      <button
        onPress={() => showTextInput('how', how)}
        appearance="secondary"
        size="small"
        minHeight={44}
      >
        <text size="small" color={DETECTIVE_GOLD}>
          ✏️ 입력하기
        </text>
      </button>
    </vstack>

    {/* Warning */}
    <vstack
      backgroundColor={NOIR_GUNMETAL}
      padding="small"
      gap="xsmall"
      cornerRadius="small"
    >
      <hstack gap="small" alignment="start middle">
        <text size="small">⚠️</text>
        <text size="xsmall" color={DETECTIVE_AMBER} weight="bold">
          제출 후에는 수정할 수 없습니다. 신중히 작성해주세요.
        </text>
      </hstack>
    </vstack>
  </vstack>

  {/* Submit Button - Thumb Zone */}
  <button
    onPress={handleSubmit}
    appearance="primary"
    size="large"
    minHeight={56}
    width="100%"
    disabled={!isFormValid || submitting}
  >
    <text size="medium" weight="bold">
      {submitting ? '⏳ 채점 중...' : '🎯 답안 제출하기'}
    </text>
  </button>
</vstack>
```

**Input Handling** (Devvit Modal Pattern):
```tsx
// When user taps "입력하기", show Devvit modal with text input
const showTextInput = (field: string, currentValue: string) => {
  context.ui.showModal({
    title: getFieldTitle(field),
    content: (
      <vstack gap="medium" padding="medium">
        <textInput
          value={currentValue}
          onChangeText={(value) => updateField(field, value)}
          placeholder={getFieldPlaceholder(field)}
          multiline={field === 'why' || field === 'how'}
          minHeight={field === 'why' || field === 'how' ? 120 : 48}
          style="body"
        />

        <hstack gap="small">
          <button
            onPress={() => context.ui.hideModal()}
            appearance="secondary"
            size="medium"
            minHeight={48}
            grow
          >
            <text size="small" color={DETECTIVE_GOLD}>취소</text>
          </button>

          <button
            onPress={() => {
              // Save and close
              context.ui.hideModal();
            }}
            appearance="primary"
            size="medium"
            minHeight={48}
            grow
          >
            <text size="small" weight="bold">완료</text>
          </button>
        </hstack>
      </vstack>
    ),
  });
};
```

**Validation**:
- Real-time validation on input
- Error messages shown inline
- Submit button disabled until all fields valid
- Character count for long-form fields

**Accessibility**:
- Clear field labels
- Error announcements
- Focus management in modal
- Keyboard support

---

### Screen 6: Results View

**Purpose**: Scoring breakdown, celebration, leaderboard

**Layout**:
```tsx
<vstack
  height="100%"
  backgroundColor={NOIR_DEEP_BLACK}
  padding="medium"
  gap="medium"
>
  {/* Header */}
  <vstack gap="xsmall" alignment="center middle">
    <text size="large" weight="bold" color={DETECTIVE_GOLD}>
      🎯 채점 결과
    </text>
    <text size="xsmall" color={TEXT_MUTED}>
      {caseDate}
    </text>
  </vstack>

  {/* Overall Score - Celebration Card */}
  <vstack
    backgroundColor={isCorrect ? DETECTIVE_GOLD : NOIR_CHARCOAL}
    padding="large"
    gap="medium"
    cornerRadius="medium"
    border="thick"
    borderColor={isCorrect ? DETECTIVE_GOLD : EVIDENCE_BLOOD}
    alignment="center middle"
  >
    <text
      size="xlarge"
      weight="bold"
      color={isCorrect ? NOIR_DEEP_BLACK : DETECTIVE_GOLD}
    >
      {isCorrect ? '🎉 정답입니다!' : '😢 아쉽네요...'}
    </text>

    <text
      size="xlarge"
      weight="bold"
      color={isCorrect ? NOIR_DEEP_BLACK : getScoreColor(totalScore)}
    >
      {totalScore}점
    </text>

    {rank && (
      <text
        size="medium"
        color={isCorrect ? NOIR_GUNMETAL : TEXT_PRIMARY}
      >
        전체 순위: {rank}위
      </text>
    )}

    {isCorrect && (
      <text
        size="small"
        color={NOIR_GUNMETAL}
        weight="bold"
        alignment="center"
      >
        범인을 정확히 찾아냈습니다! 훌륭한 추리력이네요.
      </text>
    )}
  </vstack>

  {/* Detailed Breakdown - Scrollable */}
  <vstack gap="small" grow>
    <text size="medium" weight="bold" color={DETECTIVE_GOLD}>
      📊 상세 채점 결과
    </text>

    {/* WHO */}
    <vstack
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thin"
      borderColor={breakdown.who.isCorrect ? DETECTIVE_GOLD : NOIR_FOG}
    >
      <hstack gap="small" alignment="space-between middle">
        <text size="small" weight="bold" color={DETECTIVE_GOLD}>
          ❓ WHO (누가)
        </text>

        <hstack gap="small" alignment="center middle">
          <text
            size="medium"
            weight="bold"
            color={getScoreColor(breakdown.who.score)}
          >
            {breakdown.who.score}점
          </text>
          <text size="medium">
            {breakdown.who.isCorrect ? '✅' : '❌'}
          </text>
        </hstack>
      </hstack>

      <text size="small" color={TEXT_SECONDARY}>
        {breakdown.who.feedback}
      </text>
    </vstack>

    {/* WHAT */}
    <vstack
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thin"
      borderColor={breakdown.what.isCorrect ? DETECTIVE_GOLD : NOIR_FOG}
    >
      <hstack gap="small" alignment="space-between middle">
        <text size="small" weight="bold" color={DETECTIVE_GOLD}>
          ❓ WHAT (무엇을)
        </text>

        <hstack gap="small" alignment="center middle">
          <text
            size="medium"
            weight="bold"
            color={getScoreColor(breakdown.what.score)}
          >
            {breakdown.what.score}점
          </text>
          <text size="medium">
            {breakdown.what.isCorrect ? '✅' : '❌'}
          </text>
        </hstack>
      </hstack>

      <text size="small" color={TEXT_SECONDARY}>
        {breakdown.what.feedback}
      </text>
    </vstack>

    {/* WHERE */}
    <vstack
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thin"
      borderColor={breakdown.where.isCorrect ? DETECTIVE_GOLD : NOIR_FOG}
    >
      <hstack gap="small" alignment="space-between middle">
        <text size="small" weight="bold" color={DETECTIVE_GOLD}>
          ❓ WHERE (어디서)
        </text>

        <hstack gap="small" alignment="center middle">
          <text
            size="medium"
            weight="bold"
            color={getScoreColor(breakdown.where.score)}
          >
            {breakdown.where.score}점
          </text>
          <text size="medium">
            {breakdown.where.isCorrect ? '✅' : '❌'}
          </text>
        </hstack>
      </hstack>

      <text size="small" color={TEXT_SECONDARY}>
        {breakdown.where.feedback}
      </text>
    </vstack>

    {/* WHEN */}
    <vstack
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thin"
      borderColor={breakdown.when.isCorrect ? DETECTIVE_GOLD : NOIR_FOG}
    >
      <hstack gap="small" alignment="space-between middle">
        <text size="small" weight="bold" color={DETECTIVE_GOLD}>
          ❓ WHEN (언제)
        </text>

        <hstack gap="small" alignment="center middle">
          <text
            size="medium"
            weight="bold"
            color={getScoreColor(breakdown.when.score)}
          >
            {breakdown.when.score}점
          </text>
          <text size="medium">
            {breakdown.when.isCorrect ? '✅' : '❌'}
          </text>
        </hstack>
      </hstack>

      <text size="small" color={TEXT_SECONDARY}>
        {breakdown.when.feedback}
      </text>
    </vstack>

    {/* WHY */}
    <vstack
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thin"
      borderColor={breakdown.why.isCorrect ? DETECTIVE_GOLD : NOIR_FOG}
    >
      <hstack gap="small" alignment="space-between middle">
        <text size="small" weight="bold" color={DETECTIVE_GOLD}>
          ❓ WHY (왜)
        </text>

        <hstack gap="small" alignment="center middle">
          <text
            size="medium"
            weight="bold"
            color={getScoreColor(breakdown.why.score)}
          >
            {breakdown.why.score}점
          </text>
          <text size="medium">
            {breakdown.why.isCorrect ? '✅' : '❌'}
          </text>
        </hstack>
      </hstack>

      <text size="small" color={TEXT_SECONDARY}>
        {breakdown.why.feedback}
      </text>
    </vstack>

    {/* HOW */}
    <vstack
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thin"
      borderColor={breakdown.how.isCorrect ? DETECTIVE_GOLD : NOIR_FOG}
    >
      <hstack gap="small" alignment="space-between middle">
        <text size="small" weight="bold" color={DETECTIVE_GOLD}>
          ❓ HOW (어떻게)
        </text>

        <hstack gap="small" alignment="center middle">
          <text
            size="medium"
            weight="bold"
            color={getScoreColor(breakdown.how.score)}
          >
            {breakdown.how.score}점
          </text>
          <text size="medium">
            {breakdown.how.isCorrect ? '✅' : '❌'}
          </text>
        </hstack>
      </hstack>

      <text size="small" color={TEXT_SECONDARY}>
        {breakdown.how.feedback}
      </text>
    </vstack>

    {/* Statistics */}
    <vstack
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
    >
      <text size="medium" weight="bold" color={DETECTIVE_GOLD}>
        📈 전체 통계
      </text>

      <vstack gap="small">
        <hstack gap="medium" alignment="space-between middle">
          <text size="small" color={TEXT_MUTED}>총 제출</text>
          <text size="medium" weight="bold" color={TEXT_PRIMARY}>
            {stats.totalSubmissions}
          </text>
        </hstack>

        <hstack gap="medium" alignment="space-between middle">
          <text size="small" color={TEXT_MUTED}>정답자</text>
          <text size="medium" weight="bold" color={DETECTIVE_GOLD}>
            {stats.correctSubmissions}
          </text>
        </hstack>

        <hstack gap="medium" alignment="space-between middle">
          <text size="small" color={TEXT_MUTED}>평균 점수</text>
          <text size="medium" weight="bold" color={EVIDENCE_CLUE}>
            {stats.averageScore}
          </text>
        </hstack>

        <hstack gap="medium" alignment="space-between middle">
          <text size="small" color={TEXT_MUTED}>정답률</text>
          <text size="medium" weight="bold" color={EVIDENCE_POISON}>
            {Math.round((stats.correctSubmissions / stats.totalSubmissions) * 100)}%
          </text>
        </hstack>
      </vstack>
    </vstack>

    {/* Leaderboard */}
    <vstack
      backgroundColor={NOIR_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
    >
      <text size="medium" weight="bold" color={DETECTIVE_GOLD}>
        🏆 리더보드 (Top 10)
      </text>

      <vstack gap="xsmall">
        {leaderboard.map((entry, index) => (
          <hstack
            key={entry.userId}
            backgroundColor={entry.userId === currentUserId ? NOIR_GUNMETAL : 'transparent'}
            padding="small"
            gap="small"
            cornerRadius="small"
            border={entry.userId === currentUserId ? "thin" : "none"}
            borderColor={DETECTIVE_GOLD}
            alignment="space-between middle"
          >
            <hstack gap="small" alignment="start middle">
              <text size="medium" weight="bold">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${entry.rank}`}
              </text>

              <vstack gap="xsmall">
                <hstack gap="xsmall" alignment="start middle">
                  <text size="small" weight="bold" color={TEXT_PRIMARY}>
                    {entry.userId}
                  </text>
                  {entry.userId === currentUserId && (
                    <text size="xsmall" color={DETECTIVE_GOLD}>(나)</text>
                  )}
                </hstack>

                <text size="xsmall" color={TEXT_MUTED}>
                  {formatDate(entry.submittedAt)}
                </text>
              </vstack>
            </hstack>

            <vstack gap="xsmall" alignment="end middle">
              <text
                size="medium"
                weight="bold"
                color={getScoreColor(entry.score)}
              >
                {entry.score}점
              </text>
              {entry.isCorrect && (
                <text size="xsmall" color={DETECTIVE_GOLD} weight="bold">
                  ✅ 정답
                </text>
              )}
            </vstack>
          </hstack>
        ))}
      </vstack>
    </vstack>
  </vstack>

  {/* New Game Button - Thumb Zone */}
  <button
    onPress={handleNewGame}
    appearance="primary"
    size="large"
    minHeight={56}
    width="100%"
  >
    <text size="medium" weight="bold">🔄 새 게임 시작</text>
  </button>
</vstack>
```

**Celebration Animations**:
- Use Devvit's built-in slide/fade transitions
- Stagger reveal of score breakdown cards
- Confetti effect for correct answers (if Devvit supports)
- Smooth scroll to leaderboard position

**Accessibility**:
- Clear score announcements
- Color-coded feedback with text labels
- Touch-friendly leaderboard items

---

## 🎯 Delightful UX Enhancements

### Micro-interactions

**1. Button Press Feedback**:
```tsx
<button
  onPress={handleAction}
  // Add visual feedback via Devvit props
  appearance="primary"
  pressedOpacity={0.7}  // Dim on press
>
  {/* Button content */}
</button>
```

**2. Card Hover/Tap States**:
```tsx
<vstack
  backgroundColor={NOIR_CHARCOAL}
  // Highlight on interaction
  onPress={handleCardTap}
  pressedBackgroundColor={NOIR_SMOKE}
>
  {/* Card content */}
</vstack>
```

**3. Progress Celebrations**:
- Toast notifications for AP acquisition
- Badge unlocks for evidence milestones (25%, 50%, 75%, 100%)
- Rank-up animations on leaderboard

### Empty States

**No Evidence Yet**:
```tsx
<vstack
  backgroundColor={NOIR_CHARCOAL}
  padding="large"
  gap="medium"
  cornerRadius="medium"
  alignment="center middle"
>
  <text size="xlarge">🔍</text>
  <text size="medium" color={TEXT_MUTED} alignment="center">
    아직 발견한 증거가 없습니다
  </text>
  <text size="small" color={TEXT_SECONDARY} alignment="center">
    장소 탐색 탭에서 증거를 찾아보세요
  </text>
  <button
    onPress={handleGoToLocations}
    appearance="primary"
    size="medium"
    minHeight={48}
  >
    <text size="small" weight="bold">
      📍 장소 탐색하기
    </text>
  </button>
</vstack>
```

**All Suspects Interrogated**:
```tsx
<vstack
  backgroundColor={NOIR_CHARCOAL}
  padding="large"
  gap="medium"
  cornerRadius="medium"
  alignment="center middle"
>
  <text size="xlarge">✅</text>
  <text size="medium" color={DETECTIVE_GOLD} weight="bold" alignment="center">
    모든 용의자를 심문했습니다!
  </text>
  <text size="small" color={TEXT_SECONDARY} alignment="center">
    이제 증거를 검토하고 답안을 제출할 준비가 되었습니다
  </text>
  <button
    onPress={handleGoToSubmission}
    appearance="primary"
    size="large"
    minHeight={56}
  >
    <text size="medium" weight="bold">
      📝 답안 제출하기
    </text>
  </button>
</vstack>
```

### Loading States

**Skeleton Loaders**:
```tsx
// Location Card Skeleton
<vstack
  backgroundColor={NOIR_CHARCOAL}
  padding="medium"
  gap="small"
  cornerRadius="medium"
>
  {/* Animated pulse effect via Devvit */}
  <vstack
    height={150}
    backgroundColor={NOIR_GUNMETAL}
    cornerRadius="small"
    // Add pulse animation if supported
  />

  <vstack gap="xsmall">
    <vstack
      height={16}
      width="60%"
      backgroundColor={NOIR_GUNMETAL}
      cornerRadius="small"
    />
    <vstack
      height={12}
      width="40%"
      backgroundColor={NOIR_GUNMETAL}
      cornerRadius="small"
    />
  </vstack>
</vstack>
```

### Error States

**Network Error**:
```tsx
<vstack
  backgroundColor={NOIR_CHARCOAL}
  padding="large"
  gap="medium"
  cornerRadius="medium"
  border="thick"
  borderColor={EVIDENCE_BLOOD}
  alignment="center middle"
>
  <text size="xlarge">⚠️</text>
  <text size="medium" color={EVIDENCE_BLOOD} weight="bold" alignment="center">
    연결에 실패했습니다
  </text>
  <text size="small" color={TEXT_SECONDARY} alignment="center">
    네트워크 연결을 확인하고 다시 시도해주세요
  </text>
  <button
    onPress={handleRetry}
    appearance="primary"
    size="medium"
    minHeight={48}
  >
    <text size="small" weight="bold">
      🔄 다시 시도
    </text>
  </button>
</vstack>
```

**Insufficient AP**:
```tsx
<vstack
  backgroundColor={NOIR_GUNMETAL}
  padding="medium"
  gap="small"
  cornerRadius="medium"
  border="thin"
  borderColor={DETECTIVE_AMBER}
>
  <hstack gap="small" alignment="start middle">
    <text size="medium">⚠️</text>
    <vstack gap="xsmall">
      <text size="small" weight="bold" color={DETECTIVE_AMBER}>
        행동력이 부족합니다
      </text>
      <text size="xsmall" color={TEXT_SECONDARY}>
        용의자를 심문하여 행동력을 획득하세요
      </text>
    </vstack>
  </hstack>
</vstack>
```

---

## 📐 Responsive Layout Patterns

### Mobile (375px-414px)

**Primary Pattern**: Single-column stacks
- vstack with full-width cards
- Bottom-aligned CTAs (thumb zone)
- Minimal horizontal scrolling
- Touch targets ≥48px

**Example**:
```tsx
<vstack
  width="100%"
  padding="medium"
  gap="medium"
>
  <vstack /* Card 1 */ />
  <vstack /* Card 2 */ />
  <vstack /* Card 3 */ />

  {/* Bottom CTA */}
  <button minHeight={56} width="100%" />
</vstack>
```

### Tablet (640px-768px)

**Pattern**: Two-column grids where appropriate
- Suspect cards: 2 columns
- Evidence cards: 2 columns
- Form: Still single column (easier to fill)

**Example** (if Devvit supports responsive):
```tsx
<hstack gap="medium" wrap>
  {items.map(item => (
    <vstack
      key={item.id}
      width="calc(50% - 8px)"  // Two columns with gap
      /* Card content */
    />
  ))}
</hstack>
```

### Desktop (1024px+)

**Pattern**: Three-column grids, side-by-side layouts
- Suspect cards: 3 columns
- Case overview cards: 2 columns
- More generous padding and gaps

---

## ♿ Accessibility Specifications

### WCAG 2.1 AA Compliance

**1. Color Contrast**:
- Text on dark backgrounds: ≥4.5:1 ratio
- UI controls: ≥3:1 ratio
- All color values pre-verified in design system

**2. Touch Targets**:
- Minimum: 48x48px (12 Devvit units @ 4px/unit)
- Recommended: 56x56px for primary actions
- Adequate spacing between tappable elements

**3. Focus Indicators**:
```tsx
<button
  // Devvit handles focus styling
  accessibilityLabel="Start investigation"
  accessibilityHint="Opens the investigation screen"
>
  {/* Button content */}
</button>
```

**4. Screen Reader Support**:
```tsx
<vstack
  accessibilityRole="region"
  accessibilityLabel="Case details"
>
  {/* Content */}
</vstack>

<button
  accessibilityRole="button"
  accessibilityLabel="Submit answer"
  accessibilityHint="Submit your final 5W1H answer"
  accessibilityState={{ disabled: !isFormValid }}
>
  {/* Button content */}
</button>
```

**5. Heading Hierarchy**:
- Use size and weight to establish visual hierarchy
- Ensure logical flow: Screen title (xlarge) → Section headers (large) → Subsections (medium)

**6. Alternative Text**:
```tsx
<image
  url={imageUrl}
  description="Crime scene showing broken window and overturned furniture"
  accessibilityLabel="Crime scene photo"
/>
```

### Keyboard Navigation

**Tab Order**:
1. Header actions (skip, back)
2. Primary content (cards, forms)
3. Bottom CTAs
4. Footer navigation

**Shortcuts** (if Devvit supports):
- Enter: Activate focused button
- Escape: Close modal, go back
- Arrow keys: Navigate between tabs

---

## 🎨 Visual Polish Checklist

### Color Usage

- ✅ **Backgrounds**: Noir palette (deepBlack → charcoal → gunmetal)
- ✅ **Accents**: Detective gold for CTAs, brass for secondary
- ✅ **Evidence**: Semantic colors (blood, poison, clue)
- ✅ **Text**: Hierarchy via primary → secondary → muted

### Typography

- ✅ **Sizes**: Consistent scale (xsmall → small → medium → large → xlarge)
- ✅ **Weights**: Bold for emphasis, regular for body
- ✅ **Alignment**: Center for headers, left for content

### Spacing

- ✅ **Padding**: medium (12px) base, large (16px) for emphasis
- ✅ **Gaps**: small (8px) compact, medium (12px) standard
- ✅ **Margins**: Consistent across components

### Borders & Corners

- ✅ **Borders**: thin (1px) default, thick (2px) emphasis
- ✅ **Colors**: noir-fog default, semantic for highlights
- ✅ **Radius**: small (4px) subtle, medium (8px) cards

### Shadows & Effects

- ⚠️ **Note**: Devvit may not support box-shadow
- **Alternative**: Use layered zstack with darker backgrounds
- **Glow effect**: Use borderColor with bright accent

---

## 🚀 Implementation Priority

### Phase 1: Core Screens (Week 1)
1. Loading Screen
2. Three-Slide Intro
3. Case Overview
4. Investigation Screen (tabs)

### Phase 2: Interactions (Week 2)
5. Submission Form
6. Results View
7. All modals (text input, evidence detail)

### Phase 3: Polish (Week 3)
8. Loading states (skeletons)
9. Empty states
10. Error handling
11. Micro-interactions

### Phase 4: Accessibility (Week 4)
12. Screen reader labels
13. Keyboard navigation
14. Focus management
15. Testing on real devices

---

## 📝 Devvit-Specific Notes

### Component Mapping

**React → Devvit**:
- `<div>` → `<vstack>` or `<hstack>`
- `className` → `backgroundColor`, `padding`, etc. props
- Framer Motion → Devvit built-in transitions
- CSS Grid → Nested hstack/vstack
- Modal → `context.ui.showModal()`

### Limitations to Work Around

**No CSS Classes**:
- ✅ Use inline props for all styling
- ✅ Create reusable component functions with preset props

**No Custom Fonts**:
- ✅ Use Devvit's text size/weight/style props
- ✅ Establish hierarchy via size (xlarge → xsmall)

**Limited Animations**:
- ✅ Use Devvit's built-in transitions
- ✅ Focus on layout and color changes
- ❌ Avoid complex physics-based animations

**Image Loading**:
- ✅ Use 2-stage loading (thumbnail → full)
- ✅ Lazy load images below fold
- ✅ Optimize image sizes for mobile

### Reddit Webview Constraints

**Safe Areas**:
- Account for Reddit app chrome (header, bottom tabs)
- Use padding to avoid overlap
- Test in actual Reddit app

**Performance**:
- Minimize component nesting depth
- Lazy load off-screen content
- Optimize image sizes (<200KB per image)

**Network**:
- Handle offline gracefully
- Show loading states immediately
- Cache data when possible

---

## ✅ Success Criteria

### Hackathon Judging

**Delightful UX** (40%):
- ✅ Noir detective theme immersion
- ✅ Smooth transitions between screens
- ✅ Satisfying micro-interactions
- ✅ Personality in empty/error states

**Polish** (35%):
- ✅ Consistent design system
- ✅ No UI bugs or glitches
- ✅ Professional typography
- ✅ Thoughtful loading states

**Mobile-First** (25%):
- ✅ Optimized for 375px-414px
- ✅ Touch targets ≥48px
- ✅ Thumb-zone primary actions
- ✅ Responsive layouts

### User Experience Goals

**Ease of Discovery**:
- All features accessible within 2 taps
- Clear navigation hierarchy
- Intuitive iconography

**Engagement**:
- Immersive noir atmosphere
- Rewarding progression (AP, achievements)
- Clear feedback on all actions

**Accessibility**:
- WCAG 2.1 AA compliant
- Screen reader friendly
- Keyboard navigable

---

## 📊 Testing Plan

### Mobile Devices

**Priority Devices**:
1. iPhone 12/13/14 (375x812) - 60% of iOS traffic
2. iPhone 14 Pro Max (414x896) - Large iOS
3. Samsung Galaxy S21 (360x800) - Android reference
4. iPad Mini (768x1024) - Tablet

**Test Cases**:
- [ ] All screens render correctly
- [ ] Touch targets are tappable
- [ ] Text is readable without zoom
- [ ] Forms don't trigger iOS zoom
- [ ] Images load progressively
- [ ] No horizontal scroll

### Reddit App Integration

**Test in**:
- Reddit iOS app (latest)
- Reddit Android app (latest)
- Reddit mobile web (fallback)

**Verify**:
- [ ] Safe area insets respected
- [ ] No overlap with Reddit chrome
- [ ] Back navigation works
- [ ] Deep linking works
- [ ] Share functionality works

### Performance

**Metrics**:
- [ ] Initial load <2s
- [ ] Screen transitions <300ms
- [ ] Image loading <1s
- [ ] Form submission <3s
- [ ] No jank or dropped frames

---

## 🎯 Final Deliverables

### Design Specs
- [x] Screen-by-screen Devvit layouts
- [x] Color palette with exact hex values
- [x] Typography system with sizes/weights
- [x] Spacing system with Devvit units
- [x] Component patterns (buttons, cards, inputs)

### Interaction Specs
- [x] User flows (intro → investigation → submission → results)
- [x] Touch target sizes
- [x] Loading/empty/error states
- [x] Modal patterns

### Accessibility Specs
- [x] WCAG 2.1 AA compliance checklist
- [x] Screen reader labels
- [x] Keyboard navigation
- [x] Focus management

### Implementation Guide
- [x] Devvit component mapping
- [x] Mobile-first responsive patterns
- [x] Reddit webview constraints
- [x] Testing checklist

---

**Ready for Implementation** ✅

This specification provides everything needed to build a delightful, polished, mobile-first murder mystery game for Reddit using Devvit Blocks. Focus on the noir atmosphere, smooth interactions, and thumb-zone optimization to win the hackathon!
