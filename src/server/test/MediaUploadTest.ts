/**
 * MediaUploadTest.ts
 *
 * context.media.upload() API 검증 테스트
 *
 * 목적: 대규모 변경 전에 API 작동 여부 및 제약사항 파악
 *
 * 테스트 단계:
 * 1. API 존재 확인
 * 2. 단일 이미지 업로드
 * 3. 순차 5개 업로드
 * 4. 병렬 5개 업로드
 * 5. 전체 14개 업로드
 */

import type { Context } from '@devvit/web/server';
import { createGeminiClient } from '../services/gemini/GeminiClient';
import { ImageGenerator } from '../services/generators/ImageGenerator';

export interface TestMetrics {
  testName: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
  details?: Record<string, any>;
}

export interface UploadMetrics {
  imageIndex: number;
  geminiGenerationTime: number;
  uploadTime: number;
  totalTime: number;
  success: boolean;
  mediaId?: string;
  error?: string;
  fileSize?: number;
}

export interface BatchTestResult {
  totalCount: number;
  successCount: number;
  failureCount: number;
  totalDuration: number;
  averageTime: number;
  uploads: UploadMetrics[];
  constraints?: {
    rateLimitDetected: boolean;
    maxFileSize?: number;
    maxConcurrency?: number;
  };
}

export class MediaUploadTest {
  constructor(
    private context: Context,
    private geminiApiKey: string
  ) {}

