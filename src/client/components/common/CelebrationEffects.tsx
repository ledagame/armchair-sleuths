/**
 * CelebrationEffects.tsx
 *
 * Visual celebration effects for special discoveries
 * Provides confetti, sparkles, and particle animations
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RarityTier } from '@/client/utils/evidenceRarity';

export interface CelebrationEffectsProps {
  isActive: boolean;
  rarity: RarityTier;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

/**
 * Generate particles based on rarity
 */
function generateParticles(rarity: RarityTier): Particle[] {
  const counts: Record<RarityTier, number> = {
    common: 0,
    uncommon: 5,
    rare: 10,
    legendary: 20,
    secret: 30,
  };

  const colors: Record<RarityTier, string[]> = {
    common: ['#9ca3af'],
    uncommon: ['#60a5fa', '#93c5fd'],
    rare: ['#c084fc', '#e9d5ff'],
    legendary: ['#fbbf24', '#fde047', '#fef08a'],
    secret: ['#f472b6', '#c084fc', '#60a5fa'],
  };

  const count = counts[rarity];
  const colorPalette = colors[rarity];
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      delay: Math.random() * 0.5,
    });
  }

  return particles;
}

/**
 * Confetti Particle Component
 */
function ConfettiParticle({ particle }: { particle: Particle }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: particle.size,
        height: particle.size,
        backgroundColor: particle.color,
      }}
      initial={{ opacity: 0, scale: 0, y: -20 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1.2, 1, 0],
        y: [0, -50, 100],
        x: [0, Math.random() * 40 - 20],
      }}
      transition={{
        duration: 2,
        delay: particle.delay,
        ease: 'easeOut',
      }}
    />
  );
}

/**
 * Sparkle Effect Component
 */
function SparkleEffect({ rarity }: { rarity: RarityTier }) {
  const sparkleCount = rarity === 'legendary' ? 8 : 4;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: sparkleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${10 + (i * 80) / sparkleCount}%`,
            top: `${20 + (i % 2) * 60}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: 1,
            delay: i * 0.15,
            repeat: 2,
          }}
        >
          <span className="text-4xl">✨</span>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Shine Effect Component (Rays of light)
 */
function ShineEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 origin-left"
          style={{
            width: '200%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.5), transparent)',
            transform: `rotate(${i * 30}deg)`,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{
            scaleX: [0, 1, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.1,
            repeat: 1,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Rainbow Effect Component
 */
function RainbowEffect() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.2), rgba(192, 132, 252, 0.2), rgba(96, 165, 250, 0.2))',
        borderRadius: '12px',
      }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.6, 0],
      }}
      transition={{
        duration: 2,
        repeat: 1,
      }}
    />
  );
}

/**
 * CelebrationEffects Component
 */
export function CelebrationEffects({
  isActive,
  rarity,
  onComplete,
}: CelebrationEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isActive) {
      setParticles(generateParticles(rarity));

      // Call onComplete after animation duration
      const duration = rarity === 'secret' ? 3000 : rarity === 'legendary' ? 2500 : 2000;
      const timer = setTimeout(() => {
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, rarity, onComplete]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
        {/* Confetti for secret rarity */}
        {rarity === 'secret' && (
          <>
            {particles.map(particle => (
              <ConfettiParticle key={particle.id} particle={particle} />
            ))}
            <RainbowEffect />
          </>
        )}

        {/* Sparkles for rare */}
        {rarity === 'rare' && <SparkleEffect rarity={rarity} />}

        {/* Shine for legendary */}
        {rarity === 'legendary' && (
          <>
            <ShineEffect />
            <SparkleEffect rarity={rarity} />
          </>
        )}

        {/* Subtle particles for uncommon */}
        {rarity === 'uncommon' && (
          <>
            {particles.map(particle => (
              <ConfettiParticle key={particle.id} particle={particle} />
            ))}
          </>
        )}
      </div>
    </AnimatePresence>
  );
}

/**
 * NEW Badge Component for recently discovered evidence
 */
export interface NewBadgeProps {
  isNew: boolean;
}

export function NewBadge({ isNew }: NewBadgeProps) {
  if (!isNew) return null;

  return (
    <motion.div
      className="absolute -top-2 -right-2 z-10"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 15,
      }}
    >
      <motion.div
        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        NEW!
      </motion.div>
    </motion.div>
  );
}
