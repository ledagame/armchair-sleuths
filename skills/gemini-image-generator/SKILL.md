---
name: gemini-image-generator
description: Generate consistent, high-quality images using Gemini API with optimized prompts for suspects, locations, and evidence. This skill should be used when generating case images, suspect profiles, or batch image operations. Handles prompt templates, style consistency, and automatic retry logic.
---

# Gemini Image Generator

## Overview

This skill generates consistent, high-quality images using Gemini API, optimized for suspect profiles, case scenes, and evidence images in the Armchair Sleuths mystery game.

## When to Use This Skill

**This skill should be used when:**
- Generating images: "이미지 생성" / "Generate images"
- Creating suspect profile images: "용의자 프로필 이미지" / "Suspect profile images"
- Creating case scene images: "케이스 씬 이미지" / "Case scene image"
- Batch generating images: "배치 이미지 생성" / "Batch generate images"
- Regenerating images: "이미지 재생성" / "Regenerate images"

## Core Features

### 1. Three Image Types

**Suspect Profile Images (512x512)**
- Professional portrait photography style
- Cinematic lighting, shallow depth of field
- Focus on face and upper shoulders
- Photorealistic, high detail

**Case Scene Images (512x512)**
- Crime scene illustration style
- Dark, moody atmospheric lighting
- No text, no people visible
- Detective game art style

**Evidence Images (512x512)**
- Close-up forensic photography style
- Dramatic lighting, sharp detail
- Professional crime scene photography
- High texture visibility

See `references/prompt-templates.md` for complete prompt structures.

### 2. Style Consistency

All images maintain consistent visual style:
- Dark backgrounds for suspect profiles
- Moody, limited color palette for scenes
- High contrast for evidence photography
- Professional, cinematic quality throughout

See `references/style-guide.md` for detailed style guidelines and keywords.

### 3. Batch Generation

Sequential image generation with built-in rate limit handling:
- Automatic retry logic (max 3 attempts)
- Progress tracking
- Error handling and reporting
- Exponential backoff for failures

See `references/batch-operations.md` for batch operation details.

## Quick Start

### Generate Suspect Profile Image

```bash
npx tsx scripts/generate-suspect-image.ts \
  --suspect-id suspect-1 \
  --name "Marcus Chen" \
  --archetype "Wealthy Heir"
```

### Generate Case Scene Image

```bash
npx tsx scripts/generate-scene-image.ts \
  --location "Victorian Mansion" \
  --atmosphere "dark, mysterious"
```

### Batch Generate All Images for Case

```bash
npx tsx scripts/batch-generate-images.ts \
  --case-id case-2025-01-19 \
  --type all
```

### Regenerate Missing Images

```bash
npx tsx scripts/regenerate-missing-images.ts \
  --scan-all \
  --fix
```

## Integration with Project

```
armchair-sleuths/
├── skills/gemini-image-generator/
├── scripts/
│   ├── batch-generate-images.ts
│   └── regenerate-missing-images.ts
├── src/server/services/
│   └── ImageGenerator.ts
└── package.json
```

**Recommended npm scripts:**
```json
{
  "scripts": {
    "image:batch": "tsx scripts/batch-generate-images.ts",
    "image:fix": "tsx scripts/regenerate-missing-images.ts --scan-all --fix"
  }
}
```

## Skill Dependencies

- **mystery-case-generator**: Provides case and suspect data for image generation
- **Gemini API**: Image generation service

## References

For detailed information, see the references directory:

- **prompt-templates.md**: Complete prompt structures for all image types
- **style-guide.md**: Lighting styles, art styles, mood keywords, and color palettes
- **batch-operations.md**: Batch generation workflows and configuration
- **image-prompt-library.md**: Reusable prompt components and examples
