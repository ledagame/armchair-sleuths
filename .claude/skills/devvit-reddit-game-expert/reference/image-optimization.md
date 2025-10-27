# Image Optimization

Complete guide to image loading, compression, and 2-stage loading strategy.

## Problem Statement

### The Challenge
- Gemini Imagen 3 generates high-quality images (1-2MB PNG)
- Base64 encoding increases size by ~33%
- Including 3 suspect images in initial payload: ~200-300KB
- Devvit has payload limits → 500 Internal Server Error

### The Solution
**2-Stage Progressive Loading**:
1. **Stage 1**: Load minimal data with `hasProfileImage` flags
2. **Stage 2**: Load images individually in parallel

## Image Compression (Sharp)

### Install Sharp
```bash
npm install sharp
```

### Compress Image
```typescript
import sharp from 'sharp';

async function compressImage(
  imageBuffer: Buffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}
): Promise<Buffer> {
  const {
    width = 400,
    height = 400,
    quality = 80,
    format = 'jpeg'
  } = options;

  let pipeline = sharp(imageBuffer).resize(width, height, {
    fit: 'cover',
    position: 'center'
  });

  if (format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality });
  } else if (format === 'png') {
    pipeline = pipeline.png({ compressionLevel: 9 });
  } else if (format === 'webp') {
    pipeline = pipeline.webp({ quality });
  }

  return pipeline.toBuffer();
}
```

### Convert to Base64 Data URL
```typescript
function bufferToDataURL(buffer: Buffer, mimeType: string = 'image/jpeg'): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

// Complete pipeline
async function generateCompressedImage(
  imagenBuffer: Buffer
): Promise<string> {
  const compressed = await compressImage(imagenBuffer, {
    width: 400,
    height: 400,
    quality: 80,
    format: 'jpeg'
  });

  return bufferToDataURL(compressed, 'image/jpeg');
}
```

### Compression Results
```
Original (Imagen 3):     1.5MB PNG
After Sharp compression: 16-20KB JPEG
Reduction:               98.7%
Quality:                 Excellent (visually lossless)
```

## 2-Stage Loading Architecture

### Stage 1: Initial Load (Fast)

#### Backend
```typescript
// GET /api/case/today
app.get('/api/case/today', async (req, res) => {
  const caseData = await loadCase(caseId);
  const suspects = await loadCaseSuspects(caseId);

  // ⚠️ CRITICAL: Exclude profileImageUrl
  const suspectsWithoutImages = suspects.map(suspect => ({
    id: suspect.id,
    name: suspect.name,
    archetype: suspect.archetype,
    background: suspect.background,
    personality: suspect.personality,
    emotionalState: suspect.emotionalState,
    hasProfileImage: suspect.hasProfileImage,  // ✅ Flag only
    // ❌ profileImageUrl: suspect.profileImageUrl  // EXCLUDED
  }));

  res.json({
    ...caseData,
    suspects: suspectsWithoutImages
  });
});
```

#### Initial Payload
```json
{
  "id": "case-2025-10-21",
  "title": "...",
  "suspects": [
    {
      "id": "suspect-1",
      "name": "김민수",
      "hasProfileImage": true
    }
  ]
}
```

**Size**: ~8-10KB (no images)

### Stage 2: Progressive Image Load

#### Backend
```typescript
// GET /api/suspect-image/:suspectId
app.get('/api/suspect-image/:suspectId', async (req, res) => {
  const { suspectId } = req.params;

  const suspect = await loadSuspect(suspectId);

  if (!suspect.hasProfileImage) {
    return res.status(404).json({ error: 'no_image' });
  }

  res.json({
    suspectId,
    profileImageUrl: suspect.profileImageUrl,  // ~16KB Base64 JPEG
    hasImage: true
  });
});
```

#### Frontend (Parallel Loading)
```typescript
// src/client/components/SuspectPanel.tsx
import { useState, useEffect } from 'react';

interface Suspect {
  id: string;
  name: string;
  hasProfileImage: boolean;
}

function SuspectPanel({ suspects }: { suspects: Suspect[] }) {
  const [loadedImages, setLoadedImages] = useState<Record<string, string>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSuspectImagesInParallel();
  }, [suspects]);

  async function loadSuspectImagesInParallel() {
    const imagePromises = suspects
      .filter(s => s.hasProfileImage && !loadedImages[s.id])
      .map(suspect => loadSuspectImage(suspect.id));

    const results = await Promise.allSettled(imagePromises);

    results.forEach((result, index) => {
      const suspectId = suspects[index].id;

      if (result.status === 'fulfilled') {
        setLoadedImages(prev => ({
          ...prev,
          [suspectId]: result.value.profileImageUrl
        }));
      } else {
        console.error(`Failed to load image for ${suspectId}:`, result.reason);
        setImageErrors(prev => ({ ...prev, [suspectId]: true }));
      }
    });
  }

  async function loadSuspectImage(suspectId: string) {
    const response = await fetch(`/api/suspect-image/${suspectId}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  return (
    <div className="suspects">
      {suspects.map(suspect => (
        <SuspectCard
          key={suspect.id}
          suspect={suspect}
          imageUrl={loadedImages[suspect.id]}
          imageError={imageErrors[suspect.id]}
        />
      ))}
    </div>
  );
}

