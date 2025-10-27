# Case Validation Rules

## 필수 검증 항목

### 1. 진범 검증
- **규칙**: 정확히 1명의 용의자만 `isGuilty: true`
- **오류**: "Expected exactly 1 guilty suspect, found {count}"
- **수정**: 케이스 재생성 또는 수동 수정

### 2. 용의자 수 검증
- **규칙**: 정확히 3명의 용의자
- **오류**: "Expected 3 suspects, found {count}"
- **수정**: 케이스 재생성

### 3. 5W1H 완전성
- **규칙**: solution 객체의 모든 필드 필수
  - who: 범인 이름
  - what: 살인 방법
  - where: 구체적 장소
  - when: 시간대
  - why: 동기
  - how: 실행 방법
- **오류**: "Missing solution fields: {fields}"
- **수정**: 수동 추가 또는 재생성

### 4. 피해자 정보
- **규칙**: name, background 필수
- **오류**: "Victim {field} is missing"

### 5. 케이스 요소
- **규칙**: weapon, location 정보 필수
- **오류**: "{element} information is missing"

## 경고 항목

### 이미지 누락
- 케이스 씬 이미지
- 용의자 프로필 이미지

### 선택 필드 누락
- 용의자 background
- 용의자 personality

## 모순 검사

1. solution.who가 실제 진범과 일치하는지
2. solution.where가 location과 일치하는지
3. solution.what이 weapon과 일치하는지
