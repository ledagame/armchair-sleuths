# Magic MCP 마이그레이션 아키텍처 설계

**작성일**: 2025-10-27
**작성자**: Frontend Architect Agent
**목적**: Armchair Sleuths WebView를 Magic MCP 기반으로 완전히 재구축하기 위한 아키텍처 설계

---

## 📐 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      Devvit App (main.tsx)                   │
│                   Minimal Wrapper + Router                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                WebView (React 19 + Magic MCP)                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Magic MCP Components                    │    │
│  │  • skeleton.tsx  • card.tsx   • button.tsx         │    │
│  │  • chat.tsx      • form.tsx   • modal.tsx          │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Game Screens                           │    │
│  │  • CinematicIntro.tsx                              │    │
│  │  • SuspectInterrogation.tsx                        │    │
│  │  • EvidenceAnalysis.tsx                            │    │
│  │  • SubmissionForm.tsx                              │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Express Server (src/server/)                    │
│  • Case generation endpoints                                │
│  • Suspect dialogue (Gemini API)                            │
│  • State management                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Redis KV Store                            │
│  • Game state persistence                                   │
│  • Player progress tracking                                 │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│  • Gemini API (suspect AI)                                  │
│  • Vercel Image Function (case images)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ 파일 구조

```
armchair-sleuths/
├── src/
│   ├── main.tsx                          # Minimal Devvit wrapper
│   │
│   ├── client/                           # WebView (React + Magic MCP)
│   │   ├── index.html                    # Entry point
│   │   ├── main.tsx                      # React root
│   │   │
│   │   ├── components/
│   │   │   ├── magic/                    # Magic MCP 생성 컴포넌트
│   │   │   │   ├── skeleton.tsx          # 로딩 스켈레톤
│   │   │   │   ├── card.tsx              # Noir 스타일 카드
│   │   │   │   ├── button.tsx            # Primary/Secondary 버튼
│   │   │   │   ├── chat.tsx              # 대화형 채팅 인터페이스
│   │   │   │   ├── form.tsx              # 폼 컴포넌트
│   │   │   │   ├── modal.tsx             # 모달 다이얼로그
│   │   │   │   ├── badge.tsx             # 상태 뱃지
│   │   │   │   └── progress.tsx          # 진행률 바
│   │   │   │
│   │   │   ├── game/                     # 게임 화면 컴포넌트
│   │   │   │   ├── LoadingScreen.tsx     # 케이스 로딩
│   │   │   │   ├── CinematicIntro.tsx    # 시네마틱 인트로
│   │   │   │   ├── CaseOverview.tsx      # 사건 개요
│   │   │   │   ├── InvestigationScreen.tsx  # 수사 메인
│   │   │   │   ├── LocationExplorer.tsx  # 장소 탐색
│   │   │   │   ├── SuspectInterrogation.tsx  # 용의자 심문
│   │   │   │   ├── EvidenceAnalysis.tsx  # 증거 분석
│   │   │   │   ├── SubmissionForm.tsx    # 추리 제출
│   │   │   │   └── ResultsView.tsx       # 결과 화면
│   │   │   │
│   │   │   └── layout/
│   │   │       ├── Header.tsx            # 앱 헤더
│   │   │       ├── Navigation.tsx        # 네비게이션
│   │   │       └── Footer.tsx            # 앱 푸터
│   │   │
│   │   ├── hooks/
│   │   │   ├── useDevvitContext.ts       # Devvit 통신 훅
│   │   │   ├── useGameState.ts           # 게임 상태 관리
│   │   │   ├── useAnimation.ts           # Framer Motion 헬퍼
│   │   │   └── useResponsive.ts          # 반응형 디자인
│   │   │
│   │   ├── utils/
│   │   │   ├── api.ts                    # API 클라이언트
│   │   │   ├── types.ts                  # TypeScript 타입
│   │   │   └── constants.ts              # 상수 정의
│   │   │
│   │   └── styles/
│   │       ├── globals.css               # 글로벌 스타일
│   │       └── tailwind.config.ts        # Tailwind 설정
│   │
│   └── server/                           # Express Server (기존 유지)
│       ├── index.ts
│       └── routes/
│
├── devvit.json                           # Devvit 설정 (WebView 활성화됨)
├── package.json
├── vite.config.ts                        # Vite 설정 (아래 참조)
└── tailwind.config.ts                    # Tailwind 설정 (아래 참조)
```

---

## 🎨 화면별 Magic MCP 컴포넌트 매핑

### 1. LoadingScreen (로딩 화면)
**Magic MCP 컴포넌트:**
- `<Skeleton />` - 케이스 로딩 애니메이션
- `<Card />` - 로딩 메시지 컨테이너
- `<Progress />` - 진행률 바

