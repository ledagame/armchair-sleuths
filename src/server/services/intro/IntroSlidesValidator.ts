/**
 * IntroSlidesValidator.ts
 *
 * Minimal validator for intro slides - only checks required fields exist
 * No word count, no language restrictions, no content validation
 */

import type {
  IntroSlides,
  IntroSlidesValidationResult
} from '../../../shared/types';

/**
 * Validator for intro slides
 * MINIMAL VALIDATION: Only checks that required fields exist and are non-empty
 */
export class IntroSlidesValidator {

  /**
   * Validate complete intro slides
   * MINIMAL: Only checks required fields exist and are non-empty
   */
  validate(slides: IntroSlides): IntroSlidesValidationResult {
    const issues: string[] = [];

    // 1. Validate Slide 1 (Discovery) - required fields only
    const slide1Issues = this.validateSlide1(slides.discovery);
    issues.push(...slide1Issues);

    // 2. Validate Slide 2 (Suspects) - required fields only
    const slide2Issues = this.validateSlide2(slides.suspects);
    issues.push(...slide2Issues);

    // 3. Validate Slide 3 (Challenge) - required fields only
    const slide3Issues = this.validateSlide3(slides.challenge);
    issues.push(...slide3Issues);

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Validate Slide 1: Discovery
   * Only checks that required fields exist and are non-empty
   */
  private validateSlide1(discovery: IntroSlides['discovery']): string[] {
    const issues: string[] = [];

    if (!discovery.timeLocation || discovery.timeLocation.trim().length === 0) {
      issues.push('Slide 1: timeLocation is required');
    }

    if (!discovery.victimStatement || discovery.victimStatement.trim().length === 0) {
      issues.push('Slide 1: victimStatement is required');
    }

    if (!discovery.constraint || discovery.constraint.trim().length === 0) {
      issues.push('Slide 1: constraint is required');
    }

    return issues;
  }

  /**
   * Validate Slide 2: Suspects
   * Only checks that required fields exist and suspects array has items
   */
  private validateSlide2(suspects: IntroSlides['suspects']): string[] {
    const issues: string[] = [];

    if (!suspects.suspectCards || suspects.suspectCards.length === 0) {
      issues.push('Slide 2: suspectCards array is required and must not be empty');
    } else {
      // Validate each suspect has required fields
      suspects.suspectCards.forEach((card, index) => {
        const cardNum = index + 1;

        if (!card.name || card.name.trim().length === 0) {
          issues.push(`Slide 2 suspect ${cardNum}: name is required`);
        }

        if (!card.role || card.role.trim().length === 0) {
          issues.push(`Slide 2 suspect ${cardNum}: role is required`);
        }

        if (!card.claim || card.claim.trim().length === 0) {
          issues.push(`Slide 2 suspect ${cardNum}: claim is required`);
        }
      });
    }

    if (!suspects.constraintStatement || suspects.constraintStatement.trim().length === 0) {
      issues.push('Slide 2: constraintStatement is required');
    }

    if (!suspects.tensionLine || suspects.tensionLine.trim().length === 0) {
      issues.push('Slide 2: tensionLine is required');
    }

    return issues;
  }

  /**
   * Validate Slide 3: Challenge
   * Only checks that required fields exist and are non-empty
   */
  private validateSlide3(challenge: IntroSlides['challenge']): string[] {
    const issues: string[] = [];

    if (!challenge.statementLine1 || challenge.statementLine1.trim().length === 0) {
      issues.push('Slide 3: statementLine1 is required');
    }

    if (!challenge.statementLine2 || challenge.statementLine2.trim().length === 0) {
      issues.push('Slide 3: statementLine2 is required');
    }

    if (!challenge.statementLine3 || challenge.statementLine3.trim().length === 0) {
      issues.push('Slide 3: statementLine3 is required');
    }

    if (!challenge.question || challenge.question.trim().length === 0) {
      issues.push('Slide 3: question is required');
    }

    if (!challenge.cta || challenge.cta.trim().length === 0) {
      issues.push('Slide 3: cta is required');
    }

    return issues;
  }

  /**
   * Get default/fallback slides
   * Used when generation fails or validation fails too many times
   */
  getDefaultSlides(): IntroSlides {
    return {
      discovery: {
        timeLocation: '11:47 PM - Private Study',
        victimStatement: 'The victim found dead at their desk',
        constraint: 'The room was locked from inside'
      },
      suspects: {
        suspectCards: [
          {
            suspectId: 's1',
            name: 'Alex Morgan',
            role: 'Partner',
            claim: 'I was in the library',
            hasProfileImage: false
          },
          {
            suspectId: 's2',
            name: 'Blake Chen',
            role: 'Assistant',
            claim: 'I was making tea',
            hasProfileImage: false
          },
          {
            suspectId: 's3',
            name: 'Casey Taylor',
            role: 'Guest',
            claim: 'I retired early',
            hasProfileImage: false
          }
        ],
        constraintStatement: 'All three were in the house that evening',
        tensionLine: 'One of them is lying'
      },
      challenge: {
        statementLine1: 'Three suspects',
        statementLine2: 'One locked room',
        statementLine3: 'The truth awaits',
        question: 'Can you solve the mystery?',
        cta: 'BEGIN INVESTIGATION'
      }
    };
  }
}
