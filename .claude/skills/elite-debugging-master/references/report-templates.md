# Debugging Report Templates

Standardized templates for different types of debugging reports. Use these templates to ensure consistent, comprehensive documentation of debugging findings.

---

## 1. Bug Analysis Report

Use this template for investigating and documenting specific bugs or errors.

```markdown
# Bug Analysis Report

## Executive Summary
- **Problem**: [One sentence description of the issue]
- **Root Cause**: [Fundamental issue identified]
- **Impact**: [Severity (Critical/High/Medium/Low) and scope (# users/features affected)]
- **Solution**: [High-level approach to fix]
- **Status**: [Fixed/In Progress/Blocked]

## Detailed Analysis

### 1. Symptoms Observed
**Error Messages**:
```
[Paste error messages, stack traces, or exception output]
```

**Reproduction Steps**:
1. [Step to trigger bug]
2. [Next step]
3. [Observed vs expected behavior]

**Frequency**: [Always/Intermittent/Rare]
**Environment**: [Development/Staging/Production]
**First Observed**: [Date or commit hash]

### 2. Investigation Trail

**Code Paths Examined**:
- `file_path:line_number` - [What was checked here]
- `file_path:line_number` - [Findings]

**Dependencies Analyzed**:
- [Service/Module A] → [Service/Module B] → [Issue location]

**Related Components**:
- [Component/Service that might be affected]

**Tools Used**:
- Grep patterns: `[patterns searched]`
- Git history: `git log --oneline [file]`
- Stack trace analysis
- [Other debugging tools]

### 3. Root Cause

**Primary Cause**:
[Detailed explanation of the fundamental issue that caused the bug]

**Contributing Factors**:
- [Secondary issue that made the problem worse]
- [Environmental factor]
- [Design decision that enabled the bug]

**Why It Occurred**:
[Explain the design/implementation gap that allowed this to happen]

**Why It Wasn't Caught Earlier**:
[Identify testing/review gaps]

### 4. Proposed Solution

#### Immediate Fix (Deploy Today)
**Priority**: P0
**Time Estimate**: [X hours]

```typescript
// Before
[Current problematic code]

// After
[Fixed code with inline comments explaining changes]
```

**Files Changed**:
- `file_path:line_number` - [Description of change]
- `file_path:line_number` - [Description of change]

#### Root Cause Fix (This Week)
**Priority**: P1
**Time Estimate**: [X days]

```typescript
// Architectural improvements or refactoring needed
[Code showing the deeper fix]
```

**Rationale**: [Why this addresses the root cause]

#### Preventive Measures (This Month)
**Priority**: P2
**Time Estimate**: [X days]

- [ ] **Linting Rule**: Add ESLint rule to prevent pattern X
- [ ] **Type Guard**: Create type validation for Y
- [ ] **Documentation**: Update guide Z to explain this pattern
- [ ] **Test Coverage**: Add integration test for scenario W
- [ ] **Monitoring**: Add alert for condition V

### 5. Verification Plan

**Pre-Deployment Checks**:
- [ ] All existing tests pass
- [ ] New tests added for bug scenario
- [ ] Type check passes (`npm run type-check`)
- [ ] Build succeeds
- [ ] Manual testing of affected feature
- [ ] Regression testing of related features

**Test Scenarios**:
1. [Scenario that previously failed]
   - Expected: [Result]
   - Actual: [Result after fix]
2. [Edge case scenario]
   - Expected: [Result]
   - Actual: [Result after fix]

**Performance Validation**:
- [ ] No performance regression introduced
- [ ] Memory usage remains stable
- [ ] Response times within acceptable range

### 6. Related Files

**Modified**:
- `file_path:line_number` - [Change description]
- `file_path:line_number` - [Change description]

**Created**:
- `file_path` - [Purpose]

**Deleted**:
- `file_path` - [Reason for deletion]

**To Review**:
- `file_path` - [Why this should be reviewed]

---

**Analysis Time**: [X] minutes
**Fix Time**: [X] hours
**Confidence Level**: High/Medium/Low
**Reviewer**: Elite Debugging Master
**Date**: [YYYY-MM-DD]
```

