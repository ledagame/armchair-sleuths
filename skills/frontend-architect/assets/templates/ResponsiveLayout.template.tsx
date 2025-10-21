/**
 * Responsive Layout Template
 *
 * Mobile-first responsive container for different screen sizes.
 * Adapts layout from stacked (mobile) to side-by-side (desktop).
 */

'use client';

import type { ReactNode } from 'react';

interface ResponsiveLayoutProps {
  left?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  columns?: 1 | 2 | 3;
}

export function ResponsiveLayout({
  left,
  right,
  children,
  columns = 2
}: ResponsiveLayoutProps) {
  // Two-column layout (Investigation screen style)
  if (left && right) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="space-y-6">{left}</div>

        {/* Right Column */}
        <div className="space-y-6">{right}</div>
      </div>
    );
  }

  // Grid layout (cards, evidence items)
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 sm:gap-6 lg:gap-8`}>
      {children}
    </div>
  );
}
