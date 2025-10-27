# Separation of Concerns

**Learned From**: Task 3 - Combat System Implementation  
**Date**: 2025-10-24  
**Quality Impact**: S (Excellent)

---

## 🎯 Principle

Always separate business logic from presentation layer

---

## ✅ Benefits

1. **Easier Testing**: Business logic can be tested independently without UI
2. **Better Maintainability**: Changes in one layer don't affect the other
3. **Improved Reusability**: Business logic can be used across different UIs
4. **Clearer Architecture**: Each layer has a clear responsibility

---

## 📐 Application

### Directory Structure
```
src/
├── core/              # Business logic (pure TypeScript)
│   ├── combat/
│   ├── wave/
│   └── models/
├── presentation/      # UI/Rendering (framework-specific)
│   ├── scenes/
│   ├── components/
│   └── entities/
└── services/          # External integrations
    ├── bridge/
    └── persistence/
```

### Rules
```
✅ DO:
- Keep business logic in /core (no framework imports)
- Keep UI code in /presentation (framework-specific)
- Keep external APIs in /services
- Pass plain objects between layers

❌ DON'T:
- Import Phaser/React/Vue in /core
- Put game rules in UI components
- Access DOM/Canvas from business logic
- Mix layers in same file
```

---

## 💡 Example

### ✅ GOOD: Separated Concerns

```typescript
// core/combat/CombatEngine.ts
// Pure business logic, no Phaser
export class CombatEngine {
  calculateDamage(attacker: Unit, target: Enemy): number {
    // Pure calculation
    return attacker.attack * (1 - target.resistance);
  }
}

// presentation/entities/UnitSprite.ts
// Phaser-specific rendering
import Phaser from 'phaser';
import { CombatEngine } from '../../core/combat/CombatEngine';

export class UnitSprite extends Phaser.Physics.Arcade.Sprite {
  private combatEngine: CombatEngine;
  
  attack(target: Enemy): void {
    // Use business logic
    const damage = this.combatEngine.calculateDamage(this.unitData, target);
    // Apply visual effects
    this.playAttackAnimation();
  }
}
```

### ❌ BAD: Mixed Concerns

```typescript
// CombatEngine.ts - Mixed with Phaser
import Phaser from 'phaser';

export class CombatEngine extends Phaser.Scene {
  calculateDamage(attacker: Phaser.Physics.Arcade.Sprite): number {
    // Tightly coupled to Phaser
    return attacker.getData('attack') * (1 - attacker.getData('resistance'));
  }
}
```

---

## 🧪 Testing Impact

### With Separation
```typescript
// Easy to test - no mocking needed
describe('CombatEngine', () => {
  it('calculates damage correctly', () => {
    const engine = new CombatEngine();
    const attacker = { attack: 100 };
    const target = { resistance: 0.5 };
    
    expect(engine.calculateDamage(attacker, target)).toBe(50);
  });
});
```

### Without Separation
```typescript
// Hard to test - need to mock Phaser
describe('CombatEngine', () => {
  it('calculates damage correctly', () => {
    // Need to mock entire Phaser.Scene
    const mockScene = createMockPhaserScene();
    const engine = new CombatEngine(mockScene);
    // Complex setup...
  });
});
```

---

## 📊 Quality Metrics

**Good Signs** ✅:
- /core has 0 framework imports
- Business logic tests run without UI
- Can swap UI frameworks easily
- Clear layer boundaries

**Warning Signs** ⚠️:
- Framework imports in /core
- Tests require UI setup
- Business logic in UI components

**Red Flags** 🚩:
- No separation at all
- Everything in one file/folder
- Can't test without running UI

---

## 🔗 Related Patterns

- **Business Logic First**: Implement core before presentation
- **Interface-Driven Design**: Define contracts between layers
- **Event-Driven Architecture**: Decouple layers with events

---

## 📚 Real-World Example

**Task 3 - Combat System**:
- ✅ CombatEngine in /core (pure TypeScript)
- ✅ UnitSprite in /presentation (Phaser-specific)
- ✅ 0 TypeScript errors
- ✅ Easy to test business logic
- ✅ Quality Score: S

---

**Last Updated**: 2025-10-24
