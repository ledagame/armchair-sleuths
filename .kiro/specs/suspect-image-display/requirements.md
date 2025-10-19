# 용의자 이미지 표시 기능 Requirements

## Introduction

현재 서버에서 용의자 이미지를 `profileImageUrl`로 생성하고 있지만, 클라이언트 타입과 UI에서는 이를 인식하지 못하는 문제를 해결합니다. 또한 Redis Set에 용의자 ID가 중복 저장되는 문제와 케이스 재생성 시 이전 데이터가 정리되지 않는 문제도 함께 수정합니다.

## Glossary

- **Suspect**: 용의자 - 사건의 용의자 정보를 담은 데이터 객체
- **profileImageUrl**: 프로필 이미지 URL - 서버에서 생성한 용의자 이미지 경로 (서버 측 필드명)
- **imageUrl**: 이미지 URL - 클라이언트에서 사용하는 이미지 경로 (클라이언트 측 필드명)
- **Redis Set**: Redis 집합 - 중복을 허용하지 않는 데이터 구조 (하지만 현재 중복 저장되고 있음)
- **KVStoreManager**: 키-밸류 저장소 관리자 - Redis 작업을 추상화한 서비스
- **SuspectPanel**: 용의자 패널 - 용의자 목록을 표시하는 UI 컴포넌트
- **CaseGeneratorService**: 케이스 생성 서비스 - AI로 케이스를 생성하는 서비스

## Requirements

### Requirement 1: 용의자 이미지 필드명 통일

**User Story:** 개발자로서, 서버와 클라이언트 간 이미지 필드명을 통일하여 데이터 흐름을 명확하게 하고 싶습니다.

#### Acceptance Criteria

1. THE Client Suspect interface SHALL include `imageUrl` field (mapped from server's profileImageUrl)
2. THE Server SHALL continue using `profileImageUrl` in GeneratedCase type
3. THE API response SHALL map `profileImageUrl` to `imageUrl` when sending to client
4. WHEN suspect data is fetched, THE System SHALL include imageUrl in client response

### Requirement 2: Redis 데이터 정리 및 중복 방지

**User Story:** 개발자로서, Redis에 중복 저장된 용의자 데이터를 정리하고 재생성 시 깨끗한 상태에서 시작하고 싶습니다.

#### Acceptance Criteria

1. WHEN case is regenerated, THE KVStoreManager SHALL delete existing case data before creating new data
2. THE KVStoreManager SHALL delete suspect Set (`case:${caseId}:suspects`) before adding new suspects
3. THE KVStoreManager SHALL delete individual suspect data (`suspect:${suspectId}`) for all old suspects
4. WHEN fetching suspects, THE System SHALL return exactly 3 suspects per case
5. THE System SHALL log all Redis delete and add operations for debugging

### Requirement 3: 용의자 이미지 UI 표시

**User Story:** 사용자로서, 각 용의자의 이미지를 보고 싶습니다.

#### Acceptance Criteria

1. WHEN SuspectPanel renders, THE System SHALL display suspect images if imageUrl exists
2. WHERE imageUrl is missing, THE System SHALL display a placeholder icon
3. THE System SHALL display images with proper aspect ratio and sizing
4. THE System SHALL handle image loading errors gracefully with fallback UI

### Requirement 4: 서버-클라이언트 데이터 동기화 및 필드 매핑

**User Story:** 개발자로서, 서버에서 생성한 이미지가 클라이언트에 정확히 전달되고 올바른 필드명으로 매핑되는지 확인하고 싶습니다.

#### Acceptance Criteria

1. WHEN server generates suspect images, THE CaseGeneratorService SHALL save profileImageUrl to suspect data
2. WHEN client fetches suspect data via API, THE Server SHALL map profileImageUrl to imageUrl in response
3. THE API endpoint SHALL include imageUrl field in Suspect response type
4. THE System SHALL handle missing profileImageUrl gracefully (return undefined for imageUrl)
5. THE System SHALL log image generation, storage, and retrieval operations

### Requirement 5: 이미지 로딩 성능

**User Story:** 사용자로서, 용의자 이미지가 빠르게 로드되기를 원합니다.

#### Acceptance Criteria

1. THE System SHALL display loading skeleton while images are loading
2. THE System SHALL lazy load images to improve initial page load time
3. WHEN image fails to load, THE System SHALL retry once before showing fallback
4. THE System SHALL cache loaded images in browser

---

**Requirements Version**: 1.0  
**Created**: 2025-01-18  
**Status**: Draft
