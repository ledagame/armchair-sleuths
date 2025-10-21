# Flow-Based Design Template

This template is used when the user requests minimal modularization design with flow analysis.

## When to Use This Template

Use this template when user request includes:
- "최소한의 모듈화 설계"
- "다음 순서를 따라야한다"
- "1. 요구사항을 분석하여 자세한 user flow, data flow를 작성한다"
- "2. 코드베이스에서 관련 파일들을 탐색하여 convention, guideline 등을 파악한다"
- "3. 구현해야할 모듈 및 작업위치를 결정한다"

## Template Structure

The output must follow this **exact 3-step sequence**:

```markdown
# [Feature Name] 최소 모듈화 설계

## 1단계: 요구사항 분석 및 플로우 작성

### User Flow (사용자 관점 흐름)

**시작점:** [사용자가 무엇을 하려고 하는가?]

**단계:**
1. [사용자 액션 1]
   - UI: [어떤 화면/컴포넌트]
   - Input: [사용자 입력]
   - Output: [화면 변화]

2. [사용자 액션 2]
   - UI: [화면 전환 또는 변화]
   - Feedback: [사용자 피드백]

3. [사용자 액션 3]
   ...

**종료점:** [최종 상태/결과]

**Alternative Paths:**
- 시나리오 A: [대안 경로 1]
- 시나리오 B: [대안 경로 2]

**Error Paths:**
- 에러 케이스 1: [에러 발생 → 사용자에게 어떻게 표시?]
- 에러 케이스 2: ...

### Data Flow (데이터 흐름)

```
[Frontend Component]
        ↓ (user input data)
[Validation Layer]
        ↓ (validated data)
[API Call]
        ↓ (request payload)
[Backend Service]
        ↓ (business logic)
[Data Layer]
        ↓ (persistence)
[Response] → [Update UI]
```

**데이터 변환 과정:**
1. **Input Stage:**
   - Raw data: [형태]
   - Validation: [어떤 검증?]
   - Transformed: [변환 후 형태]

2. **Processing Stage:**
   - Received data: [백엔드 수신 형태]
   - Business logic: [어떤 처리?]
   - Prepared data: [처리 후 형태]

3. **Output Stage:**
   - Response data: [API 응답 형태]
   - Frontend transformation: [프론트엔드 변환]
   - Display data: [최종 표시 형태]

**Error Data Flow:**
- 에러 발생 지점 → 에러 객체 생성 → 상위 레이어 전파 → 사용자 표시

## 2단계: 코드베이스 탐색 및 컨벤션 파악

### 탐색 대상 파일

**관련 기능 탐색 (--c7 사용):**
```bash
# 유사한 기능 찾기
grep -r "[similar feature keyword]" src/

# 기존 패턴 찾기
find src/ -name "*[related pattern]*"
```

**발견한 파일들:**
- `path/to/similar-component.tsx` - [무엇을 참고할까?]
- `path/to/related-service.ts` - [어떤 패턴?]
- `path/to/api-routes.ts` - [라우팅 패턴?]

### 파악한 Convention

**Frontend Conventions:**
- 컴포넌트 구조: [패턴]
- State 관리: [어떤 방식? Redux/Context/etc]
- API 호출: [어떤 라이브러리? axios/fetch/etc]
- 에러 처리: [공통 패턴]
- 스타일링: [CSS modules/styled-components/etc]

**Backend Conventions:**
- 서비스 구조: [계층 구조]
- 에러 핸들링: [에러 클래스/코드]
- 데이터 검증: [검증 라이브러리]
- 로깅: [로깅 패턴]

**API Conventions:**
- 라우팅: [Express/Next API/etc]
- Request 형식: [REST/GraphQL]
- Response 형식: [JSON 구조]
- 에러 응답: [에러 포맷]

**Naming Conventions:**
- 파일명: [kebab-case/PascalCase]
- 함수명: [camelCase/snake_case]
- 컴포넌트명: [PascalCase]
- 상수명: [UPPER_SNAKE_CASE]

**Project Structure:**
```
src/
  ├── components/   [컴포넌트 위치]
  ├── services/     [비즈니스 로직]
  ├── api/          [API 라우트]
  ├── types/        [타입 정의]
  └── utils/        [유틸리티]
