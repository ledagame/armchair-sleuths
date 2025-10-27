import type { VercelRequest, VercelResponse } from '@vercel/node';
import sharp from 'sharp';

// Vercel Function Configuration
export const config = {
  maxDuration: 300, // 5 minutes (Vercel Pro plan)
};

/**
 * Request payload from Devvit backend
 */
interface ImageGenerationRequest {
  caseId: string;
  suspects: Array<{
    id: string;
    prompt: string;
  }>;
  cinematicPrompts?: Record<string, string>;
  webhookUrl: string;
}

/**
 * Response sent to webhook
 */
interface ImageGenerationResponse {
  caseId: string;
  status: 'ready' | 'partial' | 'failed';
  suspects: Array<{
    suspectId: string;
    imageUrl: string;
  }>;
  cinematic: Record<string, string>;
  failed: string[];
}

/**
 * Vercel Serverless Function Handler
 * Generates all images for a case (suspects + cinematic scenes)
 * Sends webhook notification when complete
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const startTime = Date.now();
  console.log('🎬 Image generation started at', new Date().toISOString());

  try {
    // Parse and validate request
    const {
      caseId,
      suspects,
      cinematicPrompts = {},
      webhookUrl,
    } = req.body as ImageGenerationRequest;

    if (!caseId || !webhookUrl) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['caseId', 'webhookUrl'],
      });
      return;
    }

    if (!suspects || suspects.length === 0) {
      res.status(400).json({
        error: 'No suspects provided',
        message: 'At least one suspect is required',
      });
      return;
    }

    console.log(`📋 Generating images for case: ${caseId}`);
    console.log(`👥 Suspects: ${suspects.length}`);
    console.log(`🎭 Cinematic scenes: ${Object.keys(cinematicPrompts).length}`);

    // Generate suspect profile images in parallel
    console.log('🖼️ Starting suspect image generation...');
    const suspectResults = await Promise.allSettled(
      suspects.map(async (suspect) => {
        try {
          const imageUrl = await generateAndCompress(suspect.prompt);
          console.log(`✅ Generated image for suspect: ${suspect.id}`);
          return {
            suspectId: suspect.id,
            imageUrl,
          };
        } catch (error) {
          console.error(`❌ Failed to generate image for ${suspect.id}:`, error);
          throw error;
        }
      })
    );

    // Generate cinematic images in parallel (if provided)
    console.log('🎬 Starting cinematic image generation...');
    const cinematicResults = await Promise.allSettled(
      Object.entries(cinematicPrompts).map(async ([key, prompt]) => {
        try {
          const imageUrl = await generateAndCompress(prompt);
          console.log(`✅ Generated cinematic image: ${key}`);
          return { key, imageUrl };
        } catch (error) {
          console.error(`❌ Failed to generate cinematic ${key}:`, error);
          throw error;
        }
      })
    );

    // Collect successful suspect images
    const successfulSuspects = suspectResults
      .filter((result): result is PromiseFulfilledResult<{ suspectId: string; imageUrl: string }> =>
        result.status === 'fulfilled'
      )
      .map((result) => result.value);

    // Collect failed suspect IDs
    const failedSuspects = suspects
      .filter((suspect, index) => suspectResults[index].status === 'rejected')
      .map((suspect) => suspect.id);

    // Collect successful cinematic images
    const cinematicImages = cinematicResults
      .filter((result): result is PromiseFulfilledResult<{ key: string; imageUrl: string }> =>
        result.status === 'fulfilled'
      )
      .reduce((acc, result) => {
        acc[result.value.key] = result.value.imageUrl;
        return acc;
      }, {} as Record<string, string>);

    // Collect failed cinematic scenes
    const failedCinematic = Object.keys(cinematicPrompts).filter(
      (key, index) => cinematicResults[index].status === 'rejected'
    );

    // Determine overall status
    const totalImages = suspects.length + Object.keys(cinematicPrompts).length;
    const successfulImages = successfulSuspects.length + Object.keys(cinematicImages).length;

    let status: 'ready' | 'partial' | 'failed';
    if (successfulImages === totalImages) {
      status = 'ready'; // All succeeded
    } else if (successfulImages > 0) {
      status = 'partial'; // Some succeeded
    } else {
      status = 'failed'; // All failed
    }

    const duration = Date.now() - startTime;
    console.log(`⏱️ Image generation completed in ${duration}ms`);
    console.log(`📊 Status: ${status}, Success: ${successfulImages}/${totalImages}`);

    // Prepare webhook payload
    const webhookPayload: ImageGenerationResponse = {
      caseId,
      status,
      suspects: successfulSuspects,
      cinematic: cinematicImages,
      failed: [...failedSuspects, ...failedCinematic],
    };

    // Send webhook with retry logic
    console.log('📡 Sending webhook notification...');
    await sendWebhookWithRetry(webhookUrl, webhookPayload);

    // Return success response
    res.status(200).json({
      success: true,
      caseId,
      status,
      generated: {
        suspects: successfulSuspects.length,
        cinematic: Object.keys(cinematicImages).length,
      },
      failed: webhookPayload.failed,
      duration,
    });
  } catch (error) {
    console.error('💥 Fatal error in image generation:', error);
    res.status(500).json({
      error: 'Image generation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Generate image via Gemini API and compress with Sharp
 * @param prompt - Image generation prompt
 * @returns Base64 data URL of compressed JPEG
 */
