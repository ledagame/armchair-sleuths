---
name: implementation-guardian
description: End-to-end implementation oversight preventing missing integrations, ensuring modular design, and maintaining documentation sync. Use when implementing features, creating design specifications, validating completeness, or syncing project documentation. Auto-enables MCP tools (--seq, --ref, --c7) and includes modular/flow design templates.
---

# Implementation Guardian

## Purpose & Core Mission

This skill serves as an **always-on guardian** for end-to-end implementation in complex full-stack projects. It prevents common failures:
- Missing integrations between frontend, backend, and API layers
- Incomplete implementation (forgotten edge cases, error handling, validation)
- Drift between implementation and documentation
- Over-engineering or insufficient modularization
- Violated project conventions and patterns

The skill proactively activates whenever implementation, design, or validation work begins, ensuring comprehensive oversight throughout the development lifecycle.

## Automatic Activation Triggers

This skill **automatically activates** when user requests contain:

**Implementation Keywords:**
- "구현", "implement", "build", "create", "add feature"
- "develop", "code", "만들어"

**Design Keywords:**
- "설계", "design", "plan", "architect"
- "요구사항", "requirements", "spec"

**Validation Keywords:**
- "검증", "validate", "check", "verify", "review"
- "테스트", "test"

**Documentation Keywords:**
- "문서", "documentation", "docs", "update docs"
- "동기화", "sync"

When activated, the skill:
1. Automatically enables MCP tools (--seq, --ref, --c7)
2. Includes quality standard reminder
3. Loads relevant project documentation
4. Applies appropriate design template if needed
5. Provides end-to-end oversight

## MCP Integration (Auto-Enabled)

When this skill activates, the following MCP tools are **automatically enabled**:

### --seq (Sequential Thinking)
Purpose: Deep, structured analysis of complex implementation tasks
Use for: Breaking down requirements, analyzing dependencies, planning architecture

### --ref (Reference Lookup)
Purpose: Access project documentation and references
Use for: Loading design docs, API specs, architectural decisions

### --c7 (Context7 - Codebase Search)
Purpose: Search and understand existing codebase patterns
Use for: Finding conventions, similar implementations, integration points

### Quality Standard (Auto-Included)

Every implementation task automatically includes this quality reminder:

**"Think as long as needed to get this right. I am not in a hurry. What matters is that you follow precisely what I ask and execute it perfectly."**

This ensures:
- No rushed implementations
- Complete requirement coverage
- Proper error handling
- Comprehensive validation

## Four Operation Modes

### Mode 1: Implementation Guide Mode

**Activates when:** User requests feature implementation

**Purpose:** Provide comprehensive implementation oversight

**Workflow:**
1. Load `references/project-documents.md` to access:
   - 게임전체프로세스.md (complete game process)
   - 완벽게임구현상태.md (perfect implementation state)

2. Analyze request against current project state:
   - What exists already?
   - What patterns should be followed?
   - What integrations are required?

3. Guide implementation with end-to-end checklist:
   - Frontend components needed
   - Backend services/API endpoints needed
   - Database schema changes needed
   - Integration points (frontend ↔ backend ↔ API)
   - Error handling at each layer
   - Validation at each layer
   - Testing considerations

4. After implementation:
   - Verify all integration points connected
   - Check for missing error handling
   - Validate against project conventions
   - Update documentation if needed

**Reference Files:**
- Load: `references/project-documents.md` (always)
- Load: `references/validation-checklist.md` (for verification)
- Load: `references/mcp-integration.md` (if MCP guidance needed)

### Mode 2: Design Mode (Template-Based)

**Activates when:** User requests design or planning

**Purpose:** Apply structured design templates to requirements

**Two Design Templates Available:**

#### Template A: Modular Design Template

**Use when:** Request includes "개발 설계" or modular design needed

**Process (from `references/design-template-modular.md`):**
1. Analyze requirements
2. Group business logic into cohesive modules
3. Apply modularization principles:
   - Single Responsibility
   - Minimal coupling
   - Avoid over-engineering
   - Simplest solution that works
4. Output structure:
   - 개요 (Overview)
   - 세부 유스케이스 (Detailed use cases)
   - 주요 모듈 및 역할 (Key modules and roles)
5. Format: Markdown (no code implementation)

#### Template B: Flow-Based Design Template

**Use when:** Request includes "최소한의 모듈화" or flow analysis needed

**Process (from `references/design-template-flow.md`):**
1. Analyze requirements → detailed user flow & data flow
2. Explore codebase to understand:
   - Existing conventions
   - Code style guidelines
   - Architectural patterns
   - Similar implementations
