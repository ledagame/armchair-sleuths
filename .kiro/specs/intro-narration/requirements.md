# Intro Narration System Requirements

## Introduction

게임 시작 시 플레이어에게 몰입감 있는 스토리 경험을 제공하는 인트로 나레이션 시스템입니다. Gemini API를 사용하여 케이스별로 맞춤화된 나레이션을 생성하며, 케이스 생성 시점에 나레이션도 함께 생성되어 기존 게임 시스템에 seamless하게 통합됩니다.

## Glossary

- **Intro Narration System**: 게임 시작 시 케이스 배경을 설명하는 나레이션 시스템
- **Narration Phase**: 나레이션의 3단계 구성 (Atmosphere, Incident, Stakes)
- **Atmosphere Phase**: 장소와 분위기를 설정하는 첫 번째 단계
- **Incident Phase**: 사건 발생을 설명하는 두 번째 단계
- **Stakes Phase**: 플레이어의 역할과 임무를 제시하는 세 번째 단계
- **Streaming Effect**: 텍스트가 단어 단위로 점진적으로 표시되는 타이핑 효과
- **AI-based Generation**: Gemini API를 사용하여 케이스 데이터 기반으로 동적 나레이션 생성
- **Case Data**: 피해자, 장소, 무기, 용의자 등 케이스 관련 정보
- **Skip Function**: 사용자가 나레이션을 건너뛸 수 있는 기능
- **CaseGeneratorService**: 케이스 생성을 담당하는 서버 비즈니스 로직
- **Gemini API**: Google의 생성형 AI API (gemini-flash-latest 모델 사용)

## Requirements

### Requirement 1: 인트로 나레이션 표시

**User Story:** 플레이어로서, 게임 시작 시 케이스 배경을 설명하는 몰입감 있는 인트로 나레이션을 보고 싶다.

#### Acceptance Criteria

1. WHEN 케이스 데이터 로딩이 완료되면, THE Intro Narration System SHALL 로딩 화면에서 인트로 화면으로 전환한다.

2. THE Intro Narration System SHALL 3개의 Narration Phase를 순차적으로 표시한다.
   - Phase 1: Atmosphere (50-80 단어)
   - Phase 2: Incident (50-80 단어)
   - Phase 3: Stakes (50-90 단어)

3. WHILE Narration Phase가 표시되는 동안, THE Intro Narration System SHALL 단어 단위로 텍스트를 점진적으로 표시한다 (Streaming Effect).

4. THE Intro Narration System SHALL 각 단어를 200ms 간격으로 표시한다.

5. WHEN 하나의 Narration Phase가 완료되면, THE Intro Narration System SHALL 1초 대기 후 다음 Phase로 자동 전환한다.

6. WHEN 모든 Narration Phase가 완료되면, THE Intro Narration System SHALL 케이스 개요 화면으로 자동 전환한다.

### Requirement 2: Skip 기능

**User Story:** 플레이어로서, 인트로 나레이션을 건너뛰고 바로 게임을 시작하고 싶다.

#### Acceptance Criteria

1. THE Intro Narration System SHALL 화면 우측 하단에 Skip 버튼을 표시한다.

2. WHEN 사용자가 Skip 버튼을 클릭하면, THE Intro Narration System SHALL 현재 Phase의 전체 텍스트를 즉시 표시한다.

3. WHEN 사용자가 Space 키 또는 Enter 키를 누르면, THE Intro Narration System SHALL Skip 버튼 클릭과 동일하게 동작한다.

4. WHEN Skip이 실행되면, THE Intro Narration System SHALL 1초 후 다음 Phase로 전환하거나 완료 처리한다.

5. THE Intro Narration System SHALL 모바일 터치 입력으로도 Skip 기능을 지원한다.

### Requirement 3: AI 기반 나레이션 생성

**User Story:** 플레이어로서, 각 케이스마다 고유하고 몰입감 있는 배경 스토리를 경험하고 싶다.

#### Acceptance Criteria

1. WHEN CaseGeneratorService가 새 케이스를 생성하면, THE Intro Narration System SHALL Gemini API를 사용하여 인트로 나레이션을 생성한다.

2. THE Intro Narration System SHALL Case Data (피해자, 장소, 무기, 용의자)를 기반으로 나레이션을 동적으로 생성한다.

3. THE Intro Narration System SHALL Atmosphere Phase에서 다음 요소를 포함한다:
   - 장소 설명 (location.name, location.description)
   - 시간대 및 분위기 설정
   - 감각적 디테일 (시각, 청각, 후각)
   - 50-80 단어 제한

