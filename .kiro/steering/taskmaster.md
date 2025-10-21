---
inclusion: manual
---

# Task Creation Best Practices

**Purpose**: Mandatory rules for creating clear, actionable, integration-focused tasks that prevent rework and confusion.

**Status**: MANDATORY - Follow for all task creation

## Core Mandatory Rules

### Rule 1: Every Task Must Include 3 Essential Elements

```markdown
- [ ] X. Feature Name
  - **File**: exact/path/to/file.ts (new/update)
  - **Layer**: Server-Side Business Logic | Server Action | Client Component | Database
  - Implementation details
```

❌ **Bad**: Vague location, no layer
```markdown
- [ ] Create Journey Viewer
  - Add timeline
  - Add filtering
```

✅ **Good**: Exact file, layer, integration
```markdown
- [ ] 4. Journey Viewer Feature
  - [ ] 4.1 Create server action
    - **File**: src/features/living-mvp/server/actions.ts
    - **Layer**: Server Action
    - Function: fetchJourneyStepsAction()
  - [ ] 4.2 Create component
    - **File**: src/features/living-mvp/components/JourneyViewer.tsx
    - **Layer**: Client Component
  - [ ] 4.3 Integrate into page
    - **File**: src/app/simulations/[id]/living-mvp/content.tsx
    - **Integration Point**: Section 2, after stats
```

### Rule 2: UI Components Must Include Integration Sub-task

Every UI component task requires:
1. Create server action (data fetching)
2. Create UI component (display)
3. Integrate into page (specify exact location)
4. Define user interaction (button/tab/modal/panel)

### Rule 3: Complete Data Flow Chain

Ensure every step is connected:
```
Database → Business Logic → Server Action → Client Component → UI
```

Missing any link = broken feature.

### Rule 4: Specify Server Action Updates

When creating backend logic, always specify which server action calls it and how the response changes.

## Architecture Layers

### Layer 1: Database
- **Location**: Supabase PostgreSQL
- **Files**: `supabase/migrations/*.sql`
- **Access**: `createServiceRoleClient()` (server-side only)

### Layer 2: Server-Side Business Logic
- **Location**: `src/lib/simulation/`
- **Characteristics**: Pure TypeScript, no directives
- **Examples**: `behavior-validator.ts`, `pattern-analyzer.ts`

### Layer 3: Server Actions
- **Location**: `src/features/[feature]/server/actions.ts`
- **Characteristics**: 'use server' directive
- **Examples**: `fetchJourneyStepsAction()`, `runSimulationAction()`

### Layer 4: Client Components
- **Location**: 
  - `src/features/[feature]/components/` (reusable)
  - `src/app/[route]/` (page-specific)
- **Characteristics**: 'use client' directive
- **Examples**: `JourneyViewer.tsx`, `content.tsx`

## Task Templates

### Backend-Only Task
```markdown
- [ ] X. [Feature Name]
  - **File**: src/lib/simulation/module-name.ts (new)
  - **Layer**: Server-Side Business Logic
  - Export: functionName(params): ReturnType
  - Database: createServiceRoleClient()
  - Implementation: [specific details]
  - _Requirements: X.X | Effort: Low/Medium/High | Impact: Low/Medium/High/Critical_
```

### Full-Stack Feature Task
```markdown
- [ ] X. [Feature Name] Feature

  - [ ] X.1 Create business logic
    - **File**: src/lib/simulation/module-name.ts (new)
    - **Layer**: Server-Side Business Logic
    - [Implementation details]
  
  - [ ] X.2 Create/Update server action
    - **File**: src/features/.../server/actions.ts (update)
    - **Layer**: Server Action
    - Function: actionName(params): Promise<ActionResponse<T>>
    - Calls: X.1 business logic
  
  - [ ] X.3 Create UI component
    - **File**: src/features/.../components/ComponentName.tsx (new)
    - **Layer**: Client Component
    - Features: [list]
    - State: [useState requirements]
  
  - [ ] X.4 Integrate into page
    - **File**: src/app/.../content.tsx (update)
    - **Layer**: Client Component
    - **Integration Point**: Section X, after Y
    - **User Interaction**: button/tab/modal/panel
    - **Data Flow**: X.2 action → X.3 component
  
  - _Requirements: X.X | Total Effort: Medium/High | Impact: High/Critical_
```

## Task Validation Checklist

Before finalizing any task, verify:

### Every Task Must Have:
- [ ] Exact file path (relative to project root)
- [ ] Layer specified (Database | Server-Side Logic | Server Action | Client Component)
- [ ] New or update indicator
- [ ] Clear implementation details

