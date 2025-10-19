/**
 * CinematicImageService.ts
 *
 * 시네마틱 인트로 이미지 생성 서비스
 * - 3개의 핵심 씬 타입별 이미지 생성 (최적화)
 * - 순차 생성 (Gemini API rate limit 준수)
 * - Fallback 이미지 시스템
 */

import { GeminiClient } from '../gemini/GeminiClient';
import type { Weapon, Location } from '../case/CaseElementLibrary';

/**
 * 씬 타입 정의 (최적화: 3개 핵심 씬만)
 */
export type CinematicSceneType = 'establishing' | 'confrontation' | 'action';

/**
 * 씬 설정
 */
export interface CinematicSceneConfig {
  /** 씬 타입 */
  type: CinematicSceneType;

  /** 씬 이름 (한글) */
  name: string;

  /** 씬 설명 */
  description: string;

  /** 카메라 앵글 */
  cameraAngle: string;

  /** 조명 스타일 */
  lighting: string;

  /** 분위기 키워드 */
  mood: string[];
}

/**
 * 시네마틱 이미지 결과 (최적화: 3개 핵심 씬)
 */
export interface CinematicImages {
  /** Establishing (Discovery) 씬 이미지 - 범죄 현장 발견 */
  establishing?: string;

  /** Confrontation (Evidence) 씬 이미지 - 증거 대면 */
  confrontation?: string;

  /** Action (Beginning) 씬 이미지 - 수사 시작 */
  action?: string;
}

/**
 * 씬별 설정 템플릿 (최적화: 3개 핵심 씬만)
 */
const SCENE_CONFIGS: Record<CinematicSceneType, CinematicSceneConfig> = {
  establishing: {
    type: 'establishing',
    name: '범죄 현장 발견',
    description: 'Wide establishing shot of crime scene exterior',
    cameraAngle: 'Wide angle, establishing shot, slightly elevated',
    lighting: 'Dramatic moody lighting, film noir style, deep shadows',
    mood: ['ominous', 'mysterious', 'foreboding', 'isolated']
  },

  confrontation: {
    type: 'confrontation',
    name: '증거 대면',
    description: 'Close-up of crucial evidence, tension peak',
    cameraAngle: 'Extreme close-up, macro lens, shallow depth of field',
    lighting: 'Spotlight on evidence, surrounding darkness',
    mood: ['shocking', 'disturbing', 'revelatory', 'intimate']
  },

  action: {
    type: 'action',
    name: '수사 시작',
    description: 'Detective case file opening, investigation begins',
    cameraAngle: 'Overhead shot, bird\'s eye view, flat lay',
    lighting: 'Desk lamp lighting, warm focused light, noir aesthetic',
    mood: ['determined', 'focused', 'professional', 'beginning']
  }
};

/**
 * CinematicImageService
 *
 * 시네마틱 인트로용 이미지를 순차적으로 생성합니다. (최적화: 3개 핵심 씬)
 */
export class CinematicImageService {
  constructor(private geminiClient: GeminiClient) {}

  /**
   * 3개의 핵심 시네마틱 이미지를 순차적으로 생성 (최적화)
   *
   * @param location - 케이스 장소
   * @param weapon - 케이스 무기
   * @param victimName - 피해자 이름
   * @returns 생성된 이미지 URL 맵 (establishing, confrontation, action)
   */
  async generateCinematicImages(
    location: Location,
    weapon: Weapon,
    victimName: string
  ): Promise<CinematicImages> {
    console.log(`🎬 Generating 3 cinematic images (sequential, optimized)...`);

    // 3개의 핵심 씬 타입 (최적화)
    const sceneTypes: CinematicSceneType[] = [
      'establishing',  // 범죄 현장 발견
      'confrontation', // 증거 대면
      'action'         // 수사 시작
    ];

    const cinematicImages: CinematicImages = {};
    let successCount = 0;

    // 순차 생성 (Gemini API rate limit 준수)
    for (const sceneType of sceneTypes) {
      try {
        console.log(`🎨 Generating ${sceneType} scene (${successCount + 1}/3)...`);

        const imageUrl = await this.generateSingleScene(
          sceneType,
          location,
          weapon,
          victimName
        );

        cinematicImages[sceneType] = imageUrl;
        successCount++;
        console.log(`✅ ${sceneType} scene generated`);

        // API rate limit 준수를 위한 짧은 딜레이 (마지막 이미지는 제외)
        if (sceneType !== 'action') {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.warn(`⚠️  Failed to generate ${sceneType} scene:`, error);
        // Fallback: undefined (프론트엔드에서 처리)
      }
    }

    console.log(`🎬 Cinematic images: ${successCount}/3 scenes generated`);

    return cinematicImages;
  }

  /**
   * 단일 씬 이미지 생성
   *
   * @param sceneType - 씬 타입
   * @param location - 케이스 장소
   * @param weapon - 케이스 무기
   * @param victimName - 피해자 이름
   * @returns 생성된 이미지 URL
   */
  private async generateSingleScene(
    sceneType: CinematicSceneType,
    location: Location,
    weapon: Weapon,
    victimName: string
  ): Promise<string> {
    const config = SCENE_CONFIGS[sceneType];

    // 프롬프트 생성
    const prompt = this.buildPrompt(config, location, weapon, victimName);

    // Gemini API 호출 (maxRetries: 3)
    const response = await this.geminiClient.generateImage(prompt, 3);

    if (!response || !response.imageUrl) {
      throw new Error(`No image URL returned for ${sceneType} scene`);
    }

    return response.imageUrl;
  }

  /**
   * 씬별 프롬프트 생성 (최적화: 토큰 50% 감소)
   *
   * @param config - 씬 설정
   * @param location - 케이스 장소
   * @param weapon - 케이스 무기
   * @param victimName - 피해자 이름
   * @returns 최적화된 프롬프트
   */
  private buildPrompt(
    config: CinematicSceneConfig,
    location: Location,
    weapon: Weapon,
    victimName: string
  ): string {
    // ai-prompt-engineer 스킬 적용: 간결하고 명확한 구조
    const optimizedPrompt = `
Cinematic murder mystery: ${config.description}

Location: ${location.name} - ${location.atmosphere}
Weapon: ${weapon.name}
Camera: ${config.cameraAngle}
Lighting: ${config.lighting}

Film noir crime scene, ${config.mood.join(', ')}
Standard HD quality, NO text, NO faces, atmospheric focus
    `.trim();

    return optimizedPrompt;
  }

  /**
   * Fallback 이미지 URL 생성 (최적화: 3개 씬만)
   *
   * 실패한 씬에 대한 대체 이미지 (solid color gradient)
   *
   * @param sceneType - 씬 타입
   * @returns Data URL (SVG gradient)
   */
  static getFallbackImage(sceneType: CinematicSceneType): string {
    const gradients: Record<CinematicSceneType, string> = {
      establishing: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      confrontation: 'linear-gradient(135deg, #3d1a1a 0%, #2d0a0a 100%)',
      action: 'linear-gradient(135deg, #2d2d1a 0%, #1a1a0a 100%)',
    };

    const gradient = gradients[sceneType];

    // SVG data URL
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${gradient.split(' ')[1].split(',')[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${gradient.split(' ')[2].split(')')[0]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#grad)" />
      </svg>
    `.trim();

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
}
