/**
 * CaseGeneratorService.ts
 *
 * AI 기반 케이스 생성 서비스
 * CaseElementLibrary + GeminiClient를 결합하여 플레이 가능한 케이스 생성
 */

import { GeminiClient, type GeminiTextOptions } from '../gemini/GeminiClient';
import { CaseElementLibrary, type Weapon, type Motive, type Location, type Suspect } from './CaseElementLibrary';
import { CaseRepository, type CreateCaseInput } from '../repositories/kv/CaseRepository';
import { CaseValidator } from './CaseValidator';
import { WorkflowExecutor, DEFAULT_RETRY_POLICIES } from '../workflow/WorkflowExecutor';
import { TransactionManager, CaseCreationTransaction } from '../workflow/TransactionManager';
import { KVStoreManager } from '../repositories/kv/KVStoreManager';
import type { SuspectData, CaseData, ImageGenerationStatus } from '../repositories/kv/KVStoreManager';
import { CinematicImageService, type CinematicImages } from '../image/CinematicImageService';
import { LocationDiscoveryService } from '../discovery/LocationDiscoveryService';
import { DiscoveryStateManager } from '../discovery/DiscoveryStateManager';
import type { EvidenceItem, DiscoveryDifficulty, MultilingualEvidence, EvidenceContent } from '@/shared/types/Evidence';
import { getDiscoveryProbability } from '@/shared/types/Evidence';
import type { Location as DiscoveryLocation, APTopic, ActionPointsConfig } from '@/shared/types/Case';
import { generateDefaultAPTopics, validateAPTopics } from '../ap/APTopicGenerator';
import { ImageGenerator } from '../generators/ImageGenerator';
import { ImageStorageService } from '../image/ImageStorageService';
import { EvidenceImageGeneratorService } from '../image/EvidenceImageGeneratorService';
import { LocationImageGeneratorService } from '../image/LocationImageGeneratorService';
// REMOVED: NarrationValidationService import - Legacy narration system removed
import { IntroSlidesGenerator } from '../intro/IntroSlidesGenerator';
import type { IntroSlides } from '@/shared/types';

export interface GenerateCaseOptions {
  date?: Date;
  includeImage?: boolean;
  includeSuspectImages?: boolean; // Generate profile images for suspects
  includeCinematicImages?: boolean; // Generate cinematic intro images (5 scenes)
  temperature?: number;
  customCaseId?: string; // Custom case ID for unique identification (timestamp-based)
  narrationStyle?: 'classic' | 'noir' | 'cozy' | 'nordic' | 'honkaku'; // Mystery narration style
}

export interface GeneratedCase {
  caseId: string;
  id: string;              // Alias for backward compatibility
  date: string;            // Date string in YYYY-MM-DD format
  victim: {
    name: string;
    background: string;
    relationship: string;
  };
  weapon: Weapon;
  location: Location;
  suspects: Array<{
    id: string;
    name: string;
    archetype: string;
    background: string;
    personality: string;
    isGuilty: boolean;
    profileImageUrl?: string; // Profile image URL
  }>;
  solution: {
    who: string;
    what: string;
    where: string;
    when: string;
    why: string;
    how: string;
  };
  imageUrl?: string;
  cinematicImages?: {
    establishing?: string;
    entry?: string;
    confrontation?: string;
    suspects?: string;
    action?: string;
  };
  introNarration?: {
    atmosphere: string;
    incident: string;
    stakes: string;
  };
  introSlides?: IntroSlides; // NEW: 3-slide intro system
  generatedAt: number;
  // Discovery system data
  locations?: DiscoveryLocation[]; // 탐색 가능한 장소 목록
  evidence?: EvidenceItem[]; // 증거 목록
  evidenceDistribution?: any; // 증거 분배 정보
}

/**
 * 케이스 생성 서비스 (개선된 버전)
 *
 * 개선사항:
 * - CaseValidator로 사전/사후 검증
 * - WorkflowExecutor로 재시도 및 에러 처리
 * - TransactionManager로 안전한 저장
 */
export class CaseGeneratorService {
  private geminiClient: GeminiClient;
  private workflowExecutor: WorkflowExecutor;
  private cinematicImageService: CinematicImageService;
  private imageGenerator: ImageGenerator;
  private imageStorageService: ImageStorageService;
  private evidenceImageService: EvidenceImageGeneratorService;
  private locationImageService: LocationImageGeneratorService;
  // REMOVED: private narrationValidationService - Legacy narration system removed
  private introSlidesGenerator: IntroSlidesGenerator;

  constructor(geminiClient: GeminiClient) {
    this.geminiClient = geminiClient;
    this.workflowExecutor = new WorkflowExecutor();
    this.cinematicImageService = new CinematicImageService(geminiClient);

    // Initialize image generation services
    this.imageGenerator = new ImageGenerator(geminiClient);

    // Get adapter with error logging
    let adapter;
    try {
      adapter = KVStoreManager.getAdapter();
      console.log('✅ CaseGeneratorService: KV Adapter retrieved successfully:', adapter ? 'EXISTS' : 'UNDEFINED');
    } catch (error) {
      console.error('❌ CaseGeneratorService: Failed to get KV adapter:', error);
      throw error;
    }

    this.imageStorageService = new ImageStorageService(adapter);
    this.evidenceImageService = new EvidenceImageGeneratorService(
      this.imageGenerator,
      this.imageStorageService
    );
    this.locationImageService = new LocationImageGeneratorService(
      this.imageGenerator,
      this.imageStorageService
    );

    // REMOVED: narrationValidationService instantiation - Legacy narration system removed

    // Initialize intro slides generator (NEW: 3-slide system)
    this.introSlidesGenerator = new IntroSlidesGenerator(geminiClient);
  }

