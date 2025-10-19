---
name: mystery-game-designer
description: Design engaging murder mystery game systems with balanced difficulty, fair-play rules, and replayability. This skill should be used PROACTIVELY when designing case mechanics, balancing difficulty, creating character archetypes, or implementing progression systems.
---

# Murder Mystery Game Designer

## Overview

Specializes in murder mystery game design - the systems, mechanics, and balance that make detective games engaging and fair. Combines classic mystery writing principles with modern game design to create cases that are challenging but solvable.

## When to Use This Skill

**Use this skill PROACTIVELY when:**
- 난이도 밸런싱: "케이스가 너무 쉬워/어려워" / "Balance case difficulty"
- 새로운 미스터리 타입: "새로운 케이스 유형 추가" / "Add new mystery type"
- 플롯 구조 설계: "스토리 구조 개선" / "Improve plot structure"
- Red Herring 배치: "미끼 단서 설계" / "Design red herrings"
- 진행 시스템: "언락 시스템" / "Design progression system"
- 리플레이성: "반복 플레이 요소" / "Add replayability"

## Fair Play Mystery Rules

### Core Principles

```typescript
// Mystery integrity rules that ensure player trust

const FAIR_PLAY_RULES = {
  // Rule 1: All clues must be accessible
  accessibility: {
    rule: "플레이어가 추리에 필요한 모든 단서에 접근 가능해야 함",
    violations: [
      "숨겨진 방에 중요 단서", // ❌
      "NPC만 아는 비밀 정보", // ❌
      "전문 지식 필요한 암호" // ❌
    ],
    correct: [
      "수사 중 발견 가능한 단서", // ✅
      "용의자 심문으로 얻는 정보", // ✅
      "논리적 추론으로 해독 가능한 증거" // ✅
    ]
  },

  // Rule 2: Criminal identity must be determinable
  determinability: {
    rule: "충분한 단서로 범인을 특정할 수 있어야 함",
    requirements: [
      "최소 3개 이상의 결정적 단서",
      "단서들이 한 용의자를 가리킴",
      "무고한 용의자는 알리바이나 증거 부족으로 제외 가능"
    ]
  },

  // Rule 3: No supernatural or impossible solutions
  realism: {
    rule: "초자연적 요소나 불가능한 해결책 금지",
    allowed: [
      "현실적인 살인 방법",
      "과학적으로 가능한 증거",
      "논리적인 타임라인"
    ],
    forbidden: [
      "초능력이나 마법",
      "과학적으로 불가능한 방법",
      "인과관계 없는 우연"
    ]
  },

  // Rule 4: No withholding critical information
  transparency: {
    rule: "작가(AI)가 중요 정보를 숨기면 안 됨",
    principle: "플레이어와 탐정은 같은 정보를 공유",
    timing: "결정적 단서는 해결 전에 공개되어야 함"
  }
};
```

## Difficulty Balancing System

### Difficulty Formula

```typescript
interface DifficultyParams {
  obviousClueRatio: number; // 0-1
  redHerringStrength: number; // 0-1
  suspectDistinction: number; // 0-1 (how clearly guilty stands out)
  timelineComplexity: number; // 0-1
}

function calculateDifficulty(params: DifficultyParams): 'easy' | 'medium' | 'hard' {
  const score =
    (1 - params.obviousClueRatio) * 0.4 +
    params.redHerringStrength * 0.3 +
    (1 - params.suspectDistinction) * 0.2 +
    params.timelineComplexity * 0.1;

  if (score < 0.35) return 'easy';
  if (score < 0.65) return 'medium';
  return 'hard';
}

// Difficulty presets
const DIFFICULTY_PRESETS: Record<string, DifficultyParams> = {
  easy: {
    obviousClueRatio: 0.7,        // 70% obvious clues
    redHerringStrength: 0.2,      // Weak red herrings
    suspectDistinction: 0.8,      // Guilty clearly suspicious
    timelineComplexity: 0.2       // Simple timeline
  },
  medium: {
    obviousClueRatio: 0.5,
    redHerringStrength: 0.5,
    suspectDistinction: 0.5,      // All equally suspicious
    timelineComplexity: 0.4
  },
  hard: {
    obviousClueRatio: 0.3,        // Mostly subtle clues
    redHerringStrength: 0.7,      // Strong misdirection
    suspectDistinction: 0.2,      // Innocent seem more guilty
    timelineComplexity: 0.7       // Complex timeline
  }
};
```

### Clue Distribution Algorithm

