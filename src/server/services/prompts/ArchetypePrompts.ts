/**
 * ArchetypePrompts.ts
 *
 * Enhanced suspect archetype prompts from suspect-ai-prompter skill
 * Phase 2: NOW LOADS FROM JSON FILE (bundled at build time)
 *
 * Build process: scripts/convert-yaml-to-json.cjs generates archetypes-data.json
 * Source: src/server/services/prompts/archetypes/*.yaml → archetypes-data.json
 */

// Phase 2: Import JSON data directly (bundled by Vite)
import archetypesDataJson from './archetypes-data.json';

// Phase 1: Keep fallback imports for safety (only used if JSON fails)
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type ArchetypeName =
  | 'Wealthy Heir'
  | 'Loyal Butler'
  | 'Talented Artist'
  | 'Business Partner'
  | 'Former Police Officer';

export type EmotionalStateName = 'COOPERATIVE' | 'NERVOUS' | 'DEFENSIVE' | 'AGGRESSIVE';

export interface ArchetypePromptData {
  definition: string;
  personality: string[];
  speechPatterns: {
    [K in EmotionalStateName]: {
      mindset: string;
      patterns: string[];
      tone: string;
    };
  };
  vocabulary: {
    primary: string[];
    secondary: string[];
  };
  characteristicPhrases?: string[];  // Phase 3: Archetype-specific phrases (minimum 5)
}

interface ArchetypeYAMLData {
  // Phase 2: Multilingual name support
  name: {
    en: string;
    ko: string;
  };
  aliases?: string[];  // Optional aliases for flexible matching
  definition: string;
  personality: string[];
  background?: string[];
  coreValues?: string[];
  greatestFears?: string[];
  vocabulary: {
    primary: string[];
    secondary: string[];
  };
  characteristicPhrases?: string[];  // Phase 3: Archetype-specific phrases (minimum 5)
  speechPatterns: {
    [K in EmotionalStateName]: {
      mindset: string;
      tone: string;
      patterns: string[];
    };
  };
}

/**
 * Map of archetype names to their YAML filenames
 */
const ARCHETYPE_FILES: Record<ArchetypeName, string> = {
  'Wealthy Heir': 'wealthy-heir.yaml',
  'Loyal Butler': 'loyal-butler.yaml',
  'Talented Artist': 'talented-artist.yaml',
  'Business Partner': 'business-partner.yaml',
  'Former Police Officer': 'former-police-officer.yaml'
};

/**
 * Cache for loaded archetypes to avoid repeated file reads
 */
const archetypeCache = new Map<ArchetypeName, ArchetypePromptData>();

/**
 * Phase 2: Cache for archetype name aliases (for multilingual support)
 * Maps any alias (English or Korean) to the canonical English name
 */
const archetypeAliasCache = new Map<string, ArchetypeName>();

/**
 * Phase 1: Hardcoded fallback aliases for when YAML files cannot be loaded
 * Updated to match YAML files (source of truth)
 */
const FALLBACK_ALIASES: Record<string, ArchetypeName> = {
  // English names
  'Wealthy Heir': 'Wealthy Heir',
  'Loyal Butler': 'Loyal Butler',
  'Talented Artist': 'Talented Artist',
  'Business Partner': 'Business Partner',
  'Former Police Officer': 'Former Police Officer',
  // Korean names (from YAML files - source of truth)
  '부유한 상속인': 'Wealthy Heir',
  '충성스러운 집사': 'Loyal Butler',
  '재능있는 예술가': 'Talented Artist',
  '사업 파트너': 'Business Partner',
  '전직 경찰': 'Former Police Officer'
};

/**
 * Phase 2: Build alias cache from JSON data (bundled at build time)
 * Falls back to hardcoded aliases if JSON is unavailable
 */
