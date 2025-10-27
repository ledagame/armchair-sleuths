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
import { FewShotExampleGenerator } from './FewShotExampleGenerator';
import { EmotionalState, WORD_COUNT_RANGES } from './types';

interface Example {
  emotionalState: EmotionalState;
  isGuilty: boolean;
  question: string;
  response: string;
  characterName: string;
  archetype: string;
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

function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

const generator = new FewShotExampleGenerator();

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
  const states: EmotionalState[] = [
    EmotionalState.COOPERATIVE,
    EmotionalState.NERVOUS,
    EmotionalState.DEFENSIVE,
    EmotionalState.AGGRESSIVE
  ];

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
      emotionalState: state,
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
      emotionalState: state,
      isGuilty: true,
      question: guiltyQuestion,
      response: guiltyResponse,
      characterName,
      archetype
    });

    console.log();
  }

  // Generate FewShotExample objects using the generator
  console.log('Generating few-shot examples...');

  const fewShotExamples = generator.generateAllExamples(archetype, examples);

  // Generate markdown output
  const output = generator.formatAllAsMarkdown(fewShotExamples, characterName);

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
  console.log('3. Copy examples to archetype YAML file');
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
