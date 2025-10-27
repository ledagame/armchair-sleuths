# Quick Fix: Post Creation Failure

**Problem:** `Error: missing "default" in devvit.json post.entrypoints`
**Solution:** Add 5 lines to `devvit.json`
**Time:** 2 minutes

---

## The Fix (Copy & Paste)

Open `C:\Users\hpcra\armchair-sleuths\devvit.json` and add this after the `"server"` section:

```json
"posts": {
  "default": {
    "entry": "dist/main.js"
  }
},
```

### Example (Before → After)

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

---

## Test It

```bash
npm run dev:devvit
# Then click "Create a new post" in the menu
```

**Expected:** Post creation succeeds ✅

---

## Full Details

- **Root Cause Analysis:** `ROOT_CAUSE_ANALYSIS_POST_CREATION_FAILURE.md`
- **Step-by-Step Guide:** `DEVVIT_CONFIG_FIX.md`

---

**Confidence:** 99% - Error message explicitly requests this configuration
