# Image Generation Guide

장소 및 증거 이미지 생성을 위한 Gemini API 활용 가이드입니다.

## Overview

### Image Types

| Type | Size | Style | Usage |
|------|------|-------|-------|
| Location | 1024×768 | Crime scene photography | 장소 탐색 화면 |
| Evidence | 512×512 | Forensic evidence photo | 증거 상세 보기 |

### Quality Standards

- **해상도**: Sharp, high-quality images
- **조명**: Natural, clear lighting
- **스타일 일관성**: 모든 이미지가 동일한 aesthetic 유지
- **내용 적절성**: No graphic violence, 전문적인 범죄 수사 스타일

---

## Location Image Generation

### Basic Location Prompt Template

```typescript
function buildLocationImagePrompt(location: Location, caseContext: {
  timeOfDay: string;
  weather: string;
  crimeType: string;
  mood: string;
}): string {
  return `
Create a crime scene location photograph for a murder mystery investigation.

**Location Details:**
- Name: ${location.name}
- Type: ${location.type}
- Description: ${location.description}

**Context:**
- Time of Day: ${caseContext.timeOfDay}
- Weather: ${caseContext.weather}
- Crime Type: ${caseContext.crimeType}
- Mood: ${caseContext.mood}

**Photography Style:**
- Crime scene documentation aesthetic
- Realistic photographic quality
- Professional investigative photography
- Wide-angle establishing shot (16-35mm equivalent)
- Natural lighting with forensic documentation feel
- Show the entire location clearly
- ${location.type === 'crime_scene' ? 'Yellow police tape visible (optional)' : ''}
- ${location.type === 'crime_scene' ? 'Evidence markers with numbers (optional)' : ''}

**Composition:**
- Horizontal landscape orientation (1024×768)
- Clear depth of field
- Balanced composition
- All important areas visible
- No people in the shot

**DO NOT include:**
- Bodies or corpses
- Graphic violence or excessive blood
- People or investigators
- Unrealistic or fantastical elements
- Text or labels in the image (except evidence markers)
- Cartoon or artistic filters

**Image Requirements:**
- Size: 1024×768 pixels
- Format: PNG or JPEG
- Quality: High (suitable for web display)
- Color: Natural, realistic colors
- Mood: ${caseContext.mood}

Generate a photorealistic crime scene photograph that sets the investigative mood while remaining appropriate for a murder mystery game.
`;
}
```

### Location Type-Specific Prompts

#### Crime Scene (범행 현장)

```typescript
const crimeScenePrompt = `
**Additional Crime Scene Requirements:**

**Evidence Visibility:**
- Subtle signs of struggle (overturned furniture, etc.)
- Evidence should be visible but not graphic
- Focus on forensic details rather than violence
- Crime scene markers (numbered yellow cards) near evidence

**Atmosphere:**
- Tense, investigative mood
- Professional crime scene photography style
- Slight darkness or dramatic lighting (if night scene)
- Cold, clinical feel

**Props:**
- Yellow crime scene tape (optional)
- Evidence markers with numbers
- Forensic equipment (optional)
- Minimal clutter

**Examples:**
- Living room: Overturned chair, spilled wine glass, subtle bloodstain
- Office: Papers scattered, broken lamp, open safe
- Kitchen: Knife block with missing knife, broken dishes, refrigerator door open
`;
```

#### Victim's Residence (피해자 거주지)

```typescript
const victimResidencePrompt = `
**Additional Residence Requirements:**

**Personal Touch:**
- Lived-in, personal atmosphere
- Family photos, personal items visible
- Realistic home interior
- Natural daylight through windows

**Atmosphere:**
- Warm yet somber
- Realistic residential photography
- Attention to personal details
- Slightly messy or disturbed (if crime scene)

**Props:**
- Personal belongings
- Books, photos, decorations
- Furniture with character
- Everyday household items

**Examples:**
- Bedroom: Personal photos on nightstand, open diary, unmade bed
- Study: Books on shelves, papers on desk, computer
- Living room: Family photos, cozy furniture, personal mementos
`;
```

#### Suspect's Location (용의자 관련 장소)

```typescript
const suspectLocationPrompt = `
**Additional Suspect Location Requirements:**

**Character Reflection:**
- Space should reflect suspect's personality
- Professional or personal style evident
- Organized or chaotic (based on character)
- Clues to suspect's lifestyle

