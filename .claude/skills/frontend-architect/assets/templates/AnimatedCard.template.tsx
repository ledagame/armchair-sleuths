/**
 * Animated Card Template
 *
 * Reusable animated card component with hover effects and transitions.
 * Perfect for suspect cards, evidence items, location cards, etc.
 */

'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  onClick?: () => void;
  index?: number; // For stagger animations
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function AnimatedCard({
  children,
  onClick,
  index = 0,
  className = '',
  variant = 'default'
}: AnimatedCardProps) {
  const baseClasses = 'rounded-lg p-6 transition-all duration-200';

  const variants = {
    default: 'bg-noir-charcoal border-2 border-noir-fog hover:border-detective-brass shadow-base',
    elevated: 'bg-noir-charcoal border-2 border-detective-gold shadow-xl shadow-glow',
    outlined: 'bg-transparent border-2 border-detective-gold hover:bg-noir-gunmetal'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.65, 0, 0.35, 1]
      }}
      whileHover={{
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 }
      }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </motion.div>
  );
}
