/**
 * test-profile-image-fix.ts
 *
 * Unit test to verify the profile image generation fix handles array length mismatches
 */

interface Suspect {
  name: string;
  background: string;
  personality: string;
  isGuilty: boolean;
}

interface Archetype {
  archetype: string;
}

/**
 * Simulates the fixed generateSuspectProfileImages logic
 */
function testArrayNormalization(
  suspects: Suspect[],
  archetypes: Archetype[]
): { normalized: Suspect[]; warnings: string[] } {
  const warnings: string[] = [];

  // 🔧 FIX: Validate array lengths match BEFORE processing
  if (suspects.length !== archetypes.length) {
    warnings.push(
      `⚠️  Array length mismatch detected:\n` +
      `   suspects=${suspects.length}, archetypes=${archetypes.length}\n` +
      `   Normalizing to minimum length to prevent undefined access`
    );
  }

  // 🔧 FIX: Use minimum length to prevent out-of-bounds access
  const minLength = Math.min(suspects.length, archetypes.length);
  const normalizedSuspects = suspects.slice(0, minLength);

  // 🔧 FIX: Log if we had to truncate
  if (normalizedSuspects.length < suspects.length) {
    warnings.push(
      `⚠️  Truncated ${suspects.length - normalizedSuspects.length} suspect(s) ` +
      `to match archetype count (${archetypes.length})`
    );
  }

  return {
    normalized: normalizedSuspects,
    warnings
  };
}

/**
 * Test runner
 */
