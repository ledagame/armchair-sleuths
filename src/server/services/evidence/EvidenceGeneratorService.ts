/**
 * EvidenceGeneratorService.ts
 *
 * AI-powered evidence generator implementing:
 * - 3-Clue Rule: Minimum 3 independent clues pointing to guilty
 * - Fair Play: All evidence discoverable and interpretable
 * - Gumshoe Principle: Easy to find, hard to interpret
 */

import type { GeminiClient } from '../gemini/GeminiClient';
import type {
  MultilingualWeapon,
  MultilingualLocation,
  MultilingualMotive,
  SuspectContent
} from '../../../shared/types/i18n';
import type {
  MultilingualEvidence,
  GenerateEvidenceOptions,
  EvidenceItem,
  DiscoveryDifficulty
} from '../../../shared/types/Evidence';
import { getDiscoveryProbability } from '../../../shared/types/Evidence';

/**
 * EvidenceGeneratorService
 *
 * Generates multilingual evidence following detective game principles
 */
export class EvidenceGeneratorService {
  constructor(private geminiClient: GeminiClient) {}

  /**
   * Generate multilingual evidence collection
   *
   * @param location - Crime scene location
   * @param weapon - Murder weapon
   * @param motive - Motive for the crime
   * @param suspects - All suspects with details
   * @param guiltyIndex - Index of guilty suspect (0, 1, or 2)
   * @param caseId - Case ID for tracking
   * @param options - Generation options
   */
  async generateEvidence(
    location: MultilingualLocation,
    weapon: MultilingualWeapon,
    motive: MultilingualMotive,
    suspects: SuspectContent[],
    guiltyIndex: number,
    caseId: string,
    options: GenerateEvidenceOptions = {}
  ): Promise<MultilingualEvidence> {
    const {
      minCriticalEvidence = 3,
      includeRedHerrings = true,
      difficulty = 'medium',
      fairPlayCompliant = true
    } = options;

    console.log(`🔍 Generating evidence for case ${caseId}...`);
    console.log(`   Guilty suspect: #${guiltyIndex + 1} (${suspects[guiltyIndex].name})`);
    console.log(`   Difficulty: ${difficulty}`);
    console.log(`   Min critical evidence: ${minCriticalEvidence}`);

    // Build AI prompt for evidence generation
    const prompt = this.buildEvidencePrompt(
      location,
      weapon,
      motive,
      suspects,
      guiltyIndex,
      {
        minCriticalEvidence,
        includeRedHerrings,
        difficulty,
        fairPlayCompliant
      }
    );

    // Generate content via Gemini AI
    const response = await this.geminiClient.generateText(prompt, {
      temperature: 0.8,
      maxTokens: 8192  // Large token budget for detailed evidence
    });

    // Parse JSON response
    const parsed = this.geminiClient.parseJsonResponse(response.text);

    // Enhance evidence items with discovery system fields
    const enhancedKo = this.enhanceEvidenceItems(
      parsed.translations.ko.items,
      location.id,
      difficulty
    );
    const enhancedEn = this.enhanceEvidenceItems(
      parsed.translations.en.items,
      location.id,
      difficulty
    );

    // Calculate metadata
    const totalItems = enhancedKo.length;
    const criticalCount = enhancedKo.filter(
      (item: EvidenceItem) => item.relevance === 'critical'
    ).length;
    const evidencePointingToGuilty = enhancedKo.filter(
      (item: EvidenceItem) => item.pointsToSuspect === guiltyIndex
    ).length;
    const threeClueRuleCompliant =
      criticalCount >= minCriticalEvidence &&
      evidencePointingToGuilty >= minCriticalEvidence;

    // Construct MultilingualEvidence object
    const evidence: MultilingualEvidence = {
      caseId,
      locationId: location.id,
      translations: {
        ko: {
          items: enhancedKo,
          summary: parsed.translations.ko.summary
        },
        en: {
          items: enhancedEn,
          summary: parsed.translations.en.summary
        }
      },
      metadata: {
        totalItems,
        criticalCount,
        threeClueRuleCompliant,
        guiltyIndex,
        evidencePointingToGuilty
      },
      generatedAt: Date.now()
    };

    console.log(`✅ Evidence generated:`);
    console.log(`   Total items: ${totalItems}`);
    console.log(`   Critical: ${criticalCount}`);
    console.log(`   Pointing to guilty: ${evidencePointingToGuilty}`);
    console.log(`   3-Clue Rule: ${threeClueRuleCompliant ? '✅' : '❌'}`);

    if (!threeClueRuleCompliant) {
      console.warn(`⚠️  WARNING: 3-Clue Rule not satisfied!`);
    }

    return evidence;
  }

