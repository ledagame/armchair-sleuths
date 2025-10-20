import { promises as fs } from 'fs';
import path from 'path';
import { GeminiClient } from '../gemini/GeminiClient';

/**
 * 이미지 생성 요청 인터페이스
 */
export interface ImageGenerationRequest {
  id: string;
  type: 'suspect' | 'location' | 'evidence' | 'case';
  prompt: string;
  description: string;
}

/**
 * 이미지 생성 결과 인터페이스
 */
export interface ImageGenerationResult {
  id: string;
  success: boolean;
  imageUrl?: string;
  error?: string;
  cached?: boolean;
}

/**
 * 배치 생성 옵션
 */
export interface BatchGenerationOptions {
  batchSize?: number;
  maxRetries?: number;
  delayBetweenBatches?: number;
}

/**
 * ImageGenerator 클래스
 * Gemini API를 사용하여 케이스 관련 이미지를 생성합니다.
 */
export class ImageGenerator {
  private cache = new Map<string, string>();

  constructor(private geminiClient: GeminiClient) {}

  /**
   * 단일 이미지 생성
   */
  async generateSingle(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    try {
      console.log(`🖼️  Generating ${request.type} image: ${request.id}`);
      
      // 캐시 확인
      const cacheKey = this.getCacheKey(request);
      if (this.cache.has(cacheKey)) {
        console.log(`   📦 Using cached image for ${request.id}`);
        return {
          id: request.id,
          success: true,
          imageUrl: this.cache.get(cacheKey)!,
          cached: true
        };
      }

      // 이미지 생성
      const imageUrl = await this.geminiClient.generateImage(request.prompt);
      
      if (imageUrl) {
        // 캐시에 저장
        this.cache.set(cacheKey, imageUrl);
        
        console.log(`   ✅ Generated ${request.type} image: ${request.id}`);
        return {
          id: request.id,
          success: true,
          imageUrl,
          cached: false
        };
      } else {
        console.warn(`   ⚠️  Failed to generate image: ${request.id}`);
        return {
          id: request.id,
          success: false,
          error: 'Image generation returned null'
        };
      }
    } catch (error) {
      console.error(`   ❌ Error generating image ${request.id}:`, error);
      return {
        id: request.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 배치 이미지 생성
   */
  async generateBatch(
    requests: ImageGenerationRequest[],
    options: BatchGenerationOptions = {}
  ): Promise<ImageGenerationResult[]> {
    const {
      batchSize = 5,
      maxRetries = 2,
      delayBetweenBatches = 1000
    } = options;

    console.log(`\n🖼️  ============================================`);
    console.log(`🖼️  이미지 배치 생성 시작`);
    console.log(`🖼️  ============================================`);
    console.log(`   총 이미지 수: ${requests.length}`);
    console.log(`   배치 크기: ${batchSize}`);
    console.log(`   최대 재시도: ${maxRetries}`);

    const results: ImageGenerationResult[] = [];
    
    // 배치로 나누어 처리
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(requests.length / batchSize);
      
      console.log(`\n📦 배치 ${batchNumber}/${totalBatches} 처리 중... (${batch.length}개 이미지)`);
      
      // 배치 내 병렬 처리
      const batchPromises = batch.map(request => 
        this.generateWithRetry(request, maxRetries)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      // 결과 처리
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`   ❌ Batch item ${index} failed:`, result.reason);
          results.push({
            id: batch[index].id,
            success: false,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });
      
      // 배치 간 대기 (마지막 배치가 아닌 경우)
      if (i + batchSize < requests.length) {
        console.log(`   ⏳ ${delayBetweenBatches}ms 대기 중...`);
        await this.sleep(delayBetweenBatches);
      }
    }

    // 통계 출력
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const cachedCount = results.filter(r => r.cached).length;

    console.log(`\n✅ ============================================`);
    console.log(`✅ 이미지 배치 생성 완료`);
    console.log(`✅ ============================================`);
    console.log(`   성공: ${successCount}/${requests.length} (${Math.round(successCount/requests.length*100)}%)`);
    console.log(`   실패: ${failureCount}`);
    console.log(`   캐시: ${cachedCount}`);

    // 실패율 경고
    if (failureCount / requests.length > 0.5) {
      console.warn(`\n⚠️  경고: 이미지 생성 실패율이 50%를 초과했습니다!`);
      console.warn(`   실패한 이미지: ${failureCount}/${requests.length}`);
    }

    return results;
  }

  /**
   * 재시도 로직이 포함된 이미지 생성
   */
  private async generateWithRetry(
    request: ImageGenerationRequest,
    maxRetries: number
  ): Promise<ImageGenerationResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const result = await this.generateSingle(request);
        if (result.success) {
          return result;
        }
        lastError = new Error(result.error || 'Generation failed');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt <= maxRetries) {
          console.log(`   🔄 Retrying ${request.id} (attempt ${attempt}/${maxRetries})`);
          await this.sleep(1000 * attempt); // 지수 백오프
        }
      }
    }
    
    return {
      id: request.id,
      success: false,
      error: lastError?.message || 'Max retries exceeded'
    };
  }

  /**
   * 용의자 이미지 생성 요청 생성
   * Enhanced with film noir style guide (suspect-portrait-prompter template ready for future use)
   */
  generateSuspectImageRequest(suspect: any): ImageGenerationRequest {
    // TODO: Load from skills/suspect-portrait-prompter/PROMPT.md for full style consistency
    // Current: Simplified prompt with enhanced film noir guidance
    return {
      id: suspect.id,
      type: 'suspect',
      prompt: `Professional portrait photograph of ${suspect.name}, ${suspect.background}. ${suspect.personality}. Film noir style, 1940s-1950s aesthetic, Rembrandt lighting, dramatic shadows, high contrast black and white photography, serious contemplative expression, 512x512 portrait, photorealistic quality.`,
      description: `${suspect.name} - ${suspect.background}`
    };
  }

  /**
   * 장소 이미지 생성 요청 생성
   * Enhanced with film noir atmosphere guide (scene-atmosphere-prompter template ready for future use)
   */
  generateLocationImageRequest(location: any): ImageGenerationRequest {
    // TODO: Load from skills/scene-atmosphere-prompter/PROMPT.md for full atmospheric consistency
    // Current: Simplified prompt with enhanced noir cinematography guidance
    return {
      id: location.id,
      type: 'location',
      prompt: `Atmospheric environmental photography of ${location.name}: ${location.description}. Film noir aesthetic, 1940s-1950s period, dramatic noir lighting, strong shadows, moody atmosphere, dark mysterious setting, empty location without people, cinematic composition, high quality environmental photography, 512x512 format.`,
      description: `${location.name} - ${location.description}`
    };
  }

  /**
   * 증거 이미지 생성 요청 생성
   */
  generateEvidenceImageRequest(evidence: any): ImageGenerationRequest {
    return {
      id: evidence.id,
      type: 'evidence',
      prompt: `${evidence.name}: ${evidence.description}. Evidence photography style, clear detail, forensic quality.`,
      description: `${evidence.name} - ${evidence.description}`
    };
  }

  /**
   * 케이스 씬 이미지 생성 요청 생성
   */
  generateCaseImageRequest(caseData: any): ImageGenerationRequest {
    return {
      id: 'case-scene',
      type: 'case',
      prompt: `Crime scene at ${caseData.mainLocation}. ${caseData.description}. Dark, atmospheric, mystery novel cover style.`,
      description: `Case scene - ${caseData.title}`
    };
  }

  /**
   * 캐시 키 생성
   */
  private getCacheKey(request: ImageGenerationRequest): string {
    return `${request.type}:${request.prompt.slice(0, 100)}`;
  }

  /**
   * 대기 함수
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 플레이스홀더 이미지 URL 반환
   */
  getPlaceholderUrl(type: string): string {
    const placeholders = {
      suspect: '/placeholder-suspect.svg',
      location: '/placeholder-location.svg',
      evidence: '/placeholder-evidence.svg',
      case: '/placeholder-case.svg'
    };
    return placeholders[type as keyof typeof placeholders] || '/placeholder.svg';
  }
}
