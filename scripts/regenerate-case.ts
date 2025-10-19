#!/usr/bin/env tsx

/**
 * regenerate-case.ts
 * 
 * 기존 케이스를 재생성하는 스크립트
 * 새로운 아키텍처에 맞게 작성됨
 * 
 * 사용법:
 * npx tsx scripts/regenerate-case.ts
 * npx tsx scripts/regenerate-case.ts case-2025-10-17
 * npx tsx scripts/regenerate-case.ts --with-images
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// 환경 변수 로드
config({ path: resolve(process.cwd(), '.env.local') });

import { CaseGeneratorService } from '../src/server/services/case/CaseGeneratorService';
import { GeminiClient } from '../src/server/services/gemini/GeminiClient';
import { KVStoreManager } from '../src/server/services/repositories/kv/KVStoreManager';
import { FileStorageAdapter } from '../src/server/services/repositories/adapters/FileStorageAdapter';
import { CaseValidator } from '../src/server/services/validation/CaseValidator';
import type { GeneratedCase } from '../src/shared/types/Case';

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// 로그 함수들
function success(message: string) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function error(message: string) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function warn(message: string) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function info(message: string) {
  console.log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);
}

function header(message: string) {
  console.log(`\n${colors.bright}${colors.blue}🔄 ${message}${colors.reset}`);
}

/**
 * 커맨드 라인 인자 파싱
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  let caseId: string | null = null;
  let withImages = false;
  let force = false;
  
  for (const arg of args) {
    if (arg === '--with-images') {
      withImages = true;
    } else if (arg === '--force') {
      force = true;
    } else if (arg.startsWith('case-')) {
      caseId = arg;
    } else if (!arg.startsWith('--')) {
      // 날짜 형식이면 케이스 ID로 변환
      if (/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
        caseId = `case-${arg}`;
      } else {
        caseId = arg;
      }
    }
  }
  
  // 기본값: 오늘 날짜
  if (!caseId) {
    const today = new Date().toISOString().split('T')[0];
    caseId = `case-${today}`;
  }
  
  return { caseId, withImages, force };
}

/**
 * 케이스 존재 여부 확인
 */
async function checkCaseExists(caseId: string): Promise<GeneratedCase | null> {
  try {
    const caseData = await KVStoreManager.getCase(caseId);
    return caseData as GeneratedCase | null;
  } catch (error) {
    console.error('케이스 확인 중 오류:', error);
    return null;
  }
}

/**
 * 케이스 재생성
 */
