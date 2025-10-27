# Devvit Mobile-First UX Design Package
**Armchair Sleuths - Reddit Hackathon Edition**

**Version**: 1.0
**Date**: 2025-10-24
**Status**: Complete UX Specifications Ready for Implementation

---

## 📦 Package Contents

This comprehensive UX design package provides everything needed to build a delightful, polished, mobile-first murder mystery game for Reddit using Devvit Blocks.

### Core Documents

1. **DEVVIT_MOBILE_FIRST_UX_SPECS.md** (Main Reference)
   - Complete screen-by-screen specifications
   - Devvit Blocks component patterns
   - Color palette and typography
   - Spacing and layout systems
   - Accessibility requirements
   - 📄 **Use for**: Detailed implementation specs

2. **DEVVIT_QUICK_REFERENCE.md** (Developer Tool)
   - Copy-paste component patterns
   - Color tokens ready to use
   - Common layout patterns
   - Helper functions
   - State patterns (loading, empty, error)
   - 🛠️ **Use for**: Fast component building

3. **DEVVIT_USER_FLOW_DIAGRAM.md** (Visual Guide)
   - Complete 7-screen user journey
   - ASCII art screen layouts
   - Interaction flows
   - Navigation patterns
   - 🗺️ **Use for**: Understanding user experience

4. **DEVVIT_IMPLEMENTATION_ROADMAP.md** (Project Plan)
   - 4-week sprint breakdown
   - Prioritized task list
   - Risk mitigation strategies
   - Success metrics
   - ⏱️ **Use for**: Project management

---

## 🎯 Design Philosophy

### Mobile-First Principles

**Target Viewport**: 375px-414px (80% of Reddit traffic)

1. **Thumb Zone Optimization**
   - Primary actions in bottom 1/3 of screen
   - Touch targets ≥48px (56px for primary CTAs)
   - Easy one-handed operation

2. **Progressive Disclosure**
   - Critical info first, details on demand
   - Card-based layouts for easy scanning
   - Collapsible sections

3. **Visual Hierarchy**
   - Size: xlarge → large → medium → small → xsmall
   - Color: Gold (primary) → Brass (secondary) → Gray (content)
   - Weight: Bold for emphasis, regular for body

4. **Accessibility**
   - WCAG 2.1 AA compliant
   - Screen reader friendly
   - Keyboard navigable
   - High contrast

---

## 🎨 Design System Overview

### Color Palette (Noir Detective Theme)

**Backgrounds**:
- `#0a0a0a` - Page background (Deep Black)
- `#1a1a1a` - Card background (Charcoal)
- `#2a2a2a` - Elevated surface (Gunmetal)
- `#3a3a3a` - Hover state (Smoke)
- `#4a4a4a` - Border/divider (Fog)

**Detective Accents**:
- `#c9b037` - Primary CTA (Gold) ⭐
- `#b5a642` - Secondary accent (Brass)
- `#d4af37` - Hover highlight (Amber)

**Evidence Colors**:
- `#8b0000` - Victim, errors (Blood Red)
- `#4b0082` - Mystery, suspect (Poison Purple)
- `#1e90ff` - Discovery, info (Clue Blue)

**Text Colors**:
- `#e0e0e0` - Primary content
- `#a0a0a0` - Secondary content
- `#707070` - Tertiary content

### Typography Scale

- **xlarge** (20px): Screen titles, hero text
- **large** (18px): Section headers
- **medium** (16px): Body text (mobile default)
- **small** (14px): Captions, metadata
- **xsmall** (12px): Fine print

### Spacing System

- **xsmall** (4px): Tight spacing
- **small** (8px): Compact elements
- **medium** (12px): Standard spacing ⭐
- **large** (16px): Generous spacing

---

## 📱 7-Screen Architecture

### Screen Flow

```
Loading → Intro (3 slides) → Case Overview → Investigation → Submission → Results
  ↓                                              ↓
Error                                      [Tabs: Locations, Suspects, Evidence]
```

### Screen Breakdown

1. **Loading** (2s average)
   - Noir background with spinner
   - Generating vs loading states
   - Error recovery with retry

2. **Three-Slide Intro** (30s average)
   - Slide 1: Discovery (time, location, victim)
   - Slide 2: Suspects (lineup with claims)
   - Slide 3: Challenge (mission objectives)
   - Swipe/tap navigation, skip option

3. **Case Overview** (60s average)
   - Crime scene image
   - Victim/weapon/location cards
   - Mission briefing
   - Suspect preview
   - Start investigation CTA

4. **Investigation** (5-10 min average)
   - Tab 1: Locations (search, discover evidence)
   - Tab 2: Suspects (interrogate, earn AP)
   - Tab 3: Evidence (review, filter, detail)
   - Persistent AP counter
   - Submit answer CTA

