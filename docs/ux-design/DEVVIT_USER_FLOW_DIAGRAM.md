# Devvit User Flow Diagram
**Armchair Sleuths - Complete User Journey**

**Version**: 1.0
**Date**: 2025-10-24

---

## 📱 Complete User Journey (7 Screens)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  SCREEN 1: LOADING                                                      │
│  ════════════════════                                                   │
│                                                                         │
│  ┌──────────────────────────────────────────┐                          │
│  │           Noir Background                │                          │
│  │              (#0a0a0a)                   │                          │
│  │                                          │                          │
│  │              ⏳                          │                          │
│  │                                          │                          │
│  │        🎲 새로운 사건을                  │                          │
│  │           생성하는 중...                 │                          │
│  │                                          │                          │
│  │    AI가 오늘의 미스터리를                │                          │
│  │      만들고 있습니다                     │                          │
│  │      (30-60초 소요)                      │                          │
│  │                                          │                          │
│  │         Loading...                       │                          │
│  │                                          │                          │
│  └──────────────────────────────────────────┘                          │
│                                                                         │
│  Auto-advances when case loaded                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  SCREEN 2: THREE-SLIDE INTRO                                            │
│  ═══════════════════════════                                            │
│                                                                         │
│  ┌───────────────────────────────────────┐                             │
│  │ SLIDE 1: DISCOVERY                    │                             │
│  │ ────────────────────                  │                             │
│  │                                       │                             │
│  │    [Crime Scene Background Image]     │                             │
│  │    (with dark overlay 85%)            │                             │
│  │                                       │                             │
│  │           🔍                          │                             │
│  │                                       │                             │
│  │    ┌────────────────────────┐        │                             │
│  │    │ 2025년 1월 15일 오후 11시  │        │                             │
│  │    │    리버풀 저택            │        │                             │
│  │    └────────────────────────┘        │                             │
│  │                                       │                             │
│  │    ┌───────────────────────────┐     │                             │
│  │    │ 👤 제임스 리버풀          │     │                             │
│  │    │    피해자                 │     │                             │
│  │    │    자신의 저택 서재에서    │     │                             │
│  │    │    살해된 채 발견          │     │                             │
│  │    │    [Blood border]          │     │                             │
│  │    └───────────────────────────┘     │                             │
│  │                                       │                             │
│  │    ┌───────────────────────────┐     │                             │
│  │    │ ⚠️ 한 번만 제출 가능       │     │                             │
│  │    └───────────────────────────┘     │                             │
│  │                                       │                             │
│  │    ┌──────────────────────────┐      │                             │
│  │    │      다음 →              │      │                             │
│  │    │   [Gold button 56px]     │      │                             │
│  │    └──────────────────────────┘      │                             │
│  │                                       │                             │
│  │  • • •                          Skip  │                             │
│  │  [Progress dots]            [Button] │                             │
│  └───────────────────────────────────────┘                             │
│                                                                         │
│                         Swipe/Tap                                       │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────┐                             │
│  │ SLIDE 2: SUSPECTS                     │                             │
│  │ ───────────────                       │                             │
│  │                                       │                             │
│  │    [Suspects Background Image]        │                             │
│  │                                       │                             │
│  │    🔍 용의자 라인업                   │                             │
│  │    누가 거짓말을 하고 있을까요?        │                             │
│  │                                       │                             │
│  │    ┌─────────────────────────────┐   │                             │
│  │    │ 👤 앨리스 | Executive        │   │                             │
│  │    │ 💬 "저는 서재에 가지         │   │                             │
│  │    │     않았습니다."             │   │                             │
│  │    └─────────────────────────────┘   │                             │
│  │                                       │                             │
│  │    ┌─────────────────────────────┐   │                             │
│  │    │ 👤 벤자민 | Butler            │   │                             │
│  │    │ 💬 "주인님께 충성을          │   │                             │
│  │    │     다했습니다."             │   │                             │
│  │    └─────────────────────────────┘   │                             │
│  │                                       │                             │
│  │    [2 more suspect cards...]          │                             │
│  │                                       │                             │
│  │    ┌────┐  ┌──────────────────┐      │                             │
│  │    │← 이전│  │    다음 →       │      │                             │
│  │    └────┘  └──────────────────┘      │                             │
│  │                                       │                             │
│  │  ● • •                          Skip  │                             │
│  └───────────────────────────────────────┘                             │
│                                                                         │
│                         Swipe/Tap                                       │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────┐                             │
│  │ SLIDE 3: CHALLENGE                    │                             │
│  │ ────────────────                      │                             │
│  │                                       │                             │
│  │    [Challenge Background Image]       │                             │
│  │                                       │                             │
│  │           🎯                          │                             │
│  │                                       │                             │
│  │    진실을 밝혀낼 수 있겠습니까?        │                             │
│  │                                       │                             │
│  │    ┌─────────────────────────────┐   │                             │
│  │    │   당신의 임무               │   │                             │
│  │    │   [Gold border]             │   │                             │
│  │    │                             │   │                             │
│  │    │   ✓ 4명의 용의자와 대화     │   │                             │
│  │    │   ✓ 증거를 수집하고 모순 찾기│   │                             │
│  │    │   ✓ 5W1H 답변 제출          │   │                             │
│  │    │                             │   │                             │
│  │    │   ⚠️ 한 번만 제출 가능       │   │                             │
│  │    └─────────────────────────────┘   │                             │
│  │                                       │                             │
│  │    ┌──────────────────────────┐      │                             │
│  │    │  🔍 수사 시작하기        │      │                             │
│  │    │   [Gold button 56px]     │      │                             │
│  │    └──────────────────────────┘      │                             │
│  │                                       │                             │
│  │    ┌──────────────────────────┐      │                             │
│  │    │       ← 이전             │      │                             │
│  │    └──────────────────────────┘      │                             │
│  │                                       │                             │
│  │  • • ●                          Skip  │                             │
│  └───────────────────────────────────────┘                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  SCREEN 3: CASE OVERVIEW                                                │
│  ══════════════════════                                                 │
│                                                                         │
│  ┌─────────────────────────────────────────────┐                       │
│  │ 🕵️ 살인 사건 발생                           │                       │
│  │ 2025년 1월 15일                              │                       │
│  │ [Gold gradient background]                   │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌─────────────────────────────────────────────┐                       │
│  │ [Crime Scene Image 350x200]                  │                       │
│  │                                              │                       │
│  │  ┌────────────────────┐                     │                       │
│  │  │ 범행 현장           │ [Overlay]           │                       │
│  │  │ 리버풀 저택         │                     │                       │
│  │  └────────────────────┘                     │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌─────────────────────────────────────────────┐ ◄── Scrollable        │
│  │ 👤 피해자                                    │                       │
│  │ [Blood border]                               │                       │
│  │                                              │                       │
│  │ 제임스 리버풀                                │                       │
│  │ 성공한 사업가, 60세                          │                       │
│  │                                              │                       │
│  │ 관계: 저택의 주인                            │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌─────────────────────────────────────────────┐                       │
│  │ 🔪 발견된 무기                               │                       │
│  │ [Brass border]                               │                       │
│  │                                              │                       │
│  │ 고급 편지칼                                  │                       │
│  │ 피해자의 책상에서 발견                       │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌─────────────────────────────────────────────┐                       │
│  │ 📍 범행 장소                                 │                       │
│  │ [Blue border]                                │                       │
│  │                                              │                       │
│  │ 리버풀 저택 서재                             │                       │
│  │ 2층에 위치한 서재                            │                       │
│  │                                              │                       │
│  │ 분위기: 음침하고 폐쇄적                      │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌─────────────────────────────────────────────┐                       │
│  │ 🎯 당신의 임무                               │                       │
│  │ [Gold border + glow]                         │                       │
│  │                                              │                       │
│  │ ✓ 4명의 용의자와 대화하세요                 │                       │
│  │ ✓ 증거를 수집하고 모순을 찾으세요           │                       │
│  │ ✓ 5W1H 답변을 제출하세요                    │                       │
│  │                                              │                       │
│  │ ⚠️ 한 번만 제출할 수 있습니다                │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌─────────────────────────────────────────────┐                       │
│  │ 🔍 용의자 (4명)                              │                       │
│  │                                              │                       │
│  │ 앨리스 Executive │ 벤자민 Butler             │                       │
│  │ 클라라 Actress   │ 데이비드 Partner          │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌───────────────────────────────────────────────┐ ◄-- Thumb Zone      │
│  │        🔍 수사 시작하기                       │                       │
│  │        [Gold button 56px]                     │                       │
│  └───────────────────────────────────────────────┘                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  SCREEN 4: INVESTIGATION (TABS)                                         │
│  ═══════════════════════════                                            │
│                                                                         │
│  ┌─────────────────────────────────────────────┐ ◄-- Sticky Header     │
│  │ 🔍 수사 중              ┌──────────┐        │                       │
│  │ 2025-01-15              │ 행동력    │        │                       │
│  │                         │  8 / 12   │        │                       │
│  │                         └──────────┘        │                       │
│  │                                              │                       │
│  │ ┌────────┐ ┌────────┐ ┌────────┐           │                       │
│  │ │🗺️ 장소│ │👤 용의자│ │📋 증거│           │                       │
│  │ │[Active]│ │        │ │        │           │                       │
│  │ └────────┘ └────────┘ └────────┘           │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌─────────────────────────────────────────────┐ ◄-- Scrollable        │
│  │ TAB CONTENT: LOCATIONS                       │                       │
│  │                                              │                       │
│  │ ┌───────────────────────────────────────┐   │                       │
│  │ │ 탐색 방법 선택                         │   │                       │
│  │ │ [Quick] [Careful] [Thorough]          │   │                       │
│  │ │  1 AP     2 AP       3 AP              │   │                       │
│  │ └───────────────────────────────────────┘   │                       │
│  │                                              │                       │
│  │ ┌───────────────────────────────────────┐   │                       │
│  │ │ [Location Image]                      │   │                       │
│  │ │                                       │   │                       │
│  │ │ 📍 서재                               │   │                       │
│  │ │    3개의 증거          2/3           │   │                       │
│  │ │                                       │   │                       │
│  │ │ 피해자가 발견된 장소                  │   │                       │
│  │ │                                       │   │                       │
│  │ │ ┌─────────────────────────────┐      │   │                       │
│  │ │ │  🔍 탐색하기 (2AP)          │      │   │                       │
│  │ │ └─────────────────────────────┘      │   │                       │
│  │ └───────────────────────────────────────┘   │                       │
│  │                                              │                       │
│  │ [2 more location cards...]                   │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌───────────────────────────────────────────────┐ ◄-- Sticky Footer   │
│  │     📝 수사 완료 (답안 제출)                  │                       │
│  │     [Gold button 56px]                        │                       │
│  └───────────────────────────────────────────────┘                       │
│                                                                         │
│  Switch to TAB: SUSPECTS                                                │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────┐                       │
│  │ TAB CONTENT: SUSPECTS                        │                       │
│  │                                              │                       │
│  │ ┌───────────────────────────────────────┐   │                       │
│  │ │ [Avatar]  앨리스                      │   │                       │
│  │ │ 80x80     Executive | 35세            │   │                       │
│  │ │           Business Partner            │   │                       │
│  │ │                                       │   │                       │
│  │ │ 💬 대화 3회     +6AP 획득             │   │                       │
│  │ │                                       │   │                       │
│  │ │ ┌─────────────────────────────┐      │   │                       │
│  │ │ │  💬 심문하기                │      │   │                       │
│  │ │ └─────────────────────────────┘      │   │                       │
│  │ └───────────────────────────────────────┘   │                       │
│  │                                              │                       │
│  │ [3 more suspect cards...]                    │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  Switch to TAB: EVIDENCE                                                │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────┐                       │
│  │ TAB CONTENT: EVIDENCE                        │                       │
│  │                                              │                       │
│  │ [All] [Physical] [Testimonial]               │                       │
│  │                                              │                       │
│  │ ┌───────────────────────────────────────┐   │                       │
│  │ │      발견한 증거                      │   │                       │
│  │ │       8 / 12                          │   │                       │
│  │ │  [Progress bar 67%]                   │   │                       │
│  │ └───────────────────────────────────────┘   │                       │
│  │                                              │                       │
│  │ ┌───────────────────────────────────────┐   │                       │
│  │ │ [Evidence Image]                      │   │                       │
│  │ │                                       │   │                       │
│  │ │ 🔍 피 묻은 편지칼        [RARE]      │   │                       │
│  │ │    서재                               │   │                       │
│  │ │                                       │   │                       │
│  │ │ 피해자의 책상에서 발견된 편지칼       │   │                       │
│  │ │                                       │   │                       │
│  │ │ 관련 용의자: 앨리스, 벤자민           │   │                       │
│  │ │                                       │   │                       │
│  │ │ ┌─────────────────────────────┐      │   │                       │
│  │ │ │  상세보기 →                 │      │   │                       │
│  │ │ └─────────────────────────────┘      │   │                       │
│  │ └───────────────────────────────────────┘   │                       │
│  │                                              │                       │
│  │ [7 more evidence cards...]                   │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                     Tap "답안 제출"
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  SCREEN 5: SUBMISSION FORM                                              │
│  ════════════════════════                                               │
│                                                                         │
│  ┌─────────────────────────────────────────────┐                       │
│  │ 📝 최종 답안 제출        ┌──────────┐      │                       │
│  │ 2025-01-15              │ ← 수사로  │      │                       │
│  │                         └──────────┘      │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌─────────────────────────────────────────────┐ ◄-- Scrollable        │
│  │ ❓ WHO (누가) - 범인은 누구입니까?          │                       │
│  │                                              │                       │
│  │ ┌───────────────────────────────────────┐   │                       │
│  │ │ 앨리스                         ✓     │   │                       │
│  │ │ [Selected - Gold]                    │   │                       │
│  │ └───────────────────────────────────────┘   │                       │
│  │ ┌───────────────────────────────────────┐   │                       │
│  │ │ 벤자민                               │   │                       │
│  │ └───────────────────────────────────────┘   │                       │
│  │ [2 more suspects...]                         │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌─────────────────────────────────────────────┐                       │
│  │ ❓ WHAT (무엇을) - 살인 방법                │                       │
│  │                                              │                       │
│  │ ┌───────────────────────────────────────┐   │                       │
│  │ │ 편지칼로 찔러서 살해했다              │   │                       │
│  │ │ [Filled - Gold border]               │   │                       │
│  │ └───────────────────────────────────────┘   │                       │
│  │                                              │                       │
│  │ ┌─────────────────────────────┐             │                       │
│  │ │  ✏️ 입력하기                │             │                       │
│  │ └─────────────────────────────┘             │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  [WHERE, WHEN, WHY, HOW fields similarly...]                            │
│                                                                         │
│  ┌─────────────────────────────────────────────┐                       │
│  │ ⚠️ 제출 후에는 수정할 수 없습니다.           │                       │
│  │    신중히 작성해주세요.                      │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌───────────────────────────────────────────────┐ ◄-- Thumb Zone      │
│  │       🎯 답안 제출하기                        │                       │
│  │       [Gold button 56px]                      │                       │
│  └───────────────────────────────────────────────┘                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                     Submit Answer
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  SCREEN 6: RESULTS VIEW                                                 │
│  ═══════════════════                                                    │
│                                                                         │
│  ┌─────────────────────────────────────────────┐                       │
│  │ 🎯 채점 결과                                 │                       │
│  │ 2025-01-15                                   │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌─────────────────────────────────────────────┐                       │
│  │         🎉 정답입니다!                       │                       │
│  │                                              │                       │
│  │              95점                            │                       │
│  │                                              │                       │
│  │         전체 순위: 2위                       │                       │
│  │                                              │                       │
│  │ 범인을 정확히 찾아냈습니다!                 │                       │
│  │ 훌륭한 추리력이네요.                        │                       │
│  │                                              │                       │
│  │ [Gold gradient background + glow]           │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌─────────────────────────────────────────────┐ ◄-- Scrollable        │
│  │ 📊 상세 채점 결과                            │                       │
│  │                                              │                       │
│  │ ┌───────────────────────────────────────┐   │                       │
│  │ │ ❓ WHO (누가)             20점  ✅   │   │                       │
│  │ │ 정확히 범인을 지목했습니다            │   │                       │
│  │ └───────────────────────────────────────┘   │                       │
│  │                                              │                       │
│  │ ┌───────────────────────────────────────┐   │                       │
│  │ │ ❓ WHAT (무엇을)          15점  ✅   │   │                       │
│  │ │ 살인 방법을 정확히 설명했습니다       │   │                       │
│  │ └───────────────────────────────────────┘   │                       │
│  │                                              │                       │
│  │ [WHERE, WHEN, WHY, HOW breakdown...]         │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌─────────────────────────────────────────────┐                       │
│  │ 📈 전체 통계                                 │                       │
│  │                                              │                       │
│  │ 총 제출: 42    정답자: 8                    │                       │
│  │ 평균 점수: 67  정답률: 19%                  │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌─────────────────────────────────────────────┐                       │
│  │ 🏆 리더보드 (Top 10)                         │                       │
│  │                                              │                       │
│  │ 🥇 user123    98점  ✅ 정답                 │                       │
│  │ 🥈 you (나)   95점  ✅ 정답  [Highlight]    │                       │
│  │ 🥉 user456    92점  ✅ 정답                 │                       │
│  │ 4  user789    89점  ✅ 정답                 │                       │
│  │ [6 more entries...]                          │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  ┌───────────────────────────────────────────────┐ ◄-- Thumb Zone      │
│  │         🔄 새 게임 시작                       │                       │
│  │         [Gold button 56px]                    │                       │
│  └───────────────────────────────────────────────┘                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                     Tap "새 게임"
                              ▼
                     Back to LOADING
```

---

## 🎯 Key UX Decisions

### Thumb Zone Optimization

All primary CTAs placed in bottom 1/3 of screen:
- Loading: Error recovery buttons
- Intro: Next/Start buttons
- Case Overview: "Start Investigation" button
- Investigation: "Submit Answer" button (sticky)
- Submission: "Submit" button (sticky)
- Results: "New Game" button

### Progressive Disclosure

Information revealed in natural hierarchy:
1. **Intro Slide 1**: Time, location, victim, constraint
2. **Intro Slide 2**: Suspect lineup with claims
3. **Intro Slide 3**: Mission objectives
4. **Case Overview**: Detailed case briefing
5. **Investigation**: Interactive evidence gathering
6. **Submission**: Final deduction
7. **Results**: Feedback and leaderboard

### Touch Targets

All interactive elements ≥48px:
- Buttons: 48-56px minimum
- Tabs: 48px height
- List items: 48px+ height
- Image cards: Full-width tap area

### Scrolling Strategy

**Fixed Elements**:
- Investigation header (tabs + AP counter)
- Investigation footer (submit button)

**Scrollable Elements**:
- Case overview details
- Location/Suspect/Evidence lists
- Submission form fields
- Results breakdown + leaderboard

### Visual Hierarchy

**Color-coded by importance**:
- Gold (#c9b037): Primary actions, highlights
- Blood red (#8b0000): Errors, victim info
- Blue (#1e90ff): Information, discovery
- Gray scale: Backgrounds and text tiers

**Size-coded by hierarchy**:
- xlarge (20px): Screen titles
- large (18px): Section headers
- medium (16px): Body text
- small (14px): Metadata
- xsmall (12px): Fine print

---

## 📱 Mobile-First Considerations

### Viewport Optimization

**Target**: 375px-414px (80% of Reddit mobile traffic)
- Single-column layouts
- Full-width cards
- Stacked form fields
- Bottom-aligned CTAs

### Gesture Support

**Intro Slides**:
- Swipe left → Next slide
- Swipe right → Previous slide
- Tap progress dot → Jump to slide
- Tap skip → Go to case overview

**Investigation Tabs**:
- Tap tab → Switch content
- Scroll → Browse items
- Tap card → View details

### Input Optimization

**Form Fields**:
- Modal input (Devvit pattern)
- Large tap targets (48px)
- Clear visual feedback (gold border when filled)
- Character count for long fields

### Performance

**Image Loading**:
- Progressive: thumbnail → full
- Lazy: below-fold images
- Optimized: <200KB per image

**Transitions**:
- Fast: <300ms
- Smooth: Native Devvit transitions
- Minimal: Reduce jank

---

## ♿ Accessibility Flow

### Screen Reader Journey

1. **Loading**: "Loading case file, please wait"
2. **Intro Slide 1**: "Discovery slide, 1 of 3. Murder occurred at..."
3. **Intro Slide 2**: "Suspects slide, 2 of 3. Four suspects identified..."
4. **Intro Slide 3**: "Challenge slide, 3 of 3. Your mission is..."
5. **Case Overview**: "Case overview screen. Victim: James Liverpool..."
6. **Investigation**: "Investigation screen. Locations tab active..."
7. **Submission**: "Submission form. Who question: Select culprit..."
8. **Results**: "Results screen. Correct answer! Score: 95 points..."

### Keyboard Navigation

**Tab Order**:
1. Header actions (skip, back)
2. Primary content (cards, buttons)
3. Bottom CTAs
4. Progress indicators

**Shortcuts** (if supported):
- Enter: Activate button
- Escape: Back/Close
- Arrow keys: Navigate tabs/slides

---

## 🎨 Delightful Details

### Personality

**Empty States**:
- 🔍 "No evidence yet - start exploring!"
- 💬 "Haven't talked to suspects? Time to interrogate!"
- 📝 "Ready to solve the case?"

**Error States**:
- ⚠️ "Connection lost - even detectives need wifi!"
- 💀 "Case file missing - try again?"
- ⏳ "Taking too long? AI is working hard!"

**Success States**:
- 🎉 "Brilliant deduction!"
- 🏆 "Top detective!"
- ✅ "Case closed!"

### Micro-interactions

**Button Press**:
- Visual: Opacity 0.7 on press
- Feedback: Immediate response

**Card Tap**:
- Visual: Background darkens
- Transition: Smooth to detail view

**Tab Switch**:
- Visual: Gold underline animates
- Content: Fade in new content

**Progress**:
- Toast: "+2 AP acquired!"
- Badge: "🏆 50% evidence found!"
- Celebration: "🎉 All suspects interviewed!"

---

## ✅ Implementation Checklist

### Phase 1: Structure (Week 1)
- [ ] Loading screen with error handling
- [ ] Three-slide intro with swipe navigation
- [ ] Case overview with crime scene image
- [ ] Investigation tabs (locations, suspects, evidence)

### Phase 2: Content (Week 2)
- [ ] Location cards with search methods
- [ ] Suspect cards with interrogation
- [ ] Evidence cards with discovery
- [ ] Submission form with modals
- [ ] Results view with leaderboard

### Phase 3: Polish (Week 3)
- [ ] Loading states (skeletons)
- [ ] Empty states (helpful CTAs)
- [ ] Error states (recovery actions)
- [ ] Success celebrations
- [ ] Micro-interactions

### Phase 4: Accessibility (Week 4)
- [ ] Screen reader labels
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Color contrast verification
- [ ] Touch target sizes
- [ ] Real device testing

---

**User Flow Complete** ✅

This diagram visualizes the complete 7-screen journey optimized for mobile-first Reddit users!
