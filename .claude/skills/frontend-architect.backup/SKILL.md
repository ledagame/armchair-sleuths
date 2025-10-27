---
name: frontend-architect
description: Build stunning, production-ready UI from scratch using React 19, Next.js 15, shadcn/ui, and Framer Motion. This skill should be used PROACTIVELY when creating new components, building design systems, implementing animations, or refactoring UI for maximum impact. Specializes in noir detective game aesthetics with modern web technologies.
---

# Frontend Architect

## Overview

This skill creates world-class user interfaces from the ground up for Armchair Sleuths murder mystery game. Combines cutting-edge React patterns with shadcn/ui component system and Framer Motion animations to deliver an immersive noir detective experience.

## When to Use This Skill

**Use this skill PROACTIVELY when:**
- UI 컴포넌트 생성: "케이스 카드 컴포넌트 만들어줘" / "Create case card component"
- 디자인 시스템 구축: "디자인 시스템 설정" / "Set up design system"
- 애니메이션 추가: "페이지 전환 애니메이션" / "Add page transition animation"
- 반응형 디자인: "모바일 최적화" / "Optimize for mobile"
- UI 개선: "이 화면 더 멋지게" / "Make this screen look amazing"
- 새 화면 생성: "인트로 화면 만들기" / "Create intro screen"

## Design System Foundation

### Design Tokens

```typescript
// src/styles/tokens.ts

export const tokens = {
  colors: {
    // Noir detective palette
    noir: {
      deepBlack: '#0a0a0a',
      charcoal: '#1a1a1a',
      gunmetal: '#2a2a2a',
      smoke: '#3a3a3a',
      fog: '#4a4a4a'
    },
    // Accent colors
    detective: {
      gold: '#c9b037',    // Detective badge
      brass: '#b5a642',   // Vintage metal
      amber: '#d4af37'    // Spotlight
    },
    evidence: {
      blood: '#8b0000',   // Crime scene
      poison: '#4b0082',  // Mysterious
      clue: '#1e90ff'     // Discovery
    },
    // UI states
    text: {
      primary: '#e0e0e0',
      secondary: '#a0a0a0',
      muted: '#707070',
      inverse: '#0a0a0a'
    },
    background: {
      primary: '#0a0a0a',
      secondary: '#1a1a1a',
      elevated: '#2a2a2a',
      overlay: 'rgba(10, 10, 10, 0.95)'
    },
    border: {
      default: '#3a3a3a',
      focus: '#c9b037',
      error: '#8b0000'
    }
  },

  typography: {
    fonts: {
      display: '"Playfair Display", serif',  // Headlines, case titles
      body: '"Inter", sans-serif',            // Main text
      mono: '"JetBrains Mono", monospace'     // Evidence, clues
    },
    sizes: {
      xs: '0.75rem',    // 12px - labels
      sm: '0.875rem',   // 14px - body small
      base: '1rem',     // 16px - body
      lg: '1.125rem',   // 18px - emphasis
      xl: '1.25rem',    // 20px - subtitle
      '2xl': '1.5rem',  // 24px - heading 3
      '3xl': '1.875rem',// 30px - heading 2
      '4xl': '2.25rem', // 36px - heading 1
      '5xl': '3rem'     // 48px - display
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeights: {
      tight: 1.2,
      base: 1.5,
      relaxed: 1.75
    }
  },

  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem'      // 96px
  },

  borderRadius: {
    none: '0',
    sm: '0.125rem',  // 2px
    base: '0.25rem', // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px'
  },

  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
    base: '0 2px 4px rgba(0, 0, 0, 0.6)',
    md: '0 4px 8px rgba(0, 0, 0, 0.7)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.8)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.9)',
    glow: '0 0 20px rgba(201, 176, 55, 0.3)' // Detective gold glow
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    pageTransition: '600ms cubic-bezier(0.65, 0, 0.35, 1)'
  }
};
```

### Tailwind Config Integration

```javascript
// tailwind.config.js

import { tokens } from './src/styles/tokens';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: tokens.typography.fonts,
      fontSize: tokens.typography.sizes,
      fontWeight: tokens.typography.weights,
      lineHeight: tokens.typography.lineHeights,
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.shadows,
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
```

