# Data Structure Examples

Complete JSON format examples for mystery case data structures.

## Complete Case Example

```json
{
  "id": "case-2025-01-19",
  "victim": {
    "name": "Dr. Eleanor Vance",
    "background": "Renowned archaeologist and museum curator",
    "relationship": "Employer and colleague to all three suspects"
  },
  "suspects": [
    {
      "id": "suspect-1",
      "name": "Marcus Chen",
      "archetype": "Wealthy Heir",
      "background": "Dr. Vance's nephew and museum board member",
      "personality": "Arrogant, entitled, dismissive of others' opinions",
      "isGuilty": false,
      "profileImage": "data:image/png;base64,..."
    },
    {
      "id": "suspect-2",
      "name": "Sarah Mitchell",
      "archetype": "Loyal Butler",
      "background": "Dr. Vance's personal assistant for 15 years",
      "personality": "Observant, discreet, fiercely protective of employer",
      "isGuilty": false,
      "profileImage": "data:image/png;base64,..."
    },
    {
      "id": "suspect-3",
      "name": "Dr. James Hartford",
      "archetype": "Business Partner",
      "background": "Co-curator and research partner",
      "personality": "Ambitious, calculating, competitive",
      "isGuilty": true,
      "profileImage": "data:image/png;base64,..."
    }
  ],
  "solution": {
    "who": "Dr. James Hartford",
    "what": "Poisoned Dr. Vance with a rare toxin from the museum's collection",
    "where": "In her private office at the museum",
    "when": "At 10:30 PM on January 18th, 2025, after the museum closed",
    "why": "To steal credit for a major archaeological discovery that would have launched Dr. Vance's solo career",
    "how": "Mixed the poison into her evening tea, which he knew she always drank alone in her office"
  },
  "weapon": {
    "name": "Poison",
    "description": "A rare toxin from the museum's historical collection, colorless and tasteless"
  },
  "location": {
    "name": "Victorian Mansion",
    "description": "The museum is housed in a grand Victorian mansion with ornate architecture and secret passages"
  },
  "caseSceneImage": "data:image/png;base64,..

.",
  "generatedAt": "2025-01-19T10:30:00Z"
}
```

## Case Without Images

```json
{
  "id": "case-2025-01-20",
  "victim": {
    "name": "Richard Ashwood",
    "background": "Wealthy tech entrepreneur",
    "relationship": "CEO and employer to all suspects"
  },
  "suspects": [
    {
      "id": "suspect-1",
      "name": "Lisa Chen",
      "archetype": "Talented Artist",
      "background": "Lead designer at Ashwood's company",
      "personality": "Creative, passionate, emotionally volatile",
      "isGuilty": false
    },
    {
      "id": "suspect-2",
      "name": "David Park",
      "archetype": "Former Police Officer",
      "background": "Head of security",
      "personality": "Analytical, direct, rule-oriented",
      "isGuilty": true
    },
    {
      "id": "suspect-3",
      "name": "Emma Rodriguez",
      "archetype": "Business Partner",
      "background": "CFO and co-founder",
      "personality": "Pragmatic, calculating, financially motivated",
      "isGuilty": false
    }
  ],
  "solution": {
    "who": "David Park",
    "what": "Strangled Richard with a garrote wire",
    "where": "In the executive suite",
    "when": "During the company party at 11:45 PM",
    "why": "Richard discovered David was embezzling company funds and threatened to press charges",
    "how": "Used his security access to isolate Richard, then attacked when they were alone"
  },
  "weapon": {
    "name": "Blunt Object",
    "description": "A heavy marble bookend from Richard's desk"
  },
  "location": {
    "name": "Private Estate",
    "description": "Richard's sprawling modern estate with smart home technology throughout"
  },
  "generatedAt": "2025-01-20T09:15:00Z"
}
```

## Suspect Profile Examples

### Wealthy Heir

```json
{
  "id": "suspect-1",
  "name": "Alexander Pemberton III",
  "archetype": "Wealthy Heir",
  "background": "Inheritor of family fortune, board member of victim's charity",
  "personality": "Entitled, dismissive, accustomed to getting his way through money and influence",
  "isGuilty": false,
  "profileImage": "data:image/png;base64,..."
}
```

### Loyal Butler

```json
{
  "id": "suspect-2",
  "name": "Margaret O'Brien",
  "archetype": "Loyal Butler",
  "background": "Served the family for 30 years, witnessed all family secrets",
  "personality": "Discrete, observant, fiercely loyal but morally conflicted",
  "isGuilty": false,
  "profileImage": "data:image/png;base64,..."
}
```

### Talented Artist

