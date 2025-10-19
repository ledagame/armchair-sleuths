# Difficulty Configurations

난이도별 증거 시스템 설정 및 밸런싱 가이드입니다.

## Difficulty Levels Overview

| Difficulty | Locations | Total Evidence | Critical | Supporting | Red Herring | Obvious Ratio | Player Time |
|------------|-----------|----------------|----------|------------|-------------|---------------|-------------|
| Easy       | 3         | 6-8            | 3        | 3-4        | 1-2         | 70%           | 20-30분     |
| Medium     | 4         | 8-12           | 4        | 4-6        | 2-4         | 50%           | 30-40분     |
| Hard       | 5         | 12-15          | 5        | 6-8        | 3-5         | 30%           | 40-50분     |
| Legendary  | 5-6       | 15-18          | 6        | 7-9        | 4-6         | 20%           | 50-60분     |

---

## Easy Difficulty

### 목표
- 미스터리 게임 초보자도 쉽게 해결 가능
- 명백한 단서가 많아 빠른 진행 가능
- 추리 경험을 즐겁게 학습

### Configuration

```typescript
const EASY_DIFFICULTY_CONFIG = {
  // 장소 설정
  locations: {
    count: 3,
    types: [
      "crime_scene",      // 필수: 범행 현장
      "victim_residence", // 필수: 피해자 거주지
      "guilty_suspect_location" // 필수: 범인 관련 장소
    ],
    discoveryDifficulty: {
      easy: 3,   // 모든 장소 쉽게 발견 가능
      medium: 0,
      hard: 0
    }
  },

  // 증거 설정
  evidence: {
    total: { min: 6, max: 8 },
    distribution: {
      critical: 3,      // 30-50%
      supporting: 3,    // 30-50%
      redHerring: 2     // 20-30% (최대)
    },
    discoveryDifficulty: {
      obvious: 5,       // 70% (6-8개 중 5개)
      medium: 2,        // 25%
      hidden: 1         // 5-15%
    }
  },

  // 발견 확률
  discoveryProbability: {
    obvious: {
      quick: 0.85,
      thorough: 1.0,
      exhaustive: 1.0
    },
    medium: {
      quick: 0.50,
      thorough: 0.85,
      exhaustive: 1.0
    },
    hidden: {
      quick: 0.25,
      thorough: 0.60,
      exhaustive: 0.90
    }
  },

  // 탐색 비용 (시간 또는 리소스)
  searchCost: {
    quick: 1,       // 빠른 탐색
    thorough: 2,    // 철저한 탐색
    exhaustive: 3   // 완벽한 탐색
  },

  // Fair Play 요구사항
  fairPlay: {
    criticalMinimum: 3,              // 최소 3개 결정적 증거
    criticalDiscoverability: 0.70,   // 결정적 증거는 Thorough로 70% 이상
    redHerringMaximum: 2,             // Red herring 최대 2개
    totalEvidenceMinimum: 6          // 최소 6개 증거
  },

  // 점수 가중치
  scoring: {
    evidenceWeight: 0.40,      // 증거 발견 40%
    interrogationWeight: 0.30, // 심문 30%
    solutionWeight: 0.20,      // 정답 20%
    timeBonus: 0.10            // 시간 보너스 10%
  },

  // 예상 플레이 타임
  expectedPlaytime: {
    min: 20, // 20분
    max: 30, // 30분
    average: 25
  }
};
```

### Easy 난이도 케이스 예시

