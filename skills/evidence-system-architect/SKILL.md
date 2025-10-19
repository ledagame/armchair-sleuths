---
name: evidence-system-architect
description: Design comprehensive evidence discovery and location exploration systems for murder mystery games. Combines Fair Play principles, difficulty balancing, AI image generation, and game loop integration. Use PROACTIVELY when designing evidence mechanics, location exploration, clue discovery, or evidence-based deduction systems.
---

# Evidence System Architect

## Overview

전문 증거 시스템 설계자로서 살인 미스터리 게임을 위한 포괄적인 증거 발견 및 장소 탐색 시스템을 설계합니다. Fair Play 원칙, 난이도 밸런싱, AI 이미지 생성, 게임 루프 통합을 결합하여 플레이어가 증거를 발견하고 추리할 수 있는 공정하고 흥미로운 시스템을 만듭니다.

## When to Use This Skill

**이 스킬을 사용해야 하는 경우:**
- 증거 발견 시스템: "장소에서 증거를 찾을 수 있게" / "Implement evidence discovery"
- 장소 탐색 메커니즘: "범죄 현장 탐색" / "Crime scene investigation"
- 증거 난이도 밸런싱: "증거가 너무 쉽게/어렵게 발견됨" / "Balance evidence difficulty"
- 증거 이미지 생성: "증거 사진 생성" / "Generate evidence images"
- 증거 기반 추리: "증거로 범인 특정" / "Evidence-based deduction"
- 증거 관리 UI: "발견한 단서 확인" / "Evidence board UI"
- 게임 루프 통합: "심문과 증거 수집 병행" / "Integrate interrogation and investigation"

## Fair Play Evidence Principles

### Core Principles

```typescript
// 증거 시스템의 Fair Play 규칙 - 플레이어 신뢰 보장

const FAIR_PLAY_EVIDENCE_RULES = {
  // Rule 1: 모든 증거는 발견 가능해야 함
  discoverability: {
    rule: "게임 내 메커니즘으로 모든 증거를 발견할 수 있어야 함",
    violations: [
      "특정 도구 없이 발견 불가능한 결정적 증거", // ❌
      "확률 0%로 설정된 중요 증거", // ❌
      "숨겨진 장소에만 있는 필수 증거" // ❌
    ],
    correct: [
      "탐색 난이도에 따라 발견 확률이 있는 증거", // ✅
      "최소 Thorough Search로 발견 가능한 결정적 증거", // ✅
      "난이도에 맞는 장소에 배치된 증거" // ✅
    ]
  },

  // Rule 2: 증거 타입 분포 균형
  evidenceDistribution: {
    rule: "증거 타입이 공정하게 분포되어야 함",
    distribution: {
      critical: 0.30,    // 30% - 범인 특정에 필수적인 증거
      supporting: 0.40,  // 40% - 추리를 뒷받침하는 증거
      redHerring: 0.30   // 30% - 미끼 증거 (논리적 설명 가능해야 함)
    },
    requirement: "결정적 증거는 최소 3개 이상"
  },

  // Rule 3: 난이도별 발견 가능성
  difficultyScaling: {
    rule: "난이도에 따라 증거 발견이 적절히 조절되어야 함",
    easy: {
      obviousRatio: 0.70,      // 70% 명백한 증거
      searchType: "Quick",      // Quick Search로 충분
      totalEvidence: "6-8개"
    },
    medium: {
      obviousRatio: 0.50,      // 50% 명백한 증거
      searchType: "Thorough",   // Thorough Search 필요
      totalEvidence: "8-12개"
    },
    hard: {
      obviousRatio: 0.30,      // 30% 명백한 증거
      searchType: "Exhaustive", // Exhaustive Search 필요
      totalEvidence: "12-15개"
    },
    legendary: {
      obviousRatio: 0.20,      // 20% 명백한 증거
      searchType: "All",        // 모든 도구 필요
      totalEvidence: "15-18개"
    }
  },

  // Rule 4: Red Herring 공정성
  redHerringFairness: {
    rule: "미끼 증거는 논리적으로 설명 가능해야 함",
    requirements: [
      "Red herring이 특정 무고한 용의자를 가리켜야 함",
      "합리적인 오해를 유발하는 증거여야 함",
      "다른 증거로 반박 가능해야 함"
    ],
    forbidden: [
      "완전히 무관한 증거",
      "논리적 설명 불가능한 증거",
      "플레이어를 속이기만 하는 증거"
    ]
  }
};
```

