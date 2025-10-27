# Requirements Document

## Introduction

Armchair Sleuths 게임의 용의자 AI 대화 시스템은 플레이어와 AI 용의자 간의 자연스럽고 몰입감 있는 심문 경험을 제공합니다. 

**현재 구현 상태 (2025-01-23 기준):**
- ✅ suspect-ai-prompter 스킬 완전 구현 (v2.0.0)
- ✅ 4개 자동화 스크립트 작동 (generate-archetype, improve-prompt, generate-examples, validate-quality)
- ✅ 5개 아키타입 정의 완료 (Wealthy Heir, Loyal Butler, Talented Artist, Business Partner, Former Police Officer)
- ✅ 4단계 감정 시스템 구현 (COOPERATIVE, NERVOUS, DEFENSIVE, AGGRESSIVE)
- ✅ YAML 기반 아키타입 데이터 구조
- ✅ 품질 검증 프레임워크 기본 구현 (4차원 평가)
- ⚠️ Few-Shot 예시 부족 (템플릿만 존재, 실제 예시 미작성)
- ⚠️ PROMPT.md 통합 미완료 (스크립트와 템플릿 분리)
- ⚠️ 다국어 지원 미구현

본 문서는 기존 구현을 기반으로 다음 개선사항을 정의합니다:
- Few-Shot 예시 완성 및 PROMPT.md 통합
- 품질 검증 자동화 강화 및 실시간 적용
- 응답 길이 제어 정밀화
- 아키타입 특화 가이드라인 강화
- 다국어 프롬프트 지원 추가

## Glossary

- **Suspect Prompt System**: AI가 용의자 캐릭터를 연기하며 플레이어와 대화하도록 지시하는 프롬프트 템플릿 시스템
- **Archetype**: 용의자의 성격 유형 분류 (예: Wealthy Heir, Talented Artist, Loyal Butler, Business Partner, Former Police Officer)
- **Emotional State**: 의심 수치(0-100)에 따른 용의자의 감정 상태 (COOPERATIVE, NERVOUS, DEFENSIVE, AGGRESSIVE)
- **Few-Shot Learning**: AI에게 좋은 응답 예시를 제공하여 패턴을 학습시키는 기법
- **Quality Validation**: AI 응답의 품질을 객관적 기준으로 평가하는 시스템
- **PROMPT.md**: Claude Skills 패턴에 따라 작성된 프롬프트 템플릿 파일
- **Variable Substitution**: 템플릿 내 변수({{VARIABLE_NAME}})를 실제 값으로 치환하는 메커니즘
- **Suspicion Level**: 플레이어의 심문에 따라 변화하는 용의자에 대한 의심 수치 (0-100)
- **Word Count Range**: 감정 상태별로 정의된 AI 응답의 단어 수 범위

## Requirements

### Requirement 1: Few-Shot 예시 완성 및 통합

**User Story:** 프롬프트 엔지니어로서, AI가 일관된 품질의 응답을 생성하도록 각 아키타입과 감정 상태별로 구체적인 예시를 제공하고 싶습니다. 이를 통해 AI가 패턴을 학습하여 더 자연스럽고 캐릭터에 맞는 대화를 생성할 수 있습니다.

**현재 상태:**
- ✅ generate-examples.ts 스크립트 구현 완료
- ✅ 8개 예시 템플릿 구조 정의 (generate-archetype.ts)
- ⚠️ 실제 예시 콘텐츠 미작성 (5개 아키타입 × 8개 = 40개 필요)
- ⚠️ PROMPT.md에 Few-Shot 섹션 미통합

#### Acceptance Criteria

