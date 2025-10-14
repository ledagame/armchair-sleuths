---
name: successful-patterns
description: 프로젝트에서 성공적으로 사용된 패턴들
inclusion: always
---

# Successful Patterns

이 문서는 과거 프로젝트에서 성공적으로 사용된 패턴들을 기록합니다. 새 프로젝트 시작 시 이 패턴들을 참조하여 검증된 접근 방법을 사용하세요.

## 🔐 인증 & 보안 패턴

### Pattern 1: JWT + Refresh Token
**사용 시기:** 사용자 인증이 필요한 모든 프로젝트

**구현:**
```typescript
// Access Token: 15분
// Refresh Token: 7일
interface TokenPair {
  accessToken: string;  // 짧은 수명
  refreshToken: string; // 긴 수명
}

// Token rotation으로 보안 강화
async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const user = await verifyRefreshToken(refreshToken);
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  
  // 기존 refresh token 무효화
  await revokeRefreshToken(refreshToken);
  
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
}
```

**장점:**
- ✅ 보안성 높음 (짧은 access token 수명)
- ✅ 사용자 경험 좋음 (자동 갱신)
- ✅ 확장성 좋음 (stateless)

**주의사항:**
- ⚠️ Refresh token은 httpOnly cookie에 저장
- ⚠️ Token rotation 반드시 구현
- ⚠️ Refresh token 저장소 필요 (Redis)

### Pattern 2: bcrypt 비밀번호 해싱
**사용 시기:** 비밀번호 저장이 필요한 모든 경우

**구현:**
```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // 보안과 성능의 균형

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(
  password: string, 
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**장점:**
- ✅ 안전한 해싱 알고리즘
- ✅ Salt 자동 생성
- ✅ 업계 표준

**주의사항:**
- ⚠️ Salt rounds는 10-12 권장
- ⚠️ 비동기 함수 사용 (블로킹 방지)

### Pattern 3: Rate Limiting
**사용 시기:** 모든 공개 API 엔드포인트

**구현:**
```typescript
import rateLimit from 'express-rate-limit';

// 일반 API: 100 requests/15분
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});

// 인증 API: 5 requests/15분 (더 엄격)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.'
});

app.use('/api/', apiLimiter);
app.use('/auth/', authLimiter);
```

**장점:**
- ✅ DDoS 방어
- ✅ Brute force 방지
- ✅ 서버 부하 감소

## 🗄️ 데이터베이스 패턴

### Pattern 4: Repository Pattern
**사용 시기:** 데이터 접근 로직을 분리하고 싶을 때

**구현:**
```typescript
// Repository interface
interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserDto): Promise<User>;
  update(id: string, user: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

// Implementation
class PostgresUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    return db.user.findUnique({ where: { id } });
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({ where: { email } });
  }
  
  // ... other methods
}
```

**장점:**
- ✅ 테스트 용이 (mocking 쉬움)
- ✅ 데이터베이스 교체 용이
- ✅ 비즈니스 로직 분리

### Pattern 5: Soft Delete
**사용 시기:** 데이터 복구가 필요할 수 있는 경우

**구현:**
```typescript
interface SoftDeletable {
  deletedAt: Date | null;
}

class User implements SoftDeletable {
  id: string;
  email: string;
  deletedAt: Date | null;
}

// Soft delete
async function softDelete(id: string): Promise<void> {
  await db.user.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}

// 기본 쿼리에서 삭제된 항목 제외
async function findActive(): Promise<User[]> {
  return db.user.findMany({
    where: { deletedAt: null }
  });
}
```

**장점:**
- ✅ 데이터 복구 가능
- ✅ 감사 추적 용이
- ✅ 실수 방지

### Pattern 6: Optimistic Locking
**사용 시기:** 동시성 제어가 필요한 경우

**구현:**
```typescript
interface Versioned {
  version: number;
}

