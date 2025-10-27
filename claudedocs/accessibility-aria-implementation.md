# Accessibility ARIA Implementation Guide

**작성일**: 2025-10-27
**목적**: Armchair Sleuths 프로젝트의 WCAG 2.1 AA 접근성 준수를 위한 ARIA 속성 구현 가이드
**대상**: 모든 Magic MCP 생성 컴포넌트 및 React 컴포넌트

---

## 개요

이 문서는 각 컴포넌트별로 필수 ARIA 속성, 구현 예시, 검증 체크리스트를 제공합니다.

**ARIA 사용 원칙**:
1. **시맨틱 HTML 우선**: 가능하면 네이티브 HTML 요소 사용 (`<button>`, `<label>`, `<nav>`)
2. **ARIA는 보완책**: 시맨틱 HTML로 표현 불가능한 경우에만 ARIA 사용
3. **검증 필수**: 스크린 리더로 실제 테스트 후 배포

---

## 1. Button 컴포넌트

### 필수 ARIA 속성

| 상태 | ARIA 속성 | 값 | 용도 |
|------|-----------|-----|------|
| 기본 | `aria-label` | "버튼 설명" | 아이콘 전용 버튼에 필수 |
| 비활성화 | `aria-disabled` | `"true"` | 버튼 비활성 상태 |
| 로딩 중 | `aria-busy` | `"true"` | 비동기 작업 진행 중 |
| 토글 버튼 | `aria-pressed` | `"true"` / `"false"` | 토글 상태 표시 |

### 구현 예시

#### 기본 버튼 (텍스트 포함)
```tsx
<button
  className="btn-primary"
  onClick={handleClick}
>
  수사 시작
</button>
```

#### 아이콘 전용 버튼 (aria-label 필수)
```tsx
<button
  className="btn-icon"
  aria-label="모달 닫기"
  onClick={handleClose}
>
  <CloseIcon />
</button>
```

#### 비활성화 버튼
```tsx
<button
  className="btn-primary"
  aria-disabled="true"
  disabled
  onClick={handleClick}
>
  제출
</button>
```

#### 로딩 중 버튼
```tsx
<button
  className="btn-primary"
  aria-busy={isLoading}
  disabled={isLoading}
  onClick={handleSubmit}
>
  {isLoading ? (
    <>
      <Spinner />
      <span className="sr-only">로딩 중...</span>
    </>
  ) : (
    '제출'
  )}
</button>
```

#### 토글 버튼 (좋아요 등)
```tsx
<button
  className="btn-toggle"
  aria-pressed={isLiked}
  aria-label={isLiked ? "좋아요 취소" : "좋아요"}
  onClick={toggleLike}
>
  <HeartIcon filled={isLiked} />
</button>
```

### 검증 체크리스트

- [ ] 아이콘 전용 버튼에 `aria-label` 제공
- [ ] 비활성화 상태에 `aria-disabled="true"` 추가
- [ ] 로딩 중에 `aria-busy="true"` 추가
- [ ] 토글 버튼에 `aria-pressed` 사용
- [ ] 키보드 접근 (Tab, Enter/Space) 가능
- [ ] 포커스 표시 (2px gold outline) 명확

---

## 2. Form 컴포넌트

### 필수 ARIA 속성

| 요소 | ARIA 속성 | 값 | 용도 |
|------|-----------|-----|------|
| Input | `aria-required` | `"true"` | 필수 입력 필드 |
| Input | `aria-invalid` | `"true"` / `"false"` | 유효성 검사 실패 |
| Input | `aria-describedby` | `"error-id"` | 에러 메시지 연결 |
| Label | `htmlFor` | `"input-id"` | Label-Input 연결 |
| Error | `role` | `"alert"` | 즉시 에러 알림 |

### 구현 예시

#### 기본 폼 필드 (Label + Input)
```tsx
<div className="form-field">
  <label htmlFor="culprit-select" id="culprit-label">
    범인 선택 <span aria-label="필수">*</span>
  </label>
  <select
    id="culprit-select"
    aria-labelledby="culprit-label"
    aria-required="true"
    aria-invalid={!!error}
    aria-describedby={error ? "culprit-error" : undefined}
    value={selectedCulprit}
    onChange={handleChange}
  >
    <option value="">선택하세요</option>
    {suspects.map(s => (
      <option key={s.id} value={s.id}>{s.name}</option>
    ))}
  </select>
  {error && (
    <div id="culprit-error" role="alert" className="error-message">
      {error}
    </div>
  )}
</div>
```

