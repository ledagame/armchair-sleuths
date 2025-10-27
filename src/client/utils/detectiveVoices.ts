/**
 * detectiveVoices.ts
 *
 * Detective personality system for evidence discovery
 * Adds playful, character-driven reactions to game events
 */

export type DetectiveArchetype =
  | 'sherlock'    // Classic, confident, intellectual
  | 'noir'        // Cynical, world-weary, dramatic
  | 'enthusiast'  // Excited, energetic, playful
  | 'methodical'  // Careful, precise, analytical
  | 'rookie';     // Eager, learning, relatable

export type VoiceContext =
  | 'discovery_critical'
  | 'discovery_important'
  | 'discovery_minor'
  | 'discovery_none'
  | 'first_evidence'
  | 'halfway_complete'
  | 'all_collected'
  | 'contradiction_found'
  | 'location_complete'
  | 'quick_search'
  | 'thorough_search'
  | 'exhaustive_search';

interface VoiceLine {
  text: string;
  emoji?: string;
}

/**
 * Detective voice lines by archetype and context
 */
const VOICE_LINES: Record<DetectiveArchetype, Record<VoiceContext, VoiceLine[]>> = {
  sherlock: {
    discovery_critical: [
      { text: '훌륭해! 이것이야말로 핵심 단서군.', emoji: '🎯' },
      { text: '초등학생도 알 수 있는 증거지. 그러나 중요하네.', emoji: '💡' },
      { text: '드디어 결정적인 증거를 찾았어.', emoji: '⭐' },
      { text: '바로 이거야! 이 증거가 모든 것을 밝혀줄 것이네.', emoji: '🔑' },
    ],
    discovery_important: [
      { text: '흥미롭군. 매우 흥미로워.', emoji: '🤔' },
      { text: '이것은 퍼즐의 한 조각이야.', emoji: '🧩' },
      { text: '예상했던 대로야. 내 추리가 맞았어.', emoji: '✓' },
    ],
    discovery_minor: [
      { text: '사소해 보이지만, 모든 세부사항이 중요하지.', emoji: '📝' },
      { text: '이것도 기록해두세.', emoji: '✍️' },
    ],
    discovery_none: [
      { text: '이 장소는 이미 조사를 끝낸 것 같군.', emoji: '🔍' },
      { text: '더 이상 여기엔 없어. 다른 곳을 살펴보지.', emoji: '👀' },
    ],
    first_evidence: [
      { text: '좋아, 사건이 흥미로워지기 시작했어.', emoji: '🎭' },
    ],
    halfway_complete: [
      { text: '절반을 넘었군. 진실에 다가가고 있어.', emoji: '📊' },
    ],
    all_collected: [
      { text: '모든 증거를 수집했어. 이제 추리를 시작하지.', emoji: '🧠' },
    ],
    contradiction_found: [
      { text: '잠깐, 뭔가 맞지 않아. 이건 모순이야!', emoji: '⚡' },
    ],
    location_complete: [
      { text: '이 장소는 샅샅이 뒤졌군. 다음으로 가세.', emoji: '✅' },
    ],
    quick_search: [
      { text: '빠르게 훑어보자.', emoji: '⚡' },
    ],
    thorough_search: [
      { text: '꼼꼼하게 살펴봐야겠어.', emoji: '🔍' },
    ],
    exhaustive_search: [
      { text: '모든 것을 조사하겠어. 놓치는 게 없도록.', emoji: '🔬' },
    ],
  },

  noir: {
    discovery_critical: [
      { text: '젠장... 이거 큰일이군. 누군가 이걸 숨기려 했어.', emoji: '🚬' },
      { text: '드디어 찾았어. 이 도시의 더러운 비밀이지.', emoji: '🌃' },
      { text: '이게 바로 내가 찾던 거야. 역시 내 직감은 틀리지 않아.', emoji: '💼' },
    ],
    discovery_important: [
      { text: '흠... 점점 복잡해지는군.', emoji: '🎲' },
      { text: '이 사건엔 뭔가 더 있어. 느낌이 그래.', emoji: '🌙' },
    ],
    discovery_minor: [
      { text: '작은 단서도 놓치지 말자. 이 더러운 세상엔 우연은 없어.', emoji: '🎯' },
      { text: '별거 아닌 것 같지만... 일단 기록해두지.', emoji: '📋' },
    ],
    discovery_none: [
      { text: '여긴 깨끗해. 너무 깨끗해... 수상한데.', emoji: '🤨' },
      { text: '아무것도 없군. 시간 낭비였어.', emoji: '💭' },
    ],
    first_evidence: [
      { text: '시작이야. 이 긴 밤의 시작.', emoji: '🌆' },
    ],
    halfway_complete: [
      { text: '절반쯤 왔어. 하지만 가장 어려운 건 이제부터지.', emoji: '🎰' },
    ],
    all_collected: [
      { text: '모든 카드를 모았어. 이제 진실을 밝힐 시간이야.', emoji: '🃏' },
    ],
    contradiction_found: [
      { text: '거짓말이군. 누군가 나한테 거짓말을 했어.', emoji: '💢' },
    ],
    location_complete: [
      { text: '여긴 끝났어. 다음 장소로.', emoji: '🚪' },
    ],
    quick_search: [
      { text: '대충 봐도 뭔가 보이겠지.', emoji: '👁️' },
    ],
    thorough_search: [
      { text: '제대로 조사해야 해. 놈들은 교묘하거든.', emoji: '🕵️' },
    ],
    exhaustive_search: [
      { text: '모든 걸 뒤집어야겠어. 반드시 뭔가 있을 거야.', emoji: '🔦' },
    ],
  },

  enthusiast: {
    discovery_critical: [
      { text: '우와! 대박! 이거 완전 핵심 증거잖아!', emoji: '🎉' },
      { text: '오오오! 드디어 찾았다! 이게 바로 그거야!', emoji: '⭐' },
      { text: '예스! 이거 완전 게임 체인저인데?!', emoji: '🔥' },
    ],
    discovery_important: [
      { text: '오! 이것도 꽤 중요해 보이는데?', emoji: '👀' },
      { text: '좋았어! 이거 괜찮은 단서야!', emoji: '👍' },
    ],
    discovery_minor: [
      { text: '오호~ 이것도 챙겨두자!', emoji: '📦' },
      { text: '작은 거라도 다 중요하니까!', emoji: '✨' },
    ],
    discovery_none: [
      { text: '어라? 여긴 아무것도 없네... 다음 장소로 고고!', emoji: '🏃' },
      { text: '음... 여긴 별거 없구나. 괜찮아, 다른 데 가보자!', emoji: '💪' },
    ],
    first_evidence: [
      { text: '시작이다! 이제 본격적으로 수사 시작!', emoji: '🚀' },
    ],
    halfway_complete: [
      { text: '벌써 절반이나! 우리 잘하고 있어!', emoji: '🎊' },
    ],
    all_collected: [
      { text: '와! 다 모았다! 이제 추리 들어간다!', emoji: '🧩' },
    ],
    contradiction_found: [
      { text: '어? 어? 잠깐만! 뭔가 이상한데?!', emoji: '😲' },
    ],
    location_complete: [
      { text: '여기 다 뒤졌다! 다음 장소 ㄱㄱ!', emoji: '✌️' },
    ],
    quick_search: [
      { text: '빠르게 쓱- 둘러보자!', emoji: '💨' },
    ],
    thorough_search: [
      { text: '자, 이제 제대로 찾아볼까!', emoji: '🔍' },
    ],
    exhaustive_search: [
      { text: '완전 샅샅이 뒤질 거야! 아자!', emoji: '💯' },
    ],
  },

  methodical: {
    discovery_critical: [
      { text: '중요한 증거를 발견했습니다. 신중히 분석이 필요합니다.', emoji: '📌' },
      { text: '핵심 증거 확보. 사건 해결의 결정적 단서입니다.', emoji: '🎯' },
    ],
    discovery_important: [
      { text: '유의미한 증거입니다. 목록에 추가하겠습니다.', emoji: '✓' },
      { text: '이 증거는 사건 재구성에 도움이 될 것입니다.', emoji: '🧩' },
    ],
    discovery_minor: [
      { text: '보조 증거를 기록합니다.', emoji: '📝' },
      { text: '세부사항도 빠짐없이 문서화하겠습니다.', emoji: '📋' },
    ],
    discovery_none: [
      { text: '이 구역은 조사 완료입니다.', emoji: '✅' },
      { text: '추가 증거 없음. 다음 구역으로 이동하겠습니다.', emoji: '➡️' },
    ],
    first_evidence: [
      { text: '첫 번째 증거를 확보했습니다. 조사를 계속합니다.', emoji: '1️⃣' },
    ],
    halfway_complete: [
      { text: '진행률 50% 달성. 순조롭게 진행 중입니다.', emoji: '📊' },
    ],
    all_collected: [
      { text: '모든 증거 수집 완료. 분석 단계로 진입합니다.', emoji: '✅' },
    ],
    contradiction_found: [
      { text: '논리적 모순을 발견했습니다. 재검토가 필요합니다.', emoji: '⚠️' },
    ],
    location_complete: [
      { text: '해당 장소 조사 완료. 다음 위치로 이동합니다.', emoji: '✓' },
    ],
    quick_search: [
      { text: '1차 예비 조사를 시작합니다.', emoji: '👁️' },
    ],
    thorough_search: [
      { text: '정밀 조사를 실시하겠습니다.', emoji: '🔍' },
    ],
    exhaustive_search: [
      { text: '완전 조사 프로토콜을 실행합니다.', emoji: '🔬' },
    ],
  },

  rookie: {
    discovery_critical: [
      { text: '헉! 이거... 엄청 중요한 거 아니야?! 잘 찾았다!', emoji: '😮' },
      { text: '와, 내가 이런 걸 찾다니! 선배님이 칭찬해주시겠는데?', emoji: '😊' },
    ],
    discovery_important: [
      { text: '오오! 이것도 괜찮은 단서 같은데!', emoji: '🤓' },
      { text: '음... 이건 뭔가 의미있어 보여!', emoji: '💭' },
    ],
    discovery_minor: [
      { text: '이것도 혹시 몰라서 챙겨둘게!', emoji: '📝' },
      { text: '작은 거라도 다 중요하다고 배웠어!', emoji: '✍️' },
    ],
    discovery_none: [
      { text: '음... 여긴 별로 없는 것 같은데... 다른 곳을 볼까?', emoji: '🤔' },
      { text: '아무것도 못 찾았네... 괜찮아, 다음엔 잘 찾을 거야!', emoji: '😅' },
    ],
    first_evidence: [
      { text: '첫 증거다! 드디어 탐정 일을 제대로 하는 느낌!', emoji: '🌟' },
    ],
    halfway_complete: [
      { text: '벌써 절반이나! 나 생각보다 잘하는데?', emoji: '😄' },
    ],
    all_collected: [
      { text: '다 모았어! 이제... 이걸로 뭘 하는 거지?', emoji: '🎓' },
    ],
    contradiction_found: [
      { text: '어...? 뭔가 안 맞는데? 내가 잘못 본 건가?', emoji: '😕' },
    ],
    location_complete: [
      { text: '여기 다 뒤진 것 같아! 다음 장소로 가자!', emoji: '🚶' },
    ],
    quick_search: [
      { text: '우선 빠르게 둘러볼게!', emoji: '👀' },
    ],
    thorough_search: [
      { text: '이번엔 좀 더 꼼꼼히 찾아봐야지!', emoji: '🔍' },
    ],
    exhaustive_search: [
      { text: '완전 샅샅이 뒤져보겠어! 화이팅!', emoji: '💪' },
    ],
  },
};

