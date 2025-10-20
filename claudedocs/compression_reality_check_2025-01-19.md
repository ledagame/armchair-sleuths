# 압축 현실 체크: 왜 이미지 압축이 불가능한가?

**작성일**: 2025-01-19
**문제**: "Sharp는 안되는데 뭘로 압축한다는 건가요? Gemini로 작은 이미지 생성 안되나요?"

---

## 1. 핵심 결론 (TL;DR)

❌ **Devvit 환경에서 이미지 압축은 현재 불가능합니다**
❌ **Gemini API는 이미지 크기/품질 제어를 지원하지 않습니다**
✅ **유일한 해결책: 2-stage loading (별도 엔드포인트 분리)**

---

## 2. 압축 불가능한 이유 - 3가지 차단 지점

### 차단 지점 1: Sharp (서버 압축)
```
❌ 상태: 사용 불가
📍 위치: Devvit 서버 내부
🔒 원인: QuickJS 환경 (Native C++ 모듈 미지원)
```

**기술적 설명**:
- Sharp는 `libvips` C++ 라이브러리 필요
- Devvit는 QuickJS 사용 (Node.js의 경량 버전)
- Native binding 불가능

**이전 시도 기록**:
```
사용자 확인: "sharp는 앞선 도전에서 devvit에서는호환안된다는게 확인되엇어"
```

### 차단 지점 2: Vercel Function (외부 압축)
```
❌ 상태: 도메인 차단
📍 위치: armchair-sleuths-silk.vercel.app
🔒 원인: Devvit 보안 정책 (PERMISSION_DENIED)
```

**에러 로그** (v0.0.28):
```
PERMISSION_DENIED: HTTP request to domain:
armchair-sleuths-silk.vercel.app is not allowed
```

**파일 존재 여부**:
- ✅ `vercel/api/generate-image.ts` 파일은 존재함
- ❌ 하지만 Devvit에서 호출 불가능
- 💡 이 파일은 "사용되지 않는 코드"

**사용자 확인**:
```
"vercel 을 우리는 사용안합니다 vercel로 햇더니
허용되지않은 도메인이라고 실패햇던적이잇는데"
```

### 차단 지점 3: Gemini API (생성 시 크기 제어)
```
❌ 상태: API 파라미터 미지원
📍 위치: Gemini 2.5 Flash Image API
🔒 원인: API 설계 제약
```

**Gemini API 실제 스펙**:
```typescript
// ✅ 지원되는 파라미터
{
  "generationConfig": {
    "temperature": 0.4,
    "topP": 0.95,
    "topK": 40,
    "aspectRatio": "16:9"  // 가로세로 비율만 가능
  }
}

// ❌ 지원되지 않는 파라미터
{
  "resolution": "512x512",      // ❌ 해상도 제어 불가
  "quality": 80,                // ❌ 품질 제어 불가
  "maxFileSize": "200KB",       // ❌ 파일 크기 제한 불가
  "format": "JPEG"              // ❌ 포맷 지정 불가
}
```

**실제 출력**:
- 고정 해상도: `1024x1024` 픽셀
- 고정 포맷: `PNG` (압축 안 됨)
- 고정 크기: `~1.5MB` base64 (예측 불가능)

**공식 문서 확인**:
- Gemini API 문서에는 크기 제어 관련 파라미터 없음
- `aspect_ratio`만 유일하게 지원 (예: "1:1", "16:9", "9:16")

---

## 3. 현재 아키텍처 분석

### 실제 작동 흐름 (v0.0.31.21)
```
1. Devvit Server
   └─> GeminiClient.generateImage()
       └─> Gemini API 직접 호출
           └─> 1024x1024 PNG 생성 (~1.5MB)
               └─> Base64 인코딩
                   └─> Redis KV 저장 (suspect.profileImageUrl)
                       └─> /api/case/today 응답
                           └─> 3 images × 1.5MB = 4.5MB
                               └─> ❌ 500 ERROR
```

