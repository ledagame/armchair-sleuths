# 장소 탐색 및 증거 수집 시스템 구현 계획

## 개요

이 문서는 장소 탐색과 증거 수집 시스템을 구현하기 위한 구체적인 작업 목록입니다. 각 작업은 독립적으로 실행 가능하며, 테스트 가능한 단위로 구성되어 있습니다.

**구현 원칙**:
- MVP First: 작동 우선, 최적화는 나중에
- Atomic Development: 한 번에 하나씩
- Fair Play: Three Clue Rule 준수
- 80-90점 품질: Over-engineering 방지

---

## Phase 1: 백엔드 - 데이터 구조 및 생성 로직

### 1. 데이터 타입 정의

- [ ] 1.1 Location 타입 정의
  - **File**: `src/shared/types/Location.ts` (new)
  - **Layer**: Shared Types
  - Location 인터페이스 정의 (id, name, description, imageUrl, evidenceIds, isMainLocation)
  - LocationType enum 정의 (선택적)
  - _Requirements: 1.1, 7.1_

- [ ] 1.2 Evidence 타입 정의
  - **File**: `src/shared/types/Evidence.ts` (new)
  - **Layer**: Shared Types
  - Evidence 인터페이스 정의 (id, name, description, imageUrl, locationId, relatedSuspects, suspicionLevel, isRedHerring, clueType)
  - SuspicionLevel, ClueType enum 정의
  - _Requirements: 2.2, 7.1_

- [ ] 1.3 Suspect 타입 확장
  - **File**: `src/shared/types/Suspect.ts` (update)
  - **Layer**: Shared Types
  - profileImageUrl 필드 추가
  - relatedEvidenceIds 필드 추가
  - _Requirements: 6.1, 7.1_

- [ ] 1.4 GeneratedCase 타입 확장
  - **File**: `src/shared/types/Case.ts` (update)
  - **Layer**: Shared Types
  - locations 필드 추가 (Location[])
  - evidence 필드 추가 (Evidence[])
  - _Requirements: 7.3_

### 2. 장소 생성 시스템

- [ ] 2.1 LocationGenerator 클래스 생성
  - **File**: `src/server/services/generators/LocationGenerator.ts` (new)
  - **Layer**: Server-Side Business Logic
  - generateLocations() 메서드 구현
  - createMainLocation() 메서드 구현
  - generateExplorableLocations() 메서드 구현 (Gemini AI 사용)
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 2.2 LocationGenerator 테스트
  - **File**: `src/server/services/generators/__tests__/LocationGenerator.test.ts` (new)
  - **Layer**: Server-Side Testing
  - 5개 장소 생성 테스트 (대표 1개 + 탐색 4개)
  - 장소별 증거 할당 테스트 (2-4개)
  - _Requirements: 1.4_

### 3. 증거 생성 시스템

- [ ] 3.1 EvidenceGenerator 클래스 생성
  - **File**: `src/server/services/generators/EvidenceGenerator.ts` (new)
  - **Layer**: Server-Side Business Logic
  - generateEvidence() 메서드 구현
  - generateGuiltyEvidence() 메서드 구현 (진범 증거 3-5개)
  - generateInnocentEvidence() 메서드 구현 (다른 용의자 증거)
  - generateRedHerrings() 메서드 구현 (허위 단서 2-3개)
  - distributeEvidenceToLocations() 메서드 구현
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3.2 Three Clue Rule 검증 함수
  - **File**: `src/server/services/validators/ThreeClueRuleValidator.ts` (new)
  - **Layer**: Server-Side Business Logic
  - validateThreeClueRule() 함수 구현
  - 진범 증거 최소 3개 확인
  - 독립적 단서 확인
  - _Requirements: 2.3, 10.1_

- [ ]* 3.3 EvidenceGenerator 테스트
  - **File**: `src/server/services/generators/__tests__/EvidenceGenerator.test.ts` (new)
  - **Layer**: Server-Side Testing
  - 10-15개 증거 생성 테스트
  - Three Clue Rule 준수 테스트
  - Red Herring 2-3개 테스트
  - _Requirements: 2.2, 2.3, 2.4_

### 4. 이미지 생성 시스템

