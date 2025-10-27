# Image Generation Architecture - Executive Summary

**Problem:** 14 images hanging indefinitely in Devvit scheduler (2/14 succeeded, 2 hung for 3+ minutes)

**Root Cause:** `setTimeout` unreliable in Devvit serverless environment, no guarantee of continuous execution

**Solution:** Offload to Vercel with robust timeout handling and progress tracking

---

## Recommended Architecture: Hybrid Queue + Vercel Worker

### How It Works

```
1. Devvit creates ImageGenerationJob in KV store
2. Devvit triggers Vercel function (fire-and-forget)
3. Vercel generates 14 images in 3 parallel batches
4. Vercel sends progress webhooks after each batch
5. Devvit updates job status in KV store
6. Client polls job status for UI updates
```

### Key Benefits

| Benefit | Impact |
|---------|--------|
| **Reliable Timeouts** | AbortController works in Vercel (60s per image) |
| **Progress Tracking** | Know exactly which images completed/failed |
| **Graceful Degradation** | Partial success (10/14) better than total failure |
| **Separation of Concerns** | Devvit initiates, Vercel executes (proper architecture) |
| **Production Ready** | 5-minute Vercel timeout sufficient for 14 images |

---

## Performance Characteristics

| Scenario | Time | Success Rate |
|----------|------|--------------|
| **Optimistic** (100% success) | 42-55 seconds | 14/14 images |
| **Realistic** (90% success, some retries) | 60-90 seconds | 13/14 images |
| **Pessimistic** (50% failure) | 120-180 seconds | 7/14 images |

**Cost per Case:**
- Vercel execution: ~$0.03
- Gemini API: 14 × $0.039 = $0.546
- **Total: ~$0.58 per case**

---

## Implementation Summary

### Files to Create

1. **`api/generate-case-images.ts`** (Vercel Function)
   - 3 parallel batches (5+5+4 images)
   - AbortController timeout (60s per image)
   - Progressive webhook updates
   - ~200 lines

2. **`src/server/services/image/ImageGenerationJobManager.ts`** (Job Manager)
   - Create/update/get jobs in KV store
   - Trigger Vercel function
   - Handle progress webhooks
   - ~150 lines

3. **`src/shared/types/ImageGeneration.ts`** (Types)
   - ImageGenerationJob interface
   - ImageProgressWebhook interface
   - ~50 lines

### Files to Modify

1. **`src/server/services/case/CaseGeneratorService.ts`**
   - Remove `startBackgroundImageGeneration()` call (line ~340-355)
   - Add `ImageGenerationJobManager.createJob()` + `triggerGeneration()`
   - ~20 lines changed

2. **`src/server/index.ts`**
   - Add webhook route: `POST /api/webhook/image-progress`
   - ~15 lines added

**Total Code:** ~435 lines (3 new files, 2 modified files)

---

## Migration Strategy

### Phase 1: Setup (2 hours)
1. Deploy Vercel function
2. Configure environment variables
3. Test with dummy data

### Phase 2: Integration (3 hours)
1. Implement ImageGenerationJobManager
2. Modify CaseGeneratorService
3. Add webhook route
4. Unit tests

### Phase 3: Testing (2 hours)
1. Integration test (full flow)
2. Load test (10 concurrent cases)
3. Error scenario testing

### Phase 4: Deployment (2 hours)
1. Deploy to production
2. Monitor first 10 cases
3. Verify success rates

**Total Time: 7-11 hours**

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Vercel timeout (>5 min) | Low | Medium | Generate first 10 images only, queue rest |
| Webhook failure | Medium | Low | Retry 3 times, client polling fallback |
| Partial failure (7/14) | Medium | Low | Mark as 'partial', show placeholders in UI |
| Gemini API rate limit | Low | Medium | Built-in retry logic, exponential backoff |
| Stuck jobs (>10 min) | Low | Medium | Cleanup job checks for stale jobs, alerts |

**Overall Risk: LOW** (proven architecture, similar to existing suspect image generation)

---

## Decision Matrix

### Why This Approach Over Alternatives?

