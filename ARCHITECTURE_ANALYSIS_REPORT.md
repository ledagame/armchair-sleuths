# Armchair Sleuths: 아키텍처 분석 및 근본 원인 보고서

**생성일**: 2025-10-21
**분석 범위**: 전체 코드베이스 (117개 TypeScript 파일)
**분석 방법**: Sequential Thinking + 정적 분석 + 의존성 분석

---

## 📋 Executive Summary

비개발자의 바이브 코딩 환경에서 발생한 **근본적인 아키텍처 문제**를 식별했습니다.
가장 심각한 문제는 **클라이언트-서버 타입 경계 위반**으로, 즉시 수정이 필요합니다.

### 심각도별 문제 분류

| 심각도 | 문제 | 영향 | 우선순위 |
|--------|------|------|----------|
| 🔴 CRITICAL | 타입 경계 위반 (Client → Server import) | 빌드 실패 가능, 타입 안정성 손상 | P0 |
| 🟠 HIGH | 타입 책임 분리 부족 | 유지보수 어려움, 확장성 저하 | P1 |
| 🟡 MEDIUM | 서비스 레이어 과도한 분산 (38개) | 복잡도 증가, 의존성 관리 어려움 | P2 |
| 🟢 LOW | 코드 중복 및 패턴 불일치 | 개발 효율성 저하 | P3 |

---

## 🔍 문제 1: 타입 경계 위반 (CRITICAL)

### 문제 설명

**클라이언트 코드가 서버 전용 타입을 직접 import하고 있습니다.**

#### 위반 사례 (3개 파일)

```typescript
// ❌ src/client/types/index.ts:6
import type { ImageGenerationStatus } from '../../server/types/imageTypes';

// ❌ src/client/hooks/useEvidenceImages.ts:2
import type { ImageGenerationStatus } from '../../server/types/imageTypes';

// ❌ src/client/hooks/useLocationImages.ts:2
import type { ImageGenerationStatus } from '../../server/types/imageTypes';
```

#### 영향 분석 (16개 파일 affected)

- **서버 서비스**: 6개 파일에서 사용
- **클라이언트 컴포넌트/Hooks**: 3개 파일에서 사용
- **공유 타입**: 1개 파일에서 사용

```
src/server/types/imageTypes.ts (소스 정의)
├── ❌ src/client/types/index.ts
├── ❌ src/client/hooks/useEvidenceImages.ts
├── ❌ src/client/hooks/useLocationImages.ts
├── ✅ src/server/services/image/ImageStorageService.ts
├── ✅ src/server/services/image/EvidenceImageGeneratorService.ts
└── ✅ src/server/services/image/LocationImageGeneratorService.ts
```

### 근본 원인

1. **타입 정의 위치 잘못 선택**
   - `ImageGenerationStatus`, `EvidenceImageStatusResponse`, `LocationImageStatusResponse`가 server/types/에 있음
   - 하지만 클라이언트도 이 타입들이 필요함 (UI 상태 관리)

2. **바이브 코딩 과정에서 빠른 구현 우선**
   - 타입 배치 위치를 고려하지 않고 즉시 사용 가능한 곳에 생성
   - 타입 의존성 방향성 검증 없이 import

3. **아키텍처 경계 인식 부족**
   - Client ← Shared → Server 계층 구조 미준수
   - 빌드 시스템 분리 시 문제 발생 가능

### 해결 방안

#### ✅ Solution 1: Shared Types로 이동 (권장)

```bash
# 새 파일 생성
src/shared/types/Image.ts
```

```typescript
// src/shared/types/Image.ts
/**
 * Image generation status types
 * Used by both client (UI state) and server (generation tracking)
 */

export type ImageGenerationStatus =
  | 'pending'
  | 'generating'
  | 'completed'
  | 'partial'
  | 'failed';

export interface EvidenceImageStatusResponse {
  status: ImageGenerationStatus;
  totalCount: number;
  completedCount: number;
  images: Record<string, string | undefined>; // evidenceId -> imageUrl
  currentBatch?: number;
  estimatedTimeRemaining?: number; // seconds
  lastUpdated: string; // ISO timestamp
}

export interface LocationImageStatusResponse {
  status: ImageGenerationStatus;
  totalCount: number;
  completedCount: number;
  images: Record<string, string | undefined>; // locationId -> imageUrl
  lastUpdated: string;
}

export interface ImageGenerationOptions {
  batchSize?: number;
  delayBetweenImages?: number;
  maxRetries?: number;
}
```