  /**
   * 새로운 케이스 생성 (개선된 버전)
   *
   * 개선사항:
   * - CaseValidator로 사전/사후 검증
   * - WorkflowExecutor로 재시도 및 에러 처리
   * - TransactionManager로 안전한 저장
   *
   * Phase 1: 텍스트 케이스만 생성 (이미지는 선택)
   * Phase 2-3: 이미지 포함 생성
   */
  async generateCase(options: GenerateCaseOptions = {}): Promise<GeneratedCase> {
    const {
      date = new Date(),
      includeImage = false,
      includeSuspectImages = false,
      includeCinematicImages = false,
      temperature = 0.8,
      customCaseId,
      narrationStyle = 'classic'
    } = options;

    console.log(`🔄 Generating case for ${date.toISOString().split('T')[0]}...`);

    // 1. CaseElementLibrary에서 오늘의 요소 선택
    const elements = CaseElementLibrary.getTodaysCaseElements(date);

    console.log(`📚 Selected elements:
      - Weapon: ${elements.weapon.name}
      - Motive: ${elements.motive.category}
      - Location: ${elements.location.name}
      - Suspects: ${elements.suspects.map(s => s.archetype).join(', ')}`
    );

    // 1.5. 요소 사전 검증 (NEW!)
    const elementValidation = CaseValidator.validateCaseElements(elements);
    CaseValidator.logValidationResult(elementValidation, 'Case Elements');

    if (!elementValidation.isValid) {
      throw new Error(`Case element validation failed: ${elementValidation.errors.map(e => e.message).join(', ')}`);
    }

    // 2. 케이스 스토리 생성 (Gemini with Retry)
    const caseStory = await this.workflowExecutor.executeWithRetry(
      () => this.generateCaseStory(
        elements.weapon,
        elements.motive,
        elements.location,
        elements.suspects,
        temperature
      ),
      DEFAULT_RETRY_POLICIES.TEXT_GENERATION,
      'Generate Case Story'
    );

    console.log(`✅ Case story generated`);

    // 2.5. 생성된 케이스 사후 검증 (NEW!)
    const storyValidation = CaseValidator.validateGeneratedCase(caseStory);
    CaseValidator.logValidationResult(storyValidation, 'Generated Case Story');

    if (!storyValidation.isValid) {
      throw new Error(`Generated case validation failed: ${storyValidation.errors.map(e => e.message).join(', ')}`);
    }

    // 3. Legacy narration system removed - using introSlides only
    // introNarration is undefined for new cases, kept for backward compatibility
    const introNarration = undefined;

    // 3.5. NEW: Generate 3-slide intro (discovery, suspects, challenge)
    const introSlides = await this.generateIntroSlides(
      caseStory,
      elements.weapon,
      elements.location,
      elements.suspects
    );

    console.log(`✅ Intro slides generated (3-slide system)`);

    // 4. 케이스 이미지 생성 (선택, with Retry)
    let imageUrl: string | undefined;
    if (includeImage) {
      try {
        imageUrl = await this.workflowExecutor.executeWithRetry(
          () => this.generateCaseImage(
            elements.location,
            elements.weapon,
            caseStory.victim.name
          ),
          DEFAULT_RETRY_POLICIES.IMAGE_GENERATION,
          'Generate Case Image'
        );
        console.log(`✅ Case image generated`);
      } catch (error) {
        console.warn('⚠️  Case image generation failed after retries, continuing without image', error);
        // 이미지 실패해도 케이스는 생성 (Phase 1 철학)
      }
    }

    // 5. 용의자 프로필 이미지 생성 (선택)
    const suspectsWithImages = includeSuspectImages
      ? await this.generateSuspectProfileImages(
          caseStory.suspects,
          elements.suspects,
          includeSuspectImages
        )
      : caseStory.suspects;

    // 5.5. 시네마틱 인트로 이미지는 백그라운드에서 생성됨 (상태: pending)
    console.log(`✅ All generation steps completed (cinematic images will be generated in background)`);

    // 5.6. 증거 발견 데이터 생성 (saveCaseWithTransaction 전에 생성)
    const locations = this.generateLocationsForCase(elements.location, elements.weapon);
    const evidence = this.generateEvidenceForCase(
      elements.weapon,
      elements.motive,
      caseStory.suspects
    );

    console.log(`✅ Discovery data generated: ${locations.length} locations, ${evidence.length} evidence`);

    // 6. 트랜잭션으로 데이터 저장 (locations, evidence, introSlides 포함)
    const savedCase = await this.saveCaseWithTransaction(
      caseStory,
      elements,
      suspectsWithImages,
      imageUrl,
      introNarration,
      introSlides,
      date,
      customCaseId,
      locations,
      evidence
    );

    console.log(`✅ Case saved with transaction: ${savedCase.id}`);

    // 6.5. 증거를 장소에 분배
    const locationDiscovery = new LocationDiscoveryService();
    const distribution = locationDiscovery.distributeEvidence(
      savedCase.id,
      locations,
      evidence
    );

    // 6.6. 분배 데이터를 KV Store에 저장 (별도 키와 caseData 양쪽에 저장)
    await DiscoveryStateManager.saveDistribution(distribution);

    // 6.7. caseData에도 evidenceDistribution 추가하고 재저장
    savedCase.evidenceDistribution = distribution;
    // 🔧 FIX: Explicitly preserve locations and evidence fields before re-saving
    // This ensures the second save doesn't lose data from the transaction
    savedCase.locations = locations;
    savedCase.evidence = evidence;
    await KVStoreManager.saveCase(savedCase);

    console.log(`✅ Evidence distribution saved: ${distribution.totalEvidence} evidence across ${distribution.locations.length} locations`);

    // 6.8. 백그라운드 이미지 생성 시작 (증거 + 장소)
    const guiltyIndex = savedCase.suspects.findIndex(s => s.isGuilty);

    // IMPORTANT: Start image generation but don't await
    // We need to trigger it here, but it will complete asynchronously
    // The Promise reference must be kept alive by the runtime
    const imageGenerationPromise = this.startBackgroundImageGeneration(
      savedCase.id,
      evidence,
      locations,
      guiltyIndex
    );

    // Store the promise reference so it doesn't get garbage collected
    // This ensures the background task continues even after function returns
    (globalThis as any).__imageGenerationPromises = (globalThis as any).__imageGenerationPromises || new Map();
    (globalThis as any).__imageGenerationPromises.set(savedCase.id, imageGenerationPromise);

    // 7. GeneratedCase 형식으로 반환 (introSlides 포함)
    return {
      caseId: savedCase.id,
      id: savedCase.id,        // Alias for backward compatibility
      date: savedCase.date,    // Date string
      victim: savedCase.victim,
      weapon: elements.weapon,
      location: elements.location,
      suspects: savedCase.suspects.map((s, index) => ({
        id: s.id,
        name: s.name,
        archetype: s.archetype,
        background: suspectsWithImages[index].background,
        personality: suspectsWithImages[index].personality,
        isGuilty: s.isGuilty,
        profileImageUrl: suspectsWithImages[index].profileImageUrl
      })),
      solution: savedCase.solution,
      imageUrl: savedCase.imageUrl,
      cinematicImages: undefined, // Will be generated in background
      introNarration: savedCase.introNarration,
      introSlides: savedCase.introSlides, // FIXED: Include introSlides in return
      generatedAt: savedCase.generatedAt,
      locations: savedCase.locations,
      evidence: savedCase.evidence,
      evidenceDistribution: savedCase.evidenceDistribution
    };
  }