3. Determine module structure and work breakdown:
   - What components/services needed
   - Where they should be located
   - How they integrate with existing code
4. Output minimal modularization design

**Workflow:**
1. Identify which template to use (or ask user)
2. Load appropriate reference file
3. Apply template systematically
4. Include MCP flags (--seq for analysis, --ref for docs, --c7 for codebase)
5. Output design following template structure

**Reference Files:**
- Load: `references/design-template-modular.md` (for Template A)
- Load: `references/design-template-flow.md` (for Template B)
- Load: `references/project-documents.md` (for context)

### Mode 3: Validation Mode

**Activates when:** User requests validation or review

**Purpose:** Verify end-to-end implementation completeness

**Workflow:**
1. Load `references/validation-checklist.md`

2. Check implementation against checklist:
   - **Frontend Layer:**
     - Components created and wired correctly?
     - State management working?
     - API calls implemented?
     - Error states handled?
     - Loading states shown?

   - **Backend Layer:**
     - Services implemented?
     - Business logic correct?
     - Error handling comprehensive?
     - Validation in place?
     - Database operations safe?

   - **API Layer:**
     - Endpoints created?
     - Request/response types defined?
     - Authentication/authorization checked?
     - Error responses standardized?

   - **Integration Points:**
     - Frontend → API: Calls correct endpoints with right payload?
     - API → Backend: Calls correct services with proper validation?
     - Backend → Database: Queries correct and optimized?
     - Error propagation: Errors bubble up correctly?

   - **Documentation:**
     - Code comments where needed?
     - API docs updated?
     - README updated if needed?
     - Project docs synced?

3. Report findings:
   - What's complete ✅
   - What's missing ❌
   - What needs improvement ⚠️

4. Recommend fixes for gaps

**Reference Files:**
- Load: `references/validation-checklist.md` (always)
- Load: `references/project-documents.md` (for state comparison)

### Mode 4: Documentation Sync Mode

**Activates when:** User requests doc update or after major implementation

**Purpose:** Keep project documentation in sync with implementation state

**Workflow:**
1. Load `references/project-documents.md` to find:
   - 게임전체프로세스.md location
   - 완벽게임구현상태.md location

2. Analyze recent changes:
   - What was implemented?
   - What features were added?
   - What integrations were completed?

3. Update relevant documentation:
   - Read current docs
   - Identify outdated sections
   - Write updated sections
   - Apply changes

4. Verify consistency:
   - Game process doc reflects actual process?
   - Implementation state doc reflects actual state?
   - No contradictions between docs?

**Reference Files:**
- Load: `references/project-documents.md` (always)

## Project Documents

This project maintains two critical documentation files:

### 게임전체프로세스.md (Complete Game Process)
**Location:** `C:\Users\hpcra\armchair-sleuths\doc.md\게임전체프로세스.md`
**Purpose:** Documents the complete end-to-end game process flow
**When to load:** Always during implementation and design modes

### 완벽게임구현상태.md (Perfect Implementation State)
**Location:** `C:\Users\hpcra\armchair-sleuths\doc.md\완벽게임구현상태.md`
**Purpose:** Defines the ideal/target implementation state for all features
**When to load:** During implementation, validation, and documentation modes

**How to load:**
```markdown
Load both documents at start of implementation/design tasks:
- Read 게임전체프로세스.md to understand process flow
- Read 완벽게임구현상태.md to understand target state
- Compare current implementation against target state
- Identify gaps and missing integrations
```

Details on when and how to load these documents are in `references/project-documents.md`.

## Quality Standards

All implementation work must meet these standards:

### Modularization
- Business logic grouped cohesively
- Single Responsibility Principle
- Minimal coupling between modules
- Avoid over-engineering
- Simplest solution that works

### Completeness
- All layers implemented (Frontend + Backend + API)
- All integration points connected
- All error cases handled
- All validation in place
- All edge cases covered

### Code Quality
- Follows project conventions (discovered via codebase exploration)
- Proper error messages
- Logging where appropriate
- Comments for complex logic
- Type safety maintained

### Documentation
- Code comments for non-obvious logic
- API endpoints documented
- Complex flows explained
- Project docs kept in sync

## Workflows

### Workflow 1: Implementation Request

**Trigger:** User says "implement [feature]"

**Steps:**
1. Auto-enable MCP tools (--seq, --ref, --c7)
2. Include quality standard reminder
3. Enter Implementation Guide Mode
4. Load `references/project-documents.md`
5. Load project documentation (게임전체프로세스.md, 완벽게임구현상태.md)
6. Analyze request using --seq:
   - What's required at each layer?
   - What integration points needed?
   - What patterns to follow?