function buildAliasCache(): void {
  if (archetypeAliasCache.size > 0) {
    return; // Already built
  }

  try {
    // Phase 2: Use imported JSON data (bundled by Vite)
    const jsonData = archetypesDataJson as Record<string, any>;
    let aliasCount = 0;

    for (const [englishName, data] of Object.entries(jsonData)) {
      const archetypeName = englishName as ArchetypeName;

      // Register English name
      if (data.name?.en) {
        archetypeAliasCache.set(data.name.en, archetypeName);
        aliasCount++;
      }

      // Register Korean name
      if (data.name?.ko) {
        archetypeAliasCache.set(data.name.ko, archetypeName);
        aliasCount++;
      }

      // Register all aliases
      if (Array.isArray(data.aliases)) {
        for (const alias of data.aliases) {
          archetypeAliasCache.set(alias, archetypeName);
          aliasCount++;
        }
      }
    }

    console.log(`✅ Built archetype alias cache with ${archetypeAliasCache.size} entries from bundled JSON`);

  } catch (error) {
    // Phase 1: Fallback to hardcoded aliases if JSON fails
    console.error('Error loading JSON data:', error);
    console.warn('⚠️  Using hardcoded fallback aliases');

    for (const [alias, canonicalName] of Object.entries(FALLBACK_ALIASES)) {
      archetypeAliasCache.set(alias, canonicalName);
    }

    console.log(`✅ Built archetype alias cache with ${archetypeAliasCache.size} entries from fallback`);
  }
}

/**
 * Phase 2: Normalize archetype name using YAML aliases (replaces Phase 1 mapping)
 * Supports both English and Korean names, plus any custom aliases
 *
 * @param name - Archetype name in any language or alias
 * @returns Normalized English archetype name, or null if not found
 */
export function normalizeArchetypeName(name: string): ArchetypeName | null {
  // Build alias cache on first use
  buildAliasCache();

  // Look up in alias cache
  const normalizedName = archetypeAliasCache.get(name);

  if (normalizedName) {
    return normalizedName;
  }

  // Not found
  console.warn(`Unknown archetype name: ${name} (not found in aliases)`);
  return null;
}

/**
 * Phase 1: Emergency fallback data for when YAML files cannot be loaded
 * This provides minimal but functional archetype data to prevent complete system failure
 */