#### 텍스트 입력 필드
```tsx
<div className="form-field">
  <label htmlFor="deduction-input">
    추리 내용
  </label>
  <textarea
    id="deduction-input"
    aria-required="true"
    aria-invalid={!!error}
    aria-describedby={error ? "deduction-error" : "deduction-help"}
    placeholder="범인의 동기와 증거를 설명하세요"
    value={deduction}
    onChange={handleChange}
  />
  {!error && (
    <div id="deduction-help" className="help-text">
      최소 50자 이상 작성해주세요.
    </div>
  )}
  {error && (
    <div id="deduction-error" role="alert" className="error-message">
      {error}
    </div>
  )}
</div>
```

#### 라디오 버튼 그룹
```tsx
<div role="radiogroup" aria-labelledby="motive-label">
  <div id="motive-label" className="form-label">
    범행 동기
  </div>
  {motives.map((motive, index) => (
    <label key={motive.id} className="radio-label">
      <input
        type="radio"
        name="motive"
        value={motive.id}
        checked={selectedMotive === motive.id}
        onChange={() => setSelectedMotive(motive.id)}
        onKeyDown={(e) => handleRadioKeyDown(e, index)}
      />
      <span>{motive.label}</span>
    </label>
  ))}
</div>
```

### 검증 체크리스트

- [ ] 모든 입력 필드에 `<label>` 제공 (htmlFor/id 연결)
- [ ] 필수 필드에 `aria-required="true"` 추가
- [ ] 유효성 검사 실패 시 `aria-invalid="true"` 설정
- [ ] 에러 메시지에 `role="alert"` 추가
- [ ] `aria-describedby`로 입력-에러 연결
- [ ] 라디오 그룹에 `role="radiogroup"` 사용

---

## 3. Modal 컴포넌트

### 필수 ARIA 속성

| 속성 | ARIA 값 | 용도 |
|------|---------|------|
| `role` | `"dialog"` | 모달 대화상자 식별 |
| `aria-modal` | `"true"` | 모달 컨텍스트 표시 |
| `aria-labelledby` | `"modal-title"` | 제목과 연결 |
| `aria-describedby` | `"modal-desc"` | 설명과 연결 |

### 구현 예시

```tsx
function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 이전 포커스 저장
      previousFocusRef.current = document.activeElement as HTMLElement;

      // 모달 첫 요소에 포커스
      modalRef.current?.focus();
    } else {
      // 포커스 복원
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // ESC 키로 닫기
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // 포커스 트랩
    const handleFocusTrap = (e: FocusEvent) => {
      if (!modalRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        modalRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusTrap);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusTrap);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" aria-hidden="true">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        tabIndex={-1}
        className="modal-container"
      >
        <button
          className="modal-close"
          aria-label="모달 닫기"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <h2 id="modal-title" className="modal-title">
          {title}
        </h2>

        <div id="modal-description" className="modal-body">
          {children}
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
}
```

### 검증 체크리스트

- [ ] `role="dialog"` 추가
- [ ] `aria-modal="true"` 설정
- [ ] `aria-labelledby`로 제목 연결
- [ ] `aria-describedby`로 설명 연결
- [ ] ESC 키로 닫기 구현
- [ ] 포커스 트랩 구현 (모달 내부만 순환)
- [ ] 닫을 때 이전 포커스 복원
- [ ] Close 버튼에 `aria-label` 제공

---

## 4. Chat 컴포넌트

### 필수 ARIA 속성

| 요소 | ARIA 속성 | 값 | 용도 |
|------|-----------|-----|------|
| Container | `role` | `"log"` | 채팅 로그 영역 |
| Container | `aria-live` | `"polite"` | 새 메시지 알림 |
| Container | `aria-atomic` | `"false"` | 새 메시지만 알림 |
| Container | `aria-label` | "대화 기록" | 영역 설명 |
| Message | `role` | `"article"` | 개별 메시지 |

### 구현 예시

