/**
 * CaseGeneratorService.ts
 *
 * AI 기반 케이스 생성 서비스
 * CaseElementLibrary + GeminiClient를 결합하여 플레이 가능한 케이스 생성
 */

import { GeminiClient, type GeminiTextOptions } from '../gemini/GeminiClient';
import { CaseElementLibrary, type Weapon, type Motive, type Location, type Suspect } from './CaseElementLibrary';
import { CaseRepository, type CreateCaseInput } from '../repositories/kv/CaseRepository';

export interface GenerateCaseOptions {
  date?: Date;
  includeImage?: boolean;
  includeSuspectImages?: boolean; // Generate profile images for suspects
  temperature?: number;
  customCaseId?: string; // Custom case ID for unique identification (timestamp-based)
}

export interface GeneratedCase {
  caseId: string;
  id: string;              // Alias for backward compatibility
  date: string;            // Date string in YYYY-MM-DD format
  victim: {
    name: string;
    background: string;
    relationship: string;
  };
  weapon: Weapon;
  location: Location;
  suspects: Array<{
    id: string;
    name: string;
    archetype: string;
    background: string;
    personality: string;
    isGuilty: boolean;
    profileImageUrl?: string; // Profile image URL
  }>;
  solution: {
    who: string;
    what: string;
    where: string;
    when: string;
    why: string;
    how: string;
  };
  imageUrl?: string;
  introNarration?: {
    atmosphere: string;
    incident: string;
    stakes: string;
  };
  generatedAt: number;
}

/**
 * 케이스 생성 서비스
 */
export class CaseGeneratorService {
  private geminiClient: GeminiClient;

  constructor(geminiClient: GeminiClient) {
    this.geminiClient = geminiClient;
  }

  /**
   * 새로운 케이스 생성
   *
   * Phase 1: 텍스트 케이스만 생성 (이미지는 선택)
   * Phase 2-3: 이미지 포함 생성
   */
  async generateCase(options: GenerateCaseOptions = {}): Promise<GeneratedCase> {
    const {
      date = new Date(),
      includeImage = false,
      includeSuspectImages = false,
      temperature = 0.8,
      customCaseId
    } = options;

    console.log(`🔄 Generating case for ${date.toISOString().split('T')[0]}...`);

    // 1. CaseElementLibrary에서 오늘의 요소 선택
    const elements = CaseElementLibrary.getTodaysCaseElements(date);

    console.log(`📚 Selected elements:
      - Weapon: ${elements.weapon.name}
      - Motive: ${elements.motive.category}
      - Location: ${elements.location.name}
      - Suspects: ${elements.suspects.map(s => s.archetype).join(', ')}`
    );

    // 2. 케이스 스토리 생성 (Gemini)
    const caseStory = await this.generateCaseStory(
      elements.weapon,
      elements.motive,
      elements.location,
      elements.suspects,
      temperature
    );

    console.log(`✅ Case story generated`);

    // 2.5. 인트로 나레이션 생성 (NEW!)
    let introNarration: { atmosphere: string; incident: string; stakes: string };
    try {
      introNarration = await this.generateIntroNarration(
        caseStory,
        elements.weapon,
        elements.location,
        temperature
      );
      console.log(`✅ Intro narration generated`);
    } catch (error) {
      console.error('❌ Narration generation failed:', error);
      // Fallback to basic narration
      introNarration = this.generateFallbackNarration(
        caseStory,
        elements.weapon,
        elements.location
      );
      console.log(`✅ Fallback narration generated`);
    }

    // 3. 케이스 이미지 생성 (선택)
    let imageUrl: string | undefined;
    if (includeImage) {
      try {
        imageUrl = await this.generateCaseImage(
          elements.location,
          elements.weapon,
          caseStory.victim.name
        );
        console.log(`✅ Case image generated`);
      } catch (error) {
        console.error('❌ Image generation failed:', error);
        // 이미지 실패해도 케이스는 생성 (Phase 1 철학)
      }
    }

    // 3.5. 용의자 프로필 이미지 생성 (선택)
    const suspectsWithImages = await this.generateSuspectProfileImages(
      caseStory.suspects,
      elements.suspects,
      includeSuspectImages
    );

    // 4. CaseRepository에 저장
    const createInput: CreateCaseInput = {
      victim: caseStory.victim,
      weapon: {
        name: elements.weapon.name,
        description: elements.weapon.description
      },
      location: {
        name: elements.location.name,
        description: elements.location.description
      },
      suspects: suspectsWithImages.map((suspect, index) => ({
        name: suspect.name,
        archetype: elements.suspects[index].archetype,
        background: suspect.background,
        personality: suspect.personality,
        isGuilty: suspect.isGuilty,
        profileImageUrl: suspect.profileImageUrl
      })),
      solution: caseStory.solution,
      imageUrl,
      introNarration  // 새로 추가
    };

    const savedCase = await CaseRepository.createCase(createInput, date, customCaseId);

    console.log(`✅ Case saved: ${savedCase.id}`);

    // 5. GeneratedCase 형식으로 반환
    return {
      caseId: savedCase.id,
      id: savedCase.id,        // Alias for backward compatibility
      date: savedCase.date,    // Date string
      victim: savedCase.victim,
      weapon: elements.weapon,
      location: elements.location,
      suspects: savedCase.suspects.map((s, index) => ({
        id: s.id,
        name: s.name,
        archetype: s.archetype,
        background: suspectsWithImages[index].background,
        personality: suspectsWithImages[index].personality,
        isGuilty: s.isGuilty,
        profileImageUrl: suspectsWithImages[index].profileImageUrl
      })),
      solution: savedCase.solution,
      imageUrl: savedCase.imageUrl,
      introNarration: savedCase.introNarration,
      generatedAt: savedCase.generatedAt
    };
  }

