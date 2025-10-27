# Evidence System Visual Mockups
## Component Design Specifications

**Version:** 1.0
**Date:** 2025-10-23

---

## 1. Empty State Mockup

### Desktop View (1024px+)

```
┌────────────────────────────────────────────────────────────────────────┐
│  📋 수사 노트                                                           │
│  발견한 증거를 정리하고 사건을 재구성하세요                              │
│                                                                        │
│  ┌──────────────────────────────────────────────────┐                 │
│  │ 0개 증거 발견                                     │ 0개 장소 탐색     │
│  └──────────────────────────────────────────────────┘                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                        ┌─────────────────┐                            │
│                        │                 │                            │
│                        │    [Detective   │                            │
│                        │   with Magnify- │                            │
│                        │   ing Glass]    │                            │
│                        │   Animated SVG  │                            │
│                        │     120x120     │                            │
│                        │                 │                            │
│                        └─────────────────┘                            │
│                                                                        │
│                   🕵️ 증거 수집을 시작하세요                            │
│                                                                        │
│          아직 발견한 증거가 없습니다. 사건 현장과 관련 장소를           │
│          탐색하여 단서를 찾아보세요. 첫 번째 증거를 발견하면           │
│                    보너스 점수를 받을 수 있습니다!                      │
│                                                                        │
│                   ┌──────────────────────────┐                        │
│                   │     0 / 10 증거 발견      │                        │
│                   │ [████                 ]  │                        │
│                   └──────────────────────────┘                        │
│                                                                        │
│              ┌────────────────────────────────────────┐               │
│              │       🗺️  장소 탐색하기              │               │
│              │   (Primary CTA - Gold Gradient)       │               │
│              └────────────────────────────────────────┘               │
│                                                                        │
│                      💡 탐색 팁 보기 ▼                                │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  💡 조사 팁                                                     │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │ 🔍 꼼꼼한 탐색                                           │  │  │
│  │  │ 각 장소를 여러 방식으로 조사하여 숨겨진 증거를 찾으세요   │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │ ⭐ 핵심 증거 우선                                        │  │  │
│  │  │ 빨간색 테두리 증거는 사건 해결에 결정적인 단서입니다     │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │ 🔗 증거 연결                                            │  │  │
│  │  │ 여러 증거를 종합하면 새로운 사실을 발견할 수 있습니다   │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Mobile View (375px)

```
┌─────────────────────────────┐
│ 📋 수사 노트                 │
│ 발견한 증거를 정리하고       │
│ 사건을 재구성하세요          │
│                             │
│ 0개 증거  │  0개 장소       │
├─────────────────────────────┤
│                             │
│     ┌───────────────┐       │
│     │  [Detective]  │       │
│     │  [Magnifier]  │       │
│     │   Animated    │       │
│     │    80x80      │       │
│     └───────────────┘       │
│                             │
│  🕵️ 증거 수집을              │
│     시작하세요               │
│                             │
│  아직 발견한 증거가          │
│  없습니다. 장소를 탐색하여   │
│  단서를 찾아보세요.          │
│                             │
│  ┌─────────────────────┐   │
│  │  0 / 10 증거 발견    │   │
│  │ [████            ]  │   │
│  └─────────────────────┘   │
│                             │
│ ┌─────────────────────────┐│
│ │  🗺️  장소 탐색하기     ││
│ │   (Full Width CTA)     ││
│ └─────────────────────────┘│
│                             │
│     💡 탐색 팁 보기 ▼       │
│                             │
└─────────────────────────────┘
```

---

## 2. Evidence Grid with Items

### Desktop View (1024px+)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  📋 수사 노트                                                               │
│  발견한 증거를 정리하고 사건을 재구성하세요                                  │
│                                                                            │
│  ┌────────────────────┐  ┌────────────────┐                              │
│  │ 7개 증거 발견       │  │ 3개 장소 탐색   │                              │
│  └────────────────────┘  └────────────────┘                              │
│                                                                            │
│  [ 전체 (7) ]  [ Physical (3) ]  [ Testimony (2) ]  [ Financial (2) ]    │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │ 🔍 Blood-stained │  │ 💬 Witness       │  │ 💰 Bank          │       │
│  │    Knife [NEW!]  │  │    Statement     │  │    Statement     │       │
│  │ ⭐⭐⭐ 핵심       │  │ ⭐⭐ 중요       │  │ ⭐ 보조          │       │
│  │                  │  │                  │  │                  │       │
│  │ A kitchen knife  │  │ Neighbor heard   │  │ Large withdrawal │       │
│  │ found hidden...  │  │ argument at...   │  │ on the day...    │       │
│  │                  │  │                  │  │                  │       │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │       │
│  │ │ [Evidence   ] │ │  │ │ [Evidence   ] │ │  │ │ [Evidence   ] │ │       │
│  │ │ [Image 200px] │ │  │ │ [Image 200px] │ │  │ │ [Image 200px] │ │       │
│  │ └──────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │       │
│  │                  │  │                  │  │                  │       │
│  │ Crime Scene      │  │ Apartment Hall   │  │ Bank Records     │       │
│  │ 자세히 보기 →    │  │ 자세히 보기 →    │  │ 자세히 보기 →    │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
│  [Pulsing glow]        [Hover: lift 4px]    [Static]                    │
│                                                                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │ 📱 Phone         │  │ ⏰ Alibi         │  │ 🔬 DNA           │       │
│  │    Records       │  │    Verification  │  │    Analysis      │       │
│  │ ... (4 more)                                                          │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  💡 조사 팁                                                         │  │
│  │                                                                     │  │
│  │  • 핵심 증거를 우선적으로 분석하세요                                │  │
│  │  • 증거를 클릭하면 상세 정보를 확인할 수 있습니다                   │  │
│  │  • 여러 증거를 종합하여 사건을 재구성하세요                         │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Mobile View (375px)

```
┌─────────────────────────────┐
│ 📋 수사 노트                 │
│ 발견한 증거를 정리하세요     │
│                             │
│ 7개 증거 │ 3개 장소         │
│                             │
│ [전체] [Physical] [More ▼] │
├─────────────────────────────┤
│                             │
│ ┌─────────────────────────┐ │
│ │ 🔍 Blood-stained Knife │ │
│ │ [NEW!] ⭐⭐⭐          │ │
│ │                        │ │
│ │ A kitchen knife found  │ │
│ │ hidden behind the...   │ │
│ │                        │ │
│ │  ┌─────────────────┐  │ │
│ │  │ [Evidence Img]  │  │ │
│ │  │   160x160       │  │ │
│ │  └─────────────────┘  │ │
│ │                        │ │
│ │ Crime Scene Kitchen    │ │
│ │ 자세히 보기 →          │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 💬 Witness Statement   │ │
│ │ ⭐⭐                   │ │
│ │ ...                    │ │
│                             │
└─────────────────────────────┘
```

---

## 3. Evidence Detail Modal - Enhanced

### Desktop View (640px modal)

```
┌──────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────────┐   │
│ │ 🔍 Blood-stained Knife                  [NEW!]    ×│   │
│ │ ⭐⭐⭐ 핵심 증거                                   │   │
│ │ 🕐 2025-10-23 14:32 발견                          │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ 📝 상세 설명                                       │   │
│ │                                                    │   │
│ │ A kitchen knife found hidden behind the            │   │
│ │ refrigerator in the victim's apartment. The blade  │   │
│ │ shows traces of blood and partial fingerprints.    │   │
│ │ The handle appears to have been wiped clean but    │   │
│ │ some prints remain visible under UV light.         │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ 📸 증거 사진                         [🔍 확대]     │   │
│ │ ┌────────────────────────────────────────────────┐ │   │
│ │ │                                                │ │   │
│ │ │                                                │ │   │
│ │ │        [Knife Evidence Image]                  │ │   │
│ │ │           400x300px                            │ │   │
│ │ │      Hover: Zoom icon overlay                  │ │   │
│ │ │                                                │ │   │
│ │ │                                                │ │   │
│ │ └────────────────────────────────────────────────┘ │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ 💡 발견 경위                                       │   │
│ │                                                    │   │
│ │ Found during thorough search of kitchen area.      │   │
│ │ Hidden in narrow gap between refrigerator and      │   │
│ │ wall, approximately 6 inches from the floor.       │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ 🔎 분석 및 해석                                    │   │
│ │                                                    │   │
│ │ • Blood type matches victim (Type O+)              │   │
│ │ • Partial fingerprints suggest hasty concealment   │   │
│ │ • Location indicates perpetrator familiar with     │   │
│ │   apartment layout                                 │   │
│ │ • Weapon consistent with victim's wounds           │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ 🔗 관련 정보                                       │   │
│ │                                                    │   │
│ │ 👥 관련 용의자:                                    │   │
│ │ ┌───────────────┐  ┌───────────────┐             │   │
│ │ │ [Avatar 60px] │  │ [Avatar 60px] │             │   │
│ │ │ John Smith    │  │ Mary Johnson  │             │   │
│ │ │ 주요 용의자     │  │ 알리바이 제공   │             │   │
│ │ │ [Hover Card]  │  │ [Hover Card]  │             │   │
│ │ └───────────────┘  └───────────────┘             │   │
│ │                                                    │   │
│ │ 📍 발견 장소: Crime Scene Kitchen (클릭 가능)     │   │
│ │ 🔍 관련 증거: Fingerprint Record, Blood Sample    │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ 📊 메타데이터                                      │   │
│ │                                                    │   │
│ │ 증거 유형: Physical Evidence                      │   │
│ │ 발견 장소: Crime Scene Kitchen                    │   │
│ │ 발견 시각: 2025-10-23 14:32                       │   │
│ │ 중요도: Critical (⭐⭐⭐)                        │   │
│ │ 신뢰도: 높음                                      │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ [📌 중요 표시] [🔗 용의자 연결] [📋 비교하기]     │   │
│ │                                                    │   │
│ │            ┌──────────────────────┐               │   │
│ │            │      닫기 (Close)    │               │   │
│ │            └──────────────────────┘               │   │
│ └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### Mobile View (Full Screen)