  /**
   * 트랜잭션으로 케이스 저장 (NEW!)
   *
   * TransactionManager를 사용하여 원자적 저장 및 롤백 보장
   */
  private async saveCaseWithTransaction(
    caseStory: {
      victim: { name: string; background: string; relationship: string };
      suspects: Array<{ name: string; background: string; personality: string; isGuilty: boolean; profileImageUrl?: string }>;
      solution: {
        who: string;
        what: string;
        where: string;
        when: string;
        why: string;
        how: string;
      };
    },
    elements: {
      weapon: Weapon;
      motive: Motive;
      location: Location;
      suspects: Suspect[];
    },
    suspectsWithImages: Array<{ name: string; background: string; personality: string; isGuilty: boolean; profileImageUrl?: string }>,
    imageUrl: string | undefined,
    introNarration: { atmosphere: string; incident: string; stakes: string } | undefined, // Legacy field for backward compatibility
    introSlides: IntroSlides,
    date: Date,
    customCaseId?: string,
    locations?: DiscoveryLocation[],
    evidence?: EvidenceItem[]
  ): Promise<CaseData> {
    const targetDate = date;
    const dateStr = targetDate.toISOString().split('T')[0];
    const caseId = customCaseId || `case-${dateStr}`;

    const suspectsWithIds = suspectsWithImages.map((suspect, index) => ({
      id: `${caseId}-suspect-${index + 1}`,
      name: suspect.name,
      archetype: elements.suspects[index].archetype,
      isGuilty: suspect.isGuilty
    }));

    const caseData: CaseData = {
      id: caseId,
      date: dateStr,
      victim: caseStory.victim,
      weapon: { name: elements.weapon.name, description: elements.weapon.description },
      location: { name: elements.location.name, description: elements.location.description },
      suspects: suspectsWithIds,
      solution: caseStory.solution,
      generatedAt: Date.now(),
      imageUrl,
      introNarration,
      introSlides,
      locations,
      evidence,
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
      // 시네마틱 이미지는 백그라운드에서 생성
      cinematicImages: null,
      imageGenerationStatus: 'pending' as ImageGenerationStatus,
      imageGenerationMeta: {
        startedAt: undefined,
        retryCount: 0
      }
    };

    const suspectDataList: SuspectData[] = suspectsWithImages.map((suspect, index) => {
    // Generate AP topics for each suspect
    const apTopics = generateDefaultAPTopics(suspect.isGuilty);

    return {
      id: suspectsWithIds[index].id,
      caseId: caseId,
      name: suspect.name,
      archetype: elements.suspects[index].archetype,
      background: suspect.background,
      personality: suspect.personality,
      isGuilty: suspect.isGuilty,
      emotionalState: {
        suspicionLevel: 0,
        tone: 'cooperative',
        lastUpdated: Date.now()
      },
      profileImageUrl: suspect.profileImageUrl,
      apTopics  // AP topics for interrogation
    };
  });

    // 트랜잭션 단계 생성
    const steps = CaseCreationTransaction.createSteps(caseData, suspectDataList, KVStoreManager);

    // 트랜잭션 실행 (실패 시 자동 롤백)
    const transactionManager = new TransactionManager();
    await transactionManager.executeTransaction(steps);

    console.log(`✅ Transaction completed in ${transactionManager.getDuration()}ms`);

    return caseData;
  }

