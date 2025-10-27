# Backend API 엔드포인트 문서

**프로젝트**: Armchair Sleuths
**작성일**: 2025-10-27
**분석 파일**: `src/server/index.ts`
**타입 정의**: `src/shared/types/api.ts`

---

## 목차

1. [Internal/System APIs](#internalSystem-apis)
2. [Case Management APIs](#case-management-apis)
3. [Suspect & Interrogation APIs](#suspect--interrogation-apis)
4. [Evidence Discovery APIs](#evidence-discovery-apis)
5. [Submission & Scoring APIs](#submission--scoring-apis)
6. [Action Points (AP) System APIs](#action-points-ap-system-apis)
7. [Image Generation Status APIs](#image-generation-status-apis)
8. [Test APIs (Temporary)](#test-apis-temporary)

---

## Internal/System APIs

### GET /api/init

**설명**: 앱 초기화 정보 조회 (카운터, 사용자명)

**요청**:
- Headers: Devvit context (postId)
- Body: 없음

**응답**:
```typescript
// 성공 (200)
{
  type: 'init',
  postId: string,
  count: number,
  username: string
}

// 실패 (400)
{
  status: 'error',
  message: string
}
```

**타입**: `InitResponse` (api.ts)
**구현 위치**: index.ts:43-78

---

### POST /api/increment

**설명**: 카운터 증가 (예제 API)

**요청**:
- Headers: Devvit context (postId)
- Body: 없음

**응답**:
```typescript
// 성공 (200)
{
  type: 'increment',
  postId: string,
  count: number
}
```

**타입**: `IncrementResponse` (api.ts)
**구현 위치**: index.ts:80-98

---

### POST /api/decrement

**설명**: 카운터 감소 (예제 API)

**요청**:
- Headers: Devvit context (postId)
- Body: 없음

**응답**:
```typescript
// 성공 (200)
{
  type: 'decrement',
  postId: string,
  count: number
}
```

**타입**: `DecrementResponse` (api.ts)
**구현 위치**: index.ts:100-118

---

### POST /internal/on-app-install

**설명**: Devvit 앱 설치 시 호출 (스케줄러 초기화, 샘플 포스트 생성)

**요청**:
- Body: 없음 (Devvit context 사용)

**응답**:
```typescript
// 성공 (200)
{
  status: 'success',
  message: string
}

// 실패 (400)
{
  status: 'error',
  message: string
}
```

**구현 위치**: index.ts:120-148

---

### POST /internal/menu/post-create

**설명**: 메뉴에서 새 게임 포스트 생성 (타임스탬프 기반 고유 케이스 ID)

**요청**:
- Body: 없음 (Devvit context 사용)

**응답**:
```typescript
// 성공 (200) - Devvit UIResponse
{
  navigateTo: Post // Reddit post object
}

// 실패 (200) - Devvit showToast
{
  showToast: {
    text: string,
    appearance: 'neutral'
  }
}
```

**구현 위치**: index.ts:150-252

---

### POST /internal/menu/test-media-upload

**설명**: 미디어 업로드 검증 테스트 실행 (메뉴에서 호출)

**요청**:
- Body: 없음

**응답**:
```typescript
// 성공 (200)
{
  status: 'success' | 'partial_success',
  message: string,
  results: TestResult[],
  summary: {
    totalTests: number,
    passed: number,
    failed: number,
    totalDuration: number
  }
}

// 실패 (500)
{
  status: 'error',
  message: string
}
```

**구현 위치**: index.ts:258-309

---

## Case Management APIs

### POST /api/case/generate

**설명**: 오늘의 케이스 생성 (관리자용)

**요청**:
- Body: 없음 (자동으로 오늘 날짜 사용)

**응답**:
```typescript
// 성공 (200)
{
  success: true,
  message: string,
  caseId: string,
  date: string,
  locations: Location[],
  evidenceCount: number
}

// 실패 (500)
{
  error: string,
  message: string
}
```

**타입**: 없음 (추가 필요: `GenerateCaseResponse`)
**구현 위치**: index.ts:319-361

---

### POST /api/case/regenerate

**설명**: 케이스 재생성 (이미지 없는 케이스 삭제 후 재생성)

**요청**:
```typescript
{
  caseId: string
}
```

**응답**:
```typescript
// 성공 (200)
{
  success: true,
  message: string,
  caseId: string,
  date: string,
  suspectsWithImages: number,
  totalSuspects: number
}

// 케이스 없음 (404)
{
  error: 'Case not found',
  message: string
}

// 실패 (500)
{
  error: 'Internal server error',
  message: string
}
```

**타입**: 없음 (추가 필요: `RegenerateCaseRequest`, `RegenerateCaseResponse`)
**구현 위치**: index.ts:367-464

---

### POST /api/create-game-post

**설명**: 새 게임 케이스 생성 + Reddit 포스트 자동 업로드 (개발용)

**요청**:
- Body: 없음

**응답**:
```typescript
// 성공 (200)
{
  success: true,
  message: string,
  caseId: string,
  date: string,
  postId: string,
  postUrl: string,
  postTitle: string,
  suspects: Array<{
    name: string,
    archetype: string,
    hasImage: boolean
  }>,
  victim: string,
  generatedAt: number
}

// 실패 (500)
{
  error: string,
  message: string
}
```

**타입**: 없음 (추가 필요: `CreateGamePostResponse`)
**구현 위치**: index.ts:473-555

---

### DELETE /api/case/:caseId

**설명**: 케이스 삭제 (개발/관리자용)

**요청**:
- URL Parameter: `caseId` (string)

**응답**:
```typescript
// 성공 (200)
{
  success: true,
  message: string,
  caseId: string
}

// 케이스 없음 (404)
{
  error: 'Case not found',
  message: string
}

// 실패 (500)
{
  error: 'Internal server error',
  message: string
}
```

**타입**: 없음 (추가 필요: `DeleteCaseResponse`)
**구현 위치**: index.ts:561-594

---

### GET /api/case/today

**설명**: 오늘의 케이스 조회 (다국어 지원)

**요청**:
- Query Parameter: `language` ('ko' | 'en', 기본값: 'ko')

**응답**:
```typescript
// 성공 (200)
{
  id: string,
  date: string,
  language: 'ko' | 'en',
  victim: {
    name: string,
    background: string,
    relationship: string
  },
  weapon: {
    name: string,
    description: string
  },
  location: {
    name: string,
    description: string
  },
  suspects: Array<{
    id: string,
    caseId: string,
    name: string,
    archetype: string,
    background: string,
    personality: string,
    emotionalState: EmotionalState,
    hasProfileImage: boolean
  }>,
  imageUrl?: string,
  introNarration?: IntroNarration, // LEGACY
  introSlides?: IntroSlides, // NEW
  cinematicImages?: CinematicImages,
  locations: Location[],
  evidence: EvidenceItem[],
  evidenceDistribution: EvidenceDistribution,
  actionPoints: ActionPointsConfig,
  generatedAt: number,
  _autoRegenerated?: boolean // 자동 재생성 시에만 true
}

// 케이스 없음 (404)
{
  error: 'No case found',
  message: string
}

// 잘못된 언어 (400)
{
  error: 'Bad request',
  message: string
}

// 실패 (500)
{
  error: 'Internal server error',
  message: string
}
```

**타입**: 없음 (추가 필요: `CaseApiResponse`)
**구현 위치**: index.ts:607-757

---

### GET /api/case/:caseId

**설명**: 특정 케이스 ID로 케이스 조회

**요청**:
- URL Parameter: `caseId` (string)
- Query Parameter:
  - `userId` (optional, string) - 플레이어 상태 자동 초기화
  - `language` ('ko' | 'en', 기본값: 'ko')

**응답**:
```typescript
// 성공 (200)
{
  id: string,
  date: string,
  language: 'ko' | 'en',
  victim: VictimData,
  weapon: WeaponData,
  location: LocationData,
  suspects: SuspectData[],
  imageUrl?: string,
  introNarration?: IntroNarration,
  introSlides?: IntroSlides,
  cinematicImages?: CinematicImages,
  locations: Location[],
  evidence: EvidenceItem[],
  evidenceDistribution: EvidenceDistribution,
  actionPoints: ActionPointsConfig,
  generatedAt: number,
  playerState?: {
    ...PlayerEvidenceState,
    actionPointsRemaining: number,
    actionPointsUsed: number
  }
}

// 케이스 없음 (404)
{
  error: 'No case found',
  message: string
}

// 실패 (500)
{
  error: 'Internal server error',
  message: string
}
```

**타입**: 없음 (추가 필요: `GetCaseByIdResponse`)
**구현 위치**: index.ts:766-865

---

## Suspect & Interrogation APIs

### GET /api/suspects/:caseId

**설명**: 케이스의 모든 용의자 목록 조회

**요청**:
- URL Parameter: `caseId` (string)

**응답**:
```typescript
// 성공 (200)
{
  suspects: Array<{
    id: string,
    caseId: string,
    name: string,
    archetype: string,
    background: string,
    personality: string,
    emotionalState: EmotionalState,
    profileImageUrl?: string
  }>
}

// 실패 (500)
{
  error: 'Internal server error',
  message: string
}
```

**타입**: 없음 (추가 필요: `GetSuspectsResponse`)
**구현 위치**: index.ts:1017-1043

---

### GET /api/suspect-image/:suspectId

**설명**: 용의자 프로필 이미지 개별 조회 (base64 data URL)

**요청**:
- URL Parameter: `suspectId` (string)

**응답**:
```typescript
// 성공 (200)
{
  suspectId: string,
  profileImageUrl: string // base64 data URL
}

// 이미지 없음 (404)
{
  error: 'Not found',
  message: string
}

// 실패 (500)
{
  error: 'Internal server error',
  message: string
}
```

**타입**: 없음 (추가 필요: `GetSuspectImageResponse`)
**구현 위치**: index.ts:1051-1086

---

### POST /api/chat/:suspectId

**설명**: AI 용의자와 대화 + AP 획득 (Phase 2)

**요청**:
- URL Parameter: `suspectId` (string)
- Body:
```typescript
{
  userId: string,
  message: string,
  caseId?: string // 선택 (suspectId에서 자동 추론 가능)
}
```

**응답**:
```typescript
// 성공 (200)
{
  success: true,
  aiResponse: string,
  conversationId: string,
  playerState: {
    currentAP: number,
    totalAP: number,
    spentAP: number
  },
  apAcquisition?: {
    amount: number,
    reason: string,
    breakdown: {
      topicAP: number,
      bonusAP: number
    },
    newTotal: number
  }
}

// 실패 (400)
{
  error: 'Bad request',
  message: string
}

// 실패 (404)
{
  error: 'Suspect not found' | 'Case not found',
  message: string
}

// 실패 (500)
{
  error: 'Configuration error' | 'Internal server error',
  message: string
}
```

**타입**: `InterrogationResponse` (api.ts)
**구현 위치**: index.ts:1120-1263

---

### GET /api/conversation/:suspectId/:userId

**설명**: 대화 기록 조회

**요청**:
- URL Parameter:
  - `suspectId` (string)
  - `userId` (string)

**응답**:
```typescript
// 성공 (200)
{
  messages: Array<{
    role: 'user' | 'suspect',
    content: string,
    timestamp: number
  }>
}

// 실패 (500)
{
  error: 'Configuration error' | 'Internal server error',
  message: string
}
```

**타입**: 없음 (추가 필요: `GetConversationResponse`)
**구현 위치**: index.ts:1269-1297

---

## Evidence Discovery APIs

### POST /api/location/search

**설명**: 장소 탐색 및 증거 발견 + AP 차감 (Phase 2)

**요청**:
```typescript
{
  caseId: string,
  userId: string,
  locationId: string,
  searchType: 'quick' | 'thorough' | 'exhaustive'
}
```

**응답**:
```typescript
// 성공 (200)
{
  success: true,
  location: {
    id: string,
    name: string,
    imageUrl?: string
  },
  searchType: 'quick' | 'thorough' | 'exhaustive',
  evidenceFound: EvidenceItem[],
  evidenceMissed?: number,
  totalSearched: number,
  remainingLocations: number,
  alreadySearched: boolean,
  actionPointsRemaining: number,
  actionCost: number,
  completionRate: number,
  timestamp: Date,
  playerState: {
    currentAP: number,
    totalAP: number,
    spentAP: number
  },
  playerStats: {
    totalEvidence: number,
    discoveredEvidence: number,
    completionRate: number,
    efficiency: number
  }
}

// AP 부족 (400)
{
  error: 'AP_INSUFFICIENT',
  message: string,
  currentAP: number,
  requiredAP: number
}

// 실패 (400)
{
  error: 'Bad request',
  message: string
}

// 케이스 없음 (404)
{
  error: 'Case not found',
  message: string
}

// 실패 (500)
{
  error: 'Internal server error',
  message: string
}
```

**타입**: `SearchLocationResponse` (api.ts)
**구현 위치**: index.ts:1441-1630

---

### GET /api/player-state/:caseId/:userId

**설명**: 플레이어 증거 발견 상태 조회 (AP 정보 포함)

**요청**:
- URL Parameter:
  - `caseId` (string)
  - `userId` (string)

**응답**:
```typescript
// 성공 (200)
{
  ...PlayerEvidenceState,
  actionPointsRemaining: number,
  actionPointsUsed: number
}

// 케이스 없음 (404)
{
  error: 'Case not found',
  message: string
}

// 실패 (500)
{
  error: 'Internal server error',
  message: string
}
```

**타입**: 없음 (추가 필요: `GetPlayerStateResponse`)
**구현 위치**: index.ts:1638-1684

---

### POST /api/player-state/initialize

**설명**: 플레이어 증거 발견 상태 초기화

**요청**:
```typescript
{
  caseId: string,
  userId: string
}
```

**응답**:
```typescript
// 성공 (200)
{
  ...PlayerEvidenceState,
  actionPointsRemaining: number,
  actionPointsUsed: number
}

// 실패 (400)
{
  error: 'Bad request',
  message: string
}

// 케이스 없음 (404)
{
  error: 'Case not found',
  message: string
}

// 실패 (500)
{
  error: 'Internal server error',
  message: string
}
```

**타입**: 없음 (추가 필요: `InitializePlayerStateRequest`, `InitializePlayerStateResponse`)
**구현 위치**: index.ts:1693-1740

---

## Submission & Scoring APIs

### POST /api/submit

**설명**: 답안 제출 및 채점

**요청**:
```typescript
{
  userId: string,
  caseId: string,
  answers: {
    who: string,
    what: string,
    where: string,
    when: string,
    why: string,
    how: string
  }
}
```

**응답**:
```typescript
// 성공 (200) - ScoringResult 타입
{
  userId: string,
  caseId: string,
  score: number,
  isCorrect: boolean,
  feedback: {
    who: { correct: boolean, feedback: string },
    what: { correct: boolean, feedback: string },
    where: { correct: boolean, feedback: string },
    when: { correct: boolean, feedback: string },
    why: { correct: boolean, feedback: string },
    how: { correct: boolean, feedback: string }
  },
  submittedAt: number
}

// 실패 (400)
{
  error: 'Bad request',
  message: string
}

// 케이스 없음 (404)
{
  error: 'Case not found',
  message: string
}

// 실패 (500)
{
  error: 'Configuration error' | 'Internal server error',
  message: string
}
```

**타입**: 없음 (추가 필요: `SubmitAnswerRequest`, `SubmitAnswerResponse`)
**구현 위치**: index.ts:1303-1357

---

### GET /api/leaderboard/:caseId

**설명**: 리더보드 조회

**요청**:
- URL Parameter: `caseId` (string)
- Query Parameter: `limit` (number, 기본값: 10)

**응답**:
```typescript
// 성공 (200)
{
  leaderboard: Array<{
    userId: string,
    score: number,
    isCorrect: boolean,
    submittedAt: number
  }>
}

// 실패 (500)
{
  error: 'Configuration error' | 'Internal server error',
  message: string
}
```

**타입**: 없음 (추가 필요: `GetLeaderboardResponse`)
**구현 위치**: index.ts:1363-1393

---

### GET /api/stats/:caseId

**설명**: 케이스 통계 조회

**요청**:
- URL Parameter: `caseId` (string)

**응답**:
```typescript
// 성공 (200) - CaseStatistics 타입
{
  totalSubmissions: number,
  correctSubmissions: number,
  averageScore: number,
  // ... 기타 통계 필드
}

// 실패 (500)
{
  error: 'Configuration error' | 'Internal server error',
  message: string
}
```

**타입**: 없음 (추가 필요: `GetCaseStatsResponse`)
**구현 위치**: index.ts:1399-1428

---

## Action Points (AP) System APIs

### GET /api/player/:userId/ap-status

**설명**: 현재 AP 상태 조회

**요청**:
- URL Parameter: `userId` (string)
- Query Parameter: `caseId` (optional, string) - 없으면 오늘의 케이스 사용

**응답**:
```typescript
// 성공 (200)
{
  success: true,
  actionPoints: {
    current: number,
    maximum: number,
    total: number,
    spent: number,
    initial: number,
    emergencyAPUsed: boolean,
    acquisitionCount: number,
    spendingCount: number
  }
}

// 케이스 없음 (404)
{
  success: false,
  error: 'Case not found',
  message: string
}

// 실패 (500)
{
  success: false,
  error: 'Internal server error',
  message: string
}
```

**타입**: `APStatusResponse` (api.ts)
**구현 위치**: index.ts:1755-1814

---

### GET /api/admin/ap-integrity/:userId

**설명**: AP 무결성 검사 (디버깅 및 모니터링용, Phase 3)

**요청**:
- URL Parameter: `userId` (string)
- Query Parameter: `caseId` (optional, string) - 없으면 오늘의 케이스 사용

**응답**:
```typescript
// 성공 (200)
{
  success: true,
  userId: string,
  caseId: string,
  integrity: 'VALID' | 'SUSPICIOUS' | 'INVALID' | 'NOT_INITIALIZED',
  issues: string[],
  stats: {
    current: number,
    total: number,
    spent: number,
    initial: number,
    acquisitions: number,
    spendings: number,
    acquiredTopics: number,
    bonusesAcquired: number,
    emergencyAPUsed: boolean
  },
  calculatedValues: {
    expectedTotal: number,
    expectedSpent: number,
    expectedCurrent: number
  },
  recentActivity: {
    lastAcquisition: APAcquisition | null,
    lastSpending: APSpending | null,
    acquisitionsLast60Seconds: number
  }
}

// 케이스 없음 (404)
{
  success: false,
  error: 'CASE_NOT_FOUND',
  message: string
}

// 실패 (500)
{
  success: false,
  error: 'INTEGRITY_CHECK_FAILED',
  message: string
}
```

**타입**: 없음 (추가 필요: `APIntegrityResponse`)
**구현 위치**: index.ts:1823-1944

---

## Image Generation Status APIs

### GET /api/case/:caseId/image-status

**설명**: 통합 이미지 생성 상태 조회 (증거 + 장소 이미지)

**요청**:
- URL Parameter: `caseId` (string)

**응답**:
```typescript
// 성공 (200)
{
  caseId: string,
  evidence: {
    status: 'pending' | 'in_progress' | 'complete' | 'failed',
    total: number,
    completed: number,
    failed: number,
    startedAt?: string,
    completedAt?: string
  },
  location: {
    status: 'pending' | 'in_progress' | 'complete' | 'failed',
    total: number,
    completed: number,
    failed: number,
    startedAt?: string,
    completedAt?: string
  },
  complete: boolean,
  lastUpdated: string
}

// 실패 (500)
{
  error: 'Internal server error',
  message: string
}
```

**타입**: `ImageGenerationStatusResponse` (api.ts)
**구현 위치**: index.ts:958-1011

---

### GET /api/case/:caseId/evidence-images/status

**설명**: 증거 이미지 생성 상태 조회

**요청**:
- URL Parameter: `caseId` (string)

**응답**:
```typescript
// 성공 (200)
{
  status: 'pending' | 'in_progress' | 'complete' | 'failed',
  totalCount: number,
  completedCount: number,
  images: Record<string, string>, // evidenceId -> imageUrl
  lastUpdated: string
}

// 실패 (500)
{
  error: 'Internal server error',
  message: string
}
```

**타입**: 없음 (추가 필요: `EvidenceImageStatusResponse`)
**구현 위치**: index.ts:871-902

---

### GET /api/case/:caseId/location-images/status

**설명**: 장소 이미지 생성 상태 조회

**요청**:
- URL Parameter: `caseId` (string)

**응답**:
```typescript
// 성공 (200)
{
  status: 'pending' | 'in_progress' | 'complete' | 'failed',
  totalCount: number,
  completedCount: number,
  images: Record<string, string>, // locationId -> imageUrl
  lastUpdated: string
}

// 실패 (500)
{
  error: 'Internal server error',
  message: string
}
```

**타입**: 없음 (추가 필요: `LocationImageStatusResponse`)
**구현 위치**: index.ts:908-939

---

## Test APIs (Temporary)

**주의**: 개발 및 검증용 임시 API입니다. 프로덕션 배포 전 제거 예정입니다.

### POST /api/webhook/poc-test

**설명**: Webhook 수신 테스트 (PoC Test 4 & 5)

**요청**:
```typescript
{
  test: 'poc-webhook' | 'poc-e2e',
  caseId?: string,
  timestamp?: number,
  images?: Array<{...}>
}
```

**응답**:
```typescript
// 성공 (200)
{
  received: true,
  timestamp: number,
  valid: boolean,
  message: string,
  receivedPayload: {
    test: string,
    caseId?: string,
    hasImages: boolean,
    imageCount: number
  }
}
```

**구현 위치**: index.ts:1953-1981

---

### GET /api/test/media-check

**설명**: Media API 존재 확인 (Test 1)

**요청**: 없음

**응답**:
```typescript
{
  success: boolean,
  message: string,
  // ... 테스트 결과
}
```

**구현 위치**: index.ts:1995-2014

---

### POST /api/test/upload-single

**설명**: 단일 이미지 업로드 테스트 (Test 2)

**요청**: 없음

**응답**:
```typescript
{
  success: boolean,
  message: string,
  duration: number,
  // ... 테스트 결과
}
```

**구현 위치**: index.ts:2020-2039

---

### POST /api/test/upload-sequential

**설명**: 순차 이미지 업로드 테스트 (Test 3)

**요청**:
- Query Parameter: `count` (number, 기본값: 5)

**응답**:
```typescript
{
  success: boolean,
  message: string,
  count: number,
  duration: number,
  // ... 테스트 결과
}
```

**구현 위치**: index.ts:2045-2066

---

### POST /api/test/upload-parallel

**설명**: 병렬 이미지 업로드 테스트 (Test 4)

**요청**:
- Query Parameter: `count` (number, 기본값: 5)

**응답**:
```typescript
{
  success: boolean,
  message: string,
  count: number,
  duration: number,
  // ... 테스트 결과
}
```

**구현 위치**: index.ts:2072-2093

---

### POST /api/test/upload-full

**설명**: 전체 규모 이미지 업로드 테스트 (Test 5, 14개)

**요청**: 없음

**응답**:
```typescript
{
  success: boolean,
  message: string,
  totalCount: number,
  duration: number,
  // ... 테스트 결과
}
```

**구현 위치**: index.ts:2099-2118

---

### POST /api/test/run-all

**설명**: 모든 테스트 순차 실행

**요청**: 없음

**응답**:
```typescript
{
  allTests: TestResult[],
  summary: {
    totalTests: number,
    passed: number,
    failed: number,
    totalDuration: number
  }
}
```

**구현 위치**: index.ts:2124-2151

---

## 요약 통계

### API 엔드포인트 수
- **Internal/System APIs**: 6개
- **Case Management APIs**: 6개
- **Suspect & Interrogation APIs**: 4개
- **Evidence Discovery APIs**: 3개
- **Submission & Scoring APIs**: 3개
- **Action Points APIs**: 2개
- **Image Generation Status APIs**: 3개
- **Test APIs (Temporary)**: 7개

**총 API 엔드포인트**: 34개

### HTTP 메서드 분포
- **GET**: 13개
- **POST**: 20개
- **DELETE**: 1개

### 타입 안전성 현황
- **타입 정의 존재**: 7개
- **타입 정의 누락**: 27개

---

## 다음 단계

1. **Phase 2**: `src/shared/types/api.ts`에 누락된 타입 추가
2. **Phase 3**: RESTful 원칙 준수 검증
3. **Phase 4**: Repository Pattern 분석
4. **Phase 5**: Service 계층 검증 및 Controller 레이어 도입 권장

---

**작성자**: Backend Architect Agent
**검증 날짜**: 2025-10-27