```
┌─────────────────────────────┐
│ 🔍 Blood-stained Knife  [×] │
│ ⭐⭐⭐ 핵심 증거           │
│ 🕐 오늘 14:32 발견          │
├─────────────────────────────┤
│                             │
│ 📝 상세 설명                 │
│                             │
│ A kitchen knife found       │
│ hidden behind the           │
│ refrigerator in the         │
│ victim's apartment...       │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📸 증거 사진    [🔍]   │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ [Evidence Image]    │ │ │
│ │ │   300x225           │ │ │
│ │ │ Tap to enlarge      │ │ │
│ │ └─────────────────────┘ │ │
│ └─────────────────────────┘ │
│                             │
│ 💡 발견 경위                 │
│ Found during thorough...    │
│                             │
│ 🔎 분석 및 해석              │
│ • Blood type matches...     │
│ • Partial fingerprints...   │
│                             │
│ 🔗 관련 정보                 │
│ 👥 관련 용의자               │
│ ┌─────┐ ┌─────┐            │
│ │[Av] │ │[Av] │            │
│ │John │ │Mary │            │
│ └─────┘ └─────┘            │
│                             │
│ 📍 Crime Scene Kitchen      │
│ 🔍 Fingerprint, Blood       │
│                             │
│ ┌─ 📊 메타데이터 (접기) ───┐│
│                             │
│ [Swipe down to close]       │
│                             │
├─────────────────────────────┤
│ [📌] [🔗] [📋]  [닫기]     │
└─────────────────────────────┘
```

