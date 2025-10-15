# 다국어 게임 개발 전략: 같은 게임 보장

**작성일**: 2025-01-15  
**버전**: 2.0 (최신)  
**목적**: 같은 게임을 여러 언어로 플레이할 수 있는 시스템 설계

---

## 📋 목차

1. [핵심 요구사항](#핵심-요구사항)
2. [아키텍처 개요](#아키텍처-개요)
3. [구현 방법 비교](#구현-방법-비교)
4. [권장 방법: Multilingual Single Game](#권장-방법-multilingual-single-game)
5. [구체적인 구현](#구체적인-구현)
6. [실제 사용 예시](#실제-사용-예시)
7. [구현 로드맵](#구현-로드맵)

---

## 핵심 요구사항

### 문제 정의

**현재 문제**:
```
❌ 잘못된 접근
2025-01-15-ko → 게임 A (진범: 박준호)
2025-01-15-en → 게임 B (진범: Sarah Kim)
→ 다른 게임! 언어 추가 시 관리 복잡
```

**요구사항**:
```
✅ 올바른 접근
2025-01-15 → 게임 A
  ├─ 한국어: 진범 박준호
  └─ 영어: 진범 Park Jun-ho (같은 사람!)
→ 같은 게임! 언어 추가 쉬움
```

### 핵심 원칙

1. **같은 게임 보장**
   - 모든 언어에서 같은 진범
   - 모든 언어에서 같은 스토리 구조
   - 모든 언어에서 같은 해결책

2. **확장 가능성**
   - 새 언어 추가 쉬움
   - 기존 케이스 재생성 불필요
   - 번역만 추가하면 됨

3. **효율성**
   - 케이스는 하루에 한 번만 생성
   - 번역은 필요 시에만
   - 번역 결과 캐싱

---

## 아키텍처 개요

### 새로운 데이터 구조

```typescript
interface MultilingualCase {
  id: "case-2025-01-15",  // 언어 코드 없음!
  date: "2025-01-15",
  baseLanguage: "ko",  // 원본 언어
  
  // 모든 언어 버전 포함
  translations: {
    ko: CaseContent,
    en: CaseContent,
    ja?: CaseContent,  // 나중에 추가 가능
    zh?: CaseContent
  },
  
  // 언어 독립적 메타데이터
  metadata: {
    weaponId: "poison",
    motiveId: "money",
    locationId: "study",
    guiltyIndex: 1  // 진범은 항상 2번째 용의자
  }
}
```

### 작동 방식

```
1. 케이스 생성 (한 번만)
   ↓
2. 여러 언어로 동시 생성 또는 번역
   ↓
3. 모든 언어 버전 저장
   ↓
4. API 호출 시 언어 파라미터로 필터링
```

---

## 구현 방법 비교

### 방법 A: 동시 생성 (Simultaneous Generation)

**설명**: AI에게 한 번에 모든 언어로 생성 요청

**장점**:
- ✅ 완벽하게 같은 게임 보장
- ✅ 문화적 맥락 유지
- ✅ 이름 자연스럽게 현지화
- ✅ 한 번의 생성으로 완료

**단점**:
- ⚠️ 토큰 사용량 2배
- ⚠️ 생성 시간 증가

**평가**: ⭐⭐⭐⭐⭐

---

### 방법 B: 지연 번역 (Lazy Translation)

**설명**: 기본 언어로 생성 후, 필요 시 번역

**장점**:
- ✅ 초기 생성 빠름
- ✅ 필요한 언어만 번역
- ✅ 비용 효율적
- ✅ 같은 게임 보장

**단점**:
- ⚠️ 첫 번역 시 대기 시간
- ⚠️ 번역 품질 관리 필요

**평가**: ⭐⭐⭐⭐

---

### 방법 C: 하이브리드 (Hybrid) ⭐ 권장!

**설명**: 주요 언어는 동시 생성, 추가 언어는 지연 번역

**장점**:
- ✅ 주요 언어 즉시 사용
- ✅ 추가 언어 유연하게 확장
- ✅ 최적의 비용/성능 균형
- ✅ 같은 게임 완벽 보장

**단점**:
- 없음 (최적의 방법)

**평가**: ⭐⭐⭐⭐⭐

---

## 권장 방법: Multilingual Single Game

### 핵심 아이디어

```typescript
// 기존 (잘못된 방식)
generateCase({ date: new Date(), language: 'ko' })  // case-2025-01-15-ko
generateCase({ date: new Date(), language: 'en' })  // case-2025-01-15-en
// → 다른 게임!

// 개선 (올바른 방식)
generateMultilingualCase({ 
  date: new Date(),
  languages: ['ko', 'en']  // 한 번에 여러 언어
})
// → case-2025-01-15 (하나의 케이스, 여러 언어)
```

### 비교표

| 항목 | 이전 방식 | 개선된 방식 |
|------|----------|------------|
| **케이스 ID** | `case-2025-01-15-ko` | `case-2025-01-15` |
| **언어별 게임** | 다른 게임 | 같은 게임 ✅ |
| **진범** | 언어마다 다름 | 모든 언어 동일 ✅ |
| **스토리** | 독립적 | 일관성 유지 ✅ |
| **추가 언어** | 새 케이스 생성 | 번역만 추가 ✅ |
| **저장 공간** | 언어 × 날짜 | 날짜만 |
| **확장성** | 낮음 | 높음 ✅ |

---

## 구체적인 구현

### 1. 타입 정의

```typescript
// src/types/i18n.ts
export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

export interface CaseContent {
  victim: {
    name: string;
    background: string;
    relationship: string;
  };
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
}

export interface MultilingualCase {
  id: string;
  date: string;
  baseLanguage: SupportedLanguage;
  
  // 모든 언어 버전
  translations: Partial<Record<SupportedLanguage, CaseContent>>;
  
  // 언어 독립적 메타데이터
  metadata: {
    weaponId: string;
    motiveId: string;
    locationId: string;
    suspectArchetypeIds: string[];
    guiltyIndex: number;  // 진범 인덱스 (0, 1, 2)
  };
  
  weapon: MultilingualWeapon;
  location: MultilingualLocation;
  imageUrl?: string;
  generatedAt: number;
}
```

---

### 2. CaseElementLibrary 다국어 구조

```typescript
// src/server/services/case/CaseElementLibrary.ts

export interface MultilingualWeapon {
  id: string;  // 언어 독립적 식별자
  translations: {
    ko: {
      name: string;
      description: string;
      keywords: string[];
    };
    en: {
      name: string;
      description: string;
      keywords: string[];
    };
  };
}

export class CaseElementLibrary {
  static readonly weapons: MultilingualWeapon[] = [
    {
      id: 'poison',
      translations: {
        ko: {
          name: '독극물',
          description: '검출하기 어려운 독극물',
          keywords: ['독약', '음독', '중독', '화학물질']
        },
        en: {
          name: 'Poison',
          description: 'Hard-to-detect toxic substance',
          keywords: ['toxin', 'poisoning', 'intoxication', 'chemical']
        }
      }
    },
    // ... 나머지 무기들
  ];
  
  // 언어별 요소 가져오기
  static getLocalizedWeapon(
    weapon: MultilingualWeapon,
    language: SupportedLanguage
  ): Weapon {
    return {
      name: weapon.translations[language].name,
      description: weapon.translations[language].description,
      keywords: weapon.translations[language].keywords
    };
  }
}
```

---

### 3. AI 프롬프트 (다국어 동시 생성)

```typescript
private buildMultilingualPrompt(
  weapon: MultilingualWeapon,
  motive: MultilingualMotive,
  location: MultilingualLocation,
  suspectArchetypes: MultilingualSuspect[],
  languages: SupportedLanguage[]
): string {
  return `You are a mystery novel writer. Create a murder mystery case in MULTIPLE LANGUAGES.

**Constraints:**
- Weapon: ${weapon.translations.ko.name} / ${weapon.translations.en.name}
- Motive: ${motive.translations.ko.category} / ${motive.translations.en.category}
- Location: ${location.translations.ko.name} / ${location.translations.en.name}
- Suspect Archetypes: ${suspectArchetypes.map(s => s.id).join(', ')}

**CRITICAL REQUIREMENTS:**
1. Create the SAME story in both Korean and English
2. Same plot, same relationships, same culprit
3. Korean version: Use Korean names (김명수, 박준호, 이서연)
4. English version: Use romanized or English names (Kim Myung-soo, Park Jun-ho, Lee Seo-yeon)
5. Keep character personalities and backgrounds consistent across languages
6. The culprit must be the SAME person in both versions

**Response Format (JSON):**
\`\`\`json
{
  "ko": {
    "victim": { "name": "김명수", ... },
    "suspects": [
      { "name": "이서연", "isGuilty": false },
      { "name": "박준호", "isGuilty": true },  // 진범!
      { "name": "최민지", "isGuilty": false }
    ],
    "solution": { "who": "박준호", ... }
  },
  "en": {
    "victim": { "name": "Kim Myung-soo", ... },
    "suspects": [
      { "name": "Lee Seo-yeon", "isGuilty": false },
      { "name": "Park Jun-ho", "isGuilty": true },  // 같은 진범!
      { "name": "Choi Min-ji", "isGuilty": false }
    ],
    "solution": { "who": "Park Jun-ho", ... }
  }
}
\`\`\`

Return ONLY the JSON. No other text.`;
}
```

---

### 4. 서비스 구현

```typescript
// src/server/services/case/CaseGeneratorService.ts

export class CaseGeneratorService {
  /**
   * 다국어 케이스 생성
   */
  async generateMultilingualCase(options: {
    date?: Date;
    languages?: SupportedLanguage[];
    includeImage?: boolean;
  }): Promise<MultilingualCase> {
    const {
      date = new Date(),
      languages = ['ko', 'en'],  // 기본: 한국어 + 영어
      includeImage = false
    } = options;

    console.log(`🌍 Generating multilingual case for ${languages.join(', ')}...`);

    // 1. 요소 선택 (언어 독립적)
    const elements = CaseElementLibrary.getTodaysCaseElements(date);

    // 2. 다국어 스토리 생성
    const multilingualStory = await this.generateMultilingualStory(
      elements.weapon,
      elements.motive,
      elements.location,
      elements.suspects,
      languages
    );

    // 3. 진범 인덱스 추출 (언어 독립적)
    const guiltyIndex = multilingualStory[languages[0]].suspects
      .findIndex(s => s.isGuilty);

    // 4. 케이스 저장
    const multilingualCase: MultilingualCase = {
      id: `case-${date.toISOString().split('T')[0]}`,  // 언어 코드 없음!
      date: date.toISOString().split('T')[0],
      baseLanguage: languages[0],
      translations: multilingualStory,
      metadata: {
        weaponId: elements.weapon.id,
        motiveId: elements.motive.id,
        locationId: elements.location.id,
        suspectArchetypeIds: elements.suspects.map(s => s.id),
        guiltyIndex
      },
      weapon: elements.weapon,
      location: elements.location,
      generatedAt: Date.now()
    };

    await CaseRepository.saveMultilingualCase(multilingualCase);

    return multilingualCase;
  }

  /**
   * 다국어 스토리 생성
   */
  private async generateMultilingualStory(
    weapon: MultilingualWeapon,
    motive: MultilingualMotive,
    location: MultilingualLocation,
    suspectArchetypes: MultilingualSuspect[],
    languages: SupportedLanguage[]
  ): Promise<Record<SupportedLanguage, CaseContent>> {
    const prompt = this.buildMultilingualPrompt(
      weapon,
      motive,
      location,
      suspectArchetypes,
      languages
    );

    const response = await this.geminiClient.generateText(prompt, {
      temperature: 0.8,
      maxTokens: 8192  // 다국어이므로 더 많은 토큰 필요
    });

    return this.geminiClient.parseJsonResponse(response.text);
  }

  /**
   * 추가 언어 번역 (지연 번역)
   */
  async translateCase(
    caseId: string,
    targetLanguage: SupportedLanguage
  ): Promise<CaseContent> {
    const existingCase = await CaseRepository.getCase(caseId);
    
    if (!existingCase) {
      throw new Error(`Case ${caseId} not found`);
    }

    // 이미 번역이 있으면 반환
    if (existingCase.translations[targetLanguage]) {
      return existingCase.translations[targetLanguage];
    }

    // 기본 언어에서 번역
    const baseContent = existingCase.translations[existingCase.baseLanguage];
    
    const translationPrompt = `Translate this murder mystery case to ${targetLanguage}.
Keep the same story, characters, and plot. Only translate the text.

Original (${existingCase.baseLanguage}):
${JSON.stringify(baseContent, null, 2)}

Translate to ${targetLanguage} and return JSON in the same format.`;

    const response = await this.geminiClient.generateText(translationPrompt, {
      temperature: 0.3  // 번역은 창의성 낮게
    });

    const translated = this.geminiClient.parseJsonResponse(response.text);

    // 번역 저장
    existingCase.translations[targetLanguage] = translated;
    await CaseRepository.saveMultilingualCase(existingCase);

    return translated;
  }

  /**
   * 특정 언어로 케이스 가져오기
   */
  async getCaseInLanguage(
    date: Date,
    language: SupportedLanguage
  ): Promise<CaseContent> {
    const dateStr = date.toISOString().split('T')[0];
    const caseId = `case-${dateStr}`;

    let multilingualCase = await CaseRepository.getCase(caseId);

    // 케이스가 없으면 생성
    if (!multilingualCase) {
      multilingualCase = await this.generateMultilingualCase({
        date,
        languages: ['ko', 'en']  // 기본 언어들
      });
    }

    // 요청한 언어가 없으면 번역
    if (!multilingualCase.translations[language]) {
      await this.translateCase(caseId, language);
      multilingualCase = await CaseRepository.getCase(caseId);
    }

    return multilingualCase.translations[language]!;
  }
}
```

---

### 5. Repository 업데이트

```typescript
// src/server/services/repositories/kv/CaseRepository.ts

export class CaseRepository {
  /**
   * 다국어 케이스 저장
   */
  static async saveMultilingualCase(
    case: MultilingualCase
  ): Promise<void> {
    await kvStore.set(`case_${case.id}`, case);
  }

  /**
   * 케이스 조회
   */
  static async getCase(
    caseId: string
  ): Promise<MultilingualCase | null> {
    return await kvStore.get(`case_${caseId}`);
  }

  /**
   * 오늘의 케이스 조회 (특정 언어)
   */
  static async getTodaysCaseInLanguage(
    language: SupportedLanguage
  ): Promise<CaseContent | null> {
    const today = new Date().toISOString().split('T')[0];
    const caseId = `case-${today}`;
    
    const multilingualCase = await this.getCase(caseId);
    
    if (!multilingualCase) {
      return null;
    }

    return multilingualCase.translations[language] || null;
  }
}
```

---

### 6. API 엔드포인트

```typescript
// app/api/case/today/route.ts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = (searchParams.get('language') || 'ko') as SupportedLanguage;

  try {
    const caseContent = await caseGenerator.getCaseInLanguage(
      new Date(),
      language
    );

    return Response.json({
      success: true,
      data: caseContent,
      language
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// 사용 예시:
// GET /api/case/today?language=ko  → 한국어 버전
// GET /api/case/today?language=en  → 영어 버전 (같은 게임!)
// GET /api/case/today?language=ja  → 일본어 버전 (자동 번역)
```

---

## 실제 사용 예시

### 시나리오: 2025-01-15 게임

```typescript
// 1. 케이스 생성 (한국어 + 영어 동시)
const case = await generateMultilingualCase({
  date: new Date('2025-01-15'),
  languages: ['ko', 'en']
});

// 결과:
{
  id: "case-2025-01-15",
  metadata: {
    guiltyIndex: 1  // 2번째 용의자가 진범
  },
  translations: {
    ko: {
      suspects: [
        { name: "이서연", isGuilty: false },
        { name: "박준호", isGuilty: true },  // 진범!
        { name: "최민지", isGuilty: false }
      ]
    },
    en: {
      suspects: [
        { name: "Lee Seo-yeon", isGuilty: false },
        { name: "Park Jun-ho", isGuilty: true },  // 같은 진범!
        { name: "Choi Min-ji", isGuilty: false }
      ]
    }
  }
}

// 2. 한국어로 플레이
const koreanGame = await getCaseInLanguage(date, 'ko');
// 진범: 박준호

// 3. 영어로 플레이 (같은 게임!)
const englishGame = await getCaseInLanguage(date, 'en');
// 진범: Park Jun-ho (같은 사람!)

// 4. 나중에 일본어 추가
const japaneseGame = await getCaseInLanguage(date, 'ja');
// 자동으로 번역 생성 및 캐싱
// 진범: パク・ジュンホ (여전히 같은 사람!)
```

---

## 구현 로드맵

### Phase 1: 핵심 구현 (4-6시간) ⭐ 최우선

**목표**: 한국어 + 영어 동시 생성

- [ ] MultilingualCase 타입 정의
- [ ] CaseElementLibrary 다국어 구조 변경
- [ ] 다국어 프롬프트 작성
- [ ] generateMultilingualCase 구현
- [ ] 테스트: 한국어 + 영어 동시 생성 확인

**완료 기준**:
```typescript
const case = await generateMultilingualCase({
  date: new Date(),
  languages: ['ko', 'en']
});

// case.translations.ko 존재
// case.translations.en 존재
// 같은 진범 확인
```

---

### Phase 2: 지연 번역 (2-3시간)

**목표**: 추가 언어 on-demand 번역

- [ ] translateCase 구현
- [ ] 번역 캐싱
- [ ] getCaseInLanguage 구현
- [ ] 테스트: 일본어 번역 확인

**완료 기준**:
```typescript
const japaneseGame = await getCaseInLanguage(date, 'ja');
// 자동으로 번역 생성
// 번역 결과 캐싱 확인
```

---

### Phase 3: API 통합 (2-3시간)

**목표**: 프론트엔드에서 언어 선택 가능

- [ ] API 엔드포인트에 language 파라미터 추가
- [ ] 용의자 대화 API 다국어 지원
- [ ] 채점 시스템 다국어 지원
- [ ] 에러 처리

**완료 기준**:
```bash
# API 테스트
curl /api/case/today?language=ko  # 한국어
curl /api/case/today?language=en  # 영어
curl /api/case/today?language=ja  # 일본어 (자동 번역)
```

---

### Phase 4: UI 다국어화 (3-4시간) - 선택사항

**목표**: 완전한 다국어 경험

- [ ] next-intl 설정
- [ ] UI 텍스트 번역
- [ ] 언어 선택 UI
- [ ] 언어별 라우팅

---

## 장점 정리

### 1. 같은 게임 보장 ✅
```
✅ 모든 언어에서 같은 진범
✅ 모든 언어에서 같은 스토리
✅ 모든 언어에서 같은 해결책
```

### 2. 확장성 ✅
```
✅ 새 언어 추가 쉬움
✅ 번역만 추가하면 됨
✅ 기존 케이스 재생성 불필요
```

### 3. 효율성 ✅
```
✅ 케이스는 하루에 한 번만 생성
✅ 번역은 필요 시에만
✅ 번역 결과 캐싱
```

### 4. 품질 ✅
```
✅ AI가 문화적 맥락 고려
✅ 이름 자연스럽게 현지화
✅ 일관성 유지
```

---

## 체크리스트

### 구현 전 확인사항
- [ ] 같은 게임을 여러 언어로 플레이해야 하는가? → YES
- [ ] 추가 언어 확장 계획이 있는가? → YES
- [ ] 리더보드를 언어별로 분리할 것인가? → NO (같은 게임이므로)
- [ ] 번역 품질이 중요한가? → YES (AI 번역 사용)

### 구현 후 검증사항
- [ ] 한국어와 영어 버전의 진범이 같은가?
- [ ] 케이스 ID에 언어 코드가 없는가?
- [ ] 새 언어 추가가 쉬운가?
- [ ] 번역이 캐싱되는가?
- [ ] API가 언어 파라미터를 지원하는가?

---

## 참고: 업계 표준 사례

**유사한 구조를 사용하는 서비스들**:
- Duolingo (언어 학습)
- Netflix (콘텐츠 다국어)
- Airbnb (숙소 설명)
- Steam (게임 설명)

모두 "언어 파라미터 + 다국어 콘텐츠" 방식을 사용합니다.

---

## 결론

### 핵심 메시지

**"같은 게임, 여러 언어"를 위한 최적의 방법**:

1. **케이스는 하나** (`case-2025-01-15`)
2. **언어는 여러 개** (ko, en, ja, zh...)
3. **진범은 동일** (모든 언어에서)
4. **확장 가능** (새 언어 쉽게 추가)

### 구현 우선순위

1. **Phase 1**: 한국어 + 영어 동시 생성 (필수)
2. **Phase 2**: 지연 번역 시스템 (중요)
3. **Phase 3**: API 통합 (중요)
4. **Phase 4**: UI 다국어화 (선택)

### 예상 효과

- ✅ 영어 대회 참가 가능
- ✅ 글로벌 서비스 준비
- ✅ 유지보수 용이
- ✅ 확장 가능한 구조

---

**문서 버전**: 2.0 (최신)  
**최종 수정**: 2025-01-15  
**작성자**: AI Assistant  
**검토자**: 프로젝트 팀  
**상태**: 구현 준비 완료
