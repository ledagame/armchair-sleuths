/**
 * PoC Test 4: Webhook Delivery
 *
 * Purpose: Verify Vercel can send webhooks to Devvit
 * Success Criteria: Webhook delivered in < 1 second
 * Expected Result: 200-500ms delivery time
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  maxDuration: 30
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
    return;
  }

  const startTime = Date.now();

  console.log('🧪 Test 4: Starting webhook delivery test...');

  try {
    const { webhookUrl } = req.body;

    if (!webhookUrl) {
      throw new Error('webhookUrl required in request body');
    }

    console.log(`   - Target: ${webhookUrl}`);

    // Send test payload to webhook
    const webhookPayload = {
      test: 'poc-webhook',
      caseId: 'test-001',
      timestamp: Date.now(),
      message: 'PoC webhook test from Vercel'
    };

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    });

    const duration = Date.now() - startTime;
    const responseText = await webhookResponse.text();

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    const success = webhookResponse.ok;

    console.log(`${success ? '✅' : '❌'} Test 4 completed in ${duration}ms`);
    console.log(`   - Status: ${webhookResponse.status}`);
    console.log(`   - Response:`, responseData);

    res.status(success ? 200 : 500).json({
      test: 'webhook-delivery',
      success,
      duration,
      durationMs: duration,
      webhookUrl: webhookUrl.substring(0, 50) + '...',
      statusCode: webhookResponse.status,
      devvitResponse: responseData,
      message: success
        ? `✅ Webhook delivered in ${duration}ms`
        : `❌ Webhook failed with status ${webhookResponse.status}`,
      verdict: duration < 1000 ? '✅ Fast' : '⚠️ Slow',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(`❌ Test 4 failed after ${duration}ms:`, error);

    res.status(500).json({
      test: 'webhook-delivery',
      success: false,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '❌ Webhook delivery failed'
    });
  }
}
