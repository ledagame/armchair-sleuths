#!/usr/bin/env tsx

/**
 * Quality Validator
 *
 * Scores suspect responses against the 4-dimension quality framework:
 * - Character Consistency
 * - Emotional Alignment
 * - Information Content
 * - Natural Dialogue
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

interface QualityScores {
  characterConsistency: number;
  emotionalAlignment: number;
  informationContent: number;
  naturalDialogue: number;
  overall: number;
}

interface ValidationResult {
  passed: boolean;
  scores: QualityScores;
  feedback: string[];
  rating: string;
}

type EmotionalState = 'COOPERATIVE' | 'NERVOUS' | 'DEFENSIVE' | 'AGGRESSIVE';

const WORD_COUNT_RANGES = {
  COOPERATIVE: [40, 80],
  NERVOUS: [30, 60],
  DEFENSIVE: [15, 40],
  AGGRESSIVE: [10, 30]
};

const QUALITY_THRESHOLDS = {
  characterConsistency: 60,
  emotionalAlignment: 60,
  informationContent: 50,
  naturalDialogue: 60,
  overall: 65
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

function scoreCharacterConsistency(
  response: string,
  archetype: string,
  expectedVocabulary: string[]
): number {
  let score = 70; // Base score

  // Check for archetype-specific vocabulary
  const responseLower = response.toLowerCase();
  const vocabMatches = expectedVocabulary.filter(word =>
    responseLower.includes(word.toLowerCase())
  ).length;

  const vocabScore = Math.min(30, (vocabMatches / expectedVocabulary.length) * 100);
  score += vocabScore * 0.3;

  // Penalty for wrong archetype markers
  const archetypeMarkers: Record<string, string[]> = {
    'Wealthy Heir': ['attorney', 'position', 'reputation', 'connections'],
    'Loyal Butler': ['sir', 'madam', 'discretion', 'propriety', 'duty'],
    'Talented Artist': ['passion', 'creative', 'soul', 'inspiration'],
    'Business Partner': ['contract', 'transaction', 'documentation'],
    'Former Police Officer': ['evidence', 'procedure', 'protocol']
  };

  // Check for markers from other archetypes
  for (const [otherArchetype, markers] of Object.entries(archetypeMarkers)) {
    if (otherArchetype !== archetype) {
      const wrongMarkers = markers.filter(m => responseLower.includes(m));
      score -= wrongMarkers.length * 10;
    }
  }

  return Math.max(0, Math.min(100, score));
}

function scoreEmotionalAlignment(
  response: string,
  emotionalState: EmotionalState,
  suspicionLevel: number
): number {
  let score = 70; // Base score
  const wordCount = countWords(response);
  const [minWords, maxWords] = WORD_COUNT_RANGES[emotionalState];

  // Word count alignment (30 points)
  if (wordCount >= minWords && wordCount <= maxWords) {
    score += 30;
  } else {
    const deviation = wordCount < minWords
      ? (minWords - wordCount) / minWords
      : (wordCount - maxWords) / maxWords;

    score += 30 * (1 - Math.min(1, deviation));
  }

  // Tone markers by state
  const toneMarkers: Record<EmotionalState, string[]> = {
    COOPERATIVE: ['happy', 'glad', 'certainly', 'of course', 'help'],
    NERVOUS: ['I...', 'um', 'perhaps', 'I think', 'not sure', 'uncomfortable'],
    DEFENSIVE: ['How dare', "that's", 'demand', 'refuse', 'inappropriate'],
    AGGRESSIVE: ['done', 'now', 'lawyer', 'leaving', 'charge me']
  };

  const responseLower = response.toLowerCase();
  const toneMatches = toneMarkers[emotionalState].filter(marker =>
    responseLower.includes(marker.toLowerCase())
  ).length;

  // Bonus for appropriate tone markers (but not required)
  if (toneMatches > 0) {
    score = Math.min(100, score + toneMatches * 5);
  }

  return Math.max(0, Math.min(100, score));
}

function scoreInformationContent(
  response: string,
  isGuilty: boolean,
  emotionalState: EmotionalState
): number {
  let score = 60; // Base score

  // Check for specificity markers
  const specificityMarkers = [
    /\d{1,2}:\d{2}/, // Times (9:45, 10:15)
    /\d{1,2}\s*(AM|PM|am|pm)/, // 9 PM
    /\d{4}/, // Years
    /Route \d+/, // Route numbers
    /\$[\d,]+/, // Dollar amounts
    /"[^"]+"/  // Quoted text
  ];

  const specificityCount = specificityMarkers.filter(pattern =>
    pattern.test(response)
  ).length;

  if (isGuilty) {
    // Guilty suspects should be vague
    // Penalty for too many specific details
    if (specificityCount > 2) {
      score -= (specificityCount - 2) * 15;
    } else {
      score += 20; // Good vagueness
    }

    // Check for guilty behavior markers
    const guiltyMarkers = ['think', 'maybe', 'probably', "can't recall", 'not sure', 'check'];
    const guiltyCount = guiltyMarkers.filter(m =>
      response.toLowerCase().includes(m)
    ).length;

    score += Math.min(20, guiltyCount * 7);

  } else {
    // Innocent suspects should be specific
    score += Math.min(30, specificityCount * 10);

    // Check for helpful behavior
    const helpfulMarkers = ['I can provide', 'documented', 'verify', 'evidence', 'proof'];
    const helpfulCount = helpfulMarkers.filter(m =>
      response.toLowerCase().includes(m)
    ).length;

    score += Math.min(10, helpfulCount * 5);
  }

  return Math.max(0, Math.min(100, score));
}

function scoreNaturalDialogue(response: string): number {
  let score = 70; // Base score

  // Check for contractions (natural speech)
  const contractions = ["I'm", "don't", "can't", "won't", "didn't", "I'll", "it's", "that's"];
  const contractionCount = contractions.filter(c => response.includes(c)).length;

  score += Math.min(15, contractionCount * 5);

  // Penalty for overly formal phrases
  const formalPhrases = [
    /shall not/i,
    /I am not/,
    /it is my/i,
    /one must/i,
    /that which/i
  ];

  const formalCount = formalPhrases.filter(p => p.test(response)).length;
  score -= formalCount * 10;

  // Check for natural idioms
  const idioms = [
    'field day',
    'grasping at straws',
    'cherry-picking',
    'out of the blue',
    'beside the point',
    'cut to the chase'
  ];

  const idiomCount = idioms.filter(i => response.toLowerCase().includes(i)).length;
  score += Math.min(15, idiomCount * 8);

  return Math.max(0, Math.min(100, score));
}

function getRating(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Acceptable';
  if (score >= 40) return 'Poor';
  return 'Unacceptable';
}

function generateFeedback(
  scores: QualityScores,
  wordCount: number,
  emotionalState: EmotionalState
): string[] {
  const feedback: string[] = [];
  const [minWords, maxWords] = WORD_COUNT_RANGES[emotionalState];

  // Character Consistency
  if (scores.characterConsistency < QUALITY_THRESHOLDS.characterConsistency) {
    feedback.push(`❌ Character Consistency (${scores.characterConsistency.toFixed(1)}) below threshold (${QUALITY_THRESHOLDS.characterConsistency})`);
    feedback.push('   → Review archetype vocabulary and personality traits');
    feedback.push('   → Ensure speech patterns match archetype definition');
  } else {
    feedback.push(`✓ Character Consistency (${scores.characterConsistency.toFixed(1)}) meets threshold`);
  }

  // Emotional Alignment
  if (scores.emotionalAlignment < QUALITY_THRESHOLDS.emotionalAlignment) {
    feedback.push(`❌ Emotional Alignment (${scores.emotionalAlignment.toFixed(1)}) below threshold (${QUALITY_THRESHOLDS.emotionalAlignment})`);

    if (wordCount < minWords || wordCount > maxWords) {
      feedback.push(`   → Adjust word count: ${wordCount} words (target: ${minWords}-${maxWords})`);
    }

    feedback.push('   → Verify tone matches emotional state');
  } else {
    feedback.push(`✓ Emotional Alignment (${scores.emotionalAlignment.toFixed(1)}) meets threshold`);
  }

  // Information Content
  if (scores.informationContent < QUALITY_THRESHOLDS.informationContent) {
    feedback.push(`❌ Information Content (${scores.informationContent.toFixed(1)}) below threshold (${QUALITY_THRESHOLDS.informationContent})`);
    feedback.push('   → Review guilty/innocent behavior patterns');
    feedback.push('   → Adjust specificity level appropriately');
  } else {
    feedback.push(`✓ Information Content (${scores.informationContent.toFixed(1)}) meets threshold`);
  }

  // Natural Dialogue
  if (scores.naturalDialogue < QUALITY_THRESHOLDS.naturalDialogue) {
    feedback.push(`❌ Natural Dialogue (${scores.naturalDialogue.toFixed(1)}) below threshold (${QUALITY_THRESHOLDS.naturalDialogue})`);
    feedback.push('   → Use more contractions (I\'m, don\'t, can\'t)');
    feedback.push('   → Avoid overly formal phrasing');
    feedback.push('   → Include natural idioms when appropriate');
  } else {
    feedback.push(`✓ Natural Dialogue (${scores.naturalDialogue.toFixed(1)}) meets threshold`);
  }

  return feedback;
}

function validateResponse(
  response: string,
  archetype: string,
  emotionalState: EmotionalState,
  isGuilty: boolean,
  suspicionLevel: number,
  vocabulary: string[]
): ValidationResult {
  const scores: QualityScores = {
    characterConsistency: scoreCharacterConsistency(response, archetype, vocabulary),
    emotionalAlignment: scoreEmotionalAlignment(response, emotionalState, suspicionLevel),
    informationContent: scoreInformationContent(response, isGuilty, emotionalState),
    naturalDialogue: scoreNaturalDialogue(response),
    overall: 0
  };

  scores.overall = (
    scores.characterConsistency +
    scores.emotionalAlignment +
    scores.informationContent +
    scores.naturalDialogue
  ) / 4;

  const passed =
    scores.characterConsistency >= QUALITY_THRESHOLDS.characterConsistency &&
    scores.emotionalAlignment >= QUALITY_THRESHOLDS.emotionalAlignment &&
    scores.informationContent >= QUALITY_THRESHOLDS.informationContent &&
    scores.naturalDialogue >= QUALITY_THRESHOLDS.naturalDialogue &&
    scores.overall >= QUALITY_THRESHOLDS.overall;

  const wordCount = countWords(response);
  const feedback = generateFeedback(scores, wordCount, emotionalState);
  const rating = getRating(scores.overall);

  return { passed, scores, feedback, rating };
}

function printResults(result: ValidationResult) {
  console.log();
  console.log('='.repeat(70));
  console.log('QUALITY VALIDATION RESULTS');
  console.log('='.repeat(70));
  console.log();

  console.log('📊 SCORES');
  console.log('-'.repeat(70));
  console.log(`  Character Consistency: ${result.scores.characterConsistency.toFixed(1)}/100`);
  console.log(`  Emotional Alignment:   ${result.scores.emotionalAlignment.toFixed(1)}/100`);
  console.log(`  Information Content:   ${result.scores.informationContent.toFixed(1)}/100`);
  console.log(`  Natural Dialogue:      ${result.scores.naturalDialogue.toFixed(1)}/100`);
  console.log();
  console.log(`  Overall Quality:       ${result.scores.overall.toFixed(1)}/100 (${result.rating})`);
  console.log();

  console.log('✅ RESULT');
  console.log('-'.repeat(70));
  if (result.passed) {
    console.log('  PASS - All quality thresholds met');
  } else {
    console.log('  FAIL - Some quality thresholds not met');
  }
  console.log();

  console.log('📝 FEEDBACK');
  console.log('-'.repeat(70));
  result.feedback.forEach(line => {
    console.log(`  ${line}`);
  });
  console.log();

  if (!result.passed) {
    console.log('💡 NEXT STEPS');
    console.log('-'.repeat(70));
    console.log('  1. Address items marked with ❌');
    console.log('  2. Review archetype reference files');
    console.log('  3. Revalidate after changes');
    console.log();
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('Suspect Response Quality Validator');
  console.log('='.repeat(70));
  console.log();

  const archetype = await question('Archetype (e.g., "Wealthy Heir"): ');
  const emotionalStateInput = await question('Emotional State (COOPERATIVE/NERVOUS/DEFENSIVE/AGGRESSIVE): ');
  const emotionalState = emotionalStateInput.toUpperCase() as EmotionalState;

  const suspicionLevelInput = await question('Suspicion Level (0-100): ');
  const suspicionLevel = parseInt(suspicionLevelInput, 10);

  const isGuiltyInput = await question('Is Guilty? (y/n): ');
  const isGuilty = isGuiltyInput.toLowerCase() === 'y';

  const vocabularyInput = await question('Key vocabulary words (comma-separated): ');
  const vocabulary = vocabularyInput.split(',').map(w => w.trim());

  console.log();
  console.log('Enter the suspect response to validate:');
  console.log('(Press Enter twice when done)');
  console.log();

  let response = '';
  let lineCount = 0;

  while (true) {
    const line = await question('');
    if (line.trim() === '' && lineCount > 0) break;
    if (line.trim() !== '') {
      response += (response ? ' ' : '') + line;
      lineCount++;
    }
  }

  console.log();
  console.log('Validating response...');

  const result = validateResponse(
    response,
    archetype,
    emotionalState,
    isGuilty,
    suspicionLevel,
    vocabulary
  );

  printResults(result);

  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
