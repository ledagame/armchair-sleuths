/**
 * TransactionManager.ts
 *
 * Redis KV의 트랜잭션 한계를 보상 트랜잭션(Saga)으로 극복
 * - 각 단계별 실행 및 보상 함수 정의
 * - 실패 시 자동 롤백
 * - 트랜잭션 로그 기록
 */

export interface TransactionStep {
  execute: () => Promise<void>;
  compensate: () => Promise<void>;
  description: string;
}

export interface TransactionLog {
  startedAt: number;
  completedAt?: number;
  status: 'running' | 'completed' | 'rolled_back' | 'failed';
  steps: Array<{
    description: string;
    executed: boolean;
    compensated: boolean;
    error?: string;
  }>;
}

/**
 * Transaction Manager
 *
 * Saga 패턴 구현으로 원자적 트랜잭션 흉내
 */
export class TransactionManager {
  private executedSteps: TransactionStep[] = [];
  private transactionLog: TransactionLog;

  constructor() {
    this.transactionLog = {
      startedAt: Date.now(),
      status: 'running',
      steps: []
    };
  }

  /**
   * 트랜잭션 실행
   *
   * - 각 단계를 순차 실행
   * - 실패 시 이미 실행된 단계를 역순으로 보상
   */
  async executeTransaction(steps: TransactionStep[]): Promise<void> {
    this.executedSteps = [];
    this.transactionLog = {
      startedAt: Date.now(),
      status: 'running',
      steps: steps.map(s => ({
        description: s.description,
        executed: false,
        compensated: false
      }))
    };

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        console.log(`🔄 Executing step ${i + 1}/${steps.length}: ${step.description}`);

        await step.execute();

        this.executedSteps.push(step);
        this.transactionLog.steps[i].executed = true;
        console.log(`✅ Completed step ${i + 1}/${steps.length}: ${step.description}`);
      }

      this.transactionLog.status = 'completed';
      this.transactionLog.completedAt = Date.now();
      console.log(`✅ Transaction completed: ${steps.length} steps executed`);

    } catch (error) {
      const failedStep = this.executedSteps.length + 1;
      console.error(`❌ Transaction failed at step ${failedStep}/${steps.length}`);
      console.error(`Error:`, error);

      // 실패한 단계의 에러 기록
      if (failedStep <= steps.length) {
        this.transactionLog.steps[failedStep - 1].error = (error as Error).message;
      }

      // 보상 트랜잭션 실행 (역순)
      await this.rollback();

      this.transactionLog.status = 'rolled_back';
      throw error;
    }
  }

  /**
   * 롤백 (보상 트랜잭션)
   *
   * 실행된 단계를 역순으로 보상
   */
  private async rollback(): Promise<void> {
    if (this.executedSteps.length === 0) {
      console.log('📝 No steps to rollback');
      return;
    }

    console.log(`🔄 Rolling back ${this.executedSteps.length} step(s)...`);

    // 역순으로 보상
    for (let i = this.executedSteps.length - 1; i >= 0; i--) {
      const step = this.executedSteps[i];
      try {
        console.log(`🔄 Compensating step ${i + 1}: ${step.description}`);
        await step.compensate();
        this.transactionLog.steps[i].compensated = true;
        console.log(`✅ Compensated step ${i + 1}: ${step.description}`);
      } catch (compensationError) {
        console.error(`❌ Compensation failed for step ${i + 1}: ${step.description}`, compensationError);
        this.transactionLog.steps[i].error = `Compensation failed: ${(compensationError as Error).message}`;
        // 보상 실패 시에도 계속 진행 (최선을 다해 롤백)
      }
    }

    this.executedSteps = [];
    console.log(`✅ Rollback completed`);
  }

  /**
   * 트랜잭션 로그 조회
   */
  getTransactionLog(): TransactionLog {
    return this.transactionLog;
  }

  /**
   * 트랜잭션 상태 조회
   */
  getStatus(): TransactionLog['status'] {
    return this.transactionLog.status;
  }

  /**
   * 트랜잭션 소요 시간 조회 (ms)
   */
  getDuration(): number {
    const endTime = this.transactionLog.completedAt || Date.now();
    return endTime - this.transactionLog.startedAt;
  }
}

/**
 * 케이스 생성 트랜잭션 헬퍼
 */
export class CaseCreationTransaction {
  /**
   * 케이스 생성 트랜잭션 단계 생성
   */
  static createSteps(
    caseData: any,
    suspects: any[],
    kvStoreManager: any
  ): TransactionStep[] {
    return [
      // Step 1: 케이스 저장
      {
        description: `Save case data (ID: ${caseData.id})`,
        execute: async () => {
          await kvStoreManager.saveCase(caseData);
        },
        compensate: async () => {
          // 케이스 삭제
          await kvStoreManager.deleteCase(caseData.id);
          console.log(`🗑️  Compensated: Deleted case ${caseData.id}`);
        }
      },

      // Step 2: 용의자 저장 (배치)
      {
        description: `Save ${suspects.length} suspect(s)`,
        execute: async () => {
          for (const suspect of suspects) {
            await kvStoreManager.saveSuspect(suspect);
          }
        },
        compensate: async () => {
          // 용의자 삭제
          for (const suspect of suspects) {
            try {
              const adapter = kvStoreManager.adapter;
              if (adapter) {
                await adapter.del(`suspect:${suspect.id}`);
                console.log(`🗑️  Compensated: Deleted suspect ${suspect.id}`);
              }
            } catch (error) {
              console.error(`Failed to delete suspect ${suspect.id}:`, error);
            }
          }
        }
      },

      // Step 3: 날짜 인덱스 업데이트
      {
        description: `Update date index (date: ${caseData.date})`,
        execute: async () => {
          const adapter = kvStoreManager.adapter;
          if (!adapter) {
            throw new Error('Storage adapter not initialized');
          }
          const dateKey = `case:date:${caseData.date}`;
          await adapter.set(dateKey, caseData.id);
        },
        compensate: async () => {
          // 날짜 인덱스 삭제
          const adapter = kvStoreManager.adapter;
          if (adapter) {
            const dateKey = `case:date:${caseData.date}`;
            await adapter.del(dateKey);
            console.log(`🗑️  Compensated: Deleted date index ${dateKey}`);
          }
        }
      },

      // Step 4: 용의자 인덱스 업데이트
      {
        description: `Update suspect indexes for case ${caseData.id}`,
        execute: async () => {
          const adapter = kvStoreManager.adapter;
          if (!adapter) {
            throw new Error('Storage adapter not initialized');
          }
          const caseKey = `case:${caseData.id}:suspects`;
          for (const suspect of suspects) {
            await adapter.sAdd(caseKey, suspect.id);
          }
        },
        compensate: async () => {
          // 용의자 인덱스 삭제
          const adapter = kvStoreManager.adapter;
          if (adapter) {
            const caseKey = `case:${caseData.id}:suspects`;
            await adapter.del(caseKey);
            console.log(`🗑️  Compensated: Deleted suspect index ${caseKey}`);
          }
        }
      }
    ];
  }
}