async function updateWithOptimisticLock(
  id: string,
  version: number,
  data: UpdateDto
): Promise<User> {
  const result = await db.user.updateMany({
    where: { 
      id,
      version // 버전이 일치하는 경우에만 업데이트
    },
    data: {
      ...data,
      version: version + 1 // 버전 증가
    }
  });
  
  if (result.count === 0) {
    throw new ConflictError('Data has been modified by another user');
  }
  
  return db.user.findUnique({ where: { id } });
}
```

**장점:**
- ✅ 동시 수정 감지
- ✅ 데이터 일관성 보장
- ✅ 성능 좋음 (락 불필요)

## 🎨 프론트엔드 패턴

### Pattern 7: Custom Hooks
**사용 시기:** 로직 재사용이 필요한 경우

**구현:**
```typescript
// useAuth hook
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  async function checkAuth() {
    try {
      const user = await fetchCurrentUser();
      setUser(user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }
  
  async function login(email: string, password: string) {
    const user = await loginApi(email, password);
    setUser(user);
  }
  
  async function logout() {
    await logoutApi();
    setUser(null);
  }
  
  return { user, loading, login, logout };
}

// Usage
function App() {
  const { user, loading, login, logout } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <Login onLogin={login} />;
  return <Dashboard user={user} onLogout={logout} />;
}
```

**장점:**
- ✅ 로직 재사용
- ✅ 테스트 용이
- ✅ 코드 정리

### Pattern 8: Error Boundary
**사용 시기:** 에러 처리가 필요한 모든 React 앱

**구현:**
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // 에러 로깅 서비스에 전송
    logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**장점:**
- ✅ 앱 전체 크래시 방지
- ✅ 사용자 친화적 에러 표시
- ✅ 에러 로깅 중앙화

## 🔄 API 패턴

### Pattern 9: API Response Wrapper
**사용 시기:** 일관된 API 응답 형식이 필요한 경우

**구현:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    }
  };
}

function errorResponse(
  code: string, 
  message: string, 
  details?: any
): ApiResponse<never> {
  return {
    success: false,
    error: { code, message, details },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    }
  };
}

// Usage
app.get('/users/:id', async (req, res) => {
  try {
    const user = await findUser(req.params.id);
    res.json(successResponse(user));
  } catch (error) {
    res.status(404).json(errorResponse(
      'USER_NOT_FOUND',
      'User not found',
      { userId: req.params.id }
    ));
  }
});
```

**장점:**
- ✅ 일관된 응답 형식
- ✅ 에러 처리 표준화
- ✅ 클라이언트 처리 용이

### Pattern 10: Middleware Chain
**사용 시기:** 공통 로직을 재사용하고 싶을 때

**구현:**
```typescript
// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json(errorResponse('UNAUTHORIZED', 'Invalid token'));
  }
};

// Authorization middleware
const authorize = (...roles: string[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(errorResponse(
        'FORBIDDEN',
        'Insufficient permissions'
      ));
    }
    next();
  };
};

// Validation middleware
const validate = (schema: Schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(
        'VALIDATION_ERROR',
        error.message
      ));
    }
    next();
  };
};

// Usage: Middleware chain
app.post('/admin/users',
  authenticate,
  authorize('admin'),
  validate(createUserSchema),
  createUserHandler
);
```

**장점:**
- ✅ 코드 재사용
- ✅ 관심사 분리
- ✅ 테스트 용이

## 🧪 테스팅 패턴

### Pattern 11: Test Fixtures
**사용 시기:** 테스트 데이터가 필요한 경우

**구현:**
```typescript
// fixtures/user.ts
export const createUserFixture = (overrides?: Partial<User>): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date('2025-01-01'),
  ...overrides
});

// Usage in tests
describe('UserService', () => {
  it('should update user', async () => {
    const user = createUserFixture();
    const updated = await userService.update(user.id, {
      name: 'Updated Name'
    });
    
    expect(updated.name).toBe('Updated Name');
  });
});
```

**장점:**
- ✅ 테스트 데이터 일관성
- ✅ 테스트 작성 빠름
- ✅ 유지보수 용이

## 📊 모니터링 패턴

### Pattern 12: Structured Logging
**사용 시기:** 로그 분석이 필요한 모든 프로젝트

**구현:**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// Usage
logger.info('User logged in', {
  userId: user.id,
  email: user.email,
  ip: req.ip,
  userAgent: req.headers['user-agent']
});

logger.error('Payment failed', {
  userId: user.id,
  amount: payment.amount,
  error: error.message,
  stack: error.stack
});
```

**장점:**
- ✅ 로그 분석 용이
- ✅ 구조화된 데이터
- ✅ 검색 가능

## 🎯 패턴 선택 가이드

### 프로젝트 시작 시
1. **인증 필요?** → JWT + Refresh Token (Pattern 1)
2. **비밀번호 저장?** → bcrypt (Pattern 2)
3. **공개 API?** → Rate Limiting (Pattern 3)
4. **데이터 접근?** → Repository Pattern (Pattern 4)
5. **React 앱?** → Custom Hooks (Pattern 7), Error Boundary (Pattern 8)

### 문제 발생 시
- **동시성 문제?** → Optimistic Locking (Pattern 6)
- **데이터 복구 필요?** → Soft Delete (Pattern 5)
- **API 응답 불일치?** → API Response Wrapper (Pattern 9)
- **공통 로직 중복?** → Middleware Chain (Pattern 10)

---

**패턴 추가 방법:**
1. 새로운 패턴이 3번 이상 성공적으로 사용됨
2. 명확한 장점이 있음
3. 재사용 가능함
4. 이 문서에 추가하고 팀과 공유
