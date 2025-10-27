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
    <div className="
      submission-form
      bg-noir-charcoal
      p-4 sm:p-6 lg:p-8
      rounded-lg sm:rounded-xl
      border-2 border-noir-fog
      shadow-lg
    ">
      <div className="mb-6 sm:mb-8">
        <h2 className="
          text-2xl sm:text-3xl lg:text-4xl
          font-display font-bold
          text-detective-gold
          mb-2 sm:mb-3
        ">
          📝 최종 답안 제출
        </h2>
        <p className="text-sm sm:text-base text-text-secondary">
          모든 용의자와의 대화를 바탕으로 사건의 진실을 밝혀주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {/* WHO - 범인 선택 */}
        <div>
          <label
            htmlFor="who-select"
            className="
              block
              text-sm sm:text-base
              font-semibold
              text-detective-gold
              mb-2
            "
          >
            ❓ WHO (누가) - 범인은 누구입니까?
          </label>
          <select
            id="who-select"
            value={answer.who}
            onChange={(e) => updateField('who', e.target.value)}
            className={`
              w-full
              px-4 py-3
              text-base
              bg-noir-gunmetal
              text-text-primary
              rounded-lg
              border-2
              transition-all duration-base
              focus:outline-none
              focus:ring-2
              focus:ring-detective-gold
              focus:border-detective-gold
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.who ? 'border-evidence-blood' : 'border-noir-fog'}
            `}
            disabled={submitting}
            aria-label="범인 선택"
            aria-invalid={!!errors.who}
            aria-describedby={errors.who ? 'who-error' : undefined}
          >
            <option value="">용의자를 선택하세요</option>
            {suspects.map((suspect) => (
              <option key={suspect.id} value={suspect.name}>
                {suspect.name}
              </option>
            ))}
          </select>
          {errors.who && (
            <p id="who-error" className="text-evidence-blood text-sm mt-1" role="alert">
              {errors.who}
            </p>
          )}
        </div>

        {/* WHAT - 살인 방법 */}
        <div>
          <label
            htmlFor="what-input"
            className="
              block
              text-sm sm:text-base
              font-semibold
              text-detective-gold
              mb-2
            "
          >
            ❓ WHAT (무엇을) - 어떤 방법으로 살해했습니까?
          </label>
          <input
            id="what-input"
            type="text"
            value={answer.what}
            onChange={(e) => updateField('what', e.target.value)}
            placeholder="예: 흉기로 찔러서 살해했다"
            className={`
              input
              text-base
              ${errors.what ? 'border-evidence-blood' : ''}
            `}
            disabled={submitting}
            inputMode="text"
            autoComplete="off"
            aria-label="살인 방법 입력"
            aria-invalid={!!errors.what}
            aria-describedby={errors.what ? 'what-error' : undefined}
          />
          {errors.what && (
            <p id="what-error" className="text-evidence-blood text-sm mt-1" role="alert">
              {errors.what}
            </p>
          )}
        </div>

        {/* WHERE - 장소 */}
        <div>
          <label
            htmlFor="where-input"
            className="
              block
              text-sm sm:text-base
              font-semibold
              text-detective-gold
              mb-2
            "
          >
            ❓ WHERE (어디서) - 어디에서 범행이 일어났습니까?
          </label>
          <input
            id="where-input"
            type="text"
            value={answer.where}
            onChange={(e) => updateField('where', e.target.value)}
            placeholder="예: 서재의 책장 뒤편에서"
            className={`
              input
              text-base
              ${errors.where ? 'border-evidence-blood' : ''}
            `}
            disabled={submitting}
            inputMode="text"
            autoComplete="off"
            aria-label="범행 장소 입력"
            aria-invalid={!!errors.where}
            aria-describedby={errors.where ? 'where-error' : undefined}
          />
          {errors.where && (
            <p id="where-error" className="text-evidence-blood text-sm mt-1" role="alert">
              {errors.where}
            </p>
          )}
        </div>

        {/* WHEN - 시간 */}
        <div>
          <label
            htmlFor="when-input"
            className="
              block
              text-sm sm:text-base
              font-semibold
              text-detective-gold
              mb-2
            "
          >
            ❓ WHEN (언제) - 언제 범행이 일어났습니까?
          </label>
          <input
            id="when-input"
            type="text"
            value={answer.when}
            onChange={(e) => updateField('when', e.target.value)}
            placeholder="예: 2024년 1월 15일 오후 11시 30분경"
            className={`
              input
              text-base
              ${errors.when ? 'border-evidence-blood' : ''}
            `}
            disabled={submitting}
            inputMode="text"
            autoComplete="off"
            aria-label="범행 시간 입력"
            aria-invalid={!!errors.when}
            aria-describedby={errors.when ? 'when-error' : undefined}
          />
          {errors.when && (
            <p id="when-error" className="text-evidence-blood text-sm mt-1" role="alert">
              {errors.when}
            </p>
          )}
        </div>

        {/* WHY - 동기 */}
        <div>
          <label
            htmlFor="why-textarea"
            className="
              block
              text-sm sm:text-base
              font-semibold
              text-detective-gold
              mb-2
            "
          >
            ❓ WHY (왜) - 범행 동기는 무엇입니까?
          </label>
          <textarea
            id="why-textarea"
            value={answer.why}
            onChange={(e) => updateField('why', e.target.value)}
            placeholder="예: 피해자가 범인의 비밀을 폭로하려 해서..."
            rows={3}
            className={`
              textarea
              text-base
              ${errors.why ? 'border-evidence-blood' : ''}
            `}
            disabled={submitting}
            inputMode="text"
            aria-label="범행 동기 입력"
            aria-invalid={!!errors.why}
            aria-describedby={errors.why ? 'why-error' : undefined}
          />
          {errors.why && (
            <p id="why-error" className="text-evidence-blood text-sm mt-1" role="alert">
              {errors.why}
            </p>
          )}
        </div>

        {/* HOW - 실행 방법 */}
        <div>
          <label
            htmlFor="how-textarea"
            className="
              block
              text-sm sm:text-base
              font-semibold
              text-detective-gold
              mb-2
            "
          >
            ❓ HOW (어떻게) - 어떻게 범행을 실행했습니까?
          </label>
          <textarea
            id="how-textarea"
            value={answer.how}
            onChange={(e) => updateField('how', e.target.value)}
            placeholder="예: 피해자가 혼자 있을 때를 기다렸다가..."
            rows={4}
            className={`
              textarea
              text-base
              ${errors.how ? 'border-evidence-blood' : ''}
            `}
            disabled={submitting}
            inputMode="text"
            aria-label="범행 실행 방법 입력"
            aria-invalid={!!errors.how}
            aria-describedby={errors.how ? 'how-error' : undefined}
          />
          {errors.how && (
            <p id="how-error" className="text-evidence-blood text-sm mt-1" role="alert">
              {errors.how}
            </p>
          )}
        </div>

        {/* Submit Button - Mobile-First Touch-Friendly */}
        <div className="pt-4 sm:pt-6">
          <button
            type="submit"
            disabled={submitting}
            className={`
              w-full
              py-4 sm:py-5
              min-h-[56px]
              rounded-lg
              font-bold
              text-base sm:text-lg
              transition-all duration-base
              transform hover:scale-105 active:scale-95
              shadow-lg
              ${
                submitting
                  ? 'bg-noir-fog text-text-muted cursor-not-allowed opacity-50'
                  : 'btn-primary'
              }
            `}
            aria-label={submitting ? '채점 중입니다' : '답안 제출하기'}
          >
            {submitting ? '⏳ 채점 중...' : '🎯 답안 제출하기'}
          </button>
        </div>

        <p className="text-xs sm:text-sm text-text-muted text-center mt-4">
          ⚠️ 제출 후에는 수정할 수 없습니다. 신중히 작성해주세요.
        </p>
      </form>
    </div>
  );
}
