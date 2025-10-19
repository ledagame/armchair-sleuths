# Intro Narration System - Implementation Tasks

## Overview

이 문서는 인트로 나레이션 시스템의 구현 작업을 정의합니다. MVP-First 원칙에 따라 핵심 기능에 집중하며, 과도한 엔지니어링을 피하고 실제 작동하는 최소한의 코드로 구현합니다.

## Task Breakdown

- [x] 1. 공유 타입 정의





  - **File**: src/shared/types/index.ts (update)
  - **Layer**: Shared Types
  - IntroNarration 인터페이스 추가 (atmosphere, incident, stakes)
  - NarrationPhase 타입 추가 ('atmosphere' | 'incident' | 'stakes')
  - GeneratedCase에 introNarration?: IntroNarration 필드 추가
  - GameScreen에 'intro' 추가
  - _Requirements: 1.1, 3.1_

- [x] 2. 서버: 나레이션 생성 로직 구현




  - **File**: src/server/services/case/CaseGeneratorService.ts (update)
  - **Layer**: Server-Side Business Logic
  - generateIntroNarration() private 메서드 추가
    - Gemini API 호출로 3단계 나레이션 생성
    - 프롬프트: 케이스 정보 기반 (victim, location, weapon, suspects)
    - 단어 수 제한 명시 (50-80, 50-80, 50-90)
    - 5초 타임아웃 설정
  - generateFallbackNarration() private 메서드 추가
    - 간단한 템플릿 기반 기본 나레이션
  - generateCase() 메서드 수정
    - 케이스 스토리 생성 후 나레이션 생성 추가
    - try-catch로 실패 시 Fallback 사용
    - CreateCaseInput에 introNarration 포함
  - _Requirements: 3.1-3.7, 6.1-6.3, 6.6_
  - _Note: 단어 수 검증은 경고만 출력, 실패 처리 안 함 (Over-Engineering 방지)_

- [x] 3. 데이터 레이어: 타입 확장




  - [x] 3.1 KVStoreManager 타입 업데이트


    - **File**: src/server/services/repositories/kv/KVStoreManager.ts (update)
    - **Layer**: Data Layer
    - CaseData 인터페이스에 introNarration?: IntroNarration 추가
    - _Requirements: 3.6_
  
  - [x] 3.2 CaseRepository 인터페이스 업데이트


    - **File**: src/server/services/repositories/kv/CaseRepository.ts (update)
    - **Layer**: Data Layer
    - CreateCaseInput에 introNarration?: IntroNarration 추가
    - _Requirements: 3.6, 6.4, 6.5_

- [x] 4. 클라이언트: 나레이션 표시 Hook




  - **File**: src/client/hooks/useIntroNarration.ts (new)
  - **Layer**: Client Component
  - 상태: currentPhase, displayedText, isComplete, isSkipped
  - 스트리밍 로직: 200ms 간격으로 단어 추가
  - skip() 함수: 현재 페이즈 전체 텍스트 즉시 표시
  - nextPhase() 함수: atmosphere → incident → stakes → complete
  - useEffect cleanup으로 메모리 누수 방지
  - _Requirements: 1.2-1.5, 2.1-2.4_
  - _Note: 단순한 상태 관리, 복잡한 최적화 불필요_

- [x] 5. 클라이언트: IntroNarration 컴포넌트




  - **File**: src/client/components/intro/IntroNarration.tsx (new)
  - **Layer**: Client Component
  - useIntroNarration Hook 사용
  - 키보드 이벤트: Space/Enter로 skip
  - 완료 시 onComplete 콜백 호출 (1초 후)
  - Phase 인디케이터 표시 (1/3, 2/3, 3/3)
  - Skip 버튼 (우측 하단)
  - 인라인 스타일 또는 간단한 CSS
    - 어두운 배경 (black)
    - 흰색 텍스트 (중앙 정렬)
    - 페이드인/아웃 애니메이션
    - 모바일 반응형
  - _Requirements: 1.1, 1.6, 2.2, 2.3, 2.5, 4.1-4.8_
  - _Note: CSS 파일 분리 불필요, 컴포넌트 내 스타일로 충분_