  // REMOVED: generateIntroNarration() - Legacy narration system removed

  /**
   * NEW: Generate 3-slide intro (discovery, suspects, challenge)
   * Uses IntroSlidesGenerator which follows murder-mystery-intro skill patterns
   */
  private async generateIntroSlides(
    caseStory: {
      victim: { name: string; background: string };
      suspects: Array<{ name: string }>;
    },
    weapon: Weapon,
    location: Location,
    suspectArchetypes: Suspect[]
  ): Promise<IntroSlides> {
    // 🔧 FIX: Validate array lengths match
    if (caseStory.suspects.length !== suspectArchetypes.length) {
      console.warn(
        `⚠️  Array length mismatch: caseStory.suspects=${caseStory.suspects.length}, ` +
        `suspectArchetypes=${suspectArchetypes.length}. Normalizing to match.`
      );
    }

    // 🔧 FIX: Ensure we only process the minimum of both array lengths
    // This prevents undefined access while maintaining data integrity
    const minLength = Math.min(caseStory.suspects.length, suspectArchetypes.length);

    // 🔧 FIX: If we have more suspects in caseStory than archetypes, truncate
    // If we have fewer, only map the available ones
    const normalizedSuspects = caseStory.suspects.slice(0, minLength);

    // Prepare case data for IntroSlidesGenerator
    const caseData = {
      victim: caseStory.victim,
      suspects: normalizedSuspects.map((s, index) => ({
        id: `suspect-${index + 1}`,
        name: s.name,
        archetype: suspectArchetypes[index].archetype // Safe now: index < minLength
      })),
      weapon: { name: weapon.name },
      location: {
        name: location.name,
        description: location.description,
        atmosphere: location.atmosphere,
        props: location.props
      }
    };

    // 🔧 FIX: Log if we had to normalize
    if (normalizedSuspects.length < caseStory.suspects.length) {
      console.warn(
        `⚠️  Truncated ${caseStory.suspects.length - normalizedSuspects.length} ` +
        `suspect(s) to match archetype count`
      );
    }

    return await this.introSlidesGenerator.generateSlides(caseData);
  }

  // REMOVED: buildIntroNarrationPrompt() - Legacy narration system removed

  // REMOVED: generateFallbackNarration() - Legacy narration system removed

  /**
   * 케이스 스토리 생성 (Gemini)
   */
  private async generateCaseStory(
    weapon: Weapon,
    motive: Motive,
    location: Location,
    suspectArchetypes: Suspect[],
    temperature: number
  ): Promise<{
    victim: { name: string; background: string; relationship: string };
    suspects: Array<{
      name: string;
      background: string;
      personality: string;
      isGuilty: boolean;
    }>;
    solution: {
      who: string;
      what: string;
      where: string;
      when: string;
      why: string;
      how: string;
    };
  }> {
    const prompt = this.buildCaseStoryPrompt(weapon, motive, location, suspectArchetypes);

    const response = await this.geminiClient.generateText(prompt, {
      temperature,
      maxTokens: 4096
    });

    // JSON 파싱
    return this.geminiClient.parseJsonResponse(response.text);
  }

  /**
   * 케이스 스토리 생성 프롬프트
   */
  private buildCaseStoryPrompt(
    weapon: Weapon,
    motive: Motive,
    location: Location,
    suspectArchetypes: Suspect[]
  ): string {
    return `당신은 탐정 소설 작가입니다. 다음 요소들을 사용하여 플레이 가능한 살인 미스터리 케이스를 생성하세요.

**제약 조건:**
- 무기: ${weapon.name} (${weapon.description})
- 동기: ${motive.category} (${motive.description})
- 장소: ${location.name} (${location.description})
- 장소 소품: ${location.props.join(', ')}
- 용의자 원형: ${suspectArchetypes.map((s, i) => `${i + 1}. ${s.archetype}`).join(', ')}

**생성 규칙:**
1. **피해자**: 한국 이름, 설득력 있는 배경 스토리, 용의자들과의 관계
2. **용의자 3명**:
   - 각각 한국 이름
   - 제공된 원형을 기반으로 한 상세한 배경
   - 독특한 성격 특성
   - 한 명만 진범 (isGuilty: true)
3. **해결책 (5W1H)**:
   - WHO: 범인의 이름
   - WHAT: 정확한 살인 방법
   - WHERE: 구체적인 장소 (${location.props.join(' 또는 ')} 중 하나)
   - WHEN: 시간대
   - WHY: 명확한 동기
   - HOW: 상세한 실행 방법

**중요**:
- 진범은 3명 중 정확히 1명만
- 다른 2명은 알리바이가 있거나 의심스럽지만 결백함
- 해결책은 논리적이고 증명 가능해야 함

**응답 형식 (JSON):**
\`\`\`json
{
  "victim": {
    "name": "김명수",
    "background": "50대 중반의 성공한 사업가...",
    "relationship": "용의자들과의 관계 설명..."
  },
  "suspects": [
    {
      "name": "이서연",
      "background": "피해자의 비즈니스 파트너로...",
      "personality": "냉철하고 계산적이며...",
      "isGuilty": false
    },
    {
      "name": "박준호",
      "background": "피해자의 오랜 친구이자...",
      "personality": "충동적이고 감정적이며...",
      "isGuilty": true
    },
    {
      "name": "최민지",
      "background": "피해자의 전 부인으로...",
      "personality": "차분하지만 복수심이...",
      "isGuilty": false
    }
  ],
  "solution": {
    "who": "박준호",
    "what": "${weapon.name}을(를) 사용한 살인",
    "where": "${location.name}의 ${location.props[0]} 근처",
    "when": "2024년 1월 15일 오후 11시 30분경",
    "why": "${motive.category} - 구체적인 이유...",
    "how": "상세한 범행 방법..."
  }
}
\`\`\`

JSON만 응답하세요. 다른 설명은 필요 없습니다.`;
  }