```typescript
interface Clue {
  description: string;
  importance: 'critical' | 'supporting' | 'redHerring' | 'neutral';
  pointsTo: string; // suspect ID or 'none'
  obviousness: number; // 0-1
}

function distributeClues(
  difficulty: 'easy' | 'medium' | 'hard',
  guiltySuspectId: string,
  innocentSuspectIds: string[]
): Clue[] {
  const preset = DIFFICULTY_PRESETS[difficulty];
  const clues: Clue[] = [];

  // Calculate clue counts
  const totalClues = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 10;
  const criticalCount = Math.ceil(totalClues * 0.3); // 30% critical
  const supportingCount = Math.ceil(totalClues * preset.obviousClueRatio);
  const redHerringCount = Math.ceil(totalClues * preset.redHerringStrength);

  // Generate critical clues (point to guilty suspect)
  for (let i = 0; i < criticalCount; i++) {
    clues.push({
      description: generateCriticalClue(guiltySuspectId, i),
      importance: 'critical',
      pointsTo: guiltySuspectId,
      obviousness: difficulty === 'easy' ? 0.9 : difficulty === 'medium' ? 0.6 : 0.4
    });
  }

  // Generate red herrings (point to innocent suspects)
  innocentSuspectIds.forEach(suspectId => {
    const herringCount = Math.ceil(redHerringCount / innocentSuspectIds.length);
    for (let i = 0; i < herringCount; i++) {
      clues.push({
        description: generateRedHerring(suspectId, i),
        importance: 'redHerring',
        pointsTo: suspectId,
        obviousness: difficulty === 'easy' ? 0.3 : difficulty === 'medium' ? 0.6 : 0.8
      });
    }
  });

  // Generate supporting clues
  const remaining = totalClues - clues.length;
  for (let i = 0; i < remaining; i++) {
    clues.push({
      description: generateSupportingClue(guiltySuspectId, i),
      importance: 'supporting',
      pointsTo: guiltySuspectId,
      obviousness: 0.5
    });
  }

  return shuffleClues(clues);
}
```

## Character Archetype System

```typescript
// Pre-designed archetypes with clear motivations

const CHARACTER_ARCHETYPES = {
  scornedLover: {
    name: "배신당한 연인",
    typicalMotives: ["복수", "질투", "배신감"],
    personalityTraits: ["감정적", "불안정", "집착적"],
    commonBackstory: "피해자와의 연애 관계가 갑작스럽게 끝남",
    suspicionTriggers: ["피해자와의 관계 언급", "이별 시점 질문"],
    usageRate: 0.25 // 25% of cases
  },

  greedyHeir: {
    name: "탐욕스런 상속자",
    typicalMotives: ["유산", "돈", "재산"],
    personalityTraits: ["계산적", "냉정", "물질주의적"],
    commonBackstory: "피해자의 유산을 물려받을 예정",
    suspicionTriggers: ["재산 언급", "유언장 변경 언급"],
    usageRate: 0.30
  },

  businessRival: {
    name: "비즈니스 라이벌",
    typicalMotives: ["경쟁", "시장 점유", "파산 방지"],
    personalityTraits: ["야심적", "전략적", "무자비"],
    commonBackstory: "피해자와 사업 경쟁 중",
    suspicionTriggers: ["사업 현황", "재무 상태"],
    usageRate: 0.20
  },

  vengefulFriend: {
    name: "복수하는 친구",
    typicalMotives: ["과거 배신", "비밀 폭로", "명예 회복"],
    personalityTraits: ["원한 깊음", "인내심 강함", "집요함"],
    commonBackstory: "과거 피해자에게 큰 피해를 입음",
    suspicionTriggers: ["과거 사건", "오래된 관계"],
    usageRate: 0.15
  },

  jealousColleague: {
    name: "질투하는 동료",
    typicalMotives: ["승진", "인정", "자존심"],
    personalityTraits: ["열등감", "경쟁심", "음험함"],
    commonBackstory: "피해자의 성공에 가려진 동료",
    suspicionTriggers: ["업무 성과", "평판 언급"],
    usageRate: 0.10
  }
};

function selectArchetypes(
  difficulty: 'easy' | 'medium' | 'hard'
): { guilty: Archetype; innocents: Archetype[] } {
  const archetypes = Object.values(CHARACTER_ARCHETYPES);

  // Select guilty archetype (weighted random)
  const guilty = weightedRandom(archetypes);

  // Select 2 innocent archetypes (different from guilty)
  const innocents = archetypes
    .filter(a => a !== guilty)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  return { guilty, innocents };
}
```

## Red Herring Strategies

