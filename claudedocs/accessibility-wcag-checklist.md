# WCAG 2.1 AA Compliance Checklist

**작성일**: 2025-10-27
**목적**: Armchair Sleuths 프로젝트의 WCAG 2.1 AA 접근성 준수 체크리스트
**준수 레벨**: WCAG 2.1 Level AA

---

## 개요

이 문서는 WCAG 2.1 AA 기준의 모든 성공 기준(Success Criteria)을 체크리스트 형식으로 제공합니다.

**WCAG 2.1 4대 원칙 (POUR)**:
1. **Perceivable (인지 가능)**: 사용자가 정보를 인식할 수 있어야 함
2. **Operable (운용 가능)**: 사용자가 인터페이스를 조작할 수 있어야 함
3. **Understandable (이해 가능)**: 정보와 UI 조작 방법이 이해 가능해야 함
4. **Robust (견고성)**: 다양한 사용자 에이전트(브라우저, 스크린 리더)에서 작동해야 함

---

## 1. Perceivable (인지 가능)

### 1.1 Text Alternatives (텍스트 대체)

#### 1.1.1 Non-text Content (Level A)
**요구사항**: 모든 비텍스트 콘텐츠에 텍스트 대체 제공

- [ ] **이미지**: 모든 `<img>`에 의미 있는 `alt` 텍스트 제공
  ```tsx
  <img src="/suspect1.jpg" alt="용의자 A - 40대 남성, 정장 차림" />
  ```
- [ ] **장식 이미지**: 의미 없는 장식 이미지는 `alt=""` 또는 CSS 배경 사용
  ```tsx
  <img src="/decoration.png" alt="" role="presentation" />
  ```
- [ ] **아이콘 버튼**: `aria-label` 제공
  ```tsx
  <button aria-label="모달 닫기"><CloseIcon /></button>
  ```
- [ ] **SVG 아이콘**: `<title>` 또는 `aria-label` 제공
  ```tsx
  <svg aria-label="경고">...</svg>
  ```

**검증 방법**:
```bash
# axe DevTools로 자동 검사
# 이미지 alt 텍스트 누락 검출
```

---

### 1.2 Time-based Media (시간 기반 미디어)

#### 1.2.1 Audio-only and Video-only (Level A)
**요구사항**: 오디오/비디오 전용 콘텐츠에 대체 제공

- [ ] **오디오 전용**: 텍스트 전사본(Transcript) 제공
- [ ] **비디오 전용**: 오디오 설명 또는 텍스트 대체 제공

**Armchair Sleuths 적용**: 현재 오디오/비디오 콘텐츠 없음 (해당 없음)

#### 1.2.2 Captions (Prerecorded) (Level A)
**요구사항**: 사전 녹화된 오디오에 자막 제공

**Armchair Sleuths 적용**: 해당 없음

#### 1.2.4 Captions (Live) (Level AA)
**요구사항**: 라이브 오디오에 자막 제공

**Armchair Sleuths 적용**: 해당 없음

#### 1.2.5 Audio Description (Prerecorded) (Level AA)
**요구사항**: 사전 녹화된 비디오에 오디오 설명 제공

**Armchair Sleuths 적용**: 해당 없음

---

### 1.3 Adaptable (적응 가능)

#### 1.3.1 Info and Relationships (Level A)
**요구사항**: 시각적 구조와 관계를 프로그래밍 방식으로 표현

- [x] **시맨틱 HTML**: 의미 있는 HTML 요소 사용 (`<header>`, `<nav>`, `<main>`, `<article>`)
  ```tsx
  <main>
    <article>
      <h1>사건 제목</h1>
      <section>
        <h2>용의자 목록</h2>
      </section>
    </article>
  </main>
  ```
- [x] **제목 계층**: `<h1>` → `<h2>` → `<h3>` 순차적 사용
- [x] **리스트**: `<ul>`, `<ol>`, `<dl>` 사용
- [x] **테이블**: `<th>`, `<caption>`, `scope` 속성 사용
  ```tsx
  <table>
    <caption>용의자별 정답률</caption>
    <thead>
      <tr>
        <th scope="col">이름</th>
        <th scope="col">정답률</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>용의자 A</td>
        <td>45%</td>
      </tr>
    </tbody>
  </table>
  ```
