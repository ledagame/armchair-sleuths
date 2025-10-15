/**
 * Evidence.test.ts
 *
 * Tests for Evidence types and validation functions
 * Validates 3-Clue Rule, Fair Play, and structure consistency
 */

import { describe, it, expect } from 'vitest';
import type { MultilingualEvidence, EvidenceItem } from './Evidence';
import {
  isMultilingualEvidence,
  getEvidenceInLanguage,
  validateThreeClueRule,
  validateEvidenceStructure,
  validateFairPlay
} from './Evidence';

describe('Evidence Types and Validation', () => {
  describe('isMultilingualEvidence', () => {
    it('should return true for valid MultilingualEvidence', () => {
      const validEvidence: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: {
            summary: '증거 요약',
            items: [
              {
                id: 'evidence-1',
                type: 'physical',
                name: '칼',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical',
                pointsToSuspect: 1
              }
            ]
          },
          en: {
            summary: 'Evidence summary',
            items: [
              {
                id: 'evidence-1',
                type: 'physical',
                name: 'Knife',
                description: 'Description',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical',
                pointsToSuspect: 1
              }
            ]
          }
        },
        metadata: {
          totalItems: 1,
          criticalCount: 1,
          threeClueRuleCompliant: false,
          guiltyIndex: 1,
          evidencePointingToGuilty: 1
        },
        generatedAt: Date.now()
      };

      expect(isMultilingualEvidence(validEvidence)).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isMultilingualEvidence(null)).toBe(false);
      expect(isMultilingualEvidence(undefined)).toBe(false);
      expect(isMultilingualEvidence({})).toBe(false);
      expect(isMultilingualEvidence({ caseId: 'test' })).toBe(false);
    });
  });

  describe('getEvidenceInLanguage', () => {
    const testEvidence: MultilingualEvidence = {
      caseId: 'case-2025-01-15',
      locationId: 'study',
      translations: {
        ko: {
          summary: '한국어 요약',
          items: [
            {
              id: 'evidence-1',
              type: 'physical',
              name: '한국어 증거',
              description: '설명',
              discoveryHint: '발견',
              interpretationHint: '해석',
              relevance: 'critical'
            }
          ]
        },
        en: {
          summary: 'English summary',
          items: [
            {
              id: 'evidence-1',
              type: 'physical',
              name: 'English evidence',
              description: 'Description',
              discoveryHint: 'Discovery',
              interpretationHint: 'Interpretation',
              relevance: 'critical'
            }
          ]
        }
      },
      metadata: {
        totalItems: 1,
        criticalCount: 1,
        threeClueRuleCompliant: false,
        guiltyIndex: 0,
        evidencePointingToGuilty: 0
      },
      generatedAt: Date.now()
    };

    it('should return Korean content when language is ko', () => {
      const content = getEvidenceInLanguage(testEvidence, 'ko');
      expect(content.summary).toBe('한국어 요약');
      expect(content.items[0].name).toBe('한국어 증거');
    });

    it('should return English content when language is en', () => {
      const content = getEvidenceInLanguage(testEvidence, 'en');
      expect(content.summary).toBe('English summary');
      expect(content.items[0].name).toBe('English evidence');
    });
  });

  describe('validateThreeClueRule', () => {
    it('should return true when 3-Clue Rule is satisfied', () => {
      const compliantEvidence: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: {
            summary: '요약',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: '증거1',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-2',
                type: 'financial',
                name: '증거2',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-3',
                type: 'communication',
                name: '증거3',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical',
                pointsToSuspect: 1
              }
            ]
          },
          en: {
            summary: 'Summary',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: 'Evidence1',
                description: 'Desc',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-2',
                type: 'financial',
                name: 'Evidence2',
                description: 'Desc',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-3',
                type: 'communication',
                name: 'Evidence3',
                description: 'Desc',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical',
                pointsToSuspect: 1
              }
            ]
          }
        },
        metadata: {
          totalItems: 3,
          criticalCount: 3,
          threeClueRuleCompliant: true,
          guiltyIndex: 1,
          evidencePointingToGuilty: 3
        },
        generatedAt: Date.now()
      };

      expect(validateThreeClueRule(compliantEvidence)).toBe(true);
    });

    it('should return false when critical count is less than 3', () => {
      const nonCompliantEvidence: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: { summary: '요약', items: [] },
          en: { summary: 'Summary', items: [] }
        },
        metadata: {
          totalItems: 2,
          criticalCount: 2,  // Less than 3!
          threeClueRuleCompliant: false,
          guiltyIndex: 1,
          evidencePointingToGuilty: 2
        },
        generatedAt: Date.now()
      };

      expect(validateThreeClueRule(nonCompliantEvidence)).toBe(false);
    });

    it('should return false when evidence pointing to guilty is less than 3', () => {
      const nonCompliantEvidence: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: { summary: '요약', items: [] },
          en: { summary: 'Summary', items: [] }
        },
        metadata: {
          totalItems: 3,
          criticalCount: 3,
          threeClueRuleCompliant: false,
          guiltyIndex: 1,
          evidencePointingToGuilty: 2  // Less than 3!
        },
        generatedAt: Date.now()
      };

      expect(validateThreeClueRule(nonCompliantEvidence)).toBe(false);
    });
  });

  describe('validateEvidenceStructure', () => {
    it('should return true when structure is consistent', () => {
      const validEvidence: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: {
            summary: '요약',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: '증거1',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-2',
                type: 'financial',
                name: '증거2',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'important'
              }
            ]
          },
          en: {
            summary: 'Summary',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: 'Evidence1',
                description: 'Desc',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical',
                pointsToSuspect: 1
              },
              {
                id: 'ev-2',
                type: 'financial',
                name: 'Evidence2',
                description: 'Desc',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'important'
              }
            ]
          }
        },
        metadata: {
          totalItems: 2,
          criticalCount: 1,
          threeClueRuleCompliant: false,
          guiltyIndex: 1,
          evidencePointingToGuilty: 1
        },
        generatedAt: Date.now()
      };

      expect(validateEvidenceStructure(validEvidence)).toBe(true);
    });

    it('should return false when item counts differ', () => {
      const invalidEvidence: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: {
            summary: '요약',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: '증거1',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical'
              },
              {
                id: 'ev-2',
                type: 'financial',
                name: '증거2',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'important'
              }
            ]
          },
          en: {
            summary: 'Summary',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: 'Evidence1',
                description: 'Desc',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical'
              }
              // Missing ev-2!
            ]
          }
        },
        metadata: {
          totalItems: 2,
          criticalCount: 1,
          threeClueRuleCompliant: false,
          guiltyIndex: 1,
          evidencePointingToGuilty: 1
        },
        generatedAt: Date.now()
      };

      expect(validateEvidenceStructure(invalidEvidence)).toBe(false);
    });

    it('should return false when evidence types differ', () => {
      const invalidEvidence: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: {
            summary: '요약',
            items: [
              {
                id: 'ev-1',
                type: 'physical',  // Korean: physical
                name: '증거1',
                description: '설명',
                discoveryHint: '발견',
                interpretationHint: '해석',
                relevance: 'critical'
              }
            ]
          },
          en: {
            summary: 'Summary',
            items: [
              {
                id: 'ev-1',
                type: 'financial',  // English: financial (DIFFERENT!)
                name: 'Evidence1',
                description: 'Desc',
                discoveryHint: 'Discovery',
                interpretationHint: 'Interpretation',
                relevance: 'critical'
              }
            ]
          }
        },
        metadata: {
          totalItems: 1,
          criticalCount: 1,
          threeClueRuleCompliant: false,
          guiltyIndex: 1,
          evidencePointingToGuilty: 1
        },
        generatedAt: Date.now()
      };

      expect(validateEvidenceStructure(invalidEvidence)).toBe(false);
    });
  });

  describe('validateFairPlay', () => {
    it('should return true when Fair Play is satisfied', () => {
      const fairEvidence: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: {
            summary: '요약',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: '증거1',
                description: '설명',
                discoveryHint: '서재 책상에서 발견',  // Has discovery hint
                interpretationHint: '용의자 지문 일치',  // Has interpretation hint
                relevance: 'critical'
              },
              {
                id: 'ev-2',
                type: 'financial',
                name: '증거2',
                description: '설명',
                discoveryHint: '서류 가방에서 발견',  // Has discovery hint
                interpretationHint: '',  // OK - not critical
                relevance: 'minor'
              }
            ]
          },
          en: {
            summary: 'Summary',
            items: []
          }
        },
        metadata: {
          totalItems: 2,
          criticalCount: 1,
          threeClueRuleCompliant: false,
          guiltyIndex: 1,
          evidencePointingToGuilty: 1
        },
        generatedAt: Date.now()
      };

      expect(validateFairPlay(fairEvidence)).toBe(true);
    });

    it('should return false when discovery hint is missing', () => {
      const unfairEvidence: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: {
            summary: '요약',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: '증거1',
                description: '설명',
                discoveryHint: '',  // Missing discovery hint!
                interpretationHint: '해석',
                relevance: 'critical'
              }
            ]
          },
          en: {
            summary: 'Summary',
            items: []
          }
        },
        metadata: {
          totalItems: 1,
          criticalCount: 1,
          threeClueRuleCompliant: false,
          guiltyIndex: 1,
          evidencePointingToGuilty: 1
        },
        generatedAt: Date.now()
      };

      expect(validateFairPlay(unfairEvidence)).toBe(false);
    });

    it('should return false when critical evidence lacks interpretation hint', () => {
      const unfairEvidence: MultilingualEvidence = {
        caseId: 'case-2025-01-15',
        locationId: 'study',
        translations: {
          ko: {
            summary: '요약',
            items: [
              {
                id: 'ev-1',
                type: 'physical',
                name: '증거1',
                description: '설명',
                discoveryHint: '발견 힌트',
                interpretationHint: '',  // Missing interpretation hint for critical evidence!
                relevance: 'critical'
              }
            ]
          },
          en: {
            summary: 'Summary',
            items: []
          }
        },
        metadata: {
          totalItems: 1,
          criticalCount: 1,
          threeClueRuleCompliant: false,
          guiltyIndex: 1,
          evidencePointingToGuilty: 1
        },
        generatedAt: Date.now()
      };

      expect(validateFairPlay(unfairEvidence)).toBe(false);
    });
  });
});
