#!/usr/bin/env tsx
/**
 * Skill Activation Demo
 * 
 * 실제 스킬 시스템을 사용해보는 인터랙티브 데모
 * 
 * 실행 방법:
 * npx tsx .kiro/skills-system/demo-skill-activation.ts
 */

import { SkillRegistry } from './core/SkillRegistry';
import { KeywordMatcher } from './core/KeywordMatcher';
import { DependencyResolver } from './core/DependencyResolver';
import { DependencyGraph } from './core/DependencyGraph';
import { SkillChainBuilder } from './core/SkillChainBuilder';
import { SkillActivator } from './core/SkillActivator';
import { SkillDiscoveryService } from './core/SkillDiscoveryService';
import { SkillScanner } from './core/SkillScanner';
import { MetadataParser } from './core/MetadataParser';
import { SkillValidator } from './core/SkillValidator';
import { KeywordIndexer } from './core/KeywordIndexer';
import * as readline from 'readline';
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
  log('\n🎯 Skill Activation Demo\n', 'bright');
  log('스킬 시스템을 초기화하는 중...', 'cyan');

  // 1. 스킬 디스커버리 서비스 초기화 (먼저 초기화하여 indexer를 얻음)
  const skillsDir = path.join(process.cwd(), 'skills');
  const discoveryService = new SkillDiscoveryService(skillsDir);

  // 2. 스킬 시스템 초기화
  const registry = new SkillRegistry();
  const keywordIndexer = discoveryService.getIndexer();
  const keywordMatcher = new KeywordMatcher(registry, keywordIndexer, 0.7);
  const dependencyGraph = new DependencyGraph();
  const dependencyResolver = new DependencyResolver(registry);
  const skillChainBuilder = new SkillChainBuilder(registry);
  const activator = new SkillActivator(
    registry,
    keywordMatcher,
    dependencyResolver,
    skillChainBuilder
  );

  // 3. skills/ 디렉토리에서 스킬 스캔
  log(`\n📂 스킬 디렉토리 스캔 중: ${skillsDir}`, 'cyan');
  
  try {
    const discoveredSkills = await discoveryService.scanSkills();
    
    // 레지스트리에 스킬 등록
    for (const [name, skill] of discoveredSkills.entries()) {
      await registry.addSkill(skill);
    }
    
    const allSkills = discoveryService.getAllSkills();
    
    if (allSkills.length === 0) {
      log('\n⚠️  발견된 스킬이 없습니다.', 'yellow');
      log('skills/ 디렉토리에 SKILL.md 또는 SKILL.yaml 파일이 있는 스킬을 추가해주세요.', 'yellow');
      return;
    }

    log(`\n✅ ${allSkills.length}개의 스킬을 발견했습니다!\n`, 'green');

    // 4. 발견된 스킬 목록 표시
    log('📋 사용 가능한 스킬:', 'bright');
    allSkills.forEach((skill, index) => {
      log(`\n${index + 1}. ${skill.metadata.name} (v${skill.metadata.version})`, 'cyan');
      log(`   ${skill.metadata.description}`, 'reset');
      if (skill.metadata.triggers.length > 0) {
        log(`   트리거: ${skill.metadata.triggers.join(', ')}`, 'magenta');
      }
      if (skill.metadata.dependencies?.skills && skill.metadata.dependencies.skills.length > 0) {
        log(`   의존성: ${skill.metadata.dependencies.skills.join(', ')}`, 'yellow');
      }
    });

    // 5. 이벤트 리스너 설정
    activator.on('skill:activated', (event) => {
      const emoji = event.isDependency ? '🔗' : '✨';
      const label = event.isDependency ? '의존성' : '스킬';
      log(`\n${emoji} ${label} 활성화: ${event.skill.metadata.name}`, 'green');
    });

    activator.on('skill:deactivated', (event) => {
      log(`\n🔴 스킬 비활성화: ${event.skill.metadata.name}`, 'yellow');
    });

    // 6. 인터랙티브 모드 시작
    log('\n\n🎮 인터랙티브 모드', 'bright');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('\n사용 가능한 명령어:', 'bright');
    log('  activate <키워드>  - 키워드로 스킬 활성화', 'reset');
    log('  activate-name <스킬명>  - 이름으로 스킬 활성화', 'reset');
    log('  list              - 모든 스킬 목록', 'reset');
    log('  active            - 활성화된 스킬 목록', 'reset');
    log('  deactivate <스킬명>  - 스킬 비활성화', 'reset');
    log('  deactivate-all    - 모든 스킬 비활성화', 'reset');
    log('  stats             - 통계 보기', 'reset');
    log('  history           - 활성화 히스토리', 'reset');
    log('  chain <작업설명>  - 스킬 체인 구축', 'reset');
    log('  help              - 도움말', 'reset');
    log('  exit              - 종료', 'reset');
    log('', 'reset');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const prompt = () => {
      rl.question(colors.bright + '\n> ' + colors.reset, async (input) => {
        const [command, ...args] = input.trim().split(' ');

        try {
          switch (command) {
            case 'activate': {
              const keywords = args.join(' ');
              if (!keywords) {
                log('❌ 키워드를 입력해주세요. 예: activate improve prompt', 'red');
                break;
              }

              log(`\n🔍 키워드로 스킬 검색 중: ${keywords}`, 'cyan');
              const result = activator.activateByKeywords(keywords, false);

              if (result.requiresUserSelection) {
                log(`\n🎯 ${result.suggestions.length}개의 매칭된 스킬을 찾았습니다:`, 'yellow');
                result.suggestions.forEach((skill, index) => {
                  log(`   ${index + 1}. ${skill.metadata.name} - ${skill.metadata.description}`, 'cyan');
                });
                log('\n   "activate-name <스킬명>"으로 특정 스킬을 활성화하세요.', 'magenta');
              } else if (result.activated.length > 0) {
                log(`\n✅ ${result.activated.length}개의 스킬이 활성화되었습니다!`, 'green');
                result.activated.forEach(skill => {
                  log(`   - ${skill.metadata.name}`, 'green');
                });
                if (result.dependencies.length > 0) {
                  log(`\n   의존성 스킬 (${result.dependencies.length}개):`, 'yellow');
                  result.dependencies.forEach(skill => {
                    log(`   - ${skill.metadata.name}`, 'yellow');
                  });
                }
              } else if (result.failed.length > 0) {
                log('\n❌ 스킬 활성화 실패:', 'red');
                result.failed.forEach(f => {
                  log(`   - ${f.skillName || '알 수 없음'}: ${f.reason}`, 'red');
                });
              } else {
                log('\n⚠️  매칭되는 스킬을 찾을 수 없습니다.', 'yellow');
              }
              break;
            }

            case 'activate-name': {
              const skillName = args.join(' ');
              if (!skillName) {
                log('❌ 스킬 이름을 입력해주세요. 예: activate-name suspect-ai-prompter', 'red');
                break;
              }

              log(`\n🎯 스킬 활성화 중: ${skillName}`, 'cyan');
              const result = activator.activateSkill(skillName);

              if (result.success) {
                log(`\n✅ 스킬이 활성화되었습니다!`, 'green');
                if (result.dependencies.length > 0) {
                  log(`   의존성: ${result.dependencies.map(d => d.metadata.name).join(', ')}`, 'yellow');
                }
              } else {
                log('\n❌ 스킬 활성화 실패:', 'red');
                result.failed.forEach(f => {
                  log(`   ${f.reason}`, 'red');
                });
              }
              break;
            }

            case 'list': {
              const skills = registry.getAllSkills();
              log(`\n📋 전체 스킬 목록 (${skills.length}개):`, 'bright');
              skills.forEach((skill, index) => {
                const isActive = activator.isSkillActive(skill.metadata.name);
                const status = isActive ? '🟢' : '⚪';
                log(`\n${status} ${index + 1}. ${skill.metadata.name}`, 'cyan');
                log(`   ${skill.metadata.description}`, 'reset');
                log(`   트리거: ${skill.metadata.triggers.join(', ')}`, 'magenta');
              });
              break;
            }

            case 'active': {
              const activeSkills = activator.getActiveSkills();
              if (activeSkills.length === 0) {
                log('\n⚪ 활성화된 스킬이 없습니다.', 'yellow');
              } else {
                log(`\n🟢 활성화된 스킬 (${activeSkills.length}개):`, 'bright');
                activeSkills.forEach((skill, index) => {
                  log(`\n${index + 1}. ${skill.metadata.name}`, 'green');
                  log(`   ${skill.metadata.description}`, 'reset');
                });
              }
              break;
            }

            case 'deactivate': {
              const skillName = args.join(' ');
              if (!skillName) {
                log('❌ 스킬 이름을 입력해주세요.', 'red');
                break;
              }

              const success = activator.deactivateSkill(skillName);
              if (success) {
                log(`\n✅ 스킬이 비활성화되었습니다: ${skillName}`, 'green');
              } else {
                log(`\n❌ 스킬을 찾을 수 없거나 이미 비활성화되어 있습니다: ${skillName}`, 'red');
              }
              break;
            }

            case 'deactivate-all': {
              const activeSkills = activator.getActiveSkills();
              const count = activeSkills.length;
              activator.deactivateAll();
              log(`\n✅ ${count}개의 스킬이 모두 비활성화되었습니다.`, 'green');
              break;
            }

            case 'stats': {
              const stats = activator.getStats();
              log('\n📊 스킬 시스템 통계:', 'bright');
              log(`   현재 활성 스킬: ${stats.totalActive}`, 'green');
              log(`   최대 활성 스킬: ${stats.maxActive}`, 'cyan');
              
              if (stats.averageActiveDuration > 0) {
                const minutes = Math.floor(stats.averageActiveDuration / 60000);
                const seconds = Math.floor((stats.averageActiveDuration % 60000) / 1000);
                log(`   평균 활성 시간: ${minutes}분 ${seconds}초`, 'yellow');
              }
              break;
            }

            case 'history': {
              log('\n📜 히스토리 기능은 현재 버전에서 지원하지 않습니다.', 'yellow');
              break;
            }

            case 'chain': {
              const task = args.join(' ');
              if (!task) {
                log('❌ 작업 설명을 입력해주세요. 예: chain Improve suspect prompts', 'red');
                break;
              }

              const activeSkills = activator.getActiveSkills();
              if (activeSkills.length === 0) {
                log('❌ 활성화된 스킬이 없습니다. 먼저 스킬을 활성화해주세요.', 'red');
                break;
              }

              log(`\n⛓️  스킬 체인 구축 중: "${task}"`, 'cyan');
              const chain = activator.buildChainForActiveSkills(task);

              if (chain.errors && chain.errors.length > 0) {
                log('\n❌ 스킬 체인 생성 실패:', 'red');
                chain.errors.forEach(error => {
                  log(`   - ${error}`, 'red');
                });
                break;
              }

              log(`\n✅ 스킬 체인이 생성되었습니다!`, 'green');
              log(`   총 단계: ${chain.steps.length}`, 'cyan');
              log(`   예상 소요 시간: ${Math.ceil(chain.estimatedDuration / 1000)}초`, 'yellow');
              log(`   필요한 권한: ${chain.requiredPermissions.length}개`, 'magenta');

              if (chain.steps.length > 0) {
                log('\n   실행 순서:', 'bright');
                chain.steps.forEach((step, index) => {
                  log(`   ${index + 1}. ${step.skillName} - ${step.description}`, 'reset');
                });
              }
              break;
            }

            case 'help': {
              log('\n📖 도움말', 'bright');
              log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
              log('\n명령어 설명:', 'bright');
              log('  activate <키워드>       - 키워드와 매칭되는 스킬을 찾아 활성화합니다', 'reset');
              log('                           예: activate suspect prompt', 'reset');
              log('  activate-name <스킬명>  - 정확한 스킬 이름으로 활성화합니다', 'reset');
              log('                           예: activate-name suspect-ai-prompter', 'reset');
              log('  list                    - 사용 가능한 모든 스킬을 표시합니다', 'reset');
              log('  active                  - 현재 활성화된 스킬 목록을 표시합니다', 'reset');
              log('  deactivate <스킬명>     - 특정 스킬을 비활성화합니다', 'reset');
              log('  deactivate-all          - 모든 활성 스킬을 비활성화합니다', 'reset');
              log('  stats                   - 스킬 사용 통계를 표시합니다', 'reset');
              log('  history                 - 최근 활성화/비활성화 히스토리를 표시합니다', 'reset');
              log('  chain <작업설명>        - 활성 스킬로 실행 체인을 구축합니다', 'reset');
              log('                           예: chain Improve suspect prompts', 'reset');
              log('  help                    - 이 도움말을 표시합니다', 'reset');
              log('  exit                    - 프로그램을 종료합니다', 'reset');
              break;
            }

            case 'exit':
            case 'quit': {
              log('\n👋 스킬 시스템을 종료합니다...', 'cyan');
              rl.close();
              process.exit(0);
            }

            default: {
              if (command) {
                log(`\n❌ 알 수 없는 명령어: ${command}`, 'red');
                log('   "help"를 입력하여 사용 가능한 명령어를 확인하세요.', 'yellow');
              }
            }
          }
        } catch (error) {
          log(`\n❌ 오류 발생: ${error instanceof Error ? error.message : String(error)}`, 'red');
        }

        prompt();
      });
    };

    prompt();

  } catch (error) {
    log(`\n❌ 스킬 스캔 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`, 'red');
    process.exit(1);
  }
}

// 프로그램 실행
main().catch((error) => {
  log(`\n❌ 치명적 오류: ${error instanceof Error ? error.message : String(error)}`, 'red');
  process.exit(1);
});
