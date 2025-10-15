/**
 * CaseGeneratorService.ts
 *
 * AI 기반 케이스 생성 서비스
 * CaseElementLibrary + GeminiClient를 결합하여 플레이 가능한 케이스 생성
 */

import { GeminiClient, type GeminiTextOptions } from '../gemini/GeminiClient';
import { CaseElementLibrary, type Weapon, type Motive, type Location, type Suspect } from './CaseElementLibrary';
import { CaseRepository, type CreateCaseInput } from '../repositories/kv/CaseRepository';
import type {
  MultilingualCase,
  SupportedLanguage,
  CaseContent,
  VictimContent,
  SuspectContent,
  SolutionContent,
  MultilingualWeapon,
  MultilingualLocation,
  MultilingualMotive
} from '../../../shared/types/i18n';

export interface GenerateCaseOptions {
  date?: Date;
  includeImage?: boolean;
  temperature?: number;
}

/**
 * 다국어 케이스 생성 옵션
 */
export interface GenerateMultilingualCaseOptions {
  date?: Date;
  languages?: SupportedLanguage[];
  includeImage?: boolean;
  temperature?: number;
}

export interface GeneratedCase {
  caseId: string;
  id: string;              // Alias for backward compatibility
  date: string;            // Date string in YYYY-MM-DD format
  victim: {
    name: string;
    background: string;
    relationship: string;
  };
  weapon: Weapon;
  location: Location;
  suspects: Array<{
    id: string;
    name: string;
    archetype: string;
    background: string;
    personality: string;
    isGuilty: boolean;
  }>;
  solution: {
    who: string;
    what: string;
    where: string;
    when: string;
    why: string;
    how: string;
  };
  imageUrl?: string;
  generatedAt: number;
}

/**
 * 케이스 생성 서비스
 */
export class CaseGeneratorService {
  private geminiClient: GeminiClient;

  constructor(geminiClient: GeminiClient) {
    this.geminiClient = geminiClient;
  }

  /**
   * 새로운 케이스 생성
   *
   * Phase 1: 텍스트 케이스만 생성 (이미지는 선택)
   * Phase 2-3: 이미지 포함 생성
   */
  async generateCase(options: GenerateCaseOptions = {}): Promise<GeneratedCase> {
    const {
      date = new Date(),
      includeImage = false,
      temperature = 0.8
    } = options;

    console.log(`🔄 Generating case for ${date.toISOString().split('T')[0]}...`);

    // 1. CaseElementLibrary에서 오늘의 요소 선택
    const elements = CaseElementLibrary.getTodaysCaseElements(date);

    console.log(`📚 Selected elements:
      - Weapon: ${elements.weapon.name}
      - Motive: ${elements.motive.category}
      - Location: ${elements.location.name}
      - Suspects: ${elements.suspects.map(s => s.archetype).join(', ')}`
    );

    // 2. 케이스 스토리 생성 (Gemini)
    const caseStory = await this.generateCaseStory(
      elements.weapon,
      elements.motive,
      elements.location,
      elements.suspects,
      temperature
    );

    console.log(`✅ Case story generated`);

    // 3. 케이스 이미지 생성 (선택)
    let imageUrl: string | undefined;
    if (includeImage) {
      try {
        imageUrl = await this.generateCaseImage(
          elements.location,
          elements.weapon,
          caseStory.victim.name
        );
        console.log(`✅ Case image generated`);
      } catch (error) {
        console.error('❌ Image generation failed:', error);
        // 이미지 실패해도 케이스는 생성 (Phase 1 철학)
      }
    }

    // 4. CaseRepository에 저장
    const createInput: CreateCaseInput = {
      victim: caseStory.victim,
      weapon: {
        name: elements.weapon.name,
        description: elements.weapon.description
      },
      location: {
        name: elements.location.name,
        description: elements.location.description
      },
      suspects: caseStory.suspects.map((suspect, index) => ({
        name: suspect.name,
        archetype: elements.suspects[index].archetype,
        background: suspect.background,
        personality: suspect.personality,
        isGuilty: suspect.isGuilty
      })),
      solution: caseStory.solution,
      imageUrl
    };

    const savedCase = await CaseRepository.createCase(createInput, date);

    console.log(`✅ Case saved: ${savedCase.id}`);

    // 5. GeneratedCase 형식으로 반환
    return {
      caseId: savedCase.id,
      id: savedCase.id,        // Alias for backward compatibility
      date: savedCase.date,    // Date string
      victim: savedCase.victim,
      weapon: elements.weapon,
      location: elements.location,
      suspects: savedCase.suspects.map((s, index) => ({
        id: s.id,
        name: s.name,
        archetype: s.archetype,
        background: caseStory.suspects[index].background,
        personality: caseStory.suspects[index].personality,
        isGuilty: s.isGuilty
      })),
      solution: savedCase.solution,
      imageUrl: savedCase.imageUrl,
      generatedAt: savedCase.generatedAt
    };
  }

  /**
   * 케이스 스토리 생성 (Gemini)
   */
  private async generateCaseStory(
    weapon: Weapon,
    motive: Motive,
    location: Location,
    suspectArchetypes: Suspect[],
    temperature: number
  ): Promise<{
    victim: { name: string; background: string; relationship: string };
    suspects: Array<{
      name: string;
      background: string;
      personality: string;
      isGuilty: boolean;
    }>;
    solution: {
      who: string;
      what: string;
      where: string;
      when: string;
      why: string;
      how: string;
    };
  }> {
    const prompt = this.buildCaseStoryPrompt(weapon, motive, location, suspectArchetypes);

    const response = await this.geminiClient.generateText(prompt, {
      temperature,
      maxTokens: 4096
    });

    // JSON 파싱
    return this.geminiClient.parseJsonResponse(response.text);
  }

  /**
   * 케이스 스토리 생성 프롬프트
   */
  private buildCaseStoryPrompt(
    weapon: Weapon,
    motive: Motive,
    location: Location,
    suspectArchetypes: Suspect[]
  ): string {
    return `당신은 탐정 소설 작가입니다. 다음 요소들을 사용하여 플레이 가능한 살인 미스터리 케이스를 생성하세요.

**제약 조건:**
- 무기: ${weapon.name} (${weapon.description})
- 동기: ${motive.category} (${motive.description})
- 장소: ${location.name} (${location.description})
- 장소 소품: ${location.props.join(', ')}
- 용의자 원형: ${suspectArchetypes.map((s, i) => `${i + 1}. ${s.archetype}`).join(', ')}

**생성 규칙:**
1. **피해자**: 한국 이름, 설득력 있는 배경 스토리, 용의자들과의 관계
2. **용의자 3명**:
   - 각각 한국 이름
   - 제공된 원형을 기반으로 한 상세한 배경
   - 독특한 성격 특성
   - 한 명만 진범 (isGuilty: true)
3. **해결책 (5W1H)**:
   - WHO: 범인의 이름
   - WHAT: 정확한 살인 방법
   - WHERE: 구체적인 장소 (${location.props.join(' 또는 ')} 중 하나)
   - WHEN: 시간대
   - WHY: 명확한 동기
   - HOW: 상세한 실행 방법

**중요**:
- 진범은 3명 중 정확히 1명만
- 다른 2명은 알리바이가 있거나 의심스럽지만 결백함
- 해결책은 논리적이고 증명 가능해야 함

**응답 형식 (JSON):**
\`\`\`json
{
  "victim": {
    "name": "김명수",
    "background": "50대 중반의 성공한 사업가...",
    "relationship": "용의자들과의 관계 설명..."
  },
  "suspects": [
    {
      "name": "이서연",
      "background": "피해자의 비즈니스 파트너로...",
      "personality": "냉철하고 계산적이며...",
      "isGuilty": false
    },
    {
      "name": "박준호",
      "background": "피해자의 오랜 친구이자...",
      "personality": "충동적이고 감정적이며...",
      "isGuilty": true
    },
    {
      "name": "최민지",
      "background": "피해자의 전 부인으로...",
      "personality": "차분하지만 복수심이...",
      "isGuilty": false
    }
  ],
  "solution": {
    "who": "박준호",
    "what": "${weapon.name}을(를) 사용한 살인",
    "where": "${location.name}의 ${location.props[0]} 근처",
    "when": "2024년 1월 15일 오후 11시 30분경",
    "why": "${motive.category} - 구체적인 이유...",
    "how": "상세한 범행 방법..."
  }
}
\`\`\`

JSON만 응답하세요. 다른 설명은 필요 없습니다.`;
  }

  /**
   * 케이스 이미지 생성 프롬프트
   */
  private async generateCaseImage(
    location: Location,
    weapon: Weapon,
    victimName: string
  ): Promise<string> {
    const imagePrompt = this.buildImagePrompt(location, weapon, victimName);

    const response = await this.geminiClient.generateImage(imagePrompt);

    return response.imageUrl;
  }

