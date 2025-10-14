# Conflict Resolution and Recovery Procedures

## Principle Conflict Resolution Hierarchy

### Priority Matrix (Highest to Lowest)

1. **BUILD INTEGRITY** - System must compile and run
2. **USER AUTONOMY** - User must maintain control and choice
3. **ATOMIC COMPLETION** - Single items must be completed fully
4. **SERIAL EXECUTION** - Vertical slices must be completed before expansion
5. **DEVELOPMENT VELOCITY** - Speed of feature delivery

### Conflict Resolution Decision Tree

```
Development Conflict Detected
    ↓
Does it affect build integrity?
    ↓ YES                           ↓ NO
PRIORITY: Fix build first           Does it violate user autonomy?
    ↓                                   ↓ YES                    ↓ NO
Stop all work                       PRIORITY: Preserve choice    Does it break atomicity?
Fix compilation                         ↓                           ↓ YES              ↓ NO
Resume with working build           Ask user for decision       PRIORITY: Complete    Check serial execution
                                        ↓                       single item first         ↓
                                    Apply user choice               ↓                 Apply serial protocol
                                                                Complete atomically
```

## Specific Conflict Scenarios and Resolutions

### Scenario 1: Build Failure vs. Feature Completion

**Conflict**: Feature is 90% complete but build is broken

**Resolution**:
1. **STOP** all feature development immediately
2. **REVERT** to last working build state
3. **IDENTIFY** what broke the build
4. **FIX** build issue atomically
5. **VERIFY** build works
6. **RESUME** feature development

**Example**:
```typescript
// Conflict: Adding new component breaks existing imports
// Resolution Protocol:

// Step 1: Stop and assess
git status  // See what changed

// Step 2: Revert to working state
git checkout -- src/components/index.ts

// Step 3: Fix build issue atomically
// Add only the necessary export
export { NewComponent } from './NewComponent'

// Step 4: Verify build
npm run build  // Must succeed

// Step 5: Resume feature work
// Continue with component implementation
```

### Scenario 2: User Autonomy vs. Development Efficiency

**Conflict**: User hasn't specified framework, but React seems obvious

**Resolution**:
1. **NEVER** assume the "obvious" choice
2. **STATE** the objective fact
3. **PROVIDE** clear options
4. **ASK** for explicit decision
5. **WAIT** for user response

**Example**:
```
❌ WRONG: "I'll use React since it's the most popular framework..."

✅ CORRECT: 
"FACT: No frontend framework is specified in your project.
SOLUTION: Popular options are React, Vue, Angular, or vanilla JavaScript.
QUESTION: Which frontend framework would you like to use?"
```

### Scenario 3: Atomic Development vs. Serial Execution

**Conflict**: Completing one atomic item requires breaking serial development

**Resolution**:
1. **ASSESS** if the atomic item truly requires breaking serial flow
2. **IF YES**: Complete the atomic item but document the serial violation
3. **IMMEDIATELY** return to serial development after atomic completion
4. **VALIDATE** that the deviation was necessary

**Example**:
```typescript
// Conflict: Need to fix shared utility while building component
// Resolution:

// Step 1: Assess necessity
// Is the utility fix required for current component?
// YES: Proceed with atomic fix
// NO: Add to backlog, continue with current slice

// Step 2: Complete atomic fix
// Fix only the specific utility function needed
// Test the fix in isolation
// Commit the atomic change

// Step 3: Return to serial development
// Continue with original vertical slice
// Don't expand utility beyond current needs
```

### Scenario 4: No-Assumptions vs. Development Speed

**Conflict**: Asking every question slows down development

**Resolution**:
1. **PRIORITIZE** user autonomy over speed
2. **BATCH** related questions when possible
3. **PROVIDE** clear context for why questions are needed
4. **OFFER** to proceed with explicit defaults if user prefers

**Example**:
```
❌ WRONG: Skip questions to move faster

✅ CORRECT:
"I need to make several configuration choices to proceed efficiently:
1. Testing framework: Jest, Vitest, or Cypress?
2. Styling approach: CSS modules, Tailwind, or styled-components?
3. State management: useState, useReducer, or external library?

Would you like to specify these now, or should I use common defaults (Jest, Tailwind, useState) and we can change them later?"
```

## Recovery Procedures

### Recovery from Build Failures

