/**
 * IntroSlidesGenerator.ts
 *
 * Generates 3-slide intro content using Gemini API
 * Follows murder-mystery-intro skill patterns
 */

import type {
  IntroSlides,
  Slide1Discovery,
  Slide2Suspects,
  Slide3Challenge,
  SuspectCard
} from '../../../shared/types';
import type { GeminiClient } from '../gemini/GeminiClient';
import { IntroPromptBuilder } from './IntroPromptBuilder';
import { IntroSlidesTemplateBuilder } from './IntroSlidesTemplateBuilder';

interface CaseData {
  victim: { name: string; background: string };
  suspects: Array<{ id: string; name: string; archetype: string }>;
  weapon: { name: string };
  location: { name: string };
}

/**
 * Service for generating intro slides content
 * TEMPLATE-FIRST approach: Always succeeds with template, optionally enhances with AI
 * NO VALIDATION: Generation always succeeds
 */
export class IntroSlidesGenerator {
  private readonly promptBuilder: IntroPromptBuilder;
  private readonly templateBuilder: IntroSlidesTemplateBuilder;

  constructor(private geminiClient: GeminiClient) {
    this.promptBuilder = new IntroPromptBuilder();
    this.templateBuilder = new IntroSlidesTemplateBuilder();
  }

  /**
   * Generate complete 3-slide intro
   * TEMPLATE-FIRST: Always generates from template (100% success), optionally enhances with AI
   * NO VALIDATION: Generation always succeeds
   */
  async generateSlides(caseData: CaseData): Promise<IntroSlides> {
    console.log(`[IntroSlidesGenerator] 🎨 Generating slides using template-first approach...`);

    // 1. Generate template slides immediately (instant success, no validation)
    const templateSlides = this.templateBuilder.build(caseData);
    console.log(`[IntroSlidesGenerator] ✅ Template slides generated successfully`);

    // 2. Try AI enhancement (optional, fast timeout, single attempt)
    // If AI fails, we still have working template slides
    try {
      const aiSlides = await Promise.race([
        this.tryAIEnhancement(caseData),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('AI enhancement timeout')), 5000)
        )
      ]);

      if (aiSlides) {
        console.log(`[IntroSlidesGenerator] ✨ AI enhancement successful, using enhanced slides`);
        return aiSlides;
      }
    } catch (error) {
      console.log(`[IntroSlidesGenerator] ℹ️ AI enhancement skipped/failed, using template (this is OK)`);
    }

    // 3. Return template slides (always works, no validation)
    return templateSlides;
  }

  /**
   * Try to enhance slides with AI (optional, single attempt, fast)
   * NO VALIDATION: Returns AI slides or null, no validation checks
   */
  private async tryAIEnhancement(caseData: CaseData): Promise<IntroSlides | null> {
    try {
      console.log(`[IntroSlidesGenerator] 🤖 Attempting AI enhancement...`);

      // Generate all 3 slides in parallel
      const [slide1, slide2, slide3] = await Promise.all([
        this.generateSlide1(caseData, 1),
        this.generateSlide2(caseData, 1),
        this.generateSlide3(caseData, 1)
      ]);

      const slides: IntroSlides = {
        discovery: slide1,
        suspects: slide2,
        challenge: slide3
      };

      // Return AI slides without validation
      console.log(`[IntroSlidesGenerator] ✅ AI enhancement completed`);
      return slides;
    } catch (error) {
      console.log(`[IntroSlidesGenerator] ℹ️ AI enhancement error:`, error);
      return null;
    }
  }

  /**
   * Generate Slide 1: Discovery
   */
  private async generateSlide1(
    caseData: CaseData,
    attempt: number
  ): Promise<Slide1Discovery> {
    const prompt = this.promptBuilder.buildSlide1Prompt(caseData);

    // Increase temperature slightly on retries
    const temperature = 0.7 + (attempt - 1) * 0.05;

    const response = await this.geminiClient.generateText(prompt, {
      temperature,
      maxTokens: 128
    });

    return this.geminiClient.parseJsonResponse<Slide1Discovery>(response.text);
  }

  /**
   * Generate Slide 2: Suspects
   */
  private async generateSlide2(
    caseData: CaseData,
    attempt: number
  ): Promise<Slide2Suspects> {
    const prompt = this.promptBuilder.buildSlide2Prompt(caseData);

    // Lower temperature for structured data
    const temperature = 0.6 + (attempt - 1) * 0.05;

    const response = await this.geminiClient.generateText(prompt, {
      temperature,
      maxTokens: 256
    });

    const rawSlide2 = this.geminiClient.parseJsonResponse<Slide2Suspects>(response.text);

    // Ensure suspectId matches caseData (critical for image loading)
    const correctedSuspectCards = rawSlide2.suspectCards.map((card, index) => {
      return {
        ...card,
        suspectId: caseData.suspects[index]?.id || card.suspectId,
        hasProfileImage: true  // We generate profile images for all suspects
      };
    });

    return {
      ...rawSlide2,
      suspectCards: correctedSuspectCards
    };
  }

  /**
   * Generate Slide 3: Challenge
   */
  private async generateSlide3(
    caseData: CaseData,
    attempt: number
  ): Promise<Slide3Challenge> {
    const prompt = this.promptBuilder.buildSlide3Prompt(caseData);

    // Higher temperature for creative hook
    const temperature = 0.8 + (attempt - 1) * 0.05;

    const response = await this.geminiClient.generateText(prompt, {
      temperature,
      maxTokens: 96
    });

    return this.geminiClient.parseJsonResponse<Slide3Challenge>(response.text);
  }

  /**
   * Generate fallback slides when all attempts fail
   * Uses case data to create minimal valid slides
   */
  private generateFallbackSlides(caseData: CaseData): IntroSlides {
    console.log('[IntroSlidesGenerator] Generating fallback slides with case data...');

    const suspectCards: SuspectCard[] = caseData.suspects.map((suspect) => ({
      suspectId: suspect.id,
      name: suspect.name,
      role: 'Suspect',  // Generic role
      claim: 'I was elsewhere',  // Generic claim
      hasProfileImage: true
    }));

    return {
      discovery: {
        timeLocation: '11:47 PM - Crime Scene',
        victimStatement: `${caseData.victim.name} found dead`,
        constraint: 'Investigation underway'
      },
      suspects: {
        suspectCards,
        constraintStatement: `All ${suspectCards.length} were present`,
        tensionLine: 'One of them knows the truth'
      },
      challenge: {
        statementLine1: `${suspectCards.length} suspects`,
        statementLine2: 'One victim',
        statementLine3: 'Time to investigate',
        question: `Who killed ${caseData.victim.name}?`,
        cta: 'START INVESTIGATION'
      }
    };
  }
}