**디자인 요구사항:**
- Noir 테마 배경 (deepBlack #0a0a0a)
- Gold 색상 스켈레톤 애니메이션
- 부드러운 페이드인 효과

### 2. CinematicIntro (시네마틱 인트로)
**Magic MCP 컴포넌트:**
- `<Card />` - 메인 인트로 컨테이너
- `<Button />` - "수사 시작" 버튼
- `<Modal />` - 튜토리얼 오버레이 (선택적)

**디자인 요구사항:**
- 풀스크린 시네마틱 레이아웃
- 타이핑 효과로 텍스트 애니메이션
- Framer Motion 페이지 전환

### 3. CaseOverview (사건 개요)
**Magic MCP 컴포넌트:**
- `<Card />` - 피해자/무기/장소 정보 카드
- `<Badge />` - 날짜, 시간 뱃지
- `<Button />` - "수사 시작" CTA

**디자인 요구사항:**
- 3열 그리드 레이아웃 (반응형)
- 카드 호버 효과
- 정보 계층 구조 명확화

### 4. InvestigationScreen (수사 화면)
**Magic MCP 컴포넌트:**
- `<Card />` - 탭 컨테이너
- `<Button />` - 탭 네비게이션 (장소/용의자/증거)
- `<Badge />` - 진행 상태 표시

**디자인 요구사항:**
- 탭 기반 네비게이션
- 선택된 탭 강조 (gold underline)
- 스와이프 제스처 지원 (모바일)

### 5. LocationExplorer (장소 탐색)
**Magic MCP 컴포넌트:**
- `<Card />` - 장소 상세 정보
- `<Button />` - "증거 발견" 인터랙션
- `<Modal />` - 증거 발견 팝업

**디자인 요구사항:**
- 이미지 갤러리 레이아웃
- 클릭 가능한 증거 핫스팟
- 발견 애니메이션 (Framer Motion)

### 6. SuspectInterrogation (용의자 심문)
**Magic MCP 컴포넌트:**
- `<Chat />` - 대화형 채팅 인터페이스
- `<Card />` - 용의자 프로필 카드
- `<Badge />` - 감정 상태 표시

**디자인 요구사항:**
- 실시간 채팅 UI
- 타이핑 인디케이터
- 감정 상태 시각화 (색상 변화)

### 7. EvidenceAnalysis (증거 분석)
**Magic MCP 컴포넌트:**
- `<Card />` - 증거 아이템 카드
- `<Modal />` - 증거 상세 뷰
- `<Badge />` - 증거 타입 분류

**디자인 요구사항:**
- 그리드 레이아웃
- 필터링/정렬 기능
- 확대 이미지 뷰

### 8. SubmissionForm (추리 제출)
**Magic MCP 컴포넌트:**
- `<Form />` - 범인/동기/증거 선택 폼
- `<Button />` - "제출하기" CTA
- `<Modal />` - 확인 다이얼로그

**디자인 요구사항:**
- 3단계 폼 (범인 → 동기 → 증거)
- 유효성 검사 및 에러 메시지
- 제출 전 확인 단계

### 9. ResultsView (결과 화면)
**Magic MCP 컴포넌트:**
- `<Card />` - 정답/오답 결과 카드
- `<Button />` - "공유하기", "다시 도전" 버튼
- `<Progress />` - 점수 애니메이션

**디자인 요구사항:**
- 성공/실패 애니메이션
- 상세 해설 섹션
- 소셜 공유 기능

---

## ⚙️ Vite 설정

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          // Framer Motion 최적화
          ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }]
        ]
      }
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client'),
      '@magic': path.resolve(__dirname, './src/client/components/magic'),
      '@game': path.resolve(__dirname, './src/client/components/game'),
      '@hooks': path.resolve(__dirname, './src/client/hooks'),
      '@utils': path.resolve(__dirname, './src/client/utils'),
    },
  },

  build: {
    outDir: 'dist/client',
    sourcemap: false,  // 프로덕션에서 소스맵 제거
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // console.log 제거
        drop_debugger: true,
      },
    },

    // 코드 스플리팅 전략 (Devvit 5MB 제한 준수)
    rollupOptions: {
      output: {
        manualChunks: {
          // Magic MCP 컴포넌트 청크
          'magic-ui': [
            './src/client/components/magic/card.tsx',
            './src/client/components/magic/button.tsx',
            './src/client/components/magic/form.tsx',
            './src/client/components/magic/modal.tsx',
          ],

          // 게임 화면 청크
          'game-screens': [
            './src/client/components/game/CinematicIntro.tsx',
            './src/client/components/game/SuspectInterrogation.tsx',
            './src/client/components/game/EvidenceAnalysis.tsx',
          ],

          // 애니메이션 라이브러리
          'motion': ['framer-motion'],

          // React 벤더
          'vendor': ['react', 'react-dom'],
        },
      },
    },

    // 청크 크기 경고 임계값
    chunkSizeWarningLimit: 1000,  // 1MB
  },

  // 개발 서버 설정
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: true,
    },
  },

  // 최적화 설정
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
  },
});
```

---

## 🎨 Tailwind CSS 설정

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/client/**/*.{js,jsx,ts,tsx}',
    './src/client/index.html',
  ],

  theme: {
    extend: {
      // Noir Detective 테마 색상
      colors: {
        noir: {
          'deep-black': '#0a0a0a',
          'charcoal': '#1a1a1a',
          'dark-gray': '#2a2a2a',
          'light-gray': '#e5e5e5',
        },
        detective: {
          'gold': '#c9b037',
          'burnished': '#a89030',
          'faded': '#8a7525',
        },
        functional: {
          'danger': '#c93737',
          'success': '#37c97d',
          'warning': '#c9a037',
          'info': '#3777c9',
        },
      },

      // 타이포그래피
      fontFamily: {
        'display': ['Playfair Display', 'serif'],  // 헤드라인
        'body': ['Inter', 'sans-serif'],            // 본문
        'mono': ['Courier New', 'monospace'],       // 코드
      },

      // 간격 시스템
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },

      // 애니메이션
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms'),        // 폼 스타일링
    require('@tailwindcss/typography'),    // 타이포그래피
    require('@tailwindcss/aspect-ratio'),  // 이미지 비율
  ],
} satisfies Config;
```

