# Character Depth & Non-Obvious Trick Design Framework

**목적**: 추리 소설 수준의 캐릭터 깊이와 예측 불가능한 살인 트릭을 생성하는 실용적 프레임워크

**버전**: 1.0
**작성일**: 2025-10-09

---

## Part 1: 다층 캐릭터 생성 프레임워크 (Iceberg Character System)

### 핵심 원칙

**빙산 모델**: 플레이어가 보는 것은 10%, 조사로 발견하는 것은 60%, 마지막에 드러나는 진실은 30%

### 캐릭터 템플릿 구조

```yaml
SURFACE_LAYER (10% - 첫 만남에서 드러남):
  visible_role: "사회적 역할과 직업"
  apparent_personality: "겉으로 보이는 성격"
  obvious_connection: "피해자와의 명백한 관계"
  first_impression: "플레이어가 받는 첫인상"

HIDDEN_LAYER (60% - 조사를 통해 발견):
  the_secret:
    what_hiding: "숨기고 있는 구체적 사실"
    why_hiding: "숨기는 이유"
    evidence_trail: ["단서1", "단서2", "단서3"]

  real_motive:
    if_guilty: "범인이라면 실제 동기"
    emotional_core: "감정적 핵심"
    breaking_point: "인간 한계를 넘게 만든 사건"

  inner_conflict:
    duty_vs_desire: "의무와 욕망의 충돌"
    past_trauma: "과거 트라우마"
    moral_dilemma: "도덕적 딜레마"

  lies_they_tell:
    - lie: "구체적 거짓말"
      truth: "실제 진실"
      why_lie: "거짓말하는 이유"
      contradiction: "모순점"

DEEP_LAYER (30% - 최종 반전에서 드러남):
  core_fear: "가장 깊은 두려움"
  core_desire: "진짜 원하는 것"
  philosophical_question: "이 캐릭터가 체현하는 철학적 질문"
  ultimate_truth: "캐릭터의 궁극적 진실"
  redemption_or_damnation: "구원인가 저주인가"
```

---

## Part 2: 완전한 캐릭터 예시 (3명)

### 예시 1: 박지은 (28세, 비서) - 죄책감과 구원의 아이콘

```yaml
SURFACE_LAYER:
  visible_role: "재벌 회장의 개인 비서, 완벽주의자"
  apparent_personality: "냉정하고 효율적, 감정을 드러내지 않음"
  obvious_connection: "피해자(회장)의 가장 가까운 직원, 10년 근무"
  first_impression: "얼음같은 전문가, 의심스러울 정도로 침착함"

HIDDEN_LAYER:
  the_secret:
    what_hiding: "5년 전 회장의 아들을 교통사고로 죽게 만든 장본인"
    why_hiding: "회장이 진실을 알면 살해당할 것이라 확신"
    evidence_trail:
      - "사고 당일 CCTV에 그녀의 차량 포착"
      - "정비소 기록: 사고 다음날 급하게 범퍼 수리"
      - "심리 상담 기록: 5년간 지속된 불면증과 죄책감"
      - "회장 아들 일기장: '비서 누나가 이상하게 나를 피한다'"

  real_motive:
    if_guilty: "회장이 진실을 눈치채고 복수하려 하자 선제공격"
    emotional_core: "죄책감이 공포로 변한 순간"
    breaking_point: "회장이 '5년 전 사고 조사를 재개하겠다'고 말한 날"

  inner_conflict:
    duty_vs_desire: "충성심 vs 생존 본능"
    past_trauma: "어린 시절 부모를 교통사고로 잃음 → 자신이 가해자가 됨"
    moral_dilemma: "고백하고 벌받을 것인가, 거짓으로 살 것인가"

  lies_they_tell:
    - lie: "회장님을 존경했고 충성스러웠습니다"
      truth: "매일 그를 보며 아들 생각에 죄책감으로 괴로웠다"
      why_lie: "진실을 숨기기 위해 완벽한 비서 페르소나 유지"
      contradiction: "존경한다면서 개인적 대화를 10년간 철저히 회피"

    - lie: "사고 당일 집에 있었습니다"
      truth: "사고 현장 근처에 있었고 목격했을 가능성"
      why_lie: "알리바이 공백을 만들면 의심받음"
      contradiction: "당일 통화 기록이 사고 현장 기지국"

DEEP_LAYER:
  core_fear: "자신이 괴물이며, 구원받을 자격이 없다는 확신"
  core_desire: "용서받고 싶지만, 용서받을 수 없다는 걸 안다"
  philosophical_question: "과거의 죄는 현재의 선행으로 지울 수 있는가?"
  ultimate_truth: "10년간 완벽한 비서로 산 것은 속죄였지만, 회장은 그걸 몰랐다"
  redemption_or_damnation: |
    만약 범인이 아니라면: 진실을 고백하고 법적 처벌을 받아들임 (구원)
    만약 범인이라면: 죄책감이 더 큰 죄를 만들었음 (저주)
```

**심문 시 드러나는 패턴**:
- 초반: 냉정하고 사무적, 완벽한 알리바이
- 증거 제시 시: 미세한 동요, 특정 질문(아들 관련)에 과민 반응
- 압박 시: "저도 피해자입니다" → "당신들은 진실을 모릅니다" → 침묵
- 파훼 시: 눈물 없는 고백, "이미 10년 전에 죽었어야 했다"

---

### 예시 2: 이태수 (45세, 형사) - 정의와 복수의 경계