async function regenerateCase(
  caseId: string,
  withImages: boolean,
  force: boolean
): Promise<void> {
  try {
    header(`케이스 재생성: ${caseId}`);
    
    // 1. 기존 케이스 확인
    console.log('\n1. 기존 케이스 확인 중...');
    const existingCase = await checkCaseExists(caseId);
    
    if (existingCase) {
      success(`기존 케이스 발견: ${existingCase.title}`);
      console.log(`   생성 시각: ${new Date(existingCase.createdAt).toLocaleString()}`);
      console.log(`   용의자: ${existingCase.suspects.length}명`);
      console.log(`   장소: ${existingCase.locations?.length || 0}개`);
      console.log(`   증거: ${existingCase.evidence?.length || 0}개`);
      
      if (!force) {
        warn('기존 케이스가 존재합니다. --force 옵션을 사용하여 강제 재생성하세요.');
        return;
      }
    } else {
      info('기존 케이스가 없습니다. 새로 생성합니다.');
    }
    
    // 2. 날짜 추출
    const dateMatch = caseId.match(/case-(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) {
      error('유효하지 않은 케이스 ID 형식입니다. case-YYYY-MM-DD 형식을 사용하세요.');
      return;
    }
    
    const dateStr = dateMatch[1];
    const caseDate = new Date(dateStr);
    
    // 3. 케이스 생성 서비스 초기화
    console.log('\n2. 케이스 생성 서비스 초기화 중...');
    const geminiClient = new GeminiClient(
      process.env.GEMINI_API_KEY!,
      process.env.VERCEL_IMAGE_FUNCTION_URL
    );
    const caseGenerator = new CaseGeneratorService(geminiClient);
    
    // 4. 기존 데이터 완전 삭제
    if (existingCase) {
      console.log('\n3. 기존 데이터 완전 삭제 중...');
      await KVStoreManager.clearCaseData(caseId);
      success('기존 데이터 삭제 완료');
    }
    
    // 5. 케이스 생성
    console.log('\n4. 케이스 생성 중...');
    console.log(`   날짜: ${dateStr}`);
    console.log(`   이미지 생성: ${withImages ? 'Yes' : 'No'}`);
    
    const generatedCase = await caseGenerator.generateCase({
      date: caseDate,
      includeImage: withImages,  // 단수 형태로 수정!
      temperature: 0.8
    });
    
    // 6. 저장
    console.log('\n5. 케이스 저장 중...');
    await KVStoreManager.saveCase(generatedCase as any);
    
    success('케이스 저장 완료!');
    
    // 7. 검증
    console.log('\n6. 케이스 검증 중...');
    const validationResult = await CaseValidator.validateCase(caseId);
    
    if (!validationResult.valid) {
      error('검증 실패! 케이스를 롤백합니다.');
      console.log('\n에러:');
      validationResult.errors.forEach((err) => {
        console.log(`  - ${err}`);
      });
      
      // 롤백
      await KVStoreManager.clearCaseData(caseId);
      error('케이스가 롤백되었습니다.');
      process.exit(1);
    }
    
    if (validationResult.warnings.length > 0) {
      warn('검증 경고:');
      validationResult.warnings.forEach((warning) => {
        console.log(`  - ${warning}`);
      });
    }
    
    success('검증 통과!');
    
    // 8. 결과 출력
    console.log('\n' + '━'.repeat(60));
    console.log(`${colors.bright}📋 재생성된 케이스 정보${colors.reset}`);
    console.log('━'.repeat(60));
    console.log(`케이스 ID: ${colors.cyan}${generatedCase.id}${colors.reset}`);
    console.log(`제목: ${colors.white}${generatedCase.title}${colors.reset}`);
    console.log(`날짜: ${colors.yellow}${dateStr}${colors.reset}`);
    console.log(`버전: ${generatedCase.version}`);
    
    console.log(`\n${colors.magenta}👤 피해자:${colors.reset}`);
    if ('victim' in generatedCase && generatedCase.victim) {
      const victim = generatedCase.victim as any;
      console.log(`   이름: ${victim.name}`);
      console.log(`   배경: ${victim.background}`);
    }
    
    console.log(`\n${colors.magenta}🔪 무기:${colors.reset}`);
    console.log(`   ${generatedCase.weapon}`);
    
    console.log(`\n${colors.magenta}📍 장소:${colors.reset}`);
    console.log(`   ${generatedCase.mainLocation}`);
    
    console.log(`\n${colors.magenta}🕵️ 용의자:${colors.reset}`);
    generatedCase.suspects.forEach((suspect, i) => {
      const guiltyMark = suspect.isGuilty ? ' ⚠️ [진범]' : '';
      console.log(`   ${i + 1}. ${suspect.name}${guiltyMark}`);
      console.log(`      배경: ${suspect.background}`);
      console.log(`      성격: ${suspect.personality}`);
      
      // 이미지 URL 출력
      const suspectData = generatedCase.suspects.find(s => s.name === suspect.name);
      if (suspectData && 'profileImageUrl' in suspectData && suspectData.profileImageUrl) {
        console.log(`      이미지: ${colors.green}✅ 있음${colors.reset}`);
      } else {
        console.log(`      이미지: ${colors.yellow}❌ 없음${colors.reset}`);
      }
    });
    
    console.log('\n' + '━'.repeat(60));
    success('케이스 재생성 완료!');
    
  } catch (err) {
    error('케이스 재생성 실패:');
    console.error(err);
    process.exit(1);
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log(`${colors.bright}${colors.blue}🔄 케이스 재생성 도구${colors.reset}`);
  console.log('━'.repeat(40));
  
  try {
    // 환경 변수 확인
    if (!process.env.GEMINI_API_KEY) {
      error('GEMINI_API_KEY가 설정되지 않았습니다.');
      console.log('\n.env.local 파일에 다음을 추가하세요:');
      console.log('GEMINI_API_KEY=your_api_key_here');
      process.exit(1);
    }
    
    // 스토리지 어댑터 설정
    const storageAdapter = new FileStorageAdapter('./local-data');
    KVStoreManager.setAdapter(storageAdapter);
    
    // 인자 파싱
    const { caseId, withImages, force } = parseArgs();
    
    console.log(`\n설정:`);
    console.log(`  케이스 ID: ${colors.cyan}${caseId}${colors.reset}`);
    console.log(`  이미지 생성: ${withImages ? colors.green + 'Yes' : colors.yellow + 'No'}${colors.reset}`);
    console.log(`  강제 재생성: ${force ? colors.green + 'Yes' : colors.yellow + 'No'}${colors.reset}`);
    
    // 케이스 재생성 실행
    await regenerateCase(caseId, withImages, force);
    
  } catch (err) {
    error('스크립트 실행 실패:');
    console.error(err);
    process.exit(1);
  }
}

// 도움말 출력
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`\n${colors.bright}케이스 재생성 도구${colors.reset}`);
  console.log('━'.repeat(30));
  console.log('\n사용법:');
  console.log('  npx tsx scripts/regenerate-case.ts [옵션] [케이스ID]');
  console.log('\n옵션:');
  console.log('  --with-images    이미지 포함 생성');
  console.log('  --force          기존 케이스 덮어쓰기');
  console.log('  --help, -h       도움말 출력');
  console.log('\n예시:');
  console.log('  npx tsx scripts/regenerate-case.ts');
  console.log('  npx tsx scripts/regenerate-case.ts case-2025-10-17');
  console.log('  npx tsx scripts/regenerate-case.ts 2025-10-17 --with-images');
  console.log('  npx tsx scripts/regenerate-case.ts --with-images --force');
  process.exit(0);
}

// 스크립트 실행
main().catch(console.error);
