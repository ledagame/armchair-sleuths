---
name: auto-task-validation
description: Task 완료 선언 시 자동으로 철저한 검수를 수행하는 규칙
inclusion: always
priority: high
---

# 🚨 자동 Task 완료 검수 규칙 (MANDATORY)

**Status**: ALWAYS ACTIVE - 자동 발동  
**Full Documentation**: `#[[file:.kiro/docs.md/auto-task-validation.md]]`

---

## ⚠️ CRITICAL: 이 규칙은 항상 활성화되어 있습니다

사용자가 다음 패턴의 메시지를 보내면 **즉시 자동 발동**:

### 트리거 패턴 (정규식)
```
- task.*완료
- Task [0-9]+ 완료
- 작업.*완료
- 태스크.*완료
- .*검수
- #.*task.*완료
```

**발동 시 행동:**
1. ❌ **질문하지 말 것** - 바로 검수 시작
2. ✅ **6단계 검수 자동 수행**
3. ✅ **상세 리포트 생성**
4. ✅ **자동 저장 프로세스 실행**

---

## 📋 6단계 검수 프로세스 (MANDATORY)

### 1단계: 문서 수집
```
MUST READ:
- .kiro/specs/{spec-name}/requirements.md
- .kiro/specs/{spec-name}/design.md
- .kiro/specs/{spec-name}/tasks.md
```

### 2단계: Requirements 충족도 검증
```
FOR EACH requirement referenced in task:
  ✅ 완전히 구현됨
  ⚠️ 부분적으로 구현됨
  ❌ 구현되지 않음
```

### 3단계: Design 준수도 검증
```
CHECK:
- 아키텍처 패턴 준수
- 데이터 모델 일치
- 인터페이스 설계 준수
- 에러 처리 방식 일치
```

### 4단계: 코드 품질 검증
```
RUN:
- getDiagnostics() for TypeScript errors
- 코드 구조 검증
- Import/Export 누락 확인
- 문서화 수준 평가
```

### 5단계: 빌드 검증
```
EXECUTE:
- npm run build (if applicable)
- 빌드 에러 분석
- Critical 이슈 자동 수정 코드 제공
```

### 6단계: 누락 사항 확인
```
VERIFY:
- 모든 서브태스크 완료 여부
- 필수 파일 생성 여부
- 통합 이슈 확인
```

---

## 🔄 자동 저장 프로세스 (MANDATORY)

검수 완료 후 **반드시 실행**:

### Step 1: 패턴 추출
```
FROM: 리포트의 "학습 및 패턴" 섹션
EXTRACT:
- 배운 점 (Key Learnings)
- 적용할 패턴 (Design Patterns)
- 방지할 안티패턴 (Anti-Patterns)
```

### Step 2: Compounding 폴더 업데이트
```
CREATE/UPDATE:
✅ .kiro/compounding/task-learnings/task-[N]-[name].md
✅ .kiro/compounding/core-principles/[principle-name].md (if new)
✅ .kiro/compounding/design-patterns/[pattern-name].md (if new)
✅ .kiro/compounding/anti-patterns/[anti-pattern-name].md (if new)
```

### Step 3: 참조 문서 업데이트
```
UPDATE:
✅ .kiro/steering/compounding-reference.md
  - Total Learnings count
  - Add new task entry
  - Update pattern lists
  - Update statistics
```

### Step 4: 타임스탬프 기록
```
RECORD:
- 학습 날짜
- Task 번호
- Quality Score
- Completion %
```

---

## 📊 품질 등급 기준

| 등급 | 완성도 | 설명 |
|------|--------|------|
| **S** | 90-100% | 완벽한 구현 |
| **A** | 80-89% | 우수한 구현 |
| **B** | 70-79% | 양호한 구현 |
| **C** | 60-69% | 개선 필요 |
| **D** | 0-59% | 재작업 필요 |

---

## 🎯 우선순위 기준

