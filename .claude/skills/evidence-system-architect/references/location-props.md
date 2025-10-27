# Location Props Library

장소별 특성, 소품, 증거 배치 가이드를 제공하는 라이브러리입니다.

## Location Categories

### 1. Crime Scene (범행 현장)

**특성**:
- 실제 살인이 발생한 장소
- 가장 많은 증거가 있는 핵심 장소
- 반드시 케이스에 포함되어야 함
- 플레이어가 가장 먼저 방문하게 될 가능성이 높음

**소품 라이브러리**:

```typescript
const CRIME_SCENE_PROPS = {
  // 거실/응접실
  living_room: [
    "소파", "커피 테이블", "TV", "책장", "와인잔",
    "깨진 유리", "흩어진 책", "넘어진 램프", "카펫",
    "벽시계 (멈춰있을 수 있음)", "액자", "화병"
  ],

  // 서재/사무실
  study: [
    "책상", "의자", "컴퓨터", "서류 더미", "펜",
    "잉크병", "책장", "안전 금고", "전화기",
    "메모지", "달력", "사진", "트로피"
  ],

  // 침실
  bedroom: [
    "침대", "베개", "이불", "옷장", "화장대",
    "거울", "서랍장", "스탠드", "알람시계",
    "휴지통", "슬리퍼", "액자", "옷걸이"
  ],

  // 주방
  kitchen: [
    "식탁", "의자", "냉장고", "싱크대", "칼꽂이",
    "접시", "컵", "냄비", "프라이팬", "와인병",
    "쓰레기통", "식기세척기", "전자레인지", "오븐"
  ],

  // 욕실
  bathroom: [
    "욕조", "샤워기", "세면대", "거울", "수건",
    "비누", "샴푸", "약품", "면도기", "휴지통",
    "약장", "체중계", "바닥 매트"
  ],

  // 야외/정원
  outdoor: [
    "의자", "테이블", "화분", "정원 도구", "호스",
    "잔디", "나무", "울타리", "문", "창문",
    "발자국", "타이어 자국", "쓰레기"
  ]
};
```

**증거 배치 예시**:

```typescript
// 거실에서의 독살 사건
{
  location: {
    name: "피해자의 거실",
    type: "living_room",
    description: "고급 가구로 꾸며진 넓은 거실. 소파 앞 커피 테이블에 와인잔 2개가 놓여있고, 한 잔은 깨져있다.",
    relatedSuspects: ["victim", "suspect_A", "suspect_B"]
  },
  evidence: [
    {
      name: "깨진 와인잔",
      description: "피해자가 마시던 와인잔. 청산가리 반응 검출됨.",
      type: "critical",
      discoveryDifficulty: "obvious",
      position: "커피 테이블 위"
    },
    {
      name: "소파 쿠션 아래의 편지",
      description: "용의자 A가 피해자에게 보낸 협박 편지.",
      type: "supporting",
      discoveryDifficulty: "medium",
      position: "소파 쿠션 아래"
    },
    {
      name: "카펫에 떨어진 머리카락",
      description: "용의자 B의 머리카락. DNA 검사 필요.",
      type: "supporting",
      discoveryDifficulty: "hidden",
      position: "카펫 위"
    }
  ]
}
```

---

### 2. Victim's Residence (피해자의 거주지)

**특성**:
- 피해자의 생활 공간
- 피해자의 관계, 습관, 비밀을 드러내는 증거
- 범행 현장과 다를 수 있음 (피해자가 다른 곳에서 살해된 경우)

**소품 라이브러리**:

```typescript
const VICTIM_RESIDENCE_PROPS = {
  personal_items: [
    "일기장", "사진 앨범", "편지", "수첩", "달력",
    "휴대폰", "태블릿", "노트북", "USB", "메모리 카드"
  ],

  financial_items: [
    "통장", "신용카드", "현금", "영수증", "계약서",
    "보험 증서", "부동산 문서", "주식 증서", "빚 문서"
  ],

  relationship_items: [
    "연애편지", "선물", "사진", "명함", "주소록",
    "결혼 반지", "이혼 서류", "법원 문서"
  ],

  secret_items: [
    "숨겨진 금고", "이중 바닥 서랍", "비밀 노트",
    "암호화된 파일", "익명 계정", "비밀 휴대폰"
  ]
};
```

**증거 배치 예시**:

```typescript
{
  location: {
    name: "피해자의 집",
    type: "victim_residence",
    description: "피해자가 혼자 살던 아파트. 깔끔하게 정돈되어 있으나 서재는 약간 어질러져 있다.",
    relatedSuspects: ["victim", "all_suspects"]
  },
  evidence: [
    {
      name: "피해자의 일기장",
      description: "최근 용의자 A, B, C와의 갈등이 기록되어 있음.",
      type: "supporting",
      discoveryDifficulty: "medium",
      position: "서재 책상 서랍"
    },
    {
      name: "유산 상속 문서",
      description: "피해자의 20억 재산 상속 관련 법률 문서.",
      type: "supporting",
      discoveryDifficulty: "obvious",
      position: "서재 책상 위"
    },
    {
      name: "숨겨진 비디오 파일",
      description: "용의자 B의 범죄 행위를 촬영한 영상.",
      type: "critical",
      discoveryDifficulty: "hidden",
      position: "컴퓨터 암호화 폴더"
    }
  ]
}
```

---

### 3. Suspect's Location (용의자 관련 장소)

**특성**:
- 용의자의 거주지, 직장, 은신처 등
- 용의자의 동기, 수단, 계획을 드러내는 증거
- 범인의 장소와 무고한 용의자의 장소를 구분

**소품 라이브러리**:

```typescript
const SUSPECT_LOCATION_PROPS = {
  // 용의자 집
  suspect_home: [
    "개인 물품", "옷", "신발", "가방", "열쇠",
    "청구서", "우편물", "쓰레기", "세탁물",
    "약품", "도구", "무기", "화학물질"
  ],

  // 용의자 직장
  suspect_workplace: [
    "책상", "컴퓨터", "서류", "명함", "업무 기록",
    "동료 사진", "회의록", "프로젝트 파일",
    "출퇴근 기록", "CCTV", "보안 카드"
  ],

  // 용의자 차량
  suspect_vehicle: [
    "운전석", "조수석", "뒷좌석", "트렁크",
    "대시보드", "글로브 박스", "카메라",
    "GPS 기록", "통행료 영수증", "주유 영수증"
  ],

  // 용의자 은신처
  suspect_hideout: [
    "숨겨진 물품", "증거 인멸 도구", "도주 준비물",
    "현금", "가짜 신분증", "변장 도구",
    "범행 계획 메모", "피해자 사진", "스토킹 기록"
  ]
};
```

**증거 배치 예시**:

```typescript
// 범인의 아파트
{
  location: {
    name: "용의자 A의 아파트",
    type: "suspect_home",
    description: "깔끔하지만 냉랭한 느낌의 아파트. 서재에 법률 서적이 가득하다.",
    relatedSuspects: ["suspect_A"]
  },
  evidence: [
    {
      name: "청산가리 구매 영수증",
      description: "3일 전 인터넷 암시장에서 청산가리를 구매한 기록.",
      type: "critical",
      discoveryDifficulty: "hidden",
      position: "서랍 이중 바닥"
    },
    {
      name: "피해자를 미행한 기록",
      description: "피해자의 일정과 동선을 상세히 기록한 노트.",
      type: "supporting",
      discoveryDifficulty: "medium",
      position: "책상 서랍"
    },
    {
      name: "범행 당일 입었던 옷",
      description: "옷에 미세한 와인 얼룩과 유리 조각이 묻어있음.",
      type: "critical",
      discoveryDifficulty: "medium",
      position: "세탁기 안"
    }
  ]
}

// 무고한 용의자의 직장 (Red Herring)
{
  location: {
    name: "용의자 B의 회사 사무실",
    type: "suspect_workplace",
    description: "IT 회사의 개인 사무실. 컴퓨터와 서버가 많다.",
    relatedSuspects: ["suspect_B"]
  },
  evidence: [
    {
      name: "피해자에게 보낸 화난 이메일",
      description: "프로젝트 실패로 인한 격렬한 비난 이메일. '죽여버리고 싶다'는 표현 포함.",
      type: "red_herring",
      discoveryDifficulty: "obvious",
      position: "컴퓨터 이메일",
      logicalExplanation: "일시적 감정 표현. 이메일 보낸 후 바로 사과 이메일을 보냄."
    },
    {
      name: "피해자와의 통화 기록",
      description: "범행 당일 오후 3시에 피해자와 20분간 통화한 기록.",
      type: "supporting",
      discoveryDifficulty: "medium",
      position: "휴대폰 통화 기록",
      note: "알리바이 확인용 - 범행 시각은 밤 10시이므로 무고함을 입증"
    }
  ]
}
```

---

### 4. Public Location (공공 장소)

**특성**:
- 레스토랑, 호텔, 공원, 주차장 등
- 목격자, CCTV, 공개 기록이 있을 수 있음
- 알리바이 확인 또는 파괴에 사용

**소품 라이브러리**:

```typescript
const PUBLIC_LOCATION_PROPS = {
  // 레스토랑
  restaurant: [
    "테이블", "의자", "메뉴판", "영수증", "예약 기록",
    "CCTV", "직원 증언", "다른 손님 목격담",
    "테이블 위 물품", "냅킨", "와인병"
  ],

  // 호텔
  hotel: [
    "체크인 기록", "키카드 기록", "CCTV", "객실",
    "프론트 데스크", "엘리베이터", "주차장",
    "룸서비스 기록", "전화 기록"
  ],

  // 공원
  park: [
    "벤치", "쓰레기통", "가로등", "CCTV (있다면)",
    "조깅하는 사람", "산책하는 사람", "목격자",
    "발자국", "타이어 자국", "버려진 물품"
  ],

  // 주차장
  parking: [
    "주차 차량", "CCTV", "주차권", "출입 기록",
    "경비원", "타이어 자국", "기름 얼룩",
    "버려진 물품", "담배꽁초"
  ]
};
```

**증거 배치 예시**:

```typescript
{
  location: {
    name: "프렌치 레스토랑 '라 메종'",
    type: "restaurant",
    description: "고급 프렌치 레스토랑. 피해자가 범행 전날 용의자 C와 저녁 식사를 한 장소.",
    relatedSuspects: ["victim", "suspect_C"]
  },
  evidence: [
    {
      name: "레스토랑 예약 기록",
      description: "피해자 명의로 2인 테이블 예약. 용의자 C와 함께 왔다는 직원 증언.",
      type: "supporting",
      discoveryDifficulty: "obvious",
      position: "레스토랑 예약 시스템"
    },
    {
      name: "용의자 C의 신용카드 영수증",
      description: "저녁 식사 비용을 용의자 C가 지불. 시간: 오후 7시 30분.",
      type: "supporting",
      discoveryDifficulty: "medium",
      position: "레스토랑 영수증 기록"
    },
    {
      name: "레스토랑 CCTV",
      description: "피해자와 용의자 C가 격렬하게 다투는 모습이 촬영됨.",
      type: "critical",
      discoveryDifficulty: "medium",
      position: "레스토랑 보안실"
    },
    {
      name: "다른 손님의 목격담",
      description: "용의자 C가 '더 이상 참을 수 없다'고 소리쳤다는 증언.",
      type: "supporting",
      discoveryDifficulty: "obvious",
      position: "손님 인터뷰"
    }
  ]
}
```

---

### 5. Secondary Location (보조 장소)

**특성**:
- 주요 장소는 아니지만 추가 증거를 제공
- 난이도가 높을수록 더 많은 보조 장소 추가
- 플레이어의 탐색 범위를 확장

**소품 라이브러리**:

```typescript
const SECONDARY_LOCATION_PROPS = {
  // 은행
  bank: [
    "계좌 기록", "거래 내역", "대출 기록",
    "금고 대여 기록", "CCTV", "직원 증언"
  ],

  // 병원/약국
  medical: [
    "처방전", "약품 구매 기록", "진료 기록",
    "의사 소견", "약품 재고", "CCTV"
  ],

  // 법률 사무소
  law_office: [
    "계약서", "소송 기록", "상담 기록",
    "변호사 증언", "법률 문서", "메모"
  ],

  // 공항/기차역
  transport: [
    "티켓", "탑승 기록", "CCTV", "보안 검색 기록",
    "짐 확인 기록", "직원 증언"
  ]
};
```

---

## Location Design Patterns

### Pattern 1: Crime Scene + Victim's Home
가장 기본적인 2-장소 패턴 (Easy 난이도)

```typescript
{
  pattern: "basic_two_locations",
  locations: [
    {
      name: "범행 현장 (피해자의 서재)",
      evidenceCount: 4,
      criticalEvidence: 2,
      supportingEvidence: 2
    },
    {
      name: "피해자의 침실",
      evidenceCount: 2,
      criticalEvidence: 1,
      supportingEvidence: 1
    }
  ],
  totalEvidence: 6
}
```

### Pattern 2: Crime Scene + Victim's Home + Guilty Suspect's Location
중간 난이도 3-장소 패턴 (Medium 난이도)

```typescript
{
  pattern: "three_locations_with_suspect",
  locations: [
    {
      name: "범행 현장",
      evidenceCount: 4,
      criticalEvidence: 2,
      supportingEvidence: 1,
      redHerring: 1
    },
    {
      name: "피해자의 집",
      evidenceCount: 3,
      criticalEvidence: 1,
      supportingEvidence: 2
    },
    {
      name: "범인의 아파트",
      evidenceCount: 3,
      criticalEvidence: 1,
      supportingEvidence: 2
    }
  ],
  totalEvidence: 10
}
```

### Pattern 3: Complex Multi-Location
복잡한 다중 장소 패턴 (Hard/Legendary 난이도)

