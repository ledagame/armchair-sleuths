# Armchair Sleuths - Client Implementation Documentation

## Overview

This document describes the complete production-ready frontend implementation for the Armchair Sleuths murder mystery game on Reddit Devvit.

## Architecture

### Clean Architecture Principles

The implementation follows clean architecture with clear separation of concerns:

```
src/client/
├── types/                  # Type definitions
├── hooks/                  # Custom React hooks (business logic)
├── components/            # UI components (presentation)
│   ├── case/              # Case overview components
│   ├── suspect/           # Suspect management components
│   ├── chat/              # Chat interface components
│   ├── submission/        # Answer submission components
│   └── results/           # Results and leaderboard components
└── App.tsx                # Main application router
```

### Key Design Decisions

1. **Type Safety**: All components and hooks are fully typed with TypeScript
2. **Custom Hooks**: Business logic is extracted into reusable hooks
3. **Optimistic Updates**: UI updates immediately for better UX
4. **Error Handling**: Comprehensive error states and user feedback
5. **Mobile-First**: Responsive design with Tailwind CSS
6. **Performance**: Efficient re-renders with React.memo and useCallback

## Components

### 1. App.tsx (Main Router)

**Purpose**: Orchestrates the entire game flow with screen-based routing

**Screens**:
- `loading`: Initial data fetching
- `case-overview`: Case briefing
- `investigation`: Suspect interrogation
- `submission`: 5W1H answer form
- `results`: Scoring and leaderboard

**State Management**:
- Global game state (current screen, user ID, scoring result)
- Integrates all custom hooks
- Handles navigation between screens

**Key Features**:
- User ID generation/retrieval from localStorage
- Conditional rendering based on screen state
- Navigation handlers with useCallback for performance

---

### 2. CaseOverview.tsx

**Purpose**: Displays case details and initiates investigation

**Props**:
```typescript
interface CaseOverviewProps {
  caseData: CaseData;
  onStartInvestigation: () => void;
}
```

**Features**:
- Crime scene image with gradient overlay
- Victim, weapon, and location cards
- Suspect preview cards
- Mission briefing
- Call-to-action button

**UI Enhancements**:
- Gradient backgrounds for visual hierarchy
- Color-coded information cards
- Responsive grid layout
- Atmospheric styling

---

### 3. SuspectPanel.tsx

**Purpose**: Displays all suspects with selection capability

**Props**:
```typescript
interface SuspectPanelProps {
  suspects: Suspect[];
  selectedSuspectId: string | null;
  onSelectSuspect: (suspectId: string) => void;
}
```

**Features**:
- Interactive suspect cards
- Emotional state indicators
- Suspicion level progress bars
- Visual feedback for selection
- Hover effects and animations

**Emotional States**:
- `cooperative`: Green, friendly emoji
- `nervous`: Yellow, anxious emoji
- `defensive`: Orange, defensive emoji
- `aggressive`: Red, angry emoji

---

### 4. ChatInterface.tsx

**Purpose**: AI-powered conversation with suspects

**Props**:
```typescript
interface ChatInterfaceProps {
  suspectName: string;
  suspectId: string;
  userId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  loading?: boolean;
}
```

**Features**:
- Auto-scroll to latest message
- Quick question suggestions
- Message history with timestamps
- Optimistic UI updates
- Loading indicators
- Error recovery

**UX Improvements**:
- Input cleared immediately on send
- Message restored on error
- Quick questions for novice players
- Tips for better investigation

---

### 5. SubmissionForm.tsx

**Purpose**: Structured 5W1H answer submission

**Props**:
```typescript
interface SubmissionFormProps {
  onSubmit: (answer: W4HAnswer) => Promise<void>;
  submitting: boolean;
  suspects: Array<{ id: string; name: string }>;
}
```

**Features**:
- Dropdown for suspect selection
- Text inputs for WHAT, WHERE, WHEN
- Textareas for WHY, HOW
- Client-side validation
- Real-time error feedback
- Submission confirmation

**Validation**:
- Required field checks
- Minimum length validation (5 characters)
- Clear error messages

---

### 6. ResultView.tsx

**Purpose**: Display scoring results and leaderboard

**Props**:
```typescript
interface ResultViewProps {
  result: ScoringResult;
  caseId: string;
}
```

**Features**:
- Overall score with congratulations/condolences
- Detailed 5W1H breakdown
- Individual feedback for each answer
- Case statistics
- Top 10 leaderboard
- User highlighting in leaderboard

**Visual Elements**:
- Color-coded scores (green > yellow > orange > red)
- Progress indicators
- Rank badges (medals for top 3)
- Statistics cards

## Custom Hooks

### 1. useCase.ts

**Purpose**: Fetch and manage case data