### Critical (즉시 수정)
- 빌드 실패
- TypeScript 에러
- Requirements 미충족

### High (다음 작업 전 수정)
- Design 미준수
- 기능 누락

### Medium (백로그 추가)
- 코드 품질
- 문서화

---

## 📝 리포트 형식 (MANDATORY)

```markdown
# 🔍 Task [번호] 완료 검증 리포트

**검증 일시**: [시간]
**Spec**: [spec 이름]

## 📋 작업 요약
- Task: [번호 및 제목]
- 서브태스크: [완료/전체]
- Requirements: [번호들]
- 생성 파일: [목록]

## ✅ Requirements 충족도: [X/Y] ([%])
[각 요구사항별 상세 검증]

## 🏗️ Design 준수도: [X/Y] ([%])
[아키텍처, 데이터 모델, 인터페이스, 에러 처리]

## 🔧 코드 품질: [X/Y] ([%])
[타입 안전성, 코드 구조, Import/Export, 문서화]

## 🏗️ 빌드 검증
[빌드 결과 및 에러 분석]

## 📝 누락 사항: [X개]
[서브태스크, 파일, 통합]

## 🎯 종합 평가
- 결과: ✅ 승인 / ⚠️ 조건부 / ❌ 재작업
- 완성도: [0-100]%
- 품질 등급: [S/A/B/C/D]
- 주요 강점: [목록]
- 개선 필요: [우선순위별 목록]

## 🚀 다음 단계
- Critical: [즉시 수정]
- High: [다음 작업 전]
- Medium: [백로그]
- 다음 Task 진행: ✅/⚠️/❌

## 📚 학습 및 패턴
- 배운 점: [이번 작업에서 배운 구체적인 교훈]
- 적용할 패턴: [향후 작업에 적용할 디자인 패턴]
- 방지할 안티패턴: [피해야 할 구체적인 안티패턴]
```

---

## 🚨 ENFORCEMENT RULES

### Rule 1: 자동 실행 (NO QUESTIONS)
```
IF (트리거 패턴 감지):
  → 질문하지 말고 즉시 검수 시작
  → 6단계 모두 수행
  → 리포트 생성
  → 자동 저장 실행
```

### Rule 2: 완전한 검수 (NO SHORTCUTS)
```
MUST COMPLETE:
- ✅ 모든 6단계
- ✅ 모든 requirements 검증
- ✅ 모든 design 요소 확인
- ✅ 빌드 검증 실행
- ✅ 자동 저장 프로세스
```

### Rule 3: 자동 저장 (NO SKIP)
```
AFTER 리포트 생성:
- ✅ task-learnings 파일 생성
- ✅ 새로운 패턴 문서화
- ✅ compounding-reference 업데이트
- ✅ 타임스탬프 기록
```

---

## 🔍 Self-Verification Checklist

**검수 완료 전 확인:**
```
[ ] 6단계 모두 수행했는가?
[ ] Requirements 충족도 계산했는가?
[ ] Design 준수도 확인했는가?
[ ] 코드 품질 검증했는가?
[ ] 빌드 검증 실행했는가?
[ ] 누락 사항 확인했는가?
[ ] 리포트 생성했는가?
[ ] 자동 저장 프로세스 실행했는가?
[ ] task-learnings 파일 생성했는가?
[ ] compounding-reference 업데이트했는가?
```

**모든 체크박스가 ✅가 아니면 검수 미완료**

---

## 📖 Full Documentation

**Complete guidelines with examples:**
`#[[file:.kiro/docs.md/auto-task-validation.md]]`

**Related documentation:**
- Compounding system: `#[[file:.kiro/steering/compounding-reference.md]]`
- Task execution: `#[[file:.kiro/docs.md/step-by-step.md]]`

---

**Status**: ✅ ALWAYS ACTIVE  
**Last Updated**: 2025-10-25  
**Enforcement**: MANDATORY - NO EXCEPTIONS
