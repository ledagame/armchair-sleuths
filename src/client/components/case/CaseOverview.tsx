/**
 * CaseOverview.tsx
 *
 * 사건 개요 표시 컴포넌트 (MVP)
 */

import React from 'react';

export interface CaseOverviewProps {
  caseData: {
    id: string;
    date: string;
    victim: {
      name: string;
      background: string;
      relationship: string;
    };
    weapon: {
      name: string;
      description: string;
    };
    location: {
      name: string;
      description: string;
    };
    imageUrl?: string;
  };
}

export function CaseOverview({ caseData }: CaseOverviewProps) {
  return (
    <div className="case-overview p-6 bg-gray-900 text-white rounded-lg">
      <h1 className="text-3xl font-bold mb-4">🕵️ {caseData.date} 사건</h1>

      {caseData.imageUrl && (
        <img
          src={caseData.imageUrl}
          alt="Crime scene"
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">👤 피해자</h2>
          <p className="text-lg font-semibold">{caseData.victim.name}</p>
          <p className="text-sm text-gray-400 mt-2">{caseData.victim.background}</p>
          <p className="text-sm text-gray-400 mt-1">{caseData.victim.relationship}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">🔪 무기</h2>
          <p className="text-lg font-semibold">{caseData.weapon.name}</p>
          <p className="text-sm text-gray-400 mt-2">{caseData.weapon.description}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">📍 장소</h2>
          <p className="text-lg font-semibold">{caseData.location.name}</p>
          <p className="text-sm text-gray-400 mt-2">{caseData.location.description}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">🎯 임무</h2>
          <p className="text-sm">3명의 용의자와 대화하여 진범을 찾으세요</p>
          <p className="text-xs text-gray-400 mt-2">5W1H 답변을 제출하면 채점됩니다</p>
        </div>
      </div>
    </div>
  );
}
