/**
 * SuspectAIService.ts
 *
 * AI 용의자 대화 생성 서비스
 * Gemini + EmotionalStateManager 통합
 * Enhanced with Claude Skills pattern (prompt templates)
 */

import suspectPromptTemplate from '../../../../skills/suspect-personality-core/PROMPT.md?raw';
import { GeminiClient, type GeminiTextOptions } from '../gemini/GeminiClient';
import { EmotionalStateManager, type EmotionalTone } from './EmotionalStateManager';
import { KVStoreManager, type SuspectData } from '../repositories/kv/KVStoreManager';
import {
  getArchetypeData,
  getArchetypeSpeechPatterns,
  getEmotionalStateFromSuspicion,
  normalizeArchetypeName,
  type ArchetypeName,
  type EmotionalStateName
} from '../prompts/ArchetypePrompts';
import { QualityValidator, qualityLogger, type QualityScores } from '../validation/quality';
import { multilingualPromptManager } from '../prompts/MultilingualPromptManager';

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
  qualityScore?: QualityScores;
  qualityPassed?: boolean;
}

/**
 * AI 용의자 대화 서비스
 */
export class SuspectAIService {
  private geminiClient: GeminiClient;
  private qualityValidator: QualityValidator;

  constructor(geminiClient: GeminiClient) {
    this.geminiClient = geminiClient;
    this.qualityValidator = new QualityValidator();
  }

  /**
   * 사용자 질문에 AI 용의자 응답 생성
   * Requirements: 5.2, 5.8
   */
  async generateResponse(
    suspectId: string,
    userId: string,
    userQuestion: string,
    language: string = 'en'
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
      newEmotionalState.tone,
      language
    );

    // 4.5. 품질 검증 (환경 변수로 활성화)
    let qualityScore: QualityScores | undefined;
    let qualityPassed: boolean | undefined;