- [ ] 4.1 ImageGenerator 클래스 생성
  - **File**: `src/server/services/generators/ImageGenerator.ts` (new)
  - **Layer**: Server-Side Business Logic
  - generateSuspectImage() 메서드 구현 (지브리 스타일)
  - generateLocationImage() 메서드 구현
  - generateEvidenceImage() 메서드 구현
  - generateAllImages() 메서드 구현 (병렬 처리)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4.2 이미지 생성 에러 처리
  - **File**: `src/server/services/generators/ImageGenerator.ts` (update)
  - **Layer**: Server-Side Business Logic
  - generateImageWithFallback() 메서드 구현
  - getPlaceholderImage() 함수 구현
  - 실패 시 플레이스홀더 반환
  - _Requirements: 3.6_

- [ ]* 4.3 ImageGenerator 테스트
  - **File**: `src/server/services/generators/__tests__/ImageGenerator.test.ts` (new)
  - **Layer**: Server-Side Testing
  - 지브리 스타일 프롬프트 테스트
  - 실패 시 플레이스홀더 테스트
  - _Requirements: 3.2, 3.6_

### 5. 게임 생성 프로세스 통합

- [ ] 5.1 CaseGenerator 확장
  - **File**: `src/server/services/CaseGenerator.ts` (update)
  - **Layer**: Server-Side Business Logic
  - LocationGenerator 통합
  - EvidenceGenerator 통합
  - ImageGenerator 통합
  - 생성 순서: 기존 요소 → 장소 → 증거 → 이미지
  - _Requirements: 7.3_

- [ ] 5.2 Three Clue Rule 재시도 로직
  - **File**: `src/server/services/CaseGenerator.ts` (update)
  - **Layer**: Server-Side Business Logic
  - generateEvidenceWithRetry() 함수 구현
  - 최대 3회 재시도
  - 실패 시 에러 로깅
  - _Requirements: 10.1_

- [ ]* 5.3 통합 테스트
  - **File**: `src/server/services/__tests__/CaseGenerator.integration.test.ts` (new)
  - **Layer**: Server-Side Testing
  - 전체 게임 생성 테스트
  - 모든 요소 존재 확인 (장소 5개, 증거 10-15개, 이미지 모두)
  - Three Clue Rule 검증
  - _Requirements: 7.3, 10.1_

---

## Phase 2: 백엔드 - API 및 데이터 저장

### 6. 데이터 저장 확장

- [ ] 6.1 CaseRepository 확장
  - **File**: `src/server/repositories/CaseRepository.ts` (update)
  - **Layer**: Server-Side Data Access
  - Location 데이터 저장 로직 추가
  - Evidence 데이터 저장 로직 추가
  - 이미지 URL 저장
  - _Requirements: 7.2_

- [ ] 6.2 PlayerProgressRepository 생성
  - **File**: `src/server/repositories/PlayerProgressRepository.ts` (new)
  - **Layer**: Server-Side Data Access
  - getPlayerProgress() 메서드 구현
  - recordEvidenceCollection() 메서드 구현
  - recordLocationVisit() 메서드 구현
  - _Requirements: 8.4_

### 7. API 엔드포인트

- [ ] 7.1 게임 생성 API 응답 확장
  - **File**: `src/server/api/routes/case.ts` (update)
  - **Layer**: Server Action / API Route
  - GenerateCaseResponse에 locations, evidence 추가
  - 모든 이미지 URL 포함
  - _Requirements: 7.3_

- [ ] 7.2 증거 수집 API 생성
  - **File**: `src/server/api/routes/evidence.ts` (new)
  - **Layer**: Server Action / API Route
  - POST /api/collect-evidence 엔드포인트
  - 증거 유효성 검증
  - 중복 수집 방지
  - 수집 시각 기록
  - _Requirements: 8.4_

- [ ] 7.3 플레이어 진행 상황 API 생성
  - **File**: `src/server/api/routes/progress.ts` (new)
  - **Layer**: Server Action / API Route
  - GET /api/player-progress/:caseId/:userId 엔드포인트
  - 수집한 증거 목록 반환
  - 방문한 장소 목록 반환
  - _Requirements: 8.4_

---

## Phase 3: 프론트엔드 - UI 컴포넌트

### 8. 공통 컴포넌트

- [ ] 8.1 ImageWithLoading 컴포넌트
  - **File**: `src/client/components/common/ImageWithLoading.tsx` (new)
  - **Layer**: Client Component
  - 로딩 스피너 표시
  - 에러 시 플레이스홀더 표시
  - Lazy loading 지원
  - _Requirements: 9.2_

- [ ] 8.2 LoadingSpinner 컴포넌트
  - **File**: `src/client/components/common/LoadingSpinner.tsx` (new)
  - **Layer**: Client Component
  - 간단한 로딩 애니메이션
  - _Requirements: 9.2_