```yaml
SURFACE_LAYER:
  visible_role: "베테랑 강력계 형사, 20년 경력"
  apparent_personality: "거칠지만 정의감 강함, 직설적"
  obvious_connection: "피해자가 후원하던 경찰 자선 단체 관계"
  first_impression: "믿음직한 수사관, 사건 해결에 적극적"

HIDDEN_LAYER:
  the_secret:
    what_hiding: "10년 전 피해자가 자신의 딸을 성폭행했고, 권력으로 무마했다"
    why_hiding: "현직 형사가 개인적 복수를 하면 모든 걸 잃음"
    evidence_trail:
      - "딸의 일기장: 피해자의 이름이 암호화되어 있음"
      - "10년 전 사건 기록: 종결되었으나 증거 누락 의혹"
      - "피해자 측 변호사와의 비밀 합의 문서"
      - "형사 본인의 은행 계좌: 10년 전 거액 입금 후 전액 기부"

  real_motive:
    if_guilty: "딸이 최근 자살 시도 → 더 이상 참을 수 없었다"
    emotional_core: "법이 실패했을 때, 아버지는 무엇을 해야 하는가"
    breaking_point: "딸이 '아빠, 왜 그를 잡지 않았어?'라고 물었을 때"

  inner_conflict:
    duty_vs_desire: "법의 수호자 vs 아버지의 복수"
    past_trauma: "정의를 믿었으나 권력 앞에 무력했던 경험"
    moral_dilemma: "법 밖의 정의는 정의인가, 범죄인가"

  lies_they_tell:
    - lie: "피해자와는 자선 행사에서만 만났습니다"
      truth: "10년 전 사건 이후 그를 추적하며 기회를 노렸다"
      why_lie: "개인적 연결고리를 숨기기 위해"
      contradiction: "자선 행사 참석 기록 vs 피해자 집 근처 CCTV 다수 포착"

    - lie: "법을 믿습니다. 사적 제재는 용납 못 합니다"
      truth: "법이 실패한 걸 알고 있고, 복수를 꿈꿔왔다"
      why_lie: "형사로서의 정체성을 유지하기 위해"
      contradiction: "강하게 주장하지만, 유사 사건에서 과잉 진압 기록"

DEEP_LAYER:
  core_fear: "딸이 자신을 겁쟁이로 볼까봐"
  core_desire: "법이 작동하는 세상을 믿고 싶지만, 믿을 수 없다"
  philosophical_question: "정의를 지키기 위해 법을 어겨야 한다면?"
  ultimate_truth: "그는 여전히 좋은 형사다. 다만 좋은 아버지가 될 수 없었다"
  redemption_or_damnation: |
    만약 범인이 아니라면: 진실을 밝히고 부패한 시스템과 싸움 (구원)
    만약 범인이라면: 딸을 위해 모든 걸 버렸고, 후회하지 않음 (비극적 영웅)
```

**심문 시 드러나는 패턴**:
- 초반: 수사 주도, 다른 용의자 압박, 전문적
- 증거 제시 시: "그건 중요하지 않다" 회피, 딸 언급에 격한 반응
- 압박 시: "법이 뭘 했는데?" → 분노 폭발 → 자제
- 파훼 시: "다시 선택할 수 있어도 같은 길을 갔을 것"

---

### 예시 3: 한수미 (35세, 피해자의 조카) - 사랑과 배신의 화신

```yaml
SURFACE_LAYER:
  visible_role: "피해자의 조카, 상속 예정자, 예술가"
  apparent_personality: "우아하고 교양 있음, 슬픔을 차분히 표현"
  obvious_connection: "유일한 혈육, 재산 상속 1순위"
  first_impression: "슬픔에 잠긴 유족, 상속 동기가 너무 명백해서 오히려 의심스럽지 않음"

HIDDEN_LAYER:
  the_secret:
    what_hiding: "피해자와 15년간 비밀 연인 관계였고, 조카 신분은 위장"
    why_hiding: "근친상간 의혹을 피하고, 법적 상속권 유지하기 위해"
    evidence_trail:
      - "해외 여행 기록: 항상 같은 시기, 다른 도시"
      - "호텔 예약 기록: 다른 이름으로 같은 스위트룸"
      - "피해자의 비밀 계좌: 매달 그녀에게 생활비 송금"
      - "DNA 검사 결과: 실제로는 혈연관계 없음 (입양 가족)"

  real_motive:
    if_guilty: "피해자가 다른 여자와 결혼하려 하자 배신감에 살해"
    emotional_core: "15년 사랑이 거짓이었다는 배신감"
    breaking_point: "결혼 발표 기자회견 날짜를 알게 된 순간"

  inner_conflict:
    duty_vs_desire: "가족 역할 vs 연인으로서의 감정"
    past_trauma: "어린 시절 입양된 후 정체성 혼란"
    moral_dilemma: "사랑이었는가, 이용당한 것인가"

  lies_they_tell:
    - lie: "삼촌을 존경했지만 가까운 사이는 아니었어요"
      truth: "15년간 영혼의 동반자이자 연인이었다"
      why_lie: "관계가 드러나면 상속권 박탈 + 사회적 매장"
      contradiction: "거리를 두었다면서 집 곳곳에 그녀의 물건들"

    - lie: "재산은 중요하지 않아요"
      truth: "재산은 그와의 관계를 증명하는 유일한 것"
      why_lie: "금전 동기로 보이지 않기 위해"
      contradiction: "상속 서류를 이미 변호사와 검토함"

    - lie: "그분의 결혼 소식을 축하했어요"
      truth: "배신감에 미쳐 그를 저주했다"
      why_lie: "살인 동기를 숨기기 위해"
      contradiction: "결혼 상대에 대한 비정상적인 적대감"

DEEP_LAYER:
  core_fear: "자신이 진짜 사랑받은 적이 없다는 진실"
  core_desire: "누군가에게 선택받고 싶었던 어린 시절의 갈망"
  philosophical_question: "비밀 사랑은 진짜 사랑인가, 아니면 감옥인가?"
  ultimate_truth: "그녀는 15년간 조카도, 연인도 아닌 유령으로 살았다"
  redemption_or_damnation: |
    만약 범인이 아니라면: 진실을 밝히고 자유를 얻음 (구원)
    만약 범인이라면: 사랑이 증오로 변하는 순간을 체현 (그리스 비극)
```

