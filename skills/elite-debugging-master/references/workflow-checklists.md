# Workflow Checklists

Systematic checklists for debugging workflows to ensure thoroughness and consistency.

---

## 1. Bug Investigation Checklist

Use this checklist when investigating any bug or error.

### Phase 1: Symptom Analysis

- [ ] **Read full error message**
  - Copy complete stack trace
  - Note error code/type
  - Identify failing line number

- [ ] **Reproduce the bug**
  - Document exact steps to trigger
  - Test in different environments (dev/staging/prod)
  - Note frequency (always/intermittent/rare)
  - Record any patterns (time-based, data-dependent, etc.)

- [ ] **Gather context**
  - When was this working last?
  - What changed recently? (git log)
  - Who reported it? (user/developer/automated test)
  - What's the impact? (# users affected, features broken)

- [ ] **Define expected behavior**
  - What should happen instead?
  - Reference specs or requirements
  - Check if behavior ever worked correctly

### Phase 2: Code Investigation

- [ ] **Locate error source**
  - Use stack trace to find exact file:line
  - Use Grep to find error message in code
  - Read the failing function/method

- [ ] **Trace data flow backwards**
  - What calls this function?
  - Where does the data come from?
  - What transformations occur before error?

- [ ] **Map dependencies**
  - Read all imports in failing file
  - Check service dependencies
  - Identify external API calls
  - Note database queries involved

- [ ] **Check git history**
  - `git log --oneline -- <failing_file>`
  - `git diff HEAD~5 -- <failing_file>`
  - Review recent PRs touching this code
  - Check for related changes in dependencies

### Phase 3: Root Cause Analysis

- [ ] **Answer: What is failing?**
  - Specific function/component/service
  - Type of failure (exception/logic error/performance)

- [ ] **Answer: How does it fail?**
  - Trace execution path to failure
  - Identify exact condition triggering failure
  - Note any error handling (or lack thereof)

- [ ] **Answer: Why does it fail?**
  - Identify fundamental issue
  - Distinguish symptom from root cause
  - Note contributing factors

- [ ] **Answer: Why wasn't this caught?**
  - Missing test coverage?
  - Missing validation?
  - Testing gap?

### Phase 4: Solution Design

- [ ] **Identify immediate fix**
  - Minimal change to restore functionality
  - Can be deployed quickly (<1 hour)
  - Low risk, high confidence

- [ ] **Identify root cause fix**
  - Addresses fundamental issue
  - May require refactoring
  - Prevents recurrence

- [ ] **Plan preventive measures**
  - Linting rules to prevent pattern
  - Additional tests for scenario
  - Documentation updates
  - Monitoring/alerting additions

### Phase 5: Verification

- [ ] **Test fix locally**
  - Reproduce original bug
  - Apply fix
  - Verify bug no longer occurs
  - Test edge cases

- [ ] **Run test suite**
  - All existing tests pass
  - Added test for bug scenario
  - No new failures introduced

- [ ] **Type check** (TypeScript)
  - `npm run type-check` passes
  - No new type errors

- [ ] **Build verification**
  - `npm run build` succeeds
  - No new warnings
  - Bundle size acceptable

- [ ] **Regression testing**
  - Test related features
  - Verify no side effects
  - Check performance impact

---

## 2. Architecture Review Checklist

Use this checklist for comprehensive codebase architecture analysis.

### Preparation

- [ ] **Define scope**
  - Full codebase or specific module?
  - Which layers? (client/server/shared/all)
  - Time budget for review

- [ ] **Gather metrics**
  - Total files per layer
  - Average file sizes
  - Number of services/components
  - Dependency graph complexity

### Type System Audit

- [ ] **Check boundary violations**
  - Grep: `from.*server` in src/client/
  - Grep: `from.*client` in src/server/
  - Expected: 0 violations

- [ ] **Find duplicate type definitions**
  - Grep: `export.*interface X` (for each major type)
  - Count occurrences
  - Validate: Each type defined once

- [ ] **Verify type exports**
  - Read: `src/shared/types/index.ts`
  - Check: All type files re-exported
  - Check: No missing exports

