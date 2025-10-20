/**
 * useChat Hook
 *
 * Manages chat messages with AI suspects
 * Handles message history, sending, and real-time updates
 * Integrated with AP (Action Points) system
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  ChatMessage,
  ChatResponse,
  ConversationApiResponse,
  ApiError,
} from '../types';
import type { InterrogationResponse } from '@/shared/types/api';
import type { APGain } from '../components/ap';

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
 */
export function useChat({
  suspectId,
  userId,
  caseId = '',
  enabled = true
}: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationCount, setConversationCount] = useState<number>(0);

  // AP-related state
  const [currentAP, setCurrentAP] = useState<number>(3); // Initial AP
  const [latestAPGain, setLatestAPGain] = useState<APGain | null>(null);
  const [conversationId, setConversationId] = useState<string>('');

  // Fetch conversation history
  const fetchHistory = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/conversation/${suspectId}/${userId}`);

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to fetch conversation');
      }

      const data: ConversationApiResponse = await response.json();
      setMessages(data.messages);
      setConversationCount(data.messages.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch conversation:', err);
    } finally {
      setLoading(false);
    }
  }, [suspectId, userId, enabled]);

  // Send a message to the suspect
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) {
        setError('Message cannot be empty');
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
        const response = await fetch(`/api/chat/${suspectId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            message,
            caseId,
            conversationId: conversationId || `conv-${suspectId}-${Date.now()}`,
          }),
        });

        if (!response.ok) {
          const errorData: ApiError = await response.json();
          throw new Error(errorData.message || 'Failed to send message');
        }

        const data: InterrogationResponse = await response.json();

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
            `[AP] Gained ${data.apAcquisition.amount} AP: ${data.apAcquisition.reason}`
          );
        } else if (data.playerState) {
          // Update current AP even if no acquisition (e.g., if AP was spent elsewhere)
          setCurrentAP(data.playerState.currentAP);
        }

        // Update conversation count (if available from backend)
        setConversationCount((prev) => prev + 1);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);

        // Remove optimistic user message on error
        setMessages((prev) => prev.slice(0, -1));

        console.error('Failed to send message:', err);
      } finally {
        setLoading(false);
      }
    },
    [suspectId, userId, caseId, conversationId]
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
