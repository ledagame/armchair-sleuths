# Translation Guide for Suspect AI Prompter

**Version**: 1.0.0  
**Last Updated**: 2025-01-24  
**Purpose**: Guide for translating PROMPT.md and Few-Shot examples to new languages

---

## Overview

This guide helps you translate the Suspect AI Prompter system to new languages while maintaining quality and cultural authenticity. The system currently supports English and Korean, and this guide will help you add more languages.

---

## Translation Workflow

### Step 1: Language Configuration

Create a language configuration in the system:

```typescript
// Add to language configuration
const LANGUAGE_CONFIGS = {
  // Existing languages
  en: { code: 'en', name: 'English', wordCountMultiplier: 1.0 },
  ko: { code: 'ko', name: '한국어', wordCountMultiplier: 0.75 },
  
  // Add your new language
  ja: { code: 'ja', name: '日本語', wordCountMultiplier: 0.70 },
  es: { code: 'es', name: 'Español', wordCountMultiplier: 1.1 },
  fr: { code: 'fr', name: 'Français', wordCountMultiplier: 1.15 },
};
```

### Step 2: Calculate Word Count Multiplier

Different languages have different word densities. Calculate the appropriate multiplier:

**Formula**:
```
multiplier = (average words per sentence in target language) / (average words per sentence in English)
```

**Reference Multipliers**:
- **English**: 1.0 (baseline)
- **Korean**: 0.75 (more compact due to agglutination)
- **Japanese**: 0.70 (similar to Korean)
- **Chinese**: 0.60 (very compact, character-based)
- **Spanish**: 1.1 (slightly more verbose)
- **French**: 1.15 (more verbose)
- **German**: 1.2 (compound words, longer sentences)
- **Russian**: 0.85 (compact due to case system)

**How to Calculate**:
1. Take 10 sample English sentences from PROMPT.md
2. Translate them naturally to your target language
3. Count words in both versions
4. Calculate average ratio

### Step 3: Translate PROMPT.md

Create a new file: `PROMPT.[language_code].md`

Example: `PROMPT.ja.md` for Japanese

#### Translation Guidelines

**DO Translate**:
- ✅ All instructional text
- ✅ System role descriptions
- ✅ Response guidelines
- ✅ Quality criteria explanations
- ✅ Example analyses

**DO NOT Translate**:
- ❌ Variable names (keep `{{SUSPECT_NAME}}`, `{{ARCHETYPE}}`, etc.)
- ❌ Technical terms in code blocks
- ❌ Emotional state names (COOPERATIVE, NERVOUS, DEFENSIVE, AGGRESSIVE)
- ❌ Quality dimension names (Character Consistency, Emotional Alignment, etc.)

**Example**:
```markdown
<!-- English -->
## SYSTEM ROLE
You are {{SUSPECT_NAME}}, a {{ARCHETYPE}} in a murder mystery investigation.

<!-- Korean -->
## 시스템 역할
당신은 살인 미스터리 수사에서 {{ARCHETYPE}}인 {{SUSPECT_NAME}}입니다.

<!-- Japanese -->
## システムロール
あなたは殺人ミステリー捜査における{{ARCHETYPE}}の{{SUSPECT_NAME}}です。
```

### Step 4: Adjust Word Count Ranges

Apply the word count multiplier to all emotional states:

**English Baseline**:
| Emotional State | English Range |
|----------------|---------------|
| COOPERATIVE | 40-80 words |
| NERVOUS | 30-60 words |
| DEFENSIVE | 15-40 words |
| AGGRESSIVE | 10-30 words |

**Calculation Formula**:
```
target_min = english_min × multiplier
target_max = english_max × multiplier
```

**Example for Japanese (multiplier: 0.70)**:
| Emotional State | English | Japanese |
|----------------|---------|----------|
| COOPERATIVE | 40-80 | 28-56 |
| NERVOUS | 30-60 | 21-42 |
| DEFENSIVE | 15-40 | 10-28 |
| AGGRESSIVE | 10-30 | 7-21 |

**Example for Spanish (multiplier: 1.1)**:
| Emotional State | English | Spanish |
|----------------|---------|---------|
| COOPERATIVE | 40-80 | 44-88 |
| NERVOUS | 30-60 | 33-66 |
| DEFENSIVE | 15-40 | 16-44 |
| AGGRESSIVE | 10-30 | 11-33 |

### Step 5: Cultural Adaptation

Adapt content to fit cultural context:

#### 5.1 Formality Levels

Different languages have different formality systems:

**English**: Relatively informal, uses contractions
```
"I don't know what you're talking about."
```

**Korean**: Formal/informal distinction (존댓말/반말)
```
Formal: "무슨 말씀을 하시는지 모르겠습니다."
Informal: "무슨 말을 하는지 모르겠어."
```

**Japanese**: Multiple formality levels (敬語)
```
Polite: "何をおっしゃっているのか分かりません。"
Casual: "何言ってるか分からない。"
```

**Spanish**: Formal/informal (usted/tú)
```
Formal: "No sé de qué está hablando usted."
Informal: "No sé de qué estás hablando."
```

