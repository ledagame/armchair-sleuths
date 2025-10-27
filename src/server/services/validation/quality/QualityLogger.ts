/**
 * QualityLogger.ts
 * 
 * 품질 검증 결과를 로깅하고 메트릭을 추적하는 시스템
 */

import type { QualityMetrics, QualityStatistics, QualityScores, EmotionalState } from './types';

/**
 * QualityLogger 클래스
 * 
 * 품질 검증 결과를 메모리에 저장하고 통계를 생성합니다.
 * 실제 프로덕션에서는 데이터베이스나 로깅 서비스에 저장해야 합니다.
 */
export class QualityLogger {
  private metrics: QualityMetrics[] = [];
  private maxMetrics = 1000; // 메모리에 저장할 최대 메트릭 수

  /**
   * 품질 검증 결과 로깅
   */
  log(metrics: QualityMetrics): void {
    this.metrics.push(metrics);

    // 메모리 관리: 최대 개수 초과 시 오래된 것 삭제
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // 콘솔 로깅 (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Quality Metrics:', {
        timestamp: metrics.timestamp.toISOString(),
        archetype: metrics.archetype,
        emotionalState: metrics.emotionalState,
        isGuilty: metrics.isGuilty,
        passed: metrics.passed,
        overall: metrics.scores.overall,
        feedback: metrics.feedback
      });
    }
  }

  /**
   * 전체 통계 생성
   */
  getStatistics(): QualityStatistics {
    if (this.metrics.length === 0) {
      return this.getEmptyStatistics();
    }

    const totalValidations = this.metrics.length;
    const passedValidations = this.metrics.filter(m => m.passed).length;
    const passRate = passedValidations / totalValidations;

    // 평균 점수 계산
    const averageScores = this.calculateAverageScores(this.metrics);

    // 아키타입별 통계
    const archetypeBreakdown = this.calculateArchetypeBreakdown();

    // 감정 상태별 통계
    const emotionalStateBreakdown = this.calculateEmotionalStateBreakdown();

    return {
      totalValidations,
      passRate,
      averageScores,
      archetypeBreakdown,
      emotionalStateBreakdown
    };
  }

  /**
   * 특정 아키타입의 통계
   */
  getArchetypeStatistics(archetype: string): {
    validations: number;
    passRate: number;
    averageScores: QualityScores;
  } | null {
    const archetypeMetrics = this.metrics.filter(m => m.archetype === archetype);

    if (archetypeMetrics.length === 0) {
      return null;
    }

    const validations = archetypeMetrics.length;
    const passed = archetypeMetrics.filter(m => m.passed).length;
    const passRate = passed / validations;
    const averageScores = this.calculateAverageScores(archetypeMetrics);

    return {
      validations,
      passRate,
      averageScores
    };
  }

  /**
   * 특정 감정 상태의 통계
   */
  getEmotionalStateStatistics(emotionalState: EmotionalState): {
    validations: number;
    passRate: number;
    averageScores: QualityScores;
  } | null {
    const stateMetrics = this.metrics.filter(m => m.emotionalState === emotionalState);

    if (stateMetrics.length === 0) {
      return null;
    }

    const validations = stateMetrics.length;
    const passed = stateMetrics.filter(m => m.passed).length;
    const passRate = passed / validations;
    const averageScores = this.calculateAverageScores(stateMetrics);

    return {
      validations,
      passRate,
      averageScores
    };
  }

  /**
   * 최근 N개의 메트릭 조회
   */
  getRecentMetrics(count: number = 10): QualityMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * 실패한 검증만 조회
   */
  getFailedValidations(): QualityMetrics[] {
    return this.metrics.filter(m => !m.passed);
  }

  /**
   * 메트릭 초기화 (테스트용)
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * 평균 점수 계산
   */
  private calculateAverageScores(metrics: QualityMetrics[]): QualityScores {
    if (metrics.length === 0) {
      return {
        characterConsistency: 0,
        emotionalAlignment: 0,
        informationContent: 0,
        naturalDialogue: 0,
        overall: 0
      };
    }

    const sum = metrics.reduce(
      (acc, m) => ({
        characterConsistency: acc.characterConsistency + m.scores.characterConsistency,
        emotionalAlignment: acc.emotionalAlignment + m.scores.emotionalAlignment,
        informationContent: acc.informationContent + m.scores.informationContent,
        naturalDialogue: acc.naturalDialogue + m.scores.naturalDialogue,
        overall: acc.overall + m.scores.overall
      }),
      {
        characterConsistency: 0,
        emotionalAlignment: 0,
        informationContent: 0,
        naturalDialogue: 0,
        overall: 0
      }
    );

    return {
      characterConsistency: Math.round(sum.characterConsistency / metrics.length),
      emotionalAlignment: Math.round(sum.emotionalAlignment / metrics.length),
      informationContent: Math.round(sum.informationContent / metrics.length),
      naturalDialogue: Math.round(sum.naturalDialogue / metrics.length),
      overall: Math.round(sum.overall / metrics.length)
    };
  }

  /**
   * 아키타입별 통계 계산
   */
  private calculateArchetypeBreakdown(): Map<string, {
    validations: number;
    passRate: number;
    averageScores: QualityScores;
  }> {
    const breakdown = new Map();

    // 모든 아키타입 추출
    const archetypes = Array.from(new Set(this.metrics.map(m => m.archetype)));

    for (const archetype of archetypes) {
      const stats = this.getArchetypeStatistics(archetype);
      if (stats) {
        breakdown.set(archetype, stats);
      }
    }

    return breakdown;
  }

  /**
   * 감정 상태별 통계 계산
   */
  private calculateEmotionalStateBreakdown(): Map<EmotionalState, {
    validations: number;
    passRate: number;
    averageScores: QualityScores;
  }> {
    const breakdown = new Map();

    const states: EmotionalState[] = ['COOPERATIVE', 'NERVOUS', 'DEFENSIVE', 'AGGRESSIVE'];

    for (const state of states) {
      const stats = this.getEmotionalStateStatistics(state);
      if (stats) {
        breakdown.set(state, stats);
      }
    }

    return breakdown;
  }

  /**
   * 빈 통계 반환
   */
  private getEmptyStatistics(): QualityStatistics {
    return {
      totalValidations: 0,
      passRate: 0,
      averageScores: {
        characterConsistency: 0,
        emotionalAlignment: 0,
        informationContent: 0,
        naturalDialogue: 0,
        overall: 0
      },
      archetypeBreakdown: new Map(),
      emotionalStateBreakdown: new Map()
    };
  }
}

/**
 * 싱글톤 인스턴스
 */
export const qualityLogger = new QualityLogger();