```tsx
function Chat({ messages, onSendMessage, isAITyping }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 새 메시지 자동 스크롤
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-container">
      {/* 채팅 로그 영역 */}
      <div
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label="용의자와의 대화 기록"
        className="chat-messages"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            role="article"
            className={`chat-message ${msg.sender}`}
          >
            <img
              src={msg.avatar}
              alt={`${msg.sender}의 아바타`}
              className="avatar"
            />
            <div className="message-content">
              <div className="message-header">
                <span className="sender-name">{msg.senderName}</span>
                <span className="timestamp">
                  <time dateTime={msg.timestamp}>
                    {formatTime(msg.timestamp)}
                  </time>
                </span>
                {msg.emotion && (
                  <span
                    role="status"
                    aria-label={`감정 상태: ${msg.emotion}`}
                    className={`emotion-badge ${msg.emotion}`}
                  >
                    {msg.emotion}
                  </span>
                )}
              </div>
              <p className="message-text">{msg.text}</p>
            </div>
          </div>
        ))}

        {isAITyping && (
          <div role="status" aria-live="polite" className="typing-indicator">
            <span className="sr-only">용의자가 입력 중입니다</span>
            <span className="dot" aria-hidden="true"></span>
            <span className="dot" aria-hidden="true"></span>
            <span className="dot" aria-hidden="true"></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 필드 */}
      <form onSubmit={handleSubmit} className="chat-input-form">
        <label htmlFor="chat-input" className="sr-only">
          메시지 입력
        </label>
        <input
          id="chat-input"
          type="text"
          placeholder="질문을 입력하세요..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          aria-label="질문 입력"
        />
        <button
          type="submit"
          aria-label="메시지 전송"
          disabled={!inputValue.trim()}
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
```

### 검증 체크리스트

- [ ] 메시지 컨테이너에 `role="log"` 추가
- [ ] `aria-live="polite"` 설정 (새 메시지 알림)
- [ ] `aria-atomic="false"` 설정 (전체가 아닌 새 항목만)
- [ ] `aria-label`로 채팅 영역 설명
- [ ] 각 메시지에 `role="article"` 추가
- [ ] 입력 필드에 `<label>` 제공
- [ ] 전송 버튼에 `aria-label` 제공
- [ ] 타이핑 인디케이터에 스크린 리더 텍스트

---

## 5. Progress 컴포넌트

### 필수 ARIA 속성

| 속성 | 값 | 용도 |
|------|-----|------|
| `role` | `"progressbar"` | 진행률 표시 |
| `aria-valuenow` | 현재 값 (0-100) | 현재 진행률 |
| `aria-valuemin` | `0` | 최소값 |
| `aria-valuemax` | `100` | 최대값 |
| `aria-label` | "진행률 설명" | 진행률 맥락 |
| `aria-valuetext` | "50%" | 텍스트 표현 |

### 구현 예시

#### 기본 진행률 바
```tsx
<div
  role="progressbar"
  aria-valuenow={investigationProgress}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="수사 진행률"
  aria-valuetext={`${investigationProgress}%`}
  className="progress-container"
>
  <div
    className="progress-fill"
    style={{ width: `${investigationProgress}%` }}
  />
  <span className="progress-text">
    {investigationProgress}%
  </span>
</div>
```

#### 원형 진행률
```tsx
<div
  role="progressbar"
  aria-valuenow={score}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="추리 점수"
  aria-valuetext={`${score}점`}
  className="progress-circle"
>
  <svg viewBox="0 0 100 100">
    <circle
      className="progress-circle-bg"
      cx="50"
      cy="50"
      r="45"
    />
    <circle
      className="progress-circle-fill"
      cx="50"
      cy="50"
      r="45"
      strokeDasharray={`${(score / 100) * 283} 283`}
    />
  </svg>
  <span className="progress-value">{score}점</span>
</div>
```

#### 불확정 상태 (로딩)
```tsx
<div
  role="progressbar"
  aria-busy="true"
  aria-label="로딩 중"
  className="progress-indeterminate"
>
  <div className="progress-shimmer" />
  <span className="sr-only">사건 파일을 불러오는 중...</span>
</div>
```

### 검증 체크리스트

- [ ] `role="progressbar"` 추가
- [ ] `aria-valuenow` 설정 (현재 진행률)
- [ ] `aria-valuemin={0}` 설정
- [ ] `aria-valuemax={100}` 설정
- [ ] `aria-label` 제공 (맥락 설명)
- [ ] `aria-valuetext` 제공 (텍스트 표현)
- [ ] 불확정 상태에 `aria-busy="true"` 사용
- [ ] 시각적 진행률과 함께 텍스트 표시

---

## 6. Badge 컴포넌트

### 필수 ARIA 속성

| 속성 | 값 | 용도 |
|------|-----|------|
| `role` | `"status"` | 상태 표시 |
| `aria-label` | "상태: [내용]" | 맥락 제공 |
| `aria-live` | `"polite"` | 동적 업데이트 |

### 구현 예시

#### 기본 상태 뱃지
```tsx
<span
  role="status"
  aria-label={`상태: ${label}`}
  className="badge badge-success"
>
  {label}
</span>
```

#### 아이콘 뱃지 (스크린 리더 텍스트)
```tsx
<span
  role="status"
  aria-label="새로운 증거 발견"
  className="badge badge-gold"
>
  <NewIcon aria-hidden="true" />
  <span className="sr-only">새로운 증거 발견</span>
</span>
```

