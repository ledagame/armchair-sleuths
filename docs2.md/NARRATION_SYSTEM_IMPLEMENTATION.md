# 나레이션 시스템 구현 계획서 (Narration System Implementation Plan)

**프로젝트**: AI Murder Mystery Game (Chatbot3)
**작성일**: 2025-10-09
**버전**: v1.0
**상태**: Implementation Plan

---

## 📋 Executive Summary

### 현재 문제점
- **분위기 부족**: 게임이 기능적이지만 몰입감이 떨어짐
- **도입부 없음**: 케이스가 생성되자마자 바로 조사 시작
- **결말 부족**: 범인 지목 시 단순 정답/오답 표시만 제공
- **장면 전환 부재**: 위치 이동 시 분위기 있는 묘사 없음
- **순수 대화만**: 대기 분위기, 시간 경과 등의 서술적 요소 없음

### 솔루션 개요
**v0 (MVP)** - 필수 몰입 요소:
1. **Intro Narration**: 케이스 시작 시 200-400단어 분위기 설정
2. **Ending Narration**: 범인 지목 시 4단계 극적 결말 연출
3. **Streaming Display**: 점진적 텍스트 표시로 극적 효과

**v1 (Enhancement)** - 추가 몰입 요소:
4. **Scene Transitions**: 위치 이동 시 50-100단어 설명
5. **Atmospheric Interjections**: 상황별 분위기 멘트

### 핵심 지표
- **생성 시간**: 기존 케이스 생성에 <5초 추가 (총 <35초)
- **토큰 사용**: 케이스당 <500 추가 토큰
- **사용자 경험**: 스킵 가능, 모바일 최적화, 스트리밍 효과
- **개발 시간**: v0 구현 예상 8-12시간

---

## 🏗️ System Architecture

### 데이터 흐름 다이어그램

```
[케이스 생성 요청]
    ↓
[Gemini API - 게임 데이터 생성]
    ↓
[Gemini API - Intro Narration 생성] ← 새로운 단계
    ↓
[Imagen API - 이미지 생성 (병렬)]
    ↓
[Complete Game Data + Intro → Client]
    ↓
[Intro Narration Stream Display]
    ↓
[게임 플레이]
    ↓
[범인 지목]
    ↓
[Gemini API - Ending Narration 생성] ← 새로운 단계
    ↓
[Ending Narration Stream Display]
    ↓
[결과 화면]
```

### 컴포넌트 구조

```
src/
├── lib/
│   └── murder-mystery/
│       ├── types.ts (업데이트)
│       └── narration/
│           ├── prompts.ts          # 프롬프트 템플릿
│           ├── streaming.ts        # 스트리밍 유틸리티
│           └── storage.ts          # localStorage 관리
├── app/
│   ├── api/
│   │   └── murder-mystery/
│   │       ├── generate/
│   │       │   └── route.ts        # Intro narration 추가
│   │       └── narration/
│   │           └── ending/
│   │               └── route.ts    # 새로운 엔드포인트
│   └── test/
│       ├── page.tsx                # 상태 관리 업데이트
│       └── components/
│           ├── IntroNarration.tsx  # 새로운 컴포넌트
│           ├── EndingNarration.tsx # 새로운 컴포넌트
│           └── NarrationStream.tsx # 공통 스트리밍 UI
```

---

## 📊 Data Model Changes

### TypeScript 인터페이스 업데이트

```typescript
// src/lib/murder-mystery/types.ts

// 기존 GeneratedGame 인터페이스 확장
export interface GeneratedGame {
  victim: string;
  culprit: string;
  motive: string;
  means: string;
  opportunity: string;
  suspects: SuspectDetail[];
  evidence: Evidence[];
  locations: Location[];

  // 새로운 필드
  introNarration?: string;        // 케이스 도입 나레이션
  generatedAt?: number;           // 생성 시간 (캐싱용)
}

// 새로운 인터페이스: 엔딩 나레이션
export interface EndingNarration {
  gathering: string;              // 1단계: 용의자 소집 장면
  deduction: string[];            // 2단계: 단계별 추리 과정 (배열)
  reveal: string;                 // 3단계: 범인 공개 순간
  epilogue: string;               // 4단계: 사후 정리
}

// 게임 결과 인터페이스 확장
export interface GameResult {
  correct: boolean;
  accusedSuspect: string;
  actualCulprit: string;
  endingNarration?: EndingNarration;  // 엔딩 나레이션
}

// 나레이션 스트리밍 상태
export interface NarrationStreamState {
  isStreaming: boolean;
  currentText: string;
  currentSection: 'gathering' | 'deduction' | 'reveal' | 'epilogue' | null;
  currentDeductionStep: number;
}

// 나레이션 설정 (사용자 선호도)
export interface NarrationPreferences {
  skipIntro: boolean;             // 도입 나레이션 건너뛰기
  skipEnding: boolean;            // 엔딩 나레이션 건너뛰기
  streamingSpeed: 'slow' | 'normal' | 'fast';  // 스트리밍 속도
  autoAdvance: boolean;           // 자동 진행 여부
}
```

### localStorage 스키마 (v0)

```typescript
// 저장 구조
interface StoredGameData {
  gameData: GeneratedGame;        // introNarration 포함
  gameState: GameState;
  preferences?: NarrationPreferences;
}

// 캐싱 키
const STORAGE_KEYS = {
  GAMES: 'mystery_games',          // 기존
  PREFERENCES: 'narration_prefs',  // 새로운
  INTRO_SEEN: 'intro_seen_',       // 'intro_seen_[gameId]'
};
```