### 9. 장소 탐색 컴포넌트

- [ ] 9.1 LocationCard 컴포넌트
  - **File**: `src/client/components/locations/LocationCard.tsx` (new)
  - **Layer**: Client Component
  - 장소 이미지, 이름, 설명 표시
  - 미발견 증거 수 표시
  - 클릭 이벤트 처리
  - _Requirements: 4.2_

- [ ] 9.2 LocationGrid 컴포넌트
  - **File**: `src/client/components/locations/LocationGrid.tsx` (new)
  - **Layer**: Client Component
  - 4개 장소 카드 그리드 레이아웃
  - 반응형 디자인 (2x2 그리드)
  - _Requirements: 4.2_

- [ ] 9.3 LocationDetail 컴포넌트
  - **File**: `src/client/components/locations/LocationDetail.tsx` (new)
  - **Layer**: Client Component
  - 큰 장소 이미지 표시
  - 상세 설명 표시
  - 발견 가능한 증거 목록 표시
  - 뒤로 가기 버튼
  - _Requirements: 4.3_

- [ ] 9.4 LocationExplorer 컴포넌트 (통합)
  - **File**: `src/client/components/locations/LocationExplorer.tsx` (new)
  - **Layer**: Client Component
  - LocationGrid와 LocationDetail 통합
  - 상태 관리 (선택된 장소)
  - 증거 수집 이벤트 처리
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

### 10. 증거 관리 컴포넌트

- [ ] 10.1 EvidenceCard 컴포넌트
  - **File**: `src/client/components/evidence/EvidenceCard.tsx` (new)
  - **Layer**: Client Component
  - 증거 썸네일 이미지
  - 증거 이름, 타입 표시
  - 발견 장소 표시
  - 연관 용의자 아이콘 표시
  - _Requirements: 5.2_

- [ ] 10.2 EvidenceGrid 컴포넌트
  - **File**: `src/client/components/evidence/EvidenceGrid.tsx` (new)
  - **Layer**: Client Component
  - 수집한 증거 그리드 레이아웃
  - 반응형 디자인 (3열 그리드)
  - _Requirements: 5.2_

- [ ] 10.3 EvidenceFilters 컴포넌트
  - **File**: `src/client/components/evidence/EvidenceFilters.tsx` (new)
  - **Layer**: Client Component
  - 장소별 필터
  - 용의자별 필터
  - 타입별 필터
  - 정렬 옵션 (수집 순서, 이름, 타입)
  - _Requirements: 5.4_

- [ ] 10.4 EvidenceDetail 컴포넌트
  - **File**: `src/client/components/evidence/EvidenceDetail.tsx` (new)
  - **Layer**: Client Component
  - 큰 증거 이미지
  - 상세 설명
  - 발견 장소 정보
  - 연관 용의자 목록
  - 플레이어 메모 입력 (선택적)
  - _Requirements: 5.3_

- [ ] 10.5 EvidenceNotebook 컴포넌트 (통합)
  - **File**: `src/client/components/evidence/EvidenceNotebook.tsx` (new)
  - **Layer**: Client Component
  - EvidenceFilters, EvidenceGrid, EvidenceDetail 통합
  - 상태 관리 (필터, 정렬, 선택된 증거)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

### 11. 용의자 프로필 개선

- [ ] 11.1 SuspectCard 컴포넌트 개선
  - **File**: `src/client/components/suspects/SuspectCard.tsx` (update)
  - **Layer**: Client Component
  - 프로필 사진 추가
  - 관련 증거 수 표시
  - _Requirements: 6.1_

- [ ] 11.2 SuspectProfile 컴포넌트 개선
  - **File**: `src/client/components/suspects/SuspectProfile.tsx` (update)
  - **Layer**: Client Component
  - 큰 프로필 사진 표시
  - 관련 증거 목록 표시
  - 증거 클릭 시 EvidenceDetail 열기
  - _Requirements: 6.2, 6.3, 6.4_

---

## Phase 4: 프론트엔드 - 통합 및 상태 관리

### 12. 상태 관리

- [ ] 12.1 GameState 타입 정의
  - **File**: `src/client/types/GameState.ts` (new)
  - **Layer**: Client Types
  - GameState 인터페이스 정의
  - GameAction 타입 정의
  - _Requirements: 8.1_

- [ ] 12.2 useGameState 훅 생성
  - **File**: `src/client/hooks/useGameState.ts` (new)
  - **Layer**: Client Hook
  - useReducer로 게임 상태 관리
  - LOAD_CASE, COLLECT_EVIDENCE, VISIT_LOCATION 액션
  - _Requirements: 8.1_

