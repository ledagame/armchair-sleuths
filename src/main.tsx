import { Devvit, useAsync } from '@devvit/public-api';
import { generateDailyCase } from './server/schedulers/DailyCaseScheduler.js';

Devvit.configure({
  redis: true,
  http: true,
  redditAPI: true,
});

// ============================================================================
// Type Definitions
// ============================================================================

type GameScreen = 'loading' | 'intro' | 'case-overview' | 'investigation' | 'submission' | 'results';
type InvestigationTab = 'locations' | 'suspects' | 'evidence';

interface Location {
  id: string;
  name: string;
  description: string;
  emoji: string;
  imageUrl?: string;
}

interface EvidenceItem {
  id: string;
  type: string;
  name: string;
  description: string;
  discoveryHint: string;
  relevance: string;
  discoveryDifficulty: string;
  foundAtLocationId: string;
  imageUrl?: string;
}

interface Suspect {
  id: string;
  name: string;
  archetype: string;
  background: string;
  hasProfileImage?: boolean;
}

interface CaseData {
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
    atmosphere: string;
  };
  suspects: Suspect[];
  imageUrl?: string;
  generatedAt: number;
  // Discovery system
  locations?: Location[];
  evidence?: EvidenceItem[];
  evidenceDistribution?: any;
  actionPoints?: {
    initial: number;
    maximum: number;
    costs: {
      quick: number;
      thorough: number;
      exhaustive: number;
    };
  };
}

// P2: Submission and Results Types
interface W4HAnswer {
  who: string;
  what: string;
  where: string;
  when: string;
  why: string;
  how: string;
}

interface W4HValidationDetail {
  score: number;
  isCorrect: boolean;
  feedback: string;
}

interface ScoringResult {
  isCorrect: boolean;
  totalScore: number;
  rank?: number;
  userId: string;
  breakdown: {
    who: W4HValidationDetail;
    what: W4HValidationDetail;
    where: W4HValidationDetail;
    when: W4HValidationDetail;
    why: W4HValidationDetail;
    how: W4HValidationDetail;
  };
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  score: number;
  submittedAt: string;
  isCorrect: boolean;
}

interface CaseStats {
  totalSubmissions: number;
  correctSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

// ============================================================================
// Scheduler Jobs
// ============================================================================

Devvit.addSchedulerJob({
  name: 'daily-case-generation',
  onRun: async (event, context) => {
    console.log('==========================================');
    console.log('🔄 [SCHEDULER] Daily case generation started');
    console.log('Time:', new Date().toISOString());
    console.log('Event data:', JSON.stringify(event.data));
    console.log('==========================================');

    try {
      const apiKey = await context.settings.get<string>('geminiApiKey');

      if (!apiKey) {
        console.error('❌ [SCHEDULER] Gemini API key not configured in settings');
        throw new Error('Gemini API key not configured');
      }

      console.log('✅ [SCHEDULER] API key retrieved from settings');
      console.log('🎯 [SCHEDULER] Starting case generation...');

      await generateDailyCase(apiKey);

      console.log('==========================================');
      console.log('✅ [SCHEDULER] Daily case generation completed successfully');
      console.log('==========================================');
    } catch (error) {
      console.error('==========================================');
      console.error('❌ [SCHEDULER] Daily case generation failed');
      console.error('Error:', error);
      console.error('==========================================');
      throw error;
    }
  }
});

// ============================================================================
// App Installation Trigger
// ============================================================================

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (event, context) => {
    console.log('==========================================');
    console.log('📦 [SCHEDULER] App Install - Setting up daily cron job');
    console.log('==========================================');

    try {
      // 매일 자정 UTC 실행
      const jobId = await context.scheduler.runJob({
        name: 'daily-case-generation',
        cron: '0 0 * * *',
        data: {
          source: 'auto-install',
          installedAt: new Date().toISOString()
        }
      });

      console.log(`✅ [SCHEDULER] Daily cron registered with ID: ${jobId}`);
      console.log('Schedule: Every day at midnight UTC (00:00)');

      // 테스트용 즉시 실행 (10초 후)
      const testId = await context.scheduler.runJob({
        name: 'daily-case-generation',
        runAt: new Date(Date.now() + 10000),
        data: {
          source: 'first-install-test',
          immediate: true
        }
      });

      console.log(`✅ [SCHEDULER] Test run scheduled with ID: ${testId}`);
      console.log('Test will run in 10 seconds...');
      console.log('==========================================');
    } catch (error) {
      console.error('==========================================');
      console.error('❌ [SCHEDULER] Setup failed');
      console.error('Error:', error);
      console.error('==========================================');
      // Don't throw - let app install continue even if scheduler fails
    }
  }
});

// ============================================================================
// Custom Post Type - Armchair Sleuths Game
// ============================================================================

Devvit.addCustomPostType({
  name: 'Armchair Sleuths',
  description: '살인 미스터리 추리 게임 - AI 용의자를 심문하고 사건을 해결하세요!',
  height: 'tall',
  render: (context) => {
    // ========================================================================
    // State Management
    // ========================================================================

    const [currentScreen, setCurrentScreen] = context.useState<GameScreen>('loading');
    const [caseData, setCaseData] = context.useState<CaseData | null>(null);
    const [caseLoading, setCaseLoading] = context.useState(true);
    const [caseError, setCaseError] = context.useState<string | null>(null);
    const [userId, setUserId] = context.useState<string>('');

    // Investigation screen state
    const [activeTab, setActiveTab] = context.useState<InvestigationTab>('locations');
    const [currentAP, setCurrentAP] = context.useState(3); // Initial AP from case config

    // Evidence discovery modal state
    const [showDiscoveryModal, setShowDiscoveryModal] = context.useState(false);
    const [discoveredEvidence, setDiscoveredEvidence] = context.useState<EvidenceItem[]>([]);
    const [discoveryLoading, setDiscoveryLoading] = context.useState(false);
    const [discoveredEvidenceIds, setDiscoveredEvidenceIds] = context.useState<Set<string>>(new Set());

    // Suspect interrogation state
    const [selectedSuspect, setSelectedSuspect] = context.useState<string | null>(null);
    const [chatMessage, setChatMessage] = context.useState('');
    const [chatHistory, setChatHistory] = context.useState<Array<{ role: 'user' | 'ai'; message: string; apGained?: number }>>([]);
    const [chatLoading, setChatLoading] = context.useState(false);

    // Evidence notebook state
    const [selectedEvidence, setSelectedEvidence] = context.useState<EvidenceItem | null>(null);
    const [showEvidenceDetail, setShowEvidenceDetail] = context.useState(false);

    // P2: Submission and Results State
    const [selectedSuspectId, setSelectedSuspectId] = context.useState<string | null>(null);
    const [w4hAnswers, setW4HAnswers] = context.useState<W4HAnswer>({
      who: '',
      what: '',
      where: '',
      when: '',
      why: '',
      how: '',
    });
    const [submitting, setSubmitting] = context.useState(false);
    const [submissionResult, setSubmissionResult] = context.useState<ScoringResult | null>(null);
    const [leaderboard, setLeaderboard] = context.useState<LeaderboardEntry[]>([]);
    const [stats, setStats] = context.useState<CaseStats | null>(null);
    const [resultsLoading, setResultsLoading] = context.useState(false);

    // ========================================================================
    // GAP-001: Suspect Profile Images Loading
    // Progressive image loading with useAsync hook
    // FIX: Use relative URLs instead of hardcoded localhost:3000
    // ========================================================================

    const { data: suspectImages, loading: suspectImagesLoading } = useAsync(
      async () => {
        // Don't fetch if no case data or no suspects
        if (!caseData?.suspects || caseData.suspects.length === 0) {
          return {};
        }

        console.log('[SuspectImages] Starting parallel image fetch...');

        // Filter suspects that need image loading
        const suspectsToFetch = caseData.suspects.filter(s => s.hasProfileImage === true);

        if (suspectsToFetch.length === 0) {
          console.log('[SuspectImages] No suspects with profile images');
          return {};
        }

        // Parallel fetch with Promise.allSettled (error resilient)
        // ✅ FIX: Use relative URL - Devvit runtime proxies to Express server
        const fetchPromises = suspectsToFetch.map(suspect =>
          fetch(`/api/suspect-image/${suspect.id}`)
            .then(res => {
              if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
              }
              return res.json();
            })
            .then(data => ({
              suspectId: suspect.id,
              imageUrl: data.profileImageUrl,
              success: true,
            }))
            .catch(err => ({
              suspectId: suspect.id,
              imageUrl: null,
              success: false,
              error: err.message,
            }))
        );

        const results = await Promise.allSettled(fetchPromises);

        // Build image map (MUST be valid JSON - no Map allowed in Devvit)
        const imageMap: Record<string, string> = {};

        results.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value.success && result.value.imageUrl) {
            imageMap[result.value.suspectId] = result.value.imageUrl;
          } else if (result.status === 'fulfilled' && !result.value.success) {
            console.error(`[SuspectImages] Failed to load image for ${result.value.suspectId}:`, result.value.error);
          }
        });

        console.log(`[SuspectImages] Loaded ${Object.keys(imageMap).length}/${suspectsToFetch.length} images`);

        return imageMap;
      },
      {
        depends: [caseData?.id], // Re-fetch when case changes
      }
    );

    // ========================================================================
    // Initialize User ID
    // ========================================================================

    context.useState(async () => {
      try {
        // Get Reddit username as user ID
        const user = await context.reddit.getCurrentUser();
        const username = user?.username || `anon_${Date.now()}`;
        setUserId(username);
        console.log(`[DEVVIT] User initialized: ${username}`);
      } catch (error) {
        console.error('[DEVVIT] Failed to get current user:', error);
        // Fallback to anonymous ID
        const anonId = `anon_${Date.now()}`;
        setUserId(anonId);
      }
    });

    // ========================================================================
    // Load Case Data from Redis
    // ========================================================================

    context.useState(async () => {
      try {
        setCaseLoading(true);
        setCaseError(null);

        // Get case ID from post data (set during post creation)
        const caseId = context.postData?.caseId as string | undefined;

        if (!caseId) {
          console.error('[DEVVIT] No caseId in postData:', context.postData);
          setCaseError('사건 데이터를 찾을 수 없습니다. 게시물 데이터가 누락되었습니다.');
          setCaseLoading(false);
          return;
        }

        // Load case data using the caseId from postData
        const caseKey = `case:${caseId}`;
        console.log(`[DEVVIT] Loading case from Redis key: ${caseKey}`);

        const caseDataRaw = await context.redis.get(caseKey);

        if (!caseDataRaw) {
          console.error(`[DEVVIT] Case not found in Redis with key: ${caseKey}`);
          setCaseError('사건 데이터를 찾을 수 없습니다. 케이스가 생성되지 않았을 수 있습니다.');
          setCaseLoading(false);
          return;
        }

        const parsedCase = JSON.parse(caseDataRaw) as CaseData;
        setCaseData(parsedCase);
        setCaseLoading(false);

        // Auto-navigate to case overview if case exists
        setCurrentScreen('case-overview');

        console.log(`[DEVVIT] Case loaded successfully: ${parsedCase.id}`);
      } catch (error) {
        console.error('[DEVVIT] Failed to load case:', error);
        setCaseError('사건을 불러오는 중 오류가 발생했습니다.');
        setCaseLoading(false);
      }
    });

    // ========================================================================
    // Navigation Handlers
    // ========================================================================

    const handleStartInvestigation = () => {
      setCurrentScreen('investigation');
      setActiveTab('locations'); // Reset to first tab
    };

    const handleGoToSubmission = () => {
      setCurrentScreen('submission');
    };

    const handleGenerateNewCase = async () => {
      try {
        setCaseLoading(true);
        setCaseError(null);
        setCurrentScreen('loading');

        // Trigger case generation via scheduler
        await context.scheduler.runJob({
          name: 'daily-case-generation',
          runAt: new Date(Date.now() + 1000), // Run in 1 second
          data: {
            source: 'manual-trigger',
            userId: userId,
            triggeredAt: new Date().toISOString()
          }
        });

        context.ui.showToast('🎲 새로운 사건 생성 중... (30-60초 소요)');

        // Poll for case data (check every 5 seconds for up to 2 minutes)
        let attempts = 0;
        const maxAttempts = 24; // 2 minutes / 5 seconds

        const pollInterval = setInterval(async () => {
          attempts++;

          const caseDataRaw = await context.redis.get('case:current');

          if (caseDataRaw) {
            clearInterval(pollInterval);
            const parsedCase = JSON.parse(caseDataRaw) as CaseData;
            setCaseData(parsedCase);
            setCaseLoading(false);
            setCurrentScreen('case-overview');
            context.ui.showToast('✅ 새로운 사건이 생성되었습니다!');
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setCaseError('사건 생성 시간이 초과되었습니다. 다시 시도해주세요.');
            setCaseLoading(false);
          }
        }, 5000);

      } catch (error) {
        console.error('[DEVVIT] Failed to generate case:', error);
        setCaseError('사건 생성 중 오류가 발생했습니다.');
        setCaseLoading(false);
      }
    };

    // ========================================================================
    // P2: Submission and Results Handlers
    // ========================================================================

    const handleSubmitAnswer = async () => {
      if (!caseData || !userId || !selectedSuspectId) {
        context.ui.showToast({ text: '용의자를 선택하고 5W1H를 모두 작성해주세요', appearance: 'neutral' });
        return;
      }

      // Validate all W4H fields are filled
      const allFieldsFilled = Object.values(w4hAnswers).every(val => val.trim() !== '');
      if (!allFieldsFilled) {
        context.ui.showToast({ text: '5W1H를 모두 작성해주세요', appearance: 'neutral' });
        return;
      }

      setSubmitting(true);
      try {
        // Submit answer to backend
        const response = await fetch(`/api/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            caseId: caseData.id,
            selectedSuspectId,
            w4hAnswers,
          }),
        });

        if (!response.ok) {
          throw new Error(`Submit failed: ${response.status}`);
        }

        const result = await response.json() as ScoringResult;
        setSubmissionResult(result);

        // Fetch leaderboard and stats in parallel
        setResultsLoading(true);
        const [leaderboardRes, statsRes] = await Promise.all([
          fetch(`/api/leaderboard/${caseData.id}?limit=10`),
          fetch(`/api/stats/${caseData.id}`),
        ]);

        if (leaderboardRes.ok) {
          const leaderboardData = await leaderboardRes.json();
          setLeaderboard(leaderboardData.entries || leaderboardData.leaderboard || []);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        setResultsLoading(false);
        setCurrentScreen('results');
        context.ui.showToast({ text: '답변이 제출되었습니다!', appearance: 'success' });
      } catch (error) {
        console.error('[DEVVIT] Submit error:', error);
        context.ui.showToast({ text: '제출 중 오류가 발생했습니다', appearance: 'neutral' });
        setSubmitting(false);
      }
    };

    const handlePlayAgain = () => {
      // Reset all P2 state
      setSelectedSuspectId(null);
      setW4HAnswers({ who: '', what: '', where: '', when: '', why: '', how: '' });
      setSubmissionResult(null);
      setLeaderboard([]);
      setStats(null);
      setSubmitting(false);
      setResultsLoading(false);

      // Reset P1 state
      setActiveTab('locations');
      setDiscoveredEvidence([]);
      setDiscoveredEvidenceIds(new Set());
      setSelectedSuspect(null);
      setChatHistory([]);
      setSelectedEvidence(null);

      // Go back to loading and generate new case
      setCurrentScreen('loading');
      handleGenerateNewCase();
    };

    // ========================================================================
    // Tab Content Rendering Functions
    // ========================================================================

    /**
     * Locations Tab - LocationExplorerSection
     * Evidence discovery system with 3-tier search
     */
    const renderLocationsTab = (): JSX.Element => {
      if (!caseData?.locations || caseData.locations.length === 0) {
        return (
          <vstack width="100%" padding="large" alignment="center middle">
            <text size="large" color="#808080">
              탐색 가능한 장소가 없습니다
            </text>
          </vstack>
        );
      }

      const locations = caseData.locations;
      const apCosts = caseData.actionPoints?.costs || { quick: 1, thorough: 2, exhaustive: 3 };

      return (
        <vstack width="100%" gap="medium" padding="medium">
          {/* Header */}
          <hstack width="100%" alignment="middle">
            <text size="xlarge" weight="bold" color="#c9b037" grow>
              🗺️ 범행 현장 탐색
            </text>
            <vstack
              backgroundColor="#2a2a2a"
              padding="small"
              cornerRadius="small"
              alignment="center middle"
            >
              <text size="small" color="#808080">
                보유 AP
              </text>
              <text size="xxlarge" weight="bold" color="#c9b037">
                {currentAP}
              </text>
            </vstack>
          </hstack>

          {/* Location Cards */}
          {locations.map((location) => (
            <vstack
              key={location.id}
              width="100%"
              backgroundColor="#1a1a1a"
              padding="medium"
              cornerRadius="medium"
              gap="small"
            >
              {/* Location Header */}
              <hstack width="100%" alignment="middle" gap="small">
                <text size="xxlarge">{location.emoji}</text>
                <vstack grow gap="none">
                  <text size="large" weight="bold" color="#e0e0e0">
                    {location.name}
                  </text>
                  <text size="small" color="#a0a0a0">
                    {location.description}
                  </text>
                </vstack>
              </hstack>

              {/* GAP-003: Location Image (if available) */}
              {location.imageUrl && (
                <image
                  url={location.imageUrl}
                  imageWidth={320}
                  imageHeight={180}
                  resizeMode="cover"
                  description={location.name}
                />
              )}

              <spacer size="small" />

              {/* Search Method Buttons */}
              <vstack width="100%" gap="small">
                <text size="small" weight="bold" color="#c9b037">
                  탐색 방법 선택
                </text>

                {/* Quick Search */}
                <button
                  onPress={async () => {
                    if (currentAP < apCosts.quick) {
                      context.ui.showToast({
                        text: `AP가 부족합니다 (필요: ${apCosts.quick}, 보유: ${currentAP})`,
                        appearance: 'neutral',
                      });
                      return;
                    }
                    await handleLocationSearch(location.id, 'quick');
                  }}
                  appearance="primary"
                  size="medium"
                >
                  ⚡ 빠른 탐색 (AP {apCosts.quick}) - 25% 확률
                </button>

                {/* Thorough Search */}
                <button
                  onPress={async () => {
                    if (currentAP < apCosts.thorough) {
                      context.ui.showToast({
                        text: `AP가 부족합니다 (필요: ${apCosts.thorough}, 보유: ${currentAP})`,
                        appearance: 'neutral',
                      });
                      return;
                    }
                    await handleLocationSearch(location.id, 'thorough');
                  }}
                  appearance="secondary"
                  size="medium"
                >
                  🔍 정밀 탐색 (AP {apCosts.thorough}) - 50% 확률
                </button>

                {/* Exhaustive Search */}
                <button
                  onPress={async () => {
                    if (currentAP < apCosts.exhaustive) {
                      context.ui.showToast({
                        text: `AP가 부족합니다 (필요: ${apCosts.exhaustive}, 보유: ${currentAP})`,
                        appearance: 'neutral',
                      });
                      return;
                    }
                    await handleLocationSearch(location.id, 'exhaustive');
                  }}
                  appearance="success"
                  size="medium"
                >
                  🔬 전수 탐색 (AP {apCosts.exhaustive}) - 75% 확률
                </button>
              </vstack>
            </vstack>
          ))}

          {/* Evidence Discovery Modal */}
          {showDiscoveryModal && renderEvidenceDiscoveryModal()}
        </vstack>
      );
    };

    /**
     * Handle Location Search
     * Makes API call to backend evidence discovery service
     * ✅ FIX: Use relative URL instead of hardcoded localhost:3000
     */
    const handleLocationSearch = async (locationId: string, searchType: 'quick' | 'thorough' | 'exhaustive') => {
      if (!caseData || !userId) {
        context.ui.showToast({ text: '오류: 사건 데이터를 찾을 수 없습니다', appearance: 'neutral' });
        return;
      }

      setDiscoveryLoading(true);

      try {
        // ✅ FIX: Use relative URL - Devvit runtime proxies to Express server
        const response = await fetch(`/api/location/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            caseId: caseData.id,
            userId: userId,
            locationId: locationId,
            searchType: searchType,
          }),
        });

        if (!response.ok) {
          throw new Error(`API call failed: ${response.status}`);
        }

        const result = await response.json() as {
          success: boolean;
          evidenceFound?: EvidenceItem[];
          message?: string;
          actionPointsRemaining?: number;
        };

        if (result.success && result.evidenceFound && result.evidenceFound.length > 0) {
          // Update discovered evidence
          setDiscoveredEvidence(result.evidenceFound);

          // Track discovered evidence IDs
          const newIds = new Set(discoveredEvidenceIds);
          result.evidenceFound.forEach(ev => newIds.add(ev.id));
          setDiscoveredEvidenceIds(newIds);

          // Update AP
          if (result.actionPointsRemaining !== undefined) {
            setCurrentAP(result.actionPointsRemaining);
          }

          // Show discovery modal
          setShowDiscoveryModal(true);
        } else {
          // No evidence found
          context.ui.showToast({
            text: result.message || '증거를 발견하지 못했습니다',
            appearance: 'neutral',
          });

          // Still deduct AP
          const apCost = caseData.actionPoints?.costs[searchType] || 1;
          setCurrentAP(Math.max(0, currentAP - apCost));
        }
      } catch (error) {
        console.error('[LocationSearch] Error:', error);
        context.ui.showToast({
          text: '탐색 중 오류가 발생했습니다',
          appearance: 'neutral',
        });
      } finally {
        setDiscoveryLoading(false);
      }
    };

    /**
     * Evidence Discovery Modal
     * Shows newly discovered evidence with rarity badge
     */
    const renderEvidenceDiscoveryModal = (): JSX.Element => {
      return (
        <zstack width="100%" height="100%" alignment="center middle">
          {/* Backdrop */}
          <vstack
            width="100%"
            height="100%"
            backgroundColor="rgba(0,0,0,0.85)"
            onPress={() => setShowDiscoveryModal(false)}
          />

          {/* Modal Content */}
          <vstack
            width="90%"
            backgroundColor="#1a1a1a"
            padding="large"
            cornerRadius="large"
            gap="medium"
            alignment="center middle"
          >
            {/* Header */}
            <text size="xxlarge" weight="bold" color="#c9b037">
              🎉 증거 발견!
            </text>

            <spacer size="small" />

            {/* Evidence Cards */}
            {discoveredEvidence.map((evidence) => (
              <vstack
                key={evidence.id}
                width="100%"
                backgroundColor="#2a2a2a"
                padding="medium"
                cornerRadius="medium"
                gap="small"
              >
                {/* Evidence Header with Rarity Badge */}
                <hstack width="100%" alignment="middle" gap="small">
                  <vstack grow gap="none">
                    <text size="large" weight="bold" color="#e0e0e0">
                      {evidence.name}
                    </text>
                    <text size="small" color="#808080">
                      {evidence.type}
                    </text>
                  </vstack>

                  {/* Rarity Badge */}
                  <vstack
                    backgroundColor={
                      evidence.discoveryDifficulty === 'hidden' ? '#c9b037' :
                      evidence.discoveryDifficulty === 'medium' ? '#4a9eff' :
                      '#808080'
                    }
                    padding="small"
                    cornerRadius="small"
                  >
                    <text size="xsmall" weight="bold" color="#0a0a0a">
                      {evidence.discoveryDifficulty === 'hidden' ? 'LEGENDARY' :
                       evidence.discoveryDifficulty === 'medium' ? 'RARE' :
                       'COMMON'}
                    </text>
                  </vstack>
                </hstack>

                {/* Evidence Description */}
                <text size="medium" color="#e0e0e0">
                  {evidence.description}
                </text>

                {/* Discovery Hint */}
                <text size="small" color="#a0a0a0" style="italic">
                  💡 {evidence.discoveryHint}
                </text>

                {/* GAP-003: Evidence Image (if available) */}
                {evidence.imageUrl && (
                  <image
                    url={evidence.imageUrl}
                    imageWidth={280}
                    imageHeight={200}
                    resizeMode="cover"
                    description={evidence.name}
                  />
                )}
              </vstack>
            ))}

            <spacer size="medium" />

            {/* Close Button */}
            <button
              onPress={() => setShowDiscoveryModal(false)}
              appearance="primary"
              size="large"
            >
              확인
            </button>
          </vstack>
        </zstack>
      );
    };

    /**
     * Suspects Tab - SuspectInterrogationSection
     * AI-powered chat interface with AP topic system
     */
    const renderSuspectsTab = (): JSX.Element => {
      if (!caseData?.suspects || caseData.suspects.length === 0) {
        return (
          <vstack width="100%" padding="large" alignment="center middle">
            <text size="large" color="#808080">
              심문할 용의자가 없습니다
            </text>
          </vstack>
        );
      }

      // If no suspect selected, show suspect list
      if (!selectedSuspect) {
        return renderSuspectList();
      }

      // If suspect selected, show chat interface
      return renderChatInterface();
    };

    /**
     * Suspect List View
     * Shows all suspects with selection buttons
     * GAP-001: Now displays profile images with loading states
     */
    const renderSuspectList = (): JSX.Element => {
      return (
        <vstack width="100%" gap="medium" padding="medium">
          {/* Header */}
          <hstack width="100%" alignment="middle">
            <text size="xlarge" weight="bold" color="#c9b037" grow>
              👤 용의자 심문
            </text>
            <vstack
              backgroundColor="#2a2a2a"
              padding="small"
              cornerRadius="small"
              alignment="center middle"
            >
              <text size="small" color="#808080">
                보유 AP
              </text>
              <text size="xxlarge" weight="bold" color="#c9b037">
                {currentAP}
              </text>
            </vstack>
          </hstack>

          {/* GAP-001: Loading State */}
          {suspectImagesLoading && (
            <vstack
              width="100%"
              backgroundColor="#1a1a1a"
              padding="medium"
              cornerRadius="medium"
              alignment="center middle"
            >
              <text size="small" color="#808080">
                용의자 프로필 이미지 로딩 중...
              </text>
            </vstack>
          )}

          {/* Suspect Cards */}
          {caseData!.suspects.map((suspect) => {
            // GAP-001: Get image URL from suspectImages map
            const imageUrl = suspectImages?.[suspect.id];
            const hasImage = imageUrl !== undefined && imageUrl !== null;

            return (
              <vstack
                key={suspect.id}
                width="100%"
                backgroundColor="#1a1a1a"
                padding="medium"
                cornerRadius="medium"
                gap="small"
              >
                {/* Suspect Header */}
                <hstack width="100%" alignment="middle" gap="small">
                  {/* GAP-001: Conditional Image Rendering */}
                  {hasImage ? (
                    <image
                      url={imageUrl}
                      imageHeight={96}
                      imageWidth={96}
                      description={`${suspect.name} profile`}
                      resizeMode="cover"
                    />
                  ) : suspectImagesLoading ? (
                    <vstack
                      width="96px"
                      height="96px"
                      backgroundColor="#2a2a2a"
                      alignment="center middle"
                      cornerRadius="small"
                    >
                      <text size="medium" color="#606060">
                        ...
                      </text>
                    </vstack>
                  ) : (
                    <vstack
                      width="96px"
                      height="96px"
                      backgroundColor="#2a2a2a"
                      alignment="center middle"
                      cornerRadius="small"
                    >
                      <text size="xxlarge">🔍</text>
                    </vstack>
                  )}

                  <vstack grow gap="none">
                    <text size="large" weight="bold" color="#e0e0e0">
                      {suspect.name}
                    </text>
                    <text size="small" color="#a0a0a0">
                      {suspect.archetype}
                    </text>
                  </vstack>
                </hstack>

                {/* Suspect Background */}
                <text size="medium" color="#e0e0e0">
                  {suspect.background}
                </text>

                <spacer size="small" />

                {/* Interrogate Button */}
                <button
                  onPress={() => {
                    setSelectedSuspect(suspect.id);
                    setChatHistory([]);
                    setChatMessage('');
                  }}
                  appearance="primary"
                  size="medium"
                >
                  💬 심문 시작
                </button>
              </vstack>
            );
          })}
        </vstack>
      );
    };

    /**
     * Chat Interface View
     * AI conversation with selected suspect
     */
    const renderChatInterface = (): JSX.Element => {
      const suspect = caseData?.suspects.find(s => s.id === selectedSuspect);
      if (!suspect) return <vstack />;

      // GAP-001: Get suspect profile image for chat header
      const imageUrl = suspectImages?.[suspect.id];
      const hasImage = imageUrl !== undefined && imageUrl !== null;

      return (
        <vstack width="100%" height="100%" gap="small">
          {/* Chat Header */}
          <hstack
            width="100%"
            backgroundColor="#1a1a1a"
            padding="medium"
            alignment="middle"
            gap="small"
          >
            <button
              onPress={() => setSelectedSuspect(null)}
              appearance="secondary"
              size="small"
            >
              ← 뒤로
            </button>

            {/* GAP-001: Profile Image in Chat Header */}
            {hasImage && (
              <image
                url={imageUrl}
                imageHeight={48}
                imageWidth={48}
                description={`${suspect.name} profile`}
                resizeMode="cover"
              />
            )}

            <vstack grow gap="none">
              <text size="large" weight="bold" color="#e0e0e0">
                {suspect.name}
              </text>
              <text size="small" color="#a0a0a0">
                {suspect.archetype}
              </text>
            </vstack>
            <vstack
              backgroundColor="#2a2a2a"
              padding="small"
              cornerRadius="small"
              alignment="center middle"
            >
              <text size="xsmall" color="#808080">
                AP
              </text>
              <text size="large" weight="bold" color="#c9b037">
                {currentAP}
              </text>
            </vstack>
          </hstack>

          {/* Chat Messages Area */}
          <vstack
            width="100%"
            grow
            backgroundColor="#0a0a0a"
            padding="medium"
            gap="small"
          >
            {chatHistory.length === 0 ? (
              <vstack width="100%" alignment="center middle" gap="medium" grow>
                <text size="medium" color="#808080" alignment="center">
                  질문을 입력하여 심문을 시작하세요
                </text>
                <text size="small" color="#606060" alignment="center">
                  💡 핵심 주제에 대해 질문하면 AP를 획득할 수 있습니다
                </text>
              </vstack>
            ) : (
              chatHistory.map((msg, idx) => (
                <vstack
                  key={idx}
                  width="100%"
                  backgroundColor={msg.role === 'user' ? '#2a2a2a' : '#1a4a1a'}
                  padding="medium"
                  cornerRadius="medium"
                  gap="small"
                  alignment={msg.role === 'user' ? 'end' : 'start'}
                >
                  <text size="small" color="#808080">
                    {msg.role === 'user' ? '당신' : suspect.name}
                  </text>
                  <text size="medium" color="#e0e0e0">
                    {msg.message}
                  </text>
                  {msg.apGained && msg.apGained > 0 && (
                    <hstack
                      backgroundColor="#c9b037"
                      padding="small"
                      cornerRadius="small"
                      gap="small"
                    >
                      <text size="small" weight="bold" color="#0a0a0a">
                        ⭐ +{msg.apGained} AP 획득!
                      </text>
                    </hstack>
                  )}
                </vstack>
              ))
            )}

            {chatLoading && (
              <vstack
                width="100%"
                backgroundColor="#1a4a1a"
                padding="medium"
                cornerRadius="medium"
              >
                <text size="medium" color="#e0e0e0">
                  {suspect.name}가 생각 중입니다...
                </text>
              </vstack>
            )}
          </vstack>

          {/* Message Input Area */}
          <vstack
            width="100%"
            backgroundColor="#1a1a1a"
            padding="medium"
            gap="small"
          >
            <button
              onPress={handleSendMessage}
              appearance="primary"
              size="large"
              disabled={chatLoading}
            >
              {chatLoading ? '전송 중...' : '💬 질문하기 (텍스트 입력 준비 중)'}
            </button>
            <text size="xsmall" color="#808080" alignment="center">
              실제 텍스트 입력은 Devvit 업데이트 필요
            </text>
          </vstack>
        </vstack>
      );
    };

    /**
     * Handle Send Chat Message
     * Makes API call to AI suspect interrogation service
     * ✅ FIX: Use relative URL instead of hardcoded localhost:3000
     */
    const handleSendMessage = async () => {
      if (!caseData || !userId || !selectedSuspect) {
        context.ui.showToast({ text: '오류: 데이터를 찾을 수 없습니다', appearance: 'neutral' });
        return;
      }

      // For demo purposes, use predefined question
      // TODO: Replace with actual text input when Devvit supports it
      const message = '사건 당일 어디에 있었습니까?';

      setChatLoading(true);

      try {
        // Add user message to chat history
        setChatHistory([...chatHistory, { role: 'user', message }]);

        // ✅ FIX: Use relative URL - Devvit runtime proxies to Express server
        const response = await fetch(`/api/chat/${selectedSuspect}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            message: message,
            caseId: caseData.id,
          }),
        });

        if (!response.ok) {
          throw new Error(`API call failed: ${response.status}`);
        }

        const result = await response.json() as {
          success: boolean;
          aiResponse: string;
          apAcquisition?: {
            amount: number;
            reason: string;
          };
          playerState: {
            currentAP: number;
          };
        };

        if (result.success) {
          // Add AI response to chat history
          setChatHistory([
            ...chatHistory,
            { role: 'user', message },
            {
              role: 'ai',
              message: result.aiResponse,
              apGained: result.apAcquisition?.amount || 0
            }
          ]);

          // Update AP
          setCurrentAP(result.playerState.currentAP);

          // Show AP acquisition notification if any
          if (result.apAcquisition && result.apAcquisition.amount > 0) {
            context.ui.showToast({
              text: `⭐ +${result.apAcquisition.amount} AP 획득! ${result.apAcquisition.reason}`,
              appearance: 'success',
            });
          }
        } else {
          context.ui.showToast({
            text: '응답 생성 실패',
            appearance: 'neutral',
          });
        }
      } catch (error) {
        console.error('[Chat] Error:', error);
        context.ui.showToast({
          text: '대화 중 오류가 발생했습니다',
          appearance: 'neutral',
        });
      } finally {
        setChatLoading(false);
      }
    };

    /**
     * Evidence Tab - EvidenceNotebookSection
     * Evidence collection management and analysis
     */
    const renderEvidenceTab = (): JSX.Element => {
      // Get discovered evidence from discoveredEvidenceIds
      const discoveredList = caseData?.evidence?.filter(ev =>
        discoveredEvidenceIds.has(ev.id)
      ) || [];

      // Count by rarity
      const rarityCount = {
        common: discoveredList.filter(ev => ev.discoveryDifficulty === 'obvious').length,
        rare: discoveredList.filter(ev => ev.discoveryDifficulty === 'medium').length,
        legendary: discoveredList.filter(ev => ev.discoveryDifficulty === 'hidden').length,
      };

      return (
        <vstack width="100%" gap="medium" padding="medium">
          {/* Header */}
          <hstack width="100%" alignment="middle">
            <text size="xlarge" weight="bold" color="#c9b037" grow>
              📋 증거 노트
            </text>
            <vstack
              backgroundColor="#2a2a2a"
              padding="small"
              cornerRadius="small"
              alignment="center middle"
            >
              <text size="small" color="#808080">
                수집한 증거
              </text>
              <text size="xxlarge" weight="bold" color="#c9b037">
                {discoveredList.length}
              </text>
            </vstack>
          </hstack>

          {/* Rarity Summary */}
          {discoveredList.length > 0 && (
            <hstack width="100%" gap="small">
              <vstack
                backgroundColor="#1a1a1a"
                padding="small"
                cornerRadius="small"
                grow
                alignment="center middle"
              >
                <text size="xsmall" color="#808080">
                  COMMON
                </text>
                <text size="medium" weight="bold" color="#808080">
                  {rarityCount.common}
                </text>
              </vstack>
              <vstack
                backgroundColor="#1a1a1a"
                padding="small"
                cornerRadius="small"
                grow
                alignment="center middle"
              >
                <text size="xsmall" color="#4a9eff">
                  RARE
                </text>
                <text size="medium" weight="bold" color="#4a9eff">
                  {rarityCount.rare}
                </text>
              </vstack>
              <vstack
                backgroundColor="#1a1a1a"
                padding="small"
                cornerRadius="small"
                grow
                alignment="center middle"
              >
                <text size="xsmall" color="#c9b037">
                  LEGENDARY
                </text>
                <text size="medium" weight="bold" color="#c9b037">
                  {rarityCount.legendary}
                </text>
              </vstack>
            </hstack>
          )}

          {/* Evidence Cards */}
          {discoveredList.length === 0 ? (
            <vstack
              width="100%"
              backgroundColor="#1a1a1a"
              padding="xlarge"
              cornerRadius="medium"
              gap="medium"
              alignment="center middle"
            >
              <text size="xxlarge">🔍</text>
              <text size="large" color="#808080" alignment="center">
                아직 수집한 증거가 없습니다
              </text>
              <text size="medium" color="#606060" alignment="center">
                현장을 탐색하여 증거를 발견하세요
              </text>
            </vstack>
          ) : (
            discoveredList.map((evidence) => (
              <vstack
                key={evidence.id}
                width="100%"
                backgroundColor="#1a1a1a"
                padding="medium"
                cornerRadius="medium"
                gap="small"
                onPress={() => {
                  setSelectedEvidence(evidence);
                  setShowEvidenceDetail(true);
                }}
              >
                {/* Evidence Header with Rarity */}
                <hstack width="100%" alignment="middle" gap="small">
                  <vstack grow gap="none">
                    <text size="large" weight="bold" color="#e0e0e0">
                      {evidence.name}
                    </text>
                    <text size="small" color="#808080">
                      {evidence.type}
                    </text>
                  </vstack>

                  {/* Rarity Badge */}
                  <vstack
                    backgroundColor={
                      evidence.discoveryDifficulty === 'hidden' ? '#c9b037' :
                      evidence.discoveryDifficulty === 'medium' ? '#4a9eff' :
                      '#808080'
                    }
                    padding="small"
                    cornerRadius="small"
                  >
                    <text size="xsmall" weight="bold" color="#0a0a0a">
                      {evidence.discoveryDifficulty === 'hidden' ? 'LEGENDARY' :
                       evidence.discoveryDifficulty === 'medium' ? 'RARE' :
                       'COMMON'}
                    </text>
                  </vstack>
                </hstack>

                {/* Evidence Preview */}
                <text size="medium" color="#e0e0e0">
                  {evidence.description.length > 100
                    ? `${evidence.description.substring(0, 100)}...`
                    : evidence.description}
                </text>

                {/* Relevance Indicator */}
                <hstack gap="small" alignment="middle">
                  <text size="small" color="#a0a0a0">
                    중요도:
                  </text>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <text
                      key={i}
                      size="small"
                      color={
                        i < (evidence.relevance === 'critical' ? 5 :
                             evidence.relevance === 'supporting' ? 3 :
                             evidence.relevance === 'misleading' ? 2 : 1)
                          ? '#c9b037'
                          : '#404040'
                      }
                    >
                      ⭐
                    </text>
                  ))}
                </hstack>

                {/* GAP-003: Evidence Image Preview (if available) */}
                {evidence.imageUrl && (
                  <image
                    url={evidence.imageUrl}
                    imageWidth={280}
                    imageHeight={160}
                    resizeMode="cover"
                    description={evidence.name}
                  />
                )}

                {/* View Details Button */}
                <button
                  onPress={() => {
                    setSelectedEvidence(evidence);
                    setShowEvidenceDetail(true);
                  }}
                  appearance="bordered"
                  size="small"
                >
                  상세 보기
                </button>
              </vstack>
            ))
          )}

          {/* Evidence Detail Modal */}
          {showEvidenceDetail && selectedEvidence && renderEvidenceDetailModal()}
        </vstack>
      );
    };

    /**
     * Evidence Detail Modal
     * Shows complete evidence information
     */
    const renderEvidenceDetailModal = (): JSX.Element => {
      if (!selectedEvidence) return <vstack />;

      return (
        <zstack width="100%" height="100%" alignment="center middle">
          {/* Backdrop */}
          <vstack
            width="100%"
            height="100%"
            backgroundColor="rgba(0,0,0,0.90)"
            onPress={() => setShowEvidenceDetail(false)}
          />

          {/* Modal Content */}
          <vstack
            width="90%"
            maxHeight="80%"
            backgroundColor="#1a1a1a"
            padding="large"
            cornerRadius="large"
            gap="medium"
          >
            {/* Header with Rarity Badge */}
            <hstack width="100%" alignment="middle" gap="small">
              <vstack grow gap="none">
                <text size="xlarge" weight="bold" color="#e0e0e0">
                  {selectedEvidence.name}
                </text>
                <text size="medium" color="#a0a0a0">
                  {selectedEvidence.type}
                </text>
              </vstack>

              {/* Rarity Badge */}
              <vstack
                backgroundColor={
                  selectedEvidence.discoveryDifficulty === 'hidden' ? '#c9b037' :
                  selectedEvidence.discoveryDifficulty === 'medium' ? '#4a9eff' :
                  '#808080'
                }
                padding="small"
                cornerRadius="small"
              >
                <text size="small" weight="bold" color="#0a0a0a">
                  {selectedEvidence.discoveryDifficulty === 'hidden' ? 'LEGENDARY' :
                   selectedEvidence.discoveryDifficulty === 'medium' ? 'RARE' :
                   'COMMON'}
                </text>
              </vstack>
            </hstack>

            {/* GAP-003: Evidence Image (if available) */}
            {selectedEvidence.imageUrl && (
              <image
                url={selectedEvidence.imageUrl}
                imageWidth={320}
                imageHeight={240}
                resizeMode="cover"
                description={selectedEvidence.name}
              />
            )}

            {/* Description */}
            <vstack
              width="100%"
              backgroundColor="#2a2a2a"
              padding="medium"
              cornerRadius="medium"
              gap="small"
            >
              <text size="small" weight="bold" color="#c9b037">
                설명
              </text>
              <text size="medium" color="#e0e0e0">
                {selectedEvidence.description}
              </text>
            </vstack>

            {/* Discovery Hint */}
            <vstack
              width="100%"
              backgroundColor="#2a2a2a"
              padding="medium"
              cornerRadius="medium"
              gap="small"
            >
              <text size="small" weight="bold" color="#c9b037">
                💡 발견 힌트
              </text>
              <text size="medium" color="#e0e0e0" style="italic">
                {selectedEvidence.discoveryHint}
              </text>
            </vstack>

            {/* Relevance */}
            <hstack width="100%" gap="small" alignment="middle">
              <text size="small" weight="bold" color="#c9b037">
                관련성:
              </text>
              <text size="medium" color="#e0e0e0">
                {selectedEvidence.relevance === 'critical' ? '결정적 증거' :
                 selectedEvidence.relevance === 'supporting' ? '보조 증거' :
                 selectedEvidence.relevance === 'misleading' ? '미혹 증거' :
                 '기타'}
              </text>
            </hstack>

            <spacer size="medium" />

            {/* Close Button */}
            <button
              onPress={() => setShowEvidenceDetail(false)}
              appearance="primary"
              size="large"
            >
              닫기
            </button>
          </vstack>
        </zstack>
      );
    };

    // ========================================================================
    // ENHANCED LOADING SCREEN
    // ========================================================================
    // Improvements from frontend-developer, ui-ux-designer, ui-designer agents:
    // - Multi-phase loading visualization with checkmarks
    // - Detective tips while waiting
    // - Better error handling with retry mechanism
    // - Visual depth with card layouts
    // - WCAG 2.1 AA compliant colors
    // ========================================================================

    if (currentScreen === 'loading') {
      return (
        <zstack
          width="100%"
          height="100%"
          alignment="center middle"
          backgroundColor="#0a0a0a"
        >
          <vstack
            width="100%"
            height="100%"
            alignment="center middle"
            padding="large"
          >
            {caseLoading && (
              <vstack
                width="100%"
                alignment="center middle"
                gap="large"
                padding="large"
              >
                {/* Animated Loading Header */}
                <vstack
                  alignment="center middle"
                  gap="medium"
                  backgroundColor="#1a1a1a"
                  padding="large"
                  cornerRadius="medium"
                  width="100%"
                >
                  {/* Primary Loading Icon */}
                  <text size="xxlarge" color="#c9b037">
                    🕵️
                  </text>

                  {/* Loading Title */}
                  <text
                    size="xxlarge"
                    weight="bold"
                    color="#c9b037"
                    alignment="center"
                  >
                    사건 파일 분석 중
                  </text>

                  {/* Loading Subtitle */}
                  <text
                    size="medium"
                    color="#a0a0a0"
                    alignment="center"
                  >
                    오늘의 미스터리를 준비하고 있습니다
                  </text>

                  {/* Loading Phases */}
                  <vstack
                    width="100%"
                    gap="small"
                    backgroundColor="#0a0a0a"
                    padding="medium"
                    cornerRadius="small"
                  >
                    <hstack width="100%" gap="small" alignment="middle">
                      <text size="small" color="#c9b037">✓</text>
                      <text size="small" color="#808080">
                        피해자 신원 확인
                      </text>
                    </hstack>

                    <hstack width="100%" gap="small" alignment="middle">
                      <text size="small" color="#c9b037">◉</text>
                      <text size="small" color="#c9b037">
                        용의자 프로필 생성
                      </text>
                    </hstack>

                    <hstack width="100%" gap="small" alignment="middle">
                      <text size="small" color="#404040">○</text>
                      <text size="small" color="#404040">
                        증거 배치 완료
                      </text>
                    </hstack>
                  </vstack>

                  {/* Estimated time */}
                  <text size="small" color="#606060" alignment="center">
                    예상 소요 시간: 30-60초
                  </text>
                </vstack>

                {/* Detective Tip */}
                <vstack
                  width="100%"
                  backgroundColor="#1a1a1a"
                  padding="medium"
                  cornerRadius="small"
                  gap="small"
                >
                  <hstack width="100%" gap="small" alignment="middle">
                    <text size="medium" color="#c9b037">💡</text>
                    <text size="small" weight="bold" color="#c9b037">
                      탐정 팁
                    </text>
                  </hstack>
                  <text size="small" color="#a0a0a0">
                    용의자와의 대화에서 모순된 진술을 찾아보세요.
                    같은 사건에 대해 다른 이야기를 하는 사람이 있다면 의심해볼 가치가 있습니다.
                  </text>
                </vstack>
              </vstack>
            )}

            {caseError && (
              <vstack
                width="100%"
                alignment="center middle"
                gap="large"
                padding="large"
              >
                {/* Error Header */}
                <vstack
                  alignment="center middle"
                  gap="medium"
                  backgroundColor="#2a1a1a"
                  padding="large"
                  cornerRadius="medium"
                  width="100%"
                >
                  {/* Error Icon */}
                  <text size="xxlarge" color="#dc3545">
                    ⚠️
                  </text>

                  {/* Error Title */}
                  <text
                    size="xlarge"
                    weight="bold"
                    color="#dc3545"
                    alignment="center"
                  >
                    사건 파일을 열 수 없습니다
                  </text>

                  {/* Error Details */}
                  <vstack
                    width="100%"
                    backgroundColor="#1a1a1a"
                    padding="medium"
                    cornerRadius="small"
                    gap="small"
                  >
                    <text size="small" weight="bold" color="#808080">
                      오류 상세:
                    </text>
                    <text size="small" color="#a0a0a0" alignment="center">
                      {caseError}
                    </text>
                  </vstack>

                  {/* Helpful suggestions */}
                  <vstack width="100%" gap="small">
                    <text size="small" color="#808080" alignment="center">
                      다음을 시도해보세요:
                    </text>
                    <text size="xsmall" color="#606060" alignment="center">
                      • 새로운 사건을 생성하세요
                    </text>
                    <text size="xsmall" color="#606060" alignment="center">
                      • 네트워크 연결을 확인하세요
                    </text>
                    <text size="xsmall" color="#606060" alignment="center">
                      • 잠시 후 다시 시도하세요
                    </text>
                  </vstack>
                </vstack>

                {/* Action Buttons */}
                <vstack width="100%" gap="medium">
                  <button
                    appearance="primary"
                    size="large"
                    onPress={handleGenerateNewCase}
                  >
                    🎲 새 케이스 생성
                  </button>
                </vstack>
              </vstack>
            )}
          </vstack>
        </zstack>
      );
    }

    // ========================================================================
    // Render Case Overview Screen
    // ========================================================================

    // ========================================================================
    // ENHANCED CASE OVERVIEW SCREEN
    // ========================================================================
    // Improvements from frontend-developer, ui-ux-designer, ui-designer agents:
    // - Sticky header with case metadata
    // - Card-based layout with better visual hierarchy
    // - Side-by-side weapon/location (saves vertical space)
    // - Numbered suspect badges with status
    // - Mission objectives list
    // - Fixed bottom CTA
    // - 56px touch targets, improved spacing
    // - WCAG 2.1 AA compliant colors
    // ========================================================================

    if (currentScreen === 'case-overview' && caseData) {
      return (
        <vstack
          width="100%"
          height="100%"
          backgroundColor="#0a0a0a"
        >
          {/* Sticky Header */}
          <vstack
            width="100%"
            backgroundColor="#1a1a1a"
            padding="medium"
            gap="small"
          >
            {/* Case Badge */}
            <hstack
              width="100%"
              alignment="middle"
              gap="small"
            >
              <text size="large" color="#c9b037">
                🕵️
              </text>
              <vstack grow gap="none">
                <text size="large" weight="bold" color="#c9b037">
                  새로운 사건 발생
                </text>
                <text size="small" color="#808080">
                  {caseData.date}
                </text>
              </vstack>
              <vstack alignment="end" gap="none">
                <text size="xsmall" weight="bold" color="#c9b037">
                  사건번호
                </text>
                <text size="xsmall" color="#808080">
                  {caseData.id.substring(0, 8)}
                </text>
              </vstack>
            </hstack>
          </vstack>

          {/* Scrollable Content */}
          <vstack
            width="100%"
            grow
            gap="medium"
            padding="medium"
          >
            {/* Crime Scene Image (if available) */}
            {caseData.imageUrl && (
              <vstack
                width="100%"
                backgroundColor="#1a1a1a"
                cornerRadius="medium"
                gap="none"
              >
                <image
                  url={caseData.imageUrl}
                  imageHeight={200}
                  imageWidth={375}
                  description="범죄 현장 사진"
                  resizeMode="cover"
                />
                <hstack
                  width="100%"
                  backgroundColor="rgba(0,0,0,0.8)"
                  padding="small"
                  gap="small"
                  alignment="middle"
                >
                  <text size="xsmall" color="#c9b037">📷</text>
                  <text size="xsmall" color="#a0a0a0">
                    범죄 현장 사진
                  </text>
                </hstack>
              </vstack>
            )}

            {/* Critical Information Card */}
            <vstack
              width="100%"
              backgroundColor="#1a1a1a"
              cornerRadius="medium"
              gap="medium"
              padding="medium"
            >
              {/* Section Header */}
              <hstack width="100%" alignment="middle" gap="small">
                <text size="medium" weight="bold" color="#c9b037">
                  ⚠️ 긴급 브리핑
                </text>
              </hstack>

              {/* Victim Info - Most Important */}
              <vstack
                width="100%"
                backgroundColor="#2a1a1a"
                padding="medium"
                cornerRadius="small"
                gap="small"
              >
                <hstack width="100%" alignment="middle" gap="small">
                  <text size="medium" color="#dc3545">👤</text>
                  <text size="small" weight="bold" color="#808080">
                    피해자
                  </text>
                </hstack>
                <text size="large" weight="bold" color="#ffffff">
                  {caseData.victim.name}
                </text>
                <text size="small" color="#cccccc">
                  {caseData.victim.background}
                </text>
                {caseData.victim.relationship && (
                  <hstack
                    backgroundColor="#0a0a0a"
                    padding="small"
                    cornerRadius="small"
                    gap="small"
                  >
                    <text size="xsmall" color="#808080">
                      관계:
                    </text>
                    <text size="xsmall" color="#a0a0a0">
                      {caseData.victim.relationship}
                    </text>
                  </hstack>
                )}
              </vstack>

              {/* Weapon & Location Side by Side */}
              <hstack width="100%" gap="small">
                {/* Weapon */}
                <vstack
                  grow
                  backgroundColor="#2a1a1a"
                  padding="medium"
                  cornerRadius="small"
                  gap="small"
                >
                  <hstack width="100%" alignment="middle" gap="small">
                    <text size="medium" color="#ffc107">🔪</text>
                    <text size="xsmall" weight="bold" color="#808080">
                      발견된 무기
                    </text>
                  </hstack>
                  <text size="medium" weight="bold" color="#ffc107">
                    {caseData.weapon.name}
                  </text>
                  <text size="xsmall" color="#a0a0a0">
                    {caseData.weapon.description}
                  </text>
                </vstack>

                {/* Location */}
                <vstack
                  grow
                  backgroundColor="#2a1a1a"
                  padding="medium"
                  cornerRadius="small"
                  gap="small"
                >
                  <hstack width="100%" alignment="middle" gap="small">
                    <text size="medium" color="#4a9eff">📍</text>
                    <text size="xsmall" weight="bold" color="#808080">
                      범행 장소
                    </text>
                  </hstack>
                  <text size="medium" weight="bold" color="#4a9eff">
                    {caseData.location.name}
                  </text>
                  <text size="xsmall" color="#a0a0a0">
                    {caseData.location.description}
                  </text>
                </vstack>
              </hstack>
            </vstack>

            {/* Suspects Card */}
            <vstack
              width="100%"
              backgroundColor="#1a1a1a"
              cornerRadius="medium"
              gap="medium"
              padding="medium"
            >
              {/* Section Header */}
              <hstack width="100%" alignment="middle" gap="small">
                <text size="medium" weight="bold" color="#c9b037">
                  🔍 용의자 명단
                </text>
                <hstack
                  backgroundColor="#c9b037"
                  padding="small"
                  cornerRadius="small"
                >
                  <text size="xsmall" weight="bold" color="#0a0a0a">
                    {caseData.suspects.length}명
                  </text>
                </hstack>
              </hstack>

              {/* Suspects List */}
              <vstack width="100%" gap="small">
                {caseData.suspects.map((suspect, index) => (
                  <hstack
                    key={suspect.id}
                    width="100%"
                    backgroundColor="#2a2a2a"
                    padding="medium"
                    cornerRadius="small"
                    gap="medium"
                    alignment="middle"
                  >
                    {/* Suspect Number Badge */}
                    <vstack
                      alignment="center middle"
                      backgroundColor="#c9b037"
                      padding="small"
                      cornerRadius="small"
                      width="32px"
                      height="32px"
                    >
                      <text size="small" weight="bold" color="#0a0a0a">
                        {index + 1}
                      </text>
                    </vstack>

                    {/* Suspect Info */}
                    <vstack grow gap="none">
                      <text size="medium" weight="bold" color="#ffffff">
                        {suspect.name}
                      </text>
                      <text size="small" color="#808080">
                        {suspect.archetype}
                      </text>
                    </vstack>

                    {/* Status Indicator */}
                    <vstack alignment="center middle">
                      <text size="small" color="#606060">
                        미심문
                      </text>
                    </vstack>
                  </hstack>
                ))}
              </vstack>

              {/* Suspects hint */}
              <hstack
                width="100%"
                backgroundColor="#2a1a1a"
                padding="small"
                cornerRadius="small"
                gap="small"
                alignment="middle"
              >
                <text size="small" color="#c9b037">💡</text>
                <text size="xsmall" color="#808080">
                  각 용의자를 심문하여 알리바이와 동기를 파악하세요
                </text>
              </hstack>
            </vstack>

            {/* Mission Brief Card */}
            <vstack
              width="100%"
              backgroundColor="#1a1a1a"
              cornerRadius="medium"
              gap="medium"
              padding="medium"
            >
              {/* Section Header */}
              <hstack width="100%" alignment="middle" gap="small">
                <text size="medium" weight="bold" color="#c9b037">
                  🎯 수사 목표
                </text>
              </hstack>

              {/* Objectives List */}
              <vstack width="100%" gap="small">
                <hstack
                  width="100%"
                  gap="small"
                  alignment="middle"
                  padding="small"
                  backgroundColor="#2a1a1a"
                  cornerRadius="small"
                >
                  <text size="medium" color="#28a745">1</text>
                  <text size="small" color="#cccccc">
                    {caseData.suspects.length}명의 용의자 심문
                  </text>
                </hstack>

                <hstack
                  width="100%"
                  gap="small"
                  alignment="middle"
                  padding="small"
                  backgroundColor="#2a1a1a"
                  cornerRadius="small"
                >
                  <text size="medium" color="#28a745">2</text>
                  <text size="small" color="#cccccc">
                    증거 수집 및 분석
                  </text>
                </hstack>

                <hstack
                  width="100%"
                  gap="small"
                  alignment="middle"
                  padding="small"
                  backgroundColor="#2a1a1a"
                  cornerRadius="small"
                >
                  <text size="medium" color="#28a745">3</text>
                  <text size="small" color="#cccccc">
                    5W1H 답변 제출 (1회 제한)
                  </text>
                </hstack>
              </vstack>

              {/* Warning */}
              <hstack
                width="100%"
                backgroundColor="#2a1a1a"
                padding="medium"
                cornerRadius="small"
                gap="small"
                alignment="middle"
              >
                <text size="medium" color="#ffc107">⚠️</text>
                <vstack grow gap="none">
                  <text size="small" weight="bold" color="#ffc107">
                    중요 안내
                  </text>
                  <text size="xsmall" color="#a0a0a0">
                    답변은 단 한 번만 제출할 수 있습니다. 충분한 증거를 수집한 후 제출하세요.
                  </text>
                </vstack>
              </hstack>
            </vstack>

            {/* Action Points Info (if available) */}
            {caseData.actionPoints && (
              <vstack
                width="100%"
                backgroundColor="#1a1a1a"
                cornerRadius="medium"
                gap="small"
                padding="medium"
              >
                <hstack width="100%" alignment="middle" gap="small">
                  <text size="medium" weight="bold" color="#c9b037">
                    ⭐ 액션 포인트 시스템
                  </text>
                </hstack>
                <hstack
                  width="100%"
                  backgroundColor="#2a1a1a"
                  padding="medium"
                  cornerRadius="small"
                  gap="small"
                  alignment="middle"
                >
                  <text size="xlarge" color="#c9b037">
                    {caseData.actionPoints.initial}
                  </text>
                  <vstack grow gap="none">
                    <text size="small" weight="bold" color="#ffffff">
                      시작 AP
                    </text>
                    <text size="xsmall" color="#808080">
                      증거 탐색에 사용
                    </text>
                  </vstack>
                </hstack>
                <text size="xsmall" color="#606060" alignment="center">
                  용의자 심문으로 추가 AP 획득 가능
                </text>
              </vstack>
            )}
          </vstack>

          {/* Fixed Bottom CTA */}
          <vstack
            width="100%"
            backgroundColor="#1a1a1a"
            padding="medium"
            gap="small"
          >
            <button
              appearance="primary"
              size="large"
              onPress={handleStartInvestigation}
            >
              🔍 수사 시작하기
            </button>
            <text size="xsmall" color="#606060" alignment="center">
              준비가 되면 수사를 시작하세요
            </text>
          </vstack>
        </vstack>
      );
    }

    // ========================================================================
    // Render Investigation Screen
    // ========================================================================

    /**
     * InvestigationScreen - P1 Implementation
     *
     * Architecture:
     * - Tab-based navigation (Locations, Suspects, Evidence)
     * - Bottom-positioned tabs for mobile thumb-zone optimization
     * - AP (Action Points) display in header
     * - Scrollable content area
     * - Mobile-first responsive design (375px+ viewports)
     *
     * Tab Navigation Logic:
     * - activeTab state controls which content is rendered
     * - Button appearance changes based on activeTab (primary/secondary)
     * - Each tab has 56px min-height for touch-friendly interaction
     * - Noir detective color scheme: gold (#c9b037) for active, gray for inactive
     *
     * Sub-components (Placeholders for P1 sub-tasks):
     * - renderLocationsTab() → Full implementation in LocationExplorerSection
     * - renderSuspectsTab() → Full implementation in SuspectInterrogationSection
     * - renderEvidenceTab() → Full implementation in EvidenceNotebookSection
     */
    if (currentScreen === 'investigation' && caseData) {
      return (
        <vstack
          width="100%"
          height="100%"
          backgroundColor="#0a0a0a"
          gap="none"
        >
          {/* ================================================================
              Header Section - AP Display & Case Title
              ================================================================ */}
          <vstack
            width="100%"
            backgroundColor="#1a1a1a"
            padding="medium"
            gap="small"
          >
            {/* Title & AP Counter */}
            <hstack
              width="100%"
              alignment="space-between middle"
            >
              <text size="xlarge" weight="bold" color="#c9b037">
                🔍 수사 진행 중
              </text>
              <hstack gap="small" alignment="middle">
                <text size="large" weight="bold" color="#c9b037">
                  ⚡ {currentAP}
                </text>
                <text size="medium" color="#808080">
                  / 12 AP
                </text>
              </hstack>
            </hstack>

            {/* Case Info Summary */}
            <text size="small" color="#a0a0a0">
              {caseData.victim.name} 살인 사건 • {caseData.location.name}
            </text>
          </vstack>

          {/* ================================================================
              Tab Content Area - Scrollable Main Content
              ================================================================ */}
          <vstack
            grow
            width="100%"
            backgroundColor="#0a0a0a"
          >
            {/* Conditionally render tab content based on activeTab state */}
            {activeTab === 'locations' && renderLocationsTab()}
            {activeTab === 'suspects' && renderSuspectsTab()}
            {activeTab === 'evidence' && renderEvidenceTab()}
          </vstack>

          {/* ================================================================
              Bottom Tab Navigation - Thumb-Zone Optimized
              Mobile UX: Bottom positioning for easy one-handed operation
              Touch Targets: 56px height meets accessibility guidelines
              ================================================================ */}
          <hstack
            width="100%"
            backgroundColor="#1a1a1a"
            padding="small"
            gap="small"
            alignment="center middle"
          >
            {/* Locations Tab Button */}
            <button
              onPress={() => setActiveTab('locations')}
              appearance={activeTab === 'locations' ? 'primary' : 'secondary'}
              grow
              minHeight="56px"
            >
              <hstack gap="small" alignment="center middle">
                <text size="medium">🗺️</text>
                <text size="small" weight="bold">
                  현장
                </text>
              </hstack>
            </button>

            {/* Suspects Tab Button */}
            <button
              onPress={() => setActiveTab('suspects')}
              appearance={activeTab === 'suspects' ? 'primary' : 'secondary'}
              grow
              minHeight="56px"
            >
              <hstack gap="small" alignment="center middle">
                <text size="medium">👤</text>
                <text size="small" weight="bold">
                  용의자
                </text>
              </hstack>
            </button>

            {/* Evidence Tab Button */}
            <button
              onPress={() => setActiveTab('evidence')}
              appearance={activeTab === 'evidence' ? 'primary' : 'secondary'}
              grow
              minHeight="56px"
            >
              <hstack gap="small" alignment="center middle">
                <text size="medium">📋</text>
                <text size="small" weight="bold">
                  증거
                </text>
              </hstack>
            </button>
          </hstack>

          {/* ================================================================
              Quick Action Bar - Submit Solution & Back Navigation
              ================================================================ */}
          <vstack
            width="100%"
            backgroundColor="#0a0a0a"
            padding="medium"
            gap="small"
          >
            <button
              appearance="success"
              size="large"
              onPress={handleGoToSubmission}
            >
              <text size="medium" weight="bold">
                🎯 해결안 제출하기
              </text>
            </button>

            <button
              appearance="secondary"
              size="small"
              onPress={() => setCurrentScreen('case-overview')}
            >
              <text size="small">
                ← 케이스 개요로 돌아가기
              </text>
            </button>
          </vstack>
        </vstack>
      );
    }

    // ========================================================================
    // P2: Submission Screen - Suspect Selection + 5W1H Form
    // ========================================================================

    if (currentScreen === 'submission' && caseData) {
      return (
        <vstack
          width="100%"
          height="100%"
          backgroundColor="#0a0a0a"
          gap="medium"
          padding="medium"
        >
          {/* Header */}
          <vstack width="100%" gap="small" backgroundColor="#1a1a1a" padding="medium" cornerRadius="small">
            <text size="xxlarge" weight="bold" color="#c9b037">
              🎯 추리 제출
            </text>
            <text size="medium" color="#808080">
              사건의 진실을 밝혀보세요. 범인과 사건의 5W1H를 제출하세요.
            </text>
          </vstack>

          {/* Suspect Selection */}
          <vstack width="100%" gap="small" backgroundColor="#1a1a1a" padding="medium" cornerRadius="small">
            <text size="large" weight="bold" color="#c9b037">
              👤 범인 선택
            </text>
            <text size="small" color="#808080">
              누가 범인이라고 생각하시나요?
            </text>
            <vstack width="100%" gap="small">
              {caseData.suspects.map((suspect) => (
                <button
                  key={suspect.id}
                  appearance={selectedSuspectId === suspect.id ? 'primary' : 'secondary'}
                  size="medium"
                  onPress={() => setSelectedSuspectId(suspect.id)}
                >
                  <hstack width="100%" alignment="middle" gap="small">
                    <text size="medium" weight={selectedSuspectId === suspect.id ? 'bold' : 'regular'}>
                      {selectedSuspectId === suspect.id ? '✓ ' : ''}
                      {suspect.name}
                    </text>
                    <text size="small" color="#808080" grow>
                      ({suspect.archetype})
                    </text>
                  </hstack>
                </button>
              ))}
            </vstack>
          </vstack>

          {/* 5W1H Form - Using context.ui.showForm for text input */}
          <vstack width="100%" gap="small" backgroundColor="#1a1a1a" padding="medium" cornerRadius="small">
            <text size="large" weight="bold" color="#c9b037">
              📝 5W1H 작성
            </text>
            <text size="small" color="#808080">
              사건의 전모를 상세히 설명해주세요
            </text>

            {/* WHO */}
            <vstack width="100%" gap="small">
              <text size="medium" weight="bold" color="#e8e8e8">
                ❓ WHO (누가)
              </text>
              <button
                appearance="secondary"
                size="small"
                onPress={async () => {
                  context.ui.showForm(
                    {
                      title: 'WHO (누가)',
                      fields: [
                        {
                          name: 'who',
                          label: '범인이 누구인지 설명하세요',
                          type: 'paragraph',
                          defaultValue: w4hAnswers.who,
                          required: true,
                        },
                      ],
                      acceptLabel: '저장',
                      cancelLabel: '취소',
                    },
                    (values) => {
                      if (values.who) {
                        setW4HAnswers({ ...w4hAnswers, who: values.who as string });
                      }
                    }
                  );
                }}
              >
                <text size="small">
                  {w4hAnswers.who ? `✓ 작성 완료: ${w4hAnswers.who.substring(0, 30)}...` : '작성하기'}
                </text>
              </button>
            </vstack>

            {/* WHAT */}
            <vstack width="100%" gap="small">
              <text size="medium" weight="bold" color="#e8e8e8">
                ❓ WHAT (무엇을)
              </text>
              <button
                appearance="secondary"
                size="small"
                onPress={async () => {
                  context.ui.showForm(
                    {
                      title: 'WHAT (무엇을)',
                      fields: [
                        {
                          name: 'what',
                          label: '무엇이 사용되었는지 설명하세요',
                          type: 'paragraph',
                          defaultValue: w4hAnswers.what,
                          required: true,
                        },
                      ],
                      acceptLabel: '저장',
                      cancelLabel: '취소',
                    },
                    (values) => {
                      if (values.what) {
                        setW4HAnswers({ ...w4hAnswers, what: values.what as string });
                      }
                    }
                  );
                }}
              >
                <text size="small">
                  {w4hAnswers.what ? `✓ 작성 완료: ${w4hAnswers.what.substring(0, 30)}...` : '작성하기'}
                </text>
              </button>
            </vstack>

            {/* WHERE */}
            <vstack width="100%" gap="small">
              <text size="medium" weight="bold" color="#e8e8e8">
                ❓ WHERE (어디서)
              </text>
              <button
                appearance="secondary"
                size="small"
                onPress={async () => {
                  context.ui.showForm(
                    {
                      title: 'WHERE (어디서)',
                      fields: [
                        {
                          name: 'where',
                          label: '어디서 일어났는지 설명하세요',
                          type: 'paragraph',
                          defaultValue: w4hAnswers.where,
                          required: true,
                        },
                      ],
                      acceptLabel: '저장',
                      cancelLabel: '취소',
                    },
                    (values) => {
                      if (values.where) {
                        setW4HAnswers({ ...w4hAnswers, where: values.where as string });
                      }
                    }
                  );
                }}
              >
                <text size="small">
                  {w4hAnswers.where ? `✓ 작성 완료: ${w4hAnswers.where.substring(0, 30)}...` : '작성하기'}
                </text>
              </button>
            </vstack>

            {/* WHEN */}
            <vstack width="100%" gap="small">
              <text size="medium" weight="bold" color="#e8e8e8">
                ❓ WHEN (언제)
              </text>
              <button
                appearance="secondary"
                size="small"
                onPress={async () => {
                  context.ui.showForm(
                    {
                      title: 'WHEN (언제)',
                      fields: [
                        {
                          name: 'when',
                          label: '언제 일어났는지 설명하세요',
                          type: 'paragraph',
                          defaultValue: w4hAnswers.when,
                          required: true,
                        },
                      ],
                      acceptLabel: '저장',
                      cancelLabel: '취소',
                    },
                    (values) => {
                      if (values.when) {
                        setW4HAnswers({ ...w4hAnswers, when: values.when as string });
                      }
                    }
                  );
                }}
              >
                <text size="small">
                  {w4hAnswers.when ? `✓ 작성 완료: ${w4hAnswers.when.substring(0, 30)}...` : '작성하기'}
                </text>
              </button>
            </vstack>

            {/* WHY */}
            <vstack width="100%" gap="small">
              <text size="medium" weight="bold" color="#e8e8e8">
                ❓ WHY (왜)
              </text>
              <button
                appearance="secondary"
                size="small"
                onPress={async () => {
                  context.ui.showForm(
                    {
                      title: 'WHY (왜)',
                      fields: [
                        {
                          name: 'why',
                          label: '왜 일어났는지 동기를 설명하세요',
                          type: 'paragraph',
                          defaultValue: w4hAnswers.why,
                          required: true,
                        },
                      ],
                      acceptLabel: '저장',
                      cancelLabel: '취소',
                    },
                    (values) => {
                      if (values.why) {
                        setW4HAnswers({ ...w4hAnswers, why: values.why as string });
                      }
                    }
                  );
                }}
              >
                <text size="small">
                  {w4hAnswers.why ? `✓ 작성 완료: ${w4hAnswers.why.substring(0, 30)}...` : '작성하기'}
                </text>
              </button>
            </vstack>

            {/* HOW */}
            <vstack width="100%" gap="small">
              <text size="medium" weight="bold" color="#e8e8e8">
                ❓ HOW (어떻게)
              </text>
              <button
                appearance="secondary"
                size="small"
                onPress={async () => {
                  context.ui.showForm(
                    {
                      title: 'HOW (어떻게)',
                      fields: [
                        {
                          name: 'how',
                          label: '어떻게 일어났는지 방법을 설명하세요',
                          type: 'paragraph',
                          defaultValue: w4hAnswers.how,
                          required: true,
                        },
                      ],
                      acceptLabel: '저장',
                      cancelLabel: '취소',
                    },
                    (values) => {
                      if (values.how) {
                        setW4HAnswers({ ...w4hAnswers, how: values.how as string });
                      }
                    }
                  );
                }}
              >
                <text size="small">
                  {w4hAnswers.how ? `✓ 작성 완료: ${w4hAnswers.how.substring(0, 30)}...` : '작성하기'}
                </text>
              </button>
            </vstack>
          </vstack>

          {/* Action Buttons */}
          <vstack width="100%" gap="small">
            <button
              appearance="primary"
              size="large"
              onPress={handleSubmitAnswer}
              disabled={submitting}
            >
              <text size="large" weight="bold">
                {submitting ? '제출 중...' : '🎯 추리 제출하기'}
              </text>
            </button>
            <button
              appearance="secondary"
              size="medium"
              onPress={() => setCurrentScreen('investigation')}
              disabled={submitting}
            >
              <text size="medium">
                ← 조사로 돌아가기
              </text>
            </button>
          </vstack>
        </vstack>
      );
    }

    // ========================================================================
    // P2: Results Screen - Score + Leaderboard + Stats
    // ========================================================================

    if (currentScreen === 'results' && submissionResult) {
      const getScoreColor = (score: number): string => {
        if (score >= 80) return '#c9b037'; // Gold
        if (score >= 60) return '#4a9eff'; // Blue
        if (score >= 40) return '#ff9800'; // Amber
        return '#ff4444'; // Red
      };

      return (
        <vstack
          width="100%"
          height="100%"
          backgroundColor="#0a0a0a"
          gap="medium"
          padding="medium"
        >
          {/* Overall Score Header */}
          <vstack
            width="100%"
            gap="medium"
            backgroundColor={submissionResult.isCorrect ? '#c9b037' : '#1a1a1a'}
            padding="large"
            cornerRadius="small"
            alignment="center middle"
          >
            <text size="xxlarge" weight="bold" color={submissionResult.isCorrect ? '#0a0a0a' : '#c9b037'}>
              {submissionResult.isCorrect ? '🎉 정답입니다!' : '😢 아쉽네요...'}
            </text>
            <text size="xxlarge" weight="bold" color={submissionResult.isCorrect ? '#0a0a0a' : getScoreColor(submissionResult.totalScore)}>
              {submissionResult.totalScore}점
            </text>
            {submissionResult.rank && (
              <text size="large" color={submissionResult.isCorrect ? '#0a0a0a' : '#e8e8e8'}>
                전체 순위: {submissionResult.rank}위
              </text>
            )}
            {submissionResult.isCorrect && (
              <text size="medium" color="#0a0a0a" weight="bold">
                범인을 정확히 찾아냈습니다! 훌륭한 추리력이네요.
              </text>
            )}
          </vstack>

          {/* Detailed Breakdown */}
          <vstack width="100%" gap="small" backgroundColor="#1a1a1a" padding="medium" cornerRadius="small">
            <text size="large" weight="bold" color="#c9b037">
              📊 상세 채점 결과
            </text>

            {/* WHO */}
            <vstack width="100%" gap="small" backgroundColor="#2a2a2a" padding="medium" cornerRadius="small">
              <hstack width="100%" alignment="middle">
                <text size="medium" weight="bold" color="#c9b037" grow>
                  ❓ WHO (누가)
                </text>
                <hstack gap="small" alignment="middle">
                  <text size="medium" weight="bold" color={getScoreColor(submissionResult.breakdown.who.score)}>
                    {submissionResult.breakdown.who.score}점
                  </text>
                  <text size="large">
                    {submissionResult.breakdown.who.isCorrect ? '✅' : '❌'}
                  </text>
                </hstack>
              </hstack>
              <text size="small" color="#808080">
                {submissionResult.breakdown.who.feedback}
              </text>
            </vstack>

            {/* WHAT */}
            <vstack width="100%" gap="small" backgroundColor="#2a2a2a" padding="medium" cornerRadius="small">
              <hstack width="100%" alignment="middle">
                <text size="medium" weight="bold" color="#c9b037" grow>
                  ❓ WHAT (무엇을)
                </text>
                <hstack gap="small" alignment="middle">
                  <text size="medium" weight="bold" color={getScoreColor(submissionResult.breakdown.what.score)}>
                    {submissionResult.breakdown.what.score}점
                  </text>
                  <text size="large">
                    {submissionResult.breakdown.what.isCorrect ? '✅' : '❌'}
                  </text>
                </hstack>
              </hstack>
              <text size="small" color="#808080">
                {submissionResult.breakdown.what.feedback}
              </text>
            </vstack>

            {/* WHERE */}
            <vstack width="100%" gap="small" backgroundColor="#2a2a2a" padding="medium" cornerRadius="small">
              <hstack width="100%" alignment="middle">
                <text size="medium" weight="bold" color="#c9b037" grow>
                  ❓ WHERE (어디서)
                </text>
                <hstack gap="small" alignment="middle">
                  <text size="medium" weight="bold" color={getScoreColor(submissionResult.breakdown.where.score)}>
                    {submissionResult.breakdown.where.score}점
                  </text>
                  <text size="large">
                    {submissionResult.breakdown.where.isCorrect ? '✅' : '❌'}
                  </text>
                </hstack>
              </hstack>
              <text size="small" color="#808080">
                {submissionResult.breakdown.where.feedback}
              </text>
            </vstack>

            {/* WHEN */}
            <vstack width="100%" gap="small" backgroundColor="#2a2a2a" padding="medium" cornerRadius="small">
              <hstack width="100%" alignment="middle">
                <text size="medium" weight="bold" color="#c9b037" grow>
                  ❓ WHEN (언제)
                </text>
                <hstack gap="small" alignment="middle">
                  <text size="medium" weight="bold" color={getScoreColor(submissionResult.breakdown.when.score)}>
                    {submissionResult.breakdown.when.score}점
                  </text>
                  <text size="large">
                    {submissionResult.breakdown.when.isCorrect ? '✅' : '❌'}
                  </text>
                </hstack>
              </hstack>
              <text size="small" color="#808080">
                {submissionResult.breakdown.when.feedback}
              </text>
            </vstack>

            {/* WHY */}
            <vstack width="100%" gap="small" backgroundColor="#2a2a2a" padding="medium" cornerRadius="small">
              <hstack width="100%" alignment="middle">
                <text size="medium" weight="bold" color="#c9b037" grow>
                  ❓ WHY (왜)
                </text>
                <hstack gap="small" alignment="middle">
                  <text size="medium" weight="bold" color={getScoreColor(submissionResult.breakdown.why.score)}>
                    {submissionResult.breakdown.why.score}점
                  </text>
                  <text size="large">
                    {submissionResult.breakdown.why.isCorrect ? '✅' : '❌'}
                  </text>
                </hstack>
              </hstack>
              <text size="small" color="#808080">
                {submissionResult.breakdown.why.feedback}
              </text>
            </vstack>

            {/* HOW */}
            <vstack width="100%" gap="small" backgroundColor="#2a2a2a" padding="medium" cornerRadius="small">
              <hstack width="100%" alignment="middle">
                <text size="medium" weight="bold" color="#c9b037" grow>
                  ❓ HOW (어떻게)
                </text>
                <hstack gap="small" alignment="middle">
                  <text size="medium" weight="bold" color={getScoreColor(submissionResult.breakdown.how.score)}>
                    {submissionResult.breakdown.how.score}점
                  </text>
                  <text size="large">
                    {submissionResult.breakdown.how.isCorrect ? '✅' : '❌'}
                  </text>
                </hstack>
              </hstack>
              <text size="small" color="#808080">
                {submissionResult.breakdown.how.feedback}
              </text>
            </vstack>
          </vstack>

          {/* Statistics */}
          {stats && (
            <vstack width="100%" gap="small" backgroundColor="#1a1a1a" padding="medium" cornerRadius="small">
              <text size="large" weight="bold" color="#c9b037">
                📈 전체 통계
              </text>
              <vstack width="100%" gap="small">
                <hstack width="100%" alignment="middle">
                  <text size="medium" color="#808080" grow>
                    총 제출
                  </text>
                  <text size="large" weight="bold" color="#e8e8e8">
                    {stats.totalSubmissions}
                  </text>
                </hstack>
                <hstack width="100%" alignment="middle">
                  <text size="medium" color="#808080" grow>
                    정답자
                  </text>
                  <text size="large" weight="bold" color="#c9b037">
                    {stats.correctSubmissions}
                  </text>
                </hstack>
                <hstack width="100%" alignment="middle">
                  <text size="medium" color="#808080" grow>
                    평균 점수
                  </text>
                  <text size="large" weight="bold" color="#4a9eff">
                    {stats.averageScore}
                  </text>
                </hstack>
                <hstack width="100%" alignment="middle">
                  <text size="medium" color="#808080" grow>
                    정답률
                  </text>
                  <text size="large" weight="bold" color="#ff9800">
                    {stats.totalSubmissions > 0
                      ? Math.round((stats.correctSubmissions / stats.totalSubmissions) * 100)
                      : 0}%
                  </text>
                </hstack>
              </vstack>
            </vstack>
          )}

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <vstack width="100%" gap="small" backgroundColor="#1a1a1a" padding="medium" cornerRadius="small">
              <text size="large" weight="bold" color="#c9b037">
                🏆 리더보드 (Top 10)
              </text>
              <vstack width="100%" gap="small">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <hstack
                    key={`${entry.userId}-${entry.submittedAt}`}
                    width="100%"
                    alignment="middle"
                    gap="medium"
                    backgroundColor={entry.userId === userId ? '#2a2a2a' : '#1a1a1a'}
                    padding="small"
                    cornerRadius="small"
                  >
                    <text size="medium" weight="bold" color="#c9b037">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${entry.rank}`}
                    </text>
                    <text size="small" color="#e8e8e8" grow>
                      {entry.userId}
                      {entry.userId === userId && (
                        <text size="small" color="#c9b037"> (나)</text>
                      )}
                    </text>
                    <text size="medium" weight="bold" color={getScoreColor(entry.score)}>
                      {entry.score}점
                    </text>
                    {entry.isCorrect && <text size="small">✅</text>}
                  </hstack>
                ))}
              </vstack>
            </vstack>
          )}

          {/* Action Buttons */}
          <vstack width="100%" gap="small">
            <button
              appearance="primary"
              size="large"
              onPress={handlePlayAgain}
            >
              <text size="large" weight="bold">
                🎲 새로운 사건 도전하기
              </text>
            </button>
            <button
              appearance="secondary"
              size="medium"
              onPress={() => setCurrentScreen('case-overview')}
            >
              <text size="medium">
                📖 케이스 개요 다시 보기
              </text>
            </button>
          </vstack>
        </vstack>
      );
    }

    // ========================================================================
    // Fallback Screen
    // ========================================================================

    return (
      <vstack
        width="100%"
        height="100%"
        alignment="center middle"
        backgroundColor="#0a0a0a"
        padding="large"
      >
        <text size="large" color="#d4af37">
          알 수 없는 화면 상태입니다.
        </text>
      </vstack>
    );
  },
});

