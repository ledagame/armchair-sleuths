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

  // Splash screen for initial post loading
  // Custom Post UI defined in main.tsx (Devvit.addCustomPostType)
  const payload = {
    postData: {
      gameState: 'initial',
      score: 0,
      caseId: caseId, // Include caseId in postData for client to load specific case
    },
    subredditName: targetSubreddit,
    title: postTitle,
    splash: {
      appDisplayName: 'Armchair Sleuths',
    },
  };

  console.log('[createPost] 📤 Submitting custom post with payload:', JSON.stringify(payload, null, 2));

  try {
    const result = await reddit.submitCustomPost(payload);
    console.log('[createPost] ✅ Post created successfully:', result.id);
    return result;
  } catch (error) {
    console.error('[createPost] ❌ Failed to create post:', error);
    console.error('[createPost] Payload that failed:', JSON.stringify(payload, null, 2));
    if (error instanceof Error) {
      console.error('[createPost] Error message:', error.message);
      console.error('[createPost] Error stack:', error.stack);
    }
    throw error;
  }
};
