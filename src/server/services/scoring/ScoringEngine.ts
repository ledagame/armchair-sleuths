/**
 * ScoringEngine.ts
 *
 * 점수 계산 엔진
 * W4HValidator 결과를 종합하여 최종 점수 산출
 */

import { W4HValidator, type W4HAnswer, type W4HValidationResult } from './W4HValidator';
import { KVStoreManager, type SubmissionData } from '../repositories/kv/KVStoreManager';

export interface ScoringResult {
  userId: string;
  caseId: string;
  totalScore: number; // 0-100
  isCorrect: boolean;
  breakdown: W4HValidationResult;
  submittedAt: number;
  rank?: number; // 리더보드 순위
}

export interface LeaderboardEntry {
  userId: string;
  score: number;
  isCorrect: boolean;
  submittedAt: number;
  rank: number;
}

/**
 * 점수 계산 엔진
 */
export class ScoringEngine {
  private validator: W4HValidator;

  constructor(validator: W4HValidator) {
    this.validator = validator;
  }

  /**
   * 답변 채점 및 저장
   */
  async scoreSubmission(
    userId: string,
    caseId: string,
    userAnswer: W4HAnswer,
    correctAnswer: W4HAnswer
  ): Promise<ScoringResult> {
    console.log(`📊 Scoring submission for user ${userId}, case ${caseId}...`);

    const startTime = Date.now();

    // 1. 5W1H 검증
    const validation = await this.validator.validateAnswer(userAnswer, correctAnswer);

    // 2. 제출 데이터 구성
    const submission: SubmissionData = {
      userId,
      caseId,
      submittedAt: Date.now(),
      answers: userAnswer,
      score: validation.totalScore,
      isCorrect: validation.isFullyCorrect
    };

    // 3. 저장
    await KVStoreManager.saveSubmission(submission);

    // 4. 순위 계산
    const rank = await this.calculateRank(caseId, userId);

    const duration = Date.now() - startTime;
    console.log(`✅ Scoring complete in ${duration}ms: ${validation.totalScore}/100 (Rank: ${rank})`);

    return {
      userId,
      caseId,
      totalScore: validation.totalScore,
      isCorrect: validation.isFullyCorrect,
      breakdown: validation,
      submittedAt: submission.submittedAt,
      rank
    };
  }

  /**
   * 사용자 순위 계산
   */
  private async calculateRank(caseId: string, userId: string): Promise<number> {
    const submissions = await KVStoreManager.getCaseSubmissions(caseId);

    // 점수 순으로 정렬 (동점일 경우 빠른 제출이 우선)
    const sorted = submissions.sort((a, b) => {
      if (b.score !== a.score) {
        return (b.score || 0) - (a.score || 0);
      }
      return a.submittedAt - b.submittedAt;
    });

    // 사용자 순위 찾기
    const userIndex = sorted.findIndex(s => s.userId === userId);

    return userIndex + 1; // 1-based ranking
  }

  /**
   * 리더보드 조회
   */
  async getLeaderboard(caseId: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    const submissions = await KVStoreManager.getLeaderboard(caseId, limit);

    return submissions.map((submission, index) => ({
      userId: submission.userId,
      score: submission.score || 0,
      isCorrect: submission.isCorrect || false,
      submittedAt: submission.submittedAt,
      rank: index + 1
    }));
  }

  /**
   * 사용자 제출 여부 확인
   */
  async hasUserSubmitted(caseId: string, userId: string): Promise<boolean> {
    const submission = await KVStoreManager.getSubmission(caseId, userId);
    return submission !== null;
  }

  /**
   * 사용자 점수 조회
   */
  async getUserScore(caseId: string, userId: string): Promise<ScoringResult | null> {
    const submission = await KVStoreManager.getSubmission(caseId, userId);

    if (!submission) {
      return null;
    }

    const rank = await this.calculateRank(caseId, userId);

    // W4HValidationResult 재구성 (저장되지 않았으므로 간단히)
    const breakdown: W4HValidationResult = {
      who: { score: 0, isCorrect: false, feedback: '' },
      what: { score: 0, isCorrect: false, feedback: '' },
      where: { score: 0, isCorrect: false, feedback: '' },
      when: { score: 0, isCorrect: false, feedback: '' },
      why: { score: 0, isCorrect: false, feedback: '' },
      how: { score: 0, isCorrect: false, feedback: '' },
      totalScore: submission.score || 0,
      isFullyCorrect: submission.isCorrect || false
    };

    return {
      userId: submission.userId,
      caseId: submission.caseId,
      totalScore: submission.score || 0,
      isCorrect: submission.isCorrect || false,
      breakdown,
      submittedAt: submission.submittedAt,
      rank
    };
  }

  /**
   * 케이스 통계
   */
  async getCaseStatistics(caseId: string): Promise<{
    totalSubmissions: number;
    correctSubmissions: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  }> {
    const submissions = await KVStoreManager.getCaseSubmissions(caseId);

    if (submissions.length === 0) {
      return {
        totalSubmissions: 0,
        correctSubmissions: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }

    const scores = submissions.map(s => s.score || 0);

    return {
      totalSubmissions: submissions.length,
      correctSubmissions: submissions.filter(s => s.isCorrect).length,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores)
    };
  }

  /**
   * 빠른 채점 (AI 없이)
   */
  async quickScore(
    userId: string,
    caseId: string,
    userAnswer: W4HAnswer,
    correctAnswer: W4HAnswer
  ): Promise<{ isLikelyCorrect: boolean; estimatedScore: number }> {
    const isQuickMatch = await this.validator.quickCheck(userAnswer, correctAnswer);

    return {
      isLikelyCorrect: isQuickMatch,
      estimatedScore: isQuickMatch ? 85 : 30
    };
  }
}

/**
 * 싱글톤 인스턴스 생성 헬퍼
 */
export function createScoringEngine(validator: W4HValidator): ScoringEngine {
  return new ScoringEngine(validator);
}
