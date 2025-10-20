# Evidence System Implementation Plan
## 완전한 증거 시스템 구현 로드맵 (Phase 1-6)

**문서 버전**: 1.0
**작성일**: 2025-10-20
**상태**: Phase 1 완료, Phase 2-6 대기 중

---

## 📊 전체 개요

### 목표
Armchair Sleuths 게임에 Fair Play 원칙을 준수하는 완전한 증거 발견 및 분석 시스템 구축

### 핵심 원칙
- **Fair Play**: 모든 중요 증거는 thorough search에서 최소 70% 확률로 발견 가능
- **3-Clue Rule**: 범인을 지목하는 독립적인 중요 증거 최소 3개
- **Gumshoe Principle**: 찾기는 쉽지만 해석은 어렵게
- **Progressive Disclosure**: 단계적 정보 공개로 긴장감 유지

### 전체 타임라인
- **Phase 1**: ✅ 완료 (2025-10-20)
- **Phase 2**: 예상 1-2주
- **Phase 3**: 예상 1주
- **Phase 4**: 예상 1주
- **Phase 5**: 예상 1주
- **Phase 6**: 예상 1주

**총 예상 기간**: 5-7주

---

## ✅ Phase 1: Core Evidence System (완료)

### 상태: COMPLETED ✅
**완료일**: 2025-10-20

### 구현 내용

#### 1.1 타입 정의 강화

**파일**: `src/shared/types/Evidence.ts`

구현된 타입:
```typescript
// Discovery difficulty levels
type DiscoveryDifficulty = 'obvious' | 'medium' | 'hidden';

// Search types
type SearchType = 'quick' | 'thorough' | 'exhaustive';

// Discovery probability for each search type
interface DiscoveryProbability {
  quick: number;      // 0.0 - 1.0
  thorough: number;   // 0.0 - 1.0
  exhaustive: number; // 0.0 - 1.0
}

// Enhanced evidence item
interface EvidenceItem {
  // ... existing fields
  discoveryDifficulty: DiscoveryDifficulty;
  discoveryProbability: DiscoveryProbability;
  foundAtLocationId: string;
  foundAtAreaId?: string;
  imageUrl?: string;
  imageGeneratedAt?: number;
}

// Player evidence state
interface PlayerEvidenceState {
  caseId: string;
  userId: string;
  discoveredEvidence: DiscoveredEvidenceRecord[];
  searchHistory: SearchHistoryEntry[];
  stats: EvidenceDiscoveryStats;
  lastUpdated: Date;
}
```

**확률 프리셋**:
```typescript
const DISCOVERY_PROBABILITY_PRESETS = {
  obvious: {
    critical: { quick: 0.9, thorough: 1.0, exhaustive: 1.0 },
    important: { quick: 0.8, thorough: 0.95, exhaustive: 1.0 },
    minor: { quick: 0.7, thorough: 0.9, exhaustive: 1.0 },
  },
  medium: {
    critical: { quick: 0.6, thorough: 0.85, exhaustive: 1.0 },
    important: { quick: 0.5, thorough: 0.75, exhaustive: 0.95 },
    minor: { quick: 0.4, thorough: 0.65, exhaustive: 0.9 },
  },
  hidden: {
    critical: { quick: 0.3, thorough: 0.7, exhaustive: 0.95 },
    important: { quick: 0.2, thorough: 0.55, exhaustive: 0.85 },
    minor: { quick: 0.1, thorough: 0.4, exhaustive: 0.75 },
  },
};
```

#### 1.2 백엔드 서비스

**파일**: `src/server/services/evidence/EvidenceGeneratorService.ts`

주요 메서드:
- `enhanceEvidenceItems()`: 증거에 발견 난이도 및 확률 할당
- `assignDiscoveryDifficulty()`: 케이스 난이도에 따른 발견 난이도 결정
  - Easy: Critical=obvious, Important=obvious, Minor=medium
  - Medium: Critical=medium, Important=medium, Minor=hidden
  - Hard: Critical=medium, Important=hidden, Minor=hidden

**파일**: `src/server/services/discovery/EvidenceDiscoveryService.ts`

3-tier 탐색 시스템:
- `performSearch()`: 확률 기반 증거 발견
- 각 증거마다 개별적으로 확률 계산
- 이미 발견한 증거 필터링
- 장소 완료율 계산

**파일**: `src/server/services/validation/FairPlayValidationService.ts`

Fair Play 검증:
- 3-Clue Rule 검증
- 구조 일관성 검증 (한국어/영어)
- 발견 확률 검증 (critical ≥ 70% thorough)
- 상세한 검증 보고서 생성

**파일**: `src/server/services/state/PlayerEvidenceStateService.ts`

플레이어 상태 관리:
- `initializeState()`: 초기 상태 생성
- `recordDiscovery()`: 발견 기록
- `calculateEfficiency()`: 효율성 계산
- `getStatsSummary()`: 통계 요약

#### 1.3 프론트엔드 컴포넌트

**파일**: `src/client/components/discovery/SearchMethodSelector.tsx`

검색 방법 선택 컴포넌트:
- Quick/Thorough/Exhaustive 시각적 선택
- 액션 포인트 비용 표시
- AP 부족 시 비활성화
- Framer Motion 애니메이션

**파일**: `src/client/components/discovery/LocationCard.tsx` (업데이트)

향상된 기능:
- 검색 방법 선택 모달
- 완료율 진행 바
- 액션 포인트 표시
- 검색 타입별 시각적 피드백

**파일**: `src/client/components/discovery/LocationExplorer.tsx` (업데이트)

컨테이너 업데이트:
- 완료율 추적
- 검색 타입 매개변수 처리
- 액션 포인트 전달

### 성과

✅ Fair Play 원칙 준수
✅ 3-tier 검색 시스템 구현
✅ 확률 기반 발견 로직
✅ 플레이어 상태 추적
✅ 검증 시스템 완성
✅ UI/UX 컴포넌트 완성

### 다음 단계 통합 요구사항

1. API 엔드포인트 업데이트
2. 플레이어 상태 초기화 로직 추가
3. 발견 기록 저장 로직 통합
4. 액션 포인트 시스템 추가

---

## 🎨 Phase 2: Image Generation Integration

### 상태: PENDING ⏳
**예상 기간**: 1-2주

### 목표
Gemini AI를 활용한 장소 및 증거 이미지 자동 생성 시스템 구축

### 2.1 이미지 생성 서비스 구축

#### 파일 생성: `src/server/services/image/EvidenceImageGeneratorService.ts`

```typescript
/**
 * EvidenceImageGeneratorService.ts
 *
 * Gemini AI를 사용하여 증거 이미지 생성
 */

interface ImageGenerationRequest {
  evidenceId: string;
  evidenceName: string;
  evidenceDescription: string;
  evidenceType: EvidenceType;
  contextPrompt: string; // Location context, case theme, etc.
}

interface ImageGenerationResult {
  evidenceId: string;
  imageUrl: string;
  imageData?: string; // Base64 if storing locally
  generatedAt: number;
  prompt: string;
  metadata: {
    width: number;
    height: number;
    format: string;
  };
}

class EvidenceImageGeneratorService {
  /**
   * Generate image for evidence item
   */
  async generateEvidenceImage(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResult>;

  /**
   * Generate batch images for all evidence in case
   */
  async generateBatchImages(
    evidence: EvidenceItem[],
    caseContext: CaseContext
  ): Promise<Map<string, ImageGenerationResult>>;

  /**
   * Build optimized prompt for Gemini image generation
   */
  private buildImagePrompt(
    evidence: EvidenceItem,
    context: string
  ): string;

  /**
   * Validate and optimize generated image
   */
  private validateImage(imageData: any): boolean;
}
```

**이미지 프롬프트 구조**:
```
You are generating a photorealistic image for a detective game evidence item.

Evidence Type: {type}
Evidence Name: {name}
Description: {description}
Context: {locationContext}

Style Requirements:
- Photorealistic, high detail
- Detective/noir aesthetic
- Proper lighting for evidence documentation
- Professional crime scene photography style
- No text overlays
- Focus on the key detail mentioned in description

Image Specifications:
- Aspect ratio: 16:9 or 4:3
- Resolution: High quality
- Format: PNG or JPEG
```