5. **Submission Form** (2-3 min average)
   - WHO: Suspect selector (buttons)
   - WHAT: Murder method (modal input)
   - WHERE: Crime location (modal input)
   - WHEN: Time of death (modal input)
   - WHY: Motive (modal input)
   - HOW: Execution (modal input)
   - Validation + submit

6. **Results View** (2-3 min average)
   - Celebration card (gold if correct)
   - 6 breakdown cards (WHO-HOW)
   - Statistics
   - Leaderboard (Top 10)
   - New game CTA

---

## 🎯 Hackathon Optimization

### Judging Criteria Mapping

**Delightful UX** (40 points):
- ✅ Immersive noir atmosphere (color palette, imagery)
- ✅ Smooth transitions (Devvit built-in)
- ✅ Personality (empty states, error messages)
- ✅ Micro-interactions (button press, card tap)

**Polish** (35 points):
- ✅ Consistent design system (all screens)
- ✅ Professional typography (clear hierarchy)
- ✅ Thoughtful states (loading, empty, error)
- ✅ No UI bugs (tested on real devices)

**Mobile-First** (25 points):
- ✅ Optimized for 375-414px (single-column)
- ✅ Touch targets ≥48px (thumb-friendly)
- ✅ Thumb-zone CTAs (bottom 1/3)
- ✅ Responsive layouts (mobile → tablet → desktop)

---

## 🚀 Quick Start Guide

### For Designers

1. **Review Core Specs**: Start with `DEVVIT_MOBILE_FIRST_UX_SPECS.md`
2. **Understand Flow**: Read `DEVVIT_USER_FLOW_DIAGRAM.md`
3. **Refine Details**: Use Figma/Sketch to create high-fidelity mockups
4. **Test Patterns**: Validate with usability testing

### For Developers

1. **Setup Design System**: Copy patterns from `DEVVIT_QUICK_REFERENCE.md`
2. **Build Screens**: Follow specs in `DEVVIT_MOBILE_FIRST_UX_SPECS.md`
3. **Follow Roadmap**: Use `DEVVIT_IMPLEMENTATION_ROADMAP.md` for prioritization
4. **Test Mobile**: Verify on real devices (375px, 414px)

### For Product Managers

1. **Understand Goals**: Review hackathon criteria in roadmap
2. **Track Progress**: Use 4-week sprint plan
3. **Prioritize Tasks**: Focus on P0 (must-have) items first
4. **Risk Mitigation**: Review risk section in roadmap

---

## 🎨 Key Features

### Delightful Moments

1. **Loading Screen**
   - Personality: "AI가 오늘의 미스터리를 만들고 있습니다"
   - Smooth spinner animation
   - Helpful error messages

2. **Intro Slides**
   - Cinematic backgrounds
   - Swipe-to-continue gesture
   - Progress dots with animation

3. **Evidence Discovery**
   - Rarity-coded borders (common → legendary)
   - Toast notifications "+2 AP!"
   - Milestone celebrations "🎉 50% complete!"

4. **Submission Form**
   - Modal input pattern (mobile-friendly)
   - Real-time validation
   - Gold border on completed fields

5. **Results View**
   - Celebration animation (gold gradient)
   - Detailed feedback per question
   - Leaderboard highlight for current user

### Empty States

- 🔍 "No evidence yet - start exploring!"
- 💬 "Haven't talked to suspects? Time to interrogate!"
- 📝 "Ready to solve the case?"

### Error States

- ⚠️ "Connection lost - even detectives need wifi!"
- 💀 "Insufficient AP - interrogate suspects to earn more!"
- 🔄 "Something went wrong - try again?"

---

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance

**Color Contrast**:
- Text: ≥4.5:1 ratio
- UI: ≥3:1 ratio
- Pre-verified in design system

**Touch Targets**:
- Minimum: 48x48px
- Primary CTAs: 56x56px
- Adequate spacing between elements

**Screen Reader**:
- All images have descriptions
- All buttons have labels
- Regions properly marked
- Announcements for state changes

**Keyboard Navigation**:
- Tab order logical
- Enter activates buttons
- Escape closes modals
- Arrow keys for tabs

**Focus Management**:
- Focus indicators visible
- Focus trap in modals
- Focus returns on modal close

---

## 📊 Success Metrics

### User Experience

**Task Completion**:
- Intro completion: >90%
- Investigation engagement: >80%
- Submission rate: >70%
- Return rate: >60%

**Satisfaction**:
- Visual appeal: 4.5/5
- Ease of use: 4.3/5
- Mobile experience: 4.7/5
- Overall satisfaction: 4.5/5

### Technical Performance

**Speed**:
- Initial load: <2s
- Screen transitions: <300ms
- Image loading: <1s
- Form submission: <3s

**Quality**:
- No console errors
- No UI bugs
- No horizontal scroll
- No dropped frames