**Guideline**: Choose the formality level that matches the character's archetype and emotional state.

#### 5.2 Idiomatic Expressions

Translate idioms culturally, not literally:

**English**: "I'm not going to throw anyone under the bus."

**Korean**: "저는 누구도 희생양으로 만들지 않을 겁니다."
(Literal: "I won't make anyone a scapegoat")

**Japanese**: "誰かを犠牲にするつもりはありません。"
(Literal: "I don't intend to sacrifice anyone")

**Spanish**: "No voy a echar a nadie a los lobos."
(Literal: "I'm not going to throw anyone to the wolves")

#### 5.3 Legal and Cultural References

Adapt references to fit local context:

**English**: "I want my lawyer" / "I plead the Fifth"

**Korean**: "변호사를 부르겠습니다" / "진술을 거부합니다"
(Call lawyer / Refuse to testify)

**Japanese**: "弁護士を呼んでください" / "黙秘権を行使します"
(Call lawyer / Exercise right to remain silent)

**Spanish**: "Quiero mi abogado" / "Me acojo a mi derecho a no declarar"
(Want lawyer / Invoke right not to testify)

### Step 6: Translate Few-Shot Examples

Create 8 examples per archetype (40 total) in the target language.

#### Example Structure

```markdown
### Example 1: COOPERATIVE - INNOCENT

**Detective:** "[Question in target language]"

**[Suspect Name] ([Archetype]):** "[Response in target language]"

**[Analysis]**
- Character consistency: [Evaluation in target language]
- Emotional alignment: [Evaluation in target language]
- Information content: [Evaluation in target language]
- Natural dialogue: [Evaluation in target language]
- Word count: [X words, target Y-Z]
```

#### Translation Tips

**Character Consistency**:
- Maintain archetype-specific vocabulary
- Translate personality traits appropriately
- Keep character voice consistent

**Emotional Alignment**:
- Match tone to emotional state
- Use appropriate formality level
- Respect word count ranges

**Information Content**:
- Guilty suspects: vague, evasive
- Innocent suspects: specific, helpful
- Maintain information disclosure patterns

**Natural Dialogue**:
- Use natural contractions (if applicable)
- Include cultural idioms
- Avoid overly formal language (unless character requires it)

### Step 7: Language-Specific Quality Criteria

Define quality validation rules for your language:

```typescript
const QUALITY_CRITERIA = {
  ja: {
    characterConsistency: 60,
    emotionalAlignment: 60,
    informationContent: 50,
    naturalDialogue: 60,
    overall: 65,
    
    // Language-specific checks
    naturalDialogueChecks: {
      // Check for appropriate formality markers
      formalityMarkers: ['です', 'ます', 'ございます'],
      casualMarkers: ['だ', 'よ', 'ね'],
      
      // Check for natural sentence endings
      naturalEndings: ['です', 'ます', 'ね', 'よ', 'か'],
      
      // Avoid overly formal endings
      avoidEndings: ['であります', 'でございます'],
    }
  }
};
```

### Step 8: Test and Validate

1. **Generate test responses** using the translated PROMPT.md
2. **Validate quality** using language-specific criteria
3. **Review with native speakers** for naturalness
4. **Iterate** based on feedback

---

## Language-Specific Considerations

### Asian Languages (Korean, Japanese, Chinese)

**Characteristics**:
- More compact (lower word count multiplier)
- Complex formality systems
- Character-based or agglutinative

**Considerations**:
- Define clear formality rules per archetype
- Use appropriate honorifics
- Adjust word count ranges significantly

**Example - Korean Formality**:
```
Wealthy Heir (COOPERATIVE): 존댓말 (formal)
"제 변호사와 상의해야 할 것 같습니다."

Wealthy Heir (AGGRESSIVE): 반말 (informal/rude)
"변호사 부를 거야. 더 이상 말 안 해."
```

### Romance Languages (Spanish, French, Italian)

**Characteristics**:
- More verbose (higher word count multiplier)
- Formal/informal distinction (usted/tú, vous/tu, Lei/tu)
- Gendered nouns and adjectives

**Considerations**:
- Increase word count ranges by 10-20%
- Choose appropriate formal/informal address
- Ensure gender agreement

**Example - Spanish Formality**:
```
Wealthy Heir (COOPERATIVE): Formal (usted)
"Necesito consultar con mi abogado antes de responder."

Wealthy Heir (AGGRESSIVE): Informal (tú)
"Voy a llamar a mi abogado. No diré nada más."
```

### Germanic Languages (German, Dutch)

**Characteristics**:
- Compound words
- Longer sentences
- Formal/informal distinction (Sie/du, u/jij)

**Considerations**:
- Increase word count ranges by 15-25%
- Use appropriate formal/informal address
- Break down compound words for clarity

**Example - German Formality**:
```
Wealthy Heir (COOPERATIVE): Formal (Sie)
"Ich muss das mit meinem Anwalt besprechen."

Wealthy Heir (AGGRESSIVE): Informal (du)
"Ich rufe meinen Anwalt an. Mehr sage ich nicht."
```

---

## Quality Validation Checklist

