/**
 * PoC Test 1: Vercel Timeout Validation
 *
 * Purpose: Verify Vercel functions can run for 120+ seconds
 * Success Criteria: Function completes without timeout
 * Expected Duration: 120 seconds
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  maxDuration: 300 // 5 minutes (requires Pro plan)
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const startTime = Date.now();

  console.log('🧪 Test 1: Starting timeout validation test...');
  console.log(`   - Target duration: 120 seconds`);
  console.log(`   - Max duration config: ${config.maxDuration} seconds`);

  try {
    // Sleep for 120 seconds
    await new Promise(resolve => setTimeout(resolve, 120000));

    const duration = Date.now() - startTime;
    const success = duration >= 120000; // Should be >= 120s

    console.log(`✅ Test 1 completed in ${duration}ms`);

    res.status(200).json({
      test: 'timeout-validation',
      success,
      duration,
      durationSeconds: Math.round(duration / 1000),
      message: success
        ? `✅ No timeout after ${Math.round(duration / 1000)}s`
        : `❌ Unexpected early termination at ${Math.round(duration / 1000)}s`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(`❌ Test 1 failed after ${duration}ms:`, error);

    res.status(500).json({
      test: 'timeout-validation',
      success: false,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '❌ Function timed out or threw error'
    });
  }
}
