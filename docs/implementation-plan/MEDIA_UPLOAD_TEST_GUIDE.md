# Media Upload API Validation Test Guide

## ✅ 구현 완료

context.media.upload() API 검증을 위한 테스트 인프라가 구현되어 배포되었습니다.

**배포 버전**: v0.0.36.450
**배포 URL**: https://www.reddit.com/r/armchair_sleuths_dev/?playtest=armchair-sleuths

---

## 📋 테스트 항목

### Test 1: API 존재 확인
- **목적**: context.media.upload() 함수가 존재하는지 확인
- **예상 시간**: < 1초
- **성공 조건**: context.media.upload이 function으로 존재

### Test 2: 단일 이미지 업로드
- **목적**:
  - Gemini로 이미지 생성
  - context.media.upload()로 Reddit CDN 업로드
  - 반환된 mediaId가 i.redd.it URL인지 확인
- **예상 시간**: ~5-10초
- **성공 조건**:
  - ✅ 이미지 생성 성공
  - ✅ 업로드 성공
  - ✅ mediaId에 i.redd.it 또는 preview.redd.it 포함

### Test 3: 순차 업로드 (5개)
- **목적**: Rate limit 감지
- **예상 시간**: ~25-50초
- **측정 항목**:
  - 각 이미지별 생성 시간
  - 각 이미지별 업로드 시간
  - 시간이 점점 증가하는지 (rate limit 징후)

### Test 4: 병렬 업로드 (5개)
- **목적**: 동시 업로드 제한 확인
- **예상 시간**: ~5-15초 (병렬이므로 빠름)
- **측정 항목**:
  - 병렬 성공률
  - 실패 시 에러 메시지

### Test 5: 전체 규모 (14개)
- **목적**: 실제 케이스 생성 시나리오 검증
- **전략**: 5+5+4 배치로 나누어 업로드 (배치 간 2초 대기)
- **예상 시간**: ~70-140초
- **성공 조건**: 최소 10/14 성공 (70% 이상)

---

## 🚀 테스트 실행 방법

### 방법 1: Reddit 메뉴에서 실행 (권장)

1. **서브레딧 방문**
   https://www.reddit.com/r/armchair_sleuths_dev/?playtest=armchair-sleuths

2. **메뉴 열기**
   - 서브레딧 화면에서 우측 상단 `...` 메뉴 클릭
   - 또는 모바일에서 햄버거 메뉴

3. **테스트 실행**
   - "🧪 Test Media Upload API" 메뉴 선택
   - 모든 테스트가 자동으로 순차 실행됨

4. **결과 확인**
   - 브라우저 개발자 도구 콘솔에서 상세 로그 확인
   - JSON 응답으로 요약 결과 반환

### 방법 2: 개별 테스트 API 호출

```bash
# Test 1: API 존재 확인
GET http://localhost:PORT/api/test/media-check

# Test 2: 단일 업로드
POST http://localhost:PORT/api/test/upload-single

# Test 3: 순차 5개
POST http://localhost:PORT/api/test/upload-sequential?count=5

# Test 4: 병렬 5개
POST http://localhost:PORT/api/test/upload-parallel?count=5

# Test 5: 전체 14개
POST http://localhost:PORT/api/test/upload-full

# 전체 실행
POST http://localhost:PORT/api/test/run-all
```

**주의**: 개별 API는 Devvit 서버 내에서만 접근 가능합니다.

---

## 📊 예상 결과 형식

### 성공 시:
```json
{
  "status": "success",
  "message": "Tests complete: 5/5 passed",
  "results": [
    {
      "testName": "API Availability",
      "duration": 2,
      "success": true,
      "details": { ... }
    },
    {
      "testName": "Single Upload",
      "duration": 8543,
      "success": true,
      "details": {
        "geminiGenerationTime": 6234,
        "uploadTime": 2309,
        "mediaId": "https://i.redd.it/...",
        "isRedditCDN": true
      }
    },
    ...
  ],
  "summary": {
    "totalTests": 5,
    "passed": 5,
    "failed": 0,
    "totalDuration": 125432
  }
}
```

