/**
 * SuspectAIService.ts
 *
 * AI 용의자 대화 생성 서비스
 * Gemini + EmotionalStateManager 통합
 */

import { GeminiClient, type GeminiTextOptions } from '../gemini/GeminiClient';
import { EmotionalStateManager, type EmotionalTone } from './EmotionalStateManager';
import { KVStoreManager, type SuspectData } from '../repositories/kv/KVStoreManager';

export interface ChatMessage {
  role: 'user' | 'suspect';
  content: string;
  timestamp: number;
}

export interface ChatResponse {
  suspectId: string;
  suspectName: string;
  response: string;
  emotionalState: {
    suspicionLevel: number;
    tone: EmotionalTone;
  };
  conversationCount: number;
}

/**
 * AI 용의자 대화 서비스
 */
export class SuspectAIService {
  private geminiClient: GeminiClient;

  constructor(geminiClient: GeminiClient) {
    this.geminiClient = geminiClient;
  }

  /**
   * 사용자 질문에 AI 용의자 응답 생성
   */
  async generateResponse(
    suspectId: string,
    userId: string,
    userQuestion: string
  ): Promise<ChatResponse> {
    console.log(`🗣️ Generating response for suspect ${suspectId}...`);

    // 1. 용의자 정보 조회
    const suspect = await KVStoreManager.getSuspect(suspectId);
    if (!suspect) {
      throw new Error(`Suspect not found: ${suspectId}`);
    }

    // 2. 대화 기록 조회
    const conversation = await KVStoreManager.getConversation(
      suspect.caseId,
      suspectId,
      userId
    );

    const conversationHistory: ChatMessage[] = conversation?.messages || [];

    // 3. 감정 상태 업데이트 (질문 영향 반영)
    const newEmotionalState = await EmotionalStateManager.handleConversationUpdate(
      suspectId,
      userQuestion
    );

    // 4. AI 응답 생성
    const aiResponse = await this.generateAIResponse(
      suspect,
      userQuestion,
      conversationHistory,
      newEmotionalState.tone
    );

    // 5. 대화 저장
    await KVStoreManager.addMessage(
      suspect.caseId,
      suspectId,
      userId,
      'user',
      userQuestion
    );

    await KVStoreManager.addMessage(
      suspect.caseId,
      suspectId,
      userId,
      'suspect',
      aiResponse
    );

    console.log(`✅ Response generated for ${suspect.name}`);

    return {
      suspectId: suspect.id,
      suspectName: suspect.name,
      response: aiResponse,
      emotionalState: {
        suspicionLevel: newEmotionalState.suspicionLevel,
        tone: newEmotionalState.tone
      },
      conversationCount: conversationHistory.length + 2 // +2 for new user/suspect messages
    };
  }

  /**
   * AI 응답 생성 (Gemini)
   */
  private async generateAIResponse(
    suspect: SuspectData,
    userQuestion: string,
    conversationHistory: ChatMessage[],
    currentTone: EmotionalTone
  ): Promise<string> {
    const prompt = this.buildSuspectPrompt(
      suspect,
      userQuestion,
      conversationHistory,
      currentTone
    );

    const options: GeminiTextOptions = {
      temperature: 0.9, // 더 다양한 응답
      maxTokens: 1024
    };

    const response = await this.geminiClient.generateText(prompt, options);

    return response.text.trim();
  }

  /**
   * 용의자 AI 프롬프트 생성
   */
  private buildSuspectPrompt(
    suspect: SuspectData,
    userQuestion: string,
    conversationHistory: ChatMessage[],
    currentTone: EmotionalTone
  ): string {
    const toneGuidance = EmotionalStateManager.getToneGuidance(currentTone);

    // 대화 기록 포맷팅
    const historyText = conversationHistory
      .slice(-5) // 최근 5개만
      .map(msg => {
        const role = msg.role === 'user' ? '탐정' : suspect.name;
        return `${role}: ${msg.content}`;
      })
      .join('\n');

    return `당신은 살인 미스터리 게임의 용의자입니다.

**당신의 정체:**
- 이름: ${suspect.name}
- 원형: ${suspect.archetype}
- 배경: ${suspect.background}
- 성격: ${suspect.personality}
- ${suspect.isGuilty ? '당신은 **진범**입니다.' : '당신은 **무고**합니다.'}

**현재 감정 상태:**
- ${toneGuidance}

**대화 기록:**
${historyText || '(대화 시작)'}

**탐정의 질문:**
${userQuestion}

**응답 규칙:**
1. **캐릭터 일관성**: 배경과 성격에 맞게 답변
2. **감정 상태 반영**: 현재 tone에 맞는 말투와 태도
3. **정보 제공**: ${suspect.isGuilty ? '진범이므로 거짓말하되 모순 없이' : '무고하므로 진실하게 답변'}
4. **자연스러운 대화**: 로봇 같지 않고 인간적으로
5. **간결함**: 2-4문장으로 답변
6. **한국어 사용**: 자연스러운 한국어 회화체

당신의 답변:`;
  }

  /**
   * 용의자 대화 기록 조회
   */
  async getConversationHistory(
    suspectId: string,
    userId: string
  ): Promise<ChatMessage[]> {
    const suspect = await KVStoreManager.getSuspect(suspectId);
    if (!suspect) {
      throw new Error(`Suspect not found: ${suspectId}`);
    }

    const conversation = await KVStoreManager.getConversation(
      suspect.caseId,
      suspectId,
      userId
    );

    return conversation?.messages || [];
  }

  /**
   * 대화 초기화 (테스트/관리용)
   */
  async clearConversation(
    caseId: string,
    suspectId: string,
    userId: string
  ): Promise<void> {
    const conversation = await KVStoreManager.getConversation(
      caseId,
      suspectId,
      userId
    );

    if (conversation) {
      conversation.messages = [];
      conversation.lastMessageAt = Date.now();
      await KVStoreManager.saveConversation(conversation);
    }

    console.log(`✅ Conversation cleared: ${suspectId} - ${userId}`);
  }

  /**
   * 모든 용의자와의 대화 요약
   */
  async summarizeAllConversations(
    caseId: string,
    userId: string
  ): Promise<{
    suspectId: string;
    suspectName: string;
    messageCount: number;
    lastMessageAt: number;
  }[]> {
    const suspects = await KVStoreManager.getCaseSuspects(caseId);

    const summaries = await Promise.all(
      suspects.map(async suspect => {
        const conversation = await KVStoreManager.getConversation(
          caseId,
          suspect.id,
          userId
        );

        return {
          suspectId: suspect.id,
          suspectName: suspect.name,
          messageCount: conversation?.messages.length || 0,
          lastMessageAt: conversation?.lastMessageAt || 0
        };
      })
    );

    return summaries;
  }
}

/**
 * 싱글톤 인스턴스 생성 헬퍼
 */
export function createSuspectAIService(geminiClient: GeminiClient): SuspectAIService {
  return new SuspectAIService(geminiClient);
}
