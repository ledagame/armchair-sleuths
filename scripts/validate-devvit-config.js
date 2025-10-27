/**
 * devvit.json 설정 파일 검증 스크립트
 *
 * 목적: devvit.json의 구조가 올바른지 검증하고 빌드 산출물이 존재하는지 확인
 * 사용: npm run validate:config 또는 node scripts/validate-devvit-config.js
 *
 * 관련 문서: docs/LESSONS_LEARNED_devvit_json_configuration.md
 */

const fs = require('fs');
const path = require('path');

function validateDevvitConfig() {
  console.log('🔍 Validating devvit.json...\n');

  // 1. 파일 존재 확인
  if (!fs.existsSync('devvit.json')) {
    console.error('❌ devvit.json not found');
    return false;
  }

  // 2. JSON 파싱
  let config;
  try {
    config = JSON.parse(fs.readFileSync('devvit.json', 'utf8'));
  } catch (error) {
    console.error('❌ Invalid JSON syntax:', error.message);
    return false;
  }

  // 3. 필수 필드 검증
  const errors = [];

  if (!config.name) {
    errors.push('Missing required field: name');
  }

  if (!config.post) {
    errors.push('Missing required field: post');
  } else {
    if (!config.post.dir) {
      errors.push('Missing required field: post.dir');
    }
    if (!config.post.entrypoints) {
      errors.push('Missing required field: post.entrypoints');
    } else if (!config.post.entrypoints.default) {
      errors.push('Missing required field: post.entrypoints.default');
    } else if (!config.post.entrypoints.default.entry) {
      errors.push('Missing required field: post.entrypoints.default.entry');
    }
  }

  if (config.server) {
    if (!config.server.dir && !config.server.entry) {
      errors.push('server section requires at least one of: dir, entry');
    }
  }

  // 4. 빌드 산출물 검증 (경고만 출력)
  const warnings = [];

  if (config.post && config.post.dir && config.post.entrypoints?.default?.entry) {
    const entryPath = path.join(
      config.post.dir,
      config.post.entrypoints.default.entry
    );

    if (!fs.existsSync(entryPath)) {
      warnings.push(`Entry point does not exist: ${entryPath}`);
      warnings.push(`  → Run 'npm run build:client' to create this file`);
    }
  }

  // 5. 결과 출력
  if (errors.length > 0) {
    console.error('❌ Validation failed:\n');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('');
    return false;
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Warnings:\n');
    warnings.forEach(warning => console.warn(`  ${warning}`));
    console.warn('');
  }

  console.log('✅ devvit.json is valid\n');
  console.log('Configuration:');
  console.log(`  - name: ${config.name}`);
  if (config.post) {
    console.log(`  - post.dir: ${config.post.dir}`);
    console.log(`  - post.entrypoints.default.entry: ${config.post.entrypoints.default.entry}`);
  }
  if (config.server) {
    console.log(`  - server.dir: ${config.server.dir}`);
    console.log(`  - server.entry: ${config.server.entry}`);
  }
  console.log('');

  return true;
}

// 스크립트로 실행될 때
if (require.main === module) {
  const isValid = validateDevvitConfig();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateDevvitConfig };
