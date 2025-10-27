# Fair Play Checklist

증거 시스템에서 Fair Play 원칙을 준수하는지 검증하는 체크리스트입니다.

## Fair Play 10 Commandments (공정한 미스터리의 10계명)

Ronald Knox의 10계명을 현대적으로 재해석한 증거 시스템 Fair Play 원칙

### 1. All Evidence Must Be Accessible (모든 증거는 접근 가능해야 함)

**원칙**: 플레이어가 게임 내 메커니즘으로 모든 증거를 발견할 수 있어야 함

**검증 항목**:
- [ ] 모든 증거가 장소에 배치되어 있는가?
- [ ] 모든 증거가 최소한 Exhaustive Search로 발견 가능한가?
- [ ] 결정적 증거는 Thorough Search로 70% 이상 발견 가능한가?
- [ ] 특정 도구나 스킬 없이도 발견 가능한가?
- [ ] 시간 제한이나 이벤트에 의존하지 않는가?

**위반 예시**:
```typescript
❌ BAD: 증거가 플레이어가 접근할 수 없는 장소에 있음
{
  name: "결정적 증거",
  location: "locked_room_without_key",
  discoveryProbability: { quick: 0, thorough: 0, exhaustive: 0 }
}

✅ GOOD: 모든 증거가 접근 가능한 장소에 있음
{
  name: "결정적 증거",
  location: "crime_scene",
  discoveryProbability: { quick: 0.3, thorough: 0.7, exhaustive: 0.95 }
}
```

---

### 2. No Secret Information (비밀 정보 금지)

**원칙**: 작가(AI)가 플레이어에게 숨긴 정보로 해결책을 만들면 안 됨

**검증 항목**:
- [ ] 범인의 정체를 밝히는 데 필요한 모든 정보가 증거로 존재하는가?
- [ ] AI가 생성한 배경 정보가 증거로 제공되었는가?
- [ ] 용의자 심문으로 얻을 수 없는 결정적 정보가 증거로 있는가?
- [ ] 플레이어가 접근할 수 없는 "작가만 아는 설정"이 없는가?

**위반 예시**:
```typescript
❌ BAD: 범인의 동기가 증거로 제공되지 않음
{
  solution: {
    who: "용의자 A",
    why: "피해자가 용의자 A의 비밀을 알고 있었기 때문" // 이 "비밀"이 증거로 없음
  }
}

✅ GOOD: 모든 동기가 증거로 존재
{
  evidence: [
    {
      name: "용의자 A의 범죄 기록",
      description: "피해자가 용의자 A의 과거 횡령 사실을 알고 있었다는 증거"
    }
  ],
  solution: {
    who: "용의자 A",
    why: "횡령 사실이 드러날까 두려워서"
  }
}
```

---

### 3. No Supernatural Solutions (초자연적 해결책 금지)

**원칙**: 증거와 추리는 현실적이고 과학적으로 가능해야 함

**검증 항목**:
- [ ] 모든 증거가 현실 세계에서 가능한가?
- [ ] 살인 방법이 과학적으로 가능한가?
- [ ] 증거 발견 메커니즘이 현실적인가?
- [ ] 우연이나 운에 의존하지 않는가?

**위반 예시**:
```typescript
❌ BAD: 초자연적 증거
{
  name: "피해자의 유령이 남긴 메시지",
  type: "critical"
}

❌ BAD: 불가능한 과학적 증거
{
  name: "DNA 검사 결과 (5분 만에 완료)",
  type: "critical"
}

✅ GOOD: 현실적인 증거
{
  name: "피해자가 죽기 전 남긴 메모",
  type: "critical"
}

✅ GOOD: 가능한 과학적 증거
{
  name: "DNA 검사 결과 (법의학 연구소 분석)",
  type: "critical",
  note: "분석에 24시간 소요됨 (현실적)"
}
```

---

### 4. No Unmentioned Poisons (언급되지 않은 독극물 금지)

**원칙**: 살인에 사용된 수단은 반드시 증거로 발견 가능해야 함

**검증 항목**:
- [ ] 살인 무기/수단이 증거로 존재하는가?
- [ ] 독극물이 사용되었다면 독극물 증거가 있는가?
- [ ] 살인 방법을 입증하는 증거가 있는가?
- [ ] 무기/수단의 출처를 추적할 수 있는 증거가 있는가?

