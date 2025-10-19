# Evidence Discovery Components

증거 발견 시스템을 위한 React UI 컴포넌트입니다.

## 컴포넌트 구조

### 1. LocationExplorer (메인 컨테이너)
장소 탐색 시스템의 메인 컨테이너 컴포넌트입니다.

**기능:**
- 4개의 장소 카드를 반응형 그리드로 표시
- 장소 검색 상호작용 관리
- 증거 발견 시 모달 표시
- 탐색한 장소 상태 추적
- 진행도 표시 (예: 2/4 장소 탐색 완료)

**Props:**
```typescript
interface LocationExplorerProps {
  caseId: string;
  locations: Array<{
    id: string;
    name: string;
    description: string;
    emoji: string;
  }>;
  onSearchLocation: (locationId: string) => Promise<SearchLocationResult>;
}
```

**사용 예시:**
```tsx
import { LocationExplorer } from '@/components/discovery';

function MyPage() {
  const handleSearchLocation = async (locationId: string) => {
    const response = await fetch(`/api/cases/${caseId}/search-location`, {
      method: 'POST',
      body: JSON.stringify({ locationId }),
    });
    return response.json();
  };

  return (
    <LocationExplorer
      caseId="case-123"
      locations={[
        {
          id: 'loc-1',
          name: '피해자의 집',
          description: '사건이 발생한 곳',
          emoji: '🏠',
        },
        {
          id: 'loc-2',
          name: '회사 사무실',
          description: '피해자가 일하던 곳',
          emoji: '🏢',
        },
        {
          id: 'loc-3',
          name: '공원',
          description: '마지막으로 목격된 장소',
          emoji: '🌳',
        },
        {
          id: 'loc-4',
          name: '카페',
          description: '자주 방문하던 장소',
          emoji: '☕',
        },
      ]}
      onSearchLocation={handleSearchLocation}
    />
  );
}
```

---

### 2. LocationCard (개별 장소 카드)
개별 장소를 표시하는 카드 컴포넌트입니다.

**기능:**
- 3가지 시각적 상태: 미탐색, 탐색 중, 탐색 완료
- 클릭하여 탐색 시작
- Framer Motion 호버/클릭 애니메이션
- 접근성 지원 (ARIA labels)

**Props:**
```typescript
interface LocationCardProps {
  location: {
    id: string;
    name: string;
    description: string;
    emoji: string;
  };
  isSearched: boolean;
  isSearching?: boolean;
  onSearch: (locationId: string) => void;
}
```

**시각적 상태:**
- **미탐색**: 회색 테두리, "탐색하기" 버튼
- **탐색 중**: 노란색 테두리, 로딩 애니메이션
- **탐색 완료**: 녹색 테두리, 체크마크 표시

---

### 3. EvidenceRevealCard (증거 발견 모달)
증거 발견 결과를 표시하는 모달 오버레이입니다.

**기능:**
- Fade in + Slide up 애니메이션
- 발견된 증거 카드 표시 (순차적 reveal 애니메이션)
- 발견 개수 표시 (예: "2개 증거 발견!")
- 증거 종류별 이모지 및 색상 구분
- 클릭 또는 ESC로 닫기

**Props:**
```typescript
interface EvidenceRevealCardProps {
  isOpen: boolean;
  evidenceFound: EvidenceItem[];
  location: {
    id: string;
    name: string;
  };
  onClose: () => void;
}
```

**증거 종류별 표시:**
- `physical`: 🔍 (물리적 증거)
- `testimony`: 💬 (증언)
- `financial`: 💰 (금융 기록)
- `communication`: 📱 (통신 기록)
- `alibi`: ⏰ (알리바이)
- `forensic`: 🔬 (법의학 분석)
- `documentary`: 📄 (문서)

**중요도별 색상:**
- `critical`: 빨간색 테두리 (핵심 증거)
- `important`: 노란색 테두리 (중요 증거)
- `minor`: 회색 테두리 (보조 증거)

---

## 디자인 토큰

**사용된 색상:**
- `detective-gold`: #f59e0b (강조색, 제목)
- `noir-charcoal`: #111827 (배경, 다크 테마)
- `gray-*`: Tailwind 기본 회색 팔레트