```

## 3단계: 모듈 및 작업 위치 결정

### 구현 필요 모듈

#### Frontend Modules

**Module 1: [Component Name]**
- **위치:** `src/components/[feature]/[ComponentName].tsx`
- **역할:** [무엇을 하는가?]
- **의존성:** [어떤 컴포넌트/훅 사용?]
- **Props:**
  ```typescript
  interface Props {
    // ...
  }
  ```

**Module 2: [Hook Name]**
- **위치:** `src/hooks/use[FeatureName].ts`
- **역할:** [상태 관리/API 호출/etc]
- **반환값:** [무엇을 반환?]

#### Backend Modules

**Module 3: [Service Name]**
- **위치:** `src/services/[ServiceName].ts`
- **역할:** [비즈니스 로직]
- **Public Methods:** [외부에서 호출할 메서드]

**Module 4: [Repository/Data Layer]**
- **위치:** `src/data/[RepositoryName].ts`
- **역할:** [데이터 접근]
- **Operations:** [CRUD 등]

#### API Modules

**Module 5: [API Route]**
- **위치:** `src/api/[route-name].ts`
- **엔드포인트:** `[METHOD] /api/[path]`
- **역할:** [요청 처리, 서비스 호출, 응답 반환]

### 작업 위치 매핑

**파일 생성 계획:**

1. **Frontend:**
   ```
   src/components/[feature]/
     ├── [MainComponent].tsx      [생성]
     ├── [SubComponent1].tsx      [생성]
     └── [SubComponent2].tsx      [생성]

   src/hooks/
     └── use[Feature].ts           [생성]

   src/types/
     └── [feature].types.ts        [생성]
   ```

2. **Backend:**
   ```
   src/services/
     └── [FeatureService].ts       [생성]

   src/data/
     └── [FeatureRepository].ts    [생성 또는 기존 수정]
   ```

3. **API:**
   ```
   src/api/
     └── [feature-routes].ts       [생성]
   ```

### 기존 파일 수정 계획

**수정 필요 파일:**
- `path/to/existing-file.ts` - [무엇을 수정? 왜?]
- `path/to/another-file.tsx` - [무엇을 추가?]

**수정하지 않는 파일 (영향 없음):**
- `path/to/unrelated-file.ts` - [이유]

### Integration Points (통합 지점)

**Frontend ↔ API:**
- 호출 지점: [ComponentName] → API endpoint
- 데이터 전달: [어떤 형식?]

**API ↔ Backend:**
- 호출 지점: API route → Service method
- 데이터 검증: [어디서? 어떻게?]

**Backend ↔ Data:**
- 호출 지점: Service → Repository
- 트랜잭션: [필요 여부]

### 최소 모듈화 원칙 적용

**모듈 수 최소화:**
- 필수 모듈만 생성 (총 [N]개)
- 공통 유틸은 기존 것 재사용
- 새로운 추상화 레이어 생성 안 함

**파일 수 최소화:**
- 관련 기능은 하나의 파일에
- 작은 컴포넌트는 같은 파일에
- 타입은 사용처와 가까운 곳에

**의존성 최소화:**
- 필요한 모듈만 의존
- Circular dependency 방지
- 계층 구조 단순하게

## 구현 작업 순서

1. **타입 정의** (가장 먼저)
   - `src/types/[feature].types.ts` 생성

2. **Data Layer** (아래부터 위로)
   - Repository/Data access 구현

3. **Backend Service**
   - 비즈니스 로직 구현

4. **API Routes**
   - 엔드포인트 생성 및 연결

5. **Frontend Hooks** (필요시)
   - API 호출 로직

6. **Frontend Components**
   - UI 구현

7. **통합 테스트**
   - End-to-end flow 검증
```

## Application Example

**User Request:**
```
다음 요구사항을 구현하기위한 최소한의 모듈화 설계 진행하라.
반드시 다음 순서를 따라야한다.
1. 요구사항을 분석하여 자세한 user flow, data flow를 작성한다
2. 코드베이스에서 관련 파일들을 탐색하여 convention, guideline 등을 파악한다.
3. 구현해야할 모듈 및 작업위치를 결정한다.

---
요구사항: 이미지 지연 로딩 기능
```

**Template Application:**

```markdown
# 이미지 지연 로딩 기능 최소 모듈화 설계

## 1단계: 요구사항 분석 및 플로우 작성

### User Flow

**시작점:** 사용자가 이미지가 포함된 페이지에 접근

**단계:**
1. 페이지 로드
   - UI: 이미지 플레이스홀더 (skeleton) 표시
   - Input: 없음
   - Output: 스켈레톤 UI

2. 이미지 요청 시작
   - UI: 스켈레톤 유지
   - Feedback: 로딩 인디케이터 (선택적)

3. 이미지 로드 완료
   - UI: 실제 이미지로 교체
   - Feedback: 부드러운 페이드인 애니메이션

**종료점:** 모든 이미지 표시 완료

**Error Paths:**
- 이미지 로딩 실패 → 기본 이미지 또는 에러 아이콘 표시

### Data Flow

```
[Component Mount]
        ↓
[Show Skeleton]
        ↓
[Trigger Image Load]
        ↓ (image URL)
