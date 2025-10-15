---
status: resolved
priority: p1
issue_id: "001"
tags: [architecture, storage, dependency-injection, testing, devops]
dependencies: []
resolved_at: 2025-10-15
commit: c632121
---

# Storage Abstraction Layer for Devvit Runtime Independence

## Problem Statement

The case generation script (`scripts/generate-case.ts`) cannot run outside of Devvit runtime context because the storage layer (`KVStoreManager`) is tightly coupled to Devvit's Redis client. This violates the Dependency Inversion Principle (DIP) and prevents local development, testing, and CI/CD automation.

**Current Error:**
```
Error: Devvit config is not available. Make sure to call getDevvitConfig()
after the Devvit runtime has been initialized.
```

## Findings

- **Location:** `src/server/services/repositories/kv/KVStoreManager.ts:8,96`
- **Root Cause:** Direct dependency on `@devvit/redis` which requires `globalThis.devvit.config`
- **Call Stack:**
  ```
  generate-case.ts:38
    → CaseGeneratorService.generateCase()
      → CaseRepository.createCase()
        → KVStoreManager.saveCase()
          → redis.set() [FAILURE]
  ```

**Impact:**
- ❌ Cannot generate test data locally
- ❌ Cannot run unit tests for storage layer
- ❌ Cannot automate case generation in CI/CD
- ❌ Slower development iteration (must deploy to test)
- ❌ No local debugging capability

## Proposed Solutions

### Option 1: Storage Abstraction Layer with Adapter Pattern (RECOMMENDED)

**Implementation Steps:**
1. Create `IStorageAdapter` interface abstracting Redis operations
2. Implement `DevvitStorageAdapter` wrapping `@devvit/redis` for production
3. Implement `FileStorageAdapter` using JSON files for local scripts
4. Implement `MemoryStorageAdapter` using Map for unit tests
5. Refactor `KVStoreManager` to accept adapter via dependency injection
6. Update `scripts/generate-case.ts` to use `FileStorageAdapter`
7. Update `src/server/index.ts` to initialize `DevvitStorageAdapter`

**Pros:**
- ✅ Clean separation of concerns (SOLID principles)
- ✅ Local script execution capability
- ✅ Full unit test coverage possible
- ✅ CI/CD automation enabled
- ✅ Future-proof (can add SQLite, PostgreSQL, etc.)
- ✅ No production behavior change

**Cons:**
- Requires initial refactoring effort
- Need to maintain multiple adapter implementations

**Effort:** Medium (4-5 hours)
**Risk:** Low - Well-defined interfaces, incremental changes

### Option 2: Mock Devvit Runtime (NOT RECOMMENDED)

**Pros:**
- Minimal code changes

**Cons:**
- ❌ Fragile - breaks on Devvit updates
- ❌ Difficult to mock all behaviors correctly
- ❌ No data persistence
- ❌ Hacky approach

## Recommended Action

**Proceed with Option 1: Storage Abstraction Layer**

This solution provides long-term maintainability, testability, and follows software engineering best practices.

## Technical Details

**Affected Files:**
- `src/server/services/repositories/adapters/IStorageAdapter.ts` (NEW)
- `src/server/services/repositories/adapters/DevvitStorageAdapter.ts` (NEW)
- `src/server/services/repositories/adapters/FileStorageAdapter.ts` (NEW)
- `src/server/services/repositories/adapters/MemoryStorageAdapter.ts` (NEW)
- `src/server/services/repositories/kv/KVStoreManager.ts` (REFACTOR)
- `scripts/generate-case.ts` (UPDATE)
- `src/server/index.ts` (UPDATE)

**Related Components:**
- Case Repository
- Case Generator Service
- All storage operations (suspects, conversations, submissions)

**Database Changes:** No - Only abstracts existing Redis operations

## Resources

- Original finding: Root cause analysis of Devvit runtime initialization error
- Pattern: Adapter Pattern / Strategy Pattern
- Principle: Dependency Inversion Principle (SOLID)

## Acceptance Criteria

- [ ] `IStorageAdapter` interface defines all required Redis operations
- [ ] `DevvitStorageAdapter` wraps existing `@devvit/redis` functionality
- [ ] `FileStorageAdapter` persists data to `./local-data/` directory
- [ ] `MemoryStorageAdapter` provides in-memory storage for tests
- [ ] `KVStoreManager` refactored to use adapter pattern
- [ ] `scripts/generate-case.ts` successfully runs locally without Devvit runtime
- [ ] Production server still uses Devvit Redis (no behavior change)
- [ ] All existing tests pass
- [ ] New unit tests added for adapters
- [ ] Build succeeds without errors
- [ ] Local data directory added to `.gitignore`

## Work Log

### 2025-10-15 - Initial Discovery
**By:** Claude Triage System
**Actions:**
- Issue discovered during root cause analysis of script execution failure
- Categorized as P1 (CRITICAL) - blocks local development
- Estimated effort: Medium (4-5 hours)
- Solution designed: Storage Abstraction Layer with Adapter Pattern

**Learnings:**
- Tight coupling to framework-specific APIs prevents testability
- Dependency Inversion Principle enables flexible architecture
- Adapter pattern provides clean migration path

### 2025-10-15 - Implementation Complete
**By:** Claude Code (Parallel Task Execution)
**Actions:**
- ✅ Created IStorageAdapter interface with 5 core methods
- ✅ Implemented DevvitStorageAdapter (production)
- ✅ Implemented FileStorageAdapter (local scripts)
- ✅ Implemented MemoryStorageAdapter (unit tests)
- ✅ Refactored KVStoreManager with dependency injection
- ✅ Updated generate-case.ts to use FileStorageAdapter
- ✅ Updated src/server/index.ts to use DevvitStorageAdapter
- ✅ Added /local-data/ to .gitignore
- ✅ Verified local script execution: Case generated successfully
- ✅ Verified production build: Build completed without errors
- ✅ Committed changes: c632121

**Results:**
- Script execution time: 3.4 seconds
- Files created in ./local-data/: 6 JSON files (case, suspects, indexes)
- Production build: ✅ Client (1.80s), Server (6.57s)
- No breaking changes to existing functionality

**Learnings:**
- Parallel task execution reduced implementation time significantly
- Adapter pattern scaled well to 3 implementations simultaneously
- Dependency injection simplified testing strategy
- File-based storage useful for debugging (human-readable JSON)

## Notes

**Source:** Triage session on 2025-10-15

**Next Steps:**
1. Create interface and adapters
2. Refactor KVStoreManager incrementally
3. Test each adapter independently
4. Verify production deployment unchanged
5. Add comprehensive unit tests
