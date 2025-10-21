# Project Documentation Reference

This file documents the location and usage of critical project documentation files for the armchair-sleuths project.

## Critical Documentation Files

### 1. 게임전체프로세스.md (Complete Game Process)

**Full Path:** `C:\Users\hpcra\armchair-sleuths\doc.md\게임전체프로세스.md`

**Purpose:**
Documents the complete end-to-end game process flow from user perspective. Describes how the game works, what happens at each step, and how different features interact.

**When to Load:**
- **Always** at the start of implementation tasks
- **Always** during design mode
- When understanding how features fit into overall game flow
- When validating feature completeness

**What it Contains:**
- Game initialization and setup flow
- User interaction patterns
- Feature workflows (case creation, investigation, voting, etc.)
- Integration points between features
- User journey from start to finish

**How to Use:**
```markdown
1. Load at beginning of implementation
2. Identify which part of the game process the new feature affects
3. Understand prerequisites and downstream effects
4. Ensure new implementation fits seamlessly into existing flow
5. Verify no process steps are broken by new changes
```

**Grep Patterns for Searching:**
```bash
# Find specific feature workflows
grep -A 10 "## [Feature Name]" 게임전체프로세스.md

# Find user interaction patterns
grep -B 5 -A 5 "사용자" 게임전체프로세스.md

# Find integration points
grep "연동" 게임전체프로세스.md
grep "통합" 게임전체프로세스.md
```

### 2. 완벽게임구현상태.md (Perfect Implementation State)

**Full Path:** `C:\Users\hpcra\armchair-sleuths\doc.md\완벽게임구현상태.md`

**Purpose:**
Defines the ideal/target implementation state for all game features. Serves as the "source of truth" for what should be implemented and how it should work.

**When to Load:**
- During implementation to understand target state
- During validation to compare actual vs. ideal state
- During documentation sync to update implementation status
- When planning new features to understand existing state

**What it Contains:**
- Complete feature list with implementation status
- Frontend component requirements
- Backend service requirements
- API endpoint specifications
- Database schema expectations
- Integration requirements between layers
- Quality standards for each feature

**How to Use:**
```markdown
1. Load when starting implementation
2. Find the feature you're implementing
3. Check what's required at each layer:
   - Frontend: What components?
   - Backend: What services?
   - API: What endpoints?
   - Database: What schema?
4. Implement all required pieces
5. After implementation, verify actual state matches perfect state
6. Update document if implementation differs from plan
```

**Grep Patterns for Searching:**
```bash
# Find specific feature implementation status
grep -A 20 "## [Feature Name]" 완벽게임구현상태.md

# Find frontend requirements
grep -A 5 "Frontend:" 완벽게임구현상태.md
grep "Component" 완벽게임구현상태.md

# Find backend requirements
grep -A 5 "Backend:" 완벽게임구현상태.md
grep "Service" 완벽게임구현상태.md

# Find API requirements
grep -A 5 "API:" 완벽게임구현상태.md
grep "endpoint" 완벽게임구현상태.md

# Find database requirements
grep -A 5 "Database:" 완벽게임구현상태.md
grep "schema" 완벽게임구현상태.md

# Find implementation status
grep "✅" 완벽게임구현상태.md  # Completed
grep "⚠️" 완벽게임구현상태.md  # Partial
grep "❌" 완벽게임구현상태.md  # Not started
```

## Loading Workflow

### Standard Implementation Task

```markdown
# Step 1: Load both documents
Read C:\Users\hpcra\armchair-sleuths\doc.md\게임전체프로세스.md
Read C:\Users\hpcra\armchair-sleuths\doc.md\완벽게임구현상태.md

# Step 2: Understand context
From 게임전체프로세스.md:
- Where does this feature fit in the game flow?
- What features does it depend on?
- What features depend on it?

From 완벽게임구현상태.md:
- What's the target implementation state?
- What layers need to be implemented?
- What's already done vs. what's missing?

# Step 3: Plan implementation
Based on documents:
- Identify all required pieces (Frontend/Backend/API/DB)
- Note all integration points
- Understand quality standards expected

# Step 4: Implement with oversight
Refer back to documents throughout implementation

# Step 5: Validate against perfect state
Compare implementation to 완벽게임구현상태.md
Verify nothing is missing

# Step 6: Update if needed
If implementation deviates from plan, update 완벽게임구현상태.md
```