**위반 예시**:
```typescript
❌ BAD: 독극물이 증거로 없음
{
  solution: {
    how: "청산가리로 독살함"
  },
  evidence: [] // 청산가리 관련 증거가 전혀 없음
}

✅ GOOD: 독극물과 관련된 모든 증거 존재
{
  evidence: [
    {
      name: "청산가리가 든 와인잔",
      type: "critical"
    },
    {
      name: "용의자 A의 청산가리 구매 기록",
      type: "supporting"
    },
    {
      name: "피해자의 시신에서 검출된 청산가리",
      type: "critical"
    }
  ],
  solution: {
    how: "와인에 청산가리를 타서 독살함"
  }
}
```

---

### 5. Guilty Suspect Must Be Determinable (범인은 특정 가능해야 함)

**원칙**: 수집한 증거로 범인을 명확히 특정할 수 있어야 함

**검증 항목**:
- [ ] 범인을 가리키는 결정적 증거가 최소 3개 이상인가?
- [ ] 무고한 용의자를 제외할 수 있는 증거가 있는가?
- [ ] 여러 증거를 종합하면 범인이 명확해지는가?
- [ ] 범인만이 범행이 가능했다는 증거가 있는가?

**위반 예시**:
```typescript
❌ BAD: 여러 용의자 모두 범인일 가능성
{
  evidence: [
    { name: "A의 지문", type: "critical", relatedSuspect: "A" },
    { name: "B의 DNA", type: "critical", relatedSuspect: "B" },
    { name: "C의 목격", type: "critical", relatedSuspect: "C" }
  ]
  // A, B, C 모두 범인일 수 있어 특정 불가능
}

✅ GOOD: 범인을 명확히 특정 가능
{
  evidence: [
    { name: "A의 지문 (살인 무기)", type: "critical", relatedSuspect: "A" },
    { name: "A의 독극물 구매 기록", type: "critical", relatedSuspect: "A" },
    { name: "A의 범행 시각 CCTV", type: "critical", relatedSuspect: "A" },
    { name: "B의 알리바이 (다른 곳에 있었음)", type: "supporting" },
    { name: "C의 알리바이 (다른 곳에 있었음)", type: "supporting" }
  ]
  // 오직 A만 범인으로 특정 가능
}
```

---

### 6. Critical Evidence Discoverability (결정적 증거는 발견 가능해야 함)

**원칙**: 범인을 특정하는 결정적 증거는 합리적인 탐색으로 발견 가능해야 함

**검증 항목**:
- [ ] 모든 결정적 증거가 Thorough Search로 최소 60% 이상 발견 가능한가?
- [ ] Easy 난이도에서는 결정적 증거 중 일부가 Obvious인가?
- [ ] 결정적 증거가 특정 장소에 몰려있지 않고 분산되어 있는가?
- [ ] 결정적 증거 발견에 운이나 랜덤 요소에 과도하게 의존하지 않는가?

**난이도별 요구사항**:
```typescript
const CRITICAL_EVIDENCE_REQUIREMENTS = {
  easy: {
    minimumCount: 3,
    thoroughDiscoverability: 0.80,  // 80% 이상
    obviousCount: 2                  // 최소 2개는 Obvious
  },
  medium: {
    minimumCount: 4,
    thoroughDiscoverability: 0.70,  // 70% 이상
    obviousCount: 1                  // 최소 1개는 Obvious
  },
  hard: {
    minimumCount: 5,
    thoroughDiscoverability: 0.60,  // 60% 이상
    obviousCount: 0                  // Obvious 없어도 됨
  },
  legendary: {
    minimumCount: 6,
    thoroughDiscoverability: 0.55,  // 55% 이상
    obviousCount: 0
  }
};
```

---

### 7. Red Herrings Must Have Logical Explanations (미끼 증거는 논리적 설명이 있어야 함)

**원칙**: Red herring은 나중에 합리적으로 설명 가능해야 함

**검증 항목**:
- [ ] 모든 Red herring에 logicalExplanation이 있는가?
- [ ] 설명이 억지스럽지 않고 합리적인가?
- [ ] 다른 증거로 Red herring을 반박할 수 있는가?
- [ ] Red herring이 전체 증거의 30%를 넘지 않는가?

