/**
 * ResultView.tsx
 *
 * Displays scoring results and leaderboard
 * Shows breakdown of 5W1H answers with feedback
 */

import { useEffect, useState } from 'react';
import type {
  ScoringResult,
  LeaderboardEntry,
  CaseStatistics,
  W4HValidationDetail,
} from '../../types';

export interface ResultViewProps {
  result: ScoringResult;
  caseId: string;
}

/**
 * Results and leaderboard display component
 */
export function ResultView({ result, caseId }: ResultViewProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<CaseStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch leaderboard and statistics
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [leaderboardRes, statsRes] = await Promise.all([
          fetch(`/api/leaderboard/${caseId}?limit=10`),
          fetch(`/api/stats/${caseId}`),
        ]);

        if (leaderboardRes.ok) {
          const data = await leaderboardRes.json();
          setLeaderboard(data.leaderboard);
        }

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch results data:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [caseId]);

  // Get color based on score (Using Detective Theme)
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-detective-gold';   // Excellent - Detective gold
    if (score >= 60) return 'text-evidence-clue';    // Good - Discovery blue
    if (score >= 40) return 'text-detective-amber';  // Fair - Amber warning
    return 'text-evidence-blood';                     // Poor - Blood red
  };

  // Get emoji based on correctness
  const getResultEmoji = (isCorrect: boolean): string => {
    return isCorrect ? '✅' : '❌';
  };

  // Render individual W4H item - Mobile-First
  const renderW4HItem = (
    label: string,
    detail: W4HValidationDetail,
    emoji: string
  ) => (
    <div className="
      bg-noir-gunmetal
      p-4 sm:p-5
      rounded-lg
      border-2 border-noir-fog
      hover:border-detective-brass
      transition-all duration-base
    ">
      <div className="
        flex flex-col sm:flex-row
        items-start sm:items-center
        justify-between
        gap-2 sm:gap-4
        mb-3
      ">
        <h4 className="
          text-base sm:text-lg
          font-semibold
          text-detective-gold
        ">
          {emoji} {label}
        </h4>
        <div className="flex items-center gap-2">
          <span className={`text-lg sm:text-xl font-bold ${getScoreColor(detail.score)}`}>
            {detail.score}점
          </span>
          <span className="text-xl sm:text-2xl" aria-hidden="true">
            {getResultEmoji(detail.isCorrect)}
          </span>
        </div>
      </div>
      <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
        {detail.feedback}
      </p>
    </div>
  );

  return (
    <div className="
      result-view
      space-y-6 sm:space-y-8
    ">
      {/* Overall Score - Celebration Card */}
      <div className={`
        ${result.isCorrect ? 'detective-gradient' : 'bg-noir-charcoal'}
        p-6 sm:p-8 lg:p-10
        rounded-lg sm:rounded-xl
        text-center
        border-2
        ${result.isCorrect ? 'border-detective-gold shadow-glow-strong' : 'border-evidence-blood'}
      `}>
        <h2 className="
          text-3xl sm:text-4xl lg:text-5xl
          font-display font-bold
          mb-4 sm:mb-6
          ${result.isCorrect ? 'text-noir-deepBlack' : 'text-detective-gold'}
        ">
          {result.isCorrect ? '🎉 정답입니다!' : '😢 아쉽네요...'}
        </h2>
        <div className="
          text-5xl sm:text-6xl lg:text-7xl
          font-display font-bold
          mb-3 sm:mb-4
        ">
          <span className={result.isCorrect ? 'text-noir-deepBlack' : getScoreColor(result.totalScore)}>
            {result.totalScore}점
          </span>
        </div>
        <p className="
          text-lg sm:text-xl
          ${result.isCorrect ? 'text-noir-deepBlack opacity-80' : 'text-text-primary'}
        ">
          {result.rank && `전체 순위: ${result.rank}위`}
        </p>
        {result.isCorrect && (
          <p className="
            mt-4 sm:mt-6
            text-base sm:text-lg
            text-noir-deepBlack
            font-semibold
          ">
            범인을 정확히 찾아냈습니다! 훌륭한 추리력이네요.
          </p>
        )}
      </div>

      {/* Detailed Breakdown - Mobile-First */}
      <div className="
        bg-noir-charcoal
        p-4 sm:p-6 lg:p-8
        rounded-lg sm:rounded-xl
        border-2 border-noir-fog
      ">
        <h3 className="
          text-xl sm:text-2xl lg:text-3xl
          font-display font-bold
          text-detective-gold
          mb-4 sm:mb-6
        ">
          📊 상세 채점 결과
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {renderW4HItem('WHO (누가)', result.breakdown.who, '❓')}
          {renderW4HItem('WHAT (무엇을)', result.breakdown.what, '❓')}
          {renderW4HItem('WHERE (어디서)', result.breakdown.where, '❓')}
          {renderW4HItem('WHEN (언제)', result.breakdown.when, '❓')}
          {renderW4HItem('WHY (왜)', result.breakdown.why, '❓')}
          {renderW4HItem('HOW (어떻게)', result.breakdown.how, '❓')}
        </div>
      </div>

      {/* Statistics - Mobile-First Grid */}
      {stats && (
        <div className="
          bg-noir-charcoal
          p-4 sm:p-6 lg:p-8
          rounded-lg sm:rounded-xl
          border-2 border-noir-fog
        ">
          <h3 className="
            text-xl sm:text-2xl lg:text-3xl
            font-display font-bold
            text-detective-gold
            mb-4 sm:mb-6
          ">
            📈 전체 통계
          </h3>
          <div className="
            grid grid-cols-2 md:grid-cols-3
            gap-3 sm:gap-4
          ">
            {/* Total Submissions */}
            <div className="
              bg-noir-gunmetal
              p-3 sm:p-4
              rounded-lg
              text-center
              border border-noir-fog
              hover:border-detective-brass
              transition-all duration-base
            ">
              <p className="text-xs sm:text-sm text-text-muted mb-1">총 제출</p>
              <p className="text-2xl sm:text-3xl font-bold text-text-primary">
                {stats.totalSubmissions}
              </p>
            </div>

            {/* Correct Submissions */}
            <div className="
              bg-noir-gunmetal
              p-3 sm:p-4
              rounded-lg
              text-center
              border border-noir-fog
              hover:border-detective-brass
              transition-all duration-base
            ">
              <p className="text-xs sm:text-sm text-text-muted mb-1">정답자</p>
              <p className="text-2xl sm:text-3xl font-bold text-detective-gold">
                {stats.correctSubmissions}
              </p>
            </div>

            {/* Average Score */}
            <div className="
              bg-noir-gunmetal
              p-3 sm:p-4
              rounded-lg
              text-center
              border border-noir-fog
              hover:border-detective-brass
              transition-all duration-base
            ">
              <p className="text-xs sm:text-sm text-text-muted mb-1">평균 점수</p>
              <p className="text-2xl sm:text-3xl font-bold text-evidence-clue">
                {stats.averageScore}
              </p>
            </div>

            {/* Highest Score */}
            <div className="
              bg-noir-gunmetal
              p-3 sm:p-4
              rounded-lg
              text-center
              border border-noir-fog
              hover:border-detective-brass
              transition-all duration-base
            ">
              <p className="text-xs sm:text-sm text-text-muted mb-1">최고 점수</p>
              <p className="text-2xl sm:text-3xl font-bold text-detective-amber">
                {stats.highestScore}
              </p>
            </div>

            {/* Lowest Score */}
            <div className="
              bg-noir-gunmetal
              p-3 sm:p-4
              rounded-lg
              text-center
              border border-noir-fog
              hover:border-detective-brass
              transition-all duration-base
            ">
              <p className="text-xs sm:text-sm text-text-muted mb-1">최저 점수</p>
              <p className="text-2xl sm:text-3xl font-bold text-evidence-blood">
                {stats.lowestScore}
              </p>
            </div>

            {/* Success Rate */}
            <div className="
              bg-noir-gunmetal
              p-3 sm:p-4
              rounded-lg
              text-center
              border border-noir-fog
              hover:border-detective-brass
              transition-all duration-base
            ">
              <p className="text-xs sm:text-sm text-text-muted mb-1">정답률</p>
              <p className="text-2xl sm:text-3xl font-bold text-evidence-poison">
                {stats.totalSubmissions > 0
                  ? Math.round((stats.correctSubmissions / stats.totalSubmissions) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard - Mobile-First */}
      {!loading && leaderboard.length > 0 && (
        <div className="
          bg-noir-charcoal
          p-4 sm:p-6 lg:p-8
          rounded-lg sm:rounded-xl
          border-2 border-noir-fog
        ">
          <h3 className="
            text-xl sm:text-2xl lg:text-3xl
            font-display font-bold
            text-detective-gold
            mb-4 sm:mb-6
          ">
            🏆 리더보드 (Top 10)
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.userId}
                className={`
                  flex flex-col sm:flex-row
                  items-start sm:items-center
                  justify-between
                  p-3 sm:p-4
                  rounded-lg
                  gap-3
                  transition-all duration-base
                  ${
                    entry.userId === result.userId
                      ? 'bg-detective-gold/10 border-2 border-detective-gold shadow-glow'
                      : 'bg-noir-gunmetal border border-noir-fog hover:border-detective-brass'
                  }
                `}
              >
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <span className="
                    text-xl sm:text-2xl
                    font-bold
                    w-8 sm:w-10
                    text-center
                    flex-shrink-0
                  ">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${entry.rank}`}
                  </span>
                  <div className="flex-1">
                    <p className="
                      font-semibold
                      text-sm sm:text-base
                      text-text-primary
                    ">
                      {entry.userId}
                      {entry.userId === result.userId && (
                        <span className="ml-2 text-xs text-detective-gold">(나)</span>
                      )}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(entry.submittedAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right ml-12 sm:ml-0">
                  <p className={`text-xl sm:text-2xl font-bold ${getScoreColor(entry.score)}`}>
                    {entry.score}점
                  </p>
                  {entry.isCorrect && (
                    <p className="text-xs text-detective-gold font-semibold">✅ 정답</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="
          text-center
          py-8 sm:py-12
          bg-noir-charcoal
          rounded-lg
          border-2 border-noir-fog
        ">
          <div className="spinner w-12 h-12 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-text-secondary">
            리더보드 로딩 중...
          </p>
        </div>
      )}
    </div>
  );
}
