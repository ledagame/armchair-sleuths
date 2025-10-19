# 데이터 일관성 수정 Design

## 전체 아키텍처 분석

### 저장소 계층 (Storage Layers)

```
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  CaseGeneratorService, CaseRepository, etc.                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   KVStoreManager                             │
│  High-level API for case, suspect, conversation data        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   IStorageAdapter                            │
│  Interface: get, set, sAdd, sMembers, del                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                  ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ DevvitAdapter│  │ FileAdapter  │  │MemoryAdapter │
│ (Production) │  │ (Dev/Script) │  │   (Test)     │
└──────────────┘  └──────────────┘  └──────────────┘
        ↓                 ↓                  ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Devvit Redis │  │ ./local-data/│  │   Memory     │
│      KV      │  │   (JSON)     │  │    (Map)     │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 데이터 흐름 (Data Flow)

#### 1. 케이스 생성 흐름

```typescript
// Step 1: CaseGeneratorService
const generatedCase = await CaseGeneratorService.generateCase({
  date: new Date('2025-10-17'),
  includeImage: true
});
// 생성: 이서연, 박준호, 최민지 (3명)

// Step 2: CaseRepository
await CaseRepository.createCase(generatedCase);
// 케이스 ID: case-2025-10-17
// 용의자 ID: case-2025-10-17-suspect-1, suspect-2, suspect-3

// Step 3: KVStoreManager.saveCase()
await KVStoreManager.saveCase(caseData);
// 3.1: clearCaseData() - 기존 데이터 삭제
// 3.2: adapter.set('case:case-2025-10-17', JSON.stringify(caseData))
// 3.3: adapter.set('ca
se:date:2025-10-17', 'case-2025-10-17')

// Step 4: KVStoreManager.saveSuspect() (3번 반복)
for (const suspect of suspects) {
  await KVStoreManager.saveSuspect(suspectData);
  // 4.1: adapter.set('suspect:case-2025-10-17-suspect-N', JSON.stringify(suspectData))
  // 4.2: adapter.sAdd('case:case-2025-10-17:suspects', 'case-2025-10-17-suspect-N')
}
```


#### 2. Redis 키 구조

```
# 케이스 데이터
case:case-2025-10-17 = {
  id: "case-2025-10-17",
  date: "2025-10-17",
  victim: {...},
  weapon: {...},
  location: {...},
  suspects: [
    { id: "case-2025-10-17-suspect-1", name: "이서연", ... },
    { id: "case-2025-10-17-suspect-2", name: "박준호", ... },
    { id: "case-2025-10-17-suspect-3", name: "최민지", ... }
  ],
  solution: {...},
  imageUrl: "..."
}

# 날짜 인덱스
case:date:2025-10-17 = "case-2025-10-17"

# 용의자 데이터 (3개)
suspect:case-2025-10-17-suspect-1 = {
  id: "case-2025-10-17-suspect-1",
  caseId: "case-2025-10-17",
  name: "이서연",
  archetype: "비즈니스 파트너",
  background: "...",
  personality: "...",
  isGuilty: false,
  profileImageUrl: "...
",
  emotionalState: {...}
}

suspect:case-2025-10-17-suspect-2 = { ... } # 박준호 (진범)
suspect:case-2025-10-17-suspect-3 = { ... } # 최민지

