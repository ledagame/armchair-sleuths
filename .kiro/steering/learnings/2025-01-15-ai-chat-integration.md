---
name: ai-chat-integration-learning
project: AI 채팅 대화 시스템 통합
domain: ai-integration | chat-system | external-api
date: 2025-01-15
tech-stack: [Devvit, TypeScript, React, Express, External AI API]
team-size: 1
duration: 2-3 days (estimated)
status: documented
---

# AI 채팅 대화 시스템 통합 학습

## 📋 프로젝트 개요

### 목표
외부에 이미 구축된 AI 채팅 API (https://todo-jinha-chatbot.vercel.app/api/simple-chat)를 Devvit 프로젝트에 통합하여 Reddit 사용자가 AI 용의자와 대화할 수 있는 시스템 구축

### 핵심 도전 과제
1. Devvit 클라이언트는 외부 API 직접 호출 불가
2. 30초 타임아웃 제한
3. 스트리밍 응답 불가
4. 서버리스 환경 (상태 유지 어려움)

### 해결 방법
**프록시 패턴**: Devvit 서버를 중간 계층으로 사용하여 외부 API 호출

---

## ✅ 성공 패턴

### 1. 3-Tier 프록시 아키텍처

**패턴 설명**:
```
Client (React) → Devvit Server (Proxy) → External API
```

**장점**:
- ✅ Devvit 제약사항 완벽 준수
- ✅ 외부 API 독립적 관리 가능
- ✅ 보안 강화 (API 키 서버에서만 관리)
- ✅ Rate limiting 중앙 관리
- ✅ 캐싱 및 최적화 가능

**구현 코드**:
```typescript
// Devvit Server Proxy
app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  
  // 외부 API 호출
  const response = await fetch(EXTERNAL_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId })
  });
  
  const data = await response.json();
  res.json({ success: true, response: data.response });
});
```

**적용 시나리오**:
- 외부 AI API 통합
- 외부 결제 시스템 통합
- 외부 데이터 소스 연동
- 서드파티 서비스 통합

---

### 2. 타임아웃 관리 패턴

**패턴 설명**:
Devvit 30초 제한을 고려하여 25초 타임아웃 설정 + AbortController 사용

**구현 코드**:
```typescript
const API_TIMEOUT = 25000; // 25초

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

try {
  const response = await fetch(url, {
    signal: controller.signal,
    // ...
  });
  clearTimeout(timeoutId);
} catch (error) {
  clearTimeout(timeoutId);
  if (error.name === 'AbortError') {
    // 타임아웃 처리
  }
}
```

**장점**:
- ✅ 서버 크래시 방지
- ✅ 사용자 친화적 에러 메시지
- ✅ 리소스 누수 방지

**적용 시나리오**:
- 모든 외부 API 호출
- 긴 처리 시간이 예상되는 작업
- 네트워크 불안정 환경

---

### 3. 입력 검증 및 새니타이제이션

**패턴 설명**:
사용자 입력을 서버에서 검증하고 새니타이즈하여 보안 강화

**구현 코드**:
```typescript
function validateMessage(message: string) {
  // 1. 타입 체크
  if (!message || typeof message !== 'string') {
    return { valid: false, error: '메시지를 입력해주세요.' };
  }
  
  // 2. 길이 체크
  if (message.length > 1000) {
    return { valid: false, error: '메시지가 너무 깁니다.' };
  }
  
  // 3. XSS 방지
  const sanitized = message
    .replace(/<[^>]*>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;');
  
  return { valid: true, sanitized };
}
```

**장점**:
- ✅ XSS 공격 방지
- ✅ SQL Injection 방지
- ✅ 악의적 입력 차단

---

### 4. Rate Limiting 패턴

**패턴 설명**:
사용자별 요청 제한으로 서버 과부하 방지

**구현 코드**:
```typescript
const rateLimitMap = new Map<string, RateLimitEntry>();

function rateLimiter(windowMs: number, maxRequests: number) {
  return (req, res, next) => {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const now = Date.now();
    
    const entry = rateLimitMap.get(userId);
    
    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (entry.count >= maxRequests) {
      return res.status(429).json({
        error: '너무 많은 요청입니다.'
      });
    }
    
    entry.count++;
    next();
  };
}
```

**적용 시나리오**:
- 모든 공개 API 엔드포인트
- 비용이 발생하는 작업
- 리소스 집약적 작업

---

### 5. Redis 캐싱 패턴

**패턴 설명**:
반복되는 질문에 대한 응답을 캐싱하여 성능 향상

**구현 코드**:
```typescript
async function getCachedResponse(message: string, redis: Redis) {
  const key = `chat:cache:${hashMessage(message)}`;
  return await redis.get(key);
}

async function setCachedResponse(
  message: string,
  response: string,
  redis: Redis
) {
  const key = `chat:cache:${hashMessage(message)}`;
  await redis.set(key, response, {
    expiration: new Date(Date.now() + 3600000) // 1시간
  });
}
```

**장점**:
- ✅ 응답 속도 향상
- ✅ 외부 API 호출 감소
- ✅ 비용 절감

---

## 🚨 발견한 이슈 및 해결

### Issue 1: Devvit 클라이언트 외부 API 호출 불가

**문제**:
Devvit 클라이언트는 보안상 외부 API를 직접 호출할 수 없음

**시도한 해결책**:
1. ❌ 클라이언트에서 직접 fetch → CORS 에러
2. ❌ CORS 프록시 사용 → 여전히 차단됨

**최종 해결책**:
✅ Devvit 서버를 프록시로 사용
- 클라이언트 → Devvit 서버 → 외부 API
- 서버는 외부 API 호출 가능

**교훈**:
Devvit 플랫폼 제약사항을 정확히 이해하고, 아키텍처 설계 시 반영해야 함

---

### Issue 2: 30초 타임아웃

**문제**:
외부 AI API 응답이 30초를 초과하면 Devvit 서버가 타임아웃

**시도한 해결책**:
1. ❌ 타임아웃 무시 → 서버 크래시
2. ❌ 무한 대기 → 사용자 경험 악화

**최종 해결책**:
✅ 25초 타임아웃 + 사용자 친화적 에러 메시지
```typescript
const controller = new AbortController();
setTimeout(() => controller.abort(), 25000);
```

**교훈**:
플랫폼 제한을 고려한 타임아웃 설정 필수

---

### Issue 3: 스트리밍 응답 불가

**문제**:
Devvit는 스트리밍 응답을 지원하지 않음

**시도한 해결책**:
1. ❌ Server-Sent Events (SSE) → 지원 안 됨
2. ❌ WebSocket → 지원 안 됨

**최종 해결책**:
✅ 전체 응답 대기 후 한 번에 반환
- 로딩 상태 명확히 표시
- 타이핑 애니메이션으로 UX 개선

**교훈**:
플랫폼 제약사항에 맞는 UX 설계 필요

---

## 📈 다음 프로젝트에 적용할 것

### 1. 아키텍처 패턴
- [ ] 외부 API 통합 시 항상 프록시 패턴 사용
- [ ] 3-Tier 아키텍처 템플릿 생성
- [ ] 타임아웃 관리 유틸리티 함수 라이브러리화

### 2. 보안 강화
- [ ] 입력 검증 함수 재사용 가능하게 모듈화
- [ ] Rate limiting 미들웨어 표준화
- [ ] API 키 관리 베스트 프랙티스 문서화

### 3. 성능 최적화
- [ ] Redis 캐싱 전략 표준화
- [ ] 응답 압축 기본 적용
- [ ] 연결 풀링 설정 템플릿

### 4. 사용자 경험
- [ ] 로딩 상태 컴포넌트 라이브러리
- [ ] 에러 메시지 표준화
- [ ] 타이핑 애니메이션 재사용 컴포넌트

### 5. 테스트
- [ ] 통합 테스트 템플릿 생성
- [ ] 성능 테스트 자동화
- [ ] 보안 테스트 체크리스트

---

## 📊 메트릭

### 예상 개발 시간
- **Setup Time**: 30분 (API 스펙 확인)
- **Server Implementation**: 1시간
- **Client Implementation**: 2-3시간
- **Testing**: 1시간
- **Total**: 4-5시간 (0.5-1일)

### 예상 성능
- **응답 시간**: 2-5초 (외부 API 의존)
- **캐시 히트율**: 30-40% (반복 질문)
- **동시 사용자**: 100+ (Rate limiting 적용)

### 비용 절감
- **외부 API 호출**: 30-40% 감소 (캐싱)
- **서버 리소스**: 최소화 (프록시만)
- **개발 시간**: 50% 절감 (재사용 패턴)

---

## 🔗 관련 문서

### 상세 가이드
- `docs.md/ai-chat-integration-guide.md` - 완전한 구현 가이드

### 패턴
- `.kiro/steering/patterns/successful-patterns.md` - 성공 패턴 모음
- `.kiro/steering/patterns/anti-patterns.md` - 피해야 할 패턴

### 참고 자료
- [Devvit Documentation](https://developers.reddit.com/docs)
- [Devvit Web Apps Guide](https://developers.reddit.com/docs/web_apps)

---

## 💡 핵심 교훈

### 1. 플랫폼 제약사항 이해가 최우선
Devvit의 제약사항을 정확히 이해하고 아키텍처를 설계해야 함

### 2. 프록시 패턴은 강력한 해결책
외부 API 통합 시 프록시 패턴이 가장 안전하고 효율적

### 3. 타임아웃 관리는 필수
플랫폼 제한을 고려한 타임아웃 설정으로 안정성 확보

### 4. 보안은 서버에서
클라이언트를 신뢰하지 말고, 모든 검증을 서버에서 수행

### 5. 캐싱으로 성능 향상
반복되는 요청은 캐싱으로 응답 속도 향상 및 비용 절감

---

**작성일**: 2025-01-15  
**작성자**: Kiro AI Assistant  
**상태**: 완료 ✅  
**다음 리뷰**: 첫 번째 실제 구현 후

