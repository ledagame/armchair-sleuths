/**
 * UI Component Library
 * Ready-to-use components based on the Visual Design System
 */

import { } from 'react';
import { cn } from '../../utils/cn';

// =============================================================================
// BUTTONS
// =============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md',
    secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 hover:border-gray-400',
    ghost: 'text-blue-900 hover:bg-blue-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

// =============================================================================
// CARDS
// =============================================================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  selected = false,
  onClick,
}) => {
  const baseStyles = 'bg-white rounded-lg border p-4';
  const hoverStyles = hover ? 'transition-all duration-200 hover:shadow-md hover:border-gray-300 cursor-pointer' : '';
  const selectedStyles = selected ? 'border-2 border-red-600 bg-red-50 shadow-lg' : 'border-gray-200 shadow-sm';

  return (
    <div
      className={cn(baseStyles, hoverStyles, selectedStyles, className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// =============================================================================
// SUSPECT CARD
// =============================================================================

interface SuspectCardProps {
  id: string;
  name: string;
  archetype: string;
  background: string;
  imageUrl?: string;
  selected?: boolean;
  onInterrogate?: () => void;
  onClick?: () => void;
}

export const SuspectCard: React.FC<SuspectCardProps> = ({
  id,
  name,
  archetype,
  background,
  imageUrl,
  selected = false,
  onInterrogate,
  onClick,
}) => {
  return (
    <Card hover selected={selected} onClick={onClick}>
      {/* Image */}
      {imageUrl && (
        <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Label */}
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        SUSPECT #{id}
      </p>

      {/* Name */}
      <h3 className="text-xl font-semibold text-gray-900 mt-1">
        {name}
      </h3>

      {/* Archetype */}
      <p className="text-sm text-gray-600 mt-1">
        {archetype}
      </p>

      {/* Background */}
      <p className="text-sm text-gray-700 mt-3 leading-relaxed line-clamp-3">
        {background}
      </p>

      {/* CTA */}
      {onInterrogate && (
        <Button
          variant="secondary"
          size="md"
          className="w-full mt-4"
          onClick={(e) => {
            e.stopPropagation();
            onInterrogate();
          }}
        >
          Interrogate
        </Button>
      )}
    </Card>
  );
};

// =============================================================================
// COMPACT SUSPECT CARD
// =============================================================================

interface CompactSuspectCardProps {
  name: string;
  archetype: string;
  avatarUrl?: string;
  onClick?: () => void;
}

export const CompactSuspectCard: React.FC<CompactSuspectCardProps> = ({
  name,
  archetype,
  avatarUrl,
  onClick,
}) => {
  return (
    <div
      className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 cursor-pointer transition-colors"
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0 overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {name}
        </p>
        <p className="text-xs text-gray-600 truncate">
          {archetype}
        </p>
      </div>

      {/* Action */}
      <button className="text-sm font-medium text-blue-900 hover:text-blue-800">
        Talk
      </button>
    </div>
  );
};

// =============================================================================
// CHAT BUBBLES
// =============================================================================

interface ChatBubbleProps {
  message: string;
  timestamp?: string;
  isUser?: boolean;
  senderName?: string;
  avatarUrl?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  timestamp,
  isUser = false,
  senderName,
  avatarUrl,
}) => {
  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[80%]">
          <div className="bg-blue-900 text-white rounded-2xl rounded-tr-sm px-4 py-3">
            <p className="text-base leading-relaxed">{message}</p>
          </div>
          {timestamp && (
            <p className="text-xs text-gray-400 mt-1 text-right">
              {timestamp}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[80%]">
        <div className="flex items-start gap-2">
          {/* Avatar */}
          <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={senderName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            {senderName && (
              <p className="text-xs font-semibold text-gray-700 mb-1">
                {senderName}
              </p>
            )}
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-base text-gray-900 leading-relaxed">
                {message}
              </p>
            </div>
            {timestamp && (
              <p className="text-xs text-gray-400 mt-1">
                {timestamp}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// CHAT INPUT
// =============================================================================

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Ask a question...',
  disabled = false,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent placeholder:text-gray-400"
        />
        <Button
          variant="primary"
          size="md"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

// =============================================================================
// PROGRESS BAR
// =============================================================================

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
}) => {
  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-blue-900">
              {progress}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-900 to-blue-700 transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

// =============================================================================
// LOADING SPINNER
// =============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
}) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={cn(
        sizes[size],
        'border-gray-200 border-t-blue-900 rounded-full animate-spin'
      )} />
      {label && (
        <p className="text-sm text-gray-600 mt-3">
          {label}
        </p>
      )}
    </div>
  );
};

// =============================================================================
// SKELETON CARD
// =============================================================================

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="animate-pulse space-y-3">
        <div className="aspect-square bg-gray-200 rounded-lg"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
};

// =============================================================================
// ALERTS
// =============================================================================

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
}) => {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      subtext: 'text-green-700',
      icon: 'text-green-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      subtext: 'text-red-700',
      icon: 'text-red-600',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      subtext: 'text-amber-700',
      icon: 'text-amber-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      subtext: 'text-blue-700',
      icon: 'text-blue-600',
    },
  };

  const style = styles[type];

  return (
    <div className={cn(style.bg, style.border, 'border rounded-lg p-4')}>
      <div className="flex items-start gap-3">
        <div className={cn(style.icon, 'w-5 h-5 flex-shrink-0')}>
          {type === 'success' && (
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'error' && (
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'warning' && (
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'info' && (
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          {title && (
            <p className={cn(style.text, 'text-sm font-semibold')}>
              {title}
            </p>
          )}
          <p className={cn(style.subtext, 'text-sm', title && 'mt-1')}>
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// BADGE
// =============================================================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      variants[variant],
      sizes[size]
    )}>
      {children}
    </span>
  );
};

// =============================================================================
// SCORE ITEM
// =============================================================================

interface ScoreItemProps {
  label: string;
  description: string;
  points: number;
  isCorrect: boolean;
  icon?: 'check' | 'x' | 'star' | 'clock';
}

export const ScoreItem: React.FC<ScoreItemProps> = ({
  label,
  description,
  points,
  isCorrect,
  icon = 'check',
}) => {
  const iconBg = isCorrect ? 'bg-green-100' : 'bg-red-100';
  const iconColor = isCorrect ? 'text-green-600' : 'text-red-600';
  const pointsColor = isCorrect ? 'text-green-600' : 'text-red-600';

  const icons = {
    check: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    x: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
    star: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
    clock: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className={cn(iconBg, iconColor, 'w-10 h-10 rounded-lg flex items-center justify-center')}>
          {icons[icon]}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {label}
          </p>
          <p className="text-xs text-gray-600">
            {description}
          </p>
        </div>
      </div>
      <div className={cn('text-lg font-bold', pointsColor)}>
        {points >= 0 ? '+' : ''}{points}
      </div>
    </div>
  );
};

// =============================================================================
// INPUT FIELD
// =============================================================================

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 bg-white border rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent',
          'placeholder:text-gray-400',
          error ? 'border-red-300' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

// =============================================================================
// TEXTAREA FIELD
// =============================================================================

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-4 py-3 bg-white border rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent',
          'placeholder:text-gray-400 resize-none',
          error ? 'border-red-300' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

// =============================================================================
// RADIO GROUP
// =============================================================================

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-center gap-3 p-3 bg-white border rounded-lg cursor-pointer',
              'transition-colors',
              value === option.value
                ? 'border-red-600 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="w-5 h-5 text-red-600 border-gray-300 focus:ring-2 focus:ring-red-600"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {option.label}
              </p>
              {option.description && (
                <p className="text-xs text-gray-600 mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// RE-EXPORTS
// =============================================================================

export { SkeletonLoader } from './SkeletonLoader';
