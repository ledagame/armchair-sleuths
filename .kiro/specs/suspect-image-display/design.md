# 용의자 이미지 표시 기능 Design

## Overview

용의자 이미지를 클라이언트 UI에 표시하고, Redis 데이터 중복 문제를 해결하는 시스템을 설계합니다.

## Architecture

### Data Flow

```
[Image Generation Service]
         ↓
    [Redis Storage]
         ↓
   [API Endpoint]
         ↓
  [Client Component]
         ↓
    [User Browser]
```

### Component Diagram

```
┌─────────────────────────────────────────┐
│         Client Layer                     │
│  ┌────────────────────────────────┐    │
│  │   SuspectPanel Component       │    │
│  │   - Display images             │    │
│  │   - Handle loading states      │    │
│  │   - Fallback UI                │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│         Server Layer                     │
│  ┌────────────────────────────────┐    │
│  │   Suspect API Service          │    │
│  │   - Fetch suspect data         │    │
│  │   - Include imageUrl           │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │   Case Generation Service      │    │
│  │   - Clear old data             │    │
│  │   - Generate images            │    │
│  │   - Save to Redis              │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│         Data Layer                       │
│  ┌────────────────────────────────┐    │
│  │   Redis Storage                │    │
│  │   - case:${caseId}:suspects    │    │
│  │   - suspect:${suspectId}       │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Type Definitions

#### Client Types (`src/client/types/index.ts`)

```typescript
export interface Suspect {
  id: string;
  caseId: string;
  name: string;
  archetype: string;
  background: string;
  personality: string;
  emotionalState: EmotionalState;
  imageUrl?: string; // 🆕 추가
}
```

#### Server Types (Shared with Client)

```typescript
// Same as client types - ensure consistency
```

### 2. Redis Data Structure 및 중복 문제

#### 현재 문제 상황
```
# 로그에서 확인된 실제 상황
[DEVVIT] ✅ DevvitAdapter.sAdd: Added "case-2025-10-17-suspect-1" to set "case:case-2025-10-17:suspects" (now 5 members)
[DEVVIT] ✅ DevvitAdapter.sAdd: Added "case-2025-10-17-suspect-2" to set "case:case-2025-10-17:suspects" (now 6 members)
[DEVVIT] ✅ DevvitAdapter.sAdd: Added "case-2025-10-17-suspect-3" to set "case:case-2025-10-17:suspects" (now 7 members)

# 3명이어야 하는데 7명이 저장됨!
# 원인: 케이스 재생성 시 이전 데이터를 삭제하지 않음
```

#### 수정 후 구조
```
# 1. 케이스 재생성 시 먼저 삭제
DEL case:case-2025-10-17:suspects
DEL suspect:case-2025-10-17-suspect-1
DEL suspect:case-2025-10-17-suspect-2
DEL suspect:case-2025-10-17-suspect-3

# 2. 새 데이터 저장
case:case-2025-10-17:suspects = [
  "case-2025-10-17-suspect-1",
  "case-2025-10-17-suspect-2",
  "case-2025-10-17-suspect-3"
]

suspect:case-2025-10-17-suspect-1 = {
  id: "case-2025-10-17-suspect-1",
  name: "윤도현",
  profileImageUrl: "https://..." // 서버 측 필드명
  ...
}
```

### 3. KVStoreManager Update (핵심 수정)

#### Location: `src/server/services/repositories/kv/KVStoreManager.ts`

**문제**: `saveSuspect()`가 호출될 때마다 Set에 추가만 하고 삭제는 하지 않음

**해결책**: 케이스 저장 전에 기존 데이터 삭제

```typescript
// 🆕 새 메서드 추가
static async clearCaseData(caseId: string): Promise<void> {
  if (!this.adapter) {
    throw new Error('Storage adapter not initialized');
  }

  console.log(`🗑️ Clearing existing data for ${caseId}...`);

  // 1. 기존 용의자 ID 목록 가져오기
  const suspectSetKey = `case:${caseId}:suspects`;
  const existingSuspectIds = await this.adapter.sMembers(suspectSetKey);

  console.log(`   Found ${existingSuspectIds.length} existing suspects`);

  // 2. 각 용의자 데이터 삭제
  for (const suspectId of existingSuspectIds) {
    const suspectKey = `suspect:${suspectId}`;
    await this.adapter.del(suspectKey);
    console.log(`   Deleted suspect: ${suspectId}`);
  }

  // 3. 용의자 Set 삭제
  await this.adapter.del(suspectSetKey);
  console.log(`   Deleted suspect set: ${suspectSetKey}`);

  // 4. 케이스 데이터 삭제
  const caseKey = `case:${caseId}`;
  await this.adapter.del(caseKey);
  console.log(`   Deleted case: ${caseKey}`);

  console.log(`✅ Cleared all data for ${caseId}`);
}

