/**
 * LocationGeneratorService.ts
 *
 * AI-powered location exploration content generator
 * Creates multilingual exploration areas with clues
 */

import type { GeminiClient } from '../gemini/GeminiClient';
import type {
  MultilingualLocation,
  MultilingualWeapon,
  MultilingualMotive
} from '../../../shared/types/i18n';
import type {
  LocationExploration,
  GenerateLocationExplorationOptions
} from '../../../shared/types/Location';

/**
 * LocationGeneratorService
 *
 * Generates detailed location exploration content
 * CRITICAL: Creates same areas and clues in both Korean and English
 */
export class LocationGeneratorService {
  constructor(private geminiClient: GeminiClient) {}

  /**
   * Generate multilingual location exploration content
   *
   * @param location - The location to generate content for
   * @param weapon - Weapon used in the crime (for relevant clues)
   * @param motive - Motive for the crime (for contextual clues)
   * @param guiltyIndex - Index of the guilty suspect (0, 1, or 2)
   * @param caseId - Case ID for tracking
   * @param options - Generation options
   */
  async generateLocationExploration(
    location: MultilingualLocation,
    weapon: MultilingualWeapon,
    motive: MultilingualMotive,
    guiltyIndex: number,
    caseId: string,
    options: GenerateLocationExplorationOptions = {}
  ): Promise<LocationExploration> {
    const {
      includeRedHerrings = true,
      clueDistribution = 'distributed',
      difficulty = 'medium'
    } = options;

    console.log(`🔍 Generating location exploration for ${location.id}...`);
    console.log(`   Case ID: ${caseId}`);
    console.log(`   Guilty suspect index: ${guiltyIndex}`);

    // Build AI prompt for location exploration
    const prompt = this.buildLocationExplorationPrompt(
      location,
      weapon,
      motive,
      guiltyIndex,
      {
        includeRedHerrings,
        clueDistribution,
        difficulty
      }
    );

    // Generate content via Gemini AI
    const response = await this.geminiClient.generateText(prompt, {
      temperature: 0.8,
      maxTokens: 6144  // More tokens for detailed location content
    });

    // Parse JSON response
    const parsed = this.geminiClient.parseJsonResponse(response.text);

    // Calculate metadata
    const koAreas = parsed.translations.ko.areas;
    const totalAreas = koAreas.length;
    const totalClues = koAreas.reduce(
      (sum: number, area: any) => sum + area.clues.length,
      0
    );
    const criticalClueCount = koAreas.reduce(
      (sum: number, area: any) =>
        sum + area.clues.filter((clue: string) =>
          clue.toLowerCase().includes('critical') ||
          clue.toLowerCase().includes('중요')
        ).length,
      0
    );

    // Construct LocationExploration object
    const locationExploration: LocationExploration = {
      locationId: location.id,
      caseId: caseId,
      translations: parsed.translations,
      metadata: {
        totalAreas,
        totalClues,
        criticalClueCount
      },
      generatedAt: Date.now()
    };

    console.log(`✅ Location exploration generated:`);
    console.log(`   Areas: ${totalAreas}`);
    console.log(`   Total clues: ${totalClues}`);
    console.log(`   Critical clues: ${criticalClueCount}`);

    return locationExploration;
  }

