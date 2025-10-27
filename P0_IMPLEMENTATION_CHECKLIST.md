# P0 Components Implementation Checklist

**Project**: Armchair Sleuths - Devvit Custom Post
**Target**: src/main.tsx (lines 1315-1524)
**Date**: 2025-10-24

---

## Pre-Implementation

### 1. Backup Current Code
```bash
cd C:\Users\hpcra\armchair-sleuths
cp src/main.tsx src/main.tsx.backup-$(date +%Y%m%d-%H%M%S)
```

- [ ] Backup created successfully
- [ ] Backup file verified (can be opened)
- [ ] Backup location noted: `src/main.tsx.backup-YYYYMMDD-HHMMSS`

### 2. Review Current Implementation
- [ ] Read lines 1315-1356 (LoadingScreen)
- [ ] Read lines 1362-1524 (CaseOverview)
- [ ] Understand current state management
- [ ] Verify handler function names
- [ ] Note any custom modifications

### 3. Review Enhanced Code
- [ ] Open `ENHANCED_P0_COMPONENTS.tsx`
- [ ] Read LoadingScreen implementation (lines 17-199)
- [ ] Read CaseOverview implementation (lines 201-598)
- [ ] Understand new features and patterns
- [ ] Note any questions or concerns

---

## Implementation Steps

### Phase 1: LoadingScreen Enhancement

#### Step 1.1: Locate Current Code
- [ ] Open `src/main.tsx` in editor
- [ ] Navigate to line 1315
- [ ] Verify `if (currentScreen === 'loading')` block
- [ ] Note closing brace location (line 1356)

#### Step 1.2: Replace LoadingScreen
- [ ] Select lines 1315-1356 (entire loading screen block)
- [ ] Delete selected lines
- [ ] Copy lines 17-199 from `ENHANCED_P0_COMPONENTS.tsx`
- [ ] Paste at line 1315
- [ ] Verify indentation matches surrounding code
- [ ] Save file

#### Step 1.3: Verify LoadingScreen Syntax
- [ ] Check for TypeScript errors
- [ ] Verify all opening braces have closing braces
- [ ] Check all function references exist
  - [ ] `handleGenerateNewCase`
  - [ ] `context.redis.get`
  - [ ] `context.useState`
- [ ] Check all state variables exist
  - [ ] `currentScreen`
  - [ ] `caseLoading`
  - [ ] `caseError`
  - [ ] `caseData`
  - [ ] `setCaseLoading`
  - [ ] `setCaseError`
  - [ ] `setCaseData`
  - [ ] `setCurrentScreen`
- [ ] Verify all types
  - [ ] `CaseData` type defined
  - [ ] `GameScreen` type defined

#### Step 1.4: Test LoadingScreen
- [ ] Run `npm run build` or `devvit playtest`
- [ ] Navigate to loading screen
- [ ] Verify loading phases display correctly
- [ ] Verify detective tip displays
- [ ] Verify time estimate shows
- [ ] Test error state (if possible)
- [ ] Test retry button (if error occurs)
- [ ] Test new case button
- [ ] Verify auto-transition to case overview

---

### Phase 2: CaseOverview Enhancement

#### Step 2.1: Locate Current Code
- [ ] Navigate to line 1362 (adjust for LoadingScreen changes)
- [ ] Verify `if (currentScreen === 'case-overview' && caseData)` block
- [ ] Note closing brace location (original line 1524)

#### Step 2.2: Replace CaseOverview
- [ ] Select entire case-overview block (was lines 1362-1524)
- [ ] Delete selected lines
- [ ] Copy lines 201-598 from `ENHANCED_P0_COMPONENTS.tsx`
- [ ] Paste at correct location
- [ ] Verify indentation matches surrounding code
- [ ] Save file

#### Step 2.3: Verify CaseOverview Syntax
- [ ] Check for TypeScript errors
- [ ] Verify all opening braces have closing braces
- [ ] Check all function references exist
  - [ ] `handleStartInvestigation`
