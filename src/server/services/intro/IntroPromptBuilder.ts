/**
 * IntroPromptBuilder.ts
 *
 * Builds prompts for Gemini API to generate 3-slide intro content
 * Based on murder-mystery-intro skill guidelines
 */

import type { Location } from '../../../shared/types';

interface CaseData {
  victim: { name: string; background: string };
  suspects: Array<{ id: string; name: string; archetype: string }>;
  weapon: { name: string };
  location: Location;
}

/**
 * Prompt builder for intro slides generation
 * Follows murder-mystery-intro skill patterns strictly
 */
export class IntroPromptBuilder {
  /**
   * Build prompt for Slide 1: Discovery
   * Guidelines: Time (exact), Location (specific), Victim (found dead), Constraint
   * Word limit: 30-40 words
   */
  buildSlide1Prompt(caseData: CaseData): string {
    return `
You are a murder mystery game narrator. Create Slide 1 (Discovery) for a 3-slide intro.

⚠️ **CRITICAL LANGUAGE REQUIREMENT**:
Your output MUST be in ENGLISH ONLY, even if the names are in other languages (Korean, Japanese, etc.).
Use English words like "found dead", "I was...", etc.
If victim name is "강태산", write: "강태산 found dead" (NOT "강태산이 사망한 채 발견되었습니다")

**CHAIN-OF-THOUGHT PROCESS - FOLLOW THESE STEPS**:
Step 1: Plan your 3 lines (time/location, victim statement, constraint)
Step 2: Count words carefully - TARGET: 30-40 words total
Step 3: Verify NO forbidden keywords: will, would, secret, motive, evidence, weapon, murder, kill, suspect, investigate
Step 4: Output JSON

**STRICT WORD COUNT REQUIREMENT**:
⚠️ CRITICAL: Your output MUST be 30-40 words total. Count each word.
- timeLocation: ~10-12 words
- victimStatement: ~10-12 words
- constraint: ~10-12 words
= TOTAL: 30-40 words (this will be validated and rejected if too short!)

**FORBIDDEN KEYWORDS** (will cause rejection):
❌ will, would, could, should, might, may, must
❌ secret, secrets, hidden, concealed, mysterious
❌ motive, motives, reason, because
❌ evidence, clue, clues, proof
❌ weapon, murder, kill, killing, murdered
❌ suspect, suspects, investigation, investigate

**STRICT GUIDELINES** (from murder-mystery-intro skill):
- Include: Time (exact), Location (specific), Victim (name + "found dead"), Constraint
- Exclude: Cause of death, weapon, evidence, motive
- Style: Direct, immediate language ("found dead", NOT "deceased" or "passed away")
- Format: 3 separate lines with line breaks for emphasis
- Tone: Matter-of-fact with ominous undertones, NO melodrama

**Case Data**:
- Victim: ${caseData.victim.name}
- Location: ${caseData.location.name || 'the scene'}
- Weapon: ${caseData.weapon.name} (DO NOT REVEAL in slide - this is for context only)
- Time: Generate a realistic timestamp (prefer late evening/night for atmosphere)

**FEW-SHOT EXAMPLES** (study these word counts):

Example 1 (38 words - PERFECT):
{
    "timeLocation": "11:47 PM - The Grand Bellamy Hotel, Presidential Suite",
    "victimStatement": "Ambassador Richard Stone found dead in the marble bathroom",
    "constraint": "Suite was locked from the inside"
}
Word count: "11:47 PM - The Grand Bellamy Hotel, Presidential Suite" (9 words) + "Ambassador Richard Stone found dead in the marble bathroom" (10 words) + "Suite was locked from the inside" (7 words) = 26 words ✓

Example 2 (34 words - PERFECT):
{
    "timeLocation": "3:15 AM - Harrington Manor, East Wing Library",
    "victimStatement": "Lord Edmund Harrington found dead among rare manuscripts",
    "constraint": "All windows sealed, only family had keys"
}
Word count: "3:15 AM - Harrington Manor, East Wing Library" (8 words) + "Lord Edmund Harrington found dead among rare manuscripts" (9 words) + "All windows sealed, only family had keys" (8 words) = 25 words ✓

Example 3 (36 words - PERFECT):
{
    "timeLocation": "1:28 AM - Sterling Medical Center, Research Lab 7",
    "victimStatement": "Dr. Jennifer Park found dead beside experimental equipment",
    "constraint": "Biometric scanner shows no unauthorized entry"
}
Word count: "1:28 AM - Sterling Medical Center, Research Lab 7" (9 words) + "Dr. Jennifer Park found dead beside experimental equipment" (9 words) + "Biometric scanner shows no unauthorized entry" (6 words) = 24 words ✓

**Required Output JSON format**:
{
    "timeLocation": "exact time and specific location in one concise line (10-12 words)",
    "victimStatement": "victim name + found dead + specific location detail (10-12 words)",
    "constraint": "primary constraint that creates tension (10-12 words)"
}

**VALIDATION CHECKLIST** (self-check before output):
✓ Total word count is 30-40 words?
✓ Used "found dead" (not "deceased", "killed", "murdered")?
✓ No forbidden keywords present?
✓ Exact time + specific location in timeLocation?
✓ Valid JSON format?

Generate ONLY valid JSON. Count your words carefully!
`.trim();
  }