# 용의자 Set (JSON 배열로 저장)
case:case-2025-10-17:suspects = [
  "case-2025-10-17-suspect-1",
  "case-2025-10-17-suspect-2",
  "case-2025-10-17-suspect-3"
]
```

### 문제 진단

#### 발견된 불일치

| 위치 | 용의자 목록 | 인원 | 상태 |
|------|------------|------|------|
| **앱 (실제 표시)** | 이서연, 정우진, 윤지혁, 서도윤 | 4명 | ❌ 잘못됨 |
| **코드 (CaseGeneratorService)** | 이서연, 박준호, 최민지 | 3명 | ✅ 올바름 |
| **문서 (설계서)** | 강태오, 박준호, 최민수 | 3명 | ⚠️ 오래됨 |
| **Redis Set** | 7명의 멤버 | 7명 | ❌ 중복 |
| **실제 Fetch** | 4명 | 4명 | ❌ 잘못됨 |

#### 근본 원인 분석

**1. 잘못된 데이터가 Redis에 저장됨**

```typescript
// 터미널 로그에서 확인된 문제:
// [DEVVIT] ✅ DevvitAdapter.sAdd: Added "case-2025-10-17-suspect-1" to set "case:case-2025-10-17:suspects" (now 5 members)
// [DEVVIT] ✅ DevvitAdapter.sAdd: Added "case-2025-10-17-suspect-2" to set "case:case-2025-10-17:suspects" (now 6 members)
// [DEVVIT] ✅ DevvitAdapter.sAdd: Added "case-2025-10-17-suspect-3" to set "case:case-2025-10-17:suspects" (now 7 members)

// 문제: 3명을 추가했는데 5→6→7로 증가
// 원인: 기존에 이미 4명의 데이터가 있었음
```

**2. clearCaseData()가 제대로 실행되지 않음**

```typescript
// KVStoreManager.saveCase() 내
부에서 clearCaseData() 호출
// 하지만 어떤 이유로 기존 데이터가 완전히 삭제되지 않음

// 가능한 원인:
// 1. 어댑터가 제대로 설정되지 않음
// 2. 다른 경로로 데이터가 저장됨 (직접 Redis 접근)
// 3. 비동기 타이밍 문제
// 4. 이전 버전의 코드로 저장된 데이터
```

**3. 용의자 이름 불일치**

```typescript
// 코드에 정의된 이름: 이서연, 박준호, 최민지
// 앱에 표시되는 이름: 이서연, 정우진, 윤지혁, 서도윤

// 정우진, 윤지혁, 서도윤은 코드 어디에도 정의되지 않음
// → 수동으로 또는 테스트 중에 잘못 저장된 데이터
```

**4. 이미지 URL 문제**

```typescript
// profileImageUrl이 없거나 유효하지 않음
// → 플레이스홀더만 표시됨

// 가능한 원인:
// 1. 이미지 생성 실패
// 2. URL이 만료됨
// 3. 이미지 생성 없이 케이스만 생성됨
```

### 해결 방안

#### Solution 1: 완전한 데이터 재생성

```bash
# 1. 기존 케이스 완전 삭제
npx tsx scripts/clear-case.ts case-2
025-10-17

# 2. 새 케이스 생성 (이미지 포함)
npx tsx scripts/regenerate-case.ts case-2025-10-17 --with-images --force

# 3. 검증
npx tsx scripts/debug-images.ts case-2025-10-17
```

#### Solution 2: clearCaseData() 강화

```typescript
// KVStoreManager.clearCaseData() 개선
static async clearCaseData(caseId: string): Promise<void> {
  console.log(`🧹 Clearing old data for case: ${caseId}`);

  // 1. 기존 용의자 ID 목록 가져오기
  const caseKey = `case:${caseId}:suspects`;
  const suspectIds = await this.adapter.sMembers(caseKey);
  console.log(`  Found ${suspectIds.length} existing suspects to delete`);

  // 2. 각 용의자 데이터 삭제
  for (const suspectId of suspectIds) {
    const suspectKey = `suspect:${suspectId}`;
    await this.adapter.del(suspectKey);
    console.log(`  ✓ Deleted suspect: ${suspectId}`);
  }

  // 3. 용의자 Set 삭제
  await this.adapter.del(caseKey);
  console.log(`  ✓ Deleted suspect set: ${caseKey}`);

  // 4. 케이스 데이터 삭제
  const key = `case:${caseId}`;
  await this.adapter.del(key);
  console.log(`  ✓ Deleted case data: ${key}`);

  // 5. 날짜 인덱스 삭제
  const caseData = await this.getCase(caseId);
  if (caseData) {
    const dateKey = `case:date:${caseData.date}`;
    await this.adapter.del(dateKey);
    console.log(`  ✓ Deleted date index: ${dateKey}`);
  }

  console.log(`✅ Case data cleared successfully for: ${caseId}`);
}
```

#### Solution 3: 데이터 검증 시스템

```typescript
// 케이스 생성 후 자동 검증
interface CaseValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

