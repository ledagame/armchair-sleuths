# Claude Skills Integration for Kiro - Requirements

## Introduction

This spec defines how to integrate Claude's Skills system into Kiro IDE, enabling AI-powered development workflows that leverage both Kiro's steering system and Claude's skill capabilities.

## Glossary

- **Kiro**: AI-powered IDE with steering rules and hooks system
- **Claude Skills**: Reusable AI capabilities defined by PROMPT.md files
- **Steering Rules**: Kiro's context files that guide AI behavior
- **Skill Activation**: Process of loading and using a Claude skill in Kiro
- **Skill Context**: Combined context from skill PROMPT.md and Kiro steering rules

## Requirements

### Requirement 1: Skill Discovery and Loading

**User Story:** As a developer, I want Kiro to automatically discover and load Claude skills from the `skills/` directory, so that I can use specialized AI capabilities without manual configuration.

#### Acceptance Criteria

1. WHEN Kiro starts, THE system SHALL scan the `skills/` directory for valid skill folders
2. WHEN a skill folder contains a `SKILL.md` or `PROMPT.md` file, THE system SHALL register it as an available skill
3. WHEN a skill has a `SKILL.yaml` metadata file, THE system SHALL parse and store the skill configuration
4. WHEN multiple skills are found, THE system SHALL maintain a registry of all available skills with their metadata

### Requirement 2: Skill Activation via Keywords

**User Story:** As a developer, I want to activate skills using natural language keywords, so that I can quickly access specialized capabilities without remembering exact commands.

#### Acceptance Criteria

1. WHEN I mention a skill trigger keyword in my request, THE system SHALL automatically activate the relevant skill
2. WHEN a skill is activated, THE system SHALL display a notification in the chat interface showing which skill was activated
3. WHEN a skill is activated, THE system SHALL load the skill's PROMPT.md content into the AI context
4. WHEN multiple skills match the keywords, THE system SHALL show a selection UI with checkboxes for the user to choose which skills to activate
5. WHEN a skill has dependencies, THE system SHALL load dependent skills automatically and notify the user
6. WHEN skill activation fails, THE system SHALL display an error message with troubleshooting suggestions in the chat

#### Testing Procedure

**Manual Testing in Kiro IDE Chat:**
1. Open Kiro IDE chat interface
2. Type message containing skill trigger keywords (e.g., "improve prompt", "generate case", "debug error")
3. Verify skill activation notification appears in chat
4. Confirm skill context is loaded (check AI response includes skill-specific knowledge)
5. Test with multiple keywords to verify multiple skill activation
6. Test with invalid keywords to verify error handling

**Automated Testing:**
- Run: `npx tsx .kiro/skills-system/demo-skill-activation.ts`
- Use commands: `activate improve prompt`, `list`, `active`, `stats`
- Verify 13 skills are discovered and can be activated by keywords

### Requirement 3: Skill Context Integration

**User Story:** As a developer, I want skills to work seamlessly with Kiro's steering rules, so that I get consistent AI behavior across all features.

#### Acceptance Criteria

1. WHEN a skill is activated, THE system SHALL merge the skill's PROMPT.md with active steering rules
2. WHEN there are conflicts between skill instructions and steering rules, THE steering rules SHALL take precedence
3. WHEN a skill references project files, THE system SHALL provide access to those files in the context
4. WHEN a skill completes its task, THE system SHALL maintain the skill context for follow-up questions

### Requirement 4: Skill Execution and Automation

**User Story:** As a developer, I want skills to execute automation scripts when needed, so that I can perform complex tasks with simple commands.

#### Acceptance Criteria

1. WHEN a skill defines npm scripts in its SKILL.yaml, THE system SHALL make those scripts available for execution
2. WHEN I request a skill capability, THE system SHALL display clickable action buttons in the chat for relevant automation scripts
3. WHEN I click a script action button, THE system SHALL show a confirmation dialog with script details before execution
4. WHEN a script is executing, THE system SHALL display a progress indicator with real-time output in a collapsible panel
5. WHEN a script completes successfully, THE system SHALL show a success notification with a summary of results
6. WHEN a script fails, THE system SHALL display an error notification with the error message, stack trace, and suggested fixes
7. WHEN a user cancels a running script, THE system SHALL terminate the process and offer rollback options if applicable
8. WHEN a script modifies files, THE system SHALL show a diff view of changes before applying them

