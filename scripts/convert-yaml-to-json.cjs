#!/usr/bin/env node

/**
 * YAML to JSON Conversion Script - Phase 2 Implementation
 *
 * This script converts archetype YAML files to a single JSON file
 * that can be imported directly by ArchetypePrompts.ts at build time.
 *
 * This solves the production deployment issue where YAML files are not
 * included in the Devvit bundle.
 *
 * Run: node scripts/convert-yaml-to-json.js
 * Output: src/server/services/prompts/archetypes-data.json
 */

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

// Paths
const ARCHETYPES_DIR = path.join(__dirname, '..', 'src', 'server', 'services', 'prompts', 'archetypes');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'server', 'services', 'prompts', 'archetypes-data.json');

// Archetype files to convert
const ARCHETYPE_FILES = [
  'wealthy-heir.yaml',
  'loyal-butler.yaml',
  'talented-artist.yaml',
  'business-partner.yaml',
  'former-police-officer.yaml'
];

// English name mapping (for canonical keys)
const ENGLISH_NAMES = {
  'wealthy-heir.yaml': 'Wealthy Heir',
  'loyal-butler.yaml': 'Loyal Butler',
  'talented-artist.yaml': 'Talented Artist',
  'business-partner.yaml': 'Business Partner',
  'former-police-officer.yaml': 'Former Police Officer'
};

console.log('🔄 Converting YAML archetypes to JSON...\n');

const archetypesData = {};
let successCount = 0;
let errorCount = 0;

for (const filename of ARCHETYPE_FILES) {
  const filePath = path.join(ARCHETYPES_DIR, filename);
  const englishName = ENGLISH_NAMES[filename];

  try {
    console.log(`📖 Reading: ${filename}`);

    // Read YAML file
    const yamlContent = fs.readFileSync(filePath, 'utf8');

    // Parse YAML
    const yamlData = YAML.parse(yamlContent);

    // Validate required fields
    if (!yamlData.name || !yamlData.name.en || !yamlData.name.ko) {
      throw new Error('Missing required name fields (en/ko)');
    }

    if (!yamlData.definition) {
      throw new Error('Missing definition field');
    }

    if (!yamlData.personality || !Array.isArray(yamlData.personality)) {
      throw new Error('Missing or invalid personality field');
    }

    if (!yamlData.vocabulary || !yamlData.vocabulary.primary) {
      throw new Error('Missing vocabulary fields');
    }

    if (!yamlData.speechPatterns) {
      throw new Error('Missing speechPatterns field');
    }

    // Add to collection using English name as key
    archetypesData[englishName] = {
      name: yamlData.name,
      aliases: yamlData.aliases || [yamlData.name.en, yamlData.name.ko],
      definition: yamlData.definition,
      personality: yamlData.personality,
      background: yamlData.background || [],
      coreValues: yamlData.coreValues || [],
      greatestFears: yamlData.greatestFears || [],
      vocabulary: yamlData.vocabulary,
      speechPatterns: yamlData.speechPatterns
    };

    console.log(`   ✅ ${englishName} (${yamlData.name.ko})`);
    successCount++;

  } catch (error) {
    console.error(`   ❌ Failed to convert ${filename}: ${error.message}`);
    errorCount++;
  }
}

console.log(`\n📊 Conversion Summary:`);
console.log(`   ✅ Success: ${successCount}/${ARCHETYPE_FILES.length}`);
console.log(`   ❌ Errors: ${errorCount}`);

if (successCount === 0) {
  console.error('\n❌ No archetypes were successfully converted!');
  process.exit(1);
}

// Write combined JSON file
try {
  const jsonContent = JSON.stringify(archetypesData, null, 2);
  fs.writeFileSync(OUTPUT_FILE, jsonContent, 'utf8');

  const fileSize = (Buffer.byteLength(jsonContent, 'utf8') / 1024).toFixed(2);
  console.log(`\n💾 Written to: ${OUTPUT_FILE}`);
  console.log(`   Size: ${fileSize} KB`);
  console.log(`   Archetypes: ${Object.keys(archetypesData).length}`);

  // Calculate total data points for verification
  let totalVocab = 0;
  let totalPatterns = 0;

  for (const archetype of Object.values(archetypesData)) {
    totalVocab += archetype.vocabulary.primary.length + archetype.vocabulary.secondary.length;
    totalPatterns += Object.keys(archetype.speechPatterns).length;
  }

  console.log(`   Total vocabulary words: ${totalVocab}`);
  console.log(`   Total speech pattern states: ${totalPatterns}`);

  console.log('\n✅ Conversion complete!\n');

} catch (error) {
  console.error(`\n❌ Failed to write JSON file: ${error.message}`);
  process.exit(1);
}

// Verify the JSON can be parsed (sanity check)
try {
  const verifyContent = fs.readFileSync(OUTPUT_FILE, 'utf8');
  JSON.parse(verifyContent);
  console.log('✅ JSON file verified successfully\n');
} catch (error) {
  console.error(`❌ JSON verification failed: ${error.message}`);
  process.exit(1);
}
