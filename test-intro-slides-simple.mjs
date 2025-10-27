/**
 * Simple E2E Test: 3-Slide Intro System
 * Uses compiled dist output
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

function logSuccess(message) {
  log('✅', message, colors.green);
}

function logError(message) {
  log('❌', message, colors.red);
}

function logInfo(message) {
  log('ℹ️', message, colors.blue);
}

/**
 * Validate IntroSlides structure
 */
function validateIntroSlides(introSlides) {
  const issues = [];

  if (!introSlides) {
    return { valid: false, issues: ['introSlides is undefined'] };
  }

  // Validate Slide 1: Discovery
  if (!introSlides.discovery) {
    issues.push('[Slide 1] discovery is missing');
  } else {
    if (!introSlides.discovery.timeLocation) {
      issues.push('[Slide 1] timeLocation is missing');
    }
    if (!introSlides.discovery.victimStatement) {
      issues.push('[Slide 1] victimStatement is missing');
    }
    if (!introSlides.discovery.constraint) {
      issues.push('[Slide 1] constraint is missing');
    }
  }

  // Validate Slide 2: Suspects
  if (!introSlides.suspects) {
    issues.push('[Slide 2] suspects is missing');
  } else {
    if (!Array.isArray(introSlides.suspects.suspectCards)) {
      issues.push('[Slide 2] suspectCards is not an array');
    } else if (introSlides.suspects.suspectCards.length !== 3) {
      issues.push(`[Slide 2] Expected 3 suspect cards, got ${introSlides.suspects.suspectCards.length}`);
    } else {
      introSlides.suspects.suspectCards.forEach((card, index) => {
        if (!card.suspectId) issues.push(`[Slide 2] Suspect ${index + 1}: suspectId missing`);
        if (!card.name) issues.push(`[Slide 2] Suspect ${index + 1}: name missing`);
        if (!card.role) issues.push(`[Slide 2] Suspect ${index + 1}: role missing`);
        if (!card.claim) issues.push(`[Slide 2] Suspect ${index + 1}: claim missing`);
        if (typeof card.hasProfileImage !== 'boolean') {
          issues.push(`[Slide 2] Suspect ${index + 1}: hasProfileImage missing`);
        }
      });
    }
    if (!introSlides.suspects.constraintStatement) {
      issues.push('[Slide 2] constraintStatement is missing');
    }
    if (!introSlides.suspects.tensionLine) {
      issues.push('[Slide 2] tensionLine is missing');
    }
  }

  // Validate Slide 3: Challenge
  if (!introSlides.challenge) {
    issues.push('[Slide 3] challenge is missing');
  } else {
    if (!introSlides.challenge.statementLine1) issues.push('[Slide 3] statementLine1 missing');
    if (!introSlides.challenge.statementLine2) issues.push('[Slide 3] statementLine2 missing');
    if (!introSlides.challenge.statementLine3) issues.push('[Slide 3] statementLine3 missing');
    if (!introSlides.challenge.question) issues.push('[Slide 3] question missing');
    if (!introSlides.challenge.cta) issues.push('[Slide 3] cta missing');
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Display IntroSlides content
 */
function displayIntroSlides(introSlides) {
  logSection('📋 INTRO SLIDES CONTENT');

  // Slide 1: Discovery
  console.log(`${colors.bright}Slide 1: Discovery${colors.reset}`);
  console.log(`  Time/Location: ${colors.cyan}${introSlides.discovery.timeLocation}${colors.reset}`);
  console.log(`  Victim: ${colors.cyan}${introSlides.discovery.victimStatement}${colors.reset}`);
  console.log(`  Constraint: ${colors.cyan}${introSlides.discovery.constraint}${colors.reset}`);
  console.log('');

  // Slide 2: Suspects
  console.log(`${colors.bright}Slide 2: Suspects${colors.reset}`);
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
  console.log(`${colors.bright}Slide 3: Challenge${colors.reset}`);
  console.log(`  Line 1: ${colors.cyan}${introSlides.challenge.statementLine1}${colors.reset}`);
  console.log(`  Line 2: ${colors.cyan}${introSlides.challenge.statementLine2}${colors.reset}`);
  console.log(`  Line 3: ${colors.cyan}${introSlides.challenge.statementLine3}${colors.reset}`);
  console.log(`  Question: ${colors.cyan}${introSlides.challenge.question}${colors.reset}`);
  console.log(`  CTA: ${colors.cyan}${introSlides.challenge.cta}${colors.reset}`);
}

/**
 * Test by calling the server API endpoint
 */
async function testViaAPI() {
  logSection('🧪 3-SLIDE INTRO SYSTEM E2E TEST (API)');

  try {
    logInfo('Checking if server is running at http://localhost:3000...');

    // Test 1: Health check
    try {
      const healthResponse = await fetch('http://localhost:3000/api/health');
      if (!healthResponse.ok) {
        throw new Error('Health check failed');
      }
      logSuccess('Server is running');
    } catch (error) {
      logError('Server is not running. Please start the server first:');
      console.log('  npm run dev');
      process.exit(1);
    }

    // Test 2: Check if case exists
    logInfo('Checking for today\'s case...');
    const caseResponse = await fetch('http://localhost:3000/api/case');

    if (!caseResponse.ok) {
      logError('Failed to fetch case data');
      const errorText = await caseResponse.text();
      console.error(errorText);
      process.exit(1);
    }

    const caseData = await caseResponse.json();
    logSuccess(`Case found: ${caseData.id}`);

    // Test 3: Verify introSlides
    logSection('🔍 VERIFYING INTRO SLIDES');

    if (!caseData.introSlides) {
      logError('introSlides is undefined in case data');
      logError('TEST FAILED');
      console.log('\nCase data structure:');
      console.log(JSON.stringify(Object.keys(caseData), null, 2));
      process.exit(1);
    }

    logSuccess('introSlides exists in case data');

    // Test 4: Validate structure
    const validation = validateIntroSlides(caseData.introSlides);

    if (!validation.valid) {
      logError('IntroSlides validation failed:');
      validation.issues.forEach(issue => {
        logError(`  - ${issue}`);
      });
      logError('TEST FAILED');
      process.exit(1);
    }

    logSuccess('IntroSlides structure validation passed');

    // Test 5: Display content
    displayIntroSlides(caseData.introSlides);

    // Test 6: Summary
    logSection('📊 TEST SUMMARY');
    logSuccess('✅ Server is running');
    logSuccess('✅ Case data retrieved');
    logSuccess('✅ introSlides field exists');
    logSuccess('✅ Slide 1 (Discovery) structure valid');
    logSuccess('✅ Slide 2 (Suspects) structure valid');
    logSuccess('✅ Slide 3 (Challenge) structure valid');

    logSection('🎉 E2E TEST PASSED');

  } catch (error) {
    logError(`Test failed with error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run test
testViaAPI();
