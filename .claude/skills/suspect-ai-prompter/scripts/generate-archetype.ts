#!/usr/bin/env tsx

/**
 * Interactive Archetype Generator
 *
 * Creates new suspect archetype markdown files following the established pattern.
 * Prompts user for character details and generates complete archetype structure.
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

interface SpeechPattern {
  mindset: string;
  tone: string;
  examples: string[];
}

interface Archetype {
  name: string;
  definition: string;
  personality: string[];
  background: string[];
  coreValues: string[];
  greatestFears: string[];
  currentGoals: string[];
  vocabulary: {
    primary: string[];
    secondary: string[];
  };
  speechPatterns: {
    COOPERATIVE: SpeechPattern;
    NERVOUS: SpeechPattern;
    DEFENSIVE: SpeechPattern;
    AGGRESSIVE: SpeechPattern;
  };
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function splitByComma(input: string): string[] {
  return input.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

async function main() {
  console.log('='.repeat(60));
  console.log('Suspect Archetype Generator');
  console.log('='.repeat(60));
  console.log();
  console.log('This tool will guide you through creating a new suspect archetype.');
  console.log('Press Ctrl+C to cancel at any time.');
  console.log();

  const archetype: Partial<Archetype> = {};

  // Basic Information
  console.log('--- Basic Information ---');
  archetype.name = await question('Archetype name (e.g., "Suspicious Lawyer"): ');
  archetype.definition = await question('One-sentence definition: ');
  console.log();

  // Personality
  console.log('--- Personality Traits ---');
  console.log('Enter personality traits separated by commas');
  const personalityInput = await question('Traits: ');
  archetype.personality = splitByComma(personalityInput);
  console.log();

  // Background
  console.log('--- Background Elements ---');
  console.log('Enter background facts separated by commas');
  const backgroundInput = await question('Background: ');
  archetype.background = splitByComma(backgroundInput);
  console.log();

  // Core Values
  console.log('--- Core Values ---');
  console.log('Enter core values separated by commas');
  const valuesInput = await question('Values: ');
  archetype.coreValues = splitByComma(valuesInput);
  console.log();

  // Greatest Fears
  console.log('--- Greatest Fears ---');
  console.log('Enter greatest fears separated by commas');
  const fearsInput = await question('Fears: ');
  archetype.greatestFears = splitByComma(fearsInput);
  console.log();

  // Current Goals
  console.log('--- Current Goals ---');
  console.log('Enter current goals separated by commas');
  const goalsInput = await question('Goals: ');
  archetype.currentGoals = splitByComma(goalsInput);
  console.log();

  // Vocabulary
  console.log('--- Vocabulary ---');
  console.log('Enter primary vocabulary words (most characteristic) separated by commas');
  const primaryVocabInput = await question('Primary: ');
  console.log('Enter secondary vocabulary words separated by commas');
  const secondaryVocabInput = await question('Secondary: ');
  archetype.vocabulary = {
    primary: splitByComma(primaryVocabInput),
    secondary: splitByComma(secondaryVocabInput)
  };
  console.log();

  // Speech Patterns
  console.log('--- Speech Patterns ---');
  console.log('For each emotional state, provide mindset, tone, and example phrases');
  console.log();

  archetype.speechPatterns = {
    COOPERATIVE: await collectSpeechPattern('COOPERATIVE'),
    NERVOUS: await collectSpeechPattern('NERVOUS'),
    DEFENSIVE: await collectSpeechPattern('DEFENSIVE'),
    AGGRESSIVE: await collectSpeechPattern('AGGRESSIVE')
  };

  // Validate vocabulary uniqueness (Task 4.4)
  console.log();
  console.log('Validating vocabulary uniqueness...');

  const allVocabulary = [
    ...archetype.vocabulary!.primary,
    ...archetype.vocabulary!.secondary
  ];

  // Check for conflicts with existing archetypes
  const existingArchetypes = [
    { name: 'Wealthy Heir', vocab: ['attorney', 'lawyer', 'family name', 'reputation', 'position', 'standing', 'connections', 'influence', 'calendar', 'commitments', 'investments', 'estate', 'board of directors', 'assets', 'portfolio', 'trust fund'] },
    { name: 'Loyal Butler', vocab: ['sir/madam', 'duty', 'service', 'household', 'family', 'propriety', 'discretion', 'loyalty', 'tradition', 'decorum', 'protocol', 'establishment', 'residence', 'quarters', 'staff', 'domestics'] },
    { name: 'Talented Artist', vocab: ['feel', 'emotions', 'creative', 'art', 'soul', 'expression', 'vision', 'inspiration', 'canvas', 'muse', 'authentic', 'raw', 'passion', 'heart', 'spirit', 'essence'] },
    { name: 'Business Partner', vocab: ['deal', 'business', 'strategic', 'investment', 'profit', 'efficiency', 'contract', 'transaction', 'portfolio', 'assets', 'leverage', 'fiduciary', 'proprietary', 'merger', 'documentation', 'liability'] },
    { name: 'Former Police Officer', vocab: ['badge', 'procedure', 'rights', 'probable cause', 'investigation', 'tactics', 'evidence', 'protocol', 'precinct', 'warrant', 'chain of command', 'testimony', 'detective', 'officer', 'department', 'forensics'] }
  ];

  let maxConflictRate = 0;
  let worstConflict = '';

  for (const existing of existingArchetypes) {
    const existingVocabSet = new Set(existing.vocab.map(w => w.toLowerCase()));
    const newVocabSet = new Set(allVocabulary.map(w => w.toLowerCase()));

    // Find common words
    const commonWords: string[] = [];
    for (const word of newVocabSet) {
      if (existingVocabSet.has(word)) {
        commonWords.push(word);
      }
    }

    // Calculate conflict rate
    const totalUniqueWords = new Set([...newVocabSet, ...existingVocabSet]).size;
    const conflictRate = totalUniqueWords > 0 ? commonWords.length / totalUniqueWords : 0;

    if (conflictRate > maxConflictRate) {
      maxConflictRate = conflictRate;
      worstConflict = existing.name;
    }

    if (commonWords.length > 0) {
      console.log(`  Conflict with ${existing.name}: ${(conflictRate * 100).toFixed(1)}% (${commonWords.length} common words)`);
    }
  }

  // Requirement 4.7: Warn if conflict rate > 50%
  if (maxConflictRate > 0.5) {
    console.log();
    console.log('⚠️  WARNING: High vocabulary conflict detected!');
    console.log(`   Conflict rate with ${worstConflict}: ${(maxConflictRate * 100).toFixed(1)}%`);
    console.log('   Consider using more unique vocabulary to differentiate this archetype.');
    console.log();
  } else {
    console.log();
    console.log(`✓ Vocabulary uniqueness validated (max conflict: ${(maxConflictRate * 100).toFixed(1)}%)`);
  }

  // Generate file
  console.log();
  console.log('Generating archetype file...');

  const content = generateMarkdownContent(archetype as Archetype);
  const filename = archetype.name!.toLowerCase().replace(/\s+/g, '-');
  const filepath = path.join(__dirname, '..', 'references', 'archetypes', `${filename}.md`);

  fs.writeFileSync(filepath, content, 'utf8');

  console.log();
  console.log(`✓ Archetype file created: ${filepath}`);
  console.log();
  console.log('Next steps:');
  console.log('1. Review and enhance the generated file');
  console.log('2. Add 8 few-shot dialogue examples (2 per state × guilty/innocent)');
  console.log('3. Run validate-quality.ts to check consistency');
  console.log();

  rl.close();
}

async function collectSpeechPattern(stateName: string): Promise<SpeechPattern> {
  console.log(`\n${stateName} State:`);

  const mindset = await question(`  Mindset: `);
  const tone = await question(`  Tone: `);

  console.log('  Enter 3-4 example phrases (one per line, press Enter twice when done):');
  const examples: string[] = [];

  while (true) {
    const example = await question('  > ');
    if (example.trim() === '') break;
    examples.push(example);
  }

  return { mindset, tone, examples };
}

function generateMarkdownContent(archetype: Archetype): string {
  return `# ${archetype.name} Archetype

## Core Character Profile

**Archetype Definition:**
${archetype.definition}

**Personality Traits:**
${archetype.personality.map(t => `- ${t}`).join('\n')}

**Background:**
${archetype.background.map(b => `- ${b}`).join('\n')}

**Core Values:**
${archetype.coreValues.map(v => `- ${v}`).join('\n')}

**Greatest Fears:**
${archetype.greatestFears.map(f => `- ${f}`).join('\n')}

**Current Goals:**
${archetype.currentGoals.map(g => `- ${g}`).join('\n')}

## Archetype-Specific Speech Patterns by Emotional State

### COOPERATIVE State (Suspicion 0-25)

**Mindset:** ${archetype.speechPatterns.COOPERATIVE.mindset}

**Speech Patterns:**
${archetype.speechPatterns.COOPERATIVE.examples.map((e, i) => `${i + 1}. "${e}"`).join('\n')}

**Vocabulary Emphasis:**
${archetype.vocabulary.primary.slice(0, 5).join(', ')}

**Tone:** ${archetype.speechPatterns.COOPERATIVE.tone}

### NERVOUS State (Suspicion 26-50)

**Mindset:** ${archetype.speechPatterns.NERVOUS.mindset}

**Speech Patterns:**
${archetype.speechPatterns.NERVOUS.examples.map((e, i) => `${i + 1}. "${e}"`).join('\n')}

**Vocabulary Emphasis:**
${archetype.vocabulary.primary.slice(5, 10).join(', ')}

**Tone:** ${archetype.speechPatterns.NERVOUS.tone}

### DEFENSIVE State (Suspicion 51-75)

**Mindset:** ${archetype.speechPatterns.DEFENSIVE.mindset}

**Speech Patterns:**
${archetype.speechPatterns.DEFENSIVE.examples.map((e, i) => `${i + 1}. "${e}"`).join('\n')}

**Vocabulary Emphasis:**
${archetype.vocabulary.secondary.slice(0, 5).join(', ')}

**Tone:** ${archetype.speechPatterns.DEFENSIVE.tone}

### AGGRESSIVE State (Suspicion 76-100)

**Mindset:** ${archetype.speechPatterns.AGGRESSIVE.mindset}

**Speech Patterns:**
${archetype.speechPatterns.AGGRESSIVE.examples.map((e, i) => `${i + 1}. "${e}"`).join('\n')}

**Vocabulary Emphasis:**
${archetype.vocabulary.secondary.slice(5, 10).join(', ')}

**Tone:** ${archetype.speechPatterns.AGGRESSIVE.tone}

## Archetype-Specific Vocabulary List

**Primary Vocabulary:**
${archetype.vocabulary.primary.map(w => `- ${w}`).join('\n')}

**Secondary Vocabulary:**
${archetype.vocabulary.secondary.map(w => `- ${w}`).join('\n')}

## Few-Shot Dialogue Examples

### Example 1: COOPERATIVE - INNOCENT - Opening Question

**Detective:** "Tell me about your relationship with the victim."

**[Character Name] (${archetype.name}):** "[Response to be added]"

**[Analysis]**
- Character consistency: [To be added]
- Emotional alignment: [To be added]
- Innocent behavior: [To be added]
- Natural English: [To be added]
- Word count: [To be added]

### Example 2: COOPERATIVE - GUILTY - Opening Question

**Detective:** "Tell me about your relationship with the victim."

**[Character Name] (${archetype.name}):** "[Response to be added]"

**[Analysis]**
- Character consistency: [To be added]
- Emotional alignment: [To be added]
- Guilty behavior: [To be added]
- Natural English: [To be added]
- Word count: [To be added]

### Example 3: NERVOUS - INNOCENT - Evidence Question

**Detective:** "We found evidence that contradicts your statement."

**[Character Name] (${archetype.name}):** "[Response to be added]"

**[Analysis]**
- Character consistency: [To be added]
- Emotional alignment: [To be added]
- Innocent behavior: [To be added]
- Natural English: [To be added]
- Word count: [To be added]

### Example 4: NERVOUS - GUILTY - Evidence Question

**Detective:** "We found evidence that contradicts your statement."

**[Character Name] (${archetype.name}):** "[Response to be added]"

**[Analysis]**
- Character consistency: [To be added]
- Emotional alignment: [To be added]
- Guilty behavior: [To be added]
- Natural English: [To be added]
- Word count: [To be added]

### Example 5: DEFENSIVE - INNOCENT - Accusation

**Detective:** "Multiple witnesses say you had motive."

**[Character Name] (${archetype.name}):** "[Response to be added]"

**[Analysis]**
- Character consistency: [To be added]
- Emotional alignment: [To be added]
- Innocent behavior: [To be added]
- Natural English: [To be added]
- Word count: [To be added]

### Example 6: DEFENSIVE - GUILTY - Accusation

**Detective:** "Multiple witnesses say you had motive."

**[Character Name] (${archetype.name}):** "[Response to be added]"

**[Analysis]**
- Character consistency: [To be added]
- Emotional alignment: [To be added]
- Guilty behavior: [To be added]
- Natural English: [To be added]
- Word count: [To be added]

### Example 7: AGGRESSIVE - INNOCENT - Final Confrontation

**Detective:** "All evidence points to you. Why shouldn't we charge you?"

**[Character Name] (${archetype.name}):** "[Response to be added]"

**[Analysis]**
- Character consistency: [To be added]
- Emotional alignment: [To be added]
- Innocent behavior: [To be added]
- Natural English: [To be added]
- Word count: [To be added]

### Example 8: AGGRESSIVE - GUILTY - Final Confrontation

**Detective:** "All evidence points to you. Why shouldn't we charge you?"

**[Character Name] (${archetype.name}):** "[Response to be added]"

**[Analysis]**
- Character consistency: [To be added]
- Emotional alignment: [To be added]
- Guilty behavior: [To be added]
- Natural English: [To be added]
- Word count: [To be added]

## Emotional Progression Notes

**Transition Triggers:**
- COOPERATIVE → NERVOUS: [To be added]
- NERVOUS → DEFENSIVE: [To be added]
- DEFENSIVE → AGGRESSIVE: [To be added]

**Escalation Patterns:**
- [To be added]
- [To be added]
- [To be added]

## Guilty vs. Innocent Behavior Differences

**When INNOCENT:**
- [To be added]
- [To be added]
- [To be added]

**When GUILTY:**
- [To be added]
- [To be added]
- [To be added]

**Key Behavioral Tells:**
- Innocent: [Example]
- Guilty: [Example]

## Character Consistency Checklist

When generating ${archetype.name} responses, verify:
- [ ] Uses archetype-specific vocabulary naturally
- [ ] Matches personality traits described above
- [ ] Reflects core values in decision-making
- [ ] Addresses greatest fears when under pressure
- [ ] Maintains consistent speech patterns across states
- [ ] Transitions between emotional states logically
- [ ] Differentiates clearly between guilty and innocent behavior
- [ ] Uses natural English conversation style
`;
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