const EMERGENCY_FALLBACK_DATA: Record<ArchetypeName, ArchetypePromptData> = {
  'Wealthy Heir': {
    definition: "A privileged individual born into wealth, accustomed to special treatment and avoiding consequences through money and influence.",
    personality: ["Arrogant", "Entitled", "Dismissive of authority", "Strategic"],
    vocabulary: {
      primary: ["attorney", "lawyer", "family name", "reputation", "position"],
      secondary: ["calendar", "investment", "board meeting", "estate"]
    },
    speechPatterns: {
      COOPERATIVE: {
        mindset: "Condescending cooperation",
        tone: "Polite but superior",
        patterns: ["I'll cooperate, of course", "My attorney will confirm", "You can verify with my people"]
      },
      NERVOUS: {
        mindset: "Worried about reputation damage",
        tone: "Defensive, mentions lawyer",
        patterns: ["Perhaps I should call my attorney", "This is highly irregular", "My family will hear about this"]
      },
      DEFENSIVE: {
        mindset: "Protecting status and privilege",
        tone: "Hostile, threatening consequences",
        patterns: ["This is harassment", "I demand to speak with your superior", "You have no idea who you're dealing with"]
      },
      AGGRESSIVE: {
        mindset: "Angry refusal to cooperate",
        tone: "Cold, threatening legal action",
        patterns: ["I'm done here", "My lawyer will be in touch", "This conversation is over"]
      }
    }
  },
  'Loyal Butler': {
    definition: "A devoted servant with years of service, torn between loyalty to employer and the truth.",
    personality: ["Discreet", "Formal", "Observant", "Conflicted"],
    vocabulary: {
      primary: ["sir", "madam", "household", "duties", "discretion"],
      secondary: ["service", "employer", "propriety", "protocol"]
    },
    speechPatterns: {
      COOPERATIVE: {
        mindset: "Helpful within bounds of propriety",
        tone: "Respectful and formal",
        patterns: ["I shall assist as I am able", "It is my duty to help", "I observed certain matters"]
      },
      NERVOUS: {
        mindset: "Worried about betraying employer",
        tone: "Hesitant, conflicted",
        patterns: ["I'm not certain I should say", "Perhaps that is not my place", "My employer would not approve"]
      },
      DEFENSIVE: {
        mindset: "Protecting employer's privacy",
        tone: "Firm refusal, appeals to propriety",
        patterns: ["I cannot discuss such matters", "That would be improper", "My loyalty forbids it"]
      },
      AGGRESSIVE: {
        mindset: "Absolute refusal to betray trust",
        tone: "Cold formality",
        patterns: ["I have nothing further to say", "This interview is concluded", "I must insist you leave"]
      }
    }
  },
  'Talented Artist': {
    definition: "An emotional creative soul, driven by passion and prone to dramatic expression.",
    personality: ["Emotional", "Passionate", "Dramatic", "Sensitive"],
    vocabulary: {
      primary: ["art", "inspiration", "creation", "vision", "soul"],
      secondary: ["gallery", "exhibition", "masterpiece", "critics"]
    },
    speechPatterns: {
      COOPERATIVE: {
        mindset: "Eager to share perspective",
        tone: "Expressive and animated",
        patterns: ["Let me explain what I saw", "I feel compelled to tell you", "Art reveals truth"]
      },
      NERVOUS: {
        mindset: "Anxious and overwhelmed",
        tone: "Rambling, emotional",
        patterns: ["I don't know if I can handle this", "Everything is falling apart", "You wouldn't understand"]
      },
      DEFENSIVE: {
        mindset: "Protecting creative integrity",
        tone: "Passionate rejection",
        patterns: ["How dare you question my vision", "You destroy everything beautiful", "This is an attack on art itself"]
      },
      AGGRESSIVE: {
        mindset: "Dramatic refusal",
        tone: "Theatrical anger",
        patterns: ["I won't be interrogated like a criminal", "Leave me alone", "You've ruined everything"]
      }
    }
  },
  'Business Partner': {
    definition: "A calculating professional who views everything through the lens of profit and strategic advantage.",
    personality: ["Strategic", "Pragmatic", "Calculating", "Ambitious"],
    vocabulary: {
      primary: ["contract", "agreement", "profit", "partnership", "deal"],
      secondary: ["liability", "investment", "leverage", "negotiation"]
    },
    speechPatterns: {
      COOPERATIVE: {
        mindset: "Strategic cooperation",
        tone: "Professional and measured",
        patterns: ["Let's approach this rationally", "I can provide documentation", "The records will show"]
      },
      NERVOUS: {
        mindset: "Calculating risks and exposure",
        tone: "Cautious, mentions lawyers",
        patterns: ["I need to review the contracts", "Perhaps we should involve legal counsel", "This could be complicated"]
      },
      DEFENSIVE: {
        mindset: "Protecting business interests",
        tone: "Businesslike hostility",
        patterns: ["This is a waste of time", "Check the paperwork", "I have nothing to gain from this"]
      },
      AGGRESSIVE: {
        mindset: "Ending unproductive interaction",
        tone: "Cold dismissal",
        patterns: ["We're done here", "Talk to my lawyer", "This meeting is over"]
      }
    }
  },
  'Former Police Officer': {
    definition: "An ex-cop who views investigations through the lens of procedure and evidence.",
    personality: ["Analytical", "Suspicious", "Direct", "Procedural"],
    vocabulary: {
      primary: ["evidence", "procedure", "investigation", "protocol", "facts"],
      secondary: ["detective", "case", "witness", "interrogation"]
    },
    speechPatterns: {
      COOPERATIVE: {
        mindset: "Professional cooperation",
        tone: "Direct and factual",
        patterns: ["Let's stick to the facts", "I know how this works", "I can provide a statement"]
      },
      NERVOUS: {
        mindset: "Uncomfortable being questioned",
        tone: "Defensive expertise",
        patterns: ["You're not following proper procedure", "I know my rights", "This isn't how you conduct an investigation"]
      },
      DEFENSIVE: {
        mindset: "Challenging investigator's competence",
        tone: "Confrontational",
        patterns: ["Where's your evidence", "You're fishing", "This is amateur hour"]
      },
      AGGRESSIVE: {
        mindset: "Complete non-cooperation",
        tone: "Hostile challenge",
        patterns: ["Prove it", "You've got nothing", "I'm not saying another word"]
      }
    }
  }
};

