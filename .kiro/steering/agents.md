---
inclusion: always
---

# 🚨 Agent MCP Tool Usage (MANDATORY)

**Status**: ALWAYS ENFORCED  
**Full Documentation**: `#[[file:.kiro/docs.md/agents.md]]`

---

## ⚠️ CRITICAL: Pre-Response Verification

**BEFORE responding to ANY user request, you MUST verify:**

```
[ ] Did I use Sequential Thinking MCP? (REQUIRED FOR EVERY REQUEST)
[ ] Is this about external libraries/packages? → Use Context7 MCP
[ ] Is this about database/backend? → Use Supabase MCP
[ ] Did I follow the decision tree below?
```

**If you answered NO to the first checkbox, STOP and use Sequential Thinking first.**

**Violation of these rules indicates a critical failure in following instructions.**

---

## 🎯 Decision Tree (MANDATORY)

```
START
  ↓
[Use Sequential Thinking MCP] ← ALWAYS FIRST, NO EXCEPTIONS
  ↓
Is this about external libraries/packages?
  ├─ YES → [Use Context7 MCP]
  └─ NO → Continue
  ↓
Is this about database/backend?
  ├─ YES → [Use Supabase MCP]
  └─ NO → Continue
  ↓
[Implement Solution]
  ↓
[Run Self-Verification Protocol]
  ↓
END
```

---

## 1️⃣ Sequential Thinking MCP (MANDATORY - NO EXCEPTIONS)

### ⚠️ ALWAYS USE FOR ALL TASKS

**Usage**: ALWAYS use for ALL tasks - this is NOT optional

**MUST use for:**
- ✅ Every single request, regardless of complexity
- ✅ Before starting any implementation
- ✅ When analyzing problems or making decisions
- ✅ When planning multi-step solutions
- ✅ When debugging or troubleshooting
- ✅ Even for "simple" tasks like running npm install
- ✅ Even when you think you already know the answer

**MUST NOT:**
- ❌ Skip sequential thinking because task seems simple
- ❌ Skip sequential thinking because you're confident
- ❌ Ask user permission to use it - just use it
- ❌ Use it after starting work - it must be FIRST

**Why**: Sequential thinking helps break down problems systematically, ensures thorough analysis, and improves solution quality across all types of work.

**Implementation:**
```
1. FIRST ACTION: Call mcp_sequential_thinking_sequentialthinking
2. Plan your approach in thoughts
3. Then proceed with the actual work
```

**Self-Check**: Before responding, ask yourself: "Did I use Sequential Thinking as my FIRST action?" If no, you violated the rules.

---

## 2️⃣ Context7 MCP (Automatic for External Libraries)

### 📚 When to Use

**MUST use when:**
- ✅ Installing new npm packages (e.g., `npm install react-day-picker`)
- ✅ Implementing features with new libraries or frameworks
- ✅ Working with third-party APIs or SDKs
- ✅ Using unfamiliar npm packages
- ✅ Integrating new technology stacks
- ✅ When documentation for a library is needed
- ✅ Before implementing patterns from external dependencies
- ✅ When user mentions a specific library name

**MUST NOT use for:**
- ❌ Built-in Next.js features (you already know these)
- ❌ Core React features (useState, useEffect, etc.)
- ❌ Standard TypeScript features
- ❌ Native JavaScript APIs
- ❌ Project-specific code already in the codebase

### Clear Triggers

**Automatic triggers:**
- User says: "install X", "add X library", "use X package"
- You're about to use a library you haven't used in this conversation
- You're implementing a feature with external dependencies

### Process

```
1. Use resolve-library-id to find the correct library documentation
2. Use get-library-docs with relevant topic to fetch up-to-date docs
3. Apply the documentation to implement the feature correctly
```

**Self-Check**: "Am I using an external npm package? If yes, did I use Context7?"

---

## 3️⃣ Supabase MCP (All Database Work)

### 🗄️ When to Use