**심문 시 드러나는 패턴**:
- 초반: 우아한 슬픔, 완벽한 유족 행동, 협조적
- 증거 제시 시: "오해입니다" → 세밀한 변명 → 감정 누출
- 압박 시: "당신들은 아무것도 모른다" → "사랑이 뭔지 알아?" → 붕괴
- 파훼 시: "15년이 한순간에 무너졌다. 당신이라면 어쩌겠어?"

---

## Part 3: 비자명적 트릭 카탈로그 (Double-Layer Trick System)

### 트릭 설계 원칙

**이중 구조 법칙**:
1. **표면 미스터리** (Surface Mystery): 플레이어가 쉽게 발견하는 겉보기 수수께끼
2. **숨겨진 진실** (Hidden Truth): 실제 트릭의 핵심, 반전
3. **공정한 단서** (Fair Play Clues): 논리적 추론이 가능한 3개 이상의 단서
4. **미스디렉션** (Misdirection): 표면이 진실을 가리는 방법

---

### 트릭 1: 피해자 정체성 트릭 (Identity Swap)

```yaml
TRICK_NAME: "죽은 자는 피해자가 아니었다"

SURFACE_MYSTERY:
  what_appears: "부유한 사업가가 자택에서 독살됨"
  obvious_question: "누가 그를 죽였는가?"
  expected_investigation: "용의자들의 알리바이, 독극물 입수 경로"

HIDDEN_TRUTH:
  actual_trick: "죽은 사람은 피해자의 쌍둥이 형제였고, 진짜 피해자가 범인"
  why_non_obvious: "쌍둥이 존재를 아무도 몰랐고, 피해자가 장례식에서 울고 있음"
  innovation_element: "범인이 피해자 역할을 하며 수사를 방해"

FAIR_PLAY_CLUES:
  clue_1:
    evidence: "피해자의 시계가 왼손에 있음 (평소 오른손)"
    reasoning: "쌍둥이는 반대 손잡이일 가능성"

  clue_2:
    evidence: "최근 해외 송금 기록: 같은 이름 다른 계좌"
    reasoning: "두 사람이 존재했다는 금융 증거"

  clue_3:
    evidence: "부검 결과: 맹장 수술 흔적 (피해자 의료 기록엔 없음)"
    reasoning: "다른 사람의 신체"

  clue_4:
    evidence: "'피해자'가 장례식에서 한 말: '형은 항상 나보다 운이 좋았다'"
    reasoning: "형제 관계 암시, 과거형 사용"

  clue_5:
    evidence: "오래된 가족 사진이 모두 사라짐"
    reasoning: "쌍둥이 존재 증거 인멸"

MISDIRECTION:
  technique: "쌍둥이 형제는 30년 전 부모 이혼 시 분리되어 연락 두절"
  why_it_works: "아무도 그의 과거를 조사하지 않음 (신원 확인 = 얼굴)"
  player_assumption: "울고 있는 사람이 유족일 것이다"

REVEAL_MOMENT:
  trigger: "DNA 검사 요구 or 어린 시절 사진 발견"
  reaction: "피해자(범인)의 붕괴: '형은 모든 걸 가졌다. 이번엔 내 차례다'"

IMPLEMENTATION_NOTES:
  difficulty: "높음 - 의료 기록, DNA 검사 시스템 필요"
  when_to_use: "장편 미스터리, 복잡한 배경 스토리 가능한 경우"
  variant: "쌍둥이 대신 성형수술로 얼굴을 바꾼 경우"
```

---

### 트릭 2: 시간 조작 트릭 (Temporal Distortion)

```yaml
TRICK_NAME: "살인은 이미 24시간 전에 일어났다"

SURFACE_MYSTERY:
  what_appears: "피해자가 오후 9시 파티 중 서재에서 총상으로 발견됨"
  obvious_question: "파티 참석자 중 누가 9시에 그를 쏘았나?"
  expected_investigation: "9시 전후 알리바이, 총소리 목격자"

HIDDEN_TRUTH:
  actual_trick: "피해자는 24시간 전에 이미 사망, 시체를 냉동 보관 후 파티 중 배치"
  why_non_obvious: "부검에서 사망 시각을 정확히 특정 못함 + 따뜻한 서재"
  innovation_element: "범인은 파티에 참석하며 '발견자' 역할"

FAIR_PLAY_CLUES:
  clue_1:
    evidence: "피해자의 혈액이 완전히 응고되지 않음 (부자연스러운 상태)"
    reasoning: "냉동 후 해동 시 혈액 상태 이상"

  clue_2:
    evidence: "서재 온도가 다른 방보다 5도 높음 (난방 과다)"
    reasoning: "시체를 빨리 녹이기 위한 조작"

  clue_3:
    evidence: "피해자가 '당일 아침' 보냈다는 이메일의 IP 추적 → 자동 발송"
    reasoning: "사전에 예약 전송 설정"

  clue_4:
    evidence: "피해자 손톱 밑 조직: 24시간 이상 된 상처"
    reasoning: "사망 시각과 상처 시각 불일치"

  clue_5:
    evidence: "냉동고 전기 사용량 급증 (전날 밤)"
    reasoning: "대형 물체를 급속 냉동"

MISDIRECTION:
  technique: "총소리 목격 증언 조작 (범인이 파티 중 녹음 재생)"
  why_it_works: "모두가 '지금 막 일어난 일'이라고 믿음"
  player_assumption: "사망 시각 = 발견 시각"

REVEAL_MOMENT:
  trigger: "부검의가 '체온 저하 패턴이 이상하다'고 지적"
  reaction: "범인: '완벽한 알리바이였는데... 과학은 거짓말 안 하는구나'"

IMPLEMENTATION_NOTES:
  difficulty: "중간 - 법의학 지식 필요"
  when_to_use: "밀폐된 공간, 파티/이벤트 설정"
  variant: "냉동 대신 약물로 사망 시각 혼란"
```

