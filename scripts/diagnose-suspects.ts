/**
 * diagnose-suspects.ts
 *
 * Diagnose why suspects array is empty
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { CaseRepository } from '../src/server/services/repositories/kv/CaseRepository';
import { KVStoreManager } from '../src/server/services/repositories/kv/KVStoreManager';
import { FileStorageAdapter } from '../src/server/services/repositories/adapters/FileStorageAdapter';

async function diagnoseSuspects() {
  console.log('🔍 Suspect Array Diagnosis');
  console.log('='.repeat(60));

  // Initialize storage adapter
  const storageAdapter = new FileStorageAdapter('./local-data');
  KVStoreManager.setAdapter(storageAdapter);

  const today = new Date().toISOString().split('T')[0];
  const caseId = `case-${today}`;

  console.log(`📅 Today: ${today}`);
  console.log(`🆔 Expected Case ID: ${caseId}\n`);

  // Step 1: Check if today's case exists
  console.log('STEP 1: Get Today\'s Case');
  console.log('-'.repeat(60));
  const todaysCase = await CaseRepository.getTodaysCase();

  if (!todaysCase) {
    console.log('❌ No case found for today');
    console.log('\n💡 Run: npx tsx scripts/generate-case.ts');
    process.exit(1);
  }

  console.log('✅ Case found:');
  console.log(`   ID: ${todaysCase.id}`);
  console.log(`   Date: ${todaysCase.date}`);
  console.log(`   Victim: ${todaysCase.victim.name}`);
  console.log(`   Weapon: ${todaysCase.weapon.name}`);
  console.log(`   Location: ${todaysCase.location.name}`);
  console.log(`   Suspects in CaseData: ${todaysCase.suspects.length}`);

  // Show the suspects array from CaseData
  console.log('\n   Suspects array structure:');
  todaysCase.suspects.forEach((s, i) => {
    console.log(`     ${i + 1}. ${JSON.stringify(s, null, 2).split('\n').map((line, idx) => idx === 0 ? line : '        ' + line).join('\n')}`);
  });

  // Step 2: Check suspect index in storage
  console.log('\n\nSTEP 2: Check Suspect Index in Storage');
  console.log('-'.repeat(60));

  const suspectIndexKey = `case:${caseId}:suspects`;
  console.log(`   Looking for key: ${suspectIndexKey}`);

  // Direct storage check
  const rawSuspectIds = await storageAdapter.sMembers(suspectIndexKey);
  console.log(`   Raw suspect IDs from storage: ${JSON.stringify(rawSuspectIds)}`);
  console.log(`   Count: ${rawSuspectIds.length}`);

  // Step 3: Fetch full suspect data
  console.log('\n\nSTEP 3: Fetch Full Suspect Data');
  console.log('-'.repeat(60));

  const fullSuspects = await CaseRepository.getCaseSuspects(caseId);
  console.log(`   Full suspects retrieved: ${fullSuspects.length}`);

  if (fullSuspects.length === 0) {
    console.log('   ❌ No suspects found!');
    console.log('\n🔴 ROOT CAUSE IDENTIFIED:');
    console.log('   The suspect index is empty or not created.');
    console.log('   This happens in CaseRepository.createCase() at line 99:');
    console.log('   await KVStoreManager.saveSuspect(suspectData);');
    console.log('\n   The saveSuspect() method should add to the index:');
    console.log('   const caseKey = `case:${suspectData.caseId}:suspects`;');
    console.log('   await this.adapter.sAdd(caseKey, suspectData.id);');
  } else {
    console.log('   ✅ Suspects found:');
    fullSuspects.forEach((s, i) => {
      console.log(`     ${i + 1}. ${s.name} (${s.id})`);
      console.log(`        Archetype: ${s.archetype}`);
      console.log(`        Guilty: ${s.isGuilty}`);
    });
  }

  // Step 4: Check individual suspect records
  console.log('\n\nSTEP 4: Check Individual Suspect Records');
  console.log('-'.repeat(60));

  for (const suspectRef of todaysCase.suspects) {
    const suspectKey = `suspect:${suspectRef.id}`;
    console.log(`   Checking key: ${suspectKey}`);

    const rawData = await storageAdapter.get(suspectKey);
    if (rawData) {
      const suspectData = JSON.parse(rawData);
      console.log(`   ✅ Found: ${suspectData.name}`);
    } else {
      console.log(`   ❌ NOT FOUND!`);
    }
  }

  // Summary
  console.log('\n\n📊 DIAGNOSIS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Case Data Suspects: ${todaysCase.suspects.length}`);
  console.log(`Suspect Index Count: ${rawSuspectIds.length}`);
  console.log(`Full Suspects Retrieved: ${fullSuspects.length}`);

  if (todaysCase.suspects.length > 0 && fullSuspects.length === 0) {
    console.log('\n🔴 CRITICAL BUG: Suspects exist in CaseData but not retrievable!');
    console.log('   The suspect index is not being populated correctly.');
  } else if (fullSuspects.length > 0) {
    console.log('\n✅ Suspects are correctly stored and retrievable!');
  }
}

diagnoseSuspects().catch(error => {
  console.error('❌ Diagnosis failed:', error);
  process.exit(1);
});