  /**
   * Build AI prompt for location exploration generation
   *
   * CRITICAL: Generate Korean and English simultaneously
   * to ensure same areas and clues in both languages
   */
  private buildLocationExplorationPrompt(
    location: MultilingualLocation,
    weapon: MultilingualWeapon,
    motive: MultilingualMotive,
    guiltyIndex: number,
    options: GenerateLocationExplorationOptions
  ): string {
    const { includeRedHerrings, clueDistribution, difficulty } = options;

    return `You are a detective game location designer. Create detailed exploration content for a crime scene location in BOTH Korean AND English simultaneously.

**CRITICAL REQUIREMENT: SAME STRUCTURE IN BOTH LANGUAGES**
- The SAME exploration areas in both languages (same count, same order)
- The SAME number of clues in each corresponding area
- The SAME clue meanings, just translated
- Only the language presentation differs

**Location Information:**
- Location: ${location.translations.ko.name} / ${location.translations.en.name}
- Description: ${location.translations.ko.description} / ${location.translations.en.description}
- Weapon used: ${weapon.translations.ko.name} / ${weapon.translations.en.name}
- Motive: ${motive.translations.ko.name} / ${motive.translations.en.name}
- Guilty suspect: Suspect #${guiltyIndex + 1}

**Generation Rules:**
1. **Create 3-5 exploration areas** for the location
   - Each area should be a distinct part of the location
   - Areas should be logically connected to the location theme
   - Example for "Study": bookshelf, desk, safe, window, secret passage

2. **Place 1-3 clues per area** (total 8-12 clues across all areas)
   - At least 3 clues must be CRITICAL (directly point to guilty suspect)
   - ${includeRedHerrings ? '2-3 clues should be red herrings (misleading)' : 'All clues should be relevant'}
   - ${clueDistribution === 'concentrated' ? 'Concentrate important clues in 1-2 areas' : 'Distribute clues evenly across areas'}
   - Clues should reference the weapon, motive, or suspect actions

3. **Atmosphere and descriptions**
   - Initial description: First impression when entering
   - Detailed description: What players discover upon closer examination
   - Atmosphere: Overall mood and feeling of the location

4. **Difficulty: ${difficulty}**
   - Easy: Obvious clues, direct connections
   - Medium: Some inference required, mixed obvious/subtle clues
   - Hard: Subtle clues, multiple interpretations, requires careful analysis

**IMPORTANT**:
- Make clues discoverable but not immediately obvious
- Critical clues should point to suspect #${guiltyIndex + 1}
- Include physical evidence related to ${weapon.translations.en.name}
- Some clues should connect to the ${motive.translations.en.name} motive

**Response Format (JSON):**
\`\`\`json
{
  "translations": {
    "ko": {
      "atmosphere": "긴장감 넘치는 고요한 분위기",
      "initialDescription": "첫 인상 설명...",
      "detailedDescription": "자세히 살펴본 설명...",
      "areas": [
        {
          "id": "area-1",
          "name": "책장",
          "description": "높은 책장에는 오래된 책들이 가득하다",
          "clues": [
            "책장 뒤편에서 발견된 피묻은 천 조각",
            "특정 책의 페이지가 찢어져 있음"
          ],
          "interactable": true
        },
        {
          "id": "area-2",
          "name": "책상",
          "description": "무거운 나무 책상 위에 서류들이 흩어져 있다",
          "clues": [
            "서랍에서 발견된 협박 편지",
            "책상 모서리에 묻은 혈흔",
            "최근 작성된 유언장 초안"
          ],
          "interactable": true
        },
        {
          "id": "area-3",
          "name": "금고",
          "description": "벽에 숨겨진 금고가 반쯤 열려있다",
          "clues": [
            "금고 안에 비어있는 권총 케이스",
            "현금이 사라진 흔적"
          ],
          "interactable": true
        }
      ]
    },
    "en": {
      "atmosphere": "Tense and eerily quiet atmosphere",
      "initialDescription": "First impression description...",
      "detailedDescription": "Detailed examination description...",
      "areas": [
        {
          "id": "area-1",
          "name": "Bookshelf",
          "description": "A tall bookshelf filled with old books",
          "clues": [
            "Blood-stained cloth piece found behind the bookshelf",
            "Pages torn from a specific book"
          ],
          "interactable": true
        },
        {
          "id": "area-2",
          "name": "Desk",
          "description": "Papers scattered on a heavy wooden desk",
          "clues": [
            "Threatening letter found in drawer",
            "Bloodstain on desk corner",
            "Recently drafted will"
          ],
          "interactable": true
        },
        {
          "id": "area-3",
          "name": "Safe",
          "description": "A hidden wall safe, half-open",
          "clues": [
            "Empty gun case inside the safe",
            "Evidence of missing cash"
          ],
          "interactable": true
        }
      ]
    }
  }
}
\`\`\`

**VERIFY BEFORE RESPONDING:**
- Check that Korean and English have the SAME number of areas
- Check that each corresponding area has the SAME number of clues
- Ensure at least 3 clues are critical (point to guilty suspect #${guiltyIndex + 1})
- Verify clues reference ${weapon.translations.en.name} and ${motive.translations.en.name}

Respond ONLY with JSON. No other explanation needed.`;
  }
}

/**
 * Factory function to create LocationGeneratorService
 */
export function createLocationGeneratorService(
  geminiClient: GeminiClient
): LocationGeneratorService {
  return new LocationGeneratorService(geminiClient);
}
