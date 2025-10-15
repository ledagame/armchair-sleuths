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

  // Get color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  // Get emoji based on correctness
  const getResultEmoji = (isCorrect: boolean): string => {
    return isCorrect ? '✅' : '❌';
  };

  // Render individual W4H item
  const renderW4HItem = (
    label: string,
    detail: W4HValidationDetail,
    emoji: string
  ) => (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-semibold">
          {emoji} {label}
        </h4>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-bold ${getScoreColor(detail.score)}`}>
            {detail.score}점
          </span>
          <span className="text-2xl">{getResultEmoji(detail.isCorrect)}</span>
        </div>
      </div>
      <p className="text-sm text-gray-400">{detail.feedback}</p>
    </div>
  );

  return (
    <div className="result-view space-y-6">
      {/* Overall Score */}
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 p-8 rounded-lg text-center">
        <h2 className="text-4xl font-bold mb-4">
          {result.isCorrect ? '🎉 정답입니다!' : '😢 아쉽네요...'}
        </h2>
        <div className="text-6xl font-bold mb-2">
          <span className={getScoreColor(result.totalScore)}>{result.totalScore}점</span>
        </div>
        <p className="text-xl text-gray-300">
          {result.rank && `전체 순위: ${result.rank}위`}
        </p>
        {result.isCorrect && (
          <p className="text-green-400 mt-4 text-lg">
            범인을 정확히 찾아냈습니다! 훌륭한 추리력이네요.
          </p>
        )}
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">📊 상세 채점 결과</h3>
        <div className="space-y-3">
          {renderW4HItem('WHO (누가)', result.breakdown.who, '❓')}
          {renderW4HItem('WHAT (무엇을)', result.breakdown.what, '❓')}
          {renderW4HItem('WHERE (어디서)', result.breakdown.where, '❓')}
          {renderW4HItem('WHEN (언제)', result.breakdown.when, '❓')}
          {renderW4HItem('WHY (왜)', result.breakdown.why, '❓')}
          {renderW4HItem('HOW (어떻게)', result.breakdown.how, '❓')}
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">📈 전체 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400 mb-1">총 제출</p>
              <p className="text-3xl font-bold">{stats.totalSubmissions}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400 mb-1">정답자</p>
              <p className="text-3xl font-bold text-green-400">{stats.correctSubmissions}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400 mb-1">평균 점수</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.averageScore}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400 mb-1">최고 점수</p>
              <p className="text-3xl font-bold text-blue-400">{stats.highestScore}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400 mb-1">최저 점수</p>
              <p className="text-3xl font-bold text-red-400">{stats.lowestScore}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400 mb-1">정답률</p>
              <p className="text-3xl font-bold text-purple-400">
                {stats.totalSubmissions > 0
                  ? Math.round((stats.correctSubmissions / stats.totalSubmissions) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {!loading && leaderboard.length > 0 && (
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">🏆 리더보드 (Top 10)</h3>
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.userId}
                className={`
                  flex items-center justify-between p-4 rounded-lg
                  ${
                    entry.userId === result.userId
                      ? 'bg-blue-900 border-2 border-blue-500'
                      : 'bg-gray-800'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold w-8 text-center">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${entry.rank}`}
                  </span>
                  <div>
                    <p className="font-semibold">
                      {entry.userId}
                      {entry.userId === result.userId && (
                        <span className="ml-2 text-xs text-blue-400">(나)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.submittedAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getScoreColor(entry.score)}`}>
                    {entry.score}점
                  </p>
                  {entry.isCorrect && <p className="text-xs text-green-400">정답</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">리더보드 로딩 중...</p>
        </div>
      )}
    </div>
  );
}
