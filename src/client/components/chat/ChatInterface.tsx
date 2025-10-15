/**
 * ChatInterface.tsx
 *
 * AI conversation interface component - Enhanced production version
 * Handles real-time chat with AI suspects
 */

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../types';

export interface ChatInterfaceProps {
  suspectName: string;
  suspectId: string;
  userId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  loading?: boolean;
}

/**
 * Enhanced chat interface with auto-scroll and better UX
 */
export function ChatInterface({
  suspectName,
  messages,
  onSendMessage,
  loading = false,
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isSending) return;

    const messageToSend = inputMessage;
    setInputMessage(''); // Clear immediately for better UX
    setIsSending(true);

    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setInputMessage(messageToSend);
    } finally {
      setIsSending(false);
    }
  };

  // Quick question suggestions
  const quickQuestions = [
    '어디에 있었습니까?',
    '피해자와 어떤 관계였나요?',
    '그날 무엇을 했나요?',
    '알리바이가 있나요?',
  ];

  const handleQuickQuestion = (question: string) => {
    if (!isSending) {
      setInputMessage(question);
    }
  };

  return (
    <div className="chat-interface flex flex-col h-[600px] bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="chat-header p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">💬 {suspectName}와의 대화</h3>
            <p className="text-xs text-gray-400">{messages.length}개의 메시지</p>
          </div>
          {isSending && (
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full" />
              <span>응답 대기 중...</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">{suspectName}에게 질문을 시작하세요</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs transition-colors"
                  disabled={isSending}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={index}
              className={`
                flex
                ${isUser ? 'justify-end' : 'justify-start'}
              `}
            >
              <div
                className={`
                  max-w-[75%] p-4 rounded-lg
                  ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-800 text-gray-100 rounded-bl-none'
                  }
                `}
              >
                {/* Message role label */}
                <p className="text-xs opacity-70 mb-1">
                  {isUser ? '당신' : suspectName}
                </p>

                {/* Message content */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {/* Timestamp */}
                <p className="text-xs opacity-50 mt-2">
                  {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="chat-input p-4 bg-gray-800 border-t border-gray-700"
      >
        {/* Quick questions (shown when no messages) */}
        {messages.length > 0 && messages.length < 3 && (
          <div className="mb-3 flex flex-wrap gap-2">
            <p className="text-xs text-gray-500 w-full mb-1">💡 추천 질문:</p>
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleQuickQuestion(question)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                disabled={isSending}
              >
                {question}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`${suspectName}에게 질문하세요...`}
            className="
              flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:bg-gray-800 disabled:cursor-not-allowed
            "
            disabled={isSending || loading}
            autoFocus
          />
          <button
            type="submit"
            disabled={isSending || !inputMessage.trim() || loading}
            className="
              px-6 py-3 bg-blue-600 text-white rounded-lg font-bold
              hover:bg-blue-700 active:bg-blue-800
              disabled:bg-gray-600 disabled:cursor-not-allowed
              transition-all
            "
          >
            {isSending ? '전송 중...' : '전송'}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          💡 TIP: 모순을 찾기 위해 같은 질문을 다시 해보세요
        </p>
      </form>
    </div>
  );
}
