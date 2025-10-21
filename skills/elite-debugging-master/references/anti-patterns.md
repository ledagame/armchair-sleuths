# Common Anti-Patterns in Code

This reference documents anti-patterns to watch for during debugging and code review. Recognizing these patterns helps identify root causes faster.

## Type System Anti-Patterns

### 1. Client Importing Server Types

**Pattern**:
```typescript
// ❌ Client code
import type { ImageStatus } from '../../server/types/imageTypes';
```

**Problem**: Violates architectural boundaries (Client ← Shared → Server)

**Detection**:
- Grep for: `from.*server` in client files
- Look for: relative paths going up then into server/

**Root Cause**: Type placed in wrong layer

**Fix**:
```typescript
// ✅ Move type to shared/
import type { ImageStatus } from '../../shared/types/Image';
```

**Prevention**: ESLint rule blocking client → server imports

---

### 2. Duplicate Type Definitions

**Pattern**:
```typescript
// File A
export interface Location { id: string; name: string; }

// File B
export interface Location { id: string; name: string; }
```

**Problem**: Multiple sources of truth, inconsistency risk

**Detection**:
- Grep for: `export.*interface Location`
- Look for: Same type name in multiple files

**Root Cause**: Lack of type namespace management

**Fix**: Consolidate into single source
```typescript
// shared/types/Location.ts (single source)
export interface Location { id: string; name: string; }
```

**Prevention**: Type index files with re-exports

---

### 3. Missing Type Exports

**Pattern**:
```typescript
// types/MyTypes.ts
export interface Foo { /* ... */ }
interface Bar { /* ... */ }  // Not exported!

// index.ts - missing re-export
export * from './SomeTypes';
// MyTypes.ts not exported!
```

**Problem**: Types exist but not accessible

**Detection**:
- Check index.ts for missing re-exports
- Look for interfaces without `export`

**Fix**:
```typescript
// types/MyTypes.ts
export interface Bar { /* ... */ }

// index.ts
export * from './MyTypes';
```

---

### 4. Large Single-File Type Definitions

**Pattern**:
```typescript
// Evidence.ts (395 lines!)
export interface EvidenceItem { /* ... */ }
export interface ActionPoints { /* ... */ }  // Wrong place!
export interface PlayerState { /* ... */ }   // Wrong place!
```

**Problem**: Responsibility bloat, hard to find types

**Detection**: File size > 300 lines

**Root Cause**: Adding types to "closest" file instead of logical location

**Fix**: Split by responsibility
```
Evidence.ts      → Evidence types only
ActionPoints.ts  → AP types
Player.ts        → Player state types
```

---

## Service Layer Anti-Patterns

### 5. God Services

**Pattern**:
```typescript
class UserService {
  createUser() { /* ... */ }
  sendEmail() { /* ... */ }      // Email responsibility
  processPayment() { /* ... */ } // Payment responsibility
  generateReport() { /* ... */ } // Reporting responsibility
}
```

**Problem**: Too many responsibilities

**Detection**:
- Service file > 500 lines
- More than 15 public methods
- Methods from different domains

**Fix**: Split by Single Responsibility Principle
```typescript
class UserService { createUser() }
class EmailService { sendEmail() }
class PaymentService { processPayment() }
class ReportService { generateReport() }
```

---

### 6. Circular Dependencies

**Pattern**:
```typescript
// ServiceA.ts
import { ServiceB } from './ServiceB';
class ServiceA { constructor(private b: ServiceB) }

// ServiceB.ts
import { ServiceA } from './ServiceA';
class ServiceB { constructor(private a: ServiceA) }
```

**Problem**: Cannot initialize, maintenance nightmare

**Detection**:
- Build warnings about circular imports
- Grep for mutual imports between files

**Fix**: Extract shared logic to third service
```typescript
// SharedService.ts
class SharedService { /* common logic */ }

// ServiceA.ts
class ServiceA { constructor(private shared: SharedService) }

// ServiceB.ts
class ServiceB { constructor(private shared: SharedService) }
```

---

### 7. Direct Storage Access

**Pattern**:
```typescript
// In a service
async getUserData(id: string) {
  const data = await redis.get(`user:${id}`);  // Direct access!
  return JSON.parse(data);
}
```

**Problem**: Bypasses repository layer, inconsistent access patterns

**Detection**: Grep for: `redis.get`, `db.query` in service files