### Requirement 5: Skill Documentation and Help

**User Story:** As a developer, I want to easily discover what skills are available and how to use them, so that I can leverage the full power of the system.

#### Acceptance Criteria

1. WHEN I ask "what skills are available", THE system SHALL display a formatted card list in the chat showing skill name, description, and version
2. WHEN I click on a skill card, THE system SHALL open a side panel with the full README.md rendered as markdown
3. WHEN I ask about a specific skill, THE system SHALL display an inline help panel with usage examples, parameters, and quick actions
4. WHEN I use a skill incorrectly, THE system SHALL show an error message with the correct usage pattern and a "Try this instead" button
5. WHEN a skill has examples, THE system SHALL display interactive code snippets that can be copied or executed directly
6. WHEN viewing skill documentation, THE system SHALL provide a search function to find specific information within the docs

### Requirement 6: Skill Creation and Management

**User Story:** As a developer, I want to create new skills easily, so that I can extend Kiro's capabilities for my specific needs.

#### Acceptance Criteria

1. WHEN I request to create a new skill, THE system SHALL open an interactive wizard dialog with step-by-step form fields
2. WHEN in the skill creation wizard, THE system SHALL ask for: skill name, description, trigger keywords, dependencies, and capabilities
3. WHEN I complete the wizard, THE system SHALL generate the required files (SKILL.md, SKILL.yaml, README.md) with proper templates
4. WHEN a skill is created, THE system SHALL validate the skill structure and display validation results in a checklist format
5. WHEN validation fails, THE system SHALL highlight the specific issues with inline error messages and fix suggestions
6. WHEN I update a skill file, THE system SHALL detect the change and show a "Reload Skill" button in the notification bar
7. WHEN I click "Reload Skill", THE system SHALL reload the skill configuration and confirm successful reload with a toast notification

### Requirement 7: Skill Composition and Chaining

**User Story:** As a developer, I want to combine multiple skills in a single workflow, so that I can solve complex problems efficiently.

#### Acceptance Criteria

1. WHEN I request a task that requires multiple skills, THE system SHALL display a workflow diagram showing the skill execution order
2. WHEN skills have dependencies, THE system SHALL execute them in the correct order and show progress for each step
3. WHEN one skill's output is needed by another, THE system SHALL pass the data automatically and display the data flow in the UI
4. WHEN a skill chain is executing, THE system SHALL show a progress bar with current step, completed steps, and remaining steps
5. WHEN a skill chain fails, THE system SHALL highlight the failed step in red and provide detailed error information
6. WHEN a skill chain fails, THE system SHALL offer options to: retry from failed step, skip failed step, or abort entire chain
7. WHEN I choose to retry from failed step, THE system SHALL preserve all previous step outputs and resume from the failure point

### Requirement 8: Skill Performance and Caching

**User Story:** As a developer, I want skills to load quickly and efficiently, so that I don't experience delays in my workflow.

#### Acceptance Criteria

1. WHEN a skill is first loaded, THE system SHALL cache the skill's PROMPT.md content
2. WHEN a skill is used repeatedly, THE system SHALL reuse the cached content
3. WHEN a skill file is modified, THE system SHALL invalidate the cache and reload
4. WHEN multiple skills are active, THE system SHALL optimize context size to stay within token limits

### Requirement 9: Skill Versioning and Updates

**User Story:** As a developer, I want to track skill versions and update them safely, so that I can maintain stable workflows while adopting improvements.

#### Acceptance Criteria

1. WHEN a skill has a version in SKILL.yaml, THE system SHALL track and display the version
2. WHEN a skill is updated, THE system SHALL detect version changes
3. WHEN breaking changes occur, THE system SHALL warn before applying updates
4. WHEN multiple versions exist, THE system SHALL allow version selection

### Requirement 10: Skill Analytics and Feedback

