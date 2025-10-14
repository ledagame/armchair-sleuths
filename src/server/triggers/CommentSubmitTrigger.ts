/**
 * CommentSubmitTrigger.ts
 *
 * Devvit Comment Trigger - 답변 제출 처리
 * Reddit 댓글로 제출된 답변을 파싱하고 채점
 */

import { Devvit } from 'devvit';
import { createGeminiClient } from '../services/gemini/GeminiClient';
import { createW4HValidator } from '../services/scoring/W4HValidator';
import { createScoringEngine } from '../services/scoring/ScoringEngine';
import { CaseRepository } from '../services/repositories/kv/CaseRepository';
import type { W4HAnswer } from '../services/scoring/W4HValidator';

/**
 * 답변 제출 포맷 파싱
 *
 * 예상 포맷:
 * ```
 * 범인: 박준호
 * 살인방법: 독극물
 * 장소: 서재
 * 시간: 밤 11시
 * 동기: 금전 문제
 * 방법: 와인에 독을 섞음
 * ```
 */
function parseAnswer(commentBody: string): W4HAnswer | null {
  try {
    const lines = commentBody.split('\n').map(line => line.trim());

    const answer: Partial<W4HAnswer> = {};

    for (const line of lines) {
      // "키: 값" 형식 파싱
      const match = line.match(/^([^:：]+)[:\uFF1A]\s*(.+)$/);

      if (!match) {
        continue;
      }

      const [, key, value] = match;
      const normalizedKey = key.trim().toLowerCase();

      if (normalizedKey.includes('범인') || normalizedKey.includes('누가') || normalizedKey === 'who') {
        answer.who = value.trim();
      } else if (normalizedKey.includes('살인방법') || normalizedKey.includes('무엇') || normalizedKey === 'what') {
        answer.what = value.trim();
      } else if (normalizedKey.includes('장소') || normalizedKey.includes('어디') || normalizedKey === 'where') {
        answer.where = value.trim();
      } else if (normalizedKey.includes('시간') || normalizedKey.includes('언제') || normalizedKey === 'when') {
        answer.when = value.trim();
      } else if (normalizedKey.includes('동기') || normalizedKey.includes('왜') || normalizedKey === 'why') {
        answer.why = value.trim();
      } else if (normalizedKey.includes('방법') || normalizedKey.includes('어떻게') || normalizedKey === 'how') {
        answer.how = value.trim();
      }
    }

    // 필수 항목 확인
    if (answer.who && answer.what && answer.where && answer.when && answer.why && answer.how) {
      return answer as W4HAnswer;
    }

    return null;

  } catch (error) {
    console.error('Answer parsing error:', error);
    return null;
  }
}

/**
 * Devvit Comment Submit Trigger
 */