- [ ] Check all data fields exist
  - [ ] `caseData.id`
  - [ ] `caseData.date`
  - [ ] `caseData.imageUrl`
  - [ ] `caseData.victim.*`
  - [ ] `caseData.weapon.*`
  - [ ] `caseData.location.*`
  - [ ] `caseData.suspects[]`
  - [ ] `caseData.actionPoints` (optional)
- [ ] Verify array mapping
  - [ ] `caseData.suspects.map()` syntax correct

#### Step 2.4: Test CaseOverview
- [ ] Run `npm run build` or `devvit playtest`
- [ ] Navigate to case overview screen
- [ ] Verify header displays correctly
- [ ] Check case ID and date display
- [ ] Verify image displays (if present)
- [ ] Check urgent brief card
  - [ ] Victim section
  - [ ] Weapon section (left side)
  - [ ] Location section (right side)
- [ ] Check suspects list
  - [ ] All suspects display
  - [ ] Numbers show correctly (1, 2, 3...)
  - [ ] Status shows "미심문"
- [ ] Check mission objectives
  - [ ] Three objectives display
  - [ ] Warning section displays
- [ ] Check action points (if present)
- [ ] Verify footer CTA displays
- [ ] Test "Start Investigation" button
- [ ] Verify smooth scrolling

---

## Testing Checklist

### Visual Testing (Desktop)
- [ ] LoadingScreen displays without layout issues
- [ ] Loading phases aligned correctly
- [ ] Detective tip card displays properly
- [ ] Error screen displays properly (if triggered)
- [ ] CaseOverview header is sticky
- [ ] All cards have proper spacing
- [ ] Weapon/Location are side-by-side
- [ ] Suspect list displays all suspects
- [ ] Footer CTA is fixed at bottom
- [ ] No content overflow
- [ ] No horizontal scroll

### Visual Testing (Mobile - 375px)
- [ ] LoadingScreen fits viewport
- [ ] Text is readable (not too small)
- [ ] Cards don't overflow
- [ ] CaseOverview fits viewport
- [ ] Header is sticky on mobile
- [ ] Side-by-side cards stack if needed
- [ ] Suspect list is scrollable
- [ ] Footer CTA is accessible
- [ ] All content is readable
- [ ] No layout breaking

### Functional Testing
- [ ] Loading → CaseOverview transition works
- [ ] "Generate New Case" button works
- [ ] "Retry" button works (error state)
- [ ] "Start Investigation" button works
- [ ] Scrolling is smooth
- [ ] All buttons are clickable
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] State updates correctly

### Accessibility Testing
- [ ] All text meets contrast ratio (WCAG AA)
- [ ] Button labels are descriptive
- [ ] Touch targets are adequate (56px+)
- [ ] Status indicators are clear
- [ ] Error messages are helpful
- [ ] Navigation flow is logical
- [ ] Icons enhance meaning (not required)

### Performance Testing
- [ ] Initial render < 100ms (feels instant)
- [ ] Smooth scrolling (60fps)
- [ ] Button press response < 16ms
- [ ] Images load progressively
- [ ] No layout shifts during load
- [ ] Transitions feel smooth

---

## Post-Implementation

### Documentation
- [ ] Update internal docs with new patterns
- [ ] Document design system if not already done
- [ ] Note any issues encountered
- [ ] Record any deviations from plan

### Code Review Checklist
- [ ] Consistent with existing code style
- [ ] No unnecessary complexity
- [ ] Proper error handling
- [ ] All props are correct types
- [ ] No hardcoded values (use design tokens)
- [ ] Comments explain complex logic
- [ ] No console.logs left in code

### Version Control
- [ ] Stage changes: `git add src/main.tsx`
- [ ] Commit with clear message
- [ ] Include co-author if pair programming
- [ ] Push to feature branch (not main)

---

## Rollback Procedure (If Needed)

### Quick Rollback
```bash
# If something goes wrong, restore backup
cp src/main.tsx.backup-YYYYMMDD-HHMMSS src/main.tsx
npm run build
```