**Fix**: Always go through repository
```typescript
// Use repository pattern
async getUserData(id: string) {
  return await this.userRepository.findById(id);
}
```

---

## Component Layer Anti-Patterns

### 8. Missing useEffect Cleanup

**Pattern**:
```typescript
useEffect(() => {
  const subscription = api.subscribe(handleUpdate);
  // ❌ No cleanup!
}, []);
```

**Problem**: Memory leaks, event listener accumulation

**Detection**:
- Grep for: `useEffect.*subscribe` without cleanup
- Look for: useEffect with subscriptions, no return

**Fix**:
```typescript
useEffect(() => {
  const subscription = api.subscribe(handleUpdate);
  return () => subscription.unsubscribe();  // ✅ Cleanup
}, []);
```

---

### 9. Prop Drilling (> 3 Levels)

**Pattern**:
```typescript
<GrandParent data={data}>
  <Parent data={data}>
    <Child data={data}>
      <GrandChild data={data} />  // Finally used here!
    </Child>
  </Parent>
</GrandParent>
```

**Problem**: Coupling, maintenance burden

**Detection**: Trace prop through > 3 component levels

**Fix**: Use Context or state management
```typescript
const DataContext = createContext();

<DataProvider value={data}>
  <GrandChild />  // Accesses via useContext
</DataProvider>
```

---

### 10. Scattered State Management

**Pattern**:
```typescript
// In ComponentA
const [user, setUser] = useState();

// In ComponentB
const [user, setUser] = useState();  // Duplicate state!

// In ComponentC
const user = useLocalStorage('user'); // Another source!
```

**Problem**: State inconsistency, synchronization issues

**Fix**: Single source of truth
```typescript
// Use global state management
const { user, setUser } = useUserStore();
```

---

## API Layer Anti-Patterns

### 11. Missing Input Validation

**Pattern**:
```typescript
router.post('/api/user', async (req, res) => {
  const user = await createUser(req.body);  // No validation!
  res.json(user);
});
```

**Problem**: Security risk, data corruption

**Fix**:
```typescript
router.post('/api/user', async (req, res) => {
  // Validate first
  if (!req.body.email || !req.body.name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const user = await createUser(req.body);
  res.json(user);
});
```

---

### 12. Inconsistent Error Responses

**Pattern**:
```typescript
// Endpoint A
res.status(400).json({ error: 'Bad request' });

// Endpoint B
res.status(400).send('Bad request');

// Endpoint C
res.status(400).json({ message: 'Bad request', code: 400 });
```

**Problem**: Client can't handle errors consistently

**Fix**: Standardize error format
```typescript
interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
}

res.status(400).json({
  error: 'BAD_REQUEST',
  message: 'Email is required'
});
```

---

### 13. Synchronous Blocking Operations

**Pattern**:
```typescript
router.get('/api/report', (req, res) => {
  const data = fs.readFileSync('large-file.csv');  // Blocks!
  const processed = processData(data);  // Blocks!
  res.json(processed);
});
```

**Problem**: Blocks event loop, server unresponsive

**Fix**: Use async operations
```typescript
router.get('/api/report', async (req, res) => {
  const data = await fs.promises.readFile('large-file.csv');
  const processed = await processDataAsync(data);
  res.json(processed);
});
```

---

## Detection Checklist

When debugging, systematically check for:

- [ ] Type boundary violations (client → server)
- [ ] Duplicate type definitions
- [ ] Missing cleanup in useEffect
- [ ] Prop drilling > 3 levels
- [ ] God services (> 500 lines)
- [ ] Direct storage access
- [ ] Missing input validation
- [ ] Inconsistent error responses
- [ ] Synchronous blocking operations
- [ ] Circular dependencies

---

## Quick Reference Table

| Anti-Pattern | Grep Pattern | File Check |
|--------------|--------------|------------|
| Client → Server import | `from.*server` in client/ | Import paths |
| Duplicate types | `export.*interface X` | Multiple matches |
| Missing cleanup | `useEffect.*subscribe` | No return statement |
| God service | N/A | File > 500 lines |
| Direct storage | `redis.get\|db.query` | Service files |
| Prop drilling | N/A | Component tree depth |

---

**Version**: 1.0.0
**Last Updated**: 2025-10-21
**Maintainer**: Elite Debugging Master
