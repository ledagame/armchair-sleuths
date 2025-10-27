# Few-Shot Example Writing Guide

이 가이드는 40개의 Few-Shot 예시(5개 아키타입 × 8개 예시)를 작성하는 방법을 설명합니다.

## 개요

각 아키타입마다 8개의 예시가 필요합니다:
- 4개 감정 상태 (COOPERATIVE, NERVOUS, DEFENSIVE, AGGRESSIVE)
- 각 감정 상태마다 2개 버전 (INNOCENT, GUILTY)

## 작성 방법

### 옵션 1: 대화형 스크립트 사용 (권장)

```bash
npm run suspect:generate-examples
```

이 스크립트는:
1. 아키타입 이름과 캐릭터 이름을 입력받습니다
2. 각 감정 상태별로 질문과 응답을 입력받습니다
3. 단어 수를 자동으로 확인합니다
4. Markdown 파일로 저장합니다

### 옵션 2: 수동 작성

YAML 파일의 `fewShotExamples` 섹션을 직접 편집합니다.

## 작성 가이드라인

### 1. 단어 수 범위 준수

각 감정 상태별 목표 단어 수:
- **COOPERATIVE**: 40-80 단어
- **NERVOUS**: 30-60 단어
- **DEFENSIVE**: 15-40 단어
- **AGGRESSIVE**: 10-30 단어

### 2. 캐릭터 일관성

각 아키타입의 특징적인 어휘와 말투를 사용하세요:

**Wealthy Heir (부유한 상속인)**
- 어휘: attorney, lawyer, family name, reputation, position
- 말투: 거만하고 권위적, 법률 용어 사용

**Loyal Butler (충성스러운 집사)**
- 어휘: sir, madam, duty, service, discretion
- 말투: 격식있고 공손함, 존칭 사용

**Talented Artist (재능있는 예술가)**
- 어휘: feel, emotions, creative, art, soul, expression
- 말투: 감정적이고 시적, 은유 사용

**Business Partner (사업 파트너)**
- 어휘: deal, contract, investment, profit, strategy
- 말투: 실용적이고 직설적, 비즈니스 용어

**Former Police Officer (전직 경찰)**
- 어휘: procedure, evidence, protocol, investigation
- 말투: 직업적이고 체계적, 법 집행 용어

### 3. 감정 상태 표현

**COOPERATIVE (협조적)**
- 개방적이고 도움이 되려는 태도
- 자세한 설명 제공
- 긍정적인 톤

**NERVOUS (긴장)**
- 불안하고 방어적
- 말을 더듬거나 반복
- 자기 변명

**DEFENSIVE (방어적)**
- 공격받는다고 느낌
- 짧고 날카로운 응답
- 반박하는 태도

**AGGRESSIVE (공격적)**
- 적대적이고 위협적
- 매우 짧은 응답
- 비난하거나 협박

### 4. 유죄/무죄 행동 패턴

**INNOCENT (무죄)**
- 구체적인 세부사항 제공
- 검증 가능한 정보
- 일관된 이야기
- 증거 제시 의지

**GUILTY (유죄)**
- 모호한 답변
- 세부사항 회피
- 이야기 변경
- 책임 전가

### 5. 자연스러운 대화

- 축약형 사용 (I'm, don't, can't)
- 관용구와 은유
- 감정적 반응
- 자연스러운 문장 구조

## 예시 템플릿

### COOPERATIVE - INNOCENT 예시

```yaml
- id: "wealthy-heir-cooperative-innocent"
  emotionalState: "COOPERATIVE"
  isGuilty: false
  question: "Where were you when the victim was killed?"
  response: "I was at the Metropolitan Club with the board of directors. We had a dinner meeting scheduled for 7:30 PM that ran until 11 PM. The maître d' can confirm my reservation, and I have the receipt. We were discussing quarterly earnings—it's all documented in the meeting minutes."
  analysis:
    characterConsistency: "✓ Uses upper-class vocabulary (Metropolitan Club, board of directors, maître d')"
    emotionalAlignment: "✓ COOPERATIVE tone, detailed explanation (58 words, target 40-80)"
    informationContent: "✓ INNOCENT behavior - specific times, verifiable details, offers evidence"
    naturalDialogue: "✓ Contractions (it's), natural flow, confident tone"
    wordCount: 58
    targetRange: [40, 80]
```

### AGGRESSIVE - GUILTY 예시

```yaml
- id: "talented-artist-aggressive-guilty"
  emotionalState: "AGGRESSIVE"
  isGuilty: true
  question: "All evidence points to you. Why shouldn't we charge you?"
  response: "Charge me? With what evidence? You're grasping at straws. I want my attorney. Now."
  analysis:
    characterConsistency: "✓ Emotional outburst, dramatic language"
    emotionalAlignment: "✓ AGGRESSIVE tone, minimal cooperation (16 words, target 10-30)"
    informationContent: "✓ GUILTY behavior - deflects, demands lawyer, no specifics"
    naturalDialogue: "✓ Short sentences, rhetorical question, commanding tone"
    wordCount: 16
    targetRange: [10, 30]
```

## 작성 순서

1. **Wealthy Heir** (8 examples)
2. **Loyal Butler** (8 examples)
3. **Talented Artist** (8 examples)
4. **Business Partner** (8 examples)
5. **Former Police Officer** (8 examples)

## 검증

각 예시 작성 후:

1. **단어 수 확인**: 목표 범위 내인가?
2. **캐릭터 일관성**: 아키타입 어휘를 사용했는가?
3. **감정 표현**: 감정 상태가 명확한가?
4. **유죄/무죄 패턴**: 행동 패턴이 적절한가?
5. **자연스러움**: 실제 대화처럼 들리는가?

## 다음 단계

예시 작성 완료 후:

```bash
# 품질 검증
npm run suspect:validate-quality

# PROMPT.md 개선 제안
npm run suspect:improve-prompt
```

## 참고 자료

- `src/server/services/prompts/archetypes/*.yaml` - 아키타입 정의
- `skills/suspect-personality-core/PROMPT.md` - 프롬프트 템플릿
- `.kiro/specs/suspect-prompt-enhancement/design.md` - 설계 문서

## 도움말

질문이나 도움이 필요하면:
1. Design 문서의 예시 참조
2. 기존 speechPatterns 섹션 참조
3. validate-quality.ts로 품질 확인

---

**작성 시작일**: [날짜 입력]
**완료 목표**: 40개 예시 (5 archetypes × 8 examples)
**현재 진행**: 0/40 (0%)
