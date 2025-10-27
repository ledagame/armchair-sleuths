#!/usr/bin/env tsx

/**
 * Workflow: Improve Prompt
 *
 * Analyzes PROMPT.md and provides actionable improvement suggestions
 * with estimated impact on quality scores.
 */

import { WorkflowOrchestrator } from './WorkflowOrchestrator';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  
  console.log('='.repeat(70));
  console.log('Workflow: Improve PROMPT.md');
  console.log('='.repeat(70));
  console.log();
  
  const orchestrator = new WorkflowOrchestrator();
  
  try {
    // Get prompt path from args or use default
    let promptPath: string | undefined;
    
    if (args.length > 0) {
      promptPath = args[0];
      console.log(`Analyzing: ${promptPath}`);
    } else {
      promptPath = path.join(
        process.cwd(),
        'skills',
        'suspect-personality-core',
        'PROMPT.md'
      );
      console.log(`Analyzing default: ${promptPath}`);
    }
    
    console.log();
    
    const result = await orchestrator.improvePrompt(promptPath);
    
    // Print results
    console.log();
    console.log('='.repeat(70));
    console.log('IMPROVEMENT ANALYSIS COMPLETE');
    console.log('='.repeat(70));
    console.log();
    
    if (result.improvements.length === 0) {
      console.log('✅ No critical issues found. PROMPT.md is well-structured.');
      console.log();
      return;
    }
    
    // Group improvements by priority
    const high = result.improvements.filter(i => i.priority === 'high');
    const medium = result.improvements.filter(i => i.priority === 'medium');
    const low = result.improvements.filter(i => i.priority === 'low');
    
    // Print high priority items
    if (high.length > 0) {
      console.log('🔴 HIGH PRIORITY IMPROVEMENTS');
      console.log('-'.repeat(70));
      high.forEach((imp, idx) => {
        console.log(`\n${idx + 1}. ${imp.issue}`);
        console.log(`   Solution: ${imp.solution}`);
        console.log(`   Impact: ${imp.impact}`);
      });
      console.log();
    }
    
    // Print medium priority items
    if (medium.length > 0) {
      console.log('🟡 MEDIUM PRIORITY IMPROVEMENTS');
      console.log('-'.repeat(70));
      medium.forEach((imp, idx) => {
        console.log(`\n${idx + 1}. ${imp.issue}`);
        console.log(`   Solution: ${imp.solution}`);
        console.log(`   Impact: ${imp.impact}`);
      });
      console.log();
    }
    
    // Print low priority items
    if (low.length > 0) {
      console.log('🟢 LOW PRIORITY IMPROVEMENTS');
      console.log('-'.repeat(70));
      low.forEach((imp, idx) => {
        console.log(`\n${idx + 1}. ${imp.issue}`);
        console.log(`   Solution: ${imp.solution}`);
        console.log(`   Impact: ${imp.impact}`);
      });
      console.log();
    }
    
    // Print estimated impact
    console.log('='.repeat(70));
    console.log('ESTIMATED IMPACT');
    console.log('='.repeat(70));
    console.log();
    console.log(`Character Consistency: ${result.estimatedImpact.characterConsistency}`);
    console.log(`Emotional Alignment:   ${result.estimatedImpact.emotionalAlignment}`);
    console.log(`Overall Quality:       ${result.estimatedImpact.overall}`);
    console.log();
    
    // Recommendations
    console.log('💡 NEXT STEPS');
    console.log('-'.repeat(70));
    console.log('1. Address HIGH priority items first');
    console.log('2. Review archetype reference files for examples');
    console.log('3. Test changes with validate-quality.ts');
    console.log('4. Run batch-validate to measure improvement');
    console.log('5. Run this analysis again after changes');
    console.log();
    
    // Export results to JSON
    const outputPath = 'prompt-improvement-analysis.json';
    const jsonOutput = {
      timestamp: new Date().toISOString(),
      promptPath,
      improvements: result.improvements,
      estimatedImpact: result.estimatedImpact,
      summary: {
        highPriority: high.length,
        mediumPriority: medium.length,
        lowPriority: low.length,
        total: result.improvements.length
      }
    };
    
    const fs = require('fs');
    fs.writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2), 'utf8');
    
    console.log(`📊 Analysis exported to: ${outputPath}`);
    console.log();
    
  } catch (error) {
    console.error('❌ Prompt analysis failed:', error);
    process.exit(1);
  }
}

main();