**위반 예시**:
```typescript
❌ BAD: 설명 불가능한 Red herring
{
  name: "무고한 용의자 B의 집에서 발견된 피묻은 칼",
  type: "red_herring",
  // logicalExplanation 없음 - 왜 B의 집에 피묻은 칼이 있는지 설명 불가
}

❌ BAD: 억지 설명
{
  name: "무고한 용의자 B의 집에서 발견된 피묻은 칼",
  type: "red_herring",
  logicalExplanation: "우연히 그곳에 있었음" // 너무 억지스러움
}

✅ GOOD: 논리적 설명
{
  name: "무고한 용의자 B의 집에서 발견된 피묻은 칼",
  type: "red_herring",
  relatedSuspect: "suspect_B",
  logicalExplanation: "용의자 B는 요리사이며, 전날 스테이크를 자르다가 손을 베었음. 칼의 피는 용의자 B 자신의 것으로 DNA 검사로 확인 가능.",
  refutingEvidence: [
    "DNA 검사 결과 (B 본인의 피)",
    "병원 진료 기록 (전날 손가락 부상 치료)"
  ]
}
```

---

### 8. Evidence Distribution Must Be Balanced (증거 분포는 균형있어야 함)

**원칙**: 증거가 특정 장소나 용의자에게 과도하게 몰리면 안 됨

**검증 항목**:
- [ ] 각 장소에 최소 1-2개 이상의 증거가 있는가?
- [ ] 한 장소에 모든 결정적 증거가 몰려있지 않은가?
- [ ] 각 용의자에 대한 증거가 적절히 분산되어 있는가?
- [ ] 범인 관련 증거가 전체의 50%를 넘지 않는가?

**위반 예시**:
```typescript
❌ BAD: 증거가 한 장소에 몰림
{
  locations: [
    {
      name: "범행 현장",
      evidenceCount: 12  // 전체 12개 중 12개 모두 여기에
    },
    {
      name: "피해자의 집",
      evidenceCount: 0   // 증거 없음
    },
    {
      name: "용의자 A의 집",
      evidenceCount: 0   // 증거 없음
    }
  ]
}

✅ GOOD: 증거가 균등 분산
{
  locations: [
    {
      name: "범행 현장",
      evidenceCount: 4,
      criticalEvidence: 2
    },
    {
      name: "피해자의 집",
      evidenceCount: 4,
      criticalEvidence: 1
    },
    {
      name: "용의자 A의 집",
      evidenceCount: 4,
      criticalEvidence: 1
    }
  ]
}
```

---

### 9. Timeline Must Be Consistent (타임라인은 일관성 있어야 함)

**원칙**: 증거가 가리키는 시간적 순서가 논리적으로 일치해야 함

**검증 항목**:
- [ ] 범행 시각이 명확한가?
- [ ] 모든 증거의 시간이 타임라인과 일치하는가?
- [ ] 용의자의 알리바이 시간이 증거와 모순되지 않는가?
- [ ] 증거 발견 순서가 논리적인가?

**위반 예시**:
```typescript
❌ BAD: 타임라인 모순
{
  evidence: [
    {
      name: "CCTV (용의자 A가 22:00에 출입)",
      type: "critical"
    },
    {
      name: "알리바이 (용의자 A가 22:00에 다른 곳에 있었음)",
      type: "supporting"
    }
  ]
  // 같은 시각에 두 곳에 있을 수 없음 - 모순
}

✅ GOOD: 일관된 타임라인
{
  timeline: {
    crimeTime: "22:00",
    events: [
      { time: "21:45", event: "용의자 A가 피해자 집 도착 (CCTV)" },
      { time: "21:50-22:00", event: "용의자 A와 피해자 대화 (이웃 증언)" },
      { time: "22:00", event: "범행 발생 (법의학 추정)" },
      { time: "22:10", event: "용의자 A가 피해자 집 출발 (CCTV)" }
    ]
  },
  evidence: [
    {
      name: "CCTV (21:45 출입, 22:10 퇴장)",
      type: "critical",
      timestamp: "21:45-22:10"
    },
    {
      name: "이웃 목격 (21:50-22:00 대화 소리)",
      type: "supporting",
      timestamp: "21:50-22:00"
    }
  ]
}
```

---

### 10. No Deus Ex Machina (기계신 금지)

**원칙**: 갑작스러운 새로운 증거나 정보로 해결하면 안 됨

**검증 항목**:
- [ ] 모든 증거가 케이스 생성 시 함께 생성되었는가?
- [ ] 플레이어가 추리 중 갑자기 나타나는 증거가 없는가?
- [ ] 최종 해결에 필요한 모든 증거가 처음부터 존재하는가?
- [ ] AI가 플레이어의 실패를 구제하기 위해 증거를 추가하지 않는가?