  /**
   * 인트로 나레이션 생성 (Gemini API)
   */
  private async generateIntroNarration(
    caseStory: {
      victim: { name: string; background: string };
      suspects: Array<{ name: string }>;
    },
    weapon: Weapon,
    location: Location,
    temperature: number
  ): Promise<{ atmosphere: string; incident: string; stakes: string }> {
    const prompt = this.buildIntroNarrationPrompt(
      caseStory,
      weapon,
      location
    );

    const response = await this.geminiClient.generateText(prompt, {
      temperature,
      maxTokens: 1024
    });

    return this.geminiClient.parseJsonResponse(response.text);
  }

  /**
   * Enhanced 인트로 나레이션 프롬프트 생성
   *
   * Anthropic best practices + literary devices 적용
   * 4 few-shot examples, 구체적 literary techniques 지시
   *
   * @see https://github.com/anthropics/courses - Prompt Engineering Best Practices
   */
  private buildIntroNarrationPrompt(
    caseStory: {
      victim: { name: string; background: string };
      suspects: Array<{ name: string }>;
    },
    weapon: Weapon,
    location: Location
  ): string {
    return `# ROLE & EXPERTISE

You are a master detective fiction writer specializing in atmospheric murder mystery narratives. Your work is known for:
- Sensory-rich descriptions that transport readers into the scene
- Psychological tension that builds with each sentence
- Literary devices (metaphor, personification, foreshadowing) seamlessly woven into prose
- Genre-specific vocabulary that evokes classic noir, gothic, or psychological thriller moods

Your influences include Raymond Chandler's hard-boiled prose, Agatha Christie's locked-room mysteries, and Gillian Flynn's psychological depth.

# TONE & STYLE

**Writing Style Requirements:**
- **Immersive**: Every sentence should engage multiple senses
- **Cinematic**: Write as if directing a camera—what does the reader SEE, HEAR, SMELL?
- **Economical**: Maximum impact with minimum words (no purple prose)
- **Active Voice**: Prefer "The wind clawed at the windows" over "The windows were clawed by the wind"

**Forbidden Clichés:**
❌ "It was a dark and stormy night"
❌ "Little did they know"
❌ "The calm before the storm"
❌ Generic descriptions: "beautiful mansion", "scary atmosphere"

# CASE DETAILS

<case_info>
Victim: ${caseStory.victim.name}
Background: ${caseStory.victim.background}
Location: ${location.name} - ${location.description}
Weapon: ${weapon.name}
Suspects: ${caseStory.suspects.length} individuals
</case_info>

# TASK: Generate 3-Phase Narration in Korean

## Phase 1: ATMOSPHERE (50-80 words in Korean)
**Required Elements:**
1. One striking visual hook that defines the scene
2. At least 3 different senses (sight, sound, smell, touch, temperature)
3. Specific time marker (when is this happening?)
4. At least one metaphor, simile, or personification

**Don't**: Explain the mood. **Do**: Show it through concrete details.

## Phase 2: INCIDENT (50-80 words in Korean)
**Required Elements:**
1. Victim's name + position description with visual precision
2. Specific weapon/method with one vivid detail
3. One impossible element (locked from inside, no footprints, evidence contradiction)
4. Forensic poetry (describe violence without being gratuitous)

**Pattern**:
- Discovery (who, where)
- Death details (how)
- The impossibility (locked-room mystery element)
- Evidence contradiction

## Phase 3: STAKES (50-90 words in Korean)
**Required Elements:**
1. Detective identity ("당신은...")
2. Specific suspect count with one detail about them
3. Time pressure (why must this be solved NOW?)
4. Challenge framing (what makes this difficult?)
5. Call to action (end with urgency)

**Don't**: Say "범인을 찾아라". **Do**: "거짓말의 그물을 풀어내라, 그 전에..."

# FEW-SHOT EXAMPLES (for quality reference)

<example id="gothic">
<atmosphere>
The Blackwood Estate loomed against the storm-torn sky, its gargoyles weeping rainwater like stone tears. Lightning carved the darkness, revealing ivy-choked windows that hadn't seen light in decades. Inside, candles guttered in their holders, throwing monstrous shadows across oil paintings of the long-dead Blackwood lineage—their eyes seeming to follow every movement through the gloom.
</atmosphere>
<incident>
Lord Edmund Blackwood lay sprawled across the library's Persian rug, his silk cravat soaked crimson. The letter opener—family heirloom, silver and jade—protruded from between his ribs at an impossible angle. Yet the study door remained locked from the inside, its key still clutched in the victim's cooling hand. No footprints marred the dust. No windows stood open to the howling night.
</incident>
<stakes>
You are Detective Inspector Sarah Chen, summoned from London at midnight. Seven family members sheltered within these walls when the scream rang out. The storm has washed out the only road—no one can leave, no reinforcements can arrive. One of them is a murderer. One of them is lying. And somewhere in this labyrinth of secrets, the truth waits to be unearthed before the killer strikes again.
</stakes>
</example>

<example id="noir">
<atmosphere>
Rain hammered the city like bullets on tin, turning the alley into a river of neon reflections. Cigarette smoke curled from the jazz club's back door, mixing with the stench of wet garbage and something darker. The kind of darkness that clings to your coat and follows you home. A solo saxophone wailed somewhere above, playing a funeral dirge for a city that had forgotten how to mourn.
</atmosphere>
<incident>
Vincent "Ace" Romano would never deal another hand. The casino owner lay face-down in a puddle that wasn't just rainwater, a .38 slug in his back—clean shot, professional work. His diamond pinky ring gleamed under the streetlight, untouched. No robbery, then. This was personal. The murder weapon lay three feet away, wiped clean, almost mocking. Someone wanted to send a message.
</incident>
<stakes>
You're a private eye who owes Ace a favor—the kind that doesn't die with a man. Three suspects were seen leaving the club minutes before the body dropped: his trophy wife, his business partner, and the enforcer he'd just fired. Each has an alibi. Each has a motive. The cops will be here in twenty minutes. That's all the time you've got to read between the lies before this case gets buried under red tape and corruption.
</stakes>
</example>

<example id="psychological">
<atmosphere>
The psychiatric hospital's east wing breathed with unnatural quiet. Fluorescent lights hummed their anxiety-inducing frequency, casting everything in sickly green. Dr. Morrison's office door stood ajar—unusual for a man who locked even his desk drawers. The air tasted of antiseptic and something underneath it, something wrong. A patient's scream echoed from Ward C, then cut off abruptly. Too abruptly.
</atmosphere>
<incident>
Dr. Marcus Morrison, the institution's head psychiatrist, sat rigid in his leather chair, eyes frozen in expression of profound terror. No visible wounds. No signs of struggle. Just a man who'd seen something that stopped his heart. On his desk: patient files scattered, one session recording still playing on loop—a patient's voice whispering, 'He knows. He knows what we did.' The timestamp: three hours before his estimated time of death.
</incident>
<stakes>
You're the detective called in when hospital security found something that doesn't make medical sense. Five patients had appointments with Morrison today. Three have violent histories. Two claimed Morrison was 'getting too close to the truth.' One insists they can't remember their session at all. The hospital director is pressuring for quick resolution—bad for business, you understand. But in a place where everyone is lying to survive, how do you find the one lie that killed?
</stakes>
</example>

<example id="modern">
<atmosphere>
The penthouse apartment was all glass and chrome—a monument to success that now felt like a display case for death. City lights glittered forty stories below, indifferent witnesses to what happened here. Everything in its place, everything pristine. Except for the body.
</atmosphere>
<incident>
Tech mogul Jennifer Park lay on her designer sofa, champagne flute still gripped in her hand. Poison—subtle, sophisticated, untraceable without a lab. The security system showed no breaches. The smart locks reported no unauthorized entries. Even the AI assistant had nothing to report. Yet someone had gotten close enough to slip death into her evening drink.
</incident>
<stakes>
You're the detective in a world where technology records everything—except the truth. Three people had access to this fortress: her business rival, her ex-lover who couldn't let go, and her assistant who knew all her secrets. Each has a digital alibi. Each has a flesh-and-blood motive. In sixty minutes, the lawyers arrive and the evidence gets locked behind NDAs and corporate interests. The clock is ticking, and in this game, the smartest player wins.
</stakes>
</example>

# LITERARY TECHNIQUES TO EMPLOY

**Metaphor Examples:**
- Building as character: "저택이 재판관의 망치처럼 우뚝 섰다"
- Weather as emotion: "비가 말하지 못한 진실을 위해 울었다"
- Time as threat: "시계의 각 똑딱 소리가 또 하나의 관을 못질했다"

**Sensory Details (choose 3+ per phase):**
- Sight: 조명, 그림자, 색 상징, 움직임
- Sound: 환경음, 돌발음, 침묵, 메아리
- Smell: 부패, 향수, 음식, 연기
- Touch: 온도, 질감, 습기
- Taste: 두려움의 금속 맛, 쓴 공기 (rarely)

# OUTPUT FORMAT

Respond ONLY with valid JSON in **KOREAN**:

\`\`\`json
{
  "atmosphere": "[한국어로 50-80 단어, Phase 1 요구사항 충족]",
  "incident": "[한국어로 50-80 단어, Phase 2 요구사항 충족]",
  "stakes": "[한국어로 50-90 단어, Phase 3 요구사항 충족]"
}
\`\`\`

**IMPORTANT**: Generate the narration in KOREAN (한국어), using the same quality, literary techniques, and emotional impact as the English examples above.

Generate the narration now.`;
  }