  /**
   * 케이스 이미지 생성 프롬프트
   */
  private async generateCaseImage(
    location: Location,
    weapon: Weapon,
    victimName: string
  ): Promise<string> {
    const imagePrompt = this.buildImagePrompt(location, weapon, victimName);

    const response = await this.geminiClient.generateImage(imagePrompt);

    return response.imageUrl;
  }

  /**
   * 이미지 생성 프롬프트
   */
  private buildImagePrompt(
    location: Location,
    weapon: Weapon,
    victimName: string
  ): string {
    return `Crime scene illustration: ${location.name}, ${location.atmosphere}.
Scene includes ${location.props.slice(0, 3).join(', ')}.
Evidence of ${weapon.name}.
Dark, moody lighting.
Professional detective game art style.
No text, no people visible.
High quality, detailed, atmospheric.`;
  }

  /**
   * 용의자 프로필 이미지 생성 (순차 처리)
   *
   * Phase 1 수정: 병렬 → 순차 실행으로 변경
   * - Gemini API rate limiting 우회
   * - 각 이미지가 완전히 생성된 후 다음 이미지 생성
   * - 시간은 늘어나지만(~15초) 성공률 향상
   *
   * 🔧 BUG FIX: Normalize array lengths before processing
   * - Prevents accessing undefined array elements
   * - Ensures suspects.length === archetypes.length
   */
  private async generateSuspectProfileImages(
    suspects: Array<{
      name: string;
      background: string;
      personality: string;
      isGuilty: boolean;
    }>,
    archetypes: Suspect[],
    shouldGenerate: boolean
  ): Promise<Array<{
    name: string;
    background: string;
    personality: string;
    isGuilty: boolean;
    profileImageUrl?: string;
  }>> {
    if (!shouldGenerate) {
      console.log('⏭️  Skipping suspect profile image generation');
      return suspects;
    }

    // 🔧 FIX: Validate array lengths match BEFORE processing
    if (suspects.length !== archetypes.length) {
      console.warn(
        `⚠️  Array length mismatch detected in generateSuspectProfileImages:\n` +
        `   suspects=${suspects.length}, archetypes=${archetypes.length}\n` +
        `   Normalizing to minimum length to prevent undefined access`
      );
    }

    // 🔧 FIX: Use minimum length to prevent out-of-bounds access
    const minLength = Math.min(suspects.length, archetypes.length);
    const normalizedSuspects = suspects.slice(0, minLength);

    // 🔧 FIX: Log if we had to truncate
    if (normalizedSuspects.length < suspects.length) {
      console.warn(
        `⚠️  Truncated ${suspects.length - normalizedSuspects.length} suspect(s) ` +
        `to match archetype count (${archetypes.length})`
      );
    }

    console.log(`🎨 Generating profile images for ${normalizedSuspects.length} suspects (sequential)...`);

    // 순차 처리로 Gemini API rate limiting 우회
    const results: Array<{
      name: string;
      background: string;
      personality: string;
      isGuilty: boolean;
      profileImageUrl?: string;
    }> = [];

    // 🔧 FIX: Loop uses normalizedSuspects.length which matches archetypes.length
    for (let index = 0; index < normalizedSuspects.length; index++) {
      const suspect = normalizedSuspects[index];
      const archetype = archetypes[index]; // Safe: index < minLength

      // 🔧 FIX: Add validation to catch unexpected undefined
      if (!archetype) {
        console.error(
          `❌ CRITICAL: archetype[${index}] is undefined despite normalization!\n` +
          `   This should never happen. Skipping image generation for ${suspect.name}`
        );
        results.push(suspect);
        continue;
      }

      try {
        console.log(`🎨 Generating image ${index + 1}/${normalizedSuspects.length}: ${suspect.name}...`);

        const prompt = this.buildSuspectProfilePrompt(
          suspect,
          archetype // Now guaranteed to be defined
        );

        const response = await this.geminiClient.generateImage(prompt);

        console.log(`✅ Profile image generated for ${suspect.name}`);

        results.push({
          ...suspect,
          profileImageUrl: response.imageUrl
        });
      } catch (error) {
        console.error(`❌ Profile image generation failed for ${suspect.name}:`, error);
        // 이미지 실패해도 용의자 데이터는 유지
        results.push(suspect);
      }
    }

    console.log(`✅ Suspect profile images generated: ${results.filter(r => r.profileImageUrl).length}/${normalizedSuspects.length}`);

    return results;
  }

  /**
   * 용의자 프로필 이미지 프롬프트 생성
   */
  private buildSuspectProfilePrompt(
    suspect: {
      name: string;
      background: string;
      personality: string;
    },
    archetype: Suspect
  ): string {
    return `Professional portrait photograph of a ${archetype.archetype}.
Character: ${suspect.name}
Background: ${suspect.background}
Personality: ${suspect.personality}
Style: Professional headshot, cinematic lighting, shallow depth of field, neutral background.
Focus: Face and upper shoulders, direct eye contact with camera.
Quality: Photorealistic, high detail, professional photography.
Format: 512x512 portrait photograph.
Mood: Mystery, intrigue, subtle emotional expression.`;
  }