4. THE Intro Narration System SHALL Incident Phase에서 다음 요소를 포함한다:
   - 피해자 정보 (victim.name, victim.background)
   - 발견 장소 및 상황
   - 무기 정보 (weapon.name)
   - 현장 상태 묘사
   - 50-80 단어 제한

5. THE Intro Narration System SHALL Stakes Phase에서 다음 요소를 포함한다:
   - 플레이어 역할 (탐정)
   - 용의자 수 (suspects.length)
   - 시간 압박 및 긴장감
   - 행동 촉구
   - 50-90 단어 제한

6. THE Intro Narration System SHALL 생성된 나레이션을 CaseData와 함께 Redis에 저장한다.

7. THE Intro Narration System SHALL Gemini API 호출 실패 시 기본 나레이션을 생성한다.

### Requirement 4: UI 및 접근성

**User Story:** 플레이어로서, 인트로 나레이션을 명확하게 읽고 이해할 수 있어야 한다.

#### Acceptance Criteria

1. THE Intro Narration System SHALL 어두운 배경 (검은색 또는 어두운 그라데이션)을 사용한다.

2. THE Intro Narration System SHALL 나레이션 텍스트를 화면 중앙에 정렬하여 표시한다.

3. THE Intro Narration System SHALL 텍스트와 배경 간 색상 대비를 4.5:1 이상으로 유지한다.

4. THE Intro Narration System SHALL 현재 Phase 진행 상태를 표시한다 (예: "Phase 1/3").

5. THE Intro Narration System SHALL 페이드인 애니메이션으로 화면에 진입한다.

6. THE Intro Narration System SHALL 완료 시 페이드아웃 애니메이션으로 화면에서 퇴장한다.

7. THE Intro Narration System SHALL 키보드 네비게이션을 지원한다.

8. THE Intro Narration System SHALL 스크린 리더가 나레이션 텍스트를 읽을 수 있도록 한다.

### Requirement 5: 성능 및 호환성

**User Story:** 플레이어로서, 인트로 나레이션이 빠르게 로드되고 부드럽게 동작하기를 원한다.

#### Acceptance Criteria

1. THE Intro Narration System SHALL 케이스 데이터 로딩 완료 후 1초 이내에 인트로 화면을 표시한다.

2. THE Intro Narration System SHALL 나레이션 생성을 5초 이내에 완료한다.

3. THE Intro Narration System SHALL 메모리 누수를 방지하기 위해 cleanup 함수를 구현한다.

4. THE Intro Narration System SHALL 모바일 브라우저 (Chrome, Safari)에서 정상 동작한다.

5. THE Intro Narration System SHALL 데스크톱 브라우저 (Chrome, Firefox, Safari)에서 정상 동작한다.

6. THE Intro Narration System SHALL Devvit 플랫폼의 30초 타임아웃 제한 내에서 완료한다.

### Requirement 6: 케이스 생성 통합

**User Story:** 개발자로서, 나레이션 생성이 기존 케이스 생성 시스템에 seamless하게 통합되기를 원한다.

#### Acceptance Criteria

1. WHEN CaseGeneratorService.generateCase()가 호출되면, THE Intro Narration System SHALL 케이스 스토리 생성 후 자동으로 나레이션을 생성한다.

2. THE Intro Narration System SHALL 나레이션 생성을 케이스 이미지 생성 전에 수행한다.

3. THE Intro Narration System SHALL 나레이션 생성 실패 시에도 케이스 생성을 계속 진행한다.

4. THE Intro Narration System SHALL 생성된 나레이션을 GeneratedCase 타입에 포함하여 반환한다.

5. THE Intro Narration System SHALL 기존 케이스 조회 시 저장된 나레이션을 함께 반환한다.

6. THE Intro Narration System SHALL 나레이션 생성 시간을 5초 이내로 제한한다.

## Out of Scope (Phase 2)

다음 기능들은 MVP 범위에서 제외되며, 향후 Phase 2에서 구현됩니다:

- 배경 음악 (BGM)
- 효과음 (천둥, 빗소리 등)
- 음성 나레이션 (TTS)
- 고급 시각 효과 (파티클, 시네마틱 전환)
- 사용자 설정 (나레이션 속도 조절, 자동 Skip, 인트로 비활성화)
- 케이스 이미지 배경
- 나레이션 재생성 기능

## Success Metrics

- 인트로 완료율: 80% 이상 (Skip 포함)
- 평균 인트로 시청 시간: 30-60초
- Skip 사용률: 20% 이하
- 로딩 시간: 1초 이내
- 모바일 호환성: 95% 이상