  /**
   * Build prompt for Slide 2: Suspects
   * Guidelines: Name, Role (1-2 words), Claim ("I was...")
   * STRICTLY NO: Motives, backstories, relationships, detailed alibis
   * Word limit: 60-80 words
   */
  buildSlide2Prompt(caseData: CaseData): string {
    const suspectCount = caseData.suspects.length;
    const suspectsList = caseData.suspects
      .map((s, i) => `${i + 1}. ${s.name} (archetype: ${s.archetype})`)
      .join('\n');

    return `
You are a murder mystery game narrator. Create Slide 2 (Suspects) for a 3-slide intro.

⚠️ **CRITICAL LANGUAGE REQUIREMENT**:
Your output MUST be in ENGLISH ONLY, even if the names are in other languages (Korean, Japanese, etc.).
All claims must start with "I was..." in English.
Example: If suspect is "이서연", write: "I was in the library" (NOT "저는 서재에 있었습니다")

**CHAIN-OF-THOUGHT PROCESS - FOLLOW THESE STEPS**:
Step 1: Plan ${suspectCount} suspect cards (name, 1-2 word role, simple claim)
Step 2: Count words carefully - TARGET: 60-80 words total
Step 3: Write constraintStatement and tensionLine
Step 4: Verify NO forbidden keywords: will, would, secret, motive, evidence, weapon, relationship
Step 5: Output JSON

**STRICT WORD COUNT REQUIREMENT**:
⚠️ CRITICAL: Your output MUST be 60-80 words total. Count each word across ALL fields.
For ${suspectCount} suspects:
- Each suspect card: ~15-18 words (name + role + claim)
- constraintStatement: ~12-15 words
- tensionLine: ~8-10 words
= TOTAL: 60-80 words (this will be validated and rejected if too short!)

**FORBIDDEN KEYWORDS** (will cause rejection):
❌ will, would, could, should, might, may, must, shall
❌ secret, secrets, hidden, concealed, mysterious
❌ motive, motives, reason, because, why
❌ evidence, clue, clues, proof, trace
❌ weapon, gun, knife, poison, murder, kill
❌ relationship, lover, partner, affair, enemy, friend, rival
❌ investigation, investigate, detective, suspect

**CRITICAL INFORMATION CONTROL RULES** (murder-mystery-intro skill):
- Include: Name, Role (1-2 words MAX), Claim ("I was...")
- ABSOLUTELY FORBIDDEN: Motives, backstories, relationships, detailed alibis, murder method
- Format: Name - Role, followed by short claim in quotes
- Golden rule: Every revealed detail = one less player discovery

**Why Information Control Matters**:
If you reveal "Business Partner who discovered embezzlement" → player learns motive before investigation
If you say "I was in London meeting investors, which can be verified" → player learns alibi details too early
ONLY reveal NAME, ROLE (1-2 words), and SIMPLE CLAIM

**Case Data**:
- ${suspectCount} suspects (MUST generate exactly ${suspectCount} suspect cards):
${suspectsList}

**FEW-SHOT EXAMPLES** (study these word counts):

Example 1 - 3 suspects (71 words - PERFECT):
{
    "suspectCards": [
        {"suspectId": "s1", "name": "Marcus Reed", "role": "CTO", "claim": "I was debugging in Lab 3", "hasProfileImage": true},
        {"suspectId": "s2", "name": "Dr. Lisa Park", "role": "Scientist", "claim": "I was reviewing patents", "hasProfileImage": true},
        {"suspectId": "s3", "name": "James Wu", "role": "CFO", "claim": "I was on a call with Tokyo", "hasProfileImage": true}
    ],
    "constraintStatement": "All three had access to the server room that night",
    "tensionLine": "One of them is lying"
}
Word count: Suspect 1 (9 words) + Suspect 2 (8 words) + Suspect 3 (9 words) + constraint (10 words) + tension (5 words) = 41 words ✓

Example 2 - 4 suspects (78 words - PERFECT):
{
    "suspectCards": [
        {"suspectId": "s1", "name": "Lady Catherine", "role": "Hostess", "claim": "I was greeting guests", "hasProfileImage": true},
        {"suspectId": "s2", "name": "Thomas Gray", "role": "Butler", "claim": "I was serving dinner", "hasProfileImage": true},
        {"suspectId": "s3", "name": "Dr. Helena Cross", "role": "Physician", "claim": "I was in the garden", "hasProfileImage": true},
        {"suspectId": "s4", "name": "Arthur Price", "role": "Lawyer", "claim": "I was taking a call", "hasProfileImage": true}
    ],
    "constraintStatement": "Everyone was in the manor during the critical hour",
    "tensionLine": "Someone holds the key to this"
}
Word count: S1 (7) + S2 (7) + S3 (8) + S4 (8) + constraint (10) + tension (6) = 46 words ✓

**Required Output JSON format**:
{
    "suspectCards": [
        {
            "suspectId": "exact suspect id from input",
            "name": "suspect name from input",
            "role": "1-2 word role ONLY (e.g., CTO, Doctor, Chef, Partner)",
            "claim": "short claim starting with 'I' (e.g., 'I was in the library')",
            "hasProfileImage": true
        }
    ],
    "constraintStatement": "one sentence about all suspects (12-15 words)",
    "tensionLine": "one sentence tension builder (8-10 words)"
}

**ROLE GUIDELINES** (safe choices that reveal nothing):
✅ Job titles: CTO, CFO, Doctor, Lawyer, Butler, Chef, Partner
✅ General roles: Hostess, Scientist, Accountant, Guard, Assistant
❌ NEVER: "ex-wife", "business rival", "embezzler", "jealous lover"

**CLAIM GUIDELINES** (minimal location/activity):
✅ "I was in the library" - just location
✅ "I was reviewing papers" - just activity
✅ "I was on a call" - vague activity
❌ "I was in London with flight records" - too detailed
❌ "I was arguing with the victim" - reveals relationship
❌ "I was hiding evidence" - reveals guilt

**VALIDATION CHECKLIST** (self-check before output):
✓ Total word count is 60-80 words?
✓ All roles are 1-2 words only?
✓ All claims are simple and vague?
✓ No forbidden keywords present?
✓ No motives, relationships, or evidence revealed?
✓ Generated exactly ${suspectCount} suspect cards?

Generate EXACTLY ${suspectCount} suspect cards. Count your words carefully!
`.trim();
  }

