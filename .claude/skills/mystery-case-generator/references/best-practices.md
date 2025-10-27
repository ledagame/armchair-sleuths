# Best Practices

Tips and recommendations for optimal mystery case generation.

## Case Generation

### 1. Always validate before deployment

**Why:** Prevents publishing incomplete or broken cases

```bash
# Recommended workflow
npx tsx scripts/generate-case.ts --with-images
npx tsx scripts/validate-case.ts --case-id <id>
# Only deploy if validation passes
npx tsx scripts/deploy-case.ts --case-id <id>
```

**Automation:**
```bash
# Create deployment script
#!/bin/bash
CASE_ID=$1
npx tsx scripts/generate-case.ts --case-id $CASE_ID --with-images
if npx tsx scripts/validate-case.ts --case-id $CASE_ID; then
  npx tsx scripts/deploy-case.ts --case-id $CASE_ID
else
  echo "Validation failed. Fix errors before deployment."
  exit 1
fi
```

### 2. Generate with images for better user experience

**Impact:** Images dramatically increase user engagement

**Recommended:**
```bash
npx tsx scripts/generate-case.ts --with-images
```

**Trade-offs:**
- ✅ Better user experience
- ✅ Higher engagement rates
- ❌ Slower generation (~2 minutes vs 30 seconds)
- ❌ More API calls (7 vs 3)

**When to skip images:**
- Testing and development
- Rapid prototyping
- API quota concerns

### 3. Use batch operations for efficiency

**For weekly case preparation:**
```bash
npx tsx scripts/batch-generate.ts --count 7 --with-images --delay 60
```

**Benefits:**
- Consistent case quality
- Automated rate limit handling
- Bulk validation
- Error recovery

**Implementation:**
```bash
# Generate 7 cases with proper delays
for i in {1..7}; do
  DATE=$(date -d "+$i days" +%Y-%m-%d)
  npx tsx scripts/generate-case.ts --case-id case-$DATE --with-images
  sleep 60  # Respect API rate limits
done
```

### 4. Use consistent case ID format

**Recommended format:** `case-YYYY-MM-DD`

**Why:**
- Easy sorting and filtering
- Clear date association
- Predictable for automation

**Examples:**
```bash
# Good
case-2025-01-19
case-2025-01-20

# Avoid
mystery-case-1
case_jan_19
random-id-12345
```

### 5. Monitor Gemini API usage

**API calls per case:**
- Basic case: ~3 calls
  - Story generation: 1
  - Suspect details: 1
  - Solution: 1

- With images: ~7 calls
  - Story generation: 1
  - Suspect details: 1
  - Solution: 1
  - Suspect images: 3
  - Case scene: 1

**Daily limits:**
- Free tier: 60 requests/minute
- Consider timing for batch operations

**Monitoring:**
```bash
# Track API usage
npx tsx scripts/api-usage-stats.ts --from 2025-01-01
```

## Case Quality

### 1. Verify suspect diversity

Each case should have distinct suspect archetypes:
- Avoid repeating archetypes in same case
- Use different personalities
- Vary backgrounds and motivations

**Check archetype distribution:**
```bash
npx tsx scripts/analyze-archetypes.ts --case-id <id>
```

### 2. Ensure mystery complexity

**Good mysteries have:**
- Multiple plausible suspects
- Subtle clues
- Logical solution
- No obvious guilty party

**Red flags:**
- One suspect clearly guilty
- Solution too simple
- Contradictory evidence
- Unrealistic timeline

### 3. Maintain narrative consistency

**Check for:**
- Timeline coherence
- Location consistency
- Character relationships match backgrounds
- Motive aligns with personality

**Validation:**
```bash
npx tsx scripts/validate-case.ts --case-id <id> --check-narrative
```

## Image Generation

### 1. Sequential over parallel

**Don't:**
```bash
# Parallel image generation - may hit rate limits
for suspect in suspects; do
  generate_image $suspect &
done
wait
```

**Do:**
```bash
# Sequential with delays
for suspect in suspects; do
  generate_image $suspect
  sleep 2  # Prevent rate limit issues
done
```

### 2. Retry logic for robustness

Images may fail due to temporary issues. Always use retry:

```bash
npx tsx scripts/generate-case.ts --with-images --retry 3
```

**Built-in retry features:**
- Automatic retry with exponential backoff
- Maximum 3 attempts by default
- Logs failure reasons for debugging

### 3. Validate image quality

After generation, verify:
- Images loaded correctly
- Appropriate content (no explicit/violent imagery)
- Faces visible for suspect profiles
- Scene matches location description

**Manual review:**
```bash
npx tsx scripts/preview-images.ts --case-id <id>
```

## Deployment

### 1. Test in staging first

```bash
# Deploy to test subreddit
npx tsx scripts/deploy-case.ts --case-id <id> --subreddit r/ArmchairSleuths_Test

# Verify, then deploy to production
npx tsx scripts/deploy-case.ts --case-id <id> --subreddit r/ArmchairSleuths
```

### 2. Schedule deployments

**Daily case at consistent time:**
```bash
# Cron job for 9 AM daily
0 9 * * * cd /path/to/project && npx tsx scripts/deploy-case.ts --today
```

**Pre-generate cases:**
- Generate cases in advance
- Store in KV
- Deploy on schedule

### 3. Monitor deployment success

Track:
- Successful posts vs failures
- User engagement metrics
- Error patterns

```bash
npx tsx scripts/deployment-stats.ts --from 2025-01-01
```

## Maintenance

### 1. Regular validation audits

```bash
# Weekly audit of all cases
npx tsx scripts/validate-all-cases.ts --export weekly-audit.json
```

**Review:**
- Common error patterns
- Quality trends
- API failure rates

### 2. Archive old cases

```bash
# Archive cases older than 90 days
npx tsx scripts/archive-cases.ts --older-than 90
```

**Benefits:**
- Reduce KV storage costs
- Improve query performance
- Maintain data hygiene

### 3. Update case elements periodically

**Refresh:**
- Weapon library (add new weapons)
- Location library (seasonal locations)
- Suspect archetypes (new personalities)

```bash
# Check element usage stats
npx tsx scripts/element-stats.ts

# Add new elements to library
npx tsx scripts/add-element.ts --type weapon --name "Rare Poison"
```

## Development Workflow

### 1. Local testing

```bash
# Test case generation without saving
npx tsx scripts/generate-case.ts --dry-run --verbose

# Test with minimal API calls
npx tsx scripts/generate-case.ts --no-images --test-mode
```

### 2. Use environment-specific configs

```bash
# Development
NODE_ENV=development npx tsx scripts/generate-case.ts

# Production
NODE_ENV=production npx tsx scripts/generate-case.ts
```

### 3. Version control for cases

Track case generation templates:
```bash
git commit -m "feat: add new weapon type to library"
git tag v1.2.0-cases
```

## Performance Optimization

### 1. Cache frequently used data

- Case element library (weapons, motives, locations)
- Suspect archetypes
- Image generation prompts

### 2. Batch operations where possible

- Validate multiple cases at once
- Generate images in batches
- Deploy multiple cases

### 3. Monitor and optimize API usage

```bash
# Analyze API call patterns
npx tsx scripts/analyze-api-usage.ts --optimize
```

## Security

### 1. Protect API keys

```bash
# Never commit API keys
echo "GEMINI_API_KEY=*" >> .gitignore

# Use environment variables
# Rotate keys periodically
```

### 2. Sanitize user input

If cases include user-generated content:
- Validate all inputs
- Sanitize for XSS
- Check for profanity

### 3. Rate limit protection

- Implement client-side rate limiting
- Use exponential backoff
- Monitor quota usage

## Checklist for New Cases

Before deploying a case, verify:

- [ ] Case generated successfully
- [ ] All 3 suspects present
- [ ] Exactly 1 guilty suspect
- [ ] Complete 5W1H solution
- [ ] Images generated (if applicable)
- [ ] No contradictions detected
- [ ] Narrative is coherent
- [ ] Validation passed
- [ ] Tested in staging (recommended)
- [ ] Scheduled for deployment

## Resources

- Gemini API documentation: https://ai.google.dev/docs
- Devvit documentation: https://developers.reddit.com/docs
- Project repository: See main README.md
