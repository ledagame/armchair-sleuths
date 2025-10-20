#!/usr/bin/env node

/**
 * Archetype Data Consistency Validation Script - Phase 3 Implementation
 *
 * This script validates that archetype data is consistent across the system:
 * 1. Korean names in CaseElementLibrary match YAML files
 * 2. All expected archetypes are present
 * 3. JSON file exists and is valid
 * 4. All required fields are present
 *
 * Run: node scripts/validate-archetype-consistency.cjs
 * Should be run in CI/CD pipeline and pre-commit hooks
 */

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

console.log('🔍 Validating Archetype Data Consistency...\n');

// Paths
const CASE_LIBRARY_PATH = path.join(__dirname, '..', 'src', 'server', 'services', 'case', 'CaseElementLibrary.ts');
const ARCHETYPES_DIR = path.join(__dirname, '..', 'src', 'server', 'services', 'prompts', 'archetypes');
const JSON_FILE_PATH = path.join(__dirname, '..', 'src', 'server', 'services', 'prompts', 'archetypes-data.json');

// Expected archetypes
const EXPECTED_ARCHETYPES = [
  { english: 'Wealthy Heir', file: 'wealthy-heir.yaml' },
  { english: 'Loyal Butler', file: 'loyal-butler.yaml' },
  { english: 'Talented Artist', file: 'talented-artist.yaml' },
  { english: 'Business Partner', file: 'business-partner.yaml' },
  { english: 'Former Police Officer', file: 'former-police-officer.yaml' }
];

let totalErrors = 0;
let totalWarnings = 0;

// ===== TEST 1: Check CaseElementLibrary.ts Korean names =====
console.log('📝 Test 1: Validating CaseElementLibrary Korean names...');

try {
  const caseLibContent = fs.readFileSync(CASE_LIBRARY_PATH, 'utf8');

  // Extract Korean archetype names from CaseElementLibrary
  const archetypeRegex = /archetype:\s*['"]([^'"]+)['"]/g;
  const foundArchetypes = [];
  let match;

  while ((match = archetypeRegex.exec(caseLibContent)) !== null) {
    foundArchetypes.push(match[1]);
  }

  if (foundArchetypes.length !== EXPECTED_ARCHETYPES.length) {
    console.error(`   ❌ Expected ${EXPECTED_ARCHETYPES.length} archetypes, found ${foundArchetypes.length}`);
    totalErrors++;
  } else {
    console.log(`   ✅ Found all ${foundArchetypes.length} archetypes in CaseElementLibrary`);
  }

  // Now check if they match YAML files
  const yamlKoreanNames = {};

  for (const archetype of EXPECTED_ARCHETYPES) {
    const yamlPath = path.join(ARCHETYPES_DIR, archetype.file);
    const yamlContent = fs.readFileSync(yamlPath, 'utf8');
    const yamlData = YAML.parse(yamlContent);

    if (yamlData.name && yamlData.name.ko) {
      yamlKoreanNames[archetype.english] = yamlData.name.ko;
    }
  }

  // Match against found archetypes
  const expectedKorean = Object.values(yamlKoreanNames);
  const mismatches = [];

  for (const found of foundArchetypes) {
    if (!expectedKorean.includes(found)) {
      mismatches.push(found);
    }
  }

  if (mismatches.length > 0) {
    console.error(`   ❌ Mismatched Korean names in CaseElementLibrary:`);
    for (const mismatch of mismatches) {
      console.error(`      - "${mismatch}" not found in YAML files`);
    }
    console.error(`   Expected names from YAML:`, expectedKorean);
    totalErrors++;
  } else {
    console.log(`   ✅ All Korean names match YAML files`);
  }

} catch (error) {
  console.error(`   ❌ Error reading CaseElementLibrary: ${error.message}`);
  totalErrors++;
}

// ===== TEST 2: Validate YAML Files =====
console.log('\n📝 Test 2: Validating YAML files...');

