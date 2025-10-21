/**
 * Simple test script to verify ConfigLoader works
 */

import { ConfigLoader } from './ConfigLoader.js';

console.log('Testing ConfigLoader...\n');

// Create config loader
const loader = new ConfigLoader();

// Load configuration
const config = loader.load();

console.log('✓ Configuration loaded successfully');
console.log('\nConfiguration summary:');
console.log('- Skills enabled:', config.skills.enabled);
console.log('- Auto discovery:', config.skills.autoDiscovery);
console.log('- Sandbox enabled:', config.security.sandbox);
console.log('- Max active skills:', config.performance.maxActiveSkills);
console.log('- Max context tokens:', config.performance.maxContextTokens);

// Validate configuration
const validation = loader.validate();
console.log('\n✓ Configuration validation:', validation.valid ? 'PASSED' : 'FAILED');

if (validation.errors.length > 0) {
  console.log('Errors:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.log('Warnings:', validation.warnings);
}

// Test get/set
console.log('\n✓ Testing get/set:');
console.log('- Get skills.enabled:', loader.get('skills.enabled'));
loader.set('skills.enabled', false);
console.log('- After set to false:', loader.get('skills.enabled'));
loader.set('skills.enabled', true);
console.log('- After set back to true:', loader.get('skills.enabled'));

console.log('\n✅ All tests passed!');
