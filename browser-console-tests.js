/**
 * BROWSER CONSOLE TEST SCRIPTS
 *
 * Open the browser console on your Devvit app page and run these commands
 * to test the suspects issue.
 *
 * Copy and paste these functions into your browser console, then run the tests.
 */

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Fetch and display today's case
 */
async function checkTodaysCase() {
  console.log('🔍 Fetching today\'s case...');

  try {
    const response = await fetch('/api/case/today');
    const data = await response.json();

    console.log('✅ Case Data:', data);
    console.log('📊 Suspects Count:', data.suspects?.length || 0);

    if (data.suspects && data.suspects.length > 0) {
      console.log('👥 Suspects:');
      data.suspects.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.name} (${s.archetype})`);
      });
    } else {
      console.warn('⚠️  NO SUSPECTS FOUND!');
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching case:', error);
    throw error;
  }
}

/**
 * Generate a new case
 */
async function generateNewCase() {
  console.log('🔄 Triggering case generation...');

  try {
    const response = await fetch('/api/case/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    console.log('✅ Generation Result:', data);
    return data;
  } catch (error) {
    console.error('❌ Error generating case:', error);
    throw error;
  }
}

/**
 * Regenerate today's case (requires debug endpoint)
 */
async function regenerateTodaysCase() {
  console.log('🔄 Regenerating today\'s case...');

  try {
    const response = await fetch('/api/debug/regenerate-today', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    console.log('✅ Regeneration Result:', data);

    if (data.suspects && data.suspects.length > 0) {
      console.log('👥 New Suspects:');
      data.suspects.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.name} (${s.archetype})`);
      });
    } else {
      console.warn('⚠️  Still no suspects after regeneration!');
    }

    return data;
  } catch (error) {
    console.error('❌ Error regenerating case:', error);
    console.log('ℹ️  Note: This endpoint requires the debug patch. See debug-endpoint-patch.ts');
    throw error;
  }
}

/**
 * Inspect case details (requires debug endpoint)
 */
async function inspectCase(caseId) {
  console.log(`🔍 Inspecting case: ${caseId}`);

  try {
    const response = await fetch(`/api/debug/case/${caseId}`);
    const data = await response.json();

    console.log('✅ Case Inspection:', data);

    console.log('\n📊 Summary:');
    console.log(`  Case ID: ${data.caseId}`);
    console.log(`  Generated: ${new Date(data.case.generatedAt).toLocaleString()}`);
    console.log(`  Suspects in case data: ${data.case.suspectsInCaseData}`);
    console.log(`  Suspects from repository: ${data.suspects.fromRepository}`);
    console.log(`  Suspects in Redis index: ${data.redis.suspectsIndexKey.count}`);

    if (data.redis.individualSuspects) {
      console.log('\n👥 Individual Suspects in Redis:');
      data.redis.individualSuspects.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.id}: ${s.exists ? '✅ EXISTS' : '❌ MISSING'}`);
        if (s.data) {
          console.log(`     Name: ${s.data.name}, Archetype: ${s.data.archetype}`);
        }
      });
    }

    return data;
  } catch (error) {
    console.error('❌ Error inspecting case:', error);
    console.log('ℹ️  Note: This endpoint requires the debug patch. See debug-endpoint-patch.ts');
    throw error;
  }
}

/**
 * Check raw Redis data (requires debug endpoint)
 */
async function checkRedis(key) {
  console.log(`🔍 Checking Redis key: ${key}`);

  try {
    const response = await fetch(`/api/debug/redis/${encodeURIComponent(key)}`);
    const data = await response.json();

    console.log('✅ Redis Data:', data);

    if (data.exists) {
      console.log(`  Key exists: ${data.key}`);
      console.log(`  Length: ${data.length} bytes`);
      if (data.parsed) {
        console.log(`  Parsed value:`, data.parsed);
      } else {
        console.log(`  Raw value: ${data.value}`);
      }
    } else {
      console.warn(`⚠️  Key does not exist: ${data.key}`);
    }

    return data;
  } catch (error) {
    console.error('❌ Error checking Redis:', error);
    console.log('ℹ️  Note: This endpoint requires the debug patch. See debug-endpoint-patch.ts');
    throw error;
  }
}

/**
 * Test storage operations (requires debug endpoint)
 */
async function testStorage() {
  console.log('🧪 Testing storage operations...');

  try {
    const response = await fetch('/api/debug/test-storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    console.log('✅ Storage Test Results:', data);

    if (data.tests) {
      console.log('\n📊 Test Summary:');
      console.log(`  sAdd/sMembers: ${data.tests.sMembers.matches ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`    Added: ${data.tests.sAdd.count} members`);
      console.log(`    Retrieved: ${data.tests.sMembers.count} members`);
      console.log(`  set/get: ${data.tests.setAndGet.matches ? '✅ PASS' : '❌ FAIL'}`);
    }

    return data;
  } catch (error) {
    console.error('❌ Error testing storage:', error);
    console.log('ℹ️  Note: This endpoint requires the debug patch. See debug-endpoint-patch.ts');
    throw error;
  }
}

