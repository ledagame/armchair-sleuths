/**
 * test-image-generation.ts
 *
 * Vercel Function 이미지 생성 테스트
 *
 * 사용법:
 * 1. .env.local에 VERCEL_IMAGE_FUNCTION_URL 설정
 * 2. npx tsx scripts/test-image-generation.ts
 */

// .env.local 파일 로드 (필수!)
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { createGeminiClient } from '../src/server/services/gemini/GeminiClient';

async function testImageGeneration() {
  console.log('🎨 이미지 생성 테스트 시작\n');

  try {
    // 환경 변수 확인
    const vercelUrl = process.env.VERCEL_IMAGE_FUNCTION_URL;

    if (!vercelUrl) {
      console.error('❌ VERCEL_IMAGE_FUNCTION_URL이 설정되지 않았습니다.');
      console.error('   .env.local 파일에 다음을 추가하세요:');
      console.error('   VERCEL_IMAGE_FUNCTION_URL=https://your-project.vercel.app/api/generate-image');
      process.exit(1);
    }

    console.log(`✅ Vercel Function URL: ${vercelUrl}\n`);

    // GeminiClient 생성
    const geminiClient = createGeminiClient();

    // 테스트 프롬프트 (안전성 필터 통과용)
    const testPrompt = `
A vintage detective's office from the 1940s:
- Classic wooden furniture and mahogany desk
- Organized papers and an elegant wine glass
- Black and white photography style
- Professional cinematic composition
- Warm atmospheric lighting
    `.trim();

    console.log('⏳ 이미지 생성 중...');
    console.log(`   프롬프트: ${testPrompt.substring(0, 100)}...`);

    const startTime = Date.now();
    const result = await geminiClient.generateImage(testPrompt);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n✅ 이미지 생성 완료! (${duration}초 소요)`);
    console.log(`   캐시 여부: ${result.cached ? 'Yes (캐시됨)' : 'No (새로 생성)'}`);
    console.log(`   이미지 URL 길이: ${result.imageUrl.length} characters`);
    console.log(`   URL 시작: ${result.imageUrl.substring(0, 50)}...`);

    // Base64 이미지 정보 추출
    if (result.imageUrl.startsWith('data:')) {
      const parts = result.imageUrl.split(',');
      if (parts.length === 2) {
        const mimeType = parts[0].match(/data:(.*?);base64/)?.[1];
        const base64Data = parts[1];
        const sizeKB = (base64Data.length * 0.75 / 1024).toFixed(1);

        console.log(`   MIME Type: ${mimeType}`);
        console.log(`   이미지 크기: 약 ${sizeKB} KB`);
      }
    }

    console.log('\n💡 이미지를 보려면:');
    console.log('   1. 브라우저 개발자 도구 열기 (F12)');
    console.log('   2. Console 탭에서 다음 실행:');
    console.log(`      const img = document.createElement('img');`);
    console.log(`      img.src = '${result.imageUrl.substring(0, 100)}...';`);
    console.log(`      document.body.appendChild(img);`);

    console.log('\n🎉 테스트 완료!\n');

  } catch (error) {
    console.error('❌ 이미지 생성 실패:', error);
    if (error instanceof Error) {
      console.error('   상세:', error.message);
      console.error('   스택:', error.stack);
    }
    process.exit(1);
  }
}

// 스크립트 실행
testImageGeneration();