```typescript
interface UseCaseReturn {
  caseData: CaseData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

**API**: `GET /api/case/today`

**Features**:
- Automatic fetch on mount
- Loading and error states
- Manual refetch capability
- Type-safe response transformation

---

### 2. useSuspect.ts

**Purpose**: Manage suspect selection

```typescript
interface UseSuspectReturn {
  suspects: Suspect[];
  selectedSuspect: Suspect | null;
  selectSuspect: (suspectId: string) => void;
  clearSelection: () => void;
  loading: boolean;
  error: string | null;
}
```

**Features**:
- Pure client-side state management
- Suspect lookup by ID
- Selection validation
- Error handling

---

### 3. useChat.ts

**Purpose**: Manage chat conversation with suspects

```typescript
interface UseChatReturn {
  messages: ChatMessage[];
  sendMessage: (message: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  conversationCount: number;
}
```

**APIs**:
- `GET /api/conversation/:suspectId/:userId` (fetch history)
- `POST /api/chat/:suspectId` (send message)

**Features**:
- Conversation history fetching
- Optimistic message updates
- Error recovery with rollback
- Message count tracking

---

### 4. useSubmission.ts

**Purpose**: Handle answer submission and scoring

```typescript
interface UseSubmissionReturn {
  submitAnswer: (answer: W4HAnswer) => Promise<ScoringResult>;
  submitting: boolean;
  error: string | null;
}
```

**API**: `POST /api/submit`

**Features**:
- Client-side validation
- Submission state management
- Error handling
- Result transformation

## Type System

### Core Types

```typescript
// Game state
type GameScreen = 'loading' | 'case-overview' | 'investigation' | 'submission' | 'results';

// Case data
interface CaseData {
  id: string;
  date: string;
  victim: Victim;
  weapon: Weapon;
  location: Location;
  suspects: Suspect[];
  imageUrl?: string;
  generatedAt: number;
}

// Suspect data
interface Suspect {
  id: string;
  caseId: string;
  name: string;
  archetype: string;
  background: string;
  personality: string;
  emotionalState: EmotionalState;
}

// 5W1H Answer
interface W4HAnswer {
  who: string;
  what: string;
  where: string;
  when: string;
  why: string;
  how: string;
}

// Scoring result
interface ScoringResult {
  userId: string;
  caseId: string;
  totalScore: number;
  isCorrect: boolean;
  breakdown: W4HValidationResult;
  submittedAt: number;
  rank?: number;
}
```

## API Integration

### Endpoints Used

1. **GET /api/case/today**
   - Fetch today's case
   - Returns: CaseData (without solution)

2. **GET /api/suspects/:caseId**
   - Fetch suspects for a case
   - Returns: Suspect[] (without isGuilty)

3. **POST /api/chat/:suspectId**
   - Send message to suspect
   - Body: `{ userId, message }`
   - Returns: ChatResponse

4. **GET /api/conversation/:suspectId/:userId**
   - Fetch conversation history
   - Returns: ChatMessage[]

5. **POST /api/submit**
   - Submit answer
   - Body: `{ userId, caseId, answers }`
   - Returns: ScoringResult

6. **GET /api/leaderboard/:caseId**
   - Fetch leaderboard
   - Query: `?limit=10`
   - Returns: LeaderboardEntry[]

7. **GET /api/stats/:caseId**
   - Fetch case statistics
   - Returns: CaseStatistics

## Styling

### Design System

**Colors**:
- Background: `gray-950`, `gray-900`
- Primary: `blue-600`
- Success: `green-600`
- Warning: `yellow-600`
- Danger: `red-600`
- Cooperative: `green-400`
- Nervous: `yellow-400`
- Defensive: `orange-400`
- Aggressive: `red-400`

**Typography**:
- Headings: Bold, varying sizes (text-xl to text-4xl)
- Body: text-sm to text-base
- Labels: text-xs

**Spacing**:
- Consistent use of Tailwind spacing scale
- Responsive padding/margins

**Components**:
- Rounded corners: `rounded-lg`
- Shadows for elevation
- Hover states for interactivity
- Transitions for smooth animations

## Performance Optimizations

1. **React.useCallback**: All event handlers memoized
2. **Conditional Rendering**: Components only render when needed
3. **Optimistic Updates**: Immediate UI feedback
4. **Efficient State Updates**: Minimal re-renders
5. **Code Splitting**: Lazy loading potential for future
6. **Memo Usage**: Can be added for expensive components

## Error Handling

### Strategy

1. **Try-Catch Blocks**: All async operations wrapped
2. **Error States**: Displayed to users with recovery options
3. **Fallback UI**: Graceful degradation
4. **Error Logging**: Console errors for debugging
5. **User Feedback**: Clear error messages

### Error Recovery

- Retry buttons for failed operations
- Message restoration on send failure
- Reload page option for critical errors

## Accessibility

### Features

1. **Semantic HTML**: Proper element usage
2. **Keyboard Navigation**: All interactive elements accessible
3. **Focus States**: Visible focus indicators
4. **Color Contrast**: WCAG AA compliant
5. **Screen Reader**: Meaningful alt text and labels

### Future Improvements

- ARIA labels for complex interactions
- Skip navigation links
- Keyboard shortcuts
- High contrast mode

## Mobile Responsiveness

### Breakpoints

- Mobile: Default (< 768px)
- Tablet: `md:` (>= 768px)
- Desktop: Handled by md breakpoint

### Responsive Features

1. **Grid Layouts**: `grid-cols-1 md:grid-cols-2 md:grid-cols-3`
2. **Padding**: Adjusted for screen size
3. **Font Sizes**: Responsive typography
4. **Navigation**: Stacked on mobile
5. **Chat**: Full-height on mobile

## Testing Considerations

### Unit Tests

- Hook logic (useCase, useSuspect, useChat, useSubmission)
- Validation functions
- Type transformations

### Integration Tests

- Component interactions
- API integration
- Error scenarios
- State management

### E2E Tests

- Complete game flow
- User journeys
- Edge cases

## Future Enhancements

### Potential Improvements

1. **Real-time Updates**: WebSocket for live leaderboard
2. **Offline Support**: Service worker for PWA
3. **Animations**: Framer Motion for sophisticated animations
4. **Sound Effects**: Audio feedback for interactions
5. **Achievements**: Badge system for players
6. **Social Sharing**: Share results on Reddit
7. **Hint System**: Progressive hints for stuck players
8. **Case History**: View past cases and solutions
9. **Multi-language**: i18n support
10. **Dark Mode Toggle**: User preference

### Performance

1. **Virtual Scrolling**: For long leaderboards
2. **Image Optimization**: Lazy loading, WebP format
3. **Code Splitting**: Route-based splitting
4. **Caching**: Response caching with React Query
5. **Debouncing**: For chat input

## Development

### Commands

```bash
# Install dependencies
npm install

# Development
npm run dev              # Watch mode for both client and server
npm run dev:client       # Client only
npm run dev:server       # Server only

# Build
npm run build            # Production build
npm run build:client     # Client only
npm run build:server     # Server only

# Type checking
npm run type-check       # Check TypeScript types

# Deploy
npm run deploy           # Upload to Devvit
npm run launch           # Build, deploy, and publish
```

### File Structure

```
src/client/
├── App.tsx                         # Main router (262 lines)
├── types/
│   └── index.ts                    # Type definitions (183 lines)
├── hooks/
│   ├── useCase.ts                  # Case data hook (62 lines)
│   ├── useSuspect.ts               # Suspect management (42 lines)
│   ├── useChat.ts                  # Chat management (124 lines)
│   └── useSubmission.ts            # Submission handling (81 lines)
├── components/
│   ├── case/
│   │   └── CaseOverview.tsx        # Case overview (129 lines)
│   ├── suspect/
│   │   └── SuspectPanel.tsx        # Suspect panel (154 lines)
│   ├── chat/
│   │   └── ChatInterface.tsx       # Chat interface (213 lines)
│   ├── submission/
│   │   └── SubmissionForm.tsx      # Submission form (177 lines)
│   └── results/
│       └── ResultView.tsx          # Results display (217 lines)
└── main.tsx                        # Entry point

Total: ~1,644 lines of production-ready code
```

## Integration with Backend

### Data Flow

1. **Case Loading**:
   - App fetches case via useCase hook
   - CaseRepository returns case without solution
   - Suspects included in response

2. **Investigation**:
   - User selects suspect
   - useChat hook manages conversation
   - SuspectAIService generates AI responses
   - EmotionalStateManager tracks emotional changes

3. **Submission**:
   - User fills 5W1H form
   - useSubmission validates and submits
   - ScoringEngine calculates score
   - W4HValidator provides detailed feedback

4. **Results**:
   - ResultView displays score breakdown
   - Leaderboard fetched separately
   - Statistics calculated by ScoringEngine

### Security

- No sensitive data (solution) sent to client
- User IDs managed securely
- Input validation on both client and server
- No direct database access from client

## Conclusion

This implementation provides a complete, production-ready frontend for the Armchair Sleuths game with:

- ✅ Clean architecture with separation of concerns
- ✅ Type-safe TypeScript throughout
- ✅ Comprehensive error handling
- ✅ Mobile-responsive design
- ✅ Optimistic UI updates
- ✅ Performance optimizations
- ✅ Accessibility features
- ✅ Maintainable code structure
- ✅ Clear documentation

The codebase is ready for deployment to Reddit Devvit and can be extended with additional features as needed.