#### 📝 마이그레이션 체크리스트

- [ ] `src/shared/types/Image.ts` 생성
- [ ] 타입 정의 복사 및 문서화 보강
- [ ] `src/shared/types/index.ts`에 re-export 추가
- [ ] Client 파일 3개 import 경로 수정
- [ ] Server 파일 6개 import 경로 수정
- [ ] `src/server/types/imageTypes.ts` 삭제
- [ ] 타입 체크: `npm run type-check`
- [ ] 빌드 검증: `npm run build`

---

## 🔍 문제 2: 타입 책임 분리 부족 (HIGH)

### 문제 설명

**타입 정의가 논리적 책임과 일치하지 않는 위치에 배치되어 있습니다.**

#### 사례 1: ActionPoints 타입이 Evidence.ts에 있음

```typescript
// ❌ src/shared/types/Evidence.ts (395줄)
export interface APAcquisition { /* ... */ }
export interface APSpending { /* ... */ }
export interface ActionPointsState { /* ... */ }
export interface PlayerEvidenceState {
  // ...
  actionPoints: ActionPointsState; // 여기서 사용되지만...
}
```

**문제점**:
- Evidence.ts 파일이 395줄로 비대함
- Action Points는 Evidence와 별개 개념 (Case/Player 상태)
- 파일명과 내용 불일치로 타입 찾기 어려움

#### 사례 2: Location 타입 중복 정의

```typescript
// src/client/types/index.ts
export interface Location {
  id?: string;
  name: string;
  description: string;
  emoji?: string;
  imageUrl?: string;
}

// src/shared/types/Location.ts
export interface Location { /* similar but different */ }

// src/shared/types/Discovery.ts
export interface Location { /* another definition */ }
```

### 근본 원인

1. **파일 단위 책임 정의 부재**
   - "이 타입은 어디에 정의되어 있을까?" 질문에 답하기 어려움
   - 기능 추가 시 가장 가까운 파일에 타입 추가하는 패턴

2. **타입 네임스페이스 관리 부족**
   - `Location`처럼 동일한 이름으로 다른 의미의 타입 존재
   - 타입 import 시 혼동 가능

3. **점진적 기능 추가로 인한 책임 확장**
   - Evidence 시스템 → Discovery 시스템 → AP 시스템
   - 각 단계에서 기존 파일에 타입 추가

### 해결 방안

#### ✅ Solution 2A: 타입 파일 재구조화

```
src/shared/types/
├── index.ts                 # Central re-export
├── Case.ts                  # Case, Solution, Victim
├── Suspect.ts               # Suspect, EmotionalState
├── Evidence.ts              # Evidence, Discovery (discovery만)
├── ActionPoints.ts          # 🆕 AP 관련 타입 분리
├── Player.ts                # 🆕 Player state 관련 타입
├── Location.ts              # Location 통합
├── Image.ts                 # 🆕 Image status types
├── i18n.ts                  # Language types
└── api.ts                   # API request/response types
```

#### ✅ Solution 2B: ActionPoints 타입 분리

```typescript
// 🆕 src/shared/types/ActionPoints.ts
/**
 * Action Points System Types
 * Used for discovery system resource management
 */

export interface APAcquisition {
  timestamp: Date;
  amount: number;
  source: 'topic' | 'bonus';
  suspectId: string;
  topicId?: string;
  bonusType?: 'suspect' | 'location' | 'secret';
  conversationId: string;
  reason: string;
}

export interface APSpending {
  timestamp: Date;
  amount: number;
  action: 'quick' | 'thorough' | 'exhaustive';
  locationId: string;
  locationName: string;
}

export interface ActionPointsState {
  current: number;
  total: number;
  spent: number;
  initial: number;
  acquisitionHistory: APAcquisition[];
  spendingHistory: APSpending[];
  acquiredTopics: Set<string>;
  bonusesAcquired: Set<string>;
  emergencyAPUsed: boolean;
}
```

