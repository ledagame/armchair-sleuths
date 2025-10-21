import { KeywordIndexer } from './core/KeywordIndexer.js';
import { MetadataParser } from './core/MetadataParser.js';
import { SkillScanner } from './core/SkillScanner.js';
import { join } from 'path';

async function testIndexer() {
  console.log('🔍 Testing KeywordIndexer...\n');

  const scanner = new SkillScanner('./skills');
  const parser = new MetadataParser();
  const indexer = new KeywordIndexer();

  try {
    // Scan all skills
    console.log('📂 Scanning skills...');
    const skillFolders = await scanner.scanSkills();
    console.log(`Found ${skillFolders.length} skills\n`);

    // Parse and index all skills
    console.log('📋 Parsing and indexing skills...');
    const skills = [];

    for (const skillFolder of skillFolders) {
      const skillPath = join(process.cwd(), 'skills', skillFolder);
      const result = await parser.parseSkillMetadata(skillPath);

      if (result.success && result.data) {
        skills.push(result.data.metadata);
      }
    }

    indexer.buildIndex(skills);
    console.log(`Indexed ${skills.length} skills\n`);

    // Display index stats
    const stats = indexer.getStats();
    console.log('📊 Index Statistics:');
    console.log(`  Total keywords: ${stats.totalKeywords}`);
    console.log(`  Total skills: ${stats.totalSkills}`);
    console.log(
      `  Average keywords per skill: ${stats.averageKeywordsPerSkill.toFixed(1)}`
    );
    console.log();

    // Test exact search
    console.log('🔎 Test 1: Exact search for "improve prompt"');
    const exactResults = indexer.search('improve prompt', false);
    console.log(`Found ${exactResults.length} matches:`);
    exactResults.forEach((result) => {
      console.log(`  - ${result.skillName} (score: ${result.score.toFixed(2)})`);
    });
    console.log();

    // Test fuzzy search
    console.log('🔎 Test 2: Fuzzy search for "suspect"');
    const fuzzyResults = indexer.search('suspect', true);
    console.log(`Found ${fuzzyResults.length} matches:`);
    fuzzyResults.slice(0, 5).forEach((result) => {
      console.log(`  - ${result.skillName} (score: ${result.score.toFixed(2)})`);
    });
    console.log();

    // Test multiple keyword search
    console.log('🔎 Test 3: Multiple keywords ["mystery", "generate"]');
    const multiResults = indexer.searchMultiple(['mystery', 'generate'], true);
    console.log(`Found ${multiResults.length} matches:`);
    multiResults.slice(0, 5).forEach((result) => {
      console.log(
        `  - ${result.skillName} (score: ${result.score.toFixed(2)}, matches: ${result.matchCount})`
      );
    });
    console.log();

    // Test getting keywords for a skill
    console.log('🔎 Test 4: Get keywords for "suspect-ai-prompter"');
    const keywords = indexer.getKeywordsForSkill('suspect-ai-prompter');
    console.log(`Found ${keywords.length} keywords:`);
    console.log(`  ${keywords.slice(0, 10).join(', ')}...`);
    console.log();

    console.log('✨ Indexer test completed successfully!');
  } catch (error) {
    console.error('❌ Indexer test failed:', error);
    process.exit(1);
  }
}

testIndexer();