---

## 2. Architecture Analysis Report

Use this template for comprehensive codebase architecture reviews.

```markdown
# Architecture Analysis Report

## Executive Summary

**Project**: [Project Name]
**Analysis Date**: [YYYY-MM-DD]
**Scope**: [Full codebase / Specific module / Service layer / etc.]
**Overall Health**: [Excellent/Good/Needs Improvement/Critical]

**Key Findings**:
- [Most critical issue found]
- [Second priority issue]
- [Third priority issue]

**Recommended Actions**:
1. [Highest priority action]
2. [Second priority action]
3. [Third priority action]

## Architecture Overview

**Current Structure**:
```
[Directory tree or architecture diagram]
```

**Layer Boundaries**:
- Client Layer: [# components, # hooks, # services]
- Shared Layer: [# types, # utilities, # constants]
- Server Layer: [# services, # controllers, # repositories]

**Technology Stack**:
- Frontend: [Framework, libraries]
- Backend: [Runtime, frameworks]
- Database: [Type, ORM]
- Infrastructure: [Hosting, CI/CD]

## Critical Issues (P0)

### Issue 1: [Title]

**Category**: [Type System / Service Layer / Component Layer / API Layer]
**Severity**: Critical
**Impact**: [Description of impact]

**Problem Description**:
[Detailed explanation of the architectural violation or flaw]

**Evidence**:
- Found in: `file_path:line_number`
- Pattern detected: [Grep pattern or manual finding]
- Frequency: [# occurrences]

**Root Cause**:
[Why this architectural problem exists]

**Solution**:
```typescript
// Current (problematic)
[Code showing the issue]

