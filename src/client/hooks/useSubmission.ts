/**
 * useSubmission Hook
 *
 * Manages answer submission and scoring
 * Handles validation, submission state, and result retrieval
 *
 * Migration: Uses GameAPI architecture instead of direct fetch
 */

import { useState, useCallback } from 'react';
import type { W4HAnswer, ScoringResult, UseSubmissionReturn } from '../types';
import { useGameAPI } from '../contexts/GameAPIContext';
import { APIError } from '../api/GameAPI';

interface UseSubmissionOptions {
  caseId: string;
  userId: string;
}

/**
 * Hook for submitting and scoring answers
 *
 * Uses GameAPI for type-safe backend communication
 */
export function useSubmission({ caseId, userId }: UseSubmissionOptions): UseSubmissionReturn {
  const api = useGameAPI();
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

  // Submit answer for scoring using GameAPI
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
        // Use GameAPI instead of direct fetch
        const result = await api.submitAnswer(userId, caseId, answer);

        console.log('[useSubmission] Scoring result:', result);

        return result;
      } catch (err) {
        let errorMessage: string;

        if (err instanceof APIError) {
          // Handle APIError with status code
          errorMessage = `제출 실패 (${err.status}): ${err.message}`;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        } else {
          errorMessage = '알 수 없는 오류가 발생했습니다';
        }

        setError(errorMessage);
        console.error('[useSubmission] Failed to submit answer:', err);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [api, caseId, userId]
  );

  return {
    submitAnswer,
    submitting,
    error,
  };
}
