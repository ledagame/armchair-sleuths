# Devvit Configuration Fix - Post Entrypoint

**Issue:** Missing Custom Post entrypoint configuration
**Fix:** Add `posts` section to `devvit.json`
**Time to Apply:** 2 minutes

---

## The Fix

### Option 1: Recommended Configuration (Try This First)

Add this section to `devvit.json` after the `"server"` section:

```json
{
  "$schema": "https://developers.reddit.com/schema/config-file.v1.json",
  "name": "armchair-sleuths",
  "server": {
    "dir": "dist/server",
    "entry": "index.cjs"
  },
  "posts": {
    "default": {
      "entry": "dist/main.js"
    }
  },
  "media": {
    "dir": "assets"
  },
  "settings": {
    ...
  },
  ...
}
```

### Option 2: Alternative Configuration (If Option 1 Doesn't Work)

```json
{
  "$schema": "https://developers.reddit.com/schema/config-file.v1.json",
  "name": "armchair-sleuths",
  "server": {
    "dir": "dist/server",
    "entry": "index.cjs"
  },
  "post": {
    "entrypoints": {
      "default": "dist/main.js"
    }
  },
  "media": {
    "dir": "assets"
  },
  ...
}
```

---

## Complete Fixed Configuration

Here's the complete `devvit.json` with the fix applied (Option 1):

```json
{
  "$schema": "https://developers.reddit.com/schema/config-file.v1.json",
  "name": "armchair-sleuths",
  "server": {
    "dir": "dist/server",
    "entry": "index.cjs"
  },
  "posts": {
    "default": {
      "entry": "dist/main.js"
    }
  },
  "media": {
    "dir": "assets"
  },
  "settings": {
    "global": {
      "geminiApiKey": {
        "type": "string",
        "label": "Gemini API Key",
        "isSecret": true
      },
      "vercelImageFunctionUrl": {
        "type": "string",
        "label": "Vercel Image Generation Function URL",
        "isSecret": false,
        "defaultValue": "https://armchair-sleuths-kda8tjd9k-ledagame-554bceba.vercel.app/api/generate-image"
      }
    }
  },
  "menu": {
    "items": [
      {
        "label": "Create a new post",
        "description": "armchair-sleuths",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/post-create"
      },
      {
        "label": "🧪 Test Media Upload API",
        "description": "Run validation tests for context.media.upload()",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/test-media-upload"
      }
    ]
  },
  "permissions": {
    "media": true
  },
  "triggers": {
    "onAppInstall": "/internal/on-app-install"
  },
  "dev": {
    "subreddit": "armchair_sleuths_dev"
  }
}
```

---

## How to Apply

### Step 1: Backup Current Configuration
```bash
cd C:\Users\hpcra\armchair-sleuths
copy devvit.json devvit.json.backup
```

### Step 2: Edit devvit.json

Open `devvit.json` and add the `posts` section after the `server` section.

**Before:**
```json
{
  "server": {
    "dir": "dist/server",
    "entry": "index.cjs"
  },
  "media": {
    "dir": "assets"
  },
  ...
}
```

**After:**
```json
{
  "server": {
    "dir": "dist/server",
    "entry": "index.cjs"
  },
  "posts": {
    "default": {
      "entry": "dist/main.js"
    }
  },
  "media": {
    "dir": "assets"
  },
  ...
}
```

### Step 3: Verify JSON Syntax

Make sure you didn't break the JSON format (commas, brackets, etc.).

### Step 4: No Rebuild Needed

The fix is configuration-only. No need to rebuild.

---

## Testing the Fix

### Test 1: Start Playtest
```bash
npm run dev:devvit
```

### Test 2: Trigger Post Creation

1. Open the playtest browser tab
2. Navigate to your test subreddit
3. Click "Create a new post" menu action
4. Wait for case generation (30-60 seconds)

### Test 3: Verify Success

**Expected Console Output:**
```
[createPost] 📤 Submitting custom post with payload: { ... }
[createPost] ✅ Post created successfully: t3_xxxxx
```

**Expected Behavior:**
- Post appears in subreddit feed
- Post title: "armchair-sleuths"
- Post type: Custom Post
- Clicking post opens the game UI

### Test 4: Verify Game UI Loads

1. Click the created post
2. Game should load with Loading Screen
3. After a moment, Case Overview should appear
4. Click "수사 시작하기" to enter Investigation Screen

---

## Troubleshooting

### If Option 1 Doesn't Work

Try Option 2 configuration format (see above).

### If JSON Parsing Error

```bash
# Validate JSON syntax
npm run build
```

If build fails with JSON error, check:
- Missing or extra commas
- Unmatched brackets
- Quote formatting

### If Post Creation Still Fails

1. Check console logs for new error message
2. Verify `dist/main.js` exists and is not empty
3. Check Devvit version: `devvit --version`
4. Check Devvit documentation for your version

---

## Why This Fix Works

### The Problem

Devvit runtime needs to know:
1. **Where** the Custom Post bundle is located
2. **What** format the bundle is in
3. **How** to load the bundle

Without the `posts` configuration, Devvit doesn't know where to find `dist/main.js`.

### The Solution

Adding `posts.default.entry` tells Devvit:
- "The default Custom Post bundle is at `dist/main.js`"
- "Load this bundle when creating Custom Posts"
- "Execute the `Devvit.addCustomPostType` in this bundle"

### The Result

When `reddit.submitCustomPost()` is called:
1. Devvit looks up the "default" post entrypoint
2. Loads `dist/main.js`
3. Finds the registered Custom Post type ("Armchair Sleuths")
4. Creates a post using that Custom Post type

---

## Configuration Fields Explained

### `posts` (object)
Container for all Custom Post configurations.

### `posts.default` (object)
The "default" Custom Post type. This is the one used when no specific type is requested.

### `posts.default.entry` (string)
Path to the Custom Post bundle file, relative to project root.

**Format:** `"dist/main.js"`
**Must match:** Build output from `npm run build:main`

---

## Next Steps After Fix

1. ✅ Apply configuration fix
2. ✅ Test post creation
3. ⏳ Continue with P1 implementation (Investigation UI)
4. ⏳ Deploy to production when ready

---

## Related Documentation

- Root Cause Analysis: `ROOT_CAUSE_ANALYSIS_POST_CREATION_FAILURE.md`
- Build Configuration: `vite.main.config.ts`
- Custom Post Definition: `src/main.tsx`
- Quick Start Guide: `DEVVIT_QUICK_START.md`

---

**Last Updated:** 2025-10-26
**Status:** READY TO APPLY ✅
