# 데이터 일관성 수정 Requirements

## Introduction

현재 앱에 표시되는 용의자 데이터와 코드/문서에 정의된 데이터 간에 심각한 불일치가 발생하고 있습니다. 이로 인해 잘못된 용의자 정보가 표시되고, 이미지가 로드되지 않는 문제가 발생합니다.

## Glossary

- **Case**: 하나의 추리 게임 사건
- **Suspect**: 용의자 (각 케이스당 3명)
- **Redis**: 데이터 저장소
- **CaseGeneratorService**: 케이스 생성 서비스
- **profileImageUrl**: 용의자 프로필 이미지 URL

## Requirements

### Requirement 1: 데이터 불일치 진단

**User Story:** 개발자로서, 현재 데이터베이스에 저장된 데이터와 코드에 정의된 데이터의 차이를 명확히 파악하고 싶습니다.

#### Acceptance Criteria

1. WHEN 진단 스크립트를 실행하면, THE System SHALL 데이터베이스에 저장된 용의자 목록을 출력한다
2. WHEN 진단 스크립트를 실행하면, THE System SHALL 코드에 정의된 용의자 목록을 출력한다
3. WHEN 진단 스크립트를 실행하면, THE System SHALL 두 목록의 차이점을 명확히 표시한다
4. WHEN 진단 스크립트를 실행하면, THE System SHALL 각 용의자의 이미지 URL 유효성을 검증한다

### Requirement 2: 케이스 데이터 재생성

**User Story:** 개발자로서, 잘못된 데이터를 올바른 데이터로 완전히 교체하고 싶습니다.

#### Acceptance Criteria

1. WHEN 케이스 재생성 명령을 실행하면, THE System SHALL 기존 케이스 데이터를 완전히 삭제한다
2. WHEN 기존 데이터 삭제 후, THE System SHALL CaseGeneratorService를 사용하여 새 케이스를 생성한다
3. WHEN 새 케이스 생성 시, THE System SHALL 정확히 3명의 용의자를 생성한다
4. WHEN 새 케이스 생성 시, THE System SHALL 각 용의자에 대한 유효한 이미지 URL을 생성한다
5. WHEN 케이스 재생성 완료 후, THE System SHALL 생성된 데이터를 검증하고 결과를 출력한다

### Requirement 3: 설계 문서 업데이트

**User Story:** 개발자로서, 설계 문서가 실제 코드와 일치하도록 업데이트하고 싶습니다.

#### Acceptance Criteria

1. THE System SHALL 설계 문서의 용의자 이름을 코드와 일치시킨다
2. THE System SHALL 용의자 수를 3명으로 명시한다
3. THE System SHALL 각 용의자의 역할과 배경을 명확히 기술한다

### Requirement 4: 데이터 검증 시스템

**User Story:** 개발자로서, 향후 이러한 불일치가 발생하지 않도록 자동 검증 시스템을 구축하고 싶습니다.

#### Acceptance Criteria

1. WHEN 케이스를 생성하면, THE System SHALL 용의자 수가 정확히 3명인지 검증한다
2. WHEN 케이스를 생성하면, THE System SHALL 각 용의자에 필수 필드가 모두 있는지 검증한다
3. WHEN 케이스를 생성하면, THE System SHALL 이미지 URL이 유효한지 검증한다
4. IF 검증 실패 시, THEN THE System SHALL 명확한 에러 메시지를 출력하고 저장을 중단한다

## 현재 상태 요약

### 데이터베이스 (Redis)
- 저장된 용의자: 이서연, 정우진, 윤지혁, 서도윤 (4명) ❌
- Redis 세트에 7명의 멤버 존재
- 이미지 URL: 없음 또는 유효하지 않음

### 코드 (CaseGeneratorService.ts)
- 정의된 용의자: 이서연, 박준호, 최민지 (3명) ✅
- 각 용의자에 배경, 성격, 죄의 여부 정의됨

### 설계 문서
- 문서의 용의자: 강태오, 박준호, 최민수 (3명) ✅
- 코드와 불일치 (문서가 오래됨)

## 우선순위

1. **P0 (Critical)**: Requirement 2 - 케이스 데이터 재생성
2. **P1 (High)**: Requirement 1 - 데이터 불일치 진단
3. **P2 (Medium)**: Requirement 4 - 데이터 검증 시스템
4. **P3 (Low)**: Requirement 3 - 설계 문서 업데이트