**애니메이션:**
- Framer Motion을 사용한 부드러운 전환
- 호버: scale(1.03)
- 클릭: scale(0.98)
- 모달: fade in + slide up
- 로딩: 회전 스피너 + 펄스 애니메이션

---

## 접근성 (Accessibility)

**ARIA 속성:**
- `aria-label`: 모든 인터랙티브 요소에 설명적 레이블
- `aria-disabled`: 비활성화된 버튼 상태 표시
- `aria-modal`: 모달 다이얼로그 식별
- `role="dialog"`: 모달 역할 명시

**키보드 네비게이션:**
- Tab: 장소 카드 간 이동
- Enter/Space: 장소 탐색 시작
- Esc: 모달 닫기

**시각적 피드백:**
- 호버 상태: 스케일 확대 및 색상 변경
- 포커스 상태: 아웃라인 표시
- 로딩 상태: 애니메이션 및 텍스트 표시
- 완료 상태: 체크마크 및 색상 변경

---

## TypeScript 타입

모든 컴포넌트는 완전한 TypeScript 타입 지원을 제공합니다.

**Import 경로:**
```typescript
import type { EvidenceItem } from '@/shared/types/Evidence';
import type { SearchLocationResult } from '@/shared/types/Discovery';
```

---

## 반응형 레이아웃

**브레이크포인트:**
- Mobile (< 768px): 1 column grid
- Desktop (≥ 768px): 2 column grid

**최대 너비:**
- 모달: max-w-2xl (672px)
- 모달 높이: max-h-[80vh] (스크롤 가능)

---

## 통합 예시

전체 증거 발견 플로우:

```tsx
import { useState } from 'react';
import { LocationExplorer } from '@/components/discovery';
import type { SearchLocationResult } from '@/shared/types/Discovery';

export function EvidenceDiscoveryPage({ caseId }: { caseId: string }) {
  const [totalEvidenceFound, setTotalEvidenceFound] = useState(0);

  const handleSearchLocation = async (locationId: string): Promise<SearchLocationResult> => {
    try {
      const response = await fetch(`/api/cases/${caseId}/search-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          searchType: 'quick',
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const result: SearchLocationResult = await response.json();

      // Update total evidence count
      setTotalEvidenceFound((prev) => prev + result.evidenceFound.length);

      return result;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  };

  return (
    <div>
      <div className="mb-4 text-center">
        <p className="text-detective-gold font-bold">
          총 발견한 증거: {totalEvidenceFound}개
        </p>
      </div>

      <LocationExplorer
        caseId={caseId}
        locations={[
          { id: 'loc-1', name: '피해자의 집', description: '사건 발생 장소', emoji: '🏠' },
          { id: 'loc-2', name: '회사 사무실', description: '피해자 근무지', emoji: '🏢' },
          { id: 'loc-3', name: '공원', description: '마지막 목격 장소', emoji: '🌳' },
          { id: 'loc-4', name: '카페', description: '자주 방문한 곳', emoji: '☕' },
        ]}
        onSearchLocation={handleSearchLocation}
      />
    </div>
  );
}
```

---

## 스타일 커스터마이징

커스텀 색상을 사용하려면 `design-tokens.css`를 수정하세요:

```css
@theme {
  --color-detective-gold: #f59e0b;
  --color-noir-charcoal: #111827;
}
```

---

## 파일 구조

```
src/client/components/discovery/
├── LocationExplorer.tsx       # 메인 컨테이너
├── LocationCard.tsx           # 개별 장소 카드
├── EvidenceRevealCard.tsx     # 증거 발견 모달
├── index.ts                   # Export 모음
└── README.md                  # 이 문서
```

---

## 의존성

- **React**: 18.3+
- **Framer Motion**: 11.15+
- **Tailwind CSS**: 4.x
- **TypeScript**: 5.x

---

## 개발 노트

**성능 최적화:**
- `useState`를 사용한 로컬 상태 관리
- `Set` 자료구조로 O(1) 탐색 확인
- Framer Motion의 lazy mounting으로 초기 로딩 최적화

**향후 개선 사항:**
- 탐색 히스토리 저장 (LocalStorage)
- 증거 발견 사운드 이펙트
- 증거 필터링 및 정렬 기능
- 증거 상세 보기 모달
- 다국어 지원 (i18n)
