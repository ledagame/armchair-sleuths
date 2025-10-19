# 데이터 일관성 수정 Implementation Tasks

## 개요

이 태스크는 용의자 데이터 불일치 문제를 해결하고, 향후 동일한 문제가 발생하지 않도록 검증 시스템을 구축합니다.

**현재 문제:**
- 앱에 4명의 잘못된 용의자 표시 (이서연, 정우진, 윤지혁, 서도윤)
- 코드에는 3명 정의 (이서연, 박준호, 최민지)
- Redis에 7명의 중복 데이터
- 이미지 URL 누락

**목표:**
- 올바른 3명의 용의자 데이터로 복구
- 이미지 정상 로드
- 자동 검증 시스템 구축

---

## Task 1: 진단 도구 구현

### 1.1 케이스 검증 클래스 생성
- **File**: `src/server/services/validation/CaseValidator.ts` (new)
- **Layer**: Server-Side Business Logic
- **Description**: 케이스 데이터의 일관성을 검증하는 클래스
- **Implementation**:
  - `validateCase(caseId: string): Promise<CaseValidationResult>` 메서드
  - 용의자 수 검증 (정확히 3명)
  - 진범 수 검증 (정확히 1명)
  - 필수 필드 검증 (name, archetype, background)
  - 이미지 URL 검증
  - Redis Set과 실제 데이터 일치 확인
- **Return Type**:
  ```typescript
  interface CaseValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
  }
  ```
- _Requirements: 1.1, 4.1, 4.2, 4.3_
- _Effort: Medium_

### 1.2 케이스 진단 스크립트 생성
- **File**: `scripts/diagnose-case.ts` (new)
- **Layer**: Script
- **Description**: 케이스 데이터를 상세히 분석하고 불일치를 찾는 스크립트
- **Implementation**:
  - 케이스 데이터 조회 및 출력
  - 용의자 레코드 조회 및 출력
  - Redis Set 조회 및 출력
  - 불일치 항목 하이라이트
  - CaseValidator 실행 및 결과 출력
- **Usage**: `npx tsx scripts/diagnose-case.ts case-2025-10-17`
- _Requirements: 1.1, 1.2, 1.3_
- _Effort: Low_

---

## Task 2: 데이터 정리 도구 구현

### 2.1 KVStoreManager.clearCaseData() 강화
- **File**: `src/server/services/repositories/kv/KVStoreManager.ts` (update)
- **Layer**: Server-Side Business Logic
- **Description**: 케이스 데이터를 완전히 삭제하는 메서드 개선
- **Implementation**:
  - 기존 용의자 ID 목록 조회
  - 각 용의자 데이터 삭제 (`suspect:*`)
  - 용의자 Set 삭제 (`case:*:suspects`)
  - 케이스 데이터 삭제 (`case:*`)
  - 날짜 인덱스 삭제 (`case:date:*`)
  - 상세한 로깅 추가
- **Verification**: 삭제 후 모든 키가 null 반환하는지 확인
- _Requirements: 2.1_
- _Effort: Low_

### 2.2 케이스 삭제 스크립트 생성
- **File**: `scripts/clear-case.ts` (new)
- **Layer**: Script
- **Description**: 케이스를 안전하게 삭제하는 스크립트
- **Implementation**:
  - 삭제 전 진단 실행 (diagnose-case)
  - 사용자 확인 프롬프트
  - KVStoreManager.clearCaseData() 호출
  - 삭제 후 검증
- **Usage**: `npx tsx scripts/clear-case.ts case-2025-10-17`
- _Requirements: 2.1_
- _Effort: Low_

---

## Task 3: 케이스 재생성 도구 개선

### 3.1 regenerate-case.ts 스크립트 개선
- **File**: `scripts/regenerate-case.ts` (update)
- **Layer**: Script
- **Description**: 케이스 재생성 스크립트에 검증 로직 추가
- **Implementation**:
  - 기존 케이스 확인 및 출력
  - `--force` 플래그 없으면 중단
  - clearCaseData() 호출 (완전 삭제)
  - CaseGeneratorService로 새 케이스 생성
  - CaseValidator로 검증
  - 검증 실패 시 롤백
  - 성공 시 결과 출력 (용의자 목록, 이미지 URL)
- **Usage**: `npx tsx scripts/regenerate-case.ts case-2025-10-17 --with-images --force`
- _Requirements: 2.2, 2.3, 2.4, 2.5_
- _Effort: Medium_

---

## Task 4: 자동 검증 시스템 통합

