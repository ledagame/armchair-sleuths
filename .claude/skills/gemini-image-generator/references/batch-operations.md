# Batch Image Generation

Complete guide for batch image generation operations, automation, and optimization.

## Batch Generation Types

### 1. Case-Based Batch Generation

Generate all images for a complete case:

```bash
# All images (3 suspects + 1 scene)
npx tsx scripts/batch-generate-images.ts \
  --case-id case-2025-01-19 \
  --type all

# Suspects only
npx tsx scripts/batch-generate-images.ts \
  --case-id case-2025-01-19 \
  --type suspects

# Scene only
npx tsx scripts/batch-generate-images.ts \
  --case-id case-2025-01-19 \
  --type scene
```

### 2. Missing Image Detection

Scan and regenerate missing images:

```bash
# Scan all cases
npx tsx scripts/regenerate-missing-images.ts --scan-all

# Scan specific case
npx tsx scripts/regenerate-missing-images.ts --case-id case-2025-01-19

# Auto-fix missing images
npx tsx scripts/regenerate-missing-images.ts --scan-all --fix
```

### 3. Custom Batch Operations

Generate from custom batch file:

```bash
npx tsx scripts/batch-generate-images.ts --batch-file images-to-generate.json
```

**Batch File Format:**
```json
{
  "images": [
    {
      "type": "suspect",
      "caseId": "case-2025-01-19",
      "suspectId": "suspect-1",
      "retries": 3
    },
    {
      "type": "scene",
      "caseId": "case-2025-01-19",
      "retries": 3
    }
  ],
  "options": {
    "delay": 2000,
    "maxConcurrent": 1,
    "stopOnError": false
  }
}
```

## Sequential Generation Strategy

### Why Sequential?

Gemini API has rate limits:
- Free tier: 60 requests/minute
- Paid tier: Higher limits, but still rate-limited

**Sequential generation prevents:**
- Rate limit errors (429 status)
- Wasted API calls
- Failed generations
- Manual retry work

### Implementation

```typescript
async function batchGenerateSequential(images: ImageRequest[]): Promise<void> {
  for (const image of images) {
    try {
      await generateImage(image);
      await sleep(DELAY_BETWEEN_IMAGES); // Default: 2000ms
    } catch (error) {
      handleError(error, image);
    }
  }
}
```

### Timing Configuration

```typescript
const TIMING_CONFIG = {
  delayBetweenImages: 2000,      // 2 seconds between images
  delayAfterError: 5000,         // 5 seconds after error
  delayAfterRateLimit: 60000,    // 60 seconds after rate limit
  maxConcurrent: 1,              // Always sequential
};
```

## Retry Logic

### Automatic Retry Strategy

```typescript
const RETRY_CONFIG = {
  maxAttempts: 3,
  backoffMultiplier: 2,
  initialDelay: 1000,
  maxDelay: 10000
};

async function generateWithRetry(request: ImageRequest): Promise<Image> {
  let attempt = 0;
  let delay = RETRY_CONFIG.initialDelay;

  while (attempt < RETRY_CONFIG.maxAttempts) {
    try {
      return await generateImage(request);
    } catch (error) {
      attempt++;

      if (attempt >= RETRY_CONFIG.maxAttempts) {
        throw new Error(`Failed after ${attempt} attempts: ${error.message}`);
      }

      // Exponential backoff
      await sleep(delay);
      delay = Math.min(delay * RETRY_CONFIG.backoffMultiplier, RETRY_CONFIG.maxDelay);
    }
  }
}
```

### Retry Triggers

**Always retry on:**
- Network timeout
- 503 Service Unavailable
- 500 Internal Server Error
- Temporary API errors

**Never retry on:**
- 400 Bad Request (fix prompt instead)
- 401 Unauthorized (check API key)
- Invalid prompt format

**Special handling:**
- 429 Rate Limit: Wait 60 seconds, then retry once

## Progress Tracking

### Console Output

```typescript
interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
  currentImage: string;
  elapsed: number;
  estimated: number;
}

function displayProgress(info: ProgressInfo): void {
  console.log(`
  [${info.current}/${info.total}] ${info.percentage}%
  Generating: ${info.currentImage}
  Elapsed: ${formatTime(info.elapsed)}
  Estimated remaining: ${formatTime(info.estimated)}
  `);
}
```

**Example Output:**
```
[2/4] 50%
Generating: Suspect-2 profile image
Elapsed: 00:04:30
Estimated remaining: 00:04:30
```

