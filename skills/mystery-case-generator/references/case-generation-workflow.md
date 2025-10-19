# Case Generation Workflow

## 완전한 케이스 생성 파이프라인

### Step 1: 케이스 요소 선택

**CaseElementLibrary**에서 오늘의 요소를 결정론적으로 선택:
- 무기 (6개 중 1개)
- 동기 (5개 중 1개)
- 장소 (5개 중 1개)
- 용의자 원형 (5개 중 3개)

선택은 날짜 기반 시드로 결정론적 랜덤 생성.

### Step 2: Gemini 스토리 생성

**프롬프트 구조:**
```
당신은 탐정 소설 작가입니다. 다음 요소들을 사용하여 플레이 가능한 살인 미스터리 케이스를 생성하세요.

**제약 조건:**
- 무기: {weapon.name}
- 동기: {motive.category}
- 장소: {location.name}
- 용의자 원형: {3개}

**생성 규칙:**
1. 피해자: 한국 이름, 배경, 용의자들과의 관계
2. 용의자 3명: 한 명만 진범
3. 해결책 5W1H: WHO, WHAT, WHERE, WHEN, WHY, HOW
```

**응답 형식**: JSON (victim, suspects[], solution)

### Step 3: 이미지 생성 (선택)

**케이스 씬 이미지:**
```
Crime scene illustration: {location.name}, {location.atmosphere}.
Scene includes {location.props}.
Evidence of {weapon.name}.
Dark, moody lighting.
Professional detective game art style.
No text, no people visible.
```

**용의자 프로필 이미지** (각각):
```
Professional portrait photograph of a {archetype}.
Character: {suspect.name}
Style: Professional headshot, cinematic lighting.
Format: 512x512 portrait photograph.
Mood: Mystery, intrigue.
```

### Step 4: 검증

자동 검증 항목:
- ✅ 정확히 1명의 진범
- ✅ 용의자 3명
- ✅ 5W1H 모든 필드 존재
- ✅ 피해자 정보 완전성

### Step 5: KV 스토어 저장

**저장 구조:**
```
cases/{case-id} → CaseData
suspects/{case-id}/{suspect-id} → SuspectData
```

### Step 6: Reddit 배포 (선택)

Devvit API를 통한 포스트 생성.