```typescript
const easyCaseExample = {
  title: "서재에서 발견된 시체",
  victim: {
    name: "박민수",
    background: "IT 회사 CEO, 45세",
    relationship: "3명의 용의자와 각각 재산, 복수, 질투 관계"
  },

  locations: [
    {
      id: "crime_scene",
      name: "피해자의 서재",
      description: "고급 가구로 꾸며진 서재. 책상 위에 와인잔 2개.",
      evidenceCount: 3,
      discoveryDifficulty: "easy"
    },
    {
      id: "victim_bedroom",
      name: "피해자의 침실",
      description: "2층 침실. 옷장과 서랍장이 있음.",
      evidenceCount: 2,
      discoveryDifficulty: "easy"
    },
    {
      id: "suspect_A_apartment",
      name: "용의자 A의 아파트",
      description: "범인 용의자 A의 거주지.",
      evidenceCount: 3,
      discoveryDifficulty: "easy"
    }
  ],

  evidence: [
    // Critical Evidence (3개)
    {
      id: "ev1",
      name: "청산가리가 든 와인잔",
      type: "critical",
      difficulty: "obvious",
      location: "crime_scene",
      probability: { quick: 0.9, thorough: 1.0, exhaustive: 1.0 },
      relatedSuspect: "suspect_A"
    },
    {
      id: "ev2",
      name: "용의자 A의 지문이 찍힌 독극물 병",
      type: "critical",
      difficulty: "medium",
      location: "suspect_A_apartment",
      probability: { quick: 0.5, thorough: 0.85, exhaustive: 1.0 },
      relatedSuspect: "suspect_A"
    },
    {
      id: "ev3",
      name: "범행 시각의 CCTV (용의자 A 출입)",
      type: "critical",
      difficulty: "obvious",
      location: "crime_scene",
      probability: { quick: 0.85, thorough: 1.0, exhaustive: 1.0 },
      relatedSuspect: "suspect_A"
    },

    // Supporting Evidence (3개)
    {
      id: "ev4",
      name: "유산 상속 분쟁 소송 기록",
      type: "supporting",
      difficulty: "obvious",
      location: "victim_bedroom",
      probability: { quick: 0.85, thorough: 1.0, exhaustive: 1.0 },
      relatedSuspect: "suspect_A"
    },
    {
      id: "ev5",
      name: "독극물 구매 영수증",
      type: "supporting",
      difficulty: "medium",
      location: "suspect_A_apartment",
      probability: { quick: 0.5, thorough: 0.85, exhaustive: 1.0 },
      relatedSuspect: "suspect_A"
    },
    {
      id: "ev6",
      name: "피해자의 일기 (A와의 갈등 기록)",
      type: "supporting",
      difficulty: "obvious",
      location: "victim_bedroom",
      probability: { quick: 0.85, thorough: 1.0, exhaustive: 1.0 },
      relatedSuspect: "suspect_A"
    },

    // Red Herring (2개)
    {
      id: "ev7",
      name: "용의자 B의 협박 편지",
      type: "red_herring",
      difficulty: "obvious",
      location: "crime_scene",
      probability: { quick: 0.85, thorough: 1.0, exhaustive: 1.0 },
      relatedSuspect: "suspect_B",
      logicalExplanation: "과거 사업 갈등으로 보낸 편지. 이미 화해함."
    },
    {
      id: "ev8",
      name: "용의자 C가 피해자 집 근처에서 목격됨",
      type: "red_herring",
      difficulty: "medium",
      location: "crime_scene",
      probability: { quick: 0.5, thorough: 0.85, exhaustive: 1.0 },
      relatedSuspect: "suspect_C",
      logicalExplanation: "우연히 근처 편의점에 갔을 뿐. CCTV로 확인 가능."
    }
  ]
};
```

---

## Medium Difficulty

### 목표
- 경험 있는 플레이어에게 적절한 도전
- 추리와 증거 수집의 균형
- 일부 Red Herring으로 난이도 상승

### Configuration

```typescript
const MEDIUM_DIFFICULTY_CONFIG = {
  locations: {
    count: 4,
    types: [
      "crime_scene",
      "victim_residence",
      "guilty_suspect_location",
      "public_location" // 추가: 공공 장소
    ],
    discoveryDifficulty: {
      easy: 3,
      medium: 1,
      hard: 0
    }
  },

  evidence: {
    total: { min: 8, max: 12 },
    distribution: {
      critical: 4,      // 30-40%
      supporting: 5,    // 40-50%
      redHerring: 3     // 25-30%
    },
    discoveryDifficulty: {
      obvious: 5,       // 50% (8-12개 중 5개)
      medium: 4,        // 35%
      hidden: 2         // 15%
    }
  },

  discoveryProbability: {
    obvious: {
      quick: 0.75,
      thorough: 0.95,
      exhaustive: 1.0
    },
    medium: {
      quick: 0.40,
      thorough: 0.75,
      exhaustive: 0.95
    },
    hidden: {
      quick: 0.20,
      thorough: 0.50,
      exhaustive: 0.85
    }
  },

  searchCost: {
    quick: 1,
    thorough: 3,      // Easy보다 비용 증가
    exhaustive: 5
  },

  fairPlay: {
    criticalMinimum: 4,
    criticalDiscoverability: 0.65,
    redHerringMaximum: 4,
    totalEvidenceMinimum: 8
  },

  scoring: {
    evidenceWeight: 0.35,
    interrogationWeight: 0.30,
    solutionWeight: 0.25,
    timeBonus: 0.10
  },

  expectedPlaytime: {
    min: 30,
    max: 40,
    average: 35
  }
};
```

