---
inclusion: fileMatch
fileMatchPattern: ['**/*.ts', '**/*.tsx']
---

# TypeScript Standards for Hitster Rewind

Apply these TypeScript conventions when working with `.ts` and `.tsx` files.

## Type Safety Requirements

### Strict Mode Configuration
- Project uses strict TypeScript configuration
- Never use `any` - use `unknown` and type guards instead
- Avoid type assertions (`as`) unless absolutely necessary
- Prefer type inference over explicit annotations when clear

### Type Definitions
```typescript
// ✅ Good: Explicit interface for public APIs
interface GameState {
  roomId: string;
  players: Player[];
  currentRound: number;
}

// ✅ Good: Type inference for simple cases
const playerCount = players.length;

// ❌ Bad: Unnecessary explicit typing
const playerCount: number = players.length;

// ❌ Bad: Using any
function processData(data: any) { }

// ✅ Good: Using unknown with type guards
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Type-safe processing
  }
}
```

## Advanced Type Patterns

### Discriminated Unions
Use for state management and API responses:
```typescript
type GameStatus = 
  | { status: 'waiting'; playerCount: number }
  | { status: 'playing'; currentRound: number }
  | { status: 'finished'; winner: string };

function handleStatus(game: GameStatus) {
  switch (game.status) {
    case 'waiting':
      return `${game.playerCount} players waiting`;
    case 'playing':
      return `Round ${game.currentRound}`;
    case 'finished':
      return `Winner: ${game.winner}`;
  }
}
```

### Generic Constraints
```typescript
// ✅ Good: Constrained generics
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// ✅ Good: Generic with multiple constraints
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
}
```

### Utility Types
Leverage built-in utilities:
```typescript
// Extract subset of properties
type PlayerPublic = Pick<Player, 'id' | 'name' | 'avatar'>;

// Make properties optional
type PartialPlayer = Partial<Player>;

// Make properties required
type RequiredConfig = Required<Config>;

// Exclude properties
type PlayerWithoutPassword = Omit<Player, 'password'>;

// Extract return type
type GameResult = ReturnType<typeof calculateScore>;
```

## Zod Integration

Use Zod for runtime validation with TypeScript inference:
```typescript
import { z } from 'zod';

// Define schema
const PlayerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  score: z.number().int().min(0),
});

// Infer TypeScript type
type Player = z.infer<typeof PlayerSchema>;

// Validate at runtime
function validatePlayer(data: unknown): Player {
  return PlayerSchema.parse(data);
}
```

## React + TypeScript

### Component Props
```typescript
// ✅ Good: Explicit props interface
interface PlayerCardProps {
  player: Player;
  onSelect?: (playerId: string) => void;
  className?: string;
}

export function PlayerCard({ player, onSelect, className }: PlayerCardProps) {
  // Implementation
}

// ✅ Good: Children typing
interface LayoutProps {
  children: React.ReactNode;
  title: string;
}
```

### Hooks Typing
```typescript
// State with explicit type
const [players, setPlayers] = useState<Player[]>([]);

// Ref with element type
const inputRef = useRef<HTMLInputElement>(null);

// Custom hook with return type inference
function useGameState(roomId: string) {
  const [state, setState] = useState<GameState | null>(null);
  // TypeScript infers return type
  return { state, setState };
}
```

## API & Backend Types

### Hono Route Typing
```typescript
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();

const CreateRoomSchema = z.object({
  name: z.string().min(1),
  maxPlayers: z.number().int().min(2).max(8),
});

app.post('/rooms', zValidator('json', CreateRoomSchema), async (c) => {
  const body = c.req.valid('json'); // Fully typed
  // Implementation
});
```

### Supabase Types
```typescript
// Generate types from database
import { Database } from '@/types/supabase';

type Room = Database['public']['Tables']['rooms']['Row'];
type RoomInsert = Database['public']['Tables']['rooms']['Insert'];
type RoomUpdate = Database['public']['Tables']['rooms']['Update'];
```

## Error Handling

### Type-Safe Errors
```typescript
// Define error types
class GameError extends Error {
  constructor(
    message: string,
    public code: 'ROOM_FULL' | 'INVALID_MOVE' | 'NOT_FOUND'
  ) {
    super(message);
    this.name = 'GameError';
  }
}

// Type-safe error handling
function handleError(error: unknown): string {
  if (error instanceof GameError) {
    return `Game error: ${error.message} (${error.code})`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred';
}
```

## Type Organization

### File Structure
```typescript
// types.ts - Feature-specific types
export interface Player {
  id: string;
  name: string;
  score: number;
}

export type PlayerStatus = 'active' | 'inactive' | 'disconnected';

// Avoid default exports for types
// Use named exports for better refactoring
```

### Shared Types
Place shared types in `src/types/`:
- `src/types/supabase.ts` - Database types
- `src/types/api.ts` - API request/response types
- `src/types/common.ts` - Common domain types

## Performance Considerations

### Type Complexity
- Avoid deeply nested conditional types (>3 levels)
- Use type aliases for complex unions
- Prefer interfaces over type aliases for objects (better error messages)

### Build Optimization
- Use `skipLibCheck: true` in tsconfig.json for faster builds
- Leverage incremental compilation
- Use project references for large codebases

## Common Patterns

### Branded Types
```typescript
// Prevent mixing similar primitive types
type RoomId = string & { readonly brand: unique symbol };
type PlayerId = string & { readonly brand: unique symbol };

function createRoomId(id: string): RoomId {
  return id as RoomId;
}
```

### Const Assertions
```typescript
// Narrow types with const assertion
const GAME_MODES = ['classic', 'speed', 'team'] as const;
type GameMode = typeof GAME_MODES[number]; // 'classic' | 'speed' | 'team'
```

## Quality Checklist

Before completing TypeScript work:
- ✅ No `any` types (use `unknown` with guards)
- ✅ Zod schemas for runtime validation
- ✅ Discriminated unions for complex state
- ✅ Generic constraints where appropriate
- ✅ Proper error type handling
- ✅ Type inference leveraged (not over-annotated)
- ✅ React component props explicitly typed
- ✅ API routes validated with Zod
- ✅ No type assertions without justification
- ✅ Shared types properly organized