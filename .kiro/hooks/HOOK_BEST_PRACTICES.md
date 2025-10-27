# Kiro Hook 베스트 프랙티스

**버전**: 2.0.0  
**작성일**: 2025-01-23  
**목적**: 효과적인 Kiro Hook 작성 및 사용 가이드

---

## 📋 목차

1. [Hook이란?](#hook이란)
2. [Hook 베스트 프랙티스](#hook-베스트-프랙티스)
3. [트리거 설계](#트리거-설계)
4. [프롬프트 작성](#프롬프트-작성)
5. [검증 프로세스](#검증-프로세스)
6. [피드백 제공](#피드백-제공)
7. [학습 축적](#학습-축적)
8. [일반적인 실수](#일반적인-실수)

---

## Hook이란?

Kiro Hook은 특정 이벤트 발생 시 자동으로 AI 에이전트를 실행하는 자동화 시스템입니다.

### Hook의 장점

1. **자동화**: 반복적인 검증 작업 자동화
2. **일관성**: 항상 동일한 기준으로 검증
3. **학습**: 발견된 이슈를 패턴으로 축적
4. **효율성**: 수동 검토 시간 대폭 단축

---

## Hook 베스트 프랙티스

### 1. 명확한 목적

✅ **좋은 예**:
```json
{
  "name": "Task Completion Validator",
  "description": "Task 완료 시 Requirements, Design, Code Quality, Build를 검증"
}
```

❌ **나쁜 예**:
```json
{
  "name": "Validator",
  "description": "검증"
}
```

### 2. 구체적인 트리거

✅ **좋은 예**:
```json
{
  "trigger": {
    "type": "user-message",
    "patterns": [
      "task.*완료",
      "Task [0-9]+ 완료",
      ".*검수"
    ],
    "caseSensitive": false
  }
}
```

❌ **나쁜 예**:
```json
{
  "trigger": {
    "type": "manual"
  }
}
```

### 3. 체계적인 프롬프트

프롬프트는 다음 구조를 따라야 합니다:

```markdown
# Hook 제목

## 1단계: 컨텍스트 수집
- 필요한 문서 읽기
- 상태 확인

## 2단계: 검증 수행
- 구체적인 검증 항목
- 체크리스트

## 3단계: 리포트 생성
- 표준화된 형식
- 실행 가능한 피드백

## 중요 지침
- 원칙과 기준
```

### 4. 실행 가능한 피드백

✅ **좋은 피드백**:
```markdown
### 에러 1: Import 누락
- **위치**: src/server/services/validation/quality/index.ts:3
- **원인**: QualityLogger가 export되지 않음
- **수정 방법**:
  ```typescript
  // Before
  export { QualityValidator } from './QualityValidator';
  
  // After
  export { QualityValidator } from './QualityValidator';
  export { QualityLogger } from './QualityLogger';
  ```
```

❌ **나쁜 피드백**:
```markdown
Import 에러가 있습니다. 수정하세요.
```

### 5. 우선순위 명시

모든 이슈에 우선순위를 부여:

- **Critical**: 빌드 실패, 타입 에러 → 즉시 수정
- **High**: 기능 누락, Design 미준수 → 다음 작업 전 수정
- **Medium**: 코드 품질, 최적화 → 백로그 추가

---

## 트리거 설계

### 트리거 타입

1. **user-message**: 사용자 메시지 패턴 매칭
2. **fileEdited**: 파일 저장 시
3. **manual**: 수동 실행

### 패턴 작성 팁

```json
{
  "patterns": [
    "task.*완료",           // "task 완료", "task 2 완료" 등
    "Task [0-9]+ 완료",     // "Task 1 완료", "Task 10 완료" 등
    ".*검수",               // "검수", "코드 검수" 등
    ".*review",             // "review", "code review" 등
  ]
}
```

### 대소문자 구분

```json
{
  "caseSensitive": false  // 대소문자 무시 (권장)
}
```

---

## 프롬프트 작성

### 프롬프트 구조

```markdown
# 제목 및 역할 정의
당신은 [역할]입니다. [상황 설명].

---

## 1단계: [단계명]
### 1.1 [세부 작업]
- [ ] 체크리스트 항목
- [ ] 체크리스트 항목

### 1.2 [세부 작업]
...

---

## 2단계: [단계명]
...

---

## N단계: 리포트 생성

다음 형식으로 리포트를 작성하세요:

```markdown
[리포트 템플릿]
```

---

## 중요 지침

1. [원칙 1]
2. [원칙 2]
```

### 프롬프트 작성 원칙

1. **명확성**: 모호한 표현 피하기
2. **구체성**: 구체적인 예시 제공
3. **체계성**: 단계별 구조화
4. **실행 가능성**: 실제로 수행 가능한 지시
5. **표준화**: 일관된 형식 사용

---

## 검증 프로세스

### 6단계 검증 프로세스

1. **문서 수집**: Requirements, Design, Tasks 읽기
2. **Requirements 검증**: 요구사항 충족도 확인
3. **Design 검증**: 설계 준수도 확인
4. **코드 품질 검증**: 타입, 구조, 문서화
5. **빌드 검증**: 컴파일 및 빌드 성공
6. **누락 사항 확인**: 서브태스크, 파일, 통합

### 검증 체크리스트

각 단계마다 명확한 체크리스트 제공:

```markdown
### 2.3 검증 체크리스트
- [ ] 모든 참조된 Requirements가 구현되었는가?
- [ ] 요구사항의 제약사항이 준수되었는가?
- [ ] 요구사항의 품질 기준이 충족되었는가?
```

---

## 피드백 제공

### 리포트 형식

표준화된 리포트 형식 사용:

```markdown
# 🔍 [작업명] 검증 리포트

**검증 일시**: [시간]
**검증자**: Kiro AI Assistant

---

## 📋 작업 요약
...

## ✅ Requirements 충족도
...

## 🏗️ Design 준수도
...

## 🔧 코드 품질
...

## 🏗️ 빌드 검증
...

## 📝 누락 사항
...

## 🎯 종합 평가
...

## 🚀 다음 단계
...
```

### 자동 수정 제공

Critical 이슈에는 자동 수정 코드 제공:

```markdown
#### 에러 1: [에러 제목]
- **위치**: [파일:줄]
- **원인**: [원인]
- **수정 방법**: [방법]
- **자동 수정 코드**:
  ```typescript
  // Before
  [기존 코드]
  
  // After
  [수정된 코드]
  ```
```

---

## 학습 축적

### 패턴 저장

발견된 이슈를 패턴으로 저장:

```markdown
## 📚 학습 및 패턴

### 이번 작업에서 배운 점
1. [학습 내용]

### 다음 작업에 적용할 패턴
1. [적용할 패턴]

### 방지해야 할 안티패턴
1. [피해야 할 패턴]
```

### 자동 적용

다음 작업 시 자동으로:
1. 체크리스트에 추가
2. 검증 항목에 포함
3. 방지 규칙으로 전환

---

## 일반적인 실수

### 1. 모호한 트리거

❌ **나쁜 예**:
```json
{
  "trigger": {
    "type": "manual"
  }
}
```

✅ **좋은 예**:
```json
{
  "trigger": {
    "type": "user-message",
    "patterns": ["task.*완료", ".*검수"]
  }
}
```

### 2. 추상적인 프롬프트

❌ **나쁜 예**:
```markdown
코드를 검토하고 문제가 있으면 알려주세요.
```

✅ **좋은 예**:
```markdown
## 1단계: TypeScript 타입 체크
```bash
npx tsc --noEmit --project src/server/tsconfig.json
```

검증 항목:
- [ ] 타입 에러가 없는가?
- [ ] any 타입 사용을 피했는가?
```

### 3. 실행 불가능한 피드백

❌ **나쁜 예**:
```markdown
코드 품질이 낮습니다. 개선하세요.
```

✅ **좋은 예**:
```markdown
### 코드 품질 이슈
1. **함수 길이 초과**
   - 위치: src/server/services/SuspectAIService.ts:150-250
   - 문제: buildSuspectPrompt() 함수가 100줄 초과
   - 해결: 다음과 같이 분리하세요:
     - buildPromptHeader()
     - buildPromptBody()
     - buildPromptFooter()
```

### 4. 우선순위 누락

❌ **나쁜 예**:
```markdown
다음 이슈들이 발견되었습니다:
1. 빌드 실패
2. 주석 부족
3. 타입 에러
```

✅ **좋은 예**:
```markdown
### Critical (즉시 수정)
1. 빌드 실패
3. 타입 에러

### Medium (백로그)
2. 주석 부족
```

### 5. 학습 미축적

❌ **나쁜 예**:
- 매번 같은 이슈 발견
- 패턴 저장 안 함

✅ **좋은 예**:
- 발견된 이슈를 패턴으로 저장
- 다음 작업 시 자동 체크
- 반복 이슈 방지

---

## 예시: 완벽한 Hook

```json
{
  "name": "Task Completion Validator",
  "description": "Task 완료 시 철저한 6단계 검수",
  "version": "2.0.0",
  "enabled": true,
  "trigger": {
    "type": "user-message",
    "patterns": [
      "task.*완료",
      "Task [0-9]+ 완료",
      ".*검수"
    ],
    "caseSensitive": false
  },
  "prompt": "[상세한 6단계 검증 프로세스]"
}
```

---

## 체크리스트

Hook 작성 시 확인:

- [ ] 명확한 이름과 설명
- [ ] 구체적인 트리거 패턴
- [ ] 체계적인 프롬프트 구조
- [ ] 단계별 체크리스트
- [ ] 표준화된 리포트 형식
- [ ] 실행 가능한 피드백
- [ ] 우선순위 명시
- [ ] 자동 수정 코드 제공
- [ ] 학습 축적 메커니즘
- [ ] 테스트 및 검증

---

## 참고 자료

- `.kiro/hooks/task-completion-validator.kiro.hook` - 완벽한 Hook 예시
- `.kiro/hooks/README.md` - Hook 시스템 개요
- `.kiro/steering/compounding/` - Compounding Engineering 철학

---

**작성자**: Kiro AI Assistant  
**버전**: 2.0.0  
**최종 업데이트**: 2025-01-23
