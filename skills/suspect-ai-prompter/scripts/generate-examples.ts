#!/usr/bin/env tsx

/**
 * Few-Shot Example Generator
 *
 * Generates dialogue examples for suspect archetypes across
 * all emotional states and guilt statuses.
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

interface Example {
  state: EmotionalState;
  isGuilty: boolean;
  question: string;
  response: string;
  characterName: string;
  archetype: string;
}

type EmotionalState = 'COOPERATIVE' | 'NERVOUS' | 'DEFENSIVE' | 'AGGRESSIVE';

const WORD_COUNT_RANGES = {
  COOPERATIVE: [40, 80],
  NERVOUS: [30, 60],
  DEFENSIVE: [15, 40],
  AGGRESSIVE: [10, 30]
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

function formatExample(example: Example): string {
  const wordCount = countWords(example.response);
  const [minWords, maxWords] = WORD_COUNT_RANGES[example.state];
  const status = example.isGuilty ? 'GUILTY' : 'INNOCENT';

  return `### Example: ${example.state} - ${status} - Question Type

**Detective:** "${example.question}"

**${example.characterName} (${example.archetype}):** "${example.response}"

**[Analysis]**
- Character consistency: [To be added - describe how response matches archetype]
- Emotional alignment: ${example.state} - [describe tone, word count: ${wordCount} words, target: ${minWords}-${maxWords}]
- ${status === 'GUILTY' ? 'Guilty' : 'Innocent'} behavior: [To be added - describe strategic behavior]
- Natural English: [To be added - note idioms, class markers, natural phrasing]
- Word count: ${wordCount} words

`;
}

async function generateExamples() {
  console.log('='.repeat(60));
  console.log('Few-Shot Example Generator');
  console.log('='.repeat(60));
  console.log();

  const archetype = await question('Archetype name (e.g., "Wealthy Heir"): ');
  const characterName = await question('Character name for examples (e.g., "Marcus Chen"): ');

  console.log();
  console.log('Generating examples for all emotional states...');
  console.log();

  const examples: Example[] = [];
  const states: EmotionalState[] = ['COOPERATIVE', 'NERVOUS', 'DEFENSIVE', 'AGGRESSIVE'];

  for (const state of states) {
    console.log(`--- ${state} State ---`);
    const [minWords, maxWords] = WORD_COUNT_RANGES[state];
    console.log(`Target word count: ${minWords}-${maxWords} words`);
    console.log();

    // Innocent example
    console.log('INNOCENT version:');
    const innocentQuestion = await question('  Detective question: ');
    console.log(`  ${characterName}'s response (${minWords}-${maxWords} words):`);
    const innocentResponse = await question('  > ');

    const innocentWordCount = countWords(innocentResponse);
    if (innocentWordCount < minWords || innocentWordCount > maxWords) {
      console.log(`  ⚠️  Warning: ${innocentWordCount} words (target: ${minWords}-${maxWords})`);
    } else {
      console.log(`  ✓ ${innocentWordCount} words`);
    }

    examples.push({
      state,
      isGuilty: false,
      question: innocentQuestion,
      response: innocentResponse,
      characterName,
      archetype
    });

    console.log();

    // Guilty example
    console.log('GUILTY version:');
    const guiltyQuestion = await question('  Detective question: ');
    console.log(`  ${characterName}'s response (${minWords}-${maxWords} words):`);
    const guiltyResponse = await question('  > ');

    const guiltyWordCount = countWords(guiltyResponse);
    if (guiltyWordCount < minWords || guiltyWordCount > maxWords) {
      console.log(`  ⚠️  Warning: ${guiltyWordCount} words (target: ${minWords}-${maxWords})`);
    } else {
      console.log(`  ✓ ${guiltyWordCount} words`);
    }

    examples.push({
      state,
      isGuilty: true,
      question: guiltyQuestion,
      response: guiltyResponse,
      characterName,
      archetype
    });

    console.log();
  }

  // Generate output
  console.log('Generating markdown output...');

  let output = `## Few-Shot Dialogue Examples\n\n`;

  examples.forEach((example, idx) => {
    output += formatExample(example);
    if (idx < examples.length - 1) {
      output += '\n';
    }
  });

  // Save to file
  const filename = `${archetype.toLowerCase().replace(/\s+/g, '-')}-examples.md`;
  const filepath = path.join(process.cwd(), filename);

  fs.writeFileSync(filepath, output, 'utf8');

  console.log();
  console.log(`✓ Examples saved to: ${filepath}`);
  console.log();
  console.log('Next steps:');
  console.log('1. Review examples for character consistency');
  console.log('2. Fill in [Analysis] sections with specific details');
  console.log('3. Copy examples to archetype markdown file');
  console.log('4. Validate with validate-quality.ts');
  console.log();

  rl.close();
}

async function main() {
  await generateExamples();
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
