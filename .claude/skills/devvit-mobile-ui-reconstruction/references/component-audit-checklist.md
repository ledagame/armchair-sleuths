# Component Audit Checklist

Systematically evaluate each component to determine reconstruction priority and identify issues.

## Component Information

**Component name:** _____________
**File path:** _____________
**Priority:** P0 / P1 / P2 / P3

## Mobile Responsiveness (Critical)

- [ ] Layout breaks on <414px viewport
- [ ] Touch targets too small (<44px)
- [ ] Text not readable without zooming
- [ ] Horizontal scrolling required
- [ ] Fixed positioning issues (modals, headers)
- [ ] Images not mobile-optimized

## User Experience Issues

- [ ] No loading states (spinners or blank)
- [ ] No empty states (blank when no data)
- [ ] Poor error handling (crashes/generic errors)
- [ ] Unclear interactions (what's clickable?)
- [ ] No feedback on actions (unresponsive buttons)
- [ ] Confusing navigation (can't find back button)

## Visual Design Issues

- [ ] Looks unprofessional (misaligned, inconsistent)
- [ ] Poor visual hierarchy (can't scan)
- [ ] Colors clash or lack contrast
- [ ] Typography inconsistent or hard to read
- [ ] No spacing/padding (cramped)
- [ ] Generic/boring (lacks personality)

## Devvit Blocks Usage

- [ ] Not using Devvit Blocks (web components instead)
- [ ] Improper block nesting (layout issues)
- [ ] Missing Reddit theme support (light/dark)
- [ ] Doesn't work in Custom Post context

## Game Engagement

- [ ] Boring interactions (no personality)
- [ ] Missing game feedback (progress, achievements)
- [ ] No visual rewards (discoveries feel flat)
- [ ] Unclear game state (can't tell progress)
- [ ] Not fun to use (feels like form)

## Backend Integration (Document for Preservation)

**API endpoints:**
**State management:**
**Props required:**
**Event handlers:**
**Data transformations:**

## Reconstruction Decision

- **P0 (Critical):** Multiple critical mobile issues + core gameplay
- **P1 (High):** Significant UX problems + important feature
- **P2 (Medium):** Visual issues but functionally works
- **P3 (Low):** Minor improvements, not critical path

## Notes

**Specific issues:**

**Backend preservation concerns:**

**Design references:**