---

### 트릭 3: 심리 조작 트릭 (Psychological Manipulation)

```yaml
TRICK_NAME: "피해자가 자신을 죽이도록 유도했다"

SURFACE_MYSTERY:
  what_appears: "피해자가 자택에서 독극물을 마시고 사망, 자살로 보임"
  obvious_question: "정말 자살인가, 아니면 위장 살인인가?"
  expected_investigation: "유서 진위, 우울증 여부, 독극물 출처"

HIDDEN_TRUTH:
  actual_trick: "범인이 6개월간 심리 조작으로 피해자를 자살하게 만듦"
  why_non_obvious: "물리적 증거 없음, 범인은 한 번도 독을 만지지 않음"
  innovation_element: "완벽한 범죄 - 법적으로 살인이 아닐 수도"

FAIR_PLAY_CLUES:
  clue_1:
    evidence: "피해자 SNS: 6개월 전부터 특정인(범인)과 매일 대화"
    reasoning: "관계 형성 패턴"

  clue_2:
    evidence: "대화 내용 분석: '너는 쓸모없어', '세상은 너 없이 더 나아' 반복"
    reasoning: "가스라이팅 패턴"

  clue_3:
    evidence: "피해자 검색 기록: '고통 없는 죽음', '독극물 구매' (범인이 피해자 폰으로 검색)"
    reasoning: "생각을 심어줌"

  clue_4:
    evidence: "범인의 심리학 서적 구매 기록: '설득의 심리학', '마인드 컨트롤'"
    reasoning: "범행 준비"

  clue_5:
    evidence: "목격자: '범인이 피해자에게 독극물 정보를 우연히 언급하는 걸 들었다'"
    reasoning: "암시 주입"

MISDIRECTION:
  technique: "범인과 피해자는 '좋은 친구'로 보임, 위로하는 메시지도 보냄"
  why_it_works: "심리 조작은 눈에 보이지 않고, 살인 의도 입증 어려움"
  player_assumption: "자살은 본인 의지, 타인 개입 없음"

REVEAL_MOMENT:
  trigger: "심리학자 NPC가 대화 패턴을 분석 → '전형적인 심리 학대'"
  reaction: "범인: '난 단지 현실을 말했을 뿐. 그가 선택한 거야'"

IMPLEMENTATION_NOTES:
  difficulty: "매우 높음 - 심리학적 타당성 필요"
  when_to_use: "심리 스릴러 분위기, 도덕적 질문 중심 케이스"
  variant: "약물로 판단력 흐리게 한 후 자살 유도"
  legal_question: "이것은 살인인가? (법적 회색지대)"
```

---

### 트릭 4: 물리적 불가능 트릭 (Locked Room Paradox)

```yaml
TRICK_NAME: "밀실에서 피해자는 등 뒤에서 찔렸다"

SURFACE_MYSTERY:
  what_appears: "밀실(안에서 잠긴 방)에서 피해자가 등에 칼을 맞고 사망"
  obvious_question: "어떻게 밀실에서 살인이 가능한가?"
  expected_investigation: "비밀 통로, 창문 침입, 먼 거리 무기"

HIDDEN_TRUTH:
  actual_trick: "피해자는 스스로 등을 찔렀다 (자살), 하지만 타살로 보이게 위장"
  why_non_obvious: "상식적으로 등을 스스로 찌를 수 없다고 생각"
  innovation_element: "특수 제작 장치: 의자 등받이에 칼 고정 + 스프링"

FAIR_PLAY_CLUES:
  clue_1:
    evidence: "피해자 서재에서 발견된 설계도: '자동 장치' 스케치"
    reasoning: "자살 도구 제작 계획"

  clue_2:
    evidence: "의자 등받이에 미세한 금속 긁힘"
    reasoning: "장치가 있었던 흔적"

  clue_3:
    evidence: "피해자 유서 (숨겨진 곳에서 발견): '내 죽음을 살인처럼 보이게 하라'"
    reasoning: "보험금을 가족에게 주기 위한 위장"

  clue_4:
    evidence: "칼의 각도 분석: 정확히 90도 (싸움 중엔 불가능)"
    reasoning: "고정된 칼에 몸을 밀어넣음"

  clue_5:
    evidence: "피해자 손에 작은 리모컨 (장치 작동용)"
    reasoning: "스스로 장치를 작동시킴"

MISDIRECTION:
  technique: "'누가 밀실에 들어갔나'에 집중하게 만듦"
  why_it_works: "밀실 살인 = 외부 범인이라는 고정관념"
  player_assumption: "등을 찌르는 건 타인만 가능"

REVEAL_MOMENT:
  trigger: "설계도와 의자 긁힘을 연결 → 장치 재현 실험"
  reaction: "탐정: '그는 가족을 사랑했다. 너무 사랑해서 죽음마저 선물로 만들었다'"

IMPLEMENTATION_NOTES:
  difficulty: "높음 - 물리적 타당성 검증 필요"
  when_to_use: "클래식 미스터리 오마주, 밀실 트릭 변주"
  variant: "장치 없이 특수 체조/요가 기술로 자해"
  emotional_core: "사랑하는 이를 위한 마지막 거짓말"
```