  /**
   * 케이스에 대한 장소 생성
   *
   * @param location - 범죄 현장 정보
   * @param weapon - 사용된 무기
   * @returns 4개의 탐색 가능한 장소
   */
  private generateLocationsForCase(
    location: Location,
    weapon: Weapon
  ): DiscoveryLocation[] {
    return [
      {
        id: 'crime-scene',
        name: location.name,
        description: `범죄 현장. ${location.description}`,
        emoji: '🔍'
      },
      {
        id: 'victim-residence',
        name: '피해자의 거주지',
        description: '피해자가 살던 곳. 개인적인 물건과 흔적이 남아있다.',
        emoji: '🏠'
      },
      {
        id: 'suspect-location',
        name: '용의자 관련 장소',
        description: '범인과 연관된 장소. 중요한 단서가 있을 수 있다.',
        emoji: '📍'
      },
      {
        id: 'witness-area',
        name: '목격자 지역',
        description: '사건 당시 목격자들이 있던 구역. 추가 정보를 얻을 수 있다.',
        emoji: '👥'
      }
    ];
  }

  /**
   * 케이스에 대한 증거 생성
   *
   * @param weapon - 사용된 무기
   * @param motive - 범행 동기
   * @param suspects - 용의자 목록
   * @returns 10개의 증거 (4 critical, 3 supporting, 3 red herrings)
   */
  private generateEvidenceForCase(
    weapon: Weapon,
    motive: Motive,
    suspects: Array<{ name: string; isGuilty: boolean }>
  ): EvidenceItem[] {
    // 범인 찾기
    const guiltyIndex = suspects.findIndex(s => s.isGuilty);
    const guiltyName = suspects[guiltyIndex]?.name || '알 수 없음';

    const evidence: EvidenceItem[] = [];

    // Critical Evidence (4개) - 범인을 가리키는 결정적 증거
    const criticalDifficulty: DiscoveryDifficulty = 'obvious';
    evidence.push({
      id: 'evidence-critical-1',
      type: 'physical',
      name: `${weapon.name} 발견`,
      description: `범행에 사용된 ${weapon.name}이(가) 발견되었다. ${weapon.description}`,
      discoveryHint: '범죄 현장을 주의 깊게 살펴보세요.',
      interpretationHint: `이 무기는 ${guiltyName}의 소유물로 추정됩니다.`,
      relevance: 'critical',
      pointsToSuspect: guiltyIndex,
      discoveryDifficulty: criticalDifficulty,
      discoveryProbability: getDiscoveryProbability(criticalDifficulty, 'critical'),
      foundAtLocationId: 'crime-scene'
    });

    evidence.push({
      id: 'evidence-critical-2',
      type: 'forensic',
      name: '지문 분석 결과',
      description: '범행 현장에서 채취한 지문이 특정 인물과 일치합니다.',
      discoveryHint: '감식팀의 보고서를 확인하세요.',
      interpretationHint: `지문은 ${guiltyName}의 것으로 확인되었습니다.`,
      relevance: 'critical',
      pointsToSuspect: guiltyIndex,
      discoveryDifficulty: criticalDifficulty,
      discoveryProbability: getDiscoveryProbability(criticalDifficulty, 'critical'),
      foundAtLocationId: 'crime-scene'
    });

    evidence.push({
      id: 'evidence-critical-3',
      type: 'communication',
      name: '협박 메시지',
      description: `피해자에게 보낸 협박 메시지가 발견되었습니다. 동기: ${motive.category}`,
      discoveryHint: '피해자의 휴대폰을 조사하세요.',
      interpretationHint: `발신자는 ${guiltyName}입니다.`,
      relevance: 'critical',
      pointsToSuspect: guiltyIndex,
      discoveryDifficulty: criticalDifficulty,
      discoveryProbability: getDiscoveryProbability(criticalDifficulty, 'critical'),
      foundAtLocationId: 'victim-residence'
    });

    evidence.push({
      id: 'evidence-critical-4',
      type: 'alibi',
      name: '목격자 진술',
      description: '사건 당시 특정 인물이 현장 근처에 있었다는 목격 증언.',
      discoveryHint: '주변 목격자들과 대화하세요.',
      interpretationHint: `목격자는 ${guiltyName}을(를) 봤다고 진술했습니다.`,
      relevance: 'critical',
      pointsToSuspect: guiltyIndex,
      discoveryDifficulty: criticalDifficulty,
      discoveryProbability: getDiscoveryProbability(criticalDifficulty, 'critical'),
      foundAtLocationId: 'witness-area'
    });

    // Supporting Evidence (3개) - 보조 증거
    const importantDifficulty: DiscoveryDifficulty = 'medium';
    evidence.push({
      id: 'evidence-supporting-1',
      type: 'financial',
      name: '금융 거래 기록',
      description: '수상한 금융 거래 내역이 발견되었습니다.',
      discoveryHint: '피해자의 은행 계좌를 추적하세요.',
      interpretationHint: '범행 동기와 연관이 있을 수 있습니다.',
      relevance: 'important',
      discoveryDifficulty: importantDifficulty,
      discoveryProbability: getDiscoveryProbability(importantDifficulty, 'important'),
      foundAtLocationId: 'victim-residence'
    });

    evidence.push({
      id: 'evidence-supporting-2',
      type: 'documentary',
      name: '계약서 사본',
      description: '피해자와 용의자 간의 계약 문서가 발견되었습니다.',
      discoveryHint: '피해자의 서류를 검토하세요.',
      interpretationHint: '관계의 성격을 파악하는 데 도움이 됩니다.',
      relevance: 'important',
      discoveryDifficulty: importantDifficulty,
      discoveryProbability: getDiscoveryProbability(importantDifficulty, 'important'),
      foundAtLocationId: 'victim-residence'
    });

    evidence.push({
      id: 'evidence-supporting-3',
      type: 'testimony',
      name: '주변인 증언',
      description: '피해자와 용의자의 관계에 대한 제3자 증언.',
      discoveryHint: '주변 사람들과 인터뷰하세요.',
      interpretationHint: '사건 배경을 이해하는 데 유용합니다.',
      relevance: 'important',
      discoveryDifficulty: importantDifficulty,
      discoveryProbability: getDiscoveryProbability(importantDifficulty, 'important'),
      foundAtLocationId: 'witness-area'
    });

    // Red Herrings (3개) - 혼란을 주는 증거
    const minorDifficulty: DiscoveryDifficulty = 'hidden';
    const innocentIndices = suspects
      .map((s, i) => ({ index: i, guilty: s.isGuilty }))
      .filter(s => !s.guilty)
      .map(s => s.index);

    evidence.push({
      id: 'evidence-redherring-1',
      type: 'physical',
      name: '의심스러운 물건',
      description: '현장에서 발견된 의심스러운 물건이지만 범행과는 무관합니다.',
      discoveryHint: '현장을 철저히 수색하세요.',
      interpretationHint: '이 증거는 실제 범인과 관련이 없습니다.',
      relevance: 'minor',
      pointsToSuspect: innocentIndices[0],
      discoveryDifficulty: minorDifficulty,
      discoveryProbability: getDiscoveryProbability(minorDifficulty, 'minor'),
      foundAtLocationId: 'suspect-location'
    });

    evidence.push({
      id: 'evidence-redherring-2',
      type: 'alibi',
      name: '잘못된 목격 정보',
      description: '사건과 무관한 시간대의 목격 정보입니다.',
      discoveryHint: '목격자들의 진술을 수집하세요.',
      interpretationHint: '이 정보는 사건과 무관할 수 있습니다.',
      relevance: 'minor',
      pointsToSuspect: innocentIndices[1],
      discoveryDifficulty: minorDifficulty,
      discoveryProbability: getDiscoveryProbability(minorDifficulty, 'minor'),
      foundAtLocationId: 'witness-area'
    });

    evidence.push({
      id: 'evidence-redherring-3',
      type: 'communication',
      name: '오해의 소지가 있는 대화',
      description: '의심스러워 보이지만 실제로는 무관한 대화 기록.',
      discoveryHint: '통신 기록을 분석하세요.',
      interpretationHint: '맥락을 고려하면 범행과 무관합니다.',
      relevance: 'minor',
      pointsToSuspect: innocentIndices[0],
      discoveryDifficulty: minorDifficulty,
      discoveryProbability: getDiscoveryProbability(minorDifficulty, 'minor'),
      foundAtLocationId: 'suspect-location'
    });

    return evidence;
  }

