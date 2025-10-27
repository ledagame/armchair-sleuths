# ActionButton Component

## Overview

The `ActionButton` component is a clickable button designed for executing skill automation scripts. It displays the script name and description with clear visual feedback, making it easy for users to understand what action will be performed.

## Requirements

- **Requirement 4.2**: When I request a skill capability, THE system SHALL display clickable action buttons in the chat for relevant automation scripts

## Features

- ✅ Displays script name in monospace font for clarity
- ✅ Shows descriptive text explaining what the script does
- ✅ Provides visual feedback during execution (loading state)
- ✅ Supports multiple visual variants (primary, secondary, danger)
- ✅ Fully accessible with proper ARIA attributes
- ✅ Responsive design that works on all screen sizes
- ✅ Disabled state for unavailable actions
- ✅ Custom icon support

## Usage

### Basic Example

```tsx
import { ActionButton } from '.kiro/skills-system/ui';

function MyComponent() {
  const handleExecute = () => {
    console.log('Executing script...');
  };

  return (
    <ActionButton
      scriptName="suspect:test"
      description="Test suspect responses"
      onClick={handleExecute}
      icon="🧪"
    />
  );
}
```

### With Execution State

```tsx
import { ActionButton } from '.kiro/skills-system/ui';
import { useState } from 'react';

function MyComponent() {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await executeScript('suspect:test');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <ActionButton
      scriptName="suspect:test"
      description="Test suspect responses"
      onClick={handleExecute}
      isExecuting={isExecuting}
      icon="🧪"
    />
  );
}
```

### Different Variants

```tsx
// Primary (default) - for main actions
<ActionButton
  scriptName="suspect:test"
  description="Test suspect responses"
  onClick={handleTest}
  variant="primary"
/>

// Secondary - for less important actions
<ActionButton
  scriptName="suspect:add-archetype"
  description="Add new archetype"
  onClick={handleAdd}
  variant="secondary"
/>

// Danger - for destructive actions
<ActionButton
  scriptName="suspect:delete-all"
  description="Delete all archetypes"
  onClick={handleDelete}
  variant="danger"
/>
```

### Disabled State

```tsx
<ActionButton
  scriptName="suspect:test"
  description="Test suspect responses"
  onClick={handleExecute}
  disabled={!isReady}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scriptName` | `string` | *required* | Name of the script to execute (displayed in monospace) |
| `description` | `string` | *required* | Description of what the script does |
| `onClick` | `() => void` | *required* | Callback function when button is clicked |
| `icon` | `string` | `'▶'` | Icon to display (emoji or icon name) |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `isExecuting` | `boolean` | `false` | Whether the script is currently executing |
| `variant` | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | Visual style variant |

## Visual Design

```
┌─────────────────────────────────────────────────────┐
│ 🧪  suspect:test                                  → │
│     Test suspect responses with different           │
│     emotional states                                │
└─────────────────────────────────────────────────────┘
```

### Executing State

```
┌─────────────────────────────────────────────────────┐
│ ⏳  suspect:test                                     │
│     Test suspect responses with different           │
│     emotional states                                │
│     Executing...                                    │
└─────────────────────────────────────────────────────┘
```

## Accessibility

The component follows accessibility best practices:

- ✅ Proper `aria-label` describing the action
- ✅ `aria-busy` attribute during execution
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Disabled state properly communicated to screen readers

## Integration with Skills System

The ActionButton is designed to work seamlessly with the Skills System:

1. **Skill Activation**: When a skill is activated, action buttons are displayed for each available script
2. **Script Execution**: Clicking the button triggers the script execution flow
3. **Progress Tracking**: The button shows execution state while the script runs
4. **Error Handling**: If execution fails, the button returns to normal state

### Example Integration

```tsx
import { ActionButton } from '.kiro/skills-system/ui';
import { ScriptExecutor } from '.kiro/skills-system/core';

function SkillPanel({ skill }: { skill: Skill }) {
  const executor = new ScriptExecutor();
  const [executingScript, setExecutingScript] = useState<string | null>(null);

  const handleExecuteScript = async (scriptName: string) => {
    setExecutingScript(scriptName);
    try {
      await executor.execute({
        name: scriptName,
        command: skill.metadata.npmScripts[scriptName],
        args: [],
        workingDir: skill.path,
        permissions: [],
      });
    } finally {
      setExecutingScript(null);
    }
  };

  return (
    <div className="space-y-3">
      {Object.entries(skill.metadata.npmScripts || {}).map(([name, command]) => (
        <ActionButton
          key={name}
          scriptName={name}
          description={`Execute: ${command}`}
          onClick={() => handleExecuteScript(name)}
          isExecuting={executingScript === name}
        />
      ))}
    </div>
  );
}
```

## Styling

The component uses Tailwind CSS classes for styling. The color scheme adapts based on the variant:

- **Primary**: Blue theme (default for main actions)
- **Secondary**: Gray theme (for secondary actions)
- **Danger**: Red theme (for destructive actions)

All variants include:
- Hover effects
- Focus ring for keyboard navigation
- Smooth transitions
- Responsive padding and spacing

## Testing

The component includes comprehensive tests covering:

- ✅ Rendering with different props
- ✅ Click interactions
- ✅ Disabled state behavior
- ✅ Executing state behavior
- ✅ Variant styling
- ✅ Accessibility attributes

Run tests with:

```bash
npm test ActionButton.test.tsx
```

## Related Components

- **SkillActivationNotification**: Displays when a skill is activated
- **SkillSelectionDialog**: Allows selecting from multiple matching skills
- **ScriptExecutionDialog**: Shows confirmation before executing scripts
- **ProgressIndicator**: Displays detailed execution progress

## Future Enhancements

Potential improvements for future versions:

- [ ] Keyboard shortcuts for quick execution
- [ ] Tooltip showing full command
- [ ] Estimated execution time display
- [ ] Recent execution history
- [ ] Favorite/pin frequently used scripts
- [ ] Batch execution of multiple scripts

## Changelog

### Version 1.0.0 (2025-01-22)
- Initial implementation
- Support for primary, secondary, and danger variants
- Execution state with loading indicator
- Full accessibility support
- Comprehensive test coverage