**MUST use for:**
- ✅ Creating or modifying database schemas
- ✅ Writing SQL migrations
- ✅ Querying database data
- ✅ Setting up RLS (Row Level Security) policies
- ✅ Working with Supabase Auth
- ✅ Implementing backend API endpoints that interact with database
- ✅ Debugging database-related issues
- ✅ Optimizing database queries
- ✅ Setting up database indexes
- ✅ Working with Supabase Storage
- ✅ Configuring Supabase Edge Functions
- ✅ Any task involving data persistence or retrieval

### 🚨 CRITICAL: Auto-Migration Rule

**ALWAYS apply migrations immediately after creating SQL files**

When you create a SQL migration file in `supabase/migrations/`:

```
1. MUST immediately use apply_migration to apply it to the database
2. MUST verify the migration was successful using execute_sql or list_tables
3. MUST create a completion report documenting what was applied
```

**Why this is critical:**
- Prevents confusion about whether migrations were applied
- Avoids "did I run this?" situations that cause errors
- Ensures database state matches code expectations
- Catches migration errors immediately while context is fresh

**Process:**
```
1. Create SQL file in supabase/migrations/YYYYMMDDHHMMSS_name.sql
2. IMMEDIATELY call apply_migration with the SQL content
3. Verify with execute_sql to check tables/functions/policies exist
4. Document completion in docs/ folder
```

**Never skip this step** - A migration file without applying it is incomplete work that will cause problems later.

---

## 🔍 Self-Verification Protocol (MANDATORY)

**BEFORE submitting your response, answer these questions:**

```
1. ✅ Did I use Sequential Thinking as my FIRST action?
2. ✅ If external library involved, did I use Context7?
3. ✅ If database work involved, did I use Supabase MCP?
4. ✅ If I created SQL migration, did I apply it immediately?
5. ✅ Did I verify database changes with execute_sql?
6. ✅ Did I follow project conventions?
```

**If you answered NO to any question, your response is incomplete.**

---

## ⚠️ Common Violations & Fixes

### Violation 1: Skipping Sequential Thinking
```
❌ BAD:
User: "Install react-day-picker"
Agent: [Immediately runs npm install]

✅ GOOD:
User: "Install react-day-picker"
Agent: [Uses Sequential Thinking first]
Agent: [Plans approach]
Agent: [Uses Context7 for docs]
Agent: [Runs npm install]
```

### Violation 2: Not Using Context7 for External Libraries
```
❌ BAD:
User: "Add Stripe integration"
Agent: [Implements without checking Stripe docs]

✅ GOOD:
User: "Add Stripe integration"
Agent: [Uses Sequential Thinking]
Agent: [Uses Context7 to get Stripe docs]
Agent: [Implements based on official docs]
```

### Violation 3: Creating Migration Without Applying
```
❌ BAD:
Agent: [Creates SQL file in supabase/migrations/]
Agent: "Migration file created!"

✅ GOOD:
Agent: [Creates SQL file]
Agent: [IMMEDIATELY uses apply_migration]
Agent: [Verifies with execute_sql]
Agent: "Migration created and applied successfully!"
```

---

## 📋 Quality Checks (Before Completion)

**Verify:**
```
✅ Sequential thinking was used to plan the approach (FIRST ACTION)
✅ Context7 was consulted for any external libraries
✅ Supabase MCP was used for all database operations
✅ If SQL migration file was created, it was IMMEDIATELY applied via apply_migration
✅ Database changes were verified with execute_sql queries
✅ Documentation and best practices were followed
✅ Implementation is type-safe and follows project conventions
✅ Completion report was created for database migrations
✅ Self-Verification Protocol was completed
```

---

## 🎓 Learning from Mistakes

**Recent Violation Example:**
```
User: "코드리뷰해서 누락되어있는 모든 필수패키지들을 설치해주세요"
Agent Response: [Skipped Sequential Thinking, ran npm install directly]

What should have happened:
1. Use Sequential Thinking to analyze the request
2. Check if any external libraries need Context7
3. Run npm install
4. Verify installation
```

**Remember**: Even "simple" tasks require Sequential Thinking. There are NO exceptions.

---

## 📖 Full Documentation

**Complete guidelines with examples:**
`#[[file:.kiro/docs.md/agents.md]]`