1. WHEN 각 Archetype 파일이 작성될 때, THE System SHALL 8개의 완성된 Few-Shot 예시를 포함합니다
2. WHEN Few-Shot 예시가 작성될 때, THE System SHALL 4가지 Emotional State (COOPERATIVE, NERVOUS, DEFENSIVE, AGGRESSIVE)와 2가지 유죄 상태(Guilty, Innocent)의 조합을 모두 포함합니다
3. WHEN 각 Few-Shot 예시가 작성될 때, THE System SHALL Detective 질문, Suspect 응답, Analysis 섹션을 포함합니다
4. WHEN Analysis 섹션이 작성될 때, THE System SHALL Character Consistency, Emotional Alignment, Information Content, Natural Dialogue의 4가지 차원에 대한 구체적 평가를 포함합니다
5. WHEN PROMPT.md 파일이 업데이트될 때, THE System SHALL Few-Shot 예시 섹션을 포함하여 AI가 참조할 수 있도록 합니다
6. WHERE 새로운 Archetype이 추가될 때, THE generate-examples.ts 스크립트 SHALL 해당 Archetype에 대한 8개 예시 템플릿을 자동 생성합니다
7. WHEN Few-Shot 예시가 validate-quality.ts로 검증될 때, THE System SHALL 모든 예시가 품질 기준(Overall >= 65)을 통과하도록 보장합니다

### Requirement 2: 품질 검증 자동화 강화

**User Story:** 개발자로서, AI가 생성한 용의자 응답이 품질 기준을 충족하는지 자동으로 검증하고 싶습니다. 이를 통해 일관된 품질을 보장하고 문제가 있는 응답을 조기에 발견할 수 있습니다.

**현재 상태:**
- ✅ validate-quality.ts 스크립트 완전 구현
- ✅ 4차원 평가 알고리즘 작동 (Character, Emotional, Information, Natural)
- ✅ 품질 임계값 정의 (60/60/50/60, Overall 65)
- ✅ 피드백 생성 시스템
- ⚠️ SuspectAIService와 통합 미완료 (수동 검증만 가능)
- ⚠️ 실시간 품질 모니터링 미구현
- ⚠️ 품질 데이터 로깅 및 분석 미구현

#### Acceptance Criteria

1. WHEN AI 응답이 SuspectAIService에서 생성될 때, THE Quality Validation System SHALL 자동으로 4차원 품질 평가를 실행합니다
2. WHEN Character Consistency가 평가될 때, THE System SHALL Archetype 고유 어휘 사용 빈도와 다른 Archetype 어휘 혼입을 측정합니다
3. WHEN Emotional Alignment가 평가될 때, THE System SHALL 단어 수 범위 준수와 감정 상태 톤 마커를 측정합니다
4. WHEN Information Content가 평가될 때, THE System SHALL 유죄/무죄 행동 패턴과 정보 구체성 수준을 측정합니다
5. WHEN Natural Dialogue가 평가될 때, THE System SHALL 축약형 사용, 형식적 표현 회피, 자연스러운 관용구 사용을 측정합니다
6. IF 품질 점수가 임계값 미만일 때, THEN THE System SHALL 경고 로그를 생성하고 구체적 개선 제안을 제공합니다
7. WHEN 품질 검증이 실패할 때, THE System SHALL 개발 환경에서는 상세 피드백을 표시하고 프로덕션에서는 로그에 기록합니다
8. WHEN 품질 데이터가 수집될 때, THE System SHALL Archetype별, 감정 상태별 평균 점수를 추적합니다
9. WHERE 품질 저하 패턴이 감지될 때, THE System SHALL 알림을 생성하고 프롬프트 개선을 제안합니다
10. WHEN validate-quality.ts 스크립트가 실행될 때, THE System SHALL 대화형 CLI로 응답을 입력받고 즉시 평가 결과를 표시합니다

### Requirement 3: 응답 길이 제어 강화

**User Story:** 게임 디자이너로서, 용의자의 감정 상태에 따라 응답 길이가 자연스럽게 변화하도록 정밀하게 제어하고 싶습니다. 이를 통해 압박받는 용의자가 점점 짧고 방어적으로 답변하는 현실적인 심문 경험을 제공할 수 있습니다.

