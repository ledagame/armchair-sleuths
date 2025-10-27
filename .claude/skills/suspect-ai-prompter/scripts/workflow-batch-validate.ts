#!/usr/bin/env tsx

/**
 * Workflow: Batch Validate
 *
 * Validates all archetype examples and generates comprehensive statistics:
 * - Total pass/fail rate
 * - Statistics by archetype
 * - Quality score trends
 */

import { WorkflowOrchestrator } from './WorkflowOrchestrator';

async function main() {
  console.log('='.repeat(70));
  console.log('Workflow: Batch Validate All Archetypes');
  console.log('='.repeat(70));
  console.log();
  
  const orchestrator = new WorkflowOrchestrator();
  
  try {
    const result = await orchestrator.batchValidate();
    
    // Print detailed statistics
    console.log('='.repeat(70));
    console.log('ARCHETYPE STATISTICS');
    console.log('='.repeat(70));
    console.log();
    
    // Sort archetypes by average score
    const sortedArchetypes = Array.from(result.archetypeStats.entries())
      .sort((a, b) => b[1].averageScore - a[1].averageScore);
    
    for (const [archetype, stats] of sortedArchetypes) {
      console.log(`${archetype}:`);
      console.log(`  Average Score: ${stats.averageScore.toFixed(1)}/100`);
      console.log(`  Range: ${stats.minScore.toFixed(1)} - ${stats.maxScore.toFixed(1)}`);
      console.log(`  Failure Rate: ${(stats.failureRate * 100).toFixed(1)}%`);
      
      // Rating
      let rating = '';
      if (stats.averageScore >= 90) rating = '⭐⭐⭐⭐⭐ Excellent';
      else if (stats.averageScore >= 75) rating = '⭐⭐⭐⭐ Good';
      else if (stats.averageScore >= 60) rating = '⭐⭐⭐ Acceptable';
      else if (stats.averageScore >= 40) rating = '⭐⭐ Poor';
      else rating = '⭐ Unacceptable';
      
      console.log(`  Rating: ${rating}`);
      console.log();
    }
    
    // Overall assessment
    console.log('='.repeat(70));
    console.log('OVERALL ASSESSMENT');
    console.log('='.repeat(70));
    console.log();
    
    const passRate = (result.passedExamples / result.totalExamples) * 100;
    
    console.log(`Pass Rate: ${passRate.toFixed(1)}%`);
    
    if (passRate >= 90) {
      console.log('✅ EXCELLENT - All archetypes meet quality standards');
    } else if (passRate >= 75) {
      console.log('✅ GOOD - Most archetypes meet quality standards');
    } else if (passRate >= 60) {
      console.log('⚠️  ACCEPTABLE - Some archetypes need improvement');
    } else {
      console.log('❌ POOR - Significant improvements needed');
    }
    
    console.log();
    
    // Recommendations
    if (passRate < 90) {
      console.log('💡 RECOMMENDATIONS');
      console.log('-'.repeat(70));
      
      // Find archetypes with low scores
      const lowScoreArchetypes = sortedArchetypes
        .filter(([_, stats]) => stats.averageScore < 75)
        .map(([name, _]) => name);
      
      if (lowScoreArchetypes.length > 0) {
        console.log('Focus on improving these archetypes:');
        lowScoreArchetypes.forEach(name => {
          console.log(`  • ${name}`);
        });
        console.log();
      }
      
      console.log('Actions to take:');
      console.log('  1. Review examples for low-scoring archetypes');
      console.log('  2. Ensure vocabulary matches archetype definitions');
      console.log('  3. Verify word counts match emotional states');
      console.log('  4. Check guilty vs innocent behavior patterns');
      console.log('  5. Run improve-prompt.ts for specific suggestions');
      console.log();
    }
    
    // Export results to JSON
    const outputPath = 'batch-validation-results.json';
    const jsonOutput = {
      timestamp: new Date().toISOString(),
      summary: {
        totalExamples: result.totalExamples,
        passedExamples: result.passedExamples,
        failedExamples: result.failedExamples,
        passRate: passRate
      },
      archetypes: Object.fromEntries(result.archetypeStats)
    };
    
    const fs = require('fs');
    fs.writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2), 'utf8');
    
    console.log(`📊 Results exported to: ${outputPath}`);
    console.log();
    
  } catch (error) {
    console.error('❌ Batch validation failed:', error);
    process.exit(1);
  }
}

main();
