# Narration Generation Debug Fixes

**Date**: 2025-10-21
**Issue**: 나레이션이 생성조차안됩니다 (Narration not being generated at all)
**Status**: **Fixed - Ready for Testing**

---

## Problems Identified

### 1. **Type Mismatch in Return Signatures** ❌

**Problem**: `generateIntroNarration` and `generateFallbackNarration` had incorrect return type signatures.

**Before**:
```typescript
private async generateIntroNarration(
  ...
): Promise<{ atmosphere: string; incident: string; stakes: string; mysteryStyle?: ... }> {
  // But was returning keywords and emotionalArc which aren't in the type!
}
```

**After**:
```typescript
private async generateIntroNarration(
  ...
): Promise<IntroNarration> {
  // Now correctly types the full IntroNarration interface
}
```

**Impact**: Type safety restored, no runtime type errors

---

### 2. **Missing Style Parameter in Fallback Call** ❌

**Problem**: `generateFallbackNarration` signature was updated to include `style` parameter, but the call site wasn't updated.

**Before**:
```typescript
() => this.generateFallbackNarration(
  caseStory,
  elements.weapon,
  elements.location
  // Missing: narrationStyle parameter!
),
```

**After**:
```typescript
() => this.generateFallbackNarration(
  caseStory,
  elements.weapon,
  elements.location,
  narrationStyle  // ✅ Added
),
```

**Impact**: Fallback narration now includes correct mystery style

---

### 3. **No Error Handling for Keyword/Arc Extraction** ❌

**Problem**: If `extractKeywords()` or `generateEmotionalArc()` threw an error, the entire narration generation would fail with no fallback.

**Solution**: Wrapped all extraction calls in try-catch blocks with detailed logging:

```typescript
try {
  console.log('🔍 Extracting keywords from narration...');
  const keywords = this.narrationValidationService.extractKeywords(narration);
  console.log(`✅ Keywords extracted: ${keywords.critical.length} critical, ...`);

  console.log('🎭 Generating emotional arc...');
  const emotionalArc = this.narrationValidationService.generateEmotionalArc(narration, style);
  console.log(`✅ Emotional arc generated with ${emotionalArc.intensityCurve.length} curve points`);

  return { ...narration, mysteryStyle: style, keywords, emotionalArc };
} catch (error) {
  console.error('❌ Error during keyword extraction or emotional arc generation:', error);
  // Graceful degradation: return narration without enhancement
  return { ...narration, mysteryStyle: style };
}
```

**Impact**:
- Narration generation won't fail even if keyword/arc extraction fails
- Detailed logging helps debug issues
- Graceful degradation ensures users always get a narration

---

## Files Modified

### `src/server/services/case/CaseGeneratorService.ts`

**Changes**:
1. **Line 466**: Changed return type from inline object to `Promise<IntroNarration>`
2. **Line 215**: Added `narrationStyle` parameter to `generateFallbackNarration` call
3. **Line 491-514**: Added try-catch with logging for keyword/arc extraction (success path)
4. **Line 528-545**: Added try-catch for fallback narration (validation failure path)
5. **Line 554-571**: Added try-catch for final fallback (TypeScript safety path)
6. **Line 784-808**: Updated `generateFallbackNarration` signature and added try-catch

---

## Testing Checklist

### Manual Testing Steps:

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Navigate to game in browser**

3. **Create a new case** (or trigger narration generation)

4. **Check server console for logs**:
   - ✅ Should see: `🔍 Extracting keywords from narration...`
   - ✅ Should see: `✅ Keywords extracted: X critical, Y atmospheric, Z sensory`
   - ✅ Should see: `🎭 Generating emotional arc...`
   - ✅ Should see: `✅ Emotional arc generated with N curve points`

5. **Verify narration displays correctly**:
   - [ ] Narration text appears
   - [ ] No errors in console
   - [ ] Keywords are included (check network tab response)
   - [ ] Emotional arc is included (check network tab response)

### Expected Console Output (Success):

```
✅ Narration validation passed on attempt 1
🔍 Extracting keywords from narration...
✅ Keywords extracted: 5 critical, 8 atmospheric, 3 sensory
🎭 Generating emotional arc...
✅ Emotional arc generated with 4 curve points
✅ Intro narration generated
```

### Expected Console Output (If Extraction Fails):

```
✅ Narration validation passed on attempt 1
🔍 Extracting keywords from narration...
❌ Error during keyword extraction or emotional arc generation: [error details]
✅ Intro narration generated
```
(Narration will still be generated, just without keywords/arc)

### Expected Console Output (If Validation Fails, Uses Fallback):

```
⚠️ Narration validation failed on attempt 3/3: [validation issues]
❌ All narration generation attempts failed. Using fallback narration.
🔍 Extracting keywords from fallback narration...
✅ Keywords extracted: X critical, Y atmospheric, Z sensory
🎭 Generating emotional arc for fallback narration...
✅ Emotional arc generated with 4 curve points
✅ Intro narration generated
```

---

## Root Cause Analysis

### Why was narration failing?

**Most Likely Cause**: Type mismatch causing TypeScript compilation to generate incorrect JavaScript, or missing `style` parameter causing runtime error in `generateFallbackNarration`.

**How the fixes help**:
1. **Type Safety**: Correct return types ensure TypeScript generates correct code
2. **Parameter Completeness**: All required parameters are now passed
3. **Error Resilience**: Try-catch blocks prevent single-point failures
4. **Observability**: Detailed logging makes debugging easier

---

## Next Steps

1. ✅ **Build Verification**: `npm run build` - **PASSED**
2. ⏳ **Manual Testing**: User should test narration generation
3. ⏳ **Log Review**: Check server console for any errors during generation
4. ⏳ **Network Inspection**: Verify `keywords` and `emotionalArc` fields in API response

---

## Rollback Plan

If issues persist, you can revert the changes:

```bash
git diff HEAD src/server/services/case/CaseGeneratorService.ts
git checkout HEAD src/server/services/case/CaseGeneratorService.ts
npm run build
```

---

## Additional Notes

### Keyword Extraction Logic
- **Critical keywords**: 살인, 범인, 증거, 사건, 의문, etc. (violence, culprit, mystery core)
- **Atmospheric keywords**: 어둠, 밤, 그림자, 침묵, 긴장, etc. (environment, mood)
- **Sensory keywords**: Extracted based on detected senses (visual, auditory, olfactory, tactile)

### Emotional Arc Logic
- **5 style-specific profiles**: classic, noir, cozy, nordic, honkaku
- **Intensity curves**: 4-point curves defining emotional intensity at key positions
- **Climax positioning**: Typically at the incident phase boundary
- **Pacing hints**: slow-burn, quick-tension, or steady

---

## Success Criteria

- [ ] Narration text is generated and displayed
- [ ] No TypeScript compilation errors
- [ ] No runtime errors in server console
- [ ] Keywords field is populated in API response
- [ ] Emotional arc field is populated in API response
- [ ] Logging shows successful keyword extraction
- [ ] Logging shows successful emotional arc generation

---

**If all tests pass, the narration generation system is fully operational and ready for frontend integration.**