```typescript
// Techniques for creating believable but false leads

const RED_HERRING_TECHNIQUES = {
  // 1. Plausible Motive
  plausibleMotive: {
    technique: "무고한 용의자에게 그럴듯한 동기 부여",
    examples: [
      "피해자에게 돈을 빌렸으나 갚지 못함 (실제로는 협상 중)",
      "피해자와 공개적으로 다툼 (하지만 화해함)",
      "피해자의 승진으로 자신이 밀려남 (하지만 수용함)"
    ],
    effectiveness: "high"
  },

  // 2. Weak Alibi
  weakAlibi: {
    technique: "약하지만 사실인 알리바이",
    examples: [
      "혼자 집에 있었다고 주장 (증명 불가하지만 사실)",
      "목격자가 한 명뿐 (하지만 진실)",
      "범행 시각에 근처에 있었음 (우연)"
    ],
    effectiveness: "medium"
  },

  // 3. Suspicious Behavior
  suspiciousBehavior: {
    technique: "의심스러운 행동이지만 무관한 이유",
    examples: [
      "범행 직후 급히 떠남 (다른 약속)",
      "거짓말 탐지 (다른 비밀을 숨김)",
      "증거 인멸 시도처럼 보임 (실수로)"
    ],
    effectiveness: "high"
  },

  // 4. Circumstantial Evidence
  circumstantialEvidence: {
    technique: "범행을 암시하는 정황 증거",
    examples: [
      "범행 도구와 유사한 물건 소지 (다른 용도)",
      "피해자 집 근처 목격 (우연)",
      "범행 방법에 대한 지식 (직업상 알게 됨)"
    ],
    effectiveness: "medium"
  }
};

function createRedHerring(
  innocentSuspect: Suspect,
  technique: RedHerringTechnique,
  difficulty: 'easy' | 'medium' | 'hard'
): Clue {
  const strength = difficulty === 'easy' ? 'weak' :
                  difficulty === 'medium' ? 'medium' : 'strong';

  return {
    description: generateRedHerringDescription(innocentSuspect, technique),
    importance: 'redHerring',
    pointsTo: innocentSuspect.id,
    obviousness: strength === 'weak' ? 0.3 : strength === 'medium' ? 0.6 : 0.9,
    explanation: generateInnocentExplanation(innocentSuspect, technique)
  };
}
```

## Three-Act Mystery Structure

```typescript
// Classic mystery plot structure

const MYSTERY_PLOT_STRUCTURE = {
  act1_setup: {
    name: "발단 - 사건 발생",
    duration: "20% of story",
    goals: [
      "피해자 소개 및 배경 설정",
      "범죄 발견",
      "초기 용의자 제시",
      "수사 시작 동기 부여"
    ],
    keyElements: [
      "Crime scene discovery",
      "Victim background",
      "Initial suspects introduction",
      "First clues revealed"
    ],
    playerActions: [
      "케이스 정보 확인",
      "범죄 현장 조사",
      "용의자 목록 확인"
    ]
  },

  act2_investigation: {
    name: "전개 - 수사 진행",
    duration: "60% of story",
    goals: [
      "용의자 심문",
      "단서 수집 및 분석",
      "Red herring 제시",
      "복잡성 증가"
    ],
    keyElements: [
      "Suspect interrogations",
      "Clue discovery",
      "Red herrings introduction",
      "Plot twists",
      "Timeline reconstruction"
    ],
    playerActions: [
      "용의자 심문",
      "단서 수집",
      "정보 연결",
      "가설 수립"
    ]
  },

  act3_resolution: {
    name: "결말 - 진실 밝혀짐",
    duration: "20% of story",
    goals: [
      "최종 단서 공개",
      "범인 특정",
      "동기 설명",
      "사건 해결"
    ],
    keyElements: [
      "Final clue revelation",
      "Guilty suspect identification",
      "Motive explanation",
      "Full timeline reconstruction",
      "Case resolution"
    ],
    playerActions: [
      "5W1H 답변 제출",
      "점수 확인",
      "해설 확인"
    ]
  }
};
```

## Progression & Unlock Systems

