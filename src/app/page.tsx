/**
 * Home Page
 *
 * Main landing page with link to today's case
 */

import Link from 'next/link';

export default async function HomePage() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const todayCaseId = `case-${today}`;

  return (
    <div className="min-h-screen bg-noir-deepBlack text-text-primary flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl font-bold text-detective-gold mb-4">
            🕵️ Armchair Sleuths
          </h1>
          <p className="text-xl text-text-secondary font-body">
            당신의 추리 실력을 시험하세요
          </p>
        </div>

        {/* Today's Case Card */}
        <div className="bg-noir-charcoal border-2 border-detective-gold rounded-xl p-8 shadow-2xl hover:shadow-glow transition-all">
          <h2 className="font-display text-3xl font-bold text-detective-gold mb-4">
            📅 오늘의 사건
          </h2>

          <p className="text-text-secondary mb-6 font-body">
            매일 새로운 살인 미스터리가 기다립니다. 증거를 수집하고, 용의자를 심문하고, 범인을 찾아내세요.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-noir-gunmetal p-4 rounded-lg">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-bold text-detective-gold mb-1">증거 탐색</h3>
              <p className="text-sm text-text-muted">4개 장소를 탐색하여 증거를 수집하세요</p>
            </div>

            <div className="bg-noir-gunmetal p-4 rounded-lg">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-bold text-detective-gold mb-1">용의자 심문</h3>
              <p className="text-sm text-text-muted">3명의 용의자를 심문하고 진실을 밝히세요</p>
            </div>

            <div className="bg-noir-gunmetal p-4 rounded-lg">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-bold text-detective-gold mb-1">범인 특정</h3>
              <p className="text-sm text-text-muted">모든 증거를 종합하여 범인을 찾으세요</p>
            </div>
          </div>

          <Link
            href={`/cases/${todayCaseId}`}
            className="
              block w-full py-4 px-6
              bg-detective-gold hover:bg-detective-amber
              text-noir-deepBlack font-bold text-lg text-center
              rounded-lg transition-all
              transform hover:scale-105 active:scale-95
              shadow-lg hover:shadow-glow
            "
          >
            🔎 오늘의 사건 수사 시작하기
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-noir-charcoal border border-noir-fog rounded-lg p-6">
            <h3 className="font-display text-xl font-bold text-detective-gold mb-3">
              🎮 Fair Play 원칙
            </h3>
            <p className="text-sm text-text-secondary font-body">
              모든 증거는 발견 가능하며, 논리적 추리로 범인을 특정할 수 있습니다. 공정한 게임을 보장합니다.
            </p>
          </div>

          <div className="bg-noir-charcoal border border-noir-fog rounded-lg p-6">
            <h3 className="font-display text-xl font-bold text-detective-gold mb-3">
              🧠 AI 생성 사건
            </h3>
            <p className="text-sm text-text-secondary font-body">
              매일 새로운 살인 미스터리가 AI로 생성됩니다. 매번 다른 사건을 경험하세요.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-text-muted">
          <p>© 2025 Armchair Sleuths. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
