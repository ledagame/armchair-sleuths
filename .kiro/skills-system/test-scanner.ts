import { SkillScanner } from './core/SkillScanner.js';

async function testScanner() {
  console.log('🔍 Testing SkillScanner...\n');

  const scanner = new SkillScanner('./skills');

  // Listen to events
  scanner.on('skill:discovered', (data) => {
    console.log('✅ Skill discovered:', data.name);
  });

  scanner.on('scan:complete', (data) => {
    console.log(`\n📊 Scan complete: ${data.count} skills found`);
    console.log('Skills:', data.skills.join(', '));
  });

  scanner.on('scan:error', (data) => {
    console.error('❌ Scan error:', data.error);
  });

  // Scan skills
  try {
    const skills = await scanner.scanSkills();
    console.log('\n✨ Scanner test completed successfully!');
    console.log(`Found ${skills.length} valid skill folders`);
  } catch (error) {
    console.error('❌ Scanner test failed:', error);
    process.exit(1);
  }
}

testScanner();