#### 파일 생성: `src/server/services/image/LocationImageGeneratorService.ts`

```typescript
/**
 * LocationImageGeneratorService.ts
 *
 * 장소 이미지 생성 서비스
 */

class LocationImageGeneratorService {
  /**
   * Generate location image
   */
  async generateLocationImage(
    location: Location,
    caseTheme: string
  ): Promise<ImageGenerationResult>;

  /**
   * Generate multiple angle images for location
   */
  async generateLocationAngles(
    location: Location,
    angles: string[] // ['exterior', 'interior', 'detail']
  ): Promise<Map<string, ImageGenerationResult>>;
}
```

### 2.2 이미지 저장 및 관리

#### 파일 생성: `src/server/services/storage/ImageStorageService.ts`

```typescript
/**
 * ImageStorageService.ts
 *
 * 이미지 저장 및 URL 관리
 */

interface ImageStorageOptions {
  storageType: 'local' | 'cloudinary' | 's3';
  compression: boolean;
  maxSize?: number;
}

class ImageStorageService {
  /**
   * Store image and return public URL
   */
  async storeImage(
    imageData: string | Buffer,
    metadata: ImageMetadata
  ): Promise<string>; // Returns URL

  /**
   * Delete image
   */
  async deleteImage(imageUrl: string): Promise<boolean>;

  /**
   * Get optimized image URL with transformations
   */
  getOptimizedUrl(
    baseUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpg' | 'png';
    }
  ): string;
}
```

### 2.3 증거 생성 파이프라인 통합

#### 파일 수정: `src/server/services/evidence/EvidenceGeneratorService.ts`

```typescript
class EvidenceGeneratorService {
  constructor(
    private geminiClient: GeminiClient,
    private imageGenerator: EvidenceImageGeneratorService,
    private imageStorage: ImageStorageService
  ) {}

  async generateEvidence(
    // ... existing params
    options: GenerateEvidenceOptions & {
      generateImages?: boolean; // NEW
      imageStorageType?: 'local' | 'cloudinary' | 's3'; // NEW
    }
  ): Promise<MultilingualEvidence> {
    // ... existing evidence generation

    // NEW: Generate images if requested
    if (options.generateImages) {
      const imageResults = await this.generateEvidenceImages(
        evidence.translations.ko.items,
        location,
        options.imageStorageType
      );

      // Update evidence items with image URLs
      evidence = this.attachImagesToEvidence(evidence, imageResults);
    }

    return evidence;
  }

  private async generateEvidenceImages(
    items: EvidenceItem[],
    location: MultilingualLocation,
    storageType: string
  ): Promise<Map<string, string>> {
    const imageUrls = new Map<string, string>();

    for (const item of items) {
      const imageResult = await this.imageGenerator.generateEvidenceImage({
        evidenceId: item.id,
        evidenceName: item.name,
        evidenceDescription: item.description,
        evidenceType: item.type,
        contextPrompt: location.translations.ko.description,
      });

      const imageUrl = await this.imageStorage.storeImage(
        imageResult.imageData,
        {
          evidenceId: item.id,
          type: item.type,
          generatedAt: imageResult.generatedAt,
        }
      );

      imageUrls.set(item.id, imageUrl);
    }

    return imageUrls;
  }
}
```

### 2.4 프론트엔드 이미지 표시

#### 파일 생성: `src/client/components/evidence/EvidenceImageCard.tsx`

```typescript
/**
 * EvidenceImageCard.tsx
 *
 * 증거 이미지 표시 컴포넌트
 * Progressive loading, zoom, lightbox 기능
 */

interface EvidenceImageCardProps {
  evidence: EvidenceItem;
  showDetails?: boolean;
  enableZoom?: boolean;
  onClick?: () => void;
}

export function EvidenceImageCard({
  evidence,
  showDetails = true,
  enableZoom = true,
  onClick,
}: EvidenceImageCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  return (
    <motion.div className="evidence-image-card">
      {/* Progressive image loading */}
      {!imageLoaded && (
        <div className="skeleton-loader">
          <LoadingSpinner />
        </div>
      )}

      {/* Main image */}
      <img
        src={evidence.imageUrl}
        alt={evidence.name}
        onLoad={() => setImageLoaded(true)}
        className={imageLoaded ? 'visible' : 'hidden'}
      />

      {/* Evidence details overlay */}
      {showDetails && (
        <div className="evidence-details-overlay">
          <h4>{evidence.name}</h4>
          <p>{evidence.type}</p>
        </div>
      )}

      {/* Zoom button */}
      {enableZoom && (
        <button
          onClick={() => setShowLightbox(true)}
          className="zoom-button"
        >
          🔍
        </button>
      )}

      {/* Lightbox modal */}
      <AnimatePresence>
        {showLightbox && (
          <ImageLightbox
            imageUrl={evidence.imageUrl}
            title={evidence.name}
            description={evidence.description}
            onClose={() => setShowLightbox(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

#### 파일 생성: `src/client/components/shared/ImageLightbox.tsx`

```typescript
/**
 * ImageLightbox.tsx
 *
 * Full-screen image viewer with zoom and pan
 */

interface ImageLightboxProps {
  imageUrl: string;
  title: string;
  description: string;
  onClose: () => void;
}

export function ImageLightbox({
  imageUrl,
  title,
  description,
  onClose,
}: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black bg-opacity-95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Close button */}
      <button onClick={onClose} className="close-button">
        ✕
      </button>

      {/* Image with pan and zoom */}
      <div className="image-container">
        <motion.img
          src={imageUrl}
          alt={title}
          style={{
            scale,
            x: position.x,
            y: position.y,
          }}
          drag
          dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
          onDragEnd={(e, info) => {
            setPosition({ x: info.offset.x, y: info.offset.y });
          }}
        />
      </div>

      {/* Zoom controls */}
      <div className="zoom-controls">
        <button onClick={() => setScale(scale + 0.2)}>+</button>
        <button onClick={() => setScale(1)}>Reset</button>
        <button onClick={() => setScale(Math.max(0.5, scale - 0.2))}>-</button>
      </div>

      {/* Info panel */}
      <div className="info-panel">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </motion.div>
  );
}
```

### 2.5 이미지 최적화

#### 파일 생성: `src/server/utils/imageOptimization.ts`

```typescript
/**
 * imageOptimization.ts
 *
 * 이미지 압축 및 최적화 유틸리티
 */

import sharp from 'sharp';

interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Optimize image for web delivery
 */
export async function optimizeImage(
  inputBuffer: Buffer,
  options: OptimizationOptions = {}
): Promise<Buffer> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    format = 'webp',
  } = options;

  return await sharp(inputBuffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFormat(format, { quality })
    .toBuffer();
}

/**
 * Generate thumbnail
 */
export async function generateThumbnail(
  inputBuffer: Buffer,
  size: number = 300
): Promise<Buffer> {
  return await sharp(inputBuffer)
    .resize(size, size, {
      fit: 'cover',
      position: 'center',
    })
    .toFormat('webp', { quality: 80 })
    .toBuffer();
}
```

### 2.6 테스트 계획

#### 파일 생성: `src/server/services/image/__tests__/EvidenceImageGeneratorService.test.ts`

```typescript
describe('EvidenceImageGeneratorService', () => {
  it('should generate image for physical evidence', async () => {
    const result = await service.generateEvidenceImage({
      evidenceId: 'ev-1',
      evidenceName: 'Bloody Knife',
      evidenceDescription: 'A knife with blood stains',
      evidenceType: 'physical',
      contextPrompt: 'Modern apartment crime scene',
    });

    expect(result.imageUrl).toBeDefined();
    expect(result.metadata.format).toMatch(/png|jpg/);
  });

  it('should batch generate images efficiently', async () => {
    const evidence = createMockEvidence(10);
    const results = await service.generateBatchImages(evidence, context);

    expect(results.size).toBe(10);
  });

  it('should validate generated images', async () => {
    const invalidImage = {};
    expect(service.validateImage(invalidImage)).toBe(false);
  });
});
```

### 성과 목표

✅ 증거 이미지 자동 생성
✅ 장소 이미지 생성
✅ 이미지 저장 및 URL 관리
✅ 프론트엔드 이미지 표시
✅ 이미지 최적화 및 압축
✅ Lightbox 및 줌 기능

---

## 📋 Phase 3: Evidence Board & Review Phase

### 상태: PENDING ⏳
**예상 기간**: 1주

### 목표
게임 루프에 "증거 검토" 단계 추가 및 증거 보드 UI 구현

### 3.1 게임 단계 업데이트

#### 파일 수정: `src/shared/types/Game.ts`

```typescript
/**
 * Game phases with Evidence Review added
 */