## Evidence System Architecture

### Data Models

```typescript
// 장소 (Location)
interface Location {
  id: string;
  name: string;                    // "피해자의 서재", "범행 현장 주방"
  description: string;             // 장소 상세 설명
  imageUrl: string;                // Gemini 생성 장소 이미지 (1024x768)
  relatedSuspectIds: string[];     // 이 장소와 연관된 용의자들
  evidenceCount: number;           // 이 장소의 총 증거 개수
  discoveryDifficulty: 'easy' | 'medium' | 'hard'; // 장소 발견 난이도
}

// 증거 (Evidence)
interface Evidence {
  id: string;
  name: string;                    // "피묻은 칼", "위조된 편지"
  description: string;             // 증거 상세 설명
  imageUrl: string;                // Gemini 생성 증거 이미지 (512x512)
  type: 'critical' | 'supporting' | 'red_herring';
  discoveryDifficulty: 'obvious' | 'medium' | 'hidden';
  relatedSuspectId?: string;       // 이 증거가 가리키는 용의자 (있는 경우)
  discoveryProbability: {          // 탐색 타입별 발견 확률
    quick: number;      // 0.0 - 1.0
    thorough: number;   // 0.0 - 1.0
    exhaustive: number; // 0.0 - 1.0
  };
}

// 장소-증거 매핑
interface LocationEvidenceMapping {
  locationId: string;
  evidenceId: string;
  position?: { x: number; y: number }; // 이미지 내 증거 위치 (향후 확장)
}

// 플레이어 증거 상태
interface PlayerEvidenceState {
  caseId: string;
  userId: string;
  discoveredEvidence: {
    evidenceId: string;
    discoveredAt: Date;
    discoveryMethod: 'quick' | 'thorough' | 'exhaustive';
    locationId: string;
  }[];
  visitedLocations: {
    locationId: string;
    visitedAt: Date;
    searchType: 'quick' | 'thorough' | 'exhaustive';
  }[];
}
```

### Discovery Probability System

```typescript
// 증거 발견 확률 계산
function calculateDiscoveryProbability(
  evidence: Evidence,
  searchType: 'quick' | 'thorough' | 'exhaustive'
): number {
  const baseProb = evidence.discoveryProbability[searchType];

  // 난이도 배수 적용
  const difficultyMultiplier = {
    obvious: 1.0,
    medium: 0.7,
    hidden: 0.4
  }[evidence.discoveryDifficulty];

  return baseProb * difficultyMultiplier;
}

// 난이도별 증거 배치 설정
const DIFFICULTY_EVIDENCE_CONFIG = {
  easy: {
    locations: 3,
    evidencePerLocation: { min: 2, max: 3 },
    totalEvidence: { min: 6, max: 8 },
    obviousRatio: 0.70,
    criticalMinimum: 3,
    redHerringMaximum: 2
  },
  medium: {
    locations: 4,
    evidencePerLocation: { min: 2, max: 3 },
    totalEvidence: { min: 8, max: 12 },
    obviousRatio: 0.50,
    criticalMinimum: 4,
    redHerringMaximum: 4
  },
  hard: {
    locations: 5,
    evidencePerLocation: { min: 2, max: 3 },
    totalEvidence: { min: 12, max: 15 },
    obviousRatio: 0.30,
    criticalMinimum: 5,
    redHerringMaximum: 5
  },
  legendary: {
    locations: 5,
    evidencePerLocation: { min: 3, max: 4 },
    totalEvidence: { min: 15, max: 18 },
    obviousRatio: 0.20,
    criticalMinimum: 6,
    redHerringMaximum: 6
  }
};
```

## AI Image Generation System

### Location Image Generation

```typescript
// 장소 이미지 생성 프롬프트
function buildLocationImagePrompt(location: Location, caseContext: {
  timeOfDay: string;
  weather: string;
  crimeType: string;
}): string {
  return `
Create a crime scene location photograph for a murder mystery investigation.

**Location Details:**
- Name: ${location.name}
- Description: ${location.description}
- Time: ${caseContext.timeOfDay}
- Weather: ${caseContext.weather}
- Crime Type: ${caseContext.crimeType}

**Photography Style:**
- Crime scene photography aesthetic
- Realistic lighting and shadows
- Forensic documentation quality
- Wide-angle establishing shot
- Show the entire location clearly

**Image Requirements:**
- Size: 1024x768 (landscape)
- Format: High-quality crime scene photo
- Mood: Tense, investigative
- No people in the shot
- No graphic violence or blood (keep it subtle)
- Professional crime scene documentation style

**DO NOT include:**
- People or bodies
- Excessive gore or graphic content
- Unrealistic or fantastical elements
- Text or labels in the image
`;
}
```

### Evidence Image Generation

```typescript
// 증거 이미지 생성 프롬프트
function buildEvidenceImagePrompt(evidence: Evidence, context: {
  location: string;
  relatedSuspect?: string;
}): string {
  return `
Create a forensic evidence photograph for a murder mystery investigation.

**Evidence Details:**
- Name: ${evidence.name}
- Description: ${evidence.description}
- Found at: ${context.location}
${context.relatedSuspect ? `- Related to: ${context.relatedSuspect}` : ''}

**Photography Style:**
- Forensic evidence photography
- Close-up, detailed shot
- Clean white or neutral background
- Clear lighting, no shadows
- Evidence tag or scale ruler visible
- Professional documentation quality

**Image Requirements:**
- Size: 512x512 (square)
- Format: High-quality evidence photo
- Focus: Clear and sharp
- Perspective: Straight-on, top-down, or most informative angle
- Context: Minimal background, focus on evidence

**DO NOT include:**
- Excessive blood or gore
- People or body parts
- Unrealistic or fantastical elements
- Text descriptions or labels (except evidence tag number)
`;
}
```

### Image Generation Quality Validation

```typescript
// 생성된 이미지 검증
interface ImageValidation {
  dimensionsCorrect: boolean;    // 크기가 정확한가?
  qualitySufficient: boolean;    // 품질이 충분한가?
  contentAppropriate: boolean;   // 내용이 적절한가?
  styleConsistent: boolean;      // 스타일이 일관되는가?
}

async function validateGeneratedImage(
  imageUrl: string,
  type: 'location' | 'evidence',
  expectedDimensions: { width: number; height: number }
): Promise<ImageValidation> {
  // 1. 이미지 크기 확인
  const dimensions = await getImageDimensions(imageUrl);
  const dimensionsCorrect =
    dimensions.width === expectedDimensions.width &&
    dimensions.height === expectedDimensions.height;

  // 2. 이미지 품질 확인 (파일 크기로 간접 확인)
  const fileSize = await getImageFileSize(imageUrl);
  const qualitySufficient = fileSize > 50000; // 50KB 이상

  // 3. 내용 적절성 (수동 검토 또는 Vision API 사용)
  // 향후 구현: AI를 사용한 자동 검증

  return {
    dimensionsCorrect,
    qualitySufficient,
    contentAppropriate: true, // 수동 검토 필요
    styleConsistent: true      // 수동 검토 필요
  };
}
```

## Case Generation Integration

### Enhanced Case Generation Prompt

```typescript
// 기존 케이스 생성 프롬프트에 증거 시스템 추가
function buildEnhancedCaseStoryPrompt(elements: {
  weapon: Weapon;
  motive: Motive;
  location: Location;
  suspects: Suspect[];
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
}): string {
  const evidenceConfig = DIFFICULTY_EVIDENCE_CONFIG[elements.difficulty];

  return `
You are a master mystery writer creating a fair-play murder mystery case.

**Step 1: Define the Core Case**
- Victim: [name, background, relationships]
- Murder weapon: ${elements.weapon.name}
- Murder location: ${elements.location.name}
- Motive: ${elements.motive.name}
- Guilty suspect: [one of the three suspects]

**Step 2: Create ${evidenceConfig.locations} Investigation Locations**

For each location, provide:
- name: Descriptive location name
- description: Detailed 2-3 sentence description
- relatedSuspects: Which suspects have connection to this location
- discoveryDifficulty: easy | medium | hard