  /**
   * 이미지 생성 프롬프트
   */
  private buildImagePrompt(
    location: Location,
    weapon: Weapon,
    victimName: string
  ): string {
    return `Crime scene illustration: ${location.name}, ${location.atmosphere}.
Scene includes ${location.props.slice(0, 3).join(', ')}.
Evidence of ${weapon.name}.
Dark, moody lighting.
Professional detective game art style.
No text, no people visible.
High quality, detailed, atmospheric.`;
  }

  /**
   * 다국어 케이스 생성
   *
   * CRITICAL: 한국어와 영어를 동시에 생성하여 동일한 게임 보장
   * - 같은 범인 (guiltyIndex)
   * - 같은 스토리
   * - 다른 언어 표현만
   */
  async generateMultilingualCase(
    options: GenerateMultilingualCaseOptions = {}
  ): Promise<MultilingualCase> {
    const {
      date = new Date(),
      languages = ['ko', 'en'],
      includeImage = false,
      temperature = 0.8
    } = options;

    const dateStr = date.toISOString().split('T')[0];
    console.log(`🌏 Generating multilingual case for ${dateStr}...`);

    // 1. CaseElementLibrary에서 오늘의 요소 선택 (다국어)
    const elements = CaseElementLibrary.getMultilingualCaseElements(date);

    console.log(`📚 Selected multilingual elements:
      - Weapon: ${elements.weapon.translations.ko.name} / ${elements.weapon.translations.en.name}
      - Motive: ${elements.motive.translations.ko.name} / ${elements.motive.translations.en.name}
      - Location: ${elements.location.translations.ko.name} / ${elements.location.translations.en.name}
      - Suspects: ${elements.suspects.map(s => s.archetype).join(', ')}`
    );

    // 2. 케이스 스토리 동시 생성 (한국어 + 영어)
    const multilingualStory = await this.generateMultilingualCaseStory(
      elements.weapon,
      elements.motive,
      elements.location,
      elements.suspects,
      temperature
    );

    console.log(`✅ Multilingual case story generated`);
    console.log(`   Guilty suspect index: ${multilingualStory.guiltyIndex}`);

    // 3. 케이스 이미지 생성 (선택)
    let imageUrl: string | undefined;
    if (includeImage) {
      try {
        imageUrl = await this.generateCaseImage(
          elements.location,
          elements.weapon,
          multilingualStory.translations.ko.victim.name
        );
        console.log(`✅ Case image generated`);
      } catch (error) {
        console.error('❌ Image generation failed:', error);
        // 이미지 실패해도 케이스는 생성
      }
    }

    // 4. MultilingualCase 객체 생성
    const multilingualCase: MultilingualCase = {
      id: `case-${dateStr}`,
      date: dateStr,
      baseLanguage: 'ko',
      translations: multilingualStory.translations,
      metadata: {
        weaponId: elements.weapon.id,
        motiveId: elements.motive.id,
        locationId: elements.location.id,
        guiltyIndex: multilingualStory.guiltyIndex
      },
      weapon: elements.weapon,
      location: elements.location,
      motive: elements.motive,
      generatedAt: Date.now(),
      version: 1
    };

    console.log(`✅ Multilingual case created: ${multilingualCase.id}`);

    // TODO: 다국어 케이스 저장 (CaseRepository 업데이트 필요)
    // await CaseRepository.createMultilingualCase(multilingualCase);

    return multilingualCase;
  }

  /**
   * 다국어 케이스 스토리 생성 (Gemini)
   *
   * 한국어와 영어를 동시에 생성하여 동일한 게임 보장
   */
  private async generateMultilingualCaseStory(
    weapon: MultilingualWeapon,
    motive: MultilingualMotive,
    location: MultilingualLocation,
    suspectArchetypes: Suspect[],
    temperature: number
  ): Promise<{
    translations: {
      ko: CaseContent;
      en: CaseContent;
    };
    guiltyIndex: number;
  }> {
    const prompt = this.buildMultilingualCaseStoryPrompt(
      weapon,
      motive,
      location,
      suspectArchetypes
    );

    const response = await this.geminiClient.generateText(prompt, {
      temperature,
      maxTokens: 8192  // 더 많은 토큰 (두 언어 동시 생성)
    });

    // JSON 파싱
    const parsed = this.geminiClient.parseJsonResponse(response.text);

    return parsed;
  }