class CaseValidator {
  static async validateCase(caseId: string): Promise<CaseValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. 케이스 데이터 존재 확인
    const caseData = await KVStoreManager.getCase(caseId);
    if (!caseData) {
      errors.push('Case data not found');
      return { valid: false, errors, warnings };
    }

    // 2. 용의자 수 검증 (정확히 3명)
    if (caseData.suspects.length !== 3) {
      errors.push(`Expected 3 suspects, found ${caseData.suspects.length}`);
    }

    // 3. 용의자 데이터 검증
    const suspects = await KVStoreManager.getCaseSuspects(caseId);
    if (suspects.length !== 3) {
      errors.push(`Expected 3 suspect records, found ${suspects.length}`);
    }

    // 4. 용의자 Set 검증
    const suspectIds = await KVStoreManager.adapter.sMembers(`case:${caseId}:suspects`);
    if (suspectIds.length !== 3) {
      errors.push(`Expected 3 suspect IDs in set, found ${suspectIds.length}`);
    }

    // 5. 진범 검증 (정확히 1명)
    const guiltySuspects = suspects.filter(s => s.isGuilty);
    if (guiltySuspects.length !== 1) {
      errors.push(`Expected 1 guilty suspect, found ${guiltySuspects.length}`);
    }

    // 6. 이미지 URL 검증
    if (!caseData.imageUrl) {
      warnings.push('Case image URL is missing');
    }

    for (const suspect of suspects) {
      if (!suspect.profileImageUrl) {
        warnings.push(`Suspect ${suspect.id} has no profile image`);
      }
    }