for (const archetype of EXPECTED_ARCHETYPES) {
  const yamlPath = path.join(ARCHETYPES_DIR, archetype.file);

  try {
    if (!fs.existsSync(yamlPath)) {
      console.error(`   ❌ ${archetype.file} not found`);
      totalErrors++;
      continue;
    }

    const yamlContent = fs.readFileSync(yamlPath, 'utf8');
    const yamlData = YAML.parse(yamlContent);

    // Check required fields
    const requiredFields = ['name', 'definition', 'personality', 'vocabulary', 'speechPatterns'];
    const missingFields = [];

    for (const field of requiredFields) {
      if (!yamlData[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      console.error(`   ❌ ${archetype.file} missing fields: ${missingFields.join(', ')}`);
      totalErrors++;
    } else {
      // Check name structure
      if (!yamlData.name.en || !yamlData.name.ko) {
        console.error(`   ❌ ${archetype.file} missing name.en or name.ko`);
        totalErrors++;
      } else if (yamlData.name.en !== archetype.english) {
        console.error(`   ❌ ${archetype.file} name.en mismatch: "${yamlData.name.en}" !== "${archetype.english}"`);
        totalErrors++;
      } else {
        console.log(`   ✅ ${archetype.english} (${yamlData.name.ko})`);
      }
    }

  } catch (error) {
    console.error(`   ❌ Error parsing ${archetype.file}: ${error.message}`);
    totalErrors++;
  }
}

// ===== TEST 3: Validate JSON File =====
console.log('\n📝 Test 3: Validating generated JSON file...');

try {
  if (!fs.existsSync(JSON_FILE_PATH)) {
    console.error(`   ❌ archetypes-data.json not found`);
    console.error(`   ℹ️  Run: npm run prebuild:server`);
    totalErrors++;
  } else {
    const jsonContent = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const jsonData = JSON.parse(jsonContent);

    const jsonArchetypes = Object.keys(jsonData);

    if (jsonArchetypes.length !== EXPECTED_ARCHETYPES.length) {
      console.error(`   ❌ JSON has ${jsonArchetypes.length} archetypes, expected ${EXPECTED_ARCHETYPES.length}`);
      totalErrors++;
    }

    // Verify all expected archetypes are present
    for (const archetype of EXPECTED_ARCHETYPES) {
      if (!jsonData[archetype.english]) {
        console.error(`   ❌ Missing ${archetype.english} in JSON`);
        totalErrors++;
      }
    }

    if (totalErrors === 0) {
      const fileSize = (Buffer.byteLength(jsonContent, 'utf8') / 1024).toFixed(2);
      console.log(`   ✅ JSON file valid (${fileSize} KB, ${jsonArchetypes.length} archetypes)`);
    }
  }

} catch (error) {
  console.error(`   ❌ Error reading JSON file: ${error.message}`);
  totalErrors++;
}

// ===== TEST 4: Cross-reference Consistency =====
console.log('\n📝 Test 4: Cross-referencing all data sources...');

try {
  // Read all three data sources
  const caseLibContent = fs.readFileSync(CASE_LIBRARY_PATH, 'utf8');
  const jsonData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf8'));

  for (const archetype of EXPECTED_ARCHETYPES) {
    const yamlPath = path.join(ARCHETYPES_DIR, archetype.file);
    const yamlContent = fs.readFileSync(yamlPath, 'utf8');
    const yamlData = YAML.parse(yamlContent);

    const koreanName = yamlData.name.ko;

    // Check if Korean name exists in CaseElementLibrary
    if (!caseLibContent.includes(koreanName)) {
      console.error(`   ❌ Korean name "${koreanName}" not found in CaseElementLibrary`);
      totalErrors++;
    } else {
      console.log(`   ✅ ${archetype.english}: "${koreanName}" consistent across all sources`);
    }
  }

} catch (error) {
  console.error(`   ❌ Error during cross-reference: ${error.message}`);
  totalErrors++;
}

// ===== Summary =====
console.log('\n' + '='.repeat(60));
console.log('📊 Validation Summary:');
console.log('='.repeat(60));

if (totalErrors === 0 && totalWarnings === 0) {
  console.log('✅ All validation checks passed!');
  console.log('✨ Archetype data is consistent across the system\n');
  process.exit(0);
} else {
  console.log(`❌ Total Errors: ${totalErrors}`);
  console.log(`⚠️  Total Warnings: ${totalWarnings}`);
  console.log('\n❌ Validation failed! Please fix the errors above.\n');
  process.exit(1);
}
