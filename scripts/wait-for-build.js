#!/usr/bin/env node
/**
 * Smart build file watcher for DEVVIT development
 *
 * Waits for required build files to exist before starting DEVVIT playtest.
 * This prevents race conditions where DEVVIT starts before builds complete.
 *
 * Usage:
 *   node scripts/wait-for-build.js
 *
 * Exit codes:
 *   0 - All build files exist, ready to proceed
 *   1 - Timeout waiting for build files
 */

const fs = require('fs');
const path = require('path');

// Files that must exist before DEVVIT can start
const requiredFiles = [
  'dist/server/index.cjs',    // Server bundle (required by devvit.json)
  'dist/client/index.html'    // Client entry point (required by devvit.json)
];

// Configuration
const MAX_WAIT_MS = 120000;     // 2 minutes max wait
const CHECK_INTERVAL_MS = 500;  // Check every 500ms
const SHOW_PROGRESS = true;     // Show progress dots

// State
const startTime = Date.now();
let checkCount = 0;

/**
 * Check if a file exists and is readable
 */
function fileExists(filePath) {
  try {
    const absolutePath = path.join(__dirname, '..', filePath);
    return fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile();
  } catch (error) {
    return false;
  }
}

/**
 * Check if all required files exist
 */
function checkBuildFiles() {
  checkCount++;
  const elapsedMs = Date.now() - startTime;
  const elapsedSec = (elapsedMs / 1000).toFixed(1);

  // Check each file
  const fileStatus = requiredFiles.map(file => ({
    path: file,
    exists: fileExists(file)
  }));

  const allExist = fileStatus.every(f => f.exists);
  const missingFiles = fileStatus.filter(f => !f.exists).map(f => f.path);

  // Show progress (dots)
  if (SHOW_PROGRESS && checkCount % 2 === 0) {
    process.stdout.write('.');
  }

  if (allExist) {
    // Success!
    if (SHOW_PROGRESS) {
      console.log(''); // New line after dots
    }
    console.log(`✅ Build files ready after ${elapsedSec}s, starting DEVVIT...`);
    fileStatus.forEach(f => {
      const stats = fs.statSync(path.join(__dirname, '..', f.path));
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`   ✓ ${f.path} (${sizeKB} KB)`);
    });
    process.exit(0);
  }

  if (elapsedMs > MAX_WAIT_MS) {
    // Timeout
    if (SHOW_PROGRESS) {
      console.log(''); // New line after dots
    }
    console.error(`❌ Timeout after ${elapsedSec}s waiting for build files`);
    console.error(`   Missing files:`);
    missingFiles.forEach(file => {
      console.error(`   ✗ ${file}`);
    });
    console.error('');
    console.error('   Try running: npm run build');
    process.exit(1);
  }

  // Continue waiting
  setTimeout(checkBuildFiles, CHECK_INTERVAL_MS);
}

// Start
console.log('⏳ Waiting for build files...');
console.log(`   Required: ${requiredFiles.join(', ')}`);
console.log(`   Max wait: ${MAX_WAIT_MS / 1000}s`);
process.stdout.write('   Progress: ');

checkBuildFiles();