- [x] 6. 클라이언트: App.tsx 통합





  - **File**: src/client/App.tsx (update)
  - **Layer**: Client Component
  - **Integration Point**: useEffect (caseData 로딩 완료 시)
  - 로직 수정:
    - caseData.introNarration 있으면 → setCurrentScreen('intro')
    - 없으면 → setCurrentScreen('case-overview')
  - handleIntroComplete 콜백 추가 → setCurrentScreen('case-overview')
  - renderScreen에 intro 케이스 추가
  - _Requirements: 1.1, 1.6, 5.1_

- [ ]* 7. 수동 테스트 및 검증
  - **File**: N/A (manual testing)
  - **Layer**: All Layers
  - 케이스 생성 시 나레이션 포함 확인
  - 3단계 나레이션 순차 표시 확인
  - Skip 기능 작동 확인 (버튼, Space, Enter)
  - 자동 전환 확인 (intro → case-overview)
  - Fallback 나레이션 작동 확인 (Gemini 실패 시)
  - 모바일/데스크톱 브라우저 테스트
  - _Requirements: All_
  - _Note: 자동화된 테스트는 선택사항, 수동 테스트로 충분_

## Implementation Order

**순차 실행 (Vertical Slice):**

1. **Task 1**: 타입 정의 (5분)
2. **Task 2**: 서버 나레이션 생성 (30분)
3. **Task 3.1-3.2**: 데이터 레이어 타입 확장 (10분)
4. **Task 4**: 클라이언트 Hook (20분)
5. **Task 5**: IntroNarration 컴포넌트 (30분)
6. **Task 6**: App.tsx 통합 (10분)
7. **Task 7**: 수동 테스트 (15분)

**총 예상 시간: 약 2시간**

## Success Criteria

MVP 완료 조건:

- ✅ 케이스 생성 시 나레이션 자동 생성 (Gemini API)
- ✅ 3단계 나레이션 순차 표시 (타이핑 효과)
- ✅ Skip 기능 작동 (버튼, Space, Enter)
- ✅ 자동 전환 (intro → case-overview)
- ✅ Fallback 나레이션 작동 (API 실패 시)
- ✅ 기본 접근성 (키보드, 색상 대비)
- ✅ 모바일/데스크톱 작동

## MVP-First Principles Applied

### ✅ 단순화된 부분:
- **단어 수 검증**: 경고만 출력, 실패 처리 안 함
- **스타일링**: 별도 CSS 파일 불필요, 인라인 또는 간단한 CSS
- **최적화**: React.memo, useMemo 등 초기에 불필요
- **테스트**: 자동화 테스트 생략, 수동 테스트로 충분
- **문서화**: 별도 구현 보고서 불필요

### ✅ 핵심 기능에 집중:
- Gemini API 나레이션 생성
- 3단계 스트리밍 표시
- Skip 기능
- 자동 전환
- Fallback 처리

### ✅ Over-Engineering 방지:
- 복잡한 상태 관리 라이브러리 사용 안 함
- 과도한 추상화 레이어 없음
- 불필요한 유틸리티 함수 생성 안 함
- 조기 최적화 안 함

## Notes

- **Atomic Development**: 각 태스크는 독립적으로 완료 가능하며, 빌드가 깨지지 않음
- **Serial Execution**: 태스크는 순차적으로 실행 (1→2→3→4→5→6→7)
- **No Assumptions**: 각 태스크는 명확한 입력/출력 정의
- **Vertical Slice**: 서버→데이터→클라이언트 순으로 완전한 기능 구현

## Related Documents

- `.kiro/specs/intro-narration/requirements.md` - 요구사항 명세
- `.kiro/specs/intro-narration/design.md` - 설계 문서