---

## Hard Difficulty

### 목표
- 숙련된 탐정을 위한 도전적인 케이스
- 복잡한 증거 연결 필요
- 많은 Red Herring으로 혼란 유발

### Configuration

```typescript
const HARD_DIFFICULTY_CONFIG = {
  locations: {
    count: 5,
    types: [
      "crime_scene",
      "victim_residence",
      "guilty_suspect_location",
      "innocent_suspect_location", // 추가: 무고한 용의자 장소
      "public_location"
    ],
    discoveryDifficulty: {
      easy: 2,
      medium: 2,
      hard: 1
    }
  },

  evidence: {
    total: { min: 12, max: 15 },
    distribution: {
      critical: 5,      // 30-35%
      supporting: 7,    // 45-50%
      redHerring: 4     // 25-30%
    },
    discoveryDifficulty: {
      obvious: 4,       // 30% (12-15개 중 4개)
      medium: 6,        // 45%
      hidden: 4         // 25%
    }
  },

  discoveryProbability: {
    obvious: {
      quick: 0.65,
      thorough: 0.90,
      exhaustive: 1.0
    },
    medium: {
      quick: 0.30,
      thorough: 0.65,
      exhaustive: 0.90
    },
    hidden: {
      quick: 0.15,
      thorough: 0.40,
      exhaustive: 0.75
    }
  },

  searchCost: {
    quick: 1,
    thorough: 4,
    exhaustive: 7
  },

  fairPlay: {
    criticalMinimum: 5,
    criticalDiscoverability: 0.60,
    redHerringMaximum: 5,
    totalEvidenceMinimum: 12
  },

  scoring: {
    evidenceWeight: 0.40,      // 증거 발견 중요도 증가
    interrogationWeight: 0.25,
    solutionWeight: 0.25,
    timeBonus: 0.10
  },

  expectedPlaytime: {
    min: 40,
    max: 50,
    average: 45
  }
};
```

---

## Legendary Difficulty

### 목표
- 최고 수준의 탐정을 위한 극도로 어려운 케이스
- 거의 모든 증거가 숨겨져 있음
- 복잡한 Red Herring 네트워크
- 완벽한 추리력과 끈기 필요

### Configuration

```typescript
const LEGENDARY_DIFFICULTY_CONFIG = {
  locations: {
    count: 6,
    types: [
      "crime_scene",
      "victim_residence",
      "guilty_suspect_location",
      "innocent_suspect_1_location",
      "innocent_suspect_2_location",
      "secondary_location" // 추가: 보조 장소 (은행, 병원 등)
    ],
    discoveryDifficulty: {
      easy: 1,
      medium: 3,
      hard: 2
    }
  },

  evidence: {
    total: { min: 15, max: 18 },
    distribution: {
      critical: 6,      // 30-35%
      supporting: 9,    // 50%
      redHerring: 5     // 25-30%
    },
    discoveryDifficulty: {
      obvious: 3,       // 20% (15-18개 중 3개)
      medium: 7,        // 40%
      hidden: 7         // 40%
    }
  },

  discoveryProbability: {
    obvious: {
      quick: 0.55,
      thorough: 0.85,
      exhaustive: 1.0
    },
    medium: {
      quick: 0.25,
      thorough: 0.55,
      exhaustive: 0.85
    },
    hidden: {
      quick: 0.10,
      thorough: 0.35,
      exhaustive: 0.70
    }
  },

  searchCost: {
    quick: 1,
    thorough: 5,
    exhaustive: 10
  },

  fairPlay: {
    criticalMinimum: 6,
    criticalDiscoverability: 0.55,  // Thorough로 55% (어렵지만 가능)
    redHerringMaximum: 6,
    totalEvidenceMinimum: 15
  },

  scoring: {
    evidenceWeight: 0.45,      // 증거 발견이 가장 중요
    interrogationWeight: 0.20,
    solutionWeight: 0.25,
    timeBonus: 0.10
  },

  expectedPlaytime: {
    min: 50,
    max: 60,
    average: 55
  },

  // Legendary 전용 추가 기능
  advanced: {
    doubleTrick: true,           // 이중 트릭 활성화
    complexTimeline: true,       // 복잡한 타임라인
    multipleLocations: true,     // 다중 장소 범행
    hiddenConnections: true,     // 숨겨진 증거 연결
    expertRedHerrings: true      // 전문가급 Red Herring
  }
};
```