  /**
   * 기본 나레이션 생성 (Fallback)
   */
  private generateFallbackNarration(
    caseStory: {
      victim: { name: string; background: string };
      suspects: Array<{ name: string }>;
    },
    weapon: Weapon,
    location: Location
  ): { atmosphere: string; incident: string; stakes: string } {
    return {
      atmosphere: `${location.name}. 어둠이 내려앉은 밤, 긴장감이 감돈다. 무언가 끔찍한 일이 일어났다.`,
      incident: `${caseStory.victim.name}이(가) ${location.name}에서 사망한 채 발견되었다. ${weapon.name}이(가) 현장에 있다. 침입 흔적은 없다.`,
      stakes: `당신은 형사다. ${caseStory.suspects.length}명의 용의자가 있다. 진실을 밝혀내야 한다.`
    };
  }

  /**
   * 케이스 스토리 생성 (Gemini)
   */
  private async generateCaseStory(
    weapon: Weapon,
    motive: Motive,
    location: Location,
    suspectArchetypes: Suspect[],
    temperature: number
  ): Promise<{
    victim: { name: string; background: string; relationship: string };
    suspects: Array<{
      name: string;
      background: string;
      personality: string;
      isGuilty: boolean;
    }>;
    solution: {
      who: string;
      what: string;
      where: string;
      when: string;
      why: string;
      how: string;
    };
  }> {
    const prompt = this.buildCaseStoryPrompt(weapon, motive, location, suspectArchetypes);

    const response = await this.geminiClient.generateText(prompt, {
      temperature,
      maxTokens: 4096
    });

    // JSON 파싱
    return this.geminiClient.parseJsonResponse(response.text);
  }