- [ ] **Check type file sizes**
  - Bash: `wc -l src/shared/types/*.ts`
  - Identify: Files >200 lines
  - Note: Candidates for splitting

- [ ] **Find implicit 'any' usage**
  - Grep: `: any` in codebase
  - Count occurrences
  - Validate: Minimal usage

### Service Layer Audit

- [ ] **Check service sizes**
  - Bash: `wc -l src/server/services/**/*.ts`
  - Identify: God services (>500 lines)
  - Note: Candidates for splitting

- [ ] **Check service organization**
  - Count: Services per directory
  - Identify: Over-distributed services
  - Note: Consolidation opportunities

- [ ] **Find circular dependencies**
  - Check: ServiceA imports ServiceB AND ServiceB imports ServiceA
  - Use: Build warnings
  - Validate: No circular deps

- [ ] **Check repository pattern adherence**
  - Grep: `redis.get` OR `db.query` in service files
  - Expected: 0 (should use repositories)
  - Note: Direct storage access violations

### Component Layer Audit

- [ ] **Find missing useEffect cleanup**
  - Grep: `useEffect.*subscribe` with `-A 10`
  - Check: Each has `return () =>`
  - Note: Missing cleanup functions

- [ ] **Check prop drilling depth**
  - Manually trace: Data props through component tree
  - Identify: Drilling >3 levels
  - Note: Candidates for Context/state management

- [ ] **Check component sizes**
  - Bash: `wc -l src/client/components/**/*.tsx`
  - Identify: Components >200 lines
  - Note: Candidates for splitting

- [ ] **Find state management inconsistencies**
  - Grep: `useState.*user` (for example)
  - Count: Duplicate state definitions
  - Note: Should be centralized

### API Layer Audit

- [ ] **Check input validation**
  - Read: API route handlers
  - Verify: Each endpoint validates input
  - Note: Missing validation

- [ ] **Check error response consistency**
  - Grep: `res.status(4` (4xx errors)
  - Read: Error response formats
  - Verify: Consistent error structure

- [ ] **Find synchronous blocking operations**
  - Grep: `fs.readFileSync` OR `Sync(` in API handlers
  - Expected: 0 (should be async)
  - Note: Blocking operations

### Documentation

- [ ] **Create findings summary**
  - P0: Critical issues (immediate fix)
  - P1: High priority (this week)
  - P2: Medium priority (this month)
  - P3: Low priority (backlog)

- [ ] **Generate metrics report**
  - Before/after metrics table
  - Improvement targets
  - Success criteria

- [ ] **Create implementation roadmap**
  - Phase 1: P0 fixes
  - Phase 2: P1 fixes
  - Phase 3: P2 fixes
  - Phase 4: P3 + prevention

---

## 3. Performance Profiling Checklist

Use this checklist when investigating performance issues.

### Baseline Measurement

- [ ] **Define performance metrics**
  - Load time target
  - Time to Interactive target
  - Memory usage target
  - CPU usage target

- [ ] **Measure current state**
  - Run Lighthouse audit
  - Measure with Chrome DevTools
  - Record baseline metrics
  - Document environment (dev/prod)

- [ ] **Identify bottleneck type**
  - [ ] Bundle size issue
  - [ ] Re-rendering issue
  - [ ] Database query issue
  - [ ] Network issue
  - [ ] Memory leak
  - [ ] CPU-intensive operation

### Bundle Analysis (If Applicable)

- [ ] **Analyze bundle composition**
  - Run: `npm run build -- --analyze`
  - Check: Total bundle size
  - Identify: Largest dependencies

- [ ] **Find code splitting opportunities**
  - Check: Route-based splitting
  - Check: Component lazy loading
  - Check: Library chunking

- [ ] **Check tree shaking**
  - Verify: Production build tree shaken
  - Check: Side effect annotations
  - Find: Unused exports

- [ ] **Find large dependencies**
  - List: Top 10 largest packages
  - Research: Lighter alternatives
  - Plan: Replacements or lazy loading

### Re-render Analysis (React)