// Proposed (fixed)
[Code showing the solution]
```

**Migration Steps**:
1. [First step]
2. [Second step]
3. [Validation step]

**Time Estimate**: [X hours/days]
**Risk Level**: [Low/Medium/High]

---

## High Priority Issues (P1)

[Repeat structure from P0 for each P1 issue]

---

## Medium Priority Issues (P2)

[Repeat structure for P2 issues]

---

## Low Priority Issues (P3)

[Repeat structure for P3 issues]

---

## Architectural Principles Adherence

### SOLID Principles

| Principle | Adherence | Notes |
|-----------|-----------|-------|
| Single Responsibility | ✅/⚠️/❌ | [Comments on service/component responsibilities] |
| Open/Closed | ✅/⚠️/❌ | [Comments on extensibility] |
| Liskov Substitution | ✅/⚠️/❌ | [Comments on inheritance patterns] |
| Interface Segregation | ✅/⚠️/❌ | [Comments on interface design] |
| Dependency Inversion | ✅/⚠️/❌ | [Comments on dependency direction] |

### Layer Separation

| Boundary | Status | Violations Found |
|----------|--------|------------------|
| Client → Shared | ✅/⚠️/❌ | [# violations, examples] |
| Client → Server | ✅/⚠️/❌ | [# violations, examples] |
| Server → Shared | ✅/⚠️/❌ | [# violations, examples] |

### Code Organization

| Aspect | Rating | Comments |
|--------|--------|----------|
| Directory Structure | ⭐⭐⭐⭐⭐ | [Comments] |
| Naming Conventions | ⭐⭐⭐⭐⭐ | [Comments] |
| File Size Management | ⭐⭐⭐⭐⭐ | [Comments] |
| Dependency Management | ⭐⭐⭐⭐⭐ | [Comments] |

## Metrics

### Type System

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Type boundary violations | [#] | 0 | ✅/⚠️/❌ |
| Duplicate type definitions | [#] | 0 | ✅/⚠️/❌ |
| Missing type exports | [#] | 0 | ✅/⚠️/❌ |
| Average type file size | [#] lines | <200 lines | ✅/⚠️/❌ |
| Implicit 'any' usage | [#] | 0 | ✅/⚠️/❌ |

### Service Layer

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Average service size | [#] lines | <500 lines | ✅/⚠️/❌ |
| God services (>500 lines) | [#] | 0 | ✅/⚠️/❌ |
| Circular dependencies | [#] | 0 | ✅/⚠️/❌ |
| Direct storage access | [#] | 0 | ✅/⚠️/❌ |
| Services per directory | [#] | <5 | ✅/⚠️/❌ |

### Component Layer

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Missing useEffect cleanup | [#] | 0 | ✅/⚠️/❌ |
| Prop drilling depth | max [#] | <3 | ✅/⚠️/❌ |
| Average component size | [#] lines | <200 lines | ✅/⚠️/❌ |
| State management consistency | [#] sources | 1-2 | ✅/⚠️/❌ |

## Implementation Roadmap

### Phase 1: Critical Fixes (Week 1)
**Goal**: Resolve all P0 issues

- [ ] [P0 Issue 1]: [Brief description] - [Time estimate]
- [ ] [P0 Issue 2]: [Brief description] - [Time estimate]
- [ ] Validation: Run full test suite
- [ ] Validation: Type check passes
- [ ] Validation: Build succeeds

**Total Time**: [X] days
**Dependencies**: [Any external dependencies]

### Phase 2: High Priority (Week 2)
**Goal**: Resolve all P1 issues

- [ ] [P1 Issue 1]: [Brief description] - [Time estimate]
- [ ] [P1 Issue 2]: [Brief description] - [Time estimate]
- [ ] Documentation: Update architecture docs
- [ ] Validation: Performance benchmarks

**Total Time**: [X] days

### Phase 3: Medium Priority (Weeks 3-4)
**Goal**: Resolve P2 issues and refactoring

- [ ] [P2 Issue 1]: [Brief description]
- [ ] [P2 Issue 2]: [Brief description]
- [ ] Code cleanup
- [ ] Documentation updates

**Total Time**: [X] days

### Phase 4: Low Priority & Preventive (Ongoing)
**Goal**: P3 issues and future prevention

- [ ] [P3 Issue 1]: [Brief description]
- [ ] Add linting rules
- [ ] Create architectural guidelines
- [ ] Set up automated checks

**Total Time**: [X] days

## Automation Scripts

### Type Boundary Validation
```bash
# Check for client → server imports
grep -r "from.*server" src/client/
# Expected: No results
```

### Service Size Check
```bash
# Find services > 500 lines
find src/server/services -name "*.ts" -exec wc -l {} + | awk '$1 > 500'
```

### Duplicate Type Detection
```bash
# Find duplicate interface definitions
grep -r "export interface" src/ | cut -d: -f2 | sort | uniq -d
```

## Recommendations

### Immediate Actions
1. [Action with highest ROI]
2. [Action preventing critical failures]
3. [Action unblocking development]

### Long-term Improvements
1. [Architectural enhancement]
2. [Process improvement]
3. [Tooling addition]

### Team Training Needs
- [Topic 1]: [Why needed]
- [Topic 2]: [Why needed]

---

**Analyst**: Elite Debugging Master
**Review Date**: [YYYY-MM-DD]
**Next Review**: [YYYY-MM-DD]
```

---

## 3. Performance Profile Report

Use this template for investigating performance issues and optimization opportunities.

