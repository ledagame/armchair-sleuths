/**
 * 통합 검증 스크립트
 *
 * 목적: devvit.json 검증 + 빌드 산출물 검증을 한 번에 실행
 * 사용: npm run validate:all 또는 node scripts/validate-all.js
 *
 * 관련 문서: docs/LESSONS_LEARNED_devvit_json_configuration.md
 */

const { validateDevvitConfig } = require('./validate-devvit-config');
const { verifyBuildOutputs } = require('./verify-build-outputs');

async function validateAll() {
  console.log('🚀 Running all validations...\n');
  console.log('='.repeat(60));

  let allPassed = true;

  // 1. devvit.json 검증
  console.log('\n1️⃣  Validating devvit.json');
  console.log('-'.repeat(60));
  if (!validateDevvitConfig()) {
    allPassed = false;
  }

  // 2. 빌드 산출물 검증
  console.log('2️⃣  Verifying build outputs');
  console.log('-'.repeat(60));
  if (!verifyBuildOutputs()) {
    allPassed = false;
  }

  // 3. 최종 결과
  console.log('='.repeat(60));
  if (allPassed) {
    console.log('✅ All validations passed!');
    console.log('\nYou can safely run:');
    console.log('  devvit upload');
    console.log('');
  } else {
    console.log('❌ Some validations failed');
    console.log('\nPlease fix the errors above before uploading.');
    console.log('See docs/LESSONS_LEARNED_devvit_json_configuration.md for help.');
    console.log('');
  }
  console.log('='.repeat(60) + '\n');

  return allPassed;
}

if (require.main === module) {
  validateAll().then(isValid => process.exit(isValid ? 0 : 1));
}

module.exports = { validateAll };
