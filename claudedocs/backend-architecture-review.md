# Backend Architecture Review

**프로젝트**: Armchair Sleuths
**검증 날짜**: 2025-10-27
**검증 범위**: 서버 아키텍처, API 엔드포인트, Repository Pattern, Service 계층

---

## 목차

1. [Executive Summary](#executive-summary)
2. [Phase 3: RESTful 원칙 준수 검증](#phase-3-restful-원칙-준수-검증)
3. [Phase 4: Repository Pattern 분석](#phase-4-repository-pattern-분석)
4. [Phase 5: Service 계층 검증](#phase-5-service-계층-검증)
5. [개선 권장 사항 (우선순위별)](#개선-권장-사항-우선순위별)
6. [장기 로드맵](#장기-로드맵)

---

## Executive Summary

### 현재 상태

**강점**:
- ✅ **Service 레이어 존재**: CaseGeneratorService, SuspectAIService 등 비즈니스 로직 분리
- ✅ **Repository Pattern (서버)**: CaseRepository, KVStoreManager 사용
- ✅ **타입 안전성 강화**: TypeScript 타입 정의 추가 완료 (27개 추가)
- ✅ **Devvit 통합**: Redis KV Store, Reddit API 연동
- ✅ **Storage Adapter 추상화**: IStorageAdapter 인터페이스로 테스트 용이성 확보

**개선 필요 영역**:
- ⚠️ **Controller 레이어 부재**: index.ts에서 Router Handler가 Controller 역할 수행
- ⚠️ **RESTful 원칙 일부 위반**: 동사형 URL (예: `/api/case/generate`)
- ⚠️ **에러 응답 일관성**: 표준화된 ApiError 타입 사용 필요
- ⚠️ **Repository 인터페이스 부재**: CaseRepository가 구체 클래스로만 존재

### 우선순위 개선 사항

| 우선순위 | 개선 항목 | 영향도 | 난이도 |
|---------|---------|--------|--------|
| 🔴 High | Controller 레이어 도입 | 높음 | 중간 |
| 🔴 High | API 에러 응답 표준화 | 높음 | 낮음 |
| 🟡 Medium | RESTful URL 개선 | 중간 | 중간 |
| 🟡 Medium | Repository 인터페이스화 | 중간 | 중간 |
| 🟢 Low | Service 간 의존성 정리 | 낮음 | 높음 |

---

## Phase 3: RESTful 원칙 준수 검증

### HTTP 메서드 사용 현황

| 메서드 | 개수 | 준수 여부 |
|--------|------|-----------|
| GET | 13개 | ✅ 모두 읽기 전용 |
| POST | 20개 | ⚠️ 일부 비준수 |
| DELETE | 1개 | ✅ 삭제 작업 |
| PUT/PATCH | 0개 | ⚠️ 업데이트 엔드포인트 없음 |

### RESTful 원칙 위반 사례

#### 1. 동사형 URL 사용

**현재 (비권장)**:
```
❌ POST /api/case/generate
❌ POST /api/case/regenerate
❌ POST /api/create-game-post
```

**개선 권장**:
```
✅ POST /api/cases (body에 generation 옵션 포함)
✅ PUT /api/cases/:caseId (케이스 재생성)
✅ POST /api/posts (게임 포스트 생성)
```

**근거**: RESTful 원칙에서 URL은 리소스를 나타내야 하며, 동사가 아닌 명사를 사용해야 합니다.

#### 2. 비표준 URL 패턴

**현재 (비권장)**:
```
❌ POST /api/chat/:suspectId (대화는 리소스가 아님)
❌ POST /api/location/search (탐색은 동작)
```

**개선 권장**:
```
✅ POST /api/suspects/:suspectId/messages (메시지 리소스 생성)
✅ POST /api/locations/:locationId/searches (탐색 기록 생성)
```

**근거**: 대화 메시지와 탐색 기록은 명사형 리소스로 표현할 수 있습니다.

#### 3. 업데이트 엔드포인트 부재

**현재**:
- 케이스 생성: `POST /api/case/generate`
- 케이스 삭제: `DELETE /api/case/:caseId`
- 케이스 업데이트: ❌ 없음

**개선 권장**:
```
✅ POST /api/cases (생성)
✅ GET /api/cases/:caseId (조회)
✅ PUT /api/cases/:caseId (전체 업데이트)
✅ PATCH /api/cases/:caseId (부분 업데이트)
✅ DELETE /api/cases/:caseId (삭제)
```

**근거**: CRUD 완전성을 위해 Update 작업도 지원해야 합니다.

### RESTful 개선 권장 (우선순위별)

#### 🔴 High Priority (즉시 개선 권장)

**1. `/api/case/generate` → `/api/cases`**
```typescript
// 현재
POST /api/case/generate

// 개선
POST /api/cases
{
  "date": "2025-10-27",
  "includeImages": true,
  "temperature": 0.8
}
```

**2. `/api/case/regenerate` → PUT `/api/cases/:caseId`**
```typescript
// 현재
POST /api/case/regenerate
{ "caseId": "case-2025-10-27" }

// 개선
PUT /api/cases/case-2025-10-27
{
  "regenerate": true,
  "includeImages": true
}
```

#### 🟡 Medium Priority (단계적 개선)

**3. `/api/chat/:suspectId` → `/api/suspects/:suspectId/messages`**
```typescript
// 현재
POST /api/chat/:suspectId
{ "userId": "user123", "message": "Where were you?" }

// 개선
POST /api/suspects/:suspectId/messages
{ "userId": "user123", "content": "Where were you?" }
```

**4. `/api/location/search` → `/api/locations/:locationId/searches`**
```typescript
// 현재
POST /api/location/search
{ "caseId": "...", "locationId": "...", "searchType": "quick" }

// 개선
POST /api/locations/:locationId/searches
{ "caseId": "...", "userId": "...", "type": "quick" }
```

### 에러 응답 표준화

#### 현재 상태 (일관성 부족)

**패턴 1**:
```json
{
  "error": "Bad request",
  "message": "userId and message are required"
}
```

**패턴 2**:
```json
{
  "status": "error",
  "message": "postId is required"
}
```

**패턴 3**:
```json
{
  "success": false,
  "error": "Case not found",
  "message": "Case case-2025-10-27 not found"
}
```

#### 개선 권장: 표준화된 ApiError 타입 사용

```typescript
// src/shared/types/api.ts (이미 정의됨)
export interface ApiError {
  success: false;
  error: string;        // 'CASE_NOT_FOUND', 'INVALID_REQUEST'
  message: string;     // 사용자 표시 메시지
  details?: unknown;   // 디버깅용 상세 정보
}
```

**모든 에러 응답 예시**:
```json
// 400 Bad Request
{
  "success": false,
  "error": "INVALID_REQUEST",
  "message": "userId and message are required",
  "details": {
    "missingFields": ["userId", "message"]
  }
}

// 404 Not Found
{
  "success": false,
  "error": "CASE_NOT_FOUND",
  "message": "Case case-2025-10-27 not found"
}

// 500 Internal Server Error
{
  "success": false,
  "error": "INTERNAL_SERVER_ERROR",
  "message": "Failed to generate case",
  "details": {
    "cause": "Gemini API timeout"
  }
}
```

**에러 코드 표준**:
```typescript
// src/shared/types/api.ts (추가 권장)
export enum ApiErrorCode {
  // 400 Bad Request
  INVALID_REQUEST = 'INVALID_REQUEST',
  MISSING_FIELDS = 'MISSING_FIELDS',
  INVALID_FIELDS = 'INVALID_FIELDS',

  // 401 Unauthorized
  UNAUTHORIZED = 'UNAUTHORIZED',

  // 403 Forbidden
  FORBIDDEN = 'FORBIDDEN',

  // 404 Not Found
  CASE_NOT_FOUND = 'CASE_NOT_FOUND',
  SUSPECT_NOT_FOUND = 'SUSPECT_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  // 409 Conflict
  AP_INSUFFICIENT = 'AP_INSUFFICIENT',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // 500 Internal Server Error
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',

  // 503 Service Unavailable
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GEMINI_API_UNAVAILABLE = 'GEMINI_API_UNAVAILABLE'
}
```

---

## Phase 4: Repository Pattern 분석

### 현재 Repository 구조

```
src/server/services/repositories/
├── kv/
│   ├── CaseRepository.ts          # Case 비즈니스 로직
│   └── KVStoreManager.ts          # KV Store 추상화
└── adapters/
    ├── IStorageAdapter.ts         # Storage 인터페이스 ✅
    ├── DevvitStorageAdapter.ts    # Devvit Redis 구현
    ├── MemoryStorageAdapter.ts    # 테스트용 메모리 구현
    └── FileStorageAdapter.ts      # 파일 기반 구현
```

### 장점

1. **Storage Adapter 추상화**
   ```typescript
   // IStorageAdapter 인터페이스로 테스트 용이성 확보
   export interface IStorageAdapter {
     get(key: string): Promise<string | null>;
     set(key: string, value: string): Promise<void>;
     del(key: string): Promise<void>;
     sAdd(key: string, member: string): Promise<void>;
     sMembers(key: string): Promise<string[]>;
   }
   ```

2. **KVStoreManager의 역할 분리**
   - Storage 접근 추상화
   - 데이터 직렬화/역직렬화
   - 키 네이밍 규칙 관리

3. **CaseRepository의 비즈니스 로직**
   - 케이스 생성/조회/삭제
   - 용의자 관리
   - 통계 계산

### 개선 필요 사항

#### 1. Repository 인터페이스 부재

**문제**: CaseRepository가 구체 클래스로만 존재하여 테스트 및 확장이 어려움

**현재**:
```typescript
// CaseRepository.ts (구체 클래스)
export class CaseRepository {
  static async createCase(input: CreateCaseInput): Promise<CaseData> {
    // ...
  }
}
```

**개선 권장**:
```typescript
// src/server/repositories/interfaces/ICaseRepository.ts (새 파일)
export interface ICaseRepository {
  createCase(input: CreateCaseInput, date?: Date, customCaseId?: string): Promise<CaseData>;
  getTodaysCase(): Promise<CaseData | null>;
  getCaseById(caseId: string): Promise<CaseData | null>;
  getCaseSuspects(caseId: string): Promise<SuspectData[]>;
  getSuspectById(suspectId: string): Promise<SuspectData | null>;
  updateSuspectEmotionalState(
    suspectId: string,
    suspicionLevel: number,
    tone: 'cooperative' | 'nervous' | 'defensive' | 'aggressive'
  ): Promise<void>;
  deleteCase(caseId: string): Promise<void>;
  caseExists(caseId: string): Promise<boolean>;
}

// src/server/repositories/kv/KVCaseRepository.ts (구현)
export class KVCaseRepository implements ICaseRepository {
  constructor(private kvStore: KVStoreManager) {}

  async createCase(input: CreateCaseInput, date?: Date, customCaseId?: string): Promise<CaseData> {
    // 기존 CaseRepository 로직
  }
  // ... 기타 메서드
}

// src/server/repositories/mock/MockCaseRepository.ts (테스트용)
export class MockCaseRepository implements ICaseRepository {
  private cases: Map<string, CaseData> = new Map();

  async createCase(input: CreateCaseInput): Promise<CaseData> {
    // 메모리 기반 Mock 구현
  }
  // ... 기타 메서드
}
```

**이점**:
- ✅ 테스트 용이성: Mock Repository로 유닛 테스트 가능
- ✅ 확장성: 다른 데이터베이스 (PostgreSQL, MongoDB) 쉽게 추가
- ✅ 의존성 주입: Service 계층에서 Repository 주입 가능

#### 2. 추가 Repository 필요

**현재**:
- ✅ CaseRepository: 케이스 관련 데이터
- ❌ SuspectRepository: 없음 (CaseRepository에 포함)
- ❌ EvidenceRepository: 없음
- ❌ SubmissionRepository: 없음 (KVStoreManager에 포함)
- ❌ PlayerStateRepository: 없음 (KVStoreManager에 포함)

**개선 권장**:
```typescript
// src/server/repositories/interfaces/ISuspectRepository.ts
export interface ISuspectRepository {
  getSuspectById(suspectId: string): Promise<SuspectData | null>;
  getCaseSuspects(caseId: string): Promise<SuspectData[]>;
  saveSuspect(suspect: SuspectData): Promise<void>;
  updateEmotionalState(suspectId: string, state: EmotionalState): Promise<void>;
  deleteSuspect(suspectId: string): Promise<void>;
}

// src/server/repositories/interfaces/IEvidenceRepository.ts
export interface IEvidenceRepository {
  getEvidenceById(evidenceId: string): Promise<EvidenceItem | null>;
  getCaseEvidence(caseId: string): Promise<EvidenceItem[]>;
  saveEvidence(evidence: EvidenceItem): Promise<void>;
  deleteEvidence(evidenceId: string): Promise<void>;
}

// src/server/repositories/interfaces/ISubmissionRepository.ts
export interface ISubmissionRepository {
  saveSubmission(submission: SubmissionData): Promise<void>;
  getSubmission(caseId: string, userId: string): Promise<SubmissionData | null>;
  getCaseSubmissions(caseId: string): Promise<SubmissionData[]>;
  getLeaderboard(caseId: string, limit: number): Promise<SubmissionData[]>;
}

// src/server/repositories/interfaces/IPlayerStateRepository.ts
export interface IPlayerStateRepository {
  getPlayerState(caseId: string, userId: string): Promise<PlayerEvidenceState | null>;
  savePlayerState(state: PlayerEvidenceState): Promise<void>;
  deletePlayerState(caseId: string, userId: string): Promise<void>;
}
```

#### 3. Repository 간 의존성 정리

**문제**: CaseRepository와 KVStoreManager가 양방향 의존

**현재**:
```typescript
// CaseRepository.ts
import { KVStoreManager } from './KVStoreManager';

export class CaseRepository {
  static async createCase(...) {
    await KVStoreManager.saveCase(caseData); // 직접 호출
  }
}
```

**개선 권장**:
```typescript
// CaseRepository는 KVStoreManager를 생성자 주입으로 받음
export class KVCaseRepository implements ICaseRepository {
  constructor(private storage: IStorageAdapter) {}

  async createCase(...) {
    // storage를 통해 간접 접근
    await this.storage.set(`case:${caseId}`, JSON.stringify(caseData));
  }
}

// Service에서 Repository 생성 및 주입
export class CaseService {
  private caseRepo: ICaseRepository;

  constructor(storage: IStorageAdapter) {
    this.caseRepo = new KVCaseRepository(storage);
  }
}
```

---

## Phase 5: Service 계층 검증

### 현재 Service 구조

```
src/server/services/
├── case/
│   ├── CaseGeneratorService.ts      # 케이스 생성 비즈니스 로직
│   └── CaseValidator.ts             # 케이스 검증
├── suspect/
│   ├── SuspectAIService.ts          # AI 용의자 대화
│   └── EmotionalStateManager.ts     # 감정 상태 관리
├── scoring/
│   ├── ScoringEngine.ts             # 채점 엔진
│   └── W4HValidator.ts              # W4H 검증
├── discovery/
│   ├── EvidenceDiscoveryService.ts  # 증거 발견
│   ├── ActionPointsService.ts       # 액션 포인트
│   └── LocationDiscoveryService.ts  # 장소 탐색
├── ap/
│   ├── APAcquisitionService.ts      # AP 획득
│   └── APTopicGenerator.ts          # AP 주제 생성
├── state/
│   └── PlayerEvidenceStateService.ts # 플레이어 상태
├── gemini/
│   └── GeminiClient.ts              # Gemini API 클라이언트
└── image/
    ├── ImageStorageService.ts       # 이미지 저장
    ├── EvidenceImageGeneratorService.ts
    └── LocationImageGeneratorService.ts
```

### 장점

1. **명확한 책임 분리**
   - 각 Service가 단일 책임 원칙 (SRP) 준수
   - 도메인별 Service 그룹화

2. **비즈니스 로직 집중**
   - HTTP 요청/응답 처리 없음
   - 순수한 비즈니스 로직만 포함

3. **재사용 가능한 구조**
   - Service 간 조합 가능
   - 테스트 용이성 확보

### 개선 필요 사항

#### 1. Controller 레이어 부재

**문제**: `src/server/index.ts`의 Router Handler가 Controller 역할 수행

**현재**:
```typescript
// src/server/index.ts
router.post('/api/case/generate', async (_req, res): Promise<void> => {
  try {
    const apiKey = await settings.get<string>('geminiApiKey');

    if (!apiKey) {
      console.error('Gemini API key not configured');
      res.status(500).json({
        error: 'Configuration error',
        message: 'Gemini API key not configured'
      });
      return;
    }

    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);

    const caseData = await caseGenerator.generateCase({...});

    res.json({
      success: true,
      caseId: caseData.id,
      // ...
    });
  } catch (error) {
    console.error('Error generating case:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate case'
    });
  }
});
```

**개선 권장**: Controller 레이어 도입

```typescript
// src/server/controllers/CaseController.ts (새 파일)
export class CaseController {
  constructor(
    private caseService: CaseService,
    private errorHandler: ErrorHandler
  ) {}

  /**
   * POST /api/cases
   * 케이스 생성
   */
  async createCase(req: Request, res: Response): Promise<void> {
    try {
      // 1. Request 검증
      const createDto = this.validateCreateCaseRequest(req.body);

      // 2. Service 호출 (비즈니스 로직)
      const caseData = await this.caseService.createCase(createDto);

      // 3. Response 변환
      const response: GenerateCaseResponse = {
        success: true,
        message: 'Case generated successfully',
        caseId: caseData.id,
        date: caseData.date,
        locations: caseData.locations,
        evidenceCount: caseData.evidence?.length || 0
      };

      res.status(201).json(response);
    } catch (error) {
      this.errorHandler.handleError(error, res);
    }
  }

  /**
   * GET /api/cases/:caseId
   * 케이스 조회
   */
  async getCaseById(req: Request, res: Response): Promise<void> {
    try {
      const { caseId } = req.params;
      const language = (req.query.language as string) || 'ko';
      const userId = req.query.userId as string | undefined;

      // Service 호출
      const caseData = await this.caseService.getCaseById(caseId, {
        language,
        userId
      });

      if (!caseData) {
        res.status(404).json({
          success: false,
          error: ApiErrorCode.CASE_NOT_FOUND,
          message: `Case ${caseId} not found`
        } as ApiError);
        return;
      }

      res.json(caseData);
    } catch (error) {
      this.errorHandler.handleError(error, res);
    }
  }

  /**
   * DELETE /api/cases/:caseId
   * 케이스 삭제
   */
  async deleteCase(req: Request, res: Response): Promise<void> {
    try {
      const { caseId } = req.params;

      await this.caseService.deleteCase(caseId);

      const response: DeleteCaseResponse = {
        success: true,
        message: 'Case deleted successfully',
        caseId
      };

      res.json(response);
    } catch (error) {
      this.errorHandler.handleError(error, res);
    }
  }

  private validateCreateCaseRequest(body: any): CreateCaseDto {
    // Request body 검증 로직
    // 실패 시 ValidationError throw
    return body as CreateCaseDto;
  }
}

// src/server/routes/caseRoutes.ts (새 파일)
export function registerCaseRoutes(router: Router, controller: CaseController): void {
  router.post('/api/cases', (req, res) => controller.createCase(req, res));
  router.get('/api/cases/:caseId', (req, res) => controller.getCaseById(req, res));
  router.delete('/api/cases/:caseId', (req, res) => controller.deleteCase(req, res));
}

// src/server/index.ts (리팩토링 후)
const app = express();
const router = express.Router();

// Controllers 초기화
const caseController = new CaseController(caseService, errorHandler);
const suspectController = new SuspectController(suspectService, errorHandler);
// ...

// Routes 등록
registerCaseRoutes(router, caseController);
registerSuspectRoutes(router, suspectController);
// ...

app.use(router);
```

**이점**:
- ✅ **관심사 분리**: HTTP 처리와 비즈니스 로직 완전 분리
- ✅ **재사용성**: 같은 Service를 다른 Controller에서 재사용
- ✅ **테스트 용이성**: Controller 유닛 테스트 가능
- ✅ **에러 처리 통일**: ErrorHandler로 일관된 에러 응답

#### 2. Error Handler 통합

```typescript
// src/server/middleware/ErrorHandler.ts (새 파일)
export class ErrorHandler {
  handleError(error: unknown, res: Response): void {
    // 1. 알려진 에러 타입 처리
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        error: ApiErrorCode.INVALID_REQUEST,
        message: error.message,
        details: error.validationErrors
      } as ApiError);
      return;
    }

    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        error: error.code,
        message: error.message
      } as ApiError);
      return;
    }

    if (error instanceof APInsufficientError) {
      res.status(400).json({
        success: false,
        error: ApiErrorCode.AP_INSUFFICIENT,
        message: error.message,
        details: {
          currentAP: error.currentAP,
          requiredAP: error.requiredAP
        }
      } as ApiError);
      return;
    }

    // 2. 알 수 없는 에러 처리
    console.error('Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: ApiErrorCode.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred'
    } as ApiError);
  }
}

// src/server/errors/CustomErrors.ts (새 파일)
export class ValidationError extends Error {
  constructor(
    message: string,
    public validationErrors: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(
    message: string,
    public code: ApiErrorCode
  ) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class APInsufficientError extends Error {
  constructor(
    message: string,
    public currentAP: number,
    public requiredAP: number
  ) {
    super(message);
    this.name = 'APInsufficientError';
  }
}
```

#### 3. Service 의존성 주입

**현재**: Factory 함수 사용
```typescript
// src/server/services/case/CaseGeneratorService.ts
export function createCaseGeneratorService(geminiClient: GeminiClient): CaseGeneratorService {
  return new CaseGeneratorService(geminiClient);
}
```

**개선 권장**: 의존성 주입 컨테이너 사용

```typescript
// src/server/di/ServiceContainer.ts (새 파일)
export class ServiceContainer {
  private instances = new Map<string, any>();

  constructor(private config: AppConfig) {}

  // Singleton 등록
  register<T>(key: string, factory: () => T): void {
    this.instances.set(key, { factory, instance: null });
  }

  // Instance 조회 (Lazy initialization)
  resolve<T>(key: string): T {
    const entry = this.instances.get(key);
    if (!entry) {
      throw new Error(`Service not registered: ${key}`);
    }

    if (!entry.instance) {
      entry.instance = entry.factory();
    }

    return entry.instance;
  }
}

// src/server/di/registerServices.ts (새 파일)
export function registerServices(container: ServiceContainer): void {
  // Storage Adapter
  container.register('storageAdapter', () => new DevvitStorageAdapter());

  // Repositories
  container.register('caseRepository', () => {
    const adapter = container.resolve<IStorageAdapter>('storageAdapter');
    return new KVCaseRepository(adapter);
  });

  container.register('suspectRepository', () => {
    const adapter = container.resolve<IStorageAdapter>('storageAdapter');
    return new KVSuspectRepository(adapter);
  });

  // Services
  container.register('geminiClient', () => {
    const apiKey = container.resolve<AppConfig>('config').geminiApiKey;
    return createGeminiClient(apiKey);
  });

  container.register('caseService', () => {
    const caseRepo = container.resolve<ICaseRepository>('caseRepository');
    const gemini = container.resolve<GeminiClient>('geminiClient');
    return new CaseService(caseRepo, gemini);
  });

  container.register('suspectService', () => {
    const suspectRepo = container.resolve<ISuspectRepository>('suspectRepository');
    const gemini = container.resolve<GeminiClient>('geminiClient');
    return new SuspectService(suspectRepo, gemini);
  });

  // Controllers
  container.register('caseController', () => {
    const service = container.resolve<CaseService>('caseService');
    const errorHandler = container.resolve<ErrorHandler>('errorHandler');
    return new CaseController(service, errorHandler);
  });
}

// src/server/index.ts (DI 적용)
const config = {
  geminiApiKey: await settings.get<string>('geminiApiKey')
};

const container = new ServiceContainer(config);
registerServices(container);

// Controllers 조회
const caseController = container.resolve<CaseController>('caseController');
const suspectController = container.resolve<SuspectController>('suspectController');
```

---

## 개선 권장 사항 (우선순위별)

### 🔴 High Priority (즉시 개선 권장)

#### 1. Controller 레이어 도입

**목표**: HTTP 요청 처리와 비즈니스 로직 분리

**작업 항목**:
- [ ] `src/server/controllers/` 디렉토리 생성
- [ ] `CaseController.ts` 생성
- [ ] `SuspectController.ts` 생성
- [ ] `DiscoveryController.ts` 생성
- [ ] `SubmissionController.ts` 생성
- [ ] `src/server/routes/` 디렉토리 생성
- [ ] 각 Controller에 대한 Route 파일 생성
- [ ] `index.ts` 리팩토링 (Router Handler → Controller 위임)

**예상 소요 시간**: 2-3일
**영향도**: 높음
**난이도**: 중간

#### 2. API 에러 응답 표준화

**목표**: 모든 API 에러 응답이 `ApiError` 타입 준수

**작업 항목**:
- [ ] `src/server/errors/CustomErrors.ts` 생성
- [ ] `ValidationError`, `NotFoundError`, `APInsufficientError` 등 정의
- [ ] `src/server/middleware/ErrorHandler.ts` 생성
- [ ] 모든 try-catch 블록에서 `ErrorHandler` 사용
- [ ] `ApiErrorCode` enum 추가 (api.ts)

**예상 소요 시간**: 1일
**영향도**: 높음
**난이도**: 낮음

### 🟡 Medium Priority (단계적 개선)

#### 3. RESTful URL 개선

**목표**: 동사형 URL → 명사형 리소스 URL

**작업 항목**:
- [ ] `/api/case/generate` → `/api/cases` (POST)
- [ ] `/api/case/regenerate` → `/api/cases/:caseId` (PUT)
- [ ] `/api/create-game-post` → `/api/posts` (POST)
- [ ] `/api/chat/:suspectId` → `/api/suspects/:suspectId/messages` (POST)
- [ ] `/api/location/search` → `/api/locations/:locationId/searches` (POST)
- [ ] 기존 클라이언트 코드 업데이트 (호환성 유지)

**예상 소요 시간**: 2일
**영향도**: 중간 (클라이언트 수정 필요)
**난이도**: 중간

#### 4. Repository 인터페이스화

**목표**: 테스트 용이성 및 확장성 확보

**작업 항목**:
- [ ] `src/server/repositories/interfaces/` 디렉토리 생성
- [ ] `ICaseRepository.ts` 인터페이스 정의
- [ ] `ISuspectRepository.ts` 인터페이스 정의
- [ ] `IEvidenceRepository.ts` 인터페이스 정의
- [ ] `ISubmissionRepository.ts` 인터페이스 정의
- [ ] `IPlayerStateRepository.ts` 인터페이스 정의
- [ ] `KVCaseRepository` 구현 (기존 로직 이전)
- [ ] `MockCaseRepository` 테스트용 구현
- [ ] Service 계층에서 인터페이스 주입 사용

**예상 소요 시간**: 3일
**영향도**: 중간
**난이도**: 중간

### 🟢 Low Priority (장기 개선)

#### 5. Service 간 의존성 정리

**목표**: 순환 의존성 제거 및 DI 컨테이너 도입

**작업 항목**:
- [ ] `src/server/di/ServiceContainer.ts` 생성
- [ ] `registerServices.ts` 생성
- [ ] 모든 Service에 DI 적용
- [ ] Factory 함수 제거
- [ ] Service 간 의존성 그래프 검증

**예상 소요 시간**: 2-3일
**영향도**: 낮음 (내부 구조 개선)
**난이도**: 높음

#### 6. 통합 테스트 작성

**목표**: API 엔드포인트 통합 테스트 커버리지 확보

**작업 항목**:
- [ ] `src/server/__tests__/integration/` 디렉토리 생성
- [ ] Case Management API 통합 테스트
- [ ] Suspect & Interrogation API 통합 테스트
- [ ] Evidence Discovery API 통합 테스트
- [ ] Submission & Scoring API 통합 테스트
- [ ] CI/CD 파이프라인에 통합 테스트 추가

**예상 소요 시간**: 5일
**영향도**: 높음 (품질 보증)
**난이도**: 중간

---

## 장기 로드맵

### Phase 1: Controller & Error Handling (1주)

**목표**: HTTP 계층과 비즈니스 로직 분리

- Week 1:
  - [ ] Controller 레이어 도입
  - [ ] ErrorHandler 통합
  - [ ] API 에러 응답 표준화

**검증 기준**:
- ✅ 모든 API 엔드포인트가 Controller를 통해 처리됨
- ✅ 모든 에러 응답이 `ApiError` 타입 준수
- ✅ ErrorHandler로 일관된 에러 처리

### Phase 2: RESTful API Refactoring (1주)

**목표**: RESTful 원칙 준수

- Week 2:
  - [ ] RESTful URL 개선
  - [ ] HTTP 메서드 적절성 검증
  - [ ] 클라이언트 코드 업데이트

**검증 기준**:
- ✅ 동사형 URL 제거
- ✅ 리소스 기반 URL 구조
- ✅ CRUD 완전성 확보

### Phase 3: Repository Pattern Enhancement (2주)

**목표**: Repository 인터페이스화 및 확장성 확보

- Week 3-4:
  - [ ] Repository 인터페이스 정의
  - [ ] 구현체 분리 (KV, Mock, File)
  - [ ] Service 계층에 DI 적용

**검증 기준**:
- ✅ 모든 Repository가 인터페이스로 정의됨
- ✅ Mock Repository로 테스트 가능
- ✅ Service가 Repository 인터페이스에만 의존

### Phase 4: Service Layer Improvement (2주)

**목표**: DI 컨테이너 도입 및 의존성 관리

- Week 5-6:
  - [ ] ServiceContainer 구현
  - [ ] 모든 Service에 DI 적용
  - [ ] 순환 의존성 제거

**검증 기준**:
- ✅ ServiceContainer로 모든 의존성 관리
- ✅ Factory 함수 제거
- ✅ 순환 의존성 없음

### Phase 5: Testing & Documentation (2주)

**목표**: 품질 보증 및 문서화

- Week 7-8:
  - [ ] 통합 테스트 작성 (80% 커버리지)
  - [ ] API 문서 자동 생성 (Swagger/OpenAPI)
  - [ ] 아키텍처 문서 업데이트

**검증 기준**:
- ✅ 통합 테스트 커버리지 80% 이상
- ✅ Swagger UI로 API 문서 접근 가능
- ✅ 아키텍처 다이어그램 최신 상태

---

## 결론

Armchair Sleuths 프로젝트의 백엔드 아키텍처는 전반적으로 견고한 기반을 가지고 있으나, **Controller 레이어 도입**, **API 에러 응답 표준화**, **RESTful 원칙 준수** 개선이 필요합니다.

### 핵심 개선 사항 요약

| 항목 | 현재 상태 | 목표 상태 | 우선순위 |
|------|----------|----------|----------|
| Controller 레이어 | ❌ 부재 | ✅ 도입 | 🔴 High |
| 에러 응답 표준화 | ⚠️ 일관성 부족 | ✅ ApiError 타입 준수 | 🔴 High |
| RESTful URL | ⚠️ 동사형 URL 존재 | ✅ 명사형 리소스 URL | 🟡 Medium |
| Repository 인터페이스 | ⚠️ 구체 클래스만 존재 | ✅ 인터페이스 + 구현 분리 | 🟡 Medium |
| DI 컨테이너 | ❌ Factory 함수 | ✅ ServiceContainer | 🟢 Low |
| 통합 테스트 | ❌ 부족 | ✅ 80% 커버리지 | 🟢 Low |

### 기대 효과

**단기 (1-2주)**:
- ✅ 코드 가독성 및 유지보수성 향상
- ✅ API 에러 처리 일관성 확보
- ✅ 프론트엔드 개발자 경험 개선

**중기 (1-2개월)**:
- ✅ 테스트 커버리지 향상
- ✅ 확장성 확보 (새 기능 추가 용이)
- ✅ RESTful API 표준 준수

**장기 (3-6개월)**:
- ✅ 마이크로서비스 전환 가능성
- ✅ 다른 데이터베이스 마이그레이션 용이
- ✅ 팀 협업 효율성 증대

---

**검증자**: Backend Architect Agent
**검증 날짜**: 2025-10-27
**다음 리뷰 예정일**: 2025-11-27
