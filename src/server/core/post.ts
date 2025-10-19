import { context, reddit } from '@devvit/web/server';

export interface CreatePostOptions {
  caseId: string;
  title: string;
  subredditName?: string; // Optional, uses context if not provided
}

/**
 * Create a Reddit post for a specific game case
 * @param options - Post creation options including caseId and title
 */
export const createPost = async (options?: CreatePostOptions) => {
  const { subredditName: contextSubreddit } = context;

  // Use provided subreddit or fallback to context
  const targetSubreddit = options?.subredditName || contextSubreddit;

  if (!targetSubreddit) {
    throw new Error('subredditName is required');
  }

  // Default values for backward compatibility
  const postTitle = options?.title || 'armchair-sleuths';
  const caseId = options?.caseId || undefined;

  return await reddit.submitCustomPost({
    splash: {
      // Splash Screen Configuration
      appDisplayName: 'armchair-sleuths',
      backgroundUri: 'default-splash.png',
      buttonLabel: '🔍 게임 시작',
      description: '미스터리를 풀어보세요',
      entryUri: 'index.html',
      heading: '오늘의 미스터리',
      appIconUri: 'default-icon.png',
    },
    postData: {
      gameState: 'initial',
      score: 0,
      caseId: caseId, // Include caseId in postData for client to load specific case
    },
    subredditName: targetSubreddit,
    title: postTitle,
  });
};