### 실패 시:
```json
{
  "status": "partial_success",
  "message": "Tests complete: 3/5 passed",
  "results": [ ... ],
  "summary": {
    "totalTests": 5,
    "passed": 3,
    "failed": 2,
    "totalDuration": 45231
  }
}
```

---

## 🔍 확인할 제약사항

### ✅ 확인 완료 (테스트로 검증 예정)
- [ ] API 존재 여부
- [ ] 단일 업로드 성공 여부
- [ ] i.redd.it URL 반환 확인
- [ ] Gemini → Reddit CDN 변환 작동

### ⚠️ 검증 필요 (테스트로 측정 예정)
- [ ] **Rate Limit (분당/시간당 업로드 횟수)**
  - Test 3에서 순차 업로드 시간 증가 패턴으로 감지

- [ ] **동시 업로드 제한**
  - Test 4에서 병렬 업로드 성공률로 확인

- [ ] **파일 크기 제한**
  - Gemini 이미지는 보통 500KB~2MB
  - 실패 시 에러 메시지로 확인

- [ ] **전체 규모 성능**
  - Test 5에서 14개 이미지 업로드 시간 및 성공률

---

## 🎯 다음 단계

### 테스트 성공 시:
1. ✅ context.media.upload() 사용 확정
2. 📋 제약사항 문서화 (rate limit, file size 등)
3. 🔧 실제 케이스 생성 로직 수정:
   - `CaseGeneratorService.ts`: Gemini URL → context.media.upload() 변환
   - `LocationImageGeneratorService.ts`: 동일
   - `EvidenceImageGeneratorService.ts`: 동일
4. 🧹 skeleton loader 유지 (이미지 로딩 중 표시용)
5. 🗑️ 테스트 코드 제거 (`MediaUploadTest.ts`, 테스트 라우트)

### 테스트 실패 시:
1. ❌ 실패 원인 분석 (에러 로그 확인)
2. 🔄 대안 탐색:
   - Option A: Starter cases만 사용 (assets/ 폴더)
   - Option B: 외부 이미지 호스팅 (Vercel Image Function 확장)
   - Option C: Base64 인코딩 (용량 주의)

---

## 🛠️ 구현 파일 목록

### 새로 생성된 파일:
1. **`src/server/test/MediaUploadTest.ts`** (608 lines)
   - 5가지 테스트 구현
   - 메트릭 수집 및 분석

2. **`devvit.json.backup`**
   - 원본 설정 백업

3. **`docs/implementation-plan/MEDIA_UPLOAD_TEST_GUIDE.md`** (이 파일)
   - 테스트 실행 가이드

### 수정된 파일:
1. **`devvit.json`**
   - `permissions.media: true` 추가
   - 테스트 메뉴 아이템 추가

2. **`src/server/index.ts`**
   - `/internal/menu/test-media-upload` 핸들러 추가 (L217-272)
   - 6개 테스트 API 라우트 추가 (L1724-1892)

---

## 📞 문제 발생 시

### 빌드 에러:
```bash
cd C:\Users\hpcra\armchair-sleuths
npm run build
npm run dev:server
```

### 배포 에러:
```bash
npx devvit playtest armchair_sleuths_dev
```

### 테스트 실행 안 됨:
1. 브라우저 콘솔 확인 (F12)
2. Devvit 로그 확인:
   ```bash
   npx devvit logs --app=armchair-sleuths
   ```

---

## ✅ 완료 체크리스트

- [x] devvit.json에 media permission 추가
- [x] MediaUploadTest.ts 구현
- [x] 테스트 라우트 6개 추가
- [x] 메뉴 아이템 추가
- [x] 메뉴 핸들러 구현
- [x] 빌드 및 배포 (v0.0.36.450)
- [x] 사용 안내서 작성
- [ ] **실제 테스트 실행** ← 다음 단계
- [ ] 결과 분석 및 보고서 작성
