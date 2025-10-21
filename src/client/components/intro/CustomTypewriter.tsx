/**
 * CustomTypewriter.tsx
 *
 * Custom character-by-character typewriter component with advanced features:
 * - Dynamic speed changes (emotional arc)
 * - Keyword emphasis with color highlighting
 * - Conditional jitter (only when not typing)
 * - Word-level pause control
 * - Perfect control over typing experience
 *
 * Replaces react-type-animation for advanced narration features
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 키워드 강조 설정
 */
export interface EmphasisConfig {
  /** 색상 */
  color: string;
  /** 속도 배수 (1.0 = 기본, 0.5 = 2배 느림) */
  speedMultiplier?: number;
  /** 단어 후 추가 pause (ms) */
  pauseAfter?: number;
}

/**
 * CustomTypewriter Props
 */
export interface CustomTypewriterProps {
  /** 타이핑할 전체 텍스트 */
  text: string;
  /** 기본 타이핑 속도 (ms/char) */
  baseSpeed: number;
  /** 강조할 단어 맵 (단어 → 강조 설정) */
  emphasizedWords?: Map<string, EmphasisConfig>;
  /** 현재 타이핑 중인지 여부 (jitter 제어용) */
  isTyping?: boolean;
  /** 완료 시 콜백 */
  onComplete?: () => void;
  /** 기본 색상 */
  color?: string;
  /** Jitter 강도 */
  jitterIntensity?: 'none' | 'low' | 'medium' | 'high';
  /** 클래스명 */
  className?: string;
}

/**
 * 현재 인덱스에서의 단어 추출
 */
function getWordAtIndex(text: string, index: number): string {
  // 현재 위치부터 앞으로 이동하며 단어 시작 찾기
  let start = index;
  while (start > 0 && /\S/.test(text[start - 1])) {
    start--;
  }

  // 현재 위치부터 뒤로 이동하며 단어 끝 찾기
  let end = index;
  while (end < text.length && /\S/.test(text[end])) {
    end++;
  }

  return text.substring(start, end).trim();
}

/**
 * CustomTypewriter Component
 *
 * Character-by-character typing with advanced control
 */
export function CustomTypewriter({
  text,
  baseSpeed,
  emphasizedWords = new Map(),
  isTyping = true,
  onComplete,
  color = '#ffffff',
  jitterIntensity = 'low',
  className = ''
}: CustomTypewriterProps) {
  // ============================================================================
  // State
  // ============================================================================

  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentColor, setCurrentColor] = useState(color);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // Jitter Class Mapping
  // ============================================================================

  const jitterClassMap = {
    none: '',
    low: 'jitter-low',
    medium: 'jitter-medium',
    high: 'jitter-high'
  };

  const jitterClass = jitterClassMap[jitterIntensity];

  // ============================================================================
  // Typing Logic
  // ============================================================================

  /**
   * 다음 문자 타이핑
   */
  const typeNextChar = useCallback(() => {
    if (currentIndex >= text.length) {
      // 완료
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
      onComplete?.();
      return;
    }

    const char = text[currentIndex];
    const word = getWordAtIndex(text, currentIndex);
    const emphasis = emphasizedWords.get(word);

    // 강조 단어면 색상 변경
    if (emphasis && char !== ' ') {
      setCurrentColor(emphasis.color);
    } else if (currentIndex === 0 || text[currentIndex - 1] === ' ') {
      // 새 단어 시작 시 기본 색상 복원
      setCurrentColor(color);
    }

    // 타이핑 속도 계산
    const speed = emphasis
      ? baseSpeed * (emphasis.speedMultiplier || 1.0)
      : baseSpeed;

    // 문자 추가
    setDisplayedText(prev => prev + char);
    setCurrentIndex(prev => prev + 1);

    // 단어 끝에서 추가 pause
    const nextChar = text[currentIndex + 1];
    const isWordEnd = nextChar === ' ' || nextChar === undefined;
    const additionalPause = (isWordEnd && emphasis?.pauseAfter) || 0;

    // 다음 문자 타이밍
    intervalRef.current = setTimeout(
      typeNextChar,
      speed + additionalPause
    );
  }, [
    text,
    currentIndex,
    baseSpeed,
    emphasizedWords,
    onComplete,
    color
  ]);

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * 타이핑 시작/중지
   */
  useEffect(() => {
    if (isTyping && currentIndex < text.length) {
      intervalRef.current = setTimeout(typeNextChar, baseSpeed);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isTyping, currentIndex, text.length, baseSpeed, typeNextChar]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <span
      className={`
        custom-typewriter
        ${!isTyping && jitterClass ? jitterClass : ''}
        ${className}
      `.trim()}
      style={{ color: currentColor }}
    >
      {displayedText}
    </span>
  );
}

/**
 * Helper: 텍스트에서 강조 단어 자동 추출
 *
 * @param text - 전체 텍스트
 * @param keywords - 강조할 키워드 리스트
 * @param config - 강조 설정
 * @returns EmphasisConfig Map
 */
export function createEmphasisMap(
  text: string,
  keywords: string[],
  config: EmphasisConfig
): Map<string, EmphasisConfig> {
  const map = new Map<string, EmphasisConfig>();

  keywords.forEach(keyword => {
    // 대소문자 구분 없이 검색
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchedWord = match[0];
      map.set(matchedWord, config);
    }
  });

  return map;
}
