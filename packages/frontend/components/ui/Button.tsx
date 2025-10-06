import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Button Component - Alpine Tech Design System
 *
 * A versatile button component with multiple variants and sizes,
 * designed for the SummitStride ultra-trail application.
 */

const buttonVariants = cva(
  // Base styles with Aurora interactions
  'btn focus-ring relative overflow-hidden disabled:opacity-60 disabled:pointer-events-none inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 ease-out shadow-sm hover:shadow-md',
  {
    variants: {
      variant: {
        // Primary Aurora gradient CTA
        default:
          'bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white shadow-[0_18px_40px_-22px_rgba(90,93,253,0.75)] hover:brightness-[1.05] hover:shadow-[0_20px_48px_-20px_rgba(90,93,253,0.85)] active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',

        // Secondary filled button
        secondary:
          'bg-surface/80 text-foreground border border-border/60 backdrop-blur-sm hover:border-border-hover/80 hover:bg-surface/90 focus-visible:ring-2 focus-visible:ring-primary-200 focus-visible:ring-offset-2 focus-visible:ring-offset-background',

        // Success accent
        success:
          'bg-success-600 text-white shadow-[0_16px_36px_-22px_rgba(30,203,128,0.6)] hover:brightness-[1.04] focus-visible:ring-2 focus-visible:ring-success-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',

        // Destructive/Error
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-error-600 focus-visible:ring-2 focus-visible:ring-error-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',

        // Outline variants
        outline:
          'border border-border/70 bg-transparent text-foreground hover:border-border-hover focus-visible:ring-2 focus-visible:ring-primary-200 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'outline-primary':
          'border border-primary-600/70 text-primary-600 bg-transparent hover:bg-primary-50/60 dark:hover:bg-primary-600/10 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'outline-secondary':
          'border border-secondary-600/70 text-secondary-600 bg-transparent hover:bg-secondary-50/70 dark:hover:bg-secondary-600/10 focus-visible:ring-2 focus-visible:ring-secondary-200 focus-visible:ring-offset-2 focus-visible:ring-offset-background',

        // Ghost variants
        ghost:
          'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-primary-200 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'ghost-primary':
          'bg-transparent text-primary-600 hover:bg-primary-50/60 active:bg-primary-100/70 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'ghost-secondary':
          'bg-transparent text-secondary-600 hover:bg-secondary-50/70 active:bg-secondary-100/60 focus-visible:ring-2 focus-visible:ring-secondary-200 focus-visible:ring-offset-2 focus-visible:ring-offset-background',

        // Link style
        link:
          'bg-transparent text-primary-600 underline-offset-[5px] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 focus-visible:ring-offset-2 focus-visible:ring-offset-background p-0 h-auto',

        // Elevated accent CTA
        glow:
          'bg-surface text-foreground border border-primary-500/20 shadow-[0_0_0_1px_rgba(90,93,253,0.25)] hover:shadow-[0_10px_35px_-18px_rgba(67,56,245,0.6)] hover:border-primary-500/40 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 rounded-full px-4 text-xs font-medium',
        lg: 'h-12 rounded-full px-8 text-base',
        xl: 'h-[3.5rem] rounded-full px-10 text-lg font-semibold',
        icon: 'h-11 w-11 rounded-full',
        'icon-sm': 'h-9 w-9 rounded-full',
        'icon-lg': 'h-12 w-12 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
        )}

        {!loading && leftIcon && (
          <span className="mr-2 flex-shrink-0">
            {leftIcon}
          </span>
        )}

        <span className={cn(
          'flex flex-row items-center flex-1',
          (leftIcon || loading) && 'text-left',
          rightIcon && 'text-left'
        )}>
          {children}
        </span>

        {!loading && rightIcon && (
          <span className="ml-2 flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