#### Acceptance Criteria

1. WHEN Emotional State가 COOPERATIVE일 때, THE Suspect Prompt System SHALL 응답 길이를 40-80 단어로 제한합니다
2. WHEN Emotional State가 NERVOUS일 때, THE Suspect Prompt System SHALL 응답 길이를 30-60 단어로 제한합니다
3. WHEN Emotional State가 DEFENSIVE일 때, THE Suspect Prompt System SHALL 응답 길이를 15-40 단어로 제한합니다
4. WHEN Emotional State가 AGGRESSIVE일 때, THE Suspect Prompt System SHALL 응답 길이를 10-30 단어로 제한합니다
5. WHEN AI 응답이 생성될 때, THE System SHALL 실제 단어 수를 계산하여 로그에 기록합니다
6. IF 생성된 응답이 목표 범위를 벗어날 때, THEN THE System SHALL 경고 메시지를 로그에 기록합니다
7. WHEN 응답 길이가 목표 범위를 벗어날 때, THE System SHALL 해당 정보를 품질 검증 점수에 반영합니다

### Requirement 4: 아키타입별 특화 가이드라인 강화

**User Story:** 콘텐츠 작가로서, 각 아키타입이 고유한 말투와 어휘를 일관되게 사용하도록 상세한 가이드라인을 제공하고 싶습니다. 이를 통해 플레이어가 각 용의자의 개성을 명확히 느낄 수 있습니다.

**현재 상태:**
- ✅ 5개 아키타입 YAML 파일 완성 (talented-artist.yaml 등)
- ✅ Primary/Secondary Vocabulary 구조 정의
- ✅ 4단계 감정별 Speech Pattern 정의
- ✅ Mindset, Tone, Examples 포함
- ⚠️ Characteristic Phrases 목록 미정의
- ⚠️ 아키타입 간 어휘 충돌 검증 미구현
- ⚠️ PROMPT.md에 아키타입 특화 섹션 미흡

#### Acceptance Criteria

1. WHEN Archetype YAML 파일이 작성될 때, THE System SHALL Primary Vocabulary 목록(최소 8개)을 포함합니다
2. WHEN Archetype YAML 파일이 작성될 때, THE System SHALL Secondary Vocabulary 목록(최소 8개)을 포함합니다
3. WHEN Archetype YAML 파일이 작성될 때, THE System SHALL 각 Emotional State별 Speech Pattern을 포함합니다
4. WHEN Speech Pattern이 정의될 때, THE System SHALL Mindset, Tone, Examples(최소 3개)를 포함합니다
5. WHEN Archetype YAML 파일이 작성될 때, THE System SHALL Characteristic Phrases 목록(최소 5개)을 포함합니다
6. WHEN 새로운 Archetype이 생성될 때, THE generate-archetype.ts 스크립트 SHALL 기존 아키타입과의 어휘 중복을 검사합니다
7. IF 어휘 중복이 50% 이상일 때, THEN THE System SHALL 경고를 표시하고 고유 어휘 추가를 권장합니다
8. WHEN PROMPT.md가 업데이트될 때, THE System SHALL 각 Archetype의 고유 특성을 명확히 설명하는 섹션을 포함합니다
9. WHEN Character Consistency가 평가될 때, THE validate-quality.ts SHALL Archetype 고유 어휘 사용 빈도를 측정합니다
10. IF 응답에 다른 Archetype의 Primary Vocabulary가 포함될 때, THEN THE System SHALL Character Consistency 점수를 10점씩 감점합니다

### Requirement 5: 다국어 프롬프트 지원

**User Story:** 국제 사용자로서, 내 언어로 용의자와 대화하고 싶습니다. 이를 통해 언어 장벽 없이 게임을 즐길 수 있습니다.

