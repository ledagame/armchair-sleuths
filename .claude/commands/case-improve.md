---
description: 기존 케이스 개선 (AI 프롬프트 + 게임 디자인 + 프론트엔드)
---

다음 스킬들을 모두 활용하여 기존 케이스를 개선하세요:

## 활성화할 스킬

### 1. AI Prompt Engineer
@skills/ai-prompt-engineer/SKILL.md

### 2. Mystery Game Designer
@skills/mystery-game-designer/SKILL.md

### 3. Frontend Architect
@skills/frontend-architect/SKILL.md

## 작업 프로세스

1. **현재 상태 분석**
   - 기존 케이스의 품질 지표 확인
   - 플레이어 피드백 분석
   - 난이도 및 밸런스 평가

2. **프롬프트 최적화** (ai-prompt-engineer)
   - 일관성 없는 출력 개선
   - Hallucination 방지 강화
   - Few-shot examples 업데이트
   - Validation 규칙 강화

3. **게임 밸런싱** (mystery-game-designer)
   - 난이도 곡선 조정
   - Red herring 재배치
   - Fair Play 원칙 적용
   - Clue visibility 최적화
   - Progression 흐름 개선

4. **UI/UX 개선** (frontend-architect)
   - 케이스 카드 컴포넌트 업데이트
   - Noir detective 디자인 토큰 적용
   - Framer Motion 애니메이션 추가
   - 반응형 디자인 최적화
   - 접근성 개선 (WCAG AA)

## 검증 단계

개선 후 다음을 확인하세요:
```bash
# 케이스 품질 검증
npx tsx scripts/validate-case.ts --case-id [케이스-ID]

# 난이도 테스트
npx tsx scripts/test-difficulty.ts --case-id [케이스-ID]

# Fair Play 검증
npx tsx scripts/validate-fairplay.ts --case-id [케이스-ID]

# 프롬프트 품질 테스트
npx tsx scripts/test-prompt-quality.ts --case-id [케이스-ID]
```

## UI 개선 체크리스트

- [ ] Design tokens 적용
- [ ] shadcn/ui 컴포넌트 사용
- [ ] Framer Motion 애니메이션
- [ ] 모바일 반응형 확인
- [ ] 접근성 테스트 (키보드 네비게이션, 스크린 리더)
- [ ] 로딩 상태 처리
- [ ] 에러 상태 처리

## 기대 결과

- 향상된 케이스 품질과 일관성
- 더 나은 게임 밸런스
- 개선된 UI/UX
- 높은 플레이어 만족도