```markdown
# Performance Profile Report

## Executive Summary

**System**: [Component/Feature/Page name]
**Issue**: [Slow load / Memory leak / High CPU / etc.]
**Current Performance**: [Metric: X ms/MB/etc.]
**Target Performance**: [Metric: Y ms/MB/etc.]
**Gap**: [Delta between current and target]

**Root Cause**: [Primary performance bottleneck]
**Estimated Improvement**: [X% faster / Y MB less memory]

## Performance Metrics

### Current State

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Initial Load Time | [X] ms | [Y] ms | ✅/⚠️/❌ |
| Time to Interactive | [X] ms | [Y] ms | ✅/⚠️/❌ |
| First Contentful Paint | [X] ms | [Y] ms | ✅/⚠️/❌ |
| Largest Contentful Paint | [X] ms | [Y] ms | ✅/⚠️/❌ |
| Bundle Size | [X] KB | [Y] KB | ✅/⚠️/❌ |
| Memory Usage (Idle) | [X] MB | [Y] MB | ✅/⚠️/❌ |
| Memory Usage (Peak) | [X] MB | [Y] MB | ✅/⚠️/❌ |
| CPU Usage (Average) | [X]% | [Y]% | ✅/⚠️/❌ |

### Profiling Results

**Method**: [Chrome DevTools / Lighthouse / Custom profiling]
**Environment**: [Development / Production build]
**Date**: [YYYY-MM-DD]

**Profiling Data**:
```
[Paste or attach profiling data, flame graphs, or screenshots]
```

## Bottleneck Analysis

### Issue 1: [Bottleneck Name]

**Category**: [Bundle Size / Re-rendering / Database Query / Network / Memory Leak]
**Impact**: [X% of total time / Y MB memory]
**Location**: `file_path:line_number`

**Problem Description**:
[Detailed explanation of what's causing the slowdown]

**Evidence**:
```typescript
// Problematic code
[Code snippet showing the issue]
```

**Profiling Screenshot**:
[If applicable, reference screenshot or data showing the bottleneck]

**Root Cause**:
[Why this is slow - missing memoization, N+1 queries, large bundle, etc.]

---

[Repeat for each bottleneck found]

---

## Optimization Recommendations

### High Impact (Implement First)

#### 1. [Optimization Name]
**Expected Improvement**: [X% faster / Y KB smaller]
**Effort**: [Low/Medium/High]
**Risk**: [Low/Medium/High]

**Current Code**:
```typescript
// Before optimization
[Current implementation]
```

**Optimized Code**:
```typescript
// After optimization
[Improved implementation with comments]
```

**Explanation**:
[Why this improves performance]

**Implementation Steps**:
1. [Step 1]
2. [Step 2]
3. [Validation step]

---

### Medium Impact

[Repeat structure for medium impact optimizations]

---

### Low Impact (Nice to Have)

[Repeat structure for low impact optimizations]

---

## Bundle Analysis

**Total Bundle Size**: [X] KB (target: [Y] KB)

### Large Dependencies

| Package | Size | Usage | Recommendation |
|---------|------|-------|----------------|
| [Package A] | [X] KB | [Where used] | Replace with lighter alternative / Tree shake / Lazy load |
| [Package B] | [Y] KB | [Where used] | Code split / Remove if unused |

### Code Splitting Opportunities

- [ ] Route-based splitting: [Routes that should be split]
- [ ] Component lazy loading: [Heavy components to lazy load]
- [ ] Library chunking: [Vendor libraries to separate]

### Tree Shaking Issues

- [ ] Check: Unused exports in [module]
- [ ] Fix: Side effect free annotations
- [ ] Verify: Production build is tree shaken

## Re-rendering Analysis (React)

### Components with Excessive Re-renders

| Component | Re-renders per Action | Cause | Fix |
|-----------|----------------------|-------|-----|
| [ComponentA] | [#] | Prop changes on every render | Memoize props / useCallback |
| [ComponentB] | [#] | Context value changes | Split context / useMemo |

### Memoization Opportunities

```typescript
// Before
function ExpensiveComponent({ data, onAction }) {
  const processed = expensiveCalculation(data); // Runs every render
  return <div onClick={onAction}>{processed}</div>;
}