**User Story:** As a developer, I want to see how skills are performing, so that I can improve them over time.

#### Acceptance Criteria

1. WHEN a skill is used, THE system SHALL log usage statistics
2. WHEN a skill produces results, THE system SHALL track success/failure rates
3. WHEN I request skill analytics, THE system SHALL show usage patterns and performance metrics
4. WHEN a skill consistently fails, THE system SHALL suggest improvements or alternatives

### Requirement 11: Error Handling and Recovery

**User Story:** As a developer, I want clear error messages and recovery options when things go wrong, so that I can quickly resolve issues and continue working.

#### Acceptance Criteria

1. WHEN the skills/ directory contains an invalid skill folder, THE system SHALL log a warning with the folder name and validation errors
2. WHEN skill validation fails, THE system SHALL display a notification with the specific issues and a "Fix Skill" button
3. WHEN I click "Fix Skill", THE system SHALL open the problematic file with inline error annotations
4. WHEN a script execution is interrupted by the user, THE system SHALL terminate the process gracefully and clean up temporary files
5. WHEN a script modifies files before being cancelled, THE system SHALL offer a "Rollback Changes" option with a diff preview
6. WHEN a skill chain fails mid-execution, THE system SHALL save the execution state and allow resuming from the last successful step
7. WHEN an error occurs, THE system SHALL provide contextual help links to relevant documentation or troubleshooting guides
8. **WHEN circular dependencies are detected, THE system SHALL display a clear error message with the dependency chain and suggest removing one dependency to break the cycle**
9. **WHEN a skill has circular dependencies, THE system SHALL still allow activation but skip loading dependent skills to prevent infinite loops**

### Requirement 12: Security and Sandboxing

**User Story:** As a developer, I want to safely execute skill scripts without risking my system security, so that I can use community skills with confidence.

#### Acceptance Criteria

1. WHEN a skill script is about to execute, THE system SHALL display the script permissions and required access in a security dialog
2. WHEN a script requests file system access, THE system SHALL limit access to the project directory only
3. WHEN a script attempts to access network resources, THE system SHALL prompt the user for approval with the target URL
4. WHEN a script tries to execute system commands, THE system SHALL show a warning and require explicit user confirmation
5. WHEN a skill is from an untrusted source, THE system SHALL display a security warning badge and require additional confirmation
6. WHEN executing scripts, THE system SHALL run them in a sandboxed environment with limited permissions
7. WHEN a script violates security policies, THE system SHALL terminate it immediately and log the violation

### Requirement 13: Performance and Scalability

**User Story:** As a developer, I want the skill system to remain fast and responsive even with many skills installed, so that my workflow is not interrupted.

#### Acceptance Criteria

1. WHEN the system starts, THE skill registry SHALL load within 2 seconds even with 100+ skills
2. WHEN searching for skills, THE system SHALL return results within 200ms using indexed search
3. WHEN a skill is activated, THE system SHALL load its context within 500ms
4. WHEN multiple skills are active, THE system SHALL optimize context size to stay within 150K tokens
5. WHEN context size exceeds limits, THE system SHALL intelligently truncate less relevant skill content and notify the user
6. WHEN skill metadata is cached, THE system SHALL invalidate cache only when files are modified
7. WHEN listing skills, THE system SHALL use virtual scrolling to handle 500+ skills without performance degradation

### Requirement 14: Skill Marketplace and Discovery

**User Story:** As a developer, I want to discover and install community skills easily, so that I can benefit from others' work.

#### Acceptance Criteria

1. WHEN I open the skill marketplace, THE system SHALL display featured skills, popular skills, and recently updated skills
2. WHEN browsing skills, THE system SHALL show skill ratings, download counts, and user reviews
3. WHEN I select a skill, THE system SHALL display detailed information including screenshots, examples, and compatibility
4. WHEN I install a skill, THE system SHALL download it to the skills/ directory and register it automatically
5. WHEN a skill has updates available, THE system SHALL show an update notification with changelog
6. WHEN I update a skill, THE system SHALL backup the current version before applying updates
7. WHEN a skill installation fails, THE system SHALL provide detailed error logs and rollback to the previous state
