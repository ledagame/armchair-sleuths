# 세계급 미스터리 생성 시스템 - 스토리/플롯/트릭 영역 설계

**작성일**: 2025-10-09
**버전**: 1.0
**목적**: AI 머더미스터리 게임의 스토리 생성 품질을 세계 최고 수준으로 개선

---

## 목차

1. [Stage 1: Core Blueprint - Solution-First Design](#stage-1-core-blueprint---solution-first-design)
2. [Stage 4: Misdirection Layer](#stage-4-misdirection-layer)
3. [Stage 5: Narrative Structure](#stage-5-narrative-structure)
4. [트릭 카탈로그](#트릭-카탈로그)
5. [Double Twist 템플릿](#double-twist-템플릿)
6. [검증 체크리스트](#검증-체크리스트)
7. [구현 가이드](#구현-가이드)

---

## Stage 1: Core Blueprint - Solution-First Design

### Christie 역설계 방법론

**핵심 철학**: 결말부터 설계하고 역으로 스토리를 구축한다.

> "You must know who did it, how, and why before you know what happens."
> — Agatha Christie

### 1.1 Gemini API 프롬프트 템플릿: Core Blueprint Generation

```json
{
  "prompt_type": "core_blueprint",
  "system_instruction": "You are a world-class mystery writer specializing in Agatha Christie's solution-first design methodology. Your task is to generate a logically sound, fair-play murder mystery blueprint that prioritizes uniqueness and deducibility.",

  "input_format": {
    "user_concept": "string (사용자의 기본 아이디어)",
    "setting_preference": "string (선호하는 배경/시대)",
    "tone": "enum [cozy, noir, psychological, procedural]",
    "complexity": "enum [beginner, intermediate, expert]"
  },

  "output_structure": {
    "WHO": {
      "killer_identity": "string",
      "killer_background": "string",
      "killer_psychology": "string",
      "why_least_likely": "string (왜 이 인물이 의외인가)"
    },

    "HOW": {
      "murder_method": "string",
      "murder_mechanism": "string (구체적 실행 방법)",
      "physical_evidence": "array of objects",
      "impossibility_element": "string (겉보기 불가능 요소)",
      "real_explanation": "string (실제 논리적 설명)"
    },

    "WHY": {
      "apparent_motive": "string (겉보기 동기)",
      "true_motive": "string (진짜 동기)",
      "motive_category": "enum [revenge, greed, protection, obsession, secret]",
      "emotional_core": "string (감정적 핵심)"
    },

    "WHEN": {
      "apparent_time": "string (목격자들이 생각하는 시간)",
      "actual_time": "string (실제 살인 시간)",
      "time_manipulation": "string (시간 조작 기법)",
      "alibi_construction": "string (알리바이 구축 방법)"
    },

    "WHERE": {
      "crime_scene": "string",
      "scene_characteristics": "array of strings",
      "accessibility": "string (출입 가능성)",
      "locked_room_element": "boolean",
      "scene_staging": "string (현장 연출 방법)"
    },

    "PROOF": {
      "clue_1": {
        "type": "physical|testimonial|behavioral",
        "content": "string",
        "placement": "percentage (스토리 배치 위치)",
        "obviousness": "enum [subtle, medium, clear]",
        "fair_play_justification": "string"
      },
      "clue_2": {...},
      "clue_3": {...},
      "connecting_clue": {
        "content": "string",
        "reveals": "string (무엇을 연결하는가)"
      }
    }
  },

  "validation_rules": {
    "logical_uniqueness": "Only ONE person could have committed this crime given all constraints",
    "fair_play": "All PROOF clues must be discoverable through logical investigation",
    "minimum_suspects": 4,
    "maximum_suspects": 8,
    "clue_distribution": "3 clues minimum for WHO, HOW, WHY each",
    "impossibility_resolution": "Every 'impossible' element must have logical explanation"
  },

  "generation_instructions": [
    "1. Start with TRUE solution (WHO + HOW + WHY + WHEN + WHERE)",
    "2. Identify what makes this solution UNIQUE (only one person fits)",
    "3. Design PROOF clues that lead to this solution when combined",
    "4. Ensure PROOF clues follow Three Clue Rule (3+ independent paths)",
    "5. Validate logical consistency (timeline, physical possibility)",
    "6. Check fair play compliance (all clues discoverable)",
    "7. Rate difficulty on 1-10 scale",
    "8. Provide 'solver path' showing how player can deduce solution"
  ]
}
```

### 1.2 입력 예시

```json
{
  "user_concept": "작은 섬에서 벌어진 부호의 살인 사건",
  "setting_preference": "1920s 고립된 저택",
  "tone": "cozy",
  "complexity": "intermediate"
}
```

### 1.3 출력 예시 (축약)

```json
{
  "WHO": {
    "killer_identity": "집사 (Mr. Pemberton)",
    "why_least_likely": "가장 충성스럽고 40년간 복무한 인물로 묘사됨"
  },

  "HOW": {
    "murder_method": "Delayed-action poisoning",
    "murder_mechanism": "피해자가 매일 복용하는 심장약에 소량의 독물을 3일간 누적 투여. 저용량이라 증상이 나타나지 않다가, 파티 날 밤 치사량 도달",
    "impossibility_element": "집사는 파티 당일 줄곧 손님들과 함께 있었고, 피해자 혼자 서재에서 사망",
    "real_explanation": "살인은 3일 전에 완료됨. 파티 당일은 단지 독이 작동한 날"
  },

  "WHY": {
    "apparent_motive": "없음 (충성스러운 집사)",
    "true_motive": "피해자가 40년 전 집사의 딸을 성폭행했고, 딸은 자살. 집사는 그때부터 복수를 계획",
    "emotional_core": "아버지의 절망적이고 긴 복수"
  },

  "PROOF": {
    "clue_1": {
      "type": "behavioral",
      "content": "집사가 피해자의 약통을 다룰 때 유독 조심스러운 태도 (10% 지점에서 목격됨)",
      "placement": "10%",
      "obviousness": "subtle"
    },
    "clue_2": {
      "type": "physical",
      "content": "집사의 방에서 발견된 오래된 약학 교과서 (40% 지점)",
      "placement": "40%",
      "obviousness": "medium"
    },
    "clue_3": {
      "type": "testimonial",
      "content": "마을 의사가 '집사의 딸이 40년 전 자살했다'는 사실 언급 (60% 지점)",
      "placement": "60%",
      "obviousness": "clear"
    }
  }
}
```

### 1.4 제약 조건 (Constraints)

**논리적 유일성 (Logical Uniqueness)**:

```python
# 검증 알고리즘
def validate_uniqueness(blueprint):
    """
    주어진 모든 단서와 제약 조건에서
    오직 한 명의 용의자만 범인일 수 있는지 검증
    """
    suspects = blueprint.get_all_suspects()
    clues = blueprint.PROOF.get_all_clues()

    valid_suspects = []
    for suspect in suspects:
        if can_explain_all_clues(suspect, clues):
            valid_suspects.append(suspect)

    if len(valid_suspects) == 1:
        return True, "Unique solution exists"
    elif len(valid_suspects) == 0:
        return False, "No valid solution - blueprint is impossible"
    else:
        return False, f"Ambiguous - {len(valid_suspects)} suspects fit evidence"
```

**Fair Play 원칙**:

- 모든 PROOF 단서는 플레이어가 논리적 조사를 통해 발견 가능해야 함
- 숨겨진 대화, 오프스크린 사건 금지
- 탐정(AI)이 아는 모든 정보는 플레이어에게도 제공되어야 함

**최소 가능성 용의자 (Minimum Viable Suspects)**:

- 용의자는 최소 4명, 최대 8명
- 각 용의자는 동기(Motive) + 기회(Opportunity) + 수단(Means) 보유
- 그러나 최종적으로는 오직 1명만 모든 증거를 설명 가능

---

## Stage 4: Misdirection Layer

### 4.1 거짓 해결책 생성 (Ellery Queen 방식)

**핵심 원리**: 진짜 해결책으로 가는 길에 1-2개의 그럴듯한 거짓 해결책을 배치한다.

### 4.1.1 Gemini API 프롬프트: False Solution Generator

```json
{
  "prompt_type": "false_solution_generator",
  "system_instruction": "You are an expert in Ellery Queen's 'Challenge to the Reader' technique. Generate plausible but ultimately incorrect solutions that will mislead players while maintaining fair play.",

  "input": {
    "core_blueprint": "object (Stage 1에서 생성된 Core Blueprint)",
    "num_false_solutions": "integer (1-2)",
    "reveal_timing": "array of percentages (ex: [60%, 75%])"
  },

  "output_structure": {
    "false_solution_1": {
      "timing": "60%",
      "accused_suspect": "string (거짓 용의자)",
      "apparent_evidence": [
        {
          "clue": "string",
          "interpretation": "string (왜 이 용의자를 가리키는 것처럼 보이는가)"
        }
      ],
      "logical_case": "string (일관성 있는 논리적 주장)",
      "fatal_flaw": "string (왜 이 해결책이 틀렸는가)",
      "flaw_reveal_method": "string (어떻게 오류가 드러나는가)",
      "flaw_reveal_timing": "percentage (언제 오류가 드러나는가)"
    },

    "false_solution_2": {...}
  },

  "design_rules": {
    "plausibility": "Must use subset of real clues in misleading way",
    "fairness": "Fatal flaw must be discoverable through careful reasoning",
    "progression": "Each false solution should seem MORE convincing than the last",
    "education": "Rejecting false solutions should teach player about real solution"
  }
}
```

### 4.1.2 거짓 해결책 예시

```json
{
  "false_solution_1": {
    "timing": "60%",
    "accused_suspect": "피해자의 조카 (Edward)",
    "apparent_evidence": [
      {
        "clue": "Edward가 파티 당일 피해자와 격렬하게 다툼",
        "interpretation": "상속 문제로 갈등이 있었고, 살인 동기 존재"
      },
      {
        "clue": "Edward의 지문이 서재 문손잡이에서 발견됨",
        "interpretation": "살인 현장에 있었다는 물리적 증거"
      }
    ],
    "logical_case": "Edward는 유산을 빼앗길 위기에 처해 분노했고, 파티 혼란을 틈타 삼촌을 독살했다. 그의 알리바이는 약하며, 동기와 기회가 명확하다.",
    "fatal_flaw": "독의 작동 시간과 Edward의 행적이 맞지 않음. 독이 투여된 시점(3일 전)에 Edward는 런던에 있었다.",
    "flaw_reveal_method": "독물학자의 증언을 통해 독의 누적 기간이 밝혀짐",
    "flaw_reveal_timing": "70%"
  }
}
```

### 4.2 Red Herring 설계

**정의**: Red Herring은 작가가 의도적으로 배치한 잘못된 방향 지시기. 플레이어를 미혹하지만, 스토리 내에서 다른 의미를 가져야 한다.

### 4.2.1 Red Herring 카테고리

| 유형 | 설명 | 예시 | Fair Play 조건 |
|------|------|------|----------------|
| **연결된 Red Herring** | 다른 범죄와 연결됨 | 용의자가 긴장하는 이유: 살인 때문이 아니라 횡령 때문 | 진짜 이유가 나중에 밝혀져야 함 |
| **잘못된 동기** | 그럴듯하지만 틀린 동기 | 금전적 동기로 보이지만 실제는 복수 | 진짜 동기가 더 강력해야 함 |
| **타이밍 오해** | 중요해 보이지만 무관한 사건 | 살인 직전의 말다툼 (실제 살인은 3일 전) | 타임라인이 명확히 제시되어야 함 |
| **의심스러운 행동** | 수상하지만 무고한 행동 | 야밤에 몰래 나가는 인물 (실제는 외도) | 진짜 이유가 설명되어야 함 |
| **물리적 증거** | 오해를 유발하는 증거 | 피 묻은 옷 (사실은 사냥 후 옷) | 증거의 진짜 출처가 확인되어야 함 |

### 4.2.2 Red Herring 생성 프롬프트

```json
{
  "prompt_type": "red_herring_generator",
  "system_instruction": "Generate red herrings that are plausible, interesting, and ultimately meaningful to the story even when revealed to be false.",

  "input": {
    "core_blueprint": "object",
    "false_solutions": "array of objects",
    "max_red_herrings": 3
  },

  "output_structure": {
    "red_herring_1": {
      "type": "connected_crime | false_motive | timing_misdirection | suspicious_behavior | physical_evidence",
      "suspect": "string",
      "misleading_element": "string (무엇이 의심스러운가)",
      "apparent_significance": "string (왜 중요해 보이는가)",
      "true_explanation": "string (실제 이유)",
      "reveal_timing": "percentage",
      "story_value": "string (거짓으로 밝혀진 후에도 스토리에 기여하는 점)"
    }
  },

  "design_rules": {
    "maximum": "3 red herrings per story",
    "meaningfulness": "Each red herring must contribute to character depth or subplot",
    "plausibility": "Must be as believable as true clues initially",
    "resolution": "All red herrings must be explained before final reveal"
  }
}
```

### 4.3 Christie 미스디렉션 기법 카탈로그

#### 기법 1: Flagpole Technique (깃대 기법)

**정의**: 진짜 단서는 조용히 언급하고, Red Herring에는 큰 "깃대"를 꽂아 주목받게 한다.

**적용 방법**:
```json
{
  "scene": "피해자의 서재 조사",
  "flagpole_element": {
    "content": "벽난로 위의 대검이 피로 얼룩져 있다!",
    "presentation": "dramatic, with exclamation, multiple witnesses notice",
    "true_significance": "Red Herring - 피해자가 전날 사냥감을 손질함"
  },
  "hidden_clue": {
    "content": "책상 위의 약통 뚜껑이 약간 느슨하다",
    "presentation": "mentioned casually in environmental description",
    "true_significance": "진짜 살인 방법 (약 교체)"
  }
}
```

**예시 프롬프트**:
```
"Create a crime scene description where:
1. A dramatic, obvious element (bloody weapon, torn letter) draws attention
2. Crucial clue (loose bottle cap, faint smell) is mentioned casually
3. The dramatic element is later explained as red herring
4. The casual detail proves to be the murder method"
```

#### 기법 2: The Underplayed Vital Clue (축소 표현된 중요 단서)

**정의**: 중요한 단서를 언급할 때 "흥미롭군", "이상하네" 같은 축소 표현을 사용해 중요성을 감춤.

**언어 패턴**:
- ❌ "이것은 매우 중요하다!" → 플레이어가 주목함
- ✅ "흥미롭군, 뭐 별 것 아닐 수도 있지만..." → 플레이어가 지나침

**프롬프트 지시**:
```json
{
  "instruction": "When presenting crucial clues, use dismissive language:",
  "examples": [
    "\"Interesting, though probably nothing...\"",
    "\"Odd, but hardly relevant\"",
    "\"I noticed in passing that...\"",
    "\"Minor detail, but...\"",
    "\"Curious, though it likely doesn't matter\""
  ],
  "contrast": "Use emphatic language for red herrings: 'Crucially!', 'Most significantly!'"
}
```

#### 기법 3: List Misdirection (목록 미스디렉션)

**정의**: 체계적인 목록이나 나열을 사용해 패턴을 숨긴다.

**적용 사례**:
```json
{
  "example": "And Then There Were None",
  "technique": "10명의 인물을 동등하게 나열하여, 진짜 범인을 목록 속에 숨김",
  "implementation": {
    "step_1": "Create systematic list of all suspects with equal detail",
    "step_2": "Include killer in middle of list, not at beginning or end",
    "step_3": "Give each person similar description length",
    "step_4": "Make killer's description as neutral as others"
  }
}
```

#### 기법 4: The Discredited Witness (신뢰받지 못하는 증인)

**정의**: 중요한 정보를 가진 인물을 "신뢰할 수 없는" 것으로 설정해, 증언을 무시하게 만든다.

**프롬프트 패턴**:
```json
{
  "witness_setup": {
    "identity": "어린이, 취객, 노인, 전과자, 정신병 이력자",
    "crucial_information": "실제로 본 것 (killer의 정체, 시간대 등)",
    "discrediting_factors": [
      "다른 캐릭터들이 증언을 무시함",
      "과거에 거짓말한 적 있음",
      "혼란스러운 말투",
      "명백한 오류 포함 (하지만 핵심은 맞음)"
    ]
  },
  "fair_play": "핵심 정보는 정확해야 하며, 플레이어가 재평가 가능해야 함"
}
```

#### 기법 5: Time Manipulation Misdirection

**정의**: 사건의 실제 발생 시간과 발견 시간을 분리해 알리바이를 조작한다.

**패턴**:
```json
{
  "pattern_1": {
    "name": "Delayed Discovery",
    "description": "살인은 일찍 발생했지만 늦게 발견됨",
    "example": "피해자는 월요일 밤 사망했지만, 시체는 수요일 발견. 범인은 화요일 알리바이를 주장"
  },
  "pattern_2": {
    "name": "Staged Time",
    "description": "현장을 조작해 다른 시간처럼 보이게 함",
    "example": "벽난로의 불, 아직 따뜻한 차 등으로 최근 사건처럼 위장"
  },
  "pattern_3": {
    "name": "Multiple Attacks",
    "description": "여러 번의 공격으로 사망 시점을 모호하게 함",
    "example": "치명적 독은 월요일, 발견된 상처는 화요일 (사후)"
  }
}
```

### 4.4 미스디렉션 검증 체크리스트

```yaml
misdirection_quality_check:
  false_solutions:
    - [ ] 최소 1개, 최대 2개 생성됨
    - [ ] 각 거짓 해결책이 진짜 단서의 부분집합을 사용함
    - [ ] 치명적 결함이 논리적으로 발견 가능함
    - [ ] 거짓 해결책을 거부하는 과정이 교육적임

  red_herrings:
    - [ ] 최대 3개로 제한됨
    - [ ] 각 Red Herring이 캐릭터 깊이나 서브플롯에 기여함
    - [ ] 모든 Red Herring이 최종 폭로 전에 설명됨
    - [ ] Red Herring이 진짜 단서만큼 그럴듯함

  christie_techniques:
    - [ ] 최소 2가지 Christie 기법 사용됨
    - [ ] Flagpole Technique으로 주의 분산 성공
    - [ ] 중요 단서가 축소 표현으로 제시됨
    - [ ] 신뢰받지 못하는 증인이 있다면, 그의 증언이 부분적으로 정확함

  fair_play:
    - [ ] 모든 미스디렉션이 사후에 설명 가능함
    - [ ] 플레이어가 조심스럽게 추론하면 진실에 도달 가능함
    - [ ] 정보를 숨기지 않고, 주의를 다른 곳으로 돌림
    - [ ] 진짜 단서가 항상 접근 가능함
```

---

## Stage 5: Narrative Structure

### 5.1 3막 구조 비트 정확한 배치

**기준**: 90,000 단어 소설 기준 (게임에서는 플레이 시간 비율로 변환)

### 5.1.1 Act Structure Prompt Template

```json
{
  "prompt_type": "narrative_structure_generator",
  "system_instruction": "Generate precise beat sheet following three-act mystery structure with exact percentage placements for maximum tension and revelation timing.",

  "input": {
    "core_blueprint": "object (from Stage 1)",
    "misdirection_layer": "object (from Stage 4)",
    "target_length": "string (words for novel, minutes for game)"
  },

  "output_structure": {
    "act_1_setup": {
      "percentage": "0-25%",
      "key_beats": [
        {
          "beat": "Hook & World Establishment",
          "percentage": "0-12%",
          "content": "string (Introduce protagonist, setting, normal world)",
          "atmosphere": "Growing unease",
          "clues_introduced": 0
        },
        {
          "beat": "Inciting Incident - The Murder",
          "percentage": "12%",
          "content": "string (Crime occurs)",
          "presentation": "Shocking but not gratuitous",
          "clues_introduced": 2
        },
        {
          "beat": "All Players Introduced",
          "percentage": "20%",
          "content": "All suspects, victim background, detective commitment",
          "fair_play_note": "No new suspects after this point",
          "clues_introduced": 4
        },
        {
          "beat": "First Major Plot Point",
          "percentage": "25%",
          "content": "Case becomes personal to detective",
          "stakes": "Established clearly",
          "clues_introduced": 2
        }
      ],
      "total_clues": 8,
      "clue_percentage": "40% of total major clues"
    },

    "act_2_confrontation": {
      "percentage": "25-75%",
      "key_beats": [
        {
          "beat": "First Pinch Point",
          "percentage": "37%",
          "content": "Stakes raised (second victim or danger escalates)",
          "red_herring_peak": "First red herring seems strongest here"
        },
        {
          "beat": "Midpoint - False High or Low",
          "percentage": "50%",
          "content": "FALSE SOLUTION 1 presented",
          "technique": "Protagonist thinks solved (wrong) OR seems hopeless",
          "shift": "Detective moves from REACTIVE to ACTIVE",
          "clues_introduced": 3
        },
        {
          "beat": "Second Pinch Point",
          "percentage": "62%",
          "content": "False Solution 1 collapses, new evidence emerges",
          "complication": "Additional personal stakes"
        },
        {
          "beat": "Second Plot Point - Challenge to Reader",
          "percentage": "75%",
          "content": "ALL CLUES NOW PRESENTED (Fair Play guarantee)",
          "false_solution_2": "May be presented here",
          "atmosphere": "Maximum tension before resolution"
        }
      ],
      "total_clues": 12,
      "clue_percentage": "60% of total major clues"
    },

    "act_3_resolution": {
      "percentage": "75-100%",
      "key_beats": [
        {
          "beat": "Crisis - The Three C's",
          "percentage": "87%",
          "content": "Protagonist's biggest test, breakthrough moment"
        },
        {
          "beat": "Climax - The Gathering",
          "percentage": "90%",
          "content": "All suspects assembled, detective reveals truth",
          "structure": [
            "Systematic elimination of false theories",
            "Presentation of true evidence chain",
            "Motive explanation",
            "Method demonstration",
            "Killer confrontation"
          ]
        },
        {
          "beat": "Conclusion",
          "percentage": "90-100%",
          "content": "Justice served, aftermath, character resolution",
          "avoid": "Overlong explanations - keep momentum"
        }
      ],
      "total_clues": 2,
      "clue_percentage": "10% (connecting clues only)"
    }
  },

  "timing_rules": {
    "clue_distribution": "40% Act 1, 50% Act 2, 10% Act 3",
    "red_herring_peak": "50-62% (Act 2 middle)",
    "false_solution_timing": ["60-70%", "75-85%"],
    "final_clue_deadline": "75% (Fair Play Rule)",
    "revelation_cascade": "85-95%"
  }
}
```

### 5.1.2 정확한 비트 배치 차트

| % | 비트 | 목적 | 단서 배치 | 긴장도 (1-10) |
|---|------|------|-----------|---------------|
| **0-12%** | Hook & Establishment | 후킹, 캐릭터 소개 | 2개 (subtle) | 3 |
| **12%** | Inciting Incident | 살인 발생 | 2개 (obvious) | 7 |
| **20%** | All Players Introduced | 용의자 완성 | 4개 (mixed) | 5 |
| **25%** | First Plot Point | 개인적 연루 | 2개 (medium) | 6 |
| **37%** | First Pinch Point | 위험 상승 | 2개 | 7 |
| **50%** | Midpoint | False Solution 1 | 3개 (key) | 8 |
| **62%** | Second Pinch Point | 복잡화 | 3개 | 7 |
| **75%** | Second Plot Point | 모든 단서 제시 | 2개 (connecting) | 9 |
| **87%** | Crisis | 돌파구 | 0 | 9 |
| **90%** | Climax | 진실 폭로 | 0 | 10 |
| **100%** | Resolution | 정리 | 0 | 4 |

### 5.2 단서 배치 타임라인

#### 5.2.1 단서 배치 전략 프롬프트

```json
{
  "prompt_type": "clue_placement_strategy",
  "system_instruction": "Distribute clues across story timeline following fair play principles and optimal pacing for mystery revelation.",

  "input": {
    "all_clues": "array from Core Blueprint PROOF section",
    "story_length": "100% timeline",
    "difficulty_target": "beginner|intermediate|expert"
  },

  "placement_algorithm": {
    "act_1": {
      "percentage_range": "0-25%",
      "clue_allocation": "40% of total clues",
      "types": [
        "Scene-setting clues (environmental)",
        "Character behavior clues",
        "Subtle foreshadowing"
      ],
      "placement_strategy": "Bury in descriptions, casual dialogue, background details"
    },

    "act_2": {
      "percentage_range": "25-75%",
      "clue_allocation": "50% of total clues",
      "types": [
        "Physical evidence discoveries",
        "Testimonial contradictions",
        "Major revelations about past",
        "False clues pointing to red herrings"
      ],
      "placement_strategy": "Mix true and false clues heavily. True clues gain clarity toward 75%"
    },

    "act_3": {
      "percentage_range": "75-100%",
      "clue_allocation": "10% of total clues",
      "types": [
        "Connecting clues (link previous evidence)",
        "Final pieces of puzzle"
      ],
      "placement_strategy": "Clarify ambiguities, show how clues connect"
    }
  },

  "clue_types_by_act": {
    "early_clues": [
      {
        "type": "Behavioral anomaly",
        "example": "Character avoids certain topics",
        "placement": "10-20%",
        "visibility": "Subtle"
      },
      {
        "type": "Environmental detail",
        "example": "Unusual object in background",
        "placement": "5-15%",
        "visibility": "Very subtle"
      }
    ],

    "mid_clues": [
      {
        "type": "Physical evidence",
        "example": "Fingerprint, fiber, document",
        "placement": "30-60%",
        "visibility": "Medium"
      },
      {
        "type": "Contradiction",
        "example": "Alibi doesn't match timeline",
        "placement": "40-65%",
        "visibility": "Clear if player is careful"
      }
    ],

    "late_clues": [
      {
        "type": "Connecting clue",
        "example": "How two earlier clues relate",
        "placement": "75-85%",
        "visibility": "Clear"
      },
      {
        "type": "Final revelation",
        "example": "Motive explanation",
        "placement": "85-95%",
        "visibility": "Explicit"
      }
    ]
  }
}
```

#### 5.2.2 단서 배치 예시 (Core Blueprint 예시 기반)

```json
{
  "clue_timeline": [
    {
      "percentage": "10%",
      "clue": "집사가 약통을 다룰 때 유독 조심스러운 태도",
      "type": "behavioral",
      "presentation": "Maid mentions casually: 'Mr. Pemberton always handles Master's pills so carefully, like they were made of glass.'",
      "player_likely_interpretation": "집사는 충성스럽다 (Red Herring interpretation)",
      "true_significance": "집사가 약을 조작하고 있어서 조심스러움"
    },

    {
      "percentage": "25%",
      "clue": "피해자가 3일 전부터 약간의 두통을 호소함",
      "type": "testimonial",
      "presentation": "Doctor mentions during examination of body",
      "player_likely_interpretation": "단순한 배경 정보",
      "true_significance": "독이 누적되기 시작한 시점"
    },

    {
      "percentage": "40%",
      "clue": "집사의 방에서 발견된 오래된 약학 교과서",
      "type": "physical",
      "presentation": "During room search, player finds dusty pharmacology textbook",
      "player_likely_interpretation": "집사의 과거 관심사? (Medium suspicion)",
      "true_significance": "집사가 독물학을 공부했음"
    },

    {
      "percentage": "55%",
      "clue": "피해자의 일기에서 40년 전 '끔찍한 사건' 언급",
      "type": "physical",
      "presentation": "Diary found in locked drawer: 'That terrible business 40 years ago still haunts me'",
      "player_likely_interpretation": "피해자의 죄책감 (하지만 구체적 내용 불명)",
      "true_significance": "집사의 딸 사건을 가리킴"
    },

    {
      "percentage": "60%",
      "clue": "마을 의사가 집사의 딸이 40년 전 자살했다고 언급",
      "type": "testimonial",
      "presentation": "Village doctor: 'Poor Pemberton, never got over his daughter's suicide...'",
      "player_likely_interpretation": "집사의 비극적 과거 (동정 유발)",
      "true_significance": "살인 동기의 핵심"
    },

    {
      "percentage": "70%",
      "clue": "독물학자 증언: 독의 작용 시간은 3-5일",
      "type": "testimonial",
      "presentation": "Expert witness explains poison mechanism",
      "player_likely_interpretation": "False Solution 1 (Edward) 붕괴 - 그는 3일 전 런던에 있었음",
      "true_significance": "진짜 범인은 3일 전에도 저택에 있었어야 함 (집사!)"
    },

    {
      "percentage": "75%",
      "clue": "집사가 3일 전 피해자에게 약을 직접 가져다준 목격담",
      "type": "testimonial",
      "presentation": "Maid recalls: 'Three days ago, Mr. Pemberton personally brought Master's pills to his room'",
      "player_likely_interpretation": "Connection starting to form",
      "true_significance": "독 투여 시점 + 기회 확정"
    },

    {
      "percentage": "85%",
      "clue": "피해자의 오래된 편지에서 집사의 딸에 대한 죄책감 표현",
      "type": "physical",
      "presentation": "Hidden letter found: 'I wronged Pemberton's daughter... unforgivable...'",
      "player_likely_interpretation": "피해자가 집사의 딸을 해쳤음 - 집사의 동기 확정",
      "true_significance": "동기 + WHO + HOW 모두 연결됨"
    }
  ],

  "timeline_summary": {
    "act_1_clues": 2,
    "act_2_clues": 5,
    "act_3_clues": 1,
    "total": 8,
    "fair_play_checkpoint": "75% - all clues presented"
  }
}
```

### 5.3 긴장감 곡선 설계

#### 5.3.1 긴장감 곡선 생성 프롬프트

```json
{
  "prompt_type": "tension_curve_generator",
  "system_instruction": "Generate optimal tension curve for mystery story ensuring escalation, oscillation, and climactic peak.",

  "input": {
    "narrative_structure": "object (from 5.1)",
    "story_type": "cozy|noir|psychological|thriller"
  },

  "tension_formula": {
    "baseline": 3,
    "escalation_rule": "Each major event should be higher tension than previous",
    "oscillation": "Allow breathing spaces between peaks",
    "peak": 10,
    "peak_timing": "90% (Climax)"
  },

  "output_structure": {
    "tension_points": [
      {"percentage": 0, "tension": 3, "event": "Story opening"},
      {"percentage": 10, "tension": 5, "event": "Growing unease"},
      {"percentage": 12, "tension": 7, "event": "Murder discovery"},
      {"percentage": 15, "tension": 5, "event": "Investigation begins (breathing space)"},
      {"percentage": 25, "tension": 6, "event": "Personal involvement"},
      {"percentage": 37, "tension": 7, "event": "First Pinch Point"},
      {"percentage": 45, "tension": 6, "event": "Investigation deepening"},
      {"percentage": 50, "tension": 8, "event": "False Solution 1"},
      {"percentage": 55, "tension": 7, "event": "Solution collapse"},
      {"percentage": 62, "tension": 7, "event": "Second Pinch Point"},
      {"percentage": 70, "tension": 8, "event": "Breakthrough moment"},
      {"percentage": 75, "tension": 9, "event": "All clues converge"},
      {"percentage": 87, "tension": 9, "event": "Crisis"},
      {"percentage": 90, "tension": 10, "event": "Climax - Truth revealed"},
      {"percentage": 95, "tension": 6, "event": "Aftermath"},
      {"percentage": 100, "tension": 4, "event": "Epilogue"}
    ]
  },

  "validation_rules": {
    "no_regression": "Tension should never drop below previous local minimum",
    "clear_peak": "90% must be highest tension point",
    "breathing_space": "After each peak above 7, next point should be 1-2 points lower",
    "escalation": "Each major peak should be higher than previous major peak"
  }
}
```

#### 5.3.2 긴장감 곡선 시각화 (ASCII)

```
긴장도
  10 |                                      * (90% Climax)
   9 |                                  *       *
   8 |                         *   *        *
   7 |                 *   *       *    *
   6 |             *       *   *      *         *
   5 |         *       *                             *
   4 |     *                                             *
   3 | *                                                     *
   2 |
   1 |___________|___________|___________|___________|_____
     0%        25%         50%         75%        100%
     Act 1     |           Act 2           |      Act 3
```

### 5.4 폭로 타이밍 최적화

#### 5.4.1 정보 폭로 전략

**원칙**: 정보는 플레이어가 이해할 준비가 되었을 때 폭로되어야 한다.

```json
{
  "revelation_strategy": {
    "early_revelations": {
      "timing": "0-25%",
      "content": [
        "피해자의 표면적 성격",
        "용의자들의 공개 관계",
        "사건의 기본 정황",
        "탐정의 배경 설정"
      ],
      "purpose": "세계관 구축, 플레이어 투자 유도"
    },

    "mid_revelations": {
      "timing": "25-75%",
      "content": [
        "피해자의 숨겨진 과거",
        "용의자들의 비밀 (Red Herrings 포함)",
        "거짓 동기와 알리바이 붕괴",
        "False Solution 제시 및 거부"
      ],
      "purpose": "복잡성 증가, 플레이어 참여 극대화"
    },

    "late_revelations": {
      "timing": "75-100%",
      "content": [
        "진짜 범인의 정체 (90%)",
        "진짜 동기와 방법 (90-95%)",
        "모든 단서의 의미 재해석 (95%)",
        "캐릭터들의 운명 (95-100%)"
      ],
      "purpose": "카타르시스, 모든 의문 해결"
    }
  },

  "revelation_techniques": {
    "cascade": {
      "description": "여러 폭로가 연쇄적으로 일어남",
      "timing": "85-95%",
      "example": "범인 정체 → 동기 → 방법 → 모든 Red Herring 설명"
    },

    "the_gathering": {
      "description": "모든 용의자를 한 곳에 모아 탐정이 체계적으로 설명",
      "timing": "90-95%",
      "structure": [
        "1. 사건 재구성",
        "2. 각 용의자 제외 (알리바이, 동기 부족 등)",
        "3. 거짓 해결책 거부",
        "4. 진짜 범인 지목",
        "5. 증거 제시",
        "6. 동기 설명",
        "7. 범인 반응 (자백 또는 부인)"
      ]
    }
  }
}
```

#### 5.4.2 폭로 타이밍 검증 체크리스트

```yaml
revelation_timing_check:
  early_game:
    - [ ] 피해자가 누구인지 명확히 제시됨 (12%)
    - [ ] 모든 주요 용의자가 소개됨 (20%)
    - [ ] 기본 상황이 이해 가능함 (25%)

  mid_game:
    - [ ] 첫 번째 주요 폭로가 50% 부근에 발생
    - [ ] False Solution이 60-70%에 제시됨
    - [ ] False Solution의 붕괴가 명확히 드러남

  late_game:
    - [ ] 모든 단서가 75%까지 제시됨 (Fair Play)
    - [ ] 범인 정체가 90%에 폭로됨
    - [ ] 동기와 방법이 90-95%에 완전히 설명됨

  epilogue:
    - [ ] 캐릭터들의 운명이 해결됨
    - [ ] 열린 의문이 없음 (의도적 애매함 제외)
    - [ ] 감정적 해결이 이루어짐
```

---

## 트릭 카탈로그

### John Dickson Carr의 8가지 Locked Room 유형 + 확장

### 6.1 밀실 살인 트릭 (Locked Room Mysteries)

#### 유형 1: 실제로 밀실이 아님 (Not Really Locked)

**설명**: 방이 밀실처럼 보이지만, 실제로는 출입 가능한 경로가 있음.

**구현 조건**:
- 비밀 통로, 이중 벽, 천장/바닥 구멍
- 잠긴 것처럼 보이지만 실제로는 열려 있음
- 범인이 나간 후 외부에서 잠금

**Fair Play 구현**:
- 비밀 통로의 존재를 암시하는 단서 필요 (건축 도면, 오래된 저택 역사 등)
- 먼지, 거미줄 패턴이 부자연스러움
- 특정 가구가 움직인 흔적

**예시 시나리오**:
```json
{
  "title": "서재 밀실 살인",
  "apparent_impossibility": "피해자는 안에서 잠긴 서재에서 사망. 문과 창문 모두 잠김",
  "true_method": "책장 뒤에 숨겨진 비밀 통로 존재. 범인은 통로로 진입 후, 피해자 살해, 통로로 탈출, 외부에서 책장을 원위치",
  "clues": [
    "책장 뒤 벽지가 다른 벽보다 새것",
    "피해자가 최근 '비밀 통로가 있는 오래된 저택' 책을 읽음",
    "책장 바닥에 거의 없는 먼지 (자주 움직임)"
  ]
}
```

#### 유형 2: 자살로 위장한 살인 (Suicide Made to Look Like Murder)

**설명**: 피해자가 자살했지만, 범인이 살인처럼 보이도록 현장을 조작함.

**구현 조건**:
- 피해자에게 자살 동기 존재
- 범인이 현장에 접근할 기회
- 자살 흔적을 지우고 타살 증거를 추가

**Fair Play 구현**:
- 자살의 징후 (유서 초안, 최근 우울증, 자살 방법 검색 기록)
- 현장 조작의 흔적 (부자연스러운 상처 각도, 시간 불일치)

**예시 시나리오**:
```json
{
  "title": "목욕탕 익사 사건",
  "apparent_impossibility": "피해자가 잠긴 욕실에서 익사. 외상 없음. 그러나 유서가 없고, 타살 징후 존재",
  "true_method": "피해자는 실제로 자살했지만 유서를 남김. 범인(유산 상속자)이 유서를 제거하고, 욕조 주변에 투쟁 흔적을 만들어 타살로 위장",
  "clues": [
    "피해자의 컴퓨터에서 삭제된 유서 파일 복구 가능",
    "욕실 바닥의 물 흔적이 부자연스러움 (사후에 뿌려짐)",
    "범인의 옷에 미세한 물방울"
  ]
}
```

#### 유형 3: 타살로 위장한 자살 (Murder Made to Look Like Suicide)

**설명**: 범인이 살인 후 자살처럼 위장함.

**구현 조건**:
- 피해자에게 겉보기 자살 동기 조작 가능
- 자살 방법을 완벽히 재현 (총, 목맴, 투신 등)
- 유서 위조

**Fair Play 구현**:
- 유서 필체 분석 (미묘한 차이)
- 자살 방법의 물리적 불가능성 (총구 각도, 밧줄 높이 등)
- 피해자의 성격과 맞지 않는 자살 방법

**예시 시나리오**:
```json
{
  "title": "작가의 자살",
  "apparent_impossibility": "유명 작가가 자택 서재에서 목을 맴. 유서 존재. 문은 안에서 잠김",
  "true_method": "범인이 피해자를 약물로 혼수 상태로 만든 후, 목을 매고 유서 위조. 안에서 잠긴 것처럼 보이게 함",
  "clues": [
    "유서의 필체가 피해자의 다른 글과 미묘하게 다름 (압력, 경사)",
    "피해자의 손톱 밑에 방어 흔적 없음 (자살이라면 본능적 저항 있어야 함)",
    "약물 검사에서 수면제 검출"
  ]
}
```

#### 유형 4: 사고로 위장한 살인 (Accident Made to Look Like Murder/Suicide)

**설명**: 실제로는 사고사였지만, 범인이 살인이나 자살처럼 보이게 함.

**구현 조건**:
- 피해자의 사고사 발생
- 범인이 현장에 증거 추가
- 사고사를 숨길 동기 (보험금, 과실치사 은폐 등)

**Fair Play 구현**:
- 원래 사고 현장의 흔적
- 추가된 증거의 시간 불일치
- 목격자 증언과 물리적 증거의 불일치

#### 유형 5: 시체 이동 (Body Moved After Death)

**설명**: 살인이 다른 장소에서 일어났지만, 시체를 밀실로 옮김.

**구현 조건**:
- 시체 운반 가능한 시간과 수단
- 원래 살인 장소 존재
- 이동 흔적 제거

**Fair Play 구현**:
- 시체 경직 상태와 사망 장소 불일치
- 밀실 내부의 혈흔 패턴 부자연스러움
- 시체에 다른 장소의 증거 (흙, 섬유 등)

**예시 시나리오**:
```json
{
  "title": "호텔 밀실 살인",
  "apparent_impossibility": "피해자가 안에서 잠긴 호텔 객실에서 사망. 체크인 후 누구도 들어간 적 없음",
  "true_method": "피해자는 실제로 호텔 지하 주차장에서 살해됨. 범인이 시체를 카트에 싣고 객실로 운반 후, 안에서 잠금. 마스터키로 나온 후 자동 잠금",
  "clues": [
    "피해자의 옷에 주차장 기름 얼룩",
    "객실 카펫에 카트 바퀴 자국",
    "사체의 시반(尸斑) 위치가 사망 자세와 불일치"
  ]
}
```

#### 유형 6: 범인이 발견자인 경우 (Killer is the Discoverer)

**설명**: 범인이 피해자를 발견한 사람으로, 발견 과정에서 범행을 완성하거나 증거를 조작함.

**구현 조건**:
- 범인이 "첫 발견자"로서 현장에 정당하게 접근
- 발견 과정에서 추가 행동 (문 잠그기, 무기 배치 등)
- 다른 사람들이 도착하기 전 짧은 시간 확보

**Fair Play 구현**:
- 발견자의 행동이 부자연스러움 (왜 그 시간에 그곳에?)
- 발견 시간과 사망 시간의 미묘한 불일치
- 발견자만 알 수 있는 정보를 범인이 앎

**예시 시나리오**:
```json
{
  "title": "서재 발견 사건",
  "apparent_impossibility": "비서가 사장을 서재에서 사망한 채 발견. 문은 안에서 잠겨 있었고, 비서가 부수고 들어감",
  "true_method": "비서가 실제 범인. 사장을 살해 후 문을 열어두고 나옴. 다음날 아침, 출근하여 '문이 잠긴 것을 발견'하고 부수고 들어가는 척. 실제로는 그 순간 문을 잠금",
  "clues": [
    "문 잠금장치에 새로운 긁힌 자국 (아침에 잠금)",
    "비서가 평소보다 일찍 출근함",
    "비서의 구두에 서재 카펫 섬유 (전날 밤에 있었음)"
  ]
}
```

#### 유형 7: 원격 살인 (Murder by Remote Mechanism)

**설명**: 범인이 현장에 없을 때 작동하는 기계 장치나 독약으로 살인.

**구현 조건**:
- 시간 지연 장치 (기계식, 화학적, 또는 심리적)
- 범인의 완벽한 알리바이
- 장치 설치 기회

**Fair Play 구현**:
- 시간 지연 메커니즘의 흔적 (타이머, 녹은 얼음, 천천히 타는 끈 등)
- 현장의 부자연스러운 장치나 배치
- 범인이 유일하게 설치할 수 있는 전문 지식

**예시 시나리오**:
```json
{
  "title": "시한 독살",
  "apparent_impossibility": "파티 중 피해자가 사망. 모든 용의자가 다른 사람들과 함께 있었음. 독은 죽기 직전 섭취된 것으로 추정",
  "true_method": "범인이 3일 전부터 피해자의 일일 약에 소량의 독을 혼합. 누적 효과로 파티 날 치사량 도달. 범인은 파티 내내 알리바이 확보",
  "clues": [
    "피해자가 3일 전부터 경미한 증상 (두통, 메스꺼움) 호소",
    "약병의 약 색깔이 미묘하게 다름",
    "범인이 약학 배경 보유"
  ]
}
```

#### 유형 8: 심리적 조작 살인 (Psychological Manipulation)

**설명**: 범인이 직접 손대지 않고, 심리적 압박이나 조작을 통해 피해자가 자살하거나 사고사하도록 유도.

**구현 조건**:
- 피해자의 심리적 취약점
- 범인의 계획적이고 은밀한 조작
- 직접적 물리적 접촉 없음

**Fair Play 구현**:
- 피해자에게 가해진 심리적 압박의 패턴
- 범인의 조작 행위 기록 (편지, 메시지, 소문 유포 등)
- 피해자의 정신 상태 변화 과정

**예시 시나리오**:
```json
{
  "title": "가스라이팅 살인",
  "apparent_impossibility": "피해자가 고층 아파트에서 투신 자살. 범인은 사건 당시 다른 도시에 있었음. 유서 없음",
  "true_method": "범인이 수개월간 피해자에게 '환청이 들린다'고 믿게 만듦. 가짜 소음 장치 설치, 피해자의 물건 이동, 주변 사람들에게 '정신병 의심' 소문 유포. 피해자가 정신적으로 붕괴하여 자살",
  "clues": [
    "피해자의 아파트에서 소형 스피커 발견 (범인이 원격 조종)",
    "피해자의 SNS에 '이상한 소리', '사람들이 나를 의심한다' 글 증가",
    "범인이 피해자의 정신과 진단서에 접근한 기록"
  ]
}
```

### 6.2 알리바이 트릭 (Alibi Tricks)

#### 유형 1: 시간 조작 (Time Manipulation)

**설명**: 사망 시간을 조작하여 범인의 알리바이를 만듦.

**기법**:
- 시체 냉동/가열로 시반 조작
- 사망 시간을 늦추거나 앞당기는 환경 조성
- 시계 조작

**Fair Play 구현**:
- 현장 온도 이상 (너무 차갑거나 뜨거움)
- 시계들이 모두 같은 시간에 멈춤 (의도적 조작)
- 시반과 위 내용물 소화 정도 불일치

#### 유형 2: 공범 알리바이 (Accomplice Alibi)

**설명**: 제3자가 범인의 알리바이를 증언하여 거짓 알리바이 제공.

**기법**:
- 공범이 범인이 다른 곳에 있었다고 증언
- 전화 통화 위장 (녹음 재생)
- 사진/영상 조작

**Fair Play 구현**:
- 공범과 범인의 비정상적 친밀함
- 증언의 세부 사항에서 모순
- 알리바이 증언이 지나치게 완벽함

#### 유형 3: 자기 알리바이 만들기 (Self-Made Alibi)

**설명**: 범인이 자신이 다른 곳에 있었다는 증거를 직접 만듦.

**기법**:
- CCTV에 찍히도록 인형/대역 사용
- 이메일/메시지 예약 발송
- 신용카드 사용 기록 조작 (온라인 결제)

**Fair Play 구현**:
- CCTV 각도가 제한적 (얼굴 안 보임)
- 메시지의 타이밍이 너무 계획적
- 신용카드 사용 패턴이 평소와 다름

### 6.3 기타 고전 트릭

#### 유형 1: 정체 바꾸기 (Identity Swap)

**설명**: 피해자와 범인이 정체를 바꾸거나, 쌍둥이/닮은 사람 이용.

**Fair Play 구현**:
- 신체적 특징의 미묘한 차이 (흉터, 점, 손톱 등)
- 행동 패턴의 불일치
- 정체 바꾸기 가능성을 암시하는 대화나 상황

#### 유형 2: 다수의 공격 (Multiple Strikes)

**설명**: 여러 사람이 같은 피해자를 공격했으나, 누가 치명타를 입혔는지 불명.

**Fair Play 구현**:
- 각 공격의 시간과 상처 패턴 분석 가능
- 치명상을 입힌 무기/방법 추정 가능
- 각 용의자의 동기와 기회 명확

#### 유형 3: 무기 소멸 (Disappearing Weapon)

**설명**: 살인 무기가 현장에서 사라짐.

**기법**:
- 얼음 무기 (녹아서 사라짐)
- 일상 용품으로 위장 (지팡이, 양초 등)
- 현장에 있지만 무기로 인식되지 않음

**Fair Play 구현**:
- 현장에 설명되지 않는 물 웅덩이
- 특정 물체가 평소 위치에 없음
- 피해자의 상처와 일치하는 물체가 현장에 있음

---

## Double Twist 템플릿

### 7.1 Double Twist 구조

**핵심 원리**: 두 개의 트릭 레이어를 겹쳐서, 첫 번째 트릭이 두 번째 트릭을 숨긴다.

### 7.1.1 Double Twist 생성 프롬프트

```json
{
  "prompt_type": "double_twist_generator",
  "system_instruction": "Create a two-layered mystery where the first trick (False Solution) hides the second trick (True Solution), following Ellery Queen's multi-solution methodology.",

  "input": {
    "core_blueprint": "object (True Solution from Stage 1)",
    "complexity": "beginner|intermediate|expert"
  },

  "output_structure": {
    "layer_1_surface_mystery": {
      "question": "string (What appears to be the mystery?)",
      "apparent_impossibility": "string (What seems impossible?)",
      "false_solution": {
        "who": "string (Wrong suspect)",
        "how": "string (Plausible but wrong method)",
        "why": "string (Believable but wrong motive)",
        "supporting_clues": [
          "clue that seems to point to this solution"
        ]
      },
      "reveal_timing": "60-70%",
      "fatal_flaw": "string (Why this solution fails)",
      "flaw_discovery": "string (How player discovers the flaw)"
    },

    "layer_2_hidden_truth": {
      "question": "string (What was really happening?)",
      "true_impossibility": "string (What was actually impossible and why)",
      "true_solution": {
        "who": "string (Real killer)",
        "how": "string (Real method that explains everything)",
        "why": "string (True motive)",
        "how_it_was_hidden": "string (How Layer 1 concealed Layer 2)"
      },
      "reveal_timing": "85-95%",
      "recontextualization": "string (How this changes understanding of all previous clues)"
    },

    "connection": {
      "how_layer_1_hides_layer_2": "string",
      "clues_that_point_to_true_solution": [
        {
          "clue": "string",
          "placement": "percentage",
          "how_it_was_misinterpreted": "string"
        }
      ]
    }
  },

  "design_rules": {
    "fair_play": "All clues for TRUE solution must be present before False Solution is presented",
    "plausibility": "False Solution must be genuinely convincing",
    "superiority": "True Solution must be more elegant/logical than False Solution",
    "recontextualization": "Every clue should have new meaning after True Solution revealed"
  }
}
```

### 7.1.2 Double Twist 예시

```json
{
  "example_title": "The Island Manor Murder",

  "layer_1_surface_mystery": {
    "question": "밀실에서 어떻게 살인이 가능했는가?",
    "apparent_impossibility": "피해자(부호)가 안에서 잠긴 서재에서 사망. 창문도 못으로 박혀있음. 유일한 열쇠는 피해자가 소지",

    "false_solution": {
      "who": "피해자의 조카 Edward",
      "how": "비밀 통로를 통해 진입, 살해 후 탈출",
      "why": "유산 상속",
      "supporting_clues": [
        "Edward가 건축 도면을 최근에 열람함",
        "Edward와 피해자가 상속 문제로 다툼",
        "Edward의 옷에서 서재 카펫과 같은 섬유 발견"
      ]
    },

    "reveal_timing": "65%",
    "fatal_flaw": "비밀 통로는 실제로 존재하지만, 40년 전에 콘크리트로 막혔음. 건축 기록 확인 결과 통로 사용 불가능",
    "flaw_discovery": "건축 전문가 증언 + 비밀 통로 발견했으나 막혀있음"
  },

  "layer_2_hidden_truth": {
    "question": "그렇다면 어떻게 진짜 살인이 일어났는가?",
    "true_impossibility": "범인은 살인 당일 저택에 없었음. 완벽한 알리바이",

    "true_solution": {
      "who": "충성스러운 집사 Mr. Pemberton",
      "how": "3일 전부터 피해자의 심장약에 소량의 독을 섞어 누적 투여. 파티 날 치사량 도달. 밀실은 관계없음 - 피해자는 자연스럽게 서재에서 혼자 사망",
      "why": "40년 전 피해자가 집사의 딸을 성폭행했고, 딸은 자살. 집사는 그때부터 복수를 계획하며 저택에서 일함",
      "how_it_was_hidden": "밀실 상황과 Edward의 동기가 너무 명백해서, 모두가 '어떻게 밀실에 들어갔는가'에 집중. 실제로는 밀실이 전혀 중요하지 않았음"
    },

    "reveal_timing": "90%",
    "recontextualization": [
      "집사가 약통을 '조심스럽게' 다룬 이유: 독을 다루고 있어서",
      "피해자의 3일 전 두통: 독이 누적되기 시작",
      "밀실 상황: 우연이었고, 오히려 수사를 헷갈리게 만드는 요소로 작용",
      "Edward의 행동: 실제로 비밀 통로를 찾고 있었지만, 전혀 다른 이유 (어릴 적 놀이터)"
    ]
  },

  "connection": {
    "how_layer_1_hides_layer_2": "밀실의 불가능성이 모든 주의를 끌어서, 시간대와 살인 방법에 대한 다른 가능성을 배제하게 만듦. 'Locked Room'에 집착하게 하여 'Delayed Poisoning'을 간과하게 함",

    "clues_that_point_to_true_solution": [
      {
        "clue": "집사가 3일 전 피해자에게 약을 직접 가져다줌 (10% 지점)",
        "placement": "10%",
        "how_it_was_misinterpreted": "충성심의 표시로 해석됨"
      },
      {
        "clue": "피해자의 오래된 일기: '끔찍한 사건이 나를 괴롭힌다' (55% 지점)",
        "placement": "55%",
        "how_it_was_misinterpreted": "사업상 문제로 해석됨"
      },
      {
        "clue": "마을 의사: '집사가 딸을 잃은 후 변했다' (60% 지점)",
        "placement": "60%",
        "how_it_was_misinterpreted": "단순한 비극적 배경 스토리로 여겨짐"
      },
      {
        "clue": "독물학자 증언: 독은 3-5일 누적 (70% 지점)",
        "placement": "70%",
        "how_it_was_misinterpreted": "False Solution (Edward)를 거부하는 증거로만 사용됨"
      }
    ]
  }
}
```

### 7.2 단서 배치 전략 (양쪽 모두 공정하게)

**핵심 원칙**: False Solution과 True Solution 모두에 대한 단서가 Fair하게 제시되어야 한다.

#### 7.2.1 이중 단서 배치 프롬프트

```json
{
  "prompt_type": "dual_clue_placement",
  "system_instruction": "Place clues for both False Solution and True Solution in a way that maintains fair play for both, but makes False Solution more obvious initially.",

  "strategy": {
    "false_solution_clues": {
      "quantity": "60% of Act 1-2 clues",
      "presentation": "Obvious, dramatic, easy to connect",
      "timing": "Front-loaded (20-60%)",
      "purpose": "Guide player to False Solution"
    },

    "true_solution_clues": {
      "quantity": "40% of Act 1-2 clues, 100% of Act 3 clues",
      "presentation": "Subtle, easily dismissed, buried",
      "timing": "Evenly distributed (10-75%)",
      "purpose": "Allow careful player to solve correctly"
    },

    "dual_interpretation_clues": {
      "description": "Clues that support BOTH solutions initially",
      "quantity": "20-30% of total clues",
      "example": "A character's nervous behavior - False: guilt, True: fear of real killer"
    }
  },

  "validation": {
    "fair_play_for_false": "Player should reasonably arrive at False Solution from clues",
    "fair_play_for_true": "Careful player should be able to doubt False Solution and find True Solution",
    "no_cheating": "True Solution clues must be present before False Solution reveal"
  }
}
```

#### 7.2.2 이중 단서 배치 예시 표

| % | 단서 | False Solution 해석 | True Solution 해석 | 타입 |
|---|------|---------------------|-------------------|------|
| 10% | 집사가 약을 조심스럽게 다룸 | (무시됨) | 독을 다루고 있어서 | True-only |
| 20% | Edward가 도면을 열람함 | 비밀 통로를 찾기 위해 | 어릴 적 추억 때문에 | Dual |
| 30% | 피해자와 Edward 다툼 목격 | 살인 동기 | 무관 (재산 문제) | False-heavy |
| 40% | 피해자의 두통 호소 (3일 전) | (무시됨) | 독 누적 시작 | True-only |
| 50% | 서재 카펫 섬유가 Edward 옷에 | 범행 현장에 있었음 | 최근 방문했음 (무관) | False-heavy |
| 60% | 마을 의사: 집사의 딸 자살 | 비극적 배경 | 살인 동기 | True-only |
| 70% | 독물학자: 3-5일 누적 | Edward 알리바이 붕괴 | 집사만 가능 | True-heavy |
| 75% | 비밀 통로가 40년 전 막힘 | False Solution 붕괴 | - | False-killer |

### 7.3 반전 타이밍 가이드

#### 7.3.1 최적 반전 타이밍

```yaml
double_twist_timing:
  false_solution_presentation:
    timing: "60-70%"
    duration: "5-10% of story"
    player_state: "Convinced they solved it"

  false_solution_collapse:
    timing: "70-75%"
    trigger: "New evidence or logical contradiction"
    player_state: "Confused, searching for new theory"

  true_solution_hints:
    timing: "75-85%"
    method: "Re-examine earlier clues with new perspective"
    player_state: "Piecing together real solution"

  true_solution_reveal:
    timing: "85-95%"
    structure: "The Gathering - systematic reveal"
    player_state: "Aha moment, recontextualization"

  epilogue:
    timing: "95-100%"
    content: "Emotional resolution, character fates"
    player_state: "Satisfied, reflective"
```

#### 7.3.2 반전 타이밍 검증

```python
def validate_twist_timing(narrative):
    """
    Double Twist의 타이밍이 최적인지 검증
    """
    checks = {
        "false_solution_before_75": narrative.false_solution_reveal < 0.75,
        "true_solution_after_false": narrative.true_solution_reveal > narrative.false_solution_collapse,
        "gap_between_twists": (narrative.true_solution_reveal - narrative.false_solution_collapse) >= 0.10,
        "all_clues_before_final": all(clue.placement < 0.75 for clue in narrative.clues),
        "climax_at_90": 0.88 <= narrative.climax_timing <= 0.92
    }

    return all(checks.values()), checks
```

---

## 검증 체크리스트

### 8.1 Fair Play 검증

```yaml
fair_play_validation:
  information_access:
    - [ ] 탐정(AI)이 아는 모든 정보가 플레이어에게 제공됨
    - [ ] 숨겨진 대화나 오프스크린 사건 없음
    - [ ] 모든 단서가 논리적 조사를 통해 발견 가능함

  logical_deduction:
    - [ ] 해결책이 제시된 단서로부터 논리적으로 도출 가능함
    - [ ] 추론 체인이 명확하고 추적 가능함
    - [ ] 범인의 정체를 가리키는 단서가 최소 3개 이상
    - [ ] 동기, 수단, 기회 모두에 대한 단서 존재

  timing:
    - [ ] 모든 필수 단서가 75% 지점까지 제시됨
    - [ ] 범인이 20% 지점까지 소개됨 (직접 또는 간접)
    - [ ] 결정적 단서가 50% 이전에 최소 1개 제시됨

  no_cheating:
    - [ ] 최종 폭로 시 새로운 단서가 추가되지 않음
    - [ ] Deus ex machina 없음 (우연한 해결)
    - [ ] 범인의 능력이 설정된 범위 내
    - [ ] 물리적 불가능성이 논리적으로 설명됨
```

### 8.2 논리적 일관성 검증

```yaml
logical_consistency_check:
  timeline:
    - [ ] 모든 사건의 시간이 일치함
    - [ ] 알리바이와 목격담이 서로 모순되지 않음
    - [ ] 시체 상태(시반, 경직)가 사망 시간과 일치

  physical_possibility:
    - [ ] 범인이 물리적으로 범행 가능함
    - [ ] 트릭이 실제로 실행 가능함
    - [ ] 현장 증거가 설명한 방법과 일치함

  character_behavior:
    - [ ] 각 캐릭터의 행동이 동기와 일치함
    - [ ] 성격이 스토리 전반에 걸쳐 일관됨
    - [ ] 범인의 행동이 계획과 논리적으로 연결됨

  motive:
    - [ ] 범인의 동기가 충분히 강력함
    - [ ] 동기가 범행 방법과 합리적으로 연결됨
    - [ ] 다른 용의자들의 동기가 설명됨 (Red Herring이어도)
```

### 8.3 미스디렉션 품질 검증

```yaml
misdirection_quality_check:
  false_solutions:
    - [ ] False Solution이 초기에 그럴듯함
    - [ ] False Solution이 실제 단서를 활용함
    - [ ] False Solution의 결함이 발견 가능함
    - [ ] False Solution 거부 과정이 교육적임

  red_herrings:
    - [ ] Red Herring이 최대 3개로 제한됨
    - [ ] 각 Red Herring이 스토리에 의미 있게 기여함
    - [ ] 모든 Red Herring이 최종적으로 설명됨
    - [ ] Red Herring이 너무 약하거나 강하지 않음

  clue_balance:
    - [ ] 진짜 단서와 거짓 단서의 비율이 적절함 (70:30)
    - [ ] 진짜 단서가 과도하게 숨겨지지 않음
    - [ ] Flagpole Technique이 효과적으로 사용됨

  fair_misdirection:
    - [ ] 정보를 숨기지 않고 주의를 돌림
    - [ ] 모든 미스디렉션이 사후에 합리적으로 설명 가능함
    - [ ] 플레이어가 "속았지만 공정했다"고 느낄 수 있음
```

### 8.4 트릭 실행 가능성 검증

```yaml
trick_feasibility_check:
  locked_room:
    - [ ] 밀실 메커니즘이 물리적으로 가능함
    - [ ] 범인이 현장에서 빠져나갈 방법이 존재함
    - [ ] 증거 조작 과정이 설명됨

  alibi:
    - [ ] 알리바이 트릭이 실행 가능함
    - [ ] 시간 조작이 설명 가능함
    - [ ] 공범이 있다면 그들의 동기도 설명됨

  poison_delayed:
    - [ ] 독의 작용 시간이 의학적으로 타당함
    - [ ] 범인이 독을 투여할 기회가 있었음
    - [ ] 독의 증상이 현실적으로 묘사됨

  identity:
    - [ ] 정체 바꾸기가 가능한 조건임
    - [ ] 신체적 차이를 극복할 방법 존재
    - [ ] 정체 바꾸기 단서가 배치됨
```

### 8.5 참신성 검증

```yaml
innovation_check:
  uniqueness:
    - [ ] 기존 유명 미스터리와 지나치게 유사하지 않음
    - [ ] 트릭에 최소 한 가지 참신한 요소 있음
    - [ ] 배경 설정이 트릭에 독특하게 기여함

  modern_elements:
    - [ ] 현대적 기술이나 상황을 적절히 활용함 (선택)
    - [ ] 시대적 맥락이 스토리에 자연스럽게 통합됨

  emotional_depth:
    - [ ] 단순 퍼즐 이상의 감정적 울림 있음
    - [ ] 캐릭터의 동기가 인간적으로 공감 가능함
    - [ ] 해결이 테마적으로 의미 있음
```

---

## 구현 가이드

### 9.1 Gemini API 통합 워크플로우

#### 9.1.1 전체 생성 파이프라인

```
사용자 입력 (컨셉)
    ↓
[Stage 1] Core Blueprint Generation
    ↓
[Stage 1.5] Logical Validation (Python)
    ↓
[Stage 4] Misdirection Layer Generation
    ↓
[Stage 5] Narrative Structure Generation
    ↓
[Stage 6] Trick Implementation
    ↓
[Stage 7] Double Twist Assembly
    ↓
[Validation] Fair Play & Logic Checks
    ↓
[Output] Complete Mystery Story Blueprint
```

#### 9.1.2 각 Stage별 API 호출 예시

**Stage 1: Core Blueprint**
```python
import google.generativeai as genai

def generate_core_blueprint(user_concept, setting, tone, complexity):
    """
    Christie의 Solution-First 방식으로 핵심 설계도 생성
    """
    prompt = f"""
    You are a world-class mystery writer. Generate a murder mystery blueprint using Agatha Christie's solution-first method.

    User Concept: {user_concept}
    Setting: {setting}
    Tone: {tone}
    Complexity: {complexity}

    Follow this exact structure:
    {{
      "WHO": {{
        "killer_identity": "...",
        "killer_background": "...",
        "why_least_likely": "..."
      }},
      "HOW": {{...}},
      "WHY": {{...}},
      "WHEN": {{...}},
      "WHERE": {{...}},
      "PROOF": {{
        "clue_1": {{...}},
        "clue_2": {{...}},
        "clue_3": {{...}}
      }}
    }}

    CRITICAL RULES:
    1. Only ONE person must fit all evidence (logical uniqueness)
    2. All PROOF clues must be discoverable through investigation (fair play)
    3. Minimum 3 clues each for WHO, HOW, WHY
    4. The solution must be surprising but logically inevitable
    """

    model = genai.GenerativeModel('gemini-1.5-pro')
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.8,  # 창의성
            "top_p": 0.9,
            "max_output_tokens": 4096
        }
    )

    return parse_json_response(response.text)
```

**Stage 1.5: Validation**
```python
def validate_blueprint(blueprint):
    """
    생성된 Blueprint의 논리적 일관성 검증
    """
    errors = []

    # 1. 논리적 유일성 검증
    if not check_uniqueness(blueprint):
        errors.append("Multiple suspects fit the evidence")

    # 2. Fair Play 검증
    if len(blueprint['PROOF']) < 9:  # 3 clues × 3 aspects
        errors.append("Insufficient clues for fair play")

    # 3. 단서 배치 검증
    clue_placements = [clue['placement'] for clue in blueprint['PROOF'].values()]
    if max(clue_placements) > 75:
        errors.append("Critical clue placed after 75% (Fair Play violation)")

    # 4. 타임라인 일관성
    if not validate_timeline(blueprint):
        errors.append("Timeline inconsistencies detected")

    return len(errors) == 0, errors

def check_uniqueness(blueprint):
    """
    오직 한 명의 용의자만 모든 증거를 설명할 수 있는지 검증
    """
    suspects = generate_suspects(blueprint)
    clues = blueprint['PROOF']

    fitting_suspects = []
    for suspect in suspects:
        if can_explain_all_clues(suspect, clues):
            fitting_suspects.append(suspect)

    return len(fitting_suspects) == 1
```

**Stage 4: Misdirection Layer**
```python
def generate_misdirection_layer(core_blueprint):
    """
    거짓 해결책과 Red Herring 생성
    """
    prompt = f"""
    Based on this TRUE solution:
    {json.dumps(core_blueprint, indent=2)}

    Generate misdirection elements:
    1. One FALSE SOLUTION (60-70% reveal)
       - Must use subset of real clues in misleading way
       - Must have plausible logic
       - Must have discoverable fatal flaw

    2. Two RED HERRINGS (maximum)
       - Each must contribute to story even when revealed false
       - Must be resolved before final reveal

    Output as JSON following the misdirection layer schema.
    """

    model = genai.GenerativeModel('gemini-1.5-pro')
    response = model.generate_content(prompt)

    return parse_json_response(response.text)
```

**Stage 5: Narrative Structure**
```python
def generate_narrative_structure(core_blueprint, misdirection_layer):
    """
    3막 구조와 정확한 비트 배치 생성
    """
    prompt = f"""
    Generate a precise three-act structure beat sheet for this mystery:

    Core Solution: {json.dumps(core_blueprint, indent=2)}
    Misdirection: {json.dumps(misdirection_layer, indent=2)}

    Follow exact percentages:
    - 12%: Murder occurs
    - 20%: All suspects introduced
    - 25%: First Plot Point
    - 37%: First Pinch Point
    - 50%: Midpoint (False Solution hint)
    - 62%: Second Pinch Point
    - 75%: All clues presented
    - 90%: Climax (True Solution reveal)

    Distribute clues: 40% Act 1, 50% Act 2, 10% Act 3

    Output as structured beat sheet JSON.
    """

    model = genai.GenerativeModel('gemini-1.5-pro')
    response = model.generate_content(prompt)

    return parse_json_response(response.text)
```

### 9.2 예시: 완전한 미스터리 생성

```python
def generate_complete_mystery(user_concept):
    """
    사용자 컨셉부터 완전한 미스터리 스토리까지 전체 파이프라인
    """
    # Stage 1: Core Blueprint
    print("Stage 1: Generating core blueprint...")
    blueprint = generate_core_blueprint(
        user_concept="작은 섬 저택에서의 부호 살인",
        setting="1920s isolated manor",
        tone="cozy",
        complexity="intermediate"
    )

    # Stage 1.5: Validation
    print("Stage 1.5: Validating blueprint...")
    is_valid, errors = validate_blueprint(blueprint)
    if not is_valid:
        print(f"Validation errors: {errors}")
        # Retry or adjust blueprint
        blueprint = refine_blueprint(blueprint, errors)

    # Stage 4: Misdirection Layer
    print("Stage 4: Generating misdirection layer...")
    misdirection = generate_misdirection_layer(blueprint)

    # Stage 5: Narrative Structure
    print("Stage 5: Generating narrative structure...")
    structure = generate_narrative_structure(blueprint, misdirection)

    # Stage 6: Trick Implementation
    print("Stage 6: Implementing specific tricks...")
    tricks = implement_tricks(blueprint, structure)

    # Stage 7: Double Twist Assembly
    print("Stage 7: Assembling double twist...")
    double_twist = assemble_double_twist(blueprint, misdirection)

    # Final Validation
    print("Final Validation...")
    final_check = comprehensive_validation({
        "blueprint": blueprint,
        "misdirection": misdirection,
        "structure": structure,
        "tricks": tricks,
        "double_twist": double_twist
    })

    if final_check['passed']:
        print("✅ Mystery generation complete!")
        return {
            "blueprint": blueprint,
            "misdirection": misdirection,
            "structure": structure,
            "tricks": tricks,
            "double_twist": double_twist,
            "quality_score": final_check['score']
        }
    else:
        print(f"❌ Final validation failed: {final_check['issues']}")
        return None
```

### 9.3 프론트엔드 통합 예시

```typescript
// React Component 예시
import { useState } from 'react';

export function MysteryGenerator() {
  const [concept, setConcept] = useState('');
  const [mystery, setMystery] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generateMystery() {
    setLoading(true);

    try {
      const response = await fetch('/api/generate-mystery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: concept,
          setting: '1920s manor',
          tone: 'cozy',
          complexity: 'intermediate'
        })
      });

      const result = await response.json();
      setMystery(result);

      // 생성된 미스터리를 Supabase에 저장
      await saveMysteryToDatabase(result);

    } catch (error) {
      console.error('Mystery generation failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mystery-generator">
      <textarea
        value={concept}
        onChange={(e) => setConcept(e.target.value)}
        placeholder="미스터리 아이디어를 입력하세요..."
      />

      <button onClick={generateMystery} disabled={loading}>
        {loading ? '생성 중...' : '미스터리 생성'}
      </button>

      {mystery && (
        <div className="mystery-result">
          <h3>생성된 미스터리</h3>
          <MysteryDisplay mystery={mystery} />
        </div>
      )}
    </div>
  );
}
```

### 9.4 좋은 예 vs 나쁜 예

#### ✅ 좋은 예: Fair Play 준수

```json
{
  "scenario": "집사가 범인",
  "clues": [
    {
      "placement": "10%",
      "content": "집사가 약통을 조심스럽게 다루는 모습",
      "presentation": "하녀가 '집사님은 약을 유리처럼 조심스럽게 다루신다'고 언급",
      "fair_play": "플레이어가 들을 수 있음, 나중에 의미 획득"
    },
    {
      "placement": "40%",
      "content": "집사의 방에서 약학 교과서 발견",
      "presentation": "방 수색 중 선반에서 발견, 먼지 쌓임",
      "fair_play": "물리적으로 발견 가능, 사진 찍을 수 있음"
    },
    {
      "placement": "60%",
      "content": "마을 의사가 집사의 딸 자살 언급",
      "presentation": "의사와 대화 중 자연스럽게 나옴",
      "fair_play": "명확한 증언, 기록 확인 가능"
    }
  ],
  "why_good": "모든 단서가 발견 가능하고, 나중에 연결됨"
}
```

#### ❌ 나쁜 예: Fair Play 위반

```json
{
  "scenario": "집사가 범인",
  "clues": [
    {
      "placement": "95%",
      "content": "집사가 실제로 약학 박사였다는 사실 폭로",
      "presentation": "최종 폭로 시 처음 언급됨",
      "fair_play_violation": "이 정보가 스토리 초반에 없었음"
    },
    {
      "placement": "90%",
      "content": "피해자와 집사의 딸 사이 관계가 최종 폭로 시 처음 밝혀짐",
      "fair_play_violation": "플레이어가 미리 알 수 없었던 정보"
    }
  ],
  "why_bad": "결정적 정보를 최후까지 숨김 - 플레이어가 추론 불가능"
}
```

#### ✅ 좋은 예: 효과적인 미스디렉션

```json
{
  "technique": "Flagpole Technique",
  "flagpole_element": {
    "content": "피로 얼룩진 대검이 벽난로 위에!",
    "presentation": "극적으로 발견, 모든 용의자가 반응",
    "timing": "15%"
  },
  "hidden_clue": {
    "content": "약통 뚜껑이 약간 느슨함",
    "presentation": "환경 묘사 중 간단히 언급",
    "timing": "15%"
  },
  "resolution": {
    "flagpole": "대검은 전날 사냥감 손질한 혈흔 (50% 해명)",
    "hidden_clue": "진짜 살인 방법 (90% 폭로)"
  },
  "why_good": "주의를 극적인 요소로 돌리면서 진짜 단서는 조용히 제시"
}
```

#### ❌ 나쁜 예: 부정직한 미스디렉션

```json
{
  "technique": "정보 숨기기",
  "hidden_element": {
    "content": "피해자가 실제로는 쌍둥이였음",
    "presentation": "최종 폭로까지 전혀 언급 없음",
    "timing": "95%"
  },
  "why_bad": "단순히 정보를 숨긴 것이지 미스디렉션이 아님. Fair Play 위반"
}
```

---

## 마치며

이 문서는 AI 머더미스터리 게임의 스토리 생성을 **세계 최고 수준**으로 끌어올리기 위한 설계 시스템입니다.

### 핵심 원칙 요약

1. **Solution-First Design**: Christie처럼 결말부터 역설계
2. **Fair Play 절대 준수**: 모든 단서는 75% 이전 제시
3. **Three Clue Rule**: 모든 중요 추론에 3개 이상 독립 경로
4. **Misdirection > Withholding**: 정보를 숨기지 말고 주의를 돌려라
5. **Double Twist**: 거짓 해결책으로 진짜 해결책을 숨겨라
6. **Logical Uniqueness**: 오직 한 명만 모든 증거를 설명 가능해야
7. **Precise Beat Placement**: 3막 구조의 정확한 % 배치 준수
8. **Innovation Within Tradition**: 고전 트릭을 현대적으로 재해석

### 다음 단계

- **프론트엔드 통합**: React 컴포넌트로 사용자 인터페이스 구현
- **데이터베이스 설계**: Supabase에 생성된 미스터리 저장
- **플레이테스트**: 실제 플레이어 피드백 수집 및 개선
- **AI 모델 파인튜닝**: 더 나은 트릭 생성을 위한 추가 학습

---

**문서 버전**: 1.0
**총 단어 수**: 약 12,000단어
**예상 구현 시간**: 4-6주
**난이도**: Advanced

**주요 참고 문헌**:
- MURDER_MYSTERY_PART1_NARRATIVE_STRUCTURE.md
- MURDER_MYSTERY_PART4_MASTER_WRITERS.md
- Agatha Christie's writing methodology
- Ellery Queen's Challenge to the Reader
- John Dickson Carr's Locked Room Lectures
