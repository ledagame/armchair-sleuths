# 🧪 테스트 가이드

Reddit Detective Agency 프로젝트의 Day 4-7 구현 테스트 가이드입니다.

## 📋 사전 준비

### 1. 환경 변수 확인

`.env.local` 파일에 다음 항목이 설정되어 있는지 확인:

```env
# ✅ 이미 설정됨
GEMINI_API_KEY=AIzaSyDULOU9cBW0aGa4yzMigYX-qeZdTyLgUV4

# ⚠️ Vercel 배포 후 추가해야 함
VERCEL_IMAGE_FUNCTION_URL=https://your-project.vercel.app/api/generate-image
```

### 2. 의존성 설치

```bash
npm install
```

---

## 🚀 테스트 단계

### Step 1: Vercel Function 배포 (이미지 생성)

#### 옵션 A: Vercel CLI 사용 (권장)

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
cd vercel
vercel

# 배포 완료 후 URL 복사 (예: https://armchair-sleuths-abc123.vercel.app)
```

#### 옵션 B: Vercel Dashboard 사용

1. https://vercel.com/dashboard 접속
2. "New Project" 클릭
3. GitHub 연동 → `armchair-sleuths` 선택
4. Environment Variables 추가:
   - Key: `GEMINI_API_KEY`
   - Value: `AIzaSyDULOU9cBW0aGa4yzMigYX-qeZdTyLgUV4`
5. Deploy 클릭
6. 배포 완료 후 URL 확인

#### 배포 후 환경 변수 업데이트

`.env.local` 파일에 Vercel URL 추가:

```env
VERCEL_IMAGE_FUNCTION_URL=https://armchair-sleuths-abc123.vercel.app/api/generate-image
```

---

### Step 2: 이미지 생성 테스트

Vercel Function이 정상 작동하는지 확인:

```bash
npx tsx scripts/test-image-generation.ts
```

**예상 출력:**
```
🎨 이미지 생성 테스트 시작

✅ Vercel Function URL: https://...

⏳ 이미지 생성 중...
   프롬프트: A noir-style crime scene photograph...

✅ 이미지 생성 완료! (12.3초 소요)
   캐시 여부: No (새로 생성)
   이미지 URL 길이: 45000 characters
   MIME Type: image/png
   이미지 크기: 약 32.5 KB

🎉 테스트 완료!
```

**문제 해결:**
- ❌ `VERCEL_IMAGE_FUNCTION_URL이 설정되지 않았습니다`
  → `.env.local`에 URL 추가
- ❌ `404 Not Found`
  → Vercel URL이 올바른지 확인
- ❌ `Gemini API error`
  → Vercel Dashboard에서 Environment Variable 확인

---

### Step 3: 빠른 케이스 생성 테스트 (이미지 없이)

```bash
npx tsx scripts/generate-case.ts
```

**예상 출력:**
```
🎲 케이스 생성 중...
   이미지 생성: No (빠른 테스트)
   날짜: 2025-01-10

✅ 케이스 생성 완료! (25.3초 소요)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 케이스 ID: case_20250110
📅 날짜: 2025-01-10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 피해자:
   이름: 박민준
   배경: 성공한 사업가...
   관계: 전 동업자

🔪 무기:
   이름: 독극물
   설명: 치명적인 청산가리...

📍 장소:
   이름: 서재
   설명: 고급 서재...

🕵️ 용의자:
   1. 김서연 ⚠️ [진범]
      원형: Jealous Ex
      배경: 피해자의 전 연인...
      성격: 겉으로는 차갑지만...
      감정 상태: cooperative (의심도: 15)

   2. 이준호
      원형: Greedy Partner
      ...

🎯 정답 (5W1H):
   누가 (Who): 김서연
   무엇을 (What): 독극물 살인
   어디서 (Where): 서재
   언제 (When): 밤 11시
   왜 (Why): 배신과 복수
   어떻게 (How): 와인에 청산가리 혼입

💾 Redis KV 저장 완료

🎉 완료!
```

---

### Step 4: 전체 게임 흐름 테스트

모든 기능을 한 번에 테스트:

```bash
npx tsx scripts/test-game-flow.ts
```

**테스트 항목:**
1. ✅ 케이스 생성
2. ✅ 용의자 조회
3. ✅ AI 대화 (질문 → 응답)
4. ✅ 대화 기록 조회
5. ✅ 답변 제출 및 채점
6. ✅ 리더보드 조회
7. ✅ 통계 조회

**예상 소요 시간:** 약 2-3분

**예상 출력:**
```
🎮 게임 흐름 테스트 시작

1️⃣ 케이스 생성 테스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏳ 케이스 생성 중... (30-60초 소요)
✅ 케이스 생성 완료!
   - ID: case_20250110
   - 용의자 수: 3
   - 진범: 김서연

2️⃣ 용의자 조회 테스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 용의자 3명 조회 완료:
   1. 김서연 (Jealous Ex)
   2. 이준호 (Greedy Partner)
   3. 정수민 (Innocent Bystander)

3️⃣ AI 대화 테스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏳ 김서연에게 질문 중...
   질문: "사건 당일 어디 있었습니까?"
✅ AI 응답 생성 완료!
   응답: "그날 밤에는 집에서 혼자 책을 읽고 있었어요. 혼자만의 시간이 필요했거든요."
   감정 상태: cooperative (의심도: 17)
   대화 횟수: 2

