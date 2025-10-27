# Evidence System Architect

> 🔍 **Comprehensive evidence discovery and location exploration system designer for murder mystery games**

## Overview

Evidence System Architect는 살인 미스터리 게임을 위한 포괄적인 증거 발견 및 장소 탐색 시스템을 설계하는 전문 스킬입니다. Fair Play 원칙, 난이도 밸런싱, AI 이미지 생성, 게임 루프 통합을 결합하여 플레이어가 증거를 발견하고 추리할 수 있는 공정하고 흥미로운 시스템을 만듭니다.

## When to Use This Skill

이 스킬은 다음과 같은 경우에 사용하세요:

- ✅ 증거 발견 시스템 구현
- ✅ 장소 탐색 메커니즘 설계
- ✅ 증거 난이도 밸런싱
- ✅ 증거/장소 이미지 AI 생성
- ✅ 증거 기반 추리 시스템
- ✅ 증거 관리 UI 설계
- ✅ 게임 루프 통합

## Quick Start

### 1. Read the Main Skill Documentation

```bash
# Read the comprehensive skill guide
cat skills/evidence-system-architect/SKILL.md
```

### 2. Explore Reference Materials

```bash
# Evidence types library
cat skills/evidence-system-architect/references/evidence-types.md

# Location props library
cat skills/evidence-system-architect/references/location-props.md

# Difficulty configurations
cat skills/evidence-system-architect/references/difficulty-configs.md

# Fair Play checklist
cat skills/evidence-system-architect/references/fair-play-checklist.md

# Image generation guide
cat skills/evidence-system-architect/references/image-generation-guide.md
```

### 3. Use in Your Project

```typescript
// Example: Generate evidence system for a case
import { EvidenceSystemArchitect } from './skills/evidence-system-architect';

const evidenceSystem = await EvidenceSystemArchitect.generate({
  difficulty: 'medium',
  locations: 4,
  totalEvidence: 10,
  guiltySuspectId: 'suspect_A'
});
```

## Core Features

### 🎯 Fair Play Principles

- 모든 증거는 플레이어가 발견 가능
- 결정적 증거는 합리적 탐색으로 발견
- Red herring은 논리적 설명 제공
- 초자연적 요소 금지
- 타임라인 일관성 보장

### 📊 Difficulty Scaling

| Difficulty | Locations | Evidence | Critical | Obvious Ratio |
|------------|-----------|----------|----------|---------------|
| Easy       | 3         | 6-8      | 3        | 70%           |
| Medium     | 4         | 8-12     | 4        | 50%           |
| Hard       | 5         | 12-15    | 5        | 30%           |
| Legendary  | 5-6       | 15-18    | 6        | 20%           |

### 🖼️ AI Image Generation

- **Location Images**: 1024×768, crime scene photography style
- **Evidence Images**: 512×512, forensic documentation style
- Gemini API integration
- Automatic validation and retry
- Professional quality assurance

### 🎮 Game Integration

- Parallel investigation (locations + interrogation)
- Evidence-based scoring
- Achievement system
- Community features (sharing, challenges)

## File Structure

```
evidence-system-architect/
├── SKILL.md                    # Main skill documentation (32KB)
├── README.md                   # This file
└── references/
    ├── evidence-types.md       # Evidence type library (14KB)
    ├── location-props.md       # Location props library (17KB)
    ├── difficulty-configs.md   # Difficulty settings (19KB)
    ├── fair-play-checklist.md  # Fair Play validation (20KB)
    └── image-generation-guide.md # Image generation guide (23KB)
```

## Key Concepts

### Evidence Types

1. **Critical Evidence (30%)**: 범인 특정에 필수적
2. **Supporting Evidence (40%)**: 추리를 뒷받침
3. **Red Herring (30%)**: 미끼 증거 (논리적 설명 필수)

### Discovery Difficulty

1. **Obvious**: Quick Search로 발견 (70-90%)
2. **Medium**: Thorough Search 필요 (40-75%)
3. **Hidden**: Exhaustive Search 필요 (15-40%)

### Search Types

1. **Quick Search**: 빠른 탐색 (비용 1)
2. **Thorough Search**: 철저한 탐색 (비용 2-5)
3. **Exhaustive Search**: 완벽한 탐색 (비용 3-10)

