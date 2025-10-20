/**
 * Script to update CaseGeneratorService.ts with AP system integration
 * Run with: node scripts/update-case-generator-ap.js
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'server', 'services', 'case', 'CaseGeneratorService.ts');

console.log('Reading CaseGeneratorService.ts...');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update imports (add to line 20)
console.log('Step 1: Updating imports...');
const importToAdd = `import type { APTopic, ActionPointsConfig } from '@/shared/types/Case';\nimport { generateDefaultAPTopics, validateAPTopics } from '../ap/APTopicGenerator';`;

// Find the line with "import type { Location as DiscoveryLocation }"
const importLine = "import type { Location as DiscoveryLocation } from '@/shared/types/Case';";
if (content.includes(importLine)) {
  content = content.replace(
    importLine,
    `import type { Location as DiscoveryLocation, APTopic, ActionPointsConfig } from '@/shared/types/Case';\nimport { generateDefaultAPTopics, validateAPTopics } from '../ap/APTopicGenerator';`
  );
  console.log('✓ Imports updated');
} else {
  console.error('✗ Could not find import line to update');
  process.exit(1);
}

// 2. Update caseData object to include actionPoints
console.log('Step 2: Adding actionPoints to caseData...');
const caseDataPattern = /(\s+evidence,\n\s+\/\/ 시네마틱)/;
const actionPointsConfig = `      evidence,
      // Action Points configuration
      actionPoints: {
        initial: 3,
        maximum: 12,
        costs: {
          quick: 1,
          thorough: 2,
          exhaustive: 3
        }
      },
      // 시네마틱`;

if (caseDataPattern.test(content)) {
  content = content.replace(caseDataPattern, actionPointsConfig);
  console.log('✓ actionPoints config added to caseData');
} else {
  console.error('✗ Could not find location to add actionPoints config');
  console.log('Please add manually after the evidence field in caseData object');
}

// 3. Update suspectDataList to include apTopics
console.log('Step 3: Adding apTopics to suspectDataList...');
const suspectDataPattern = /(const suspectDataList: SuspectData\[\] = suspectsWithImages\.map\(\(suspect, index\) => \(\{)/;
const suspectDataReplacement = `const suspectDataList: SuspectData[] = suspectsWithImages.map((suspect, index) => {
    // Generate AP topics for each suspect
    const apTopics = generateDefaultAPTopics(suspect.isGuilty);

    return {`;

if (suspectDataPattern.test(content)) {
  content = content.replace(suspectDataPattern, suspectDataReplacement);

  // Also need to close the map function properly and add apTopics field
  const suspectEndPattern = /(profileImageUrl: suspect\.profileImageUrl\n\s+}\)\);)/;
  const suspectEndReplacement = `profileImageUrl: suspect.profileImageUrl,
      apTopics  // AP topics for interrogation
    };
  });`;

  if (suspectEndPattern.test(content)) {
    content = content.replace(suspectEndPattern, suspectEndReplacement);
    console.log('✓ apTopics added to suspectDataList');
  } else {
    console.error('✗ Could not find end of suspectDataList mapping');
    console.log('Please add apTopics field manually to suspect objects');
  }
} else {
  console.error('✗ Could not find suspectDataList mapping');
  console.log('Please update suspectDataList mapping manually');
}

// Write the updated content
console.log('\nWriting updated file...');
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ CaseGeneratorService.ts updated successfully!');

console.log('\n📝 Manual verification recommended:');
console.log('1. Check that actionPoints config is in caseData object');
console.log('2. Check that apTopics is added to each suspect in suspectDataList');
console.log('3. Run TypeScript compiler to verify no type errors');