## Component Patterns

### Pattern 1: Animated Case Card

```tsx
// src/components/case/CaseCard.tsx

'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CaseData } from '@/types';

interface CaseCardProps {
  case: CaseData;
  onClick?: () => void;
  index?: number; // For stagger animation
}

export function CaseCard({ case: caseData, onClick, index = 0 }: CaseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1, // Stagger effect
        ease: [0.65, 0, 0.35, 1] // Custom easing
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Card
        className="
          cursor-pointer
          bg-noir-charcoal
          border-2 border-noir-fog
          hover:border-detective-gold
          transition-colors
          relative
          overflow-hidden
          group
        "
        onClick={onClick}
      >
        {/* Ambient glow effect */}
        <div className="
          absolute inset-0
          bg-gradient-to-br from-detective-gold/10 to-transparent
          opacity-0 group-hover:opacity-100
          transition-opacity duration-500
        " />

        {/* Case image */}
        {caseData.imageUrl && (
          <div className="relative h-48 overflow-hidden">
            <motion.img
              src={caseData.imageUrl}
              alt={`Case ${caseData.id}`}
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noir-deepBlack via-transparent to-transparent" />
          </div>
        )}

        <CardHeader className="relative z-10">
          <div className="flex items-start justify-between">
            <CardTitle className="
              font-display text-2xl font-bold
              text-detective-gold
              group-hover:text-detective-amber
              transition-colors
            ">
              Case #{caseData.id.split('-')[1]}
            </CardTitle>
            <Badge variant="outline" className="border-detective-brass text-detective-brass">
              {caseData.date}
            </Badge>
          </div>
          <CardDescription className="text-text-secondary font-body">
            피해자: {caseData.victim.name}
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted uppercase tracking-wider">Location</span>
            <span className="text-sm text-text-primary font-medium">
              {caseData.location.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted uppercase tracking-wider">Weapon</span>
            <span className="text-sm text-text-primary font-medium">
              {caseData.weapon.name}
            </span>
          </div>

          <p className="text-sm text-text-secondary line-clamp-2 font-body">
            {caseData.victim.background}
          </p>

          {/* Hover reveal */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            whileHover={{ opacity: 1, height: 'auto' }}
            className="pt-2 border-t border-noir-fog"
          >
            <p className="text-xs text-detective-gold">
              클릭하여 수사 시작 →
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

### Pattern 2: Typing Effect Narration

```tsx
// src/components/intro/TypingNarration.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypingNarrationProps {
  text: string;
  speed?: number; // Characters per second
  onComplete?: () => void;
  showCursor?: boolean;
}

export function TypingNarration({
  text,
  speed = 50,
  onComplete,
  showCursor = true
}: TypingNarrationProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    let currentIndex = 0;
    const intervalDuration = 1000 / speed;

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
        onComplete?.();
      }
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <div className="relative font-body text-text-primary leading-relaxed">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="whitespace-pre-wrap"
      >
        {displayedText}
        <AnimatePresence>
          {!isComplete && showCursor && (
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 0, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-0.5 h-5 bg-detective-gold ml-1"
            />
          )}
        </AnimatePresence>
      </motion.p>
    </div>
  );
}
```

### Pattern 3: Suspect Profile with Reveal

```tsx
// src/components/suspects/SuspectProfile.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Suspect } from '@/types';

interface SuspectProfileProps {
  suspect: Suspect;
  onInterrogate?: () => void;
  revealed?: boolean;
}

