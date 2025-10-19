/**
 * force-regenerate-case.ts
 *
 * Devvit playtest 환경에서 실행되는 케이스 강제 재생성 스크립트
 *
 * 사용법:
 * 1. devvit playtest가 실행 중인지 확인
 * 2. npx tsx scripts/force-regenerate-case.ts
 */

const PLAYTEST_URL = 'http://localhost:5678'; // Devvit playtest 기본 포트
const CASE_ID = 'case-2025-10-18';

async function forceRegenerateCase() {
  console.log('🔄 케이스 강제 재생성 시작...');
  console.log(`   대상: ${CASE_ID}\n`);

  try {
    // 1. 케이스 재생성 API 호출
    console.log(`📞 Calling POST ${PLAYTEST_URL}/api/case/regenerate`);

    const response = await fetch(`${PLAYTEST_URL}/api/case/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        caseId: CASE_ID
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    console.log(`\n✅ 케이스 재생성 완료!`);
    console.log(`   케이스 ID: ${result.caseId}`);
    console.log(`   날짜: ${result.date}`);
    console.log(`   프로필 이미지: ${result.suspectsWithImages}/${result.totalSuspects}`);

    console.log(`\n📝 다음 단계:`);
    console.log(`   1. Reddit 페이지 새로고침: https://www.reddit.com/r/armchair_sleuths_dev/?playtest=armchair-sleuths`);
    console.log(`   2. Investigation 화면에서 프로필 이미지 확인`);

  } catch (error) {
    console.error('❌ 케이스 재생성 실패:', error);

    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n⚠️  연결 실패: devvit playtest가 실행 중인지 확인하세요!');
        console.error('   실행 명령: devvit playtest armchair_sleuths_dev');
      } else {
        console.error('   상세:', error.message);
      }
    }

    process.exit(1);
  }
}

// 스크립트 실행
forceRegenerateCase();