Devvit.addTrigger({
  event: 'CommentSubmit',
  onEvent: async (event, context) => {
    console.log('📝 Comment submitted:', event.comment?.id);

    try {
      // 1. 댓글 내용 확인
      const commentBody = event.comment?.body;

      if (!commentBody) {
        console.log('⚠️ Empty comment body');
        return;
      }

      // 2. 답변 파싱
      const userAnswer = parseAnswer(commentBody);

      if (!userAnswer) {
        console.log('⚠️ Invalid answer format');

        // 사용자에게 올바른 포맷 안내 댓글
        await context.reddit.submitComment({
          id: event.comment!.id,
          text: `답변 형식이 올바르지 않습니다. 다음 형식을 사용해주세요:\n\n` +
                `범인: [이름]\n` +
                `살인방법: [방법]\n` +
                `장소: [장소]\n` +
                `시간: [시간]\n` +
                `동기: [동기]\n` +
                `방법: [상세 방법]`
        });

        return;
      }

      // 3. 사용자 정보
      const userId = event.author?.id;
      if (!userId) {
        console.log('⚠️ User ID not found');
        return;
      }

      // 4. 현재 케이스 조회
      const currentCase = await CaseRepository.getTodaysCase();

      if (!currentCase) {
        console.log('⚠️ No active case found');

        await context.reddit.submitComment({
          id: event.comment!.id,
          text: '현재 활성화된 케이스가 없습니다.'
        });

        return;
      }

      // 5. 이미 제출했는지 확인
      const geminiClient = createGeminiClient();
      const validator = createW4HValidator(geminiClient);
      const scoringEngine = createScoringEngine(validator);

      const alreadySubmitted = await scoringEngine.hasUserSubmitted(currentCase.id, userId);

      if (alreadySubmitted) {
        console.log('⚠️ User already submitted');

        await context.reddit.submitComment({
          id: event.comment!.id,
          text: '이미 답변을 제출하셨습니다. 케이스당 한 번만 제출 가능합니다.'
        });

        return;
      }

      // 6. 채점 (백그라운드로 실행)
      console.log('🔄 Starting scoring process...');

      // Scheduler로 비동기 채점 (1초 제한 회피)
      await context.scheduler.runJob({
        name: 'score-submission',
        runAt: new Date(Date.now() + 1000),
        data: {
          userId,
          caseId: currentCase.id,
          userAnswer,
          correctAnswer: currentCase.solution,
          commentId: event.comment!.id
        }
      });

      // 즉시 응답 (채점 중 안내)
      await context.reddit.submitComment({
        id: event.comment!.id,
        text: '✅ 답변이 제출되었습니다! 채점 중입니다... 잠시만 기다려주세요.'
      });

      console.log('✅ Scoring job scheduled');

    } catch (error) {
      console.error('❌ Comment trigger error:', error);
    }
  }
});

/**
 * 채점 Scheduler Job
 */
Devvit.addSchedulerJob({
  name: 'score-submission',
  onRun: async (event, context) => {
    console.log('🔄 Scoring submission job started...');

    try {
      const { userId, caseId, userAnswer, correctAnswer, commentId } = event.data;

      // 1. 채점 실행
      const geminiClient = createGeminiClient();
      const validator = createW4HValidator(geminiClient);
      const scoringEngine = createScoringEngine(validator);

      const result = await scoringEngine.scoreSubmission(
        userId,
        caseId,
        userAnswer as W4HAnswer,
        correctAnswer as W4HAnswer
      );

      // 2. 결과 댓글 작성
      const resultText = `
🎯 **채점 결과**

**총점**: ${result.totalScore}/100 ${result.isCorrect ? '✅ 정답!' : '❌ 오답'}
**순위**: ${result.rank}위

**항목별 점수**:
- 범인 (누가): ${result.breakdown.who.score}/100 ${result.breakdown.who.isCorrect ? '✅' : '❌'}
- 살인방법 (무엇을): ${result.breakdown.what.score}/100 ${result.breakdown.what.isCorrect ? '✅' : '❌'}
- 장소 (어디서): ${result.breakdown.where.score}/100 ${result.breakdown.where.isCorrect ? '✅' : '❌'}
- 시간 (언제): ${result.breakdown.when.score}/100 ${result.breakdown.when.isCorrect ? '✅' : '❌'}
- 동기 (왜): ${result.breakdown.why.score}/100 ${result.breakdown.why.isCorrect ? '✅' : '❌'}
- 방법 (어떻게): ${result.breakdown.how.score}/100 ${result.breakdown.how.isCorrect ? '✅' : '❌'}

${result.isCorrect ? '🎉 축하합니다! 사건을 완벽히 해결하셨습니다!' : '💪 다음 케이스에 도전해보세요!'}
`;

      await context.reddit.submitComment({
        id: commentId,
        text: resultText
      });

      console.log(`✅ Scoring complete: ${result.totalScore}/100`);

    } catch (error) {
      console.error('❌ Scoring job error:', error);

      // 에러 안내 댓글
      if (event.data.commentId) {
        await context.reddit.submitComment({
          id: event.data.commentId,
          text: '❌ 채점 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
      }
    }
  }
});