---

## Difficulty Scaling Formulas

### Evidence Count Formula

```typescript
function calculateEvidenceCount(difficulty: Difficulty): number {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const { min, max } = config.evidence.total;
  return randomInt(min, max);
}
```

### Evidence Distribution Formula

```typescript
function distributeEvidence(
  totalEvidence: number,
  difficulty: Difficulty
): EvidenceDistribution {
  const config = DIFFICULTY_CONFIGS[difficulty];

  const critical = Math.max(
    config.fairPlay.criticalMinimum,
    Math.ceil(totalEvidence * 0.3)
  );

  const redHerring = Math.min(
    config.fairPlay.redHerringMaximum,
    Math.floor(totalEvidence * 0.3)
  );

  const supporting = totalEvidence - critical - redHerring;

  return { critical, supporting, redHerring };
}
```

### Discovery Probability Formula

```typescript
function calculateDiscoveryProbability(
  evidenceDifficulty: 'obvious' | 'medium' | 'hidden',
  searchType: 'quick' | 'thorough' | 'exhaustive',
  gameDifficulty: Difficulty
): number {
  const config = DIFFICULTY_CONFIGS[gameDifficulty];
  const baseProbability = config.discoveryProbability[evidenceDifficulty][searchType];

  // 추가 변수 적용 가능 (플레이어 스킬, 도구 업그레이드 등)
  return baseProbability;
}
```

### Difficulty Score Formula

```typescript
function calculateDifficultyScore(
  obviousRatio: number,
  redHerringRatio: number,
  hiddenRatio: number,
  locationComplexity: number
): number {
  return (
    (1 - obviousRatio) * 0.35 +        // 명백한 증거가 적을수록 어려움
    redHerringRatio * 0.25 +           // Red herring이 많을수록 어려움
    hiddenRatio * 0.30 +               // 숨겨진 증거가 많을수록 어려움
    (locationComplexity / 10) * 0.10   // 장소가 복잡할수록 어려움
  );
}
```

---

## Dynamic Difficulty Adjustment

### Adaptive Difficulty System (선택적)

플레이어의 실력에 따라 난이도를 동적으로 조정하는 시스템

```typescript
interface PlayerPerformance {
  averageSolveTime: number;        // 평균 해결 시간
  averageEvidenceFound: number;    // 평균 증거 발견 개수
  solveRate: number;               // 해결 성공률
  difficultyPreference: Difficulty; // 선호 난이도
}

function suggestDifficulty(performance: PlayerPerformance): Difficulty {
  // 해결 성공률이 높고 빠르면 난이도 상승 제안
  if (performance.solveRate > 0.8 && performance.averageSolveTime < 30) {
    return 'hard';
  }

  // 해결률이 낮으면 난이도 하락 제안
  if (performance.solveRate < 0.4) {
    return 'easy';
  }

  // 중간 성능이면 현재 난이도 유지
  return performance.difficultyPreference;
}
```

---

## Difficulty Validation

### Pre-Generation Validation

케이스 생성 전 난이도 설정 검증

