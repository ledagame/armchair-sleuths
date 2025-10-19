#!/usr/bin/env tsx

/**
 * debug-images.ts
 *
 * 저장된 케이스의 이미지 URL을 분석하는 디버깅 스크립트
 *
 * 사용법:
 * npx tsx scripts/debug-images.ts
 * npx tsx scripts/debug-images.ts case-2025-10-17
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// 환경 변수 로드
config({ path: resolve(process.cwd(), '.env.local') });

import { KVStoreManager } from '../src/server/services/repositories/kv/KVStoreManager';
import { FileStorageAdapter } from '../src/server/services/repositories/adapters/FileStorageAdapter';
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

/**
 * 이미지 분석 결과 인터페이스
 */
interface ImageAnalysis {
  real: number;
  placeholder: number;
  empty: number;
  invalid: number;
}

/**
 * 이미지 URL 분석
 */
function analyzeImages(urls: (string | undefined)[]): ImageAnalysis {
  let real = 0;
  let placeholder = 0;
  let empty = 0;
  let invalid = 0;
  
  urls.forEach(url => {
    if (!url || url === '') {
      empty++;
    } else if (url.includes('placeholder')) {
      placeholder++;
    } else if (isValidImageUrl(url)) {
      real++;
    } else {
      invalid++;
    }
  });
  
  return { real, placeholder, empty, invalid };
}

/**
 * 유효한 이미지 URL인지 확인
 */
function isValidImageUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 케이스 로드
 */
async function loadCase(caseId: string): Promise<GeneratedCase | null> {
  try {
    const caseData = await KVStoreManager.getCase(caseId);
    return caseData as GeneratedCase | null;
  } catch (error) {
    console.error('케이스 로드 중 오류:', error);
    return null;
  }
}

/**
 * 이미지 디버깅 메인 함수
 */
