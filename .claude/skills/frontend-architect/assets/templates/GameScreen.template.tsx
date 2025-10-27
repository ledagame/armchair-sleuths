/**
 * Game Screen Template
 *
 * Base template for all game screens in Armchair Sleuths.
 * Includes responsive layout, loading states, and error handling.
 *
 * Usage:
 * 1. Copy this file
 * 2. Rename to your screen name (e.g., InvestigationScreen.tsx)
 * 3. Replace placeholders with actual content
 * 4. Update types and props as needed
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

// Types - Update based on your screen's needs
interface GameScreenProps {
  onNext?: () => void;
  onPrevious?: () => void;
  children?: ReactNode;
}

interface GameScreenData {
  // Define your screen's data structure
  id: string;
  // Add more fields as needed
}

export function GameScreen({ onNext, onPrevious, children }: GameScreenProps) {
  // State
  const [data, setData] = useState<GameScreenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Replace with your API call
        const response = await fetch('/api/your-endpoint');
        if (!response.ok) throw new Error('Failed to load');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-noir-deepBlack flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-noir-fog border-t-detective-gold rounded-full mx-auto mb-4" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-noir-deepBlack flex items-center justify-center p-4">
        <div className="bg-noir-charcoal border-2 border-evidence-blood rounded-lg p-8 max-w-md text-center">
          <div className="text-evidence-blood text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Error</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-detective-gold hover:bg-detective-amber text-noir-deepBlack font-semibold rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
      className="min-h-screen bg-noir-deepBlack text-text-primary"
    >
      {/* Header */}
      <header className="px-4 py-6 sm:px-6 lg:px-8 border-b border-noir-fog">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-detective-gold">
          Screen Title
        </h1>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Replace with your screen content */}
          {children || (
            <div className="bg-noir-charcoal border-2 border-noir-fog rounded-lg p-6">
              <p className="text-text-secondary">Add your screen content here</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      {(onPrevious || onNext) && (
        <footer className="fixed bottom-0 left-0 right-0 bg-noir-charcoal border-t border-noir-fog p-4">
          <div className="max-w-7xl mx-auto flex justify-between gap-4">
            {onPrevious && (
              <button
                onClick={onPrevious}
                className="px-6 py-2 border-2 border-detective-gold text-detective-gold hover:bg-detective-gold hover:text-noir-deepBlack font-semibold rounded-lg transition-all"
              >
                ← Previous
              </button>
            )}
            <div className="flex-1" />
            {onNext && (
              <button
                onClick={onNext}
                className="px-6 py-2 bg-detective-gold hover:bg-detective-amber text-noir-deepBlack font-semibold rounded-lg transition-all hover:shadow-glow"
              >
                Next →
              </button>
            )}
          </div>
        </footer>
      )}
    </motion.div>
  );
}