7. Use --c7 to explore codebase:
   - Find similar implementations
   - Understand conventions
   - Locate integration points
8. Guide implementation with oversight:
   - Implement frontend (if needed)
   - Implement backend (if needed)
   - Implement API (if needed)
   - Connect all layers
   - Add error handling everywhere
   - Add validation everywhere
9. Load `references/validation-checklist.md`
10. Verify completeness using checklist
11. Report any gaps or issues
12. Update documentation if needed

**Example:**
```
User: "사용자 프로필 편집 기능 구현해줘"

Guardian activates:
1. ✅ Auto-enabled: --seq, --ref, --c7
2. ✅ Quality reminder included
3. ✅ Loaded project docs
4. 📋 Analysis:
   - Frontend: Profile edit form component needed
   - Backend: Update user service method needed
   - API: PUT /api/users/:id endpoint needed
   - Integration: Form → API → Service → DB
5. 🔍 Codebase exploration:
   - Found similar pattern in user creation
   - Located existing user service
   - Found API route structure
6. 💻 Implementation with oversight:
   - Create ProfileEditForm.tsx
   - Add updateUser method to UserService
   - Create PUT endpoint in user routes
   - Connect all layers
   - Add error handling (network, validation, server errors)
   - Add loading states, success/error messages
7. ✅ Validation:
   - Frontend ↔ API connection verified
   - API ↔ Backend connection verified
   - Backend ↔ DB connection verified
   - Error propagation verified
8. 📝 Documentation updated
```

### Workflow 2: Design Request (Modular Template)

**Trigger:** User says "개발 설계 진행하라" with modular requirements

**Steps:**
1. Auto-enable --seq, --ref, --c7
2. Include quality standard
3. Load `references/design-template-modular.md`
4. Apply template:
   - **비즈니스 로직 그룹화**: Group related business logic
   - **적절한 모듈화**: Modularize at right granularity
   - **Over Engineering 피하기**: Avoid over-engineering
   - **최소 복잡도**: Minimal complexity and code
5. Output structure:
   - **개요**: High-level summary
   - **세부 유스케이스**: Detailed use cases
   - **주요 모듈 및 역할**: Key modules and their responsibilities
6. Format: Markdown, no code

**Example:**
```
User: "다음 요구사항을 구현하기위한 개발 설계 진행하라.
- 비즈니스 로직을 그룹화하고, 적절한 단위로 모듈화하라.
  Over Engineering을 피해 최소한의 복잡도와 코드로 구현해야한다.
- 개요, 세부 유스케이스, 주요 모듈 및 역할을 포함하여 응답하라.
- 구체적인 코드는 포함하지 않는다. 마크다운으로 응답하라.
---
케이스 자동 생성 기능"

Guardian applies modular design template and outputs structured design
```

### Workflow 3: Design Request (Flow Template)

**Trigger:** User says "최소한의 모듈화 설계 진행하라" with flow requirements

**Steps:**
1. Auto-enable --seq, --ref, --c7
2. Include quality standard
3. Load `references/design-template-flow.md`
4. Follow flow template:
   1. **요구사항 분석** → User flow, Data flow 작성
   2. **코드베이스 탐색** → Convention, guideline 파악
   3. **모듈 및 작업 위치 결정** → What modules, where to place them
5. Output minimal modularization design

**Example:**
```
User: "다음 요구사항을 구현하기위한 최소한의 모듈화 설계 진행하라.
반드시 다음 순서를 따라야한다.
1. 요구사항을 분석하여 자세한 user flow, data flow를 작성한다
2. 코드베이스에서 관련 파일들을 탐색하여 convention, guideline 등을 파악한다.
3. 구현해야할 모듈 및 작업위치를 결정한다.
---
이미지 지연 로딩 기능"

Guardian applies flow design template:
1. Analyzes requirement → user/data flow
2. Explores codebase with --c7 → finds patterns
3. Outputs minimal module design
```

### Workflow 4: Validation Request

**Trigger:** User says "검증해줘" or after implementation

**Steps:**
1. Load `references/validation-checklist.md`
2. Load `references/project-documents.md`
3. Load project state docs
4. Verify against checklist:
   - ✅ Frontend layer complete?
   - ✅ Backend layer complete?
   - ✅ API layer complete?
   - ✅ All integrations connected?
   - ✅ Error handling everywhere?
   - ✅ Validation everywhere?
   - ✅ Documentation in sync?
5. Report findings with specific gaps
6. Recommend fixes

### Workflow 5: Documentation Sync Request

**Trigger:** User says "문서 업데이트" or major implementation completed

