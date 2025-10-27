# SkillPanel Component

## Overview

The `SkillPanel` component is a side panel that displays detailed information about a skill. It includes tabs for Overview (README), Scripts, and Examples, providing a comprehensive view of skill capabilities and documentation.

## Requirements

- **Requirement 5.2**: WHEN I click on a skill card, THE system SHALL open a side panel with the full README.md rendered as markdown
- **Requirement 5.3**: WHEN I ask about a specific skill, THE system SHALL display an inline help panel with usage examples, parameters, and quick actions

## Features

- ✅ Three-tab interface (Overview, Scripts, Examples)
- ✅ README content display
- ✅ Skill metadata (name, version, author, triggers, capabilities)
- ✅ Available scripts with ActionButton integration
- ✅ Usage examples display
- ✅ Close button
- ✅ Last modified date and status
- ✅ Empty states for missing content
- ✅ Fully accessible with proper ARIA attributes
- ✅ Responsive design

## Usage

### Basic Example

```tsx
import { SkillPanel } from '.kiro/skills-system/ui';

function SkillDetails({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  return (
    <SkillPanel
      skill={skill}
      onClose={onClose}
      onExecuteScript={(name, command) => {
        console.log(`Executing ${name}: ${command}`);
      }}
    />
  );
}
```

### With Script Execution

```tsx
import { SkillPanel } from '.kiro/skills-system/ui';
import { ScriptExecutor } from '.kiro/skills-system/core';

function SkillDetails() {
  const [executingScript, setExecutingScript] = useState<string | null>(null);
  const executor = new ScriptExecutor();

  const handleExecuteScript = async (name: string, command: string) => {
    setExecutingScript(name);
    try {
      await executor.execute({
        name,
        command,
        args: [],
        workingDir: skill.path,
        permissions: [],
      });
    } finally {
      setExecutingScript(null);
    }
  };

  return (
    <SkillPanel
      skill={skill}
      onClose={() => setShowPanel(false)}
      onExecuteScript={handleExecuteScript}
      executingScript={executingScript}
    />
  );
}
```

### In a Layout

```tsx
<div className="flex h-screen">
  {/* Main content */}
  <div className="flex-1">
    {/* Your main content */}
  </div>

  {/* Skill Panel */}
  {selectedSkill && (
    <div className="w-96">
      <SkillPanel
        skill={selectedSkill}
        onClose={() => setSelectedSkill(null)}
      />
    </div>
  )}
</div>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `skill` | `Skill` | *required* | The skill object to display |
| `onClose` | `() => void` | *required* | Callback when the panel is closed |
| `onExecuteScript` | `(name: string, command: string) => void` | `undefined` | Callback when a script is executed |
| `executingScript` | `string \| null` | `null` | Name of the currently executing script |

## Visual Design

```
┌─────────────────────────────────────┐
│ 🎭 Suspect AI Prompter       [✕]   │
├─────────────────────────────────────┤
│ [📖 Overview] [⚡ Scripts] [💡 Examples] │
├─────────────────────────────────────┤
│                                     │
│ Description                         │
│ Optimize AI suspect conversation    │
│ prompts and test emotional states   │
│                                     │
│ Author                              │
│ Mystery Game Team                   │
│                                     │
│ Trigger Keywords                    │
│ [improve prompt] [optimize ai]      │
│                                     │
│ Capabilities                        │
│ • prompt-improvement                │
│   Analyze and improve prompts       │
│ • emotional-testing                 │
│   Test suspect emotional states     │
│                                     │
│ README                              │
│ # Suspect AI Prompter               │
│ ...                                 │
│                                     │
├─────────────────────────────────────┤
│ Last modified: 1/20/2025            │
│ Status: active                      │
└─────────────────────────────────────┘
```

## Tabs

### Overview Tab

Displays comprehensive skill information:
- **Description**: Skill's main description
- **Author**: Skill author (if available)
- **Trigger Keywords**: Keywords that activate the skill
- **Capabilities**: List of skill capabilities with descriptions
- **README**: Full README content (pre-formatted for now)

### Scripts Tab

Lists available npm scripts:
- Uses `ActionButton` components for each script
- Shows script name and command
- Handles execution state
- Empty state when no scripts available

### Examples Tab

Shows usage examples:
- Displays examples from skill capabilities
- Pre-formatted code blocks
- Empty state when no examples available

## Behavior

### Tab Navigation

- Click tabs to switch between content
- Active tab is highlighted with blue color
- Tab state is managed internally
- Proper ARIA attributes for accessibility

### Script Execution

When a script button is clicked:
1. `onExecuteScript` callback is called with script name and command
2. Parent component handles actual execution
3. `executingScript` prop shows which script is running
4. ActionButton shows loading state

### Close Button

- Located in the top-right corner
- Calls `onClose` callback when clicked
- Hover effect for better UX

## Empty States

The component handles missing content gracefully:

### No Scripts
```
📝
No scripts available for this skill
```

### No Examples
```
💡
No examples available for this skill
```

## Accessibility

The component follows accessibility best practices:

- ✅ Proper `role="tab"` and `role="tabpanel"` attributes
- ✅ `aria-selected` for active tab
- ✅ `aria-controls` linking tabs to panels
- ✅ `aria-labelledby` for tab panels
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Semantic HTML structure

## Integration with Skills System

The SkillPanel integrates with the Skills System:

1. **Skill Details**: Opened from SkillCard "Details" button
2. **Script Execution**: Integrates with ScriptExecutor
3. **README Display**: Shows skill documentation
4. **Examples**: Provides usage guidance

### Example Integration

```tsx
import { SkillCard, SkillPanel } from '.kiro/skills-system/ui';
import { useState } from 'react';