    // 7. 필수 필드 검증
    for (const suspect of suspects) {
      if (!suspect.name || !suspect.archetype || !suspect.background) {
        errors.push(`Suspect ${suspect.id} is missing required fields`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}
```

### 구현 계획

#### Phase 1: 진단 도구 (Diagnostic Tools)

**1.1 케이스 진단 스크립트**

```typescript
// scripts/diagnose-case.ts
async function diagnoseCase(caseId: string) {
  console.log(`🔍 Diagnosing case: ${caseId}\n`);

  // 1. 케이스 데이터 확인
  const caseData = await KVStoreManager.getCase(caseId);
  console.log('📋 Case Data:');
  console.log(`  - ID: ${caseData?.id}`);
  console.log(`  - Date: ${caseData?.date}`);
  console.log(`  - Suspects in case data: ${caseData?.suspects.length}`);
  console.log(`  - Image URL: ${caseData?.imageUrl ? 'Present' : 'Missing'}`);

  // 2. 용의자 데이터 확인
  const suspects = await KVStoreManager.getCaseSuspects(caseId);
  console.log('\n👥 Suspect Records:');
  console.log(`  - Total: ${suspects.length}`);
  for (const suspect of suspects) {
    console.log(`  - ${suspect.id}: ${suspect.name} (${suspect.archetype})`);
    console.log(`    Guilty: ${suspect.isGuilty}`);
    console.log(`    Image: ${suspect.profileImageUrl ? 'Present' : 'Missing'}`);
  }

  // 3. 용의자 Set 확인
  const suspectIds = await KVStoreManager.adapter.sMembers(`case:${caseId}:suspects`);
  console.log('\n🔗 Suspect Set:');
  console.log(`  - Total IDs: ${suspectIds.length}`);
  for (const id of suspectIds) {
    console.log(`  - ${id}`);
  }

  // 4. 불일치 확인
  console.log('\n⚠️  Inconsistencies:');
  if (caseData && caseData.suspects.length !== suspects.length) {
    console.log(`  - Case data has ${caseData.suspects.length} suspects, but ${suspects.length} records found`);
  }
  if (suspects.length !== suspectIds.length) {
    console.log(`  - ${suspects.length} suspect records, but ${suspectIds.length} IDs in set`);
  }
  if (suspects.length !== 3) {
    console.log(`  - Expected 3 suspects, found ${suspects.length}`);
  }

  // 5. 검증 실행
  const validation = await CaseValidator.validateCase(caseId);
  console.log('\n✅ Validation Result:');
  console.log(`  - Valid: ${validation.valid}`);
  if (validation.errors.length > 0) {
    console.log('  - Errors:');
    validation.errors.forEach(err => console.log(`    ❌ ${err}`));
  }
  if (validation.warnings.length > 0) {
    console.log('  - Warnings:');
    validation.warnings.forEach(warn => console.log(`    ⚠️  ${warn}`));
  }
}
```

**1.2 데이터 정리 스크립트**

```typescript
// scripts/clear-case.ts
async function clearCase(caseId: string) {
  console.log(`🧹 Clearing case: ${caseId}\n`);

  // 진단 먼저 실행
  await diagnoseCase(caseId);

  // 사용자 확인
  const confirm = await promptUser('Are you sure you want to delete this case? (yes/no): ');
  if (confirm !== 'yes') {
    console.log('Cancelled.');
    return;
  }

  // 완전 삭제
  await KVStoreManager.clearCaseData(caseId);

  // 검증
  const caseData = await KVStoreManager.getCase(caseId);
  if (caseData === null) {
    console.log('✅ Case successfully deleted');
  } else {
    console.log('❌ Case still exists!');
  }
}
```

#### Phase 2: 데이터 재생성

**2.1 강제 재생성 스크립트 개선**

```typescript
// scripts/regenerate-case.ts 개선
async function regenerateCase(caseId: string, options: {
  withImages: boolean;
  force: boolean;
}) {
  console.log(`🔄 Regenerating case: ${caseId}\n`);

  // 1. 기존 케이스 확인
  const existingCase = await KVStoreManager.getCase(caseId);
  if (existingCase) {
    console.log('⚠️  Existing case found:');
    console.log(`  - Date: ${existingCase.date}`);
    console.log(`  - Suspects: ${existingCase.suspects.length}`);

    if (!options.force) {
      console.log('\n❌ Use --force to overwrite existing case');
      return;
    }
  }

  // 2. 완전 삭제
  console.log('\n🧹 Clearing old data...');
  await KVStoreManager.clearCaseData(caseId);

  // 3. 새 케이스 생성
  console.log('\n🎲 Generating new case...');
  const date = new Date(caseId.replace('case-', ''));
  const generatedCase = await CaseGeneratorService.generateCase({
    date,
    includeImage: options.withImages
  });

  // 4. 검증
  console.log('\n✅ Validating new case...');
  const validation = await CaseValidator.validateCase(caseId);

  if (!validation.valid) {
    console.log('❌ Validation failed:');
    validation.errors.forEach(err => console.log(`  - ${err}`));
    throw new Error('Case validation failed');
  }

  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    validation.warnings.forEach(warn => console.log(`  - ${warn}`));
  }

  // 5. 결과 출력
  console.log('\n🎉 Case regenerated successfully!');
  console.log(`  - ID: ${generatedCase.id}`);
  console.log(`  - Suspects: ${generatedCase.suspects.length}`);
  generatedCase.suspects.forEach(s => {
    console.log(`    - ${s.name} (${s.archetype})`);
  });
}
```

#### Phase 3: 자동 검증 시스템

**3.1 케이스 생성 후 자동 검증**

```typescript
// CaseRepository.createCase() 개선
static async createCase(input: CreateCaseInput, date?: Date): Promise<CaseData> {
  // ... 기존 코드 ...

  // 케이스 저장
  await KVStoreManager.saveCase(caseData);

  // 용의자 저장
  for (let i = 0; i < input.suspects.length; i++) {
    // ... 기존 코드 ...
    await KVStoreManager.saveSuspect(suspectData);
  }

  // ✅ 자동 검증 추가
  const validation = await CaseValidator.validateCase(caseData.id);
  if (!validation.valid) {
    console.error('❌ Case validation failed after creation:');
    validation.errors.forEach(err => console.error(`  - ${err}`));
    
    // 실패 시 롤백
    await KVStoreManager.clearCaseData(caseData.id);
    throw new Error(`Case validation failed: ${validation.errors.join(', ')}`);
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Case validation warnings:');
    validation.warnings.forEach(warn => console.warn(`  - ${warn}`));
  }

  console.log(`✅ Case created and validated: ${caseId} for date ${dateStr}`);

  return caseData;
}
```

### 테스트 계획

#### Unit Tests

```typescript
describe('KVStoreManager', () => {
  it('should clear all case data', async () => {
    // Given: 케이스와 용의자 데이터 저장
    await KVStoreManager.saveCase(mockCaseData);
    await KVStoreManager.saveSuspect(mockSuspect1);
    await KVStoreManager.saveSuspect(mockSuspect2);
    await KVStoreManager.saveSuspect(mockSuspect3);

    // When: clearCaseData 호출
    await KVStoreManager.clearCaseData('case-2025-10-17');

    // Then: 모든 데이터 삭제 확인
    const caseData = await KVStoreManager.getCase('case-2025-10-17');
    expect(caseData).toBeNull();

    const suspects = await KVStoreManager.getCaseSuspects('case-2025-10-17');
    expect(suspects).toHaveLength(0);

    const suspectIds = await adapter.sMembers('case:case-2025-10-17:suspects');
    expect(suspectIds).toHaveLength(0);
  });

  it('should validate case after creation', async () => {
    // Given: 유효한 케이스 입력
    const input = createValidCaseInput();

    // When: 케이스 생성
    const caseData = await CaseRepository.createCase(input);

    // Then: 검증 통과
    const validation = await CaseValidator.validateCase(caseData.id);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should reject invalid case', async () => {
    // Given: 잘못된 케이스 입력 (용의자 4명)
    const input = createInvalidCaseInput();

    // When/Then: 케이스 생성 실패
    await expect(CaseRepository.createCase(input)).rejects.toThrow();
  });
});
```

### 배포 계획

#### Step 1: 로컬 테스트
```bash
# 1. 어댑터 설정
KVStoreManager.setAdapter(new FileStorageAdapter('./local-data'));

# 2. 케이스 생성 테스트
npx tsx scripts/regenerate-case.ts case-2025-10-17 --with-images --force

# 3. 검증
npx tsx scripts/diagnose-case.ts case-2025-10-17
```

#### Step 2: Devvit 테스트
```bash
# 1. Devvit playtest 시작
npm run dev

# 2. 브라우저에서 확인
# - 용의자 3명 표시되는지
# - 이미지 로드되는지
# - 이름이 올바른지

# 3. 터미널 로그 확인
# - clearCaseData() 실행 확인
# - 용의자 Set 크기 확인 (3명)
```

#### Step 3: 프로덕션 배포
```bash
# 1. 기존 케이스 백업
npx tsx scripts/backup-case.ts case-2025-10-17

# 2. 재생성
npx tsx scripts/regenerate-case.ts case-2025-10-17 --with-images --force

# 3. 검증
npx tsx scripts/diagnose-case.ts case-2025-10-17

# 4. 배포
npm run deploy
```

## 요약

### 문제의 핵심
1. **잘못된 데이터가 Redis에 저장됨** (이서연, 정우진, 윤지혁, 서도윤 - 4명)
2. **clearCaseData()가 제대로 실행되지 않음** (중복 데이터 누적)
3. **이미지 URL이 없거나 유효하지 않음** (플레이스홀더만 표시)

### 해결 방법
1. **완전한 데이터 재생성** (clear + regenerate)
2. **clearCaseData() 강화** (모든 관련 키 삭제)
3. **자동 검증 시스템** (생성 후 즉시 검증)

### 예상 결과
- ✅ 용의자 3명 (이서연, 박준호, 최민지)
- ✅ 이미지 정상 로드
- ✅ 데이터 일관성 보장