### Supabase 스키마 (v1 - 나중에 마이그레이션)

```sql
-- v0에서는 사용하지 않음, v1 마이그레이션 준비용

-- cases 테이블에 컬럼 추가
ALTER TABLE cases
ADD COLUMN intro_narration TEXT,
ADD COLUMN generated_at TIMESTAMP DEFAULT NOW();

-- 엔딩 나레이션 저장 (완료된 게임)
CREATE TABLE game_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL,
  player_accused TEXT NOT NULL,
  was_correct BOOLEAN NOT NULL,
  ending_narration JSONB NOT NULL,  -- EndingNarration 구조
  completed_at TIMESTAMP DEFAULT NOW()
);

-- 나레이션 선호도 저장
CREATE TABLE narration_preferences (
  user_id UUID PRIMARY KEY,
  skip_intro BOOLEAN DEFAULT FALSE,
  skip_ending BOOLEAN DEFAULT FALSE,
  streaming_speed TEXT DEFAULT 'normal',
  auto_advance BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎬 Intro Narration Implementation

### 1. 생성 전략

**시점**: 케이스 생성 중 (게임 데이터 생성 직후, 이미지 생성과 병렬)

**장점**:
- ✅ 케이스 내용과 완벽한 일치
- ✅ 플레이 시작 시 즉시 표시 가능
- ✅ 캐싱 가능 (재시작 시 재생성 불필요)

**단점**:
- ❌ 케이스 생성 시간 약간 증가 (3-5초)
- ❌ 토큰 사용 증가 (약 200-300 토큰)

**대안**: 온디맨드 생성
- 케이스 생성 후 플레이 시작 직전에 생성
- 케이스 생성은 빠르지만 플레이 시작 지연 발생
- **선택**: 사전 생성 방식 채택 (더 나은 UX)

### 2. Gemini 프롬프트 템플릿

```typescript
// src/lib/murder-mystery/narration/prompts.ts

export const generateIntroPrompt = (gameData: GeneratedGame, background: string) => `
당신은 탐정 소설 작가입니다. 다음 살인 미스터리 케이스의 도입 나레이션을 작성해주세요.

**케이스 정보:**
- 배경: ${background}
- 피해자: ${gameData.victim}
- 사건 발생 장소: ${gameData.locations[0].name}
- 용의자 수: ${gameData.suspects.length}명

**나레이션 요구사항:**
1. 길이: 200-400단어
2. 구조:
   - 1단락: 분위기 설정 (시간, 날씨, 장소의 첫인상)
   - 2단락: 사건 발견 (피해자 발견 순간, 충격적인 장면)
   - 3단락: 긴장감 조성 (미스터리한 디테일, 불안한 요소)
   - 4단락: 플레이어 소개 (탐정으로서의 역할, "이제 당신 차례입니다")
3. 톤: 미스터리하고 긴장감 넘치지만 과도하게 무섭지 않음
4. 스포일러 금지: 범인이나 결정적 단서 언급 금지
5. 언어: 한국어, 문학적이고 몰입감 있는 문체

**출력 형식:**
순수 나레이션 텍스트만 반환하세요. JSON이나 다른 포맷 없이 텍스트만 출력하세요.
`;
```

### 3. API 통합 (generate/route.ts 업데이트)

```typescript
// src/app/api/murder-mystery/generate/route.ts

export async function POST(request: NextRequest) {
  try {
    const input: GameInput = await request.json();

    // Step 1: 게임 데이터 생성 (기존 코드)
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: textPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: gameSchema,
      },
    });

    const rawData = JSON.parse(textResponse.text);

    // Step 2: Intro Narration 생성 (새로운 코드)
    const introPrompt = generateIntroPrompt(rawData, input.background);
    const introResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: introPrompt,
    });

    const introNarration = introResponse.text.trim();

    // Step 3: 이미지 생성 (기존 코드, 병렬 처리)
    const imageResults = await Promise.all(imageGenerationPromises);

    // Step 4: 최종 게임 객체 (introNarration 포함)
    const generatedGame: GeneratedGame = {
      ...rawData,
      introNarration,
      generatedAt: Date.now(),
      suspects: rawData.suspects.map((s: SuspectDetail) =>
        ({ ...s, imageUrl: imageUrlMap[s.name] })
      ),
      locations: rawData.locations.map((loc: any) => ({
        ...loc,
        imageUrl: imageUrlMap[loc.id],
        evidence: rawData.evidence.find((e: Evidence) => e.id === loc.evidenceId) || null,
        investigated: false,
      })),
      evidence: rawData.evidence.map((e: Evidence) =>
        ({ ...e, imageUrl: imageUrlMap[e.id] })
      ),
    };

    return NextResponse.json(generatedGame);
  } catch (error) {
    console.error("Error generating game:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "게임 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
```

### 4. Frontend 컴포넌트

#### NarrationStream.tsx (공통 스트리밍 UI)

```typescript
// src/app/test/components/NarrationStream.tsx

'use client';

import React, { useState, useEffect } from 'react';

interface NarrationStreamProps {
  text: string;
  speed?: 'slow' | 'normal' | 'fast';
  onComplete?: () => void;
  onSkip?: () => void;
  showSkipButton?: boolean;
}

const SPEEDS = {
  slow: 50,    // 50ms per character
  normal: 30,  // 30ms per character
  fast: 15,    // 15ms per character
};

export default function NarrationStream({
  text,
  speed = 'normal',
  onComplete,
  onSkip,
  showSkipButton = true,
}: NarrationStreamProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
        onComplete?.();
      }
    }, SPEEDS[speed]);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  const handleSkip = () => {
    setDisplayedText(text);
    setIsComplete(true);
    onSkip?.();
  };

  return (
    <div className="relative">
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
          {displayedText}
          {!isComplete && (
            <span className="animate-pulse text-blue-400">▌</span>
          )}
        </p>
      </div>

      {showSkipButton && !isComplete && (
        <button
          onClick={handleSkip}
          className="absolute bottom-4 right-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
        >
          건너뛰기 →
        </button>
      )}
    </div>
  );
}
```

#### IntroNarration.tsx (도입 나레이션 컴포넌트)

```typescript
// src/app/test/components/IntroNarration.tsx