- [ ] 12.3 useEvidenceCollection 훅 생성
  - **File**: `src/client/hooks/useEvidenceCollection.ts` (new)
  - **Layer**: Client Hook
  - 증거 수집 API 호출
  - 로컬 상태 업데이트
  - 에러 처리
  - _Requirements: 8.4_

### 13. 메인 게임 화면 통합

- [ ] 13.1 GameTabs 컴포넌트 생성
  - **File**: `src/client/components/game/GameTabs.tsx` (new)
  - **Layer**: Client Component
  - 4개 탭 (용의자 대화, 장소 탐색, 증거 노트북, 추리 제출)
  - 탭 전환 상태 관리
  - _Requirements: 8.1_

- [ ] 13.2 GameScreen 컴포넌트 통합
  - **File**: `src/client/components/game/GameScreen.tsx` (update)
  - **Layer**: Client Component
  - GameTabs 통합
  - LocationExplorer 통합
  - EvidenceNotebook 통합
  - SuspectProfile 통합
  - useGameState 훅 사용
  - _Requirements: 8.1, 8.2_

- [ ] 13.3 증거-용의자 연결 표시
  - **File**: `src/client/components/game/GameScreen.tsx` (update)
  - **Layer**: Client Component
  - 증거 화면에서 용의자 프로필 사진 표시
  - 용의자 화면에서 관련 증거 표시
  - 클릭 시 상호 이동
  - _Requirements: 8.2_

---

## Phase 5: 테스트 및 최적화

### 14. 프론트엔드 테스트

- [ ]* 14.1 LocationExplorer 테스트
  - **File**: `src/client/components/locations/__tests__/LocationExplorer.test.tsx` (new)
  - **Layer**: Client Testing
  - 장소 목록 표시 테스트
  - 장소 선택 테스트
  - 증거 수집 테스트
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 14.2 EvidenceNotebook 테스트
  - **File**: `src/client/components/evidence/__tests__/EvidenceNotebook.test.tsx` (new)
  - **Layer**: Client Testing
  - 수집한 증거 표시 테스트
  - 필터링 테스트
  - 정렬 테스트
  - _Requirements: 5.1, 5.2, 5.4_

- [ ]* 14.3 통합 테스트
  - **File**: `src/client/components/game/__tests__/GameScreen.integration.test.tsx` (new)
  - **Layer**: Client Testing
  - 전체 게임 플로우 테스트
  - 장소 탐색 → 증거 수집 → 추리 제출
  - _Requirements: 8.1, 8.2, 8.3_

### 15. 성능 최적화

- [ ] 15.1 이미지 Lazy Loading
  - **File**: `src/client/components/common/ImageWithLoading.tsx` (update)
  - **Layer**: Client Component
  - Intersection Observer 사용
  - 뷰포트 진입 시 로드
  - _Requirements: 9.4_

- [ ] 15.2 이미지 배치 생성 최적화
  - **File**: `src/server/services/generators/ImageGenerator.ts` (update)
  - **Layer**: Server-Side Business Logic
  - 배치 크기 제한 (5개씩)
  - Promise.allSettled 사용
  - _Requirements: 9.1_

- [ ]* 15.3 성능 테스트
  - **File**: `scripts/test-performance.ts` (new)
  - **Layer**: Testing Script
  - 게임 생성 시간 측정
  - 이미지 생성 시간 측정
  - 목표: 3분 이내
  - _Requirements: 9.1_

---

## Phase 6: 배포 및 문서화

### 16. 배포 준비

- [ ] 16.1 환경 변수 설정
  - **File**: `.env.example` (update)
  - VERCEL_IMAGE_FUNCTION_URL 추가
  - 플레이스홀더 이미지 경로 추가
  - _Requirements: 3.6_

- [ ] 16.2 플레이스홀더 이미지 준비
  - **File**: `public/images/placeholders/` (new)
  - placeholder-suspect.png
  - placeholder-location.png
  - placeholder-evidence.png
  - _Requirements: 3.6_

- [ ] 16.3 데이터베이스 마이그레이션 (선택적)
  - **File**: `migrations/add-locations-evidence.sql` (new)
  - Location 테이블 생성 (선택적, 현재는 JSON 저장)
  - Evidence 테이블 생성 (선택적)
  - _Requirements: 7.2_

### 17. 문서화

