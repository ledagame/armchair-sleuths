# Evidence Types Library

증거 타입별 특성, 예시, 생성 가이드를 제공하는 라이브러리입니다.

## Evidence Type Categories

### 1. Critical Evidence (결정적 증거)

**정의**: 범인을 특정하는 데 필수적인 증거. 이 증거 없이는 범인을 확신할 수 없음.

**특성**:
- 범인과 직접적으로 연결됨
- 알리바이를 깨뜨리거나 범행을 입증함
- 다른 증거와 결합하여 결정적 추리를 가능하게 함
- Fair Play 원칙: 최소 Thorough Search로 발견 가능해야 함

**예시**:

```typescript
// 예시 1: 지문 증거
{
  name: "칼날에 남은 지문",
  description: "살인 무기로 사용된 칼날에서 채취한 지문. 데이터베이스 대조 결과 용의자 A의 지문과 일치함.",
  type: "critical",
  discoveryDifficulty: "medium",
  relatedSuspect: "suspect_A",
  discoveryProbability: {
    quick: 0.3,
    thorough: 0.8,
    exhaustive: 1.0
  },
  imagePrompt: "Close-up forensic photograph of a knife blade with fingerprint dusting powder, clear fingerprint visible, evidence tag #47, white background"
}

// 예시 2: 독극물 증거
{
  name: "피해자의 와인잔에서 검출된 청산가리",
  description: "피해자가 마지막으로 마신 와인잔에서 치사량의 청산가리가 검출됨. 용의자 B의 약국에서 동일한 청산가리가 도난 신고됨.",
  type: "critical",
  discoveryDifficulty: "obvious",
  relatedSuspect: "suspect_B",
  discoveryProbability: {
    quick: 0.7,
    thorough: 0.95,
    exhaustive: 1.0
  }
}

// 예시 3: 목격 증거
{
  name: "범행 시각의 CCTV 영상",
  description: "범행 추정 시각 22:47에 용의자 C가 피해자의 방으로 들어가는 모습이 CCTV에 명확히 기록됨.",
  type: "critical",
  discoveryDifficulty: "hidden",
  relatedSuspect: "suspect_C",
  discoveryProbability: {
    quick: 0.1,
    thorough: 0.6,
    exhaustive: 0.9
  }
}
```

**생성 가이드**:
- 범인을 특정할 수 있는 유일한 증거여야 함
- 과학적으로 검증 가능한 증거 (지문, DNA, 독극물 등)
- 시간과 장소를 특정하는 증거 (CCTV, 목격, 알리바이 파괴)
- 난이도별 최소 개수:
  - Easy: 3개
  - Medium: 4개
  - Hard: 5개
  - Legendary: 6개

---

### 2. Supporting Evidence (뒷받침 증거)

**정의**: 단독으로는 범인을 특정할 수 없지만, 결정적 증거와 결합하여 추리를 강화하는 증거.

**특성**:
- 범행 동기, 수단, 기회를 뒷받침
- 여러 증거를 연결하는 역할
- 용의자의 행동 패턴이나 관계를 드러냄
- 다양한 발견 난이도 가능

**예시**:

```typescript
// 예시 1: 동기 관련 증거
{
  name: "피해자와 용의자 A의 재산 분쟁 소송 기록",
  description: "2개월 전부터 진행 중인 유산 상속 소송. 용의자 A가 패소할 경우 20억원 상당의 재산을 잃을 상황이었음.",
  type: "supporting",
  discoveryDifficulty: "medium",
  relatedSuspect: "suspect_A",
  discoveryProbability: {
    quick: 0.4,
    thorough: 0.75,
    exhaustive: 0.95
  }
}

// 예시 2: 수단 관련 증거
{
  name: "용의자 B의 서랍에서 발견된 독극물 구매 영수증",
  description: "3일 전 인터넷 암시장에서 청산가리를 구매한 기록. 용의자 B의 명의로 결제됨.",
  type: "supporting",
  discoveryDifficulty: "hidden",
  relatedSuspect: "suspect_B",
  discoveryProbability: {
    quick: 0.2,
    thorough: 0.5,
    exhaustive: 0.85
  }
}

// 예시 3: 기회 관련 증거
{
  name: "용의자 C의 출입 카드 기록",
  description: "범행 당일 22:30에 피해자의 건물에 출입한 기록. 용의자 C는 이 시간대의 방문을 부인했음.",
  type: "supporting",
  discoveryDifficulty: "obvious",
  relatedSuspect: "suspect_C",
  discoveryProbability: {
    quick: 0.6,
    thorough: 0.9,
    exhaustive: 1.0
  }
}

// 예시 4: 관계 증거
{
  name: "피해자의 일기장",
  description: "피해자가 최근 용의자 A와의 갈등에 대해 기록한 일기. '더 이상 참을 수 없다. 변호사와 상담해야겠다'는 내용.",
  type: "supporting",
  discoveryDifficulty: "medium",
  relatedSuspect: "suspect_A",
  discoveryProbability: {
    quick: 0.3,
    thorough: 0.7,
    exhaustive: 0.95
  }
}
```