async function generateAndCompress(prompt: string): Promise<string> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY environment variable not set');
  }

  // Call Gemini Image Generation API
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${geminiApiKey}`;

  const geminiResponse = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      number_of_images: 1,
      aspect_ratio: '1:1',
      safety_filter_level: 'block_some',
      person_generation: 'allow_adult',
    }),
  });

  if (!geminiResponse.ok) {
    const errorText = await geminiResponse.text();

    // Handle rate limit with exponential backoff
    if (geminiResponse.status === 429) {
      console.warn('⚠️ Rate limited by Gemini API, retrying in 5s...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return generateAndCompress(prompt); // Retry once
    }

    throw new Error(
      `Gemini API failed (${geminiResponse.status}): ${errorText}`
    );
  }

  const geminiData = await geminiResponse.json();

  // Extract base64 image from response
  if (!geminiData.predictions || !geminiData.predictions[0]?.bytesBase64Encoded) {
    throw new Error('Invalid Gemini API response: missing image data');
  }

  const base64Image = geminiData.predictions[0].bytesBase64Encoded;
  const imageBuffer = Buffer.from(base64Image, 'base64');

  // Compress image with Sharp (1.5MB PNG → 35KB JPEG)
  const compressedBuffer = await sharp(imageBuffer)
    .resize(512, 512, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({
      quality: 80,
      mozjpeg: true, // Better compression
    })
    .toBuffer();

  const originalSize = (imageBuffer.length / 1024).toFixed(2);
  const compressedSize = (compressedBuffer.length / 1024).toFixed(2);
  console.log(`🗜️ Compressed: ${originalSize}KB → ${compressedSize}KB`);

  // Return as base64 data URL
  return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
}

/**
 * Send webhook with exponential backoff retry logic
 * @param url - Webhook URL
 * @param payload - Data to send
 * @param maxRetries - Maximum retry attempts (default: 3)
 */
async function sendWebhookWithRetry(
  url: string,
  payload: ImageGenerationResponse,
  maxRetries = 3
): Promise<void> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(`✅ Webhook delivered successfully on attempt ${attempt + 1}`);
        console.log('📥 Webhook response:', responseData);
        return; // Success!
      }

      const errorText = await response.text();
      console.warn(
        `⚠️ Webhook attempt ${attempt + 1} failed (${response.status}): ${errorText}`
      );
    } catch (error) {
      console.error(`❌ Webhook attempt ${attempt + 1} error:`, error);
    }

    // Exponential backoff: 0s, 2s, 4s
    if (attempt < maxRetries - 1) {
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Retrying webhook in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries failed
  console.error('💥 Webhook delivery failed after all retries');
  console.error('⚠️ Images generated but backend not updated!');
  console.error('🔍 Manual recovery may be needed');

  // Don't throw - we still want to return success for the image generation itself
}