## Usage Examples

### Example 1: Generate Evidence for Easy Difficulty

```typescript
const easyCase = {
  difficulty: 'easy',
  locations: [
    { id: 'crime_scene', name: '피해자의 서재' },
    { id: 'victim_home', name: '피해자의 침실' },
    { id: 'suspect_A_home', name: '용의자 A의 아파트' }
  ],
  evidence: [
    {
      name: '청산가리가 든 와인잔',
      type: 'critical',
      difficulty: 'obvious',
      location: 'crime_scene',
      probability: { quick: 0.9, thorough: 1.0, exhaustive: 1.0 }
    },
    // ... more evidence
  ]
};
```

### Example 2: Validate Fair Play

```typescript
import { FairPlayValidator } from './skills/evidence-system-architect';

const validation = FairPlayValidator.validate(generatedCase);

if (!validation.isValid) {
  console.error('Fair Play violations:', validation.errors);
}
```

### Example 3: Generate Location Image

```typescript
import { LocationImageGenerator } from './skills/evidence-system-architect';

const locationImage = await LocationImageGenerator.generate({
  name: '피해자의 서재',
  description: '고급 가구로 꾸며진 서재. 책상 위에 와인잔 2개.',
  timeOfDay: 'night',
  mood: 'tense'
});
```

## Integration with Other Skills

- **mystery-game-designer**: Fair Play 원칙 및 난이도 밸런싱
- **ai-prompt-engineer**: 증거 생성 프롬프트 최적화
- **gemini-image-generator**: 장소 및 증거 이미지 생성
- **viral-detective-challenge**: 증거 기반 커뮤니티 챌린지

## Common Workflows

### Workflow 1: Complete Evidence System Implementation

1. **Phase 1**: Core system (locations, evidence, basic search)
2. **Phase 2**: Difficulty scaling & game integration
3. **Phase 3**: Advanced features (evidence board, connections)
4. **Phase 4**: Community & viral features

### Workflow 2: Evidence Generation & Validation

1. Generate case elements (weapon, motive, suspects)
2. Generate locations based on difficulty
3. Generate evidence with proper distribution
4. Validate Fair Play compliance
5. Generate images for all locations and evidence
6. Integrate into game database

## Best Practices

1. **Fair Play First**: 항상 Fair Play 원칙을 최우선으로
2. **Difficulty Consistency**: 난이도 설정과 실제 난이도 일치
3. **Evidence Variety**: 다양한 증거 타입 혼합
4. **Logical Red Herrings**: Red herring은 반드시 논리적 설명과 함께
5. **Image Quality**: 이미지 생성 실패 시 재시도 로직 필수
6. **Player Feedback**: 플레이어 피드백을 통한 지속적 개선
7. **Testing**: 각 난이도별 충분한 테스트

## Troubleshooting

### 증거가 너무 쉽게/어렵게 발견됨

→ `difficulty-configs.md` 참조하여 발견 확률 조정

### Fair Play 위반

→ `fair-play-checklist.md`의 10 Commandments 확인

### 이미지 생성 실패

→ `image-generation-guide.md`의 재시도 로직 및 프롬프트 최적화 참조

### 증거 분포 불균형

→ `evidence-types.md`의 분포 가이드 참조

## Contributing

이 스킬을 개선하려면:

1. 새로운 증거 타입 추가: `references/evidence-types.md`
2. 장소 소품 추가: `references/location-props.md`
3. 난이도 설정 조정: `references/difficulty-configs.md`
4. Fair Play 규칙 추가: `references/fair-play-checklist.md`
5. 이미지 생성 개선: `references/image-generation-guide.md`

## Version

- **Version**: 1.0.0
- **Created**: 2025-10-20
- **Last Updated**: 2025-10-20
- **Authors**: Expert Panel (Mystery Game Designer, AI Prompt Engineer, Murder Mystery Designer, Viral Detective Community)

## License

This skill is part of the armchair-sleuths project.

---

**Need Help?**

- Read `SKILL.md` for comprehensive documentation
- Check `references/` for detailed guides
- See examples in the main SKILL.md file

**Ready to build amazing evidence systems? Start exploring!** 🔍
