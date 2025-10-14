/**
 * W4HValidator.ts
 *
 * 5W1H 답변 검증 서비스
 * Gemini를 사용하여 정답과 사용자 답변 비교
 */

import { GeminiClient } from '../gemini/GeminiClient';

export interface W4HAnswer {
  who: string;   // 누가 (범인)
  what: string;  // 무엇을 (살인 방법)
  where: string; // 어디서 (장소)
  when: string;  // 언제 (시간)
  why: string;   // 왜 (동기)
  how: string;   // 어떻게 (실행 방법)
}

export interface W4HValidationResult {
  who: {
    score: number; // 0-100
    isCorrect: boolean;
    feedback: string;
  };
  what: {
    score: number;
    isCorrect: boolean;
    feedback: string;
  };
  where: {
    score: number;
    isCorrect: boolean;
    feedback: string;
  };
  when: {
    score: number;
    isCorrect: boolean;
    feedback: string;
  };
  why: {
    score: number;
    isCorrect: boolean;
    feedback: string;
  };
  how: {
    score: number;
    isCorrect: boolean;
    feedback: string;
  };
  totalScore: number; // 0-100
  isFullyCorrect: boolean;
}

/**
 * 5W1H 답변 검증 서비스
 */
export class W4HValidator {
  private geminiClient: GeminiClient;

  constructor(geminiClient: GeminiClient) {
    this.geminiClient = geminiClient;
  }

  /**
   * 5W1H 답변 전체 검증
   */
  async validateAnswer(
    userAnswer: W4HAnswer,
    correctAnswer: W4HAnswer
  ): Promise<W4HValidationResult> {
    console.log('🔍 Validating 5W1H answer...');

    // 각 항목 병렬 검증
    const [who, what, where, when, why, how] = await Promise.all([
      this.validateItem('who', userAnswer.who, correctAnswer.who),
      this.validateItem('what', userAnswer.what, correctAnswer.what),
      this.validateItem('where', userAnswer.where, correctAnswer.where),
      this.validateItem('when', userAnswer.when, correctAnswer.when),
      this.validateItem('why', userAnswer.why, correctAnswer.why),
      this.validateItem('how', userAnswer.how, correctAnswer.how)
    ]);

    // 총점 계산 (각 항목 평균)
    const totalScore = Math.round(
      (who.score + what.score + where.score + when.score + why.score + how.score) / 6
    );

    // 전체 정답 여부 (모든 항목 isCorrect)
    const isFullyCorrect = who.isCorrect &&
                          what.isCorrect &&
                          where.isCorrect &&
                          when.isCorrect &&
                          why.isCorrect &&
                          how.isCorrect;

    console.log(`✅ Validation complete: ${totalScore}/100 (${isFullyCorrect ? 'Correct' : 'Incorrect'})`);

    return {
      who,
      what,
      where,
      when,
      why,
      how,
      totalScore,
      isFullyCorrect
    };
  }

  /**
   * 개별 항목 검증
   */
  private async validateItem(
    category: keyof W4HAnswer,
    userAnswer: string,
    correctAnswer: string
  ): Promise<{ score: number; isCorrect: boolean; feedback: string }> {
    const prompt = this.buildValidationPrompt(category, userAnswer, correctAnswer);

    const response = await this.geminiClient.generateText(prompt, {
      temperature: 0.3, // 일관된 검증
      maxTokens: 512
    });

    // JSON 파싱
    const result = this.geminiClient.parseJsonResponse<{
      score: number;
      isCorrect: boolean;
      feedback: string;
    }>(response.text);

    console.log(`   ${category}: ${result.score}/100 (${result.isCorrect ? '✅' : '❌'})`);

    return result;
  }

  /**
   * 검증 프롬프트 생성
   */
  private buildValidationPrompt(
    category: keyof W4HAnswer,
    userAnswer: string,
    correctAnswer: string
  ): string {
    const categoryNames = {
      who: '누가 (범인)',
      what: '무엇을 (살인 방법)',
      where: '어디서 (장소)',
      when: '언제 (시간)',
      why: '왜 (동기)',
      how: '어떻게 (실행 방법)'
    };

    return `당신은 살인 미스터리 게임의 채점자입니다.

**검증 항목:** ${categoryNames[category]}

**정답:**
${correctAnswer}

**사용자 답변:**
${userAnswer}

**채점 기준:**
1. **정확성**: 핵심 내용이 일치하는가?
2. **완전성**: 필요한 정보가 모두 포함되어 있는가?
3. **유사성**: 표현은 다르지만 의미가 같은가?

**채점 규칙:**
- 100점: 완벽히 일치 (이름, 방법, 장소 등이 정확)
- 80-99점: 핵심은 맞지만 세부사항 다름
- 50-79점: 부분적으로 맞음
- 1-49점: 대부분 틀림
- 0점: 완전히 틀림

**isCorrect 판정:**
- 점수 >= 80: true
- 점수 < 80: false

**응답 형식 (JSON):**
\`\`\`json
{
  "score": 95,
  "isCorrect": true,
  "feedback": "범인 이름이 정확합니다."
}
\`\`\`

JSON만 응답하세요:`;
  }

  /**
   * 빠른 정답 여부 확인 (점수 계산 없이)
   */
  async quickCheck(
    userAnswer: W4HAnswer,
    correctAnswer: W4HAnswer
  ): Promise<boolean> {
    // 간단한 문자열 비교로 빠른 체크
    const whoMatch = this.simpleMatch(userAnswer.who, correctAnswer.who);
    const whatMatch = this.simpleMatch(userAnswer.what, correctAnswer.what);
    const whereMatch = this.simpleMatch(userAnswer.where, correctAnswer.where);

    // who는 필수 정확
    if (!whoMatch) {
      return false;
    }

    // what, where 중 하나라도 맞으면 부분 정답 가능성
    return whatMatch || whereMatch;
  }

  /**
   * 간단한 문자열 매칭 (이름, 장소 등)
   */
  private simpleMatch(userAnswer: string, correctAnswer: string): boolean {
    const normalize = (str: string) =>
      str.toLowerCase().replace(/\s+/g, '').trim();

    const user = normalize(userAnswer);
    const correct = normalize(correctAnswer);

    // 정확히 일치
    if (user === correct) {
      return true;
    }

    // 부분 일치 (60% 이상)
    const longer = Math.max(user.length, correct.length);
    const shorter = Math.min(user.length, correct.length);

    if (longer === 0) {
      return false;
    }

    // 포함 관계
    if (user.includes(correct) || correct.includes(user)) {
      return shorter / longer >= 0.6;
    }

    return false;
  }
}

/**
 * 싱글톤 인스턴스 생성 헬퍼
 */
export function createW4HValidator(geminiClient: GeminiClient): W4HValidator {
  return new W4HValidator(geminiClient);
}
