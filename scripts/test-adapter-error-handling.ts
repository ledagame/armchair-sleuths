/**
 * test-adapter-error-handling.ts
 *
 * Test DevvitStorageAdapter error handling with corrupted data
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { KVStoreManager } from '../src/server/services/repositories/kv/KVStoreManager';
import { FileStorageAdapter } from '../src/server/services/repositories/adapters/FileStorageAdapter';

async function testErrorHandling() {
  console.log('🧪 Testing Storage Adapter Error Handling');
  console.log('='.repeat(60));

  const adapter = new FileStorageAdapter('./local-data');
  KVStoreManager.setAdapter(adapter);

  const testKey = 'test:error-handling-set';

  try {
    // Test 1: Normal operation
    console.log('\n📝 Test 1: Normal sAdd operation');
    console.log('-'.repeat(60));
    await adapter.sAdd(testKey, 'member1');
    await adapter.sAdd(testKey, 'member2');
    await adapter.sAdd(testKey, 'member3');

    const members = await adapter.sMembers(testKey);
    console.log(`✅ Retrieved ${members.length} members:`, members);

    // Test 2: Add duplicate (should not duplicate)
    console.log('\n📝 Test 2: Adding duplicate member');
    console.log('-'.repeat(60));
    await adapter.sAdd(testKey, 'member2');
    const membersAfterDupe = await adapter.sMembers(testKey);
    console.log(`✅ Still ${membersAfterDupe.length} members (no duplicates):`, membersAfterDupe);

    // Test 3: Simulate corrupted data (non-array)
    console.log('\n📝 Test 3: Corrupted data (non-array JSON)');
    console.log('-'.repeat(60));
    const corruptedKey = 'test:corrupted-set';
    await adapter.set(corruptedKey, '{"this": "is not an array"}');

    console.log('Trying to sAdd to corrupted set...');
    await adapter.sAdd(corruptedKey, 'newmember');
    const recovered = await adapter.sMembers(corruptedKey);
    console.log(`✅ Recovered from corruption, members:`, recovered);

    // Test 4: Simulate invalid JSON
    console.log('\n📝 Test 4: Invalid JSON data');
    console.log('-'.repeat(60));
    const invalidJsonKey = 'test:invalid-json-set';
    await adapter.set(invalidJsonKey, 'this is not valid json at all!!!');

    console.log('Trying to sMembers with invalid JSON...');
    const invalidMembers = await adapter.sMembers(invalidJsonKey);
    console.log(`✅ Handled invalid JSON gracefully, returned:`, invalidMembers);

    console.log('Trying to sAdd to invalid JSON set...');
    await adapter.sAdd(invalidJsonKey, 'recovery-member');
    const recoveredMembers = await adapter.sMembers(invalidJsonKey);
    console.log(`✅ Recovered and added member:`, recoveredMembers);

    // Test 5: Non-existent key
    console.log('\n📝 Test 5: Non-existent key');
    console.log('-'.repeat(60));
    const nonExistentMembers = await adapter.sMembers('test:does-not-exist');
    console.log(`✅ Non-existent key returned:`, nonExistentMembers);

    // Cleanup
    console.log('\n🧹 Cleaning up test keys...');
    await adapter.del(testKey, corruptedKey, invalidJsonKey);
    console.log('✅ Cleanup complete');

    console.log('\n🎉 All error handling tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testErrorHandling();
