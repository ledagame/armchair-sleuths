/**
 * SubmissionForm.tsx
 *
 * 5W1H answer submission form
 * Provides structured input for final solution
 */

import { useState } from 'react';
import type { W4HAnswer } from '../../types';

export interface SubmissionFormProps {
  onSubmit: (answer: W4HAnswer) => Promise<void>;
  submitting: boolean;
  suspects: Array<{ id: string; name: string }>;
}

/**
 * Form for submitting the final solution (5W1H)
 */
export function SubmissionForm({ onSubmit, submitting, suspects }: SubmissionFormProps) {
  const [answer, setAnswer] = useState<W4HAnswer>({
    who: '',
    what: '',
    where: '',
    when: '',
    why: '',
    how: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof W4HAnswer, string>>>({});

  // Validate form
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof W4HAnswer, string>> = {};
    let isValid = true;

    const fields: Array<{ key: keyof W4HAnswer; label: string }> = [
      { key: 'who', label: '누가' },
      { key: 'what', label: '무엇을' },
      { key: 'where', label: '어디서' },
      { key: 'when', label: '언제' },
      { key: 'why', label: '왜' },
      { key: 'how', label: '어떻게' },
    ];

    for (const field of fields) {
      if (!answer[field.key].trim()) {
        newErrors[field.key] = `${field.label}는 필수 입력 항목입니다`;
        isValid = false;
      } else if (answer[field.key].trim().length < 5) {
        newErrors[field.key] = `${field.label}는 최소 5자 이상 입력해주세요`;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSubmit(answer);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  // Update field value
  const updateField = (field: keyof W4HAnswer, value: string) => {
    setAnswer((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="submission-form bg-gray-900 p-6 rounded-lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">📝 최종 답안 제출</h2>
        <p className="text-gray-400">
          모든 용의자와의 대화를 바탕으로 사건의 진실을 밝혀주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* WHO - 범인 선택 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            ❓ WHO (누가) - 범인은 누구입니까?
          </label>
          <select
            value={answer.who}
            onChange={(e) => updateField('who', e.target.value)}
            className={`
              w-full px-4 py-3 bg-gray-800 text-white rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.who ? 'border-2 border-red-500' : ''}
            `}
            disabled={submitting}
          >
            <option value="">용의자를 선택하세요</option>
            {suspects.map((suspect) => (
              <option key={suspect.id} value={suspect.name}>
                {suspect.name}
              </option>
            ))}
          </select>
          {errors.who && <p className="text-red-500 text-sm mt-1">{errors.who}</p>}
        </div>

        {/* WHAT - 살인 방법 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            ❓ WHAT (무엇을) - 어떤 방법으로 살해했습니까?
          </label>
          <input
            type="text"
            value={answer.what}
            onChange={(e) => updateField('what', e.target.value)}
            placeholder="예: 흉기로 찔러서 살해했다"
            className={`
              w-full px-4 py-3 bg-gray-800 text-white rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.what ? 'border-2 border-red-500' : ''}
            `}
            disabled={submitting}
          />
          {errors.what && <p className="text-red-500 text-sm mt-1">{errors.what}</p>}
        </div>

        {/* WHERE - 장소 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            ❓ WHERE (어디서) - 어디에서 범행이 일어났습니까?
          </label>
          <input
            type="text"
            value={answer.where}
            onChange={(e) => updateField('where', e.target.value)}
            placeholder="예: 서재의 책장 뒤편에서"
            className={`
              w-full px-4 py-3 bg-gray-800 text-white rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.where ? 'border-2 border-red-500' : ''}
            `}
            disabled={submitting}
          />
          {errors.where && <p className="text-red-500 text-sm mt-1">{errors.where}</p>}
        </div>

        {/* WHEN - 시간 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            ❓ WHEN (언제) - 언제 범행이 일어났습니까?
          </label>
          <input
            type="text"
            value={answer.when}
            onChange={(e) => updateField('when', e.target.value)}
            placeholder="예: 2024년 1월 15일 오후 11시 30분경"
            className={`
              w-full px-4 py-3 bg-gray-800 text-white rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.when ? 'border-2 border-red-500' : ''}
            `}
            disabled={submitting}
          />
          {errors.when && <p className="text-red-500 text-sm mt-1">{errors.when}</p>}
        </div>

        {/* WHY - 동기 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            ❓ WHY (왜) - 범행 동기는 무엇입니까?
          </label>
          <textarea
            value={answer.why}
            onChange={(e) => updateField('why', e.target.value)}
            placeholder="예: 피해자가 범인의 비밀을 폭로하려 해서..."
            rows={3}
            className={`
              w-full px-4 py-3 bg-gray-800 text-white rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              resize-none
              ${errors.why ? 'border-2 border-red-500' : ''}
            `}
            disabled={submitting}
          />
          {errors.why && <p className="text-red-500 text-sm mt-1">{errors.why}</p>}
        </div>

        {/* HOW - 실행 방법 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            ❓ HOW (어떻게) - 어떻게 범행을 실행했습니까?
          </label>
          <textarea
            value={answer.how}
            onChange={(e) => updateField('how', e.target.value)}
            placeholder="예: 피해자가 혼자 있을 때를 기다렸다가..."
            rows={4}
            className={`
              w-full px-4 py-3 bg-gray-800 text-white rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              resize-none
              ${errors.how ? 'border-2 border-red-500' : ''}
            `}
            disabled={submitting}
          />
          {errors.how && <p className="text-red-500 text-sm mt-1">{errors.how}</p>}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className={`
              w-full py-4 rounded-lg font-bold text-lg transition-all
              ${
                submitting
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }
            `}
          >
            {submitting ? '채점 중...' : '🎯 답안 제출하기'}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          ⚠️ 제출 후에는 수정할 수 없습니다. 신중히 작성해주세요.
        </p>
      </form>
    </div>
  );
}
