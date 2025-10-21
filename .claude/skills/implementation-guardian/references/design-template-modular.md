# Modular Design Template

This template is used when the user requests modular design with business logic grouping.

## When to Use This Template

Use this template when user request includes:
- "개발 설계 진행하라"
- "비즈니스 로직을 그룹화"
- "적절한 단위로 모듈화"
- "Over Engineering을 피해"
- "최소한의 복잡도"
- "개요, 세부 유스케이스, 주요 모듈 및 역할"

## Template Structure

The output must follow this exact structure:

```markdown
# [Feature Name] 개발 설계

## 개요 (Overview)

[2-3 문장으로 이 기능이 무엇을 하는지, 왜 필요한지 설명]

## 세부 유스케이스 (Detailed Use Cases)

### Use Case 1: [Name]
**Actor:** [사용자/시스템]
**Goal:** [목표]
**Flow:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Alternative Flows:**
- [Alternative scenario if any]

**Error Scenarios:**
- [Error case 1]
- [Error case 2]

### Use Case 2: [Name]
[Repeat structure]

## 주요 모듈 및 역할 (Key Modules and Roles)

### Module 1: [Module Name]

**책임 (Responsibility):**
- [Main responsibility 1]
- [Main responsibility 2]

**위치 (Location):**
- `path/to/module`

**주요 메서드/함수:**
- `functionName()`: [What it does]
- `anotherFunction()`: [What it does]

**의존성 (Dependencies):**
- Module X (for Y purpose)
- Module Z (for W purpose)

**인터페이스:**
```typescript
interface ModuleName {
  method1(param: Type): ReturnType;
  method2(param: Type): ReturnType;
}
```

### Module 2: [Module Name]
[Repeat structure]

## 모듈 간 상호작용 (Module Interactions)

```
[Module A] ---> [Module B]
     |              |
     v              v
[Module C] <--- [Module D]
```

설명:
- Module A calls Module B for [purpose]
- Module C depends on both A and D
- Data flows: A → B → D → C

## 데이터 흐름 (Data Flow)

1. User action triggers [Component/Controller]
2. [Component] validates input
3. [Component] calls [Service/Module]
4. [Service] processes business logic
5. [Service] calls [Data Layer/API]
6. Response flows back through layers
7. UI updates with result

## 에러 처리 전략 (Error Handling Strategy)

**Layer별 에러 처리:**

- **Frontend Layer:**
  - Input validation errors
  - Network errors
  - Display user-friendly messages

- **Backend Layer:**
  - Business rule violations
  - Data validation errors
  - Propagate to frontend with error codes

- **Data Layer:**
  - Database errors
  - Connection errors
  - Retry logic where appropriate

## 구현 고려사항 (Implementation Considerations)

**Avoid Over-Engineering:**
- [What NOT to do]
- [Keep it simple by...]

**Minimal Complexity:**
- Use existing patterns where possible
- Don't create new abstractions unless needed
- YAGNI (You Aren't Gonna Need It)

**Testing Strategy:**
- Unit test each module independently
- Integration test module interactions
- E2E test critical user flows
```

## Design Principles

When applying this template, follow these principles:

### 1. Business Logic Grouping

Group related business logic together:

**Good:**
```
UserManagementModule:
- createUser()
- updateUser()
- deleteUser()
- validateUser()
```

**Bad:**
```
UserService:
- createUser()

UserValidator:
- validateUser()

UserUpdater:
- updateUser()
```

Reason: Related operations belong together.

### 2. Appropriate Modularization

Modularize at the right level:

**Good:**
```
AuthenticationModule:
- login()
- logout()
- refreshToken()
- validateSession()
```

**Bad (too granular):**
```
LoginModule:
- login()

LogoutModule:
- logout()

TokenModule:
- refreshToken()

SessionModule:
- validateSession()
```

**Bad (too coarse):**
```
UserModule:
- login()
- logout()
- createUser()
- updateUser()
- sendEmail()
- generateReport()
```

### 3. Avoid Over-Engineering

**Symptoms of over-engineering:**
- Creating abstractions "for future flexibility"
- Implementing patterns not currently needed
- Complex architecture for simple requirements
- Multiple layers when one would suffice

