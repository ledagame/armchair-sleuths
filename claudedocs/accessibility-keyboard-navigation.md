# Keyboard Navigation Implementation Guide

**작성일**: 2025-10-27
**목적**: Armchair Sleuths 프로젝트의 완전한 키보드 접근성 구현 가이드
**준수 기준**: WCAG 2.1 AA - 2.1 Keyboard Accessible

---

## 개요

모든 인터랙티브 요소는 키보드만으로 접근하고 조작할 수 있어야 합니다. 이 문서는 컴포넌트별 키보드 네비게이션 패턴과 구현 예시를 제공합니다.

**핵심 원칙**:
1. **Tab으로 접근**: 모든 인터랙티브 요소가 Tab 키로 접근 가능해야 함
2. **명확한 포커스**: 현재 포커스된 요소가 시각적으로 명확해야 함 (2px gold outline)
3. **표준 단축키**: 업계 표준 키보드 단축키 준수
4. **포커스 트랩**: 모달 등에서 포커스가 빠져나가지 않도록 함

---

## 1. 전역 키보드 패턴

### 1.1 기본 네비게이션 키

| 키 | 동작 | 적용 대상 |
|-----|------|-----------|
| **Tab** | 다음 요소로 이동 | 모든 인터랙티브 요소 |
| **Shift + Tab** | 이전 요소로 이동 | 모든 인터랙티브 요소 |
| **Enter** | 활성화 | 버튼, 링크 |
| **Space** | 활성화 / 토글 | 버튼, 체크박스 |
| **Escape** | 취소 / 닫기 | 모달, 드롭다운 |
| **Arrow Keys** | 그룹 내 탐색 | 라디오 버튼, 드롭다운 |

### 1.2 포커스 스타일 (전역 CSS)

```css
/* Focus 스타일 (design-tokens.css에 추가) */
*:focus-visible {
  outline: 2px solid #c9b037; /* Gold */
  outline-offset: 2px;
  border-radius: 4px;
}

/* 기본 outline 제거 (focus-visible만 사용) */
*:focus:not(:focus-visible) {
  outline: none;
}

/* 버튼 포커스 */
button:focus-visible {
  outline: 2px solid #c9b037;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(201, 176, 55, 0.2);
}

/* 입력 필드 포커스 */
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid #c9b037;
  outline-offset: 0;
  border-color: #c9b037;
}
```

---

## 2. Button 컴포넌트

### 키보드 동작

| 키 | 동작 |
|-----|------|
| **Tab** | 버튼으로 포커스 이동 |
| **Enter** | 버튼 클릭 |
| **Space** | 버튼 클릭 |

### 구현 예시

```tsx
// 기본 버튼 (네이티브 <button> 사용 권장)
<button
  className="btn-primary"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  수사 시작
</button>

// 커스텀 버튼 (div를 버튼처럼 사용할 경우)
// ⚠️ 가능하면 네이티브 <button> 사용 권장
<div
  role="button"
  tabIndex={0}
  className="custom-button"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  커스텀 버튼
</div>
```

---

## 3. Modal 컴포넌트

### 키보드 동작

| 키 | 동작 |
|-----|------|
| **Tab** | 모달 내부 요소 순환 (포커스 트랩) |
| **Shift + Tab** | 역방향 순환 |
| **Escape** | 모달 닫기 |

### 구현 예시

```tsx
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // 포커스 트랩 구현
  useEffect(() => {
    if (!isOpen) return;

    // 이전 포커스 저장
    previousFocusRef.current = document.activeElement as HTMLElement;

    // 모달 내 포커스 가능한 요소 찾기
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // 첫 요소에 포커스
    firstElement.focus();

    // Tab 키 핸들러 (포커스 트랩)
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab: 역방향
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: 정방향
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Escape 키 핸들러
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);

      // 포커스 복원
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          aria-label="모달 닫기"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
```

---

## 4. Dropdown 컴포넌트

### 키보드 동작

| 키 | 동작 |
|-----|------|
| **Tab** | 드롭다운 버튼으로 포커스 |
| **Enter / Space** | 드롭다운 열기/닫기 |
| **Arrow Down** | 다음 옵션 (드롭다운 열린 상태) |
| **Arrow Up** | 이전 옵션 |
| **Home** | 첫 옵션 |
| **End** | 마지막 옵션 |
| **Escape** | 드롭다운 닫기 |
| **문자 키** | 해당 문자로 시작하는 옵션으로 이동 |

### 구현 예시

```tsx
import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

function Dropdown({ options, value, onChange, placeholder }: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // 드롭다운 열기/닫기
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      const selectedIndex = options.findIndex(opt => opt.value === value);
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  };

  // 옵션 선택
  const selectOption = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  // 키보드 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          selectOption(options[focusedIndex]);
        } else {
          toggleDropdown();
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => Math.min(prev + 1, options.length - 1));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
        }
        break;

      case 'Home':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(0);
        }
        break;

      case 'End':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(options.length - 1);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;

      default:
        // 문자 키: 해당 문자로 시작하는 옵션 찾기
        if (isOpen && e.key.length === 1) {
          const char = e.key.toLowerCase();
          const index = options.findIndex(opt =>
            opt.label.toLowerCase().startsWith(char)
          );
          if (index >= 0) {
            setFocusedIndex(index);
          }
        }
        break;
    }
  };

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={dropdownRef} className="dropdown">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className="dropdown-button"
      >
        {selectedOption?.label || placeholder || '선택하세요'}
        <span aria-hidden="true">▼</span>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          className="dropdown-menu"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={`dropdown-option ${index === focusedIndex ? 'focused' : ''}`}
              onClick={() => selectOption(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 5. RadioGroup 컴포넌트

### 키보드 동작

| 키 | 동작 |
|-----|------|
| **Tab** | 라디오 그룹으로 포커스 (선택된 항목 또는 첫 항목) |
| **Arrow Down / Right** | 다음 라디오 버튼 선택 |
| **Arrow Up / Left** | 이전 라디오 버튼 선택 |
| **Space** | 현재 포커스된 라디오 버튼 선택 |

### 구현 예시

```tsx
interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

