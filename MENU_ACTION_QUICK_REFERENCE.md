# Menu Action Quick Reference Card

**For**: Devvit Web Framework Apps
**Rule**: Always use declarative menu actions in `devvit.json`

---

## The Golden Rule

```
┌──────────────────────────────────────────────────────────┐
│  NEVER use Devvit.addMenuItem() in Web Framework apps   │
│  ALWAYS use devvit.json declarative menu actions        │
└──────────────────────────────────────────────────────────┘
```

---

## Quick Copy-Paste Template

### 1. Add to devvit.json

```json
{
  "menu": {
    "items": [{
      "label": "Your Action Label",
      "description": "Description shown in hover",
      "location": "subreddit",
      "forUserType": "moderator",
      "endpoint": "/internal/menu/your-action"
    }]
  }
}
```

### 2. Add Express handler (src/server/index.ts)

```typescript
// Simple handler (no Reddit API needed)
router.post('/internal/menu/your-action', async (req, res) => {
  try {
    // Your logic here
    await redis.set('key', 'value');

    res.send({
      success: true,
      message: 'Action completed!'
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message
    });
  }
});
```

### 3. Add scheduler job (if Reddit API needed)

```typescript
// src/server/index.ts - Trigger job
router.post('/internal/menu/your-action', async (req, res) => {
  await scheduler.runJob({
    name: 'your-job',
    runAt: new Date(Date.now() + 1000),
    data: { source: 'menu' }
  });

  res.send({
    success: true,
    message: 'Task started!'
  });
});

// src/main.tsx - Execute with Reddit API
Devvit.addSchedulerJob({
  name: 'your-job',
  onRun: async (event, context) => {
    await context.reddit.submitPost({
      title: 'New Post',
      subredditName: context.subredditName,
      preview: <vstack><text>Content</text></vstack>
    });
  }
});
```

---

## Decision Tree

```
Need menu action?
  │
  ├─ Uses Reddit API?
  │   ├─ YES → Use scheduler bridge (template #3)
  │   └─ NO  → Use simple handler (template #2)
  │
  └─ Add to devvit.json (template #1)
```

---

## Common Mistakes

```
❌ DON'T: Devvit.addMenuItem() in main.tsx
❌ DON'T: context.reddit in Express routes
❌ DON'T: Forget to register scheduler job
❌ DON'T: Use same name for multiple menu actions

✅ DO: Use devvit.json for menu actions
✅ DO: Use scheduler bridge for Reddit API
✅ DO: Test menu visibility after deployment
✅ DO: Add error handling and logging
```

---

## Verification Command

```bash
# After deployment
devvit playtest

# In browser:
1. Go to subreddit
2. Click "..." menu
3. Verify menu action appears
4. Click and test functionality
```

---

## Context Cheat Sheet

```
┌─────────────────────────────────────────────────────────┐
│  MAIN CONTEXT (main.tsx)                                │
│  ✅ Reddit API        ❌ Menu actions                    │
│  ✅ Scheduler jobs    ❌ Express routes                  │
│  ✅ Custom Posts      ❌ HTTP requests                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  SERVER CONTEXT (server/index.ts)                       │
│  ✅ Menu actions      ❌ Reddit API                      │
│  ✅ Express routes    ❌ Custom Posts                    │
│  ✅ HTTP requests     ✅ Scheduler bridge                │
└─────────────────────────────────────────────────────────┘
```

---

## File Locations

```
C:\Users\hpcra\armchair-sleuths\
├─ devvit.json                    # Menu action declarations
├─ src\main.tsx                   # Scheduler jobs + Custom Posts
└─ src\server\index.ts            # Menu action handlers
```

---

## Help Resources

- Full Analysis: `MENU_ACTION_VISIBILITY_ANALYSIS.md`
- Visual Guide: `MENU_ACTION_VISUAL_COMPARISON.md`
- Architecture: `DEVVIT_WEB_FRAMEWORK_ARCHITECTURE_DIAGRAM.md`

---

**Keep this card handy when adding menu actions!**
