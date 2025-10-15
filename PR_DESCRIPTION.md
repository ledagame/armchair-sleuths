# Location Exploration & Evidence System

## 📋 Overview

This PR implements a comprehensive location exploration and evidence collection system for the Armchair Sleuths murder mystery game, with full multilingual support (Korean/English).

## ✨ Key Features

### Phase 0: Multilingual Foundation
- **i18n Type System**: Complete multilingual type definitions (`i18n.ts`)
- **CaseElementLibrary**: Updated to support multilingual weapons, locations, and motives
- **Simultaneous Generation**: AI generates Korean and English content in a single API call
- **Validation System**: Ensures same guilty suspect (`guiltyIndex`) across all languages
- **API Updates**: `/api/case/today` accepts `?lang=ko` or `?lang=en` parameter

### Phase 1: Location & Evidence System
- **LocationGeneratorService**: AI-powered location exploration with 3-5 areas and 8-12 clues
- **EvidenceGeneratorService**: Detective game evidence following 3-Clue Rule and Fair Play principles
- **ValidationService**: Comprehensive quality checks for playability and consistency
- **CaseGeneratorService Integration**: Complete case generation with location and evidence

## 🎮 Detective Game Principles

### 3-Clue Rule
- Minimum 3 independent critical clues pointing to guilty suspect
- Each clue reveals different aspect of the crime
- Sufficient evidence to solve the case logically

### Fair Play Principle
- All evidence discoverable with clear hints
- Critical evidence includes interpretation hints
- No hidden information or unfair surprises

### Gumshoe Principle
- Evidence easy to FIND (clear discovery hints)
- Evidence hard to INTERPRET (requires reasoning)
- Players must think and connect dots

## 🏗️ Architecture

### File Structure
```
src/
├── shared/types/
│   ├── i18n.ts                    # Multilingual type definitions
│   ├── Location.ts                # Location exploration types + validation
│   ├── Location.test.ts           # 9 tests
│   ├── Evidence.ts                # Evidence types + validation (3-Clue, Fair Play)
│   └── Evidence.test.ts           # 13 tests
│
├── server/services/
│   ├── case/
│   │   ├── CaseElementLibrary.ts          # Multilingual element library
│   │   ├── CaseGeneratorService.ts        # Integrated case generation
│   │   └── CaseGeneratorService.integration.test.ts  # 7 integration tests
│   │
│   ├── location/
│   │   └── LocationGeneratorService.ts    # AI-powered location generation
│   │
│   ├── evidence/
│   │   └── EvidenceGeneratorService.ts    # AI-powered evidence generation
│   │
│   └── validation/
│       ├── ValidationService.ts           # Quality validation
│       └── ValidationService.test.ts      # 17 tests
```

## 🧪 Testing

### Test Coverage
- **Location Tests**: 9 tests (structure validation, multilingual consistency)
- **Evidence Tests**: 13 tests (3-Clue Rule, Fair Play, structure validation)
- **Validation Tests**: 17 tests (location, evidence, complete case validation)
- **i18n Tests**: 9 tests (multilingual validation, culprit consistency)
- **Integration Tests**: 7 tests (complete workflow, requires GEMINI_API_KEY)

### Test Results
```
✅ 48 unit tests passed
⏭️ 7 integration tests skipped (require API key)
✅ Build successful
```

## 📊 Validation System

### Quality Checks
- **Structure Consistency**: Same areas/clues/evidence in both languages
- **3-Clue Rule Compliance**: Minimum 3 critical clues pointing to guilty
- **Fair Play Compliance**: All evidence discoverable with hints
- **Playability**: Case is solvable with provided evidence
- **Cross-Component Consistency**: Location and Evidence IDs match

## 🚀 Usage

### Generate Complete Case
```typescript
const caseGenerator = new CaseGeneratorService(geminiClient);

const multilingualCase = await caseGenerator.generateMultilingualCase({
  date: new Date('2025-01-15'),
  includeImage: false,
  temperature: 0.8
});

// Returns complete case with:
// - Victim, suspects, solution (both languages)
// - Location exploration (3-5 areas, 8-12 clues)
// - Evidence collection (8-12 items, 3+ critical)
// - Validation results
```

## 🔄 Breaking Changes

None. This PR extends existing functionality without breaking changes.

## 📝 Commits

### Phase 0: Multilingual Foundation (4 commits)
1. `456f57b` - feat: Add multilingual foundation (i18n types + CaseElementLibrary)
2. `a9717ef` - feat: Implement generateMultilingualCase() with simultaneous generation
3. `0c11597` - test: Add multilingual validation tests
4. `e01e2b9` - feat: Add language parameter to /api/case/today endpoint

### Phase 1: Location & Evidence System (5 commits)
5. `1688dd6` - feat: Add LocationGeneratorService with multilingual support
6. `eecfcee` - feat: add EvidenceGeneratorService with 3-clue rule
7. `cc0af7d` - feat: add ValidationService with quality checks
8. `14795e9` - feat: integrate Location and Evidence into CaseGeneratorService
9. `9df78ad` - test: add comprehensive integration tests

## 🎯 Next Steps

1. **Repository Integration**: Update CaseRepository to save location and evidence
2. **Frontend Integration**: Build UI for location exploration and evidence viewing
3. **Image Generation**: Add visual representations for locations
4. **Advanced Features**: Implement evidence analysis and deduction systems
5. **Performance**: Optimize AI generation (parallel calls, caching)

## ✅ Checklist

- [x] Phase 0: Multilingual Foundation complete
- [x] Phase 1: Location & Evidence System complete
- [x] All unit tests passing (48 tests)
- [x] Integration tests implemented (7 tests)
- [x] Build successful
- [x] Type safety maintained
- [x] Documentation complete
- [ ] Manual testing with real API
- [ ] Repository integration
- [ ] Frontend integration

---

**Generated with Claude Code** 🤖
