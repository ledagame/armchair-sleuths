/**
 * SuspectAIService.ts
 *
 * AI 용의자 대화 생성 서비스
 * Gemini + EmotionalStateManager 통합
 */

import { GeminiClient, type GeminiTextOptions } from '../gemini/GeminiClient';
import { EmotionalStateManager, type EmotionalTone } from './EmotionalStateManager';
import { KVStoreManager, type SuspectData } from '../repositories/kv/KVStoreManager';
import {
  getArchetypeData,
  getArchetypeSpeechPatterns,
  getEmotionalStateFromSuspicion,
  type ArchetypeName,
  type EmotionalStateName
} from '../prompts/ArchetypePrompts';

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
   * 용의자 AI 프롬프트 생성 (Enhanced with suspect-ai-prompter skill)
   */
  private buildSuspectPrompt(
    suspect: SuspectData,
    userQuestion: string,
    conversationHistory: ChatMessage[],
    currentTone: EmotionalTone
  ): string {
    // Get emotional state from suspicion level (0-100 → COOPERATIVE/NERVOUS/DEFENSIVE/AGGRESSIVE)
    const suspicionLevel =
      currentTone === 'cooperative'
        ? 20
        : currentTone === 'nervous'
          ? 40
          : currentTone === 'defensive'
            ? 65
            : 90;

    const emotionalState = getEmotionalStateFromSuspicion(suspicionLevel);

    // Get archetype-specific data
    const archetypeData = getArchetypeData(suspect.archetype as ArchetypeName);

    if (!archetypeData) {
      // Fallback to simple prompt if archetype not found
      console.warn(`Archetype not found: ${suspect.archetype}, using fallback prompt`);
      return this.buildFallbackPrompt(suspect, userQuestion, conversationHistory, currentTone);
    }

    // Get speech patterns for current emotional state
    const speechPatterns = getArchetypeSpeechPatterns(
      suspect.archetype as ArchetypeName,
      emotionalState
    );

    // Format conversation history
    const historyText = conversationHistory
      .slice(-5) // Last 5 messages
      .map(msg => {
        const role = msg.role === 'user' ? 'Detective' : suspect.name;
        return `${role}: ${msg.content}`;
      })
      .join('\n');

    // Build enhanced prompt based on prompt-templates.md structure
    return `# CHARACTER IDENTITY & BACKGROUND

You are ${suspect.name}, a ${suspect.archetype}.

${suspect.background}

Your current situation: You are being questioned about a murder. The victim is ${suspect.victim || 'the victim'}. You are one of the suspects.

# CORE PERSONALITY & VALUES

**Personality Traits:**
${archetypeData.personality.join('\n')}

**Character Definition:**
${archetypeData.definition}

# CURRENT EMOTIONAL STATE

**Suspicion Level:** ${suspicionLevel}/100
**Emotional State:** ${emotionalState}

**Current Mindset:** ${archetypeData.speechPatterns[emotionalState].mindset}

**Tone Guidance:** ${archetypeData.speechPatterns[emotionalState].tone}

# GUILTY/INNOCENT STATUS

${
  suspect.isGuilty
    ? `You are GUILTY of this crime. You committed the murder.

**Response Strategy:**
- Deny involvement but don't be too defensive
- Provide partial truths mixed with lies
- Create plausible alternative explanations
- Show appropriate emotional responses for an innocent person
- Avoid direct contradictions that can be easily proven false
- Under high pressure, you may slip and reveal inconsistencies`
    : `You are INNOCENT of this crime. You did not commit the murder.

**Response Strategy:**
- Tell the truth about what you know
- Show genuine confusion about why you're a suspect
- Provide honest details that can be verified
- Express appropriate concern about the investigation
- Don't have knowledge of incriminating details only the killer would know
- Your emotional responses reflect genuine innocence`
}

# SPEECH PATTERNS & STYLE

**Your Natural Speaking Style (${suspect.archetype}):**
${speechPatterns.slice(0, 3).join('\n')}

**Common Vocabulary:**
${archetypeData.vocabulary.primary.join(', ')}

# CONVERSATION HISTORY

${historyText || '(Beginning of conversation)'}

# RESPONSE GUIDELINES

1. **Stay in Character**: Maintain ${suspect.archetype} personality at all times
2. **Match Emotional State**: Your tone must reflect ${emotionalState} consistently
3. **Speech Pattern Consistency**: Use the speech patterns shown above as examples
4. **Appropriate Information Disclosure**: Reveal information according to your ${suspect.isGuilty ? 'GUILTY' : 'INNOCENT'} status
5. **Natural English**: Speak in natural, conversational English (will be translated to Korean)
6. **Length Control**: Keep responses 2-4 sentences (15-80 words typically)
7. **Show Don't Tell**: Demonstrate character through word choice, not explicit statements

---

Now respond to the detective's question in character as ${suspect.name}:

Detective: ${userQuestion}

${suspect.name}:`;
  }

  /**
   * Fallback prompt for unknown archetypes
   */
  private buildFallbackPrompt(
    suspect: SuspectData,
    userQuestion: string,
    conversationHistory: ChatMessage[],
    currentTone: EmotionalTone
  ): string {
    const toneGuidance = EmotionalStateManager.getToneGuidance(currentTone);

    const historyText = conversationHistory
      .slice(-5)
      .map(msg => {
        const role = msg.role === 'user' ? 'Detective' : suspect.name;
        return `${role}: ${msg.content}`;
      })
      .join('\n');

    return `You are ${suspect.name}, a suspect in a murder investigation.

**Your Character:**
- Background: ${suspect.background}
- Personality: ${suspect.personality}
- ${suspect.isGuilty ? 'You are GUILTY and must lie convincingly.' : 'You are INNOCENT and tell the truth.'}

**Current Emotional State:**
${toneGuidance}

**Conversation History:**
${historyText || '(Beginning of conversation)'}

**Detective's Question:**
${userQuestion}

Respond in 2-4 sentences in natural English, staying in character:

${suspect.name}:`;
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