---

## 4. Evidence Discovery Modal - Enhanced

### Desktop View

```
┌──────────────────────────────────────────────┐
│                                              │
│          🔍                                  │
│      (Scale + Pulse)                         │
│                                              │
│       탐색 완료!                             │
│   Crime Scene Kitchen 탐색 결과              │
│                              [×]             │
├──────────────────────────────────────────────┤
│                                              │
│          ┌─────────────┐                     │
│          │      3      │                     │
│          │             │                     │
│          └─────────────┘                     │
│           개의 증거 발견                      │
│                                              │
│       🎉 핵심 증거를 발견했습니다!            │
│                                              │
│  ┌────────────┐  ┌────────────┐             │
│  │ [Evidence  │  │ [Evidence  │             │
│  │  Image]    │  │  Image]    │             │
│  │  120x120   │  │  120x120   │             │
│  │            │  │            │             │
│  │ Blood-     │  │ Finger-    │             │
│  │ stained    │  │ print      │             │
│  │ Knife      │  │ Record     │             │
│  │ ⭐⭐⭐    │  │ ⭐⭐      │             │
│  │ [Glow]     │  │            │             │
│  └────────────┘  └────────────┘             │
│                                              │
│  ┌────────────┐                              │
│  │ [Evidence  │                              │
│  │  Image]    │                              │
│  │  120x120   │                              │
│  │            │                              │
│  │ Blood      │                              │
│  │ Sample     │                              │
│  │ ⭐⭐      │                              │
│  └────────────┘                              │
│                                              │
│  이 장소 탐색률                              │
│  75%                                         │
│  [████████████████        ]                  │
│  3 / 4 증거 발견                             │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │      🔍 증거 자세히 보기              │   │
│  │  (Primary - Switches to Notebook)     │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  [📋 노트에 추가] [🗺️ 계속 탐색]          │
│                                              │
└──────────────────────────────────────────────┘
```