  /**
   * Convert EvidenceItem[] to MultilingualEvidence format
   *
   * @param caseId - Case ID
   * @param evidence - Evidence items array
   * @param guiltyIndex - Index of guilty suspect
   * @returns MultilingualEvidence object for image generation
   */
  private convertToMultilingualEvidence(
    caseId: string,
    evidence: EvidenceItem[],
    guiltyIndex: number
  ): MultilingualEvidence {
    const criticalCount = evidence.filter(e => e.relevance === 'critical').length;
    const evidencePointingToGuilty = evidence.filter(e => e.pointsToSuspect === guiltyIndex).length;
    const threeClueRuleCompliant = criticalCount >= 3 && evidencePointingToGuilty >= 3;

    const evidenceContent: EvidenceContent = {
      items: evidence,
      summary: `${evidence.length}개의 증거가 발견되었습니다. ${criticalCount}개의 결정적 증거가 포함되어 있습니다.`
    };

    return {
      caseId,
      locationId: caseId, // Use caseId as locationId for case-wide evidence
      translations: {
        ko: evidenceContent,
        en: evidenceContent // For now, use same content for both languages
      },
      metadata: {
        totalItems: evidence.length,
        criticalCount,
        threeClueRuleCompliant,
        guiltyIndex,
        evidencePointingToGuilty
      },
      generatedAt: Date.now()
    };
  }

