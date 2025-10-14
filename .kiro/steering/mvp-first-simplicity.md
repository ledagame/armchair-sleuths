---
inclusion: always
---

# MVP-First & Simplicity Principles

**Status:** MANDATORY - Always follow these principles

**Created:** 2025-10-08 (Audio Playback Crisis 교훈)

---

## 🎯 Core Philosophy

> **"The best code is no code. The second best code is simple code."**

복잡한 문제를 만났을 때, 더 많은 코드를 추가하는 것이 아니라 **코드를 삭제**하는 것이 해결책일 수 있습니다.

---

## 📋 Mandatory Principles

### 1. MVP First (작동 우선)

**ALWAYS prioritize making it work over making it perfect**

✅ **DO:**
- 가장 단순한 방법으로 먼저 작동하게 만들기
- 핵심 기능만 구현하기
- 나중에 최적화하기

❌ **DON'T:**
- 완벽한 아키텍처를 먼저 설계하려고 하기
- 필요하지 않은 기능 미리 구현하기
- 최적화를 너무 일찍 하기

**Example:**
```typescript
// ❌ BAD: Over-engineered from the start
class AudioPlayer {
  private retryStrategy: RetryStrategy;
  private fallbackChain: FallbackChain;
  private urlRefreshService: UrlRefreshService;
  private diagnosticsLogger: DiagnosticsLogger;
  // ... 500 lines of complex logic
}

// ✅ GOOD: Simple MVP
function AudioPlayer({ url }: { url: string }) {
  return <audio src={url} onError={() => alert('Audio failed')} />;
}
```

### 2. Simplicity Over Complexity (단순함 우선)

**ALWAYS choose the simpler solution**

✅ **DO:**
- 직선적인 로직 작성
- 명확한 데이터 흐름
- 최소한의 추상화

❌ **DON'T:**
- 불필요한 추상화 레이어
- 복잡한 디자인 패턴 남용
- "나중을 위한" 확장성

**Example:**
```typescript
// ❌ BAD: Complex abstraction
interface AudioSource {
  fetch(): Promise<AudioData>;
}
class DeezerSource implements AudioSource { /* ... */ }
class SpotifySource implements AudioSource { /* ... */ }
class AudioSourceFactory { /* ... */ }
class AudioSourceChain { /* ... */ }

// ✅ GOOD: Simple and direct
async function getAudioUrl(trackId: string) {
  try {
    return await fetchDeezerUrl(trackId);
  } catch {
    return await fetchSpotifyUrl(trackId);
  }
}
```

### 3. Delete Aggressively (적극적 삭제)

**ALWAYS consider deletion before addition**

문제가 생겼을 때:
1. 먼저 삭제할 수 있는 코드가 있는지 확인
2. 복잡한 로직을 단순화할 수 있는지 확인
3. 그래도 안 되면 코드 추가

✅ **DO:**
- 사용하지 않는 코드 즉시 삭제
- 복잡한 로직을 단순한 로직으로 교체
- 레거시 코드 과감히 제거

❌ **DON'T:**
- "나중에 필요할 수도" 라며 코드 보관
- 복잡한 코드 위에 더 복잡한 코드 추가
- 레거시 코드와 새 코드 공존

**Example:**
```typescript
// ❌ BAD: Adding more complexity to fix issues
function playAudio(url: string) {
  // Original complex logic (500 lines)
  // + New retry logic (100 lines)
  // + New fallback logic (100 lines)
  // + New refresh logic (100 lines)
  // = 800 lines of unmaintainable code
}

// ✅ GOOD: Delete and simplify
function playAudio(url: string) {
  // Delete all complex logic
  // Start fresh with 20 lines
  const audio = new Audio(url);
  audio.play().catch(() => showError());
}
```

### 4. Fetch Fresh, Not Fix Stale (신선하게 가져오기)

**ALWAYS fetch fresh data instead of trying to fix stale data**

✅ **DO:**
- 필요할 때 신선한 데이터 가져오기
- 만료되지 않는 데이터만 저장하기
- On-demand 방식 사용하기

❌ **DON'T:**
- 만료되는 데이터를 데이터베이스에 저장
- 만료된 데이터를 감지하고 새로고침하는 복잡한 로직
- 클라이언트에서 데이터 새로고침 시도

