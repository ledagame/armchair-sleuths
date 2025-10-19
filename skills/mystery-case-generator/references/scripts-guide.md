# Scripts Guide

Complete reference for all mystery case generation scripts.

## scripts/generate-case.ts

Complete case generation script with full control over all parameters.

### Basic Usage

```bash
# Generate basic case
npx tsx scripts/generate-case.ts

# Generate with images
npx tsx scripts/generate-case.ts --with-images

# Custom case ID
npx tsx scripts/generate-case.ts --case-id case-custom-2025-01-19

# Specific elements
npx tsx scripts/generate-case.ts --weapon poison --motive revenge --location mansion
```

### All Options

- `--with-images`: Include suspect profile and case scene images
- `--case-id <id>`: Custom case ID (default: case-YYYY-MM-DD)
- `--weapon <name>`: Specific weapon from library
- `--motive <category>`: Specific motive category
- `--location <name>`: Specific location
- `--archetype <type>`: Specific suspect archetype for guilty suspect
- `--retry <n>`: Number of retry attempts for Gemini API (default: 3)

### Output Structure

```typescript
{
  id: "case-2025-01-19",
  victim: {
    name: string,
    background: string,
    relationship: string
  },
  suspects: [
    {
      id: string,
      name: string,
      archetype: string,
      background: string,
      personality: string,
      isGuilty: boolean,
      profileImage?: string  // If --with-images
    }
  ],
  solution: {
    who: string,
    what: string,
    where: string,
    when: string,
    why: string,
    how: string
  },
  weapon: { name: string, description: string },
  location: { name: string, description: string },
  caseSceneImage?: string,  // If --with-images
  generatedAt: timestamp
}
```

### Dependencies

- `@google/generative-ai`: Gemini API client
- `src/server/services/CaseGeneratorService.ts`: Core generation logic
- `src/server/services/ImageGenerator.ts`: Image generation (if --with-images)
- `src/server/core/KVStoreManager.ts`: Case storage

## scripts/validate-case.ts

Comprehensive case validation with auto-fix capability.

### Basic Usage

```bash
# Validate specific case
npx tsx scripts/validate-case.ts --case-id case-2025-01-19

# Validate with auto-fix
npx tsx scripts/validate-case.ts --case-id case-2025-01-19 --fix

# Verbose output
npx tsx scripts/validate-case.ts --case-id case-2025-01-19 --verbose
```

### Validation Checks

1. **Guilty Suspect Count**
   - Exactly one suspect must have `isGuilty: true`
   - Error if 0 or >1 guilty suspects

2. **5W1H Completeness**
   - All fields required: who, what, where, when, why, how
   - Each field must be non-empty string

3. **Suspect Count**
   - Exactly 3 suspects required
   - Each suspect must have: id, name, archetype, background, personality

4. **Victim Information**
   - Required fields: name, background, relationship

5. **Weapon & Location**
   - Both must exist with name and description

6. **Contradiction Detection**
   - Cross-check suspect statements against solution
   - Verify timeline consistency

### Output

```typescript
{
  isValid: boolean,
  errors: string[],        // Critical issues preventing use
  warnings: string[],      // Non-critical issues
  fixes: string[]          // Auto-fix suggestions
}
```

### Auto-Fix Capabilities

With `--fix` flag, the script can automatically correct:
- Missing guilty suspect marker (selects one based on solution)
- Incomplete 5W1H fields (generates missing content)
- Minor format inconsistencies

## scripts/validate-all-cases.ts

Batch validation for all cases in KV store.

### Basic Usage

```bash
# Validate all cases
npx tsx scripts/validate-all-cases.ts

# Fix all issues
npx tsx scripts/validate-all-cases.ts --fix-errors

# Export report
npx tsx scripts/validate-all-cases.ts --export report.json

# Filter by date range
npx tsx scripts/validate-all-cases.ts --from 2025-01-01 --to 2025-01-31
```

### Report Format

```json
{
  "totalCases": 30,
  "validCases": 28,
  "invalidCases": 2,
  "errors": [
    {
      "caseId": "case-2025-01-15",
      "errors": ["No guilty suspect found"],
      "warnings": ["Missing location description"]
    }
  ],
  "summary": {
    "commonErrors": {
      "missingGuilty": 1,
      "incomplete5W1H": 1
    }
  }
}
```

## scripts/deploy-case.ts

Deploy validated cases to Reddit via Devvit.

### Basic Usage

```bash
# Deploy specific case
npx tsx scripts/deploy-case.ts --case-id case-2025-01-19

# Deploy today's case
npx tsx scripts/deploy-case.ts --today

# Test mode (no actual post)
npx tsx scripts/deploy-case.ts --case-id case-2025-01-19 --dry-run

# Custom subreddit
npx tsx scripts/deploy-case.ts --case-id case-2025-01-19 --subreddit r/ArmchairSleuths
```

### Prerequisites

1. **Case Validation**
   - Case must pass all validation checks
   - Script automatically validates before deployment

2. **Reddit Configuration**
   - Devvit credentials configured
   - Subreddit permissions granted

3. **Environment Variables**
   - `REDDIT_CLIENT_ID`
   - `REDDIT_CLIENT_SECRET`
   - `REDDIT_REFRESH_TOKEN`

### Deployment Process

1. Validate case
2. Generate Reddit post content
3. Upload images (if present)
4. Create Devvit post
5. Return post URL

### Post Format

```
Title: Daily Mystery Case - YYYY-MM-DD

Content:
[Case Scene Image]

A murder has occurred...

[Victim information]

Three suspects:
1. [Suspect 1 with profile image]
2. [Suspect 2 with profile image]
3. [Suspect 3 with profile image]

Begin your investigation...
```

## Common Workflows

### Daily Case Generation

```bash
# Generate, validate, and deploy
npx tsx scripts/generate-case.ts --with-images
npx tsx scripts/validate-case.ts --case-id case-$(date +%Y-%m-%d)
npx tsx scripts/deploy-case.ts --today
```

### Bulk Case Preparation

```bash
# Generate 7 cases for the week
for i in {1..7}; do
  npx tsx scripts/generate-case.ts --with-images
  sleep 60  # Rate limit friendly
done

# Validate all
npx tsx scripts/validate-all-cases.ts --fix-errors
```

### Case Regeneration

```bash
# If case has issues, regenerate specific elements
npx tsx scripts/generate-case.ts --case-id case-2025-01-19 --regenerate-images
npx tsx scripts/validate-case.ts --case-id case-2025-01-19 --fix
```
