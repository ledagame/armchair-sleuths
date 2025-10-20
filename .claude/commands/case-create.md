---
description: 새로운 케이스 생성 (AI 프롬프트 + 케이스 생성 + 게임 디자인)
---

다음 스킬들을 모두 활용하여 새로운 케이스를 생성하세요:

## 활성화할 스킬

### 1. AI Prompt Engineer
@skills/ai-prompt-engineer/SKILL.md

### 2. Mystery Case Generator
@skills/mystery-case-generator/SKILL.md

### 3. Mystery Game Designer
@skills/mystery-game-designer/SKILL.md

## 작업 프로세스

1. **프롬프트 설계** (ai-prompt-engineer)
   - Few-shot learning templates 적용
   - Chain-of-thought prompting 구조화
   - Output validation 규칙 설정
   - Hallucination 방지 전략 적용

2. **케이스 생성** (mystery-case-generator)
   - 전체 케이스 생성 파이프라인 실행
   - 캐릭터, 증거, 타임라인 생성
   - Gemini API를 통한 콘텐츠 생성

3. **게임 밸런싱** (mystery-game-designer)
   - Fair Play 원칙 검증
   - 난이도 밸런싱 조정
   - Red herring 배치 최적화
   - Clue distribution 검증

## 검증 단계

생성 후 다음 검증 스크립트를 실행하세요:
```bash
npx tsx scripts/validate-case.ts --case-id [생성된-케이스-ID]
npx tsx scripts/test-difficulty.ts --case-id [생성된-케이스-ID]
npx tsx scripts/validate-fairplay.ts --case-id [생성된-케이스-ID]
```

## 기대 결과

- 고품질 프롬프트로 생성된 일관성 있는 케이스
- Fair Play 원칙을 준수하는 공정한 미스터리
- 적절한 난이도 밸런싱
- 플레이 가능한 완전한 케이스