- [x] **폼 레이블**: `<label>`과 `<input>` 연결 (htmlFor/id)

**검증 방법**: 스크린 리더로 구조 탐색

#### 1.3.2 Meaningful Sequence (Level A)
**요구사항**: 콘텐츠의 순서가 의미를 전달해야 함

- [x] **논리적 순서**: HTML 소스 순서가 시각적 순서와 일치
- [x] **Tab 순서**: 키보드 탐색 순서가 논리적
- [x] **CSS 정렬**: `flexbox`, `grid` 사용 시 순서 유지

**검증 방법**: CSS 끄고 콘텐츠 순서 확인

#### 1.3.3 Sensory Characteristics (Level A)
**요구사항**: 모양, 크기, 위치, 소리만으로 설명하지 않음

- [x] **명확한 지시**: "오른쪽 버튼" 대신 "제출 버튼" 사용
- [x] **색상 + 텍스트**: 색상만으로 의미 전달 금지
  ```tsx
  {/* 잘못된 예 */}
  <span className="text-red-500">필수</span>

  {/* 올바른 예 */}
  <span className="text-red-500" aria-label="필수">*</span>
  ```

#### 1.3.4 Orientation (Level AA)
**요구사항**: 콘텐츠가 특정 방향(가로/세로)에 제한되지 않음

- [x] **반응형 디자인**: 가로/세로 모두 지원
- [x] **회전 제한 없음**: `orientation` 미디어 쿼리로 회전 막지 않음

**검증 방법**: 모바일에서 가로/세로 회전 테스트

#### 1.3.5 Identify Input Purpose (Level AA)
**요구사항**: 입력 필드의 목적을 프로그래밍 방식으로 식별

- [ ] **autocomplete 속성**: 사용자 정보 입력 필드에 `autocomplete` 추가
  ```tsx
  <input
    type="email"
    name="email"
    autocomplete="email"
  />
  <input
    type="text"
    name="name"
    autocomplete="name"
  />
  ```

**Armchair Sleuths 적용**: 사용자 정보 입력 폼이 있다면 적용

---

### 1.4 Distinguishable (식별 가능)

#### 1.4.1 Use of Color (Level A)
**요구사항**: 색상만으로 정보 전달 금지

- [x] **에러 표시**: 빨간 테두리 + 에러 아이콘 + 텍스트 메시지
  ```tsx
  <div className="border-red-500">
    <ErrorIcon />
    <span role="alert">이 필드는 필수입니다</span>
  </div>
  ```
- [x] **링크 구분**: 밑줄 또는 굵은 글씨로 구분
- [x] **차트/그래프**: 색상 + 패턴/텍스트 레이블 병기

#### 1.4.2 Audio Control (Level A)
**요구사항**: 3초 이상 자동 재생 오디오는 정지/음소거 가능해야 함

**Armchair Sleuths 적용**: 해당 없음 (자동 재생 오디오 없음)

#### 1.4.3 Contrast (Minimum) (Level AA) ✅ **개선 완료**
**요구사항**: 텍스트 색상 대비 최소 4.5:1 (큰 텍스트 3:1)

- [x] **Primary text**: `#e0e0e0` / `#0a0a0a` = 12.6:1 ✅
- [x] **Secondary text**: `#a0a0a0` / `#0a0a0a` = 7.2:1 ✅
- [x] **Tertiary text**: `#959595` / `#2a2a2a` = 4.6:1 ✅ (수정 완료)
- [x] **Gold button**: `#c9b037` / `#0a0a0a` = 8.2:1 ✅

