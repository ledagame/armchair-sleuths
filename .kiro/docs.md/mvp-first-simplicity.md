# MVP-First & Simplicity Principles

**Status:** MANDATORY - Always follow these principles

**Created:** 2025-10-08 (Audio Playback Crisis 교훈)

---

## 🎯 Core Philosophy

> **"The best code is no code. The second best code is simple code."**

복잡한 문제를 만났을 때, 더 많은 코드를 추가하는 것이 아니라 **코드를 삭제**하는 것이 해결책일 수 있습니다.

---

## 📋 6 Mandatory Principles

### 1. MVP First (작동 우선)
**ALWAYS prioritize making it work over making it perfect**

### 2. Simplicity Over Complexity (단순함 우선)
**ALWAYS choose the simpler solution**

### 3. Delete Aggressively (적극적 삭제)
**ALWAYS consider deletion before addition**

### 4. Fetch Fresh, Not Fix Stale (신선하게 가져오기)
**ALWAYS fetch fresh data instead of trying to fix stale data**

### 5. Fail Fast, Fail Gracefully (빠르게 실패, 우아하게 실패)
**ALWAYS fail quickly with clear messages**

### 6. No Premature Optimization (조기 최적화 금지)
**ALWAYS make it work first, optimize later**

---

## 🚨 Warning Signs (경고 신호)

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

### Process Smells
- ❌ 같은 문제를 계속 다른 방법으로 시도
- ❌ 복잡한 로직 위에 더 복잡한 로직 추가
- ❌ "이번엔 제대로 고쳐야지" 반복

---

## ✅ Decision Framework

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

## 📚 Real-World Example: Audio Playback Crisis (2025-10-08)

### Problem
- 오디오 재생 실패 (404, 401 에러)
- 무한 재시도 루프
- 800줄의 복잡한 AudioPlayer

### Wrong Approach (우리가 했던 것)
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

### Right Approach (MVP-First)
```typescript
// Delete everything, start simple
1. Store track IDs (not URLs)
2. Fetch fresh URL when needed
3. Play URL once
4. Show error if fails
= 200 lines of working code
```

### Lesson
복잡한 문제의 해결책은 더 많은 복잡성이 아니라 단순화입니다.

---

## 🎓 Mantras (주문)

코딩하기 전에 이것들을 되뇌세요:

1. **"작동하게 만들자, 완벽하게 만들지 말고"**
2. **"삭제할 수 있는 코드가 있나?"**
3. **"가장 단순한 방법은 무엇인가?"**
4. **"MVP로 충분한가?"**
5. **"나중에 최적화하자"**

---

## 📊 Success Metrics

### Good Signs ✅
- 새로운 기능을 빠르게 추가할 수 있음
- 버그가 적고 수정이 쉬움
- 코드 리뷰가 빠르고 명확함
- 새로운 팀원이 빠르게 이해함
- 리팩토링이 두렵지 않음

### Bad Signs ❌
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

## 🚀 Quick Reference

**When in doubt:**
1. Can I delete code? → Delete it
2. Can I simplify? → Simplify it
3. Is MVP enough? → Ship it
4. Need optimization? → Measure first

**Golden Rule:**
> **작동하는 단순한 코드 > 작동하지 않는 완벽한 코드**

---

**Document Version:** 1.0  
**Created:** 2025-10-08  
**Based On:** Audio Playback Crisis & Lessons Learned  
**Status:** MANDATORY - Always follow