| Approach | Pros | Cons | Score |
|----------|------|------|-------|
| **Queue + Vercel** (Recommended) | ✅ Reliable timeouts<br>✅ Progress tracking<br>✅ Proven architecture | ❌ Additional infra<br>❌ Webhook complexity | **9/10** |
| Full Parallel (Promise.allSettled) | ✅ Simple<br>✅ No infra | ❌ No timeout<br>❌ No progress<br>❌ Hangs in Devvit | **3/10** |
| Streaming/Chunked | ✅ Resilient | ❌ Complex state<br>❌ Multiple invocations<br>❌ Higher latency | **5/10** |
| Client-Side | ✅ No backend | ❌ CORS issues<br>❌ API key exposure<br>❌ Not possible | **1/10** |

---

## Success Criteria

### Pre-Launch
- [ ] Unit tests pass (100%)
- [ ] Integration test generates 14/14 images
- [ ] Load test (10 concurrent cases) succeeds
- [ ] Webhook delivery confirmed
- [ ] Partial failure handled gracefully

### Post-Launch (First 24 Hours)
- [ ] Success rate >90% (13/14 images)
- [ ] Average generation time <90 seconds
- [ ] Zero stuck jobs
- [ ] Webhook delivery >95%
- [ ] Zero production errors

### 7-Day Review
- [ ] Success rate stabilized >95%
- [ ] Average generation time <60 seconds
- [ ] Cost per case <$0.60
- [ ] Client feedback positive
- [ ] No manual interventions needed

---

## Rollback Plan

**If success rate <50% in first 24 hours:**

1. **Immediate:** Revert to old background generation (git revert)
2. **Investigation:** Check Vercel logs, Gemini API status
3. **Fix:** Address root cause
4. **Re-deploy:** After validation in staging

**Rollback Time: <15 minutes**

---

## Monitoring Dashboard

### Key Metrics (Real-Time)

```
╔════════════════════════════════════════╗
║  Image Generation Health               ║
╠════════════════════════════════════════╣
║  Success Rate:        94.2% ✅         ║
║  Avg Generation Time: 67s   ✅         ║
║  Active Jobs:         3               ║
║  Stuck Jobs:          0     ✅         ║
║  Webhook Failures:    0     ✅         ║
║  Cost Today:          $45.23          ║
╚════════════════════════════════════════╝
```

### Alerts (PagerDuty/Slack)

1. **Critical:** Success rate <50% (page on-call)
2. **Warning:** Success rate <90% (Slack notification)
3. **Warning:** Stuck jobs >0 (check after 10 minutes)
4. **Info:** Webhook failure (retry automatically)

---

## Conclusion

### Recommended Action: **APPROVE & IMPLEMENT**

**Justification:**
1. ✅ Proven architecture (similar to existing suspect generation)
2. ✅ Low risk (can rollback in 15 minutes)
3. ✅ High ROI (solves critical blocker, enables feature launch)
4. ✅ Reasonable cost (~$0.58 per case)
5. ✅ Maintainable (clean separation of concerns)

**Next Steps:**
1. Approve implementation plan
2. Allocate 7-11 hours for development
3. Deploy to staging
4. Validate with production data
5. Monitor for 24 hours
6. Full launch

**Timeline:**
- Development: 1-2 days
- Testing: 0.5 day
- Deployment: 0.5 day
- **Total: 2-3 days**

---

## Appendix: Technical Details

**Full Implementation Guide:**
- `docs/implementation-plans/robust-image-generation-architecture.md` (full architecture)
- `docs/implementation-plans/image-generation-code-changes.md` (code changes)

**Key Files:**
- `api/generate-case-images.ts` - Vercel worker
- `src/server/services/image/ImageGenerationJobManager.ts` - Job manager
- `src/server/services/case/CaseGeneratorService.ts` - Case generator (modified)

**Configuration:**
- Vercel: `GEMINI_API_KEY`
- Devvit: `VERCEL_IMAGE_FUNCTION_URL`, `DEVVIT_BASE_URL`

**Support:**
- Vercel logs: `vercel logs --follow`
- Devvit logs: Developer portal
- KV store: `redis-cli KEYS "case:*:image-job"`

---

**Document Version:** 1.0
**Author:** Backend Architect (Claude Sonnet 4.5)
**Date:** 2025-10-23
**Review Status:** Ready for Approval