---

### 트릭 5: 공모 트릭 (Collaborative Conspiracy)

```yaml
TRICK_NAME: "모두가 범인이다 (하지만 아무도 살인하지 않았다)"

SURFACE_MYSTERY:
  what_appears: "파티에서 피해자가 독살됨, 10명의 용의자 모두 동기 있음"
  obvious_question: "10명 중 누가 독을 탔는가?"
  expected_investigation: "각자의 알리바이, 독극물 접근성"

HIDDEN_TRUTH:
  actual_trick: "10명이 모두 공모했지만, 각자 다른 '독'을 탔고 모두 치명적이지 않음. 우연히 조합되어 치사량"
  why_non_obvious: "개별 행동은 살인 의도 없음, 조합 효과 예측 불가"
  innovation_element: "법적으로 누구를 처벌할 것인가? 모두? 아무도?"

FAIR_PLAY_CLUES:
  clue_1:
    evidence: "부검 결과: 5가지 다른 독극물 검출 (단독으론 비치사량)"
    reasoning: "여러 사람이 개입"

  clue_2:
    evidence: "10명의 폰 메시지: 각자 '조금만 아프게 하자'는 내용"
    reasoning: "공모했지만 살인 의도는 없었음"

  clue_3:
    evidence: "약국 구매 기록: 10명이 서로 다른 약국에서 각기 다른 약 구매"
    reasoning: "계획적이지만 분산됨"

  clue_4:
    evidence: "파티 영상: 10명이 각자 다른 시간에 음료에 뭔가를 탐"
    reasoning: "순차적 공모"

  clue_5:
    evidence: "화학자 NPC: '이 조합은 우연히만 치명적. 계획 불가능'"
    reasoning: "의도하지 않은 살인"

MISDIRECTION:
  technique: "단독 범인을 찾게 만듦 (전형적 미스터리 구조)"
  why_it_works: "10명 공모는 비현실적으로 느껴짐"
  player_assumption: "살인 = 한 명의 결정적 행동"

REVEAL_MOMENT:
  trigger: "모든 용의자가 서로를 고발 → 퍼즐 맞춰짐"
  reaction: "검사: '당신들은 모두 유죄다. 하지만 법은 이 경우를 예상 못 했다'"

IMPLEMENTATION_NOTES:
  difficulty: "최고 난도 - 10명 캐릭터 관리 + 화학 지식"
  when_to_use: "대규모 앙상블 캐스트, 도덕적 딜레마 중심"
  variant: "시간차 공격 (각자 다른 날 조금씩 독 투여)"
  philosophical_question: "의도 없는 살인은 살인인가?"

LEGAL_COMPLEXITY:
  individual_guilt: "각자는 폭행죄 수준 (비치사량)"
  collective_guilt: "공모 살인? 과실 치사?"
  jury_question: "누구를 감옥에 보낼 것인가?"
```

---

## Part 4: Gemini 프롬프트 템플릿

### 프롬프트 1: 다층 캐릭터 생성 (Iceberg Character)

```plaintext
# ROLE
당신은 추리 소설 작가이자 캐릭터 설계 전문가입니다.
아가사 크리스티, 히가시노 게이고 수준의 입체적 캐릭터를 만듭니다.

# TASK
다음 캐릭터를 "빙산 모델"로 설계하세요:
- 이름: [이름]
- 나이: [나이]
- 직업/역할: [역할]
- 피해자와의 관계: [관계]

# OUTPUT FORMAT (반드시 이 구조 준수)

## SURFACE LAYER (10% - 첫인상)
- visible_role: [사회적 역할]
- apparent_personality: [겉으로 보이는 성격 3가지]
- obvious_connection: [피해자와의 명백한 관계]
- first_impression: [플레이어가 받을 첫인상]

## HIDDEN LAYER (60% - 조사로 발견)
### The Secret
- what_hiding: [구체적으로 숨기는 사실]
- why_hiding: [숨기는 이유]
- evidence_trail: [발견 가능한 단서 5개, 구체적으로]

### Real Motive (범인일 경우)
- if_guilty: [실제 살인 동기]
- emotional_core: [감정의 핵심]
- breaking_point: [인간 한계를 넘은 순간]

### Inner Conflict
- duty_vs_desire: [의무와 욕망의 충돌]
- past_trauma: [과거 트라우마]
- moral_dilemma: [도덕적 딜레마]

### Lies They Tell (최소 3개)
각 거짓말마다:
- lie: [구체적 거짓말]
- truth: [실제 진실]
- why_lie: [거짓말 이유]
- contradiction: [모순점/약점]

## DEEP LAYER (30% - 최종 반전)
- core_fear: [가장 깊은 두려움]
- core_desire: [진짜 원하는 것]
- philosophical_question: [이 캐릭터가 던지는 철학적 질문]
- ultimate_truth: [궁극적 진실]
- redemption_or_damnation: [범인일 때 vs 아닐 때 결말]

## INTERROGATION PATTERN (심문 시뮬레이션)
- 초반 태도:
- 증거 제시 시 반응:
- 압박 시 반응:
- 파훼 시 마지막 대사:

# QUALITY REQUIREMENTS
1. 비자명성: 겉으로 보이는 동기와 실제 동기가 달라야 함
2. 논리적 일관성: 모든 거짓말에 발각 가능한 모순점 존재
3. 감정적 깊이: 플레이어가 공감하거나 이해할 수 있는 인간성
4. 공정성: 단서가 충분히 제공되어 논리적 추론 가능

# EXAMPLE CHARACTER TRAIT COMBINATIONS (참고용)
- 완벽주의자 + 죄책감 = 자기 파괴적 행동
- 충성심 + 배신당함 = 복수심
- 사랑 + 집착 = 소유욕
- 정의감 + 무력감 = 사적 제재

# CONSTRAINTS
- 스테레오타입 금지 (예: 집사가 항상 범인)
- 동기는 구체적이고 개인적이어야 함
- 비밀은 플레이어가 "그럴 수도 있겠다"고 믿을 만해야 함

생성 시작:
```