- [ ] Identify issue
- [ ] Restore from backup
- [ ] Verify backup works
- [ ] Document issue for future resolution

### Partial Rollback
If only one component has issues:

**Keep LoadingScreen, revert CaseOverview**:
1. Keep new lines 1315-1499 (enhanced LoadingScreen)
2. Replace CaseOverview section with backup lines 1362-1524

**Keep CaseOverview, revert LoadingScreen**:
1. Replace LoadingScreen section with backup lines 1315-1356
2. Keep new CaseOverview section

---

## Success Criteria

Implementation is successful when:

- [ ] ✅ All code compiles without errors
- [ ] ✅ All tests pass
- [ ] ✅ LoadingScreen shows progress phases
- [ ] ✅ LoadingScreen shows detective tip
- [ ] ✅ LoadingScreen error handling works
- [ ] ✅ CaseOverview displays all sections
- [ ] ✅ CaseOverview header is sticky
- [ ] ✅ CaseOverview footer is fixed
- [ ] ✅ All buttons work correctly
- [ ] ✅ Mobile layout is correct (375px)
- [ ] ✅ All text is readable
- [ ] ✅ WCAG 2.1 AA compliance verified
- [ ] ✅ Performance is acceptable
- [ ] ✅ No console errors
- [ ] ✅ No visual regressions

---

## Common Issues & Solutions

### Issue: TypeScript errors after paste
**Solution**: Verify all imported types exist, check line 14-75 for type definitions

### Issue: Handler function not found
**Solution**: Verify handler exists in lines 259-318, check spelling

### Issue: State variable undefined
**Solution**: Check useState declarations in lines 170-202

### Issue: Layout overflow on mobile
**Solution**: Ensure all cards use `width="100%"`, check padding values

### Issue: Buttons not clickable
**Solution**: Verify `onPress` prop spelling, check handler reference

### Issue: Images not loading
**Solution**: Check `imageUrl` field exists in caseData, verify URL validity

### Issue: Side-by-side cards stack on mobile
**Solution**: This is intentional if viewport < 375px, verify with different sizes

### Issue: Scrolling not smooth
**Solution**: Check component nesting depth (should be < 5 levels)

### Issue: Colors don't match design
**Solution**: Verify hex codes match design system table in P0_ENHANCEMENT_GUIDE.md

### Issue: Text too small on mobile
**Solution**: Check font size props (minimum should be 'small' = 14px)

---

## Timeline Estimate

- Backup & Review: 15 minutes
- LoadingScreen Implementation: 30 minutes
- LoadingScreen Testing: 15 minutes
- CaseOverview Implementation: 45 minutes
- CaseOverview Testing: 30 minutes
- Final Testing & Documentation: 30 minutes

**Total Estimated Time**: 2.5 - 3 hours

---

## Support Resources

### Documentation
- **Full Guide**: `P0_ENHANCEMENT_GUIDE.md`
- **Visual Comparison**: `P0_VISUAL_COMPARISON.md`
- **Enhanced Code**: `ENHANCED_P0_COMPONENTS.tsx`

### Key References
- **Design System**: See P0_ENHANCEMENT_GUIDE.md "Design System Applied"
- **Type Definitions**: src/main.tsx lines 14-75
- **Handler Functions**: src/main.tsx lines 259-318
- **State Management**: src/main.tsx lines 170-202

### Quick Links
- Devvit Blocks Docs: https://developers.reddit.com/docs/blocks
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Color Contrast Checker: https://webaim.org/resources/contrastchecker/

---

## Sign-Off

- [ ] Implementation completed by: ________________
- [ ] Date: ________________
- [ ] Reviewed by: ________________
- [ ] Approved for production: [ ] Yes [ ] No
- [ ] Issues encountered: _________________________
- [ ] Notes: _____________________________________

---

**Remember**: Take your time, test thoroughly, and don't hesitate to rollback if something doesn't work as expected. The backup is there for a reason!