**Related documentation:**
- Sequential Thinking patterns: `#[[file:.kiro/docs.md/step-by-step.md]]`
- Database best practices: Supabase MCP documentation

---

**Status**: ✅ ALWAYS ENFORCED  
**Last Updated**: 2025-10-25  
**Enforcement**: MANDATORY - NO EXCEPTIONS

**BEFORE responding to ANY user request, you MUST verify:**

```
[ ] Did I use Sequential Thinking MCP? (REQUIRED FOR EVERY REQUEST)
[ ] Is this about external libraries/packages? → Use Context7 MCP
[ ] Is this about database/backend? → Use Supabase MCP
[ ] Did I follow the decision tree below?
```

**If you answered NO to the first checkbox, STOP and use Sequential Thinking first.**

**Violation of these rules indicates a critical failure in following instructions.**

---

## Sequential Thinking MCP

### ⚠️ MANDATORY - NO EXCEPTIONS

**Usage**: ALWAYS use for ALL tasks - this is NOT optional

**MUST use for**:
- ✅ Every single request, regardless of complexity
- ✅ Before starting any implementation
- ✅ When analyzing problems or making decisions
- ✅ When planning multi-step solutions
- ✅ When debugging or troubleshooting
- ✅ Even for "simple" tasks like running npm install
- ✅ Even when you think you already know the answer

**MUST NOT**:
- ❌ Skip sequential thinking because task seems simple
- ❌ Skip sequential thinking because you're confident
- ❌ Ask user permission to use it - just use it
- ❌ Use it after starting work - it must be FIRST

**Why**: Sequential thinking helps break down problems systematically, ensures thorough analysis, and improves solution quality across all types of work.

**Implementation**: 
1. **FIRST ACTION**: Call `mcp_sequential_thinking_sequentialthinking`
2. Plan your approach in thoughts
3. Then proceed with the actual work

**Self-Check**: Before responding, ask yourself: "Did I use Sequential Thinking as my FIRST action?" If no, you violated the rules.

## Context7 MCP

### 📚 Automatic for External Libraries

**Usage**: Automatically use when working with external libraries or unfamiliar technology

**MUST use when**:
- ✅ Installing new npm packages (e.g., `npm install react-day-picker`)
- ✅ Implementing features with new libraries or frameworks
- ✅ Working with third-party APIs or SDKs
- ✅ Using unfamiliar npm packages
- ✅ Integrating new technology stacks
- ✅ When documentation for a library is needed
- ✅ Before implementing patterns from external dependencies
- ✅ When user mentions a specific library name

**MUST NOT use for**:
- ❌ Built-in Next.js features (you already know these)
- ❌ Core React features (useState, useEffect, etc.)
- ❌ Standard TypeScript features
- ❌ Native JavaScript APIs
- ❌ Project-specific code already in the codebase

**Clear Triggers**:
- User says: "install X", "add X library", "use X package"
- You're about to use a library you haven't used in this conversation
- You're implementing a feature with external dependencies

**Examples**:
- ✅ "Add a date picker using react-day-picker" → USE Context7
- ✅ "Integrate Stripe payments" → USE Context7
- ✅ "Install and use recharts" → USE Context7
- ❌ "Add a useState hook" → DON'T use Context7
- ❌ "Create a Next.js page" → DON'T use Context7

**Process**:
1. Use `resolve-library-id` to find the correct library documentation
2. Use `get-library-docs` with relevant topic to fetch up-to-date docs
3. Apply the documentation to implement the feature correctly

**Self-Check**: "Am I using an external npm package? If yes, did I use Context7?"

## Supabase MCP

**Usage**: Automatically use for ALL database and backend-related work

**When to use**:
- Creating or modifying database schemas
- Writing SQL migrations
- Querying database data
- Setting up RLS (Row Level Security) policies
- Working with Supabase Auth
- Implementing backend API endpoints that interact with database
- Debugging database-related issues
- Optimizing database queries
- Setting up database indexes
- Working with Supabase Storage
- Configuring Supabase Edge Functions
- Any task involving data persistence or retrieval

