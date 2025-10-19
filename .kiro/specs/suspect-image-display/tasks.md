# 용의자 이미지 표시 기능 Implementation Tasks

## 1. 타입 시스템 업데이트

- [ ] 1.1 Client Suspect 타입에 imageUrl 필드 추가
  - **File**: `src/client/types/index.ts`
  - **Layer**: Client Type Definition
  - Add `imageUrl?: string` to Suspect interface
  - Ensure optional field (이미지 생성 실패 시 없을 수 있음)
  - Note: 서버는 `profileImageUrl`을 사용하지만 클라이언트는 `imageUrl` 사용
  - _Requirements: 1.1_

- [ ] 1.2 SuspectData 타입에 profileImageUrl 필드 확인
  - **File**: `src/server/services/repositories/kv/KVStoreManager.ts`
  - **Layer**: Server Type Definition
  - Verify SuspectData interface includes `profileImageUrl?: string`
  - If missing, add it to the interface
  - _Requirements: 1.2_

## 2. Redis 데이터 정리 로직 구현 (핵심 수정)

- [ ] 2.1 KVStoreManager에 clearCaseData 메서드 추가
  - **File**: `src/server/services/repositories/kv/KVStoreManager.ts`
  - **Layer**: Server-Side Data Access
  - Method: `static async clearCaseData(caseId: string): Promise<void>`
  - Get existing suspect IDs from `case:${caseId}:suspects` Set
  - Delete each suspect data: `suspect:${suspectId}`
  - Delete the suspect Set: `case:${caseId}:suspects`
  - Delete the case data: `case:${caseId}`
  - Add detailed logging for each deletion
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2.2 saveCase 메서드 수정하여 저장 전 데이터 정리
  - **File**: `src/server/services/repositories/kv/KVStoreManager.ts`
  - **Layer**: Server-Side Data Access
  - Call `clearCaseData(caseData.id)` at the beginning of `saveCase()`
  - Ensure clean state before saving new data
  - This prevents duplicate suspects in Redis Set
  - _Requirements: 2.1, 2.2_

## 3. 이미지 URL 저장 확인 (이미 구현됨)

- [ ] 3.1 CaseGeneratorService의 이미지 생성 로직 확인
  - **File**: `src/server/services/case/CaseGeneratorService.ts`
  - **Layer**: Server-Side Business Logic
  - Verify `generateAllImages()` method sets `profileImageUrl` on suspects
  - Verify `applyImageResults()` correctly maps image URLs
  - Confirm image generation is working (already implemented)
  - _Requirements: 4.1_

- [ ] 3.2 SuspectData 저장 시 profileImageUrl 포함 확인
  - **File**: `src/server/services/repositories/kv/CaseRepository.ts`
  - **Layer**: Server-Side Data Access
  - Verify `createCase()` includes profileImageUrl when creating SuspectData
  - Add profileImageUrl field to SuspectData if missing
  - Add logging to confirm profileImageUrl is saved
  - _Requirements: 4.1, 4.2_

## 4. API 응답 필드 매핑 (profileImageUrl → imageUrl)

- [ ] 4.1 API 엔드포인트에서 필드명 매핑 추가
  - **File**: API 엔드포인트 파일 (suspects API)
  - **Layer**: Server Action / API Route
  - When fetching suspects from KVStoreManager, map `profileImageUrl` to `imageUrl`
  - Transform response: `{ ...suspect, imageUrl: suspect.profileImageUrl }`
  - Handle missing profileImageUrl gracefully (set imageUrl to undefined)
  - _Requirements: 4.2, 4.3, 4.4_

- [ ] 4.2 정확히 3명의 용의자만 반환하도록 검증 추가
  - **File**: API 엔드포인트 파일
  - **Layer**: Server Action / API Route
  - Add validation: `if (suspects.length !== 3) console.warn(...)`
  - Slice array to return only first 3 suspects: `suspects.slice(0, 3)`
  - Log warning if suspect count is incorrect
  - _Requirements: 2.4_

## 5. SuspectPanel UI 업데이트

- [ ] 5.1 이미지 표시 섹션 추가
  - **File**: `src/client/components/suspect/SuspectPanel.tsx`
  - **Layer**: Client Component
  - Add image display above suspect name
  - Use `<img>` tag with `suspect.imageUrl`
  - Set proper sizing: `w-full h-48 object-cover rounded-lg`
  - Add `loading="lazy"` for performance
  - _Requirements: 3.1, 3.2_

- [ ] 5.2 이미지 플레이스홀더 구현
  - **File**: `src/client/components/suspect/SuspectPanel.tsx`
  - **Layer**: Client Component
  - Show 👤 emoji when imageUrl is missing
  - Use gray background: `bg-gray-700`
  - Center the placeholder icon
  - _Requirements: 3.2_