  /**
   * Enhance evidence items with discovery system fields
   *
   * Assigns:
   * - discoveryDifficulty based on relevance and case difficulty
   * - discoveryProbability using presets
   * - foundAtLocationId
   */
  private enhanceEvidenceItems(
    items: any[],
    locationId: string,
    caseDifficulty: 'easy' | 'medium' | 'hard'
  ): EvidenceItem[] {
    return items.map((item: any) => {
      const discoveryDifficulty = this.assignDiscoveryDifficulty(
        item.relevance,
        caseDifficulty
      );
      const discoveryProbability = getDiscoveryProbability(
        discoveryDifficulty,
        item.relevance
      );

      return {
        ...item,
        discoveryDifficulty,
        discoveryProbability,
        foundAtLocationId: locationId,
        // imageUrl and imageGeneratedAt will be added by image generation service later
      };
    });
  }

  /**
   * Assign discovery difficulty based on evidence relevance and case difficulty
   *
   * Logic:
   * - Easy cases: Critical = obvious, Important = obvious, Minor = medium
   * - Medium cases: Critical = medium, Important = medium, Minor = hidden
   * - Hard cases: Critical = medium, Important = hidden, Minor = hidden
   *
   * Ensures Fair Play: Critical evidence always at least "medium" difficulty
   */
  private assignDiscoveryDifficulty(
    relevance: 'critical' | 'important' | 'minor',
    caseDifficulty: 'easy' | 'medium' | 'hard'
  ): DiscoveryDifficulty {
    if (caseDifficulty === 'easy') {
      return relevance === 'minor' ? 'medium' : 'obvious';
    }

    if (caseDifficulty === 'medium') {
      return relevance === 'minor' ? 'hidden' : 'medium';
    }

    // Hard difficulty
    if (relevance === 'critical') {
      return 'medium';  // Critical evidence must be findable
    }
    return 'hidden';
  }