### Mobile View

```
┌─────────────────────────────┐
│          🔍             [×] │
│                             │
│     탐색 완료!               │
│  Crime Scene Kitchen        │
├─────────────────────────────┤
│                             │
│        ┌───────┐            │
│        │   3   │            │
│        └───────┘            │
│      개의 증거 발견          │
│                             │
│  🎉 핵심 증거 발견!          │
│                             │
│ ┌───────┐ ┌───────┐        │
│ │[Evid] │ │[Evid] │        │
│ │ 100px │ │ 100px │        │
│ │       │ │       │        │
│ │ Knife │ │ Print │        │
│ │ ⭐⭐⭐│ │ ⭐⭐ │        │
│ └───────┘ └───────┘        │
│                             │
│ ┌───────┐                  │
│ │[Evid] │                  │
│ │ Blood │                  │
│ │ ⭐⭐ │                  │
│ └───────┘                  │
│                             │
│ 탐색률: 75%                 │
│ [████████        ]          │
│ 3 / 4 증거                  │
│                             │
│ ┌─────────────────────────┐ │
│ │  🔍 증거 자세히 보기   │ │
│ └─────────────────────────┘ │
│                             │
│ [📋 노트] [🗺️ 계속]       │
│                             │
└─────────────────────────────┘
```

---

## 5. Hover States & Interactions

### Evidence Card Hover

```
NORMAL STATE:
┌──────────────────┐
│ 🔍 Blood-stained │
│    Knife         │
│ ⭐⭐⭐          │
│                  │
│ A kitchen knife  │
│ found hidden...  │
│                  │
│ [Image]          │
│                  │
│ Crime Scene      │
│ 자세히 보기 →    │
└──────────────────┘
Border: 2px solid red
Shadow: 0 4px 8px rgba(0,0,0,0.1)
Position: y=0

HOVER STATE:
┌──────────────────┐
│ 🔍 Blood-stained │
│    Knife         │
│ ⭐⭐⭐          │
│                  │
│ A kitchen knife  │
│ found hidden...  │
│                  │
│ [Image Brightens]│
│                  │
│ Crime Scene      │
│ 자세히 보기 → →  │ ← Arrow moves
└──────────────────┘
Border: 2px solid red (brighter)
Shadow: 0 12px 24px rgba(239,68,68,0.3) ← Larger, red tint
Position: y=-4px ← Lifted
Scale: 1.02
Transition: all 0.2s ease
```

### Button Hover States

```
PRIMARY BUTTON:
Normal:
┌────────────────────────┐
│  🗺️  장소 탐색하기    │
└────────────────────────┘
Background: linear-gradient(135deg, #D4AF37, #FFD700)
Shadow: 0 4px 16px rgba(212,175,55,0.3)
Scale: 1.0

Hover:
┌────────────────────────┐
│  🗺️  장소 탐색하기    │
└────────────────────────┘
Background: linear-gradient(135deg, #FFD700, #FFA500) ← Brighter
Shadow: 0 6px 24px rgba(212,175,55,0.5) ← Larger
Scale: 1.05 ← Grow
Cursor: pointer

Active (Click):
┌────────────────────────┐
│  🗺️  장소 탐색하기    │
└────────────────────────┘
Scale: 0.98 ← Shrink
Shadow: 0 2px 8px rgba(212,175,55,0.4)
```

---

## 6. Loading States

