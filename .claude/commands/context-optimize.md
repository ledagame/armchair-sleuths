---
description: Context usage analysis and agent optimization recommendations
---

You are a Context Optimization Specialist. Analyze the current context usage and provide actionable recommendations for optimizing agent loading efficiency.

## Your Task

1. **Analyze Current Context State**
   - Parse the output from `/context` command (already in context)
   - Identify all loaded custom agents
   - Calculate token usage per agent
   - Identify potential redundancies

2. **Usage Pattern Analysis**
   - Review conversation history (if available)
   - Identify which agents have been actively used
   - Categorize agents by usage frequency:
     - HIGH: Used 3+ times in recent sessions
     - MEDIUM: Used 1-2 times in recent sessions
     - LOW: Never used or very rare usage
     - UNKNOWN: Cannot determine (no usage data)

3. **Generate Optimization Report**

Present findings in this format:

```
# Context Optimization Report
Generated: [current date/time]

## Summary
- Total context usage: [X]k/200k tokens ([X]%)
- Custom agents loaded: [N] agents
- Agent token overhead: [X]k tokens
- Optimization potential: [X]k tokens ([X]% reduction)

## Agent Usage Analysis

### High Usage Agents (Keep Loaded)
- [agent-name]: [tokens] - Used [N] times
  Justification: [why it should stay loaded]

### Medium Usage Agents (Consider On-Demand)
- [agent-name]: [tokens] - Used [N] times
  Suggestion: [recommendation]

### Low/Never Used Agents (Archive Recommended)
- [agent-name]: [tokens] - Used [N] times
  Impact: [what happens if archived]

### Redundant/Overlapping Agents
- [agent-1] + [agent-2]: [total tokens]
  Overlap: [what functionality overlaps]
  Suggestion: [merge or choose one]

## Recommended Actions

### Priority 1: Immediate Wins (Expected: [X]k token savings)
1. Archive low-usage agents: [list]
2. [other actions]

### Priority 2: Consolidation (Expected: [X]k token savings)
1. Merge redundant agents: [list]
2. [other actions]

### Priority 3: Structural Improvements
1. [suggestions for better organization]
2. [suggestions for lazy loading implementation]

## Archive Command

To archive recommended agents, create this directory structure:
```
.claude/
├── agents/           (keep only high-usage)
└── agent-archive/    (move low-usage here)
```

Would you like me to execute the archiving process?
```

4. **Interactive Follow-up**

After presenting the report, ask:

"어떤 작업을 진행하시겠습니까?

1. 📦 추천된 에이전트들을 자동으로 아카이브
2. 🔍 특정 에이전트에 대한 상세 분석
3. 🎯 커스텀 보관 규칙 설정 (예: [X] 토큰 이상만 보관)
4. 📊 다른 최적화 전략 제안
5. ❌ 지금은 분석만 하고 변경 없음"

## Analysis Guidelines

### Token Estimation
- Average agent size: ~250 tokens
- Agents with examples: ~400-600 tokens
- Simple agents: ~50-150 tokens

### Usage Frequency Heuristics
Since direct usage logs may not be available, use these signals:
- Agent type relevance to project (check package.json, file structure)
- Common workflows (frontend dev → frontend-developer, ui-designer)
- Specialized vs general purpose
- Domain-specific vs cross-cutting concerns

### Red Flags for Archiving
- Agent description doesn't match project type
- Duplicate functionality (multiple "test" agents)
- Overly specific agents rarely needed
- Legacy agents from old workflows

### Keep-Loaded Criteria
- Used in automated workflows (code-reviewer, debugger)
- Project-specific specialists (devvit-reddit-game-expert)
- High-frequency use cases
- Core development agents

## Safety Considerations

Before recommending archiving:
- ⚠️ Check if agent is referenced in slash commands
- ⚠️ Check if agent is auto-invoked by workflows
- ⚠️ Verify no critical dependencies
- ⚠️ Ensure user can easily restore if needed

## Example Output Format

```
🎯 CONTEXT OPTIMIZATION REPORT

Current State: 95k/200k (47%)
├─ System: 28.8k (not optimizable)
├─ Agents: 12.5k ⚠️ HIGH - optimization target
├─ Memory: 2.7k ✓ acceptable
└─ Messages: minimal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 AGENT USAGE ANALYSIS (50 agents loaded)

🟢 HIGH USAGE - Keep Loaded (8 agents, 2.0k tokens)
  ✓ code-reviewer (374t) - Auto-invoked after code changes
  ✓ debugger (522t) - Frequently used for troubleshooting
  ✓ devvit-reddit-game-expert (379t) - Project-specific, high value
  ✓ fullstack-developer (483t) - Core development workflow
  ✓ frontend-developer (304t) - Primary UI work
  ✓ prompt-engineer (426t) - AI feature development
  ✓ test-writer-fixer (621t) - Test automation
  ✓ murder-mystery-game-designer (379t) - Project core feature

🟡 MEDIUM USAGE - Consider On-Demand (12 agents, 3.5k tokens)
  ? ui-ux-designer (461t) - Occasional UI work
  ? backend-architect (299t) - Occasional API work
  ? game-qa-detective (414t) - Periodic testing
  [... 9 more]

🔴 LOW/NEVER USED - Archive Recommended (30 agents, 7.0k tokens)
  ✗ mobile-developer (520t) - No mobile code in project
  ✗ mobile-app-builder (314t) - No mobile code in project
  ✗ nextjs-architecture-expert (633t) - Using Devvit, not Next.js
  ✗ seo-analyzer (490t) - Reddit app, SEO not applicable
  ✗ python-expert (31t) - JavaScript project only
  [... 25 more]

🔄 REDUNDANT CLUSTERS (4 clusters, 2.0k tokens wasted)
  ⚠️ Frontend cluster:
     - frontend-developer (304t) + frontend-architect (25t)
     - ui-designer (70t) + ui-ux-designer (461t)
     → Consolidate into: frontend-developer + ui-ux-designer
     → Savings: 395t

  ⚠️ Mobile cluster:
     - mobile-developer (520t) + mobile-app-builder (314t)
     → Not needed for this project
     → Savings: 834t

  [... 2 more clusters]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 RECOMMENDATIONS

Priority 1: Archive Unused (Save 7.0k tokens = 56%)
  → Move 30 agents to .claude/agent-archive/
  → Keep 20 essential agents
  → Expected: 12.5k → 5.5k tokens

Priority 2: Merge Redundant (Save 2.0k tokens = 16%)
  → Consolidate 8 agents → 4 agents
  → Expected: 5.5k → 3.5k tokens

Priority 3: Implement Lazy Loading
  → Move to .claude/agent-library/
  → Load on-demand via registry
  → Expected: 3.5k → 0.5-1.0k tokens baseline

TOTAL POTENTIAL SAVINGS: 9.0k → 11.5k tokens (72-92% reduction)
Final state: 95k → 84-86k tokens (42-43% usage)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

다음 단계를 선택하세요:
1. 📦 30개 미사용 에이전트 자동 아카이브
2. 🔍 특정 에이전트 상세 분석
3. 🎯 보관 기준 커스터마이즈
4. 📊 추가 최적화 제안
5. ❌ 분석만 하고 변경 없음
```

## Implementation Notes

- Be conservative: When in doubt, keep the agent loaded
- Provide easy rollback: Document how to restore archived agents
- Batch operations: Group related agents for archiving
- Validate before archiving: Double-check no critical dependencies
- User control: Never archive without explicit confirmation

Now, analyze the current context and provide the optimization report.