  /**
   * Build AI prompt for evidence generation
   *
   * CRITICAL: Generate Korean and English simultaneously
   * to ensure same evidence structure in both languages
   */
  private buildEvidencePrompt(
    location: MultilingualLocation,
    weapon: MultilingualWeapon,
    motive: MultilingualMotive,
    suspects: SuspectContent[],
    guiltyIndex: number,
    options: GenerateEvidenceOptions
  ): string {
    const { minCriticalEvidence, includeRedHerrings, difficulty, fairPlayCompliant } = options;
    const guiltySuspect = suspects[guiltyIndex];

    return `You are a detective game evidence designer. Create a comprehensive evidence collection in BOTH Korean AND English simultaneously.

**CRITICAL REQUIREMENT: SAME EVIDENCE IN BOTH LANGUAGES**
- The SAME evidence items in both languages (same count, same order)
- The SAME evidence types and relevance levels
- The SAME suspect pointers (pointsToSuspect values)
- Only the language presentation differs

**Case Information:**
- Location: ${location.translations.ko.name} / ${location.translations.en.name}
- Weapon: ${weapon.translations.ko.name} / ${weapon.translations.en.name}
- Motive: ${motive.translations.ko.name} / ${motive.translations.en.name}
- Guilty Suspect: #${guiltyIndex + 1} - ${guiltySuspect.name}

**Suspects:**
${suspects.map((s, i) => `${i + 1}. ${s.name} - ${s.occupation} (${s.isGuilty ? 'GUILTY' : 'innocent'})`).join('\n')}

**DETECTIVE GAME PRINCIPLES:**

1. **3-Clue Rule (CRITICAL)**:
   - Minimum ${minCriticalEvidence} independent CRITICAL evidence items
   - At least ${minCriticalEvidence} evidence items must point to guilty suspect #${guiltyIndex + 1}
   - Each critical clue should reveal different aspect of the crime
   - Critical clues must be sufficient to solve the case

2. **Fair Play Principle**:
   - ${fairPlayCompliant ? 'Every evidence item MUST have discoveryHint (how to find it)' : 'Discovery hints optional'}
   - ${fairPlayCompliant ? 'Critical evidence MUST have interpretationHint (what it means)' : 'Interpretation hints optional'}
   - Player must be able to solve the case with provided evidence
   - No hidden information or unfair surprises

3. **Gumshoe Principle**:
   - Evidence should be easy to FIND (clear discovery hints)
   - Evidence should be hard to INTERPRET (requires reasoning)
   - Avoid overly obvious connections
   - Make player think and connect dots

**Generation Rules:**

1. **Create 8-12 evidence items** total
   - ${minCriticalEvidence}+ items with relevance: "critical"
   - 3-4 items with relevance: "important"
   - 2-3 items with relevance: "minor"
   - ${includeRedHerrings ? '2-3 items should be red herrings (misleading)' : 'No red herrings'}

2. **Evidence Types Distribution**:
   - Physical: Objects found at crime scene
   - Testimony: Witness statements
   - Financial: Money, transactions, debts
   - Communication: Phone, email, messages
   - Alibi: Location/time evidence
   - Forensic: Scientific analysis
   - Documentary: Written documents

3. **Guilty Suspect Connection**:
   - At least ${minCriticalEvidence} evidence items must have pointsToSuspect: ${guiltyIndex}
   - These should reveal: motive, means, opportunity
   - Connect to ${weapon.translations.en.name} usage
   - Connect to ${motive.translations.en.name} motive

4. **Difficulty: ${difficulty}**:
   - Easy: Obvious connections, direct evidence, clear interpretations
   - Medium: Some inference required, mixed obvious/subtle clues
   - Hard: Subtle connections, multiple interpretations, complex reasoning required

5. **Fair Play Compliance: ${fairPlayCompliant ? 'REQUIRED' : 'OPTIONAL'}**:
   ${fairPlayCompliant ? '- Every item must have discoveryHint\n   - Critical items must have interpretationHint' : '- Discovery and interpretation hints optional'}

**Response Format (JSON):**
\`\`\`json
{
  "translations": {
    "ko": {
      "summary": "증거 전체 요약...",
      "items": [
        {
          "id": "evidence-1",
          "type": "physical",
          "name": "피묻은 칼",
          "description": "범행에 사용된 것으로 보이는 칼. 피해자의 피가 묻어있다.",
          "discoveryHint": "서재 책상 서랍에서 발견됨",
          "interpretationHint": "칼자루의 지문이 용의자 #${guiltyIndex + 1}과 일치함",
          "relevance": "critical",
          "pointsToSuspect": ${guiltyIndex}
        },
        {
          "id": "evidence-2",
          "type": "financial",
          "name": "은행 거래 내역",
          "description": "피해자와 용의자 간의 거액 금전 거래 기록",
          "discoveryHint": "피해자의 서류 가방에서 발견",
          "interpretationHint": "용의자 #${guiltyIndex + 1}이 피해자에게 큰 빚이 있었음",
          "relevance": "critical",
          "pointsToSuspect": ${guiltyIndex}
        },
        {
          "id": "evidence-3",
          "type": "communication",
          "name": "협박 문자 메시지",
          "description": "피해자의 휴대폰에 남아있는 위협적인 문자",
          "discoveryHint": "피해자의 휴대폰 메시지함",
          "interpretationHint": "발신자 번호가 용의자 #${guiltyIndex + 1}의 것과 일치",
          "relevance": "critical",
          "pointsToSuspect": ${guiltyIndex}
        },
        {
          "id": "evidence-4",
          "type": "testimony",
          "name": "목격자 진술",
          "description": "사건 당일 수상한 사람을 목격했다는 진술",
          "discoveryHint": "인근 주민 인터뷰 중 확보",
          "interpretationHint": "목격자가 본 사람의 특징이 용의자 #${guiltyIndex !== 0 ? 0 : 1}과 유사 (오해의 소지)",
          "relevance": "important",
          "pointsToSuspect": ${guiltyIndex !== 0 ? 0 : 1}
        }
      ]
    },
    "en": {
      "summary": "Overall evidence summary...",
      "items": [
        {
          "id": "evidence-1",
          "type": "physical",
          "name": "Bloody Knife",
          "description": "A knife that appears to be the murder weapon. Has victim's blood on it.",
          "discoveryHint": "Found in study desk drawer",
          "interpretationHint": "Fingerprints on handle match suspect #${guiltyIndex + 1}",
          "relevance": "critical",
          "pointsToSuspect": ${guiltyIndex}
        },
        {
          "id": "evidence-2",
          "type": "financial",
          "name": "Bank Transaction Records",
          "description": "Records of large financial transactions between victim and suspect",
          "discoveryHint": "Found in victim's briefcase",
          "interpretationHint": "Suspect #${guiltyIndex + 1} owed victim a large debt",
          "relevance": "critical",
          "pointsToSuspect": ${guiltyIndex}
        },
        {
          "id": "evidence-3",
          "type": "communication",
          "name": "Threatening Text Messages",
          "description": "Threatening messages found on victim's phone",
          "discoveryHint": "Victim's phone message inbox",
          "interpretationHint": "Sender's number matches suspect #${guiltyIndex + 1}",
          "relevance": "critical",
          "pointsToSuspect": ${guiltyIndex}
        },
        {
          "id": "evidence-4",
          "type": "testimony",
          "name": "Witness Statement",
          "description": "Statement about seeing suspicious person on the day of incident",
          "discoveryHint": "Obtained during neighborhood interviews",
          "interpretationHint": "Description matches suspect #${guiltyIndex !== 0 ? 0 : 1} (potential misdirection)",
          "relevance": "important",
          "pointsToSuspect": ${guiltyIndex !== 0 ? 0 : 1}
        }
      ]
    }
  }
}
\`\`\`

**VERIFY BEFORE RESPONDING:**
- Check that Korean and English have SAME number of evidence items
- Verify at least ${minCriticalEvidence} items have relevance: "critical"
- Confirm at least ${minCriticalEvidence} items have pointsToSuspect: ${guiltyIndex}
- Ensure ${fairPlayCompliant ? 'ALL items have discoveryHint, critical items have interpretationHint' : 'hints are present'}
- Check evidence types are distributed (not all same type)

Respond ONLY with JSON. No other explanation needed.`;
  }
}

/**
 * Factory function to create EvidenceGeneratorService
 */
export function createEvidenceGeneratorService(
  geminiClient: GeminiClient
): EvidenceGeneratorService {
  return new EvidenceGeneratorService(geminiClient);
}