```typescript
// Player progression and case unlocking

interface ProgressionSystem {
  levels: PlayerLevel[];
  unlocks: UnlockCondition[];
  rewards: Reward[];
}

const PROGRESSION_TIERS = {
  beginner: {
    level: 1-10,
    caseAccess: ['easy'],
    features: [
      "기본 케이스 플레이",
      "용의자 심문",
      "단서 수집"
    ],
    unlockConditions: "케이스 완료"
  },

  intermediate: {
    level: 11-25,
    caseAccess: ['easy', 'medium'],
    features: [
      "중급 난이도 케이스",
      "타임라인 재구성 도구",
      "증거판 기능"
    ],
    unlockConditions: "Easy 케이스 10개 완료"
  },

  advanced: {
    level: 26-50,
    caseAccess: ['easy', 'medium', 'hard'],
    features: [
      "고급 난이도 케이스",
      "협력 수사 모드",
      "주간 챌린지"
    ],
    unlockConditions: "Medium 케이스 20개 완료"
  },

  expert: {
    level: 51+,
    caseAccess: ['all', 'special'],
    features: [
      "특별 케이스 (실제 사건 기반)",
      "리더보드 참여",
      "커스텀 케이스 생성"
    ],
    unlockConditions: "Hard 케이스 30개 완료"
  }
};

// XP calculation
function calculateXP(result: ScoringResult): number {
  const baseXP = 100;
  const difficultyMultiplier = {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0
  };

  const scoreBonus = result.totalScore; // 0-100
  const accuracyBonus = result.isCorrect ? 50 : 0;
  const speedBonus = calculateSpeedBonus(result.submittedAt);

  return Math.floor(
    baseXP * difficultyMultiplier[result.difficulty] +
    scoreBonus +
    accuracyBonus +
    speedBonus
  );
}
```

## Replayability Features

```typescript
// Mechanics to encourage repeated play

const REPLAYABILITY_FEATURES = {
  // 1. Daily Cases
  dailyCase: {
    mechanism: "매일 새로운 케이스 자동 생성",
    incentive: "Streak bonus (연속 플레이 보너스)",
    implementation: "CaseGeneratorService with daily schedule"
  },

  // 2. Case Variations
  caseVariations: {
    mechanism: "같은 설정, 다른 범인/단서",
    example: "같은 저택, 3가지 살인 시나리오",
    implementation: "Template-based generation with variations"
  },

  // 3. Leaderboards
  leaderboards: {
    types: ["일일", "주간", "월간", "전체"],
    metrics: ["해결 시간", "점수", "정확도"],
    rewards: "특별 배지, 프로필 flair"
  },

  // 4. Achievements
  achievements: {
    types: [
      "Perfect Score: 100점 달성",
      "Speed Demon: 3분 이내 해결",
      "Detective Streak: 7일 연속 플레이",
      "Master Sleuth: Hard 난이도 10개 완료"
    ],
    tracking: "Player profile system"
  },

  // 5. Challenge Mode
  challengeMode: {
    variations: [
      "No Interrogation: 심문 없이 단서만으로 해결",
      "Time Limit: 10분 제한",
      "Limited Clues: 단서 3개만 공개",
      "Blind Mode: 용의자 정보 숨김"
    ]
  }
};
```

## Integration with Project

### Update CaseGeneratorService

```typescript
// src/server/services/case/CaseGeneratorService.ts

import { DIFFICULTY_PRESETS, distributeClues } from '@/skills/mystery-game-designer';

export class CaseGeneratorService {
  async generateCase(difficulty: 'easy' | 'medium' | 'hard'): Promise<CaseData> {
    // Use difficulty preset
    const preset = DIFFICULTY_PRESETS[difficulty];

    // Select archetypes
    const { guilty, innocents } = selectArchetypes(difficulty);

    // Generate suspects
    const suspects = [
      createSuspect(guilty, true),
      ...innocents.map(arch => createSuspect(arch, false))
    ];

    // Distribute clues
    const clues = distributeClues(
      difficulty,
      suspects.find(s => s.isGuilty)!.id,
      suspects.filter(s => !s.isGuilty).map(s => s.id)
    );

    // Validate fair play rules
    validateFairPlayRules(clues, suspects);

    return { suspects, clues, difficulty, ... };
  }
}
```

## Quick Start

### 1. Validate Current Cases

```bash
npx tsx scripts/validate-fairplay.ts --case-id case-2025-01-19
```

### 2. Test Difficulty Balance

```bash
npx tsx scripts/test-difficulty.ts --generate 10 --difficulty medium
```

### 3. Analyze Clue Distribution

```bash
npx tsx scripts/analyze-clues.ts --case-id case-2025-01-19
```

## References

- **fair-play-rules.md**: Complete fair play mystery principles
- **difficulty-tuning.md**: Balancing guide and formulas
- **archetype-library.md**: All character archetypes and usage patterns
- **plot-structures.md**: Mystery plot templates and variations
- **replayability-guide.md**: Systems for player retention

## Best Practices

1. **Always follow Fair Play rules** - Player trust is paramount
2. **Test difficulty** - Generate 10 cases, validate consistency
3. **Vary archetypes** - Don't repeat patterns too often
4. **Balance clues** - Critical + Supporting + Red Herrings
5. **Validate logic** - Timeline must be consistent
6. **Respect players** - No impossible puzzles or unfair tricks