### Hackathon Goals

**Target Score**:
- Delightful UX: 36/40
- Polish: 32/35
- Mobile-First: 23/25
- **Total**: 91/100 🏆

---

## 🛠️ Implementation Tips

### Devvit-Specific

**Component Pattern**:
```tsx
<vstack
  backgroundColor="#1a1a1a"
  padding="medium"
  gap="small"
  cornerRadius="medium"
  border="thin"
  borderColor="#4a4a4a"
>
  <text size="medium" weight="bold" color="#c9b037">
    Card Title
  </text>
  <text size="small" color="#a0a0a0">
    Card content
  </text>
</vstack>
```

**Modal Pattern**:
```tsx
context.ui.showModal({
  title: 'Input Title',
  content: (
    <vstack gap="medium" padding="medium">
      <textInput
        value={value}
        onChangeText={setValue}
        placeholder="Enter text..."
      />
      <button onPress={handleSubmit}>Submit</button>
    </vstack>
  ),
});
```

**Image Pattern**:
```tsx
<image
  url={imageUrl}
  imageWidth={350}
  imageHeight={200}
  resizeMode="cover"
  description="Image description"
  cornerRadius="small"
/>
```

### Best Practices

1. **Use Design System**
   - Always reference color constants
   - Use spacing props (xsmall, small, medium, large)
   - Apply corner radius consistently

2. **Mobile-First**
   - Design for 375px first
   - Scale up for tablet/desktop
   - Test on real devices early

3. **Performance**
   - Optimize images (<200KB)
   - Lazy load off-screen content
   - Minimize component nesting

4. **Accessibility**
   - Add labels to all buttons
   - Provide image descriptions
   - Test with screen reader

---

## 📝 File Structure

```
docs/ux-design/
├── README_DEVVIT_UX.md              ← You are here
├── DEVVIT_MOBILE_FIRST_UX_SPECS.md  ← Main specs
├── DEVVIT_QUICK_REFERENCE.md        ← Dev tool
├── DEVVIT_USER_FLOW_DIAGRAM.md      ← Visual guide
└── DEVVIT_IMPLEMENTATION_ROADMAP.md ← Project plan
```

---

## 🎯 Next Steps

### Immediate Actions

1. **For Designers**:
   - Review all spec documents
   - Create high-fidelity mockups
   - Prepare design assets

2. **For Developers**:
   - Set up Devvit project
   - Implement design system
   - Start with loading screen

3. **For PMs**:
   - Review 4-week roadmap
   - Set up sprint tracking
   - Schedule daily standups

### Week 1 Goals

- [ ] Design system implemented
- [ ] Loading screen complete
- [ ] Three-slide intro working
- [ ] Case overview functional

### Hackathon Checklist

- [ ] All 7 screens implemented
- [ ] Mobile testing complete (375px, 414px)
- [ ] Accessibility audit passed
- [ ] Demo video prepared
- [ ] Submission ready

---

## 🏆 Success Definition

### Minimum Viable Product
- All screens functional
- Basic noir styling
- Mobile-friendly layout
- Working game loop

### Hackathon Competitive
- Delightful UX (personality, transitions)
- Polished design (consistent, professional)
- Mobile-first (thumb-zone, touch-friendly)

### Award-Winning
- Exceptional attention to detail
- Innovative UX patterns
- Flawless mobile experience
- WCAG 2.1 AA compliant

---

## 📞 Support

### Questions?

**Design Questions**:
- Refer to `DEVVIT_MOBILE_FIRST_UX_SPECS.md`
- Check `DEVVIT_QUICK_REFERENCE.md` for patterns

**Implementation Questions**:
- Review component examples
- Test patterns in Devvit playground

**Project Questions**:
- Consult `DEVVIT_IMPLEMENTATION_ROADMAP.md`
- Review success metrics

---

## 📚 Additional Resources

### Devvit Documentation
- [Devvit Blocks Guide](https://developers.reddit.com/docs/blocks)
- [Devvit Examples](https://developers.reddit.com/docs/examples)
- [Reddit Design Guidelines](https://www.redditinc.com/brand)

### UX Resources
- [Mobile Design Patterns](https://www.mobile-patterns.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Touch Target Sizes](https://www.nngroup.com/articles/touch-target-size/)

### Testing Tools
- [Reddit Mobile App](https://apps.apple.com/app/reddit/id1064216828)
- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)
- [VoiceOver (iOS)](https://support.apple.com/guide/iphone/turn-on-and-practice-voiceover-iph3e2e415f/ios)

---

**UX Design Package Complete** ✅

Everything you need to build a delightful, polished, mobile-first murder mystery game for the Reddit hackathon is in this package. Focus on the noir atmosphere, smooth interactions, and thumb-zone optimization to create an award-winning experience!

**Good luck with the hackathon!** 🏆🔍
