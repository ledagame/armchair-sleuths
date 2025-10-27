/**
 * useBookmarks.ts
 *
 * Hook for managing evidence bookmarks
 * Stores bookmarks in localStorage for persistence
 */

import { useState, useEffect, useCallback } from 'react';
import type { EvidenceItem } from '@/shared/types/Evidence';

export interface BookmarkState {
  bookmarkedIds: Set<string>;
  toggleBookmark: (evidenceId: string) => void;
  isBookmarked: (evidenceId: string) => boolean;
  getBookmarkedEvidence: (allEvidence: EvidenceItem[]) => EvidenceItem[];
  clearAllBookmarks: () => void;
  bookmarkCount: number;
}

/**
 * Get storage key for bookmarks
 */
function getStorageKey(caseId: string, userId: string): string {
  return `armchair-sleuths:bookmarks:${caseId}:${userId}`;
}

/**
 * Load bookmarks from localStorage
 */
function loadBookmarks(caseId: string, userId: string): Set<string> {
  try {
    const key = getStorageKey(caseId, userId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Set(parsed);
    }
  } catch (error) {
    console.error('[useBookmarks] Failed to load bookmarks:', error);
  }
  return new Set();
}

/**
 * Save bookmarks to localStorage
 */
function saveBookmarks(caseId: string, userId: string, bookmarks: Set<string>): void {
  try {
    const key = getStorageKey(caseId, userId);
    const array = Array.from(bookmarks);
    localStorage.setItem(key, JSON.stringify(array));
  } catch (error) {
    console.error('[useBookmarks] Failed to save bookmarks:', error);
  }
}

/**
 * useBookmarks Hook
 *
 * Manages evidence bookmarks with localStorage persistence
 *
 * @param caseId - Case ID for scoping bookmarks
 * @param userId - User ID for scoping bookmarks
 * @returns BookmarkState object with bookmark management functions
 */
export function useBookmarks(caseId: string, userId: string): BookmarkState {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() =>
    loadBookmarks(caseId, userId)
  );

  // Save to localStorage whenever bookmarks change
  useEffect(() => {
    saveBookmarks(caseId, userId, bookmarkedIds);
  }, [caseId, userId, bookmarkedIds]);

  /**
   * Toggle bookmark for an evidence item
   */
  const toggleBookmark = useCallback((evidenceId: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(evidenceId)) {
        next.delete(evidenceId);
      } else {
        next.add(evidenceId);
      }
      return next;
    });
  }, []);

  /**
   * Check if evidence is bookmarked
   */
  const isBookmarked = useCallback(
    (evidenceId: string) => {
      return bookmarkedIds.has(evidenceId);
    },
    [bookmarkedIds]
  );

  /**
   * Get all bookmarked evidence from a list
   */
  const getBookmarkedEvidence = useCallback(
    (allEvidence: EvidenceItem[]) => {
      return allEvidence.filter(evidence => bookmarkedIds.has(evidence.id));
    },
    [bookmarkedIds]
  );

  /**
   * Clear all bookmarks
   */
  const clearAllBookmarks = useCallback(() => {
    setBookmarkedIds(new Set());
  }, []);

  return {
    bookmarkedIds,
    toggleBookmark,
    isBookmarked,
    getBookmarkedEvidence,
    clearAllBookmarks,
    bookmarkCount: bookmarkedIds.size,
  };
}

/**
 * Export bookmarks to JSON (for data portability)
 */
export function exportBookmarks(caseId: string, userId: string): string {
  const bookmarks = loadBookmarks(caseId, userId);
  return JSON.stringify({
    caseId,
    userId,
    bookmarks: Array.from(bookmarks),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

/**
 * Import bookmarks from JSON
 */
export function importBookmarks(jsonString: string, caseId: string, userId: string): boolean {
  try {
    const data = JSON.parse(jsonString);

    // Validate data structure
    if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
      throw new Error('Invalid bookmark data structure');
    }

    // Only import if caseId and userId match
    if (data.caseId !== caseId || data.userId !== userId) {
      throw new Error('Bookmark data does not match current case/user');
    }

    const bookmarks = new Set(data.bookmarks);
    saveBookmarks(caseId, userId, bookmarks);
    return true;
  } catch (error) {
    console.error('[importBookmarks] Failed to import bookmarks:', error);
    return false;
  }
}
