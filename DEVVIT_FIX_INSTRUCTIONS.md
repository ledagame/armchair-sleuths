# DEVVIT Evaluation Failure - Fix Instructions

## Problem Summary
DEVVIT playtest starts before server build completes, causing:
```
Evaluation failure: Cannot read `config.server.entry` file (dist\server\index.cjs)
```

## Root Cause
Race condition in concurrent build processes. DEVVIT starts immediately while builds run in parallel. Server build takes 25-40s on first run, but DEVVIT checks at T+16.7s.

**Full analysis:** See `ROOT_CAUSE_ANALYSIS_DEVVIT_FAILURE.md`

---

## Quick Fix (30 seconds)

### Option A: Increase Delay (Simple)

**Edit `package.json` line 33:**

**Current:**
```json
"dev:devvit:delayed": "node -e \"setTimeout(() => {}, 5000)\" && devvit playtest"
```

**Change to:**
```json
"dev:devvit:delayed": "node -e \"setTimeout(() => {}, 45000)\" && devvit playtest"
```

Then run:
```bash
npm run dev
```

**Pros:** Quick, minimal change
**Cons:** Wastes 45s on every restart (even incremental builds)

---

## Recommended Fix (2 minutes)

### Option B: Smart Wait Script (Adaptive)

**Step 1:** Verify `scripts/wait-for-build.js` exists
```bash
ls scripts/wait-for-build.js
```

**Step 2:** Update `package.json` line 33:

**Change from:**
```json
"dev:devvit:delayed": "node -e \"setTimeout(() => {}, 5000)\" && devvit playtest"
```

**Change to:**
```json
"dev:devvit:delayed": "node scripts/wait-for-build.js && devvit playtest"
```

**Step 3:** Run dev mode:
```bash
npm run dev
```

**Expected output:**
```
⏳ Waiting for build files...
   Required: dist/server/index.cjs, dist/client/index.html
   Max wait: 120s
   Progress: .........
✅ Build files ready after 28.5s, starting DEVVIT...
   ✓ dist/server/index.cjs (5193.2 KB)
   ✓ dist/client/index.html (0.4 KB)
```

**Pros:**
- Waits only as long as needed (adaptive)
- Fast on incremental builds (~1-2s)
- Clear progress feedback
- Robust (checks actual file existence)

**Cons:**
- Requires new script file (already created)

---

## Best Long-Term Fix (5 minutes)

### Option C: Pre-build Before Watch

**Update `package.json` line 30:**

**Current:**
```json
"dev": "concurrently -k -p \"[{name}]\" -n \"CLIENT,SERVER,DEVVIT\" -c \"blue,green,magenta\" \"npm run dev:client\" \"npm run dev:server\" \"npm run dev:devvit:delayed\""
```

**Change to:**
```json
"dev": "npm run build && concurrently -k -p \"[{name}]\" -n \"CLIENT,SERVER,DEVVIT\" -c \"blue,green,magenta\" \"npm run dev:client\" \"npm run dev:server\" \"devvit playtest\""
```

**How it works:**
1. Runs full build first (guarantees files exist)
2. Then starts watch mode + DEVVIT
3. No delays needed (files already exist)

**Pros:**
- Zero race conditions possible
- No custom scripts needed
- Idiomatic npm workflow

**Cons:**
- Slower startup (~60s for full build)
- But only on first run

---

## Testing the Fix

### Test 1: Clean Build (Fresh Start)
```bash
rm -rf dist
npm run dev
```

**Expected:** No errors, DEVVIT starts after builds complete

### Test 2: Incremental Build (Hot Reload)
```bash
# With dev running, edit src/server/index.ts
# Save file
```

**Expected:** Fast rebuild (<5s), DEVVIT reloads quickly

### Test 3: Verify Fix Persistence
```bash
# Stop dev mode (Ctrl+C)
# Wait 5 seconds
npm run dev
```

**Expected:** Fast startup (files already exist)

---

## Understanding the Scripts

### Current `dev` script breakdown:

```json
"dev": "concurrently -k -p \"[{name}]\" -n \"CLIENT,SERVER,DEVVIT\" ..."
```

**What it does:**
- `concurrently` - Runs multiple commands in parallel
- `-k` - Kill all processes if one dies
- `-p "[{name}]"` - Prefix output with process name
- `-n "CLIENT,SERVER,DEVVIT"` - Name the processes
- `-c "blue,green,magenta"` - Color-code the output

**The 3 concurrent processes:**
1. `npm run dev:client` - Vite watch mode for client (~16.7s first build)
2. `npm run dev:server` - Vite watch mode for server (~25-40s first build)
3. `npm run dev:devvit:delayed` - DEVVIT playtest (needs files ready)

### Why `dev:devvit:delayed` exists:

Original developer recognized the race condition and added a 5-second delay. This works for incremental builds but not fresh builds.

---

## Troubleshooting

### Error: "Cannot find module 'scripts/wait-for-build.js'"

**Solution:**
```bash
ls scripts/wait-for-build.js
# If missing, file was not created
# Re-run: Check that scripts directory exists
mkdir -p scripts
# Then create wait-for-build.js from ROOT_CAUSE_ANALYSIS document
```

### Error: "Timeout after 120s waiting for build files"

**Causes:**
1. Build is failing (check build logs)
2. Build takes longer than 2 minutes (increase MAX_WAIT_MS in script)

**Solution:**
```bash
# Check if build works standalone
npm run build:server
npm run build:client

# If builds work, increase timeout in wait-for-build.js:
# Change: const MAX_WAIT_MS = 120000;
# To: const MAX_WAIT_MS = 180000; // 3 minutes
```

### DEVVIT still fails after fix

**Verify:**
1. You're running `npm run dev` (not `npm run dev:devvit`)
2. `package.json` has the updated script
3. Files exist: `ls dist/server/index.cjs dist/client/index.html`

**Debug:**
```bash
# Run builds manually first
npm run build

# Then check files
ls -la dist/server/index.cjs
ls -la dist/client/index.html

# If files exist, run dev
npm run dev
```

---

## Recommendations

**For daily development:**
- Use **Option B** (Smart Wait Script) - Best balance of speed and reliability

**For CI/CD:**
- Use **Option C** (Pre-build) - Guaranteed correctness

**For quick testing:**
- Use **Option A** (Increased Delay) - Minimal change, but slower

---

## Additional Notes

### Why this happens:
- DEVVIT doesn't have built-in build coordination
- Concurrent processes start simultaneously
- No dependency tracking between build steps
- Fresh builds take longer than incremental builds

### Why it wasn't caught earlier:
- Works fine after first successful build (files persist)
- Developers rarely delete `dist/` directory
- Watch mode is fast after initial build (~2-3s)

### Related files:
- `devvit.json` - DEVVIT configuration (correct)
- `src/server/vite.config.ts` - Server build config (correct)
- `src/client/vite.config.ts` - Client build config (correct)
- `package.json` - Script definitions (needs update)

---

**Fix Priority:** 🔴 HIGH (blocks development workflow)

**Estimated Time:** 2 minutes (Option B recommended)

**Impact:** Eliminates race condition, improves dev experience