- [ ] **Profile component renders**
  - Use: React DevTools Profiler
  - Identify: Components rendering excessively
  - Note: Re-render counts per action

- [ ] **Find missing memoization**
  - Grep: `useMemo` usage
  - Grep: `useCallback` usage
  - Grep: `React.memo` usage
  - Identify: Expensive calculations not memoized

- [ ] **Find prop stability issues**
  - Check: Inline function props
  - Check: Object props created each render
  - Check: Context value changes

- [ ] **Find state management issues**
  - Check: Global state changes triggering re-renders
  - Check: Context splitting opportunities
  - Check: Unnecessary state updates

### Database Query Analysis

- [ ] **Profile slow queries**
  - Enable: Query logging
  - Measure: Execution times
  - Identify: Queries >100ms

- [ ] **Find N+1 queries**
  - Check: Loops with queries inside
  - Verify: Proper use of joins/includes
  - Note: N+1 patterns

- [ ] **Check indexing**
  - Review: WHERE clause columns
  - Verify: Indexes exist
  - Plan: Missing indexes

- [ ] **Check query complexity**
  - Review: Complex joins
  - Check: Full table scans
  - Consider: Query optimization

### Memory Leak Detection

- [ ] **Take memory snapshots**
  - Baseline: After initial load
  - T+5min: During usage
  - T+10min: Extended usage
  - Compare: Memory growth

- [ ] **Find suspected leaks**
  - Grep: `useEffect` without cleanup
  - Grep: Event listeners without removal
  - Grep: Subscriptions without unsubscribe
  - Check: Closure retaining large objects

- [ ] **Validate leak suspicions**
  - Add cleanup functions
  - Re-measure memory
  - Verify: Memory stable

### Optimization Implementation

- [ ] **Prioritize optimizations**
  - High impact, low effort (do first)
  - High impact, high effort (plan carefully)
  - Low impact (nice to have)

- [ ] **Implement optimizations**
  - Apply one at a time
  - Measure after each
  - Document improvements

- [ ] **Verify improvements**
  - Re-run profiling
  - Compare before/after
  - Ensure: No functionality regression

---

## 4. Integration Debugging Checklist

Use this checklist for API/service integration issues.

### Problem Documentation