Locations should include:
1. Primary crime scene (murder location)
2. Victim's residence or workplace
3. Guilty suspect's location (hideout, workplace, etc.)
4. ${evidenceConfig.locations > 3 ? 'Other relevant locations connected to suspects or victim' : ''}

**Step 3: Create ${evidenceConfig.totalEvidence.min}-${evidenceConfig.totalEvidence.max} Evidence Items**

Evidence distribution:
- Critical evidence (30%): ${evidenceConfig.criticalMinimum}+ items that directly prove guilt
- Supporting evidence (40%): Items that build the case or provide context
- Red herrings (30%): Max ${evidenceConfig.redHerringMaximum} items that mislead but are logically explainable

For each evidence, provide:
- name: Evidence name
- description: Detailed description
- type: critical | supporting | red_herring
- discoveryDifficulty: obvious | medium | hidden
- relatedSuspect: Which suspect this evidence points to
- foundAt: Which location this evidence is found
- discoveryProbability:
  - quick: 0.0-1.0 (Quick Search)
  - thorough: 0.0-1.0 (Thorough Search)
  - exhaustive: 0.0-1.0 (Exhaustive Search)

**Evidence Requirements:**
- Minimum ${evidenceConfig.criticalMinimum} critical evidence items
- ${Math.round(evidenceConfig.totalEvidence.min * evidenceConfig.obviousRatio)} obvious evidence items (${evidenceConfig.obviousRatio * 100}%)
- All critical evidence must be discoverable with Thorough Search minimum
- Red herrings must point to innocent suspects with logical explanation
- Evidence should be organically connected to locations and suspects

**Step 4: Create the Three Suspects**
[기존 suspect 생성 로직...]

**Step 5: 5W1H Solution**
[기존 solution 로직...]

**Critical Constraints:**
- Fair Play: All evidence must be discoverable through gameplay
- No impossible evidence (all must be realistic)
- Evidence distribution must match difficulty level
- Red herrings must have logical explanations
- Timeline must be consistent with evidence

Return a complete case with locations, evidence, suspects, and solution in JSON format.
`;
}
```

## Game Loop Integration

### Parallel Investigation System

```typescript
// 게임 루프에 증거 수집 단계 추가
enum GamePhase {
  INTRO = 'intro',
  INVESTIGATION = 'investigation',    // NEW: 장소 탐색 및 증거 수집
  INTERROGATION = 'interrogation',    // 기존: 용의자 심문
  EVIDENCE_REVIEW = 'evidence_review', // NEW: 증거 검토 및 연결
  DEDUCTION = 'deduction',            // 최종 추리 제출
  SOLUTION = 'solution'               // 해결 확인
}

// 플레이어 진행 타임라인 (40분 게임 기준)
const GAME_TIMELINE = {
  intro: '0-2분',           // 사건 소개
  investigation: '2-15분',  // 장소 탐색 및 증거 수집
  interrogation: '15-30분', // 용의자 심문
  evidenceReview: '30-35분', // 증거 검토 및 연결
  deduction: '35-38분',     // 최종 추리 제출
  solution: '38-40분'       // 해결 및 피드백
};
```

### Evidence-Based Scoring

