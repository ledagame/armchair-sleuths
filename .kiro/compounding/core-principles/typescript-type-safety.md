# TypeScript Type Safety

**Learned From**: Task 3 - Combat System Implementation  
**Date**: 2025-10-24  
**Quality Impact**: S (Excellent) - 0 Type Errors

---

## 🎯 Principle

Use TypeScript's type system to catch errors at compile time, not runtime

---

## ✅ Benefits

1. **Catch Bugs Early**: Find errors before code runs
2. **Better IDE Support**: Autocomplete, refactoring, navigation
3. **Self-Documenting**: Types serve as inline documentation
4. **Safer Refactoring**: TypeScript catches breaking changes

---

## 📐 Application

### Rules
```
✅ DO:
- Define interfaces for all data models
- Use strict TypeScript settings
- Avoid 'any' type (use 'unknown' if needed)
- Use union types for enums
- Use generics for reusable code
- Add JSDoc comments for complex types

❌ DON'T:
- Use 'any' to bypass type checking
- Use type assertions without validation
- Ignore TypeScript errors
- Use loose typing (implicit any)
- Cast types without checking
```

---

## 💡 Examples

### ✅ GOOD: Strong Typing

```typescript
// Define clear interfaces
interface Unit {
  id: string;
  attack: number;
  speed: number;
  position: { x: number; y: number };
}

interface Enemy {
  id: string;
  hp: number;
  maxHP: number;
  resistance: number;
}

// Type-safe function
function calculateDamage(attacker: Unit, target: Enemy): number {
  // TypeScript knows all properties
  return attacker.attack * (1 - target.resistance);
}

// Usage - TypeScript catches typos
const unit: Unit = {
  id: '1',
  attack: 100,
  speed: 1.5,
  position: { x: 0, y: 0 }
};

calculateDamage(unit, enemy); // ✅ Type-safe
```

### ❌ BAD: Weak Typing

```typescript
// No type safety
function calculateDamage(attacker: any, target: any): any {
  // Typos won't be caught!
  return attacker.atack * (1 - target.resistence); // Typos!
}

// Usage - No error checking
const unit = {
  id: '1',
  atk: 100, // Wrong property name
  spd: 1.5
};

calculateDamage(unit, enemy); // ❌ Runtime error!
```

---

## 🔧 Advanced Patterns

### Union Types for Enums

```typescript
// ✅ GOOD: Union type
type Rarity = 
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Epic'
  | 'Legendary';

function getRarityColor(rarity: Rarity): string {
  // TypeScript ensures all cases handled
  switch (rarity) {
    case 'Common': return '#ffffff';
    case 'Uncommon': return '#00ff00';
    case 'Rare': return '#0000ff';
    case 'Epic': return '#ff00ff';
    case 'Legendary': return '#ffd700';
  }
}

// ❌ BAD: String type
function getRarityColor(rarity: string): string {
  // No type safety, typos possible
  if (rarity === 'Comon') return '#ffffff'; // Typo!
}
```

### Generics for Reusability

```typescript
// ✅ GOOD: Generic type
class ObjectPool<T> {
  private pool: T[] = [];
  
  get(): T | null {
    return this.pool.pop() || null;
  }
  
  release(item: T): void {
    this.pool.push(item);
  }
}

// Type-safe usage
const projectilePool = new ObjectPool<Projectile>();
const projectile = projectilePool.get(); // Type: Projectile | null
```

### Type Guards

```typescript
// ✅ GOOD: Type guard for unknown
function processData(data: unknown): void {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    // TypeScript knows data has 'name' property
    console.log((data as { name: string }).name);
  }
}

// ❌ BAD: Using any
function processData(data: any): void {
  console.log(data.name); // No type safety
}
```

---

## 📊 Quality Metrics

**Good Signs** ✅:
- TypeScript diagnostics: 0 errors
- All interfaces defined
- No 'any' types (or very few with justification)
- Strict mode enabled
- Generic types used appropriately

**Warning Signs** ⚠️:
- TypeScript errors being ignored
- Frequent use of 'any'
- Type assertions without validation
- Loose tsconfig settings

**Red Flags** 🚩:
- Disabling TypeScript checks
- Using @ts-ignore frequently
- No interfaces defined
- Everything typed as 'any'

---

## ⚙️ TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,                    // Enable all strict checks
    "noImplicitAny": true,            // Error on implicit any
    "strictNullChecks": true,         // Null safety
    "strictFunctionTypes": true,      // Function type safety
    "noUnusedLocals": true,           // Catch unused variables
    "noUnusedParameters": true,       // Catch unused parameters
    "noImplicitReturns": true,        // All code paths return
    "noFallthroughCasesInSwitch": true // Switch case safety
  }
}
```

---

## 🧪 Testing Impact

### With Strong Types
```typescript
// Test is type-safe
describe('CombatEngine', () => {
  it('calculates damage', () => {
    const attacker: Unit = {
      id: '1',
      attack: 100,
      speed: 1.0,
      position: { x: 0, y: 0 }
    };
    
    const target: Enemy = {
      id: '2',
      hp: 100,
      maxHP: 100,
      resistance: 0.5
    };
    
    // TypeScript catches errors in test
    expect(calculateDamage(attacker, target)).toBe(50);
  });
});
```

---

## 🔗 Related Patterns

- **Interface-Driven Design**: Define interfaces first
- **Separation of Concerns**: Type interfaces for each layer
- **Business Logic First**: Type business logic before UI

---

## 📚 Real-World Example

**Task 3 - Combat System**:
- ✅ All models have interfaces (Unit, Enemy, Projectile)
- ✅ 0 TypeScript errors across all files
- ✅ No 'any' types used
- ✅ Strict mode enabled
- ✅ Quality Score: S

**Files**:
- `core/models/Unit.model.ts`: Complete Unit interface
- `core/models/Enemy.model.ts`: Complete Enemy interface
- `core/combat/CombatEngine.ts`: Type-safe combat logic

---

**Last Updated**: 2025-10-24