    if (process.env.ENABLE_QUALITY_VALIDATION === 'true') {
      const normalizedArchetype = normalizeArchetypeName(suspect.archetype);
      
      if (normalizedArchetype) {
        const archetypeData = getArchetypeData(normalizedArchetype);
        
        if (archetypeData) {
          // 감정 상태 매핑
          const emotionalStateMap: Record<EmotionalTone, 'COOPERATIVE' | 'NERVOUS' | 'DEFENSIVE' | 'AGGRESSIVE'> = {
            cooperative: 'COOPERATIVE',
            nervous: 'NERVOUS',
            defensive: 'DEFENSIVE',
            aggressive: 'AGGRESSIVE'
          };
          
          const emotionalState = emotionalStateMap[newEmotionalState.tone];
          
          // 품질 검증 실행
          const validation = this.qualityValidator.validate(
            aiResponse,
            normalizedArchetype,
            emotionalState,
            suspect.isGuilty,
            newEmotionalState.suspicionLevel,
            archetypeData.vocabulary.primary
          );
          
          qualityScore = validation.scores;
          qualityPassed = validation.passed;
          
          // 품질 메트릭 로깅
          qualityLogger.log({
            timestamp: new Date(),
            archetype: normalizedArchetype,
            emotionalState,
            isGuilty: suspect.isGuilty,
            suspicionLevel: newEmotionalState.suspicionLevel,
            response: aiResponse,
            scores: validation.scores,
            passed: validation.passed,
            feedback: validation.feedback
          });
          
          // 검증 실패 시 로깅
          if (!validation.passed) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ Quality validation failed:', {
                suspect: suspect.name,
                archetype: normalizedArchetype,
                emotionalState,
                scores: validation.scores,
                feedback: validation.feedback
              });
            } else {
              console.log('Quality validation failed (logged)');
            }
          } else {
            console.log(`✅ Quality validation passed (${validation.scores.overall}/100)`);
          }
        }
      }
    }

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
      conversationCount: conversationHistory.length + 2, // +2 for new user/suspect messages
      qualityScore,
      qualityPassed
    };
  }

  /**
   * AI 응답 생성 (Gemini)
   * Requirements: 5.2, 5.8
   */
  private async generateAIResponse(
    suspect: SuspectData,
    userQuestion: string,
    conversationHistory: ChatMessage[],
    currentTone: EmotionalTone,
    language: string = 'en'
  ): Promise<string> {
    const prompt = this.buildSuspectPrompt(
      suspect,
      userQuestion,
      conversationHistory,
      currentTone,
      language
    );

    const options: GeminiTextOptions = {
      temperature: 0.9, // 더 다양한 응답
      maxTokens: 1024
    };

    const response = await this.geminiClient.generateText(prompt, options);

    return response.text.trim();
  }

  /**
   * Detect language from user question
   * Returns 'ko' if Korean characters detected, 'en' otherwise
   */
  private detectLanguage(text: string): 'ko' | 'en' {
    // 한글 문자 포함 여부 확인
    return /[가-힣]/.test(text) ? 'ko' : 'en';
  }

  /**
   * Get language-specific response instruction
   */
  private getResponseLanguageInstruction(language: 'ko' | 'en'): string {
    if (language === 'ko') {
      return 'Respond naturally in Korean. Use conversational Korean that feels authentic and natural. (한국어로 자연스럽게 대답하세요. 실제 대화처럼 자연스러운 한국어를 사용하세요.)';
    }
    return 'Respond naturally in English. Use conversational English that feels authentic and natural.';
  }

  /**
   * 용의자 AI 프롬프트 생성 (Enhanced with Claude Skills pattern)
   * Uses template from skills/suspect-personality-core/PROMPT.md (bundled at build time)
   * Requirements: 5.2, 5.8
   */
  private buildSuspectPrompt(
    suspect: SuspectData,
    userQuestion: string,
    conversationHistory: ChatMessage[],
    currentTone: EmotionalTone,
    language: string = 'en'
  ): string {
    // Get emotional state from suspicion level
    const suspicionLevel =
      currentTone === 'cooperative'
        ? 20
        : currentTone === 'nervous'
          ? 40
          : currentTone === 'defensive'
            ? 65
            : 90;

    const emotionalState = getEmotionalStateFromSuspicion(suspicionLevel);

    // Use provided language or detect from question
    const effectiveLanguage = language || this.detectLanguage(userQuestion);
    const languageInstruction = this.getResponseLanguageInstruction(effectiveLanguage as 'ko' | 'en');

    // Phase 1: Normalize archetype name (handles Korean → English conversion)
    const normalizedArchetype = normalizeArchetypeName(suspect.archetype);

    if (!normalizedArchetype) {
      console.warn(`Archetype not found: ${suspect.archetype}, using fallback prompt`);
      return this.buildFallbackPrompt(suspect, userQuestion, conversationHistory, currentTone);
    }

    // Get archetype-specific data with normalized name
    const archetypeData = getArchetypeData(normalizedArchetype);

    if (!archetypeData) {
      console.warn(`Archetype data not found: ${normalizedArchetype}, using fallback prompt`);
      return this.buildFallbackPrompt(suspect, userQuestion, conversationHistory, currentTone);
    }

    // Get speech patterns for current emotional state
    const speechPatterns = getArchetypeSpeechPatterns(
      normalizedArchetype,
      emotionalState
    );

    // Format conversation history
    const historyText = conversationHistory
      .slice(-5)
      .map(msg => {
        const role = msg.role === 'user' ? 'Detective' : suspect.name;
        return `${role}: ${msg.content}`;
      })
      .join('\n');

    // Build guilty/innocent strategy block
    const guiltyOrInnocentBlock = suspect.isGuilty
      ? `**Status:** You are GUILTY of this crime. You committed the murder.

**Response Strategy:**
- Deny involvement but don't be too defensive
- Provide partial truths mixed with lies
- Create plausible alternative explanations
- Show appropriate emotional responses for an innocent person
- Avoid direct contradictions that can be easily proven false
- Under high pressure, you may slip and reveal inconsistencies`
      : `**Status:** You are INNOCENT of this crime. You did not commit the murder.

**Response Strategy:**
- Tell the truth about what you know
- Show genuine confusion about why you're a suspect
- Provide honest details that can be verified
- Express appropriate concern about the investigation
- Don't have knowledge of incriminating details only the killer would know
- Your emotional responses reflect genuine innocence`;

    // Load language-specific prompt template
    // Requirements: 5.2, 5.8
    const promptTemplate = effectiveLanguage === 'ko' 
      ? multilingualPromptManager.loadPromptTemplate('ko')
      : suspectPromptTemplate;

    // Replace template variables (template is bundled at build time via ?raw import)
    return promptTemplate
      .replace('{{SUSPECT_NAME}}', suspect.name)
      .replace(/{{ARCHETYPE}}/g, normalizedArchetype)
      .replace('{{BACKGROUND}}', suspect.background)
      .replace('{{PERSONALITY_TRAITS}}', archetypeData.personality.map(p => `- ${p}`).join('\n'))
      .replace('{{CHARACTER_DEFINITION}}', archetypeData.definition)
      .replace(/{{SUSPICION_LEVEL}}/g, suspicionLevel.toString())
      .replace(/{{EMOTIONAL_STATE}}/g, emotionalState)
      .replace('{{MINDSET}}', archetypeData.speechPatterns[emotionalState].mindset)
      .replace('{{TONE_GUIDANCE}}', archetypeData.speechPatterns[emotionalState].tone)
      .replace('{{GUILTY_OR_INNOCENT_BLOCK}}', guiltyOrInnocentBlock)
      .replace('{{SPEECH_PATTERNS}}', speechPatterns.slice(0, 3).map(p => `- ${p}`).join('\n'))
      .replace('{{VOCABULARY}}', archetypeData.vocabulary.primary.join(', '))
      .replace('{{CHARACTERISTIC_PHRASES}}', 
        archetypeData.characteristicPhrases
          ? archetypeData.characteristicPhrases.map(p => `- ${p}`).join('\n')
          : '(No characteristic phrases defined)'
      )
      .replace('{{RESPONSE_LANGUAGE_INSTRUCTION}}', languageInstruction)
      .replace('{{CONVERSATION_HISTORY}}', historyText || '(Beginning of conversation)')
      .replace('{{USER_QUESTION}}', userQuestion);
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

    // Detect language and get appropriate instruction
    const detectedLanguage = this.detectLanguage(userQuestion);
    const responseInstruction = detectedLanguage === 'ko'
      ? '2-4문장으로 자연스러운 한국어로 캐릭터에 맞게 답변하세요:'
      : 'Respond in 2-4 sentences in natural English, staying in character:';

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

${responseInstruction}

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
