/**
 * ChatInterface.tsx
 *
 * AI 대화 인터페이스 컴포넌트 (MVP)
 */

import React, { useState } from 'react';

export interface ChatMessage {
  role: 'user' | 'suspect';
  content: string;
  timestamp: number;
}

export interface ChatInterfaceProps {
  suspectName: string;
  suspectId: string;
  userId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
}

export function ChatInterface({
  suspectName,
  suspectId,
  userId,
  messages,
  onSendMessage
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      await onSendMessage(inputMessage);
      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('메시지 전송 실패');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-interface flex flex-col h-full bg-gray-900 rounded-lg">
      <div className="chat-header p-4 bg-gray-800 rounded-t-lg border-b border-gray-700">
        <h3 className="text-xl font-bold">💬 {suspectName}와의 대화</h3>
      </div>

      <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            {suspectName}에게 질문을 시작하세요
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`
              flex
              ${msg.role === 'user' ? 'justify-end' : 'justify-start'}
            `}
          >
            <div
              className={`
                max-w-[70%] p-3 rounded-lg
                ${msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'}
              `}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs opacity-50 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString('ko-KR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-input p-4 bg-gray-800 rounded-b-lg border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`${suspectName}에게 질문하세요...`}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !inputMessage.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isSending ? '전송 중...' : '전송'}
          </button>
        </div>
      </form>
    </div>
  );
}
