# Component Usage Examples

## Quick Reference for Implementing UI Components

This guide shows how to use the pre-built UI components from the design system.

---

## Installation

```tsx
import {
  Button,
  Card,
  SuspectCard,
  CompactSuspectCard,
  ChatBubble,
  ChatInput,
  ProgressBar,
  LoadingSpinner,
  SkeletonCard,
  Alert,
  Badge,
  ScoreItem,
  InputField,
  TextAreaField,
  RadioGroup,
} from './components/ui';
```

---

## Components

### Buttons

```tsx
// Primary CTA
<Button variant="primary" size="md" onClick={handleSubmit}>
  Submit Guess
</Button>

// Secondary action
<Button variant="secondary" size="md" onClick={handleViewEvidence}>
  View Evidence
</Button>

// Ghost button for subtle actions
<Button variant="ghost" size="sm" onClick={handleSkip}>
  Skip
</Button>

// Disabled state
<Button variant="primary" disabled>
  Loading...
</Button>
```

---

### Cards

```tsx
// Basic card
<Card>
  <h3 className="text-xl font-semibold">Card Title</h3>
  <p className="text-gray-600 mt-2">Card content goes here</p>
</Card>

// Hoverable card
<Card hover onClick={handleClick}>
  <p>Click me!</p>
</Card>

// Selected card
<Card selected>
  <p>This card is selected</p>
</Card>
```

---

### Suspect Cards

```tsx
// Full suspect card
<SuspectCard
  id="1"
  name="Margaret Blackwood"
  archetype="The Socialite"
  background="A wealthy widow with a complicated past..."
  imageUrl="/images/margaret.jpg"
  selected={selectedSuspectId === '1'}
  onInterrogate={() => handleInterrogate('1')}
  onClick={() => handleSelect('1')}
/>

// Compact version for lists
<CompactSuspectCard
  name="Margaret Blackwood"
  archetype="The Socialite"
  avatarUrl="/images/margaret.jpg"
  onClick={() => handleSelect('1')}
/>
```

---

### Chat Interface

```tsx
// User message
<ChatBubble
  message="Where were you at 9 PM last night?"
  timestamp="Just now"
  isUser={true}
/>

// Suspect response
<ChatBubble
  message="I was at the theater with my sister..."
  timestamp="2 minutes ago"
  isUser={false}
  senderName="Margaret Blackwood"
  avatarUrl="/images/margaret.jpg"
/>

// Chat input
<ChatInput
  value={message}
  onChange={setMessage}
  onSubmit={handleSendMessage}
  placeholder="Ask a question..."
  disabled={loading}
/>

// Complete chat screen example
<div className="flex flex-col h-screen">
  {/* Header */}
  <div className="bg-white border-b border-gray-200 p-4">
    <h2 className="text-lg font-semibold">Margaret Blackwood</h2>
  </div>

  {/* Messages */}
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {messages.map((msg) => (
      <ChatBubble
        key={msg.id}
        message={msg.content}
        timestamp={msg.timestamp}
        isUser={msg.isUser}
        senderName={msg.senderName}
      />
    ))}
  </div>

  {/* Input */}
  <ChatInput
    value={message}
    onChange={setMessage}
    onSubmit={handleSendMessage}
  />
</div>
```

---

### Progress Indicators

```tsx
// Linear progress bar
<ProgressBar
  progress={60}
  label="Investigation Progress"
  showPercentage={true}
/>

// Loading spinner
<LoadingSpinner size="md" label="Loading suspects..." />

// Small spinner
<LoadingSpinner size="sm" />

// Skeleton loading state
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <SkeletonCard />
  <SkeletonCard />
  <SkeletonCard />
</div>
```

---

### Alerts & Notifications

```tsx
// Success alert
<Alert
  type="success"
  title="Success!"
  message="Your answer has been submitted successfully."
/>

// Error alert
<Alert
  type="error"
  title="Error"
  message="Please select a suspect before submitting."
/>

// Warning alert
<Alert
  type="warning"
  message="You have 5 minutes remaining."
/>

// Info alert with close button
<Alert
  type="info"
  message="New clue discovered!"
  onClose={() => setShowAlert(false)}
/>
```

---

### Badges

```tsx
// Status badges
<Badge variant="success">Solved</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="warning">In Progress</Badge>
<Badge variant="info">New</Badge>

// Small badge
<Badge variant="success" size="sm">3</Badge>
```

---

### Score Display