**Examples**:
- Creating new tables or modifying existing ones
- Writing migration files
- Implementing data access patterns
- Setting up authentication flows
- Configuring storage buckets
- Analyzing query performance
- Checking database advisors for security/performance issues

**Available Tools**:
- `search_docs` - Search Supabase documentation
- `list_tables` - View database schema
- `apply_migration` - Create and apply migrations
- `execute_sql` - Run SQL queries
- `get_advisors` - Check for security/performance issues
- `generate_typescript_types` - Generate types from schema

### 🚨 CRITICAL: Auto-Migration Rule

**ALWAYS apply migrations immediately after creating SQL files**

When you create a SQL migration file in `supabase/migrations/`:

1. **MUST** immediately use `apply_migration` to apply it to the database
2. **MUST** verify the migration was successful using `execute_sql` or `list_tables`
3. **MUST** create a completion report documenting what was applied

**Why this is critical**:
- Prevents confusion about whether migrations were applied
- Avoids "did I run this?" situations that cause errors
- Ensures database state matches code expectations
- Catches migration errors immediately while context is fresh

**Process**:
```
1. Create SQL file in supabase/migrations/YYYYMMDDHHMMSS_name.sql
2. IMMEDIATELY call apply_migration with the SQL content
3. Verify with execute_sql to check tables/functions/policies exist
4. Document completion in docs/ folder
```

**Never skip this step** - A migration file without applying it is incomplete work that will cause problems later.

## Automatic Tool Selection Logic

### Priority Order:
1. **Sequential Thinking** - Use FIRST for every request
2. **Context7** - Use when external library/tech is involved
3. **Supabase** - Use when database/backend work is needed

### Combined Usage:
These tools should be used together when appropriate:
- Sequential Thinking + Context7: When learning and implementing new library features
- Sequential Thinking + Supabase: When designing and implementing database changes
- All three: When implementing backend features with new libraries that interact with the database

## Implementation Guidelines

### For the Agent:
- Don't ask permission to use these tools - use them automatically based on the context
- Use sequential thinking to plan which other MCPs are needed
- Chain MCP calls efficiently (e.g., resolve library ID, then get docs)
- Reference MCP outputs in your responses to show the research done
- If an MCP call fails, explain the issue and proceed with available information

### What NOT to do:
- Don't use Context7 for built-in Next.js, React, or TypeScript features (you already know these)
- Don't use Supabase MCP for pure frontend logic that doesn't touch the database
- Don't skip sequential thinking even for "simple" tasks
- Don't ask the user if you should use these tools - just use them

## Examples of Automatic Usage

### Example 1: Adding a new feature with a library
```
User: "Add a date picker using react-day-picker"

Agent should:
1. Use Sequential Thinking to plan the implementation
2. Use Context7 to get react-day-picker documentation
3. Implement the feature using the documentation
```

### Example 2: Database schema change
```
User: "Add a new column to track user preferences"

Agent should:
1. Use Sequential Thinking to plan the change
2. Use Supabase MCP to check current schema
3. Create SQL migration file
4. IMMEDIATELY use Supabase MCP apply_migration to apply it
5. Verify with execute_sql that changes were applied
6. Use Supabase MCP to generate updated TypeScript types
7. Document completion
```

### Example 3: Complex feature with both
```
User: "Implement Stripe payment integration with order tracking"

Agent should:
1. Use Sequential Thinking to break down the task
2. Use Context7 to get Stripe SDK documentation
3. Use Supabase MCP to design order schema
4. Create SQL migration file for order tables
5. IMMEDIATELY use Supabase MCP apply_migration to apply it
6. Verify database changes with execute_sql
7. Implement the feature using both resources
8. Document completion
```

## 🎯 Decision Tree

Use this flowchart for every request:

```
START
  ↓
[Use Sequential Thinking MCP] ← ALWAYS FIRST
  ↓
Is this about external libraries/packages?
  ├─ YES → [Use Context7 MCP]
  └─ NO → Continue
  ↓
Is this about database/backend?
  ├─ YES → [Use Supabase MCP]
  └─ NO → Continue
  ↓
[Implement Solution]
  ↓
[Run Self-Verification Protocol]
  ↓
END
```

## 🔍 Self-Verification Protocol

