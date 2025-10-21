# MCP Integration Guide

This file explains how to use MCP (Model Context Protocol) tools effectively within the Implementation Guardian skill.

## Auto-Enabled MCP Tools

When Implementation Guardian activates, these MCP tools are **automatically enabled**:

### --seq (Sequential Thinking)
### --ref (Reference Lookup)
### --c7 (Context7 - Documentation Search)

## MCP Tool Detailed Usage

### 1. --seq (Sequential Thinking MCP)

**Purpose:** Deep, structured analysis through step-by-step reasoning

**When to use:**
- Complex requirements analysis
- Breaking down multi-layer implementations
- Architectural decision making
- Error debugging with multiple possibilities
- Design template application

**How it works:**
```markdown
Enables sequential-thinking MCP which allows Claude to:
1. Break down complex problems into steps
2. Think through each step methodically
3. Revise earlier thinking if new information emerges
4. Provide detailed reasoning for decisions
```

**Example usage in Implementation Guardian:**

**Scenario:** Implementing authentication feature

```markdown
--seq activated:

Step 1: Analyze authentication requirements
- Need user login (email + password)
- Need session management
- Need password reset
- Need role-based access control

Step 2: Identify layers needed
- Frontend: Login form, protected routes, session UI
- Backend: Auth service, password hashing, JWT generation
- API: Login endpoint, logout endpoint, refresh token endpoint
- Database: Users table, sessions table

Step 3: Plan integration points
- Frontend calls /api/login with credentials
- Backend validates, generates JWT
- Frontend stores JWT, sends with requests
- Backend middleware validates JWT on protected routes

Step 4: Identify potential issues
- CORS configuration needed
- Secure cookie settings for JWT
- Password strength validation
- Rate limiting for login attempts

Step 5: Design error handling
- Invalid credentials → 401
- Expired token → 401 + refresh flow
- Server error → 500 with logging
```

**Benefits:**
- No rushed decisions
- All edge cases considered
- Clear reasoning trail
- Better architecture

### 2. --ref (Reference Lookup MCP)

**Purpose:** Access and search project documentation and references

**When to use:**
- Loading project documentation (게임전체프로세스.md, 완벽게임구현상태.md)
- Finding API specifications
- Checking architectural decision records
- Understanding existing patterns

**How it works:**
```markdown
Enables efficient lookup of:
- Project documentation files
- Reference materials
- Design documents
- API specifications
```

**Example usage in Implementation Guardian:**

**Scenario:** Need to understand current game state

```markdown
--ref activated:

Load: C:\Users\hpcra\armchair-sleuths\doc.md\게임전체프로세스.md
→ Understand where new feature fits in game flow

Load: C:\Users\hpcra\armchair-sleuths\doc.md\완벽게임구현상태.md
→ Check what's already implemented
→ Identify gaps and missing pieces

Result: Complete context for implementation
```

**Integration with project-documents.md:**
The --ref flag works with references/project-documents.md to efficiently load the two critical project documents.

### 3. --c7 (Context7 - Codebase Search)

**Purpose:** Search and understand existing codebase patterns, conventions, and similar implementations

**When to use:**
- Discovering project conventions
- Finding similar implementations
- Understanding existing patterns
- Locating integration points
- Checking how features were implemented before

**How it works:**
```markdown
Enables codebase exploration to find:
- Similar components/services
- Existing patterns and conventions
- Integration examples
- Code style and structure
```

**Example usage in Implementation Guardian:**

**Scenario:** Implementing new API endpoint

```markdown
--c7 activated:

Search query: "existing API endpoint patterns"
→ Found: src/api/users.ts
→ Pattern: Express router with middleware
→ Convention: Route handlers in separate file
→ Error handling: Custom error classes

Search query: "validation patterns"
→ Found: src/validators/userValidator.ts
→ Pattern: Joi schemas
→ Convention: Validators in separate folder
→ Usage: Middleware before route handler

Search query: "database access patterns"
→ Found: src/data/UserRepository.ts
→ Pattern: Repository pattern
→ Convention: Each entity has repository
→ Usage: Service layer calls repository

Result: Implement new endpoint following existing patterns
```

**Benefits:**
- Consistent with existing code
- No convention violations
- Faster implementation
- Easier code review

## Combined MCP Usage

The real power comes from using all three MCP tools together:

### Complete Implementation Flow with MCPs