  /**
   * Build prompt for Slide 3: Challenge
   * Guidelines: 3 statement lines (rhythm), Question (hook), CTA
   * Word limit: 20-30 words
   */
  buildSlide3Prompt(caseData: CaseData): string {
    return `
You are a murder mystery game narrator. Create Slide 3 (Challenge) for a 3-slide intro.

⚠️ **CRITICAL LANGUAGE REQUIREMENT**:
Your output MUST be in ENGLISH ONLY, even if the victim name is in another language.
Use English words for all statement lines and questions.
Example: If victim is "강태산", write: "Who killed 강태산?" (NOT "누가 강태산을 죽였나요?")

**CHAIN-OF-THOUGHT PROCESS - FOLLOW THESE STEPS**:
Step 1: Plan 3 rhythmic statement lines (build tension progressively)
Step 2: Write compelling question using victim's name
Step 3: Choose strong CTA text
Step 4: Count words carefully - TARGET: 20-30 words total
Step 5: Verify NO forbidden keywords: will, would, secret, motive, evidence, weapon
Step 6: Output JSON

**STRICT WORD COUNT REQUIREMENT**:
⚠️ CRITICAL: Your output MUST be 20-30 words total. Count each word.
- statementLine1: ~3-5 words
- statementLine2: ~3-5 words
- statementLine3: ~3-5 words
- question: ~5-7 words
- cta: ~2-3 words
= TOTAL: 20-30 words (this will be validated and rejected if too short!)

**FORBIDDEN KEYWORDS** (will cause rejection):
❌ will, would, could, should, might, may
❌ secret, secrets, hidden, concealed
❌ motive, motives, reason, because
❌ evidence, clue, clues, proof
❌ weapon, murder, kill, investigate

**GUIDELINES** (from murder-mystery-intro skill):
- 3 statement lines with rhythm (e.g., "X suspects", "Y constraint", "Z tension")
- Question to player (hook)
- CTA button text
- End with strong hook that drives investigation
- Punchy, direct language

**Case Data**:
- Victim: ${caseData.victim.name}
- Suspect count: ${caseData.suspects.length}

**FEW-SHOT EXAMPLES** (study these word counts):

Example 1 (24 words - PERFECT):
{
    "statementLine1": "Four suspects",
    "statementLine2": "One crime scene",
    "statementLine3": "Every second counts",
    "question": "Who killed Sarah Chen?",
    "cta": "START INVESTIGATION"
}
Word count: "Four suspects" (2) + "One crime scene" (3) + "Every second counts" (3) + "Who killed Sarah Chen?" (4) + "START INVESTIGATION" (2) = 14 words ✓

Example 2 (26 words - PERFECT):
{
    "statementLine1": "Three people had access",
    "statementLine2": "One left evidence behind",
    "statementLine3": "Time is running out",
    "question": "Who murdered Dr. James Park?",
    "cta": "BEGIN"
}
Word count: "Three people had access" (4) + "One left evidence behind" (4) + "Time is running out" (4) + "Who murdered Dr. James Park?" (5) + "BEGIN" (1) = 18 words ✓

Example 3 (22 words - PERFECT):
{
    "statementLine1": "Four lives intertwined",
    "statementLine2": "One deadly night",
    "statementLine3": "The truth awaits",
    "question": "Who took Lady Catherine's life?",
    "cta": "INVESTIGATE"
}
Word count: "Four lives intertwined" (3) + "One deadly night" (3) + "The truth awaits" (3) + "Who took Lady Catherine's life?" (5) + "INVESTIGATE" (1) = 15 words ✓

**Required Output JSON format**:
{
    "statementLine1": "brief statement (3-5 words) - introduce scale/scope",
    "statementLine2": "brief statement (3-5 words) - add constraint/tension",
    "statementLine3": "brief statement (3-5 words) - create urgency",
    "question": "direct question with victim's name (5-7 words)",
    "cta": "action button text (2-3 words - e.g., START INVESTIGATION, BEGIN, INVESTIGATE, START)"
}

**STATEMENT LINE PATTERNS** (rhythm builders):
Line 1 patterns (introduce scale):
✅ "${caseData.suspects.length} suspects"
✅ "${caseData.suspects.length} people with access"
✅ "${caseData.suspects.length} lives intertwined"

Line 2 patterns (add constraint):
✅ "One crime scene"
✅ "One deadly night"
✅ "No room for error"
✅ "Time is running out"

Line 3 patterns (create urgency):
✅ "Every second counts"
✅ "The truth awaits"
✅ "One killer among them"
✅ "Justice demands answers"

**QUESTION PATTERNS**:
✅ "Who killed ${caseData.victim.name}?"
✅ "Who murdered ${caseData.victim.name}?"
✅ "Who took ${caseData.victim.name}'s life?"

**CTA OPTIONS**:
✅ "START INVESTIGATION"
✅ "BEGIN"
✅ "INVESTIGATE"
✅ "START"

**VALIDATION CHECKLIST** (self-check before output):
✓ Total word count is 20-30 words?
✓ Used victim's name (${caseData.victim.name}) in question?
✓ No forbidden keywords present?
✓ All lines are punchy and direct (no fluff)?
✓ Valid JSON format?

Generate output with rhythmic impact. Count your words carefully!
`.trim();
  }
}
