# Emotional State System

Complete reference for suspect emotional state management, transitions, and suspicion calculation.

## Four-Tier Emotional States

### COOPERATIVE (Suspicion Level: 0-25)

**Characteristics:**
- Calm and helpful
- Willing to answer questions
- Minimal defensiveness
- Professional tone

**Tone Guide:**
```
당신은 협조적이고 차분합니다.
질문에 정직하게 답하며 사건 해결을 돕고 싶어합니다.
톤: 친절하고 개방적
```

**Response Patterns:**
- Provides detailed answers
- Volunteers additional information
- Shows empathy for victim
- Maintains eye contact (narrative descriptions)

**Example Responses:**
- "물론이죠, 기꺼이 말씀드리겠습니다." (Of course, I'm happy to tell you)
- "제가 아는 한..." (As far as I know...)
- "도움이 되었으면 좋겠습니다." (I hope this helps)

### NERVOUS (Suspicion Level: 26-50)

**Characteristics:**
- Slightly anxious
- Some hesitation
- Defensive but still cooperative
- Careful word choice

**Tone Guide:**
```
당신은 조금 불안하고 방어적입니다.
일부 질문에 주저하지만 여전히 협조합니다.
톤: 긴장하지만 예의바른
```

**Response Patterns:**
- Pauses before answering
- Qualifies statements ("I think", "Maybe")
- Shows nervousness through speech
- Still provides information but less freely

**Example Responses:**
- "음... 확실하지는 않지만..." (Um... I'm not sure but...)
- "왜 제게 묻는 건가요?" (Why are you asking me?)
- "오해는 하지 말아주세요." (Please don't misunderstand)

### DEFENSIVE (Suspicion Level: 51-75)

**Characteristics:**
- Clearly guarded
- Short, careful answers
- Questions interrogator's motives
- Protective of information

**Tone Guide:**
```
당신은 방어적이고 경계합니다.
질문의 의도를 의심하며 짧고 신중하게 답합니다.
톤: 경계하고 불신적
```

**Response Patterns:**
- Minimal responses
- Counter-questions
- Deflection tactics
- Selective memory

**Example Responses:**
- "왜 그런 질문을 하시죠?" (Why would you ask that?)
- "그건 관련이 없어 보이는데요." (That doesn't seem relevant)
- "기억이 나지 않습니다." (I don't remember)

### AGGRESSIVE (Suspicion Level: 76-100)

**Characteristics:**
- Hostile and confrontational
- Refuses to cooperate
- May become verbally abusive
- Demands rights/lawyer

**Tone Guide:**
```
당신은 매우 방어적이고 공격적입니다.
질문을 거부하거나 역질문할 수 있습니다.
톤: 적대적이고 비협조적
```

**Response Patterns:**
- Outright refusal
- Aggressive counter-questions
- Threats (legal, social, physical implications)
- Emotional outbursts

**Example Responses:**
- "더 이상 답변하지 않겠습니다!" (I won't answer any more questions!)
- "변호사 없이는 말하지 않겠어요." (I won't speak without a lawyer)
- "이건 괴롭힘이에요!" (This is harassment!)

## Suspicion Level Calculation

### Base Formula

```typescript
suspicionLevel = baseLevel + questionImpact + timeDecay
```

### Question Type Impact

Different question types affect suspicion differently:

```typescript
{
  direct_accusation: +15,      // "당신이 범인입니까?"
  alibi_challenge: +10,        // "증거가 있습니까?"
  contradiction_point: +8,     // "전에는 다르게 말했는데..."
  neutral_question: +3,        // "어디 계셨나요?"
  sympathetic: -5,             // "힘드시겠어요"
  supportive: -3               // "이해합니다"
}
```

### Time Decay

Suspicion naturally decreases over time if not triggered:

```typescript
// Decay every 30 seconds of conversation
if (timeSinceLastTrigger > 30) {
  suspicionLevel = Math.max(0, suspicionLevel - 2);
}
```

### Guilty vs Innocent Modifiers

**Guilty suspects:**
- Gain suspicion 1.5x faster
- Decay 0.5x slower
- Start at base level 10 (vs 0 for innocent)

**Innocent suspects:**
- Normal suspicion gain
- Normal decay
- Start at base level 0
- May actually decrease below 0 with sympathetic questions (floor at 0)

```typescript
if (isGuilty) {
  questionImpact *= 1.5;
  timeDecay *= 0.5;
  baseSuspicion = 10;
} else {
  baseSuspicion = 0;
}
```

## Emotional State Transitions

### Forward Transitions (Increasing Suspicion)

**COOPERATIVE → NERVOUS** (Suspicion >= 26)
- Trigger: Persistent questioning, light accusations
- Visual cues: Fidgeting, avoiding eye contact
- Narrative: "Their confident demeanor begins to crack"

**NERVOUS → DEFENSIVE** (Suspicion >= 51)
- Trigger: Direct challenges, contradiction pointing
- Visual cues: Crossed arms, tight jaw
- Narrative: "They lean back, clearly uncomfortable"

**DEFENSIVE → AGGRESSIVE** (Suspicion >= 76)
- Trigger: Continued pressure, accusatory tone
- Visual cues: Raised voice, aggressive posture
- Narrative: "Their patience finally snaps"

### Reverse Transitions (Decreasing Suspicion)

**AGGRESSIVE → DEFENSIVE** (Suspicion < 76)
- Trigger: 3+ sympathetic questions, backing off
- Reset: Grudging cooperation returns

**DEFENSIVE → NERVOUS** (Suspicion < 51)
- Trigger: Time passing, neutral questions
- Reset: Guard slowly lowers

**NERVOUS → COOPERATIVE** (Suspicion < 26)
- Trigger: Extended sympathetic interaction
- Reset: Returns to helpful state

### Transition Delay

Transitions don't happen immediately:

```typescript
// State can only change once per 3 questions minimum
const MIN_QUESTIONS_BETWEEN_TRANSITIONS = 3;
const MIN_TIME_BETWEEN_TRANSITIONS = 60; // seconds
```

This prevents rapid mood swings and maintains narrative realism.

## Special Behaviors

### Guilty Suspect Behaviors

When suspicion is high (>60) and suspect is guilty:

1. **Slip-ups**: May accidentally reveal information
   ```
   "I wasn't there— I mean, I was there but..."
   ```

2. **Over-explaining**: Provides too many details
   ```
   "I was at home all evening, watching TV, specifically the 9 PM show about..."
   ```

3. **Deflection**: Points to other suspects
   ```
   "Why aren't you questioning [other suspect]?"
   ```

### Innocent Suspect Behaviors

Innocent suspects at high suspicion (>60):

1. **Genuine Confusion**:
   ```
   "I don't understand why you think I would..."
   ```

2. **Frustration**:
   ```
   "I've told you everything I know!"
   ```

3. **Pleading**:
   ```
   "Please, you have to believe me..."
   ```

## Contextual Modifiers

### Location Context

Interrogation location affects baseline:

```typescript
{
  police_station: +5,    // More formal, higher stress
  crime_scene: +3,       // Uncomfortable location
  neutral_location: 0,   // Normal baseline
  suspect_home: -5       // Comfortable, more relaxed
}
```

### Interrogator Approach

Detective's style influences suspicion gain:

```typescript
{
  good_cop: 0.8x,       // Gentler, slower suspicion gain
  bad_cop: 1.5x,        // Aggressive, faster gain
  neutral: 1.0x         // Standard rate
}
```

### Time of Day

```typescript
{
  late_night: +3,       // Tired, more irritable
  early_morning: +2,    // Groggy
  afternoon: 0          // Normal
}
```

## Implementation Example

```typescript
class EmotionalStateManager {
  private suspicionLevel: number = 0;
  private currentState: EmotionalState = 'COOPERATIVE';
  private questionsSinceTransition: number = 0;
  private lastTransitionTime: number = Date.now();

  updateSuspicion(questionType: QuestionType, isGuilty: boolean): void {
    // Calculate impact
    let impact = QUESTION_IMPACTS[questionType];

    // Apply guilty modifier
    if (isGuilty) {
      impact *= 1.5;
    }

    // Update suspicion
    this.suspicionLevel = Math.min(100, this.suspicionLevel + impact);

    // Check for transition
    this.checkStateTransition();

    // Increment question counter
    this.questionsSinceTransition++;
  }

  checkStateTransition(): void {
    // Prevent rapid transitions
    if (this.questionsSinceTransition < MIN_QUESTIONS_BETWEEN_TRANSITIONS) {
      return;
    }

    if (Date.now() - this.lastTransitionTime < MIN_TIME_BETWEEN_TRANSITIONS * 1000) {
      return;
    }

    // Determine new state
    const newState = this.getStateForSuspicionLevel(this.suspicionLevel);

    if (newState !== this.currentState) {
      this.currentState = newState;
      this.questionsSinceTransition = 0;
      this.lastTransitionTime = Date.now();
    }
  }

  getStateForSuspicionLevel(level: number): EmotionalState {
    if (level >= 76) return 'AGGRESSIVE';
    if (level >= 51) return 'DEFENSIVE';
    if (level >= 26) return 'NERVOUS';
    return 'COOPERATIVE';
  }

  applyTimeDecay(): void {
    this.suspicionLevel = Math.max(0, this.suspicionLevel - 2);
    this.checkStateTransition();
  }
}
```

## Tuning Parameters

Adjustable parameters for balancing:

```typescript
const TUNING = {
  // Suspicion gain rates
  QUESTION_IMPACT_MULTIPLIER: 1.0,
  GUILTY_MODIFIER: 1.5,
  INNOCENT_MODIFIER: 1.0,

  // Decay rates
  TIME_DECAY_RATE: 2,
  TIME_DECAY_INTERVAL: 30, // seconds
  GUILTY_DECAY_MODIFIER: 0.5,

  // Transition thresholds
  NERVOUS_THRESHOLD: 26,
  DEFENSIVE_THRESHOLD: 51,
  AGGRESSIVE_THRESHOLD: 76,

  // Transition delays
  MIN_QUESTIONS_BETWEEN: 3,
  MIN_TIME_BETWEEN: 60, // seconds

  // Starting values
  GUILTY_BASE_SUSPICION: 10,
  INNOCENT_BASE_SUSPICION: 0
};
```

## Testing Emotional Progression

Use the test script to verify emotional transitions:

```bash
npx tsx scripts/test-suspect-responses.ts \
  --suspect-id suspect-123 \
  --test-emotions \
  --questions-per-state 5
```

This will:
1. Start at COOPERATIVE (suspicion 0)
2. Ask increasingly accusatory questions
3. Observe transitions through all states
4. Verify state-appropriate responses
5. Test reverse transitions with sympathetic questions

## Best Practices

1. **Gradual Progression**: Don't jump states too quickly
2. **Realistic Responses**: Match response intensity to state
3. **Character Consistency**: Maintain archetype traits across all states
4. **Clear Triggers**: Make state changes feel earned through player actions
5. **Recovery Paths**: Allow suspects to calm down with appropriate player choices
