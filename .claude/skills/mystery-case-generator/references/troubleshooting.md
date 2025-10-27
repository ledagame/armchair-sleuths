# Troubleshooting Guide

Common errors and solutions for mystery case generation.

## Error: "No guilty suspect found"

### Symptoms
- Case has 0 or >1 suspects with `isGuilty: true`
- Validation fails

### Causes
1. Gemini API response formatting error
2. Manual case editing removed guilty marker
3. Data corruption during storage

### Solutions

**Quick Fix:**
```bash
npx tsx scripts/validate-case.ts --case-id <id> --fix
```

**Manual Fix:**
1. Identify which suspect should be guilty (check solution.who)
2. Update case data:
```typescript
suspects[guiltyIndex].isGuilty = true;
// Ensure all others are false
```

## Error: "Missing 5W1H field"

### Symptoms
- Solution object missing: who, what, where, when, why, or how
- Case incomplete

### Causes
1. Gemini API didn't generate complete solution
2. Field truncated or corrupted

### Solutions

**Auto-fix:**
```bash
npx tsx scripts/validate-case.ts --case-id <id> --fix
```

**Manual regeneration:**
```bash
npx tsx scripts/generate-case.ts --case-id <id> --regenerate-solution
```

## Error: "Image generation failed"

### Symptoms
- Case generated but images missing
- `profileImage` or `caseSceneImage` fields undefined

### Causes
1. Gemini Image API rate limit exceeded
2. Invalid image prompt
3. Network timeout
4. API key issues

### Solutions

**Retry with backoff:**
```bash
npx tsx scripts/generate-case.ts --case-id <id> --regenerate-images --retry 5
```

**Check API key:**
```bash
echo $GEMINI_API_KEY
# Should output your API key
```

**Rate limit handling:**
- Wait 60 seconds between image generations
- Use batch script with delays
- Monitor API quota

## Error: "Gemini API key not configured"

### Symptoms
- Script fails immediately
- "API key required" error message

### Causes
- Environment variable not set
- `.env` file missing or incorrect

### Solutions

**Set environment variable:**
```bash
# Linux/Mac
export GEMINI_API_KEY=your_api_key_here

# Windows
set GEMINI_API_KEY=your_api_key_here
```

**Create `.env` file:**
```env
GEMINI_API_KEY=your_api_key_here
```

## Error: "KV store connection failed"

### Symptoms
- Cannot save or retrieve cases
- "Storage error" messages

### Causes
1. Vercel KV not configured
2. Connection timeout
3. Quota exceeded

### Solutions

**Check KV configuration:**
```bash
# Verify environment variables
echo $KV_REST_API_URL
echo $KV_REST_API_TOKEN
```

**Test connection:**
```bash
npx tsx scripts/test-kv-connection.ts
```

**Quota issues:**
- Check Vercel dashboard for KV usage
- Upgrade plan if needed
- Clean up old cases

## Error: "Reddit deployment failed"

### Symptoms
- Case validates but doesn't post to Reddit
- "Reddit API error" messages

### Causes
1. Devvit credentials invalid
2. Subreddit permissions missing
3. Rate limit exceeded
4. Post format invalid

### Solutions

**Verify credentials:**
```bash
npx tsx scripts/test-reddit-auth.ts
```

**Check permissions:**
- Verify bot has posting permissions in subreddit
- Check subreddit settings

**Test with dry-run:**
```bash
npx tsx scripts/deploy-case.ts --case-id <id> --dry-run
```

## Error: "Contradiction detected in case"

### Symptoms
- Validation warnings about inconsistencies
- Suspect statements don't match solution

### Causes
1. Gemini generated inconsistent story
2. Manual edits created contradictions

### Solutions

**Review contradictions:**
```bash
npx tsx scripts/validate-case.ts --case-id <id> --verbose
```

**Regenerate case:**
```bash
npx tsx scripts/generate-case.ts --case-id <id>
```

## Performance Issues

### Slow case generation

**Causes:**
- Multiple sequential API calls
- Large image generation
- Network latency

**Solutions:**
- Use `--no-images` for faster generation
- Batch operations with delays
- Monitor API response times

### API rate limits

**Symptoms:**
- "429 Too Many Requests" errors
- Generation fails intermittently

**Solutions:**
- Implement exponential backoff (built into scripts)
- Reduce concurrent requests
- Use `--retry` flag with delays
```bash
npx tsx scripts/generate-case.ts --retry 5 --delay 2000
```

## Debugging Tips

### Enable verbose logging

```bash
# Add DEBUG environment variable
DEBUG=* npx tsx scripts/generate-case.ts
```

### Inspect case data

```bash
# View raw case data
npx tsx scripts/inspect-case.ts --case-id <id>
```

### Test individual components

```bash
# Test Gemini API
npx tsx scripts/test-gemini.ts

# Test image generation
npx tsx scripts/test-image-gen.ts

# Test KV storage
npx tsx scripts/test-kv.ts
```

## Getting Help

If issues persist:

1. Check existing GitHub issues
2. Review Gemini API status page
3. Verify all environment variables
4. Test with minimal case (no images)
5. Enable debug logging
6. Create detailed issue report with:
   - Error messages
   - Script command used
   - Environment details
   - Case ID (if applicable)
