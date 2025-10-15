/**
 * i18n.test.ts
 *
 * 다국어 케이스 타입 및 검증 함수 테스트
 *
 * CRITICAL: 모든 언어 버전에서 같은 범인(guiltyIndex) 보장
 */

import { describe, it, expect } from 'vitest';
import type { MultilingualCase, SuspectContent } from './i18n';
import {
  isMultilingualCase,
  getCaseInLanguage,
  validateCulpritConsistency
} from './i18n';

describe('i18n Types and Validation', () => {
  describe('isMultilingualCase', () => {
    it('should return true for valid MultilingualCase', () => {
      const validCase: MultilingualCase = {
        id: 'case-2025-01-15',
        date: '2025-01-15',
        baseLanguage: 'ko',
        translations: {
          ko: {
            title: '테스트 케이스',
            description: '테스트 설명',
            setting: '테스트 배경',
            victim: {
              name: '김철수',
              age: 50,
              occupation: '사업가',
              background: '배경 설명',
              personality: '성격'
            },
            suspects: [
              {
                id: 'suspect-1',
                name: '이영희',
                age: 35,
                occupation: '비서',
                relation: '관계',
                background: '배경',
                personality: '성격',
                alibi: '알리바이',
                motive: '동기',
                isGuilty: false
              },
              {
                id: 'suspect-2',
                name: '박민수',
                age: 40,
                occupation: '동업자',
                relation: '관계',
                background: '배경',
                personality: '성격',
                alibi: '알리바이',
                motive: '동기',
                isGuilty: true
              }
            ],
            solution: {
              who: '박민수',
              how: '독극물',
              when: '오후 11시',
              where: '서재',
              why: '금전',
              evidence: ['증거1', '증거2']
            }
          },
          en: {
            title: 'Test Case',
            description: 'Test description',
            setting: 'Test setting',
            victim: {
              name: 'John Kim',
              age: 50,
              occupation: 'Businessman',
              background: 'Background',
              personality: 'Personality'
            },
            suspects: [
              {
                id: 'suspect-1',
                name: 'Sarah Lee',
                age: 35,
                occupation: 'Secretary',
                relation: 'Relation',
                background: 'Background',
                personality: 'Personality',
                alibi: 'Alibi',
                motive: 'Motive',
                isGuilty: false
              },
              {
                id: 'suspect-2',
                name: 'Mike Park',
                age: 40,
                occupation: 'Business Partner',
                relation: 'Relation',
                background: 'Background',
                personality: 'Personality',
                alibi: 'Alibi',
                motive: 'Motive',
                isGuilty: true
              }
            ],
            solution: {
              who: 'Mike Park',
              how: 'Poison',
              when: '11 PM',
              where: 'Study',
              why: 'Money',
              evidence: ['Evidence1', 'Evidence2']
            }
          }
        },
        metadata: {
          weaponId: 'poison',
          motiveId: 'money',
          locationId: 'study',
          guiltyIndex: 1
        },
        weapon: {
          id: 'poison',
          translations: {
            ko: { name: '독극물', description: '설명' },
            en: { name: 'Poison', description: 'Description' }
          }
        },
        location: {
          id: 'study',
          translations: {
            ko: { name: '서재', description: '설명' },
            en: { name: 'Study', description: 'Description' }
          }
        },
        motive: {
          id: 'money',
          translations: {
            ko: { name: '금전', description: '설명' },
            en: { name: 'Money', description: 'Description' }
          }
        },
        generatedAt: Date.now(),
        version: 1
      };

      expect(isMultilingualCase(validCase)).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isMultilingualCase(null)).toBe(false);
      expect(isMultilingualCase(undefined)).toBe(false);
      expect(isMultilingualCase({})).toBe(false);
      expect(isMultilingualCase({ id: 'test' })).toBe(false);
    });

    it('should return false for missing required fields', () => {
      const invalidCase = {
        id: 'case-2025-01-15',
        date: '2025-01-15',
        // Missing baseLanguage, translations, metadata
      };

      expect(isMultilingualCase(invalidCase)).toBe(false);
    });
  });

  describe('getCaseInLanguage', () => {
    const testCase: MultilingualCase = {
      id: 'case-2025-01-15',
      date: '2025-01-15',
      baseLanguage: 'ko',
      translations: {
        ko: {
          title: '한국어 제목',
          description: '한국어 설명',
          setting: '한국어 배경',
          victim: {
            name: '김철수',
            age: 50,
            occupation: '사업가',
            background: '배경',
            personality: '성격'
          },
          suspects: [],
          solution: {
            who: '범인',
            how: '방법',
            when: '시간',
            where: '장소',
            why: '이유',
            evidence: []
          }
        },
        en: {
          title: 'English Title',
          description: 'English description',
          setting: 'English setting',
          victim: {
            name: 'John Kim',
            age: 50,
            occupation: 'Businessman',
            background: 'Background',
            personality: 'Personality'
          },
          suspects: [],
          solution: {
            who: 'Culprit',
            how: 'Method',
            when: 'Time',
            where: 'Place',
            why: 'Reason',
            evidence: []
          }
        }
      },
      metadata: {
        weaponId: 'poison',
        motiveId: 'money',
        locationId: 'study',
        guiltyIndex: 0
      },
      weapon: {
        id: 'poison',
        translations: {
          ko: { name: '독극물', description: '설명' },
          en: { name: 'Poison', description: 'Description' }
        }
      },
      location: {
        id: 'study',
        translations: {
          ko: { name: '서재', description: '설명' },
          en: { name: 'Study', description: 'Description' }
        }
      },
      motive: {
        id: 'money',
        translations: {
          ko: { name: '금전', description: '설명' },
          en: { name: 'Money', description: 'Description' }
        }
      },
      generatedAt: Date.now(),
      version: 1
    };

    it('should return Korean content when language is ko', () => {
      const content = getCaseInLanguage(testCase, 'ko');
      expect(content.title).toBe('한국어 제목');
      expect(content.victim.name).toBe('김철수');
    });

    it('should return English content when language is en', () => {
      const content = getCaseInLanguage(testCase, 'en');
      expect(content.title).toBe('English Title');
      expect(content.victim.name).toBe('John Kim');
    });

    it('should fallback to base language for unsupported language', () => {
      // @ts-expect-error Testing fallback for unsupported language
      const content = getCaseInLanguage(testCase, 'unsupported');
      expect(content.title).toBe('한국어 제목');
    });
  });

  describe('validateCulpritConsistency', () => {
    it('should return true when guilty suspect is at same index in both languages', () => {
      const consistentCase: MultilingualCase = {
        id: 'case-2025-01-15',
        date: '2025-01-15',
        baseLanguage: 'ko',
        translations: {
          ko: {
            title: '테스트',
            description: '테스트',
            setting: '테스트',
            victim: {
              name: '피해자',
              age: 50,
              occupation: '직업',
              background: '배경',
              personality: '성격'
            },
            suspects: [
              {
                id: 'suspect-1',
                name: '용의자1',
                age: 30,
                occupation: '직업',
                relation: '관계',
                background: '배경',
                personality: '성격',
                alibi: '알리바이',
                motive: '동기',
                isGuilty: false
              },
              {
                id: 'suspect-2',
                name: '용의자2',
                age: 35,
                occupation: '직업',
                relation: '관계',
                background: '배경',
                personality: '성격',
                alibi: '알리바이',
                motive: '동기',
                isGuilty: true // Index 1
              },
              {
                id: 'suspect-3',
                name: '용의자3',
                age: 40,
                occupation: '직업',
                relation: '관계',
                background: '배경',
                personality: '성격',
                alibi: '알리바이',
                motive: '동기',
                isGuilty: false
              }
            ],
            solution: {
              who: '용의자2',
              how: '방법',
              when: '시간',
              where: '장소',
              why: '이유',
              evidence: []
            }
          },
          en: {
            title: 'Test',
            description: 'Test',
            setting: 'Test',
            victim: {
              name: 'Victim',
              age: 50,
              occupation: 'Occupation',
              background: 'Background',
              personality: 'Personality'
            },
            suspects: [
              {
                id: 'suspect-1',
                name: 'Suspect1',
                age: 30,
                occupation: 'Occupation',
                relation: 'Relation',
                background: 'Background',
                personality: 'Personality',
                alibi: 'Alibi',
                motive: 'Motive',
                isGuilty: false
              },
              {
                id: 'suspect-2',
                name: 'Suspect2',
                age: 35,
                occupation: 'Occupation',
                relation: 'Relation',
                background: 'Background',
                personality: 'Personality',
                alibi: 'Alibi',
                motive: 'Motive',
                isGuilty: true // Index 1 (SAME AS KOREAN)
              },
              {
                id: 'suspect-3',
                name: 'Suspect3',
                age: 40,
                occupation: 'Occupation',
                relation: 'Relation',
                background: 'Background',
                personality: 'Personality',
                alibi: 'Alibi',
                motive: 'Motive',
                isGuilty: false
              }
            ],
            solution: {
              who: 'Suspect2',
              how: 'Method',
              when: 'Time',
              where: 'Place',
              why: 'Reason',
              evidence: []
            }
          }
        },
        metadata: {
          weaponId: 'poison',
          motiveId: 'money',
          locationId: 'study',
          guiltyIndex: 1 // Matches both Korean and English
        },
        weapon: {
          id: 'poison',
          translations: {
            ko: { name: '독극물', description: '설명' },
            en: { name: 'Poison', description: 'Description' }
          }
        },
        location: {
          id: 'study',
          translations: {
            ko: { name: '서재', description: '설명' },
            en: { name: 'Study', description: 'Description' }
          }
        },
        motive: {
          id: 'money',
          translations: {
            ko: { name: '금전', description: '설명' },
            en: { name: 'Money', description: 'Description' }
          }
        },
        generatedAt: Date.now(),
        version: 1
      };

      expect(validateCulpritConsistency(consistentCase)).toBe(true);
    });

    it('should return false when guilty suspect is at different index', () => {
      const inconsistentCase: MultilingualCase = {
        id: 'case-2025-01-15',
        date: '2025-01-15',
        baseLanguage: 'ko',
        translations: {
          ko: {
            title: '테스트',
            description: '테스트',
            setting: '테스트',
            victim: {
              name: '피해자',
              age: 50,
              occupation: '직업',
              background: '배경',
              personality: '성격'
            },
            suspects: [
              {
                id: 'suspect-1',
                name: '용의자1',
                age: 30,
                occupation: '직업',
                relation: '관계',
                background: '배경',
                personality: '성격',
                alibi: '알리바이',
                motive: '동기',
                isGuilty: false
              },
              {
                id: 'suspect-2',
                name: '용의자2',
                age: 35,
                occupation: '직업',
                relation: '관계',
                background: '배경',
                personality: '성격',
                alibi: '알리바이',
                motive: '동기',
                isGuilty: true // Index 1 in Korean
              }
            ],
            solution: {
              who: '용의자2',
              how: '방법',
              when: '시간',
              where: '장소',
              why: '이유',
              evidence: []
            }
          },
          en: {
            title: 'Test',
            description: 'Test',
            setting: 'Test',
            victim: {
              name: 'Victim',
              age: 50,
              occupation: 'Occupation',
              background: 'Background',
              personality: 'Personality'
            },
            suspects: [
              {
                id: 'suspect-1',
                name: 'Suspect1',
                age: 30,
                occupation: 'Occupation',
                relation: 'Relation',
                background: 'Background',
                personality: 'Personality',
                alibi: 'Alibi',
                motive: 'Motive',
                isGuilty: true // Index 0 in English (DIFFERENT!)
              },
              {
                id: 'suspect-2',
                name: 'Suspect2',
                age: 35,
                occupation: 'Occupation',
                relation: 'Relation',
                background: 'Background',
                personality: 'Personality',
                alibi: 'Alibi',
                motive: 'Motive',
                isGuilty: false
              }
            ],
            solution: {
              who: 'Suspect1',
              how: 'Method',
              when: 'Time',
              where: 'Place',
              why: 'Reason',
              evidence: []
            }
          }
        },
        metadata: {
          weaponId: 'poison',
          motiveId: 'money',
          locationId: 'study',
          guiltyIndex: 1 // Says index 1, but English has guilty at index 0
        },
        weapon: {
          id: 'poison',
          translations: {
            ko: { name: '독극물', description: '설명' },
            en: { name: 'Poison', description: 'Description' }
          }
        },
        location: {
          id: 'study',
          translations: {
            ko: { name: '서재', description: '설명' },
            en: { name: 'Study', description: 'Description' }
          }
        },
        motive: {
          id: 'money',
          translations: {
            ko: { name: '금전', description: '설명' },
            en: { name: 'Money', description: 'Description' }
          }
        },
        generatedAt: Date.now(),
        version: 1
      };

      expect(validateCulpritConsistency(inconsistentCase)).toBe(false);
    });

    it('should return false when guiltyIndex does not match any suspect', () => {
      const mismatchedCase: MultilingualCase = {
        id: 'case-2025-01-15',
        date: '2025-01-15',
        baseLanguage: 'ko',
        translations: {
          ko: {
            title: '테스트',
            description: '테스트',
            setting: '테스트',
            victim: {
              name: '피해자',
              age: 50,
              occupation: '직업',
              background: '배경',
              personality: '성격'
            },
            suspects: [
              {
                id: 'suspect-1',
                name: '용의자1',
                age: 30,
                occupation: '직업',
                relation: '관계',
                background: '배경',
                personality: '성격',
                alibi: '알리바이',
                motive: '동기',
                isGuilty: true // Index 0
              }
            ],
            solution: {
              who: '용의자1',
              how: '방법',
              when: '시간',
              where: '장소',
              why: '이유',
              evidence: []
            }
          },
          en: {
            title: 'Test',
            description: 'Test',
            setting: 'Test',
            victim: {
              name: 'Victim',
              age: 50,
              occupation: 'Occupation',
              background: 'Background',
              personality: 'Personality'
            },
            suspects: [
              {
                id: 'suspect-1',
                name: 'Suspect1',
                age: 30,
                occupation: 'Occupation',
                relation: 'Relation',
                background: 'Background',
                personality: 'Personality',
                alibi: 'Alibi',
                motive: 'Motive',
                isGuilty: true // Index 0
              }
            ],
            solution: {
              who: 'Suspect1',
              how: 'Method',
              when: 'Time',
              where: 'Place',
              why: 'Reason',
              evidence: []
            }
          }
        },
        metadata: {
          weaponId: 'poison',
          motiveId: 'money',
          locationId: 'study',
          guiltyIndex: 2 // Says index 2, but there's only 1 suspect!
        },
        weapon: {
          id: 'poison',
          translations: {
            ko: { name: '독극물', description: '설명' },
            en: { name: 'Poison', description: 'Description' }
          }
        },
        location: {
          id: 'study',
          translations: {
            ko: { name: '서재', description: '설명' },
            en: { name: 'Study', description: 'Description' }
          }
        },
        motive: {
          id: 'money',
          translations: {
            ko: { name: '금전', description: '설명' },
            en: { name: 'Money', description: 'Description' }
          }
        },
        generatedAt: Date.now(),
        version: 1
      };

      expect(validateCulpritConsistency(mismatchedCase)).toBe(false);
    });
  });
});
