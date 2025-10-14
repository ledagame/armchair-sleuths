# AI 채팅 대화 시스템 통합 가이드

**작성일**: 2025-01-15  
**버전**: 1.0  
**대상**: Devvit 플랫폼 기반 프로젝트  
**목적**: 외부 AI API를 Devvit 프로젝트에 통합하는 완전한 가이드

---

## 📋 목차

1. [개요](#개요)
2. [아키텍처 설계](#아키텍처-설계)
3. [구현 가이드](#구현-가이드)
4. [보안 고려사항](#보안-고려사항)
5. [성능 최적화](#성능-최적화)
6. [테스트 방법](#테스트-방법)
7. [트러블슈팅](#트러블슈팅)
8. [체크리스트](#체크리스트)

---

## 개요

### 목표
외부에 이미 구축된 AI 채팅 API를 Devvit 프로젝트에 통합하여 Reddit 사용자가 AI와 대화할 수 있는 시스템 구축


### 핵심 원칙
1. **프록시 패턴**: Devvit 서버를 통해 외부 API 호출
2. **타임아웃 관리**: Devvit 30초 제한 준수
3. **에러 처리**: 사용자 친화적인 에러 메시지
4. **보안**: API 키 보호 및 입력 검증

### 전제 조건
- 외부 AI API가 이미 구축되어 있음
- API 엔드포인트 URL 확보
- API 요청/응답 형식 파악
- Devvit 프로젝트 기본 구조 완성

---

## 아키텍처 설계

### 3-Tier 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Reddit User                               │
│  - 브라우저에서 Devvit 앱 실행                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Tier 1: Devvit Client (React)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ChatInterface Component                              │    │
│  │ - 메시지 입력/표시                                    │    │
│  │ - 로딩 상태 관리                                      │    │
│  │ - 에러 표시                                           │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │ fetch('/api/chat')
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         Tier 2: Devvit Server (Proxy Layer) ⭐              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ /api/chat Endpoint                                   │    │
│  │ - 타임아웃 관리 (25초)                                │    │
│  │ - 입력 검증                                           │    │
│  │ - Rate limiting                                       │    │
│  │ - 에러 처리                                           │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │ fetch('https://external-api.com/chat')
                         ▼
┌─────────────────────────────────────────────────────────────┐
│    Tier 3: External AI API (이미 구축됨)                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ /api/simple-chat                                     │    │
│  │ - AI 모델 통합 (OpenAI, Anthropic 등)                │    │
│  │ - 프롬프트 관리                                       │    │
│  │ - 응답 생성                                           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 데이터 흐름

```typescript
// 1. 사용자 입력
User types: "안녕하세요"

// 2. Client → Server
POST /api/chat
{
  "message": "안녕하세요",
  "sessionId": "session-123"
}

// 3. Server → External API
POST https://external-api.com/api/simple-chat
{
  "message": "안녕하세요",
  "sessionId": "session-123"
}

// 4. External API → Server
{
  "response": "안녕하세요! 무엇을 도와드릴까요?",
  "sessionId": "session-123"
}

// 5. Server → Client
{
  "success": true,
  "response": "안녕하세요! 무엇을 도와드릴까요?",
  "sessionId": "session-123"
}

// 6. Client displays response
AI: "안녕하세요! 무엇을 도와드릴까요?"
```

### Devvit 제약사항 해결

| 제약사항 | 해결 방법 |
|---------|----------|
| 클라이언트는 외부 API 호출 불가 | Devvit 서버를 프록시로 사용 |
| 30초 타임아웃 | 25초로 타임아웃 설정, 초과 시 에러 반환 |
| 스트리밍 불가 | 전체 응답 대기 후 반환 |
| 서버리스 (상태 유지 불가) | Redis로 세션 관리 |

---

## 구현 가이드

### Phase 1: API 스펙 확인 (30분)

#### 1.1 API 엔드포인트 확인
```bash
# API URL
https://your-api.vercel.app/api/simple-chat

# 메서드
POST

# Content-Type
application/json
```

#### 1.2 요청 형식 파악
```typescript
// 일반적인 요청 형식
interface ChatRequest {
  message: string;           // 필수: 사용자 메시지
  sessionId?: string;        // 선택: 세션 ID
  userId?: string;           // 선택: 사용자 ID
  context?: any;             // 선택: 추가 컨텍스트
}
```

#### 1.3 응답 형식 파악
```typescript
// 일반적인 응답 형식
interface ChatResponse {
  response: string;          // AI 응답
  sessionId?: string;        // 세션 ID
  metadata?: {               // 선택: 메타데이터
    model?: string;
    tokens?: number;
    timestamp?: number;
  };
}
```

#### 1.4 에러 응답 파악
```typescript
// 에러 응답 형식
interface ErrorResponse {
  error: string;             // 에러 메시지
  code?: string;             // 에러 코드
  details?: any;             // 상세 정보
}
```


### Phase 2: Devvit 서버 프록시 구현 (1시간)

#### 2.1 타입 정의
```typescript
// src/shared/types/chat.ts
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  sessionId?: string;
  error?: string;
}
```

#### 2.2 프록시 엔드포인트 구현
```typescript
// src/server/api/chat.ts
import { Request, Response } from 'express';

const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || 
  'https://your-api.vercel.app/api/simple-chat';
const API_TIMEOUT = 25000; // 25초 (Devvit 30초 제한 고려)

export async function handleChatRequest(req: Request, res: Response) {
  try {
    const { message, sessionId } = req.body;
    
    // 1. 입력 검증
    const validation = validateInput(message);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }
    
    // 2. Rate limiting 체크
    const rateLimitCheck = await checkRateLimit(req);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.'
      });
    }
    
    // 3. 외부 API 호출 (타임아웃 포함)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
      const response = await fetch(EXTERNAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_KEY}`, // API 키 필요시
        },
        body: JSON.stringify({
          message,
          sessionId
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 4. 응답 반환
      return res.json({
        success: true,
        response: data.response,
        sessionId: data.sessionId || sessionId
      });
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        return res.status(504).json({
          success: false,
          error: '응답 시간이 초과되었습니다. 더 짧은 질문을 시도해주세요.'
        });
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('Chat proxy error:', error);
    return res.status(500).json({
      success: false,
      error: 'AI 응답을 가져오는데 실패했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
}

// 입력 검증 함수
function validateInput(message: string): { valid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: '메시지를 입력해주세요.' };
  }
  
  if (message.trim().length === 0) {
    return { valid: false, error: '빈 메시지는 전송할 수 없습니다.' };
  }
  
  if (message.length > 1000) {
    return { valid: false, error: '메시지가 너무 깁니다. (최대 1000자)' };
  }
  
  // XSS 방지
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(message)) {
      return { valid: false, error: '허용되지 않는 문자가 포함되어 있습니다.' };
    }
  }
  
  return { valid: true };
}

// Rate limiting 체크
async function checkRateLimit(req: Request): Promise<{ allowed: boolean }> {
  // Redis 또는 메모리 기반 rate limiting 구현
  // 예: 1분에 10개 요청 제한
  return { allowed: true }; // 구현 필요
}
```

#### 2.3 서버에 라우트 등록
```typescript
// src/server/index.ts
import express from 'express';
import { handleChatRequest } from './api/chat';

const app = express();

app.use(express.json());

// 채팅 API 엔드포인트
app.post('/api/chat', handleChatRequest);

export default app;
```


### Phase 3: 클라이언트 UI 구현 (2-3시간)

#### 3.1 채팅 인터페이스 컴포넌트
```typescript
// src/client/components/ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState<string>(() => 
    `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 입력창 자동 포커스
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || '응답 실패');
      }
      
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
      setError(errorMsg);
      
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `죄송합니다. ${errorMsg}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>AI 용의자와 대화</h2>
        <span className="session-badge">세션: {sessionId.slice(-8)}</span>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>AI 용의자에게 질문해보세요!</p>
            <p className="empty-hint">예: "당신은 어디에 있었나요?"</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.role}`}
          >
            <div className="message-avatar">
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              <div className="message-time">
                {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      <div className="input-container">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
          disabled={loading}
          rows={1}
          className="chat-input"
        />
        <button 
          onClick={sendMessage} 
          disabled={loading || !input.trim()}
          className="send-button"
        >
          {loading ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  );
}
```


#### 3.2 스타일링
```css
/* src/client/components/ChatInterface.css */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.chat-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.session-badge {
  font-size: 0.75rem;
  background: rgba(255,255,255,0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  color: #999;
  margin-top: 3rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-hint {
  font-size: 0.9rem;
  color: #bbb;
  margin-top: 0.5rem;
}

.message {
  display: flex;
  gap: 0.75rem;
  animation: fadeIn 0.3s ease-in;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  font-size: 2rem;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-content {
  max-width: 70%;
  background: white;
  padding: 0.875rem 1.125rem;
  border-radius: 1.125rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.message.assistant .message-content {
  border-bottom-left-radius: 0.25rem;
}

.message-text {
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.6;
  margin-top: 0.375rem;
}

.typing-indicator {
  display: flex;
  gap: 0.375rem;
  padding: 0.5rem 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-banner {
  background: #ff4444;
  color: white;
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideDown 0.3s ease-out;
}

.error-icon {
  font-size: 1.2rem;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.input-container {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: white;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.chat-input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 0.75rem;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s;
  max-height: 120px;
}

.chat-input:focus {
  outline: none;
  border-color: #667eea;
}

.chat-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.send-button {
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 1.2rem;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-button:active:not(:disabled) {
  transform: translateY(0);
}

.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .chat-header h2 {
    font-size: 1.1rem;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .chat-input {
    font-size: 16px; /* iOS 줌 방지 */
  }
  
  .input-container {
    padding: 0.75rem 1rem;
  }
}

/* 다크모드 지원 (선택적) */
@media (prefers-color-scheme: dark) {
  .chat-container {
    background: #1a1a1a;
  }
  
  .messages-container {
    background: #1a1a1a;
  }
  
  .message-content {
    background: #2a2a2a;
    color: #e0e0e0;
  }
  
  .message.user .message-content {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  .input-container {
    background: #2a2a2a;
    border-top-color: #3a3a3a;
  }
  
  .chat-input {
    background: #1a1a1a;
    color: #e0e0e0;
    border-color: #3a3a3a;
  }
}
```


---

## 보안 고려사항

### 1. API 키 보호

```typescript
// ❌ 절대 하지 말 것
const API_KEY = 'sk-1234567890abcdef'; // 하드코딩

// ✅ 올바른 방법
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error('API_KEY environment variable is required');
}
```

**환경변수 설정**:
```bash
# .env (로컬 개발)
API_KEY=your-api-key-here
EXTERNAL_API_URL=https://your-api.vercel.app/api/simple-chat

# Devvit 배포 시
devvit secrets set API_KEY your-api-key-here
```

### 2. Rate Limiting 구현

```typescript
// src/server/middleware/rateLimiter.ts
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function rateLimiter(
  windowMs: number = 60000,  // 1분
  maxRequests: number = 10    // 10개 요청
) {
  return (req: Request, res: Response, next: Function) => {
    const userId = req.headers['x-user-id'] as string || 'anonymous';
    const now = Date.now();
    
    const entry = rateLimitMap.get(userId);
    
    if (!entry || now > entry.resetTime) {
      // 새 윈도우 시작
      rateLimitMap.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        success: false,
        error: `너무 많은 요청입니다. ${retryAfter}초 후 다시 시도해주세요.`
      });
    }
    
    entry.count++;
    next();
  };
}

// 사용
app.post('/api/chat', rateLimiter(60000, 10), handleChatRequest);
```

### 3. 입력 검증 및 새니타이제이션

```typescript
// src/server/utils/validation.ts
export function sanitizeInput(input: string): string {
  // HTML 태그 제거
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // 특수 문자 이스케이프
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  // 연속 공백 제거
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

export function validateMessage(message: string): {
  valid: boolean;
  error?: string;
  sanitized?: string;
} {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: '메시지를 입력해주세요.' };
  }
  
  const sanitized = sanitizeInput(message);
  
  if (sanitized.length === 0) {
    return { valid: false, error: '유효한 메시지를 입력해주세요.' };
  }
  
  if (sanitized.length > 1000) {
    return { valid: false, error: '메시지가 너무 깁니다. (최대 1000자)' };
  }
  
  // SQL Injection 패턴 체크
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
    /(--|;|\/\*|\*\/)/
  ];
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(sanitized)) {
      return { valid: false, error: '허용되지 않는 문자가 포함되어 있습니다.' };
    }
  }
  
  return { valid: true, sanitized };
}
```

### 4. CORS 설정

```typescript
// src/server/index.ts
import cors from 'cors';

const allowedOrigins = [
  'https://reddit.com',
  'https://www.reddit.com',
  process.env.DEVVIT_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## 성능 최적화

### 1. Redis 캐싱

```typescript
// src/server/cache/chatCache.ts
import { Devvit } from '@devvit/public-api';
import crypto from 'crypto';

export class ChatCache {
  constructor(private redis: Devvit.Context['redis']) {}
  
  private hashMessage(message: string): string {
    return crypto
      .createHash('md5')
      .update(message.toLowerCase().trim())
      .digest('hex');
  }
  
  async get(message: string): Promise<string | null> {
    const key = `chat:cache:${this.hashMessage(message)}`;
    return await this.redis.get(key);
  }
  
  async set(message: string, response: string, ttl: number = 3600): Promise<void> {
    const key = `chat:cache:${this.hashMessage(message)}`;
    await this.redis.set(key, response, {
      expiration: new Date(Date.now() + ttl * 1000)
    });
  }
  
  async clear(pattern?: string): Promise<void> {
    // 특정 패턴의 캐시 삭제
    // Redis SCAN 명령 사용
  }
}

// 사용
export async function handleChatRequest(req: Request, res: Response) {
  const { message } = req.body;
  const cache = new ChatCache(req.context.redis);
  
  // 캐시 확인
  const cached = await cache.get(message);
  if (cached) {
    return res.json({
      success: true,
      response: cached,
      cached: true
    });
  }
  
  // API 호출
  const response = await callExternalAPI(message);
  
  // 캐시 저장
  await cache.set(message, response);
  
  return res.json({
    success: true,
    response,
    cached: false
  });
}
```

### 2. 응답 압축

```typescript
// src/server/index.ts
import compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // 압축 레벨 (0-9)
}));
```

### 3. 연결 풀링

```typescript
// src/server/utils/httpClient.ts
import { Agent } from 'https';

const httpsAgent = new Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 30000
});

