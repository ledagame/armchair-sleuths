/**
 * PoC Test 2: Gemini API Integration
 *
 * Purpose: Verify Gemini image generation works from Vercel
 * Success Criteria: Image generated in 6-10 seconds
 * Expected Result: Base64 data URL with ~200KB compressed JPEG
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  maxDuration: 60
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const startTime = Date.now();

  console.log('🧪 Test 2: Starting Gemini API integration test...');

  try {
    // Call our existing generate-image endpoint
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    console.log(`   - Calling: ${baseUrl}/api/generate-image`);

    const response = await fetch(`${baseUrl}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'Film noir detective portrait, 1940s style, high contrast black and white, dramatic lighting - PoC test'
      })
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Generate-image failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data.imageUrl) {
      throw new Error('No imageUrl in response');
    }

    const imageSize = data.imageUrl.length;
    const imageSizeKB = Math.round(imageSize / 1024);

    console.log(`✅ Test 2 completed in ${duration}ms`);
    console.log(`   - Image size: ${imageSizeKB} KB`);
    console.log(`   - Cached: ${data.cached}`);

    res.status(200).json({
      test: 'gemini-integration',
      success: true,
      duration,
      durationSeconds: Math.round(duration / 1000),
      imageSize,
      imageSizeKB,
      imageSizeMB: (imageSize / 1024 / 1024).toFixed(2),
      cached: data.cached,
      imagePreview: data.imageUrl.substring(0, 100) + '...',
      message: `✅ Image generated in ${Math.round(duration / 1000)}s, size: ${imageSizeKB} KB`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(`❌ Test 2 failed after ${duration}ms:`, error);

    res.status(500).json({
      test: 'gemini-integration',
      success: false,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '❌ Gemini API integration failed'
    });
  }
}
