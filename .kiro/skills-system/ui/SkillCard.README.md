# SkillCard Component

## Overview

The `SkillCard` component displays a skill with its name, version, description, status badge, and action buttons. It provides a compact, scannable format for viewing skill information in lists and grids.

## Requirements

- **Requirement 5.1**: WHEN I ask "what skills are available", THE system SHALL display a formatted card list in the chat showing skill name, description, and version

## Features

- ✅ Displays skill name, version, and description
- ✅ Status badge with color coding (active/inactive/error)
- ✅ Action buttons (Activate, Deactivate, View Details)
- ✅ Compact mode for dense layouts
- ✅ Clickable card for quick navigation
- ✅ Author attribution
- ✅ More options menu
- ✅ Fully accessible with proper ARIA attributes
- ✅ Responsive design
- ✅ Keyboard navigation support

## Usage

### Basic Example

```tsx
import { SkillCard } from '.kiro/skills-system/ui';

function SkillList({ skills }: { skills: Skill[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {skills.map((skill) => (
        <SkillCard
          key={skill.metadata.name}
          skill={skill}
          onActivate={() => activateSkill(skill)}
          onViewDetails={() => showDetails(skill)}
        />
      ))}
    </div>
  );
}
```

### With All Callbacks

```tsx
<SkillCard
  skill={skill}
  onClick={() => navigateToSkill(skill)}
  onActivate={() => activateSkill(skill)}
  onViewDetails={() => showDetails(skill)}
  onDeactivate={() => deactivateSkill(skill)}
/>
```

### Compact Mode

```tsx
<SkillCard
  skill={skill}
  compact
  onActivate={() => activateSkill(skill)}
/>
```

### Active Skill

```tsx
<SkillCard
  skill={activeSkill}
  onViewDetails={() => showDetails(activeSkill)}
  onDeactivate={() => deactivateSkill(activeSkill)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `skill` | `Skill` | *required* | The skill object to display |
| `onClick` | `() => void` | `undefined` | Callback when the card itself is clicked |
| `onActivate` | `() => void` | `undefined` | Callback when "Activate" button is clicked |
| `onViewDetails` | `() => void` | `undefined` | Callback when "View Details" button is clicked |
| `onDeactivate` | `() => void` | `undefined` | Callback when "Deactivate" button is clicked |
| `compact` | `boolean` | `false` | Whether to use compact mode (hides description and author) |

## Visual Design

### Default Card

```
┌─────────────────────────────────────────────────────┐
│ 🎭  Suspect AI Prompter              ✅ Active      │
│     v2.0.0                                          │
│                                                     │
│ Optimize AI suspect conversation prompts and       │
│ test emotional states                              │
│                                                     │
│ by Mystery Game Team                               │
│ ─────────────────────────────────────────────────  │
│ [Details] [Deactivate] [⋮]                         │
└─────────────────────────────────────────────────────┘
```

### Compact Card

```
┌─────────────────────────────────────────────────────┐
│ 🎭  Suspect AI Prompter              ⏸️ Inactive   │
│     v2.0.0                                          │
│ ─────────────────────────────────────────────────  │
│ [Activate] [Details] [⋮]                           │
└─────────────────────────────────────────────────────┘
```

## Status Badge

The status badge displays the current state of the skill with appropriate color coding:

| Status | Color | Icon | Description |
|--------|-------|------|-------------|
| `active` | Green | ✅ | Skill is currently active |
| `inactive` | Gray | ⏸️ | Skill is available but not active |
| `error` | Red | ❌ | Skill has an error and cannot be activated |

## Action Buttons

### Inactive Skill

- **Activate**: Activates the skill (disabled if status is 'error')
- **Details**: Opens the skill details panel
- **⋮**: More options menu

### Active Skill

- **Details**: Opens the skill details panel
- **Deactivate**: Deactivates the skill
- **⋮**: More options menu

## Behavior

### Card Click

When `onClick` is provided, the entire card becomes clickable:
- Hover effect with shadow and border color change
- Keyboard navigation support (Enter and Space keys)
- Does not trigger when action buttons are clicked

### Button Click

Action buttons stop event propagation to prevent triggering the card's `onClick`:
```tsx
onClick={(e) => {
  e.stopPropagation();
  onActivate();
}}
```

### Error State

When a skill has `status: 'error'`:
- Card border becomes red
- Activate button is disabled
- Error badge is displayed

## Accessibility

The component follows accessibility best practices:

- ✅ Proper `aria-label` for all buttons
- ✅ Status badge has descriptive label
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Disabled state properly communicated
- ✅ Semantic HTML structure

## Integration with Skills System

The SkillCard is designed to work seamlessly with the Skills System:

1. **Skill Discovery**: Cards are displayed when listing available skills
2. **Skill Activation**: Clicking "Activate" triggers the activation flow
3. **Skill Details**: Clicking "Details" opens the SkillPanel component
4. **Status Updates**: Card automatically reflects skill status changes

### Example Integration

```tsx
import { SkillCard } from '.kiro/skills-system/ui';
import { SkillActivator } from '.kiro/skills-system/core';