- [ ] **Document symptoms**
  - Exact error messages
  - Failure frequency
  - Affected endpoints/operations
  - Impact (# users, features affected)

- [ ] **Capture request/response**
  - Full request (headers, body, params)
  - Full response (status, headers, body)
  - Expected vs actual response

### Contract Validation

- [ ] **Verify API contract**
  - Check: Request format matches spec
  - Check: Response format matches spec
  - Check: Status codes correct
  - Check: Required fields present

- [ ] **Check authentication**
  - Verify: Token valid
  - Verify: Token not expired
  - Check: Correct auth header format
  - Check: Permissions/scopes sufficient

- [ ] **Check data types**
  - Verify: Field types match contract
  - Check: Date formats consistent
  - Check: Enum values valid
  - Check: Nullable fields handled

### Integration Flow Analysis

- [ ] **Trace data flow**
  - Client → API Gateway → Service A → Service B
  - Identify: Where failure occurs
  - Check: Each hop in chain

- [ ] **Check error handling**
  - Verify: Try-catch blocks present
  - Check: Errors propagated correctly
  - Check: Error messages helpful
  - Verify: No swallowed errors

- [ ] **Check timeout configuration**
  - Verify: Reasonable timeout set
  - Check: Retry logic present
  - Check: Exponential backoff used
  - Verify: Circuit breaker pattern (if needed)

### Fix Implementation

- [ ] **Add missing error handling**
  - Wrap in try-catch
  - Add error logging
  - Return meaningful error messages
  - Set appropriate status codes

- [ ] **Add missing validation**
  - Validate input before sending
  - Validate response before using
  - Check required fields
  - Validate data types

- [ ] **Improve robustness**
  - Add retry logic
  - Add timeout handling
  - Add fallback behavior
  - Add circuit breaker (if needed)

### Testing

- [ ] **Write contract tests**
  - Test request format
  - Test response format
  - Test error scenarios
  - Test edge cases

- [ ] **Test integration end-to-end**
  - Test happy path
  - Test error paths
  - Test timeout scenarios
  - Test retry logic

- [ ] **Monitor in production**
  - Add logging
  - Add metrics
  - Set up alerts
  - Track error rates

---

## 5. Pre-Fix Validation Checklist

Use this checklist BEFORE applying any fix.

### Understanding the Fix

- [ ] **Understand the root cause**
  - Can explain why bug occurs
  - Can explain why fix works
  - Understand side effects

- [ ] **Verify fix addresses root cause**
  - Not just a symptom fix
  - Not just a workaround
  - Actually solves the problem

- [ ] **Review fix scope**
  - Files to be modified
  - Lines of code changed
  - New dependencies added
  - Breaking changes introduced

### Risk Assessment

- [ ] **Identify affected areas**
  - Direct: Code being changed
  - Indirect: Code depending on changed code
  - Broader: Similar patterns elsewhere

- [ ] **Assess risk level**
  - [ ] Low: Isolated change, well tested
  - [ ] Medium: Moderate scope, some unknowns
  - [ ] High: Wide impact, complex change

- [ ] **Plan rollback strategy**
  - How to undo if issues occur?
  - How long to revert?
  - Monitoring to detect issues

### Testing Plan

- [ ] **Define test scenarios**
  - Original bug scenario
  - Edge cases
  - Related functionality
  - Performance impact

- [ ] **Prepare test data**
  - Data that triggers bug
  - Data for edge cases
  - Production-like data

### Backup & Safety

- [ ] **Create backup** (if needed)
  - Backup database (if changing schema)
  - Tag current commit
  - Note current state

- [ ] **Check deployment window**
  - Safe to deploy now?
  - Low traffic period?
  - Team available to monitor?

---

## 6. Post-Fix Verification Checklist

Use this checklist AFTER applying a fix.

### Immediate Verification

- [ ] **Build succeeds**
  - `npm run build` → No errors
  - No new warnings
  - Bundle size acceptable

- [ ] **Type check passes**
  - `npm run type-check` → No errors
  - No new type issues

- [ ] **Linter passes**
  - `npm run lint` → No errors
  - No new warnings

- [ ] **Tests pass**
  - Unit tests: All pass
  - Integration tests: All pass
  - E2E tests: All pass (if applicable)

### Functional Verification

- [ ] **Original bug fixed**
  - Reproduce original steps
  - Verify: Bug no longer occurs
  - Test: Multiple times to confirm

- [ ] **Edge cases work**
  - Test boundary conditions
  - Test null/undefined cases
  - Test extreme values

- [ ] **Related features work**
  - Test adjacent functionality
  - Test dependent features
  - Verify: No side effects

### Performance Verification

- [ ] **No performance regression**
  - Compare load times
  - Compare memory usage
  - Compare response times
  - Verify: Within acceptable range

### Code Quality Verification

- [ ] **Code review checklist**
  - Follows existing patterns
  - Readable and maintainable
  - Properly documented
  - No code smells

- [ ] **Test coverage maintained**
  - New code has tests
  - Coverage % not decreased
  - Bug scenario covered

### Documentation

- [ ] **Update documentation**
  - API docs (if API changed)
  - Code comments (if complex)
  - README (if setup changed)
  - Changelog (if user-facing)

- [ ] **Document fix**
  - What was fixed
  - How it was fixed
  - Why this approach
  - Related files changed

### Deployment Verification

- [ ] **Deploy to staging**
  - Fix works in staging
  - Monitor for issues
  - Run smoke tests

- [ ] **Monitor production** (after deployment)
  - Error rates normal
  - Performance normal
  - No new alerts
  - User feedback positive

---

## 7. Root Cause Validation Checklist

Use this checklist to ensure you've found the true root cause.

### 5 Whys Analysis

- [ ] **Why #1: What failed?**
  - Surface symptom identified
  - Specific error/behavior noted

- [ ] **Why #2: Why did it fail?**
  - Immediate cause identified
  - Proximate factor found

- [ ] **Why #3: Why did that happen?**
  - Underlying cause identified
  - Design flaw or implementation gap

- [ ] **Why #4: Why wasn't it prevented?**
  - Process gap identified
  - Missing validation/testing

- [ ] **Why #5: Why is this pattern possible?**
  - Systemic issue identified
  - Root cause found

### Root Cause Validation

- [ ] **Explains all symptoms**
  - Root cause accounts for all observed issues
  - No unexplained behavior remains

- [ ] **Explains why it started when it did**
  - Timing makes sense
  - Correlates with changes/events

- [ ] **Explains why it doesn't always occur** (if intermittent)
  - Understands triggering conditions
  - Can reproduce reliably

- [ ] **Explains why similar code doesn't fail**
  - Understands what's different
  - Knows why isolated to this case

### Evidence Checklist

- [ ] **Have code evidence**
  - Can point to exact lines
  - Can show problematic pattern
  - Can demonstrate with example

- [ ] **Have test evidence**
  - Can create failing test
  - Test passes after fix
  - Test validates hypothesis

- [ ] **Have historical evidence**
  - Git history supports theory
  - Timing aligns with changes
  - Can identify introducing commit

### Solution Validation

- [ ] **Fix addresses root cause**
  - Not just symptom relief
  - Prevents recurrence
  - Comprehensive solution

- [ ] **Fix is minimal**
  - No unnecessary changes
  - Smallest change that works
  - Low risk

- [ ] **Fix is sustainable**
  - No technical debt created
  - Maintainable long-term
  - Follows best practices

---

## 8. Quick Decision Trees

### "Should I use Sequential Thinking?"

```
Is the problem multi-faceted? → YES → Use Sequential Thinking
  ↓ NO
Are there multiple potential causes? → YES → Use Sequential Thinking
  ↓ NO
Is the solution non-obvious? → YES → Use Sequential Thinking
  ↓ NO
Is there architectural complexity? → YES → Use Sequential Thinking
  ↓ NO
Simple problem → Skip Sequential Thinking, proceed directly
```

### "What kind of report should I write?"

```
Specific bug or error? → Bug Analysis Report
Reviewing codebase health? → Architecture Analysis Report
Performance issue? → Performance Profile Report
API/integration issue? → Integration Issue Report
Type system issue? → Type System Audit Report
```

### "What's my next debugging step?"

```
Have error message?
  → YES → Read error, locate in code
  → NO → Reproduce bug to get error

Know where error occurs?
  → YES → Read file, understand context
  → NO → Grep for error message

Understand immediate cause?
  → YES → Trace backwards to root cause
  → NO → Map dependencies, check git history

Know root cause?
  → YES → Design fix
  → NO → Use Sequential Thinking to analyze

Have fix?
  → YES → Validate with checklist, then apply
  → NO → Research solutions, evaluate options
```

---

## 9. Checklist Templates for Common Scenarios

### Quick Bug Fix Checklist (15 min)

- [ ] Read error message
- [ ] Grep to find error location
- [ ] Read problematic file
- [ ] Identify immediate cause
- [ ] Apply minimal fix
- [ ] Run type-check
- [ ] Run build
- [ ] Test fix works
- [ ] Document what changed

### Comprehensive Bug Investigation (1-2 hours)

- [ ] Complete Bug Investigation Checklist (all phases)
- [ ] Use Sequential Thinking for root cause
- [ ] Write Bug Analysis Report
- [ ] Apply fix with tests
- [ ] Complete Post-Fix Verification Checklist
- [ ] Document in FIXES_APPLIED.md

### Architecture Refactoring (1 week)

- [ ] Complete Architecture Review Checklist
- [ ] Write Architecture Analysis Report
- [ ] Prioritize issues (P0-P3)
- [ ] Create implementation roadmap
- [ ] Apply P0 fixes with verification
- [ ] Apply P1 fixes with verification
- [ ] Add preventive measures
- [ ] Update documentation

---

**Version**: 1.0.0
**Last Updated**: 2025-10-21
**Maintainer**: Elite Debugging Master
