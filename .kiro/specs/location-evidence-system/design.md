# 장소 탐색 및 증거 수집 시스템 설계

## 개요

이 문서는 장소 탐색과 증거 수집 시스템의 상세 설계를 다룹니다. 현재 게임 생성 프로세스를 확장하여 4개의 탐색 가능한 장소와 10-15개의 증거를 생성하고, 모든 요소에 지브리 스타일 이미지를 추가합니다.

**설계 원칙**:
1. **Fair Play**: 모든 증거가 플레이어에게 접근 가능
2. **Three Clue Rule**: 각 용의자당 최소 3개의 독립적 단서
3. **Gumshoe 원칙**: 찾기는 쉽게, 해석은 어렵게
4. **비선형 조사**: 플레이어가 순서 선택 가능
5. **80-90점 품질**: Over-engineering 없이 탄탄한 기본기

---

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                    게임 생성 시스템 (확장)                     │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
   │ 요소 선택 │        │ 스토리   │        │ 이미지   │
   │(결정론적)│        │ 생성     │        │ 생성     │
   │         │        │(비결정론적)│       │(비동기)  │
   └────┬────┘        └────┬────┘        └────┬────┘
        │                  │                  │
        │                  │                  │
   ┌────▼──────────────────▼──────────────────▼────┐
   │           확장된 데이터 구조                    │
   │                                                │
   │  - 기존: 무기, 동기, 장소(1개), 용의자(3명)     │
   │  - 추가: 탐색 장소(4개), 증거(10-15개)         │
   │  - 이미지: 용의자, 장소, 증거 모두 포함         │
   └─────────────────────────────────────────────────┘
```

---

## 데이터 모델 설계

### 1. Location (장소)

```typescript
interface Location {
  id: string;                    // 고유 ID (예: "loc-study", "loc-garden")
  name: string;                  // 장소 이름 (예: "밀실 서재")
  description: string;           // 상세 설명
  imageUrl: string;              // 지브리 스타일 이미지 URL
  evidenceIds: string[];         // 이 장소에서 발견 가능한 증거 ID 목록
  isMainLocation: boolean;       // 대표 장소 여부 (1개만 true)
  accessibleFrom?: string[];     // 접근 가능한 다른 장소 (선택적)
}
```

**생성 규칙**:
- 총 5개 장소 생성 (대표 1개 + 탐색 가능 4개)
- 각 장소는 2-4개의 증거 포함
- 장소 간 논리적 연결 (예: 서재 → 복도 → 정원)

### 2. Evidence (증거)

```typescript
interface Evidence {
  id: string;                    // 고유 ID (예: "ev-poison-bottle")
  name: string;                  // 증거 이름 (예: "독극물 병")
  description: string;           // 상세 설명
  imageUrl: string;              // 지브리 스타일 이미지 URL
  locationId: string;            // 발견 장소 ID
  relatedSuspects: string[];     // 연관된 용의자 ID 목록
  suspicionLevel: 'high' | 'medium' | 'low';  // 의심 수준
  isRedHerring: boolean;         // 허위 단서 여부
  clueType: 'physical' | 'document' | 'testimony' | 'digital';
  discoveredAt?: number;         // 발견 시각 (타임스탬프)
}
```

**생성 규칙**:
- 총 10-15개 증거 생성
- Three Clue Rule 준수:
  - 진범에게 불리한 증거: 3-5개 (high suspicion)
  - 다른 용의자에게 불리한 증거: 각 2-3개 (medium/low)
- Red Herring: 2-3개 (의미 있는 허위 단서)
- 증거 타입 분배:
  - Physical: 40% (물리적 증거)
  - Document: 30% (문서)
  - Testimony: 20% (증언)
  - Digital: 10% (디지털)

### 3. Suspect (용의자 - 확장)

```typescript
interface Suspect {
  // 기존 필드
  id: string;
  name: string;
  background: string;
  personality: string;
  isGuilty: boolean;
  
