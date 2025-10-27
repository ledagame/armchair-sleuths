# Implementation Plan

## Overview

This implementation plan breaks down the suspect prompt enhancement into discrete, manageable coding tasks. Each task builds incrementally on previous work, with clear objectives and requirements references.

**Context Documents Available:**
- `.kiro/specs/suspect-prompt-enhancement/requirements.md` - User stories and acceptance criteria
- `.kiro/specs/suspect-prompt-enhancement/design.md` - System architecture and interfaces
- `skills/suspect-personality-core/PROMPT.md` - Current prompt template
- `src/server/services/prompts/archetypes/*.yaml` - Archetype data files

## Task List

- [x] 1. Few-Shot Example System Implementation







  - [x] 1.1 Create FewShotExample interface and types


    - Define TypeScript interfaces for FewShotExample, Analysis, and related types
    - Add EmotionalState enum if not exists
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 1.2 Implement FewShotExampleGenerator class


    - Create `generateExample()` method for single example generation
    - Create `generateAllExamples()` method for 8 examples per archetype
    - Create `formatAsMarkdown()` method for output formatting
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 1.3 Write 40 Few-Shot examples (5 archetypes × 8 examples)


    - Write examples for Wealthy Heir (8 examples)
    - Write examples for Loyal Butler (8 examples)
    - Write examples for Talented Artist (8 examples)
    - Write examples for Business Partner (8 examples)
    - Write examples for Former Police Officer (8 examples)
    - Each example must include Detective question, Suspect response, and Analysis
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 1.4 Integrate Few-Shot examples into PROMPT.md


    - Add "FEW-SHOT EXAMPLES" section to PROMPT.md template
    - Format examples with proper markdown structure
    - Ensure examples are accessible during AI generation
    - _Requirements: 1.5_
  
  - [x] 1.5 Update archetype YAML files with fewShotExamples field


    - Add fewShotExamples array to each archetype YAML
    - Link examples to archetype data structure
    - _Requirements: 1.1, 1.2_
  
  - [ ]* 1.6 Write unit tests for FewShotExampleGenerator
    - Test generateExample() structure
    - Test generateAllExamples() count (8 examples)
    - Test formatAsMarkdown() output
    - _Requirements: All Requirement 1_

- [x] 2. Quality Validation System Implementation




  - [x] 2.1 Create QualityValidator class and interfaces


    - Define QualityScores, ValidationResult, QualityMetrics interfaces
    - Implement QualityValidator class structure
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  


  - [x] 2.2 Implement Character Consistency scoring

    - Create `scoreCharacterConsistency()` method
    - Check archetype vocabulary usage
    - Detect wrong archetype vocabulary


    - _Requirements: 2.2, 4.9, 4.10_
  

  - [ ] 2.3 Implement Emotional Alignment scoring
    - Create `scoreEmotionalAlignment()` method

    - Validate word count ranges by emotional state
    - Check tone markers
    - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 2.4 Implement Information Content scoring

    - Create `scoreInformationContent()` method
    - Detect specificity markers (times, dates, amounts)
    - Differentiate guilty vs innocent behavior patterns
    - _Requirements: 2.4_
  
  - [x] 2.5 Implement Natural Dialogue scoring


    - Create `scoreNaturalDialogue()` method
    - Check for contractions and natural language
    - Detect overly formal phrases
    - _Requirements: 2.5_
  
  - [x] 2.6 Implement overall validation logic

    - Create `validate()` method combining all 4 dimensions
    - Calculate overall score
    - Generate feedback messages
    - _Requirements: 2.1, 2.6, 2.7_
  
  - [x] 2.7 Integrate QualityValidator into SuspectAIService


    - Add qualityValidator instance to SuspectAIService
    - Call validation after AI response generation
    - Add environment variable check (ENABLE_QUALITY_VALIDATION)
    - _Requirements: 2.1, 2.7_
  
  - [x] 2.8 Implement QualityLogger for metrics tracking


    - Create QualityLogger class
    - Log validation results with timestamp, archetype, scores
    - Store metrics for dashboard
    - _Requirements: 2.8_
  

  - [ ] 2.9 Add development vs production mode handling
    - Console.warn in development for failed validations
    - Silent logging in production
    - _Requirements: 2.7_
  
  - [ ]* 2.10 Write unit tests for QualityValidator
    - Test scoreCharacterConsistency() with correct/wrong vocabulary
    - Test scoreEmotionalAlignment() with word count ranges
    - Test scoreInformationContent() for guilty/innocent patterns
    - Test scoreNaturalDialogue() for contractions and formality
    - _Requirements: All Requirement 2_
  
  - [ ]* 2.11 Write integration tests for SuspectAIService
    - Test quality validation integration
    - Test quality logging
    - Test development vs production mode
    - _Requirements: 2.1, 2.7, 2.9_

