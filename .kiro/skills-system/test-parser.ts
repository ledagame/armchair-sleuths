import { MetadataParser } from './core/MetadataParser.js';
import { join } from 'path';

async function testParser() {
  console.log('🔍 Testing MetadataParser...\n');

  const parser = new MetadataParser();

  // Test with suspect-ai-prompter skill
  const skillPath = join(process.cwd(), 'skills', 'suspect-ai-prompter');

  console.log(`📂 Parsing skill: ${skillPath}\n`);

  try {
    // Parse complete skill metadata
    const result = await parser.parseSkillMetadata(skillPath);

    if (!result.success) {
      console.error('❌ Failed to parse skill:', result.error);
      process.exit(1);
    }

    const { metadata, promptContent } = result.data!;

    console.log('✅ Successfully parsed skill metadata:\n');
    console.log('📋 Basic Info:');
    console.log(`  Name: ${metadata.name}`);
    console.log(`  Version: ${metadata.version}`);
    console.log(`  Author: ${metadata.author}`);
    console.log(`  License: ${metadata.license}`);

    console.log('\n🎯 Triggers:');
    metadata.triggers.forEach((trigger) => {
      console.log(`  - ${trigger}`);
    });

    console.log('\n🔗 Dependencies:');
    console.log(`  Skills: ${metadata.dependencies.skills?.join(', ') || 'none'}`);
    console.log(`  APIs: ${metadata.dependencies.apis?.join(', ') || 'none'}`);
    console.log(`  Packages: ${metadata.dependencies.packages?.join(', ') || 'none'}`);

    console.log('\n⚡ Capabilities:');
    metadata.capabilities.forEach((cap) => {
      console.log(`  - ${cap.name}: ${cap.description}`);
      if (cap.usage) {
        console.log(`    Usage: ${cap.usage}`);
      }
    });

    console.log('\n📝 Prompt Content:');
    console.log(`  Length: ${promptContent.length} characters`);
    console.log(`  First 100 chars: ${promptContent.substring(0, 100)}...`);

    console.log('\n✨ Parser test completed successfully!');
  } catch (error) {
    console.error('❌ Parser test failed:', error);
    process.exit(1);
  }
}

testParser();