  // 추가 필드
  profileImageUrl: string;       // 프로필 사진 URL
  relatedEvidenceIds: string[];  // 관련 증거 ID 목록
}
```


---

## 컴포넌트 설계

### 백엔드 컴포넌트

#### 1. LocationGenerator (장소 생성기)

**책임**: 스토리에 맞는 탐색 가능한 장소 생성

```typescript
class LocationGenerator {
  /**
   * 장소 생성
   * @param context - 게임 컨텍스트 (무기, 동기, 대표 장소)
   * @param seed - 날짜 시드
   * @returns 5개 장소 (대표 1개 + 탐색 가능 4개)
   */
  async generateLocations(
    context: GameContext,
    seed: number
  ): Promise<Location[]> {
    // 1. 대표 장소 (기존 시스템에서 선택된 것)
    const mainLocation = this.createMainLocation(context.location);
    
    // 2. 탐색 가능한 장소 4개 생성 (AI 사용)
    const explorableLocations = await this.generateExplorableLocations(
      context,
      seed
    );
    
    return [mainLocation, ...explorableLocations];
  }
  
  private async generateExplorableLocations(
    context: GameContext,
    seed: number
  ): Promise<Location[]> {
    const prompt = `
당신은 탐정 소설 작가입니다.

배경 설정:
- 대표 장소: ${context.location}
- 무기: ${context.weapon}
- 시대/분위기: ${context.era}

다음 4개의 탐색 가능한 장소를 생성하세요:
1. 각 장소는 대표 장소와 논리적으로 연결
2. 각 장소는 고유한 특징과 분위기
3. 증거가 숨겨질 만한 디테일 포함

응답 형식: JSON
[
  {
    "id": "loc-hallway",
    "name": "복도",
    "description": "어두운 복도...",
    "connectedTo": ["loc-study", "loc-garden"]
  },
  ...
]
    `;
    
    const response = await this.geminiClient.generateContent(prompt);
    return this.parseLocations(response);
  }
}
```

#### 2. EvidenceGenerator (증거 생성기)

**책임**: Three Clue Rule을 준수하는 증거 생성

```typescript
class EvidenceGenerator {
  /**
   * 증거 생성
   * @param suspects - 용의자 목록
   * @param locations - 장소 목록
   * @param solution - 해결책 (진범 정보)
   * @returns 10-15개 증거
   */
  async generateEvidence(
    suspects: Suspect[],
    locations: Location[],
    solution: Solution
  ): Promise<Evidence[]> {
    // 1. 진범에게 불리한 증거 3-5개
    const guiltyEvidence = await this.generateGuiltyEvidence(
      solution,
      locations,
      3 // 최소 3개
    );
    
    // 2. 다른 용의자에게 불리한 증거 (미스디렉션)
    const innocentEvidence = await this.generateInnocentEvidence(
      suspects.filter(s => !s.isGuilty),
      locations,
      2 // 각 용의자당 2개
    );
    
    // 3. Red Herring 2-3개
    const redHerrings = await this.generateRedHerrings(
      locations,
      2
    );
    
    // 4. 증거를 장소에 분배
    const allEvidence = [
      ...guiltyEvidence,
      ...innocentEvidence,
      ...redHerrings
    ];
    
    return this.distributeEvidenceToLocations(allEvidence, locations);
  }
  
  private async generateGuiltyEvidence(
    solution: Solution,
    locations: Location[],
    minCount: number
  ): Promise<Evidence[]> {
    const prompt = `
진범: ${solution.who}
범행 방법: ${solution.how}
동기: ${solution.why}

진범에게 불리한 증거 ${minCount}개를 생성하세요:
- 각 증거는 독립적으로 진범을 가리킴
- 다양한 타입 (physical, document, testimony)
- 발견 가능하지만 미묘함

응답 형식: JSON
    `;
    
    const response = await this.geminiClient.generateContent(prompt);
    return this.parseEvidence(response, 'high');
  }
}
```

#### 3. ImageGenerator (이미지 생성기)

**책임**: 지브리 스타일 이미지 생성

```typescript
class ImageGenerator {
  private readonly GHIBLI_STYLE_PREFIX = `
Studio Ghibli anime style, soft watercolor aesthetic,
warm lighting, hand-drawn animation quality,
whimsical yet mysterious atmosphere,
suitable for murder mystery game,
  `.trim();
  
  /**
   * 용의자 프로필 이미지 생성
   */
  async generateSuspectImage(suspect: Suspect): Promise<string> {
    const prompt = `
${this.GHIBLI_STYLE_PREFIX}
portrait of ${suspect.name}:
- ${suspect.personality}
- ${suspect.background}
- facial expression showing character
- close-up portrait style
    `;
    
    return await this.geminiClient.generateImage(prompt);
  }
  