  /**
   * 케이스 스토리 생성 프롬프트
   */
  private buildCaseStoryPrompt(
    weapon: Weapon,
    motive: Motive,
    location: Location,
    suspectArchetypes: Suspect[]
  ): string {
    return `당신은 탐정 소설 작가입니다. 다음 요소들을 사용하여 플레이 가능한 살인 미스터리 케이스를 생성하세요.

**제약 조건:**
- 무기: ${weapon.name} (${weapon.description})
- 동기: ${motive.category} (${motive.description})
- 장소: ${location.name} (${location.description})
- 장소 소품: ${location.props.join(', ')}
- 용의자 원형: ${suspectArchetypes.map((s, i) => `${i + 1}. ${s.archetype}`).join(', ')}

**생성 규칙:**
1. **피해자**: 한국 이름, 설득력 있는 배경 스토리, 용의자들과의 관계
2. **용의자 3명**:
   - 각각 한국 이름
   - 제공된 원형을 기반으로 한 상세한 배경
   - 독특한 성격 특성
   - 한 명만 진범 (isGuilty: true)
3. **해결책 (5W1H)**:
   - WHO: 범인의 이름
   - WHAT: 정확한 살인 방법
   - WHERE: 구체적인 장소 (${location.props.join(' 또는 ')} 중 하나)
   - WHEN: 시간대
   - WHY: 명확한 동기
   - HOW: 상세한 실행 방법

**중요**:
- 진범은 3명 중 정확히 1명만
- 다른 2명은 알리바이가 있거나 의심스럽지만 결백함
- 해결책은 논리적이고 증명 가능해야 함

**응답 형식 (JSON):**
\`\`\`json
{
  "victim": {
    "name": "김명수",
    "background": "50대 중반의 성공한 사업가...",
    "relationship": "용의자들과의 관계 설명..."
  },
  "suspects": [
    {
      "name": "이서연",
      "background": "피해자의 비즈니스 파트너로...",
      "personality": "냉철하고 계산적이며...",
      "isGuilty": false
    },
    {
      "name": "박준호",
      "background": "피해자의 오랜 친구이자...",
      "personality": "충동적이고 감정적이며...",
      "isGuilty": true
    },
    {
      "name": "최민지",
      "background": "피해자의 전 부인으로...",
      "personality": "차분하지만 복수심이...",
      "isGuilty": false
    }
  ],
  "solution": {
    "who": "박준호",
    "what": "${weapon.name}을(를) 사용한 살인",
    "where": "${location.name}의 ${location.props[0]} 근처",
    "when": "2024년 1월 15일 오후 11시 30분경",
    "why": "${motive.category} - 구체적인 이유...",
    "how": "상세한 범행 방법..."
  }
}
\`\`\`

JSON만 응답하세요. 다른 설명은 필요 없습니다.`;
  }