export type GamePhase =
  | 'briefing'       // Case introduction
  | 'investigation'  // Location exploration
  | 'review'         // NEW: Evidence review and analysis
  | 'deduction'      // Suspect selection
  | 'revelation'     // Answer reveal
  | 'completed';     // Game ended

/**
 * Evidence review state
 */
interface EvidenceReviewState {
  selectedEvidence: string[];  // IDs of evidence marked as important
  connections: EvidenceConnection[];
  notes: Map<string, string>;  // Evidence ID -> player notes
  timeline: TimelineEvent[];
}

/**
 * Evidence connection (player-created)
 */
interface EvidenceConnection {
  id: string;
  evidenceIds: string[];  // 2+ evidence items
  connectionType: 'supports' | 'contradicts' | 'related';
  note: string;
  createdAt: Date;
}
```

### 3.2 증거 보드 컴포넌트

#### 파일 생성: `src/client/components/evidence/EvidenceBoard.tsx`

```typescript
/**
 * EvidenceBoard.tsx
 *
 * Main evidence board showing all discovered evidence
 * Grid layout with filtering, sorting, and selection
 */

interface EvidenceBoardProps {
  evidence: EvidenceItem[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onConnect: (ids: string[]) => void;
}

export function EvidenceBoard({
  evidence,
  selectedIds,
  onSelect,
  onConnect,
}: EvidenceBoardProps) {
  const [filter, setFilter] = useState<{
    type?: EvidenceType;
    relevance?: EvidenceRelevance;
    location?: string;
  }>({});

  const [sortBy, setSortBy] = useState<'discovery' | 'relevance' | 'type'>(
    'discovery'
  );

  const filteredEvidence = useMemo(() => {
    return evidence
      .filter((e) => {
        if (filter.type && e.type !== filter.type) return false;
        if (filter.relevance && e.relevance !== filter.relevance) return false;
        if (filter.location && e.foundAtLocationId !== filter.location)
          return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'relevance') {
          const order = { critical: 0, important: 1, minor: 2 };
          return order[a.relevance] - order[b.relevance];
        }
        // ... other sorting
      });
  }, [evidence, filter, sortBy]);

  return (
    <div className="evidence-board p-6">
      {/* Header with stats */}
      <div className="board-header mb-6">
        <h2 className="text-3xl font-bold text-detective-gold">
          증거 보드
        </h2>
        <div className="stats flex gap-4 mt-2">
          <Stat label="총 증거" value={evidence.length} />
          <Stat
            label="중요 증거"
            value={evidence.filter((e) => e.relevance === 'critical').length}
          />
          <Stat label="선택됨" value={selectedIds.length} />
        </div>
      </div>

      {/* Filters */}
      <EvidenceFilters
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Evidence grid */}
      <div className="evidence-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filteredEvidence.map((item) => (
          <EvidenceCard
            key={item.id}
            evidence={item}
            isSelected={selectedIds.includes(item.id)}
            onSelect={() => onSelect(item.id)}
          />
        ))}
      </div>

      {/* Connection panel (when 2+ selected) */}
      {selectedIds.length >= 2 && (
        <ConnectionPanel
          selectedEvidence={evidence.filter((e) =>
            selectedIds.includes(e.id)
          )}
          onConnect={onConnect}
        />
      )}
    </div>
  );
}
```

#### 파일 생성: `src/client/components/evidence/EvidenceCard.tsx`

```typescript
/**
 * EvidenceCard.tsx
 *
 * Individual evidence card with image, details, and selection
 */

interface EvidenceCardProps {
  evidence: EvidenceItem;
  isSelected: boolean;
  onSelect: () => void;
}

export function EvidenceCard({
  evidence,
  isSelected,
  onSelect,
}: EvidenceCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      className={`
        evidence-card rounded-lg border-2 p-4 cursor-pointer
        ${isSelected ? 'border-detective-gold bg-yellow-900/20' : 'border-gray-700 bg-gray-800'}
      `}
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
    >
      {/* Relevance badge */}
      <RelevanceBadge relevance={evidence.relevance} />

      {/* Evidence image */}
      {evidence.imageUrl && (
        <div className="image-container mb-3">
          <img
            src={evidence.imageUrl}
            alt={evidence.name}
            className="w-full h-40 object-cover rounded"
          />
        </div>
      )}

      {/* Evidence name */}
      <h4 className="text-lg font-bold text-white mb-2">
        {evidence.name}
      </h4>

      {/* Evidence type */}
      <EvidenceTypeBadge type={evidence.type} />

      {/* Description (collapsible) */}
      <div className="mt-2">
        {showDetails ? (
          <p className="text-sm text-gray-300">{evidence.description}</p>
        ) : (
          <p className="text-sm text-gray-400 line-clamp-2">
            {evidence.description}
          </p>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="text-detective-gold text-xs mt-1"
        >
          {showDetails ? '간략히' : '자세히'}
        </button>
      </div>

      {/* Discovery info */}
      <div className="mt-3 text-xs text-gray-500">
        발견 위치: {evidence.foundAtLocationId}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          className="absolute top-2 right-2 bg-detective-gold text-gray-900 rounded-full w-6 h-6 flex items-center justify-center font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          ✓
        </motion.div>
      )}
    </motion.div>
  );
}
```

### 3.3 증거 연결 시스템

#### 파일 생성: `src/client/components/evidence/ConnectionPanel.tsx`

```typescript
/**
 * ConnectionPanel.tsx
 *
 * Panel for creating connections between evidence items
 */

interface ConnectionPanelProps {
  selectedEvidence: EvidenceItem[];
  onConnect: (ids: string[]) => void;
}

