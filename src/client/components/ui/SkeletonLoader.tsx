import React from 'react';
import { motion } from 'framer-motion';

/**
 * Skeleton loader for image loading states
 */
export function SkeletonLoader() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#2a2a2a',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <motion.div
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
        }}
      />
    </div>
  );
}
