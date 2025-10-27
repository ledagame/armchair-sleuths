#!/usr/bin/env tsx
/**
 * Case Structure Validator
 *
 * Validates case data structure before saving to Redis.
 * Ensures all required fields, correct data types, and game balance.
 *
 * Usage:
 *   tsx scripts/validate-case-structure.ts <path-to-case-json>
 */

interface Case {
  id: string;
  date: string;
  title: string;
  summary: string;
  detailedDescription: string;
  imageUrl?: string;
  introNarration?: string;
  victim: Victim;
  crime: Crime;
  suspects: Suspect[];
  suspectIds: string[];
  locations: Location[];
  actionPoints: ActionPointsConfig;
}

interface Victim {
  name: string;
  age: number;
  occupation: string;
  background: string;
}

interface Crime {
  type: string;
  method: string;
  weapon: string;
  timeOfDeath: string;
  location: string;
}

interface Suspect {
  id: string;
  name: string;
  age: number;
  occupation: string;
  relationship: string;
  personality: string;
  emotionalState: string;
  alibi: string;
  motive?: string;
  isGuilty: boolean;
  profileImageUrl?: string;
  hasProfileImage: boolean;
  apTopics: APTopic[];
}

interface APTopic {
  id: string;
  category: string;
  keywords: string[];
  apReward: number;
  requiresQuality: boolean;
  description: string;
  triggered: boolean;
}

interface Location {
  id: string;
  name: string;
  description: string;
  emoji: string;
  evidenceItems: EvidenceItem[];
}

interface EvidenceItem {
  id: string;
  type: 'physical' | 'digital' | 'testimony' | 'document';
  name: string;
  description: string;
  significance: string;
  importance: 1 | 2 | 3;
  relatedSuspect?: string;
  discoveryProbability: {
    quick: number;
    thorough: number;
    exhaustive: number;
  };
}

