#!/usr/bin/env tsx

/**
 * Workflow: Create New Archetype
 *
 * Orchestrates the complete workflow for creating a new archetype:
 * 1. Generate archetype file (generate-archetype.ts)
 * 2. Generate examples (generate-examples.ts)
 * 3. Validate quality (validate-quality.ts)
 */

import { WorkflowOrchestrator } from './WorkflowOrchestrator';

async function main() {
  const args = process.argv.slice(2);
  
  console.log('='.repeat(70));
  console.log('Workflow: Create New Archetype');
  console.log('='.repeat(70));
  console.log();
  console.log('This workflow will guide you through:');
  console.log('1. Creating a new archetype definition');
  console.log('2. Generating 8 few-shot examples');
  console.log('3. Validating example quality');
  console.log();
  
  const orchestrator = new WorkflowOrchestrator();
  
  try {
    // Get archetype name from args or prompt
    let archetypeName = '';
    
    if (args.length > 0) {
      archetypeName = args.join(' ');
      console.log(`Creating archetype: ${archetypeName}`);
      console.log();
    }
    
    // Run the workflow
    const result = await orchestrator.createNewArchetype(archetypeName, true);
    
    // Print results
    console.log();
    console.log('='.repeat(70));
    console.log('WORKFLOW COMPLETE');
    console.log('='.repeat(70));
    console.log();
    console.log(`✓ Archetype file: ${result.archetypePath}`);
    console.log(`✓ Examples generated: ${result.examplesGenerated}`);
    console.log(`✓ Validation results: ${result.validationResults.length} examples validated`);
    console.log();
    
    // Show validation summary
    const passedCount = result.validationResults.filter(r => r.passed).length;
    const failedCount = result.validationResults.length - passedCount;
    
    console.log('Validation Summary:');
    console.log(`  Passed: ${passedCount}/${result.validationResults.length}`);
    console.log(`  Failed: ${failedCount}/${result.validationResults.length}`);
    console.log();
    
    if (failedCount > 0) {
      console.log('⚠️  Some examples failed validation. Review and improve them.');
      console.log();
    }
    
    console.log('Next steps:');
    console.log('1. Review the generated archetype file');
    console.log('2. Enhance examples if needed');
    console.log('3. Copy examples to archetype YAML file');
    console.log('4. Integrate into PROMPT.md');
    console.log();
    
  } catch (error) {
    console.error('❌ Workflow failed:', error);
    process.exit(1);
  }
}

main();
