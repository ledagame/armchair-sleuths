# Compounding Engineering Master Usage Guide
# 컴파운딩 엔지니어링 마스터 사용 가이드

**Version**: 1.0  
**Last Updated**: 2025-01-14  
**Status**: Production Ready

---

## 📚 Table of Contents / 목차

### English
1. [Quick Start](#quick-start)
2. [System Overview](#system-overview)
3. [File Structure](#file-structure)
4. [Hook Usage](#hook-usage)
5. [Reviewer System](#reviewer-system)
6. [Learning System](#learning-system)
7. [Workflow Guide](#workflow-guide)
8. [Troubleshooting](#troubleshooting)

### 한국어
1. [빠른 시작](#빠른-시작-korean)
2. [시스템 개요](#시스템-개요-korean)
3. [파일 구조](#파일-구조-korean)
4. [Hook 사용법](#hook-사용법-korean)
5. [리뷰어 시스템](#리뷰어-시스템-korean)
6. [학습 시스템](#학습-시스템-korean)
7. [워크플로우 가이드](#워크플로우-가이드-korean)
8. [문제 해결](#문제-해결-korean)

---

## Quick Start

### Step 1: Enable Hooks
1. Open Kiro IDE
2. Navigate to **Agent Hooks** section
3. Enable these 4 hooks:
   - ✅ `assess-on-save.kiro.hook`
   - ✅ `assess-on-task-complete.kiro.hook`
   - ✅ `codify-on-project-complete.kiro.hook`
   - ✅ `enhance-spec.kiro.hook`

### Step 2: Start Your First Project
```
User: "Create a user authentication system spec"
```

Kiro will automatically:
- Reference past learnings from `.kiro/steering/learnings/`
- Apply success patterns from `.kiro/steering/patterns/`
- Generate an enhanced spec with security, testing, and best practices

### Step 3: Develop with Auto-Validation
- **On file save**: `assess-on-save` hook validates your code
- **On task complete**: `assess-on-task-complete` hook runs multi-review
- **On project complete**: `codify-on-project-complete` hook extracts learnings

### Step 4: See the Compounding Effect
- **Project 1**: 40 hours, 15 issues
- **Project 2**: 28 hours (-30%), 8 issues (-47%)
- **Project 3**: 20 hours (-50%), 3 issues (-80%)

---

## System Overview

### What is Compounding Engineering?

**English**: A development methodology where each project makes the next project easier through systematic learning capture and application.

**한국어**: 각 프로젝트가 다음 프로젝트를 더 쉽게 만드는 개발 방법론으로, 체계적인 학습 캡처와 적용을 통해 복리 효과를 만듭니다.

### The 4-Phase Cycle

```
Plan → Delegate → Assess → Codify → (repeat)
계획 → 실행 → 검증 → 학습 → (반복)
```

1. **Plan (계획)**: Create specs with past learnings auto-applied
2. **Delegate (실행)**: Execute tasks with verified patterns
3. **Assess (검증)**: Auto-validate with 4 expert reviewers
4. **Codify (학습)**: Extract and record learnings automatically

---

## File Structure

### Complete System Architecture

```
.kiro/
├── hooks/                          # 자동화 Hooks
│   ├── assess-on-save.kiro.hook           # 파일 저장 시 자동 리뷰
│   ├── assess-on-task-complete.kiro.hook  # Task 완료 시 Multi-Review
│   ├── codify-on-project-complete.kiro.hook # 프로젝트 완료 시 학습 추출
│   ├── enhance-spec.kiro.hook             # Spec 생성 시 학습 적용
│   └── README.md                          # Hook 시스템 설명
│
├── steering/
│   ├── compounding/               # 핵심 철학 & 워크플로우
│   │   ├── 00-philosophy.md              # 컴파운딩 철학
│   │   ├── 01-workflow.md                # 상세 워크플로우
│   │   ├── 02-metrics.md                 # 메트릭 시스템
│   │   └── IMPLEMENTATION-COMPLETE.md    # 구현 완료 보고서
│   │
│   ├── reviewers/                 # 4명의 전문 리뷰어
│   │   ├── security-reviewer.md          # 보안 전문가
│   │   ├── performance-reviewer.md       # 성능 전문가
│   │   ├── architecture-reviewer.md      # 아키텍처 전문가
│   │   └── code-quality-reviewer.md      # 코드 품질 전문가
│   │
│   ├── learnings/                 # 프로젝트 학습 내용
│   │   ├── README.md                     # 학습 시스템 설명
│   │   ├── learning-template.md          # 학습 파일 템플릿
│   │   └── YYYY-MM-DD-project-name.md    # 실제 학습 파일들
│   │
│   ├── patterns/                  # 성공/실패 패턴
│   │   ├── successful-patterns.md        # 성공 패턴 모음
│   │   └── anti-patterns.md              # 피해야 할 패턴
│   │
│   └── MASTER-USAGE-GUIDE.md      # 이 파일 (마스터 가이드)
```

### Key Files Explained / 주요 파일 설명

#### Hooks (자동화)
- **Purpose**: Automate the Assess and Codify phases
- **목적**: Assess와 Codify 단계를 자동화
- **Format**: JSON (`.kiro.hook` extension)

#### Reviewers (검증 전문가)
- **Purpose**: Validate code from multiple expert perspectives
- **목적**: 여러 전문가 관점에서 코드 검증
- **Format**: Markdown with checklists

#### Learnings (학습 기록)
- **Purpose**: Capture and reuse project learnings
- **목적**: 프로젝트 학습 내용 캡처 및 재사용
- **Format**: Markdown with YAML frontmatter

#### Patterns (패턴 모음)
- **Purpose**: Document what works and what doesn't
- **목적**: 효과적인 것과 그렇지 않은 것 문서화
- **Format**: Markdown with code examples

---

## Hook Usage

### 1. assess-on-save.kiro.hook

**Trigger**: Automatically when you save a file  
**트리거**: 파일 저장 시 자동 실행

**What it does**:
- Runs Security, Performance, and Code Quality checks
- Provides immediate feedback
- Suggests auto-fixes

**Example Output**:
```
✅ Assess on Save: All checks passed
   - Security: ✅ No issues
   - Performance: ✅ No issues
   - Code Quality: ✅ No issues
```

Or if issues found:
```
🚨 Assess on Save: Issues found

Security Issues:
⚠️ Line 42: API key hardcoded
   Fix: Move to environment variable
```

**How to use**:
1. Enable in Kiro IDE → Agent Hooks
2. Write code normally
3. Save file
4. Review feedback automatically

### 2. assess-on-task-complete.kiro.hook

**Trigger**: Manual - when you declare task complete  
**트리거**: 수동 - Task 완료 선언 시

**What it does**:
- Runs all 4 reviewers simultaneously (Security, Performance, Architecture, Code Quality)
- Provides comprehensive multi-review report
- Prioritizes issues by severity

**How to use**:
```
User: "Task 1 complete. Please review."
```

**Example Output**:
```markdown
# Task 1 Multi-Review Results

## 🔒 Security Review
✅ **Passed** - No security issues

## ⚡ Performance Review
⚠️ **Issues Found** (1)
1. **High**: N+1 query detected
   - Location: src/api/users.ts:45
   - Fix: Use JOIN or eager loading

## 🏗️ Architecture Review
✅ **Passed** - Follows patterns

## 📝 Code Quality Review
✅ **Passed** - Code quality good

---

## 📈 Overall Assessment
- **Critical Issues**: 0
- **High Issues**: 1 → Fix before next task
- **Medium Issues**: 0
```

### 3. codify-on-project-complete.kiro.hook

**Trigger**: Manual - when project is complete  
**트리거**: 수동 - 프로젝트 완료 시

**What it does**:
- Extracts success patterns from the project
- Analyzes issues encountered
- Records metrics (time, issues, improvements)
- Auto-updates reviewer checklists
- Creates learning file in `.kiro/steering/learnings/`

**How to use**:
```
User: "Project is complete. Please record learnings."
```

**What gets created**:
- New file: `.kiro/steering/learnings/2025-01-14-your-project.md`
- Updated: Security/Performance reviewer checklists
- Updated: Successful patterns list

### 4. enhance-spec.kiro.hook

**Trigger**: Automatic when creating specs  
**트리거**: Spec 생성 시 자동

**What it does**:
- Searches for similar past projects
- Auto-injects relevant learnings
- Adds security, testing, and performance requirements
- Suggests proven architecture patterns

**How to use**:
```
User: "Create a payment system spec"
```

Kiro automatically:
1. Searches `.kiro/steering/learnings/` for payment-related projects
2. References `.kiro/steering/patterns/successful-patterns.md`
3. Generates enhanced spec with auto-added requirements

---

## Reviewer System

### The 4 Expert Reviewers / 4명의 전문 리뷰어

#### 1. Security Reviewer (보안 전문가)

**Focus Areas**:
- Authentication & Authorization (인증 & 권한)
- CSRF, XSS, SQL Injection protection
- Rate limiting & DDoS protection
- Data encryption & privacy
- API security

**Key Checks**:
- ✅ Passwords hashed with bcrypt?
- ✅ API keys in environment variables?
- ✅ CSRF protection enabled?
- ✅ Rate limiting implemented?

**Reference**: `.kiro/steering/reviewers/security-reviewer.md`

#### 2. Performance Reviewer (성능 전문가)

**Focus Areas**:
- Database query optimization (N+1 queries)
- Memory leak prevention
- API response time
- Frontend rendering performance
- Caching strategies

**Key Checks**:
- ✅ No N+1 query issues?
- ✅ Indexes properly configured?
- ✅ Memory leaks prevented?
- ✅ Response time under 200ms?

**Reference**: `.kiro/steering/reviewers/performance-reviewer.md`

#### 3. Architecture Reviewer (아키텍처 전문가)

**Focus Areas**:
- SOLID principles
- Component boundaries
- Dependency management
- Layer structure
- Design patterns

**Key Checks**:
- ✅ Single Responsibility Principle followed?
- ✅ No circular dependencies?
- ✅ Proper layer separation?
- ✅ Appropriate abstraction level?

**Reference**: `.kiro/steering/reviewers/architecture-reviewer.md`

#### 4. Code Quality Reviewer (코드 품질 전문가)

**Focus Areas**:
- YAGNI (You Aren't Gonna Need It)
- KISS (Keep It Simple, Stupid)
- DRY (Don't Repeat Yourself)
- Readability & maintainability
- Complexity reduction

**Key Checks**:
- ✅ Functions under 50 lines?
- ✅ Nesting under 3 levels?
- ✅ Clear naming conventions?
- ✅ No unnecessary complexity?

**Reference**: `.kiro/steering/reviewers/code-quality-reviewer.md`

---

## Learning System

### How Learnings are Captured / 학습 캡처 방법

**Automatic Extraction** (자동 추출):
1. Success patterns from code
2. Issues encountered and solutions
3. Metrics (time, issues, improvements)
4. Team feedback

**Manual Input** (수동 입력):
1. Lessons learned
2. What to apply next time
3. Recommended resources

### Learning File Structure

```markdown
---
name: project-name-learning
project: Full Project Name
domain: authentication | payment | analytics | etc
date: 2025-01-14
tech-stack: [TypeScript, React, PostgreSQL]
team-size: 3
duration: 4 weeks
---

# Project Name Learnings

## Success Patterns
[Auto-extracted patterns that worked well]

## Issues Encountered
[Problems found and how they were solved]

## Apply to Next Project
[What to do differently next time]

## Metrics
[Time, issues, improvements vs previous project]
```

### Using Past Learnings

**Automatic** (자동):
- `enhance-spec` hook searches and applies automatically
- Similar domain projects referenced
- Patterns auto-injected into new specs

**Manual** (수동):
```
User: "Reference learnings from 2025-01-14-auth-system.md for new spec"
```

---

## Workflow Guide

### Complete Project Workflow / 완전한 프로젝트 워크플로우

#### Phase 1: Plan (계획)

**Step 1**: Create Spec
```
User: "Create a user authentication system spec"
```

**Step 2**: Kiro Auto-Enhances
- Searches `.kiro/steering/learnings/` for auth-related projects
- References `.kiro/steering/patterns/successful-patterns.md`
- Auto-adds security requirements (bcrypt, CSRF, rate limiting)
- Auto-adds testing requirements (unit, integration, security tests)

**Step 3**: Review Enhanced Spec
- Check auto-added requirements
- Remove unnecessary items
- Customize for your project

#### Phase 2: Delegate (실행)

**Step 1**: Break Down Tasks
```markdown
## Tasks
1. Create User Model
   - Hints from past learnings: Use bcrypt, add email uniqueness
2. Create Auth Controller
   - Security checks: CSRF validation, rate limiting
3. Write Tests
   - Coverage: Minimum 80%
```

**Step 2**: Execute Tasks
- Write code normally
- Save files → `assess-on-save` validates automatically
- Fix issues immediately when found

**Step 3**: Complete Task
```
User: "Task 1 complete. Please review."
```
- `assess-on-task-complete` runs multi-review
- Fix any Critical/High issues before next task

#### Phase 3: Assess (검증)

**Continuous Validation**:
- Every file save → Security, Performance, Code Quality checks
- Every task completion → Full multi-review by 4 experts
- Immediate feedback and fix suggestions

#### Phase 4: Codify (학습)

**Step 1**: Declare Project Complete
```
User: "Project is complete. Please record learnings."
```

**Step 2**: Automatic Extraction
- Success patterns identified
- Issues analyzed
- Metrics collected
- Learning file created

**Step 3**: Knowledge Base Updated
- New learning file: `.kiro/steering/learnings/2025-01-14-your-project.md`
- Reviewer checklists updated with new items
- Pattern lists updated

**Step 4**: Ready for Next Project
- All learnings automatically available
- Next project will be 30-50% faster!

---

## Troubleshooting

### Common Issues & Solutions / 일반적인 문제 및 해결책

#### Issue 1: Hooks Not Working

**Symptoms** (증상):
- No automatic validation on file save
- No multi-review on task completion

**Solutions** (해결책):
1. Check hooks are enabled in Kiro IDE → Agent Hooks
2. Verify hook files exist in `.kiro/hooks/`
3. Check file extensions are `.kiro.hook` (not `.hook`)
4. Restart Kiro IDE

#### Issue 2: Learning Files Not Generated

**Symptoms** (증상):
- No learning file created after project completion

**Solutions** (해결책):
1. Ensure `codify-on-project-complete.kiro.hook` is enabled
2. Manually trigger: "Project is complete. Please record learnings."
3. Check `.kiro/steering/learnings/` folder exists
4. Verify write permissions

#### Issue 3: Reviewers Not Executing

**Symptoms** (증상):
- No feedback after file save
- Multi-review not running

**Solutions** (해결책):
1. Check reviewer files exist in `.kiro/steering/reviewers/`
2. Verify `assess-on-save.kiro.hook` is enabled
3. Wait 2-3 seconds after file save
4. Check Kiro console for errors

#### Issue 4: Past Learnings Not Applied

**Symptoms** (증상):
- Spec not enhanced with past learnings
- Same issues recurring

**Solutions** (해결책):
1. Ensure `enhance-spec.kiro.hook` is enabled
2. Check learning files exist in `.kiro/steering/learnings/`
3. Use specific domain keywords in spec request
4. Manually reference: "Use learnings from [filename]"

---

## 빠른 시작 (Korean)

### 1단계: Hook 활성화

1. Kiro IDE 열기
2. **Agent Hooks** 섹션으로 이동
3. 다음 4개 Hook 활성화:
   - ✅ `assess-on-save.kiro.hook`
   - ✅ `assess-on-task-complete.kiro.hook`
   - ✅ `codify-on-project-complete.kiro.hook`
   - ✅ `enhance-spec.kiro.hook`

### 2단계: 첫 프로젝트 시작

```
사용자: "사용자 인증 시스템 Spec을 만들어주세요"
```

Kiro가 자동으로:
- `.kiro/steering/learnings/`에서 과거 학습 참조
- `.kiro/steering/patterns/`에서 성공 패턴 적용
- 보안, 테스트, 모범 사례가 포함된 향상된 Spec 생성

### 3단계: 자동 검증과 함께 개발

- **파일 저장 시**: `assess-on-save` Hook이 코드 검증
- **Task 완료 시**: `assess-on-task-complete` Hook이 Multi-Review 실행
- **프로젝트 완료 시**: `codify-on-project-complete` Hook이 학습 추출

### 4단계: 복리 효과 확인

- **프로젝트 1**: 40시간, 15개 이슈
- **프로젝트 2**: 28시간 (-30%), 8개 이슈 (-47%)
- **프로젝트 3**: 20시간 (-50%), 3개 이슈 (-80%)

---

## 시스템 개요 (Korean)

### 컴파운딩 엔지니어링이란?

체계적인 학습 캡처와 적용을 통해 각 프로젝트가 다음 프로젝트를 더 쉽게 만드는 개발 방법론입니다.

### 4단계 사이클

```
계획(Plan) → 실행(Delegate) → 검증(Assess) → 학습(Codify) → (반복)
```

1. **Plan (계획)**: 과거 학습이 자동 적용된 Spec 생성
2. **Delegate (실행)**: 검증된 패턴으로 Task 실행
3. **Assess (검증)**: 4명의 전문 리뷰어가 자동 검증
4. **Codify (학습)**: 학습 내용 자동 추출 및 기록

---

## 파일 구조 (Korean)

### 전체 시스템 아키텍처

```
.kiro/
├── hooks/                          # 자동화 Hooks
│   ├── assess-on-save.kiro.hook           # 파일 저장 시 자동 리뷰
│   ├── assess-on-task-complete.kiro.hook  # Task 완료 시 Multi-Review
│   ├── codify-on-project-complete.kiro.hook # 프로젝트 완료 시 학습 추출
│   └── enhance-spec.kiro.hook             # Spec 생성 시 학습 적용
```

```
├── steering/
│   ├── compounding/               # 핵심 철학 & 워크플로우
│   │   ├── 00-philosophy.md              # 컴파운딩 철학
│   │   ├── 01-workflow.md                # 상세 워크플로우
│   │   └── 02-metrics.md                 # 메트릭 시스템
│   │
│   ├── reviewers/                 # 4명의 전문 리뷰어
│   │   ├── security-reviewer.md          # 보안 전문가
│   │   ├── performance-reviewer.md       # 성능 전문가
│   │   ├── architecture-reviewer.md      # 아키텍처 전문가
│   │   └── code-quality-reviewer.md      # 코드 품질 전문가
│   │
│   ├── learnings/                 # 프로젝트 학습 내용
│   │   ├── README.md                     # 학습 시스템 설명
│   │   ├── learning-template.md          # 학습 파일 템플릿
│   │   └── YYYY-MM-DD-project-name.md    # 실제 학습 파일들
│   │
│   └── patterns/                  # 성공/실패 패턴
│       ├── successful-patterns.md        # 성공 패턴 모음
│       └── anti-patterns.md              # 피해야 할 패턴
```

---

## Hook 사용법 (Korean)

### 1. assess-on-save.kiro.hook

**트리거**: 파일 저장 시 자동 실행

**기능**:
- Security, Performance, Code Quality 체크 실행
- 즉시 피드백 제공
- 자동 수정 제안

**출력 예시**:
```
✅ Assess on Save: 모든 체크 통과
   - Security: ✅ 이슈 없음
   - Performance: ✅ 이슈 없음
   - Code Quality: ✅ 이슈 없음
```

이슈 발견 시:
```
🚨 Assess on Save: 이슈 발견

보안 이슈:
⚠️ Line 42: API 키 하드코딩됨
   수정: 환경변수로 이동
```

### 2. assess-on-task-complete.kiro.hook

**트리거**: 수동 - Task 완료 선언 시

**기능**:
- 4명의 리뷰어 동시 실행 (Security, Performance, Architecture, Code Quality)
- 종합 Multi-Review 리포트 제공
- 심각도별 이슈 우선순위 지정

**사용 방법**:
```
사용자: "Task 1 완료했습니다. 리뷰해주세요."
```

### 3. codify-on-project-complete.kiro.hook

**트리거**: 수동 - 프로젝트 완료 시

**기능**:
- 프로젝트에서 성공 패턴 추출
- 발생한 이슈 분석
- 메트릭 기록 (시간, 이슈, 개선사항)
- 리뷰어 체크리스트 자동 업데이트
- `.kiro/steering/learnings/`에 학습 파일 생성

**사용 방법**:
```
사용자: "프로젝트가 완료되었습니다. 학습 내용을 기록해주세요."
```

### 4. enhance-spec.kiro.hook

**트리거**: Spec 생성 시 자동

**기능**:
- 유사한 과거 프로젝트 검색
- 관련 학습 내용 자동 주입
- 보안, 테스트, 성능 요구사항 추가
- 검증된 아키텍처 패턴 제안

**사용 방법**:
```
사용자: "결제 시스템 Spec을 만들어주세요"
```

---

## 리뷰어 시스템 (Korean)

### 4명의 전문 리뷰어

#### 1. Security Reviewer (보안 전문가)

**검증 영역**:
- 인증 & 권한
- CSRF, XSS, SQL Injection 방어
- Rate limiting & DDoS 방어
- 데이터 암호화 & 개인정보 보호
- API 보안

**주요 체크 항목**:
- ✅ 비밀번호가 bcrypt로 해싱되었는가?
- ✅ API 키가 환경변수에 있는가?
- ✅ CSRF 보호가 활성화되었는가?
- ✅ Rate limiting이 구현되었는가?

**참조**: `.kiro/steering/reviewers/security-reviewer.md`

#### 2. Performance Reviewer (성능 전문가)

**검증 영역**:
- 데이터베이스 쿼리 최적화 (N+1 쿼리)
- 메모리 누수 방지
- API 응답 시간
- 프론트엔드 렌더링 성능
- 캐싱 전략

**주요 체크 항목**:
- ✅ N+1 쿼리 문제가 없는가?
- ✅ 인덱스가 적절히 설정되었는가?
- ✅ 메모리 누수가 방지되었는가?
- ✅ 응답 시간이 200ms 이하인가?

**참조**: `.kiro/steering/reviewers/performance-reviewer.md`

#### 3. Architecture Reviewer (아키텍처 전문가)

**검증 영역**:
- SOLID 원칙
- 컴포넌트 경계
- 의존성 관리
- 계층 구조
- 디자인 패턴

**주요 체크 항목**:
- ✅ Single Responsibility 원칙을 따르는가?
- ✅ 순환 의존성이 없는가?
- ✅ 적절한 계층 분리가 되어있는가?
- ✅ 추상화 레벨이 적절한가?

**참조**: `.kiro/steering/reviewers/architecture-reviewer.md`

#### 4. Code Quality Reviewer (코드 품질 전문가)

**검증 영역**:
- YAGNI (You Aren't Gonna Need It)
- KISS (Keep It Simple, Stupid)
- DRY (Don't Repeat Yourself)
- 가독성 & 유지보수성
- 복잡도 감소

**주요 체크 항목**:
- ✅ 함수가 50줄 이하인가?
- ✅ 중첩이 3단계 이하인가?
- ✅ 명확한 네이밍 컨벤션을 따르는가?
- ✅ 불필요한 복잡성이 없는가?

**참조**: `.kiro/steering/reviewers/code-quality-reviewer.md`

---

## 학습 시스템 (Korean)

### 학습 캡처 방법

**자동 추출**:
1. 코드에서 성공 패턴
2. 발생한 이슈와 해결책
3. 메트릭 (시간, 이슈, 개선사항)
4. 팀 피드백

**수동 입력**:
1. 배운 교훈
2. 다음에 적용할 것
3. 추천 리소스

### 학습 파일 구조

```markdown
---
name: project-name-learning
project: 프로젝트 전체 이름
domain: authentication | payment | analytics | etc
date: 2025-01-14
tech-stack: [TypeScript, React, PostgreSQL]
team-size: 3
duration: 4 weeks
---

# 프로젝트 이름 학습

## 성공한 패턴
[잘 작동한 자동 추출 패턴]

## 발생한 이슈
[발견된 문제와 해결 방법]

## 다음 프로젝트에 적용할 것
[다음에 다르게 할 것]

## 메트릭
[시간, 이슈, 이전 프로젝트 대비 개선사항]
```

### 과거 학습 활용

**자동**:
- `enhance-spec` Hook이 자동으로 검색하고 적용
- 유사 도메인 프로젝트 참조
- 패턴이 새 Spec에 자동 주입

**수동**:
```
사용자: "2025-01-14-auth-system.md의 학습 내용을 참조해서 새 Spec 만들어줘"
```

---

## 워크플로우 가이드 (Korean)

### 완전한 프로젝트 워크플로우

#### Phase 1: Plan (계획)

**Step 1**: Spec 생성
```
사용자: "사용자 인증 시스템 Spec을 만들어주세요"
```

**Step 2**: Kiro 자동 강화
- `.kiro/steering/learnings/`에서 인증 관련 프로젝트 검색
- `.kiro/steering/patterns/successful-patterns.md` 참조
- 보안 요구사항 자동 추가 (bcrypt, CSRF, rate limiting)
- 테스트 요구사항 자동 추가 (단위, 통합, 보안 테스트)

**Step 3**: 강화된 Spec 검토
- 자동 추가된 요구사항 확인
- 불필요한 항목 제거
- 프로젝트에 맞게 커스터마이징

#### Phase 2: Delegate (실행)

**Step 1**: Task 분해
```markdown
## Tasks
1. User Model 생성
   - 과거 학습의 힌트: bcrypt 사용, email uniqueness 추가
2. Auth Controller 생성
   - 보안 체크: CSRF 검증, rate limiting
3. Tests 작성
   - 커버리지: 최소 80%
```

**Step 2**: Task 실행
- 평소처럼 코드 작성
- 파일 저장 → `assess-on-save`가 자동 검증
- 발견된 이슈 즉시 수정

**Step 3**: Task 완료
```
사용자: "Task 1 완료했습니다. 리뷰해주세요."
```
- `assess-on-task-complete`가 Multi-Review 실행
- 다음 Task 전에 Critical/High 이슈 수정

#### Phase 3: Assess (검증)

**지속적 검증**:
- 파일 저장마다 → Security, Performance, Code Quality 체크
- Task 완료마다 → 4명의 전문가가 전체 Multi-Review
- 즉시 피드백 및 수정 제안

#### Phase 4: Codify (학습)

**Step 1**: 프로젝트 완료 선언
```
사용자: "프로젝트가 완료되었습니다. 학습 내용을 기록해주세요."
```

**Step 2**: 자동 추출
- 성공 패턴 식별
- 이슈 분석
- 메트릭 수집
- 학습 파일 생성

**Step 3**: Knowledge Base 업데이트
- 새 학습 파일: `.kiro/steering/learnings/2025-01-14-your-project.md`
- 리뷰어 체크리스트에 새 항목 추가
- 패턴 목록 업데이트

**Step 4**: 다음 프로젝트 준비 완료
- 모든 학습 내용 자동 사용 가능
- 다음 프로젝트는 30-50% 더 빠름!

---

## 문제 해결 (Korean)

### 일반적인 문제 및 해결책

#### 문제 1: Hook이 작동하지 않음

**증상**:
- 파일 저장 시 자동 검증 없음
- Task 완료 시 Multi-Review 없음

**해결책**:
1. Kiro IDE → Agent Hooks에서 Hook 활성화 확인
2. `.kiro/hooks/`에 Hook 파일 존재 확인
3. 파일 확장자가 `.kiro.hook`인지 확인 (`.hook` 아님)
4. Kiro IDE 재시작

#### 문제 2: 학습 파일이 생성되지 않음

**증상**:
- 프로젝트 완료 후 학습 파일 없음

**해결책**:
1. `codify-on-project-complete.kiro.hook` 활성화 확인
2. 수동 트리거: "프로젝트가 완료되었습니다. 학습 내용을 기록해주세요."
3. `.kiro/steering/learnings/` 폴더 존재 확인
4. 쓰기 권한 확인

#### 문제 3: 리뷰어가 실행되지 않음

**증상**:
- 파일 저장 후 피드백 없음
- Multi-Review가 실행되지 않음

**해결책**:
1. `.kiro/steering/reviewers/`에 리뷰어 파일 존재 확인
2. `assess-on-save.kiro.hook` 활성화 확인
3. 파일 저장 후 2-3초 대기
4. Kiro 콘솔에서 에러 확인

#### 문제 4: 과거 학습이 적용되지 않음

**증상**:
- Spec이 과거 학습으로 강화되지 않음
- 같은 이슈 반복 발생

**해결책**:
1. `enhance-spec.kiro.hook` 활성화 확인
2. `.kiro/steering/learnings/`에 학습 파일 존재 확인
3. Spec 요청 시 구체적인 도메인 키워드 사용
4. 수동 참조: "[파일명]의 학습 내용을 사용해서"

---

## Best Practices / 모범 사례

### For Maximum Compounding Effect / 최대 복리 효과를 위해

#### 1. Consistency (일관성)
- **English**: Use the same workflow for every project
- **한국어**: 모든 프로젝트에서 동일한 워크플로우 사용

#### 2. Recording (기록)
- **English**: Always record learnings on project completion
- **한국어**: 프로젝트 완료 시 항상 학습 내용 기록

#### 3. Sharing (공유)
- **English**: Share `.kiro/steering/` folder via Git with team
- **한국어**: Git을 통해 팀과 `.kiro/steering/` 폴더 공유

#### 4. Improvement (개선)
- **English**: Continuously improve reviewer checklists
- **한국어**: 리뷰어 체크리스트 지속적 개선

#### 5. Automation (자동화)
- **English**: Keep all 4 hooks enabled at all times
- **한국어**: 4개 Hook 항상 활성화 상태 유지

---

## Expected Results / 예상 결과

### Project Progression / 프로젝트 진행

#### Project 1 (Baseline / 기준선)
- **Setup Time**: 2 hours / 2시간
- **Issues Found**: 15 / 15개
- **Time to Fix**: 8 hours / 8시간
- **Total Time**: 40 hours / 40시간

#### Project 2 (System Applied / 시스템 적용)
- **Setup Time**: 45min (-62%) / 45분 (-62%)
- **Issues Found**: 8 (-47%) / 8개 (-47%)
- **Time to Fix**: 3hr (-62%) / 3시간 (-62%)
- **Total Time**: 28hr (-30%) / 28시간 (-30%)
- **Saved**: 12 hours / 12시간 절약

#### Project 3 (More Learnings / 더 많은 학습)
- **Setup Time**: 20min (-83%) / 20분 (-83%)
- **Issues Found**: 3 (-80%) / 3개 (-80%)
- **Time to Fix**: 1hr (-87%) / 1시간 (-87%)
- **Total Time**: 20hr (-50%) / 20시간 (-50%)
- **Cumulative Saved**: 32 hours / 누적 32시간 절약

#### Project 4 (Compounding Maximized / 복리 극대화)
- **Setup Time**: 10min (-92%) / 10분 (-92%)
- **Issues Found**: 1 (-93%) / 1개 (-93%)
- **Time to Fix**: 30min (-94%) / 30분 (-94%)
- **Total Time**: 15hr (-62%) / 15시간 (-62%)
- **Cumulative Saved**: 57 hours / 누적 57시간 절약

---

## Success Metrics / 성공 지표

### Short-term (1-2 months / 1-2개월)
- [ ] All 4 hooks enabled / 4개 Hook 모두 활성화
- [ ] First learning file created / 첫 학습 파일 생성
- [ ] 10%+ time reduction in Project 2 / 프로젝트 2에서 10% 이상 시간 단축

### Mid-term (3-6 months / 3-6개월)
- [ ] 30% time reduction in Project 2 / 프로젝트 2에서 30% 시간 단축
- [ ] 50% fewer issues / 50% 적은 이슈
- [ ] 5+ learning files accumulated / 5개 이상 학습 파일 축적

### Long-term (6-12 months / 6-12개월)
- [ ] 50% time reduction in Project 3 / 프로젝트 3에서 50% 시간 단축
- [ ] 80% fewer issues / 80% 적은 이슈
- [ ] 2x team-wide productivity / 팀 전체 생산성 2배

---

## Quick Reference / 빠른 참조

### Essential Commands / 필수 명령어

#### Create Enhanced Spec / 강화된 Spec 생성
```
"Create a [domain] system spec"
"[도메인] 시스템 Spec을 만들어주세요"
```

#### Request Task Review / Task 리뷰 요청
```
"Task [number] complete. Please review."
"Task [번호] 완료했습니다. 리뷰해주세요."
```

#### Record Project Learnings / 프로젝트 학습 기록
```
"Project is complete. Please record learnings."
"프로젝트가 완료되었습니다. 학습 내용을 기록해주세요."
```

#### Reference Past Learnings / 과거 학습 참조
```
"Reference learnings from [filename] for new spec"
"[파일명]의 학습 내용을 참조해서 새 Spec 만들어줘"
```

### Key Files to Know / 알아야 할 주요 파일

#### Documentation / 문서
- `00-philosophy.md` - Core philosophy / 핵심 철학
- `01-workflow.md` - Detailed workflow / 상세 워크플로우
- `02-metrics.md` - Metrics system / 메트릭 시스템
- `MASTER-USAGE-GUIDE.md` - This file / 이 파일

#### Hooks / 훅
- `assess-on-save.kiro.hook` - Auto-review on save / 저장 시 자동 리뷰
- `assess-on-task-complete.kiro.hook` - Multi-review / Multi-Review
- `codify-on-project-complete.kiro.hook` - Extract learnings / 학습 추출
- `enhance-spec.kiro.hook` - Enhance specs / Spec 강화

#### Reviewers / 리뷰어
- `security-reviewer.md` - Security expert / 보안 전문가
- `performance-reviewer.md` - Performance expert / 성능 전문가
- `architecture-reviewer.md` - Architecture expert / 아키텍처 전문가
- `code-quality-reviewer.md` - Code quality expert / 코드 품질 전문가

#### Patterns / 패턴
- `successful-patterns.md` - What works / 효과적인 것
- `anti-patterns.md` - What to avoid / 피해야 할 것

---

## Additional Resources / 추가 리소스

### Internal Documentation / 내부 문서
1. `.kiro/steering/compounding/00-philosophy.md` - Philosophy / 철학
2. `.kiro/steering/compounding/01-workflow.md` - Workflow / 워크플로우
3. `.kiro/steering/compounding/02-metrics.md` - Metrics / 메트릭
4. `.kiro/hooks/README.md` - Hook system / Hook 시스템
5. `.kiro/steering/learnings/README.md` - Learning system / 학습 시스템

### External References / 외부 참조
1. `docs.md/compounding.md` - Kiro application / Kiro 적용 방법
2. `docs.md/compounding engin.md` - Every Marketplace analysis / Every Marketplace 분석
3. `docs.md/kiro-compounding-engineering-strategy.md` - Strategy / 전략

---

## Support & Feedback / 지원 & 피드백

### Getting Help / 도움 받기

**English**: If you encounter issues or have questions:
1. Check this guide first
2. Review the troubleshooting section
3. Check individual component documentation
4. Consult with your team

**한국어**: 문제가 발생하거나 질문이 있는 경우:
1. 먼저 이 가이드 확인
2. 문제 해결 섹션 검토
3. 개별 컴포넌트 문서 확인
4. 팀과 상의

### Improving the System / 시스템 개선

**English**: Help improve Compounding Engineering:
- Add new patterns when discovered
- Update reviewer checklists with new checks
- Share learnings with the team
- Suggest workflow improvements

**한국어**: Compounding Engineering 개선에 도움:
- 새로운 패턴 발견 시 추가
- 새로운 체크로 리뷰어 체크리스트 업데이트
- 팀과 학습 내용 공유
- 워크플로우 개선 제안

---

## Conclusion / 결론

### The Promise of Compounding Engineering

**English**: 
> "Each project becomes 30-50% faster and easier than the previous one!"

This is not just a promise—it's a systematic approach to continuous improvement through:
- Automatic learning capture
- Intelligent pattern recognition
- Multi-expert validation
- Seamless knowledge sharing

Start your first project today and experience the compounding effect!

**한국어**:
> "매번 프로젝트가 이전보다 30-50% 더 빠르고 쉬워진다!"

이것은 단순한 약속이 아닙니다—다음을 통한 지속적 개선의 체계적 접근입니다:
- 자동 학습 캡처
- 지능적 패턴 인식
- 다중 전문가 검증
- 원활한 지식 공유

오늘 첫 프로젝트를 시작하고 복리 효과를 경험하세요!

---

## Version History / 버전 히스토리

### Version 1.0 (2025-01-14)
- Initial release / 초기 릴리스
- Complete system with 18 files / 18개 파일로 완전한 시스템
- 4 hooks, 4 reviewers, learning system, patterns / 4개 Hook, 4개 리뷰어, 학습 시스템, 패턴
- English/Korean bilingual documentation / 영문/한글 이중 언어 문서

---

**Document Status**: Production Ready / 프로덕션 준비 완료  
**Last Updated**: 2025-01-14  
**Maintained By**: Kiro AI Assistant  
**License**: Internal Use / 내부 사용

---

## Quick Start Checklist / 빠른 시작 체크리스트

### Before First Project / 첫 프로젝트 전
- [ ] Read this guide / 이 가이드 읽기
- [ ] Enable all 4 hooks / 4개 Hook 모두 활성화
- [ ] Verify file structure / 파일 구조 확인
- [ ] Test hook execution / Hook 실행 테스트

### During First Project / 첫 프로젝트 중
- [ ] Create enhanced spec / 강화된 Spec 생성
- [ ] Use assess-on-save / assess-on-save 사용
- [ ] Complete tasks with reviews / 리뷰와 함께 Task 완료
- [ ] Record learnings on completion / 완료 시 학습 기록

### After First Project / 첫 프로젝트 후
- [ ] Review learning file / 학습 파일 검토
- [ ] Check metrics / 메트릭 확인
- [ ] Share with team / 팀과 공유
- [ ] Plan next project / 다음 프로젝트 계획

**Ready to start? Let's compound! / 시작할 준비가 되셨나요? 복리 효과를 만들어봅시다!** 🚀
