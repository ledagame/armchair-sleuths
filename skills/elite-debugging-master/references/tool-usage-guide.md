# Tool Usage Guide

Comprehensive guide for effectively using debugging tools in the Elite Debugging Master workflow.

---

## Core Tools Overview

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **Grep** | Search file contents | Finding code patterns, errors, imports |
| **Glob** | Find files by pattern | Locating files, exploring structure |
| **Read** | Read file contents | Examining code, checking implementations |
| **Bash** | Execute shell commands | Git operations, testing, validation |
| **Sequential Thinking** | Multi-step reasoning | Complex debugging, root cause analysis |

---

## 1. Grep Tool (Content Search)

### Basic Usage

**Purpose**: Search for patterns within file contents

**Syntax**:
```typescript
Grep: {
  pattern: "search_pattern",
  path: "optional/directory",
  glob: "*.ts",
  output_mode: "files_with_matches" | "content" | "count"
}
```

### Common Debugging Patterns

#### Pattern 1: Find Import Violations

**Goal**: Detect client code importing from server layer

```typescript
// Find client → server imports
Grep: {
  pattern: "from.*server",
  path: "src/client",
  glob: "**/*.ts",
  output_mode: "content",
  "-n": true  // Show line numbers
}
```

**Interpretation**:
```
src/client/hooks/useData.ts:5: import type { ServerConfig } from '../../server/types';
```
→ Found violation at line 5

#### Pattern 2: Find Missing Cleanup in useEffect

```typescript
// Find useEffect with subscriptions but no cleanup
Grep: {
  pattern: "useEffect.*subscribe",
  glob: "**/*.tsx",
  output_mode: "content",
  "-B": 2,  // Show 2 lines before
  "-A": 5   // Show 5 lines after
}
```

**Analysis**:
If the lines after don't include `return () =>`, there's likely missing cleanup.

#### Pattern 3: Find Duplicate Type Definitions

```typescript
// Find all exports of interface "Location"
Grep: {
  pattern: "export.*interface Location",
  path: "src",
  output_mode: "files_with_matches"
}
```

**Result**:
```
src/shared/types/Location.ts
src/server/types/Location.ts
```
→ Duplicate found! Should consolidate.

#### Pattern 4: Find Error Handling Gaps

```typescript
// Find async functions without try-catch
Grep: {
  pattern: "async function.*\\{",
  glob: "**/*.ts",
  output_mode: "content"
}
```

Then manually check if try-catch exists in the function body.

### Advanced Grep Techniques

#### Multi-line Pattern Matching

```typescript
// Find struct definitions spanning multiple lines
Grep: {
  pattern: "interface.*\\{[\\s\\S]*?field",
  multiline: true,
  output_mode: "content"
}
```

**Use Case**: Detecting complex type structures

#### Case-Insensitive Search

```typescript
Grep: {
  pattern: "todo|fixme",
  "-i": true,  // Case insensitive
  output_mode: "content"
}
```

**Use Case**: Finding TODO comments regardless of casing

#### Combining with File Type Filters

```typescript
Grep: {
  pattern: "console\\.log",
  type: "ts",  // Only TypeScript files
  output_mode: "files_with_matches"
}
```

**Use Case**: Find debug logging in production code

### Grep Output Modes

#### Mode: `files_with_matches` (Default)
**When**: You want to know *where* the pattern exists
**Output**: List of file paths

```
src/client/hooks/useData.ts
src/client/components/DataView.tsx
```

#### Mode: `content`
**When**: You need to see the actual code
**Output**: File path + matching lines

```
src/client/hooks/useData.ts:5: import type { ServerConfig } from '../../server/types';
```

#### Mode: `count`
**When**: You need statistics
**Output**: File path + match count

```
src/client/hooks/useData.ts:3
src/client/components/DataView.tsx:1
```

### Grep Best Practices

✅ **DO**:
- Use specific patterns to reduce noise
- Combine with `glob` to filter file types
- Use `-n` with `content` mode to get line numbers
- Use context flags (`-A`, `-B`, `-C`) to see surrounding code

❌ **DON'T**:
- Search without specifying path (searches entire codebase)
- Use overly generic patterns like `.*` or `function`
- Forget to escape special regex characters

