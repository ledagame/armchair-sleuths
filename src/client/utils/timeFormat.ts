/**
 * timeFormat.ts
 *
 * Time formatting utilities for user-friendly timestamps
 * Provides Korean time formatting with relative time display
 */

/**
 * Format timestamp to relative time in Korean
 * Examples: "방금 전", "5분 전", "2시간 전", "3일 전"
 */
export function formatRelativeTime(timestamp: Date | number): string {
  const now = new Date().getTime();
  const then = typeof timestamp === 'number' ? timestamp : timestamp.getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  // Just now (< 30 seconds)
  if (diffSec < 30) {
    return '방금 전';
  }

  // Seconds ago (< 1 minute)
  if (diffMin < 1) {
    return `${diffSec}초 전`;
  }

  // Minutes ago (< 1 hour)
  if (diffHour < 1) {
    return `${diffMin}분 전`;
  }

  // Hours ago (< 1 day)
  if (diffDay < 1) {
    return `${diffHour}시간 전`;
  }

  // Days ago (< 7 days)
  if (diffDay < 7) {
    return `${diffDay}일 전`;
  }

  // Weeks ago (< 30 days)
  if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `${weeks}주 전`;
  }

  // Months ago (< 365 days)
  if (diffDay < 365) {
    const months = Math.floor(diffDay / 30);
    return `${months}개월 전`;
  }

  // Years ago
  const years = Math.floor(diffDay / 365);
  return `${years}년 전`;
}

/**
 * Format timestamp to absolute time in Korean
 * Example: "2024년 3월 15일 14:30"
 */
export function formatAbsoluteTime(timestamp: Date | number): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${year}년 ${month}월 ${day}일 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Check if timestamp is recent (< 5 minutes)
 */
export function isRecentlyDiscovered(timestamp: Date | number): boolean {
  const now = new Date().getTime();
  const then = typeof timestamp === 'number' ? timestamp : timestamp.getTime();
  const diffMs = now - then;
  const fiveMinutesMs = 5 * 60 * 1000;

  return diffMs < fiveMinutesMs;
}

/**
 * Format duration in Korean
 * Example: "2분 30초", "1시간 15분"
 */
export function formatDuration(durationMs: number): string {
  const totalSec = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }

  if (minutes > 0) {
    return `${minutes}분 ${seconds}초`;
  }

  return `${seconds}초`;
}