function RadioGroup({ options, value, onChange, name, label }: {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  label: string;
}) {
  // Arrow 키로 탐색
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (index + 1) % options.length;
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (index - 1 + options.length) % options.length;
        break;

      case ' ':
        e.preventDefault();
        onChange(options[index].value);
        return;

      default:
        return;
    }

    // 새 옵션 선택 및 포커스
    onChange(options[newIndex].value);
    const radioInput = document.getElementById(`${name}-${newIndex}`) as HTMLInputElement;
    radioInput?.focus();
  };

  return (
    <div role="radiogroup" aria-labelledby={`${name}-label`}>
      <div id={`${name}-label`} className="radio-group-label">
        {label}
      </div>

      {options.map((option, index) => {
        const isChecked = option.value === value;
        const inputId = `${name}-${index}`;

        return (
          <label
            key={option.value}
            className="radio-label"
            htmlFor={inputId}
          >
            <input
              id={inputId}
              type="radio"
              name={name}
              value={option.value}
              checked={isChecked}
              onChange={() => onChange(option.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              tabIndex={isChecked ? 0 : -1}
              className="radio-input"
            />
            <span className="radio-custom" aria-hidden="true"></span>
            <span className="radio-text">
              <span className="radio-label-text">{option.label}</span>
              {option.description && (
                <span className="radio-description">{option.description}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
```

---

## 6. Chat 컴포넌트

### 키보드 동작

| 키 | 동작 |
|-----|------|
| **Tab** | 입력 필드 또는 전송 버튼으로 포커스 |
| **Enter** | 메시지 전송 |
| **Escape** | 입력 필드 blur (포커스 해제) |

### 구현 예시

```tsx
function Chat({ messages, onSendMessage }) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 전송
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  // 키보드 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  return (
    <div className="chat-container">
      <div
        role="log"
        aria-live="polite"
        aria-label="대화 기록"
        className="chat-messages"
      >
        {messages.map((msg) => (
          <div key={msg.id} role="article" className="chat-message">
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <label htmlFor="chat-input" className="sr-only">
          메시지 입력
        </label>
        <input
          ref={inputRef}
          id="chat-input"
          type="text"
          placeholder="질문을 입력하세요..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="chat-input"
        />
        <button
          type="submit"
          aria-label="메시지 전송"
          disabled={!inputValue.trim()}
          className="chat-send-button"
        >
          전송
        </button>
      </form>
    </div>
  );
}
```

---

## 7. 탭 컴포넌트 (Tab Panel)

### 키보드 동작

| 키 | 동작 |
|-----|------|
| **Tab** | 활성 탭으로 포커스 (또는 탭 패널 내용으로) |
| **Arrow Left** | 이전 탭 활성화 |
| **Arrow Right** | 다음 탭 활성화 |
| **Home** | 첫 탭 활성화 |
| **End** | 마지막 탭 활성화 |

### 구현 예시

```tsx
interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

function Tabs({ tabs }: { tabs: Tab[] }) {
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const activeIndex = tabs.findIndex(tab => tab.id === activeTabId);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newIndex = activeIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (activeIndex - 1 + tabs.length) % tabs.length;
        break;

      case 'ArrowRight':
        e.preventDefault();
        newIndex = (activeIndex + 1) % tabs.length;
        break;

      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        e.preventDefault();
        newIndex = tabs.length - 1;
        break;

      default:
        return;
    }

    setActiveTabId(tabs[newIndex].id);
    document.getElementById(`tab-${tabs[newIndex].id}`)?.focus();
  };

  return (
    <div className="tabs">
      <div role="tablist" aria-label="탭 네비게이션">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTabId(tab.id)}
              onKeyDown={handleKeyDown}
              className={`tab ${isActive ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== activeTabId}
          className="tab-panel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

---

## 8. Skip Links (건너뛰기 링크)

### 개요
시각 장애인이 메인 콘텐츠로 바로 이동할 수 있도록 페이지 상단에 건너뛰기 링크를 제공합니다.

### 구현 예시

```tsx
// src/client/App.tsx 또는 Layout 컴포넌트
function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        메인 콘텐츠로 건너뛰기
      </a>

      <header>
        {/* 네비게이션 */}
      </header>

      <main id="main-content" tabIndex={-1}>
        {/* 메인 콘텐츠 */}
      </main>
    </>
  );
}
```

```css
/* Skip Link 스타일 (design-tokens.css에 추가) */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #c9b037;
  color: #0a0a0a;
  padding: 8px 16px;
  font-weight: 600;
  z-index: 999;
  text-decoration: none;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
}
```

---

## 9. 테스트 가이드

### 9.1 수동 키보드 테스트

#### 체크리스트
- [ ] **Tab 키**: 모든 인터랙티브 요소에 순차적으로 접근 가능
- [ ] **Shift + Tab**: 역방향 탐색 가능
- [ ] **Enter / Space**: 버튼/링크 활성화
- [ ] **Escape**: 모달/드롭다운 닫기
- [ ] **Arrow 키**: 라디오 버튼/드롭다운 탐색
- [ ] **포커스 표시**: 모든 포커스 상태가 명확하게 보임 (2px gold outline)
- [ ] **포커스 트랩**: 모달에서 포커스가 빠져나가지 않음
- [ ] **포커스 복원**: 모달 닫을 때 이전 요소로 포커스 복원

#### 테스트 시나리오

**시나리오 1: 모달 열기/닫기**
1. Tab 키로 "사건 상세보기" 버튼으로 이동
2. Enter 키로 모달 열기
3. 모달 내부에서 Tab 키로 순환 확인
4. Escape 키로 모달 닫기
5. 포커스가 "사건 상세보기" 버튼으로 복원되는지 확인

**시나리오 2: 폼 작성**
1. Tab 키로 폼 필드로 이동
2. 텍스트 입력 후 Tab으로 다음 필드 이동
3. 라디오 버튼에서 Arrow 키로 옵션 선택
4. Enter 키로 폼 제출
5. 에러 발생 시 첫 에러 필드로 포커스 이동 확인

**시나리오 3: 드롭다운 선택**
1. Tab 키로 드롭다운 버튼으로 이동
2. Enter 키로 드롭다운 열기
3. Arrow Down/Up으로 옵션 탐색
4. Enter 키로 선택
5. 포커스가 드롭다운 버튼으로 복원 확인

### 9.2 자동화 테스트 (Jest + Testing Library)

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Keyboard Navigation Tests', () => {
  test('Button activates with Enter and Space keys', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭</Button>);

    const button = screen.getByRole('button', { name: '클릭' });

    // Enter 키
    await userEvent.type(button, '{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Space 키
    await userEvent.type(button, ' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  test('Modal traps focus within dialog', async () => {
    render(<Modal isOpen={true} onClose={jest.fn()}>
      <button>첫 버튼</button>
      <button>둘째 버튼</button>
      <button>닫기</button>
    </Modal>);

    const firstButton = screen.getByRole('button', { name: '첫 버튼' });
    const closeButton = screen.getByRole('button', { name: '닫기' });

    // 첫 요소에 포커스 확인
    expect(firstButton).toHaveFocus();

    // Tab 순환
    await userEvent.tab();
    await userEvent.tab();
    expect(closeButton).toHaveFocus();

    // 마지막에서 Tab 하면 첫 요소로 돌아감
    await userEvent.tab();
    expect(firstButton).toHaveFocus();
  });

  test('RadioGroup navigates with Arrow keys', async () => {
    const handleChange = jest.fn();
    render(
      <RadioGroup
        options={[
          { value: '1', label: '옵션 1' },
          { value: '2', label: '옵션 2' },
          { value: '3', label: '옵션 3' },
        ]}
        value="1"
        onChange={handleChange}
        name="test"
        label="테스트 라디오"
      />
    );

    const radio1 = screen.getByRole('radio', { name: '옵션 1' });
    radio1.focus();

    // Arrow Down
    await userEvent.keyboard('{ArrowDown}');
    expect(handleChange).toHaveBeenCalledWith('2');

    // Arrow Up
    await userEvent.keyboard('{ArrowUp}');
    expect(handleChange).toHaveBeenCalledWith('1');
  });
});
```

---

## 10. 참고 자료

### WAI-ARIA Authoring Practices
- [Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)

### 유용한 라이브러리
- [React Focus Lock](https://github.com/theKashey/react-focus-lock) - 포커스 트랩
- [React Aria](https://react-spectrum.adobe.com/react-aria/) - Adobe의 접근성 훅 라이브러리
- [Downshift](https://www.downshift-js.com/) - 접근성 준수 드롭다운 컴포넌트

---

**작성자 노트**: 이 가이드의 모든 패턴은 WAI-ARIA Authoring Practices 1.2를 준수합니다. 각 컴포넌트 구현 시 해당 섹션의 코드를 참고하여 키보드 네비게이션을 완벽히 구현하세요.