---

## 🚀 6단계 마이그레이션 로드맵

### Phase 1: 기반 구축 (1주차)
**우선순위: 최고**

- [ ] **Step 1.1**: Vite + React 프로젝트 셋업
  - `src/client/` 디렉토리 생성
  - Vite 설정 파일 작성
  - Tailwind CSS 4.1 설치 및 Noir 테마 설정
  - **검증**: `npm run build:client` 성공

- [ ] **Step 1.2**: Magic MCP 기본 컴포넌트 생성
  - `components/magic/skeleton.tsx`
  - `components/magic/card.tsx`
  - `components/magic/button.tsx`
  - **검증**: Storybook 또는 테스트 페이지에서 렌더링 확인

- [ ] **Step 1.3**: Devvit ↔ WebView 통신 검증
  - `useDevvitContext.ts` 훅 구현
  - 간단한 데이터 전송 테스트
  - **검증**: Devvit에서 WebView로 데이터 전달 확인

### Phase 2: 핵심 화면 구현 (2주차)
**우선순위: 높음**

- [ ] **Step 2.1**: LoadingScreen (Magic MCP Skeleton)
  - 스켈레톤 애니메이션
  - 로딩 상태 관리
  - **검증**: 케이스 데이터 로딩 시 부드러운 애니메이션

- [ ] **Step 2.2**: CinematicIntro (Magic MCP Card + Button)
  - 풀스크린 시네마틱 레이아웃
  - 타이핑 효과 애니메이션
  - Framer Motion 페이지 전환
  - **검증**: 인트로 → 사건 개요 전환 자연스러움

- [ ] **Step 2.3**: CaseOverview (Magic MCP Card)
  - 피해자/무기/장소 카드 레이아웃
  - 반응형 그리드 시스템
  - **검증**: 모바일/데스크톱 모두 정상 표시

- [ ] **Step 2.4**: InvestigationScreen 탭 네비게이션
  - 장소/용의자/증거 탭
  - 선택된 탭 강조 효과
  - **검증**: 탭 전환 애니메이션 부드러움

### Phase 3: 인터랙션 화면 구현 (3주차)
**우선순위: 높음**

- [ ] **Step 3.1**: LocationExplorer (Magic MCP Card + Modal)
  - 장소 이미지 갤러리
  - 증거 발견 인터랙션
  - 모달 팝업 애니메이션
  - **검증**: 증거 발견 시 만족스러운 피드백

- [ ] **Step 3.2**: SuspectInterrogation (Magic MCP Chat)
  - 실시간 채팅 UI
  - 타이핑 인디케이터
  - 감정 상태 시각화
  - Gemini API 통합
  - **검증**: 대화 흐름 자연스럽고 몰입감 있음

- [ ] **Step 3.3**: EvidenceAnalysis (Magic MCP Card)
  - 증거 그리드 레이아웃
  - 필터링/정렬 기능
  - 상세 모달 뷰
  - **검증**: 증거 탐색이 직관적

### Phase 4: 제출 및 결과 (4주차)
**우선순위: 중간**

- [ ] **Step 4.1**: SubmissionForm (Magic MCP Form)
  - 범인/동기/증거 선택 폼
  - 유효성 검사
  - 확인 다이얼로그
  - **검증**: 제출 프로세스가 명확하고 오류 없음