**Steps:**
1. Load `references/project-documents.md`
2. Read 게임전체프로세스.md
3. Read 완벽게임구현상태.md
4. Analyze recent changes (from conversation context)
5. Identify outdated sections
6. Write updated sections
7. Apply updates to files
8. Verify consistency

## Integration with Other Tools

### Git Workflow
When implementation is complete and validated:
- Create feature branch if needed
- Commit changes with descriptive message
- Update documentation in same commit
- Create PR with implementation summary

### Testing
After implementation:
- Run existing tests
- Add new tests for new features
- Verify all tests pass
- Document test coverage

### Code Review
Before merging:
- Self-review using validation checklist
- Check for missing error handling
- Verify integration points
- Ensure documentation is updated

## Common Scenarios

### Scenario 1: Feature Request with Missing Details

**User:** "알림 기능 만들어줘"

**Guardian Response:**
1. Activates with MCP tools
2. Asks clarifying questions:
   - What type of notifications? (Email, push, in-app?)
   - What triggers notifications?
   - What should notification contain?
3. Loads project docs to understand existing notification patterns
4. Once clarified, proceeds with implementation guide mode

### Scenario 2: Implementation Incomplete

**User:** Implements feature but forgets API layer

**Guardian Detection:**
1. Validation mode runs after implementation
2. Checklist identifies missing API endpoints
3. Reports: "⚠️ API layer missing: No endpoints created for [feature]"
4. Guides completion of missing layer

### Scenario 3: Design Request Without Template Specification

**User:** "케이스 생성 기능 설계해줘"

**Guardian Response:**
1. Asks which template to use:
   - Modular design template? (business logic grouping)
   - Flow-based design template? (user/data flow first)
2. Or suggests based on request complexity
3. Applies chosen template

### Scenario 4: Documentation Drift

**Guardian Detection:**
1. After major implementation, documentation sync mode suggests updating docs
2. Compares implementation state with 완벽게임구현상태.md
3. Identifies drifts
4. Updates documentation automatically

## Error Prevention

The guardian prevents these common errors:

### Missing Integration
**Prevention:** Always checks all three layers (Frontend/Backend/API) and their connections

### Incomplete Error Handling
**Prevention:** Validation checklist requires error handling at every layer

### Convention Violations
**Prevention:** Uses --c7 to explore codebase and follow existing patterns

### Over-Engineering
**Prevention:** Design templates emphasize simplicity and minimal complexity

### Documentation Drift
**Prevention:** Automatic documentation sync mode after implementations

### Missing Edge Cases
**Prevention:** Quality standard requires thorough analysis with --seq

## Reference Files

### references/project-documents.md
**Load when:** Always during implementation, design, validation modes
**Contains:**
- Locations of 게임전체프로세스.md and 완벽게임구현상태.md
- When to load each document
- How to interpret the documents
- Grep patterns for finding specific sections

### references/design-template-modular.md
**Load when:** Design mode with modular requirements
**Contains:**
- Complete modular design template
- Business logic grouping principles
- Modularization guidelines
- Anti-patterns to avoid
- Output format specification

### references/design-template-flow.md
**Load when:** Design mode with flow-based requirements
**Contains:**
- Complete flow-based design template
- User flow creation guide
- Data flow creation guide
- Convention discovery methods
- Module placement strategies

### references/mcp-integration.md
**Load when:** Need guidance on MCP tool usage
**Contains:**
- Detailed usage of --seq, --ref, --c7
- When to use each tool
- How to combine tools effectively
- Quality standard template
- Example usage patterns

### references/validation-checklist.md
**Load when:** Validation mode or after implementation
**Contains:**
- Complete end-to-end validation checklist
- Layer-by-layer verification items
- Integration point checks
- Common gap patterns
- Fix recommendations

## Success Criteria

The guardian succeeds when:

- ✅ No missing integrations between layers
- ✅ No forgotten error handling
- ✅ No undocumented changes
- ✅ No convention violations
- ✅ No over-engineered solutions
- ✅ Documentation stays in sync with implementation
- ✅ All edge cases handled
- ✅ Clean, maintainable, modular code

## Daily Usage Pattern

**Morning:** Start implementation
- Guardian activates automatically
- Loads project docs
- Provides context and oversight

**During:** Implementation work
- Guardian guides through each layer
- Verifies integrations as you go
- Suggests tests and error handling

**Evening:** Validation and sync
- Guardian validates completeness
- Updates documentation
- Reports on day's progress

**Result:** Clean, complete, well-documented implementation with no missing pieces

---

**This skill is always watching, always guiding, always ensuring your implementation is complete and correct.** 🛡️
