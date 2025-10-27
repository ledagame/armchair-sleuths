/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/client/**/*.{js,jsx,ts,tsx}",
    "./src/client/index.html",
  ],
  darkMode: 'class', // Noir detective theme is dark-only, but keeping class for future flexibility
  theme: {
    extend: {
      // Noir Detective Color Palette
      colors: {
        // Noir Base Colors (Dark Backgrounds)
        noir: {
          deepBlack: '#0a0a0a',   // Primary background
          charcoal: '#1a1a1a',    // Card backgrounds
          gunmetal: '#2a2a2a',    // Elevated surfaces (darkGray in docs)
          ash: '#3a3a3a',         // Hover states (Magic MCP compatibility) ✅
          smoke: '#3a3a3a',       // Alias for ash (backward compatibility)
          fog: '#4a4a4a',         // Borders
        },

        // Detective Accent Colors (Gold/Brass)
        detective: {
          gold: '#c9b037',        // Primary accent (buttons, highlights)
          brass: '#b5a642',       // Secondary accent (tags, labels)
          amber: '#d4af37',       // Hover/active states
        },

        // Evidence Colors (Investigation Theme)
        evidence: {
          blood: '#8b0000',       // Critical evidence, errors
          poison: '#4b0082',      // Mysterious evidence
          clue: '#1e90ff',        // Discovery, information
        },

        // Text Colors (High Contrast for Readability)
        text: {
          primary: '#e0e0e0',     // Primary readable text (WCAG AA: 12.6:1)
          secondary: '#a0a0a0',   // Secondary text, descriptions (WCAG AA: 7.2:1)
          tertiary: '#959595',    // Metadata, tertiary text (WCAG AA: 4.6:1) ✅
          muted: '#707070',       // Disabled, placeholder text
          inverse: '#0a0a0a',     // Text on light backgrounds
        },

        // UI State Colors
        background: {
          primary: '#0a0a0a',          // Page background
          secondary: '#1a1a1a',        // Section backgrounds
          elevated: '#2a2a2a',         // Cards, modals
          overlay: 'rgba(10, 10, 10, 0.95)',  // Modal backdrops
        },

        border: {
          default: '#3a3a3a',          // Standard borders
          focus: '#c9b037',            // Focus indicators
          error: '#8b0000',            // Error borders
        },
      },

      // Typography System
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],  // Headlines, case titles
        body: ['Inter', 'sans-serif'],             // Main text, UI
        mono: ['"JetBrains Mono"', 'monospace'],   // Evidence, code-like text
      },

      // Font Size Scale (Mobile-First)
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.2' }],      // 12px - Small labels
        'sm': ['0.875rem', { lineHeight: '1.5' }],     // 14px - Secondary text
        'base': ['1rem', { lineHeight: '1.5' }],       // 16px - Body text
        'lg': ['1.125rem', { lineHeight: '1.5' }],     // 18px - Emphasized text
        'xl': ['1.25rem', { lineHeight: '1.5' }],      // 20px - Subtitles
        '2xl': ['1.5rem', { lineHeight: '1.2' }],      // 24px - Section headers
        '3xl': ['1.875rem', { lineHeight: '1.2' }],    // 30px - Screen titles
        '4xl': ['2.25rem', { lineHeight: '1.2' }],     // 36px - Hero text
        '5xl': ['3rem', { lineHeight: '1' }],          // 48px - Display text
      },

      // Spacing Scale (4px base unit)
      spacing: {
        '0': '0',
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '24': '6rem',     // 96px
      },

      // Border Radius
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',   // 2px
        'base': '0.25rem',  // 4px
        'md': '0.375rem',   // 6px
        'lg': '0.5rem',     // 8px
        'xl': '0.75rem',    // 12px
        '2xl': '1rem',      // 16px
        'full': '9999px',   // Pills, circles
      },

      // Box Shadow (Noir Theme - Darker Shadows)
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.5)',
        'base': '0 2px 4px rgba(0, 0, 0, 0.6)',
        'md': '0 4px 8px rgba(0, 0, 0, 0.7)',
        'lg': '0 8px 16px rgba(0, 0, 0, 0.8)',
        'xl': '0 12px 24px rgba(0, 0, 0, 0.9)',
        'glow': '0 0 20px rgba(201, 176, 55, 0.3)',  // Detective gold glow
        'glow-strong': '0 0 30px rgba(201, 176, 55, 0.5)',
      },

      // Transitions & Animations
      transitionDuration: {
        'fast': '150ms',
        'base': '250ms',
        'slow': '350ms',
        'page': '600ms',
      },

      // Animation Keyframes
      keyframes: {
        // Fade in
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // Slide up
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Scale pop
        scalePop: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Pulse (for loading states)
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        // Spin (for spinners)
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.65, 0, 0.35, 1)',
        'scale-pop': 'scalePop 0.3s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 1s linear infinite',
      },

      // Responsive Breakpoints (Mobile-First)
      screens: {
        'sm': '640px',    // Mobile landscape
        'md': '768px',    // Tablet portrait
        'lg': '1024px',   // Desktop
        'xl': '1280px',   // Large desktop
        '2xl': '1536px',  // Extra large
      },

      // Z-Index Scale (Organized Layering)
      zIndex: {
        '0': '0',
        '10': '10',      // Elevated content
        '20': '20',      // Dropdowns
        '30': '30',      // Sticky headers
        '40': '40',      // Overlays
        '50': '50',      // Modals
        '60': '60',      // Toasts, notifications
        '70': '70',      // Tooltips
        '999': '999',    // Absolute top (rarely used)
      },
    },
  },
  plugins: [
    // Custom plugin for component classes
    function({ addComponents }) {
      addComponents({
        // Button Components
        '.btn-primary': {
          '@apply px-6 py-2 bg-detective-gold hover:bg-detective-amber text-noir-deepBlack font-semibold rounded-lg transition-all duration-base hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-detective-gold': {},
        },
        '.btn-secondary': {
          '@apply px-6 py-2 border-2 border-detective-gold text-detective-gold hover:bg-detective-gold hover:text-noir-deepBlack font-semibold rounded-lg transition-all duration-base': {},
        },
        '.btn-ghost': {
          '@apply px-4 py-2 text-text-muted hover:text-text-primary hover:bg-noir-gunmetal rounded-lg transition-colors duration-base': {},
        },

        // Card Components
        '.card': {
          '@apply bg-noir-charcoal border-2 border-noir-fog hover:border-detective-brass rounded-lg p-6 shadow-base transition-all duration-base': {},
        },
        '.card-elevated': {
          '@apply bg-noir-charcoal border-2 border-detective-gold rounded-xl p-6 shadow-xl shadow-glow': {},
        },

        // Input Components
        '.input': {
          '@apply w-full px-4 py-2 bg-noir-gunmetal border-2 border-noir-fog focus:border-detective-gold text-text-primary rounded-md transition-colors duration-base focus:outline-none focus:ring-2 focus:ring-detective-gold/50': {},
        },
        '.textarea': {
          '@apply w-full px-4 py-3 bg-noir-gunmetal border-2 border-noir-fog focus:border-detective-gold text-text-primary rounded-md min-h-32 resize-vertical transition-colors duration-base focus:outline-none focus:ring-2 focus:ring-detective-gold/50': {},
        },

        // Badge Components
        '.badge': {
          '@apply inline-flex items-center px-2 py-1 bg-noir-gunmetal border border-noir-fog text-text-secondary text-xs font-medium rounded-full': {},
        },
        '.badge-detective': {
          '@apply inline-flex items-center px-2 py-1 bg-detective-gold/20 border border-detective-brass text-detective-gold text-xs font-semibold rounded-full': {},
        },

        // Loading States
        '.skeleton': {
          '@apply animate-pulse bg-noir-gunmetal rounded': {},
        },
        '.spinner': {
          '@apply animate-spin border-4 border-noir-fog border-t-detective-gold rounded-full': {},
        },
      });
    },
  ],
};
