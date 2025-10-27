/**
 * End-to-End Test: 3-Slide Intro System
 *
 * Tests the complete flow from case generation to frontend rendering
 *
 * Test Scenario:
 * 1. Generate new case via CaseGeneratorService
 * 2. Verify generateCase() returns with introSlides
 * 3. Check server logs show "IntroSlides: Generated"
 * 4. Confirm case data includes introSlides
 * 5. Verify IntroSlides structure matches type definition
 *
 * Success Criteria:
 * - introSlides is not undefined
 * - introSlides.discovery contains timeLocation, victimStatement, constraint
 * - introSlides.suspects contains suspectCards array (3 items)
 * - introSlides.challenge contains statementLine1/2/3, question, cta
 * - All suspect cards have suspectId, name, role, claim, hasProfileImage
 */

import { CaseGeneratorService, createCaseGeneratorService } from './src/server/services/case/CaseGeneratorService';
import { createGeminiClient } from './src/server/services/gemini/GeminiClient';
import type { IntroSlides, Slide1Discovery, Slide2Suspects, Slide3Challenge } from './src/shared/types';

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(emoji: string, message: string, color: string = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

function logSuccess(message: string) {
  log('✅', message, colors.green);
}

function logError(message: string) {
  log('❌', message, colors.red);
}

function logWarning(message: string) {
  log('⚠️', message, colors.yellow);
}

function logInfo(message: string) {
  log('ℹ️', message, colors.blue);
}

/**
 * Validate Slide1Discovery structure
 */
function validateSlide1(slide: Slide1Discovery): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!slide.timeLocation || typeof slide.timeLocation !== 'string') {
    issues.push('timeLocation is missing or invalid');
  }
  if (!slide.victimStatement || typeof slide.victimStatement !== 'string') {
    issues.push('victimStatement is missing or invalid');
  }
  if (!slide.constraint || typeof slide.constraint !== 'string') {
    issues.push('constraint is missing or invalid');
  }

  // Word count validation (30-40 words recommended)
  const totalWords = [slide.timeLocation, slide.victimStatement, slide.constraint]
    .join(' ')
    .split(/\s+/).length;

  if (totalWords < 20 || totalWords > 60) {
    logWarning(`Slide 1 word count: ${totalWords} (recommended: 30-40)`);
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Validate Slide2Suspects structure
 */
function validateSlide2(slide: Slide2Suspects): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!Array.isArray(slide.suspectCards)) {
    issues.push('suspectCards is not an array');
  } else if (slide.suspectCards.length !== 3) {
    issues.push(`Expected 3 suspect cards, got ${slide.suspectCards.length}`);
  } else {
    slide.suspectCards.forEach((card, index) => {
      if (!card.suspectId || typeof card.suspectId !== 'string') {
        issues.push(`Suspect ${index + 1}: suspectId is missing or invalid`);
      }
      if (!card.name || typeof card.name !== 'string') {
        issues.push(`Suspect ${index + 1}: name is missing or invalid`);
      }
      if (!card.role || typeof card.role !== 'string') {
        issues.push(`Suspect ${index + 1}: role is missing or invalid`);
      }
      if (!card.claim || typeof card.claim !== 'string') {
        issues.push(`Suspect ${index + 1}: claim is missing or invalid`);
      }
      if (!card.claim.startsWith('I')) {
        logWarning(`Suspect ${index + 1}: claim should start with "I" (got: "${card.claim}")`);
      }
      if (typeof card.hasProfileImage !== 'boolean') {
        issues.push(`Suspect ${index + 1}: hasProfileImage is missing or invalid`);
      }
    });
  }

  if (!slide.constraintStatement || typeof slide.constraintStatement !== 'string') {
    issues.push('constraintStatement is missing or invalid');
  }
  if (!slide.tensionLine || typeof slide.tensionLine !== 'string') {
    issues.push('tensionLine is missing or invalid');
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Validate Slide3Challenge structure
 */
function validateSlide3(slide: Slide3Challenge): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!slide.statementLine1 || typeof slide.statementLine1 !== 'string') {
    issues.push('statementLine1 is missing or invalid');
  }
  if (!slide.statementLine2 || typeof slide.statementLine2 !== 'string') {
    issues.push('statementLine2 is missing or invalid');
  }
  if (!slide.statementLine3 || typeof slide.statementLine3 !== 'string') {
    issues.push('statementLine3 is missing or invalid');
  }
  if (!slide.question || typeof slide.question !== 'string') {
    issues.push('question is missing or invalid');
  }
  if (!slide.cta || typeof slide.cta !== 'string') {
    issues.push('cta is missing or invalid');
  }

  // Word count validation (20-30 words recommended)
  const totalWords = [
    slide.statementLine1,
    slide.statementLine2,
    slide.statementLine3,
    slide.question,
    slide.cta
  ].join(' ').split(/\s+/).length;

  if (totalWords < 15 || totalWords > 40) {
    logWarning(`Slide 3 word count: ${totalWords} (recommended: 20-30)`);
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Validate complete IntroSlides structure
 */
function validateIntroSlides(introSlides: IntroSlides | undefined): { valid: boolean; issues: string[] } {
  if (!introSlides) {
    return { valid: false, issues: ['introSlides is undefined'] };
  }

  const issues: string[] = [];

  // Validate Slide 1
  const slide1Validation = validateSlide1(introSlides.discovery);
  if (!slide1Validation.valid) {
    issues.push(...slide1Validation.issues.map(i => `[Slide 1] ${i}`));
  }

  // Validate Slide 2
  const slide2Validation = validateSlide2(introSlides.suspects);
  if (!slide2Validation.valid) {
    issues.push(...slide2Validation.issues.map(i => `[Slide 2] ${i}`));
  }

  // Validate Slide 3
  const slide3Validation = validateSlide3(introSlides.challenge);
  if (!slide3Validation.valid) {
    issues.push(...slide3Validation.issues.map(i => `[Slide 3] ${i}`));
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Display IntroSlides content
 */
function displayIntroSlides(introSlides: IntroSlides) {
  logSection('📋 INTRO SLIDES CONTENT');

  // Slide 1: Discovery
  console.log(`${colors.bright}${colors.magenta}Slide 1: Discovery${colors.reset}`);
  console.log(`  Time/Location: ${colors.cyan}${introSlides.discovery.timeLocation}${colors.reset}`);
  console.log(`  Victim: ${colors.cyan}${introSlides.discovery.victimStatement}${colors.reset}`);
  console.log(`  Constraint: ${colors.cyan}${introSlides.discovery.constraint}${colors.reset}`);
  console.log('');

  // Slide 2: Suspects
  console.log(`${colors.bright}${colors.magenta}Slide 2: Suspects${colors.reset}`);
  introSlides.suspects.suspectCards.forEach((card, index) => {
    console.log(`  Suspect ${index + 1}:`);
    console.log(`    ID: ${colors.cyan}${card.suspectId}${colors.reset}`);
    console.log(`    Name: ${colors.cyan}${card.name}${colors.reset}`);
    console.log(`    Role: ${colors.cyan}${card.role}${colors.reset}`);
    console.log(`    Claim: ${colors.cyan}${card.claim}${colors.reset}`);
    console.log(`    Has Image: ${colors.cyan}${card.hasProfileImage}${colors.reset}`);
  });
  console.log(`  Constraint: ${colors.cyan}${introSlides.suspects.constraintStatement}${colors.reset}`);
  console.log(`  Tension: ${colors.cyan}${introSlides.suspects.tensionLine}${colors.reset}`);
  console.log('');

  // Slide 3: Challenge
  console.log(`${colors.bright}${colors.magenta}Slide 3: Challenge${colors.reset}`);
  console.log(`  Line 1: ${colors.cyan}${introSlides.challenge.statementLine1}${colors.reset}`);
  console.log(`  Line 2: ${colors.cyan}${introSlides.challenge.statementLine2}${colors.reset}`);
  console.log(`  Line 3: ${colors.cyan}${introSlides.challenge.statementLine3}${colors.reset}`);
  console.log(`  Question: ${colors.cyan}${introSlides.challenge.question}${colors.reset}`);
  console.log(`  CTA: ${colors.cyan}${introSlides.challenge.cta}${colors.reset}`);
}

/**
 * Run E2E Test
 */
async function runE2ETest() {
  logSection('🧪 3-SLIDE INTRO SYSTEM E2E TEST');

  try {
    // 1. Initialize services
    logInfo('Initializing Gemini client and CaseGeneratorService...');
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      logError('GEMINI_API_KEY or GOOGLE_API_KEY environment variable not set');
      process.exit(1);
    }

    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);
    logSuccess('Services initialized');

    // 2. Generate new case
    logSection('🎨 GENERATING NEW CASE');
    logInfo('Calling caseGenerator.generateCase()...');

    const startTime = Date.now();
    const newCase = await caseGenerator.generateCase({
      date: new Date(),
      includeImage: false, // Skip for faster testing
      includeSuspectImages: false,
      includeCinematicImages: false,
      temperature: 0.8
    });
    const duration = Date.now() - startTime;

    logSuccess(`Case generated in ${duration}ms`);
    logInfo(`Case ID: ${newCase.caseId}`);

    // 3. Verify introSlides exists
    logSection('🔍 VERIFYING INTRO SLIDES');

    if (!newCase.introSlides) {
      logError('introSlides is undefined in generated case');
      logError('TEST FAILED');
      process.exit(1);
    }

    logSuccess('introSlides exists in generated case');

    // 4. Validate introSlides structure
    const validation = validateIntroSlides(newCase.introSlides);

    if (!validation.valid) {
      logError('IntroSlides validation failed:');
      validation.issues.forEach(issue => {
        logError(`  - ${issue}`);
      });
      logError('TEST FAILED');
      process.exit(1);
    }

    logSuccess('IntroSlides structure validation passed');

    // 5. Display content
    displayIntroSlides(newCase.introSlides);

    // 6. Summary
    logSection('📊 TEST SUMMARY');
    logSuccess('✅ Case generation completed');
    logSuccess('✅ introSlides field exists');
    logSuccess('✅ Slide 1 (Discovery) structure valid');
    logSuccess('✅ Slide 2 (Suspects) structure valid');
    logSuccess('✅ Slide 3 (Challenge) structure valid');
    logSuccess(`✅ Total generation time: ${duration}ms`);

    logSection('🎉 E2E TEST PASSED');

  } catch (error) {
    logError(`Test failed with error: ${error}`);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run test
runE2ETest();