```markdown
User Request: "사용자 프로필 편집 기능 구현해줘"

Implementation Guardian Activates with ALL MCPs:

1. --seq: Break down requirements
   Step 1: Profile editing needs frontend form
   Step 2: Needs backend update service
   Step 3: Needs API PUT endpoint
   Step 4: Integration across all layers

2. --ref: Load project docs
   Load 게임전체프로세스.md:
   - Profile editing is part of user management flow
   - Happens after user registration
   - Affects user display in game

   Load 완벽게임구현상태.md:
   - User model already exists
   - Basic profile display implemented
   - Edit functionality missing ❌

3. --c7: Explore codebase
   Find similar features:
   - User registration (src/components/auth/Register.tsx)
   - User display (src/components/user/ProfileView.tsx)
   - User service (src/services/UserService.ts)

   Discover conventions:
   - Components in feature folders
   - Services use async/await
   - API uses Express routers
   - Validation with Joi

4. Design with all context:
   Frontend: ProfileEditForm.tsx (following Register.tsx pattern)
   Backend: Add updateProfile() to UserService.ts
   API: PUT /api/users/:id (following existing route pattern)
   Integration: Form → API → Service → DB

5. Implement following discovered patterns

6. Validate completeness:
   ✅ Frontend component created
   ✅ Backend service method added
   ✅ API endpoint created
   ✅ All layers connected
   ✅ Error handling at each layer
   ✅ Follows project conventions

Result: Complete, consistent, well-integrated feature
```

## Quality Standard Auto-Inclusion

In addition to MCP tools, this quality reminder is **automatically included**:

```markdown
"Think as long as needed to get this right. I am not in a hurry.
What matters is that you follow precisely what I ask and execute it perfectly."
```

**Purpose:**
- Ensures thorough analysis (no rushing)
- Emphasizes precision over speed
- Encourages comprehensive implementation
- Prevents shortcuts that leave gaps

**Effect:**
- More complete error handling
- Better edge case coverage
- Proper validation at all layers
- No "TODO" comments in production code

## MCP Usage Patterns by Mode

### Implementation Mode

```markdown
MCPs used:
✅ --seq: Analyze requirements, plan implementation
✅ --ref: Load project docs for context
✅ --c7: Find existing patterns and conventions

Flow:
1. --seq analyzes what's needed
2. --ref loads project state
3. --c7 discovers how to implement
4. Combined: Complete implementation plan
```

### Design Mode (Modular)

```markdown
MCPs used:
✅ --seq: Apply design template systematically
✅ --ref: Load project docs for context
⚠️ --c7: May not be needed (greenfield design)

Flow:
1. --seq applies modular design template
2. --ref provides project context
3. Output: Structured design document
```

### Design Mode (Flow)

```markdown
MCPs used:
✅ --seq: Analyze flows step-by-step
✅ --ref: Load project docs
✅ --c7: CRITICAL - discover conventions

Flow:
1. --seq analyzes user/data flows
2. --c7 explores codebase for patterns
3. --ref loads project context
4. Output: Flow-based design following conventions
```

### Validation Mode

```markdown
MCPs used:
✅ --seq: Systematic validation
✅ --ref: Load validation checklist + project docs
⚠️ --c7: Check actual implementation

Flow:
1. --ref loads validation checklist
2. --ref loads project docs for comparison
3. --seq validates layer by layer
4. --c7 checks actual code vs. requirements
5. Output: Validation report with gaps
```

## MCP Flags in User Requests

Users can explicitly request MCP tools:

```markdown
"--seq 를 사용해서 이 문제를 분석해줘"
→ Emphasizes sequential thinking

"--ref 로 프로젝트 문서를 로드해줘"
→ Explicitly loads references

"--c7 으로 비슷한 구현을 찾아줘"
→ Search codebase

"--ultrathink --seq --ref"
→ Maximum analysis depth with all tools
```

When user explicitly requests MCPs, Implementation Guardian:
1. Honors user's explicit request
2. May add additional MCPs if needed
3. Explains why each MCP is used

## MCP Best Practices

### Do's:
- ✅ Use --seq for complex multi-step tasks
- ✅ Use --ref to load project docs early
- ✅ Use --c7 to discover patterns before implementing
- ✅ Combine all three for comprehensive implementation
- ✅ Let MCPs work together (sequential flow)

### Don'ts:
- ❌ Skip --ref when project docs are critical
- ❌ Implement without --c7 (risks convention violations)
- ❌ Rush through --seq steps (defeats the purpose)
- ❌ Use MCPs redundantly (if already done, don't repeat)

## Troubleshooting MCP Usage

### Issue: Sequential thinking taking too long

**Solution:**
- This is expected for complex tasks
- Quality standard: "not in a hurry"
- Thorough analysis prevents rework

### Issue: Can't find pattern with --c7

**Solution:**
- Search query might be too specific
- Try broader terms
- Look for similar (not exact) implementations
- Ask user for guidance if truly unique

### Issue: Project docs not found with --ref

**Solution:**
- Check file paths in project-documents.md
- Verify documents exist at specified locations
- Update project-documents.md if paths changed

## MCP Integration Summary

**Implementation Guardian automatically:**
1. Enables --seq, --ref, --c7
2. Includes quality standard
3. Uses MCPs in optimal combination
4. Provides comprehensive oversight

**Result:**
- Complete implementations
- No missing integrations
- Follows project conventions
- Thorough error handling
- Well-documented decisions

---

**The three MCP tools (--seq, --ref, --c7) work together to provide comprehensive implementation guidance with complete context and thorough analysis.**
