/**
 * useChat Hook
 *
 * Manages chat messages with AI suspects
 * Handles message history, sending, and real-time updates
 * Integrated with AP (Action Points) system
 *
 * Migration: Uses GameAPI architecture instead of direct fetch
 */

import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../types';
import type { APGain } from '../components/ap';
import { useGameAPI } from '../contexts/GameAPIContext';
import { APIError } from '../api/GameAPI';

interface UseChatOptions {
  suspectId: string;
  userId: string;
  caseId?: string; // Required for AP-integrated API
  enabled?: boolean; // Whether to fetch conversation on mount
}

export interface UseChatReturn {
  messages: ChatMessage[];
  sendMessage: (message: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  conversationCount: number;
  currentAP: number;
  latestAPGain: APGain | null;
  clearAPToast: () => void;
}

/**
 * Hook for managing chat conversation with a suspect
 * Integrated with AP (Action Points) system
 *
 * Uses GameAPI for type-safe backend communication
 */
export function useChat({
  suspectId,
  userId,
  caseId = '',
  enabled = true
}: UseChatOptions): UseChatReturn {
  const api = useGameAPI();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationCount, setConversationCount] = useState<number>(0);

  // AP-related state
  const [currentAP, setCurrentAP] = useState<number>(3); // Initial AP
  const [latestAPGain, setLatestAPGain] = useState<APGain | null>(null);
  const [conversationId, setConversationId] = useState<string>('');

  // Fetch conversation history using GameAPI
  const fetchHistory = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.getConversation(suspectId, userId);
      setMessages(data.messages);
      setConversationCount(data.messages.length);

      console.log(`[useChat] Loaded ${data.messages.length} messages`);
    } catch (err) {
      let errorMessage: string;

      if (err instanceof APIError) {
        errorMessage = `대화 기록 로드 실패 (${err.status}): ${err.message}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = '알 수 없는 오류가 발생했습니다';
      }

      setError(errorMessage);
      console.error('[useChat] Failed to fetch conversation:', err);
    } finally {
      setLoading(false);
    }
  }, [api, suspectId, userId, enabled]);

  // Send a message to the suspect using GameAPI
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) {
        setError('메시지를 입력해주세요');
        return;
      }

      setLoading(true);
      setError(null);

      // Optimistically add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const data = await api.askSuspect(
          suspectId,
          message,
          userId,
          caseId,
          conversationId || `conv-${suspectId}-${Date.now()}`
        );

        // Add suspect's response
        const suspectMessage: ChatMessage = {
          role: 'suspect',
          content: data.aiResponse,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, suspectMessage]);

        // Update conversation ID
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }

        // Handle AP acquisition
        if (data.apAcquisition && data.apAcquisition.amount > 0) {
          setLatestAPGain({
            amount: data.apAcquisition.amount,
            reason: data.apAcquisition.reason,
            timestamp: Date.now(),
          });

          setCurrentAP(data.playerState.currentAP);

          console.log(
            `[useChat] [AP] Gained ${data.apAcquisition.amount} AP: ${data.apAcquisition.reason}`
          );
        } else if (data.playerState) {
          // Update current AP even if no acquisition (e.g., if AP was spent elsewhere)
          setCurrentAP(data.playerState.currentAP);
        }

        // Update conversation count
        setConversationCount((prev) => prev + 1);
      } catch (err) {
        let errorMessage: string;

        if (err instanceof APIError) {
          errorMessage = `메시지 전송 실패 (${err.status}): ${err.message}`;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        } else {
          errorMessage = '알 수 없는 오류가 발생했습니다';
        }

        setError(errorMessage);

        // Remove optimistic user message on error
        setMessages((prev) => prev.slice(0, -1));

        console.error('[useChat] Failed to send message:', err);
      } finally {
        setLoading(false);
      }
    },
    [api, suspectId, userId, caseId, conversationId]
  );

  // Clear AP toast notification
  const clearAPToast = useCallback(() => {
    setLatestAPGain(null);
  }, []);

  // Fetch history on mount
  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  return {
    messages,
    sendMessage,
    loading,
    error,
    conversationCount,
    currentAP,
    latestAPGain,
    clearAPToast,
  };
}