```tsx
// Score breakdown
<div className="space-y-4">
  <ScoreItem
    label="Suspect Identified"
    description="Correctly identified the culprit"
    points={300}
    isCorrect={true}
    icon="check"
  />

  <ScoreItem
    label="Weapon Correct"
    description="Candlestick"
    points={150}
    isCorrect={true}
    icon="check"
  />

  <ScoreItem
    label="Location Incorrect"
    description="You guessed Kitchen, actual was Library"
    points={-50}
    isCorrect={false}
    icon="x"
  />

  <ScoreItem
    label="Excellent Reasoning"
    description="Well-structured deduction"
    points={250}
    isCorrect={true}
    icon="star"
  />

  <ScoreItem
    label="Time Bonus"
    description="Under 10 minutes"
    points={50}
    isCorrect={true}
    icon="clock"
  />
</div>
```

---

### Form Elements

```tsx
// Text input
<InputField
  label="Your Name"
  placeholder="Enter your name..."
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// Input with error
<InputField
  label="Email"
  placeholder="your@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error="Please enter a valid email"
/>

// Text area
<TextAreaField
  label="Your Deduction"
  placeholder="Explain your reasoning..."
  rows={6}
  value={deduction}
  onChange={(e) => setDeduction(e.target.value)}
/>

// Radio group
<RadioGroup
  name="suspect"
  label="Who is guilty?"
  value={selectedSuspect}
  onChange={setSelectedSuspect}
  options={[
    {
      value: '1',
      label: 'Margaret Blackwood',
      description: 'The Socialite'
    },
    {
      value: '2',
      label: 'James Hartford',
      description: 'The Business Partner'
    },
    {
      value: '3',
      label: 'Elizabeth Chen',
      description: 'The Secretary'
    }
  ]}
/>
```

---

## Complete Screen Examples

### Case Overview Screen

```tsx
export const CaseOverview = ({ caseData, onStartInvestigation }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
            TODAY'S CASE
          </p>
          <h1 className="text-3xl font-bold mt-1">
            {caseData.title}
          </h1>
          <p className="text-base text-blue-100 mt-2">
            {caseData.date}
          </p>
        </div>
      </div>

      {/* Case Image */}
      <div className="max-w-2xl mx-auto px-4 -mt-12">
        <div className="aspect-video bg-white rounded-lg shadow-lg overflow-hidden">
          <img
            src={caseData.imageUrl}
            alt={caseData.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Case Details */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900">
            Case Details
          </h2>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Victim</p>
                <p className="text-base text-gray-900">{caseData.victim}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-amber-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Weapon</p>
                <p className="text-base text-gray-900">{caseData.weapon}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-blue-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-base text-gray-900">{caseData.location}</p>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full mt-6"
            onClick={onStartInvestigation}
          >
            Start Investigation
          </Button>
        </Card>
      </div>
    </div>
  );
};
```

### Suspect Panel Screen