**사용법**:
1. [이름], [나이], [역할], [관계]를 채운다
2. Gemini 1.5 Pro (또는 최신 모델) 사용
3. Temperature: 0.8 (창의성과 일관성 균형)
4. 출력된 캐릭터를 검토하고 단서의 발견 가능성 검증

---

### 프롬프트 2: 비자명적 트릭 생성 (Double-Layer Trick)

```plaintext
# ROLE
당신은 본격 미스터리 트릭 설계자입니다.
존 딕슨 카의 밀실 트릭, 애거서 크리스티의 심리 트릭 수준을 만듭니다.

# TASK
다음 조건으로 살인 트릭을 설계하세요:
- 살인 방법: [총기/독극물/둔기/기타]
- 장소: [밀실/공개 장소/파티/기타]
- 난이도: [중간/높음/최고]
- 혁신 요소: [시간/정체성/심리/물리/공모]

# OUTPUT FORMAT

## TRICK NAME
[트릭 이름 - 핵심을 암시하되 직접 드러내지 않음]

## SURFACE MYSTERY (표면 미스터리)
- what_appears: [겉으로 보이는 상황]
- obvious_question: [플레이어가 먼저 묻는 질문]
- expected_investigation: [일반적 수사 방향]

## HIDDEN TRUTH (숨겨진 진실)
- actual_trick: [실제 트릭 메커니즘, 상세히]
- why_non_obvious: [왜 눈치채기 어려운가]
- innovation_element: [이 트릭만의 독창성]

## FAIR PLAY CLUES (공정한 단서 5개 이상)
각 단서마다:
- evidence: [구체적 증거]
- reasoning: [이 증거가 트릭을 밝히는 논리]
- discovery_timing: [언제 발견 가능한가]

## MISDIRECTION (미스디렉션)
- technique: [어떻게 플레이어를 속이는가]
- why_it_works: [왜 효과적인가]
- player_assumption: [플레이어가 가질 잘못된 가정]

## REVEAL MOMENT (진실 공개)
- trigger: [어떤 증거/논리가 트릭을 폭로하는가]
- reaction: [범인의 반응/대사]
- player_satisfaction: [플레이어가 느낄 만족감]

## IMPLEMENTATION NOTES
- difficulty: [구현 난이도]
- required_systems: [필요한 게임 시스템]
- when_to_use: [어떤 상황에 적합한가]
- variant: [변형 가능성]

# QUALITY REQUIREMENTS
1. 공정성: 모든 정보는 조사로 발견 가능해야 함
2. 논리성: 트릭이 물리적/심리적으로 실현 가능해야 함
3. 놀라움: 진실이 밝혀졌을 때 "아!" 하는 순간 제공
4. 새로움: 흔한 트릭의 변주가 아닌 혁신적 요소 포함

# TRICK INNOVATION CHECKLIST
- [ ] 시간 조작: 사망 시각을 속이는가?
- [ ] 정체성 조작: 피해자/범인의 신원을 속이는가?
- [ ] 불가능 범죄: 물리적으로 불가능해 보이는가?
- [ ] 심리 조작: 인간 심리를 이용하는가?
- [ ] 공모/다중범인: 여러 사람이 관련되는가?
- [ ] 역발상: 상식을 뒤집는가?

# FAMOUS TRICK PATTERNS TO AVOID (진부함 방지)
❌ 단순 쌍둥이 트릭 (변주 없음)
❌ 비밀 통로 (너무 흔함)
❌ 단순 독극물 (특별함 없음)
❌ 범인이 수사관 (예측 가능)

✅ 대신 이렇게:
- 쌍둥이 + 성형수술 조합
- 밀실이지만 통로 없이 해결
- 독극물의 예상 밖 작용
- 수사관이지만 다른 이유

# CONSTRAINTS
- 트릭은 현실적으로 가능해야 함 (SF/판타지 요소 금지)
- 단서는 최소 5개, 서로 다른 유형이어야 함
- 미스디렉션은 플레이어를 속이되 불공정하지 않아야 함

생성 시작:
```

**사용법**:
1. 살인 방법, 장소, 난이도, 혁신 요소 지정
2. Gemini 1.5 Pro 사용
3. Temperature: 0.9 (높은 창의성)
4. 생성 후 "FAIR PLAY CLUES" 섹션을 집중 검토 (공정성 검증)

---

### 프롬프트 3: 공정성 검증 (Fair Play Validation)

