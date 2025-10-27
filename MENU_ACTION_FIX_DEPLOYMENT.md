# Menu Action Fix - Deployment Checklist

**Issue Fixed**: Reddit API is not enabled for menu actions
**Solution**: Added `redditAPI: true` to devvit.json permissions

---

## What Changed

### File: `devvit.json`
```diff
  "permissions": {
-   "media": true
+   "media": true,
+   "redditAPI": true
  }
```

**Why**: Menu actions run in Express server context, which gets permissions from `devvit.json`, NOT from `main.tsx` configuration.

---

## Deployment Steps

### 1. Build the Application
```bash
npm run build
```

**Expected output**:
```
✓ Built in XXXms
  dist/main.js
  dist/server/index.cjs
```

---

### 2. Upload to Reddit
```bash
devvit upload
```

**Expected output**:
```
✓ App uploaded successfully
  App ID: armchair-sleuths
  Version: X.X.X
```

---

### 3. Reinstall on Subreddit
```bash
devvit install armchair_sleuths_dev
```

**Or use Reddit UI**:
1. Go to https://developers.reddit.com/apps
2. Find "armchair-sleuths"
3. Click "Install" → Select subreddit
4. Confirm installation

**Expected output**:
```
✓ App installed successfully
  Subreddit: r/armchair_sleuths_dev
```

---

### 4. Verify Permissions

Check app settings on Reddit:
1. Go to r/armchair_sleuths_dev
2. Mod Tools → Installed Apps → armchair-sleuths
3. Verify permissions include:
   - ✅ Media uploads
   - ✅ Reddit API access

---

### 5. Test Menu Action

1. Go to r/armchair_sleuths_dev
2. Click subreddit menu (3 dots)
3. Select "Create a new post"
4. **Expected behavior**:
   - ✅ Case generation starts
   - ✅ Post created successfully
   - ✅ No "Reddit API not enabled" error

---

## Verification Tests

### Test 1: Menu Action Execution
```
Action: Click "Create a new post" from subreddit menu
Expected: Post created with unique case
Success Criteria:
  ✅ No error toast
  ✅ New post appears in subreddit
  ✅ Post has unique case ID (case-YYYY-MM-DD-timestamp)
  ✅ Console shows: "✅ Post created successfully: [post-id]"
```

### Test 2: Reddit API Calls Work
```
Action: Open developer console, check logs
Expected: No Reddit API errors
Success Criteria:
  ✅ No "Reddit API is not enabled" errors
  ✅ reddit.submitCustomPost() succeeds
  ✅ Post creation completes in 30-60s
```

### Test 3: Custom Post Still Works
```
Action: Open any game post
Expected: Game loads normally
Success Criteria:
  ✅ Case data loads
  ✅ getCurrentUser() works in Custom Post
  ✅ No permission errors in Custom Post context
```

---

## Rollback Plan (If Issues Occur)

### Option 1: Revert Configuration
```bash
git checkout devvit.json
npm run build
devvit upload
devvit install armchair_sleuths_dev
```

### Option 2: Remove Menu Action Temporarily
Edit `devvit.json`:
```json
{
  "menu": {
    "items": []  // Remove menu items temporarily
  }
}
```

---

## Why This Fix Works

### Before (Broken)
```
Menu Action → Express Server Context
  ↓
  No redditAPI permission in devvit.json
  ↓
  reddit.submitCustomPost() → ERROR
```

### After (Fixed)
```
Menu Action → Express Server Context
  ↓
  ✅ redditAPI: true in devvit.json
  ↓
  reddit.submitCustomPost() → SUCCESS
```

---

## Additional Notes

### Devvit Configuration Scopes

1. **devvit.json `permissions`**:
   - Scope: GLOBAL (all contexts)
   - Applies to: Custom Post, Express server, triggers, schedulers

2. **main.tsx `Devvit.configure()`**:
   - Scope: Custom Post rendering ONLY
   - Does NOT apply to: Express routes, menu actions

### Menu Action vs Custom Post

| Feature | Menu Action | Custom Post |
|---------|-------------|-------------|
| File | `src/server/index.ts` | `src/main.tsx` |
| Context | Express server | Blocks renderer |
| Config source | `devvit.json` | `Devvit.configure()` |
| Reddit API | ✅ Now enabled | ✅ Always worked |

---

## Success Indicators

After deployment, you should see:

1. **Console Logs** (when menu action clicked):
```
🎮 Creating new unique game case from menu...
📝 Generating case with ID: case-2025-10-25-1730000000000
🎨 Starting case generation...
✅ Case generated: case-2025-10-25-1730000000000
📮 Creating Reddit post: ...
✅ Post created successfully: t3_xxxxx
```

2. **Reddit UI**:
   - New post appears in subreddit feed
   - Post title: "🔍 2025-10-25 미스터리 | 용의자: [names]"
   - Post is playable (Custom Post loads)

3. **No Errors**:
   - No "Reddit API is not enabled" toasts
   - No 400/403 HTTP errors in console
   - Menu action completes successfully

---

## Next Steps After Deployment

1. ✅ Verify menu action works
2. ✅ Test post creation flow
3. ✅ Check Custom Post still functional
4. ✅ Monitor for any new permission-related errors
5. ✅ Document successful deployment

---

## Contact Points

- **Issue Tracker**: Track any deployment issues
- **Reddit Logs**: Check Devvit dashboard for runtime errors
- **Local Testing**: Use `devvit playtest` for local verification

---

**Deployment Date**: [To be filled]
**Deployed By**: [To be filled]
**Version**: [To be filled]
**Status**: Ready for deployment