```typescript
// 증거 발견 기반 점수 계산
interface EvidenceScore {
  totalEvidence: number;
  discoveredEvidence: number;
  criticalFound: number;
  criticalTotal: number;
  efficiency: number; // 발견한 증거 / 탐색 횟수
}

function calculateEvidenceScore(state: PlayerEvidenceState, case: Case): EvidenceScore {
  const totalEvidence = case.evidence.length;
  const discoveredEvidence = state.discoveredEvidence.length;

  const criticalEvidence = case.evidence.filter(e => e.type === 'critical');
  const criticalFound = state.discoveredEvidence.filter(de =>
    criticalEvidence.some(ce => ce.id === de.evidenceId)
  ).length;

  const totalSearches = state.visitedLocations.reduce((sum, visit) => {
    return sum + (visit.searchType === 'quick' ? 1 : visit.searchType === 'thorough' ? 2 : 3);
  }, 0);

  const efficiency = discoveredEvidence / totalSearches;

  return {
    totalEvidence,
    discoveredEvidence,
    criticalFound,
    criticalTotal: criticalEvidence.length,
    efficiency
  };
}

// 최종 점수에 증거 점수 통합
function calculateFinalGrade(
  evidenceScore: EvidenceScore,
  interrogationScore: number,
  solutionCorrect: boolean,
  timeBonus: number
): {
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
} {
  const evidencePoints =
    (evidenceScore.discoveredEvidence / evidenceScore.totalEvidence) * 30 +
    (evidenceScore.criticalFound / evidenceScore.criticalTotal) * 20;

  const interrogationPoints = interrogationScore * 20;
  const solutionPoints = solutionCorrect ? 20 : 0;
  const efficiencyBonus = evidenceScore.efficiency > 0.5 ? 10 : 0;

  const totalScore = evidencePoints + interrogationPoints + solutionPoints + timeBonus + efficiencyBonus;

  let grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  if (totalScore >= 90) grade = 'S';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 60) grade = 'C';
  else if (totalScore >= 50) grade = 'D';
  else grade = 'F';

  return { grade, score: totalScore };
}
```

## Progression System Integration

### Evidence-Based Achievements

```typescript
// 증거 기반 업적 시스템
const EVIDENCE_ACHIEVEMENTS = {
  firstClue: {
    id: 'first_clue',
    name: '첫 번째 단서',
    description: '첫 증거를 발견하세요',
    condition: (state: PlayerEvidenceState) => state.discoveredEvidence.length >= 1
  },

  completeInvestigation: {
    id: 'complete_investigation',
    name: '철저한 수사',
    description: '모든 증거를 발견하세요',
    condition: (state: PlayerEvidenceState, case: Case) =>
      state.discoveredEvidence.length === case.evidence.length
  },

  criticalEyeDetective: {
    id: 'critical_eye',
    name: '날카로운 눈',
    description: '모든 결정적 증거를 발견하세요',
    condition: (state: PlayerEvidenceState, case: Case) => {
      const criticalEvidence = case.evidence.filter(e => e.type === 'critical');
      const foundCritical = state.discoveredEvidence.filter(de =>
        criticalEvidence.some(ce => ce.id === de.evidenceId)
      );
      return foundCritical.length === criticalEvidence.length;
    }
  },

  minimalistDetective: {
    id: 'minimalist',
    name: '미니멀리스트 탐정',
    description: '최소한의 증거로 사건을 해결하세요 (결정적 증거만)',
    condition: (state: PlayerEvidenceState, solved: boolean, case: Case) => {
      if (!solved) return false;
      const criticalCount = case.evidence.filter(e => e.type === 'critical').length;
      return state.discoveredEvidence.length <= criticalCount + 1;
    }
  },

  evidenceHunter: {
    id: 'evidence_hunter',
    name: '증거 사냥꾼',
    description: '한 케이스에서 15개 이상의 증거를 발견하세요',
    condition: (state: PlayerEvidenceState) => state.discoveredEvidence.length >= 15
  },

  quickInvestigator: {
    id: 'quick_investigator',
    name: '빠른 수사관',
    description: 'Quick Search만으로 모든 결정적 증거를 발견하세요',
    condition: (state: PlayerEvidenceState, case: Case) => {
      const criticalIds = case.evidence.filter(e => e.type === 'critical').map(e => e.id);
      const quickFinds = state.discoveredEvidence.filter(
        de => de.discoveryMethod === 'quick' && criticalIds.includes(de.evidenceId)
      );
      return quickFinds.length === criticalIds.length;
    }
  }
};
```

## Community & Viral Features

### Evidence-Enhanced Case Reports

```typescript
// 증거 하이라이트가 포함된 케이스 리포트
interface EnhancedCaseReport {
  // 기존 케이스 리포트 필드들
  caseId: string;
  userId: string;
  solved: boolean;
  grade: string;
  timeSpent: number;

  // 증거 하이라이트 (NEW)
  evidenceHighlights: {
    totalFound: number;
    totalAvailable: number;
    discoveryRate: number;
    keyEvidence: {
      name: string;
      image: string;
      description: string;
      discoveryMethod: 'quick' | 'thorough' | 'exhaustive';
    }[];
    decisiveEvidence?: {
      name: string;
      image: string;
      reason: string; // 이 증거가 왜 결정적이었는지
    };
  };

  // 증거 발견 통계
  evidenceStats: {
    quickSearches: number;
    thoroughSearches: number;
    exhaustiveSearches: number;
    averageEvidencePerLocation: number;
    mostProductiveLocation: {
      name: string;
      evidenceFound: number;
    };
  };
}
```

