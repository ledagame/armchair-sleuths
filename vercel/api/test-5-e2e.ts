/**
 * PoC Test 5: End-to-End Integration
 *
 * Purpose: Verify complete flow (generate images → send webhook)
 * Success Criteria: Complete flow in < 90 seconds
 * Expected Result: 60-70 seconds total
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  maxDuration: 300
};

interface E2EStep {
  step: string;
  startTime: number;
  duration?: number;
  success: boolean;
  details?: any;
  error?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const startTime = Date.now();
  const steps: E2EStep[] = [];

  console.log('🧪 Test 5: Starting E2E integration test...');

  try {
    const { webhookUrl, imageCount = 3 } = req.body || {};

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Step 1: Generate multiple images in parallel
    console.log(`   - Step 1: Generating ${imageCount} images...`);
    const genStep: E2EStep = {
      step: 'image-generation',
      startTime: Date.now(),
      success: false
    };

    const prompts = Array.from({ length: imageCount }, (_, i) =>
      `Film noir detective portrait ${i + 1}, 1940s style - E2E test`
    );

    const imagePromises = prompts.map(async (prompt, index) => {
      const response = await fetch(`${baseUrl}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      return {
        index,
        prompt,
        success: response.ok,
        imageUrl: data.imageUrl?.substring(0, 100) + '...',
        imageSize: data.imageUrl?.length || 0
      };
    });

    const images = await Promise.all(imagePromises);

    genStep.duration = Date.now() - genStep.startTime;
    genStep.success = images.every(img => img.success);
    genStep.details = {
      imageCount: images.length,
      successCount: images.filter(img => img.success).length,
      totalSizeKB: Math.round(images.reduce((sum, img) => sum + img.imageSize, 0) / 1024),
      images: images.map(img => ({
        index: img.index,
        success: img.success,
        sizeKB: Math.round(img.imageSize / 1024)
      }))
    };

    steps.push(genStep);

    console.log(`   - Step 1: ${genStep.success ? '✅' : '❌'} (${genStep.duration}ms)`);

    // Step 2: Send webhook (if URL provided)
    if (webhookUrl) {
      console.log(`   - Step 2: Sending webhook...`);
      const webhookStep: E2EStep = {
        step: 'webhook-delivery',
        startTime: Date.now(),
        success: false
      };

      const webhookPayload = {
        test: 'poc-e2e',
        caseId: 'test-e2e-001',
        images: images.map(img => ({
          index: img.index,
          imageUrl: img.imageUrl
        })),
        completedAt: Date.now()
      };

      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      });

      webhookStep.duration = Date.now() - webhookStep.startTime;
      webhookStep.success = webhookResponse.ok;
      webhookStep.details = {
        statusCode: webhookResponse.status,
        payloadSizeKB: Math.round(JSON.stringify(webhookPayload).length / 1024)
      };

      steps.push(webhookStep);

      console.log(`   - Step 2: ${webhookStep.success ? '✅' : '❌'} (${webhookStep.duration}ms)`);
    }

    const totalDuration = Date.now() - startTime;
    const allStepsSuccess = steps.every(s => s.success);

    console.log(`${allStepsSuccess ? '✅' : '❌'} Test 5 completed in ${totalDuration}ms`);
    console.log(`   - Total duration: ${Math.round(totalDuration / 1000)}s`);
    console.log(`   - All steps passed: ${allStepsSuccess}`);

    res.status(allStepsSuccess ? 200 : 500).json({
      test: 'e2e-integration',
      success: allStepsSuccess,
      totalDuration,
      totalDurationSeconds: Math.round(totalDuration / 1000),
      summary: {
        stepsCount: steps.length,
        stepsSuccess: steps.filter(s => s.success).length,
        stepsFailed: steps.filter(s => !s.success).length,
        imageGenerationTime: genStep.duration,
        webhookTime: steps.find(s => s.step === 'webhook-delivery')?.duration,
        totalImagesGenerated: imageCount,
        totalImagesSizeKB: genStep.details?.totalSizeKB
      },
      steps: steps.map(s => ({
        step: s.step,
        success: s.success,
        duration: s.duration,
        durationSeconds: s.duration ? Math.round(s.duration / 1000) : 0,
        details: s.details,
        error: s.error
      })),
      verdict: totalDuration < 90000 && allStepsSuccess
        ? '✅ PASS: E2E completed in acceptable time'
        : totalDuration >= 90000
        ? '⚠️ SLOW: Exceeded 90 second target'
        : '❌ FAIL: Some steps failed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(`❌ Test 5 failed after ${duration}ms:`, error);

    res.status(500).json({
      test: 'e2e-integration',
      success: false,
      totalDuration: duration,
      steps,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '❌ E2E integration failed',
      verdict: '❌ FAIL: Exception occurred'
    });
  }
}
