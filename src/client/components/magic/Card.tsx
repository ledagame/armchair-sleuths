import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, ReactNode, HTMLAttributes } from 'react';

/**
 * Noir Detective-Themed Card Component
 * Generated with Magic MCP prompt specifications
 *
 * Features:
 * - Charcoal background with gold hover border
 * - Lift animation on hover (4px translateY)
 * - Header, Body, Footer composition
 * - Clickable variant with proper semantics
 * - WCAG 2.1 AA accessibility compliant
 * - Supports image overlay variant
 */

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  /** Enable hover effects and clickable state */
  hover?: boolean;
  /** Click handler (converts card to button role) */
  onClick?: () => void;
  /** Link URL (converts card to anchor) */
  href?: string;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Card content */
  children: ReactNode;
  /** Custom className */
  className?: string;
  /** Aria label for clickable cards */
  'aria-label'?: string;
  /** ID for aria-labelledby */
  'aria-labelledby'?: string;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

/** Card Header component */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`card-header mb-4 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

/** Card Body component */
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`card-body text-text-secondary ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
);

CardBody.displayName = 'CardBody';

/** Card Footer component */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`card-footer mt-4 flex items-center gap-2 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

/** Main Card component */
export const Card = forwardRef<HTMLElement, CardProps>(
  (
    {
      hover = false,
      onClick,
      href,
      padding = 'lg',
      children,
      className = '',
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref
  ) => {
    // Padding styles
    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-6', // 24px default per spec
    };

    // Base styles (WCAG 2.1 AA compliant)
    const baseStyles = `
      bg-noir-charcoal
      rounded-lg
      shadow-base
      transition-all duration-base
      ${paddingStyles[padding]}
      ${hover || onClick || href ? 'cursor-pointer' : ''}
    `.trim();

    // Hover styles
    const hoverStyles = hover || onClick || href
      ? `
        border-2 border-transparent hover:border-detective-gold
        hover:shadow-lg hover:shadow-glow
      `.trim()
      : 'border-2 border-noir-fog';

    // Focus styles for keyboard accessibility
    const focusStyles = onClick || href
      ? 'focus:outline-none focus:ring-2 focus:ring-detective-gold focus:ring-offset-2 focus:ring-offset-noir-deepBlack'
      : '';

    const combinedClassName = `${baseStyles} ${hoverStyles} ${focusStyles} ${className}`.trim();

    // Motion animation variants
    const hoverAnimation =
      hover || onClick || href
        ? {
            y: -4, // Lift effect 4px translateY per spec
            transition: {
              duration: 0.2,
              ease: 'easeOut',
            },
          }
        : {};

    const tapAnimation =
      onClick || href
        ? {
            scale: 0.98,
            transition: {
              duration: 0.1,
            },
          }
        : {};

    // Determine semantic HTML element
    const Component = motion.article as any;

    // Handle clickable cards
    const clickableProps =
      onClick || href
        ? {
            role: href ? undefined : 'button',
            tabIndex: 0,
            onClick: onClick,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onClick();
              }
            },
            'aria-label': ariaLabel,
          }
        : {};

    // If href is provided, wrap in anchor tag
    if (href) {
      return (
        <Component
          ref={ref as any}
          className={combinedClassName}
          whileHover={hoverAnimation}
          whileTap={tapAnimation}
          {...props}
        >
          <a
            href={href}
            className="block focus:outline-none"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
          >
            {children}
          </a>
        </Component>
      );
    }

    return (
      <Component
        ref={ref as any}
        className={combinedClassName}
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        aria-labelledby={ariaLabelledBy}
        {...clickableProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card with image overlay variant
 */
export interface CardImageProps extends CardProps {
  /** Image source URL */
  src: string;
  /** Image alt text (required for accessibility) */
  alt: string;
  /** Image position */
  imagePosition?: 'top' | 'overlay';
}

export const CardImage = forwardRef<HTMLElement, CardImageProps>(
  ({ src, alt, imagePosition = 'top', children, className = '', ...props }, ref) => {
    if (imagePosition === 'overlay') {
      return (
        <Card ref={ref} className={`relative overflow-hidden p-0 ${className}`} {...props}>
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 p-6">{children}</div>
        </Card>
      );
    }

    return (
      <Card ref={ref} className={`overflow-hidden p-0 ${className}`} {...props}>
        <img src={src} alt={alt} className="w-full h-48 object-cover" />
        <div className="p-6">{children}</div>
      </Card>
    );
  }
);

CardImage.displayName = 'CardImage';
