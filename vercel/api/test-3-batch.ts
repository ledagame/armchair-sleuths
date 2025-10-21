/**
 * PoC Test 3: Batch Image Generation
 *
 * Purpose: Verify parallel generation of multiple images
 * Success Criteria: 3 images generated in < 30 seconds total
 * Expected Result: ~8-12 seconds (parallel execution)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  maxDuration: 120
};

interface ImageResult {
  index: number;
  prompt: string;
  success: boolean;
  duration: number;
  imageSize?: number;
  error?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const startTime = Date.now();
  const imageCount = 3;

  console.log('🧪 Test 3: Starting batch generation test...');
  console.log(`   - Generating ${imageCount} images in parallel`);

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Generate 3 images in parallel
    const prompts = [
      'Film noir detective portrait 1, 1940s style - PoC test',
      'Film noir detective portrait 2, 1940s style - PoC test',
      'Film noir detective portrait 3, 1940s style - PoC test'
    ];

    const imagePromises = prompts.map(async (prompt, index): Promise<ImageResult> => {
      const imageStart = Date.now();

      try {
        const response = await fetch(`${baseUrl}/api/generate-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });

        const imageDuration = Date.now() - imageStart;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        return {
          index,
          prompt,
          success: true,
          duration: imageDuration,
          imageSize: data.imageUrl?.length || 0
        };

      } catch (error) {
        return {
          index,
          prompt,
          success: false,
          duration: Date.now() - imageStart,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    const results = await Promise.all(imagePromises);
    const totalDuration = Date.now() - startTime;

    const successCount = results.filter(r => r.success).length;
    const allSuccess = successCount === imageCount;
    const avgDuration = Math.round(totalDuration / imageCount);
    const totalImageSize = results.reduce((sum, r) => sum + (r.imageSize || 0), 0);

    console.log(`${allSuccess ? '✅' : '❌'} Test 3 completed in ${totalDuration}ms`);
    console.log(`   - Success: ${successCount}/${imageCount}`);
    console.log(`   - Avg time: ${avgDuration}ms per image`);
    console.log(`   - Total size: ${Math.round(totalImageSize / 1024)} KB`);

    res.status(allSuccess ? 200 : 500).json({
      test: 'batch-generation',
      success: allSuccess,
      totalDuration,
      totalDurationSeconds: Math.round(totalDuration / 1000),
      imageCount,
      successCount,
      failedCount: imageCount - successCount,
      avgDuration,
      avgDurationSeconds: Math.round(avgDuration / 1000),
      totalImageSizeKB: Math.round(totalImageSize / 1024),
      results,
      message: allSuccess
        ? `✅ All ${imageCount} images generated in ${Math.round(totalDuration / 1000)}s`
        : `❌ Only ${successCount}/${imageCount} images succeeded`,
      verdict: totalDuration < 30000 ? '✅ Fast enough' : '⚠️ Slower than expected',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(`❌ Test 3 failed after ${duration}ms:`, error);

    res.status(500).json({
      test: 'batch-generation',
      success: false,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '❌ Batch generation failed'
    });
  }
}