function SkillBrowser() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const activator = new SkillActivator();

  const handleActivate = async (skill: Skill) => {
    try {
      await activator.activateSkill(skill.metadata.name);
      // Update skill status
      setSkills(skills.map(s => 
        s.metadata.name === skill.metadata.name 
          ? { ...s, status: 'active' }
          : s
      ));
    } catch (error) {
      console.error('Failed to activate skill:', error);
    }
  };

  const handleDeactivate = async (skill: Skill) => {
    try {
      await activator.deactivateSkill(skill.metadata.name);
      // Update skill status
      setSkills(skills.map(s => 
        s.metadata.name === skill.metadata.name 
          ? { ...s, status: 'inactive' }
          : s
      ));
    } catch (error) {
      console.error('Failed to deactivate skill:', error);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {skills.map((skill) => (
        <SkillCard
          key={skill.metadata.name}
          skill={skill}
          onActivate={() => handleActivate(skill)}
          onDeactivate={() => handleDeactivate(skill)}
          onViewDetails={() => openSkillPanel(skill)}
        />
      ))}
    </div>
  );
}
```

## Styling

The component uses Tailwind CSS classes for styling:

- **Card**: White background with border and shadow
- **Hover**: Enhanced shadow and blue border
- **Status Badge**: Color-coded background and border
- **Buttons**: Consistent styling with hover and focus states
- **Compact Mode**: Reduced padding and hidden elements

## Layout Patterns

### Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {skills.map(skill => (
    <SkillCard key={skill.metadata.name} skill={skill} />
  ))}
</div>
```

### List Layout

```tsx
<div className="space-y-3">
  {skills.map(skill => (
    <SkillCard key={skill.metadata.name} skill={skill} />
  ))}
</div>
```

### Compact Grid

```tsx
<div className="grid grid-cols-4 gap-2">
  {skills.map(skill => (
    <SkillCard key={skill.metadata.name} skill={skill} compact />
  ))}
</div>
```

## Testing

The component includes comprehensive tests covering:

- ✅ Rendering with different props
- ✅ Status badge display
- ✅ Action buttons for different states
- ✅ Card click interactions
- ✅ Keyboard navigation
- ✅ Compact mode
- ✅ Accessibility attributes

Run tests with:

```bash
npm test SkillCard.test.tsx
```

## Related Components

- **ActionButton**: Used for script execution buttons
- **SkillPanel**: Detailed view opened from "Details" button
- **SkillListView**: Container component that displays multiple SkillCards
- **SkillActivationNotification**: Notification shown when skill is activated

## Future Enhancements

Potential improvements for future versions:

- [ ] Drag and drop for reordering
- [ ] Favorite/pin functionality
- [ ] Tags and categories display
- [ ] Last used timestamp
- [ ] Usage statistics badge
- [ ] Skill dependencies visualization
- [ ] Quick actions dropdown menu
- [ ] Skill preview on hover

## Changelog

### Version 1.0.0 (2025-01-22)
- Initial implementation
- Support for active, inactive, and error states
- Compact mode
- Full accessibility support
- Comprehensive test coverage
- Storybook stories