**Atmosphere:**
- Mood matches suspect personality:
  - Cold/clinical for calculating suspects
  - Warm/cozy for innocent suspects
  - Dark/suspicious for obvious guilty suspects
  - Professional for work locations

**Props:**
- Items related to suspect's profession
- Personal effects that reveal character
- Potential hiding places for evidence
- Contextual details

**Examples:**
- Suspect's apartment: Personal style, hobby items, living space
- Suspect's office: Work documents, professional tools, desk setup
- Suspect's car: Personal items, trunk, dashboard
`;
```

#### Public Location (공공 장소)

```typescript
const publicLocationPrompt = `
**Additional Public Location Requirements:**

**Public Space Feel:**
- Open, accessible atmosphere
- Multiple sight lines and areas
- Realistic crowd or empty (context-dependent)
- Security elements (cameras, staff)

**Atmosphere:**
- Neutral, observational tone
- Natural or artificial lighting (context-appropriate)
- Professional photography quality
- Documentary style

**Props:**
- Location-specific furnishings
- Security cameras visible (if relevant)
- Signage (minimal text)
- Realistic environmental details

**Examples:**
- Restaurant: Tables, kitchen area, bar, ambient lighting
- Hotel lobby: Front desk, seating area, elevator access
- Park: Benches, trees, walking paths, lighting
- Parking lot: Cars, lighting, security cameras
`;
```

---

## Evidence Image Generation

### Basic Evidence Prompt Template

```typescript
function buildEvidenceImagePrompt(evidence: Evidence, context: {
  location: string;
  relatedSuspect?: string;
  discoveryContext?: string;
}): string {
  return `
Create a forensic evidence photograph for a murder mystery investigation.

**Evidence Details:**
- Name: ${evidence.name}
- Description: ${evidence.description}
- Type: ${evidence.type}
- Found at: ${context.location}
${context.relatedSuspect ? `- Related to: ${context.relatedSuspect}` : ''}
${context.discoveryContext ? `- Context: ${context.discoveryContext}` : ''}

**Photography Style:**
- Forensic evidence documentation
- Close-up, detailed photograph
- Professional crime lab quality
- Clear, sharp focus
- Neutral background (white or gray)
- Even, shadowless lighting
- Evidence tag visible with number

**Composition:**
- Square format (512×512)
- Subject centered
- Fill frame appropriately (not too small, not too large)
- Straight-on perspective or most informative angle
- Top-down view for flat items
- 45-degree angle for 3D objects

**Forensic Elements:**
- Evidence tag with number (e.g., "EVIDENCE #47")
- Scale ruler for size reference (optional)
- White or neutral gray background
- Professional evidence bag (if applicable)
- Clean, clinical presentation

**DO NOT include:**
- Excessive blood or gore
- Body parts
- Faces or identifying features of people
- Unrealistic or fantastical items
- Artistic filters or effects
- Messy or unprofessional presentation

**Image Requirements:**
- Size: 512×512 pixels
- Format: PNG (preferred) or JPEG
- Quality: High definition
- Background: Clean white or neutral gray
- Lighting: Bright, even, professional

Generate a photorealistic forensic evidence photograph suitable for a murder mystery game.
`;
}
```

### Evidence Type-Specific Prompts

#### Physical Evidence (물리적 증거)

```typescript
const physicalEvidencePrompt = `
**Physical Evidence Examples:**

**Weapons:**
- Knife: Clean or with subtle stains, evidence tag, ruler for scale
- Gun: Handgun or revolver, evidence bag, tag
- Blunt object: Baseball bat, candlestick, heavy object

**Prompt Example (Knife):**
"A kitchen knife on white background, forensic evidence photograph, slight staining on blade, evidence tag #23, ruler for scale, professional crime lab photography, sharp focus, even lighting, top-down view"

**Clothing:**
- Shirt with stain
- Gloves
- Shoes with mud or blood

**Prompt Example (Gloves):**
"A pair of black leather gloves in evidence bag, forensic photograph, white background, evidence tag #15, professional documentation, clear plastic evidence bag, sharp focus"

**Objects:**
- Wine glass
- Letter or document
- Key
- Watch

**Prompt Example (Wine Glass):**
"A wine glass with red wine residue, forensic evidence photograph, white background, evidence tag #08, fingerprint dusting visible, professional crime lab quality, 45-degree angle view"
`;
```

#### Digital Evidence (디지털 증거)

```typescript
const digitalEvidencePrompt = `
**Digital Evidence Examples:**