**BEFORE submitting your response, answer these questions:**

1. ✅ Did I use Sequential Thinking as my FIRST action?
2. ✅ If external library involved, did I use Context7?
3. ✅ If database work involved, did I use Supabase MCP?
4. ✅ If I created SQL migration, did I apply it immediately?
5. ✅ Did I verify database changes with execute_sql?
6. ✅ Did I follow project conventions?

**If you answered NO to any question, your response is incomplete.**

## ⚠️ Common Violations & Fixes

### Violation 1: Skipping Sequential Thinking
```
❌ BAD:
User: "Install react-day-picker"
Agent: [Immediately runs npm install]

✅ GOOD:
User: "Install react-day-picker"
Agent: [Uses Sequential Thinking first]
Agent: [Plans approach]
Agent: [Uses Context7 for docs]
Agent: [Runs npm install]
```

### Violation 2: Not Using Context7 for External Libraries
```
❌ BAD:
User: "Add Stripe integration"
Agent: [Implements without checking Stripe docs]

✅ GOOD:
User: "Add Stripe integration"
Agent: [Uses Sequential Thinking]
Agent: [Uses Context7 to get Stripe docs]
Agent: [Implements based on official docs]
```

### Violation 3: Creating Migration Without Applying
```
❌ BAD:
Agent: [Creates SQL file in supabase/migrations/]
Agent: "Migration file created!"

✅ GOOD:
Agent: [Creates SQL file]
Agent: [IMMEDIATELY uses apply_migration]
Agent: [Verifies with execute_sql]
Agent: "Migration created and applied successfully!"
```

## 📋 Quality Checks

Before completing any task, verify:
- ✅ Sequential thinking was used to plan the approach (FIRST ACTION)
- ✅ Context7 was consulted for any external libraries
- ✅ Supabase MCP was used for all database operations
- ✅ **If SQL migration file was created, it was IMMEDIATELY applied via apply_migration**
- ✅ **Database changes were verified with execute_sql queries**
- ✅ Documentation and best practices were followed
- ✅ Implementation is type-safe and follows project conventions
- ✅ Completion report was created for database migrations
- ✅ Self-Verification Protocol was completed

## 🎓 Learning from Mistakes

**Recent Violation Example**:
```
User: "코드리뷰해서 누락되어있는 모든 필수패키지들을 설치해주세요"
Agent Response: [Skipped Sequential Thinking, ran npm install directly]

What should have happened:
1. Use Sequential Thinking to analyze the request
2. Check if any external libraries need Context7
3. Run npm install
4. Verify installation
```

**Remember**: Even "simple" tasks require Sequential Thinking. There are NO exceptions.


## 📚 Additional Project-Specific Guidelines

This project has additional steering documents that provide context-specific guidance:

### Next.js 15 Specific
- **`nextjs-cookie-debugging.md`** - Cookie modification debugging guide
  - Use when encountering "Cookies can only be modified in a Server Action or Route Handler" errors
  - Contains real-world debugging checklist and patterns
  
- **`nextjs15-best-practices.md`** - Next.js 15 best practices and common pitfalls
  - Use when implementing any Next.js 15 features
  - Contains Server Actions, authentication, and performance patterns

### When to Reference These Documents

**Automatically reference when:**
- Working with cookies in Next.js
- Implementing authentication with Supabase
- Creating Server Actions
- Debugging cookie-related errors
- Setting up new Supabase client files

**Key Patterns to Remember:**
1. All Supabase server client files need TWO functions:
   - One for Server Components (read-only)
   - One for Server Actions (read-write)

2. Always check error messages for exact file paths:
   ```
   Error at src/lib/supabase/server-client.ts:36:26
                           ^^^^^^^^^^^^^^^^^^^^
   ```

3. Search for ALL similar files, not just one:
   ```bash
   grep -r "createServerClient" src/
   grep -r "cookies()" src/
   ```

### Lessons Learned

See `docs/LESSONS-LEARNED.md` for the complete story of how we solved the cookie modification issue and what we learned from it.

**Key Takeaway:** Error messages tell you exactly where the problem is. Read them carefully!