export function ConnectionPanel({
  selectedEvidence,
  onConnect,
}: ConnectionPanelProps) {
  const [connectionType, setConnectionType] = useState<
    'supports' | 'contradicts' | 'related'
  >('supports');
  const [note, setNote] = useState('');

  const handleCreateConnection = () => {
    if (note.trim().length === 0) {
      alert('연결에 대한 메모를 입력해주세요');
      return;
    }

    onConnect(selectedEvidence.map((e) => e.id));
    setNote('');
  };

  return (
    <motion.div
      className="connection-panel fixed bottom-0 left-0 right-0 bg-gray-900 border-t-2 border-detective-gold p-6"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
    >
      <h3 className="text-xl font-bold text-detective-gold mb-4">
        증거 연결 만들기
      </h3>

      {/* Selected evidence preview */}
      <div className="selected-preview flex gap-2 mb-4 overflow-x-auto">
        {selectedEvidence.map((e) => (
          <div
            key={e.id}
            className="flex-shrink-0 bg-gray-800 rounded p-2 text-sm"
          >
            {e.name}
          </div>
        ))}
      </div>

      {/* Connection type selector */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">
          연결 유형:
        </label>
        <div className="flex gap-2">
          <ConnectionTypeButton
            type="supports"
            label="서로 뒷받침"
            icon="🔗"
            isSelected={connectionType === 'supports'}
            onClick={() => setConnectionType('supports')}
          />
          <ConnectionTypeButton
            type="contradicts"
            label="서로 모순"
            icon="⚠️"
            isSelected={connectionType === 'contradicts'}
            onClick={() => setConnectionType('contradicts')}
          />
          <ConnectionTypeButton
            type="related"
            label="관련 있음"
            icon="🔍"
            isSelected={connectionType === 'related'}
            onClick={() => setConnectionType('related')}
          />
        </div>
      </div>

      {/* Note input */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">
          메모:
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="이 증거들이 어떻게 연결되는지 설명해주세요..."
          className="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:border-detective-gold"
          rows={3}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleCreateConnection}
          className="flex-1 bg-detective-gold text-gray-900 font-bold py-2 rounded hover:bg-yellow-600"
        >
          연결 만들기
        </button>
        <button
          onClick={() => onConnect([])}
          className="px-6 bg-gray-700 text-white py-2 rounded hover:bg-gray-600"
        >
          취소
        </button>
      </div>
    </motion.div>
  );
}
```

### 3.4 타임라인 뷰

#### 파일 생성: `src/client/components/evidence/TimelineView.tsx`

```typescript
/**
 * TimelineView.tsx
 *
 * Timeline visualization of evidence discovery
 * Shows chronological order and relationships
 */

interface TimelineViewProps {
  evidence: EvidenceItem[];
  discoveryRecords: DiscoveredEvidenceRecord[];
}

export function TimelineView({
  evidence,
  discoveryRecords,
}: TimelineViewProps) {
  const timelineEvents = useMemo(() => {
    return discoveryRecords
      .map((record) => {
        const item = evidence.find((e) => e.id === record.evidenceId);
        if (!item) return null;

        return {
          timestamp: record.discoveredAt,
          evidence: item,
          method: record.discoveryMethod,
          location: record.locationId,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [evidence, discoveryRecords]);

  return (
    <div className="timeline-view p-6">
      <h3 className="text-2xl font-bold text-detective-gold mb-6">
        발견 타임라인
      </h3>

      <div className="timeline relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700" />

        {/* Timeline events */}
        {timelineEvents.map((event, index) => (
          <motion.div
            key={event.evidence.id}
            className="timeline-event relative pl-20 mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Timeline dot */}
            <div
              className={`
              absolute left-6 w-5 h-5 rounded-full border-2
              ${event.evidence.relevance === 'critical'
                ? 'bg-red-500 border-red-300'
                : event.evidence.relevance === 'important'
                ? 'bg-yellow-500 border-yellow-300'
                : 'bg-gray-500 border-gray-300'
              }
            `}
            />

            {/* Event content */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1">
                    {event.evidence.name}
                  </h4>
                  <p className="text-sm text-gray-400 mb-2">
                    {event.location} - {event.method} search
                  </p>
                  <p className="text-sm text-gray-300">
                    {event.evidence.description}
                  </p>
                </div>

                {event.evidence.imageUrl && (
                  <img
                    src={event.evidence.imageUrl}
                    alt={event.evidence.name}
                    className="w-20 h-20 object-cover rounded ml-4"
                  />
                )}
              </div>

              <div className="text-xs text-gray-500 mt-2">
                {formatTimestamp(event.timestamp)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

### 3.5 증거 검토 단계 통합

#### 파일 수정: `src/client/pages/GamePage.tsx`

```typescript
function GamePage() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('briefing');
  const [reviewState, setReviewState] = useState<EvidenceReviewState>({
    selectedEvidence: [],
    connections: [],
    notes: new Map(),
    timeline: [],
  });

  const handleInvestigationComplete = () => {
    // Transition from investigation to review
    setGamePhase('review');
  };

  const handleReviewComplete = () => {
    // Transition from review to deduction
    setGamePhase('deduction');
  };

  return (
    <div className="game-page">
      {gamePhase === 'investigation' && (
        <LocationExplorer
          // ... props
          onComplete={handleInvestigationComplete}
        />
      )}

      {gamePhase === 'review' && (
        <EvidenceReviewPhase
          evidence={discoveredEvidence}
          reviewState={reviewState}
          onUpdateReview={setReviewState}
          onComplete={handleReviewComplete}
        />
      )}

      {gamePhase === 'deduction' && (
        <DeductionPhase
          // ... props
          evidenceReview={reviewState} // Pass review data to deduction
        />
      )}
    </div>
  );
}
```

### 성과 목표

✅ 증거 보드 UI 구현
✅ 증거 필터링 및 정렬
✅ 증거 연결 시스템
✅ 타임라인 시각화
✅ 게임 단계 통합
✅ 플레이어 노트 기능

---

## 🏆 Phase 4: Scoring & Progression System

### 상태: PENDING ⏳
**예상 기간**: 1주

### 목표
증거 발견 효율성 기반 점수 시스템 및 업적 시스템 구현

### 4.1 점수 계산 시스템

#### 파일 생성: `src/server/services/scoring/EvidenceScoringService.ts`

```typescript
/**
 * EvidenceScoringService.ts
 *
 * 증거 발견 효율성 기반 점수 계산
 */

interface ScoringConfig {
  basePoints: {
    critical: number;  // 100
    important: number; // 50
    minor: number;     // 25
  };
  searchMethodMultiplier: {
    quick: number;      // 1.0
    thorough: number;   // 1.2
    exhaustive: number; // 1.5
  };
  efficiencyBonus: {
    threshold: number;  // 80% efficiency
    bonus: number;      // +20% points
  };
  speedBonus: {
    maxTime: number;    // 30 minutes
    bonusPerMinuteSaved: number; // 5 points
  };
}

interface ScoreBreakdown {
  evidencePoints: number;
  methodBonus: number;
  efficiencyBonus: number;
  speedBonus: number;
  totalScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
}

class EvidenceScoringService {
  constructor(private config: ScoringConfig) {}

  /**
   * Calculate total score for case completion
   */
  calculateScore(
    playerState: PlayerEvidenceState,
    totalEvidence: number,
    timeElapsed: number // in seconds
  ): ScoreBreakdown {
    // Base points from evidence
    const evidencePoints = this.calculateEvidencePoints(playerState);

    // Method bonus (higher difficulty = more points)
    const methodBonus = this.calculateMethodBonus(playerState);

    // Efficiency bonus
    const efficiency = (playerState.stats.totalEvidenceFound / totalEvidence) * 100;
    const efficiencyBonus =
      efficiency >= this.config.efficiencyBonus.threshold
        ? evidencePoints * (this.config.efficiencyBonus.bonus / 100)
        : 0;

    // Speed bonus
    const timeInMinutes = timeElapsed / 60;
    const speedBonus =
      timeInMinutes < this.config.speedBonus.maxTime
        ? (this.config.speedBonus.maxTime - timeInMinutes) *
          this.config.speedBonus.bonusPerMinuteSaved
        : 0;

    const totalScore =
      evidencePoints + methodBonus + efficiencyBonus + speedBonus;

    return {
      evidencePoints,
      methodBonus,
      efficiencyBonus,
      speedBonus,
      totalScore,
      grade: this.calculateGrade(totalScore),
    };
  }

  /**
   * Calculate points from discovered evidence
   */
  private calculateEvidencePoints(state: PlayerEvidenceState): number {
    const { criticalEvidenceFound, importantEvidenceFound, minorEvidenceFound } =
      state.stats;

    return (
      criticalEvidenceFound * this.config.basePoints.critical +
      importantEvidenceFound * this.config.basePoints.important +
      minorEvidenceFound * this.config.basePoints.minor
    );
  }

  /**
   * Calculate bonus from search methods used
   */
  private calculateMethodBonus(state: PlayerEvidenceState): number {
    const { quickSearches, thoroughSearches, exhaustiveSearches } = state.stats;

    // Weighted average of search methods
    const totalSearches = state.stats.totalSearches;
    if (totalSearches === 0) return 0;

    const avgMultiplier =
      (quickSearches * this.config.searchMethodMultiplier.quick +
        thoroughSearches * this.config.searchMethodMultiplier.thorough +
        exhaustiveSearches * this.config.searchMethodMultiplier.exhaustive) /
      totalSearches;

    // Apply to base evidence points
    return state.stats.totalEvidenceFound * 10 * (avgMultiplier - 1);
  }

  /**
   * Calculate letter grade
   */
  private calculateGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
    if (score >= 1000) return 'S';
    if (score >= 800) return 'A';
    if (score >= 600) return 'B';
    if (score >= 400) return 'C';
    return 'D';
  }

  /**
   * Get rank name based on grade
   */
  getRankName(grade: 'S' | 'A' | 'B' | 'C' | 'D'): string {
    const ranks = {
      S: '명탐정 (Master Detective)',
      A: '숙련 탐정 (Expert Detective)',
      B: '유능한 탐정 (Skilled Detective)',
      C: '초보 탐정 (Novice Detective)',
      D: '견습 탐정 (Apprentice Detective)',
    };
    return ranks[grade];
  }
}
```

### 4.2 업적 시스템

#### 파일 생성: `src/shared/types/Achievement.ts`

```typescript
/**
 * Achievement.ts
 *
 * 업적 시스템 타입 정의
 */

export type AchievementCategory =
  | 'discovery'    // Evidence discovery related
  | 'efficiency'   // Efficiency and optimization
  | 'speed'        // Time-based challenges
  | 'deduction'    // Correct deductions
  | 'completion'   // Case completion milestones
  | 'special';     // Special achievements

export interface Achievement {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  category: AchievementCategory;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';

  // Unlock condition
  condition: {
    type: 'evidence_count' | 'efficiency' | 'time' | 'perfect_case' | 'streak';
    value: number;
    comparison: '>=' | '>' | '=' | '<' | '<=';
  };

  // Rewards
  rewards?: {
    points?: number;
    badge?: string;
    title?: string;
  };

  // Display
  unlockedAt?: Date;
  progress?: number; // 0-100 for progressive achievements
}
```

#### 파일 생성: `src/server/services/achievement/AchievementService.ts`

```typescript
/**
 * AchievementService.ts
 *
 * 업적 잠금 해제 및 진행도 추적
 */

class AchievementService {
  private achievements: Achievement[] = [
    // Discovery achievements
    {
      id: 'first_evidence',
      name: 'First Clue',
      nameKo: '첫 번째 단서',
      description: 'Discover your first evidence',
      descriptionKo: '첫 번째 증거를 발견하세요',
      category: 'discovery',
      icon: '🔍',
      rarity: 'common',
      condition: { type: 'evidence_count', value: 1, comparison: '>=' },
    },
    {
      id: 'evidence_collector',
      name: 'Evidence Collector',
      nameKo: '증거 수집가',
      description: 'Discover all evidence in a case',
      descriptionKo: '케이스의 모든 증거를 발견하세요',
      category: 'discovery',
      icon: '📦',
      rarity: 'rare',
      condition: { type: 'efficiency', value: 100, comparison: '=' },
    },

    // Efficiency achievements
    {
      id: 'efficiency_master',
      name: 'Efficiency Master',
      nameKo: '효율의 달인',
      description: 'Complete case with 90%+ efficiency',
      descriptionKo: '90% 이상의 효율로 케이스를 완료하세요',
      category: 'efficiency',
      icon: '⚡',
      rarity: 'epic',
      condition: { type: 'efficiency', value: 90, comparison: '>=' },
    },

    // Speed achievements
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      nameKo: '속도의 악마',
      description: 'Complete case in under 15 minutes',
      descriptionKo: '15분 이내에 케이스를 완료하세요',
      category: 'speed',
      icon: '⏱️',
      rarity: 'epic',
      condition: { type: 'time', value: 900, comparison: '<=' }, // 900 seconds
    },

    // Perfect achievements
    {
      id: 'perfect_detective',
      name: 'Perfect Detective',
      nameKo: '완벽한 탐정',
      description: 'Get S rank with 100% efficiency',
      descriptionKo: 'S등급을 받으며 100% 효율을 달성하세요',
      category: 'completion',
      icon: '👑',
      rarity: 'legendary',
      condition: { type: 'perfect_case', value: 1, comparison: '>=' },
    },

    // Streak achievements
    {
      id: 'case_streak_5',
      name: 'Five Case Streak',
      nameKo: '5연속 해결',
      description: 'Solve 5 cases in a row correctly',
      descriptionKo: '5개 케이스를 연속으로 정확히 해결하세요',
      category: 'completion',
      icon: '🔥',
      rarity: 'rare',
      condition: { type: 'streak', value: 5, comparison: '>=' },
    },
  ];

  /**
   * Check and unlock achievements based on case completion
   */
  checkAchievements(
    playerState: PlayerEvidenceState,
    scoreBreakdown: ScoreBreakdown,
    timeElapsed: number,
    totalEvidence: number
  ): Achievement[] {
    const unlockedAchievements: Achievement[] = [];

    for (const achievement of this.achievements) {
      if (this.checkCondition(achievement, {
        playerState,
        scoreBreakdown,
        timeElapsed,
        totalEvidence,
      })) {
        unlockedAchievements.push({
          ...achievement,
          unlockedAt: new Date(),
        });
      }
    }

    return unlockedAchievements;
  }

  /**
   * Check if achievement condition is met
   */
  private checkCondition(
    achievement: Achievement,
    context: {
      playerState: PlayerEvidenceState;
      scoreBreakdown: ScoreBreakdown;
      timeElapsed: number;
      totalEvidence: number;
    }
  ): boolean {
    const { condition } = achievement;
    const { playerState, scoreBreakdown, timeElapsed, totalEvidence } = context;

    let actualValue: number;

    switch (condition.type) {
      case 'evidence_count':
        actualValue = playerState.stats.totalEvidenceFound;
        break;

      case 'efficiency':
        actualValue =
          (playerState.stats.totalEvidenceFound / totalEvidence) * 100;
        break;

      case 'time':
        actualValue = timeElapsed;
        break;

      case 'perfect_case':
        actualValue =
          scoreBreakdown.grade === 'S' &&
          playerState.stats.totalEvidenceFound === totalEvidence
            ? 1
            : 0;
        break;

      // Streak would be tracked separately in player profile
      case 'streak':
        actualValue = 0; // Would come from player profile
        break;

      default:
        return false;
    }

    return this.compareValues(actualValue, condition.value, condition.comparison);
  }

  /**
   * Compare values based on comparison operator
   */
  private compareValues(
    actual: number,
    target: number,
    comparison: '>=' | '>' | '=' | '<' | '<='
  ): boolean {
    switch (comparison) {
      case '>=':
        return actual >= target;
      case '>':
        return actual > target;
      case '=':
        return actual === target;
      case '<':
        return actual < target;
      case '<=':
        return actual <= target;
      default:
        return false;
    }
  }

  /**
   * Get all achievements with unlock status
   */
  getAllAchievements(unlockedIds: string[]): Achievement[] {
    return this.achievements.map((achievement) => ({
      ...achievement,
      unlockedAt: unlockedIds.includes(achievement.id)
        ? new Date()
        : undefined,
    }));
  }
}
```

### 4.3 점수 결과 화면

#### 파일 생성: `src/client/components/results/ScoreResultsScreen.tsx`

```typescript
/**
 * ScoreResultsScreen.tsx
 *
 * 케이스 완료 후 점수 및 업적 표시 화면
 */

interface ScoreResultsScreenProps {
  scoreBreakdown: ScoreBreakdown;
  achievements: Achievement[];
  playerState: PlayerEvidenceState;
  onContinue: () => void;
}

export function ScoreResultsScreen({
  scoreBreakdown,
  achievements,
  playerState,
  onContinue,
}: ScoreResultsScreenProps) {
  return (
    <motion.div
      className="score-results-screen p-8 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Grade display */}
      <motion.div
        className="grade-display text-center mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <div className="text-9xl font-bold text-detective-gold mb-4">
          {scoreBreakdown.grade}
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          {getRankName(scoreBreakdown.grade)}
        </h2>
        <div className="text-6xl font-bold text-white">
          {scoreBreakdown.totalScore.toLocaleString()}
        </div>
        <p className="text-gray-400">Total Points</p>
      </motion.div>

      {/* Score breakdown */}
      <div className="score-breakdown bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-detective-gold mb-4">
          점수 상세
        </h3>

        <ScoreItem
          label="증거 발견"
          value={scoreBreakdown.evidencePoints}
          icon="🔍"
        />
        <ScoreItem
          label="탐색 방법 보너스"
          value={scoreBreakdown.methodBonus}
          icon="⚡"
        />
        <ScoreItem
          label="효율성 보너스"
          value={scoreBreakdown.efficiencyBonus}
          icon="📈"
        />
        <ScoreItem
          label="속도 보너스"
          value={scoreBreakdown.speedBonus}
          icon="⏱️"
        />

        <div className="border-t border-gray-700 mt-4 pt-4">
          <ScoreItem
            label="총점"
            value={scoreBreakdown.totalScore}
            icon="🏆"
            highlight
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="statistics bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-detective-gold mb-4">
          통계
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="발견한 증거"
            value={playerState.stats.totalEvidenceFound}
            icon="📦"
          />
          <StatCard
            label="총 탐색 횟수"
            value={playerState.stats.totalSearches}
            icon="🔍"
          />
          <StatCard
            label="효율성"
            value={`${playerState.stats.efficiency.toFixed(1)}%`}
            icon="⚡"
          />
          <StatCard
            label="중요 증거"
            value={playerState.stats.criticalEvidenceFound}
            icon="⭐"
          />
        </div>
      </div>

      {/* Achievements unlocked */}
      {achievements.length > 0 && (
        <motion.div
          className="achievements bg-gray-800 rounded-lg p-6 mb-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-detective-gold mb-4">
            업적 해제! 🎉
          </h3>

          <div className="achievement-list space-y-3">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                className="achievement-item flex items-center gap-4 bg-gray-700 rounded-lg p-4"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="text-4xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-white">
                    {achievement.nameKo}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {achievement.descriptionKo}
                  </p>
                </div>
                <RarityBadge rarity={achievement.rarity} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Continue button */}
      <button
        onClick={onContinue}
        className="w-full bg-detective-gold text-gray-900 font-bold py-4 rounded-lg hover:bg-yellow-600 transition-colors"
      >
        계속하기
      </button>
    </motion.div>
  );
}
```

### 4.4 진행도 추적

#### 파일 생성: `src/server/services/progress/PlayerProgressService.ts`

```typescript
/**
 * PlayerProgressService.ts
 *
 * 플레이어 전체 진행도 및 통계 추적
 */

interface PlayerProgress {
  userId: string;
  totalCasesPlayed: number;
  totalCasesSolved: number;
  totalScore: number;
  highestGrade: 'S' | 'A' | 'B' | 'C' | 'D';
  currentStreak: number;
  longestStreak: number;
  unlockedAchievements: string[];

  stats: {
    totalEvidenceFound: number;
    totalSearches: number;
    averageEfficiency: number;
    fastestSolveTime: number;
  };

  lastPlayed: Date;
  createdAt: Date;
}

class PlayerProgressService {
  /**
   * Update progress after case completion
   */
  async updateProgress(
    userId: string,
    caseResult: {
      solved: boolean;
      scoreBreakdown: ScoreBreakdown;
      playerState: PlayerEvidenceState;
      timeElapsed: number;
    }
  ): Promise<PlayerProgress> {
    const currentProgress = await this.getProgress(userId);

    const updatedProgress: PlayerProgress = {
      ...currentProgress,
      totalCasesPlayed: currentProgress.totalCasesPlayed + 1,
      totalCasesSolved: caseResult.solved
        ? currentProgress.totalCasesSolved + 1
        : currentProgress.totalCasesSolved,
      totalScore: currentProgress.totalScore + caseResult.scoreBreakdown.totalScore,

      // Update highest grade
      highestGrade: this.getBetterGrade(
        currentProgress.highestGrade,
        caseResult.scoreBreakdown.grade
      ),

      // Update streak
      currentStreak: caseResult.solved
        ? currentProgress.currentStreak + 1
        : 0,
      longestStreak: Math.max(
        currentProgress.longestStreak,
        caseResult.solved ? currentProgress.currentStreak + 1 : 0
      ),

      // Update stats
      stats: {
        totalEvidenceFound:
          currentProgress.stats.totalEvidenceFound +
          caseResult.playerState.stats.totalEvidenceFound,
        totalSearches:
          currentProgress.stats.totalSearches +
          caseResult.playerState.stats.totalSearches,
        averageEfficiency:
          (currentProgress.stats.averageEfficiency *
            currentProgress.totalCasesPlayed +
            caseResult.playerState.stats.efficiency) /
          (currentProgress.totalCasesPlayed + 1),
        fastestSolveTime:
          currentProgress.stats.fastestSolveTime === 0
            ? caseResult.timeElapsed
            : Math.min(
                currentProgress.stats.fastestSolveTime,
                caseResult.timeElapsed
              ),
      },

      lastPlayed: new Date(),
    };

    await this.saveProgress(userId, updatedProgress);
    return updatedProgress;
  }

  /**
   * Get player leaderboard position
   */
  async getLeaderboardPosition(userId: string): Promise<{
    rank: number;
    totalPlayers: number;
    percentile: number;
  }> {
    // Implementation would query database for ranking
    return {
      rank: 1,
      totalPlayers: 100,
      percentile: 1.0,
    };
  }
}
```

### 성과 목표

✅ 점수 계산 시스템
✅ 업적 시스템
✅ 점수 결과 화면
✅ 진행도 추적
✅ 리더보드 기반
✅ 통계 대시보드

---

## 🔧 Phase 5: Integration & Polish

### 상태: PENDING ⏳
**예상 기간**: 1주

### 목표
모든 시스템 통합 및 사용자 경험 개선

### 5.1 엔드투엔드 통합

#### 파일 수정: `src/server/api/cases/playCase.ts`

```typescript
/**
 * playCase.ts
 *
 * 완전한 케이스 플레이 플로우 통합
 */

export async function playCase(
  caseId: string,
  userId: string
): Promise<CasePlaySession> {
  // 1. Initialize player state
  const playerState = playerEvidenceStateService.initializeState(caseId, userId);
  const playerProgress = await playerProgressService.getProgress(userId);

  // 2. Load case data
  const caseData = await loadCase(caseId);
  const evidence = caseData.evidence;
  const locations = caseData.locations;

  // 3. Validate Fair Play
  const validation = fairPlayValidationService.validateEvidence(evidence);
  if (!validation.isValid) {
    console.error('Fair Play validation failed:', validation.errors);
    throw new Error('Case does not meet Fair Play requirements');
  }

  // 4. Generate images (if not already generated)
  if (shouldGenerateImages(caseData)) {
    await generateCaseImages(caseData);
  }

  // 5. Create play session
  const session: CasePlaySession = {
    sessionId: generateSessionId(),
    caseId,
    userId,
    playerState,
    startedAt: new Date(),
    currentPhase: 'briefing',
    actionPoints: calculateInitialActionPoints(caseData.difficulty),
  };

  await saveSession(session);
  return session;
}

/**
 * Handle location search with full integration
 */
export async function searchLocation(
  sessionId: string,
  request: SearchLocationRequest
): Promise<SearchLocationResult> {
  // 1. Load session
  const session = await loadSession(sessionId);
  const caseData = await loadCase(session.caseId);

  // 2. Validate action points
  const actionCost = SEARCH_ACTION_COSTS[request.searchType];
  if (session.actionPoints < actionCost) {
    throw new Error('Insufficient action points');
  }

  // 3. Perform search
  const result = await evidenceDiscoveryService.searchLocation(
    request,
    caseData.evidenceDistribution,
    caseData.evidence.translations.ko.items,
    caseData.locations,
    session.playerState
  );

  // 4. Update player state
  const updatedState = playerEvidenceStateService.recordDiscovery(
    session.playerState,
    result.evidenceFound,
    request.searchType,
    request.locationId
  );

  // 5. Deduct action points
  session.actionPoints -= actionCost;
  session.playerState = updatedState;

  // 6. Save session
  await saveSession(session);

  return result;
}

/**
 * Complete case and calculate score
 */
export async function completeCase(
  sessionId: string,
  deduction: {
    suspectIndex: number;
    reasoning: string;
  }
): Promise<CaseCompletionResult> {
  const session = await loadSession(sessionId);
  const caseData = await loadCase(session.caseId);

  // 1. Check if deduction is correct
  const isCorrect = deduction.suspectIndex === caseData.guiltyIndex;

  // 2. Calculate time elapsed
  const timeElapsed = (Date.now() - session.startedAt.getTime()) / 1000;

  // 3. Calculate efficiency
  const totalEvidence = caseData.evidence.metadata.totalItems;
  const updatedState = playerEvidenceStateService.calculateEfficiency(
    session.playerState,
    totalEvidence
  );

  // 4. Calculate score
  const scoreBreakdown = evidenceScoringService.calculateScore(
    updatedState,
    totalEvidence,
    timeElapsed
  );

  // 5. Check achievements
  const achievements = achievementService.checkAchievements(
    updatedState,
    scoreBreakdown,
    timeElapsed,
    totalEvidence
  );

  // 6. Update player progress
  const progress = await playerProgressService.updateProgress(session.userId, {
    solved: isCorrect,
    scoreBreakdown,
    playerState: updatedState,
    timeElapsed,
  });

  // 7. Update achievement unlocks
  const newAchievements = achievements.filter(
    (a) => !progress.unlockedAchievements.includes(a.id)
  );
  if (newAchievements.length > 0) {
    await playerProgressService.unlockAchievements(
      session.userId,
      newAchievements.map((a) => a.id)
    );
  }

  return {
    isCorrect,
    guiltyIndex: caseData.guiltyIndex,
    scoreBreakdown,
    achievements: newAchievements,
    playerState: updatedState,
    progress,
    timeElapsed,
  };
}
```

### 5.2 UI/UX 개선

#### 파일 생성: `src/client/components/shared/LoadingStates.tsx`

```typescript
/**
 * LoadingStates.tsx
 *
 * 일관된 로딩 상태 컴포넌트
 */

export function EvidenceLoadingSkeleton() {
  return (
    <div className="evidence-loading-skeleton animate-pulse">
      <div className="h-40 bg-gray-700 rounded mb-3" />
      <div className="h-6 bg-gray-700 rounded mb-2 w-3/4" />
      <div className="h-4 bg-gray-700 rounded w-1/2" />
    </div>
  );
}

export function LocationLoadingSkeleton() {
  return (
    <div className="location-loading-skeleton animate-pulse">
      <div className="h-48 bg-gray-700 rounded mb-4" />
      <div className="h-8 bg-gray-700 rounded mb-2" />
      <div className="h-4 bg-gray-700 rounded" />
    </div>
  );
}

export function FullPageLoader({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <div className="text-center">
        <Spinner size="large" />
        {message && (
          <p className="text-white mt-4 text-lg">{message}</p>
        )}
      </div>
    </div>
  );
}
```

#### 파일 생성: `src/client/components/shared/ErrorBoundary.tsx`

```typescript
/**
 * ErrorBoundary.tsx
 *
 * 에러 바운더리 및 폴백 UI
 */

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-fallback p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              오류가 발생했습니다
            </h2>
            <p className="text-gray-400 mb-4">
              {this.state.error?.message || '알 수 없는 오류'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-detective-gold text-gray-900 px-6 py-2 rounded font-bold"
            >
              페이지 새로고침
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### 5.3 성능 최적화

#### 파일 생성: `src/client/hooks/useOptimizedImages.ts`

```typescript
/**
 * useOptimizedImages.ts
 *
 * 이미지 지연 로딩 및 최적화 훅
 */

import { useState, useEffect, useRef } from 'react';

interface UseOptimizedImageOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useOptimizedImage(
  imageUrl: string | undefined,
  options: UseOptimizedImageOptions = {}
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px',
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  useEffect(() => {
    if (isInView && imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => setIsLoaded(true);
    }
  }, [isInView, imageUrl]);

  return {
    imgRef,
    isLoaded,
    shouldLoad: isInView,
  };
}
```

### 5.4 접근성 개선

#### 파일 생성: `src/client/utils/accessibility.ts`

```typescript
/**
 * accessibility.ts
 *
 * 접근성 유틸리티 함수
 */

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Trap focus within modal
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}
```

### 5.5 데이터 영속성

#### 파일 생성: `src/server/services/storage/SessionStorageService.ts`

```typescript
/**
 * SessionStorageService.ts
 *
 * 세션 데이터 저장 및 복원
 */

interface StorageAdapter {
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
  delete(key: string): Promise<void>;
}

class SessionStorageService {
  constructor(private adapter: StorageAdapter) {}

  /**
   * Save game session
   */
  async saveSession(session: CasePlaySession): Promise<void> {
    const key = `session:${session.sessionId}`;
    await this.adapter.save(key, session);
  }

  /**
   * Load game session
   */
  async loadSession(sessionId: string): Promise<CasePlaySession | null> {
    const key = `session:${sessionId}`;
    return await this.adapter.load(key);
  }

  /**
   * Save player progress
   */
  async saveProgress(progress: PlayerProgress): Promise<void> {
    const key = `progress:${progress.userId}`;
    await this.adapter.save(key, progress);
  }

  /**
   * Auto-save session periodically
   */
  enableAutoSave(session: CasePlaySession, intervalMs: number = 30000) {
    const interval = setInterval(() => {
      this.saveSession(session);
    }, intervalMs);

    return () => clearInterval(interval);
  }
}
```

### 성과 목표

✅ 엔드투엔드 통합
✅ 로딩 상태 개선
✅ 에러 처리 강화
✅ 성능 최적화
✅ 접근성 개선
✅ 자동 저장 기능

---

## 🧪 Phase 6: Testing & Optimization

### 상태: PENDING ⏳
**예상 기간**: 1주

### 목표
종합 테스트 및 최종 최적화

### 6.1 단위 테스트

#### 파일 생성: `src/server/services/__tests__/EvidenceDiscoveryService.test.ts`

```typescript
describe('EvidenceDiscoveryService', () => {
  let service: EvidenceDiscoveryService;
  let mockPlayerState: PlayerEvidenceState;
  let mockEvidence: EvidenceItem[];

  beforeEach(() => {
    service = new EvidenceDiscoveryService();
    mockPlayerState = createMockPlayerState();
    mockEvidence = createMockEvidence();
  });

  describe('searchLocation', () => {
    it('should discover evidence based on probabilities', async () => {
      const result = await service.searchLocation(
        {
          caseId: 'case-1',
          userId: 'user-1',
          locationId: 'loc-1',
          searchType: 'thorough',
        },
        mockDistribution,
        mockEvidence,
        mockLocations,
        mockPlayerState
      );

      expect(result.success).toBe(true);
      expect(result.evidenceFound.length).toBeGreaterThanOrEqual(0);
    });

    it('should respect Fair Play for critical evidence', async () => {
      // Critical evidence with thorough search should have >= 70% discovery rate
      const trials = 100;
      let discoveries = 0;

      for (let i = 0; i < trials; i++) {
        const result = await service.searchLocation(
          request,
          distribution,
          criticalEvidenceOnly,
          locations,
          mockPlayerState
        );
        if (result.evidenceFound.length > 0) discoveries++;
      }

      const discoveryRate = discoveries / trials;
      expect(discoveryRate).toBeGreaterThanOrEqual(0.7);
    });

    it('should not discover already found evidence', async () => {
      // Add evidence to player state
      mockPlayerState.discoveredEvidence.push({
        evidenceId: 'ev-1',
        discoveredAt: new Date(),
        discoveryMethod: 'quick',
        locationId: 'loc-1',
      });

      const result = await service.searchLocation(
        request,
        distribution,
        mockEvidence,
        locations,
        mockPlayerState
      );

      expect(result.evidenceFound.every((e) => e.id !== 'ev-1')).toBe(true);
    });
  });
});
```

### 6.2 통합 테스트

#### 파일 생성: `src/__tests__/integration/evidenceSystem.test.ts`

```typescript
describe('Evidence System Integration', () => {
  it('should complete full evidence discovery flow', async () => {
    // 1. Generate case
    const caseData = await generateTestCase();

    // 2. Initialize player
    const playerState = playerStateService.initializeState(
      caseData.id,
      'test-user'
    );

    // 3. Search locations
    for (const location of caseData.locations) {
      const result = await evidenceDiscoveryService.searchLocation(
        {
          caseId: caseData.id,
          userId: 'test-user',
          locationId: location.id,
          searchType: 'thorough',
        },
        caseData.evidenceDistribution,
        caseData.evidence.translations.ko.items,
        caseData.locations,
        playerState
      );

      // Record discoveries
      playerState = playerStateService.recordDiscovery(
        playerState,
        result.evidenceFound,
        'thorough',
        location.id
      );
    }

    // 4. Validate Fair Play compliance
    const validation = fairPlayValidationService.validateEvidence(
      caseData.evidence
    );
    expect(validation.isValid).toBe(true);

    // 5. Check critical evidence found
    expect(playerState.stats.criticalEvidenceFound).toBeGreaterThanOrEqual(3);
  });

  it('should calculate correct scores', async () => {
    const playerState = createCompletedPlayerState();
    const scoreBreakdown = evidenceScoringService.calculateScore(
      playerState,
      10, // total evidence
      1200 // 20 minutes
    );

    expect(scoreBreakdown.totalScore).toBeGreaterThan(0);
    expect(scoreBreakdown.grade).toMatch(/S|A|B|C|D/);
  });
});
```

### 6.3 E2E 테스트

#### 파일 생성: `e2e/evidenceDiscovery.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Evidence Discovery Flow', () => {
  test('should allow player to discover evidence', async ({ page }) => {
    // 1. Start case
    await page.goto('/cases/test-case-1');
    await expect(page.locator('h1')).toContainText('케이스');

    // 2. Click first location
    await page.locator('[data-testid="location-card"]').first().click();

    // 3. Select search method
    await expect(page.locator('[data-testid="search-modal"]')).toBeVisible();
    await page.locator('[data-testid="search-thorough"]').click();
    await page.locator('[data-testid="confirm-search"]').click();

    // 4. Wait for results
    await expect(page.locator('[data-testid="evidence-modal"]')).toBeVisible();

    // 5. Check evidence discovered
    const evidenceCount = await page
      .locator('[data-testid="evidence-item"]')
      .count();
    expect(evidenceCount).toBeGreaterThanOrEqual(0);
  });

  test('should show completion rate', async ({ page }) => {
    await page.goto('/cases/test-case-1');

    // Search location
    await page.locator('[data-testid="location-card"]').first().click();
    await page.locator('[data-testid="search-thorough"]').click();
    await page.locator('[data-testid="confirm-search"]').click();
    await page.locator('[data-testid="close-evidence-modal"]').click();

    // Check completion rate
    const completionRate = await page
      .locator('[data-testid="location-card"]')
      .first()
      .locator('[data-testid="completion-rate"]')
      .textContent();

    expect(completionRate).toMatch(/\d+%/);
  });
});
```

### 6.4 성능 테스트

#### 파일 생성: `src/__tests__/performance/evidenceGeneration.perf.ts`

```typescript
describe('Evidence Generation Performance', () => {
  it('should generate evidence within reasonable time', async () => {
    const startTime = Date.now();

    await evidenceGeneratorService.generateEvidence(
      mockLocation,
      mockWeapon,
      mockMotive,
      mockSuspects,
      0,
      'perf-test-case'
    );

    const duration = Date.now() - startTime;

    // Should complete within 10 seconds
    expect(duration).toBeLessThan(10000);
  });

  it('should handle concurrent evidence generation', async () => {
    const promises = Array.from({ length: 5 }, (_, i) =>
      evidenceGeneratorService.generateEvidence(
        mockLocation,
        mockWeapon,
        mockMotive,
        mockSuspects,
        i % 3,
        `concurrent-case-${i}`
      )
    );

    const startTime = Date.now();
    await Promise.all(promises);
    const duration = Date.now() - startTime;

    // All 5 should complete within 30 seconds
    expect(duration).toBeLessThan(30000);
  });
});
```

### 6.5 사용자 테스트

#### 파일 생성: `docs/testing/USER_TESTING_PLAN.md`

```markdown
# 사용자 테스트 계획

## 목표
- Fair Play 원칙이 플레이어 경험에 미치는 영향 평가
- 3-tier 검색 시스템의 직관성 검증
- 증거 보드 사용성 평가

## 테스트 시나리오

### 시나리오 1: 첫 플레이
- 목표: 신규 플레이어가 시스템을 이해할 수 있는지
- 측정 지표:
  - 검색 방법 선택까지 걸린 시간
  - 첫 증거 발견까지 걸린 시간
  - 증거 보드 첫 사용까지 시간
  - 도움말 요청 횟수

### 시나리오 2: 케이스 완료
- 목표: 전체 플로우의 완성도 평가
- 측정 지표:
  - 케이스 완료 시간
  - 발견한 증거 비율
  - 정답 제출 성공률
  - 사용자 만족도 (1-5)

### 시나리오 3: 고급 기능
- 목표: 증거 연결 등 고급 기능 사용성
- 측정 지표:
  - 증거 연결 생성 횟수
  - 타임라인 뷰 사용 여부
  - 필터 기능 사용 횟수

## 성공 기준
- 90% 이상의 사용자가 첫 케이스를 30분 이내 완료
- 80% 이상의 사용자가 검색 방법을 이해
- 70% 이상의 사용자가 증거 보드를 활용
- 평균 만족도 4.0 이상
```

### 성과 목표

✅ 단위 테스트 커버리지 > 80%
✅ 통합 테스트 완료
✅ E2E 테스트 완료
✅ 성능 벤치마크 달성
✅ 사용자 테스트 완료
✅ 버그 수정 완료

---

## 📈 전체 마일스톤

### 완료된 마일스톤
- ✅ Phase 1: Core Evidence System (2025-10-20)

### 진행 예정 마일스톤
- ⏳ Phase 2: Image Generation (예상 2주)
- ⏳ Phase 3: Evidence Board (예상 1주)
- ⏳ Phase 4: Scoring System (예상 1주)
- ⏳ Phase 5: Integration (예상 1주)
- ⏳ Phase 6: Testing (예상 1주)

### 총 예상 완료일
**2025년 12월 초** (약 6-8주 후)

---

## 🎯 성공 지표

### 기술적 지표
- Fair Play 검증 통과율: 100%
- 3-Clue Rule 준수율: 100%
- Critical 증거 발견률 (thorough): ≥ 70%
- 테스트 커버리지: > 80%
- 평균 API 응답 시간: < 500ms
- 이미지 로딩 시간: < 2s

### 사용자 경험 지표
- 케이스 완료율: > 70%
- 평균 플레이 시간: 20-30분
- 사용자 만족도: ≥ 4.0/5.0
- 재방문율: > 50%
- 증거 보드 사용률: > 70%

### 비즈니스 지표
- 주간 활성 사용자 (WAU): 증가 추세
- 케이스 완료 후 재플레이율: > 30%
- 업적 해제 참여율: > 60%
- 평균 세션 길이: > 15분

---

## 📝 참고 문서

- **스킬 문서**: `skills/evidence-system-architect/SKILL.md`
- **타입 정의**: `src/shared/types/Evidence.ts`, `src/shared/types/Discovery.ts`
- **API 문서**: (Phase 5에서 생성 예정)
- **사용자 가이드**: (Phase 6에서 생성 예정)

---

**문서 끝**
