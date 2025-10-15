/**
 * GeminiClient.ts
 *
 * Gemini API 통합 클라이언트
 * - 텍스트 생성 (gemini-flash-lite-latest)
 * - 이미지 생성 (Vercel Function으로 위임)
 * - 임베딩 생성 (text-embedding-004, Phase 2-3용)
 */

export interface GeminiTextOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export interface GeminiResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface GeminiImageResponse {
  imageUrl: string;
  cached?: boolean;
}

/**
 * Gemini API 클라이언트
 */
export class GeminiClient {
  private readonly TEXT_MODEL = 'gemini-flash-lite-latest';
  private readonly IMAGE_MODEL = 'gemini-2.5-flash-image';
  private readonly EMBEDDING_MODEL = 'text-embedding-004';
  private readonly BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
  private readonly apiKey: string;
  private readonly vercelFunctionUrl?: string;

  constructor(apiKey: string, vercelFunctionUrl?: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.apiKey = apiKey;
    this.vercelFunctionUrl = vercelFunctionUrl;
  }

  /**
   * 텍스트 생성 (모든 텍스트 생성에 사용)
   *
   * 사용 예:
   * - 케이스 생성
   * - AI 용의자 대화
   * - 답변 채점
   * - 5W1H 검증
   */
  async generateText(
    prompt: string,
    options: GeminiTextOptions = {}
  ): Promise<GeminiResponse> {
    const {
      temperature = 0.7,
      maxTokens = 4096,
      topP = 0.95,
      topK = 40
    } = options;

    try {
      const response = await fetch(
        `${this.BASE_URL}/${this.TEXT_MODEL}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
              topP,
              topK
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No candidates returned from Gemini API');
      }

      const text = data.candidates[0].content.parts[0].text;

      // 토큰 사용량 추출 (있는 경우)
      const usage = data.usageMetadata ? {
        promptTokens: data.usageMetadata.promptTokenCount || 0,
        completionTokens: data.usageMetadata.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata.totalTokenCount || 0
      } : undefined;

      return { text, usage };

    } catch (error) {
      console.error('Gemini text generation error:', error);
      throw error;
    }
  }

  /**
   * 이미지 생성 (Vercel Function으로 위임)
   *
   * Phase 1: 캐싱 없음 (직접 생성)
   * Phase 2-3: Redis/Vector 캐싱 (Vercel Function에서 처리)
   */
  async generateImage(prompt: string): Promise<GeminiImageResponse> {
    if (!this.vercelFunctionUrl) {
      throw new Error('Vercel Function URL is not configured');
    }

    try {
      const response = await fetch(this.vercelFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Image generation error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      return {
        imageUrl: data.imageUrl,
        cached: data.cached || false
      };

    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  }

  /**
   * 임베딩 생성 (Phase 2-3: 캐싱용)
   *
   * Vector 캐싱을 위한 텍스트 임베딩 생성
   * Phase 1에서는 사용하지 않음
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/${this.EMBEDDING_MODEL}:embedContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          },
          body: JSON.stringify({
            model: `models/${this.EMBEDDING_MODEL}`,
            content: {
              parts: [{ text }]
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Embedding generation error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (!data.embedding || !data.embedding.values) {
        throw new Error('No embedding returned from Gemini API');
      }

      return data.embedding.values;

    } catch (error) {
      console.error('Gemini embedding generation error:', error);
      throw error;
    }
  }

  /**
   * JSON 응답 파싱 헬퍼
   *
   * Gemini 응답에서 JSON을 추출하고 파싱
   * ```json ... ``` 형식도 자동 처리
   */
  parseJsonResponse<T>(text: string): T {
    try {
      // JSON 코드 블록 제거
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // 일반 JSON 파싱
      return JSON.parse(text);

    } catch (error) {
      console.error('JSON parsing error:', error);
      console.error('Original text:', text);
      throw new Error('Failed to parse JSON from Gemini response');
    }
  }

  /**
   * 스트리밍 텍스트 생성 (향후 기능)
   *
   * Phase 1에서는 사용하지 않음
   * 실시간 대화 UI를 위해 Phase 2-3에서 구현 고려
   */
  async *streamText(
    prompt: string,
    options: GeminiTextOptions = {}
  ): AsyncGenerator<string> {
    // TODO: Phase 2-3에서 구현
    throw new Error('Streaming not implemented yet');
  }

  /**
   * 토큰 카운트 추정 (헬퍼)
   *
   * 정확하지는 않지만 대략적인 토큰 수 추정
   * 1 토큰 ≈ 4 characters (영어 기준)
   * 한국어는 ≈ 1.5 characters
   */
  static estimateTokens(text: string): number {
    // 간단한 휴리스틱: 영어/한국어 혼합 가정
    const avgCharsPerToken = 2.5;
    return Math.ceil(text.length / avgCharsPerToken);
  }

  /**
   * 비용 계산 헬퍼
   *
   * gemini-flash-lite-latest 기준:
   * - Input: $0.10/1M tokens
   * - Output: $0.40/1M tokens
   */
  static calculateTextCost(promptTokens: number, completionTokens: number): number {
    const inputCost = (promptTokens / 1_000_000) * 0.10;
    const outputCost = (completionTokens / 1_000_000) * 0.40;
    return inputCost + outputCost;
  }

  /**
   * 이미지 비용 계산 헬퍼
   *
   * gemini-2.5-flash-image: $0.039/이미지
   */
  static calculateImageCost(imageCount: number): number {
    return imageCount * 0.039;
  }
}

/**
 * Gemini client factory function
 *
 * @param apiKey - API key (required in Devvit, optional for local dev with .env)
 * @returns GeminiClient instance
 */
export function createGeminiClient(apiKey?: string): GeminiClient {
  // Use provided API key or fall back to environment variables (for local development)
  const key = apiKey ||
              process.env.GEMINI_API_KEY ||
              process.env.GOOGLE_GEMINI_API_KEY ||
              process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!key) {
    throw new Error(
      'Gemini API key not found. Please configure it in Devvit settings or ' +
      'set GEMINI_API_KEY in .env for local development'
    );
  }

  const vercelFunctionUrl = process.env.VERCEL_IMAGE_FUNCTION_URL;

  return new GeminiClient(key, vercelFunctionUrl);
}