**생성 가이드**:
- 동기(Why), 수단(How), 기회(When) 중 하나를 뒷받침
- 결정적 증거와 논리적으로 연결되어야 함
- 40% 정도를 차지 (전체 증거의 가장 큰 비율)
- 다양한 발견 난이도로 분산 배치

---

### 3. Red Herring (미끼 증거)

**정의**: 무고한 용의자를 범인으로 의심하게 만드는 오해의 여지가 있는 증거. 반드시 논리적 설명이 가능해야 함.

**특성**:
- 무고한 용의자와 연관됨
- 표면적으로는 유죄를 암시하지만 합리적 설명이 있음
- 플레이어의 추리를 시험하는 역할
- Fair Play 원칙: 다른 증거로 반박 가능해야 함

**예시**:

```typescript
// 예시 1: 오해의 여지가 있는 물리적 증거
{
  name: "무고한 용의자 X의 지갑에서 발견된 피해자의 열쇠",
  description: "용의자 X의 지갑에서 피해자 집의 열쇠가 발견됨. 범행에 사용된 것처럼 보이지만...",
  type: "red_herring",
  discoveryDifficulty: "obvious",
  relatedSuspect: "innocent_suspect_X",
  logicalExplanation: "피해자가 여행 가기 전에 화분에 물을 주러 와달라며 열쇠를 맡겼음. 용의자 X의 문자 기록으로 확인 가능.",
  discoveryProbability: {
    quick: 0.7,
    thorough: 0.95,
    exhaustive: 1.0
  }
}

// 예시 2: 오해의 여지가 있는 목격 증거
{
  name: "범행 시각 근처에서 무고한 용의자 Y가 피해자 집 근처에서 목격됨",
  description: "이웃이 22:40경 용의자 Y가 피해자 집 앞을 서성이는 것을 목격함. 범행 추정 시각 7분 전.",
  type: "red_herring",
  discoveryDifficulty: "medium",
  relatedSuspect: "innocent_suspect_Y",
  logicalExplanation: "용의자 Y는 근처 편의점에 담배를 사러 갔다가 우연히 지나갔음. 편의점 CCTV와 영수증으로 확인 가능.",
  discoveryProbability: {
    quick: 0.5,
    thorough: 0.8,
    exhaustive: 0.95
  }
}

// 예시 3: 오해의 여지가 있는 관계 증거
{
  name: "무고한 용의자 Z와 피해자의 격렬한 말다툼 목격 기록",
  description: "범행 2일 전, 용의자 Z와 피해자가 회사에서 크게 다툰 것을 여러 동료가 목격함. '죽여버리겠다'는 말까지 들었다고 증언.",
  type: "red_herring",
  discoveryDifficulty: "obvious",
  relatedSuspect: "innocent_suspect_Z",
  logicalExplanation: "프로젝트 마감 스트레스로 인한 일시적 감정 폭발. 당일 저녁 화해하고 함께 저녁 식사를 함. 레스토랑 예약 기록으로 확인 가능.",
  discoveryProbability: {
    quick: 0.8,
    thorough: 0.95,
    exhaustive: 1.0
  }
}

// 예시 4: 오해의 여지가 있는 과학적 증거
{
  name: "무고한 용의자 W의 옷에서 피해자의 DNA 발견",
  description: "용의자 W의 재킷에서 피해자의 머리카락과 피부 세포가 검출됨. 범행과의 연관성이 의심됨.",
  type: "red_herring",
  discoveryDifficulty: "hidden",
  relatedSuspect: "innocent_suspect_W",
  logicalExplanation: "용의자 W는 피해자의 자동차를 빌려 탔음. 범행 전날 함께 드라이브를 갔고, 그때 자연스럽게 DNA가 묻었음. 차량 대여 기록 존재.",
  discoveryProbability: {
    quick: 0.3,
    thorough: 0.6,
    exhaustive: 0.9
  }
}
```