function runTests() {
  console.log('🧪 Testing Profile Image Generation Fix\n');
  console.log('='.repeat(60));

  let passCount = 0;
  let failCount = 0;

  // Test 1: Normal case - arrays match
  console.log('\n📋 Test 1: Arrays match (3 suspects, 3 archetypes)');
  try {
    const suspects: Suspect[] = [
      { name: 'S1', background: 'bg1', personality: 'p1', isGuilty: false },
      { name: 'S2', background: 'bg2', personality: 'p2', isGuilty: false },
      { name: 'S3', background: 'bg3', personality: 'p3', isGuilty: true }
    ];
    const archetypes: Archetype[] = [
      { archetype: 'A1' },
      { archetype: 'A2' },
      { archetype: 'A3' }
    ];

    const result = testArrayNormalization(suspects, archetypes);

    if (result.normalized.length === 3 && result.warnings.length === 0) {
      console.log('✅ PASS: No warnings, all 3 suspects processed');
      passCount++;
    } else {
      console.log(`❌ FAIL: Expected 3 suspects, 0 warnings. Got ${result.normalized.length} suspects, ${result.warnings.length} warnings`);
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error);
    failCount++;
  }

  // Test 2: Mismatch case - 4 suspects, 3 archetypes (THE BUG SCENARIO)
  console.log('\n📋 Test 2: Mismatch (4 suspects, 3 archetypes) - THE BUG');
  try {
    const suspects: Suspect[] = [
      { name: 'S1', background: 'bg1', personality: 'p1', isGuilty: false },
      { name: 'S2', background: 'bg2', personality: 'p2', isGuilty: false },
      { name: 'S3', background: 'bg3', personality: 'p3', isGuilty: false },
      { name: 'S4', background: 'bg4', personality: 'p4', isGuilty: true }
    ];
    const archetypes: Archetype[] = [
      { archetype: 'A1' },
      { archetype: 'A2' },
      { archetype: 'A3' }
    ];

    const result = testArrayNormalization(suspects, archetypes);

    if (
      result.normalized.length === 3 &&
      result.warnings.length === 2 &&
      result.normalized[0].name === 'S1' &&
      result.normalized[2].name === 'S3' &&
      !result.normalized.find(s => s.name === 'S4') // S4 should be truncated
    ) {
      console.log('✅ PASS: Truncated to 3 suspects, 2 warnings logged');
      console.log('   Processed suspects:', result.normalized.map(s => s.name).join(', '));
      console.log('   Warnings:', result.warnings.length);
      passCount++;
    } else {
      console.log(`❌ FAIL: Expected 3 suspects [S1,S2,S3], 2 warnings. Got ${result.normalized.length} suspects, ${result.warnings.length} warnings`);
      console.log('   Processed suspects:', result.normalized.map(s => s.name).join(', '));
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error);
    failCount++;
  }

  // Test 3: Reverse mismatch - 2 suspects, 3 archetypes
  console.log('\n📋 Test 3: Reverse mismatch (2 suspects, 3 archetypes)');
  try {
    const suspects: Suspect[] = [
      { name: 'S1', background: 'bg1', personality: 'p1', isGuilty: false },
      { name: 'S2', background: 'bg2', personality: 'p2', isGuilty: true }
    ];
    const archetypes: Archetype[] = [
      { archetype: 'A1' },
      { archetype: 'A2' },
      { archetype: 'A3' }
    ];

    const result = testArrayNormalization(suspects, archetypes);

    if (
      result.normalized.length === 2 &&
      result.warnings.length === 1 && // Only mismatch warning, no truncation
      result.normalized[0].name === 'S1' &&
      result.normalized[1].name === 'S2'
    ) {
      console.log('✅ PASS: Kept 2 suspects (no truncation needed), 1 warning logged');
      console.log('   Processed suspects:', result.normalized.map(s => s.name).join(', '));
      passCount++;
    } else {
      console.log(`❌ FAIL: Expected 2 suspects [S1,S2], 1 warning. Got ${result.normalized.length} suspects, ${result.warnings.length} warnings`);
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error);
    failCount++;
  }

  // Test 4: Edge case - empty archetypes
  console.log('\n📋 Test 4: Edge case (3 suspects, 0 archetypes)');
  try {
    const suspects: Suspect[] = [
      { name: 'S1', background: 'bg1', personality: 'p1', isGuilty: false },
      { name: 'S2', background: 'bg2', personality: 'p2', isGuilty: false },
      { name: 'S3', background: 'bg3', personality: 'p3', isGuilty: true }
    ];
    const archetypes: Archetype[] = [];

    const result = testArrayNormalization(suspects, archetypes);

    if (
      result.normalized.length === 0 &&
      result.warnings.length === 2 // Mismatch + truncation warnings
    ) {
      console.log('✅ PASS: No suspects processed (graceful degradation), 2 warnings logged');
      passCount++;
    } else {
      console.log(`❌ FAIL: Expected 0 suspects, 2 warnings. Got ${result.normalized.length} suspects, ${result.warnings.length} warnings`);
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error);
    failCount++;
  }

  // Test 5: Edge case - empty suspects
  console.log('\n📋 Test 5: Edge case (0 suspects, 3 archetypes)');
  try {
    const suspects: Suspect[] = [];
    const archetypes: Archetype[] = [
      { archetype: 'A1' },
      { archetype: 'A2' },
      { archetype: 'A3' }
    ];

    const result = testArrayNormalization(suspects, archetypes);

    if (
      result.normalized.length === 0 &&
      result.warnings.length === 1 // Only mismatch warning
    ) {
      console.log('✅ PASS: No suspects to process, 1 warning logged');
      passCount++;
    } else {
      console.log(`❌ FAIL: Expected 0 suspects, 1 warning. Got ${result.normalized.length} suspects, ${result.warnings.length} warnings`);
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error);
    failCount++;
  }

  // Test 6: Edge case - both empty
  console.log('\n📋 Test 6: Edge case (0 suspects, 0 archetypes)');
  try {
    const suspects: Suspect[] = [];
    const archetypes: Archetype[] = [];

    const result = testArrayNormalization(suspects, archetypes);

    if (
      result.normalized.length === 0 &&
      result.warnings.length === 0 // Arrays match (both empty)
    ) {
      console.log('✅ PASS: No suspects, no warnings (arrays match)');
      passCount++;
    } else {
      console.log(`❌ FAIL: Expected 0 suspects, 0 warnings. Got ${result.normalized.length} suspects, ${result.warnings.length} warnings`);
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error);
    failCount++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${passCount}/6`);
  console.log(`   ❌ Failed: ${failCount}/6`);
  console.log(`   Success Rate: ${Math.round((passCount / 6) * 100)}%`);

  if (failCount === 0) {
    console.log('\n🎉 All tests passed! The fix handles array length mismatches correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the fix implementation.');
  }

  return failCount === 0;
}

// Run tests
const success = runTests();
process.exit(success ? 0 : 1);