export async function fetchWithAgent(url: string, options: RequestInit) {
  return fetch(url, {
    ...options,
    agent: httpsAgent
  });
}
```


---

## 테스트 방법

### 1. 단위 테스트

```typescript
// test/chat.test.ts
import { describe, it, expect, vi } from 'vitest';
import { validateMessage, sanitizeInput } from '../src/server/utils/validation';

describe('Input Validation', () => {
  it('should validate correct message', () => {
    const result = validateMessage('안녕하세요');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('안녕하세요');
  });
  
  it('should reject empty message', () => {
    const result = validateMessage('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('입력');
  });
  
  it('should reject too long message', () => {
    const longMessage = 'a'.repeat(1001);
    const result = validateMessage(longMessage);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('너무 깁니다');
  });
  
  it('should sanitize HTML tags', () => {
    const dirty = '<script>alert("xss")</script>안녕';
    const result = sanitizeInput(dirty);
    expect(result).not.toContain('<script>');
    expect(result).toContain('안녕');
  });
});

describe('Chat API', () => {
  it('should handle successful request', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: '안녕하세요!' })
    });
    global.fetch = mockFetch;
    
    // 테스트 로직
  });
  
  it('should handle timeout', async () => {
    const mockFetch = vi.fn().mockImplementation(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AbortError')), 100)
      )
    );
    global.fetch = mockFetch;
    
    // 타임아웃 테스트
  });
});
```

### 2. 통합 테스트

```typescript
// test/integration/chat-flow.test.ts
import { describe, it, expect } from 'vitest';