### Progress File

Save progress to file for resume capability:

```json
{
  "batchId": "batch-2025-01-19-001",
  "startTime": "2025-01-19T10:00:00Z",
  "completed": [
    {
      "type": "suspect",
      "suspectId": "suspect-1",
      "completedAt": "2025-01-19T10:02:15Z"
    }
  ],
  "pending": [
    {
      "type": "suspect",
      "suspectId": "suspect-2"
    }
  ],
  "failed": []
}
```

### Resume Capability

```bash
# Resume failed batch
npx tsx scripts/batch-generate-images.ts --resume batch-2025-01-19-001
```

## Error Handling

### Error Classification

```typescript
enum ErrorType {
  RATE_LIMIT = 'rate_limit',
  NETWORK = 'network',
  API_ERROR = 'api_error',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

interface BatchError {
  type: ErrorType;
  message: string;
  imageRequest: ImageRequest;
  attempt: number;
  timestamp: Date;
  recoverable: boolean;
}
```

### Error Strategies

**Rate Limit (429):**
```typescript
async function handleRateLimit(error: RateLimitError): Promise<void> {
  console.warn('Rate limit hit. Waiting 60 seconds...');
  await sleep(60000);
  // Retry will happen automatically
}
```

**Network Error:**
```typescript
async function handleNetworkError(error: NetworkError): Promise<void> {
  console.warn('Network error. Retrying with backoff...');
  // Exponential backoff will be applied
}
```

**API Error (500/503):**
```typescript
async function handleAPIError(error: APIError): Promise<void> {
  console.error('API error:', error.message);
  await sleep(5000); // Wait 5 seconds
  // Retry with same prompt
}
```

**Validation Error (400):**
```typescript
async function handleValidationError(error: ValidationError): Promise<void> {
  console.error('Invalid prompt:', error.message);
  // Log error and skip (don't retry)
  logFailure(error);
}
```

### Error Report

Generated after batch completion:

```json
{
  "batchId": "batch-2025-01-19-001",
  "summary": {
    "total": 4,
    "successful": 3,
    "failed": 1
  },
  "failures": [
    {
      "type": "suspect",
      "suspectId": "suspect-3",
      "error": "Rate limit exceeded after max retries",
      "attempts": 3,
      "recoverable": true
    }
  ],
  "recommendations": [
    "Retry failed images manually",
    "Consider increasing delay between images"
  ]
}
```

## Optimization Strategies

### 1. Pre-flight Validation

Validate all requests before starting batch:

```typescript
async function validateBatch(requests: ImageRequest[]): Promise<ValidationResult> {
  const errors: string[] = [];

  for (const request of requests) {
    // Check suspect data exists
    if (request.type === 'suspect') {
      const suspect = await getSuspect(request.suspectId);
      if (!suspect) {
        errors.push(`Suspect not found: ${request.suspectId}`);
      }
    }

    // Check prompt validity
    const prompt = buildPrompt(request);
    if (prompt.length > MAX_PROMPT_LENGTH) {
      errors.push(`Prompt too long for ${request.suspectId}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### 2. Parallel Batches (Advanced)

For multiple cases, run separate batches in parallel:

```bash
# Terminal 1
npx tsx scripts/batch-generate-images.ts --case-id case-2025-01-19

# Terminal 2
npx tsx scripts/batch-generate-images.ts --case-id case-2025-01-20
```

**Important**: Each case batch is sequential internally, but multiple case batches can run in parallel.

### 3. Smart Scheduling

Generate images during off-peak hours:

```bash
# Cron job for 2 AM daily
0 2 * * * cd /path/to/project && npx tsx scripts/batch-generate-images.ts --scan-all --fix
```

### 4. Cost Optimization

```typescript
const COST_CONFIG = {
  estimateOnly: false,  // Calculate cost without generating
  maxCost: 5.00,       // Stop if estimated cost exceeds $5
  costPerImage: 0.02   // Approximate cost per image
};

function estimateCost(imageCount: number): number {
  return imageCount * COST_CONFIG.costPerImage;
}
```

## Batch Workflows

### Weekly Case Preparation

```bash
#!/bin/bash
# prepare-weekly-cases.sh

# Generate 7 cases for the week
for i in {1..7}; do
  DATE=$(date -d "+$i days" +%Y-%m-%d)
  CASE_ID="case-$DATE"

  echo "Generating case: $CASE_ID"

  # Generate case data
  npx tsx scripts/generate-case.ts --case-id $CASE_ID

  # Generate all images
  npx tsx scripts/batch-generate-images.ts --case-id $CASE_ID --type all

  # Validate
  npx tsx scripts/validate-case.ts --case-id $CASE_ID

  # Wait between cases
  sleep 120
done

echo "Weekly cases prepared!"
```