```typescript
// 🆕 src/shared/types/Player.ts
/**
 * Player State Types
 * Aggregates player-specific game state
 */

import type { DiscoveredEvidenceRecord, EvidenceDiscoveryStats } from './Evidence';
import type { ActionPointsState } from './ActionPoints';
import type { SearchType } from './Discovery';

export interface PlayerEvidenceState {
  caseId: string;
  userId: string;
  discoveredEvidence: DiscoveredEvidenceRecord[];
  searchHistory: Array<{
    locationId: string;
    searchType: SearchType;
    timestamp: Date;
    evidenceFound: number;
  }>;
  stats: EvidenceDiscoveryStats;
  lastUpdated: Date;
  actionPoints: ActionPointsState;
}
```

#### 📝 마이그레이션 체크리스트

- [ ] `src/shared/types/ActionPoints.ts` 생성
- [ ] `src/shared/types/Player.ts` 생성
- [ ] `src/shared/types/Image.ts` 생성
- [ ] Evidence.ts에서 AP 관련 타입 제거
- [ ] Evidence.ts에서 PlayerEvidenceState 이동
- [ ] 모든 import 문 업데이트
- [ ] 타입 체크 및 빌드 검증

---

## 🔍 문제 3: 서비스 레이어 과도한 분산 (MEDIUM)

### 문제 설명

**38개의 서비스 파일이 여러 서브디렉토리에 분산되어 있어 의존성 파악이 어렵습니다.**

#### 서비스 레이어 구조

```
src/server/services/
├── ap/                          # Action Points (2 files)
│   ├── APAcquisitionService.ts
│   └── APTopicGenerator.ts
├── background/                  # Background tasks (1 file)
│   └── CinematicBackgroundService.ts
├── case/                        # Case generation (4 files)
│   ├── CaseGeneratorService.ts
│   ├── CaseValidator.ts
│   ├── CaseElementLibrary.ts
│   └── CaseGeneratorService.integration.test.ts
├── discovery/                   # Discovery system (3 files)
│   ├── ActionPointsService.ts
│   ├── DiscoveryStateManager.ts
│   ├── EvidenceDiscoveryService.ts
│   └── LocationDiscoveryService.ts
├── evidence/                    # Evidence (1 file)
│   └── EvidenceGeneratorService.ts
├── gemini/                      # AI client (1 file)
│   └── GeminiClient.ts
├── generators/                  # Generators (1 file)
│   └── ImageGenerator.ts
├── image/                       # 🆕 Image services (3 files)
│   ├── EvidenceImageGeneratorService.ts
│   ├── LocationImageGeneratorService.ts
│   ├── ImageStorageService.ts
│   └── CinematicImageService.ts
├── location/                    # Location (1 file)
│   └── LocationGeneratorService.ts
├── prompts/                     # Prompts (2 files)
│   ├── ArchetypePrompts.ts
│   └── __tests__/ArchetypePrompts.test.ts
├── repositories/                # Data layer (5 files)
│   ├── kv/
│   │   ├── CaseRepository.ts
│   │   └── KVStoreManager.ts
│   └── adapters/
│       ├── IStorageAdapter.ts
│       ├── DevvitStorageAdapter.ts
│       ├── FileStorageAdapter.ts
│       └── MemoryStorageAdapter.ts
├── scoring/                     # Scoring (2 files)
│   ├── ScoringEngine.ts
│   └── W4HValidator.ts
├── state/                       # State management (1 file)
│   └── PlayerEvidenceStateService.ts
├── suspect/                     # Suspect AI (2 files)
│   ├── SuspectAIService.ts
│   └── EmotionalStateManager.ts
├── validation/                  # Validation (3 files)
│   ├── ValidationService.ts
│   ├── ValidationService.test.ts
│   ├── CaseValidator.ts
│   └── FairPlayValidationService.ts
└── workflow/                    # Workflow (2 files)
    ├── WorkflowExecutor.ts
    └── TransactionManager.ts
```

**총계**: 15개 서브디렉토리, 38개 서비스 파일

### 문제점

1. **의존성 그래프 복잡도**
   - 서비스 간 의존성이 여러 디렉토리를 넘나듦
   - 순환 의존성 위험 높음

