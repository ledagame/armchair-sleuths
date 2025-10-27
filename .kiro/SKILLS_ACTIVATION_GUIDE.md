# Skills Activation Guide / 스킬 활성화 가이드

**Last Updated**: 2025-01-23  
**Version**: 1.0.0  
**Status**: Active

---

## Table of Contents / 목차

1. [Overview / 개요](#overview--개요)
2. [How Skills Work / 스킬 작동 방식](#how-skills-work--스킬-작동-방식)
3. [All Skill Triggers / 모든 스킬 트리거](#all-skill-triggers--모든-스킬-트리거)
4. [Testing Skills / 스킬 테스트](#testing-skills--스킬-테스트)
5. [Adding New Skills / 새 스킬 추가하기](#adding-new-skills--새-스킬-추가하기)

---

## Overview / 개요

### English

This project uses Claude Skills pattern for AI-powered development workflows. Skills are automatically activated when you mention trigger keywords in your messages to the AI assistant.

**Current Status**: ✅ Fully Operational

Skills are located in the `skills/` directory and are automatically discovered and activated through the Kiro IDE steering system.

### 한국어

이 프로젝트는 AI 기반 개발 워크플로우를 위해 Claude Skills 패턴을 사용합니다. AI 어시스턴트에게 메시지를 보낼 때 트리거 키워드를 언급하면 스킬이 자동으로 활성화됩니다.

**현재 상태**: ✅ 완전 작동 중

스킬은 `skills/` 디렉토리에 위치하며 Kiro IDE steering 시스템을 통해 자동으로 발견되고 활성화됩니다.

---

## How Skills Work / 스킬 작동 방식

### English

**Activation Process**:

```
User Input
    ↓
Keyword Detection (automatic)
    ↓
Skill Identification
    ↓
Load SKILL.md file
    ↓
Activate Skill Context
    ↓
🎯 Display "Skill Activated: [skill-name]"
    ↓
Provide skill-based response
```

**What Happens When a Skill Activates**:
1. AI reads the skill's `SKILL.md` file
2. AI loads skill capabilities and knowledge
3. AI provides specialized guidance based on skill context
4. AI suggests relevant npm scripts if available

### 한국어

**활성화 프로세스**:

```
사용자 입력
    ↓
키워드 감지 (자동)
    ↓
스킬 식별
    ↓
SKILL.md 파일 로드
    ↓
스킬 컨텍스트 활성화
    ↓
🎯 "Skill Activated: [스킬명]" 표시
    ↓
스킬 기반 응답 제공
```

**스킬이 활성화되면 일어나는 일**:
1. AI가 스킬의 `SKILL.md` 파일을 읽습니다
2. AI가 스킬 기능과 지식을 로드합니다
3. AI가 스킬 컨텍스트를 기반으로 전문적인 가이드를 제공합니다
4. AI가 사용 가능한 npm 스크립트를 제안합니다

---

## All Skill Triggers / 모든 스킬 트리거

### 🎮 Game Development Skills / 게임 개발 스킬

#### 1. mystery-case-generator

**English Triggers**:
- "generate case"
- "create case"
- "new case"
- "daily case"
- "case generation"
- "deploy case"
- "validate case"
- "case with images"

**한국어 트리거**:
- "케이스 생성"
- "케이스 만들기"
- "새 케이스"
- "오늘의 케이스"
- "케이스 배포"
- "케이스 검증"
- "이미지 포함 케이스"

**Available Commands**:
```bash
npm run case:generate              # Generate basic case
npm run case:generate:images       # Generate case with images
npm run case:validate              # Validate case integrity
```

**Purpose**: Automate complete murder mystery case generation pipeline

---

#### 2. suspect-ai-prompter

**English Triggers**:
- "improve prompt"
- "optimize suspect"
- "test suspect"
- "validate suspect"

**한국어 트리거**:
- "프롬프트 개선"
- "용의자 최적화"
- "용의자 테스트"
- "용의자 검증"

**Available Commands**:
```bash
npm run suspect:improve-prompt     # Improve PROMPT.md
npm run suspect:test               # Test suspect responses
npm run suspect:validate           # Validate prompt quality
npm run suspect:add-archetype      # Add new archetype
```

**Purpose**: Optimize AI suspect conversation prompts

---

#### 3. gemini-image-generator

**English Triggers**:
- "generate image"
- "create image"
- "image generation"
- "portrait"
- "scene image"

**한국어 트리거**:
- "이미지 생성"
- "이미지 만들기"
- "초상화"
- "장면 이미지"

**Purpose**: Generate film noir style images for suspects and scenes

---

### 🏗️ Architecture & Design Skills / 아키텍처 & 디자인 스킬

#### 4. evidence-system-architect

**English Triggers**:
- "evidence system"
- "clue design"
- "fair play"
- "gumshoe principle"

**한국어 트리거**:
- "증거 시스템"
- "단서 디자인"
- "페어 플레이"
- "검슈 원칙"

**Purpose**: Design and implement evidence/clue systems

---

#### 5. frontend-architect

**English Triggers**:
- "frontend design"
- "ui architecture"
- "component design"
- "react structure"

**한국어 트리거**:
- "프론트엔드 디자인"
- "UI 아키텍처"
- "컴포넌트 디자인"
- "리액트 구조"

**Purpose**: Design frontend architecture and components

---

#### 6. mystery-game-designer

**English Triggers**:
- "game design"
- "mystery mechanics"
- "player experience"
- "game balance"

**한국어 트리거**:
- "게임 디자인"
- "미스터리 메커니즘"
- "플레이어 경험"
- "게임 밸런스"

**Purpose**: Design mystery game mechanics and player experience

---

### 🛠️ Development Tools / 개발 도구 스킬

#### 7. ai-prompt-engineer

**English Triggers**:
- "optimize prompt"
- "improve ai"
- "prompt engineering"
- "llm optimization"

**한국어 트리거**:
- "프롬프트 최적화"
- "AI 개선"
- "프롬프트 엔지니어링"
- "LLM 최적화"

**Purpose**: Optimize AI prompts and LLM interactions

---

#### 8. elite-debugging-master

**English Triggers**:
- "debug error"
- "fix bug"
- "troubleshoot"
- "error analysis"

**한국어 트리거**:
- "에러 디버그"
- "버그 수정"
- "문제 해결"
- "에러 분석"

**Purpose**: Advanced debugging and error resolution

---

#### 9. implementation-guardian

**English Triggers**:
- "code review"
- "implementation check"
- "quality assurance"
- "best practices"

**한국어 트리거**:
- "코드 리뷰"
- "구현 체크"
- "품질 보증"
- "베스트 프랙티스"

**Purpose**: Ensure code quality and best practices

---

### 📱 Community & Engagement / 커뮤니티 & 참여 스킬

#### 10. devvit-community-builder

**English Triggers**:
- "community engagement"
- "reddit strategy"
- "user growth"
- "viral content"

**한국어 트리거**:
- "커뮤니티 참여"
- "레딧 전략"
- "사용자 성장"
- "바이럴 콘텐츠"

**Purpose**: Build and engage Reddit community

---

#### 11. viral-detective-challenge

**English Triggers**:
- "viral challenge"
- "detective challenge"
- "social campaign"
- "engagement boost"

**한국어 트리거**:
- "바이럴 챌린지"
- "탐정 챌린지"
- "소셜 캠페인"
- "참여 증대"

**Purpose**: Create viral detective challenges

---

## Testing Skills / 스킬 테스트

### English

**Quick Test Examples**:

1. **Generate a case**:
   ```
   Input: "Generate a new case with images"
   Expected: mystery-case-generator activates
   ```

2. **Improve prompts**:
   ```
   Input: "I want to improve the suspect prompts"
   Expected: suspect-ai-prompter activates
   ```

3. **Debug an error**:
   ```
   Input: "I'm getting an error when generating images"
   Expected: elite-debugging-master activates
   ```

4. **Design evidence**:
   ```
   Input: "I want to design evidence following Fair Play principles"
   Expected: evidence-system-architect activates
   ```

**Demo Script**:
```bash
npx tsx .kiro/skills-system/demo-skill-activation.ts
```

**Demo Commands**:
- `activate improve prompt` - Activates suspect-ai-prompter
- `activate generate case` - Activates mystery-case-generator
- `activate debug error` - Activates elite-debugging-master
- `list` - List all skills
- `active` - Show active skills
- `stats` - Show skill statistics

### 한국어

**빠른 테스트 예시**:

1. **케이스 생성**:
   ```
   입력: "이미지와 함께 새 케이스 생성해줘"
   예상: mystery-case-generator 활성화
   ```

2. **프롬프트 개선**:
   ```
   입력: "용의자 프롬프트를 개선하고 싶어"
   예상: suspect-ai-prompter 활성화
   ```

3. **에러 디버깅**:
   ```
   입력: "이미지 생성 중 에러가 발생해"
   예상: elite-debugging-master 활성화
   ```

4. **증거 디자인**:
   ```
   입력: "Fair Play 원칙에 맞는 증거를 디자인하고 싶어"
   예상: evidence-system-architect 활성화
   ```

**데모 스크립트**:
```bash
npx tsx .kiro/skills-system/demo-skill-activation.ts
```

**데모 명령어**:
- `activate improve prompt` - suspect-ai-prompter 활성화
- `activate generate case` - mystery-case-generator 활성화
- `activate debug error` - elite-debugging-master 활성화
- `list` - 모든 스킬 목록
- `active` - 활성화된 스킬 표시
- `stats` - 스킬 통계 표시

---

## Adding New Skills / 새 스킬 추가하기

### English

When you create a new skill and want it to be automatically activated, follow these steps:

#### Step 1: Create Skill Directory Structure

```bash
skills/
└── my-new-skill/
    ├── SKILL.md          # Required: AI reads this
    ├── SKILL.yaml        # Required: Metadata and triggers
    ├── PROMPT.md         # Optional: AI prompt templates
    ├── README.md         # Optional: Documentation
    └── scripts/          # Optional: Automation scripts
        └── run.ts
```

#### Step 2: Create SKILL.yaml with Triggers

```yaml
# skills/my-new-skill/SKILL.yaml
name: my-new-skill
version: 1.0.0
description: |
  Brief description of what this skill does

author: Your Name
license: MIT

# IMPORTANT: Define trigger keywords
triggers:
  - "my trigger"
  - "another trigger"
  - "skill activation keyword"

# Dependencies (optional)
dependencies:
  skills:
    - other-skill-name
  apis:
    - api-name
  packages:
    - npm-package-name

# Capabilities
capabilities:
  - name: capability-name
    description: What this capability does
    usage: How to use it

# npm scripts (optional)
npm_scripts:
  my-skill:run: "tsx scripts/run.ts"
  my-skill:test: "tsx scripts/test.ts"
```

#### Step 3: Create SKILL.md Documentation

```markdown
# My New Skill

## Overview

Describe what this skill does and when to use it.

## When to Use This Skill

**This skill should be used when:**
- Scenario 1
- Scenario 2
- Scenario 3

## Quick Start

### Basic Usage

\`\`\`bash
npm run my-skill:run
\`\`\`

### Advanced Usage

\`\`\`bash
npm run my-skill:run --option value
\`\`\`

## Integration with Project

Explain how this skill integrates with the project.

## Examples

Provide usage examples.
```

#### Step 4: Update Steering File

Add your new skill to `.kiro/steering/skills-integration.md`:

```markdown
#### my-new-skill
**Triggers**: "my trigger", "another trigger", "skill activation keyword"
**Purpose**: Brief description
**Capabilities**:
- Capability 1
- Capability 2

**Usage Example**:
\`\`\`
User: "Use my trigger"
→ Activates my-new-skill
→ Runs: npm run my-skill:run
\`\`\`
```

#### Step 5: Add npm Scripts to package.json

```json
{
  "scripts": {
    "my-skill:run": "tsx skills/my-new-skill/scripts/run.ts",
    "my-skill:test": "tsx skills/my-new-skill/scripts/test.ts"
  }
}
```

#### Step 6: Test Activation

1. **Restart Kiro IDE** (to reload steering files)
2. **Test in chat**:
   ```
   Input: "Use my trigger"
   Expected: AI activates my-new-skill and reads SKILL.md
   ```

3. **Verify with demo script**:
   ```bash
   npx tsx .kiro/skills-system/demo-skill-activation.ts
   # Type: activate my trigger
   ```

---

### 한국어

새 스킬을 만들고 자동으로 활성화되도록 하려면 다음 단계를 따르세요:

#### 1단계: 스킬 디렉토리 구조 생성

```bash
skills/
└── my-new-skill/
    ├── SKILL.md          # 필수: AI가 읽음
    ├── SKILL.yaml        # 필수: 메타데이터 및 트리거
    ├── PROMPT.md         # 선택: AI 프롬프트 템플릿
    ├── README.md         # 선택: 문서
    └── scripts/          # 선택: 자동화 스크립트
        └── run.ts
```

#### 2단계: 트리거가 포함된 SKILL.yaml 생성

```yaml
# skills/my-new-skill/SKILL.yaml
name: my-new-skill
version: 1.0.0
description: |
  이 스킬이 하는 일에 대한 간단한 설명

author: 작성자 이름
license: MIT

# 중요: 트리거 키워드 정의
triggers:
  - "내 트리거"
  - "다른 트리거"
  - "스킬 활성화 키워드"

# 의존성 (선택사항)
dependencies:
  skills:
    - other-skill-name
  apis:
    - api-name
  packages:
    - npm-package-name

# 기능
capabilities:
  - name: capability-name
    description: 이 기능이 하는 일
    usage: 사용 방법

# npm 스크립트 (선택사항)
npm_scripts:
  my-skill:run: "tsx scripts/run.ts"
  my-skill:test: "tsx scripts/test.ts"
```

#### 3단계: SKILL.md 문서 생성

```markdown
# My New Skill

## 개요

이 스킬이 무엇을 하는지, 언제 사용하는지 설명합니다.

## 이 스킬을 사용해야 하는 경우

**다음과 같은 경우 이 스킬을 사용하세요:**
- 시나리오 1
- 시나리오 2
- 시나리오 3

## 빠른 시작

### 기본 사용법

\`\`\`bash
npm run my-skill:run
\`\`\`

### 고급 사용법

\`\`\`bash
npm run my-skill:run --option value
\`\`\`

## 프로젝트 통합

이 스킬이 프로젝트와 어떻게 통합되는지 설명합니다.

## 예시

사용 예시를 제공합니다.
```

#### 4단계: Steering 파일 업데이트

`.kiro/steering/skills-integration.md`에 새 스킬 추가:

```markdown
#### my-new-skill
**트리거**: "내 트리거", "다른 트리거", "스킬 활성화 키워드"
**목적**: 간단한 설명
**기능**:
- 기능 1
- 기능 2

**사용 예시**:
\`\`\`
사용자: "내 트리거 사용"
→ my-new-skill 활성화
→ 실행: npm run my-skill:run
\`\`\`
```

#### 5단계: package.json에 npm 스크립트 추가

```json
{
  "scripts": {
    "my-skill:run": "tsx skills/my-new-skill/scripts/run.ts",
    "my-skill:test": "tsx skills/my-new-skill/scripts/test.ts"
  }
}
```

#### 6단계: 활성화 테스트

1. **Kiro IDE 재시작** (steering 파일 다시 로드)
2. **채팅에서 테스트**:
   ```
   입력: "내 트리거 사용"
   예상: AI가 my-new-skill을 활성화하고 SKILL.md를 읽음
   ```

3. **데모 스크립트로 확인**:
   ```bash
   npx tsx .kiro/skills-system/demo-skill-activation.ts
   # 입력: activate 내 트리거
   ```

---

## Troubleshooting / 문제 해결

### English

#### Problem 1: Skill Not Activating

**Symptoms**: You mention trigger keywords but the skill doesn't activate

**Solutions**:
1. **Check trigger keywords**: Verify keywords in `skills/[skill-name]/SKILL.yaml`
2. **Restart Kiro IDE**: Steering files are loaded on startup
3. **Check steering file**: Ensure skill is listed in `.kiro/steering/skills-integration.md`
4. **Verify file structure**: Ensure `SKILL.md` and `SKILL.yaml` exist

#### Problem 2: Wrong Skill Activates

**Symptoms**: Different skill activates than expected

**Solutions**:
1. **Check for keyword overlap**: Multiple skills may share similar triggers
2. **Use more specific keywords**: Add unique triggers to your skill
3. **Check trigger priority**: First matching skill activates

#### Problem 3: Skill Activates But No Context

**Symptoms**: Skill activates but AI doesn't have skill knowledge

**Solutions**:
1. **Check SKILL.md exists**: AI reads this file for context
2. **Verify file content**: Ensure SKILL.md has proper documentation
3. **Check file permissions**: Ensure files are readable

### 한국어

#### 문제 1: 스킬이 활성화되지 않음

**증상**: 트리거 키워드를 언급했지만 스킬이 활성화되지 않음

**해결 방법**:
1. **트리거 키워드 확인**: `skills/[스킬명]/SKILL.yaml`에서 키워드 확인
2. **Kiro IDE 재시작**: Steering 파일은 시작 시 로드됨
3. **Steering 파일 확인**: `.kiro/steering/skills-integration.md`에 스킬이 나열되어 있는지 확인
4. **파일 구조 확인**: `SKILL.md`와 `SKILL.yaml`이 존재하는지 확인

#### 문제 2: 잘못된 스킬이 활성화됨

**증상**: 예상과 다른 스킬이 활성화됨

**해결 방법**:
1. **키워드 중복 확인**: 여러 스킬이 유사한 트리거를 공유할 수 있음
2. **더 구체적인 키워드 사용**: 스킬에 고유한 트리거 추가
3. **트리거 우선순위 확인**: 첫 번째로 일치하는 스킬이 활성화됨

#### 문제 3: 스킬은 활성화되지만 컨텍스트가 없음

**증상**: 스킬이 활성화되지만 AI가 스킬 지식을 가지고 있지 않음

**해결 방법**:
1. **SKILL.md 존재 확인**: AI가 이 파일을 읽어 컨텍스트를 얻음
2. **파일 내용 확인**: SKILL.md에 적절한 문서가 있는지 확인
3. **파일 권한 확인**: 파일을 읽을 수 있는지 확인

---

## Best Practices / 모범 사례

### English

1. **Use Unique Triggers**: Choose keywords that don't overlap with other skills
2. **Document Thoroughly**: Write clear SKILL.md with examples
3. **Test Before Committing**: Always test skill activation before pushing
4. **Keep Triggers Simple**: Use common, natural language phrases
5. **Update Steering File**: Always update `.kiro/steering/skills-integration.md`
6. **Version Your Skills**: Use semantic versioning in SKILL.yaml
7. **Add Examples**: Include real usage examples in documentation

### 한국어

1. **고유한 트리거 사용**: 다른 스킬과 겹치지 않는 키워드 선택
2. **철저한 문서화**: 예시가 포함된 명확한 SKILL.md 작성
3. **커밋 전 테스트**: 푸시하기 전에 항상 스킬 활성화 테스트
4. **트리거를 단순하게 유지**: 일반적이고 자연스러운 언어 구문 사용
5. **Steering 파일 업데이트**: 항상 `.kiro/steering/skills-integration.md` 업데이트
6. **스킬 버전 관리**: SKILL.yaml에서 시맨틱 버저닝 사용
7. **예시 추가**: 문서에 실제 사용 예시 포함

---

## Quick Reference / 빠른 참조

### File Locations / 파일 위치

```
skills/                              # All skills
├── [skill-name]/
│   ├── SKILL.md                    # AI reads this (required)
│   ├── SKILL.yaml                  # Metadata & triggers (required)
│   ├── PROMPT.md                   # AI templates (optional)
│   └── scripts/                    # Automation (optional)

.kiro/
├── steering/
│   └── skills-integration.md       # Skill registry for AI
└── skills-system/
    ├── core/                       # Skill system core
    ├── ui/                         # UI components
    └── demo-skill-activation.ts    # Test script
```

### Key Commands / 주요 명령어

```bash
# Test skill system
npx tsx .kiro/skills-system/demo-skill-activation.ts

# Generate case
npm run case:generate:images

# Improve prompts
npm run suspect:improve-prompt

# Validate case
npm run case:validate
```

---

## Support / 지원

### English

For issues or questions:
1. Check this guide first
2. Review skill documentation in `skills/[skill-name]/SKILL.md`
3. Test with demo script: `npx tsx .kiro/skills-system/demo-skill-activation.ts`
4. Check `.kiro/steering/skills-integration.md` for skill registry

### 한국어

문제나 질문이 있는 경우:
1. 먼저 이 가이드를 확인하세요
2. `skills/[스킬명]/SKILL.md`에서 스킬 문서를 검토하세요
3. 데모 스크립트로 테스트: `npx tsx .kiro/skills-system/demo-skill-activation.ts`
4. 스킬 레지스트리는 `.kiro/steering/skills-integration.md`를 확인하세요

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-01-23  
**Maintained By**: Armchair Sleuths Team  
**Status**: Active & Maintained
