/**
 * page.tsx
 *
 * Case detail page with evidence discovery system
 * Next.js 15 App Router pattern with async params
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CaseClient from './CaseClient';

interface PageProps {
  params: Promise<{ caseId: string }>;
}

/**
 * Fetch case data from API
 */
async function getCaseData(caseId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/cases/${caseId}`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch case: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching case data:', error);
    return null;
  }
}

/**
 * Loading component
 */
function CaseLoading() {
  return (
    <div className="min-h-screen bg-noir-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-detective-gold mx-auto" />
        <p className="text-detective-gold font-bold text-xl">사건 정보를 불러오는 중...</p>
      </div>
    </div>
  );
}

/**
 * Case detail page
 */
export default async function Page({ params }: PageProps) {
  const { caseId } = await params;

  // Fetch case data
  const caseData = await getCaseData(caseId);

  // Handle not found
  if (!caseData) {
    notFound();
  }

  // Extract locations and evidence
  const locations = caseData.locations || [];
  const suspects = caseData.suspects || [];
  const victim = caseData.victim || {};
  const weapon = caseData.weapon || '';
  const locationName = caseData.location || '';

  return (
    <div className="min-h-screen bg-noir-black">
      {/* Header Section */}
      <header className="border-b border-detective-gold/30 bg-noir-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Case Title */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-detective-gold mb-2">
                🔍 사건 조사
              </h1>
              <p className="text-xl text-gray-400">
                사건 번호: <span className="text-white font-mono">{caseId}</span>
              </p>
            </div>

            {/* Case Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Victim Info */}
              <div className="bg-noir-black/50 border border-detective-gold/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">💀</span>
                  <h3 className="text-lg font-bold text-detective-gold">피해자</h3>
                </div>
                <p className="text-white font-bold text-xl">{victim.name || '알 수 없음'}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {victim.age ? `${victim.age}세` : ''} {victim.occupation || ''}
                </p>
              </div>

              {/* Location Info */}
              <div className="bg-noir-black/50 border border-detective-gold/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">📍</span>
                  <h3 className="text-lg font-bold text-detective-gold">범행 장소</h3>
                </div>
                <p className="text-white font-bold text-xl">{locationName || '알 수 없음'}</p>
              </div>

              {/* Weapon Info */}
              <div className="bg-noir-black/50 border border-detective-gold/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🔪</span>
                  <h3 className="text-lg font-bold text-detective-gold">범행 도구</h3>
                </div>
                <p className="text-white font-bold text-xl">{weapon || '알 수 없음'}</p>
              </div>
            </div>

            {/* Suspects Preview */}
            {suspects.length > 0 && (
              <div className="bg-noir-black/50 border border-detective-gold/20 rounded-lg p-4">
                <h3 className="text-lg font-bold text-detective-gold mb-3">
                  🎭 용의자 ({suspects.length}명)
                </h3>
                <div className="flex flex-wrap gap-3">
                  {suspects.map((suspect: { name: string; occupation: string }, index: number) => (
                    <div
                      key={index}
                      className="bg-noir-charcoal px-4 py-2 rounded-lg border border-gray-700"
                    >
                      <p className="text-white font-bold">{suspect.name}</p>
                      <p className="text-gray-400 text-xs">{suspect.occupation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<CaseLoading />}>
          <CaseClient caseId={caseId} locations={locations} />
        </Suspense>
      </main>
    </div>
  );
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: PageProps) {
  const { caseId } = await params;

  return {
    title: `사건 ${caseId} - Armchair Sleuths`,
    description: '증거를 수집하고 범인을 찾아내세요',
  };
}
