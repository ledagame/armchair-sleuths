import { SkillValidator } from './core/SkillValidator.js';
import { MetadataParser } from './core/MetadataParser.js';
import { join } from 'path';

async function testValidator() {
  console.log('🔍 Testing SkillValidator...\n');

  const validator = new SkillValidator();
  const parser = new MetadataParser();

  // Test with suspect-ai-prompter skill
  const skillPath = join(process.cwd(), 'skills', 'suspect-ai-prompter');

  console.log(`📂 Validating skill: ${skillPath}\n`);

  try {
    // Parse skill metadata first
    const parseResult = await parser.parseSkillMetadata(skillPath);

    if (!parseResult.success) {
      console.error('❌ Failed to parse skill:', parseResult.error);
      process.exit(1);
    }

    const { metadata } = parseResult.data!;

    // Validate the skill
    const validationResult = await validator.validateSkill(skillPath, metadata);

    // Display results
    console.log('📊 Validation Results:\n');
    console.log(validator.getSummary(validationResult));
    console.log();

    if (validationResult.errors.length > 0) {
      console.log('❌ Errors:');
      validationResult.errors.forEach((error) => {
        console.log(`  - [${error.field}] ${error.message}`);
      });
      console.log();
    }

    if (validationResult.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      validationResult.warnings.forEach((warning) => {
        console.log(`  - [${warning.field}] ${warning.message}`);
      });
      console.log();
    }

    // Test quick validation
    const quickValid = validator.quickValidate(metadata);
    console.log(`⚡ Quick validation: ${quickValid ? '✅ PASS' : '❌ FAIL'}`);

    console.log('\n✨ Validator test completed successfully!');
  } catch (error) {
    console.error('❌ Validator test failed:', error);
    process.exit(1);
  }
}

testValidator();