```tsx
export const SuspectPanel = ({ suspects, selectedSuspectId, onSelectSuspect }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Prime Suspects</h1>
          <p className="text-sm text-gray-600 mt-1">
            Select a suspect to interrogate
          </p>
        </div>
      </div>

      {/* Loading State */}
      {suspects.length === 0 ? (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : (
        /* Suspect Grid */
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suspects.map((suspect) => (
              <SuspectCard
                key={suspect.id}
                {...suspect}
                selected={selectedSuspectId === suspect.id}
                onClick={() => onSelectSuspect(suspect.id)}
                onInterrogate={() => onSelectSuspect(suspect.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### Submission Form Screen

```tsx
export const SubmissionForm = ({ onSubmit, submitting, suspects }) => {
  const [selectedSuspect, setSelectedSuspect] = useState('');
  const [weapon, setWeapon] = useState('');
  const [location, setLocation] = useState('');
  const [reasoning, setReasoning] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      suspectId: selectedSuspect,
      weapon,
      location,
      reasoning,
    });
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Submit Your Deduction
      </h1>
      <p className="text-base text-gray-600 mt-2">
        Review your theory before submitting
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Suspect Selection */}
        <Card>
          <RadioGroup
            name="suspect"
            label="Who is guilty?"
            value={selectedSuspect}
            onChange={setSelectedSuspect}
            options={suspects.map(s => ({
              value: s.id,
              label: s.name,
              description: s.archetype
            }))}
          />
        </Card>

        {/* Weapon */}
        <Card>
          <InputField
            label="Murder Weapon"
            placeholder="e.g., Candlestick, Knife..."
            value={weapon}
            onChange={(e) => setWeapon(e.target.value)}
          />
        </Card>

        {/* Location */}
        <Card>
          <InputField
            label="Location of Murder"
            placeholder="e.g., Library, Kitchen..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Card>

        {/* Reasoning */}
        <Card>
          <TextAreaField
            label="Your Reasoning"
            placeholder="Explain your deduction..."
            rows={6}
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
          />
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={submitting || !selectedSuspect || !weapon || !location || !reasoning}
        >
          {submitting ? 'Submitting...' : 'Submit Final Answer'}
        </Button>
      </form>
    </div>
  );
};
```

### Results Screen

```tsx
export const ResultView = ({ result, caseId }) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-green-600 rounded-full mx-auto flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-6">
          {result.correct ? 'Case Solved!' : 'Case Closed'}
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          {result.correct
            ? 'You cracked the case with flying colors'
            : 'Better luck next time, detective'}
        </p>
      </div>

      {/* Total Score */}
      <Card className="mt-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Final Score</h2>
        <div className="text-6xl font-bold text-amber-600 mt-4">
          {result.totalScore}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          out of 1000 points
        </p>
      </Card>

      {/* Score Breakdown */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Score Breakdown
        </h2>
        <div className="space-y-4">
          <ScoreItem
            label="Suspect Identification"
            description={result.suspectCorrect ? 'Correct' : 'Incorrect'}
            points={result.suspectPoints}
            isCorrect={result.suspectCorrect}
            icon="check"
          />
          <ScoreItem
            label="Weapon"
            description={result.weaponCorrect ? 'Correct' : 'Incorrect'}
            points={result.weaponPoints}
            isCorrect={result.weaponCorrect}
            icon="check"
          />
          <ScoreItem
            label="Location"
            description={result.locationCorrect ? 'Correct' : 'Incorrect'}
            points={result.locationPoints}
            isCorrect={result.locationCorrect}
            icon="check"
          />
          <ScoreItem
            label="Reasoning Quality"
            description={result.reasoningFeedback}
            points={result.reasoningPoints}
            isCorrect={result.reasoningPoints > 0}
            icon="star"
          />
        </div>
      </Card>

      {/* Leaderboard Preview */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900">Your Rank</h2>
        <div className="mt-4 flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-amber-600">
              #{result.rank}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {result.username}
              </p>
              <p className="text-xs text-gray-600">
                Top {result.percentile}%
              </p>
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {result.totalScore}
          </div>
        </div>
      </Card>
    </div>
  );
};
```

---

## Utility Classes Reference

### Common Combinations

```tsx
// Container
"max-w-2xl mx-auto px-4 py-6"

// Card
"bg-white rounded-lg border border-gray-200 p-4 shadow-sm"

// Flex center
"flex items-center justify-center"

// Full width button
"w-full px-6 py-3"

// Section spacing
"space-y-4"

// Grid layout
"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"

// Hover effect
"transition-all duration-200 hover:shadow-md"

// Text truncate
"truncate"

// Line clamp (3 lines)
"line-clamp-3"
```

---

## Animation Classes

Add these to your `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
}
```

Usage:
```tsx
<div className="animate-fade-in">Fades in</div>
<div className="animate-slide-up">Slides up</div>
<div className="animate-pulse">Pulses (built-in)</div>
```

---

## Responsive Design Tips

### Mobile-First Approach
```tsx
// Start with mobile, add larger breakpoints
<div className="text-base sm:text-lg lg:text-xl">
  Responsive text
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>
```

### Hide/Show Elements
```tsx
// Show on mobile only
<div className="sm:hidden">Mobile only</div>

// Show on tablet and up
<div className="hidden sm:block">Tablet and up</div>

// Show on desktop only
<div className="hidden lg:block">Desktop only</div>
```

### Responsive Padding/Margin
```tsx
<div className="px-4 sm:px-6 lg:px-8">
  Responsive horizontal padding
</div>

<div className="py-6 sm:py-8 lg:py-12">
  Responsive vertical padding
</div>
```

---

## Performance Tips

1. **Use SkeletonCard for loading states** - Better UX than spinners
2. **Implement virtualization for long lists** - Use `react-window` or `react-virtual`
3. **Lazy load images** - Use `loading="lazy"` attribute
4. **Memoize expensive components** - Use `React.memo()` for cards
5. **Debounce search inputs** - Use `useDebouncedValue` hook

---

## Accessibility Checklist

- [ ] All interactive elements have focus states
- [ ] Color contrast meets WCAG AA standards
- [ ] Buttons use semantic `<button>` elements
- [ ] Forms have proper labels
- [ ] Images have alt text
- [ ] Keyboard navigation works
- [ ] Loading states are announced to screen readers

---

## Testing Your Components

```tsx
// Visual regression testing
test('SuspectCard renders correctly', () => {
  render(
    <SuspectCard
      id="1"
      name="Test Suspect"
      archetype="The Detective"
      background="A mysterious figure..."
    />
  );
  expect(screen.getByText('Test Suspect')).toBeInTheDocument();
});

// Interaction testing
test('Button onClick works', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

---

**Quick Start**: Copy any example above and customize the props to fit your needs. All components are production-ready and follow the design system specifications.
