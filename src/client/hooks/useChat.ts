/**
 * useChat Hook
 *
 * Manages chat messages with AI suspects
 * Handles message history, sending, and real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  ChatMessage,
  ChatResponse,
  UseChatReturn,
  ConversationApiResponse,
  ApiError,
} from '../types';

interface UseChatOptions {
  suspectId: string;
  userId: string;
  enabled?: boolean; // Whether to fetch conversation on mount
}

/**
 * Hook for managing chat conversation with a suspect
 */
export function useChat({ suspectId, userId, enabled = true }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationCount, setConversationCount] = useState<number>(0);

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
          }),
        });

        if (!response.ok) {
          const errorData: ApiError = await response.json();
          throw new Error(errorData.message || 'Failed to send message');
        }

        const data: ChatResponse = await response.json();

        // Add suspect's response
        const suspectMessage: ChatMessage = {
          role: 'suspect',
          content: data.response,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, suspectMessage]);
        setConversationCount(data.conversationCount);

        // Update emotional state if needed (can be used for UI feedback)
        console.log('Emotional state updated:', data.emotionalState);
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
    [suspectId, userId]
  );

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
  };
}
