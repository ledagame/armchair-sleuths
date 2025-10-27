/**
 * FewShotExampleGenerator
 * 
 * Generates and formats few-shot dialogue examples for suspect archetypes.
 * Creates 8 examples per archetype (4 emotional states × 2 guilt statuses).
 */

import { 
  FewShotExample, 
  EmotionalState, 
  Analysis,
  WORD_COUNT_RANGES 
} from './types';

export class FewShotExampleGenerator {
  /**
   * Generates a single few-shot example
   * 
   * @param archetype - Archetype name (e.g., "Wealthy Heir")
   * @param emotionalState - Emotional state for this example
   * @param isGuilty - Whether suspect is guilty
   * @param question - Detective's question
   * @param response - Suspect's response
   * @param characterName - Character name for display (optional)
   * @returns Complete FewShotExample object
   */
  generateExample(
    archetype: string,
    emotionalState: EmotionalState,
    isGuilty: boolean,
    question: string,
    response: string,
    characterName?: string
  ): FewShotExample {
    const wordCount = this.countWords(response);
    const targetRange = WORD_COUNT_RANGES[emotionalState];
    
    const id = this.generateId(archetype, emotionalState, isGuilty);
    
    return {
      id,
      archetype,
      emotionalState,
      isGuilty,
      question,
      response,
      analysis: this.generateAnalysis(
        response,
        archetype,
        emotionalState,
        isGuilty,
        wordCount,
        targetRange
      )
    };
  }

  /**
   * Generates all 8 examples for an archetype
   * 
   * @param archetype - Archetype name
   * @param examples - Array of example data (question, response, characterName)
   * @returns Array of 8 FewShotExample objects
   */
  generateAllExamples(
    archetype: string,
    examples: Array<{
      emotionalState: EmotionalState;
      isGuilty: boolean;
      question: string;
      response: string;
      characterName?: string;
    }>
  ): FewShotExample[] {
    if (examples.length !== 8) {
      throw new Error(`Expected 8 examples, got ${examples.length}`);
    }

    return examples.map(ex => 
      this.generateExample(
        archetype,
        ex.emotionalState,
        ex.isGuilty,
        ex.question,
        ex.response,
        ex.characterName
      )
    );
  }

  /**
   * Formats a single example as markdown
   * 
   * @param example - FewShotExample to format
   * @param characterName - Optional character name for display
   * @returns Markdown-formatted string
   */
  formatAsMarkdown(example: FewShotExample, characterName?: string): string {
    const status = example.isGuilty ? 'GUILTY' : 'INNOCENT';
    const displayName = characterName || '[Character Name]';
    const { analysis } = example;
    
    const inRangeSymbol = this.isWordCountInRange(
      analysis.wordCount,
      analysis.targetRange
    ) ? '✓' : '⚠️';

    return `### Example ${example.id}: ${example.emotionalState} - ${status}

**Detective:** "${example.question}"

**${displayName} (${example.archetype}):** "${example.response}"

**[Analysis]**
- Character consistency: ${analysis.characterConsistency}
- Emotional alignment: ${analysis.emotionalAlignment}
- Information content: ${analysis.informationContent}
- Natural dialogue: ${analysis.naturalDialogue}
- Word count: ${analysis.wordCount} words (target: ${analysis.targetRange[0]}-${analysis.targetRange[1]}) ${inRangeSymbol}

`;
  }

  /**
   * Formats all examples as markdown
   * 
   * @param examples - Array of FewShotExample objects
   * @param characterName - Optional character name for display
   * @returns Complete markdown document
   */
  formatAllAsMarkdown(examples: FewShotExample[], characterName?: string): string {
    let markdown = `## Few-Shot Dialogue Examples\n\n`;
    markdown += `Total examples: ${examples.length}\n\n`;
    
    examples.forEach((example, idx) => {
      markdown += this.formatAsMarkdown(example, characterName);
      if (idx < examples.length - 1) {
        markdown += '\n';
      }
    });

    return markdown;
  }

  /**
   * Counts words in a text string
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  /**
   * Generates a unique ID for an example
   */
  private generateId(
    archetype: string,
    emotionalState: EmotionalState,
    isGuilty: boolean
  ): string {
    const archetypeSlug = archetype.toLowerCase().replace(/\s+/g, '-');
    const status = isGuilty ? 'guilty' : 'innocent';
    return `${archetypeSlug}-${emotionalState.toLowerCase()}-${status}`;
  }

  /**
   * Checks if word count is within target range
   */
  private isWordCountInRange(
    wordCount: number,
    targetRange: [number, number]
  ): boolean {
    return wordCount >= targetRange[0] && wordCount <= targetRange[1];
  }

  /**
   * Generates analysis for an example
   * 
   * Note: This generates placeholder analysis. Real analysis should be
   * written manually by reviewing the response quality.
   */
  private generateAnalysis(
    response: string,
    archetype: string,
    emotionalState: EmotionalState,
    isGuilty: boolean,
    wordCount: number,
    targetRange: [number, number]
  ): Analysis {
    const status = isGuilty ? 'guilty' : 'innocent';
    
    return {
      characterConsistency: `[To be added - describe how response matches ${archetype} vocabulary and style]`,
      emotionalAlignment: `${emotionalState} tone - [describe emotional markers, word count: ${wordCount} words, target: ${targetRange[0]}-${targetRange[1]}]`,
      informationContent: `${status.toUpperCase()} behavior - [describe strategic information patterns]`,
      naturalDialogue: `[To be added - note contractions, idioms, natural phrasing]`,
      wordCount,
      targetRange
    };
  }
}