```plaintext
# ROLE
당신은 미스터리 공정성 검증 전문가입니다.
"탐정이 알고 있는 모든 정보는 독자(플레이어)도 알아야 한다" 원칙을 지킵니다.

# TASK
다음 케이스가 공정한지 검증하고 개선안을 제시하세요.

# INPUT
[여기에 캐릭터 또는 트릭 설계 내용 붙여넣기]

# VALIDATION CRITERIA

## 1. CLUE ACCESSIBILITY (단서 접근성)
각 단서마다 체크:
- [ ] 플레이어가 조사로 발견 가능한가?
- [ ] 발견에 특수 지식이 필요한가? (불공정)
- [ ] 타이밍: 너무 늦게 제공되지 않는가?
- [ ] 명확성: 단서가 너무 애매한가?

판정: PASS / FAIL / NEEDS_IMPROVEMENT
개선안: [구체적 제안]

## 2. LOGICAL DEDUCIBILITY (논리적 추론 가능성)
- [ ] 단서를 조합하면 진실에 도달 가능한가?
- [ ] 논리적 비약이 필요한가? (불공정)
- [ ] 다른 해석이 더 합리적이지 않은가?

추론 체인 검증:
단서 A + 단서 B → 중간 결론 X → 단서 C → 최종 진실

판정: PASS / FAIL / NEEDS_IMPROVEMENT
개선안: [구체적 제안]

## 3. NO HIDDEN INFORMATION (정보 은폐 금지)
- [ ] 탐정(AI)만 아는 정보가 있는가? (불공정)
- [ ] 플레이어가 질문할 방법이 없는 정보인가?
- [ ] 의도적으로 감춘 단서가 있는가?

숨겨진 정보 목록:
- [정보1]: 공개 방법 [제안]
- [정보2]: 공개 방법 [제안]

판정: PASS / FAIL / NEEDS_IMPROVEMENT

## 4. MISDIRECTION FAIRNESS (공정한 미스디렉션)
미스디렉션 vs 사기 구분:
- 공정한 미스디렉션: 정보는 주되, 시선을 다른 곳으로
- 불공정한 사기: 정보 자체를 숨기거나 거짓 정보 제공

현재 미스디렉션 평가:
- 기법: [설명]
- 공정성: FAIR / UNFAIR
- 이유: [설명]

## 5. SURPRISE vs SHOCK (만족스러운 반전)
좋은 반전: "아! 그 단서가 그런 의미였구나!"
나쁜 반전: "그런 정보는 없었잖아!"

현재 반전 평가:
- 플레이어 반응 예측: SATISFYING / FRUSTRATING
- 이유: [설명]

# OUTPUT FORMAT

## VALIDATION SUMMARY
- Overall Fairness Score: [0-100점]
- PASS / FAIL / CONDITIONAL_PASS

## DETAILED FINDINGS
### Strengths (강점)
1. [강점1]
2. [강점2]

### Issues (문제점)
1. [문제1] - 심각도: HIGH/MEDIUM/LOW
2. [문제2] - 심각도: HIGH/MEDIUM/LOW

### Improvements (개선안)
문제1 해결:
- 현재: [문제 설명]
- 개선: [구체적 수정안]
- 새로운 단서: [추가할 단서]

문제2 해결:
- 현재: [문제 설명]
- 개선: [구체적 수정안]

## REVISED VERSION (개선된 버전)
[수정된 캐릭터/트릭 설계, 변경사항 강조]

# EXAMPLES OF FAIR VS UNFAIR

UNFAIR:
- 범인의 쌍둥이 존재를 암시하는 단서가 전혀 없음
- 마지막에 "사실 범인은 왼손잡이였다"는 정보 공개

FAIR:
- 쌍둥이 존재를 암시하는 사진, 진술, 문서가 있음
- 왼손잡이 단서가 초반부터 여러 증거에 존재

검증 시작:
```

**사용법**:
1. 생성된 캐릭터/트릭을 INPUT에 붙여넣기
2. Gemini 1.5 Pro 사용
3. Temperature: 0.3 (객관적 분석)
4. 개선안을 반영하여 재설계

---

## Part 5: 빠른 참조 가이드 (Quick Reference)

### 캐릭터 설계 체크리스트

**기본 요소**:
- [ ] 표면적 역할과 성격 (10%)
- [ ] 숨겨진 비밀과 동기 (60%)
- [ ] 깊은 진실과 철학적 질문 (30%)

**필수 구성**:
- [ ] 최소 3개의 거짓말 (각각 모순점 포함)
- [ ] 최소 5개의 발견 가능한 단서
- [ ] 범인일 때/아닐 때 모두 설득력 있는 스토리

**감정적 깊이**:
- [ ] 공감 가능한 동기 (악당도 이유가 있다)
- [ ] 내적 갈등 (단순 악당 금지)
- [ ] 과거 트라우마와 현재 행동의 연결

**심문 시뮬레이션**:
- [ ] 초반: 차분하고 방어적
- [ ] 중반: 균열 시작 (특정 주제에 과민 반응)
- [ ] 후반: 붕괴 또는 공격적 방어
- [ ] 파훼: 인간적 순간 (분노/슬픔/체념)

---

### 트릭 설계 체크리스트

**혁신성**:
- [ ] 5가지 유형 중 하나: 정체성/시간/심리/물리/공모
- [ ] 기존 트릭의 단순 복제 아님
- [ ] 플레이어가 "생각 못 했다!" 반응 유도