**생성 가이드**:
- 반드시 논리적 설명(logicalExplanation)을 함께 제공
- 무고한 용의자를 가리켜야 함 (범인은 안 됨)
- 최대 30%를 넘지 않도록 제한
- 플레이어가 다른 증거로 반박할 수 있어야 함
- 난이도별 최대 개수:
  - Easy: 2개
  - Medium: 4개
  - Hard: 5개
  - Legendary: 6개

**Red Herring 설계 원칙**:
1. **Plausible Deception**: 처음에는 유죄를 강하게 암시해야 함
2. **Logical Rebuttal**: 다른 증거나 정보로 반박 가능해야 함
3. **Fair Misdirection**: 플레이어를 속이되, 나중에 "당연히 그럴 수밖에 없었네"라고 느끼게 해야 함
4. **No Arbitrary**: 완전히 무관하거나 설명 불가능한 증거는 안 됨

---

## Evidence Discovery Difficulty Mapping

### Obvious (명백한 증거)

**특성**:
- 장소에 들어가자마자 눈에 띔
- Quick Search로도 높은 확률로 발견
- 초보 탐정도 쉽게 발견 가능

**예시**:
- 바닥에 떨어진 칼
- 책상 위의 협박 편지
- 깨진 와인잔
- 벽에 튄 핏자국

**발견 확률**:
```typescript
{
  quick: 0.7-0.9,
  thorough: 0.95-1.0,
  exhaustive: 1.0
}
```

### Medium (중간 난이도 증거)

**특성**:
- 주의 깊게 살펴야 발견 가능
- Quick Search로는 발견하기 어려움
- Thorough Search로 높은 확률 발견

**예시**:
- 서랍 안의 영수증
- 책장 뒤에 숨겨진 편지
- 휴지통에 버려진 메모
- 옷장 안의 옷에 묻은 얼룩

**발견 확률**:
```typescript
{
  quick: 0.3-0.5,
  thorough: 0.7-0.9,
  exhaustive: 0.95-1.0
}
```

### Hidden (숨겨진 증거)

**특성**:
- 매우 철저한 수사가 필요
- Exhaustive Search로만 높은 확률 발견
- 숙련된 탐정만 발견 가능

**예시**:
- 이중 바닥 서랍 안의 문서
- 액자 뒤에 숨겨진 열쇠
- 삭제된 컴퓨터 파일 (복구 필요)
- 암호화된 일기장

**발견 확률**:
```typescript
{
  quick: 0.1-0.2,
  thorough: 0.5-0.7,
  exhaustive: 0.85-0.95
}
```

---

## Evidence-Suspect Connection Patterns

### Pattern 1: Direct Incrimination (직접 연결)
범인과 직접적으로 연결되는 증거 패턴

```typescript
{
  pattern: "direct_incrimination",
  examples: [
    "범인의 지문이 살인 무기에 남음",
    "범인의 DNA가 범행 현장에서 발견됨",
    "범인이 범행 시각에 현장에 있었다는 CCTV 증거"
  ],
  evidenceType: "critical",
  strength: "very_strong"
}
```

### Pattern 2: Motive Evidence (동기 증거)
범행 동기를 드러내는 증거 패턴

```typescript
{
  pattern: "motive_evidence",
  examples: [
    "재산 상속 분쟁 소송 기록",
    "피해자에게 협박당한 증거",
    "배신당한 사실을 알게 된 증거"
  ],
  evidenceType: "supporting",
  strength: "medium"
}
```

### Pattern 3: Means Evidence (수단 증거)
범행 수단을 입증하는 증거 패턴

```typescript
{
  pattern: "means_evidence",
  examples: [
    "독극물 구매 기록",
    "살인 무기 소유 증거",
    "범행 도구 제작 기록"
  ],
  evidenceType: "supporting",
  strength: "strong"
}
```

