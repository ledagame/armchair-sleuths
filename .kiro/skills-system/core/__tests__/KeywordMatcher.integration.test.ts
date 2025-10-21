/**
 * Integration test for KeywordMatcher
 * 
 * This test demonstrates how KeywordMatcher works with real skill data
 */

import { KeywordMatcher } from '../KeywordMatcher.js';
import { KeywordIndexer } from '../KeywordIndexer.js';
import { SkillRegistry } from '../SkillRegistry.js';
import type { Skill } from '../types.js';

// Example: Create a simple test
async function testKeywordMatcher() {
  console.log('🧪 Testing KeywordMatcher Integration\n');

  // 1. Create instances
  const indexer = new KeywordIndexer();
  const registry = new SkillRegistry();
  const matcher = new KeywordMatcher(indexer, registry);

  // 2. Add test skills
  const testSkills: Skill[] = [
    {
      metadata: {
        name: 'suspect-ai-prompter',
        version: '1.0.0',
        description: 'Optimize AI suspect conversation prompts',
        triggers: ['improve prompt', 'optimize ai', 'test responses'],
        dependencies: {},
        capabilities: [],
      },
      promptContent: 'Test prompt content',
      path: '/test/path',
      lastModified: new Date(),
      status: 'active',
    },
    {
      metadata: {
        name: 'mystery-case-generator',
        version: '2.0.0',
        description: 'Generate mystery cases',
        triggers: ['generate case', 'create mystery', 'new case'],
        dependencies: {},
        capabilities: [],
      },
      promptContent: 'Test prompt content',
      path: '/test/path',
      lastModified: new Date(),
      status: 'active',
    },
  ];

  for (const skill of testSkills) {
    await registry.addSkill(skill);
    indexer.addSkill(skill.metadata);
  }

  console.log('✅ Added test skills to registry and indexer\n');

  // 3. Test exact match
  console.log('Test 1: Exact match');
  const exactResults = matcher.match('improve prompt');
  console.log(`Found ${exactResults.length} results:`);
  for (const result of exactResults) {
    console.log(
      `  - ${result.skill.metadata.name} (score: ${result.score.toFixed(2)})`
    );
  }
  console.log();

  // 4. Test fuzzy match
  console.log('Test 2: Fuzzy match');
  const fuzzyResults = matcher.match('improve prompts', { fuzzy: true });
  console.log(`Found ${fuzzyResults.length} results:`);
  for (const result of fuzzyResults) {
    console.log(
      `  - ${result.skill.metadata.name} (score: ${result.score.toFixed(2)})`
    );
  }
  console.log();

  // 5. Test natural language
  console.log('Test 3: Natural language input');
  const nlResults = matcher.match(
    'I want to improve the prompt for my AI assistant'
  );
  console.log(`Found ${nlResults.length} results:`);
  for (const result of nlResults) {
    console.log(
      `  - ${result.skill.metadata.name} (score: ${result.score.toFixed(2)})`
    );
    console.log(`    Matched keywords: ${result.matchedKeywords.join(', ')}`);
  }
  console.log();

  // 6. Test trigger detection
  console.log('Test 4: Trigger detection');
  const triggers = matcher.detectTriggers(
    'I want to generate a new mystery case'
  );
  console.log(`Detected triggers: ${triggers.join(', ')}`);
  console.log();

  // 7. Test statistics
  console.log('Test 5: Matcher statistics');
  const stats = matcher.getStats();
  console.log(`Total skills: ${stats.totalSkills}`);
  console.log(`Active skills: ${stats.activeSkills}`);
  console.log(`Total keywords: ${stats.totalKeywords}`);
  console.log(
    `Average keywords per skill: ${stats.averageKeywordsPerSkill.toFixed(2)}`
  );
  console.log();

  console.log('✅ All tests completed successfully!');
}

// Run the test
testKeywordMatcher().catch(console.error);
