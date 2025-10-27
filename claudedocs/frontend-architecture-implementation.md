# Frontend Architecture Implementation Guide

**프로젝트**: Armchair Sleuths
**목표**: 비즈니스 로직과 프레젠테이션 완전 분리, 타입 안전성 확보
**작성일**: 2025-01-15
**상태**: ✅ Phase 1-3 완료, Phase 4 예시 제공

---

## 📋 목차

1. [개요](#개요)
2. [아키텍처 구조](#아키텍처-구조)
3. [구현된 파일 목록](#구현된-파일-목록)
4. [사용 가이드](#사용-가이드)
5. [마이그레이션 가이드](#마이그레이션-가이드)
6. [테스트 가이드](#테스트-가이드)
7. [트러블슈팅](#트러블슈팅)

---

## 개요

### 문제점

기존 클라이언트 아키텍처의 문제:

1. ❌ **타입 안전성 부족**: `window.__POST_DATA__` 타입이 각 파일에 분산
2. ❌ **API 엔드포인트 하드코딩**: '/api/case/today', '/api/case/generate' 등
3. ❌ **상태 관리 분산**: App.tsx에서 useState로 전역 상태 관리
4. ❌ **fetch 직접 사용**: Repository Pattern 없음
5. ❌ **프레젠테이션/로직 혼재**: 컴포넌트에서 직접 API 호출 가능

### 해결 방안

✅ **타입 안전 통신 인터페이스**
- DevvitMessages.ts: 양방향 메시지 타입 정의
- DevvitMessenger.ts: 타입 안전 통신 유틸리티

✅ **API 엔드포인트 중앙화**
- API_ENDPOINTS.ts: 모든 엔드포인트 상수화

✅ **Repository Pattern 도입**
- GameAPI 인터페이스: 추상화된 API 계약
- HTTPGameAPIClient: 실제 HTTP 구현
- MockGameAPIClient: 테스트용 Mock 구현

✅ **상태 관리 개선**
- gameStore.ts: Context API 기반 전역 상태 관리
- GameAPIContext: GameAPI 의존성 주입

---

## 아키텍처 구조

```
src/
├── shared/
│   ├── types/
│   │   └── DevvitMessages.ts          # ✨ NEW: Devvit ↔ WebView 메시지 타입
│   └── api/
│       └── endpoints.ts                # ✨ NEW: API 엔드포인트 중앙화
│
└── client/
    ├── api/
    │   ├── GameAPI.ts                  # ✨ NEW: API 인터페이스
    │   ├── HTTPGameAPIClient.ts        # ✨ NEW: HTTP 구현체
    │   └── MockGameAPIClient.ts        # ✨ NEW: Mock 구현체
    │
    ├── utils/
    │   └── DevvitMessenger.ts          # ✨ NEW: Devvit 통신 유틸리티
    │
    ├── store/
    │   └── gameStore.ts                # ✨ NEW: 전역 상태 관리
    │
    ├── contexts/
    │   └── GameAPIContext.tsx          # ✨ NEW: API 의존성 주입
    │
    └── hooks/
        ├── useCase.ts                  # 기존 파일 (리팩토링 대상)
        └── useCase.refactored.example.ts  # ✨ NEW: 리팩토링 예시
```

---

## 구현된 파일 목록

### Phase 1: 타입 안전 통신 인터페이스

#### 1. DevvitMessages.ts
**위치**: `src/shared/types/DevvitMessages.ts`

**역할**:
- Devvit ↔ WebView 양방향 메시지 타입 정의
- `window.__POST_DATA__` 인터페이스 정의

**주요 타입**:
```typescript
// Devvit → WebView
export type DevvitToWebViewMessage =
  | InitGameMessage
  | UpdateStateMessage
  | NavigateMessage;

// WebView → Devvit
export type WebViewToDevvitMessage =
  | ReadyMessage
  | StateChangedMessage
  | ErrorMessage
  | GameCompleteMessage;

// PostData
export interface DevvitPostData {
  gameState?: string;
  score?: number;
  caseId?: string;
  userId?: string;
}
```

#### 2. DevvitMessenger.ts
**위치**: `src/client/utils/DevvitMessenger.ts`

**역할**:
- 타입 안전 Devvit 통신 유틸리티
- 메시지 송수신 및 PostData 접근

**주요 메서드**:
```typescript
DevvitMessenger.send(message: WebViewToDevvitMessage): void
DevvitMessenger.listen(callback: (msg) => void): () => void
DevvitMessenger.getPostData(): DevvitPostData | undefined
DevvitMessenger.notifyReady(): void
DevvitMessenger.notifyGameComplete(caseId, score): void
```

**사용 예시**:
```typescript
// PostData 가져오기
const postData = DevvitMessenger.getPostData();
const caseId = postData?.caseId;

// Devvit에게 메시지 전송
DevvitMessenger.notifyGameComplete('case-123', 85);

// Devvit 메시지 수신
DevvitMessenger.listen((message) => {
  if (message.type === 'NAVIGATE') {
    navigateToScreen(message.payload.to);
  }
});
```

#### 3. API_ENDPOINTS.ts
**위치**: `src/shared/api/endpoints.ts`

**역할**:
- 모든 API 엔드포인트 중앙화
- 타입 안전 엔드포인트 상수

**주요 엔드포인트**:
```typescript
export const API_ENDPOINTS = {
  // Case Management
  CASE_TODAY: '/api/case/today',
  CASE_BY_ID: (caseId: string) => `/api/case/${caseId}`,
  CASE_GENERATE: '/api/case/generate',
  CASE_IMAGE_STATUS: (caseId: string) => `/api/case/${caseId}/image-status`,

  // Suspect Management
  SUSPECT_ASK: (suspectId: string) => `/api/chat/${suspectId}`,
  SUSPECT_CONVERSATION: (suspectId, userId) => `/api/conversation/${suspectId}/${userId}`,

  // Evidence Discovery
  LOCATION_SEARCH: '/api/location/search',

  // Submission
  SUBMIT_ANSWER: '/api/submit',

  // Player State
  PLAYER_STATE: (caseId, userId) => `/api/player-state/${caseId}/${userId}`,
} as const;
```

---

### Phase 2: Repository Pattern

#### 4. GameAPI.ts
**위치**: `src/client/api/GameAPI.ts`

**역할**:
- 게임 API 인터페이스 정의
- APIError 클래스 정의

**주요 메서드**:
```typescript
export interface GameAPI {
  // Case Management
  getCaseToday(): Promise<CaseData>;
  getCaseById(caseId: string): Promise<CaseData>;
  generateCase(): Promise<{ caseId: string }>;
  getImageStatus(caseId: string): Promise<ImageGenerationStatusResponse>;

  // Suspect Management
  askSuspect(suspectId, message, userId, caseId, conversationId?): Promise<InterrogationResponse>;
  getConversation(suspectId, userId): Promise<{ messages: ChatMessage[] }>;

  // Evidence Discovery
  searchLocation(request: SearchLocationRequest): Promise<SearchLocationResponse>;

  // Submission
  submitAnswer(userId, caseId, answers: W4HAnswer): Promise<ScoringResult>;

  // Player State
  getPlayerState(caseId, userId): Promise<APStatusResponse>;
}
```

#### 5. HTTPGameAPIClient.ts
**위치**: `src/client/api/HTTPGameAPIClient.ts`

**역할**:
- GameAPI 인터페이스의 HTTP 구현체
- fetch API를 사용하여 실제 백엔드와 통신

**특징**:
- 타입 안전 응답 처리
- 일관된 에러 처리 (APIError)
- API_ENDPOINTS 사용

**사용 예시**:
```typescript
const api = new HTTPGameAPIClient();
const caseData = await api.getCaseToday();
```

#### 6. MockGameAPIClient.ts
**위치**: `src/client/api/MockGameAPIClient.ts`

**역할**:
- GameAPI 인터페이스의 Mock 구현체
- 테스트용 하드코딩된 데이터 반환

**특징**:
- 응답 지연 시뮬레이션
- 에러 시뮬레이션 지원

**사용 예시**:
```typescript
// 정상 동작
const mockAPI = new MockGameAPIClient(100); // 100ms 지연

// 에러 시뮬레이션
const failingAPI = new MockGameAPIClient(100, true);
```

---

### Phase 3: 상태 관리

#### 7. gameStore.ts
**위치**: `src/client/store/gameStore.ts`

**역할**:
- Context API 기반 전역 상태 관리
- localStorage와 자동 동기화

**관리 대상**:
```typescript
export interface GameStoreState {
  currentScreen: GameScreen;
  userId: string;
  caseId: string | null;
}
```

**사용 예시**:
```typescript
// App.tsx에서 Provider 설정
<GameStoreProvider>
  <App />
</GameStoreProvider>

// 컴포넌트에서 사용
const { currentScreen, setCurrentScreen } = useGameStore();
setCurrentScreen('investigation');

// 또는 Selector Hooks 사용
const [currentScreen, setCurrentScreen] = useCurrentScreen();
```

#### 8. GameAPIContext.tsx
**위치**: `src/client/contexts/GameAPIContext.tsx`

**역할**:
- GameAPI 인스턴스를 Context로 제공
- 의존성 주입(Dependency Injection) 패턴

**사용 예시**:
```typescript
// App.tsx에서 Provider 설정
<GameAPIProvider>
  <App />
</GameAPIProvider>

// 테스트 환경에서 Mock 사용
<GameAPIProvider useMock>
  <TestComponent />
</GameAPIProvider>

// 컴포넌트에서 사용
const api = useGameAPI();
const caseData = await api.getCaseToday();

// 또는 특화된 Hook 사용
const { getCaseToday, generateCase } = useCaseAPI();
```

---

### Phase 4: Hook 리팩토링 예시

#### 9. useCase.refactored.example.ts
**위치**: `src/client/hooks/useCase.refactored.example.ts`

**역할**:
- useCase Hook의 리팩토링된 버전 예시
- 마이그레이션 가이드 포함

**주요 변경 사항**:
```typescript
// ❌ Before: fetch 직접 호출
const response = await fetch('/api/case/today');
const data = await response.json();

// ✅ After: useGameAPI 사용
const api = useGameAPI();
const data = await api.getCaseToday();

// ❌ Before: window.__POST_DATA__ 직접 접근
const postData = window.__POST_DATA__;
const caseId = postData?.caseId;

// ✅ After: DevvitMessenger 사용
const postData = DevvitMessenger.getPostData();
const caseId = postData?.caseId;
```

---

## 사용 가이드

### 1. Provider 설정 (App.tsx)

기존 App.tsx를 다음과 같이 래핑합니다:

```typescript
// App.tsx
import { GameStoreProvider } from './store/gameStore';
import { GameAPIProvider } from './contexts/GameAPIContext';

export function App() {
  return (
    <GameStoreProvider>
      <GameAPIProvider>
        {/* 기존 앱 컴포넌트 */}
      </GameAPIProvider>
    </GameStoreProvider>
  );
}
```

### 2. Hook에서 API 사용

기존 훅을 다음과 같이 리팩토링합니다:

```typescript
// useCase.ts
import { useGameAPI } from '../contexts/GameAPIContext';

export function useCase() {
  const api = useGameAPI();

  const fetchCase = async () => {
    const data = await api.getCaseToday();
    setCaseData(data);
  };

  // ...
}
```

### 3. Devvit 통신

```typescript
// PostData 가져오기
const postData = DevvitMessenger.getPostData();

// Devvit에게 메시지 전송
DevvitMessenger.notifyGameComplete(caseId, score);

// Devvit 메시지 수신
useEffect(() => {
  const unsubscribe = DevvitMessenger.listen((message) => {
    if (message.type === 'NAVIGATE') {
      setCurrentScreen(message.payload.to);
    }
  });

  return unsubscribe;
}, []);
```

### 4. 전역 상태 사용

```typescript
// 전체 store 사용
const store = useGameStore();
store.setCurrentScreen('investigation');

// Selector Hook 사용 (최적화)
const [currentScreen, setCurrentScreen] = useCurrentScreen();
const [userId, setUserId] = useUserId();
const [caseId, setCaseId] = useCaseId();
```

---

## 마이그레이션 가이드

### Step 1: Provider 설정

**파일**: `src/client/App.tsx`

```typescript
// 임포트 추가
import { GameStoreProvider } from './store/gameStore';
import { GameAPIProvider } from './contexts/GameAPIContext';

// App 컴포넌트를 Provider로 래핑
export const App = () => {
  return (
    <GameStoreProvider>
      <GameAPIProvider>
        {/* 기존 코드 */}
      </GameAPIProvider>
    </GameStoreProvider>
  );
};
```

### Step 2: useCase Hook 마이그레이션

**파일**: `src/client/hooks/useCase.ts`

1. **임포트 변경**:
```typescript
// 추가
import { useGameAPI } from '../contexts/GameAPIContext';
import { DevvitMessenger } from '../utils/DevvitMessenger';
import { APIError } from '../api/GameAPI';

// 제거 (더 이상 필요 없음)
// declare global { interface Window { __POST_DATA__?: DevvitPostData; } }
```

2. **API 인스턴스 가져오기**:
```typescript
export function useCase(): UseCaseReturn {
  const api = useGameAPI(); // 추가
  // ...
}
```

3. **fetch 호출을 API 호출로 변경**:
```typescript
// ❌ Before
const response = await fetch('/api/case/today');
if (!response.ok) throw new Error('Failed to fetch');
const data = await response.json();

// ✅ After
const data = await api.getCaseToday();
```

4. **PostData 접근 변경**:
```typescript
// ❌ Before
const postData = window.__POST_DATA__;

// ✅ After
const postData = DevvitMessenger.getPostData();
```

5. **에러 처리 개선**:
```typescript
// ❌ Before
catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  setError(errorMessage);
}

// ✅ After
catch (err) {
  const errorMessage = err instanceof APIError ? err.message : 'Unknown error';
  setError(errorMessage);
  console.error('[useCase] Error:', err);
}
```

### Step 3: 다른 훅들 마이그레이션

동일한 패턴으로 다음 훅들을 마이그레이션:

- `useChat.ts`
- `useSubmission.ts`
- `useEvidenceDiscovery.ts`
- `useSuspect.ts`

**마이그레이션 체크리스트**:
- [ ] `useGameAPI()` 임포트
- [ ] `DevvitMessenger` 임포트 (필요 시)
- [ ] `APIError` 임포트
- [ ] fetch 호출 → api.* 호출
- [ ] `window.__POST_DATA__` → `DevvitMessenger.getPostData()`
- [ ] 에러 처리를 `APIError`로 변경
- [ ] 타입 체크 통과
- [ ] 테스트 실행

### Step 4: 검증

1. **타입 체크**:
```bash
npm run type-check
```

2. **빌드 테스트**:
```bash
npm run build
```

3. **실행 테스트**:
```bash
npm run dev
```

---

## 테스트 가이드

### Unit Test (Mock API 사용)

```typescript
import { render, waitFor } from '@testing-library/react';
import { GameAPIProvider } from '../contexts/GameAPIContext';
import { MockGameAPIClient } from '../api/MockGameAPIClient';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should load case data', async () => {
    const mockAPI = new MockGameAPIClient();

    const { getByText } = render(
      <GameAPIProvider api={mockAPI}>
        <MyComponent />
      </GameAPIProvider>
    );

    await waitFor(() => {
      expect(getByText('mock-case-001')).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    const failingAPI = new MockGameAPIClient(100, true);

    const { getByText } = render(
      <GameAPIProvider api={failingAPI}>
        <MyComponent />
      </GameAPIProvider>
    );

    await waitFor(() => {
      expect(getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### Integration Test (실제 API 사용)

```typescript
import { render } from '@testing-library/react';
import { GameAPIProvider } from '../contexts/GameAPIContext';
import { MyComponent } from './MyComponent';

describe('MyComponent Integration', () => {
  it('should work with real API', async () => {
    const { getByText } = render(
      <GameAPIProvider baseUrl="http://localhost:3000">
        <MyComponent />
      </GameAPIProvider>
    );

    // 실제 API 호출 테스트
  });
});
```

---

## 트러블슈팅

### 1. "useGameAPI must be used within GameAPIProvider"

**원인**: GameAPIProvider 없이 useGameAPI() 호출

**해결**:
```typescript
// App.tsx에 Provider 추가
<GameAPIProvider>
  <App />
</GameAPIProvider>
```

### 2. "useGameStore must be used within GameStoreProvider"

**원인**: GameStoreProvider 없이 useGameStore() 호출

**해결**:
```typescript
// App.tsx에 Provider 추가
<GameStoreProvider>
  <App />
</GameStoreProvider>
```

### 3. API 호출 시 404 에러

**원인**: 잘못된 엔드포인트 또는 백엔드 미실행

**확인 사항**:
1. API_ENDPOINTS.ts에서 엔드포인트 확인
2. 백엔드 서버 실행 상태 확인
3. 네트워크 탭에서 실제 요청 URL 확인

### 4. TypeScript 에러: "Property 'api' does not exist"

**원인**: GameAPI 임포트 누락

**해결**:
```typescript
import { useGameAPI } from '../contexts/GameAPIContext';
```

### 5. PostData가 undefined

**원인**: Devvit 환경이 아님 또는 초기화 전 호출

**확인**:
```typescript
const postData = DevvitMessenger.getPostData();
if (!postData) {
  console.warn('Not in Devvit environment or PostData not set');
}
```

---

## 다음 단계

### Immediate (즉시)
- [ ] App.tsx에 Provider 추가
- [ ] useCase.ts 리팩토링
- [ ] 빌드 및 테스트

### Short-term (단기)
- [ ] 나머지 Hook 리팩토링 (useChat, useSubmission 등)
- [ ] 컴포넌트에서 직접 fetch 호출 제거
- [ ] 전역 상태를 gameStore로 이동

### Long-term (장기)
- [ ] Zustand 도입 고려 (더 강력한 상태 관리)
- [ ] React Query 도입 고려 (서버 상태 캐싱)
- [ ] E2E 테스트 추가

---

## 참고 자료

### 생성된 파일
1. `src/shared/types/DevvitMessages.ts` - Devvit 메시지 타입
2. `src/shared/api/endpoints.ts` - API 엔드포인트 상수
3. `src/client/utils/DevvitMessenger.ts` - Devvit 통신 유틸리티
4. `src/client/api/GameAPI.ts` - API 인터페이스
5. `src/client/api/HTTPGameAPIClient.ts` - HTTP 구현체
6. `src/client/api/MockGameAPIClient.ts` - Mock 구현체
7. `src/client/store/gameStore.ts` - 전역 상태 관리
8. `src/client/contexts/GameAPIContext.tsx` - API Context
9. `src/client/hooks/useCase.refactored.example.ts` - 리팩토링 예시

### 아키텍처 패턴
- **Repository Pattern**: 데이터 접근 계층 추상화
- **Dependency Injection**: Context를 통한 의존성 주입
- **Type-Safe Communication**: 타입 안전 메시지 전송

### 관련 문서
- [React Context API](https://react.dev/reference/react/useContext)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Devvit Documentation](https://developers.reddit.com/docs)

---

**작성자**: Claude (AI Assistant)
**최종 업데이트**: 2025-01-15
**버전**: 1.0.0