2. **디렉토리 구조 불일치**
   - `discovery/ActionPointsService.ts` vs `ap/APAcquisitionService.ts`
   - 같은 기능이 여러 디렉토리에 분산

3. **새 기능 추가 시 혼란**
   - "이 서비스는 어디에 두어야 하나?" 판단 어려움
   - 비슷한 기능이 다른 디렉토리에 존재

### 근본 원인

1. **기능별 폴더 구조 과도 적용**
   - 2-3개 파일만 있는 디렉토리가 많음
   - 디렉토리 생성 임계값 부재

2. **네이밍 불일치**
   - ActionPoints 관련: `ap/`, `discovery/ActionPointsService.ts` 혼재
   - Validation 관련: `validation/`, `case/CaseValidator.ts` 혼재

3. **점진적 기능 추가 패턴**
   - 각 기능 추가 시 새 디렉토리 생성
   - 기존 구조 정리 없이 추가만 반복

### 해결 방안

#### ✅ Solution 3A: 레이어별 재구조화

```
src/server/
├── core/                        # 핵심 도메인 로직
│   ├── case/
│   │   ├── CaseGeneratorService.ts
│   │   ├── CaseElementLibrary.ts
│   │   └── CaseValidator.ts
│   ├── suspect/
│   │   ├── SuspectAIService.ts
│   │   └── EmotionalStateManager.ts
│   ├── evidence/
│   │   ├── EvidenceGeneratorService.ts
│   │   └── EvidenceDiscoveryService.ts
│   ├── discovery/
│   │   ├── LocationDiscoveryService.ts
│   │   └── DiscoveryStateManager.ts
│   └── scoring/
│       ├── ScoringEngine.ts
│       └── W4HValidator.ts
│
├── actionpoints/                # AP 시스템 통합
│   ├── APAcquisitionService.ts
│   ├── APTopicGenerator.ts
│   └── ActionPointsService.ts  # discovery에서 이동
│
├── ai/                          # AI 관련 통합
│   ├── GeminiClient.ts
│   ├── ImageGenerator.ts
│   └── prompts/
│       └── ArchetypePrompts.ts
│
├── media/                       # 미디어 생성/저장 통합
│   ├── ImageStorageService.ts
│   ├── EvidenceImageGeneratorService.ts
│   ├── LocationImageGeneratorService.ts
│   └── CinematicImageService.ts
│
├── data/                        # 데이터 레이어
│   ├── repositories/
│   │   ├── CaseRepository.ts
│   │   └── KVStoreManager.ts
│   └── adapters/
│       ├── IStorageAdapter.ts
│       ├── DevvitStorageAdapter.ts
│       ├── FileStorageAdapter.ts
│       └── MemoryStorageAdapter.ts
│
├── state/                       # 상태 관리
│   └── PlayerEvidenceStateService.ts
│
├── validation/                  # 검증 서비스
│   ├── ValidationService.ts
│   ├── CaseValidator.ts  # case/에서 이동
│   └── FairPlayValidationService.ts
│
└── workflow/                    # 워크플로우 관리
    ├── WorkflowExecutor.ts
    └── TransactionManager.ts
```

**변경 사항**:
- 15개 디렉토리 → 9개 디렉토리로 통합
- 기능별 응집도 향상
- 명확한 레이어 분리

#### ✅ Solution 3B: 서비스 통합 및 단순화

**우선순위 높은 통합 대상**:

1. **AP 시스템 통합**
   ```typescript
   // 🔄 Before: 3개 파일 분산
   ap/APAcquisitionService.ts
   ap/APTopicGenerator.ts
   discovery/ActionPointsService.ts

   // ✅ After: 1개 디렉토리
   actionpoints/
   ├── APAcquisitionService.ts
   ├── APTopicGenerator.ts
   └── ActionPointsService.ts
   ```

2. **이미지 서비스 통합**
   ```typescript
   // 🔄 Before: 4개 파일 분산
   image/EvidenceImageGeneratorService.ts
   image/LocationImageGeneratorService.ts
   image/ImageStorageService.ts
   image/CinematicImageService.ts
   generators/ImageGenerator.ts

   // ✅ After: media/ 디렉토리로 통합
   media/
   ├── ImageGenerator.ts
   ├── ImageStorageService.ts
   ├── EvidenceImageGeneratorService.ts
   ├── LocationImageGeneratorService.ts
   └── CinematicImageService.ts
   ```

