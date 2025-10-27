/**
 * ConfettiExplosion.tsx
 *
 * Confetti celebration effect for evidence discoveries
 * Creates joyful moments when players find important evidence
 *
 * Accessibility:
 * - Respects prefers-reduced-motion
 * - Announces celebration to screen readers
 * - Can be disabled via user preference
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface ConfettiExplosionProps {
  trigger: boolean;
  intensity?: 'low' | 'medium' | 'high';
  colors?: string[];
  duration?: number;
}

interface Confetto {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
}

const DEFAULT_COLORS = [
  '#FFD700', // Gold
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
];

/**
 * ConfettiExplosion Component
 *
 * Renders animated confetti particles
 */
export function ConfettiExplosion({
  trigger,
  intensity = 'medium',
  colors = DEFAULT_COLORS,
  duration = 2000,
}: ConfettiExplosionProps) {
  const [confetti, setConfetti] = useState<Confetto[]>([]);
  const [isActive, setIsActive] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const particleCount = {
    low: 15,
    medium: 30,
    high: 50,
  }[intensity];

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);

      // Skip confetti if user prefers reduced motion
      if (prefersReducedMotion) {
        const cleanup = setTimeout(() => {
          setIsActive(false);
        }, 100);
        return () => clearTimeout(cleanup);
      }

      // Generate confetti particles
      const particles: Confetto[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * -100 - 50,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as Confetto['shape'],
      }));

      setConfetti(particles);

      // Clean up after animation
      const cleanup = setTimeout(() => {
        setConfetti([]);
        setIsActive(false);
      }, duration);

      return () => clearTimeout(cleanup);
    }
  }, [trigger, isActive, particleCount, colors, duration, prefersReducedMotion]);

  if (confetti.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      role="img"
      aria-label="축하 효과"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {confetti.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              rotate: 0,
              scale: 0,
            }}
            animate={{
              x: particle.x * 4,
              y: particle.y * 4 + 200, // Fall down
              opacity: [1, 1, 0],
              rotate: particle.rotation * 4,
              scale: particle.scale,
            }}
            transition={{
              duration: duration / 1000,
              ease: [0.25, 0.46, 0.45, 0.94] as const,
              opacity: {
                times: [0, 0.7, 1],
                duration: duration / 1000,
              },
            }}
          >
            {particle.shape === 'circle' && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: particle.color }}
              />
            )}
            {particle.shape === 'square' && (
              <div
                className="w-3 h-3"
                style={{ backgroundColor: particle.color }}
              />
            )}
            {particle.shape === 'triangle' && (
              <div
                className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px]"
                style={{
                  borderLeftColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderBottomColor: particle.color,
                }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * SparkleEffect Component
 *
 * Subtle sparkle effect for rare evidence
 */
export function SparkleEffect({ active = false }: { active?: boolean }) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/**
 * ShineEffect Component
 *
 * Golden shine sweep effect for legendary evidence
 */
export function ShineEffect({ active = false }: { active?: boolean }) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

/**
 * GlowPulse Component
 *
 * Pulsing glow effect for important evidence
 */
export function GlowPulse({ color = 'yellow', active = false }: { color?: string; active?: boolean }) {
  if (!active) return null;

  const glowColors = {
    yellow: 'shadow-yellow-500/50',
    blue: 'shadow-blue-500/50',
    purple: 'shadow-purple-500/50',
    pink: 'shadow-pink-500/50',
    red: 'shadow-red-500/50',
  };

  return (
    <motion.div
      className={`absolute inset-0 rounded-lg ${glowColors[color as keyof typeof glowColors] || glowColors.yellow}`}
      animate={{
        boxShadow: [
          '0 0 0px rgba(255, 215, 0, 0)',
          '0 0 20px rgba(255, 215, 0, 0.5)',
          '0 0 0px rgba(255, 215, 0, 0)',
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

/**
 * RainbowBorder Component
 *
 * Animated rainbow border for secret evidence
 */
export function RainbowBorder({ active = false }: { active?: boolean }) {
  if (!active) return null;

  return (
    <motion.div
      className="absolute inset-0 rounded-lg"
      style={{
        background: 'linear-gradient(90deg, #FF6B6B, #FFD700, #4ECDC4, #45B7D1, #BB8FCE, #FF6B6B)',
        backgroundSize: '400% 100%',
        padding: '2px',
      }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <div className="w-full h-full bg-gray-900 rounded-lg" />
    </motion.div>
  );
}