[Fetch Image]
        ↓ (blob/data)
[Cache Image] (optional)
        ↓
[Update State: loaded=true]
        ↓
[Render Actual Image]
```

**Error Data Flow:**
```
[Image Fetch Fails]
        ↓
[Catch Error]
        ↓
[Update State: error=true]
        ↓
[Show Fallback Image]
```

## 2단계: 코드베이스 탐색 및 컨벤션 파악

### 발견한 파일들:
- `src/components/common/Skeleton.tsx` - 기존 스켈레톤 컴포넌트
- `src/hooks/useImageLoader.ts` - 유사한 이미지 관련 훅 발견
- `src/utils/imageUtils.ts` - 이미지 유틸리티 함수들

### 파악한 Convention:

**Frontend:**
- React 18 + TypeScript
- Functional components with hooks
- CSS Modules for styling
- Custom hooks in `src/hooks/`

**Naming:**
- Components: PascalCase (e.g., `ImageLoader.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `uselazyImage.ts`)
- Files: kebab-case for utilities, PascalCase for components

**Project Structure:**
```
src/
  ├── components/
  │   ├── common/  (공통 컴포넌트)
  │   └── features/ (기능별 컴포넌트)
  ├── hooks/
  └── utils/
```

## 3단계: 모듈 및 작업 위치 결정

### 구현 필요 모듈

#### Frontend Modules

**Module 1: LazyImage Component**
- **위치:** `src/components/common/LazyImage.tsx`
- **역할:** 지연 로딩되는 이미지 컴포넌트
- **Props:**
  ```typescript
  interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    fallback?: string;
  }
  ```

**Module 2: useLazyImage Hook**
- **위치:** `src/hooks/useLazyImage.ts`
- **역할:** 이미지 로딩 상태 관리
- **반환값:**
  ```typescript
  {
    loaded: boolean;
    error: boolean;
    ref: RefObject<HTMLImageElement>;
  }
  ```

### 작업 위치 매핑

**파일 생성:**
```
src/components/common/
  └── LazyImage.tsx           [생성]

src/hooks/
  └── useLazyImage.ts          [생성]
```

**기존 파일 수정:**
- 없음 (완전히 새로운 기능)

### Integration Points

**Component ↔ Hook:**
- LazyImage 컴포넌트가 useLazyImage 훅 사용
- 훅이 로딩 상태 관리

### 최소 모듈화 적용

**모듈 수:** 2개만 (컴포넌트 + 훅)
- ~~별도 Service layer 불필요~~ (프론트엔드만)
- ~~별도 API 불필요~~ (이미지 URL로 직접 로드)
- ~~별도 상태 관리 라이브러리 불필요~~ (로컬 state로 충분)

**기존 재사용:**
- Skeleton 컴포넌트 재사용 (이미 존재)
- CSS animations 재사용 (기존 유틸)

## 구현 작업 순서

1. **useLazyImage hook 구현**
   - Intersection Observer API 사용
   - 이미지 로드 상태 관리

2. **LazyImage component 구현**
   - Hook 사용하여 상태 관리
   - Skeleton → Image transition

3. **통합 테스트**
   - 실제 이미지로 테스트
   - 에러 케이스 테스트
```

## Key Differences from Modular Template

**Flow Template focuses on:**
1. **Flow-first:** Start with user/data flow before modules
2. **Codebase exploration:** Discover conventions from existing code
3. **Minimal modules:** Create only what's absolutely needed
4. **Location-specific:** Precise file paths and locations
5. **Work sequence:** Clear implementation order

**Modular Template focuses on:**
1. **Modules-first:** Start with business logic grouping
2. **Responsibility-first:** Define module responsibilities
3. **Appropriate granularity:** Not too fine, not too coarse
4. **Architecture:** Higher-level design patterns
5. **Use cases:** Detailed scenario coverage

## Usage Tips

**When to use Flow Template:**
- Feature is mostly frontend
- Need to understand existing patterns first
- Want minimal file creation
- Implementation path is unclear

**When to use Modular Template:**
- Feature spans multiple layers (Frontend/Backend/API)
- Complex business logic needs grouping
- Greenfield development
- Need architectural clarity

## Output Quality Checklist

- [ ] 1단계 완료: User flow + Data flow documented
- [ ] 2단계 완료: Codebase explored, conventions identified
- [ ] 3단계 완료: Modules and locations decided
- [ ] Work sequence provided
- [ ] Integration points identified
- [ ] Minimal modularization applied
- [ ] No unnecessary abstractions
- [ ] Follows discovered conventions
- [ ] Markdown format
- [ ] No code implementation (only interfaces)

---

**Use this template for minimal, flow-based designs that build on existing codebase patterns.**
