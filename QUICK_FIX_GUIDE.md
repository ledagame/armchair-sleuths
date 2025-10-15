# Quick Fix Guide - Suspects Not Appearing

## TL;DR - 5 Minute Fix

The suspects aren't showing because your case was generated with old code. Here's how to fix it:

### Step 1: Open Browser Console (F12)

On your Devvit app page, open browser console.

### Step 2: Copy/Paste This Test

```javascript
// Quick diagnostic
fetch('/api/case/today')
  .then(r => r.json())
  .then(data => {
    console.log('Case ID:', data.id);
    console.log('Suspects:', data.suspects?.length || 0);
    console.log('Generated:', new Date(data.generatedAt).toLocaleString());
  });
```

**If suspects = 0**, your case needs to be regenerated.

### Step 3: Regenerate Case

```javascript
// Trigger new case generation
fetch('/api/case/generate', { method: 'POST' })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Result:', data);
    // Wait 2-3 seconds, then refresh page
  });
```

### Step 4: Watch Server Logs

In a terminal:

```bash
npx devvit logs r/YOUR_SUBREDDIT --since 2m --show-timestamps
```

**Look for these lines:**
```
✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-1" to set ...
✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-2" to set ...
✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-3" to set ...
```

**If you DON'T see these lines**, the enhanced code is not deployed. Redeploy:

```bash
cd C:\Users\hpcra\armchair-sleuths
npm run upload
```

### Step 5: Verify

Refresh your app page. Should show: **용의자 (3명)**

---

## If That Doesn't Work

### Option A: Add Debug Endpoint

1. Open `src/server/index.ts`
2. After line 184, add this:

```typescript
// TEMPORARY - Delete and regenerate today's case
router.post('/api/debug/regenerate-today', async (_req, res): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const caseId = `case-${today}`;

    // Delete existing
    await CaseRepository.deleteCase(caseId);

    // Generate new
    const apiKey = await settings.get<string>('geminiApiKey');
    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);
    const caseData = await caseGenerator.generateCase({
      date: new Date(),
      includeImage: false
    });

    res.json({ success: true, caseId: caseData.id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});
```

3. Deploy: `npm run upload`
4. Wait 2 minutes
5. In browser console:

```javascript
fetch('/api/debug/regenerate-today', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

### Option B: Wait Until Tomorrow

The old case will be replaced automatically when a new daily case is generated tomorrow.

---

## Expected Server Logs (Success)

When case generation works correctly, you should see:

```
🔄 Generating today's case...
📚 Selected elements:
  - Weapon: 독극물
  - Motive: 금전
  - Location: 고급 레스토랑
  - Suspects: 비즈니스 파트너, 오랜 친구, 전 배우자
✅ Case story generated
✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-1" to set "case:case-2025-10-15:suspects" (now 1 members)
✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-2" to set "case:case-2025-10-15:suspects" (now 2 members)
✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-3" to set "case:case-2025-10-15:suspects" (now 3 members)
✅ Case created: case-2025-10-15 for date 2025-10-15
✅ Case saved: case-2025-10-15
```

When fetching the case, you should see:

```
✅ DevvitAdapter.sMembers: Retrieved 3 members from set "case:case-2025-10-15:suspects"
📋 Fetched 3 suspects for case case-2025-10-15
```

---

## Troubleshooting

### Problem: No enhanced logs appear

**Solution**: Enhanced code not deployed. Run:
```bash
npm run upload
```

### Problem: Still 0 suspects after regeneration

**Diagnosis needed**. Check:
```javascript
// In browser console
fetch('/api/case/today').then(r => r.json()).then(console.log);
```

Look at the `generatedAt` timestamp. If it's from BEFORE your deployment, the case wasn't regenerated.

### Problem: Case generation fails

**Check API key**. In browser console:
```javascript
fetch('/api/case/generate', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

If you see "Gemini API key not configured", set it in your Devvit app settings.

---

## Files for Reference

- **Comprehensive guide**: `DEBUG_SUSPECTS_ISSUE.md`
- **Debug endpoints**: `debug-endpoint-patch.ts`
- **Browser helpers**: `browser-console-tests.js`
- **Full analysis**: `DEBUGGING_SUMMARY.md`

---

## Quick Command Reference

```bash
# View recent logs
npx devvit logs r/YOUR_SUBREDDIT --since 30m --show-timestamps

# Deploy changes
npm run upload

# Filter logs for DevvitAdapter
npx devvit logs r/YOUR_SUBREDDIT --since 1h | grep "DevvitAdapter"
```

```javascript
// Browser console commands
await fetch('/api/case/today').then(r => r.json()).then(console.log);
await fetch('/api/case/generate', { method: 'POST' }).then(r => r.json()).then(console.log);
```

---

**Bottom Line**: The fix is already deployed (v0.0.2.25). You just need to regenerate today's case to see the suspects.
