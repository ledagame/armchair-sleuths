// 자동 케이스 생성 스크립트
// 브라우저 콘솔에서 실행하세요

(async function autoGenerateCase() {
  console.log('🎬 자동 케이스 생성 시작...\n');

  try {
    // 1단계: 현재 케이스 확인
    console.log('📋 1단계: 현재 케이스 확인 중...');
    const currentResponse = await fetch('/api/case/today');
    const currentCase = await currentResponse.json();

    if (currentResponse.ok) {
      console.log(`✅ 현재 케이스: ${currentCase.id}`);
      console.log(`   - 용의자: ${currentCase.suspects?.length || 0}명`);
      console.log(`   - 생성 시각: ${new Date(currentCase.generatedAt).toLocaleString()}\n`);
    } else {
      console.log(`⚠️  현재 케이스 없음: ${currentCase.message}\n`);
    }

    // 2단계: 새 케이스 생성
    console.log('🔄 2단계: 새 케이스 생성 중... (30-60초 소요)');
    console.log('   AI가 용의자, 사건, 증거를 생성하고 있습니다...\n');

    const generateResponse = await fetch('/api/case/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const generateResult = await generateResponse.json();

    if (generateResponse.ok) {
      console.log(`✅✅✅ 새 케이스 생성 성공!`);
      console.log(`   - 케이스 ID: ${generateResult.caseId}`);
      console.log(`   - 날짜: ${generateResult.date}`);
      console.log(`   - 메시지: ${generateResult.message}\n`);
    } else {
      console.error(`❌ 케이스 생성 실패: ${generateResult.message || generateResult.error}`);
      console.error('   상세:', generateResult);
      return;
    }

    // 3단계: 잠시 대기 (저장 완료 대기)
    console.log('⏰ 3단계: 데이터 저장 완료 대기 중... (3초)');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4단계: 새 케이스 확인
    console.log('\n📋 4단계: 업데이트된 케이스 확인 중...');
    const updatedResponse = await fetch('/api/case/today');
    const updatedCase = await updatedResponse.json();

    if (updatedResponse.ok) {
      console.log(`✅ 케이스 ID: ${updatedCase.id}`);
      console.log(`   - 날짜: ${updatedCase.date}`);
      console.log(`   - 피해자: ${updatedCase.victim?.name || 'N/A'}`);
      console.log(`   - 무기: ${updatedCase.weapon?.name || 'N/A'}`);
      console.log(`   - 장소: ${updatedCase.location?.name || 'N/A'}`);
      console.log(`   - 용의자: ${updatedCase.suspects?.length || 0}명\n`);

      if (updatedCase.suspects && updatedCase.suspects.length > 0) {
        console.log('👥 용의자 목록:');
        updatedCase.suspects.forEach((s, i) => {
          console.log(`   ${i + 1}. ${s.name} (${s.archetype})`);
          console.log(`      ${s.background?.substring(0, 60)}...`);
        });
        console.log('\n');
        console.log('🎉🎉🎉 성공! 케이스가 정상적으로 생성되었습니다! 🎉🎉🎉');
        console.log('');
        console.log('═════════════════════════════════════════════════════');
        console.log('✅ 이제 Devvit 앱 페이지를 새로고침(F5)하세요!');
        console.log('═════════════════════════════════════════════════════');
        console.log('');
        console.log('예상 결과:');
        console.log(`  - 케이스 개요에서 "${updatedCase.suspects.length}명의 용의자" 표시`);
        console.log('  - "수사 시작하기" 클릭 → 용의자 카드 표시');
        console.log('  - 각 용의자와 대화 가능');

      } else {
        console.error('\n❌❌❌ 여전히 용의자가 0명입니다!');
        console.error('');
        console.error('문제 진단:');
        console.error('1. 서버 로그를 확인하세요');
        console.error('2. DevvitAdapter.sAdd 로그가 있는지 확인');
        console.error('3. Redis 연결 상태 확인 필요');
        console.error('');
        console.error('케이스 데이터:', updatedCase);
      }
    } else {
      console.error(`❌ 케이스 조회 실패: ${updatedCase.message || updatedCase.error}`);
    }

  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
    console.error('   네트워크 연결을 확인하세요');
  }
})();

console.log('\n📝 스크립트 실행 완료. 위 결과를 확인하세요.');