// After
const ExpensiveComponent = React.memo(({ data, onAction }) => {
  const processed = useMemo(() => expensiveCalculation(data), [data]);
  const handleAction = useCallback(onAction, []);
  return <div onClick={handleAction}>{processed}</div>;
});
```

## Database Query Optimization

### Slow Queries

| Query | Execution Time | Location | Issue |
|-------|---------------|----------|-------|
| [Query description] | [X] ms | `file_path:line_number` | N+1 / Missing index / Full table scan |

### Optimization Strategy

**N+1 Query Fix**:
```typescript
// Before (N+1)
const users = await User.findAll();
for (const user of users) {
  user.posts = await Post.findAll({ where: { userId: user.id } });
}

// After (Single query with join)
const users = await User.findAll({
  include: [{ model: Post }]
});
```

**Indexing Recommendations**:
- [ ] Add index on `table.column` for query X
- [ ] Composite index on `(column1, column2)` for query Y

## Memory Leak Detection

### Suspected Leaks

**Location**: `file_path:line_number`
**Pattern**: [Event listener / Subscription / Closure / etc.]

**Evidence**:
```
Memory snapshots showing growth:
T+0:  [X] MB
T+5:  [Y] MB  (+[Z] MB)
T+10: [A] MB  (+[B] MB)
```

**Root Cause**:
```typescript
// Leaky code
useEffect(() => {
  const subscription = api.subscribe(handler);
  // ❌ No cleanup!
}, []);
```

**Fix**:
```typescript
// Fixed
useEffect(() => {
  const subscription = api.subscribe(handler);
  return () => subscription.unsubscribe(); // ✅ Cleanup
}, []);
```

## Implementation Plan

### Phase 1: Quick Wins (This Week)
**Target**: [X]% improvement

- [ ] [Optimization 1]: [Time estimate]
- [ ] [Optimization 2]: [Time estimate]
- [ ] Measure: Re-run profiling
- [ ] Validate: No functionality regression

### Phase 2: Major Optimizations (Next 2 Weeks)
**Target**: Additional [Y]% improvement

- [ ] [Optimization 3]: [Time estimate]
- [ ] [Optimization 4]: [Time estimate]
- [ ] Performance testing
- [ ] User acceptance testing

### Phase 3: Monitoring & Prevention (Ongoing)
- [ ] Set up performance monitoring
- [ ] Add performance budgets to CI
- [ ] Create performance regression tests

## Validation Metrics

**Before Optimization**:
- Load time: [X] ms
- Bundle size: [Y] KB
- Memory usage: [Z] MB

**After Optimization** (Target):
- Load time: [A] ms (-[B]%)
- Bundle size: [C] KB (-[D]%)
- Memory usage: [E] MB (-[F]%)

---

**Analyst**: Elite Debugging Master
**Profile Date**: [YYYY-MM-DD]
**Re-profile Date**: [YYYY-MM-DD]
```

---

## 4. Integration Issue Report

Use this template for problems involving communication between systems, APIs, or services.

```markdown
# Integration Issue Report

## Executive Summary

**Systems Involved**: [Service A] ↔ [Service B]
**Integration Type**: [REST API / GraphQL / Message Queue / Websocket / etc.]
**Issue**: [Connection failures / Data mismatch / Timeout / etc.]
**Impact**: [# users affected, features broken]
**Status**: [Investigating / Fix Proposed / Fixed]

## Integration Architecture

**Data Flow**:
```
[Client] → [API Gateway] → [Service A] → [Service B] → [Database]
  ↑                                                        ↓
  └──────────────────── Response ─────────────────────────┘