- [x] 3. Response Length Control Enhancement



  - [x] 3.1 Define word count ranges by emotional state and language
    - Create WORD_COUNT_RANGES constant with en/ko values
    - COOPERATIVE: en[40-80], ko[30-60]
    - NERVOUS: en[30-60], ko[22-45]
    - DEFENSIVE: en[15-40], ko[11-30]
    - AGGRESSIVE: en[10-30], ko[7-22]
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.3_
  
  - [x] 3.2 Implement word count validation
    - Add word count calculation to validation
    - Log warnings for out-of-range responses
    - _Requirements: 3.5, 3.6_
  
  - [x] 3.3 Reflect word count in quality scores
    - Integrate word count check into Emotional Alignment scoring
    - Penalize responses outside target range
    - _Requirements: 3.7_

- [x] 4. Archetype-Specific Guidelines Enhancement



  - [ ] 4.1 Add characteristicPhrases to archetype YAML structure
    - Update ArchetypeData interface with characteristicPhrases field
    - Add minimum 5 phrases per archetype
    - _Requirements: 4.5_
  
  - [ ] 4.2 Populate characteristicPhrases for all 5 archetypes
    - Wealthy Heir: 5+ characteristic phrases
    - Loyal Butler: 5+ characteristic phrases
    - Talented Artist: 5+ characteristic phrases
    - Business Partner: 5+ characteristic phrases
    - Former Police Officer: 5+ characteristic phrases
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 4.3 Implement vocabulary conflict detection
    - Create `checkVocabularyConflict()` method in ArchetypeManager
    - Calculate conflict rate between archetypes
    - Return list of conflicting words
    - _Requirements: 4.6, 4.7_
  
  - [ ] 4.4 Add archetype validation to generate-archetype script
    - Check vocabulary uniqueness when creating new archetype
    - Warn if conflict rate > 50%
    - _Requirements: 4.6, 4.7_
  
  - [ ] 4.5 Update PROMPT.md with archetype-specific sections
    - Add {{CHARACTERISTIC_PHRASES}} variable
    - Enhance archetype description sections
    - _Requirements: 4.8_

- [x] 5. Multilingual Support Implementation




  - [x] 5.1 Create language configuration system

    - Define LanguageConfig interface
    - Create language config for 'en' and 'ko'
    - _Requirements: 5.1, 5.2_
  

  - [ ] 5.2 Implement MultilingualPromptManager class
    - Create `getSupportedLanguages()` method
    - Create `loadPromptTemplate()` method for language-specific templates
    - Create `calculateWordCountRange()` method with language multipliers
    - Create `getQualityCriteria()` method for language-specific thresholds
    - _Requirements: 5.2, 5.3, 5.8_

  
  - [ ] 5.3 Create PROMPT.ko.md (Korean version)
    - Translate PROMPT.md to Korean
    - Adapt examples for Korean cultural context
    - Adjust word count guidance for Korean

    - _Requirements: 5.2, 5.3, 5.4_
  
  - [ ] 5.4 Write Korean Few-Shot examples
    - Create 8 Korean examples per archetype (40 total)
    - Ensure natural Korean expressions

    - Include proper honorifics and sentence endings
    - _Requirements: 5.4_
  
  - [ ] 5.5 Implement Korean-specific quality validation
    - Create `scoreNaturalDialogueKorean()` method
    - Check for appropriate honorifics (습니다, 세요, 시, 요)

    - Check for natural sentence endings (요, 죠, 네요, 군요)
    - Penalize overly formal endings (하옵니다, 하오, 하게)
    - _Requirements: 5.9_
  
  - [x] 5.6 Add language selection to SuspectAIService

    - Add language parameter to generateResponse()
    - Load appropriate PROMPT template based on language
    - Apply language-specific quality criteria
    - _Requirements: 5.2, 5.8_
  
  - [ ] 5.7 Update archetype YAML files with multilingual names
    - Ensure name.en and name.ko fields exist
    - Add Korean aliases to aliases array
    - _Requirements: 5.5, 5.6_