async function debugImages() {
  console.log(`${colors.bright}${colors.blue}🔍 이미지 URL 디버깅 도구${colors.reset}`);
  console.log('━'.repeat(50));
  
  try {
    // 스토리지 어댑터 설정
    const storageAdapter = new FileStorageAdapter('./local-data');
    KVStoreManager.setAdapter(storageAdapter);
    
    // 케이스 ID 결정
    const caseId = process.argv[2] || `case-${new Date().toISOString().split('T')[0]}`;
    console.log(`\n📂 분석 대상: ${colors.cyan}${caseId}${colors.reset}\n`);
    
    // 케이스 로드
    const caseData = await loadCase(caseId);
    
    if (!caseData) {
      console.error(`${colors.red}❌ 케이스를 찾을 수 없습니다: ${caseId}${colors.reset}`);
      console.error(`\n${colors.yellow}💡 힌트:${colors.reset}`);
      console.error(`   1. 케이스가 생성되었는지 확인하세요`);
      console.error(`   2. 케이스 ID가 올바른지 확인하세요`);
      console.error(`   3. 로컬 스토리지를 확인하세요 (./local-data/)`);
      console.error(`\n${colors.cyan}사용 가능한 명령어:${colors.reset}`);
      console.error(`   npx tsx scripts/generate-case.ts`);
      console.error(`   npx tsx scripts/regenerate-case.ts ${caseId}`);
      process.exit(1);
    }
    
    console.log(`${colors.green}✅ 케이스 로드 성공${colors.reset}\n`);
    console.log(`${colors.white}📊 기본 정보:${colors.reset}`);
    console.log(`   제목: ${caseData.title}`);
    console.log(`   버전: ${caseData.version}`);
    console.log(`   생성 시각: ${new Date(caseData.createdAt).toLocaleString()}`);
    
    // 용의자 이미지 분석
    console.log(`\n${colors.magenta}👤 ============================================${colors.reset}`);
    console.log(`${colors.magenta}👤 용의자 이미지 분석 (${caseData.suspects.length}명)${colors.reset}`);
    console.log(`${colors.magenta}👤 ============================================${colors.reset}`);
    
    let suspectRealCount = 0;
    caseData.suspects.forEach((suspect, i) => {
      const isPlaceholder = suspect.profileImageUrl?.includes('placeholder') || false;
      const isEmpty = !suspect.profileImageUrl || suspect.profileImageUrl === '';
      
      if (!isPlaceholder && !isEmpty) {
        suspectRealCount++;
      }
      
      const status = isEmpty ? `${colors.red}❌ 빈 URL${colors.reset}` :
                     isPlaceholder ? `${colors.yellow}⚠️  플레이스홀더${colors.reset}` :
                     `${colors.green}✅ 실제 이미지${colors.reset}`;
      
      console.log(`   ${i + 1}. ${suspect.name}: ${status}`);
      
      if (!isPlaceholder && !isEmpty && suspect.profileImageUrl) {
        const url = suspect.profileImageUrl.length > 80 ? 
          suspect.profileImageUrl.substring(0, 80) + '...' : 
          suspect.profileImageUrl;
        console.log(`      URL: ${colors.cyan}${url}${colors.reset}`);
      }
    });
    
    // 장소 이미지 분석
    console.log(`\n${colors.blue}📍 ============================================${colors.reset}`);
    console.log(`${colors.blue}📍 장소 이미지 분석 (${caseData.locations?.length || 0}개)${colors.reset}`);
    console.log(`${colors.blue}📍 ============================================${colors.reset}`);
    
    let locationRealCount = 0;
    if (caseData.locations) {
      caseData.locations.forEach((location, i) => {
        const isPlaceholder = location.imageUrl?.includes('placeholder') || false;
        const isEmpty = !location.imageUrl || location.imageUrl === '';
        
        if (!isPlaceholder && !isEmpty) {
          locationRealCount++;
        }
        
        const status = isEmpty ? `${colors.red}❌ 빈 URL${colors.reset}` :
                       isPlaceholder ? `${colors.yellow}⚠️  플레이스홀더${colors.reset}` :
                       `${colors.green}✅ 실제 이미지${colors.reset}`;
        
        console.log(`   ${i + 1}. ${location.name}: ${status}`);
        
        if (!isPlaceholder && !isEmpty && location.imageUrl) {
          const url = location.imageUrl.length > 80 ? 
            location.imageUrl.substring(0, 80) + '...' : 
            location.imageUrl;
          console.log(`      URL: ${colors.cyan}${url}${colors.reset}`);
        }
      });
    } else {
      console.log(`   ${colors.yellow}장소 데이터가 없습니다.${colors.reset}`);
    }
    
    // 증거 이미지 분석
    console.log(`\n${colors.yellow}🔍 ============================================${colors.reset}`);
    console.log(`${colors.yellow}🔍 증거 이미지 분석 (${caseData.evidence?.length || 0}개)${colors.reset}`);
    console.log(`${colors.yellow}🔍 ============================================${colors.reset}`);
    
    let evidenceRealCount = 0;
    if (caseData.evidence) {
      caseData.evidence.forEach((evidence, i) => {
        const isPlaceholder = evidence.imageUrl?.includes('placeholder') || false;
        const isEmpty = !evidence.imageUrl || evidence.imageUrl === '';
        
        if (!isPlaceholder && !isEmpty) {
          evidenceRealCount++;
        }
        
        const status = isEmpty ? `${colors.red}❌ 빈 URL${colors.reset}` :
                       isPlaceholder ? `${colors.yellow}⚠️  플레이스홀더${colors.reset}` :
                       `${colors.green}✅ 실제 이미지${colors.reset}`;
        
        console.log(`   ${i + 1}. ${evidence.name}: ${status}`);
        
        if (!isPlaceholder && !isEmpty && evidence.imageUrl) {
          const url = evidence.imageUrl.length > 80 ? 
            evidence.imageUrl.substring(0, 80) + '...' : 
            evidence.imageUrl;
          console.log(`      URL: ${colors.cyan}${url}${colors.reset}`);
        }
      });
    } else {
      console.log(`   ${colors.yellow}증거 데이터가 없습니다.${colors.reset}`);
    }
    
    // 전체 통계
    const totalReal = suspectRealCount + locationRealCount + evidenceRealCount;
    const totalImages = caseData.suspects.length +
                        (caseData.locations?.length || 0) +
                        (caseData.evidence?.length || 0);
    const totalPlaceholder = totalImages - totalReal;
    
    console.log(`\n${colors.bright}📊 ============================================${colors.reset}`);
    console.log(`${colors.bright}📊 전체 통계${colors.reset}`);
    console.log(`${colors.bright}📊 ============================================${colors.reset}`);
    console.log(`   총 이미지: ${colors.white}${totalImages}개${colors.reset}`);
    console.log(`   실제 이미지: ${colors.green}${totalReal}개 (${Math.round(totalReal/totalImages*100)}%)${colors.reset}`);
    console.log(`   플레이스홀더: ${colors.yellow}${totalPlaceholder}개 (${Math.round(totalPlaceholder/totalImages*100)}%)${colors.reset}`);
    
    // 진단 결과
    console.log(`\n${colors.bright}🔍 ============================================${colors.reset}`);
    console.log(`${colors.bright}🔍 진단 결과${colors.reset}`);
    console.log(`${colors.bright}🔍 ============================================${colors.reset}`);
    
    if (totalReal === 0) {
      console.log(`   ${colors.red}❌ 이미지가 생성되지 않았습니다.${colors.reset}`);
      console.log(`\n   ${colors.yellow}💡 해결 방법:${colors.reset}`);
      console.log(`      1. --with-images 옵션으로 재생성:`);
      console.log(`         ${colors.cyan}npx tsx scripts/regenerate-case.ts ${caseId} --with-images --force${colors.reset}`);
      console.log(`\n      2. GEMINI_API_KEY 확인:`);
      console.log(`         ${colors.cyan}echo $GEMINI_API_KEY${colors.reset}`);
    } else if (totalReal < totalImages) {
      console.log(`   ${colors.yellow}⚠️  일부 이미지만 생성되었습니다.${colors.reset}`);
      console.log(`\n   ${colors.yellow}💡 개선 방법:${colors.reset}`);
      console.log(`      재생성하여 누락된 이미지 생성:`);
      console.log(`      ${colors.cyan}npx tsx scripts/regenerate-case.ts ${caseId} --with-images --force${colors.reset}`);
    } else {
      console.log(`   ${colors.green}✅ 모든 이미지가 정상적으로 생성되었습니다!${colors.reset}`);
    }
    
    console.log('\n' + '━'.repeat(50));
    console.log(`${colors.green}✅ 이미지 분석 완료!${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}❌ 이미지 분석 실패:${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

// 도움말 출력
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`\n${colors.bright}이미지 URL 디버깅 도구${colors.reset}`);
  console.log('━'.repeat(30));
  console.log('\n사용법:');
  console.log('  npx tsx scripts/debug-images.ts [케이스ID]');
  console.log('\n예시:');
  console.log('  npx tsx scripts/debug-images.ts');
  console.log('  npx tsx scripts/debug-images.ts case-2025-10-17');
  process.exit(0);
}

// 스크립트 실행
debugImages().catch(console.error);