#### Immediate Response Protocol
```bash
#!/bin/bash
# Build failure recovery script

echo "🚨 Build failure detected - initiating recovery..."

# Step 1: Stop all development
echo "⏹️ Stopping all development processes..."
pkill -f "npm run dev"
pkill -f "vite"

# Step 2: Assess current state
echo "📊 Assessing current state..."
git status
npm run build 2>&1 | tee build-error.log

# Step 3: Identify last working commit
echo "🔍 Finding last working commit..."
git log --oneline -10

# Step 4: Offer recovery options
echo "🔧 Recovery options:"
echo "1. Revert last commit: git revert HEAD"
echo "2. Reset to specific commit: git reset --hard <commit-hash>"
echo "3. Stash changes and debug: git stash"
echo "4. Manual fix required"

read -p "Choose recovery option (1-4): " option

case $option in
    1) git revert HEAD ;;
    2) read -p "Enter commit hash: " hash && git reset --hard $hash ;;
    3) git stash ;;
    4) echo "Manual intervention required" ;;
esac

# Step 5: Verify recovery
npm run build && echo "✅ Build recovered" || echo "❌ Manual fix still needed"
```

### Recovery from Assumption Violations

#### Assumption Correction Protocol
```typescript
class AssumptionRecoveryHandler {
  correctAssumption(violation: AssumptionViolation): CorrectedResponse {
    const correction = this.generateCorrection(violation)
    
    return {
      acknowledgment: `I made an assumption about ${violation.topic}.`,
      factStatement: this.extractFacts(violation.context),
      question: this.generateQuestion(violation.context),
      options: this.provideOptions(violation.context)
    }
  }
  
  private generateCorrection(violation: AssumptionViolation): string {
    const templates = {
      preference: "Let me state the facts and ask for your preference:",
      technical: "Let me provide the technical options and ask for your choice:",
      process: "Let me explain the situation and ask how you'd like to proceed:"
    }
    
    return templates[violation.category] || templates.technical
  }
}
```

### Recovery from Serial Development Violations

#### Parallel Work Recovery Protocol
```typescript
class SerialRecoveryHandler {
  recoverFromParallelWork(violations: ParallelViolation[]): RecoveryPlan {
    const activeTasks = this.identifyActiveTasks(violations)
    const priorityTask = this.selectPriorityTask(activeTasks)
    
    return {
      immediateActions: [
        'Pause all tasks except priority task',
        'Complete priority task fully',
        'Validate priority task works end-to-end'
      ],
      priorityTask,
      pausedTasks: activeTasks.filter(task => task.id !== priorityTask.id),
      resumptionOrder: this.calculateResumptionOrder(activeTasks),
      validationSteps: this.generateValidationSteps(priorityTask)
    }
  }
  
  private selectPriorityTask(tasks: Task[]): Task {
    // Priority criteria:
    // 1. Closest to completion
    // 2. Blocks other work
    // 3. Critical path item
    // 4. User-requested priority
    
    return tasks.reduce((priority, current) => {
      const priorityScore = this.calculatePriorityScore(priority)
      const currentScore = this.calculatePriorityScore(current)
      return currentScore > priorityScore ? current : priority
    })
  }
}
```

## Escalation Procedures

### Level 1: Automated Resolution

#### Automated Conflict Resolver
```typescript
class AutomatedConflictResolver {
  resolveConflict(conflict: PrincipleConflict): Resolution | null {
    const resolutionStrategies = {
      'build_vs_feature': this.resolveBuildConflict,
      'autonomy_vs_speed': this.resolveAutonomyConflict,
      'atomic_vs_serial': this.resolveAtomicSerialConflict,
      'assumptions_vs_efficiency': this.resolveAssumptionConflict
    }
    
    const strategy = resolutionStrategies[conflict.type]
    if (strategy) {
      return strategy(conflict)
    }
    
    return null // Escalate to Level 2
  }
  
  private resolveBuildConflict(conflict: PrincipleConflict): Resolution {
    return {
      action: 'PRIORITIZE_BUILD',
      steps: [
        'Stop all feature development',
        'Fix build issues first',
        'Validate build success',
        'Resume feature development'
      ],
      rationale: 'Build integrity is highest priority'
    }
  }
}
```

### Level 2: Manual Intervention