```typescript
function validateDifficultyConfig(
  config: DifficultyConfig,
  difficulty: Difficulty
): ValidationResult {
  const errors: string[] = [];

  // 1. 최소 증거 개수 확인
  if (config.evidence.total.min < config.fairPlay.totalEvidenceMinimum) {
    errors.push(`Total evidence minimum (${config.evidence.total.min}) is less than fair play requirement (${config.fairPlay.totalEvidenceMinimum})`);
  }

  // 2. 결정적 증거 개수 확인
  if (config.evidence.distribution.critical < config.fairPlay.criticalMinimum) {
    errors.push(`Critical evidence (${config.evidence.distribution.critical}) is less than minimum (${config.fairPlay.criticalMinimum})`);
  }

  // 3. Red herring 개수 확인
  if (config.evidence.distribution.redHerring > config.fairPlay.redHerringMaximum) {
    errors.push(`Red herrings (${config.evidence.distribution.redHerring}) exceed maximum (${config.fairPlay.redHerringMaximum})`);
  }

  // 4. 발견 확률 확인 (결정적 증거가 Thorough로 발견 가능한지)
  const criticalDiscoverability = config.discoveryProbability.obvious.thorough;
  if (criticalDiscoverability < config.fairPlay.criticalDiscoverability) {
    errors.push(`Critical evidence discoverability (${criticalDiscoverability}) is less than required (${config.fairPlay.criticalDiscoverability})`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### Post-Generation Validation

케이스 생성 후 난이도 검증

```typescript
function validateGeneratedCase(
  generatedCase: Case,
  expectedDifficulty: Difficulty
): ValidationResult {
  const config = DIFFICULTY_CONFIGS[expectedDifficulty];
  const errors: string[] = [];

  // 1. 증거 개수 확인
  const totalEvidence = generatedCase.evidence.length;
  if (totalEvidence < config.evidence.total.min || totalEvidence > config.evidence.total.max) {
    errors.push(`Total evidence (${totalEvidence}) is out of range (${config.evidence.total.min}-${config.evidence.total.max})`);
  }

  // 2. 증거 타입 분포 확인
  const criticalCount = generatedCase.evidence.filter(e => e.type === 'critical').length;
  const redHerringCount = generatedCase.evidence.filter(e => e.type === 'red_herring').length;

  if (criticalCount < config.fairPlay.criticalMinimum) {
    errors.push(`Critical evidence count (${criticalCount}) is less than minimum (${config.fairPlay.criticalMinimum})`);
  }

  if (redHerringCount > config.fairPlay.redHerringMaximum) {
    errors.push(`Red herring count (${redHerringCount}) exceeds maximum (${config.fairPlay.redHerringMaximum})`);
  }

  // 3. 장소 개수 확인
  const locationCount = generatedCase.locations.length;
  if (locationCount !== config.locations.count) {
    errors.push(`Location count (${locationCount}) does not match expected (${config.locations.count})`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

---

## Difficulty Progression Recommendations

### 플레이어 진행 경로

1. **초보 탐정** (0-5 케이스 해결)
   - Easy 난이도만 제공
   - 튜토리얼 케이스 포함
   - 증거 발견 메커니즘 학습

2. **견습 탐정** (6-15 케이스 해결)
   - Easy + Medium 난이도 제공
   - Easy 해결률 70% 이상 시 Medium 권장

3. **숙련 탐정** (16-30 케이스 해결)
   - Medium + Hard 난이도 제공
   - Medium 해결률 60% 이상 시 Hard 권장

4. **명탐정** (31+ 케이스 해결)
   - Hard + Legendary 난이도 제공
   - Hard 해결률 50% 이상 시 Legendary 권장

### 난이도 전환 기준

```typescript
function shouldUnlockNextDifficulty(
  playerStats: PlayerStats,
  currentDifficulty: Difficulty
): boolean {
  const thresholds = {
    easy: { solveRate: 0.70, minCases: 5 },
    medium: { solveRate: 0.60, minCases: 10 },
    hard: { solveRate: 0.50, minCases: 15 }
  };

  const threshold = thresholds[currentDifficulty];
  if (!threshold) return false;

  return (
    playerStats.casesCompleted >= threshold.minCases &&
    playerStats.solveRate >= threshold.solveRate
  );
}
```

---

## Best Practices

1. **Fair Play First**: 난이도에 관계없이 Fair Play 원칙 유지
2. **Gradual Progression**: 난이도 간 급격한 차이 방지
3. **Consistent Validation**: 생성 전후 검증 필수
4. **Player Feedback**: 플레이어 성능 데이터로 난이도 조정
5. **Testing**: 각 난이도별 최소 10개 케이스 테스트
6. **Documentation**: 난이도 설정 변경 시 문서화
7. **Accessibility**: 모든 난이도에서 접근성 보장

---

**참조**:
- `SKILL.md` - Evidence System Architect
- `evidence-types.md` - 증거 타입 라이브러리
- `fair-play-checklist.md` - Fair Play 검증 가이드