### Design Task

```markdown
# Step 1: Load game process
Read 게임전체프로세스.md
Understand where new feature fits

# Step 2: Load perfect state (if feature exists)
Check if feature already documented in 완벽게임구현상태.md
If yes, use as starting point
If no, create new entry

# Step 3: Design with context
Design fits into existing game process
Follows patterns from existing features

# Step 4: Document design
Add to 완벽게임구현상태.md if new feature
```

### Validation Task

```markdown
# Step 1: Load perfect state
Read 완벽게임구현상태.md

# Step 2: Identify feature to validate
Find feature section in document

# Step 3: Compare actual vs. ideal
For each layer:
- Frontend: Implemented as specified?
- Backend: All services exist?
- API: All endpoints created?
- Database: Schema matches?
- Integrations: All connected?

# Step 4: Report gaps
List what's missing
List what's different from plan
```

### Documentation Sync Task

```markdown
# Step 1: Load both documents
Read both documents to understand current documented state

# Step 2: Analyze recent changes
What was just implemented?
What changed in the game process?

# Step 3: Update documents
게임전체프로세스.md:
- Add new process steps if game flow changed
- Update existing steps if behavior changed

완벽게임구현상태.md:
- Update implementation status (❌ → ⚠️ → ✅)
- Add new features if implemented
- Update existing features if changed

# Step 4: Verify consistency
Both documents should agree on current state
No contradictions between them
```

## Document Maintenance

### When to Update 게임전체프로세스.md

Update when:
- New user-facing feature changes game flow
- Feature behavior changes
- New integration between features
- Process step added or removed

Don't update for:
- Internal implementation details
- Bug fixes that don't change behavior
- Performance improvements
- Refactoring without behavior changes

### When to Update 완벽게임구현상태.md

Update when:
- New feature implemented
- Feature implementation status changes
- New layer added (frontend/backend/API)
- Architecture changes
- Integration points change

Update frequently - this is the living document of implementation state.

### Update Workflow

```markdown
1. Identify what changed
2. Read current version of document
3. Find relevant section
4. Draft updated content
5. Verify accuracy
6. Apply update
7. Check for ripple effects (does this change affect other sections?)
8. Update related sections if needed
```

## Integration with Implementation Guardian

The Implementation Guardian skill **automatically loads these documents** when:

1. **Implementation Mode activates:**
   - Loads both documents immediately
   - Uses them to guide implementation
   - Verifies against perfect state after implementation

2. **Design Mode activates:**
   - Loads 게임전체프로세스.md for context
   - Checks 완벽게임구현상태.md for existing design
   - Uses both to inform design decisions

3. **Validation Mode activates:**
   - Loads 완벽게임구현상태.md as validation criteria
   - Compares actual implementation against documented state
   - Reports discrepancies

4. **Documentation Sync Mode activates:**
   - Loads both documents
   - Updates them based on recent changes
   - Maintains consistency between them

## Quick Reference

**Load both documents:**
When doing any implementation, design, or validation work

**Search for feature:**
```bash
grep -A 20 "## [Feature Name]" <document>
```

**Check implementation status:**
```bash
grep "✅\|⚠️\|❌" 완벽게임구현상태.md
```

**Find integration points:**
```bash
grep "연동\|통합\|integration" 게임전체프로세스.md
```

**Validate completeness:**
Compare actual code against 완벽게임구현상태.md requirements

**Keep docs in sync:**
Update after every significant implementation

---

**These documents are the source of truth for the armchair-sleuths project. Always load them. Always trust them. Always update them.**