  /**
   * Test 1: API 존재 확인
   */
  async testApiAvailability(): Promise<TestMetrics> {
    const startTime = Date.now();
    console.log('\n🔍 ============================================');
    console.log('🔍 Test 1: API Availability Check');
    console.log('🔍 ============================================\n');

    try {
      // Check if context.media exists
      if (!this.context.media) {
        throw new Error('context.media is undefined');
      }

      // Check if upload function exists
      if (typeof this.context.media.upload !== 'function') {
        throw new Error('context.media.upload is not a function');
      }

      console.log('✅ context.media.upload exists and is a function');

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`\n✅ Test 1 Complete: ${duration}ms\n`);

      return {
        testName: 'API Availability',
        startTime,
        endTime,
        duration,
        success: true,
        details: {
          contextMediaExists: true,
          uploadFunctionExists: true
        }
      };

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.error('❌ Test 1 Failed:', error);

      return {
        testName: 'API Availability',
        startTime,
        endTime,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test 2: 단일 이미지 업로드
   */
  async testSingleUpload(): Promise<TestMetrics> {
    const startTime = Date.now();
    console.log('\n🖼️  ============================================');
    console.log('🖼️  Test 2: Single Image Upload');
    console.log('🖼️  ============================================\n');

    try {
      // 1. Gemini로 간단한 이미지 생성
      console.log('📝 Generating test image with Gemini...');
      const geminiStart = Date.now();

      const geminiClient = createGeminiClient(this.geminiApiKey);
      const imageGenerator = new ImageGenerator(geminiClient);

      const prompt = `
A simple test image for API validation.
Content: A detective's magnifying glass on a wooden desk.
Style: Photorealistic, well-lit, clean composition.
Format: JPEG, moderate quality.
      `.trim();

      const result = await imageGenerator.generateSingle({
        prompt,
        aspectRatio: '16:9'
      });

      const geminiDuration = Date.now() - geminiStart;
      console.log(`✅ Image generated in ${geminiDuration}ms`);
      console.log(`   URL: ${result.imageUrl.substring(0, 60)}...`);

      // 2. context.media.upload() 호출
      console.log('\n📤 Uploading to Reddit CDN...');
      const uploadStart = Date.now();

      const uploadResult = await this.context.media.upload({
        url: result.imageUrl,
        type: 'image'
      });

      const uploadDuration = Date.now() - uploadStart;
      console.log(`✅ Upload complete in ${uploadDuration}ms`);
      console.log(`   Media ID: ${uploadResult.mediaId}`);

      // 3. mediaId 형식 확인
      const isReddItUrl = uploadResult.mediaId.includes('i.redd.it') ||
                          uploadResult.mediaId.includes('preview.redd.it');
      console.log(`   Is Reddit URL: ${isReddItUrl ? '✅' : '❌'}`);

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      console.log(`\n✅ Test 2 Complete: ${totalDuration}ms\n`);

      return {
        testName: 'Single Upload',
        startTime,
        endTime,
        duration: totalDuration,
        success: true,
        details: {
          geminiGenerationTime: geminiDuration,
          uploadTime: uploadDuration,
          mediaId: uploadResult.mediaId,
          isRedditCDN: isReddItUrl,
          geminiUrl: result.imageUrl.substring(0, 100)
        }
      };

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.error('❌ Test 2 Failed:', error);

      return {
        testName: 'Single Upload',
        startTime,
        endTime,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test 3: 순차 업로드 (5개)
   */
  async testSequentialUploads(count: number = 5): Promise<TestMetrics> {
    const startTime = Date.now();
    console.log('\n🔄 ============================================');
    console.log(`🔄 Test 3: Sequential Uploads (${count} images)`);
    console.log('🔄 ============================================\n');

    const uploads: UploadMetrics[] = [];

    try {
      const geminiClient = createGeminiClient(this.geminiApiKey);
      const imageGenerator = new ImageGenerator(geminiClient);

      for (let i = 0; i < count; i++) {
        console.log(`\n📝 [${i + 1}/${count}] Generating image...`);
        const uploadStart = Date.now();

        try {
          // Generate
          const genStart = Date.now();
          const result = await imageGenerator.generateSingle({
            prompt: `Test evidence image ${i + 1}: A clue object on a table`,
            aspectRatio: '16:9'
          });
          const genTime = Date.now() - genStart;

          // Upload
          const upStart = Date.now();
          const uploaded = await this.context.media.upload({
            url: result.imageUrl,
            type: 'image'
          });
          const upTime = Date.now() - upStart;

          const totalTime = Date.now() - uploadStart;

          console.log(`✅ [${i + 1}/${count}] Success: gen=${genTime}ms, upload=${upTime}ms, total=${totalTime}ms`);

          uploads.push({
            imageIndex: i + 1,
            geminiGenerationTime: genTime,
            uploadTime: upTime,
            totalTime,
            success: true,
            mediaId: uploaded.mediaId
          });

        } catch (error) {
          const totalTime = Date.now() - uploadStart;
          console.error(`❌ [${i + 1}/${count}] Failed:`, error);

          uploads.push({
            imageIndex: i + 1,
            geminiGenerationTime: 0,
            uploadTime: 0,
            totalTime,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      const successCount = uploads.filter(u => u.success).length;
      const avgTime = uploads.reduce((sum, u) => sum + u.totalTime, 0) / uploads.length;

      // Rate limit 감지
      const times = uploads.map(u => u.totalTime);
      const isIncreasing = times.every((t, i) => i === 0 || t >= times[i - 1] * 0.9);
      const rateLimitDetected = isIncreasing && times[times.length - 1] > times[0] * 2;

      console.log(`\n✅ Test 3 Complete`);
      console.log(`   Success: ${successCount}/${count}`);
      console.log(`   Total: ${totalDuration}ms`);
      console.log(`   Average: ${Math.round(avgTime)}ms`);
      console.log(`   Rate limit detected: ${rateLimitDetected ? '⚠️  YES' : '✅ NO'}\n`);

      return {
        testName: 'Sequential Uploads',
        startTime,
        endTime,
        duration: totalDuration,
        success: successCount === count,
        details: {
          totalCount: count,
          successCount,
          failureCount: count - successCount,
          averageTime: avgTime,
          uploads,
          rateLimitDetected
        }
      };

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.error('❌ Test 3 Failed:', error);

      return {
        testName: 'Sequential Uploads',
        startTime,
        endTime,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: { uploads }
      };
    }
  }

  /**
   * Test 4: 병렬 업로드 (5개)
   */
  async testParallelUploads(count: number = 5): Promise<TestMetrics> {
    const startTime = Date.now();
    console.log('\n⚡ ============================================');
    console.log(`⚡ Test 4: Parallel Uploads (${count} images)`);
    console.log('⚡ ============================================\n');

    try {
      const geminiClient = createGeminiClient(this.geminiApiKey);
      const imageGenerator = new ImageGenerator(geminiClient);

      // 병렬로 모든 이미지 생성 및 업로드
      const uploadPromises = Array.from({ length: count }, async (_, i) => {
        const uploadStart = Date.now();

        try {
          console.log(`📝 [${i + 1}/${count}] Starting...`);

          // Generate
          const genStart = Date.now();
          const result = await imageGenerator.generateSingle({
            prompt: `Parallel test image ${i + 1}: A detective tool`,
            aspectRatio: '16:9'
          });
          const genTime = Date.now() - genStart;

          // Upload
          const upStart = Date.now();
          const uploaded = await this.context.media.upload({
            url: result.imageUrl,
            type: 'image'
          });
          const upTime = Date.now() - upStart;

          const totalTime = Date.now() - uploadStart;

          console.log(`✅ [${i + 1}/${count}] Success: ${totalTime}ms`);

          return {
            imageIndex: i + 1,
            geminiGenerationTime: genTime,
            uploadTime: upTime,
            totalTime,
            success: true,
            mediaId: uploaded.mediaId
          } as UploadMetrics;

        } catch (error) {
          const totalTime = Date.now() - uploadStart;
          console.error(`❌ [${i + 1}/${count}] Failed:`, error);

          return {
            imageIndex: i + 1,
            geminiGenerationTime: 0,
            uploadTime: 0,
            totalTime,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          } as UploadMetrics;
        }
      });

      const uploads = await Promise.all(uploadPromises);

      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      const successCount = uploads.filter(u => u.success).length;
      const avgTime = uploads.reduce((sum, u) => sum + u.totalTime, 0) / uploads.length;

      console.log(`\n✅ Test 4 Complete`);
      console.log(`   Success: ${successCount}/${count}`);
      console.log(`   Total: ${totalDuration}ms (parallel)`);
      console.log(`   Average per image: ${Math.round(avgTime)}ms\n`);

      return {
        testName: 'Parallel Uploads',
        startTime,
        endTime,
        duration: totalDuration,
        success: successCount === count,
        details: {
          totalCount: count,
          successCount,
          failureCount: count - successCount,
          averageTime: avgTime,
          uploads,
          parallelEfficiency: successCount / count
        }
      };

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.error('❌ Test 4 Failed:', error);

      return {
        testName: 'Parallel Uploads',
        startTime,
        endTime,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test 5: 전체 규모 테스트 (14개)
   */
  async testFullScale(): Promise<TestMetrics> {
    const startTime = Date.now();
    console.log('\n🎯 ============================================');
    console.log('🎯 Test 5: Full Scale Upload (14 images)');
    console.log('🎯 ============================================\n');

    try {
      const geminiClient = createGeminiClient(this.geminiApiKey);
      const imageGenerator = new ImageGenerator(geminiClient);

      // 배치 크기별 테스트
      const batchSizes = [5, 5, 4]; // 총 14개
      const allUploads: UploadMetrics[] = [];
      let imageIndex = 0;

      for (let batchNum = 0; batchNum < batchSizes.length; batchNum++) {
        const batchSize = batchSizes[batchNum];
        console.log(`\n📦 Batch ${batchNum + 1}/${batchSizes.length} (${batchSize} images)...`);

        const batchPromises = Array.from({ length: batchSize }, async (_, i) => {
          const currentIndex = imageIndex + i;
          const uploadStart = Date.now();

          try {
            // Generate
            const genStart = Date.now();
            const result = await imageGenerator.generateSingle({
              prompt: `Evidence ${currentIndex + 1}: Crime scene detail`,
              aspectRatio: '16:9'
            });
            const genTime = Date.now() - genStart;

            // Upload
            const upStart = Date.now();
            const uploaded = await this.context.media.upload({
              url: result.imageUrl,
              type: 'image'
            });
            const upTime = Date.now() - upStart;

            const totalTime = Date.now() - uploadStart;

            console.log(`  ✅ [${currentIndex + 1}/14] Success: ${totalTime}ms`);

            return {
              imageIndex: currentIndex + 1,
              geminiGenerationTime: genTime,
              uploadTime: upTime,
              totalTime,
              success: true,
              mediaId: uploaded.mediaId
            } as UploadMetrics;

          } catch (error) {
            const totalTime = Date.now() - uploadStart;
            console.error(`  ❌ [${currentIndex + 1}/14] Failed:`, error);

            return {
              imageIndex: currentIndex + 1,
              geminiGenerationTime: 0,
              uploadTime: 0,
              totalTime,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            } as UploadMetrics;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        allUploads.push(...batchResults);
        imageIndex += batchSize;

        // 배치 간 대기 (rate limit 방지)
        if (batchNum < batchSizes.length - 1) {
          console.log('  ⏸️  Waiting 2s before next batch...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      const successCount = allUploads.filter(u => u.success).length;
      const avgTime = allUploads.reduce((sum, u) => sum + u.totalTime, 0) / allUploads.length;

      console.log(`\n✅ Test 5 Complete`);
      console.log(`   Success: ${successCount}/14`);
      console.log(`   Total: ${totalDuration}ms (${Math.round(totalDuration / 1000)}s)`);
      console.log(`   Average per image: ${Math.round(avgTime)}ms\n`);

      return {
        testName: 'Full Scale Upload',
        startTime,
        endTime,
        duration: totalDuration,
        success: successCount >= 10, // 70% 성공률 이상이면 OK
        details: {
          totalCount: 14,
          successCount,
          failureCount: 14 - successCount,
          averageTime: avgTime,
          uploads: allUploads,
          batchStrategy: `${batchSizes.join('+')} = 14 images`,
          recommendedBatchSize: 5
        }
      };

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.error('❌ Test 5 Failed:', error);

      return {
        testName: 'Full Scale Upload',
        startTime,
        endTime,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 모든 테스트 실행 및 보고서 생성
   */
  async runAllTests(): Promise<TestMetrics[]> {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║  Media Upload API Validation Test Suite   ║');
    console.log('╚════════════════════════════════════════════╝\n');

    const results: TestMetrics[] = [];

    // Test 1: API 존재 확인
    const test1 = await this.testApiAvailability();
    results.push(test1);
    if (!test1.success) {
      console.error('\n❌ Test 1 failed. Stopping all tests.\n');
      return results;
    }

    // Test 2: 단일 이미지
    const test2 = await this.testSingleUpload();
    results.push(test2);
    if (!test2.success) {
      console.error('\n❌ Test 2 failed. Stopping all tests.\n');
      return results;
    }

    // Test 3: 순차 5개
    const test3 = await this.testSequentialUploads(5);
    results.push(test3);

    // Test 4: 병렬 5개
    const test4 = await this.testParallelUploads(5);
    results.push(test4);

    // Test 5: 전체 14개
    const test5 = await this.testFullScale();
    results.push(test5);

    // 최종 요약
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║           Test Suite Summary               ║');
    console.log('╚════════════════════════════════════════════╝\n');

    results.forEach((result, i) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} Test ${i + 1}: ${result.testName} - ${result.duration}ms`);
    });

    const allPassed = results.every(r => r.success);
    console.log(`\n${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);

    return results;
  }
}