### 4.1 CaseRepository.createCase()에 검증 추가
- **File**: `src/server/services/repositories/kv/CaseRepository.ts` (update)
- **Layer**: Server-Side Business Logic
- **Description**: 케이스 생성 후 자동 검증 실행
- **Implementation**:
  - 케이스 및 용의자 저장 (기존 로직)
  - CaseValidator.validateCase() 호출
  - 검증 실패 시:
    - 에러 로그 출력
    - clearCaseData() 호출 (롤백)
    - Error throw
  - 검증 경고 시:
    - 경고 로그 출력
    - 계속 진행
  - 검증 성공 시:
    - 성공 로그 출력
- _Requirements: 4.1, 4.2, 4.3, 4.4_
- _Effort: Low_

### 4.2 KVStoreManager.saveCase()에 검증 추가
- **File**: `src/server/services/repositories/kv/KVStoreManager.ts` (update)
- **Layer**: Server-Side Business Logic
- **Description**: 케이스 저장 전 clearCaseData() 확실히 실행
- **Implementation**:
  - saveCase() 시작 시 clearCaseData() 호출
  - 삭제 완료 로그 확인
  - 케이스 데이터 저장
  - 날짜 인덱스 저장
- _Requirements: 2.1, 4.1_
- _Effort: Low_

---

## Task 5: 즉시 수정 (현재 케이스)

### 5.1 case-2025-10-17 데이터 재생성
- **File**: N/A (스크립트 실행)
- **Layer**: Operations
- **Description**: 현재 잘못된 케이스 데이터를 올바른 데이터로 교체
- **Steps**:
  1. 현재 상태 진단: `npx tsx scripts/diagnose-case.ts case-2025-10-17`
  2. 완전 삭제: `npx tsx scripts/clear-case.ts case-2025-10-17`
  3. 재생성 (이미지 포함): `npx tsx scripts/regenerate-case.ts case-2025-10-17 --with-images --force`
  4. 검증: `npx tsx scripts/diagnose-case.ts case-2025-10-17`
  5. 앱 새로고침 및 확인
- **Expected Result**:
  - 용의자 3명: 이서연, 박준호, 최민지
  - 각 용의자 이미지 로드
  - Redis Set에 정확히 3개 ID
- _Requirements: 2.2, 2.3, 2.4, 2.5_
- _Effort: Low_

---

## Task 6: 문서 업데이트

### 6.1 설계 문서 업데이트
- **File**: `doc.md/개요.md` 또는 관련 설계 문서 (update)
- **Layer**: Documentation
- **Description**: 설계 문서의 용의자 정보를 코드와 일치시키기
- **Implementation**:
  - 용의자 이름 업데이트: 강태오, 박준호, 최민수 → 이서연, 박준호, 최민지
  - 용의자 수 명시: 3명
  - 각 용의자의 역할 및 배경 업데이트
- _Requirements: 3.1, 3.2, 3.3_
- _Effort: Low_

### 6.2 TESTING_GUIDE.md 업데이트
- **File**: `TESTING_GUIDE.md` (update)
- **Layer**: Documentation
- **Description**: 테스트 가이드에 새로운 진단/검증 도구 추가
- **Implementation**:
  - 케이스 진단 방법 추가
  - 케이스 재생성 방법 업데이트
  - 검증 도구 사용법 추가
- _Requirements: 1.1_
- _Effort: Low_

---

## Task 7: 테스트

### 7.1 CaseValidator 유닛 테스트
- **File**: `src/server/services/validation/CaseValidator.test.ts` (new)
- **Layer**: Test
- **Description**: CaseValidator 클래스의 유닛 테스트
- **Test Cases**:
  - 유효한 케이스 검증 (3명, 진범 1명)
  - 용의자 수 오류 검증 (2명, 4명)
  - 진범 수 오류 검증 (0명, 2명)
  - 필수 필드 누락 검증
  - 이미지 URL 누락 경고
  - Redis Set 불일치 검증
- _Requirements: 4.1, 4.2, 4.3_
- _Effort: Medium_

### 7.2 KVStoreManager.clearCaseData() 테스트
- **File**: `src/server/services/repositories/kv/KVStoreManager.test.ts` (update)
- **Layer**: Test
- **Description**: clearCaseData() 메서드의 완전 삭제 검증
- **Test Cases**:
  - 케이스 데이터 삭제 확인
  - 용의자 데이터 삭제 확인
  - 용의자 Set 삭제 확인
  - 날짜 인덱스 삭제 확인
  - 삭제 후 조회 시 null 반환 확인
- _Requirements: 2.1_
- _Effort: Low_

### 7.3 End-to-End 테스트
- **File**: N/A (수동 테스트)
- **Layer**: Integration Test
- **Description**: 전체 플로우 테스트
- **Test Steps**:
  1. 로컬 환경에서 케이스 재생성
  2. Devvit playtest 실행
  3. 브라우저에서 앱 확인:
     - 용의자 3명 표시 확인
     - 각 용의자 이미지 로드 확인
     - 용의자 이름 확인 (이서연, 박준호, 최민지)
  4. 터미널 로그 확인:
     - clearCaseData() 실행 로그
     - 용의자 Set 크기 (3명)
     - 검증 성공 로그
