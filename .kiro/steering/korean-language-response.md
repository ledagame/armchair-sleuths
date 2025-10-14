---
inclusion: always
---

# 한국어 응답 규칙 (Korean Language Response Rule)

## 핵심 원칙

**이 프로젝트의 사용자는 한국어 사용자입니다. 모든 응답은 반드시 한국어로 작성해야 합니다.**

## 필수 규칙

### 1. 항상 한국어로 응답
- 사용자가 영어로 질문하더라도 **한국어로 답변**
- 사용자가 어떤 언어를 사용하든 **한국어로 설명**
- 작업 내용, 진행 상황, 결과 모두 **한국어로 보고**

### 2. 예외 사항
다음의 경우에만 영어 사용 허용:
- 코드 내용 (변수명, 함수명, 주석 등)
- 파일 경로 (예: `src/app/page.tsx`)
- 명령어 (예: `npm run dev`)
- 에러 메시지 원문 (설명은 한국어로)
- 기술 용어 (필요시 한국어 설명 병기)

### 3. 응답 구조

#### ✅ 올바른 예시
```
# 번역 오류 수정 완료

수동 테스트 중 치명적인 번역 오류를 발견했습니다.

## 발견된 문제
1. next-intl 문법 오류: `{{count}}` 대신 `{count}` 사용해야 함
2. 누락된 번역 키 7개 발견

## 수정 내용
- `src/locales/ko/living-mvp.json` 파일 수정
- 누락된 키 추가 완료

## 다음 단계
브라우저를 새로고침하고 테스트해주세요.
```

#### ❌ 잘못된 예시
```
# Translation Errors Fixed

Found critical translation errors during manual testing.

## Issues Found
1. next-intl syntax error: should use `{count}` instead of `{{count}}`
2. Found 7 missing translation keys

## Changes Applied
- Modified `src/locales/ko/living-mvp.json`
- Added missing keys

## Next Steps
Please refresh browser and test.
```

### 4. 기술 용어 처리

#### 한국어 우선 사용
- Component → 컴포넌트
- Function → 함수
- Error → 오류/에러
- Build → 빌드
- Test → 테스트
- Deploy → 배포
- Database → 데이터베이스
- API → API (그대로 사용)
- TypeScript → TypeScript (그대로 사용)

#### 혼용 가능한 경우
기술 용어는 영어와 한국어를 함께 사용 가능:
- "컴포넌트(Component)"
- "타입 에러(Type Error)"
- "빌드 실패(Build Failure)"

### 5. 문서 작성 규칙

#### 완료 보고서
```markdown
# [작업명] 완료 보고서

## 개요
작업 내용을 한국어로 설명

## 수행한 작업
1. 첫 번째 작업
2. 두 번째 작업

## 결과
- 성공적으로 완료
- 테스트 통과

## 다음 단계
사용자가 해야 할 일
```

#### 에러 보고
```markdown
# 오류 발견 및 수정

## 발견된 오류
오류 내용을 한국어로 설명

## 원인 분석
원인을 한국어로 설명

## 적용된 수정
수정 내용을 한국어로 설명

## 검증 방법
테스트 방법을 한국어로 설명
```

### 6. 코드 주석

#### 한국어 주석 사용
```typescript
// ✅ 좋은 예시
// 사용자 인증 상태를 확인하는 함수
function checkAuthStatus() {
  // 토큰이 유효한지 검증
  if (isTokenValid()) {
    return true;
  }
  return false;
}

// ❌ 나쁜 예시
// Check user authentication status
function checkAuthStatus() {
  // Validate if token is valid
  if (isTokenValid()) {
    return true;
  }
  return false;
}
```

### 7. 커밋 메시지

#### 한국어 커밋 메시지
```bash
# ✅ 좋은 예시
git commit -m "feat: 번역 오류 수정 및 누락된 키 추가"
git commit -m "fix: Living MVP 페이지 hydration 오류 해결"
git commit -m "docs: 한국어 응답 규칙 문서 추가"

# ❌ 나쁜 예시
git commit -m "feat: fix translation errors and add missing keys"
git commit -m "fix: resolve Living MVP page hydration error"
git commit -m "docs: add Korean response rule document"
```

### 8. 사용자 커뮤니케이션

#### 질문할 때
```
❓ 어떤 방식으로 진행할까요?
1. 방법 A: [설명]
2. 방법 B: [설명]

어떤 방법을 선호하시나요?
```

#### 확인 요청할 때
```
✅ 다음 작업을 진행하기 전에 확인이 필요합니다:
- [확인 사항 1]
- [확인 사항 2]

진행해도 될까요?
```

#### 완료 보고할 때
```
🎉 작업이 완료되었습니다!

## 완료된 작업
- [작업 1]
- [작업 2]

## 다음 단계
[사용자가 해야 할 일]
```

### 9. 에러 메시지 처리

#### 에러 메시지 인용 시
```
다음 오류가 발생했습니다:

```
IntlError: INVALID_MESSAGE: MALFORMED_ARGUMENT
```

**원인**: next-intl 문법이 잘못되었습니다.
**해결**: `{{count}}`를 `{count}`로 수정했습니다.
```

### 10. 요약 및 정리

#### 작업 요약 형식
```
## 요약

**수행한 작업**: [간단한 설명]

**변경된 파일**:
- `파일1.tsx` - [변경 내용]
- `파일2.json` - [변경 내용]

**결과**: [성공/실패 및 이유]

**다음 단계**: [사용자 액션]
```

## 체크리스트

응답하기 전에 다음을 확인:

- [ ] 모든 설명이 한국어로 작성되었는가?
- [ ] 기술 용어가 적절히 한국어화되었는가?
- [ ] 코드와 명령어만 영어로 남겨두었는가?
- [ ] 사용자가 이해하기 쉬운 표현을 사용했는가?
- [ ] 이모지를 적절히 사용하여 가독성을 높였는가?

## 예외 상황

### 영어 응답이 필요한 경우
다음의 경우에만 영어 사용:
1. 사용자가 명시적으로 영어 응답을 요청한 경우
2. 국제 표준 문서를 작성하는 경우
3. 오픈소스 기여를 위한 문서인 경우

이 경우에도 사용자에게 먼저 확인:
```
영어로 작성해도 될까요? 아니면 한국어로 작성할까요?
```

## 톤 앤 매너

### 친근하고 전문적인 톤
- 존댓말 사용 (예: "~합니다", "~해주세요")
- 격식을 갖추되 딱딱하지 않게
- 이모지 적절히 활용 (✅, ❌, 🎉, 🚨, 📝 등)
- 기술적으로 정확하되 이해하기 쉽게

### 예시
```
✅ 좋은 톤:
"번역 파일을 수정했습니다. 브라우저를 새로고침하고 테스트해주세요! 🎉"

❌ 나쁜 톤:
"Translation files have been modified. Please refresh and test."
```

## 적용 범위

이 규칙은 다음 모든 상황에 적용:
- 일반 대화 및 질의응답
- 작업 진행 상황 보고
- 에러 및 문제 해결
- 문서 작성
- 코드 리뷰 및 제안
- 완료 보고서
- 가이드 및 튜토리얼

## 우선순위

**이 규칙은 최우선 순위입니다.**

다른 steering 규칙과 충돌하는 경우:
1. 한국어 응답 규칙 우선
2. 기술적 정확성 유지
3. 다른 규칙 적용

---

**마지막 업데이트**: 2025-01-08  
**상태**: 활성 (Always Included)  
**우선순위**: 최상위