/**
 * Get random voice line for context
 */
export function getVoiceLine(
  archetype: DetectiveArchetype,
  context: VoiceContext
): VoiceLine {
  const lines = VOICE_LINES[archetype][context];
  return lines[Math.floor(Math.random() * lines.length)];
}

/**
 * Get voice line based on evidence discovery
 */
export function getDiscoveryVoiceLine(
  archetype: DetectiveArchetype,
  evidenceCount: number,
  hasCritical: boolean,
  hasImportant: boolean
): VoiceLine {
  if (evidenceCount === 0) {
    return getVoiceLine(archetype, 'discovery_none');
  }

  if (hasCritical) {
    return getVoiceLine(archetype, 'discovery_critical');
  }

  if (hasImportant) {
    return getVoiceLine(archetype, 'discovery_important');
  }

  return getVoiceLine(archetype, 'discovery_minor');
}

/**
 * Get voice line for search type
 */
export function getSearchVoiceLine(
  archetype: DetectiveArchetype,
  searchType: 'quick' | 'thorough' | 'exhaustive'
): VoiceLine {
  const contextMap = {
    quick: 'quick_search' as const,
    thorough: 'thorough_search' as const,
    exhaustive: 'exhaustive_search' as const,
  };

  return getVoiceLine(archetype, contextMap[searchType]);
}

/**
 * Determine detective archetype based on player behavior
 * (Can be expanded with user preference or achievements)
 */
export function determineArchetype(playerStats?: {
  thoroughSearches?: number;
  quickSearches?: number;
  exhaustiveSearches?: number;
  totalEvidence?: number;
}): DetectiveArchetype {
  // Default to enthusiast for new players
  if (!playerStats) return 'enthusiast';

  const { thoroughSearches = 0, quickSearches = 0, exhaustiveSearches = 0 } = playerStats;
  const total = thoroughSearches + quickSearches + exhaustiveSearches;

  if (total === 0) return 'rookie';

  // Methodical: Prefers exhaustive searches
  if (exhaustiveSearches / total > 0.6) return 'methodical';

  // Sherlock: Balanced approach
  if (thoroughSearches / total > 0.5) return 'sherlock';

  // Noir: Mix of quick and thorough
  if (quickSearches / total > 0.4 && thoroughSearches / total > 0.3) return 'noir';

  // Default to enthusiast
  return 'enthusiast';
}