### Pattern 4: Opportunity Evidence (기회 증거)
범행 기회를 입증하는 증거 패턴

```typescript
{
  pattern: "opportunity_evidence",
  examples: [
    "범행 시각의 출입 기록",
    "알리바이 거짓 증명",
    "범행 현장 접근 가능성 입증"
  ],
  evidenceType: "supporting",
  strength: "strong"
}
```

### Pattern 5: Contradiction Evidence (모순 증거)
용의자의 진술과 모순되는 증거 패턴

```typescript
{
  pattern: "contradiction_evidence",
  examples: [
    "용의자가 부인한 만남의 증거",
    "거짓 알리바이 폭로",
    "은폐 시도의 증거"
  ],
  evidenceType: "supporting" | "critical",
  strength: "strong"
}
```

---

## Evidence Generation Workflow

### Step 1: 난이도 및 범인 결정
```typescript
const difficulty = 'medium';
const guiltySuspect = suspects[1]; // 범인 용의자 선택
```

### Step 2: 증거 개수 및 분포 결정
```typescript
const config = DIFFICULTY_EVIDENCE_CONFIG[difficulty];
const totalEvidence = randomInt(config.totalEvidence.min, config.totalEvidence.max);

const evidenceDistribution = {
  critical: Math.max(config.criticalMinimum, Math.ceil(totalEvidence * 0.3)),
  supporting: Math.ceil(totalEvidence * 0.4),
  redHerring: Math.min(config.redHerringMaximum, Math.floor(totalEvidence * 0.3))
};
```

### Step 3: 결정적 증거 생성 (범인 연결)
```typescript
const criticalEvidence: Evidence[] = [
  {
    name: "범인의 지문이 찍힌 살인 무기",
    type: "critical",
    discoveryDifficulty: "medium",
    relatedSuspect: guiltySuspect.id,
    discoveryProbability: { quick: 0.3, thorough: 0.8, exhaustive: 1.0 }
  },
  // ... 나머지 결정적 증거
];
```

### Step 4: 뒷받침 증거 생성 (동기, 수단, 기회)
```typescript
const supportingEvidence: Evidence[] = [
  {
    name: "범인과 피해자의 재산 분쟁 기록",
    type: "supporting",
    discoveryDifficulty: "medium",
    relatedSuspect: guiltySuspect.id
  },
  // ... 나머지 뒷받침 증거
];
```

### Step 5: Red Herring 생성 (무고한 용의자 연결)
```typescript
const innocentSuspects = suspects.filter(s => s.id !== guiltySuspect.id);
const redHerrings: Evidence[] = innocentSuspects.map(suspect => ({
  name: `${suspect.name}을 의심하게 만드는 증거`,
  type: "red_herring",
  discoveryDifficulty: "obvious",
  relatedSuspect: suspect.id,
  logicalExplanation: "합리적인 설명..."
}));
```

### Step 6: Fair Play 검증
```typescript
const validation = validateFairPlay(
  [...criticalEvidence, ...supportingEvidence, ...redHerrings],
  difficulty
);

if (!validation.isValid) {
  throw new Error(`Fair Play violation: ${validation.errors.join(', ')}`);
}
```

---

## Best Practices

1. **Critical Evidence First**: 항상 결정적 증거부터 생성하고, 범인과 명확히 연결
2. **Distribution Balance**: 30% Critical, 40% Supporting, 30% Red Herring 비율 유지
3. **Difficulty Consistency**: 난이도 설정과 발견 확률이 일치하도록 보장
4. **Logical Red Herrings**: Red herring은 반드시 논리적 설명과 함께 생성
5. **Fair Play Validation**: 모든 증거 생성 후 Fair Play 원칙 검증 필수
6. **Evidence Variety**: 다양한 증거 타입 (물리적, 디지털, 목격, 과학적) 혼합
7. **Progressive Discovery**: 쉬운 증거부터 어려운 증거까지 적절히 분산 배치

---

**참조**:
- `SKILL.md` - Evidence System Architect
- `fair-play-checklist.md` - Fair Play 검증 가이드
- `difficulty-configs.md` - 난이도별 설정