---

## 2. Glob Tool (File Pattern Matching)

### Basic Usage

**Purpose**: Find files matching name patterns

**Syntax**:
```typescript
Glob: {
  pattern: "file_pattern",
  path: "optional/directory"
}
```

### Common Debugging Patterns

#### Pattern 1: Find All Services

```typescript
Glob: {
  pattern: "src/server/services/**/*.ts"
}
```

**Output**: List of all service files
**Use Case**: Architectural review, counting services

#### Pattern 2: Find Specific Component Type

```typescript
Glob: {
  pattern: "src/client/components/**/*Card.tsx"
}
```

**Output**: All Card components
**Use Case**: Finding components following naming conventions

#### Pattern 3: Find Test Files

```typescript
Glob: {
  pattern: "**/*.test.ts"
}
```

**Output**: All test files
**Use Case**: Test coverage analysis

#### Pattern 4: Find Type Definition Files

```typescript
Glob: {
  pattern: "src/shared/types/**/*.ts"
}
```

**Output**: All type definition files
**Use Case**: Type system audit

### Glob Patterns Explained

| Pattern | Matches | Example |
|---------|---------|---------|
| `*.ts` | Any .ts file in current dir | `User.ts` |
| `**/*.ts` | Any .ts file recursively | `src/server/User.ts` |
| `**/test/*.ts` | .ts files in any test/ dir | `src/test/unit.ts` |
| `*.{ts,tsx}` | .ts OR .tsx files | `Component.tsx` |
| `[A-Z]*.ts` | Files starting with capital | `User.ts` |

### Glob Best Practices

✅ **DO**:
- Use `**` for recursive searches
- Specify file extensions to reduce noise
- Use braces `{ts,tsx}` for multiple extensions
- Start with more specific patterns, broaden if needed

❌ **DON'T**:
- Use Glob to search file *contents* (use Grep instead)
- Search without extension filters (too many results)
- Forget that Glob returns paths, not content

---

## 3. Read Tool (File Examination)

### Basic Usage

**Purpose**: Read and examine file contents

**Syntax**:
```typescript
Read: {
  file_path: "/absolute/path/to/file.ts",
  offset: 100,    // Optional: start at line 100
  limit: 50       // Optional: read 50 lines
}
```

### Strategic Reading

#### Strategy 1: Read Suspected Problem File

After Grep finds violations:
```typescript
// 1. Grep found issue in file
Grep: { pattern: "from.*server", path: "src/client" }
// Result: src/client/hooks/useData.ts

// 2. Read the full file
Read: { file_path: "src/client/hooks/useData.ts" }

// 3. Analyze all imports and dependencies
```

#### Strategy 2: Read Large Files in Chunks

```typescript
// Read first 100 lines (imports, type defs)
Read: {
  file_path: "src/server/services/CaseGenerator.ts",
  limit: 100
}

// Analyze structure, then read specific section if needed
Read: {
  file_path: "src/server/services/CaseGenerator.ts",
  offset: 200,
  limit: 50
}
```

#### Strategy 3: Read Related Files in Parallel

```typescript
// Read multiple files at once for comparison
Read: { file_path: "src/shared/types/Location.ts" }
Read: { file_path: "src/server/types/Location.ts" }
Read: { file_path: "src/client/types/index.ts" }

// Compare to find duplicates or inconsistencies
```

### Reading Output Analysis

**Line Number Format**:
```
     1→import { useState } from 'react';
     2→import type { User } from './types';
     3→
```

**Analysis Checklist**:
- [ ] Check imports (lines 1-20 typically)
- [ ] Identify dependencies
- [ ] Look for type definitions
- [ ] Find exported functions/classes
- [ ] Note any TODO/FIXME comments
- [ ] Check for error handling patterns

### Read Best Practices

✅ **DO**:
- Read multiple related files in parallel
- Start with imports section to understand dependencies
- Use offset/limit for very large files (>2000 lines)
- Note line numbers for precise references

❌ **DON'T**:
- Read entire 5000+ line files at once
- Skip reading before making changes
- Forget that Read shows line numbers (use them in reports)

---

## 4. Bash Tool (Command Execution)

### Git Investigation Commands

#### Command 1: Check Recent Changes