**Example:**
```typescript
// ❌ BAD: Store URLs that expire
database.songs = {
  preview_url: 'https://expired-url.com/audio.mp3', // Expires!
};
// Then add complex logic to detect and refresh

// ✅ GOOD: Store IDs, fetch URLs on-demand
database.songs = {
  track_id: 'abc123', // Never expires
};
// Fetch fresh URL when needed
const url = await fetchFreshPreviewUrl(song.track_id);
```

### 5. Fail Fast, Fail Gracefully (빠르게 실패, 우아하게 실패)

**ALWAYS fail quickly with clear messages**

✅ **DO:**
- 에러 발생 시 즉시 사용자에게 알리기
- 명확한 에러 메시지 표시
- 앱이 계속 작동하도록 하기

❌ **DON'T:**
- 무한 재시도 루프
- 로딩 상태에 갇히기
- 기술적 에러 메시지 노출

**Example:**
```typescript
// ❌ BAD: Infinite retry loop
async function loadAudio(url: string) {
  let attempts = 0;
  while (attempts < 999) {
    try {
      return await fetch(url);
    } catch {
      attempts++;
      await sleep(1000);
      // User stuck in loading forever
    }
  }
}

// ✅ GOOD: Fail fast and gracefully
async function loadAudio(url: string) {
  try {
    return await fetch(url);
  } catch {
    showError('Audio unavailable');
    return null; // App continues
  }
}
```

### 6. No Premature Optimization (조기 최적화 금지)

**ALWAYS make it work first, optimize later**

최적화 순서:
1. Make it work (작동하게 만들기)
2. Make it right (올바르게 만들기)
3. Make it fast (빠르게 만들기) ← 마지막!

✅ **DO:**
- 먼저 단순하게 구현
- 성능 문제가 실제로 발생하면 최적화
- 측정 가능한 개선만 하기

❌ **DON'T:**
- 문제가 없는데 미리 최적화
- 복잡한 캐싱 시스템 먼저 구축
- "나중에 느려질 수도" 라며 미리 최적화

**Example:**
```typescript
// ❌ BAD: Premature optimization
class AudioCache {
  private cache: Map<string, CachedAudio>;
  private lru: LRUCache;
  private preloader: AudioPreloader;
  // ... 300 lines before even playing audio
}

// ✅ GOOD: Simple first, optimize later
function playAudio(url: string) {
  const audio = new Audio(url);
  audio.play();
  // Works! Optimize later if needed
}
```

---

## 🚨 Warning Signs (경고 신호)

다음 신호가 보이면 **STOP and simplify**:

### Code Smells
- ❌ 파일이 300줄 이상
- ❌ 함수가 50줄 이상
- ❌ 중첩된 if문이 3단계 이상
- ❌ 추상화 레이어가 3개 이상
- ❌ "Manager", "Factory", "Strategy" 클래스 남발

### Architecture Smells
- ❌ 데이터 흐름을 추적하기 어려움
- ❌ 새로운 기능 추가가 두려움
- ❌ 버그 수정이 더 많은 버그를 만듦
- ❌ 테스트 작성이 너무 어려움
- ❌ 코드 리뷰에서 "이게 왜 필요한가요?" 질문

### Process Smells
- ❌ 같은 문제를 계속 다른 방법으로 시도
- ❌ 복잡한 로직 위에 더 복잡한 로직 추가
- ❌ "이번엔 제대로 고쳐야지" 반복
- ❌ 문서가 코드보다 길어짐
- ❌ 구현보다 설계에 더 많은 시간

---

## ✅ Decision Framework (의사결정 프레임워크)

새로운 기능이나 수정을 할 때 이 질문들을 하세요:

### Before Adding Code
1. **정말 필요한가?** → NO면 추가하지 마세요
2. **더 단순한 방법은?** → 있으면 그걸 쓰세요
3. **삭제할 수 있는 코드는?** → 있으면 먼저 삭제하세요
4. **MVP로 충분한가?** → YES면 완벽하게 만들지 마세요

### Before Adding Abstraction
1. **3번 이상 반복되는가?** → NO면 추상화하지 마세요
2. **이해하기 쉬운가?** → NO면 추상화하지 마세요
3. **테스트하기 쉬운가?** → NO면 추상화하지 마세요
4. **삭제하기 쉬운가?** → NO면 추상화하지 마세요