**위반 예시**:
```typescript
❌ BAD: 갑자기 나타나는 증거
{
  initialEvidence: [
    // 증거 1-10
  ],
  // 플레이어가 막혔을 때 갑자기 추가되는 증거
  lateEvidence: {
    name: "결정적 증거 (플레이어가 막혔을 때만 등장)",
    type: "critical",
    appearCondition: "player_stuck"
  }
}

✅ GOOD: 모든 증거가 처음부터 존재
{
  evidence: [
    // 모든 증거 (결정적 증거 포함) 케이스 생성 시 함께 생성
  ],
  hintSystem: {
    // 증거를 추가하지 않고, 기존 증거에 대한 힌트만 제공
    hints: [
      "서재를 더 철저히 탐색해보세요 (Thorough Search)",
      "용의자 A의 진술과 CCTV 시간을 비교해보세요"
    ]
  }
}
```

---

## Comprehensive Fair Play Validation

### Pre-Generation Checklist

케이스 생성 전 체크리스트

```typescript
interface FairPlayPreValidation {
  // 1. 난이도 설정 검증
  difficultyConfigValid: boolean;

  // 2. 증거 개수 요구사항
  minimumCriticalEvidence: number;
  minimumTotalEvidence: number;
  maximumRedHerrings: number;

  // 3. 발견 확률 요구사항
  criticalEvidenceDiscoverability: number; // Thorough로 최소 N% 이상

  // 4. 장소 요구사항
  minimumLocations: number;
  crimeSceneRequired: boolean;
}

function preValidateFairPlay(config: DifficultyConfig): FairPlayPreValidation {
  return {
    difficultyConfigValid: validateDifficultyConfig(config).isValid,
    minimumCriticalEvidence: config.fairPlay.criticalMinimum,
    minimumTotalEvidence: config.fairPlay.totalEvidenceMinimum,
    maximumRedHerrings: config.fairPlay.redHerringMaximum,
    criticalEvidenceDiscoverability: config.fairPlay.criticalDiscoverability,
    minimumLocations: config.locations.count,
    crimeSceneRequired: true
  };
}
```

### Post-Generation Checklist

케이스 생성 후 체크리스트

```typescript
interface FairPlayPostValidation {
  // 10 Commandments 검증
  allEvidenceAccessible: boolean;
  noSecretInformation: boolean;
  noSupernaturalSolutions: boolean;
  noUnmentionedPoisons: boolean;
  guiltySuspectDeterminable: boolean;
  criticalEvidenceDiscoverable: boolean;
  redHerringsHaveExplanations: boolean;
  evidenceDistributionBalanced: boolean;
  timelineConsistent: boolean;
  noDeusExMachina: boolean;

  // 추가 검증
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

function postValidateFairPlay(
  generatedCase: Case,
  difficulty: Difficulty
): FairPlayPostValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // 1. All Evidence Accessible
  const inaccessibleEvidence = generatedCase.evidence.filter(
    e => e.discoveryProbability.exhaustive < 0.5
  );
  if (inaccessibleEvidence.length > 0) {
    errors.push(`${inaccessibleEvidence.length} evidence items are not accessible`);
  }

  // 2. No Secret Information
  const solutionMentionedInEvidence = checkSolutionInEvidence(generatedCase);
  if (!solutionMentionedInEvidence) {
    errors.push('Solution contains information not present in evidence');
  }

  // 3. No Supernatural Solutions
  const supernaturalEvidence = generatedCase.evidence.filter(
    e => isSupernaturalEvidence(e)
  );
  if (supernaturalEvidence.length > 0) {
    errors.push(`${supernaturalEvidence.length} supernatural evidence items found`);
  }

  // 4. No Unmentioned Poisons
  const weaponMentioned = checkWeaponInEvidence(generatedCase);
  if (!weaponMentioned) {
    errors.push('Murder weapon/method not present in evidence');
  }

  // 5. Guilty Suspect Determinable
  const criticalEvidenceForGuilty = generatedCase.evidence.filter(
    e => e.type === 'critical' && e.relatedSuspect === generatedCase.guiltySuspectId
  );
  if (criticalEvidenceForGuilty.length < 3) {
    errors.push(`Only ${criticalEvidenceForGuilty.length} critical evidence for guilty suspect (minimum 3)`);
  }

  // 6. Critical Evidence Discoverable
  const config = DIFFICULTY_CONFIGS[difficulty];
  const undiscoverableCritical = generatedCase.evidence.filter(
    e => e.type === 'critical' &&
         e.discoveryProbability.thorough < config.fairPlay.criticalDiscoverability
  );
  if (undiscoverableCritical.length > 0) {
    errors.push(`${undiscoverableCritical.length} critical evidence items have too low discoverability`);
  }

  // 7. Red Herrings Have Explanations
  const redHerringsWithoutExplanation = generatedCase.evidence.filter(
    e => e.type === 'red_herring' && !e.logicalExplanation
  );
  if (redHerringsWithoutExplanation.length > 0) {
    errors.push(`${redHerringsWithoutExplanation.length} red herrings lack logical explanations`);
  }

  // 8. Evidence Distribution Balanced
  const distributionBalance = checkEvidenceDistribution(generatedCase);
  if (!distributionBalance.isBalanced) {
    warnings.push(distributionBalance.message);
  }

  // 9. Timeline Consistent
  const timelineCheck = validateTimeline(generatedCase);
  if (!timelineCheck.isConsistent) {
    errors.push(`Timeline inconsistency: ${timelineCheck.error}`);
  }

  // 10. No Deus Ex Machina
  const allEvidencePresent = checkAllEvidencePresent(generatedCase);
  if (!allEvidencePresent) {
    errors.push('Not all evidence is present from the start');
  }

  return {
    allEvidenceAccessible: inaccessibleEvidence.length === 0,
    noSecretInformation: solutionMentionedInEvidence,
    noSupernaturalSolutions: supernaturalEvidence.length === 0,
    noUnmentionedPoisons: weaponMentioned,
    guiltySuspectDeterminable: criticalEvidenceForGuilty.length >= 3,
    criticalEvidenceDiscoverable: undiscoverableCritical.length === 0,
    redHerringsHaveExplanations: redHerringsWithoutExplanation.length === 0,
    evidenceDistributionBalanced: distributionBalance.isBalanced,
    timelineConsistent: timelineCheck.isConsistent,
    noDeusExMachina: allEvidencePresent,
    errors,
    warnings,
    suggestions
  };
}
```