function SuspectCard({ suspect, imageUrl, imageError }) {
  return (
    <div className="suspect-card">
      <div className="suspect-image">
        {!imageUrl && !imageError && (
          <div className="skeleton-loader">Loading...</div>
        )}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={suspect.name}
            className="fade-in"
          />
        )}
        {imageError && (
          <div className="placeholder">
            {suspect.name[0]}
          </div>
        )}
      </div>
      <div className="suspect-info">
        <h3>{suspect.name}</h3>
      </div>
    </div>
  );
}
```

### Performance Metrics

#### Before 2-Stage Loading
```
Initial load: 250KB payload → 500 Error or 5-10 seconds
```

#### After 2-Stage Loading
```
Stage 1 (initial): 8KB → 1-2 seconds ✅
Stage 2 (images):  48KB (3×16KB) → 3-5 seconds (parallel) ✅
Total:             56KB loaded, UI responsive immediately
```

## Image Loading States

### Loading Strategy
```typescript
type ImageLoadState = 'loading' | 'loaded' | 'error' | 'none';

function useImageLoader(suspects: Suspect[]) {
  const [imageStates, setImageStates] = useState<Record<string, ImageLoadState>>(
    Object.fromEntries(suspects.map(s => [s.id, s.hasProfileImage ? 'loading' : 'none']))
  );

  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    suspects.forEach(async suspect => {
      if (suspect.hasProfileImage && imageStates[suspect.id] === 'loading') {
        try {
          const data = await loadImage(suspect.id);
          setImageUrls(prev => ({ ...prev, [suspect.id]: data.profileImageUrl }));
          setImageStates(prev => ({ ...prev, [suspect.id]: 'loaded' }));
        } catch (error) {
          setImageStates(prev => ({ ...prev, [suspect.id]: 'error' }));
        }
      }
    });
  }, [suspects]);

  return { imageStates, imageUrls };
}
```

### UI Components

#### Skeleton Loader
```tsx
function SkeletonImage() {
  return (
    <div className="skeleton animate-pulse">
      <div className="bg-gray-300 w-full h-full rounded-full" />
    </div>
  );
}
```

#### Fade-in Animation
```css
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### Placeholder (fallback)
```tsx
function PlaceholderImage({ name }: { name: string }) {
  return (
    <div className="placeholder bg-gradient-to-br from-blue-400 to-purple-500">
      <span className="text-white text-4xl font-bold">
        {name[0]}
      </span>
    </div>
  );
}
```

## Vercel Image Function (Optional)

For additional optimization, use Vercel Function for image generation + compression:

### Vercel Function
```typescript
// api/generate-image.ts
import { ImageGenerationModel } from '@google-cloud/vertexai';
import sharp from 'sharp';

export default async function handler(req, res) {
  const { prompt, suspectId } = req.body;

  try {
    // Generate image with Imagen 3
    const imageBuffer = await generateImageWithImagen(prompt);

    // Compress with Sharp
    const compressed = await sharp(imageBuffer)
      .resize(400, 400, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const dataUrl = `data:image/jpeg;base64,${compressed.toString('base64')}`;

    res.json({
      suspectId,
      imageUrl: dataUrl,
      size: compressed.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Call from Devvit
```typescript
const vercelImageUrl = await context.settings.get('vercelImageFunctionUrl');

const response = await fetch(vercelImageUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt, suspectId })
});

const data = await response.json();
return data.imageUrl;  // Pre-compressed
```

## Caching Strategy

### Redis Caching
```typescript
// Cache compressed image
async function getCachedImage(suspectId: string): Promise<string | null> {
  return redis.get(`image:${suspectId}`);
}

async function setCachedImage(suspectId: string, imageUrl: string): Promise<void> {
  await redis.set(`image:${suspectId}`, imageUrl, {
    expiration: 86400  // 24 hours
  });
}
```

### Browser Caching
```typescript
// Set cache headers
app.get('/api/suspect-image/:suspectId', async (req, res) => {
  const imageUrl = await loadSuspectImage(suspectId);

  res.set({
    'Cache-Control': 'public, max-age=86400',  // 24 hours
    'ETag': generateETag(imageUrl)
  });

  res.json({ suspectId, profileImageUrl: imageUrl });
});
```

## Error Recovery

### Retry Failed Images
```typescript
async function loadImageWithRetry(
  suspectId: string,
  maxRetries: number = 3
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`/api/suspect-image/${suspectId}`);
      const data = await response.json();
      return data.profileImageUrl;
    } catch (error) {
      console.warn(`Image load attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('Max retries exceeded');
}
```

### Graceful Degradation
```typescript
function SuspectImage({ suspect, imageUrl, error }) {
  if (error) {
    return <PlaceholderImage name={suspect.name} />;
  }

  if (!imageUrl) {
    return <SkeletonImage />;
  }

  return <img src={imageUrl} alt={suspect.name} className="fade-in" />;
}
```

## Best Practices

1. **Always use 2-stage loading** for images in Devvit
2. **Compress all images** with Sharp (JPEG quality 80)
3. **Target size**: 16-20KB per image
4. **Load in parallel**: Use `Promise.allSettled()`
5. **Provide fallbacks**: Skeleton → Placeholder on error
6. **Cache aggressively**: Redis + Browser caching
7. **Monitor payload size**: Keep initial load < 10KB
8. **Test error scenarios**: Simulate failed image loads