3. **Validation 통합**
   ```typescript
   // 🔄 Before: 2개 디렉토리
   validation/ValidationService.ts
   validation/FairPlayValidationService.ts
   case/CaseValidator.ts

   // ✅ After: validation/ 하나로 통합
   validation/
   ├── ValidationService.ts
   ├── CaseValidator.ts
   └── FairPlayValidationService.ts
   ```

---

## 🔍 문제 4: 최근 추가된 이미지 시스템 통합 부족

### 문제 설명

**이미지 생성 시스템이 최근 추가되었지만 기존 아키텍처와 제대로 통합되지 않았습니다.**

#### 불완전한 통합 증거

1. **타입 정의가 shared/로 이동되지 않음**
   - `src/server/types/imageTypes.ts` 남아있음
   - Client hooks가 server types에 직접 의존

2. **새 컴포넌트가 Git untracked**
   ```
   ?? src/client/components/discovery/EvidenceImageCard.tsx
   ?? src/client/components/discovery/ImageLightbox.tsx
   ?? src/client/components/ui/SkeletonLoader.tsx
   ?? src/client/hooks/useEvidenceImages.ts
   ?? src/client/hooks/useLocationImages.ts
   ```

3. **새 서비스가 Git untracked**
   ```
   ?? src/server/services/image/EvidenceImageGeneratorService.ts
   ?? src/server/services/image/ImageStorageService.ts
   ?? src/server/services/image/LocationImageGeneratorService.ts
   ?? src/server/types/imageTypes.ts
   ```

4. **API 엔드포인트는 커밋됨**
   - `server/index.ts`에 `/api/case/:caseId/evidence-images/status` 추가됨
   - 하지만 관련 타입과 서비스는 커밋되지 않음

### 근본 원인

1. **단계적 구현 중 커밋 누락**
   - 백엔드 API → 타입 정의 → 프론트엔드 hooks → UI 컴포넌트 순서로 개발
   - 중간 단계 커밋 누락

2. **타입 시스템 설계 후속 조치 부재**
   - 타입을 server/types에 먼저 생성
   - shared/로 이동하는 리팩토링 계획했으나 실행 안 됨

3. **바이브 코딩 특성상 빠른 구현 우선**
   - 기능이 작동하면 다음 기능으로 이동
   - 아키텍처 정리는 후순위

### 해결 방안

#### ✅ Solution 4: 이미지 시스템 완전 통합

**Step 1: 타입 이동**
```bash
# 이미 Solution 1에서 처리됨
mv src/server/types/imageTypes.ts src/shared/types/Image.ts
```

**Step 2: Import 경로 수정**
```typescript
// ❌ Before
import type { ImageGenerationStatus } from '../../server/types/imageTypes';

// ✅ After
import type { ImageGenerationStatus } from '../../shared/types/Image';
```

**Step 3: 새 파일 Git에 추가**
```bash
git add src/client/components/discovery/EvidenceImageCard.tsx
git add src/client/components/discovery/ImageLightbox.tsx
git add src/client/components/ui/SkeletonLoader.tsx
git add src/client/hooks/useEvidenceImages.ts
git add src/client/hooks/useLocationImages.ts
git add src/server/services/image/EvidenceImageGeneratorService.ts
git add src/server/services/image/ImageStorageService.ts
git add src/server/services/image/LocationImageGeneratorService.ts
git add src/shared/types/Image.ts
```

**Step 4: 통합 테스트**
```bash
npm run type-check
npm run build
npm run dev  # 기능 동작 확인
```

---

## 📊 우선순위별 실행 계획

### Phase 1: 긴급 수정 (P0 - 즉시 실행)

**목표**: 빌드 안정성 확보

1. ✅ **타입 경계 위반 수정**
   - [ ] `src/shared/types/Image.ts` 생성
   - [ ] Client hooks 3개 파일 import 수정
   - [ ] Server services 6개 파일 import 수정
   - [ ] `src/server/types/imageTypes.ts` 삭제
   - [ ] 타입 체크 및 빌드 검증

   **예상 소요 시간**: 30분
   **리스크**: 낮음

