/**
 * 빌드 산출물 검증 스크립트
 *
 * 목적: 빌드 후 생성되어야 할 모든 파일이 존재하는지 검증
 * 사용: npm run verify:build 또는 node scripts/verify-build-outputs.js
 *
 * 관련 문서: docs/LESSONS_LEARNED_devvit_json_configuration.md
 */

const fs = require('fs');
const path = require('path');

function verifyBuildOutputs() {
  console.log('🔍 Verifying build outputs...\n');

  const requiredFiles = [
    { path: 'dist/client/index.html', description: 'Web view entry point' },
    { path: 'dist/client/index.js', description: 'Client JavaScript bundle' },
    { path: 'dist/client/index.css', description: 'Client styles' },
    { path: 'dist/server/index.cjs', description: 'Server bundle' },
    { path: 'dist/main.js', description: 'Devvit configuration bundle' }
  ];

  let allExist = true;
  const missingFiles = [];

  requiredFiles.forEach(file => {
    const exists = fs.existsSync(file.path);
    const status = exists ? '✅' : '❌';
    let size = 'N/A';

    if (exists) {
      const stats = fs.statSync(file.path);
      size = `${(stats.size / 1024).toFixed(2)} KB`;
    } else {
      missingFiles.push(file.path);
    }

    console.log(`${status} ${file.path.padEnd(30)} ${size.padStart(10)} - ${file.description}`);

    if (!exists) {
      allExist = false;
    }
  });

  console.log('');

  if (!allExist) {
    console.error('❌ Some build outputs are missing:');
    missingFiles.forEach(file => console.error(`  - ${file}`));
    console.error('\nPlease run the following commands:');
    console.error('  npm run build:client  # For client files');
    console.error('  npm run build:server  # For server files');
    console.error('  npm run build:main    # For main.js');
    console.error('  npm run build:all     # For all builds');
    console.error('');
    return false;
  }

  console.log('✅ All build outputs verified');
  console.log('');
  return true;
}

if (require.main === module) {
  const isValid = verifyBuildOutputs();
  process.exit(isValid ? 0 : 1);
}

module.exports = { verifyBuildOutputs };