### Evidence-Based Challenges

```typescript
// 증거 기반 커뮤니티 챌린지
const EVIDENCE_CHALLENGES = {
  minimalistChallenge: {
    id: 'minimalist_detective',
    name: '미니멀리스트 탐정 챌린지',
    description: '가장 적은 증거로 케이스를 해결하세요',
    leaderboardMetric: 'evidenceCount', // ASC
    rules: {
      maxEvidence: 'unlimited',
      mustSolve: true,
      mustFindAllCritical: true
    }
  },

  speedInvestigator: {
    id: 'speed_investigator',
    name: '스피드 수사관',
    description: '가장 빠르게 모든 증거를 발견하세요',
    leaderboardMetric: 'investigationTime', // ASC
    rules: {
      mustFindAllEvidence: true
    }
  },

  evidenceHunter: {
    id: 'evidence_hunter_challenge',
    name: '증거 사냥꾼 챌린지',
    description: '가장 많은 증거를 발견하세요',
    leaderboardMetric: 'evidenceCount', // DESC
    rules: {
      timeLimit: 40 * 60 // 40분
    }
  },

  efficientDetective: {
    id: 'efficient_detective',
    name: '효율적인 탐정',
    description: '가장 높은 증거 발견 효율성을 달성하세요 (발견 증거 / 탐색 횟수)',
    leaderboardMetric: 'efficiency', // DESC
    rules: {
      minEvidence: 10,
      mustSolve: true
    }
  }
};
```

### Evidence Sharing Mechanics

```typescript
// 증거 공유 기능
interface EvidenceShare {
  evidenceId: string;
  caseId: string;
  userId: string;
  caption: string;        // 사용자가 작성한 설명
  discoveryStory?: string; // 어떻게 발견했는지
  imageUrl: string;
  createdAt: Date;
  likes: number;
  comments: {
    userId: string;
    text: string;
    createdAt: Date;
  }[];
}

// 증거 디스커션 기능
interface EvidenceDiscussion {
  evidenceId: string;
  caseId: string;
  topic: string;          // "이 증거가 가리키는 용의자는?"
  posts: {
    userId: string;
    theory: string;       // 사용자의 추리
    supportingEvidence: string[]; // 다른 증거 ID들
    votes: number;
    createdAt: Date;
  }[];
}
```

## Implementation Phases

### Phase 1: Core Evidence System (MVP)
**목표**: 기본 증거 발견 및 장소 탐색 기능

**구현 항목**:
1. 데이터 모델 생성 (Location, Evidence, mappings)
2. 케이스 생성 시 장소 및 증거 생성 로직 추가
3. 장소 이미지 생성 (Gemini API)
4. 증거 이미지 생성 (Gemini API)
5. 기본 탐색 UI (Quick Search만)
6. 발견한 증거 목록 UI

**검증 기준**:
- [ ] 케이스 생성 시 3개 장소 생성됨
- [ ] 각 장소에 2-3개 증거 배치됨
- [ ] 모든 장소 이미지가 생성됨
- [ ] 모든 증거 이미지가 생성됨
- [ ] 플레이어가 장소를 탐색하고 증거를 발견할 수 있음

### Phase 2: Difficulty Scaling & Game Integration
**목표**: 난이도별 증거 분포 및 게임 루프 통합

**구현 항목**:
1. 난이도별 증거 설정 적용 (Easy/Medium/Hard/Legendary)
2. 탐색 타입 추가 (Thorough, Exhaustive)
3. 발견 확률 시스템 구현
4. 게임 루프에 Investigation 단계 추가
5. 증거 기반 점수 계산
6. Fair Play 검증 로직

**검증 기준**:
- [ ] 난이도별 증거 개수가 정확함
- [ ] 탐색 타입에 따라 발견 확률이 다름
- [ ] 결정적 증거가 Thorough로 발견 가능
- [ ] 점수에 증거 발견이 반영됨

### Phase 3: Advanced Features
**목표**: 증거 보드, 연결 시스템, 진행 시스템 통합

**구현 항목**:
1. 증거 보드 UI (발견한 증거 시각화)
2. 증거 연결 기능 (증거 간 관계 표시)
3. 증거 기반 업적 시스템
4. 증거 검토 단계 (Evidence Review)
5. 증거 기반 힌트 시스템

**검증 기준**:
- [ ] 증거 보드에서 모든 증거 확인 가능
- [ ] 증거 간 연결 표시됨
- [ ] 증거 업적 획득 가능
- [ ] 증거 검토로 추리 강화 가능

### Phase 4: Community & Viral Features
**목표**: 증거 기반 커뮤니티 기능 및 공유 메커니즘

**구현 항목**:
1. 증거 하이라이트 케이스 리포트
2. 증거 기반 챌린지
3. 증거 공유 기능
4. 증거 디스커션 스레드
5. 증거 발견 리더보드

**검증 기준**:
- [ ] 케이스 리포트에 증거 하이라이트 표시
- [ ] 증거 챌린지 참여 가능
- [ ] 증거 공유 및 좋아요/댓글 가능
- [ ] 증거 디스커션 참여 가능

## Quick Start Commands

```bash
# 1. 증거 시스템이 포함된 케이스 생성
npm run generate-case -- --difficulty medium --evidence

# 2. 증거 검증
npm run validate-evidence -- --case-id <case-id>

# 3. 증거 이미지 재생성
npm run regenerate-evidence-images -- --case-id <case-id>

# 4. Fair Play 검증
npm run verify-fair-play -- --case-id <case-id>
```

## References

이 스킬은 다음 참조 문서들을 기반으로 합니다:

- `references/evidence-types.md` - 증거 타입 라이브러리
- `references/location-props.md` - 장소 소품 라이브러리
- `references/difficulty-configs.md` - 난이도별 설정
- `references/fair-play-checklist.md` - Fair Play 검증 체크리스트
- `references/image-generation-guide.md` - 이미지 생성 가이드

## Integration with Other Skills

- **mystery-game-designer**: Fair Play 원칙 및 난이도 밸런싱 공유
- **ai-prompt-engineer**: 증거 생성 프롬프트 최적화
- **gemini-image-generator**: 장소 및 증거 이미지 생성
- **viral-detective-challenge**: 증거 기반 커뮤니티 챌린지

## Common Patterns

### Pattern 1: 증거 생성 및 배치
```typescript
// 1. 난이도 설정 가져오기
const config = DIFFICULTY_EVIDENCE_CONFIG[difficulty];

// 2. 장소 생성
const locations = await generateLocations(config.locations, caseContext);

// 3. 증거 생성 (타입 분포 고려)
const evidence = await generateEvidence(
  config.totalEvidence,
  {
    critical: config.criticalMinimum,
    supporting: Math.ceil(config.totalEvidence.min * 0.4),
    redHerring: config.redHerringMaximum
  },
  caseContext
);

// 4. 증거를 장소에 배치
const mappings = distributeEvidenceToLocations(evidence, locations);

// 5. Fair Play 검증
const validation = validateFairPlay(evidence, locations, difficulty);
if (!validation.isValid) {
  throw new Error(`Fair Play violation: ${validation.errors.join(', ')}`);
}
```

### Pattern 2: 증거 발견 처리
```typescript
// 플레이어가 장소를 탐색할 때
async function searchLocation(
  locationId: string,
  searchType: 'quick' | 'thorough' | 'exhaustive',
  userId: string,
  caseId: string
): Promise<Evidence[]> {
  // 1. 장소의 모든 증거 가져오기
  const locationEvidence = await getLocationEvidence(locationId);

  // 2. 각 증거의 발견 확률 계산
  const discoveredEvidence: Evidence[] = [];
  for (const evidence of locationEvidence) {
    const probability = calculateDiscoveryProbability(evidence, searchType);
    if (Math.random() < probability) {
      discoveredEvidence.push(evidence);

      // 3. 플레이어 상태 업데이트
      await recordEvidenceDiscovery(userId, caseId, evidence.id, {
        locationId,
        searchType,
        discoveredAt: new Date()
      });
    }
  }

  return discoveredEvidence;
}
```