interface ActionPointsConfig {
  initial: number;
  maximum: number;
  costs: {
    quick: number;
    thorough: number;
    exhaustive: number;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validateCase(caseData: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!caseData.id) errors.push('Missing case id');
  if (!caseData.title) errors.push('Missing case title');
  if (!caseData.summary) errors.push('Missing case summary');
  if (!caseData.detailedDescription) errors.push('Missing detailed description');

  // Date format
  if (caseData.date && !/^\d{4}-\d{2}-\d{2}$/.test(caseData.date)) {
    errors.push('Invalid date format (expected YYYY-MM-DD)');
  }

  // Victim validation
  if (!caseData.victim) {
    errors.push('Missing victim data');
  } else {
    if (!caseData.victim.name) errors.push('Missing victim name');
    if (typeof caseData.victim.age !== 'number') errors.push('Victim age must be number');
    if (!caseData.victim.occupation) errors.push('Missing victim occupation');
  }

  // Crime validation
  if (!caseData.crime) {
    errors.push('Missing crime data');
  } else {
    if (!caseData.crime.method) errors.push('Missing crime method');
    if (!caseData.crime.weapon) errors.push('Missing crime weapon');
    if (!caseData.crime.location) errors.push('Missing crime location');
  }

  // Suspects validation
  if (!Array.isArray(caseData.suspects)) {
    errors.push('Suspects must be an array');
  } else {
    // Must have exactly 3 suspects
    if (caseData.suspects.length !== 3) {
      errors.push(`Must have exactly 3 suspects (found ${caseData.suspects.length})`);
    }

    // Exactly 1 guilty suspect
    const guiltyCount = caseData.suspects.filter((s: Suspect) => s.isGuilty).length;
    if (guiltyCount !== 1) {
      errors.push(`Must have exactly 1 guilty suspect (found ${guiltyCount})`);
    }

    // Validate each suspect
    caseData.suspects.forEach((suspect: Suspect, index: number) => {
      const prefix = `Suspect ${index + 1}`;

      if (!suspect.id) errors.push(`${prefix}: Missing id`);
      if (!suspect.name) errors.push(`${prefix}: Missing name`);
      if (typeof suspect.age !== 'number') errors.push(`${prefix}: Age must be number`);
      if (!suspect.personality) errors.push(`${prefix}: Missing personality`);
      if (typeof suspect.isGuilty !== 'boolean') errors.push(`${prefix}: isGuilty must be boolean`);

      // AP Topics validation
      if (!Array.isArray(suspect.apTopics)) {
        errors.push(`${prefix}: apTopics must be an array`);
      } else {
        if (suspect.apTopics.length < 5 || suspect.apTopics.length > 7) {
          warnings.push(`${prefix}: Should have 5-7 AP topics (found ${suspect.apTopics.length})`);
        }

        suspect.apTopics.forEach((topic: APTopic, topicIndex: number) => {
          const topicPrefix = `${prefix} Topic ${topicIndex + 1}`;

          if (!topic.id) errors.push(`${topicPrefix}: Missing id`);
          if (!topic.category) errors.push(`${topicPrefix}: Missing category`);
          if (!Array.isArray(topic.keywords) || topic.keywords.length === 0) {
            errors.push(`${topicPrefix}: Must have at least 1 keyword`);
          }
          if (typeof topic.apReward !== 'number' || topic.apReward < 1) {
            errors.push(`${topicPrefix}: apReward must be >= 1`);
          }
        });
      }

      // Guilty suspect must have motive
      if (suspect.isGuilty && !suspect.motive) {
        warnings.push(`${prefix}: Guilty suspect should have motive`);
      }
    });
  }

  // Locations validation
  if (!Array.isArray(caseData.locations)) {
    errors.push('Locations must be an array');
  } else {
    if (caseData.locations.length < 3 || caseData.locations.length > 5) {
      warnings.push(`Should have 3-5 locations (found ${caseData.locations.length})`);
    }

    const totalEvidence: EvidenceItem[] = [];

    caseData.locations.forEach((location: Location, index: number) => {
      const prefix = `Location ${index + 1}`;

      if (!location.id) errors.push(`${prefix}: Missing id`);
      if (!location.name) errors.push(`${prefix}: Missing name`);

      if (!Array.isArray(location.evidenceItems)) {
        errors.push(`${prefix}: evidenceItems must be an array`);
      } else {
        if (location.evidenceItems.length < 2 || location.evidenceItems.length > 4) {
          warnings.push(`${prefix}: Should have 2-4 evidence items (found ${location.evidenceItems.length})`);
        }

        location.evidenceItems.forEach((evidence: EvidenceItem) => {
          totalEvidence.push(evidence);

          const evidencePrefix = `${prefix} Evidence ${evidence.id}`;

          if (!evidence.id) errors.push(`${evidencePrefix}: Missing id`);
          if (!evidence.name) errors.push(`${evidencePrefix}: Missing name`);
          if (![1, 2, 3].includes(evidence.importance)) {
            errors.push(`${evidencePrefix}: Importance must be 1, 2, or 3`);
          }

          // Probability validation
          if (!evidence.discoveryProbability) {
            errors.push(`${evidencePrefix}: Missing discoveryProbability`);
          } else {
            const { quick, thorough, exhaustive } = evidence.discoveryProbability;

            if (typeof quick !== 'number' || quick < 0 || quick > 1) {
              errors.push(`${evidencePrefix}: quick probability must be 0-1`);
            }
            if (typeof thorough !== 'number' || thorough < 0 || thorough > 1) {
              errors.push(`${evidencePrefix}: thorough probability must be 0-1`);
            }
            if (typeof exhaustive !== 'number' || exhaustive < 0 || exhaustive > 1) {
              errors.push(`${evidencePrefix}: exhaustive probability must be 0-1`);
            }

            // Probabilities should increase: quick < thorough < exhaustive
            if (quick > thorough || thorough > exhaustive) {
              warnings.push(`${evidencePrefix}: Probabilities should increase (quick < thorough < exhaustive)`);
            }
          }
        });
      }
    });

    // Evidence distribution check
    const criticalEvidence = totalEvidence.filter(e => e.importance === 3);
    const supportingEvidence = totalEvidence.filter(e => e.importance === 2);
    const redHerrings = totalEvidence.filter(e => e.importance === 1);

    if (criticalEvidence.length < 3) {
      warnings.push(`Should have at least 3 critical evidence items (found ${criticalEvidence.length})`);
    }

    if (supportingEvidence.length < 4) {
      warnings.push(`Should have at least 4 supporting evidence items (found ${supportingEvidence.length})`);
    }

    if (totalEvidence.length < 8) {
      warnings.push(`Should have at least 8 total evidence items (found ${totalEvidence.length})`);
    }
  }

  // Action Points validation
  if (!caseData.actionPoints) {
    errors.push('Missing actionPoints config');
  } else {
    if (typeof caseData.actionPoints.initial !== 'number') {
      errors.push('actionPoints.initial must be number');
    }
    if (typeof caseData.actionPoints.maximum !== 'number') {
      errors.push('actionPoints.maximum must be number');
    }

    if (!caseData.actionPoints.costs) {
      errors.push('Missing actionPoints.costs');
    } else {
      if (typeof caseData.actionPoints.costs.quick !== 'number') {
        errors.push('actionPoints.costs.quick must be number');
      }
      if (typeof caseData.actionPoints.costs.thorough !== 'number') {
        errors.push('actionPoints.costs.thorough must be number');
      }
      if (typeof caseData.actionPoints.costs.exhaustive !== 'number') {
        errors.push('actionPoints.costs.exhaustive must be number');
      }
    }

    // Sanity checks
    if (caseData.actionPoints.initial > caseData.actionPoints.maximum) {
      errors.push('actionPoints.initial cannot exceed maximum');
    }
  }

  // Image URL format validation
  if (caseData.imageUrl && !caseData.imageUrl.startsWith('data:image/')) {
    errors.push('imageUrl must be a data URL (data:image/...)');
  }

  caseData.suspects?.forEach((suspect: Suspect, index: number) => {
    if (suspect.profileImageUrl && !suspect.profileImageUrl.startsWith('data:image/')) {
      errors.push(`Suspect ${index + 1}: profileImageUrl must be a data URL`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// CLI
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: tsx scripts/validate-case-structure.ts <path-to-case-json>');
    process.exit(1);
  }

  const filePath = args[0];

  try {
    const fs = await import('fs/promises');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const caseData = JSON.parse(fileContent);

    console.log('Validating case structure...\n');

    const result = validateCase(caseData);

    if (result.errors.length > 0) {
      console.error('❌ Validation FAILED\n');
      console.error('Errors:');
      result.errors.forEach(error => console.error(`  - ${error}`));
      console.error();
    }

    if (result.warnings.length > 0) {
      console.warn('⚠️  Warnings:');
      result.warnings.forEach(warning => console.warn(`  - ${warning}`));
      console.warn();
    }

    if (result.isValid) {
      console.log('✅ Case structure is valid!');

      // Summary stats
      console.log('\nSummary:');
      console.log(`  - Suspects: ${caseData.suspects?.length || 0}`);
      console.log(`  - Locations: ${caseData.locations?.length || 0}`);
      console.log(`  - Total Evidence: ${caseData.locations?.reduce((sum: number, loc: Location) => sum + loc.evidenceItems.length, 0) || 0}`);
      console.log(`  - Initial AP: ${caseData.actionPoints?.initial || 'N/A'}`);
      console.log(`  - Max AP: ${caseData.actionPoints?.maximum || 'N/A'}`);

      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { validateCase };