**현재 상태:**
- ✅ Archetype YAML에 다국어 이름 구조 정의 (name.en, name.ko)
- ✅ Aliases 배열로 다국어 별칭 지원
- ⚠️ PROMPT.md 한국어 버전 미작성
- ⚠️ 한국어 Few-Shot 예시 미작성
- ⚠️ 언어별 단어 수 범위 미정의
- ⚠️ 다국어 품질 검증 기준 미정의

#### Acceptance Criteria

1. WHEN Suspect Prompt System이 초기화될 때, THE System SHALL 지원 언어 목록(en, ko)을 로드합니다
2. WHEN 플레이어가 언어를 선택할 때, THE System SHALL 해당 언어의 PROMPT.md 파일(PROMPT.en.md, PROMPT.ko.md)을 로드합니다
3. WHEN 한국어 프롬프트가 사용될 때, THE System SHALL 응답 길이를 한국어 특성에 맞게 조정합니다 (영어 대비 70-80% 단어 수)
4. WHEN 한국어 Few-Shot 예시가 작성될 때, THE System SHALL 한국어 자연스러운 표현과 문화적 맥락을 반영합니다
5. WHEN Archetype YAML 파일이 로드될 때, THE System SHALL name.en, name.ko 필드를 지원합니다
6. WHEN Archetype YAML 파일이 로드될 때, THE System SHALL aliases 배열에 영어/한국어 별칭을 모두 포함합니다
7. WHERE 새로운 언어가 추가될 때, THE System SHALL 기존 영어 템플릿을 기반으로 번역 가이드(TRANSLATION_GUIDE.md)를 제공합니다
8. WHEN Quality Validation이 실행될 때, THE System SHALL 언어별 단어 수 범위와 자연스러움 기준을 적용합니다
9. WHEN 한국어 응답이 검증될 때, THE System SHALL 한국어 특유의 존댓말/반말, 종결어미 사용을 평가합니다
10. WHEN improve-prompt.ts 스크립트가 실행될 때, THE System SHALL 다국어 PROMPT.md 파일을 모두 분석하고 개선 제안을 제공합니다

### Requirement 6: 스크립트 통합 및 워크플로우 개선

**User Story:** 개발자로서, 프롬프트 개선 작업을 효율적으로 수행할 수 있는 통합된 워크플로우를 원합니다. 이를 통해 아키타입 생성부터 품질 검증까지 일관된 프로세스로 진행할 수 있습니다.

**현재 상태:**
- ✅ 4개 독립 스크립트 구현 (generate-archetype, improve-prompt, generate-examples, validate-quality)
- ✅ npm scripts 정의 (suspect:add-archetype 등)
- ⚠️ 스크립트 간 데이터 전달 미구현
- ⚠️ 통합 워크플로우 스크립트 미존재
- ⚠️ 배치 처리 기능 미구현

#### Acceptance Criteria

1. WHEN generate-archetype.ts가 실행될 때, THE System SHALL 생성된 아키타입 파일 경로를 반환합니다
2. WHEN generate-examples.ts가 실행될 때, THE System SHALL 특정 아키타입 파일을 입력으로 받아 예시를 추가합니다
3. WHEN validate-quality.ts가 실행될 때, THE System SHALL 아키타입 파일 내 모든 Few-Shot 예시를 배치 검증합니다
4. WHEN improve-prompt.ts가 실행될 때, THE System SHALL PROMPT.md 분석 결과를 JSON 형식으로 출력합니다
5. WHERE 새로운 아키타입 생성 워크플로우가 실행될 때, THE System SHALL generate-archetype → generate-examples → validate-quality 순서로 자동 실행합니다
6. WHEN 배치 검증이 실행될 때, THE System SHALL 모든 아키타입의 모든 예시를 검증하고 통계를 생성합니다
7. WHEN 통계가 생성될 때, THE System SHALL 아키타입별 평균 점수, 최저/최고 점수, 실패율을 포함합니다
8. WHERE CI/CD 파이프라인에서 실행될 때, THE System SHALL 품질 기준 미달 시 빌드를 실패시킵니다