### Pattern 3: Fair Play 검증
```typescript
// 케이스 생성 후 Fair Play 규칙 검증
function validateFairPlay(
  evidence: Evidence[],
  locations: Location[],
  difficulty: Difficulty
): ValidationResult {
  const errors: string[] = [];
  const config = DIFFICULTY_EVIDENCE_CONFIG[difficulty];

  // 1. 결정적 증거가 충분한가?
  const criticalEvidence = evidence.filter(e => e.type === 'critical');
  if (criticalEvidence.length < config.criticalMinimum) {
    errors.push(`Not enough critical evidence: ${criticalEvidence.length} < ${config.criticalMinimum}`);
  }

  // 2. 모든 결정적 증거가 Thorough로 발견 가능한가?
  const unfindableCritical = criticalEvidence.filter(
    e => e.discoveryProbability.thorough < 0.5
  );
  if (unfindableCritical.length > 0) {
    errors.push(`Critical evidence too hard to find: ${unfindableCritical.map(e => e.name).join(', ')}`);
  }

  // 3. Red herring이 너무 많지 않은가?
  const redHerrings = evidence.filter(e => e.type === 'red_herring');
  if (redHerrings.length > config.redHerringMaximum) {
    errors.push(`Too many red herrings: ${redHerrings.length} > ${config.redHerringMaximum}`);
  }

  // 4. 각 장소에 증거가 적절히 분포되어 있는가?
  for (const location of locations) {
    const locationEvidenceCount = evidence.filter(e =>
      e.foundAt === location.id
    ).length;
    if (locationEvidenceCount < config.evidencePerLocation.min) {
      errors.push(`Location "${location.name}" has too few evidence`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

## Troubleshooting

### 문제 1: 증거가 너무 쉽게/어렵게 발견됨

**원인**: 발견 확률 설정이 부적절함

**해결**:
```typescript
// difficulty별 발견 확률 조정
const DISCOVERY_PROBABILITY_PRESETS = {
  easy: {
    obvious: { quick: 0.9, thorough: 1.0, exhaustive: 1.0 },
    medium: { quick: 0.5, thorough: 0.9, exhaustive: 1.0 },
    hidden: { quick: 0.2, thorough: 0.6, exhaustive: 0.9 }
  },
  // ... medium, hard, legendary
};
```

### 문제 2: Fair Play 위반 (결정적 증거를 찾을 수 없음)

**원인**: 결정적 증거의 발견 확률이 너무 낮음

**해결**:
```typescript
// 결정적 증거는 최소 Thorough로 70% 이상 발견 가능하도록 강제
if (evidence.type === 'critical') {
  evidence.discoveryProbability.thorough = Math.max(
    evidence.discoveryProbability.thorough,
    0.7
  );
}
```

### 문제 3: 이미지 생성 실패 또는 품질 저하

**원인**: 프롬프트가 너무 모호하거나 제약사항 부족

**해결**:
```typescript
// 프롬프트에 명확한 스타일 가이드 추가
const styleGuide = `
**Style Requirements:**
- Photorealistic crime scene photography
- Professional forensic documentation quality
- Natural lighting (avoid harsh shadows)
- Neutral color palette
- High detail and clarity
- No artistic filters or effects
`;
```

## Best Practices

1. **Fair Play First**: 모든 증거 시스템 설계 시 Fair Play 원칙을 최우선으로 고려
2. **Difficulty Scaling**: 난이도에 따라 증거 개수, 발견 확률, 배치를 체계적으로 조정
3. **Progressive Disclosure**: 플레이어가 점진적으로 증거를 발견하도록 설계
4. **Validation Always**: 케이스 생성 후 반드시 Fair Play 검증 수행
5. **Image Quality**: 이미지 생성 실패 시 재시도 로직 구현 필수
6. **Player Feedback**: 증거 발견 시 즉각적이고 명확한 피드백 제공
7. **Red Herring Balance**: Red herring은 30% 이하로 제한하고 논리적 설명 필수

---

**Created by**: Evidence System Architect Skill
**Version**: 1.0.0
**Last Updated**: 2025-10-20