describe('Chat Flow Integration', () => {
  it('should complete full chat flow', async () => {
    // 1. 사용자 메시지 전송
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '안녕하세요',
        sessionId: 'test-session'
      })
    });
    
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.response).toBeDefined();
    expect(typeof data.response).toBe('string');
  });
  
  it('should maintain session', async () => {
    const sessionId = 'test-session-2';
    
    // 첫 번째 메시지
    const response1 = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '내 이름은 철수야',
        sessionId
      })
    });
    
    const data1 = await response1.json();
    expect(data1.success).toBe(true);
    
    // 두 번째 메시지 (세션 유지 확인)
    const response2 = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '내 이름이 뭐였지?',
        sessionId
      })
    });
    
    const data2 = await response2.json();
    expect(data2.success).toBe(true);
    expect(data2.response.toLowerCase()).toContain('철수');
  });
});
```

### 3. 로컬 테스트

```bash
# 1. 개발 서버 실행
npm run dev

# 2. 브라우저에서 테스트
# Devvit playtest URL 열기
# https://www.reddit.com/r/your-test-subreddit?playtest=your-app

# 3. 수동 테스트 체크리스트
# - [ ] 메시지 전송 가능
# - [ ] AI 응답 수신
# - [ ] 로딩 상태 표시
# - [ ] 에러 처리 동작
# - [ ] 모바일 반응형
# - [ ] 세션 유지
```

### 4. 성능 테스트

```typescript
// test/performance/load-test.ts
import { describe, it } from 'vitest';