'use client';

import React, { useState, useEffect } from 'react';
import NarrationStream from './NarrationStream';

interface IntroNarrationProps {
  narration: string;
  gameId: string;
  onComplete: () => void;
}

const INTRO_SEEN_KEY = 'intro_seen_';

export default function IntroNarration({
  narration,
  gameId,
  onComplete,
}: IntroNarrationProps) {
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    // 이미 본 적 있는지 확인 (재시작 시 스킵)
    const seen = localStorage.getItem(INTRO_SEEN_KEY + gameId);
    if (seen === 'true') {
      onComplete();
      setShouldShow(false);
    }
  }, [gameId, onComplete]);

  const handleComplete = () => {
    localStorage.setItem(INTRO_SEEN_KEY + gameId, 'true');
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(INTRO_SEEN_KEY + gameId, 'true');
    onComplete();
  };

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-3xl w-full bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-10">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">
            🔍 사건 발생
          </h2>
          <div className="h-1 w-20 bg-yellow-400 rounded"></div>
        </div>

        <NarrationStream
          text={narration}
          speed="normal"
          onComplete={handleComplete}
          onSkip={handleSkip}
          showSkipButton={true}
        />
      </div>
    </div>
  );
}
```

### 5. 페이지 통합 (page.tsx 업데이트)

```typescript
// src/app/test/page.tsx

type GamePhase = 'setup' | 'loading' | 'intro' | 'playing' | 'result';  // 'intro' 추가