**Documents:**
- Letter (handwritten or typed)
- Contract
- Email printout
- Receipt

**Prompt Example (Letter):**
"A threatening letter on white paper, forensic document photograph, neutral gray background, evidence tag #31, ruler for scale, professional documentation, clear text visible, top-down view, sharp focus"

**Electronic Devices:**
- Phone screenshot
- Computer file printout
- USB drive
- Memory card

**Prompt Example (USB Drive):**
"A USB flash drive on white background, forensic evidence photograph, evidence tag #19, ruler for scale, professional crime lab quality, top-down view, clear branding visible"

**Records:**
- Bank statement
- Phone records
- Purchase history
- CCTV screenshot

**Prompt Example (Bank Statement):**
"A bank transaction record printout, forensic document photograph, white background, evidence tag #42, relevant transactions highlighted, professional documentation quality"
`;
```

#### Biological Evidence (생물학적 증거)

```typescript
const biologicalEvidencePrompt = `
**Biological Evidence Examples:**

**Note:** Keep biological evidence subtle and non-graphic

**DNA Samples:**
- Hair strand
- Swab in evidence bag
- Test tube with label

**Prompt Example (Hair):**
"A single hair strand in clear evidence bag, forensic photograph, white background, evidence tag #56, ruler for scale, professional crime lab quality, macro photography, sharp focus"

**Substances:**
- Liquid sample
- Powder sample
- Pill or medication

**Prompt Example (Poison):**
"A small bottle of white powder labeled 'Cyanide', forensic evidence photograph, evidence bag, white background, evidence tag #11, professional crime lab documentation, warning label visible"

**Trace Evidence:**
- Fiber
- Soil sample
- Glass fragment

**Prompt Example (Glass):**
"Glass shards in clear evidence bag, forensic photograph, white background, evidence tag #29, ruler for scale, professional documentation, sharp focus on fragments"
`;
```

#### Circumstantial Evidence (정황 증거)

```typescript
const circumstantialEvidencePrompt = `
**Circumstantial Evidence Examples:**

**Financial:**
- Credit card
- Cash
- Check
- Invoice

**Prompt Example (Credit Card):**
"A credit card on white background, forensic evidence photograph, evidence tag #33, slightly blurred numbers for privacy, professional documentation, top-down view"

**Personal Items:**
- Watch
- Jewelry
- Wallet
- Keys

**Prompt Example (Watch):**
"A luxury wristwatch on white background, forensic evidence photograph, evidence tag #07, ruler for scale, professional documentation, 45-degree angle, broken glass on face"

**Written Materials:**
- Diary entry
- Calendar
- Note
- Map

**Prompt Example (Diary):**
"An open diary page with handwritten text, forensic document photograph, neutral background, evidence tag #52, relevant passage visible, professional documentation quality"
`;
```

---

## Image Generation Workflow

### Step-by-Step Process

```typescript
async function generateEvidenceSystemImages(
  case: Case,
  difficulty: Difficulty
): Promise<ImageGenerationResult> {
  const results = {
    locations: [] as LocationImage[],
    evidence: [] as EvidenceImage[],
    errors: [] as string[]
  };

  // Step 1: Generate location images
  console.log('Generating location images...');
  for (const location of case.locations) {
    try {
      const prompt = buildLocationImagePrompt(location, case.context);
      const imageUrl = await generateImageWithGemini(prompt, {
        width: 1024,
        height: 768,
        format: 'png'
      });

      // Validate image
      const validation = await validateImage(imageUrl, 'location');
      if (!validation.isValid) {
        throw new Error(`Location image validation failed: ${validation.errors.join(', ')}`);
      }

      results.locations.push({
        locationId: location.id,
        imageUrl,
        generatedAt: new Date()
      });

      console.log(`✅ Generated image for ${location.name}`);
    } catch (error) {
      console.error(`❌ Failed to generate image for ${location.name}:`, error);
      results.errors.push(`Location ${location.id}: ${error.message}`);
    }
  }

  // Step 2: Generate evidence images
  console.log('Generating evidence images...');
  for (const evidence of case.evidence) {
    try {
      const location = case.locations.find(l => l.id === evidence.foundAt);
      const prompt = buildEvidenceImagePrompt(evidence, {
        location: location?.name || 'Unknown',
        relatedSuspect: evidence.relatedSuspect
      });

      const imageUrl = await generateImageWithGemini(prompt, {
        width: 512,
        height: 512,
        format: 'png'
      });

      // Validate image
      const validation = await validateImage(imageUrl, 'evidence');
      if (!validation.isValid) {
        throw new Error(`Evidence image validation failed: ${validation.errors.join(', ')}`);
      }

      results.evidence.push({
        evidenceId: evidence.id,
        imageUrl,
        generatedAt: new Date()
      });

      console.log(`✅ Generated image for ${evidence.name}`);
    } catch (error) {
      console.error(`❌ Failed to generate image for ${evidence.name}:`, error);
      results.errors.push(`Evidence ${evidence.id}: ${error.message}`);
    }
  }

  return results;
}
```

