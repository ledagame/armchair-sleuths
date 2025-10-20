# Archetype System Guide

완전히 재구성된 아키타입 시스템에 대한 가이드입니다.

## 📋 개요

이 시스템은 AI 용의자의 성격과 대화 패턴을 정의하는 아키타입을 관리합니다. 한국어↔영어 이중 언어를 지원하며, 빌드 타임에 YAML 파일을 JSON으로 변환하여 프로덕션 환경에서 안정적으로 작동합니다.

## 🏗️ 시스템 아키텍처

```
YAML Files (Source of Truth)
    ↓
Convert Script (Build Time)
    ↓
JSON Bundle (Vite)
    ↓
ArchetypePrompts.ts (Runtime)
    ↓
SuspectAIService (AI Response Generation)
```

## 📁 파일 구조

```
src/server/services/prompts/
├── archetypes/                      # YAML 아키타입 정의 (Source of Truth)
│   ├── wealthy-heir.yaml
│   ├── loyal-butler.yaml
│   ├── talented-artist.yaml
│   ├── business-partner.yaml
│   └── former-police-officer.yaml
├── archetypes-data.json            # 빌드 시 생성되는 JSON (자동)
├── ArchetypePrompts.ts             # 아키타입 로딩 및 관리
└── __tests__/
    └── ArchetypePrompts.test.ts    # 통합 테스트 (22 tests)

scripts/
├── convert-yaml-to-json.cjs        # YAML → JSON 변환 스크립트
└── validate-archetype-consistency.cjs  # 데이터 일관성 검증

src/server/services/case/
└── CaseElementLibrary.ts           # 케이스 생성 시 사용하는 한국어 이름
```

## 🚀 사용 가이드

### 빌드 및 배포

```bash
# 전체 빌드 (YAML → JSON 변환 자동 실행)
npm run build

# 서버만 빌드
npm run build:server

# YAML → JSON 수동 변환
npm run prebuild:server

# 배포
npm run deploy
```

### 검증 및 테스트

```bash
# 데이터 일관성 검증 (4개 테스트 스위트)
npm run suspect:validate-consistency

# 통합 테스트 실행 (22개 테스트)
npm run suspect:test

# 전체 검증 (validation + tests)
npm run suspect:validate-consistency && npm run suspect:test
```

### 개발 워크플로우

```bash
# 개발 서버 시작
npm run dev

# 타입 체크
npm run type-check

# 린트 및 포맷
npm run check
```

## 📝 아키타입 수정 가이드

### 1. YAML 파일 수정

아키타입을 수정할 때는 **YAML 파일만 수정**하세요. JSON은 빌드 시 자동 생성됩니다.

```yaml
# src/server/services/prompts/archetypes/wealthy-heir.yaml

name:
  en: "Wealthy Heir"      # 영어 이름 (ArchetypePrompts.ts에서 사용)
  ko: "부유한 상속인"      # 한국어 이름 (CaseElementLibrary.ts에서 사용)

aliases:                  # 추가 별칭 (선택사항)
  - "Wealthy Heir"
  - "부유한 상속인"

definition: |
  A privileged individual born into significant wealth...

personality:
  - "Arrogant and entitled"
  - "Dismissive of authority"

vocabulary:
  primary:
    - "attorney"
    - "lawyer"
  secondary:
    - "calendar"
    - "investment"

speechPatterns:
  COOPERATIVE:
    mindset: "Condescending cooperation"
    tone: "Polite but superior"
    patterns:
      - "I'll cooperate, of course"
      - "My attorney will confirm"
  NERVOUS:
    mindset: "Worried about reputation damage"
    tone: "Defensive, mentions lawyer"
    patterns:
      - "Perhaps I should call my attorney"
  # ... DEFENSIVE, AGGRESSIVE
```

### 2. 한국어 이름 변경 시

한국어 이름을 변경하면 **CaseElementLibrary.ts도 함께 수정**해야 합니다:

```typescript
// src/server/services/case/CaseElementLibrary.ts

export const SUSPECT_TYPES: SuspectType[] = [
  {
    archetype: '부유한 상속인',  // ← YAML의 name.ko와 일치해야 함
    baseNames: ['Victoria Sterling', 'Alexander Hunt'],
    // ...
  }
];
```

### 3. 검증

수정 후 반드시 검증을 실행하세요:

```bash
# 1. 데이터 일관성 검증
npm run suspect:validate-consistency

# 2. 통합 테스트
npm run suspect:test

# 3. 빌드 테스트
npm run build
```

## 🔍 검증 시스템

### 자동 검증 (4개 테스트 스위트)

`npm run suspect:validate-consistency` 실행 시:

1. **CaseElementLibrary Korean names validation**
   - CaseElementLibrary.ts의 한국어 이름이 YAML과 일치하는지 확인

2. **YAML file structure validation**
   - 모든 YAML 파일의 필수 필드 검증
   - name.en, name.ko 존재 확인

3. **JSON file validation**
   - 생성된 JSON 파일 유효성 검증
   - 5개 아키타입 모두 포함 확인

4. **Cross-reference consistency**
   - 모든 데이터 소스 간 일관성 검증

### 통합 테스트 (22개 테스트)

`npm run suspect:test` 실행 시:

- Korean→English 번역 테스트 (7 tests)
- 아키타입 데이터 로딩 테스트 (7 tests)
- 감정 상태 매핑 테스트 (4 tests)
- 데이터 일관성 테스트 (2 tests)
- 폴백 시스템 테스트 (1 test)
- End-to-End 흐름 테스트 (1 test)

## 🛡️ CI/CD 통합

### GitHub Actions

`.github/workflows/validate-archetypes.yml`이 자동으로:

1. 아키타입 관련 파일 변경 감지
2. 데이터 일관성 검증 실행
3. YAML → JSON 변환
4. 통합 테스트 실행
5. PR에 검증 결과 코멘트

### Pre-commit Hook

`.husky/pre-commit`이 커밋 전에:

1. 아키타입 파일 변경 감지
2. 자동 검증 실행
3. JSON 재생성 및 스테이징
4. 검증 실패 시 커밋 차단

설치 방법:
```bash
npm install husky --save-dev
npx husky install
```

## 🔧 트러블슈팅

### "Archetype not found" 에러

```
Unknown archetype name: 부유한 상속자 (not found in aliases)
```

**원인**: CaseElementLibrary.ts의 한국어 이름이 YAML과 불일치

**해결**:
```bash
# 1. 검증 실행하여 불일치 확인
npm run suspect:validate-consistency

# 2. CaseElementLibrary.ts 수정
# 3. 재검증
npm run suspect:validate-consistency
```

### "ENOENT: no such file" 에러

```
Error: ENOENT: no such file or directory, open '/srv/archetypes/loyal-butler.yaml'
```

**원인**: JSON 파일이 생성되지 않았거나 번들링되지 않음

**해결**:
```bash
# 1. JSON 파일 생성
npm run prebuild:server

# 2. 전체 리빌드
npm run build

# 3. JSON 파일 확인
ls src/server/services/prompts/archetypes-data.json
```

### 캐시 문제

**문제**: 아키타입 데이터가 업데이트되지 않음

**해결**:
```bash
# 1. 빌드 디렉토리 삭제
rm -rf dist/

# 2. 재빌드
npm run build

# 3. 개발 서버 재시작
npm run dev
```

## 📊 시스템 메트릭

### Phase 1-3 구현 후 개선 사항

| 항목 | Before | After |
|------|--------|-------|
| Korean 이름 매칭률 | 20% (1/5) | 100% (5/5) |
| 별칭 캐시 엔트리 | 0개 | 10+개 |
| 프로덕션 파일 접근 | ❌ ENOENT | ✅ JSON 번들링 |
| 데이터 일관성 검증 | 수동 | 자동 (4 suites) |
| 통합 테스트 | 없음 | 22 tests |
| 폴백 시스템 | 단일 | 3-layer |

### 빌드 프로세스

```
YAML (5 files) → JSON (29.65 KB) → Bundle (5.2 MB)
                ↓
         10+ alias entries
         80 vocabulary words
         20 speech pattern states
```

## 🎯 베스트 프랙티스

### DO ✅

- YAML 파일을 Source of Truth로 사용
- 수정 후 반드시 검증 실행
- 한국어 이름 변경 시 CaseElementLibrary.ts도 업데이트
- 커밋 전 pre-commit hook 확인
- CI/CD 검증 통과 확인

### DON'T ❌

- JSON 파일 직접 수정 (자동 생성됨)
- 검증 없이 프로덕션 배포
- CaseElementLibrary.ts와 YAML 불일치 방치
- 테스트 실패 무시

## 🔗 관련 문서

- [Phase 1-3 Implementation Complete](../PHASE_IMPLEMENTATION_COMPLETE.md)
- [Prompt System Explained](./참고문서.md/PROMPT_SYSTEM_EXPLAINED.md)
- [Suspect AI Prompter Skill](../skills/suspect-ai-prompter/README.md)
- [Suspect Personality Core Skill](../skills/suspect-personality-core/PROMPT.md)

## 📞 지원

문제가 발생하면:

1. `npm run suspect:validate-consistency` 실행
2. 에러 메시지 확인
3. 이 가이드의 트러블슈팅 섹션 참고
4. 여전히 문제가 있다면 GitHub Issues에 보고
