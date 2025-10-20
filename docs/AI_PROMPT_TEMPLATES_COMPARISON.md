# AI 프롬프트 템플릿 시스템 - 종합 비교 문서

**작성일**: 2025-10-20
**버전**: 1.0
**목적**: Armchair Sleuths 프로젝트의 3가지 AI 프롬프트 템플릿 비교 및 구현 가이드

---

## 📋 목차

1. [개요](#개요)
2. [3가지 템플릿 비교표](#3가지-템플릿-비교표)
3. [템플릿별 상세 분석](#템플릿별-상세-분석)
4. [구현 현황](#구현-현황)
5. [코드 패턴 및 통합 방법](#코드-패턴-및-통합-방법)
6. [변수 치환 시스템](#변수-치환-시스템)
7. [설계 철학](#설계-철학)
8. [향후 로드맵](#향후-로드맵)

---

## 개요

### 프롬프트 템플릿 시스템이란?

Armchair Sleuths 게임은 AI(Gemini)를 활용하여 다음 콘텐츠를 생성합니다:

1. **용의자 대화**: 플레이어와 AI 용의자 간의 자연스러운 심문 대화
2. **용의자 초상화**: 각 용의자의 프로필 이미지 (필름 누아르 스타일)
3. **장소/현장 이미지**: 탐색 가능한 범죄 현장 및 위치 이미지

**문제점**: AI에게 매번 복잡한 스타일 가이드와 요구사항을 전달하는 것은 비효율적이며, 일관성 유지가 어렵습니다.

**해결책**: **Claude Skills 패턴**을 적용하여 재사용 가능한 프롬프트 템플릿을 `skills/` 디렉토리에 PROMPT.md 파일로 저장하고, 런타임에 변수 치환을 통해 동적으로 AI 프롬프트를 생성합니다.

### 핵심 이점

✅ **일관성**: 모든 AI 생성 콘텐츠가 동일한 스타일 가이드를 따름
✅ **재사용성**: 템플릿을 한 번 작성하면 모든 케이스에서 재사용
✅ **유지보수**: 스타일 변경 시 템플릿만 수정하면 전체 시스템에 반영
✅ **품질**: 상세한 가이드라인으로 AI 출력 품질 향상
✅ **확장성**: 새로운 템플릿 추가가 간단함

---

## 3가지 템플릿 비교표

| 특성 | suspect-personality-core | suspect-portrait-prompter | scene-atmosphere-prompter |
|------|-------------------------|---------------------------|---------------------------|
| **파일 경로** | `skills/suspect-personality-core/PROMPT.md` | `skills/suspect-portrait-prompter/PROMPT.md` | `skills/scene-atmosphere-prompter/PROMPT.md` |
| **라인 수** | 167 lines | 205 lines | 295 lines |
| **주요 용도** | 용의자 대화 생성 | 용의자 초상화 이미지 생성 | 장소/현장 이미지 생성 |
| **AI 출력 타입** | 텍스트 (대화) | 이미지 (512×512 초상화) | 이미지 (512×512 또는 16:9 환경) |
| **구현 상태** | ✅ 완전 구현 | 🔜 준비 완료 (미통합) | 🔜 준비 완료 (미통합) |
| **사용 서비스** | `SuspectAIService.ts` | `ImageGenerator.ts` (TODO) | `ImageGenerator.ts` (TODO) |
| **핵심 스타일** | 필름 누아르 대화 톤 | 필름 누아르 인물 사진 | 필름 누아르 장소 촬영 |
| **주요 섹션** | 7개 섹션 | 9개 섹션 | 10개 섹션 |

---

## 템플릿별 상세 분석

### 1. suspect-personality-core (용의자 성격 핵심)

**목적**: AI가 용의자 캐릭터를 일관되게 연기하며 플레이어와 자연스러운 대화를 생성

**주요 섹션**:
1. **SYSTEM ROLE**: AI의 역할 정의 (용의자 캐릭터 연기)
2. **CHARACTER IDENTITY**: 이름, 원형(archetype), 배경
3. **CORE PERSONALITY & VALUES**: 성격 특성, 핵심 가치관
4. **CURRENT EMOTIONAL STATE**: 의심 수준(0-100), 감정 상태
5. **GUILTY/INNOCENT STATUS**: 범인 여부에 따른 응답 전략
6. **SPEECH PATTERNS**: 말투, 어휘, 언어적 특성
7. **RESPONSE GUIDELINES**: 응답 품질 가이드라인 (2-4문장, 자연스러움)

**핵심 변수**:
```
{{SUSPECT_NAME}}           - 용의자 이름
{{ARCHETYPE}}              - 원형 (예: The Socialite, The Intellectual)
{{BACKGROUND}}             - 배경 스토리
{{PERSONALITY_TRAITS}}     - 성격 특성
{{SUSPICION_LEVEL}}        - 의심 수준 (0-100)
{{EMOTIONAL_STATE}}        - 감정 상태 (예: defensive, nervous)
{{GUILTY_OR_INNOCENT_BLOCK}} - 범인/무고한 상태별 전략
{{CONVERSATION_HISTORY}}   - 이전 대화 기록
{{USER_QUESTION}}          - 플레이어 질문
```

**품질 제어**:
- ✅ GOOD: 자연스러운 대화, 감정 표현, 2-4문장
- ❌ BAD: 로봇 같은 응답, 과도하게 형식적, 감정 부재

**예시**:
```
Detective: "Where were you when the victim was killed?"
Suspect: "I already told you - I was in my study! Why do you keep asking
the same questions? Are you even listening to me, or are you just trying
to trip me up?"
```

---

### 2. suspect-portrait-prompter (용의자 초상화 프롬프터)

**목적**: 일관된 필름 누아르 스타일의 용의자 초상화 이미지 생성

**주요 섹션**:
1. **OBJECTIVE**: 고품질, 스타일 일관된 초상화 생성
2. **SUBJECT INFORMATION**: 이름, 원형, 나이, 성별, 외모
3. **VISUAL STYLE REQUIREMENTS**: 필름 누아르 미학 (1940s-1950s)
4. **PHOTOGRAPHY STYLE**: 전문 인물 사진 스타일
5. **LIGHTING REQUIREMENTS**: 렘브란트 조명, 극적인 그림자
6. **COLOR PALETTE**: 흑백 또는 탈색 컬러
7. **CHARACTER PORTRAYAL**: 표정, 자세, 분위기
8. **TECHNICAL SPECIFICATIONS**: 512×512, 고화질, 얕은 피사계 심도
9. **AVOID**: 만화풍, 현대적 스타일, 밝은 조명

**핵심 변수**:
```
{{SUSPECT_NAME}}           - 용의자 이름
{{ARCHETYPE}}              - 원형
{{AGE_RANGE}}              - 나이대
{{GENDER}}                 - 성별
{{ETHNICITY}}              - 민족성
{{PHYSICAL_DESCRIPTION}}   - 신체적 묘사
{{CLOTHING_STYLE}}         - 의상 스타일
{{NOTABLE_FEATURES}}       - 특징적 외모
{{PERSONALITY_HINT}}       - 성격을 암시하는 시각적 단서
```

**조명 스타일**:
- 렘브란트 조명 (Rembrandt lighting)
- 45도 각도의 강한 키 라이트
- 뺨에 삼각형 빛 영역 생성
- 높은 명암 대비

**색상 팔레트**:
- **선호**: 흑백 또는 강하게 탈색된 컬러
- **허용**: 뮤트 톤 + 강조색 (빨강, 앰버, 파랑)
- **금지**: 밝고 채도 높은 색상, 파스텔톤

**기술 사양**:
- 해상도: 512×512 pixels
- 구도: 헤드앤숄더, 정면 또는 3/4 각도
- 초점: 얼굴 (특히 눈)에 선명한 초점
- 배경: 어둡고 흐릿하며 최소한

---

### 3. scene-atmosphere-prompter (장면 분위기 프롬프터)

**목적**: 범죄 현장 및 탐색 장소의 대기감 있는 이미지 생성

**주요 섹션**:
1. **OBJECTIVE**: 필름 누아르 미학의 장소 사진 생성
2. **LOCATION INFORMATION**: 장소명, 설명, 분위기, 시간, 날씨
3. **VISUAL STYLE REQUIREMENTS**: 1940s-1950s 범죄 소설 미학
4. **PHOTOGRAPHY STYLE**: 환경/건축 사진 스타일
5. **LIGHTING REQUIREMENTS**: 극적 누아르 조명, 제한된 광원
6. **COLOR PALETTE**: 탈색 또는 흑백, 누아르 색상 그레이딩
7. **LOCATION ATMOSPHERE**: 환경적 스토리텔링
8. **COMPOSITION & FRAMING**: 영화적 구도 법칙
9. **PERIOD ACCURACY**: 1940s-1950s 시대적 정확성
10. **NO PEOPLE IN FRAME**: 사람 없는 장소 사진 (중요!)

**핵심 변수**:
```
{{LOCATION_NAME}}          - 장소 이름
{{LOCATION_DESCRIPTION}}   - 장소 설명
{{ATMOSPHERE}}             - 분위기 (예: ominous, mysterious)
{{TIME_OF_DAY}}            - 시간대 (밤, 황혼, 새벽 등)
{{WEATHER}}                - 날씨 (비, 안개, 맑음 등)
{{KEY_PROPS}}              - 주요 소품/특징
{{LIGHTING_MOOD}}          - 조명 무드
```

**조명 스타일**:
- 제한된 광원 (창문, 램프, 가로등)
- 극적인 그림자와 명암 대비
- 빛줄기 또는 빛 샤프트
- 환경적 광원 (테이블 램프, 촛불, 벽난로)

**시간대별 조명**:
- **밤**: 최소 주변광, 집중된 광원, 깊은 그림자
- **비/폭풍**: 젖은 표면 반사, 빗줄기, 웅덩이, 안개
- **안개/미스트**: 가시성 감소, 확산 광원, 대기 헤이즈
- **황혼/새벽**: 골든 아워 또는 블루 아워 조명

**구도 법칙**:
- 3분할 법칙 (Rule of Thirds)
- 선도선 (Leading Lines)
- 깊이감 (전경, 중경, 후경)
- 대칭/비대칭 구도

**시대적 정확성**:
- 1940s-1950s 건축 스타일
- 시대적 가구 및 소품
- 빈티지 전화기, 라디오, 램프
- 아르데코 또는 빅토리안 인테리어

**중요 규칙**:
- ❌ 프레임에 사람이 보이면 안 됨
- ✅ 버려진 느낌, 텅 빈 장소

---

## 구현 현황

### ✅ 완전 구현: suspect-personality-core

**파일**: `src/server/services/suspect/SuspectAIService.ts`

**구현 내용**:
- 템플릿 로딩 및 캐싱 (`SuspectAIService.promptTemplate`)
- 변수 치환 로직 (`buildSuspectPrompt()`)
- EmotionalStateManager와 통합
- 원형(Archetype) 기반 말투 시스템
- 대화 기록 관리

**동작 과정**:
1. 템플릿을 `skills/suspect-personality-core/PROMPT.md`에서 로드 (최초 1회)
2. 캐시에 저장 (성능 최적화)
3. 용의자 정보, 감정 상태, 대화 기록으로 변수 치환
4. Gemini API에 최종 프롬프트 전송
5. AI 응답을 플레이어에게 반환

**실제 코드**:
```typescript
// 템플릿 로딩 (캐싱)
if (!SuspectAIService.promptTemplate) {
  const templatePath = path.join(
    __dirname,
    '../../../skills/suspect-personality-core/PROMPT.md'
  );
  SuspectAIService.promptTemplate = await fs.readFile(templatePath, 'utf-8');
  console.log('✅ Loaded suspect conversation prompt template');
}

// 변수 치환
let prompt = SuspectAIService.promptTemplate;
prompt = prompt.replace(/\{\{SUSPECT_NAME\}\}/g, suspect.name);
prompt = prompt.replace(/\{\{ARCHETYPE\}\}/g, archetype);
prompt = prompt.replace(/\{\{SUSPICION_LEVEL\}\}/g, String(suspicionLevel));
// ... (모든 변수 치환)

// Gemini API 호출
const response = await this.geminiClient.generateText(prompt);
```

---

### 🔜 준비 완료 (미통합): suspect-portrait-prompter & scene-atmosphere-prompter

**파일**: `src/server/services/generators/ImageGenerator.ts`

**현재 상태**:
- 템플릿 파일은 완성되어 `skills/` 디렉토리에 존재
- ImageGenerator 서비스는 **간소화된 프롬프트**를 사용 중
- TODO 주석으로 향후 통합 계획 명시:

```typescript
// Line 212
generateSuspectImageRequest(suspect: any): ImageGenerationRequest {
  // TODO: Load from skills/suspect-portrait-prompter/PROMPT.md
  //       for full style consistency
  // Current: Simplified prompt with enhanced film noir guidance
  return {
    id: suspect.id,
    type: 'suspect',
    prompt: `Film noir portrait of ${suspect.name}...`, // 간소화된 프롬프트
    description: suspect.name
  };
}

// Line 227
generateLocationImageRequest(location: any): ImageGenerationRequest {
  // TODO: Load from skills/scene-atmosphere-prompter/PROMPT.md
  //       for full atmospheric consistency
  // Current: Simplified prompt with enhanced noir cinematography guidance
  return {
    id: location.id,
    type: 'location',
    prompt: `Film noir crime scene ${location.name}...`, // 간소화된 프롬프트
    description: location.name
  };
}
```

**통합 필요 작업**:
1. SuspectAIService 패턴을 참고하여 템플릿 로딩 로직 추가
2. 변수 치환 로직 구현
3. 캐싱 메커니즘 적용 (성능 최적화)
4. 테스트 및 검증

---

## 코드 패턴 및 통합 방법

### 패턴 1: 템플릿 로딩 및 캐싱

```typescript
export class MyAIService {
  // 1. Static 캐시 변수 선언
  private static promptTemplate: string | null = null;

  async generateContent(...params) {
    // 2. 템플릿 로딩 (최초 1회만)
    if (!MyAIService.promptTemplate) {
      try {
        const templatePath = path.join(
          __dirname,
          '../../../skills/my-skill-name/PROMPT.md'
        );
        MyAIService.promptTemplate = await fs.readFile(templatePath, 'utf-8');
        console.log('✅ Loaded prompt template: my-skill-name');
      } catch (error) {
        console.error('❌ Failed to load prompt template:', error);
        // Fallback: 기본 프롬프트 사용
        MyAIService.promptTemplate = 'Default fallback prompt...';
      }
    }

    // 3. 템플릿 사용
    let prompt = MyAIService.promptTemplate;
    // ... 변수 치환 로직
  }
}
```

**핵심 포인트**:
- Static 변수로 캐싱 → 여러 인스턴스가 공유, 메모리 효율적
- 최초 1회만 파일 읽기 → 성능 최적화
- try-catch로 fallback 처리 → 견고성

---

### 패턴 2: 변수 치환

```typescript
// 템플릿 복사 (원본 보존)
let prompt = MyAIService.promptTemplate;

// 변수 치환 (정규표현식 + 전역 플래그)
prompt = prompt.replace(/\{\{VARIABLE_NAME\}\}/g, actualValue);
prompt = prompt.replace(/\{\{ANOTHER_VAR\}\}/g, anotherValue);

// 조건부 블록 치환
const guiltyBlock = suspect.isGuilty
  ? "You are guilty. Hide your guilt carefully..."
  : "You are innocent. Speak truthfully...";
prompt = prompt.replace(/\{\{GUILTY_OR_INNOCENT_BLOCK\}\}/g, guiltyBlock);

// 배열/리스트 치환
const historyText = conversationHistory
  .map(msg => `${msg.role}: ${msg.content}`)
  .join('\n');
prompt = prompt.replace(/\{\{CONVERSATION_HISTORY\}\}/g, historyText);
```

**핵심 포인트**:
- `/g` 플래그로 모든 출현 치환
- 조건부 블록으로 동적 콘텐츠 생성
- 배열은 join으로 문자열 변환

---

### 패턴 3: 이미지 생성 통합 예시 (ImageGenerator 향후 구현)

```typescript
export class ImageGenerator {
  // 캐시 변수
  private static suspectPortraitTemplate: string | null = null;
  private static sceneAtmosphereTemplate: string | null = null;

  async generateSuspectImageRequest(suspect: any): Promise<ImageGenerationRequest> {
    // 1. 템플릿 로딩
    if (!ImageGenerator.suspectPortraitTemplate) {
      const templatePath = path.join(
        __dirname,
        '../../../skills/suspect-portrait-prompter/PROMPT.md'
      );
      ImageGenerator.suspectPortraitTemplate = await fs.readFile(templatePath, 'utf-8');
    }

    // 2. 변수 치환
    let prompt = ImageGenerator.suspectPortraitTemplate;
    prompt = prompt.replace(/\{\{SUSPECT_NAME\}\}/g, suspect.name);
    prompt = prompt.replace(/\{\{ARCHETYPE\}\}/g, suspect.archetype);
    prompt = prompt.replace(/\{\{AGE_RANGE\}\}/g, suspect.ageRange);
    prompt = prompt.replace(/\{\{PHYSICAL_DESCRIPTION\}\}/g, suspect.description);
    // ... 모든 변수 치환

    // 3. 이미지 생성 요청 반환
    return {
      id: suspect.id,
      type: 'suspect',
      prompt: prompt, // 완전한 템플릿 기반 프롬프트
      description: suspect.name
    };
  }

  async generateLocationImageRequest(location: any): Promise<ImageGenerationRequest> {
    // 동일한 패턴으로 scene-atmosphere-prompter 통합
    // ...
  }
}
```

---

## 변수 치환 시스템

### 변수 명명 규칙

**형식**: `{{VARIABLE_NAME}}`

**규칙**:
- 이중 중괄호 사용: `{{ }}`
- 대문자 스네이크 케이스: `SUSPECT_NAME`, `AGE_RANGE`
- 명확하고 설명적인 이름
- 템플릿 내 여러 곳에 반복 사용 가능

---

### 전체 변수 맵

#### suspect-personality-core 변수

| 변수 | 타입 | 예시 | 설명 |
|------|------|------|------|
| `{{SUSPECT_NAME}}` | string | "Victoria Sterling" | 용의자 이름 |
| `{{ARCHETYPE}}` | string | "The Socialite" | 원형 분류 |
| `{{BACKGROUND}}` | string | "Wealthy socialite..." | 배경 스토리 |
| `{{PERSONALITY_TRAITS}}` | string | "Charming, manipulative..." | 성격 특성 |
| `{{CHARACTER_DEFINITION}}` | string | "Victoria is known for..." | 캐릭터 정의 |
| `{{SUSPICION_LEVEL}}` | number | "65" | 의심 수준 (0-100) |
| `{{EMOTIONAL_STATE}}` | string | "defensive" | 감정 상태 |
| `{{MINDSET}}` | string | "Feeling cornered..." | 현재 마음가짐 |
| `{{TONE_GUIDANCE}}` | string | "Sharp, clipped..." | 톤 가이드 |
| `{{GUILTY_OR_INNOCENT_BLOCK}}` | string | (조건부 블록) | 범인 여부별 전략 |
| `{{SPEECH_PATTERNS}}` | string | "Uses formal language..." | 말투 패턴 |
| `{{VOCABULARY}}` | string | "Darling, absolutely..." | 특징적 어휘 |
| `{{CONVERSATION_HISTORY}}` | string | "User: ... \nSuspect: ..." | 대화 기록 |
| `{{USER_QUESTION}}` | string | "Where were you?" | 플레이어 질문 |

#### suspect-portrait-prompter 변수

| 변수 | 타입 | 예시 | 설명 |
|------|------|------|------|
| `{{SUSPECT_NAME}}` | string | "Victoria Sterling" | 용의자 이름 |
| `{{ARCHETYPE}}` | string | "The Socialite" | 원형 분류 |
| `{{AGE_RANGE}}` | string | "30-35" | 나이대 |
| `{{GENDER}}` | string | "female" | 성별 |
| `{{ETHNICITY}}` | string | "Caucasian" | 민족성 |
| `{{PHYSICAL_DESCRIPTION}}` | string | "Tall, elegant..." | 외모 묘사 |
| `{{CLOTHING_STYLE}}` | string | "Expensive 1940s..." | 의상 스타일 |
| `{{NOTABLE_FEATURES}}` | string | "Pearl necklace..." | 특징적 외모 |
| `{{PERSONALITY_HINT}}` | string | "Calculating gaze..." | 성격 시각적 단서 |

#### scene-atmosphere-prompter 변수

| 변수 | 타입 | 예시 | 설명 |
|------|------|------|------|
| `{{LOCATION_NAME}}` | string | "Victim's Study" | 장소 이름 |
| `{{LOCATION_DESCRIPTION}}` | string | "A wood-paneled..." | 장소 설명 |
| `{{ATMOSPHERE}}` | string | "ominous, tense" | 분위기 |
| `{{TIME_OF_DAY}}` | string | "late night" | 시간대 |
| `{{WEATHER}}` | string | "stormy, raining" | 날씨 |
| `{{KEY_PROPS}}` | string | "Overturned chair..." | 주요 소품 |
| `{{LIGHTING_MOOD}}` | string | "Single desk lamp..." | 조명 무드 |

---

## 설계 철학

### 1. 일관성 우선 (Consistency First)

**문제**: AI는 매번 다른 스타일로 출력할 수 있습니다.

**해결**: 상세한 스타일 가이드를 템플릿에 명시하여 모든 출력이 동일한 미학(필름 누아르)을 따르도록 강제합니다.

**예시**:
- 모든 이미지: 1940s-1950s 시대, 극적 조명, 높은 명암 대비
- 모든 대화: 2-4문장, 자연스러운 톤, 캐릭터 일관성

---

### 2. 재사용성 (Reusability)

**문제**: 각 케이스마다 프롬프트를 새로 작성하는 것은 비효율적입니다.

**해결**: 변수 치환 시스템으로 하나의 템플릿을 무한히 재사용합니다.

**이점**:
- 개발 시간 단축
- 유지보수 용이
- 확장 가능

---

### 3. 품질 제어 (Quality Control)

**문제**: AI가 부적절하거나 저품질 출력을 생성할 수 있습니다.

**해결**: 각 템플릿에 명시적인 "AVOID" 섹션을 포함합니다.

**예시 (suspect-portrait-prompter)**:
```
❌ Cartoonish or Illustrated Style
❌ Modern Photography Styles
❌ Poor Technical Quality
❌ Inappropriate Mood
```

---

### 4. 계층적 구조 (Hierarchical Structure)

각 템플릿은 명확한 계층 구조를 따릅니다:

```
1. OBJECTIVE (목적)
   ↓
2. INPUT INFORMATION (입력 정보 - 변수)
   ↓
3. STYLE REQUIREMENTS (스타일 요구사항)
   ↓
4. TECHNICAL SPECIFICATIONS (기술 사양)
   ↓
5. QUALITY CONTROL (품질 제어 - 금지사항)
   ↓
6. PROMPT COMPOSITION (최종 프롬프트 구성)
```

이 구조는 AI가 단계적으로 이해하기 쉽고, 개발자가 수정하기 편리합니다.

---

### 5. Claude Skills 패턴 준수

**Claude Skills 패턴**:
- `skills/` 디렉토리에 기능별 폴더 생성
- 각 스킬은 `PROMPT.md` 파일로 정의
- 런타임에 동적 로딩 및 변수 치환
- 캐싱으로 성능 최적화

**장점**:
- 표준화된 디렉토리 구조
- 명확한 책임 분리 (스킬 = 하나의 AI 기능)
- 확장 가능 (새 스킬 추가 용이)

---

## 향후 로드맵

### Phase 1: 완료 ✅
- [x] 3개 프롬프트 템플릿 작성
- [x] suspect-personality-core → SuspectAIService 통합
- [x] 변수 치환 시스템 구현
- [x] 캐싱 메커니즘 구현

### Phase 2: 진행 예정 🔜
- [ ] suspect-portrait-prompter → ImageGenerator 통합
- [ ] scene-atmosphere-prompter → ImageGenerator 통합
- [ ] 통합 테스트 및 검증
- [ ] 성능 벤치마크 (템플릿 vs 간소화 프롬프트)

### Phase 3: 향후 계획 📋
- [ ] 추가 템플릿 개발:
  - `evidence-description-prompter`: 증거 설명 생성
  - `case-summary-prompter`: 케이스 요약 생성
  - `interrogation-strategy-prompter`: 심문 전략 제안
- [ ] 다국어 지원 (한국어, 영어 템플릿 분리)
- [ ] A/B 테스트: 템플릿 품질 비교
- [ ] 템플릿 버전 관리 시스템

### Phase 4: 최적화 🚀
- [ ] Gemini API 토큰 사용량 최적화
- [ ] 템플릿 압축 기법 연구
- [ ] 동적 템플릿 선택 (컨텍스트 기반)
- [ ] 템플릿 성능 모니터링 대시보드

---

## 구현 체크리스트

ImageGenerator에 템플릿 통합 시 참고:

### suspect-portrait-prompter 통합 체크리스트

- [ ] 1. 템플릿 로딩 로직 추가
  ```typescript
  private static suspectPortraitTemplate: string | null = null;
  ```

- [ ] 2. 파일 읽기 및 캐싱
  ```typescript
  if (!ImageGenerator.suspectPortraitTemplate) {
    // fs.readFile() 로직
  }
  ```

- [ ] 3. 변수 치환 구현 (9개 변수)
  - [ ] `{{SUSPECT_NAME}}`
  - [ ] `{{ARCHETYPE}}`
  - [ ] `{{AGE_RANGE}}`
  - [ ] `{{GENDER}}`
  - [ ] `{{ETHNICITY}}`
  - [ ] `{{PHYSICAL_DESCRIPTION}}`
  - [ ] `{{CLOTHING_STYLE}}`
  - [ ] `{{NOTABLE_FEATURES}}`
  - [ ] `{{PERSONALITY_HINT}}`

- [ ] 4. Gemini API 호출 업데이트
  ```typescript
  const imageUrl = await this.geminiClient.generateImage(fullPrompt);
  ```

- [ ] 5. 테스트
  - [ ] 단위 테스트: 변수 치환 정확성
  - [ ] 통합 테스트: 이미지 생성 품질
  - [ ] 성능 테스트: 템플릿 로딩 시간

- [ ] 6. 문서화
  - [ ] 코드 주석 업데이트
  - [ ] TODO 제거
  - [ ] 변경 사항 로그 작성

### scene-atmosphere-prompter 통합 체크리스트

(동일한 패턴, 7개 변수)

- [ ] 1. 템플릿 로딩 로직 추가
- [ ] 2. 파일 읽기 및 캐싱
- [ ] 3. 변수 치환 구현 (7개 변수)
- [ ] 4. Gemini API 호출 업데이트
- [ ] 5. 테스트
- [ ] 6. 문서화

---

## 참고 자료

### 관련 파일
- **템플릿**: `skills/suspect-personality-core/PROMPT.md`
- **템플릿**: `skills/suspect-portrait-prompter/PROMPT.md`
- **템플릿**: `skills/scene-atmosphere-prompter/PROMPT.md`
- **구현 예시**: `src/server/services/suspect/SuspectAIService.ts`
- **통합 예정**: `src/server/services/generators/ImageGenerator.ts`

### 관련 문서
- Claude Skills 패턴: Claude Code 공식 문서
- Gemini API 문서: https://ai.google.dev/
- 필름 누아르 미학 가이드: 프로젝트 내부 문서

---

## 결론

이 프롬프트 템플릿 시스템은 Armchair Sleuths의 AI 생성 콘텐츠 품질과 일관성을 크게 향상시킵니다.

**핵심 요약**:
1. **3개 템플릿**: 대화, 초상화, 장소 이미지
2. **1개 완전 구현**: suspect-personality-core (SuspectAIService)
3. **2개 준비 완료**: 이미지 템플릿들 (ImageGenerator 통합 예정)
4. **확장 가능**: 새로운 AI 기능 추가 용이

**다음 단계**: ImageGenerator에 나머지 2개 템플릿을 통합하여 전체 게임의 시각적 일관성을 완성합니다.

---

**문서 끝**
