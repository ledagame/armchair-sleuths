import { SkillDiscoveryService } from './core/SkillDiscoveryService.js';
import { join } from 'path';

/**
 * Test SkillDiscoveryService
 */
async function testDiscoveryService() {
  console.log('🧪 Testing SkillDiscoveryService...\n');

  const skillsDir = join(process.cwd(), 'skills');
  const service = new SkillDiscoveryService(skillsDir);

  // Setup event listeners
  service.on('discovery:started', (event) => {
    console.log('📡 Discovery started:', event);
  });

  service.on('discovery:scan-complete', (event) => {
    console.log('📂 Scan complete:', event);
  });

  service.on('skill:registered', (event) => {
    console.log('✅ Skill registered:', event);
  });

  service.on('skill:parse-error', (event) => {
    console.log('❌ Parse error:', event);
  });

  service.on('skill:validation-error', (event) => {
    console.log('⚠️  Validation error:', event);
  });

  service.on('skill:validation-warning', (event) => {
    console.log('⚠️  Validation warning:', event);
  });

  service.on('discovery:index-built', (event) => {
    console.log('🔍 Index built:', event);
  });

  service.on('discovery:complete', (event) => {
    console.log('🎉 Discovery complete:', event);
  });

  service.on('discovery:error', (event) => {
    console.log('💥 Discovery error:', event);
  });

  try {
    // Scan skills
    console.log('Starting skill scan...\n');
    const registry = await service.scanSkills();

    console.log('\n📊 Registry Summary:');
    console.log(`Total skills: ${registry.size}`);

    // Display all skills
    console.log('\n📋 Discovered Skills:');
    for (const [name, skill] of registry.entries()) {
      console.log(`\n  ${skill.status === 'active' ? '✅' : '❌'} ${name}`);
      console.log(`     Version: ${skill.metadata.version}`);
      console.log(`     Description: ${skill.metadata.description}`);
      console.log(`     Triggers: ${skill.metadata.triggers.join(', ')}`);
      console.log(`     Path: ${skill.path}`);
      console.log(`     Status: ${skill.status}`);
    }

    // Test keyword search
    console.log('\n🔍 Testing Keyword Search:');
    const searchQueries = ['suspect', 'prompt', 'mystery', 'image'];

    for (const query of searchQueries) {
      const results = service.searchSkills(query);
      console.log(`\n  Query: "${query}"`);
      if (results.length > 0) {
        results.forEach((result) => {
          if (result.skill) {
            console.log(
              `    - ${result.skill.metadata.name} (score: ${result.score.toFixed(2)})`
            );
          }
        });
      } else {
        console.log('    No results found');
      }
    }

    // Test indexer stats
    console.log('\n📈 Indexer Statistics:');
    const stats = service.getIndexer().getStats();
    console.log(`  Total keywords: ${stats.totalKeywords}`);
    console.log(`  Total skills: ${stats.totalSkills}`);
    console.log(
      `  Average keywords per skill: ${stats.averageKeywordsPerSkill.toFixed(1)}`
    );

    // Test validation
    console.log('\n🔍 Testing Skill Validation:');
    const allSkills = service.getAllSkills();
    if (allSkills.length > 0) {
      const firstSkill = allSkills[0];
      console.log(`\n  Validating: ${firstSkill.metadata.name}`);
      const validationResult = await service.validateSkill(firstSkill.path);
      console.log(`  Valid: ${validationResult.valid}`);
      console.log(`  Errors: ${validationResult.errors.length}`);
      console.log(`  Warnings: ${validationResult.warnings.length}`);

      if (validationResult.errors.length > 0) {
        console.log('\n  Errors:');
        validationResult.errors.forEach((error) => {
          console.log(`    - ${error.field}: ${error.message}`);
        });
      }

      if (validationResult.warnings.length > 0) {
        console.log('\n  Warnings:');
        validationResult.warnings.forEach((warning) => {
          console.log(`    - ${warning.field}: ${warning.message}`);
        });
      }
    }

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testDiscoveryService();