  /**
   * 장소 이미지 생성
   */
  async generateLocationImage(location: Location): Promise<string> {
    const prompt = `
${this.GHIBLI_STYLE_PREFIX}
${location.name}:
- ${location.description}
- explorable space with details
- places where evidence could be hidden
- atmospheric lighting
    `;
    
    return await this.geminiClient.generateImage(prompt);
  }
  
  /**
   * 증거 이미지 생성
   */
  async generateEvidenceImage(evidence: Evidence): Promise<string> {
    const prompt = `
${this.GHIBLI_STYLE_PREFIX}
close-up of ${evidence.name}:
- ${evidence.description}
- clear details and features
- ${evidence.clueType} evidence type
- emphasize important characteristics
    `;
    
    return await this.geminiClient.generateImage(prompt);
  }
  
  /**
   * 모든 이미지 생성 (병렬 처리)
   */
  async generateAllImages(
    suspects: Suspect[],
    locations: Location[],
    evidence: Evidence[]
  ): Promise<void> {
    const tasks = [
      ...suspects.map(s => this.generateSuspectImage(s)),
      ...locations.map(l => this.generateLocationImage(l)),
      ...evidence.map(e => this.generateEvidenceImage(e))
    ];
    
    const results = await Promise.allSettled(tasks);
    
    // 결과 매핑 및 에러 처리
    this.mapImagesToEntities(results, suspects, locations, evidence);
  }
}
```


### 프론트엔드 컴포넌트

#### 1. LocationExplorer (장소 탐색 컴포넌트)

**책임**: 장소 목록 및 상세 화면 표시

```typescript
// src/client/components/LocationExplorer.tsx
interface LocationExplorerProps {
  locations: Location[];
  onEvidenceCollect: (evidenceId: string) => void;
  collectedEvidenceIds: string[];
}

function LocationExplorer({
  locations,
  onEvidenceCollect,
  collectedEvidenceIds
}: LocationExplorerProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  
  return (
    <div className="location-explorer">
      {!selectedLocation ? (
        // 장소 목록 화면
        <LocationGrid
          locations={locations}
          onSelect={setSelectedLocation}
        />
      ) : (
        // 장소 상세 화면
        <LocationDetail
          location={selectedLocation}
          onBack={() => setSelectedLocation(null)}
          onEvidenceCollect={onEvidenceCollect}
          collectedEvidenceIds={collectedEvidenceIds}
        />
      )}
    </div>
  );
}
```

**하위 컴포넌트**:

```typescript
// LocationGrid - 장소 카드 그리드
function LocationGrid({ locations, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {locations.map(location => (
        <LocationCard
          key={location.id}
          location={location}
          onClick={() => onSelect(location)}
        />
      ))}
    </div>
  );
}

// LocationCard - 개별 장소 카드
function LocationCard({ location, onClick }) {
  const undiscoveredCount = location.evidenceIds.filter(
    id => !collectedEvidenceIds.includes(id)
  ).length;
  
  return (
    <div className="location-card" onClick={onClick}>
      <img src={location.imageUrl} alt={location.name} />
      <h3>{location.name}</h3>
      <p>{location.description.substring(0, 100)}...</p>
      <div className="evidence-count">
        🔍 {undiscoveredCount} / {location.evidenceIds.length}
      </div>
    </div>
  );
}

// LocationDetail - 장소 상세 화면
function LocationDetail({
  location,
  onBack,
  onEvidenceCollect,
  collectedEvidenceIds
}) {
  return (
    <div className="location-detail">
      <button onClick={onBack}>← 뒤로</button>
      <img src={location.imageUrl} alt={location.name} className="large" />
      <h2>{location.name}</h2>
      <p>{location.description}</p>
      
      <h3>발견 가능한 증거</h3>
      <EvidenceList
        evidenceIds={location.evidenceIds}
        onCollect={onEvidenceCollect}
        collectedIds={collectedEvidenceIds}
      />
    </div>
  );
}
```

#### 2. EvidenceNotebook (증거 노트북 컴포넌트)

**책임**: 수집한 증거 관리 및 표시

```typescript
// src/client/components/EvidenceNotebook.tsx
interface EvidenceNotebookProps {
  evidence: Evidence[];
  collectedIds: string[];
  suspects: Suspect[];
}

