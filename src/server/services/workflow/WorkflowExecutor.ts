/**
 * WorkflowExecutor.ts
 *
 * 재시도, Circuit Breaker, Fallback 전략 통합
 * - Exponential backoff 재시도
 * - Circuit Breaker로 시스템 보호
 * - Fallback으로 서비스 연속성 보장
 */

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  backoffMultiplier: number;
  timeout?: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;  // 실패 N회 시 차단
  resetTimeout: number;       // 차단 후 재시도까지 대기 시간 (ms)
}

export enum CircuitState {
  CLOSED = 'CLOSED',      // 정상 작동
  OPEN = 'OPEN',          // 차단됨 (모든 요청 거부)
  HALF_OPEN = 'HALF_OPEN' // 테스트 중 (1개 요청만 허용)
}

/**
 * Circuit Breaker 패턴 구현
 *
 * 연속 실패 시 시스템을 보호하기 위해 일시적으로 요청 차단
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  /**
   * Circuit Breaker를 통한 함수 실행
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // OPEN 상태: 차단됨
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      const timeSinceLastFailure = now - this.lastFailureTime;

      if (timeSinceLastFailure < this.config.resetTimeout) {
        throw new Error(
          `Circuit breaker is OPEN - requests blocked for ${Math.round((this.config.resetTimeout - timeSinceLastFailure) / 1000)}s more`
        );
      }

      // 재시도 시간 도래 → HALF_OPEN
      this.state = CircuitState.HALF_OPEN;
      console.log('🔄 Circuit breaker: OPEN → HALF_OPEN');
    }

    try {
      const result = await fn();

      // 성공 시 CLOSED로 복귀
      if (this.state === CircuitState.HALF_OPEN) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        console.log('✅ Circuit breaker: HALF_OPEN → CLOSED');
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      // 임계값 도달 시 OPEN
      if (this.failureCount >= this.config.failureThreshold) {
        this.state = CircuitState.OPEN;
        console.error(
          `❌ Circuit breaker OPEN (failures: ${this.failureCount}, threshold: ${this.config.failureThreshold})`
        );
      }

      throw error;
    }
  }

  /**
   * Circuit Breaker 상태 조회
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Circuit Breaker 수동 리셋
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    console.log('🔄 Circuit breaker manually reset');
  }

  /**
   * 현재 실패 횟수 조회
   */
  getFailureCount(): number {
    return this.failureCount;
  }
}

/**
 * Workflow Executor
 *
 * 재시도, Circuit Breaker, Fallback 전략을 통합하여 안정적인 워크플로우 실행
 */
export class WorkflowExecutor {
  private geminiCircuitBreaker: CircuitBreaker;

  constructor(config?: Partial<CircuitBreakerConfig>) {
    const defaultConfig: CircuitBreakerConfig = {
      failureThreshold: 3,     // 3회 실패 시 차단
      resetTimeout: 60_000     // 1분 후 재시도
    };

    this.geminiCircuitBreaker = new CircuitBreaker({
      ...defaultConfig,
      ...config
    });
  }

  /**
   * 재시도 로직이 포함된 실행
   *
   * Exponential backoff로 재시도 간격 증가
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    policy: RetryPolicy,
    context: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
      try {
        console.log(`🔄 ${context} - Attempt ${attempt}/${policy.maxAttempts}`);

        // Circuit Breaker 통과
        const result = await this.geminiCircuitBreaker.execute(fn);

        console.log(`✅ ${context} - Success on attempt ${attempt}`);
        return result;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ ${context} - Attempt ${attempt} failed:`, (error as Error).message);

        // Circuit Breaker가 OPEN된 경우 즉시 중단
        if (this.geminiCircuitBreaker.getState() === CircuitState.OPEN) {
          console.error(`🛑 ${context} - Circuit breaker is OPEN, stopping retries`);
          throw error;
        }

        // 마지막 시도가 아니면 대기
        if (attempt < policy.maxAttempts) {
          const waitMs = policy.backoffMs * Math.pow(policy.backoffMultiplier, attempt - 1);
          console.log(`⏳ Waiting ${waitMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
        }
      }
    }

    throw new Error(
      `${context} failed after ${policy.maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Fallback 전략
   *
   * 주 작업 실패 시 대체 작업 실행
   */
  async executeWithFallback<T>(
    primary: () => Promise<T>,
    fallback: () => T | Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await primary();
    } catch (error) {
      console.warn(`⚠️  ${context} failed, using fallback:`, (error as Error).message);
      return await fallback();
    }
  }

  /**
   * 타임아웃 포함 실행
   */
  async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    context: string
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`${context} timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  /**
   * 재시도 + Fallback 조합
   */
  async executeWithRetryAndFallback<T>(
    primary: () => Promise<T>,
    fallback: () => T | Promise<T>,
    policy: RetryPolicy,
    context: string
  ): Promise<T> {
    try {
      return await this.executeWithRetry(primary, policy, context);
    } catch (error) {
      console.warn(`⚠️  ${context} failed after retries, using fallback:`, (error as Error).message);
      return await fallback();
    }
  }

  /**
   * Circuit Breaker 상태 확인
   */
  getCircuitBreakerState(): CircuitState {
    return this.geminiCircuitBreaker.getState();
  }

  /**
   * Circuit Breaker 수동 리셋
   */
  resetCircuitBreaker(): void {
    this.geminiCircuitBreaker.reset();
  }

  /**
   * Circuit Breaker 실패 횟수 조회
   */
  getFailureCount(): number {
    return this.geminiCircuitBreaker.getFailureCount();
  }
}

/**
 * 기본 재시도 정책
 */
export const DEFAULT_RETRY_POLICIES = {
  /**
   * 텍스트 생성용 (3회 재시도, 1초부터 시작)
   */
  TEXT_GENERATION: {
    maxAttempts: 3,
    backoffMs: 1000,
    backoffMultiplier: 2,
    timeout: 30000
  } as RetryPolicy,

  /**
   * 이미지 생성용 (3회 재시도, 2초부터 시작)
   */
  IMAGE_GENERATION: {
    maxAttempts: 3,
    backoffMs: 2000,
    backoffMultiplier: 1.5,
    timeout: 60000
  } as RetryPolicy,

  /**
   * 빠른 재시도 (2회만, 500ms부터)
   */
  QUICK: {
    maxAttempts: 2,
    backoffMs: 500,
    backoffMultiplier: 2,
    timeout: 10000
  } as RetryPolicy,

  /**
   * 긴 재시도 (5회, 3초부터)
   */
  EXTENDED: {
    maxAttempts: 5,
    backoffMs: 3000,
    backoffMultiplier: 2,
    timeout: 120000
  } as RetryPolicy
};