// =============================================================================
// Quick Test Sequences
// =============================================================================

/**
 * Run basic diagnostics
 */
async function runBasicDiagnostics() {
  console.log('🔬 Running basic diagnostics...\n');

  try {
    console.log('='.repeat(60));
    console.log('TEST 1: Check Today\'s Case');
    console.log('='.repeat(60));
    const caseData = await checkTodaysCase();

    console.log('\n' + '='.repeat(60));
    console.log('TEST 2: Check Suspects Endpoint');
    console.log('='.repeat(60));
    const suspectsResponse = await fetch(`/api/suspects/${caseData.id}`);
    const suspectsData = await suspectsResponse.json();
    console.log('✅ Suspects Data:', suspectsData);
    console.log('📊 Suspects Count:', suspectsData.suspects?.length || 0);

    console.log('\n' + '='.repeat(60));
    console.log('DIAGNOSTIC SUMMARY');
    console.log('='.repeat(60));
    console.log(`Case ID: ${caseData.id}`);
    console.log(`Case Date: ${caseData.date}`);
    console.log(`Suspects from /api/case/today: ${caseData.suspects?.length || 0}`);
    console.log(`Suspects from /api/suspects/:caseId: ${suspectsData.suspects?.length || 0}`);

    if (caseData.suspects?.length === 0) {
      console.error('\n❌ ISSUE CONFIRMED: No suspects found!');
      console.log('\n💡 Next Steps:');
      console.log('1. Check server logs: npx devvit logs r/YOUR_SUBREDDIT --since 30m');
      console.log('2. Look for DevvitAdapter.sAdd and DevvitAdapter.sMembers logs');
      console.log('3. If no logs found, the enhanced code is not deployed');
      console.log('4. Try regenerating: await regenerateTodaysCase()');
    } else {
      console.log('\n✅ Suspects found! Issue may be resolved.');
    }

  } catch (error) {
    console.error('\n❌ Diagnostics failed:', error);
  }
}

/**
 * Run full diagnostics with debug endpoints
 */
async function runFullDiagnostics() {
  console.log('🔬 Running full diagnostics...\n');

  try {
    console.log('='.repeat(60));
    console.log('TEST 1: Basic Case Check');
    console.log('='.repeat(60));
    const caseData = await checkTodaysCase();
    const caseId = caseData.id;

    console.log('\n' + '='.repeat(60));
    console.log('TEST 2: Storage Operations Test');
    console.log('='.repeat(60));
    await testStorage();

    console.log('\n' + '='.repeat(60));
    console.log('TEST 3: Detailed Case Inspection');
    console.log('='.repeat(60));
    await inspectCase(caseId);

    console.log('\n' + '='.repeat(60));
    console.log('TEST 4: Redis Suspects Index Check');
    console.log('='.repeat(60));
    await checkRedis(`case:${caseId}:suspects`);

    console.log('\n' + '='.repeat(60));
    console.log('FULL DIAGNOSTIC COMPLETE');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Full diagnostics failed:', error);
    console.log('ℹ️  Some tests require debug endpoints. See debug-endpoint-patch.ts');
  }
}

// =============================================================================
// Usage Instructions
// =============================================================================

console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║  Browser Console Test Scripts Loaded                                    ║
╚════════════════════════════════════════════════════════════════════════╝

Available Functions:
───────────────────────────────────────────────────────────────────────────

Basic (no debug endpoints required):
  • checkTodaysCase()          - Fetch and display today's case
  • generateNewCase()           - Trigger case generation
  • runBasicDiagnostics()       - Run basic diagnostic tests

Advanced (requires debug endpoints):
  • regenerateTodaysCase()      - Delete and regenerate today's case
  • inspectCase(caseId)         - Detailed case inspection
  • checkRedis(key)             - Check raw Redis data
  • testStorage()               - Test storage operations
  • runFullDiagnostics()        - Run all diagnostic tests

Quick Start:
───────────────────────────────────────────────────────────────────────────

1. Run basic check:
   await runBasicDiagnostics()

2. If you have debug endpoints installed:
   await runFullDiagnostics()

3. To regenerate today's case (with debug endpoints):
   await regenerateTodaysCase()

4. To inspect specific case:
   await inspectCase('case-2025-10-15')

Note: Advanced functions require debug endpoints from debug-endpoint-patch.ts
───────────────────────────────────────────────────────────────────────────
`);