function EvidenceNotebook({
  evidence,
  collectedIds,
  suspects
}: EvidenceNotebookProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('discovery');
  
  const collectedEvidence = evidence.filter(e => 
    collectedIds.includes(e.id)
  );
  
  const filteredEvidence = applyFilter(collectedEvidence, filter);
  const sortedEvidence = applySort(filteredEvidence, sortBy);
  
  return (
    <div className="evidence-notebook">
      {!selectedEvidence ? (
        <>
          <EvidenceFilters
            filter={filter}
            onFilterChange={setFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
          <EvidenceGrid
            evidence={sortedEvidence}
            onSelect={setSelectedEvidence}
          />
        </>
      ) : (
        <EvidenceDetail
          evidence={selectedEvidence}
          suspects={suspects}
          onBack={() => setSelectedEvidence(null)}
        />
      )}
    </div>
  );
}
```

**하위 컴포넌트**:

```typescript
// EvidenceGrid - 증거 그리드
function EvidenceGrid({ evidence, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {evidence.map(ev => (
        <EvidenceCard
          key={ev.id}
          evidence={ev}
          onClick={() => onSelect(ev)}
        />
      ))}
    </div>
  );
}

// EvidenceCard - 개별 증거 카드
function EvidenceCard({ evidence, onClick }) {
  return (
    <div className="evidence-card" onClick={onClick}>
      <img src={evidence.imageUrl} alt={evidence.name} />
      <h4>{evidence.name}</h4>
      <div className="evidence-meta">
        <span className="location">📍 {evidence.locationId}</span>
        <span className="type">{evidence.clueType}</span>
      </div>
      {evidence.relatedSuspects.length > 0 && (
        <div className="related-suspects">
          {evidence.relatedSuspects.map(suspectId => (
            <SuspectIcon key={suspectId} suspectId={suspectId} />
          ))}
        </div>
      )}
    </div>
  );
}

// EvidenceDetail - 증거 상세 화면
function EvidenceDetail({ evidence, suspects, onBack }) {
  return (
    <div className="evidence-detail">
      <button onClick={onBack}>← 뒤로</button>
      <img src={evidence.imageUrl} alt={evidence.name} className="large" />
      <h2>{evidence.name}</h2>
      <p>{evidence.description}</p>
      
      <div className="evidence-info">
        <div>📍 발견 장소: {evidence.locationId}</div>
        <div>🔍 증거 타입: {evidence.clueType}</div>
        <div>⚠️ 의심 수준: {evidence.suspicionLevel}</div>
      </div>
      
      {evidence.relatedSuspects.length > 0 && (
        <div className="related-suspects-detail">
          <h3>연관된 용의자</h3>
          {evidence.relatedSuspects.map(suspectId => {
            const suspect = suspects.find(s => s.id === suspectId);
            return (
              <SuspectCard key={suspectId} suspect={suspect} />
            );
          })}
        </div>
      )}
    </div>
  );
}
```

#### 3. SuspectProfile (용의자 프로필 - 개선)

**책임**: 프로필 사진 포함 용의자 정보 표시

```typescript
// src/client/components/SuspectProfile.tsx
interface SuspectProfileProps {
  suspect: Suspect;
  relatedEvidence: Evidence[];
  onEvidenceClick: (evidenceId: string) => void;
}

function SuspectProfile({
  suspect,
  relatedEvidence,
  onEvidenceClick
}: SuspectProfileProps) {
  return (
    <div className="suspect-profile">
      <div className="profile-header">
        <img
          src={suspect.profileImageUrl}
          alt={suspect.name}
          className="profile-image"
        />
        <div className="profile-info">
          <h2>{suspect.name}</h2>
          <p className="background">{suspect.background}</p>
          <p className="personality">{suspect.personality}</p>
        </div>
      </div>
      
      {relatedEvidence.length > 0 && (
        <div className="related-evidence">
          <h3>관련 증거</h3>
          <div className="evidence-list">
            {relatedEvidence.map(evidence => (
              <EvidenceThumbnail
                key={evidence.id}
                evidence={evidence}
                onClick={() => onEvidenceClick(evidence.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```


---

## 데이터 흐름

### 1. 게임 생성 플로우 (백엔드)

```
┌─────────────────────────────────────────────────────────────┐
│                    게임 생성 시작                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 1: 기존 요소 선택 (결정론적)                             │
│ - 무기, 동기, 대표 장소, 용의자 원형                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: 스토리 생성 (비결정론적)                              │
│ - 피해자, 용의자 3명, 해결책                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: 장소 생성 (NEW)                                      │
│ - LocationGenerator.generateLocations()                      │
│ - 대표 장소 1개 + 탐색 가능 장소 4개                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: 증거 생성 (NEW)                                      │
│ - EvidenceGenerator.generateEvidence()                       │
│ - 진범 증거 3-5개 + 다른 용의자 증거 + Red Herring 2-3개     │
│ - Three Clue Rule 검증                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: 이미지 생성 (NEW - 비동기)                            │
│ - ImageGenerator.generateAllImages()                         │
│ - 용의자 프로필 (3-4개)                                       │
│ - 장소 이미지 (5개)                                           │
│ - 증거 이미지 (10-15개)                                       │
│ - 병렬 처리, 실패 시 플레이스홀더                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 6: 데이터 저장                                           │
│ - CaseRepository.createCase()                                │
│ - 모든 데이터 (장소, 증거, 이미지 URL 포함)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    게임 생성 완료                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. 플레이어 상호작용 플로우 (프론트엔드)

```
┌─────────────────────────────────────────────────────────────┐
│                    게임 시작                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 메인 메뉴                                                     │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│ │ 용의자 대화  │ 장소 탐색    │ 증거 노트북  │ 추리 제출    │  │
│ └─────────────┴─────────────┴─────────────┴─────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         │              │              │              │
         ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 용의자 목록   │ │ 장소 목록     │ │ 수집한 증거   │ │ 추리 양식     │
│ (프로필 사진) │ │ (장소 이미지) │ │ (증거 이미지) │ │ (증거 선택)   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
         │              │              │              │
         ▼              ▼              │              │
┌──────────────┐ ┌──────────────┐    │              │
│ 대화 화면     │ │ 장소 상세     │    │              │
│ (AI 채팅)    │ │ (증거 발견)   │    │              │
└──────────────┘ └──────────────┘    │              │
                        │              │              │
                        ▼              │              │
                 ┌──────────────┐    │              │
                 │ 증거 수집     │────┘              │
                 │ (인벤토리 추가)│                   │
                 └──────────────┘                   │
                                                    ▼
                                          ┌──────────────┐
                                          │ 추리 제출     │
                                          │ (정답 확인)   │
                                          └──────────────┘
```

---

## 인터페이스 및 API

### 백엔드 API

#### 1. 게임 생성 API (확장)

```typescript
// POST /api/generate-case
interface GenerateCaseRequest {
  date?: string;  // 선택적, 기본값: 오늘
}

interface GenerateCaseResponse {
  caseId: string;
  date: string;
  victim: Victim;
  weapon: Weapon;
  motive: Motive;
  suspects: Suspect[];  // profileImageUrl 포함
  locations: Location[];  // 5개 (대표 1개 + 탐색 4개)
  evidence: Evidence[];  // 10-15개
  solution: Solution;
  generatedAt: number;
}
```

#### 2. 증거 수집 API (NEW)

```typescript
// POST /api/collect-evidence
interface CollectEvidenceRequest {
  caseId: string;
  evidenceId: string;
  userId: string;
}

interface CollectEvidenceResponse {
  success: boolean;
  evidence: Evidence;
  collectedAt: number;
}
```

#### 3. 플레이어 진행 상황 API (NEW)

```typescript
// GET /api/player-progress/:caseId/:userId
interface PlayerProgressResponse {
  caseId: string;
  userId: string;
  collectedEvidenceIds: string[];
  visitedLocationIds: string[];
  conversationHistory: ConversationMessage[];
  submittedSolution?: SubmittedSolution;
}
```

### 프론트엔드 상태 관리

```typescript
// 게임 상태
interface GameState {
  case: GeneratedCase | null;
  collectedEvidenceIds: string[];
  visitedLocationIds: string[];
  selectedTab: 'suspects' | 'locations' | 'evidence' | 'solution';
  loading: boolean;
  error: string | null;
}

// 액션
type GameAction =
  | { type: 'LOAD_CASE'; payload: GeneratedCase }
  | { type: 'COLLECT_EVIDENCE'; payload: string }
  | { type: 'VISIT_LOCATION'; payload: string }
  | { type: 'CHANGE_TAB'; payload: GameState['selectedTab'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string };
```

---

## 에러 처리 전략

### 1. 이미지 생성 실패

**문제**: Gemini API 이미지 생성 실패 또는 타임아웃

**해결책**:
```typescript
async function generateImageWithFallback(
  prompt: string,
  entityType: 'suspect' | 'location' | 'evidence'
): Promise<string> {
  try {
    const result = await geminiClient.generateImage(prompt);
    return result.imageUrl;
  } catch (error) {
    console.error(`이미지 생성 실패 (${entityType}):`, error);
    
    // 플레이스홀더 이미지 반환
    return getPlaceholderImage(entityType);
  }
}

function getPlaceholderImage(entityType: string): string {
  const placeholders = {
    suspect: '/images/placeholder-suspect.png',
    location: '/images/placeholder-location.png',
    evidence: '/images/placeholder-evidence.png'
  };
  
  return placeholders[entityType] || '/images/placeholder-default.png';
}
```

### 2. Three Clue Rule 검증 실패

**문제**: 생성된 증거가 Three Clue Rule을 만족하지 않음

**해결책**:
```typescript
function validateThreeClueRule(
  evidence: Evidence[],
  suspects: Suspect[]
): ValidationResult {
  const guiltyS suspect = suspects.find(s => s.isGuilty);
  if (!guiltySuspect) {
    return { valid: false, error: '진범이 없습니다' };
  }
  
  const guiltyEvidence = evidence.filter(e =>
    e.relatedSuspects.includes(guiltySuspect.id) &&
    e.suspicionLevel === 'high'
  );
  
  if (guiltyEvidence.length < 3) {
    return {
      valid: false,
      error: `진범 증거 부족: ${guiltyEvidence.length}/3`
    };
  }
  
  return { valid: true };
}

// 재생성 로직
async function generateEvidenceWithRetry(
  suspects: Suspect[],
  locations: Location[],
  solution: Solution,
  maxRetries: number = 3
): Promise<Evidence[]> {
  for (let i = 0; i < maxRetries; i++) {
    const evidence = await evidenceGenerator.generateEvidence(
      suspects,
      locations,
      solution
    );
    
    const validation = validateThreeClueRule(evidence, suspects);
    if (validation.valid) {
      return evidence;
    }
    
    console.warn(`재시도 ${i + 1}/${maxRetries}: ${validation.error}`);
  }
  
  throw new Error('Three Clue Rule 만족 실패');
}
```

### 3. 프론트엔드 로딩 상태

**문제**: 이미지 로딩 중 빈 화면

**해결책**:
```typescript
function ImageWithLoading({ src, alt, className }: ImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  return (
    <div className={`image-container ${className}`}>
      {loading && <LoadingSpinner />}
      {error && <PlaceholderImage />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        style={{ display: loading || error ? 'none' : 'block' }}
      />
    </div>
  );
}
```


---

## 테스팅 전략

### 1. 백엔드 테스트

#### 장소 생성 테스트
```typescript
describe('LocationGenerator', () => {
  it('should generate 5 locations (1 main + 4 explorable)', async () => {
    const locations = await locationGenerator.generateLocations(context, seed);
    
    expect(locations).toHaveLength(5);
    expect(locations.filter(l => l.isMainLocation)).toHaveLength(1);
    expect(locations.filter(l => !l.isMainLocation)).toHaveLength(4);
  });
  
  it('should assign evidence to locations', async () => {
    const locations = await locationGenerator.generateLocations(context, seed);
    
    locations.forEach(location => {
      expect(location.evidenceIds.length).toBeGreaterThanOrEqual(2);
      expect(location.evidenceIds.length).toBeLessThanOrEqual(4);
    });
  });
});
```

#### 증거 생성 테스트
```typescript
describe('EvidenceGenerator', () => {
  it('should satisfy Three Clue Rule', async () => {
    const evidence = await evidenceGenerator.generateEvidence(
      suspects,
      locations,
      solution
    );
    
    const validation = validateThreeClueRule(evidence, suspects);
    expect(validation.valid).toBe(true);
  });
  
  it('should generate 10-15 evidence items', async () => {
    const evidence = await evidenceGenerator.generateEvidence(
      suspects,
      locations,
      solution
    );
    
    expect(evidence.length).toBeGreaterThanOrEqual(10);
    expect(evidence.length).toBeLessThanOrEqual(15);
  });
  
  it('should include 2-3 red herrings', async () => {
    const evidence = await evidenceGenerator.generateEvidence(
      suspects,
      locations,
      solution
    );
    
    const redHerrings = evidence.filter(e => e.isRedHerring);
    expect(redHerrings.length).toBeGreaterThanOrEqual(2);
    expect(redHerrings.length).toBeLessThanOrEqual(3);
  });
});
```

#### 이미지 생성 테스트
```typescript
describe('ImageGenerator', () => {
  it('should generate images with Ghibli style', async () => {
    const imageUrl = await imageGenerator.generateSuspectImage(suspect);
    
    expect(imageUrl).toBeTruthy();
    expect(imageUrl).toMatch(/^data:image|^https?:\/\//);
  });
  
  it('should handle generation failures gracefully', async () => {
    // Mock API failure
    jest.spyOn(geminiClient, 'generateImage').mockRejectedValue(new Error('API Error'));
    
    const imageUrl = await imageGenerator.generateSuspectImage(suspect);
    
    // Should return placeholder
    expect(imageUrl).toContain('placeholder');
  });
});
```

### 2. 프론트엔드 테스트

#### 장소 탐색 컴포넌트 테스트
```typescript
describe('LocationExplorer', () => {
  it('should display all locations', () => {
    render(<LocationExplorer locations={mockLocations} />);
    
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });
  
  it('should show location detail on click', () => {
    render(<LocationExplorer locations={mockLocations} />);
    
    fireEvent.click(screen.getByText('밀실 서재'));
    
    expect(screen.getByText('발견 가능한 증거')).toBeInTheDocument();
  });
});
```

#### 증거 수집 테스트
```typescript
describe('EvidenceNotebook', () => {
  it('should display collected evidence', () => {
    render(
      <EvidenceNotebook
        evidence={mockEvidence}
        collectedIds={['ev-1', 'ev-2']}
      />
    );
    
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });
  
  it('should filter evidence by location', () => {
    render(<EvidenceNotebook evidence={mockEvidence} />);
    
    fireEvent.click(screen.getByText('장소별'));
    fireEvent.click(screen.getByText('밀실 서재'));
    
    // Only evidence from study should be shown
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });
});
```

### 3. 통합 테스트

```typescript
describe('Full Game Flow', () => {
  it('should generate complete game with all elements', async () => {
    const game = await caseGenerator.generateCase({ date: '2025-01-15' });
    
    // 기본 요소
    expect(game.victim).toBeDefined();
    expect(game.suspects).toHaveLength(3);
    expect(game.weapon).toBeDefined();
    
    // 새 요소
    expect(game.locations).toHaveLength(5);
    expect(game.evidence.length).toBeGreaterThanOrEqual(10);
    
    // 이미지
    game.suspects.forEach(s => {
      expect(s.profileImageUrl).toBeTruthy();
    });
    game.locations.forEach(l => {
      expect(l.imageUrl).toBeTruthy();
    });
    game.evidence.forEach(e => {
      expect(e.imageUrl).toBeTruthy();
    });
    
    // Three Clue Rule
    const validation = validateThreeClueRule(game.evidence, game.suspects);
    expect(validation.valid).toBe(true);
  });
});
```

---

## 성능 최적화

### 1. 이미지 생성 최적화

**병렬 처리**:
```typescript
async function generateAllImages(
  suspects: Suspect[],
  locations: Location[],
  evidence: Evidence[]
): Promise<void> {
  // 배치 크기 제한 (동시 요청 5개)
  const BATCH_SIZE = 5;
  
  const allTasks = [
    ...suspects.map(s => () => this.generateSuspectImage(s)),
    ...locations.map(l => () => this.generateLocationImage(l)),
    ...evidence.map(e => () => this.generateEvidenceImage(e))
  ];
  
  // 배치 단위로 처리
  for (let i = 0; i < allTasks.length; i += BATCH_SIZE) {
    const batch = allTasks.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(batch.map(task => task()));
  }
}
```

**캐싱**:
```typescript
// 같은 프롬프트는 캐시된 이미지 재사용
const imageCache = new Map<string, string>();

async function generateImageWithCache(prompt: string): Promise<string> {
  const cacheKey = hashPrompt(prompt);
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }
  
  const imageUrl = await geminiClient.generateImage(prompt);
  imageCache.set(cacheKey, imageUrl);
  
  return imageUrl;
}
```

### 2. 프론트엔드 최적화

**Lazy Loading**:
```typescript
function LocationGrid({ locations }: LocationGridProps) {
  return (
    <div className="grid">
      {locations.map(location => (
        <LazyLoad key={location.id} height={200} offset={100}>
          <LocationCard location={location} />
        </LazyLoad>
      ))}
    </div>
  );
}
```

**이미지 최적화**:
```typescript
// 썸네일과 원본 분리
interface OptimizedImage {
  thumbnail: string;  // 200x200px
  full: string;       // 800x600px
}

// 썸네일 먼저 로드, 클릭 시 원본 로드
function EvidenceCard({ evidence }: EvidenceCardProps) {
  const [showFull, setShowFull] = useState(false);
  
  return (
    <div onClick={() => setShowFull(true)}>
      <img
        src={showFull ? evidence.imageUrl : evidence.thumbnailUrl}
        alt={evidence.name}
      />
    </div>
  );
}
```

---

## 보안 고려사항

### 1. 이미지 생성 프롬프트 검증

```typescript
function sanitizePrompt(prompt: string): string {
  // 부적절한 키워드 필터링
  const blockedKeywords = ['explicit', 'violent', 'gore', ...];
  
  for (const keyword of blockedKeywords) {
    if (prompt.toLowerCase().includes(keyword)) {
      throw new Error(`부적절한 프롬프트: ${keyword}`);
    }
  }
  
  return prompt;
}
```

### 2. 플레이어 진행 상황 검증

```typescript
// 증거 수집 시 유효성 검증
async function collectEvidence(
  caseId: string,
  evidenceId: string,
  userId: string
): Promise<void> {
  // 1. 케이스 존재 확인
  const caseData = await CaseRepository.getCaseById(caseId);
  if (!caseData) {
    throw new Error('케이스를 찾을 수 없습니다');
  }
  
  // 2. 증거 존재 확인
  const evidence = caseData.evidence.find(e => e.id === evidenceId);
  if (!evidence) {
    throw new Error('증거를 찾을 수 없습니다');
  }
  
  // 3. 중복 수집 방지
  const progress = await getPlayerProgress(caseId, userId);
  if (progress.collectedEvidenceIds.includes(evidenceId)) {
    throw new Error('이미 수집한 증거입니다');
  }
  
  // 4. 수집 기록
  await recordEvidenceCollection(caseId, userId, evidenceId);
}
```

---

## 배포 및 모니터링

### 1. 배포 체크리스트

- [ ] 환경 변수 설정 (GEMINI_API_KEY, VERCEL_IMAGE_FUNCTION_URL)
- [ ] 이미지 플레이스홀더 파일 준비
- [ ] 데이터베이스 마이그레이션 (Location, Evidence 테이블)
- [ ] API 엔드포인트 테스트
- [ ] 프론트엔드 빌드 및 배포
- [ ] 성능 테스트 (이미지 생성 시간)
- [ ] 에러 모니터링 설정

### 2. 모니터링 지표

```typescript
// 게임 생성 메트릭
interface GameGenerationMetrics {
  totalTime: number;           // 전체 생성 시간
  locationGenerationTime: number;
  evidenceGenerationTime: number;
  imageGenerationTime: number;
  imageGenerationSuccessRate: number;
  threeClueRuleValidationRate: number;
}

// 플레이어 행동 메트릭
interface PlayerBehaviorMetrics {
  averageEvidenceCollected: number;
  averageLocationsVisited: number;
  averageTimeToSolution: number;
  solutionAccuracyRate: number;
}
```

---

## 마이그레이션 계획

### Phase 1: 백엔드 구현 (1주)
1. LocationGenerator 구현
2. EvidenceGenerator 구현
3. ImageGenerator 통합
4. Three Clue Rule 검증
5. 테스트 작성

### Phase 2: 프론트엔드 구현 (1주)
1. LocationExplorer 컴포넌트
2. EvidenceNotebook 컴포넌트
3. SuspectProfile 개선
4. 상태 관리 통합
5. UI/UX 테스트

### Phase 3: 통합 및 테스트 (3일)
1. 백엔드-프론트엔드 통합
2. 전체 게임 플로우 테스트
3. 성능 최적화
4. 버그 수정

### Phase 4: 배포 및 모니터링 (2일)
1. 프로덕션 배포
2. 모니터링 설정
3. 사용자 피드백 수집
4. 개선 사항 반영

---

## 참고 문서

- `docs2.md/MURDER_MYSTERY_MASTER_GUIDE.md` - 핵심 원칙
- `docs2.md/GAME_GENERATION_PROCESS.md` - 현재 프로세스
- `scripts/test-image-generation.ts` - 이미지 생성 로직
- `.kiro/specs/location-evidence-system/requirements.md` - 요구사항

---

**설계 버전**: 1.0  
**작성일**: 2025-01-15  
**상태**: 검토 대기