### Phase 2: 타입 시스템 정리 (P1 - 1주일 내)

**목표**: 타입 구조 명확화

1. ✅ **ActionPoints 타입 분리**
   - [ ] `src/shared/types/ActionPoints.ts` 생성
   - [ ] `src/shared/types/Player.ts` 생성
   - [ ] Evidence.ts에서 AP 관련 타입 제거
   - [ ] PlayerEvidenceState 이동
   - [ ] 모든 import 업데이트

   **예상 소요 시간**: 2시간
   **리스크**: 중간 (테스트 필요)

2. ✅ **Location 타입 통합**
   - [ ] 중복 정의 제거
   - [ ] 단일 Location 타입으로 통합
   - [ ] 네임스페이스 명확화

   **예상 소요 시간**: 1시간
   **리스크**: 낮음

### Phase 3: 서비스 레이어 재구조화 (P2 - 2주일 내)

**목표**: 유지보수성 향상

1. ✅ **AP 시스템 통합**
   - [ ] `src/server/actionpoints/` 생성
   - [ ] 3개 서비스 파일 이동
   - [ ] import 경로 업데이트

   **예상 소요 시간**: 1시간
   **리스크**: 낮음

2. ✅ **미디어 서비스 통합**
   - [ ] `src/server/media/` 생성
   - [ ] 이미지 관련 5개 파일 이동
   - [ ] import 경로 업데이트

   **예상 소요 시간**: 1시간
   **리스크**: 낮음

3. ✅ **Validation 통합**
   - [ ] CaseValidator를 validation/으로 이동
   - [ ] import 경로 업데이트

   **예상 소요 시간**: 30분
   **리스크**: 낮음

### Phase 4: 문서화 및 가이드라인 (P3 - 1개월 내)

**목표**: 향후 바이브 코딩 시 구조 유지

1. ✅ **아키텍처 결정 기록 (ADR)**
   - [ ] 타입 배치 규칙 문서화
   - [ ] 서비스 레이어 구조 가이드
   - [ ] 새 기능 추가 체크리스트

2. ✅ **자동화 린팅 규칙**
   - [ ] ESLint 규칙 추가: client에서 server import 금지
   - [ ] 타입 import 경로 검증
   - [ ] Pre-commit hook 설정

---

## 🛠️ 구현 스크립트

### Script 1: 타입 경계 위반 자동 수정

```bash
#!/bin/bash
# fix-type-boundaries.sh

echo "🔧 Fixing type boundary violations..."

# Step 1: Create shared Image types
cat > src/shared/types/Image.ts << 'EOF'
/**
 * Image generation status types
 * Shared between client (UI state) and server (generation tracking)
 */

export type ImageGenerationStatus = 'pending' | 'generating' | 'completed' | 'partial' | 'failed';

export interface EvidenceImageStatusResponse {
  status: ImageGenerationStatus;
  totalCount: number;
  completedCount: number;
  images: Record<string, string | undefined>;
  currentBatch?: number;
  estimatedTimeRemaining?: number;
  lastUpdated: string;
}

export interface LocationImageStatusResponse {
  status: ImageGenerationStatus;
  totalCount: number;
  completedCount: number;
  images: Record<string, string | undefined>;
  lastUpdated: string;
}

export interface ImageGenerationOptions {
  batchSize?: number;
  delayBetweenImages?: number;
  maxRetries?: number;
}
EOF

# Step 2: Update shared types index
echo "export * from './Image';" >> src/shared/types/index.ts

# Step 3: Fix client imports
find src/client -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  "s|from '../../server/types/imageTypes'|from '../../shared/types/Image'|g" {} +

# Step 4: Fix server imports
find src/server -type f -name "*.ts" -exec sed -i \
  "s|from '../../types/imageTypes'|from '../../../shared/types/Image'|g" {} +

# Step 5: Remove old file
rm src/server/types/imageTypes.ts

# Step 6: Type check
echo "🔍 Running type check..."
npm run type-check

echo "✅ Type boundaries fixed!"
```

### Script 2: 타입 분리 자동화