---

## Fair Play Violation Recovery

### Automatic Fixes

Fair Play 위반 시 자동 수정 전략

```typescript
async function fixFairPlayViolations(
  case: Case,
  validation: FairPlayPostValidation
): Promise<Case> {
  let fixedCase = { ...case };

  // 1. 접근 불가능한 증거 수정
  if (!validation.allEvidenceAccessible) {
    fixedCase = increaseEvidenceAccessibility(fixedCase);
  }

  // 2. 결정적 증거 부족 수정
  if (!validation.guiltySuspectDeterminable) {
    fixedCase = await addCriticalEvidence(fixedCase);
  }

  // 3. Red herring 설명 추가
  if (!validation.redHerringsHaveExplanations) {
    fixedCase = addRedHerringExplanations(fixedCase);
  }

  // 4. 증거 분포 재조정
  if (!validation.evidenceDistributionBalanced) {
    fixedCase = rebalanceEvidenceDistribution(fixedCase);
  }

  return fixedCase;
}
```

### Manual Review Triggers

자동 수정 불가능 시 수동 검토 필요

```typescript
function requiresManualReview(validation: FairPlayPostValidation): boolean {
  return (
    !validation.noSecretInformation ||       // 비밀 정보 위반
    !validation.noSupernaturalSolutions ||   // 초자연적 해결책
    !validation.timelineConsistent ||        // 타임라인 모순
    validation.errors.length > 5             // 에러 5개 이상
  );
}
```

---

## Best Practices

1. **Generate → Validate → Fix → Validate Again**: 생성 후 반드시 검증하고, 수정 후 재검증
2. **Prefer Automatic Fixes**: 가능한 자동 수정 활용, 수동 개입 최소화
3. **Log All Violations**: 모든 Fair Play 위반 기록하여 프롬프트 개선에 활용
4. **Player Feedback**: 플레이어가 "불공정하다"고 느끼는 케이스 분석
5. **Continuous Improvement**: Fair Play 위반 패턴 분석하여 생성 프롬프트 개선
6. **Testing**: 새로운 케이스 생성 시 최소 3번 검증 (pre, post, manual)
7. **Documentation**: Fair Play 위반 및 수정 사항 문서화

---

**참조**:
- `SKILL.md` - Evidence System Architect
- `evidence-types.md` - 증거 타입 라이브러리
- `difficulty-configs.md` - 난이도별 설정
- Ronald Knox's "Ten Commandments for Detective Fiction"
- S.S. Van Dine's "Twenty Rules for Writing Detective Stories"