```

**Contract Definition**:
- Protocol: [HTTP/HTTPS/WebSocket/etc.]
- Format: [JSON/XML/Protocol Buffer/etc.]
- Authentication: [OAuth/JWT/API Key/etc.]
- Rate Limiting: [X requests per minute]

## Problem Description

**Symptoms**:
- [What fails or behaves incorrectly]
- [Error messages observed]
- [Frequency: Always/Intermittent/Specific conditions]

**Reproduction Steps**:
1. [Step 1]
2. [Step 2]
3. [Observed vs expected result]

**Error Messages**:
```
[Paste full error messages, stack traces, or logs]
```

**First Observed**: [Date/Time or commit hash]
**Environment**: [Development/Staging/Production]

## Investigation Findings

### Request/Response Analysis

**Request Sent**:
```json
{
  "endpoint": "/api/endpoint",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer [token]"
  },
  "body": {
    [Request payload]
  }
}
```

**Response Received**:
```json
{
  "status": 400,
  "body": {
    [Error response]
  }
}
```

**Expected Response**:
```json
{
  "status": 200,
  "body": {
    [Expected successful response]
  }
}
```

### API Contract Validation

| Aspect | Expected | Actual | Status |
|--------|----------|--------|--------|
| Status Code | 200 | 400 | ❌ |
| Response Format | JSON | JSON | ✅ |
| Required Fields | [field1, field2] | [field1 missing] | ❌ |
| Data Types | string, number | string, string | ❌ |
| Authentication | Valid token | Expired token | ❌ |

### Root Cause

**Primary Issue**: [Fundamental problem identified]

**Evidence**:
- Location: `service_file:line_number`
- Code:
```typescript
// Problematic integration code
[Code showing the issue]
```

**Why It Fails**:
[Detailed explanation of the failure mechanism]

**Contributing Factors**:
- [Secondary issue 1]
- [Secondary issue 2]
- [Environmental factor]

## Solutions

### Immediate Fix (Deploy Now)

**Change**:
```typescript
// Before
async function callServiceB(data) {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(data)
    // ❌ Missing headers, error handling
  });
  return response.json();
}

// After
async function callServiceB(data) {
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data),
      timeout: 5000
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Service B call failed:', error);
    throw new IntegrationError('Failed to call Service B', error);
  }
}
```

**Files Changed**:
- `file_path:line_number` - Added error handling
- `file_path:line_number` - Added authentication headers

### Root Cause Fix

**Comprehensive Solution**:
```typescript
// Create dedicated integration service
class ServiceBClient {
  private baseUrl: string;
  private authToken: string;
  private retryConfig: RetryConfig;

  async callEndpoint(data: RequestData): Promise<ResponseData> {
    return await this.withRetry(async () => {
      const response = await this.makeRequest(data);
      this.validateResponse(response);
      return this.parseResponse(response);
    });
  }

  private async withRetry<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    // Exponential backoff retry logic
  }

  private validateResponse(response: Response): void {
    // Contract validation
  }
}
```

**Benefits**:
- Centralized integration logic
- Consistent error handling
- Built-in retry mechanism
- Easy to test and mock

### Preventive Measures

#### API Contract Testing
```typescript
// Add contract tests
describe('Service B Integration', () => {
  it('should match API contract', async () => {
    const response = await serviceB.getData();

    expect(response).toMatchSchema({
      type: 'object',
      required: ['id', 'name', 'status'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        status: { type: 'string', enum: ['active', 'inactive'] }
      }
    });
  });
});
```

#### Error Monitoring
- [ ] Add logging for all API calls
- [ ] Set up alerts for error rate > X%
- [ ] Track response times and set SLA alerts
- [ ] Monitor authentication failures

#### Documentation
- [ ] Create API integration guide
- [ ] Document error codes and handling
- [ ] Maintain integration test suite
- [ ] Keep contract specifications updated

## Testing Plan

### Unit Tests
```typescript
describe('ServiceBClient', () => {
  it('handles successful responses', async () => {
    // Test happy path
  });

  it('retries on transient failures', async () => {
    // Test retry logic
  });

  it('throws IntegrationError on persistent failures', async () => {
    // Test error handling
  });
});
```

### Integration Tests
```typescript
describe('Service A → Service B Integration', () => {
  it('end-to-end data flow', async () => {
    // Test actual integration (staging environment)
  });
});
```

### Contract Tests
- [ ] Validate request format matches Service B expectations
- [ ] Validate response format matches Service A expectations
- [ ] Test all error scenarios
- [ ] Verify authentication flow

## Deployment Plan

### Rollout Strategy
1. **Deploy to Development**: Validate fix in dev environment
2. **Integration Testing**: Run full test suite
3. **Deploy to Staging**: Monitor for 24 hours
4. **Gradual Production Rollout**:
   - 10% traffic → Monitor → 50% → Monitor → 100%
5. **Monitor**: Error rates, response times, success rates

### Rollback Plan
- Condition: Error rate > 5% or response time > 2x baseline
- Action: Immediate rollback to previous version
- Time to rollback: < 5 minutes

### Monitoring

**Key Metrics**:
- Success rate: Target >99.5%
- Error rate: Target <0.5%
- Average response time: Target <200ms
- P95 response time: Target <500ms
- Authentication failures: Target <0.1%

**Alerts**:
- Error rate > 1% → Page on-call
- Response time > 1s → Warning
- Service B unavailable → Critical alert

---

**Analyst**: Elite Debugging Master
**Investigation Date**: [YYYY-MM-DD]
**Fix Deployment Date**: [YYYY-MM-DD]
**Follow-up Review**: [YYYY-MM-DD + 1 week]
```