export function SuspectProfile({
  suspect,
  onInterrogate,
  revealed = false
}: SuspectProfileProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      className="relative w-full h-full perspective-1000"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
      >
        {/* Front - Profile Card */}
        <Card className="
          absolute inset-0
          backface-hidden
          bg-noir-charcoal
          border-2 border-noir-fog
          hover:border-detective-brass
          transition-colors
          cursor-pointer
        " onClick={() => setIsFlipped(!isFlipped)}>
          <CardContent className="p-0 h-full flex flex-col">
            {/* Suspect Image */}
            <div className="relative h-64 overflow-hidden">
              {suspect.profileImageUrl ? (
                <img
                  src={suspect.profileImageUrl}
                  alt={suspect.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-noir-gunmetal flex items-center justify-center">
                  <span className="text-6xl text-text-muted">?</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-noir-deepBlack/90 to-transparent" />

              {/* Suspicion indicator */}
              <div className="absolute top-4 right-4">
                <Badge
                  variant={
                    suspect.emotionalState.suspicionLevel > 70 ? 'destructive' :
                    suspect.emotionalState.suspicionLevel > 40 ? 'default' :
                    'secondary'
                  }
                  className="backdrop-blur-sm"
                >
                  의심도: {suspect.emotionalState.suspicionLevel}%
                </Badge>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-2xl font-bold text-detective-gold mb-2">
                  {suspect.name}
                </h3>
                <p className="text-sm text-text-muted uppercase tracking-wider mb-3">
                  {suspect.archetype}
                </p>
                <p className="text-text-secondary font-body leading-relaxed line-clamp-3">
                  {suspect.background}
                </p>
              </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onInterrogate?.();
                }}
                className="
                  w-full
                  bg-detective-gold
                  hover:bg-detective-amber
                  text-noir-deepBlack
                  font-semibold
                  transition-all
                  hover:shadow-glow
                "
              >
                심문하기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back - Detailed Info */}
        <Card className="
          absolute inset-0
          backface-hidden
          rotate-y-180
          bg-noir-charcoal
          border-2 border-detective-brass
          cursor-pointer
        " onClick={() => setIsFlipped(!isFlipped)}>
          <CardContent className="p-6 h-full overflow-y-auto">
            <h3 className="font-display text-xl font-bold text-detective-gold mb-4">
              상세 정보
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs text-text-muted uppercase tracking-wider mb-1">
                  성격
                </h4>
                <p className="text-text-primary font-body">
                  {suspect.personality}
                </p>
              </div>

              <div>
                <h4 className="text-xs text-text-muted uppercase tracking-wider mb-1">
                  감정 상태
                </h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {suspect.emotionalState.tone}
                  </Badge>
                  <span className="text-sm text-text-secondary">
                    의심도: {suspect.emotionalState.suspicionLevel}%
                  </span>
                </div>
              </div>

              {revealed && suspect.isGuilty && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="
                    mt-4 p-4
                    bg-evidence-blood/20
                    border-2 border-evidence-blood
                    rounded-lg
                  "
                >
                  <p className="text-evidence-blood font-bold text-center">
                    범인으로 밝혀짐
                  </p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
```

### Pattern 4: Page Transition Wrapper

```tsx
// src/components/layout/PageTransition.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.6,
          ease: [0.65, 0, 0.35, 1]
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Usage in layout:
// <PageTransition>{children}</PageTransition>
```

### Pattern 5: Interactive Evidence Board

```tsx
// src/components/investigation/EvidenceBoard.tsx

'use client';

import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface Evidence {
  id: string;
  description: string;
  importance: 'critical' | 'supporting' | 'neutral';
  discovered: boolean;
}

interface EvidenceBoardProps {
  evidence: Evidence[];
  onConnect?: (evidenceId: string, suspectId: string) => void;
}

export function EvidenceBoard({ evidence, onConnect }: EvidenceBoardProps) {
  const [items, setItems] = useState(evidence);
  const [connecting, setConnecting] = useState<string | null>(null);

  const importanceColors = {
    critical: 'border-evidence-blood',
    supporting: 'border-evidence-clue',
    neutral: 'border-noir-fog'
  };

  return (
    <div className="p-6 bg-noir-charcoal rounded-xl">
      <h2 className="font-display text-2xl font-bold text-detective-gold mb-6">
        증거판
      </h2>

      <Reorder.Group
        values={items}
        onReorder={setItems}
        className="space-y-3"
      >
        {items.map((item) => (
          <Reorder.Item
            key={item.id}
            value={item}
            className="cursor-move"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileDrag={{ scale: 1.05, rotate: 2 }}
            >
              <Card className={`
                p-4
                bg-noir-gunmetal
                border-2 ${importanceColors[item.importance]}
                transition-all
                ${connecting === item.id ? 'ring-4 ring-detective-gold' : ''}
              `}>
                <div className="flex items-start justify-between">
                  <p className="text-text-primary font-body flex-1">
                    {item.description}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setConnecting(connecting === item.id ? null : item.id)}
                    className="
                      ml-4 px-3 py-1
                      bg-detective-gold
                      text-noir-deepBlack
                      text-xs font-semibold
                      rounded
                      hover:bg-detective-amber
                      transition-colors
                    "
                  >
                    연결
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
```

## Responsive Design Patterns

### Mobile-First Approach

```tsx
// Responsive grid example
<div className="
  grid
  grid-cols-1       /* Mobile: 1 column */
  sm:grid-cols-2    /* Tablet: 2 columns */
  lg:grid-cols-3    /* Desktop: 3 columns */
  gap-4 sm:gap-6 lg:gap-8
">
  {suspects.map(suspect => (
    <SuspectProfile key={suspect.id} suspect={suspect} />
  ))}
</div>

// Responsive typography
<h1 className="
  text-2xl sm:text-3xl lg:text-4xl
  font-display font-bold
  text-detective-gold
">
  Case Overview
</h1>

// Responsive spacing
<section className="
  px-4 sm:px-6 lg:px-8
  py-8 sm:py-12 lg:py-16
">
  {content}
</section>
```

## Accessibility Patterns

### Keyboard Navigation

```tsx
// Keyboard-accessible modal
export function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // Focus trap
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }

    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // ... rest of modal
}
```

### ARIA Labels

```tsx
<button
  aria-label="용의자 심문하기"
  aria-pressed={isInterrogating}
  aria-describedby="interrogate-description"
>
  심문
</button>
<span id="interrogate-description" className="sr-only">
  이 버튼을 누르면 용의자와 대화를 시작합니다
</span>
```

## Integration with Project

### Update shadcn/ui Components

```bash
# Install shadcn/ui
npx shadcn@latest init

# Add required components
npx shadcn@latest add card
npx shadcn@latest add button
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

### Install Framer Motion

```bash
npm install framer-motion
```

### Apply Design Tokens

```typescript
// src/app/layout.tsx

import { tokens } from '@/styles/tokens';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body className={`
        ${tokens.typography.fonts.body}
        bg-noir-deepBlack
        text-text-primary
        antialiased
      `}>
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
```

## Quick Start

### 1. Set Up Design System

```bash
# Copy design tokens
cp skills/frontend-architect/src/styles/tokens.ts src/styles/

# Update Tailwind config
cp skills/frontend-architect/tailwind.config.js ./
```

### 2. Create Your First Component

```bash
# Use the CaseCard pattern
npx tsx scripts/create-component.tsx CaseCard --pattern case-card
```

### 3. Add Page Transitions

```tsx
// src/app/layout.tsx
import { PageTransition } from '@/components/layout/PageTransition';

// Wrap children with PageTransition
```

## Performance Optimization

### Lazy Loading Images

```tsx
import Image from 'next/image';

<Image
  src={suspect.profileImageUrl}
  alt={suspect.name}
  width={400}
  height={400}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

### Code Splitting

```tsx
import dynamic from 'next/dynamic';

const EvidenceBoard = dynamic(
  () => import('@/components/investigation/EvidenceBoard'),
  { loading: () => <LoadingSkeleton /> }
);
```

## References

See the references directory for:

- **component-library.md**: Complete shadcn/ui component catalog
- **animation-patterns.md**: Framer Motion recipes for common animations
- **responsive-guide.md**: Mobile-first design patterns
- **accessibility-checklist.md**: WCAG AA compliance guide
- **performance-tips.md**: Optimization strategies

## Skill Dependencies

- **game-ux-delight-engineer**: Polishing and micro-interactions
- **ai-audio-director**: Integrates music with UI transitions

## Best Practices

1. **Mobile-first**: Design for small screens, enhance for large
2. **Accessibility**: Every interactive element needs proper ARIA labels
3. **Performance**: Lazy load images, code split heavy components
4. **Consistency**: Use design tokens, never hardcode colors/spacing
5. **Animation**: Keep it subtle, respect prefers-reduced-motion
6. **TypeScript**: Fully type all props, no `any` types