### Evidence Loading Skeleton

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ ████████████     │  │ ████████████     │  │ ████████████     │
│ ████████         │  │ ████████         │  │ ████████         │
│                  │  │                  │  │                  │
│ ████████████████ │  │ ████████████████ │  │ ████████████████ │
│ ████████████████ │  │ ████████████████ │  │ ████████████████ │
│                  │  │                  │  │                  │
│ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │
│ │██████████████│ │  │ │██████████████│ │  │ │██████████████│ │
│ │██████████████│ │  │ │██████████████│ │  │ │██████████████│ │
│ └──────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │
│                  │  │                  │  │                  │
│ ████████         │  │ ████████         │  │ ████████         │
│ ████████████     │  │ ████████████     │  │ ████████████     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
                     ← Shimmer animation (pulse)
```

### Evidence Discovery Loading

```
┌──────────────────────────────────┐
│                                  │
│          🔍                      │
│      (Spinning)                  │
│                                  │
│     증거를 분석하는 중...         │
│                                  │
│  [████████████            ]      │
│          60%                     │
│                                  │
└──────────────────────────────────┘
```

---

## 7. Error States

### Evidence Load Error

```
┌────────────────────────────────────────┐
│  📋 수사 노트                           │
├────────────────────────────────────────┤
│                                        │
│           ⚠️                          │
│                                        │
│     증거 목록을 불러올 수 없습니다      │
│                                        │
│  서버와의 연결이 원활하지 않습니다.     │
│  잠시 후 다시 시도해주세요.             │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │       🔄 다시 시도               │ │
│  └──────────────────────────────────┘ │
│                                        │
│  문제가 계속되면 관리자에게 문의하세요  │
│                                        │
└────────────────────────────────────────┘
```

### No Internet Connection

```
┌────────────────────────────────────────┐
│           📡                           │
│                                        │
│     인터넷 연결이 끊어졌습니다          │
│                                        │
│  오프라인 상태에서는 새로운 증거를      │
│  불러올 수 없습니다.                   │
│                                        │
│  [자동으로 재연결 시도 중...]          │
│                                        │
└────────────────────────────────────────┘
```

---

## 8. Animation Keyframes

### Pulse Animation (New Evidence Badge)

```
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

Duration: 2s
Iteration: infinite
Easing: ease-in-out
```

### Float Animation (Empty State Illustration)

```
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

Duration: 3s
Iteration: infinite
Easing: ease-in-out
```

### Shimmer Animation (Loading Skeleton)

```
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

Background: linear-gradient(
  90deg,
  #1F2937 0px,
  #374151 50%,
  #1F2937 100%
)
Background-size: 1000px 100%
Duration: 2s
Iteration: infinite
```

### Slide Up (Modal Entry)

```
@keyframes slideUp {
  0% {
    transform: translateY(50px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

Duration: 300ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 9. Responsive Grid Layouts

### Evidence Grid Breakpoints

```
/* Mobile (320px - 639px) */
.evidence-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 16px;
}

/* Tablet (640px - 1023px) */
@media (min-width: 640px) {
  .evidence-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    padding: 24px;
  }
}

/* Desktop (1024px - 1535px) */
@media (min-width: 1024px) {
  .evidence-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    padding: 32px;
  }
}

/* Large Desktop (1536px+) */
@media (min-width: 1536px) {
  .evidence-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
    padding: 40px;
  }
}
```

---

## 10. Accessibility Visual Indicators

### Focus Indicators

```
NORMAL (No Focus):
┌──────────────────┐
│ 🔍 Blood-stained │
│    Knife         │
└──────────────────┘
Border: 2px solid red

FOCUSED (Keyboard Tab):
┌──────────────────┐
│ 🔍 Blood-stained │ ← Inner glow
│    Knife         │
└──────────────────┘
Border: 2px solid red
Outline: 2px solid #D4AF37 (gold)
Outline-offset: 2px
Box-shadow: 0 0 0 3px rgba(212,175,55,0.3)
```

### High Contrast Mode

```
NORMAL MODE:
Background: #1F2937 (gray-900)
Text: #FFFFFF
Border: #D4AF37 (gold)

HIGH CONTRAST MODE:
Background: #000000 (pure black)
Text: #FFFFFF (pure white)
Border: #FFFF00 (pure yellow)
All gradients → Solid colors
All shadows → Removed or high contrast
```

---

**Visual Mockups Version:** 1.0
**Last Updated:** 2025-10-23
**Design System:** Tailwind CSS + Framer Motion
**Color Palette:** Noir Detective Theme
