# Devvit Scheduler-Based Image Generation System
## Implementation Task Breakdown

---

**Version**: 1.0
**Created**: 2025-10-22
**Status**: 🟡 Planning Complete - Ready for Implementation
**Total Tasks**: 45
**Estimated Duration**: 24-30 hours
**Priority**: 🔴 Critical (blocks production deployment)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Phase 0: Preparation](#phase-0-preparation) (5 tasks, ~4 hours)
4. [Phase 1: Foundation Layer](#phase-1-foundation-layer) (9 tasks, ~6 hours)
5. [Phase 2: Core Service Layer](#phase-2-core-service-layer) (8 tasks, ~5 hours)
6. [Phase 3: API Integration Layer](#phase-3-api-integration-layer) (6 tasks, ~3 hours)
7. [Phase 4: Refactoring & Integration](#phase-4-refactoring--integration) (7 tasks, ~4 hours)
8. [Phase 5: Cleanup & Optimization](#phase-5-cleanup--optimization) (4 tasks, ~2 hours)
9. [Phase 6: Testing & Validation](#phase-6-testing--validation) (4 tasks, ~3 hours)
10. [Phase 7: Documentation & Deployment](#phase-7-documentation--deployment) (2 tasks, ~1 hour)
11. [Appendices](#appendices)
12. [Progress Tracking](#progress-tracking)

---

## Executive Summary

### Problem Statement

The current image generation system faces two critical blockers:

1. **PERMISSION_DENIED Error**: Vercel domain calls from Devvit fail with `7 PERMISSION_DENIED` despite HTTP permissions configuration
   - Root cause: Domain requests require Reddit approval with unknown timeline
   - Previous Vercel attempts also failed (user warning validated)

2. **Timeout Issues**: Direct Gemini API calls during case creation hit timeout limits
   - Current result: Only ~3 images generated out of 15+ required
   - Bottleneck: Synchronous image generation in request handler

### Solution Architecture

**Devvit Scheduler-Based Background Image Generation**

Key components:
- ✅ **No timeout limits**: Scheduler jobs run independently
- ✅ **Already whitelisted**: Gemini API (`generativelanguage.googleapis.com`) in global allowlist
- ✅ **Dual-mode operation**: Manual trigger (development) + cron (production)
- ✅ **Progress tracking**: Redis-based status monitoring for UI feedback

### Migration Strategy

**Two-Phase Approach**:
1. **Phase 1**: Quick case metadata creation (< 2 seconds)
2. **Phase 2**: Background image generation (scheduler job, no timeout)

**Development Workflow**:
- Manual trigger via Menu Item for immediate testing
- Automatic cron trigger for production (midnight UTC)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Armchair Sleuths System                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐      ┌──────────────────────────────┐   │
│  │  Menu Item    │──1──▶│  POST /menu/generate-images  │   │
│  │  (Manual)     │      └────────────┬─────────────────┘   │
│  └───────────────┘                   │                       │
│                                       │                       │
│  ┌───────────────┐                   │                       │
│  │  Cron Job     │──2──▶             ▼                       │
│  │  (0 0 * * *)  │      ┌──────────────────────────────┐   │
│  └───────────────┘      │  scheduler.runJob()          │   │
│                          │  - name: generate-case-images│   │
│                          │  - data: { caseId }          │   │
│                          │  - runAt: Date / cron        │   │
│                          └────────────┬─────────────────┘   │
│                                       │                       │
│                                       ▼                       │
│                          ┌──────────────────────────────┐   │
│                          │  Scheduler Job Handler       │   │
│                          │  /scheduler/generate-images  │   │
│                          └────────────┬─────────────────┘   │
│                                       │                       │
│                                       ▼                       │
│                 ┌──────────────────────────────────────┐    │
│                 │ ImageGenerationSchedulerService      │    │
│                 │                                       │    │
│                 │  generateCaseImages(caseId)          │    │
│                 │  ├─ generateLocationImages()         │    │
│                 │  ├─ generateSuspectImages()          │    │
│                 │  └─ generateEvidenceImages()         │    │
│                 └──────────┬────────────────┬──────────┘    │
│                            │                │                │
│                            ▼                ▼                │
│               ┌─────────────────┐  ┌──────────────────┐    │
│               │ GeminiClient    │  │ StatusService    │    │
│               │ (Whitelisted)   │  │ (Redis KV)       │    │
│               │                 │  │                  │    │
│               │ generateImage() │  │ updateProgress() │    │
│               └─────────────────┘  │ saveImageUrl()   │    │
│                                     │ getStatus()      │    │
│                                     └──────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Client Polling                           │  │
│  │  GET /api/image-status/:caseId                        │  │
│  │  { status, progress: {current: 7, total: 15}, ... }  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Case Creation** (POST /api/case/create)
   - Generate case metadata only (no images)
   - Store in Redis via CaseRepository
   - Trigger scheduler job with caseId

2. **Scheduler Job Execution** (/internal/scheduler/generate-case-images)
   - Initialize status tracking
   - Generate images sequentially (location → suspect → evidence)
   - Update progress after each image
   - Save image URLs to case data
   - Mark status as completed/failed

3. **Client Status Polling** (GET /api/image-status/:caseId)
   - Client polls every 2-3 seconds
   - Displays progress: "Generating images... 7/15"
   - Shows images as they become available

### Redis Schema

#### Image Generation Status
```typescript
Key: `image-generation-status:${caseId}`
Value: {
  status: 'pending' | 'generating' | 'completed' | 'failed',
  progress: { current: number, total: number },
  images: {
    locations: string[],
    suspects: string[],
    evidence: string[]
  },
  startedAt: number,
  completedAt?: number,
  errors?: Array<{
    type: 'location' | 'suspect' | 'evidence',
    index: number,
    message: string
  }>
}
```

---

## Phase 0: Preparation

**Duration**: ~4 hours
**Priority**: 🔴 Critical
**Goal**: Establish baseline, create safe development environment, document rollback procedures

### Success Criteria
- [ ] Current implementation fully documented
- [ ] Baseline performance metrics recorded
- [ ] Feature branch created with protection rules
- [ ] Test environment configured
- [ ] Rollback plan approved

### Risk Assessment
- **Risk Level**: Low
- **Mitigation**: No code changes in this phase

---

### Task 0.1: Review Project Documentation

**Duration**: 1 hour
**Priority**: 🔴 Critical
**Dependencies**: None
**Status**: ⏳ IN PROGRESS

#### Acceptance Criteria
- [x] Read `게임전체프로세스.md` (1788 lines)
- [x] Read `완벽게임구현상태.md` (500 lines)
- [ ] Save complete task breakdown as document
- [ ] Document current image generation flow with sequence diagram
- [ ] Identify all integration points (Gemini, Vercel, Redis)
- [ ] List all files that will be modified

#### Files to Review
- `src/server/services/case/CaseGeneratorService.ts`
- `src/server/services/gemini/GeminiClient.ts`
- `src/server/services/generators/ImageGenerator.ts`
- `src/server/index.ts`
- `devvit.json`

#### Deliverable
- Documentation summary in `docs/current-implementation-analysis.md`

---

### Task 0.2: Baseline Performance Measurement

**Duration**: 1 hour
**Priority**: 🟡 High
**Dependencies**: Task 0.1

#### Acceptance Criteria
- [ ] Measure current case generation time
- [ ] Count successful image generations before timeout
- [ ] Record Redis operations per case
- [ ] Document API call patterns to Gemini
- [ ] Establish performance improvement targets

#### Testing Strategy
```bash
# Run 5 case generations and record metrics
npm run test:performance -- --cases=5 --log=detailed
```

#### Deliverable
- Performance baseline report with:
  - Average case generation time: ~14 seconds
  - Images generated before timeout: ~3 out of 15
  - Target post-migration: 15/15 images, < 5 min total

---

### Task 0.3: Create Feature Branch

**Duration**: 15 minutes
**Priority**: 🔴 Critical
**Dependencies**: Task 0.1

#### Acceptance Criteria
- [ ] Branch created: `feature/scheduler-image-generation`
- [ ] Branch protection rules configured
- [ ] Base branch set to `main`
- [ ] PR template updated with migration checklist

#### Commands
```bash
git checkout main
git pull origin main
git checkout -b feature/scheduler-image-generation
git push -u origin feature/scheduler-image-generation
```

---

### Task 0.4: Set Up Test Environment

**Duration**: 1 hour
**Priority**: 🟡 High
**Dependencies**: Task 0.3

#### Acceptance Criteria
- [ ] Test subreddit confirmed: `armchair_sleuths_dev`
- [ ] Gemini API key configured in test environment
- [ ] Redis KV store accessible
- [ ] Test moderator account configured
- [ ] Menu items visible in test subreddit

#### Verification
```bash
devvit upload --subreddit armchair_sleuths_dev
# Navigate to subreddit, verify menu items appear
```

---

### Task 0.5: Document Rollback Plan

**Duration**: 30 minutes
**Priority**: 🟡 High
**Dependencies**: Task 0.1, 0.2

#### Acceptance Criteria
- [ ] Rollback procedure documented step-by-step
- [ ] Data migration rollback strategy defined
- [ ] Backup points identified
- [ ] Emergency contacts listed
- [ ] Decision criteria for rollback documented

#### Deliverable
- `docs/rollback-plan.md` with:
  - Git revert commands
  - Redis data restoration procedures
  - Devvit redeployment steps
  - Communication plan for users

---

## Phase 1: Foundation Layer

**Duration**: ~6 hours
**Priority**: 🔴 Critical
**Goal**: Create type-safe foundations for image generation tracking and status management

### Success Criteria
- [ ] All TypeScript interfaces compile without errors
- [ ] Redis schema documented and validated
- [ ] Unit tests pass for utility functions
- [ ] No breaking changes to existing code

### Risk Assessment
- **Risk Level**: Low-Medium
- **Mitigation**: No integration with existing services yet

---

### Task 1.1: Define ImageGenerationStatus Interface

**Duration**: 30 minutes
**Priority**: 🔴 Critical
**Dependencies**: None

#### Acceptance Criteria
- [ ] TypeScript interface created and exported
- [ ] All fields documented with JSDoc comments
- [ ] Enum types defined for status and error types
- [ ] Interface validates against expected Redis schema
- [ ] No TypeScript compilation errors

#### File to Create
`src/server/types/ImageGeneration.ts`

#### Code
```typescript
/**
 * Status of background image generation for a case
 */
export interface ImageGenerationStatus {
  /** Current generation status */
  status: 'pending' | 'generating' | 'completed' | 'failed';

  /** Progress tracking */
  progress: {
    current: number;
    total: number;
  };

  /** Generated image URLs organized by type */
  images: {
    locations: string[];
    suspects: string[];
    evidence: string[];
  };

  /** Generation start timestamp (Unix ms) */
  startedAt: number;

  /** Generation completion timestamp (Unix ms) */
  completedAt?: number;

  /** Error tracking for failed individual images */
  errors?: Array<{
    type: 'location' | 'suspect' | 'evidence';
    index: number;
    message: string;
  }>;
}

/**
 * Configuration for image generation job
 */
export interface ImageGenerationJobData {
  caseId: string;
  requestedBy?: string; // For manual triggers
  priority?: 'high' | 'normal';
}
```

#### Testing Strategy
```typescript
// src/server/types/__tests__/ImageGeneration.test.ts
import { ImageGenerationStatus } from '../ImageGeneration';

test('ImageGenerationStatus type validation', () => {
  const status: ImageGenerationStatus = {
    status: 'generating',
    progress: { current: 5, total: 15 },
    images: { locations: [], suspects: [], evidence: [] },
    startedAt: Date.now()
  };

  expect(status).toBeDefined();
});
```

---

### Task 1.2: Create ImageGenerationStatusService Foundation

**Duration**: 1 hour
**Priority**: 🔴 Critical
**Dependencies**: Task 1.1

#### Acceptance Criteria
- [ ] Service class structure created
- [ ] Redis key naming conventions defined
- [ ] All CRUD method signatures defined
- [ ] Error handling patterns established
- [ ] No Redis operations implemented yet (stubs only)

#### File to Create
`src/server/services/images/ImageGenerationStatusService.ts`

#### Code
```typescript
import { RedisClient } from '@devvit/redis';
import { ImageGenerationStatus } from '../../types/ImageGeneration';

/**
 * Service for tracking image generation progress in Redis
 */
export class ImageGenerationStatusService {
  private redis: RedisClient;
  private readonly KEY_PREFIX = 'image-generation-status';

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  /**
   * Generate Redis key for case image generation status
   */
  private getKey(caseId: string): string {
    return `${this.KEY_PREFIX}:${caseId}`;
  }

  /**
   * Initialize status tracking for a new case
   */
  async initStatus(caseId: string, totalImages: number): Promise<void> {
    // Stub - to be implemented in Task 2.1
  }

  /**
   * Update overall generation status
   */
  async updateStatus(
    caseId: string,
    status: ImageGenerationStatus['status'],
    error?: string
  ): Promise<void> {
    // Stub - to be implemented in Task 2.2
  }

  /**
   * Increment progress counter atomically
   */
  async updateProgress(caseId: string, increment: number = 1): Promise<void> {
    // Stub - to be implemented in Task 2.3
  }

  /**
   * Save generated image URL to appropriate array
   */
  async saveImageUrl(
    caseId: string,
    type: 'location' | 'suspect' | 'evidence',
    url: string
  ): Promise<void> {
    // Stub - to be implemented in Task 2.4
  }

  /**
   * Retrieve current generation status
   */
  async getStatus(caseId: string): Promise<ImageGenerationStatus | null> {
    // Stub - to be implemented in Task 2.5
  }

  /**
   * Record error for a specific image
   */
  async recordError(
    caseId: string,
    type: 'location' | 'suspect' | 'evidence',
    index: number,
    message: string
  ): Promise<void> {
    // Stub - to be implemented in Task 2.6
  }

  /**
   * Clean up completed status (optional, for storage management)
   */
  async deleteStatus(caseId: string): Promise<void> {
    // Stub - to be implemented in Task 5.2
  }
}
```

---

### Task 1.3: Create ImageGenerationSchedulerService Foundation

**Duration**: 1 hour
**Priority**: 🔴 Critical
**Dependencies**: Task 1.1

#### Acceptance Criteria
- [ ] Service class structure created
- [ ] Method signatures for image generation defined
- [ ] Dependencies injected (GeminiClient, CaseRepository)
- [ ] Error handling patterns established
- [ ] No image generation logic implemented yet (stubs)

#### File to Create
`src/server/services/images/ImageGenerationSchedulerService.ts`

#### Code
```typescript
import { GeminiClient } from '../gemini/GeminiClient';
import { CaseRepository } from '../repositories/kv/CaseRepository';
import { ImageGenerationStatusService } from './ImageGenerationStatusService';

/**
 * Service for orchestrating background image generation via scheduler
 */
export class ImageGenerationSchedulerService {
  constructor(
    private geminiClient: GeminiClient,
    private caseRepository: typeof CaseRepository,
    private statusService: ImageGenerationStatusService
  ) {}

  /**
   * Main entry point: Generate all images for a case
   */
  async generateCaseImages(caseId: string): Promise<void> {
    // Stub - to be implemented in Task 2.7
  }

  /**
   * Generate images for all locations
   */
  private async generateLocationImages(
    caseId: string,
    locations: any[]
  ): Promise<void> {
    // Stub - to be implemented in Task 2.8
  }

  /**
   * Generate profile images for all suspects
   */
  private async generateSuspectImages(
    caseId: string,
    suspects: any[]
  ): Promise<void> {
    // Stub - to be implemented in Task 2.9
  }

  /**
   * Generate images for evidence items
   */
  private async generateEvidenceImages(
    caseId: string,
    evidence: any[]
  ): Promise<void> {
    // Stub - to be implemented in Task 2.10
  }

  /**
   * Build image generation prompt for location
   */
  private buildLocationImagePrompt(location: any): string {
    // Stub - to be implemented in Task 2.8
    return '';
  }

  /**
   * Build image generation prompt for suspect
   */
  private buildSuspectImagePrompt(suspect: any): string {
    // Stub - to be implemented in Task 2.9
    return '';
  }

  /**
   * Build image generation prompt for evidence
   */
  private buildEvidenceImagePrompt(evidence: any): string {
    // Stub - to be implemented in Task 2.10
    return '';
  }
}
```

---

### Task 1.4: Add Scheduler Configuration to devvit.json

**Duration**: 30 minutes
**Priority**: 🔴 Critical
**Dependencies**: None

#### Acceptance Criteria
- [ ] Scheduler tasks defined in devvit.json
- [ ] Endpoint paths specified
- [ ] Cron expression configured for daily generation
- [ ] Manual trigger menu item added
- [ ] JSON validates against Devvit schema

#### File to Modify
`devvit.json`

#### Changes
```json
{
  "scheduler": {
    "tasks": {
      "generate-case-images": {
        "endpoint": "/internal/scheduler/generate-case-images"
      },
      "daily-case-generation": {
        "endpoint": "/internal/scheduler/daily-case",
        "cron": "0 0 * * *"
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
        "label": "🎨 Generate Images Now (Dev)",
        "description": "Manually trigger image generation for latest case",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/generate-images-manual"
      },
      {
        "label": "🧪 Test Media Upload API",
        "description": "Run validation tests for context.media.upload()",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/test-media-upload"
      }
    ]
  }
}
```

---

### Task 1.5: Define CaseRepository Update Methods

**Duration**: 45 minutes
**Priority**: 🔴 Critical
**Dependencies**: None

#### Acceptance Criteria
- [ ] Method signatures added to CaseRepository
- [ ] JSDoc documentation complete
- [ ] Type safety enforced for image URLs
- [ ] Atomic update patterns defined
- [ ] No implementation yet (stubs)

#### File to Modify
`src/server/services/repositories/kv/CaseRepository.ts`

#### Changes
```typescript
export class CaseRepository {
  // ... existing methods ...

  /**
   * Update location image URL by index
   */
  static async updateLocationImage(
    caseId: string,
    index: number,
    imageUrl: string
  ): Promise<void> {
    // Stub - to be implemented in Task 3.1
  }

  /**
   * Update suspect profile image URL by index
   */
  static async updateSuspectImage(
    caseId: string,
    index: number,
    imageUrl: string
  ): Promise<void> {
    // Stub - to be implemented in Task 3.2
  }

  /**
   * Update evidence image URL by index
   */
  static async updateEvidenceImage(
    caseId: string,
    index: number,
    imageUrl: string
  ): Promise<void> {
    // Stub - to be implemented in Task 3.3
  }

  /**
   * Retrieve the most recently created case
   */
  static async getLatestCase(): Promise<CaseData | null> {
    // Stub - to be implemented in Task 3.4
  }
}
```

---

### Task 1.6: Create Scheduler Endpoint Stubs

**Duration**: 1 hour
**Priority**: 🟡 High
**Dependencies**: Task 1.4

#### Acceptance Criteria
- [ ] Endpoint routes defined in index.ts
- [ ] Request/response types documented
- [ ] Error handling middleware applied
- [ ] Logging framework integrated
- [ ] Endpoints return 501 Not Implemented (temporary)

#### File to Modify
`src/server/index.ts`

#### Changes
```typescript
// Add after existing routes

/**
 * Scheduler job handler: Generate all images for a case
 */
router.post('/internal/scheduler/generate-case-images', async (req, res) => {
  console.log('🎨 Scheduler job triggered: generate-case-images');

  try {
    const { caseId } = req.body.data as { caseId: string };

    if (!caseId) {
      return res.status(400).json({ error: 'Missing caseId' });
    }

    // TODO: Implement in Task 3.5
    return res.status(501).json({
      status: 'not_implemented',
      message: 'Image generation not yet implemented'
    });

  } catch (error) {
    console.error('❌ Scheduler job failed:', error);
    return res.status(500).json({ error: String(error) });
  }
});

/**
 * Manual trigger menu: Generate images for latest case
 */
router.post('/internal/menu/generate-images-manual', async (req, res) => {
  console.log('🎨 Manual image generation triggered');

  try {
    // TODO: Implement in Task 3.6
    return res.status(501).json({
      status: 'not_implemented',
      message: 'Manual trigger not yet implemented'
    });

  } catch (error) {
    console.error('❌ Manual trigger failed:', error);
    return res.status(500).json({ error: String(error) });
  }
});

/**
 * Client status endpoint: Check image generation progress
 */
router.get('/api/image-status/:caseId', async (req, res) => {
  console.log('📊 Status check:', req.params.caseId);

  try {
    const { caseId } = req.params;

    // TODO: Implement in Task 3.7
    return res.status(501).json({
      status: 'not_implemented',
      message: 'Status tracking not yet implemented'
    });

  } catch (error) {
    console.error('❌ Status check failed:', error);
    return res.status(500).json({ error: String(error) });
  }
});
```

---

### Task 1.7: Create Unit Test Files

**Duration**: 45 minutes
**Priority**: 🟡 High
**Dependencies**: Tasks 1.1-1.3

#### Acceptance Criteria
- [ ] Test file structure matches source structure
- [ ] Mock implementations for Redis and Gemini
- [ ] Test utilities for creating fixtures
- [ ] All test files compile
- [ ] Tests initially pass (testing stubs)

#### Files to Create
- `src/server/types/__tests__/ImageGeneration.test.ts`
- `src/server/services/images/__tests__/ImageGenerationStatusService.test.ts`
- `src/server/services/images/__tests__/ImageGenerationSchedulerService.test.ts`

#### Test Structure
```typescript
// ImageGenerationStatusService.test.ts
import { ImageGenerationStatusService } from '../ImageGenerationStatusService';
import { createMockRedisClient } from '../../../test-utils/mocks';

describe('ImageGenerationStatusService', () => {
  let service: ImageGenerationStatusService;
  let mockRedis: any;

  beforeEach(() => {
    mockRedis = createMockRedisClient();
    service = new ImageGenerationStatusService(mockRedis);
  });

  describe('initStatus', () => {
    it('should initialize status with pending state', async () => {
      // TODO: Implement in Task 2.1
      expect(true).toBe(true); // Placeholder
    });
  });

  // More tests...
});
```

---

### Task 1.8: Set Up TypeScript Compilation

**Duration**: 30 minutes
**Priority**: 🟡 High
**Dependencies**: Tasks 1.1-1.3

#### Acceptance Criteria
- [ ] TypeScript compiles without errors
- [ ] Type checking passes for new files
- [ ] Import paths resolve correctly
- [ ] Source maps generated for debugging
- [ ] Build output verified in dist/server

#### Commands
```bash
npm run build
# Should complete without errors
# Check dist/server for compiled output
```

---

### Task 1.9: Commit Foundation Layer

**Duration**: 15 minutes
**Priority**: 🟡 High
**Dependencies**: Tasks 1.1-1.8

#### Acceptance Criteria
- [ ] All new files added to git
- [ ] Commit message follows conventions
- [ ] No uncommitted changes remain
- [ ] Branch pushed to origin

#### Commands
```bash
git add .
git commit -m "feat: Add foundation layer for scheduler-based image generation

- Define ImageGenerationStatus interface
- Create service stubs (StatusService, SchedulerService)
- Add scheduler configuration to devvit.json
- Define CaseRepository update methods
- Add endpoint stubs to index.ts
- Set up unit test structure

Part of Phase 1 (Foundation Layer)
Ref: scheduler-image-generation-tasks.md"

git push origin feature/scheduler-image-generation
```

---

## Phase 2: Core Service Layer

**Duration**: ~5 hours
**Priority**: 🔴 Critical
**Goal**: Implement business logic for status tracking and image generation orchestration

### Success Criteria
- [ ] All CRUD operations functional in StatusService
- [ ] Image generation orchestration complete
- [ ] Error handling covers all failure modes
- [ ] Unit tests pass with >80% coverage
- [ ] Integration tests pass against test Redis instance

### Risk Assessment
- **Risk Level**: Medium
- **Mitigation**: Redis operations tested thoroughly; continue-on-error for individual image failures

---

### Task 2.1: Implement ImageGenerationStatusService.initStatus()

**Duration**: 30 minutes
**Priority**: 🔴 Critical
**Dependencies**: Task 1.2

#### Acceptance Criteria
- [ ] Creates initial status object in Redis
- [ ] Sets status to 'pending'
- [ ] Initializes progress counters (current: 0, total: N)
- [ ] Sets startedAt timestamp
- [ ] Returns void on success, throws on error

#### Implementation
```typescript
async initStatus(caseId: string, totalImages: number): Promise<void> {
  const key = this.getKey(caseId);

  const initialStatus: ImageGenerationStatus = {
    status: 'pending',
    progress: { current: 0, total: totalImages },
    images: { locations: [], suspects: [], evidence: [] },
    startedAt: Date.now()
  };

  await this.redis.set(key, JSON.stringify(initialStatus));
  console.log(`✅ Initialized status for case ${caseId}: ${totalImages} images`);
}
```

#### Test Case
```typescript
it('should initialize status with pending state', async () => {
  await service.initStatus('case123', 15);

  const stored = await mockRedis.get('image-generation-status:case123');
  const status = JSON.parse(stored);

  expect(status.status).toBe('pending');
  expect(status.progress.total).toBe(15);
  expect(status.progress.current).toBe(0);
});
```

---

### Task 2.2: Implement ImageGenerationStatusService.updateStatus()

**Duration**: 30 minutes
**Priority**: 🔴 Critical
**Dependencies**: Task 2.1

#### Acceptance Criteria
- [ ] Updates status field atomically
- [ ] Sets completedAt when status is 'completed' or 'failed'
- [ ] Appends error to errors array if provided
- [ ] Preserves other fields in status object

#### Implementation
```typescript
async updateStatus(
  caseId: string,
  status: ImageGenerationStatus['status'],
  error?: string
): Promise<void> {
  const key = this.getKey(caseId);
  const existing = await this.getStatus(caseId);

  if (!existing) {
    throw new Error(`Status not found for case ${caseId}`);
  }

  existing.status = status;

  if (status === 'completed' || status === 'failed') {
    existing.completedAt = Date.now();
  }

  if (error && status === 'failed') {
    existing.errors = existing.errors || [];
    existing.errors.push({
      type: 'location', // Generic type for overall failures
      index: -1,
      message: error
    });
  }

  await this.redis.set(key, JSON.stringify(existing));
  console.log(`✅ Updated status for case ${caseId}: ${status}`);
}
```

---

### Task 2.3: Implement ImageGenerationStatusService.updateProgress()

**Duration**: 30 minutes
**Priority**: 🔴 Critical
**Dependencies**: Task 2.1

#### Acceptance Criteria
- [ ] Increments progress.current atomically
- [ ] Never exceeds progress.total
- [ ] Auto-transitions to 'completed' when current === total
- [ ] Logs progress percentage

#### Implementation
```typescript
async updateProgress(caseId: string, increment: number = 1): Promise<void> {
  const key = this.getKey(caseId);
  const existing = await this.getStatus(caseId);

  if (!existing) {
    throw new Error(`Status not found for case ${caseId}`);
  }

  existing.progress.current = Math.min(
    existing.progress.current + increment,
    existing.progress.total
  );

  // Auto-transition to completed when all images generated
  if (existing.progress.current === existing.progress.total) {
    existing.status = 'completed';
    existing.completedAt = Date.now();
  }

  await this.redis.set(key, JSON.stringify(existing));

  const percentage = Math.round(
    (existing.progress.current / existing.progress.total) * 100
  );
  console.log(`✅ Progress for case ${caseId}: ${percentage}% (${existing.progress.current}/${existing.progress.total})`);
}
```

---

### Task 2.4: Implement ImageGenerationStatusService.saveImageUrl()

**Duration**: 30 minutes
**Priority**: 🔴 Critical
**Dependencies**: Task 2.1

#### Acceptance Criteria
- [ ] Appends image URL to correct array (location/suspect/evidence)
- [ ] Validates URL format
- [ ] Updates progress automatically
- [ ] Maintains array order

#### Implementation
```typescript
async saveImageUrl(
  caseId: string,
  type: 'location' | 'suspect' | 'evidence',
  url: string
): Promise<void> {
  const key = this.getKey(caseId);
  const existing = await this.getStatus(caseId);

  if (!existing) {
    throw new Error(`Status not found for case ${caseId}`);
  }

  // Add URL to appropriate array
  if (type === 'location') {
    existing.images.locations.push(url);
  } else if (type === 'suspect') {
    existing.images.suspects.push(url);
  } else if (type === 'evidence') {
    existing.images.evidence.push(url);
  }

  await this.redis.set(key, JSON.stringify(existing));
  console.log(`✅ Saved ${type} image for case ${caseId}: ${url.substring(0, 50)}...`);
}
```

---

### Task 2.5: Implement ImageGenerationStatusService.getStatus()

**Duration**: 30 minutes
**Priority**: 🔴 Critical
**Dependencies**: Task 2.1

#### Acceptance Criteria
- [ ] Retrieves status from Redis
- [ ] Returns null if not found (not an error)
- [ ] Parses JSON safely
- [ ] Validates object structure

#### Implementation
```typescript
async getStatus(caseId: string): Promise<ImageGenerationStatus | null> {
  const key = this.getKey(caseId);
  const stored = await this.redis.get(key);

  if (!stored) {
    return null;
  }

  try {
    const status = JSON.parse(stored) as ImageGenerationStatus;
    return status;
  } catch (error) {
    console.error(`❌ Failed to parse status for case ${caseId}:`, error);
    return null;
  }
}
```

---

### Task 2.6: Implement ImageGenerationStatusService.recordError()

**Duration**: 30 minutes
**Priority**: 🟡 High
**Dependencies**: Task 2.1

#### Acceptance Criteria
- [ ] Appends error to errors array
- [ ] Includes type, index, and message
- [ ] Does NOT update overall status (allows continuing)
- [ ] Logs error details

#### Implementation
```typescript
async recordError(
  caseId: string,
  type: 'location' | 'suspect' | 'evidence',
  index: number,
  message: string
): Promise<void> {
  const key = this.getKey(caseId);
  const existing = await this.getStatus(caseId);

  if (!existing) {
    throw new Error(`Status not found for case ${caseId}`);
  }

  existing.errors = existing.errors || [];
  existing.errors.push({ type, index, message });

  await this.redis.set(key, JSON.stringify(existing));
  console.error(`❌ Recorded error for case ${caseId} ${type}[${index}]: ${message}`);
}
```

---

### Task 2.7: Implement ImageGenerationSchedulerService.generateCaseImages()

**Duration**: 1 hour
**Priority**: 🔴 Critical
**Dependencies**: Tasks 2.1-2.6, Task 1.3

#### Acceptance Criteria
- [ ] Retrieves case data from CaseRepository
- [ ] Initializes status tracking
- [ ] Orchestrates location, suspect, evidence image generation
- [ ] Handles partial failures gracefully
- [ ] Updates status to completed/failed at end

#### Implementation
```typescript
async generateCaseImages(caseId: string): Promise<void> {
  console.log(`🎨 Starting image generation for case ${caseId}`);
  const startTime = Date.now();

  try {
    // 1. Retrieve case data
    const caseData = await this.caseRepository.getCase(caseId);
    if (!caseData) {
      throw new Error(`Case not found: ${caseId}`);
    }

    // 2. Calculate total images
    const totalImages =
      caseData.locations.length +
      caseData.suspects.length +
      (caseData.evidence?.length || 0);

    // 3. Initialize status tracking
    await this.statusService.initStatus(caseId, totalImages);
    await this.statusService.updateStatus(caseId, 'generating');

    // 4. Generate images sequentially (location → suspect → evidence)
    await this.generateLocationImages(caseId, caseData.locations);
    await this.generateSuspectImages(caseId, caseData.suspects);

    if (caseData.evidence && caseData.evidence.length > 0) {
      await this.generateEvidenceImages(caseId, caseData.evidence);
    }

    // 5. Mark as completed (auto-done by progress tracker)
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Image generation completed for case ${caseId} in ${duration}s`);

  } catch (error) {
    console.error(`❌ Image generation failed for case ${caseId}:`, error);
    await this.statusService.updateStatus(caseId, 'failed', String(error));
    throw error;
  }
}
```

---

### Task 2.8: Implement ImageGenerationSchedulerService.generateLocationImages()

**Duration**: 45 minutes
**Priority**: 🔴 Critical
**Dependencies**: Task 2.7

#### Acceptance Criteria
- [ ] Iterates through all locations
- [ ] Builds prompt from location data
- [ ] Calls GeminiClient.generateImage()
- [ ] Updates CaseRepository with image URL
- [ ] Records errors but continues on failure

#### Implementation
```typescript
private async generateLocationImages(
  caseId: string,
  locations: any[]
): Promise<void> {
  console.log(`🗺️  Generating ${locations.length} location images...`);

  for (let i = 0; i < locations.length; i++) {
    try {
      const location = locations[i];
      const prompt = this.buildLocationImagePrompt(location);

      const response = await this.geminiClient.generateImage(prompt);

      if (response.imageUrl) {
        await this.caseRepository.updateLocationImage(caseId, i, response.imageUrl);
        await this.statusService.saveImageUrl(caseId, 'location', response.imageUrl);
        await this.statusService.updateProgress(caseId, 1);
        console.log(`✅ Generated location image ${i + 1}/${locations.length}`);
      }

    } catch (error) {
      console.error(`❌ Failed to generate location image ${i}:`, error);
      await this.statusService.recordError(caseId, 'location', i, String(error));
      await this.statusService.updateProgress(caseId, 1); // Count as attempted
    }
  }
}

private buildLocationImagePrompt(location: any): string {
  return `A detailed crime scene photograph showing: ${location.name}.
Description: ${location.description}.
Style: Realistic, cinematic lighting, professional crime scene photography.
No text, no people visible.`;
}
```

---

### Task 2.9: Implement ImageGenerationSchedulerService.generateSuspectImages()

**Duration**: 45 minutes
**Priority**: 🔴 Critical
**Dependencies**: Task 2.7

#### Acceptance Criteria
- [ ] Iterates through all suspects
- [ ] Builds prompt from suspect appearance
- [ ] Calls GeminiClient.generateImage()
- [ ] Updates CaseRepository with profile image URL
- [ ] Records errors but continues on failure

#### Implementation
```typescript
private async generateSuspectImages(
  caseId: string,
  suspects: any[]
): Promise<void> {
  console.log(`👤 Generating ${suspects.length} suspect profile images...`);

  for (let i = 0; i < suspects.length; i++) {
    try {
      const suspect = suspects[i];
      const prompt = this.buildSuspectImagePrompt(suspect);

      const response = await this.geminiClient.generateImage(prompt);

      if (response.imageUrl) {
        await this.caseRepository.updateSuspectImage(caseId, i, response.imageUrl);
        await this.statusService.saveImageUrl(caseId, 'suspect', response.imageUrl);
        await this.statusService.updateProgress(caseId, 1);
        console.log(`✅ Generated suspect image ${i + 1}/${suspects.length}`);
      }

    } catch (error) {
      console.error(`❌ Failed to generate suspect image ${i}:`, error);
      await this.statusService.recordError(caseId, 'suspect', i, String(error));
      await this.statusService.updateProgress(caseId, 1);
    }
  }
}

private buildSuspectImagePrompt(suspect: any): string {
  return `Professional portrait photograph of a person:
Name: ${suspect.name}
Age: ${suspect.age}
Gender: ${suspect.gender}
Appearance: ${suspect.appearance}
Occupation: ${suspect.occupation}

Style: Realistic portrait, neutral background, professional lighting, front-facing.
No text overlay, no crime scene elements.`;
}
```

---

### Task 2.10: Implement ImageGenerationSchedulerService.generateEvidenceImages()

**Duration**: 45 minutes
**Priority**: 🟡 High
**Dependencies**: Task 2.7

#### Acceptance Criteria
- [ ] Iterates through evidence items
- [ ] Builds prompt from evidence description
- [ ] Calls GeminiClient.generateImage()
- [ ] Updates CaseRepository with evidence image URL
- [ ] Records errors but continues on failure

#### Implementation
```typescript
private async generateEvidenceImages(
  caseId: string,
  evidence: any[]
): Promise<void> {
  console.log(`🔍 Generating ${evidence.length} evidence images...`);

  for (let i = 0; i < evidence.length; i++) {
    try {
      const item = evidence[i];
      const prompt = this.buildEvidenceImagePrompt(item);

      const response = await this.geminiClient.generateImage(prompt);

      if (response.imageUrl) {
        await this.caseRepository.updateEvidenceImage(caseId, i, response.imageUrl);
        await this.statusService.saveImageUrl(caseId, 'evidence', response.imageUrl);
        await this.statusService.updateProgress(caseId, 1);
        console.log(`✅ Generated evidence image ${i + 1}/${evidence.length}`);
      }

    } catch (error) {
      console.error(`❌ Failed to generate evidence image ${i}:`, error);
      await this.statusService.recordError(caseId, 'evidence', i, String(error));
      await this.statusService.updateProgress(caseId, 1);
    }
  }
}

private buildEvidenceImagePrompt(evidence: any): string {
  return `Crime scene evidence photograph:
Item: ${evidence.name}
Description: ${evidence.description}

Style: Professional evidence photography, well-lit, isolated on neutral background.
Focus on the object clearly visible for identification.
No text labels, no hands or people visible.`;
}
```

---

## Phase 3: API Integration Layer

**Duration**: ~3 hours
**Priority**: 🔴 Critical
**Goal**: Connect services to API endpoints and enable client-server communication

### Success Criteria
- [ ] All endpoints return proper responses
- [ ] Scheduler jobs trigger successfully
- [ ] Manual trigger works from menu
- [ ] Status endpoint returns real-time data
- [ ] Error responses include actionable messages

### Risk Assessment
- **Risk Level**: Medium
- **Mitigation**: Extensive logging; test in dev subreddit before production

---

### Task 3.1-3.4: Implement CaseRepository Update Methods

**Duration**: 1 hour total (15 min each)
**Priority**: 🔴 Critical
**Dependencies**: Phase 1

#### Acceptance Criteria (per method)
- [ ] Retrieves existing case data atomically
- [ ] Updates specific image URL by index
- [ ] Validates index bounds
- [ ] Saves updated case data
- [ ] Returns void on success, throws on error

#### Implementation

```typescript
// Task 3.1: updateLocationImage
static async updateLocationImage(
  caseId: string,
  index: number,
  imageUrl: string
): Promise<void> {
  const caseData = await this.getCase(caseId);
  if (!caseData) {
    throw new Error(`Case not found: ${caseId}`);
  }

  if (index < 0 || index >= caseData.locations.length) {
    throw new Error(`Location index out of bounds: ${index}`);
  }

  caseData.locations[index].imageUrl = imageUrl;
  await this.saveCase(caseData);
  console.log(`✅ Updated location ${index} image for case ${caseId}`);
}

// Task 3.2: updateSuspectImage
static async updateSuspectImage(
  caseId: string,
  index: number,
  imageUrl: string
): Promise<void> {
  const caseData = await this.getCase(caseId);
  if (!caseData) {
    throw new Error(`Case not found: ${caseId}`);
  }

  if (index < 0 || index >= caseData.suspects.length) {
    throw new Error(`Suspect index out of bounds: ${index}`);
  }

  caseData.suspects[index].profileImageUrl = imageUrl;
  await this.saveCase(caseData);
  console.log(`✅ Updated suspect ${index} image for case ${caseId}`);
}

// Task 3.3: updateEvidenceImage
static async updateEvidenceImage(
  caseId: string,
  index: number,
  imageUrl: string
): Promise<void> {
  const caseData = await this.getCase(caseId);
  if (!caseData) {
    throw new Error(`Case not found: ${caseId}`);
  }

  if (!caseData.evidence || index < 0 || index >= caseData.evidence.length) {
    throw new Error(`Evidence index out of bounds: ${index}`);
  }

  caseData.evidence[index].imageUrl = imageUrl;
  await this.saveCase(caseData);
  console.log(`✅ Updated evidence ${index} image for case ${caseId}`);
}

// Task 3.4: getLatestCase
static async getLatestCase(): Promise<CaseData | null> {
  const today = new Date();
  const todaysCase = await this.getTodaysCase(today);

  if (todaysCase) {
    return todaysCase;
  }

  // Fallback: Find most recent case (implement based on your key structure)
  // For now, just return today's case or null
  return null;
}
```

---

### Task 3.5: Implement Scheduler Job Handler

**Duration**: 45 minutes
**Priority**: 🔴 Critical
**Dependencies**: Phase 2

#### Acceptance Criteria
- [ ] Retrieves Gemini API key from settings
- [ ] Instantiates all required services
- [ ] Calls ImageGenerationSchedulerService.generateCaseImages()
- [ ] Returns 200 OK on success
- [ ] Returns 500 with error details on failure

#### Implementation

```typescript
router.post('/internal/scheduler/generate-case-images', async (req, res) => {
  console.log('🎨 Scheduler job triggered: generate-case-images');
  const startTime = Date.now();

  try {
    const { caseId } = req.body.data as ImageGenerationJobData;

    if (!caseId) {
      return res.status(400).json({ error: 'Missing caseId in job data' });
    }

    // Get API key from settings
    const apiKey = await settings.get<string>('geminiApiKey');
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Instantiate services
    const geminiClient = createGeminiClient(apiKey);
    const redis = req.context.redis; // Devvit context
    const statusService = new ImageGenerationStatusService(redis);
    const schedulerService = new ImageGenerationSchedulerService(
      geminiClient,
      CaseRepository,
      statusService
    );

    // Generate images (async, no await to avoid timeout)
    await schedulerService.generateCaseImages(caseId);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Scheduler job completed in ${duration}s`);

    return res.status(200).json({
      status: 'ok',
      caseId,
      duration
    });

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`❌ Scheduler job failed after ${duration}s:`, error);

    return res.status(500).json({
      error: String(error),
      duration
    });
  }
});
```

---

### Task 3.6: Implement Manual Trigger Handler

**Duration**: 30 minutes
**Priority**: 🔴 Critical
**Dependencies**: Task 3.5

#### Acceptance Criteria
- [ ] Retrieves latest case from CaseRepository
- [ ] Triggers scheduler job with runAt: Date
- [ ] Returns case ID to user
- [ ] Shows toast notification on success

#### Implementation

```typescript
router.post('/internal/menu/generate-images-manual', async (req, res) => {
  console.log('🎨 Manual image generation triggered by moderator');

  try {
    // Get latest case
    const latestCase = await CaseRepository.getLatestCase();

    if (!latestCase) {
      return res.json({
        success: false,
        message: 'No case found to generate images for'
      });
    }

    // Trigger scheduler job immediately
    const scheduler = req.context.scheduler; // Devvit scheduler
    await scheduler.runJob({
      name: 'generate-case-images',
      data: { caseId: latestCase.id },
      runAt: new Date(Date.now() + 1000) // Run in 1 second
    });

    console.log(`✅ Queued image generation for case ${latestCase.id}`);

    return res.json({
      success: true,
      caseId: latestCase.id,
      message: `Image generation started for case ${latestCase.id}`
    });

  } catch (error) {
    console.error('❌ Manual trigger failed:', error);

    return res.json({
      success: false,
      message: `Failed to trigger image generation: ${String(error)}`
    });
  }
});
```

---

### Task 3.7: Implement Status Endpoint

**Duration**: 30 minutes
**Priority**: 🔴 Critical
**Dependencies**: Phase 2

#### Acceptance Criteria
- [ ] Retrieves status from ImageGenerationStatusService
- [ ] Returns 404 if case not found
- [ ] Returns status object with proper types
- [ ] Enables CORS for client access

#### Implementation

```typescript
router.get('/api/image-status/:caseId', async (req, res) => {
  const { caseId } = req.params;
  console.log(`📊 Status check for case ${caseId}`);

  try {
    const redis = req.context.redis;
    const statusService = new ImageGenerationStatusService(redis);

    const status = await statusService.getStatus(caseId);

    if (!status) {
      return res.status(404).json({
        error: 'Status not found',
        caseId
      });
    }

    return res.status(200).json(status);

  } catch (error) {
    console.error(`❌ Status check failed for case ${caseId}:`, error);

    return res.status(500).json({
      error: String(error),
      caseId
    });
  }
});
```

---

## Phase 4: Refactoring & Integration

**Duration**: ~4 hours
**Priority**: 🔴 Critical
**Goal**: Remove inline image generation, integrate scheduler triggers, update case creation flow

### Success Criteria
- [ ] Vercel code completely removed
- [ ] Case creation completes in < 2 seconds
- [ ] Scheduler job triggers automatically after case creation
- [ ] DailyCaseScheduler updated
- [ ] All tests pass

### Risk Assessment
- **Risk Level**: Medium-High (breaking existing functionality)
- **Mitigation**: Extensive testing before merge; rollback plan ready

---

### Task 4.1: Remove Inline Image Generation from CaseGeneratorService

**Duration**: 1 hour
**Priority**: 🔴 Critical
**Dependencies**: Phase 3

#### Acceptance Criteria
- [ ] Remove all inline image generation code
- [ ] Remove `includeImage` and `includeSuspectImages` option handling
- [ ] Keep metadata generation only
- [ ] Update JSDoc comments
- [ ] All related tests updated

#### File to Modify
`src/server/services/case/CaseGeneratorService.ts`

#### Changes
```typescript
// REMOVE these sections:

// Remove suspect image generation loop
if (options.includeSuspectImages) {
  console.log('🎨 Generating suspect profile images...');
  for (let i = 0; i < suspects.length; i++) {
    try {
      const prompt = this.buildSuspectImagePrompt(suspects[i]);
      const imageUrl = await this.geminiClient.generateImage(prompt);
      suspects[i].profileImageUrl = imageUrl;
    } catch (error) {
      console.error(`Failed to generate image for suspect ${i}:`, error);
    }
  }
}

// Remove location image generation
if (options.includeImage) {
  // ... remove this block
}

// UPDATE JSDoc:
/**
 * Generate a complete murder mystery case
 *
 * NOTE: Image generation moved to scheduler-based background processing
 * Images will be generated asynchronously after case creation
 *
 * @param options - Case generation options
 * @returns Complete case data (without images initially)
 */
async generateCase(options: CaseGenerationOptions): Promise<CaseData> {
  // Metadata generation only
  // ...
}
```

---

### Task 4.2: Remove Vercel Integration Code

**Duration**: 30 minutes
**Priority**: 🟡 High
**Dependencies**: Task 4.1

#### Acceptance Criteria
- [ ] Remove `triggerVercelImageGeneration()` method
- [ ] Remove Vercel URL configuration fetch
- [ ] Remove HTTP domain permissions for Vercel
- [ ] Remove settings for `vercelImageFunctionUrl` and `devvitBaseUrl`
- [ ] Clean up unused imports

#### Files to Modify
- `src/server/services/case/CaseGeneratorService.ts`
- `src/server/index.ts`
- `devvit.json`

#### Changes in devvit.json
```json
// REMOVE these settings:
{
  "settings": {
    "global": {
      // REMOVE:
      "vercelImageFunctionUrl": { ... },
      "devvitBaseUrl": { ... }
    }
  },
  "permissions": {
    "http": {
      "domains": [
        // REMOVE:
        "armchair-sleuths-f3yshmoks-ledagame-554bceba.vercel.app",
        "*.vercel.app"
      ]
    }
  }
}
```

---

### Task 4.3: Update Case Creation to Trigger Scheduler

**Duration**: 45 minutes
**Priority**: 🔴 Critical
**Dependencies**: Task 4.1, Phase 3

#### Acceptance Criteria
- [ ] Case creation removes image generation flags
- [ ] Scheduler job triggered immediately after case save
- [ ] Job data includes caseId
- [ ] Error handling for failed job trigger
- [ ] Logs indicate scheduler trigger

#### File to Modify
`src/server/index.ts` (or wherever case creation endpoint is)

#### Changes
```typescript
// In case creation endpoint:
router.post('/api/case/create', async (req, res) => {
  try {
    const apiKey = await settings.get<string>('geminiApiKey');
    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);

    // Generate case metadata only (no images)
    const newCase = await caseGenerator.generateCase({
      date: new Date(),
      includeImage: false, // ← Changed from true
      includeSuspectImages: false // ← Changed from true
    });

    console.log(`✅ Case metadata created: ${newCase.caseId}`);

    // Trigger background image generation
    const scheduler = req.context.scheduler;
    await scheduler.runJob({
      name: 'generate-case-images',
      data: { caseId: newCase.caseId },
      runAt: new Date(Date.now() + 2000) // Start in 2 seconds
    });

    console.log(`🎨 Queued image generation for case ${newCase.caseId}`);

    return res.status(200).json({
      success: true,
      case: newCase,
      imageGenerationQueued: true
    });

  } catch (error) {
    console.error('❌ Case creation failed:', error);
    return res.status(500).json({ error: String(error) });
  }
});
```

---

### Task 4.4: Update DailyCaseScheduler

**Duration**: 45 minutes
**Priority**: 🔴 Critical
**Dependencies**: Task 4.3

#### Acceptance Criteria
- [ ] Remove inline image generation from generateDailyCase()
- [ ] Trigger scheduler job after case creation
- [ ] Update initialization to not generate images immediately
- [ ] Update logs and comments

#### File to Modify
`src/server/schedulers/DailyCaseScheduler.ts`

#### Changes
```typescript
export async function generateDailyCase(
  apiKey: string,
  scheduler: any // Add scheduler parameter
): Promise<void> {
  console.log('🔄 Daily case generation started...');
  const startTime = Date.now();

  try {
    const existingCase = await CaseRepository.getTodaysCase();

    if (existingCase) {
      console.log(`✅ Today's case already exists: ${existingCase.id}`);
      return;
    }

    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);

    // Generate metadata only
    const newCase = await caseGenerator.generateCase({
      date: new Date(),
      includeImage: false, // ← Changed
      includeSuspectImages: false // ← Changed
    });

    console.log(`✅ New case generated: ${newCase.caseId}`);

    // Trigger background image generation
    await scheduler.runJob({
      name: 'generate-case-images',
      data: { caseId: newCase.caseId },
      runAt: new Date(Date.now() + 5000) // Start in 5 seconds
    });

    console.log(`🎨 Queued image generation for case ${newCase.caseId}`);
    console.log(`⏱️ Completed in ${Date.now() - startTime}ms`);

  } catch (error) {
    console.error('❌ Daily case generation failed:', error);
    throw error;
  }
}
```

---

### Task 4.5: Add Client-Side Status Polling

**Duration**: 1 hour
**Priority**: 🟡 High
**Dependencies**: Task 3.7

#### Acceptance Criteria
- [ ] Client polls status endpoint every 3 seconds
- [ ] Displays progress bar or percentage
- [ ] Shows images as they become available
- [ ] Stops polling when status is 'completed' or 'failed'
- [ ] Handles errors gracefully

#### File to Modify
`src/client/App.tsx` or relevant component

#### Implementation Sketch
```typescript
// Add to case loading component
const [imageGeneration Status, setImageGenerationStatus] = useState<ImageGenerationStatus | null>(null);

useEffect(() => {
  if (!caseId) return;

  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`/api/image-status/${caseId}`);
      const status = await response.json();

      setImageGenerationStatus(status);

      if (status.status === 'completed' || status.status === 'failed') {
        clearInterval(pollInterval);
      }

    } catch (error) {
      console.error('Failed to fetch image status:', error);
    }
  }, 3000);

  return () => clearInterval(pollInterval);
}, [caseId]);

// Render progress UI
{imageGenerationStatus && imageGenerationStatus.status === 'generating' && (
  <div className="image-generation-progress">
    Generating images... {imageGenerationStatus.progress.current}/{imageGenerationStatus.progress.total}
  </div>
)}
```

---

### Task 4.6: Integration Testing

**Duration**: 1 hour
**Priority**: 🔴 Critical
**Dependencies**: Tasks 4.1-4.5

#### Acceptance Criteria
- [ ] Create new case via API
- [ ] Verify case metadata returned immediately
- [ ] Verify scheduler job triggered
- [ ] Monitor image generation progress
- [ ] Verify all images appear in case data
- [ ] Test manual trigger menu item
- [ ] Test error scenarios (bad API key, invalid case ID)

#### Test Procedure
```bash
# 1. Upload to test subreddit
devvit upload --subreddit armchair_sleuths_dev

# 2. Trigger case creation via menu or API

# 3. Monitor logs
devvit logs --subreddit armchair_sleuths_dev --stream

# 4. Check status endpoint
curl https://[devvit-url]/api/image-status/[caseId]

# 5. Verify case data updated
# Check Redis or fetch case via API
```

---

### Task 4.7: Update Documentation

**Duration**: 30 minutes
**Priority**: 🟡 High
**Dependencies**: Tasks 4.1-4.6

#### Acceptance Criteria
- [ ] Update `게임전체프로세스.md` with new flow
- [ ] Update `완벽게임구현상태.md` with scheduler architecture
- [ ] Document scheduler configuration
- [ ] Document status endpoint API
- [ ] Add troubleshooting section

#### Deliverable
- Updated documentation with ASCII diagrams showing new flow

---

## Phase 5: Cleanup & Optimization

**Duration**: ~2 hours
**Priority**: 🟡 High
**Goal**: Remove dead code, optimize performance, implement storage management

### Success Criteria
- [ ] All unused code removed
- [ ] Logs cleaned up and structured
- [ ] Status cleanup implemented
- [ ] Performance measured and meets targets

---

### Task 5.1: Remove Dead Code

**Duration**: 45 minutes
**Priority**: 🟡 High
**Dependencies**: Phase 4

#### Acceptance Criteria
- [ ] Remove Vercel-related utility functions
- [ ] Remove unused imports
- [ ] Remove commented-out code
- [ ] Clean up test files for removed code

#### Files to Review
- `src/server/services/generators/ImageGenerator.ts` (if exists)
- `src/server/services/case/CaseGeneratorService.ts`
- All test files

---

### Task 5.2: Implement Status Cleanup

**Duration**: 30 minutes
**Priority**: 🟡 High
**Dependencies**: Task 2.1

#### Acceptance Criteria
- [ ] Implement `deleteStatus()` method
- [ ] Add TTL option for status keys (optional)
- [ ] Create cleanup job for old statuses (optional)

#### Implementation
```typescript
async deleteStatus(caseId: string): Promise<void> {
  const key = this.getKey(caseId);
  await this.redis.del(key);
  console.log(`🗑️  Deleted status for case ${caseId}`);
}

// Optional: Add TTL when creating status
async initStatus(caseId: string, totalImages: number): Promise<void> {
  const key = this.getKey(caseId);
  const initialStatus: ImageGenerationStatus = { ... };

  await this.redis.set(key, JSON.stringify(initialStatus));
  await this.redis.expire(key, 86400 * 7); // 7 days TTL
}
```

---

### Task 5.3: Optimize Logging

**Duration**: 30 minutes
**Priority**: 🟡 High
**Dependencies**: Phase 4

#### Acceptance Criteria
- [ ] Consistent log format across all services
- [ ] Use emoji prefixes for log levels (✅ ❌ ⚠️ 📊)
- [ ] Include timestamps and case IDs
- [ ] Remove debug logs for production

#### Pattern
```typescript
// Good:
console.log(`✅ [${new Date().toISOString()}] Case ${caseId}: Generated image 5/15`);

// Bad:
console.log('image generated');
```

---

### Task 5.4: Performance Measurement

**Duration**: 15 minutes
**Priority**: 🟡 High
**Dependencies**: Task 4.6

#### Acceptance Criteria
- [ ] Measure case metadata creation time
- [ ] Measure total image generation time
- [ ] Compare against baseline from Task 0.2
- [ ] Document performance improvements

#### Target Metrics
- Case metadata creation: < 2 seconds (down from ~14 seconds)
- Image generation: < 5 minutes for 15 images (background, no timeout)
- Success rate: 100% (up from ~20% due to timeouts)

---

## Phase 6: Testing & Validation

**Duration**: ~3 hours
**Priority**: 🔴 Critical
**Goal**: Comprehensive testing across all scenarios and edge cases

### Success Criteria
- [ ] All unit tests pass
- [ ] Integration tests cover happy path and error cases
- [ ] Load testing shows no regressions
- [ ] User acceptance testing completed

---

### Task 6.1: Unit Test Coverage

**Duration**: 1.5 hours
**Priority**: 🔴 Critical
**Dependencies**: Phase 5

#### Acceptance Criteria
- [ ] ImageGenerationStatusService: >90% coverage
- [ ] ImageGenerationSchedulerService: >80% coverage
- [ ] All CRUD operations tested
- [ ] Error scenarios tested
- [ ] Mock implementations verified

#### Test Cases
```typescript
describe('ImageGenerationSchedulerService', () => {
  describe('generateCaseImages', () => {
    it('should generate all images successfully', async () => { ... });
    it('should handle partial failures gracefully', async () => { ... });
    it('should update status to failed on critical error', async () => { ... });
    it('should handle missing case data', async () => { ... });
  });

  describe('generateLocationImages', () => {
    it('should generate all location images', async () => { ... });
    it('should continue on individual image failure', async () => { ... });
    it('should update progress after each image', async () => { ... });
  });
});
```

---

### Task 6.2: Integration Testing

**Duration**: 1 hour
**Priority**: 🔴 Critical
**Dependencies**: Task 6.1

#### Acceptance Criteria
- [ ] End-to-end flow tested (case creation → scheduler → images)
- [ ] Manual trigger tested
- [ ] Status polling tested
- [ ] Error recovery tested
- [ ] Daily cron trigger tested (or simulated)

#### Test Scenarios
1. **Happy Path**: Create case → verify metadata → trigger scheduler → poll status → verify images
2. **Partial Failure**: Simulate Gemini API error for 1 image → verify others continue
3. **Complete Failure**: Simulate API key error → verify status marked as failed
4. **Manual Trigger**: Use menu item → verify scheduler job triggered
5. **Status Cleanup**: Verify old statuses cleaned up (if implemented)

---

### Task 6.3: Load Testing

**Duration**: 30 minutes
**Priority**: 🟡 High
**Dependencies**: Task 6.2

#### Acceptance Criteria
- [ ] Generate 5 cases in rapid succession
- [ ] Verify no resource exhaustion
- [ ] Verify no Redis contention issues
- [ ] Verify scheduler queue handles multiple jobs

#### Commands
```bash
# Script to create 5 cases rapidly
for i in {1..5}; do
  curl -X POST https://[devvit-url]/api/case/create
  sleep 5
done

# Monitor logs and Redis
devvit logs --stream
```

---

### Task 6.4: User Acceptance Testing

**Duration**: 30 minutes
**Priority**: 🟡 High
**Dependencies**: Task 6.2

#### Acceptance Criteria
- [ ] Moderator can trigger image generation via menu
- [ ] Players see images appear progressively
- [ ] No confusing error messages displayed
- [ ] Performance feels smooth (no blocking)

#### Test with Real User
- Have a test moderator use the menu item
- Have a test player load a case while images are generating
- Verify UX is clear about what's happening

---

## Phase 7: Documentation & Deployment

**Duration**: ~1 hour
**Priority**: 🟡 High
**Goal**: Finalize documentation, deploy to production, monitor rollout

### Success Criteria
- [ ] All documentation updated
- [ ] Deployment plan approved
- [ ] Production deployment successful
- [ ] Post-deployment monitoring shows no issues

---

### Task 7.1: Final Documentation Update

**Duration**: 30 minutes
**Priority**: 🟡 High
**Dependencies**: Phase 6

#### Acceptance Criteria
- [ ] Architecture diagrams updated
- [ ] API documentation complete
- [ ] Troubleshooting guide written
- [ ] Migration notes documented
- [ ] README updated

#### Files to Update
- `README.md`
- `docs/architecture.md`
- `docs/api-reference.md`
- `docs/troubleshooting.md`

---

### Task 7.2: Production Deployment

**Duration**: 30 minutes
**Priority**: 🔴 Critical
**Dependencies**: Task 7.1, Phase 6

#### Acceptance Criteria
- [ ] Create PR from feature branch to main
- [ ] PR approved by team
- [ ] CI/CD pipeline passes
- [ ] Deploy to production subreddit
- [ ] Monitor for 24 hours

#### Deployment Steps
```bash
# 1. Create PR
git push origin feature/scheduler-image-generation
# Open PR on GitHub

# 2. After approval, merge to main
git checkout main
git pull origin main

# 3. Deploy to production
devvit upload --subreddit armchair_sleuths

# 4. Monitor logs
devvit logs --subreddit armchair_sleuths --stream

# 5. Verify scheduler running
# Check devvit dashboard for scheduled jobs
```

#### Rollback Plan
If critical issues arise:
```bash
# 1. Revert to previous version
git revert HEAD
git push origin main

# 2. Redeploy
devvit upload --subreddit armchair_sleuths

# 3. Notify users
# Post announcement in subreddit
```

---

## Appendices

### Appendix A: File Change Summary

#### Files Created (8 files)
1. `src/server/types/ImageGeneration.ts`
2. `src/server/services/images/ImageGenerationStatusService.ts`
3. `src/server/services/images/ImageGenerationSchedulerService.ts`
4. `src/server/types/__tests__/ImageGeneration.test.ts`
5. `src/server/services/images/__tests__/ImageGenerationStatusService.test.ts`
6. `src/server/services/images/__tests__/ImageGenerationSchedulerService.test.ts`
7. `docs/current-implementation-analysis.md`
8. `docs/rollback-plan.md`

#### Files Modified (6 files)
1. `devvit.json` - Add scheduler config and menu item
2. `src/server/index.ts` - Add scheduler endpoints, update case creation
3. `src/server/services/case/CaseGeneratorService.ts` - Remove inline image generation
4. `src/server/services/repositories/kv/CaseRepository.ts` - Add image update methods
5. `src/server/schedulers/DailyCaseScheduler.ts` - Update to trigger scheduler
6. `src/client/App.tsx` - Add status polling

#### Files Deleted (0-2 files, conditional)
- `src/server/services/generators/ImageGenerator.ts` (if it exists and is Vercel-specific)
- Any Vercel utility files

---

### Appendix B: API Endpoint Reference

#### 1. Scheduler Job Handler
```
POST /internal/scheduler/generate-case-images
Body: { data: { caseId: string } }
Response: { status: 'ok', caseId: string, duration: string }
```

#### 2. Manual Trigger Menu
```
POST /internal/menu/generate-images-manual
Body: (empty, triggered by menu)
Response: { success: boolean, caseId: string, message: string }
```

#### 3. Status Endpoint
```
GET /api/image-status/:caseId
Response: ImageGenerationStatus
{
  status: 'pending' | 'generating' | 'completed' | 'failed',
  progress: { current: number, total: number },
  images: { locations: string[], suspects: string[], evidence: string[] },
  startedAt: number,
  completedAt?: number,
  errors?: Array<{ type, index, message }>
}
```

---

### Appendix C: Redis Key Schema

#### Image Generation Status
```
Key: image-generation-status:{caseId}
Type: String (JSON)
TTL: 7 days (optional)
Value: ImageGenerationStatus object
```

#### Case Data (existing)
```
Key: case:{caseId}
Type: String (JSON)
Value: CaseData object (with image URLs updated progressively)
```

---

### Appendix D: Testing Checklist

#### Pre-Deployment Tests
- [ ] Unit tests pass (npm test)
- [ ] TypeScript compiles (npm run build)
- [ ] Linting passes (npm run lint)
- [ ] Integration tests pass
- [ ] Load tests pass
- [ ] Manual testing in dev subreddit

#### Post-Deployment Tests
- [ ] Create new case via menu
- [ ] Verify case metadata loads immediately
- [ ] Verify scheduler job triggered
- [ ] Verify images generate successfully
- [ ] Verify status endpoint returns correct data
- [ ] Test manual trigger menu item
- [ ] Check logs for errors
- [ ] Monitor Redis usage
- [ ] Verify daily cron trigger (wait for midnight or simulate)

---

## Progress Tracking

### Phase Completion

| Phase | Tasks | Status | Duration | Notes |
|-------|-------|--------|----------|-------|
| Phase 0: Preparation | 0.1-0.5 | ⏳ In Progress | 0/4 hours | Task 0.1 started |
| Phase 1: Foundation | 1.1-1.9 | ⏸️ Pending | 0/6 hours | |
| Phase 2: Core Services | 2.1-2.10 | ⏸️ Pending | 0/5 hours | |
| Phase 3: API Integration | 3.1-3.7 | ⏸️ Pending | 0/3 hours | |
| Phase 4: Refactoring | 4.1-4.7 | ⏸️ Pending | 0/4 hours | |
| Phase 5: Cleanup | 5.1-5.4 | ⏸️ Pending | 0/2 hours | |
| Phase 6: Testing | 6.1-6.4 | ⏸️ Pending | 0/3 hours | |
| Phase 7: Deployment | 7.1-7.2 | ⏸️ Pending | 0/1 hour | |

**Total Progress**: 2/45 tasks (4.4%)
**Estimated Remaining**: 28 hours

### Task Status Legend
- ✅ Completed
- ⏳ In Progress
- ⏸️ Pending
- ❌ Blocked

### Daily Progress Log

**2025-10-22**:
- [x] Task 0.1: Review Project Documentation (started)
  - Read `게임전체프로세스.md` (1788 lines)
  - Read `완벽게임구현상태.md` (500 lines)
  - ⏳ Save task breakdown document

### Blockers & Risks

| ID | Description | Severity | Mitigation | Status |
|----|-------------|----------|------------|--------|
| R1 | Scheduler timeout limits unknown | Medium | Performance monitoring | 🟡 Monitor |
| R2 | Redis storage capacity for statuses | Low | Implement TTL cleanup | 🟢 Planned |
| R3 | Gemini API rate limiting | Medium | Retry logic + delays | 🟢 Planned |

---

## Next Steps

1. **Complete Task 0.1**: Save this task breakdown document ✅
2. **Continue Task 0.1**: Document current implementation flow
3. **Start Task 0.2**: Baseline performance measurement
4. **Complete Phase 0**: Preparation phase (4 hours total)
5. **Begin Phase 1**: Foundation layer implementation

---

**Document End**

*Last Updated: 2025-10-22*
*Version: 1.0*
*Status: Planning Complete - Ready for Implementation*