**How to avoid:**
- Implement only what's needed now
- Refactor when you have concrete need
- KISS (Keep It Simple, Stupid)
- YAGNI (You Aren't Gonna Need It)

**Example:**

**Over-engineered:**
```typescript
// Abstract factory for creating validators
interface ValidatorFactory {
  create(type: string): Validator;
}

// Strategy pattern for validation
interface ValidationStrategy {
  validate(data: any): boolean;
}

// Complex builder pattern
class UserBuilder {
  private user: Partial<User> = {};

  setName(name: string): UserBuilder { ... }
  setEmail(email: string): UserBuilder { ... }
  build(): User { ... }
}
```

**Simple and sufficient:**
```typescript
// Direct validation function
function validateUser(user: User): boolean {
  return isValidEmail(user.email) &&
         isValidName(user.name);
}

// Simple object creation
function createUser(name: string, email: string): User {
  return { name, email };
}
```

### 4. Minimal Complexity

**Keep code simple:**
- Prefer simple solutions over clever ones
- Use language features when they make code clearer
- Avoid unnecessary abstractions
- Direct is better than indirect

**Complexity checklist:**
- Can a junior developer understand this?
- Is this the simplest solution that works?
- Are we adding complexity for a real need?
- Can we reduce indirection?

## Output Format

**IMPORTANT:**
- Output in Markdown format
- **NO CODE IMPLEMENTATION** (interfaces and type signatures OK)
- Focus on design and architecture
- Explain responsibilities and interactions
- Include diagrams using text/ASCII art if helpful

## Example Application

**User Request:**
```
다음 요구사항을 구현하기위한 개발 설계 진행하라.
- 비즈니스 로직을 그룹화하고, 적절한 단위로 모듈화하라.
  Over Engineering을 피해 최소한의 복잡도와 코드로 구현해야한다.
- 개요, 세부 유스케이스, 주요 모듈 및 역할을 포함하여 응답하라.
- 구체적인 코드는 포함하지 않는다. 마크다운으로 응답하라.

---
요구사항: 케이스 자동 생성 기능
```

**Template Application:**

```markdown
# 케이스 자동 생성 기능 개발 설계

## 개요

케이스 자동 생성 기능은 미리 정의된 템플릿과 AI를 활용하여
추리 게임 케이스를 자동으로 생성하는 기능입니다.
사용자가 매번 수동으로 케이스를 작성하는 번거로움을 제거하고,
다양한 케이스를 빠르게 생성할 수 있게 합니다.

## 세부 유스케이스

### Use Case 1: 템플릿 기반 케이스 생성

**Actor:** 사용자 (게임 진행자)

**Goal:** 템플릿을 선택하여 새로운 케이스 생성

**Flow:**
1. 사용자가 "케이스 생성" 버튼 클릭
2. 시스템이 사용 가능한 템플릿 목록 표시
3. 사용자가 템플릿 선택
4. 시스템이 템플릿 기반으로 케이스 초안 생성
5. 사용자가 생성된 케이스 검토 및 수정
6. 사용자가 케이스 확정 및 발행

**Alternative Flows:**
- 3-1. 사용자가 템플릿 없이 빈 케이스로 시작 선택

**Error Scenarios:**
- 템플릿 로딩 실패 → 에러 메시지 표시, 재시도 옵션
- 케이스 생성 실패 → 임시 저장, 나중에 재시도

### Use Case 2: AI 기반 케이스 생성

**Actor:** 사용자

**Goal:** AI를 활용하여 완전히 새로운 케이스 생성

**Flow:**
1. 사용자가 "AI 케이스 생성" 선택
2. 시스템이 케이스 파라미터 입력 폼 표시 (장르, 난이도 등)
3. 사용자가 파라미터 입력
4. 시스템이 AI API 호출하여 케이스 생성
5. 시스템이 생성된 케이스 표시
6. 사용자가 재생성 또는 확정 선택

**Error Scenarios:**
- AI API 호출 실패 → 템플릿 기반 생성으로 폴백
- 생성 시간 초과 → 진행 상태 표시, 백그라운드 처리

## 주요 모듈 및 역할

### Module 1: CaseGeneratorService

**책임:**
- 케이스 생성 로직 조율
- 템플릿 관리
- AI 통합

**위치:**
- `src/services/CaseGeneratorService.ts`

**주요 메서드:**
- `generateFromTemplate(templateId: string): Case`
- `generateWithAI(params: GenerationParams): Case`
- `getAvailableTemplates(): Template[]`

**의존성:**
- TemplateRepository (템플릿 데이터 접근)
- AIService (AI 케이스 생성)
- CaseValidator (생성된 케이스 검증)

### Module 2: TemplateRepository

**책임:**
- 템플릿 데이터 관리
- 템플릿 CRUD 작업

**위치:**
- `src/data/TemplateRepository.ts`

**주요 메서드:**
- `findById(id: string): Template`
- `findAll(): Template[]`
- `save(template: Template): void`

**의존성:**
- Database/Storage layer

### Module 3: AIService

**책임:**
- AI API 통신
- 프롬프트 관리
- 응답 파싱

**위치:**
- `src/services/AIService.ts`

**주요 메서드:**
- `generateCase(prompt: string): AIResponse`
- `parseResponse(response: AIResponse): Case`

**의존성:**
- HTTP client
- Prompt templates

### Module 4: CaseValidator

**책임:**
- 생성된 케이스 유효성 검증
- 필수 필드 확인
- 논리적 일관성 검사

**위치:**
- `src/validators/CaseValidator.ts`

**주요 메서드:**
- `validate(case: Case): ValidationResult`
- `checkCompleteness(case: Case): boolean`

## 모듈 간 상호작용

```
User Input
    ↓
[CaseGeneratorUI]
    ↓
[CaseGeneratorService] ←→ [TemplateRepository]
    ↓                           ↓
[AIService]                [Database]
    ↓
[CaseValidator]
    ↓
Generated Case → User
```

## 데이터 흐름

1. 사용자가 UI에서 생성 요청
2. CaseGeneratorUI가 파라미터 수집
3. CaseGeneratorService가 요청 받음
4. 템플릿 기반이면:
   - TemplateRepository에서 템플릿 로드
   - 템플릿에 데이터 채움
5. AI 기반이면:
   - AIService에 프롬프트 전달
   - AI 응답 파싱
6. CaseValidator로 검증
7. 검증 통과 시 케이스 반환
8. UI가 케이스 표시

## 에러 처리 전략

**Frontend Layer:**
- 입력 검증 (파라미터 유효성)
- 네트워크 에러 처리
- 로딩 상태 표시
- 사용자 친화적 에러 메시지

**Backend Layer:**
- 템플릿 없음 에러
- AI API 호출 실패 → 재시도 로직
- 검증 실패 → 구체적 에러 반환

**Data Layer:**
- 템플릿 로딩 실패 → 캐시 사용
- 저장 실패 → 임시 저장

## 구현 고려사항

**Avoid Over-Engineering:**
- 초기에는 1-2개 템플릿만 지원 (확장은 필요시)
- AI 통합은 단순한 프롬프트/응답 (복잡한 체인 불필요)
- 검증은 필수 필드만 (과도한 규칙 X)

**Minimal Complexity:**
- TemplateRepository는 간단한 JSON 파일로 시작
- AI Service는 단일 API 호출
- 복잡한 상태 관리 피하기
```

This output follows the template structure, groups business logic appropriately,
avoids over-engineering, maintains minimal complexity, and provides clear module
responsibilities without code implementation.

## Quality Checklist

Before delivering design, verify:

- [ ] 개요 section exists and is clear
- [ ] 세부 유스케이스 covers main scenarios
- [ ] 주요 모듈 clearly defines responsibilities
- [ ] Module interactions are explained
- [ ] Data flow is documented
- [ ] Error handling strategy is included
- [ ] Over-engineering is avoided
- [ ] Complexity is minimal
- [ ] No code implementation (only interfaces/signatures)
- [ ] Output is in Markdown format
- [ ] Follows project conventions

## Anti-Patterns to Avoid

**Anti-pattern 1: Too many modules**
Don't split every function into a separate module.

**Anti-pattern 2: Abstract for "future"**
Don't create abstractions for hypothetical future requirements.

**Anti-pattern 3: Multiple inheritance layers**
Keep inheritance shallow (1-2 levels max).

**Anti-pattern 4: God objects**
Don't put too many responsibilities in one module.

**Anti-pattern 5: Premature optimization**
Design for clarity first, optimize later if needed.

---

**Use this template to create clear, modular, minimal-complexity designs that follow business logic grouping principles.**
