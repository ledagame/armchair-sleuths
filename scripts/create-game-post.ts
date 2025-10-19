/**
 * create-game-post.ts
 *
 * 새로운 게임 케이스 생성 및 자동 Reddit 포스트 업로드
 *
 * 사용법:
 * 1. devvit playtest가 실행 중인지 확인
 * 2. npm run create-game-post
 *
 * 목적:
 * - 개발 중 새 기능 테스트
 * - 타임스탬프 기반 고유 케이스 ID로 각 포스트마다 독립적인 게임 제공
 * - 넷플릭스 모델: 과거 게임들도 모두 플레이 가능
 */

const PLAYTEST_URL = 'http://localhost:5678'; // Devvit playtest 기본 포트

interface CreateGamePostResponse {
  success: boolean;
  message: string;
  caseId: string;
  date: string;
  postId: string;
  postUrl: string;
  postTitle: string;
  suspects: Array<{
    name: string;
    archetype: string;
    hasImage: boolean;
  }>;
  victim: string;
  generatedAt: number;
}

async function createGamePost() {
  console.log('🎮 새로운 게임 포스트 생성 시작...\n');

  try {
    // 1. API 호출하여 케이스 생성 및 포스트 업로드
    console.log(`📞 Calling POST ${PLAYTEST_URL}/api/create-game-post`);
    console.log('   (케이스 생성 + 이미지 생성 + Reddit 포스트 업로드)\n');

    const startTime = Date.now();

    const response = await fetch(`${PLAYTEST_URL}/api/create-game-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result: CreateGamePostResponse = await response.json();

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n✅ 게임 포스트 생성 완료! (${duration}초 소요)\n`);
    console.log(`📋 게임 정보:`);
    console.log(`   케이스 ID: ${result.caseId}`);
    console.log(`   날짜: ${result.date}`);
    console.log(`   피해자: ${result.victim}`);
    console.log(`   용의자: ${result.suspects.map(s => s.name).join(', ')}`);
    console.log(`   이미지: ${result.suspects.filter(s => s.hasImage).length}/${result.suspects.length} 생성됨`);

    console.log(`\n📮 Reddit 포스트:`);
    console.log(`   포스트 ID: ${result.postId}`);
    console.log(`   제목: ${result.postTitle}`);
    console.log(`   URL: ${result.postUrl}`);

    console.log(`\n📝 다음 단계:`);
    console.log(`   1. 브라우저에서 포스트 열기: ${result.postUrl}`);
    console.log(`   2. 게임 시작하여 새로운 기능 테스트`);
    console.log(`   3. 용의자 프로필 이미지 progressive loading 확인`);

    console.log(`\n💡 팁:`);
    console.log(`   - 이 명령어를 다시 실행하면 완전히 새로운 시나리오로 새 포스트 생성`);
    console.log(`   - 각 포스트는 고유한 케이스 ID를 가지므로 과거 포스트들도 정상 작동`);
    console.log(`   - 넷플릭스처럼 언제든 과거 게임들을 플레이할 수 있습니다`);

  } catch (error) {
    console.error('\n❌ 게임 포스트 생성 실패:', error);

    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n⚠️  연결 실패: devvit playtest가 실행 중인지 확인하세요!');
        console.error('   실행 명령: devvit playtest armchair_sleuths_dev');
      } else if (error.message.includes('API Error')) {
        console.error('\n⚠️  API 에러 상세:', error.message);
        console.error('   - Gemini API 키가 설정되어 있는지 확인');
        console.error('   - Devvit 앱 설정에서 geminiApiKey 확인');
      } else {
        console.error('   상세:', error.message);
      }
    }

    process.exit(1);
  }
}

// 스크립트 실행
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 Armchair Sleuths - 자동 게임 포스트 생성기');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

createGamePost();
