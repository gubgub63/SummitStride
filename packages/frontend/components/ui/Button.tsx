import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Button Component - Alpine Tech Design System
 *
 * A versatile button component with multiple variants and sizes,
 * designed for the Coach IA Hugo ultra-trail application.
 */

const buttonVariants = cva(
  // Base styles
  'btn focus-ring disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        // Primary - Bleu glacier
        default: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-600',

        // Secondary - Vert montagne
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 focus-visible:ring-secondary-600',

        // Success - Vert montagne
        success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-600',

        // Destructive/Error
        destructive: 'bg-destructive text-destructive-foreground hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-600',

        // Outline variants
        outline: 'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring',
        'outline-primary': 'border border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-600',
        'outline-secondary': 'border border-secondary-600 text-secondary-600 bg-transparent hover:bg-secondary-50 active:bg-secondary-100 focus-visible:ring-secondary-600',

        // Ghost variants
        ghost: 'bg-transparent hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring',
        'ghost-primary': 'bg-transparent text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-600',
        'ghost-secondary': 'bg-transparent text-secondary-600 hover:bg-secondary-50 active:bg-secondary-100 focus-visible:ring-secondary-600',

        // Link style
        link: 'bg-transparent text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-600 p-0 h-auto',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
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
          'flex-1',
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