describe('Performance Tests', () => {
  it('should handle concurrent requests', async () => {
    const requests = Array.from({ length: 10 }, (_, i) =>
      fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `테스트 메시지 ${i}`,
          sessionId: `session-${i}`
        })
      })
    );
    
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    
    const allSuccessful = responses.every(r => r.ok);
    expect(allSuccessful).toBe(true);
    
    const avgTime = (endTime - startTime) / requests.length;
    console.log(`Average response time: ${avgTime}ms`);
    expect(avgTime).toBeLessThan(5000); // 5초 이내
  });
});
```

---

## 트러블슈팅

### 문제 1: 타임아웃 에러

**증상**:
```
504 Gateway Timeout
응답 시간이 초과되었습니다.
```

**원인**:
- 외부 API 응답이 25초 이상 소요
- 네트워크 지연
- API 서버 과부하

**해결 방법**:
```typescript
// 1. 타임아웃 시간 조정
const API_TIMEOUT = 20000; // 20초로 단축

// 2. 재시도 로직 추가
async function fetchWithRetry(url: string, options: RequestInit, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(1000 * (i + 1)); // 지수 백오프
    }
  }
}

// 3. 사용자에게 더 짧은 질문 요청
if (message.length > 500) {
  return res.status(400).json({
    error: '질문이 너무 깁니다. 더 짧게 작성해주세요.'
  });
}
```

### 문제 2: CORS 에러

**증상**:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**원인**:
- CORS 헤더 미설정
- 잘못된 origin 설정

**해결 방법**:
```typescript
// src/server/index.ts
import cors from 'cors';