- [x] 6. Integrated Workflow System Implementation




  - [x] 6.1 Create WorkflowOrchestrator class


    - Define class structure and dependencies
    - Add ArchetypeManager, QualityValidator dependencies
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 6.2 Implement createNewArchetype() workflow


    - Call generate-archetype.ts
    - Call generate-examples.ts
    - Call validate-quality.ts
    - Return results with paths and validation status
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [x] 6.3 Implement batchValidate() workflow


    - Load all archetypes
    - Validate all Few-Shot examples
    - Generate statistics (pass rate, scores by archetype)
    - _Requirements: 6.3, 6.6, 6.7_
  
  - [x] 6.4 Implement improvePrompt() workflow


    - Analyze PROMPT.md with improve-prompt.ts logic
    - Generate improvement suggestions
    - Estimate impact on quality scores
    - Output results as JSON
    - _Requirements: 6.4_
  
  - [x] 6.5 Create npm scripts for workflows


    - Add `suspect:workflow:new-archetype` script
    - Add `suspect:workflow:batch-validate` script
    - Add `suspect:workflow:improve-prompt` script
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 6.6 Add CI/CD integration for quality checks


    - Create GitHub Actions workflow (or equivalent)
    - Run batch validation on PR
    - Fail build if quality drops below threshold
    - _Requirements: 6.8_
  
  - [ ]* 6.7 Write end-to-end tests for complete workflow
    - Test createNewArchetype() workflow
    - Test batchValidate() workflow
    - Test improvePrompt() workflow
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. Performance Optimization and Monitoring




  - [x] 7.1 Optimize archetype loading performance


    - Implement caching for archetype data
    - Target: < 100ms loading time
    - _Requirements: Performance requirements_
  
  - [x] 7.2 Optimize quality validation performance


    - Implement async validation in production
    - Cache validation results for similar responses
    - Target: < 50ms overhead
    - _Requirements: Performance requirements_
  
  - [ ]* 7.3 Write performance tests
    - Test archetype loading time (< 100ms)
    - Test quality validation time (< 50ms)
    - Test batch validation time (< 2s for 40 examples)
    - _Requirements: Performance requirements_

- [x] 8. Documentation and Deployment


  - [x] 8.1 Update README with new features


    - Document Few-Shot example system
    - Document quality validation system
    - Document multilingual support
    - Document workflow orchestration
    - _Requirements: All requirements_

  
  - [x] 8.2 Create TRANSLATION_GUIDE.md for new languages

    - Provide guidelines for translating PROMPT.md
    - Explain cultural adaptation requirements
    - Define word count adjustment guidelines
    - _Requirements: 5.7_
  
  - [ ]* 8.3 Create quality metrics dashboard (optional)
    - Implement QualityDashboard interface
    - Display real-time pass rate and scores
    - Show trends over last 7 days
    - Show archetype performance breakdown
    - Display alerts for quality drops
    - _Requirements: 2.8, 2.9_
  

  - [x] 8.4 Deploy Phase 1: Few-Shot Examples

    - Complete tasks 1.1-1.5
    - Validate all examples pass quality checks
    - Deploy to staging environment
    - _Requirements: All Requirement 1_
  

  - [x] 8.5 Deploy Phase 2: Quality Validation
    - Complete tasks 2.1-2.9
    - Enable in development environment
    - Monitor performance impact
    - Deploy to production with feature flag
    - _Requirements: All Requirement 2_

  
  - [x] 8.6 Deploy Phase 3: Multilingual Support
    - Complete tasks 5.1-5.7
    - Test Korean prompt generation
    - Validate Korean quality criteria
    - Deploy to production

    - _Requirements: All Requirement 5_
  
  - [x] 8.7 Deploy Phase 4: Workflow Automation

    - Complete tasks 6.1-6.6
    - Test all workflows
    - Integrate with CI/CD
    - Deploy to production
    - _Requirements: All Requirement 6_

