---
name: murder-mystery-intro
description: Create immersive 3-slide introductions for murder mystery, detective, and whodunit games using controlled information disclosure. Use when building Devvit games, Reddit community games, web-based mystery experiences, or crime investigation scenarios that need atmospheric story setup without revealing clues, motives, or evidence. Specializes in noir aesthetics, locked-room mysteries, and suspect introductions.
---

# Murder Mystery Intro Creator

Generate 3-slide game introductions that hook players while preserving mystery.

## Quick Start

When asked to create a murder mystery intro:

1. **Identify setting** - Corporate? Manor? Modern? Noir?
2. **Generate 3 slides** following structure below
3. **Verify information control** using checklist
4. **Reference examples** - See `references/examples.md` for complete patterns

## The 3-Slide Formula

### Slide 1: Discovery (Hook)

**Pattern:**
```
[Time] - [Exact location]

[Victim name] found dead [where].
[One constraint fact].
[Number] people present.
```

**Include:** Time, location, victim identity, primary constraint  
**Exclude:** Cause of death, murder weapon, any evidence

**Example:**
```
2:47 AM - TechVision HQ, 42nd Floor

CEO Sarah Chen found dead in the server room.
Emergency lockdown activated.
Four executives were working late.
```

### Slide 2: Suspects (Cast)

**Pattern:** Name - Role only, plus one-sentence claim per suspect

```
[Name] - [Role]
"[Their claim]"

[Repeat for 4 suspects]

[Constraint statement]
[Tension line]
```

**Include:** Names, roles (1-2 words), their claims  
**Exclude:** Motives, relationships, detailed alibis, backstories

**Example:**
```
Marcus Reed - CTO
"I was debugging in Lab 3."

Dr. Lisa Park - Chief Scientist  
"I was reviewing patents."

James Wu - CFO
"I was on a call with Tokyo."

Emma Torres - Security Chief
"I responded to the alarm."

All four had server access.
Someone triggered the lockdown.
```

### Slide 3: Challenge (Hook)

**Pattern:**
```
[X suspects]
[Y timeframe]
[One truth]

[Question to player]

[CTA Button] →
```

**Example:**
```
Four suspects.
One crime scene.
Every second counts.

Who killed Sarah Chen?

[START INVESTIGATION] →
```

## Information Control Rules

**Always reveal:**
- Victim died (state directly: "found dead", "murdered")
- 4 suspects were present
- Basic constraint (locked room, timeframe)
- That someone is lying

**Never reveal:**
- Motives or backstories
- Relationships between characters  
- Evidence or clues
- How murder occurred
- Detailed alibis

**Golden rule:** Every revealed detail = one less player discovery

## Writing Style

Use **direct, immediate language:**

- ✅ "CEO found dead" | ❌ "A CEO has been found deceased"
- ✅ "11:47 PM" | ❌ "late at night"  
- ✅ "Door locked from inside" | ❌ "The door appears to have been secured"

**Tone:** Matter-of-fact with ominous undertones. No melodrama.

**Format:** 3-4 lines per block, line breaks for emphasis

## Visual Guidelines

**Slide 1:** Dark atmospheric scene, high contrast, noir aesthetic, NO visible victim  
**Slide 2:** Silhouettes or stylized portraits, equal visual weight, minimal features  
**Slide 3:** Abstract/symbolic (clock, question mark, detective tools)

**Color palette:** Dark blues/grays + danger accent color

## Platform-Specific Notes

### Devvit/Reddit Games
- Each slide = separate screen state
- Swipe or tap to advance
- Mobile-first (vertical)
- Make intro dismissible (don't force replay)

### Web-Based
- Fade transitions between slides
- ~3 seconds per slide or manual advance
- Store "intro_seen" flag in session

## Quality Checklist

Before finalizing, verify:

- [ ] No motives mentioned
- [ ] No evidence revealed  
- [ ] Death stated directly (not euphemized)
- [ ] Exactly 4 suspects with role only
- [ ] Total under 150 words
- [ ] Each slide serves distinct purpose
- [ ] Ends with question/CTA

## Examples Library

For complete examples across settings (corporate, manor, noir, psychological, minimalist), see `references/examples.md`

**When to reference:**
- Need inspiration for a specific tone
- Want to see complete 3-slide flow
- Looking for cultural adaptations (Korean, Japanese, British)
- Need anti-patterns (what NOT to do)