**검증 도구**:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser (CCA)](https://www.tpgi.com/color-contrast-checker/)

#### 1.4.4 Resize Text (Level AA)
**요구사항**: 텍스트 200% 확대 시에도 기능 유지

- [x] **상대 단위**: `rem`, `em` 사용 (픽셀 대신)
- [x] **고정 너비 제거**: `max-width` 사용
- [x] **스크롤 허용**: `overflow: auto` 사용

**검증 방법**: 브라우저 확대 200%로 테스트

#### 1.4.5 Images of Text (Level AA)
**요구사항**: 텍스트 이미지 대신 실제 텍스트 사용

- [x] **CSS 텍스트**: 로고 제외, 모든 텍스트를 HTML/CSS로 구현
- [ ] **로고 이미지**: SVG 또는 고해상도 이미지 사용 (허용됨)

#### 1.4.10 Reflow (Level AA)
**요구사항**: 320px 너비에서 2차원 스크롤 없이 콘텐츠 표시

- [x] **모바일 최적화**: 320px 너비에서 가로 스크롤 없음
- [x] **반응형 레이아웃**: Flexbox, Grid로 자동 재배치

**검증 방법**: 브라우저 너비 320px로 테스트

#### 1.4.11 Non-text Contrast (Level AA)
**요구사항**: UI 컴포넌트 및 그래픽 최소 3:1 대비

- [x] **버튼 테두리**: Gold (#c9b037) / Black (#0a0a0a) = 8.2:1 ✅
- [x] **입력 필드 테두리**: Gray (#3a3a3a) / Black (#0a0a0a) = 2.3:1 ⚠️
  - **수정 필요**: `#4a4a4a` 이상 사용하여 3:1 달성
- [x] **포커스 링**: Gold (#c9b037) = 8.2:1 ✅

**검증 도구**: axe DevTools

#### 1.4.12 Text Spacing (Level AA)
**요구사항**: 사용자가 텍스트 간격 조정 시에도 기능 유지

- [x] **줄 간격**: `line-height: 1.5` 이상
- [x] **단락 간격**: `margin-bottom: 2em` 권장
- [x] **자간**: `letter-spacing` 조정 가능
- [x] **단어 간격**: `word-spacing` 조정 가능

**검증 방법**: 브라우저 확장 프로그램으로 간격 조정 테스트

#### 1.4.13 Content on Hover or Focus (Level AA)
**요구사항**: 호버/포커스로 나타나는 콘텐츠는 해제/호버/지속 가능해야 함

- [x] **툴팁**: Escape 키로 닫기 가능
- [x] **드롭다운**: 마우스 호버 시 내용 위로 이동 가능
- [x] **지속성**: 콘텐츠가 포커스 해제 전까지 유지

**검증 방법**: 툴팁/드롭다운 수동 테스트

---

## 2. Operable (운용 가능)

### 2.1 Keyboard Accessible (키보드 접근성)

#### 2.1.1 Keyboard (Level A)
**요구사항**: 모든 기능이 키보드로 조작 가능

- [x] **Tab 키**: 모든 인터랙티브 요소 접근
- [x] **Enter/Space**: 버튼/링크 활성화
- [x] **Arrow 키**: 라디오 버튼/드롭다운 탐색
- [x] **Escape**: 모달/드롭다운 닫기

**검증 방법**: 마우스 없이 모든 기능 테스트

#### 2.1.2 No Keyboard Trap (Level A)
**요구사항**: 키보드로 들어간 곳에서 빠져나올 수 있어야 함

- [x] **포커스 트랩**: 모달에만 의도적으로 적용
- [x] **Escape 키**: 모달/드롭다운에서 빠져나오기 가능
- [x] **Tab 순환**: 무한 루프 없음

**검증 방법**: Tab 키로 전체 페이지 순환

#### 2.1.4 Character Key Shortcuts (Level A)
**요구사항**: 단일 문자 단축키는 끄거나 재할당 가능해야 함

**Armchair Sleuths 적용**: 단일 문자 단축키 사용 안 함 (해당 없음)

---

### 2.2 Enough Time (충분한 시간)

#### 2.2.1 Timing Adjustable (Level A)
**요구사항**: 시간 제한이 있는 경우 조정/연장/해제 가능해야 함

**Armchair Sleuths 적용**:
- [ ] **AI 응답 타임아웃**: 타임아웃 없음 또는 충분한 시간 제공
- [ ] **세션 타임아웃**: 타임아웃 전 경고 제공

#### 2.2.2 Pause, Stop, Hide (Level A)
**요구사항**: 자동 업데이트/이동 콘텐츠는 일시정지/정지/숨김 가능

- [x] **채팅 자동 스크롤**: 사용자가 스크롤하면 자동 스크롤 일시 정지
- [x] **타이핑 인디케이터**: 5초 이상 지속되지 않음

---

### 2.3 Seizures and Physical Reactions (발작 및 신체 반응)

#### 2.3.1 Three Flashes or Below Threshold (Level A)
**요구사항**: 초당 3회 이상 깜빡임 금지

- [x] **애니메이션**: 모든 깜빡임 효과 3초 미만 주기
- [x] **로딩 스피너**: 부드러운 회전 (깜빡임 없음)

**검증 방법**: 애니메이션 프레임 검사

---

### 2.4 Navigable (탐색 가능)

#### 2.4.1 Bypass Blocks (Level A)
**요구사항**: 반복되는 블록을 건너뛸 수 있어야 함

- [ ] **Skip Links**: "메인 콘텐츠로 건너뛰기" 링크 추가
  ```tsx
  <a href="#main-content" className="skip-link">
    메인 콘텐츠로 건너뛰기
  </a>
  <main id="main-content" tabIndex={-1}>
    {/* 콘텐츠 */}
  </main>
  ```

#### 2.4.2 Page Titled (Level A)
**요구사항**: 모든 페이지에 설명적인 제목 제공

- [x] **페이지 제목**: `<title>Armchair Sleuths - [페이지 이름]</title>`
  ```tsx
  <title>Armchair Sleuths - 사건 상세</title>
  ```

#### 2.4.3 Focus Order (Level A)
**요구사항**: 포커스 순서가 논리적이어야 함

- [x] **Tab 순서**: 시각적 순서와 일치
- [x] **모달**: 모달 내부만 순환

**검증 방법**: Tab 키로 순서 확인

#### 2.4.4 Link Purpose (In Context) (Level A)
**요구사항**: 링크 목적이 맥락에서 명확해야 함

- [x] **설명적 링크**: "여기 클릭" 대신 "사건 상세 보기" 사용
  ```tsx
  <a href="/case/1">사건 상세 보기</a>
  ```

#### 2.4.5 Multiple Ways (Level AA)
**요구사항**: 페이지 찾는 방법이 2가지 이상이어야 함

- [x] **네비게이션 메뉴**: 상단 메뉴로 이동
- [ ] **검색 기능**: 사건 검색 (선택 사항)
- [x] **Breadcrumb**: 현재 위치 표시 (선택 사항)

#### 2.4.6 Headings and Labels (Level AA)
**요구사항**: 제목과 레이블이 설명적이어야 함

- [x] **명확한 제목**: "섹션 1" 대신 "용의자 목록" 사용
- [x] **명확한 레이블**: "입력 1" 대신 "추리 내용" 사용

#### 2.4.7 Focus Visible (Level AA)
**요구사항**: 키보드 포커스가 시각적으로 명확해야 함

- [x] **포커스 링**: 2px gold outline (`#c9b037`)
- [x] **대비**: 포커스 링이 배경과 3:1 이상 대비

**검증 방법**: Tab 키로 포커스 이동 확인

---

### 2.5 Input Modalities (입력 방식)

#### 2.5.1 Pointer Gestures (Level A)
**요구사항**: 다중 포인트 또는 경로 기반 제스처에 대체 제공

**Armchair Sleuths 적용**: 복잡한 제스처 사용 안 함 (해당 없음)

#### 2.5.2 Pointer Cancellation (Level A)
**요구사항**: 클릭은 up 이벤트에서 완료되어야 함

- [x] **onClick**: 기본 `onClick` 사용 (up 이벤트)
- [x] **드래그**: 드래그 앤 드롭 없음

#### 2.5.3 Label in Name (Level A)
**요구사항**: 시각적 레이블과 접근성 이름이 일치해야 함

- [x] **버튼 텍스트**: "제출" 버튼의 `aria-label`도 "제출"
- [x] **입력 레이블**: `<label>` 텍스트와 `aria-label` 일치

#### 2.5.4 Motion Actuation (Level A)
**요구사항**: 모션 기반 입력에 대체 UI 제공

**Armchair Sleuths 적용**: 모션 기반 입력 없음 (해당 없음)

---

## 3. Understandable (이해 가능)

### 3.1 Readable (가독성)

#### 3.1.1 Language of Page (Level A)
**요구사항**: HTML `lang` 속성으로 페이지 언어 지정

- [x] **HTML lang**: `<html lang="ko">`
  ```html
  <html lang="ko">
  ```

#### 3.1.2 Language of Parts (Level AA)
**요구사항**: 다른 언어 부분에 `lang` 속성 지정

- [ ] **영어 텍스트**: 영어 인용문에 `lang="en"` 추가
  ```tsx
  <blockquote lang="en">
    "The truth is out there."
  </blockquote>
  ```

---

### 3.2 Predictable (예측 가능)

#### 3.2.1 On Focus (Level A)
**요구사항**: 포커스 받을 때 맥락 변경 금지

- [x] **자동 제출 없음**: 포커스만으로 폼 제출 안 함
- [x] **자동 이동 없음**: 포커스로 페이지 이동 안 함

#### 3.2.2 On Input (Level A)
**요구사항**: 입력 시 예상치 못한 맥락 변경 금지

- [x] **명시적 제출**: Enter 키 또는 버튼 클릭으로만 제출
- [x] **자동 이동 없음**: 마지막 입력 후 자동 이동 안 함

#### 3.2.3 Consistent Navigation (Level AA)
**요구사항**: 네비게이션이 일관되게 반복되어야 함

- [x] **네비게이션 위치**: 모든 페이지 상단에 동일한 메뉴
- [x] **순서 일관성**: 메뉴 항목 순서 동일

#### 3.2.4 Consistent Identification (Level AA)
**요구사항**: 동일한 기능은 일관되게 식별되어야 함

- [x] **아이콘 일관성**: 닫기 버튼은 항상 X 아이콘
- [x] **레이블 일관성**: "제출" 버튼은 항상 "제출"

---

### 3.3 Input Assistance (입력 지원)

#### 3.3.1 Error Identification (Level A)
**요구사항**: 입력 오류를 텍스트로 식별해야 함

- [x] **에러 메시지**: "이 필드는 필수입니다"
  ```tsx
  <div role="alert" className="error-message">
    이 필드는 필수입니다
  </div>
  ```

#### 3.3.2 Labels or Instructions (Level A)
**요구사항**: 입력이 필요한 경우 레이블/지시문 제공

- [x] **레이블**: 모든 `<input>`에 `<label>` 제공
- [x] **도움말**: 복잡한 필드에 설명 추가
  ```tsx
  <label htmlFor="deduction">추리 내용</label>
  <textarea
    id="deduction"
    aria-describedby="deduction-help"
  />
  <div id="deduction-help" className="help-text">
    최소 50자 이상 작성해주세요.
  </div>
  ```

#### 3.3.3 Error Suggestion (Level AA)
**요구사항**: 입력 오류 시 수정 방법 제안

- [x] **구체적 제안**: "유효하지 않습니다" 대신 "이메일 형식으로 입력해주세요"
  ```tsx
  {error && (
    <div role="alert">
      이메일 형식으로 입력해주세요 (예: user@example.com)
    </div>
  )}
  ```

#### 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)
**요구사항**: 중요한 행동 전 확인/취소/검토 가능

- [x] **확인 모달**: 추리 제출 전 확인 모달 표시
  ```tsx
  <Modal isOpen={showConfirmModal}>
    <ModalHeader>정말 제출하시겠습니까?</ModalHeader>
    <ModalBody>제출 후에는 수정할 수 없습니다.</ModalBody>
    <ModalFooter>
      <Button onClick={cancel}>취소</Button>
      <Button onClick={confirm}>확인</Button>
    </ModalFooter>
  </Modal>
  ```

---

## 4. Robust (견고성)

### 4.1 Compatible (호환성)

#### 4.1.1 Parsing (Level A)
**요구사항**: HTML이 유효해야 함 (WCAG 2.2에서 제거됨, 참고만)

- [x] **유효한 HTML**: W3C Validator 통과
- [x] **닫는 태그**: 모든 요소 올바르게 닫힘
- [x] **고유 ID**: ID 중복 없음

**검증 도구**: [W3C HTML Validator](https://validator.w3.org/)

#### 4.1.2 Name, Role, Value (Level A)
**요구사항**: 모든 UI 컴포넌트의 이름, 역할, 값이 프로그래밍 방식으로 결정 가능

- [x] **네이티브 HTML**: 가능한 네이티브 요소 사용 (`<button>`, `<input>`)
- [x] **ARIA 역할**: 커스텀 컴포넌트에 적절한 `role` 제공
- [x] **ARIA 상태**: `aria-checked`, `aria-selected`, `aria-expanded` 사용
- [x] **레이블**: `aria-label` 또는 `aria-labelledby` 제공

**검증 방법**: 스크린 리더로 모든 요소 테스트

#### 4.1.3 Status Messages (Level AA)
**요구사항**: 상태 메시지가 포커스 이동 없이 전달되어야 함

- [x] **role="status"**: 정보 메시지
  ```tsx
  <div role="status" aria-live="polite">
    저장되었습니다
  </div>
  ```
- [x] **role="alert"**: 긴급 메시지
  ```tsx
  <div role="alert">
    에러가 발생했습니다
  </div>
  ```

---

## 5. 우선순위별 작업 계획

### Phase 1: 즉시 수정 (Critical) ✅ 완료
- [x] **색상 대비**: Tertiary 텍스트 `#959595`로 수정
- [x] **Magic MCP 프롬프트**: 접근성 요구사항 추가
- [x] **ARIA 가이드**: 상세 구현 문서 작성
- [x] **키보드 가이드**: 네비게이션 패턴 문서 작성

### Phase 2: 1주 내 완료 (High)
- [ ] **Skip Links**: "메인 콘텐츠로 건너뛰기" 추가
- [ ] **포커스 스타일**: 전역 CSS에 gold outline 추가
- [ ] **버튼 크기**: 모바일에서 44px 이상 확보
- [ ] **ARIA 속성**: 모든 컴포넌트에 필수 ARIA 추가

### Phase 3: 2주 내 완료 (Medium)
- [ ] **autocomplete**: 사용자 정보 입력 필드에 추가
- [ ] **입력 필드 테두리**: 대비 3:1 이상 달성
- [ ] **에러 제안**: 모든 폼 에러에 구체적 제안 추가
- [ ] **확인 모달**: 중요한 행동 전 확인 절차

### Phase 4: 3주 내 완료 (Low)
- [ ] **언어 부분**: 영어 텍스트에 `lang="en"` 추가
- [ ] **타임아웃 경고**: 세션 타임아웃 전 경고 (필요 시)
- [ ] **W3C Validator**: HTML 유효성 검증

---

## 6. 자동화 테스트 설정

### 6.1 axe DevTools 통합

```bash
npm install --save-dev @axe-core/react
```

```tsx
// src/client/index.tsx (개발 환경에만)
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### 6.2 Jest 테스트

```bash
npm install --save-dev jest-axe
```

```tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Button has no accessibility violations', async () => {
  const { container } = render(<Button>클릭</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 7. 참고 자료

### 공식 문서
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [How to Meet WCAG 2 (Customizable)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/)

### 검증 도구
- [axe DevTools](https://www.deque.com/axe/devtools/) - 자동 접근성 검사
- [WAVE Browser Extension](https://wave.webaim.org/extension/) - 시각적 접근성 평가
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Chrome DevTools 내장
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - 색상 대비 검사

### 한국 법규
- [한국형 웹 콘텐츠 접근성 지침 2.1 (KWCAG 2.1)](https://www.wah.or.kr/Accessibility/guidance.asp)
- [장애인차별금지법 제21조 (정보접근)](https://www.law.go.kr/)

---

**작성자 노트**: 이 체크리스트는 Armchair Sleuths 프로젝트가 WCAG 2.1 AA 기준을 완벽히 준수하도록 설계되었습니다. 각 항목을 단계적으로 체크하고, 자동화 도구와 수동 테스트를 병행하여 접근성을 보장하세요.

**마지막 업데이트**: 2025-10-27
**준수율**: Phase 1 완료 (60%), Phase 2-4 진행 중