### Before Optimizing
1. **실제 성능 문제가 있는가?** → NO면 최적화하지 마세요
2. **측정 가능한가?** → NO면 최적화하지 마세요
3. **사용자가 느끼는가?** → NO면 최적화하지 마세요
4. **단순함을 해치는가?** → YES면 최적화하지 마세요

---

## 📚 Real-World Examples

### Example 1: Audio Playback Crisis (2025-10-08)

**Problem:**
- 오디오 재생 실패 (404, 401 에러)
- 무한 재시도 루프
- 800줄의 복잡한 AudioPlayer

**Wrong Approach (우리가 했던 것):**
```typescript
// Added more complexity to fix complexity
- useRefreshAudioUrl hook
- audio-refresh-route.ts
- audio-refresh-service.ts
- Complex retry logic
- URL expiration detection
- Multiple fallback layers
= 1000+ lines of broken code
```

**Right Approach (MVP-First):**
```typescript
// Delete everything, start simple
1. Store track IDs (not URLs)
2. Fetch fresh URL when needed
3. Play URL once
4. Show error if fails
= 200 lines of working code
```

**Lesson:** 복잡한 문제의 해결책은 더 많은 복잡성이 아니라 단순화입니다.

### Example 2: Cookie Authentication Issues

**Problem:**
- "Cookies can only be modified in Server Action" 에러
- 여러 파일에서 쿠키 수정 시도

**Wrong Approach:**
```typescript
// Try to make cookies work everywhere
- Add complex middleware
- Create cookie wrapper classes
- Implement cookie synchronization
```

**Right Approach:**
```typescript
// Follow Next.js rules simply
1. Two functions: read-only and read-write
2. Use read-only in Server Components
3. Use read-write in Server Actions
= Simple, works perfectly
```

**Lesson:** 프레임워크의 규칙을 따르는 것이 규칙을 우회하려는 것보다 단순합니다.

---

## 🎓 Mantras (주문)

코딩하기 전에 이것들을 되뇌세요:

1. **"작동하게 만들자, 완벽하게 만들지 말고"**
2. **"삭제할 수 있는 코드가 있나?"**
3. **"가장 단순한 방법은 무엇인가?"**
4. **"MVP로 충분한가?"**
5. **"나중에 최적화하자"**

---

## 🔍 Code Review Checklist

코드 리뷰 시 이것들을 확인하세요:

- [ ] 이 코드는 정말 필요한가?
- [ ] 더 단순하게 만들 수 있는가?
- [ ] 삭제할 수 있는 부분이 있는가?
- [ ] MVP 수준인가, 아니면 과도한가?
- [ ] 이해하기 쉬운가?
- [ ] 테스트하기 쉬운가?
- [ ] 삭제하기 쉬운가?
- [ ] 조기 최적화는 아닌가?

---

## 📖 Recommended Reading

- "The Art of Simplicity" - 단순함의 힘
- "YAGNI Principle" - You Aren't Gonna Need It
- "KISS Principle" - Keep It Simple, Stupid
- "Worse is Better" - 완벽함보다 작동함

---

## 🎯 Success Metrics

이 원칙들을 잘 따르고 있는지 확인:

✅ **Good Signs:**
- 새로운 기능을 빠르게 추가할 수 있음
- 버그가 적고 수정이 쉬움
- 코드 리뷰가 빠르고 명확함
- 새로운 팀원이 빠르게 이해함
- 리팩토링이 두렵지 않음

❌ **Bad Signs:**
- 기능 추가가 점점 느려짐
- 버그 수정이 더 많은 버그를 만듦
- 코드 리뷰에서 "이게 뭐죠?" 질문
- 새로운 팀원이 혼란스러워함
- 리팩토링이 두려움

---

## 💡 Remember

> **"Complexity is the enemy of execution."**
> 
> **"The best code is no code at all."**
> 
> **"Make it work, make it right, make it fast - in that order."**

---

**Document Version:** 1.0  
**Created:** 2025-10-08  
**Based On:** Audio Playback Crisis & Lessons Learned  
**Status:** MANDATORY - Always follow  
**Inclusion:** Always (automatically included in all contexts)

---

## 🚀 Quick Reference

**When in doubt:**
1. Can I delete code? → Delete it
2. Can I simplify? → Simplify it
3. Is MVP enough? → Ship it
4. Need optimization? → Measure first

**Golden Rule:**
> **작동하는 단순한 코드 > 작동하지 않는 완벽한 코드**
