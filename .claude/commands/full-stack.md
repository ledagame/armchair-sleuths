---
description: 전체 풀스택 작업 (모든 스킬 활성화)
---

프로젝트의 모든 스킬을 활용하여 풀스택 작업을 수행하세요:

## 활성화할 모든 스킬

### Core Skills
1. **AI Prompt Engineer** - @skills/ai-prompt-engineer/SKILL.md
2. **Frontend Architect** - @skills/frontend-architect/SKILL.md
3. **Mystery Game Designer** - @skills/mystery-game-designer/SKILL.md

### Community & Growth
4. **Devvit Community Builder** - @skills/devvit-community-builder/SKILL.md
5. **Viral Detective Challenge** - @skills/viral-detective-challenge/SKILL.md

### Content Generation
6. **Gemini Image Generator** - @skills/gemini-image-generator/SKILL.md
7. **Mystery Case Generator** - @skills/mystery-case-generator/SKILL.md
8. **Suspect AI Prompter** - @skills/suspect-ai-prompter/SKILL.md

### Additional Skill (if needed)
9. **Evidence System Architect** - @skills/evidence-system-architect/SKILL.md

## 전체 워크플로우

### 1. 케이스 생성 단계
```
[AI Prompt Engineer] → [Mystery Case Generator] → [Mystery Game Designer]
```
- 고품질 프롬프트 설계
- 전체 케이스 생성 (캐릭터, 증거, 타임라인)
- Fair Play 원칙 적용 및 밸런싱

### 2. 콘텐츠 강화 단계
```
[Gemini Image Generator] + [Suspect AI Prompter]
```
- 용의자 프로필 이미지 생성
- 씬 이미지 생성
- 용의자 대화 최적화

### 3. UI/UX 구현 단계
```
[Frontend Architect]
```
- React 19 + Next.js 15 컴포넌트
- shadcn/ui + Framer Motion
- Noir detective 디자인 시스템
- 반응형 & 접근성

### 4. 커뮤니티 & 성장 단계
```
[Devvit Community Builder] + [Viral Detective Challenge]
```
- Devvit 위젯 구현
- 리더보드 시스템
- 챌린지 & 이벤트
- Viral loop 메커니즘

## 작업 순서 (권장)

### Phase 1: Foundation (1-2일)
1. AI 프롬프트 설계 및 최적화
2. 케이스 생성 파이프라인 구축
3. 게임 밸런싱 시스템

### Phase 2: Content (2-3일)
1. 이미지 생성 시스템 구현
2. 용의자 대화 시스템
3. 케이스 콘텐츠 생성 (5-10개)

### Phase 3: Frontend (3-4일)
1. 디자인 시스템 구축
2. 핵심 UI 컴포넌트
3. 케이스 뷰어 & 플레이 흐름
4. 반응형 & 애니메이션

### Phase 4: Community (2-3일)
1. Devvit 통합
2. 리더보드 & 챌린지
3. 소셜 기능
4. Viral mechanics

### Phase 5: Polish (1-2일)
1. QA & 테스팅
2. 성능 최적화
3. 접근성 개선
4. 문서화

## 전체 검증 체크리스트

### 케이스 품질
- [ ] Fair Play 원칙 준수
- [ ] 난이도 밸런싱 적절
- [ ] 일관성 있는 스토리
- [ ] 충분한 단서 제공
- [ ] Red herring 적절히 배치

### 기술 품질
- [ ] 타입 안정성 (TypeScript)
- [ ] 테스트 커버리지 > 80%
- [ ] 번들 사이즈 최적화
- [ ] Core Web Vitals 통과
- [ ] 접근성 WCAG AA

### 커뮤니티 준비
- [ ] Devvit 위젯 동작
- [ ] 리더보드 실시간 업데이트
- [ ] 챌린지 시스템 작동
- [ ] 소셜 공유 기능
- [ ] Viral loop 메트릭 추적

### 배포 준비
- [ ] 환경 변수 설정
- [ ] API 키 보안
- [ ] 에러 모니터링
- [ ] 로깅 시스템
- [ ] 백업 & 복구 계획

## 전체 명령어 모음

```bash
# 케이스 생성
npx tsx scripts/generate-case.ts --validate

# 이미지 생성
npx tsx scripts/generate-images.ts --case-id [ID]

# 검증
npx tsx scripts/validate-case.ts --case-id [ID]
npx tsx scripts/test-difficulty.ts --case-id [ID]
npx tsx scripts/validate-fairplay.ts --case-id [ID]
npx tsx scripts/test-prompt-quality.ts

# 커뮤니티
npx tsx scripts/setup-daily-posts.ts
npx tsx scripts/init-leaderboard.ts --case-id [ID]
npx tsx scripts/create-speed-challenge.ts --time-limit 60

# 빌드 & 배포
npm run build
npm run test
devvit upload
```

## 스킬 시너지 효과

### 최고의 조합들
1. **케이스 품질** = AI Prompt + Mystery Generator + Game Designer
2. **시각적 완성도** = Gemini Images + Frontend Architect
3. **커뮤니티 성장** = Devvit Builder + Viral Challenge
4. **전체 경험** = 모든 스킬 조합

### 상호보완 관계
- AI Prompt Engineer ↔ Mystery Case Generator (품질 향상)
- Frontend Architect ↔ Devvit Builder (UI 일관성)
- Game Designer ↔ Viral Challenge (참여도 향상)
- Suspect Prompter ↔ Gemini Images (캐릭터 일관성)

## 성공 지표

### 케이스 품질
- Fair Play 검증 통과율 > 95%
- 난이도 분포 균형 (Easy:Medium:Hard = 3:5:2)
- 플레이어 완료율 > 60%

### 기술 성능
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Lighthouse Score > 90

### 커뮤니티 성장
- K-factor > 1.0
- D1 retention > 40%
- D7 retention > 20%
- Daily active users 지속 증가

## 기대 결과

완전히 기능하는 AI 기반 미스터리 게임 플랫폼:
- 고품질 케이스 콘텐츠
- 매력적인 UI/UX
- 활발한 커뮤니티
- 바이럴 성장 잠재력
- 확장 가능한 아키텍처