### Error Handling and Retry Strategy

```typescript
async function generateImageWithRetry(
  prompt: string,
  options: ImageGenerationOptions,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}...`);

      const imageUrl = await generateImageWithGemini(prompt, options);

      // Validate immediately
      const validation = await validateImage(imageUrl, options.type);
      if (validation.isValid) {
        return imageUrl;
      }

      // If validation failed, throw error to retry
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);

    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
      }
    }
  }

  throw new Error(`Image generation failed after ${maxRetries} attempts: ${lastError.message}`);
}
```

---

## Image Validation

### Validation Criteria

```typescript
interface ImageValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    dimensionsCorrect: boolean;
    fileSizeOk: boolean;
    formatCorrect: boolean;
  };
}

async function validateImage(
  imageUrl: string,
  type: 'location' | 'evidence'
): Promise<ImageValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Dimensions check
  const expectedDimensions = type === 'location'
    ? { width: 1024, height: 768 }
    : { width: 512, height: 512 };

  const dimensions = await getImageDimensions(imageUrl);
  const dimensionsCorrect =
    dimensions.width === expectedDimensions.width &&
    dimensions.height === expectedDimensions.height;

  if (!dimensionsCorrect) {
    errors.push(
      `Incorrect dimensions: ${dimensions.width}×${dimensions.height} ` +
      `(expected ${expectedDimensions.width}×${expectedDimensions.height})`
    );
  }

  // 2. File size check
  const fileSize = await getImageFileSize(imageUrl);
  const minSize = type === 'location' ? 100000 : 50000; // 100KB / 50KB
  const maxSize = type === 'location' ? 2000000 : 1000000; // 2MB / 1MB

  const fileSizeOk = fileSize >= minSize && fileSize <= maxSize;

  if (fileSize < minSize) {
    warnings.push(`File size too small: ${fileSize} bytes (min ${minSize})`);
  } else if (fileSize > maxSize) {
    errors.push(`File size too large: ${fileSize} bytes (max ${maxSize})`);
  }

  // 3. Format check
  const format = await getImageFormat(imageUrl);
  const formatCorrect = format === 'png' || format === 'jpeg';

  if (!formatCorrect) {
    errors.push(`Incorrect format: ${format} (expected png or jpeg)`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      dimensionsCorrect,
      fileSizeOk,
      formatCorrect
    }
  };
}
```

### Quality Checks

```typescript
interface QualityMetrics {
  sharpness: number;      // 0-1
  brightness: number;     // 0-1
  contrast: number;       // 0-1
  colorBalance: number;   // 0-1
}

async function checkImageQuality(imageUrl: string): Promise<QualityMetrics> {
  // TODO: Implement image quality analysis
  // Can use computer vision APIs or libraries

  return {
    sharpness: 0.8,
    brightness: 0.7,
    contrast: 0.75,
    colorBalance: 0.85
  };
}
```

---

## Prompt Optimization Strategies

### Negative Prompts

```typescript
const COMMON_NEGATIVE_PROMPTS = {
  location: [
    'people', 'bodies', 'corpses', 'faces',
    'excessive blood', 'gore', 'graphic violence',
    'cartoon', 'anime', 'drawing', 'painting',
    'text', 'labels', 'watermarks',
    'unrealistic', 'fantasy', 'sci-fi',
    'low quality', 'blurry', 'distorted'
  ],

  evidence: [
    'people', 'hands', 'body parts',
    'excessive blood', 'gore',
    'messy', 'unprofessional',
    'cartoon', 'drawing', 'artistic',
    'complex background', 'cluttered',
    'low resolution', 'pixelated', 'blurry'
  ]
};

