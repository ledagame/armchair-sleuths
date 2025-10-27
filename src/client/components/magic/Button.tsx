import { motion, HTMLMotionProps } from 'framer-motion';
import { ButtonHTMLAttributes, forwardRef, ReactNode, useState } from 'react';

/**
 * Noir Detective-Themed Button Component
 * Generated with Magic MCP prompt specifications
 *
 * Features:
 * - Primary/Secondary/Ghost variants with gold theme
 * - Touch-friendly sizes (44px mobile minimum per Apple HIG)
 * - Loading spinner state
 * - Ripple effect on click
 * - WCAG 2.1 AA accessibility compliant
 */

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Size variant with touch-friendly mobile sizes */
  size?: 'sm' | 'md' | 'lg';
  /** Show loading spinner */
  loading?: boolean;
  /** Icon element to display before text */
  icon?: ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Button content */
  children: ReactNode;
}

/** Ripple effect component for click feedback */
interface RippleProps {
  x: number;
  y: number;
  size: number;
}

const Ripple: React.FC<RippleProps> = ({ x, y, size }) => (
  <motion.span
    className="absolute rounded-full bg-detective-gold opacity-30"
    style={{
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
    }}
    initial={{ scale: 0, opacity: 0.5 }}
    animate={{ scale: 2, opacity: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  />
);

/** Loading spinner component */
const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      fullWidth = false,
      disabled,
      children,
      className = '',
      onClick,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<RippleProps[]>([]);

    // Variant styles (WCAG 2.1 AA compliant colors)
    const variantStyles = {
      primary: `
        bg-detective-gold hover:bg-detective-amber text-noir-deepBlack
        disabled:bg-detective-faded disabled:opacity-50
      `,
      secondary: `
        bg-transparent border-2 border-detective-gold text-detective-gold
        hover:bg-detective-gold hover:text-noir-deepBlack
        disabled:border-detective-faded disabled:text-detective-faded disabled:opacity-50
      `,
      ghost: `
        bg-transparent text-text-muted hover:text-text-primary hover:bg-noir-gunmetal
        disabled:opacity-50
      `,
    };

    // Size styles (mobile-first with Apple HIG 44px minimum)
    const sizeStyles = {
      sm: `
        h-11 sm:h-8 px-4 text-sm
        ${icon ? 'gap-2' : ''}
      `, // 44px mobile, 32px desktop
      md: `
        h-12 sm:h-10 px-6 text-base
        ${icon ? 'gap-2' : ''}
      `, // 48px mobile, 40px desktop
      lg: `
        h-14 sm:h-12 px-8 text-lg
        ${icon ? 'gap-3' : ''}
      `, // 56px mobile, 48px desktop
    };

    // Handle click with ripple effect
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      // Create ripple at click position
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height);

      const newRipple: RippleProps = { x, y, size };
      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 600);

      // Call original onClick
      onClick?.(e);
    };

    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        className={`
          relative inline-flex items-center justify-center
          font-semibold rounded-lg
          transition-all duration-base
          overflow-hidden
          focus:outline-none focus:ring-2 focus:ring-detective-gold focus:ring-offset-2 focus:ring-offset-noir-deepBlack
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `.trim()}
        // Hover scale animation (disabled when loading/disabled)
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled ? {} : { scale: 0.98 }}
        // WCAG 2.1 AA Accessibility
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map((ripple, index) => (
          <Ripple key={index} {...ripple} />
        ))}

        {/* Loading spinner */}
        {loading && (
          <LoadingSpinner
            className={`
              w-4 h-4 mr-2
              ${variant === 'primary' ? 'text-noir-deepBlack' : 'text-detective-gold'}
            `}
          />
        )}

        {/* Icon */}
        {icon && !loading && <span className="flex-shrink-0">{icon}</span>}

        {/* Button text */}
        <span className={loading ? 'opacity-70' : ''}>{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