- [ ] 5.3 이미지 로드 에러 처리
  - **File**: `src/client/components/suspect/SuspectPanel.tsx`
  - **Layer**: Client Component
  - Add `onError` handler to `<img>` tag
  - On error, display placeholder instead
  - Log error for debugging
  - _Requirements: 3.3, 3.4_

## 6. 로딩 상태 개선

- [ ] 6.1 이미지 로딩 skeleton 추가
  - **File**: `src/client/components/suspect/SuspectPanel.tsx`
  - **Layer**: Client Component
  - Show loading skeleton while image loads
  - Use shimmer effect for better UX
  - _Requirements: 5.1_

- [ ] 6.2 이미지 캐싱 확인
  - **File**: Browser DevTools
  - **Layer**: Testing
  - Verify browser caches loaded images
  - Test with browser DevTools Network tab
  - _Requirements: 5.4_

## 7. 통합 테스트

- [ ] 7.1 End-to-End 테스트
  - **File**: Manual Testing
  - **Layer**: Integration Testing
  - Generate new case with `npm run dev`
  - Verify 3 suspects are created
  - Verify images are displayed in UI
  - Verify no duplicate suspects in Redis
  - _Requirements: All_

- [ ] 7.2 케이스 재생성 테스트
  - **File**: Manual Testing
  - **Layer**: Integration Testing
  - Regenerate same case multiple times
  - Verify old data is cleared each time
  - Verify Redis set has exactly 3 members
  - _Requirements: 2.1, 2.2_

- [ ] 7.3 이미지 로드 실패 시나리오 테스트
  - **File**: Manual Testing
  - **Layer**: Integration Testing
  - Manually set invalid imageUrl in Redis
  - Verify placeholder is displayed
  - Verify no console errors
  - _Requirements: 3.3, 3.4_

## 8. 로깅 및 디버깅 개선

- [ ] 8.1 Redis 작업 로깅 추가
  - **File**: `src/server/services/repositories/kv/KVStoreManager.ts`
  - **Layer**: Server-Side Data Access
  - Log when clearing old data
  - Log when saving new suspects
  - Log suspect count after fetch
  - _Requirements: 2.4, 4.4_

- [ ] 8.2 이미지 생성 로깅 추가
  - **File**: `src/server/services/case/CaseGeneratorService.ts`
  - **Layer**: Server-Side Business Logic
  - Log when image generation starts
  - Log when image generation succeeds
  - Log when image generation fails
  - _Requirements: 4.4_

---

## 우선순위 및 실행 순서

### Critical Path (필수 순서)

```
1. Redis 데이터 정리 (2.1 → 2.2) ⭐ 가장 중요!
   ↓
2. 타입 업데이트 (1.1 → 1.2)
   ↓
3. 이미지 URL 확인 (3.1 → 3.2)
   ↓
4. API 필드 매핑 (4.1 → 4.2)
   ↓
5. UI 업데이트 (5.1 → 5.2 → 5.3)
   ↓
6. 로딩 개선 (6.1 → 6.2)
   ↓
7. 통합 테스트 (7.1 → 7.2 → 7.3)
   ↓
8. 로깅 개선 (8.1 → 8.2)
```

### 병렬 가능 작업

- 1.1과 1.2 병렬 가능
- 5.1, 5.2, 5.3 병렬 가능
- 7.1, 7.2, 7.3 병렬 가능
- 8.1과 8.2 병렬 가능

---

## 예상 소요 시간

| Task | 작업 수 | 예상 시간 | 비고 |
|------|---------|-----------|------|
| Task 1 | 2개 | 30분 | 타입 정의 |
| Task 2 | 2개 | 1시간 | 핵심 수정 |
| Task 3 | 2개 | 30분 | 확인 작업 |
| Task 4 | 2개 | 45분 | API 매핑 |
| Task 5 | 3개 | 1시간 | UI 구현 |
| Task 6 | 2개 | 30분 | UX 개선 |
| Task 7 | 3개 | 45분 | 테스트 |
| Task 8 | 2개 | 30분 | 로깅 |
| **총계** | **18개** | **5.5시간** | 약 1일 |

---

## 성공 기준

### 기능적 기준
- [ ] 용의자 이미지가 UI에 표시됨
- [ ] 이미지 없을 때 플레이스홀더 표시됨
- [ ] Redis에 정확히 3명의 용의자만 저장됨
- [ ] 케이스 재생성 시 이전 데이터가 정리됨

### 품질 기준
- [ ] TypeScript 컴파일 에러 없음
- [ ] 콘솔에 에러 없음
- [ ] 이미지 로딩 성능 양호
- [ ] 모든 테스트 통과

---

**Tasks Version**: 1.0  
**Created**: 2025-01-18  
**Status**: Ready for Implementation