## Task Dependencies

```
1.1 → 1.2 → 1.3 → 1.4 → 1.5 (→ 1.6* optional test)
                    ↓
2.1 → 2.2, 2.3, 2.4, 2.5 → 2.6 → 2.7 → 2.8, 2.9 (→ 2.10*, 2.11* optional tests)
                                    ↓
3.1 → 3.2 → 3.3 (integrates with 2.3)
                                    ↓
4.1 → 4.2 → 4.3 → 4.4 → 4.5
                                    ↓
5.1 → 5.2 → 5.3, 5.4 → 5.5 → 5.6 → 5.7
                                    ↓
6.1 → 6.2, 6.3, 6.4 → 6.5 → 6.6 (→ 6.7* optional test)
                                    ↓
7.1, 7.2 → 7.3* (optional performance test)
                                    ↓
8.1, 8.2, 8.3* → 8.4 → 8.5 → 8.6 → 8.7
```

## Estimated Timeline

- **Week 1-2**: Tasks 1.1-1.6 (Few-Shot Examples + optional tests)
- **Week 3**: Tasks 2.1-2.11, 3.1-3.3 (Quality Validation + optional tests)
- **Week 4**: Tasks 4.1-4.5, 5.1-5.7 (Archetypes & Multilingual)
- **Week 5**: Tasks 6.1-6.7, 7.1-7.3 (Workflows, Performance + optional tests)
- **Week 6**: Tasks 8.1-8.7 (Documentation & Deployment)

## Success Criteria

### Core Requirements (Must Have)
- [ ] All 40 Few-Shot examples written and validated
- [ ] Quality validation integrated and working in SuspectAIService
- [ ] Korean PROMPT.md and examples completed
- [ ] All workflows automated (createNewArchetype, batchValidate, improvePrompt)
- [ ] Quality pass rate >= 90%
- [ ] Average quality score >= 75
- [ ] Performance overhead < 50ms
- [ ] Documentation complete

### Optional Requirements (Nice to Have)
- [ ] Unit tests for FewShotExampleGenerator (1.6*)
- [ ] Unit tests for QualityValidator (2.10*)
- [ ] Integration tests for SuspectAIService (2.11*)
- [ ] End-to-end workflow tests (6.7*)
- [ ] Performance tests (7.3*)
- [ ] Quality metrics dashboard (8.3*)

## Notes

- **Optional tasks** (marked with *) can be skipped for MVP
  - Test tasks (1.6*, 2.10*, 2.11*, 6.7*, 7.3*) focus on validation but are not required for core functionality
  - Quality metrics dashboard (8.3*) is a nice-to-have monitoring feature
- **Testing approach**: Unit and integration tests are embedded as optional sub-tasks within their respective implementation tasks
- **Deployment tasks** (8.x) should be done in phases, not all at once
- **Quality validation** can be disabled in production via environment variable if performance is an issue
- **Multilingual support** can be added incrementally (English first, then Korean)
- **Performance optimization** (7.1, 7.2) should be done after core implementation is complete

---

**Document Version**: 1.0
**Last Updated**: 2025-01-23
**Status**: Ready for Implementation