  /**
   * Start background image generation for evidence and locations
   *
   * This method starts image generation without blocking the main thread.
   * Images will be generated progressively and can be polled by the client.
   *
   * @param caseId - Case ID
   * @param evidence - Evidence items
   * @param locations - Locations to generate images for
   * @param guiltyIndex - Index of guilty suspect
   */
  private startBackgroundImageGeneration(
    caseId: string,
    evidence: EvidenceItem[],
    locations: DiscoveryLocation[],
    guiltyIndex: number
  ): Promise<void> {
    console.log(`\n🚀 ============================================`);
    console.log(`🚀 Starting Background Image Generation`);
    console.log(`🚀 Case: ${caseId}`);
    console.log(`🚀 Evidence Count: ${evidence.length}`);
    console.log(`🚀 Location Count: ${locations.length}`);
    console.log(`🚀 ============================================\n`);

    // Convert evidence to MultilingualEvidence format
    const multilingualEvidence = this.convertToMultilingualEvidence(
      caseId,
      evidence,
      guiltyIndex
    );

    // IMPORTANT: Create fresh service instances inside the Promise
    // This ensures services aren't garbage collected when CaseGeneratorService instance is destroyed
    const generationPromise = (async () => {
      try {
        // Get fresh adapter reference
        const adapter = KVStoreManager.getAdapter();
        console.log('🔧 Background: Retrieved KV adapter for image generation');

        // Create fresh service instances for background operation
        const imageGenerator = new ImageGenerator(this.geminiClient);
        const storageService = new ImageStorageService(adapter);
        const evidenceService = new EvidenceImageGeneratorService(imageGenerator, storageService);
        const locationService = new LocationImageGeneratorService(imageGenerator, storageService);

        console.log('✅ Background: Service instances created successfully');

        // Initialize image generation status tracking
        await storageService.initializeImageGenerationStatus(
          caseId,
          multilingualEvidence.length,
          locations.length
        );
        console.log('✅ Background: Image generation status initialized');

        // Generate images in parallel
        await Promise.all([
          evidenceService.generateEvidenceImages(caseId, multilingualEvidence)
            .catch((error) => {
              console.error(`❌ Evidence image generation failed for case ${caseId}:`, error);
            }),
          locationService.generateLocationImages(caseId, locations)
            .catch((error) => {
              console.error(`❌ Location image generation failed for case ${caseId}:`, error);
            })
        ]);

        console.log(`\n✅ ============================================`);
        console.log(`✅ Background Image Generation Complete`);
        console.log(`✅ Case: ${caseId}`);
        console.log(`✅ ============================================\n`);

        // Cleanup: Remove from global map when complete
        if ((globalThis as any).__imageGenerationPromises) {
          (globalThis as any).__imageGenerationPromises.delete(caseId);
        }
      } catch (error) {
        console.error(`❌ Unexpected error in background image generation for case ${caseId}:`, error);

        // Cleanup: Remove from global map on error
        if ((globalThis as any).__imageGenerationPromises) {
          (globalThis as any).__imageGenerationPromises.delete(caseId);
        }

        throw error;
      }
    })();

    console.log(`🔄 Background image generation started (non-blocking)`);
    return generationPromise;
  }

  /**
   * 오늘의 케이스 조회 또는 생성
   */
  async getTodaysCase(options: { includeImage?: boolean; includeSuspectImages?: boolean } = {}): Promise<GeneratedCase> {
    // 이미 생성된 케이스가 있는지 확인
    const existingCase = await CaseRepository.getTodaysCase();

    if (existingCase) {
      console.log(`✅ Today's case already exists: ${existingCase.id}`);

      // GeneratedCase 형식으로 변환
      const suspects = await CaseRepository.getCaseSuspects(existingCase.id);

      return {
        caseId: existingCase.id,
        id: existingCase.id,        // Alias for backward compatibility
        date: existingCase.date,    // Date string
        victim: existingCase.victim,
        weapon: existingCase.weapon as Weapon,
        location: existingCase.location as Location,
        suspects: suspects.map(s => ({
          id: s.id,
          name: s.name,
          archetype: s.archetype,
          background: s.background,
          personality: s.personality,
          isGuilty: s.isGuilty,
          profileImageUrl: s.profileImageUrl
        })),
        solution: existingCase.solution,
        imageUrl: existingCase.imageUrl,
        introNarration: existingCase.introNarration,
        introSlides: existingCase.introSlides, // FIXED: Include introSlides
        generatedAt: existingCase.generatedAt,
        locations: existingCase.locations,
        evidence: existingCase.evidence,
        evidenceDistribution: existingCase.evidenceDistribution
      };
    }

    // 새로 생성
    console.log(`🔄 Generating today's case...`);
    return await this.generateCase({
      date: new Date(),
      includeImage: options.includeImage,
      includeSuspectImages: options.includeSuspectImages
    });
  }

  /**
   * 특정 날짜의 케이스 조회 또는 생성
   */
  async getCaseForDate(
    date: Date,
    options: { includeImage?: boolean; includeSuspectImages?: boolean } = {}
  ): Promise<GeneratedCase> {
    const dateStr = date.toISOString().split('T')[0];
    const existingCase = await CaseRepository.getCaseByDate(dateStr);

    if (existingCase) {
      console.log(`✅ Case already exists for ${dateStr}: ${existingCase.id}`);

      const suspects = await CaseRepository.getCaseSuspects(existingCase.id);

      return {
        caseId: existingCase.id,
        id: existingCase.id,        // Alias for backward compatibility
        date: existingCase.date,    // Date string
        victim: existingCase.victim,
        weapon: existingCase.weapon as Weapon,
        location: existingCase.location as Location,
        suspects: suspects.map(s => ({
          id: s.id,
          name: s.name,
          archetype: s.archetype,
          background: s.background,
          personality: s.personality,
          isGuilty: s.isGuilty,
          profileImageUrl: s.profileImageUrl
        })),
        solution: existingCase.solution,
        imageUrl: existingCase.imageUrl,
        introNarration: existingCase.introNarration,
        introSlides: existingCase.introSlides, // FIXED: Include introSlides
        generatedAt: existingCase.generatedAt,
        locations: existingCase.locations,
        evidence: existingCase.evidence,
        evidenceDistribution: existingCase.evidenceDistribution
      };
    }

    // 새로 생성
    console.log(`🔄 Generating case for ${dateStr}...`);
    return await this.generateCase({
      date,
      includeImage: options.includeImage,
      includeSuspectImages: options.includeSuspectImages
    });
  }
}

/**
 * 싱글톤 인스턴스 생성 헬퍼
 */
export function createCaseGeneratorService(geminiClient: GeminiClient): CaseGeneratorService {
  return new CaseGeneratorService(geminiClient);
}