app.use(cors({
  origin: true, // 개발 중에는 모든 origin 허용
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 프로덕션에서는 특정 origin만 허용
const allowedOrigins = [
  'https://reddit.com',
  'https://www.reddit.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

### 문제 3: Rate Limit 초과

**증상**:
```
429 Too Many Requests
너무 많은 요청입니다.
```

**원인**:
- 사용자가 너무 빠르게 요청
- Rate limit 설정이 너무 엄격

**해결 방법**:
```typescript
// 1. Rate limit 완화
app.post('/api/chat', rateLimiter(60000, 20), handleChatRequest); // 20개로 증가

// 2. 사용자별 제한
const userLimits = new Map<string, number>();

function getUserLimit(userId: string): number {
  // VIP 사용자는 더 많은 요청 허용
  if (isVIPUser(userId)) {
    return 50;
  }
  return 10;
}

// 3. 클라이언트에서 디바운싱
const debouncedSend = debounce(sendMessage, 1000);
```

### 문제 4: 메모리 누수

**증상**:
- 서버 메모리 사용량 지속 증가
- 응답 속도 점진적 저하

**원인**:
- Rate limit map 정리 안 됨
- 이벤트 리스너 정리 안 됨

**해결 방법**:
```typescript
// 1. 주기적 정리
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // 1분마다 정리

// 2. LRU 캐시 사용
import LRU from 'lru-cache';

const rateLimitCache = new LRU({
  max: 10000,
  ttl: 60000
});
```


---

## 체크리스트

### 구현 전 준비

- [ ] 외부 API 엔드포인트 URL 확보
- [ ] API 요청/응답 형식 문서화
- [ ] API 인증 방식 확인 (API 키, OAuth 등)
- [ ] API 사용량 제한 확인
- [ ] 타임아웃 설정 확인
- [ ] 에러 응답 형식 파악
- [ ] 테스트 계정/API 키 발급

### Phase 1: 서버 구현

- [ ] 타입 정의 완료 (`src/shared/types/chat.ts`)
- [ ] 프록시 엔드포인트 생성 (`/api/chat`)
- [ ] 타임아웃 처리 구현 (25초)
- [ ] 입력 검증 함수 작성
- [ ] Rate limiting 구현
- [ ] 에러 처리 구현
- [ ] 환경변수 설정 (API 키)
- [ ] 로깅 추가

### Phase 2: 클라이언트 구현

- [ ] ChatInterface 컴포넌트 생성
- [ ] 메시지 상태 관리 (useState)
- [ ] 메시지 전송 함수 구현
- [ ] 로딩 상태 표시
- [ ] 에러 표시
- [ ] 자동 스크롤 구현
- [ ] 키보드 단축키 (Enter, Shift+Enter)
- [ ] 스타일링 완료
- [ ] 모바일 반응형 확인

### Phase 3: 보안

- [ ] API 키 환경변수로 관리
- [ ] 입력 새니타이제이션
- [ ] XSS 방지
- [ ] SQL Injection 방지
- [ ] CORS 설정
- [ ] Rate limiting 테스트
- [ ] 보안 헤더 추가

### Phase 4: 최적화

- [ ] Redis 캐싱 구현 (선택적)
- [ ] 응답 압축 활성화
- [ ] 연결 풀링 설정
- [ ] 불필요한 로그 제거
- [ ] 성능 프로파일링

### Phase 5: 테스트

- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] 로컬 테스트 완료
- [ ] Devvit playtest 테스트
- [ ] 모바일 테스트
- [ ] 성능 테스트
- [ ] 부하 테스트

### Phase 6: 배포

- [ ] 환경변수 설정 확인
- [ ] 프로덕션 빌드 테스트
- [ ] 에러 모니터링 설정
- [ ] 로그 수집 설정
- [ ] 배포 문서 작성
- [ ] 롤백 계획 수립

---

## 추가 기능 아이디어

### 1. 대화 히스토리 저장

```typescript
// Redis에 대화 히스토리 저장
interface ConversationHistory {
  sessionId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

async function saveHistory(
  sessionId: string,
  messages: Message[],
  redis: Redis
): Promise<void> {
  const key = `chat:history:${sessionId}`;
  await redis.set(key, JSON.stringify({
    sessionId,
    messages,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }), {
    expiration: new Date(Date.now() + 86400000) // 24시간
  });
}

async function loadHistory(
  sessionId: string,
  redis: Redis
): Promise<Message[]> {
  const key = `chat:history:${sessionId}`;
  const data = await redis.get(key);
  if (!data) return [];
  
  const history: ConversationHistory = JSON.parse(data);
  return history.messages;
}
```

### 2. 다중 AI 캐릭터

```typescript
interface AICharacter {
  id: string;
  name: string;
  personality: string;
  avatar: string;
  systemPrompt: string;
}

const characters: AICharacter[] = [
  {
    id: 'suspect1',
    name: '용의자 A',
    personality: '신경질적이고 방어적',
    avatar: '😠',
    systemPrompt: 'You are a nervous suspect...'
  },
  {
    id: 'suspect2',
    name: '용의자 B',
    personality: '침착하고 계산적',
    avatar: '😎',
    systemPrompt: 'You are a calm and calculated suspect...'
  }
];

// 캐릭터 선택 UI
function CharacterSelector({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="character-selector">
      {characters.map(char => (
        <button
          key={char.id}
          onClick={() => onSelect(char.id)}
          className="character-card"
        >
          <div className="character-avatar">{char.avatar}</div>
          <div className="character-name">{char.name}</div>
          <div className="character-personality">{char.personality}</div>
        </button>
      ))}
    </div>
  );
}
```

### 3. 음성 입력/출력

```typescript
// 음성 입력 (Web Speech API)
function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  
  const startListening = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    
    recognition.start();
  };
  
  return { isListening, startListening };
}

// 음성 출력 (Web Speech API)
function speakText(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
}
```

### 4. 마크다운 렌더링

```typescript
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

function MessageContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
```

### 5. 타이핑 애니메이션

```typescript
function useTypingAnimation(text: string, speed: number = 50) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [displayedText, text, speed]);
  
  return { displayedText, isTyping };
}

// 사용
function AnimatedMessage({ content }: { content: string }) {
  const { displayedText, isTyping } = useTypingAnimation(content);
  
  return (
    <div className="message-text">
      {displayedText}
      {isTyping && <span className="cursor">|</span>}
    </div>
  );
}
```

---

## 참고 자료

### 공식 문서
- [Devvit Documentation](https://developers.reddit.com/docs)
- [Devvit Web Apps Guide](https://developers.reddit.com/docs/web_apps)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)

### 관련 패턴
- `.kiro/steering/patterns/successful-patterns.md` - 성공 패턴
- `.kiro/steering/patterns/anti-patterns.md` - 피해야 할 패턴
- `.kiro/steering/learnings/` - 프로젝트 학습 내용

### 보안 가이드
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

---

## 버전 히스토리

### v1.0 (2025-01-15)
- 초기 문서 작성
- 3-Tier 아키텍처 설계
- 프록시 패턴 구현 가이드
- 보안 고려사항 추가
- 성능 최적화 방법
- 테스트 가이드
- 트러블슈팅 섹션

---

## 라이선스

이 문서는 프로젝트 내부용으로 작성되었습니다.

---

**작성자**: Kiro AI Assistant  
**최종 수정일**: 2025-01-15  
**문서 상태**: 완료 ✅