```typescript
{
  pattern: "complex_multi_location",
  locations: [
    {
      name: "범행 현장",
      evidenceCount: 4,
      criticalEvidence: 2,
      supportingEvidence: 1,
      redHerring: 1
    },
    {
      name: "피해자의 집",
      evidenceCount: 3,
      criticalEvidence: 1,
      supportingEvidence: 1,
      redHerring: 1
    },
    {
      name: "범인의 직장",
      evidenceCount: 3,
      criticalEvidence: 1,
      supportingEvidence: 2
    },
    {
      name: "공공 장소 (레스토랑)",
      evidenceCount: 2,
      criticalEvidence: 0,
      supportingEvidence: 2
    },
    {
      name: "무고한 용의자 B의 집",
      evidenceCount: 2,
      redHerring: 2
    }
  ],
  totalEvidence: 14
}
```

---

## Location-Suspect Connection

### Connection Type 1: Direct Association
장소와 용의자가 직접적으로 연결됨

```typescript
{
  connectionType: "direct",
  examples: [
    "용의자의 집",
    "용의자의 직장",
    "용의자의 차량",
    "용의자가 자주 가는 곳"
  ],
  evidenceStrength: "strong"
}
```

### Connection Type 2: Indirect Association
장소와 용의자가 간접적으로 연결됨

```typescript
{
  connectionType: "indirect",
  examples: [
    "용의자가 피해자와 만난 장소",
    "용의자가 목격된 장소",
    "용의자의 알리바이 장소",
    "용의자가 증거를 숨긴 장소"
  ],
  evidenceStrength: "medium"
}
```

### Connection Type 3: No Association (Red Herring)
장소와 용의자가 연결되지 않음 (오해 유발용)

```typescript
{
  connectionType: "none",
  examples: [
    "우연히 목격된 장소",
    "다른 이유로 방문한 장소",
    "제3자가 증거를 남긴 장소"
  ],
  evidenceStrength: "weak",
  purpose: "red_herring"
}
```

---

## Location Image Generation Guidelines

### Location Type별 이미지 프롬프트 템플릿

#### Crime Scene (범행 현장)
```typescript
const crimeScenePrompt = `
Create a crime scene photograph of a ${location.type}.

**Scene Description:**
${location.description}

**Photography Style:**
- Crime scene documentation aesthetic
- Wide-angle establishing shot
- Natural lighting with some shadows
- Forensic photography quality
- Yellow crime scene tape visible (optional)
- Evidence markers with numbers
- Professional, investigative mood

**DO NOT include:**
- Bodies or graphic violence
- People in the scene
- Excessive blood or gore
- Unrealistic elements

**Image Size:** 1024x768 (landscape)
`;
```

#### Victim's Residence (피해자 거주지)
```typescript
const victimResidencePrompt = `
Create a photograph of a ${location.type} interior.

**Scene Description:**
${location.description}

**Photography Style:**
- Interior photography aesthetic
- Natural daylight through windows
- Lived-in, personal atmosphere
- Details of personal items visible
- Slightly messy or disturbed (if crime scene)
- Realistic home environment

**Image Size:** 1024x768 (landscape)
`;
```

#### Suspect's Location (용의자 장소)
```typescript
const suspectLocationPrompt = `
Create a photograph of a ${location.type}.

**Scene Description:**
${location.description}

**Photography Style:**
- ${location.mood} atmosphere (e.g., 'cold and clinical', 'warm and cozy', 'dark and suspicious')
- Realistic interior/exterior
- Details that reveal character
- Natural lighting
- Professional photography quality

**Image Size:** 1024x768 (landscape)
`;
```

#### Public Location (공공 장소)
```typescript
const publicLocationPrompt = `
Create a photograph of a ${location.type}.

**Scene Description:**
${location.description}

**Photography Style:**
- Public space photography
- Realistic crowd or empty (depending on context)
- Security camera perspective (optional)
- Natural or artificial lighting
- Professional quality

**Image Size:** 1024x768 (landscape)
`;
```

---

## Best Practices

1. **Location Variety**: 같은 타입의 장소를 반복하지 말 것
2. **Evidence Distribution**: 한 장소에 증거가 몰리지 않도록 균등 분배
3. **Logical Connections**: 장소와 용의자의 연결이 논리적이어야 함
4. **Exploration Incentive**: 각 장소마다 플레이어가 방문할 이유 제공
5. **Difficulty Scaling**: 난이도에 따라 장소 개수 조정 (Easy: 3, Medium: 4, Hard: 5+)
6. **Fair Play**: 모든 장소가 플레이어에게 접근 가능해야 함
7. **Image Quality**: 장소 이미지는 분위기와 단서를 명확히 전달해야 함

---

**참조**:
- `SKILL.md` - Evidence System Architect
- `evidence-types.md` - 증거 타입 라이브러리
- `difficulty-configs.md` - 난이도별 설정
- `image-generation-guide.md` - 이미지 생성 가이드
