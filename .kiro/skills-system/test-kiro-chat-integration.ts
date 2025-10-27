#!/usr/bin/env tsx
/**
 * Kiro Chat Integration Test
 * 
 * Tests skill activation with chat keywords
 * 
 * Test Keywords:
 * - "improve prompt"
 * - "generate case"
 * - "debug error"
 */

import { SkillRegistry } from './core/SkillRegistry';
import { KeywordMatcher } from './core/KeywordMatcher';
import { DependencyResolver } from './core/DependencyResolver';
import { SkillChainBuilder } from './core/SkillChainBuilder';
import { SkillActivator } from './core/SkillActivator';
import { SkillDiscoveryService } from './core/SkillDiscoveryService';
import * as path from 'path';

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n🧪 Kiro Chat Integration Test\n', 'bright');
  log('스킬 시스템을 초기화하는 중...', 'cyan');

  // 1. 스킬 디스커버리 서비스 초기화
  const skillsDir = path.join(process.cwd(), 'skills');
  const discoveryService = new SkillDiscoveryService(skillsDir);

  // 2. 스킬 시스템 초기화
  const registry = new SkillRegistry();
  const keywordIndexer = discoveryService.getIndexer();
  const keywordMatcher = new KeywordMatcher(registry, keywordIndexer, 0.7);
  const dependencyResolver = new DependencyResolver(registry);
  const skillChainBuilder = new SkillChainBuilder(registry);
  const activator = new SkillActivator(
    registry,
    keywordMatcher,
    dependencyResolver,
    skillChainBuilder
  );

  // 3. 스킬 스캔
  log(`\n📂 스킬 디렉토리 스캔 중: ${skillsDir}`, 'cyan');
  
  try {
    const discoveredSkills = await discoveryService.scanSkills();
    
    // 레지스트리에 스킬 등록
    for (const [name, skill] of discoveredSkills.entries()) {
      await registry.addSkill(skill);
    }
    
    const allSkills = discoveryService.getAllSkills();
    log(`✅ ${allSkills.length}개의 스킬을 발견했습니다!\n`, 'green');

    // 4. 테스트 키워드 정의
    const testKeywords = [
      'improve prompt',
      'generate case',
      'debug error',
    ];

    let passedTests = 0;
    let failedTests = 0;

    // 5. 각 키워드 테스트
    for (const keyword of testKeywords) {
      log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'cyan');
      log(`🔍 테스트 키워드: "${keyword}"`, 'bright');
      log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'cyan');

      const result = activator.activateByKeywords(keyword, false);

      if (result.requiresUserSelection && result.suggestions.length > 0) {
        log(`\n✅ 테스트 통과: ${result.suggestions.length}개의 매칭된 스킬 발견`, 'green');
        log(`\n매칭된 스킬:`, 'cyan');
        result.suggestions.forEach((skill, index) => {
          log(`  ${index + 1}. ${skill.metadata.name}`, 'cyan');
          log(`     설명: ${skill.metadata.description}`, 'reset');
          log(`     트리거: ${skill.metadata.triggers.slice(0, 3).join(', ')}...`, 'magenta');
        });
        passedTests++;
      } else if (result.activated.length > 0) {
        log(`\n✅ 테스트 통과: ${result.activated.length}개의 스킬 자동 활성화`, 'green');
        result.activated.forEach(skill => {
          log(`  - ${skill.metadata.name}`, 'green');
        });
        if (result.dependencies.length > 0) {
          log(`\n  의존성 스킬 (${result.dependencies.length}개):`, 'yellow');
          result.dependencies.forEach(skill => {
            log(`  - ${skill.metadata.name}`, 'yellow');
          });
        }
        passedTests++;
        
        // 활성화된 스킬 비활성화
        activator.deactivateAll();
      } else {
        log(`\n❌ 테스트 실패: 매칭되는 스킬을 찾을 수 없음`, 'red');
        failedTests++;
      }
    }

    // 6. 테스트 결과 요약
    log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'bright');
    log(`📊 테스트 결과 요약`, 'bright');
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'bright');
    log(`\n총 테스트: ${testKeywords.length}`, 'cyan');
    log(`통과: ${passedTests}`, 'green');
    log(`실패: ${failedTests}`, failedTests > 0 ? 'red' : 'reset');
    
    const successRate = (passedTests / testKeywords.length) * 100;
    log(`\n성공률: ${successRate.toFixed(1)}%`, successRate === 100 ? 'green' : 'yellow');

    if (failedTests === 0) {
      log(`\n🎉 모든 테스트가 통과했습니다!`, 'green');
      process.exit(0);
    } else {
      log(`\n⚠️  일부 테스트가 실패했습니다.`, 'yellow');
      process.exit(1);
    }

  } catch (error) {
    log(`\n❌ 테스트 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`, 'red');
    if (error instanceof Error && error.stack) {
      log(`\n스택 트레이스:`, 'red');
      log(error.stack, 'red');
    }
    process.exit(1);
  }
}

// 프로그램 실행
main().catch((error) => {
  log(`\n❌ 치명적 오류: ${error instanceof Error ? error.message : String(error)}`, 'red');
  process.exit(1);
});
