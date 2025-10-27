# Image Display Quick Reference

**Quick Guide for Devvit Image Implementation**

---

## Suspect Images (GAP-001)

### How It Works
1. **Load case** → useAsync hook triggers
2. **Filter suspects** with `hasProfileImage: true`
3. **Parallel fetch** 3 images via `/api/suspect-image/:id`
4. **Store in Record** `suspectImages: Record<string, string>`
5. **Render conditionally** image → loading → emoji

### Code Pattern
```typescript
// 1. Hook (auto-fetches when caseData changes)
const { data: suspectImages, loading: suspectImagesLoading } = useAsync(
  async () => {
    // Fetch logic...
    return imageMap; // Must be valid JSON
  },
  { depends: [caseData?.id] }
);

// 2. Conditional Rendering
const imageUrl = suspectImages?.[suspect.id];
const hasImage = imageUrl !== undefined && imageUrl !== null;

{hasImage ? (
  <image url={imageUrl} imageHeight={96} imageWidth={96} />
) : suspectImagesLoading ? (
  <vstack>Loading...</vstack>
) : (
  <text>🔍</text> // Fallback
)}
```

---

## Evidence & Location Images (GAP-003)

### How It Works
1. **Backend generates** images async (after case creation)
2. **imageUrl field** populated in Location/Evidence objects
3. **Conditional rendering** in UI (optional field)

### Code Pattern
```typescript
{/* Simple conditional rendering */}
{evidence.imageUrl && (
  <image
    url={evidence.imageUrl}
    imageWidth={280}
    imageHeight={200}
    resizeMode="cover"
    description={evidence.name}
  />
)}
```

---

## Key Differences

| Feature | Suspect Images | Evidence/Location Images |
|---------|---------------|-------------------------|
| **Loading Method** | useAsync hook (2-stage) | Direct from object field |
| **Storage** | Record<string, string> | evidence.imageUrl?: string |
| **Fallback** | 🔍 emoji | Text-only card |
| **When Available** | Immediately (sync generation) | After background job (~30-60s) |

---

## Image Sizes

```typescript
// Suspect Images
<image imageHeight={96} imageWidth={96} />   // List view
<image imageHeight={48} imageWidth={48} />   // Chat header

// Location Images
<image imageHeight={180} imageWidth={320} /> // 16:9 landscape

// Evidence Images
<image imageHeight={200} imageWidth={280} /> // List preview
<image imageHeight={240} imageWidth={320} /> // Detail modal
```

---

## Troubleshooting

### Suspect Images Not Showing
1. Check `suspect.hasProfileImage === true`
2. Verify `/api/suspect-image/:id` returns 200
3. Check suspectImages Record: `console.log(suspectImages)`
4. Ensure imageUrl is not null/undefined

### Evidence Images Not Showing
1. Check `evidence.imageUrl` exists in object
2. Verify background image generation completed
3. Check Redis: `case:{id}:location:{locId}:image`

### Loading State Stuck
1. Check useAsync dependency: `depends: [caseData?.id]`
2. Verify Promise.allSettled completes (even on errors)
3. Check network tab for API failures

---

## Common Patterns

### Pattern 1: Simple Conditional (Evidence/Location)
```typescript
{item.imageUrl && (
  <image url={item.imageUrl} imageWidth={280} imageHeight={200} />
)}
```

### Pattern 2: Progressive Loading (Suspect)
```typescript
const imageUrl = suspectImages?.[suspect.id];
const hasImage = imageUrl !== undefined && imageUrl !== null;

{hasImage ? (
  <image url={imageUrl} />
) : loading ? (
  <vstack>...</vstack>
) : (
  <text>🔍</text>
)}
```

### Pattern 3: Fallback with Style
```typescript
{hasImage ? (
  <image url={imageUrl} />
) : (
  <vstack
    width="96px"
    height="96px"
    backgroundColor="#2a2a2a"
    alignment="center middle"
    cornerRadius="small"
  >
    <text size="xxlarge">🔍</text>
  </vstack>
)}
```

---

## Testing Commands

```bash
# Build
npm run build

# Dev server
npm run dev

# Devvit playtest
devvit playtest

# Check suspect images API
curl http://localhost:3000/api/suspect-image/case-2025-10-24-suspect-1
```

---

## File Locations

```
C:\Users\hpcra\armchair-sleuths\
├─ src\
│  ├─ main.tsx                 ← GAP-001 & GAP-003 implementation
│  ├─ server\index.ts          ← API endpoint /api/suspect-image/:id
│  └─ client\
│     └─ hooks\
│        └─ useSuspectImages.ts ← React pattern (reference only)
└─ GAP_001_003_IMPLEMENTATION_COMPLETE.md ← Full documentation
```

---

**Quick Tip**: Always provide `description` prop for accessibility:
```typescript
<image
  url={imageUrl}
  imageWidth={96}
  imageHeight={96}
  description={`${suspect.name} profile`} // ← Required
  resizeMode="cover"
/>
```