### Recovery Workflow

```bash
#!/bin/bash
# recover-missing-images.sh

# Scan for missing images
npx tsx scripts/regenerate-missing-images.ts --scan-all --export missing.json

# Review missing images
cat missing.json

# Confirm and fix
read -p "Regenerate missing images? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npx tsx scripts/regenerate-missing-images.ts --scan-all --fix
fi
```

### Quality Assurance Workflow

```bash
#!/bin/bash
# qa-images.sh

CASE_ID=$1

# Generate images
npx tsx scripts/batch-generate-images.ts --case-id $CASE_ID --type all

# Visual inspection
npx tsx scripts/preview-images.ts --case-id $CASE_ID

# Automated quality check
npx tsx scripts/validate-image-quality.ts --case-id $CASE_ID

# Regenerate if quality issues found
if [ $? -ne 0 ]; then
  echo "Quality issues detected. Regenerating..."
  npx tsx scripts/batch-generate-images.ts --case-id $CASE_ID --type all --force
fi
```

## Monitoring & Logging

### Log Format

```typescript
interface BatchLog {
  timestamp: string;
  batchId: string;
  event: 'start' | 'progress' | 'complete' | 'error';
  details: {
    imageType?: string;
    imageId?: string;
    progress?: number;
    error?: string;
  };
}
```

**Example Logs:**
```
2025-01-19T10:00:00Z [batch-001] START: 4 images queued
2025-01-19T10:02:15Z [batch-001] PROGRESS: 1/4 (25%) - suspect-1 complete
2025-01-19T10:04:30Z [batch-001] PROGRESS: 2/4 (50%) - suspect-2 complete
2025-01-19T10:06:45Z [batch-001] ERROR: suspect-3 failed (rate limit)
2025-01-19T10:07:45Z [batch-001] PROGRESS: 3/4 (75%) - suspect-3 retry success
2025-01-19T10:10:00Z [batch-001] PROGRESS: 4/4 (100%) - scene complete
2025-01-19T10:10:00Z [batch-001] COMPLETE: 4/4 successful
```

### Metrics Tracking

```typescript
interface BatchMetrics {
  totalImages: number;
  successfulImages: number;
  failedImages: number;
  totalTime: number;
  averageTimePerImage: number;
  apiCallsUsed: number;
  estimatedCost: number;
  retryRate: number;
}
```

### Dashboard Export

```bash
# Generate batch statistics
npx tsx scripts/batch-stats.ts --from 2025-01-01 --to 2025-01-31

# Export to CSV
npx tsx scripts/batch-stats.ts --export stats.csv
```

**Output:**
```csv
batch_id,date,total,successful,failed,time,cost
batch-001,2025-01-19,4,4,0,10:00,$0.08
batch-002,2025-01-20,4,3,1,12:30,$0.06
```

## Best Practices

1. **Always validate before batch**: Check all case data exists
2. **Use sequential generation**: Prevents rate limit issues
3. **Enable retry logic**: Most errors are temporary
4. **Monitor progress**: Use progress tracking for long batches
5. **Log everything**: Helps debug issues later
6. **Test with small batches**: Verify settings before large operations
7. **Schedule wisely**: Generate during off-peak hours
8. **Plan for failures**: Always have recovery workflow
9. **Track costs**: Monitor API usage and estimated costs
10. **Review quality**: Don't auto-deploy without inspection

## Troubleshooting

### Batch Stuck/Frozen

**Symptoms**: No progress for >5 minutes

**Solutions:**
- Check network connection
- Verify API key valid
- Check Gemini API status
- Review logs for errors
- Kill and resume batch

### High Failure Rate

**Symptoms**: >30% images failing

**Solutions:**
- Reduce batch size
- Increase delay between images
- Check prompt templates
- Verify API quota
- Review error types

### Slow Generation

**Symptoms**: >3 minutes per image

**Solutions:**
- Check network speed
- Verify API response times
- Reduce retry delays
- Use simpler prompts
- Check system resources

### Inconsistent Quality

**Symptoms**: Some images poor quality

**Solutions:**
- Review failed image prompts
- Check style consistency
- Validate prompt templates
- Regenerate low-quality images
- Update quality criteria