// 기존 saveCase 메서드 수정
static async saveCase(caseData: CaseData): Promise<void> {
  if (!this.adapter) {
    throw new Error('Storage adapter not initialized');
  }

  // 🆕 저장 전에 기존 데이터 삭제
  await this.clearCaseData(caseData.id);

  // 케이스 저장
  const caseKey = `case:${caseData.id}`;
  await this.adapter.set(caseKey, JSON.stringify(caseData));

  // 날짜별 인덱스
  const dateKey = `date:${caseData.date}`;
  await this.adapter.set(dateKey, caseData.id);

  console.log(`✅ Case saved: ${caseData.id}`);
}
```

### 4. API Response 필드 매핑

#### Location: API 엔드포인트 (서버에서 클라이언트로 응답 시)

**문제**: 서버는 `profileImageUrl`을 사용하지만 클라이언트는 `imageUrl`을 기대함

**해결책**: API 응답 시 필드명 매핑

```typescript
// API 엔드포인트에서 응답 변환
app.get('/api/suspects/:caseId', async (c) => {
  const caseId = c.req.param('caseId');
  
  // KVStoreManager에서 용의자 데이터 가져오기
  const suspects = await KVStoreManager.getCaseSuspects(caseId);
  
  // 정확히 3명인지 검증
  if (suspects.length !== 3) {
    console.warn(`⚠️ Expected 3 suspects, got ${suspects.length} for ${caseId}`);
  }
  
  // 🆕 클라이언트 형식으로 변환 (profileImageUrl → imageUrl)
  const clientSuspects = suspects.slice(0, 3).map(suspect => ({
    id: suspect.id,
    caseId: suspect.caseId,
    name: suspect.name,
    archetype: suspect.archetype,
    background: suspect.background,
    personality: suspect.personality,
    emotionalState: suspect.emotionalState,
    imageUrl: suspect.profileImageUrl // 🆕 필드명 매핑
  }));
  
  return c.json({ suspects: clientSuspects });
});
```

### 5. SuspectPanel Component Update

#### Location: `src/client/components/suspect/SuspectPanel.tsx`

```typescript
export function SuspectPanel({ suspects, selectedSuspectId, onSelectSuspect }: SuspectPanelProps) {
  return (
    <div className="suspect-panel p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">🕵️ 용의자 심문</h2>
        <p className="text-gray-400">용의자를 선택하여 심문을 시작하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suspects.map((suspect) => {
          const isSelected = selectedSuspectId === suspect.id;

          return (
            <button
              key={suspect.id}
              onClick={() => onSelectSuspect(suspect.id)}
              className={`
                p-6 rounded-lg text-left transition-all
                transform hover:scale-105 active:scale-95
                ${
                  isSelected
                    ? 'bg-blue-600 border-4 border-blue-400 shadow-lg shadow-blue-500/50'
                    : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
                }
              `}
            >
              {/* 🆕 이미지 섹션 추가 */}
              <div className="mb-4">
                {suspect.imageUrl ? (
                  <img
                    src={suspect.imageUrl}
                    alt={suspect.name}
                    className="w-full h-48 object-cover rounded-lg"
                    loading="lazy"
                    onError={(e) => {
                      // 이미지 로드 실패 시 플레이스홀더
                      e.currentTarget.src = 'data:image/svg+xml,...'; // SVG placeholder
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-6xl">👤</span>
                  </div>
                )}
              </div>

              {/* 기존 UI */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{suspect.name}</h3>
                  <p className="text-sm text-gray-400">{suspect.archetype}</p>
                </div>
                <span className={`text-4xl ${getToneColor(suspect.emotionalState.tone)}`}>
                  {getToneEmoji(suspect.emotionalState.tone)}
                </span>
              </div>

              {/* ... 나머지 UI ... */}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

## Data Models

### Suspect Data Model

```typescript
interface Suspect {
  // 기존 필드
  id: string;
  caseId: string;
  name: string;
  archetype: string;
  background: string;
  personality: string;
  emotionalState: {
    suspicionLevel: number;
    tone: EmotionalTone;
  };
  
  // 🆕 새 필드
  imageUrl?: string; // Optional - 이미지 생성 실패 시 없을 수 있음
}
```

### Redis Storage Schema

```
Key Pattern: suspect:${caseId}-suspect-${index}
Value: JSON string of Suspect object

Key Pattern: case:${caseId}:suspects
Value: Set of suspect IDs
```

## Error Handling

### 1. 이미지 생성 실패

```typescript
try {
  const imageUrl = await this.imageService.generateSuspectImage(...);
  suspect.imageUrl = imageUrl;
} catch (error) {
  console.error(`Failed to generate image for ${suspect.name}:`, error);
  suspect.imageUrl = undefined; // 이미지 없이 진행
}
```

### 2. 이미지 로드 실패 (클라이언트)

```typescript
<img
  src={suspect.imageUrl}
  onError={(e) => {
    // Fallback to placeholder
    e.currentTarget.style.display = 'none';
    e.currentTarget.nextElementSibling.style.display = 'flex';
  }}
/>
<div className="fallback-placeholder" style={{ display: 'none' }}>
  👤
</div>
```

### 3. Redis 데이터 불일치

```typescript
const suspects = await this.getSuspects(caseId);

if (suspects.length !== 3) {
  console.error(`Data inconsistency: Expected 3 suspects, got ${suspects.length}`);
  // 케이스 재생성 트리거 또는 에러 반환
  throw new Error('Invalid suspect data');
}
```

## Testing Strategy

### Unit Tests

1. **Type Tests**: imageUrl 필드가 올바르게 정의되었는지 확인
2. **Redis Clear Tests**: clearExistingCaseData가 모든 데이터를 삭제하는지 확인
3. **Image Fallback Tests**: 이미지 로드 실패 시 플레이스홀더가 표시되는지 확인

### Integration Tests

1. **End-to-End Flow**: 케이스 생성 → 이미지 생성 → Redis 저장 → API 조회 → UI 표시
2. **Data Consistency**: Redis에 정확히 3명의 용의자만 저장되는지 확인
3. **Image URL Validation**: imageUrl이 유효한 형식인지 확인

### Manual Tests

1. **Visual Test**: 브라우저에서 용의자 이미지가 올바르게 표시되는지 확인
2. **Regeneration Test**: 케이스 재생성 시 이전 데이터가 정리되는지 확인
3. **Error Handling Test**: 이미지 URL이 잘못되었을 때 플레이스홀더가 표시되는지 확인

## Performance Considerations

### 1. 이미지 로딩 최적화

- Lazy loading 사용
- 적절한 이미지 크기 (최대 500KB)
- WebP 포맷 사용 (가능한 경우)

### 2. Redis 쿼리 최적화

- 배치 작업으로 여러 용의자 데이터 한 번에 조회
- 불필요한 Redis 호출 최소화

### 3. 클라이언트 렌더링 최적화

- 이미지 로딩 중 skeleton UI 표시
- 이미지 캐싱 활용

## Security Considerations

### 1. 이미지 URL 검증

```typescript
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && 
           (parsed.hostname.includes('imgur.com') || 
            parsed.hostname.includes('your-cdn.com'));
  } catch {
    return false;
  }
}
```

### 2. XSS 방지

- 이미지 URL을 직접 렌더링하지 않고 `<img>` 태그 사용
- 사용자 입력으로 imageUrl 설정 불가

## Migration Plan

### Phase 1: 타입 업데이트
1. Client types에 imageUrl 추가
2. Server types 동기화

### Phase 2: 서버 로직 수정
1. clearExistingCaseData 메서드 추가
2. 케이스 생성 시 데이터 정리 로직 추가
3. imageUrl 저장 로직 추가

### Phase 3: UI 업데이트
1. SuspectPanel에 이미지 표시 추가
2. 로딩 상태 및 에러 처리 추가

### Phase 4: 테스트 및 배포
1. 로컬 테스트
2. Devvit playtest 환경 테스트
3. 프로덕션 배포

---

**Design Version**: 1.0  
**Created**: 2025-01-18  
**Status**: Draft
