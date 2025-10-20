/**
 * APTopicGenerator.ts
 *
 * Generates default AP topics for suspects based on whether they're guilty or not.
 * Used as fallback when AI doesn't generate AP topics properly.
 */

import type { APTopic } from '@/shared/types/Case';

/**
 * Generate default AP topics for a suspect
 *
 * Guilty suspects get 3 topics (alibi, relationship, motive)
 * Innocent suspects get 2 topics (alibi, relationship)
 *
 * @param isGuilty - Whether the suspect is the guilty party
 * @returns Array of AP topics
 */
export function generateDefaultAPTopics(isGuilty: boolean): APTopic[] {
  const topics: APTopic[] = [
    {
      id: 'topic-alibi-1',
      category: 'alibi',
      keywords: ['알리바이', '어디', '어디에', '시간', '범행', '범행 시각', '그때', 'where', 'alibi', 'when'],
      apReward: 1,
      requiresQuality: true,
      description: '알리바이 정보 획득',
      triggered: false
    },
    {
      id: 'topic-relationship-1',
      category: 'relationship',
      keywords: ['관계', '친구', '동료', '피해자', '알고', '지내', '사이', 'relationship', '어떤 사이'],
      apReward: 1,
      requiresQuality: true,
      description: '관계 정보 획득',
      triggered: false
    }
  ];

  // Guilty suspects get an additional motive topic
  if (isGuilty) {
    topics.push({
      id: 'topic-motive-1',
      category: 'motive',
      keywords: ['이유', '동기', '왜', '미워', '화', '원망', 'motive', 'why', '원한'],
      apReward: 1,
      requiresQuality: true,
      description: '동기 정보 획득',
      triggered: false
    });
  }

  return topics;
}

/**
 * Validate AP topics array
 *
 * @param topics - Topics to validate
 * @returns true if valid
 */
export function validateAPTopics(topics: APTopic[]): boolean {
  if (!topics || !Array.isArray(topics)) {
    return false;
  }

  if (topics.length < 2 || topics.length > 3) {
    return false;
  }

  for (const topic of topics) {
    if (!topic.id || !topic.category || !topic.keywords || !Array.isArray(topic.keywords)) {
      return false;
    }

    if (topic.keywords.length === 0) {
      return false;
    }

    if (typeof topic.apReward !== 'number' || topic.apReward < 1) {
      return false;
    }

    if (typeof topic.requiresQuality !== 'boolean') {
      return false;
    }

    if (!topic.description || topic.description.trim().length === 0) {
      return false;
    }

    if (typeof topic.triggered !== 'boolean') {
      return false;
    }
  }

  return true;
}