- [ ] **Step 4.2**: ResultsView (Magic MCP Card + Progress)
  - 성공/실패 애니메이션
  - 점수 및 상세 해설
  - 소셜 공유 버튼
  - **검증**: 결과 피드백이 만족스러움

### Phase 5: 최적화 및 폴리싱 (5주차)
**우선순위: 중간**

- [ ] **Step 5.1**: 성능 최적화
  - 코드 스플리팅 검증
  - 번들 크기 5MB 이하 확인
  - Lighthouse 점수 측정
  - **목표**: FCP < 1.5s, LCP < 2.5s, TTI < 3.0s

- [ ] **Step 5.2**: 접근성 개선
  - 키보드 네비게이션
  - 스크린 리더 테스트
  - WCAG 2.1 AA 준수
  - **검증**: axe DevTools 0 에러

- [ ] **Step 5.3**: 애니메이션 폴리싱
  - 페이지 전환 타이밍 조정
  - 인터랙션 피드백 개선
  - 모션 민감도 옵션 추가
  - **검증**: 사용자 테스트 긍정 피드백 80%+

### Phase 6: 프로덕션 배포 (6주차)
**우선순위: 최고**

- [ ] **Step 6.1**: 프로덕션 빌드 테스트
  - 모든 환경 변수 검증
  - 에러 추적 설정 (Sentry 등)
  - **검증**: 프로덕션 빌드 에러 없음

- [ ] **Step 6.2**: Devvit 플랫폼 배포
  - `devvit upload` 실행
  - Reddit 커뮤니티 테스트 배포
  - **검증**: 실제 Reddit 환경에서 정상 작동

- [ ] **Step 6.3**: 모니터링 및 피드백 수집
  - 사용자 행동 분석 설정
  - 버그 리포트 모니터링
  - **검증**: 24시간 안정적 운영

---

## 📊 성능 목표

### 번들 크기 제한
- **총 번들 크기**: < 5MB (Devvit 제한)
- **초기 로딩 청크**: < 1MB
- **Magic MCP 컴포넌트 청크**: < 500KB
- **게임 화면 청크**: < 800KB
- **벤더 청크 (React + Framer Motion)**: < 400KB

### 로딩 성능 (Lighthouse 기준)
- **First Contentful Paint (FCP)**: < 1.5초
- **Largest Contentful Paint (LCP)**: < 2.5초
- **Time to Interactive (TTI)**: < 3.0초
- **Total Blocking Time (TBT)**: < 300ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### 런타임 성능
- **프레임률**: 60fps 유지
- **애니메이션 지연**: < 16ms
- **API 응답 시간**: < 500ms (p95)
- **채팅 메시지 지연**: < 200ms

---

## ⚠️ 리스크 관리

### 리스크 1: 번들 크기 초과 (5MB 제한)
**발생 확률**: 중간
**영향도**: 높음
**완화 전략**:
- 코드 스플리팅 강제 적용
- Tree shaking 최적화
- 이미지 WebP 포맷 사용
- 불필요한 라이브러리 제거

### 리스크 2: Magic MCP 생성 품질
**발생 확률**: 낮음
**영향도**: 중간
**완화 전략**:
- 명확한 프롬프트 작성
- 생성 후 수동 검토 및 조정
- 디자인 시스템 가이드 제공

### 리스크 3: Devvit WebView 호환성
**발생 확률**: 낮음
**영향도**: 높음
**완화 전략**:
- Phase 1에서 조기 검증
- Devvit 공식 문서 준수
- 커뮤니티 사례 참고

### 리스크 4: 성능 저하
**발생 확률**: 중간
**영향도**: 중간
**완화 전략**:
- 정기적인 Lighthouse 측정
- 프로파일링 도구 사용
- lazy loading 적극 활용

---

## ✅ 검증 체크리스트

### 기술적 검증
- [ ] TypeScript 타입 에러 0개
- [ ] ESLint 경고 0개
- [ ] 프로덕션 빌드 성공
- [ ] 번들 크기 < 5MB
- [ ] Lighthouse 성능 점수 > 90

### UX 검증
- [ ] 모든 화면 반응형 동작
- [ ] 애니메이션 부드러움 (60fps)
- [ ] 접근성 테스트 통과
- [ ] 사용자 테스트 만족도 80%+

### 통합 검증
- [ ] Devvit ↔ WebView 통신 정상
- [ ] Express Server API 연동 정상
- [ ] Gemini API 대화 생성 정상
- [ ] Redis 상태 저장/로드 정상

---

## 📚 참고 자료

- **Magic MCP 문서**: https://21st.dev/docs
- **Devvit 공식 문서**: https://developers.reddit.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React 19**: https://react.dev/

---

**다음 단계**: UX 전략 문서를 검토하고 Phase 1 구현을 시작하세요.
