/**
 * Vercel Function: Image Generation (Phase 1)
 *
 * Phase 1: 캐싱 없음 - 직접 생성 (30분 구현)
 * 비용: $0.62 for 16 days - 완전히 OK!
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ImageGenerationRequest {
  prompt: string;
}

interface ImageGenerationResponse {
  imageUrl: string;
  cached: boolean;
}

/**
 * Gemini 2.5 Flash Image API를 사용한 이미지 생성
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // CORS 헤더 설정 (Devvit에서 호출)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
    return;
  }

  try {
    // 요청 바디 파싱
    const { prompt } = req.body as ImageGenerationRequest;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Prompt is required and must be a string'
      });
      return;
    }

    // Gemini API 키 확인
    const geminiApiKey = process.env.GEMINI_API_KEY ||
                        process.env.GOOGLE_GEMINI_API_KEY ||
                        process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!geminiApiKey) {
      console.error('Gemini API key not found in environment variables');
      res.status(500).json({
        error: 'Configuration error',
        message: 'Gemini API key not configured'
      });
      return;
    }

    console.log(`🔄 Generating image for prompt: ${prompt.substring(0, 100)}...`);

    const startTime = Date.now();

    // Gemini 2.5 Flash Image API 호출
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          // 안전성 필터 비활성화 (범죄 미스터리 게임용)
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE'
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini API error (${response.status}):`, errorText);

      res.status(response.status).json({
        error: 'Image generation failed',
        message: `Gemini API returned ${response.status}`,
        details: errorText
      });
      return;
    }

    const data = await response.json();

    // 응답 검증
    if (!data.candidates ||
        data.candidates.length === 0 ||
        !data.candidates[0].content ||
        !data.candidates[0].content.parts ||
        data.candidates[0].content.parts.length === 0) {
      console.error('❌ Invalid response structure from Gemini API');
      console.error('Response:', JSON.stringify(data));

      res.status(500).json({
        error: 'Invalid response',
        message: 'Gemini API returned unexpected response structure'
      });
      return;
    }

    // parts 배열에서 inlineData가 있는 part 찾기
    // Gemini는 때때로 text와 inlineData를 모두 반환함
    const parts = data.candidates[0].content.parts;
    const imagePart = parts.find((part: any) => part.inlineData);

    if (!imagePart || !imagePart.inlineData) {
      console.error('❌ No inlineData found in response parts');
      console.error('Parts:', JSON.stringify(parts));

      res.status(500).json({
        error: 'Invalid response',
        message: 'No image data found in Gemini API response'
      });
      return;
    }

    // Base64 이미지 데이터 추출
    const base64Image = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/png';

    // Data URL 생성
    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    const duration = Date.now() - startTime;

    console.log(`✅ Image generated successfully in ${duration}ms`);
    console.log(`   - Size: ${base64Image.length} bytes`);
    console.log(`   - MIME: ${mimeType}`);

    // 응답 반환
    const responseData: ImageGenerationResponse = {
      imageUrl,
      cached: false // Phase 1: 캐싱 없음
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Image generation error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      error: 'Image generation failed',
      message: errorMessage
    });
  }
}