  /**
   * 다국어 케이스 스토리 생성 프롬프트
   *
   * CRITICAL: 한국어와 영어를 동시에 생성하여 같은 범인 보장
   */
  private buildMultilingualCaseStoryPrompt(
    weapon: MultilingualWeapon,
    motive: MultilingualMotive,
    location: MultilingualLocation,
    suspectArchetypes: Suspect[]
  ): string {
    return `You are a bilingual detective novel writer. Create a playable murder mystery case in BOTH Korean AND English simultaneously.

**CRITICAL REQUIREMENT: SAME GAME IN BOTH LANGUAGES**
- The SAME suspect must be guilty in both languages (same index: 0, 1, or 2)
- The SAME story, just translated
- The SAME solution, just in different languages

**Given Elements:**
- Weapon: ${weapon.translations.ko.name} / ${weapon.translations.en.name}
- Motive: ${motive.translations.ko.name} / ${motive.translations.en.name}
- Location: ${location.translations.ko.name} / ${location.translations.en.name}
- Suspect Archetypes: ${suspectArchetypes.map((s, i) => `${i + 1}. ${s.archetype}`).join(', ')}

**Generation Rules:**
1. **Victim**: Korean name (for Korean), English name (for English), compelling backstory, relationships
2. **3 Suspects**:
   - Korean names (for Korean), English names (for English)
   - Detailed backgrounds based on provided archetypes
   - Unique personality traits
   - **EXACTLY ONE guilty** (isGuilty: true) **AT THE SAME INDEX IN BOTH LANGUAGES**
3. **Solution (5W1H)**:
   - WHO: Name of the culprit
   - WHAT: Exact murder method
   - WHERE: Specific location
   - WHEN: Time period
   - WHY: Clear motive
   - HOW: Detailed execution method

**IMPORTANT**:
- Exactly 1 guilty suspect out of 3
- The guilty suspect MUST be at the same array index (0, 1, or 2) in BOTH languages
- Other 2 have alibis or are suspicious but innocent
- Solution must be logical and provable

**Response Format (JSON):**
\`\`\`json
{
  "translations": {
    "ko": {
      "title": "사건 제목",
      "description": "사건 설명",
      "setting": "배경 설명",
      "victim": {
        "name": "김명수",
        "age": 52,
        "occupation": "사업가",
        "background": "50대 중반의 성공한 사업가로...",
        "personality": "냉철하고 계산적인 성격..."
      },
      "suspects": [
        {
          "id": "suspect-1",
          "name": "이서연",
          "age": 38,
          "occupation": "비즈니스 파트너",
          "relation": "피해자의 사업 동업자",
          "background": "10년간 함께 사업을 운영한...",
          "personality": "냉철하고 계산적이며...",
          "alibi": "사건 당일 오후 8시부터 12시까지...",
          "motive": "사업 지분 관련 갈등이 있었으나...",
          "isGuilty": false
        },
        {
          "id": "suspect-2",
          "name": "박준호",
          "age": 45,
          "occupation": "오랜 친구",
          "relation": "20년지기 절친",
          "background": "대학 시절부터 알고 지낸...",
          "personality": "충동적이고 감정적이며...",
          "alibi": "사건 당일 집에 혼자 있었다고 주장하나...",
          "motive": "피해자에게 빌린 거액의 빚...",
          "isGuilty": true
        },
        {
          "id": "suspect-3",
          "name": "최민지",
          "age": 41,
          "occupation": "전 부인",
          "relation": "5년 전 이혼",
          "background": "결혼 생활 10년 후 이혼...",
          "personality": "차분하지만 복수심이...",
          "alibi": "사건 당일 친구들과 저녁 식사 중...",
          "motive": "이혼 시 재산 분할 문제로...",
          "isGuilty": false
        }
      ],
      "solution": {
        "who": "박준호",
        "how": "${weapon.translations.ko.name}을(를) 사용한 살인",
        "when": "2024년 1월 15일 오후 11시 30분경",
        "where": "${location.translations.ko.name}",
        "why": "${motive.translations.ko.name} - 빌린 거액의 빚을 갚을 수 없게 되자...",
        "evidence": [
          "범행 도구에서 발견된 지문",
          "CCTV에 포착된 용의자의 출입 기록",
          "피해자와의 마지막 통화 기록"
        ]
      }
    },
    "en": {
      "title": "Case Title",
      "description": "Case description",
      "setting": "Setting description",
      "victim": {
        "name": "James Kim",
        "age": 52,
        "occupation": "Business Executive",
        "background": "A successful businessman in his early 50s...",
        "personality": "Cold and calculating personality..."
      },
      "suspects": [
        {
          "id": "suspect-1",
          "name": "Sarah Lee",
          "age": 38,
          "occupation": "Business Partner",
          "relation": "Victim's business partner",
          "background": "Ran business together for 10 years...",
          "personality": "Cold and calculating...",
          "alibi": "Was at a meeting from 8 PM to midnight...",
          "motive": "Had conflicts over business shares but...",
          "isGuilty": false
        },
        {
          "id": "suspect-2",
          "name": "John Park",
          "age": 45,
          "occupation": "Old Friend",
          "relation": "Best friend for 20 years",
          "background": "Known since college days...",
          "personality": "Impulsive and emotional...",
          "alibi": "Claims to have been home alone but...",
          "motive": "Owed victim a large sum of money...",
          "isGuilty": true
        },
        {
          "id": "suspect-3",
          "name": "Michelle Choi",
          "age": 41,
          "occupation": "Ex-Wife",
          "relation": "Divorced 5 years ago",
          "background": "Married for 10 years before divorce...",
          "personality": "Calm but vengeful...",
          "alibi": "Having dinner with friends...",
          "motive": "Property settlement issues during divorce...",
          "isGuilty": false
        }
      ],
      "solution": {
        "who": "John Park",
        "how": "Murder using ${weapon.translations.en.name}",
        "when": "Around 11:30 PM on January 15, 2024",
        "where": "${location.translations.en.name}",
        "why": "${motive.translations.en.name} - Unable to repay large debt...",
        "evidence": [
          "Fingerprints found on murder weapon",
          "CCTV footage of suspect's entry",
          "Record of last phone call with victim"
        ]
      }
    }
  },
  "guiltyIndex": 1
}
\`\`\`

**VERIFY BEFORE RESPONDING:**
- Check that guiltyIndex matches the isGuilty: true suspect in BOTH languages
- Ensure the guilty suspect is at the SAME array position (0, 1, or 2) in both ko and en
- The names can be different, but the guilty person must be at the same index

Respond ONLY with JSON. No other explanation needed.`;
  }