```bash
Bash: {
  command: "git log --oneline -10"
}
```

**Output**:
```
a3f5d2c fix: resolve type errors
b8e4c1a feat: add image generation
c9d2e0b refactor: split services
```

**Use Case**: Understanding recent changes that might have introduced bugs

#### Command 2: Find When Issue Started

```bash
Bash: {
  command: "git log --all --oneline -- src/client/hooks/useData.ts"
}
```

**Use Case**: Trace history of a problematic file

#### Command 3: See What Changed in Commit

```bash
Bash: {
  command: "git show a3f5d2c --stat"
}
```

**Use Case**: Understand scope of changes in suspected commit

#### Command 4: Compare with Previous Version

```bash
Bash: {
  command: "git diff HEAD~5 -- src/server/services/CaseGenerator.ts"
}
```

**Use Case**: See what changed in last 5 commits

#### Command 5: Find Who Changed a Line

```bash
Bash: {
  command: "git blame src/client/types/index.ts -L 10,20"
}
```

**Use Case**: Understand context of specific code lines

### Type Checking Commands

```bash
# Run TypeScript type check
Bash: {
  command: "npm run type-check"
}

# Or direct tsc
Bash: {
  command: "tsc --noEmit"
}
```

**Expected Output (Success)**:
```
(No output)
Exit code: 0
```

**Expected Output (Errors)**:
```
src/client/hooks/useData.ts:5:25 - error TS2307: Cannot find module '../../server/types'
```

### Build and Test Commands

```bash
# Run build
Bash: { command: "npm run build" }

# Run tests
Bash: { command: "npm test" }

# Run linter
Bash: { command: "npm run lint" }
```

### Directory Exploration

```bash
# List service files
Bash: { command: "ls -la src/server/services/" }

# Count TypeScript files
Bash: { command: "find src -name '*.ts' | wc -l" }

# Check file sizes
Bash: { command: "wc -l src/shared/types/*.ts" }
```

### Bash Best Practices

✅ **DO**:
- Use Git commands to understand change history
- Verify fixes with type-check and build commands
- Chain commands with `&&` for sequential operations
- Use absolute paths or `cd` first

❌ **DON'T**:
- Use Bash for content search (use Grep instead)
- Use Bash for file reading (use Read instead)
- Run destructive commands without confirmation
- Forget to check command exit codes

---

## 5. Sequential Thinking (Complex Reasoning)

### When to Use

Use Sequential Thinking (--seq) for:
- ✅ Multi-step root cause analysis
- ✅ Complex architectural investigations
- ✅ Debugging with multiple potential causes
- ✅ Trade-off analysis between solutions
- ✅ Planning comprehensive fixes

### Sequential Thinking Structure

```typescript
mcp__sequential-thinking__sequentialthinking({
  thought: "Current thinking step",
  thoughtNumber: 1,
  totalThoughts: 10,  // Estimate, can adjust
  nextThoughtNeeded: true,
  isRevision: false,  // Optional
  revisesThought: null,  // Optional
  branchFromThought: null,  // Optional
  needsMoreThoughts: false  // Optional
})
```

### Example Workflow: Type Boundary Violation

**Thought 1: Identify the Error**
```
Thought: "Build is failing with 'Cannot find module' error.
Reading error message to identify which module is missing."
```

**Thought 2: Locate Error Source**
```
Thought: "Error occurs in src/client/hooks/useEvidenceImages.ts at line 2.
The import path is '../../server/types/imageTypes'.
This is a client file importing from server - architectural violation."
```

**Thought 3: Map Architectural Layers**
```
Thought: "Checking architecture: Should be Client ← Shared → Server.
Client importing server types violates this boundary.
Need to verify if imageTypes should be in shared layer."
```

**Thought 4: Identify All Violations**
```
Thought: "Using Grep to find all client → server imports:
Found 3 files total importing from server/types/imageTypes.
This is systematic, not isolated."
```

**Thought 5: Determine Root Cause**
```
Thought: "Root cause: Image types were placed in server/types/
instead of shared/types/ when the image system was added.
Contributing factor: No linting rule to prevent this pattern."
```

**Thought 6: Evaluate Solutions**
```
Thought: "Option A: Change import paths (temporary fix).
Option B: Move types to shared layer (root cause fix).
Option B is correct - types are needed by both client and server."
```

