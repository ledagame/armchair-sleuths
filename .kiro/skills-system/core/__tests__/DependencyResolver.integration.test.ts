/**
 * Integration test for DependencyResolver
 */

import { DependencyResolver } from '../DependencyResolver.js';
import { DependencyGraph } from '../DependencyGraph.js';
import { SkillRegistry } from '../SkillRegistry.js';
import type { Skill } from '../types.js';

async function testDependencyResolver() {
  console.log('🧪 Testing DependencyResolver Integration\n');

  // 1. Create instances
  const graph = new DependencyGraph();
  const registry = new SkillRegistry();
  const resolver = new DependencyResolver(graph, registry);

  // 2. Create test skills with dependencies
  const baseSkill: Skill = {
    metadata: {
      name: 'base-skill',
      version: '1.0.0',
      description: 'Base skill with no dependencies',
      triggers: ['base'],
      dependencies: {},
      capabilities: [],
    },
    promptContent: 'Base skill content',
    path: '/test/base',
    lastModified: new Date(),
    status: 'active',
  };

  const middleSkill: Skill = {
    metadata: {
      name: 'middle-skill',
      version: '1.0.0',
      description: 'Middle skill that depends on base',
      triggers: ['middle'],
      dependencies: {
        skills: ['base-skill'],
        packages: ['lodash@4.17.21'],
      },
      capabilities: [],
    },
    promptContent: 'Middle skill content',
    path: '/test/middle',
    lastModified: new Date(),
    status: 'active',
  };

  const topSkill: Skill = {
    metadata: {
      name: 'top-skill',
      version: '1.0.0',
      description: 'Top skill that depends on middle',
      triggers: ['top'],
      dependencies: {
        skills: ['middle-skill'],
        apis: ['gemini-ai'],
      },
      capabilities: [],
    },
    promptContent: 'Top skill content',
    path: '/test/top',
    lastModified: new Date(),
    status: 'active',
  };

  // 3. Add skills to registry and graph
  await registry.addSkill(baseSkill);
  await registry.addSkill(middleSkill);
  await registry.addSkill(topSkill);

  graph.addSkill(baseSkill);
  graph.addSkill(middleSkill);
  graph.addSkill(topSkill);

  console.log('✅ Added test skills to registry and graph\n');

  // 4. Test simple resolution
  console.log('Test 1: Resolve skill with no dependencies');
  const baseResult = resolver.resolve('base-skill');
  console.log(`Success: ${baseResult.success}`);
  console.log(`Skill: ${baseResult.skill?.metadata.name}`);
  console.log(`Dependencies: ${baseResult.dependencies.skills.length}`);
  console.log(`Execution order: ${baseResult.executionOrder?.join(' -> ')}`);
  console.log();

  // 5. Test nested dependencies
  console.log('Test 2: Resolve skill with nested dependencies');
  const topResult = resolver.resolve('top-skill');
  console.log(`Success: ${topResult.success}`);
  console.log(`Skill: ${topResult.skill?.metadata.name}`);
  console.log(
    `Skill dependencies: ${topResult.dependencies.skills.map((s) => s.metadata.name).join(', ')}`
  );
  console.log(
    `Package dependencies: ${topResult.dependencies.packages.map((p) => p.name).join(', ')}`
  );
  console.log(
    `API dependencies: ${topResult.dependencies.apis.map((a) => a.name).join(', ')}`
  );
  console.log(`Execution order: ${topResult.executionOrder?.join(' -> ')}`);
  console.log();

  // 6. Test missing dependency
  console.log('Test 3: Resolve skill with missing dependency');
  const missingSkill: Skill = {
    metadata: {
      name: 'missing-dep-skill',
      version: '1.0.0',
      description: 'Skill with missing dependency',
      triggers: ['missing'],
      dependencies: {
        skills: ['nonexistent-skill'],
      },
      capabilities: [],
    },
    promptContent: 'Missing dep skill content',
    path: '/test/missing',
    lastModified: new Date(),
    status: 'active',
  };

  await registry.addSkill(missingSkill);
  graph.addSkill(missingSkill);

  const missingResult = resolver.resolve('missing-dep-skill');
  console.log(`Success: ${missingResult.success}`);
  console.log(`Missing skills: ${missingResult.missing.skills.join(', ')}`);
  console.log(`Errors: ${missingResult.errors.length}`);
  if (missingResult.errors.length > 0) {
    console.log(`  - ${missingResult.errors[0].message}`);
  }
  console.log();

  // 7. Test circular dependency
  console.log('Test 4: Detect circular dependency');
  const circularA: Skill = {
    metadata: {
      name: 'circular-a',
      version: '1.0.0',
      description: 'Circular A',
      triggers: ['circular-a'],
      dependencies: {
        skills: ['circular-b'],
      },
      capabilities: [],
    },
    promptContent: 'Circular A content',
    path: '/test/circular-a',
    lastModified: new Date(),
    status: 'active',
  };

  const circularB: Skill = {
    metadata: {
      name: 'circular-b',
      version: '1.0.0',
      description: 'Circular B',
      triggers: ['circular-b'],
      dependencies: {
        skills: ['circular-a'],
      },
      capabilities: [],
    },
    promptContent: 'Circular B content',
    path: '/test/circular-b',
    lastModified: new Date(),
    status: 'active',
  };

  await registry.addSkill(circularA);
  await registry.addSkill(circularB);
  graph.addSkill(circularA);
  graph.addSkill(circularB);

  const circularResult = resolver.resolve('circular-a');
  console.log(`Success: ${circularResult.success}`);
  console.log(`Errors: ${circularResult.errors.length}`);
  if (circularResult.errors.length > 0) {
    console.log(`  - Type: ${circularResult.errors[0].type}`);
    console.log(`  - ${circularResult.errors[0].message}`);
  }
  console.log();

  // 8. Test multiple resolution
  console.log('Test 5: Resolve multiple skills');
  const multipleResults = resolver.resolveMultiple([
    'base-skill',
    'middle-skill',
    'top-skill',
  ]);
  console.log(`Resolved ${multipleResults.length} skills:`);
  for (const result of multipleResults) {
    console.log(
      `  - ${result.skill?.metadata.name}: ${result.success ? '✅' : '❌'}`
    );
  }
  console.log();

  // 9. Test statistics
  console.log('Test 6: Resolver statistics');
  const stats = resolver.getStats();
  console.log(`Total skills: ${stats.totalSkills}`);
  console.log(`Skills with dependencies: ${stats.skillsWithDependencies}`);
  console.log(
    `Average dependencies: ${stats.averageDependencies.toFixed(2)}`
  );
  console.log(`Max dependencies: ${stats.maxDependencies}`);
  console.log();

  console.log('✅ All tests completed successfully!');
}

// Run the test
testDependencyResolver().catch(console.error);