After translation, verify:

### Content Accuracy
- [ ] All sections translated
- [ ] Variable names unchanged
- [ ] Technical terms consistent
- [ ] Examples culturally appropriate

### Language Quality
- [ ] Natural, idiomatic expressions
- [ ] Appropriate formality level
- [ ] Correct grammar and spelling
- [ ] Consistent terminology

### Word Count Ranges
- [ ] Multiplier calculated correctly
- [ ] Ranges adjusted for all emotional states
- [ ] Examples fit within ranges
- [ ] Quality criteria updated

### Cultural Adaptation
- [ ] Idioms translated culturally
- [ ] Legal references adapted
- [ ] Formality system defined
- [ ] Character voices maintained

### Technical Integration
- [ ] Language code added to configuration
- [ ] Quality criteria defined
- [ ] Few-shot examples created
- [ ] Validation tests passing

---

## Testing Protocol

### Phase 1: Automated Testing

```bash
# Generate test responses
npm run suspect:test-language -- --lang ja

# Validate quality
npm run suspect:validate -- --lang ja

# Batch validate all examples
npm run suspect:workflow:batch-validate -- --lang ja
```

### Phase 2: Native Speaker Review

1. **Recruit native speakers** familiar with the target culture
2. **Review examples** for naturalness and authenticity
3. **Test character voices** for consistency
4. **Validate formality levels** for appropriateness

### Phase 3: A/B Testing

1. **Generate responses** in both English and target language
2. **Compare quality scores** across languages
3. **Adjust criteria** if scores are significantly different
4. **Iterate** until quality is consistent

---

## Common Pitfalls

### ❌ Literal Translation

**Wrong**:
```
English: "I'm not going to throw anyone under the bus."
Japanese (literal): "私は誰もバスの下に投げません。"
```

**Right**:
```
Japanese (cultural): "誰かを犠牲にするつもりはありません。"
```

### ❌ Ignoring Formality

**Wrong**:
```
Korean (all same formality): "저는 모릅니다." (always formal)
```

**Right**:
```
Korean (varies by state):
COOPERATIVE: "저는 모릅니다." (formal)
AGGRESSIVE: "몰라." (informal/rude)
```

### ❌ Wrong Word Count

**Wrong**:
```
Japanese (using English ranges): 40-80 words
```

**Right**:
```
Japanese (adjusted): 28-56 words (0.70 multiplier)
```

### ❌ Inconsistent Terminology

**Wrong**:
```
Example 1: "容疑者" (suspect)
Example 2: "被疑者" (suspect, different term)
```

**Right**:
```
All examples: "容疑者" (consistent term)
```

---

## Resources

### Translation Tools

- **DeepL**: High-quality machine translation (better than Google Translate)
- **Context.Reverso**: Idiomatic expressions and context
- **Linguee**: Bilingual concordance for technical terms
- **Native speaker forums**: Reddit, Discord, language exchange sites

### Quality Assurance

- **Grammarly** (English, limited other languages)
- **LanguageTool** (multilingual grammar checker)
- **Native speaker review** (essential!)

### Cultural Research

- **TV Tropes**: Character archetypes across cultures
- **Local crime dramas**: Authentic interrogation dialogue
- **Legal system research**: Country-specific legal terms

---

## Contribution Guidelines

### Submitting a New Language

1. **Fork the repository**
2. **Create language branch**: `git checkout -b add-language-ja`
3. **Add translation files**:
   - `PROMPT.[lang].md`
   - Update language configuration
   - Add quality criteria
   - Create 40 few-shot examples
4. **Test thoroughly**:
   - Run automated tests
   - Get native speaker review
   - Validate quality scores
5. **Submit pull request** with:
   - Translation files
   - Test results
   - Native speaker review confirmation
   - Word count multiplier justification

### Review Process

1. **Automated checks**: Grammar, word count, format
2. **Native speaker review**: Naturalness, cultural appropriateness
3. **Quality validation**: Compare scores with English baseline
4. **Integration testing**: Test in application
5. **Approval and merge**

---

## Support

For questions or help with translation:

1. Check this guide thoroughly
2. Review existing translations (English, Korean)
3. Ask in GitHub Discussions
4. Contact maintainers

---

## Appendix: Language Multiplier Reference

| Language | Code | Multiplier | Rationale |
|----------|------|------------|-----------|
| English | en | 1.0 | Baseline |
| Korean | ko | 0.75 | Agglutinative, compact |
| Japanese | ja | 0.70 | Similar to Korean |
| Chinese | zh | 0.60 | Character-based, very compact |
| Spanish | es | 1.1 | Slightly more verbose |
| French | fr | 1.15 | More verbose |
| German | de | 1.2 | Compound words, longer |
| Russian | ru | 0.85 | Case system, compact |
| Arabic | ar | 0.90 | Root-based, moderately compact |
| Portuguese | pt | 1.1 | Similar to Spanish |
| Italian | it | 1.1 | Similar to Spanish |
| Dutch | nl | 1.15 | Similar to German |

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-01-24  
**Status**: Active

**Made with ❤️ for creating authentic multilingual suspect characters**