```json
{
  "id": "suspect-3",
  "name": "Isabella Rossi",
  "archetype": "Talented Artist",
  "background": "Commissioned to paint victim's portrait, had turbulent creative relationship",
  "personality": "Passionate, emotionally intense, driven by artistic vision",
  "isGuilty": true,
  "profileImage": "data:image/png;base64,..."
}
```

### Business Partner

```json
{
  "id": "suspect-1",
  "name": "Jonathan Blake",
  "archetype": "Business Partner",
  "background": "Co-founder of successful startup with victim, recent tensions over company direction",
  "personality": "Calculating, focused on bottom line, willing to make hard decisions",
  "isGuilty": false,
  "profileImage": "data:image/png;base64,..."
}
```

### Former Police Officer

```json
{
  "id": "suspect-2",
  "name": "Detective Raymond Costa",
  "archetype": "Former Police Officer",
  "background": "Retired detective now working as private investigator, hired by victim",
  "personality": "Analytical, procedural, skeptical of emotional arguments",
  "isGuilty": false,
  "profileImage": "data:image/png;base64,..."
}
```

## 5W1H Solution Examples

### Complete Solution

```json
{
  "who": "Dr. James Hartford",
  "what": "Administered a lethal dose of cyanide disguised as medication",
  "where": "In the victim's private study at the mansion",
  "when": "At approximately 9:00 PM on the night of the party",
  "why": "The victim was about to expose James's fraudulent research that built his career",
  "how": "Switched the victim's heart medication with cyanide capsules he prepared in the lab"
}
```

### Minimal Solution

```json
{
  "who": "Sarah Mitchell",
  "what": "Pushed victim down the stairs",
  "where": "Grand staircase",
  "when": "10:30 PM after guests left",
  "why": "Victim threatened to fire her and destroy her reputation",
  "how": "Waited at the top of stairs and pushed when victim approached"
}
```

## Weapon Examples

### Poison

```json
{
  "name": "Poison",
  "description": "A rare botanical toxin extracted from nightshade, colorless and nearly tasteless"
}
```

### Knife

```json
{
  "name": "Knife",
  "description": "An ornate letter opener from the victim's antique collection, sharp and well-maintained"
}
```

### Gun

```json
{
  "name": "Gun",
  "description": "A .38 caliber revolver kept in the victim's desk drawer, recently cleaned"
}
```

### Blunt Object

```json
{
  "name": "Blunt Object",
  "description": "A heavy crystal decanter from the bar cart, thick glass with sharp edges"
}
```

### Rope

```json
{
  "name": "Rope",
  "description": "Thick nautical rope from the boat house, strong and weathered"
}
```

## Location Examples

### Victorian Mansion

```json
{
  "name": "Victorian Mansion",
  "description": "A sprawling Victorian estate with ornate architecture, secret passages, and a dark history"
}
```

### Modern Penthouse

```json
{
  "name": "Modern Penthouse",
  "description": "A sleek high-rise penthouse with floor-to-ceiling windows and minimalist design"
}
```

### Private Estate

```json
{
  "name": "Private Estate",
  "description": "Secluded countryside estate with extensive grounds, stables, and a private lake"
}
```

### Art Gallery

```json
{
  "name": "Art Gallery",
  "description": "Contemporary art gallery with rotating exhibitions and a prestigious clientele"
}
```

### Corporate Office

```json
{
  "name": "Corporate Office",
  "description": "Executive suite in a downtown skyscraper, modern with impressive city views"
}
```

## Validation Report Example

```json
{
  "isValid": true,
  "errors": [],
  "warnings": [
    "Suspect 2 alibi timestamp is vague"
  ],
  "fixes": [],
  "checks": {
    "guiltySuspectCount": {
      "passed": true,
      "expected": 1,
      "actual": 1
    },
    "solution5W1H": {
      "passed": true,
      "missingFields": []
    },
    "suspectCount": {
      "passed": true,
      "expected": 3,
      "actual": 3
    },
    "victimInfo": {
      "passed": true
    },
    "contradictions": {
      "passed": true,
      "issues": []
    }
  }
}
```

## Batch Generation Request

```json
{
  "count": 7,
  "options": {
    "withImages": true,
    "delay": 60,
    "idPrefix": "case-2025-01"
  },
  "filters": {
    "weapons": ["Poison", "Knife"],
    "locations": ["Victorian Mansion", "Modern Penthouse"],
    "archetypes": ["Wealthy Heir", "Loyal Butler", "Business Partner"]
  }
}
```

## Deployment Configuration

```json
{
  "caseId": "case-2025-01-19",
  "subreddit": "r/ArmchairSleuths",
  "postTitle": "Daily Mystery Case - January 19, 2025",
  "scheduledTime": "2025-01-19T09:00:00Z",
  "options": {
    "pinPost": true,
    "enableComments": true,
    "flairId": "daily-mystery"
  }
}
```
