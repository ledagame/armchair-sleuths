#!/usr/bin/env tsx

/**
 * Prompt Improvement Analyzer
 *
 * Analyzes suspect-personality-core/PROMPT.md and provides
 * actionable recommendations for improvement.
 */

import * as fs from 'fs';
import * as path from 'path';

interface AnalysisResult {
  strengths: string[];
  improvements: ImprovementOpportunity[];
  impactEstimate: ImpactEstimate;
}

interface ImprovementOpportunity {
  issue: string;
  solution: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

interface ImpactEstimate {
  characterConsistency: string;
  emotionalAlignment: string;
  overallQuality: string;
}

function analyzePrompt(promptContent: string): AnalysisResult {
  const result: AnalysisResult = {
    strengths: [],
    improvements: [],
    impactEstimate: {
      characterConsistency: '',
      emotionalAlignment: '',
      overallQuality: ''
    }
  };

  // Check for archetype definitions
  if (promptContent.includes('archetype') || promptContent.includes('Archetype')) {
    result.strengths.push('Contains archetype definitions');
  } else {
    result.improvements.push({
      issue: 'Missing archetype definitions',
      solution: 'Add clear archetype definitions with personality traits, vocabulary, and speech patterns',
      priority: 'high',
      impact: 'Critical for character consistency'
    });
  }

  // Check for emotional states
  const emotionalStates = ['COOPERATIVE', 'NERVOUS', 'DEFENSIVE', 'AGGRESSIVE'];
  const hasAllStates = emotionalStates.every(state => promptContent.includes(state));

  if (hasAllStates) {
    result.strengths.push('Includes all 4 emotional states');
  } else {
    result.improvements.push({
      issue: 'Incomplete emotional state system',
      solution: 'Define all 4 emotional states (COOPERATIVE, NERVOUS, DEFENSIVE, AGGRESSIVE) with specific tone guidance',
      priority: 'high',
      impact: 'Essential for emotional alignment'
    });
  }

  // Check for few-shot examples
  const exampleCount = (promptContent.match(/Detective:/g) || []).length;

  if (exampleCount >= 8) {
    result.strengths.push(`Contains ${exampleCount} few-shot examples`);
  } else if (exampleCount > 0) {
    result.improvements.push({
      issue: `Only ${exampleCount} few-shot examples (need at least 8)`,
      solution: 'Add more examples covering all emotional states with both guilty and innocent variations',
      priority: 'medium',
      impact: 'Improves response quality and consistency'
    });
  } else {
    result.improvements.push({
      issue: 'No few-shot examples found',
      solution: 'Add 8 few-shot dialogue examples (2 per state × guilty/innocent)',
      priority: 'high',
      impact: 'Critical for teaching proper response patterns'
    });
  }

  // Check for word count guidance
  if (promptContent.includes('word') && promptContent.includes('count')) {
    result.strengths.push('Includes word count guidance');
  } else {
    result.improvements.push({
      issue: 'Missing word count targets',
      solution: 'Add word count ranges by emotional state (COOPERATIVE: 40-80, NERVOUS: 30-60, DEFENSIVE: 15-40, AGGRESSIVE: 10-30)',
      priority: 'medium',
      impact: 'Ensures appropriate response length'
    });
  }

  // Check for guilty vs innocent differentiation
  const hasGuiltyGuidance = promptContent.toLowerCase().includes('guilty') &&
                            promptContent.toLowerCase().includes('innocent');

  if (hasGuiltyGuidance) {
    result.strengths.push('Differentiates guilty vs innocent behavior');
  } else {
    result.improvements.push({
      issue: 'No guilty vs innocent behavior guidance',
      solution: 'Add section explaining how guilty suspects behave differently (vague, evasive) vs innocent (specific, helpful)',
      priority: 'high',
      impact: 'Critical for authentic suspect behavior'
    });
  }

  // Check for template variables
  const templateVars = [
    '{{SUSPECT_NAME}}',
    '{{ARCHETYPE}}',
    '{{EMOTIONAL_STATE}}',
    '{{IS_GUILTY}}'
  ];

  const hasTemplateVars = templateVars.some(v => promptContent.includes(v));

  if (hasTemplateVars) {
    result.strengths.push('Uses template variables');
  } else {
    result.improvements.push({
      issue: 'No template variables defined',
      solution: 'Add clear template variables ({{SUSPECT_NAME}}, {{ARCHETYPE}}, etc.) with substitution examples',
      priority: 'low',
      impact: 'Improves prompt clarity and maintainability'
    });
  }

  // Check for quality criteria
  const qualityCriteria = ['character consistency', 'emotional alignment', 'natural dialogue', 'information content'];
  const hasQualityCriteria = qualityCriteria.some(c =>
    promptContent.toLowerCase().includes(c.toLowerCase())
  );

  if (hasQualityCriteria) {
    result.strengths.push('References quality criteria');
  } else {
    result.improvements.push({
      issue: 'Missing quality criteria',
      solution: 'Add quality thresholds (character consistency ≥60, emotional alignment ≥60, etc.)',
      priority: 'medium',
      impact: 'Provides clear success metrics'
    });
  }

  // Calculate impact estimate
  const highPriorityCount = result.improvements.filter(i => i.priority === 'high').length;
  const mediumPriorityCount = result.improvements.filter(i => i.priority === 'medium').length;

  if (highPriorityCount === 0 && mediumPriorityCount === 0) {
    result.impactEstimate = {
      characterConsistency: '+5-10%',
      emotionalAlignment: '+5-10%',
      overallQuality: '+5-10%'
    };
  } else if (highPriorityCount > 0) {
    result.impactEstimate = {
      characterConsistency: '+20-30%',
      emotionalAlignment: '+25-35%',
      overallQuality: '+20-30%'
    };
  } else {
    result.impactEstimate = {
      characterConsistency: '+10-15%',
      emotionalAlignment: '+15-20%',
      overallQuality: '+15-20%'
    };
  }

  return result;
}

function printReport(result: AnalysisResult) {
  console.log('='.repeat(70));
  console.log('PROMPT.md Analysis Report');
  console.log('='.repeat(70));
  console.log();

  // Strengths
  console.log('✅ STRENGTHS');
  console.log('-'.repeat(70));
  if (result.strengths.length > 0) {
    result.strengths.forEach(strength => {
      console.log(`  • ${strength}`);
    });
  } else {
    console.log('  None identified');
  }
  console.log();

  // Improvement Opportunities
  console.log('🔧 IMPROVEMENT OPPORTUNITIES');
  console.log('-'.repeat(70));

  if (result.improvements.length === 0) {
    console.log('  No critical issues found. Prompt is well-structured.');
    console.log();
    return;
  }

  // Group by priority
  const high = result.improvements.filter(i => i.priority === 'high');
  const medium = result.improvements.filter(i => i.priority === 'medium');
  const low = result.improvements.filter(i => i.priority === 'low');

  if (high.length > 0) {
    console.log('\n  HIGH PRIORITY:');
    high.forEach((imp, idx) => {
      console.log(`\n  ${idx + 1}. ${imp.issue}`);
      console.log(`     Solution: ${imp.solution}`);
      console.log(`     Impact: ${imp.impact}`);
    });
  }

  if (medium.length > 0) {
    console.log('\n  MEDIUM PRIORITY:');
    medium.forEach((imp, idx) => {
      console.log(`\n  ${idx + 1}. ${imp.issue}`);
      console.log(`     Solution: ${imp.solution}`);
      console.log(`     Impact: ${imp.impact}`);
    });
  }

  if (low.length > 0) {
    console.log('\n  LOW PRIORITY:');
    low.forEach((imp, idx) => {
      console.log(`\n  ${idx + 1}. ${imp.issue}`);
      console.log(`     Solution: ${imp.solution}`);
      console.log(`     Impact: ${imp.impact}`);
    });
  }

  console.log();

  // Impact Estimate
  console.log('📊 ESTIMATED IMPACT');
  console.log('-'.repeat(70));
  console.log(`  Character Consistency: ${result.impactEstimate.characterConsistency}`);
  console.log(`  Emotional Alignment:   ${result.impactEstimate.emotionalAlignment}`);
  console.log(`  Overall Quality:       ${result.impactEstimate.overallQuality}`);
  console.log();

  // Recommendations
  console.log('💡 RECOMMENDATIONS');
  console.log('-'.repeat(70));
  console.log('  1. Address HIGH priority items first');
  console.log('  2. Review existing archetype files for examples');
  console.log('  3. Test prompt changes with validate-quality.ts');
  console.log('  4. Run this analysis again after improvements');
  console.log();
}

async function main() {
  const args = process.argv.slice(2);
  let targetFile = '';

  if (args.length === 0) {
    // Default to suspect-personality-core PROMPT.md
    targetFile = path.join(
      process.cwd(),
      'src',
      'shared',
      'prompts',
      'suspect-personality-core',
      'PROMPT.md'
    );
  } else {
    targetFile = args[0];
  }

  if (!fs.existsSync(targetFile)) {
    console.error(`❌ Error: File not found: ${targetFile}`);
    console.log();
    console.log('Usage:');
    console.log('  npm run suspect:improve-prompt [path/to/PROMPT.md]');
    console.log();
    console.log('If no path is provided, analyzes:');
    console.log('  src/shared/prompts/suspect-personality-core/PROMPT.md');
    process.exit(1);
  }

  console.log(`Analyzing: ${targetFile}`);
  console.log();

  const promptContent = fs.readFileSync(targetFile, 'utf8');
  const result = analyzePrompt(promptContent);

  printReport(result);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