**공정성**:
- [ ] 최소 5개의 발견 가능한 단서
- [ ] 논리적 추론 체인 구성 가능
- [ ] 특수 지식 없이 해결 가능
- [ ] 정보 은폐 없음 (모든 정보 접근 가능)

**실현 가능성**:
- [ ] 물리적으로 가능 (SF/판타지 금지)
- [ ] 심리적으로 타당 (인간 행동 범위 내)
- [ ] 게임 시스템으로 구현 가능

**미스디렉션**:
- [ ] 정보는 제공하되 시선 분산
- [ ] 플레이어 가정을 이용 (하지만 속이지 않음)
- [ ] 표면 미스터리가 진실을 자연스럽게 가림

---

### 공정성 5원칙

1. **단서 접근성**: 플레이어가 조사로 모든 단서 발견 가능
2. **논리적 추론**: 단서 조합으로 진실 도달 가능
3. **정보 투명성**: 탐정이 아는 것 = 플레이어가 알 수 있는 것
4. **공정한 미스디렉션**: 시선 분산 OK, 정보 은폐 NO
5. **만족스러운 반전**: "몰랐던 정보" 아닌 "놓친 의미"

---

### Gemini 프롬프트 사용 플로우

```
1. 캐릭터 생성 프롬프트 실행
   ↓
2. 생성된 캐릭터 검토
   ↓
3. 공정성 검증 프롬프트에 입력
   ↓
4. 개선안 반영하여 수정
   ↓
5. 트릭 생성 프롬프트 실행
   ↓
6. 생성된 트릭 검토
   ↓
7. 공정성 검증 프롬프트에 입력
   ↓
8. 최종 승인된 캐릭터 + 트릭
```

---

### 일반적 실수와 해결책

| 실수 | 문제점 | 해결책 |
|------|--------|--------|
| 단순 동기 | "돈 때문에" | 돈이 상징하는 것 (인정/자유/복수) |
| 일차원 캐릭터 | "나쁜 사람" | 선과 악의 내적 갈등 |
| 불공정 트릭 | 마지막 정보 공개 | 초반부터 단서 배치 |
| 예측 가능 | 명백한 범인 | 이중 미스디렉션 |
| 복잡성 과다 | 이해 불가 | 핵심 1가지에 집중 |

---

### 난이도 조절 가이드

**초급 케이스** (1-2시간):
- 용의자 3-4명
- 캐릭터 깊이: SURFACE + HIDDEN 일부
- 트릭: 단일 층 (표면 = 진실)
- 단서: 명확하고 직접적

**중급 케이스** (2-4시간):
- 용의자 5-7명
- 캐릭터 깊이: 완전한 HIDDEN 층
- 트릭: 이중 구조 (표면 + 숨겨진 진실)
- 단서: 조합 필요, 일부 애매함

**고급 케이스** (4-6시간):
- 용의자 7-10명
- 캐릭터 깊이: DEEP 층까지 완전 구현
- 트릭: 삼중 반전 또는 공모
- 단서: 복잡한 추론 체인 필요

---

## Part 6: 실전 적용 예시

### 케이스 생성 워크플로우

**1단계: 컨셉 결정**
```
주제: "완벽한 가족의 비밀"
피해자: 성공한 가장
장소: 대저택 파티
트릭 유형: 정체성 + 시간 조작
```

**2단계: 캐릭터 생성** (프롬프트 1 사용)
- 배우자: 표면상 슬픈 유족, 실제론 비밀 연인
- 자녀: 표면상 효자, 실제론 빚 때문에 살해 음모
- 비서: 표면상 충직, 실제론 과거 피해자

**3단계: 트릭 설계** (프롬프트 2 사용)
- 표면: 파티 중 독살
- 진실: 24시간 전 이미 사망, 시체 조작

**4단계: 공정성 검증** (프롬프트 3 사용)
- 문제점 발견: 시체 조작 단서 부족
- 개선: 체온계 기록, 냉동고 전기 사용량, 피부 색 이상

**5단계: 최종 통합**
- 캐릭터별 트릭 연관성 확인
- 단서 배치 타임라인 작성
- 플레이테스트 시뮬레이션

---

### 캐릭터-트릭 연결 매트릭스

| 캐릭터 | 트릭 기여 | 알리바이 | 비밀 |
|--------|----------|----------|------|
| 배우자 | 시체 이동 담당 | 파티 참석 | 비밀 연인 |
| 자녀 | 냉동 보관 제안 | 출장 중 (거짓) | 거액 빚 |
| 비서 | 시간 조작 계획 | 집에 있었다 (거짓) | 과거 피해 |

---

## 마무리: 핵심 원칙

### 캐릭터는 빙산
- **10%**: 플레이어가 본다
- **60%**: 플레이어가 조사로 발견한다
- **30%**: 플레이어가 반전에서 깨닫는다

### 트릭은 이중 구조
- **표면**: 명백한 미스터리 (누가?)
- **진실**: 숨겨진 메커니즘 (어떻게?)
- **단서**: 연결하는 다리 (왜?)

### 공정성은 신뢰
- 플레이어를 존중한다 = 정보를 준다
- 어렵게 만든다 ≠ 정보를 숨긴다
- 좋은 미스터리 = "놓쳤구나" / 나쁜 미스터리 = "알 수 없었어"

---

**END OF DOCUMENT**

**Version**: 1.0
**Total Sections**: 6
**Character Examples**: 3
**Trick Examples**: 5
**Prompts**: 3
**Token Count**: ~15,000

**Usage**: 이 문서를 기반으로 Gemini 프롬프트를 실행하여 깊이 있는 캐릭터와 예측 불가능한 트릭을 생성하세요.