const MurderMysteryTestPage: React.FC = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  // ... 기존 상태

  const handleGameSetup = useCallback(async (input: GameInput) => {
    setGamePhase('loading');
    setError(null);
    try {
      const response = await fetch('/api/murder-mystery/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate game');
      }

      const data: GeneratedGame = await response.json();
      const newGameState: GameState = {
        discoveredEvidence: [],
        investigatedLocations: [],
        unlockedLocations: [],
        conversations: {},
        startTime: Date.now(),
      };
      const gameId = String(newGameState.startTime);
      setGameData(data);
      setGameState(newGameState);
      setCurrentGameId(gameId);
      saveGameState(gameId, data, newGameState);

      // Intro 나레이션이 있으면 intro 페이즈로, 없으면 바로 playing
      if (data.introNarration) {
        setGamePhase('intro');
      } else {
        setGamePhase('playing');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setGamePhase('setup');
    }
  }, []);

  const handleIntroComplete = useCallback(() => {
    setGamePhase('playing');
  }, []);

  const renderContent = () => {
    switch (gamePhase) {
      case 'setup':
        return <GameSetup
          onSetupSubmit={handleGameSetup}
          error={error}
          savedGames={savedGames}
          onLoadGame={handleLoadGame}
          onDeleteGame={handleDeleteGame}
        />;
      case 'loading':
        return <LoadingScreen />;
      case 'intro':
        if (gameData && gameState && currentGameId && gameData.introNarration) {
          return <IntroNarration
            narration={gameData.introNarration}
            gameId={currentGameId}
            onComplete={handleIntroComplete}
          />;
        }
        return null;
      case 'playing':
        if (gameData && gameState) {
          return <GamePlay
            gameData={gameData}
            gameState={gameState}
            onInvestigate={handleInvestigate}
            onSendMessage={handleSendMessage}
            onAccuse={handleAccusation}
          />;
        }
        return null;
      case 'result':
        if (gameData && gameState && gameResult) {
          return <ResultScreen
            result={gameResult}
            gameData={gameData}
            gameState={gameState}
            onRestart={handleRestart}
          />;
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Murder Mystery Game Test Page</h1>
          <p className="text-gray-400">AI-Powered Interactive Detective Game using Google Gemini</p>
        </div>
        {renderContent()}
      </main>
    </div>
  );
};
```

### 6. 모바일 최적화

```typescript
// IntroNarration.tsx 모바일 개선

<div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 overflow-y-auto">
  <div className="max-w-3xl w-full bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-10 my-auto">
    {/* 모바일에서 패딩 줄이기 */}
    <div className="mb-4 sm:mb-6">
      <h2 className="text-xl sm:text-3xl font-bold text-yellow-400 mb-2">
        🔍 사건 발생
      </h2>
    </div>

    <div className="max-h-[60vh] overflow-y-auto">
      {/* 모바일에서 스크롤 가능 */}
      <NarrationStream
        text={narration}
        speed="normal"
        onComplete={handleComplete}
        onSkip={handleSkip}
        showSkipButton={true}
      />
    </div>

    {/* 모바일 하단 고정 버튼 */}
    <div className="mt-4 pt-4 border-t border-gray-700 sm:hidden">
      <button
        onClick={handleSkip}
        className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-semibold transition-colors"
      >
        건너뛰기 →
      </button>
    </div>
  </div>
</div>
```

---

## 🎭 Ending Narration Implementation

### 1. 생성 전략

**시점**: 범인 지목 직후 (온디맨드 생성)

**이유**:
- ✅ 실제 플레이어 선택을 반영 가능 (정답/오답에 따라 다른 내용)
- ✅ 발견한 증거 목록 참조 가능
- ✅ 케이스 생성 시간에 영향 없음
- ✅ 토큰 절약 (완료된 게임만 생성)

**생성 흐름**:
1. 플레이어가 범인 지목
2. 정답 여부 확인
3. Gemini API 호출로 엔딩 나레이션 생성 (4단계)
4. 스트리밍 방식으로 순차 표시

### 2. Gemini 프롬프트 템플릿

```typescript
// src/lib/murder-mystery/narration/prompts.ts

export const generateEndingPrompt = (
  gameData: GeneratedGame,
  gameState: GameState,
  accusedSuspect: string,
  isCorrect: boolean
) => `
당신은 탐정 소설 작가입니다. 살인 미스터리 게임의 결말 나레이션을 작성해주세요.

**게임 정보:**
- 피해자: ${gameData.victim}
- 실제 범인: ${gameData.culprit}
- 범인의 동기: ${gameData.motive}
- 범행 수단: ${gameData.means}
- 범행 기회: ${gameData.opportunity}

**플레이어 정보:**
- 지목한 용의자: ${accusedSuspect}
- 정답 여부: ${isCorrect ? '정답' : '오답'}
- 발견한 증거: ${gameState.discoveredEvidence.map(e => e.name).join(', ')}
- 조사한 장소: ${gameState.investigatedLocations.length}곳
- 대화한 용의자: ${Object.keys(gameState.conversations).join(', ')}

**나레이션 구조 (4단계):**

1. **gathering** (소집 장면, 150-200단어):
   - 모든 용의자들이 한 곳에 모임
   - 긴장감 넘치는 분위기
   - 탐정(플레이어)이 입을 열 준비

2. **deduction** (추리 과정, 3-5개 단계):
   각 단계는 100-150단어의 독립적인 문단
   - 플레이어가 발견한 실제 증거 언급
   - 단계적으로 진실에 접근
   - 논리적 추론 과정 전개
   ${isCorrect ? '- 결정적 증거로 범인 몰아가기' : '- 실수한 지점 암시'}

3. **reveal** (범인 공개, 200-250단어):
   ${isCorrect
     ? `- "${accusedSuspect}, 당신이 범인입니다!" 선언
        - 범인의 반응 (부인 → 결국 인정)
        - 범행 동기와 방법의 완전한 공개
        - 다른 용의자들의 놀란 반응`
     : `- "${accusedSuspect}, 당신이 범인입니다!" 선언
        - 그러나 증거 부족이나 모순 발견
        - 실제 범인 ${gameData.culprit}의 등장/자백
        - 플레이어의 실수 지점 설명`
   }

4. **epilogue** (에필로그, 150-200단어):
   - 사건 이후의 상황
   - 각 인물들의 향후 행보
   ${isCorrect
     ? '- 탐정(플레이어)에 대한 찬사'
     : '- 아쉽지만 교훈을 얻은 탐정'
   }
   - 여운 있는 마무리

**출력 형식:**
다음 JSON 구조로 반환하세요:
{
  "gathering": "소집 장면 텍스트",
  "deduction": ["추리 1단계", "추리 2단계", "추리 3단계", ...],
  "reveal": "범인 공개 텍스트",
  "epilogue": "에필로그 텍스트"
}

**주의사항:**
- 톤: 극적이고 만족스러운 결말
- 언어: 한국어, 문학적 표현
- 증거 참조: 플레이어가 실제로 발견한 증거만 언급
- 길이: 각 섹션 지정된 단어 수 준수
`;
```

### 3. API 엔드포인트 생성

```typescript
// src/app/api/murder-mystery/narration/ending/route.ts

import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import type { GeneratedGame, GameState, EndingNarration } from "@/lib/murder-mystery/types";
import { generateEndingPrompt } from "@/lib/murder-mystery/narration/prompts";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

const endingSchema = {
  type: Type.OBJECT,
  properties: {
    gathering: { type: Type.STRING },
    deduction: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    reveal: { type: Type.STRING },
    epilogue: { type: Type.STRING }
  },
  required: ["gathering", "deduction", "reveal", "epilogue"]
};

export async function POST(request: NextRequest) {
  try {
    const { gameData, gameState, accusedSuspect } = await request.json() as {
      gameData: GeneratedGame;
      gameState: GameState;
      accusedSuspect: string;
    };

    const isCorrect = accusedSuspect === gameData.culprit;

    const prompt = generateEndingPrompt(gameData, gameState, accusedSuspect, isCorrect);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: endingSchema,
      },
    });

    if (!response.text) {
      throw new Error("AI가 엔딩 나레이션을 생성하지 못했습니다.");
    }

    const endingNarration: EndingNarration = JSON.parse(response.text);

    return NextResponse.json(endingNarration);
  } catch (error) {
    console.error("Error generating ending narration:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "엔딩 나레이션 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
```

### 4. Frontend 컴포넌트

#### EndingNarration.tsx (엔딩 나레이션 컴포넌트)

```typescript
// src/app/test/components/EndingNarration.tsx

'use client';

import React, { useState, useEffect } from 'react';
import NarrationStream from './NarrationStream';
import type { EndingNarration as EndingNarrationData } from '@/lib/murder-mystery/types';

interface EndingNarrationProps {
  narration: EndingNarrationData;
  onComplete: () => void;
}

type Section = 'gathering' | 'deduction' | 'reveal' | 'epilogue' | 'complete';

export default function EndingNarration({
  narration,
  onComplete,
}: EndingNarrationProps) {
  const [currentSection, setCurrentSection] = useState<Section>('gathering');
  const [currentDeductionIndex, setCurrentDeductionIndex] = useState(0);

  const getSectionData = () => {
    switch (currentSection) {
      case 'gathering':
        return {
          title: '🎭 모두 모였습니다',
          text: narration.gathering,
          icon: '🎭'
        };
      case 'deduction':
        return {
          title: `🔍 추리 ${currentDeductionIndex + 1}/${narration.deduction.length}`,
          text: narration.deduction[currentDeductionIndex],
          icon: '🔍'
        };
      case 'reveal':
        return {
          title: '⚡ 진실의 순간',
          text: narration.reveal,
          icon: '⚡'
        };
      case 'epilogue':
        return {
          title: '📜 그 후...',
          text: narration.epilogue,
          icon: '📜'
        };
      default:
        return null;
    }
  };

  const handleSectionComplete = () => {
    if (currentSection === 'gathering') {
      setCurrentSection('deduction');
    } else if (currentSection === 'deduction') {
      if (currentDeductionIndex < narration.deduction.length - 1) {
        setCurrentDeductionIndex(prev => prev + 1);
      } else {
        setCurrentSection('reveal');
      }
    } else if (currentSection === 'reveal') {
      setCurrentSection('epilogue');
    } else if (currentSection === 'epilogue') {
      setCurrentSection('complete');
      setTimeout(() => onComplete(), 1000);
    }
  };

  const handleSkipAll = () => {
    setCurrentSection('complete');
    onComplete();
  };

  if (currentSection === 'complete') return null;

  const sectionData = getSectionData();
  if (!sectionData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-4xl w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 sm:p-10 my-auto border-2 border-yellow-600">
        {/* 진행 표시 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400">
              {sectionData.icon} {sectionData.title}
            </h2>
            <button
              onClick={handleSkipAll}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              모두 건너뛰기 ⏭
            </button>
          </div>

          {/* 진행 바 */}
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all duration-300"
              style={{
                width: `${
                  currentSection === 'gathering' ? 25 :
                  currentSection === 'deduction'
                    ? 25 + (50 * (currentDeductionIndex + 1) / narration.deduction.length)
                    : currentSection === 'reveal' ? 75 : 100
                }%`
              }}
            />
          </div>
        </div>

        {/* 나레이션 콘텐츠 */}
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <NarrationStream
            key={`${currentSection}-${currentDeductionIndex}`}
            text={sectionData.text}
            speed="normal"
            onComplete={handleSectionComplete}
            onSkip={handleSectionComplete}
            showSkipButton={true}
          />
        </div>

        {/* 섹션 인디케이터 */}
        <div className="mt-6 flex justify-center gap-2">
          <span className={`w-3 h-3 rounded-full ${currentSection === 'gathering' ? 'bg-yellow-500' : 'bg-gray-600'}`} />
          <span className={`w-3 h-3 rounded-full ${currentSection === 'deduction' ? 'bg-yellow-500' : 'bg-gray-600'}`} />
          <span className={`w-3 h-3 rounded-full ${currentSection === 'reveal' ? 'bg-yellow-500' : 'bg-gray-600'}`} />
          <span className={`w-3 h-3 rounded-full ${currentSection === 'epilogue' ? 'bg-yellow-500' : 'bg-gray-600'}`} />
        </div>
      </div>
    </div>
  );
}
```

### 5. 페이지 통합 (page.tsx 업데이트)

```typescript
// src/app/test/page.tsx

type GamePhase = 'setup' | 'loading' | 'intro' | 'playing' | 'accusing' | 'ending' | 'result';

const MurderMysteryTestPage: React.FC = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [endingNarration, setEndingNarration] = useState<EndingNarration | null>(null);
  // ... 기존 상태

  const handleAccusation = useCallback(async (suspectName: string) => {
    if (!gameData || !gameState || !currentGameId) return;

    setGamePhase('accusing');  // 로딩 상태

    try {
      // 엔딩 나레이션 생성
      const response = await fetch('/api/murder-mystery/narration/ending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameData,
          gameState,
          accusedSuspect: suspectName,
        }),
      });

      if (!response.ok) {
        throw new Error('엔딩 나레이션 생성 실패');
      }

      const narration: EndingNarration = await response.json();

      setEndingNarration(narration);
      setGameResult({
        correct: suspectName === gameData.culprit,
        accusedSuspect: suspectName,
        actualCulprit: gameData.culprit,
        endingNarration: narration,
      });
      setGamePhase('ending');

      deleteGame(currentGameId);
      setCurrentGameId(null);
    } catch (error) {
      console.error('엔딩 나레이션 생성 오류:', error);
      // 오류 발생 시 나레이션 없이 결과 화면으로
      setGameResult({
        correct: suspectName === gameData.culprit,
        accusedSuspect: suspectName,
        actualCulprit: gameData.culprit,
      });
      setGamePhase('result');
      deleteGame(currentGameId);
      setCurrentGameId(null);
    }
  }, [gameData, gameState, currentGameId]);

  const handleEndingComplete = useCallback(() => {
    setGamePhase('result');
  }, []);

  const renderContent = () => {
    switch (gamePhase) {
      // ... 기존 케이스들
      case 'accusing':
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mb-4"></div>
            <p className="text-gray-400">결말을 준비하는 중...</p>
          </div>
        );
      case 'ending':
        if (endingNarration) {
          return <EndingNarration
            narration={endingNarration}
            onComplete={handleEndingComplete}
          />;
        }
        return null;
      case 'result':
        if (gameData && gameState && gameResult) {
          return <ResultScreen
            result={gameResult}
            gameData={gameData}
            gameState={gameState}
            onRestart={handleRestart}
          />;
        }
        return null;
      default:
        return null;
    }
  };

  // ... 나머지 코드
};
```

### 6. ResultScreen 업데이트 (엔딩 나레이션 통합)

```typescript
// src/app/test/components/ResultScreen.tsx

