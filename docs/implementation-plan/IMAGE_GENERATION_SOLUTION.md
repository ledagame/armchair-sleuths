# 이미지 생성 및 표시 솔루션 - 최종 제안서

**작성일**: 2025-10-21
**상태**: 구현 대기
**우선순위**: 높음

---

## 📋 목차

1. [문제 분석](#문제-분석)
2. [리서치 결과](#리서치-결과)
3. [권장 솔루션](#권장-솔루션)
4. [구현 계획](#구현-계획)
5. [테스트 체크리스트](#테스트-체크리스트)
6. [위험 요소 및 대응](#위험-요소-및-대응)

---

## 문제 분석

### 발견된 핵심 문제

**문제 1: 백그라운드 작업 즉시 중단**
```
현상:
- Post 생성 후 백그라운드 이미지 생성이 즉시 중단됨
- "✅ Post created" 로그 이후 모든 작업 멈춤

원인:
- Devvit HTTP handler가 response 반환 시 실행 컨텍스트 완전 종료
- Promise를 globalThis에 저장해도 소용없음
- 서비스 인스턴스 재생성도 무의미함

결론:
- HTTP handler 내에서는 진정한 백그라운드 작업 불가능
```

**문제 2: 이미지 표시 안 됨**
```
증상:
- 스켈레톤 로더만 표시
- 실제 이미지 로드 실패
- 닫기 버튼 없음 (별도 이슈, 해결됨)

원인:
- 이미지가 생성되지 않음 (백그라운드 작업 중단)
- 또는 생성되었어도 안전하지 않은 URL 사용
```

**문제 3: 확장성 문제**
```
고려사항:
- 매일 새 케이스 생성
- 케이스당 14개 이미지 (10 증거 + 4 장소)
- 이미지당 평균 500KB-2MB
- 케이스가 계속 쌓이면 저장소/앱 크기 문제
```

---

## 리서치 결과

### 조사 항목 1: Devvit Assets API

**결과: ❌ 런타임 동적 저장 불가능**

```markdown
- Assets API는 빌드타임 정적 파일만 지원
- /assets 폴더의 파일은 배포 시 Reddit 서버에 업로드
- 런타임에 새 파일 추가 불가능
- 용도: 게임 로고, 아이콘, 정적 배경 등
```

**코드 예시:**
```typescript
// ✅ 가능: 빌드타임 정적 파일
const logoUrl = await context.assets.getURL('logo.png');

// ❌ 불가능: 런타임 동적 생성
await context.assets.upload('new-image.png', imageData); // 이런 API 없음
```

**참고 사례:**
- Pixelary: Base64 Data URI + Redis 사용
- 기타 게임: 정적 assets만 사용 또는 외부 호스팅

---

### 조사 항목 2: context.media.upload() API

**결과: ✅ 존재하며 사용 가능!**

**핵심 기능:**
```typescript
// 외부 URL의 이미지를 Reddit CDN으로 업로드
const result = await context.media.upload({
  url: 'https://external-image-url.com/image.jpg',
  type: 'image'
});

// 반환값: { mediaId: 'https://i.redd.it/...' }
```

**장점:**
- ✅ 외부 URL 허용 (Gemini 이미지 URL 사용 가능)
- ✅ Reddit CDN 호스팅 (i.redd.it)
- ✅ 모바일 호환 (iOS/Android)
- ✅ 보안 검증 통과
- ✅ 무료 (Reddit이 호스팅)

**제약사항 (확인 필요):**
- ⚠️ Rate limit (분당/시간당 업로드 횟수)
- ⚠️ 파일 크기 제한
- ⚠️ 동시 업로드 제한

**필요 권한:**
```json
// devvit.json
{
  "permissions": {
    "media": true
  }
}
```

---

### 조사 항목 3: Base64 Data URI 방법

**결과: ✅ 기술적으로 가능하지만 모바일 문제**

```typescript
// 이미지 → Base64 → SVG → Redis
const base64 = canvas.toDataURL('image/png').split(',')[1];
const svg = `<svg><image href="data:image/png;base64,${base64}"/></svg>`;
const dataUri = `data:image/svg+xml;base64,${btoa(svg)}`;
await redis.set(`image:${id}`, dataUri);
```

**문제점:**
- ⚠️ Android Reddit 앱에서 렌더링 실패 보고됨
- ⚠️ 파일 크기 33% 증가 (Base64 인코딩)
- ⚠️ Redis 저장 공간 소비
- ⚠️ 모바일 메모리 문제 가능성

**결론: 프로덕션 비권장**

---

### 조사 항목 4: 외부 이미지 호스팅 (Cloudinary 등)

**결과: ✅ 가능하지만 복잡함**

**장점:**
- ✅ 무제한 저장 공간
- ✅ CDN 제공
- ✅ 이미지 변환/최적화 기능
- ✅ 모바일 호환 보장

**단점:**
- ❌ URL allowlist 요청 필요 (Devvit 팀에)
- ❌ 외부 서비스 의존성
- ❌ 비용 발생 가능
- ❌ 추가 네트워크 요청

**결론: 백업 옵션으로 고려**

---

### 조사 항목 5: 다른 게임들의 방법

**Pixelary (공식 예제):**
```typescript
// 캔버스에서 이미지 생성 → Base64 → Redis
const imageData = canvas.toDataURL();
await redis.set(`pixel:${id}`, imageData);
```

**일반적인 Devvit 게임:**
- 대부분 정적 assets만 사용
- 또는 사용자가 직접 업로드 (ImageField 폼)
- 동적 AI 생성 이미지를 사용하는 게임 사례 거의 없음

**결론: 우리가 선구자!**

---

## 권장 솔루션

### 최종 권장: 하이브리드 방식

```
┌─────────────────────────────────────────────┐
│  스타터 케이스 (5-10개)                      │
│  - /assets 폴더에 포함                       │
│  - 앱과 함께 배포                            │
│  - 즉시 플레이 가능                          │
│  - 오프라인 지원                             │
└─────────────────────────────────────────────┘
              +
┌─────────────────────────────────────────────┐
│  동적 생성 케이스 (무한)                     │
│  - Gemini API로 이미지 생성                  │
│  - context.media.upload()로 업로드           │
│  - Redis에 i.redd.it URL 저장                │
│  - 온라인 필요                               │
└─────────────────────────────────────────────┘
```

### 이 방식을 선택한 이유

**장점:**
1. ✅ **앱 크기 고정** - 항상 ~50MB 유지
2. ✅ **무한 확장 가능** - 케이스 수 제한 없음
3. ✅ **즉시 플레이 가능** - 스타터 케이스로 바로 시작
4. ✅ **모바일 호환** - i.redd.it URL 사용
5. ✅ **안정적** - Reddit이 이미지 호스팅
6. ✅ **비용 효율** - 추가 비용 없음

**단점 및 대응:**
- ⚠️ 새 케이스는 이미지 로딩 시간 필요
  - 대응: Progressive loading UI (이미 구현됨)
- ⚠️ Rate limit 불확실
  - 대응: 초기 테스트 필수, 재시도 로직
- ⚠️ 온라인 필요
  - 대응: 스타터 케이스로 오프라인 지원

---

## 구현 계획

### Phase 1: 권한 및 기본 설정 (30분)

**1.1 devvit.json 수정**
```json
{
  "name": "armchair-sleuths",
  "version": "0.0.37",
  "permissions": {
    "media": true  // ← 추가
  }
}
```

**1.2 타입 정의 확인**
```typescript
// @devvit/web/server에 media API 포함 확인
import { context } from '@devvit/web/server';
// context.media.upload() 사용 가능
```

---

### Phase 2: 이미지 업로드 서비스 생성 (2시간)

**2.1 새 파일 생성**

**파일**: `src/server/services/image/ImageUploadService.ts`

```typescript
/**
 * ImageUploadService.ts
 *
 * Gemini 생성 이미지를 Reddit CDN으로 업로드하는 서비스
 * context.media.upload() API 사용
 */

import { Context } from '@devvit/web/server';
import { ImageStorageService } from './ImageStorageService';
import type { EvidenceItem } from '@/shared/types/Evidence';
import type { Location } from '@/shared/types/Discovery';

export interface UploadResult {
  success: boolean;
  mediaId?: string;
  error?: string;
}

export interface BatchUploadResult {
  totalCount: number;
  successCount: number;
  failedCount: number;
  results: Record<string, UploadResult>;
}

export class ImageUploadService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000; // ms
  private readonly BATCH_SIZE = 5; // 동시 업로드 제한

  constructor(
    private context: Context,
    private storageService: ImageStorageService
  ) {}

  /**
   * 단일 이미지 업로드 (재시도 로직 포함)
   */
  async uploadImage(
    imageUrl: string,
    retries = 0
  ): Promise<UploadResult> {
    try {
      console.log(`📤 Uploading image: ${imageUrl.substring(0, 50)}...`);

      const result = await this.context.media.upload({
        url: imageUrl,
        type: 'image'
      });

      console.log(`✅ Upload success: ${result.mediaId}`);

      return {
        success: true,
        mediaId: result.mediaId
      };

    } catch (error) {
      console.error(`❌ Upload failed (attempt ${retries + 1}/${this.MAX_RETRIES}):`, error);

      // 재시도 로직
      if (retries < this.MAX_RETRIES) {
        await this.sleep(this.RETRY_DELAY * (retries + 1));
        return this.uploadImage(imageUrl, retries + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 증거 이미지 배치 업로드
   */
  async uploadEvidenceImages(
    caseId: string,
    evidenceWithImages: Array<{ id: string; imageUrl: string }>
  ): Promise<BatchUploadResult> {
    console.log(`\n📦 ============================================`);
    console.log(`📦 Evidence Image Upload Started`);
    console.log(`📦 Case: ${caseId}`);
    console.log(`📦 Total Images: ${evidenceWithImages.length}`);
    console.log(`📦 ============================================\n`);

    const results: Record<string, UploadResult> = {};
    let successCount = 0;
    let failedCount = 0;

    // 배치 처리 (BATCH_SIZE개씩)
    for (let i = 0; i < evidenceWithImages.length; i += this.BATCH_SIZE) {
      const batch = evidenceWithImages.slice(i, i + this.BATCH_SIZE);

      console.log(`📦 Processing batch ${Math.floor(i / this.BATCH_SIZE) + 1}/${Math.ceil(evidenceWithImages.length / this.BATCH_SIZE)}`);

      // 배치 내에서는 병렬 처리
      const batchResults = await Promise.all(
        batch.map(async (item) => {
          const result = await this.uploadImage(item.imageUrl);

          // 성공 시 Redis에 저장
          if (result.success && result.mediaId) {
            await this.storageService.storeEvidenceImageUrl(
              caseId,
              item.id,
              result.mediaId
            );
            successCount++;
          } else {
            failedCount++;
          }

          return { id: item.id, result };
        })
      );

      // 결과 취합
      batchResults.forEach(({ id, result }) => {
        results[id] = result;
      });

      // Rate limit 방지를 위한 배치 간 대기
      if (i + this.BATCH_SIZE < evidenceWithImages.length) {
        await this.sleep(1000);
      }
    }

    console.log(`\n✅ ============================================`);
    console.log(`✅ Evidence Image Upload Complete`);
    console.log(`✅ Success: ${successCount}/${evidenceWithImages.length}`);
    console.log(`✅ Failed: ${failedCount}/${evidenceWithImages.length}`);
    console.log(`✅ ============================================\n`);

    return {
      totalCount: evidenceWithImages.length,
      successCount,
      failedCount,
      results
    };
  }

  /**
   * 장소 이미지 배치 업로드
   */
  async uploadLocationImages(
    caseId: string,
    locationsWithImages: Array<{ id: string; imageUrl: string }>
  ): Promise<BatchUploadResult> {
    console.log(`\n🗺️  ============================================`);
    console.log(`🗺️  Location Image Upload Started`);
    console.log(`🗺️  Case: ${caseId}`);
    console.log(`🗺️  Total Images: ${locationsWithImages.length}`);
    console.log(`🗺️  ============================================\n`);

    const results: Record<string, UploadResult> = {};
    let successCount = 0;
    let failedCount = 0;

    // 장소 이미지는 적으므로 한 번에 처리
    const uploadResults = await Promise.all(
      locationsWithImages.map(async (item) => {
        const result = await this.uploadImage(item.imageUrl);

        if (result.success && result.mediaId) {
          await this.storageService.storeLocationImageUrl(
            caseId,
            item.id,
            result.mediaId
          );
          successCount++;
        } else {
          failedCount++;
        }

        return { id: item.id, result };
      })
    );

    uploadResults.forEach(({ id, result }) => {
      results[id] = result;
    });

    console.log(`\n✅ ============================================`);
    console.log(`✅ Location Image Upload Complete`);
    console.log(`✅ Success: ${successCount}/${locationsWithImages.length}`);
    console.log(`✅ Failed: ${failedCount}/${locationsWithImages.length}`);
    console.log(`✅ ============================================\n`);

    return {
      totalCount: locationsWithImages.length,
      successCount,
      failedCount,
      results
    };
  }

  /**
   * 유틸리티: sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

### Phase 3: API 엔드포인트 추가 (1시간)

**3.1 src/server/index.ts에 엔드포인트 추가**

```typescript
/**
 * POST /api/case/:caseId/upload-images
 * 케이스의 증거 및 장소 이미지를 Reddit CDN으로 업로드
 *
 * 클라이언트가 케이스 로드 시 자동으로 호출
 * 별도 요청이므로 Reddit timeout 문제 없음
 */
router.post('/api/case/:caseId/upload-images', async (req, res): Promise<void> => {
  try {
    const { caseId } = req.params;
    console.log(`🚀 Image upload request for case: ${caseId}`);

    // 1. 케이스 데이터 조회
    const caseData = await CaseRepository.getCaseById(caseId);
    if (!caseData) {
      res.status(404).json({
        error: 'Case not found',
        message: `Case ${caseId} not found`
      });
      return;
    }

    // 2. 이미 업로드된 이미지 확인
    const adapter = KVStoreManager.getAdapter();
    const storageService = new ImageStorageService(adapter);

    const evidenceStatus = await storageService.getEvidenceImageStatus(caseId);
    if (evidenceStatus?.status === 'completed') {
      console.log(`✅ Images already uploaded for case ${caseId}`);
      res.json({
        success: true,
        message: 'Images already uploaded',
        status: evidenceStatus
      });
      return;
    }

    // 3. Gemini 이미지 생성
    const apiKey = await settings.get<string>('geminiApiKey');
    if (!apiKey) {
      res.status(500).json({
        error: 'Configuration error',
        message: 'Gemini API key not configured'
      });
      return;
    }

    const geminiClient = createGeminiClient(apiKey);
    const imageGenerator = new ImageGenerator(geminiClient);

    // 증거 이미지 생성
    console.log(`🖼️  Generating evidence images...`);
    const evidenceImages = await Promise.all(
      caseData.evidence.map(async (evidence) => {
        const request = imageGenerator.generateEvidenceImageRequest(evidence);
        const result = await imageGenerator.generateSingle(request);
        return {
          id: evidence.id,
          imageUrl: result.imageUrl
        };
      })
    );

    // 장소 이미지 생성
    console.log(`🗺️  Generating location images...`);
    const locationImages = await Promise.all(
      caseData.locations.map(async (location) => {
        const request = imageGenerator.generateLocationImageRequest(location);
        const result = await imageGenerator.generateSingle(request);
        return {
          id: location.id,
          imageUrl: result.imageUrl
        };
      })
    );

    // 4. Reddit CDN 업로드
    const uploadService = new ImageUploadService(context, storageService);

    const [evidenceUploadResult, locationUploadResult] = await Promise.all([
      uploadService.uploadEvidenceImages(caseId, evidenceImages.filter(e => e.imageUrl)),
      uploadService.uploadLocationImages(caseId, locationImages.filter(l => l.imageUrl))
    ]);

    // 5. 상태 저장
    await storageService.storeEvidenceImageStatus(caseId, {
      status: evidenceUploadResult.successCount === evidenceUploadResult.totalCount
        ? 'completed'
        : 'partial',
      totalCount: evidenceUploadResult.totalCount,
      completedCount: evidenceUploadResult.successCount,
      images: evidenceUploadResult.results,
      lastUpdated: new Date().toISOString()
    });

    await storageService.storeLocationImageStatus(caseId, {
      status: locationUploadResult.successCount === locationUploadResult.totalCount
        ? 'completed'
        : 'partial',
      totalCount: locationUploadResult.totalCount,
      completedCount: locationUploadResult.successCount,
      images: locationUploadResult.results,
      lastUpdated: new Date().toISOString()
    });

    // 6. 응답 반환
    res.json({
      success: true,
      evidence: evidenceUploadResult,
      locations: locationUploadResult
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to upload images'
    });
  }
});
```

---

### Phase 4: 클라이언트 자동 트리거 (1시간)

**4.1 src/client/hooks/useAutoImageUpload.ts 생성**

```typescript
/**
 * useAutoImageUpload.ts
 *
 * 케이스 로드 시 자동으로 이미지 업로드를 트리거하는 훅
 */

import { useEffect, useRef } from 'react';

export function useAutoImageUpload(caseId: string | undefined) {
  const uploadTriggeredRef = useRef(false);

  useEffect(() => {
    if (!caseId || uploadTriggeredRef.current) {
      return;
    }

    // 이미지 업로드 트리거 (한 번만)
    uploadTriggeredRef.current = true;

    console.log(`🚀 Triggering image upload for case: ${caseId}`);

    fetch(`/api/case/${caseId}/upload-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log(`✅ Image upload triggered:`, data);
      })
      .catch(error => {
        console.error(`❌ Failed to trigger image upload:`, error);
      });

  }, [caseId]);
}
```

**4.2 src/client/App.tsx에서 사용**

```typescript
import { useAutoImageUpload } from './hooks/useAutoImageUpload';

function App() {
  const { caseId } = useCase();

  // 케이스 로드 시 자동으로 이미지 업로드 트리거
  useAutoImageUpload(caseId);

  return (
    // ... 기존 코드
  );
}
```

---

### Phase 5: CaseGeneratorService 수정 (1시간)

**5.1 startBackgroundImageGeneration 제거**

```typescript
// src/server/services/case/CaseGeneratorService.ts

// ❌ 제거: 이제 사용하지 않음
// private startBackgroundImageGeneration() { ... }

// ✅ 변경: generateCase에서 백그라운드 호출 제거
async generateCase(options: GenerateCaseOptions): Promise<GeneratedCase> {
  // ... 케이스 생성 로직 ...

  // ❌ 제거
  // const imagePromise = this.startBackgroundImageGeneration(...);
  // globalThis.__imageGenerationPromises.set(caseId, imagePromise);

  // ✅ 변경: 이미지는 클라이언트가 별도 요청으로 생성
  console.log(`ℹ️  Images will be generated when client loads the case`);

  return savedCase;
}
```

---

## 테스트 체크리스트

### 기능 테스트

**서버 측:**
- [ ] devvit.json에 media permission 추가 확인
- [ ] context.media.upload() API 호출 성공
- [ ] 단일 이미지 업로드 성공
- [ ] 5개 이미지 동시 업로드 성공
- [ ] 10개 이미지 동시 업로드 성공
- [ ] 14개 이미지 전체 업로드 성공
- [ ] 재시도 로직 작동 확인 (일부러 실패 시키기)
- [ ] 배치 처리 (5개씩) 작동 확인
- [ ] Redis에 mediaId 저장 확인
- [ ] 업로드 진행률 상태 업데이트 확인

**클라이언트 측:**
- [ ] 케이스 로드 시 자동 업로드 트리거
- [ ] useAutoImageUpload 훅 작동
- [ ] 이미지 업로드 중 skeleton loader 표시
- [ ] 업로드 완료 후 실제 이미지 표시
- [ ] Progressive loading 애니메이션 작동
- [ ] 용의자 프로필 이미지 즉시 표시 (이미 생성됨)

**통합 테스트:**
- [ ] 새 케이스 생성 → Post 생성 → 게임 로드 → 이미지 로드
- [ ] 첫 번째 플레이어: 이미지 로딩 확인
- [ ] 두 번째 플레이어: 즉시 이미지 표시 확인

### 성능 테스트

- [ ] 이미지 생성 시간 측정 (14개, 목표: <60초)
- [ ] 업로드 시간 측정 (14개, 목표: <30초)
- [ ] 총 소요 시간 (생성 + 업로드, 목표: <90초)
- [ ] 동시 여러 사용자 테스트 (Rate limit 확인)
- [ ] 네트워크 실패 시나리오 테스트

### 모바일 테스트

- [ ] iOS Reddit 앱에서 이미지 표시 확인
- [ ] Android Reddit 앱에서 이미지 표시 확인
- [ ] 다양한 화면 크기 테스트
- [ ] 느린 네트워크 환경 테스트 (3G)
- [ ] 오프라인 → 온라인 전환 테스트

### 에러 처리 테스트

- [ ] Gemini API 실패 시 동작 확인
- [ ] context.media.upload() 실패 시 재시도 확인
- [ ] Redis 저장 실패 시 동작 확인
- [ ] 부분 업로드 성공 시 동작 확인
- [ ] Rate limit 도달 시 동작 확인

---

## 위험 요소 및 대응

### 위험 1: Rate Limit

**위험도**: 🔴 높음

**내용:**
- context.media.upload()의 정확한 rate limit 불명
- 14개 이미지 동시 업로드 시 제한 초과 가능

**대응 방안:**
1. **배치 처리**: 5개씩 나눠서 업로드
2. **배치 간 대기**: 1초 간격
3. **재시도 로직**: 3회 재시도 with exponential backoff
4. **초기 테스트**: 소규모 subreddit에서 먼저 테스트

**모니터링:**
```typescript
// 업로드 성공률 추적
const metrics = {
  totalAttempts: 0,
  successCount: 0,
  failedCount: 0,
  avgUploadTime: 0
};
```

---

### 위험 2: 파일 크기 제한

**위험도**: 🟡 중간

**내용:**
- context.media.upload()의 파일 크기 제한 불명
- Gemini 생성 이미지가 너무 클 수 있음

**대응 방안:**
1. **Gemini 프롬프트 조정**: 이미지 크기 제한 요청
2. **이미지 압축**: 업로드 전 클라이언트에서 압축
3. **크기 검증**: 업로드 전 크기 체크

**예시 코드:**
```typescript
// Gemini 프롬프트에 크기 제한 추가
const prompt = `
Generate an image...
Image specifications:
- Max resolution: 1024x768
- File size: under 1MB
- Format: JPEG, 80% quality
`;
```

---

### 위험 3: Gemini 이미지 URL 만료

**위험도**: 🟡 중간

**내용:**
- Gemini가 제공하는 이미지 URL이 임시일 수 있음
- 일정 시간 후 만료 가능

**대응 방안:**
1. **즉시 업로드**: 생성 후 바로 context.media.upload() 호출
2. **만료 시간 추적**: URL 생성 시간 기록
3. **재생성 로직**: 만료 시 자동 재생성

**타임라인:**
```
Gemini 이미지 생성 (t=0)
  ↓ (즉시, <5초)
context.media.upload() (t=5)
  ↓ (즉시)
Redis에 i.redd.it URL 저장 (t=10)
  ↓
영구 사용 가능 ✅
```

---

### 위험 4: 네트워크 실패

**위험도**: 🟡 중간

**내용:**
- 사용자 네트워크 환경 불안정
- 중간에 연결 끊김

**대응 방안:**
1. **진행률 저장**: 부분 업로드 완료 상태 저장
2. **재개 기능**: 중단된 지점부터 재개
3. **스켈레톤 로더**: 로딩 중임을 명확히 표시
4. **재시도 버튼**: 수동 재시도 옵션 제공

---

### 위험 5: 비용 (예상 문제 없음)

**위험도**: 🟢 낮음

**내용:**
- Reddit CDN 호스팅 비용 발생 가능성

**대응 방안:**
1. **Reddit 정책 확인**: Devvit 팀에 문의
2. **사용량 모니터링**: 초기 단계에서 추적
3. **대안 준비**: 필요 시 Cloudinary 전환 가능

**예상:**
- Reddit은 i.redd.it를 무료로 제공할 것으로 예상
- 다른 Devvit 앱들도 사용 중

---

## 스타터 케이스 생성 계획 (선택 사항)

### 목표

- 5-10개의 완성된 케이스를 /assets 폴더에 포함
- 오프라인 플레이 지원
- 새 사용자에게 즉시 플레이 가능한 경험 제공

### 생성 방법

**옵션 A: 수동 생성**
```bash
# 1. 로컬에서 케이스 생성
node scripts/generate-starter-cases.js

# 2. 생성된 이미지를 assets/starter-cases/에 복사
cp generated-cases/* assets/starter-cases/

# 3. 빌드 및 배포
npm run dev
```

**옵션 B: CI/CD 자동화**
```yaml
# .github/workflows/build-with-starter-cases.yml
- name: Generate starter cases
  run: npm run generate-starters

- name: Build app
  run: npm run build
```

### 디렉토리 구조

```
assets/
  └── starter-cases/
      ├── case-001/
      │   ├── info.json          (케이스 데이터)
      │   ├── scene.jpg          (범죄 현장)
      │   ├── suspect-1.jpg
      │   ├── suspect-2.jpg
      │   ├── suspect-3.jpg
      │   ├── evidence-1.jpg
      │   ├── evidence-2.jpg
      │   └── ... (총 ~15개 파일, ~5MB)
      ├── case-002/
      └── ... (총 5-10개 케이스, ~50MB)
```

### 코드 예시

**스타터 케이스 로드:**
```typescript
async function loadStarterCase(caseNumber: number): Promise<Case> {
  const infoUrl = await context.assets.getURL(
    `starter-cases/case-${caseNumber.toString().padStart(3, '0')}/info.json`
  );

  const response = await fetch(infoUrl);
  const caseData = await response.json();

  // 이미지 URL들도 assets에서 로드
  caseData.suspects = await Promise.all(
    caseData.suspects.map(async (suspect, i) => ({
      ...suspect,
      profileImageUrl: await context.assets.getURL(
        `starter-cases/case-${caseNumber.toString().padStart(3, '0')}/suspect-${i + 1}.jpg`
      )
    }))
  );

  return caseData;
}
```

---

## 타임라인 및 우선순위

### 즉시 시작 (Day 1-2)

**필수 작업:**
- [ ] devvit.json 권한 추가
- [ ] ImageUploadService 구현
- [ ] /api/case/:caseId/upload-images 엔드포인트 추가
- [ ] useAutoImageUpload 훅 추가
- [ ] 기본 테스트 (1개 이미지)

**목표**: 기본 기능 작동 확인

---

### 단기 (Week 1)

**필수 작업:**
- [ ] 14개 이미지 배치 업로드 테스트
- [ ] 재시도 로직 구현 및 테스트
- [ ] 에러 처리 개선
- [ ] 모바일 테스트 (iOS/Android)

**목표**: 안정적인 프로토타입

---

### 중기 (Week 2-3)

**선택 작업:**
- [ ] 스타터 케이스 5개 생성
- [ ] assets 폴더에 포함
- [ ] 우선순위 로직 (스타터 → 동적)
- [ ] 성능 최적화

**목표**: 사용자 경험 개선

---

### 장기 (Month 1+)

**개선 작업:**
- [ ] Rate limit 최적화
- [ ] 이미지 캐싱 전략
- [ ] 분석 및 모니터링
- [ ] Cloudinary 백업 구현 (필요 시)

**목표**: 프로덕션 안정성

---

## 대안 시나리오

### 시나리오 A: context.media.upload() 실패 시

**문제:**
- API가 예상과 다르게 작동
- 또는 Rate limit이 너무 엄격

**대응:**
```typescript
// Plan B: Base64 Data URI (단기)
if (UPLOAD_FAILED) {
  await storeBase64InRedis(caseId, imageData);
}

// Plan C: Cloudinary (장기)
if (PRODUCTION_READY) {
  await uploadToCloudinary(imageData);
}
```

---

### 시나리오 B: 모바일 호환성 문제

**문제:**
- i.redd.it URL이 모바일에서 작동 안 함

**대응:**
```typescript
// 외부 이미지 호스팅으로 전환
const FALLBACK_CDN = 'https://your-cdn.com';
await uploadToExternalCDN(imageData);
```

---

## 참고 자료

### 공식 문서

- Devvit 공식 문서: https://developers.reddit.com
- Devvit Media API: https://developers.reddit.com/docs/api/redditapi/interfaces/Media
- Devvit Assets 가이드: https://developers.reddit.com/docs/assets

### 예제 코드

- Pixelary 소스 코드: https://github.com/reddit/devvit/tree/main/packages/apps/pixelary
- Blocks Gallery: https://github.com/reddit/devvit/tree/main/packages/apps/blocks-gallery

### 커뮤니티

- r/Devvit: 질문 및 지원
- Devvit Discord: 실시간 도움말

---

## 결론

**최종 권장 방식: 하이브리드 접근**

1. ✅ **context.media.upload() 사용** (주력)
   - Gemini 이미지 → Reddit CDN
   - 동적 케이스 무한 생성

2. ✅ **Assets 폴더** (보조)
   - 5-10개 스타터 케이스
   - 오프라인 지원

**예상 결과:**
- 사용자 경험: 즉시 플레이 가능
- 확장성: 무한
- 앱 크기: ~50MB 고정
- 모바일 호환: 완벽
- 비용: 무료 (예상)

**다음 단계:**
내일 구현 시작 전에 이 문서를 다시 검토하고 우선순위 결정

---

**문서 버전**: 1.0
**최종 수정**: 2025-10-21
**담당**: Claude Code
**상태**: 승인 대기