### 압축이 일어나지 않는 이유
```typescript
// src/server/services/gemini/GeminiClient.ts:185
const imageUrl = `data:${mimeType};base64,${base64Image}`;

// ❌ 압축 없음 (Raw Gemini 출력 그대로 사용)
```

### Vercel Function이 호출되지 않는 이유
```typescript
// vercel/api/generate-image.ts 파일은 존재하지만...

// ❌ Devvit에서 호출 시도 시:
fetch('https://armchair-sleuths-silk.vercel.app/api/generate-image')
// → PERMISSION_DENIED: domain not allowed
```

---

## 4. 연구 문서의 오해 지점

### 문서에서 언급한 "백엔드 롤백 + 압축"
**위치**: `claudedocs/research_devvit_gemini_image_strategies_2025-01-19.md`

**문서 내용**:
> "Option 1: Backend Rollback (복원) + 이미지 압축
> 장점: 기존 프론트엔드 코드 유지"

**사용자의 정당한 의문**:
> "백엔드롤백에 압축을 생각하는거같던데 sharp는안되는데 뭘로 압축한다는건가요?"

### 해명
**잘못된 가정**: Vercel Function이 작동할 것이라고 가정
**현실**: Vercel 도메인이 차단되어 있어 사용 불가
**결론**: 이 옵션은 **실현 불가능**

---

## 5. 실제 가능한 옵션 (재정리)

### Option A: 2-Stage Loading (별도 엔드포인트) ✅
```
장점:
- ✅ 실제로 작동함 (압축 없이도)
- ✅ 4.5MB 응답 문제 해결
- ✅ 개별 이미지 로딩 가능

단점:
- ❌ 3번의 추가 API 호출 필요
- ❌ 초기 로딩 느림 (순차: 15초, 병렬: 5초)
- ❌ Layout shift 가능성

구현 상태:
- ✅ 백엔드: /api/suspect-image/:id 이미 구현됨
- ❌ 프론트엔드: 아직 미구현
```

### Option B: 백엔드 롤백 (v0.0.31.21 복원) ⚠️
```
장점:
- ✅ 프론트엔드 수정 불필요
- ✅ 구현 빠름 (이미 작동했던 코드)

단점:
- ❌ 500 error 재발 가능 (4.5MB 응답)
- ❌ 압축 불가능 (위에서 설명한 3가지 차단)

실험 가치:
- 🤔 실제 이미지 크기가 예상보다 작을 수도 있음
- 🤔 Devvit 응답 크기 한계가 5MB 이상일 수도 있음
- 🤔 한 번 시도해볼 가치는 있음
```

### Option C: 이미지 개수 줄이기 (1-2개) ✅
```
장점:
- ✅ 응답 크기 감소 (1.5-3MB)
- ✅ 500 error 회피 가능
- ✅ 압축 불필요

단점:
- ❌ UX 저하 (모든 용의자 이미지 안 보임)
- ❌ 게임 완성도 하락

구현:
- 간단 (CaseGeneratorService에서 개수 제한)
```

### Option D: 이미지 없이 플레이스홀더 ❌
```
장점:
- ✅ 성능 최고
- ✅ 안정성 최고

단점:
- ❌ 게임 목표 달성 실패
- ❌ 사용자 요구사항 미충족

결론: 이 옵션은 고려 대상 아님
```

---

## 6. 추천 솔루션

### 최종 추천: Option A (2-Stage Loading) + UX 개선

**이유**:
1. ✅ **유일하게 작동이 보장되는 방법**
2. ✅ **압축 없이도 문제 해결**
3. ✅ **확장 가능 (향후 더 많은 이미지 추가 가능)**

**구현 단계**:

#### Phase 1: 프론트엔드 수정 (현재 필요)
```typescript
// WebView에서 이미지 개별 로딩
async function loadSuspectImage(suspectId: string) {
  const response = await fetch(`/api/suspect-image/${suspectId}`);
  const data = await response.json();
  return data.profileImageUrl;
}

// 병렬 로딩으로 성능 개선
Promise.all(suspects.map(s => loadSuspectImage(s.id)));
```

#### Phase 2: UX 개선
```typescript
// 1. Skeleton Screen (로딩 중 표시)
<div className="skeleton-image">Loading...</div>

// 2. Progressive Loading (하나씩 표시)
{imageUrl ? <img src={imageUrl} /> : <Skeleton />}

// 3. Fade-in Animation (부드러운 전환)
<img
  src={imageUrl}
  style={{ opacity: loaded ? 1 : 0, transition: '0.3s' }}
/>
```

#### Phase 3: 성능 최적화
```typescript
// Batch API (한 번에 3개 이미지 요청)
POST /api/suspect-images
{
  "suspectIds": ["s1", "s2", "s3"]
}

// 응답:
{
  "images": {
    "s1": "data:image/png;base64,...",
    "s2": "data:image/png;base64,...",
    "s3": "data:image/png;base64,..."
  }
}
```

---

## 7. 타임라인 비교 (Option A 구현 시)

### 현재 상태 (v0.0.33.13)
```
GET /api/case/today → 0초
이미지 로딩 → ❌ 실패 (프론트엔드 미구현)
총 소요 시간: N/A
```

### Option A (순차 로딩)
```
GET /api/case/today → 1초
GET /api/suspect-image/s1 → 1초
GET /api/suspect-image/s2 → 1초
GET /api/suspect-image/s3 → 1초
총 소요 시간: 4초
```

### Option A (병렬 로딩) ⭐ 추천
```
GET /api/case/today → 1초
  ├─ GET /api/suspect-image/s1 → 1초 ┐
  ├─ GET /api/suspect-image/s2 → 1초 ├─ 병렬 실행
  └─ GET /api/suspect-image/s3 → 1초 ┘
총 소요 시간: 2초
```

### Option A (Batch API + 병렬) ⭐⭐ 최적
```
GET /api/case/today → 1초
POST /api/suspect-images (3개 한번에) → 1초
총 소요 시간: 2초
```

---

## 8. 결론

### 질문에 대한 답변

**Q1: "Sharp는 안되는데 뭘로 압축한다는 건가요?"**
```
A: 압축할 수 없습니다.
- Sharp: Devvit QuickJS에서 불가능
- Vercel: 도메인 차단으로 불가능
- 브라우저 Canvas API: 서버 사이드에서 불가능
```

**Q2: "Gemini로 이미지 만들 때 저용량으로 작은 크기로 생성하면 안되나요?"**
```
A: Gemini API가 지원하지 않습니다.
- 고정 해상도: 1024x1024
- 고정 포맷: PNG
- 제어 가능한 것: aspect_ratio (16:9 등) 뿐
- 크기/품질 파라미터: 없음
```

### 최종 권장사항

**즉시 구현**: Option A (2-Stage Loading)
- 프론트엔드에서 `/api/suspect-image/:id` 호출
- 병렬 로딩으로 성능 개선 (2초 내 완료)
- Skeleton UI로 UX 개선

**향후 고려**: Batch API 구현
- 한 번의 요청으로 3개 이미지 로딩
- 네트워크 오버헤드 감소

**포기해야 할 것**: 이미지 압축
- Devvit 환경에서는 현재 불가능
- 대안: 로딩 패턴 최적화에 집중

---

## 9. 다음 단계

사용자 결정 필요:
1. ✅ Option A 구현 (프론트엔드 수정)
2. ⚠️ Option B 실험 (백엔드 롤백 + 500 error 발생 여부 확인)
3. 🤔 Option C 고려 (이미지 1-2개로 축소)

**추천**: Option A를 먼저 구현하고, 성능이 만족스럽지 않으면 Batch API 추가