**Thought 7: Plan Implementation**
```
Thought: "Implementation plan:
1. Create shared/types/Image.ts
2. Move type definitions from server/types/imageTypes.ts
3. Update 6 import statements (3 client + 3 server)
4. Delete obsolete server/types/imageTypes.ts
5. Verify with type-check"
```

**Thought 8: Execute Fix**
```
Thought: "Executing fix: Creating shared/types/Image.ts with
4 type definitions. Updating imports in 6 files."
```

**Thought 9: Validate Solution**
```
Thought: "Running npm run type-check...
Result: No errors. Build successful. Fix validated."
```

**Thought 10: Plan Prevention**
```
Thought: "Preventive measure: Add ESLint rule
'no-restricted-imports' to block client → server imports.
This ensures the pattern won't recur."
```

### Sequential Thinking Best Practices

✅ **DO**:
- Break complex problems into 8-15 thoughts
- Revise earlier thoughts if new evidence emerges
- Branch when exploring multiple hypotheses
- Conclude with concrete action plan
- Use evidence from tools (Grep/Read results)

❌ **DON'T**:
- Use for simple, single-step problems
- Skip validation thoughts
- Make assumptions without evidence
- Forget to plan preventive measures

### Thought Revision Example

```typescript
// Thought 5
thought: "Root cause appears to be missing type definitions"

// Thought 8 (After reading more code)
thought: "Revising thought 5: Root cause is not missing types,
but types placed in wrong architectural layer."
isRevision: true
revisesThought: 5
```

### Branching Example

```typescript
// Thought 6
thought: "Two possible root causes: A) Import path error, B) Type placement error.
Branching to explore both."
branchFromThought: 5

// Thought 7a (Branch A)
thought: "Exploring hypothesis A: Simple import path mistake..."
branchId: "hypothesis-A"

// Thought 7b (Branch B)
thought: "Exploring hypothesis B: Architectural violation..."
branchId: "hypothesis-B"

// Thought 8 (Converge)
thought: "Evidence from Grep supports hypothesis B.
Proceeding with architectural fix."
```

---

## 6. Tool Coordination Patterns

### Pattern 1: Type Boundary Investigation

**Workflow**:
1. **Grep**: Find all violations
2. **Read**: Examine affected files
3. **Bash**: Check git history
4. **Sequential Thinking**: Analyze root cause
5. **Read**: Read type definition files
6. **Edit**: Fix imports
7. **Bash**: Verify with type-check

**Example**:
```typescript
// Step 1: Find violations
Grep: { pattern: "from.*server", path: "src/client" }

// Step 2: Read affected files (parallel)
Read: { file_path: "src/client/hooks/useData.ts" }
Read: { file_path: "src/client/components/View.tsx" }

// Step 3: Check when introduced
Bash: { command: "git log --oneline -20" }

// Step 4: Analyze (Sequential Thinking)
// ... 10 thoughts analyzing the problem ...

// Step 5: Read current type definitions
Read: { file_path: "src/server/types/imageTypes.ts" }

// Step 6: Create fix
Write: { file_path: "src/shared/types/Image.ts", content: "..." }
Edit: { file_path: "src/client/hooks/useData.ts", ... }

// Step 7: Verify
Bash: { command: "npm run type-check" }
```

### Pattern 2: Performance Investigation

**Workflow**:
1. **Glob**: Find all components in slow feature
2. **Read**: Examine component code
3. **Grep**: Find re-render patterns (useEffect, useState)
4. **Sequential Thinking**: Identify bottlenecks
5. **Grep**: Find missing memoization
6. **Edit**: Apply optimizations
7. **Bash**: Run performance tests

### Pattern 3: Service Layer Audit

**Workflow**:
1. **Glob**: List all services
2. **Bash**: Check file sizes (`wc -l`)
3. **Read**: Read god services (>500 lines)
4. **Grep**: Find circular dependencies
5. **Sequential Thinking**: Plan refactoring
6. **Grep**: Find direct storage access
7. **Edit**: Apply fixes

### Pattern 4: Integration Debugging