---

## 5. Type System Audit Report

Use this template for TypeScript type-related debugging and architecture reviews.

```markdown
# Type System Audit Report

## Executive Summary

**Scope**: [Full codebase / Specific module]
**Type Violations Found**: [#] critical, [#] high, [#] medium
**Overall Type Health**: [Excellent/Good/Needs Improvement/Critical]
**Primary Issue**: [Most critical type system problem]

## Type Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Type boundary violations | [#] | 0 | ✅/⚠️/❌ |
| Duplicate type definitions | [#] | 0 | ✅/⚠️/❌ |
| Missing type exports | [#] | 0 | ✅/⚠️/❌ |
| Implicit 'any' usage | [#] | 0 | ✅/⚠️/❌ |
| Circular type dependencies | [#] | 0 | ✅/⚠️/❌ |
| Average type file size | [#] lines | <200 | ✅/⚠️/❌ |
| Type coverage | [X]% | >95% | ✅/⚠️/❌ |

## Critical Issues (P0)

### 1. Type Boundary Violations

**Problem**: Client code importing server-only types

**Occurrences**: [#] files
**Files Affected**:
- `client/file1.ts:line_number`
- `client/file2.ts:line_number`

**Example**:
```typescript
// ❌ client/hooks/useData.ts
import type { ServerConfig } from '../../server/types/config';
// Violates: Client ← Shared → Server architecture
```

**Root Cause**: Types placed in wrong architectural layer

**Fix**:
```typescript
// ✅ Move to shared layer
// shared/types/Config.ts
export interface AppConfig {
  // Shared configuration
}

// client/hooks/useData.ts
import type { AppConfig } from '../../shared/types/Config';
```

**Implementation**:
1. Create `shared/types/[TypeName].ts`
2. Move type definitions
3. Update all imports (client + server)
4. Delete old server type file
5. Run type-check to verify

---

### 2. Duplicate Type Definitions

**Problem**: Same type defined in multiple locations

**Duplicates Found**:

| Type Name | Locations | Definitions Differ |
|-----------|-----------|-------------------|
| Location | 2 files | Yes (field mismatch) |
| User | 3 files | No (exact duplicates) |

**Example**:
```typescript
// ❌ types/LocationA.ts
export interface Location {
  id: string;
  name: string;
}

// ❌ types/LocationB.ts
export interface Location {
  id: string;
  name: string;
  coordinates?: [number, number]; // Different!
}
```

**Root Cause**: Lack of single source of truth

**Fix**:
```typescript
// ✅ shared/types/Location.ts (Single source)
export interface Location {
  id: string;
  name: string;
  coordinates?: [number, number];
}