  /**
   * 케이스 이미지 생성 프롬프트
   */
  private async generateCaseImage(
    location: Location,
    weapon: Weapon,
    victimName: string
  ): Promise<string> {
    const imagePrompt = this.buildImagePrompt(location, weapon, victimName);

    const response = await this.geminiClient.generateImage(imagePrompt);

    return response.imageUrl;
  }

  /**
   * 이미지 생성 프롬프트
   */
  private buildImagePrompt(
    location: Location,
    weapon: Weapon,
    victimName: string
  ): string {
    return `Crime scene illustration: ${location.name}, ${location.atmosphere}.
Scene includes ${location.props.slice(0, 3).join(', ')}.
Evidence of ${weapon.name}.
Dark, moody lighting.
Professional detective game art style.
No text, no people visible.
High quality, detailed, atmospheric.`;
  }

  /**
   * 용의자 프로필 이미지 생성 (순차 처리)
   *
   * Phase 1 수정: 병렬 → 순차 실행으로 변경
   * - Gemini API rate limiting 우회
   * - 각 이미지가 완전히 생성된 후 다음 이미지 생성
   * - 시간은 늘어나지만(~15초) 성공률 향상
   */
  private async generateSuspectProfileImages(
    suspects: Array<{
      name: string;
      background: string;
      personality: string;
      isGuilty: boolean;
    }>,
    archetypes: Suspect[],
    shouldGenerate: boolean
  ): Promise<Array<{
    name: string;
    background: string;
    personality: string;
    isGuilty: boolean;
    profileImageUrl?: string;
  }>> {
    if (!shouldGenerate) {
      console.log('⏭️  Skipping suspect profile image generation');
      return suspects;
    }

    console.log('🎨 Generating profile images for suspects (sequential)...');

    // 순차 처리로 Gemini API rate limiting 우회
    const results: Array<{
      name: string;
      background: string;
      personality: string;
      isGuilty: boolean;
      profileImageUrl?: string;
    }> = [];

    for (let index = 0; index < suspects.length; index++) {
      const suspect = suspects[index];
      try {
        console.log(`🎨 Generating image ${index + 1}/${suspects.length}: ${suspect.name}...`);

        const prompt = this.buildSuspectProfilePrompt(
          suspect,
          archetypes[index]
        );

        const response = await this.geminiClient.generateImage(prompt);

        console.log(`✅ Profile image generated for ${suspect.name}`);

        results.push({
          ...suspect,
          profileImageUrl: response.imageUrl
        });
      } catch (error) {
        console.error(`❌ Profile image generation failed for ${suspect.name}:`, error);
        // 이미지 실패해도 용의자 데이터는 유지
        results.push(suspect);
      }
    }

    console.log(`✅ Suspect profile images generated: ${results.filter(r => r.profileImageUrl).length}/${suspects.length}`);

    return results;
  }