#### 동적 업데이트 뱃지
```tsx
<span
  role="status"
  aria-live="polite"
  aria-atomic="true"
  aria-label={`현재 감정 상태: ${emotionState}`}
  className={`badge emotion-${emotionState}`}
>
  {emotionState}
</span>
```

### 검증 체크리스트

- [ ] `role="status"` 추가
- [ ] `aria-label`로 맥락 제공
- [ ] 색상만으로 의미 전달 금지 (텍스트 병기)
- [ ] 아이콘 뱃지에 스크린 리더 텍스트 제공
- [ ] 동적 업데이트 시 `aria-live="polite"` 사용

---

## 7. 공통 ARIA 패턴

### 7.1 스크린 리더 전용 텍스트

```tsx
<span className="sr-only">스크린 리더만 읽는 텍스트</span>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 7.2 포커스 관리

```tsx
// 포커스 복원
const previousFocusRef = useRef<HTMLElement | null>(null);

function openModal() {
  previousFocusRef.current = document.activeElement as HTMLElement;
  modalRef.current?.focus();
}

function closeModal() {
  previousFocusRef.current?.focus();
}
```

### 7.3 Live Region (동적 콘텐츠)

```tsx
<div aria-live="polite" aria-atomic="false">
  {successMessage && <p role="status">{successMessage}</p>}
</div>
```

- `aria-live="polite"`: 사용자 행동 후 알림
- `aria-live="assertive"`: 즉시 알림 (드물게 사용)
- `aria-atomic="true"`: 전체 영역 읽기
- `aria-atomic="false"`: 변경된 부분만 읽기

---

## 8. 테스트 가이드

### 8.1 자동화 도구

#### axe DevTools (Chrome Extension)
```bash
# 설치
1. Chrome 웹 스토어에서 "axe DevTools" 검색
2. 확장 프로그램 설치
3. DevTools → axe DevTools 탭에서 "Scan ALL of my page" 실행
```

#### eslint-plugin-jsx-a11y
```bash
npm install --save-dev eslint-plugin-jsx-a11y
```

```json
// .eslintrc.json
{
  "plugins": ["jsx-a11y"],
  "extends": ["plugin:jsx-a11y/recommended"]
}
```

### 8.2 수동 테스트

#### 키보드 네비게이션
1. Tab 키로 모든 인터랙티브 요소 접근 가능
2. Enter/Space로 버튼/링크 활성화
3. Arrow 키로 라디오 버튼/드롭다운 탐색
4. Escape로 모달/드롭다운 닫기

#### 스크린 리더 테스트
- **Windows**: NVDA (무료) 또는 JAWS
- **macOS**: VoiceOver (기본 제공)
- **모바일**: TalkBack (Android), VoiceOver (iOS)

**VoiceOver 단축키 (macOS)**:
- `Cmd + F5`: VoiceOver 켜기/끄기
- `Ctrl + Option + →`: 다음 요소
- `Ctrl + Option + Space`: 활성화

---

## 9. 우선순위별 체크리스트

### 즉시 수정 (Critical)
- [ ] 모든 `<button>` 아이콘 전용 버튼에 `aria-label` 추가
- [ ] 모든 `<input>`에 `<label>` 연결 (htmlFor/id)
- [ ] 모든 에러 메시지에 `role="alert"` 추가
- [ ] Modal에 `role="dialog"`, `aria-modal="true"` 추가

### 1주 내 완료 (High)
- [ ] Chat 컴포넌트에 `role="log"`, `aria-live` 추가
- [ ] Progress 컴포넌트에 `role="progressbar"` 추가
- [ ] Badge 컴포넌트에 `role="status"` 추가
- [ ] 키보드 네비게이션 테스트 및 수정

### 2주 내 완료 (Medium)
- [ ] 포커스 트랩 구현 (Modal)
- [ ] 포커스 복원 구현 (Modal 닫을 때)
- [ ] 동적 콘텐츠에 Live Region 적용
- [ ] axe DevTools 자동 테스트 통과

---

## 10. 참고 자료

### 공식 문서
- [WAI-ARIA Authoring Practices 1.2](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN ARIA Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)

### 도구
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [NVDA Screen Reader](https://www.nvaccess.org/) (Windows, 무료)

### 예제 코드
- [React ARIA Examples](https://react-spectrum.adobe.com/react-aria/)
- [A11y Project Patterns](https://www.a11yproject.com/patterns/)

---

**작성자 노트**: 이 가이드는 Magic MCP로 생성된 컴포넌트에 적용할 ARIA 속성의 완전한 레퍼런스입니다. 각 컴포넌트 생성 시 해당 섹션을 참고하여 접근성을 보장하세요.