4️⃣ 대화 기록 조회 테스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 대화 기록 2개 조회 완료

5️⃣ 답변 제출 및 채점 테스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   정답: 김서연
⏳ 채점 중... (10-20초 소요)
✅ 채점 완료!
   총점: 67/100
   정답 여부: ❌ 오답
   순위: 1위

   항목별 점수:
   - 범인 (누가): 100/100 ✅
   - 살인방법 (무엇을): 100/100 ✅
   - 장소 (어디서): 5/100 ❌
   - 시간 (언제): 100/100 ✅
   - 동기 (왜): 8/100 ❌
   - 방법 (어떻게): 100/100 ✅

6️⃣ 리더보드 조회 테스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 리더보드 1개 항목 조회 완료:
   1. test-user-001 - 67점

7️⃣ 통계 조회 테스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 통계 조회 완료:
   - 총 제출 수: 1
   - 정답자 수: 0
   - 정답률: 0.0%
   - 평균 점수: 67.0점
   - 최고 점수: 67점

🎉 모든 테스트 완료!
```

---

## 🌐 Devvit 로컬 테스트

### Step 5: Devvit Playtest

실제 Reddit 환경에서 테스트:

```bash
# Devvit CLI 설치 (아직 없다면)
npm install -g devvit

# Playtest 시작
devvit playtest
```

브라우저에서 `http://localhost:3000` 접속

**테스트 항목:**
1. ✅ 클라이언트 UI 렌더링 (CaseOverview, SuspectPanel, ChatInterface)
2. ✅ API 라우트 호출 (GET /api/case/today, POST /api/chat, etc.)
3. ✅ Redis KV 연동
4. ✅ 전체 게임 플레이 흐름

---

## 🔍 개별 컴포넌트 테스트

### AI 대화 테스트

```typescript
// 수동 테스트용
const geminiClient = createGeminiClient();
const suspectAI = createSuspectAIService(geminiClient);

const response = await suspectAI.generateResponse(
  'suspect-001',
  'user-123',
  '사건 당일 어디 있었습니까?'
);

console.log(response);
```

### 채점 테스트

```typescript
const validator = createW4HValidator(geminiClient);
const scoringEngine = createScoringEngine(validator);

const result = await scoringEngine.scoreSubmission(
  'user-123',
  'case-001',
  {
    who: '김서연',
    what: '독극물 살인',
    where: '서재',
    when: '밤 11시',
    why: '배신과 복수',
    how: '와인에 청산가리 혼입'
  },
  correctAnswer
);

console.log(result);
```

---

## 📊 성능 벤치마크

**예상 실행 시간:**

| 작업 | 소요 시간 | 비고 |
|-----|----------|-----|
| 케이스 생성 (이미지 없음) | 20-30초 | 텍스트 생성만 |
| 케이스 생성 (이미지 포함) | 40-60초 | Vercel Function 호출 포함 |
| AI 대화 생성 | 2-5초 | 단일 응답 |
| 5W1H 채점 (6개 항목) | 10-20초 | 병렬 검증 |
| 전체 게임 흐름 | 2-3분 | 모든 기능 포함 |

---

## ❌ 문제 해결

### 이미지 생성 실패

**증상:** `VERCEL_IMAGE_FUNCTION_URL is not configured`

**해결:**
```bash
# .env.local에 추가
VERCEL_IMAGE_FUNCTION_URL=https://your-project.vercel.app/api/generate-image
```

### Gemini API 에러

**증상:** `Gemini API error (401): Unauthorized`

**해결:**
1. API 키 확인: https://aistudio.google.com/app/apikey
2. `.env.local`에 올바른 키 설정
3. Vercel Environment Variables에도 설정 (이미지 생성용)

### Redis KV 연결 실패

**증상:** `Redis connection error`

**해결:**
1. Devvit 환경에서만 Redis KV 사용 가능
2. `devvit playtest` 또는 배포 후 테스트
3. 로컬 테스트는 mock 데이터 사용 권장

### TypeScript 컴파일 에러

**증상:** `npm run build` 실패

**해결:**
```bash
# 타입 체크
npx tsc --noEmit

# 빌드
npm run build
```

---

## 🚀 프로덕션 배포

### Reddit 앱으로 배포

```bash
# Devvit 로그인
devvit login

# 배포
npm run deploy

# 또는
devvit publish
```

배포 후:
1. Reddit 서브레딧에서 앱 설치
2. 게시물 생성
3. 실제 사용자 테스트

---

## 📝 체크리스트

배포 전 최종 확인:

- [ ] `.env.local` 환경 변수 설정 완료
- [ ] Vercel Function 배포 완료
- [ ] `npm run build` 성공
- [ ] `npx tsx scripts/test-image-generation.ts` 성공
- [ ] `npx tsx scripts/generate-case.ts` 성공
- [ ] `npx tsx scripts/test-game-flow.ts` 성공
- [ ] `devvit playtest` 정상 작동
- [ ] 클라이언트 UI 렌더링 확인
- [ ] AI 대화 응답 품질 확인
- [ ] 채점 정확도 확인

---

## 📚 추가 리소스

- **아키텍처 문서**: `doc.md/최종아키텍처-확정.md`
- **Gemini API**: https://ai.google.dev/docs
- **Devvit Docs**: https://developers.reddit.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

**작성일**: 2025-01-10
**프로젝트**: Reddit Detective Agency
**구현 단계**: Day 4-7 완료