function SkillBrowser({ skills }: { skills: Skill[] }) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  return (
    <div className="flex h-screen">
      {/* Skill List */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-3 gap-4">
          {skills.map(skill => (
            <SkillCard
              key={skill.metadata.name}
              skill={skill}
              onViewDetails={() => setSelectedSkill(skill)}
            />
          ))}
        </div>
      </div>

      {/* Skill Panel */}
      {selectedSkill && (
        <div className="w-96">
          <SkillPanel
            skill={selectedSkill}
            onClose={() => setSelectedSkill(null)}
            onExecuteScript={(name, cmd) => executeScript(name, cmd)}
          />
        </div>
      )}
    </div>
  );
}
```

## Styling

The component uses Tailwind CSS classes:

- **Panel**: White background with left border and shadow
- **Header**: Gray background with border
- **Tabs**: Blue highlight for active tab
- **Content**: Scrollable area with padding
- **Footer**: Gray background with metadata

## Testing

The component includes comprehensive tests:

- ✅ Rendering tests
- ✅ Tab navigation tests
- ✅ Close button test
- ✅ Overview tab content tests
- ✅ Scripts tab tests
- ✅ Examples tab tests
- ✅ Empty state tests
- ✅ Script execution tests
- ✅ Accessibility tests

Run tests with:

```bash
npm test SkillPanel.test.tsx
```

## Related Components

- **SkillCard**: Opens SkillPanel when "Details" is clicked
- **ActionButton**: Used for script execution buttons
- **SkillListView**: Container that manages SkillCard and SkillPanel
- **ScriptExecutionDialog**: Confirmation dialog before script execution

## Future Enhancements

Potential improvements:

- [ ] Markdown rendering for README (using marked library)
- [ ] Syntax highlighting for code examples
- [ ] Collapsible sections
- [ ] Search within README
- [ ] Copy button for examples
- [ ] Resizable panel width
- [ ] Keyboard shortcuts
- [ ] Dependencies visualization
- [ ] Version history

## Changelog

### Version 1.0.0 (2025-01-22)
- Initial implementation
- Three-tab interface
- README display (pre-formatted)
- Script execution integration
- Examples display
- Full accessibility support
- Comprehensive test coverage