interface ResultScreenProps {
  result: GameResult;
  gameData: GeneratedGame;
  gameState: GameState;
  onRestart: () => void;
}

export default function ResultScreen({ result, gameData, gameState, onRestart }: ResultScreenProps) {
  return (
    <div className="space-y-6">
      {/* 결과 요약 */}
      <div className={`p-6 rounded-lg ${result.correct ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'}`}>
        <h2 className="text-3xl font-bold mb-4">
          {result.correct ? '🎉 사건 해결!' : '😔 아쉽습니다...'}
        </h2>

        <div className="space-y-2 text-lg">
          <p>
            <span className="font-semibold">당신의 선택:</span> {result.accusedSuspect}
          </p>
          <p>
            <span className="font-semibold">실제 범인:</span> {result.actualCulprit}
          </p>
        </div>
      </div>

      {/* 게임 통계 */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">📊 조사 통계</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">발견한 증거</p>
            <p className="text-2xl font-bold">{gameState.discoveredEvidence.length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">조사한 장소</p>
            <p className="text-2xl font-bold">{gameState.investigatedLocations.length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">대화한 용의자</p>
            <p className="text-2xl font-bold">{Object.keys(gameState.conversations).length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">소요 시간</p>
            <p className="text-2xl font-bold">
              {Math.floor((Date.now() - gameState.startTime) / 60000)}분
            </p>
          </div>
        </div>
      </div>

      {/* 재시작 버튼 */}
      <button
        onClick={onRestart}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold text-lg transition-colors"
      >
        새 사건 조사하기 →
      </button>
    </div>
  );
}
```

---

## 🎨 Optional Features (v1)

### Scene Transition Narration

**구현 시점**: v1 (v0 완료 후)

**개요**: 위치 이동 시 50-100단어의 짧은 분위기 묘사

**구현 방식**:
1. **사전 생성**: 케이스 생성 시 모든 장소의 전환 나레이션 포함
2. **최초 진입 시만 표시**: 같은 장소 재방문 시 생략
3. **토스트/모달**: 전체 화면이 아닌 작은 UI 요소

```typescript
// v1 구현 예시

interface Location {
  id: string;
  name: string;
  description: string;
  transitionNarration?: string;  // v1에 추가
  evidence: Evidence | null;
  investigated: boolean;
  unlockCondition?: {
    type: 'talked_to_specific';
    suspects: string[];
  };
  imageUrl?: string;
}

// 컴포넌트
export function SceneTransition({ text, onComplete }: { text: string, onComplete: () => void }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gray-800 border border-yellow-500 rounded-lg p-4 shadow-xl z-40 animate-slide-up">
      <p className="text-sm text-gray-300">{text}</p>
      <button onClick={onComplete} className="mt-2 text-xs text-yellow-400 hover:text-yellow-300">
        계속하기 →
      </button>
    </div>
  );
}
```

### Atmospheric Interjections

**구현 시점**: v1 (낮은 우선순위)

**개요**: 게임 중 가끔 나타나는 분위기 묘사 (시간 경과, 긴장감 등)

**트리거 조건**:
- 시간 경과 (20분 플레이 후 "밤이 깊어갑니다...")
- 중요 증거 발견 후 ("등골이 오싹합니다...")
- 범인과 대화 중 ("무언가 숨기는 듯한 느낌이...")

**구현 고려사항**:
- 사용자 설정으로 끄기 가능
- 너무 자주 나타나지 않도록 (최대 게임당 3-4회)
- 게임 흐름 방해 최소화

---

## 📈 Implementation Roadmap

### Phase 0: v0 Implementation (MVP - 필수 기능)

#### Task 1: 데이터 모델 업데이트 (1시간)
- [ ] `types.ts`에 `introNarration`, `EndingNarration`, `GameResult` 업데이트
- [ ] localStorage 스키마 문서화
- [ ] 타입 컴파일 확인

#### Task 2: Intro Narration 백엔드 (2-3시간)
- [ ] `prompts.ts` 생성 및 intro 프롬프트 작성
- [ ] `generate/route.ts` 수정 (intro 생성 추가)
- [ ] 테스트: 생성 시간 측정 (<35초 확인)
- [ ] 에러 처리 추가

#### Task 3: Intro Narration 프론트엔드 (2시간)
- [ ] `NarrationStream.tsx` 공통 컴포넌트 생성
- [ ] `IntroNarration.tsx` 컴포넌트 생성
- [ ] `page.tsx`에 'intro' 페이즈 추가
- [ ] 스킵 기능 및 localStorage 캐싱 구현
- [ ] 모바일 반응형 확인

#### Task 4: Ending Narration 백엔드 (2-3시간)
- [ ] ending 프롬프트 템플릿 작성
- [ ] `api/narration/ending/route.ts` 생성
- [ ] 정답/오답 분기 처리
- [ ] 테스트: 다양한 시나리오 검증

#### Task 5: Ending Narration 프론트엔드 (2-3시간)
- [ ] `EndingNarration.tsx` 컴포넌트 생성
- [ ] 4단계 순차 표시 로직
- [ ] 진행 바 및 섹션 인디케이터
- [ ] `page.tsx` 'accusing', 'ending' 페이즈 추가
- [ ] 에러 핸들링 (나레이션 실패 시 결과 화면으로)

#### Task 6: 통합 테스트 및 최적화 (1-2시간)
- [ ] 전체 플로우 테스트 (setup → intro → play → ending → result)
- [ ] 로딩 상태 개선
- [ ] 성능 측정 (생성 시간, 토큰 사용량)
- [ ] 모바일 기기 테스트
- [ ] 버그 수정

**v0 예상 총 개발 시간**: 10-14시간

### Phase 1: v1 Enhancement (선택 기능)

#### Task 7: Scene Transition Narration (2-3시간)
- [ ] 장소별 전환 나레이션 생성 로직
- [ ] `SceneTransition` 컴포넌트
- [ ] 최초 방문 추적
- [ ] 사용자 설정 (표시/숨김)

#### Task 8: Atmospheric Interjections (3-4시간)
- [ ] 트리거 로직 설계
- [ ] 인터젝션 생성 API
- [ ] UI 컴포넌트 (토스트 형태)
- [ ] 빈도 제어 로직

#### Task 9: Supabase 마이그레이션 (4-5시간)
- [ ] 스키마 마이그레이션 작성
- [ ] localStorage → Supabase 데이터 이전
- [ ] API 라우트 수정 (DB 읽기/쓰기)
- [ ] 사용자 선호도 저장

**v1 예상 추가 개발 시간**: 9-12시간

### Phase 2: Advanced Features (추후 고려)

- [ ] 나레이션 음성 합성 (TTS)
- [ ] 배경 음악 통합
- [ ] 커스텀 나레이션 스타일 (공포, 코미디 등)
- [ ] 소셜 공유 최적화 (엔딩 이미지 생성)

---

## 🧪 Testing & Validation

### Quality Criteria for Narration

#### Intro Narration 품질 기준
✅ **필수 요소**:
- [ ] 배경과 설정 명확히 전달
- [ ] 피해자와 사건 소개
- [ ] 미스터리한 분위기 조성
- [ ] 스포일러 없음
- [ ] 200-400단어 길이

✅ **금지 사항**:
- [ ] 범인 암시 금지
- [ ] 결정적 단서 노출 금지
- [ ] 과도한 공포 요소 금지
- [ ] 캐릭터 판단 금지

#### Ending Narration 품질 기준
✅ **필수 요소**:
- [ ] 4단계 구조 준수 (gathering → deduction → reveal → epilogue)
- [ ] 플레이어 발견 증거 반영
- [ ] 정답/오답 분기 적절성
- [ ] 극적 만족감 제공
- [ ] 모든 의문 해소

✅ **평가 항목**:
- [ ] 논리적 일관성: 추리 과정이 합리적인가?
- [ ] 감정적 카타르시스: 결말이 만족스러운가?
- [ ] 캐릭터 일관성: 인물 행동이 설정과 일치하는가?
- [ ] 문학적 완성도: 읽기 즐거운 텍스트인가?

### User Testing Plan

#### Alpha Test (개발자 테스트)
1. **완주 테스트** (3회 이상):
   - 정답 선택 시나리오
   - 오답 선택 시나리오
   - 스킵 기능 테스트

2. **성능 테스트**:
   - 케이스 생성 시간 측정 (목표: <35초)
   - 엔딩 생성 시간 측정 (목표: <10초)
   - 토큰 사용량 확인 (목표: <500 추가)

3. **에러 시나리오**:
   - API 실패 시 fallback 확인
   - 네트워크 지연 대응
   - 중단 후 재시작 테스트

#### Beta Test (사용자 테스트)
1. **몰입감 평가**:
   - "나레이션이 게임 경험을 향상시켰나요?" (1-5점)
   - "스킵하지 않고 전부 읽었나요?"
   - "더 많은/적은 나레이션을 원하나요?"

2. **UX 평가**:
   - 스트리밍 속도 적절성
   - 스킵 버튼 접근성
   - 모바일 가독성

3. **콘텐츠 평가**:
   - 나레이션 품질 (스토리텔링)
   - 게임 정보와의 일관성
   - 길이 적절성

### Performance Benchmarks

| 지표 | 목표 | 측정 방법 |
|-----|------|----------|
| 케이스 생성 시간 | <35초 | generate API 응답 시간 |
| Intro 나레이션 추가 시간 | <5초 | Intro 생성 단계 시간 |
| Ending 나레이션 생성 시간 | <10초 | ending API 응답 시간 |
| 추가 토큰 사용량 | <500 | Gemini API 로그 |
| 스트리밍 지연 | <50ms/문자 | 사용자 체감 테스트 |
| 모바일 로딩 시간 | <3초 | 모바일 기기 측정 |

### Success Metrics

**v0 출시 기준**:
- [ ] 케이스 생성 성공률 >95%
- [ ] 나레이션 품질 만족도 >4.0/5.0
- [ ] 스킵률 <30% (대부분이 나레이션을 읽음)
- [ ] 모바일 호환성 100%
- [ ] 치명적 버그 0건

**v1 업그레이드 기준**:
- [ ] 사용자 요청: 전환 나레이션 원함 >50%
- [ ] v0 안정화 2주 이상
- [ ] 추가 개발 리소스 확보

---

## 🎯 Implementation Notes

### Development Best Practices

#### 1. 프롬프트 엔지니어링
- **반복 테스트**: 프롬프트를 5회 이상 테스트하여 일관성 확인
- **변수 제어**: 설정, 캐릭터 수에 따른 프롬프트 조정
- **Fallback 텍스트**: API 실패 시 기본 나레이션 준비

#### 2. 에러 처리 전략
```typescript
// 나레이션 생성 실패 시 graceful degradation
try {
  const narration = await generateNarration(...);
  return narration;
} catch (error) {
  console.error('Narration generation failed:', error);
  // Intro: 게임 바로 시작
  // Ending: 단순 결과 화면으로
  return null;
}
```

#### 3. 성능 최적화
- **병렬 처리**: 이미지 생성과 intro 나레이션 병렬 실행 고려
- **캐싱**: intro는 gameId 기반 캐싱 (재시작 시 재사용)
- **Lazy Loading**: 엔딩은 필요 시점에만 생성

#### 4. 사용자 경험
- **로딩 피드백**: 나레이션 생성 중 명확한 로딩 표시
- **스킵 유도**: "스킵" 버튼을 항상 눈에 띄게 배치
- **진행 표시**: 엔딩의 경우 진행 바로 예상 시간 표시

### Security Considerations

1. **API 키 보호**: 환경 변수로만 접근
2. **Rate Limiting**: 나레이션 생성 API에 사용자당 제한 (v1에서 고려)
3. **입력 검증**: gameData 유효성 확인 후 나레이션 생성
4. **XSS 방지**: 나레이션 텍스트 sanitize (React가 기본 제공)

### Accessibility

1. **키보드 네비게이션**: 스킵 버튼 키보드 접근 가능
2. **Screen Reader**: 나레이션 텍스트에 적절한 ARIA 레이블
3. **색맹 지원**: 색상만으로 정보 전달 금지 (아이콘 병행)
4. **폰트 크기**: 모바일에서도 읽기 편한 크기 (최소 14px)

---

## 📝 Summary & Next Steps

### 핵심 요약

**v0 (MVP) 구현 범위**:
1. ✅ **Intro Narration**: 케이스 시작 시 분위기 있는 도입부
2. ✅ **Ending Narration**: 범인 지목 시 극적인 4단계 결말
3. ✅ **Streaming Display**: 타이핑 효과로 점진적 표시
4. ✅ **User Controls**: 스킵 기능, 속도 조절, 재방문 감지

**예상 성과**:
- 몰입감 대폭 향상
- 케이스 생성 시간 <10% 증가
- 토큰 비용 합리적 수준 유지
- 모바일 최적화 완료

### 즉시 시작 가능한 작업

**Phase 0 - Task 1 (첫 번째 작업)**:
```bash
# 1. 타입 정의 업데이트
src/lib/murder-mystery/types.ts
  - GeneratedGame에 introNarration 추가
  - EndingNarration 인터페이스 생성
  - GameResult 인터페이스 확장

# 2. 컴파일 확인
npm run build
```

**Phase 0 - Task 2 (두 번째 작업)**:
```bash
# 1. 프롬프트 파일 생성
src/lib/murder-mystery/narration/prompts.ts
  - generateIntroPrompt 함수 작성

# 2. API 수정
src/app/api/murder-mystery/generate/route.ts
  - intro 나레이션 생성 단계 추가
```

### 문의 및 피드백

구현 중 결정이 필요한 사항:
1. **스트리밍 속도**: slow/normal/fast 중 기본값은?
2. **Intro 위치**: 별도 화면 vs 게임 화면 오버레이?
3. **Ending 스킵**: 개별 섹션 스킵 vs 전체 스킵만?
4. **v1 우선순위**: Scene Transitions vs Atmospheric Interjections?

---

**문서 작성 완료**: 2025-10-09
**다음 단계**: Task 1 (데이터 모델 업데이트) 시작
**예상 v0 완료일**: Task 시작 후 2-3일 (파트타임 기준)
