# Prompt Templates Library

Complete library of optimized Gemini API prompts for Armchair Sleuths.

## Base Case Generation Template

```typescript
const BASE_CASE_PROMPT = `
You are a master murder mystery writer creating a fair-play detective story.

**Genre**: Korean noir detective mystery
**Target Audience**: Mystery enthusiasts who enjoy logical deduction
**Style**: Realistic, grounded in logic, no supernatural elements

**Your Task**: Generate a complete murder mystery case following these steps:

---

## STEP 1: DEFINE THE VICTIM

Create a victim with depth and complexity:

**Required Fields:**
- Name: Korean name (성+이름 format, e.g., "김민준", "이서연")
- Age: 25-65 years old
- Occupation: Specific and realistic
- Background: 2-3 sentences covering personality, lifestyle, relationships
- Why they were targeted: Connection to the motive

**Good Example:**
{
  "name": "박지훈",
  "age": 42,
  "occupation": "IT 스타트업 CEO",
  "background": "성공한 기업가지만 직원들에게 냉정하기로 유명. 최근 회사 매각 계획으로 주변 사람들과 갈등이 심화되었다.",
  "relationship": "직원들과 투자자들에게 복잡한 감정을 불러일으킴"
}

---

## STEP 2: SELECT MURDER WEAPON

Choose from this approved weapon list ONLY:

**Available Weapons:**
1. 총 (Gun) - Quick, loud, leaves bullet evidence
2. 칼 (Knife) - Close-range, personal, blood evidence
3. 독 (Poison) - Delayed, requires planning, chemical evidence
4. 둔기 (Blunt Object) - Impulsive, leaves physical trauma
5. 추락 (Fall/Push) - Environmental, requires opportunity
6. 질식 (Suffocation) - Close contact, struggle marks

**Selection Criteria:**
- Weapon must match guilty suspect's opportunity
- Weapon must leave discoverable evidence
- Weapon must fit the location constraints

---

## STEP 3: SELECT LOCATION

Choose from this approved location list ONLY:

**Available Locations:**
1. 저택 (Mansion) - Private, multiple rooms, wealthy victim
2. 호텔 (Hotel) - Semi-public, timed access, witnesses
3. 극장 (Theater) - Public, crowded, specific timing
4. 사무실 (Office) - Workplace, security cameras, colleagues
5. 공원 (Park) - Outdoor, public, environmental evidence
6. 레스토랑 (Restaurant) - Public, staff witnesses, limited access

**Selection Criteria:**
- Location must logically connect to victim's lifestyle
- Location must provide opportunities and constraints
- Location must offer clue placement opportunities

---

## STEP 4: CREATE THE GUILTY SUSPECT

Design the murderer with a complete profile:

**Required Fields:**
- Name: Korean name, different from victim
- Archetype: Select from approved list below
- Background: How they know the victim
- Motive: Clear, logical reason for murder
- Opportunity: When and how they had access
- Evidence Trail: What clues link them to the crime

**Approved Archetypes:**
1. 배신당한 연인 (Scorned Lover) - Romance gone wrong
2. 탐욕스런 상속자 (Greedy Heir) - Financial motive
3. 복수자 (Avenger) - Past wrongdoing
4. 비즈니스 라이벌 (Business Rival) - Professional competition
5. 질투하는 친구 (Jealous Friend) - Envy and resentment

**Good Example:**
{
  "name": "최유진",
  "archetype": "탐욕스런 상속자",
  "background": "피해자의 조카. 큰 유산을 물려받을 예정이었으나 피해자가 최근 유언장을 변경하려 했다.",
  "motive": "유산 상속권 확보 - 피해자가 유언장을 바꾸기 전에 제거해야 했음",
  "opportunity": "피해자와 단둘이 저택에서 만남, CCTV 사각지대 이용",
  "evidenceTrail": [
    "범행 도구 구매 기록",
    "피해자와의 마지막 통화 녹음",
    "저택 출입 기록"
  ]
}

---