// ============================================================================
// Menu Action - Create New Game Post (Blocks API)
// ============================================================================

Devvit.addMenuItem({
  label: 'Create a new post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    try {
      console.log('🎮 Creating new unique game case from menu (Blocks API)...');

      // 1. Get Gemini API key from settings
      const apiKey = await context.settings.get('geminiApiKey');

      if (!apiKey) {
        context.ui.showToast({
          text: 'Gemini API key not configured. Please set it in app settings.',
          appearance: 'neutral',
        });
        return;
      }

      // 2. Generate unique case
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const customCaseId = `case-${dateStr}-${Date.now()}`;

      console.log(`📝 Generating case with ID: ${customCaseId}...`);

      // Generate case using the scheduler function
      const newCase = await generateDailyCase(
        apiKey as string,
        now,
        true,  // includeImage
        true,  // includeSuspectImages
        true,  // includeCinematicImages
        customCaseId
      );

      console.log(`✅ Case generated: ${newCase.id}`);
      console.log(`   - Victim: ${newCase.victim.name}`);
      console.log(`   - Suspects: ${newCase.suspects.map(s => s.name).join(', ')}`);

      // Get suspect names for title
      const suspectNames = newCase.suspects.map(s => s.name).join(', ');

      // 3. Create post using Blocks API (no post.entrypoints needed!)
      const post = await context.reddit.submitPost({
        subredditName: context.subredditName!,
        title: `🔍 ${dateStr} 미스터리 | 용의자: ${suspectNames}`,
        preview: (
          <vstack height="100%" width="100%" alignment="middle center" backgroundColor="#0a0a0a" padding="large">
            <text size="xxlarge" color="#d4af37">
              🎮 Armchair Sleuths
            </text>
            <spacer size="medium" />
            <text size="large" color="#e0e0e0">
              새로운 미스터리 생성 중...
            </text>
            <spacer size="small" />
            <text size="medium" color="#a0a0a0">
              잠시만 기다려주세요
            </text>
          </vstack>
        ),
        postData: {
          gameState: 'initial',
          score: 0,
          caseId: newCase.id,
        },
      });

      console.log(`✅ Post created successfully: ${post.id}`);

      // Show success toast
      context.ui.showToast({
        text: '게임 포스트가 생성되었습니다!',
        appearance: 'success',
      });

      // Navigate to the new post
      context.ui.navigateTo(post);
    } catch (error) {
      console.error('❌ [menu/post-create] Error:', error);
      context.ui.showToast({
        text: error instanceof Error ? error.message : '포스트 생성 실패',
        appearance: 'neutral',
      });
    }
  },
});

export default Devvit;