  /**
   * 용의자 프로필 이미지 프롬프트 생성
   */
  private buildSuspectProfilePrompt(
    suspect: {
      name: string;
      background: string;
      personality: string;
    },
    archetype: Suspect
  ): string {
    return `Professional portrait photograph of a ${archetype.archetype}.
Character: ${suspect.name}
Background: ${suspect.background}
Personality: ${suspect.personality}
Style: Professional headshot, cinematic lighting, shallow depth of field, neutral background.
Focus: Face and upper shoulders, direct eye contact with camera.
Quality: Photorealistic, high detail, professional photography.
Format: 512x512 portrait photograph.
Mood: Mystery, intrigue, subtle emotional expression.`;
  }

  /**
   * 오늘의 케이스 조회 또는 생성
   */
  async getTodaysCase(options: { includeImage?: boolean; includeSuspectImages?: boolean } = {}): Promise<GeneratedCase> {
    // 이미 생성된 케이스가 있는지 확인
    const existingCase = await CaseRepository.getTodaysCase();

    if (existingCase) {
      console.log(`✅ Today's case already exists: ${existingCase.id}`);

      // GeneratedCase 형식으로 변환
      const suspects = await CaseRepository.getCaseSuspects(existingCase.id);

      return {
        caseId: existingCase.id,
        id: existingCase.id,        // Alias for backward compatibility
        date: existingCase.date,    // Date string
        victim: existingCase.victim,
        weapon: existingCase.weapon as Weapon,
        location: existingCase.location as Location,
        suspects: suspects.map(s => ({
          id: s.id,
          name: s.name,
          archetype: s.archetype,
          background: s.background,
          personality: s.personality,
          isGuilty: s.isGuilty,
          profileImageUrl: s.profileImageUrl
        })),
        solution: existingCase.solution,
        imageUrl: existingCase.imageUrl,
        introNarration: existingCase.introNarration,
        generatedAt: existingCase.generatedAt
      };
    }

    // 새로 생성
    console.log(`🔄 Generating today's case...`);
    return await this.generateCase({
      date: new Date(),
      includeImage: options.includeImage,
      includeSuspectImages: options.includeSuspectImages
    });
  }

  /**
   * 특정 날짜의 케이스 조회 또는 생성
   */
  async getCaseForDate(
    date: Date,
    options: { includeImage?: boolean; includeSuspectImages?: boolean } = {}
  ): Promise<GeneratedCase> {
    const dateStr = date.toISOString().split('T')[0];
    const existingCase = await CaseRepository.getCaseByDate(dateStr);

    if (existingCase) {
      console.log(`✅ Case already exists for ${dateStr}: ${existingCase.id}`);

      const suspects = await CaseRepository.getCaseSuspects(existingCase.id);

      return {
        caseId: existingCase.id,
        id: existingCase.id,        // Alias for backward compatibility
        date: existingCase.date,    // Date string
        victim: existingCase.victim,
        weapon: existingCase.weapon as Weapon,
        location: existingCase.location as Location,
        suspects: suspects.map(s => ({
          id: s.id,
          name: s.name,
          archetype: s.archetype,
          background: s.background,
          personality: s.personality,
          isGuilty: s.isGuilty,
          profileImageUrl: s.profileImageUrl
        })),
        solution: existingCase.solution,
        imageUrl: existingCase.imageUrl,
        introNarration: existingCase.introNarration,
        generatedAt: existingCase.generatedAt
      };
    }

    // 새로 생성
    console.log(`🔄 Generating case for ${dateStr}...`);
    return await this.generateCase({
      date,
      includeImage: options.includeImage,
      includeSuspectImages: options.includeSuspectImages
    });
  }
}

/**
 * 싱글톤 인스턴스 생성 헬퍼
 */
export function createCaseGeneratorService(geminiClient: GeminiClient): CaseGeneratorService {
  return new CaseGeneratorService(geminiClient);
}