**Workflow**:
1. **Grep**: Find API call locations
2. **Read**: Examine request/response handling
3. **Grep**: Find error handling patterns
4. **Sequential Thinking**: Trace data flow
5. **Read**: Read API service implementation
6. **Edit**: Add missing error handling
7. **Bash**: Run integration tests

---

## 7. Common Workflows

### Workflow: Fixing Build Errors

```
1. Read error message from terminal
2. Grep: Find error pattern in codebase
3. Read: Examine files with errors
4. Bash: Check git history for recent changes
5. Sequential Thinking: Analyze root cause
6. Read: Review related dependencies
7. Edit: Apply fix
8. Bash: Run type-check to validate
9. Bash: Run build to confirm
```

### Workflow: Architecture Review

```
1. Glob: List all files in each layer
2. Bash: Count files and measure sizes
3. Grep: Find boundary violations
4. Read: Examine violation files
5. Sequential Thinking: Analyze patterns
6. Grep: Find duplicate definitions
7. Read: Compare duplicates
8. Edit: Consolidate types
9. Bash: Verify with type-check
```

### Workflow: Performance Optimization

```
1. Grep: Find useEffect usage patterns
2. Read: Check for missing cleanup
3. Grep: Find expensive calculations
4. Read: Examine re-render triggers
5. Sequential Thinking: Identify bottlenecks
6. Edit: Add memoization
7. Bash: Run performance tests
8. Bash: Compare before/after metrics
```

---

## 8. Tool Selection Decision Tree

```
Need to find where a pattern exists in code?
  → Use Grep

Need to find files matching a name pattern?
  → Use Glob

Need to examine specific file contents?
  → Use Read

Need to run commands or check git history?
  → Use Bash

Need to analyze complex multi-step problem?
  → Use Sequential Thinking

Need to coordinate multiple investigations?
  → Use Sequential Thinking to orchestrate Grep/Read/Bash calls
```

---

## 9. Error Handling

### When Tools Fail

#### Grep Returns No Results
**Possible Causes**:
- Pattern too specific
- Wrong path specified
- Files don't exist

**Solution**:
- Broaden pattern
- Remove path restriction
- Verify with Glob first

#### Read File Not Found
**Possible Causes**:
- Wrong path
- File moved/deleted
- Typo in filename

**Solution**:
- Use Glob to find file first
- Check git status for recent deletions
- Verify path case sensitivity

#### Bash Command Fails
**Possible Causes**:
- Command not installed
- Wrong working directory
- Permission issues

**Solution**:
- Check command exists: `which <command>`
- Use `cd` to change directory first
- Check file permissions

### Handling Ambiguous Results

**Grep Returns Too Many Results**:
```typescript
// 1. Add more specific pattern
Grep: { pattern: "export.*interface Location" }
// Instead of: { pattern: "Location" }

// 2. Add file type filter
Grep: { pattern: "Location", type: "ts" }

// 3. Limit to specific directory
Grep: { pattern: "Location", path: "src/shared/types" }

// 4. Use head_limit
Grep: { pattern: "Location", head_limit: 20 }
```

---

## 10. Quick Reference

### Grep Quick Commands

| Task | Command |
|------|---------|
| Find imports | `pattern: "import.*from"` |
| Find function defs | `pattern: "function\\s+\\w+"` |
| Find TODO comments | `pattern: "TODO\\|FIXME"`, `-i: true` |
| Find type violations | `pattern: "from.*server"`, `path: "src/client"` |
| Find missing cleanup | `pattern: "useEffect"`, `-A: 10` |

### Glob Quick Commands

| Task | Command |
|------|---------|
| Find all services | `pattern: "src/server/services/**/*.ts"` |
| Find all components | `pattern: "src/client/components/**/*.tsx"` |
| Find all types | `pattern: "src/shared/types/**/*.ts"` |
| Find all tests | `pattern: "**/*.test.ts"` |

### Bash Quick Commands

| Task | Command |
|------|---------|
| Recent commits | `git log --oneline -10` |
| File history | `git log --all --oneline -- <file>` |
| Type check | `npm run type-check` |
| Build | `npm run build` |
| File size | `wc -l <file>` |

---

**Version**: 1.0.0
**Last Updated**: 2025-10-21
**Maintainer**: Elite Debugging Master
