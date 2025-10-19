# Armchair Sleuths Skills Library

프로젝트에 통합된 전문 skill들의 모음입니다. 각 skill은 특정 영역에 특화되어 있으며, 필요할 때 자동으로 활성화됩니다.

## 🎯 Top 5 Skills (2025-01-20 추가)

### 1. AI Prompt Engineering Specialist
**위치**: `skills/ai-prompt-engineer/`
**특화 분야**: Gemini API 프롬프트 최적화, 케이스 생성 품질 개선
**사용 시점**:
- 케이스 품질 개선이 필요할 때
- 일관성 없는 AI 출력 문제
- Hallucination 방지

**핵심 기능**:
- Few-shot learning templates
- Chain-of-thought prompting
- Output validation
- Difficulty-adaptive prompts

**빠른 시작**:
```bash
npx tsx scripts/generate-case.ts --validate
npx tsx scripts/test-prompt-quality.ts
```

---

### 2. Frontend Architect
**위치**: `skills/frontend-architect/`
**특화 분야**: React 19 + Next.js 15 + shadcn/ui + Framer Motion
**사용 시점**:
- 새로운 UI 컴포넌트 생성
- 디자인 시스템 구축
- 애니메이션 추가

**핵심 기능**:
- Noir detective design tokens
- shadcn/ui 컴포넌트 패턴
- Framer Motion 애니메이션
- 반응형 디자인
- 접근성 (WCAG AA)

**빠른 시작**:
```typescript
// Design tokens 사용
import { tokens } from '@/styles/tokens';

// shadcn/ui 컴포넌트
import { CaseCard } from '@/components/case/CaseCard';
```

---

### 3. Murder Mystery Game Designer
**위치**: `skills/mystery-game-designer/`
**특화 분야**: 게임 메커닉, 난이도 밸런싱, Fair Play 원칙
**사용 시점**:
- 케이스 난이도 조정
- Red herring 설계
- 플롯 구조 개선

**핵심 기능**:
- Fair Play Mystery Rules
- 난이도 밸런싱 알고리즘
- 캐릭터 아키타입 시스템
- Clue distribution 패턴
- Progression & unlock 시스템

**빠른 시작**:
```bash
npx tsx scripts/validate-fairplay.ts --case-id case-2025-01-19
npx tsx scripts/test-difficulty.ts --generate 10
```

---

### 4. Devvit Community Builder
**위치**: `skills/devvit-community-builder/`
**특화 분야**: Reddit 커뮤니티 성장, 바이럴 메커닉
**사용 시점**:
- 일일 포스트 자동화
- 리더보드 구현
- 커뮤니티 참여 유도

**핵심 기능**:
- Viral loop design (K > 1.0)
- Daily post automation
- Devvit widgets
- Leaderboard with Redis
- User flair 시스템

**빠른 시작**:
```bash
npx tsx scripts/setup-daily-posts.ts
npx tsx scripts/init-leaderboard.ts --case-id case-2025-01-19
```

---

### 5. Viral Detective Challenge Creator
**위치**: `skills/viral-detective-challenge/`
**특화 분야**: 챌린지, 테마 이벤트, 토너먼트
**사용 시점**:
- 주간/월간 챌린지 기획
- 시즌 이벤트 (할로윈, 크리스마스)
- 경쟁 토너먼트

**핵심 기능**:
- Speed challenges (60초 챌린지)
- Themed events (Halloween, Christmas)
- Tournament brackets
- Limited-time exclusive cases
- Viral sharing mechanics

**빠른 시작**:
```bash
npx tsx scripts/create-speed-challenge.ts --time-limit 60
npx tsx scripts/launch-themed-event.ts --theme halloween
```

---

## 📚 기존 Skills

### Gemini Image Generator
**위치**: `skills/gemini-image-generator/`
**특화 분야**: AI 이미지 생성 (프로필, 씬)

### Mystery Case Generator
**위치**: `skills/mystery-case-generator/`
**특화 분야**: 전체 케이스 생성 파이프라인

### Suspect AI Prompter
**위치**: `skills/suspect-ai-prompter/`
**특화 분야**: 용의자 대화 최적화

---

## 🎯 Skill 사용 방법

### 자동 활성화
Claude Code가 작업 컨텍스트를 분석하여 자동으로 적절한 skill을 활성화합니다.

**예시**:
```
사용자: "케이스 품질을 높여줘"
→ ai-prompt-engineer skill 자동 활성화

사용자: "케이스 카드 컴포넌트 만들어줘"
→ frontend-architect skill 자동 활성화

사용자: "주간 챌린지 만들기"
→ viral-detective-challenge skill 자동 활성화
```

### 수동 지정
특정 skill을 명시적으로 요청할 수도 있습니다.

```
사용자: "@ai-prompt-engineer 프롬프트 최적화해줘"
```

---

## 📖 상세 문서

각 skill의 `SKILL.md` 파일에는 다음이 포함되어 있습니다:
- **Overview**: Skill 개요
- **When to Use**: 자동 활성화 트리거
- **Core Patterns**: 핵심 구현 패턴 (코드 포함)
- **Integration**: 프로젝트 통합 방법
- **Quick Start**: 즉시 사용 가능한 명령어
- **References**: 추가 참고 자료

---

## 🚀 빠른 참조

| 작업 | 사용할 Skill |
|------|-------------|
| 케이스 생성 품질 개선 | ai-prompt-engineer |
| UI 컴포넌트 생성 | frontend-architect |
| 난이도 밸런싱 | mystery-game-designer |
| 커뮤니티 기능 구축 | devvit-community-builder |
| 이벤트/챌린지 기획 | viral-detective-challenge |
| 이미지 생성 | gemini-image-generator |
| 전체 케이스 생성 | mystery-case-generator |
| 용의자 대화 최적화 | suspect-ai-prompter |

---

## 💡 Best Practices

1. **Skill 조합 사용**: 여러 skill을 함께 사용하면 시너지 효과
   - 예: `ai-prompt-engineer` + `mystery-game-designer` → 고품질 밸런스 케이스

2. **References 확인**: 각 skill의 `references/` 디렉토리에 상세 가이드 있음

3. **점진적 도입**: 한 번에 하나씩 skill 학습 후 적용

4. **검증 필수**: 생성 후 항상 검증 스크립트 실행
   - `validate-case.ts`
   - `test-difficulty.ts`
   - `validate-fairplay.ts`

---

## 📊 Skill 생성 이력

- **2025-01-20**: Top 5 skills 추가
  - ai-prompt-engineer
  - frontend-architect
  - mystery-game-designer
  - devvit-community-builder
  - viral-detective-challenge

- **2025-01-19**: 초기 skills 생성
  - gemini-image-generator
  - mystery-case-generator
  - suspect-ai-prompter

---

## 🤝 기여 방법

새로운 skill을 추가하려면:

1. `skills/` 디렉토리에 새 폴더 생성
2. `SKILL.md` 파일 작성 (기존 skill 참고)
3. YAML frontmatter 포함 (name, description)
4. 실용적인 코드 예제 포함
5. Quick Start 섹션 필수
6. 이 README 업데이트

---

**마지막 업데이트**: 2025-01-20
**총 Skill 수**: 8개
**프로젝트**: Armchair Sleuths - AI Murder Mystery Game
