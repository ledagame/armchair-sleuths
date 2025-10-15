/**
 * CaseOverview.tsx
 *
 * Case overview display component - Enhanced production version
 * Shows victim, weapon, location, and mission details
 */

import { } from 'react';
import type { CaseData } from '../../types';

export interface CaseOverviewProps {
  caseData: CaseData;
  onStartInvestigation: () => void;
}

/**
 * Enhanced case overview component with better UX
 */
export function CaseOverview({ caseData, onStartInvestigation }: CaseOverviewProps) {
  return (
    <div className="case-overview space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-purple-900 p-6 rounded-lg">
        <h1 className="text-4xl font-bold mb-2">🕵️ 살인 사건 발생</h1>
        <p className="text-xl text-gray-300">{caseData.date}</p>
      </div>

      {/* Crime Scene Image */}
      {caseData.imageUrl && (
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={caseData.imageUrl}
            alt="Crime scene"
            className="w-full h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <p className="text-white text-lg font-bold">범행 현장</p>
            <p className="text-gray-300">{caseData.location.name}</p>
          </div>
        </div>
      )}

      {/* Case Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Victim Info */}
        <div className="bg-gray-900 p-6 rounded-lg border-2 border-red-900">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">👤</span>
            <h2 className="text-2xl font-bold">피해자</h2>
          </div>
          <p className="text-xl font-semibold text-red-400 mb-2">{caseData.victim.name}</p>
          <p className="text-sm text-gray-300 mb-2">{caseData.victim.background}</p>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <p className="text-xs text-gray-400">관계</p>
            <p className="text-sm text-gray-300">{caseData.victim.relationship}</p>
          </div>
        </div>

        {/* Weapon Info */}
        <div className="bg-gray-900 p-6 rounded-lg border-2 border-orange-900">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">🔪</span>
            <h2 className="text-2xl font-bold">발견된 무기</h2>
          </div>
          <p className="text-xl font-semibold text-orange-400 mb-2">{caseData.weapon.name}</p>
          <p className="text-sm text-gray-300">{caseData.weapon.description}</p>
        </div>

        {/* Location Info */}
        <div className="bg-gray-900 p-6 rounded-lg border-2 border-blue-900">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">📍</span>
            <h2 className="text-2xl font-bold">범행 장소</h2>
          </div>
          <p className="text-xl font-semibold text-blue-400 mb-2">{caseData.location.name}</p>
          <p className="text-sm text-gray-300 mb-2">{caseData.location.description}</p>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <p className="text-xs text-gray-400">분위기</p>
            <p className="text-sm text-gray-300">{caseData.location.atmosphere}</p>
          </div>
        </div>

        {/* Mission Info */}
        <div className="bg-gray-900 p-6 rounded-lg border-2 border-purple-900">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">🎯</span>
            <h2 className="text-2xl font-bold">당신의 임무</h2>
          </div>
          <div className="space-y-2 text-sm text-gray-300">
            <p>✓ {caseData.suspects.length}명의 용의자와 대화하세요</p>
            <p>✓ 증거를 수집하고 모순을 찾으세요</p>
            <p>✓ 5W1H 답변을 제출하세요</p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <p className="text-xs text-yellow-400">⚠️ 한 번만 제출할 수 있습니다</p>
          </div>
        </div>
      </div>

      {/* Suspects Preview */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">🔍 용의자 ({caseData.suspects.length}명)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {caseData.suspects.map((suspect) => (
            <div key={suspect.id} className="bg-gray-800 p-4 rounded-lg">
              <p className="font-bold text-lg mb-1">{suspect.name}</p>
              <p className="text-sm text-gray-400">{suspect.archetype}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Start Investigation Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onStartInvestigation}
          className="
            px-8 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
            rounded-lg font-bold text-xl transition-all
            transform hover:scale-105 active:scale-95
          "
        >
          🔍 수사 시작하기
        </button>
      </div>
    </div>
  );
}