// Update all imports to use this single source
```

---

## High Priority Issues (P1)

### 3. Missing Type Exports

**Problem**: Types defined but not exported from index files

**Files Affected**:
- `shared/types/Evidence.ts` - ActionPoints interface not exported
- `shared/types/Player.ts` - PlayerState not in index.ts

**Fix**:
```typescript
// shared/types/index.ts
export * from './Evidence';
export * from './Player';
export * from './ActionPoints'; // Add missing exports
```

---

### 4. Large Type Files

**Problem**: Type files exceeding maintainability threshold

| File | Lines | Recommended Action |
|------|-------|-------------------|
| Evidence.ts | 395 | Split into Evidence, ActionPoints, Player |
| Case.ts | 287 | Split into Case, CaseConfig, CaseState |

**Refactoring Plan**:
```
Evidence.ts (395 lines)
  → Evidence.ts (150 lines) - Evidence types only
  → ActionPoints.ts (120 lines) - AP system types
  → Player.ts (125 lines) - Player state types
```

---

## Type Architecture Review

### Current Layer Separation

```
Client Layer (28 components, 15 hooks)
  ↓ imports from
Shared Layer (7 type files, 58 exported types)
  ↑ imports from
Server Layer (38 services)
```

**Violations Found**:
- Client → Server: [#] imports
- Server → Client: [#] imports (should be 0)

### Recommended Architecture

```
src/
  shared/
    types/
      index.ts          # Re-exports all
      Case.ts           # Case-related types
      Evidence.ts       # Evidence types only
      ActionPoints.ts   # AP system types
      Player.ts         # Player state types
      Location.ts       # Location types
      Image.ts          # Image generation types
      Narration.ts      # Narration types
```

## Implementation Roadmap

### Week 1: Fix P0 Issues
- [ ] Move server types to shared layer
- [ ] Fix all boundary violation imports
- [ ] Delete obsolete server type files
- [ ] Run type-check to verify

### Week 2: Fix P1 Issues
- [ ] Add missing type exports to index files
- [ ] Split large type files (Evidence.ts priority)
- [ ] Update all imports
- [ ] Documentation updates

### Week 3: Preventive Measures
- [ ] Add ESLint rule: `no-restricted-imports` for client → server
- [ ] Create type organization guidelines
- [ ] Set up pre-commit type checking
- [ ] Add type coverage reporting

## Validation

**Type Check Command**:
```bash
npm run type-check
# or
tsc --noEmit
```

**Expected Result**: 0 errors

**Boundary Validation**:
```bash
# Check for client → server imports
grep -r "from.*server" src/client/
# Expected: No results
```

---

**Auditor**: Elite Debugging Master
**Audit Date**: [YYYY-MM-DD]
**Next Audit**: [YYYY-MM-DD + 1 month]
```

---

## Usage Guidelines

### Choosing the Right Template

| Scenario | Template |
|----------|----------|
| Specific bug or error | Bug Analysis Report |
| Reviewing overall codebase health | Architecture Analysis Report |
| App is slow or using too much memory | Performance Profile Report |
| API or service communication failing | Integration Issue Report |
| TypeScript errors or type issues | Type System Audit Report |

### Customization Tips

1. **Add Project-Specific Sections**: Tailor templates to your architecture
2. **Include Screenshots**: Visual evidence helps communicate issues
3. **Link to Monitoring**: Reference dashboards, logs, or metrics
4. **Reference Standards**: Link to your team's coding guidelines
5. **Track Over Time**: Compare metrics across multiple reports

### Best Practices

- ✅ Fill in ALL sections, even if "N/A"
- ✅ Include code snippets with context
- ✅ Reference specific file locations with line numbers
- ✅ Provide both immediate and root cause fixes
- ✅ Add verification steps
- ✅ Set concrete success metrics
- ❌ Don't skip the Executive Summary
- ❌ Don't provide solutions without explaining root cause
- ❌ Don't forget to update reports after fixes are applied

---

**Version**: 1.0.0
**Last Updated**: 2025-10-21
**Maintainer**: Elite Debugging Master