  /**
   * 오늘의 케이스 조회 또는 생성
   */
  async getTodaysCase(options: { includeImage?: boolean } = {}): Promise<GeneratedCase> {
    // 이미 생성된 케이스가 있는지 확인
    const existingCase = await CaseRepository.getTodaysCase();

    if (existingCase) {
      console.log(`✅ Today's case already exists: ${existingCase.id}`);

      // GeneratedCase 형식으로 변환
      const suspects = await CaseRepository.getCaseSuspects(existingCase.id);

      return {
        caseId: existingCase.id,
        id: existingCase.id,        // Alias for backward compatibility
        date: existingCase.date,    // Date string
        victim: existingCase.victim,
        weapon: existingCase.weapon as Weapon,
        location: existingCase.location as Location,
        suspects: suspects.map(s => ({
          id: s.id,
          name: s.name,
          archetype: s.archetype,
          background: s.background,
          personality: s.personality,
          isGuilty: s.isGuilty
        })),
        solution: existingCase.solution,
        imageUrl: existingCase.imageUrl,
        generatedAt: existingCase.generatedAt
      };
    }

    // 새로 생성
    console.log(`🔄 Generating today's case...`);
    return await this.generateCase({
      date: new Date(),
      includeImage: options.includeImage
    });
  }

  /**
   * 특정 날짜의 케이스 조회 또는 생성
   */
  async getCaseForDate(
    date: Date,
    options: { includeImage?: boolean } = {}
  ): Promise<GeneratedCase> {
    const dateStr = date.toISOString().split('T')[0];
    const existingCase = await CaseRepository.getCaseByDate(dateStr);

    if (existingCase) {
      console.log(`✅ Case already exists for ${dateStr}: ${existingCase.id}`);

      const suspects = await CaseRepository.getCaseSuspects(existingCase.id);

      return {
        caseId: existingCase.id,
        id: existingCase.id,        // Alias for backward compatibility
        date: existingCase.date,    // Date string
        victim: existingCase.victim,
        weapon: existingCase.weapon as Weapon,
        location: existingCase.location as Location,
        suspects: suspects.map(s => ({
          id: s.id,
          name: s.name,
          archetype: s.archetype,
          background: s.background,
          personality: s.personality,
          isGuilty: s.isGuilty
        })),
        solution: existingCase.solution,
        imageUrl: existingCase.imageUrl,
        generatedAt: existingCase.generatedAt
      };
    }

    // 새로 생성
    console.log(`🔄 Generating case for ${dateStr}...`);
    return await this.generateCase({
      date,
      includeImage: options.includeImage
    });
  }
}

/**
 * 싱글톤 인스턴스 생성 헬퍼
 */
export function createCaseGeneratorService(geminiClient: GeminiClient): CaseGeneratorService {
  return new CaseGeneratorService(geminiClient);
}
