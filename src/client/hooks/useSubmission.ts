/**
 * useSubmission Hook
 *
 * Manages answer submission and scoring
 * Handles validation, submission state, and result retrieval
 */

import { useState, useCallback } from 'react';
import type { W4HAnswer, ScoringResult, UseSubmissionReturn, ApiError } from '../types';

interface UseSubmissionOptions {
  caseId: string;
  userId: string;
}

/**
 * Hook for submitting and scoring answers
 */
export function useSubmission({ caseId, userId }: UseSubmissionOptions): UseSubmissionReturn {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Validate answer before submission
  const validateAnswer = (answer: W4HAnswer): string | null => {
    const requiredFields: (keyof W4HAnswer)[] = ['who', 'what', 'where', 'when', 'why', 'how'];

    for (const field of requiredFields) {
      if (!answer[field] || answer[field].trim().length === 0) {
        return `필수 항목이 비어있습니다: ${field}`;
      }
    }

    // Check minimum length for each answer
    for (const field of requiredFields) {
      if (answer[field].trim().length < 5) {
        return `${field} 항목은 최소 5자 이상 입력해주세요`;
      }
    }

    return null; // Valid
  };

  // Submit answer for scoring
  const submitAnswer = useCallback(
    async (answer: W4HAnswer): Promise<ScoringResult> => {
      setSubmitting(true);
      setError(null);

      // Client-side validation
      const validationError = validateAnswer(answer);
      if (validationError) {
        setError(validationError);
        setSubmitting(false);
        throw new Error(validationError);
      }

      try {
        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            caseId,
            answers: answer,
          }),
        });

        if (!response.ok) {
          const errorData: ApiError = await response.json();
          throw new Error(errorData.message || 'Failed to submit answer');
        }

        const result: ScoringResult = await response.json();

        console.log('Scoring result:', result);

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Failed to submit answer:', err);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [caseId, userId]
  );

  return {
    submitAnswer,
    submitting,
    error,
  };
}