## STEP 5: CREATE 2 INNOCENT SUSPECTS

Design red herrings that mislead but are innocent:

**Each innocent suspect needs:**
- Plausible motive (seems guilty but isn't)
- Alibi or lack of opportunity (can be proven innocent)
- Red herring clues (misleading but explainable)

**Good Example - Innocent Suspect 1:**
{
  "name": "강민수",
  "archetype": "비즈니스 라이벌",
  "background": "피해자의 경쟁 기업 CEO. 최근 시장 경쟁 격화",
  "apparentMotive": "피해자 제거로 시장 점유율 확대",
  "actualAlibi": "범행 시각에 해외 출장 중 (항공권 기록 확인 가능)",
  "redHerring": "피해자에게 위협적인 이메일을 보낸 기록이 있지만 비즈니스 협상용"
}

**Good Example - Innocent Suspect 2:**
{
  "name": "이수아",
  "archetype": "배신당한 연인",
  "background": "피해자의 전 연인. 1년 전 갑작스런 이별",
  "apparentMotive": "이별 후 복수심",
  "actualAlibi": "범행 시각에 친구들과 식사 중 (여러 증인 존재)",
  "redHerring": "피해자 집 근처에서 목격되었으나 우연한 마주침"
}

---

## STEP 6: DIFFICULTY-BASED CLUE DISTRIBUTION

Difficulty: ${difficulty}

${getDifficultyGuidelines(difficulty)}

**Clue Categories:**
1. **Critical Clues**: Directly point to guilty suspect
2. **Supporting Clues**: Strengthen the case but not conclusive
3. **Red Herrings**: Point to innocent suspects
4. **Neutral Clues**: General crime scene evidence

**Clue Placement Rules:**
- All critical clues must be accessible to the player
- Clues must follow logical causation
- Evidence must be scientifically plausible
- Timeline must be consistent

---

## STEP 7: CREATE 5W1H SOLUTION

Provide the complete solution:

**Format:**
{
  "who": "최유진 (구체적 신원 정보 포함)",
  "what": "독살 (정확한 방법 설명)",
  "where": "피해자 자택 서재 (구체적 위치)",
  "when": "2025년 1월 19일 오후 10시 30분경 (타임라인)",
  "why": "유산 상속권 확보를 위해 (상세한 동기 설명)",
  "how": "피해자가 즐겨 마시는 차에 독약을 섞어 (단계별 실행 방법)"
}

**Each field requirements:**
- WHO: Full name + relationship + specific identity details
- WHAT: Murder method + weapon details + physical evidence
- WHERE: Exact location + room/area + environmental factors
- WHEN: Date + time + duration + timeline of events
- WHY: Deep motive + trigger event + psychological factors
- HOW: Step-by-step execution + preparation + escape method

Each answer should be 50-200 characters in Korean.

---

## OUTPUT FORMAT

Return ONLY valid JSON in this exact structure:

{
  "victim": { ... },
  "weapon": { "name": "...", "description": "..." },
  "location": { "name": "...", "description": "..." },
  "suspects": [
    { "name": "...", "isGuilty": true, ... },
    { "name": "...", "isGuilty": false, ... },
    { "name": "...", "isGuilty": false, ... }
  ],
  "clues": [ ... ],
  "solution": {
    "who": "...",
    "what": "...",
    "where": "...",
    "when": "...",
    "why": "...",
    "how": "..."
  }
}

Do NOT include any text outside the JSON structure.
Do NOT use markdown code blocks.
`;

function getDifficultyGuidelines(difficulty: string): string {
  switch(difficulty) {
    case 'easy':
      return `
**EASY Mode Guidelines:**
- 70% obvious clues that directly implicate the guilty suspect
- 20% red herrings that are easily eliminated
- 10% neutral evidence
- Minimum 5 clues total
- Guilty suspect should have the clearest motive
- Evidence should be straightforward to interpret
`;

    case 'medium':
      return `
**MEDIUM Mode Guidelines:**
- 50% clues requiring basic deduction
- 30% red herrings that seem plausible initially
- 20% neutral evidence
- Minimum 7 clues total
- All suspects should seem equally suspicious at first
- Some clues require connecting multiple pieces of evidence
`;

    case 'hard':
      return `
**HARD Mode Guidelines:**
- 30% subtle clues requiring careful analysis
- 40% strong red herrings that mislead
- 30% neutral or ambiguous evidence
- Minimum 10 clues total
- Innocent suspects may have stronger apparent motives
- Critical clues may be hidden in seemingly neutral evidence
- Requires timeline reconstruction and logical elimination
`;

    default:
      return '';
  }
}

export { BASE_CASE_PROMPT, getDifficultyGuidelines };
```

## Suspect Personality Template

```typescript
const SUSPECT_PERSONALITY_PROMPT = `
Create a unique and believable personality for this suspect in a murder mystery:

**Suspect Information:**
- Name: ${suspect.name}
- Archetype: ${suspect.archetype}
- Relationship to Victim: ${suspect.relationship}
- Is Guilty: ${suspect.isGuilty ? 'Yes' : 'No'}

**Your Task**: Generate a rich personality profile that will guide suspect dialogue during interrogation.

---

## PERSONALITY TRAITS

Create 3-4 distinct traits that define this character:

**Trait Categories:**
1. **Behavioral**: How they act (nervous, confident, defensive, cooperative)
2. **Emotional**: How they feel (angry, scared, sad, indifferent)
3. **Social**: How they interact (talkative, reserved, manipulative, honest)
4. **Cognitive**: How they think (logical, impulsive, calculated, confused)

**Good Examples:**
- "신중하고 계산적. 대답하기 전에 항상 잠시 멈춰 생각한다."
- "불안하고 방어적. 질문을 회피하려 하고 땀을 많이 흘린다."
- "차분하고 협조적. 하지만 특정 주제에서는 감정이 격해진다."

**Bad Examples (Too vague):**
- "좋은 사람" ❌
- "평범함" ❌
- "복잡한 성격" ❌

---

## SPEECH PATTERNS

Define how this suspect speaks:

**Speech Characteristics:**
1. **Formality Level**: 존댓말 (formal) / 반말 (informal) / 혼용 (mixed)
2. **Pace**: 빠름 (fast) / 보통 (normal) / 느림 (slow)
3. **Tone**: 정중함 (polite) / 무례함 (rude) / 긴장됨 (nervous) / 무관심 (indifferent)
4. **Verbal Tics**: Repeated phrases, hesitations, filler words

**Examples:**
- Guilty suspect trying to hide: "음... 그건... 잘 기억이 안 나요. 확실하지 않은데..."
- Innocent but nervous: "맞아요, 맞아요! 저는 정말 아무것도 안 했어요!"
- Confident innocent: "질문하시는 건 이해합니다. 제가 아는 건 다 말씀드리죠."

---

## EMOTIONAL STATE

Define the suspect's emotional arc during interrogation:

**Initial State**: How they feel when first questioned
**Mid-Interrogation**: How emotions evolve as questions get harder
**When Pressed**: How they react to direct accusation
**Emotional Triggers**: Topics that provoke strong reactions

**If Guilty:**
- Initial: Calm but controlled, trying to appear cooperative
- Mid: Small cracks in composure when asked about evidence
- Pressed: Defensive, might become aggressive or overly detailed
- Triggers: Specific evidence that contradicts their story

**If Innocent:**
- Initial: Confused or shocked, willing to help
- Mid: Frustrated by continued suspicion
- Pressed: Angry or desperate to prove innocence
- Triggers: Being accused when they know they're innocent

---

## BACKGROUND DETAILS

Create believable background that explains their personality:

**Required Elements:**
1. **Occupation History**: What they do, how long, job satisfaction
2. **Relationship with Victim**: History, recent interactions, emotional tone
3. **Life Circumstances**: Current life situation affecting behavior
4. **Secrets**: Personal information they might want to hide (unrelated to murder)

**Example:**
{
  "occupation": "회계사, 15년 경력. 최근 회사 구조조정으로 불안정한 상황",
  "victimRelationship": "5년 전부터 알던 사이. 비즈니스 관계로 시작했으나 개인적 갈등 발생",
  "lifeCircumstances": "이혼 소송 중. 경제적으로 어려운 상황",
  "secrets": "회사 자금을 횡령한 사실 (살인과 무관하지만 숨기고 싶어함)"
}

---

## INTERROGATION STRATEGY

How this suspect behaves when questioned:

**Cooperation Level**: 1-10 (1 = very uncooperative, 10 = fully cooperative)

**If Guilty (typical: 5-7):**
- Appears cooperative but controls information
- Volunteers some truth mixed with lies
- Deflects suspicion to others
- Overexplains minor details, vague on important ones

**If Innocent (typical: 7-9):**
- Genuinely wants to help
- May be too eager or too defensive
- Provides honest details but may misremember
- Emotional reactions are authentic

**Response Patterns:**
- **To direct questions**:
  - Guilty: "제가 아는 한..." (qualifying statements)
  - Innocent: "네, 정확히 기억해요..." (direct answers)

- **To evidence presentation**:
  - Guilty: "그건 오해예요" (denial, explanation)
  - Innocent: "어떻게 그런 증거가..." (confusion, shock)

- **To accusation**:
  - Guilty: "증거가 있나요?" (defensive, legalistic)
  - Innocent: "말도 안 돼요!" (emotional, outraged)

---

## OUTPUT FORMAT

{
  "personalityTraits": [
    "신중하고 계산적",
    "표면적으로는 협조적이지만 진실을 숨김",
    "특정 질문에 불안한 반응"
  ],
  "speechPattern": {
    "formality": "존댓말",
    "pace": "보통",
    "tone": "정중하지만 긴장됨",
    "verbalTics": "음..., 그러니까... 자주 사용"
  },
  "emotionalState": {
    "initial": "침착하고 협조적으로 보이려 노력",
    "midInterrogation": "특정 증거 언급 시 작은 동요",
    "whenPressed": "방어적이 되며 과도하게 상세한 설명",
    "triggers": ["범행 시각 언급", "목격자 진술"]
  },
  "background": {
    "occupation": "...",
    "victimRelationship": "...",
    "lifeCircumstances": "...",
    "secrets": "..."
  },
  "cooperationLevel": 6,
  "responseStyle": "협조적인 척하지만 정보를 통제하려 함"
}
`;
```

## Clue Generation Template

```typescript
const CLUE_GENERATION_PROMPT = `
Generate clues for this murder mystery case:

**Case Context:**
- Victim: ${victim.name}
- Guilty Suspect: ${guiltySuspect.name}
- Weapon: ${weapon}
- Location: ${location}
- Difficulty: ${difficulty}

**Generate ${clueCount} clues following these rules:**

---

## CLUE CATEGORIES

### 1. PHYSICAL EVIDENCE
Objects, marks, substances found at the scene

**Examples:**
- "피해자 손에 묻은 붉은 페인트 흔적"
- "범행 현장에 떨어진 단추 (용의자 A의 코트에서 떨어진 것)"
- "CCTV에 찍힌 수상한 인물의 뒷모습"

### 2. TESTIMONIAL EVIDENCE
Witness statements, alibis, conversations

**Examples:**
- "목격자가 10시 30분경 피해자 집에서 큰 소리를 들었다고 진술"
- "용의자 B가 범행 시각에 레스토랑에 있었다는 영수증"
- "피해자가 사망 하루 전 누군가와 격하게 다툰 것을 이웃이 목격"

### 3. CIRCUMSTANTIAL EVIDENCE
Contextual information, relationships, motives

**Examples:**
- "피해자가 최근 유언장을 변경하려 했다는 변호사 진술"
- "용의자 C의 은행 계좌에 큰 빚이 있음"
- "피해자의 일기장에 '더 이상 참을 수 없다'는 내용"

### 4. FORENSIC EVIDENCE
Scientific analysis results

**Examples:**
- "독극물 검사 결과 청산가리 검출"
- "지문 분석 결과 용의자 A의 지문이 범행 도구에서 발견"
- "사망 추정 시각: 오후 10시 30분~11시 사이"

---

## CLUE IMPORTANCE LEVELS

### CRITICAL CLUES (Must include 2-3)
Directly connect guilty suspect to the crime
- Must be discoverable through investigation
- Cannot be explained away
- Together they prove guilt beyond reasonable doubt

**Example:**
{
  "description": "범행 도구인 칼에서 용의자 A의 지문 발견",
  "importance": "critical",
  "discoveryMethod": "과학 수사팀의 지문 분석",
  "pointsTo": "용의자 A",
  "canBeExplained": false
}

### SUPPORTING CLUES (Include 3-5)
Strengthen the case but not conclusive alone
- Add context to critical clues
- Establish timeline or opportunity
- Show motive or preparation

**Example:**
{
  "description": "용의자 A가 범행 3일 전 철물점에서 칼을 구매한 영수증",
  "importance": "supporting",
  "discoveryMethod": "용의자 A의 신용카드 내역 조사",
  "pointsTo": "용의자 A",
  "canBeExplained": true,
  "explanation": "호신용으로 샀다고 주장 가능하지만 의심스러움"
}

### RED HERRINGS (Include 1-3 per innocent suspect)
Point to innocent suspects but can be explained

**Example:**
{
  "description": "용의자 B가 범행 당일 피해자 집 근처에서 목격됨",
  "importance": "redHerring",
  "discoveryMethod": "이웃 주민 목격담",
  "pointsTo": "용의자 B",
  "canBeExplained": true,
  "explanation": "우연히 근처 카페를 방문했을 뿐 (카페 영수증으로 증명 가능)"
}

### NEUTRAL CLUES (Include 1-2)
General crime scene information

**Example:**
{
  "description": "범행 현장에서 발견된 피해자의 스마트폰 (잠금 상태)",
  "importance": "neutral",
  "discoveryMethod": "초기 현장 조사",
  "pointsTo": "없음",
  "note": "추가 조사 필요"
}

---

## DIFFICULTY-BASED DISTRIBUTION

**Easy Mode:**
- 3-4 critical clues (obvious)
- 2-3 supporting clues
- 1-2 red herrings (weak)
- Total: 6-9 clues

**Medium Mode:**
- 2-3 critical clues (require deduction)
- 3-4 supporting clues
- 2-3 red herrings (plausible)
- Total: 7-10 clues

**Hard Mode:**
- 2 critical clues (subtle)
- 4-5 supporting clues (complex)
- 3-4 red herrings (strong)
- Total: 9-11 clues

---

## FAIR PLAY RULES

Every clue must follow these rules:

1. **Accessibility**: Player can discover it through reasonable investigation
2. **Clarity**: Clue description is clear, not ambiguous
3. **Logic**: Clue follows real-world logic and causation
4. **Timing**: Critical clues available before solution reveal
5. **No Hidden Knowledge**: No specialized expertise required to understand

**Bad Clue (Violates Fair Play):**
❌ "범행 현장의 미세한 섬유 조각 (전문 장비 없이는 발견 불가)"
❌ "피해자가 남긴 암호 (해독 불가능)"

**Good Clue (Fair Play):**
✅ "범행 현장의 섬유 조각 (과학 수사팀이 분석 가능)"
✅ "피해자의 일기에 적힌 힌트 (약간의 추리로 해석 가능)"

---

## OUTPUT FORMAT

[
  {
    "description": "구체적인 단서 설명",
    "importance": "critical" | "supporting" | "redHerring" | "neutral",
    "discoveryMethod": "플레이어가 이 단서를 어떻게 발견하는가",
    "pointsTo": "용의자 이름" | "없음",
    "canBeExplained": true | false,
    "explanation": "단서를 다르게 해석할 수 있는 방법 (있다면)"
  },
  ...
]
`;
```