### UI Component Tasks Must Have:
- [ ] Server action for data fetching
- [ ] Component file path
- [ ] Integration point (Section X, after Y)
- [ ] Integration method (button/tab/modal/panel)

### Backend Logic Tasks Must Have:
- [ ] Export signature (function/class)
- [ ] Database access method (createServiceRoleClient())
- [ ] Server action update specification

### Data Flow Must Be:
- [ ] Complete chain: Database → Logic → Action → Component
- [ ] No gaps between layers
- [ ] Return types specified at each step

## 🚫 Common Mistakes (피해야 할 실수)

### Mistake 1: 파일 경로 누락
```markdown
❌ BAD:
- [ ] Create BehaviorValidator class
  - Implement alignment algorithms

✅ GOOD:
- [ ] Create BehaviorValidator class
  - **File**: src/lib/simulation/behavior-validator.ts (new)
  - **Layer**: Server-Side Business Logic
  - Implement alignment algorithms
```

### Mistake 2: Layer 구분 없음
```markdown
❌ BAD:
- [ ] Update InterviewAI
  - Add emotional context

✅ GOOD:
- [ ] Update InterviewAI (Server-Side Business Logic)
  - **File**: src/lib/simulation/interview-ai.ts
  - **Layer**: Server-Side Business Logic
  - Add emotional context to prompt
```

### Mistake 3: 통합 위치 불명확
```markdown
❌ BAD:
- [ ] Create JourneyViewer component
  - Display timeline
  - Add to page

✅ GOOD:
- [ ] Create JourneyViewer component
  - **File**: src/features/living-mvp/components/JourneyViewer.tsx
  - Display timeline
- [ ] Integrate into Living MVP page
  - **File**: src/app/simulations/[id]/living-mvp/content.tsx
  - **Integration Point**: Section 2, after simulation stats
  - Add "View Journey" button
  - Open in expandable panel
```

### Mistake 4: Server Action 업데이트 누락
```markdown
❌ BAD:
- [ ] Create PatternAnalyzer class
  - Detect common sequences
  - Store in database

✅ GOOD:
- [ ] Create PatternAnalyzer class
  - **File**: src/lib/simulation/pattern-analyzer.ts
  - Detect common sequences
  - Store in living_journey_patterns table
- [ ] Update generateInsightsAction()
  - **File**: src/features/living-mvp/server/actions.ts
  - Call PatternAnalyzer after simulation
  - Include patterns in response
```

### Mistake 5: 데이터 흐름 단절
```markdown
❌ BAD:
- [ ] Create FactChecker class
  - Validate interview claims
- [ ] Display accuracy badge in UI
  (중간 단계 누락!)

✅ GOOD:
- [ ] Create FactChecker class
  - **File**: src/lib/simulation/fact-checker.ts
  - Validate interview claims
- [ ] Update askPersonaAction()
  - **File**: src/features/living-mvp/server/actions.ts
  - Call FactChecker after generating response
  - Return accuracy score
- [ ] Display accuracy badge in UI
  - **File**: src/app/simulations/[id]/living-mvp/content.tsx
  - Show badge with accuracy score from response
```

---

## 📊 Integration Patterns

### Pattern 1: Expandable Section
```markdown
- [ ] X.4 Integrate into page
  - **File**: src/app/.../content.tsx
  - **Integration Point**: Section X, after Y
  - Add "View Details" button
  - Show/hide content with useState
  - Render component when expanded
```

### Pattern 2: Modal Dialog
```markdown
- [ ] X.4 Integrate into page
  - **File**: src/app/.../content.tsx
  - **Integration Point**: Section X, in card
  - Add "Open Report" button
  - Use Dialog component from shadcn/ui
  - Pass data as props to modal component
```

### Pattern 3: Tab Navigation
```markdown
- [ ] X.4 Integrate into page
  - **File**: src/app/.../content.tsx
  - **Integration Point**: Section X, new tab
  - Add tab to existing Tabs component
  - Render component in TabsContent
  - Load data when tab is active
```

### Pattern 4: Badge/Indicator
```markdown
- [ ] X.4 Integrate into page
  - **File**: src/app/.../content.tsx
  - **Integration Point**: Section X, on existing card
  - Add Badge component next to title
  - Show score/status from data
  - Add tooltip for explanation
```

---

## 🎯 Real-World Example

### Before (문제 있는 태스크)
```markdown
- [ ] 4. Journey Viewer UI Component
  - Create JourneyViewer component
  - Display step-by-step timeline
  - Add filtering by emotion/action type
  - Add export to JSON/CSV functionality
```

**Problems**:
- ❌ 파일 경로 없음
- ❌ Layer 구분 없음
- ❌ 데이터를 어떻게 가져오는지 없음
- ❌ 어디에 통합하는지 없음