#### User Decision Required
```typescript
class ManualInterventionHandler {
  requestUserDecision(conflict: PrincipleConflict): UserDecisionRequest {
    return {
      conflictDescription: this.describeConflict(conflict),
      options: this.generateOptions(conflict),
      recommendations: this.generateRecommendations(conflict),
      consequences: this.explainConsequences(conflict),
      defaultAction: this.suggestDefault(conflict),
      timeoutAction: this.defineTimeoutBehavior(conflict)
    }
  }
  
  private describeConflict(conflict: PrincipleConflict): string {
    return `Conflict detected between ${conflict.principle1} and ${conflict.principle2}:
    
    Situation: ${conflict.context}
    
    ${conflict.principle1} requires: ${conflict.requirement1}
    ${conflict.principle2} requires: ${conflict.requirement2}
    
    These requirements are incompatible and require your decision.`
  }
}
```

### Level 3: System Override

#### Emergency Override Protocol
```typescript
class EmergencyOverrideHandler {
  allowOverride(conflict: PrincipleConflict, justification: string): Override {
    const override = {
      conflictId: conflict.id,
      overriddenPrinciple: this.selectOverriddenPrinciple(conflict),
      justification,
      timestamp: new Date(),
      additionalMonitoring: this.defineAdditionalMonitoring(conflict),
      reviewRequired: true,
      autoRevertConditions: this.defineAutoRevert(conflict)
    }
    
    this.logOverride(override)
    this.implementAdditionalMonitoring(override)
    this.scheduleReview(override)
    
    return override
  }
  
  private defineAdditionalMonitoring(conflict: PrincipleConflict): MonitoringRule[] {
    return [
      {
        metric: 'build_success_rate',
        threshold: 0.95,
        action: 'alert_if_below'
      },
      {
        metric: 'assumption_violation_count',
        threshold: 3,
        action: 'require_review'
      },
      {
        metric: 'parallel_work_duration',
        threshold: '2_hours',
        action: 'force_serialization'
      }
    ]
  }
}
```

## Fallback System Implementation

### Fallback Hierarchy

#### Primary System Failure → Secondary Validation
```typescript
class FallbackSystemManager {
  handlePrimaryFailure(system: ValidationSystem, failure: SystemFailure): void {
    const fallbackSystems = this.getFallbackSystems(system)
    
    fallbackSystems.forEach(fallback => {
      try {
        fallback.activate()
        this.logFallbackActivation(system, fallback)
      } catch (error) {
        this.logFallbackFailure(fallback, error)
      }
    })
    
    if (this.allFallbacksFailed(fallbackSystems)) {
      this.escalateToManualMode()
    }
  }
  
  private getFallbackSystems(primary: ValidationSystem): FallbackSystem[] {
    const fallbackMap = {
      'automated_validation': ['manual_checklist', 'peer_review'],
      'real_time_monitoring': ['periodic_checks', 'user_alerts'],
      'conflict_resolution': ['escalation_queue', 'manual_override']
    }
    
    return fallbackMap[primary.type]?.map(type => 
      this.createFallbackSystem(type)
    ) || []
  }
}
```

### Manual Fallback Procedures

#### When All Automation Fails
```markdown
# Manual Fallback Checklist

## When Automated Systems Fail

### Immediate Actions
- [ ] Stop all automated processes
- [ ] Switch to manual validation mode
- [ ] Document the system failure
- [ ] Notify relevant stakeholders

### Manual Validation Process

#### Atomic Development Check
- [ ] Is current task single-purpose?
- [ ] Can it be completed in one session?
- [ ] Does it have a clear test?
- [ ] Will build still work after completion?

#### No-Assumptions Check
- [ ] Did I state objective facts?
- [ ] Did I ask direct questions?
- [ ] Did I preserve user choice?
- [ ] Did I avoid making assumptions?

#### Serial Development Check
- [ ] Is current vertical slice complete?
- [ ] Am I working on only one item?
- [ ] Is end-to-end communication validated?
- [ ] Are there any parallel work violations?

### Recovery Actions
- [ ] Fix any violations found
- [ ] Validate fixes manually
- [ ] Document lessons learned
- [ ] Plan system improvements
```

This comprehensive conflict resolution and recovery system ensures that development can continue effectively even when principles conflict or systems fail, maintaining the integrity of the development process while preserving user autonomy and system reliability.