/**
 * Phase 2: Load archetype data from bundled JSON (or fallback)
 */
function loadArchetypeFromFile(archetypeName: ArchetypeName): ArchetypePromptData {
  // Check cache first
  if (archetypeCache.has(archetypeName)) {
    return archetypeCache.get(archetypeName)!;
  }

  try {
    // Phase 2: Load from imported JSON data (bundled by Vite)
    const jsonData = archetypesDataJson as Record<string, any>;
    const yamlData = jsonData[archetypeName];

    if (!yamlData) {
      throw new Error(`Archetype ${archetypeName} not found in JSON data`);
    }

    // Transform JSON data to ArchetypePromptData format
    const promptData: ArchetypePromptData = {
      definition: yamlData.definition,
      personality: yamlData.personality,
      vocabulary: yamlData.vocabulary,
      speechPatterns: yamlData.speechPatterns,
      characteristicPhrases: yamlData.characteristicPhrases  // Phase 3: Include characteristic phrases
    };

    // Cache the loaded data
    archetypeCache.set(archetypeName, promptData);

    return promptData;

  } catch (error) {
    console.error(`Error loading archetype ${archetypeName} from JSON:`, error);
    console.warn(`⚠️  Using emergency fallback data for ${archetypeName}`);

    // Phase 1: Return emergency fallback instead of throwing error
    const fallbackData = EMERGENCY_FALLBACK_DATA[archetypeName];
    archetypeCache.set(archetypeName, fallbackData);
    return fallbackData;
  }
}

/**
 * Complete archetype prompt database
 * NOW LAZY-LOADED from YAML files
 */
export const ARCHETYPE_PROMPTS: Record<ArchetypeName, ArchetypePromptData> = {
  get 'Wealthy Heir'() {
    return loadArchetypeFromFile('Wealthy Heir');
  },
  get 'Loyal Butler'() {
    return loadArchetypeFromFile('Loyal Butler');
  },
  get 'Talented Artist'() {
    return loadArchetypeFromFile('Talented Artist');
  },
  get 'Business Partner'() {
    return loadArchetypeFromFile('Business Partner');
  },
  get 'Former Police Officer'() {
    return loadArchetypeFromFile('Former Police Officer');
  }
};

/**
 * Get speech patterns for a specific archetype and emotional state
 */
export function getArchetypeSpeechPatterns(
  archetype: ArchetypeName,
  emotionalState: EmotionalStateName
): string[] {
  const data = ARCHETYPE_PROMPTS[archetype];
  if (!data) {
    console.warn(`Unknown archetype: ${archetype}`);
    return [];
  }

  return data.speechPatterns[emotionalState].patterns;
}

/**
 * Get full archetype data
 */
export function getArchetypeData(archetype: ArchetypeName): ArchetypePromptData | undefined {
  return ARCHETYPE_PROMPTS[archetype];
}

/**
 * Map suspicion level (0-100) to emotional state name
 */
export function getEmotionalStateFromSuspicion(suspicionLevel: number): EmotionalStateName {
  if (suspicionLevel <= 25) return 'COOPERATIVE';
  if (suspicionLevel <= 50) return 'NERVOUS';
  if (suspicionLevel <= 75) return 'DEFENSIVE';
  return 'AGGRESSIVE';
}

/**
 * Preload all archetypes (useful for initialization/warm-up)
 */
export function preloadAllArchetypes(): void {
  const archetypeNames: ArchetypeName[] = [
    'Wealthy Heir',
    'Loyal Butler',
    'Talented Artist',
    'Business Partner',
    'Former Police Officer'
  ];

  archetypeNames.forEach(name => {
    loadArchetypeFromFile(name);
  });
}

/**
 * Clear the archetype cache (useful for testing or hot-reload scenarios)
 */
export function clearArchetypeCache(): void {
  archetypeCache.clear();
}