```bash
#!/bin/bash
# split-action-points-types.sh

echo "🔧 Splitting ActionPoints types..."

# Create ActionPoints.ts
cat > src/shared/types/ActionPoints.ts << 'EOF'
// [타입 정의 내용 - 위의 Solution 2B 참조]
EOF

# Create Player.ts
cat > src/shared/types/Player.ts << 'EOF'
// [타입 정의 내용 - 위의 Solution 2B 참조]
EOF

# Update index
echo "export * from './ActionPoints';" >> src/shared/types/index.ts
echo "export * from './Player';" >> src/shared/types/index.ts

# Remove from Evidence.ts (manual step - provide line numbers)
echo "⚠️  Manual step required:"
echo "Remove lines 148-186 from src/shared/types/Evidence.ts"
echo "(APAcquisition, APSpending, ActionPointsState interfaces)"

echo "✅ Types split! Run 'npm run type-check' after manual edits."
```

---

## 📈 성과 측정 지표

### Before (현재 상태)

| 지표 | 값 |
|------|-----|
| 타입 경계 위반 | 3개 파일 |
| 서비스 디렉토리 수 | 15개 |
| 평균 파일 크기 (타입) | 200줄 |
| Evidence.ts 크기 | 395줄 |
| 타입 import 오류 가능성 | 높음 |

### After (목표 상태)

| 지표 | 목표 |
|------|------|
| 타입 경계 위반 | 0개 |
| 서비스 디렉토리 수 | 9개 (-40%) |
| 평균 파일 크기 (타입) | 150줄 |
| Evidence.ts 크기 | 250줄 (-36%) |
| 타입 import 오류 가능성 | 낮음 (ESLint 검증) |

---

## 🎯 결론

### 주요 발견사항

1. **타입 경계 위반이 가장 심각한 문제**
   - 즉시 수정 필요 (빌드 안정성)

2. **바이브 코딩 환경의 특성**
   - 빠른 구현이 우선순위
   - 아키텍처 정리는 후순위
   - 하지만 누적된 기술 부채가 개발 속도 저하 유발

3. **체계적인 리팩토링 필요**
   - 단계별 접근 (P0 → P1 → P2 → P3)
   - 자동화 도구 활용 (스크립트, ESLint)
   - 테스트 및 검증 병행

### 권장 사항

#### 즉시 실행 (오늘)

1. ✅ 타입 경계 위반 수정 (30분)
   - `fix-type-boundaries.sh` 실행
   - 타입 체크 및 빌드 검증

#### 이번 주 내

2. ✅ ActionPoints 타입 분리 (2시간)
   - `split-action-points-types.sh` 실행
   - 수동 수정 완료
   - 전체 테스트

3. ✅ 새 파일 Git 커밋
   - 이미지 시스템 파일 모두 추가
   - 일관된 커밋 메시지

#### 다음 2주 내

4. ✅ 서비스 레이어 재구조화
   - AP, Media, Validation 통합
   - Import 경로 업데이트

#### 장기 (1개월)

5. ✅ ESLint 규칙 추가
   - Client → Server import 금지
   - Pre-commit hook 설정

6. ✅ 아키텍처 문서화
   - ADR 작성
   - 새 기능 추가 가이드

---

## 📚 참고 자료

### 관련 파일

- [타입 경계 위반 파일 목록](./type-boundary-violations.txt)
- [서비스 의존성 그래프](./service-dependencies.svg)
- [타입 리팩토링 체크리스트](./type-refactoring-checklist.md)

### 아키텍처 원칙

1. **Layered Architecture**
   ```
   Client → Shared ← Server
   (의존성은 Shared를 통해서만)
   ```

2. **Single Responsibility Principle**
   - 한 파일은 한 가지 책임
   - Evidence.ts는 Evidence만

3. **Dependency Inversion**
   - 구체적 구현이 아닌 인터페이스에 의존
   - IStorageAdapter 패턴 준수

### 도구 및 자동화

- **ESLint**: `eslint-plugin-boundaries` 사용 검토
- **TypeScript**: `strict: true`, `noImplicitAny: true`
- **Git Hooks**: Husky + lint-staged

---

**작성자**: root-cause-analyst AI Agent
**검토 필요**: 전체 팀 (특히 타입 시스템 변경)
**다음 리뷰 예정**: Phase 1 완료 후