- _Requirements: 2.5_
- _Effort: Low_

---

## Task 실행 순서

### Phase 1: 도구 구현 (우선순위 높음)
1. Task 1.1: CaseValidator 클래스 생성
2. Task 1.2: diagnose-case 스크립트 생성
3. Task 2.1: clearCaseData() 강화
4. Task 2.2: clear-case 스크립트 생성

### Phase 2: 즉시 수정 (긴급)
5. Task 5.1: case-2025-10-17 재생성 ← **지금 바로 실행!**

### Phase 3: 재생성 도구 개선
6. Task 3.1: regenerate-case 스크립트 개선

### Phase 4: 자동 검증 통합
7. Task 4.1: CaseRepository에 검증 추가
8. Task 4.2: KVStoreManager에 검증 추가

### Phase 5: 문서 및 테스트
9. Task 6.1: 설계 문서 업데이트
10. Task 6.2: TESTING_GUIDE 업데이트
11. Task 7.1: CaseValidator 테스트
12. Task 7.2: clearCaseData() 테스트
13. Task 7.3: End-to-End 테스트

---

## 즉시 실행 가능한 명령어

### 현재 상태 진단
```bash
# 1. 어댑터 설정 (로컬)
# KVStoreManager.setAdapter(new FileStorageAdapter('./local-data'));

# 2. 진단 실행 (Task 1.2 완료 후)
npx tsx scripts/diagnose-case.ts case-2025-10-17
```

### 데이터 재생성
```bash
# 1. 완전 삭제 (Task 2.2 완료 후)
npx tsx scripts/clear-case.ts case-2025-10-17

# 2. 재생성 (기존 스크립트 사용)
npx tsx scripts/regenerate-case.ts case-2025-10-17 --with-images --force

# 3. 검증
npx tsx scripts/diagnose-case.ts case-2025-10-17
```

### Devvit 테스트
```bash
# 1. Playtest 시작
npm run dev

# 2. 브라우저에서 확인
# https://www.reddit.com/r/armchair_sleuths_dev/?playtest=armchair-sleuths

# 3. 터미널 로그 확인
# - "Retrieved X suspects" 메시지 확인 (X = 3이어야 함)
# - 용의자 이름 확인
```

---

## 성공 기준

### Task 완료 기준
- [ ] CaseValidator 클래스 구현 및 테스트 통과
- [ ] diagnose-case 스크립트 실행 가능
- [ ] clear-case 스크립트 실행 가능
- [ ] regenerate-case 스크립트 개선 완료
- [ ] CaseRepository 자동 검증 통합
- [ ] case-2025-10-17 데이터 정상화

### 최종 검증 기준
- [ ] 앱에 용의자 3명 표시 (이서연, 박준호, 최민지)
- [ ] 각 용의자 이미지 정상 로드
- [ ] Redis Set에 정확히 3개 ID
- [ ] 진단 스크립트 실행 시 에러 없음
- [ ] 검증 시스템 통과

---

## 예상 소요 시간

| Task | Effort | 예상 시간 |
|------|--------|----------|
| 1.1 CaseValidator | Medium | 2시간 |
| 1.2 diagnose-case | Low | 30분 |
| 2.1 clearCaseData() 강화 | Low | 30분 |
| 2.2 clear-case | Low | 30분 |
| 3.1 regenerate-case 개선 | Medium | 1시간 |
| 4.1 CaseRepository 검증 | Low | 30분 |
| 4.2 KVStoreManager 검증 | Low | 30분 |
| 5.1 데이터 재생성 | Low | 15분 |
| 6.1-6.2 문서 업데이트 | Low | 30분 |
| 7.1-7.3 테스트 | Medium | 2시간 |
| **Total** | | **약 8시간** |

---

## 주의사항

### 데이터 손실 방지
- 프로덕션 데이터 삭제 전 반드시 백업
- `--force` 플래그 없이는 덮어쓰기 불가
- 삭제 전 사용자 확인 프롬프트 필수

### 어댑터 설정
- 로컬 테스트: `FileStorageAdapter`
- Devvit playtest: `DevvitStorageAdapter`
- 환경에 맞는 어댑터 설정 확인

### 이미지 생성
- `--with-images` 플래그 사용 시 Gemini API 호출
- API 키 환경변수 확인 (`GEMINI_API_KEY`)
- 이미지 생성 실패 시 경고만 출력 (케이스는 생성)

---

**Created**: 2025-01-15
**Status**: Ready for Implementation
**Priority**: P0 (Critical)