- [ ] 17.1 사용자 가이드 작성
  - **File**: `docs/USER_GUIDE.md` (update)
  - 장소 탐색 방법
  - 증거 수집 방법
  - 증거 노트북 사용법
  - _Requirements: 4.1, 5.1_

- [ ] 17.2 개발자 문서 업데이트
  - **File**: `docs/DEVELOPER_GUIDE.md` (update)
  - 새로운 데이터 구조 설명
  - API 엔드포인트 문서
  - 컴포넌트 구조 설명
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 17.3 테스트 가이드 작성
  - **File**: `TESTING_GUIDE.md` (update)
  - 장소/증거 생성 테스트 방법
  - Three Clue Rule 검증 방법
  - 이미지 생성 테스트 방법
  - _Requirements: 10.1_

---

## 우선순위 및 의존성

### Critical Path (필수 순서)

```
1. 데이터 타입 정의 (1.1 → 1.2 → 1.3 → 1.4)
   ↓
2. 생성 로직 (2.1 → 3.1 → 3.2 → 4.1 → 4.2)
   ↓
3. 통합 (5.1 → 5.2)
   ↓
4. 데이터 저장 (6.1 → 6.2)
   ↓
5. API (7.1 → 7.2 → 7.3)
   ↓
6. 프론트엔드 컴포넌트 (8.1 → 9.1~9.4 → 10.1~10.5 → 11.1~11.2)
   ↓
7. 상태 관리 (12.1 → 12.2 → 12.3)
   ↓
8. 통합 (13.1 → 13.2 → 13.3)
   ↓
9. 최적화 (15.1 → 15.2)
   ↓
10. 배포 (16.1 → 16.2)
```

### 병렬 가능 작업

- 2.1 (LocationGenerator) 와 3.1 (EvidenceGenerator) 병렬 가능
- 9.1~9.4 (장소 컴포넌트) 와 10.1~10.5 (증거 컴포넌트) 병렬 가능
- 테스트 작업 (2.2, 3.3, 4.3, 14.1, 14.2) 병렬 가능

---

## 예상 소요 시간

| Phase | 작업 수 | 예상 시간 | 비고 |
|-------|---------|-----------|------|
| Phase 1 | 15개 | 3일 | 백엔드 핵심 로직 |
| Phase 2 | 6개 | 1일 | API 및 저장 |
| Phase 3 | 11개 | 3일 | UI 컴포넌트 |
| Phase 4 | 6개 | 2일 | 통합 및 상태 관리 |
| Phase 5 | 6개 | 1일 | 테스트 및 최적화 |
| Phase 6 | 6개 | 1일 | 배포 및 문서화 |
| **총계** | **50개** | **11일** | 약 2주 |

---

## 성공 기준

이 구현이 성공적으로 완료되었다고 판단하는 기준:

### 기능적 기준
- [ ] 플레이어가 4개 장소를 탐색할 수 있음
- [ ] 플레이어가 10-15개 증거를 수집할 수 있음
- [ ] 모든 이미지가 지브리 스타일로 표시됨
- [ ] 증거 노트북에서 필터링/정렬 가능
- [ ] 용의자 프로필에 사진 표시됨

### 품질 기준
- [ ] Three Clue Rule 100% 준수
- [ ] Fair Play 원칙 준수 (모든 증거 접근 가능)
- [ ] 게임 생성 시간 3분 이내
- [ ] 이미지 로딩 2초 이내
- [ ] 모든 핵심 테스트 통과

### 사용자 경험 기준
- [ ] 직관적인 UI (설명 없이 사용 가능)
- [ ] 부드러운 애니메이션 및 전환
- [ ] 명확한 피드백 (로딩, 성공, 에러)
- [ ] 모바일 반응형 디자인

### 80-90점 기준
- [ ] 논리적 일관성 (모든 증거가 스토리와 연결)
- [ ] 재미 (탐색과 발견의 즐거움)
- [ ] 공정성 (플레이어가 해결 가능)
- [ ] 완성도 (버그 없음, 안정적)

---

## 참고 문서

- `.kiro/specs/location-evidence-system/requirements.md` - 요구사항
- `.kiro/specs/location-evidence-system/design.md` - 설계
- `docs2.md/MURDER_MYSTERY_MASTER_GUIDE.md` - 핵심 원칙
- `docs2.md/GAME_GENERATION_PROCESS.md` - 현재 프로세스

---

**작업 계획 버전**: 1.0  
**작성일**: 2025-01-15  
**예상 완료일**: 2025-01-29 (2주)  
**상태**: 검토 대기