### After (올바른 태스크)
```markdown
- [ ] 4. Journey Viewer Feature (Full Integration)
  - [ ] 4.1 Create server action
    - **File**: src/features/living-mvp/server/actions.ts
    - **Layer**: Server Action
    - Function: fetchJourneyStepsAction(simulationId: string, personaId: string)
    - Query: living_journey_steps table using createServiceRoleClient()
    - Return: ActionResponse<JourneyStep[]>
    - _Effort: Low_
  
  - [ ] 4.2 Create JourneyViewer component
    - **File**: src/features/living-mvp/components/JourneyViewer.tsx (new)
    - **Layer**: Client Component ('use client')
    - Display step-by-step timeline with timestamps
    - Show emotion emoji, thought bubble, action for each step
    - Add filtering by emotion/action type
    - Add export to JSON/CSV functionality
    - Use useState for current step navigation
    - _Effort: Medium_
  
  - [ ] 4.3 Integrate into Living MVP page
    - **File**: src/app/simulations/[id]/living-mvp/content.tsx
    - **Layer**: Client Component
    - **Integration Point**: Section 2 (Simulation Results), after simulation stats cards
    - Add "View Journey" button below conversion/churn stats
    - Call fetchJourneyStepsAction() when button clicked
    - Open JourneyViewer in expandable panel (use useState for visibility)
    - Add persona selector dropdown to switch between personas
    - _Effort: Low_
  
  - _Requirements: 1.1_
  - _Total Effort: Medium, Impact: High_
```

**Solutions**:
- ✅ 모든 파일 경로 명시
- ✅ 모든 Layer 구분
- ✅ 완전한 데이터 흐름 (DB → Action → Component)
- ✅ 정확한 통합 위치 (Section 2, after stats)
- ✅ 통합 방법 명시 (button, expandable panel)

---

## 📝 Quick Reference

### When creating a task, ask yourself:

1. **WHERE?** - 정확한 파일 경로가 있는가?
2. **WHAT LAYER?** - Server-Side Logic | Server Action | Client Component?
3. **HOW TO GET DATA?** - Server Action이 있는가?
4. **WHERE TO INTEGRATE?** - 통합 위치가 명확한가?
5. **HOW TO INTEGRATE?** - button/tab/modal/panel?
6. **COMPLETE FLOW?** - DB → Logic → Action → Component 연결되었는가?

### If answer is NO to any question:
→ **STOP and fix the task before proceeding**

---

## 🚀 Implementation Workflow

### Step 1: Review Task
- Read task completely
- Verify all required information present
- Check file paths, layers, integration points

### Step 2: Implement in Order
- Follow sub-task order (X.1 → X.2 → X.3 → X.4)
- Test each sub-task before moving to next
- Verify data flow at each step

### Step 3: Verify Integration
- Check component appears in correct location
- Test user interaction (button click, tab switch, etc.)
- Verify data displays correctly

### Step 4: Mark Complete
- Only mark complete when fully integrated and tested
- Document any issues or deviations
- Update task status in tasks.md

---

## 📚 Related Documents

- `.kiro/steering/supabase-database-workflow.md` - Database migration workflow
- `.kiro/steering/typescript-pro.md` - TypeScript best practices
- `.kiro/steering/efficient-validation-workflow.md` - Fast validation methods
- `docs/living-mvp-v2-final-architecture-summary.md` - Architecture reference

---

## ✅ Final Checklist

Before submitting tasks.md for review:

- [ ] All tasks have **File** specified
- [ ] All tasks have **Layer** specified
- [ ] All UI components have integration sub-tasks
- [ ] All backend logic has server action updates
- [ ] All data flows are complete (no gaps)
- [ ] All integration points are specific (Section X, after Y)
- [ ] All integration methods are clear (button/tab/modal/panel)
- [ ] No ambiguous language ("add to page", "update component")
- [ ] Each task is independently testable
- [ ] Dependencies between tasks are clear

---

**Document Version**: 1.0  
**Created**: 2025-01-07  
**Based On**: Living MVP v2 Task Creation Experience  
**Status**: MANDATORY - Must follow for all task creation  
**Last Updated**: 2025-01-07

---

## 🎓 Remember

**Good tasks = Fast implementation + No rework + Happy developers**

**Bad tasks = Confusion + Delays + Rework + Frustration**

**Always ask: "Can a developer implement this task without asking any questions?"**

If NO → Fix the task!
<!------------------------------------------------------------------------------------
   Add Rules to this file or a short description and have Kiro refine them for you:   
-------------------------------------------------------------------------------------> 