function buildPromptWithNegatives(
  basePrompt: string,
  type: 'location' | 'evidence'
): string {
  const negatives = COMMON_NEGATIVE_PROMPTS[type].join(', ');
  return `${basePrompt}\n\n**Negative Prompt (avoid these):**\n${negatives}`;
}
```

### Style Consistency Keywords

```typescript
const STYLE_KEYWORDS = {
  location: [
    'photorealistic',
    'crime scene photography',
    'professional documentary style',
    'forensic documentation',
    'wide-angle lens',
    'natural lighting',
    'investigative atmosphere'
  ],

  evidence: [
    'forensic photography',
    'professional crime lab',
    'macro photography',
    'clean documentation',
    'evidence documentation standard',
    'neutral background',
    'even lighting'
  ]
};
```

---

## Storage and Delivery

### Image Storage Strategy

```typescript
interface ImageStorageConfig {
  provider: 'supabase' | 'vercel-blob' | 's3';
  bucket: string;
  pathPattern: string;
  cdnEnabled: boolean;
}

const STORAGE_CONFIG: ImageStorageConfig = {
  provider: 'supabase',
  bucket: 'case-images',
  pathPattern: '{caseId}/{type}/{id}.png',
  cdnEnabled: true
};

async function uploadAndStoreImage(
  imageData: Buffer,
  metadata: {
    caseId: string;
    type: 'location' | 'evidence';
    id: string;
  }
): Promise<string> {
  const path = STORAGE_CONFIG.pathPattern
    .replace('{caseId}', metadata.caseId)
    .replace('{type}', metadata.type)
    .replace('{id}', metadata.id);

  const publicUrl = await uploadToSupabase(
    imageData,
    path,
    STORAGE_CONFIG.bucket
  );

  return publicUrl;
}
```

### Image Optimization

```typescript
async function optimizeImage(
  imageUrl: string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'png' | 'jpeg' | 'webp';
  }
): Promise<Buffer> {
  // Using Sharp library for optimization
  const imageBuffer = await fetchImageBuffer(imageUrl);

  const optimized = await sharp(imageBuffer)
    .resize(options.maxWidth, options.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .toFormat(options.format || 'png', {
      quality: options.quality || 85
    })
    .toBuffer();

  return optimized;
}
```

---

## Best Practices

1. **Prompt Clarity**: 명확하고 구체적인 프롬프트 작성
2. **Consistency**: 모든 이미지에 동일한 스타일 키워드 사용
3. **Validation**: 생성 즉시 검증하여 재생성 여부 결정
4. **Retry Logic**: 실패 시 최대 3회 재시도
5. **Error Handling**: 이미지 생성 실패 시 대체 이미지 사용
6. **Performance**: 이미지 생성 및 업로드 병렬 처리
7. **Storage**: 생성된 이미지 영구 저장 및 CDN 활용
8. **Quality**: 저품질 이미지는 자동 재생성

---

## Troubleshooting

### 문제 1: 이미지에 텍스트가 포함됨

**원인**: Gemini가 프롬프트를 잘못 해석

**해결**:
```typescript
const fixedPrompt = basePrompt + `
\n\n**IMPORTANT: Do NOT include any text, labels, or words in the image. The image should be purely visual without any readable text except for evidence tag numbers.**
`;
```

### 문제 2: 이미지 품질이 낮음

**원인**: 프롬프트에 품질 지시어 부족

**해결**:
```typescript
const qualityPrompt = basePrompt + `
\n\n**Quality Requirements:**
- High resolution (sharp, detailed)
- Professional photography quality
- Clear focus and depth of field
- Proper exposure and lighting
- Photorealistic rendering
`;
```

### 문제 3: 스타일이 일관되지 않음

**원인**: 각 프롬프트마다 다른 스타일 키워드 사용

**해결**:
```typescript
// 모든 프롬프트에 공통 스타일 키워드 추가
const styleKeywords = STYLE_KEYWORDS[type].join(', ');
const consistentPrompt = `${basePrompt}\n\n**Style: ${styleKeywords}**`;
```

### 문제 4: Gemini API 실패 또는 타임아웃

**원인**: API 제한, 네트워크 문제, 또는 복잡한 프롬프트

**해결**:
```typescript
// 재시도 로직 with exponential backoff
async function generateWithRetry(prompt: string, maxRetries: number = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateImageWithGemini(prompt);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

---

**참조**:
- `SKILL.md` - Evidence System Architect
- `evidence-types.md` - 증거 타입 라이브러리
- `location-props.md` - 장소 소품 라이브러리
- Gemini API Documentation
- Sharp Image Processing Library
